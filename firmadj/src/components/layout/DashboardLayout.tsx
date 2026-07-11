"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Music2, LogOut } from "lucide-react";
import { logout } from "@/lib/server";
import { useRouter } from "next/navigation";

export function DashboardLayout({ children, role, navItems }: { children: React.ReactNode; role: 'client' | 'dj' | 'admin'; navItems: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900">
              <Music2 className="w-5 h-5" />
            </div>
            <span className="text-lg tracking-tight">FirmaDJ</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:inline capitalize">{role}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Log ud
            </Button>
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden"><Menu className="w-5 h-5" /></Button>} />
              <SheetContent side="left" className="w-64 bg-slate-900 text-white border-slate-800">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${pathname === item.href ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <aside className="hidden lg:block w-64 border-r border-slate-200 bg-white p-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${pathname === item.href ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
