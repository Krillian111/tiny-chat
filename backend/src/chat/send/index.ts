import { MessageHandler } from "../chat.types";
import { handle } from "./send.handler";
import { isSendEvent, validateSendPayload } from "./send.validation";

const send: MessageHandler<"send", "send-response"> = {
  match: isSendEvent,
  validate: validateSendPayload,
  handle,
};

export default send;
