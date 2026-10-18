"""Round 20 raw candidates (input to dedupe20.py --build).

Verification-first round: every block below was read first-hand from the URL in its header comment
(docs page, API reference, README, catalogue or source file fetched during the harvest).
(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames.
"""
C = []
DROP = set()

# --- Max/Jitter matrix objects (Cycling '74) ----------------------------------------------------------------------------
# Object reference pages https://docs.cycling74.com/reference/jit.<object> (Description + Discussion sections) for
# eclipse, fluoride, plur, plume, roy, sprinkle, streak, wake, rubix, shade, scanslide, scanwrap, scanoffset, robcross,
# glop, brass, altern, avg4, charmap, traffic, repos, keyscreen, tiffany, slide, hatch, bsort, xfade (and others)
S_ = 'Max/Jitter objects'
C += [
    ('Tinted self-thumbnail grid: each cell a scaled copy of the frame tinted to rebuild an image (Jitter jit.eclipse)', S_, 'Stylize', 'S'),
    ('Luminance-band neon fade toward a colour, brighter values to black (Jitter jit.fluoride)', S_, 'Stylize', 'S'),
    ('Image halftone: grid cells replaced by regions of a second image chosen by cell mean (Jitter jit.roy)', S_, 'Stylize', 'X'),
    ('Spatial envelope follower: attack/decay smear along rows or columns (Jitter jit.scanslide)', S_, 'Blur', 'G'),
    ('Scanline rewrapping into a different row width (Jitter jit.scanwrap)', S_, 'Retro', 'S'),
    ('Colour screen overlay revealing the image through threshold gaps (Jitter jit.altern)', S_, 'Stylize', 'S'),
    ('Four-point average at a set distance (Jitter jit.avg4)', S_, 'Blur', 'S'),
    ('Cross-hatch grid: each cell shows its corner colour along the central axes (Jitter jit.hatch)', S_, 'Stylize', 'S'),
    ('Per-pixel crossfade rate from a map, temporal (Jitter jit.shade)', S_, 'Frames', 'X'),
    ('Probability streaks: cell values extended into following cells (Jitter jit.streak)', S_, 'Stylize', 'G'),
    ('Video feedback with a convolution stage (Jitter jit.wake)', S_, 'Frames', 'X'),
    ('Grid cell reorder, flip, freeze and monochrome fill (Jitter jit.rubix)', S_, 'Distort', 'S'),
    ('Random-size rectangular resampling facets (Jitter jit.tiffany)', S_, 'Stylize', 'S'),
    ('Per-scanline offset and scale from a 1-D map (Jitter jit.scanoffset)', S_, 'Distort', 'S'),
    ('Downsample-then-interpolate resample (Jitter jit.plur)', S_, 'Blur', 'S'),
    ('Bubble sort of matrix cells (Jitter jit.bsort)', S_, 'Stylize', 'G'),
]

# --- TouchDesigner TOP operators (Derivative) -----------------------------------------------------------------------------
# TOP family list https://docs.derivative.ca/TOP ; operator pages https://docs.derivative.ca/PreFilter_Map_TOP ,
# https://docs.derivative.ca/Luma_Blur_TOP , https://docs.derivative.ca/Luma_Level_TOP , https://docs.derivative.ca/Analyze_TOP
S_ = 'TouchDesigner TOPs'
C += [
    ('Pre-filtered specular environment map via spherical harmonics (TouchDesigner PreFilter Map TOP)', S_, 'Materials', 'G'),
    ('Luma blur: per-pixel blur size from a second input luminance (TouchDesigner Luma Blur TOP)', S_, 'Blur', 'S'),
    ('Hue- and saturation-preserving levels (TouchDesigner Luma Level TOP)', S_, 'Tone', 'S'),
]

