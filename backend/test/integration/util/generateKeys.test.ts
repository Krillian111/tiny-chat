import { promisify } from "util";
import { sign, verify, createPrivateKey, createPublicKey } from "node:crypto";
import generateKeys from "./generateKeys";

// node:crypto API exploration tests
describe("generateKeys", () => {
  it("creates keys to sign and verify", async () => {
    const passphrase = "some-passphrase";
    const { privateKey, publicKey } = await generateKeys(passphrase);
    const privateKeyAsObject = createPrivateKey({ key: privateKey, passphrase });
    const publicKeyAsObject = createPublicKey(Buffer.from(publicKey));

    const data = Buffer.from("some-data");
    const signature = await promisify(sign)(undefined, data, privateKeyAsObject);
    expect(verify(undefined, data, publicKeyAsObject, signature)).toEqual(true);
  });
  it("creates keys that can only sign and verify each other", async () => {
    const passphrase = "some-passphrase";
    const { privateKey: privateKey1 } = await generateKeys(passphrase);
    const { publicKey: publicKey2 } = await generateKeys("some-other-passphrase");
    const privateKeyAsObject = createPrivateKey({ key: privateKey1, passphrase });
    const publicKeyAsObject = createPublicKey(Buffer.from(publicKey2));

    const data = Buffer.from("some-data");
    const signature = await promisify(sign)(undefined, data, privateKeyAsObject);
    expect(verify(undefined, data, publicKeyAsObject, signature)).toEqual(false);
  });
});
