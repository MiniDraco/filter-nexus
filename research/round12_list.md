# Round 12 harvest: 455 techniques not yet in Filter Nexus

Checked by `research/dedupe12.py` against every filter, engine id and alias name in `filters.db`, all round-9, round-10 and round-11 names. 354 are buildable as GPU shaders; 33 need whole-image/sequential work, 42 need a neural net, 26 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## ReShade repos 3 (50)

1. Color Gamut (prod80)  — Color
2. Color Gradients (prod80)  — Color
3. Color Isolation (prod80)  — Color
4. Adaptive Color Grading (GShade)  — Color
5. Sunset Filter (Fubax)  — Color
6. Palette Map (Zenteon)  — Color
7. Retro Tint (Daodan)  — Color
8. Correct Color (prod80) ⓖ  — Color
9. Remove Tint (Daodan) ⓖ  — Color
10. Adaptive Tint (Daodan) ⓖ  — Color
11. Luma Fade (prod80)  — Tone
12. Watch Dogs Tonemap  — Tone
13. Magic HDR (luluco250)  — Tone
14. Whitepoint Fixer (luluco250)  — Tone
15. Correct Contrast (prod80) ⓖ  — Tone
16. Filmic Adaptation (prod80) ⓖ  — Tone
17. Magical Rectangle (prod80)  — Stylize
18. Flair (AstrayFX)  — Stylize
19. SOLARIS bloom (iMMERSE)  — Stylize
20. Hex Lens Flare (luluco250)  — Stylize
21. Unreal Lens (luluco250)  — Stylize
22. Tracking Rays (luluco250)  — Stylize
23. Bessel Bloom (Insane)  — Stylize
24. Deep Fry (Insane)  — Stylize
25. Colorful Poster (Daodan)  — Stylize
26. Multi Tone Poster (Daodan)  — Stylize
27. Artistic Vignette (luluco250)  — Stylize
28. Posterize Pixelate (prod80)  — Retro
29. Retro Fog (luluco250)  — Retro
30. Virtual Resolution (luluco250)  — Retro
31. Filmic Anamorph Sharpen  — Sharpen
32. Sharp Contrast (Insane)  — Sharpen
33. Perfect Perspective (Fubax)  — Distort
34. Liquid Lens (luluco250)  — Distort
35. Flexible CA (luluco250)  — Distort
36. MXAO (iMMERSE)  — Depth
37. Stage Depth (GShade)  — Depth
38. Mesh Edges (Daodan)  — Depth
39. Volumetric Fog (NiceGuy)  — Depth
40. Anaglyph to SBS (Depth3D)  — Depth
41. Dimension Plus (Depth3D)  — Depth
42. Hole Filler (NiceGuy)  — Depth
43. DLAA Plus (AstrayFX)  — Repair
44. CMAA 2 (Insane)  — Repair
45. Smart DeNoise (GShade)  — Repair
46. ReVeil (Insane) ⓖ  — Repair
47. Ambient Remove (DH) ⓖ  — Repair
48. Bilateral Comic (Insane)  — Paint
49. Noise Blur (CShade)  — Blur
50. Motion Stabilization (CShade) ⓧ  — Repair

## RetroArch: handheld & NTSC (21)

51. agb001 (GBA LCD)  — Retro
52. ags001 (GBA SP frontlight)  — Retro
53. authentic_gbc  — Retro
54. sameboy-lcd  — Retro
55. simpletex_lcd  — Retro
56. lcd1x_psp  — Retro
57. retro-v3 (handheld)  — Retro
58. pixel_transparency (handheld)  — Retro
59. sunlight_shimmer (handheld)  — Retro
60. frontlit-reflective (handheld)  — Retro
61. mega-blocks-brick  — Retro
62. mega-blocks-dome  — Retro
63. analog_overshoot (NTSC)  — Retro
64. artifact-colors (NTSC)  — Retro
65. mame-ntsc  — Retro
66. ntsc-blastem  — Retro
67. ntsc-xot  — Retro
68. patchy-blastem  — Retro
69. patchy-snes  — Retro
70. tiny_ntsc  — Retro
71. ntsc-adaptive  — Retro

