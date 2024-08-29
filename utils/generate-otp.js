import crypto from "crypto";

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}
