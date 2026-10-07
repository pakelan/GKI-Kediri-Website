import { Sparkle } from "lucide-react";
import { MARQUEE_ITEMS } from "@/lib/content";

export function Marquee() {
  return (
    <div className="marquee-mask overflow-hidden border-y border-[#EADECF]/10 bg-[#231710] py-3.5" data-testid="editorial-marquee">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {MARQUEE_ITEMS.map((item) => (
              <span key={`${dup}-${item}`} className="flex items-center gap-7 pr-7 font-mono text-[11px] uppercase tracking-[0.28em] text-[#EADECF]">
                {item}
                <Sparkle className="h-3 w-3 shrink-0 text-[#5B7C5B]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
