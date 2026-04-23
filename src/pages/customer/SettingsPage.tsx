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
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Email notifications</div>
              <div className="text-xs text-muted-foreground">Booking updates, messages, reminders</div>
            </div>
            <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-muted-foreground">Send yourself a reset link to update your password.</p>
          <Button variant="outline" onClick={() => toast.success("Reset link sent to your email")}>Send reset link</Button>
        </CardContent>
      </Card>
    </div>
  );
}
