import { ErrorMessage, Message } from "../../../src/chat/chat.types";
import { expectJoinSuccess } from "../util/expectations";
import { setupAppWithWebsocket } from "../util/websocket";
import { testOnly } from "../../../src/common/crypto";
import { JoinResponse } from "../../../src/chat/join/join.handler";
import { RoomResponse } from "../../../src/chat/room/room.handler";
import { ChatMessage } from "../../../src/chat/persistence/message/message.types";

const { generateKeys, signPayload } = testOnly;

describe("/chat (room)", () => {
  const testClientBuilder = setupAppWithWebsocket();
  describe("validation", () => {
    it("returns an error if userId is missing", async () => {
      const testClient = await testClientBuilder.connect("client-not-sending-userId");
      const assertion = testClient.assertMessageOnce((roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.error).toBeTruthy();
      });
      await testClient.send({ type: "room", payload: {}, signature: "some-signature" });
      await assertion;
    });
  });
  describe("errors", () => {
    it("fails if user is not in a room", async () => {
      const { privateKey: unknownPrivateKey } = await generateKeys();
      const payload = { userId: "some-user-id" };
      const signatureWithUnknownKey = await signPayload(payload, unknownPrivateKey);

      const testClient = await testClientBuilder.connect("client-which-does-not-join");
      const assertion = testClient.assertMessageOnce((roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse).toEqual({ type: "room-response", error: ["User not in lobby"] });
        expect(roomResponse.error).toBeTruthy();
      });

      testClient.send({ type: "room", payload, signature: signatureWithUnknownKey });
      await assertion;
    });
    it("fails if payload is not signed with matching privateKey", async () => {
      let userId;
      const userName = "invalid-sig-userName";
      const { publicKey } = await generateKeys();
      const { privateKey: unknownPrivateKey } = await generateKeys();

      const testClient = await testClientBuilder.connect("client-signing-with-wrong-key");
      testClient.send({ type: "join", payload: { publicKey, userName } });
      await testClient.assertMessageOnce((joinResponse: JoinResponse) => {
        expectJoinSuccess(joinResponse);
        userId = joinResponse.payload.userId;
      });
      const assertOneUser = testClient.assertMessageOnce((roomResponse: ErrorMessage<"room-response">) => {
        expect(roomResponse).toEqual({ type: "room-response", error: ["Message contains invalid signature"] });
      });
      const payloadToSign = { userId };
      const signatureWithUnknownKey = await signPayload(payloadToSign, unknownPrivateKey);
      testClient.send({ type: "room", payload: payloadToSign, signature: signatureWithUnknownKey });
      await assertOneUser;
    });
  });

  describe("query user list", () => {
    it("returns current state of room if user is in a room", async () => {
      const client1 = await testClientBuilder.connect("client1");
      await client1.joinLobby();
      const assertOneUser = client1.assertMessageOnce((roomResponse: Message<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.payload).toEqual({ users: [client1.userName], messages: [] });
      });
      await client1.sendRoomMessage();
      await assertOneUser;

      const client2 = await testClientBuilder.connect("client2");
      await client2.joinLobby();

      const assertTwoUsers = client2.assertMessageOnce((roomResponse: Message<"room-response">) => {
        expect(roomResponse.type).toEqual("room-response");
        expect(roomResponse.payload).toEqual({ users: [client1.userName, client2.userName], messages: [] });
      });

      await client2.sendRoomMessage();
      await assertTwoUsers;
    });

    describe("query messages", () => {
      const sendingUserName = "sending-client";
      const bufferSize = 100;
      const overflowSize = 20;
      const batchSize = bufferSize + overflowSize;
      const messagesOfBatch = new Array(batchSize).fill(undefined).map((_, index) => `Message Nr: ${index}`);
      beforeAll(async () => {
        const sendingClient = await testClientBuilder.connect(sendingUserName);
        await sendingClient.joinLobby();

        const assertNoMessages = sendingClient.assertMessageOnce((roomResponse: Message<"room-response">) => {
          expect(roomResponse).toEqual({
            type: "room-response",
            payload: { users: [sendingClient.userName], messages: [] },
          });
        });
        await sendingClient.sendRoomMessage();
        await assertNoMessages;

        let batchCounter = 0;
        const assertBatchDone = sendingClient.assertMessage((msg: { type: string; id: string }) => {
          if (msg.type === "send-response") {
            batchCounter += 1;
          }
          return batchCounter >= batchSize;
        });
        for (let i = 0; i < batchSize; i++) {
          await sendingClient.sendWithUserIdAndSigned("send", { message: messagesOfBatch[i] });
        }
        await assertBatchDone;
        sendingClient.ws.close();
      });
      it("returns all messages in buffer", async () => {
        const queryingWs = await testClientBuilder.connect("client-to-query-all-messages");
        await queryingWs.joinLobby();
        const userName = queryingWs.userName;
        const assertThatFullBufferWasReturned = queryingWs.assertMessageOnce((roomResponse: RoomResponse) => {
          expect(roomResponse).toEqual({
            type: "room-response",
            payload: {
              users: [userName],
              messages: expect.arrayContaining(
                messagesOfBatch
                  .map((msg) => ({ message: msg, id: expect.any(String), userName: sendingUserName }))
                  .slice(overflowSize)
              ),
            },
          });
          expect(roomResponse.payload.messages.length).toEqual(bufferSize);
        });
        await queryingWs.sendRoomMessage();
        await assertThatFullBufferWasReturned;
      });
      it("returns messages since lastMessage", async () => {
        const queryingWs = await testClientBuilder.connect("client-to-query-last-n-messages");
        await queryingWs.joinLobby();
        const n = 5;
        let lastNMessages: ChatMessage[];
        const findLastMessages = queryingWs.assertMessageOnce((roomResponse: RoomResponse) => {
          expect(roomResponse.payload.messages.length).toEqual(bufferSize);
          lastNMessages = roomResponse.payload.messages.slice(-n);
        });
        await queryingWs.sendRoomMessage();
        await findLastMessages;

        const assertMessagesSinceMessageId = queryingWs.assertMessageOnce((roomResponse: RoomResponse) => {
          expect(roomResponse.payload.messages.length).toEqual(n - 1);
          expect(roomResponse.payload.messages).toEqual(lastNMessages.slice(1));
        });
        await queryingWs.sendRoomMessage(lastNMessages[0].id);
        await assertMessagesSinceMessageId;
      });
      it("returns all messages in buffer for unknown lastMessageId", async () => {
        const queryingWs = await testClientBuilder.connect("client-to-query-with-unknown-last-message-id");
        const userName = queryingWs.userName;
        await queryingWs.joinLobby();
        const assertThatFullBufferWasReturned = queryingWs.assertMessageOnce((roomResponse: RoomResponse) => {
          expect(roomResponse).toEqual({
            type: "room-response",
            payload: {
              users: [userName],
              messages: expect.arrayContaining(
                messagesOfBatch
                  .map((msg) => ({ message: msg, id: expect.any(String), userName: sendingUserName }))
                  .slice(overflowSize)
              ),
            },
          });
          expect(roomResponse.payload.messages.length).toEqual(bufferSize);
        });
        await queryingWs.sendRoomMessage("some-unknown-message-id");
        await assertThatFullBufferWasReturned;
      });
    });
  });
});
