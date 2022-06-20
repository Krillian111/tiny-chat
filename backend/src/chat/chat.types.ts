export interface Message<Type extends string, Payload = unknown> {
  type: Type;
  payload: Payload;
}

export interface SignedMessage<Type extends string> extends Message<Type> {
  payload: { userId: string };
  signature: string;
}

export type SignedMessageTypeGuard<Type extends string> = (msgToTest: unknown) => msgToTest is SignedMessage<Type>;

export function isSignedMessage<Type extends string>(messageType: Type): SignedMessageTypeGuard<Type> {
  return (msgToTest: unknown): msgToTest is SignedMessage<Type> => {
    const msg = msgToTest as SignedMessage<Type>;
    return msg?.type === messageType && !!msg.payload && typeof msg.signature === "string";
  };
}

export interface ErrorMessage<Type extends string> {
  type: Type;
  error?: unknown[];
}

export type ClientMessage<Type extends string> = Message<Type> | SignedMessage<Type>;

export type ServerMessage<Type extends string, Payload = unknown> = Message<Type, Payload> | ErrorMessage<Type>;

export type RegisterOnClose = (onCloseCb: () => void) => void;

export interface MessageHandler<MessageType extends string, ResponseType extends string> {
  match: (msg: unknown) => msg is Message<MessageType>;
  validate: (payload: unknown) => undefined | ErrorMessage<ResponseType>;
  handle: (msg: Message<MessageType>, registerOnClose: RegisterOnClose) => undefined | ServerMessage<ResponseType>;
}
