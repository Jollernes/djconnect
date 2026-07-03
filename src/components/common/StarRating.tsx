import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`${rating} ud af 5 stjerner`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= Math.round(rating);
        return <Star key={index} className={cn("h-4 w-4", filled ? "fill-gold text-gold" : "text-muted-foreground/40")} />;
      })}
    </div>
  );
}
