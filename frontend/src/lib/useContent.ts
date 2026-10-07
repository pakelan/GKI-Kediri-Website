import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { COMMISSIONS, SCHEDULES } from "@/lib/content";
import type { JadwalItem, KomisiItem, SiteContent } from "@/lib/types";

export const CONTENT_DEFAULTS: SiteContent = {
  hero_overline: "Syaloom — Gereja Kristen Indonesia Kediri",
  hero_line1: "Bertumbuh dalam",
  hero_line2: "iman, berjalan",
  hero_line3: "bersama.",
  hero_description:
    "GKI Kediri adalah rumah bagi setiap generasi — tempat kamu dikenal, dikasihi, dan bertumbuh. Datang sebagaimana adanya kamu; pulang dengan hati yang penuh.",
  hero_image_path: "",
  about_heading: "Gereja yang tua usianya, muda semangatnya",
  about_story:
    "Gereja Kristen Indonesia (GKI) lahir dari semangat kesatuan gereja-gereja di Indonesia. GKI Kediri hadir di tengah kota Kediri sebagai rumah rohani bagi ratusan keluarga — dari kakek-nenek hingga generasi muda.\n\nDari ibadah raya yang khidmat hingga youth service yang penuh energi, kami percaya setiap generasi punya tempat dan peran dalam tubuh Kristus.",
  about_image_path: "",
  visi: "Menjadi gereja yang bertumbuh dalam iman, mengasihi tanpa syarat, dan menjadi terang bagi kota Kediri.",
  misi: "Menghadirkan ibadah yang hidup dan relevan bagi semua generasi.\nMembangun persekutuan yang hangat melalui komisi dan kelompok kecil.\nMelayani masyarakat lewat diakonia dan kesaksian nyata.",
  worship_times: "Minggu Pagi | 06.00 WIB\nMinggu Siang | 08.30 WIB\nIbadah Pemuda (Jumat) | 18.30 WIB",
  announcement_enabled: false,
  announcement_text: "",
  announcement_link: "",
};

export function useContent(): SiteContent {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => apiGet<SiteContent>("/content"),
    staleTime: 5 * 60 * 1000,
  });
  return { ...CONTENT_DEFAULTS, ...(data ?? {}) };
}

export function useJadwal(): JadwalItem[] {
  const { data } = useQuery({
    queryKey: ["jadwal"],
    queryFn: () => apiGet<JadwalItem[]>("/jadwal"),
    staleTime: 5 * 60 * 1000,
  });
  if (!data || data.length === 0) {
    return SCHEDULES.map((s, i) => ({ id: `static-${i}`, ...s }));
  }
  return data;
}

export function useKomisi(): KomisiItem[] {
  const { data } = useQuery({
    queryKey: ["komisi"],
    queryFn: () => apiGet<KomisiItem[]>("/komisi"),
    staleTime: 5 * 60 * 1000,
  });
  if (!data || data.length === 0) {
    return COMMISSIONS.map((c, i) => ({ id: `static-${i}`, image_path: "", ...c }));
  }
  return data;
}

export function parseWorshipTimes(text: string): { label: string; time: string }[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, ...rest] = l.split("|");
      return { label: label.trim(), time: rest.join("|").trim() };
    });
}
