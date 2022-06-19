import { FastifyPluginCallback, FastifyPluginOptions } from "fastify";
import handleHealthcheck from "./healthcheck";

const monitoring: FastifyPluginCallback<FastifyPluginOptions> = (fastify, {}, done) => {
  fastify.get("/monitoring/health", handleHealthcheck);
  done();
};

export default monitoring;