## RetroArch: misc & scaling (47)

72. color-mangler  — Color
73. colorimetry (misc)  — Color
74. chromaticity (misc)  — Color
75. natural-vision  — Color
76. night-mode (misc)  — Color
77. patchy-color  — Color
78. yiq-hue-adjustment  — Color
79. ss-gamma-ramp  — Color
80. bsnes-gamma-ramp  — Color
81. accessibility_mods  — Color
82. nes-color-decoder  — Color
83. pixel-weave (misc)  — Retro
84. print-resolution (misc)  — Retro
85. convergence (CRT misc)  — Retro
86. crtsim-grungy  — Retro
87. mudlord-pal-vhs  — Retro
88. film_noise (slang)  — Retro
89. blur-haze (sh1nra358)  — Retro
90. jinc2-sharper  — Sharpen
91. hann-5-taps  — Sharpen
92. spline100  — Sharpen
93. cheap-sharpen  — Sharpen
94. rca_sharpen  — Sharpen
95. super-res-ex  — Sharpen
96. deblur-luma  — Sharpen
97. aa-shader-4.0  — Repair
98. advanced-aa  — Repair
99. ewa_curvature  — Repair
100. reverse-aa  — Repair
101. sharpsmoother  — Repair
102. fast-bilateral-3d  — Repair
103. smart-morph  — Repair
104. ControlledSharpness  — Retro
105. SmuberStep  — Retro
106. smootheststep  — Retro
107. aann  — Retro
108. edge1pixel  — Retro
109. edgeNpixels  — Retro
110. grid-blend-hybrid  — Retro
111. soft-pixel-art  — Retro
112. uniform-nearest  — Retro
113. g-sharp_resampler  — Retro
114. gendither  — Retro
115. NormalsDisplacement (reshade port)  — Stylize
116. braid-rewind ⓧ  — Retro
117. mix_frames_smart ⓧ  — Retro
118. response-time (LCD) ⓧ  — Retro

## RetroArch: CRT 3 (21)

119. crt-CreativeForce-Arcade  — Retro
120. crt-Cyclon  — Retro
121. crt-beans  — Retro
122. crt-blurPi  — Retro
123. crt-gdv-mini  — Retro
124. crt-pocket  — Retro
125. crt-potato  — Retro
126. crt-torridgristle  — Retro
127. crt-yah  — Retro
128. crt-yo6 (Trinitron KV)  — Retro
129. crtglow  — Retro
130. fakelottes  — Retro
131. gizmo-crt  — Retro
132. gtu-v050  — Retro
133. lottesRVM  — Retro
134. mame_hlsl  — Retro
135. metacrt  — Retro
136. moire-resolve  — Retro
137. monoCRT  — Retro
138. vt220 (terminal)  — Retro
139. crt-maximus-royale  — Retro

## mpv / libplacebo shaders 2 (16)

140. RAVU-Lite  — Sharpen
141. RAVU-Zoom  — Sharpen
142. RAVU-3x  — Sharpen
143. NVIDIA Image Scaling (NIS)  — Sharpen
144. SGSR (Snapdragon Game Super Resolution)  — Sharpen
145. Anime4K Thin  — Sharpen
146. Anime4K Darken  — Sharpen
147. Anime4K Clamp Highlights  — Sharpen
148. Anime4K Deblur DoG  — Sharpen
149. Antiringing (libplacebo)  — Sharpen
150. Sphinx window  — Sharpen
151. Kaiser window  — Sharpen
152. Blackman window  — Sharpen
153. hdeband  — Repair
154. ACNet ⓜ  — Sharpen
155. Anime4K Restore CNN ⓜ  — Sharpen

## Boris FX Sapphire (49)

