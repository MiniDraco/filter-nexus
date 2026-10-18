"""Round 18 raw candidates (input to dedupe18.py --build).

Verification-first round: every block below was read first-hand from the URL in its header comment
(menu source code, docs page, API reference, shader catalogue or preset file fetched during the harvest).
(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames.
"""
C = []
DROP = set()

# --- Autodesk Flame Matchbox community shaders (Logik Matchbook) ---------------------------------------------------
# Catalogue page https://logik-matchbook.org/ (every shader card carries its author's description in the link title;
# per-shader pages https://logik-matchbook.org/shader/<name>)
S_ = 'Logik Matchbook (Flame Matchbox shaders)'
C += [
    ('Advect along a guide map (Matchbox Ls_Advect)', S_, 'Distort', 'S'),
    ('Airglow exponential-falloff glow (Matchbox Ls_Airglow)', S_, 'Stylize', 'S'),
    ('Relax colours toward a haze colour (Matchbox Ls_Relax)', S_, 'Color', 'S'),
    ('Random grade generator (Matchbox Ls_RndmGrade)', S_, 'Color', 'S'),
    ('Shadowplate direct-sun removal (Matchbox Ls_Shadowplate)', S_, 'Repair', 'S'),
    ('Spline blur along shape contours (Matchbox Ls_Splineblur)', S_, 'Blur', 'S'),
    ('Colour chips with colour names (Matchbox Ls_Chips)', S_, 'Analysis', 'G'),
    ('Skin-tone-line hue overlay (Matchbox ak_skinoverlay)', S_, 'Analysis', 'S'),
    ('Five-band texture control sharpen/soften (Matchbox ak_texturecontrol)', S_, 'Sharpen', 'S'),
    ('Camera flashes (Matchbox crok_cameraflash)', S_, 'Render', 'S'),
    ('Exponential-falloff blur (Matchbox crok_expon_blur)', S_, 'Blur', 'S'),
    ('Uncomp undo a blend over a clean plate (Matchbox crok_uncomp)', S_, 'Repair', 'X'),
    ('Trigrade three colour-vector grade (Matchbox nob_trigrade)', S_, 'Color', 'S'),
    ('Reverse grade black/white point match (Matchbox AFX_ReverseGrade)', S_, 'Tone', 'S'),
    ('Linear extrapolation past 0..1 blend (Matchbox y_linex)', S_, 'Tone', 'S'),
    ('Six-band luminance colour corrector (Matchbox AA_Multiband_ColorCorrect)', S_, 'Color', 'S'),
    ('Focal-length perspective reframe (Matchbox nob_reframe)', S_, 'Distort', 'S'),
    ('Fake LIDAR point-cloud look (Matchbox JB_lidar)', S_, 'Render', 'S'),
    ('Shadow density lift-desaturate (Matchbox BB_ShadowDensity)', S_, 'Tone', 'S'),
    ('Hex-tiling repetition-free texture (Matchbox crok_tile)', S_, 'Materials', 'S'),
    ('Fireflies generator (Matchbox MM_Fireflies)', S_, 'Render', 'S'),
    ('Social-media safe-zone guides (Matchbox BB_SocialSafeZones)', S_, 'Frames', 'S'),
    ('Vanishing-point line fan overlay (Matchbox BB_PerspectiveLines)', S_, 'Render', 'S'),
    ('Sci-fi HUD overlay (Matchbox BB_FutureHUD / BB_RetroHUD)', S_, 'Render', 'S'),
    ('Oculus Rift side-by-side barrel warp (Matchbox crok_rift)', S_, 'Distort', 'S'),
    ('Molten metal gradient (Matchbox L_Molten)', S_, 'Materials', 'S'),
    ('Ancient symbols generator (Matchbox crok_ancient_symbols)', S_, 'Render', 'S'),
    ('Skin texture transfer (Matchbox crok_reskin)', S_, 'Repair', 'X'),
    ('Fireball generator (Matchbox CPGP_Fireball)', S_, 'Render', 'S'),
    ('Menger sponge flythrough (Matchbox crok_menger_system)', S_, 'Render', 'S'),
    ('Mandelbox fractal (Matchbox crok_mandelbox)', S_, 'Render', 'S'),
    ('Mandelbulb fractal (Matchbox crok_mandelbulb)', S_, 'Render', 'S'),
    ('Wave lines pattern (Matchbox crok_wave_lines)', S_, 'Render', 'S'),
    ('Block noise texture (Matchbox crok_block_noise)', S_, 'Noise', 'S'),
    ('Twinkle pulsating stars (Matchbox crok_twinkle)', S_, 'Render', 'S'),
    ('Kleinian fractal particles (Matchbox CPGP_ParticuleFractale)', S_, 'Render', 'S'),
]

