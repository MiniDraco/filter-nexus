"""Inject the app-name aliases from filters.db into index.html (between /* @aliases-begin */ and
/* @aliases-end */) so the library search finds filters by any app's name for them.
Run after build_db.py: python -I gen_aliases.py
"""
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).parent.parent
db = sqlite3.connect(ROOT / "filters.db")
rows = db.execute("""SELECT f.engine_id, a.app, a.name FROM alias a JOIN filter f ON f.id = a.filter_id
                      WHERE f.status = 'implemented' AND a.app != 'Filter Nexus' ORDER BY f.engine_id, a.app, a.name""").fetchall()
amap = {}
for eid, app, name in rows:
    entry = f"{app} › {name}"
    if entry not in amap.setdefault(eid, []):
        amap[eid].append(entry)
names_covered = db.execute("""SELECT COUNT(*) FROM alias a JOIN filter f ON f.id = a.filter_id
                               WHERE f.status = 'implemented' AND a.app != 'Filter Nexus'""").fetchone()[0]
block = f"const ALIASES = {json.dumps(amap, ensure_ascii=False, separators=(',', ':'))};\nconst NAMES_COVERED = {names_covered};"
idx = ROOT / "index.html"
src = idx.read_text(encoding="utf-8")
src, n = re.subn(r"/\* @aliases-begin \*/.*?/\* @aliases-end \*/", lambda m: "/* @aliases-begin */\n" + block + "\n/* @aliases-end */", src, flags=re.S)
assert n == 1, "alias markers not found"
idx.write_text(src, encoding="utf-8")
print(f"aliases injected for {len(amap)} filters, {names_covered} app names")
