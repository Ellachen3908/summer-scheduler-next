import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlot, Student } from "@/lib/types";
import { addStudent, updateStudent } from "./actions";

export default async function ParentPage({
  searchParams
}: {
  searchParams: { student?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studentsData } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at");

  const students = (studentsData ?? []) as Student[];
  const selected = students.find(student => student.id === searchParams.student) || students[0];

  const { data: slotsData } = selected
    ? await supabase.from("availability_slots").select("*").eq("owner_type", "student").eq("owner_id", selected.id)
    : { data: [] };

  const slots = (slotsData ?? []) as AvailabilitySlot[];

  return (
    <AppShell title="家长端" subtitle="为每个孩子填写未来 8 周可补课时间">
      <div className="two-column">
        <aside className="panel side-panel">
          <div className="panel-title">
            <h2>孩子列表</h2>
            <span>{students.length} 个孩子</span>
          </div>

          <div className="item-list">
            {students.map(student => (
              <a className={`item ${student.id === selected?.id ? "active" : ""}`} href={`/parent?student=${student.id}`} key={student.id}>
                <strong>{student.full_name}</strong>
                <span>{student.grade || "未填写年级"}</span>
              </a>
            ))}
          </div>

          <form action={addStudent} className="stack add-form">
            <h3><Plus size={16} /> 新增孩子</h3>
            <label>姓名<input name="full_name" required /></label>
            <label>年级<input name="grade" placeholder="G4 / 四年级" /></label>
            <label>特殊情况<textarea name="notes" /></label>
            <button className="primary">保存孩子</button>
          </form>
        </aside>

        <section className="stack">
          {selected ? (
            <>
              <div className="panel padded">
                <form action={updateStudent} className="profile-form">
                  <input type="hidden" name="id" value={selected.id} />
                  <label>孩子姓名<input name="full_name" defaultValue={selected.full_name} /></label>
                  <label>年级<input name="grade" defaultValue={selected.grade || ""} /></label>
                  <label className="wide">特殊情况备注<textarea name="notes" defaultValue={selected.notes || ""} /></label>
                  <button className="primary">保存资料</button>
                </form>
              </div>
              <AvailabilityPicker ownerType="student" ownerId={selected.id} initialSlots={slots} />
            </>
          ) : (
            <div className="panel padded empty">请先新增一个孩子。</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
