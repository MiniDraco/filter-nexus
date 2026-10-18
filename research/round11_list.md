# Round 11 harvest: 440 techniques not yet in Filter Nexus

Checked by `research/dedupe11.py` against every filter, engine id and alias name in `filters.db`, all round-9 and round-10 names. 343 are buildable as GPU shaders; 63 need whole-image/sequential work, 12 need a neural net, 22 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Houdini Copernicus (30)

1. Grunge Bark Strips (Copernicus)  — Materials
2. Grunge Birch Bark (Copernicus)  — Materials
3. Grunge Galvanized Steel (Copernicus)  — Materials
4. Grunge Leaking Streaks (Copernicus)  — Materials
5. Grunge Mold Spots (Copernicus)  — Materials
6. Grunge Wipe Trails (Copernicus)  — Materials
7. Combine Normals (Copernicus)  — Materials
8. Planar Inflate (Copernicus)  — Materials
9. Height to Caustics (Copernicus)  — Materials
10. Bubble Noise (Copernicus)  — Noise
11. Chladni Cymatic Patterns  — Noise
12. Hyperbolic Tile (Copernicus)  — Noise
13. Turing Patterns (Copernicus) ⓖ  — Noise
14. Neural Cellular Automata (Copernicus) ⓖ  — Noise
15. Edge Detect by Normal (Copernicus)  — Edges
16. Edge Detect by Contour (Copernicus) ⓖ  — Edges
17. Segment by Connectivity (Copernicus) ⓖ  — Analysis
18. Segment by Value (Copernicus) ⓖ  — Analysis
19. Statistics by ID (Copernicus) ⓖ  — Analysis
20. Points from Blobs (Copernicus) ⓖ  — Analysis
21. Solve Poisson (Copernicus) ⓖ  — Analysis
22. Extrapolate Boundaries (Copernicus) ⓖ  — Repair
23. Smooth Fill (Copernicus) ⓖ  — Repair
24. Fill Connected (Copernicus) ⓖ  — Repair
25. Illegal Pixel (Copernicus)  — Repair
26. Surface Dither (Copernicus)  — Stylize
27. HeightField Slump (Copernicus) ⓖ  — Terrain
28. Ocean Spectrum (Copernicus) ⓖ  — Render
29. Cell Pattern (Copernicus)  — Noise
30. Tile Pattern (Copernicus)  — Noise

## Substance Designer (19)

31. Histogram Select  — Tone
32. Non-Uniform Histogram Scan  — Tone
33. Non-Square Transform  — Distort
34. Safe Transform (Substance)  — Distort
35. Trapezoid Transform  — Distort
36. Flood Fill to Gradient ⓖ  — Analysis
37. Flood Fill to Random Grayscale ⓖ  — Analysis
38. Flood Fill to BBox Size ⓖ  — Analysis
39. Height Normal Blender  — Materials
40. Normal Vector Rotation  — Materials
41. Height Map Frequencies Mapper  — Materials
42. Splatter Circular  — Materials
43. Shape Splatter  — Materials
44. BnW Spots  — Noise
45. Moisture Noise  — Noise
46. Fractal Sum Base  — Noise
47. Microscope View (Substance)  — Noise
48. Creased (Substance)  — Noise
49. Liquid (Substance)  — Noise

## Game engine post-process 2 (10)

50. Hue vs Hue curve  — Tone
51. Hue vs Sat curve  — Tone
52. Sat vs Sat curve  — Tone
53. Lum vs Sat curve  — Tone
54. Blue Correction (Unreal)  — Tone
55. Expand Gamut (Unreal)  — Tone
56. Scalable Ambient Obscurance  — Depth
57. Multi-scale Volumetric Occlusion  — Depth
58. Screen Space Indirect Lighting (SSIL)  — Depth
59. Screen Space Lens Flare (Unity)  — Stylize

## Photoshop Neural / Camera Raw (9)