# --- DIPlib (Quantitative Imaging library) function reference -----------------------------------------------------------
# Module pages https://diplib.org/diplib-docs/<module>.html for nonlinear, linear, morphology, microscopy, deconvolution,
# distance, transform, segmentation, mapping, geometry, analysis (function signature + description read for each)
S_ = 'DIPlib'
C += [
    ('Adaptive banana filter: Gaussian kernel bent to local orientation and curvature (DIPlib AdaptiveBanana)', S_, 'Blur', 'S'),
    ('Selection filter: take the value where a control image is min/max in the window (DIPlib SelectionFilter)', S_, 'Blur', 'S'),
    ('Morphological gist: average of complementary operators minus the image, texture/object scale (DIPlib MorphologicalGist)', S_, 'Edges', 'S'),
    ('Morphological threshold smoothing: average of complementary operators (DIPlib MorphologicalThreshold)', S_, 'Blur', 'S'),
    ('Lee morphological edge detector: minimum of complementary operators (DIPlib Lee)', S_, 'Edges', 'S'),
    ('Multi-scale morphological gradient averaged over SE sizes (DIPlib MultiScaleMorphologicalGradient)', S_, 'Edges', 'S'),
    ('Rank-min closing, noise-robust closing (Soille, DIPlib RankMinClosing)', S_, 'Repair', 'S'),
    ('Limited-reach morphological reconstruction (DIPlib LimitedMorphologicalReconstruction)', S_, 'Analysis', 'G'),
    ('Error-function soft clipping to a range (DIPlib ErfClip)', S_, 'Tone', 'S'),
    ('Normalized convolution for missing / uncertain data (Knutsson-Westin, DIPlib NormalizedConvolution)', S_, 'Repair', 'S'),
    ('Minimum-variance spatial k-d partitioning (DIPlib MinimumVariancePartitioning)', S_, 'Analysis', 'G'),
    ('Per-object ellipsoid-fit threshold (DIPlib PerObjectEllipsoidFit)', S_, 'Analysis', 'G'),
    ('Stochastic watershed (Angulo-Jeulin, DIPlib StochasticWatershed)', S_, 'Analysis', 'G'),
    ('Unimodal background-symmetry threshold (DIPlib BackgroundThreshold)', S_, 'Analysis', 'G'),
    ('Mix stains: compose a brightfield colour image from stain densities (DIPlib MixStains)', S_, 'Color', 'S'),
    ('Laplace plus / minus second derivative in the gradient direction (DIPlib LaplacePlusDgg / LaplaceMinusDgg)', S_, 'Edges', 'S'),
    ('Robust anisotropic diffusion with Tukey error norm (Black-Sapiro, DIPlib RobustAnisotropicDiffusion)', S_, 'Blur', 'S'),
    ('Orientation space: stack of orientation-selective filter responses (DIPlib OrientationSpace)', S_, 'Analysis', 'G'),
    ('Thin-plate spline warp from control points (DIPlib WarpControlPoints)', S_, 'Distort', 'G'),
    ('Morphological sharpening: pick dilation or erosion closest to input (DIPlib MorphologicalSharpening)', S_, 'Sharpen', 'S'),
    ('Grey-weighted distance transform (DIPlib GreyWeightedDistanceTransform)', S_, 'Analysis', 'G'),
    ('Volume-fraction threshold (DIPlib VolumeThreshold)', S_, 'Analysis', 'G'),
]

# --- unpaper (scanned-page post-processing) ---------------------------------------------------------------------------------
# Man page https://raw.githubusercontent.com/unpaper/unpaper/main/doc/unpaper.1.rst ,
# concepts https://raw.githubusercontent.com/unpaper/unpaper/main/doc/basic-concepts.md
S_ = 'unpaper / ScanTailor (scanned pages)'
C += [
    ('Gray filter: clear sliding windows that hold only grey and no black pixels (unpaper grayfilter)', S_, 'Repair', 'G'),
    ('Blur filter: clear sparse lonely pixel clusters in mostly empty windows (unpaper blurfilter)', S_, 'Repair', 'G'),
    ('Black filter: sliding-bar detection and fill of solid black scan areas (unpaper blackfilter)', S_, 'Repair', 'G'),
]
# ScanTailor Advanced README https://raw.githubusercontent.com/4lex4/scantailor-advanced/master/README.md
C += [
    ('Split mixed scan into B&W text foreground and original picture background layers (ScanTailor Advanced splitting output)', S_, 'Repair', 'G'),
    ('Colour segmenter: colourize the B&W text mask from the original colours, then posterize (ScanTailor Advanced)', S_, 'Repair', 'G'),
    ('Marginal dewarping from curved top and bottom page borders (ScanTailor Featured)', S_, 'Repair', 'G'),
]

# --- Fotocx (formerly Fotoxx) Linux photo editor ------------------------------------------------------------------------------
# Home page with long overview and capabilities list https://kornelix.net/fotocx/fotocx.html
S_ = 'Fotocx'
C += [
    ('Unwarp close-up portrait: fix balloon-face perspective distortion (Fotocx unwarp closeup)', S_, 'Distort', 'S'),
    ('Unbend: straighten bowed wide-angle photos and panoramas (Fotocx Unbend)', S_, 'Distort', 'S'),
    ('Zonal retinex colour restoration (Fotocx Global and Zonal Retinex)', S_, 'Tone', 'G'),
    ('Remove halos (Fotocx)', S_, 'Repair', 'S'),
]

# --- ImageJ 1.x classic plugin catalogue ------------------------------------------------------------------------------------
# https://imagej.net/ij/plugins/index.html (sections Filters, Segmentation, Analysis, Stacks, Utilities; name + one-line note)
S_ = 'ImageJ classic plugins'
C += [
    ('Confocal scan-line X-shift correction for bidirectional scans (ImageJ X_Shifter / Correct X Shift)', S_, 'Repair', 'G'),
    ('Plane brightness adjustment through a confocal depth stack (ImageJ, CLSM)', S_, 'Tone', 'X'),
    ('RATS robust automatic threshold selection, gradient-weighted quadtree (ImageJ)', S_, 'Analysis', 'G'),
    ('Iterative radial voting for structural saliency (Parvin, ImageJ)', S_, 'Analysis', 'G'),
    ('Single-distance X-ray phase retrieval, Paganin (ImageJ ANKAphase)', S_, 'Repair', 'G'),
    ('Azimuthal average: rotationally averaged image about a centre (ImageJ)', S_, 'Analysis', 'G'),
    ('SIOX simple interactive object extraction (ImageJ)', S_, 'Analysis', 'G'),
    ('Polynomial surface fit background (ImageJ)', S_, 'Repair', 'G'),
]

