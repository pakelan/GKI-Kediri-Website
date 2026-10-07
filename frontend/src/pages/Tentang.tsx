import { BookOpen, Church, Compass, HeartHandshake, Users } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { IMAGES } from "@/lib/content";
import { useContent } from "@/lib/useContent";

const VALUES = [
  { icon: Church, title: "Alkitabiah", desc: "Firman Tuhan sebagai satu-satunya dasar iman dan kehidupan." },
  { icon: HeartHandshake, title: "Mengasihi", desc: "Setiap orang diterima dan dikasihi sebagaimana adanya." },
  { icon: Users, title: "Bersekutu", desc: "Tidak ada yang berjalan sendiri — kita keluarga." },
  { icon: Compass, title: "Melayani", desc: "Dipanggil menjadi berkat bagi kota Kediri dan sekitarnya." },
];

export default function Tentang() {
  const content = useContent();
  return (
    <div data-testid="tentang-page">
      <PageHeader
        overline="Tentang Kami"
        title="Satu keluarga, satu iman, satu kota yang kami kasihi"
        description="Mengenal lebih dekat GKI Kediri — sejarah, visi, dan nilai-nilai yang menghidupkan jemaat kami."
      />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <img src={content.about_image_path ? `/api/files/${content.about_image_path}` : IMAGES.youthFellowship} alt="Jemaat muda GKI Kediri" className="aspect-[4/3] w-full rounded-[2rem] object-cover" data-testid="tentang-image" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">Cerita Kami</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#2B1E16] sm:text-3xl">{content.about_heading}</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#6E5E53]">
            {content.about_story.split("\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-[#231710] text-[#FBF8F4]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="rounded-3xl border border-[#FBF8F4]/10 bg-[#2B1E16] p-8 sm:p-10">
              <BookOpen className="h-8 w-8 text-[#9EC49E]" />
              <h3 className="mt-5 font-heading text-2xl font-bold">Visi</h3>
              <p className="mt-3 text-base leading-relaxed text-[#CBB8A9]">{content.visi}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-[#FBF8F4]/10 bg-[#2B1E16] p-8 sm:p-10">
              <HeartHandshake className="h-8 w-8 text-[#9EC49E]" />
              <h3 className="mt-5 font-heading text-2xl font-bold">Misi</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-[#CBB8A9]">
                {content.misi.split("\n").filter(Boolean).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">Nilai Kami</p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-[#2B1E16] sm:text-3xl">Empat pilar yang kami pegang</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-[#2B1E16]/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" data-testid={`tentang-value-${v.title.toLowerCase()}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5EDE5]">
                  <v.icon className="h-5 w-5 text-[#385338]" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-[#2B1E16]">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6E5E53]">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
