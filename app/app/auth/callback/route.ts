export const runtime = "edge";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role");
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user && role === "parent") {
    await supabase.from("profiles").upsert({
      id: user.id,
      role: "parent",
      email: user.email,
      full_name: user.email?.split("@")[0] || "Parent",
      timezone: "Asia/Shanghai"
    });
  }

  return NextResponse.redirect(new URL(role === "parent" ? "/parent" : "/login", requestUrl.origin));
}
