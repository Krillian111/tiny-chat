import Fastify from "fastify";
import fastifyWebocket from "@fastify/websocket";
import monitoring from "./monitoring";
import chat from "./chat";

interface AppConfig {
  logger?: boolean;
}

export default function createApp(config: AppConfig) {
  const logger = config.logger ?? false;
  const fastify = Fastify({
    logger,
    ajv: {
      customOptions: {
        coerceTypes: false,
      },
    },
  });
  fastify.register(monitoring);
  fastify.register(fastifyWebocket);
  fastify.register(chat);

  return fastify;
}
