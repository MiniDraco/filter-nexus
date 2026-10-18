"""Round 19 raw candidates (input to dedupe19.py --build).

Verification-first round: every block below was read first-hand from the URL in its header comment
(menu source code, docs page, API reference, shader catalogue or preset file fetched during the harvest).
(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames.
"""
C = []
DROP = set()

# --- RetroArch slang-shaders: categories not read in round 12 (border/, dithering/, gpu/, pal/, cel/, vhs/,
# subframe-bfi/, deinterlacing/, edge-smoothing/xsoft|xsal|vectorscale) ------------------------------------------
# Tree https://api.github.com/repos/libretro/slang-shaders/git/trees/master?recursive=1 ; each preset and its shader
# header comments read from https://raw.githubusercontent.com/libretro/slang-shaders/master/<dir>/<preset>.slangp and
# .../<dir>/shaders/<shader>.slang
S_ = 'RetroArch slang-shaders 2'
C += [
    ('Average-colour border fill from cropped edge strips (slang average_fill)', S_, 'Frames', 'S'),
    ('Pixel-art vectorisation via similarity graph and energy-optimised cells (slang vectorscale)', S_, 'Retro', 'G'),
    ('4xSoft soft pixel-art scaler (guest.r, slang 4xsoft)', S_, 'Retro', 'S'),
    ('2xSaL pixel-art scaler (guest.r, slang 2xsal)', S_, 'Retro', 'S'),
    ('LeiFX 3dfx Voodoo 16-bit dither and reduction filter (slang 3dfx_4x1)', S_, 'Retro', 'S'),
    ('PowerVR2 Dreamcast RGB565 frame-buffer dither (slang powervr2)', S_, 'Retro', 'S'),
    ('NES PAL composite signal simulation (r57shell, slang pal-r57shell)', S_, 'Retro', 'S'),
    ('Blur Busters CRT beam simulator BFI (slang crt-beam-simulator)', S_, 'Retro', 'X'),
    ('Adaptive strobe black-frame insertion (slang adaptive_strobe-koko)', S_, 'Retro', 'X'),
    ('Re-interlacing into alternating fields (slang reinterlacing)', S_, 'Retro', 'X'),
    ("MMJ's cel shader (slang MMJ_Cel_Shader)", S_, 'Stylize', 'S'),
    ('Advanced Cartoon shader with black-border sensitivity (guest.r, slang advcartoon)', S_, 'Stylize', 'S'),
]

# --- vvvv gamma VL.Stride TextureFX library ------------------------------------------------------------------------
# Tree https://api.github.com/repos/vvvv/VL.StandardLibs/git/trees/main?recursive=1 ; [Summary]/[Tags] attributes read from
# https://raw.githubusercontent.com/vvvv/VL.StandardLibs/main/VL.Stride.TextureFX/shaders/<group>/<name>_TextureFX.sdsl
S_ = 'vvvv TextureFX'
C += [
    ('UV dilation into empty texels for position/normal maps (vvvv UVDilate)', S_, 'Materials', 'S'),
    ('Liquish liquid-noise texture (vvvv Liquish)', S_, 'Render', 'S'),
    ('Drippy smear blend between two images (vvvv Blood mixer)', S_, 'Frames', 'X'),
    ('BlurPerfector detail-preserving noise-reduction blur (vvvv)', S_, 'Blur', 'S'),
]

