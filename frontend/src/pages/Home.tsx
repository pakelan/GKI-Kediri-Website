import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, CalendarDays, FileDown, HeartHandshake, MessageSquareHeart, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { IMAGES } from "@/lib/content";
import { useContent, useJadwal } from "@/lib/useContent";

const HERO_STATS = [
  { value: "3x", label: "Kebaktian Minggu" },
  { value: "10", label: "Komisi Pelayanan" },
  { value: "1", label: "Keluarga Besar" },
];

const LAYANAN_CARDS = [
  { to: "/pokok-doa", icon: HeartHandshake, title: "Pokok Doa", desc: "Sampaikan pergumulanmu — majelis dan jemaat berdoa untukmu.", bg: "bg-[#E5EDE5]", fg: "text-[#1E301E]" },
  { to: "/kritik-saran", icon: MessageSquareHeart, title: "Kritik & Saran", desc: "Suaramu berarti. Sampaikan aspirasi untuk gereja yang lebih baik.", bg: "bg-[#EADECF]", fg: "text-[#2B1E16]" },
  { to: "/formulir", icon: FileDown, title: "Formulir", desc: "Unduh formulir administrasi: baptisan, pernikahan, penatalayanan.", bg: "bg-[#F3EDE4]", fg: "text-[#2B1E16]" },
  { to: "/warta-jemaat", icon: Newspaper, title: "Warta Jemaat", desc: "Kabar mingguan jemaat — unduh dan baca di mana saja.", bg: "bg-[#E5EDE5]", fg: "text-[#1E301E]" },
];

