export interface Message<Type extends string> {
  type: Type;
  payload?: unknown;
}

export interface SignedMessage<Type extends string> extends Message<Type> {
  payload: { userId: string };
  signature: string;
}

export interface ErrorMessage<Type extends string> {
  type: Type;
  error?: unknown[];
}

export type ClientMessage<Type extends string> = Message<Type> | SignedMessage<Type>;

export type ServerMessage<Type extends string> = Message<Type> | ErrorMessage<Type>;

export type RegisterOnClose = (onCloseCb: () => void) => void;

export interface MessageHandler<MessageType extends string, ResponseType extends string> {
  match: (msg: unknown) => msg is Message<MessageType>;
  validate: (payload: unknown) => undefined | ErrorMessage<ResponseType>;
  handle: (msg: Message<MessageType>, registerOnClose: RegisterOnClose) => undefined | ServerMessage<ResponseType>;
}
