"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession } from "@/lib/auth";
import { getDJByUserId, getDJAvailability, getDJDefaultAvailability, updateDJAvailability, updateDJDefaultAvailability } from "@/lib/server";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DJAvailabilityPage() {
  const [dj, setDJ] = useState<any>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  function generateDates() {
    const d: string[] = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      if (day === 4 || day === 5 || day === 6) {
        d.push(date.toISOString().split("T")[0]);
      }
    }
    setDates(d.slice(0, 200));
  }

  useEffect(() => {
    getSession().then(async (s) => {
      if (s) {
        const d = await getDJByUserId(s.userId);
        setDJ(d);
        if (!d) return;
        const [avail, def] = await Promise.all([getDJAvailability(d.id), getDJDefaultAvailability(d.id)]);
        const defaultMap: Record<string, string> = {};
        def.forEach((a: any) => (defaultMap[a.weekday] = a.default_status));
        setDefaults(defaultMap);
        const sel: Record<string, string> = {};
        avail.forEach((a: any) => (sel[a.date] = a.status));
        setSelection(sel);
        generateDates();
      }
    });
  }, []);

  function getStatus(date: string) {
    if (selection[date]) return selection[date];
    const d = new Date(date);
    const weekday = d.getDay() === 4 ? "thursday" : d.getDay() === 5 ? "friday" : "saturday";
    return defaults[weekday] || "unavailable";
  }

  function toggle(date: string) {
    const order = ["available", "tentative", "booked", "unavailable"];
    const current = getStatus(date);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setSelection((prev) => ({ ...prev, [date]: next }));
  }

  async function save() {
    if (!dj) return;
    const entries = Object.entries(selection).map(([date, status]) => ({ date, status, notes: "" }));
    await updateDJAvailability(dj.id, entries);
    toast.success("Tilgængelighed gemt");
  }

  async function saveDefaults() {
    if (!dj) return;
    await updateDJDefaultAvailability(dj.id, {
      thursday: (defaults.thursday as any) || "unavailable",
      friday: (defaults.friday as any) || "available",
      saturday: (defaults.saturday as any) || "available",
    });
    toast.success("Standard gemt");
  }

  function bulkSet(status: string) {
    const next: Record<string, string> = {};
    dates.forEach((d) => (next[d] = status));
    setSelection((prev) => ({ ...prev, ...next }));
  }

  if (!dj) return <div className="py-12">Indlæser...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tilgængelighed</h1>
      <p className="text-slate-600">Vis kun torsdage, fredage og lørdage. Klik på en dato for at skifte status.</p>

      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Torsdag:</span>
              <Select value={defaults.thursday} onValueChange={(v) => setDefaults((p) => ({ ...p, thursday: v || 'unavailable' }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Ledig</SelectItem>
                  <SelectItem value="unavailable">Ikke ledig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Fredag:</span>
              <Select value={defaults.friday} onValueChange={(v) => setDefaults((p) => ({ ...p, friday: v || 'available' }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Ledig</SelectItem>
                  <SelectItem value="unavailable">Ikke ledig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lørdag:</span>
              <Select value={defaults.saturday} onValueChange={(v) => setDefaults((p) => ({ ...p, saturday: v || 'available' }))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Ledig</SelectItem>
                  <SelectItem value="unavailable">Ikke ledig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveDefaults} variant="outline" size="sm">Gem standard</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => bulkSet("available")} variant="outline" size="sm">Alle ledige</Button>
            <Button onClick={() => bulkSet("unavailable")} variant="outline" size="sm">Alle ikke ledige</Button>
            <Button onClick={() => setSelection({})} variant="outline" size="sm">Ryd ændringer</Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {dates.map((date) => {
              const status = getStatus(date);
              const colors = { available: "bg-green-100 border-green-300 text-green-800", tentative: "bg-yellow-100 border-yellow-300 text-yellow-800", booked: "bg-blue-100 border-blue-300 text-blue-800", unavailable: "bg-slate-100 border-slate-300 text-slate-500" };
              const labels = { available: "Ledig", tentative: "Foreløbig", booked: "Booket", unavailable: "Ikke ledig" };
              return (
                <button key={date} onClick={() => toggle(date)} className={`p-3 rounded-lg border text-center text-xs ${colors[status as keyof typeof colors]}`}>
                  <div className="font-semibold">{new Date(date + "T00:00:00").toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" })}</div>
                  <div>{labels[status as keyof typeof labels]}</div>
                </button>
              );
            })}
          </div>

          <Button onClick={save} className="bg-slate-900 hover:bg-slate-800 text-white">Gem tilgængelighed</Button>
        </CardContent>
      </Card>
    </div>
  );
}
