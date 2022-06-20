import { ErrorMessage, Message, RegisterOnClose } from "../chat.types";
import { userRepo } from "../persistence";
import { JoinPayload } from "./join.validation";

const type = "join-response";

export type JoinResponse = Message<
  "join-response",
  {
    userId: string;
    userName: string;
  }
>;

export function handle(
  msg: Message<"join">,
  registerOnClose: RegisterOnClose
): ErrorMessage<"join-response"> | JoinResponse {
  const { userName, publicKey } = msg.payload as JoinPayload;
  const addedUserOrError = userRepo.addToLobby(userName, publicKey);

  if (typeof addedUserOrError === "string") {
    return { type, error: [addedUserOrError] };
  }
  registerOnClose(() => {
    userRepo.removeFromLobby(addedUserOrError.userId);
  });
  return { type, payload: { userId: addedUserOrError.userId, userName: addedUserOrError.userName } };
}
