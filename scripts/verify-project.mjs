import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const required = [
  "package.json",
  ".env.example",
  "README.md",
  "START_HERE.md",
  "EXCEL_REPLACEMENT.md",
  "proxy.ts",
  "supabase/migrations/0001_initial_schema.sql",
  "app/page.tsx",
  "app/dashboard/page.tsx",
  "app/preview/professor/page.tsx",
  "app/preview/professor/review/[id]/page.tsx",
  "app/preview/student/page.tsx",
  "app/preview/student/group/page.tsx",
  "app/preview/student/idea/page.tsx",
  "app/professor/dashboard/page.tsx",
  "app/professor/ideas/[id]/page.tsx",
  "app/student/dashboard/page.tsx",
  "app/student/group/page.tsx",
  "app/student/idea/page.tsx",
  "app/api/export/[courseId]/route.ts",
  "app/api/export-demo/route.ts",
  "lib/actions/courses.ts",
  "lib/actions/groups.ts",
  "lib/actions/ideas.ts",
  "lib/demo-state.ts",
];

let failed = false;
const fail = (message) => {
  console.error(`✗ ${message}`);
  failed = true;
};

for (const file of required) {
  if (!existsSync(join(root, file))) fail(`Missing required file: ${file}`);
}

const envPath = join(root, ".env.example");
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf8");
  if (/NEXT_PUBLIC_SUPABASE_(?:SERVICE|SECRET)/i.test(env)) {
    fail("Security error: privileged Supabase keys must never use NEXT_PUBLIC_.");
  }
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "PLATFORM_ADMIN_EMAILS",
    "NEXT_PUBLIC_SITE_URL",
  ]) {
    if (!env.includes(name)) fail(`.env.example is missing ${name}`);
  }
}

const migrationPath = join(root, "supabase/migrations/0001_initial_schema.sql");
if (existsSync(migrationPath)) {
  const migration = readFileSync(migrationPath, "utf8");
  const sqlChecks = [
    ["in-review workflow", /'in_review'/],
    ["course join code", /join_code\s+text\s+not null\s+unique/i],
    ["faculty course-creation capability", /can_create_courses\s+boolean/i],
    ["email-targeted group invitations", /invited_email\s+text/i],
    ["revision edit lock", /enforce_idea_revision_submission/i],
    ["RLS enabled", /enable row level security/i],
  ];
  for (const [label, pattern] of sqlChecks) {
    if (!pattern.test(migration)) fail(`Database migration is missing: ${label}`);
  }
}

const sourceExtensions = new Set([".ts", ".tsx", ".css", ".js", ".mjs"]);
const ignoredDirs = new Set(["node_modules", ".next", ".git"]);
const files = [];
const selfPath = join(root, "scripts/verify-project.mjs");
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const abs = join(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) walk(abs);
    else if (sourceExtensions.has(extname(entry)) && abs !== selfPath) files.push(abs);
  }
}
walk(root);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const name = relative(root, file);
  if (/gradient/i.test(content)) fail(`No-gradients rule violated in ${name}`);
  if (/href\s*=\s*["']#["']/.test(content)) fail(`Placeholder href="#" found in ${name}`);
}

const home = readFileSync(join(root, "app/page.tsx"), "utf8");
for (const idea of ["Tafaddal", "Masar", "CoCompass", "Farhatna"]) {
  if (!home.includes(idea)) fail(`Home showcase is missing ${idea}`);
}

const ideaActions = readFileSync(join(root, "lib/actions/ideas.ts"), "utf8");
for (const term of ["startReview", '"in_review"', '"changes_requested"', '"approved"']) {
  if (!ideaActions.includes(term)) fail(`Idea workflow is missing ${term}`);
}

const groupActions = readFileSync(join(root, "lib/actions/groups.ts"), "utf8");
for (const term of ["createGroupInvite", "addGroupMemberByEmail", "transferGroupLeadership", "joinGroup"]) {
  if (!groupActions.includes(term)) fail(`Group workflow is missing ${term}`);
}

if (failed) process.exit(1);
console.log("✓ FeasibilityHub Final MVP structure and product invariants look complete.");
