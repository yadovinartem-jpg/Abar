import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import MyMusic from "@/pages/MyMusic";
import Search from "@/pages/Search";
import Recommendations from "@/pages/Recommendations";
import Integrations from "@/pages/Integrations";
import Statistics from "@/pages/Statistics";
import Releases from "@/pages/Releases";
import Radio from "@/pages/Radio";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/my-music" replace />} />
          <Route path="/my-music" element={<MyMusic />} />
          <Route path="/search" element={<Search />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}