# --- Nukepedia gizmo catalogue (Foundry Nuke community tools) ----------------------------------------------------------
# Category pages https://www.nukepedia.com/gizmos/filter , https://www.nukepedia.com/tools/gizmos/colour/ ,
# https://www.nukepedia.com/tools/gizmos/draw/ , https://www.nukepedia.com/tools/gizmos/image/ (name + author's description)
S_ = 'Nukepedia gizmos'
C += [
    ('Tracking-marker fill keeping surface detail (Nukepedia aeFiller)', S_, 'Repair', 'G'),
    ('Custom-falloff blur from a drawn curve (Nukepedia BlurCurve)', S_, 'Blur', 'S'),
    ('Comparative grain from denoised vs original plate (Nukepedia ComparativeGrain)', S_, 'Film', 'X'),
    ('Stable hand-painted outline drawing (Nukepedia DL_DrawLines)', S_, 'Stylize', 'S'),
    ('Edge scatter blending an image along a matte edge (Nukepedia EdgeScatter)', S_, 'Stylize', 'S'),
    ('Fibonacci-radius glow stack (Nukepedia eFibonacciGlow)', S_, 'Stylize', 'S'),
    ('Fractal blur organic gradient breakup (Nukepedia Fractal Blur)', S_, 'Blur', 'S'),
    ('Sharpen in log colour space (Nukepedia Log_Sharpen)', S_, 'Sharpen', 'S'),
    ('4:2:2 chroma jaggy fix (Nukepedia HS_422Chromafix / ProRes 422 filter)', S_, 'Repair', 'S'),
    ('Directional detail removal (Nukepedia ZipBlur)', S_, 'Blur', 'S'),
    ('Inverse-square-law glow (Nukepedia PhysX Glow)', S_, 'Stylize', 'S'),
    ('ARRI Alexa sensor grain simulation (Nukepedia Grain_ARRI_Alexa / AlexaGrain)', S_, 'Film', 'S'),
    ('Distant bloom on far CG edges by depth (Nukepedia Distant Bloom)', S_, 'Depth', 'S'),
    ('Lighting shades stylizer texturing lit areas (Nukepedia)', S_, 'Stylize', 'S'),
    ('Four-corner gradient clean-up patch from border samples (Nukepedia Retouch Patch / jm_cleanPatchGen)', S_, 'Repair', 'G'),
    ('Biased saturation toward a chosen colour (Nukepedia biasedSaturation)', S_, 'Color', 'S'),
    ('CrankIt colour boost for keying (Nukepedia)', S_, 'Color', 'S'),
    ('Day-to-night conversion (Nukepedia Day2Night)', S_, 'Tone', 'S'),
    ('Hue transfer swapping HSV hue with the background (Nukepedia HueTransfer)', S_, 'Color', 'X'),
    ('Pingle highlight detail for clipped plates (Nukepedia pingle)', S_, 'Repair', 'S'),
    ('Smoosh colours: bleed background hue/saturation into foreground edges (Nukepedia Smoosh_Colours)', S_, 'Color', 'X'),
    ('Grade in CIE Yxy (Nukepedia SR_YxyGrade)', S_, 'Color', 'S'),
    ('Voronoi gradient from arbitrary colour samples (Nukepedia Voronoi Gradient)', S_, 'Render', 'G'),
    ('Bokeh Builder grungy bokeh kernel shapes (Nukepedia)', S_, 'Blur', 'S'),
    ('Dissipation effect (Nukepedia Dissipation)', S_, 'Stylize', 'S'),
    ('Gradient analyzer: strokes perpendicular to gradients (Nukepedia jm_gradientAnalyzer)', S_, 'Analysis', 'S'),
    ('Steel wool burning sparks (Nukepedia T_SteelWool)', S_, 'Render', 'S'),
    ('Tree gobo dappled lighting (Nukepedia Tree_Gobo)', S_, 'Render', 'S'),
    ('2D water simulation on a height field (Nukepedia Flow)', S_, 'Render', 'X'),
    ('Alpha-driven prism light split into a rainbow (Nukepedia C_Prisming)', S_, 'Stylize', 'S'),
    ('Digital still camera exposure model (Nukepedia)', S_, 'Tone', 'S'),
    ('Directional displace by HSV angle/intensity map (Nukepedia Directional Displace)', S_, 'Distort', 'S'),
    ('HDRI bloom extraction (Nukepedia HDRIBloomExtract)', S_, 'Tone', 'S'),
    ('Light-off: remove highlights and flatten sunny scenes (Nukepedia MM_LightOff)', S_, 'Tone', 'S'),
    ('Perlin gain function contrast (Nukepedia Perlin Gain)', S_, 'Tone', 'S'),
    ('Voronoi texture extractor: crop, tile and scatter a patch (Nukepedia VoronoiTextureExtractor)', S_, 'Materials', 'S'),
    ('Edge mirror padding in all directions (Nukepedia EdgeMirror)', S_, 'Frames', 'S'),
    ('Edge push: stretch last edge pixels outward (Nukepedia Edgepush / JK_EdgeSpread)', S_, 'Repair', 'S'),
    ('Glitchy hologram (Nukepedia MR_Glitchy_Hologram)', S_, 'Stylize', 'S'),
    ('Comic action lines (Nukepedia ActionLines)', S_, 'Render', 'S'),
]