156. S_GlowOrthicon  — Stylize
157. S_GlowRings  — Stylize
158. S_GlowRainbow  — Stylize
159. S_GlowNoise  — Stylize
160. S_GlintRainbow  — Stylize
161. S_EdgeRays  — Stylize
162. S_EdgeFlash  — Stylize
163. S_ZGlow  — Stylize
164. S_LaserBeam  — Stylize
165. S_ColorFuse  — Stylize
166. S_EdgeColorize  — Edges
167. S_EdgeDetectDouble  — Edges
168. S_EdgesInDirection  — Edges
169. S_BlurChroma  — Blur
170. S_BlurMoCurves  — Blur
171. S_DefocusPrism  — Blur
172. S_DogVision  — Distort
173. S_FlysEyeHex  — Distort
174. S_KaleidoDiamonds  — Distort
175. S_KaleidoOct  — Distort
176. S_WarpPuddle  — Distort
177. S_WarpDrops  — Distort
178. S_WarpChroma  — Distort
179. S_WarpRepeat  — Distort
180. S_HyperPush  — Distort
181. S_StretchFrameEdges  — Distort
182. S_FreeLens  — Distort
183. S_HalfToneRings  — Paint
184. S_EmbossGlass  — Paint
185. S_CartoonPaint  — Paint
186. S_AutoPaint ⓖ  — Paint
187. S_TextureChromaSpiral  — Noise
188. S_TextureFlux  — Noise
189. S_TextureFolded  — Noise
190. S_TextureLoops  — Noise
191. S_TextureMicro  — Noise
192. S_TextureNeurons  — Noise
193. S_TextureNoiseEmboss  — Noise
194. S_CloudsPsyko  — Noise
195. S_CloudsVortex  — Noise
196. S_PsykoBlobs  — Noise
197. S_PsykoStripes  — Noise
198. S_UltraGrain  — Noise
199. S_DigitalDamage  — Retro
200. S_JpegDamage  — Retro
201. S_ClampChroma  — Color
202. S_NightSky  — Render
203. S_TrailsDiffuse ⓧ  — Stylize
204. S_MotionDetect ⓧ  — Analysis

## Boris FX Continuum (BCC) (54)

205. BCC Artists Poster  — Paint
206. BCC Spray Paint Noise  — Paint
207. BCC+ Color Infrared  — Stylize
208. BCC+ Color Shadow  — Stylize
209. BCC Color Choker  — Stylize
210. BCC Colorize Glow  — Stylize
211. BCC Edge Grunge  — Stylize
212. BCC Misalignment  — Stylize
213. BCC Multi-Shadow  — Stylize
214. BCC RGB Edges  — Stylize
215. BCC RGB PixelNoise  — Stylize
216. BCC Scatterize  — Stylize
217. BCC Glow Alpha Edges  — Stylize
218. BCC Reverse Spotlight  — Stylize
219. BCC Rays Puffy  — Stylize
220. BCC Rays Radiant Edges  — Stylize
221. BCC Edge Lighting  — Stylize
222. BCC+ Ice Halos  — Stylize
223. BCC+ Multi-Star  — Stylize
224. BCC+ Chroma Bands  — Stylize
225. BCC+ Eye Light  — Stylize
226. BCC+ Key Light  — Stylize
227. BCC+ Overexpose  — Stylize
228. BCC+ Reflector  — Stylize
229. BCC+ Orbs  — Stylize
230. BCC+ Film Glow  — Stylize
231. BCC+ Flashing  — Stylize
232. BCC+ Atmospheric Glow  — Stylize
233. BCC+ Smear Blur  — Blur
234. BCC Lens Shape  — Blur
235. BCC+ Center Spot  — Blur
236. BCC+ Net  — Blur
237. BCC+ Silk  — Blur
238. BCC+ F Stop  — Color
239. BCC+ Florescent  — Color
240. BCC+ Selective Saturation  — Color
241. BCC+ High Contrast  — Color
242. BCC+ Low Contrast  — Color
243. BCC Multitone Mix  — Color
244. BCC+ Color Spot  — Color
245. BCC+ Dual Gradient  — Color
246. BCC+ Gels  — Color
247. BCC+ Radial Tint  — Color
248. BCC+ Radial Exposure  — Color
249. BCC+ DeBlock  — Repair
250. BCC Pixel Fixer  — Repair
251. BCC+ Wide Angle Lens  — Repair
252. BCC Polar Displacement  — Distort
253. BCC Vector Displacement  — Distort
254. BCC Mixed Colors  — Noise
255. BCC Organic Strands  — Noise
256. BCC Pin Art 3D  — Render
257. BCC+ Harris Shutter ⓧ  — Stylize
258. BCC+ Light Flicker ⓧ  — Stylize

