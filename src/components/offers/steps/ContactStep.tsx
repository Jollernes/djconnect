import { Mail, Phone, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactStep({
  name,
  email,
  phone,
  onChange,
}: {
  name: string;
  email: string;
  phone: string;
  onChange: (patch: { name?: string; email?: string; phone?: string }) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-rose-50/60 px-4 py-3 text-xs text-rose-900/80">
        Vi sender denne brief til 3 matchende DJs. De svarer dig direkte — ingen spam fra os.
      </div>
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4 text-rose-500" /> Dit navn
        </Label>
        <Input
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Sara Jensen"
          className="mt-2 h-12 text-base"
        />
      </div>
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-rose-500" /> E-mail
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="sara@example.com"
          className="mt-2 h-12 text-base"
          autoComplete="email"
        />
      </div>
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Phone className="h-4 w-4 text-rose-500" /> Telefon
          <span className="text-[11px] font-normal text-muted-foreground">(valgfrit)</span>
        </Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+45 22 33 44 55"
          className="mt-2 h-12 text-base"
          autoComplete="tel"
        />
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        Ved at fortsætte accepterer du vores{" "}
        <a href="/terms" className="underline">
          Vilkår
        </a>
        {" "}og{" "}
        <a href="/privacy" className="underline">
          Privatlivspolitik
        </a>
        .
      </p>
    </div>
  );
}
