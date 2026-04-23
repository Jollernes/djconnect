import { Link } from "react-router-dom";
import { MapPin, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { formatCurrency } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

export function DJCard({ dj }: { dj: DJProfileWithRelations }) {
  const heroImage = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url;
  return (
    <Link to={`/djs/${dj.username}`} className="group">
      <Card className="overflow-hidden transition-all group-hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {heroImage ? (
            <img
              src={heroImage}
              alt={dj.stage_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>
          )}
          {dj.is_featured && (
            <Badge variant="accent" className="absolute left-3 top-3">
              Featured
            </Badge>
          )}
          <Badge variant="success" className="absolute right-3 top-3 gap-1">
            <Shield className="h-3 w-3" />
            Verified
          </Badge>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold">{dj.stage_name}</h3>
            {dj.tagline && <p className="line-clamp-1 text-sm text-muted-foreground">{dj.tagline}</p>}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <StarRating value={dj.rating_average} size="sm" showValue reviewCount={dj.rating_count} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dj.event_types.slice(0, 3).map((et) => (
              <Badge key={et.id} variant="secondary">
                {et.label}
              </Badge>
            ))}
            {dj.event_types.length > 3 && <Badge variant="outline">+{dj.event_types.length - 3}</Badge>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {dj.base_location}
            </span>
            <span className="font-semibold">
              {dj.price_on_request
                ? "Price on request"
                : dj.price_from_minor
                ? `From ${formatCurrency(dj.price_from_minor, dj.currency)}`
                : "—"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
