"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getCurrentParent() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    role: "parent",
    email: user.email,
    full_name: user.email?.split("@")[0] || "Parent",
    timezone: "Asia/Shanghai"
  });

  if (profileError) {
    redirect(`/parent?error=${encodeURIComponent(profileError.message)}`);
  }

  return { supabase, user };
}

export async function addStudent(formData: FormData) {
  const { supabase, user } = await getCurrentParent();

  const fullName = String(formData.get("full_name") || "").trim();
  const grade = String(formData.get("grade") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName) {
    redirect("/parent?error=请填写孩子姓名");
  }

  const { error } = await supabase.from("students").insert({
    parent_id: user.id,
    full_name: fullName,
    grade,
    notes
  });

  if (error) {
    redirect(`/parent?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/parent?saved=1");
}

export async function updateStudent(formData: FormData) {
  const { supabase } = await getCurrentParent();

  const id = String(formData.get("id") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const grade = String(formData.get("grade") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!id || !fullName) {
    redirect("/parent?error=缺少孩子信息");
  }

  const { error } = await supabase
    .from("students")
    .update({
      full_name: fullName,
      grade,
      notes
    })
    .eq("id", id);

  if (error) {
    redirect(`/parent?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/parent?student=${id}&saved=1`);
}
