create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;

create index if not exists course_invites_created_by_idx on public.course_invites(created_by);
create index if not exists courses_owner_idx on public.courses(owner_id);
create index if not exists group_invites_created_by_idx on public.group_invites(created_by);
create index if not exists group_members_group_course_idx on public.group_members(group_id, course_id);
create index if not exists idea_reviews_reviewer_idx on public.idea_reviews(reviewer_id);
create index if not exists idea_reviews_revision_idx on public.idea_reviews(revision_id);
create index if not exists idea_revisions_submitted_by_idx on public.idea_revisions(submitted_by);
