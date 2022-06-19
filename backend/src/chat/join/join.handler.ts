import { Message, RegisterOnClose, ServerMessage } from "../chat.types";
import { userRepo } from "../persistence";
import { JoinPayload } from "./join.validation";

export function handle(msg: Message<"join">, registerOnClose: RegisterOnClose): ServerMessage<"join-response"> {
  const { userName, publicKey } = msg.payload as JoinPayload;
  const addedUserOrError = userRepo.addToLobby(userName, publicKey);

  if (typeof addedUserOrError === "string") {
    return { type: "join-response", error: [addedUserOrError] };
  }
  registerOnClose(() => {
    userRepo.removeFromLobby(addedUserOrError.userId);
  });
  return { type: "join-response", payload: { userId: addedUserOrError.userId, userName: addedUserOrError.userName } };
}
