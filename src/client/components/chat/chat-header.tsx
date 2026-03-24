"use client";

import { LogIn, Menu } from "lucide-react";

import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { ThemeToggle } from "@/client/components/ui/theme-toggle";
import type { ChatSummary, SessionResponse } from "@/types/chat";

export interface ChatHeaderProps {
  activeChat: ChatSummary | null;
  session: SessionResponse | undefined;
  onToggleSidebar: () => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function ChatHeader({
  activeChat,
  session,
  onToggleSidebar,
  onOpenAuth,
}: ChatHeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between border-b bg-[var(--app-bg)] px-4 py-4 md:px-8 [border-color:var(--app-border)]">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold text-[var(--app-text)]">
            {activeChat?.title ?? "New conversation"}
          </p>
          <p className="text-sm text-[var(--app-muted)]">
            Ask questions, upload files, and continue where you left off.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!session?.authenticated ? (
          <Badge className="hidden md:inline-flex">
            {session?.guest.remainingFreeQuestions ?? 0} free left
          </Badge>
        ) : null}
        {!session?.authenticated ? (
          <Button
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => onOpenAuth("login")}
          >
            <LogIn className="h-4 w-4" />
            Log in
          </Button>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
