# Filter Nexus

A library of ~470 GPU image filters (GLSL), usable three ways:

1. **Web app**: `index.html` (published as an Artifact). Stack filters with strength sliders, depth/3D view, export PNG, 16-bit PNG, 3D mesh, or a *sensor bundle*.
2. **Headless CLI**: `cli/nexus.py` runs the exact same shaders on image files. Use this instead of writing new image-filter code.
3. **Database**: `filters.db` / `filters.json`. Every filter name from Photoshop, GIMP, G'MIC, Krita, Paint.NET, Instagram, Lightroom, ImageJ, OpenCV, scikit-image, texture tools and the literature, mapped to the engine filter that implements it (or why it's out of scope).

## CLI

```
python cli/nexus.py list --search canny              # find filters by any app's name for them
python cli/nexus.py list --family "Edges"
python cli/nexus.py info binarize                    # params, options, aliases
python cli/nexus.py apply in.png -f "binarize:Method=Sauvola,Window=30" -o out.png
python cli/nexus.py apply in.png -f nvnormal:Scale=12 -f normal2ao -o ao.png --16bit
python cli/nexus.py apply in.jpg -f depthdof --depth luma -o dof.png   # depth: luma | luma-inv | flat | depth.png
python cli/nexus.py bundle in.png -f cld -f ridge -f skeleton -f "autothreshold:Method=Otsu" -o sensors.zip
python cli/nexus.py selftest                         # compile + run every filter
```

Filter spec: `id[@strength][:Param=value,...]`. Params match their label by prefix (case-insensitive) or `p0..p3`; option params take the option text (prefix ok) or index.
A **bundle** runs each filter independently on the source and writes `NN_<id>.png` per map, `composite.png` (chained), `source.png`, and `manifest.json` (names, params, families, aliases).

Needs `pip install moderngl pillow numpy` (OpenGL 3.3 GPU). `nexus_shaders.json` holds the shaders; regenerate it with Node after editing `index.html`.

## Useful filter groups

