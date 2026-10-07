export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Prayer {
  id: string;
  name: string;
  category: string;
  request: string;
  is_anonymous: boolean;
  show_public: boolean;
  status: string;
  created_at: string;
}

export interface PublicPrayer {
  id: string;
  name: string;
  category: string;
  request: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  name: string;
  contact: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Warta {
  id: string;
  title: string;
  issue_date: string;
  url: string;
  file_path: string;
  created_at: string;
}

export interface FormItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  file_path: string;
  created_at: string;
}

export interface Renungan {
  id: string;
  title: string;
  passage: string;
  body: string;
  published_date: string;
  cover_path: string;
  created_at: string;
}

export interface SiteSettings {
  phone: string;
  address: string;
  email: string;
  instagram: string;
  youtube: string;
  office_hours: string;
}

export interface SiteContent {
  hero_overline: string;
  hero_line1: string;
  hero_line2: string;
  hero_line3: string;
  hero_description: string;
  hero_image_path: string;
  about_heading: string;
  about_story: string;
  about_image_path: string;
  visi: string;
  misi: string;
  worship_times: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_link: string;
}

export interface JadwalItem {
  id: string;
  day: string;
  name: string;
  time: string;
  place: string;
  note: string;
  tag: string;
}

export interface KomisiItem {
  id: string;
  name: string;
  alias: string;
  desc: string;
  schedule: string;
  image_path: string;
}

export interface Sermon {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

export interface Song {
  id: string;
  book: string;
  number: number;
  title: string;
  url: string;
}

export interface Stats {
  pokok_doa_baru: number;
  pokok_doa_total: number;
  kritik_saran: number;
  warta: number;
  formulir: number;
  renungan: number;
}
