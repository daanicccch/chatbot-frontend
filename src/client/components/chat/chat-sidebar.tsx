"use client";

import { Loader2, LogIn, LogOut, MessageSquareDashed, Plus } from "lucide-react";

import { Button } from "@/client/components/ui/button";
import { cn } from "@/client/lib/cn";
import type { ChatSummary, SessionResponse } from "@/types/chat";

export interface ChatSidebarProps {
  session: SessionResponse | undefined;
  chats: ChatSummary[] | undefined;
  activeChatId: string | undefined;
  isLoading: boolean;
  isLoggingOut: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
  onLogout: () => void;
}

export function ChatSidebar({
  session,
  chats,
  activeChatId,
  isLoading,
  isLoggingOut,
  onNewChat,
  onSelectChat,
  onOpenAuth,
  onLogout,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r bg-[var(--app-sidebar)] [border-color:var(--app-border)]">
      <div className="border-b px-5 py-5 [border-color:var(--app-border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-[var(--app-surface)] text-[var(--app-text)] [border-color:var(--app-border-strong)]">
            <MessageSquareDashed className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">gpt-chatbot</p>
            <p className="text-sm text-[var(--app-muted)]">Minimal chat workspace</p>
          </div>
        </div>

        <Button
          className="mt-5 w-full justify-start"
          size="lg"
          variant="secondary"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">
          Chats
        </p>
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[20px] border bg-[var(--app-surface)] px-4 py-4 [border-color:var(--app-border)]"
              >
                <div className="h-4 w-2/3 rounded-full bg-[var(--app-border)]" />
                <div className="mt-3 h-3 w-full rounded-full bg-[var(--app-surface-subtle)]" />
              </div>
            ))
          ) : !chats || chats.length === 0 ? (
            <div className="rounded-[24px] border border-dashed bg-[var(--app-surface)] px-4 py-8 text-center text-sm text-[var(--app-muted)] [border-color:var(--app-border-strong)]">
              Your chats will appear here.
            </div>
          ) : (
            chats.map((chat) => {
              const selected = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full rounded-[20px] border px-4 py-4 text-left transition",
                    selected
                      ? "bg-[var(--app-surface)] shadow-sm [border-color:var(--app-border-strong)]"
                      : "border-transparent bg-transparent hover:bg-[var(--app-surface)] hover:[border-color:var(--app-border)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-sm font-semibold text-[var(--app-text)]">{chat.title}</p>
                    <MessageSquareDashed className="h-4 w-4 shrink-0 text-[var(--app-muted-soft)]" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--app-muted)]">
                    {chat.preview || "No messages yet."}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--app-muted-soft)]">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t px-3 py-3 [border-color:var(--app-border)]">
        <div className="flex items-center justify-between rounded-[20px] border bg-[var(--app-surface)] px-4 py-3 [border-color:var(--app-border)]">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--app-text)]">
              {session?.authenticated ? session.user?.displayName : "Guest mode"}
            </p>
            <p className="truncate text-xs text-[var(--app-muted)]">
              {session?.authenticated
                ? "Account active"
                : `${session?.guest.remainingFreeQuestions ?? 0} free questions left`}
            </p>
          </div>

          {session?.authenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Log out
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onOpenAuth("login")}>
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
