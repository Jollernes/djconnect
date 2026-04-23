import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function CustomerFavouritesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Favourite DJs</h1>
      <EmptyState
        icon={<Heart className="h-8 w-8" />}
        title="No favourites yet"
        description="Tap the heart icon on a DJ's profile to save them here for later."
        action={<Button asChild variant="accent"><Link to="/search">Browse DJs</Link></Button>}
      />
    </div>
  );
}
