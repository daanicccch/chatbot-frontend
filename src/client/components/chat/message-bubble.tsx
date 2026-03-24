"use client";

import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/client/components/ui/badge";
import { cn } from "@/client/lib/cn";
import type { ChatMessage } from "@/types/chat";

function formatRole(role: ChatMessage["role"]) {
  return role === "assistant" ? "GPT Chatbot" : "You";
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className={cn("flex gap-4", isAssistant ? "items-start" : "justify-end")}>
        {isAssistant ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-[var(--app-surface-subtle)] text-xs font-semibold text-[var(--app-text)] [border-color:var(--app-border)]">
            G
          </div>
        ) : null}

        <div
          className={cn(
            "min-w-0",
            isAssistant
              ? "flex-1 py-1"
              : "max-w-[85%] rounded-[28px] bg-[var(--app-user-bubble)] px-5 py-4 text-[var(--app-text)]",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!isAssistant ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-inverse)] text-xs font-semibold text-[var(--app-inverse-text)]">
                  Y
                </div>
              ) : null}
              <div>
                <p className="text-sm font-semibold text-[var(--app-text)]">{formatRole(message.role)}</p>
                <p className="text-xs text-[var(--app-muted)]">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {message.status === "streaming" ? (
              <Badge>Streaming</Badge>
            ) : null}
            {message.status === "error" ? (
              <Badge className="border-red-200 bg-red-50 text-red-700">Needs retry</Badge>
            ) : null}
          </div>

          {message.attachments.length > 0 ? (
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              {message.attachments.map((attachment) =>
                attachment.kind === "image" ? (
                  <div
                    key={attachment.id}
                    className="overflow-hidden rounded-2xl border bg-[var(--app-surface)] [border-color:var(--app-border)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="h-full max-h-72 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-2xl border bg-[var(--app-surface-subtle)] px-4 py-3 text-sm text-[var(--app-text)] [border-color:var(--app-border)]"
                  >
                    <FileText className="h-4 w-4 text-[var(--app-muted)]" />
                    <span className="truncate">{attachment.filename}</span>
                  </div>
                ),
              )}
            </div>
          ) : null}

          {isAssistant ? (
            <div className="prose prose-p:leading-7 prose-pre:rounded-2xl prose-pre:border prose-pre:bg-[var(--app-surface-subtle)] prose-code:text-[var(--app-text)] prose-headings:text-[var(--app-text)] prose-p:text-[var(--app-text)] prose-strong:text-[var(--app-text)] prose-li:text-[var(--app-text)] max-w-none text-[15px] [--tw-prose-body:var(--app-text)] [--tw-prose-headings:var(--app-text)] [--tw-prose-links:var(--app-text)] [--tw-prose-bold:var(--app-text)] [--tw-prose-bullets:var(--app-muted)] [--tw-prose-counters:var(--app-muted)] [--tw-prose-code:var(--app-text)] [--tw-prose-pre-code:var(--app-text)] [--tw-prose-pre-bg:var(--app-surface-subtle)] [--tw-prose-hr:var(--app-border)] [--tw-prose-quotes:var(--app-text)] [--tw-prose-quote-borders:var(--app-border)] prose-pre:[border-color:var(--app-border)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "..."}</ReactMarkdown>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</div>
          )}

          {message.errorText ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message.errorText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
