import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function CustomerSettingsPage() {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notifyEmail, setNotifyEmail] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Indstillinger</h1>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Profil</h2>
          <div>
            <Label htmlFor="fullName">Fulde navn</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={profile?.email ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={() => toast.success("Profil gemt")}>Gem ændringer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Notifikationer</h2>
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">E-mailnotifikationer</div>
              <div className="text-xs text-muted-foreground">Bookingopdateringer, beskeder, påmindelser</div>
            </div>
            <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Adgangskode</h2>
          <p className="text-sm text-muted-foreground">Send dig selv et nulstillingslink for at opdatere din adgangskode.</p>
          <Button variant="outline" onClick={() => toast.success("Nulstillingslink sendt til din e-mail")}>Send nulstillingslink</Button>
        </CardContent>
      </Card>
    </div>
  );
}
