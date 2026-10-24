import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { withAuthDiagnostics } from "@/lib/auth-diagnostics";
export function GET(request: NextRequest) { return withAuthDiagnostics("auth_route", () => handlers.GET(request), request); }
export function POST(request: NextRequest) { return withAuthDiagnostics("auth_route", () => handlers.POST(request), request); }
