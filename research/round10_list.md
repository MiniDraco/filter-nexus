# Round 10 harvest: 870 techniques not yet in Filter Nexus

Checked by `research/dedupe10.py` against every filter, engine id and alias name in `filters.db` and all 494 round-9 names. 653 are buildable as GPU shaders; 137 need whole-image/sequential work, 44 need a neural net, 36 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Blend modes (48)

1. Blend: Dissolve  — Color
2. Blend: Darken  — Color
3. Blend: Multiply  — Color
4. Blend: Color Burn  — Color
5. Blend: Linear Burn  — Color
6. Blend: Darker Color  — Color
7. Blend: Lighten  — Color
8. Blend: Screen  — Color
9. Blend: Color Dodge  — Color
10. Blend: Linear Dodge (Add)  — Color
11. Blend: Lighter Color  — Color
12. Blend: Overlay  — Color
13. Blend: Soft Light  — Color
14. Blend: Hard Light  — Color
15. Blend: Vivid Light  — Color
16. Blend: Linear Light  — Color
17. Blend: Pin Light  — Color
18. Blend: Hard Mix  — Color
19. Blend: Difference  — Color
20. Blend: Exclusion  — Color
21. Blend: Subtract  — Color
22. Blend: Divide  — Color
23. Blend: Hue  — Color
24. Blend: Saturation  — Color
25. Blend: Color  — Color
26. Blend: Luminosity  — Color
27. Blend: Grain Extract  — Color
28. Blend: Grain Merge  — Color
29. Blend: LCh Chroma  — Color
30. Blend: LCh Lightness  — Color
31. Blend: Negation  — Color
32. Blend: Reflect  — Color
33. Blend: Glow  — Color
34. Blend: Freeze  — Color
35. Blend: Heat  — Color
36. Blend: Geometric Mean  — Color
37. Blend: Interpolation  — Color
38. Blend: Parallel  — Color
39. Blend: Allanon  — Color
40. Blend: Pegtop Soft Light  — Color
41. Blend: Gamma Dark  — Color
42. Blend: Gamma Light  — Color
43. Blend: Penumbra  — Color
44. Blend: Arcus Tangent  — Color
45. Blend: Equivalence  — Color
46. Blend: Additive-Subtractive  — Color
47. Blend: Hard Overlay  — Color
48. Blend: Super Light  — Color

## Film stocks (45)

49. Kodak Portra 160  — Film
50. Kodak Portra 800  — Film
51. Kodak Gold 200  — Film
52. Kodak ColorPlus 200  — Film
53. Kodak UltraMax 400  — Film
54. Kodak T-Max 100  — Film
55. Kodak T-Max 400  — Film
56. Kodak T-Max P3200  — Film
57. Kodak Plus-X 125  — Film
58. Kodak Vision3 250D  — Film
59. Kodak Vision3 500T  — Film
60. Kodak Vision3 50D  — Film
61. Kodak 2383 print film  — Film
62. Kodak 2393 print film  — Film
63. Kodak Elite Chrome 100  — Film
64. Kodak BW400CN  — Film
65. Fuji Pro 400H  — Film
66. Fuji Superia X-tra 400  — Film
67. Fujicolor C200  — Film
68. Fuji Astia 100F  — Film
69. Fuji Sensia 100  — Film
70. Fuji Neopan Acros 100  — Film
71. Fuji Natura 1600  — Film
72. Fuji FP-100C  — Film
73. Agfa Vista 200  — Film
74. Agfa Precisa 100  — Film
75. Agfa APX 100  — Film
76. Agfa Scala 200  — Film
77. Agfa Ultra 100  — Film
78. Agfachrome RSX 200  — Film
79. Ilford FP4 Plus  — Film
80. Ilford Delta 100  — Film
81. Ilford Pan F Plus 50  — Film
82. Ilford XP2 Super  — Film
83. Kentmere 400  — Film
84. Fomapan 100  — Film
85. Rollei Retro 80S  — Film
86. Lomochrome Purple  — Film
87. Lomochrome Metropolis  — Film
88. Lomochrome Turquoise  — Film
89. CineStill 50D  — Film
90. CineStill 400D  — Film
91. Harman Phoenix 200  — Film
92. Polaroid 669 peel-apart  — Film
93. Lomography X-Pro Slide 200  — Film

## Fujifilm film simulation (8)

94. Classic Chrome  — Film
95. Classic Negative  — Film
96. Nostalgic Neg.  — Film
97. Reala Ace  — Film
98. Eterna (cinema)  — Film
99. Pro Neg. Hi  — Film
100. Pro Neg. Std  — Film
101. Astia / Soft  — Film

## Darkroom / alt process (24)

102. Albumen print  — Film
103. Ambrotype  — Film
104. Carbon print  — Film
105. Bromoil  — Film
106. Kallitype  — Film
107. Chrysotype  — Film
108. Anthotype  — Film
109. Photogram  — Film
110. Mordançage  — Film
111. Sabattier effect (Mackie lines)  — Film
112. Ziatype  — Film
113. Gold toning  — Film
114. Copper toning  — Film
115. Pinhole camera  — Film
116. Toy camera (Holga)  — Film
117. ENR process  — Film
118. CCE (color contrast enhancement)  — Film
119. Push processing  — Film
120. Expired film  — Film
121. Super 8 look  — Film
122. Film dust & hair overlay  — Film
123. Polaroid image transfer  — Film
124. Box camera  — Film
125. ARRI K1S1 look  — Film

