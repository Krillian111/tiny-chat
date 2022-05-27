import handleHealthcheck from "./healthcheck";

describe("healthcheck", () => {
  it("returns positive response", async () => {
    const response = await handleHealthcheck();
    expect(response).toEqual({ app: "OK" });
  });
});
