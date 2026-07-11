"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Music2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { useEffect, useState } from "react";

const publicLinks = [
  { href: "/", label: "Forside" },
  { href: "/pakker", label: "Pakker" },
  { href: "/saadan-fungerer-det", label: "Sådan fungerer det" },
  { href: "/faq", label: "FAQ" },
  { href: "/tryghed-og-kvalitet", label: "Tryghed og kvalitet" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ role: string } | null>(null);

  useEffect(() => {
    getSession().then((s) => setSession(s)).catch(() => {});
  }, []);

  const dashboardHref = session?.role === "admin" ? "/admin" : session?.role === "dj" ? "/dj" : "/client";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
              <Music2 className="w-5 h-5" />
            </div>
            <span className="text-lg tracking-tight">FirmaDJ</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-slate-900 transition ${pathname === link.href ? "text-slate-900" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/brief">Tjek dato</Link>
            </Button>
            {session ? (
              <Button asChild variant="outline" size="sm">
                <Link href={dashboardHref}>Mit område</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Log ind</Link>
              </Button>
            )}

            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button>} />
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {publicLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium text-slate-700">
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/brief" className="text-lg font-medium text-amber-600">
                    Tjek dato
                  </Link>
                  <Link href="/login" className="text-lg font-medium text-slate-700">
                    Log ind
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
