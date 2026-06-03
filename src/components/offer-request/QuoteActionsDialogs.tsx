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
    cleaned = cleaned.replace(phoneRe, "[kontaktoplysninger skjult indtil booking]");
    redacted = true;
  }
  if (emailRe.test(cleaned)) {
    cleaned = cleaned.replace(emailRe, "[kontaktoplysninger skjult indtil booking]");
    redacted = true;
  }
  if (socialRe.test(cleaned)) {
    cleaned = cleaned.replace(socialRe, " [kontaktoplysninger skjult indtil booking]");
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
      toast("Kontaktoplysninger skjult automatisk", {
        description:
          "Telefonnumre, e-mails og brugernavne forbliver skjult, indtil din booking er bekræftet og betalt.",
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
            Skriv til {dj.stage_name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3 w-3" />
            Chat på platformen. Kontaktoplysninger er skjult, indtil bookingen er bekræftet.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[40vh] space-y-2 overflow-auto rounded-lg border bg-muted/30 p-3">
          {thread.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Start samtalen med et spørgsmål — om playliste, udstyr, pauser, hvad som helst.
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
            Alle beskeder gemmes på platformen; kontaktoplysninger skjules automatisk.
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
    toast("Opkald anmodet", {
      description: `${dj.stage_name} er blevet underrettet om at ringe dig op i dag.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-rose-500" />
            Anmod om opkald fra {dj.stage_name}
          </DialogTitle>
          <DialogDescription>
            Vi sender en opkaldsanmodning via app + e-mail + SMS. {dj.stage_name} ringer
            dig op — dit nummer forbliver skjult, DJ'en ser det, når du bekræfter.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 rounded-lg border bg-muted/30 p-3 text-xs">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Dit nummer deles kun med denne DJ — ikke de andre.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Opkald normalt inden for få timer, senest samme dag.
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Afvis når som helst — DJ'en ser ikke dit nummer igen.
          </li>
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annullér
          </Button>
          <Button onClick={handleConfirm}>Ja, anmod om opkald</Button>
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
    toast("Booking bekræftet", {
      description: `${dj.stage_name} er booket til dit event. Vi frigiver escrow efter eventet.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Book {dj.stage_name} med escrow
          </DialogTitle>
          <DialogDescription>
            Vi holder depøsittet, indtil eventet er bekræftet. Efter eventet frigives restbeløbet
            til DJ'en. Du kan stadig skrive til dem på platformen når som helst.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tilbud i alt</span>
              <span className="font-semibold">{price} kr</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Depøsitum i dag (30%)</span>
              <span className="font-semibold text-rose-700">
                {deposit.toLocaleString("da-DK")} kr
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Restbeløb efter event</span>
              <span className="font-semibold">
                {balance.toLocaleString("da-DK")} kr
              </span>
            </div>
          </div>
          <ul className="space-y-1.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-900">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Øvrige tilbud frigives automatisk — DJ'erne
              får besked om, at du har valgt.
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Fuld tilbagebetaling, hvis DJ'en aflyser.
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Direkte kontaktoplysninger udveksles, efter
              bookingen er bekræftet.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annullér
          </Button>
          <Button onClick={handleConfirm}>
            Betal {deposit.toLocaleString("da-DK")} kr depøsitum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