# --- Nukepedia, fourth pass: categories not read in round 19 -----------------------------------------------------------------
# https://www.nukepedia.com/tools/plugins/<cat>/ and https://www.nukepedia.com/tools/toolsets/<cat>/ for 3d, channel, colour,
# deep, draw, filter, image, keyer, merge, metadata, other, particles, stereo, time, transform; https://www.nukepedia.com/tools/
# blink/<cat>/ for 3d, channel, deep, keyer, merge, other, particles, stereo, time; https://www.nukepedia.com/tools/gizmos/<cat>/
# for time, 3d, deep, particles, metadata (name + author's description on each listing)
S_ = 'Nukepedia plug-ins and toolsets'
C += [
    ('Per-pixel gamma from a control image (Nukepedia IGamma)', S_, 'Tone', 'S'),
    ('Per-pixel rank filter with rank and size driven by control images (Nukepedia IRank)', S_, 'Blur', 'S'),
    ('Gamma and gain preserving perceived saturation (Nukepedia GammaGain)', S_, 'Tone', 'S'),
    ('Sorted merge: per-pixel sort across inputs, output a chosen rank (Nukepedia SortedMerge)', S_, 'Frames', 'X'),
    ('LatLong environment reflection over a normal pass (Nukepedia EnvReflection)', S_, 'Materials', 'X'),
    ('Edge flares from light just outside the frame (Nukepedia ct_EdgeFlare)', S_, 'Stylize', 'S'),
    ('Perceptual L*a*b* colour-temperature keyer (Nukepedia TemperatureKeyer)', S_, 'Analysis', 'S'),
    ('Merge foreground over background in log space (Nukepedia Log Merge)', S_, 'Color', 'X'),
    ('Regrain only the areas changed from the denoised scan (Nukepedia Regrain Changed Only)', S_, 'Film', 'X'),
    ('Melting snow on the camera lens (Nukepedia screen_snow)', S_, 'Render', 'S'),
    ('Normal map from four directionally lit photos (Nukepedia photonormal)', S_, 'Materials', 'X'),
    ('Soft edge detect by local standard deviation (Nukepedia SoftEdgeDetect)', S_, 'Edges', 'S'),
    ('Broadcast-safe chrominance limit display (Nukepedia ChromaLimit)', S_, 'Analysis', 'S'),
    ('Threshold blur: blur neighbours whose difference is under a threshold (Nukepedia thresholdBlur)', S_, 'Blur', 'S'),
    ('Matrix-style digital rain (Nukepedia MR_Matrix_Effect)', S_, 'Render', 'S'),
]

# --- sunkit-image (SunPy solar image processing) -----------------------------------------------------------------------------
# API index https://docs.sunpy.org/projects/sunkit-image/en/stable/ ; docstrings read from
# https://docs.sunpy.org/projects/sunkit-image/en/stable/api/sunkit_image.<module>.<function>.html
S_ = 'Solar & astronomical display libraries (sunkit-image, astropy, photutils)'
C += [
    ('Multi-scale Gaussian normalization, arctan-combined local normalisations (Morgan-Druckmueller, sunkit-image mgn)', S_, 'Tone', 'S'),
    ('Wavelets Optimized Whitening: equalise wavelet power at all scales and locations (Auchere, sunkit-image wow)', S_, 'Sharpen', 'G'),
    ('Normalizing radial graded filter for the corona (NRGF, sunkit-image)', S_, 'Tone', 'G'),
    ('Fourier normalizing radial graded filter (FNRGF, sunkit-image)', S_, 'Tone', 'G'),
    ('Radial histogram equalizing filter (RHEF, sunkit-image)', S_, 'Tone', 'G'),
    ('Radial intensity enhancement above a given radius (sunkit-image intensity_enhance)', S_, 'Tone', 'G'),
    ('OCCULT-2 oriented curved loop tracing (Aschwanden, sunkit-image occult2)', S_, 'Analysis', 'G'),
    ('STARA sunspot detection by morphological operations (sunkit-image stara)', S_, 'Analysis', 'G'),
    ('Photosphere granule segmentation into tri-value maps (sunkit-image granule.segment)', S_, 'Analysis', 'G'),
    ('Upsilon double-sided gamma stretch (sunkit-image apply_upsilon)', S_, 'Tone', 'S'),
]
# astropy visualization API https://docs.astropy.org/en/stable/visualization/ref_api.html
C += [
    ('ZScale display interval, IRAF zscale (astropy ZScaleInterval)', S_, 'Tone', 'G'),
    ('Power-distribution stretch (a^x - 1)/(a - 1) (astropy PowerDistStretch)', S_, 'Tone', 'S'),
    ('Sinh stretch (astropy SinhStretch)', S_, 'Tone', 'S'),
    ('Contrast/bias stretch, DS9 style (astropy ContrastBiasStretch)', S_, 'Tone', 'S'),
    ('Lupton interconnected-band asinh RGB composite (astropy make_lupton_rgb)', S_, 'Color', 'X'),
]
# photutils background API https://photutils.readthedocs.io/en/stable/reference/background_api.html
C += [
    ('Mesh background map with the SourceExtractor mode estimator (photutils Background2D / SExtractorBackground)', S_, 'Repair', 'G'),
    ('DAOPHOT MMM sky background map (photutils MMMBackground)', S_, 'Repair', 'G'),
    ('Background RMS noise map from MAD-std / biweight scale (photutils)', S_, 'Analysis', 'G'),
]

