# Round 13 harvest: 451 techniques not yet in Filter Nexus

Checked by `research/dedupe13.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-12 names. 339 are buildable as GPU shaders; 72 need whole-image/sequential work, 29 need a neural net, 11 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Corel PHOTO-PAINT (18)

1. The Boss (PHOTO-PAINT)  — Stylize
2. Smoked Glass (PHOTO-PAINT)  — Stylize
3. Psychedelic (PHOTO-PAINT)  — Stylize
4. Whirlpool (PHOTO-PAINT)  — Stylize
5. Wet Paint (PHOTO-PAINT)  — Stylize
6. Screen Door (PHOTO-PAINT)  — Stylize
7. Dabble (PHOTO-PAINT)  — Paint
8. Pen and Ink (PHOTO-PAINT)  — Paint
9. Water Marker (PHOTO-PAINT)  — Paint
10. Wave Paper (PHOTO-PAINT)  — Paint
11. Directional Smooth (PHOTO-PAINT)  — Blur
12. Jaggy Despeckle (PHOTO-PAINT)  — Blur
13. Adaptive Unsharp (PHOTO-PAINT)  — Sharpen
14. Directional Sharpen (PHOTO-PAINT)  — Sharpen
15. Spot Filter (PHOTO-PAINT)  — Color
16. Cobblestone (PHOTO-PAINT)  — Materials
17. Elephant Skin (PHOTO-PAINT)  — Materials
18. Stone texture (PHOTO-PAINT)  — Materials

## digiKam (14)

19. Far Blur (digiKam)  — Blur
20. Softener Blur (digiKam)  — Blur
21. Shake Blur (digiKam)  — Blur
22. Caricature (digiKam)  — Distort
23. Multiple Corners (digiKam)  — Distort
24. Block Waves (digiKam)  — Distort
25. Circular Waves (digiKam)  — Distort
26. Agfapan 25 (digiKam B&W)  — Film
27. Agfapan 400 (digiKam B&W)  — Film
28. Agfa 200X (digiKam B&W)  — Film
29. Ilford SFX 200 (digiKam B&W)  — Film
30. Ilford SFX 800 (digiKam B&W)  — Film
31. Ilford Delta 400 Pro 3200 (digiKam B&W)  — Film
32. Cold Tone (digiKam B&W)  — Film

## CellProfiler (18)

33. Enhance Dark Holes (CellProfiler)  — Analysis
34. Enhance DIC (CellProfiler)  — Analysis
35. Enhance Line Structures (CellProfiler)  — Analysis
36. Illumination: Fit Polynomial (CellProfiler) ⓖ  — Repair
37. Illumination: Splines background (CellProfiler) ⓖ  — Repair
38. Illumination: Convex Hull (CellProfiler) ⓖ  — Repair
39. Robust Background threshold (CellProfiler) ⓖ  — Edges
40. Max Intensity Percentage threshold (CellProfiler) ⓖ  — Edges
41. Brightfield projection (CellProfiler) ⓧ  — Analysis
42. Power projection (CellProfiler) ⓧ  — Analysis
43. Variance projection (CellProfiler) ⓧ  — Analysis
44. Morph Branchpoints (CellProfiler)  — Edges
45. Morph Spur (CellProfiler)  — Edges
46. Morph Vbreak (CellProfiler)  — Edges
47. Morph Diag (CellProfiler)  — Edges
48. Morph OpenLines (CellProfiler)  — Edges
49. Morph Clean (CellProfiler)  — Edges
50. Morph SkelPE (CellProfiler) ⓖ  — Edges

## Tone mapping operators (tonemapper) (6)

51. ACES filmic Hill fit  — Tone
52. ACES filmic Romain Guy fit  — Tone
53. Aldridge filmic  — Tone
54. Day filmic (Insomniac)  — Tone
55. Hable updated filmic  — Tone
56. Ward contrast-based scale factor ⓖ  — Tone

## libdither halftoning (29)

57. Xot error diffusion ⓖ  — Retro
58. Diagonal error diffusion ⓖ  — Retro
59. Shiau-Fan error diffusion ⓖ  — Retro
60. 1D error diffusion ⓖ  — Retro
61. Fake Floyd-Steinberg error diffusion ⓖ  — Retro
62. Steve Pigeon error diffusion ⓖ  — Retro
63. Stevenson-Arce error diffusion ⓖ  — Retro
64. Robert Kist error diffusion ⓖ  — Retro
65. Zhou-Fang variable error diffusion ⓖ  — Retro
66. Direct Binary Search (DBS) halftoning ⓖ  — Retro
67. Kacker-Allebach dithering ⓖ  — Retro
68. Guo-Liu dot diffusion ⓖ  — Retro
69. Mese-Vaidyanathan dot diffusion ⓖ  — Retro
70. Lippens-Philips dot dithering ⓖ  — Retro
71. Spiral dot diffusion ⓖ  — Retro
72. Inverted spiral dot diffusion ⓖ  — Retro
73. Optimized Knuth dot diffusion ⓖ  — Retro
74. Modified Riemersma dither ⓖ  — Retro
75. Grid dither  — Retro
76. Central white-point ordered dither  — Retro
77. Balanced central white-point ordered dither  — Retro
78. Ulichney clustered-dot ordered dither  — Retro
79. Ulichney void dispersed-dots ordered dither  — Retro
80. Non-rectangular ordered dither  — Retro
81. Variable ordered dither  — Retro
82. Diagonal ordered dither  — Retro
83. ImageMagick circle ordered dither  — Retro
84. ImageMagick 45-degree ordered dither  — Retro
85. Pattern dither (3x3)  — Retro

## PaintShop Pro 2 (16)

86. Colored Chalk (PSP)  — Paint
87. Black Pencil (PSP)  — Paint
88. Brush Strokes (PSP)  — Paint
89. Toothbrush (PSP)  — Paint
90. Colored Edges (PSP)  — Edges
91. Curlicues (PSP)  — Stylize
92. Sunburst (PSP)  — Stylize
93. Mosaic - Antique (PSP)  — Stylize
94. Mosaic - Glass (PSP)  — Stylize
95. Sandstone (PSP)  — Materials
96. Thinify (PSP)  — Distort
97. Magnifying Lens (PSP)  — Distort
98. Backlighting correction (PSP) ⓖ  — Tone
99. Fill Flash (PSP) ⓖ  — Tone
100. Fade Correction (PSP) ⓖ  — Tone
101. Automatic Small Scratch Removal (PSP) ⓖ  — Repair

## Colour constancy algorithms (6)

102. Weighted Grey-Edge white balance ⓖ  — Color
103. Gray Pixel illuminant estimation ⓖ  — Color
104. Bright Pixels illuminant estimation ⓖ  — Color
105. Colour by Correlation (Finlayson) ⓖ  — Color
106. Fast Fourier Color Constancy (FFCC) ⓖ  — Color
107. FC4 confidence-weighted colour constancy ⓜ  — Color

## SAR speckle 2 (3)

108. Local Sigma filter (ENVI)  — Noise
109. Bit Error filter (ENVI)  — Noise
110. Multitemporal speckle filter (Quegan) ⓧ  — Noise

## Demoscene effects (6)

111. Rotozoomer  — Distort
112. Raster bars  — Retro
113. Kefrens bars  — Retro
114. Starfield overlay  — Retro
115. Metaballs  — Render
116. Voxel Space terrain render (Comanche)  — Render

## Symmetry groups (21)

117. Wallpaper group p1  — Distort
118. Wallpaper group p2  — Distort
119. Wallpaper group pm  — Distort
120. Wallpaper group pg  — Distort
121. Wallpaper group cm  — Distort
122. Wallpaper group pmg  — Distort
123. Wallpaper group pgg  — Distort
124. Wallpaper group p4  — Distort
125. Wallpaper group p4g  — Distort
126. Wallpaper group p3  — Distort
127. Wallpaper group p3m1  — Distort
128. Wallpaper group p31m  — Distort
129. Wallpaper group p6  — Distort
130. Wallpaper group p6m  — Distort
131. Frieze group hop (p1)  — Distort
132. Frieze group step (p11g)  — Distort
133. Frieze group sidle (p1m1)  — Distort
134. Frieze group spinning hop (p2)  — Distort
135. Frieze group spinning sidle (p2mg)  — Distort
136. Frieze group jump (p11m)  — Distort
137. Frieze group spinning jump (p2mm)  — Distort

## Topaz Studio 2 (7)

138. Precision Contrast (Topaz Studio)  — Tone
139. Precision Detail (Topaz Studio)  — Tone
140. Edge Exposure (Topaz Studio)  — Tone
141. Radiance (Topaz Studio)  — Tone
142. Color Theme (Topaz Studio) ⓖ  — Color
143. AI Clear (Topaz Studio) ⓜ  — Sharpen
144. AI Remix (Topaz Studio) ⓜ  — Stylize

## Nuke 2 (22)

145. BumpBoss (Nuke)  — Materials
146. DegrainBlue (Nuke)  — Noise
147. EdgeExtend (Nuke)  — Repair
148. GodRays (Nuke)  — Stylize
149. VolumeRays (Nuke)  — Depth
150. CrossTalk (Nuke)  — Color
151. PLogLin (Nuke)  — Color
152. SoftClip (Nuke)  — Tone
153. RollOffContrast (Nuke)  — Tone
154. MinColor (Nuke) ⓖ  — Tone
155. IBKColour clean-plate (Nuke) ⓖ  — Repair
156. MatchGrade (Nuke) ⓧ  — Color
157. LightWrap (Nuke) ⓧ  — Color
158. HueKeyer (Nuke)  — Analysis
159. Primatte keyer  — Analysis
160. Ultimatte keyer  — Analysis
161. IBKGizmo keyer (Nuke)  — Analysis
162. TVIScale total-variation upscale (Nuke) ⓖ  — Sharpen
163. MarkerRemoval (Nuke) ⓖ  — Repair
164. STMap UV remap (Nuke) ⓧ  — Distort
165. IDistort vector displace (Nuke) ⓧ  — Distort
166. ScannedGrain (Nuke) ⓧ  — Film

## Fusion 2 (7)

167. VariBlur (Fusion)  — Blur
168. Auto Gain (Fusion) ⓖ  — Tone
169. Dent (Fusion)  — Distort
170. Day Sky (Fusion)  — Render
171. Ultra Keyer (Fusion)  — Analysis
172. Z to World position (Fusion)  — Depth
173. Trails (Fusion) ⓧ  — Blur

## Image hashing (8)

174. Average hash (aHash) ⓖ  — Analysis
175. Perceptual hash (pHash, DCT) ⓖ  — Analysis
176. Difference hash (dHash) ⓖ  — Analysis
177. Wavelet hash (wHash) ⓖ  — Analysis
178. HSV colour hash (colorhash) ⓖ  — Analysis
179. Crop-resistant hash (segment-based) ⓖ  — Analysis
180. PDQ hash (Meta) ⓖ  — Analysis
181. Blockhash (Yang) ⓖ  — Analysis

## Colour vision deficiency (2)

182. Brettel 1997 dichromacy simulation  — Color
183. Viénot 1999 dichromacy simulation  — Color

## Optics 2 (2)

184. Mirror-lens donut bokeh  — Blur
185. Soap-bubble bokeh (Trioplan)  — Blur

## VSCO 2 (42)

186. VSCO 01 (Legacy)  — Insta
187. VSCO A1 (Analog Archetype)  — Insta
188. VSCO A4 (Analog Aesthetic)  — Insta
189. VSCO AGA1 (Agave)  — Insta
190. VSCO C4 (Chromatic)  — Insta
191. VSCO D1 (Distortia)  — Insta
192. VSCO DOG1 (Isle of Dogs)  — Insta
193. VSCO E1 (Essence)  — Insta
194. VSCO G4 (Portrait)  — Insta
195. VSCO H1 (Polychrome)  — Insta
196. VSCO IND1 (Indigo)  — Insta
197. VSCO INF (Infatuation)  — Insta
198. VSCO IR1 (Infrared Landscape)  — Insta
199. VSCO IR3 (Infrared Black & White)  — Insta
200. VSCO IR6 (Infrared cool foliage)  — Insta
201. VSCO JM1 (Jimmy Marble)  — Insta
202. VSCO K1 (Analog Classic)  — Insta
203. VSCO L1 (Landscape)  — Insta
204. VSCO LV2 (Levi's B&W)  — Insta
205. VSCO M1 (Mood: Underexposed)  — Insta
206. VSCO N1 (New Modern)  — Insta
207. VSCO NC (Neocha)  — Insta
208. VSCO OAK1 (Oakley PRIZM)  — Insta
209. VSCO OC (Opening Ceremony)  — Insta
210. VSCO P1 (Instant Warm)  — Insta
211. VSCO P4 (Instant Cool)  — Insta
212. VSCO P7 (Instant Classic)  — Insta
213. VSCO Q1 (Alchemy)  — Insta
214. VSCO S1 (Bright + Clean)  — Insta
215. VSCO S4 (Bright + Warm)  — Insta
216. VSCO SE1 (Street Etiquette)  — Insta
217. VSCO SS1 (Street Style)  — Insta
218. VSCO SUM1 (Sumac)  — Insta
219. VSCO TECH (black-red duotone)  — Insta
220. VSCO TK (Ta-Ku)  — Insta
221. VSCO U1 (Urban)  — Insta
222. VSCO V1 (Low-Contrast)  — Insta
223. VSCO X1 (B&W Fade)  — Insta
224. VSCO WE1 (We The Creators)  — Insta
225. VSCO MTV  — Insta
226. VSCO ACG (NikeLab)  — Insta
227. VSCO BBMA  — Insta

## Neural stylisation (25)

228. Fast neural style: Mosaic ⓜ  — Paint
229. Fast neural style: Candy ⓜ  — Paint
230. Fast neural style: Rain Princess ⓜ  — Paint
231. Fast neural style: Udnie ⓜ  — Paint
232. Fast neural style: Pointilism ⓜ  — Paint
233. Fast neural style: Wave (Hokusai) ⓜ  — Paint
234. Fast neural style: La Muse ⓜ  — Paint
235. Fast neural style: The Scream ⓜ  — Paint
236. Fast neural style: Shipwreck of the Minotaur ⓜ  — Paint
237. CycleGAN photo to Monet ⓜ  — Paint
238. CycleGAN photo to Van Gogh ⓜ  — Paint
239. CycleGAN photo to Cezanne ⓜ  — Paint
240. CycleGAN photo to Ukiyo-e ⓜ  — Paint
241. AdaIN arbitrary style transfer ⓜ  — Paint
242. WCT universal style transfer ⓜ  — Paint
243. SANet style-attentional transfer ⓜ  — Paint
244. AdaAttN style transfer ⓜ  — Paint
245. StyTr2 transformer style transfer ⓜ  — Paint
246. PhotoWCT photorealistic style transfer ⓜ  — Color
247. CycleGAN summer to winter ⓜ  — Color
248. CycleGAN iPhone to DSLR (shallow depth) ⓜ  — Color
249. CartoonGAN Hayao style ⓜ  — Stylize
250. CartoonGAN Hosoda style ⓜ  — Stylize
251. White-box Cartoonization ⓜ  — Stylize
252. Anime2Sketch line extraction ⓜ  — Edges

## G'MIC map projections (12)

253. Albers equal-area conic projection  — Distort
254. Azimuthal equidistant projection  — Distort
255. Equidistant conic projection  — Distort
256. Cylindrical equal-area projection  — Distort
257. Eckert IV projection  — Distort
258. Eckert VI projection  — Distort
259. Lambert azimuthal equal-area projection  — Distort
260. Lambert conformal conic projection  — Distort
261. Orthographic globe projection  — Distort
262. Sinusoidal (Sanson-Flamsteed) projection  — Distort
263. Triangular map projection (G'MIC)  — Distort
264. Rotate equirectangular map (G'MIC)  — Distort

## G'MIC community (59)

265. Colour Abstraction Paint (Arto Huotari)  — Paint
266. Morphology Painting (Arto Huotari)  — Paint
267. Make Squiggly (Arto Huotari)  — Paint
268. Illustration Look (G'MIC)  — Paint
269. Finger Paint (Garry Osgood)  — Paint
270. Hair Locks (Garry Osgood)  — Paint
271. Hedcut (Garry Osgood)  — Paint
272. Threshold Etch (Andy Kelday)  — Paint
273. Multi-Layer Etch (Andy Kelday)  — Paint
274. Black Crayon Graffiti (PhotoComiX)  — Paint
275. B&W Steampunk Pencil (PhotoComiX)  — Paint
276. Isophotes to watercolour (samj)  — Paint
277. Colour Space Swap (Joan Rake)  — Color
278. Hue Lighten/Darken (Iain Fergusson)  — Color
279. Saturation EQ (Iain Fergusson)  — Color
280. Dark Sky (afre)  — Color
281. Jpr Colour Illusion (James Prichard)  — Color
282. Rainbowify (Reptorian)  — Color
283. Gilding / Dorure (samj)  — Color
284. Auto-Gnarl (Joan Rake)  — Distort
285. PowerTwirl (Joan Rake)  — Distort
286. Spiral Matrix Transformation (Joan Rake)  — Distort
287. Layer Cake (Joan Rake)  — Distort
288. Rays from Image (Joan Rake)  — Distort
289. Jpr Warp from Threshold (James Prichard)  — Distort
290. Popcorn fractal warp (Reptorian)  — Distort
291. Rotate by Torus Map (Reptorian)  — Distort
292. Perspective Streak (Reptorian)  — Distort
293. Axis Streak (Reptorian)  — Distort
294. Pixel Push (Reptorian)  — Distort
295. Stitch Distort (Reptorian)  — Distort
296. Moon to panorama (G'MIC)  — Distort
297. Pseudo-ECB block-cipher glitch (Joan Rake)  — Retro
298. Faux-QAM glitch (Joan Rake)  — Retro
299. Sawtoother (Joan Rake)  — Retro
300. Shredder (Joan Rake)  — Retro
301. Superstreak (Joan Rake)  — Retro
302. Constrained Sharpen (Iain Fergusson)  — Sharpen
303. YAG Effect (Arto Huotari)  — Sharpen
304. Local Variance Normalization (G'MIC)  — Sharpen
305. Undo Unsharp Mask (G'MIC) ⓖ  — Sharpen
306. Banding Denoise (Iain Fergusson) ⓖ  — Repair
307. Clean Text (afre) ⓖ  — Repair
308. Recursive Median (Iain Fergusson) ⓖ  — Repair
309. Repair Scanned Document (G'MIC) ⓖ  — Repair
310. Unstrip (G'MIC) ⓖ  — Repair
311. Brown Spot Clean (G'MIC) ⓖ  — Repair
312. Jpr Oriented Thinning (James Prichard)  — Edges
313. Non-Convolution Edge Extraction (Reptorian)  — Edges
314. Autofill Coloring Book (Reptorian)  — Edges
315. Blur by Color (Garry Osgood)  — Edges
316. Jpr Specular Bumps (James Prichard)  — Materials
317. ABN Filigrees (Garry Osgood)  — Materials
318. Denim Texture (samj)  — Materials
319. Skin Mask (G'MIC)  — Analysis
320. Reverse Engineer Gradient Map (Reptorian) ⓖ  — Analysis
321. Automatic Depth Estimation (Tom Keil) ⓖ  — Depth
322. Undo Anaglyph (G'MIC) ⓖ  — Depth
323. Lenticular Print (Tom Keil) ⓧ  — Depth

## G'MIC math renders (16)

324. Penrose Tiling (G'MIC)  — Render
325. Hitomezashi stitch pattern  — Render
326. Markus-Lyapunov fractal  — Render
327. Hénon phase diagram  — Render
328. Chirikov-Taylor standard map  — Render
329. Harmonograph  — Render
330. Pintograph  — Render
331. Pythagoras tree  — Render
332. Chryzodes (G'MIC)  — Render
333. Cosmic Nebula (G'MIC)  — Render
334. Thorn Fractal / Secant Sea (Reptorian)  — Render
335. Neon Carpet (Claude Lion)  — Render
336. Tangential Circles (Claude Lion)  — Render
337. Ellsworth Kelly Board (Reptorian)  — Render
338. Tupper's self-referential formula  — Render
339. Diffusion-limited aggregation ⓖ  — Render

## Medical augmentation (MONAI / TorchIO) (14)

340. MRI motion artifact (TorchIO RandomMotion) ⓖ  — Augment
341. MRI ghosting artifact (TorchIO RandomGhosting) ⓖ  — Augment
342. MRI k-space spike artifact (TorchIO RandomSpike) ⓖ  — Augment
343. K-space spike noise (MONAI RandKSpaceSpikeNoise) ⓖ  — Augment
344. MRI bias-field simulation (TorchIO RandomBiasField)  — Augment
345. Rician noise (MONAI RandRicianNoise)  — Augment
346. Anisotropic resolution simulation (TorchIO RandomAnisotropy)  — Augment
347. Simulate low resolution (MONAI)  — Augment
348. Smooth-field contrast adjust (MONAI)  — Augment
349. Smooth-field intensity adjust (MONAI)  — Augment
350. Smooth-field deform (MONAI)  — Augment
351. Random intensity remap (MONAI)  — Augment
352. Random patch swap (TorchIO RandomSwap)  — Augment
353. Labels to image synthesis (TorchIO RandomLabelsToImage) ⓜ  — Augment

## BoltBait pack (1)

354. Sharpen Landscape (BoltBait)  — Sharpen

## PhotoDemon (10)

355. Figured Glass (PhotoDemon)  — Distort
356. Donut (PhotoDemon)  — Distort
357. Poke (PhotoDemon)  — Distort
358. Squish (PhotoDemon)  — Distort
359. Modern Art (PhotoDemon)  — Stylize
360. Black Light (PhotoDemon)  — Stylize
361. Atmosphere (PhotoDemon)  — Stylize
362. Ignite (PhotoDemon)  — Stylize
363. Portrait Glow (PhotoDemon)  — Stylize
364. Gradient Flow (PhotoDemon)  — Edges

## Photoshop Elements guided edits (2)

365. Speed Effect (Elements)  — Blur
366. Old Fashioned Photo (Elements)  — Film

## Corel Painter 2 (3)

367. Pop Art Fill (Painter)  — Stylize
368. Grid Paper (Painter)  — Stylize
369. Glass Distortion (Painter)  — Distort

## Textbook classics 4 (4)

370. Pixel difference gradient (Pratt)  — Edges
371. Separated pixel difference gradient (Pratt)  — Edges
372. Boxcar edge operator (Pratt)  — Edges
373. Truncated pyramid edge operator (Pratt)  — Edges

## Colormaps: IDL (31)

374. IDL Blue/White  — Analysis
375. IDL Grn-Red-Blu-Wht  — Analysis
376. IDL Red Temperature  — Analysis
377. IDL Blue/Green/Red/Yellow  — Analysis
378. IDL Std Gamma-II  — Analysis
379. IDL Prism  — Analysis
380. IDL Red-Purple  — Analysis
381. IDL Green/White Linear  — Analysis
382. IDL Grn/Wht Exponential  — Analysis
383. IDL Green-Pink  — Analysis
384. IDL 16 Level  — Analysis
385. IDL Steps  — Analysis
386. IDL Haze  — Analysis
387. IDL Blue-Pastel-Red  — Analysis
388. IDL Pastels  — Analysis
389. IDL Hue Sat Lightness  — Analysis
390. IDL Hue Sat Value  — Analysis
391. IDL Purple-Red + Stripes  — Analysis
392. IDL Beach  — Analysis
393. IDL Mac Style  — Analysis
394. IDL Eos A  — Analysis
395. IDL Eos B  — Analysis
396. IDL Hardcandy  — Analysis
397. IDL Nature  — Analysis
398. IDL Peppermint  — Analysis
399. IDL Blue Waves  — Analysis
400. IDL Volcano  — Analysis
401. IDL Waves  — Analysis
402. IDL Rainbow18  — Analysis
403. IDL Rainbow + white  — Analysis
404. IDL Rainbow + black  — Analysis

## Colormaps: Moreland / MATLAB (8)

405. Moreland Smooth Cool Warm  — Analysis
406. Moreland Bent Cool Warm  — Analysis
407. Moreland Black Body  — Analysis
408. Moreland Fast  — Analysis
409. Kindlmann colormap  — Analysis
410. Extended Kindlmann colormap  — Analysis
411. MATLAB sky colormap  — Analysis
412. MATLAB abyss colormap  — Analysis

## darktable 2 (3)

413. spektrafilm (darktable)  — Film
414. color equalizer (darktable)  — Color
415. unbreak input profile (darktable) ⓖ  — Color

## gThumb (5)

416. gThumb Arctic  — Insta
417. gThumb Cherry  — Insta
418. gThumb Mango  — Insta
419. gThumb Desert  — Insta
420. gThumb Blurred Edges  — Frames

## Retro 3 (computer graphics modes) (8)

421. C64 HiRes bitmap (2 colours per 8x8 cell) ⓖ  — Retro
422. C64 MultiColor bitmap (4 colours per 4x8 cell) ⓖ  — Retro
423. C64 FLI mode ⓖ  — Retro
424. C64 HiRes FLI mode ⓖ  — Retro
425. C64 IFLI interlaced mode ⓖ  — Retro
426. C64 MCI multicolour interlace ⓖ  — Retro
427. C64 Super Hires FLI (SHF) ⓖ  — Retro
428. Thomson MO5 8x1 colour clash ⓖ  — Retro

## G'MIC testing (community) (23)

429. Turbulent Halftone (Iain Fergusson)  — Stylize
430. Charred Plastic (Joan Rake)  — Stylize
431. Whirling Lines (Joan Rake)  — Stylize
432. Psychedelic Glasswork Tiler (PhotoComiX)  — Stylize
433. Metallic Stencils (PhotoComiX)  — Stylize
434. Sketchy Ellipses (Prawnsushi)  — Stylize
435. Complexion Burst (Reptorian)  — Stylize
436. Grouped Pixel Axis-Based Shift (Reptorian)  — Distort
437. Strange Bulger (Reptorian)  — Distort
438. Logarithmic Distortion (Reptorian)  — Distort
439. Tiled Zoom (Reptorian)  — Distort
440. Gaussian Blur by Color Space (Reptorian)  — Blur
441. Prime Surface (Reptorian)  — Render
442. Three-Coupled Oscillators (Reptorian)  — Render
443. Construction Material Texture (Reptorian)  — Materials
444. Color Modulo Texture (Reptorian)  — Materials
445. Binary Alternating Quaddro Texture (Reptorian)  — Materials
446. Random Rectangle Division (Reptorian)  — Stylize
447. Line Spam (Prawnsushi)  — Stylize
448. Little Boxy Things (Prawnsushi)  — Stylize
449. Color Stamp (PhotoComiX)  — Stylize
450. Spiral RGB (Martin Souphead)  — Stylize
451. Smoothelate (Prawnsushi)  — Blur
