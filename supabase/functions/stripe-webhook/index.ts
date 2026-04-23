// Stripe webhook handler.
// Configure in Stripe dashboard: endpoint URL = https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
// Events: checkout.session.completed, payment_intent.payment_failed, charge.refunded, account.updated
// Deploy: `supabase functions deploy stripe-webhook --no-verify-jwt`

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Bad signature: ${err instanceof Error ? err.message : "?"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        if (!bookingId) break;
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
            accepted_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        const { data: booking } = await supabase
          .from("bookings")
          .select("id, dj_profile_id, payout_minor, currency, event_date")
          .eq("id", bookingId)
          .single();

        if (booking) {
          const scheduled = new Date(`${booking.event_date}T23:59:00Z`);
          scheduled.setUTCHours(scheduled.getUTCHours() + 24);
          await supabase.from("payouts").upsert({
            booking_id: booking.id,
            dj_profile_id: booking.dj_profile_id,
            amount_minor: booking.payout_minor,
            currency: booking.currency,
            scheduled_for: scheduled.toISOString(),
            status: "pending",
          });
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await supabase
          .from("dj_profiles")
          .update({
            stripe_charges_enabled: account.charges_enabled ?? false,
            stripe_payouts_enabled: account.payouts_enabled ?? false,
          })
          .eq("stripe_account_id", account.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const bookingId = charge.metadata?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ status: "refunded", cancelled_at: new Date().toISOString() })
            .eq("id", bookingId);
        }
        break;
      }
    }
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
});