# --- bruges (Agile Scientific geophysics library): seismic attributes and filters applied to image columns as traces -------
# https://code.agilescientific.com/bruges/api/bruges.attribute.html , https://code.agilescientific.com/bruges/api/bruges.filters.html
S_ = 'Seismic attributes (bruges)'
C += [
    ('Trace envelope / instantaneous amplitude down each column via Hilbert transform (bruges)', S_, 'Analysis', 'G'),
    ('Instantaneous phase down each column (bruges)', S_, 'Analysis', 'G'),
    ('Instantaneous frequency down each column (bruges)', S_, 'Analysis', 'G'),
    ('Dip steering: dip field from maximum cross-correlation of adjacent columns (bruges dipsteer)', S_, 'Analysis', 'G'),
    ('Eigenstructure coherence discontinuity (Gersztenkorn-Marfurt 1999, bruges)', S_, 'Edges', 'S'),
    ('Semblance coherence with structural dip (Marfurt 1999, bruges)', S_, 'Edges', 'S'),
    ('Spectral decomposition: three STFT frequency bands blended as RGB (bruges)', S_, 'Analysis', 'G'),
    ('Constant phase rotation of columns via the quadrature trace (bruges rotate_phase)', S_, 'Distort', 'G'),
    ('Categorical mode filter for label images (bruges mode)', S_, 'Repair', 'S'),
]

# --- VIGRA (vigranumpy reference) ---------------------------------------------------------------------------------------------
# https://ukoethe.github.io/vigra/doc-release/vigranumpy/index.html (function signatures + docstrings, modules filters / analysis /
# noise / fourier)
S_ = 'VIGRA'
C += [
    ('Boundary tensor: joint edge and junction energy from Riesz-transformed LoG (Koethe, VIGRA boundaryTensor2D)', S_, 'Edges', 'S'),
    ('Hourglass filter: anisotropic smoothing of the structure tensor (Koethe, VIGRA hourGlassFilter2D)', S_, 'Analysis', 'S'),
    ('Eccentricity transform of labelled regions (VIGRA eccentricityTransform)', S_, 'Analysis', 'G'),
    ('Fast radial symmetry transform, Loy-Zelinsky (VIGRA radialSymmetryTransform2D)', S_, 'Analysis', 'S'),
    ('Rohr corner detector (VIGRA cornernessRohr)', S_, 'Edges', 'S'),
    ('Beaudet corner detector (VIGRA cornernessBeaudet)', S_, 'Edges', 'S'),
    ('Noise normalization from an estimated non-parametric / quadratic noise model (VIGRA noise)', S_, 'Repair', 'G'),
    ('Crack-edge image: region boundaries drawn between pixels at double resolution (VIGRA regionImageToCrackEdgeImage)', S_, 'Analysis', 'G'),
    ('Distance-transform watershed of a membrane probability map (VIGRA wsDtSegmentation)', S_, 'Analysis', 'G'),
]

# --- GNU Octave image package / JuliaImages ------------------------------------------------------------------------------------
# https://octave.sourceforge.io/image/function/edge.html , https://octave.sourceforge.io/image/overview.html ,
# https://juliaimages.org/latest/function_reference/ , https://juliaimages.org/ImageBinarization.jl/stable/reference/ ,
# https://juliaimages.org/ImageContrastAdjustment.jl/stable/reference/
S_ = 'Octave image package / JuliaImages'
C += [
    ('Lindeberg differential-geometric single-scale edge detector (Octave edge "Lindeberg")', S_, 'Edges', 'S'),
    ("Andy Adler's hysteresis Sobel edge algorithm (Octave edge \"Andy\")", S_, 'Edges', 'G'),
    ('Polysegment polynomial-segmentation binarization (JuliaImages ImageBinarization Polysegment)', S_, 'Analysis', 'G'),
    ('Ando consistent-gradient kernels ando3 / ando4 / ando5 (JuliaImages ImageFiltering)', S_, 'Edges', 'S'),
    ('Bickley isotropic gradient kernel (JuliaImages ImageFiltering)', S_, 'Edges', 'S'),
    ('Fast-scanning region segmentation (JuliaImages ImageSegmentation fast_scanning)', S_, 'Analysis', 'G'),
    ('Unseeded region growing segmentation (JuliaImages ImageSegmentation)', S_, 'Analysis', 'G'),
    ('Colour angle map against a reference colour (Octave colorangle)', S_, 'Analysis', 'S'),
]

