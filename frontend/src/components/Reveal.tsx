import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ overline, title, description }: { overline: string; title: string; description?: string }) {
  return (
    <section className="border-b border-[#2B1E16]/10 bg-[#F3EDE4]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#5B7C5B]" data-testid="page-header-overline">{overline}</p>
          <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight text-[#2B1E16] sm:text-4xl lg:text-5xl" data-testid="page-header-title">
            {title}
          </h1>
          {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6E5E53]" data-testid="page-header-description">{description}</p>}
        </Reveal>
      </div>
    </section>
  );
}
