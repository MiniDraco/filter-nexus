"""Round 14 raw candidates (input to dedupe14.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.
How each block was confirmed is noted in its header ("first-hand" = read from the source listing, repo tree,
enum or API itself; "search" = from web-search summaries / literature knowledge checked by search).
Concept duplicates of filters.db / rounds 9-13 were removed by hand with a regex sweep over every known name
before listing (e.g. GPUImage Haze = Dehaze, pixi Godray = GodRays, FF Droste Spiral, FFmpeg dedot/removelogo,
AviSynth FineDehalo/HQDering/MAA2 = known dehalo/dering/anti-alias, Prisma Candy/Mosaic/Udnie/Wave/Scream =
fast-neural-style entries).
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# --- Filter Forge library: Photo category -- first-hand: filterforge.com/filters/category52-page1..6.html -------
R = "Filter Forge: Photo"
add(R, "Insta", "S", "Caffenol (Filter Forge)", "Dan Margulis' Bigger Hammer (Filter Forge)", "Summer Heat (Filter Forge)", "Because The Night (Filter Forge)", "Horror Film (Filter Forge)",
    "Movie Poster (Filter Forge)", "Toycam-68 (Filter Forge)", "Toycam-82 (Filter Forge)",
    "Random Retro Camera (Filter Forge)", "Retro Hipster Analog Photo (Filter Forge)", "Snow photo (Filter Forge)",
    "Kings of Sepia (Filter Forge)", "Pure Silver B&W (Filter Forge)", "Extremely Low-Fi (Filter Forge)",
    "Ethereal Photo Effect (Filter Forge)", "Vintage Victorian (Filter Forge)", "Vintage Memory Delight (Filter Forge)",
    "Washed-out Vintage (Filter Forge)", "Insta-Hips (Filter Forge)", "Glo-Fi Rainout (Filter Forge)",
    "Low-Fi Paranormal Lighting (Filter Forge)", "Aether Dream (Filter Forge)", "Creamy Colors (Filter Forge)",
    "Developed with Luv (Filter Forge)", "White Photo (Filter Forge)", "What kind of camera is that? (Filter Forge)")
add(R, "Tone", "S", "Youthful Glow (Filter Forge)", "Eerie Glow (Filter Forge)", "Midtone Enhancer (Filter Forge)",
    "Freaky detail (Filter Forge)", "Detail Multiplier (Filter Forge)", "Focus Popper (Filter Forge)",
    "Betterizer (Filter Forge)", "Smoove (Filter Forge)", "Luminosity Contrast (Filter Forge)",
    "Silver Dust (Filter Forge)", "Strange Aura Filter (Filter Forge)", "Mystic Mood Light (Foxxee, Filter Forge)")
add(R, "Color", "S", "Color Gravity (Filter Forge)", "Color Harmonies (Filter Forge)", "Color Diad (Filter Forge)",
    "Bi-Color (Filter Forge)", "Goldleaf (Filter Forge)", "BlackLight (Filter Forge)", "Lab Colorizer (Filter Forge)",
    "Changing Seasons (Filter Forge)", "SeeStar Rainbow (Filter Forge)")
add(R, "Render", "S", "Dappled Light (Filter Forge)", "Light Pollution (Filter Forge)", "The Photon Chamber (Filter Forge)", "Ambient Dust Overlay (Filter Forge)")
add(R, "Sharpen", "S", "Noise Tolerant Photo Sharpen (Filter Forge)", "Light controled Sharpen (Filter Forge)",
    "Contrastic Sharpener (Filter Forge)")
add(R, "Retro", "S", "Scanline Master 3000 (Filter Forge)", "LOMO Indicator (Filter Forge)")
add(R, "Paint", "S", "Scrimshaw Etching (Foxxee, Filter Forge)", "Ink And Paper Artist (Foxxee, Filter Forge)",
    "KRM Loose Painting (Filter Forge)", "Japanese Style Cell Shading (Filter Forge)")
add(R, "Blur", "S", "Faux bokeh (Filter Forge)", "Wax Blur (Filter Forge)")
add(R, "Repair", "S", "Stamp Remover (Filter Forge)", "Rejuvenate Newspapers & Documents (Filter Forge)")

# --- Filter Forge: Distortions -- first-hand: category45-page1..6.html -----------------------------------------
R = "Filter Forge: Distortions"
add(R, "Distort", "S", "Shattered Into Wreckage (Filter Forge)", "Dragon Distort (Filter Forge)", "Trixelate (Filter Forge)",
    "Ultramaki Uzumaki (Filter Forge)", "Rain Ripples (Filter Forge)", "Real Wind (Filter Forge)",
    "Data Bending (Filter Forge)", "Edge Echo (Filter Forge)", "Eroding Pixels (Filter Forge)",
    "Cube Wall (Filter Forge)", "Image Cube (Filter Forge)", "Image Smasher (Filter Forge)", "Recutter (Filter Forge)",
    "Multi Slice (Filter Forge)", "Offset Madness (Filter Forge)", "Swirling Dervish (Filter Forge)",
    "Squircles (Filter Forge)", "Art Deco Glass Blocks (Filter Forge)", "Chaos Ripples (Filter Forge)",
    "Color Bloat (Filter Forge)", "Luminance Bloat (Filter Forge)", "Under Water Bubbles (Filter Forge)",
    "Water Splatter (Filter Forge)", "Smooth Remap to Sphere (Filter Forge)", "uberLENS (Filter Forge)",
    "Wamble Bomb (Filter Forge)", "Distorted Echo Mask (Filter Forge)", "Bee POV (Filter Forge)",
    "Bee Honeycomb (Filter Forge)", "Broken mirror (Filter Forge)", "Bumpy Glass (Filter Forge)",
    "Coy's Ripple Surface (Filter Forge)", "Crumpled Paper (Filter Forge)", "Distorted Spiderweb (Filter Forge)",
    "Extreme Flat Fisheye (Filter Forge)", "Fast RGB Wind Separator (Filter Forge)", "Heart Warp (Filter Forge)",
    "Hot Glass Distortion (Filter Forge)", "Image Circle Nudger (Filter Forge)", "Lamé Curve (Filter Forge)",
    "Quad Remapper (Filter Forge)", "Relative Cartesian Transform (Filter Forge)", "Ripples in Time (Filter Forge)",
    "Shuffle by Numbers (Filter Forge)", "The Streaker (Filter Forge)", "Twisterize (Filter Forge)",
    "VacuForm (Filter Forge)", "Warped Glass (Filter Forge)", "Wet Net (Filter Forge)", "Wispy Squimsh (Filter Forge)",
    "clear jelly (Filter Forge)", "uberOOZE (Filter Forge)", "sphere town (Filter Forge)",
    "Marbled Papers (Filter Forge)", "Cubism meets Picasso (Filter Forge)")

# --- Filter Forge: Creative -- first-hand: category44-page1..6.html --------------------------------------------
R = "Filter Forge: Creative"
add(R, "Paint", "S", "Delfts blauw (Filter Forge)", "Candle Wax (Filter Forge)", "Clay Sticks (Filter Forge)",
    "Synthetic Cubism (Filter Forge)", "Picasso Redux (Filter Forge)", "Stylized Etching (Filter Forge)",
    "Radial Acrylic (Filter Forge)", "Crayon Master (Filter Forge)", "Lost Sketchbook (Filter Forge)",
    "Water Contour (Filter Forge)", "Brush Engine Van Gogh (Filter Forge)", "Chinaware painting (Filter Forge)",
    "Charcoal and Watercolor (Filter Forge)", "Chalk and Paint Sketch (Filter Forge)", "Felt Marker (Filter Forge)",
    "Magic Hatchmix (Filter Forge)", "Palette Knife (Filter Forge)", "Pen on Watercolor (Filter Forge)",
    "Smeary Oil Painting (Filter Forge)", "Squiggly Brush (Filter Forge)", "Stoney Painter (Filter Forge)",
    "Vellum Sketch (Filter Forge)", "Aqua Sketch (Filter Forge)", "Angel Wash (Filter Forge)",
    "Old Book Illustrator (Filter Forge)", "Pastel 'N Carbon Pencil Artist (Foxxee, Filter Forge)",
    "I Can Draw Manga (Filter Forge)", "Ink Over Paint (Filter Forge)", "Detail Painter (Filter Forge)",
    "Forkpaint (Filter Forge)", "Minimal Hatched Engraving (Filter Forge)", "Paint Capriccio (Filter Forge)",
    "Stripe Painter (Filter Forge)", "Tri-Lines Hatching (Filter Forge)", "Triquad Painter (Filter Forge)",
    "Egg Tempera, Oil Paint (Filter Forge)")
add(R, "Stylize", "S", "Americana (Filter Forge)", "Fiber optic neon (Filter Forge)", "Insects Storm (Filter Forge)",
    "Old Poster Print (Filter Forge)", "Overlay '80 (Filter Forge)", "POPsterize (Filter Forge)")
add(R, "Stylize", "S", "Technical Drawing (Filter Forge)", "Marker Layout (Filter Forge)", "Election Poster (Filter Forge)",
    "Pin Up Magazine (Filter Forge)", "Pin Art 3D (Filter Forge)", "Peeling Paint (Filter Forge)",
    "Spongiform (Filter Forge)", "Ice Age (Filter Forge)", "Incinerate (Filter Forge)", "Glow Wires (Filter Forge)",
    "Welcome to the Matrix (Filter Forge)", "Tron 2.0 Legacy (Filter Forge)", "Minimalist POP (Filter Forge)",
    "Fake Comics (Filter Forge)", "Edge And Tones (Filter Forge)", "Patterned Dithering (Filter Forge)",
    "Pixel Halftone (Filter Forge)", "Adaptive Dots (Filter Forge)", "Cimoc (Filter Forge)",
    "Multicolor Printing (Filter Forge)", "Glitterize (Filter Forge)", "Frozen Solid (Filter Forge)",
    "Dynamic Bleed (Filter Forge)", "Color leak (Filter Forge)", "Tri-Color (Filter Forge)", "Gothic FX (Filter Forge)",
    "Romantic Grunge (Filter Forge)", "PlastaWrap (Filter Forge)")

# --- Filter Forge: Misc (effects) -- first-hand: category20-page1..3.html --------------------------------------
R = "Filter Forge: Misc"
add(R, "Materials", "S", "Bronzerize (Filter Forge)", "Chromize (Filter Forge)", "Goldenizer (Filter Forge)",
    "Gleaming Gold (Filter Forge)", "Rusterizer (Filter Forge)", "Metalize It! (Filter Forge)",
    "Precious Metallic Emboss (Filter Forge)", "Crumpled Colored Foil (Filter Forge)", "Wrapped in Plastic (Filter Forge)",
    "Carve And Stain (Filter Forge)", "Erode Decal (Filter Forge)", "Splotchy Concrete (Filter Forge)",
    "3D engraved painting (Filter Forge)", "Chris's Foil It! Embosser (Filter Forge)")
add(R, "Stylize", "S", "Circular Agamograph (Filter Forge)", "Coloring Book (Filter Forge)", "Film Noir Comic (Filter Forge)",
    "ReMondrian Lite (Filter Forge)", "Satellite Image (Filter Forge)", "Cartograph (Filter Forge)",
    "Old computer graphics (Filter Forge)", "Polygonal Mandalas (Filter Forge)", "Urban Artistry (Filter Forge)",
    "Negative passing (Filter Forge)", "Banded Grayscale Portrait Distortion (Filter Forge)",
    "Hardline Cut (Filter Forge)", "Blood Spatter Analyst (Filter Forge)", "Jack Frost (Filter Forge)",
    "Sea level (Filter Forge)", "Sketch Cleaner (Filter Forge)", "Flatten Lightness (Filter Forge)",
    "Luminance Color Gradient (Filter Forge)", "Squint (Filter Forge)", "Time Machine (Filter Forge)")

# --- Filter Forge: Frames -- first-hand: category54-page1..3.html ----------------------------------------------
R = "Filter Forge: Frames"
add(R, "Frames", "S", "Wanted Poster frame (Filter Forge)", "Broken Window (Filter Forge)", "Confetti Frame (Filter Forge)",
    "Dragon scales frame (Filter Forge)", "Emulsion Transfer (Filter Forge)", "Glass Heart Frame (Filter Forge)",
    "Grunge Drip Frames (Filter Forge)", "Halftone Frame (Filter Forge)", "Op Art Frame (Filter Forge)",
    "Paper Art Frame (Filter Forge)", "Picture Matte (Filter Forge)", "Ragged and Torn (Filter Forge)",
    "Radial Self-Copy Frame (Filter Forge)", "Rocky Edge Frame (Filter Forge)", "Scrying Frame (Filter Forge)",
    "Tacky Tape (Filter Forge)", "Inset Frame in Blurred Background (Filter Forge)",
    "Picture on an old wooden board (Filter Forge)", "Speckled Vignette (Filter Forge)",
    "through a glass darkly (Filter Forge)", "dinner plate theater (Filter Forge)", "Roll20 Token Maker (Filter Forge)",
    "Frozen Vignette (Ronjonie, Filter Forge)", "Laser Art Vignette (Ronjonie, Filter Forge)",
    "December Window (Filter Forge)", "Fire and Ice (Filter Forge)", "Lacy Framed (Filter Forge)",
    "Porcelain Flame Frame (Filter Forge)", "Smooth to crinkled (Filter Forge)", "Icon Mirror (Filter Forge)")

# --- GPUImage (iOS) / GPUImage2 -- first-hand: framework/Source file tree and Operations/*.swift ------------------
R = "GPUImage"
add(R, "Insta", "S", "Amatorka (GPUImage lookup)", "Miss Etikate (GPUImage lookup)", "Soft Elegance (GPUImage lookup)")
add(R, "Retro", "S", "CGA Colorspace (GPUImage)", "Polar Pixellate (GPUImage)")
add(R, "Tone", "S", "Luminance Range Reduction (GPUImage)", "Highlight & Shadow Tint (GPUImage)", "Skin Tone Adjust (GPUImage)")
add(R, "Tone", "G", "Average Luminance Threshold (GPUImage)")
add(R, "Distort", "S", "Glass Sphere Refraction (GPUImage)", "Sphere Refraction (GPUImage)", "Stretch Distortion (GPUImage)")
add(R, "Stylize", "S", "Smooth Toon (GPUImage)", "Threshold Sketch (GPUImage)")
add(R, "Blur", "S", "iOS 7 Blur (GPUImage)", "Gaussian Selective Blur (GPUImage)")
add(R, "Sensor", "S", "XY Derivative (GPUImage)", "Noble Corner Detection (GPUImage)", "Color Local Binary Pattern (GPUImage)")
add(R, "Analysis", "G", "Parallel Coordinate Line Transform (GPUImage)")

# --- Web / real-time FX libraries -- first-hand: repo trees of pixijs/filters, mrdoob/three.js (postprocessing,
#     shaders, tsl/display), evanw/glfx.js, pmndrs/postprocessing, BabylonJS PostProcesses, MetalPetal ----------
R = "Web & real-time FX libraries"
add(R, "Color", "S", "Multi Color Replace (pixi-filters)", "Colorify (three.js)")
add(R, "Render", "S", "Simple Lightmap (pixi-filters)")
add(R, "Blur", "S", "Triangle Blur (glfx.js)", "Hash Blur (three.js TSL)", "Focus Shader (three.js)",
    "Hexagonal Bokeh Blur (MetalPetal)")
add(R, "Retro", "S", "Hexagonal Pixelate (glfx.js)", "Retro Pass (three.js TSL)")
add(R, "Sensor", "S", "Screen-Space Curvature (Babylon.js)")
add(R, "Distort", "S", "VR Distortion Correction (Babylon.js)")

# --- Godot shader library -- first-hand: godotshaders.com/shader-tag/post-processing ---------------------------
R = "Godot Shaders"
add(R, "Frames", "S", "Damage Hurt screen-edge pulse (Godot Shaders)")
add(R, "Paint", "S", "Line pattern cell shading (Godot Shaders)")
add(R, "Render", "S", "Sci-Fi Scanner Pulse (Godot Shaders)")
add(R, "Retro", "S", "Analog Monochrome Monitor (Godot Shaders)")

# --- CamanJS presets -- first-hand: CamanJS docs preset list (src/lib/presets) ----------------------------------
R = "CamanJS presets"
add(R, "Insta", "S", "Sin City (CamanJS)", "Sunrise (CamanJS)", "Orange Peel (CamanJS)", "Love (CamanJS)",
    "Grungy (CamanJS)", "Jarques (CamanJS)", "Pinhole (CamanJS)", "Old Boot (CamanJS)", "Glowing Sun (CamanJS)",
    "Hazy Days (CamanJS)", "Her Majesty (CamanJS)", "Hemingway (CamanJS)", "Concentrate (CamanJS)")

# --- FFmpeg libavfilter -- first-hand: libavfilter/allfilters.c (master) + filter docs -------------------------
R = "FFmpeg 2"
add(R, "Color", "G", "Gray World white balance (grayworld)", "Grey-Edge colour constancy (greyedge)")
add(R, "Color", "S", "HSV hold (hsvhold)", "HSV key (hsvkey)", "Luma key (lumakey)")
add(R, "Distort", "S", "Chroma plane shift (chromashift)", "Swap rectangles (swaprect)")
add(R, "Repair", "S", "Fill borders (fillborders)")
add(R, "Blur", "S", "Deflate (FFmpeg)", "Inflate (FFmpeg)")
add(R, "Analysis", "S", "Pixel scope (pixscope)", "Data scope (datascope)")
add(R, "Analysis", "G", "Video oscilloscope (oscilloscope)", "Signal statistics (signalstats)",
    "Bit-plane noise measure (bitplanenoise)", "Block artifact detection (blockdetect)",
    "Spatial information map (siti)")

# --- AviSynth+ / VapourSynth plugins -- first-hand: Avisynth wiki External filters + plugin docs -----------------
R = "AviSynth+ plugins 2"
add(R, "Blur", "S", "MinBlur (AviSynth)", "Spresso (spatial pressure)", "FluxSmoothS (spatial flux smoothing)",
    "SmoothUV (chroma smoothing)")
add(R, "Sharpen", "S", "aSharp (adaptive sharpening)", "MSharpen (masked sharpening)",
    "eedi3 (enhanced edge-directed interpolation)")
add(R, "Noise", "S", "GrainFactory3 (luma-zoned grain)")
add(R, "Repair", "S", "FixChromaBleeding (AviSynth)", "DeScratch (vertical film-scratch removal)")
add(R, "Repair", "G", "Descale (Debilinear / Debicubic inverse resize)")

# --- ImageMagick -morphology catalogue -- first-hand: imagemagick.org/Usage/morphology ---------------------------
R = "ImageMagick morphology"
add(R, "Blur", "S", "Binomial kernel blur (ImageMagick)")
add(R, "Edges", "S", "Peaks hit-and-miss (ImageMagick)", "Ridges kernel (ImageMagick)", "Diagonals kernel (ImageMagick)",
    "Hit-and-miss transform")
add(R, "Blur", "S", "Morphology Smooth (open + close)")
add(R, "Analysis", "G", "IterativeDistance (ImageMagick)", "Octagonal distance transform", "Manhattan distance transform")
add(R, "Tone", "S", "ErodeIntensity (ImageMagick)", "DilateIntensity (ImageMagick)")

# --- MorphoLibJ (Fiji) -- first-hand: src/main/resources/plugins.config -----------------------------------------
R = "MorphoLibJ"
add(R, "Edges", "S", "Directional Filtering (MorphoLibJ)")
add(R, "Analysis", "G", "Marker-controlled Watershed (MorphoLibJ)", "Geodesic Diameter (MorphoLibJ)",
    "Impose Min & Max (MorphoLibJ)", "Convexify (MorphoLibJ)", "Label Boundaries (MorphoLibJ)",
    "Region Adjacency Graph (MorphoLibJ)", "Max. Feret Diameters (MorphoLibJ)", "Max. Inscribed Circle (MorphoLibJ)",
    "Equivalent Ellipse (MorphoLibJ)", "Oriented Bounding Box (MorphoLibJ)", "Average Thickness (MorphoLibJ)",
    "Keep Largest Region (MorphoLibJ)", "Dilate Labels (MorphoLibJ)")
add(R, "Analysis", "S", "Labels To RGB (MorphoLibJ)")

# --- BoneJ / Trainable Weka -- first-hand: imagej.net/plugins/bonej, imagej.net/plugins/tws ---------------------
R = "BoneJ & Weka features"
add(R, "Analysis", "G", "Anisotropy (mean intercept length, BoneJ)", "Ellipsoid factor (BoneJ)",
    "Connectivity (Euler characteristic, BoneJ)", "Inter-trabecular angles (BoneJ)", "Purify (BoneJ)",
    "Slice geometry (BoneJ)", "Box-counting fractal dimension (BoneJ)")
add(R, "Sensor", "S", "Membrane projections (Weka)")
add(R, "Tone", "S", "Lipschitz filter (Weka)")

# --- SimpleITK filters -- first-hand: dir(SimpleITK) 2.x ImageFilter classes -----------------------------------
R = "SimpleITK"
add(R, "Analysis", "G", "Toboggan segmentation (ITK)", "Threshold maximum connected components (ITK)",
    "Iso-contour distance (ITK)")
add(R, "Sensor", "S", "Edge potential (ITK)")

# --- GRASS GIS r.* / i.* -- first-hand: grass.osgeo.org/grass-stable/manuals/raster.html, imagery.html -----------
R = "GRASS GIS"
add(R, "Terrain", "G", "Horizon angle map (r.horizon)", "Solar irradiance map (r.sun)", "Lake fill from seed (r.lake)",
    "Cost-distance surface (r.cost)", "Topographic illumination correction (i.topo.corr)")
add(R, "Terrain", "S", "Morphometric feature classes (r.param.scale)")
add(R, "Analysis", "S", "Simpson diversity index (r.li.simpson)", "Pielou evenness (r.li.pielou)",
    "Class richness (r.li.richness)", "Patch density (r.li.patchdensity)", "Contrast-weighted edge density (r.li.cwed)",
    "Mean patch size (r.li.mps)", "Standard-deviation colour rule (r.colors.stddev)")
add(R, "Repair", "G", "Neighbourhood-statistics gap fill (r.fill.stats)", "Spline void fill (r.fillnulls)")

# --- Orfeo ToolBox / SAGA GIS -- first-hand: OTB CookBook Applications index, SAGA grid_filter library doc --------
R = "Orfeo ToolBox & SAGA"
add(R, "Analysis", "G", "PanTex texture (OTB)", "SFS structural feature set texture (OTB)", "Local RX anomaly detection (OTB)",
    "Morphological profiles analysis (OTB)", "Morphological multiscale decomposition (OTB)",
    "Morphological classification (OTB)", "Small regions merging (OTB)")
add(R, "Edges", "G", "Wombling edge detection (SAGA)")
add(R, "Analysis", "G", "Sieve classes (SAGA)", "Filter clumps (SAGA)")
add(R, "Terrain", "G", "DTM filter slope-based (SAGA)", "Mesh denoise (SAGA, Sun et al.)")
add(R, "Noise", "S", "Multi-direction Lee filter (SAGA)")
add(R, "Blur", "S", "Minority filter (SAGA)")

# --- NPR literature -- search: named papers (author, year) ------------------------------------------------------
R = "NPR literature 2"
add(R, "Paint", "S", "Generalized Kuwahara (Papari-Petkov-Campisi 2007)", "Multi-scale anisotropic Kuwahara (Kyprianidis 2011)",
    "Orientation-aligned bilateral filter (Kyprianidis-Döllner 2008)")
add(R, "Paint", "G", "Paint by Numbers (Haeberli 1990)", "Paint by relaxation (Hertzmann 2001)",
    "Impressionist brush strokes (Litwinowicz 1997)")
add(R, "Stylize", "G", "Pixel sorting (Asendorf ASDFPixelSort)", "Circle packing portrait", "String art (thread portrait, Vrellis)",
    "Pixelated image abstraction (Gerstner 2012)", "Halftone QR codes (Chu 2013)")
add(R, "Stylize", "S", "Ben-Day dots (Lichtenstein)", "Squiggle line art (Squiggify)", "Spiral line portrait (SpiralBetty)")
add(R, "Stylize", "X", "Photomosaic (Silvers)")

# --- Game art-style emulations -- search: developer devlogs / postmortems ----------------------------------------
R = "Game art-style emulations"
add(R, "Retro", "S", "Obra Dinn 1-bit dither (Lucas Pope)", "Doom COLORMAP light diminishing", "Pip-Boy green terminal (Fallout)")
add(R, "Stylize", "S", "Spider-Verse print misregistration", "Borderlands ink-outline cel look", "MadWorld B&W with red",
    "Kurosawa Mode (Ghost of Tsushima)", "Moebius line style (Sable)")
add(R, "Film", "S", "Cuphead 1930s cartoon film look", "Limbo monochrome grain look")

# --- Print & craft simulations -- search: craft-pattern generators, printing-process references -------------------
R = "Print & craft simulations"
add(R, "Stylize", "S", "Perler / fuse-bead pattern", "Loom beadwork pattern", "Needlepoint (tent stitch) pattern",
    "Latch-hook rug pattern", "Jacquard weave", "Tapestry weave", "Batik (wax resist)", "Tie-dye", "Shibori",
    "Ikat blur weave", "Crochet / tapestry crochet grid")
add(R, "Retro", "S", "Rotogravure cell screen", "Letterpress (ink squeeze + impression)", "Flexographic halo / dot gain",
    "Spirit duplicator (ditto) purple", "Inkjet banding", "Laser-printer toner scatter", "Gocco print",
    "Chromolithograph", "Dye-sublimation print")

# --- Prisma app styles -- first-hand: en.wikipedia.org/wiki/List_of_Prisma_(app)_filters -----------------------
R = "Prisma app styles"
add(R, "Paint", "M", "Abstract Portrait (Prisma)", "Aviator (Prisma)", "Bobbie (Prisma)", "Canyon (Prisma)",
    "Caribbean (Prisma)", "Coloured Sky (Prisma)", "Curly Hair (Prisma)", "Curtain (Prisma)", "Dallas (Prisma)",
    "Dancers in Blue (Prisma)", "Dancers in Pink (Prisma)", "Dreams (Prisma)", "Electric (Prisma)", "Femme (Prisma)",
    "Flame Flowers (Prisma)", "Gothic (Prisma)", "Heisenberg (Prisma)", "Ice Cream (Prisma)",
    "Illegal Beauty (Prisma)", "Light Summer Reading (Prisma)", "Mark (Prisma, Chagall)", "MIOBI (Prisma)",
    "Mononoke (Prisma)", "Paper Art (Prisma)", "Raoul (Prisma, Dufy)", "Red Head (Prisma)", "Roy (Prisma)",
    "Running in the Storm (Prisma)", "Tokyo (Prisma)", "Transverse Line (Prisma, Kandinsky)", "We can do it! (Prisma)")

# --- More ReShade / GShade repos -- first-hand: .fx file trees of FransBouma/OtisFX, Mortalitas/GShade-Shaders ------
R = "ReShade repos 4"
add(R, "Depth", "S", "Directional Depth Blur (OtisFX)", "Depth Darkness (OtisFX)")
add(R, "Frames", "S", "Magic Border (OtisFX)")
add(R, "Insta", "S", "PandaFX (OtisFX)")
add(R, "Noise", "S", "SmartNoise anti-banding (GShade)")
add(R, "Stylize", "S", "Pattern Shading (GShade)")

# --- Grading tools -- search: Unity URP Volume overrides docs, DaVinci Resolve FX reference -----------------------
R = "Grading tools 2"
add(R, "Color", "S", "Lift / Gamma / Gain wheels (Unity URP)", "Colour Compressor (Resolve FX)")

# --- photon-rs (Rust/WASM image library) -- first-hand: crate/src/filters.rs preset table + effects.rs -----------
R = "photon-rs"
add(R, "Insta", "S", "Oceanic (photon)", "Islands (photon)", "Marine (photon)", "Seagreen (photon)", "Flagblue (photon)",
    "Diamante (photon)", "Radio (photon)", "Twenties (photon)", "Rosetint (photon)", "Mauve (photon)",
    "Bluechrome (photon)", "Perfume (photon)", "Serenity (photon)", "Golden (photon)", "Pastel Pink (photon)",
    "Cali (photon)", "Firenze (photon)", "Obsidian (photon)", "Cinematic (photon)", "Neue (photon)", "Lix (photon)",
    "Ryo (photon)")
add(R, "Color", "S", "Primary (photon)")
add(R, "Stylize", "S", "Horizontal Strips (photon)")

# --- Manual concept drops after the near-match review (dedupe14 --build) -----------------------------------------
DROP = {
    "Freaky detail (Filter Forge)", "Bi-Color (Filter Forge)", "Pin Art 3D (Filter Forge)", "Crumpled Paper (Filter Forge)",
    "Coloring Book (Filter Forge)", "Brush Engine Van Gogh (Filter Forge)", "Chromolithograph",
    "Sphere Refraction (GPUImage)", "Multi-scale anisotropic Kuwahara (Kyprianidis 2011)",
    "Pixel sorting (Asendorf ASDFPixelSort)", "Pinhole (CamanJS)", "Extreme Flat Fisheye (Filter Forge)",
    "Shattered Into Wreckage (Filter Forge)", "Broken mirror (Filter Forge)", "Relative Cartesian Transform (Filter Forge)",
    "Shuffle by Numbers (Filter Forge)", "Smeary Oil Painting (Filter Forge)", "Charcoal and Watercolor (Filter Forge)",
    "Pen on Watercolor (Filter Forge)", "Precious Metallic Emboss (Filter Forge)", "Candle Wax (Filter Forge)",
    "Clay Sticks (Filter Forge)", "Synthetic Cubism (Filter Forge)", "Cubism meets Picasso (Filter Forge)",
    "Picasso Redux (Filter Forge)", "Chromize (Filter Forge)", "Gleaming Gold (Filter Forge)", "Goldenizer (Filter Forge)",
    "Metalize It! (Filter Forge)", "Bronzerize (Filter Forge)", "Wrapped in Plastic (Filter Forge)",
    "PlastaWrap (Filter Forge)", "Glitterize (Filter Forge)", "Welcome to the Matrix (Filter Forge)",
    "Frozen Solid (Filter Forge)", "Crumpled Colored Foil (Filter Forge)", "Highlight & Shadow Tint (GPUImage)",
    "Colorify (three.js)", "What kind of camera is that? (Filter Forge)", "White Photo (Filter Forge)",
    # option-label concept duplicates found in index.html S(...) lists:
    "Gray World white balance (grayworld)", "Grey-Edge colour constancy (greyedge)", "Binomial kernel blur (ImageMagick)",
    "Hexagonal Bokeh Blur (MetalPetal)", "Spirit duplicator (ditto) purple",
}
