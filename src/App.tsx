import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DevicePreview } from "@/components/common/DevicePreview";
import { HomePage } from "@/pages/public/HomePage";
import { DJPartnerApplicationPage } from "@/pages/public/DJPartnerApplicationPage";
import {
  ContactPage,
  FaqPage,
  HowItWorksPage,
  PackagesPage,
  PrivacyPage,
  TermsPage,
  TrustQualityPage,
  UseCaseLandingPage,
} from "@/pages/public/StaticSeoPages";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { BriefPage } from "@/pages/flow/BriefPage";
import { ProposalPage } from "@/pages/flow/ProposalPage";
import { ReservePage } from "@/pages/flow/ReservePage";
import { ReservationSuccessPage } from "@/pages/flow/ReservationSuccessPage";
import { ClientDashboardPage } from "@/pages/client/ClientDashboardPage";
import { EventDetailPage } from "@/pages/client/EventDetailPage";
import { DJDashboardPage } from "@/pages/dj/DJDashboardPage";
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage";
import { AdminLeadsPage } from "@/pages/admin/AdminLeadsPage";
import { AdminLeadDetailPage } from "@/pages/admin/AdminLeadDetailPage";
import { AdminBookingsPage } from "@/pages/admin/AdminBookingsPage";
import { AdminBookingDetailPage } from "@/pages/admin/AdminBookingDetailPage";
import { AdminDJsPage } from "@/pages/admin/AdminDJsPage";
import { AdminDJDetailPage } from "@/pages/admin/AdminDJDetailPage";
import { AdminPackagesPage } from "@/pages/admin/AdminPackagesPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { AdminContentPage } from "@/pages/admin/AdminContentPage";
import { USE_CASE_CONFIGS } from "@/lib/useCases";

function LoginPage() {
  const { mockLogin, isConfigured } = useAuth();

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Log ind</CardTitle>
          <CardDescription>
            Demo-login er slået til, så du kan klikke rundt uden backend. {isConfigured ? "Supabase er også tilgængelig." : "Supabase er ikke konfigureret."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => mockLogin("client")} className="flex-1">
            Log ind som kunde
          </Button>
          <Button variant="secondary" onClick={() => mockLogin("dj")} className="flex-1">
            Log ind som DJ
          </Button>
          <Button variant="outline" onClick={() => mockLogin("admin")} className="flex-1">
            Log ind som admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AppShell() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pakker" element={<PackagesPage />} />
        <Route path="/saadan-fungerer-det" element={<HowItWorksPage />} />
        <Route path="/tryghed-og-kvalitet" element={<TrustQualityPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/bliv-dj-partner" element={<DJPartnerApplicationPage />} />
        <Route path="/dj-til-firmafest" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/dj-til-firmafest"]} />} />
        <Route path="/dj-til-julefrokost" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/dj-til-julefrokost"]} />} />
        <Route path="/dj-til-sommerfest" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/dj-til-sommerfest"]} />} />
        <Route path="/dj-til-firmaarrangement" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/dj-til-firmaarrangement"]} />} />
        <Route path="/dj-til-middag-og-fest" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/dj-til-middag-og-fest"]} />} />
        <Route path="/mobildiskotek-firmafest" element={<UseCaseLandingPage config={USE_CASE_CONFIGS["/mobildiskotek-firmafest"]} />} />
        <Route path="/handelsbetingelser" element={<TermsPage />} />
        <Route path="/privatlivspolitik" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/brief" element={<BriefPage />} />
      <Route path="/proposal/:id" element={<ProposalPage />} />
      <Route path="/reserve/:proposalId" element={<ReservePage />} />
      <Route path="/reservation/:bookingId/kvittering" element={<ReservationSuccessPage />} />

      <Route element={<RoleGuard allow={["client"]}><DashboardLayout /></RoleGuard>}>
        <Route path="/client" element={<ClientDashboardPage />} />
        <Route path="/client/event/:bookingId" element={<EventDetailPage />} />
      </Route>

      <Route element={<RoleGuard allow={["dj"]}><DashboardLayout /></RoleGuard>}>
        <Route path="/dj" element={<DJDashboardPage />} />
      </Route>

      <Route element={<RoleGuard allow={["admin"]}><DashboardLayout /></RoleGuard>}>
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/leads" element={<AdminLeadsPage />} />
        <Route path="/admin/leads/:id" element={<AdminLeadDetailPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/bookings/:id" element={<AdminBookingDetailPage />} />
        <Route path="/admin/djs" element={<AdminDJsPage />} />
        <Route path="/admin/djs/:id" element={<AdminDJDetailPage />} />
        <Route path="/admin/pakker" element={<AdminPackagesPage />} />
        <Route path="/admin/anmeldelser" element={<AdminReviewsPage />} />
        <Route path="/admin/indhold" element={<AdminContentPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
        <DevicePreview />
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
