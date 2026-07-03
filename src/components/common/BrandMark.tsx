import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

export function BrandMark({ className, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-white/10 bg-primary text-primary-foreground shadow-sm",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      <span className="text-sm font-semibold tracking-[0.2em]">DJ</span>
    </span>
  );
}
