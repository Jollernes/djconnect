import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { BookingWithRelations } from "@/types/domain";

type ChatMsg = {
  id: string;
  from: "customer" | "dj";
  text: string;
  at: string;
};

function seed(booking: BookingWithRelations): ChatMsg[] {
  const dj = booking.dj_profile.stage_name.split(" ")[0];
  const base = new Date(booking.created_at).getTime();
  return [
    {
      id: "m1",
      from: "dj",
      text: `Hej ${booking.customer.full_name.split(" ")[0]}! Tak for bookingen — jeg glæder mig vildt til at spille til jeres event. Sig endelig til, hvis I har ønskenumre eller et tema, I går efter.`,
      at: new Date(base + 4 * 3600_000).toISOString(),
    },
    {
      id: "m2",
      from: "customer",
      text: `Hej ${dj}! Så glad for, at du sagde ja. Vi vil elske en blanding af 80'er/90'er og nye hits, og helt sikkert ingen metal :) — jeg udfylder musikplanlæggeren i dag.`,
      at: new Date(base + 5 * 3600_000).toISOString(),
    },
    {
      id: "m3",
      from: "dj",
      text: "Perfekt — jeg holder øje med musikplanlæggeren for opdateringer. Lad os også låse køreplanen to uger før eventet. Vi snakkes!",
      at: new Date(base + 6 * 3600_000).toISOString(),
    },
  ];
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesThread({ booking }: { booking: BookingWithRelations }) {
  const storageKey = useMemo(() => `djconnect:msgs:${booking.id}`, [booking.id]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setMessages(seed(booking));
  }, [booking, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const next: ChatMsg[] = [
      ...messages,
      { id: crypto.randomUUID(), from: "customer", text, at: new Date().toISOString() },
    ];
    setMessages(next);
    setDraft("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    toast.success("Besked sendt");
    setTimeout(() => {
      const reply: ChatMsg = {
        id: crypto.randomUUID(),
        from: "dj",
        text: "Modtaget — tak! Jeg kigger på det og vender tilbage inden for 24 timer.",
        at: new Date().toISOString(),
      };
      const after = [...next, reply];
      setMessages(after);
      try {
        localStorage.setItem(storageKey, JSON.stringify(after));
      } catch {
        /* ignore */
      }
    }, 1400);
  }

  return (
    <div id="messages" className="flex flex-col rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="text-lg font-semibold">Beskeder</h2>
          <p className="text-xs text-muted-foreground">
            Bliv på platformen for fuld bookingbeskyttelse.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
          ● Online for nylig
        </span>
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => {
          const mine = m.from === "customer";
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[80%]">
                <div
                  className={
                    mine
                      ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground"
                  }
                >
                  {m.text}
                </div>
                <div className={`mt-1 text-[10px] text-muted-foreground ${mine ? "text-right" : ""}`}>
                  {fmtTime(m.at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex items-end gap-2 border-t p-4">
        <Textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Skriv til ${booking.dj_profile.stage_name}…`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button onClick={send} className="gap-2">
          <Send className="h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  );
}
