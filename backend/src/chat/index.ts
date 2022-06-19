import { FastifyPluginCallback, FastifyPluginOptions } from "fastify";
import chatHandler from "./chat.handler";

const chat: FastifyPluginCallback<FastifyPluginOptions> = (fastify, {}, done) => {
  fastify.get("/chat", { websocket: true }, chatHandler);
  done();
};

export default chat;