function HeroLine({ text, index, accent }: { text: string; index: number; accent?: boolean }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className={`block ${accent ? "font-heading italic text-[#9EC49E]" : ""}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 + index * 0.13, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export default function Home() {
  const content = useContent();
  const jadwal = useJadwal();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div data-testid="home-page">
      <section ref={heroRef} className="relative overflow-hidden bg-[#231710] text-[#FBF8F4]">
        <div className="grain-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#5B7C5B]/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-32 lg:pt-28">
          <motion.div className="flex flex-col justify-center lg:col-span-7" style={{ y: textY }}>
            <motion.p
              className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[#9EC49E]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              data-testid="hero-overline"
            >
              {content.hero_overline}
            </motion.p>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl" data-testid="hero-title">
              {[content.hero_line1, content.hero_line2, content.hero_line3].map((line, i) => (
                <HeroLine key={line} text={line} index={i} accent={i === 2} />
              ))}
            </h1>
            <motion.p
              className="mt-6 max-w-xl text-base leading-relaxed text-[#CBB8A9] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              data-testid="hero-description"
            >
              {content.hero_description}
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
            >
              <Button render={<Link to="/jadwal" />} size="lg" className="rounded-full bg-[#5B7C5B] text-white hover:bg-[#4D6B4D]" data-testid="hero-cta-jadwal">
                <CalendarDays className="h-4 w-4" />
                Lihat Jadwal Ibadah
              </Button>
              <Button render={<Link to="/pokok-doa" />} size="lg" variant="outline" className="rounded-full border-[#FBF8F4]/25 bg-transparent text-[#FBF8F4] hover:bg-[#FBF8F4]/10 hover:text-[#FBF8F4]" data-testid="hero-cta-pokok-doa">
                Sampaikan Pokok Doa
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              className="mt-12 flex gap-10 border-t border-[#FBF8F4]/10 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.05 }}
            >
              {HERO_STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-3xl font-bold text-[#EADECF]">{s.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#CBB8A9]">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div className="relative lg:col-span-5" style={{ y: imageY }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 1.5 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src={content.hero_image_path ? `/api/files/${content.hero_image_path}` : IMAGES.heroWorship}
                alt="Suasana ibadah dan penyembahan jemaat"
                className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl"
                data-testid="hero-image"
              />
              <div className="absolute -bottom-5 -left-5 rounded-2xl bg-[#FAF7F2] p-5 shadow-xl sm:-left-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5B7C5B]">Minggu Ini</p>
                <p className="mt-1 font-heading text-lg font-bold text-[#2B1E16]">Kebaktian Umum 06.00, 08.30 & 17.00 WIB</p>
                <p className="text-xs text-[#6E5E53]">Gedung Ibadah GKI Kediri</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">Jadwal Mingguan</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#2B1E16] sm:text-3xl">Datang, ada tempat untukmu</h2>
            </div>
            <Link to="/jadwal" className="group flex items-center gap-1.5 text-sm font-semibold text-[#385338]" data-testid="home-all-schedule-link">
              Semua jadwal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-12">
          {jadwal.slice(0, 5).map((s, i) => (
            <Reveal key={s.name} delay={i * 0.08} className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5" : "md:col-span-4"}>
              <div
                className={`flex h-full flex-col justify-between rounded-3xl border border-[#2B1E16]/8 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  i === 0 ? "bg-[#2B1E16] text-[#FBF8F4]" : i % 2 ? "bg-[#E5EDE5] text-[#1E301E]" : "bg-[#F3EDE4] text-[#2B1E16]"
                }`}
                data-testid={`home-schedule-card-${i}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${i === 0 ? "bg-[#FBF8F4]/10 text-[#9EC49E]" : "bg-[#2B1E16]/8 text-[#5B7C5B]"}`}>
                    {s.day}
                  </span>
                  <span className={`font-mono text-xs ${i === 0 ? "text-[#CBB8A9]" : "text-[#6E5E53]"}`}>{s.place}</span>
                </div>
                <div className="mt-8">
                  <p className={`font-heading ${i === 0 ? "text-3xl" : "text-2xl"} font-bold tracking-tight`}>{s.name}</p>
                  <p className={`mt-1 text-sm ${i === 0 ? "text-[#CBB8A9]" : "text-[#6E5E53]"}`}>{s.note}</p>
                  <p className={`mt-4 font-heading text-xl font-semibold ${i === 0 ? "text-[#9EC49E]" : "text-[#385338]"}`}>{s.time}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#F3EDE4]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="relative">
              <img src={content.about_image_path ? `/api/files/${content.about_image_path}` : IMAGES.communityLife} alt="Persekutuan jemaat GKI Kediri" className="aspect-[4/3] w-full rounded-[2rem] object-cover" data-testid="home-community-image" />
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-[#5B7C5B] p-5 text-white shadow-xl sm:block">
                <p className="font-heading text-2xl font-bold">Sejak lama,</p>
                <p className="text-sm text-white/80">melayani kota Kediri</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">Sekilas Tentang Kami</p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#2B1E16] sm:text-3xl">
              {content.about_heading}
            </h2>
            {content.about_story.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className={i === 0 ? "mt-5 text-base leading-relaxed text-[#6E5E53]" : "mt-4 text-base leading-relaxed text-[#6E5E53]"}>
                {p}
              </p>
            ))}
            <Button render={<Link to="/tentang" />} className="mt-7 rounded-full bg-[#2B1E16] text-[#FAF7F2] hover:bg-[#382419]" data-testid="home-about-cta">
              Kenali kami lebih dekat
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">Untuk Jemaat</p>
          <h2 className="mt-3 max-w-2xl font-heading text-2xl font-semibold tracking-tight text-[#2B1E16] sm:text-3xl">
            Semua yang kamu butuhkan, satu klik saja
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LAYANAN_CARDS.map((c, i) => (
            <Reveal key={c.to} delay={i * 0.07} className={i === 0 ? "lg:row-span-1" : ""}>
              <Link
                to={c.to}
                className={`group flex h-full flex-col justify-between rounded-3xl border border-[#2B1E16]/8 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.bg} ${c.fg}`}
                data-testid={`home-service-card-${c.title.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <c.icon className="h-8 w-8 text-[#5B7C5B]" />
                <div className="mt-10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-xl font-bold tracking-tight">{c.title}</h3>
                    <ArrowRight className="h-4 w-4 text-[#5B7C5B] transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed opacity-75">{c.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.35}>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-[#231710] p-7 text-[#FBF8F4]">
              <p className="font-heading text-xl italic leading-snug text-[#EADECF]">
                “Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu... rancangan damai sejahtera.”
              </p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-[#9EC49E]">Yeremia 29 : 11</p>
            </div>
          </Reveal>
        </div>
      </section>

<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] bg-[#F3EDE4] shadow-sm lg:flex">
            {/* Bagian Teks Rekening */}
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:w-1/2 lg:p-16">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">
                Persembahan
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#2B1E16] sm:text-4xl">
                Rekening Gereja
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#6E5E53]">
                Bagi jemaat yang ingin memberikan: Persembahan Minggu, Bulanan, Syukur, Perpuluhan atau Persembahan Janji Iman/Pembangunan dan Persembahan Misi dapat memberikannya melalui rekening BCA dengan nomor rekening:
              </p>
              <div className="mt-8 rounded-2xl border border-[#2B1E16]/10 bg-[#FAF7F2] p-6 shadow-sm">
                <p className="text-sm font-semibold text-[#6E5E53]">Bank BCA</p>
                <p className="mt-1 font-heading text-3xl font-bold tracking-wider text-[#2B1E16]">
                  033-338-9999
                </p>
                <p className="mt-1 text-sm font-medium text-[#2B1E16]">
                  a.n Gereja Kristen Indonesia
                </p>
              </div>
              <p className="mt-8 font-heading text-lg italic text-[#385338]">
                Terima kasih. Tuhan memberkati.
              </p>
            </div>
            
            {/* Bagian Gambar QRIS */}
            <div className="relative flex items-center justify-center bg-[#E5EDE5] p-8 sm:p-12 lg:w-1/2">
              <div className="grain-overlay absolute inset-0 opacity-50" aria-hidden="true" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="mb-6 font-heading text-xl font-semibold text-[#1E301E]">
                  Atau melalui QRIS
                </p>
                <img
                  src="/PERSEMBAHAN (9 x 11 cm) 1.jpg"
                  alt="QRIS Persembahan GKI Kediri"
                  className="w-full max-w-[280px] rounded-2xl border-4 border-white shadow-xl transition-transform hover:scale-105"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-[#385338] text-white">
        <div className="grain-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 sm:py-24 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#D5E3D5]">Kami Peduli</p>
            <h2 className="mt-3 max-w-xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Sedang bergumul? Kamu tidak sendiri. Biarkan kami berdoa bersamamu.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Button render={<Link to="/pokok-doa" />} size="lg" className="rounded-full bg-[#FAF7F2] text-[#2B1E16] hover:bg-[#EADECF]" data-testid="home-bottom-cta-pokok-doa">
              Isi Pokok Doa
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
