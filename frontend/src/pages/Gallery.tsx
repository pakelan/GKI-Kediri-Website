// === KOMPONEN BARU: GALLERY TAB ===
function GalleryTab() {
  const queryClient = useQueryClient();
  const emptyForm = { title: "", description: "", category: "Umum", image_url: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Mengambil daftar foto dari backend
  const { data: items = [] } = useQuery({ queryKey: ["admin-gallery"], queryFn: () => apiGet<any[]>("/gallery") });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
    queryClient.invalidateQueries({ queryKey: ["gallery"] }); // Refresh halaman galeri publik
  };
  
  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Tidak perlu lagi proses upload file fisik, langsung kirim teks link-nya
      const payload = { 
        title: form.title, 
        description: form.description, 
        category: form.category, 
        image_url: form.image_url 
      };
      return editId ? apiPut(`/admin/gallery/${editId}`, payload) : apiPost("/admin/gallery", payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Foto diperbarui" : "Foto ditambahkan");
      resetForm();
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menyimpan foto. Periksa isian link."),
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
  };

  const CATEGORIES = ["Umum", "Ibadah Minggu", "Perayaan Hari Besar", "Sekolah Minggu", "Pemuda & Remaja", "Keluarga & Komisi"];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.image_url) {
            toast.error("Silakan isi link Google Drive terlebih dahulu.");
            return;
          }
          saveMutation.mutate();
        }}
        className="space-y-4 rounded-3xl border border-[#2B1E16]/8 bg-white p-6 lg:col-span-2"
      >
        <h3 className="font-heading text-lg font-bold text-[#2B1E16]">{editId ? "Ubah Data Foto" : "Upload Foto Baru"}</h3>
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
        
        {/* BAGIAN INI YANG DIUBAH DARI INPUT FILE MENJADI INPUT TEKS (LINK) */}
        <div className="space-y-2">
          <Label htmlFor="gal-url">Tautan (Link) Foto Google Drive</Label>
          <Input 
            id="gal-url" 
            type="url" 
            required 
            placeholder="https://drive.google.com/file/d/..." 
            value={form.image_url} 
            onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
          />
          <p className="text-xs text-[#6E5E53]">Pastikan akses foto di Google Drive sudah diatur ke "Siapa saja yang memiliki tautan" (Anyone with the link).</p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending} className="flex-1 rounded-full bg-[#385338] text-white hover:bg-[#4D6B4D]">
            <Plus className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Foto"}
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
            {/* Foto tetap akan dirender otomatis */}
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
