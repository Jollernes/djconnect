import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

const faqs = [
  {
    q: "How does DJ verification work?",
    a: "Every DJ submits a full application including their equipment list, equipment photos, experience level, and optional references or certificates. Our team reviews each application before the DJ is allowed to accept bookings. Approved DJs receive a green 'Verified' badge on their profile.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed by Stripe, a leading global payment processor. Your card details never touch our servers. Funds are held in escrow by Stripe and only released to the DJ 24 hours after your event completes.",
  },
  {
    q: "What happens if I need to cancel?",
    a: "Our cancellation policy is: cancel more than 14 days before the event and you get a 100% refund, cancel 7–14 days before and you get 50%, cancel less than 7 days before and no refund. The policy is shown clearly at checkout.",
  },
  {
    q: "What is a mobile disco setup?",
    a: "A complete, self-contained DJ rig that a DJ brings to your venue — including decks/controller, mixer, speakers, subwoofer, lighting, and microphones. You don't need to provide any equipment beyond power.",
  },
  {
    q: "How do I know the DJ will show up?",
    a: "Every DJ on the platform is identity-verified and has gone through our equipment review. Payments are held in escrow — if a DJ fails to show, you're entitled to a full refund and we'll help you find a last-minute replacement where possible.",
  },
  {
    q: "How do I leave a review?",
    a: "After your event date passes, you'll receive an email with a link to leave a review. You have 14 days to submit it. Only customers with a completed booking can review a DJ.",
  },
  {
    q: "How do DJs get paid?",
    a: "DJs connect a Stripe account during onboarding. Once a booking is completed, the DJ's share (90% of the booking amount by default) is released to their Stripe account 24 hours after the event.",
  },
  {
    q: "What is the platform service fee?",
    a: `The platform takes a ${PLATFORM_FEE_PERCENT}% service fee, shown clearly at checkout. This covers secure payments, customer support, dispute resolution, DJ verification, and platform development.`,
  },
];

export function FAQPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
      <p className="mt-2 text-muted-foreground">
        Didn't find what you're looking for? <a className="text-accent underline" href="/contact">Contact us</a>.
      </p>
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
