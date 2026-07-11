"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoLogin } from "@/lib/server";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Music, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDemo(role: string) {
    setLoading(true);
    const email = `${role}@firmadj.demo`;
    const result = await demoLogin(email, "Demo1234!");
    setLoading(false);
    if (result.success) {
      toast.success(`Logget ind som ${role}`);
      if (result.role === "client") router.push("/client");
      else if (result.role === "dj") router.push("/dj");
      else router.push("/admin");
    } else {
      toast.error(result.error || "Login fejlede");
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = await demoLogin(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Logget ind");
      if (result.role === "client") router.push("/client");
      else if (result.role === "dj") router.push("/dj");
      else router.push("/admin");
    } else {
      toast.error(result.error || "Login fejlede");
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12">
        <div className="w-full max-w-md px-4">
          <Card className="border-slate-200">
            <CardContent className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Log ind</h1>
              <p className="text-slate-500 text-center mb-6">Vælg en demo-rolle nedenfor for at teste platformen.</p>

              <div className="space-y-3 mb-6">
                <Button onClick={() => handleDemo("client")} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white justify-start gap-3">
                  <User className="w-4 h-4" /> Log ind som kunde
                  <span className="ml-auto text-xs text-slate-400">client@firmadj.demo</span>
                </Button>
                <Button onClick={() => handleDemo("dj")} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 justify-start gap-3">
                  <Music className="w-4 h-4" /> Log ind som DJ
                  <span className="ml-auto text-xs text-slate-700">dj@firmadj.demo</span>
                </Button>
                <Button onClick={() => handleDemo("admin")} disabled={loading} className="w-full bg-slate-700 hover:bg-slate-600 text-white justify-start gap-3">
                  <Shield className="w-4 h-4" /> Log ind som admin
                  <span className="ml-auto text-xs text-slate-300">admin@firmadj.demo</span>
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase text-slate-500 bg-white px-2">eller</div>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue="client@firmadj.demo" />
                </div>
                <div>
                  <Label htmlFor="password">Adgangskode</Label>
                  <Input id="password" name="password" type="password" defaultValue="Demo1234!" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">Log ind</Button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-4">Alle demo-brugere: Demo1234!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
