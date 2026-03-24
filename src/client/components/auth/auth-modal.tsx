"use client";

import { AuthCard, type AuthMode } from "@/client/components/auth/auth-card";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-overlay)] p-4 backdrop-blur-sm">
      <AuthCard
        initialMode={initialMode}
        onCancel={onClose}
        onSuccess={onClose}
        showCancel
      />
    </div>
  );
}
