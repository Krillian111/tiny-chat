import { once } from "events";
import WebSocket from "ws";
import { ErrorMessage } from "../../../src/chat/chat.types";
import { assertMessageOnce, sendSerialized, setupAppWithWebsocket } from "../util/websocket";
import { testOnly } from "../../../src/common/crypto";
import { SendResponse } from "../../../src/chat/send/send.handler";
import { expectJoinSuccess } from "../util/expectations";
import { JoinResponse } from "../../../src/chat/join/join.handler";

const { generateKeys, signPayload } = testOnly;

describe("/chat (send)", () => {
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
    it.each([{ userId: "missing-message" }, { message: "missing-userId" }])(
      "returns an error if required payload fields are missing",
      async (payload) => {
        const ws = new WebSocket(wsAddress);
        wsToCleanUp.push(ws);
        const assertion = assertMessageOnce(ws, (sendResponse: ErrorMessage<"send-response">) => {
          expect(sendResponse.type).toEqual("send-response");
          expect(sendResponse.error).toBeTruthy();
        });
        ws.on("open", () => {
          sendSerialized(ws, { type: "send", payload, signature: "some-signature" });
        });
        await assertion;
      }
    );
  });
  describe("errors", () => {
    it("fails if user is not in a room", async () => {
      const passphrase = "some-password";
      const { privateKey: unknownPrivateKey } = await generateKeys(passphrase);
      const payload = { userId: "some-user-id" };
      const signatureWithUnknownKey = await signPayload(payload, unknownPrivateKey, passphrase);

      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      const assertion = assertMessageOnce(ws, (sendResponse: ErrorMessage<"send-response">) => {
        expect(sendResponse.type).toEqual("send-response");
        expect(sendResponse.error).toBeTruthy();
      });

      ws.on("open", () => {
        sendSerialized(ws, { type: "send", payload, signature: signatureWithUnknownKey });
      });
      await assertion;
    });
    it("fails if payload is not signed with matching privateKey", async () => {
      let userId;
      const userName = "invalid-sig-userName";
      const passphrase = "some-password";
      const { publicKey } = await generateKeys(passphrase);
      const { privateKey: unknownPrivateKey } = await generateKeys(passphrase);

      const ws1 = new WebSocket(wsAddress);
      wsToCleanUp.push(ws1);
      await once(ws1, "open");

      sendSerialized(ws1, { type: "join", payload: { publicKey, userName } });
      await assertMessageOnce(ws1, (joinResponse: JoinResponse) => {
        expectJoinSuccess(joinResponse);
        userId = joinResponse.payload.userId;
      });
      const assertSendFailure = assertMessageOnce(ws1, (sendResponse: ErrorMessage<"send-response">) => {
        expect(sendResponse).toEqual({ type: "send-response", error: ["Message contains invalid signature"] });
      });
      const payloadToSign = { userId, message: "message-with-invalid-signature" };
      const signatureWithUnknownKey = await signPayload(payloadToSign, unknownPrivateKey, passphrase);
      sendSerialized(ws1, { type: "send", payload: payloadToSign, signature: signatureWithUnknownKey });
      await assertSendFailure;
    });
  });

  describe("success", () => {
    it("returns empty success message if accepted", async () => {
      const passphrase = "some-password";
      let userId;
      const userName = "user-sending-message";
      const message = "some-message-to-send";
      const { publicKey: publicKey1, privateKey: privateKey1 } = await generateKeys(passphrase);

      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      await once(ws, "open");

      sendSerialized(ws, { type: "join", payload: { publicKey: publicKey1, userName } });
      await assertMessageOnce(ws, (joinResponse: JoinResponse) => {
        expectJoinSuccess(joinResponse);
        userId = joinResponse.payload.userId;
      });
      const assertSendSuccess = assertMessageOnce(ws, (sendSuccess: SendResponse) => {
        expect(sendSuccess).toEqual({ type: "send-response", payload: { message } });
      });
      const sendPayload = { userId, message };
      const sendSig = await signPayload(sendPayload, privateKey1, passphrase);
      sendSerialized(ws, { type: "send", payload: sendPayload, signature: sendSig });
      await assertSendSuccess;
    });
  });
});
