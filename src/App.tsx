import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TokenAuthProvider } from "@/hooks/useTokenAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppVersionNotification } from "@/components/AppVersionNotification";
import { TokenExpiryWarning } from "@/components/TokenExpiryWarning";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Report from "./pages/Report";
import GuestQR from "./pages/GuestQR";
import SouvenirCounter from "./pages/SouvenirCounter";
import SouvenirScan from "./pages/SouvenirScan";
import RSVP from "./pages/RSVP";
import Settings from "./pages/Settings";
import Backup from "./pages/Backup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TokenAuthProvider>
            <AppVersionNotification />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/rsvp" element={<RSVP />} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/laporan" element={<ProtectedRoute><Report /></ProtectedRoute>} />
              <Route path="/souvenir" element={<ProtectedRoute><SouvenirCounter /></ProtectedRoute>} />
              <Route path="/guest-qr/:id" element={<ProtectedRoute><GuestQR /></ProtectedRoute>} />
              <Route path="/souvenir-scan/:id" element={<SouvenirScan />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TokenAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
