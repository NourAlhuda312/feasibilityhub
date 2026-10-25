"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-black">Something went wrong</h1><p className="mt-3 text-sm text-stone-600">We couldn’t complete this request. Check your connection and try again.</p><button onClick={reset} className="primary-button mt-5 rounded-2xl px-5 py-3 font-bold">Try again</button></main>;
}
