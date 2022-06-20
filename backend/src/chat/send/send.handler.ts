import { verifySignature } from "../../common/crypto";
import { ErrorMessage, Message, SignedMessage } from "../chat.types";
import { userRepo } from "../persistence";
import { SendPayload } from "./send.validation";

const type = "send-response";

export type SendResponse = Message<"send-response", { message: string }>;

export function handle(msg: SignedMessage<"send">): ErrorMessage<"send-response"> | SendResponse {
  const publicKey = userRepo.findPublicKeyInLobby(msg.payload.userId);
  if (!publicKey) {
    return { type, error: ["User not in lobby"] };
  }
  if (!verifySignature(msg.payload, msg.signature, publicKey)) {
    return { type, error: ["Message contains invalid signature"] };
  }
  const payload = msg.payload as SendPayload;

  return { type, payload: { message: payload.message } };
}