# --- Icy (Institut Pasteur) plug-in catalogue ----------------------------------------------------------------------------------
# Plug-in list https://icy.bioimageanalysis.org/wp-json/wp/v2/plugin?per_page=100&page=1..5 (448 titles); descriptions read from
# https://icy.bioimageanalysis.org/plugin/<slug>/ (cs-based-denoising, potts-segmentation, middlebury-color-coder, membrane-filter,
# non-linear-filter, edge-preserving-denoising-and-smoothing, udwt-wavelet-residual-remover, texture-segmentation)
S_ = 'Icy plug-ins'
C += [
    ('Compressed-sensing denoising: fuse TV reconstructions of Fourier sub-samplings (Meiniel, Icy CS based denoising)', S_, 'Repair', 'G'),
    ('Potts-model piecewise-constant segmentation (Icy Potts Segmentation)', S_, 'Analysis', 'G'),
    ('Middlebury colour coding of a 2-D flow field (Icy Middlebury Color Coder)', S_, 'Analysis', 'S'),
    ('Membrane filter: tensor anisotropic PDE for co-dimension-2 planar structures (Icy Membrane Filter)', S_, 'Repair', 'G'),
    ('Regularized Perona-Malik diffusion, Catte et al. (Icy Non-linear Filter)', S_, 'Blur', 'S'),
    ('Wavelet reconstruction up to a scale without the residual (Icy UDWT Wavelet Residual Remover)', S_, 'Sharpen', 'S'),
]

# --- X-PostProcessing-Library (QianMo, Unity) ---------------------------------------------------------------------------------
# Effect gallery in https://raw.githubusercontent.com/QianMo/X-PostProcessing-Library/master/README.md
S_ = 'X-PostProcessing-Library (Unity)'
C += [
    ('Leaf-shaped cell pixelation (XPL Pixelize Leaf)', S_, 'Stylize', 'S'),
    ('Aurora vignette: animated aurora-coloured edge glow (XPL Aurora Vignette)', S_, 'Stylize', 'S'),
    ('Tile jitter: per-tile random horizontal offsets (XPL Glitch Tile Jitter)', S_, 'Retro', 'S'),
    ('Wave jitter: sinusoidal row displacement glitch (XPL Glitch Wave Jitter)', S_, 'Retro', 'S'),
    ('Screen jump: vertical frame jump glitch (XPL Glitch Screen Jump)', S_, 'Retro', 'S'),
    ('Grainy blur: noise-offset single-pass blur (XPL Grainy Blur)', S_, 'Blur', 'S'),
    ('Polar sector pixelation (XPL Pixelize Sector)', S_, 'Stylize', 'S'),
]

# --- Material Maker (RodZill4) node library -------------------------------------------------------------------------------------
# Library index https://rodzill4.github.io/material-maker/doc/base_library.html ; node pages
# https://rodzill4.github.io/material-maker/doc/node_<name>.html (articleBody description read)
S_ = 'Material Maker nodes'
C += [
    ('Warp dilation: dilate along heightmap slope paths keeping the attenuated maximum (Material Maker)', S_, 'Materials', 'S'),
    ('Fill to orientation: grey level per filled island from its orientation (Material Maker)', S_, 'Materials', 'G'),
    ('Multi warp: iterative warp re-sampling the control derivative each step (Material Maker)', S_, 'Distort', 'S'),
    ('Tones step: emphasise light and dark tones around a chosen value (Material Maker)', S_, 'Tone', 'S'),
    ('Slope: expand slopes downhill from the highest areas (Material Maker)', S_, 'Materials', 'S'),
    ('Binary smooth: smooth the outline of a mask (Material Maker)', S_, 'Repair', 'S'),
]

# --- Negative Lab Pro (film negative conversion) ----------------------------------------------------------------------------------
# User guide https://www.negativelabpro.com/guide/basics/ (Color Models, Pre-saturation, Tone Profiles, LUT sections)
S_ = 'Negative Lab Pro'
C += [
    ('Fuji Frontier lab-scanner colour rendition (Negative Lab Pro colour model)', S_, 'Film', 'S'),
    ('Noritsu lab-scanner colour rendition (Negative Lab Pro colour model)', S_, 'Film', 'S'),
    ('Pakon F135 scanner look (Negative Lab Pro LUT)', S_, 'Film', 'S'),
    ('Fuji Crystal Archive paper print look (Negative Lab Pro Crystal LUT)', S_, 'Film', 'S'),
    ('Pre-saturation of the negative before inversion (Negative Lab Pro)', S_, 'Film', 'S'),
]

