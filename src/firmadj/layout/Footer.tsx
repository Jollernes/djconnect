import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/firmadj/components/BrandMark";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/40">
      <div className="container py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <BrandMark compact />
          <div className="max-w-md text-sm leading-6 text-muted-foreground">
            En premium, dansk managed marketplace til firmafester — med ordentlig afvikling, klare priser og backup på aftenen.
          </div>
        </div>
        <Separator className="my-8 bg-white/10" />
        <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© FirmaDJ. Alle rettigheder forbeholdes.</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/book" className="transition hover:text-foreground">
              Book en DJ
            </Link>
            <Link to="/vores-djs" className="transition hover:text-foreground">
              Se profiler
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
