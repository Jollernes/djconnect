import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferRequestStatusView } from "@/components/offer-request/OfferRequestStatusView";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useOfferRequestRecord } from "@/hooks/useOfferRequestRecord";

/**
 * Live progress page for a single offer request, embedded in the customer
 * dashboard chrome. Same view as the public /my-requests/:id page; only the
 * surrounding navigation differs.
 */
export function CustomerRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { record, loading, elapsedHours, remainingHours } =
    useOfferRequestRecord(requestId);

  useDocumentHead({
    title: "Your DJ offers · DJConnect",
    description:
      "Track your matched DJs and incoming personal quotes — quietly, in real time.",
  });

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading your request…</div>
    );
  }
  if (!record || !requestId) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          We couldn't find that request
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have been started on a different device. You can return to your
          list of requests, or send a new brief.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/requests">My requests</Link>
          </Button>
          <Button asChild>
            <Link to="/get-offers">Send a new brief</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        to="/dashboard/requests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All requests
      </Link>
      <OfferRequestStatusView
        record={record}
        requestId={requestId}
        elapsedHours={elapsedHours}
        remainingHours={remainingHours}
      />
    </div>
  );
}
