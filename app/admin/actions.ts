"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/login?error=需要管理员权限");
  return { supabase, user };
}

export async function confirmLesson(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const studentId = String(formData.get("student_id"));
  const teacherId = String(formData.get("teacher_id"));
  const slotStart = String(formData.get("slot_start"));
  const slotEnd = String(formData.get("slot_end"));
  const { data: existing } = await supabase
    .from("lessons")
    .select("id")
    .eq("status", "confirmed")
    .eq("slot_start", slotStart)
    .or(`student_id.eq.${studentId},teacher_id.eq.${teacherId}`);
  if (existing?.length) {
    redirect("/admin?error=该学生或老师在这个时间已有课程");
  }
  await supabase.from("lessons").insert({
    student_id: studentId,
    teacher_id: teacherId,
    slot_start: slotStart,
    slot_end: slotEnd,
    status: "confirmed",
    created_by: user.id
  });
  revalidatePath("/admin");
}

export async function cancelLesson(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("lessons").update({ status: "cancelled" }).eq("id", String(formData.get("lesson_id")));
  revalidatePath("/admin");
}
