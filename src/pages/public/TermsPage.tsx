import { PLATFORM_NAME, PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function TermsPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>Terms of Service</h1>
      <p className="lead">
        These are placeholder Terms of Service for {PLATFORM_NAME}. Replace with professionally drafted terms
        before launch.
      </p>
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using {PLATFORM_NAME}, you agree to be bound by these Terms. If you do not agree, do
        not use the platform.
      </p>
      <h2>2. The service</h2>
      <p>
        {PLATFORM_NAME} is a marketplace that connects customers seeking to book a DJ with independent DJs who
        operate mobile disco setups. We are not the direct provider of DJ services.
      </p>
      <h2>3. Platform fee</h2>
      <p>
        {PLATFORM_NAME} charges a service fee of {PLATFORM_FEE_PERCENT}% on each booking, disclosed at
        checkout.
      </p>
      <h2>4. Cancellations and refunds</h2>
      <p>
        Cancellations are handled per the schedule shown at checkout: 100% refund more than 14 days before
        the event, 50% between 7 and 14 days, 0% less than 7 days.
      </p>
      <h2>5. DJ responsibilities</h2>
      <p>
        DJs warrant that they own or have lawful access to all equipment listed, hold any required licences,
        and will show up on time and fit for work.
      </p>
      <h2>6. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {PLATFORM_NAME}'s liability is limited to the platform fee
        retained on the booking in question.
      </p>
      <h2>7. Governing law</h2>
      <p>These Terms are governed by the laws of Denmark.</p>
    </div>
  );
}
