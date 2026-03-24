"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { ChatComposer } from "@/client/components/chat/chat-composer";
import { ChatEmptyState } from "@/client/components/chat/chat-empty-state";
import { ChatHeader } from "@/client/components/chat/chat-header";
import { ChatSidebar } from "@/client/components/chat/chat-sidebar";
import { MessageBubble } from "@/client/components/chat/message-bubble";
import { Badge } from "@/client/components/ui/badge";
import { apiRequest, getApiHeaders, getApiUrl, uploadWithFormData } from "@/client/lib/api";
import { createRealtimeBridge } from "@/client/lib/realtime";
import { readJsonEventStream } from "@/client/lib/stream";
import { getSupabaseBrowserClient } from "@/client/lib/supabase-browser";
import type {
  AttachmentRecord,
  ChatDetailResponse,
  ChatListResponse,
  ChatMessage,
  ChatSummary,
  SessionResponse,
} from "@/types/chat";

function upsertChatSummary(current: ChatSummary[] | undefined, incoming: ChatSummary) {
  const next = current ? [...current] : [];
  const existingIndex = next.findIndex((item) => item.id === incoming.id);
  if (existingIndex >= 0) {
    next[existingIndex] = incoming;
  } else {
    next.unshift(incoming);
  }

  return next.sort(
    (left, right) =>
      new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
  );
}

