import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/common/BrandMark";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME } from "@/lib/constants";

export function FlowLayout({
  children,
  exitLabel = "Gem og fortsæt senere",
}: {
  children: ReactNode;
  exitLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/15">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-foreground">
            <BrandMark size="sm" />
            <span className="tracking-tight">{PLATFORM_NAME}</span>
          </Link>
          <Button asChild variant="ghost" className="ml-auto hidden sm:inline-flex">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {exitLabel}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="ml-auto sm:hidden" aria-label={exitLabel}>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
