import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarDays, Play } from "lucide-react";
import { SiYoutube } from "@icons-pack/react-simple-icons";
import { PageHeader, Reveal } from "@/components/Reveal";
import { apiGet } from "@/lib/api";
import { useSettings } from "@/lib/useSettings";
import type { Sermon } from "@/lib/types";

function fmtDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, "d MMMM yyyy", { locale: idLocale });
}

export default function Khotbah() {
  const settings = useSettings();
  const { data, isError, isLoading } = useQuery({
    queryKey: ["khotbah"],
    queryFn: () => apiGet<{ items: Sermon[] }>("/khotbah"),
    staleTime: 10 * 60 * 1000,
  });
  const items = data?.items ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((v) => v.id === activeId) ?? items[0];

  return (
    <div data-testid="khotbah-page">
      <PageHeader
        overline="Arsip Khotbah"
        title="Firman yang bisa didengar kembali"
        description="Rekaman ibadah dan khotbah langsung dari kanal YouTube GKI Kediri — putar di sini tanpa berpindah aplikasi."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {isLoading ? (
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat arsip khotbah...</p>
        ) : isError || items.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#2B1E16]/15 bg-[#F3EDE4] p-14 text-center" data-testid="khotbah-empty-state">
            <SiYoutube size={40} className="text-[#5B7C5B]" />
            <p className="mt-4 font-heading text-lg font-bold text-[#2B1E16]">Arsip belum dapat dimuat</p>
            <p className="mt-1 max-w-sm text-sm text-[#6E5E53]">Kunjungi langsung kanal YouTube GKI Kediri untuk menonton ibadah dan khotbah.</p>
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#385338] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4D6B4D]" data-testid="khotbah-channel-link">
              <SiYoutube size={15} />
              Buka Kanal YouTube
            </a>
          </div>
        ) : (
          <>
            {active && (
              <Reveal>
                <div className="overflow-hidden rounded-[2rem] bg-[#231710] p-4 sm:p-6" data-testid="khotbah-player">
                  <div className="aspect-video w-full overflow-hidden rounded-3xl">
                    <iframe
                      key={active.id}
                      src={`https://www.youtube-nocookie.com/embed/${active.id}?rel=0`}
                      title={active.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                      data-testid="khotbah-iframe"
                    />
                  </div>
                  <div className="mt-4 px-2 pb-2">
                    <h2 className="font-heading text-lg font-bold text-[#FBF8F4] sm:text-xl" data-testid="khotbah-active-title">{active.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-[#CBB8A9]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtDate(active.published)}
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="khotbah-grid">
              {items.map((v, i) => (
                <Reveal key={v.id} delay={i * 0.05}>
                  <button
                    onClick={() => {
                      setActiveId(v.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`group block w-full overflow-hidden rounded-3xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      active?.id === v.id ? "border-[#5B7C5B] ring-2 ring-[#5B7C5B]/40" : "border-[#2B1E16]/8"
                    } bg-white`}
                    data-testid={`khotbah-card-${v.id}`}
                  >
                    <div className="relative">
                      <img src={v.thumbnail} alt={v.title} className="aspect-video w-full object-cover" loading="lazy" />
                      <span className="absolute inset-0 flex items-center justify-center bg-[#231710]/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B7C5B]">
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                        </span>
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#2B1E16]">{v.title}</h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6E5E53]">{fmtDate(v.published)}</p>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-center text-xs text-[#6E5E53]">
              Video termuat langsung dari{" "}
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#385338] underline underline-offset-2" data-testid="khotbah-channel-link-bottom">
                kanal YouTube GKI Kediri
              </a>
              .
            </p>
          </>
        )}
      </section>
    </div>
  );
}
