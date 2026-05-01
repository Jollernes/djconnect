import { useState } from "react";
import { EventContextModal } from "@/components/common/EventContextModal";
import { useEventContext } from "@/hooks/useEventContext";
import { HERO_IMAGE } from "@/lib/weddingDJsContent";

export function WeddingDJsHero() {
  const { set: setEventType } = useEventContext();
  const [switchOpen, setSwitchOpen] = useState(false);
  return (
    <>
      <section className="border-b bg-white">
        <div className="container py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex items-center gap-4 sm:gap-5">
              <img
                src={HERO_IMAGE}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                loading="eager"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Wedding DJs · Denmark
                </p>
                <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Find your wedding DJ.
                </h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Verified DJs across Denmark. Written contract and escrow-protected payment included.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSwitchOpen(true)}
              className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
            >
              Switch event
            </button>
          </div>
        </div>
      </section>
      <EventContextModal
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        value="wedding"
        onSelect={(id) => {
          setEventType(id);
          if (!id) {
            window.location.href = "/search";
          } else if (id !== "wedding") {
            window.location.href = `/search?eventType=${id}`;
          }
        }}
        title="Switch event"
        description="Browsing for a different event will change the DJ profiles you see."
      />
    </>
  );
}
