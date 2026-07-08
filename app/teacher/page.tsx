import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlot, TeacherProfile } from "@/lib/types";
import { updateTeacherProfile } from "./actions";

export default async function TeacherPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?tab=teacher");

  const { data: profile } = await supabase.from("teacher_profiles").select("*").eq("user_id", user.id).single();
  const teacher = profile as TeacherProfile | null;
  const { data: slots = [] } = teacher
    ? await supabase.from("availability_slots").select("*").eq("owner_type", "teacher").eq("owner_id", teacher.id)
    : { data: [] };

  return (
    <AppShell title="老师端" subtitle="英国老师使用邮箱登录并填写可上课时间">
      <div className="stack">
        <section className="panel padded">
          <form action={updateTeacherProfile} className="profile-form">
            <label>姓名<input name="full_name" defaultValue={teacher?.full_name || user.email || ""} /></label>
            <label>科目<input name="subject" defaultValue={teacher?.subject || ""} placeholder="英语阅读 / 自然拼读" /></label>
            <label className="wide">备注<textarea name="notes" defaultValue={teacher?.notes || ""} /></label>
            <button className="primary">保存老师资料</button>
          </form>
        </section>

        {teacher ? (
          <AvailabilityPicker ownerType="teacher" ownerId={teacher.id} initialSlots={slots as AvailabilitySlot[]} />
        ) : (
          <div className="panel padded empty">请先保存老师资料，再填写可上课时间。</div>
        )}
      </div>
    </AppShell>
  );
}
