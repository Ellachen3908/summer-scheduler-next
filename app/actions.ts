"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://summer-scheduler-next-cm4k-one.vercel.app";

export async function sendParentOtp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?role=parent`
    }
  });

  if (error) {
    redirect("/login?error=email_send_failed");
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function teacherLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    redirect("/login?tab=teacher&error=login_failed");
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
