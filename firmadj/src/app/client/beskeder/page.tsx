"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClientDashboard, getMessagesForBooking, submitMessage } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ClientBeskederPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    getClientDashboard().then((d) => {
      setData(d);
      if (d?.bookings?.length) setSelectedBooking(d.bookings[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      getMessagesForBooking(selectedBooking).then(setMessages);
    }
  }, [selectedBooking]);

  if (!data) return <div className="py-12">Indlæser...</div>;

  const booking = data.bookings.find((b: any) => b.id === selectedBooking);

  async function send() {
    if (!selectedBooking || !message) return;
    await submitMessage(selectedBooking, message, "client");
    toast.success("Besked sendt");
    setMessage("");
    setMessages(await getMessagesForBooking(selectedBooking));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Beskeder</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          {data.bookings.map((b: any) => (
            <button key={b.id} onClick={() => setSelectedBooking(b.id)} className={`w-full text-left p-3 rounded-lg border ${selectedBooking === b.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className="font-semibold text-slate-900">{data.briefs.find((br: any) => br.id === b.event_brief_id)?.event_type}</div>
              <div className="text-xs text-slate-500">{data.briefs.find((br: any) => br.id === b.event_brief_id)?.city}</div>
            </button>
          ))}
        </div>
        <Card className="md:col-span-2 border-slate-200">
          <CardContent className="p-6">
            {selectedBooking ? (
              <div>
                <div className="h-64 overflow-y-auto bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                  {messages.length ? messages.map((m: any) => (
                    <div key={m.id} className={`p-3 rounded-lg max-w-[80%] ${m.sender_role === 'client' ? 'bg-amber-100 ml-auto' : 'bg-white border border-slate-200'}`}>
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