# --- Nukepedia, second pass: gizmos/other, gizmos/transform and BlinkScript categories ---------------------------------
# https://www.nukepedia.com/tools/gizmos/other/ , https://www.nukepedia.com/tools/gizmos/transform/ ,
# https://nukepedia.com/tools/blink/filter/ , .../blink/colour/ , .../blink/draw/ , .../blink/image/ , .../blink/transform/
S_ = 'Nukepedia gizmos'
C += [
    ('Beer-Lambert underwater light attenuation (Nukepedia)', S_, 'Tone', 'S'),
    ('Directional wrinkle removal for de-aging (Nukepedia Directional_wrinkle_remove)', S_, 'Repair', 'S'),
    ('Paper-style stylised outlines (Nukepedia BAB_PaperOutlines)', S_, 'Stylize', 'S'),
    ('Twitch random position/colour/blur jolts (Nukepedia VC Twitch)', S_, 'Stylize', 'S'),
    ('Dominant-colour palette overlay (Nukepedia Color Analyzer)', S_, 'Analysis', 'G'),
    ('Antialiasing recovery after filtering (Nukepedia Blink)', S_, 'Repair', 'G'),
    ('Anamorphic lens astigmatism (Nukepedia mt Anamorphic Astigmatism)', S_, 'Blur', 'S'),
    ('Spherical HDR panorama blur (Nukepedia EnvironmentBlur)', S_, 'Blur', 'S'),
    ('LULU-operator edge-preserving smoothing (Nukepedia LULU Flow)', S_, 'Blur', 'G'),
    ('3D LUT inversion from a CMS test-pattern image (Nukepedia LUTInvert)', S_, 'Color', 'G'),
    ('Gyroid noise (Nukepedia WorleyNoise modes)', S_, 'Noise', 'S'),
]

# --- Fusion Reactor (We Suck Less) atom catalogue ----------------------------------------------------------------------
# Atom list https://gitlab.com/api/v4/projects/WeSuckLess%2FReactor/repository/tree?path=Atoms ; each atom's Category and
# Description read from https://gitlab.com/WeSuckLess/Reactor/-/raw/master/Atoms/<atom>/<atom>.atom
S_ = 'Fusion Reactor atoms'
C += [
    ('Elliptical blur with aspect and angle / squeezed zoom blur (Reactor EllipticalBlur)', S_, 'Blur', 'S'),
    ('Gradient match: procedural gradient fitted to a reference image (Reactor GradientMatch)', S_, 'Render', 'G'),
    ('Soft-knee chroma compressor for over-saturated pixels (Reactor ChromaCompress)', S_, 'Color', 'S'),
    ('Scanline intensity plot overlay (Reactor PlotScanline)', S_, 'Analysis', 'S'),
    ('Blocky fractal noise (Reactor MT_FractalBlocks)', S_, 'Noise', 'S'),
    ('Corona renderer highlight compression (Reactor TonemappingTools)', S_, 'Tone', 'S'),
    ('Fine Shine: HDRI reflections on a 2D element via bump (Reactor MT_Fine_Shine)', S_, 'Materials', 'S'),
    ('ReFill organic growth propagation from seed points (Reactor ReFill)', S_, 'Render', 'G'),
    ('Hum bar / ground-loop rolling interference band (Reactor MT_Glitch_HumBar / GroundLoop)', S_, 'Retro', 'S'),
    ('Vertical roll and slide sync loss (Reactor MT_Glitch_RollAndSlide)', S_, 'Retro', 'S'),
    ('Block pause frozen macroblocks (Reactor MT_Glitch_BlockPause)', S_, 'Retro', 'X'),
    ('Seam-free LatLong filtering with panoramic wrap (Reactor KartaVR BlurPanoramicWrap etc.)', S_, 'Blur', 'S'),
    ('Atmospheric haze blend of foreground into background (Reactor Haze, after Red Giant Supercomp)', S_, 'Depth', 'X'),
    ('Volume haze: background light spilling over a backlit foreground (Reactor VolumeHaze)', S_, 'Depth', 'X'),
]