60. Makeup Transfer ⓜ  — Repair
61. JPEG Artifacts Removal (Neural Filter) ⓜ  — Repair
62. Harmonization (Neural Filter) ⓜ  — Repair
63. Raw Details (Camera Raw) ⓜ  — Repair
64. Super Resolution (Camera Raw) ⓜ  — Repair
65. Reflections Removal (Camera Raw) ⓜ  — Repair
66. Distraction Removal (Camera Raw) ⓜ  — Repair
67. Adaptive Color profile (Camera Raw) ⓜ  — Repair
68. Point Color (Camera Raw)  — Color

## Clip Studio Paint (6)

69. Curved Surface (Clip Studio)  — Distort
70. Convert to Panorama (Clip Studio)  — Distort
71. Geometric Distortion (Clip Studio)  — Distort
72. Remove Dust (Clip Studio) ⓖ  — Repair
73. Adjust Line Width (Clip Studio)  — Edges
74. Artistic (Clip Studio)  — Paint

## Procreate (5)

75. Perspective Blur (Procreate)  — Blur
76. Glitch: Artifact (Procreate)  — Retro
77. Glitch: Wave (Procreate)  — Retro
78. Glitch: Signal (Procreate)  — Retro
79. Glitch: Diverge (Procreate)  — Retro

## Corel Painter (10)

80. Apply Marbling ⓖ  — Paint
81. Blobs (Painter) ⓖ  — Paint
82. Growth (Painter) ⓖ  — Paint
83. Auto Clone (Painter) ⓖ  — Paint
84. Apply Surface Texture (Painter)  — Materials
85. Express Texture (Painter)  — Materials
86. Dye Concentration (Painter)  — Materials
87. Serigraphy (Painter)  — Materials
88. Distress (Painter)  — Materials
89. Apply Screen (Painter)  — Materials

## Astro 2 (PixInsight / Siril / StarTools) (19)

90. GREYCstoration (PixInsight)  — Repair
91. Siril Split Bregman deconvolution ⓖ  — Repair
92. StarTools SVDecon ⓖ  — Repair
93. StarTools Repair ⓖ  — Repair
94. StarTools Synth ⓖ  — Repair
95. AdaptiveStretch (PixInsight) ⓖ  — Tone
96. ExponentialTransformation (PixInsight) ⓖ  — Tone
97. Siril ddp (digital development processing) ⓖ  — Tone
98. StarTools AutoDev ⓖ  — Tone
99. StarTools FilmDev ⓖ  — Tone
100. StarTools Entropy ⓖ  — Tone
101. StarTools Flux ⓖ  — Tone
102. StarTools Super Structure ⓖ  — Tone
103. StarTools NBAccent ⓖ  — Tone
104. Siril linear_match ⓧ  — Color
105. RepairedHSVSeparation (PixInsight)  — Color
106. Siril grey_flat (CFA equalize)  — Color
107. Siril unclipstars ⓖ  — Repair
108. Siril synthstar ⓖ  — Repair

## GEGL ops (4)

109. gegl:piecewise-blend  — Color
110. gegl:rgb-clip  — Color
111. gegl:negative-darkroom  — Color
112. gegl:wavelet-blur  — Blur

## OpenCV contrib (13)

113. jointBilateralFilter  — Blur
114. EdgeDrawing ⓖ  — Edges
115. SuperpixelLSC ⓖ  — Analysis
116. covarianceEstimation ⓖ  — Analysis
117. quaternion DFT (qdft) ⓖ  — Analysis
118. inpaint FSR_BEST (xphoto) ⓖ  — Repair
119. inpaint SHIFTMAP (xphoto) ⓖ  — Repair
120. QualityGMSD ⓧ  — Analysis
121. ObjectnessBING ⓖ  — Analysis
122. marrHildrethHash ⓖ  — Analysis
123. radialVarianceHash ⓖ  — Analysis
124. colorMomentHash ⓖ  — Analysis
125. blockMeanHash ⓖ  — Analysis