# --- VueScan (Hamrick) scanner software -----------------------------------------------------------------------------------------
# Filter tab https://www.hamrick.com/vuescan/html/vuesc31.htm , Color tab https://www.hamrick.com/vuescan/html/vuesc32.htm
S_ = 'Scanner software (VueScan)'
C += [
    ('Restore fading: correct faded slide (red) and negative (cyan) dye shifts (VueScan)', S_, 'Repair', 'G'),
    ('Restore colours toward memory colours (VueScan Restore colors)', S_, 'Color', 'G'),
    ('Night colour balance from the darkest 10% of the image (VueScan)', S_, 'Color', 'G'),
    ('Landscape colour balance: neutral greys plus lifelike sky blue and foliage green (VueScan)', S_, 'Color', 'G'),
    ('Portrait colour balance: neutral greys plus lifelike skin tones (VueScan)', S_, 'Color', 'G'),
    ('Hole-punch removal on document scans (VueScan)', S_, 'Repair', 'G'),
    ('Infrared-channel dust and scratch cleaning (VueScan Infrared clean)', S_, 'Repair', 'X'),
]
# SilverFast feature pages https://www.silverfast.com/about-silverfast-why-scanning-basics-of-scanning/why-silverfast/
# silverfast-feature-highlights/<feature>/ (kodachrome, acr, aaco, sc2g, gane, srdx, gcc; meta description read)
C += [
    ('Kodachrome scan blue-cast removal (SilverFast Kodachrome)', S_, 'Film', 'S'),
    ('Adaptive colour restoration: refresh faded and normalise oversaturated colours (SilverFast ACR)', S_, 'Repair', 'G'),
    ('Selective colour to grey conversion (SilverFast SC2G)', S_, 'Color', 'S'),
]

# --- SAGA GIS 9.9.1 tool library (grid / terrain / imagery tools not read in round 14) ---------------------------------------
# Full index https://saga-gis.sourceforge.io/saga_tool_doc/9.9.1/a2z.html ; tool pages
# https://saga-gis.sourceforge.io/saga_tool_doc/9.9.1/<library>_<n>.html (Description section read for each)
S_ = 'SAGA GIS tools 2'
C += [
    ('Colour triangle composite: three bands mapped to user-chosen colours (SAGA)', S_, 'Color', 'X'),
    ('Focal PCA: principal components of centre-minus-neighbour differences (SAGA, Thomas-Herzfeld 2004)', S_, 'Analysis', 'G'),
    ('Diurnal anisotropic heat index from slope and aspect (SAGA, Boehner-Antonic 2009)', S_, 'Terrain', 'S'),
    ('Melton ruggedness number (SAGA)', S_, 'Terrain', 'G'),
    ('Mass balance index (SAGA)', S_, 'Terrain', 'G'),
    ('Valley depth below an interpolated ridge level (SAGA)', S_, 'Terrain', 'G'),
    ('Multiresolution valley-bottom / ridge-top flatness MRVBF / MRRTF (SAGA)', S_, 'Terrain', 'G'),
    ('Terrain surface convexity, Iwahashi-Pike 2007 (SAGA)', S_, 'Terrain', 'S'),
    ('Terrain surface texture, Iwahashi-Pike 2007 (SAGA)', S_, 'Terrain', 'S'),
    ('Iwahashi-Pike terrain surface classification (SAGA)', S_, 'Terrain', 'G'),
    ('Wind effect windward / leeward index (SAGA)', S_, 'Terrain', 'G'),
    ('Wind exposition index averaged over all directions (SAGA)', S_, 'Terrain', 'G'),
    ('Wind shelter index, Plattner 2004 (SAGA)', S_, 'Terrain', 'S'),
    ('Terrain classification index for lowlands TCI Low (SAGA)', S_, 'Terrain', 'G'),
    ('Radius of variance: radius at which local variance exceeds a criterion (SAGA)', S_, 'Analysis', 'G'),
    ('Multi-band spectral variation: mean feature-space distance to the neighbourhood centroid (SAGA)', S_, 'Analysis', 'S'),
    ('Resampling filter: area-weighted upscale then spline downscale low/high pass (SAGA)', S_, 'Blur', 'S'),
    ('Iterative truncation of highest values to a target average (SAGA)', S_, 'Tone', 'G'),
    ('Relative heights and slope positions (SAGA)', S_, 'Terrain', 'G'),
    ('Effective air flow heights (SAGA)', S_, 'Terrain', 'G'),
    ('Directional statistics along a direction for each cell (SAGA)', S_, 'Analysis', 'G'),
    ('Fuzzy landform element classification from slope and curvatures (SAGA, Schmidt felementf)', S_, 'Terrain', 'S'),
    ('Surface-specific points classification (SAGA)', S_, 'Terrain', 'S'),
    ('Flat detection: connected areas of identical value (SAGA)', S_, 'Analysis', 'G'),
    ('Morphometric protection index (SAGA, = positive openness)', S_, 'Terrain', 'G'),
    ('Universal image quality index map (SAGA)', S_, 'Analysis', 'X'),
    ('Downslope distance gradient (SAGA)', S_, 'Terrain', 'G'),
]
# GRASS GIS addons index https://grass.osgeo.org/grass-stable/manuals/addons/ (module name + one-line description)
C += [
    ('Feature-preserving denoising of topographic data (GRASS r.denoise)', S_, 'Terrain', 'G'),
    ('Multi-direction hillshades combined by PCA into an RGB composite (GRASS r.shaded.pca)', S_, 'Terrain', 'G'),
    ('Unsupervised nested-means terrain classification (GRASS r.terrain.texture)', S_, 'Terrain', 'G'),
    ('Patch rasters with smoothing along the seam (GRASS r.patch.smooth)', S_, 'Repair', 'X'),
]
# ImPPG README https://raw.githubusercontent.com/GreatAttractor/imppg/master/README.md (section 4.3 Unsharp masking, Adaptive mode)
C += [
    ('Brightness-adaptive unsharp mask: amount ramps from min to max across a brightness threshold (ImPPG)', 'Solar & astronomical display libraries (sunkit-image, astropy, photutils)', 'Sharpen', 'S'),
]

