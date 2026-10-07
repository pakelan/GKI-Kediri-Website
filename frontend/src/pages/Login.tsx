import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function formatError(e: unknown): string {
  if (e instanceof ApiError) {
    const d = (e.body as { detail?: unknown } | null)?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg ?? "").filter(Boolean).join(" ");
  }
  return "Terjadi kesalahan. Coba lagi.";
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (e) {
      setError(formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#FAF7F2] lg:grid-cols-2" data-testid="login-page">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#231710] p-12 text-[#FBF8F4] lg:flex">
        <div className="grain-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
        <Link to="/" aria-label="Kembali ke beranda" data-testid="login-home-link">
          <Logo light />
        </Link>
        <div className="relative">
          <p className="font-heading text-3xl font-bold italic leading-snug text-[#EADECF] sm:text-4xl">
            “Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.”
          </p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-[#9EC49E]">Filipi 4 : 13</p>
        </div>
        <p className="relative text-xs text-[#CBB8A9]">Konsol khusus Majelis & Admin GKI Kediri</p>
      </div>
      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6E5E53] transition-colors hover:text-[#2B1E16]" data-testid="login-back-link">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </Link>
          <div className="rounded-[2rem] border border-[#2B1E16]/8 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5EDE5]">
              <KeyRound className="h-5 w-5 text-[#385338]" />
            </div>
            <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-[#2B1E16]" data-testid="login-title">Masuk Konsol Admin</h1>
            <p className="mt-2 text-sm text-[#6E5E53]">Kelola warta, formulir, pokok doa, dan aspirasi jemaat.</p>
            <form onSubmit={submit} className="mt-7 space-y-5" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" required autoComplete="email" placeholder="admin@gkikediri.or.id" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Kata Sandi</Label>
                <Input id="login-password" type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password-input" />
              </div>
              {error && (
                <p className="rounded-xl bg-[#9E2A2B]/10 px-4 py-3 text-sm font-medium text-[#9E2A2B]" data-testid="login-error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-[#385338] py-6 text-[#FAF7F2] hover:bg-[#4D6B4D]" data-testid="login-submit-btn">
                {loading ? "Memeriksa..." : "Masuk"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