# --- Paint.NET community plug-ins (forum Plugin Index) ---------------------------------------------------------------
# Index data read from https://mattw.io/pdn-plugin-index/index/plugin-index.json (searchable mirror of
# https://forums.getpaint.net/topic/15260-plugin-index/ ; each entry: title, author, menu, author's description)
S_ = 'Paint.NET Plugin Index'
C += [
    ('Bizarro-Negation flipped self-negation (Paint.NET)', S_, 'Stylize', 'S'),
    ('Callicolour four-point ribbons (Paint.NET)', S_, 'Render', 'S'),
    ('Chart White Balance from colour-chart patches (Paint.NET)', S_, 'Color', 'G'),
    ('Cluster Clear ink-blot removal (Paint.NET)', S_, 'Repair', 'G'),
    ('Colour inpainting from sparse colour hints (Paint.NET Color inpainting)', S_, 'Repair', 'G'),
    ('Color Vector Rotations quaternion recolour (Paint.NET)', S_, 'Color', 'X'),
    ('Minecraft map colour palette (Paint.NET)', S_, 'Retro', 'S'),
    ('Cuboids tower-block perspective pixelation (Paint.NET)', S_, 'Stylize', 'S'),
    ('Dragan Effect portrait look (Paint.NET)', S_, 'Tone', 'S'),
    ('Dryad organic branching patterns (Paint.NET)', S_, 'Render', 'G'),
    ('Equirectangular diffuse irradiance transform (Paint.NET)', S_, 'Render', 'G'),
    ('Eyeshine animal eye-glow removal (Paint.NET)', S_, 'Repair', 'S'),
    ('Fibonacci Fill spiral squares (Paint.NET)', S_, 'Render', 'S'),
    ('Flame Convolution iterated random blur (Paint.NET)', S_, 'Stylize', 'G'),
    ('Flourish calligraphic tendrils (Paint.NET)', S_, 'Render', 'G'),
    ('Earths and Greys tonal palette recolour (Paint.NET Red ochre)', S_, 'Color', 'S'),
    ('Bit-Plane Shuffler (Paint.NET)', S_, 'Color', 'S'),
    ('Gradient Blocks pixelate (Paint.NET)', S_, 'Stylize', 'S'),
    ('Green Tint Reduction without magenta (Paint.NET)', S_, 'Color', 'S'),
    ('Fake HDR inverted-blur overlay (Paint.NET HDR)', S_, 'Tone', 'S'),
    ('HSV Scrambler cross-channel derive (Paint.NET)', S_, 'Color', 'S'),
    ('Invert Luminance keeping hue (Paint.NET)', S_, 'Color', 'S'),
    ('Lattice duotone embroidery pattern (Paint.NET Ed Harvey)', S_, 'Stylize', 'S'),
    ('Normalize Normal Map (Paint.NET)', S_, 'Materials', 'S'),
    ('Polar Singularity acorn mirror (Paint.NET)', S_, 'Distort', 'S'),
    ('Posterize in HSV space (Paint.NET)', S_, 'Color', 'S'),
    ('Relief Map Generator islands and continents (Paint.NET)', S_, 'Terrain', 'G'),
    ('Koch Snowflake fractal (Paint.NET)', S_, 'Render', 'S'),
    ('Graph Paper square/isometric (Paint.NET)', S_, 'Render', 'S'),
    ('Isometric Tiler orthogonal-to-isometric (Paint.NET)', S_, 'Distort', 'S'),
    ('Rosaces rose curves (Paint.NET)', S_, 'Render', 'S'),
    ('RotSprite pixel-art rotation (Paint.NET)', S_, 'Retro', 'G'),
    ('Scintillate tilted alternating inversion (Paint.NET)', S_, 'Stylize', 'S'),
    ('Splinter rays per pixel (Paint.NET Ed Harvey)', S_, 'Blur', 'S'),
    ("Color Wave ripples from colour borders (Paint.NET TR's)", S_, 'Stylize', 'G'),
    ("iPollock drip-painting generator (Paint.NET TR's)", S_, 'Paint', 'G'),
    ("Radial Extruder cake slices (Paint.NET TR's)", S_, 'Distort', 'S'),
    ("Strange Attractors (Paint.NET TR's)", S_, 'Render', 'G'),
    ("Strobe Motion stop-motion repeats (Paint.NET TR's)", S_, 'Stylize', 'S'),
    ("Filaments light-writing curves (Paint.NET TR's)", S_, 'Render', 'S'),
    ('Vibration blur-then-band oil-on-water (Paint.NET)', S_, 'Stylize', 'S'),
    ('YinYang21 document binarization (Paint.NET)', S_, 'Analysis', 'G'),
    ('Texture Object Rounder height map of revolution (Paint.NET)', S_, 'Materials', 'G'),
    ('Tattersall check pattern (Paint.NET)', S_, 'Render', 'S'),
]

# --- Filter Forge filter library: effect categories, pages not read in earlier rounds --------------------------------
# Listing pages https://www.filterforge.com/filters/category56-page1..16.html (Effects > Patterns, new this round),
# category44-page7..27.html (Creative), category45-page7..20.html (Distortions), category52-page7..20.html (Photo),
# category54-page4..7.html (Frames)
S_ = 'Filter Forge library 2'
C += [
    ('Bilevel Screening (Filter Forge)', S_, 'Retro', 'S'),
    ('Chuck Close grid-cell portrait (Filter Forge Chuck Close V2)', S_, 'Stylize', 'S'),
    ("Cloisonne d'Art Nouveau (Filter Forge)", S_, 'Stylize', 'S'),
    ('Decoupage (Filter Forge)', S_, 'Paint', 'S'),
    ('Hockney-style joiner collage (Filter Forge)', S_, 'Stylize', 'G'),
    ('Gosper Island tiling (Filter Forge)', S_, 'Render', 'S'),
    ('Hexaflake fractal (Filter Forge)', S_, 'Render', 'S'),
    ('Lace tablecloth pattern (Filter Forge)', S_, 'Render', 'S'),
    ('Navajo Weaver (Filter Forge)', S_, 'Stylize', 'S'),
    ('Persian Rug pattern (Filter Forge)', S_, 'Render', 'S'),
    ('Pocket Etch-A-Sketch (Filter Forge)', S_, 'Stylize', 'S'),
    ('Shoji Screen (Filter Forge)', S_, 'Frames', 'S'),
    ('SX-70 Polaroid emulsion manipulation (Filter Forge)', S_, 'Film', 'S'),
    ('N-Uniform tilings (Filter Forge N-Uniform Tiles)', S_, 'Render', 'S'),
    ('Rose Window (Filter Forge)', S_, 'Render', 'S'),
    ('Matrix Code digital rain (Filter Forge)', S_, 'Render', 'S'),
    ('Sonar Screen (Filter Forge)', S_, 'Render', 'S'),
    ('Speedliner manga speed lines (Filter Forge)', S_, 'Stylize', 'S'),
    ('Plexus connected-dots network (Filter Forge)', S_, 'Render', 'S'),
    ('Bubble Wrap (Filter Forge)', S_, 'Materials', 'S'),
    ('Coin Generator relief coin (Filter Forge)', S_, 'Materials', 'S'),
    ("Cameo Creator (Filter Forge Foxxee's)", S_, 'Stylize', 'S'),
    ('Snowglobe (Filter Forge JLE)', S_, 'Distort', 'S'),
    ('Tattoo Me skin tattoo (Filter Forge)', S_, 'Stylize', 'S'),
    ('Infinity mirror blur tunnel (Filter Forge)', S_, 'Distort', 'S'),
    ('Chalk on Blackboard (Filter Forge)', S_, 'Paint', 'S'),
    ('Neumorphism soft UI emboss (Filter Forge)', S_, 'Stylize', 'S'),
    ('Scorched Parchment (Filter Forge)', S_, 'Frames', 'S'),
    ('Barcode Color Art (Filter Forge)', S_, 'Stylize', 'S'),
]

