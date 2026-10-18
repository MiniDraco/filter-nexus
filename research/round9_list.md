# Round 9 harvest: 494 techniques not yet in Filter Nexus

Checked against every filter and the 2368 app names in `filters.db` on 2026-10-17. 420 are buildable as GPU shaders (status `planned`); the rest are tracked as out of scope with the reason.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Upscalers (30)

1. Scale3x
2. Eagle
3. 2xSaI
4. Super 2xSaI
5. Super Eagle
6. hq2x
7. hq3x
8. hq4x
9. xBR
10. xBRZ
11. Super-xBR
12. ScaleFX
13. MMPX
14. SABR
15. Lanczos resampling
16. Mitchell-Netravali resampling
17. Catmull-Rom resampling
18. B-spline resampling
19. Jinc resampling
20. NEDI (edge-directed interpolation)
21. ICBI interpolation
22. FSR 1 EASU upscaling
23. AMD CAS (contrast adaptive sharpening)
24. Anime4K
25. ESRGAN / Real-ESRGAN ⓜ
26. waifu2x ⓜ
27. RAISR ⓜ
28. FSR RCAS sharpening
29. Pixel-art antialias (smooth pixels)
30. Bicubic sharpener (FSRCNN-style approx.)

## RetroArch shaders (27)

31. CRT-Royale
32. CRT-Geom
33. CRT-Lottes
34. CRT-Easymode
35. CRT-Guest-Advanced
36. Aperture grille mask
37. Slot mask
38. Phosphor persistence glow
39. CRT halation
40. NTSC composite (blargg)
41. NTSC dot crawl
42. RF interference
43. Dot matrix LCD
44. Handheld LCD ghosting
45. Vector display (Vectrex glow)
46. MDAPT dither blending
47. GTU (TV signal simulation)
48. Teletext mosaic
49. PETSCII art
50. ANSI art
51. Braille art
52. Matrix rain overlay
53. CRT curvature & corner rounding
54. Game Boy LCD grid
55. Game Boy Advance color
56. Arcade bezel reflection
57. Interlaced field blend

## Retro palettes (10)

58. ZX Spectrum (attribute clash)
59. Apple II hi-res artifacts
60. Virtual Boy red
61. NES palette
62. Commodore 64 palette
63. EGA palette
64. Amstrad CPC palette
65. MSX palette
66. Atari 2600 palette
67. Sega Master System palette

## Dithering (17)

68. Blue-noise (void-and-cluster) dither
69. Dot diffusion (Knuth)
70. Line dither
71. Stochastic dither
72. Atkinson dither ⓖ
73. Jarvis-Judice-Ninke dither ⓖ
74. Stucki dither ⓖ
75. Burkes dither ⓖ
76. Sierra dither ⓖ
77. Sierra Lite dither ⓖ
78. Riemersma dither ⓖ
79. Ostromoukhov variable-coefficient dither ⓖ
80. Yliluoma ordered palette dither
81. Knoll pattern dither
82. Interleaved gradient noise dither
83. Clustered-dot ordered dither
84. Crosshatch dither

## Film / alt process (39)

85. Van Dyke brown
86. Platinum/palladium print
87. Salt print
88. Gum bichromate
89. Daguerreotype
90. Tintype (wet plate collodion)
91. Autochrome
92. Technicolor 3-strip
93. Hand-tinted photograph
94. Redscale film
95. Cinestill 800T halation
96. Film halation
97. Film gate weave
98. Film burn
99. Ektachrome
100. Portra 400
101. Ektar 100
102. Provia 100F
103. Tri-X 400
104. Ilford HP5
105. Delta 3200 grain
106. Instax
107. Lith print
108. Selenium toning
109. Sepia toning (split)
110. Risograph print
111. Screen print (spot colors)
112. Lithograph
113. Aquatint
114. Drypoint etching
115. Woodcut
116. Linocut
117. Scratchboard
118. Gouache
119. Crayon
120. Impasto
121. Pen & ink stippling (screen-space)
122. Tile-based TSP art ⓖ
123. Weighted Voronoi stippling ⓖ

