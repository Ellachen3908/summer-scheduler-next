"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeError(message: string | undefined, fallback: string) {
  return encodeURIComponent(message || fallback);
}

export async function sendParentOtp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createClient();
  const origin = headers().get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?role=parent`
    }
  });

  if (error) {
    redirect(`/login?error=${safeError(error.message, "Failed to send login email")}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function teacherLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/login?tab=teacher&error=${safeError(error?.message, "Login failed")}`);
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    role: "teacher",
    email,
    full_name: email.split("@")[0],
    timezone: "Europe/London"
  });

  await supabase.from("teacher_profiles").upsert({
    user_id: data.user.id,
    email,
    full_name: email.split("@")[0],
    timezone: "Europe/London"
  }, { onConflict: "user_id" });

  redirect("/teacher");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
