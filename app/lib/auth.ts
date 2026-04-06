import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ✅ SIGN TOKEN (ADD THIS)
export function signToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
}

// ✅ GET USER FROM COOKIE
export async function getUserFromCookie() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    return user;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

// ✅ ROLE GUARD
export function requireRole(user: any, roles: string[]) {
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
}