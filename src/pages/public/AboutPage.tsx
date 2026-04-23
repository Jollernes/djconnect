import { PLATFORM_NAME } from "@/lib/constants";

export function AboutPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>About {PLATFORM_NAME}</h1>
      <p>
        {PLATFORM_NAME} is a two-sided marketplace connecting people hosting events with professional DJs who
        bring a complete mobile disco setup. We're exclusively focused on DJs — not bands, not general
        entertainment — because booking a DJ with the right gear, personality, and track selection is a
        specialist job.
      </p>
      <h2>Why we exist</h2>
      <p>
        Hosting a wedding, corporate event, or milestone party is stressful enough. Finding a DJ you can
        actually trust — who'll turn up with the right setup, play what your guests will dance to, and
        handle themselves professionally — should be simple. {PLATFORM_NAME} exists to make it simple.
      </p>
      <h2>How we're different</h2>
      <ul>
        <li>
          <strong>Verified DJs only.</strong> Every DJ is reviewed by our team before they can accept bookings.
          We look at equipment, experience, and references.
        </li>
        <li>
          <strong>Escrow payments.</strong> Your payment is held by Stripe and only released to the DJ 24
          hours after your event completes — protecting both sides.
        </li>
        <li>
          <strong>Transparent pricing.</strong> See starting prices upfront, with a clear platform service fee.
          No hidden charges.
        </li>
        <li>
          <strong>Real reviews.</strong> Only customers with completed bookings can leave reviews, so what you
          read is what you'll get.
        </li>
      </ul>
      <h2>Get in touch</h2>
      <p>
        Have questions? Email us at <a href="mailto:support@djconnect.example">support@djconnect.example</a>
        {" "}or check our <a href="/faq">FAQ</a>.
      </p>
    </div>
  );
}
