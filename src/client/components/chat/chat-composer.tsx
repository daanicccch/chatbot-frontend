"use client";

import { ArrowUp, FileText, ImagePlus, Loader2 } from "lucide-react";
import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { AttachmentPill } from "@/client/components/chat/attachment-pill";
import { Button } from "@/client/components/ui/button";
import type { AttachmentRecord, SessionResponse } from "@/types/chat";

export interface ChatComposerProps {
  draft: string;
  pendingImages: AttachmentRecord[];
  pendingDocuments: AttachmentRecord[];
  isSending: boolean;
  session: SessionResponse | undefined;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onUploadImages: (files: File[]) => void;
  onUploadDocuments: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function ChatComposer({
  draft,
  pendingImages,
  pendingDocuments,
  isSending,
  session,
  onDraftChange,
  onSend,
  onUploadImages,
  onUploadDocuments,
  onRemoveImage,
  onRemoveDocument,
  onOpenAuth,
}: ChatComposerProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <div className="mt-4 rounded-[28px] border bg-[var(--app-surface)] p-4 shadow-sm [border-color:var(--app-border)]">
        {(pendingImages.length > 0 || pendingDocuments.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {pendingImages.map((item) => (
              <AttachmentPill key={item.id} item={item} onRemove={onRemoveImage} />
            ))}
            {pendingDocuments.map((item) => (
              <AttachmentPill key={item.id} item={item} onRemove={onRemoveDocument} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-[24px] border bg-[var(--app-surface-muted)] px-4 py-3 [border-color:var(--app-border)]">
            <TextareaAutosize
              value={draft}
              minRows={1}
              maxRows={8}
              onChange={(event) => onDraftChange(event.target.value)}
              onPaste={async (event) => {
                const files = Array.from(event.clipboardData.items)
                  .map((item) => item.getAsFile())
                  .filter((file): file is File => file instanceof File)
                  .filter((file) => file.type.startsWith("image/"));

                if (files.length > 0) {
                  event.preventDefault();
                  onUploadImages(files);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message gpt-chatbot..."
              className="w-full resize-none bg-transparent text-[15px] leading-7 text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted-soft)]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => documentInputRef.current?.click()}
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-11 w-11"
              onClick={onSend}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--app-muted)]">
          <p>
            Paste screenshots directly into the composer or attach docs to ground the next
            answer.
          </p>
          {!session?.authenticated ? (
            <button
              type="button"
              onClick={() => onOpenAuth("login")}
              className="text-[var(--app-text)] transition hover:text-[var(--app-muted)]"
            >
              Sign in to unlock unlimited chats
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          onUploadImages(files);
          event.currentTarget.value = "";
        }}
      />

      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.csv,.json"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          onUploadDocuments(files);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
