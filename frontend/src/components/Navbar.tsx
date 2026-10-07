import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HeartHandshake, Menu } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const DESKTOP_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/jadwal", label: "Jadwal" },
  { to: "/pelayanan", label: "Pelayanan" },
  { to: "/renungan", label: "Renungan" },
  { to: "/khotbah", label: "Khotbah" },
  { to: "/warta-jemaat", label: "Warta" },
  { to: "/gallery", label: "Galeri" }, // <--- Menu Galeri Foto ditambahkan di sini
];

const ALL_LINKS = [
  ...DESKTOP_LINKS,
  { to: "/formulir", label: "Formulir" },
  { to: "/pokok-doa", label: "Pokok Doa" },
  { to: "/kritik-saran", label: "Kritik & Saran" },
  { to: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#2B1E16]/10 bg-[#FAF7F2]/85 backdrop-blur-xl" data-testid="main-navbar">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="GKI Kediri — Beranda" data-testid="nav-logo-link">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {DESKTOP_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-[#6E5E53] transition-colors hover:bg-[#EADECF]/60 hover:text-[#2B1E16]",
                  isActive && "bg-[#2B1E16] text-[#FAF7F2] hover:bg-[#2B1E16] hover:text-[#FAF7F2]"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Button render={<Link to="/pokok-doa" />} className="ml-2 rounded-full bg-[#385338] text-[#FAF7F2] hover:bg-[#4D6B4D]" data-testid="nav-cta-pokok-doa">
            <HeartHandshake className="h-4 w-4" />
            Pokok Doa
          </Button>
        </nav>
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Buka menu" data-testid="nav-mobile-menu-btn" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#FAF7F2]">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Navigasi seluler">
                {ALL_LINKS.map((l) => (
                  <SheetClose key={l.to} render={<NavLink to={l.to} end={l.to === "/"} data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`} className="rounded-xl px-4 py-3 text-base font-medium text-[#2B1E16] transition-colors hover:bg-[#EADECF]" />}>
                    {l.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}