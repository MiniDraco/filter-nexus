"""Test a batch file WITHOUT touching index.html (safe for parallel builders).
Usage (from filter-nexus/):  python research/testbatch.py research/batch_x.js
  - copies index.html to research/wip/<batch>/index.html, splices the batch in, exports wip/<batch>/shaders.json
  - runs the headless selftest against that export
  - prints the env line to render with it:  NEXUS_SHADERS=research/wip/<batch>/shaders.json python cli/nexus.py apply ...
Refuses filter ids / JS const names already present in index.html."""
import os, re, shutil, subprocess, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from heavy import slot
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
batch = Path(sys.argv[1]).resolve()
wip = ROOT / "research" / "wip" / batch.stem; wip.mkdir(parents=True, exist_ok=True)
s = (ROOT / "index.html").read_text(encoding="utf-8")
b = batch.read_text(encoding="utf-8")
ids = re.findall(r"^f\('([a-z0-9_]+)'", b, re.M)
dup = [i for i in ids if f"f('{i}'," in s]
consts = [c for c in re.findall(r"^const ([A-Za-z0-9_]+)", b, re.M) if re.search(r"^const " + c + r"\b", s, re.M)]
if dup or consts: sys.exit(f"name clash with index.html - ids: {dup} consts: {consts}")
anchor = "const DEPTH_IDS = new Set("; i = s.index(anchor)
(wip / "index.html").write_text(s[:i] + b + "\n" + s[i:], encoding="utf-8")
node = shutil.which("node") or r"C:\Program Files\nodejs\node.exe"
r = subprocess.run([node, str(ROOT / "cli" / "export_shaders.mjs"), str(wip / "index.html"), str(wip / "shaders.json")], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip()[-2000:])
if r.returncode: sys.exit(1)
env = dict(os.environ, NEXUS_SHADERS=str(wip / "shaders.json"))
with slot():  # at most 4 heavy jobs machine-wide
    r = subprocess.run([sys.executable, str(ROOT / "cli" / "nexus.py"), "selftest", "--only", ",".join(ids)], capture_output=True, text=True, env=env, encoding="utf-8", errors="replace")
out = (r.stdout + r.stderr).strip().splitlines()
print("\n".join(out[-25:]))
print(f"\nids: {', '.join(ids)}\nrender with:  NEXUS_SHADERS={wip / 'shaders.json'}")
sys.exit(0 if r.returncode == 0 and " 0 problems" in (r.stdout + r.stderr) else 1)