## Glitch (13)

124. Slit-scan
125. Bit crush
126. Byte corruption
127. Wave interference glitch
128. Hue sort
129. Mirror tiles
130. Block shift (macroblock)
131. Emoji mosaic
132. Signal noise bars
133. Datamosh (P-frame) ⓧ
134. Scanline displacement
135. Channel feedback smear
136. Time displacement ⓧ

## Tone mapping (14)

137. Reinhard-Devlin photoreceptor
138. Tumblin-Rushmeier
139. Schlick rational
140. Ferwerda visibility
141. Pattanaik adaptation
142. Kim-Kautz consistent
143. iCAM06
144. Khronos PBR Neutral
145. Unreal filmic
146. Tony McMapface
147. Hable piecewise power curves
148. Ashikhmin tone mapping
149. Logarithmic tone mapping
150. Ward histogram adjustment ⓖ

## Color science (26)

151. Oklab
152. Oklch
153. CIELUV
154. HunterLab
155. YIQ
156. YCoCg
157. IPT
158. ICtCp
159. Jzazbz
160. CAM16-UCS
161. HSI
162. c1c2c3 invariant
163. l1l2l3 invariant
164. CMYK separation
165. Color harmonization (template)
166. Hue shift by luminance
167. Gamut compression (ACES RGC)
168. Soft proof (paper white / ink black)
169. Median cut quantization ⓖ
170. Octree quantization ⓖ
171. Wu quantization ⓖ
172. NeuQuant ⓖ
173. Decorrelation stretch (global PCA) ⓖ
174. rg chromaticity
175. Opponent color space
176. Color temperature overlay

## Edges & features (39)

177. Shen-Castan (ISEF)
178. Deriche edge
179. Nevatia-Babu
180. Haralick facet edge
181. SUSAN edge
182. SUSAN corner
183. Förstner corner
184. Kitchen-Rosenfeld corner
185. Wang-Brady corner
186. Trajkovic corner
187. SIFT DoG keypoints
188. SURF box Hessian
189. CenSurE / STAR
190. KAZE nonlinear scale space
191. AKAZE (FED diffusion)
192. Phase stretch transform (PST)
193. Monogenic signal (local phase)
194. Steerable filters
195. Sub-pixel edge refinement
196. Optimally oriented flux
197. Jerman vesselness
198. Zana-Klein vessel
199. Hessian blobness
200. Edge thinning (non-max suppression)
201. Edge linking
202. LSD line segment detector ⓖ
203. EDLines ⓖ
204. MSER regions ⓖ
205. ORB keypoints ⓖ
206. BRISK keypoints ⓖ
207. HED (holistically-nested edges) ⓜ
208. Structured forest edges ⓜ
209. DexiNed ⓜ
210. PiDiNet ⓜ
211. Hessian-Laplace keypoints
212. Log-Gabor bank
213. Gradient vector flow
214. Compass gradient (8 directions)
215. Hysteresis thresholding

## Segmentation (20)

216. Su binarization
217. Howe binarization
218. Gatos binarization
219. Fuzzy c-means (fixed iterations)
220. Region growing (seeded, iterative)
221. Split and merge ⓖ
222. Connected component labeling ⓖ
223. Segment Anything ⓜ
224. Cellpose ⓜ
225. StarDist ⓜ
226. Kapur entropy threshold
227. Rosin unimodal threshold
228. Local entropy threshold
229. Morphological ACWE snakes
230. SEEDS superpixels
231. LSC superpixels
232. Felzenszwalb graph segmentation ⓖ
233. Quickshift ⓖ
234. Mean shift segmentation ⓖ
235. U-Net cell segmentation ⓜ

## Morphology (23)

