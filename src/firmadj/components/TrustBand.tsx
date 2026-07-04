import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const references = ["Novo Nordisk", "Mærsk", "Danske Bank", "LEGO", "Ørsted", "Carlsberg"];

export function TrustBand() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
      className="glass rounded-3xl p-6 md:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Betroet af</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {references.map((reference) => (
              <Badge key={reference} variant="outline" className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-sm">
                {reference}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background/30 px-4 py-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5 fill-accent text-accent" />
            ))}
          </div>
          <div>
            <div className="font-semibold">4,9/5 på Trustpilot-stil niveau</div>
            <div className="text-sm text-muted-foreground">Professionelle bookinger, hurtig dialog og backup inkluderet.</div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
