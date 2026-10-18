"""Splice a batch file into index.html before the DEPTH_IDS anchor. Usage: python research/splice.py research/batch_x.js
Refuses if any filter id in the batch already exists in index.html."""
import re, sys
p = "index.html"; s = open(p, encoding="utf-8", newline="").read()
b = open(sys.argv[1], encoding="utf-8").read()
ids = re.findall(r"^f\('([a-z0-9_]+)'", b, re.M)
dup = [i for i in ids if f"f('{i}'," in s]
if dup: sys.exit(f"already in index.html: {dup}")
consts = [c for c in re.findall(r"^const ([A-Za-z0-9_]+)", b, re.M) if re.search(r"^const " + c + r"\b", s, re.M)]
if consts: sys.exit(f"JS const names already used in index.html: {consts}")
# keep ANGLE (WebGL on D3D) from unrolling big constant loops: bound + int(u_p0*0.) is runtime-valued
_P = re.compile(r"(for\(int (\w+)=(-?\d+);\2(<=?))(\d+)([;)])")
def _r(m):
    span = int(m.group(5)) - int(m.group(3)) + (1 if m.group(4) == "<=" else 0)
    return m.group(0) if span < 16 else f"{m.group(1)}{m.group(5)}+int(u_p0*0.){m.group(6)}"
b, _n = _P.subn(_r, b)
a = "const DEPTH_IDS = new Set("; i = s.index(a)
s = s[:i] + b.replace("\r\n", "\n").replace("\n", "\r\n") + "\r\n" + s[i:]
open(p, "w", encoding="utf-8", newline="").write(s); print("spliced", len(ids), "filters:", ", ".join(ids), f"(de-unrolled {_n} loops)")
