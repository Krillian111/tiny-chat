export interface Message<Type extends string, Payload = unknown> {
  type: Type;
  payload: Payload;
}

export type JoinMessage = Message<
  "join",
  { userName: string; publicKey: string }
>;

export type JoinResponse = ServerMessage<
  "join-response",
  { userId: string; userName: string }
>;

export interface SignedMessage<Type extends string> extends Message<Type> {
  payload: { userId: string };
  signature: string;
}

export interface ErrorMessage<Type extends string> {
  type: Type;
  error?: unknown[];
}

export function isErrorMessage<T extends string>(
  type: string,
  msg: unknown
): msg is ErrorMessage<T> {
  const msgToCheck = msg as ErrorMessage<T>;
  return msgToCheck.type === type && !!msgToCheck.error;
}

export type ClientMessage<Type extends string> =
  | Message<Type>
  | SignedMessage<Type>;

export type ServerMessage<Type extends string, Payload = unknown> =
  | Message<Type, Payload>
  | ErrorMessage<Type>;
