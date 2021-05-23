import bcrypt from "bcryptjs";

export function createPasswordHash(str) {
  return bcrypt.hash(str, 10);
}

export { bcrypt };
