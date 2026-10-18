# Round 17 harvest: 188 techniques not yet in Filter Nexus

Checked by `research/dedupe17.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-16 names and the index.html option labels. 140 are buildable as GPU shaders; 20 need whole-image/sequential work, 0 need a neural net, 28 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Pixelitor filters (10)

1. Abstract Lights (Pixelitor particle light-painting) ⓖ  — Render
2. Angular Waves (Pixelitor polar-coordinate waves)  — Distort
3. Radial Waves (Pixelitor polar-coordinate waves)  — Distort
4. Radial Mosaic (Pixelitor concentric Voronoi)  — Stylize
5. Spheres (Pixelitor 3D-shaded circle fill) ⓖ  — Stylize
6. Flow Field (Pixelitor particle flow render) ⓖ  — Render
7. Circle Weave (Pixelitor curve render)  — Render
8. Flower of Life (Pixelitor)  — Render
9. L-Systems (Pixelitor curve render) ⓖ  — Render
10. Brushed Metal (JH Labs / Pixelitor)  — Materials

## HALCON operators (12)

11. Coherence-transport inpainting (HALCON inpainting_ct) ⓖ  — Repair
12. Mean-curvature-flow inpainting (HALCON inpainting_mcf) ⓖ  — Repair
13. Extremum-only smoothing (HALCON eliminate_min_max)  — Noise
14. Dual rank filter (HALCON dual_rank)  — Analysis
15. Grey-value skeleton (HALCON gray_skeleton) ⓖ  — Analysis
16. Topographic primal sketch (HALCON topographic_sketch)  — Analysis
17. Dot enhancement filter (HALCON dots_image)  — Analysis
18. Sojka corner detector (HALCON points_sojka)  — Edges
19. Lepetit keypoints (HALCON points_lepetit)  — Edges
20. Foerstner interest operator (HALCON points_foerstner)  — Edges
21. Facet-model line extraction (HALCON lines_facet)  — Edges
22. Separable median (HALCON median_separate)  — Noise

## Wolfram Language image functions (3)

23. ColorTones effect (Wolfram ImageEffect)  — Color
24. Hilbert filter (Wolfram HilbertFilter)  — Sensor
25. Differentiator filter (Wolfram DifferentiatorFilter)  — Edges

## Apple Motion filters (14)

26. Black Hole (Apple Motion)  — Distort
27. Disc Warp (Apple Motion)  — Distort
28. Fun House mirror (Apple Motion)  — Distort
29. Ring Lens (Apple Motion)  — Distort
30. Target concentric bands (Apple Motion)  — Stylize
31. Aura solarized halo (Apple Motion)  — Stylize
32. Overdrive glow (Apple Motion)  — Stylize
33. Circles elliptical facets (Apple Motion)  — Stylize
34. Random Tile circular panels (Apple Motion)  — Distort
35. Wavy Screen etched zigzag screen (Apple Motion)  — Retro
36. OpenEXR Tone Map exposure/defog/knee (Apple Motion)  — Tone
37. California look (Apple Motion)  — Insta
38. Nevada look (Apple Motion)  — Insta
39. WideTime (Apple Motion) ⓧ  — Frames

## cables.gl image ops (2)

40. Shard noise (cables.gl)  — Noise
41. Lens scratches (cables.gl)  — Film

## OBS shaderfilter examples (1)

42. Tetrahedral colour mixer (OBS tetra shader)  — Color

## LazPaint filters (8)

43. ClearType subpixel filter (LazPaint)  — Sharpen
44. Inverse ClearType (LazPaint)  — Sharpen
45. Corona blur (LazPaint / BGRABitmap)  — Blur
46. Plastik texture (LazPaint)  — Materials
47. Metal Floor texture (LazPaint)  — Materials
48. Snow Print texture (LazPaint)  — Materials
49. Round Stone texture (LazPaint)  — Materials
50. Hypocycloid render (LazPaint)  — Render

## Inkscape filter presets (58)

51. Alpha Draw Liquid (Inkscape)  — Paint
52. Cross Noise Poster (Inkscape)  — Retro
53. Liquid Drawing (Inkscape)  — Paint
54. Old Postcard (Inkscape)  — Film
55. Poster Draw (Inkscape)  — Paint
56. Poster Rough (Inkscape)  — Paint
57. Poster Color Fun (Inkscape)  — Paint
58. Light Contour specular line drawing (Inkscape)  — Edges
59. Blend Opposites (Inkscape)  — Color
60. Hue to White (Inkscape)  — Color
61. Paint Channels (Inkscape)  — Color
62. Simulate CMY (Inkscape)  — Color
63. Soft Colors edge glow (Inkscape)  — Color
64. Chalk and Sponge (Inkscape)  — Distort
65. Lapping water noise (Inkscape)  — Distort
66. Rough and Dilate (Inkscape)  — Distort
67. Posterized Light Eraser (Inkscape)  — Tone
68. Monochrome Transparency (Inkscape)  — Tone
69. Plastify (Inkscape)  — Materials
70. Tinfoil (Inkscape)  — Materials
71. Jelly Bump (Inkscape)  — Materials
72. Thick Acrylic (Inkscape)  — Paint
73. Wrinkled Varnish (Inkscape)  — Paint
74. Relief Print (Inkscape)  — Materials
75. Velvet Bumps (Inkscape)  — Materials
76. Bump Engraving (Inkscape)  — Materials
77. Plasticine (Inkscape)  — Materials
78. Bubbly Bumps (Inkscape)  — Materials
79. Contouring Discrete (Inkscape)  — Stylize
80. Contouring Table (Inkscape)  — Stylize
81. Posterized Blur (Inkscape)  — Stylize
82. Blotting Paper (Inkscape)  — Paint
83. Cracked Glass overlay (Inkscape)  — Materials
84. Jam Spread (Inkscape)  — Materials
85. Riddled (Inkscape)  — Materials
86. Rough Paper aquarelle (Inkscape)  — Paint
87. Silk Carpet (Inkscape)  — Materials
88. Wax Print (Inkscape)  — Materials
89. Melted Rainbow (Inkscape)  — Color
90. Warped Rainbow (Inkscape)  — Color
91. Ink Paint (Inkscape)  — Paint
92. Oil Slick overlay (Inkscape)  — Render
93. Garden of Delights (Inkscape)  — Render
94. Tartan (Inkscape)  — Render
95. Tiger Fur (Inkscape)  — Materials
96. Leopard Fur (Inkscape)  — Materials
97. Blue Cheese speckles (Inkscape)  — Materials
98. Carnaval splotches (Inkscape)  — Render
99. Growing Cells (Inkscape)  — Render
100. People blotches (Inkscape)  — Render
101. Scotland fog peaks (Inkscape)  — Render
102. Dots Transparency pointillist (Inkscape)  — Paint
103. Canvas Transparency (Inkscape)  — Paint
104. 3D Mother of Pearl (Inkscape)  — Materials
105. Cracked Lava (Inkscape)  — Materials
106. Iridescent Beeswax (Inkscape)  — Materials
107. Chewing Gum (Inkscape)  — Paint
108. Electronic Microscopy (Inkscape)  — Stylize

## Natron community PyPlugs (3)

109. Hue blur (Natron L_BlurHue)  — Color
110. Clean-plate hair key (Natron lp_HairKey) ⓧ  — Analysis
111. Clean-plate screen evening (Natron lp_CleanScreen) ⓧ  — Repair

## lygia shader library 2 (4)

112. Spectral colour mixing (lygia mixSpectral)  — Color
113. Windmill tile (lygia)  — Distort
114. Colour checker chart render (lygia)  — Render
115. Bracketing vector-field texture mapping (lygia / Bowles)  — Stylize

## libvips / OpenImageIO leftovers (2)

116. Eye spatial-frequency test pattern (libvips eye)  — Render
117. Push-pull hole filling (OpenImageIO fillholes_pushpull)  — Repair

## FFmpeg filters 3 (15)

118. FCC lattice palette quantisation (FFmpeg latticepal)  — Retro
119. Edge slope tracing deinterlacer (FFmpeg estdif)  — Repair
120. HDR gain map from SDR/HDR pair (FFmpeg gainmap, ISO 21496-1) ⓧ  — Tone
121. Static background key (FFmpeg backgroundkey) ⓧ  — Analysis
122. Photosensitivity flash reduction (FFmpeg) ⓧ  — Frames
123. Normalised cross-correlation map (FFmpeg xcorrelate) ⓧ  — Analysis
124. Temporal difference amplify (FFmpeg amplify) ⓧ  — Frames
125. Adaptive temporal averaging denoiser (FFmpeg atadenoise) ⓧ  — Noise
126. Graft adaptive kernel deinterlacer (FFmpeg kerndeint) ⓧ  — Repair
127. Weston 3-field deinterlacer (FFmpeg w3fdif) ⓧ  — Repair
128. YADIF deinterlacer (FFmpeg yadif) ⓧ  — Repair
129. Bob Weaver deinterlacer (FFmpeg bwdif) ⓧ  — Repair
130. Motion-compensated deinterlacer (FFmpeg mcdeint) ⓧ  — Repair
131. Midway image equalisation (FFmpeg midequalizer) ⓧ  — Tone
132. Temporal median (FFmpeg tmedian) ⓧ  — Noise

## VapourSynth plugins 2 (24)

133. ASTDR derainbow (VapourSynth) ⓧ  — Repair
134. Bifrost rainbow remover (VapourSynth) ⓧ  — Repair
135. Checkmate dot-crawl reducer (VapourSynth) ⓧ  — Repair
136. DeCross cross-colour reducer (VapourSynth) ⓧ  — Repair
137. DotKill dot-crawl & rainbow remover (VapourSynth) ⓧ  — Repair
138. DFMDerainbow (VapourSynth) ⓧ  — Repair
139. SSIQ spatial derainbow (VapourSynth)  — Repair
140. TComb temporal comb filter (VapourSynth) ⓧ  — Repair
141. Cnr2 temporal chroma noise reducer (VapourSynth) ⓧ  — Noise
142. DegrainMedian spatio-temporal limited median (VapourSynth) ⓧ  — Noise
143. RemoveDirt (VapourSynth) ⓧ  — Repair
144. ReduceFlicker (VapourSynth) ⓧ  — Frames
145. TempLinearApproximate temporal smoother (VapourSynth) ⓧ  — Noise
146. EdgeFixer border line repair (VapourSynth)  — Repair
147. LGhost ghost / ringing reduction (VapourSynth)  — Repair
148. Frfun7 fractal spatial denoiser (VapourSynth) ⓖ  — Noise
149. Oyster block-matching artefact removal (VapourSynth) ⓖ  — Repair
150. Plum sharpening / blind deconvolution (VapourSynth) ⓖ  — Sharpen
151. Vine block-matching dehalo (VapourSynth) ⓖ  — Repair
152. CAMBI contrast-aware multiscale banding index (VapourSynth) ⓖ  — Analysis
153. Dpid detail-preserving downscaler (VapourSynth) ⓖ  — Sharpen
154. DCTFilter DCT frequency suppressor (VapourSynth)  — Noise
155. Binoculars view (VapourSynth vfx)  — Distort
156. Line Magnifier (VapourSynth vfx)  — Distort

## G'MIC stdlib commands (5)

157. Minimal path on potential map (G'MIC minimal_path) ⓖ  — Analysis
158. Pseudo-grey colormap (G'MIC pseudogray)  — Tone
159. Largest axis-aligned rectangle (G'MIC laar) ⓖ  — Analysis
160. Rotate tileable (G'MIC rotate_tileable)  — Distort
161. High-contrast colormap generator (G'MIC lut_contrast) ⓖ  — Color

## Mehdi plug-ins (8)

162. Absolute Colors hue-sector restriction (Mehdi)  — Color
163. Blots seamless texture (Mehdi)  — Render
164. Color MegaMix 8-colour remap (Mehdi)  — Color
165. Contrast Balance four-opposition balance (Mehdi)  — Color
166. Fine Threshold anti-aliased threshold (Mehdi)  — Tone
167. Flat Median (Mehdi)  — Noise
168. Grain Natural (Mehdi)  — Noise
169. Sorting Tiles (Mehdi) ⓖ  — Stylize

## Redfield plug-ins (1)

170. Fractalius hidden fractal texture (Redfield) ⓖ  — Stylize

## The Plugin Site (Plugin Galaxy / Harry's Filters) (2)

171. Image encryption with 64-bit key (Plugin Galaxy Cryptology)  — Stylize
172. Video-synthesizer patterns (Plugin Galaxy Synthesizer)  — Render

## VanDerLee UnPlugged-X (9)

173. Acid Waterfall (UnPlugged-X)  — Distort
174. Contrast-Split light/dark contrast (UnPlugged-X)  — Tone
175. Ink Rubber smear copy (UnPlugged-X)  — Stylize
176. Renaissance cracked masterpiece (UnPlugged-X)  — Paint
177. Tangent Deform tile wall (UnPlugged-X)  — Distort
178. U.S. Comic interlace shading (UnPlugged-X)  — Stylize
179. Radar display (UnPlugged-X)  — Render
180. CD Shader refractive disc (UnPlugged-X)  — Render
181. Blades light fan (UnPlugged-X)  — Render

## VanDerLee SnowScape (1)

182. SnowScape settling snow (VanDerLee) ⓖ  — Render

## OpenToonz FX (6)

183. Line integral convolution flow blur (OpenToonz Iwa_FlowBlurFx)  — Blur
184. Floor Bump refracted floor through water (OpenToonz Iwa_FloorBumpFx)  — Distort
185. PN Perspective noise plane (OpenToonz Iwa_PNPerspectiveFx)  — Render
186. Soap Bubble thin-film shape (OpenToonz Iwa_SoapBubbleFx) ⓖ  — Materials
187. Corridor Gradient (OpenToonz Iwa_CorridorGradientFx)  — Render
188. Body Highlight (OpenToonz)  — Stylize
