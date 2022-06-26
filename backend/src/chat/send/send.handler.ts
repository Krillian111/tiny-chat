import { verifySignature } from "../../common/crypto";
import { ErrorMessage, Message, SignedMessage } from "../chat.types";
import { userRepo, messageRepo } from "../persistence";
import { ChatMessage } from "../persistence/message/message.types";
import { SendPayload } from "./send.validation";

const type = "send-response";

export type SendResponse = Message<"send-response", Omit<ChatMessage, "userName">>;

export function handle(msg: SignedMessage<"send">): ErrorMessage<"send-response"> | SendResponse {
  const user = userRepo.findUser(msg.payload.userId);
  if (!user) {
    return { type, error: ["User not in lobby"] };
  }
  if (!verifySignature(msg.payload, msg.signature, user.publicKey)) {
    return { type, error: ["Message contains invalid signature"] };
  }
  const payload = msg.payload as SendPayload;
  const messageId = messageRepo.addMessageToLobby(payload.message, user.userName);

  return { type, payload: { message: payload.message, id: messageId } };
}
