import { useEffect, useMemo, useState } from "react";
import { Music, Plus, X, Heart, Ban, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MusicState = {
  mustPlay: string[];
  doNotPlay: string[];
  specialMoments: { label: string; song: string }[];
};

const DEFAULT: MusicState = {
  mustPlay: [],
  doNotPlay: [],
  specialMoments: [
    { label: "First dance", song: "" },
    { label: "Walk-in / entrance", song: "" },
    { label: "Last song of the night", song: "" },
  ],
};

const SUGGESTIONS = [
  "Mr. Brightside — The Killers",
  "Don't Stop Me Now — Queen",
  "Dancing Queen — ABBA",
  "September — Earth, Wind & Fire",
  "I Wanna Dance with Somebody — Whitney Houston",
  "Uptown Funk — Mark Ronson",
];

export function MusicPlanner({ bookingId }: { bookingId: string }) {
  const storageKey = useMemo(() => `djconnect:music:${bookingId}`, [bookingId]);
  const [state, setState] = useState<MusicState>(DEFAULT);
  const [mustInput, setMustInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function persist(next: MusicState) {
    setState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function addMust(value: string) {
    const v = value.trim();
    if (!v || state.mustPlay.includes(v)) return;
    persist({ ...state, mustPlay: [...state.mustPlay, v] });
    setMustInput("");
  }
  function removeMust(value: string) {
    persist({ ...state, mustPlay: state.mustPlay.filter((s) => s !== value) });
  }
  function addAvoid(value: string) {
    const v = value.trim();
    if (!v || state.doNotPlay.includes(v)) return;
    persist({ ...state, doNotPlay: [...state.doNotPlay, v] });
    setAvoidInput("");
  }
  function removeAvoid(value: string) {
    persist({ ...state, doNotPlay: state.doNotPlay.filter((s) => s !== value) });
  }
  function setMoment(idx: number, song: string) {
    const next = [...state.specialMoments];
    next[idx] = { ...next[idx]!, song };
    persist({ ...state, specialMoments: next });
  }
  function addMoment() {
    persist({
      ...state,
      specialMoments: [...state.specialMoments, { label: "Custom moment", song: "" }],
    });
  }

  const total = state.mustPlay.length + state.doNotPlay.length + state.specialMoments.filter((m) => m.song).length;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Music className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Music planner</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {total} item{total === 1 ? "" : "s"} shared with your DJ
        </span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Tell your DJ what to play and what to avoid. Edits save automatically.
      </p>

      <Tabs defaultValue="must">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="must" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" /> Must play
          </TabsTrigger>
          <TabsTrigger value="avoid" className="gap-1.5">
            <Ban className="h-3.5 w-3.5" /> Avoid
          </TabsTrigger>
          <TabsTrigger value="moments" className="gap-1.5">
            <Star className="h-3.5 w-3.5" /> Moments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="must" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={mustInput}
              onChange={(e) => setMustInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMust(mustInput))}
              placeholder="e.g. Don't Stop Me Now — Queen"
            />
            <Button type="button" onClick={() => addMust(mustInput)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {state.mustPlay.length === 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Need ideas? Tap to add:</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addMust(s)}
                    className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {state.mustPlay.map((song) => (
                <li
                  key={song}
                  className="group inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-900"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  {song}
                  <button
                    type="button"
                    onClick={() => removeMust(song)}
                    className="rounded-full p-0.5 text-rose-700/60 transition-colors hover:bg-rose-200 hover:text-rose-900"
                    aria-label={`Remove ${song}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="avoid" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAvoid(avoidInput))}
              placeholder="Songs, artists, or genres to avoid"
            />
            <Button type="button" onClick={() => addAvoid(avoidInput)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {state.doNotPlay.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
              No tracks on the do-not-play list yet.
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {state.doNotPlay.map((song) => (
                <li
                  key={song}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                >
                  <Ban className="h-3.5 w-3.5 text-slate-500" />
                  {song}
                  <button
                    type="button"
                    onClick={() => removeAvoid(song)}
                    className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                    aria-label={`Remove ${song}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="moments" className="mt-4 space-y-3">
          {state.specialMoments.map((m, i) => (
            <div key={i} className="grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[10rem_1fr]">
              <div className="text-sm font-medium text-foreground">{m.label}</div>
              <Input
                value={m.song}
                onChange={(e) => setMoment(i, e.target.value)}
                placeholder="Song & artist"
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addMoment}>
            <Plus className="h-4 w-4" /> Add another moment
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
