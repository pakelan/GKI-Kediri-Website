import { CalendarDays } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { IMAGES } from "@/lib/content";
import { useKomisi } from "@/lib/useContent";

export default function Pelayanan() {
  const komisi = useKomisi();
  return (
    <div data-testid="pelayanan-page">
      <PageHeader
        overline="Pelayanan & Komisi"
        title="Setiap generasi punya rumahnya"
        description="Delapan komisi melayani setiap musim kehidupan — dari sekolah minggu sampai usia indah. Temukan tempatmu bertumbuh."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {komisi.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06} className={i === 2 ? "lg:col-span-2" : ""}>
              <div
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#2B1E16]/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-testid={`pelayanan-card-${i}`}
              >
                {c.image_path && (
                  <img src={`/api/files/${c.image_path}`} alt={c.name} className="h-40 w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5B7C5B]">{c.alias}</p>
                  <h3 className="mt-2 font-heading text-xl font-bold tracking-tight text-[#2B1E16]">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6E5E53]">{c.desc}</p>
                  <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#385338]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {c.schedule}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-12 grid items-center gap-8 rounded-[2rem] bg-[#E5EDE5] p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#385338]">Mau Terlibat?</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#1E301E] sm:text-3xl">
                Pelayanan dimulai dari hati yang mau
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#475F47] sm:text-base">
                Punya kerinduan melayani di musik, multimedia, sekolah minggu, atau diakonia? Sampaikan lewat halaman Kritik & Saran atau hubungi sekretariat — kami akan menghubungkanmu dengan komisi yang tepat.
              </p>
            </div>
            <img src={IMAGES.musicMinistry} alt="Pelayanan musik GKI Kediri" className="aspect-[4/3] w-full rounded-3xl object-cover" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
