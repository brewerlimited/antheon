import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
function key() {
  const input = process.env.SEO_TOKEN_ENCRYPTION_KEY ?? "";
  if (!/^[a-f0-9]{64}$/i.test(input)) throw new Error("Token encryption is not configured");
  return Buffer.from(input, "hex");
}
export function encrypt(value: string) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}
export function decrypt(value: string) {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Invalid encrypted token");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
