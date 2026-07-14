"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";
import { createClient } from "@/lib/supabase/client";
import type { AvailabilitySlot, Student } from "@/lib/types";

export function ParentPageClient({
  userEmail,
  initialStudents,
  initialSelectedId,
  initialSlots
}: {
  userEmail: string;
  initialStudents: Student[];
  initialSelectedId: string;
  initialSlots: AvailabilitySlot[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [slots, setSlots] = useState(initialSlots);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = students.find(student => student.id === selectedId) || students[0];

  async function loadSlots(studentId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("owner_type", "student")
      .eq("owner_id", studentId);

    setSlots((data ?? []) as AvailabilitySlot[]);
  }

  async function chooseStudent(studentId: string) {
    setSelectedId(studentId);
    await loadSlots(studentId);
  }

  async function saveStudent(formData: FormData) {
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("登录已过期，请退出后重新登录");
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      role: "parent",
      email: userEmail || user.email,
      full_name: (userEmail || user.email || "Parent").split("@")[0],
      timezone: "Asia/Shanghai"
    });

    if (profileError) {
      setMessage(profileError.message);
      setSaving(false);
      return;
    }

    const fullName = String(formData.get("full_name") || "").trim();
    const grade = String(formData.get("grade") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!fullName) {
      setMessage("请填写孩子姓名");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .insert({
        parent_id: user.id,
        full_name: fullName,
        grade,
        notes
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    const newStudent = data as Student;
    setStudents(prev => [...prev, newStudent]);
    setSelectedId(newStudent.id);
    setSlots([]);
    setMessage("孩子已保存");
    setSaving(false);
  }

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
              <button
                type="button"
                className={`item ${student.id === selected?.id ? "active" : ""}`}
                onClick={() => chooseStudent(student.id)}
                key={student.id}
              >
                <strong>{student.full_name}</strong>
                <span>{student.grade || "未填写年级"}</span>
              </button>
            ))}
          </div>

          <form action={saveStudent} className="stack add-form">
            <h3><Plus size={16} /> 新增孩子</h3>
            <label>姓名<input name="full_name" required /></label>
            <label>年级<input name="grade" placeholder="G4 / 四年级" /></label>
            <label>特殊情况<textarea name="notes" /></label>
            <button className="primary" disabled={saving}>
              {saving ? "保存中..." : "保存孩子"}
            </button>
            {message && <p className="status-text">{message}</p>}
          </form>
        </aside>

        <section className="stack">
          {selected ? (
            <>
              <div className="panel padded">
                <h2>{selected.full_name}</h2>
                <p className="muted">{selected.grade || "未填写年级"}</p>
                {selected.notes && <p>{selected.notes}</p>}
              </div>
              <AvailabilityPicker
                key={selected.id}
                ownerType="student"
                ownerId={selected.id}
                initialSlots={slots}
              />
            </>
          ) : (
            <div className="panel padded empty">请先新增一个孩子。</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
