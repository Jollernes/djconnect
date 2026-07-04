import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/firmadj/components/BrandMark";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link to="/" className="shrink-0">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link to="/vores-djs">Vores DJs</Link>
          </Button>
          <Button asChild>
            <Link to="/book">Se priser og ledighed</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
