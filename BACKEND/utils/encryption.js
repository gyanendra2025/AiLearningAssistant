import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get the encryption secret from environment or fallback.
 * Must be exactly 32 bytes for AES-256.
 */
const getSecret = () => {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || "default-secret-key-change-me-now!";
  // Ensure 32-byte key using SHA-256 hash
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypt a plaintext string using AES-256-GCM
 * @param {string} plaintext
 * @returns {string} - base64 encoded string of iv:tag:ciphertext
 */
export const encrypt = (plaintext) => {
  const key = getSecret();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // Combine iv + tag + encrypted data as hex, separated by colons
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
};

/**
 * Decrypt an encrypted string
 * @param {string} encryptedText - iv:tag:ciphertext in hex
 * @returns {string} - decrypted plaintext
 */
export const decrypt = (encryptedText) => {
  const key = getSecret();
  const [ivHex, tagHex, ciphertext] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * Mask an API key for display (show first 4 and last 4 chars)
 * @param {string} key
 * @returns {string}
 */
export const maskApiKey = (key) => {
  if (!key || key.length < 10) return "****";
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};