## scikit-image / scipy / mahotas / Pillow (12)

126. multiblock_lbp  — Analysis
127. haar_like_feature  — Analysis
128. iradon_sart ⓖ  — Analysis
129. frt2 (finite radon) ⓖ  — Analysis
130. estimate_sigma ⓖ  — Analysis
131. denoise_invariant (J-invariant) ⓖ  — Analysis
132. pftas (mahotas) ⓖ  — Analysis
133. rank noise_filter  — Tone
134. fourier_ellipsoid  — Blur
135. fourier_uniform  — Blur
136. PIL EDGE_ENHANCE_MORE  — Sharpen
137. ImageOps.deform  — Sharpen

## ImageMagick 2 (9)

138. Kernel Peaks  — Edges
139. Sparse-color Barycentric ⓖ  — Distort
140. Sparse-color Inverse ⓖ  — Distort
141. Function Arcsin  — Tone
142. Function Arctan  — Tone
143. Perceptible ⓖ  — Analysis
144. Range-threshold (ImageMagick)  — Tone
145. Color-threshold (ImageMagick)  — Tone
146. White-threshold (ImageMagick)  — Tone

## VapourSynth / AviSynth (13)

147. FFT3DFilter  — Repair
148. DeHalo_alpha  — Repair
149. YAHR (yet another halo remover)  — Repair
150. EdgeCleaner  — Repair
151. BlindDeHalo3  — Repair
152. Vinverse  — Repair
153. SangNom2 (anti-aliasing)  — Repair
154. MSmooth  — Repair
155. MDegrain ⓧ  — Repair
156. TempGaussMC (QTGMC) ⓧ  — Repair
157. MCTemporalDenoise ⓧ  — Repair
158. TTempSmooth ⓧ  — Repair
159. TCanny (VapourSynth)  — Edges

## Camera ISP stages (10)

160. Black level subtraction  — Repair
161. Defective pixel correction  — Repair
162. Green imbalance correction  — Repair
163. False color suppression  — Repair
164. Quad Bayer remosaic  — Repair
165. Bayer binning  — Repair
166. Hamilton-Adams demosaic  — Repair
167. Color correction matrix (CCM)  — Color
168. Camera to XYZ matrix (DNG ColorMatrix)  — Color
169. DNG forward matrix  — Color

## Printing / prepress (18)

170. Gray component replacement (GCR)  — Color
171. Under color removal (UCR)  — Color
172. Under color addition (UCA)  — Color
173. Total area coverage ink limit (TAC)  — Color
174. Overprint preview  — Color
175. Separation preview  — Color
176. Rich black  — Color
177. Dot gain compensation  — Color
178. Hexachrome separation  — Color
179. Extended gamut CMYKOGV separation  — Color
180. Registration error simulation  — Color
181. Trapping (spread / choke)  — Color
182. Knockout  — Color
183. Quadtone  — Color
184. Elliptical dot screen  — Retro
185. Euclidean dot screen  — Retro
186. Hybrid (XM) screening  — Retro
187. Rosette moire simulation  — Retro

## Cartography / GIS (8)

188. Swiss hillshading (Imhof)  — Terrain
189. Multi-directional oblique weighting (MDOW)  — Terrain
190. Positive openness  — Terrain
191. Negative openness  — Terrain
192. Waterlining  — Terrain
193. Plan oblique relief  — Terrain
194. Texture shading (Leland Brown)  — Terrain
195. Cliff shading  — Terrain

## Document analysis 2 (6)

196. Wolf-Jolion binarization  — Repair
197. Bradley-Roth adaptive threshold  — Repair
198. Lu-Su-Tan 2010 binarization ⓖ  — Repair
199. XY-cut segmentation ⓖ  — Repair
200. Docstrum layout analysis ⓖ  — Repair
201. Projection profile deskew ⓖ  — Repair

