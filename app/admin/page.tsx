import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminExport } from "@/components/AdminExport";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/time";
import type { Lesson, MatchRow, Student, TeacherProfile } from "@/lib/types";
import { cancelLesson, confirmLesson } from "./actions";

export default async function AdminPage({
  searchParams
}: {
  searchParams: { student?: string; teacher?: string; date?: string; error?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/login?error=需要管理员权限");

  const [{ data: students = [] }, { data: teachers = [] }, { data: lessons = [] }, { data: matches = [] }] = await Promise.all([
    supabase.from("students").select("*").order("full_name"),
    supabase.from("teacher_profiles").select("*").order("full_name"),
    supabase.from("lessons").select("*").neq("status", "cancelled").order("slot_start"),
    supabase.from("availability_matches").select("*").order("slot_start")
  ]);

  const filteredMatches = (matches as MatchRow[]).filter(match => {
    if (searchParams.student && match.student_id !== searchParams.student) return false;
    if (searchParams.teacher && match.teacher_id !== searchParams.teacher) return false;
    if (searchParams.date) {
      const iso = new Date(match.slot_start).toISOString().slice(0, 10);
      if (iso !== searchParams.date) return false;
    }
    return true;
  });

  return (
    <AppShell title="管理后台" subtitle="自动匹配共同空闲时间，一键确认课程并导出 Excel">
      <div className="stack">
        <section className="stats">
          <div className="stat"><strong>{students.length}</strong><span>学生</span></div>
          <div className="stat"><strong>{teachers.length}</strong><span>老师</span></div>
          <div className="stat"><strong>{lessons.length}</strong><span>已确认课程</span></div>
          <div className="stat"><strong>{filteredMatches.length}</strong><span>可匹配时间</span></div>
        </section>

        {searchParams.error && <div className="alert">{searchParams.error}</div>}

        <section className="panel padded">
          <form className="filters">
            <label>学生
              <select name="student" defaultValue={searchParams.student || ""}>
                <option value="">全部学生</option>
                {(students as Student[]).map(student => <option value={student.id} key={student.id}>{student.full_name}</option>)}
              </select>
            </label>
            <label>老师
              <select name="teacher" defaultValue={searchParams.teacher || ""}>
                <option value="">全部老师</option>
                {(teachers as TeacherProfile[]).map(teacher => <option value={teacher.id} key={teacher.id}>{teacher.full_name}</option>)}
              </select>
            </label>
            <label>日期<input type="date" name="date" defaultValue={searchParams.date || ""} /></label>
            <button>筛选</button>
            <a className="button" href="/admin">清空</a>
            <AdminExport matches={filteredMatches} lessons={lessons as Lesson[]} students={students as Student[]} teachers={teachers as TeacherProfile[]} />
          </form>
        </section>

        <section className="panel">
          <div className="panel-title padded-title"><h2>可匹配时间</h2><span>学生和老师都空闲</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>日期</th><th>时间</th><th>学生</th><th>老师</th><th>科目</th><th>操作</th></tr></thead>
              <tbody>
                {filteredMatches.map(match => {
                  const start = formatDateTime(match.slot_start);
                  const end = formatDateTime(match.slot_end);
                  return (
                    <tr key={`${match.student_id}-${match.teacher_id}-${match.slot_start}`}>
                      <td>{start.date}</td>
                      <td>{start.time}-{end.time}</td>
                      <td>{match.student_name}</td>
                      <td>{match.teacher_name}</td>
                      <td>{match.teacher_subject || "-"}</td>
                      <td>
                        <form action={confirmLesson}>
                          <input type="hidden" name="student_id" value={match.student_id} />
                          <input type="hidden" name="teacher_id" value={match.teacher_id} />
                          <input type="hidden" name="slot_start" value={match.slot_start} />
                          <input type="hidden" name="slot_end" value={match.slot_end} />
                          <button className="success">确认课程</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {!filteredMatches.length && <tr><td colSpan={6} className="empty">暂无匹配结果</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title padded-title"><h2>已确认课程</h2><span>可取消后重新安排</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>日期</th><th>时间</th><th>学生</th><th>老师</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {(lessons as Lesson[]).map(lesson => {
                  const student = (students as Student[]).find(item => item.id === lesson.student_id);
                  const teacher = (teachers as TeacherProfile[]).find(item => item.id === lesson.teacher_id);
                  const start = formatDateTime(lesson.slot_start);
                  const end = formatDateTime(lesson.slot_end);
                  return (
                    <tr key={lesson.id}>
                      <td>{start.date}</td>
                      <td>{start.time}-{end.time}</td>
                      <td>{student?.full_name}</td>
                      <td>{teacher?.full_name}</td>
                      <td><span className="badge">已确认</span></td>
                      <td>
                        <form action={cancelLesson}>
                          <input type="hidden" name="lesson_id" value={lesson.id} />
                          <button>取消</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {!lessons.length && <tr><td colSpan={6} className="empty">暂无已确认课程</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
