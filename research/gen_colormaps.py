"""Generate batch_colormaps.js: real colours sampled from matplotlib / cmocean / cmcrameri / palettable / colorcet / cmasher.
Run from filter-nexus/:  python research/gen_colormaps.py [--check]
Every map is stored as adaptive piecewise-linear knots vec4(t, r, g, b) fitted greedily to the package's own 256-entry
LUT so that the interpolated colour (with 3-decimal constants) stays within TOL 8-bit levels of it everywhere; this keeps
hard steps (oxy, topo, bukavu, fes, oleron, gist_stern ...) exact with few constants. --check prints knot counts / errors."""
import sys
from pathlib import Path
import numpy as np
import matplotlib
import cmocean  # noqa: F401  (registers cmo.*)
import cmcrameri.cm as cmc
import colorcet as cc
import cmasher as cmr  # noqa: F401  (registers cmr.*)
from palettable.colorbrewer import sequential as cbs, diverging as cbd

OUT = Path(__file__).resolve().parent / "batch_colormaps.js"


def mpl(name): return matplotlib.colormaps[name]


def lut(cm, n=256):
    return np.asarray(cm(np.linspace(0, 1, n)))[:, :3]


# ---- collections: (filter id, display name, stops, [(option label, queue name, colormap object)]) ----
MPL = ["viridis", "plasma", "inferno", "magma", "cividis", "turbo", "twilight", "cubehelix", "jet", "hot", "afmhot",
       "gist_earth", "gist_stern", "nipy_spectral", "CMRmap", "Wistia", "seismic", "coolwarm", "bone", "copper", "pink",
       "gnuplot2", "gist_ncar"]
CMO = ["thermal", "haline", "solar", "ice", "oxy", "deep", "dense", "algae", "matter", "turbid", "speed", "amp", "tempo",
       "rain", "phase", "topo", "balance", "delta", "curl", "diff", "tarn"]
CRA_SEQ = ["batlow", "batlowK", "batlowW", "acton", "bamako", "bilbao", "buda", "davos", "devon", "glasgow", "grayC",
           "hawaii", "imola", "lajolla", "lapaz", "lipari", "navia", "nuuk", "oslo", "tokyo", "turku"]
CRA_DIV = ["bam", "berlin", "broc", "cork", "lisbon", "managua", "roma", "tofino", "vanimo", "vik", "romaO", "bamO",
           "brocO", "corkO", "vikO", "bukavu", "fes", "oleron"]
CB_SEQ = ["YlGnBu", "YlOrRd", "YlOrBr", "OrRd", "PuBuGn", "PuRd", "RdPu", "BuPu", "GnBu", "BuGn", "YlGn"]
CB_DIV = ["BrBG", "PRGn", "PiYG", "PuOr", "RdBu", "RdGy", "RdYlBu", "RdYlGn", "Spectral"]
CC = ["fire", "bmy", "bgy", "kbc", "gouldian", "rainbow4", "isolum", "colorwheel"]  # glasbey handled separately
CMR = ["rainforest", "ember", "toxic", "gothic", "eclipse", "iceburn", "redshift", "fusion", "seasons", "infinity"]


def cc_map(n):
    return {"rainbow4": cc.cm["rainbow4"], "isolum": cc.cm["isolum"]}.get(n, cc.cm[n])


def cb_colors(name, k):
    mod = cbs if hasattr(cbs, f"{name}_{k}") else cbd
    return np.asarray(getattr(mod, f"{name}_{k}").colors, float) / 255


def cb_max(name): return 9 if hasattr(cbs, f"{name}_9") else 11


COLL = [
    ("cmap_mpl", "Colormap: matplotlib", 64, [(n, f"matplotlib {n}", mpl(n)) for n in MPL]),
    ("cmap_cmocean", "Colormap: cmocean", 32, [(n, f"cmocean {n}", mpl("cmo." + n)) for n in CMO]),
    ("cmap_crameri", "Colormap: Crameri sequential", 32, [(n, f"Crameri {n}", getattr(cmc, n)) for n in CRA_SEQ]),
    ("cmap_crameri_div", "Colormap: Crameri diverging / cyclic", 32, [(n, f"Crameri {n}", getattr(cmc, n)) for n in CRA_DIV]),
    ("cmap_colorcet", "Colormap: colorcet", 32, [(n, f"colorcet {n}", cc_map(n)) for n in CC]),
    ("cmap_cmasher", "Colormap: CMasher", 32, [(n, f"CMasher {n}", mpl("cmr." + n)) for n in CMR]),
]


TOL = 1.0


