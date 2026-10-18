"""Round 17 raw candidates (input to dedupe17.py --build).

Verification-first round: every block below was read first-hand from the URL in its header comment
(menu source code, docs page, API reference or preset file fetched during the harvest).
(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames.
"""
C = []

# --- Pixelitor (Java image editor) filter NAME constants + menu builder ---------------------------------
# Read from https://raw.githubusercontent.com/lbalazscs/Pixelitor/master/src/main/java/pixelitor/menus/MenuBar.java
# and the filter sources https://raw.githubusercontent.com/lbalazscs/Pixelitor/master/src/main/java/pixelitor/filters/<Name>.java
S_ = 'Pixelitor filters'
C += [
    ('Abstract Lights (Pixelitor particle light-painting)', S_, 'Render', 'G'),
    ('Angular Waves (Pixelitor polar-coordinate waves)', S_, 'Distort', 'S'),
    ('Radial Waves (Pixelitor polar-coordinate waves)', S_, 'Distort', 'S'),
    ('Radial Mosaic (Pixelitor concentric Voronoi)', S_, 'Stylize', 'S'),
    ('Spheres (Pixelitor 3D-shaded circle fill)', S_, 'Stylize', 'G'),
    ('Flow Field (Pixelitor particle flow render)', S_, 'Render', 'G'),
    ('Circle Weave (Pixelitor curve render)', S_, 'Render', 'S'),
    ('Flower of Life (Pixelitor)', S_, 'Render', 'S'),
    ('Grid Kaleidoscope (Pixelitor)', S_, 'Distort', 'S'),
    ('L-Systems (Pixelitor curve render)', S_, 'Render', 'G'),
    ('Chaos Game fractal (Pixelitor)', S_, 'Render', 'G'),
    ('Brushed Metal (JH Labs / Pixelitor)', S_, 'Materials', 'S'),
]

# --- MVTec HALCON 23.11 operator reference -----------------------------------------------------------------
# Chapter lists read from https://www.mvtec.com/doc/halcon/2311/en/toc_filters_<chapter>.html and
# https://www.mvtec.com/doc/halcon/2311/en/toc_morphology_grayvalues.html ; each operator's description read from
# https://www.mvtec.com/doc/halcon/2311/en/<operator>.html
S_ = 'HALCON operators'
C += [
    ('Coherence-transport inpainting (HALCON inpainting_ct)', S_, 'Repair', 'G'),
    ('Mean-curvature-flow inpainting (HALCON inpainting_mcf)', S_, 'Repair', 'G'),
    ('Extremum-only smoothing (HALCON eliminate_min_max)', S_, 'Noise', 'S'),
    ('Dual rank filter (HALCON dual_rank)', S_, 'Analysis', 'S'),
    ('Grey-value skeleton (HALCON gray_skeleton)', S_, 'Analysis', 'G'),
    ('Topographic primal sketch (HALCON topographic_sketch)', S_, 'Analysis', 'S'),
    ('Dot enhancement filter (HALCON dots_image)', S_, 'Analysis', 'S'),
    ('Sojka corner detector (HALCON points_sojka)', S_, 'Edges', 'S'),
    ('Lepetit keypoints (HALCON points_lepetit)', S_, 'Edges', 'S'),
    ('Foerstner interest operator (HALCON points_foerstner)', S_, 'Edges', 'S'),
    ('Facet-model line extraction (HALCON lines_facet)', S_, 'Edges', 'S'),
    ('Separable median (HALCON median_separate)', S_, 'Noise', 'S'),
]

# --- Wolfram Language reference -----------------------------------------------------------------------------
# https://reference.wolfram.com/language/ref/ImageEffect.html ,
# https://reference.wolfram.com/language/guide/ImageFilteringAndNeighborhoodProcessing.html ,
# https://reference.wolfram.com/language/ref/HilbertFilter.html , https://reference.wolfram.com/language/ref/DifferentiatorFilter.html
S_ = 'Wolfram Language image functions'
C += [
    ('ColorTones effect (Wolfram ImageEffect)', S_, 'Color', 'S'),
    ('Hilbert filter (Wolfram HilbertFilter)', S_, 'Sensor', 'S'),
    ('Differentiator filter (Wolfram DifferentiatorFilter)', S_, 'Edges', 'S'),
]

