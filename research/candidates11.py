"""Round 11 raw candidates (input to dedupe11.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.
Every name here was taken from a real menu, node list, API or paper; how each source was confirmed is noted per block.
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# --- Houdini Copernicus (COP) nodes -- sidefx.com/docs/houdini/nodes/cop/index.html (fetched) -----------------------
H = "Houdini Copernicus"
add(H, "Materials", "S", "Grunge Aurora (Copernicus)", "Grunge Bark Strips (Copernicus)", "Grunge Birch Bark (Copernicus)",
    "Grunge Drips (Copernicus)", "Grunge Galvanized Steel (Copernicus)", "Grunge Leaking Streaks (Copernicus)",
    "Grunge Moisture (Copernicus)", "Grunge Mold Spots (Copernicus)", "Grunge Pine Bark (Copernicus)",
    "Grunge Rust (Copernicus)", "Grunge Rusty Surface (Copernicus)", "Grunge Sheets (Copernicus)",
    "Grunge Wipe Trails (Copernicus)", "Knit (Copernicus)", "Weave (Copernicus)", "Combine Normals (Copernicus)",
    "Planar Inflate (Copernicus)", "Height to Caustics (Copernicus)", "Height to Shadow (Copernicus)",
    "Refract from Height (Copernicus)")
add(H, "Noise", "S", "Bubble Noise (Copernicus)", "Crystal Noise (Copernicus)", "Phasor Noise", "Chladni Cymatic Patterns",
    "Julia Fractal (Copernicus)", "Hyperbolic Tile (Copernicus)", "Hex Tile (Copernicus)")
add(H, "Noise", "G", "Turing Patterns (Copernicus)", "Neural Cellular Automata (Copernicus)")
add(H, "Edges", "S", "Edge Detect by Depth (Copernicus)", "Edge Detect by Normal (Copernicus)", "Corner Detect (Copernicus)")
add(H, "Edges", "G", "Edge Detect by Contour (Copernicus)")
add(H, "Analysis", "G", "Eikonal Distance (Copernicus)", "Segment by Connectivity (Copernicus)", "Segment by Value (Copernicus)",
    "Statistics by ID (Copernicus)", "Points from Blobs (Copernicus)", "Solve Poisson (Copernicus)", "ID to SDF (Copernicus)")
add(H, "Repair", "G", "Extrapolate Boundaries (Copernicus)", "Smooth Fill (Copernicus)", "Fill Connected (Copernicus)",
    "Denoise TVD (Copernicus)")
add(H, "Repair", "S", "Illegal Pixel (Copernicus)", "Despill (Copernicus)")
add(H, "Stylize", "S", "Star Glow (Copernicus)", "Streak Blur (Copernicus)", "Surface Dither (Copernicus)",
    "Heat Distort (Copernicus)", "Auto Stereogram (Copernicus)")
add(H, "Terrain", "G", "HeightField Slump (Copernicus)", "HeightField Strata (Copernicus)")
add(H, "Terrain", "S", "HeightField Terrace (Copernicus)", "Slope Direction (Copernicus)")
add(H, "Render", "G", "Ripple Solver (Copernicus)", "Ocean Spectrum (Copernicus)")
add(H, "Noise", "S", "Cell Pattern (Copernicus)", "Tile Pattern (Copernicus)")

# --- TouchDesigner TOPs -- docs.derivative.ca/TOP (fetched) ----------------------------------------------------------
T = "TouchDesigner TOPs"
add(T, "Blur", "S", "Luma Blur TOP")
add(T, "Tone", "S", "Luma Level TOP", "Limit TOP", "Lookup TOP")
add(T, "Edges", "S", "Slope TOP")
add(T, "Analysis", "G", "Analyze TOP", "Spectrum TOP")
add(T, "Color", "S", "Inside TOP", "Outside TOP", "Cross TOP")
add(T, "Frames", "X", "Time Machine TOP", "Feedback TOP")
add(T, "Analysis", "X", "Optical Flow TOP")

# --- Substance 3D Designer library / atomic nodes -- helpx.adobe.com node library (searched) --------------------------
D = "Substance Designer"
add(D, "Tone", "S", "Histogram Select", "Histogram Range", "Histogram Shift", "Non-Uniform Histogram Scan",
    "Histogram Scan (Substance)", "Contrast/Luminosity (Substance)", "Auto Levels (Substance)")
add(D, "Blur", "S", "Non-Uniform Blur", "Slope Blur Grayscale", "Anisotropic Blur (Substance)", "Blur HQ (Substance)",
    "Directional Blur (Substance)", "Radial Blur (Substance)")
add(D, "Distort", "S", "Multi Directional Warp", "Directional Warp (Substance)", "Vector Warp", "Non-Square Transform",
    "Safe Transform (Substance)", "Trapezoid Transform", "Cartesian to Polar (Substance)")
add(D, "Analysis", "G", "Flood Fill (Substance)", "Flood Fill to Gradient", "Flood Fill to Random Grayscale",
    "Flood Fill to BBox Size", "Flood Fill to Position", "Flood Fill to Index")
add(D, "Materials", "S", "Make It Tile Patch", "Make It Tile Photo", "Curvature Smooth", "Curvature Sobel",
    "Height Normal Blender", "Normal Vector Rotation", "Normal Sobel", "Bent Normals (Substance)", "Shape Glow",
    "Height Map Frequencies Mapper", "Height Blend (Substance)", "Edge Detect (Substance)", "Quantize Grayscale",
    "Replace Color Range", "Bevel (Substance)", "Splatter Circular", "Tile Sampler", "Shape Splatter")
add(D, "Noise", "S", "BnW Spots", "Moisture Noise", "Fractal Sum Base", "Messy Fibers", "Microscope View (Substance)",
    "Creased (Substance)", "Liquid (Substance)", "Grunge Map (Substance)", "Dirt (Substance)", "Fur (Substance)",
    "Scratches Generator", "Clouds 3 (Substance)")
add(D, "Materials", "G", "Ambient Occlusion (RTAO)", "Ambient Occlusion (HBAO)")

# --- Game engines -- Unity HDRP / PPv2 (fetched), Unreal post-process page (fetched), Godot environment (fetched) ----
G_ = "Game engine post-process 2"
add(G_, "Tone", "S", "Lift Gamma Gain (Unity)", "Shadows Midtones Highlights (Unity)", "Split Toning (Unity)",
    "Channel Mixer (Unity)", "Hue vs Hue curve", "Hue vs Sat curve", "Sat vs Sat curve", "Lum vs Sat curve",
    "Unreal Filmic Tonemapper", "Blue Correction (Unreal)", "Expand Gamut (Unreal)", "Godot AgX tonemap",
    "Glow Softlight blend (Godot)")
add(G_, "Depth", "S", "Scalable Ambient Obscurance", "Multi-scale Volumetric Occlusion", "Screen Space Indirect Lighting (SSIL)",
    "Panini Projection (Unity)", "Cinematic Depth of Field (Unreal)", "Mobile Gaussian Depth of Field")
add(G_, "Stylize", "S", "Convolution Bloom (Unreal)", "Dirt Mask (Unreal)", "Screen Space Lens Flare (Unity)",
    "Data-Driven Lens Flare (Unity SRP)")
add(G_, "Tone", "G", "Local Exposure (Unreal)", "Automatic Histogram Exposure (Unity)")

# --- Photoshop Neural Filters (helpx list, searched) and Camera Raw -------------------------------------------------
P = "Photoshop Neural / Camera Raw"
add(P, "Repair", "M", "Skin Smoothing (Neural Filter)", "Smart Portrait", "Makeup Transfer", "Super Zoom (Neural Filter)",
    "JPEG Artifacts Removal (Neural Filter)", "Photo Restoration (Neural Filter)", "Harmonization (Neural Filter)",
    "Landscape Mixer", "Depth Blur (Neural Filter)", "Color Transfer (Neural Filter)", "Colorize (Neural Filter)",
    "Style Transfer (Neural Filter)")
add(P, "Repair", "M", "Camera Raw AI Denoise", "Raw Details (Camera Raw)", "Super Resolution (Camera Raw)",
    "Reflections Removal (Camera Raw)", "Distraction Removal (Camera Raw)", "Lens Blur (Camera Raw)",
    "Adaptive Color profile (Camera Raw)")
add(P, "Color", "S", "Point Color (Camera Raw)", "Calibration Primaries (Camera Raw)", "Visualize Spots (Camera Raw)")

# --- Clip Studio Paint -- help.clip-studio.com Filters page (fetched) -----------------------------------------------
CS = "Clip Studio Paint"
add(CS, "Blur", "S", "Blur (Strong) (Clip Studio)", "Spin Blur (Clip Studio)")
add(CS, "Distort", "S", "Curved Surface (Clip Studio)", "Convert to Panorama (Clip Studio)", "Geometric Distortion (Clip Studio)",
    "ZigZag (Clip Studio)", "Fish-eye Lens (Clip Studio)")
add(CS, "Repair", "G", "Remove Dust (Clip Studio)")
add(CS, "Edges", "S", "Adjust Line Width (Clip Studio)")
add(CS, "Film", "S", "Retro Film (Clip Studio)")
add(CS, "Paint", "S", "Pencil Drawing (Clip Studio)", "Artistic (Clip Studio)")
add(CS, "Repair", "S", "Remove JPEG Noise (Clip Studio)")

# --- Procreate -- help.procreate.com Adjustments (fetched) ----------------------------------------------------------
PR = "Procreate"
add(PR, "Blur", "S", "Perspective Blur (Procreate)")
add(PR, "Retro", "S", "Glitch: Artifact (Procreate)", "Glitch: Wave (Procreate)", "Glitch: Signal (Procreate)",
    "Glitch: Diverge (Procreate)")
add(PR, "Retro", "S", "Halftone: Screen Print (Procreate)", "Halftone: Newspaper (Procreate)")
add(PR, "Noise", "S", "Noise: Billows (Procreate)", "Noise: Ridges (Procreate)")

# --- Corel Painter Effects menu -- product.corel.com Painter help (searched) ----------------------------------------
CP = "Corel Painter"
add(CP, "Paint", "G", "Auto Van Gogh", "Apply Marbling", "Blobs (Painter)", "Growth (Painter)", "Auto Clone (Painter)")
add(CP, "Materials", "S", "Apply Surface Texture (Painter)", "Express Texture (Painter)", "Dye Concentration (Painter)",
    "Serigraphy (Painter)", "Distress (Painter)", "Woodcut (Painter)", "Apply Screen (Painter)", "Grid Paper (Painter)")
add(CP, "Blur", "S", "Super Soften (Painter)", "Camera Motion Blur (Painter)", "Glass Distortion (Painter)")
add(CP, "Color", "G", "Posterize Using Color Set (Painter)", "Match Palette (Painter)")

# --- Astro: PixInsight processes, Siril commands (fetched), StarTools modules (fetched) ------------------------------
A = "Astro 2 (PixInsight / Siril / StarTools)"
add(A, "Repair", "S", "ACDNR (PixInsight)", "GREYCstoration (PixInsight)", "SCNR (PixInsight)",
    "LarsonSekanina (PixInsight)", "Siril Unpurple", "Siril rmgreen", "Siril fixbanding", "Siril epf (edge-preserving filter)")
add(A, "Repair", "G", "TGVDenoise (PixInsight)", "MultiscaleMedianTransform (PixInsight)", "ATrousWaveletTransform (PixInsight)",
    "MultiscaleLinearTransform (PixInsight)", "DynamicBackgroundExtraction", "AutomaticBackgroundExtractor (PixInsight)",
    "BackgroundNeutralization (PixInsight)", "CosmeticCorrection (PixInsight)", "Siril find_cosme",
    "Siril Split Bregman deconvolution", "StarTools SVDecon", "StarTools Wipe", "StarTools Heal", "StarTools Shrink",
    "StarTools Repair", "StarTools Synth")
add(A, "Tone", "G", "MaskedStretch (PixInsight)", "AdaptiveStretch (PixInsight)", "ArcsinhStretch (PixInsight)",
    "HDRMultiscaleTransform (PixInsight)", "LocalHistogramEqualization (PixInsight)", "ExponentialTransformation (PixInsight)",
    "GradientHDRCompression (PixInsight)", "AutoHistogram (PixInsight)", "Siril autostretch",
    "Siril modasinh (modified arcsinh)", "Siril ddp (digital development processing)",
    "StarTools AutoDev", "StarTools FilmDev", "StarTools Contrast", "StarTools HDR", "StarTools Entropy",
    "StarTools Flux", "StarTools Super Structure", "StarTools NBAccent")
add(A, "Color", "G", "PhotometricColorCalibration (PixInsight)", "ColorCalibration (PixInsight)", "Siril linear_match")
add(A, "Color", "S", "RepairedHSVSeparation (PixInsight)", "Siril grey_flat (CFA equalize)")
add(A, "Analysis", "S", "RangeSelection (PixInsight)", "StarMask (PixInsight)")
add(A, "Repair", "G", "Siril unclipstars", "Siril synthstar")
add(A, "Color", "G", "SpectrophotometricColorCalibration (SPCC)")

# --- GEGL operation list -- gegl.org/operations (fetched) -----------------------------------------------------------
GE = "GEGL ops"
add(GE, "Color", "S", "gegl:color-assimilation-grid", "gegl:piecewise-blend", "gegl:rgb-clip", "gegl:noise-cie-lch",
    "gegl:negative-darkroom")
add(GE, "Blur", "S", "gegl:mean-curvature-blur", "gegl:snn-mean", "gegl:gaussian-blur-selective", "gegl:focus-blur",
    "gegl:wavelet-blur", "gegl:variable-blur", "gegl:domain-transform")
add(GE, "Noise", "S", "gegl:noise-pick", "gegl:noise-slur", "gegl:noise-hurl", "gegl:linear-sinusoid", "gegl:bayer-matrix")
add(GE, "Repair", "G", "gegl:denoise-dct", "gegl:stress", "gegl:value-propagate", "gegl:waterpixels")
add(GE, "Stylize", "S", "gegl:long-shadow", "gegl:texturize-canvas", "gegl:tile-paper", "gegl:recursive-transform",
    "gegl:video-degradation", "gegl:illusion", "gegl:mirrors")

# --- OpenCV contrib (ximgproc / xphoto / intensity_transform / quality / saliency / img_hash), checked by introspection -
OC = "OpenCV contrib"
add(OC, "Blur", "G", "fastGlobalSmootherFilter", "l0Smooth", "fastBilateralSolverFilter", "weightedMedianFilter",
    "rollingGuidanceFilter", "bilateralTextureFilter", "amFilter (adaptive manifold)", "dtFilter (domain transform)")
add(OC, "Blur", "S", "jointBilateralFilter", "anisotropicDiffusion (ximgproc)")
add(OC, "Edges", "G", "StructuredEdgeDetection", "EdgeDrawing", "FastLineDetector", "EdgeBoxes", "FastHoughTransform",
    "RadonTransform (ximgproc)", "findEllipses (ximgproc)")
add(OC, "Edges", "S", "GradientDericheX", "GradientPaillou", "RidgeDetectionFilter", "PeiLinNormalization")
add(OC, "Analysis", "G", "SuperpixelSEEDS", "SuperpixelLSC", "ScanSegment", "SelectiveSearchSegmentation",
    "GraphSegmentation (ximgproc)", "covarianceEstimation", "fourierDescriptor", "quaternion DFT (qdft)")
add(OC, "Tone", "S", "intensity_transform autoscaling", "intensity_transform contrastStretching", "intensity_transform BIMEF")
add(OC, "Repair", "G", "dctDenoising (xphoto)", "inpaint FSR_BEST (xphoto)", "inpaint SHIFTMAP (xphoto)",
    "LearningBasedWB", "TonemapDurand (xphoto)")
add(OC, "Paint", "S", "oilPainting (xphoto)")
add(OC, "Analysis", "G", "QualityBRISQUE", "QualityGMSD", "StaticSaliencyFineGrained", "ObjectnessBING")
add(OC, "Analysis", "G", "marrHildrethHash", "radialVarianceHash", "colorMomentHash", "blockMeanHash")

# --- scikit-image / scipy.ndimage / mahotas / Pillow (checked by introspection of installed packages) ---------------
SK = "scikit-image / scipy / mahotas / Pillow"
add(SK, "Analysis", "S", "blob_dog", "blob_log", "blob_doh", "corner_foerstner", "corner_kitchen_rosenfeld", "corner_moravec",
    "corner_shi_tomasi", "farid filter", "hessian filter (skimage)", "shape_index", "multiblock_lbp", "haar_like_feature",
    "graycoprops dissimilarity", "graycoprops homogeneity", "graycoprops ASM", "daisy descriptor")
add(SK, "Analysis", "G", "chan_vese", "morphological_chan_vese", "morphological_geodesic_active_contour", "random_walker",
    "felzenszwalb", "quickshift", "max_tree", "area_opening", "diameter_opening", "h_maxima", "flood (skimage)",
    "convex_hull_image", "unwrap_phase", "iradon_sart", "frt2 (finite radon)", "blur_effect (Crete-Roffet)",
    "estimate_sigma", "is_low_contrast", "unsupervised_wiener", "denoise_invariant (J-invariant)", "cycle_spin",
    "denoise_tv_bregman", "inpaint_biharmonic", "watershed_ift", "pftas (mahotas)", "haralick (mahotas)",
    "zernike_moments (mahotas)", "cwatershed (mahotas)")
add(SK, "Tone", "S", "adjust_sigmoid", "rank autolevel", "rank enhance_contrast", "rank pop", "rank noise_filter",
    "rank subtract_mean", "rank geometric_mean", "rank mean_bilateral", "rank majority", "rank modal",
    "rank autolevel_percentile", "rank sum_bilateral")
add(SK, "Blur", "S", "butterworth (skimage)", "fourier_ellipsoid", "fourier_uniform", "percentile_filter", "rank_filter",
    "morphological_laplace", "gaussian_gradient_magnitude", "isotropic_dilation", "majority_filter (mahotas)",
    "daubechies wavelet (mahotas)", "stretch_rgb (mahotas)")
add(SK, "Sharpen", "S", "PIL EDGE_ENHANCE_MORE", "PIL SMOOTH_MORE", "PIL DETAIL", "PIL CONTOUR", "PIL ModeFilter",
    "ImageEnhance.Sharpness", "ImageOps.deform")

# --- ImageMagick morphology methods & kernels / ordered-dither maps (imagemagick.org Usage pages) --------------------
IM = "ImageMagick 2"
add(IM, "Edges", "S", "Morphology EdgeIn", "Morphology EdgeOut", "Morphology Smooth", "Morphology Thicken",
    "Morphology HitAndMiss LineEnds", "Morphology HitAndMiss LineJunctions", "Kernel Peaks", "Kernel Ridges",
    "Kernel Comet", "Kernel Binomial", "Kernel FreiChen")
add(IM, "Edges", "G", "Morphology ConvexHull", "Morphology IterativeDistance", "Morphology Voronoi", "Morphology Skeleton")
add(IM, "Retro", "S", "Ordered dither h4x4a", "Ordered dither h6x6o", "Ordered dither h8x8a", "Ordered dither c7x7w",
    "Ordered dither checks")
add(IM, "Distort", "G", "Sparse-color Shepards", "Sparse-color Barycentric", "Sparse-color Inverse")
add(IM, "Distort", "S", "Distort BarrelInverse", "Distort DePolar", "Distort Arc")
add(IM, "Tone", "S", "Function Arcsin", "Function Arctan", "Statistic Nonpeak", "Statistic RootMeanSquare")
add(IM, "Analysis", "G", "Connected-components", "Perceptible")
add(IM, "Tone", "S", "Range-threshold (ImageMagick)", "Color-threshold (ImageMagick)", "White-threshold (ImageMagick)")

# --- VapourSynth / AviSynth (image-applicable plugins) -- vsdb.top / avisynth.nl (knowledge, see report) -----------
V = "VapourSynth / AviSynth"
add(V, "Repair", "S", "KNLMeansCL", "DFTTest", "FFT3DFilter", "flash3kyuu_deband (f3kdb)", "GradFun3", "Deblock_QED",
    "DeHalo_alpha", "YAHR (yet another halo remover)", "EdgeCleaner", "HQDering", "BlindDeHalo3", "Vinverse",
    "SangNom2 (anti-aliasing)", "MSmooth")
add(V, "Sharpen", "S", "LSFmod", "FineSharp", "aWarpSharp2", "SeeSaw", "MSharpen", "FastLineDarkenMOD", "Toon (AviSynth)",
    "ContraSharpening")
add(V, "Repair", "X", "MDegrain", "SMDegrain", "TempGaussMC (QTGMC)", "MCTemporalDenoise", "TTempSmooth", "RemoveGrain mode 17 / Clense")
add(V, "Edges", "S", "TCanny (VapourSynth)")

# --- Camera ISP pipeline stages ------------------------------------------------------------------------------------
I = "Camera ISP stages"
add(I, "Repair", "S", "Black level subtraction", "Defective pixel correction", "Lens shading correction", "Green imbalance correction",
    "False color suppression", "Chroma noise reduction (ISP)", "Highlight reconstruction (inpaint opposed)",
    "Highlight reconstruction (guided laplacians)", "Quad Bayer remosaic", "Bayer binning")
add(I, "Repair", "S", "Malvar-He-Cutler demosaic", "AHD demosaic", "VNG demosaic", "PPG demosaic", "DCB demosaic",
    "AMaZE demosaic", "RCD demosaic", "LMMSE demosaic", "Markesteijn X-Trans demosaic", "Hamilton-Adams demosaic")
add(I, "Color", "S", "Color correction matrix (CCM)", "Camera to XYZ matrix (DNG ColorMatrix)", "DNG forward matrix")
add(I, "Tone", "G", "Auto exposure metering (ISP)", "Auto white balance (ISP)")

# --- Printing / prepress ------------------------------------------------------------------------------------------
PP = "Printing / prepress"
add(PP, "Color", "S", "Gray component replacement (GCR)", "Under color removal (UCR)", "Under color addition (UCA)",
    "Total area coverage ink limit (TAC)", "Overprint preview", "Separation preview", "Rich black", "Dot gain compensation",
    "Paper white simulation (soft proof)", "Gamut warning", "Hexachrome separation", "Extended gamut CMYKOGV separation",
    "Registration error simulation", "Trapping (spread / choke)", "Knockout", "Tritone", "Quadtone")
add(PP, "Retro", "S", "Elliptical dot screen", "Euclidean dot screen", "Hybrid (XM) screening", "Rosette moire simulation")

# --- Cartography / GIS raster styling -------------------------------------------------------------------------------
GI = "Cartography / GIS"
add(GI, "Terrain", "S", "Swiss hillshading (Imhof)", "Multi-directional oblique weighting (MDOW)", "Red Relief Image Map (RRIM)",
    "Local Relief Model (LRM)", "Positive openness", "Negative openness", "Topographic Position Index (TPI)",
    "Terrain Ruggedness Index (TRI)", "Vector Ruggedness Measure (VRM)", "Plan curvature", "Profile curvature",
    "Hypsometric tint", "Waterlining", "Plan oblique relief", "Texture shading (Leland Brown)",
    "Sky-view factor visualization", "Multiscale topographic position (MSTP)", "Simple Local Relief Model (SLRM)",
    "Cliff shading", "Aerial perspective relief shading")
add(GI, "Terrain", "G", "Flow accumulation", "Topographic wetness index (TWI)", "Viewshed")

# --- Document image analysis (DIBCO-era methods) -------------------------------------------------------------------
DO = "Document analysis 2"
add(DO, "Repair", "S", "Wolf-Jolion binarization", "NICK binarization", "Bradley-Roth adaptive threshold", "Feng binarization",
    "Singh binarization", "Phansalkar threshold")
add(DO, "Repair", "G", "Su 2010 binarization", "Howe 2013 binarization", "Gatos 2006 binarization", "Lu-Su-Tan 2010 binarization",
    "Kittler-Illingworth minimum error threshold", "Kapur entropy threshold", "Shanbhag threshold", "Renyi entropy threshold",
    "Bleed-through removal", "Show-through removal", "Run-length smoothing (RLSA)", "XY-cut segmentation",
    "Docstrum layout analysis", "Projection profile deskew", "Stroke Width Transform")

# --- Image quality metrics as maps --------------------------------------------------------------------------------
Q = "Image quality maps"
add(Q, "Analysis", "S", "MSCN coefficients map (BRISQUE)", "Local sharpness map (S3)", "JNB blur metric", "CPBD blur metric")
add(Q, "Analysis", "G", "NIQE", "PIQE", "IL-NIQE", "BLIINDS-II", "DIIVINE")
add(Q, "Analysis", "X", "SSIM map", "MS-SSIM", "CW-SSIM", "IW-SSIM", "FSIM", "VSI", "MDSI", "HaarPSI", "SR-SIM", "VIF",
    "PSNR-HVS-M", "S-CIELAB", "Butteraugli", "SSIMULACRA 2", "NVIDIA FLIP", "HDR-VDP-2")
add(Q, "Analysis", "M", "LPIPS", "DISTS", "MUSIQ", "MANIQA")

# --- Medical / dermatology / fundus / radiology enhancement -------------------------------------------------------
ME = "Medical imaging 2"
add(ME, "Edges", "S", "Matched filter vessel detection (Chaudhuri)", "Line detector vessel (Ricci)", "Jerman vesselness",
    "Optimally oriented flux", "B-COSFIRE")
add(ME, "Repair", "S", "DullRazor hair removal", "Window/level (CT windowing)", "Lung window preset", "Bone window preset")
add(ME, "Sharpen", "G", "MUSICA multiscale contrast amplification")
add(ME, "Color", "S", "Shades of Gray color constancy", "Weighted gray-edge")

# --- Kornia augmentation (kornia.augmentation API) -----------------------------------------------------------------
K = "Kornia"
add(K, "Augment", "S", "RandomPlanckianJitter", "RandomPlasmaShadow", "RandomPlasmaBrightness", "RandomPlasmaContrast",
    "RandomLinearCornerIllumination", "RandomGaussianIllumination", "RandomChannelDropout", "RandomThinPlateSpline",
    "edge_aware_blur_pool2d", "max_blur_pool2d", "zca_whiten")
add(K, "Augment", "M", "RandomDissolving")

# --- Nik Collection Color Efex -- userguides.dxo.com/nikcollection/en/color-efex (fetched, 63-filter menu) -----------
N = "Nik Color Efex"
add(N, "Color", "S", "Bi-Color Filters (Color Efex)", "Bi-Color User Defined (Color Efex)", "Brilliance / Warmth (Color Efex)",
    "Color Stylizer (Color Efex)", "Contrast Color Range (Color Efex)", "Cross Balance (Color Efex)", "Foliage (Color Efex)",
    "Indian Summer (Color Efex)", "Midnight (Color Efex)", "Monday Morning (Color Efex)", "Paper Toner (Color Efex)",
    "Photo Stylizer (Color Efex)", "Polarization (Color Efex)", "Reflector Efex", "Remove Color Cast (Color Efex)",
    "Skylight Filter (Color Efex)", "Sunlight (Color Efex)", "White Neutralizer (Color Efex)", "Ink (Color Efex)",
    "Duplex (Color Efex)", "Selective Tones (Viveza)")
add(N, "Tone", "S", "Contrast Only (Color Efex)", "Dark Contrasts (Color Efex)", "Darken / Lighten Center (Color Efex)",
    "Pro Contrast (Color Efex)", "High Key (Color Efex)", "Low Key (Color Efex)", "Detail Extractor (Color Efex)",
    "Graduated Fog (Color Efex)", "Graduated User Defined (Color Efex)")
add(N, "Film", "S", "Film Efex: Faded", "Film Efex: Nostalgic", "Film Efex: Vintage", "Film Efex: Modern")
add(N, "Film", "S", "Multi-Lens (Analog Efex)")
add(N, "Film", "X", "Double Exposure (Analog Efex)")
add(N, "Blur", "S", "Classical Soft Focus (Color Efex)", "Dynamic Skin Softener (Color Efex)", "Vignette: Blur (Color Efex)",
    "Vignette: Lens (Color Efex)")

# --- Classic Photoshop plug-in suites: Eye Candy (5 Nature / 7), Xenofex 2, KPT 6, Flaming Pear, Topaz classic -------
# (Exposure Software support pages + press releases, Macworld Xenofex 2 list, MetaCreations KPT 6 release, Flaming Pear
#  listings, Topaz classic-plugins FAQ -- all searched)
PL = "Classic plug-in suites"
add(PL, "Stylize", "S", "Corona (Eye Candy)", "Reptile Skin (Eye Candy)", "Smoke (Eye Candy)", "Icicles (Eye Candy)",
    "Snow Drift (Eye Candy)", "Squint (Eye Candy)", "Texture Noise (Eye Candy)", "Fire (Eye Candy)")
add(PL, "Stylize", "S", "Burnt Edges (Xenofex)", "Classic Mosaic (Xenofex)", "Constellation (Xenofex)", "Crumple (Xenofex)",
    "Electrify (Xenofex)", "Flag (Xenofex)", "Little Fluffy Clouds (Xenofex)", "Rip Open (Xenofex)", "Television (Xenofex)")
add(PL, "Distort", "S", "KPT Goo", "KPT Projector", "KPT Gel", "KPT Materializer", "KPT Equalizer (Bounded Sharpen)",
    "KPT SkyEffects", "KPT Reaction", "KPT Convolver")
add(PL, "Stylize", "S", "Flood water reflection (Flaming Pear)", "LunarCell (Flaming Pear)", "Glitterato (Flaming Pear)",
    "Melancholytron (Flaming Pear)", "India Ink (Flaming Pear)", "SolarCell (Flaming Pear)", "Lacquer (Flaming Pear)",
    "Swerve (Flaming Pear)", "Hue and Cry (Flaming Pear)", "Aetherize (Flaming Pear)")
add(PL, "Paint", "S", "Topaz Impression", "Topaz Glow", "Topaz Clarity", "Topaz ReStyle", "Topaz Adjust",
    "Topaz B&W Effects", "Topaz Lens Effects", "Topaz Star Effects", "Topaz Texture Effects")

# --- Apple iPhone Photographic Styles (MacRumors iPhone 16 guide, searched) ------------------------------------------
AP = "Apple Photographic Styles"
add(AP, "Insta", "S", "Cool Rose (Photographic Style)", "Amber (Photographic Style)", "Rose Gold (Photographic Style)",
    "Gold (Photographic Style)", "Stark B&W (Photographic Style)", "Rich Contrast (Photographic Style)",
    "Vibrant (Photographic Style)")

# --- Colormaps (matplotlib / cmocean / Crameri / ColorBrewer / colorcet / CMasher), names read from installed packages --
def cm(src, prefix, names):
    for n in names.split(): add(src, "Analysis", "S", f"{prefix} {n}")
cm("Colormaps: matplotlib", "matplotlib", "viridis plasma inferno magma cividis turbo twilight cubehelix jet hot afmhot "
   "gist_earth gist_stern nipy_spectral CMRmap Wistia seismic coolwarm bone copper pink gnuplot2 gist_ncar")
cm("Colormaps: cmocean", "cmocean", "thermal haline solar ice oxy deep dense algae matter turbid speed amp tempo rain phase "
   "topo balance delta curl diff tarn")
cm("Colormaps: Crameri", "Crameri", "batlow batlowK batlowW acton bamako bilbao buda davos devon glasgow grayC hawaii imola "
   "lajolla lapaz lipari navia nuuk oslo tokyo turku bam berlin broc cork lisbon managua roma tofino vanimo vik "
   "romaO bamO brocO corkO vikO bukavu fes oleron")
cm("Colormaps: ColorBrewer", "ColorBrewer", "YlGnBu YlOrRd YlOrBr OrRd PuBuGn PuRd RdPu BuPu GnBu BuGn YlGn "
   "BrBG PRGn PiYG PuOr RdBu RdGy RdYlBu RdYlGn Spectral")
cm("Colormaps: colorcet", "colorcet", "fire bmy bgy kbc gouldian rainbow4 isolum colorwheel glasbey")
cm("Colormaps: CMasher", "CMasher", "rainforest ember toxic gothic eclipse iceburn redshift fusion seasons infinity")

# Near-duplicates of existing filters (reviewed by hand against dedupe11 near-matches and keyword probes)
DROP = [
    'corner_moravec',
    'Flood water reflection (Flaming Pear)',
    'Shades of Gray color constancy',
    'SpectrophotometricColorCalibration (SPCC)',
    'Flood Fill to Position',
    'Flood Fill to Index',
    'SMDegrain',
    'Statistic RootMeanSquare',
    'ID to SDF (Copernicus)',
    'Classical Soft Focus (Color Efex)',
    'Vignette: Lens (Color Efex)',
    'Graduated User Defined (Color Efex)',
    'Graduated Fog (Color Efex)',
    'Topaz Clarity',
    'Bi-Color User Defined (Color Efex)',
    'Contrast Only (Color Efex)',
    'Hex Tile (Copernicus)',
    'Corner Detect (Copernicus)',
    'Denoise TVD (Copernicus)',
    'Streak Blur (Copernicus)',
    'Heat Distort (Copernicus)',
    'HeightField Strata (Copernicus)',
    'HeightField Terrace (Copernicus)',
    'Slope Direction (Copernicus)',
    'Despill (Copernicus)',
    'Refract from Height (Copernicus)',
    'Ripple Solver (Copernicus)',
    'Edge Detect by Depth (Copernicus)',
    'Eikonal Distance (Copernicus)',
    'Star Glow (Copernicus)',
    'Height to Shadow (Copernicus)',
    'Grunge Aurora (Copernicus)',
    'Grunge Moisture (Copernicus)',
    'Grunge Sheets (Copernicus)',
    'Grunge Rusty Surface (Copernicus)',
    'Grunge Pine Bark (Copernicus)',
    'Grunge Rust (Copernicus)',
    'Grunge Drips (Copernicus)',
    'Feedback TOP',
    'Time Machine TOP',
    'Optical Flow TOP',
    'Cross TOP',
    'Inside TOP',
    'Outside TOP',
    'Slope TOP',
    'Luma Blur TOP',
    'Luma Level TOP',
    'Limit TOP',
    'Lookup TOP',
    'Analyze TOP',
    'Spectrum TOP',
    'Contrast/Luminosity (Substance)',
    'Auto Levels (Substance)',
    'Slope Blur Grayscale',
    'Directional Blur (Substance)',
    'Make It Tile Patch',
    'Make It Tile Photo',
    'Curvature Sobel',
    'Curvature Smooth',
    'Quantize Grayscale',
    'Replace Color Range',
    'Clouds 3 (Substance)',
    'Dirt (Substance)',
    'Grunge Map (Substance)',
    'Anisotropic Blur (Substance)',
    'Messy Fibers',
    'Blur HQ (Substance)',
    'Normal Sobel',
    'Shadows Midtones Highlights (Unity)',
    'Unreal Filmic Tonemapper',
    'Godot AgX tonemap',
    'Cinematic Depth of Field (Unreal)',
    'Mobile Gaussian Depth of Field',
    'Convolution Bloom (Unreal)',
    'Data-Driven Lens Flare (Unity SRP)',
    'Automatic Histogram Exposure (Unity)',
    'Glow Softlight blend (Godot)',
    'Style Transfer (Neural Filter)',
    'Camera Raw AI Denoise',
    'Calibration Primaries (Camera Raw)',
    'Fish-eye Lens (Clip Studio)',
    'Remove JPEG Noise (Clip Studio)',
    'Retro Film (Clip Studio)',
    'Halftone: Screen Print (Procreate)',
    'Halftone: Newspaper (Procreate)',
    'Noise: Billows (Procreate)',
    'Noise: Ridges (Procreate)',
    'Auto Van Gogh',
    'Posterize Using Color Set (Painter)',
    'Match Palette (Painter)',
    'Super Soften (Painter)',
    'Camera Motion Blur (Painter)',
    'Glass Distortion (Painter)',
    'Grid Paper (Painter)',
    'Siril Unpurple',
    'CosmeticCorrection (PixInsight)',
    'Siril find_cosme',
    'LocalHistogramEqualization (PixInsight)',
    'AutoHistogram (PixInsight)',
    'StarTools Contrast',
    'ColorCalibration (PixInsight)',
    'RangeSelection (PixInsight)',
    'Siril epf (edge-preserving filter)',
    'Siril rmgreen',
    'StarTools HDR',
    'Siril autostretch',
    'Siril modasinh (modified arcsinh)',
    'StarTools Shrink',
    'StarTools Heal',
    'StarTools Wipe',
    'Siril fixbanding',
    'ATrousWaveletTransform (PixInsight)',
    'GradientHDRCompression (PixInsight)',
    'gegl:color-assimilation-grid',
    'gegl:mean-curvature-blur',
    'gegl:snn-mean',
    'gegl:gaussian-blur-selective',
    'gegl:focus-blur',
    'gegl:variable-blur',
    'gegl:domain-transform',
    'gegl:noise-pick',
    'gegl:noise-slur',
    'gegl:noise-hurl',
    'gegl:linear-sinusoid',
    'gegl:bayer-matrix',
    'gegl:denoise-dct',
    'gegl:stress',
    'gegl:value-propagate',
    'gegl:waterpixels',
    'gegl:long-shadow',
    'gegl:texturize-canvas',
    'gegl:tile-paper',
    'gegl:recursive-transform',
    'gegl:video-degradation',
    'gegl:illusion',
    'gegl:mirrors',
    'gegl:noise-cie-lch',
    'fastGlobalSmootherFilter',
    'fastBilateralSolverFilter',
    'rollingGuidanceFilter',
    'amFilter (adaptive manifold)',
    'dtFilter (domain transform)',
    'StructuredEdgeDetection',
    'FastHoughTransform',
    'GradientDericheX',
    'GradientPaillou',
    'SuperpixelSEEDS',
    'ScanSegment',
    'SelectiveSearchSegmentation',
    'GraphSegmentation (ximgproc)',
    'fourierDescriptor',
    'intensity_transform contrastStretching',
    'intensity_transform autoscaling',
    'intensity_transform BIMEF',
    'LearningBasedWB',
    'QualityBRISQUE',
    'StaticSaliencyFineGrained',
    'TonemapDurand (xphoto)',
    'l0Smooth',
    'RidgeDetectionFilter',
    'findEllipses (ximgproc)',
    'corner_kitchen_rosenfeld',
    'corner_shi_tomasi',
    'corner_foerstner',
    'farid filter',
    'hessian filter (skimage)',
    'daisy descriptor',
    'chan_vese',
    'morphological_chan_vese',
    'morphological_geodesic_active_contour',
    'random_walker',
    'felzenszwalb',
    'diameter_opening',
    'convex_hull_image',
    'blur_effect (Crete-Roffet)',
    'is_low_contrast',
    'cycle_spin',
    'denoise_tv_bregman',
    'inpaint_biharmonic',
    'watershed_ift',
    'haralick (mahotas)',
    'cwatershed (mahotas)',
    'adjust_sigmoid',
    'rank autolevel',
    'rank enhance_contrast',
    'rank geometric_mean',
    'rank mean_bilateral',
    'rank majority',
    'rank autolevel_percentile',
    'rank sum_bilateral',
    'rank modal',
    'rank pop',
    'rank subtract_mean',
    'butterworth (skimage)',
    'percentile_filter',
    'gaussian_gradient_magnitude',
    'isotropic_dilation',
    'daubechies wavelet (mahotas)',
    'PIL ModeFilter',
    'stretch_rgb (mahotas)',
    'PIL SMOOTH_MORE',
    'PIL CONTOUR',
    'PIL DETAIL',
    'ImageEnhance.Sharpness',
    'flood (skimage)',
    'blob_dog',
    'blob_log',
    'blob_doh',
    'unwrap_phase',
    'graycoprops dissimilarity',
    'graycoprops homogeneity',
    'graycoprops ASM',
    'morphological_laplace',
    'Morphology EdgeIn',
    'Morphology EdgeOut',
    'Morphology Thicken',
    'Morphology Smooth',
    'Morphology ConvexHull',
    'Morphology Voronoi',
    'Morphology Skeleton',
    'Morphology IterativeDistance',
    'Morphology HitAndMiss LineEnds',
    'Morphology HitAndMiss LineJunctions',
    'Kernel Comet',
    'Kernel Binomial',
    'Kernel FreiChen',
    'Ordered dither h4x4a',
    'Ordered dither h6x6o',
    'Ordered dither h8x8a',
    'Ordered dither c7x7w',
    'Ordered dither checks',
    'Distort Arc',
    'Distort DePolar',
    'Distort BarrelInverse',
    'Statistic Nonpeak',
    'Connected-components',
    'Kernel Ridges',
    'KNLMeansCL',
    'RemoveGrain mode 17 / Clense',
    'MSharpen',
    'flash3kyuu_deband (f3kdb)',
    'GradFun3',
    'Deblock_QED',
    'HQDering',
    'Markesteijn X-Trans demosaic',
    'Auto exposure metering (ISP)',
    'Auto white balance (ISP)',
    'Lens shading correction',
    'Chroma noise reduction (ISP)',
    'Paper white simulation (soft proof)',
    'Plan curvature',
    'Profile curvature',
    'Sky-view factor visualization',
    'Simple Local Relief Model (SLRM)',
    'Aerial perspective relief shading',
    'Multiscale topographic position (MSTP)',
    'Su 2010 binarization',
    'Howe 2013 binarization',
    'Phansalkar threshold',
    'Gatos 2006 binarization',
    'Shanbhag threshold',
    'Renyi entropy threshold',
    'Kittler-Illingworth minimum error threshold',
    'Run-length smoothing (RLSA)',
    'Stroke Width Transform',
    'Show-through removal',
    'NICK binarization',
    'Feng binarization',
    'Singh binarization',
    'PIQE',
    'NIQE',
    'Matched filter vessel detection (Chaudhuri)',
    'Line detector vessel (Ricci)',
    'RandomPlanckianJitter',
    'RandomPlasmaShadow',
    'RandomPlasmaBrightness',
    'RandomPlasmaContrast',
    'RandomLinearCornerIllumination',
    'RandomChannelDropout',
    'RandomThinPlateSpline',
]

# Feasibility corrections: both of these compare against a second (reference) image.
FEAS = {"Siril linear_match": "X", "QualityGMSD": "X"}