def knots(cm, tol=TOL):
    """greedy piecewise-linear fit to the 256 LUT; returns [(t, r, g, b)] with 3-decimal colours."""
    L = lut(cm, 256)
    ks, i = [0], 0
    while i < 255:
        j = i + 1
        while j + 1 <= 255:
            jj = j + 1
            x = np.arange(i, jj + 1)
            f = ((x - i) / (jj - i))[:, None]
            ap = np.round(L[i], 3) * (1 - f) + np.round(L[jj], 3) * f
            if np.abs(ap - L[x]).max() * 255 > tol:
                break
            j = jj
        ks.append(j)
        i = j
    return [(k / 255, *L[k]) for k in ks]


def knot_eval(kn, t):
    kt = np.array([k[0] for k in kn])
    kc = np.round(np.array([k[1:] for k in kn]), 3)
    return np.stack([np.interp(t, kt, kc[:, c]) for c in range(3)], 1)


def interp_err(cm, n):
    """max / mean abs error (8-bit levels) of n-stop linear interpolation vs the package's own 256 LUT."""
    ref = lut(cm, 256)
    st = lut(cm, n)
    x = np.linspace(0, 1, 256) * (n - 1)
    i = np.minimum(np.floor(x).astype(int), n - 2)
    f = (x - i)[:, None]
    ap = st[i] * (1 - f) + st[i + 1] * f
    st3 = np.round(st, 3)
    ap3 = st3[i] * (1 - f) + st3[i + 1] * f
    return np.abs(ap - ref).max() * 255, np.abs(ap3 - ref).mean() * 255


def f3(v): return ("%.3f" % v).rstrip("0").rstrip(".") if v > 0.0005 else "0"


def v3(c): return "vec3(" + ",".join(f3(x) for x in c) + ")"


def arr(name, cols):
    return f"const vec3 {name}[{len(cols)}]=vec3[{len(cols)}](" + ",".join(v3(c) for c in cols) + ");"


# common source / reverse / levels code. u_p0 map, u_p1 source, u_p2 reverse, u_p3 levels (0 = smooth)
SRC = ("int sm_=int(u_p1+.5);float t=sm_==0?luma(c.rgb):sm_==1?c.r:sm_==2?c.g:sm_==3?c.b:max(c.r,max(c.g,c.b));"
       "t=clamp(t,0.,1.);if(u_p2>.5)t=1.-t;float lv_=floor(u_p3+.5);if(lv_>=2.)t=min(floor(t*lv_),lv_-1.)/(lv_-1.);")
SOURCES = "S('Source',['Luminance','Red','Green','Blue','Value (max RGB)'])"
REV = "S('Reverse',['No','Yes'])"
LEV = "P('Levels (0 = smooth)',0,32,0,1)"


def f4(k): return "vec4(" + ",".join(("%.4f" % k[0]).rstrip("0").rstrip(".") if k[0] > 0 else "0" for _ in [0]) + "," + ",".join(f3(x) for x in k[1:]) + ")"


def knot_code(kns, src=None, m="int(u_p0+.5)"):
    """GLSL: const knot table + per-map offsets; sets vec3 rgb_ from t (linear search, constant loop bound)."""
    flat = [k for kn in kns for k in kn]
    off = [0]
    for kn in kns:
        off.append(off[-1] + len(kn))
    mk = max(map(len, kns))
    return (f"const vec4 KN[{len(flat)}]=vec4[{len(flat)}](" + ",".join(f4(k) for k in flat) + ");"
            f"const int KO[{len(off)}]=int[{len(off)}](" + ",".join(map(str, off)) + ");" + (src or SRC) +
            f"int m_={m};int a_=KO[m_],e_=KO[m_+1]-1;int j_=a_;for(int i=1;i<{mk};i++){{int q_=a_+i;if(q_>e_||KN[q_].x>t)break;j_=q_;}}"
            "vec4 p_=KN[j_],n_=KN[min(j_+1,e_)];vec3 rgb_=mix(p_.yzw,n_.yzw,clamp((t-p_.x)/max(n_.x-p_.x,1e-6),0.,1.));")


SRC_NOLEV = ("int sm_=int(u_p1+.5);float t=sm_==0?luma(c.rgb):sm_==1?c.r:sm_==2?c.g:sm_==3?c.b:max(c.r,max(c.g,c.b));"
             "t=clamp(t,0.,1.);if(u_p2>.5)t=1.-t;")
SRCNAME = {"cmap_mpl": "matplotlib", "cmap_cmocean": "cmocean (Thyng et al. 2016)",
           "cmap_crameri": "Crameri Scientific Colour Maps v8 (cmcrameri)", "cmap_crameri_div": "Crameri Scientific Colour Maps v8 (cmcrameri)",
           "cmap_colorcet": "colorcet (Kovesi 2015 perceptually uniform)", "cmap_cmasher": "CMasher (van der Velden 2020)"}


