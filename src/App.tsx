import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Index from "./pages/Index";
import SaleDetail from "./pages/SaleDetail";
import SaleCalendar from "./pages/SaleCalendar";
import SubmitSale from "./pages/SubmitSale";
import AdminLayout from "./pages/AdminLayout";
import AdminOverview from "./pages/AdminOverview";
import AdminReview from "./pages/AdminReview";
import AdminEvents from "./pages/AdminEvents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sale/:id" element={<SaleDetail />} />
          <Route path="/calendar" element={<SaleCalendar />} />
          <Route path="/submit" element={<SubmitSale />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="review" element={<AdminReview />} />
            <Route path="events" element={<AdminEvents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
