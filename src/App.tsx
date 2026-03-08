import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Report from "./pages/Report";
import GuestQR from "./pages/GuestQR";
import SouvenirCounter from "./pages/SouvenirCounter";
import SouvenirScan from "./pages/SouvenirScan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/laporan" element={<Report />} />
          <Route path="/souvenir" element={<SouvenirCounter />} />
          <Route path="/guest-qr/:id" element={<GuestQR />} />
          <Route path="/souvenir-scan/:id" element={<SouvenirScan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