export function ChatApp({ initialChatId }: { initialChatId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<AttachmentRecord[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<AttachmentRecord[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSending, setSending] = useState(false);
  const [navigatedAfterCreate, setNavigatedAfterCreate] = useState(false);
  const bridgeRef = useRef<ReturnType<typeof createRealtimeBridge> | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: () => apiRequest<SessionResponse>("/api/auth/session"),
  });

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: () => apiRequest<ChatListResponse>("/api/chats"),
  });

  const activeChatId = initialChatId;
  const chatQuery = useQuery({
    queryKey: ["chat", activeChatId],
    queryFn: () => apiRequest<ChatDetailResponse>(`/api/chats/${activeChatId}`),
    enabled: Boolean(activeChatId),
  });

  const session = chatsQuery.data?.session ?? sessionQuery.data ?? chatQuery.data?.session;
  const chats = chatsQuery.data?.chats;
  const chatDetail = chatQuery.data;

  const activeChat = useMemo(() => {
    return chats?.find((item) => item.id === activeChatId) ?? chatDetail?.chat ?? null;
  }, [activeChatId, chatDetail?.chat, chats]);

  function openAuthPage(mode: "login" | "signup" = "login") {
    const params = new URLSearchParams({ next: pathname || "/" });
    if (mode === "signup") {
      params.set("mode", "signup");
    }
    startTransition(() => router.push(`/login?${params.toString()}`));
  }

  const handleRealtimeEvent = useEffectEvent((event: { type: "refresh"; chatId?: string }) => {
    if (event.type !== "refresh") return;
    void queryClient.invalidateQueries({ queryKey: ["chats"] });
    if (event.chatId) {
      void queryClient.invalidateQueries({ queryKey: ["chat", event.chatId] });
    }
  });

  useEffect(() => {
    if (!session) return;
    bridgeRef.current?.destroy();
    bridgeRef.current = createRealtimeBridge(session.realtime, handleRealtimeEvent);
    return () => {
      bridgeRef.current?.destroy();
      bridgeRef.current = null;
    };
  }, [session]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return apiRequest<SessionResponse>("/api/auth/logout", { method: "POST" });
    },
    onSuccess: async () => {
      setPendingImages([]);
      setPendingDocuments([]);
      startTransition(() => router.push("/"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["session"] }),
        queryClient.invalidateQueries({ queryKey: ["chats"] }),
      ]);
    },
  });

  async function publishRefresh(chatId?: string) {
    bridgeRef.current?.publish({ type: "refresh", chatId });
  }

  async function ensureChatId() {
    if (activeChatId) return activeChatId;
    const created = await apiRequest<{ chat: ChatSummary; session: SessionResponse }>("/api/chats", {
      method: "POST",
    });
    queryClient.setQueryData<ChatListResponse | undefined>(["chats"], (current) => ({
      chats: upsertChatSummary(current?.chats, created.chat),
      session: created.session,
    }));
    return created.chat.id;
  }

  async function uploadImageFiles(files: File[]) {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (activeChatId) formData.append("chatId", activeChatId);
      try {
        const result = await uploadWithFormData<{ attachment: AttachmentRecord }>(
          "/api/attachments",
          formData,
        );
        setPendingImages((current) => [...current, result.attachment]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Image upload failed.");
      }
    }
  }

  async function uploadDocumentFiles(files: File[]) {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (activeChatId) formData.append("chatId", activeChatId);
      try {
        const result = await uploadWithFormData<{ document: AttachmentRecord }>(
          "/api/documents",
          formData,
        );
        setPendingDocuments((current) => [...current, result.document]);
        if (activeChatId) {
          await queryClient.invalidateQueries({ queryKey: ["chat", activeChatId] });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Document upload failed.");
      }
    }
  }

  async function handleSendMessage() {
    const message = draft.trim();
    if (!message && pendingImages.length === 0 && pendingDocuments.length === 0) return;

    setSending(true);
    setNavigatedAfterCreate(false);
    const imageIds = pendingImages.map((item) => item.id);
    const documentIds = pendingDocuments.map((item) => item.id);
    const sendingDraft = draft;

    try {
      const targetChatId = await ensureChatId();
      const response = await fetch(getApiUrl(`/api/chats/${targetChatId}/messages`), {
        method: "POST",
        credentials: "include",
        headers: await getApiHeaders({ withJsonContentType: true }),
        body: JSON.stringify({
          content: sendingDraft,
          attachmentIds: imageIds,
          documentIds,
        }),
      });

      setDraft("");
      setPendingImages([]);
      setPendingDocuments([]);

      await readJsonEventStream(response, (payload) => {
        const event = payload as
          | { type: "messages"; chat: ChatSummary; userMessage: ChatMessage; assistantMessage: ChatMessage }
          | { type: "chunk"; text: string }
          | { type: "done"; assistantMessage: ChatMessage }
          | { type: "error"; assistantMessage?: ChatMessage; message: string };

        if (event.type === "messages") {
          queryClient.setQueryData<ChatDetailResponse | undefined>(["chat", targetChatId], (current) => ({
            chat: event.chat,
            messages: [...(current?.messages ?? []), event.userMessage, event.assistantMessage],
            documents: current?.documents ?? [],
            session: current?.session ?? session!,
          }));

          queryClient.setQueryData<ChatListResponse | undefined>(["chats"], (current) => ({
            chats: upsertChatSummary(current?.chats, event.chat),
            session: current?.session ?? session!,
          }));

          if (!activeChatId && !navigatedAfterCreate) {
            setNavigatedAfterCreate(true);
            startTransition(() => router.push(`/c/${targetChatId}`));
          }
        }

        if (event.type === "chunk") {
          queryClient.setQueryData<ChatDetailResponse | undefined>(["chat", targetChatId], (current) => {
            if (!current || current.messages.length === 0) return current;
            const nextMessages = [...current.messages];
            const lastIndex = nextMessages.length - 1;
            nextMessages[lastIndex] = {
              ...nextMessages[lastIndex],
              content: `${nextMessages[lastIndex].content}${event.text}`,
            };
            return { ...current, messages: nextMessages };
          });
        }

        if (event.type === "done") {
          queryClient.setQueryData<ChatDetailResponse | undefined>(["chat", targetChatId], (current) => {
            if (!current || current.messages.length === 0) return current;
            const nextMessages = [...current.messages];
            nextMessages[nextMessages.length - 1] = event.assistantMessage;
            return { ...current, messages: nextMessages };
          });
          void queryClient.invalidateQueries({ queryKey: ["session"] });
          void queryClient.invalidateQueries({ queryKey: ["chats"] });
          void queryClient.invalidateQueries({ queryKey: ["chat", targetChatId] });
          void publishRefresh(targetChatId);
        }

        if (event.type === "error") {
          if (event.assistantMessage) {
            queryClient.setQueryData<ChatDetailResponse | undefined>(["chat", targetChatId], (current) => {
              if (!current || current.messages.length === 0) return current;
              const nextMessages = [...current.messages];
              nextMessages[nextMessages.length - 1] = event.assistantMessage!;
              return { ...current, messages: nextMessages };
            });
          }
          toast.error(event.message);
          void queryClient.invalidateQueries({ queryKey: ["session"] });
          void publishRefresh(targetChatId);
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the message.");
    } finally {
      setSending(false);
    }
  }

  const sidebar = (
    <ChatSidebar
      session={session}
      chats={chats}
      activeChatId={activeChatId}
      isLoading={chatsQuery.isLoading}
      isLoggingOut={logoutMutation.isPending}
      onNewChat={() => {
        setPendingImages([]);
        setPendingDocuments([]);
        startTransition(() => router.push("/"));
      }}
      onSelectChat={(chatId) => startTransition(() => router.push(`/c/${chatId}`))}
      onOpenAuth={openAuthPage}
      onLogout={() => logoutMutation.mutate()}
    />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
      <aside className="hidden h-full w-[320px] shrink-0 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {isSidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[var(--app-overlay)] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="h-full w-[88vw] max-w-[340px]"
              onClick={(event) => event.stopPropagation()}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
        <ChatHeader
          activeChat={activeChat}
          session={session}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenAuth={openAuthPage}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-4 pt-6 md:px-8">
            {activeChatId && chatQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="rounded-[24px] border bg-[var(--app-surface-subtle)] px-6 py-5 text-sm text-[var(--app-muted)] [border-color:var(--app-border)]">
                  Loading chat...
                </div>
              </div>
            ) : chatDetail?.messages?.length ? (
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                {chatDetail.documents.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {chatDetail.documents.map((document) => (
                      <Badge key={document.id}>
                        <FileText className="mr-1 h-3.5 w-3.5" />
                        {document.filename}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {chatDetail.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            ) : (
              <ChatEmptyState onSuggestionClick={setDraft} />
            )}

            <ChatComposer
              draft={draft}
              pendingImages={pendingImages}
              pendingDocuments={pendingDocuments}
              isSending={isSending}
              session={session}
              onDraftChange={setDraft}
              onSend={() => void handleSendMessage()}
              onUploadImages={(files) => void uploadImageFiles(files)}
              onUploadDocuments={(files) => void uploadDocumentFiles(files)}
              onRemoveImage={(id) => setPendingImages((current) => current.filter((entry) => entry.id !== id))}
              onRemoveDocument={(id) => setPendingDocuments((current) => current.filter((entry) => entry.id !== id))}
              onOpenAuth={openAuthPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
