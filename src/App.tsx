import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import SaleDetail from "./pages/SaleDetail";
import PlatformSales from "./pages/PlatformSales";
import SaleCalendar from "./pages/SaleCalendar";
import EventDetail from "./pages/EventDetail";
import CommunityPage from "./pages/CommunityPage";
import CommunityDetail from "./pages/CommunityDetail";
import SubmitSale from "./pages/SubmitSale";
import LoginPage from "./pages/LoginPage";
import AdminGuard from "./pages/AdminGuard";
import AdminOverview from "./pages/AdminOverview";
import AdminReview from "./pages/AdminReview";
import AdminEvents from "./pages/AdminEvents";
import AdminCommunity from "./pages/AdminCommunity";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminSignals from "./pages/AdminSignals";
import AdminSignalDebug from "./pages/AdminSignalDebug";
import AdminDuplicates from "./pages/AdminDuplicates";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSignalSimulator from "./pages/AdminSignalSimulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing — no header */}
            <Route path="/" element={<LandingPage />} />
            {/* Login — no header */}
            <Route path="/login" element={<><Header /><LoginPage /></>} />
            {/* All other pages — with header */}
            <Route path="/home" element={<><Header /><Index /></>} />
            <Route path="/sale/:id" element={<><Header /><SaleDetail /></>} />
            <Route path="/platform/:slug" element={<><Header /><PlatformSales /></>} />
            <Route path="/calendar" element={<><Header /><SaleCalendar /></>} />
            <Route path="/event/:eventId" element={<><Header /><EventDetail /></>} />
            <Route path="/community" element={<><Header /><CommunityPage /></>} />
            <Route path="/community/:id" element={<><Header /><CommunityDetail /></>} />
            <Route path="/submit" element={<><Header /><SubmitSale /></>} />
            <Route path="/admin" element={<><Header /><AdminGuard /></>}>
              <Route index element={<AdminOverview />} />
              <Route path="review" element={<AdminReview />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="community" element={<AdminCommunity />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="signals" element={<AdminSignals />} />
              <Route path="signal-debug" element={<AdminSignalDebug />} />
              <Route path="duplicates" element={<AdminDuplicates />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="signal-simulator" element={<AdminSignalSimulator />} />
            </Route>
            <Route path="*" element={<><Header /><NotFound /></>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
