import { promisify } from "util";
import { createPrivateKey, createPublicKey, sign, verify, generateKeyPair } from "node:crypto";

export function verifySignature(payload: Record<string, unknown>, signature: string, publicKey: string): boolean {
  const payloadAsBuffer = Buffer.from(JSON.stringify(payload), "utf-8");
  const publicKeyAsObject = createPublicKey(publicKey);
  const signatureAsBuffer = Buffer.from(signature, "hex");
  return verify(undefined, payloadAsBuffer, publicKeyAsObject, signatureAsBuffer);
}

export const testOnly = {
  generateKeys: async (passphrase: string): Promise<{ privateKey: string; publicKey: string }> => {
    return promisify(generateKeyPair)("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase,
      },
    });
  },
  signPayload: async (payload: Record<string, unknown>, privateKey: string, passphrase: string): Promise<string> => {
    const privateKeyAsObject = createPrivateKey({ key: privateKey, passphrase });
    const payloadAsBuffer = Buffer.from(JSON.stringify(payload), "utf-8");
    const signatureAsBuffer = await promisify(sign)(undefined, payloadAsBuffer, privateKeyAsObject);
    return signatureAsBuffer.toString("hex");
  },
};
