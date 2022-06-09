import { randomUUID } from "node:crypto";
import { MessageHandler, Message, ErrorMessage } from "../chat.types";
import { isJoinEvent, JoinPayload, validateJoinPayload } from "./join.validation";

function match(msg: unknown): msg is Message<"join"> {
  return isJoinEvent(msg);
}

function validate(payload: unknown): undefined | ErrorMessage<"join-response"> {
  return validateJoinPayload(payload);
}

interface User {
  userName: string;
  userId: string;
  publicKey: string;
}

const lobby: User[] = [];

function handle(msg: Message<"join">): Message<"join-response"> {
  const userId = randomUUID();
  const { userName, publicKey } = msg.payload as JoinPayload;
  lobby.push({ userName, userId, publicKey });
  return { type: "join-response", payload: { userName, userId } };
}

export const join: MessageHandler<"join", "join-response"> = {
  match,
  validate,
  handle,
};
