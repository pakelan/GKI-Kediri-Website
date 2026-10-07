import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { PageHeader, Reveal } from "@/components/Reveal";
import { useSettings, waLink } from "@/lib/useSettings";

export default function Kontak() {
  const settings = useSettings();
  const CONTACT_CARDS = [
    { icon: MapPin, title: "Alamat", value: settings.address, note: "Gedung gereja GKI Kediri", testid: "kontak-address" },
    { icon: Phone, title: "WhatsApp Sekretariat", value: settings.phone, note: "Balasan pada jam kerja", testid: "kontak-phone" },
    { icon: Mail, title: "Email", value: settings.email, note: "Untuk surat & permohonan resmi", testid: "kontak-email" },
    { icon: Clock, title: "Jam Sekretariat", value: settings.office_hours, note: "Di luar jam itu, tinggalkan pesan", testid: "kontak-hours" },
  ];
  return (
    <div data-testid="kontak-page">
      <PageHeader
        overline="Kontak"
        title="Mari terhubung"
        description="Butuh penatalayanan, informasi ibadah, atau sekadar menyapa? Sekretariat GKI Kediri siap melayanimu."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <div className="h-full rounded-3xl border border-[#2B1E16]/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" data-testid={c.testid}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5EDE5]">
                  <c.icon className="h-5 w-5 text-[#385338]" />
                </div>
                <h3 className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5B7C5B]">{c.title}</h3>
                <p className="mt-2 font-heading text-lg font-bold text-[#2B1E16]">{c.value}</p>
                <p className="mt-1 text-xs text-[#6E5E53]">{c.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-[2rem] bg-[#231710] text-[#FBF8F4]">
              <iframe
                title="Peta lokasi GKI Kediri"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed&z=16`}
                className="h-64 w-full border-0 sm:h-72"
                loading="lazy"
                data-testid="kontak-maps-embed"
              />
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center sm:p-10">
                <h3 className="font-heading text-xl font-bold">{settings.address}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#CBB8A9]">
                  Sampai jumpa di rumah Tuhan — pintu kami selalu terbuka untukmu.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#FBF8F4]/25 px-6 py-3 text-sm font-semibold text-[#FBF8F4] transition-colors hover:bg-[#FBF8F4]/10"
                    data-testid="kontak-maps-btn"
                  >
                    <MapPin className="h-4 w-4" />
                    Buka di Google Maps
                  </a>
                  <a
                    href={waLink(settings.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#5B7C5B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4D6B4D]"
                    data-testid="kontak-whatsapp-btn"
                  >
                    <Phone className="h-4 w-4" />
                    Chat WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-[2rem] bg-[#E5EDE5] p-8">
              <div>
                <h3 className="font-heading text-xl font-bold text-[#1E301E]">Ikuti kegiatan kami</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475F47]">
                  Dokumentasi ibadah, retreat, dan kegiatan komisi diunggah di kanal media sosial GKI Kediri.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#1E301E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#385338]" data-testid="kontak-instagram-link">
                  <SiInstagram size={15} />
                  Instagram
                </a>
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-[#1E301E]/25 px-5 py-2.5 text-sm font-semibold text-[#1E301E] transition-colors hover:bg-[#1E301E]/10" data-testid="kontak-youtube-link">
                  <SiYoutube size={15} />
                  YouTube
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
