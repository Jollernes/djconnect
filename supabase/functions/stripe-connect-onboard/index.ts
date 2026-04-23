// Creates (or reuses) a Stripe Connect Express account for the signed-in DJ
// and returns a fresh onboarding link.
//
// Body: { returnUrl: string, refreshUrl: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Missing Authorization" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Unauthenticated" }, 401);

  const { returnUrl, refreshUrl } = await req.json();
  if (!returnUrl || !refreshUrl) return json({ error: "Missing URLs" }, 400);

  const { data: djRow } = await supabase
    .from("dj_profiles")
    .select("id, stripe_account_id, user_id")
    .eq("user_id", user.id)
    .single();

  if (!djRow) return json({ error: "DJ profile not found" }, 404);

  let accountId = djRow.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      metadata: { dj_profile_id: djRow.id },
    });
    accountId = account.id;
    await supabase.from("dj_profiles").update({ stripe_account_id: accountId }).eq("id", djRow.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });

  return json({ url: link.url });
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(), "Content-Type": "application/json" } });
}
