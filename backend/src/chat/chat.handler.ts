import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { MessageHandler } from "./chat.types";
import join from "./join";
import room from "./room";
import send from "./send";

const chatMessageHandler: MessageHandler<string, string>[] = [join, room, send];

export default function chatHandler(connection: SocketStream, _req: FastifyRequest) {
  const send = (message: unknown) => connection.socket.send(JSON.stringify(message));
  const registerOnClose = (onCloseCb: () => void) => connection.socket.once("close", onCloseCb);
  connection.socket.on("message", (unparsedMsg) => {
    const msg = JSON.parse(unparsedMsg.toString("utf-8"));

    for (const handler of chatMessageHandler) {
      if (handler.match(msg)) {
        const validationError = handler.validate(msg.payload);
        if (validationError) {
          send(validationError);
          return;
        }
        const response = handler.handle(msg, registerOnClose);
        if (response) {
          send(response);
        }
        return;
      }
    }
  });
}