- **Line art / structure**: `cld` (coherent line drawing), `xdog`, `cannyfull`, `ridge`, `frangi`, `frangims`, `meijering`, `steger`, `linedetector`, `skeleton` (+`junctions`), `binarize` (Sauvola, Niblack, Wolf, Bernsen, Bradley, Phansalkar, NICK, WAN, Singh, Feng, ISauvola, local Otsu/median…), `autothreshold` (ImageJ global methods + Multi-Otsu), `inkextract`, `descreen`, `strokewidth`, `gaborbank`, `etf`, `zerocross`, `rollingguidance`.
- **Sensors**: `colorspace`, `lbp`, `hog`, `entropy`, `saliency`, `localstats`, `focusmap`, `noisemap`, `texturemap`, `darkchannel`, `shadowmask`, `specular_detect`, `blockiness`, `falsecolor`, `colormap`.
- **Height / normal / material maps**: `nvnormal`, `gimpnormal`, `bumpmap`, `detailnormal`, `normal`, `normal2height`, `normal2ao`, `normal2curv`, `ao`, `curvature`, `cavity`, `ormpack`, `flowmap`, `sdf`, `colorid`.
- **Depth & 3D**: `depthview`, `depthdof`, `depthfog`, `anaglyph`, `stereopair`, `parallax`, `stereogram`, `depthcutout` (web app: AI depth via Depth Anything V2, or brightness).
- **Terrain**: `hillshade`, `slopedeg`, `aspectmap`, `tpi`, `tri`, `curvature2`, `skyview`, `terrainshadow`, `viewshed`, `flowacc` (rivers, TWI), `hypsometric`, `strata`, `snowmask`, `terraces`, `erosion`.
- **Tone mapping / enhancement**: `tonemap` (Reinhard, Drago, ACES, Hable, Hejl-Dawson, Lottes, Uchimura, AgX…), `reinhardlocal`, `expofusion`, `msr` (MSR/MSRCR/SSR), `durand`, `fattal`, `locallaplacian`, `histmatch`, `tonecurves`, `colorconstancy`, `hdrtoning`, `clahe`.
- **Texture analysis**: `glcm` (Haralick), `laws`, `tamura`, `fractaldim`, `lbp`, `entropy`, `blobdetect`, `moravec`, `ssimmap` (vs source).
- **Camera & sensor simulation** (augmentation): `sensornoise`, `bayersim`, `rollingshutter`, `lensvignette`, `camshake`, `moire`, `deadpixels`, `interlace`, `resample`, `jpeg`, `chromatic`.
- **Morphology & wavelets**: `morphfilter`, `reconstruct`, `hmaxima` (h-maxima/h-minima), `regionalmax`, `ultimateerosion`, `asf`, `atrous`, `pooling`, `kmeansquant`.
- **Edge-aware / color science / transforms**: `domaintransform`, `wls`, `guided`, `freqsep`, `cvd` (color-blindness simulation + daltonize), `chromadapt` (Bradford/CAT02/von Kries), `clipwarn` (clipping, zebras), `census`, `houghspace` (Hough/Radon line space).
- **Denoise families**: `statfilters` (arithmetic/geometric/harmonic/contraharmonic/midpoint/alpha-trimmed/conservative), `speckle` (Lee, Kuan, Frost, Lee sigma), `srad`, `tvdenoise` (ROF), `nlmeans`, `modefilter` (majority), `lowlight` (LIME / Dong); `localmoments` for skewness/kurtosis/CV/percentiles.
- **Photo / astro repair**: `cosmicray` (L.A.Cosmic-style), `hotpixels`, `deband`, `defringe` (purple fringing), `cacorrect` (lateral CA), `matchedfilter` (vessels, point sources), `anscombe` (VST: forward → denoise → inverse).
- **Photo-app modules**: `negadoctor` (scan a film negative → positive), `filmic` (darktable sigmoid / filmic), `toneequalizer`, `gradnd`, `velvia`, `censor`, `zonesystem`; Snapseed-style `glamourglow`, `tonalcontrast`, `drama`, `grunge`.
- **Pixel art & resampling**: `pixelscale` (EPX/Scale2x, Scale3x, Eagle), `xbr`, `sharppixels`, `resamplekernel` (bilinear, B-spline, Mitchell, Catmull-Rom, Lanczos, Jinc-approx), `cas`, `rcas`, `anime4k`.
- **Retro palettes & screens**: `palettedither` (NES, C64, ZX, EGA, SMS, CPC, MSX, Atari 2600, Virtual Boy × Bayer/Yliluoma/Knoll/IGN/blue-noise), `zxspectrum`, `apple2`, `linescreen`.
- **Film, print & media**: `filmstock` (Ektachrome, Portra, Ektar, Provia, Instax, Technicolor, hand-tinted, Tri-X, HP5, Delta 3200), `altprocess` (Van Dyke, platinum, salt, gum, daguerreotype, tintype, lith, selenium, split sepia), `halation`, `filmburn`, `autochrome`, `risograph`, `screenprint`, `printmaking` (woodcut, linocut, scratchboard, drypoint, aquatint, lithograph), `paintmedia` (gouache, crayon, impasto, stippling).
- **Tone & color science II**: `tonemap2` (log, Schlick, Tumblin-Rushmeier, Reinhard-Devlin, Ashikhmin, Ferwerda, Naka-Rushton, Khronos PBR Neutral, UE4 filmic), `colorspace2` (Oklab/Oklch, LUV, Hunter Lab, YIQ, YCoCg, IPT, ICtCp, Jzazbz, HSI, rg, c1c2c3, l1l2l3, opponent, CMYK), `gamutcompress`, `softproof`, `cctmap`, `harmonize`, `hueshiftluma`.

