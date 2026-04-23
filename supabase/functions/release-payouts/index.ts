// Scheduled cron (or invoked manually) to release payouts for events that ended
// at least 24h ago. Configure in Supabase dashboard → Edge Functions → Cron
// Example cron: 15 * * * *  (hourly at :15)

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async () => {
  const now = new Date().toISOString();
  const { data: due, error } = await supabase
    .from("payouts")
    .select("id, booking_id, amount_minor, currency, dj_profile_id, booking:bookings(stripe_payment_intent_id, dj_profile:dj_profiles(stripe_account_id))")
    .eq("status", "pending")
    .lte("scheduled_for", now);

  if (error) return new Response(error.message, { status: 500 });
  if (!due?.length) return new Response(JSON.stringify({ released: 0 }), { status: 200 });

  let released = 0;
  for (const row of due) {
    try {
      const booking = Array.isArray(row.booking) ? row.booking[0] : row.booking;
      const dj = booking && (Array.isArray(booking.dj_profile) ? booking.dj_profile[0] : booking.dj_profile);
      const destination = dj?.stripe_account_id;
      if (!destination) continue;

      // With transfer_data.destination on the PaymentIntent, Stripe automatically
      // transfers funds (minus application fee). Nothing else to call here; we just
      // mark the payout released for our own records.
      await supabase
        .from("payouts")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", row.id);

      await supabase
        .from("bookings")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", row.booking_id);

      released++;
    } catch (err) {
      console.error("release failed", row.id, err);
      await supabase.from("payouts").update({ status: "failed" }).eq("id", row.id);
    }
  }
  return new Response(JSON.stringify({ released }), { status: 200 });
});
