import { randomUUID } from "node:crypto";
import { once } from "events";
import WebSocket from "ws";
import createApp from "../../../src/app";
import { ClientMessage } from "../../../src/chat/chat.types";
import { JoinResponse } from "../../../src/chat/join/join.handler";
import { expectJoinSuccess } from "./expectations";
import { testOnly } from "../../../src/common/crypto";

const { generateKeys } = testOnly;

export function setupAppWithWebsocket(): TestClientBuilder {
  let wsAddress: string;
  const app = createApp({});
  beforeAll(async () => {
    await app.ready();
    return new Promise<void>((resolve) => {
      app.listen(undefined, (_err, address) => {
        wsAddress = `${address.replace("http", "ws")}/chat`;
        resolve();
      });
    });
  });
  let wsToCleanUp: WebSocket[] = [];
  afterEach(async () => {
    wsToCleanUp.forEach((ws) => ws.close());
    wsToCleanUp = [];
  });
  afterAll(async () => {
    await app.close();
  });
  return new TestClientBuilder(
    () => wsAddress,
    (ws: WebSocket) => wsToCleanUp.push(ws)
  );
}

class TestClientBuilder {
  wsAddressSupplier: () => string;
  registerCleanUp: (ws: WebSocket) => void;

  constructor(wsAddressSupplier: () => string, registerCleanUp: (ws: WebSocket) => void) {
    this.wsAddressSupplier = wsAddressSupplier;
    this.registerCleanUp = registerCleanUp;
  }

  async connect(userName: string): Promise<TestClient> {
    const ws = new WebSocket(this.wsAddressSupplier());
    this.registerCleanUp(ws);

    await once(ws, "open");

    const passphrase = randomUUID();
    const { privateKey, publicKey } = await generateKeys(passphrase);
    return new TestClient({ ws, userName, privateKey, publicKey, passphrase });
  }
}

class TestClient {
  readonly ws: WebSocket;
  readonly userName: string;
  readonly privateKey: string;
  readonly publicKey: string;
  readonly passphrase: string;
  private _userId: string | undefined;

  constructor({ ws, userName, privateKey, publicKey, passphrase }) {
    this.ws = ws;
    this.userName = userName;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.passphrase = passphrase;
  }

  get userId() {
    if (!this._userId) {
      throw new Error("No userId, client did not join yet!");
    }
    return this._userId;
  }
  async joinLobby(): Promise<void> {
    const assertJoinSuccessful = assertMessageOnce(this.ws, (joinResponse: JoinResponse) => {
      expectJoinSuccess(joinResponse);
      this._userId = joinResponse.payload.userId;
    });
    this.send({ type: "join", payload: { publicKey: this.publicKey, userName: this.userName } });
    await assertJoinSuccessful;
  }

  send(msg: ClientMessage<string>) {
    return sendSerialized(this.ws, msg);
  }

  async sendWithUserIdAndSigned(type: string, payloadWithoutUserId: Record<string, unknown>) {
    const payload = { ...payloadWithoutUserId, userId: this.userId };
    const signature = await testOnly.signPayload(payload, this.privateKey, this.passphrase);
    return sendSerialized(this.ws, { type, payload, signature });
  }

  async sendRoomMessage(lastMessageId?: string) {
    return this.sendWithUserIdAndSigned("room", { lastMessageId });
  }

  async assertMessage(evaluateCondition: (msg: unknown) => boolean) {
    let onMessageHandler;
    return new Promise<void>((resolve, reject) => {
      onMessageHandler = (msg: WebSocket.RawData) => {
        try {
          const parsedMsg = JSON.parse(msg.toString("utf-8"));
          const conditionFullfilled = evaluateCondition(parsedMsg);
          if (conditionFullfilled) {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      };
      this.ws.on("message", onMessageHandler);
    }).finally(() => {
      this.ws.removeEventListener("message", onMessageHandler);
    });
  }
  async assertMessageOnce(assertParsedMessage: (msg: unknown) => void) {
    return assertMessageOnce(this.ws, assertParsedMessage);
  }
}

async function assertMessageOnce(ws: WebSocket, assertParsedMessage: (msg: unknown) => void) {
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

function sendSerialized(ws: WebSocket, msg: ClientMessage<string>) {
  ws.send(JSON.stringify(msg));
}
