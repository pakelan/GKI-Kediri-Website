import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Download, Newspaper } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { apiGet } from "@/lib/api";
import type { Warta } from "@/lib/types";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "EEEE, d MMMM yyyy", { locale: idLocale });
}

export default function WartaJemaat() {
  const { data: warta = [], isError, isLoading } = useQuery({
    queryKey: ["warta"],
    queryFn: () => apiGet<Warta[]>("/warta"),
  });

  return (
    <div data-testid="warta-page">
      <PageHeader
        overline="Warta Jemaat"
        title="Kabar jemaat, setiap minggu"
        description="Warta Jemaat berisi tata ibadah, pengumuman, dan agenda pekan ini. Klik untuk membuka atau mengunduhnya."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {isLoading ? (
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat warta...</p>
        ) : isError || warta.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#2B1E16]/15 bg-[#F3EDE4] p-14 text-center" data-testid="warta-empty-state">
            <Newspaper className="h-10 w-10 text-[#5B7C5B]" />
            <p className="mt-4 font-heading text-lg font-bold text-[#2B1E16]">Belum ada warta yang terbit</p>
            <p className="mt-1 max-w-sm text-sm text-[#6E5E53]">
              Warta mingguan akan diunggah admin menjelang hari Minggu. Silakan kembali lagi nanti.
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="warta-list">
            {warta.map((w, i) => (
              <Reveal key={w.id} delay={i * 0.05}>
                <div className="flex flex-col gap-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-7" data-testid={`warta-card-${w.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5EDE5]">
                      <Newspaper className="h-5 w-5 text-[#385338]" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold tracking-tight text-[#2B1E16]">{w.title}</h3>
                      {w.issue_date && (
                        <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-[#6E5E53]">{formatDate(w.issue_date)}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href={w.file_path ? `/api/files/${w.file_path}` : w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#385338] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4D6B4D]"
                    data-testid={`warta-download-${w.id}`}
                  >
                    <Download className="h-4 w-4" />
                    Buka Warta
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
