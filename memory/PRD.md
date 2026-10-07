# PRD — Website GKI Kediri

## Problem Statement (asli)
Website untuk GKI Kediri, terinspirasi gkiharapanindah.org namun tidak serupa; warna dominan coklat & sage green; tampilan lebih muda. Fitur wajib: Pokok Doa (jemaat mengisi), Kritik & Saran (aspirasi), Formulir unduhan, Pujian (konten mengacu GKI Harapan Indah — isinya sama dengan GKI Kediri), Warta Jemaat berupa link unduhan yang diisi admin.

## Arsitektur
- Backend: FastAPI + motor (MongoDB) di `backend/server.py`; semua rute di bawah `/api`; auth JWT via httpOnly cookie (access 30m + refresh 7d), bcrypt, lockout brute-force 5x/15 menit.
- Koleksi MongoDB: users, login_attempts, pokok_doa, kritik_saran, warta, formulir, songs.
- Frontend: Vite + React 19 + TS, Tailwind v4, shadcn/base-ui, motion (framer), lenis smooth scroll. Palet: coklat #2B1E16/#231710/#EADECF + sage #5B7C5B/#E5EDE5. Font: Lora Variable (heading), Plus Jakarta Sans (body), JetBrains Mono (label).
- Logo: mark SVG salib + tunas sage (juga favicon).

## Persona
- Jemaat umum: melihat jadwal, mengisi pokok doa/aspirasi, mengunduh formulir, warta, membuka lirik lagu.
- Admin/Majelis: login, mengelola warta & formulir (tambah link unduhan), menambah lagu kustom, memantau pokok doa & aspirasi.

## Yang Sudah Diimplementasikan (30 Sep 2026)
- 12 halaman: Beranda (hero kinetic line-reveal + parallax + marquee), Tentang, Jadwal (bento + filter), Pelayanan (8 komisi), Pokok Doa (form + dinding doa publik, opsi anonim), Kritik & Saran, Formulir (cari + filter kategori), Pujian (1016 lagu KJ 478/NKB 230/PKJ 308 di-scrape dari gkiharapanindah.org, pencarian + tab buku), Warta Jemaat (daftar unduhan), Kontak, Login, Admin (tabs: ringkasan, pokok doa, aspirasi, warta, formulir, pujian).
- Seed otomatis: admin dari .env, lagu dari backend/data/songs.json, contoh warta & formulir (link placeholder drive).
- Verifikasi: curl semua endpoint (login 401/200, me, stats, pokok doa POST+public, kritik POST, warta/formulir list, pencarian lagu), yarn typecheck lolos, screenshot e2e: home, submit pokok doa, pencarian lagu, login admin, tambah warta → tampil publik.

## Kredensial
Lihat /app/memory/test_credentials.md — admin@gkikediri.org / GKIKediri#2026 (uji).

