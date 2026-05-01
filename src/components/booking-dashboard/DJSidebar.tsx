import { Link } from "react-router-dom";
import { Mail, Phone, ExternalLink, ShieldCheck, Lock, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/common/StarRating";
import type { BookingWithRelations } from "@/types/domain";

export function DJSidebar({ booking }: { booking: BookingWithRelations }) {
  const dj = booking.dj_profile;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-24 bg-gradient-to-br from-primary via-primary to-fuchsia-700" />
        <div className="-mt-12 px-5 pb-5">
          <img
            src={dj.profile.avatar_url ?? ""}
            alt=""
            className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-md"
          />
          <div className="mt-3">
            <Link
              to={`/djs/${dj.username}`}
              className="text-base font-semibold hover:underline"
            >
              {dj.stage_name}
            </Link>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {dj.base_location}
            </div>
            <StarRating
              value={dj.rating_average}
              size="sm"
              showValue
              reviewCount={dj.rating_count}
              className="mt-2"
            />
          </div>

          <div className="mt-4 grid gap-2">
            <Button asChild variant="accent" size="sm" className="w-full gap-2">
              <a href="#messages">
                <MessageCircle className="h-4 w-4" /> Message
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full gap-2">
              <Link to={`/djs/${dj.username}`}>
                <ExternalLink className="h-4 w-4" /> View public profile
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="ghost" size="sm" className="gap-2 text-xs">
                <a href={`mailto:${dj.profile.email ?? ""}`}>
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="gap-2 text-xs">
                <a href={`tel:${dj.profile.phone ?? ""}`}>
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your booking is protected
        </h3>
        <ul className="mt-3 space-y-2.5">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>Money-back protection if your DJ no-shows</span>
          </li>
          <li className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>Funds held in escrow until after your event</span>
          </li>
          <li className="flex items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
            <span>24/7 support whenever you need it</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
