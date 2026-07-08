"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("students").insert({
    parent_id: user.id,
    full_name: String(formData.get("full_name") || "").trim(),
    grade: String(formData.get("grade") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  });
  revalidatePath("/parent");
}

export async function updateStudent(formData: FormData) {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  await supabase.from("students").update({
    full_name: String(formData.get("full_name") || "").trim(),
    grade: String(formData.get("grade") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  }).eq("id", id);
  revalidatePath("/parent");
}
