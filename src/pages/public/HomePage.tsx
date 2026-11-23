import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDJs } from "@/hooks/useDJs";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { mockDJs } from "@/data/mock";
import { HomeDJCard, HomeDJCardSkeleton } from "@/components/home/HomeDJCard";
import { PackageGuide } from "@/components/home/PackageGuide";
import { TrustSection } from "@/components/home/TrustSection";
import { DJRecruitment } from "@/components/home/DJRecruitment";
import { FormerHomeHero } from "@/pages/public/HomePagePrevious";

export function HomePage() {
  useDocumentHead({
    title: "DJConnect – Find og book den perfekte DJ til din fest",
    description:
      "Find verificerede DJs med eget lyd- og lysanlæg i hele Danmark. Gennemsigtige priser og sikker booking til bryllupper, firmafester og fødselsdage.",
    canonical: "/",
  });

  const { djs, loading } = useDJs({ sortBy: "relevance" });
  // When no live DJ accounts can be loaded (backend unavailable or no
  // approved DJs yet), fall back to the seeded demo DJs so the
  // homepage never shows an empty marketplace.
  const listing = (!loading && djs.length === 0 ? mockDJs.filter((d) => d.verification_status === "approved") : djs)
    .slice(0, 6);

  return (
    <div className="bg-white">
      <FormerHomeHero />

      <section className="container py-16 sm:py-24">
        <SectionHeading
          title="Find DJs i hele Danmark"
          subtitle="Verificerede DJs med eget mobilt diskotek – lyd og lys er altid inkluderet."
          cta={{ to: "/search", label: "Se alle DJs" }}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <HomeDJCardSkeleton key={i} />)
            : listing.map((dj) => <HomeDJCard key={dj.id} dj={dj} />)}
        </div>
      </section>

      <PackageGuide />
      <TrustSection />
      <DJRecruitment />
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  cta,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  cta?: { to: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      }
    >
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">{subtitle}</p>}
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-accent"
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ---------- Hero ---------- */
