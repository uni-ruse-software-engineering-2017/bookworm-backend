export const base64Encode = (str: string = "") => {
  return Buffer.from(str).toString("base64");
};
