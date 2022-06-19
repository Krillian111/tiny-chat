import { MessageHandler } from "../chat.types";
import { handle } from "./room.handler";
import { isRoomEvent, validateRoomPayload } from "./room.validation";

const room: MessageHandler<"room", "room-response"> = {
  match: isRoomEvent,
  validate: validateRoomPayload,
  handle,
};

export default room;
