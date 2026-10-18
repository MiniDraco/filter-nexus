"""Round 14 dedupe: check research/round14_list.py (R14) against filters.db and rounds 9-13.

Run from filter-nexus/:
    python research/dedupe14.py                      verify round14_list.py (exit 1 on any overlap)
    python research/dedupe14.py --build [CANDS.py]   filter a raw candidate list C (default research/candidates14.py),
                                                     then write round14_list.py/.md
    python research/dedupe14.py --probe NAMES.txt    screen a plain list of names (one per line): known / new

Match rules (same as dedupe.py): names compared lower-case with punctuation/spaces removed, and again with
(parenthetical) / [bracketed] parts removed. Known = filter.name, filter.engine_id, alias.name, round 9-13 names.
"Near" = one normalized base contains the other (both >= 7 chars) — printed for manual review, not dropped.
"""
import re, sqlite3, sys, os, importlib.util
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())
def base(s): return norm(re.sub(r"\(.*?\)|\[.*?\]", "", s))
def keys(s): return {norm(s), base(s)} - {""}

def load_known():
    db = sqlite3.connect(os.path.join(ROOT, "filters.db"))
    known = {}
    for name, eid in db.execute("SELECT name, engine_id FROM filter"):
        for k in keys(name) | ({norm(eid)} if eid else set()): known.setdefault(k, f"db filter: {name}")
    for app, name in db.execute("SELECT app, name FROM alias"):
        for k in keys(name): known.setdefault(k, f"db alias ({app}): {name}")
    n_db = len(known)
    from round9_list import R9
    for n, *_ in R9:
        for k in keys(n): known.setdefault(k, f"round 9: {n}")
    from round10_list import R10
    for n, *_ in R10:
        for k in keys(n): known.setdefault(k, f"round 10: {n}")
    from round11_list import R11
    for n, *_ in R11:
        for k in keys(n): known.setdefault(k, f"round 11: {n}")
    from round12_list import R12
    for n, *_ in R12:
        for k in keys(n): known.setdefault(k, f"round 12: {n}")
    from round13_list import R13
    for n, *_ in R13:
        for k in keys(n): known.setdefault(k, f"round 13: {n}")
    return known, n_db, (len(R9), len(R10), len(R11), len(R12), len(R13))

def check(items, known):
    exact, near, internal, seen = [], [], [], {}
    long_known = [(k, v) for k, v in known.items() if len(k) >= 7]
    for n, *_ in items:
        ks = keys(n)
        hit = next((known[k] for k in ks if k in known), None)
        if hit: exact.append((n, hit))
        b = base(n)
        if not hit and len(b) >= 7:
            close = [v for k, v in long_known if b in k or k in b]
            if close: near.append((n, close[:3]))
        for k in ks:
            if k in seen and seen[k] != n: internal.append((n, seen[k]))
            seen.setdefault(k, n)
    return exact, near, internal

def write_outputs(final):
    fam = defaultdict(Counter)
    for n, s, c, f in final: fam[s][c] += 1
    FAMILY = {s: cnt.most_common(1)[0][0] for s, cnt in fam.items()}
    REASON = {"G": "needs whole-image or sequential processing", "M": "needs a neural network", "X": "needs several images or video frames"}
    with open(os.path.join(HERE, "round14_list.py"), "w", encoding="utf-8") as fh:
        fh.write('"""Round 14 harvest: techniques not in filters.db or rounds 9-13 (built and verified by dedupe14.py).\n'
                 '(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,\n'
                 'X = several images / video frames."""\n')
        fh.write("FAMILY = " + repr(FAMILY) + "\nREASON = " + repr(REASON) + "\nR14 = [\n")
        for t in final: fh.write("    " + repr(t) + ",\n")
        fh.write("]\n")
    mark = {"S": "", "G": " ⓖ", "M": " ⓜ", "X": " ⓧ"}
    fc = Counter(f for *_, f in final)
    by = defaultdict(list)
    for t in final: by[t[1]].append(t)
    with open(os.path.join(HERE, "round14_list.md"), "w", encoding="utf-8") as fh:
        fh.write(f"# Round 14 harvest: {len(final)} techniques not yet in Filter Nexus\n\n")
        fh.write("Checked by `research/dedupe14.py` against every filter, engine id and alias name in `filters.db`, all "
                 f"round-9 to round-13 names. {fc['S']} are buildable as GPU shaders; {fc['G']} need whole-image/sequential work, "
                 f"{fc['M']} need a neural net, {fc['X']} need several images or frames.\n\n")
        fh.write("Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video\n\n")
        i = 0
        for src, rows in by.items():
            fh.write(f"\n## {src} ({len(rows)})\n\n")
            for n, s, c, f in rows:
                i += 1
                fh.write(f"{i}. {n}{mark[f]}  — {c}\n")