## Core Image (53)

126. CIGloom  — Stylize
127. CIEdgeWork  — Edges
128. CILineOverlay  — Edges
129. CIHoleDistortion  — Distort
130. CILightTunnel  — Distort
131. CICircleSplashDistortion  — Distort
132. CICircularWrap  — Distort
133. CIGlassLozenge  — Distort
134. CITorusLensDistortion  — Distort
135. CIVortexDistortion  — Distort
136. CIBumpDistortionLinear  — Distort
137. CIStretchCrop  — Distort
138. CIOpTile  — Distort
139. CIParallelogramTile  — Distort
140. CIPerspectiveTile  — Distort
141. CIEightfoldReflectedTile  — Distort
142. CIFourfoldRotatedTile  — Distort
143. CIFourfoldTranslatedTile  — Distort
144. CIGlideReflectedTile  — Distort
145. CISixfoldRotatedTile  — Distort
146. CITwelvefoldReflectedTile  — Distort
147. CITriangleKaleidoscope  — Distort
148. CITriangleTile  — Distort
149. CIAffineClamp  — Distort
150. CIHeightFieldFromMask  — Depth
151. CIShadedMaterial  — Materials
152. CISpotColor  — Color
153. CISpotLight  — Render
154. CIColorCrossPolynomial  — Color
155. CIMaskToAlpha  — Color
156. CIPhotoEffectChrome  — Insta
157. CIPhotoEffectFade  — Insta
158. CIPhotoEffectInstant  — Insta
159. CIPhotoEffectProcess  — Insta
160. CIPhotoEffectTonal  — Insta
161. CIPhotoEffectTransfer  — Insta
162. CIGaborGradients  — Edges
163. CILenticularHaloGenerator  — Render
164. CIStarShineGenerator  — Render
165. CICircularScreen  — Retro
166. CILinearToSRGBToneCurve  — Tone
167. CIPaletteCentroid ⓖ  — Analysis
168. CIRowAverage ⓖ  — Analysis
169. CIColumnAverage ⓖ  — Analysis
170. CISaliencyMapFilter ⓜ  — Analysis
171. CIPersonSegmentation ⓜ  — Analysis
172. CIAccordionFoldTransition ⓧ  — Distort
173. CICopyMachineTransition ⓧ  — Distort
174. CIBarsSwipeTransition ⓧ  — Distort
175. CIModTransition ⓧ  — Distort
176. CIRippleTransition ⓧ  — Distort
177. CIDisintegrateWithMaskTransition ⓧ  — Distort
178. CILabDeltaE ⓧ  — Analysis

## After Effects (73)

179. Colorama  — Color
180. Tritone  — Color
181. Broadcast Colors  — Color
182. Channel Blur  — Blur
183. Turbulent Displace  — Distort
184. Bezier Warp  — Distort
185. Motion Tile  — Distort
186. Roughen Edges  — Stylize
187. Color Emboss  — Stylize
188. Radio Waves  — Render
189. Vegas (outline stroke)  — Stylize
190. Radial Shadow  — Depth
191. CC Ball Action  — Distort
192. CC Bend It  — Distort
193. CC Bender  — Distort
194. CC Blobbylize  — Distort
195. CC Color Offset  — Color
196. CC Cross Blur  — Blur
197. CC Cylinder  — Distort
198. CC Flo Motion  — Distort
199. CC Glass  — Materials
200. CC Griddler  — Distort
201. CC HexTile  — Stylize
202. CC Light Burst 2.5  — Render
203. CC Light Sweep  — Render
204. CC Plastic  — Materials
205. CC Ripple Pulse  — Distort
206. CC Slant  — Distort
207. CC Smear  — Distort
208. CC Split  — Distort
209. CC Star Burst  — Render
210. CC Threshold RGB  — Tone
211. CC Toner  — Color
212. CC Vector Blur  — Blur
213. CC Mr. Smoothie  — Stylize
214. CC Overbrights  — Tone
215. CC Color Neutralizer  — Color
216. CC Simple Wire Removal  — Repair
217. CC Environment  — Render
218. CC Spotlight  — Render
219. Noise HLS  — Noise
220. Noise Alpha  — Noise
221. Matte Choker  — Color
222. Simple Choker  — Color
223. Spill Suppressor  — Color
224. Color Difference Key  — Color
225. Keylight  — Color
226. Linear Color Key  — Color
227. Card Dance  — Distort
228. 4-Color Gradient  — Render
229. Reduce Interlace Flicker  — Repair
230. Set Matte  — Color
231. Beam  — Render
232. Remove Grain ⓖ  — Repair
233. Color Link ⓖ  — Color
234. Refine Soft Matte ⓖ  — Color
235. Eyedropper Fill ⓖ  — Color
236. Wave World ⓖ  — Render
237. Pixel Motion Blur ⓧ  — Stylize
238. Time Difference ⓧ  — Analysis
239. Echo ⓧ  — Stylize
240. Posterize Time ⓧ  — Stylize
241. Timewarp ⓧ  — Stylize
242. Strobe Light ⓧ  — Stylize
243. Card Wipe ⓧ  — Stylize
244. Venetian Blinds ⓧ  — Stylize
245. Gradient Wipe ⓧ  — Stylize
246. Block Dissolve ⓧ  — Stylize
247. Camera Shake Deblur ⓧ  — Repair
248. CC Block Load ⓧ  — Stylize
249. CC Twister ⓧ  — Stylize
250. Match Grain ⓧ  — Stylize
251. Difference Matte ⓧ  — Analysis

