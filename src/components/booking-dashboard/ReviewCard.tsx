import { useState } from "react";
import { Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BookingWithRelations } from "@/types/domain";

export function ReviewCard({ booking }: { booking: BookingWithRelations }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (text.trim().length < 20) {
      toast.error("Anmeldelsen skal være mindst 20 tegn");
      return;
    }
    setSubmitted(true);
    toast.success("Anmeldelse sendt — tak!");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <Trophy className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="mt-3 text-lg font-semibold">Tak for din anmeldelse!</h3>
        <p className="text-sm text-muted-foreground">
          Din feedback hjælper andre værter med at finde gode DJs.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Hvordan gik det?</h2>
      <p className="text-sm text-muted-foreground">
        Skriv en anmeldelse af {booking.dj_profile.stage_name}.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${n} stjerne${n === 1 ? "" : "r"}`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                (hover || rating) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        rows={4}
        className="mt-4"
        placeholder="Hvad var særligt ved aftenen? (min. 20 tegn)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button onClick={submit} className="mt-3 w-full" variant="accent">
        Send anmeldelse
      </Button>
    </div>
  );
}
