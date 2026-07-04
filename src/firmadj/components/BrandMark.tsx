import { Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Disc3 className="h-6 w-6" />
      </div>
      <div className="leading-none">
        <div className="font-display text-lg font-semibold tracking-[0.14em] uppercase">FirmaDJ</div>
        {!compact ? <div className="text-xs text-muted-foreground">Premium DJ-booking til firmafester</div> : null}
      </div>
    </div>
  );
}
