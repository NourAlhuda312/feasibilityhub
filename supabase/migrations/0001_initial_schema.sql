-- FeasibilityHub MVP schema
-- Run this in Supabase SQL Editor for the first setup, or apply it through the Supabase CLI.
-- All public tables have RLS enabled. Authorization is course-scoped.

create extension if not exists pgcrypto;
create schema if not exists private;

create type public.course_role as enum ('professor', 'admin', 'assistant', 'student');
create type public.course_status as enum ('active', 'archived');
create type public.idea_status as enum ('draft', 'submitted', 'in_review', 'changes_requested', 'approved');
create type public.review_decision as enum ('approve', 'request_changes');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  can_create_courses boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_lower_uidx on public.profiles (lower(email));

create table public.academic_semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  term text not null check (term in ('Fall', 'Spring', 'Summer')),
  year integer not null check (year between 2020 and 2100),
  created_at timestamptz not null default now(),
  unique (term, year)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  semester_id uuid not null references public.academic_semesters(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  status public.course_status not null default 'active',
  join_code text not null unique check (char_length(join_code) between 6 and 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (semester_id, code)
);

create table public.course_memberships (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.course_role not null,
  joined_at timestamptz not null default now(),
  primary key (course_id, user_id)
);
create index course_memberships_user_idx on public.course_memberships(user_id);
create index course_memberships_course_role_idx on public.course_memberships(course_id, role);

create table public.course_invites (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index course_invites_course_idx on public.course_invites(course_id);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  group_number integer not null,
  leader_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (course_id, group_number),
  unique (id, course_id)
);
create index groups_course_idx on public.groups(course_id);
create index groups_leader_idx on public.groups(leader_id);

create table public.group_members (
  group_id uuid not null,
  course_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id),
  unique (course_id, user_id),
  foreign key (group_id, course_id) references public.groups(id, course_id) on delete cascade
);
create index group_members_user_idx on public.group_members(user_id);
create index group_members_course_idx on public.group_members(course_id);

create table public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  invited_email text,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index group_invites_group_idx on public.group_invites(group_id);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null unique references public.groups(id) on delete cascade,
  status public.idea_status not null default 'draft',
  current_revision integer not null default 0 check (current_revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idea_revisions (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  title text not null check (char_length(title) between 2 and 160),
  quick_description text not null check (char_length(quick_description) between 20 and 3000),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (idea_id, revision_number)
);
create index idea_revisions_idea_idx on public.idea_revisions(idea_id, revision_number desc);

create table public.idea_reviews (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  revision_id uuid not null references public.idea_revisions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  decision public.review_decision not null,
  feedback text,
  created_at timestamptz not null default now(),
  constraint feedback_required_for_changes check (
    decision <> 'request_changes' or (feedback is not null and char_length(trim(feedback)) >= 3)
  )
);
create index idea_reviews_idea_idx on public.idea_reviews(idea_id, created_at desc);

-- ---------- Internal helpers ----------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, 'User'), '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.handle_new_user();

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function private.touch_updated_at();
create trigger courses_touch_updated_at before update on public.courses for each row execute function private.touch_updated_at();
create trigger ideas_touch_updated_at before update on public.ideas for each row execute function private.touch_updated_at();

create or replace function private.assign_group_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.course_id::text, 0));
  select coalesce(max(g.group_number), 0) + 1
    into new.group_number
    from public.groups g
    where g.course_id = new.course_id;
  return new;
end;
$$;
revoke all on function private.assign_group_number() from public, anon, authenticated;

create trigger groups_assign_number before insert on public.groups for each row execute function private.assign_group_number();

create or replace function private.enforce_group_size()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare member_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.group_id::text, 1));
  if not exists (
    select 1 from public.groups g where g.id = new.group_id and g.course_id = new.course_id
  ) then
    raise exception 'Group does not belong to the selected course';
  end if;
  select count(*) into member_count from public.group_members gm where gm.group_id = new.group_id;
  if member_count >= 3 then
    raise exception 'A group can contain a maximum of 3 students';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_group_size() from public, anon, authenticated;

create trigger group_members_limit before insert on public.group_members for each row execute function private.enforce_group_size();

-- Defense in depth: even privileged server actions cannot create a new student revision
-- after course staff has started reviewing or approved the current idea.
create or replace function private.enforce_idea_revision_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.idea_status;
  current_leader uuid;
begin
  select i.status, g.leader_id
    into current_status, current_leader
    from public.ideas i
    join public.groups g on g.id = i.group_id
    where i.id = new.idea_id;

  if current_status not in ('draft','submitted','changes_requested') then
    raise exception 'Idea editing is locked while under review or after approval';
  end if;
  if new.submitted_by <> current_leader then
    raise exception 'Only the current group leader can submit an idea revision';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_idea_revision_submission() from public, anon, authenticated;
create trigger idea_revisions_editable before insert on public.idea_revisions for each row execute function private.enforce_idea_revision_submission();

create or replace function private.current_course_role(target_course uuid)
returns public.course_role
language sql
stable
security definer
set search_path = public
as $$
  select cm.role
  from public.course_memberships cm
  where cm.course_id = target_course
    and cm.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function private.is_course_staff(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.current_course_role(target_course) in ('professor','admin','assistant'), false);
$$;

create or replace function private.is_course_manager(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.current_course_role(target_course) in ('professor','admin'), false);
$$;

