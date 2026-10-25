"use client";

import { useRef, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

function PendingFields({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return <fieldset disabled={pending} aria-busy={pending} className="pending-fields">
    {children}
    {pending && <span role="status" className="mt-3 block text-xs font-bold">Saving…</span>}
  </fieldset>;
}

export function ActionForm({ children, action, ...props }: ComponentProps<"form">) {
  const submitting = useRef(false);
  const guardedAction = typeof action === "function" ? async (data: FormData) => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await action(data);
    } finally {
      submitting.current = false;
    }
  } : action;
  return <form {...props} action={guardedAction}><PendingFields>{children}</PendingFields></form>;
}
