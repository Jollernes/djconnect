import { cn } from "@/lib/utils";
import { Equalizer } from "./Equalizer";

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
        "relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary text-accent",
        sizeMap[size],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsla(21,90%,53%,0.55), transparent 60%), radial-gradient(circle at 80% 80%, hsla(199,89%,60%,0.45), transparent 60%)",
        }}
      />
      <Equalizer bars={4} className="relative h-[55%]" barClassName="bg-accent" />
    </span>
  );
}
