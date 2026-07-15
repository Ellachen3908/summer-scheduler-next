"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginRole = "parent" | "teacher" | "admin";

const messages = {
  missingEmailPassword: "\u8bf7\u8f93\u5165\u90ae\u7bb1\u548c\u5bc6\u7801\u3002",
  shortPassword: "\u5bc6\u7801\u81f3\u5c11\u9700\u8981 6 \u4f4d\u3002",
  adminCannotAutoSignup:
    "\u7ba1\u7406\u5458\u8d26\u53f7\u4e0d\u80fd\u81ea\u52a8\u6ce8\u518c\u3002\u8bf7\u5148\u7528\u8fd9\u4e2a\u90ae\u7bb1\u6ce8\u518c\u6210\u5bb6\u957f\u6216\u8001\u5e08\uff0c\u518d\u5230 Supabase \u628a profiles \u8868\u91cc\u7684 role \u6539\u6210 admin\u3002",
  loginFailed:
    "\u767b\u5f55\u6216\u6ce8\u518c\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u90ae\u7bb1\u548c\u5bc6\u7801\u3002",
  notAdmin:
    "\u8fd9\u4e2a\u90ae\u7bb1\u8fd8\u4e0d\u662f\u7ba1\u7406\u5458\u3002\u8bf7\u5230 Supabase \u7684 profiles \u8868\u91cc\uff0c\u628a\u8fd9\u4e2a\u7528\u6237\u7684 role \u6539\u6210 admin\u3002"
};

function readRole(formData: FormData): LoginRole {
  const role = String(formData.get("role") || "parent");

  if (role === "teacher" || role === "admin") {
    return role;
  }

  return "parent";
}

function loginErrorPath(role: LoginRole, message: string) {
  return `/login?role=${role}&error=${encodeURIComponent(message)}`;
}

function userNameFromEmail(email: string) {
  return email.split("@")[0] || email;
}

async function ensureParentProfile(userId: string, email: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    role: "parent",
    email,
    full_name: userNameFromEmail(email),
    timezone: "Asia/Shanghai"
  });

  if (error) {
    redirect(loginErrorPath("parent", error.message));
  }
}

async function ensureTeacherProfile(userId: string, email: string) {
  const supabase = await createClient();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    role: "teacher",
    email,
    full_name: userNameFromEmail(email),
    timezone: "Europe/London"
  });

  if (profileError) {
    redirect(loginErrorPath("teacher", profileError.message));
  }

  const { error: teacherError } = await supabase.from("teacher_profiles").upsert(
    {
      user_id: userId,
      email,
      full_name: userNameFromEmail(email),
      timezone: "Europe/London"
    },
    { onConflict: "user_id" }
  );

  if (teacherError) {
    redirect(loginErrorPath("teacher", teacherError.message));
  }
}

export async function accountLogin(formData: FormData) {
  const role = readRole(formData);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  if (!email || !password) {
    redirect(loginErrorPath(role, messages.missingEmailPassword));
  }

  if (password.length < 6) {
    redirect(loginErrorPath(role, messages.shortPassword));
  }

  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password
  });

  let user = signInResult.data.user;

  if (signInResult.error || !user) {
    if (role === "admin") {
      redirect(loginErrorPath(role, messages.adminCannotAutoSignup));
    }

    const signUpResult = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpResult.error || !signUpResult.data.user) {
      redirect(loginErrorPath(role, signUpResult.error?.message || messages.loginFailed));
    }

    user = signUpResult.data.user;
  }

  if (role === "parent") {
    await ensureParentProfile(user.id, email);
    redirect("/parent");
  }

  if (role === "teacher") {
    await ensureTeacherProfile(user.id, email);
    redirect("/teacher");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect(loginErrorPath("admin", messages.notAdmin));
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
