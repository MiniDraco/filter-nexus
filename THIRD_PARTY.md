# Third-party material

Filter Nexus's own code is under the PolyForm Noncommercial License 1.0.0 (see `LICENSE.md`).

Required Notice: Copyright 2026 MiniDraco (https://github.com/MiniDraco/filter-nexus)

Many filters are re-implementations or ports of algorithms from other projects, and each filter's note in
`index.html` names its source. Where a filter is derived from code under its own licence, that licence still
applies to that part and is not replaced by the PolyForm licence. In particular:

| Material | Source | Licence |
|---|---|---|
| `research/ref/inkscape_filters.svg` and the Inkscape preset ports (`q40_*`, `q41_ink_*`) | Inkscape `share/filters/filters.svg` | GPL-2.0-or-later |
| G'MIC ports (`gmic*`, `q13_gmic_*`, `q25_*` and others citing G'MIC) | G'MIC / gmic-community | CeCILL 2.1 (GPL-compatible) |
| digiKam ports (`q23_dk_*`) | digiKam | GPL-2.0-or-later |
| BB Matchbox ports (`q44_shadowdensity`, `q44_safezones`, `q44_perspectivelines`) | BayleyBY/BB-Matchbox-Shaders | CC BY-SA 4.0 |
| RetroArch slang shader ports | libretro/slang-shaders (per-shader headers) | mostly GPL; see each shader |
| `depth/` (Depth Anything V2 Small, ONNX) | Depth Anything V2 | Apache-2.0 |
| `ort/` (onnxruntime-web WASM) | Microsoft ONNX Runtime | MIT |

Other ports (lygia, ReShade community shaders, FFmpeg, Leptonica, DIPlib, VIGRA, frei0r, purzOS, utility-dctls and
more) are named in the filter notes; check the original project's licence before reusing those parts.