Build queue: `research/round9_list.md` lists harvested techniques not built yet (`planned` in filters.db); `research/round9_done.py` records which are done.
- **Retro displays**: `crtsuite` (Royale/Geom/Lottes/Easymode/Guest-style, aperture/slot/shadow masks), `ntscsignal` (composite, S-video, RF, GTU-style), `lcdgrid`, `vectordisplay`, `bezel`, `teletext`, `textart` (Braille, ANSI, PETSCII), `matrixrain`, `ditherblend` (MDAPT).
- **Glitch, lighting & depth**: `glitchsuite`, `slitscan`, `huesort`, `mirrortiles`, `refraction`, `heathaze`, `lensfx` (star, spikes, anamorphic, dirt), `caustics`, `sss`, `eyeadapt`; with depth: `ssao2` (HBAO/GTAO), `depthshadow`, `volumelight`, `rimlight`, `depthfx`.
- **Edges & features II**: `edgeops2` (ISEF, Deriche, Nevatia-Babu, facet, compass, SUSAN), `corners2`, `keypoints` (DoG, Hessian-Laplace, SURF, CenSurE), `monogenic`, `steerable`, `vesselness2` (Jerman, Zana-Klein, OOF, blobness), `gvf`, `edgethin` (Canny NMS / hysteresis / sub-pixel).
- **Segmentation & morphology II**: `fuzzycmeans`, `entropythresh`, `hysteresis`, `regiongrow`, `acwe`, `guohall`, `skelprune`, `hitmiss`, `localthickness`, `morph2`, `reconstruct2`, `fillholes`, `jfa` (distance, feature transform, SKIZ, medial axis). `autothreshold` now includes Shanbhag and Rosin.
- **Sensors II**: `scopes` (waveform, RGB parade, vectorscope), `focusmeasure` (Tenengrad, Laplacian variance, Brenner, Vollath F4, edge density), `contrastmap` (RMS, Michelson, colourfulness, complexity, lacunarity, Hurst, wavelet energy), `saliency2` (Achanta, Itti-Koch, Montabone), `lbp2` (riu2, LBPV, CLBP, LTP, LDP, LGP, WLD, LPQ), `descfield` (dense SIFT / DAISY), `composition` (thirds, golden ratio, symmetry, horizon tilt, sky mask), `windowlevel` (medical window/level, ITK windowing/sigmoid/shift-scale).

Parallel building: `research/BUILDER_GUIDE.md` + `research/testbatch.py` let several builders test batches in private copies; finished batches are spliced with `research/splice.py`.
- **Blend modes & film II**: `blendmodes` (26 Photoshop/W3C modes), `blendmodes2` (22 GIMP/Krita modes) over a chosen second layer; `filmneg2` (19 negative/cine stocks), `filmslide2` (slide, instant, Lomochrome), `filmbw2` (15 B&W stocks), `fujisim` (Fujifilm simulations).
- **Photo-app tools II**: `skyenhancer`, `autolocaltone`, `clearview`, `luminarlooks`, `microcontrast`, `sharpenvariants`, `skinuniform`, `colorzones`, `rotatecolors`, `colorexchange`, `invertvariants`, `monomixer`, `stretchhsv`, `sunrays`, `metallicfoil`, `inkprint`, `textile`, `blockbuild`, `papercutout`, `glyphart` and more.
- **Texture nodes**: `procnoise2` (Worley, Gabor, wavelet, curl, flow, domain warp, ridged…), `matgen` (wood, brick, tile, weave, leather, hex…), `texwarp`, `normblend2` (RNM/UDN/whiteout), `histnodes`, `matmasks` (dirt, rust, moss, height blend), `colortomask`, `embossgloss`, `shapeglow`.

