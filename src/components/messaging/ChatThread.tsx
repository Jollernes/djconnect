import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeDollarSign, Check, Send, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { DEPOSIT_PERCENT } from "@/lib/bookingRequestStore";
import {
  listMessages,
  markConversationRead,
  sendOffer,
  sendText,
  updateConversation,
  updateOffer,
  type ChatMessage,
  type Conversation,
  type MessageSender,
} from "@/lib/messageStore";

interface ChatThreadProps {
  conversation: Conversation;
  viewer: MessageSender;
  /**
   * Customer-only: called when the customer accepts a pending offer. The
   * handler creates the booking request and navigates to the deposit step.
   * Return the created booking-request id so the offer can link to it.
   */
  onAcceptOffer?: (message: ChatMessage) => string | undefined;
  /**
   * Guest (not-logged-in) customer: require a name + email before the first
   * message can be sent.
   */
  guest?: boolean;
}

/**
 * Shared chat surface used by both the customer and DJ message threads.
 * Renders the message list (text + custom offers) and a composer. DJs get an
 * extra "Send tilbud" builder to send a tailored price offer inside the chat.
 */
export function ChatThread({
  conversation,
  viewer,
  onAcceptOffer,
  guest = false,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [guestName, setGuestName] = useState(conversation.customerName ?? "");
  const [guestEmail, setGuestEmail] = useState(conversation.customerEmail ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());
  const contactComplete = !guest || (guestName.trim().length > 0 && emailValid);

  const load = useCallback(() => {
    setMessages(listMessages(conversation.id));
  }, [conversation.id]);

  useEffect(() => {
    load();
    markConversationRead(conversation.id, viewer);
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ conversationId?: string }>).detail;
      if (!detail || detail.conversationId === conversation.id) {
        load();
        markConversationRead(conversation.id, viewer);
      }
    };
    window.addEventListener("message:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("message:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [conversation.id, viewer, load]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (offerOpen) {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [offerOpen]);

  function persistGuestContact() {
    if (!guest) return;
    updateConversation(conversation.id, {
      customerName: guestName.trim(),
      customerEmail: guestEmail.trim(),
    });
  }

  function handleSendText() {
    const text = draft.trim();
    if (!text || !contactComplete) return;
    persistGuestContact();
    sendText(conversation.id, viewer, text);
    setDraft("");
  }

  function handleAccept(msg: ChatMessage) {
    if (!onAcceptOffer) return;
    const bookingRequestId = onAcceptOffer(msg);
    updateOffer(conversation.id, msg.id, {
      status: "accepted",
      bookingRequestId,
    });
  }

  function handleDecline(msg: ChatMessage) {
    updateOffer(conversation.id, msg.id, { status: "declined" });
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border bg-muted/20 p-4"
      >
        {empty ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {viewer === "dj"
              ? "Ingen beskeder endnu. Svar kunden eller send et skræddersyet tilbud."
              : "Skriv en besked til DJ'en for at komme i gang."}
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              viewer={viewer}
              currency={conversation.djCurrency}
              onAccept={onAcceptOffer ? () => handleAccept(m) : undefined}
              onDecline={() => handleDecline(m)}
            />
          ))
        )}
      </div>

      {offerOpen && viewer === "dj" ? (
        <div ref={composerRef}>
          <OfferComposer
            currency={conversation.djCurrency}
            onCancel={() => setOfferOpen(false)}
            onSend={(offer, note) => {
              sendOffer(conversation.id, { ...offer, currency: conversation.djCurrency }, note);
              setOfferOpen(false);
            }}
          />
        </div>
      ) : (
        <div ref={composerRef} className="mt-3 space-y-2">
          {guest && (
            <div className="grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-2">
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                Angiv navn og email for at sende din besked.
              </div>
              <div>
                <Label htmlFor="guest-name">Navn</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Dit navn"
                />
              </div>
              <div>
                <Label htmlFor="guest-email">Email</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="dig@eksempel.dk"
                />
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder="Skriv en besked…"
              className="min-h-[42px] resize-none"
            />
            {viewer === "dj" && (
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => setOfferOpen(true)}
              >
                <Tag className="h-4 w-4" />
                Tilbud
              </Button>
            )}
            <Button
              type="button"
              variant="accent"
              className="shrink-0"
              onClick={handleSendText}
              disabled={!draft.trim() || !contactComplete}
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  viewer,
  currency,
  onAccept,
  onDecline,
}: {
  message: ChatMessage;
  viewer: MessageSender;
  currency: string;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const mine = message.sender === viewer;

  if (message.kind === "offer" && message.offer) {
    return (
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <OfferCard
          message={message}
          viewer={viewer}
          currency={currency}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "rounded-br-sm bg-accent text-accent-foreground"
            : "rounded-bl-sm bg-white text-foreground shadow-sm",
        )}
      >
        <p className="whitespace-pre-line leading-snug">{message.text}</p>
        <div
          className={cn(
            "mt-1 text-[10px]",
            mine ? "text-accent-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatTime(message.createdAtMs)}
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  message,
  viewer,
  currency,
  onAccept,
  onDecline,
}: {
  message: ChatMessage;
  viewer: MessageSender;
  currency: string;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const offer = message.offer!;
  const depositMinor = Math.round((offer.fullPriceMinor * DEPOSIT_PERCENT) / 100);

  return (
    <div className="max-w-[85%] overflow-hidden rounded-2xl border border-accent/40 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b bg-accent/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent">
        <BadgeDollarSign className="h-3.5 w-3.5" />
        Skræddersyet tilbud
      </div>
      <div className="space-y-2 p-4">
        <div className="font-semibold">{offer.title}</div>
        {offer.description && (
          <p className="text-sm text-muted-foreground">{offer.description}</p>
        )}
        {message.text && (
          <p className="text-sm text-muted-foreground">{message.text}</p>
        )}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm text-muted-foreground">Fuld pris</span>
          <span className="text-lg font-semibold">
            {formatCurrency(offer.fullPriceMinor, currency)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">
            Depositum ({DEPOSIT_PERCENT}%) ved bekræftelse
          </span>
          <span className="text-sm font-medium">
            {formatCurrency(depositMinor, currency)}
          </span>
        </div>
        {offer.eventDate && (
          <div className="text-xs text-muted-foreground">
            Dato: {formatDateShort(offer.eventDate)}
          </div>
        )}

        <div className="pt-1">
          <OfferStatusRow offer={offer} viewer={viewer} />
        </div>

        {offer.status === "pending" && viewer === "customer" && onAccept && (
          <div className="flex gap-2 pt-1">
            <Button variant="accent" size="sm" className="flex-1" onClick={onAccept}>
              <Check className="h-4 w-4" />
              Accepter tilbud
            </Button>
            <Button variant="outline" size="sm" onClick={onDecline}>
              <X className="h-4 w-4" />
              Afvis
            </Button>
          </div>
        )}

        {offer.status === "accepted" && offer.bookingRequestId && (
          <Button asChild variant="accent" size="sm" className="mt-1 w-full">
            <a href={`/dashboard/requests/booking/${offer.bookingRequestId}`}>
              {viewer === "customer" ? "Gå til betaling" : "Se booking"}
            </a>
          </Button>
        )}
      </div>
      <div className="px-4 pb-2 text-[10px] text-muted-foreground">
        {formatTime(message.createdAtMs)}
      </div>
    </div>
  );
}

function OfferStatusRow({
  offer,
  viewer,
}: {
  offer: NonNullable<ChatMessage["offer"]>;
  viewer: MessageSender;
}) {
  if (offer.status === "pending") {
    return (
      <div className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
        {viewer === "dj"
          ? "Afventer at kunden accepterer."
          : "Accepter for at gå videre til betaling af depositum."}
      </div>
    );
  }
  if (offer.status === "accepted") {
    return (
      <div className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
        Tilbud accepteret.
      </div>
    );
  }
  if (offer.status === "declined") {
    return (
      <div className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
        Tilbud afvist.
      </div>
    );
  }
  return (
    <div className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
      Tilbud trukket tilbage.
    </div>
  );
}

function OfferComposer({
  currency,
  onSend,
  onCancel,
}: {
  currency: string;
  onSend: (
    offer: { title: string; description?: string; fullPriceMinor: number; eventDate?: string },
    note?: string,
  ) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");

  const priceMajor = Number(price);
  const valid = title.trim().length > 0 && Number.isFinite(priceMajor) && priceMajor > 0;
  const depositMinor = valid
    ? Math.round((Math.round(priceMajor) * 100 * DEPOSIT_PERCENT) / 100)
    : 0;

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
        <BadgeDollarSign className="h-4 w-4" />
        Nyt skræddersyet tilbud
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="offer-title">Titel</Label>
          <Input
            id="offer-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="fx Bryllupspakke – 6 timer"
          />
        </div>
        <div>
          <Label htmlFor="offer-price">Fuld pris ({currency})</Label>
          <Input
            id="offer-price"
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="fx 12000"
          />
        </div>
        <div>
          <Label htmlFor="offer-date">Dato (valgfrit)</Label>
          <Input
            id="offer-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="offer-desc">Beskrivelse (valgfrit)</Label>
          <Textarea
            id="offer-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hvad er inkluderet i tilbuddet?"
          />
        </div>
      </div>
      {valid && (
        <p className="text-xs text-muted-foreground">
          Kunden betaler et depositum på {DEPOSIT_PERCENT}% (
          {formatCurrency(depositMinor, currency)}) ved bekræftelse.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="accent"
          className="flex-1"
          disabled={!valid}
          onClick={() =>
            onSend(
              {
                title: title.trim(),
                description: description.trim() || undefined,
                fullPriceMinor: Math.round(priceMajor) * 100,
                eventDate: eventDate || undefined,
              },
              undefined,
            )
          }
        >
          <Send className="h-4 w-4" />
          Send tilbud
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annullér
        </Button>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
