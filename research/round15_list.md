# Round 15 harvest: 447 techniques not yet in Filter Nexus

Checked by `research/dedupe15.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-14 names and the index.html option labels. 289 are buildable as GPU shaders; 43 need whole-image/sequential work, 53 need a neural net, 62 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Olympus / OM System in-camera (13)

1. Pale & Light Color (Olympus Art Filter)  — Color
2. Gentle Sepia (Olympus Art Filter)  — Color
3. i-Enhance (Olympus Picture Mode)  — Color
4. Color Creator (Olympus Picture Mode)  — Color
5. Partial Color (Olympus Art Filter)  — Color
6. Light Tone (Olympus Art Filter)  — Tone
7. Dramatic Tone (Olympus Art Filter)  — Tone
8. Grainy Film (Olympus Art Filter)  — Film
9. Punk (Olympus Art Filter)  — Stylize
10. Key Line (Olympus Art Filter)  — Stylize
11. Fragmented (Olympus Art Filter)  — Distort
12. White Edge (Olympus Art Effect)  — Frames
13. e-Portrait (Olympus Picture Mode)  — Repair

## Panasonic Lumix in-camera (10)

14. Expressive (Lumix Creative Control)  — Insta
15. Retro (Lumix Creative Control)  — Insta
16. Old Days (Lumix Creative Control)  — Insta
17. Toy Pop (Lumix Creative Control)  — Insta
18. Fantasy (Lumix Creative Control)  — Insta
19. High Dynamic (Lumix Creative Control)  — Tone
20. Impressive Art (Lumix Creative Control)  — Tone
21. Dynamic Monochrome (Lumix Creative Control)  — Film
22. Silky Monochrome (Lumix Creative Control)  — Film
23. Rough Monochrome (Lumix Creative Control)  — Film

## Sony in-camera (15)

24. Pop Color (Sony Picture Effect)  — Insta
25. Retro Photo (Sony Picture Effect)  — Insta
26. Soft High Key (Sony Picture Effect)  — Insta
27. High Contrast Monochrome (Sony Picture Effect)  — Film
28. HDR Painting (Sony Picture Effect) ⓧ  — Tone
29. Rich-tone Monochrome (Sony Picture Effect) ⓧ  — Tone
30. Autumn Leaves (Sony Creative Style)  — Color
31. Clear (Sony Creative Style)  — Color
32. Deep (Sony Creative Style)  — Color
33. Light (Sony Creative Style)  — Color
34. Sunset (Sony Creative Style)  — Color
35. FL (Sony Creative Look)  — Color
36. IN (Sony Creative Look)  — Color
37. SH (Sony Creative Look)  — Color
38. Vivid 2 (Sony Creative Style)  — Color

## Pentax / Ricoh in-camera (14)

39. Slim (Pentax Digital Filter)  — Distort
40. Tone Expansion (Pentax Digital Filter)  — Tone
41. HDR Tone (Ricoh Image Control)  — Tone
42. Unicolor Bold (Pentax Digital Filter)  — Color
43. Muted (Pentax Custom Image)  — Color
44. Reversal Film (Pentax Custom Image)  — Color
45. Radiant (Pentax Custom Image)  — Color
46. Flat (Pentax Custom Image)  — Color
47. Positive Film (Ricoh Image Control)  — Color
48. Negative Film (Ricoh Image Control)  — Color
49. Bold Monochrome (Pentax Digital Filter)  — Film
50. Soft Monotone (Ricoh Image Control)  — Film
51. Hard Monotone (Ricoh Image Control)  — Film
52. Hi-contrast B&W (Ricoh Image Control)  — Film

## Nikon in-camera (15)

53. Dream (Nikon Creative Picture Control)  — Insta
54. Morning (Nikon Creative Picture Control)  — Insta
55. Pop (Nikon Creative Picture Control)  — Insta
56. Sunday (Nikon Creative Picture Control)  — Insta
57. Somber (Nikon Creative Picture Control)  — Insta
58. Silence (Nikon Creative Picture Control)  — Insta
59. Bleached (Nikon Creative Picture Control)  — Insta
60. Melancholic (Nikon Creative Picture Control)  — Insta
61. Pure (Nikon Creative Picture Control)  — Insta
62. Denim (Nikon Creative Picture Control)  — Insta
63. Toy (Nikon Creative Picture Control)  — Insta
64. Carbon (Nikon Creative Picture Control)  — Insta
65. Flat Monochrome (Nikon Picture Control)  — Film
66. Deep Tone Monochrome (Nikon Picture Control)  — Film
67. Rich Tone Portrait (Nikon Picture Control)  — Color

## Canon / Fujifilm / Samsung / Casio / Sigma in-camera (23)

68. Grainy B/W (Canon Creative Filter)  — Film
69. Art Bold (Canon HDR effect)  — Tone
70. Art Embossed (Canon HDR effect)  — Tone
71. Art HDR (Casio Art Shot)  — Tone
72. Dynamic Tone (Fujifilm Advanced Filter)  — Tone
73. Faithful (Canon Picture Style)  — Color
74. Fine Detail (Canon Picture Style)  — Color
75. Color Chrome Effect (Fujifilm)  — Color
76. Color Chrome FX Blue (Fujifilm)  — Color
77. Forest (Samsung Picture Wizard)  — Color
78. Calm (Samsung Picture Wizard)  — Color
79. FOV Classic Blue (Sigma Color Mode)  — Color
80. Vivid Landscape (Casio)  — Color
81. Cinema (Sigma Color Mode)  — Color
82. Warm Gold (Sigma Color Mode)  — Color
83. Sunset Red (Sigma Color Mode)  — Color
84. Forest Green (Sigma Color Mode)  — Color
85. Powder Blue (Sigma Color Mode)  — Color
86. FOV Classic Yellow (Sigma Color Mode)  — Color
87. Leica Classic (Leica Look)  — Color
88. Leica Contemporary (Leica Look)  — Color
89. Leica Eternal (Leica Look)  — Color
90. Leica Chrome (Leica Look)  — Color

## EffecTV (30)

91. AgingTV (EffecTV film ageing)  — Film
92. RevTV (Rutt-Etra scan-line displacement)  — Retro
93. ShagadelicTV (psychedelic rings)  — Stylize
94. SimuraTV (colour mirror)  — Stylize
95. WarpTV (EffecTV)  — Distort
96. DisplayWallTV (scrolling video wall)  — Distort
97. PuzzleTV (sliding-block shuffle)  — Distort
98. BaltanTV (delayed ghost trails) ⓧ  — Stylize
99. NervousTV (random frame shuffle) ⓧ  — Stylize
100. QuarkTV (per-pixel random frame) ⓧ  — Stylize
101. StreakTV (motion streaks) ⓧ  — Stylize
102. VertigoTV (zoom-rotate feedback) ⓧ  — Stylize
103. RippleTV (motion-triggered ripples) ⓧ  — Stylize
104. TimeDistortionTV ⓧ  — Stylize
105. SlofastTV ⓧ  — Stylize
106. DiffTV (frame-difference image) ⓧ  — Stylize
107. ChameleonTV (fade into background) ⓧ  — Stylize
108. BurningTV (flames on moving objects) ⓧ  — Stylize
109. FireTV (fire from motion) ⓧ  — Stylize
110. LifeTV (Game of Life seeded by motion) ⓧ  — Stylize
111. SparkTV (sparks along moving edges) ⓧ  — Stylize
112. SpiralTV (spiral time-warp) ⓧ  — Stylize
113. ColorfulStreak (EffecTV) ⓧ  — Stylize
114. EdgeBlurTV ⓧ  — Stylize
115. BlurzoomTV (radioactive zoom trails) ⓧ  — Stylize
116. DizzyTV (rotating feedback) ⓧ  — Stylize
117. 1DTV (scan-line time slice) ⓧ  — Stylize
118. HolographicTV (hologram of moving subject) ⓧ  — Stylize
119. MosaicTV (mosaic on moving areas) ⓧ  — Stylize
120. HalfTV (mirrored half with delay) ⓧ  — Stylize

## frei0r / MLT / Shotcut (17)

121. D90 Stair-Stepping Fix (frei0r)  — Repair
122. Elastic Scale (frei0r nonlinear widescreen stretch)  — Distort
123. Color Distance (frei0r)  — Analysis
124. Select0r (frei0r colour-range selection)  — Analysis
125. Pr0file (frei0r line-profile scope)  — Analysis
126. Nosync0r (frei0r lost vertical sync)  — Retro
127. Twolay0r (frei0r dynamic two-level threshold) ⓖ  — Stylize
128. Threelay0r (frei0r dynamic three-level) ⓖ  — Stylize
129. Three Point Balance (frei0r)  — Color
130. Primaries (frei0r reduce to primaries)  — Color
131. Squigglevision (frei0r line boil) ⓧ  — Stylize
132. Light Graffiti (frei0r) ⓧ  — Stylize
133. Pillar Echo (MLT blurred pillarbox fill)  — Frames
134. Choppy (MLT frame-rate decimation) ⓧ  — Stylize
135. fspp (FFmpeg fast simple post-processing deblock)  — Repair
136. uspp (FFmpeg ultra simple post-processing)  — Repair
137. Chromium (GStreamer Gaudi effects)  — Materials

## ParaView colour-map presets (57)

138. Cool to Warm (ParaView colormap)  — Color
139. Cool to Warm Extended (ParaView colormap)  — Color
140. Warm to Cool Extended (ParaView colormap)  — Color
141. Black-Body Radiation (ParaView colormap)  — Color
142. Black, Blue and White (ParaView colormap)  — Color
143. Black, Orange and White (ParaView colormap)  — Color
144. Blue Orange divergent (ParaView colormap)  — Color
145. Gray and Red (ParaView colormap)  — Color
146. Linear Green Gr4L (ParaView colormap)  — Color
147. Cold and Hot (ParaView colormap)  — Color
148. Blue - Green - Orange (ParaView colormap)  — Color
149. Rainbow Desaturated (ParaView colormap)  — Color
150. Yellow - Gray - Blue (ParaView colormap)  — Color
151. Rainbow Uniform (ParaView colormap)  — Color
152. KAAMS (ParaView colormap)  — Color
153. Linear YGB 1211g (ParaView colormap)  — Color
154. Linear Blue 8_31f (ParaView colormap)  — Color
155. Rainbow Blended White (ParaView colormap)  — Color
156. Rainbow Blended Grey (ParaView colormap)  — Color
157. Rainbow Blended Black (ParaView colormap)  — Color
158. CIELab Blue to Red (ParaView colormap)  — Color
159. erdc_rainbow_bright (ParaView colormap)  — Color
160. erdc_rainbow_dark (ParaView colormap)  — Color
161. nic_CubicL (ParaView colormap)  — Color
162. nic_CubicYF (ParaView colormap)  — Color
163. nic_Edge (ParaView colormap)  — Color
164. 2hot (ParaView colormap)  — Color
165. erdc_red2yellow_BW (ParaView colormap)  — Color
166. erdc_marine2gold_BW (ParaView colormap)  — Color
167. erdc_blue2gold_BW (ParaView colormap)  — Color
168. erdc_sapphire2gold_BW (ParaView colormap)  — Color
169. erdc_red2purple_BW (ParaView colormap)  — Color
170. erdc_purple2pink_BW (ParaView colormap)  — Color
171. erdc_pbj_lin (ParaView colormap)  — Color
172. erdc_blue2green_muted (ParaView colormap)  — Color
173. erdc_green2yellow_BW (ParaView colormap)  — Color
174. erdc_cyan2orange (ParaView colormap)  — Color
175. erdc_purple2green_dark (ParaView colormap)  — Color
176. erdc_divHi_purpleGreen (ParaView colormap)  — Color
177. erdc_divLow_icePeach (ParaView colormap)  — Color
178. erdc_iceFire_H (ParaView colormap)  — Color
179. erdc_iceFire_L (ParaView colormap)  — Color
180. heated_object (ParaView colormap)  — Color
181. hue_L60 (ParaView colormap)  — Color
182. Wild Flower (ParaView colormap)  — Color
183. Citrus (ParaView colormap)  — Color
184. Traffic Lights For Deuteranopes (ParaView colormap)  — Color
185. Muted Blue-Green (ParaView colormap)  — Color
186. Green-Blue Asymmetric Divergent 62Blbc (ParaView colormap)  — Color
187. Asymmetrical Earth Tones 6_21b (ParaView colormap)  — Color
188. Yellow 15 (ParaView colormap)  — Color
189. Haze_green (ParaView colormap)  — Color
190. Haze_lime (ParaView colormap)  — Color
191. GBBr (ParaView colormap)  — Color
192. GYPi (ParaView colormap)  — Color
193. GnYlRd (ParaView colormap)  — Color
194. BrOrYl (ParaView colormap)  — Color

## GPU vendor SDKs & engine upscalers (20)

195. FidelityFX CACAO (combined adaptive compute AO)  — Depth
196. Screen-space contact shadows  — Depth
197. FidelityFX LPM (Luma Preserving Mapper)  — Tone
198. FidelityFX SSSR (stochastic screen-space reflections) ⓧ  — Render
199. FidelityFX Denoiser (shadows / reflections) ⓧ  — Render
200. FidelityFX Hybrid Reflections ⓧ  — Render
201. NVIDIA NRD ReBLUR denoiser ⓧ  — Render
202. NVIDIA NRD ReLAX denoiser ⓧ  — Render
203. NVIDIA NRD SIGMA shadow denoiser ⓧ  — Render
204. MLAA (morphological anti-aliasing, Reshetov)  — Edges
205. NVIDIA DLSS super resolution ⓜ  — Sharpen
206. Intel XeSS ⓜ  — Sharpen
207. PSSR (PlayStation Spectral Super Resolution) ⓜ  — Sharpen
208. DLSS Ray Reconstruction ⓜ  — Sharpen
209. FSR 2 temporal upscaling ⓧ  — Sharpen
210. Unreal TSR (Temporal Super Resolution) ⓧ  — Sharpen
211. Unity STP (Spatial-Temporal Post-processing) ⓧ  — Sharpen
212. Arm ASR (Accuracy Super Resolution) ⓧ  — Sharpen
213. MetalFX Temporal Scaler ⓧ  — Sharpen
214. MetalFX Spatial Scaler  — Sharpen

## Phone & webcam AI features (29)

215. Portrait Light (Google Photos ML relighting) ⓜ  — Render
216. Studio Light (Apple Portrait Lighting) ⓜ  — Render
217. Virtual Key Light (NVIDIA Broadcast) ⓜ  — Render
218. Photo Unblur (Google Photos) ⓜ  — Repair
219. Zoom Enhance (Google Pixel) ⓜ  — Repair
220. Shadow Eraser (Samsung Gallery) ⓜ  — Repair
221. Remaster (Samsung Gallery) ⓜ  — Repair
222. Eye Contact (NVIDIA Broadcast gaze redirection) ⓜ  — Repair
223. Generative Fill (Photoshop Firefly) ⓜ  — Repair
224. Generative Expand (Photoshop Firefly) ⓜ  — Repair
225. Night Sight (Pixel burst merge) ⓧ  — Repair
226. Super Res Zoom (Pixel multi-frame) ⓧ  — Repair
227. Best Take (Pixel face swap) ⓧ  — Repair
228. Add Me (Pixel group-photo merge) ⓧ  — Repair
229. Action Pan (Pixel motion mode) ⓧ  — Repair
230. Long Exposure (Pixel motion mode) ⓧ  — Repair
231. Auto Frame (NVIDIA Broadcast) ⓧ  — Repair
232. Silky Water (Huawei light painting) ⓧ  — Repair
233. Light Trails (Huawei light painting) ⓧ  — Repair
234. Star Trails (Huawei light painting) ⓧ  — Repair
235. Head Pose (Snapseed) ⓜ  — Distort
236. Magic Editor (Google Photos) ⓜ  — Distort
237. RTX Video HDR (NVIDIA SDR-to-HDR) ⓜ  — Tone
238. RTX Dynamic Vibrance (NVIDIA app) ⓜ  — Color
239. RTX Video Super Resolution (NVIDIA) ⓜ  — Sharpen
240. RIFE frame interpolation ⓧ  — Augment
241. DLSS Frame Generation ⓧ  — Augment
242. AMD Fluid Motion Frames ⓧ  — Augment
243. Inverse tone mapping (SDR-to-HDR expansion, Banterle 2006) ⓖ  — Tone

## Aurora HDR / Luminar (6)

244. HDR Smart Structure (Aurora HDR)  — Tone
245. Top & Bottom Lighting (Aurora HDR)  — Tone
246. Image Radiance (Aurora HDR)  — Blur
247. HDR Denoise (Aurora HDR)  — Noise
248. Relight AI (Luminar Neo) ⓜ  — Render
249. GenSwap (Luminar Neo) ⓜ  — Repair

## Capture One / Lightroom controls (12)

250. Clarity: Natural (Capture One)  — Tone
251. Clarity: Punch (Capture One)  — Tone
252. Clarity: Neutral (Capture One)  — Tone
253. Clarity: Classic (Capture One)  — Tone
254. Post-Crop Vignette: Highlight Priority (Lightroom)  — Frames
255. Post-Crop Vignette: Color Priority (Lightroom)  — Frames
256. Post-Crop Vignette: Paint Overlay (Lightroom)  — Frames
257. Upright: Level (Lightroom auto horizon) ⓖ  — Distort
258. Upright: Vertical (Lightroom) ⓖ  — Distort
259. Upright: Full (Lightroom) ⓖ  — Distort
260. Guided Upright (Lightroom) ⓖ  — Distort
261. Remove Vignette (Affinity Photo auto devignetting) ⓖ  — Repair

## G'MIC Simulate Film stocks (49)

262. Agfa APX 25 (film simulation)  — Film
263. Fuji Neopan 1600 (film simulation)  — Film
264. Ilford HPS 800 (film simulation)  — Film
265. Kodak HIE High-Speed Infrared (film simulation)  — Film
266. Rollei IR 400 (film simulation)  — Film
267. Rollei Ortho 25 (film simulation)  — Film
268. Rollei Retro 100 Tonal (film simulation)  — Film
269. Polaroid 664 (film simulation)  — Film
270. Polaroid 667 (film simulation)  — Film
271. Polaroid 672 (film simulation)  — Film
272. Polaroid PX-100UV+ (film simulation)  — Film
273. Polaroid PX-680 (film simulation)  — Film
274. Polaroid PX-70 (film simulation)  — Film
275. Polaroid Time Zero Expired (film simulation)  — Film
276. Polaroid Polachrome (film simulation)  — Film
277. Polaroid 665 (film simulation)  — Film
278. Polaroid 665 Negative (film simulation)  — Film
279. Polaroid 690 (film simulation)  — Film
280. Fuji FP-3000b (film simulation)  — Film
281. Fuji FP-3000b Negative (film simulation)  — Film
282. Fuji FP-100c Negative (film simulation)  — Film
283. Fuji Superia 200 (film simulation)  — Film
284. Fuji Superia HG 1600 (film simulation)  — Film
285. Fuji Superia Reala 100 (film simulation)  — Film
286. Fuji Superia X-Tra 800 (film simulation)  — Film
287. Fuji Superia 200 XPRO (film simulation)  — Film
288. Fuji 160C (film simulation)  — Film
289. Fuji 800Z (film simulation)  — Film
290. Fuji Provia 400F (film simulation)  — Film
291. Fuji Provia 400X (film simulation)  — Film
292. Fuji 3510 print film (film simulation)  — Film
293. Fuji 3513 print film (film simulation)  — Film
294. Kodak Elite 100 XPRO (film simulation)  — Film
295. Kodak Elite Color 200 (film simulation)  — Film
296. Kodak Elite Color 400 (film simulation)  — Film
297. Kodak Elite ExtraColor 100 (film simulation)  — Film
298. Kodak Ektachrome 100 VS (film simulation)  — Film
299. Kodak Kodachrome 25 (film simulation)  — Film
300. Kodak Kodachrome 200 (film simulation)  — Film
301. Kodak Portra 160 NC (film simulation)  — Film
302. Kodak Portra 160 VC (film simulation)  — Film
303. Kodak Portra 400 NC (film simulation)  — Film
304. Kodak Portra 400 UC (film simulation)  — Film
305. Kodak Portra 400 VC (film simulation)  — Film
306. Eastman Double-X 5222 (film simulation)  — Film
307. Kodak Pro Image 100 (film simulation)  — Film
308. LomoChrome Color '92 (film simulation)  — Film
309. Ferrania P30 (film simulation)  — Film
310. ADOX Silvermax 100 (film simulation)  — Film

## Microsoft Office artistic effects (11)

311. Cement (Office artistic effect)  — Paint
312. Chalk Sketch (Office artistic effect)  — Paint
313. Crisscross Etching (Office artistic effect)  — Paint
314. Light Screen (Office artistic effect)  — Paint
315. Line Drawing (Office artistic effect)  — Paint
316. Mosaic Bubbles (Office artistic effect)  — Paint
317. Paint Strokes (Office artistic effect)  — Paint
318. Pastels Smooth (Office artistic effect)  — Paint
319. Pencil Grayscale (Office artistic effect)  — Paint
320. Watercolor Sponge (Office artistic effect)  — Paint
321. Paint Brush (Office artistic effect)  — Paint

## Picasa effects (3)

322. Cinemascope (Picasa)  — Insta
323. Sixties (Picasa)  — Insta
324. Warmify (Picasa)  — Insta

## DaVinci Resolve 2 (6)

325. Color Slice (DaVinci Resolve)  — Color
326. Color Stabilizer (ResolveFX) ⓧ  — Color
327. Shot Match (DaVinci Resolve) ⓧ  — Color
328. Stop Motion (ResolveFX) ⓧ  — Stylize
329. Speed Warp (DaVinci Resolve) ⓧ  — Distort
330. Smart Reframe (DaVinci Resolve) ⓜ  — Augment

## Edge-preserving & robust filters (literature) (13)

331. Vector median filter (Astola 1990)  — Blur
332. Vector directional filter (Trahanias 1993)  — Blur
333. Olympic filter (trimmed-extremes mean)  — Blur
334. Peer group filter (Deng-Kenney 2001)  — Blur
335. Saint-Marc adaptive smoothing (1991)  — Blur
336. Side window filter (Yin 2019)  — Blur
337. Curvature filter (Gong-Sbalzarini 2017)  — Blur
338. Gradient domain guided filter (Kou 2015)  — Blur
339. Weighted guided image filter (Li 2015)  — Blur
340. Relative total variation structure extraction (Xu 2012) ⓖ  — Blur
341. Tree filter (Bao 2014) ⓖ  — Blur
342. Joint / cross bilateral filter (flash-no-flash) ⓧ  — Blur
343. Mutual-structure joint filtering (Shen 2015) ⓧ  — Blur

## Feature & edge detectors (literature) (7)

344. Petrou-Kittler optimal ramp-edge detector ⓖ  — Edges
345. Sarkar-Boyer optimal IIR edge filter ⓖ  — Edges
346. Curvature scale space corners (Mokhtarian) ⓖ  — Edges
347. GLOH descriptor field ⓖ  — Edges
348. Difference of Offset Gaussians (DOOG)  — Edges
349. Zuniga-Haralick facet corner  — Edges
350. AGAST keypoints  — Edges

## Contrast & low-light enhancement (literature) (12)

351. MMBEBHE (min mean-brightness-error bi-HE) ⓖ  — Tone
352. RMSHE (recursive mean-separate HE) ⓖ  — Tone
353. BPDHE (brightness-preserving dynamic HE) ⓖ  — Tone
354. POSHE (partially overlapped sub-block HE) ⓖ  — Tone
355. WTHE (weighted thresholded HE) ⓖ  — Tone
356. ESIHE (exposure-based sub-image HE) ⓖ  — Tone
357. ACE automatic color equalization (Rizzi 2003) ⓖ  — Tone
358. MSRCP (multiscale retinex with chromaticity preservation) ⓖ  — Tone
359. Multi-fusion low-light enhancement (Fu 2016) ⓖ  — Tone
360. JED joint enhancement and denoising (Ren 2018) ⓖ  — Tone
361. Robust Retinex (Li 2018) ⓖ  — Tone
362. Wavelet companding HDR (Li-Sharan-Adelson 2005) ⓖ  — Tone

## Dehazing (literature) (6)

363. Color attenuation prior dehaze (Zhu 2015) ⓖ  — Repair
364. Fast visibility restoration (Tarel-Hautiere 2009) ⓖ  — Repair
365. Boundary-constraint dehaze (Meng 2013) ⓖ  — Repair
366. Color-lines dehaze (Fattal 2014) ⓖ  — Repair
367. DehazeNet ⓜ  — Repair
368. AOD-Net ⓜ  — Repair

## Segmentation, texture & denoising (literature) (12)

369. Compact watershed (Neubert-Protzel 2014) ⓖ  — Analysis
370. Random walker segmentation (Grady 2006) ⓖ  — Analysis
371. ERS entropy-rate superpixels ⓖ  — Analysis
372. Turbopixels ⓖ  — Analysis
373. GLDM grey-level dependence map ⓖ  — Analysis
374. Local derivative pattern (Zhang 2010)  — Analysis
375. BSIF binarized statistical image features  — Analysis
376. K-SVD dictionary denoising ⓖ  — Noise
377. WNNM weighted nuclear norm denoising ⓖ  — Noise
378. EPLL patch-prior denoising ⓖ  — Noise
379. VisuShrink wavelet threshold ⓖ  — Noise
380. SureShrink wavelet threshold ⓖ  — Noise

## Neural restoration & editing models (28)

381. DnCNN ⓜ  — Noise
382. FFDNet ⓜ  — Noise
383. Restormer ⓜ  — Noise
384. Uformer ⓜ  — Noise
385. MPRNet ⓜ  — Noise
386. MIRNet ⓜ  — Noise
387. RetinexNet ⓜ  — Tone
388. KinD low-light ⓜ  — Tone
389. URetinex-Net ⓜ  — Tone
390. SCI self-calibrated illumination ⓜ  — Tone
391. HDRNet (Gharbi 2017) ⓜ  — Tone
392. DeepLPF ⓜ  — Tone
393. CURL curve-based enhancement ⓜ  — Tone
394. Image-adaptive 3D LUT (Zeng 2020) ⓜ  — Tone
395. SRGAN ⓜ  — Sharpen
396. EDSR ⓜ  — Sharpen
397. RCAN ⓜ  — Sharpen
398. HAT (hybrid attention transformer SR) ⓜ  — Sharpen
399. BSRGAN ⓜ  — Sharpen
400. CodeFormer ⓜ  — Repair
401. RestoreFormer ⓜ  — Repair
402. Stable Diffusion inpainting ⓜ  — Repair
403. DDColor ⓜ  — Color
404. ColTran ⓜ  — Color
405. BigColor ⓜ  — Color
406. ControlNet ⓜ  — Stylize
407. InstructPix2Pix ⓜ  — Stylize
408. SDEdit ⓜ  — Stylize

## Apple iMovie filters (7)

409. Blast (iMovie)  — Insta
410. Blockbuster (iMovie)  — Insta
411. Dreamy (iMovie)  — Insta
412. Western (iMovie)  — Insta
413. Camo (iMovie)  — Insta
414. Comic Vintage (iMovie)  — Insta
415. Silent Era (iMovie)  — Film

## Premiere Pro immersive & assist (12)

416. VR Blur (seam-aware 360 blur)  — Blur
417. VR Glow (360)  — Blur
418. VR Sharpen (360)  — Sharpen
419. VR De-Noise (360)  — Noise
420. VR Fractal Noise (360)  — Noise
421. VR Chromatic Aberrations (360)  — Distort
422. VR Digital Glitch (360)  — Distort
423. VR Plane to Sphere  — Distort
424. VR Color Gradients (360)  — Render
425. Warp Stabilizer (Premiere / After Effects) ⓧ  — Repair
426. Morph Cut (Premiere) ⓧ  — Repair
427. Auto Reframe (Premiere) ⓜ  — Augment

## Scientific imaging leftovers (10)

428. Boolean texture (VTK vtkBooleanTexture)  — Render
429. Triangular texture (VTK vtkTriangularTexture)  — Render
430. Young-van Vliet recursive Gaussian (Halide iir_blur) ⓖ  — Blur
431. Bilateral guided upsampling (BGU, Chen 2016) ⓧ  — Sharpen
432. Linear Kuwahara (Fiji)  — Paint
433. Bleach correction (Fiji, photobleaching) ⓧ  — Tone
434. HK-Means (Icy hierarchical K-means) ⓖ  — Analysis
435. Crisp (ERDAS IMAGINE)  — Sharpen
436. Destripe (ERDAS / ENVI sensor striping removal) ⓖ  — Repair
437. Replace Bad Lines (ERDAS IMAGINE)  — Repair

## lygia shader library (10)

438. Fibonacci bokeh (lygia)  — Blur
439. RYB hue shift (lygia artist colour wheel)  — Color
440. Zorn palette (lygia)  — Color
441. Wada Sanzo palette (lygia)  — Color
442. Ridgway palette (lygia)  — Color
443. Flexoki palette (lygia)  — Color
444. Reinhard-Jodie tonemap  — Tone
445. Untile (Quilez texture-repetition breakup)  — Materials
446. psrdnoise (periodic rotating simplex noise)  — Noise
447. Gerstner waves heightmap  — Terrain