## Resolve / Fusion (29)

252. Aperture Diffraction  — Render
253. Analog Damage  — Retro
254. Film Damage  — Stylize
255. Lens Reflections  — Render
256. Prism Blur  — Blur
257. Contrast Pop  — Tone
258. Texture Pop  — Sharpen
259. Color Compressor  — Color
260. Gamut Limiter  — Color
261. Mirrors (ResolveFX)  — Distort
262. Blanking Fill  — Repair
263. Warper  — Distort
264. Patch Replacer  — Repair
265. Film Look Creator  — Tone
266. Printer lights  — Color
267. Color Warper  — Color
268. Color density (subtractive saturation)  — Color
269. Lift / Gamma / Gain  — Color
270. Pseudo Color (Fusion)  — Color
271. Drip (Fusion)  — Distort
272. Hot Spot (Fusion)  — Render
273. Highlight (Fusion glints)  — Render
274. Defocus Background (ResolveFX) ⓜ  — Depth
275. Magic Mask ⓜ  — Analysis
276. Face Refinement ⓜ  — Repair
277. Flicker Addition ⓧ  — Stylize
278. Dust Buster ⓧ  — Repair
279. Deflicker ⓧ  — Repair
280. Object Removal (ResolveFX) ⓧ  — Repair

## Nuke (5)

281. Glint  — Render
282. EdgeBlur  — Blur
283. Log2Lin (Cineon log decode)  — Tone
284. HueCorrect  — Color
285. Toe (Nuke)  — Tone

## Blender compositor (9)

286. Glare: Streaks  — Render
287. Glare: Fog Glow  — Blur
288. Glare: Ghosts  — Render
289. Diamond Sharpen  — Sharpen
290. Box Sharpen  — Sharpen
291. SMAA anti-aliasing  — Sharpen
292. FXAA  — Sharpen
293. Rh Simple tone map  — Tone
294. Double Edge Mask ⓧ  — Analysis

## Game post-process (14)

295. Panini projection  — Distort
296. Shadows-Midtones-Highlights wheels  — Color
297. Local Exposure (Unreal)  — Tone
298. Image-based lens flare ghosts  — Render
299. Screen-space reflections  — Depth
300. Screen-space global illumination  — Depth
301. FFT convolution bloom  — Blur
302. Kawase blur  — Blur
303. Dual Kawase blur  — Blur
304. Circular separable DOF (Garcia)  — Depth
305. TCAMv2 (FilmLight)  — Tone
306. OpenDRT  — Tone
307. Histogram auto-exposure ⓖ  — Tone
308. Temporal anti-aliasing (TAA) ⓧ  — Render

## ReShade (18)

309. LumaSharpen  — Sharpen
310. FakeHDR  — Stylize
311. Nostalgia (SweetFX)  — Stylize
312. DPX (Cineon look)  — Tone
313. Explosion (SweetFX)  — Stylize
314. AmbientLight (ReShade)  — Render
315. Emphasize (depth)  — Depth
316. SSDO (screen-space directional occlusion)  — Depth
317. Depth-aware Smart Sharp  — Sharpen
318. Depth Cues (AstrayFX)  — Depth
319. NFAA (normal-filter anti-aliasing)  — Sharpen
320. Colourfulness (CeeJay)  — Color
321. Saturation Limiter (prod80)  — Color
322. Depth Slicer (prod80)  — Depth
323. Glamarye Fast Effects  — Stylize
324. SuperDepth3D  — Depth
325. Cinematic DOF (Marty McFly)  — Depth
326. RTGI (ray-traced GI) ⓧ  — Depth

## RetroArch / mpv shaders (60)