def main():
    known, n_db, n_r9 = load_known()
    if len(sys.argv) > 1 and sys.argv[1] == "--build":
        cpath = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("-") else os.path.join(HERE, "candidates14.py")
        spec = importlib.util.spec_from_file_location("cands", cpath); mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        drop, cat_o, src_o, fe_o = (set(getattr(mod, "DROP", ())), getattr(mod, "CATEGORY", {}),
                                    getattr(mod, "SOURCE", {}), getattr(mod, "FEAS", {}))
        cands = [(n, src_o.get(n, s), cat_o.get(n, c), fe_o.get(n, f)) for n, s, c, f in mod.C]
        CATS = {"Insta", "Depth", "Tone", "Color", "Film", "Paint", "Blur", "Sharpen", "Repair", "Edges", "Materials",
                "Stylize", "Retro", "Distort", "Frames", "Noise", "Render", "Terrain", "Sensor", "Augment", "Analysis"}
        assert all(c in CATS and f in "SGMX" for _, _, c, f in cands), [t for t in cands if t[2] not in CATS]
        assert not (set(cat_o) | set(src_o) | set(fe_o) | drop) - {t[0] for t in cands}, "override names a missing candidate"
        exact, near, internal = check(cands, known)
        bad = {n for n, _ in exact} | {n for n, _ in internal} | drop
        print(f"candidates {len(cands)}  exact-known {len(exact)}  internal-dup {len(internal)}  manual-drop {len(drop)}")
        for n, h in exact: print("  drop (known):", n, "->", h)
        for n, h in internal: print("  drop (dup of candidate):", n, "->", h)
        print("near matches (kept unless in DROP):")
        for n, cl in near:
            if n not in drop and "-q" not in sys.argv: print("  ", n, "~", cl)
        final = [t for t in cands if t[0] not in bad]
        write_outputs(final)
        print("written", len(final))
    if len(sys.argv) > 2 and sys.argv[1] == "--probe":      # screen a plain list of names (one per line)
        for line in open(sys.argv[2], encoding="utf-8"):
            n = line.strip()
            if not n: continue
            hit = next((known[k] for k in keys(n) if k in known), None)
            print(("KNOWN  " + n + "  -> " + hit) if hit else ("new    " + n))
        return
    import round14_list
    R14 = round14_list.R14
    CATS = {"Insta", "Depth", "Tone", "Color", "Film", "Paint", "Blur", "Sharpen", "Repair", "Edges", "Materials",
            "Stylize", "Retro", "Distort", "Frames", "Noise", "Render", "Terrain", "Sensor", "Augment", "Analysis"}
    bad_fam = ({s for _, s, _, _ in R14} - set(round14_list.FAMILY)) | {s for s, c in round14_list.FAMILY.items() if c not in CATS}
    bad_row = [t for t in R14 if t[2] not in CATS or t[3] not in "SGMX"]
    exact, near, internal = check(R14, known)
    fc = Counter(f for *_, f in R14)
    print(f"\nVERIFY round14_list.py: R14 {len(R14)} entries | known keys: db {n_db}, +round9 {n_r9[0]}, +round10 {n_r9[1]}, +round11 {n_r9[2]}, +round12 {n_r9[3]}, +round13 {n_r9[4]} names")
    print(f"  overlap with filters.db/round 9-13: {len(exact)}   internal duplicates: {len(internal)}   near (reviewed) {len(near)}")
    print("  feasibility:", dict(sorted(fc.items())), "  sources:", len({s for _, s, _, _ in R14}))
    for s_ in bad_fam: print("  BAD FAMILY:", s_)
    for t in bad_row: print("  BAD ROW:", t)
    if bad_fam or bad_row: sys.exit(1)
    for n, h in exact + internal: print("  OVERLAP:", n, "->", h)
    sys.exit(1 if exact or internal else 0)

if __name__ == "__main__":
    main()
