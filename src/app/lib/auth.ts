import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.decode(token) as { email: string; role: string };
  } catch {
    return null;
  }
}
