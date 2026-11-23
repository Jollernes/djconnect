import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  fullName: z.string().min(2, "Påkrævet"),
  email: z.string().email("Indtast en gyldig e-mail"),
  password: z.string().min(8, "Mindst 8 tegn"),
  companyName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { signUpWithPassword, signInWithGoogle, isConfigured, mockLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", companyName: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await signUpWithPassword({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: "customer",
        company: values.companyName,
      });
      toast.success("Tjek din e-mail for at bekræfte din konto");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Oprettelse mislykkedes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Opret din konto</h1>
            <p className="mt-1 text-sm text-muted-foreground">Book en DJ på få minutter.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-md border p-1 text-sm font-medium">
            <span className="rounded-sm bg-primary px-3 py-1.5 text-center text-primary-foreground">Book en DJ</span>
            <Link to="/signup/dj" className="rounded-sm px-3 py-1.5 text-center text-muted-foreground hover:bg-muted">
              Jeg er DJ
            </Link>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="fullName">Fulde navn</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Adgangskode</Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="companyName">Virksomhed (valgfrit — til erhvervsbookinger)</Label>
              <Input id="companyName" {...form.register("companyName")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !isConfigured}>
              {loading ? "Opretter konto…" : "Opret konto"}
            </Button>
          </form>

          <Button variant="outline" className="w-full" disabled={!isConfigured} onClick={() => signInWithGoogle("customer")}>
            Fortsæt med Google
          </Button>

          {!isConfigured && (
            <Button variant="secondary" className="w-full" onClick={() => { mockLogin("customer"); navigate("/dashboard"); }}>
              Demo: spring oprettelse over, prøv som kunde
            </Button>
          )}

          <p className="text-center text-sm">
            Har du allerede en konto?{" "}
            <Link to="/login" className="font-medium text-accent underline">Log ind</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
