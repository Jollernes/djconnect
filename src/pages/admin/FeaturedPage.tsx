import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { mockDJs } from "@/data/mock";
import { toast } from "sonner";

export function AdminFeaturedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Featured DJs</h1>
      <p className="text-sm text-muted-foreground">Toggle which DJs appear in the Featured section on the homepage.</p>
      <div className="space-y-3">
        {mockDJs.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img src={d.profile.avatar_url ?? ""} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium">{d.stage_name}</div>
                  <div className="text-xs text-muted-foreground">{d.base_location} · {d.rating_average}★ ({d.rating_count})</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {d.is_featured && <Badge variant="accent">Featured</Badge>}
                <Switch defaultChecked={d.is_featured} onCheckedChange={() => toast.success(`${d.stage_name} updated`)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