## Digital Film Tools (DFT) (12)

259. Fan Rays (DFT)  — Stylize
260. Spiral Rays (DFT)  — Stylize
261. Random Spikes (DFT)  — Stylize
262. Radial Streaks (DFT)  — Stylize
263. Turb Distort (DFT)  — Stylize
264. Ozone (DFT)  — Stylize
265. Printer Points (DFT)  — Color
266. Color Suppress (DFT)  — Color
267. Telecine (DFT)  — Color
268. Screen Smoother (DFT)  — Repair
269. DeArtifact (DFT)  — Repair
270. Frame Averager (DFT) ⓧ  — Blur

## Ignite Pro / HitFilm (21)

271. Ignite Chromenator  — Stylize
272. Ignite Derez (VGHS)  — Stylize
273. Ignite Dimension Rift  — Stylize
274. Ignite Dot Matrix  — Stylize
275. Ignite Electro  — Stylize
276. Ignite Light Streaks  — Stylize
277. Ignite Gleam  — Stylize
278. Ignite Hyperdrive  — Stylize
279. Ignite Energy Distortion  — Distort
280. Ignite Fluid Distortion  — Distort
281. Ignite Pond Ripple  — Distort
282. Ignite Smoke Distortion  — Distort
283. Ignite Block Displacement  — Distort
284. Ignite Vortex Displacement Warp  — Distort
285. Ignite Crush Blacks & Whites  — Color
286. Ignite Custom Gray  — Color
287. Ignite Leave Color  — Color
288. Ignite Vignette Exposure  — Color
289. Ignite Chroma UV Blur  — Blur
290. Ignite Distance Field ⓖ  — Analysis
291. Ignite Stutter ⓧ  — Stylize

## NewBlue FX (13)

292. Mural (NewBlue)  — Paint
293. Paper Collage (NewBlue)  — Paint
294. Pencil Rubbing (NewBlue)  — Paint
295. Hand Drawn (NewBlue)  — Paint
296. Halovision Plus  — Stylize
297. Light Bender (NewBlue)  — Stylize
298. Shear Energy (NewBlue)  — Stylize
299. Spinning Light (NewBlue)  — Stylize
300. Starlight (NewBlue)  — Stylize
301. Color Melt (NewBlue)  — Stylize
302. Detail by Chroma (NewBlue)  — Sharpen
303. Detail by Luma (NewBlue)  — Sharpen
304. Dual Booster (NewBlue)  — Sharpen

## Red Giant Universe (14)

305. uni.Glo Fi  — Stylize
306. uni.Holomatrix II  — Stylize
307. uni.Luster  — Stylize
308. uni.MisFire  — Stylize
309. uni.OverLight  — Stylize
310. uni.Spectralicious  — Stylize
311. uni.Ecto  — Stylize
312. uni.ChromaTown  — Stylize
313. uni.Glimmer  — Stylize
314. uni.AV Club  — Stylize
315. uni.Analog (Universe)  — Stylize
316. uni.RetroGrade  — Color
317. uni.Finisher  — Color
318. uni.ShrinkRay  — Distort

## GenArts Monsters GT (8)

319. M_CCTV  — Stylize
320. M_EdgeLeak  — Stylize
321. M_Pool3D  — Distort
322. M_Puddle3D  — Distort
323. M_ClipTex  — Materials
324. M_PatchTex  — Materials
325. M_Cumulo  — Noise
326. M_PixFlow ⓧ  — Stylize

