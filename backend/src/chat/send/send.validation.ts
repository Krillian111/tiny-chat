import { ajv } from "../../common/validation";
import { ErrorMessage, isSignedMessage } from "../chat.types";

export const isSendEvent = isSignedMessage("send");

const sendPayloadSchema = {
  type: "object",
  required: ["userId"],
  properties: {
    userId: { type: "string" },
    message: { type: "string" },
  },
};

const validateSendSchema = ajv.compile(sendPayloadSchema);

export function validateSendPayload(payload): undefined | ErrorMessage<"send-response"> {
  const valid = validateSendSchema(payload);
  if (!valid) {
    return { type: "send-response", error: validateSendSchema.errors };
  }
}

export interface SendPayload {
  userId: string;
  message: string;
}
