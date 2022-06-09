import createApp from "./app";
import config from "./config";

const { port } = config;

const app = createApp({
  logger: true,
});
app.listen({ port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Listening on ${address}`);
});
