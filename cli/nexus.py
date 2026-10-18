"""Filter Nexus, headless: run any of the Filter Nexus GPU filters on image files.

Uses the exact GLSL from index.html (exported to nexus_shaders.json by export_shaders.mjs) on a
standalone OpenGL 3.3 context via moderngl. Needs: pip install moderngl pillow numpy

  python nexus.py list [--family Edges] [--search canny]
  python nexus.py info cld
  python nexus.py apply in.png -f nvnormal:Scale=12,Filter=5x5 -f normal2ao -o out.png [--16bit]
  python nexus.py bundle in.png -f cld -f ridge -f "binarize:Method=Sauvola" -o sensors.zip
  python nexus.py apply in.jpg -f depthdof --depth luma -o dof.png      (depth: luma | luma-inv | <file> | flat)

Filter spec:  id[@strength][:Param=value,Param=value]   e.g.  "canny@80:Low=0.05"
Params match by label (case-insensitive, prefix ok) or p0..p3; option params take the option text or index.
"""
import argparse
import io
import json
import os
import struct
import sys
import time
import zipfile
import zlib
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).parent
LIB = json.loads(Path(os.environ.get("NEXUS_SHADERS") or (HERE / "nexus_shaders.json")).read_text(encoding="utf-8"))  # NEXUS_SHADERS: test a private export
BY_ID = {f["id"]: f for f in LIB["filters"]}


def es_to_core(src):
    return src.replace("#version 300 es", "#version 330 core")


# ------------------------------------------------------------------ filter specs
def norm(s):
    return "".join(ch for ch in s.lower() if ch.isalnum())


def parse_spec(spec):
    head, _, rest = spec.partition(":")
    fid, _, strength = head.partition("@")
    if fid not in BY_ID:
        cands = [f["id"] for f in LIB["filters"] if norm(fid) in norm(f["id"] + f["name"])]
        raise SystemExit(f"unknown filter '{fid}'" + (f"; did you mean: {', '.join(cands[:8])}" if cands else ""))
    fl = BY_ID[fid]
    p = [pm["def"] for pm in fl["params"]]
    # split on commas that start a new "Name=" pair, so option labels may contain commas
    parts = []
    for piece in rest.split(","):
        if parts and "=" not in piece:
            parts[-1] += "," + piece
        else:
            parts.append(piece)
    for kv in filter(None, parts):
        k, _, v = kv.partition("=")
        k = k.strip()
        if k.lower().startswith("p") and k[1:].isdigit():
            j = int(k[1:])
        else:
            labels = [norm(pm["label"]) for pm in fl["params"]]  # exact label wins over a prefix ("Texture" vs "Texture scale")
            matches = [j for j, l in enumerate(labels) if l == norm(k)] or [j for j, l in enumerate(labels) if l.startswith(norm(k))]
            if not matches:
                raise SystemExit(f"{fid}: no parameter '{k}'. Has: " + ", ".join(pm["label"] for pm in fl["params"]))
            j = matches[0]
        pm = fl["params"][j]
        if "opts" in pm:
            opts = [norm(o) for o in pm["opts"]]
            p[j] = int(v) if v.strip().isdigit() else next((i for i, o in enumerate(opts) if o == norm(v)), None)
            if p[j] is None and not v.strip().isdigit():
                p[j] = next((i for i, o in enumerate(opts) if o.startswith(norm(v))), None)
            if p[j] is None:
                raise SystemExit(f"{fid}.{pm['label']}: options are {pm['opts']}")
        else:
            p[j] = float(v)
    return {"id": fid, "s": float(strength) if strength else 100.0, "p": p, "seed": 4.2}