# --- Leptonica (Dan Bloomberg) image-processing library ----------------------------------------------------------------
# Function list from https://raw.githubusercontent.com/DanBloomberg/leptonica/master/src/allheaders.h ; doc comments
# (\brief + Notes) read from https://raw.githubusercontent.com/DanBloomberg/leptonica/master/src/<file>.c (adaptmap, binarize,
# coloring, colorcontent, enhance, edge, pixconv, runlength, warper, pageseg, seedfill, scale2)
S_ = 'Leptonica'
C += [
    ('Tile-adaptive contrast normalisation to full range (Leptonica pixContrastNorm)', S_, 'Tone', 'G'),
    ('Threshold on double-normalised background (Leptonica pixThreshOnDoubleNorm)', S_, 'Repair', 'G'),
    ('Clean page background to white (Leptonica pixCleanBackgroundToWhite)', S_, 'Repair', 'G'),
    ('Auto photo-invert of light-on-dark text regions (Leptonica pixAutoPhotoinvert)', S_, 'Repair', 'G'),
    ('Hue-invariant saturation/brightness linear map (Leptonica pixMapWithInvariantHue)', S_, 'Color', 'S'),
    ('Piecewise-linear map of a source colour to a target colour (Leptonica pixLinearMapToTargetColor)', S_, 'Color', 'S'),
    ('Saturation-boosted max-component greyscale (Leptonica pixConvertRGBToGraySatBoost, Qumsiyeh)', S_, 'Color', 'S'),
    ('Darken low-saturation grey pixels (Leptonica pixDarkenGray)', S_, 'Color', 'S'),
    ('Colorize grey pixels only, keeping coloured ones (Leptonica pixColorGray)', S_, 'Color', 'S'),
    ('Two-sided edge filter, same-sign minimum difference (Leptonica pixTwoSidedEdgeFilter)', S_, 'Edges', 'S'),
    ('Run-length transform: pixel = length of its run (Leptonica pixRunlengthTransform)', S_, 'Analysis', 'G'),
    ('Quadratic vertical shear bending (Leptonica pixQuadraticVShear)', S_, 'Distort', 'S'),
    ('Random harmonic sinusoidal warp, captcha style (Leptonica pixRandomHarmonicWarp)', S_, 'Distort', 'S'),
    ('Quadratic red-channel stereoscopic bend (Leptonica pixWarpStereoscopic)', S_, 'Depth', 'S'),
    ('Linear / quadratic horizontal stretch toward one edge (Leptonica pixStretchHorizontal)', S_, 'Distort', 'S'),
    ('Cascaded 2x rank reductions (Leptonica pixScaleGrayRankCascade)', S_, 'Analysis', 'S'),
    ('Fill holes up to the bounding rectangle (Leptonica pixFillHolesToBoundingRect)', S_, 'Analysis', 'G'),
    ('Binarize, edge-clean and crop a page image (Leptonica pixCropImage)', S_, 'Repair', 'G'),
]

# --- Seti Astro Suite Pro (astrophotography) ---------------------------------------------------------------------------
# Tree https://api.github.com/repos/setiastro/setiastrosuitepro/git/trees/main?recursive=1 ; tool docs read from
# https://raw.githubusercontent.com/setiastro/setiastrosuitepro/main/src/setiastro/saspro/docs/<tool>.html and module headers
# from .../src/setiastro/saspro/<module>.py
S_ = 'Seti Astro Suite Pro'
C += [
    ('Star Stretch fixed-shape star-safe non-linear stretch (Seti Astro)', S_, 'Tone', 'S'),
    ('Selective luminance-band correction with anchored S-curve (Seti Astro Selective Luma)', S_, 'Tone', 'S'),
    ('Narrowband palette picker: 18 Ha/OIII/SII palette mappings (Seti Astro Perfect Palette Picker)', S_, 'Color', 'X'),
    ('Narrowband normalisation of Ha/OIII/SII (Blanshan-Cranfield, Seti Astro)', S_, 'Color', 'X'),
    ('Continuum subtraction of broadband from narrowband (Seti Astro)', S_, 'Analysis', 'X'),
    ('Linear fit: scale channel medians to a common reference (Seti Astro)', S_, 'Color', 'G'),
    ('Remove pedestal per channel: minimum / low percentile / first non-zero (Seti Astro)', S_, 'Tone', 'G'),
    ('Galaxy isophote model and residual (Seti Astro GLIMR, Jedrzejewski 1987)', S_, 'Analysis', 'G'),
    ('Multiscale multiplicative-gradient correction of dust motes and reflections (Seti Astro ABE)', S_, 'Repair', 'G'),
]

# --- ArcGIS Pro raster functions -------------------------------------------------------------------------------------------
# https://doc.esri.com/en/arcgis-pro/latest/help/analysis/raster-functions/list-of-raster-functions.html (195 functions; only
# those not already in filters.db / rounds 9-18 kept)
S_ = 'ArcGIS Pro raster functions'
C += [
    ('Aspect-Slope bivariate colour map (ArcGIS Aspect-Slope)', S_, 'Terrain', 'S'),
    ('Nibble: replace masked cells with nearest unmasked value (ArcGIS Nibble)', S_, 'Repair', 'G'),
    ('Region pixel count: label each connected region with its size (ArcGIS Region Pixel Count)', S_, 'Analysis', 'G'),
    ('Expand / shrink selected zones by N cells (ArcGIS Expand, Shrink)', S_, 'Analysis', 'S'),
    ('Spectral conversion matrix: false-colour to pseudo natural colour (ArcGIS Spectral Conversion)', S_, 'Color', 'S'),
]

