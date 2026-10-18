"""Generate GLSL for the Instagram looks from instagram.css (picturepan2, MIT) and inject it into
index.html between /* @ig-begin */ and /* @ig-end */.

CSS filter functions follow the W3C Filter Effects matrices (implemented in the shader header as
css*() helpers); the ::before overlay is evaluated per pixel (solid, linear or radial gradient) and
composited with its mix-blend-mode, as a browser would.
Run: python -I gen_instagram.py
"""
import re
from pathlib import Path

HERE = Path(__file__).parent
CSS = (HERE / "raw" / "instagram.css").read_text(encoding="utf-8-sig")
INDEX = HERE.parent / "index.html"
NAMES = {"xpro-ii": "X-Pro II", "lofi": "Lo-Fi", "1977": "1977"}
BLEND = {"normal": 0, "multiply": 1, "screen": 2, "overlay": 3, "darken": 4, "lighten": 5, "soft-light": 6}
OPS = {"sepia": "cssSepia", "hue-rotate": "cssHue", "saturate": "cssSat", "brightness": "cssBright",
       "contrast": "cssContrast", "grayscale": "cssGray"}


def color(tok):
    tok = tok.strip()
    if tok == "transparent":
        return (0, 0, 0, 0)
    if tok == "black":
        return (0, 0, 0, 1)
    if tok.startswith("#"):
        h = tok[1:]
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, 1)
    m = re.match(r"rgba?\(([^)]*)\)", tok)
    v = [float(x) for x in m.group(1).split(",")]
    return (v[0] / 255, v[1] / 255, v[2] / 255, v[3] if len(v) > 3 else 1)


def split_top(s):
    out, depth, cur = [], 0, ""
    for ch in s:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            out.append(cur.strip()); cur = ""
        else:
            cur += ch
    out.append(cur.strip())
    return out


def stops(parts):
    res = []
    for i, p in enumerate(parts):
        m = re.match(r"(.+?\))\s*([\d.]+%?)?$|^(\S+)\s*([\d.]+%?)?$", p)
        col = m.group(1) or m.group(3)
        pos = m.group(2) or m.group(4)
        if pos is None:
            pos = 0 if i == 0 else 1
        else:
            pos = float(pos.rstrip("%")) / (100 if pos.endswith("%") else 1)
        res.append((color(col), pos))
    return res


def v4(c):
    return "vec4({:.4f},{:.4f},{:.4f},{:.3f})".format(*c)


def overlay_expr(bg):
    """GLSL expression giving vec4(rgb, alpha) of the overlay at uv."""
    if bg.startswith("radial-gradient"):
        parts = split_top(bg[bg.index("(") + 1:-1])
        st = stops([p for p in parts if not p.startswith("circle")])
        t = "length((uv-.5)*u_res)/(.5*length(u_res))"   # closest/farthest corner coincide for a centred circle
    elif bg.startswith("linear-gradient"):
        parts = split_top(bg[bg.index("(") + 1:-1])
        st = stops([p for p in parts if not p.startswith("to ")])
        t = "1.-uv.y"                                      # 'to bottom': uv.y=1 is the top row
    else:
        return v4(color(bg))
    (a, pa), (b, pb) = st[0], st[-1]
    return f"grad2({v4(a)},{pa:.3f},{v4(b)},{pb:.3f},{t})"


def recipe(name):
    blk = re.search(rf"\.filter-{re.escape(name)}\s*\{{([^}}]*)\}}", CSS).group(1)
    chain = re.search(r"(?<!-)filter:\s*([^;]+);", blk).group(1)
    ops = re.findall(r"([a-z-]+)\(([-\d.]+)(?:deg)?\)", chain)
    lines = ["vec3 x=c.rgb;"] + [f"x={OPS[o]}(x,{float(v)});" for o, v in ops]
    ov = re.search(rf"\.filter-{re.escape(name)}::before\s*\{{([^}}]*)\}}", CSS)
    if ov:
        bgs = [b.strip() for b in re.findall(r"(?<![-\w])background:\s*([^;]+);", ov.group(1)) if not b.strip().startswith("-")]
        mode = re.search(r"mix-blend-mode:\s*([a-z-]+)", ov.group(1))
        if bgs:
            lines.append(f"vec4 ov={overlay_expr(bgs[-1])};x=mix(x,blendMode({BLEND[mode.group(1) if mode else 'normal']},x,ov.rgb),ov.a);")
    lines.append("return vec4(x,1.);")
    return "".join(lines), ", ".join(f"{o} {v}" for o, v in ops[:2])


names = sorted(set(re.findall(r"\.filter-([a-z0-9-]+)\s*\{", CSS)))
js = []
for n in names:
    body, note = recipe(n)
    disp = NAMES.get(n, n.title())
    js.append(f"f('ig_{n.replace('-', '')}','{disp}',[],`{body}`,'{note}');")
block = "\n".join(js)
src = INDEX.read_text(encoding="utf-8")
src, n_sub = re.subn(r"/\* @ig-begin \*/.*?/\* @ig-end \*/", lambda m: "/* @ig-begin */\n" + block + "\n/* @ig-end */", src, flags=re.S)
assert n_sub == 1, "markers not found"
INDEX.write_text(src, encoding="utf-8")
print(f"instagram: {len(names)} looks written")
