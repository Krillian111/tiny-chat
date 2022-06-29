import { generateKeyPair } from "./crypto";
import {
  isErrorMessage,
  JoinMessage,
  JoinResponse,
  Message,
} from "./ChatSocket.types";
import { createContext, PropsWithChildren } from "react";

class ChatSocket {
  private readonly ws: WebSocket;
  private keys: undefined | { privateKey: CryptoKey; publicKey: string };
  userName: string = "";
  userId: string = "";
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
    if (!this.isReady()) {
      throw new Error(`Websocket not open, instead: ${this.ws.readyState}`);
    }
  }
  send(msg: Message<string, unknown>) {
    this.ws.send(JSON.stringify(msg));
  }
  async join(userName: string) {
    this.assertReady();
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

  handleMessage(messageEvent: MessageEvent) {
    try {
      const data = JSON.parse(messageEvent.data);
      switch (data.type) {
        case "join-response":
          return this.handleJoinResponse(data as JoinResponse);
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
      const payload = joinResponse.payload;
      this.userId = payload.userId;
      this.userName = payload.userName;
    }
  }

  subscribeToMessage(callback: () => void): () => void {
    const messageListener = () => callback();
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