# --- Filter Forge library: Snippets categories (never read before) -------------------------------------------------------
# Listing pages https://www.filterforge.com/filters/category50-page1..5.html (Effects > Snippets),
# category49-page1..8.html (Textures > Snippets), category55-page1..3.html (Textures > Frames)
S_ = 'Filter Forge library 6 (snippets)'
C += [
    ('Edge detector from an ambient-occlusion map (Filter Forge snippet)', S_, 'Edges', 'S'),
    ('Worley-noise distortion (Filter Forge snippet)', S_, 'Distort', 'S'),
    ('Variable pixelation by a control map (Filter Forge snippet)', S_, 'Stylize', 'S'),
    ('Escher tiles (Filter Forge snippet)', S_, 'Stylize', 'S'),
]

# --- GIMP Plugin Registry (registry.gimp.org static mirror) -----------------------------------------------------------------
# Tree https://api.github.com/repos/surh/registry.gimp.org_static/git/trees/master?recursive=1 ; menu labels and blurbs
# read from the script-fu-register / register() / gimp_install_procedure calls in every .scm/.py/.c file under
# https://raw.githubusercontent.com/surh/registry.gimp.org_static/master/registry.gimp.org/files/<script>
S_ = 'GIMP Plugin Registry'
C += [
    ('Movie 300 colour look (GIMP registry elsamuko-movie-300)', S_, 'Color', 'S'),
    ('Rainy landscape after-rain effect (GIMP registry elsamuko-rainy-landscape)', S_, 'Tone', 'S'),
    ('FlipCells: flip each grid cell (GIMP registry flipcells)', S_, 'Distort', 'S'),
    ('Remove camera date timestamp (GIMP registry remove_timestamp)', S_, 'Repair', 'G'),
    ('Shadow Glow: replace shadows with glowing areas (GIMP registry sf-will-glow)', S_, 'Stylize', 'S'),
    ('Manny Librodo sharpening (GIMP registry sharpen-librodo)', S_, 'Sharpen', 'S'),
    ('Reveal yellow printer tracking dots (GIMP registry showyellowtrackingdots)', S_, 'Analysis', 'S'),
    ('Mirror frame outside the image mirroring its content (GIMP registry mirrored-frame)', S_, 'Frames', 'S'),
    ('Skin check: blue-channel monochrome view of skin imperfections (GIMP registry patdavid)', S_, 'Analysis', 'S'),
    ('Split sharpening into separate lighten and darken passes (GIMP registry split-sharpening)', S_, 'Sharpen', 'S'),
    ('Divide scanned images: isolate several photos from one scan (GIMP registry DivideScannedImages)', S_, 'Repair', 'G'),
    ('Offset every other row/column of tiles, brick style (GIMP registry Offset by froGgy)', S_, 'Distort', 'S'),
]

# --- utility-dctls (Thatcher Freeman) DaVinci Resolve DCTL / Fuse collection ----------------------------------------------
# README with one paragraph per tool: https://raw.githubusercontent.com/thatcherfreeman/utility-dctls/main/README.md
S_ = 'utility-dctls (DaVinci Resolve DCTL)'
C += [
    ('Daniele Siragusano tone curve (utility-dctls Daniele Curve)', S_, 'Tone', 'S'),
    ('Spectral dye-density simulator from CMY bell curves (utility-dctls Dye Simulator)', S_, 'Film', 'S'),
    ('Lens field-curvature edge defocus (utility-dctls Field Curvature)', S_, 'Blur', 'S'),
    ('Film characteristic curve: log exposure to density to transmittance (utility-dctls Film Curve)', S_, 'Film', 'S'),
    ('Fixed signal-to-noise-ratio noise (utility-dctls Fixed SNR Noise)', S_, 'Noise', 'S'),
    ('Linear edge blur growing toward frame edges (utility-dctls)', S_, 'Blur', 'S'),
    ('Five-band MTF curve contrast control (utility-dctls MTF Curve)', S_, 'Sharpen', 'S'),
    ('Protected tone mapping: identity below a threshold, roll-off above (utility-dctls)', S_, 'Tone', 'S'),
    ('Arri timing-shift asymmetric streaks (utility-dctls Timeshift Streaks)', S_, 'Film', 'S'),
    ('Linear contrast: per-channel power pivoting on 0.18 grey (utility-dctls Linear Contrast)', S_, 'Tone', 'S'),
    ('True bit-depth estimator map (utility-dctls Bit Depth Estimator)', S_, 'Analysis', 'G'),
    ('Spherical / cylindrical RGB colour model conversion (utility-dctls)', S_, 'Color', 'S'),
    ('Exposure strips at one-stop increments (utility-dctls Exposure Strips)', S_, 'Analysis', 'S'),
    ('Line scope: waveform of pixels sampled along a drawn line (utility-dctls Line Scopes)', S_, 'Analysis', 'G'),
    ('Softmax colour with temperature (utility-dctls Softmax)', S_, 'Color', 'S'),
    ('Root-polynomial degree-2 colour correction matrix (utility-dctls)', S_, 'Color', 'S'),
    ('Small-screen size simulator (utility-dctls Screen Size Simulator)', S_, 'Analysis', 'S'),
    ('Local SNR map (utility-dctls SNR Checker)', S_, 'Analysis', 'S'),
    ('Polynomial / sigmoid channel-product kernel colour mix (utility-dctls Polynomial Kernel)', S_, 'Color', 'S'),
]

