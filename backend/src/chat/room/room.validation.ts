import { ajv } from "../../common/validation";
import { ErrorMessage, SignedMessage } from "../chat.types";

export function isRoomEvent(msgToTest: unknown): msgToTest is SignedMessage<"room"> {
  const msg = msgToTest as SignedMessage<"room">;
  return msg?.type === "room" && !!msg.payload && typeof msg.signature === "string";
}

const roomPayloadSchema = {
  type: "object",
  required: ["userId"],
  properties: {
    userId: { type: "string" },
  },
};

const validateRoomSchema = ajv.compile(roomPayloadSchema);

export function validateRoomPayload(payload): undefined | ErrorMessage<"room-response"> {
  const valid = validateRoomSchema(payload);
  if (!valid) {
    return { type: "room-response", error: validateRoomSchema.errors };
  }
}

export interface RoomPayload {
  userId: string;
}