# --- Apple Motion 6.4 filters (Motion User Guide) ------------------------------------------------------------
# Category lists read from https://support.apple.com/guide/motion/intro-to-distortion-filters-motn169f773a/mac ,
# .../intro-to-blur-filters-motn169f83ae/mac, .../intro-to-color-filters-motn169f968d/mac,
# .../intro-to-glow-filters-motn169f8b69/mac, .../intro-to-looks-filters-motn38530d7e/mac,
# .../intro-to-stylize-filters-motn169fd007/mac, .../intro-to-tiling-filters-motn169f84fd/mac,
# .../intro-to-time-filters-motn169fd8ae/mac ; each filter page read via its xRef link from those lists
S_ = 'Apple Motion filters'
C += [
    ('Black Hole (Apple Motion)', S_, 'Distort', 'S'),
    ('Disc Warp (Apple Motion)', S_, 'Distort', 'S'),
    ('Fun House mirror (Apple Motion)', S_, 'Distort', 'S'),
    ('Ring Lens (Apple Motion)', S_, 'Distort', 'S'),
    ('Target concentric bands (Apple Motion)', S_, 'Stylize', 'S'),
    ('Aura solarized halo (Apple Motion)', S_, 'Stylize', 'S'),
    ('Overdrive glow (Apple Motion)', S_, 'Stylize', 'S'),
    ('Circles elliptical facets (Apple Motion)', S_, 'Stylize', 'S'),
    ('Random Tile circular panels (Apple Motion)', S_, 'Distort', 'S'),
    ('Wavy Screen etched zigzag screen (Apple Motion)', S_, 'Retro', 'S'),
    ('OpenEXR Tone Map exposure/defog/knee (Apple Motion)', S_, 'Tone', 'S'),
    ('California look (Apple Motion)', S_, 'Insta', 'S'),
    ('Nevada look (Apple Motion)', S_, 'Insta', 'S'),
    ('WideTime (Apple Motion)', S_, 'Frames', 'X'),
]

# --- cables.gl op library ------------------------------------------------------------------------------------
# Op list from https://api.github.com/repos/cables-gl/cables/git/trees/develop?recursive=1 ; summaries from
# https://raw.githubusercontent.com/cables-gl/cables/develop/src/ops/base/<Op>/<Op>.json
S_ = 'cables.gl image ops'
C += [
    ('Shard noise (cables.gl)', S_, 'Noise', 'S'),
    ('Lens scratches (cables.gl)', S_, 'Film', 'S'),
]

# --- OBS shaderfilter examples ------------------------------------------------------------------------------
# List from https://github.com/exeldro/obs-shaderfilter/tree/master/data/examples ; header read from
# https://raw.githubusercontent.com/exeldro/obs-shaderfilter/master/data/examples/tetra.shader
S_ = 'OBS shaderfilter examples'
C += [
    ('Tetrahedral colour mixer (OBS tetra shader)', S_, 'Color', 'S'),
]

# --- LazPaint (BGRABitmap) -----------------------------------------------------------------------------------
# Menu strings from https://raw.githubusercontent.com/bgrabitmap/lazpaint/master/lazpaint/lazpaintmainform.lrj ;
# dispatch read from https://raw.githubusercontent.com/bgrabitmap/lazpaint/master/lazpaint/ufilters.pas
S_ = 'LazPaint filters'
C += [
    ('ClearType subpixel filter (LazPaint)', S_, 'Sharpen', 'S'),
    ('Inverse ClearType (LazPaint)', S_, 'Sharpen', 'S'),
    ('Corona blur (LazPaint / BGRABitmap)', S_, 'Blur', 'S'),
    ('Plastik texture (LazPaint)', S_, 'Materials', 'S'),
    ('Metal Floor texture (LazPaint)', S_, 'Materials', 'S'),
    ('Snow Print texture (LazPaint)', S_, 'Materials', 'S'),
    ('Round Stone texture (LazPaint)', S_, 'Materials', 'S'),
    ('Hypocycloid render (LazPaint)', S_, 'Render', 'S'),
]

