"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function ensureParentProfile(userId: string, email: string) {
  const supabase = await createClient();

  await supabase.from("profiles").upsert({
    id: userId,
    role: "parent",
    email,
    full_name: email.split("@")[0],
    timezone: "Asia/Shanghai"
  });
}

export async function parentLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  const loginResult = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (loginResult.data.user) {
    await ensureParentProfile(loginResult.data.user.id, email);
    redirect("/parent");
  }

  const signUpResult = await supabase.auth.signUp({
    email,
    password
  });

  if (!signUpResult.data.user || signUpResult.error) {
    redirect("/login?error=parent_login_failed");
  }

  await ensureParentProfile(signUpResult.data.user.id, email);
  redirect("/parent");
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
