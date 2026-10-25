import type { IdeaStatus } from "@/lib/types";
import { cn, statusLabel, statusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: IdeaStatus | "not_submitted" }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", statusTone(status))}>
      {statusLabel(status)}
    </span>
  );
}
