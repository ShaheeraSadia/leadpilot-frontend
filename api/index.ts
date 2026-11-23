import type { IncomingMessage, ServerResponse } from "http";
import { createLeadPilotApiApp } from "../server-app.ts";

const app = createLeadPilotApiApp();

function normalizeVercelRequestUrl(rawUrl?: string): string {
  const input = rawUrl || "/";
  const parsed = new URL(input, "http://localhost");

  const vercelPath = parsed.searchParams.get("__vercel_path");
  if (vercelPath !== null) {
    parsed.searchParams.delete("__vercel_path");
    const cleanedSubPath = vercelPath.replace(/^\/+/, "");
    const targetPathname = cleanedSubPath ? `/api/${cleanedSubPath}` : "/api";
    const qs = parsed.searchParams.toString();
    return qs ? `${targetPathname}?${qs}` : targetPathname;
  }

  let pathname = parsed.pathname;
  if (pathname === "/api/index") {
    pathname = "/api";
  } else if (!pathname.startsWith("/api")) {
    pathname = pathname === "/" ? "/api" : `/api${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  }

  const qs = parsed.searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  req.url = normalizeVercelRequestUrl(req.url);
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
