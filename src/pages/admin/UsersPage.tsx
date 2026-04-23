import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDJs, mockBookings } from "@/data/mock";
import { formatDate } from "@/lib/utils";

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const allUsers = [
    ...mockDJs.map((d) => ({ ...d.profile, role: "dj" as const })),
    ...mockBookings.map((b) => b.customer),
  ];
  const unique = Array.from(new Map(allUsers.map((u) => [u.id, u])).values());
  const filtered = unique.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!u.full_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="dj">DJs</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === "dj" ? "accent" : u.role === "admin" ? "destructive" : "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="p-3 text-right"><Button variant="ghost" size="sm">Manage</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
