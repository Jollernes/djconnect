import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/common/StarRating";
import { mockReviews, mockDJs } from "@/data/mock";
import { formatDate } from "@/lib/utils";
import { EyeOff } from "lucide-react";

export function AdminReviewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Moderation af anmeldelser</h1>
      <div className="space-y-3">
        {mockReviews.map((r) => {
          const dj = mockDJs.find((d) => d.id === r.dj_profile_id);
          return (
            <Card key={r.id}>
              <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} size="sm" />
                    <span className="text-sm font-medium">{dj?.stage_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm">{r.body}</p>
                </div>
                <Button variant="outline" size="sm"><EyeOff className="h-4 w-4" /> Skjul</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
