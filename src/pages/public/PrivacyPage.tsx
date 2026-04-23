import { PLATFORM_NAME } from "@/lib/constants";

export function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>Privacy Policy</h1>
      <p className="lead">
        Placeholder Privacy Policy for {PLATFORM_NAME}. Replace with a GDPR-compliant policy before launch.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account information (name, email, role)</li>
        <li>Profile information (DJ: bio, photos, equipment; Customer: booking history)</li>
        <li>Payment metadata (never full card numbers — held by Stripe)</li>
        <li>Usage data (pages viewed, bookings made)</li>
      </ul>
      <h2>How we use your information</h2>
      <p>
        To provide the service, match customers with DJs, process payments, send transactional emails, and
        prevent fraud.
      </p>
      <h2>Who has access</h2>
      <p>
        DJs see contact information only after a booking is confirmed. Customers see DJ profiles but never
        personal contact details until the booking is confirmed.
      </p>
      <h2>Your rights</h2>
      <p>
        Under GDPR, you have rights to access, correct, delete, and export your personal data. Contact
        support to exercise these rights.
      </p>
    </div>
  );
}