# --- Inkscape SVG filter presets (Filters menu) --------------------------------------------------------------
# Labels, menus and tooltips read from https://gitlab.com/inkscape/inkscape/-/raw/master/share/filters/filters.svg
S_ = 'Inkscape filter presets'
C += [
    ('Alpha Draw Liquid (Inkscape)', S_, 'Paint', 'S'),
    ('Cross Noise Poster (Inkscape)', S_, 'Retro', 'S'),
    ('Liquid Drawing (Inkscape)', S_, 'Paint', 'S'),
    ('Old Postcard (Inkscape)', S_, 'Film', 'S'),
    ('Poster Draw (Inkscape)', S_, 'Paint', 'S'),
    ('Poster Rough (Inkscape)', S_, 'Paint', 'S'),
    ('Poster Color Fun (Inkscape)', S_, 'Paint', 'S'),
    ('Light Contour specular line drawing (Inkscape)', S_, 'Edges', 'S'),
    ('Blend Opposites (Inkscape)', S_, 'Color', 'S'),
    ('Hue to White (Inkscape)', S_, 'Color', 'S'),
    ('Paint Channels (Inkscape)', S_, 'Color', 'S'),
    ('Simulate CMY (Inkscape)', S_, 'Color', 'S'),
    ('Soft Colors edge glow (Inkscape)', S_, 'Color', 'S'),
    ('Chalk and Sponge (Inkscape)', S_, 'Distort', 'S'),
    ('Lapping water noise (Inkscape)', S_, 'Distort', 'S'),
    ('Rough and Dilate (Inkscape)', S_, 'Distort', 'S'),
    ('Posterized Light Eraser (Inkscape)', S_, 'Tone', 'S'),
    ('Monochrome Transparency (Inkscape)', S_, 'Tone', 'S'),
    ('Plastify (Inkscape)', S_, 'Materials', 'S'),
    ('Tinfoil (Inkscape)', S_, 'Materials', 'S'),
    ('Jelly Bump (Inkscape)', S_, 'Materials', 'S'),
    ('Thick Acrylic (Inkscape)', S_, 'Paint', 'S'),
    ('Wrinkled Varnish (Inkscape)', S_, 'Paint', 'S'),
    ('Relief Print (Inkscape)', S_, 'Materials', 'S'),
    ('Velvet Bumps (Inkscape)', S_, 'Materials', 'S'),
    ('Bump Engraving (Inkscape)', S_, 'Materials', 'S'),
    ('Plasticine (Inkscape)', S_, 'Materials', 'S'),
    ('Bubbly Bumps (Inkscape)', S_, 'Materials', 'S'),
    ('Contouring Discrete (Inkscape)', S_, 'Stylize', 'S'),
    ('Contouring Table (Inkscape)', S_, 'Stylize', 'S'),
    ('Posterized Blur (Inkscape)', S_, 'Stylize', 'S'),
    ('Blotting Paper (Inkscape)', S_, 'Paint', 'S'),
    ('Cracked Glass overlay (Inkscape)', S_, 'Materials', 'S'),
    ('Jam Spread (Inkscape)', S_, 'Materials', 'S'),
    ('Riddled (Inkscape)', S_, 'Materials', 'S'),
    ('Rough Paper aquarelle (Inkscape)', S_, 'Paint', 'S'),
    ('Rough and Glossy crumpled paper (Inkscape)', S_, 'Materials', 'S'),
    ('Silk Carpet (Inkscape)', S_, 'Materials', 'S'),
    ('Wax Print (Inkscape)', S_, 'Materials', 'S'),
    ('Melted Rainbow (Inkscape)', S_, 'Color', 'S'),
    ('Warped Rainbow (Inkscape)', S_, 'Color', 'S'),
    ('Crumpled Plastic (Inkscape)', S_, 'Materials', 'S'),
    ('Ink Paint (Inkscape)', S_, 'Paint', 'S'),
    ('Oil Slick overlay (Inkscape)', S_, 'Render', 'S'),
    ('Garden of Delights (Inkscape)', S_, 'Render', 'S'),
    ('Tartan (Inkscape)', S_, 'Render', 'S'),
    ('Tiger Fur (Inkscape)', S_, 'Materials', 'S'),
    ('Leopard Fur (Inkscape)', S_, 'Materials', 'S'),
    ('Blue Cheese speckles (Inkscape)', S_, 'Materials', 'S'),
    ('Carnaval splotches (Inkscape)', S_, 'Render', 'S'),
    ('Growing Cells (Inkscape)', S_, 'Render', 'S'),
    ('People blotches (Inkscape)', S_, 'Render', 'S'),
    ('Scotland fog peaks (Inkscape)', S_, 'Render', 'S'),
    ('Dots Transparency pointillist (Inkscape)', S_, 'Paint', 'S'),
    ('Canvas Transparency (Inkscape)', S_, 'Paint', 'S'),
    ('3D Mother of Pearl (Inkscape)', S_, 'Materials', 'S'),
    ('Cracked Lava (Inkscape)', S_, 'Materials', 'S'),
    ('Iridescent Beeswax (Inkscape)', S_, 'Materials', 'S'),
    ('Chewing Gum (Inkscape)', S_, 'Paint', 'S'),
    ('Electronic Microscopy (Inkscape)', S_, 'Stylize', 'S'),
]

