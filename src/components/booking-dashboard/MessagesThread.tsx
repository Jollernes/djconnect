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
      text: `Hi ${booking.customer.full_name.split(" ")[0]}! Thanks for the booking — I'm thrilled to be playing your event. Let me know any songs you'd love to hear or themes you're going for.`,
      at: new Date(base + 4 * 3600_000).toISOString(),
    },
    {
      id: "m2",
      from: "customer",
      text: `Hi ${dj}! So happy you said yes. We'd love a mix of 80s/90s and current chart, and definitely no metal :) — I'll fill in the music planner today.`,
      at: new Date(base + 5 * 3600_000).toISOString(),
    },
    {
      id: "m3",
      from: "dj",
      text: "Perfect — I'll watch the music planner for updates. Let's also lock the run-of-show two weeks before the event. Talk soon!",
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
    toast.success("Message sent");
    setTimeout(() => {
      const reply: ChatMsg = {
        id: crypto.randomUUID(),
        from: "dj",
        text: "Got it — thanks! I'll review and get back to you within 24h.",
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
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="text-xs text-muted-foreground">
            Stay in the platform for full booking protection.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
          ● Online recently
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
          placeholder={`Message ${booking.dj_profile.stage_name}…`}
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
