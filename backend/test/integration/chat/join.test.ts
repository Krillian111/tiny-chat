import { once } from "events";
import nodeCrypto from "node:crypto";
import WebSocket from "ws";
import generateKeys from "../util/generateKeys";
import { sendSerialized, setupAppWithWebsocket } from "../util/websocket";

describe("/chat (join)", () => {
  let wsAddress: string;
  setupAppWithWebsocket((address) => {
    wsAddress = address;
  });
  describe("validation", () => {
    it.each([undefined, null, 1234, {}])("rejects non-string userNames", async (invalidUserName) => {
      const { publicKey } = await generateKeys("some-passphrase");
      const ws = new WebSocket(wsAddress);
      const assertion = new Promise<void>((resolve) => {
        ws.on("message", (unparsedResponse) => {
          const joinResponse = JSON.parse(unparsedResponse.toString("utf-8"));
          expect(joinResponse.error).toBeTruthy();
          expect(joinResponse.type).toEqual("join-response");
          resolve();
        });
      });
      ws.on("open", () => {
        sendSerialized(ws, { type: "join", payload: { publicKey, userName: invalidUserName } });
      });
      await assertion.finally(() => {
        ws.close();
      });
    });

    it.each([undefined, null, 1234, {}, "invalid-public-key"])(
      "rejects invalid publicKey",
      async (invalidPublicKey) => {
        const ws = new WebSocket(wsAddress);
        const assertion = new Promise<void>((resolve) => {
          ws.on("message", (unparsedResponse) => {
            const joinResponse = JSON.parse(unparsedResponse.toString("utf-8"));
            expect(joinResponse.error).toBeTruthy();
            expect(joinResponse.type).toEqual("join-response");
            resolve();
          });
        });
        ws.on("open", () => {
          sendSerialized(ws, { type: "join", payload: { publicKey: invalidPublicKey, userName: "some-user-name" } });
        });
        await assertion.finally(() => {
          ws.close();
        });
      }
    );
  });
  it("accepts a websocket connection", async () => {
    const ws = new WebSocket(wsAddress);
    ws.on("open", () => {
      ws.ping();
    });
    await once(ws, "pong").finally(() => {
      ws.close();
    });
  });
  it("allows to join with valid data", async () => {
    const userId = "userOneUuid";
    const userName = "userOne";
    const { publicKey } = await generateKeys("some-password");
    jest.spyOn(nodeCrypto, "randomUUID").mockReturnValueOnce(userId);

    const ws = new WebSocket(wsAddress);
    const assertion = new Promise<void>((resolve) => {
      ws.on("message", (unparsedResponse) => {
        const joinResponse = JSON.parse(unparsedResponse.toString("utf-8"));
        expect(joinResponse.error).toEqual(undefined);
        expect(joinResponse.type).toEqual("join-response");
        expect(joinResponse.payload.userName).toEqual(userName);
        expect(joinResponse.payload.userId).toEqual(userId);
        resolve();
      });
    });
    ws.on("open", () => {
      sendSerialized(ws, { type: "join", payload: { publicKey, userName } });
    });
    await assertion.finally(() => {
      ws.close();
    });
  });
});