# --- ReShade community repos not read before -------------------------------------------------------------------------
# Trees via https://api.github.com/repos/<repo>/git/trees/<branch>?recursive=1 ; headers/tooltips read from
# https://raw.githubusercontent.com/LordKobra/CobraFX/master/Shaders/Frequency_CS.fx ,
# https://raw.githubusercontent.com/AlucardDH/dh-reshade-shaders/master/README.md and Shaders/dh_uniformity_correction.fx ,
# https://github.com/BlueSkyDefender/Depth3D (VirtualNose.fx) ,
# https://raw.githubusercontent.com/EndlesslyFlowering/ReShade_HDR_shaders/master/Shaders/lilium__hdr_black_floor_fix.fx and
# lilium__sdr_trc_fix.fx / lilium__map_sdr_into_hdr.fx (tooltips: sRGB <-> gamma 2.2 mismatch, black floor emulation)
S_ = 'ReShade community repos 2'
C += [
    ('Frequency-modulation scan waves (CobraFX Frequency_CS)', S_, 'Stylize', 'G'),
    ('Serial Experiments Lain shadow style (DH_Lain)', S_, 'Stylize', 'S'),
    ('Display uniformity correction (DH_Uniformity_Correction)', S_, 'Repair', 'S'),
    ('Virtual nose overlay for VR comfort (Depth3D VirtualNose)', S_, 'Render', 'S'),
    ('HDR black-floor lowering fix (Lilium)', S_, 'Tone', 'S'),
    ('sRGB vs gamma 2.2 transfer mismatch fix (Lilium SDR TRC fix)', S_, 'Tone', 'S'),
]

# --- CLIJ2 GPU image-processing reference (Fiji / clEsperanto) -------------------------------------------------------
# Operation list https://clij.github.io/clij2-docs/reference ; descriptions read from
# https://clij.github.io/clij2-docs/reference_<operation>
S_ = 'CLIJ2 reference'
C += [
    ('Voronoi-Otsu labelling (CLIJ2 voronoiOtsuLabeling)', S_, 'Analysis', 'G'),
    ('Label extension-ratio map (CLIJ2 extensionRatioMap)', S_, 'Analysis', 'G'),
    ('Average neighbour-distance map (CLIJ2 averageNeighborDistanceMap)', S_, 'Analysis', 'G'),
    ('Touching-neighbour count map (CLIJ2 touchingNeighborCountMap)', S_, 'Analysis', 'G'),
    ('Mesh between touching labels (CLIJ2 drawMeshBetweenTouchingLabels)', S_, 'Analysis', 'G'),
    ('Per-label mean-of-Laplacian contrast map (CLIJ2 labelMeanOfLaplacianMap)', S_, 'Analysis', 'G'),
]

# --- gl-transitions (GLSL transition library) ------------------------------------------------------------------------
# File list https://api.github.com/repos/gl-transitions/gl-transitions/git/trees/master?recursive=1 (transitions/*.glsl,
# each file's header carries author + name); a frame of any of these is a two-image blend effect
S_ = 'gl-transitions'
C += [
    ('Doom screen-melt transition (gl-transitions DoomScreenTransition)', S_, 'Frames', 'X'),
    ('Book flip transition (gl-transitions BookFlip)', S_, 'Frames', 'X'),
    ('Luminance melt transition (gl-transitions luminance_melt)', S_, 'Frames', 'X'),
    ('Glitch memories transition (gl-transitions GlitchMemories)', S_, 'Frames', 'X'),
    ('Butterfly wave scrawler transition (gl-transitions)', S_, 'Frames', 'X'),
    ('Zoom-in circles transition (gl-transitions ZoomInCircles)', S_, 'Frames', 'X'),
    ('Polka-dots curtain transition (gl-transitions PolkaDotsCurtain)', S_, 'Frames', 'X'),
    ('Tiles wave transition (gl-transitions TilesWave)', S_, 'Frames', 'X'),
    ('Doorway transition (gl-transitions doorway)', S_, 'Frames', 'X'),
    ('Cross warp transition (gl-transitions crosswarp)', S_, 'Frames', 'X'),
    ('Undulating burn-out transition (gl-transitions undulatingBurnOut)', S_, 'Frames', 'X'),
    ('Old TV lost-signal transition (gl-transitions old_tv_lost_signal)', S_, 'Frames', 'X'),
    ('Polar function wipe (gl-transitions polar_function)', S_, 'Frames', 'X'),
    ('Power kaleido transition (gl-transitions powerKaleido)', S_, 'Frames', 'X'),
    ('Stereo viewer transition (gl-transitions StereoViewer)', S_, 'Frames', 'X'),
    ('Static wipe (gl-transitions static_wipe)', S_, 'Frames', 'X'),
    ('Tangent motion blur transition (gl-transitions tangentMotionBlur)', S_, 'Frames', 'X'),
    ('Bow-tie wipe (gl-transitions BowTieHorizontal / BowTieVertical)', S_, 'Frames', 'X'),
    ('Grid flip transition (gl-transitions GridFlip)', S_, 'Frames', 'X'),
    ('Window slice transition (gl-transitions windowslice)', S_, 'Frames', 'X'),
    ('Squares wire transition (gl-transitions squareswire)', S_, 'Frames', 'X'),
    ('Hexagonalize transition (gl-transitions hexagonalize)', S_, 'Frames', 'X'),
    ('Fly-eye transition (gl-transitions flyeye)', S_, 'Frames', 'X'),
    ('Colour-distance transition (gl-transitions ColourDistance)', S_, 'Frames', 'X'),
]

# --- Fiji / ImageJ plugin documentation pages ------------------------------------------------------------------------
# Page list https://api.github.com/repos/imagej/imagej.github.io/git/trees/main?recursive=1 (_pages/plugins/*.md);
# each description read from https://raw.githubusercontent.com/imagej/imagej.github.io/main/_pages/plugins/<page>.md
S_ = 'Fiji plugin pages'
C += [
    ("Adelson's checker-shadow squares generator (Fiji Adelson's Squares)", S_, 'Render', 'S'),
    ('Anomalous q-Gaussian diffusion filter (Fiji Anomalous Diffusion Filters)', S_, 'Noise', 'G'),
    ('Quiver plot of vector field (Fiji Quiver Plot)', S_, 'Analysis', 'S'),
    ('Stochastic random-walk denoise (Fiji Stochastic Denoise, Estrada)', S_, 'Noise', 'G'),
    ('Temporal-colour code projection (Fiji Temporal-Color Code)', S_, 'Frames', 'X'),
    ('Kalman stack filter (Fiji)', S_, 'Noise', 'X'),
    ('Smooth manifold extraction projection (Fiji SME Projection)', S_, 'Analysis', 'X'),
    ('Helmholtz local wave direction/wavelength map (Fiji Helmholtz Analysis)', S_, 'Analysis', 'G'),
    ('Replace red with magenta merge (Fiji)', S_, 'Color', 'S'),
    ('Gabriel graph of points (Fiji Gabriel Graph)', S_, 'Analysis', 'G'),
    ('Shepp-Logan phantom (Fiji BIG-EPFL)', S_, 'Render', 'S'),
    ('Microscope focus-quality tile map (Fiji MiFQC)', S_, 'Analysis', 'M'),
    ('2D sample entropy texture (Fiji SampEn2D)', S_, 'Analysis', 'G'),
]

