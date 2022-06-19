import { promisify } from "util";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { testOnly, verifySignature } from "./crypto";

describe("testOnly", () => {
  describe("generateKeys", () => {
    it("creates keys to sign and verify", async () => {
      const passphrase = "some-passphrase111";
      const { privateKey, publicKey } = await testOnly.generateKeys(passphrase);
      const privateKeyAsObject = createPrivateKey({ key: privateKey, passphrase });
      const publicKeyAsObject = createPublicKey(publicKey);
      const dataAsBuffer = Buffer.from(JSON.stringify({ some: "data" }));

      const signature = await promisify(sign)(undefined, dataAsBuffer, privateKeyAsObject);

      expect(verify(undefined, dataAsBuffer, publicKeyAsObject, signature)).toEqual(true);
    });
    it("creates keys that can only sign and verify each other", async () => {
      const passphrase = "some-passphrase222";
      const { privateKey: privateKey1 } = await testOnly.generateKeys(passphrase);
      const { publicKey: publicKey2 } = await testOnly.generateKeys("some-other-passphrase");
      const privateKeyAsObject = createPrivateKey({ key: privateKey1, passphrase });
      const publicKeyAsObject = createPublicKey(publicKey2);
      const data = Buffer.from(JSON.stringify({ some: "data" }));

      const signature = await promisify(sign)(undefined, data, privateKeyAsObject);

      expect(verify(undefined, data, publicKeyAsObject, signature)).toEqual(false);
    });
  });
  describe("signPayload", () => {
    it("correctly signs the payload", async () => {
      const passphrase = "some-passphrase333";
      const payload = { some: "payload" };
      const payloadAsBuffer = Buffer.from(JSON.stringify(payload), "utf-8");
      const { privateKey, publicKey } = await testOnly.generateKeys(passphrase);
      const publicKeyAsObject = createPublicKey(publicKey);

      const signature = await testOnly.signPayload(payload, privateKey, passphrase);
      const signatureAsBuffer = Buffer.from(signature, "hex");

      expect(verify(undefined, payloadAsBuffer, publicKeyAsObject, signatureAsBuffer)).toEqual(true);
    });
  });
});

describe("crypto", () => {
  describe("verifySignature", () => {
    it("returns true for valid signature", async () => {
      const payload = { some: "payload" };
      const passphrase = "some-passphrase444";
      const { privateKey, publicKey } = await testOnly.generateKeys(passphrase);
      const signature = await testOnly.signPayload(payload, privateKey, passphrase);

      expect(verifySignature(payload, signature, publicKey)).toEqual(true);
    });
    it("returns false for invalid signature", async () => {
      const payload = { some: "payload" };
      const passphrase = "some-passphrase555";
      const { publicKey } = await testOnly.generateKeys(passphrase);
      const { privateKey: wrongPrivateKey } = await testOnly.generateKeys(passphrase);
      const signature = await testOnly.signPayload(payload, wrongPrivateKey, passphrase);

      expect(verifySignature(payload, signature, publicKey)).toEqual(false);
    });
    it("returns false for arbitrary string", async () => {
      const payload = { some: "payload" };
      const passphrase = "some-passphrase666";
      const { publicKey } = await testOnly.generateKeys(passphrase);

      expect(verifySignature(payload, "some-fake-signature", publicKey)).toEqual(false);
    });
  });
});
