"""Candidate techniques not yet in Filter Nexus (round 9 harvest).

Each entry: (name, source, category, feasibility)
feasibility: S = doable as GPU shader passes, G = needs whole-image / sequential work, M = needs a neural net,
             X = needs several images or video frames.
dedupe.py drops any whose name already matches a filter or alias in filters.db.
"""
C = []
def add(source, category, feas, names):
    C.extend((n, source, category, feas) for n in names)

# ---- pixel-art & upscaling (RetroArch / emulator / game scalers) ----
add("Upscalers", "Upscale", "S", ["Scale2x (EPX)", "Scale3x", "Eagle", "2xSaI", "Super 2xSaI", "Super Eagle", "hq2x", "hq3x", "hq4x",
    "xBR", "xBRZ", "Super-xBR", "ScaleFX", "MMPX", "SABR", "Lanczos resampling", "Mitchell-Netravali resampling", "Catmull-Rom resampling",
    "B-spline resampling", "Jinc resampling", "NEDI (edge-directed interpolation)", "ICBI interpolation", "FSR 1 EASU upscaling",
    "FSR RCAS sharpening", "AMD CAS (contrast adaptive sharpening)", "Anime4K", "Pixel-art antialias (smooth pixels)", "Bicubic sharpener (FSRCNN-style approx.)"])
add("Upscalers", "Upscale", "M", ["ESRGAN / Real-ESRGAN", "waifu2x", "RAISR"])
# ---- CRT / retro display shaders ----
add("RetroArch shaders", "Retro", "S", ["CRT-Royale", "CRT-Geom", "CRT-Lottes", "CRT-Easymode", "CRT-Guest-Advanced", "Aperture grille mask",
    "Slot mask", "Shadow mask (dot triad)", "Phosphor persistence glow", "CRT halation", "CRT curvature & corner rounding",
    "NTSC composite (blargg)", "NTSC dot crawl", "RF interference", "Game Boy LCD grid", "Game Boy Advance color", "Dot matrix LCD",
    "Handheld LCD ghosting", "Vector display (Vectrex glow)", "Arcade bezel reflection", "MDAPT dither blending", "GTU (TV signal simulation)",
    "Interlaced field blend", "Teletext mosaic", "PETSCII art", "ANSI art", "Braille art", "Matrix rain overlay"])
# ---- palettes & dithering ----
add("Retro palettes", "Retro", "S", ["PICO-8 palette", "NES palette", "Commodore 64 palette", "ZX Spectrum (attribute clash)", "CGA palette 1",
    "EGA palette", "Apple II hi-res artifacts", "Amstrad CPC palette", "MSX palette", "Atari 2600 palette", "Sega Master System palette",
    "Game Boy Pocket palette", "Virtual Boy red", "Macintosh 1-bit"])
add("Dithering", "Retro", "S", ["Yliluoma ordered palette dither", "Knoll pattern dither", "Interleaved gradient noise dither",
    "Blue-noise (void-and-cluster) dither", "Clustered-dot ordered dither", "Dot diffusion (Knuth)", "Line dither", "Crosshatch dither",
    "Stochastic dither", "Halftone (FM / stochastic screening)"])
add("Dithering", "Retro", "G", ["Atkinson dither", "Jarvis-Judice-Ninke dither", "Stucki dither", "Burkes dither", "Sierra dither",
    "Sierra Lite dither", "Riemersma dither", "Ostromoukhov variable-coefficient dither"])
# ---- film & alternative processes ----
add("Film / alt process", "Film", "S", ["Cyanotype", "Van Dyke brown", "Platinum/palladium print", "Salt print", "Gum bichromate",
    "Daguerreotype", "Tintype (wet plate collodion)", "Autochrome", "Technicolor 2-strip", "Technicolor 3-strip", "Hand-tinted photograph",
    "Kodak Aerochrome infrared", "Redscale film", "Cinestill 800T halation", "Film halation", "Film gate weave", "Film burn",
    "Kodachrome", "Ektachrome", "Portra 400", "Ektar 100", "Provia 100F", "Tri-X 400", "Ilford HP5", "Delta 3200 grain",
    "Polaroid SX-70", "Instax", "Lith print", "Selenium toning", "Sepia toning (split)", "Risograph print", "Screen print (spot colors)",
    "Lithograph", "Aquatint", "Drypoint etching", "Woodcut", "Linocut", "Scratchboard", "Sumi-e ink wash", "Gouache", "Pastel",
    "Crayon", "Colored pencil", "Impasto", "Palette knife", "Pen & ink stippling (screen-space)"])
