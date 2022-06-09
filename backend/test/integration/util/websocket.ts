import WebSocket from "ws";
import createApp from "../../../src/app";

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

export function sendSerialized(ws: WebSocket, msg: unknown) {
  ws.send(JSON.stringify(msg));
}
