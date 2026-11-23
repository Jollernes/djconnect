import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function CustomerFavouritesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Favorit-DJs</h1>
      <EmptyState
        icon={<Heart className="h-8 w-8" />}
        title="Ingen favoritter endnu"
        description="Tryk på hjerteikonet på en DJ's profil for at gemme den her til senere."
        action={<Button asChild variant="accent"><Link to="/search">Find DJs</Link></Button>}
      />
    </div>
  );
}
