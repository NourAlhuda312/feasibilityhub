# START HERE — FeasibilityHub Final MVP

The project is designed to be reviewed in two stages:

1. **Final UI/UX + workflow preview** — no database required.
2. **Real Supabase setup** — authentication, PostgreSQL, RLS, real users and courses.

The ZIP you received is ready for stage 1. Do not create a fake Professor/Student selector at sign-in; course roles are resolved from membership after authentication.

## Stage 1 — Run the Final MVP preview

Requirements:
- Node.js 22.12+ (Node 22 LTS recommended)
- npm

From the project root:

```bash
npm install
npm run verify:project
npm run dev
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/preview/professor`
- `http://localhost:3000/preview/student`

The preview uses browser `localStorage`, so it does **not** need Supabase.

### Test the review lock

1. Professor preview → find **CoCompass** → **Start review**.
2. Student preview → Business Idea.
3. Confirm status is **In review** and editing is locked.
4. Professor review → **Request changes** and enter feedback.
5. Student Business Idea becomes editable again.
6. Resubmit; the revision number increases and status becomes **Submitted**.
7. Start review again → Approve.
8. Student now sees Approved and the idea remains locked.

### Test groups

Open `/preview/student/group`:
- add a demo member,
- generate/share a demo invitation link,
- transfer group leadership,
- remove a non-leader member,
- verify the three-member limit in the UI.

### Test exports

Professor preview → Export CSV / Export Excel.

These preview buttons download real demo files without a database.

---

# Stage 2 — Real Supabase setup

Do this only after the final UI/UX is accepted.

## 1. Create a Supabase project

Create a new Supabase project. Then run:

`supabase/migrations/0001_initial_schema.sql`

The migration creates:
- profiles and faculty course-creation capability,
- academic semesters,
- courses and unique join codes,
- course-scoped roles,
- course invitation links,
- groups, members, targeted/private group invitations,
- ideas, revisions and reviews,
- the Submitted → In review → Changes/Approved workflow,
- RLS policies and database constraints.

## 2. Configure Email + Password authentication

In Supabase Auth:
- Enable Email + Password.
- Keep email confirmation enabled.
- For local development set Site URL to `http://localhost:3000`.
- In **Auth → Email Templates → Confirm signup**, use:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## 3. Create `.env.local`

Copy `.env.example`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
PLATFORM_ADMIN_EMAILS=doctor@university.edu
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SECRET_KEY` is server-only. Never rename it to a `NEXT_PUBLIC_...` variable.

## 4. Create the first faculty account

1. Put the professor/coordinator email in `PLATFORM_ADMIN_EMAILS` for bootstrap.
2. Register that same email at `/register`.
3. Confirm the email.
4. Sign in.

There is **no Professor/Student choice during sign-in**.

The allowlist only grants permission to create courses. When that user creates a course, they receive the `Professor` role **for that course**.

Later, you can set `profiles.can_create_courses = true` for additional authorized faculty and stop relying on the bootstrap environment allowlist.

## 5. Professor creates the first course

Open `/dashboard` → **Create a new course**.

Example:
- Code: `BFS-301`
- Title: `Business Feasibility Study`
- Semester: `Fall`
- Year: `2026`

The system generates a unique join code.

## 6. Students join the course

Two supported flows:

### Option A — Course code
Student signs in → `/dashboard` → enters the course join code.

### Option B — Invitation link
Professor/Admin → Course Settings → Generate invitation → share link.

Both create a `Student` membership for that course only.

## 7. Students create teams

Student → My Group:

1. First student clicks **Create group** and becomes initial leader.
2. Leader can either:
   - add an already-enrolled student by email, or
   - generate a private group invite link and share it.
3. Maximum 3 members.
4. Leader may transfer leadership to another member at any time.
5. A student may belong to only one group in the same course.

## 8. Submit and review the business idea

Leader submits:
- Name of the idea
- Quick description

Workflow:

```text
Submitted
  ↓ professor/assistant clicks Start review
In review (student edit lock)
  ├─ Approve → Approved
  └─ Request changes → editable again → resubmit
```

Every resubmission creates a new revision rather than overwriting history.

## 9. Add course staff

Professor/Admin → Course Team.

The staff member creates a FeasibilityHub account first. Then add their email as:
- Professor
- Admin
- Assistant

The role is limited to that course. The same account can still be a Student elsewhere.

## 10. Export Excel / CSV

Professor Dashboard or Settings → Export.

Columns:
- Group Number
- Group Members
- Name of the Idea
- Quick Description
- Status

## 11. Verify before real student use

Run:

```bash
npm run verify:project
npm run typecheck
npm run build
```

Then go through the acceptance checklist in `README.md` with at least:
- one professor,
- one assistant,
- three student test accounts,
- one group,
- one idea going through the full review/change/approval cycle.

## 12. Deployment

Recommended path:
- push the project to a private GitHub repository,
- import to Vercel,
- add production environment variables,
- set `NEXT_PUBLIC_SITE_URL` to the production URL,
- add the production callback URL in Supabase Auth.

## Current project bootstrap (configured)

For the current Supabase project, `nouralhudakilany@gmail.com` has been enabled as a bootstrap course creator. This does **not** make the account a global Professor; creating a course assigns the `professor` role only inside that course.

The final local setup still requires the server-only `SUPABASE_SECRET_KEY` in `.env.local`. Obtain it from Supabase **Settings → API Keys → Secret keys**. Never expose that value in a `NEXT_PUBLIC_` variable or commit it to Git.
