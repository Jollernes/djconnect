import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChatThread } from "@/components/messaging/ChatThread";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { readConversation, type ChatMessage, type Conversation } from "@/lib/messageStore";
import {
  computeBookingPricing,
  newBookingRequestId,
  writeBookingRequest,
  type BookingRequest,
} from "@/lib/bookingRequestStore";

/** Customer view of one message thread with a DJ. */
export function CustomerMessageThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentHead({
    title: "Besked · DJConnect",
    description: "Samtale med en DJ.",
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
          <Link to="/dashboard/messages">Alle beskeder</Link>
        </Button>
      </div>
    );
  }

  function handleAcceptOffer(msg: ChatMessage): string | undefined {
    if (!conversation || !msg.offer) return undefined;
    const id = newBookingRequestId();
    const pricing = computeBookingPricing(msg.offer.fullPriceMinor);
    const customerId = profile?.role === "customer" ? profile.id : undefined;
    const record: BookingRequest = {
      id,
      customerId,
      customerName: profile?.full_name ?? conversation.customerName,
      createdAtMs: Date.now(),
      status: "pending_customer",
      djId: conversation.djId,
      djUsername: conversation.djUsername,
      djStageName: conversation.djStageName,
      djAvatarUrl: conversation.djAvatarUrl,
      djCity: conversation.djCity,
      djCurrency: conversation.djCurrency,
      pricing,
      djQuote: {
        ...pricing,
        respondedAtMs: Date.now(),
        changed: false,
        note: msg.offer.description
          ? `${msg.offer.title} — ${msg.offer.description}`
          : msg.offer.title,
      },
      event: {
        eventTypeId: "",
        eventDate: msg.offer.eventDate ?? "",
        startTime: "",
        venueName: "",
        venueAddress: "",
      },
    };
    writeBookingRequest(record);
    toast.success("Tilbud accepteret — vælg betaling og betal depositum");
    navigate(`/dashboard/requests/booking/${id}`);
    return id;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-13rem)] max-w-2xl flex-col space-y-4">
      <div>
        <Link
          to="/dashboard/messages"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Alle beskeder
        </Link>
        <header className="mt-2 flex items-center gap-3">
          {conversation.djAvatarUrl ? (
            <img
              src={conversation.djAvatarUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
          )}
          <div className="min-w-0">
            <Link
              to={`/djs/${conversation.djUsername}`}
              className="truncate text-lg font-semibold tracking-tight hover:underline"
            >
              {conversation.djStageName}
            </Link>
            {conversation.djCity && (
              <div className="text-xs text-muted-foreground">
                {conversation.djCity}
              </div>
            )}
          </div>
        </header>
      </div>

      <ChatThread
        conversation={conversation}
        viewer="customer"
        onAcceptOffer={handleAcceptOffer}
      />
    </div>
  );
}
