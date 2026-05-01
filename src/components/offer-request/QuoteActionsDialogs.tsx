import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Lock, MessageSquare, PhoneCall, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import { writeRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Strip apparent contact info from on-platform messages so the customer/DJ
 * can't bypass the platform before booking. Catches phone numbers, emails,
 * and common social handles. Naive but appropriate for a UX-level guardrail.
 */
function maskContactInfo(text: string): {
  cleaned: string;
  redacted: boolean;
} {
  const phoneRe = /(?:\+?\d[\s-]?){6,}\d/g;
  const emailRe = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
  const socialRe = /(?:^|[^\w])(@[a-zA-Z][\w.-]{2,})/g;
  let redacted = false;
  let cleaned = text;
  if (phoneRe.test(cleaned)) {
    cleaned = cleaned.replace(phoneRe, "[contact info hidden until booking]");
    redacted = true;
  }
  if (emailRe.test(cleaned)) {
    cleaned = cleaned.replace(emailRe, "[contact info hidden until booking]");
    redacted = true;
  }
  if (socialRe.test(cleaned)) {
    cleaned = cleaned.replace(socialRe, " [contact info hidden until booking]");
    redacted = true;
  }
  return { cleaned, redacted };
}

// ---------- Message dialog ----------

export function OnPlatformChatDialog({
  open,
  onOpenChange,
  record,
  slot,
  dj,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  record: OfferRequestRecord;
  slot: DJSlot | null;
  dj: DJProfileWithRelations | null;
}) {
  const [draft, setDraft] = useState("");

  if (!slot || !dj) return null;
  const thread = slot.thread;

  function handleSend() {
    if (!slot || !dj) return;
    const trimmed = draft.trim();
    if (!trimmed) return;
    const { cleaned, redacted } = maskContactInfo(trimmed);
    if (redacted) {
      toast("Contact info auto-hidden", {
        description:
          "Phone numbers, emails, and handles stay hidden until your booking is confirmed and paid.",
      });
    }
    const ts = Date.now();
    const newThread = [
      ...thread,
      { id: `m-${ts}-c`, from: "customer" as const, text: cleaned, ts },
    ];
    // Simulate DJ auto-acknowledgement after a short pause
    const replyTs = ts + 8000;
    const replyText = `Tak for beskeden, ${record.brief.contact.name?.split(" ")[0] ?? "der"}! Jeg vender tilbage hurtigt med svar.`;
    newThread.push({ id: `m-${replyTs}-d`, from: "dj" as const, text: replyText, ts: replyTs });

    const target = slot;
    const updatedSlot: DJSlot = { ...target, thread: newThread };
    writeRecord({
      ...record,
      slots: record.slots.map((s) => (s.djId === target.djId ? updatedSlot : s)),
    });
    setDraft("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
              <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            Message {dj.stage_name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3 w-3" />
            On-platform chat. Contact info is hidden until booking is confirmed.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[40vh] space-y-2 overflow-auto rounded-lg border bg-muted/30 p-3">
          {thread.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Start the conversation with a question — about playlist, equipment, dietary
              breaks, anything.
            </p>
          ) : (
            thread.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.from === "customer"
                      ? "bg-rose-500 text-white"
                      : "bg-card text-foreground"
                  }`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.from === "customer" ? "text-rose-100" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.ts).toLocaleTimeString("da-DK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Skriv en besked…"
          rows={3}
        />
        <DialogFooter className="flex flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            All messages stored on the platform; contact details auto-hidden.
          </p>
          <Button onClick={handleSend} disabled={!draft.trim()}>
            <MessageSquare className="mr-1 h-4 w-4" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Callback dialog ----------

export function RequestCallbackDialog({
  open,
  onOpenChange,
  record,
  slot,
  dj,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  record: OfferRequestRecord;
  slot: DJSlot | null;
  dj: DJProfileWithRelations | null;
}) {
  if (!slot || !dj) return null;
  function handleConfirm() {
    if (!slot || !dj) return;
    writeRecord({
      ...record,
      slots: record.slots.map((s) =>
        s.djId === slot.djId ? { ...s, callbackRequested: true } : s,
      ),
    });
    toast("Callback requested", {
      description: `${dj.stage_name} has been notified to call you back today.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-rose-500" />
            Request a call from {dj.stage_name}
          </DialogTitle>
          <DialogDescription>
            We'll send a callback request via app + email + SMS. {dj.stage_name} will
            phone you — your number stays hidden, the DJ sees it once you confirm.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 rounded-lg border bg-muted/30 p-3 text-xs">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Your number is only shared with this DJ — not the others.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Callback usually within a few hours, max same day.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Decline at any time — the DJ won't see your number again.
          </li>
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Yes, request callback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Book with escrow dialog ----------

export function EscrowBookingDialog({
  open,
  onOpenChange,
  record,
  slot,
  dj,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  record: OfferRequestRecord;
  slot: DJSlot | null;
  dj: DJProfileWithRelations | null;
}) {
  if (!slot || !dj || !slot.quote) return null;
  const price = (slot.quote.priceMinor / 100).toLocaleString("da-DK");
  const deposit = Math.round(slot.quote.priceMinor * 0.3) / 100;
  const balance = slot.quote.priceMinor / 100 - deposit;

  function handleConfirm() {
    if (!slot || !dj) return;
    writeRecord({
      ...record,
      slots: record.slots.map((s) =>
        s.djId === slot.djId ? { ...s, bookedAtMs: Date.now() } : s,
      ),
    });
    toast("Booking confirmed", {
      description: `${dj.stage_name} is locked in for your event. We'll release escrow after the event.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Book {dj.stage_name} with escrow
          </DialogTitle>
          <DialogDescription>
            We hold the deposit until the event is confirmed. After the event, the balance
            is released to the DJ. You can still message them on-platform anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quote total</span>
              <span className="font-semibold">{price} kr</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Deposit today (30%)</span>
              <span className="font-semibold text-rose-700">
                {deposit.toLocaleString("da-DK")} kr
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Balance after event</span>
              <span className="font-semibold">
                {balance.toLocaleString("da-DK")} kr
              </span>
            </div>
          </div>
          <ul className="space-y-1.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-900">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Other quotes auto-released — DJs are
              notified you've chosen.
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Full refund if the DJ cancels.
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Direct contact info exchanged after
              booking is confirmed.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Pay {deposit.toLocaleString("da-DK")} kr deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
