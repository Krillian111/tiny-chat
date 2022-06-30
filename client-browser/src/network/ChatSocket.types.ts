export interface Message<Type extends string, Payload = unknown> {
  type: Type;
  payload: Payload;
}

export interface SignedMessage<Type extends string, AdditionalPayload>
  extends Message<Type, { userId: string }> {
  payload: AdditionalPayload & { userId: string };
  signature: string;
}

export interface ErrorMessage<Type extends string> {
  type: Type;
  error?: unknown[];
}

export function isErrorMessage(
  msg: unknown
): msg is Omit<ErrorMessage<"">, "type"> {
  const msgToCheck = msg as ErrorMessage<"">;
  return !!msgToCheck.error;
}

export type ClientMessage<Type extends string> =
  | Message<Type>
  | SignedMessage<Type, {}>;

export type ServerMessage<Type extends string, Payload = unknown> =
  | Message<Type, Payload>
  | ErrorMessage<Type>;

export type JoinMessage = Message<
  "join",
  { userName: string; publicKey: string }
>;

export type RoomMessage = SignedMessage<"room", {}>;
export type SendMessage = SignedMessage<"send", { message: string }>;
export type SignedMessages = RoomMessage | SendMessage;

export type User = string;
export type ChatMessage = {
  message: string;
  id: string;
  userName: string;
};

export type RoomSuccessResponse = Message<
  "room-response",
  { users: User[]; messages: ChatMessage[] }
>;
export type JoinSuccessResponse = Message<
  "join-response",
  { userId: string; userName: string }
>;
