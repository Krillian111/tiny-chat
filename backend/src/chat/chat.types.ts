export interface MessageHandler<MessageType extends string, ResponseEvent extends string> {
  match: (msg: unknown) => msg is Message<MessageType>;
  validate: (payload: unknown) => undefined | ErrorMessage<ResponseEvent>;
  handle: (msg: Message<MessageType>) => undefined | Message<ResponseEvent>;
}

export interface Message<MessageType extends string> {
  type: MessageType;
  payload: unknown;
}

export interface ErrorMessage<MessageType extends string> {
  type: MessageType;
  error?: unknown[];
}
