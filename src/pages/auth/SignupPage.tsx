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
  fullName: z.string().min(2, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
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
      toast.success("Check your email to confirm your account");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Book a DJ in minutes.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-md border p-1 text-sm font-medium">
            <span className="rounded-sm bg-primary px-3 py-1.5 text-center text-primary-foreground">Book a DJ</span>
            <Link to="/signup/dj" className="rounded-sm px-3 py-1.5 text-center text-muted-foreground hover:bg-muted">
              I am a DJ
            </Link>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="companyName">Company (optional — for corporate bookings)</Label>
              <Input id="companyName" {...form.register("companyName")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !isConfigured}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <Button variant="outline" className="w-full" disabled={!isConfigured} onClick={() => signInWithGoogle("customer")}>
            Continue with Google
          </Button>

          {!isConfigured && (
            <Button variant="secondary" className="w-full" onClick={() => { mockLogin("customer"); navigate("/dashboard"); }}>
              Demo: skip signup, try as customer
            </Button>
          )}

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
