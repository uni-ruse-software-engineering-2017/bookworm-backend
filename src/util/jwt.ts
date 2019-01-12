import { sign, verify } from "jsonwebtoken";
import { base64Encode } from "./base64";

export async function createJwt(sessionId: string) {
  return sign(
    {
      sessionId
    },
    base64Encode(process.env.JWT_SECRET),
    {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.SESSION_DURATION || "1d"
    }
  );
}

export async function verifyJwt(token: string) {
  return verify(token, base64Encode(process.env.JWT_SECRET));
}
