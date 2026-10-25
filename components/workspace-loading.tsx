export function WorkspaceLoading() {
  return <main className="mx-auto max-w-7xl p-5 sm:p-8" role="status" aria-label="Loading workspace">
    <div className="animate-pulse motion-reduce:animate-none" aria-hidden="true">
      <div className="h-5 w-32 rounded bg-emerald-950/10" />
      <div className="mt-5 h-10 w-64 rounded bg-emerald-950/10" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">{[1, 2, 3].map((card) => <div key={card} className="h-32 rounded-3xl bg-white" />)}</div>
      <div className="mt-6 h-80 rounded-3xl bg-white" />
    </div>
    <span className="sr-only">Loading workspace…</span>
  </main>;
}
