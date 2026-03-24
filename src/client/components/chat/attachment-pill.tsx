"use client";

import { FileText, ImagePlus, X } from "lucide-react";
import type { AttachmentRecord } from "@/types/chat";

export function AttachmentPill({
  item,
  onRemove,
}: {
  item: AttachmentRecord;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border bg-[var(--app-surface-subtle)] px-3 py-2 text-sm text-[var(--app-text)] [border-color:var(--app-border)]">
      {item.kind === "image" ? <ImagePlus className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      <span className="max-w-40 truncate">{item.filename}</span>
      <button
        type="button"
        className="rounded-full p-1 text-[var(--app-muted)] transition hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
        onClick={() => onRemove(item.id)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