## Catatan Data
- Link warta & formulir contoh masih placeholder (https://drive.google.com/) — admin mengganti via dashboard (bisa juga langsung unggah PDF).

## Backlog Prioritas
- P0: Ganti kredensial admin default; hapus warta & formulir contoh dan ganti dengan yang asli.
- P1: Edit (bukan hanya tambah/hapus) untuk warta/formulir/renungan; peta Google Maps tersemat di halaman Kontak; gambar sampul renungan.
- P2: Lirik lagu di dalam situs; arsip khotbah video (embed YouTube); mode gelap.

## Update 30 Sep 2026 (iterasi 2)
- Data asli terpasang: WA 0852-3535-3637, alamat Jalan Yos Sudarso 31 Kediri, email mmgkikediri@gmail.com, IG @gkikediri, YouTube resmi — tersimpan di koleksi `settings`, bisa diubah admin lewat tab Pengaturan.
- Logo resmi GKI (arsip Wikipedia) dipakai di navbar, footer, favicon (/logo-gki.png).
- Notifikasi email otomatis ke mmgkikediri@gmail.com setiap pokok doa / kritik-saran baru (Emergent managed Resend, lib/emailer.py, fire-and-forget + guardrail gate). Terverifikasi 202 Accepted di log.
- Unggah file langsung: admin upload PDF/PNG/JPG maks 10 MB (POST /api/admin/upload, Emergent object storage); jemaat unduh via GET /api/files/{path}. Warta & formulir mendukung file ATAU link.
- Renungan Mingguan: admin menulis judul/ayat/isi/tanggal; publik membaca di /renungan dan /renungan/:id. Satu renungan contoh sudah terbit.
- Verifikasi: typecheck lolos; curl settings/upload/download/renungan/email OK; screenshot Kontak (data asli), Renungan, tab admin Renungan & Pengaturan.

## Update 30 Sep 2026 (iterasi 3)
- Fitur Pujian DIHAPUS atas permintaan pengguna: halaman /pujian, tautan navigasi/footer, tab admin Pujian, endpoint /api/songs, seed lagu, dan koleksi MongoDB songs (1016 dokumen) di-drop.
- Edit konten: endpoint PUT /api/admin/warta|formulir|renungan/{id}; setiap baris dashboard punya tombol Ubah (ikon pensil) yang mengisi formulir + tombol Batal; berkas lama tetap dipakai bila tidak unggah baru.
- Peta interaktif: iframe Google Maps (query alamat dari settings) tersemat di halaman Kontak.
- Sampul renungan: field cover_path; admin unggah JPG/PNG di tab Renungan; tampil di kartu daftar & halaman detail.
- Arsip Khotbah: GET /api/khotbah mengambil RSS kanal YouTube GKI Kediri (channel UCsEHrioFb_5LnzjdphttcwA, cache 30 menit); halaman /khotbah dengan pemutar embed youtube-nocookie + grid 12 video terbaru. Terverifikasi menampilkan video asli kanal.
- Statistik admin: kartu "Koleksi Lagu" diganti "Renungan Terbit".
- Verifikasi: typecheck lolos; curl khotbah (12 video asli), PUT warta OK, stats OK; screenshot Khotbah (pemutar jalan), Kontak (peta termuat), alur Ubah warta di admin.

## Backlog Prioritas (diperbarui)

## Update 30 Sep 2026 (iterasi 4)
- Semua konten utama kini bisa diedit admin tanpa sentuh kode, lewat dua tab baru di dashboard:
  - Tab "Beranda & Tentang": kata awalan hero (overline, 3 baris judul, deskripsi), foto utama beranda (unggah JPG/PNG), judul & isi "Cerita Kami" + fotonya, Visi & Misi (misi: satu poin per baris), dan jam Ibadah Raya di footer (format "Nama | Jam" per baris).
  - Tab "Jadwal": CRUD penuh jadwal ibadah (hari, nama, jam, tempat, keterangan, kelompok) — tampil di halaman Jadwal dan bento beranda.
- Backend: model SiteContent (koleksi content, singleton "site") + koleksi jadwal; GET /api/content & /api/jadwal publik, PUT/POST/DELETE admin. Seed default saat kosong.
- Frontend: hooks useContent/useJadwal dengan fallback ke konten bawaan bila API gagal.
- Verifikasi: typecheck lolos; curl GET/PUT content (simpan & kembalikan), CRUD jadwal (tambah Komsel, ubah jam, hapus); screenshot tab Beranda & Tentang + tab Jadwal di admin, beranda & visi-misi tampil normal.
- P0: Ganti kredensial admin default; ganti warta & formulir contoh dengan yang asli.
- P1: Galeri foto kegiatan; notifikasi email opsional saat renungan baru terbit.
- P2: Mode gelap; arsip warta per tahun.
## Update 30 Sep 2026 (iterasi 5)
- Foto asli terpasang: hero beranda & foto Cerita Kami kini memakai foto asli dari materi kanal YouTube GKI Kediri (crop still ibadah: tangan berdoa di atas Alkitab untuk hero; salib di puncak gunung untuk Tentang). Admin bisa menggantinya kapan saja lewat tab Beranda & Tentang.
- Komisi bisa diedit: koleksi `komisi` + CRUD /api/admin/komisi; tab "Komisi" di dashboard (nama, panggilan, deskripsi, jadwal, foto opsional); halaman Pelayanan membaca data dinamis dengan fallback statis.
- Pengumuman Kilat: field announcement_* di SiteContent; bilah terakota di atas semua halaman dengan tombol tutup & tautan "Selengkapnya"; dinyalakan/dimatikan dari tab Beranda & Tentang. Diuji tampil, lalu dimatikan kembali.
- Pratinjau Langsung: tab Beranda & Tentang menampilkan pratinjau hero (teks + foto) yang berubah otomatis saat admin mengetik, sebelum disimpan.
- Verifikasi: typecheck lolos; curl komisi (8 komisi), content paths; screenshot hero foto asli, bilah pengumuman aktif, tab Komisi, pratinjau langsung berubah saat mengetik.

## Backlog Prioritas (diperbarui)
- P0: Ganti kredensial admin default; ganti warta & formulir contoh dengan yang asli.
- P1: Galeri foto kegiatan; kirim file logo resmi GKI Kediri versi gereja (logo bulat "Yos Sudarso 31") untuk dipasang menggantikan logo sinode.
- P2: Mode gelap; arsip warta per tahun.
