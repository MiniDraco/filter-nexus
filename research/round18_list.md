# Round 18 harvest: 400 techniques not yet in Filter Nexus

Checked by `research/dedupe18.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-17 names and the index.html option labels. 266 are buildable as GPU shaders; 81 need whole-image/sequential work, 1 need a neural net, 52 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Logik Matchbook (Flame Matchbox shaders) (49)

1. Advect along a guide map (Matchbox Ls_Advect)  — Distort
2. Airglow exponential-falloff glow (Matchbox Ls_Airglow)  — Stylize
3. Relax colours toward a haze colour (Matchbox Ls_Relax)  — Color
4. Random grade generator (Matchbox Ls_RndmGrade)  — Color
5. Shadowplate direct-sun removal (Matchbox Ls_Shadowplate)  — Repair
6. Spline blur along shape contours (Matchbox Ls_Splineblur)  — Blur
7. Colour chips with colour names (Matchbox Ls_Chips) ⓖ  — Analysis
8. Skin-tone-line hue overlay (Matchbox ak_skinoverlay)  — Analysis
9. Five-band texture control sharpen/soften (Matchbox ak_texturecontrol)  — Sharpen
10. Camera flashes (Matchbox crok_cameraflash)  — Render
11. Exponential-falloff blur (Matchbox crok_expon_blur)  — Blur
12. Uncomp undo a blend over a clean plate (Matchbox crok_uncomp) ⓧ  — Repair
13. Trigrade three colour-vector grade (Matchbox nob_trigrade)  — Color
14. Reverse grade black/white point match (Matchbox AFX_ReverseGrade)  — Tone
15. Linear extrapolation past 0..1 blend (Matchbox y_linex)  — Tone
16. Six-band luminance colour corrector (Matchbox AA_Multiband_ColorCorrect)  — Color
17. Focal-length perspective reframe (Matchbox nob_reframe)  — Distort
18. Fake LIDAR point-cloud look (Matchbox JB_lidar)  — Render
19. Shadow density lift-desaturate (Matchbox BB_ShadowDensity)  — Tone
20. Hex-tiling repetition-free texture (Matchbox crok_tile)  — Materials
21. Fireflies generator (Matchbox MM_Fireflies)  — Render
22. Social-media safe-zone guides (Matchbox BB_SocialSafeZones)  — Frames
23. Vanishing-point line fan overlay (Matchbox BB_PerspectiveLines)  — Render
24. Sci-fi HUD overlay (Matchbox BB_FutureHUD / BB_RetroHUD)  — Render
25. Oculus Rift side-by-side barrel warp (Matchbox crok_rift)  — Distort
26. Molten metal gradient (Matchbox L_Molten)  — Materials
27. Ancient symbols generator (Matchbox crok_ancient_symbols)  — Render
28. Skin texture transfer (Matchbox crok_reskin) ⓧ  — Repair
29. Fireball generator (Matchbox CPGP_Fireball)  — Render
30. Menger sponge flythrough (Matchbox crok_menger_system)  — Render
31. Mandelbox fractal (Matchbox crok_mandelbox)  — Render
32. Mandelbulb fractal (Matchbox crok_mandelbulb)  — Render
33. Wave lines pattern (Matchbox crok_wave_lines)  — Render
34. Block noise texture (Matchbox crok_block_noise)  — Noise
35. Twinkle pulsating stars (Matchbox crok_twinkle)  — Render
36. Kleinian fractal particles (Matchbox CPGP_ParticuleFractale)  — Render
37. Fireworks generator (Matchbox crok_fireworks)  — Render
38. Volumetric explosion (Matchbox crok_explosion_CFX)  — Render
39. Flocking swarm position map (Matchbox Ls_Flock) ⓖ  — Render
40. Sky timelapse generator (Matchbox JB_skyLapse)  — Render
41. Phone camera mockup matte (Matchbox MM_PhoneMatte)  — Frames
42. Amiga-style parallax texture scroller (Matchbox crok_parallax)  — Retro
43. Hypnotic spiral (Matchbox crok_client)  — Render
44. Beer foam structure (Matchbox crok_beer)  — Render
45. Ice structures (Matchbox crok_ice)  — Render
46. Ocean noise pattern (Matchbox crok_ocean_noise)  — Noise
47. fr-025 the.popular.demo tribute (Matchbox the_popular_demo)  — Render
48. Folding reflection-map texture (Matchbox crok_folding)  — Render
49. Colour-proximity dilate/erode (Matchbox Ls_Dilate)  — Analysis

## Paint.NET Plugin Index (48)

50. Bizarro-Negation flipped self-negation (Paint.NET)  — Stylize
51. Callicolour four-point ribbons (Paint.NET)  — Render
52. Chart White Balance from colour-chart patches (Paint.NET) ⓖ  — Color
53. Cluster Clear ink-blot removal (Paint.NET) ⓖ  — Repair
54. Colour inpainting from sparse colour hints (Paint.NET Color inpainting) ⓖ  — Repair
55. Color Vector Rotations quaternion recolour (Paint.NET) ⓧ  — Color
56. Minecraft map colour palette (Paint.NET)  — Retro
57. Cuboids tower-block perspective pixelation (Paint.NET)  — Stylize
58. Dragan Effect portrait look (Paint.NET)  — Tone
59. Dryad organic branching patterns (Paint.NET) ⓖ  — Render
60. Equirectangular diffuse irradiance transform (Paint.NET) ⓖ  — Render
61. Eyeshine animal eye-glow removal (Paint.NET)  — Repair
62. Fibonacci Fill spiral squares (Paint.NET)  — Render
63. Flame Convolution iterated random blur (Paint.NET) ⓖ  — Stylize
64. Flourish calligraphic tendrils (Paint.NET) ⓖ  — Render
65. Earths and Greys tonal palette recolour (Paint.NET Red ochre)  — Color
66. Bit-Plane Shuffler (Paint.NET)  — Color
67. Gradient Blocks pixelate (Paint.NET)  — Stylize
68. Green Tint Reduction without magenta (Paint.NET)  — Color
69. HSV Scrambler cross-channel derive (Paint.NET)  — Color
70. Invert Luminance keeping hue (Paint.NET)  — Color
71. Lattice duotone embroidery pattern (Paint.NET Ed Harvey)  — Stylize
72. Polar Singularity acorn mirror (Paint.NET)  — Distort
73. Posterize in HSV space (Paint.NET)  — Color
74. Relief Map Generator islands and continents (Paint.NET) ⓖ  — Terrain
75. Koch Snowflake fractal (Paint.NET)  — Render
76. Graph Paper square/isometric (Paint.NET)  — Render
77. Isometric Tiler orthogonal-to-isometric (Paint.NET)  — Distort
78. Rosaces rose curves (Paint.NET)  — Render
79. RotSprite pixel-art rotation (Paint.NET) ⓖ  — Retro
80. Scintillate tilted alternating inversion (Paint.NET)  — Stylize
81. Splinter rays per pixel (Paint.NET Ed Harvey)  — Blur
82. Color Wave ripples from colour borders (Paint.NET TR's) ⓖ  — Stylize
83. iPollock drip-painting generator (Paint.NET TR's) ⓖ  — Paint
84. Radial Extruder cake slices (Paint.NET TR's)  — Distort
85. Strange Attractors (Paint.NET TR's) ⓖ  — Render
86. Strobe Motion stop-motion repeats (Paint.NET TR's)  — Stylize
87. Vibration blur-then-band oil-on-water (Paint.NET)  — Stylize
88. YinYang21 document binarization (Paint.NET) ⓖ  — Analysis
89. Texture Object Rounder height map of revolution (Paint.NET) ⓖ  — Materials
90. Tattersall check pattern (Paint.NET)  — Render
91. SlinkyPlus ellipses along a curve (Paint.NET)  — Render
92. Turbulent Circles smoke rings (Paint.NET Turbulent.Effects)  — Render
93. Overliner colour-break outlines (Paint.NET)  — Edges
94. Selective Enhancement spread/push colours near a target (Paint.NET)  — Color
95. Volutes random curves (Paint.NET)  — Render
96. Varicose wibbly lines (Paint.NET)  — Render
97. Helix helical/spiral shapes (Paint.NET)  — Render

## Filter Forge library 2 (25)

98. Bilevel Screening (Filter Forge)  — Retro
99. Chuck Close grid-cell portrait (Filter Forge Chuck Close V2)  — Stylize
100. Cloisonne d'Art Nouveau (Filter Forge)  — Stylize
101. Decoupage (Filter Forge)  — Paint
102. Hockney-style joiner collage (Filter Forge) ⓖ  — Stylize
103. Gosper Island tiling (Filter Forge)  — Render
104. Hexaflake fractal (Filter Forge)  — Render
105. Lace tablecloth pattern (Filter Forge)  — Render
106. Navajo Weaver (Filter Forge)  — Stylize
107. Persian Rug pattern (Filter Forge)  — Render
108. Pocket Etch-A-Sketch (Filter Forge)  — Stylize
109. Shoji Screen (Filter Forge)  — Frames
110. SX-70 Polaroid emulsion manipulation (Filter Forge)  — Film
111. N-Uniform tilings (Filter Forge N-Uniform Tiles)  — Render
112. Rose Window (Filter Forge)  — Render
113. Speedliner manga speed lines (Filter Forge)  — Stylize
114. Plexus connected-dots network (Filter Forge)  — Render
115. Bubble Wrap (Filter Forge)  — Materials
116. Coin Generator relief coin (Filter Forge)  — Materials
117. Cameo Creator (Filter Forge Foxxee's)  — Stylize
118. Snowglobe (Filter Forge JLE)  — Distort
119. Tattoo Me skin tattoo (Filter Forge)  — Stylize
120. Neumorphism soft UI emboss (Filter Forge)  — Stylize
121. Scorched Parchment (Filter Forge)  — Frames
122. Barcode Color Art (Filter Forge)  — Stylize

## ReShade community repos 2 (6)

123. Frequency-modulation scan waves (CobraFX Frequency_CS) ⓖ  — Stylize
124. Serial Experiments Lain shadow style (DH_Lain)  — Stylize
125. Display uniformity correction (DH_Uniformity_Correction)  — Repair
126. Virtual nose overlay for VR comfort (Depth3D VirtualNose)  — Render
127. HDR black-floor lowering fix (Lilium)  — Tone
128. sRGB vs gamma 2.2 transfer mismatch fix (Lilium SDR TRC fix)  — Tone

## CLIJ2 reference (5)

129. Voronoi-Otsu labelling (CLIJ2 voronoiOtsuLabeling) ⓖ  — Analysis
130. Label extension-ratio map (CLIJ2 extensionRatioMap) ⓖ  — Analysis
131. Average neighbour-distance map (CLIJ2 averageNeighborDistanceMap) ⓖ  — Analysis
132. Touching-neighbour count map (CLIJ2 touchingNeighborCountMap) ⓖ  — Analysis
133. Per-label mean-of-Laplacian contrast map (CLIJ2 labelMeanOfLaplacianMap) ⓖ  — Analysis

## gl-transitions (23)

134. Doom screen-melt transition (gl-transitions DoomScreenTransition) ⓧ  — Frames
135. Book flip transition (gl-transitions BookFlip) ⓧ  — Frames
136. Luminance melt transition (gl-transitions luminance_melt) ⓧ  — Frames
137. Glitch memories transition (gl-transitions GlitchMemories) ⓧ  — Frames
138. Butterfly wave scrawler transition (gl-transitions) ⓧ  — Frames
139. Zoom-in circles transition (gl-transitions ZoomInCircles) ⓧ  — Frames
140. Polka-dots curtain transition (gl-transitions PolkaDotsCurtain) ⓧ  — Frames
141. Tiles wave transition (gl-transitions TilesWave) ⓧ  — Frames
142. Doorway transition (gl-transitions doorway) ⓧ  — Frames
143. Cross warp transition (gl-transitions crosswarp) ⓧ  — Frames
144. Undulating burn-out transition (gl-transitions undulatingBurnOut) ⓧ  — Frames
145. Old TV lost-signal transition (gl-transitions old_tv_lost_signal) ⓧ  — Frames
146. Polar function wipe (gl-transitions polar_function) ⓧ  — Frames
147. Power kaleido transition (gl-transitions powerKaleido) ⓧ  — Frames
148. Stereo viewer transition (gl-transitions StereoViewer) ⓧ  — Frames
149. Static wipe (gl-transitions static_wipe) ⓧ  — Frames
150. Tangent motion blur transition (gl-transitions tangentMotionBlur) ⓧ  — Frames
151. Bow-tie wipe (gl-transitions BowTieHorizontal / BowTieVertical) ⓧ  — Frames
152. Grid flip transition (gl-transitions GridFlip) ⓧ  — Frames
153. Window slice transition (gl-transitions windowslice) ⓧ  — Frames
154. Squares wire transition (gl-transitions squareswire) ⓧ  — Frames
155. Hexagonalize transition (gl-transitions hexagonalize) ⓧ  — Frames
156. Colour-distance transition (gl-transitions ColourDistance) ⓧ  — Frames

## Fiji plugin pages (13)

157. Adelson's checker-shadow squares generator (Fiji Adelson's Squares)  — Render
158. Anomalous q-Gaussian diffusion filter (Fiji Anomalous Diffusion Filters) ⓖ  — Noise
159. Quiver plot of vector field (Fiji Quiver Plot)  — Analysis
160. Stochastic random-walk denoise (Fiji Stochastic Denoise, Estrada) ⓖ  — Noise
161. Temporal-colour code projection (Fiji Temporal-Color Code) ⓧ  — Frames
162. Kalman stack filter (Fiji) ⓧ  — Noise
163. Smooth manifold extraction projection (Fiji SME Projection) ⓧ  — Analysis
164. Helmholtz local wave direction/wavelength map (Fiji Helmholtz Analysis) ⓖ  — Analysis
165. Replace red with magenta merge (Fiji)  — Color
166. Gabriel graph of points (Fiji Gabriel Graph) ⓖ  — Analysis
167. Shepp-Logan phantom (Fiji BIG-EPFL)  — Render
168. Microscope focus-quality tile map (Fiji MiFQC) ⓜ  — Analysis
169. 2D sample entropy texture (Fiji SampEn2D) ⓖ  — Analysis

## RawTherapee tools (4)

170. Contrast by Detail Levels (RawTherapee)  — Sharpen
171. L*a*b* colour correction grid (RawTherapee Color Toning)  — Color
172. Colour correction regions with H/C/L masks (RawTherapee Color Toning)  — Color
173. Saturation 2 colours toning (RawTherapee Color Toning)  — Color

## Fred's ImageMagick scripts (27)

174. Adaptive spatial-subdivision two-colour threshold (Fred's 2colorthresh) ⓖ  — Analysis
175. Locally adaptive gamma (Fred's adaptivegamma)  — Tone
176. Border dispersion effects (Fred's bordereffects)  — Frames
177. Random colour cells (Fred's colorcells)  — Stylize
178. Colour spectrum strip from image colours (Fred's colorspectrum) ⓖ  — Analysis
179. Dave Hill effect (Fred's davehilleffect)  — Tone
180. Furrowed wrinkle grit (Fred's furrowed)  — Sharpen
181. Hexagons of randomly rotated input (Fred's hexagons)  — Stylize
182. Plano-convex lens warp (Fred's lenswarp)  — Distort
183. LucisArt-like effect (Fred's lucisarteffect)  — Tone
184. Mottle effects (Fred's mottle)  — Noise
185. Pattern onto clothing warp (Fred's outfit) ⓧ  — Distort
186. Film perforations border (Fred's perforations)  — Frames
187. Polygon ring (Fred's polyring)  — Stylize
188. Primary/secondary RGB dots (Fred's rgbdots)  — Stylize
189. Jagged cut-and-splice (Fred's splice)  — Distort
190. Radial/circular striations (Fred's striations)  — Blur
191. Toonizarro Bizarro cartoon (Fred's toonizarro)  — Stylize
192. Uniform-colour watermark removal (Fred's unwatermark) ⓖ  — Repair
193. Underwater red-attenuation correction (Fred's uwcorrect)  — Color
194. Irregular linear weave distortion (Fred's weave)  — Distort
195. Wood brand burn (Fred's woodbrand)  — Materials
196. Non-uniform outward stretch (Fred's xpand)  — Distort
197. Logarithmic warp resize (Fred's warplog)  — Distort
198. 3D box cover wrap (Fred's 3Dcover)  — Render
199. Fisheye to strip panorama (Fred's fisheye2pano)  — Distort
200. Interweave two images in swaths (Fred's interweave) ⓧ  — Frames

## snibgo ImageMagick pages (8)

201. Polygonal pixelation (snibgo polypix) ⓖ  — Stylize
202. Wide-to-squareish spiral/ribbon rendering (snibgo wide2sq) ⓖ  — Distort
203. Maximise local contrast without clipping (snibgo maxloccont) ⓖ  — Tone
204. Pin-or-push displacement (snibgo pinorpush) ⓖ  — Distort
205. Flat-colour cartoon by area representative colour (snibgo flatcolcart) ⓖ  — Stylize
206. Mending broken lines (snibgo mendbrkln) ⓖ  — Repair
207. Dark-path ragged self-tiling piece (snibgo dptile) ⓖ  — Materials
208. Shape-to-shape warp (snibgo sh2sh) ⓖ  — Distort

## Notch post-FX nodes (3)

209. Gradient Patch colour grid with blends (Notch)  — Render
210. Line Distortion luminance-length growing lines (Notch)  — Stylize
211. Feedback Blur trailing from a line (Notch)  — Blur

## ISF shader library (Vidvox) (19)

212. Broken LCD value-noise cracks (ISF)  — Retro
213. Comet Tails brightness feedback trails (ISF) ⓧ  — Frames
214. Doodler random-walk pen (ISF) ⓖ  — Render
215. Duotone From Histogram (ISF) ⓖ  — Color
216. Echo Trace threshold-gated update (ISF) ⓧ  — Frames
217. Edge Blowout region edge stretch (ISF)  — Distort
218. Noise Adapt changed pixels become noise (ISF) ⓧ  — Frames
219. Smudged Lens (ISF)  — Blur
220. Smoke Screen overlay (ISF)  — Render
221. Triangle Warp (ISF)  — Distort
222. Vertical Tearing vsync-off (ISF)  — Retro
223. Video Bricks brick-pattern tiling (ISF)  — Stylize
224. Video Snake frame-delayed grid (ISF) ⓧ  — Frames
225. Y-C Time Blur separate YIQ feedback (ISF) ⓧ  — Frames
226. Power Warp power-curve distortion (ISF)  — Distort
227. Motion Heat Map (ISF) ⓧ  — Frames
228. RGB Trails per-channel persistent buffer (ISF RGB Trails 3.0) ⓧ  — Frames
229. Random Freeze partial-region update (ISF) ⓧ  — Frames
230. Time Glitch RGB 8-frame channel buffer (ISF) ⓧ  — Frames

## Filter Forge library 3 (Misc effects) (29)

231. Bullet Holes in Picture (Filter Forge)  — Stylize
232. Cave Paintings (Filter Forge)  — Paint
233. Changeable Taffeta fabric (Filter Forge)  — Materials
234. Cowify cow-spot pattern (Filter Forge)  — Render
235. Electron Microscope look (Filter Forge)  — Stylize
236. Iterative Fluid Sim (Filter Forge) ⓖ  — Distort
237. Lathe Custom Profile (Filter Forge)  — Render
238. Lightsaber glow (Filter Forge)  — Render
239. Lunar Phases (Filter Forge)  — Render
240. Mystery Science Theater 3000 silhouette overlay (Filter Forge)  — Frames
241. Picture to Plush (Filter Forge)  — Materials
242. Playing Card (Filter Forge)  — Frames
243. Rubik's Cube (Filter Forge)  — Stylize
244. Raked Sand (Filter Forge)  — Materials
245. Sequined (Filter Forge)  — Materials
246. Mulberry Paper (Filter Forge)  — Materials
247. Sandpaper (Filter Forge)  — Materials
248. Corrugated Metal (Filter Forge)  — Materials
249. Patina (Filter Forge)  — Materials
250. Wax Seal (Filter Forge)  — Materials
251. Realistic Vinyl record (Filter Forge)  — Materials
252. Styrofoam Image (Filter Forge)  — Materials
253. Suede (Filter Forge)  — Materials
254. Thatched (Filter Forge)  — Materials
255. Tin Can (Filter Forge)  — Materials
256. Wood Burning pyrography (Filter Forge)  — Paint
257. Tire Tracks (Filter Forge)  — Render
258. TV Circuit Bending (Filter Forge)  — Retro
259. Rutt-Etra scan-processor lines (Filter Forge)  — Retro

## Filter Forge library 4 (textures) (42)

260. Ammonite fossil texture (Filter Forge)  — Materials
261. Asphalt road texture (Filter Forge)  — Materials
262. Asphalt roof shingles (Filter Forge)  — Materials
263. Bamboo texture (Filter Forge)  — Materials
264. Barbed Wire Fence (Filter Forge)  — Materials
265. Berber Carpet (Filter Forge)  — Materials
266. Blood Cells (Filter Forge)  — Materials
267. Carbon Fiber weave (Filter Forge)  — Materials
268. Cardboard (Filter Forge)  — Materials
269. Chain mail (Filter Forge Maille Maker)  — Materials
270. Chicken Wire (Filter Forge)  — Materials
271. Cinder Blocks (Filter Forge)  — Materials
272. Coral Reef (Filter Forge)  — Materials
273. Dry Lakebed cracked mud (Filter Forge)  — Materials
274. Diamond tread plate (Filter Forge Diamond Plate)  — Materials
275. Expanded Metal Floor (Filter Forge)  — Materials
276. Flagstones (Filter Forge)  — Materials
277. Giraffe Skin (Filter Forge)  — Materials
278. Greebles sci-fi detailing (Filter Forge)  — Materials
279. Knurling (Filter Forge)  — Materials
280. Malachite (Filter Forge)  — Materials
281. Geode (Filter Forge)  — Materials
282. Lichen Covered Stone (Filter Forge)  — Materials
283. Pegboard (Filter Forge)  — Materials
284. Woven Wicker (Filter Forge)  — Materials
285. Spaceship Hull Plates (Filter Forge)  — Materials
286. Speaker Grill (Filter Forge)  — Materials
287. Stalactite Cave (Filter Forge)  — Materials
288. Tatami Mat (Filter Forge)  — Materials
289. Terrazzo Tiles (Filter Forge)  — Materials
290. Travertine (Filter Forge)  — Materials
291. Turtle shell (Filter Forge)  — Materials
292. Wattle and Daub (Filter Forge)  — Materials
293. Widmanstatten pattern (Filter Forge)  — Materials
294. Iris of the Eye (Filter Forge)  — Render
295. Swiss Cheese (Filter Forge)  — Materials
296. Dendrite crystal growth (Filter Forge) ⓖ  — Render
297. Acoustic Ceiling Tile (Filter Forge)  — Materials
298. Detectable Warning Surface tactile paving (Filter Forge)  — Materials
299. Solar Panels (Filter Forge)  — Materials
300. Sewer Plate / manhole cover (Filter Forge)  — Materials
301. Agar Plate / Petri Dish (Filter Forge)  — Materials

## Magic Bullet Looks tools (4)

302. Telecine Net silk black-softening (Magic Bullet Looks)  — Film
303. Shutter Streak film-gate light leak (Magic Bullet Looks)  — Film
304. Huenity hue unification (Magic Bullet Looks)  — Color
305. Haze/Flare uncoated-lens internal reflections (Magic Bullet Looks)  — Film

## Filter Forge library 5 (pattern textures) (9)

306. Arabesque pattern (Filter Forge)  — Render
307. Celtic Knots (Filter Forge)  — Render
308. Islamic geometric tiling generator 8/12-way (Filter Forge)  — Render
309. Quasicrystal pattern (Filter Forge)  — Render
310. Spiral Galaxy generator (Filter Forge)  — Render
311. Escher Cube tumbling blocks (Filter Forge)  — Render
312. Inca and Aztec Designs (Filter Forge)  — Render
313. Tribal tattoo patterns (Filter Forge)  — Render
314. Barber pole / candy-cane coil (Filter Forge)  — Render

## Red Giant Universe 2 (10)

315. Prism Displacement oily/opalescent (Red Giant Universe)  — Distort
316. Quantum animated light trail behind layer (Red Giant Universe)  — Render
317. Swish Pan whip-pan transition (Red Giant Universe) ⓧ  — Frames
318. Dolly Fade transition (Red Giant Universe) ⓧ  — Frames
319. Exposure Blur flash transition (Red Giant Universe) ⓧ  — Frames
320. HalfLight solarize/light-beam transition (Red Giant Universe) ⓧ  — Frames
321. Diamond Wave transition (Red Giant Universe) ⓧ  — Frames
322. Triangle Wave transition (Red Giant Universe) ⓧ  — Frames
323. Inside Cube transition (Red Giant Universe) ⓧ  — Frames
324. Channel Surf transition (Red Giant Universe) ⓧ  — Frames

## Acorn filters (1)

325. Fuzz Stroke fuzzy edge stroke (Acorn)  — Frames

## AugLy image augmentations (6)

326. Meme format caption bar (AugLy meme_format)  — Augment
327. Overlay onto Instagram screenshot template (AugLy overlay_onto_screenshot)  — Augment
328. Shuffle a fraction of pixels (AugLy shuffle_pixels)  — Augment
329. Overlay emoji (AugLy overlay_emoji)  — Augment
330. Clickbait text box overlay (AugLy overlay_random_text_with_background)  — Augment
331. Ranking numbers overlay (AugLy ranking_numbers)  — Augment

## Augraphy document augmentations (20)

332. Bindings and fasteners overlay (Augraphy BindingsAndFasteners)  — Augment
333. Book binding page curvature (Augraphy BookBinding) ⓖ  — Augment
334. Coloured paper tint (Augraphy ColorPaper)  — Augment
335. Laser-printer dirty drum streaks (Augraphy DirtyDrum)  — Augment
336. Scanner dirty-roller lines (Augraphy DirtyRollers)  — Augment
337. Dirty scanner glass clusters (Augraphy DirtyScreen)  — Augment
338. Ink mottling (Augraphy InkMottling)  — Augment
339. Low-ink periodic lines (Augraphy LowInkPeriodicLines)  — Augment
340. Low-ink random lines (Augraphy LowInkRandomLines)  — Augment
341. Markup highlighter/strikethrough/underline (Augraphy Markup) ⓖ  — Augment
342. Page border stack edges (Augraphy PageBorder)  — Augment
343. Hollow text via contour median (Augraphy Hollow) ⓖ  — Augment
344. Section shift (Augraphy SectionShift)  — Augment
345. Reflected light glare ellipse (Augraphy ReflectedLight)  — Augment
346. LCD screen photograph pattern (Augraphy LCDScreenPattern)  — Augment
347. Ink shifter text displacement (Augraphy InkShifter)  — Augment
348. Document side shadow cast (Augraphy ShadowCast)  — Augment
349. Lines degradation of gradient-formed lines (Augraphy LinesDegradation) ⓖ  — Augment
350. Noisy lines at fixed intervals (Augraphy NoisyLines)  — Augment
351. Bleed-through simulation (Augraphy BleedThrough) ⓧ  — Augment

## OBS FiniteSingularity plug-ins (3)

352. Cathode Boot CRT on/off collapse (OBS Retro Effects)  — Retro
353. Retro Codec RPZA 1995 webcam artifacts (OBS Retro Effects)  — Retro
354. Triakis-tile pixelate (OBS Composite Blur)  — Stylize

## WhiteboxTools (46)

355. Balance Contrast Enhancement colour-bias removal (WhiteboxTools, Liu 1991) ⓖ  — Tone
356. High-pass bilateral filter (WhiteboxTools)  — Sharpen
357. Diversity filter unique-value count (WhiteboxTools)  — Analysis
358. Write function memory insertion change composite (WhiteboxTools) ⓧ  — Analysis
359. Change vector analysis (WhiteboxTools) ⓧ  — Analysis
360. Directional relief (WhiteboxTools) ⓖ  — Terrain
361. Downslope index (WhiteboxTools, Hjerdt 2004) ⓖ  — Terrain
362. Drainage-preserving DEM smoothing (WhiteboxTools) ⓖ  — Terrain
363. Wind fetch distance (WhiteboxTools Fetch Analysis) ⓖ  — Terrain
364. Max anisotropy of elevation deviation (WhiteboxTools) ⓖ  — Terrain
365. Maximum branch length divide map (WhiteboxTools) ⓖ  — Terrain
366. Maximal / minimal curvature (WhiteboxTools)  — Terrain
367. Tangential curvature (WhiteboxTools)  — Terrain
368. Spherical std dev of surface normals (WhiteboxTools)  — Terrain
369. Average normal-vector angular deviation (WhiteboxTools)  — Terrain
370. Circular variance of aspect (WhiteboxTools)  — Terrain
371. Relative aspect to wind azimuth (WhiteboxTools)  — Terrain
372. Sediment transport index (WhiteboxTools) ⓖ  — Terrain
373. Remove off-terrain objects bare-earth DEM (WhiteboxTools) ⓖ  — Terrain
374. Surface area ratio (WhiteboxTools)  — Terrain
375. Time in daylight (WhiteboxTools) ⓖ  — Terrain
376. Multiscale topographic position image (WhiteboxTools) ⓖ  — Terrain
377. Visibility index (WhiteboxTools) ⓖ  — Terrain
378. D-infinity flow accumulation (WhiteboxTools) ⓖ  — Terrain
379. FD8 multiple-flow-direction accumulation (WhiteboxTools) ⓖ  — Terrain
380. Rho8 stochastic flow pointer (WhiteboxTools) ⓖ  — Terrain
381. Depth in sink (WhiteboxTools) ⓖ  — Terrain
382. Elevation above stream / HAND (WhiteboxTools) ⓖ  — Terrain
383. Impoundment size index (WhiteboxTools) ⓖ  — Terrain
384. Stochastic depression probability (WhiteboxTools) ⓖ  — Terrain
385. Least-cost depression breaching (WhiteboxTools) ⓖ  — Terrain
386. Downslope distance to stream (WhiteboxTools) ⓖ  — Terrain
387. Max upslope flowpath length (WhiteboxTools) ⓖ  — Terrain
388. Isobasins equal-area watersheds (WhiteboxTools) ⓖ  — Terrain
389. Strahler-order basins (WhiteboxTools) ⓖ  — Terrain
390. Hillslopes left/right of stream links (WhiteboxTools) ⓖ  — Terrain
391. Flood order (WhiteboxTools) ⓖ  — Terrain
392. Wang-Liu priority-flood depression fill (WhiteboxTools) ⓖ  — Terrain
393. Turning-bands random field (WhiteboxTools) ⓖ  — Noise
394. Local image correlation neighbourhood map (WhiteboxTools) ⓧ  — Analysis
395. Shape complexity raster transect index (WhiteboxTools) ⓖ  — Analysis
396. Natural-neighbour (Sibson) interpolation from sparse samples (WhiteboxTools) ⓖ  — Repair
397. Radial-basis-function interpolation from sparse samples (WhiteboxTools) ⓖ  — Repair
398. TIN gridding linear interpolation (WhiteboxTools) ⓖ  — Repair
399. Cost-distance accumulation map (WhiteboxTools) ⓖ  — Analysis
400. Least-cost pathway (WhiteboxTools) ⓖ  — Analysis
