import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthCallbackPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate("/login");
      return;
    }
    if (profile.role === "admin") navigate("/admin");
    else if (profile.role === "dj") navigate("/dj/dashboard");
    else navigate("/dashboard");
  }, [loading, profile, navigate]);

  return (
    <div className="container py-16">
      <Skeleton className="mx-auto h-10 w-64" />
      <p className="mt-4 text-center text-muted-foreground">Signing you in…</p>
    </div>
  );
}
