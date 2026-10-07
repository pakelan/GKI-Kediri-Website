import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Search } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import { FORM_CATEGORIES } from "@/lib/content";
import type { FormItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Formulir() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Semua");
  const { data: forms = [], isError } = useQuery({
    queryKey: ["formulir"],
    queryFn: () => apiGet<FormItem[]>("/formulir"),
  });

  const filtered = useMemo(
    () =>
      forms.filter(
        (f) =>
          (category === "Semua" || f.category === category) &&
          (q === "" || f.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [forms, q, category]
  );

  return (
    <div data-testid="formulir-page">
      <PageHeader
        overline="Formulir Jemaat"
        title="Unduh formulir yang kamu butuhkan"
        description="Formulir administrasi jemaat — baptisan, pemberkatan nikah, penatalayanan, dan lainnya. Isi lalu serahkan ke sekretariat."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E5E53]" />
            <Input
              className="rounded-full pl-10"
              placeholder="Cari formulir..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="formulir-search-input"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["Semua", ...FORM_CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                data-testid={`formulir-filter-${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                  category === c
                    ? "border-[#2B1E16] bg-[#2B1E16] text-[#FAF7F2]"
                    : "border-[#2B1E16]/15 bg-white text-[#6E5E53] hover:border-[#5B7C5B]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isError || filtered.length === 0 ? (
          <div className="mt-14 flex flex-col items-center rounded-[2rem] border border-dashed border-[#2B1E16]/15 bg-[#F3EDE4] p-14 text-center" data-testid="formulir-empty-state">
            <FileDown className="h-10 w-10 text-[#5B7C5B]" />
            <p className="mt-4 font-heading text-lg font-bold text-[#2B1E16]">Belum ada formulir yang cocok</p>
            <p className="mt-1 max-w-sm text-sm text-[#6E5E53]">
              Formulir baru akan diunggah admin secara berkala. Hubungi sekretariat bila kamu membutuhkan formulir tertentu.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="formulir-grid">
            {filtered.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.05}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-[#2B1E16]/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" data-testid={`formulir-card-${f.id}`}>
                  <div>
                    <span className="rounded-full bg-[#E5EDE5] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#385338]">{f.category}</span>
                    <h3 className="mt-4 font-heading text-lg font-bold tracking-tight text-[#2B1E16]">{f.title}</h3>
                    {f.description && <p className="mt-2 text-sm leading-relaxed text-[#6E5E53]">{f.description}</p>}
                  </div>
                  <a
                    href={f.file_path ? `/api/files/${f.file_path}` : f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#385338] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4D6B4D]"
                    data-testid={`formulir-download-${f.id}`}
                  >
                    <Download className="h-4 w-4" />
                    Unduh Formulir
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
