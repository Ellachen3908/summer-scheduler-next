"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeError(message: string | undefined, fallback: string) {
  return encodeURIComponent(message || fallback);
}

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

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    const signUpResult = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpResult.error || !signUpResult.data.user) {
      redirect(`/login?error=${safeError(signUpResult.error?.message, "家长登录失败")}`);
    }

    data = signUpResult.data;
    error = null;
  }

  if (!data.user) {
    redirect(`/login?error=${safeError(error?.message, "家长登录失败")}`);
  }

  await ensureParentProfile(data.user.id, email);

  redirect("/parent");
}

export async function teacherLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    const signUpResult = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpResult.error || !signUpResult.data.user) {
      redirect(`/login?tab=teacher&error=${safeError(signUpResult.error?.message, "老师登录失败")}`);
    }

    data = signUpResult.data;
    error = null;
  }

  if (!data.user) {
    redirect(`/login?tab=teacher&error=${safeError(error?.message, "老师登录失败")}`);
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

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    redirect(`/login?tab=admin&error=${safeError(error?.message, "管理员登录失败")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/login?tab=admin&error=这个账号还不是管理员，请先在 Supabase 把 role 改成 admin");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
