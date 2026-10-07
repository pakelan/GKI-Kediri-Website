import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { apiGet, ApiError } from "@/lib/api";
import type { Renungan } from "@/lib/types";

export default function RenunganDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: r, isError, isLoading } = useQuery({
    queryKey: ["renungan", id],
    queryFn: () => apiGet<Renungan>(`/renungan/${id}`),
    enabled: !!id,
  });

  const notFound = isError || (!isLoading && !r);

  return (
    <div data-testid="renungan-detail-page">
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link to="/renungan" className="inline-flex items-center gap-2 text-sm font-medium text-[#6E5E53] transition-colors hover:text-[#2B1E16]" data-testid="renungan-back-link">
          <ArrowLeft className="h-4 w-4" />
          Semua renungan
        </Link>
        {isLoading ? (
          <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#6E5E53]">Memuat renungan...</p>
        ) : notFound ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-[#2B1E16]/15 bg-[#F3EDE4] p-14 text-center" data-testid="renungan-not-found">
            <BookOpen className="mx-auto h-10 w-10 text-[#5B7C5B]" />
            <p className="mt-4 font-heading text-lg font-bold text-[#2B1E16]">Renungan tidak ditemukan</p>
            {isError && (isError as unknown) instanceof ApiError && null}
          </div>
        ) : r ? (
          <Reveal>
            <article className="mt-8" data-testid="renungan-article">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]">
                {r.published_date
                  ? (() => {
                      const d = new Date(r.published_date);
                      return Number.isNaN(d.getTime()) ? r.published_date : format(d, "EEEE, d MMMM yyyy", { locale: idLocale });
                    })()
                  : "Renungan Mingguan"}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#2B1E16] sm:text-4xl">{r.title}</h1>
              {r.passage && (
                <p className="mt-4 inline-block rounded-full bg-[#E5EDE5] px-4 py-1.5 font-mono text-xs font-semibold text-[#385338]" data-testid="renungan-passage">
                  {r.passage}
                </p>
              )}
              {r.cover_path && (
                <img
                  src={`/api/files/${r.cover_path}`}
                  alt={`Sampul renungan ${r.title}`}
                  className="mt-8 aspect-[16/9] w-full rounded-[2rem] object-cover"
                  data-testid="renungan-cover"
                />
              )}
              <div className="mt-8 rounded-[2rem] border border-[#2B1E16]/8 bg-white p-7 sm:p-10">
                <p className="whitespace-pre-line text-base leading-loose text-[#2B1E16]/90 sm:text-lg">{r.body}</p>
              </div>
            </article>
          </Reveal>
        ) : null}
      </section>
    </div>
  );
}
