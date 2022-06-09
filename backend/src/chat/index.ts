import { FastifyPluginCallback } from "fastify";
import chatHandler from "./chat.handler";

const chat: FastifyPluginCallback<{}> = (fastify, {}, done) => {
  fastify.get("/chat", { websocket: true }, chatHandler);
  done();
};

export default chat;