## Image quality maps (25)

202. MSCN coefficients map (BRISQUE)  — Analysis
203. Local sharpness map (S3)  — Analysis
204. JNB blur metric  — Analysis
205. IL-NIQE ⓖ  — Analysis
206. BLIINDS-II ⓖ  — Analysis
207. DIIVINE ⓖ  — Analysis
208. MS-SSIM ⓧ  — Analysis
209. CW-SSIM ⓧ  — Analysis
210. IW-SSIM ⓧ  — Analysis
211. FSIM ⓧ  — Analysis
212. VSI ⓧ  — Analysis
213. MDSI ⓧ  — Analysis
214. HaarPSI ⓧ  — Analysis
215. SR-SIM ⓧ  — Analysis
216. VIF ⓧ  — Analysis
217. PSNR-HVS-M ⓧ  — Analysis
218. S-CIELAB ⓧ  — Analysis
219. Butteraugli ⓧ  — Analysis
220. SSIMULACRA 2 ⓧ  — Analysis
221. NVIDIA FLIP ⓧ  — Analysis
222. HDR-VDP-2 ⓧ  — Analysis
223. LPIPS ⓜ  — Analysis
224. DISTS ⓜ  — Analysis
225. MUSIQ ⓜ  — Analysis
226. MANIQA ⓜ  — Analysis

## Medical imaging 2 (6)

227. B-COSFIRE  — Edges
228. DullRazor hair removal  — Repair
229. Lung window preset  — Repair
230. Bone window preset  — Repair
231. MUSICA multiscale contrast amplification ⓖ  — Sharpen
232. Weighted gray-edge  — Color

## Kornia (3)

233. edge_aware_blur_pool2d  — Augment
234. max_blur_pool2d  — Augment
235. zca_whiten  — Augment

## Nik Color Efex (34)

236. Bi-Color Filters (Color Efex)  — Color
237. Brilliance / Warmth (Color Efex)  — Color
238. Color Stylizer (Color Efex)  — Color
239. Contrast Color Range (Color Efex)  — Color
240. Cross Balance (Color Efex)  — Color
241. Foliage (Color Efex)  — Color
242. Indian Summer (Color Efex)  — Color
243. Midnight (Color Efex)  — Color
244. Monday Morning (Color Efex)  — Color
245. Paper Toner (Color Efex)  — Color
246. Photo Stylizer (Color Efex)  — Color
247. Polarization (Color Efex)  — Color
248. Reflector Efex  — Color
249. Remove Color Cast (Color Efex)  — Color
250. Skylight Filter (Color Efex)  — Color
251. Sunlight (Color Efex)  — Color
252. White Neutralizer (Color Efex)  — Color
253. Ink (Color Efex)  — Color
254. Duplex (Color Efex)  — Color
255. Selective Tones (Viveza)  — Color
256. Dark Contrasts (Color Efex)  — Tone
257. Darken / Lighten Center (Color Efex)  — Tone
258. Pro Contrast (Color Efex)  — Tone
259. High Key (Color Efex)  — Tone
260. Low Key (Color Efex)  — Tone
261. Detail Extractor (Color Efex)  — Tone
262. Film Efex: Faded  — Film
263. Film Efex: Nostalgic  — Film
264. Film Efex: Vintage  — Film
265. Film Efex: Modern  — Film
266. Multi-Lens (Analog Efex)  — Film
267. Double Exposure (Analog Efex) ⓧ  — Film
268. Dynamic Skin Softener (Color Efex)  — Blur
269. Vignette: Blur (Color Efex)  — Blur

## Classic plug-in suites (42)

