import { ajv } from "../../common/validation";
import { ErrorMessage, isSignedMessage, SignedMessageTypeGuard } from "../chat.types";

export const isRoomEvent: SignedMessageTypeGuard<"room"> = isSignedMessage("room");

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
