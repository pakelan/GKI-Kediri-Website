export const CHURCH = {
  name: "GKI Kediri",
  fullName: "Gereja Kristen Indonesia Kediri",
  tagline: "Bertumbuh dalam iman, berjalan bersama",
  address: "Jalan Yos Sudarso 31, Kediri",
  email: "mmgkikediri@gmail.com",
  phone: "0852-3535-3637",
  instagram: "https://www.instagram.com/gkikediri/",
  youtube: "https://www.youtube.com/channel/UCsEHrioFb_5LnzjdphttcwA",
  officeHours: "Selasa – Sabtu, 08.00 – 16.00 WIB",
};

export interface ScheduleItem {
  day: string;
  name: string;
  time: string;
  place: string;
  note: string;
  tag: "minggu" | "muda" | "komisi";
}

export const SCHEDULES: ScheduleItem[] = [
  { day: "Minggu", name: "Ibadah Raya 1", time: "06.00 WIB", place: "Gedung Utama", note: "Ibadah pagi dengan liturgi Kidung Jemaat", tag: "minggu" },
  { day: "Minggu", name: "Ibadah Raya 2", time: "08.30 WIB", place: "Gedung Utama", note: "Ibadah keluarga — Sekolah Minggu tersedia", tag: "minggu" },
  { day: "Minggu", name: "Sekolah Minggu", time: "08.30 WIB", place: "Ruang Anak", note: "Ibadah anak penuh lagu & cerita Alkitab", tag: "muda" },
  { day: "Minggu", name: "Ibadah Remaja", time: "10.30 WIB", place: "Ruang Youth", note: "Kebaktian remaja yang seru dan relevan", tag: "muda" },
  { day: "Jumat", name: "Ibadah Pemuda", time: "18.30 WIB", place: "Ruang Youth", note: "Youth service — pujian, firman, komunitas", tag: "muda" },
  { day: "Rabu", name: "Persekutuan Doa", time: "18.00 WIB", place: "Gedung Utama", note: "Berdoa bagi jemaat, kota, dan bangsa", tag: "komisi" },
  { day: "Selasa", name: "Persekutuan Wanita", time: "17.00 WIB", place: "Ruang Serbaguna", note: "Persekutuan Komisi Wanita", tag: "komisi" },
  { day: "Sabtu", name: "Persekutuan Usia Indah", time: "16.00 WIB", place: "Ruang Serbaguna", note: "Fellowship oma & opa yang hangat", tag: "komisi" },
];

export interface Commission {
  name: string;
  alias: string;
  desc: string;
  schedule: string;
}

export const COMMISSIONS: Commission[] = [
  { name: "Komisi Anak", alias: "Sekolah Minggu", desc: "Melayani anak-anak bertumbuh mengenal Tuhan lewat lagu, permainan, dan cerita Alkitab.", schedule: "Minggu, 08.30 WIB" },
  { name: "Komisi Pemuda & Remaja", alias: "Youth Service", desc: "", schedule: "Minggu, 10.30 WIB" },
  { name: "Komisi Dewasa", alias: "Persekutuan Dewasa", desc: "Wadah kaum Dewasa saling menguatkan dalam iman, keluarga, dan pelayanan.", schedule: "Selasa, 17.00 WIB" },
  { name: "Komisi Musik", alias: "Pujian & Penyembahan", desc: "Worship leader, singer, pemusik, dan tim multimedia yang melayani setiap ibadah.", schedule: "Latihan sesuai jadwal ibadah" },
  { name: "Komisi Diakonia", alias: "Kasih & Peduli", desc: "Menjangkau jemaat dan masyarakat yang membutuhkan lewat aksi kasih nyata.", schedule: "Sepanjang tahun" },
];

export const MARQUEE_ITEMS = [
  "Syaloom — selamat datang di GKI Kediri",
  "Kebaktian Umum Pkl. 06.00, 08.30, 17.30 WIB",
  "Sampaikan pokok doamu — kami berdoa untukmu",
  "Warta Jemaat terbit setiap minggu",
];

export const PRAYER_CATEGORIES = ["Kesehatan", "Keluarga", "Pekerjaan & Studi", "Pergumulan Pribadi", "Ucapan Syukur", "Lainnya"];

export const FEEDBACK_CATEGORIES = ["Ibadah", "Pelayanan", "Fasilitas", "Komunikasi", "Saran Program", "Lainnya"];

export const FORM_CATEGORIES = ["Administrasi", "Baptisan & Sidi", "Pemberkatan Nikah", "Lainnya"];

export const IMAGES = {
  heroWorship:
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaHVyY2glMjB3b3JzaGlwJTIwY29tbXVuaXR5fGVufDB8fHx8MTc5MDc0NzMzOXww&ixlib=rb-4.1.0&q=85",
  youthFellowship: "/gambar-komunitas.jpg",
  musicMinistry:
    "https://images.unsplash.com/photo-1524650359799-842906ca1c06?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHw0fHxhY291c3RpYyUyMHdvcnNoaXAlMjBtdXNpYyUyMHNpbmdlcnxlbnwwfHx8fDE3OTA3NDczMzl8MA&ixlib=rb-4.1.0&q=85",
  communityLife: "/gambar-komunitas.jpg",
};