# --- Jed Smith open-display-transform / nuke-colortools; Paul Dore (baldavenger) DCTLs -------------------------------------
# Trees https://api.github.com/repos/jedypod/open-display-transform/git/trees/main?recursive=1 ,
# https://api.github.com/repos/jedypod/nuke-colortools/git/trees/master?recursive=1 ,
# https://api.github.com/repos/baldavenger/DCTLs/git/trees/master?recursive=1 ; header comments read from
# https://raw.githubusercontent.com/jedypod/open-display-transform/main/look-transforms/tools/resolve/<tool>.dctl ,
# .../display-transforms/<name>/<name>.dctl and https://raw.githubusercontent.com/baldavenger/DCTLs/master/<path>.dctl
S_ = 'Colour-science DCTL / Nuke toolsets (Jed Smith, Paul Dore)'
C += [
    ('Hue contrast: compress or expand hues toward primary vectors (Jed Smith HueContrast)', S_, 'Color', 'S'),
    ('Midtone contrast with linear toe and shoulder (Jed Smith MidtoneContrast)', S_, 'Tone', 'S'),
    ('Helmholtz-Kohlrausch compensation, Nayatani 1997 (Jed Smith Nayatani_HK)', S_, 'Color', 'S'),
    ('Purity: weighted-sum chroma purity control (Jed Smith Purity)', S_, 'Color', 'S'),
    ('JzDT display transform: JzAzBz chroma compression + Michaelis-Menten tonescale (Jed Smith)', S_, 'Tone', 'S'),
    ('Tesseract view transform (Jed Smith)', S_, 'Tone', 'S'),
    ('Chromagnon view transform (Jed Smith)', S_, 'Tone', 'S'),
    ('Hill-Langmuir tonemap (Jed Smith nuke-colortools Tonemap_HillLangmuir)', S_, 'Tone', 'S'),
    ('PowerP sigmoid tonemap (Jed Smith nuke-colortools Tonemap_PowerP_Sigmoid)', S_, 'Tone', 'S'),
    ('darktable UCS 22 colour space (nuke-colortools Colorspace_DarktableUCS)', S_, 'Color', 'S'),
    ('IgPgTg colour space (nuke-colortools ColorSpace_IgPgTg)', S_, 'Color', 'S'),
    ('Improved HLS colour space (nuke-colortools ColorSpace_ImprovedHLS)', S_, 'Color', 'S'),
    ('RLAB colour space (nuke-colortools ColorSpace_RLab)', S_, 'Color', 'S'),
    ('FilmLight T-Lab colour space (nuke-colortools Colorspace_Filmlight_tLab)', S_, 'Color', 'S'),
    ('ACES RRT sweeteners: glow module, red modifier, global desaturation (nuke-colortools)', S_, 'Color', 'S'),
    ('ARRI film matrix add / remove on LogC AWG (baldavenger Film_Matrix_Add)', S_, 'Film', 'S'),
    ('Hue median filter (baldavenger HueMedian)', S_, 'Repair', 'S'),
    ('Median filter on Lab a/b channels only (baldavenger Median_LAB)', S_, 'Repair', 'S'),
]

# --- Other DaVinci Resolve DCTL collections on GitHub -----------------------------------------------------------------------
# Repo trees via https://api.github.com/repos/<repo>/git/trees/<branch>?recursive=1 for xtremestuff/resolve-dctl,
# MoazElgabry/DCTLs, mitkunz/resolve_DCTLs, cegaton/DCTLs-for-DaVinci-Resolve, Demystify-Color/DCTLs; header comments and
# DEFINE_UI_PARAMS labels read from https://raw.githubusercontent.com/<repo>/<branch>/<file>.dctl
S_ = 'DaVinci Resolve DCTL collections'
C += [
    ('Per-channel saturation with upper/lower luma thresholds (xtremestuff Channel-Saturation DCTL)', S_, 'Color', 'S'),
    ('Ratio shaper: key/fill exposure lighting-ratio control (Moaz Elgabry Ratio Shaper DCTL)', S_, 'Tone', 'S'),
    ('Oklab saturation matte (Moaz Elgabry Sat_Matte DCTL)', S_, 'Analysis', 'S'),
    ('Film saturation emulation in log (Tims-Film-Saturation-Emulation DCTL)', S_, 'Color', 'S'),
    ('Restore red channel from cyan residual (cegaton Restore Red Channel DCTL)', S_, 'Repair', 'S'),
    ('Per-channel flare black-lift compensation (Demystify Color DMC_Primal DCTL)', S_, 'Tone', 'S'),
]