270. Corona (Eye Candy)  — Stylize
271. Reptile Skin (Eye Candy)  — Stylize
272. Smoke (Eye Candy)  — Stylize
273. Icicles (Eye Candy)  — Stylize
274. Snow Drift (Eye Candy)  — Stylize
275. Squint (Eye Candy)  — Stylize
276. Texture Noise (Eye Candy)  — Stylize
277. Fire (Eye Candy)  — Stylize
278. Burnt Edges (Xenofex)  — Stylize
279. Classic Mosaic (Xenofex)  — Stylize
280. Constellation (Xenofex)  — Stylize
281. Crumple (Xenofex)  — Stylize
282. Electrify (Xenofex)  — Stylize
283. Flag (Xenofex)  — Stylize
284. Little Fluffy Clouds (Xenofex)  — Stylize
285. Rip Open (Xenofex)  — Stylize
286. Television (Xenofex)  — Stylize
287. KPT Goo  — Distort
288. KPT Projector  — Distort
289. KPT Gel  — Distort
290. KPT Materializer  — Distort
291. KPT Equalizer (Bounded Sharpen)  — Distort
292. KPT SkyEffects  — Distort
293. KPT Reaction  — Distort
294. KPT Convolver  — Distort
295. LunarCell (Flaming Pear)  — Stylize
296. Glitterato (Flaming Pear)  — Stylize
297. Melancholytron (Flaming Pear)  — Stylize
298. India Ink (Flaming Pear)  — Stylize
299. SolarCell (Flaming Pear)  — Stylize
300. Lacquer (Flaming Pear)  — Stylize
301. Swerve (Flaming Pear)  — Stylize
302. Hue and Cry (Flaming Pear)  — Stylize
303. Aetherize (Flaming Pear)  — Stylize
304. Topaz Impression  — Paint
305. Topaz Glow  — Paint
306. Topaz ReStyle  — Paint
307. Topaz Adjust  — Paint
308. Topaz B&W Effects  — Paint
309. Topaz Lens Effects  — Paint
310. Topaz Star Effects  — Paint
311. Topaz Texture Effects  — Paint

## Apple Photographic Styles (7)

312. Cool Rose (Photographic Style)  — Insta
313. Amber (Photographic Style)  — Insta
314. Rose Gold (Photographic Style)  — Insta
315. Gold (Photographic Style)  — Insta
316. Stark B&W (Photographic Style)  — Insta
317. Rich Contrast (Photographic Style)  — Insta
318. Vibrant (Photographic Style)  — Insta

## Colormaps: matplotlib (23)

319. matplotlib viridis  — Analysis
320. matplotlib plasma  — Analysis
321. matplotlib inferno  — Analysis
322. matplotlib magma  — Analysis
323. matplotlib cividis  — Analysis
324. matplotlib turbo  — Analysis
325. matplotlib twilight  — Analysis
326. matplotlib cubehelix  — Analysis
327. matplotlib jet  — Analysis
328. matplotlib hot  — Analysis
329. matplotlib afmhot  — Analysis
330. matplotlib gist_earth  — Analysis
331. matplotlib gist_stern  — Analysis
332. matplotlib nipy_spectral  — Analysis
333. matplotlib CMRmap  — Analysis
334. matplotlib Wistia  — Analysis
335. matplotlib seismic  — Analysis
336. matplotlib coolwarm  — Analysis
337. matplotlib bone  — Analysis
338. matplotlib copper  — Analysis
339. matplotlib pink  — Analysis
340. matplotlib gnuplot2  — Analysis
341. matplotlib gist_ncar  — Analysis

## Colormaps: cmocean (21)

342. cmocean thermal  — Analysis
343. cmocean haline  — Analysis
344. cmocean solar  — Analysis
345. cmocean ice  — Analysis
346. cmocean oxy  — Analysis
347. cmocean deep  — Analysis
348. cmocean dense  — Analysis
349. cmocean algae  — Analysis
350. cmocean matter  — Analysis
351. cmocean turbid  — Analysis
352. cmocean speed  — Analysis
353. cmocean amp  — Analysis
354. cmocean tempo  — Analysis
355. cmocean rain  — Analysis
356. cmocean phase  — Analysis
357. cmocean topo  — Analysis
358. cmocean balance  — Analysis
359. cmocean delta  — Analysis
360. cmocean curl  — Analysis
361. cmocean diff  — Analysis
362. cmocean tarn  — Analysis

