# Deploy FeasibilityHub to Vercel

This project uses Next.js + Supabase.

## Before deploying

Run locally:

```powershell
cd D:\FeasibilityHub-Final-MVP\feasibilityhub
npm install
npm run verify:project
npm run typecheck
npm run build
```

## Recommended GitHub + Vercel flow

1. Create a private GitHub repository, for example `feasibilityhub`.
2. From the project directory:

```powershell
git init
git add .
git commit -m "Final MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/feasibilityhub.git
git push -u origin main
```

3. In Vercel: Add New -> Project -> Import the GitHub repository.
4. Framework should be detected as Next.js. Keep the default build settings.
5. Add the environment variables before the production deploy:

```text
NEXT_PUBLIC_SUPABASE_URL=https://outhowotpjwzsshurana.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
SUPABASE_SECRET_KEY=<your sb_secret key>
PLATFORM_ADMIN_EMAILS=nouralhudakilany@gmail.com
NEXT_PUBLIC_SITE_URL=https://YOUR-PROJECT.vercel.app
```

Never expose `SUPABASE_SECRET_KEY` through a `NEXT_PUBLIC_` variable.

## After the first Vercel deployment

Copy the final production URL, then update Vercel's `NEXT_PUBLIC_SITE_URL` to that exact `https://...vercel.app` URL and redeploy.

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL: `https://YOUR-PROJECT.vercel.app`
- Keep local redirect: `http://localhost:3000/**`
- Add production redirect: `https://YOUR-PROJECT.vercel.app/**`

For a final production setup, use exact production redirect paths where possible. If you enable Vercel preview deployments, add the Vercel preview wildcard documented by Supabase for your Vercel account/team.

## Production smoke test

Use a private/incognito window and test:

1. Home page.
2. Register and confirm email.
3. Login and logout.
4. Professor creates a course.
5. Student joins with the course code.
6. Student creates a group and invites another student.
7. Leader submits an idea.
8. Professor starts review -> student editing is locked.
9. Professor requests changes -> leader can edit and resubmit.
10. Professor approves.
11. Export CSV and Excel.

Only share the course with students after this flow passes on the production URL.