add("Film / alt process", "Film", "G", ["Weighted Voronoi stippling", "Tile-based TSP art"])
# ---- glitch ----
add("Glitch", "Retro", "S", ["Scanline displacement", "Slit-scan", "Bit crush", "Byte corruption", "Wave interference glitch",
    "Hue sort", "Mirror tiles", "Channel feedback smear", "Block shift (macroblock)", "Emoji mosaic", "Signal noise bars"])
add("Glitch", "Retro", "X", ["Datamosh (P-frame)", "Time displacement"])
# ---- tone mapping literature ----
add("Tone mapping", "Tone", "S", ["Ashikhmin tone mapping", "Reinhard-Devlin photoreceptor", "Tumblin-Rushmeier", "Schlick rational",
    "Ferwerda visibility", "Pattanaik adaptation", "Kim-Kautz consistent", "iCAM06", "Exponential tone mapping", "Logarithmic tone mapping",
    "Khronos PBR Neutral", "Unreal filmic", "Tony McMapface", "Hable piecewise power curves", "Lottes 2016 (ext.)"])
add("Tone mapping", "Tone", "G", ["Ward histogram adjustment"])
# ---- color science ----
add("Color science", "Color", "S", ["Oklab", "Oklch", "CIELUV", "HunterLab", "YIQ", "YCoCg", "IPT", "ICtCp", "Jzazbz", "CAM16-UCS",
    "HSI", "rg chromaticity", "c1c2c3 invariant", "l1l2l3 invariant", "Opponent color space", "CMYK separation", "Color harmonization (template)",
    "Gray Edge color constancy", "Shades of Gray constancy", "White Patch (max-RGB) constancy", "Hue shift by luminance",
    "Gamut compression (ACES RGC)", "Soft proof (paper white / ink black)", "Color temperature overlay", "Duotone (Pantone pairs)"])
add("Color science", "Color", "G", ["Median cut quantization", "Octree quantization", "Wu quantization", "NeuQuant", "Reinhard color transfer",
    "Decorrelation stretch (global PCA)", "Histogram matching (global CDF)"])
# ---- edges, lines, corners ----
add("Edges & features", "Edges", "S", ["Marr-Hildreth", "Shen-Castan (ISEF)", "Deriche edge", "Nevatia-Babu", "Haralick facet edge",
    "SUSAN edge", "SUSAN corner", "Shi-Tomasi", "Förstner corner", "Kitchen-Rosenfeld corner", "Wang-Brady corner", "Trajkovic corner",
    "Hessian-Laplace keypoints", "SIFT DoG keypoints", "SURF box Hessian", "CenSurE / STAR", "KAZE nonlinear scale space",
    "AKAZE (FED diffusion)", "Phase stretch transform (PST)", "Monogenic signal (local phase)", "Local orientation (Riesz)",
    "Steerable filters", "Log-Gabor bank", "Gradient vector flow", "Sub-pixel edge refinement", "Compass gradient (8 directions)",
    "Optimally oriented flux", "Jerman vesselness", "Zana-Klein vessel", "Hessian blobness", "Hysteresis thresholding",
    "Edge thinning (non-max suppression)", "Edge linking"])
add("Edges & features", "Edges", "G", ["LSD line segment detector", "EDLines", "MSER regions", "ORB keypoints", "BRISK keypoints"])
add("Edges & features", "Edges", "M", ["HED (holistically-nested edges)", "Structured forest edges", "DexiNed", "PiDiNet"])
# ---- segmentation & thresholding ----
add("Segmentation", "Analysis", "S", ["Kapur entropy threshold", "Rosin unimodal threshold", "Su binarization", "Howe binarization",
    "Gatos binarization", "Local entropy threshold", "Fuzzy c-means (fixed iterations)", "Chan-Vese (fixed iterations)",
    "Morphological ACWE snakes", "Region growing (seeded, iterative)", "SEEDS superpixels", "LSC superpixels", "Waterpixels"])
add("Segmentation", "Analysis", "G", ["Felzenszwalb graph segmentation", "Quickshift", "Mean shift segmentation", "Random walker",
    "GrabCut", "Split and merge", "Connected component labeling", "Shanbhag threshold"])
