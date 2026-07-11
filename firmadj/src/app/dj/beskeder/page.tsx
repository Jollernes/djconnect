"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { getDJByUserId, getStore, getMessagesForBooking, submitMessage } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DJBeskederPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    getSession().then(async (s) => {
      if (s) {
        const [dj, store] = await Promise.all([getDJByUserId(s.userId), getStore()]);
        if (dj) {
          const bookings = store.bookings.filter((b: any) => b.selected_dj_id === dj.id || b.backup_dj_id === dj.id);
          const enriched = bookings.map((b: any) => ({ ...b, brief: store.eventBriefs.find((br: any) => br.id === b.event_brief_id) }));
          setEvents(enriched);
          if (enriched.length) setSelected(enriched[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selected) {
      getMessagesForBooking(selected).then(setMessages);
    }
  }, [selected]);

  async function send() {
    if (!selected || !message) return;
    await submitMessage(selected, message, "dj");
    toast.success("Besked sendt");
    setMessage("");
    setMessages(await getMessagesForBooking(selected));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Beskeder</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          {events.map((b: any) => (
            <button key={b.id} onClick={() => setSelected(b.id)} className={`w-full text-left p-3 rounded-lg border ${selected === b.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className="font-semibold text-slate-900">{b.brief?.event_type}</div>
              <div className="text-xs text-slate-500">{b.brief?.city}</div>
            </button>
          ))}
        </div>
        <Card className="md:col-span-2 border-slate-200">
          <CardContent className="p-6">
            {selected ? (
              <div>
                <div className="h-64 overflow-y-auto bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                  {messages.length ? messages.map((m) => (
                    <div key={m.id} className={`p-3 rounded-lg max-w-[80%] ${m.sender_role === 'dj' ? 'bg-amber-100 ml-auto' : 'bg-white border border-slate-200'}`}>
                      <div className="text-xs text-slate-500 mb-1">{m.sender_role}</div>
                      <div className="text-sm text-slate-800">{m.message}</div>
                    </div>
                  )) : <p className="text-slate-500 text-sm">Ingen beskeder endnu.</p>}
                </div>
                <div className="flex gap-2">
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Skriv besked..." />
                  <Button onClick={send} className="bg-slate-900 hover:bg-slate-800 text-white">Send</Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Vælg et arrangement.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