# manual drops after near-match review (concept duplicates)
DROP = {
    'Grid Kaleidoscope (Pixelitor)',               # = Mirror Tiles
    'Rough and Glossy crumpled paper (Inkscape)',  # = Crumple (Xenofex)
    'Crumpled Plastic (Inkscape)',                 # = Crumple (Xenofex)
    'Chaos Game fractal (Pixelitor)',              # = IFS Fractal (chaos game is how IFS fractals are rendered)
}

# --- Natron community PyPlugs -------------------------------------------------------------------------------
# Folder lists from https://github.com/NatronGitHub/natron-plugins/tree/master/Filter (and /Keyer); descriptions read from
# https://raw.githubusercontent.com/NatronGitHub/natron-plugins/master/Filter/L_BlurHue/L_BlurHue.py ,
# .../Keyer/lp_HairKey/lp_HairKey.py , .../Keyer/lp_CleanScreen/lp_CleanScreen.py
S_ = 'Natron community PyPlugs'
C += [
    ('Hue blur (Natron L_BlurHue)', S_, 'Color', 'S'),
    ('Clean-plate hair key (Natron lp_HairKey)', S_, 'Analysis', 'X'),
    ('Clean-plate screen evening (Natron lp_CleanScreen)', S_, 'Repair', 'X'),
]

# --- lygia shader library leftovers (round 15 took 10) ------------------------------------------------------
# Folder lists from https://github.com/patriciogonzalezvivo/lygia/tree/main/{color,space,draw} ; descriptions from
# https://raw.githubusercontent.com/patriciogonzalezvivo/lygia/main/color/mixSpectral.glsl , .../space/windmillTile.glsl ,
# .../draw/colorChecker.glsl , .../space/bracketing.glsl
S_ = 'lygia shader library 2'
C += [
    ('Spectral colour mixing (lygia mixSpectral)', S_, 'Color', 'S'),
    ('Windmill tile (lygia)', S_, 'Distort', 'S'),
    ('Colour checker chart render (lygia)', S_, 'Render', 'S'),
    ('Bracketing vector-field texture mapping (lygia / Bowles)', S_, 'Stylize', 'S'),
]

