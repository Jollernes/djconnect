import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FirmaPackage } from "@/firmadj/types";
import { formatDkk } from "@/firmadj/data/pricing";

interface PackageCardProps {
  firmaPackage: FirmaPackage;
  className?: string;
}

export function PackageCard({ firmaPackage, className }: PackageCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="h-full">
      <Card className={cn("glass h-full overflow-hidden border-white/10", className)}>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={firmaPackage.featured ? "accent" : "secondary"} className="gap-1.5">
              {firmaPackage.featured ? <Sparkles className="h-3.5 w-3.5" /> : null}
              {firmaPackage.featured ? "Mest populær" : "Fra"}
            </Badge>
            <div className="text-sm text-muted-foreground">Fra</div>
          </div>
          <div>
            <CardTitle className="font-display text-2xl">{firmaPackage.name}</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">{firmaPackage.tagline}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">{firmaPackage.description}</p>
          <div className="space-y-2">
            {firmaPackage.inclusions.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
            <div className="text-sm text-muted-foreground">Fra</div>
            <div className="font-display text-3xl font-bold">{formatDkk(firmaPackage.basePrice)}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link to="/book">Beregn præcis pris</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
