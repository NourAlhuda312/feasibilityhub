# Production workspace UX

Student and professor layouts subscribe to `ideas`, `idea_reviews`,
`idea_revisions`, `groups`, and `group_members` using the signed-in browser
client. Existing SELECT policies govern record delivery. No service key is
included in the browser and no role or RLS policies are changed.

Events are coalesced for 400 ms before refreshing server components. Refreshes
wait for active submissions, pause in hidden tabs, and resume on focus,
reconnection, or returning online. A disconnected channel falls back to a
30-second refresh while the page is visible. DELETE events are intentionally
unfiltered because Supabase cannot filter them; payloads are never rendered.

Action forms disable their controls while pending and guard duplicate action
execution. Existing server authorization remains authoritative. Redirect
messages appear as dismissible notifications; URL notices are consumed so
background refreshes do not replay old messages. Clipboard copying is the only
optimistic operation, with explicit failure feedback. Membership, leadership,
and review decisions wait for server confirmation.

The hosted migration `20261025163633_enable_workspace_realtime.sql` enables
publication only; it does not alter tables or policies. Apply the same migration
when setting up another environment. Keep `NEXT_PUBLIC_SITE_URL` equal to the
production origin in Vercel and redeploy after changing it.

Verification: run `npm run typecheck` and `npm run build`. For acceptance, use two
signed-in browsers (student and professor): submit an idea, start review, request
changes with feedback, resubmit, start review again, and approve. Observe status,
feedback, edit locks, and revision changes without reloading either browser.
Then add/remove a member and transfer leadership; check both group views and
the professor dashboard. Check disabled controls during slow submissions,
toast dismissal, clipboard failure, reconnection, and keyboard navigation.
