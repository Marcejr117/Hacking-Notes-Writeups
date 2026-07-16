import crypto from "node:crypto";

export const ALGORITHM = "aes-256-gcm";
export const KEY_LENGTH = 32;
export const IV_LENGTH = 12;
export const SALT_LENGTH = 16;
export const AUTH_TAG_LENGTH = 16;

const SHA256_HEX_RE = /^[a-f0-9]{64}$/i;

export type PasswordKeyMode = "password" | "passwordHash";

export interface ResolvedProtection {
  mode: PasswordKeyMode;
  secretMaterial: string;
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function isSha256Hex(value: unknown): value is string {
  return typeof value === "string" && SHA256_HEX_RE.test(value);
}

export function resolveProtection(
  frontmatter: Record<string, unknown>,
  passwordField: string,
  passwordHashField: string,
): ResolvedProtection | null {
  const hashValue = frontmatter[passwordHashField];
  if (isSha256Hex(hashValue)) {
    return { mode: "passwordHash", secretMaterial: hashValue.toLowerCase() };
  }

  const passwordValue = frontmatter[passwordField];
  if (typeof passwordValue === "string" && passwordValue.length > 0) {
    return { mode: "password", secretMaterial: passwordValue };
  }

  return null;
}

export function encryptAesGcm(
  plaintext: string,
  secretMaterial: string,
  iterations: number,
): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  const key = crypto.pbkdf2Sync(secretMaterial, salt, iterations, KEY_LENGTH, "sha256");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const result = Buffer.concat([salt, iv, authTag, encrypted]);
  return result.toString("base64");
}

export function decryptAesGcm(
  encryptedBase64: string,
  secretMaterial: string,
  iterations: number,
): string {
  const buffer = Buffer.from(encryptedBase64, "base64");

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = buffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );
  const ciphertext = buffer.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const key = crypto.pbkdf2Sync(secretMaterial, salt, iterations, KEY_LENGTH, "sha256");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext, undefined, "utf8") + decipher.final("utf8");
}

export function scrubSensitiveFrontmatter(
  frontmatter: Record<string, unknown>,
  passwordField: string,
  passwordHashField: string,
): void {
  delete frontmatter[passwordField];
  delete frontmatter[passwordHashField];
}
