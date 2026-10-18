# Round 19 harvest: 187 techniques not yet in Filter Nexus

Checked by `research/dedupe19.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-18 names and the index.html option labels. 136 are buildable as GPU shaders; 34 need whole-image/sequential work, 0 need a neural net, 17 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## RetroArch slang-shaders 2 (11)

1. Pixel-art vectorisation via similarity graph and energy-optimised cells (slang vectorscale) ⓖ  — Retro
2. 4xSoft soft pixel-art scaler (guest.r, slang 4xsoft)  — Retro
3. 2xSaL pixel-art scaler (guest.r, slang 2xsal)  — Retro
4. LeiFX 3dfx Voodoo 16-bit dither and reduction filter (slang 3dfx_4x1)  — Retro
5. PowerVR2 Dreamcast RGB565 frame-buffer dither (slang powervr2)  — Retro
6. NES PAL composite signal simulation (r57shell, slang pal-r57shell)  — Retro
7. Blur Busters CRT beam simulator BFI (slang crt-beam-simulator) ⓧ  — Retro
8. Adaptive strobe black-frame insertion (slang adaptive_strobe-koko) ⓧ  — Retro
9. Re-interlacing into alternating fields (slang reinterlacing) ⓧ  — Retro
10. MMJ's cel shader (slang MMJ_Cel_Shader)  — Stylize
11. Advanced Cartoon shader with black-border sensitivity (guest.r, slang advcartoon)  — Stylize

## vvvv TextureFX (4)

12. UV dilation into empty texels for position/normal maps (vvvv UVDilate)  — Materials
13. Liquish liquid-noise texture (vvvv Liquish)  — Render
14. Drippy smear blend between two images (vvvv Blood mixer) ⓧ  — Frames
15. BlurPerfector detail-preserving noise-reduction blur (vvvv)  — Blur

## Nukepedia gizmos (50)

16. Tracking-marker fill keeping surface detail (Nukepedia aeFiller) ⓖ  — Repair
17. Custom-falloff blur from a drawn curve (Nukepedia BlurCurve)  — Blur
18. Comparative grain from denoised vs original plate (Nukepedia ComparativeGrain) ⓧ  — Film
19. Stable hand-painted outline drawing (Nukepedia DL_DrawLines)  — Stylize
20. Edge scatter blending an image along a matte edge (Nukepedia EdgeScatter)  — Stylize
21. Fibonacci-radius glow stack (Nukepedia eFibonacciGlow)  — Stylize
22. Fractal blur organic gradient breakup (Nukepedia Fractal Blur)  — Blur
23. Sharpen in log colour space (Nukepedia Log_Sharpen)  — Sharpen
24. 4:2:2 chroma jaggy fix (Nukepedia HS_422Chromafix / ProRes 422 filter)  — Repair
25. Directional detail removal (Nukepedia ZipBlur)  — Blur
26. Inverse-square-law glow (Nukepedia PhysX Glow)  — Stylize
27. ARRI Alexa sensor grain simulation (Nukepedia Grain_ARRI_Alexa / AlexaGrain)  — Film
28. Distant bloom on far CG edges by depth (Nukepedia Distant Bloom)  — Depth
29. Lighting shades stylizer texturing lit areas (Nukepedia)  — Stylize
30. Four-corner gradient clean-up patch from border samples (Nukepedia Retouch Patch / jm_cleanPatchGen) ⓖ  — Repair
31. Biased saturation toward a chosen colour (Nukepedia biasedSaturation)  — Color
32. CrankIt colour boost for keying (Nukepedia)  — Color
33. Day-to-night conversion (Nukepedia Day2Night)  — Tone
34. Hue transfer swapping HSV hue with the background (Nukepedia HueTransfer) ⓧ  — Color
35. Pingle highlight detail for clipped plates (Nukepedia pingle)  — Repair
36. Smoosh colours: bleed background hue/saturation into foreground edges (Nukepedia Smoosh_Colours) ⓧ  — Color
37. Grade in CIE Yxy (Nukepedia SR_YxyGrade)  — Color
38. Voronoi gradient from arbitrary colour samples (Nukepedia Voronoi Gradient) ⓖ  — Render
39. Bokeh Builder grungy bokeh kernel shapes (Nukepedia)  — Blur
40. Gradient analyzer: strokes perpendicular to gradients (Nukepedia jm_gradientAnalyzer)  — Analysis
41. Steel wool burning sparks (Nukepedia T_SteelWool)  — Render
42. Tree gobo dappled lighting (Nukepedia Tree_Gobo)  — Render
43. 2D water simulation on a height field (Nukepedia Flow) ⓧ  — Render
44. Alpha-driven prism light split into a rainbow (Nukepedia C_Prisming)  — Stylize
45. Digital still camera exposure model (Nukepedia)  — Tone
46. Directional displace by HSV angle/intensity map (Nukepedia Directional Displace)  — Distort
47. HDRI bloom extraction (Nukepedia HDRIBloomExtract)  — Tone
48. Light-off: remove highlights and flatten sunny scenes (Nukepedia MM_LightOff)  — Tone
49. Perlin gain function contrast (Nukepedia Perlin Gain)  — Tone
50. Voronoi texture extractor: crop, tile and scatter a patch (Nukepedia VoronoiTextureExtractor)  — Materials
51. Edge mirror padding in all directions (Nukepedia EdgeMirror)  — Frames
52. Beer-Lambert underwater light attenuation (Nukepedia)  — Tone
53. Directional wrinkle removal for de-aging (Nukepedia Directional_wrinkle_remove)  — Repair
54. Paper-style stylised outlines (Nukepedia BAB_PaperOutlines)  — Stylize
55. Twitch random position/colour/blur jolts (Nukepedia VC Twitch)  — Stylize
56. Dominant-colour palette overlay (Nukepedia Color Analyzer) ⓖ  — Analysis
57. Antialiasing recovery after filtering (Nukepedia Blink) ⓖ  — Repair
58. Anamorphic lens astigmatism (Nukepedia mt Anamorphic Astigmatism)  — Blur
59. Spherical HDR panorama blur (Nukepedia EnvironmentBlur)  — Blur
60. LULU-operator edge-preserving smoothing (Nukepedia LULU Flow) ⓖ  — Blur
61. 3D LUT inversion from a CMS test-pattern image (Nukepedia LUTInvert) ⓖ  — Color
62. Gyroid noise (Nukepedia WorleyNoise modes)  — Noise
63. Luminosity / Shine blend modes, Krita style (Nukepedia BAB Merge Luminosity Shine) ⓧ  — Color
64. Cube key: select colours inside a 3D colour-space volume (Nukepedia cubeKey)  — Analysis
65. Tripod removal from 360 panoramas (Nukepedia ThreeSixty RigRemoval) ⓖ  — Repair

## Fusion Reactor atoms (14)

66. Elliptical blur with aspect and angle / squeezed zoom blur (Reactor EllipticalBlur)  — Blur
67. Gradient match: procedural gradient fitted to a reference image (Reactor GradientMatch) ⓖ  — Render
68. Soft-knee chroma compressor for over-saturated pixels (Reactor ChromaCompress)  — Color
69. Scanline intensity plot overlay (Reactor PlotScanline)  — Analysis
70. Blocky fractal noise (Reactor MT_FractalBlocks)  — Noise
71. Corona renderer highlight compression (Reactor TonemappingTools)  — Tone
72. Fine Shine: HDRI reflections on a 2D element via bump (Reactor MT_Fine_Shine)  — Materials
73. ReFill organic growth propagation from seed points (Reactor ReFill) ⓖ  — Render
74. Hum bar / ground-loop rolling interference band (Reactor MT_Glitch_HumBar / GroundLoop)  — Retro
75. Vertical roll and slide sync loss (Reactor MT_Glitch_RollAndSlide)  — Retro
76. Block pause frozen macroblocks (Reactor MT_Glitch_BlockPause) ⓧ  — Retro
77. Seam-free LatLong filtering with panoramic wrap (Reactor KartaVR BlurPanoramicWrap etc.)  — Blur
78. Atmospheric haze blend of foreground into background (Reactor Haze, after Red Giant Supercomp) ⓧ  — Depth
79. Volume haze: background light spilling over a backlit foreground (Reactor VolumeHaze) ⓧ  — Depth

## Leptonica (18)

80. Tile-adaptive contrast normalisation to full range (Leptonica pixContrastNorm) ⓖ  — Tone
81. Threshold on double-normalised background (Leptonica pixThreshOnDoubleNorm) ⓖ  — Repair
82. Clean page background to white (Leptonica pixCleanBackgroundToWhite) ⓖ  — Repair
83. Auto photo-invert of light-on-dark text regions (Leptonica pixAutoPhotoinvert) ⓖ  — Repair
84. Hue-invariant saturation/brightness linear map (Leptonica pixMapWithInvariantHue)  — Color
85. Piecewise-linear map of a source colour to a target colour (Leptonica pixLinearMapToTargetColor)  — Color
86. Saturation-boosted max-component greyscale (Leptonica pixConvertRGBToGraySatBoost, Qumsiyeh)  — Color
87. Darken low-saturation grey pixels (Leptonica pixDarkenGray)  — Color
88. Colorize grey pixels only, keeping coloured ones (Leptonica pixColorGray)  — Color
89. Two-sided edge filter, same-sign minimum difference (Leptonica pixTwoSidedEdgeFilter)  — Edges
90. Run-length transform: pixel = length of its run (Leptonica pixRunlengthTransform) ⓖ  — Analysis
91. Quadratic vertical shear bending (Leptonica pixQuadraticVShear)  — Distort
92. Random harmonic sinusoidal warp, captcha style (Leptonica pixRandomHarmonicWarp)  — Distort
93. Quadratic red-channel stereoscopic bend (Leptonica pixWarpStereoscopic)  — Depth
94. Linear / quadratic horizontal stretch toward one edge (Leptonica pixStretchHorizontal)  — Distort
95. Cascaded 2x rank reductions (Leptonica pixScaleGrayRankCascade)  — Analysis
96. Fill holes up to the bounding rectangle (Leptonica pixFillHolesToBoundingRect) ⓖ  — Analysis
97. Binarize, edge-clean and crop a page image (Leptonica pixCropImage) ⓖ  — Repair

## Seti Astro Suite Pro (7)

98. Star Stretch fixed-shape star-safe non-linear stretch (Seti Astro)  — Tone
99. Narrowband palette picker: 18 Ha/OIII/SII palette mappings (Seti Astro Perfect Palette Picker) ⓧ  — Color
100. Narrowband normalisation of Ha/OIII/SII (Blanshan-Cranfield, Seti Astro) ⓧ  — Color
101. Continuum subtraction of broadband from narrowband (Seti Astro) ⓧ  — Analysis
102. Remove pedestal per channel: minimum / low percentile / first non-zero (Seti Astro) ⓖ  — Tone
103. Galaxy isophote model and residual (Seti Astro GLIMR, Jedrzejewski 1987) ⓖ  — Analysis
104. Multiscale multiplicative-gradient correction of dust motes and reflections (Seti Astro ABE) ⓖ  — Repair

## ArcGIS Pro raster functions (5)

105. Aspect-Slope bivariate colour map (ArcGIS Aspect-Slope)  — Terrain
106. Nibble: replace masked cells with nearest unmasked value (ArcGIS Nibble) ⓖ  — Repair
107. Region pixel count: label each connected region with its size (ArcGIS Region Pixel Count) ⓖ  — Analysis
108. Expand / shrink selected zones by N cells (ArcGIS Expand, Shrink)  — Analysis
109. Spectral conversion matrix: false-colour to pseudo natural colour (ArcGIS Spectral Conversion)  — Color

## Filter Forge library 6 (snippets) (3)

110. Edge detector from an ambient-occlusion map (Filter Forge snippet)  — Edges
111. Worley-noise distortion (Filter Forge snippet)  — Distort
112. Variable pixelation by a control map (Filter Forge snippet)  — Stylize

## GIMP Plugin Registry (10)

113. Movie 300 colour look (GIMP registry elsamuko-movie-300)  — Color
114. Rainy landscape after-rain effect (GIMP registry elsamuko-rainy-landscape)  — Tone
115. FlipCells: flip each grid cell (GIMP registry flipcells)  — Distort
116. Remove camera date timestamp (GIMP registry remove_timestamp) ⓖ  — Repair
117. Shadow Glow: replace shadows with glowing areas (GIMP registry sf-will-glow)  — Stylize
118. Manny Librodo sharpening (GIMP registry sharpen-librodo)  — Sharpen
119. Reveal yellow printer tracking dots (GIMP registry showyellowtrackingdots)  — Analysis
120. Split sharpening into separate lighten and darken passes (GIMP registry split-sharpening)  — Sharpen
121. Divide scanned images: isolate several photos from one scan (GIMP registry DivideScannedImages) ⓖ  — Repair
122. Offset every other row/column of tiles, brick style (GIMP registry Offset by froGgy)  — Distort

## utility-dctls (DaVinci Resolve DCTL) (18)

123. Daniele Siragusano tone curve (utility-dctls Daniele Curve)  — Tone
124. Spectral dye-density simulator from CMY bell curves (utility-dctls Dye Simulator)  — Film
125. Lens field-curvature edge defocus (utility-dctls Field Curvature)  — Blur
126. Film characteristic curve: log exposure to density to transmittance (utility-dctls Film Curve)  — Film
127. Fixed signal-to-noise-ratio noise (utility-dctls Fixed SNR Noise)  — Noise
128. Linear edge blur growing toward frame edges (utility-dctls)  — Blur
129. Protected tone mapping: identity below a threshold, roll-off above (utility-dctls)  — Tone
130. Arri timing-shift asymmetric streaks (utility-dctls Timeshift Streaks)  — Film
131. Linear contrast: per-channel power pivoting on 0.18 grey (utility-dctls Linear Contrast)  — Tone
132. True bit-depth estimator map (utility-dctls Bit Depth Estimator) ⓖ  — Analysis
133. Spherical / cylindrical RGB colour model conversion (utility-dctls)  — Color
134. Exposure strips at one-stop increments (utility-dctls Exposure Strips)  — Analysis
135. Line scope: waveform of pixels sampled along a drawn line (utility-dctls Line Scopes) ⓖ  — Analysis
136. Softmax colour with temperature (utility-dctls Softmax)  — Color
137. Root-polynomial degree-2 colour correction matrix (utility-dctls)  — Color
138. Small-screen size simulator (utility-dctls Screen Size Simulator)  — Analysis
139. Local SNR map (utility-dctls SNR Checker)  — Analysis
140. Polynomial / sigmoid channel-product kernel colour mix (utility-dctls Polynomial Kernel)  — Color

## Colour-science DCTL / Nuke toolsets (Jed Smith, Paul Dore) (18)

141. Hue contrast: compress or expand hues toward primary vectors (Jed Smith HueContrast)  — Color
142. Midtone contrast with linear toe and shoulder (Jed Smith MidtoneContrast)  — Tone
143. Helmholtz-Kohlrausch compensation, Nayatani 1997 (Jed Smith Nayatani_HK)  — Color
144. Purity: weighted-sum chroma purity control (Jed Smith Purity)  — Color
145. JzDT display transform: JzAzBz chroma compression + Michaelis-Menten tonescale (Jed Smith)  — Tone
146. Tesseract view transform (Jed Smith)  — Tone
147. Chromagnon view transform (Jed Smith)  — Tone
148. Hill-Langmuir tonemap (Jed Smith nuke-colortools Tonemap_HillLangmuir)  — Tone
149. PowerP sigmoid tonemap (Jed Smith nuke-colortools Tonemap_PowerP_Sigmoid)  — Tone
150. darktable UCS 22 colour space (nuke-colortools Colorspace_DarktableUCS)  — Color
151. IgPgTg colour space (nuke-colortools ColorSpace_IgPgTg)  — Color
152. Improved HLS colour space (nuke-colortools ColorSpace_ImprovedHLS)  — Color
153. RLAB colour space (nuke-colortools ColorSpace_RLab)  — Color
154. FilmLight T-Lab colour space (nuke-colortools Colorspace_Filmlight_tLab)  — Color
155. ACES RRT sweeteners: glow module, red modifier, global desaturation (nuke-colortools)  — Color
156. ARRI film matrix add / remove on LogC AWG (baldavenger Film_Matrix_Add)  — Film
157. Hue median filter (baldavenger HueMedian)  — Repair
158. Median filter on Lab a/b channels only (baldavenger Median_LAB)  — Repair

## DaVinci Resolve DCTL collections (6)

159. Per-channel saturation with upper/lower luma thresholds (xtremestuff Channel-Saturation DCTL)  — Color
160. Ratio shaper: key/fill exposure lighting-ratio control (Moaz Elgabry Ratio Shaper DCTL)  — Tone
161. Oklab saturation matte (Moaz Elgabry Sat_Matte DCTL)  — Analysis
162. Film saturation emulation in log (Tims-Film-Saturation-Emulation DCTL)  — Color
163. Per-channel flare black-lift compensation (Demystify Color DMC_Primal DCTL)  — Tone
164. Conical-coordinate saturation (Juan Pablo Zambrano JP-ConicalCoordinate DCTL)  — Color

## purzOS OFX (10)

165. Luma ring: band-limited luma with detail-knob ringing halos (purzOS Luma Ring)  — Retro
166. Rainbow phase: subcarrier hue drift and cross-colour rainbows (purzOS Rainbow Phase)  — Retro
167. Tape wow and scanline flutter with head-switch skew (purzOS Tape Wow)  — Retro
168. Sync drift: h-hold diagonal shear, top flagging, vertical roll (purzOS Sync Drift)  — Retro
169. Phosphor melt: bright pixels burn in and drip colour trails (purzOS Phosphor Melt)  — Retro
170. Line stutter: horizontal bands repeat, hold and shear (purzOS Line Stutter)  — Retro
171. VHS head-switching torn band at frame bottom (purzOS Head Switch)  — Retro
172. VHS tracking-noise bar drifting vertically (purzOS Tracking Bar)  — Retro
173. VHS colour-under chroma speckle pooling in shadows (purzOS Color Under)  — Retro
174. Tape dropout dashes riding the scanlines (purzOS Dropout / Bad Signal)  — Retro

## 3D Common Corruptions (2)

175. Depth-aware camera flash illumination falloff (3DCC Flash) ⓖ  — Depth
176. Depth-parallax 3D camera motion blur (3DCC motion_blur_3d) ⓖ  — Depth

## SC Post Effects (Unity) (2)

177. Cloud shadows: scrolling cloud-shadow texture over the scene (SC Post Effects)  — Render
178. Double vision: offset doubled image blur (SC Post Effects)  — Blur

## Siril community scripts (9)

179. Nox: plate-theory elastic-membrane gradient reduction (VeraLux Nox) ⓖ  — Repair
180. StarComposer star reconstruction onto a starless image (VeraLux StarComposer) ⓧ  — Tone
181. Aster star glow for stars-only layers (Siril script)  — Stylize
182. DBXtract: SII / Ha / OIII extraction from dual-band OSC data (Siril script) ⓖ  — Color
183. Fix misshapen (elongated) stars (Siril DSA script) ⓖ  — Repair
184. HubbleMatic faux Hubble palette from one-shot-colour data (Siril DSA script)  — Color
185. Satellite trail removal (Siril script) ⓖ  — Repair
186. Background gradient heat-map from tiled sigma-clipped medians (Svenesis Gradient Analyzer) ⓖ  — Analysis
187. Inverse-variance maximum-likelihood HDR blend of exposures (Siril HDR_Blender) ⓧ  — Tone
