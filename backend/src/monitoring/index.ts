import { FastifyPluginCallback } from "fastify";
import handleHealthcheck from "./healthcheck";

const monitoring: FastifyPluginCallback<{}> = (fastify, {}, done) => {
  fastify.get("/monitoring/health", handleHealthcheck);
  done();
};

export default monitoring;
