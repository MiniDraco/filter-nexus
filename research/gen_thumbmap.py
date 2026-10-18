"""Inject thumbs/index.json (written by window.__nexusBake via research/thumbserve.py) into index.html's THUMB_MAP.
Filters added after the bake simply render live when scrolled into view until the next bake."""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = json.loads((root / "thumbs" / "index.json").read_text(encoding="utf-8"))
p = root / "index.html"; s = p.read_text(encoding="utf-8")
m = {"v": idx["v"], "ids": idx["ids"], "broken": idx.get("broken", [])}
new, n = re.subn(r"/\*THUMBMAP\*/.*?/\*/THUMBMAP\*/", lambda _: "/*THUMBMAP*/const THUMB_MAP = " + json.dumps(m, separators=(",", ":")) + ";/*/THUMBMAP*/", s, flags=re.S)
assert n == 1, "THUMBMAP marker not found"
p.write_text(new, encoding="utf-8", newline="")
sheets = sorted((root / "thumbs").glob("s*.webp"))
print(f"thumb map: {len(m['ids'])} ids, {len(m['broken'])} broken, {len(sheets)} sheets, {sum(f.stat().st_size for f in sheets) / 1e6:.1f} MB")