327. crt-hyllian  — Retro
328. crt-pi  — Retro
329. crt-aperture  — Retro
330. crt-mattias  — Retro
331. zfast-crt  — Retro
332. crt-sines  — Retro
333. crt-nobody  — Retro
334. crt-frutbunn  — Retro
335. crt-caligari  — Retro
336. crt-cgwg-fast  — Retro
337. crt-yeetron  — Retro
338. crt-1tap  — Retro
339. crt-consumer  — Retro
340. newpixie-crt  — Retro
341. koko-aio  — Retro
342. Mega Bezel  — Retro
343. ntsc-md-rainbows  — Retro
344. Maister NTSC  — Retro
345. lcd-cgwg  — Retro
346. lcd3x  — Retro
347. zfast-lcd  — Retro
348. Harlequin Game Boy shader  — Retro
349. nds-color  — Retro
350. psp-color  — Retro
351. sgenpt-mix  — Retro
352. omniscale  — Sharpen
353. sharp-shimmerless  — Sharpen
354. bandlimit-pixel  — Sharpen
355. cleanEdge  — Sharpen
356. AA shader 4.o  — Sharpen
357. ddt (diagonal-directed triangle) scaler  — Sharpen
358. Deposterize  — Repair
359. Checkerboard dedither  — Repair
360. PS1 dedither  — Repair
361. Tvout-tweaks  — Retro
362. RAVU  — Sharpen
363. SSimSuperRes  — Sharpen
364. SSimDownscaler  — Sharpen
365. KrigBilateral  — Color
366. CfL (chroma from luma)  — Color
367. AdaptiveSharpen  — Sharpen
368. Spline36 resampling  — Sharpen
369. Spline64 resampling  — Sharpen
370. Robidoux (EWA)  — Sharpen
371. Ginseng (EWA)  — Sharpen
372. Hermite resampling  — Sharpen
373. Haasnsoft  — Sharpen
374. BT.2390 tone mapping  — Retro
375. BT.2446a tone mapping  — Retro
376. Spline tone mapping (libplacebo)  — Retro
377. ST 2094-40 tone mapping  — Retro
378. Mobius tone mapping  — Retro
379. Perceptual gamut mapping (libplacebo)  — Color
380. Gamut highlight  — Tone
381. Contrast recovery (libplacebo)  — Tone
382. AV1 film grain synthesis  — Noise
383. H.274 film grain  — Noise
384. NNEDI3 ⓜ  — Sharpen
385. FSRCNNX ⓜ  — Sharpen
386. ArtCNN ⓜ  — Sharpen

## ImageMagick (21)

387. Nonpeak statistic filter  — Edges
388. RMS statistic filter  — Analysis
389. Thickening (morphology)  — Edges
390. Internal / external morphological gradient  — Edges
391. Comet kernel blur  — Blur
392. Binomial blur  — Blur
393. Chebyshev distance transform  — Analysis
394. Blue shift (scotopic night)  — Color
395. Color cycling (palette rotation)  — Color
396. Raise (3D button edge)  — Frames
397. Arc distortion  — Distort
398. Shepards distortion  — Distort
399. Polynomial distortion  — Distort
400. Cylinder2Plane / Plane2Cylinder  — Distort
401. Modulus add (wraparound)  — Stylize
402. Random threshold  — Retro
403. Adaptive blur  — Blur
404. Laplacian noise  — Noise
405. Sparse color: Shepards  — Render
406. Auto gamma ⓖ  — Tone
407. Summed-area table (integral image) ⓖ  — Analysis

## libvips (4)

408. Wallis filter (statistical differencing)  — Tone
409. Zone plate  — Render
410. Smart crop (attention) ⓖ  — Analysis
411. Fill nearest ⓖ  — Repair

## OpenCV (21)

412. DCT denoising (Yu-Sapiro)  — Repair
413. Adaptive manifold filter  — Blur
414. Bilateral texture filter  — Blur
415. Paillou gradient  — Edges
416. Weighted median filter  — Blur
417. BrightEdges  — Edges
418. BIMEF (bio-inspired multi-exposure fusion)  — Tone
419. Frequency-selective reconstruction inpaint (FSR) ⓖ  — Repair
420. Contrast-preserving decolorization (decolor) ⓖ  — Color
421. illuminationChange ⓖ  — Tone
422. textureFlattening ⓖ  — Repair
423. colorChange ⓖ  — Color
424. Fast bilateral solver ⓖ  — Blur
425. Fast line detector (Lee) ⓖ  — Edges
426. EdgeBoxes ⓖ  — Analysis
427. Pei-Lin normalization ⓖ  — Tone
428. Selective search regions ⓖ  — Analysis
429. ScanSegment superpixels ⓖ  — Analysis
430. Learning-based white balance ⓜ  — Color
431. seamlessClone (Poisson blending) ⓧ  — Repair
432. MergeMertens ⓧ  — Repair

## scikit-image (20)

433. Farid derivative filter  — Edges
434. Local autolevel (rank)  — Tone
435. Morphological contrast enhancement (rank)  — Tone
436. Bilateral mean (rank)  — Blur
437. Shape index (Koenderink)  — Sensor
438. Multiscale basic features  — Sensor
439. Peak local max  — Sensor
440. Inverse Gaussian gradient  — Edges
441. Unsupervised Wiener ⓖ  — Repair
442. Phase unwrapping ⓖ  — Sensor
443. Biharmonic inpainting ⓖ  — Repair
444. Cycle spinning ⓖ  — Repair
445. Diameter opening / closing ⓖ  — Edges
446. Max-tree (component tree) ⓖ  — Edges
447. Active contour (Kass snake) ⓖ  — Analysis
448. Expand labels ⓖ  — Analysis
449. Inverse Radon (filtered back-projection) ⓖ  — Sensor
450. Hough ellipse ⓖ  — Sensor
451. Blur effect metric (Crété-Roffet) ⓖ  — Sensor
452. Split Bregman TV denoise ⓖ  — Repair

## Sensors 2 (22)

