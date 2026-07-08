"use client";

import { Download } from "lucide-react";
import type { Lesson, MatchRow, Student, TeacherProfile } from "@/lib/types";
import { formatDateTime } from "@/lib/time";

export function AdminExport({
  matches,
  lessons,
  students,
  teachers
}: {
  matches: MatchRow[];
  lessons: Lesson[];
  students: Student[];
  teachers: TeacherProfile[];
}) {
  async function exportExcel() {
    const XLSX = await import("xlsx");
    const lessonRows = lessons.map(lesson => {
      const student = students.find(item => item.id === lesson.student_id);
      const teacher = teachers.find(item => item.id === lesson.teacher_id);
      const start = formatDateTime(lesson.slot_start);
      const end = formatDateTime(lesson.slot_end);
      return {
        日期: start.date,
        开始时间: start.time,
        结束时间: end.time,
        学生: student?.full_name || "",
        老师: teacher?.full_name || "",
        状态: lesson.status === "confirmed" ? "已确认" : "已取消"
      };
    });
    const matchRows = matches.map(match => {
      const start = formatDateTime(match.slot_start);
      const end = formatDateTime(match.slot_end);
      return {
        日期: start.date,
        开始时间: start.time,
        结束时间: end.time,
        学生: match.student_name,
        老师: match.teacher_name,
        科目: match.teacher_subject || ""
      };
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matchRows), "可匹配时间");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(lessonRows), "已排课程");
    XLSX.writeFile(workbook, "暑期排课导出.xlsx");
  }

  return (
    <button className="primary" onClick={exportExcel}>
      <Download size={16} /> 导出Excel
    </button>
  );
}
