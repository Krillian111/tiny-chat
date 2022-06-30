import { arrayBufferToBase64 } from "./crypto";

describe("crypto", () => {
  it("arrayBufferToBase64", async () => {
    const inputAsByteArray = Buffer.from("some-string-to-encode");
    const output = await arrayBufferToBase64(inputAsByteArray);
    expect(output).toEqual(inputAsByteArray.toString("base64"));
  });
});
