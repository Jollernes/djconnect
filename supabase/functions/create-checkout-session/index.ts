// Supabase Edge Function — creates a Stripe Checkout session for a booking.
// Deploy: `supabase functions deploy create-checkout-session`.
//
// Body: { bookingId: string, successUrl: string, cancelUrl: string }
// Auth: caller must be signed in and own the booking as the customer.
//
// The checkout session transfers funds using Stripe Connect with a `transfer_data.destination`
// pointing to the DJ's connected account. Platform fee is deducted as `application_fee_amount`.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const feePercent = Number(Deno.env.get("PLATFORM_FEE_PERCENT") ?? "10");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Missing Authorization header" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthenticated" }, 401);

    const { bookingId, successUrl, cancelUrl } = await req.json();
    if (!bookingId || !successUrl || !cancelUrl) return json({ error: "Missing fields" }, 400);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, customer_id, price_minor, currency, dj_profile_id, dj_profile:dj_profiles(stripe_account_id, stage_name)")
      .eq("id", bookingId)
      .single();

    if (error || !booking) return json({ error: "Booking not found" }, 404);
    if (booking.customer_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (!booking.price_minor) return json({ error: "Booking has no price set" }, 400);

    const dj = Array.isArray(booking.dj_profile) ? booking.dj_profile[0] : booking.dj_profile;
    if (!dj?.stripe_account_id) return json({ error: "DJ has not connected Stripe yet" }, 400);

    const platformFee = Math.round((booking.price_minor * feePercent) / 100);
    const customerTotal = booking.price_minor + platformFee;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${successUrl}?booking=${booking.id}`,
      cancel_url: `${cancelUrl}?booking=${booking.id}`,
      metadata: { booking_id: booking.id },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: booking.currency.toLowerCase(),
          unit_amount: customerTotal,
          product_data: { name: `DJ booking — ${dj.stage_name}` },
        },
      }],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: dj.stripe_account_id },
        metadata: { booking_id: booking.id },
      },
    });

    await supabase
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        platform_fee_minor: platformFee,
        payout_minor: booking.price_minor - platformFee,
        status: "awaiting_payment",
      })
      .eq("id", booking.id);

    return json({ sessionId: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}
