create extension if not exists "pgcrypto";

create type public.user_role as enum ('parent', 'teacher', 'admin');
create type public.owner_type as enum ('student', 'teacher');
create type public.lesson_status as enum ('confirmed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'parent',
  full_name text,
  phone text,
  email text,
  timezone text not null default 'Asia/Shanghai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  grade text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  subject text,
  notes text,
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  owner_type public.owner_type not null,
  owner_id uuid not null,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_type, owner_id, slot_start),
  check (slot_end > slot_start)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  status public.lesson_status not null default 'confirmed',
  admin_note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slot_end > slot_start)
);

create unique index lessons_student_time_unique on public.lessons(student_id, slot_start) where status = 'confirmed';
create unique index lessons_teacher_time_unique on public.lessons(teacher_id, slot_start) where status = 'confirmed';
create index availability_owner_idx on public.availability_slots(owner_type, owner_id, slot_start);
create index lessons_time_idx on public.lessons(slot_start, slot_end);

create or replace view public.availability_matches
with (security_invoker = true)
as
select
  s.id as student_id,
  s.full_name as student_name,
  t.id as teacher_id,
  t.full_name as teacher_name,
  t.subject as teacher_subject,
  sa.slot_start,
  sa.slot_end
from public.availability_slots sa
join public.students s on s.id = sa.owner_id and sa.owner_type = 'student'
join public.availability_slots ta on ta.slot_start = sa.slot_start and ta.owner_type = 'teacher'
join public.teacher_profiles t on t.id = ta.owner_id
where not exists (
  select 1
  from public.lessons l
  where l.status = 'confirmed'
    and l.slot_start = sa.slot_start
    and (l.student_id = s.id or l.teacher_id = t.id)
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.lessons enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles read own or admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles upsert own" on public.profiles
for insert with check (id = auth.uid() and role <> 'admin');

create policy "profiles update own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid() and role <> 'admin');

create policy "admins manage profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create policy "parents manage own students" on public.students
for all using (parent_id = auth.uid() or public.is_admin())
with check (parent_id = auth.uid() or public.is_admin());

create policy "teachers manage own profile" on public.teacher_profiles
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "students availability by parent or admin" on public.availability_slots
for all using (
  public.is_admin()
  or exists (
    select 1 from public.students s
    where s.id = owner_id and owner_type = 'student' and s.parent_id = auth.uid()
  )
  or exists (
    select 1 from public.teacher_profiles t
    where t.id = owner_id and owner_type = 'teacher' and t.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.students s
    where s.id = owner_id and owner_type = 'student' and s.parent_id = auth.uid()
  )
  or exists (
    select 1 from public.teacher_profiles t
    where t.id = owner_id and owner_type = 'teacher' and t.user_id = auth.uid()
  )
);

create policy "lessons read relevant" on public.lessons
for select using (
  public.is_admin()
  or exists (select 1 from public.students s where s.id = student_id and s.parent_id = auth.uid())
  or exists (select 1 from public.teacher_profiles t where t.id = teacher_id and t.user_id = auth.uid())
);

create policy "admins manage lessons" on public.lessons
for all using (public.is_admin()) with check (public.is_admin());

create policy "admins read matches" on public.availability_slots
for select using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.availability_matches to authenticated;
