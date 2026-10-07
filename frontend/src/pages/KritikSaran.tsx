import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquareHeart, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, ApiError } from "@/lib/api";
import { FEEDBACK_CATEGORIES } from "@/lib/content";
import type { Feedback } from "@/lib/types";

const EMPTY_FORM = { name: "", contact: "", category: "Ibadah", message: "" };

export default function KritikSaran() {
  const [form, setForm] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) => apiPost<Feedback>("/kritik-saran", body),
    onSuccess: () => {
      toast.success("Terima kasih! Aspirasimu sudah kami terima.");
      setForm(EMPTY_FORM);
    },
    onError: (e) => {
      const d = e instanceof ApiError ? (e.body as { detail?: unknown } | null)?.detail : null;
      toast.error(typeof d === "string" ? d : "Terjadi kesalahan. Coba lagi.");
    },
  });

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div data-testid="kritik-saran-page">
      <PageHeader
        overline="Kritik & Saran"
        title="Suaramu membangun gereja ini"
        description="Aspirasi jemaat dibaca langsung oleh Majelis Jemaat GKI Kediri dan dibahas dalam persidangan. Sampaikan dengan kasih dan keberanian."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
        <Reveal className="lg:col-span-7">
          <form onSubmit={submit} className="rounded-[2rem] border border-[#2B1E16]/8 bg-white p-7 shadow-sm sm:p-9" data-testid="kritik-saran-form">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EADECF]">
                <MessageSquareHeart className="h-5 w-5 text-[#5C4638]" />
              </div>
              <h2 className="font-heading text-xl font-bold text-[#2B1E16]">Formulir Aspirasi</h2>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ks-name">Nama (opsional)</Label>
                <Input id="ks-name" data-testid="kritik-saran-name-input" placeholder="Boleh dikosongkan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ks-contact">Kontak (opsional)</Label>
                <Input id="ks-contact" data-testid="kritik-saran-contact-input" placeholder="WA / email bila ingin ditindaklanjuti" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="kritik-saran-category-select">
                    <SelectValue>{(v) => String(v)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ks-message">Kritik / Saran</Label>
                <Textarea
                  id="ks-message"
                  data-testid="kritik-saran-message-input"
                  placeholder="Tuliskan aspirasimu dengan jelas..."
                  rows={6}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="mt-6 w-full rounded-full bg-[#2B1E16] py-6 text-[#FAF7F2] hover:bg-[#382419] sm:w-auto sm:px-10" data-testid="kritik-saran-submit-btn">
              <Send className="h-4 w-4" />
              {mutation.isPending ? "Mengirim..." : "Kirim Aspirasi"}
            </Button>
          </form>
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-5">
          <div className="space-y-5">
            <div className="rounded-[2rem] bg-[#E5EDE5] p-8">
              <ShieldCheck className="h-7 w-7 text-[#385338]" />
              <h3 className="mt-4 font-heading text-lg font-bold text-[#1E301E]">Dijaga kerahasiaannya</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475F47]">
                Identitas pengirim hanya diketahui Majelis Jemaat dan tidak pernah dipublikasikan. Kamu juga bebas mengirim tanpa nama sama sekali.
              </p>
            </div>
            <div className="rounded-[2rem] bg-[#231710] p-8 text-[#FBF8F4]">
              <p className="font-heading text-lg italic leading-relaxed text-[#EADECF]">
                “Segala sesuatu yang kamu kehendaki supaya orang perbuat kepadamu, perbuatlah demikian juga kepada mereka.”
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#9EC49E]">Matius 7 : 12</p>
            </div>
            <div className="rounded-[2rem] border border-[#2B1E16]/8 bg-white p-8">
              <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Ke mana aspirasi pergi?</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#6E5E53]">
                <li>Aspirasi masuk ke konsol Majelis Jemaat.</li>
                <li>Dibahas dalam persidangan majelis berkala.</li>
                <li>Tindak lanjut diumumkan lewat Warta Jemaat.</li>
              </ol>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
