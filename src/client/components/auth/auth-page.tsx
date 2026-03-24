"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/client/components/ui/theme-toggle";
import { apiRequest } from "@/client/lib/api";
import type { SessionResponse } from "@/types/chat";

import { AuthCard, type AuthMode } from "./auth-card";
import { Button } from "../ui/button";

interface AuthPageProps {
  initialMode: AuthMode;
  nextHref: string;
}

export function AuthPage({ initialMode, nextHref }: AuthPageProps) {
  const router = useRouter();
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => apiRequest<SessionResponse>("/api/auth/session"),
  });

  useEffect(() => {
    if (sessionQuery.data?.authenticated) {
      router.replace(nextHref);
    }
  }, [nextHref, router, sessionQuery.data?.authenticated]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Button type="button" variant="ghost" onClick={() => router.push(nextHref)}>
          <ArrowLeft className="h-4 w-4" />
          Back to chat
        </Button>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-4 pb-10 md:px-8">
        <div className="w-full max-w-md">
          <AuthCard
            initialMode={initialMode}
            onSuccess={() => router.push(nextHref)}
          />
        </div>
      </main>
    </div>
  );
}
