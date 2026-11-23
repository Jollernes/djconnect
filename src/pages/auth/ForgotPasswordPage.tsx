import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function ForgotPasswordPage() {
  const { sendPasswordReset, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success("Hvis den e-mail findes, er et nulstillingslink på vej.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mislykkedes");
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-8">
          <div>
            <h1 className="text-2xl font-semibold">Glemt din adgangskode?</h1>
            <p className="mt-1 text-sm text-muted-foreground">Vi sender et nulstillingslink til din e-mail.</p>
          </div>
          {sent ? (
            <div className="rounded-md bg-success/10 p-4 text-sm">Tjek din e-mail for et nulstillingslink.</div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={!isConfigured}>Send nulstillingslink</Button>
            </form>
          )}
          <Link to="/login" className="block text-center text-sm text-accent underline">Tilbage til login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
