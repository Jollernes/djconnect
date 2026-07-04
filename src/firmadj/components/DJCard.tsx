import { motion } from "framer-motion";
import { MapPin, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { FirmaDJ } from "@/firmadj/types";

interface DJCardProps {
  dj: FirmaDJ;
  onAction?: () => void;
  actionLabel?: string;
}

export function DJCard({ dj, onAction, actionLabel }: DJCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="h-full">
      <Card className="glass h-full overflow-hidden border-white/10">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={dj.photo}
            alt={dj.alt}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute left-4 top-4">
            <Badge variant="accent" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Corporate
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h3 className="font-display text-2xl font-semibold">{dj.stageName}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">“{dj.quote}”</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dj.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Referencer</div>
            <p className="text-sm leading-6 text-muted-foreground">{dj.references.join(" · ")}</p>
          </div>
        </CardContent>
        {onAction && actionLabel ? (
          <CardFooter>
            <Button className="w-full gap-2" variant="outline" onClick={onAction}>
              <PlayCircle className="h-4 w-4" />
              {actionLabel}
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </motion.div>
  );
}
