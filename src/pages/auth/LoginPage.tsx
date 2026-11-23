import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PLATFORM_NAME } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Indtast en gyldig e-mail"),
  password: z.string().min(1, "Påkrævet"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { signInWithPassword, signInWithGoogle, isConfigured, mockLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await signInWithPassword(values.email, values.password);
      toast.success("Logget ind");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login mislykkedes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Velkommen tilbage</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log ind på din {PLATFORM_NAME}-konto</p>
          </div>

          {!isConfigured && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
              <strong>Demotilstand:</strong> Supabase er ikke konfigureret, så rigtig login er deaktiveret. Brug en af
              demo-knapperne nedenfor til at udforske oversigterne.
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Adgangskode</Label>
                <Link to="/forgot-password" className="text-xs text-accent underline">Glemt adgangskode?</Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !isConfigured}>
              {loading ? "Logger ind…" : "Log ind"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Separator className="flex-1" /> eller <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={!isConfigured}
            onClick={() => signInWithGoogle().catch((e) => toast.error(e.message))}
          >
Fortsæt med Google
          </Button>

          {!isConfigured && (
            <div className="space-y-2 rounded-md border p-3 text-xs">
              <div className="font-medium">Demo-login (uden backend):</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    mockLogin("customer", { customerKind: "private" });
                    navigate("/dashboard");
                  }}
                >
                  Privatkunde
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    mockLogin("customer", { customerKind: "corporate" });
                    navigate("/dashboard");
                  }}
                >
                  Erhvervskunde
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { mockLogin("dj"); navigate("/dj/dashboard"); }}>
                  Som DJ
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { mockLogin("admin"); navigate("/admin"); }}>
                  Som admin
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm">
            Har du ikke en konto?{" "}
            <Link to="/signup" className="font-medium text-accent underline">Opret konto</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
