import env from "../config/env";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
const ALGORITHM = "aes-256-gcm";
const getEncryptionKey = () => {
  const key = Buffer.from(env.TOKEN_ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)",
    );
  }
  return key;
};

const encryptToken = (token: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

const decryptToken = (encryptToken: string): string => {
  const [ivHex, authTagHex, encryptedHex] = encryptToken.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted token format");
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf-8");
};

export { encryptToken, decryptToken };