453. Curvedness (Koenderink)  — Sensor
454. NGTDM texture  — Sensor
455. Local Moran's I  — Sensor
456. Getis-Ord Gi*  — Sensor
457. Local semivariance  — Sensor
458. Peli band-limited contrast  — Sensor
459. Sum-modified Laplacian (SML)  — Sensor
460. GLRLM run-length texture ⓖ  — Sensor
461. GLSZM size-zone texture ⓖ  — Sensor
462. Local self-similarity (Shechtman) ⓖ  — Sensor
463. Zernike moments ⓖ  — Sensor
464. Feature congestion clutter (Rosenholtz) ⓖ  — Sensor
465. CPBD blur metric ⓖ  — Sensor
466. Noise level estimation (Immerkær) ⓖ  — Sensor
467. GBVS saliency ⓖ  — Sensor
468. Image signature saliency ⓖ  — Sensor
469. Context-aware saliency (Goferman) ⓖ  — Sensor
470. Histogram contrast saliency (Cheng) ⓖ  — Sensor
471. Minimum barrier saliency (MB+) ⓖ  — Sensor
472. AIM saliency (Bruce-Tsotsos) ⓖ  — Sensor
473. PQFT saliency ⓖ  — Sensor
474. Viola-Jones face detection ⓖ  — Sensor

## ImageJ / Fiji (11)

475. Tubeness  — Edges
476. Remove Outliers  — Repair
477. Directional filtering (MorphoLibJ)  — Edges
478. Local thickness ⓖ  — Sensor
479. Find Maxima (prominence) ⓖ  — Sensor
480. PURE-LET denoise ⓖ  — Repair
481. Statistical region merging (SRM) ⓖ  — Analysis
482. Distance transform watershed ⓖ  — Analysis
483. Trainable Weka Segmentation ⓜ  — Analysis
484. Noise2Void ⓜ  — Repair
485. CARE restoration ⓜ  — Repair

## MATLAB IPT (8)

486. edgetaper  — Repair
487. bwmorph hbreak  — Edges
488. bwmorph bridge  — Edges
489. PIQE quality map  — Analysis
490. imsegfmm (fast marching segmentation) ⓖ  — Repair
491. NIQE quality score ⓖ  — Analysis
492. PCA illuminant estimation (Cheng) ⓖ  — Color
493. BRISQUE quality score ⓜ  — Analysis

## ITK (11)

494. Objectness measure (Antiga)  — Edges
495. Bounded reciprocal  — Tone
496. Voting binary hole filling  — Repair
497. Canny segmentation level set ⓖ  — Analysis
498. Laplacian segmentation level set ⓖ  — Analysis
499. Threshold segmentation level set ⓖ  — Analysis
500. Isolated connected ⓖ  — Analysis
501. Neighborhood connected ⓖ  — Analysis
502. Fast marching (arrival time) ⓖ  — Analysis
503. Colliding fronts ⓖ  — Analysis
504. Coherence-enhancing diffusion (Weickert) ⓖ  — Blur

## Astro (PixInsight / Siril) (17)

505. Generalized hyperbolic stretch (GHS)  — Tone
506. ACDNR  — Repair
507. Dark Structure Enhance  — Sharpen
508. Range selection mask  — Analysis
509. Unpurple (star halo)  — Color
510. HDRMultiscaleTransform ⓖ  — Tone
511. MultiscaleMedianTransform ⓖ  — Repair
512. MultiscaleLinearTransform ⓖ  — Repair
513. TGV denoise ⓖ  — Repair
514. MaskedStretch ⓖ  — Tone
515. BackgroundNeutralization ⓖ  — Color
516. MureDenoise ⓖ  — Repair
517. CanonBandingReduction ⓖ  — Repair
518. NL-Bayes denoise ⓖ  — Repair
519. NoiseXTerminator ⓜ  — Repair
520. BlurXTerminator ⓜ  — Repair
521. PhotometricColorCalibration ⓧ  — Color

## Remote sensing (RGB) (15)

522. ExR (excess red)  — Sensor
523. ExB (excess blue)  — Sensor
524. VEG (Hague vegetative index)  — Sensor
525. COM (combined vegetation index)  — Sensor
526. GCC (green chromatic coordinate)  — Sensor
527. NDI (Woebbecke)  — Sensor
528. Woebbecke index (WI)  — Sensor
529. MExG (modified excess green)  — Sensor
530. IKAW (Kawashima index)  — Sensor
531. NGBDI  — Sensor
532. MPRI  — Sensor
533. VDVI  — Sensor
534. RGRI (red-green ratio)  — Sensor
535. Redness index (soil)  — Sensor
536. NDTI (turbidity, red-green)  — Sensor

## Document (5)

537. Bataineh threshold  — Analysis
538. Page dewarping ⓖ  — Repair
539. Bleed-through removal ⓖ  — Repair
540. RLSA (run-length smoothing) ⓖ  — Analysis
541. Black border removal (scans) ⓖ  — Repair

## Microscopy / medical (4)

542. Macenko stain normalization ⓖ  — Color
543. Vahadane stain normalization ⓖ  — Color
544. À trous wavelet spot detection (Olivo-Marin) ⓖ  — Sensor
545. OSRAD (oriented SRAD) ⓖ  — Repair

## SAR speckle (3)

546. Enhanced Lee filter  — Repair
547. Enhanced Frost filter  — Repair
548. IDAN filter ⓖ  — Repair

## Textbook classics (35)

