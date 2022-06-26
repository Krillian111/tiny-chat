import { once } from "events";
import { ErrorMessage, Message } from "../../../src/chat/chat.types";
import { setupAppWithWebsocket } from "../util/websocket";
import { JoinResponse } from "../../../src/chat/join/join.handler";
import { expectValidationError } from "../util/expectations";

describe("/chat (join)", () => {
  const testClientBuilder = setupAppWithWebsocket();
  describe("validation", () => {
    it.each([undefined, null, 1234, {}])("rejects non-string userNames", async (invalidUserName) => {
      const client = await testClientBuilder.connect("client-joining-with-invalid-userName");

      const assertion = client.assertMessageOnce((joinResponse: ErrorMessage<"join-response">) => {
        expectValidationError("join-response", joinResponse);
      });
      client.send({ type: "join", payload: { publicKey: client.publicKey, userName: invalidUserName } });
      await assertion;
    });

    it.each([undefined, null, 1234, {}, "invalid-public-key"])(
      "rejects invalid publicKey",
      async (invalidPublicKey) => {
        const client = await testClientBuilder.connect("client-joining-with-invalid-publicKey");
        const assertion = client.assertMessageOnce((joinResponse: ErrorMessage<"join-response">) => {
          expectValidationError("join-response", joinResponse);
        });

        client.send({
          type: "join",
          payload: { publicKey: invalidPublicKey, userName: "some-user-name" },
        });
        await assertion;
      }
    );
  });
  describe("errors", () => {
    it("only allows a user to join once", async () => {
      const client = await testClientBuilder.connect("client-trying-to-join-twice");
      const { userName, publicKey } = client;
      const assertSuccess = client.assertMessageOnce((joinResponse: JoinResponse) => {
        expect(joinResponse).toEqual({ type: "join-response", payload: { userId: expect.any(String), userName } });
      });
      client.send({ type: "join", payload: { publicKey, userName } });
      await assertSuccess;
      const assertFailure = client.assertMessageOnce((joinResponse: ErrorMessage<"join-response">) => {
        expect(joinResponse).toEqual({ type: "join-response", error: expect.any(Array) });
      });
      client.send({ type: "join", payload: { publicKey, userName } });
      await assertFailure;
    });
  });
  describe("success", () => {
    it("accepts a websocket connection", async () => {
      const client = await testClientBuilder.connect("pinging-client");
      const waitForPong = once(client.ws, "pong");
      client.ws.ping();
      await waitForPong;
    });
    it("allows to join with valid data", async () => {
      const client = await testClientBuilder.connect("client-trying-to-join-twice");
      const { userName, publicKey } = client;

      const assertion = client.assertMessageOnce((joinResponse: Message<"join-response">) => {
        expect(joinResponse.type).toEqual("join-response");
        expect(joinResponse.payload).toEqual({ userId: expect.any(String), userName });
      });
      client.send({ type: "join", payload: { publicKey, userName } });
      await assertion;
    });
  });
});
