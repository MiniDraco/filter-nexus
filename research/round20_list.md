# Round 20 harvest: 151 techniques not yet in Filter Nexus

Checked by `research/dedupe20.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-19 names and the index.html option labels. 69 are buildable as GPU shaders; 71 need whole-image/sequential work, 0 need a neural net, 11 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Max/Jitter objects (9)

1. Tinted self-thumbnail grid: each cell a scaled copy of the frame tinted to rebuild an image (Jitter jit.eclipse)  — Stylize
2. Luminance-band neon fade toward a colour, brighter values to black (Jitter jit.fluoride)  — Stylize
3. Image halftone: grid cells replaced by regions of a second image chosen by cell mean (Jitter jit.roy) ⓧ  — Stylize
4. Spatial envelope follower: attack/decay smear along rows or columns (Jitter jit.scanslide) ⓖ  — Blur
5. Scanline rewrapping into a different row width (Jitter jit.scanwrap)  — Retro
6. Colour screen overlay revealing the image through threshold gaps (Jitter jit.altern)  — Stylize
7. Four-point average at a set distance (Jitter jit.avg4)  — Blur
8. Cross-hatch grid: each cell shows its corner colour along the central axes (Jitter jit.hatch)  — Stylize
9. Per-pixel crossfade rate from a map, temporal (Jitter jit.shade) ⓧ  — Frames

## TouchDesigner TOPs (1)

10. Pre-filtered specular environment map via spherical harmonics (TouchDesigner PreFilter Map TOP) ⓖ  — Materials

## DIPlib (17)

11. Adaptive banana filter: Gaussian kernel bent to local orientation and curvature (DIPlib AdaptiveBanana)  — Blur
12. Selection filter: take the value where a control image is min/max in the window (DIPlib SelectionFilter)  — Blur
13. Morphological gist: average of complementary operators minus the image, texture/object scale (DIPlib MorphologicalGist)  — Edges
14. Morphological threshold smoothing: average of complementary operators (DIPlib MorphologicalThreshold)  — Blur
15. Lee morphological edge detector: minimum of complementary operators (DIPlib Lee)  — Edges
16. Multi-scale morphological gradient averaged over SE sizes (DIPlib MultiScaleMorphologicalGradient)  — Edges
17. Rank-min closing, noise-robust closing (Soille, DIPlib RankMinClosing)  — Repair
18. Limited-reach morphological reconstruction (DIPlib LimitedMorphologicalReconstruction) ⓖ  — Analysis
19. Normalized convolution for missing / uncertain data (Knutsson-Westin, DIPlib NormalizedConvolution)  — Repair
20. Minimum-variance spatial k-d partitioning (DIPlib MinimumVariancePartitioning) ⓖ  — Analysis
21. Per-object ellipsoid-fit threshold (DIPlib PerObjectEllipsoidFit) ⓖ  — Analysis
22. Stochastic watershed (Angulo-Jeulin, DIPlib StochasticWatershed) ⓖ  — Analysis
23. Unimodal background-symmetry threshold (DIPlib BackgroundThreshold) ⓖ  — Analysis
24. Mix stains: compose a brightfield colour image from stain densities (DIPlib MixStains)  — Color
25. Laplace plus / minus second derivative in the gradient direction (DIPlib LaplacePlusDgg / LaplaceMinusDgg)  — Edges
26. Robust anisotropic diffusion with Tukey error norm (Black-Sapiro, DIPlib RobustAnisotropicDiffusion)  — Blur
27. Orientation space: stack of orientation-selective filter responses (DIPlib OrientationSpace) ⓖ  — Analysis

## unpaper / ScanTailor (scanned pages) (4)

28. Gray filter: clear sliding windows that hold only grey and no black pixels (unpaper grayfilter) ⓖ  — Repair
29. Blur filter: clear sparse lonely pixel clusters in mostly empty windows (unpaper blurfilter) ⓖ  — Repair
30. Split mixed scan into B&W text foreground and original picture background layers (ScanTailor Advanced splitting output) ⓖ  — Repair
31. Colour segmenter: colourize the B&W text mask from the original colours, then posterize (ScanTailor Advanced) ⓖ  — Repair

## Fotocx (2)

32. Unwarp close-up portrait: fix balloon-face perspective distortion (Fotocx unwarp closeup)  — Distort
33. Unbend: straighten bowed wide-angle photos and panoramas (Fotocx Unbend)  — Distort

## ImageJ classic plugins (6)

34. Confocal scan-line X-shift correction for bidirectional scans (ImageJ X_Shifter / Correct X Shift) ⓖ  — Repair
35. Plane brightness adjustment through a confocal depth stack (ImageJ, CLSM) ⓧ  — Tone
36. RATS robust automatic threshold selection, gradient-weighted quadtree (ImageJ) ⓖ  — Analysis
37. Iterative radial voting for structural saliency (Parvin, ImageJ) ⓖ  — Analysis
38. Single-distance X-ray phase retrieval, Paganin (ImageJ ANKAphase) ⓖ  — Repair
39. Azimuthal average: rotationally averaged image about a centre (ImageJ) ⓖ  — Analysis

## Nukepedia plug-ins and toolsets (10)

40. Per-pixel gamma from a control image (Nukepedia IGamma)  — Tone
41. Per-pixel rank filter with rank and size driven by control images (Nukepedia IRank)  — Blur
42. Gamma and gain preserving perceived saturation (Nukepedia GammaGain)  — Tone
43. Sorted merge: per-pixel sort across inputs, output a chosen rank (Nukepedia SortedMerge) ⓧ  — Frames
44. LatLong environment reflection over a normal pass (Nukepedia EnvReflection) ⓧ  — Materials
45. Edge flares from light just outside the frame (Nukepedia ct_EdgeFlare)  — Stylize
46. Perceptual L*a*b* colour-temperature keyer (Nukepedia TemperatureKeyer)  — Analysis
47. Merge foreground over background in log space (Nukepedia Log Merge) ⓧ  — Color
48. Regrain only the areas changed from the denoised scan (Nukepedia Regrain Changed Only) ⓧ  — Film
49. Melting snow on the camera lens (Nukepedia screen_snow)  — Render

## Solar & astronomical display libraries (sunkit-image, astropy, photutils) (17)

50. Multi-scale Gaussian normalization, arctan-combined local normalisations (Morgan-Druckmueller, sunkit-image mgn)  — Tone
51. Wavelets Optimized Whitening: equalise wavelet power at all scales and locations (Auchere, sunkit-image wow) ⓖ  — Sharpen
52. Normalizing radial graded filter for the corona (NRGF, sunkit-image) ⓖ  — Tone
53. Fourier normalizing radial graded filter (FNRGF, sunkit-image) ⓖ  — Tone
54. Radial histogram equalizing filter (RHEF, sunkit-image) ⓖ  — Tone
55. Radial intensity enhancement above a given radius (sunkit-image intensity_enhance) ⓖ  — Tone
56. OCCULT-2 oriented curved loop tracing (Aschwanden, sunkit-image occult2) ⓖ  — Analysis
57. STARA sunspot detection by morphological operations (sunkit-image stara) ⓖ  — Analysis
58. Photosphere granule segmentation into tri-value maps (sunkit-image granule.segment) ⓖ  — Analysis
59. Upsilon double-sided gamma stretch (sunkit-image apply_upsilon)  — Tone
60. ZScale display interval, IRAF zscale (astropy ZScaleInterval) ⓖ  — Tone
61. Power-distribution stretch (a^x - 1)/(a - 1) (astropy PowerDistStretch)  — Tone
62. Sinh stretch (astropy SinhStretch)  — Tone
63. Contrast/bias stretch, DS9 style (astropy ContrastBiasStretch)  — Tone
64. Mesh background map with the SourceExtractor mode estimator (photutils Background2D / SExtractorBackground) ⓖ  — Repair
65. DAOPHOT MMM sky background map (photutils MMMBackground) ⓖ  — Repair
66. Brightness-adaptive unsharp mask: amount ramps from min to max across a brightness threshold (ImPPG)  — Sharpen

## Seismic attributes (bruges) (8)

67. Trace envelope / instantaneous amplitude down each column via Hilbert transform (bruges) ⓖ  — Analysis
68. Instantaneous phase down each column (bruges) ⓖ  — Analysis
69. Instantaneous frequency down each column (bruges) ⓖ  — Analysis
70. Dip steering: dip field from maximum cross-correlation of adjacent columns (bruges dipsteer) ⓖ  — Analysis
71. Eigenstructure coherence discontinuity (Gersztenkorn-Marfurt 1999, bruges)  — Edges
72. Semblance coherence with structural dip (Marfurt 1999, bruges)  — Edges
73. Spectral decomposition: three STFT frequency bands blended as RGB (bruges) ⓖ  — Analysis
74. Constant phase rotation of columns via the quadrature trace (bruges rotate_phase) ⓖ  — Distort

## VIGRA (7)

75. Boundary tensor: joint edge and junction energy from Riesz-transformed LoG (Koethe, VIGRA boundaryTensor2D)  — Edges
76. Hourglass filter: anisotropic smoothing of the structure tensor (Koethe, VIGRA hourGlassFilter2D)  — Analysis
77. Eccentricity transform of labelled regions (VIGRA eccentricityTransform) ⓖ  — Analysis
78. Fast radial symmetry transform, Loy-Zelinsky (VIGRA radialSymmetryTransform2D)  — Analysis
79. Rohr corner detector (VIGRA cornernessRohr)  — Edges
80. Noise normalization from an estimated non-parametric / quadratic noise model (VIGRA noise) ⓖ  — Repair
81. Crack-edge image: region boundaries drawn between pixels at double resolution (VIGRA regionImageToCrackEdgeImage) ⓖ  — Analysis

## Octave image package / JuliaImages (8)

82. Lindeberg differential-geometric single-scale edge detector (Octave edge "Lindeberg")  — Edges
83. Andy Adler's hysteresis Sobel edge algorithm (Octave edge "Andy") ⓖ  — Edges
84. Polysegment polynomial-segmentation binarization (JuliaImages ImageBinarization Polysegment) ⓖ  — Analysis
85. Ando consistent-gradient kernels ando3 / ando4 / ando5 (JuliaImages ImageFiltering)  — Edges
86. Bickley isotropic gradient kernel (JuliaImages ImageFiltering)  — Edges
87. Fast-scanning region segmentation (JuliaImages ImageSegmentation fast_scanning) ⓖ  — Analysis
88. Unseeded region growing segmentation (JuliaImages ImageSegmentation) ⓖ  — Analysis
89. Colour angle map against a reference colour (Octave colorangle)  — Analysis

## Icy plug-ins (5)

90. Compressed-sensing denoising: fuse TV reconstructions of Fourier sub-samplings (Meiniel, Icy CS based denoising) ⓖ  — Repair
91. Potts-model piecewise-constant segmentation (Icy Potts Segmentation) ⓖ  — Analysis
92. Middlebury colour coding of a 2-D flow field (Icy Middlebury Color Coder)  — Analysis
93. Membrane filter: tensor anisotropic PDE for co-dimension-2 planar structures (Icy Membrane Filter) ⓖ  — Repair
94. Wavelet reconstruction up to a scale without the residual (Icy UDWT Wavelet Residual Remover)  — Sharpen

## X-PostProcessing-Library (Unity) (3)

95. Leaf-shaped cell pixelation (XPL Pixelize Leaf)  — Stylize
96. Aurora vignette: animated aurora-coloured edge glow (XPL Aurora Vignette)  — Stylize
97. Tile jitter: per-tile random horizontal offsets (XPL Glitch Tile Jitter)  — Retro

## Material Maker nodes (5)

98. Warp dilation: dilate along heightmap slope paths keeping the attenuated maximum (Material Maker)  — Materials
99. Fill to orientation: grey level per filled island from its orientation (Material Maker) ⓖ  — Materials
100. Multi warp: iterative warp re-sampling the control derivative each step (Material Maker)  — Distort
101. Tones step: emphasise light and dark tones around a chosen value (Material Maker)  — Tone
102. Slope: expand slopes downhill from the highest areas (Material Maker)  — Materials

## Negative Lab Pro (5)

103. Fuji Frontier lab-scanner colour rendition (Negative Lab Pro colour model)  — Film
104. Noritsu lab-scanner colour rendition (Negative Lab Pro colour model)  — Film
105. Pakon F135 scanner look (Negative Lab Pro LUT)  — Film
106. Fuji Crystal Archive paper print look (Negative Lab Pro Crystal LUT)  — Film
107. Pre-saturation of the negative before inversion (Negative Lab Pro)  — Film

## Scanner software (VueScan) (8)

108. Restore fading: correct faded slide (red) and negative (cyan) dye shifts (VueScan) ⓖ  — Repair
109. Restore colours toward memory colours (VueScan Restore colors) ⓖ  — Color
110. Night colour balance from the darkest 10% of the image (VueScan) ⓖ  — Color
111. Landscape colour balance: neutral greys plus lifelike sky blue and foliage green (VueScan) ⓖ  — Color
112. Portrait colour balance: neutral greys plus lifelike skin tones (VueScan) ⓖ  — Color
113. Hole-punch removal on document scans (VueScan) ⓖ  — Repair
114. Infrared-channel dust and scratch cleaning (VueScan Infrared clean) ⓧ  — Repair
115. Kodachrome scan blue-cast removal (SilverFast Kodachrome)  — Film

## SAGA GIS tools 2 (28)

116. Colour triangle composite: three bands mapped to user-chosen colours (SAGA) ⓧ  — Color
117. Focal PCA: principal components of centre-minus-neighbour differences (SAGA, Thomas-Herzfeld 2004) ⓖ  — Analysis
118. Diurnal anisotropic heat index from slope and aspect (SAGA, Boehner-Antonic 2009)  — Terrain
119. Melton ruggedness number (SAGA) ⓖ  — Terrain
120. Mass balance index (SAGA) ⓖ  — Terrain
121. Valley depth below an interpolated ridge level (SAGA) ⓖ  — Terrain
122. Multiresolution valley-bottom / ridge-top flatness MRVBF / MRRTF (SAGA) ⓖ  — Terrain
123. Terrain surface convexity, Iwahashi-Pike 2007 (SAGA)  — Terrain
124. Terrain surface texture, Iwahashi-Pike 2007 (SAGA)  — Terrain
125. Iwahashi-Pike terrain surface classification (SAGA) ⓖ  — Terrain
126. Wind effect windward / leeward index (SAGA) ⓖ  — Terrain
127. Wind exposition index averaged over all directions (SAGA) ⓖ  — Terrain
128. Wind shelter index, Plattner 2004 (SAGA)  — Terrain
129. Terrain classification index for lowlands TCI Low (SAGA) ⓖ  — Terrain
130. Radius of variance: radius at which local variance exceeds a criterion (SAGA) ⓖ  — Analysis
131. Multi-band spectral variation: mean feature-space distance to the neighbourhood centroid (SAGA)  — Analysis
132. Resampling filter: area-weighted upscale then spline downscale low/high pass (SAGA)  — Blur
133. Iterative truncation of highest values to a target average (SAGA) ⓖ  — Tone
134. Relative heights and slope positions (SAGA) ⓖ  — Terrain
135. Effective air flow heights (SAGA) ⓖ  — Terrain
136. Directional statistics along a direction for each cell (SAGA) ⓖ  — Analysis
137. Fuzzy landform element classification from slope and curvatures (SAGA, Schmidt felementf)  — Terrain
138. Surface-specific points classification (SAGA)  — Terrain
139. Flat detection: connected areas of identical value (SAGA) ⓖ  — Analysis
140. Feature-preserving denoising of topographic data (GRASS r.denoise) ⓖ  — Terrain
141. Multi-direction hillshades combined by PCA into an RGB composite (GRASS r.shaded.pca) ⓖ  — Terrain
142. Unsupervised nested-means terrain classification (GRASS r.terrain.texture) ⓖ  — Terrain
143. Patch rasters with smoothing along the seam (GRASS r.patch.smooth) ⓧ  — Repair

## Dehancer (2)

144. CMY enlarger colour head: subtractive Y/M/C filtration from measured filters (Dehancer)  — Film
145. Film breath: random frame-to-frame exposure, contrast and colour drift (Dehancer) ⓧ  — Film

## Emulator post-process shaders (PPSSPP, Dolphin) (3)

146. Fake reflections: watery offset copy added toward the bottom of the frame (PPSSPP FakeReflections)  — Stylize
147. Firewater: diagonal-offset cross-channel differences (Dolphin firewater)  — Stylize
148. Acid metal: green from max(r+b, g) on fixed red/blue (Dolphin acidmetal)  — Stylize

## TopoToolbox (3)

149. Anisotropic coefficient of variation: elongated vs oval landforms (TopoToolbox acv)  — Terrain
150. Excess topography above a threshold-slope surface built by grey erosion (TopoToolbox excesstopography) ⓖ  — Terrain
151. Linear hillslope diffusion of a DEM over a time span, implicit scheme (TopoToolbox diffusion) ⓖ  — Terrain
