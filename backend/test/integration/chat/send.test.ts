import { ErrorMessage } from "../../../src/chat/chat.types";
import { setupAppWithWebsocket } from "../util/websocket";
import { testOnly } from "../../../src/common/crypto";
import { SendResponse } from "../../../src/chat/send/send.handler";

const { generateKeys, signPayload } = testOnly;

describe("/chat (send)", () => {
  const testClientBuilder = setupAppWithWebsocket();
  describe("validation", () => {
    it.each([{ userId: "missing-message" }, { message: "missing-userId" }])(
      "returns an error if required payload fields are missing",
      async (payload) => {
        const testClient = await testClientBuilder.connect("client-with-invalid-payload");
        const assertion = testClient.assertMessageOnce((sendResponse: ErrorMessage<"send-response">) => {
          expect(sendResponse.type).toEqual("send-response");
          expect(sendResponse.error).toBeTruthy();
        });
        testClient.send({ type: "send", payload, signature: "some-signature" });
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

      const client = await testClientBuilder.connect("client-which-does-not-join");
      const assertion = client.assertMessageOnce((sendResponse: ErrorMessage<"send-response">) => {
        expect(sendResponse.type).toEqual("send-response");
        expect(sendResponse.error).toBeTruthy();
      });
      client.send({ type: "send", payload, signature: signatureWithUnknownKey });
      await assertion;
    });
    it("fails if payload is not signed with matching privateKey", async () => {
      const client = await testClientBuilder.connect("client-which-signs-with-wrong-key");
      await client.joinLobby();
      const passphrase = "some-password";
      const { privateKey: unknownPrivateKey } = await generateKeys(passphrase);

      const assertSendFailure = client.assertMessageOnce((sendResponse: ErrorMessage<"send-response">) => {
        expect(sendResponse).toEqual({ type: "send-response", error: ["Message contains invalid signature"] });
      });
      const payloadToSign = { userId: client.userId, message: "message-with-invalid-signature" };
      const signatureWithUnknownKey = await signPayload(payloadToSign, unknownPrivateKey, passphrase);
      client.send({ type: "send", payload: payloadToSign, signature: signatureWithUnknownKey });
      await assertSendFailure;
    });
  });

  describe("success", () => {
    it("returns message and messageId if accepted", async () => {
      const client = await testClientBuilder.connect("client-which-sends-a-message");
      await client.joinLobby();
      const message = "some-message-to-send";

      const assertSendSuccess = client.assertMessageOnce((sendSuccess: SendResponse) => {
        expect(sendSuccess).toEqual({ type: "send-response", payload: { message, id: expect.any(String) } });
      });
      client.sendWithUserIdAndSigned("send", { message });
      await assertSendSuccess;
    });
  });
});
