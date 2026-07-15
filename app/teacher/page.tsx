export const runtime = "edge";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlot, TeacherProfile } from "@/lib/types";
import { updateTeacherProfile } from "./actions";

export default async function TeacherPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?role=teacher");

  const { data: profile } = await supabase
    .from("teacher_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const teacher = profile as TeacherProfile | null;

  const { data: slots = [] } = teacher
    ? await supabase
        .from("availability_slots")
        .select("*")
        .eq("owner_type", "teacher")
        .eq("owner_id", teacher.id)
    : { data: [] };

  return (
    <AppShell
      title="Tutor Portal（老师端）"
      subtitle="UK tutors can update profile details and available teaching times.（英国老师填写资料和可上课时间。）"
    >
      <section className="panel">
        <form action={updateTeacherProfile} className="grid-form">
          <label>
            Name（姓名）
            <input
              name="full_name"
              defaultValue={teacher?.full_name || user.email?.split("@")[0] || ""}
              required
            />
          </label>

          <label>
            Subject（科目）
            <input
              name="subject"
              defaultValue={teacher?.subject || ""}
              placeholder="English Reading / Phonics（英语阅读 / 自然拼读）"
            />
          </label>

          <label className="wide">
            Notes（备注）
            <textarea name="notes" defaultValue={teacher?.notes || ""} />
          </label>

          <button className="primary" type="submit">
            Save Tutor Profile（保存老师资料）
          </button>
        </form>
      </section>

      {teacher ? (
        <AvailabilityPicker
          ownerType="teacher"
          ownerId={teacher.id}
          initialSlots={slots as AvailabilitySlot[]}
        />
      ) : (
        <section className="panel empty">
          Please save your tutor profile first, then update availability.
          （请先保存老师资料，再填写可上课时间。）
        </section>
      )}
    </AppShell>
  );
}
