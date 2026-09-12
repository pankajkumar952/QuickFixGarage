import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listMessagesAction, getChatDetailsAction } from "@/lib/chat";
import ChatClient from "@/components/chat/chat-client";

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { requestId: rawId } = await params;
  const requestId = parseInt(rawId);
  
  if (isNaN(requestId)) {
    redirect("/dashboard");
  }

  const [initialMessages, details] = await Promise.all([
    listMessagesAction(requestId),
    getChatDetailsAction(requestId),
  ]);

  return (
    <ChatClient 
      requestId={requestId} 
      initialMessages={initialMessages}
      details={details}
      currentUserId={session.user.id}
    />
  );
}
