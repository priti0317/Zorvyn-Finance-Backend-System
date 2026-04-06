import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const protectedRoutes = ["/dashboard", "/api"];
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const isApi = pathname.startsWith("/api");

  if (!token) {
    if (isApi) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Restrict /api/admin/* routes
    if (pathname.startsWith("/api/admin") && !["ADMIN", "ANALYST"].includes(payload.role)) {
      if (isApi) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    if (isApi) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};