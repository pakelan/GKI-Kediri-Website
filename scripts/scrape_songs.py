"""Scrape KJ/NKB/PKJ song lists from gkiharapanindah.org into backend/data/songs.json."""
import json
import re
from pathlib import Path

import requests

BOOKS = {
    "KJ": "https://www.gkiharapanindah.org/download/rekap-kidung-jemaat/",
    "NKB": "https://www.gkiharapanindah.org/download/rekap-nyanyikanlah-kidung-baru/",
    "PKJ": "https://www.gkiharapanindah.org/download/rekap-pelengkap-kidung-jemaat/",
}

songs: list[dict] = []
seen: set[str] = set()
for book, page_url in BOOKS.items():
    html = requests.get(page_url, timeout=60, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", "Accept": "text/html"}).text
    for href, label in re.findall(
        r'href="(https://www\.gkiharapanindah\.org/nyanyian-jemaat/[^"]+)"[^>]*>([^<]+)</a>',
        html,
    ):
        label = label.strip()
        m = re.match(r"([A-Z]+)\s*0*(\d+)\s*[–,\-]\s*(.+)", label)
        if not m:
            continue
        b, num, title = m.group(1), int(m.group(2)), m.group(3).strip().strip('"')
        key = f"{b}-{num:03d}"
        if key in seen:
            continue
        seen.add(key)
        songs.append({"book": b, "number": num, "title": title, "url": href})

songs.sort(key=lambda s: (s["book"], s["number"]))
out = Path("/app/backend/data/songs.json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(songs, ensure_ascii=False, indent=1))
print(f"scraped {len(songs)} songs -> {out}")
from collections import Counter
print(Counter(s["book"] for s in songs))
