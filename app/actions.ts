"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function parentLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    const signUpResult = await supabase.auth.signUp({
      email,
      password
    });

    data = signUpResult.data;
    error = signUpResult.error;
  }

  if (error || !data.user) {
    redirect("/login?error=parent_login_failed");
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    role: "parent",
    email,
    full_name: email.split("@")[0],
    timezone: "Asia/Shanghai"
  });

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
