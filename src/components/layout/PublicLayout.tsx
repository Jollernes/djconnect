import { useLocation } from "react-router-dom";
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicLayout() {
  const location = useLocation();
  const showBottomCta = !["/login", "/handelsbetingelser", "/privatlivspolitik"].includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      {showBottomCta ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
          <Button asChild variant="accent" className="h-12 w-full rounded-full">
            <Link to="/brief">Tjek dato og få match</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
