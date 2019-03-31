import { createHash } from "crypto";
export default function md5(str: string) {
  return createHash("md5")
    .update(str)
    .digest()
    .toString("hex");
}
