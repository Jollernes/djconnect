import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { EventProvider } from "@/firmadj/store/EventStore";
import { PublicLayout } from "@/firmadj/layout/PublicLayout";
import { HomePage } from "@/firmadj/pages/HomePage";
import { DJShowcasePage } from "@/firmadj/pages/DJShowcasePage";
import { BookingFlowPage } from "@/firmadj/pages/BookingFlowPage";
import { EventPage } from "@/firmadj/pages/EventPage";

function App() {
  return (
    <div className="firmadj-app dark min-h-screen bg-background text-foreground">
      <EventProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/vores-djs" element={<DJShowcasePage />} />
            </Route>
            <Route path="/book" element={<BookingFlowPage />} />
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-center" />
        </BrowserRouter>
      </EventProvider>
    </div>
  );
}

export default App;
