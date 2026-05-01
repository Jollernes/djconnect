import { LifeBuoy, FileQuestion, MailQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export function HelpStrip() {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-accent" />
        <h2 className="text-base font-semibold">Need help?</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Our team is here every day to keep your event on track.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          to="/faq"
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
        >
          <FileQuestion className="h-4 w-4 text-accent" />
          Browse the FAQ
        </Link>
        <Link
          to="/contact"
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
        >
          <MailQuestion className="h-4 w-4 text-accent" />
          Contact support
        </Link>
      </div>
    </div>
  );
}
