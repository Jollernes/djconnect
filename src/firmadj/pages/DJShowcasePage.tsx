import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DJCard } from "@/firmadj/components/DJCard";
import { djs } from "@/firmadj/data/mock";

export function DJShowcasePage() {
  return (
    <div className="container space-y-10 py-12 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Vores DJs</div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">Kuraterede profiler til corporate events.</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Se DJ-profilerne, deres lyd og hvilke danske virksomheder, de allerede har spillet for.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link to="/book">
            Er disse profiler ledige? Tjek jeres dato her.
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {djs.map((dj) => (
          <DJCard key={dj.id} dj={dj} />
        ))}
      </motion.div>

      <div className="flex justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link to="/book">
            Er disse profiler ledige? Tjek jeres dato her.
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
