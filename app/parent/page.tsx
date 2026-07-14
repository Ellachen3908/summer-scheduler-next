export const runtime = "edge";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlot, Student } from "@/lib/types";
import { ParentPageClient } from "./ParentPageClient";

export default async function ParentPage({
  searchParams
}: {
  searchParams: { student?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: studentsData } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at");

  const students = (studentsData ?? []) as Student[];
  const selected = students.find(student => student.id === searchParams.student) || students[0];

  const { data: slotsData } = selected
    ? await supabase
        .from("availability_slots")
        .select("*")
        .eq("owner_type", "student")
        .eq("owner_id", selected.id)
    : { data: [] };

  return (
    <ParentPageClient
      userEmail={user.email || ""}
      initialStudents={students}
      initialSelectedId={selected?.id || ""}
      initialSlots={(slotsData ?? []) as AvailabilitySlot[]}
    />
  );
}
