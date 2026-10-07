import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { useContent } from "@/lib/useContent";

export function AnnouncementBar() {
  const content = useContent();
  const [dismissed, setDismissed] = useState(false);

  if (!content.announcement_enabled || !content.announcement_text.trim() || dismissed) return null;

  return (
    <div className="relative z-[60] bg-[#B85C38] text-white" data-testid="announcement-bar">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-center sm:px-6 lg:px-8">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium" data-testid="announcement-text">{content.announcement_text}</p>
        {content.announcement_link && (
          <a
            href={content.announcement_link}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 rounded-full border border-white/40 px-3 py-0.5 text-xs font-semibold transition-colors hover:bg-white/10 sm:inline"
            data-testid="announcement-link"
          >
            Selengkapnya
          </a>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Tutup pengumuman"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/15"
          data-testid="announcement-close-btn"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
