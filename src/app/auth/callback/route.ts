import { createClient } from "@/lib/supabase/server";
import { destinoSeguro } from "@/lib/safeRedirect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = destinoSeguro(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