549. Intensity-level slicing  — Tone
550. Piecewise-linear contrast stretch  — Tone
551. Highboost filtering  — Sharpen
552. Adaptive median filter  — Repair
553. Adaptive local noise reduction filter  — Repair
554. Intensity slicing pseudocolor  — Color
555. Color slicing  — Color
556. Hybrid median filter  — Repair
557. Nagao-Matsuyama filter  — Blur
558. Tomita-Tsuji filter  — Blur
559. Gradient inverse weighted smoothing  — Blur
560. K-nearest-neighbour smoothing (Davis-Rosenfeld)  — Blur
561. Truncated median filter  — Repair
562. Edge-avoiding à-trous wavelets (Dammertz)  — Blur
563. Bilateral grid  — Blur
564. Di Zenzo color gradient  — Edges
565. Cubic unsharp masking (Ramponi)  — Sharpen
566. GIST descriptor  — Analysis
567. Constrained least squares filtering ⓖ  — Repair
568. Edge-avoiding wavelets (Fattal) ⓖ  — Blur
569. Texture synthesis (Efros-Leung) ⓖ  — Materials
570. Image quilting (Efros-Freeman) ⓖ  — Materials
571. Heeger-Bergen pyramid texture synthesis ⓖ  — Materials
572. Portilla-Simoncelli texture synthesis ⓖ  — Materials
573. Shape from shading ⓖ  — Depth
574. Hyper-Laplacian deconvolution (Krishnan-Fergus) ⓖ  — Repair
575. Normalized cuts ⓖ  — Analysis
576. Spectral matting ⓖ  — Analysis
577. Rank leveling ⓖ  — Tone
578. Maximum entropy deconvolution ⓖ  — Repair
579. Rothwell edge detector ⓖ  — Edges
580. Bergholm edge focusing ⓖ  — Edges
581. gPb (global probability of boundary) ⓖ  — Edges
582. Photometric stereo ⓧ  — Depth
583. Hybrid images (Oliva) ⓧ  — Tone

## Contrast enhancement (12)

584. BBHE (bi-histogram equalization) ⓖ  — Tone
585. DSIHE (dualistic sub-image HE) ⓖ  — Tone
586. AGCWD (adaptive gamma, weighted distribution) ⓖ  — Tone
587. CVC (contextual & variational contrast) ⓖ  — Tone
588. LDR (layered difference representation) ⓖ  — Tone
589. NPE (naturalness preserved enhancement) ⓖ  — Tone
590. SRIE (simultaneous reflectance & illumination) ⓖ  — Tone
591. Chiu spatially non-uniform tonemap ⓖ  — Tone
592. Ferradans tonemap ⓖ  — Tone
593. Meylan retina tonemap ⓖ  — Tone
594. Mantiuk 2008 display-adaptive ⓖ  — Tone
595. Luminosity masks (Lights / Darks / Midtones)  — Tone

## Color science 2 (16)

596. CIECAM02  — Color
597. CIE xyY  — Color
598. HSLuv  — Color
599. Okhsv / Okhsl  — Color
600. TSL (tint-saturation-lightness)  — Color
601. YDbDr  — Color
602. Kodak Photo YCC  — Color
603. HWB  — Color
604. HCY  — Color
605. Chroma subsampling 4:2:0  — Retro
606. Color contrast (Lab a/b steepness)  — Color
607. RGB primaries (darktable)  — Color
608. Base curve (camera tone emulation)  — Tone
609. Finlayson log-chromaticity invariant ⓖ  — Repair
610. Gamut-mapping color constancy (Forsyth) ⓖ  — Color
611. Pitié N-dimensional PDF transfer ⓖ  — Color

## GIMP / GEGL (9)

612. Alien Map  — Color
613. Color Enhance  — Color
614. Predator  — Stylize
615. Color to Gray (c2g)  — Color
616. STRESS (envelope retinex)  — Tone
617. Color Assimilation Grid  — Stylize
618. Broadcast-safe (Hot)  — Color
619. Sample Colorize ⓖ  — Color
620. Border Average ⓖ  — Stylize

## G'MIC 2 (10)

621. Contrast Swiss Mask  — Tone
622. Graphic Boost  — Tone
623. Blockism  — Stylize
624. Annular Steiner Chain Round Tile  — Stylize
625. Pen Drawing  — Paint
626. Aurora  — Render
627. Chalk It Up  — Paint
628. Metallic Look  — Materials
629. Kitaoka Spin Illusion  — Stylize
630. Dynamic Range Increase ⓖ  — Tone

## Krita / Paint.NET (3)

631. Mean Removal  — Sharpen
632. Outline Object (BoltBait)  — Stylize
633. Feather Object (BoltBait)  — Stylize

## PaintShop Pro (20)

634. Aged Newspaper  — Stylize
635. Balls and Bubbles  — Render
636. Colored Foil  — Stylize
637. Enamel  — Materials
638. Hot Wax Coating  — Materials
639. Topography  — Stylize
640. Spiky Halo  — Distort
641. Curtain  — Distort
642. Cylindrical projection  — Distort
643. Pentagon warp  — Distort
644. Feedback (recursive reflection)  — Distort
645. Rotating Mirror  — Distort
646. Fur  — Materials
647. Polished Stone  — Materials
648. Sculpture  — Materials
649. Soft Plastic  — Materials
650. Straw-Wall  — Materials
651. Buttonize  — Frames
652. Chisel  — Materials
653. Time Machine  — Stylize

## Photo apps 2 (31)

