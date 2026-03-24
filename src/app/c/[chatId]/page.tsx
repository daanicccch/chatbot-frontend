import { ChatApp } from "@/client/components/chat/chat-app";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <ChatApp initialChatId={chatId} />;
}
