import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EmptyState } from "@/components/common/EmptyState";
import { ConversationList } from "@/components/messaging/ConversationList";
import {
  listConversationsForDj,
  type Conversation,
} from "@/lib/messageStore";

/** DJ-dashboard list of message threads with customers. */
export function DJMessagesPage() {
  useDocumentHead({
    title: "Beskeder · DJConnect",
    description: "Dine samtaler med kunder.",
  });

  const { profile } = useAuth();
  const djId = profile?.role === "dj" ? profile.id : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    function load() {
      setConversations(listConversationsForDj(djId));
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("message:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("message:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [djId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Beskeder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Svar kunder og send skræddersyede tilbud direkte i chatten.
        </p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState
          title="Ingen beskeder"
          description="Samtaler vises her, når en kunde skriver til dig fra din profil."
        />
      ) : (
        <ConversationList
          conversations={conversations}
          basePath="/dj/messages"
          viewer="dj"
        />
      )}
    </div>
  );
}
