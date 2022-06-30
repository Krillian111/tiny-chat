export async function generateKeyPair(): Promise<{
  privateKey: CryptoKey;
  publicKey: string;
}> {
  const algorithm: RsaHashedKeyGenParams = {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: "SHA-256",
  };
  const keys = await window.crypto.subtle.generateKey(algorithm, false, [
    "sign",
  ]);
  const publicKeyAsPem = await convertToPem(keys.publicKey);
  return { privateKey: keys.privateKey, publicKey: publicKeyAsPem };
}

export async function createSignature(
  toSign: unknown,
  privateKey: CryptoKey
): Promise<string> {
  const toSignAsString = JSON.stringify(toSign);
  const toSignAsTypedArray = utf8ToUint8array(toSignAsString);
  const sigAsArrayBuffer = await window.crypto.subtle.sign(
    privateKey.algorithm,
    privateKey,
    toSignAsTypedArray
  );
  return arrayBufferToBase64(sigAsArrayBuffer);
}

async function convertToPem(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  const exportedAsBase64 = await arrayBufferToBase64(exported);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}

export async function arrayBufferToBase64(
  arrayBuffer: ArrayBuffer
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      if (typeof reader.result === "string") {
        return resolve(reader.result.split("base64,")[1]);
      }
      reject("Could not read arrayBuffer");
    });

    const blob = new Blob([arrayBuffer]);
    reader.readAsDataURL(blob);
  });
}

function utf8ToUint8array(base64string: string): Uint8Array {
  return new TextEncoder().encode(base64string);
}