add("Segmentation", "Analysis", "M", ["Segment Anything", "U-Net cell segmentation", "Cellpose", "StarDist"])
# ---- morphology ----
add("Morphology", "Edges", "S", ["Zhang-Suen thinning", "Guo-Hall thinning", "Skeleton pruning", "Hit-or-miss transform",
    "Granulometry map", "Area closing", "Path opening", "Rank filter (morphological)", "Fill holes", "Clear border objects",
    "Chamfer distance transform", "Geodesic distance", "Medial axis", "SKIZ (influence zones)", "Top-hat by reconstruction",
    "Leveling", "Toggle contrast mapping", "Morphological Laplacian", "Morphological shock filter", "Convex hull (iterative)",
    "Valued regional maxima", "H-convex / H-concave", "Grayscale grind peak"])
# ---- frequency & multiscale ----
add("Frequency", "Analysis", "S", ["Block DCT view (8×8)", "DCT coefficient quantization", "Walsh-Hadamard (block)", "Haar wavelet decomposition",
    "Laplacian pyramid view", "Gaussian pyramid view", "Steerable pyramid", "Wavelet denoise (BayesShrink, à trous)",
    "Contourlet-style directional bands", "Riesz pyramid"])
add("Frequency", "Analysis", "G", ["FFT magnitude spectrum", "Ideal low/high-pass (FFT)", "Gaussian low/high-pass (FFT)", "Wiener filter",
    "Inverse filter", "Cepstrum", "Daubechies wavelets", "Curvelet transform", "Shearlet transform", "Spectral residual saliency"])
# ---- restoration ----
add("Restoration", "Repair", "S", ["Van Cittert deconvolution", "Landweber deconvolution", "Tikhonov deconvolution (iterative)",
    "Total variation deconvolution", "Telea inpainting (iterative)", "Navier-Stokes inpainting (iterative)", "Bilinear demosaic",
    "Malvar-He-Cutler demosaic", "AHD demosaic", "VNG demosaic", "PPG demosaic", "DCB demosaic", "AMaZE demosaic", "LMMSE demosaic",
    "RCD demosaic", "Menon demosaic", "X-Trans demosaic (Markesteijn)", "Halo removal", "Haze-line dehaze", "Underwater color restoration (Sea-thru approx.)",
    "Shadow removal (illumination ratio)", "Glare / specular removal", "Moire removal", "JPEG deblocking", "Deringing",
    "Banding-aware deblur", "Rolling shutter correction (global skew)", "Lens vignetting correction", "Lens distortion correction (Brown-Conrady)",
    "Perspective / keystone correction"])
add("Restoration", "Repair", "G", ["Criminisi exemplar inpainting", "PatchMatch fill", "Seam carving", "Blind deconvolution", "N4 bias field correction"])
add("Restoration", "Repair", "M", ["LaMa inpainting", "DeepPRIME", "Neural denoise (DnCNN)", "Deblur GAN", "Colorization (DeOldify)"])
# ---- lighting / depth / 3D ----
add("Lighting & depth", "Depth", "S", ["HBAO", "GTAO", "Bent normals", "Screen-space shadows", "Relight (Lambert from normals)",
    "Relight (Blinn-Phong from normals)", "Rim light", "Fresnel glow", "Subsurface scattering approx.", "Caustics", "Refraction (normal-based)",
    "Chromatic dispersion", "Heat haze", "Underwater wobble", "Mirage", "Anamorphic lens flare", "Lens dirt", "Star filter (cross-screen)",
    "Diffraction spikes", "Volumetric light (depth-aware)", "Eye adaptation (local)", "Depth-based saturation", "Depth edges",
    "Normals from depth", "Curvature from depth", "Depth posterize (contour lines)", "Tilt-shift from depth", "Fake shadow from depth"])
add("Lighting & depth", "Depth", "X", ["Optical flow", "Stereo disparity (block matching)", "Focus stacking", "HDR merge", "Panorama stitching"])
# ---- PBR / Substance-style texture nodes ----
add("Texture nodes", "Materials", "S", ["Thickness map (from height)", "Edge wear mask", "Dirt mask", "Directional warp", "Slope blur",
    "Non-uniform blur", "Histogram scan", "Histogram range", "Histogram shift", "Make it tile (seamless)", "Bevel", "Height blend",
    "Normal blend (RNM)", "Normal blend (UDN)", "Normal blend (whiteout)", "Normal invert (green flip)", "Normal normalize", "Vector warp",
    "Multi-directional warp", "Shape glow", "Cartesian to polar", "Color to mask", "Emboss with gloss", "Anisotropic noise",
    "Crystal noise", "Gaussian spots", "Worley F1", "Worley F2-F1", "Voronoi fractal", "Ridged multifractal", "Billow noise",
    "Gabor noise", "Wavelet noise", "Domain warping", "Curl noise", "Flow noise", "Wood grain", "Marble", "Brick generator",
    "Tile generator", "Weave generator", "Hexagon pattern", "Scratches generator", "Leather", "Fabric weave", "Rust mask", "Moss mask"])
