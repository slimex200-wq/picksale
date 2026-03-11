import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// @ts-ignore - QueryClient and keepPreviousData exist in @tanstack/react-query v5
import { QueryClient, QueryClientProvider, keepPreviousData } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LoginGateProvider } from "@/hooks/useLoginGate";
import LoginPrompt from "@/components/LoginPrompt";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import Index from "./pages/Index";
import SaleDetail from "./pages/SaleDetail";
import PlatformSales from "./pages/PlatformSales";
import SaleCalendar from "./pages/SaleCalendar";
import EventDetail from "./pages/EventDetail";
import RadarPage from "./pages/RadarPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityDetail from "./pages/CommunityDetail";
import SubmitSale from "./pages/SubmitSale";
import LoginPage from "./pages/LoginPage";
import AdminGuard from "./pages/AdminGuard";
import AdminOverview from "./pages/AdminOverview";
import AdminReview from "./pages/AdminReview";
import AdminDrafts from "./pages/AdminDrafts";
import AdminEvents from "./pages/AdminEvents";
import AdminCommunity from "./pages/AdminCommunity";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminSignals from "./pages/AdminSignals";
import AdminSignalDebug from "./pages/AdminSignalDebug";
import AdminDuplicates from "./pages/AdminDuplicates";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSignalSimulator from "./pages/AdminSignalSimulator";
import AdminHidden from "./pages/AdminHidden";
import AdminRejected from "./pages/AdminRejected";
import AdminAll from "./pages/AdminAll";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <LoginGateProvider>
        <LoginPrompt />
          <Routes>
            {/* Home — accessible without login */}
            <Route path="/" element={<><Header /><Index /></>} />
            <Route path="/home" element={<><Header /><Index /></>} />
            {/* Login */}
            <Route path="/login" element={<><Header /><LoginPage /></>} />
            <Route path="/sale/:id" element={<><Header /><SaleDetail /></>} />
            <Route path="/platform/:slug" element={<><Header /><PlatformSales /></>} />
            <Route path="/calendar" element={<><Header /><SaleCalendar /></>} />
            <Route path="/event/:eventId" element={<><Header /><EventDetail /></>} />
            <Route path="/radar" element={<><Header /><RadarPage /></>} />
            <Route path="/community" element={<><Header /><CommunityPage /></>} />
            <Route path="/community/:id" element={<><Header /><CommunityDetail /></>} />
            <Route path="/submit" element={<><Header /><SubmitSale /></>} />
            <Route path="/admin" element={<><Header /><AdminGuard /></>}>
              <Route index element={<AdminOverview />} />
              <Route path="all" element={<AdminAll />} />
              <Route path="review" element={<AdminReview />} />
              <Route path="drafts" element={<AdminDrafts />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="hidden" element={<AdminHidden />} />
              <Route path="rejected" element={<AdminRejected />} />
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
        </LoginGateProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
