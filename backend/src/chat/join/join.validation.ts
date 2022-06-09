import { createPublicKey } from "node:crypto";
import { ajv } from "../../common/validation";
import { ErrorMessage, Message } from "../chat.types";

export function isJoinEvent(msgToTest: unknown): msgToTest is Message<"join"> {
  const msg = msgToTest as Message<"join">;
  return msg?.type === "join" && !!msg?.payload;
}

const joinPayloadSchema = {
  type: "object",
  required: ["userName", "publicKey"],
  properties: {
    userName: { type: "string" },
    publicKey: { type: "string" },
  },
};

const validateJoinPayloadSchema = ajv.compile(joinPayloadSchema);

export interface JoinPayload {
  userName: string;
  publicKey: string;
}

function isPublicKey(input: string) {
  try {
    createPublicKey(Buffer.from(input));
    return true;
  } catch (e) {
    return false;
  }
}

export function validateJoinPayload(payload): undefined | ErrorMessage<"join-response"> {
  const valid = validateJoinPayloadSchema(payload);
  if (!valid) {
    return { type: "join-response", error: validateJoinPayloadSchema.errors };
  }
  if (!isPublicKey((payload as JoinPayload).publicKey)) {
    return { type: "join-response", error: ["publicKey is not a PEM-encoded public key"] };
  }
}
