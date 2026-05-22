import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useEventContext } from "@/hooks/useEventContext";
import { useDJ, useDJs } from "@/hooks/useDJs";
import { mockReviews } from "@/data/mock";
import { DJProfileView } from "./DJProfileView";

/**
 * Route wrapper for the public DJ profile page. Resolves the username
 * from the URL, fetches DJ + reviews + similar DJs, and delegates the
 * actual rendering to {@link DJProfileView} so the same visual layout
 * can be reused inside the DJ profile editor as a live preview.
 */
export function DJProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { dj, reviews: liveReviews, loading } = useDJ(username ?? "");
  const { djs: allDJs } = useDJs();
  const { eventTypeId, set: setEventType } = useEventContext();

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-2/3" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Skeleton className="aspect-[5/4] w-full" />
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (!dj) {
    return (
      <div className="container py-16">
        <EmptyState
          title="DJ not found"
          description="This profile may have been removed or is pending verification."
          action={
            <Button asChild>
              <Link to="/search">Browse other DJs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const reviews = liveReviews.length
    ? liveReviews
    : mockReviews.filter((r) => r.dj_profile_id === dj.id);
  const similarDJs = allDJs.filter((d) => d.id !== dj.id).slice(0, 3);

  return (
    <DJProfileView
      dj={dj}
      reviews={reviews}
      similarDJs={similarDJs}
      eventTypeId={eventTypeId}
      onEventTypeChange={setEventType}
    />
  );
}
