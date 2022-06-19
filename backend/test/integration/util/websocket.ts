import WebSocket from "ws";
import createApp from "../../../src/app";
import { ClientMessage } from "../../../src/chat/chat.types";

export function setupAppWithWebsocket(wsAddressSetter: (string) => void) {
  const app = createApp({});
  beforeAll(async () => {
    await app.ready();
    return new Promise<void>((resolve) => {
      app.listen(undefined, (_err, address) => {
        wsAddressSetter(`${address.replace("http", "ws")}/chat`);
        resolve();
      });
    });
  });
  afterAll(async () => {
    await app.close();
  });
}

export function sendSerialized(ws: WebSocket, msg: ClientMessage<string>) {
  ws.send(JSON.stringify(msg));
}

export async function assertMessageOnce(ws: WebSocket, assertParsedMessage: (msg: unknown) => void) {
  return new Promise<void>((resolve, reject) => {
    ws.once("message", (msg) => {
      const parsedMsg = JSON.parse(msg.toString("utf-8"));
      try {
        assertParsedMessage(parsedMsg);
      } catch (e) {
        reject(e);
      }
      resolve();
    });
  });
}
