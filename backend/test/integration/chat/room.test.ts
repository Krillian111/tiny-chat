import { once } from "events";
import WebSocket from "ws";
import { ErrorMessage, Message } from "../../../src/chat/chat.types";
import { expectJoinSuccess } from "../util/expectations";
import { assertMessageOnce, sendSerialized, setupAppWithWebsocket } from "../util/websocket";
import { testOnly } from "../../../src/common/crypto";
import { JoinResponse } from "../../../src/chat/join/join.handler";

const { generateKeys, signPayload } = testOnly;

describe("/chat (room)", () => {
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
    it("returns an error if userId is missing", async () => {
      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      const assertion = assertMessageOnce(ws, (roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.error).toBeTruthy();
      });
      ws.on("open", () => {
        sendSerialized(ws, { type: "room", payload: {}, signature: "some-signature" });
      });
      await assertion;
    });
  });
  describe("errors", () => {
    it("fails if user is not in a room", async () => {
      const passphrase = "some-password";
      const { privateKey: unknownPrivateKey } = await generateKeys(passphrase);
      const payload = { userId: "some-user-id" };
      const signatureWithUnknownKey = await signPayload(payload, unknownPrivateKey, passphrase);

      const ws = new WebSocket(wsAddress);
      wsToCleanUp.push(ws);
      const assertion = assertMessageOnce(ws, (roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse).toEqual({ type: "room-response", error: ["User not in lobby"] });
        expect(roomResponse.error).toBeTruthy();
      });

      ws.on("open", () => {
        sendSerialized(ws, { type: "room", payload, signature: signatureWithUnknownKey });
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
      const assertOneUser = assertMessageOnce(ws1, (roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse).toEqual({ type: "room-response", error: ["Message contains invalid signature"] });
      });
      const payloadToSign = { userId };
      const signatureWithUnknownKey = await signPayload(payloadToSign, unknownPrivateKey, passphrase);
      sendSerialized(ws1, { type: "room", payload: payloadToSign, signature: signatureWithUnknownKey });
      await assertOneUser;
    });
  });

  describe("success", () => {
    it("returns current state of room if user is in a room", async () => {
      const passphrase = "some-password";
      let userId1;
      const userName1 = "user1";
      const { publicKey: publicKey1, privateKey: privateKey1 } = await generateKeys(passphrase);

      let userId2;
      const userName2 = "user2";
      const { publicKey: publicKey2, privateKey: privateKey2 } = await generateKeys(passphrase);

      const ws1 = new WebSocket(wsAddress);
      wsToCleanUp.push(ws1);
      const ws2 = new WebSocket(wsAddress);
      wsToCleanUp.push(ws2);
      await once(ws1, "open");
      await once(ws2, "open");

      sendSerialized(ws1, { type: "join", payload: { publicKey: publicKey1, userName: userName1 } });
      await assertMessageOnce(ws1, (joinResponse: JoinResponse) => {
        expectJoinSuccess(joinResponse);
        userId1 = joinResponse.payload.userId;
      });
      const assertOneUser = assertMessageOnce(ws1, (roomResponse: Message<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.payload).toEqual({ users: [userName1] });
      });
      const roomPayload1 = { userId: userId1 };
      const roomSig1 = await signPayload(roomPayload1, privateKey1, passphrase);
      sendSerialized(ws1, { type: "room", payload: roomPayload1, signature: roomSig1 });
      await assertOneUser;

      sendSerialized(ws2, { type: "join", payload: { publicKey: publicKey2, userName: userName2 } });
      await assertMessageOnce(ws2, (joinResponse: JoinResponse) => {
        expectJoinSuccess(joinResponse);
        userId2 = joinResponse.payload.userId;
      });
      const assertTwoUsers = assertMessageOnce(ws2, (roomResponse: Message<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.payload).toEqual({ users: [userName1, userName2] });
      });

      const roomPayload2 = { userId: userId2 };
      const roomSig2 = await signPayload(roomPayload2, privateKey2, passphrase);
      sendSerialized(ws2, { type: "room", payload: roomPayload2, signature: roomSig2 });
      await assertTwoUsers;
    });
  });
});