## VEGAS Pro FX (13)

327. VEGAS Black Restore  — Tone
328. VEGAS Soft Contrast  — Tone
329. VEGAS Fill Light  — Tone
330. VEGAS Cookie Cutter  — Stylize
331. VEGAS Radial Pixelate  — Stylize
332. VEGAS TV Simulator  — Stylize
333. VEGAS Linear Blur  — Blur
334. VEGAS Chroma Blur  — Blur
335. VEGAS Min and Max  — Analysis
336. VEGAS Offset and Wrap  — Distort
337. VEGAS AI Style Transfer ⓜ  — Paint
338. VEGAS AI Smoothen ⓜ  — Repair
339. VEGAS AI Z-Depth ⓜ  — Depth

## RE:Vision Effects (2)

340. RSMB (ReelSmart Motion Blur) ⓧ  — Blur
341. DEFlicker Rolling Bands ⓧ  — Repair

## Affinity Photo 2 (6)

342. Equations (Affinity)  — Distort
343. Custom Blur (Affinity)  — Blur
344. Divide by Alpha  — Color
345. Multiply by Alpha  — Color
346. Remove White Matte  — Color
347. Web Safe Dither  — Retro

## Pixelmator / Photomator (2)

348. ML Enhance (Photomator) ⓜ  — Repair
349. Smart Deband (Photomator) ⓜ  — Repair

## Luminar Neo (10)

350. Enhance AI (Luminar) ⓜ  — Repair
351. Structure AI (Luminar) ⓜ  — Repair
352. Skin AI (Luminar) ⓜ  — Repair
353. Face AI (Luminar) ⓜ  — Repair
354. Body AI (Luminar) ⓜ  — Repair
355. Water Enhancer AI (Luminar) ⓜ  — Repair
356. Twilight Enhancer AI (Luminar) ⓜ  — Repair
357. Magic Light AI (Luminar) ⓜ  — Depth
358. Bokeh AI (Luminar) ⓜ  — Depth
359. Sky AI (Luminar) ⓜ  — Render

## ON1 Effects (4)

360. Tone Enhancer (ON1)  — Tone
361. HDR Look (ON1)  — Tone
362. Antique (ON1)  — Color
363. Weather (ON1)  — Stylize

## Capture One (5)

364. Silver Rich grain (Capture One)  — Film
365. Soft Grain (Capture One)  — Film
366. Cubic Grain (Capture One)  — Film
367. Tabular Grain (Capture One)  — Film
368. Harsh Grain (Capture One)  — Film

## Lightroom AI tools (1)

369. Remove Reflections (Lightroom) ⓜ  — Repair

## Paint.NET plug-in packs (20)

370. True Blur (Ed Harvey)  — Blur
371. Simplify (Ed Harvey)  — Blur
372. Drop Ripple (Ed Harvey)  — Distort
373. InsideOut (Ed Harvey)  — Distort
374. Multiview Warp (Ed Harvey)  — Distort
375. Wobble (Ed Harvey)  — Distort
376. Gravity (MadJik)  — Distort
377. Vibrato (MadJik)  — Distort
378. Seismograph (Ed Harvey)  — Stylize
379. Psychocolour (Red ochre)  — Stylize
380. Object Edge (Red ochre)  — Stylize
381. Cobweb (Red ochre)  — Stylize
382. Change Extreme Colors (MadJik)  — Stylize
383. Nebulous (MadJik)  — Stylize
384. ArtyThing (Red ochre) ⓖ  — Paint
385. Scribble (Red ochre) ⓖ  — Paint
386. Furblur (Red ochre) ⓖ  — Paint
387. Fractal Curly Tree (MadJik) ⓖ  — Render
388. Fractal Fern (MadJik) ⓖ  — Render
389. Poster (Red ochre, average colours) ⓖ  — Color

## Shadertoy classics (1)

390. Heartfelt (rain on window)  — Distort

