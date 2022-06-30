import { promisify } from "util";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { testOnly, verifySignature } from "./crypto";

describe("testOnly", () => {
  describe("generateKeys", () => {
    it("creates keys to sign and verify", async () => {
      const { privateKey, publicKey } = await testOnly.generateKeys();
      const privateKeyAsObject = createPrivateKey({ key: privateKey });
      const publicKeyAsObject = createPublicKey(publicKey);
      const dataAsBuffer = Buffer.from(JSON.stringify({ some: "data" }));

      const signature = await promisify(sign)(undefined, dataAsBuffer, privateKeyAsObject);

      expect(verify(undefined, dataAsBuffer, publicKeyAsObject, signature)).toEqual(true);
    });
    it("creates keys that can only sign and verify each other", async () => {
      const { privateKey: privateKey1 } = await testOnly.generateKeys();
      const { publicKey: publicKey2 } = await testOnly.generateKeys();
      const privateKeyAsObject = createPrivateKey({ key: privateKey1 });
      const publicKeyAsObject = createPublicKey(publicKey2);
      const data = Buffer.from(JSON.stringify({ some: "data" }));

      const signature = await promisify(sign)(undefined, data, privateKeyAsObject);

      expect(verify(undefined, data, publicKeyAsObject, signature)).toEqual(false);
    });
  });
  describe("signPayload", () => {
    it("correctly signs the payload", async () => {
      const payload = { some: "payload" };
      const payloadAsBuffer = Buffer.from(JSON.stringify(payload), "utf-8");
      const { privateKey, publicKey } = await testOnly.generateKeys();
      const publicKeyAsObject = createPublicKey(publicKey);

      const signature = await testOnly.signPayload(payload, privateKey);
      const signatureAsBuffer = Buffer.from(signature, "base64");

      expect(verify(undefined, payloadAsBuffer, publicKeyAsObject, signatureAsBuffer)).toEqual(true);
    });
  });
});

describe("crypto", () => {
  describe("verifySignature", () => {
    it("returns true for valid signature", async () => {
      const payload = { some: "payload" };
      const { privateKey, publicKey } = await testOnly.generateKeys();
      const signature = await testOnly.signPayload(payload, privateKey);

      expect(verifySignature(payload, signature, publicKey)).toEqual(true);
    });
    it("returns false for invalid signature", async () => {
      const payload = { some: "payload" };
      const { publicKey } = await testOnly.generateKeys();
      const { privateKey: wrongPrivateKey } = await testOnly.generateKeys();
      const signature = await testOnly.signPayload(payload, wrongPrivateKey);

      expect(verifySignature(payload, signature, publicKey)).toEqual(false);
    });
    it("returns false for arbitrary string", async () => {
      const payload = { some: "payload" };
      const { publicKey } = await testOnly.generateKeys();

      expect(verifySignature(payload, "invalidly-encoded-signature", publicKey)).toEqual(false);
    });
  });
});
