import { createSignature, generateKeyPair } from "./crypto";
import {
  isErrorMessage,
  JoinMessage,
  JoinResponse,
  Message,
  RoomMessage,
  RoomResponse,
  SignedMessage,
} from "./ChatSocket.types";
import { createContext, PropsWithChildren } from "react";

class ChatSocket {
  private readonly ws: WebSocket;
  private keys: undefined | { privateKey: CryptoKey; publicKey: string };
  userName: string = "";
  userId: string = "";
  users: ReadonlyArray<string> = [];
  lastErrors: ReadonlyArray<string> = [];

  constructor(host: string) {
    const ws = new WebSocket(`ws://${host}/chat`);
    ws.addEventListener("message", (msg) => this.handleMessage(msg));
    this.ws = ws;
  }

  isReady(): boolean {
    return this.ws.readyState === this.ws.OPEN;
  }

  assertReady() {
    if (this.isReady()) {
      return;
    }
    throw new Error(`Websocket not open, instead: ${this.ws.readyState}`);
  }

  assertJoined() {
    if (this.keys && this.userId && this.userName) {
      return true;
    }
    throw new Error("Client has not joined yet");
  }

  send(msg: Message<string, unknown>) {
    this.assertReady();
    this.ws.send(JSON.stringify(msg));
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
    this.send(joinMessage);
  }

  async sign<T extends string>(
    msg: Message<T, { userId: string }>
  ): Promise<SignedMessage<T>> {
    this.assertJoined();
    const signature = await createSignature(
      msg.payload,
      (this.keys as { privateKey: CryptoKey }).privateKey
    );
    return { ...msg, signature };
  }

  async room() {
    const roomMessage: RoomMessage = await this.sign<"room">({
      type: "room",
      payload: {
        userId: this.userId,
      },
    });
    this.send(roomMessage);
  }

  handleMessage(messageEvent: MessageEvent) {
    try {
      const data = JSON.parse(messageEvent.data);
      switch (data.type) {
        case "join-response":
          return this.handleJoinResponse(data as JoinResponse);
        case "room-response":
          return this.handleRoomResponse(data as RoomResponse);
        default:
          return console.error("Handling not implemented", data);
      }
    } catch (e) {
      console.error("Parsing websocket message failed", e);
    }
  }

  handleJoinResponse(joinResponse: JoinResponse) {
    if (isErrorMessage("join-response", joinResponse)) {
      this.lastErrors =
        joinResponse.error?.map((err) => JSON.stringify(err)) ?? [];
    } else {
      this.userId = joinResponse.payload.userId;
      this.userName = joinResponse.payload.userName;
    }
  }

  handleRoomResponse(roomResponse: RoomResponse) {
    if (isErrorMessage("room-response", roomResponse)) {
      this.lastErrors =
        roomResponse.error?.map((err) => JSON.stringify(err)) ?? [];
    } else {
      this.users = roomResponse.payload.users;
    }
  }

  subscribeToMessage(callback: (cs: ChatSocket) => void): () => void {
    const messageListener = () => callback(this);
    this.ws.addEventListener("message", messageListener);
    return () => this.ws.removeEventListener("message", messageListener);
  }
}

const chatSocket = new ChatSocket("localhost:3001");

export const ChatSocketContext = createContext(chatSocket);
export function ChatSocketProvider(props: PropsWithChildren) {
  return (
    <ChatSocketContext.Provider value={chatSocket}>
      {props.children}
    </ChatSocketContext.Provider>
  );
}
