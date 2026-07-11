import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
