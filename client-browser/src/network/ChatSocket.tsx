import { createSignature, generateKeyPair } from "./crypto";
import {
  ChatMessage,
  isErrorMessage,
  JoinMessage,
  JoinSuccessResponse,
  Message,
  RoomMessage,
  RoomSuccessResponse,
  SendMessage,
  SignedMessages,
} from "./ChatSocket.types";
import { createContext, PropsWithChildren, useContext } from "react";

class ChatSocket {
  private readonly ws: WebSocket;
  private keys: undefined | { privateKey: CryptoKey; publicKey: string };
  userName: string = "";
  userId: string = "";
  users: ReadonlyArray<string> = [];
  lastErrors: ReadonlyArray<string> = [];
  messages: ReadonlyArray<ChatMessage> = [];

  constructor(host: string) {
    const ws = new WebSocket(`ws://${host}/chat`);
    ws.addEventListener("message", (msg) => this.handleMessage(msg));
    this.ws = ws;
  }

  private isWsReady(): boolean {
    return this.ws.readyState === this.ws.OPEN;
  }

  private assertReady() {
    if (this.isWsReady()) {
      return;
    }
    throw new Error(`Websocket not open, instead: ${this.ws.readyState}`);
  }

  private assertJoined() {
    if (this.keys && this.userId && this.userName) {
      return true;
    }
    throw new Error("Client has not joined yet");
  }

  private sendWsMessage(msg: Message<string, unknown>) {
    this.assertReady();
    this.ws.send(JSON.stringify(msg));
  }

  isReadyFor(command: "join" | "room" | "send"): boolean {
    switch (command) {
      case "join":
        return this.isWsReady();
      case "room":
      case "send":
        return !!this.userId;
    }
  }

  async join(userName: string) {
    if (!this.keys) {
      this.keys = await generateKeyPair();
    }
    const joinMessage: JoinMessage = {
      type: "join",
      payload: {
        publicKey: this.keys.publicKey,
        userName,
      },
    };
    this.sendWsMessage(joinMessage);
  }

  async sign<SigMes extends SignedMessages>(
    msg: Omit<SigMes, "signature">
  ): Promise<SigMes> {
    this.assertJoined();
    const signature = await createSignature(
      msg.payload,
      (this.keys as { privateKey: CryptoKey }).privateKey
    );
    return { ...msg, signature } as SigMes;
  }

  async room() {
    const roomMessage: RoomMessage = await this.sign<RoomMessage>({
      type: "room",
      payload: {
        userId: this.userId,
      },
    });
    this.sendWsMessage(roomMessage);
  }

  async send(message: string) {
    const sendMessage: SendMessage = await this.sign<SendMessage>({
      type: "send",
      payload: {
        userId: this.userId,
        message,
      },
    });
    this.sendWsMessage(sendMessage);
  }

  private handleMessage(messageEvent: MessageEvent) {
    try {
      const data = JSON.parse(messageEvent.data);
      if (isErrorMessage(data)) {
        this.lastErrors = data.error?.map((err) => JSON.stringify(err)) ?? [];
        return;
      }
      switch (data.type) {
        case "join-response":
          return this.handleJoinResponse(data as JoinSuccessResponse);
        case "room-response":
          return this.handleRoomResponse(data as RoomSuccessResponse);
        case "send-response":
          this.room();
          return;
        default:
          return console.error("Handling not implemented", data);
      }
    } catch (e) {
      console.error("Parsing websocket message failed", e);
    }
  }

  private handleJoinResponse(joinResponse: JoinSuccessResponse) {
    this.userId = joinResponse.payload.userId;
    this.userName = joinResponse.payload.userName;
    // TODO: replace polling with broadcast by server
    this.room();
    const pollRoom = setInterval(() => {
      this.room();
    }, 3000);
    this.ws.addEventListener("close", () => {
      clearInterval(pollRoom);
    });
  }

  private handleRoomResponse(roomResponse: RoomSuccessResponse) {
    this.users = roomResponse.payload.users;
    this.messages = roomResponse.payload.messages;
  }

  subscribeToMessage(callback: (cs: ChatSocket) => void): () => void {
    const messageListener = () => callback(this);
    this.ws.addEventListener("message", messageListener);
    return () => this.ws.removeEventListener("message", messageListener);
  }
}

const chatSocket = new ChatSocket("localhost:3001");

const ChatSocketContext = createContext(chatSocket);
export const useChatSocket = () => useContext(ChatSocketContext);

export function ChatSocketProvider(props: PropsWithChildren) {
  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {props.children}
    </ChatSocketContext.Provider>
  );
}
