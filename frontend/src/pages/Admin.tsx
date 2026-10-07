import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { BookOpen, CalendarDays, FileText, LayoutDashboard, LogOut, Newspaper, Pencil, Plus, Settings as SettingsIcon, Trash2, Users, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { FORM_CATEGORIES } from "@/lib/content";
import { CONTENT_DEFAULTS } from "@/lib/useContent";
import type { Feedback, FormItem, JadwalItem, KomisiItem, Prayer, Renungan, SiteContent, SiteSettings, Stats, Warta } from "@/lib/types";

function fmtDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "d MMM yyyy, HH:mm", { locale: idLocale });
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error((body as { detail?: string } | null)?.detail || "Unggah berkas gagal");
  }
  return ((await res.json()) as { path: string }).path;
}

function StatsTab() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiGet<Stats>("/admin/stats") });
  const cards = [
    { label: "Pokok Doa Baru", value: stats?.pokok_doa_baru ?? "—", icon: LayoutDashboard },
    { label: "Total Pokok Doa", value: stats?.pokok_doa_total ?? "—", icon: LayoutDashboard },
    { label: "Kritik & Saran", value: stats?.kritik_saran ?? "—", icon: FileText },
    { label: "Warta Terbit", value: stats?.warta ?? "—", icon: Newspaper },
    { label: "Formulir", value: stats?.formulir ?? "—", icon: FileText },
    { label: "Renungan Terbit", value: stats?.renungan ?? "—", icon: BookOpen },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="admin-stats-grid">
      {cards.map((c) => (
        <div key={c.label} className="rounded-3xl border border-[#2B1E16]/8 bg-white p-6">
          <c.icon className="h-5 w-5 text-[#5B7C5B]" />
          <p className="mt-4 font-heading text-3xl font-bold text-[#2B1E16]">{c.value}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E5E53]">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function PrayersTab() {
  const queryClient = useQueryClient();
  const { data: prayers = [] } = useQuery({ queryKey: ["admin-prayers"], queryFn: () => apiGet<Prayer[]>("/admin/pokok-doa") });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiPatch(`/admin/pokok-doa/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prayers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Gagal mengubah status"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/pokok-doa/${id}`),
    onSuccess: () => {
      toast.success("Pokok doa dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-prayers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  return (
    <div className="space-y-4" data-testid="admin-prayer-list">
      {prayers.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada pokok doa masuk.</p>}
      {prayers.map((p) => (
        <article key={p.id} className="rounded-3xl border border-[#2B1E16]/8 bg-white p-6" data-testid={`admin-prayer-${p.id}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#E5EDE5] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#385338]">{p.category}</span>
            <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${p.status === "baru" ? "bg-[#B85C38]/15 text-[#B85C38]" : p.status === "didukung" ? "bg-[#5B7C5B]/15 text-[#385338]" : "bg-[#EADECF] text-[#5C4638]"}`}>
              {p.status}
            </span>
            {p.is_anonymous && <span className="rounded-full bg-[#9E2A2B]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#9E2A2B]">Anonim</span>}
            <span className="ml-auto text-xs text-[#6E5E53]">{fmtDate(p.created_at)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#2B1E16]">{p.request}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6E5E53]">{p.is_anonymous ? "Anonim" : p.name || "Tanpa nama"}</span>
            <span className="mx-1 text-[#CBB8A9]">•</span>
            {p.status !== "didukung" && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => statusMutation.mutate({ id: p.id, status: "didukung" })} data-testid={`admin-prayer-support-${p.id}`}>
                Tandai Didukung
              </Button>
            )}
            {p.status !== "selesai" && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => statusMutation.mutate({ id: p.id, status: "selesai" })} data-testid={`admin-prayer-done-${p.id}`}>
                Tandai Selesai
              </Button>
            )}
            <Button size="sm" variant="ghost" className="rounded-full text-[#9E2A2B] hover:bg-[#9E2A2B]/10 hover:text-[#9E2A2B]" onClick={() => deleteMutation.mutate(p.id)} data-testid={`admin-prayer-delete-${p.id}`}>
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function FeedbackTab() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["admin-feedback"], queryFn: () => apiGet<Feedback[]>("/admin/kritik-saran") });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/kritik-saran/${id}`),
    onSuccess: () => {
      toast.success("Aspirasi dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  return (
    <div className="space-y-4" data-testid="admin-feedback-list">
      {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada kritik & saran masuk.</p>}
      {items.map((f) => (
        <article key={f.id} className="rounded-3xl border border-[#2B1E16]/8 bg-white p-6" data-testid={`admin-feedback-${f.id}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EADECF] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C4638]">{f.category}</span>
            <span className="ml-auto text-xs text-[#6E5E53]">{fmtDate(f.created_at)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#2B1E16]">{f.message}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#6E5E53]">{f.name || "Tanpa nama"}{f.contact ? ` — ${f.contact}` : ""}</span>
            <span className="mx-1 text-[#CBB8A9]">•</span>
            <Button size="sm" variant="ghost" className="rounded-full text-[#9E2A2B] hover:bg-[#9E2A2B]/10 hover:text-[#9E2A2B]" onClick={() => deleteMutation.mutate(f.id)} data-testid={`admin-feedback-delete-${f.id}`}>
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function WartaTab() {
  const queryClient = useQueryClient();
  const emptyForm = { title: "", issue_date: "", url: "", file_path: "" };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: items = [] } = useQuery({ queryKey: ["admin-warta"], queryFn: () => apiGet<Warta[]>("/warta") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-warta"] });
    queryClient.invalidateQueries({ queryKey: ["warta"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const file_path = file ? await uploadFile(file) : form.file_path;
      const payload = { title: form.title, issue_date: form.issue_date, url: form.url, file_path };
      return editId ? apiPut<Warta>(`/admin/warta/${editId}`, payload) : apiPost<Warta>("/admin/warta", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Warta diperbarui" : "Warta ditambahkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan warta. Periksa isian."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/warta/${id}`),
    onSuccess: () => {
      toast.success("Warta dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const startEdit = (w: Warta) => {
    setEditId(w.id);
    setForm({ title: w.title, issue_date: w.issue_date, url: w.url, file_path: w.file_path });
    setFile(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.url && !file && !form.file_path) {
            toast.error("Isi link unduhan atau pilih berkas PDF");
            return;
          }
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
        data-testid="admin-warta-form"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Warta" : "Tambah Warta"}</h3>
        <div className="space-y-2">
          <Label htmlFor="warta-title">Judul</Label>
          <Input id="warta-title" required placeholder="Warta Jemaat — Minggu, 19 Juli 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="admin-warta-title-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warta-date">Tanggal Terbit</Label>
          <Input id="warta-date" type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} data-testid="admin-warta-date-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warta-file">Unggah Berkas PDF (maks. 10 MB)</Label>
          <Input id="warta-file" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="admin-warta-file-input" />
          {file ? (
            <p className="text-xs text-[#385338]">Terpilih: {file.name}</p>
          ) : form.file_path ? (
            <p className="text-xs text-[#6E5E53]">Berkas saat ini tetap dipakai bila tidak memilih berkas baru.</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="warta-url">Atau Link Unduhan (Google Drive / PDF)</Label>
          <Input id="warta-url" type="url" placeholder="https://drive.google.com/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} data-testid="admin-warta-url-input" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-warta-submit-btn">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Warta"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm} data-testid="admin-warta-cancel-btn">
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3" data-testid="admin-warta-list">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada warta.</p>}
        {items.map((w) => (
          <div key={w.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5" data-testid={`admin-warta-${w.id}`}>
            <Newspaper className="h-5 w-5 shrink-0 text-[#5B7C5B]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{w.title}</p>
              <p className="truncate text-xs text-[#6E5E53]">{w.issue_date} — {w.file_path ? "Berkas terunggah" : w.url}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah warta" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(w)} data-testid={`admin-warta-edit-${w.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus warta" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(w.id)} data-testid={`admin-warta-delete-${w.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulirTab() {
  const queryClient = useQueryClient();
  const emptyForm = { title: "", description: "", category: "Administrasi", url: "", file_path: "" };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: items = [] } = useQuery({ queryKey: ["admin-formulir"], queryFn: () => apiGet<FormItem[]>("/formulir") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-formulir"] });
    queryClient.invalidateQueries({ queryKey: ["formulir"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const file_path = file ? await uploadFile(file) : form.file_path;
      const payload = { title: form.title, description: form.description, category: form.category, url: form.url, file_path };
      return editId ? apiPut<FormItem>(`/admin/formulir/${editId}`, payload) : apiPost<FormItem>("/admin/formulir", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Formulir diperbarui" : "Formulir ditambahkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan formulir. Periksa isian."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/formulir/${id}`),
    onSuccess: () => {
      toast.success("Formulir dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const startEdit = (f: FormItem) => {
    setEditId(f.id);
    setForm({ title: f.title, description: f.description, category: f.category, url: f.url, file_path: f.file_path });
    setFile(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.url && !file && !form.file_path) {
            toast.error("Isi link unduhan atau pilih berkas");
            return;
          }
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
        data-testid="admin-formulir-form"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Formulir" : "Tambah Formulir"}</h3>
        <div className="space-y-2">
          <Label htmlFor="form-title">Judul</Label>
          <Input id="form-title" required placeholder="Formulir Permohonan ..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="admin-formulir-title-input" />
        </div>
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
            <SelectTrigger data-testid="admin-formulir-category-select">
              <SelectValue>{(v) => String(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FORM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-desc">Deskripsi (opsional)</Label>
          <Textarea id="form-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="admin-formulir-desc-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-file">Unggah Berkas (PDF/PNG/JPG, maks. 10 MB)</Label>
          <Input id="form-file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="admin-formulir-file-input" />
          {file ? (
            <p className="text-xs text-[#385338]">Terpilih: {file.name}</p>
          ) : form.file_path ? (
            <p className="text-xs text-[#6E5E53]">Berkas saat ini tetap dipakai bila tidak memilih berkas baru.</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-url">Atau Link Unduhan</Label>
          <Input id="form-url" type="url" placeholder="https://drive.google.com/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} data-testid="admin-formulir-url-input" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-formulir-submit-btn">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Formulir"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm} data-testid="admin-formulir-cancel-btn">
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3" data-testid="admin-formulir-list">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada formulir.</p>}
        {items.map((f) => (
          <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5" data-testid={`admin-formulir-${f.id}`}>
            <FileText className="h-5 w-5 shrink-0 text-[#5B7C5B]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{f.title}</p>
              <p className="truncate text-xs text-[#6E5E53]">{f.category} — {f.file_path ? "Berkas terunggah" : f.url}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah formulir" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(f)} data-testid={`admin-formulir-edit-${f.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus formulir" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(f.id)} data-testid={`admin-formulir-delete-${f.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RenunganTab() {
  const queryClient = useQueryClient();
  const emptyForm = { title: "", passage: "", published_date: "", body: "", cover_path: "" };
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: items = [] } = useQuery({ queryKey: ["admin-renungan"], queryFn: () => apiGet<Renungan[]>("/renungan") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-renungan"] });
    queryClient.invalidateQueries({ queryKey: ["renungan"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setCover(null);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cover_path = cover ? await uploadFile(cover) : form.cover_path;
      const payload = { title: form.title, passage: form.passage, published_date: form.published_date, body: form.body, cover_path };
      return editId ? apiPut<Renungan>(`/admin/renungan/${editId}`, payload) : apiPost<Renungan>("/admin/renungan", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Renungan diperbarui" : "Renungan diterbitkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan renungan. Periksa isian."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/renungan/${id}`),
    onSuccess: () => {
      toast.success("Renungan dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const startEdit = (r: Renungan) => {
    setEditId(r.id);
    setForm({ title: r.title, passage: r.passage, published_date: r.published_date, body: r.body, cover_path: r.cover_path });
    setCover(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
        data-testid="admin-renungan-form"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Renungan" : "Tulis Renungan"}</h3>
        <div className="space-y-2">
          <Label htmlFor="ren-title">Judul</Label>
          <Input id="ren-title" required placeholder="Kasih yang Menopang" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="admin-renungan-title-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ren-passage">Ayat (opsional)</Label>
          <Input id="ren-passage" placeholder="Yohanes 15 : 9-12" value={form.passage} onChange={(e) => setForm({ ...form, passage: e.target.value })} data-testid="admin-renungan-passage-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ren-date">Tanggal Terbit</Label>
          <Input id="ren-date" type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} data-testid="admin-renungan-date-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ren-cover">Foto Sampul (opsional, JPG/PNG)</Label>
          <Input id="ren-cover" type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setCover(e.target.files?.[0] ?? null)} data-testid="admin-renungan-cover-input" />
          {cover ? (
            <p className="text-xs text-[#385338]">Terpilih: {cover.name}</p>
          ) : form.cover_path ? (
            <p className="text-xs text-[#6E5E53]">Sampul saat ini tetap dipakai bila tidak memilih foto baru.</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ren-body">Isi Renungan</Label>
          <Textarea id="ren-body" required rows={8} placeholder="Tuliskan renungan di sini..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} data-testid="admin-renungan-body-input" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-renungan-submit-btn">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Terbitkan Renungan"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm} data-testid="admin-renungan-cancel-btn">
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3" data-testid="admin-renungan-list">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada renungan.</p>}
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5" data-testid={`admin-renungan-${r.id}`}>
            {r.cover_path ? (
              <img src={`/api/files/${r.cover_path}`} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            ) : (
              <BookOpen className="h-5 w-5 shrink-0 text-[#5B7C5B]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{r.title}</p>
              <p className="truncate text-xs text-[#6E5E53]">{r.published_date}{r.passage ? ` — ${r.passage}` : ""}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah renungan" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(r)} data-testid={`admin-renungan-edit-${r.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus renungan" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(r.id)} data-testid={`admin-renungan-delete-${r.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === KOMPONEN BARU: GALLERY TAB ===
function GalleryTab() {
  const queryClient = useQueryClient();
  const emptyForm = { title: "", description: "", category: "Umum", image_url: "" };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Mengambil daftar foto dari backend
  const { data: items = [] } = useQuery({ queryKey: ["admin-gallery"], queryFn: () => apiGet<any[]>("/gallery") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] }); // Refresh halaman galeri publik
  };
  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let final_image_url = form.image_url;
      // Jika ada file foto yang dipilih, upload dulu ke server
      if (file) {
        final_image_url = await uploadFile(file);
      }
      const payload = { title: form.title, description: form.description, category: form.category, image_url: final_image_url };
      return editId ? apiPut(`/admin/gallery/${editId}`, payload) : apiPost("/admin/gallery", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Foto diperbarui" : "Foto ditambahkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan foto. Periksa isian dan pastikan foto sudah dipilih."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/gallery/${id}`),
    onSuccess: () => {
      toast.success("Foto dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus foto"),
  });

  const startEdit = (g: any) => {
    setEditId(g.id);
    setForm({ title: g.title, description: g.description || "", category: g.category || "Umum", image_url: g.image_url });
    setFile(null);
  };

  const CATEGORIES = ["Umum", "Ibadah Minggu", "Perayaan Hari Besar", "Sekolah Minggu", "Pemuda & Remaja", "Keluarga & Komisi"];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.image_url && !file) {
            toast.error("Silakan pilih file foto terlebih dahulu.");
            return;
          }
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Foto" : "Upload Foto Baru"}</h3>
        <div className="space-y-2">
          <Label htmlFor="gal-title">Judul Foto</Label>
          <Input id="gal-title" required placeholder="Ibadah Paskah 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
            <SelectTrigger>
              <SelectValue>{(v) => String(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gal-desc">Deskripsi Singkat (opsional)</Label>
          <Textarea id="gal-desc" rows={2} placeholder="Keseruan jemaat saat perayaan..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gal-file">File Foto (JPG/PNG)</Label>
          <Input id="gal-file" type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file ? (
            <p className="text-xs text-[#385338]">Terpilih: {file.name}</p>
          ) : form.image_url ? (
            <p className="text-xs text-[#6E5E53]">Foto saat ini tetap dipakai bila tidak memilih foto baru.</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Upload Foto"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm}>
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada foto galeri.</p>}
        {items.map((g) => (
          <div key={g.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5">
            <img src={g.image_url.startsWith("http") ? g.image_url : `/api/files/${g.image_url}`} alt={g.title} className="h-14 w-14 shrink-0 rounded-xl object-cover border" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{g.title}</p>
              <p className="truncate text-xs text-[#6E5E53]">{g.category}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah foto" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(g)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus foto" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(g.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
// === AKHIR KOMPONEN GALLERY TAB ===


function SiteContentTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-content"], queryFn: () => apiGet<SiteContent>("/content") });
  const [form, setForm] = useState<SiteContent | null>(null);
  const [heroImg, setHeroImg] = useState<File | null>(null);
  const [aboutImg, setAboutImg] = useState<File | null>(null);
  const heroPreviewUrl = useMemo(() => (heroImg ? URL.createObjectURL(heroImg) : ""), [heroImg]);

  useEffect(() => {
    if (data && form === null) setForm({ ...CONTENT_DEFAULTS, ...data });
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("Formulir belum siap");
      const hero_image_path = heroImg ? await uploadFile(heroImg) : form.hero_image_path;
      const about_image_path = aboutImg ? await uploadFile(aboutImg) : form.about_image_path;
      return apiPut<SiteContent>("/admin/content", { ...form, hero_image_path, about_image_path });
    },
    onSuccess: () => {
      toast.success("Konten beranda & tentang disimpan");
      setHeroImg(null);
      setAboutImg(null);
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan konten"),
  });

  if (!form) {
    return <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat konten...</p>;
  }

  const set = (key: keyof SiteContent) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="max-w-3xl space-y-8"
      data-testid="admin-content-form"
    >
      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Pratinjau Langsung</h3>
        <div className="overflow-hidden rounded-2xl bg-[#231710] p-6 text-[#FBF8F4] sm:p-8" data-testid="admin-content-preview">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9EC49E]">{form.hero_overline}</p>
          <p className="mt-3 font-heading text-2xl font-bold leading-tight sm:text-3xl">
            {form.hero_line1} {form.hero_line2} <em className="italic text-[#9EC49E]">{form.hero_line3}</em>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#CBB8A9]">{form.hero_description}</p>
        </div>
        {(heroImg || form.hero_image_path) && (
          <img
            src={heroImg ? heroPreviewUrl : `/api/files/${form.hero_image_path}`}
            alt="Pratinjau foto utama beranda"
            className="aspect-video w-full rounded-2xl object-cover"
            data-testid="admin-content-preview-image"
          />
        )}
        <p className="text-xs text-[#6E5E53]">Pratinjau diperbarui otomatis saat kamu mengetik atau memilih foto.</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Kata Awalan Beranda (Hero)</h3>
        <div className="space-y-2">
          <Label htmlFor="ct-overline">Teks kecil di atas judul</Label>
          <Input id="ct-overline" value={form.hero_overline} onChange={set("hero_overline")} data-testid="admin-content-overline-input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ct-l1">Judul baris 1</Label>
            <Input id="ct-l1" value={form.hero_line1} onChange={set("hero_line1")} data-testid="admin-content-line1-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ct-l2">Judul baris 2</Label>
            <Input id="ct-l2" value={form.hero_line2} onChange={set("hero_line2")} data-testid="admin-content-line2-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ct-l3">Judul baris 3 (miring, hijau)</Label>
            <Input id="ct-l3" value={form.hero_line3} onChange={set("hero_line3")} data-testid="admin-content-line3-input" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-herodesc">Deskripsi di bawah judul</Label>
          <Textarea id="ct-herodesc" rows={3} value={form.hero_description} onChange={set("hero_description")} data-testid="admin-content-herodesc-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-heroimg">Foto utama beranda (JPG/PNG)</Label>
          <Input id="ct-heroimg" type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setHeroImg(e.target.files?.[0] ?? null)} data-testid="admin-content-heroimg-input" />
          {heroImg ? (
            <p className="text-xs text-[#385338]">Terpilih: {heroImg.name}</p>
          ) : form.hero_image_path ? (
            <p className="text-xs text-[#6E5E53]">Foto saat ini tetap dipakai bila tidak memilih foto baru.</p>
          ) : (
            <p className="text-xs text-[#6E5E53]">Belum ada foto khusus — memakai foto bawaan.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Halaman Tentang — Cerita Kami</h3>
        <div className="space-y-2">
          <Label htmlFor="ct-abouthead">Judul cerita</Label>
          <Input id="ct-abouthead" value={form.about_heading} onChange={set("about_heading")} data-testid="admin-content-abouthead-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-story">Isi cerita (pisahkan paragraf dengan baris kosong)</Label>
          <Textarea id="ct-story" rows={6} value={form.about_story} onChange={set("about_story")} data-testid="admin-content-story-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-aboutimg">Foto cerita (JPG/PNG)</Label>
          <Input id="ct-aboutimg" type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setAboutImg(e.target.files?.[0] ?? null)} data-testid="admin-content-aboutimg-input" />
          {aboutImg ? (
            <p className="text-xs text-[#385338]">Terpilih: {aboutImg.name}</p>
          ) : form.about_image_path ? (
            <p className="text-xs text-[#6E5E53]">Foto saat ini tetap dipakai bila tidak memilih foto baru.</p>
          ) : (
            <p className="text-xs text-[#6E5E53]">Belum ada foto khusus — memakai foto bawaan.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Visi & Misi</h3>
        <div className="space-y-2">
          <Label htmlFor="ct-visi">Visi</Label>
          <Textarea id="ct-visi" rows={2} value={form.visi} onChange={set("visi")} data-testid="admin-content-visi-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-misi">Misi (satu poin per baris)</Label>
          <Textarea id="ct-misi" rows={4} value={form.misi} onChange={set("misi")} data-testid="admin-content-misi-input" />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Pengumuman Kilat</h3>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#2B1E16]">
          <Checkbox
            checked={form.announcement_enabled}
            onCheckedChange={(c) => setForm({ ...form, announcement_enabled: c === true })}
            data-testid="admin-content-announcement-toggle"
          />
          Nyalakan bilah pengumuman di bagian atas website
        </label>
        <div className="space-y-2">
          <Label htmlFor="ct-anntext">Isi pengumuman</Label>
          <Input id="ct-anntext" placeholder="Mis. Ibadah Minggu ini ditiadakan — digabung ke ibadah kedua" value={form.announcement_text} onChange={set("announcement_text")} data-testid="admin-content-announcement-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-annlink">Tautan "Selengkapnya" (opsional)</Label>
          <Input id="ct-annlink" type="url" placeholder="https://..." value={form.announcement_link} onChange={set("announcement_link")} data-testid="admin-content-announcement-link-input" />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Jam Ibadah Raya (Footer)</h3>
        <div className="space-y-2">
          <Label htmlFor="ct-worship">Satu baris per ibadah, format: Nama | Jam</Label>
          <Textarea id="ct-worship" rows={3} value={form.worship_times} onChange={set("worship_times")} data-testid="admin-content-worship-input" />
          <p className="text-xs text-[#6E5E53]">Contoh: Minggu Pagi | 06.00 WIB</p>
        </div>
      </section>

      <Button type="submit" disabled={saveMutation.isPending} className="rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-content-save-btn">
        {saveMutation.isPending ? "Menyimpan..." : "Simpan Semua Konten"}
      </Button>
    </form>
  );
}

function JadwalTab() {
  const queryClient = useQueryClient();
  const emptyForm = { day: "Minggu", name: "", time: "", place: "", note: "", tag: "minggu" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: items = [] } = useQuery({ queryKey: ["admin-jadwal"], queryFn: () => apiGet<JadwalItem[]>("/jadwal") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-jadwal"] });
    queryClient.invalidateQueries({ queryKey: ["jadwal"] });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: () => (editId ? apiPut<JadwalItem>(`/admin/jadwal/${editId}`, form) : apiPost<JadwalItem>("/admin/jadwal", form)),
    onSuccess: () => {
      toast.success(editId ? "Jadwal diperbarui" : "Jadwal ditambahkan");
      resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menyimpan jadwal. Periksa isian."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/jadwal/${id}`),
    onSuccess: () => {
      toast.success("Jadwal dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const startEdit = (j: JadwalItem) => {
    setEditId(j.id);
    setForm({ day: j.day, name: j.name, time: j.time, place: j.place, note: j.note, tag: j.tag });
  };

  const TAG_LABELS: Record<string, string> = { minggu: "Ibadah Minggu", muda: "Anak, Remaja & Pemuda", komisi: "Persekutuan & Komisi" };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
        data-testid="admin-jadwal-form"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Jadwal" : "Tambah Jadwal"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="jd-day">Hari</Label>
            <Input id="jd-day" required placeholder="Minggu" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} data-testid="admin-jadwal-day-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jd-time">Jam</Label>
            <Input id="jd-time" placeholder="06.00 WIB" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} data-testid="admin-jadwal-time-input" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-name">Nama Ibadah / Kegiatan</Label>
          <Input id="jd-name" required placeholder="Ibadah Raya 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="admin-jadwal-name-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-place">Tempat</Label>
          <Input id="jd-place" placeholder="Gedung Utama" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} data-testid="admin-jadwal-place-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-note">Keterangan (opsional)</Label>
          <Input id="jd-note" placeholder="Ibadah pagi dengan liturgi Kidung Jemaat" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} data-testid="admin-jadwal-note-input" />
        </div>
        <div className="space-y-2">
          <Label>Kelompok</Label>
          <Select value={form.tag} onValueChange={(v: string) => setForm({ ...form, tag: v })}>
            <SelectTrigger data-testid="admin-jadwal-tag-select">
              <SelectValue>{(v) => TAG_LABELS[String(v)] ?? String(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TAG_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-jadwal-submit-btn">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Jadwal"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm} data-testid="admin-jadwal-cancel-btn">
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3" data-testid="admin-jadwal-list">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada jadwal.</p>}
        {items.map((j) => (
          <div key={j.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5" data-testid={`admin-jadwal-${j.id}`}>
            <CalendarDays className="h-5 w-5 shrink-0 text-[#5B7C5B]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{j.day} — {j.name}</p>
              <p className="truncate text-xs text-[#6E5E53]">{j.time}{j.place ? ` · ${j.place}` : ""} · {TAG_LABELS[j.tag] ?? j.tag}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah jadwal" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(j)} data-testid={`admin-jadwal-edit-${j.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus jadwal" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(j.id)} data-testid={`admin-jadwal-delete-${j.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KomisiTab() {
  const queryClient = useQueryClient();
  const emptyForm = { name: "", alias: "", desc: "", schedule: "", image_path: "" };
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: items = [] } = useQuery({ queryKey: ["admin-komisi"], queryFn: () => apiGet<KomisiItem[]>("/komisi") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-komisi"] });
    queryClient.invalidateQueries({ queryKey: ["komisi"] });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const image_path = image ? await uploadFile(image) : form.image_path;
      const payload = { ...form, image_path };
      return editId ? apiPut<KomisiItem>(`/admin/komisi/${editId}`, payload) : apiPost<KomisiItem>("/admin/komisi", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Komisi diperbarui" : "Komisi ditambahkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan komisi. Periksa isian."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/komisi/${id}`),
    onSuccess: () => {
      toast.success("Komisi dihapus");
      if (editId) resetForm();
      invalidate();
    },
    onError: () => toast.error("Gagal menghapus"),
  });

  const startEdit = (k: KomisiItem) => {
    setEditId(k.id);
    setForm({ name: k.name, alias: k.alias, desc: k.desc, schedule: k.schedule, image_path: k.image_path });
    setImage(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
        data-testid="admin-komisi-form"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Komisi" : "Tambah Komisi"}</h3>
        <div className="space-y-2">
          <Label htmlFor="km-name">Nama Komisi</Label>
          <Input id="km-name" required placeholder="Komisi Pemuda" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="admin-komisi-name-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km-alias">Nama Panggilan (opsional)</Label>
          <Input id="km-alias" placeholder="Youth Service" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} data-testid="admin-komisi-alias-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km-desc">Deskripsi</Label>
          <Textarea id="km-desc" rows={3} placeholder="Tentang komisi ini..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} data-testid="admin-komisi-desc-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km-schedule">Jadwal Kegiatan</Label>
          <Input id="km-schedule" placeholder="Jumat, 18.30 WIB" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} data-testid="admin-komisi-schedule-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km-image">Foto (opsional, JPG/PNG)</Label>
          <Input id="km-image" type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setImage(e.target.files?.[0] ?? null)} data-testid="admin-komisi-image-input" />
          {image ? (
            <p className="text-xs text-[#385338]">Terpilih: {image.name}</p>
          ) : form.image_path ? (
            <p className="text-xs text-[#6E5E53]">Foto saat ini tetap dipakai bila tidak memilih foto baru.</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-komisi-submit-btn">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Komisi"}
          </Button>
          {editId && (
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm} data-testid="admin-komisi-cancel-btn">
              Batal
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-3 lg:col-span-3" data-testid="admin-komisi-list">
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-[#2B1E16]/15 p-8 text-center text-sm text-[#6E5E53]">Belum ada komisi.</p>}
        {items.map((k) => (
          <div key={k.id} className="flex items-center gap-4 rounded-2xl border border-[#2B1E16]/8 bg-white p-5" data-testid={`admin-komisi-${k.id}`}>
            {k.image_path ? (
              <img src={`/api/files/${k.image_path}`} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            ) : (
              <Users className="h-5 w-5 shrink-0 text-[#5B7C5B]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2B1E16]">{k.name}{k.alias ? ` · ${k.alias}` : ""}</p>
              <p className="truncate text-xs text-[#6E5E53]">{k.schedule}</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Ubah komisi" className="text-[#385338] hover:bg-[#385338]/10" onClick={() => startEdit(k)} data-testid={`admin-komisi-edit-${k.id}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Hapus komisi" className="text-[#9E2A2B] hover:bg-[#9E2A2B]/10" onClick={() => deleteMutation.mutate(k.id)} data-testid={`admin-komisi-delete-${k.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiGet<SiteSettings>("/settings") });
  const [form, setForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (data && form === null) setForm(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (body: SiteSettings) => apiPut<SiteSettings>("/admin/settings", body),
    onSuccess: () => {
      toast.success("Pengaturan disimpan");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: () => toast.error("Gagal menyimpan pengaturan"),
  });

  if (!form) {
    return <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat pengaturan...</p>;
  }

  const fields: { key: keyof SiteSettings; label: string; placeholder: string }[] = [
    { key: "phone", label: "Nomor WhatsApp Sekretariat", placeholder: "0852-3535-3637" },
    { key: "address", label: "Alamat Lengkap Gereja", placeholder: "Jalan Yos Sudarso 31, Kediri" },
    { key: "email", label: "Email Resmi", placeholder: "mmgkikediri@gmail.com" },
    { key: "instagram", label: "Tautan Instagram", placeholder: "https://www.instagram.com/gkikediri/" },
    { key: "youtube", label: "Tautan YouTube", placeholder: "https://www.youtube.com/channel/..." },
    { key: "office_hours", label: "Jam Sekretariat", placeholder: "Selasa – Sabtu, 08.00 – 16.00 WIB" },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate(form);
      }}
      className="max-w-2xl space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 sm:p-8"
      data-testid="admin-settings-form"
    >
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-5 w-5 text-[#5B7C5B]" />
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">Data Kontak & Sosial Media</h3>
      </div>
      <p className="text-xs leading-relaxed text-[#6E5E53]">
        Data ini langsung tampil di halaman Kontak dan footer website. Perubahan tersimpan seketika.
      </p>
      {fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={`settings-${f.key}`}>{f.label}</Label>
          <Input
            id={`settings-${f.key}`}
            value={form[f.key]}
            placeholder={f.placeholder}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            data-testid={`admin-settings-${f.key}-input`}
          />
        </div>
      ))}
      <Button type="submit" disabled={saveMutation.isPending} className="rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]" data-testid="admin-settings-save-btn">
        {saveMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </form>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === false) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]" data-testid="admin-loading">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#6E5E53]">Memuat konsol...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EDE4]" data-testid="admin-page">
      <header className="sticky top-0 z-40 border-b border-[#2B1E16]/10 bg-[#231710] text-[#FBF8F4]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo light />
            <span className="hidden rounded-full bg-[#5B7C5B]/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EC49E] sm:inline">Konsol Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#CBB8A9] sm:inline" data-testid="admin-user-email">{user.email}</span>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-[#FBF8F4]/25 bg-transparent text-[#FBF8F4] hover:bg-[#FBF8F4]/10 hover:text-[#FBF8F4]"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
              data-testid="admin-logout-btn"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2B1E16] sm:text-3xl" data-testid="admin-title">
          Syaloom, {user.name}
        </h1>
        <p className="mt-1 text-sm text-[#6E5E53]">Kelola konten website jemaat dari sini.</p>
        <Tabs defaultValue="ringkasan" className="mt-8">
          <TabsList className="flex-wrap" data-testid="admin-tabs">
            <TabsTrigger value="ringkasan" data-testid="admin-tab-ringkasan">Ringkasan</TabsTrigger>
            <TabsTrigger value="doa" data-testid="admin-tab-doa">Pokok Doa</TabsTrigger>
            <TabsTrigger value="aspirasi" data-testid="admin-tab-aspirasi">Kritik & Saran</TabsTrigger>
            <TabsTrigger value="warta" data-testid="admin-tab-warta">Warta Jemaat</TabsTrigger>
            <TabsTrigger value="formulir" data-testid="admin-tab-formulir">Formulir</TabsTrigger>
            <TabsTrigger value="renungan" data-testid="admin-tab-renungan">Renungan</TabsTrigger>
            <TabsTrigger value="galeri" data-testid="admin-tab-galeri">Galeri Foto</TabsTrigger> {/* MENU BARU DITAMBAHKAN DI SINI */}
            <TabsTrigger value="beranda" data-testid="admin-tab-beranda">Beranda & Tentang</TabsTrigger>
            <TabsTrigger value="jadwal" data-testid="admin-tab-jadwal">Jadwal</TabsTrigger>
            <TabsTrigger value="komisi" data-testid="admin-tab-komisi">Komisi</TabsTrigger>
            <TabsTrigger value="pengaturan" data-testid="admin-tab-pengaturan">Pengaturan</TabsTrigger>
          </TabsList>
          <TabsContent value="ringkasan" className="mt-6"><StatsTab /></TabsContent>
          <TabsContent value="doa" className="mt-6"><PrayersTab /></TabsContent>
          <TabsContent value="aspirasi" className="mt-6"><FeedbackTab /></TabsContent>
          <TabsContent value="warta" className="mt-6"><WartaTab /></TabsContent>
          <TabsContent value="formulir" className="mt-6"><FormulirTab /></TabsContent>
          <TabsContent value="renungan" className="mt-6"><RenunganTab /></TabsContent>
          <TabsContent value="galeri" className="mt-6"><GalleryTab /></TabsContent> {/* TAB BARU DIRENDER DI SINI */}
          <TabsContent value="beranda" className="mt-6"><SiteContentTab /></TabsContent>
          <TabsContent value="jadwal" className="mt-6"><JadwalTab /></TabsContent>
          <TabsContent value="komisi" className="mt-6"><KomisiTab /></TabsContent>
          <TabsContent value="pengaturan" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}