export type ViewerKind = "user" | "guest";
export type MessageRole = "system" | "user" | "assistant";
export type MessageStatus = "streaming" | "completed" | "error";
export type AttachmentKind = "image" | "document";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

export interface SessionGuest {
  id: string;
  freeQuestionsUsed: number;
  remainingFreeQuestions: number;
}

export interface RealtimeConfig {
  enabled: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  channelKey: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
  guest: SessionGuest;
  realtime: RealtimeConfig;
}

export interface AttachmentRecord {
  id: string;
  chatId: string | null;
  messageId: string | null;
  kind: AttachmentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  extractedText: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  preview: string;
  model: string;
  messageCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  model: string | null;
  errorText: string | null;
  attachments: AttachmentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatDetail {
  chat: ChatSummary;
  messages: ChatMessage[];
  documents: AttachmentRecord[];
}

export interface ChatListResponse {
  chats: ChatSummary[];
  session: SessionResponse;
}

export interface ChatDetailResponse {
  chat: ChatSummary;
  messages: ChatMessage[];
  documents: AttachmentRecord[];
  session: SessionResponse;
}

export interface AuthFormInput {
  email: string;
  password: string;
  displayName?: string;
}