# --- libvips / OpenImageIO reference leftovers --------------------------------------------------------------
# https://www.libvips.org/API/current/ctor.Image.eye.html ;
# https://openimageio.readthedocs.io/en/latest/imagebufalgo.html (fillholes_pushpull)
S_ = 'libvips / OpenImageIO leftovers'
C += [
    ('Eye spatial-frequency test pattern (libvips eye)', S_, 'Render', 'S'),
    ('Push-pull hole filling (OpenImageIO fillholes_pushpull)', S_, 'Repair', 'S'),
]

# --- FFmpeg video filters not yet in the db ------------------------------------------------------------------
# Every filter's description read from its section of https://ffmpeg.org/ffmpeg-filters.html
S_ = 'FFmpeg filters 3'
C += [
    ('FCC lattice palette quantisation (FFmpeg latticepal)', S_, 'Retro', 'S'),
    ('Edge slope tracing deinterlacer (FFmpeg estdif)', S_, 'Repair', 'S'),
    ('HDR gain map from SDR/HDR pair (FFmpeg gainmap, ISO 21496-1)', S_, 'Tone', 'X'),
    ('Static background key (FFmpeg backgroundkey)', S_, 'Analysis', 'X'),
    ('Photosensitivity flash reduction (FFmpeg)', S_, 'Frames', 'X'),
    ('Normalised cross-correlation map (FFmpeg xcorrelate)', S_, 'Analysis', 'X'),
    ('Temporal difference amplify (FFmpeg amplify)', S_, 'Frames', 'X'),
    ('Adaptive temporal averaging denoiser (FFmpeg atadenoise)', S_, 'Noise', 'X'),
    ("Graft adaptive kernel deinterlacer (FFmpeg kerndeint)", S_, 'Repair', 'X'),
    ('Weston 3-field deinterlacer (FFmpeg w3fdif)', S_, 'Repair', 'X'),
    ('YADIF deinterlacer (FFmpeg yadif)', S_, 'Repair', 'X'),
    ('Bob Weaver deinterlacer (FFmpeg bwdif)', S_, 'Repair', 'X'),
    ('Motion-compensated deinterlacer (FFmpeg mcdeint)', S_, 'Repair', 'X'),
    ('Midway image equalisation (FFmpeg midequalizer)', S_, 'Tone', 'X'),
    ('Temporal median (FFmpeg tmedian)', S_, 'Noise', 'X'),
]

# --- VapourSynth plugins (vsrepo package database) -----------------------------------------------------------
# Package list from https://github.com/vapoursynth/vsrepo/tree/master/local ; names, categories and descriptions read from
# https://raw.githubusercontent.com/vapoursynth/vsrepo/master/local/<package>.json ; vfx effect list from
# https://github.com/Vapoursynth-Plugins-Gitify/vfx (sources Binoculars.cpp, LineMagnifier.cpp)
S_ = 'VapourSynth plugins 2'
C += [
    ('ASTDR derainbow (VapourSynth)', S_, 'Repair', 'X'),
    ('Bifrost rainbow remover (VapourSynth)', S_, 'Repair', 'X'),
    ('Checkmate dot-crawl reducer (VapourSynth)', S_, 'Repair', 'X'),
    ('DeCross cross-colour reducer (VapourSynth)', S_, 'Repair', 'X'),
    ('DotKill dot-crawl & rainbow remover (VapourSynth)', S_, 'Repair', 'X'),
    ('DFMDerainbow (VapourSynth)', S_, 'Repair', 'X'),
    ('SSIQ spatial derainbow (VapourSynth)', S_, 'Repair', 'S'),
    ('TComb temporal comb filter (VapourSynth)', S_, 'Repair', 'X'),
    ('Cnr2 temporal chroma noise reducer (VapourSynth)', S_, 'Noise', 'X'),
    ('DegrainMedian spatio-temporal limited median (VapourSynth)', S_, 'Noise', 'X'),
    ('RemoveDirt (VapourSynth)', S_, 'Repair', 'X'),
    ('ReduceFlicker (VapourSynth)', S_, 'Frames', 'X'),
    ('TempLinearApproximate temporal smoother (VapourSynth)', S_, 'Noise', 'X'),
    ('EdgeFixer border line repair (VapourSynth)', S_, 'Repair', 'S'),
    ('LGhost ghost / ringing reduction (VapourSynth)', S_, 'Repair', 'S'),
    ('Frfun7 fractal spatial denoiser (VapourSynth)', S_, 'Noise', 'G'),
    ('Oyster block-matching artefact removal (VapourSynth)', S_, 'Repair', 'G'),
    ('Plum sharpening / blind deconvolution (VapourSynth)', S_, 'Sharpen', 'G'),
    ('Vine block-matching dehalo (VapourSynth)', S_, 'Repair', 'G'),
    ('CAMBI contrast-aware multiscale banding index (VapourSynth)', S_, 'Analysis', 'G'),
    ('Dpid detail-preserving downscaler (VapourSynth)', S_, 'Sharpen', 'G'),
    ('DCTFilter DCT frequency suppressor (VapourSynth)', S_, 'Noise', 'S'),
    ('Binoculars view (VapourSynth vfx)', S_, 'Distort', 'S'),
    ('Line Magnifier (VapourSynth vfx)', S_, 'Distort', 'S'),
]

