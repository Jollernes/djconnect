import { Outlet } from "react-router-dom";
import { Header } from "@/firmadj/layout/Header";
import { Footer } from "@/firmadj/layout/Footer";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