def build():
    js = ["/* ================= colormaps: named scientific colormaps - real colours sampled from matplotlib, cmocean,\n"
          "   cmcrameri, palettable (ColorBrewer), colorcet, CMasher; generated by research/gen_colormaps.py ================= */",
          "f = add('Analysis');"]
    done, stats = {}, []
    for fid, title, _, maps in COLL:
        kns = [knots(cm) for _, _, cm in maps]
        stats.append((fid, sum(map(len, kns))))
        opts = ",".join(f"'{lab}'" for lab, _, _ in maps)
        js.append(f"f('{fid}','{title}',[S('Map',[{opts}]),{SOURCES},{REV},{LEV}],\n  `{knot_code(kns)}return vec4(rgb_,1.);`,\n"
                  f"  '{SRCNAME[fid]}: piecewise-linear fit to the package LUT (max 1 level error); Levels posterizes');")
        done[fid] = [q for _, q, _ in maps]
    # ColorBrewer: Classes 0 = smooth (matplotlib's interpolated scheme, knot fit), 3..max = the exact n-class scheme (palettable)
    names = CB_SEQ + CB_DIV
    kns = [knots(mpl(nm)) for nm in names]
    cls, off = [], []
    for nm in names:
        mx = cb_max(nm)
        o = {}
        for k in range(3, mx + 1):
            o[k] = len(cls)
            cls.extend(cb_colors(nm, k))
        off += [o[min(k, mx)] for k in range(3, 12)]
    mxs = [cb_max(nm) for nm in names]
    stats.append(("cmap_colorbrewer", sum(map(len, kns)) + len(cls)))
    body = (arr("CBC", np.array(cls)) + f"const int CBO[{len(off)}]=int[{len(off)}](" + ",".join(map(str, off)) + ");" +
            f"const int CBM[{len(mxs)}]=int[{len(mxs)}](" + ",".join(map(str, mxs)) + ");" + knot_code(kns, SRC_NOLEV) +
            "int k_=int(u_p3+.5);if(k_<3)return vec4(rgb_,1.);k_=min(k_,CBM[m_]);int c_=min(int(t*float(k_)),k_-1);"
            "return vec4(CBC[CBO[m_*9+k_-3]+c_],1.);")
    opts = ",".join(f"'{n}'" for n in names)
    js.append(f"f('cmap_colorbrewer','Colormap: ColorBrewer',[S('Map',[{opts}]),{SOURCES},{REV},P('Classes (0 = smooth)',0,11,0,1)],\n  `{body}`,\n"
              "  'ColorBrewer 2.0 (Brewer): 0 = smooth (matplotlib interpolation); 3-9 sequential / 3-11 diverging = the exact n-class scheme');")
    done["cmap_colorbrewer"] = [f"ColorBrewer {n}" for n in names]
    # glasbey: categorical; value quantised to Classes bins coloured glasbey[0..k-1]
    gl = np.array([matplotlib.colors.to_rgb(h) for h in cc.glasbey[:32]])
    body = (arr("GLB", gl) + SRC_NOLEV + "int k_=int(u_p0+.5);int c_=min(int(t*float(k_)),k_-1);return vec4(GLB[c_],1.);")
    js.append(f"f('cmap_glasbey','Colormap: glasbey (categorical)',[P('Classes',2,32,12,1),{SOURCES},{REV}],\n  `{body}`,\n"
              "  'colorcet glasbey (Glasbey et al. 2007 maximally distinct colours, first 32): value quantised into N classes');")
    done["cmap_glasbey"] = ["colorcet glasbey"]
    OUT.write_text("\n".join(js) + "\n", encoding="utf-8")
    dp = OUT.parent / "done_colormaps.py"
    dp.write_text("# colormaps builder: queue_colormaps.txt -> engine ids (round 11, Colormaps). Generated by gen_colormaps.py\n"
                  "DONE_PART = {\n" + "".join(f"    {k!r}: {v!r},\n" for k, v in done.items()) + "}\n", encoding="utf-8")
    print("wrote", OUT.name, OUT.stat().st_size, "bytes;", sum(map(len, done.values())), "queue names; constants:", stats)


if __name__ == "__main__":
    if "--check" in sys.argv:
        for fid, title, _, maps in COLL:
            for lab, _, cm in maps:
                kn = knots(cm)
                err = np.abs(knot_eval(kn, np.linspace(0, 1, 256)) - lut(cm, 256)) * 255
                print(f"{fid:18s}{lab:14s} knots {len(kn):3d}  max {err.max():.2f}  mean {err.mean():.2f}")
    else:
        build()