## Colormaps: Crameri (39)

363. Crameri batlow  — Analysis
364. Crameri batlowK  — Analysis
365. Crameri batlowW  — Analysis
366. Crameri acton  — Analysis
367. Crameri bamako  — Analysis
368. Crameri bilbao  — Analysis
369. Crameri buda  — Analysis
370. Crameri davos  — Analysis
371. Crameri devon  — Analysis
372. Crameri glasgow  — Analysis
373. Crameri grayC  — Analysis
374. Crameri hawaii  — Analysis
375. Crameri imola  — Analysis
376. Crameri lajolla  — Analysis
377. Crameri lapaz  — Analysis
378. Crameri lipari  — Analysis
379. Crameri navia  — Analysis
380. Crameri nuuk  — Analysis
381. Crameri oslo  — Analysis
382. Crameri tokyo  — Analysis
383. Crameri turku  — Analysis
384. Crameri bam  — Analysis
385. Crameri berlin  — Analysis
386. Crameri broc  — Analysis
387. Crameri cork  — Analysis
388. Crameri lisbon  — Analysis
389. Crameri managua  — Analysis
390. Crameri roma  — Analysis
391. Crameri tofino  — Analysis
392. Crameri vanimo  — Analysis
393. Crameri vik  — Analysis
394. Crameri romaO  — Analysis
395. Crameri bamO  — Analysis
396. Crameri brocO  — Analysis
397. Crameri corkO  — Analysis
398. Crameri vikO  — Analysis
399. Crameri bukavu  — Analysis
400. Crameri fes  — Analysis
401. Crameri oleron  — Analysis

## Colormaps: ColorBrewer (20)

402. ColorBrewer YlGnBu  — Analysis
403. ColorBrewer YlOrRd  — Analysis
404. ColorBrewer YlOrBr  — Analysis
405. ColorBrewer OrRd  — Analysis
406. ColorBrewer PuBuGn  — Analysis
407. ColorBrewer PuRd  — Analysis
408. ColorBrewer RdPu  — Analysis
409. ColorBrewer BuPu  — Analysis
410. ColorBrewer GnBu  — Analysis
411. ColorBrewer BuGn  — Analysis
412. ColorBrewer YlGn  — Analysis
413. ColorBrewer BrBG  — Analysis
414. ColorBrewer PRGn  — Analysis
415. ColorBrewer PiYG  — Analysis
416. ColorBrewer PuOr  — Analysis
417. ColorBrewer RdBu  — Analysis
418. ColorBrewer RdGy  — Analysis
419. ColorBrewer RdYlBu  — Analysis
420. ColorBrewer RdYlGn  — Analysis
421. ColorBrewer Spectral  — Analysis

## Colormaps: colorcet (9)

422. colorcet fire  — Analysis
423. colorcet bmy  — Analysis
424. colorcet bgy  — Analysis
425. colorcet kbc  — Analysis
426. colorcet gouldian  — Analysis
427. colorcet rainbow4  — Analysis
428. colorcet isolum  — Analysis
429. colorcet colorwheel  — Analysis
430. colorcet glasbey  — Analysis

## Colormaps: CMasher (10)

431. CMasher rainforest  — Analysis
432. CMasher ember  — Analysis
433. CMasher toxic  — Analysis
434. CMasher gothic  — Analysis
435. CMasher eclipse  — Analysis
436. CMasher iceburn  — Analysis
437. CMasher redshift  — Analysis
438. CMasher fusion  — Analysis
439. CMasher seasons  — Analysis
440. CMasher infinity  — Analysis