# --- purzOS OFX (purzbeats) analog / glitch suite ---------------------------------------------------------------------------
# README table "Plugin | What it does": https://raw.githubusercontent.com/purzbeats/purzos-ofx/main/README.md
S_ = 'purzOS OFX'
C += [
    ('Luma ring: band-limited luma with detail-knob ringing halos (purzOS Luma Ring)', S_, 'Retro', 'S'),
    ('RF multipath ghost echoes (purzOS Ghost)', S_, 'Retro', 'S'),
    ('Rainbow phase: subcarrier hue drift and cross-colour rainbows (purzOS Rainbow Phase)', S_, 'Retro', 'S'),
    ('Tape wow and scanline flutter with head-switch skew (purzOS Tape Wow)', S_, 'Retro', 'S'),
    ('Sync drift: h-hold diagonal shear, top flagging, vertical roll (purzOS Sync Drift)', S_, 'Retro', 'S'),
    ('Phosphor melt: bright pixels burn in and drip colour trails (purzOS Phosphor Melt)', S_, 'Retro', 'S'),
    ('Line stutter: horizontal bands repeat, hold and shear (purzOS Line Stutter)', S_, 'Retro', 'S'),
    ('VHS head-switching torn band at frame bottom (purzOS Head Switch)', S_, 'Retro', 'S'),
    ('VHS tracking-noise bar drifting vertically (purzOS Tracking Bar)', S_, 'Retro', 'S'),
    ('VHS colour-under chroma speckle pooling in shadows (purzOS Color Under)', S_, 'Retro', 'S'),
    ('Tape dropout dashes riding the scanlines (purzOS Dropout / Bad Signal)', S_, 'Retro', 'S'),
]
S_ = 'DaVinci Resolve DCTL collections'
C += [
    # https://raw.githubusercontent.com/JuanPabloZambrano/DCTL/<branch>/JP-ConicalCoordinate.dctl (header comment)
    ('Conical-coordinate saturation (Juan Pablo Zambrano JP-ConicalCoordinate DCTL)', S_, 'Color', 'S'),
]

# --- 3D Common Corruptions (EPFL VILAB, Kar et al. 2022) ---------------------------------------------------------------------
# README https://raw.githubusercontent.com/EPFL-VILAB/3DCommonCorruptions/main/README.md (create_flash.py, 3D motion blur)
S_ = '3D Common Corruptions'
C += [
    ('Depth-aware camera flash illumination falloff (3DCC Flash)', S_, 'Depth', 'G'),
    ('Depth-parallax 3D camera motion blur (3DCC motion_blur_3d)', S_, 'Depth', 'G'),
]

# --- SC Post Effects (Staggart Creations, Unity) ------------------------------------------------------------------------------
# Effect list from the documentation table of contents https://staggart.xyz/unity/sc-post-effects/scpe-docs/
S_ = 'SC Post Effects (Unity)'
C += [
    ('Cloud shadows: scrolling cloud-shadow texture over the scene (SC Post Effects)', S_, 'Render', 'S'),
    ('Double vision: offset doubled image blur (SC Post Effects)', S_, 'Blur', 'S'),
]

# --- Siril community scripts repository -----------------------------------------------------------------------------------------
# Tree https://gitlab.com/api/v4/projects/free-astro%2Fsiril-scripts/repository/tree?recursive=true ; script headers read from
# https://gitlab.com/free-astro/siril-scripts/-/raw/main/<folder>/<script>
S_ = 'Siril community scripts'
C += [
    ('Nox: plate-theory elastic-membrane gradient reduction (VeraLux Nox)', S_, 'Repair', 'G'),
    ('StarComposer star reconstruction onto a starless image (VeraLux StarComposer)', S_, 'Tone', 'X'),
    ('Aster star glow for stars-only layers (Siril script)', S_, 'Stylize', 'S'),
    ('DBXtract: SII / Ha / OIII extraction from dual-band OSC data (Siril script)', S_, 'Color', 'G'),
    ('Fix misshapen (elongated) stars (Siril DSA script)', S_, 'Repair', 'G'),
    ('HubbleMatic faux Hubble palette from one-shot-colour data (Siril DSA script)', S_, 'Color', 'S'),
    ('Satellite trail removal (Siril script)', S_, 'Repair', 'G'),
    ('Background gradient heat-map from tiled sigma-clipped medians (Svenesis Gradient Analyzer)', S_, 'Analysis', 'G'),
    ('Inverse-variance maximum-likelihood HDR blend of exposures (Siril HDR_Blender)', S_, 'Tone', 'X'),
]

