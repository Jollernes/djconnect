// Transactional email via Resend. Invoked from other edge functions or from the app
// after a user action. Payload:
//   { template: "booking_confirmed" | "dj_approved" | ..., to: string, data: Record<string, unknown> }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "DJConnect <hello@djconnect.example>";

type Template =
  | "account_created"
  | "dj_application_submitted"
  | "dj_approved"
  | "dj_rejected"
  | "new_booking_request"
  | "booking_confirmed"
  | "booking_declined"
  | "new_message"
  | "payment_successful"
  | "event_reminder"
  | "review_request"
  | "payout_released"
  | "booking_cancelled";

const subjects: Record<Template, string> = {
  account_created: "Welcome to DJConnect",
  dj_application_submitted: "Your DJ application was submitted",
  dj_approved: "You're verified on DJConnect",
  dj_rejected: "DJConnect application — next steps",
  new_booking_request: "New booking request",
  booking_confirmed: "Your booking is confirmed",
  booking_declined: "Booking declined",
  new_message: "New message on DJConnect",
  payment_successful: "Payment received",
  event_reminder: "Event reminder — 48 hours to go",
  review_request: "Leave a review for your DJ",
  payout_released: "Payout released",
  booking_cancelled: "Booking cancelled",
};

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const { template, to, data = {} } = await req.json() as { template: Template; to: string; data?: Record<string, unknown> };
    if (!subjects[template]) return new Response("Unknown template", { status: 400 });

    const html = render(template, data);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subjects[template],
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return new Response(body, { status: 500 });
    }
    return new Response("ok", { status: 200 });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Error", { status: 500 });
  }
});

function render(template: Template, data: Record<string, unknown>): string {
  const base = (body: string) => `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0F172A;">
      <h1 style="color:#0F172A;">DJConnect</h1>
      ${body}
      <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
      <p style="font-size:12px;color:#64748b;">You're receiving this because you have an account at DJConnect.</p>
    </div>`;

  switch (template) {
    case "account_created":
      return base(`<p>Welcome! Your account has been created. <a href="${data.verify_url ?? "#"}">Verify your email</a> to continue.</p>`);
    case "dj_application_submitted":
      return base(`<p>We've received your DJ application. We review new DJs within 2 business days.</p>`);
    case "dj_approved":
      return base(`<p>You're verified. Your profile is live at <a href="${data.profile_url ?? "#"}">${data.profile_url ?? "DJConnect"}</a>.</p>`);
    case "dj_rejected":
      return base(`<p>We couldn't approve your application this time. Reason: ${escape(data.reason as string)}. You can update and resubmit at any time.</p>`);
    case "new_booking_request":
      return base(`<p>You have a new booking request (${escape(data.reference as string)}). <a href="${data.booking_url ?? "#"}">Review it</a>.</p>`);
    case "booking_confirmed":
      return base(`<p>Your booking <strong>${escape(data.reference as string)}</strong> is confirmed. See you on ${escape(data.event_date as string)}.</p>`);
    case "booking_declined":
      return base(`<p>Your booking request was declined. A full refund is on its way.</p>`);
    case "new_message":
      return base(`<p>You have a new message on booking ${escape(data.reference as string)}. <a href="${data.booking_url ?? "#"}">Open thread</a>.</p>`);
    case "payment_successful":
      return base(`<p>Payment of ${escape(data.amount as string)} received for booking ${escape(data.reference as string)}.</p>`);
    case "event_reminder":
      return base(`<p>Reminder — your event is in 48 hours. Booking ${escape(data.reference as string)}.</p>`);
    case "review_request":
      return base(`<p>How did it go? <a href="${data.booking_url ?? "#"}">Leave a review</a> for your DJ.</p>`);
    case "payout_released":
      return base(`<p>${escape(data.amount as string)} has been released to your Stripe account.</p>`);
    case "booking_cancelled":
      return base(`<p>Booking ${escape(data.reference as string)} has been cancelled. ${escape(data.refund_note as string || "")}</p>`);
  }
}

function escape(s: unknown) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