# --- Dehancer (film emulation OFX) ------------------------------------------------------------------------------------------------
# Tool index https://www.dehancer.com/learn ; https://www.dehancer.com/learn/learn_articles/cmy-color-head ,
# https://www.dehancer.com/learn/learn_articles/film-breath-gate-weave , https://www.dehancer.com/learn/article/overscan ,
# https://www.dehancer.com/learn/article/expand , https://www.dehancer.com/learn/article/film-developer
S_ = 'Dehancer'
C += [
    ('CMY enlarger colour head: subtractive Y/M/C filtration from measured filters (Dehancer)', S_, 'Film', 'S'),
    ('Film breath: random frame-to-frame exposure, contrast and colour drift (Dehancer)', S_, 'Film', 'X'),
    ('Overscan: scanned film gate with perforations and neighbouring frames (Dehancer)', S_, 'Frames', 'S'),
    ('Film developer colour separation: reduce the most intense colours first (Dehancer)', S_, 'Film', 'S'),
]

# --- Console-emulator post-processing shaders (PPSSPP, Dolphin) -------------------------------------------------------------------
# https://raw.githubusercontent.com/hrydgard/ppsspp/master/assets/shaders/defaultshaders.ini and .../shaders/<name>.fsh ;
# Dolphin listing https://api.github.com/repos/dolphin-emu/dolphin/contents/Data/Sys/Shaders , sources
# https://raw.githubusercontent.com/dolphin-emu/dolphin/master/Data/Sys/Shaders/<name>.glsl
S_ = 'Emulator post-process shaders (PPSSPP, Dolphin)'
C += [
    ('Fake reflections: watery offset copy added toward the bottom of the frame (PPSSPP FakeReflections)', S_, 'Stylize', 'S'),
    ('Natural Vision colour shader (ShadX, PPSSPP Natural Colors)', S_, 'Color', 'S'),
    ('Primary colours: snap strong hues to pure primaries (Dolphin primarycolors)', S_, 'Color', 'S'),
    ('Firewater: diagonal-offset cross-channel differences (Dolphin firewater)', S_, 'Stylize', 'S'),
    ('Acid metal: green from max(r+b, g) on fixed red/blue (Dolphin acidmetal)', S_, 'Stylize', 'S'),
    ('Toxic channel remap (Dolphin toxic)', S_, 'Color', 'S'),
    ('Spookey channel remap (Dolphin spookey1)', S_, 'Color', 'S'),
    ('Perceptual HDR: ICtCp intensity amplification (Dolphin PerceptualHDR)', S_, 'Tone', 'S'),
]

# --- TopoToolbox (Schwanghart) GRIDobj methods ------------------------------------------------------------------------------------
# Help headers read from https://raw.githubusercontent.com/wschwanghart/topotoolbox/master/@GRIDobj/<function>.m
# (acv, excesstopography, localtopography, roughness, diffusion, elevateminima, identifyflats, prcclip)
S_ = 'TopoToolbox'
C += [
    ('Anisotropic coefficient of variation: elongated vs oval landforms (TopoToolbox acv)', S_, 'Terrain', 'S'),
    ('Excess topography above a threshold-slope surface built by grey erosion (TopoToolbox excesstopography)', S_, 'Terrain', 'G'),
    ('Linear hillslope diffusion of a DEM over a time span, implicit scheme (TopoToolbox diffusion)', S_, 'Terrain', 'G'),
    ('Elevate small regional minima to their lowest neighbour (TopoToolbox elevateminima)', S_, 'Terrain', 'G'),
    ('Local topography: elevation range within a radius (TopoToolbox localtopography)', S_, 'Terrain', 'S'),
]

