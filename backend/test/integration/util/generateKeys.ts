import { generateKeyPair } from "node:crypto";

export default async function generateKeys(passphrase: string) {
  return new Promise<{ privateKey: string; publicKey: string }>((resolve, reject) => {
    generateKeyPair(
      "rsa",
      {
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
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        }
        resolve({ publicKey, privateKey });
      }
    );
  });
}
