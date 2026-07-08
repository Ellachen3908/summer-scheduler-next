export type Role = "parent" | "teacher" | "admin";
export type OwnerType = "student" | "teacher";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
};

export type Student = {
  id: string;
  parent_id: string;
  full_name: string;
  grade: string | null;
  notes: string | null;
};

export type TeacherProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  subject: string | null;
  notes: string | null;
  timezone: string;
};

export type AvailabilitySlot = {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  slot_start: string;
  slot_end: string;
};

export type MatchRow = {
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  teacher_subject: string | null;
  slot_start: string;
  slot_end: string;
};

export type Lesson = {
  id: string;
  student_id: string;
  teacher_id: string;
  slot_start: string;
  slot_end: string;
  status: "confirmed" | "cancelled";
  admin_note: string | null;
  created_at: string;
};
