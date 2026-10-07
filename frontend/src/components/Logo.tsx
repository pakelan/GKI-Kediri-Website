export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo-gki.png"
      alt="Logo GKI"
      className={`${className} rounded-full border border-[#2B1E16]/10 bg-white object-contain p-0.5`}
    />
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className={`font-heading text-lg font-bold tracking-tight ${light ? "text-[#FBF8F4]" : "text-[#2B1E16]"}`}>
          GKI Kediri
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${light ? "text-[#CBB8A9]" : "text-[#5B7C5B]"}`}>
          Gereja Kristen Indonesia
        </span>
      </span>
    </span>
  );
}