# --- G'MIC stdlib commands (non-GUI) ------------------------------------------------------------------------
# Section list from https://gmic.eu/reference/list_of_commands.html ; descriptions read from
# https://gmic.eu/reference/<command>.html (minimal_path, pseudogray, laar, rotate_tileable, lut_contrast)
S_ = "G'MIC stdlib commands"
C += [
    ("Minimal path on potential map (G'MIC minimal_path)", S_, 'Analysis', 'G'),
    ("Pseudo-grey colormap (G'MIC pseudogray)", S_, 'Tone', 'S'),
    ("Largest axis-aligned rectangle (G'MIC laar)", S_, 'Analysis', 'G'),
    ("Rotate tileable (G'MIC rotate_tileable)", S_, 'Distort', 'S'),
    ("High-contrast colormap generator (G'MIC lut_contrast)", S_, 'Color', 'G'),
]

# --- Mehdi free Photoshop plug-ins -------------------------------------------------------------------------------
# Plug-in list from https://www.mehdiplugins.com/ ; each description read from https://www.mehdiplugins.com/english/<plugin>.htm
S_ = 'Mehdi plug-ins'
C += [
    ('Absolute Colors hue-sector restriction (Mehdi)', S_, 'Color', 'S'),
    ('Blots seamless texture (Mehdi)', S_, 'Render', 'S'),
    ('Color MegaMix 8-colour remap (Mehdi)', S_, 'Color', 'S'),
    ('Contrast Balance four-opposition balance (Mehdi)', S_, 'Color', 'S'),
    ('Fine Threshold anti-aliased threshold (Mehdi)', S_, 'Tone', 'S'),
    ('Flat Median (Mehdi)', S_, 'Noise', 'S'),
    ('Grain Natural (Mehdi)', S_, 'Noise', 'S'),
    ('Sorting Tiles (Mehdi)', S_, 'Stylize', 'G'),
    ('Vibrations streaks (Mehdi)', S_, 'Stylize', 'S'),
]

# --- Redfield plug-ins ---------------------------------------------------------------------------------------------
# https://www.redfieldplugins.com/
S_ = 'Redfield plug-ins'
C += [
    ('Fractalius hidden fractal texture (Redfield)', S_, 'Stylize', 'G'),
]

# --- The Plugin Site (Harald Heim) ---------------------------------------------------------------------------------
# https://www.thepluginsite.com/products/plugingalaxy/effects.htm and
# https://www.thepluginsite.com/products/harrysfilters/main.htm (En/Decrypt group)
S_ = 'The Plugin Site (Plugin Galaxy / Harry\'s Filters)'
C += [
    ('Image encryption with 64-bit key (Plugin Galaxy Cryptology)', S_, 'Stylize', 'S'),
    ('Video-synthesizer patterns (Plugin Galaxy Synthesizer)', S_, 'Render', 'S'),
]

