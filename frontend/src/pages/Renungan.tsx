import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader, Reveal } from "@/components/Reveal";
import { apiGet } from "@/lib/api";
import type { Renungan } from "@/lib/types";

function fmt(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, "EEEE, d MMMM yyyy", { locale: idLocale });
}

export default function RenunganList() {
  const { data: items = [], isError, isLoading } = useQuery({
    queryKey: ["renungan"],
    queryFn: () => apiGet<Renungan[]>("/renungan"),
  });

  return (
    <div data-testid="renungan-page">
      <PageHeader
        overline="Renungan Mingguan"
        title="Bahan teduh untuk pekanmu"
        description="Renungan singkat dari para hamba Tuhan GKI Kediri — dibaca lima menit, direnungkan sepanjang minggu."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {isLoading ? (
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat renungan...</p>
        ) : isError || items.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#2B1E16]/15 bg-[#F3EDE4] p-14 text-center" data-testid="renungan-empty-state">
            <BookOpen className="h-10 w-10 text-[#5B7C5B]" />
            <p className="mt-4 font-heading text-lg font-bold text-[#2B1E16]">Belum ada renungan yang terbit</p>
            <p className="mt-1 max-w-sm text-sm text-[#6E5E53]">Renungan mingguan ditulis admin dan terbit setiap pekan. Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="renungan-grid">
            {items.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.06}>
                <Link
                  to={`/renungan/${r.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#2B1E16]/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  data-testid={`renungan-card-${r.id}`}
                >
                  {r.cover_path && (
                    <img
                      src={`/api/files/${r.cover_path}`}
                      alt={`Sampul renungan ${r.title}`}
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between p-7">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B7C5B]">{r.published_date ? fmt(r.published_date) : "Renungan"}</p>
                      <h3 className="mt-3 font-heading text-xl font-bold tracking-tight text-[#2B1E16]">{r.title}</h3>
                      {r.passage && <p className="mt-1.5 font-mono text-xs text-[#B85C38]">{r.passage}</p>}
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#6E5E53]">{r.body}</p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#385338]">
                      Baca renungan
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