# --- PixInsight community scripts (GitHub READMEs) ------------------------------------------------------------------------------
# https://raw.githubusercontent.com/DeepSkyWorkflows/DeepSkyWorkflowScripts/<branch>/README.md ,
# https://raw.githubusercontent.com/beshanoe/pixinsight-star-de-emphasizer/<branch>/README.md
S_ = 'PixInsight community scripts'
C += [
    ('Star trails / arcs synthesised from a single frame (DeepSkyWorkflows Star Trail Magic)', S_, 'Render', 'S'),
    ('Star de-emphasizer through a star-halo mask (Adam Block method, PixInsight script)', S_, 'Tone', 'X'),
]

# --- Nukepedia, third pass: gizmos/merge, gizmos/stereo, gizmos/keyer, gizmos/channel ------------------------------------------
# https://www.nukepedia.com/tools/gizmos/merge/ , .../stereo/ , .../keyer/ , .../channel/
S_ = 'Nukepedia gizmos'
C += [
    ('Luminosity / Shine blend modes, Krita style (Nukepedia BAB Merge Luminosity Shine)', S_, 'Color', 'X'),
    ('Cube key: select colours inside a 3D colour-space volume (Nukepedia cubeKey)', S_, 'Analysis', 'S'),
    ('Additive keying: add plate-minus-clean-plate detail back (Nukepedia AdditiveKeyer)', S_, 'Repair', 'X'),
    ('Chroma screen correction against an IBK clean plate (Nukepedia screenCorrect / JR_ScreenCorrection)', S_, 'Repair', 'X'),
    ('Tripod removal from 360 panoramas (Nukepedia ThreeSixty RigRemoval)', S_, 'Repair', 'G'),
]

# --- manual concept-duplicate drops (keyword review of every candidate against filters.db / rounds 9-18 names,
#     see research/wip notes; exact-name dedupe does not catch these) -----------------------------------------------------
DROP |= {
    'Average-colour border fill from cropped edge strips (slang average_fill)',      # = Border Average (db filter)
    'Edge push: stretch last edge pixels outward (Nukepedia Edgepush / JK_EdgeSpread)',  # = EdgeExtend (Nuke) alias
    'Comic action lines (Nukepedia ActionLines)',                                     # = Speedliner manga speed lines (Filter Forge)
    'Glitchy hologram (Nukepedia MR_Glitchy_Hologram)',                               # = Holomatrix II / HolographicTV
    'Additive keying: add plate-minus-clean-plate detail back (Nukepedia AdditiveKeyer)',  # = Clean-plate hair key (Natron lp_HairKey)
    'Chroma screen correction against an IBK clean plate (Nukepedia screenCorrect / JR_ScreenCorrection)',  # = Clean-plate screen evening (Natron lp_CleanScreen)
    'RF multipath ghost echoes (purzOS Ghost)',                                        # = Ghost (db filter)
    'Selective luminance-band correction with anchored S-curve (Seti Astro Selective Luma)',  # = Six-band luminance colour corrector (Matchbox)
    'Linear fit: scale channel medians to a common reference (Seti Astro)',           # = Siril linear_match
    'Restore red channel from cyan residual (cegaton Restore Red Channel DCTL)',      # = Underwater red-attenuation correction (Fred uwcorrect)
    'Five-band MTF curve contrast control (utility-dctls MTF Curve)',                 # = Five-band texture control (Matchbox ak_texturecontrol)
    'Star de-emphasizer through a star-halo mask (Adam Block method, PixInsight script)',  # = Show halo mask option
    'Star trails / arcs synthesised from a single frame (DeepSkyWorkflows Star Trail Magic)',  # = Star Trails (Huawei light painting)
    'Skin check: blue-channel monochrome view of skin imperfections (GIMP registry patdavid)',  # = Blue-only monitor check
    'Mirror frame outside the image mirroring its content (GIMP registry mirrored-frame)',  # = Frame [Mirror] (G'MIC)
}
DROP |= {
    'Dissipation effect (Nukepedia Dissipation)',   # catalogue description too vague to define a technique
    'Escher tiles (Filter Forge snippet)',          # no description on the listing; near Escher Cube tumbling blocks (Filter Forge)
}
