"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendParentOtp(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/login?phone=${encodeURIComponent(phone)}&sent=1`);
}

export async function verifyParentOtp(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const token = String(formData.get("token") || "").trim();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error || !data.user) redirect(`/login?phone=${encodeURIComponent(phone)}&error=${encodeURIComponent(error?.message || "验证码错误")}`);
  await supabase.from("profiles").upsert({
    id: data.user.id,
    role: "parent",
    phone,
    full_name: phone,
    timezone: "Asia/Shanghai"
  });
  redirect("/parent");
}

export async function teacherLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect(`/login?tab=teacher&error=${encodeURIComponent(error?.message || "登录失败")}`);
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
