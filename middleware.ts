import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

const ROLE_PREFIX_MAP: Record<string, string[]> = {
  operator: ["/operator", "/api/branch"],
  master:   ["/master",   "/api/branch", "/api/owner", "/api/truck", "/api/location", "/api/user", "/api/history"],
  finance:  ["/finance",  "/api/finance", "/api/history", "/api/location", "/api/history/transfer"],
  manager:  ["/manager",  "/api/finance", "/api/history", "/api/location", "/api/history/transfer", "/api/user"],
};

// Path yang boleh diakses semua role yang sudah login
const SHARED_API = [
  "/api/location",
  "/api/owner",
  "/api/truck",
  "/api/history",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/profile",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const bypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";
  if (bypassAuth) {
    let mockRole = "manager";
    if (pathname.startsWith("/finance")) mockRole = "finance";
    else if (pathname.startsWith("/master")) mockRole = "master";
    else if (pathname.startsWith("/operator")) mockRole = "operator";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", "mock-user-id");
    requestHeaders.set("x-user-role", mockRole);
    requestHeaders.set("x-user-location-id", "07bf151f-ed44-4a5d-96cb-afed7e087c7a");
    requestHeaders.set("x-user-email", `${mockRole}@example.com`);

    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/${mockRole}/dashboard`, request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Bypass public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Bypass static files & next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    // API routes → 401
    if (pathname.startsWith("/api/")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Page routes → redirect login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Verify JWT
  let payload: { sub: string; role: string; location_id: string; email: string };
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload: decoded } = await jwtVerify(token, secret);
    payload = decoded as typeof payload;
  } catch {
    // Token invalid/expired
    const response = pathname.startsWith("/api/")
      ? Response.json({ message: "Token expired or invalid" }, { status: 401 })
      : NextResponse.redirect(new URL("/auth/login", request.url));

    // Clear cookie
    if (response instanceof NextResponse) {
      response.cookies.delete("token");
    }
    return response;
  }

  const { role, location_id } = payload;

  // Inject user info ke header biar API routes bisa baca tanpa decode ulang
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-user-role", role);
  requestHeaders.set("x-user-location-id", location_id ?? "");
  requestHeaders.set("x-user-email", payload.email ?? "");

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // ── Role-based access control ───────────────────────────────────────────────

  // Root redirect: "/" → ke dashboard role masing-masing
  if (pathname === "/") {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url));
  }

  // Cek apakah path diizinkan untuk role ini
  const allowedPrefixes = ROLE_PREFIX_MAP[role] ?? [];
  const isSharedApi = SHARED_API.some((p) => pathname.startsWith(p));
  const isAllowed =
    isSharedApi ||
    allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

function roleDashboard(role: string) {
  if (role === "finance") return "/finance/dashboard";
  if (role === "manager") return "/manager/dashboard";
  if (role === "master") return "/master";
  return "/operator";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};