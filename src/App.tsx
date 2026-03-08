import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Report from "./pages/Report";
import GuestQR from "./pages/GuestQR";
import SouvenirCounter from "./pages/SouvenirCounter";
import SouvenirScan from "./pages/SouvenirScan";
import RSVP from "./pages/RSVP";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/rsvp" element={<RSVP />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/laporan" element={<Report />} />
          <Route path="/souvenir" element={<SouvenirCounter />} />
          <Route path="/guest-qr/:id" element={<GuestQR />} />
          <Route path="/souvenir-scan/:id" element={<SouvenirScan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
