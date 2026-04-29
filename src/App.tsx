import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
import Index from "./pages/Index";
import MainPage from "./pages/MainPage";
import BootcampPage from "./components/bootcamp/BootcampPage";
import College from "./pages/College";
import AIMasterclassPage from "./components/ai_masterclass/AIMasterclassPage";
import AIMasterclass2Page from "./components/ai_masterclass2/AIMasterclass2Page";
import UpscalePage from "./components/upscale_offline/UpscalePage";
import ThankYou from "./pages/ThankYou";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/bootcamp" element={<BootcampPage />} />
          <Route path="/college" element={<College />} />
          <Route path="/ai-masterclass" element={<AIMasterclassPage />} />
          <Route path="/ai_masterclass" element={<AIMasterclassPage />} />
          <Route path="/ai_masterclass2" element={<AIMasterclass2Page />} />
          <Route path="/ai-masterclass2" element={<AIMasterclass2Page />} />
          <Route path="/upscale" element={<UpscalePage />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
