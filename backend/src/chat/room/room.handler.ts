import { verifySignature } from "../../common/crypto";
import { ErrorMessage, Message, SignedMessage } from "../chat.types";
import { messageRepo, userRepo } from "../persistence";
import { ChatMessage } from "../persistence/message/message.types";
import { RoomPayload } from "./room.validation";

const type = "room-response";

export type RoomResponse = Message<
  "room-response",
  {
    users: string[];
    messages: ChatMessage[];
  }
>;

export function handle(msg: SignedMessage<"room">): ErrorMessage<"room-response"> | RoomResponse {
  const user = userRepo.findUser(msg.payload.userId);
  if (!user) {
    return { type, error: ["User not in lobby"] };
  }
  if (!verifySignature(msg.payload, msg.signature, user.publicKey)) {
    return { type, error: ["Message contains invalid signature"] };
  }
  const payload = msg.payload as RoomPayload;
  const lobbyUsers = userRepo.getAllFromLobby();
  const messages = messageRepo.getMessagesFromLobby(payload.lastMessageId);

  return { type, payload: { users: lobbyUsers, messages } };
}