Browser self-test: `await window.__nexusTestAsync()` (progress in `window.__nexusProgress`).
- **After Effects / Core Image / Resolve**: `ae_*` (Colorama, toners, keyers, mattes, Turbulent Displace, CC Bend/Glass/Plastic, tiles, light sweeps…), `ci_*` (Core Image distortions, 17 symmetry tilings, gloom, edge work, height fields, lights, photo effects), `rs_*`/`fu_*` (lift-gamma-gain, printer lights, colour compressor, lens reflections, prism blur, patch replacer, film look).
- **Restoration & frequency II**: `demosaic` (10 algorithms, Bayer round trip), `demosaic_xtrans`, `deconv_iter`, `inpaint` (Telea / Navier-Stokes), `dehalo`, `hazeline`, `moirefix`, `deblock`, `dering`, `seathru`, `specular_remove`, `rs_correct`, `vignette_correct`, `lens_undistort`; `blocktransform`, `dctquant`, `haarwavelet`, `pyramidview`, `steerpyr`, `contourlet`, `rieszpyr`, `waveletdenoise`.
- **Scalers & ITK II**: `saiscale`, `hqx`, `xbrz`, `mmpx`, `sabr`, `fsreasu`, `superxbr`, `nedi`, `icbi`, `pixelscale2`, `resamplekernel2`, `ssimscale`, `chromaupscale`; `itkdiffusion`, `patchdenoise`, `levelsetseg`, `confconnected`, `distxform`, `geodesicdist`, `leveling`, `convexhull`, `howe`, `kaze`, `loggabor`, `superpix2`.
- **Display & video II**: `crtshaders2` (14 RetroArch CRT ports), `crtpresent`, `ntscretro`, `lcdshaders`, `handheldcolor`, `dedither`, `adaptivesharpen`, `tonemaphdr` (BT.2390/2446a, libplacebo), `gamutmap`, `av1grain`, `h274grain`, plus `dotdiffusion`, `kimkautz`, `icam06`, `hablepiecewise`, `cam16ucs`.
- **Darkroom & PaintShop Pro**: `altprocess2` (albumen, ambrotype, carbon, kallitype, chrysotype, ziatype, anthotype, gold/copper toning), `darkroomfx` (Sabattier, bromoil, mordançage, photogram, Polaroid transfer), `labprocess` (ENR, CCE, push, expired, K1S1), `vintagecamera`, `filmdusthair`, `psp_texture`, `psp_geometric`, `psp_reflect`, `psp_bubbles`, `psp_bevel3d`, `psp_vintage`.
- **ReShade, app tools & retro III**: `lumasharpen`, `sweetfx_color`, `ambientlight`, `nfaa`, `depthfx_reshade`, `ssdo`, `cinematicdof`; `erasepaper`, `normaladjust`, `finecontrast`, `diffractioncorr`, `volumedeform`, `app_glowlooks`, `buzsim`, `layerstyle`, `visualizespots`; `retro_bitdepth`, `retro_adaptpal` (Atari ST/STE, Amiga OCS/EHB), `mode7`, `retro_texfilter` (N64 3-point), `retro_devices` (LED, e-ink, Game Boy Camera), `retro_print` (thermal, fax, dot-matrix, mimeograph, ditto).
- **ImageMagick / textbook / FFmpeg**: `mg_statistic`, `mg_morph`, `mg_blurkernels`, `mg_pointops`, `mg_raise`, `mg_arccylinder`, `mg_controlwarp`, `mg_sparsecolor`, `mg_noise`; `tb_slicing`, `tb_piecewise`, `tb_colorslice`, `tb_sharpen` (highboost, Ramponi), `tb_median` (hybrid/truncated/adaptive), `tb_edgesmooth` (Nagao, Tomita-Tsuji, KNN…), `tb_eaw`, `tb_bilateralgrid`, `tb_dizenzo`, `tb_gist`; `vf_chromanr`, `vf_pp7`, `vf_hqdn3d`, `vf_removegrain`, `vf_delogo`, `vf_ciescope`, `vf_v360`, `vf_avssharp` (LSFmod, SeeSaw, FineSharp), `vf_avslines`.
- **Science & terrain II**: `rgbindex2` (12 more RGB indices), `ghs` (Generalized Hyperbolic Stretch), `lumamasks`, `acdnr`, `enhspeckle` (Enhanced Lee/Frost), `darkstructure`, `rangemask`, `bataineh`, `unpurple`; terrain `rrim`, `lrm`, `vrm`, `convergence`, `woodfeatures`, `geomorphons`, `devmean`, `d8dir`, `tanaka`, `heteroterrain`.
- **App looks & colour science II**: `ig_stories`, `vsco_presets`, `gphotos_filters` (look approximations), `colorspace3` (xyY, CIECAM02, HSLuv, Okhsv/Okhsl, TSL, YDbDr, PhotoYCC, HWB, HCY), `chromasub`, `colorcontrast`, `rgbprimaries`, `basecurve` (darktable presets).
- **Scientific colormaps (exact)**: `cmap_mpl` (23 matplotlib), `cmap_cmocean` (21), `cmap_crameri` (21) + `cmap_crameri_div` (18 diverging/cyclic), `cmap_colorcet`, `cmap_cmasher` (10), `cmap_colorbrewer` (20, smooth or exact n-class), `cmap_glasbey`. Tables are fitted from the real packages by `research/gen_colormaps.py` (mean error 0.24 of 8-bit levels). Prefer these over the older approximate `colormap`.
- **Nik Collection & Apple styles**: `nik_colorfilters`, `nik_colortools`, `nik_contrast` (Detail Extractor, Pro Contrast, High/Low Key…), `nik_selectivetones`, `nik_moods`, `nik_filmefex`, `nik_darkenlighten`, `nik_vignetteblur`, `nik_skinsoftener`, `nik_multilens`, `apple_photostyles` (approximations from the published control descriptions).
- **Noise, game post, optics & projections**: `procnoise3`, `newsongrain`, `sensorpattern`, `panini`, `smhwheels`, `localexposure`, `ssr`, `ssgi`, `kawaseblur`, `dualkawase`, `circulardof`, `drt` (OpenDRT/TCAM look), `advancedblur`, `gridelastic`, `hestain`, `policyaug` (RandAugment/TrivialAugment/AutoAugment/AugMix), `kornia_illum`, `snowylandscape`, `alphablendmask`, `opticbokeh` (Lensbaby, Petzval swirl, cat's-eye, onion-ring, STF…), `promist`, `splitdiopter`, `airyblur`, `stackblur`, `sensordust`, `mobius`, `mapproj` (7 map projections), `ipm`, `logpolar`, `mustache`, `gravlens`, `flutedglass`, `frames2`, `letterbox`.
- **Nuke / Blender / GEGL / G'MIC / darktable / NPR**: `nk_*` (Glint, EdgeBlur, Log2Lin, Toe, HueCorrect), `bl_*` (Glare, box sharpen, SMAA/FXAA, Rh tone map), `gegl_*` (Alien Map, Color Enhance, Predator, c2g/STRESS, assimilation grid), `gm_*` (Contrast Swiss, Graphic Boost, Blockism, Steiner tile, Pen Drawing, Aurora, Chalk It Up, Metallic, Kitaoka), `dt_*`/`rt_*` (colour reconstruction, profiled denoise, inpaint-opposed, log encoding, line noise), `demosaic_igv`, `akuwahara`, `tam_hatch`, `notebook_draw`, `shade_npr` (Gooch/Oren-Nayar/Cook-Torrance), `ostro_screen`, `km_mix` (Kubelka-Munk).
- **Parallel builders (q01–q26)**: ids prefixed `q01_` … `q26_` come from the 30-builder sweep of rounds 11–14 (e.g. `q09_vsco_*`, `q09_mscn`, `q09_s3_sharpness`, `q09_jnb`).
- **Science imaging**: `rollingball` (ImageJ Subtract Background), `flatfield` (flat-field / homomorphic), `stainsep` (H&E / DAB colour deconvolution), `vegindex` (VARI, ExG, GLI, TGI, CIVE…), `astrostretch` (arcsinh / STF), `scnr`, `starmask` (mask, reduction, starless), `larsonsekanina`, `whiteboard` (document cleanup).
- **Augmentation** (albumentations / imgaug equivalents, names are in the DB): `channeldropout`, `multnoise`, `planckian`, `fancypca`, `plasma`, `randomshadow`, `gravel`, `spatter`, `ringing`, `elastic`, `griddistort`, `piecewiseaffine`, `dropout`, `illumination`, plus `noise`, `fog`, `rainsnow`, `lensflare`, `slic`, `frosted`… — `python cli/nexus.py list --search GaussNoise` finds the match.

## Adding a filter

1. Add `f('id','Name',[params],`GLSL body`,'note')` to `index.html` under its family. The body is the inside of `vec4 F(vec2 uv)`; `c = T(uv)`, params are `u_p0..u_p3`, helpers are in `HEADER`. Multi-pass: pass an array of bodies (`u_tex` = previous pass, `u_orig` = filter input).
2. `node cli/export_shaders.mjs` then `python cli/nexus.py selftest`.
3. Map app names in `research/build_db.py` (`ENGINE_ALIASES`), run `python research/build_db.py` and `python research/gen_aliases.py`.
4. Test the page in a browser (WebGL is stricter than desktop GL), then republish the Artifact.

## Layout

- `index.html`: app + all shaders (single source of truth)
- `cli/`: `nexus.py`, `export_shaders.mjs`, `nexus_shaders.json`
- `filters.db`, `filters.json`: the name database
- `research/`: scrapers, raw name lists, `literature.py`, `build_db.py`, generators (`gen_instagram.py`, `gen_aliases.py`)
- `depth/`, `ort/`: Depth Anything V2 model (split) and ONNX runtime wasm for the web app

## Thumbnails (baked)
The library grid shows pre-rendered thumbnails from `thumbs/s0..sN.webp` (16x8 tiles of 150x100, each filter's
default look on the sample scene), so the page never compiles shaders just to draw the grid. Filters added after the
last bake render live when scrolled into view. To re-bake after adding filters:
1. `python research/thumbserve.py 8767` (static server that accepts the uploads)
2. open http://localhost:8767/index.html and run `window.__nexusBake()` in the console (progress: `__nexusBakeP`)
3. `python research/gen_thumbmap.py` (injects thumbs/index.json into index.html), then publish with the thumbs/*.webp files.

## License
Noncommercial use only: [PolyForm Noncommercial 1.0.0](LICENSE.md). Parts ported from other projects keep their
original licences; see [THIRD_PARTY.md](THIRD_PARTY.md).
