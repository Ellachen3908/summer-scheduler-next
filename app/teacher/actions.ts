"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateTeacherProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("teacher_profiles").upsert({
    user_id: user.id,
    full_name: String(formData.get("full_name") || "").trim(),
    email: user.email,
    subject: String(formData.get("subject") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    timezone: "Europe/London"
  }, { onConflict: "user_id" });
  revalidatePath("/teacher");
}