## Image forensics (22)

391. Noise Analysis (Forensically)  — Analysis
392. Level Sweep (Forensically)  — Analysis
393. Luminance Gradient (Forensically)  — Analysis
394. Magnifier enhancement (Forensically)  — Analysis
395. Error Level Analysis (ELA) ⓖ  — Analysis
396. Clone Detection (Forensically) ⓖ  — Analysis
397. Principal Component Analysis (Forensically) ⓖ  — Analysis
398. JPEG Ghost (Farid) ⓖ  — Analysis
399. ADQ1 aligned double quantization ⓖ  — Analysis
400. NADQ non-aligned double JPEG ⓖ  — Analysis
401. BLK block artifact grid ⓖ  — Analysis
402. CAGI grid inconsistency ⓖ  — Analysis
403. CFA1 (Ferrara demosaicing artifacts) ⓖ  — Analysis
404. CFA2 (Dirik-Memon CFA) ⓖ  — Analysis
405. DCT (Ye block DCT histogram) ⓖ  — Analysis
406. NOI1 (Mahdian wavelet noise) ⓖ  — Analysis
407. NOI2 (Lyu local noise level) ⓖ  — Analysis
408. NOI5 (PCA noise) ⓖ  — Analysis
409. Splicebuster ⓖ  — Analysis
410. Noiseprint ⓜ  — Analysis
411. ManTra-Net ⓜ  — Analysis
412. PRNU fingerprint ⓧ  — Analysis

## Pan-sharpening methods (14)

413. Brovey transform ⓧ  — Sensor
414. Gram-Schmidt pan-sharpening ⓧ  — Sensor
415. IHS fusion ⓧ  — Sensor
416. GSA pan-sharpening ⓧ  — Sensor
417. SFIM ⓧ  — Sensor
418. MTF-GLP ⓧ  — Sensor
419. MTF-GLP-HPM ⓧ  — Sensor
420. GFPCA ⓧ  — Sensor
421. Esri pan-sharpening ⓧ  — Sensor
422. Simple Mean pan-sharpening ⓧ  — Sensor
423. PCA pan-sharpening ⓧ  — Sensor
424. CNMF (coupled NMF fusion) ⓧ  — Sensor
425. PNN pan-sharpening ⓜ  — Sensor
426. PanNet ⓜ  — Sensor

## Document enhancement 3 (15)

427. DocTr ⓜ  — Repair
428. DewarpNet ⓜ  — Repair
429. DocProj ⓜ  — Repair
430. FDRNet (Fourier document restoration) ⓜ  — Repair
431. UDoc-GAN ⓜ  — Repair
432. GCDRNet ⓜ  — Repair
433. BEDSR-Net ⓜ  — Repair
434. ShaDocNet ⓜ  — Repair
435. ShaDocFormer ⓜ  — Repair
436. LP-IOANet ⓜ  — Repair
437. DocUNet ⓜ  — Repair
438. DeepOtsu ⓜ  — Repair
439. SVDocNet ⓜ  — Repair
440. Marior ⓜ  — Repair
441. Selective-median black-top-hat shadow removal ⓖ  — Repair

## Inpainting models (IOPaint) (6)

442. MAT inpainting ⓜ  — Repair
443. ZITS inpainting ⓜ  — Repair
444. FcF inpainting ⓜ  — Repair
445. MI-GAN ⓜ  — Repair
446. Manga inpainting ⓜ  — Repair
447. Paint by Example ⓜ  — Repair

## Histology stain tools (2)

448. Reinhard stain normalization ⓖ  — Color
449. Stain augmentation (TIAToolbox)  — Augment

## Materialize / AwesomeBump (2)

450. Remove Shading (AwesomeBump)  — Materials
451. Normal Mixer (AwesomeBump)  — Materials

## Textbook classics 3 (4)

452. Hueckel operator ⓖ  — Edges
453. Argyle operator  — Edges
454. Macleod operator  — Edges
455. Stentiford thinning  — Analysis
