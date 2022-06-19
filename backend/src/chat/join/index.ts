import { MessageHandler } from "../chat.types";
import { handle } from "./join.handler";
import { isJoinEvent, validateJoinPayload } from "./join.validation";

const join: MessageHandler<"join", "join-response"> = {
  match: isJoinEvent,
  validate: validateJoinPayload,
  handle,
};

export default join;
