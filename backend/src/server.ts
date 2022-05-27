import createApp from "./app";
import config from "./config";

const { port } = config;

const app = createApp({
  logger: true,
});
app.listen({ port }, (err, address) => {
  if (err) {
    throw err;
  }
  app.log.info(`Listening on ${address}`);
});