# ------------------------------------------------------------------ engine
class Engine:
    def __init__(self):
        import moderngl
        self.mgl = moderngl
        self.ctx = moderngl.create_standalone_context(require=330)
        self.progs = {}
        self.vs = es_to_core(LIB["vs"])
        self.atlas = self._atlas()

    def tex(self, w, h, data=None):
        t = self.ctx.texture((w, h), 4, data=data, dtype="f4" if data is not None else "f2")
        t.filter = (self.mgl.LINEAR, self.mgl.LINEAR)
        t.repeat_x = t.repeat_y = False
        return t

    def from_rgba(self, arr):  # arr: HxWx4 float32, top row first
        h, w = arr.shape[:2]
        return self.tex(w, h, np.ascontiguousarray(arr[::-1]).astype("f4").tobytes())

    def _atlas(self):
        im = Image.new("RGBA", (320, 52), (0, 0, 0, 255))
        d = ImageDraw.Draw(im)
        try:
            font = ImageFont.truetype("consolab.ttf", 40)
        except OSError:
            font = ImageFont.load_default(size=40)
        for i, ch in enumerate(" .:-=+*#%@"):
            d.text((i * 32 + 16, 28), ch, fill=(255, 255, 255, 255), font=font, anchor="mm")
        return self.from_rgba(np.asarray(im, dtype="f4") / 255)

    def prog(self, fid, i):
        key = (fid, i)
        if key not in self.progs:
            fs = es_to_core(LIB["header"]) + "vec4 F(vec2 uv){vec4 c=T(uv);" + BY_ID[fid]["passes"][i] + "}" + LIB["main"]
            self.progs[key] = self.ctx.program(vertex_shader=self.vs, fragment_shader=fs)
        return self.progs[key]

    def run(self, items, src, depth, w, h):
        targets = [self.tex(w, h) for _ in range(3)]
        fbos = [self.ctx.framebuffer(color_attachments=[t]) for t in targets]
        cur = src
        t0 = time.perf_counter()
        for it in items:
            fl = BY_ID[it["id"]]
            inp, prev = cur, cur
            free = [k for k, t in enumerate(targets) if t is not inp]
            for i in range(len(fl["passes"])):
                k = free[i % 2] if free[i % 2] is not None else free[0]
                if targets[k] is prev:
                    k = next(x for x in free if targets[x] is not prev)
                pr = self.prog(fl["id"], i)
                fbos[k].use()
                self.ctx.viewport = (0, 0, w, h)
                for unit, (name, t) in enumerate([("u_tex", prev), ("u_orig", inp), ("u_aux", self.atlas), ("u_src", src), ("u_depth", depth)]):
                    t.use(location=unit)
                    if name in pr:
                        pr[name].value = unit
                vals = {"u_res": (w, h), "u_px": (1 / w, 1 / h), "u_k": 1.0, "u_s": it["s"] / 100, "u_seed": it["seed"],
                        "u_last": 1.0 if i == len(fl["passes"]) - 1 else 0.0, "u_time": 0.0}
                vals.update({f"u_p{j}": float(v) for j, v in enumerate(it["p"])})
                for n, v in vals.items():
                    if n in pr:
                        pr[n].value = v
                self.ctx.vertex_array(pr, []).render(self.mgl.TRIANGLES, vertices=3)
                prev = targets[k]
            out = self.tex(w, h)  # keep result out of the ping-pong set
            self.ctx.copy_framebuffer(self.ctx.framebuffer(color_attachments=[out]), self.ctx.framebuffer(color_attachments=[prev]))
            cur = out
        self.ctx.finish()
        data = np.frombuffer(cur.read(), dtype="f2").astype("f4").reshape(h, w, 4)[::-1]
        return np.clip(data, 0, 1), time.perf_counter() - t0


# ------------------------------------------------------------------ io
def load_image(path, max_edge):
    im = Image.open(path).convert("RGBA")
    if max(im.size) > max_edge:
        sc = max_edge / max(im.size)
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    return im


def make_depth(eng, mode, im):
    if mode in (None, "flat"):
        return eng.from_rgba(np.full((1, 1, 4), .5, "f4")), "flat"
    w, h = im.size
    if mode in ("luma", "luma-inv"):
        g = im.convert("L").filter(ImageFilter.GaussianBlur(max(1, w / 500)))
        a = np.asarray(g, "f4") / 255
        if mode == "luma-inv":
            a = 1 - a
        return eng.from_rgba(np.dstack([a, a, a, np.ones_like(a)])), "brightness" + (" (dark = near)" if mode == "luma-inv" else " (light = near)")
    d = np.asarray(Image.open(mode).convert("L").resize((w, h)), "f4") / 255
    return eng.from_rgba(np.dstack([d, d, d, np.ones_like(d)])), f"file {mode}"


def png16(path_or_buf, rgb):
    h, w = rgb.shape[:2]
    v = (np.clip(rgb[..., :3], 0, 1) * 65535 + .5).astype(">u2")
    raw = b"".join(b"\x00" + v[y].tobytes() for y in range(h))
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 16, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 6)) + chunk(b"IEND", b"")
    if isinstance(path_or_buf, (str, Path)):
        Path(path_or_buf).write_bytes(data)
    return data


def to_png8(rgba):
    buf = io.BytesIO()
    Image.fromarray((np.clip(rgba[..., :3], 0, 1) * 255 + .5).astype("u1"), "RGB").save(buf, "PNG")
    return buf.getvalue()


# ------------------------------------------------------------------ commands
def cmd_list(a):
    q = norm(a.search or "")
    for f in LIB["filters"]:
        if a.family and norm(a.family) not in norm(f["family"]):
            continue
        hay = norm(f["id"] + f["name"] + f["note"] + " ".join(LIB["aliases"].get(f["id"], [])))
        if q and q not in hay:
            continue
        print(f"{f['id']:<18} {f['name']:<34} {f['family']:<16} {f['note']}")


def cmd_info(a):
    f = BY_ID.get(a.id) or sys.exit(f"unknown filter {a.id}")
    print(f"{f['id']} — {f['name']}  [{f['family']}]  {f['note']}  ({len(f['passes'])} pass{'es' if len(f['passes']) > 1 else ''})")
    for j, pm in enumerate(f["params"]):
        rng = f"options: {pm['opts']}" if "opts" in pm else f"{pm['min']}..{pm['max']} {pm.get('unit', '')}"
        print(f"  p{j} {pm['label']:<20} default {pm['opts'][pm['def']] if 'opts' in pm else pm['def']:<10} {rng}")
    al = LIB["aliases"].get(f["id"])
    if al:
        print("  also known as: " + "; ".join(al))


