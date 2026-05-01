import { cn } from "@/lib/utils";

type Props = {
  bars?: number;
  className?: string;
  barClassName?: string;
};

export function Equalizer({ bars = 5, className, barClassName }: Props) {
  return (
    <div className={cn("flex h-6 items-end gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("block w-[3px] rounded-sm bg-current origin-bottom", barClassName)}
          style={{
            animation: "eq-bounce 0.9s ease-in-out infinite",
            animationDelay: `${(i * 0.12) % 1}s`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}
