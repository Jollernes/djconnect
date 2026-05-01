import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isDJGuideCompleted } from "@/lib/djGuide";

export function DJGuideGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isDJGuideCompleted()) {
    return <Navigate to="/dj/onboarding" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
