import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/common/RoleGuard";

import { HomePage } from "@/pages/public/HomePage";
import { SearchPage } from "@/pages/public/SearchPage";
import { WeddingDJsPage } from "@/pages/public/WeddingDJsPage";
import { GetOffersPage } from "@/pages/public/GetOffersPage";
import { PersonalAdvicePage } from "@/pages/public/PersonalAdvicePage";
import { MyRequestPage } from "@/pages/public/MyRequestPage";
import { WeddingDJsTestAPage } from "@/pages/public/WeddingDJsTestAPage";
import { WeddingDJsTestBPage } from "@/pages/public/WeddingDJsTestBPage";
import { WeddingDJsTestCPage } from "@/pages/public/WeddingDJsTestCPage";
import { DJProfilePage } from "@/pages/public/DJProfilePage";
import { BookingRequestPage } from "@/pages/public/BookingRequestPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { HowItWorksPage } from "@/pages/public/HowItWorksPage";
import { FAQPage } from "@/pages/public/FAQPage";
import { TermsPage } from "@/pages/public/TermsPage";
import { PrivacyPage } from "@/pages/public/PrivacyPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";

import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { DJSignupPage } from "@/pages/auth/DJSignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { AuthCallbackPage } from "@/pages/auth/AuthCallbackPage";
import { PendingVerificationPage } from "@/pages/auth/PendingVerificationPage";

import { CustomerDashboardPage } from "@/pages/customer/DashboardPage";
import { CustomerBookingsPage } from "@/pages/customer/BookingsPage";
import { CustomerBookingDetailPage } from "@/pages/customer/BookingDetailPage";
import { CustomerFavouritesPage } from "@/pages/customer/FavouritesPage";
import { CustomerSettingsPage } from "@/pages/customer/SettingsPage";
import { CustomerRequestsListPage } from "@/pages/customer/RequestsListPage";
import { CustomerRequestDetailPage } from "@/pages/customer/RequestDetailPage";
import { PersonalAdviceDetailPage } from "@/pages/customer/PersonalAdviceDetailPage";

import { DJDashboardPage } from "@/pages/dj/DashboardPage";
import { DJBookingsPage } from "@/pages/dj/BookingsPage";
import { DJBookingDetailPage } from "@/pages/dj/BookingDetailPage";
import { DJAvailabilityPage } from "@/pages/dj/AvailabilityPage";
import { DJEarningsPage } from "@/pages/dj/EarningsPage";
import { DJMessagesPage } from "@/pages/dj/MessagesPage";
import { DJProfileEditorPage } from "@/pages/dj/ProfileEditorPage";
import { DJOnboardingGuidePage } from "@/pages/dj/OnboardingGuidePage";
import { DJGuideGate } from "@/components/common/DJGuideGate";

import { AdminDashboardPage } from "@/pages/admin/DashboardPage";
import { VerificationQueuePage, VerificationDetailPage } from "@/pages/admin/VerificationPage";
import { AdminUsersPage } from "@/pages/admin/UsersPage";
import { AdminBookingsPage } from "@/pages/admin/BookingsPage";
import { AdminFinancialsPage } from "@/pages/admin/FinancialsPage";
import { AdminReviewsPage } from "@/pages/admin/ReviewsPage";
import { AdminFeaturedPage } from "@/pages/admin/FeaturedPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wedding-djs" element={<WeddingDJsPage />} />
            <Route path="/wedding-djs-test-a" element={<WeddingDJsTestAPage />} />
            <Route path="/wedding-djs-test-b" element={<WeddingDJsTestBPage />} />
            <Route path="/wedding-djs-test-c" element={<WeddingDJsTestCPage />} />
            <Route path="/djs/:username" element={<DJProfilePage />} />
            <Route path="/book/:username" element={<BookingRequestPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup/dj" element={<DJSignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dj/pending-verification" element={<PendingVerificationPage />} />
          </Route>

          <Route
            element={
              <RoleGuard allow={["customer"]}>
                <DashboardLayout />
              </RoleGuard>
            }
          >
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/dashboard/requests" element={<CustomerRequestsListPage />} />
            <Route
              path="/dashboard/requests/:requestId"
              element={<CustomerRequestDetailPage />}
            />
            <Route
              path="/dashboard/personlig-radgivning/:adviceId"
              element={<PersonalAdviceDetailPage />}
            />
            <Route path="/dashboard/bookings" element={<CustomerBookingsPage />} />
            <Route path="/dashboard/bookings/:id" element={<CustomerBookingDetailPage />} />
            <Route path="/dashboard/favourites" element={<CustomerFavouritesPage />} />
            <Route path="/dashboard/settings" element={<CustomerSettingsPage />} />
          </Route>

          <Route
            path="/dj/onboarding"
            element={
              <RoleGuard allow={["dj"]}>
                <DJOnboardingGuidePage />
              </RoleGuard>
            }
          />

          <Route
            element={
              <RoleGuard allow={["dj"]}>
                <DJGuideGate>
                  <DashboardLayout />
                </DJGuideGate>
              </RoleGuard>
            }
          >
            <Route path="/dj/dashboard" element={<DJDashboardPage />} />
            <Route path="/dj/bookings" element={<DJBookingsPage />} />
            <Route path="/dj/bookings/:id" element={<DJBookingDetailPage />} />
            <Route path="/dj/availability" element={<DJAvailabilityPage />} />
            <Route path="/dj/earnings" element={<DJEarningsPage />} />
            <Route path="/dj/messages" element={<DJMessagesPage />} />
            <Route path="/dj/profile" element={<DJProfileEditorPage />} />
          </Route>

          <Route
            element={
              <RoleGuard allow={["admin"]}>
                <DashboardLayout />
              </RoleGuard>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/verification" element={<VerificationQueuePage />} />
            <Route path="/admin/verification/:id" element={<VerificationDetailPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/financials" element={<AdminFinancialsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/featured" element={<AdminFeaturedPage />} />
          </Route>

          {/* Get-3-offers wizard owns its own full-screen layout (no site header/footer) */}
          <Route path="/get-offers" element={<GetOffersPage />} />

          {/* Personal advisory landing + form. Has the public site header
              so the active nav tab stays visible while filling the brief. */}
          <Route element={<PublicLayout />}>
            <Route path="/personal-advice" element={<PersonalAdvicePage />} />
          </Route>

          {/* Live progress page for an offer request — public for now;
              eventually gated behind a magic link. */}
          <Route path="/my-requests/:requestId" element={<MyRequestPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
