import { useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { useJadwal } from "@/lib/useContent";
import type { JadwalItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "minggu", label: "Ibadah Minggu" },
  { key: "muda", label: "Anak, Remaja & Pemuda" },
  { key: "komisi", label: "Persekutuan & Komisi" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function matches(s: JadwalItem, f: FilterKey) {
  if (f === "semua") return true;
  return s.tag === f;
}

export default function Jadwal() {
  const [filter, setFilter] = useState<FilterKey>("semua");
  const jadwal = useJadwal();
  const items = jadwal.filter((s) => matches(s, filter));

  return (
    <div data-testid="jadwal-page">
      <PageHeader
        overline="Jadwal Ibadah"
        title="Datanglah — rumah ini selalu terbuka"
        description="Jadwal ibadah dan persekutuan mingguan GKI Kediri. Jadwal khusus (hari raya, retreat) diumumkan lewat Warta Jemaat."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter jadwal">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              data-testid={`jadwal-filter-${f.key}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                filter === f.key
                  ? "border-[#2B1E16] bg-[#2B1E16] text-[#FAF7F2]"
                  : "border-[#2B1E16]/15 bg-white text-[#6E5E53] hover:border-[#5B7C5B] hover:text-[#385338]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="jadwal-grid">
          {items.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-[#2B1E16]/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" data-testid={`jadwal-card-${i}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#E5EDE5] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#385338]">{s.day}</span>
                  <span className="flex items-center gap-1 text-xs text-[#6E5E53]">
                    <MapPin className="h-3.5 w-3.5" />
                    {s.place}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-[#2B1E16]">{s.name}</h3>
                  <p className="mt-1.5 text-sm text-[#6E5E53]">{s.note}</p>
                </div>
                <p className="mt-5 flex items-center gap-2 font-heading text-lg font-semibold text-[#385338]">
                  <Clock className="h-4 w-4" />
                  {s.time}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-10 rounded-3xl bg-[#EADECF] p-7 text-sm leading-relaxed text-[#5C4638]" data-testid="jadwal-note">
            <strong className="font-semibold text-[#2B1E16]">Catatan:</strong> jadwal dapat berubah pada minggu hari raya atau acara khusus jemaat. Informasi terbaru selalu tersedia di halaman Warta Jemaat.
          </div>
        </Reveal>
      </section>
    </div>
  );
}