# --- VanDerLee UnPlugged-X (archived plug-in) -----------------------------------------------------------------------
# Effect list from https://www.vanderlee.com/plugins_unpluggedx_effects.html ; each description read from the original
# manual https://www.vanderlee.com/webhelp/unpluggedx/source/filter_<effect>.html
S_ = 'VanDerLee UnPlugged-X'
C += [
    ('Acid Waterfall (UnPlugged-X)', S_, 'Distort', 'S'),
    ('Cartoon Circles rings (UnPlugged-X)', S_, 'Render', 'S'),
    ('Contrast-Split light/dark contrast (UnPlugged-X)', S_, 'Tone', 'S'),
    ('Copystar radial mirror star (UnPlugged-X)', S_, 'Distort', 'S'),
    ('Ink Rubber smear copy (UnPlugged-X)', S_, 'Stylize', 'S'),
    ('Renaissance cracked masterpiece (UnPlugged-X)', S_, 'Paint', 'S'),
    ('Tangent Deform tile wall (UnPlugged-X)', S_, 'Distort', 'S'),
    ('U.S. Comic interlace shading (UnPlugged-X)', S_, 'Stylize', 'S'),
    ('Warning diagonal stripes (UnPlugged-X)', S_, 'Render', 'S'),
    ('Radar display (UnPlugged-X)', S_, 'Render', 'S'),
    ('CD Shader refractive disc (UnPlugged-X)', S_, 'Render', 'S'),
    ('Pyramids relief tiles (UnPlugged-X)', S_, 'Render', 'S'),
    ('Blades light fan (UnPlugged-X)', S_, 'Render', 'S'),
]

# --- VanDerLee SnowScape (archived plug-in) -------------------------------------------------------------------------
# https://www.vanderlee.com/plugins_snowscape.html
S_ = 'VanDerLee SnowScape'
C += [
    ('SnowScape settling snow (VanDerLee)', S_, 'Render', 'G'),
]

# --- OpenToonz FX ---------------------------------------------------------------------------------------------------
# FX list from https://opentoonz.readthedocs.io/en/latest/applying_special_fx.html and source listing
# https://github.com/opentoonz/opentoonz/tree/master/toonz/sources/stdfx ; behaviour read from
# https://raw.githubusercontent.com/opentoonz/opentoonz/master/toonz/sources/stdfx/<fx>.cpp
S_ = 'OpenToonz FX'
C += [
    ('Line integral convolution flow blur (OpenToonz Iwa_FlowBlurFx)', S_, 'Blur', 'S'),
    ('Floor Bump refracted floor through water (OpenToonz Iwa_FloorBumpFx)', S_, 'Distort', 'S'),
    ('PN Perspective noise plane (OpenToonz Iwa_PNPerspectiveFx)', S_, 'Render', 'S'),
    ('Soap Bubble thin-film shape (OpenToonz Iwa_SoapBubbleFx)', S_, 'Materials', 'G'),
    ('Corridor Gradient (OpenToonz Iwa_CorridorGradientFx)', S_, 'Render', 'S'),
    ('Body Highlight (OpenToonz)', S_, 'Stylize', 'S'),
]

# further drops after the second near-match review
DROP |= {
    'Vibrations streaks (Mehdi)',                  # = Streaks (Axis / Perspective / Superstreak)
    'Copystar radial mirror star (UnPlugged-X)',   # = Kaleidoscope (radial mirroring)
    'Warning diagonal stripes (UnPlugged-X)',      # = Stripes overlay
    'Cartoon Circles rings (UnPlugged-X)',         # = concentric rings render/pattern
    'Pyramids relief tiles (UnPlugged-X)',         # = Extrude (Pyramids)
}