236. Zhang-Suen thinning
237. Guo-Hall thinning
238. Hit-or-miss transform
239. Granulometry map
240. Rank filter (morphological)
241. Fill holes
242. Clear border objects
243. Geodesic distance
244. Medial axis
245. SKIZ (influence zones)
246. Leveling
247. Convex hull (iterative)
248. H-convex / H-concave
249. Skeleton pruning
250. Area closing
251. Path opening
252. Chamfer distance transform
253. Top-hat by reconstruction
254. Toggle contrast mapping
255. Morphological Laplacian
256. Morphological shock filter
257. Valued regional maxima
258. Grayscale grind peak

## Frequency (20)

259. Block DCT view (8×8)
260. DCT coefficient quantization
261. Walsh-Hadamard (block)
262. Haar wavelet decomposition
263. Gaussian pyramid view
264. Steerable pyramid
265. Contourlet-style directional bands
266. Riesz pyramid
267. FFT magnitude spectrum ⓖ
268. Wiener filter ⓖ
269. Inverse filter ⓖ
270. Cepstrum ⓖ
271. Daubechies wavelets ⓖ
272. Curvelet transform ⓖ
273. Shearlet transform ⓖ
274. Laplacian pyramid view
275. Wavelet denoise (BayesShrink, à trous)
276. Ideal low/high-pass (FFT) ⓖ
277. Gaussian low/high-pass (FFT) ⓖ
278. Spectral residual saliency ⓖ

## Restoration (38)

279. Bilinear demosaic
280. Malvar-He-Cutler demosaic
281. AHD demosaic
282. VNG demosaic
283. PPG demosaic
284. DCB demosaic
285. AMaZE demosaic
286. LMMSE demosaic
287. RCD demosaic
288. Menon demosaic
289. X-Trans demosaic (Markesteijn)
290. Halo removal
291. Haze-line dehaze
292. Moire removal
293. JPEG deblocking
294. Banding-aware deblur
295. PatchMatch fill ⓖ
296. Seam carving ⓖ
297. N4 bias field correction ⓖ
298. DeepPRIME ⓜ
299. Deblur GAN ⓜ
300. Colorization (DeOldify) ⓜ
301. Van Cittert deconvolution
302. Landweber deconvolution
303. Tikhonov deconvolution (iterative)
304. Total variation deconvolution
305. Telea inpainting (iterative)
306. Navier-Stokes inpainting (iterative)
307. Underwater color restoration (Sea-thru approx.)
308. Glare / specular removal
309. Deringing
310. Rolling shutter correction (global skew)
311. Lens vignetting correction
312. Lens distortion correction (Brown-Conrady)
313. Perspective / keystone correction
314. Criminisi exemplar inpainting ⓖ
315. Blind deconvolution ⓖ
316. LaMa inpainting ⓜ

## Lighting & depth (29)

317. HBAO
318. GTAO
319. Rim light
320. Fresnel glow
321. Caustics
322. Refraction (normal-based)
323. Heat haze
324. Underwater wobble
325. Mirage
326. Lens dirt
327. Star filter (cross-screen)
328. Diffraction spikes
329. Volumetric light (depth-aware)
330. Eye adaptation (local)
331. Depth edges
332. Fake shadow from depth
333. Optical flow ⓧ
334. Stereo disparity (block matching) ⓧ
335. Focus stacking ⓧ
336. HDR merge ⓧ
337. Panorama stitching ⓧ
338. Screen-space shadows
339. Subsurface scattering approx.
340. Chromatic dispersion
341. Anamorphic lens flare
342. Depth-based saturation
343. Curvature from depth
344. Depth posterize (contour lines)
345. Tilt-shift from depth

## Texture nodes (44)

