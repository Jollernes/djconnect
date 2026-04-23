import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  allow: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: Props) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allow.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
