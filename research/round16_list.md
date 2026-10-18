# Round 16 harvest: 501 techniques not yet in Filter Nexus

Checked by `research/dedupe16.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-15 names and the index.html option labels. 271 are buildable as GPU shaders; 204 need whole-image/sequential work, 5 need a neural net, 21 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## Tone mapping operators (literature) (7)

1. Interactive local tone adjustment (Lischinski 2006) ⓖ  — Tone
2. Lightness-perception tone mapping (Krawczyk 2005) ⓖ  — Tone
3. Display-optimal tone curve (Mai 2011) ⓖ  — Tone
4. Linear windowed tone mapping (Shan 2010) ⓖ  — Tone
5. Subband compression tone mapping (Li-Sharan-Adelson 2005) ⓖ  — Tone
6. Photoreceptor encoding tone mapping (Van Hateren 2006)  — Tone
7. LCIS low-curvature image simplifier (Tumblin-Turk 1999)  — Tone

## Dehazing & underwater restoration (literature) (22)

8. Visibility in bad weather (Tan 2008, contrast maximisation) ⓖ  — Repair
9. Single image dehazing by ICA (Fattal 2008) ⓖ  — Repair
10. Optimized contrast enhancement dehaze (Kim 2013) ⓖ  — Repair
11. DEFADE fog-density dehaze (Choi 2015) ⓖ  — Repair
12. Colour ellipsoid prior dehaze (Bui-Kim 2018) ⓖ  — Repair
13. Fusion-based dehazing (Ancuti 2013)  — Repair
14. AMEF artificial multi-exposure fusion dehaze (Galdran 2018)  — Repair
15. Maximum reflectance prior night dehaze (Zhang 2017)  — Repair
16. Night haze glow removal (Li-Tan-Brown 2015)  — Repair
17. Bright channel prior  — Repair
18. Median dark channel prior (Gibson 2012)  — Repair
19. UDCP underwater dark channel prior (Drews 2013)  — Repair
20. Red channel prior underwater (Galdran 2015)  — Repair
21. GDCP generalized dark channel prior (Peng 2018)  — Repair
22. ULAP underwater light attenuation prior (Song 2018)  — Repair
23. Underwater colour balance & fusion (Ancuti 2018)  — Repair
24. ICM integrated colour model (Iqbal 2007)  — Repair
25. UCM unsupervised colour correction (Iqbal 2010)  — Repair
26. MLLE minimal colour loss & local contrast (Zhang 2022)  — Repair
27. Maximum intensity prior underwater (Carlevaris-Bianco 2010)  — Repair
28. IBLA blurriness & light absorption (Peng-Cosman 2017) ⓖ  — Repair
29. HLRP hyper-Laplacian reflectance priors (Zhuang 2022) ⓖ  — Repair

## Contrast & low-light enhancement 2 (literature) (20)

30. Multi-scale fusion low-light (Fu 2016)  — Tone
31. LECARM camera-response enhancement (Ying 2017)  — Tone
32. WAHE weighted approximated HE (Arici 2009) ⓖ  — Tone
33. RSIHE recursive sub-image HE (Sim 2007) ⓖ  — Tone
34. DHE dynamic histogram equalisation (Abdullah-Al-Wadud 2007) ⓖ  — Tone
35. BHEPL bi-HE with plateau limit (Ooi 2009) ⓖ  — Tone
36. MVSIHE mean & variance sub-image HE (Zhuang 2015) ⓖ  — Tone
37. RLBHE range-limited bi-HE (Zuo 2013) ⓖ  — Tone
38. Gray-level grouping (Chen-Abidi 2006) ⓖ  — Tone
39. Exact histogram specification (Coltuc 2006) ⓖ  — Tone
40. Plateau HE for infrared (Vickers 1996) ⓖ  — Tone
41. Fuzzy contrast enhancement (Tizhoosh 1997) ⓖ  — Tone
42. Alpha rooting (Aghagolzadeh 1992)  — Tone
43. Logarithmic image processing LIP (Jourlin-Pinoli)  — Tone
44. Parameterized LIP (Panetta 2008)  — Tone
45. Contrast pyramid / ratio of low-pass pyramid (Toet 1989)  — Tone
46. Adaptive unsharp masking (Polesel 2000)  — Tone
47. Rational unsharp masking (Ramponi 1996)  — Tone
48. Kernel regression sharpening (Takeda 2007)  — Tone
49. Multiscale shape & detail enhancement (Fattal 2007)  — Tone

## Denoising (literature) (23)

50. LSSC learned simultaneous sparse coding (Mairal 2009) ⓖ  — Noise
51. Noise Clinic (Lebrun 2015) ⓖ  — Noise
52. SAIST spatially adaptive iterative singular-value thresholding (Dong 2013) ⓖ  — Noise
53. NCSR nonlocally centralized sparse representation (Dong 2013) ⓖ  — Noise
54. LPG-PCA denoising (Zhang 2010) ⓖ  — Noise
55. TNRD trainable nonlinear reaction diffusion (Chen-Pock 2017) ⓖ  — Noise
56. Shrinkage fields (Schmidt-Roth 2014) ⓖ  — Noise
57. Wavelet hidden Markov tree denoising (Crouse 1998) ⓖ  — Noise
58. DA3D data-adaptive dual-domain denoising (Pierazzo 2015)  — Noise
59. Non-local TV denoising (Gilboa-Osher)  — Noise
60. NeighShrink wavelet denoising (Chen 2004)  — Noise
61. BLS-GSM wavelet denoising (Portilla 2003)  — Noise
62. Bivariate shrinkage (Sendur-Selesnick 2002)  — Noise
63. SURE-LET denoising (Luisier-Blu 2007)  — Noise
64. Dual-tree complex wavelet denoising (Selesnick-Kingsbury)  — Noise
65. Bandlet denoising (Le Pennec-Mallat)  — Noise
66. Ridgelet denoising (Candes-Donoho)  — Noise
67. Progressive switching median (Wang-Zhang 1999)  — Noise
68. Decision-based median filter (Srinivasan 2007)  — Noise
69. Center-weighted median filter (Ko-Lee 1991)  — Noise
70. Directional distance filter (Karakos-Trahanias 1997)  — Noise
71. Rank-conditioned rank-selection filter (Hardie-Barner 1994)  — Noise
72. Detail-preserving anisotropic diffusion (Aja-Fernandez 2006)  — Noise

## Deblurring & deconvolution (literature) (20)

73. Blind deconvolution by variational Bayes (Fergus 2006) ⓖ  — Sharpen
74. High-quality motion deblurring (Shan 2008) ⓖ  — Sharpen
75. Fast motion deblurring (Cho-Lee 2009) ⓖ  — Sharpen
76. Normalized sparsity blind deblur (Krishnan 2011) ⓖ  — Sharpen
77. Two-phase kernel estimation (Xu-Jia 2010) ⓖ  — Sharpen
78. L0 intensity & gradient prior deblur (Pan 2014) ⓖ  — Sharpen
79. Dark channel prior deblurring (Pan 2016) ⓖ  — Sharpen
80. Spectral irregularities blind deblur (Goldstein-Fattal 2012) ⓖ  — Sharpen
81. Non-uniform shake deblurring (Whyte 2010) ⓖ  — Sharpen
82. Jansson-van Cittert deconvolution ⓖ  — Sharpen
83. Richardson-Lucy total variation (Dey 2006) ⓖ  — Sharpen
84. FISTA deconvolution (Beck-Teboulle 2009) ⓖ  — Sharpen
85. Non-negative least squares deconvolution ⓖ  — Sharpen
86. Bounded-variable least squares deconvolution ⓖ  — Sharpen
87. CLEAN deconvolution (Hogbom 1974) ⓖ  — Sharpen
88. Pixon image reconstruction (Pina-Puetter 1993) ⓖ  — Sharpen
89. Sparse deconvolution (Sparse-SIM, Zhao 2022) ⓖ  — Sharpen
90. Huygens CMLE classic maximum likelihood estimation ⓖ  — Sharpen
91. Nearest-neighbours deblurring (Agard 1984)  — Sharpen
92. No-neighbours deblurring  — Sharpen

## Microscopy & medical imaging (literature) (24)

93. CIDRE illumination correction (Smith 2015) ⓧ  — Repair
94. HiLo optical sectioning (Mertz) ⓧ  — Repair
95. SRRF super-resolution radial fluctuations (Gustafsson 2016) ⓧ  — Repair
96. SOFI super-resolution optical fluctuation imaging (Dertinger 2009) ⓧ  — Repair
97. Transport of intensity equation phase retrieval ⓧ  — Repair
98. Fourier ring correlation resolution map ⓧ  — Repair
99. Dual-energy subtraction radiography ⓧ  — Repair
100. DIC Hilbert-transform reconstruction (Arnison 2004)  — Analysis
101. Maximum intensity projection (MIP)  — Analysis
102. Minimum intensity projection (MinIP)  — Analysis
103. Hounsfield-unit windowing (CT)  — Analysis
104. Phase-contrast halo & shade-off removal (Yin-Kanade 2012)  — Repair
105. FIB-SEM curtaining removal  — Repair
106. Ring artifact removal (CT)  — Repair
107. Gibbs ringing removal (Kellner 2016)  — Repair
108. Metal artifact reduction (MAR)  — Repair
109. Beam hardening correction  — Repair
110. Pectoral muscle removal (mammography)  — Repair
111. Bone suppression (chest X-ray)  — Repair
112. Ultrasound log compression  — Repair
113. Khan stain normalization (2014)  — Repair
114. Optical density transform (Beer-Lambert)  — Repair
115. Specular reflection removal (endoscopy)  — Repair
116. Fundus image enhancement (luminosity & contrast normalisation)  — Sharpen

## Saliency models (literature) (18)

117. SUN saliency (Zhang 2008)  — Analysis
118. LC luminance-contrast saliency (Zhai-Shah 2006)  — Analysis
119. Maximum symmetric surround saliency (Achanta 2010)  — Analysis
120. Self-resemblance saliency (Seo-Milanfar 2009)  — Analysis
121. Covariance saliency (Erdem 2013)  — Analysis
122. SIM saliency (Murray 2011)  — Analysis
123. AWS adaptive whitening saliency (Garcia-Diaz 2012)  — Analysis
124. RARE2012 rarity saliency (Riche 2013)  — Analysis
125. Region contrast saliency (Cheng 2011) ⓖ  — Analysis
126. Manifold ranking saliency GMR (Yang 2013) ⓖ  — Analysis
127. Robust background detection saliency RBD (Zhu 2014) ⓖ  — Analysis
128. Dense & sparse reconstruction saliency (Li 2013) ⓖ  — Analysis
129. Markov chain saliency (Jiang 2013) ⓖ  — Analysis
130. Saliency filters (Perazzi 2012) ⓖ  — Analysis
131. Geodesic saliency (Wei 2012) ⓖ  — Analysis
132. FASA fast accurate size-aware saliency (Yildirim 2015) ⓖ  — Analysis
133. Hierarchical saliency (Yan 2013) ⓖ  — Analysis
134. Saliency optimization wCtr (Zhu 2014) ⓖ  — Analysis

## Texture descriptors (literature) (9)

135. CS-LBP center-symmetric LBP (Heikkila 2009)  — Sensor
136. Median binary pattern (Hafiane 2007)  — Sensor
137. Local tetra patterns (Murala 2012)  — Sensor
138. Local directional number pattern (Rivera 2013)  — Sensor
139. Elongated LBP (Liao-Chung 2007)  — Sensor
140. Extended LBP CI/NI/RD/AD-LBP (Liu 2012)  — Sensor
141. Local configuration pattern (Guo 2011)  — Sensor
142. Local contrast patterns (Song 2014)  — Sensor
143. Dominant LBP (Liao 2009) ⓖ  — Sensor

## Feature & edge detectors 2 (literature) (9)

144. Hessian-affine regions (Mikolajczyk-Schmid 2004)  — Edges
145. Heitger corner detector (1992)  — Edges
146. SFOP scale-invariant feature operator (Forstner 2009)  — Edges
147. Spacek optimal edge detector (1986)  — Edges
148. Fuzzy edge detection (Russo)  — Edges
149. Lanser-Eckstein edge detector (1992)  — Edges
150. Boie-Cox edge detector (1987)  — Edges
151. Pb probability of boundary (Martin-Fowlkes-Malik 2004)  — Edges
152. Sketch tokens (Lim-Zitnick-Dollar 2013) ⓜ  — Edges

## Thresholding & binarisation (literature) (35)

153. Pun entropy threshold (1980) ⓖ  — Analysis
154. Abutaleb 2D entropy threshold (1989) ⓖ  — Analysis
155. Tsallis entropy threshold ⓖ  — Analysis
156. Arimoto entropy threshold ⓖ  — Analysis
157. Pal-Pal entropy threshold ⓖ  — Analysis
158. Relative entropy threshold (Chang 1994) ⓖ  — Analysis
159. Rosenfeld convex-hull threshold (1983) ⓖ  — Analysis
160. Sezan peak-valley threshold (1990) ⓖ  — Analysis
161. Pikaz topological stable-state threshold (1995) ⓖ  — Analysis
162. O'Gorman connectivity threshold (1994) ⓖ  — Analysis
163. Beghdadi block-entropy threshold (1995) ⓖ  — Analysis
164. Jawahar fuzzy threshold (1997) ⓖ  — Analysis
165. Hertz-Schafer edge-coincidence threshold (1988) ⓖ  — Analysis
166. Lloyd threshold (1985) ⓖ  — Analysis
167. Brink cross-entropy threshold (1996) ⓖ  — Analysis
168. Johannsen-Bille threshold (1982) ⓖ  — Analysis
169. AdOtsu (Moghaddam-Cheriet 2012) ⓖ  — Analysis
170. Lelore-Bouchara binarization (2013) ⓖ  — Analysis
171. Jia structural symmetric pixels (2018) ⓖ  — Analysis
172. Hedjam spatially adaptive binarization (2011) ⓖ  — Analysis
173. Kligler visibility binarization (2018) ⓖ  — Analysis
174. Phase-based binarization (Nafchi 2014) ⓖ  — Analysis
175. White-Rohrer dynamic threshold (1983)  — Analysis
176. Yanowitz-Bruckstein threshold (1989)  — Analysis
177. Chow-Kaneko threshold (1972)  — Analysis
178. Eikvil threshold (1991)  — Analysis
179. Parker threshold (1991)  — Analysis
180. Palumbo threshold (1986)  — Analysis
181. Oh threshold (1999)  — Analysis
182. Mardia-Hainsworth threshold (1988)  — Analysis
183. Kamel-Zhao threshold (1993)  — Analysis
184. Yasuda threshold (1980)  — Analysis
185. Valizadeh contrast-independent binarization (2009)  — Analysis
186. Adaptive water-flow binarization (Valizadeh-Kabir 2012)  — Analysis
187. Multiscale Sauvola (Lazzara-Geraud 2013)  — Analysis

## Segmentation & superpixels (literature) (15)

188. Mumford-Shah segmentation ⓖ  — Analysis
189. SNIC simple non-iterative clustering (Achanta 2017) ⓖ  — Analysis
190. ETPS extended topology preserving superpixels (Yao 2015) ⓖ  — Analysis
191. Superpixel lattices (Moore 2008) ⓖ  — Analysis
192. JSEG (Deng-Manjunath 2001) ⓖ  — Analysis
193. CRS contour relaxed superpixels (Conrad 2013) ⓖ  — Analysis
194. ERGC eikonal region growing clustering (Buyssens 2014) ⓖ  — Analysis
195. preSLIC (Neubert-Protzel 2014) ⓖ  — Analysis
196. Power watershed (Couprie 2011) ⓖ  — Analysis
197. Gaussian mixture model segmentation (EM) ⓖ  — Analysis
198. Graph cut segmentation (Boykov-Jolly 2001) ⓖ  — Analysis
199. Distance-regularized level set (Li 2010) ⓖ  — Analysis
200. Local binary fitting active contour (Li 2007) ⓖ  — Analysis
201. Lazy snapping (Li 2004) ⓧ  — Analysis
202. Intelligent scissors (Mortensen-Barrett 1995) ⓧ  — Analysis

## Mathematical morphology 2 (literature) (10)

203. Rank-max opening (Soille 2002) ⓖ  — Analysis
204. Attribute profile (Dalla Mura 2010) ⓖ  — Analysis
205. Tree of shapes (Monasse-Guichard 2000) ⓖ  — Analysis
206. Ultimate opening (Beucher 2007) ⓖ  — Analysis
207. Volume opening (Vachier) ⓖ  — Analysis
208. Morphological dynamics (Grimaud 1992) ⓖ  — Analysis
209. Extended morphological profile (Benediktsson 2005) ⓖ  — Analysis
210. Morphological amoebas (Lerallut 2005)  — Analysis
211. Fuzzy morphology (Bloch-Maitre)  — Analysis
212. Soft morphological filters (Koskinen 1991)  — Analysis

## Halftoning & dithering 2 (literature) (16)

213. Edge-enhanced error diffusion (Eschbach-Knox 1991) ⓖ  — Retro
214. Threshold-modulated error diffusion ⓖ  — Retro
215. Green-noise halftoning (Lau-Arce 1998) ⓖ  — Retro
216. Space-filling curve dither (Velho-Gomes 1991) ⓖ  — Retro
217. Model-based halftoning (Pappas-Neuhoff 1999) ⓖ  — Retro
218. Lattice-Boltzmann dithering (Hagenburg 2009) ⓖ  — Retro
219. Block error diffusion (Damera-Venkata-Evans 2001) ⓖ  — Retro
220. AM-FM hybrid halftoning ⓖ  — Retro
221. Sigma-delta modulation halftoning ⓖ  — Retro
222. Tone-dependent error diffusion (Li-Allebach 2002) ⓖ  — Retro
223. Multiscale error diffusion (Katsavounidis-Kuo 1997) ⓖ  — Retro
224. Peano curve dither ⓖ  — Retro
225. Serpentine-scan error diffusion ⓖ  — Retro
226. Electrostatic halftoning (Schmaltz 2010) ⓖ  — Retro
227. Capacity-constrained point distribution halftoning (Balzer 2009) ⓖ  — Retro
228. Poisson-disk dithering  — Retro

## Image quality metrics 2 (literature) (26)

229. IFC information fidelity criterion (Sheikh 2005) ⓧ  — Analysis
230. UQI universal quality index (Wang-Bovik 2002) ⓧ  — Analysis
231. MAD most apparent distortion (Larson-Chandler 2010) ⓧ  — Analysis
232. ESSIM edge-strength similarity (Zhang 2013) ⓧ  — Analysis
233. RFSIM Riesz-transform feature similarity (Zhang 2010) ⓧ  — Analysis
234. GSM gradient similarity (Liu 2012) ⓧ  — Analysis
235. NQM noise quality measure (Damera-Venkata 2000) ⓧ  — Analysis
236. WSNR weighted SNR ⓧ  — Analysis
237. DSS DCT subband similarity (Balanov 2015) ⓧ  — Analysis
238. Daly visible differences predictor (1993) ⓧ  — Analysis
239. CIEDE2000 difference map ⓧ  — Analysis
240. MLV maximum local variation sharpness (Bahrami 2014) ⓖ  — Analysis
241. LPC-SI local phase coherence sharpness (Hassen 2013) ⓖ  — Analysis
242. ARISM autoregressive sharpness (Gu 2015) ⓖ  — Analysis
243. SSEQ spatial-spectral entropy quality (Liu 2014) ⓖ  — Analysis
244. CurveletQA (Liu 2014) ⓖ  — Analysis
245. GM-LOG gradient magnitude & LoG quality (Xue 2014) ⓖ  — Analysis
246. CEIQ contrast-enhanced image quality (Yan 2019) ⓖ  — Analysis
247. UCIQE underwater colour image quality (Yang-Sowmya 2015) ⓖ  — Analysis
248. UIQM underwater image quality measure (Panetta 2016) ⓖ  — Analysis
249. NIQMC no-reference contrast quality (Gu 2017) ⓖ  — Analysis
250. BIQME blind enhanced-image quality (Gu 2018) ⓖ  — Analysis
251. Marziliano edge-width blur metric (2002) ⓖ  — Analysis
252. NFERM free-energy quality (Gu 2015) ⓖ  — Analysis
253. CORNIA codebook quality (Ye 2012) ⓜ  — Analysis
254. QAC quality-aware clustering (Xue 2013) ⓜ  — Analysis

## Colour constancy & decolourisation (literature) (21)

255. General gray world (Barnard 2002) ⓖ  — Color
256. Gamut mapping colour constancy (Forsyth 1990) ⓖ  — Color
257. Bayesian colour constancy (Gehler 2008) ⓖ  — Color
258. Natural image statistics colour constancy (Gijsenij-Gevers 2011) ⓖ  — Color
259. Local surface reflectance statistics (Gao 2014) ⓖ  — Color
260. Grayness index (Qian 2019) ⓖ  — Color
261. PCA-based colour constancy (Cheng 2014) ⓖ  — Color
262. Corrected-moment illuminant estimation (Finlayson 2013) ⓖ  — Color
263. Color by correlation (Finlayson-Hordley-Hubel 2001) ⓖ  — Color
264. Double-opponency colour constancy (Gao 2015) ⓖ  — Color
265. Spatio-spectral statistics colour constancy (Chakrabarti 2012) ⓖ  — Color
266. Dark pixels illuminant estimation ⓖ  — Color
267. Color2Gray (Gooch 2005) ⓖ  — Color
268. Decolorize (Grundland-Dodgson 2007) ⓖ  — Color
269. Apparent greyscale (Smith 2008) ⓖ  — Color
270. Neumann perceptual decolorization (2007) ⓖ  — Color
271. Rasche re-colouring (2005) ⓖ  — Color
272. Robust colour-to-gray (Kim 2009) ⓖ  — Color
273. Recolouring for dichromats (Kuhn 2008) ⓖ  — Color
274. Local space average colour (Ebner 2007)  — Color
275. Convolutional colour constancy (Barron 2015) ⓜ  — Color

## Interpolation & super-resolution (literature) (19)

276. iNEDI improved NEDI (Asuni-Giachetti 2008)  — Sharpen
277. SAI soft-decision adaptive interpolation (Zhang-Wu 2008)  — Sharpen
278. Curvature interpolation method (Kim-Cha-Kim 2011)  — Sharpen
279. Akima interpolation  — Sharpen
280. Lagrange interpolation  — Sharpen
281. Magic Kernel Sharp (Costella)  — Sharpen
282. Hamming-windowed sinc resampling  — Sharpen
283. OMOMS interpolation (Blu-Thevenaz-Unser 2001)  — Sharpen
284. Schaum interpolation (1993)  — Sharpen
285. Edge-statistics upsampling (Fattal 2007)  — Sharpen
286. Fast image upsampling (Shan 2008)  — Sharpen
287. Gradient profile prior SR (Sun 2008)  — Sharpen
288. Iterative back-projection SR (Irani-Peleg 1991)  — Sharpen
289. Single-image SR from internal patches (Glasner 2009) ⓖ  — Sharpen
290. Example-based super-resolution (Freeman 2002) ⓖ  — Sharpen
291. Sparse-coding super-resolution (Yang 2010) ⓖ  — Sharpen
292. A+ adjusted anchored neighbourhood regression (Timofte 2014) ⓖ  — Sharpen
293. Self-exemplars super-resolution (Huang 2015) ⓖ  — Sharpen
294. Kernel ridge regression SR (Kim-Kwon 2010) ⓖ  — Sharpen

## Inpainting & synthesis (literature) (19)

295. Bertalmio PDE inpainting (2000)  — Repair
296. TV inpainting (Chan-Shen)  — Repair
297. CDD curvature-driven diffusion inpainting  — Repair
298. Euler's elastica inpainting  — Repair
299. Mumford-Shah-Euler inpainting (Esedoglu-Shen)  — Repair
300. Oliveira fast inpainting (2001)  — Repair
301. Cahn-Hilliard inpainting (Bertozzi 2007)  — Repair
302. Harmonic inpainting  — Repair
303. Priority-BP inpainting (Komodakis 2006) ⓖ  — Repair
304. Coherency sensitive hashing (Korman-Avidan 2011) ⓖ  — Repair
305. Resynthesizer (Harrison 2001) ⓖ  — Repair
306. Wei-Levoy tree-structured texture synthesis (2000) ⓖ  — Repair
307. Ashikhmin natural texture synthesis (2001) ⓖ  — Repair
308. Graphcut textures (Kwatra 2003) ⓖ  — Repair
309. Shift-map image editing (Pritch 2009) ⓖ  — Repair
310. Exemplar inpainting with patch sparsity (Xu-Sun 2010) ⓖ  — Repair
311. Image melding (Darabi 2012) ⓖ  — Repair
312. Statistics of patch offsets completion (He-Sun 2012) ⓖ  — Repair
313. Texture-by-numbers (Hertzmann image analogies) ⓧ  — Repair

## Edge-preserving & robust filters 2 (literature) (16)

314. Static/dynamic filter (Ham 2015) ⓖ  — Blur
315. Segment graph filter (Zhang 2015) ⓖ  — Blur
316. Region covariance smoothing (Karacan 2013) ⓖ  — Blur
317. Iterative least squares smoothing ILS (Liu 2020) ⓖ  — Blur
318. Structure-texture decomposition (Aujol 2006) ⓖ  — Blur
319. Meyer G-norm cartoon-texture decomposition (2001) ⓖ  — Blur
320. Vese-Osher decomposition (2003) ⓖ  — Blur
321. Total variation L1 (TV-L1, Nikolova) ⓖ  — Blur
322. L1 image transform smoothing (Bi-Han-Yu 2015) ⓖ  — Blur
323. Trilateral filter (Choudhury-Tumblin 2003)  — Blur
324. Permutohedral lattice filtering (Adams 2010)  — Blur
325. Interval gradient filtering (Lee 2017)  — Blur
326. Beltrami flow (Sochen-Kimmel-Malladi)  — Blur
327. Alvarez-Mazorra shock filter (1994)  — Blur
328. Gaussian KD-tree filtering (Adams 2009)  — Blur
329. Recursive bilateral filter (Yang 2012)  — Blur

## Reflectance & weather removal (literature) (11)

330. Entropy-minimisation shadow removal (Finlayson 2004) ⓖ  — Repair
331. Specular-free image (Tan-Ikeuchi 2005) ⓖ  — Repair
332. Specular-free two-band (Shen 2008) ⓖ  — Repair
333. Rain streak removal by sparse decomposition (Kang 2012) ⓖ  — Repair
334. GMM layer-prior deraining (Li 2016) ⓖ  — Repair
335. Discriminative sparse coding deraining (Luo 2015) ⓖ  — Repair
336. Single-image reflection removal (Li-Brown 2014) ⓖ  — Repair
337. Single-image snow removal ⓖ  — Repair
338. Intrinsic images in the wild (Bell 2014) ⓜ  — Repair
339. SA-DCT deblocking (Foi 2007)  — Repair
340. POCS deblocking  — Repair

## Demosaicing (literature) (9)

341. Kimmel demosaic (1999)  — Sensor
342. ACPI adaptive colour plane interpolation  — Sensor
343. GBTF gradient-based threshold-free demosaic (2010)  — Sensor
344. Residual interpolation demosaic (Kiku 2013)  — Sensor
345. MLRI minimised-Laplacian residual interpolation (2014)  — Sensor
346. ARI adaptive residual interpolation (Monno 2015)  — Sensor
347. Smooth hue transition demosaic (Cok 1987)  — Sensor
348. Laroche-Prescott demosaic (1994)  — Sensor
349. Freeman median demosaic (1988)  — Sensor

## RGB vegetation & soil indices 2 (12)

350. GLAI green leaf area index  — Sensor
351. Overall saturation index (SAT)  — Sensor
352. Overall hue index (HUE)  — Sensor
353. Brightness index BI (soil)  — Sensor
354. Spectral-slope saturation index SI  — Sensor
355. Hue index HI (soil)  — Sensor
356. Coloration index CI  — Sensor
357. Green-blue index GBI  — Sensor
358. True colour vegetation index TCVI  — Sensor
359. Green-red ratio index GRRI  — Sensor
360. Red-blue ratio index RBRI  — Sensor
361. NRBDI normalised red-blue difference index  — Sensor

## Broadcast scopes & test signals (25)

362. Lightning display (Tektronix)  — Analysis
363. Diamond gamut display (Tektronix)  — Analysis
364. Arrowhead gamut display (Tektronix)  — Analysis
365. Spearhead display (Tektronix)  — Analysis
366. Blue-only monitor check  — Analysis
367. Stop display (log waveform, Tektronix)  — Analysis
368. Superwhite / illegal level highlight  — Analysis
369. PLUGE (picture line-up generation equipment)  — Render
370. SMPTE colour bars  — Render
371. EBU colour bars  — Render
372. ARIB STD-B28 colour bars  — Render
373. Multiburst test signal  — Render
374. Staircase test signal  — Render
375. SDI checkfield (pathological)  — Render
376. Philips PM5544 test pattern  — Render
377. Telefunken FuBK test card  — Render
378. BBC Test Card F  — Render
379. RCA Indian-head test pattern  — Render
380. Bowtie test signal  — Render
381. Siemens star  — Render
382. USAF 1951 resolution target  — Render
383. ISO 12233 resolution chart  — Render
384. Title-safe / action-safe overlay  — Frames
385. Camera frame lines overlay  — Frames
386. Slanted-edge MTF (ISO 12233) ⓖ  — Analysis

## Retinex variants (literature) (9)

387. Random spray Retinex RSR (Provenzi 2007)  — Tone
388. Light random sprays Retinex (Banic-Loncaric 2013)  — Tone
389. Termite Retinex (Simone 2014)  — Tone
390. QBRIX quantile-based Retinex (Gianini 2014)  — Tone
391. Frankle-McCann Retinex (1983)  — Tone
392. McCann99 multiresolution Retinex  — Tone
393. Land path-based Retinex (1971)  — Tone
394. Retinex PDE formalisation (Morel 2010)  — Tone
395. Variational Retinex (Kimmel 2003) ⓖ  — Tone

## Inverse tone mapping (literature) (5)

396. Akyuz linear-gamma expansion (2007)  — Tone
397. Rempel LDR2HDR brightness enhancement (2007)  — Tone
398. Kovaleski-Oliveira bilateral expansion (2009)  — Tone
399. Huo physiological inverse tone mapping (2014)  — Tone
400. Masia exposure-adaptive gamma expansion (2009)  — Tone

## Lines, contours & shape cues (literature) (13)

401. ELSED enhanced line segment drawing (Suarez 2022) ⓖ  — Edges
402. EDCircles circle detector (Akinlar-Topal 2013) ⓖ  — Edges
403. ELSDc ellipse & line segment detector (Patraucean) ⓖ  — Edges
404. Surround-inhibition contour detector (Grigorescu-Petkov 2003)  — Edges
405. CORF push-pull contour operator (Azzopardi 2014)  — Edges
406. Tsai-Shah linear shape from shading (1994) ⓖ  — Depth
407. Zheng-Chellappa shape from shading (1991) ⓖ  — Depth
408. Defocus map estimation (Zhuo-Sim 2011) ⓖ  — Depth
409. Defocus magnification (Bae-Durand 2007) ⓖ  — Depth
410. Just noticeable defocus blur detection (Shi 2015)  — Analysis
411. HiFST high-frequency DCT blur detection (Golestaneh 2017)  — Analysis
412. LBP-based defocus sharpness (Yi-Eramian 2016)  — Analysis
413. Spectral partial blur detection (Liu 2008)  — Analysis

## Skin, noise estimation & quantisation (literature) (10)

414. Jones-Rehg Bayesian skin model (2002)  — Analysis
415. YCbCr skin map (Chai-Ngan 1999)  — Analysis
416. PCA weak-texture noise level estimation (Liu 2013) ⓖ  — Analysis
417. MAD wavelet noise estimator (Donoho 1995) ⓖ  — Analysis
418. Popularity colour quantisation (Heckbert 1982) ⓖ  — Retro
419. Spatial colour quantisation (Puzicha 2000 / scolorq) ⓖ  — Retro
420. Pairwise nearest neighbour quantisation (Equitz 1989) ⓖ  — Retro
421. Variance-based quantisation (Wan 1990) ⓖ  — Retro
422. Greedy orthogonal bipartition quantisation ⓖ  — Retro
423. Binary splitting quantisation (Orchard-Bouman 1991) ⓖ  — Retro

## Camera & lens models (literature) (6)

424. Division model lens distortion (Fitzgibbon 2001)  — Distort
425. Kannala-Brandt fisheye model (2006)  — Distort
426. Unified camera model (Mei 2007)  — Distort
427. Double sphere camera model (Usenko 2018)  — Distort
428. Field-of-view lens model (Devernay-Faugeras 2001)  — Distort
429. Single-image vignetting estimation (Zheng 2009) ⓖ  — Analysis

## Focus measure operators (Pertuz 2013) (22)

430. ACMO absolute central moment focus  — Analysis
431. CONT image contrast focus (Nanda)  — Analysis
432. CURV image curvature focus  — Analysis
433. DCTE DCT energy ratio focus  — Analysis
434. DCTR DCT reduced energy ratio focus  — Analysis
435. GDER Gaussian derivative focus  — Analysis
436. GLVN normalised grey-level variance focus  — Analysis
437. GRAT thresholded absolute gradient focus  — Analysis
438. GRAS squared gradient focus  — Analysis
439. HELM Helmli-Scherer mean focus  — Analysis
440. HISE histogram entropy focus  — Analysis
441. HISR histogram range focus  — Analysis
442. LAPE energy of Laplacian focus  — Analysis
443. LAPD diagonal Laplacian focus  — Analysis
444. LAP3 3-D window Laplacian focus  — Analysis
445. SFRQ spatial frequency focus  — Analysis
446. TENV Tenengrad variance focus  — Analysis
447. WAVS sum of wavelet coefficients focus  — Analysis
448. WAVV variance of wavelet coefficients focus  — Analysis
449. WAVR ratio of wavelet coefficients focus  — Analysis
450. CHEB Chebyshev moments focus  — Analysis
451. EIGV eigenvalues focus  — Analysis

## Thinning algorithms (literature) (5)

452. Hilditch thinning (1969) ⓖ  — Analysis
453. K3M thinning (Saeed 2010) ⓖ  — Analysis
454. OPTA one-pass thinning (Naccache-Shinghal 1984) ⓖ  — Analysis
455. Holt thinning (1987) ⓖ  — Analysis
456. Lee-Kashyap-Chu thinning (1994) ⓖ  — Analysis

## Historical photo & print processes 2 (43)

457. Woodburytype  — Film
458. Collotype (Albertype / Lichtdruck)  — Film
459. Photogravure (aquatint grain)  — Film
460. Photochrom (Photoglob)  — Film
461. Fresson direct carbon print  — Film
462. Argyrotype  — Film
463. Uranotype  — Film
464. Cuprotype  — Film
465. Rawlins oil print  — Film
466. Calotype paper negative  — Film
467. Lumen print  — Film
468. Chemigram  — Film
469. Cliche-verre  — Film
470. Diazotype (Ozalid)  — Film
471. Hectograph  — Film
472. Chromolithograph  — Film
473. Pochoir stencil colouring  — Film
474. Ukiyo-e woodblock print  — Film
475. Pannotype  — Film
476. Ivorytype  — Film
477. Opalotype  — Film
478. Crystoleum  — Film
479. Orotone (goldtone)  — Film
480. Carbro print  — Film
481. Dye transfer print  — Film
482. Cibachrome (Ilfochrome)  — Film
483. Aniline print (Willis 1864)  — Film
484. Photo-crayon portrait  — Film
485. Polaroid emulsion lift  — Film
486. Lippmann interference colour plate  — Film
487. Heliochrome (Niepce de Saint-Victor)  — Film
488. Hyalotype lantern slide (Langenheim)  — Film
489. Joly line screen plate  — Film
490. Paget colour screen plate  — Film
491. Finlay colour plate  — Film
492. Dufaycolor reseau  — Film
493. Thames colour plate  — Film
494. Krayn line screen  — Film
495. Omnicolore screen plate  — Film
496. McDonough colour screen  — Film
497. Carte de visite mount  — Frames
498. Cabinet card mount  — Frames
499. Stereograph card mount  — Frames

## Demoscene effects 2 (2)

500. Sine scroller wave (demoscene)  — Distort
501. DYCP different-Y character position wave (demoscene)  — Distort
