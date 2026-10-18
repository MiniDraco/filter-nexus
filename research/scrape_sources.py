"""Pull filter names straight from each app's official docs / source.

Writes research/raw/<source>.json as [{"name", "group", "url"}].
Run: python -I scrape_sources.py   (stdlib only)
"""
import html
import json
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

OUT = Path(__file__).parent / "raw"
OUT.mkdir(exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) filter-nexus-research"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace")


class Links(HTMLParser):
    """Collect (href, text) for every <a>."""
    def __init__(self):
        super().__init__()
        self.links, self._href, self._buf = [], None, []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._href, self._buf = dict(attrs).get("href"), []

    def handle_data(self, data):
        if self._href is not None:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self._href is not None:
            self.links.append((self._href, " ".join("".join(self._buf).split())))
            self._href = None


def links(page):
    p = Links()
    p.feed(page)
    return p.links


def headings(page, levels="h2|h3"):
    out = []
    for m in re.finditer(rf"<({levels})[^>]*>(.*?)</\1>", page, re.S | re.I):
        t = html.unescape(re.sub(r"<[^>]+>", "", m.group(2)))
        t = " ".join(t.replace("¶", "").split())
        if t:
            out.append(t)
    return out


def save(name, rows):
    seen, uniq = set(), []
    for r in rows:
        k = (r["name"].lower(), r.get("group", ""))
        if r["name"] and k not in seen:
            seen.add(k)
            uniq.append(r)
    (OUT / f"{name}.json").write_text(json.dumps(uniq, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{name}: {len(uniq)}")


def gimp():
    base = "https://docs.gimp.org/3.0/en/"
    page = get(base + "filters.html")
    rows, group = [], ""
    # TOC: chapter sections ("1. Blur Filters") and their entries ("1.2. Gaussian Blur")
    for href, text in links(page):
        m = re.match(r"^(\d+)\.(\d+)?\.?\s*(.+)$", text)
        if not m:
            continue
        if m.group(2) is None:
            group = m.group(3).replace(" Filters", "")
        elif not m.group(3).lower().startswith("introduction"):
            rows.append({"name": m.group(3), "group": group, "url": base + href.split("#")[0]})
    save("gimp", rows)


def krita():
    base = "https://docs.krita.org/en/reference_manual/filters/"
    cats = ["adjust", "artistic", "blur", "colors", "edge_detection", "emboss", "enhance", "map", "other", "wavelet_decompose"]
    rows = []
    for c in cats:
        try:
            page = get(base + c + ".html")
        except Exception as e:
            print("krita", c, e, file=sys.stderr)
            continue
        for h in headings(page, "h2|h3"):
            rows.append({"name": h, "group": c.replace("_", " ").title(), "url": base + c + ".html"})
        time.sleep(.5)
    save("krita", rows)


def paintnet():
    base = "https://paint.net/doc/latest/"
    rows = []
    for menu in ["AdjustmentsMenu", "EffectsMenu"]:
        page = get(base + menu + ".html")
        subs = sorted({h for h, t in links(page) if h and re.match(r"^(Effects|Adjustments)\w*Menu\.html$", h)})
        for sub in subs or [menu + ".html"]:
            try:
                sp = get(base + sub)
            except Exception as e:
                print("pdn", sub, e, file=sys.stderr)
                continue
            grp = re.sub(r"(Effects|Menu|\.html)", "", sub) or menu
            for h in headings(sp, "h2|h3|h4"):
                rows.append({"name": h, "group": ("Adjustments" if menu.startswith("Adj") else "Effects / " + grp), "url": base + sub})
            time.sleep(.4)
    save("paintnet", rows)


def gmic():
    rows = []
    for fn in ["gmic_stdlib.gmic", "gmic_stdlib_community.gmic"]:
        url = f"https://raw.githubusercontent.com/GreycLab/gmic/master/src/{fn}"
        try:
            src = get(url)
        except Exception as e:
            print("gmic", fn, e, file=sys.stderr)
            continue
        folder = ""
        for line in src.splitlines():
            if not line.startswith("#@gui "):
                continue
            body = line[6:].strip()
            if body.startswith("____"):          # "#@gui ____<b>Folder</b>"
                folder = re.sub(r"<[^>]+>", "", body).strip("_ ").strip()
                continue
            if body.startswith(":") or body.startswith("_"):
                continue                         # parameter / hidden lines
            name = re.sub(r"<[^>]+>", "", body.split(":", 1)[0]).strip()
            if not name or folder.lower() in ("about", "") or name.lower().startswith("about"):
                continue
            rows.append({"name": name, "group": folder, "url": url})
    save("gmic", rows)


def imagemagick():
    page = get("https://imagemagick.org/script/command-line-options.php")
    rows = []
    for m in re.finditer(r'<h3[^>]*>\s*<a[^>]*id="([\w-]+)"[^>]*>\s*-([\w-]+)', page):
        rows.append({"name": "-" + m.group(2), "group": "option", "url": "https://imagemagick.org/script/command-line-options.php#" + m.group(1)})
    if not rows:
        for m in re.finditer(r'id="([a-z][\w-]*)"', page):
            rows.append({"name": "-" + m.group(1), "group": "option", "url": "https://imagemagick.org/script/command-line-options.php"})
    save("imagemagick", rows)


def photoshop():
    rows = []
    for url in ["https://helpx.adobe.com/photoshop/using/filter-effects-reference.html",
                "https://helpx.adobe.com/photoshop/desktop/effects-filters/blur-sharpen-filters/filter-effects-reference.html"]:
        try:
            page = get(url)
        except Exception as e:
            print("photoshop", url, e, file=sys.stderr)
            continue
        group = ""
        for m in re.finditer(r"<(h2|h3|h4|b|strong)[^>]*>(.*?)</\1>", page, re.S | re.I):
            t = " ".join(html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).split())
            if not t or len(t) > 40:
                continue
            if m.group(1).lower() in ("h2", "h3"):
                group = t
            else:
                rows.append({"name": t, "group": group, "url": url})
        if rows:
            break
    save("photoshop", rows)


if __name__ == "__main__":
    for fn in [gimp, krita, paintnet, gmic, imagemagick, photoshop]:
        try:
            fn()
        except Exception as e:
            print(fn.__name__, "FAILED", e, file=sys.stderr)
