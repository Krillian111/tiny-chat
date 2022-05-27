import Fastify from "fastify";
import handleHealthcheck from "./monitoring/healthcheck";

interface AppConfig {
  logger?: boolean;
}

export default function createApp(config: AppConfig) {
  const logger = config.logger ?? false;
  const fastify = Fastify({
    logger,
  });
  fastify.get("/monitoring/health", handleHealthcheck);
  return fastify;
}