346. Dirt mask
347. Directional warp
348. Slope blur
349. Non-uniform blur
350. Make it tile (seamless)
351. Height blend
352. Normal blend (RNM)
353. Normal blend (UDN)
354. Normal blend (whiteout)
355. Vector warp
356. Multi-directional warp
357. Shape glow
358. Cartesian to polar
359. Color to mask
360. Emboss with gloss
361. Anisotropic noise
362. Gaussian spots
363. Worley F1
364. Worley F2-F1
365. Billow noise
366. Gabor noise
367. Wavelet noise
368. Domain warping
369. Curl noise
370. Flow noise
371. Wood grain
372. Brick generator
373. Tile generator
374. Weave generator
375. Scratches generator
376. Leather
377. Fabric weave
378. Rust mask
379. Moss mask
380. Flood fill (per-island) ⓖ
381. Tile sampler (scatter) ⓖ
382. Histogram scan
383. Histogram range
384. Histogram shift
385. Normal normalize
386. Crystal noise
387. Voronoi fractal
388. Ridged multifractal
389. Hexagon pattern

## Sensors (47)

390. Waveform monitor
391. Vectorscope
392. RGB parade
393. Tenengrad sharpness
394. Vollath F4
395. Colorfulness (Hasler-Süsstrunk)
396. Edge density map
397. Image complexity map
398. Lacunarity
399. Local phase quantization (LPQ)
400. Completed LBP (CLBP)
401. Rotation-invariant uniform LBP
402. LBP variance (LBPV)
403. Weber local descriptor (WLD)
404. DAISY descriptor field
405. Dense SIFT field
406. Hurst exponent map
407. Wavelet energy map
408. Rule-of-thirds overlay
409. Golden ratio overlay
410. Symmetry map
411. Horizon tilt map
412. Sky mask (color + position)
413. Window / level (medical)
414. Intensity windowing (ITK)
415. Shift-scale (ITK)
416. Fourier descriptors ⓖ
417. Vanishing point detection ⓖ
418. 3D LUT apply (.cube) ⓖ
419. Monocular depth (MiDaS) ⓜ
420. Pose estimation ⓜ
421. Face landmarks ⓜ
422. Laplacian variance sharpness
423. Brenner gradient
424. RMS contrast map
425. Michelson contrast map
426. Frequency-tuned saliency (Achanta)
427. Itti-Koch saliency
428. Boolean map saliency
429. Fine-grained saliency (Montabone)
430. Local ternary patterns (LTP)
431. Local directional pattern (LDP)
432. Local gradient pattern
433. Sigmoid intensity transform (ITK)
434. Image moments / Hu moments ⓖ
435. Surface normals (Omnidata) ⓜ
436. Semantic segmentation ⓜ

## ITK (14)

437. Recursive Gaussian (Deriche)
438. Patch-based denoising (ITK)
439. Confidence connected (iterative)
440. Geodesic active contour (fixed iterations)
441. Shape detection level set
442. Signed Maurer distance
443. Binary pruning
444. Curvature anisotropic diffusion
445. Gradient anisotropic diffusion
446. Min-max curvature flow
447. Curvature flow
448. Laplacian sharpening (ITK)
449. Danielsson distance map
450. Label contours

## Photo apps (44)

451. Sky enhancer
452. Accent (auto local tone)
453. Mystical
454. Sunrays
455. Matte look
456. Golden hour
457. Dramatic (Luminar)
458. ClearView dehaze
459. Smart Lighting
460. Skin tone uniformity
461. Color editor (hue-range)
462. Color zones
463. Rotate colors (range)
464. Color exchange
465. Value invert
466. Linear invert
467. Mono mixer
468. Tile glass
469. Erase every other row
470. Dream smoothing
471. Graphic novel
472. Triangulation (Delaunay look)
473. Liquid chrome
474. Holographic foil
475. Iridescence
476. Blueprint
477. Ink bleed
478. Embroidery
479. Cross-stitch
480. LEGO mosaic
481. Knitting
482. Paper cutout (layers)
483. Isometric pixel
484. Voxelize look
485. ASCII color
486. Text portrait
487. Microcontrast
488. Stretch contrast HSV
489. Spiral pattern
490. Octave sharpening
491. Inverse diffusion sharpening
492. Texture sharpening
493. Plaid texture
494. Seamless deco
