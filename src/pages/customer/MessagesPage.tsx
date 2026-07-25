import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ConversationList } from "@/components/messaging/ConversationList";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import {
  listConversationsForCustomer,
  type Conversation,
} from "@/lib/messageStore";

/** Customer-dashboard list of message threads with DJs. */
export function CustomerMessagesPage() {
  useDocumentHead({
    title: "Beskeder · DJConnect",
    description: "Dine samtaler med DJs.",
  });

  const { profile } = useAuth();
  const customerId = profile?.role === "customer" ? profile.id : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    function load() {
      setConversations(listConversationsForCustomer(customerId));
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("message:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("message:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [customerId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
          Beskeder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Skriv med DJs og modtag skræddersyede tilbud.
        </p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState
          title="Ingen beskeder endnu"
          description="Åbn en DJ-profil og tryk 'Send besked' for at starte en samtale."
          action={
            <Button asChild>
              <Link to="/search">Find DJs</Link>
            </Button>
          }
        />
      ) : (
        <ConversationList
          conversations={conversations}
          basePath="/dashboard/messages"
          viewer="customer"
        />
      )}
    </div>
  );
}
