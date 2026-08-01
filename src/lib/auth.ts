import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_auth";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function tokenForPassword(password: string) {
  return hash(password);
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === tokenForPassword(password);
}
