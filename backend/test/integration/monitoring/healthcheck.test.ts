import supertest from "supertest";
import createApp from "../../../src/app";

const app = createApp({});
describe("/monitoring/health", () => {
  beforeAll(async () => {
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });
  it("returns 200 OK", async () => {
    await supertest(app.server).get("/monitoring/health").expect(200).expect({ app: "OK" });
  });
});