# --- RawTherapee tool labels -------------------------------------------------------------------------------------------
# UI string table https://raw.githubusercontent.com/Beep6581/RawTherapee/dev/rtdata/languages/default
# (TP_*_LABEL tool names, TP_COLORTONING_* method names)
S_ = 'RawTherapee tools'
C += [
    ('Contrast by Detail Levels (RawTherapee)', S_, 'Sharpen', 'S'),
    ('HSV Equalizer (RawTherapee)', S_, 'Color', 'S'),
    ('L*a*b* colour correction grid (RawTherapee Color Toning)', S_, 'Color', 'S'),
    ('Colour correction regions with H/C/L masks (RawTherapee Color Toning)', S_, 'Color', 'S'),
    ('Saturation 2 colours toning (RawTherapee Color Toning)', S_, 'Color', 'S'),
]

# --- Fred's ImageMagick scripts (Fred Weinhaus) -----------------------------------------------------------------------
# Script index with one-line descriptions http://www.fmwconcepts.com/imagemagick/index.php
# (per-script pages http://www.fmwconcepts.com/imagemagick/<script>/index.php)
S_ = "Fred's ImageMagick scripts"
C += [
    ("Adaptive spatial-subdivision two-colour threshold (Fred's 2colorthresh)", S_, 'Analysis', 'G'),
    ("Locally adaptive gamma (Fred's adaptivegamma)", S_, 'Tone', 'S'),
    ("Border dispersion effects (Fred's bordereffects)", S_, 'Frames', 'S'),
    ("Bubble warp (Fred's bubblewarp)", S_, 'Distort', 'S'),
    ("Random colour cells (Fred's colorcells)", S_, 'Stylize', 'S'),
    ("Colour spectrum strip from image colours (Fred's colorspectrum)", S_, 'Analysis', 'G'),
    ("Dave Hill effect (Fred's davehilleffect)", S_, 'Tone', 'S'),
    ("Furrowed wrinkle grit (Fred's furrowed)", S_, 'Sharpen', 'S'),
    ("Hexagons of randomly rotated input (Fred's hexagons)", S_, 'Stylize', 'S'),
    ("Plano-convex lens warp (Fred's lenswarp)", S_, 'Distort', 'S'),
    ("LucisArt-like effect (Fred's lucisarteffect)", S_, 'Tone', 'S'),
    ("Mottle effects (Fred's mottle)", S_, 'Noise', 'S'),
    ("Pattern onto clothing warp (Fred's outfit)", S_, 'Distort', 'X'),
    ("Film perforations border (Fred's perforations)", S_, 'Frames', 'S'),
    ("Polygon ring (Fred's polyring)", S_, 'Stylize', 'S'),
    ("Primary/secondary RGB dots (Fred's rgbdots)", S_, 'Stylize', 'S'),
    ("Jagged cut-and-splice (Fred's splice)", S_, 'Distort', 'S'),
    ("Radial/circular striations (Fred's striations)", S_, 'Blur', 'S'),
    ("Toonizarro Bizarro cartoon (Fred's toonizarro)", S_, 'Stylize', 'S'),
    ("Uniform-colour watermark removal (Fred's unwatermark)", S_, 'Repair', 'G'),
    ("Underwater red-attenuation correction (Fred's uwcorrect)", S_, 'Color', 'S'),
    ("Irregular linear weave distortion (Fred's weave)", S_, 'Distort', 'S'),
    ("Wood brand burn (Fred's woodbrand)", S_, 'Materials', 'S'),
    ("Non-uniform outward stretch (Fred's xpand)", S_, 'Distort', 'S'),
    ("Logarithmic warp resize (Fred's warplog)", S_, 'Distort', 'S'),
    ("3D box cover wrap (Fred's 3Dcover)", S_, 'Render', 'S'),
]

# --- snibgo's ImageMagick pages (Alan Gibson) --------------------------------------------------------------------------
# Index http://im.snibgo.com/ ; page intros read from http://im.snibgo.com/<page>.htm (polypix, wide2sq, maxloccont,
# pinorpush, flatcolcart, mendbrkln, dptile, sh2sh)
S_ = 'snibgo ImageMagick pages'
C += [
    ('Polygonal pixelation (snibgo polypix)', S_, 'Stylize', 'G'),
    ('Wide-to-squareish spiral/ribbon rendering (snibgo wide2sq)', S_, 'Distort', 'G'),
    ('Maximise local contrast without clipping (snibgo maxloccont)', S_, 'Tone', 'G'),
    ('Pin-or-push displacement (snibgo pinorpush)', S_, 'Distort', 'G'),
    ('Flat-colour cartoon by area representative colour (snibgo flatcolcart)', S_, 'Stylize', 'G'),
    ('Mending broken lines (snibgo mendbrkln)', S_, 'Repair', 'G'),
    ('Dark-path ragged self-tiling piece (snibgo dptile)', S_, 'Materials', 'G'),
    ('Shape-to-shape warp (snibgo sh2sh)', S_, 'Distort', 'G'),
]

# --- Notch post-FX nodes -----------------------------------------------------------------------------------------------
# Node list https://manual.notch.one/1.0/en/docs/reference/nodes/post-fx/ ; descriptions read from each node page
# (https://manual.notch.one/2026.1/en/docs/reference/nodes/post-fx/<group>/<node>/)
S_ = 'Notch post-FX nodes'
C += [
    ('Gradient Patch colour grid with blends (Notch)', S_, 'Render', 'S'),
    ('Line Distortion luminance-length growing lines (Notch)', S_, 'Stylize', 'S'),
    ('Feedback Blur trailing from a line (Notch)', S_, 'Blur', 'S'),
]

