import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatThread } from "@/components/messaging/ChatThread";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { readConversation, type Conversation } from "@/lib/messageStore";

/** DJ view of one message thread with a customer, with offer sending. */
export function DJMessageThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentHead({
    title: "Besked · DJConnect",
    description: "Samtale med en kunde.",
  });

  useEffect(() => {
    if (!conversationId) return;
    setConversation(readConversation(conversationId));
    setLoading(false);
  }, [conversationId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Indlæser…</div>;
  }

  if (!conversation) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Samtalen blev ikke fundet
        </h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/dj/messages">Alle beskeder</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-13rem)] max-w-2xl flex-col space-y-4">
      <div>
        <Link
          to="/dj/messages"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Alle beskeder
        </Link>
        <header className="mt-2">
          <h1 className="text-lg font-semibold tracking-tight">
            {conversation.customerName ?? "Kunde"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Send en besked eller et skræddersyet tilbud.
          </p>
        </header>
      </div>

      <ChatThread conversation={conversation} viewer="dj" />
    </div>
  );
}
