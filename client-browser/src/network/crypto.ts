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

async function convertToPem(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  const exportedAsString = ab2str(exported);
  const exportedAsBase64 = window.btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}

function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(
    null,
    new Uint8Array(buf) as unknown as number[]
  );
}
