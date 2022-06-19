import { verifySignature } from "../../common/crypto";
import { ServerMessage, SignedMessage } from "../chat.types";
import { userRepo } from "../persistence";

export function handle(msg: SignedMessage<"room">): ServerMessage<"room-response"> {
  const publicKey = userRepo.findPublicKeyInLobby(msg.payload.userId);
  if (!publicKey) {
    return { type: "room-response", error: ["User not in lobby"] };
  }
  if (!verifySignature(msg.payload, msg.signature, publicKey)) {
    return { type: "room-response", error: ["Message contains invalid signature"] };
  }
  const lobbyUsers = userRepo.getAllFromLobby();
  return { type: "room-response", payload: { users: lobbyUsers } };
}