def cmd_apply(a):
    eng = Engine()
    im = load_image(a.input, a.max_edge)
    w, h = im.size
    src = eng.from_rgba(np.asarray(im, "f4") / 255)
    depth, dlabel = make_depth(eng, a.depth, im)
    items = [parse_spec(s) for s in a.filter]
    out, secs = eng.run(items, src, depth, w, h)
    if a.bit16:
        png16(a.output, out)
    else:
        Image.fromarray((out[..., :3] * 255 + .5).astype("u1"), "RGB").save(a.output)
    print(f"{a.output}: {w}x{h}, {len(items)} filter(s), depth {dlabel}, {secs * 1000:.0f} ms GPU")


def cmd_bundle(a):
    eng = Engine()
    im = load_image(a.input, a.max_edge)
    w, h = im.size
    src = eng.from_rgba(np.asarray(im, "f4") / 255)
    depth, dlabel = make_depth(eng, a.depth, im)
    items = [parse_spec(s) for s in a.filter]
    maps, files = [], {"source.png": to_png8(np.asarray(im, "f4") / 255)}
    for n, it in enumerate(items, 1):
        fl = BY_ID[it["id"]]
        out, _ = eng.run([it], src, depth, w, h)
        name = f"{n:02d}_{fl['id']}.png"
        files[name] = png16(io.BytesIO(), out) if a.bit16 else to_png8(out)
        maps.append({"file": name, "id": fl["id"], "name": fl["name"], "family": fl["family"], "description": fl["note"],
                     "strength": it["s"] / 100,
                     "params": {pm["label"]: (pm["opts"][int(it["p"][j])] if "opts" in pm else it["p"][j]) for j, pm in enumerate(fl["params"])},
                     "also_known_as": LIB["aliases"].get(fl["id"], [])})
    comp, _ = eng.run(items, src, depth, w, h)
    files["composite.png"] = to_png8(comp)
    files["manifest.json"] = json.dumps({"generator": "Filter Nexus (nexus.py)", "image": {"name": Path(a.input).name, "width": w, "height": h},
                                         "depth": dlabel, "note": "Each map is one filter applied independently to source.png; composite.png chains them in order.",
                                         "maps": maps}, indent=2).encode()
    out = Path(a.output)
    if out.suffix.lower() == ".zip":
        with zipfile.ZipFile(out, "w", zipfile.ZIP_STORED) as z:
            for n, d in files.items():
                z.writestr(n, d)
    else:
        out.mkdir(parents=True, exist_ok=True)
        for n, d in files.items():
            (out / n).write_bytes(d)
    print(f"{out}: {len(maps)} sensor maps + composite, manifest.json")


def cmd_selftest(a):
    """Compile and run every filter on a small synthetic image; report failures and NaN/blank outputs."""
    eng = Engine()
    w, h = 96, 64
    yy, xx = np.mgrid[0:h, 0:w].astype("f4")
    img = np.dstack([xx / w, yy / h, (np.sin(xx / 5) * .5 + .5) * (yy > 20), np.ones_like(xx)]).astype("f4")
    src = eng.from_rgba(img)
    depth, _ = make_depth(eng, "flat", None)
    bad = []
    only = set(a.only.split(",")) if getattr(a, "only", None) else None
    todo = [f for f in LIB["filters"] if not only or f["id"] in only]
    for f in todo:
        try:
            out, _ = eng.run([{"id": f["id"], "s": 100, "p": [pm["def"] for pm in f["params"]], "seed": 1.0}], src, depth, w, h)
            if not np.isfinite(out).all():
                bad.append((f["id"], "non-finite output"))
        except Exception as e:
            bad.append((f["id"], str(e).splitlines()[0][:200]))
    print(f"{len(todo)} filters, {len(bad)} problems" + (f" (of {len(LIB['filters'])}; --only)" if only else ""))
    for b in bad:
        print("  ", *b)
    sys.exit(1 if bad else 0)


def main():
    for st in (sys.stdout, sys.stderr):
        try:
            st.reconfigure(encoding="utf-8", errors="replace")
        except AttributeError:
            pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("list"); s.add_argument("--family"); s.add_argument("--search"); s.set_defaults(fn=cmd_list)
    s = sub.add_parser("info"); s.add_argument("id"); s.set_defaults(fn=cmd_info)
    s = sub.add_parser("selftest"); s.add_argument("--only", help="comma-separated ids to test"); s.set_defaults(fn=cmd_selftest)
    for name, fn in (("apply", cmd_apply), ("bundle", cmd_bundle)):
        s = sub.add_parser(name); s.add_argument("input"); s.add_argument("-f", "--filter", action="append", required=True)
        s.add_argument("-o", "--output", required=True); s.add_argument("--depth", help="luma | luma-inv | flat | path to depth map")
        s.add_argument("--16bit", dest="bit16", action="store_true", help="16-bit PNG output"); s.add_argument("--max-edge", type=int, default=4096)
        s.set_defaults(fn=fn)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
