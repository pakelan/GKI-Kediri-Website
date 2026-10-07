import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Tentang from "@/pages/Tentang";
import Jadwal from "@/pages/Jadwal";
import Pelayanan from "@/pages/Pelayanan";
import PokokDoa from "@/pages/PokokDoa";
import KritikSaran from "@/pages/KritikSaran";
import Formulir from "@/pages/Formulir";
import WartaJemaat from "@/pages/WartaJemaat";
import RenunganList from "@/pages/Renungan";
import RenunganDetail from "@/pages/RenunganDetail";
import Khotbah from "@/pages/Khotbah";
import Kontak from "@/pages/Kontak";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import Gallery from "@/pages/Gallery"; // <-- Ini yang saya perbaiki ya bos (pakai @)

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/pelayanan" element={<Pelayanan />} />
          <Route path="/pokok-doa" element={<PokokDoa />} />
          <Route path="/kritik-saran" element={<KritikSaran />} />
          <Route path="/formulir" element={<Formulir />} />
          <Route path="/warta-jemaat" element={<WartaJemaat />} />
          <Route path="/renungan" element={<RenunganList />} />
          <Route path="/renungan/:id" element={<RenunganDetail />} />
          <Route path="/khotbah" element={<Khotbah />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}