# --- ISF (Interactive Shader Format) filter library, Vidvox ------------------------------------------------------------
# File list https://api.github.com/repos/Vidvox/ISF-Files/git/trees/master?recursive=1 ; each "DESCRIPTION" field read
# from https://raw.githubusercontent.com/Vidvox/ISF-Files/master/ISF/<name>.fs
S_ = 'ISF shader library (Vidvox)'
C += [
    ('Broken LCD value-noise cracks (ISF)', S_, 'Retro', 'S'),
    ('Comet Tails brightness feedback trails (ISF)', S_, 'Frames', 'X'),
    ('Corner Color Tint (ISF)', S_, 'Color', 'S'),
    ('Doodler random-walk pen (ISF)', S_, 'Render', 'G'),
    ('Duotone From Histogram (ISF)', S_, 'Color', 'G'),
    ('Echo Trace threshold-gated update (ISF)', S_, 'Frames', 'X'),
    ('Edge Blowout region edge stretch (ISF)', S_, 'Distort', 'S'),
    ('Noise Adapt changed pixels become noise (ISF)', S_, 'Frames', 'X'),
    ('Smudged Lens (ISF)', S_, 'Blur', 'S'),
    ('Smoke Screen overlay (ISF)', S_, 'Render', 'S'),
    ('Triangle Warp (ISF)', S_, 'Distort', 'S'),
    ('Vertical Tearing vsync-off (ISF)', S_, 'Retro', 'S'),
    ('Video Bricks brick-pattern tiling (ISF)', S_, 'Stylize', 'S'),
    ('Video Snake frame-delayed grid (ISF)', S_, 'Frames', 'X'),
    ('Y-C Time Blur separate YIQ feedback (ISF)', S_, 'Frames', 'X'),
    ('Power Warp power-curve distortion (ISF)', S_, 'Distort', 'S'),
]

# --- Filter Forge library: Effects > Misc pages 4-51 (earlier rounds read pages 1-3) -----------------------------------
# Listing pages https://www.filterforge.com/filters/category20-page4.html .. category20-page51.html
S_ = 'Filter Forge library 3 (Misc effects)'
C += [
    ('Bullet Holes in Picture (Filter Forge)', S_, 'Stylize', 'S'),
    ('Cave Paintings (Filter Forge)', S_, 'Paint', 'S'),
    ('Changeable Taffeta fabric (Filter Forge)', S_, 'Materials', 'S'),
    ('Cowify cow-spot pattern (Filter Forge)', S_, 'Render', 'S'),
    ('Electron Microscope look (Filter Forge)', S_, 'Stylize', 'S'),
    ('Iterative Fluid Sim (Filter Forge)', S_, 'Distort', 'G'),
    ('Lathe Custom Profile (Filter Forge)', S_, 'Render', 'S'),
    ('Lightsaber glow (Filter Forge)', S_, 'Render', 'S'),
    ('Lunar Phases (Filter Forge)', S_, 'Render', 'S'),
    ('Mystery Science Theater 3000 silhouette overlay (Filter Forge)', S_, 'Frames', 'S'),
    ('Picture to Plush (Filter Forge)', S_, 'Materials', 'S'),
    ('Playing Card (Filter Forge)', S_, 'Frames', 'S'),
    ("Rubik's Cube (Filter Forge)", S_, 'Stylize', 'S'),
    ('Raked Sand (Filter Forge)', S_, 'Materials', 'S'),
    ('Sequined (Filter Forge)', S_, 'Materials', 'S'),
    ('Mulberry Paper (Filter Forge)', S_, 'Materials', 'S'),
    ('Sandpaper (Filter Forge)', S_, 'Materials', 'S'),
    ('Corrugated Metal (Filter Forge)', S_, 'Materials', 'S'),
    ('Patina (Filter Forge)', S_, 'Materials', 'S'),
    ('Wax Seal (Filter Forge)', S_, 'Materials', 'S'),
    ('Realistic Vinyl record (Filter Forge)', S_, 'Materials', 'S'),
    ('Styrofoam Image (Filter Forge)', S_, 'Materials', 'S'),
    ('Suede (Filter Forge)', S_, 'Materials', 'S'),
    ('Thatched (Filter Forge)', S_, 'Materials', 'S'),
    ('Tin Can (Filter Forge)', S_, 'Materials', 'S'),
    ('Venetian Plaster (Filter Forge)', S_, 'Materials', 'S'),
    ('Wood Burning pyrography (Filter Forge)', S_, 'Paint', 'S'),
    ('Tire Tracks (Filter Forge)', S_, 'Render', 'S'),
    ('Ballpoint pen drawing (Filter Forge)', S_, 'Paint', 'S'),
    ('TV Circuit Bending (Filter Forge)', S_, 'Retro', 'S'),
    ('Sparkler (Filter Forge)', S_, 'Render', 'S'),
    ('Rutt-Etra scan-processor lines (Filter Forge)', S_, 'Retro', 'S'),
]

# --- Filter Forge library: texture categories (procedural material generators) ------------------------------------------
# Listing pages https://www.filterforge.com/filters/category42-page1..16.html (Organic), category43-page1..11.html (Techno),
# category47-page1..19.html (Building), category46-page1..12.html (Stone)
S_ = 'Filter Forge library 4 (textures)'
C += [
    ('Ammonite fossil texture (Filter Forge)', S_, 'Materials', 'S'),
    ('Asphalt road texture (Filter Forge)', S_, 'Materials', 'S'),
    ('Asphalt roof shingles (Filter Forge)', S_, 'Materials', 'S'),
    ('Bamboo texture (Filter Forge)', S_, 'Materials', 'S'),
    ('Barbed Wire Fence (Filter Forge)', S_, 'Materials', 'S'),
    ('Berber Carpet (Filter Forge)', S_, 'Materials', 'S'),
    ('Blood Cells (Filter Forge)', S_, 'Materials', 'S'),
    ('Carbon Fiber weave (Filter Forge)', S_, 'Materials', 'S'),
    ('Cardboard (Filter Forge)', S_, 'Materials', 'S'),
    ('Chain mail (Filter Forge Maille Maker)', S_, 'Materials', 'S'),
    ('Chicken Wire (Filter Forge)', S_, 'Materials', 'S'),
    ('Cinder Blocks (Filter Forge)', S_, 'Materials', 'S'),
    ('Coral Reef (Filter Forge)', S_, 'Materials', 'S'),
    ('Dry Lakebed cracked mud (Filter Forge)', S_, 'Materials', 'S'),
    ('Diamond tread plate (Filter Forge Diamond Plate)', S_, 'Materials', 'S'),
    ('Snake Scales (Filter Forge)', S_, 'Materials', 'S'),
    ('Expanded Metal Floor (Filter Forge)', S_, 'Materials', 'S'),
    ('Flagstones (Filter Forge)', S_, 'Materials', 'S'),
    ('Giraffe Skin (Filter Forge)', S_, 'Materials', 'S'),
    ('Greebles sci-fi detailing (Filter Forge)', S_, 'Materials', 'S'),
    ('Knurling (Filter Forge)', S_, 'Materials', 'S'),
    ('Malachite (Filter Forge)', S_, 'Materials', 'S'),
    ('Geode (Filter Forge)', S_, 'Materials', 'S'),
    ('Lichen Covered Stone (Filter Forge)', S_, 'Materials', 'S'),
    ('Pegboard (Filter Forge)', S_, 'Materials', 'S'),
    ('Woven Wicker (Filter Forge)', S_, 'Materials', 'S'),
    ('Spaceship Hull Plates (Filter Forge)', S_, 'Materials', 'S'),
    ('Speaker Grill (Filter Forge)', S_, 'Materials', 'S'),
    ('Stalactite Cave (Filter Forge)', S_, 'Materials', 'S'),
    ('Tatami Mat (Filter Forge)', S_, 'Materials', 'S'),
    ('Terrazzo Tiles (Filter Forge)', S_, 'Materials', 'S'),
    ('Travertine (Filter Forge)', S_, 'Materials', 'S'),
    ('Turtle shell (Filter Forge)', S_, 'Materials', 'S'),
    ('Wattle and Daub (Filter Forge)', S_, 'Materials', 'S'),
    ('Widmanstatten pattern (Filter Forge)', S_, 'Materials', 'S'),
    ('Iris of the Eye (Filter Forge)', S_, 'Render', 'S'),
    ('Swiss Cheese (Filter Forge)', S_, 'Materials', 'S'),
    ('Dendrite crystal growth (Filter Forge)', S_, 'Render', 'G'),
    ('Acoustic Ceiling Tile (Filter Forge)', S_, 'Materials', 'S'),
    ('Hazard warning stripes (Filter Forge)', S_, 'Render', 'S'),
    ('Detectable Warning Surface tactile paving (Filter Forge)', S_, 'Materials', 'S'),
    ('Solar Panels (Filter Forge)', S_, 'Materials', 'S'),
    ('Sewer Plate / manhole cover (Filter Forge)', S_, 'Materials', 'S'),
    ('Agar Plate / Petri Dish (Filter Forge)', S_, 'Materials', 'S'),
]