654. Erase White Paper (Affinity)  — Color
655. Remove Black (Affinity)  — Color
656. Normals adjustment (Affinity)  — Materials
657. Recolor (Affinity)  — Color
658. Fine Contrast (DxO)  — Tone
659. Volume Deformation correction (DxO)  — Distort
660. Diffraction correction (Capture One)  — Sharpen
661. Dynamic Contrast (ON1)  — Tone
662. Sunshine (ON1)  — Insta
663. Big Softy (ON1)  — Blur
664. BuzSim (Topaz Simplify)  — Stylize
665. Retrolux (Snapseed)  — Stylize
666. Inner Shadow  — Frames
667. Outer Glow  — Stylize
668. Visualize Spots (Lightroom)  — Analysis
669. Silvertone (Apple Photos)  — Stylize
670. Topaz DeNoise AI ⓜ  — Repair
671. Topaz Sharpen AI ⓜ  — Sharpen
672. Gigapixel AI ⓜ  — Sharpen
673. Supersharp AI (Luminar) ⓜ  — Sharpen
674. Atmosphere AI (Luminar) ⓜ  — Depth
675. Sky replacement (Luminar Sky AI) ⓜ  — Stylize
676. Super Zoom (Neural Filters) ⓜ  — Sharpen
677. Photo Restoration (Neural Filters) ⓜ  — Repair
678. Landscape Mixer ⓜ  — Stylize
679. Smart Portrait ⓜ  — Repair
680. Enhance Details (Adobe) ⓜ  — Sharpen
681. Stage Light (Portrait Lighting) ⓜ  — Render
682. Contour Light (Portrait Lighting) ⓜ  — Render
683. High-Key Light Mono ⓜ  — Render
684. Expand (Snapseed) ⓖ  — Repair

## darktable / RawTherapee (11)

685. Color reconstruction  — Color
686. Profiled denoise  — Repair
687. Highlight reconstruction (inpaint opposed)  — Repair
688. Log encoding  — Tone
689. Line noise filter (PDAF banding)  — Repair
690. Green equilibration  — Repair
691. IGV demosaic  — Repair
692. HPHD demosaic  — Repair
693. Diffuse or sharpen ⓖ  — Sharpen
694. Capture sharpening ⓖ  — Sharpen
695. Dual demosaic ⓖ  — Repair

## Instagram (14)

696. Gotham  — Insta
697. Apollo  — Insta
698. Oslo  — Insta
699. Lagos  — Insta
700. Melbourne  — Insta
701. Jakarta  — Insta
702. Abu Dhabi  — Insta
703. Buenos Aires  — Insta
704. Jaipur  — Insta
705. New York  — Insta
706. Cairo  — Insta
707. Tokyo  — Insta
708. Rio de Janeiro  — Insta
709. Paris (Instagram)  — Insta

## VSCO (10)

710. VSCO A6  — Insta
711. VSCO C1  — Insta
712. VSCO F2  — Insta
713. VSCO HB1  — Insta
714. VSCO M5  — Insta
715. VSCO KK1  — Insta
716. VSCO AL3  — Insta
717. VSCO B1  — Insta
718. VSCO T1  — Insta
719. VSCO J2  — Insta

## Google Photos (16)

720. Playa  — Insta
721. Honey  — Insta
722. Isla  — Insta
723. Desert  — Insta
724. Clay  — Insta
725. Palma  — Insta
726. Metro  — Insta
727. Eiffel  — Insta
728. Blush  — Insta
729. Modena  — Insta
730. Reel  — Insta
731. Vogue  — Insta
732. Ollie  — Insta
733. Bazaar  — Insta
734. Alpaca  — Insta
735. Vista  — Insta

## FFmpeg / AviSynth (24)

736. chromanr  — Repair
737. chromahold  — Color
738. dedot (dot-crawl / rainbow removal)  — Retro
739. pp7 deblock  — Repair
740. hqdn3d denoise  — Repair
741. RemoveGrain modes  — Repair
742. Shape-adaptive blur (sab)  — Blur
743. yaepblur  — Blur
744. Delogo (border interpolation)  — Repair
745. CIE chromaticity scope  — Analysis
746. Equirectangular ↔ cubemap (v360)  — Distort
747. LSFmod  — Sharpen
748. aWarpSharp2  — Sharpen
749. SeeSaw  — Sharpen
750. FineSharp  — Sharpen
751. ContraSharpening  — Sharpen
752. FastLineDarkenMOD  — Stylize
753. ELBG quantization ⓖ  — Retro
754. FFT denoise (fftdnoiz) ⓖ  — Repair
755. Overcomplete wavelet denoise (owdenoise) ⓖ  — Repair
756. SPP (simple postprocessing) ⓖ  — Repair
757. vaguedenoiser ⓖ  — Repair
758. DFTTest ⓖ  — Repair
759. Blur detection (blurdetect) ⓖ  — Analysis

## Augmentation 2 (15)

760. AdvancedBlur  — Augment
761. GridElasticDeform  — Augment
762. HEStain  — Color
763. AugMix  — Augment
764. RandAugment  — Augment
765. TrivialAugmentWide  — Augment
766. AutoAugment  — Augment
767. RandomLinearIllumination  — Augment
768. RandomGaussianIllumination  — Augment
769. FastSnowyLandscape  — Augment
770. BlendAlphaFrequencyNoise  — Augment
771. BlendAlphaSomeColors  — Augment
772. RandomDissolving ⓜ  — Augment
773. CutMix ⓧ  — Augment
774. MixUp ⓧ  — Augment

