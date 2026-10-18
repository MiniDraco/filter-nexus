"""Round 13 raw candidates (input to dedupe13.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.
Every name here was read from a real menu, effect index, repo file listing, API, enum or doc page; how each block
was confirmed is noted in its header comment ("first-hand" = read from the source listing itself; "search" = from
web-search summaries of the vendor's docs). Concept duplicates of filters.db / rounds 9-12 entries were removed by
hand before listing (e.g. Corel Cubist = Cubism, Pinch/Punch = Bulge/Pinch, Dust and Scratch = Dust & Scratches).
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# --- Corel PHOTO-PAINT Effects menu -- first-hand: product.corel.com "Work with special effects" help page -----------
R = "Corel PHOTO-PAINT"
add(R, "Stylize", "S", "The Boss (PHOTO-PAINT)", "Smoked Glass (PHOTO-PAINT)", "Psychedelic (PHOTO-PAINT)",
    "Whirlpool (PHOTO-PAINT)", "Wet Paint (PHOTO-PAINT)", "Screen Door (PHOTO-PAINT)")
add(R, "Paint", "S", "Dabble (PHOTO-PAINT)", "Pen and Ink (PHOTO-PAINT)",
    "Water Marker (PHOTO-PAINT)", "Wave Paper (PHOTO-PAINT)", "Impressionist (PHOTO-PAINT)", "Sketch Pad (PHOTO-PAINT)")
add(R, "Blur", "S", "Directional Smooth (PHOTO-PAINT)", "Jaggy Despeckle (PHOTO-PAINT)")
add(R, "Sharpen", "S", "Adaptive Unsharp (PHOTO-PAINT)", "Directional Sharpen (PHOTO-PAINT)")
add(R, "Color", "S", "Spot Filter (PHOTO-PAINT)")
add(R, "Analysis", "S", "Bit Planes (PHOTO-PAINT)")
add(R, "Materials", "S", "Cobblestone (PHOTO-PAINT)", "Elephant Skin (PHOTO-PAINT)", "Stone texture (PHOTO-PAINT)")

# --- digiKam image editor -- first-hand: enums in core/libs/dimg/filters/fx/blurfxfilter.h, distortionfxfilter.h,
#     bw/bwsepiafilter.h (GitHub KDE/digikam master) -------------------------------------------------------------
R = "digiKam"
add(R, "Blur", "S", "Far Blur (digiKam)", "Softener Blur (digiKam)", "Shake Blur (digiKam)")
add(R, "Distort", "S", "Caricature (digiKam)", "Multiple Corners (digiKam)", "Block Waves (digiKam)",
    "Circular Waves (digiKam)")
add(R, "Film", "S", "Agfapan 25 (digiKam B&W)", "Agfapan 400 (digiKam B&W)", "Agfa 200X (digiKam B&W)",
    "Ilford SFX 200 (digiKam B&W)", "Ilford SFX 800 (digiKam B&W)", "Kodak HIE infrared (digiKam B&W)",
    "Ilford Delta 400 Pro 3200 (digiKam B&W)", "Cold Tone (digiKam B&W)", "Brown Tone (digiKam B&W)")

# --- CellProfiler -- first-hand: cellprofiler_library/opts/*.py (enhanceorsuppressfeatures, correctillumination-
#     calculate, smooth, threshold, makeprojection) and modules/morph.py operation list --------------------------
R = "CellProfiler"
add(R, "Analysis", "S", "Enhance Speckles (CellProfiler)", "Suppress Speckles (CellProfiler)", "Enhance Neurites (CellProfiler)",
    "Enhance Dark Holes (CellProfiler)", "Enhance Circles (CellProfiler)", "Enhance Texture (CellProfiler)",
    "Enhance DIC (CellProfiler)", "Enhance Line Structures (CellProfiler)", "Circular Average Filter (CellProfiler)")
add(R, "Repair", "G", "Illumination: Fit Polynomial (CellProfiler)", "Illumination: Splines background (CellProfiler)",
    "Illumination: Convex Hull (CellProfiler)")
add(R, "Edges", "G", "Robust Background threshold (CellProfiler)", "Max Intensity Percentage threshold (CellProfiler)",
    "Minimum Cross-Entropy threshold (Li)")
add(R, "Analysis", "X", "Brightfield projection (CellProfiler)", "Power projection (CellProfiler)", "Variance projection (CellProfiler)")
add(R, "Edges", "S", "Morph Branchpoints (CellProfiler)", "Morph Spur (CellProfiler)", "Morph Vbreak (CellProfiler)",
    "Morph Diag (CellProfiler)", "Morph OpenLines (CellProfiler)", "Morph Clean (CellProfiler)")
add(R, "Edges", "G", "Morph SkelPE (CellProfiler)")

# --- Tone mapping operators -- first-hand: GitHub tizian/tonemapper src/operators/ file listing ---------------------
R = "Tone mapping operators (tonemapper)"
# (Reinhard extended, Drago, ACES-Narkowicz, Hejl-Dawson, Lottes, Uchimura, Exponential are options of the existing
#  Tone Mapping (HDR) filter, and max-division / mean-value / exponentiation are trivial normalisations -- dropped)
add(R, "Tone", "S", "ACES filmic Hill fit", "ACES filmic Romain Guy fit", "Aldridge filmic",
    "Day filmic (Insomniac)", "Hable updated filmic")
add(R, "Tone", "G", "Ward contrast-based scale factor")

# --- Halftoning / dithering algorithms -- first-hand: robertkist/libdither README (algorithm example table) -----------
R = "libdither halftoning"
add(R, "Retro", "G", "Xot error diffusion", "Diagonal error diffusion", "Shiau-Fan error diffusion", "1D error diffusion",
    "Fake Floyd-Steinberg error diffusion", "Steve Pigeon error diffusion", "Stevenson-Arce error diffusion",
    "Robert Kist error diffusion", "Zhou-Fang variable error diffusion", "Direct Binary Search (DBS) halftoning",
    "Kacker-Allebach dithering", "Guo-Liu dot diffusion", "Mese-Vaidyanathan dot diffusion", "Lippens-Philips dot dithering",
    "Spiral dot diffusion", "Inverted spiral dot diffusion", "Optimized Knuth dot diffusion",
    "Modified Riemersma dither")
add(R, "Retro", "S", "Grid dither", "Central white-point ordered dither", "Balanced central white-point ordered dither",
    "Ulichney clustered-dot ordered dither", "Ulichney void dispersed-dots ordered dither", "Non-rectangular ordered dither",
    "Variable ordered dither", "Diagonal ordered dither", "ImageMagick circle ordered dither", "ImageMagick 45-degree ordered dither",
    "Pattern dither (3x3)")

# --- PaintShop Pro -- first-hand: Corel PaintShop Pro 2020 (v22) Scripting API command index ----------------------
R = "PaintShop Pro 2"
add(R, "Paint", "S", "Colored Chalk (PSP)", "Black Pencil (PSP)", "Brush Strokes (PSP)", "Toothbrush (PSP)")
add(R, "Edges", "S", "Colored Edges (PSP)")
add(R, "Stylize", "S", "Curlicues (PSP)", "Sunburst (PSP)", "Mosaic - Antique (PSP)", "Mosaic - Glass (PSP)")
add(R, "Materials", "S", "Sandstone (PSP)")
add(R, "Distort", "S", "Thinify (PSP)", "Magnifying Lens (PSP)")
add(R, "Tone", "G", "Backlighting correction (PSP)", "Fill Flash (PSP)", "Fade Correction (PSP)")
add(R, "Repair", "G", "Automatic Small Scratch Removal (PSP)")

# --- Colour constancy / auto white balance -- search: van de Weijer, Gevers & Gijsenij "Edge-based color constancy"
#     (IEEE TIP 2007) and Gijsenij et al. PAMI 2011 survey; Grey World also first-hand as PSP "GreyWorld" command ----
R = "Colour constancy algorithms"
# (Gray world, White patch, Shades of gray and Gray edge are methods of the existing Color Constancy filter;
#  Forsyth gamut mapping is already listed -- dropped)
add(R, "Color", "G", "Weighted Grey-Edge white balance", "Gray Pixel illuminant estimation", "Bright Pixels illuminant estimation",
    "Colour by Correlation (Finlayson)", "Fast Fourier Color Constancy (FFCC)")
add(R, "Color", "M", "FC4 confidence-weighted colour constancy")

# --- SAR speckle filters -- first-hand: NV5/ENVI "Adaptive Filters" doc page (Bit Error, Local Sigma, Gamma);
#     search: ESA SNAP Single Product Speckle Filter list (Gamma Map, Refined Lee, Improved Lee Sigma) ---------------
R = "SAR speckle 2"
# (Refined Lee is an alias of the existing speckle filter; Lee sigma is one of its methods -- dropped)
add(R, "Noise", "S", "Gamma-MAP speckle filter", "Local Sigma filter (ENVI)", "Bit Error filter (ENVI)")
add(R, "Noise", "X", "Multitemporal speckle filter (Quegan)")

# --- Demoscene effects (applied to / rendered over an image) -- search: demoscene effect glossaries -------------------
R = "Demoscene effects"
add(R, "Distort", "S", "Rotozoomer")
add(R, "Retro", "S", "Raster bars", "Kefrens bars", "Starfield overlay")
add(R, "Render", "S", "Metaballs", "Voxel Space terrain render (Comanche)")

# (pmm, p4m, cmm are options of the existing Seamless Deco filter -- dropped)
# --- Wallpaper & frieze symmetry groups (Filter Forge "Wallpaper Group" filter series; IUCr crystallographic notation;
#     frieze nicknames from Conway) -- first-hand for Filter Forge listing "Wallpaper Group 14 p3m1" ------------------
R = "Symmetry groups"
add(R, "Distort", "S", "Wallpaper group p1", "Wallpaper group p2", "Wallpaper group pm", "Wallpaper group pg",
    "Wallpaper group cm", "Wallpaper group pmg", "Wallpaper group pgg",
    "Wallpaper group p4", "Wallpaper group p4g", "Wallpaper group p3", "Wallpaper group p3m1",
    "Wallpaper group p31m", "Wallpaper group p6", "Wallpaper group p6m",
    "Frieze group hop (p1)", "Frieze group step (p11g)", "Frieze group sidle (p1m1)", "Frieze group spinning hop (p2)",
    "Frieze group spinning sidle (p2mg)", "Frieze group jump (p11m)", "Frieze group spinning jump (p2mm)")

# --- Topaz Studio 2 -- first-hand: topazlabs.com/studio-2-filters/ (Essential / Creative / Stylistic lists) -----------
R = "Topaz Studio 2"
add(R, "Tone", "S", "Precision Contrast (Topaz Studio)", "Precision Detail (Topaz Studio)", "Edge Exposure (Topaz Studio)",
    "Radiance (Topaz Studio)")
add(R, "Color", "G", "Color Theme (Topaz Studio)")
add(R, "Sharpen", "M", "AI Clear (Topaz Studio)")
add(R, "Stylize", "M", "AI Remix (Topaz Studio)")

# --- Nuke -- first-hand: learn.foundry.com Nuke reference guide, Filter nodes and Color nodes pages ----------------------
R = "Nuke 2"
add(R, "Materials", "S", "BumpBoss (Nuke)")
add(R, "Noise", "S", "DegrainBlue (Nuke)")
add(R, "Repair", "S", "EdgeExtend (Nuke)")
add(R, "Stylize", "S", "GodRays (Nuke)")
add(R, "Depth", "S", "VolumeRays (Nuke)")
add(R, "Color", "S", "CrossTalk (Nuke)", "PLogLin (Nuke)")
add(R, "Tone", "S", "SoftClip (Nuke)", "RollOffContrast (Nuke)")
add(R, "Tone", "G", "MinColor (Nuke)")
add(R, "Repair", "G", "IBKColour clean-plate (Nuke)")
add(R, "Color", "X", "MatchGrade (Nuke)", "LightWrap (Nuke)")
# Nuke Draw / Transform / Keyer node pages (first-hand, same reference guide)
add(R, "Analysis", "S", "HueKeyer (Nuke)", "Primatte keyer", "Ultimatte keyer", "IBKGizmo keyer (Nuke)")
add(R, "Sharpen", "G", "TVIScale total-variation upscale (Nuke)")
add(R, "Repair", "G", "MarkerRemoval (Nuke)")
add(R, "Distort", "X", "STMap UV remap (Nuke)", "IDistort vector displace (Nuke)")
add(R, "Film", "X", "ScannedGrain (Nuke)")

# --- Fusion -- first-hand: Blackmagic "Fusion 7 Tool Reference" PDF outline (documents.blackmagicdesign.com) -----------
R = "Fusion 2"
add(R, "Blur", "S", "VariBlur (Fusion)")
add(R, "Tone", "G", "Auto Gain (Fusion)")
add(R, "Distort", "S", "Dent (Fusion)")
add(R, "Render", "S", "Day Sky (Fusion)")
add(R, "Analysis", "S", "Ultra Keyer (Fusion)")
add(R, "Depth", "S", "Z to World position (Fusion)")
add(R, "Blur", "X", "Trails (Fusion)")

# --- Perceptual image hashes (visualised hash grids) -- first-hand: JohannesBuchner/imagehash README; PDQ from
#     facebook/ThreatExchange (search); Blockhash (search: blockhash.io, Yang et al. 2006) ----------------------------
R = "Image hashing"
add(R, "Analysis", "G", "Average hash (aHash)", "Perceptual hash (pHash, DCT)", "Difference hash (dHash)", "Wavelet hash (wHash)",
    "HSV colour hash (colorhash)", "Crop-resistant hash (segment-based)", "PDQ hash (Meta)", "Blockhash (Yang)")

# --- Colour-vision-deficiency models -- first-hand: DaltonLens-Python README (Viénot 1999, Brettel 1997, Machado 2009;
#     Machado already in filters.db) -------------------------------------------------------------------------------------
R = "Colour vision deficiency"
add(R, "Color", "S", "Brettel 1997 dichromacy simulation", "Viénot 1999 dichromacy simulation")

# --- Bokeh characters not yet listed -- search: catadioptric (mirror) lens and Meyer Trioplan bokeh descriptions --------
R = "Optics 2"
add(R, "Blur", "S", "Mirror-lens donut bokeh", "Soap-bubble bokeh (Trioplan)")

# --- VSCO preset collections (one representative per collection not yet in filters.db: A6, AL3, B1, C1, F2, HB1, J2,
#     KK1, M5, T1 are known) -- first-hand: VSCO help-centre "Preset Guide" (intercom.help/vsco/en/articles/12698471) ---
R = "VSCO 2"
add(R, "Insta", "S", "VSCO 01 (Legacy)", "VSCO A1 (Analog Archetype)", "VSCO A4 (Analog Aesthetic)", "VSCO AGA1 (Agave)",
    "VSCO C4 (Chromatic)", "VSCO D1 (Distortia)", "VSCO DOG1 (Isle of Dogs)", "VSCO E1 (Essence)", "VSCO G4 (Portrait)",
    "VSCO H1 (Polychrome)", "VSCO IND1 (Indigo)", "VSCO INF (Infatuation)", "VSCO IR1 (Infrared Landscape)",
    "VSCO IR3 (Infrared Black & White)", "VSCO IR6 (Infrared cool foliage)", "VSCO JM1 (Jimmy Marble)",
    "VSCO K1 (Analog Classic)", "VSCO L1 (Landscape)", "VSCO LV2 (Levi's B&W)", "VSCO M1 (Mood: Underexposed)",
    "VSCO N1 (New Modern)", "VSCO NC (Neocha)", "VSCO OAK1 (Oakley PRIZM)", "VSCO OC (Opening Ceremony)",
    "VSCO P1 (Instant Warm)", "VSCO P4 (Instant Cool)", "VSCO P7 (Instant Classic)", "VSCO Q1 (Alchemy)",
    "VSCO S1 (Bright + Clean)", "VSCO S4 (Bright + Warm)", "VSCO SE1 (Street Etiquette)", "VSCO SS1 (Street Style)",
    "VSCO SUM1 (Sumac)", "VSCO TECH (black-red duotone)", "VSCO TK (Ta-Ku)", "VSCO U1 (Urban)", "VSCO V1 (Low-Contrast)",
    "VSCO X1 (B&W Fade)", "VSCO WE1 (We The Creators)", "VSCO MTV", "VSCO ACG (NikeLab)", "VSCO BBMA")

# --- Neural stylisation models -- first-hand: ONNX model zoo fast_neural_style README (Mosaic, Candy, Rain Princess,
#     Udnie, Pointilism); lengstrom/fast-style-transfer README (Wave, La Muse, The Scream, Shipwreck); junyanz
#     pytorch-CycleGAN-and-pix2pix download script (style_monet/cezanne/ukiyoe/vangogh, iphone2dslr_flower,
#     summer2winter); bryandlee/animegan2-pytorch README; CartoonGAN-Test README (Hayao/Hosoda); White-box Cartoonization,
#     Anime2Sketch and Informative Drawings READMEs. Arbitrary-style methods (AdaIN, WCT, PhotoWCT, SANet, AdaAttN, StyTr2)
#     from their papers (search) -------------------------------------------------------------------------------------------
R = "Neural stylisation"
add(R, "Paint", "M", "Fast neural style: Mosaic", "Fast neural style: Candy", "Fast neural style: Rain Princess",
    "Fast neural style: Udnie", "Fast neural style: Pointilism", "Fast neural style: Wave (Hokusai)",
    "Fast neural style: La Muse", "Fast neural style: The Scream", "Fast neural style: Shipwreck of the Minotaur",
    "CycleGAN photo to Monet", "CycleGAN photo to Van Gogh", "CycleGAN photo to Cezanne", "CycleGAN photo to Ukiyo-e",
    "AdaIN arbitrary style transfer", "WCT universal style transfer", "SANet style-attentional transfer",
    "AdaAttN style transfer", "StyTr2 transformer style transfer")
add(R, "Color", "M", "PhotoWCT photorealistic style transfer", "CycleGAN summer to winter", "CycleGAN iPhone to DSLR (shallow depth)")
# (AnimeGANv2 and Informative Drawings are already in filters.db -- dropped)
add(R, "Stylize", "M", "CartoonGAN Hayao style", "CartoonGAN Hosoda style", "White-box Cartoonization")
add(R, "Edges", "M", "Anime2Sketch line extraction")

# --- manual concept-duplicate drops (reviewed from dedupe13 near-match list) -------------------------------------------
DROP = {
    "Impressionist (PHOTO-PAINT)",            # = GIMPressionist brush-stroke impressionism
    "Sketch Pad (PHOTO-PAINT)",               # = Pencil Sketch
    "Kodak HIE infrared (digiKam B&W)",       # = Infrared (B&W infrared film look)
    "Enhance Speckles (CellProfiler)",        # = white top-hat (CellProfiler's own upgrade table says so)
    "Suppress Speckles (CellProfiler)",       # = grey opening
    "Enhance Neurites (CellProfiler)",        # = Tubeness (known)
    "Enhance Circles (CellProfiler)",         # = Hough circle accumulator (known)
    "Enhance Texture (CellProfiler)",         # = local variance
    "Circular Average Filter (CellProfiler)", # = disk mean
}

# --- G'MIC community filters -- first-hand: "#@gui" entries in GreycLab/gmic src/gmic_stdlib.gmic and every file in
#     GreycLab/gmic-community/include/ (author noted); only names absent from filters.db and not concept duplicates ------
R = "G'MIC map projections"
add(R, "Distort", "S", "Albers equal-area conic projection", "Azimuthal equidistant projection", "Equidistant conic projection",
    "Cylindrical equal-area projection", "Eckert IV projection", "Eckert VI projection", "Lambert azimuthal equal-area projection",
    "Lambert conformal conic projection", "Orthographic globe projection", "Sinusoidal (Sanson-Flamsteed) projection",
    "Triangular map projection (G'MIC)", "Rotate equirectangular map (G'MIC)")
R = "G'MIC community"
add(R, "Paint", "S", "Colour Abstraction Paint (Arto Huotari)", "Morphology Painting (Arto Huotari)", "Make Squiggly (Arto Huotari)",
    "Illustration Look (G'MIC)", "Finger Paint (Garry Osgood)", "Hair Locks (Garry Osgood)", "Hedcut (Garry Osgood)",
    "Threshold Etch (Andy Kelday)", "Multi-Layer Etch (Andy Kelday)", "Black Crayon Graffiti (PhotoComiX)",
    "B&W Steampunk Pencil (PhotoComiX)", "Isophotes to watercolour (samj)")
add(R, "Color", "S", "Colour Space Swap (Joan Rake)", "Hue Lighten/Darken (Iain Fergusson)", "Saturation EQ (Iain Fergusson)",
    "Dark Sky (afre)", "Jpr Colour Illusion (James Prichard)", "Rainbowify (Reptorian)", "Gilding / Dorure (samj)")
add(R, "Distort", "S", "Auto-Gnarl (Joan Rake)", "PowerTwirl (Joan Rake)", "Spiral Matrix Transformation (Joan Rake)",
    "Layer Cake (Joan Rake)", "Rays from Image (Joan Rake)", "Jpr Warp from Threshold (James Prichard)",
    "Popcorn fractal warp (Reptorian)", "Rotate by Torus Map (Reptorian)", "Perspective Streak (Reptorian)",
    "Axis Streak (Reptorian)", "Pixel Push (Reptorian)", "Stitch Distort (Reptorian)", "Moon to panorama (G'MIC)")
add(R, "Retro", "S", "Pseudo-ECB block-cipher glitch (Joan Rake)", "Faux-QAM glitch (Joan Rake)", "Sawtoother (Joan Rake)",
    "Shredder (Joan Rake)", "Superstreak (Joan Rake)", "Row Shifter (Joan Rake)")
add(R, "Retro", "G", "Cascading Self Glitching (Joan Rake)")
add(R, "Sharpen", "S", "Constrained Sharpen (Iain Fergusson)", "YAG Effect (Arto Huotari)", "Local Variance Normalization (G'MIC)")
add(R, "Sharpen", "G", "Undo Unsharp Mask (G'MIC)")
add(R, "Repair", "G", "Banding Denoise (Iain Fergusson)", "Clean Text (afre)", "Recursive Median (Iain Fergusson)",
    "Repair Scanned Document (G'MIC)", "Unstrip (G'MIC)", "Brown Spot Clean (G'MIC)")
add(R, "Edges", "S", "Jpr Oriented Thinning (James Prichard)", "Non-Convolution Edge Extraction (Reptorian)",
    "Autofill Coloring Book (Reptorian)", "Blur by Color (Garry Osgood)")
add(R, "Materials", "S", "Jpr Specular Bumps (James Prichard)", "ABN Filigrees (Garry Osgood)", "Denim Texture (samj)")
add(R, "Analysis", "S", "Skin Mask (G'MIC)")
add(R, "Analysis", "G", "Reverse Engineer Gradient Map (Reptorian)")
R = "G'MIC math renders"
add(R, "Render", "S", "Penrose Tiling (G'MIC)", "Hitomezashi stitch pattern", "Markus-Lyapunov fractal", "Hénon phase diagram",
    "Chirikov-Taylor standard map", "Harmonograph", "Pintograph", "Pythagoras tree", "Chryzodes (G'MIC)", "Cosmic Nebula (G'MIC)",
    "Thorn Fractal / Secant Sea (Reptorian)", "Neon Carpet (Claude Lion)", "Tangential Circles (Claude Lion)",
    "Ellsworth Kelly Board (Reptorian)", "Tupper's self-referential formula")
add(R, "Render", "G", "Diffusion-limited aggregation")
R = "G'MIC community"
add(R, "Depth", "G", "Automatic Depth Estimation (Tom Keil)", "Undo Anaglyph (G'MIC)")
add(R, "Depth", "X", "Lenticular Print (Tom Keil)")
DROP |= {"Bit Planes (PHOTO-PAINT)"}   # = "Bit plane" option of the existing Mess With Bits filter

# --- Medical-imaging augmentations -- first-hand: MONAI monai/transforms/__init__.py exports (Rand*); TorchIO from
#     docs.torchio.org augmentation page (search summary) ----------------------------------------------------------------
R = "Medical augmentation (MONAI / TorchIO)"
add(R, "Augment", "G", "MRI motion artifact (TorchIO RandomMotion)", "MRI ghosting artifact (TorchIO RandomGhosting)",
    "MRI k-space spike artifact (TorchIO RandomSpike)", "Gibbs ringing noise (MONAI RandGibbsNoise)",
    "K-space spike noise (MONAI RandKSpaceSpikeNoise)")
add(R, "Augment", "S", "MRI bias-field simulation (TorchIO RandomBiasField)", "Rician noise (MONAI RandRicianNoise)",
    "Anisotropic resolution simulation (TorchIO RandomAnisotropy)", "Simulate low resolution (MONAI)",
    "Smooth-field contrast adjust (MONAI)", "Smooth-field intensity adjust (MONAI)", "Smooth-field deform (MONAI)",
    "Random intensity remap (MONAI)", "Random patch swap (TorchIO RandomSwap)")
add(R, "Augment", "M", "Labels to image synthesis (TorchIO RandomLabelsToImage)")

# --- small leftovers --------------------------------------------------------------------------------------------------
R = "BoltBait pack"   # first-hand: boltbait.com/pdn plug-in pack page
add(R, "Sharpen", "S", "Sharpen Landscape (BoltBait)")
DROP |= {"Minimum Cross-Entropy threshold (Li)",   # Li is a method of the existing Auto Threshold (global) filter
         "Brown Tone (digiKam B&W)"}              # = sepia toning

# --- PhotoDemon -- first-hand: tannerhelland/PhotoDemon PhotoDemon.vbp form list (Effects_* / Adjustments_*) -------------
R = "PhotoDemon"
add(R, "Distort", "S", "Figured Glass (PhotoDemon)", "Donut (PhotoDemon)", "Poke (PhotoDemon)", "Squish (PhotoDemon)")
add(R, "Stylize", "S", "Modern Art (PhotoDemon)", "Black Light (PhotoDemon)", "Atmosphere (PhotoDemon)", "Ignite (PhotoDemon)",
    "Portrait Glow (PhotoDemon)")
add(R, "Edges", "S", "Gradient Flow (PhotoDemon)")

# --- Photoshop Elements guided edits -- search: helpx.adobe.com Photoshop Elements "Guided mode" page --------------------
R = "Photoshop Elements guided edits"
add(R, "Blur", "S", "Speed Effect (Elements)")
add(R, "Film", "S", "Old Fashioned Photo (Elements)")

# --- Corel Painter Effects > Esoteric / Surface Control leftovers -- search: Corel Painter help --------------------------
R = "Corel Painter 2"
add(R, "Stylize", "S", "Pop Art Fill (Painter)", "Grid Paper (Painter)")
add(R, "Distort", "S", "Glass Distortion (Painter)")

# --- Pratt "Digital Image Processing" first-order gradient operator catalogue -- textbook (search) -------------------------
R = "Textbook classics 4"
add(R, "Edges", "S", "Pixel difference gradient (Pratt)", "Separated pixel difference gradient (Pratt)",
    "Boxcar edge operator (Pratt)", "Truncated pyramid edge operator (Pratt)")

# --- Scientific colour tables -- first-hand: NV5/IDL "Loading Default Color Tables" (LOADCT 0-40; CB-* = ColorBrewer and
#     STERN SPECIAL = gist_stern, B-W LINEAR, RAINBOW, PLASMA, OCEAN, BLUE-RED skipped as known); Kenneth Moreland
#     "Color Map Advice" page (first-hand); MATLAB sky / abyss colormaps (search) -------------------------------------------
R = "Colormaps: IDL"
add(R, "Analysis", "S", "IDL Blue/White", "IDL Grn-Red-Blu-Wht", "IDL Red Temperature", "IDL Blue/Green/Red/Yellow",
    "IDL Std Gamma-II", "IDL Prism", "IDL Red-Purple", "IDL Green/White Linear", "IDL Grn/Wht Exponential", "IDL Green-Pink",
    "IDL 16 Level", "IDL Steps", "IDL Haze", "IDL Blue-Pastel-Red", "IDL Pastels", "IDL Hue Sat Lightness",
    "IDL Hue Sat Value", "IDL Purple-Red + Stripes", "IDL Beach", "IDL Mac Style", "IDL Eos A", "IDL Eos B",
    "IDL Hardcandy", "IDL Nature", "IDL Peppermint", "IDL Blue Waves", "IDL Volcano", "IDL Waves", "IDL Rainbow18",
    "IDL Rainbow + white", "IDL Rainbow + black")
R = "Colormaps: Moreland / MATLAB"
add(R, "Analysis", "S", "Moreland Smooth Cool Warm", "Moreland Bent Cool Warm", "Moreland Black Body", "Moreland Fast",
    "Kindlmann colormap", "Extended Kindlmann colormap", "MATLAB sky colormap", "MATLAB abyss colormap")

# --- darktable leftovers -- first-hand: docs.darktable.org processing-modules index (development manual) -----------------
R = "darktable 2"
add(R, "Film", "S", "spektrafilm (darktable)")
add(R, "Color", "S", "color equalizer (darktable)")
add(R, "Color", "G", "unbreak input profile (darktable)")

# --- gThumb special effects -- first-hand: GNOME/gthumb po/POTFILES.in (src/Ext/Editor/SpecialEffects/*.vala) -------------
R = "gThumb"
add(R, "Insta", "S", "gThumb Arctic", "gThumb Cherry", "gThumb Mango", "gThumb Desert")
add(R, "Frames", "S", "gThumb Blurred Edges")

# --- 8-bit computer graphics modes -- first-hand: studiostyle.sk Dmagic "C64 graphics modes" page (HiRes, MultiColor,
#     MCI, FLI, HiRes FLI, IFLI, SHF, SHI); search: Wikipedia Thomson MO5 / attribute clash (8x1 colour areas) -------------
R = "Retro 3 (computer graphics modes)"
add(R, "Retro", "G", "C64 HiRes bitmap (2 colours per 8x8 cell)", "C64 MultiColor bitmap (4 colours per 4x8 cell)",
    "C64 FLI mode", "C64 HiRes FLI mode", "C64 IFLI interlaced mode", "C64 MCI multicolour interlace",
    "C64 Super Hires FLI (SHF)", "Thomson MO5 8x1 colour clash")
DROP |= {"Row Shifter (Joan Rake)",                  # = Row Shift (known)
         "Cascading Self Glitching (Joan Rake)",     # variant of G'MIC Self Glitching (known)
         "Gibbs ringing noise (MONAI RandGibbsNoise)"}  # = Ringing / Overshoot augmentation

# --- G'MIC "Testing" folder (community authors) -- first-hand: same #@gui extraction as above ---------------------------
R = "G'MIC testing (community)"
add(R, "Stylize", "S", "Turbulent Halftone (Iain Fergusson)", "Charred Plastic (Joan Rake)", "Whirling Lines (Joan Rake)",
    "Psychedelic Glasswork Tiler (PhotoComiX)", "Metallic Stencils (PhotoComiX)", "Sketchy Ellipses (Prawnsushi)",
    "Complexion Burst (Reptorian)")
add(R, "Distort", "S", "Grouped Pixel Axis-Based Shift (Reptorian)", "Strange Bulger (Reptorian)",
    "Logarithmic Distortion (Reptorian)", "Tiled Zoom (Reptorian)")
add(R, "Blur", "S", "Gaussian Blur by Color Space (Reptorian)")
add(R, "Render", "S", "Prime Surface (Reptorian)", "Three-Coupled Oscillators (Reptorian)")

# --- OpenCV ximgproc leftovers -- first-hand: opencv_contrib modules/ximgproc/src file listing ----------------------------
R = "OpenCV contrib 2"
add(R, "Blur", "G", "Fast Global Smoother (ximgproc)")


add(R, "Edges", "G", "Edge Drawing / EDLines (ximgproc)", "EdgeBoxes object proposals (ximgproc)")
add(R, "Edges", "M", "Structured forest edge detection (ximgproc)")
R = "G'MIC testing (community)"
add(R, "Materials", "S", "Construction Material Texture (Reptorian)", "Color Modulo Texture (Reptorian)",
    "Binary Alternating Quaddro Texture (Reptorian)")
add(R, "Stylize", "S", "Random Rectangle Division (Reptorian)", "Line Spam (Prawnsushi)", "Little Boxy Things (Prawnsushi)",
    "Color Stamp (PhotoComiX)", "Spiral RGB (Martin Souphead)")
add(R, "Blur", "S", "Smoothelate (Prawnsushi)")

DROP |= {"Gamma-MAP speckle filter",                     # = Gamma-MAP filter (filters.db)
         "Fast Global Smoother (ximgproc)",              # = ximgproc.fastGlobalSmootherFilter alias
         "Edge Drawing / EDLines (ximgproc)",            # = EdgeDrawing / EDLines (filters.db)
         "EdgeBoxes object proposals (ximgproc)",        # = EdgeBoxes (filters.db)
         "Structured forest edge detection (ximgproc)"}  # = Structured forest edges (filters.db)
