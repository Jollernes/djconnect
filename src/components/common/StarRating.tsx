import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  outOf?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ value, outOf = 5, size = "md", showValue = false, reviewCount, className }: Props) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: outOf }, (_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, i < Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40")}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">
          {value.toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="ml-1 text-muted-foreground">({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}
