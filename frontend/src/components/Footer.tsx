import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { Logo } from "@/components/Logo";
import { useSettings } from "@/lib/useSettings";
import { parseWorshipTimes, useContent } from "@/lib/useContent";

const FOOTER_LINKS = [
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/jadwal", label: "Jadwal Ibadah" },
  { to: "/renungan", label: "Renungan" },
  { to: "/khotbah", label: "Arsip Khotbah" },
  { to: "/warta-jemaat", label: "Warta Jemaat" },
  { to: "/formulir", label: "Formulir" },
  { to: "/kritik-saran", label: "Kritik & Saran" },
];

export function Footer() {
  const settings = useSettings();
  const content = useContent();
  return (
    <footer className="bg-[#231710] text-[#CBB8A9]" data-testid="main-footer">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed">
            Rumah bagi setiap generasi untuk bertumbuh dalam iman, pengharapan, dan kasih Kristus — di jantung kota Kediri.
          </p>
          <div className="flex gap-3">
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram GKI Kediri" data-testid="footer-instagram-link" className="rounded-full border border-[#FBF8F4]/15 p-2 transition-colors hover:border-[#5B7C5B] hover:text-[#9EC49E]">
              <SiInstagram size={16} />
            </a>
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube GKI Kediri" data-testid="footer-youtube-link" className="rounded-full border border-[#FBF8F4]/15 p-2 transition-colors hover:border-[#5B7C5B] hover:text-[#9EC49E]">
              <SiYoutube size={16} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#9EC49E]">Jelajahi</h3>
          <ul className="space-y-2.5 text-sm">
            {FOOTER_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-[#FBF8F4]" data-testid={`footer-link-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#9EC49E]">Ibadah Raya</h3>
          <ul className="space-y-2.5 text-sm">
            {parseWorshipTimes(content.worship_times).map((w) => (
              <li key={w.label} className="flex justify-between gap-4"><span>{w.label}</span><span className="text-[#FBF8F4]">{w.time}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#9EC49E]">Hubungi Kami</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7C5B]" />{settings.address}</li>
            <li className="flex items-start gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7C5B]" />{settings.phone}</li>
            <li className="flex items-start gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7C5B]" />{settings.email}</li>
            <li className="flex items-start gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#5B7C5B]" />{settings.office_hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#FBF8F4]/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Gereja Kristen Indonesia Kediri. Soli Deo Gloria.</p>
          <Link to="/login" className="font-mono uppercase tracking-[0.2em] transition-colors hover:text-[#9EC49E]" data-testid="footer-admin-login-link">
            Login Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
