"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/lib/cn";
import { getSupabaseBrowserClient } from "@/client/lib/supabase-browser";
import type { AuthFormInput } from "@/types/chat";

export type AuthMode = "login" | "signup";

interface AuthCardProps {
  initialMode?: AuthMode;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  showCancel?: boolean;
}

export function AuthCard({
  initialMode = "login",
  className,
  onCancel,
  onSuccess,
  showCancel = false,
}: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState<AuthFormInput>({
    email: "",
    password: "",
    displayName: "",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const mutation = useMutation({
    mutationFn: async (values: AuthFormInput) => {
      const supabase = getSupabaseBrowserClient();
      const email = values.email.trim();
      const password = values.password;

      if (mode === "signup") {
        const displayName = values.displayName?.trim() ?? "";
        if (displayName.length < 2) {
          throw new Error("Display name must be at least 2 characters long.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          throw error;
        }

        return {
          needsEmailConfirmation: !data.session,
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return {
        needsEmailConfirmation: false,
      };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["session"] }),
        queryClient.invalidateQueries({ queryKey: ["chats"] }),
      ]);

      setForm({
        email: "",
        password: "",
        displayName: "",
      });

      if (mode === "signup" && result.needsEmailConfirmation) {
        toast.success("Account created. Confirm your email to finish signing in.");
        return;
      }

      toast.success(mode === "signup" ? "Account created." : "Welcome back.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Auth failed.");
    },
  });

  const title = useMemo(
    () => (mode === "signup" ? "Create your account" : "Log in to continue"),
    [mode],
  );

  return (
    <div
      className={cn(
        "w-full max-w-md overflow-hidden rounded-3xl border bg-[var(--app-surface)] shadow-sm",
        "[border-color:var(--app-border)]",
        className,
      )}
    >
      <div className="border-b px-6 py-6 [border-color:var(--app-border)]">
        <p className="text-sm font-medium text-[var(--app-muted)]">gpt-chatbot</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
          Sign in to save chats, sync across tabs, and keep uploaded files attached to the right
          conversation.
        </p>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--app-surface-subtle)] p-1">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-medium transition",
                mode === item
                  ? "bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm"
                  : "text-[var(--app-muted)] hover:text-[var(--app-text)]",
              )}
            >
              {item === "signup" ? "Create account" : "Log in"}
            </button>
          ))}
        </div>

        {mode === "signup" ? (
          <label className="block space-y-2">
            <span className="inline-flex items-center gap-2 text-sm text-[var(--app-text)]">
              <UserRound className="h-4 w-4" />
              Display name
            </span>
            <Input
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
              placeholder="How should we call you?"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm text-[var(--app-text)]">Email</span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="inline-flex items-center gap-2 text-sm text-[var(--app-text)]">
            <Lock className="h-4 w-4" />
            Password
          </span>
          <Input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Minimum 8 characters"
          />
        </label>

        <div className="flex gap-3 pt-2">
          {showCancel ? (
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onCancel}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="button"
            className="flex-1"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : "Log in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