## NPR literature (15)

775. Anisotropic Kuwahara (Kyprianidis)  — Paint
776. Tonal art maps hatching (Praun)  — Paint
777. Notebook Drawings (flockaroo)  — Paint
778. Gooch cool-to-warm shading  — Render
779. Artistic screening (Ostromoukhov-Hersch)  — Retro
780. Kubelka-Munk pigment mixing  — Paint
781. Oren-Nayar diffuse (from normals)  — Render
782. Cook-Torrance specular (from normals)  — Render
783. Painterly rendering (Hertzmann) ⓖ  — Paint
784. Pencil drawing (Lu-Xu-Jia) ⓖ  — Paint
785. Simulated decorative mosaics (Hausner) ⓖ  — Paint
786. Structure-aware halftoning (Pang) ⓖ  — Retro
787. Neural style transfer (Gatys) ⓜ  — Paint
788. AnimeGANv2 ⓜ  — Paint
789. Informative Drawings (line art) ⓜ  — Paint

## Neural models (11)

790. Deep image prior ⓜ  — Repair
791. SwinIR ⓜ  — Sharpen
792. NAFNet deblur ⓜ  — Sharpen
793. EnlightenGAN ⓜ  — Repair
794. GFPGAN face restoration ⓜ  — Repair
795. U²-Net background removal ⓜ  — Sensor
796. MODNet portrait matting ⓜ  — Sensor
797. SuperPoint keypoints ⓜ  — Sensor
798. SOLD2 line detection ⓜ  — Edges
799. DeepGaze saliency ⓜ  — Sensor
800. EAST text detection ⓜ  — Sensor

## Retro 2 (18)

801. Mode 7 projection  — Distort
802. Amiga EHB (Extra Half-Brite)  — Retro
803. Atari ST palette  — Retro
804. BBC Micro Mode 2  — Retro
805. TMS9918 palette (ColecoVision / MSX1)  — Retro
806. 15-bit color (RGB555)  — Retro
807. Mega Drive 9-bit palette  — Retro
808. PS1 15-bit dither look  — Retro
809. N64 3-point bilinear filtering  — Retro
810. Game Boy Camera  — Retro
811. Web-safe 216 palette  — Retro
812. LED matrix display  — Retro
813. E-ink display (ghosting)  — Retro
814. Thermal printer receipt  — Retro
815. Fax (1-bit G3)  — Retro
816. Dot-matrix printer  — Retro
817. Mimeograph  — Retro
818. Amiga HAM6 ⓖ  — Retro

## Optics (12)

819. Lensbaby sweet spot  — Blur
820. Petzval swirl bokeh  — Blur
821. Cat's-eye bokeh (optical vignetting)  — Blur
822. Onion-ring bokeh  — Blur
823. Apodization (STF) bokeh  — Blur
824. Black Pro-Mist diffusion  — Blur
825. Split diopter  — Blur
826. Anamorphic oval bokeh  — Blur
827. Coma aberration  — Blur
828. Airy disk diffraction blur  — Blur
829. Stack blur (Klingemann)  — Blur
830. Sensor dust spots  — Noise

## Projections (8)

831. Möbius transformation  — Distort
832. Mercator projection  — Distort
833. Mollweide projection  — Distort
834. Inverse perspective mapping (bird's-eye)  — Distort
835. Log-polar transform  — Distort
836. Mustache distortion  — Distort
837. Gravitational lensing  — Distort
838. Fluted (reeded) glass  — Distort

## Procedural noise 2 (13)

839. Value noise  — Noise
840. Pink (1/f) noise  — Noise
841. Spot noise (van Wijk)  — Noise
842. Sparse convolution noise (Lewis)  — Noise
843. Phasor noise  — Noise
844. Voronoise (Quilez)  — Noise
845. Alligator noise  — Noise
846. Swiss turbulence  — Noise
847. Hybrid multifractal (Musgrave)  — Noise
848. Realistic film grain (Newson)  — Noise
849. Fixed-pattern noise  — Noise
850. Row / column banding noise  — Noise
851. Amp glow  — Noise

## Terrain 2 (14)

852. Red Relief Image Map (RRIM)  — Terrain
853. Local Relief Model (LRM)  — Terrain
854. Vector Ruggedness Measure (VRM)  — Terrain
855. Convergence index  — Terrain
856. Wood morphometric features  — Terrain
857. Geomorphons  — Terrain
858. Deviation from mean elevation (DEV)  — Terrain
859. D8 flow direction  — Terrain
860. Tanaka illuminated contours  — Terrain
861. Hetero terrain (Musgrave)  — Terrain
862. Hydraulic erosion ⓖ  — Terrain
863. Topographic wetness index (TWI) ⓖ  — Terrain
864. Stream power index ⓖ  — Terrain
865. Depression filling (Planchon-Darboux) ⓖ  — Terrain

## Frames 2 (5)

866. Film negative carrier border  — Frames
867. Deckle edge  — Frames
868. Passe-partout mat  — Frames
869. Postage stamp perforation  — Frames
870. Letterbox bars  — Frames
