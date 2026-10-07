import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { HeartHandshake, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { PRAYER_CATEGORIES } from "@/lib/content";
import type { Prayer, PublicPrayer } from "@/lib/types";

const EMPTY_FORM = { name: "", category: "Kesehatan", request: "", is_anonymous: false, show_public: true };

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const d = (e.body as { detail?: unknown } | null)?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg ?? "").filter(Boolean).join(" ");
  }
  return "Terjadi kesalahan. Coba lagi.";
}

export default function PokokDoa() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: publicPrayers = [], isError } = useQuery({
    queryKey: ["public-prayers"],
    queryFn: () => apiGet<PublicPrayer[]>("/pokok-doa/public"),
  });

  const mutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) => apiPost<Prayer>("/pokok-doa", body),
    onSuccess: () => {
      toast.success("Pokok doa terkirim. Majelis dan jemaat akan berdoa untukmu.");
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["public-prayers"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div data-testid="pokok-doa-page">
      <PageHeader
        overline="Pokok Doa"
        title="Ada yang ingin didoakan? Sampaikan di sini"
        description="Setiap pokok doa dibaca dan didoakan oleh majelis serta tim doa GKI Kediri. Kamu bisa memilih untuk tampil publik, anonim, atau privat sepenuhnya."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
        <Reveal className="lg:col-span-6">
          <form onSubmit={submit} className="rounded-[2rem] border border-[#2B1E16]/8 bg-white p-7 shadow-sm sm:p-9" data-testid="pokok-doa-form">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5EDE5]">
                <HeartHandshake className="h-5 w-5 text-[#385338]" />
              </div>
              <h2 className="font-heading text-xl font-bold text-[#2B1E16]">Formulir Pokok Doa</h2>
            </div>
            <div className="mt-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pd-name">Nama</Label>
                <Input
                  id="pd-name"
                  data-testid="pokok-doa-name-input"
                  placeholder="Namamu (boleh dikosongkan)"
                  value={form.name}
                  disabled={form.is_anonymous}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="pokok-doa-category-select">
                    <SelectValue>{(v) => String(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pd-request">Pokok Doa</Label>
                <Textarea
                  id="pd-request"
                  data-testid="pokok-doa-request-input"
                  placeholder="Tuliskan pergumulan atau ucapan syukurmu..."
                  rows={5}
                  required
                  value={form.request}
                  onChange={(e) => setForm({ ...form, request: e.target.value })}
                />
              </div>
              <div className="space-y-3 rounded-2xl bg-[#F3EDE4] p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#2B1E16]">
                  <Checkbox
                    checked={form.is_anonymous}
                    onCheckedChange={(c) => setForm({ ...form, is_anonymous: c === true })}
                    data-testid="pokok-doa-anonymous-checkbox"
                  />
                  Kirim sebagai anonim (nama tidak disimpan)
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#2B1E16]">
                  <Checkbox
                    checked={form.show_public}
                    onCheckedChange={(c) => setForm({ ...form, show_public: c === true })}
                    disabled={form.is_anonymous}
                    data-testid="pokok-doa-public-checkbox"
                  />
                  Boleh ditampilkan di dinding doa agar jemaat ikut mendoakan
                </label>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-[#385338] py-6 text-[#FAF7F2] hover:bg-[#4D6B4D]" data-testid="pokok-doa-submit-btn">
                <Send className="h-4 w-4" />
                {mutation.isPending ? "Mengirim..." : "Kirim Pokok Doa"}
              </Button>
            </div>
          </form>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-6">
          <div className="rounded-[2rem] bg-[#231710] p-7 text-[#FBF8F4] sm:p-9">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#9EC49E]" />
              <h2 className="font-heading text-xl font-bold">Dinding Doa Jemaat</h2>
            </div>
            <p className="mt-2 text-sm text-[#CBB8A9]">Mari saling menopang — doakan juga pokok doa saudara-saudari kita.</p>
            <div className="mt-6 max-h-[560px] space-y-4 overflow-y-auto pr-1" data-testid="public-prayer-list">
              {isError && (
                <p className="rounded-2xl border border-[#FBF8F4]/10 p-5 text-sm text-[#CBB8A9]" data-testid="public-prayer-empty">
                  Dinding doa belum dapat dimuat. Pokok doamu tetap tersimpan saat dikirim.
                </p>
              )}
              {!isError && publicPrayers.length === 0 && (
                <p className="rounded-2xl border border-[#FBF8F4]/10 p-5 text-sm text-[#CBB8A9]" data-testid="public-prayer-empty">
                  Belum ada pokok doa publik. Jadilah yang pertama berbagi.
                </p>
              )}
              {publicPrayers.map((p) => (
                <article key={p.id} className="rounded-2xl border border-[#FBF8F4]/10 bg-[#2B1E16] p-5" data-testid={`public-prayer-${p.id}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#5B7C5B]/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9EC49E]">{p.category}</span>
                    <time className="text-xs text-[#CBB8A9]">
                      {format(new Date(p.created_at), "d MMM yyyy", { locale: idLocale })}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#EADECF]">{p.request}</p>
                  <p className="mt-3 text-xs font-semibold text-[#9EC49E]">— {p.name || "Seorang jemaat"}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