# --- Magic Bullet Looks tool reference (Maxon / Red Giant help) ---------------------------------------------------------
# https://help.maxon.net/rg/en-us/Content/html/13-MBL-film-tools.html , .../11-MBL-camera-tools.html ,
# .../12-MBL-matte-tools.html (Color tools)
S_ = 'Magic Bullet Looks tools'
C += [
    ('Telecine Net silk black-softening (Magic Bullet Looks)', S_, 'Film', 'S'),
    ('Shutter Streak film-gate light leak (Magic Bullet Looks)', S_, 'Film', 'S'),
    ('Huenity hue unification (Magic Bullet Looks)', S_, 'Color', 'S'),
    ('Haze/Flare uncoated-lens internal reflections (Magic Bullet Looks)', S_, 'Film', 'S'),
]

# --- Filter Forge library: Patterns and Misc texture categories ----------------------------------------------------------
# Listing pages https://www.filterforge.com/filters/category53-page1..43.html (Textures > Patterns) and
# category14-page1..46.html (Textures > Misc)
S_ = 'Filter Forge library 5 (pattern textures)'
C += [
    ('Arabesque pattern (Filter Forge)', S_, 'Render', 'S'),
    ('Celtic Knots (Filter Forge)', S_, 'Render', 'S'),
    ('Chevron Fabric Designs (Filter Forge)', S_, 'Render', 'S'),
    ('Islamic geometric tiling generator 8/12-way (Filter Forge)', S_, 'Render', 'S'),
    ('Quasicrystal pattern (Filter Forge)', S_, 'Render', 'S'),
    ('Quilt Square Generator (Filter Forge)', S_, 'Render', 'S'),
    ('Spiral Galaxy generator (Filter Forge)', S_, 'Render', 'S'),
    ('Escher Cube tumbling blocks (Filter Forge)', S_, 'Render', 'S'),
    ('Inca and Aztec Designs (Filter Forge)', S_, 'Render', 'S'),
    ('Tribal tattoo patterns (Filter Forge)', S_, 'Render', 'S'),
    ('Pinstripes (Filter Forge)', S_, 'Render', 'S'),
    ('Barber pole / candy-cane coil (Filter Forge)', S_, 'Render', 'S'),
]