create or replace function private.is_group_member(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = target_group and gm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_group_leader(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups g
    where g.id = target_group and g.leader_id = (select auth.uid())
  );
$$;

create or replace function private.can_view_profile(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_user = (select auth.uid())
    or exists (
      select 1
      from public.group_members me
      join public.group_members other_member on other_member.group_id = me.group_id
      where me.user_id = (select auth.uid()) and other_member.user_id = target_user
    )
    or exists (
      select 1
      from public.course_memberships staff
      join public.course_memberships target on target.course_id = staff.course_id
      where staff.user_id = (select auth.uid())
        and staff.role in ('professor','admin','assistant')
        and target.user_id = target_user
    );
$$;

revoke all on function private.current_course_role(uuid) from public;
revoke all on function private.is_course_staff(uuid) from public;
revoke all on function private.is_course_manager(uuid) from public;
revoke all on function private.is_group_member(uuid) from public;
revoke all on function private.is_group_leader(uuid) from public;
revoke all on function private.can_view_profile(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.current_course_role(uuid) to authenticated;
grant execute on function private.is_course_staff(uuid) to authenticated;
grant execute on function private.is_course_manager(uuid) to authenticated;
grant execute on function private.is_group_member(uuid) to authenticated;
grant execute on function private.is_group_leader(uuid) to authenticated;
grant execute on function private.can_view_profile(uuid) to authenticated;

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.academic_semesters enable row level security;
alter table public.courses enable row level security;
alter table public.course_memberships enable row level security;
alter table public.course_invites enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_revisions enable row level security;
alter table public.idea_reviews enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (private.can_view_profile(id));
create policy semesters_select on public.academic_semesters for select to authenticated using (true);

create policy courses_select on public.courses for select to authenticated
using (private.current_course_role(id) is not null);

create policy course_memberships_select on public.course_memberships for select to authenticated
using (user_id = (select auth.uid()) or private.is_course_staff(course_id));

create policy course_invites_select on public.course_invites for select to authenticated
using (private.is_course_manager(course_id));
create policy course_invites_insert on public.course_invites for insert to authenticated
with check (private.is_course_manager(course_id) and created_by = (select auth.uid()));
create policy course_invites_update on public.course_invites for update to authenticated
using (private.is_course_manager(course_id))
with check (private.is_course_manager(course_id));

create policy groups_select on public.groups for select to authenticated
using (private.is_course_staff(course_id) or private.is_group_member(id));
create policy groups_insert on public.groups for insert to authenticated
with check (private.current_course_role(course_id) = 'student' and leader_id = (select auth.uid()));
create policy groups_update on public.groups for update to authenticated
using (private.is_course_manager(course_id) or private.is_group_leader(id))
with check (private.is_course_manager(course_id) or leader_id = (select auth.uid()));
create policy groups_delete on public.groups for delete to authenticated
using (private.is_course_manager(course_id));

create policy group_members_select on public.group_members for select to authenticated
using (private.is_course_staff(course_id) or private.is_group_member(group_id));
create policy group_members_insert on public.group_members for insert to authenticated
with check (
  (user_id = (select auth.uid()) and private.is_group_leader(group_id))
  or private.is_course_manager(course_id)
);

create policy group_invites_select on public.group_invites for select to authenticated
using (
  private.is_group_leader(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and private.is_course_manager(g.course_id))
);
create policy group_invites_insert on public.group_invites for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    private.is_group_leader(group_id)
    or exists (select 1 from public.groups g where g.id = group_id and private.is_course_manager(g.course_id))
  )
);
create policy group_invites_update on public.group_invites for update to authenticated
using (
  private.is_group_leader(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and private.is_course_manager(g.course_id))
)
with check (
  private.is_group_leader(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and private.is_course_manager(g.course_id))
);

create policy ideas_select on public.ideas for select to authenticated
using (
  private.is_group_member(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and private.is_course_staff(g.course_id))
);
create policy ideas_insert on public.ideas for insert to authenticated
with check (private.is_group_leader(group_id) and status in ('draft','submitted'));
create policy ideas_update_leader on public.ideas for update to authenticated
using (private.is_group_leader(group_id) and status in ('draft','submitted','changes_requested'))
with check (private.is_group_leader(group_id) and status in ('draft','submitted','changes_requested'));

create policy idea_revisions_select on public.idea_revisions for select to authenticated
using (
  exists (
    select 1 from public.ideas i
    join public.groups g on g.id = i.group_id
    where i.id = idea_id
      and (private.is_group_member(g.id) or private.is_course_staff(g.course_id))
  )
);
create policy idea_revisions_insert on public.idea_revisions for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and exists (
    select 1 from public.ideas i where i.id = idea_id and private.is_group_leader(i.group_id)
  )
);

create policy idea_reviews_select on public.idea_reviews for select to authenticated
using (
  exists (
    select 1 from public.ideas i
    join public.groups g on g.id = i.group_id
    where i.id = idea_id
      and (private.is_group_member(g.id) or private.is_course_staff(g.course_id))
  )
);
create policy idea_reviews_insert on public.idea_reviews for insert to authenticated
with check (
  reviewer_id = (select auth.uid())
  and exists (
    select 1 from public.ideas i
    join public.groups g on g.id = i.group_id
    where i.id = idea_id and private.is_course_staff(g.course_id)
  )
);

-- Explicit grants for Supabase Data API access. RLS remains the authorization boundary.
grant select on public.profiles to authenticated;
grant select on public.academic_semesters to authenticated;
grant select on public.courses to authenticated;
grant select on public.course_memberships to authenticated;
grant select, insert, update on public.course_invites to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert on public.group_members to authenticated;
grant select, insert, update on public.group_invites to authenticated;
grant select, insert, update on public.ideas to authenticated;
grant select, insert on public.idea_revisions to authenticated;
grant select, insert on public.idea_reviews to authenticated;
