import { Link, Navigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { OfferRequestStatusView } from "@/components/offer-request/OfferRequestStatusView";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useOfferRequestRecord } from "@/hooks/useOfferRequestRecord";

/**
 * Public live-progress page reachable via direct URL — for guests, or until
 * we wire magic-link auth. Logged-in customers are redirected to the same
 * view inside the customer dashboard chrome (`/dashboard/requests/:id`)
 * so navigation stays consistent with the rest of their account.
 */
export function MyRequestPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { profile } = useAuth();
  const { record, loading, elapsedHours, remainingHours } = useOfferRequestRecord(requestId);

  useDocumentHead({
    title: "Dine DJ-tilbud · DJConnect",
    description:
      "Følg dine matchede DJs og indkomne personlige tilbud — roligt, i realtid.",
  });

  // Logged-in customers see this inside the dashboard layout instead.
  if (profile?.role === "customer" && requestId) {
    return <Navigate to={`/dashboard/requests/${requestId}`} replace />;
  }

  if (loading) return <Shell><Loading /></Shell>;
  if (!record || !requestId) {
    return (
      <Shell>
        <NotFound />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <OfferRequestStatusView
          record={record}
          requestId={requestId}
          elapsedHours={elapsedHours}
          remainingHours={remainingHours}
        />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground md:px-6">
      Indlæser din forespørgsel…
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Vi kunne ikke finde den forespørgsel
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Linket er måske udløbet, eller du åbnede det på en anden enhed. Start en
        ny brief — det tager omkring to minutter.
      </p>
      <Button asChild className="mt-6">
        <Link to="/get-offers">Send en ny brief</Link>
      </Button>
    </div>
  );
}