add("Texture nodes", "Materials", "G", ["Flood fill (per-island)", "Tile sampler (scatter)"])
# ---- sensors / analysis / monitoring ----
add("Sensors", "Analysis", "S", ["Focus peaking", "Waveform monitor", "Vectorscope", "RGB parade", "Laplacian variance sharpness",
    "Tenengrad sharpness", "Brenner gradient", "Vollath F4", "Colorfulness (Hasler-Süsstrunk)", "RMS contrast map", "Michelson contrast map",
    "Frequency-tuned saliency (Achanta)", "Itti-Koch saliency", "Boolean map saliency", "Fine-grained saliency (Montabone)",
    "Edge density map", "Image complexity map", "Lacunarity", "Local phase quantization (LPQ)", "Local ternary patterns (LTP)",
    "Completed LBP (CLBP)", "Rotation-invariant uniform LBP", "LBP variance (LBPV)", "Weber local descriptor (WLD)",
    "Local directional pattern (LDP)", "Local gradient pattern", "DAISY descriptor field", "Dense SIFT field", "Hurst exponent map",
    "Wavelet energy map", "Rule-of-thirds overlay", "Golden ratio overlay", "Symmetry map", "Horizon tilt map", "Sky mask (color + position)",
    "Window / level (medical)", "Sigmoid intensity transform (ITK)", "Intensity windowing (ITK)", "Shift-scale (ITK)"])
add("Sensors", "Analysis", "G", ["Image moments / Hu moments", "Fourier descriptors", "Vanishing point detection", "Histogram view",
    "3D LUT apply (.cube)", "Exposure fusion weights (global normalize)"])
add("Sensors", "Analysis", "M", ["Monocular depth (MiDaS)", "Surface normals (Omnidata)", "Semantic segmentation", "Pose estimation", "Face landmarks"])
# ---- ITK / medical filters ----
add("ITK", "Repair", "S", ["Curvature anisotropic diffusion", "Gradient anisotropic diffusion", "Min-max curvature flow",
    "Curvature flow", "Recursive Gaussian (Deriche)", "Laplacian sharpening (ITK)", "Patch-based denoising (ITK)",
    "Confidence connected (iterative)", "Geodesic active contour (fixed iterations)", "Shape detection level set",
    "Signed Maurer distance", "Danielsson distance map", "Label contours", "Binary pruning"])
# ---- photo-app looks & tools still missing ----
add("Photo apps", "Stylize", "S", ["Sky enhancer", "Accent (auto local tone)", "Mystical", "Sunrays", "Matte look", "Golden hour",
    "Dramatic (Luminar)", "ClearView dehaze", "Smart Lighting", "Microcontrast", "Skin tone uniformity", "Color editor (hue-range)",
    "Color zones", "Rotate colors (range)", "Color exchange", "Value invert", "Linear invert", "Stretch contrast HSV", "Mono mixer",
    "Long shadow", "Drop shadow (alpha)", "Recursive transform", "Paper tile", "Tile glass", "Small tiles", "Little planet",
    "Panorama projection", "Linear sinusoid", "Spiral pattern", "Diffraction patterns", "Qbist", "Line nova", "Sphere designer",
    "Clothify", "Erase every other row", "Hope poster", "Warhol", "Rodilius", "Dream smoothing", "Pencil portrait", "Brushify",
    "Graphic novel", "Comic book", "Polygonize", "Triangulation (Delaunay look)", "Octave sharpening", "Gold-Meinel sharpening",
    "Inverse diffusion sharpening", "Texture sharpening", "Mineral mosaic", "Plaid texture", "Cracks", "Shock waves", "Conformal maps",
    "Seamless deco", "Chessboard", "Tetris", "Sponge", "Puzzle", "Neon glow edges", "Liquid chrome", "Holographic foil", "Iridescence",
    "Thermal camera", "Night vision (gen 3)", "Infrared false color", "X-ray", "Blueprint", "Pencil sketch (color)", "Watercolor bleed",
    "Ink bleed", "Oil paint (Kuwahara anisotropic)", "Stained glass (lead lines)", "Embroidery", "Cross-stitch", "LEGO mosaic",
    "Knitting", "Paper cutout (layers)", "Low poly", "Isometric pixel", "Voxelize look", "ASCII color", "Text portrait"])