# --- manual concept-duplicate drops (keyword review of every candidate against filters.db / rounds 9-19 names and
#     index.html option labels; exact-name dedupe does not catch these) -----------------------------------------------------
DROP |= {
    'Probability streaks: cell values extended into following cells (Jitter jit.streak)',      # = Streak (G'MIC)
    'Video feedback with a convolution stage (Jitter jit.wake)',                               # = Feedback Blur / recursive feedback (db)
    'Grid cell reorder, flip, freeze and monochrome fill (Jitter jit.rubix)',                  # = Shuffle Patches (db filter)
    'Random-size rectangular resampling facets (Jitter jit.tiffany)',                          # = Random Rectangle Division (Reptorian)
    'Per-scanline offset and scale from a 1-D map (Jitter jit.scanoffset)',                    # = Scanline displacement (db alias)
    'Downsample-then-interpolate resample (Jitter jit.plur)',                                  # trivial resample round trip
    'Bubble sort of matrix cells (Jitter jit.bsort)',                                          # = Pixel sorting (db)
    'Luma blur: per-pixel blur size from a second input luminance (TouchDesigner Luma Blur TOP)',  # = Variable Blur (GIMP 3)
    'Hue- and saturation-preserving levels (TouchDesigner Luma Level TOP)',                    # = Luma levels (index.html option)
    'Morphological sharpening: pick dilation or erosion closest to input (DIPlib MorphologicalSharpening)',  # = Toggle contrast mapping
    'Grey-weighted distance transform (DIPlib GreyWeightedDistanceTransform)',                 # = Geodesic Distance (gray-weighted)
    'Volume-fraction threshold (DIPlib VolumeThreshold)',                                      # = Percentile threshold (ImageJ)
    'Black filter: sliding-bar detection and fill of solid black scan areas (unpaper blackfilter)',  # = Black border removal (scans)
    'Marginal dewarping from curved top and bottom page borders (ScanTailor Featured)',        # = Page dewarping (db)
    'Zonal retinex colour restoration (Fotocx Global and Zonal Retinex)',                      # = retinex variants (round 16)
    'Remove halos (Fotocx)',                                                                   # = Halo Removal (DeHalo)
    'SIOX simple interactive object extraction (ImageJ)',                                      # = Extract Foreground [Interactive]
    'Polynomial surface fit background (ImageJ)',                                              # = Illumination: Fit Polynomial (CellProfiler)
    'Normal map from four directionally lit photos (Nukepedia photonormal)',                   # = Photometric stereo (db)
    'Soft edge detect by local standard deviation (Nukepedia SoftEdgeDetect)',                 # = Standard deviation (index.html option)
    'Broadcast-safe chrominance limit display (Nukepedia ChromaLimit)',                        # = Monitor Checks (illegal levels)
    'Threshold blur: blur neighbours whose difference is under a threshold (Nukepedia thresholdBlur)',  # = Selective Gaussian Blur
    'Matrix-style digital rain (Nukepedia MR_Matrix_Effect)',                                  # = Matrix rain overlay (db alias)
    'Lupton interconnected-band asinh RGB composite (astropy make_lupton_rgb)',                 # = Arcsinh (Lupton) option
    'Categorical mode filter for label images (bruges mode)',                                  # = Majority / Mode Filter
    'Beaudet corner detector (VIGRA cornernessBeaudet)',                                       # = Determinant of Hessian option
    'Regularized Perona-Malik diffusion, Catte et al. (Icy Non-linear Filter)',                # = Perona-Malik (db / option)
    'Wave jitter: sinusoidal row displacement glitch (XPL Glitch Wave Jitter)',                # = Glitch: Wave (Procreate)
    'Screen jump: vertical frame jump glitch (XPL Glitch Screen Jump)',                        # = Vertical roll and slide (round 19)
    'Grainy blur: noise-offset single-pass blur (XPL Grainy Blur)',                            # = Hash Blur (three.js TSL)
    'Polar sector pixelation (XPL Pixelize Sector)',                                           # = Polar Pixellate (GPUImage)
    'Binary smooth: smooth the outline of a mask (Material Maker)',                            # description too thin to define a technique
    'Adaptive colour restoration: refresh faded and normalise oversaturated colours (SilverFast ACR)',  # = Restore fading (VueScan, this round)
    'Selective colour to grey conversion (SilverFast SC2G)',                                   # = Channel Mixer B&W (db)
    'Overscan: scanned film gate with perforations and neighbouring frames (Dehancer)',        # = Film perforations border (Fred's)
    'Film developer colour separation: reduce the most intense colours first (Dehancer)',      # = chroma compression (round 19 ChromaCompress)
    'Toxic channel remap (Dolphin toxic)',                                                     # = Channel Mixer
    'Spookey channel remap (Dolphin spookey1)',                                                # = Channel Mixer
    'Perceptual HDR: ICtCp intensity amplification (Dolphin PerceptualHDR)',                   # = Inverse tone mapping (db)
    'Morphometric protection index (SAGA, = positive openness)',                               # = Sky View Factor / Openness
    'Universal image quality index map (SAGA)',                                                # = UQI (Wang-Bovik 2002)
    'Downslope distance gradient (SAGA)',                                                      # = Downslope index (WhiteboxTools, Hjerdt)
    'Elevate small regional minima to their lowest neighbour (TopoToolbox elevateminima)',     # = Depression filling (db)
    'Local topography: elevation range within a radius (TopoToolbox localtopography)',         # = Morphological gradient / local relief
}
DROP |= {   # second review of the dedupe20 near-match list
    'Natural Vision colour shader (ShadX, PPSSPP Natural Colors)',                     # = natural-vision (db alias)
    'Primary colours: snap strong hues to pure primaries (Dolphin primarycolors)',     # = Primaries (frei0r)
    'Distance-transform watershed of a membrane probability map (VIGRA wsDtSegmentation)',  # = Distance transform watershed (db)
    'Thin-plate spline warp from control points (DIPlib WarpControlPoints)',           # = ThinPlateSpline (db alias)
    'Error-function soft clipping to a range (DIPlib ErfClip)',                        # = SoftClip (Nuke)
    'Background RMS noise map from MAD-std / biweight scale (photutils)',              # = Noise Map (db filter)
}
