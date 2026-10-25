# Dependencies

Runtime and framework dependencies are pinned in `package.json`.

Recommended local environment:
- Node.js 22.12+
- npm compatible with Node 22

Main libraries:
- Next.js / React
- TypeScript
- Tailwind CSS
- `@supabase/supabase-js`
- `@supabase/ssr`
- `exceljs-community`

After the first successful local install, keep the generated `package-lock.json` in version control so future installs are reproducible.

Security rule: browser code uses only the Supabase publishable key. The privileged Supabase secret remains server-only.
