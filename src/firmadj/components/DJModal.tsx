import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FirmaDJ } from "@/firmadj/types";
import { Play } from "lucide-react";

interface DJModalProps {
  dj: FirmaDJ | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (djId: string) => void;
}

export function DJModal({ dj, open, onOpenChange, onSelect }: DJModalProps) {
  if (!dj) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl border-white/10 bg-background/95 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{dj.stageName}</DialogTitle>
          <DialogDescription>Ledige profiler til jeres event</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/30 via-background to-accent/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-2xl shadow-black/30">
                <Play className="h-8 w-8 fill-white" />
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">“{dj.quote}”</p>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stilarter</div>
            <div className="flex flex-wrap gap-2">
              {dj.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Referencer</div>
            <p className="text-sm leading-6">{dj.references.join(" · ")}</p>
          </div>

          <Button className="w-full" size="lg" onClick={() => onSelect(dj.id)}>
            Vælg denne DJ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