# --- Red Giant Universe tools not covered by earlier Universe entries (Maxon help) ----------------------------------------
# Category index https://help.maxon.net/rg/en-us/Content/html/Cat_Distortions.html ; tool pages
# https://help.maxon.net/rg/en-us/Content/html/Distortions_prism-displacement.html , Blurs-and-Glows-quantum.html ,
# Transitions_swish-pan.html , Transitions_dolly-fade.html , Transitions_exposure-blur.html , Transitions_halflight.html ,
# Transitions_diamond-wave.html , Transitions_triangle-wave.html , Transitions_inside-cube.html , Transitions_channel-surf.html
S_ = 'Red Giant Universe 2'
C += [
    ('Prism Displacement oily/opalescent (Red Giant Universe)', S_, 'Distort', 'S'),
    ('Quantum animated light trail behind layer (Red Giant Universe)', S_, 'Render', 'S'),
    ('Swish Pan whip-pan transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Dolly Fade transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Exposure Blur flash transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('HalfLight solarize/light-beam transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Diamond Wave transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Triangle Wave transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Inside Cube transition (Red Giant Universe)', S_, 'Frames', 'X'),
    ('Channel Surf transition (Red Giant Universe)', S_, 'Frames', 'X'),
]

# --- Paint.NET Plugin Index, second pass (same source as the first Paint.NET block) --------------------------------------
# https://mattw.io/pdn-plugin-index/index/plugin-index.json
S_ = 'Paint.NET Plugin Index'
C += [
    ('SlinkyPlus ellipses along a curve (Paint.NET)', S_, 'Render', 'S'),
    ('Turbulent Circles smoke rings (Paint.NET Turbulent.Effects)', S_, 'Render', 'S'),
    ('Overliner colour-break outlines (Paint.NET)', S_, 'Edges', 'S'),
    ('Selective Enhancement spread/push colours near a target (Paint.NET)', S_, 'Color', 'S'),
    ('Volutes random curves (Paint.NET)', S_, 'Render', 'S'),
    ('Varicose wibbly lines (Paint.NET)', S_, 'Render', 'S'),
    ('Helix helical/spiral shapes (Paint.NET)', S_, 'Render', 'S'),
]

# --- Acorn (Flying Meat) filter reference ---------------------------------------------------------------------------------
# https://flyingmeat.com/acorn/docs/sharpen__stylize____misc.html (Stylize list with one-line descriptions)
S_ = 'Acorn filters'
C += [
    ('Fuzz Stroke fuzzy edge stroke (Acorn)', S_, 'Frames', 'S'),
]

# --- AugLy image augmentations (Meta) -------------------------------------------------------------------------------------
# Function list and docstrings read from https://raw.githubusercontent.com/facebookresearch/AugLy/main/augly/image/functional.py
S_ = 'AugLy image augmentations'
C += [
    ('Meme format caption bar (AugLy meme_format)', S_, 'Augment', 'S'),
    ('Overlay onto Instagram screenshot template (AugLy overlay_onto_screenshot)', S_, 'Augment', 'S'),
    ('Shuffle a fraction of pixels (AugLy shuffle_pixels)', S_, 'Augment', 'S'),
    ('Overlay emoji (AugLy overlay_emoji)', S_, 'Augment', 'S'),
    ('Clickbait text box overlay (AugLy overlay_random_text_with_background)', S_, 'Augment', 'S'),
    ('Ranking numbers overlay (AugLy ranking_numbers)', S_, 'Augment', 'S'),
]

# --- Augraphy document-image augmentations ----------------------------------------------------------------------------------
# Module list https://api.github.com/repos/sparkfish/augraphy/contents/augraphy/augmentations ; class docstrings read from
# https://raw.githubusercontent.com/sparkfish/augraphy/dev/augraphy/augmentations/<name>.py
S_ = 'Augraphy document augmentations'
C += [
    ('Bindings and fasteners overlay (Augraphy BindingsAndFasteners)', S_, 'Augment', 'S'),
    ('Book binding page curvature (Augraphy BookBinding)', S_, 'Augment', 'G'),
    ('Coloured paper tint (Augraphy ColorPaper)', S_, 'Augment', 'S'),
    ('Laser-printer dirty drum streaks (Augraphy DirtyDrum)', S_, 'Augment', 'S'),
    ('Scanner dirty-roller lines (Augraphy DirtyRollers)', S_, 'Augment', 'S'),
    ('Dirty scanner glass clusters (Augraphy DirtyScreen)', S_, 'Augment', 'S'),
    ('Ink mottling (Augraphy InkMottling)', S_, 'Augment', 'S'),
    ('Low-ink periodic lines (Augraphy LowInkPeriodicLines)', S_, 'Augment', 'S'),
    ('Low-ink random lines (Augraphy LowInkRandomLines)', S_, 'Augment', 'S'),
    ('Markup highlighter/strikethrough/underline (Augraphy Markup)', S_, 'Augment', 'G'),
    ('Page border stack edges (Augraphy PageBorder)', S_, 'Augment', 'S'),
    ('Hollow text via contour median (Augraphy Hollow)', S_, 'Augment', 'G'),
    ('Section shift (Augraphy SectionShift)', S_, 'Augment', 'S'),
    ('Reflected light glare ellipse (Augraphy ReflectedLight)', S_, 'Augment', 'S'),
    ('LCD screen photograph pattern (Augraphy LCDScreenPattern)', S_, 'Augment', 'S'),
    ('Ink shifter text displacement (Augraphy InkShifter)', S_, 'Augment', 'S'),
    ('Document side shadow cast (Augraphy ShadowCast)', S_, 'Augment', 'S'),
]

# --- Logik Matchbook, second pass (same catalogue page and shader descriptions as the first Matchbox block) -----------------
# https://logik-matchbook.org/
S_ = 'Logik Matchbook (Flame Matchbox shaders)'
C += [
    ('Fireworks generator (Matchbox crok_fireworks)', S_, 'Render', 'S'),
    ('Volumetric explosion (Matchbox crok_explosion_CFX)', S_, 'Render', 'S'),
    ('Flocking swarm position map (Matchbox Ls_Flock)', S_, 'Render', 'G'),
    ('Sky timelapse generator (Matchbox JB_skyLapse)', S_, 'Render', 'S'),
    ('Phone camera mockup matte (Matchbox MM_PhoneMatte)', S_, 'Frames', 'S'),
    ('Amiga-style parallax texture scroller (Matchbox crok_parallax)', S_, 'Retro', 'S'),
    ('Hypnotic spiral (Matchbox crok_client)', S_, 'Render', 'S'),
    ('Beer foam structure (Matchbox crok_beer)', S_, 'Render', 'S'),
    ('Ice structures (Matchbox crok_ice)', S_, 'Render', 'S'),
    ('Ocean noise pattern (Matchbox crok_ocean_noise)', S_, 'Noise', 'S'),
    ('fr-025 the.popular.demo tribute (Matchbox the_popular_demo)', S_, 'Render', 'S'),
    ('Folding reflection-map texture (Matchbox crok_folding)', S_, 'Render', 'S'),
]

# --- OBS plug-ins by FiniteSingularity (Retro Effects, Composite Blur) ---------------------------------------------------------
# README https://raw.githubusercontent.com/FiniteSingularity/obs-retro-effects/main/README.md (Cathode Boot, Retro Codec);
# shader list https://api.github.com/repos/FiniteSingularity/obs-composite-blur/git/trees/main?recursive=1 (pixelate_triakis.effect)
S_ = 'OBS FiniteSingularity plug-ins'
C += [
    ('Cathode Boot CRT on/off collapse (OBS Retro Effects)', S_, 'Retro', 'S'),
    ('Retro Codec RPZA 1995 webcam artifacts (OBS Retro Effects)', S_, 'Retro', 'S'),
    ('Triakis-tile pixelate (OBS Composite Blur)', S_, 'Stylize', 'S'),
]

# --- imagecorruptions (ImageNet-C) -------------------------------------------------------------------------------------------
# https://raw.githubusercontent.com/bethgelab/imagecorruptions/master/imagecorruptions/corruptions.py (glass_blur: local pixel
# shuffle iterations between Gaussian blurs)
S_ = 'imagecorruptions (ImageNet-C)'
C += [
    ('Glass blur local pixel shuffle (ImageNet-C glass_blur)', S_, 'Augment', 'S'),
]

# drops after the near-match / synonym review
DROP |= {
    'Fake HDR inverted-blur overlay (Paint.NET HDR)',              # = FakeHDR (alias already in filters.db)
    "Filaments light-writing curves (Paint.NET TR's)",             # = Filaments (G'MIC alias)
    'Mesh between touching labels (CLIJ2 drawMeshBetweenTouchingLabels)',  # = Region Adjacency Graph (MorphoLibJ)
    'Matrix Code digital rain (Filter Forge)',                      # = Matrix Rain
    'Fly-eye transition (gl-transitions flyeye)',                   # = Bee POV compound eye
}

# second synonym review (keyword searches over filters.db / rounds 9-17 names)
DROP |= {
    'Normalize Normal Map (Paint.NET)',                    # = Normal normalize (alias)
    'HSV Equalizer (RawTherapee)',                         # = Color Equalizer (darktable)
    "Bubble warp (Fred's bubblewarp)",                     # = Spherize
    'Corner Color Tint (ISF)',                             # = 4-Color Gradient tint
    'Sparkler (Filter Forge)',                             # = Sparkle
    'Sonar Screen (Filter Forge)',                         # = Radar Display (UnPlugged-X)
    'Infinity mirror blur tunnel (Filter Forge)',          # = Feedback (recursive reflection)
    'Hazard warning stripes (Filter Forge)',               # = Stripes overlay
    'Pinstripes (Filter Forge)',                           # = Stripes overlay
    'Chevron Fabric Designs (Filter Forge)',               # = ZigZag pattern
    'Quilt Square Generator (Filter Forge)',               # = Patchwork
    'Chalk on Blackboard (Filter Forge)',                  # = Chalk It Up / Chalk & Charcoal
    'Snake Scales (Filter Forge)',                         # = Reptile Skin (Eye Candy)
}

# --- WhiteboxTools (image_analysis and terrain_analysis tools) -----------------------------------------------------------
# Tool list https://api.github.com/repos/jblindsay/whitebox-tools/git/trees/master?recursive=1 (whitebox-tools-app/src/tools/);
# doc comments read from https://raw.githubusercontent.com/jblindsay/whitebox-tools/master/whitebox-tools-app/src/tools/<group>/<tool>.rs
S_ = 'WhiteboxTools'
C += [
    ('Balance Contrast Enhancement colour-bias removal (WhiteboxTools, Liu 1991)', S_, 'Tone', 'G'),
    ('High-pass bilateral filter (WhiteboxTools)', S_, 'Sharpen', 'S'),
    ('Diversity filter unique-value count (WhiteboxTools)', S_, 'Analysis', 'S'),
    ('Write function memory insertion change composite (WhiteboxTools)', S_, 'Analysis', 'X'),
    ('Change vector analysis (WhiteboxTools)', S_, 'Analysis', 'X'),
    ('Directional relief (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Downslope index (WhiteboxTools, Hjerdt 2004)', S_, 'Terrain', 'G'),
    ('Drainage-preserving DEM smoothing (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Wind fetch distance (WhiteboxTools Fetch Analysis)', S_, 'Terrain', 'G'),
    ('Max anisotropy of elevation deviation (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Maximum branch length divide map (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Maximal / minimal curvature (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Tangential curvature (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Spherical std dev of surface normals (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Average normal-vector angular deviation (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Circular variance of aspect (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Relative aspect to wind azimuth (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Sediment transport index (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Remove off-terrain objects bare-earth DEM (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Surface area ratio (WhiteboxTools)', S_, 'Terrain', 'S'),
    ('Time in daylight (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Multiscale topographic position image (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Visibility index (WhiteboxTools)', S_, 'Terrain', 'G'),
]

# --- WhiteboxTools, hydrology / statistics / patch-shape rasters (same tree; doc comments read per tool) -------------------
# https://raw.githubusercontent.com/jblindsay/whitebox-tools/master/whitebox-tools-app/src/tools/hydro_analysis/<tool>.rs ,
# .../math_stat_analysis/turning_bands.rs , image_correlation_neighbourhood_analysis.rs , .../gis_analysis/shape_complexity_raster.rs
S_ = 'WhiteboxTools'
C += [
    ('D-infinity flow accumulation (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('FD8 multiple-flow-direction accumulation (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Rho8 stochastic flow pointer (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Depth in sink (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Elevation above stream / HAND (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Impoundment size index (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Stochastic depression probability (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Least-cost depression breaching (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Downslope distance to stream (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Max upslope flowpath length (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Isobasins equal-area watersheds (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Strahler-order basins (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Hillslopes left/right of stream links (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Flood order (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Wang-Liu priority-flood depression fill (WhiteboxTools)', S_, 'Terrain', 'G'),
    ('Turning-bands random field (WhiteboxTools)', S_, 'Noise', 'G'),
    ('Local image correlation neighbourhood map (WhiteboxTools)', S_, 'Analysis', 'X'),
    ('Shape complexity raster transect index (WhiteboxTools)', S_, 'Analysis', 'G'),
]

# --- WhiteboxTools gis_analysis interpolation / cost tools (doc comments read from .../tools/gis_analysis/<tool>.rs) -----------
S_ = 'WhiteboxTools'
C += [
    ('Natural-neighbour (Sibson) interpolation from sparse samples (WhiteboxTools)', S_, 'Repair', 'G'),
    ('Radial-basis-function interpolation from sparse samples (WhiteboxTools)', S_, 'Repair', 'G'),
    ('TIN gridding linear interpolation (WhiteboxTools)', S_, 'Repair', 'G'),
    ('Cost-distance accumulation map (WhiteboxTools)', S_, 'Analysis', 'G'),
    ('Least-cost pathway (WhiteboxTools)', S_, 'Analysis', 'G'),
]

# --- ISF library, second pass (DESCRIPTION fields read from the same ISF/<name>.fs files) --------------------------------------
S_ = 'ISF shader library (Vidvox)'
C += [
    ('Motion Heat Map (ISF)', S_, 'Frames', 'X'),
    ('RGB Trails per-channel persistent buffer (ISF RGB Trails 3.0)', S_, 'Frames', 'X'),
    ('Random Freeze partial-region update (ISF)', S_, 'Frames', 'X'),
    ('Time Glitch RGB 8-frame channel buffer (ISF)', S_, 'Frames', 'X'),
]

# --- Augraphy, second pass (class docstrings read from the same augmentations/<name>.py files) ---------------------------------
S_ = 'Augraphy document augmentations'
C += [
    ('Lines degradation of gradient-formed lines (Augraphy LinesDegradation)', S_, 'Augment', 'G'),
    ('Noisy lines at fixed intervals (Augraphy NoisyLines)', S_, 'Augment', 'S'),
    ('Bleed-through simulation (Augraphy BleedThrough)', S_, 'Augment', 'X'),
]

# --- Fred's ImageMagick scripts and Logik Matchbook, second pass (same index pages as above) --------------------------------------
S_ = "Fred's ImageMagick scripts"
C += [
    ("Fisheye to strip panorama (Fred's fisheye2pano)", S_, 'Distort', 'S'),
    ("Interweave two images in swaths (Fred's interweave)", S_, 'Frames', 'X'),
]
S_ = 'Logik Matchbook (Flame Matchbox shaders)'
C += [
    ('Colour-proximity dilate/erode (Matchbox Ls_Dilate)', S_, 'Analysis', 'S'),
]

DROP |= {
    'Glass blur local pixel shuffle (ImageNet-C glass_blur)',  # = GlassBlur (albumentations alias)
    'Ballpoint pen drawing (Filter Forge)',                    # = Pen Drawing
    'Venetian Plaster (Filter Forge)',                         # = Plaster
}
