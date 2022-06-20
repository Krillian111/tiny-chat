import { once } from "events";
import nodeCrypto from "node:crypto";
import WebSocket from "ws";
import { ErrorMessage, Message } from "../../../src/chat/chat.types";
import { assertMessageOnce, sendSerialized, setupAppWithWebsocket } from "../util/websocket";
import { testOnly } from "../../../src/common/crypto";
import { JoinResponse } from "../../../src/chat/join/join.handler";
import { expectJoinSuccess, expectValidationError } from "../util/expectations";
import join from "../../../src/chat/join";

const { generateKeys } = testOnly;

describe("/chat (join)", () => {
  let wsAddress: string;
  let wsToCleanUp: WebSocket[] = [];
  afterEach(async () => {
    wsToCleanUp.forEach((ws) => ws.close());
    wsToCleanUp = [];
  });
  setupAppWithWebsocket((address) => {
    wsAddress = address;
  });
  describe("validation", () => {
    it.each([undefined, null, 1234, {}])("rejects non-string userNames", async (invalidUserName) => {
      const { publicKey } = await generateKeys("some-passphrase");
      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);

      const assertion = assertMessageOnce(ws, (joinResponse: ErrorMessage<"join-response">) => {
        expectValidationError("join-response", joinResponse);
      });
      await once(ws, "open");
      sendSerialized(ws, { type: "join", payload: { publicKey, userName: invalidUserName } });
      await assertion;
    });

    it.each([undefined, null, 1234, {}, "invalid-public-key"])(
      "rejects invalid publicKey",
      async (invalidPublicKey) => {
        const ws = new WebSocket(wsAddress);
        wsToCleanUp.push(ws);
        const assertion = assertMessageOnce(ws, (joinResponse: ErrorMessage<"join-response">) => {
          expectValidationError("join-response", joinResponse);
        });

        await once(ws, "open");
        sendSerialized(ws, {
          type: "join",
          payload: { publicKey: invalidPublicKey, userName: "some-user-name" },
        });
        await assertion;
      }
    );
  });
  describe("errors", () => {
    it("only allows a user to join once", async () => {
      const userId = "userId2";
      const userName = "user2";
      const { publicKey } = await generateKeys("some-password");
      jest.spyOn(nodeCrypto, "randomUUID").mockReturnValueOnce(userId);

      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      await once(ws, "open");
      const assertSuccess = assertMessageOnce(ws, (joinResponse: JoinResponse) => {
        expect(joinResponse).toEqual({ type: "join-response", payload: { userId, userName } });
      });
      sendSerialized(ws, { type: "join", payload: { publicKey, userName } });
      await assertSuccess;
      const assertFailure = assertMessageOnce(ws, (joinResponse: ErrorMessage<"join-response">) => {
        expect(joinResponse).toEqual({ type: "join-response", error: expect.any(Array) });
      });
      sendSerialized(ws, { type: "join", payload: { publicKey, userName } });
      await assertFailure;
    });
  });
  describe("success", () => {
    it("accepts a websocket connection", async () => {
      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      await once(ws, "open");
      const waitForPong = once(ws, "pong");
      ws.ping();
      await waitForPong;
    });
    it("allows to join with valid data", async () => {
      const userId = "userId1";
      const userName = "userName1";
      const { publicKey } = await generateKeys("some-password");
      jest.spyOn(nodeCrypto, "randomUUID").mockReturnValueOnce(userId);

      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      const assertion = assertMessageOnce(ws, (joinResponse: Message<"join-response">) => {
        expect(joinResponse.type).toEqual("join-response");
        expect(joinResponse.payload).toEqual({ userId, userName });
      });
      await once(ws, "open");
      sendSerialized(ws, { type: "join", payload: { publicKey, userName } });
      await assertion;
    });
  });
});
