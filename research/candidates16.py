"""Round 16 raw candidates (input to dedupe16.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.

Round 16 sweeps academic image-processing literature topic by topic (survey papers' method lists), plus
broadcast test & monitoring tools, art-history print processes, astronomy/microscopy/medical/remote-sensing
literature and demoscene / Shadertoy effects. Each named method counts once.
How each block was confirmed is noted in its header ("first-hand" = read from the source listing / repo / docs page
itself; "search" = literature knowledge checked against web-search result summaries).
Concept duplicates were screened with a keyword sweep against filters.db, rounds 9-15 and index.html labels
(research/wip/harvest16/probe.py + kw.py, deleted after the run), e.g. Tikhonov-Miller / ICTM = "Tikhonov
deconvolution (iterative)", FDoG = Coherent Line Drawing, Beaudet DET = Determinant of Hessian, Plessey = Harris,
Tamura coarseness = Tamura Features, Wiener-Hunt = Unsupervised Wiener, Gold deconvolution = G'MIC Gold-Meinel,
extended minima = H-Maxima/H-Minima, geodesic reconstruction = top-hat by reconstruction, ISTA kept only as FISTA.
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# === Tone mapping operators -- search (pfstmo / HDR Toolbox operator lists, Reinhard et al. HDR book) ==========
R = "Tone mapping operators (literature)"
add(R, "Tone", "G", "Interactive local tone adjustment (Lischinski 2006)",
    "Lightness-perception tone mapping (Krawczyk 2005)", "Display-optimal tone curve (Mai 2011)",
    "Linear windowed tone mapping (Shan 2010)", "Subband compression tone mapping (Li-Sharan-Adelson 2005)")
add(R, "Tone", "S", "Photoreceptor encoding tone mapping (Van Hateren 2006)",
    "LCIS low-curvature image simplifier (Tumblin-Turk 1999)")

# === Dehazing / underwater -- search (dehazing & underwater-enhancement survey method tables) ==================
R = "Dehazing & underwater restoration (literature)"
add(R, "Repair", "G", "Visibility in bad weather (Tan 2008, contrast maximisation)",
    "Single image dehazing by ICA (Fattal 2008)", "Optimized contrast enhancement dehaze (Kim 2013)",
    "DEFADE fog-density dehaze (Choi 2015)", "Colour ellipsoid prior dehaze (Bui-Kim 2018)")
add(R, "Repair", "S", "Fusion-based dehazing (Ancuti 2013)", "AMEF artificial multi-exposure fusion dehaze (Galdran 2018)",
    "Maximum reflectance prior night dehaze (Zhang 2017)", "Night haze glow removal (Li-Tan-Brown 2015)",
    "Bright channel prior", "Median dark channel prior (Gibson 2012)")
add(R, "Repair", "S", "UDCP underwater dark channel prior (Drews 2013)", "Red channel prior underwater (Galdran 2015)",
    "GDCP generalized dark channel prior (Peng 2018)", "ULAP underwater light attenuation prior (Song 2018)",
    "Underwater colour balance & fusion (Ancuti 2018)", "ICM integrated colour model (Iqbal 2007)",
    "UCM unsupervised colour correction (Iqbal 2010)", "MLLE minimal colour loss & local contrast (Zhang 2022)",
    "Maximum intensity prior underwater (Carlevaris-Bianco 2010)")
add(R, "Repair", "G", "IBLA blurriness & light absorption (Peng-Cosman 2017)",
    "HLRP hyper-Laplacian reflectance priors (Zhuang 2022)")

# === Low-light & histogram equalisation variants -- search (HE survey tables) =================================
R = "Contrast & low-light enhancement 2 (literature)"
add(R, "Tone", "S", "Multi-scale fusion low-light (Fu 2016)", "LECARM camera-response enhancement (Ying 2017)")
add(R, "Tone", "G", "WAHE weighted approximated HE (Arici 2009)", "RSIHE recursive sub-image HE (Sim 2007)",
    "DHE dynamic histogram equalisation (Abdullah-Al-Wadud 2007)", "BHEPL bi-HE with plateau limit (Ooi 2009)",
    "MVSIHE mean & variance sub-image HE (Zhuang 2015)", "RLBHE range-limited bi-HE (Zuo 2013)",
    "Gray-level grouping (Chen-Abidi 2006)", "Exact histogram specification (Coltuc 2006)",
    "Plateau HE for infrared (Vickers 1996)", "Fuzzy contrast enhancement (Tizhoosh 1997)")
add(R, "Tone", "S", "Alpha rooting (Aghagolzadeh 1992)", "Logarithmic image processing LIP (Jourlin-Pinoli)",
    "Parameterized LIP (Panetta 2008)", "Contrast pyramid / ratio of low-pass pyramid (Toet 1989)",
    "Adaptive unsharp masking (Polesel 2000)", "Rational unsharp masking (Ramponi 1996)",
    "Kernel regression sharpening (Takeda 2007)", "Multiscale shape & detail enhancement (Fattal 2007)")

# === Denoising -- search (denoising survey method lists: Buades/Lebrun/Milanfar surveys, IPOL) ================
R = "Denoising (literature)"
add(R, "Noise", "G", "LSSC learned simultaneous sparse coding (Mairal 2009)", "Noise Clinic (Lebrun 2015)",
    "SAIST spatially adaptive iterative singular-value thresholding (Dong 2013)",
    "NCSR nonlocally centralized sparse representation (Dong 2013)", "LPG-PCA denoising (Zhang 2010)",
    "TNRD trainable nonlinear reaction diffusion (Chen-Pock 2017)", "Shrinkage fields (Schmidt-Roth 2014)",
    "Wavelet hidden Markov tree denoising (Crouse 1998)")
add(R, "Noise", "S", "DA3D data-adaptive dual-domain denoising (Pierazzo 2015)", "Non-local TV denoising (Gilboa-Osher)",
    "NeighShrink wavelet denoising (Chen 2004)", "BLS-GSM wavelet denoising (Portilla 2003)",
    "Bivariate shrinkage (Sendur-Selesnick 2002)", "SURE-LET denoising (Luisier-Blu 2007)",
    "Dual-tree complex wavelet denoising (Selesnick-Kingsbury)", "Bandlet denoising (Le Pennec-Mallat)",
    "Ridgelet denoising (Candes-Donoho)",
    "Progressive switching median (Wang-Zhang 1999)", "Decision-based median filter (Srinivasan 2007)",
    "Center-weighted median filter (Ko-Lee 1991)", "Directional distance filter (Karakos-Trahanias 1997)",
    "Rank-conditioned rank-selection filter (Hardie-Barner 1994)", "Detail-preserving anisotropic diffusion (Aja-Fernandez 2006)")

# === Deblurring & deconvolution -- search; DeconvolutionLab2 list first-hand (github.com/Biomedical-Imaging-Group)
R = "Deblurring & deconvolution (literature)"
add(R, "Sharpen", "G", "Blind deconvolution by variational Bayes (Fergus 2006)", "High-quality motion deblurring (Shan 2008)",
    "Fast motion deblurring (Cho-Lee 2009)", "Normalized sparsity blind deblur (Krishnan 2011)",
    "Two-phase kernel estimation (Xu-Jia 2010)", "L0 intensity & gradient prior deblur (Pan 2014)",
    "Dark channel prior deblurring (Pan 2016)", "Spectral irregularities blind deblur (Goldstein-Fattal 2012)",
    "Non-uniform shake deblurring (Whyte 2010)", "Jansson-van Cittert deconvolution",
    "Richardson-Lucy total variation (Dey 2006)", "FISTA deconvolution (Beck-Teboulle 2009)",
    "Non-negative least squares deconvolution", "Bounded-variable least squares deconvolution",
    "CLEAN deconvolution (Hogbom 1974)", "Pixon image reconstruction (Pina-Puetter 1993)",
    "Sparse deconvolution (Sparse-SIM, Zhao 2022)", "Huygens CMLE classic maximum likelihood estimation")
add(R, "Sharpen", "S", "Nearest-neighbours deblurring (Agard 1984)", "No-neighbours deblurring")

# === Microscopy & medical -- search ===========================================================================
R = "Microscopy & medical imaging (literature)"
add(R, "Repair", "X", "CIDRE illumination correction (Smith 2015)", "HiLo optical sectioning (Mertz)",
    "SRRF super-resolution radial fluctuations (Gustafsson 2016)",
    "SOFI super-resolution optical fluctuation imaging (Dertinger 2009)", "Transport of intensity equation phase retrieval",
    "Fourier ring correlation resolution map", "Dual-energy subtraction radiography")
add(R, "Analysis", "S", "DIC Hilbert-transform reconstruction (Arnison 2004)", "Maximum intensity projection (MIP)",
    "Minimum intensity projection (MinIP)", "Hounsfield-unit windowing (CT)")
add(R, "Repair", "S", "Phase-contrast halo & shade-off removal (Yin-Kanade 2012)", "FIB-SEM curtaining removal", "Ring artifact removal (CT)",
    "Gibbs ringing removal (Kellner 2016)", "Metal artifact reduction (MAR)", "Beam hardening correction",
    "Pectoral muscle removal (mammography)", "Bone suppression (chest X-ray)", "Ultrasound log compression",
    "Khan stain normalization (2014)", "Optical density transform (Beer-Lambert)", "Specular reflection removal (endoscopy)")
add(R, "Sharpen", "S", "Fundus image enhancement (luminosity & contrast normalisation)")

# === Saliency -- search (MIT/Tuebingen saliency benchmark & salient-object-detection survey tables) ==========
R = "Saliency models (literature)"
add(R, "Analysis", "S", "SUN saliency (Zhang 2008)", "LC luminance-contrast saliency (Zhai-Shah 2006)",
    "Maximum symmetric surround saliency (Achanta 2010)", "Self-resemblance saliency (Seo-Milanfar 2009)",
    "Covariance saliency (Erdem 2013)", "SIM saliency (Murray 2011)", "AWS adaptive whitening saliency (Garcia-Diaz 2012)",
    "RARE2012 rarity saliency (Riche 2013)")
add(R, "Analysis", "G", "Region contrast saliency (Cheng 2011)", "Manifold ranking saliency GMR (Yang 2013)",
    "Robust background detection saliency RBD (Zhu 2014)", "Dense & sparse reconstruction saliency (Li 2013)",
    "Markov chain saliency (Jiang 2013)", "Saliency filters (Perazzi 2012)", "Geodesic saliency (Wei 2012)",
    "FASA fast accurate size-aware saliency (Yildirim 2015)", "Hierarchical saliency (Yan 2013)",
    "Saliency optimization wCtr (Zhu 2014)", "Minimum barrier saliency (Zhang 2015)")

# === Texture descriptors -- search (LBP-variant survey tables) =================================================
R = "Texture descriptors (literature)"
add(R, "Sensor", "S", "CS-LBP center-symmetric LBP (Heikkila 2009)", "Median binary pattern (Hafiane 2007)",
    "Local tetra patterns (Murala 2012)", "Local directional number pattern (Rivera 2013)",
    "Elongated LBP (Liao-Chung 2007)", "Extended LBP CI/NI/RD/AD-LBP (Liu 2012)", "Local configuration pattern (Guo 2011)",
    "Local contrast patterns (Song 2014)")
add(R, "Sensor", "G", "Dominant LBP (Liao 2009)")

# === Keypoints & edges -- search ===============================================================================
R = "Feature & edge detectors 2 (literature)"
add(R, "Edges", "S", "Hessian-affine regions (Mikolajczyk-Schmid 2004)", "Heitger corner detector (1992)",
    "SFOP scale-invariant feature operator (Forstner 2009)", "Spacek optimal edge detector (1986)",
    "Fuzzy edge detection (Russo)", "Lanser-Eckstein edge detector (1992)", "Boie-Cox edge detector (1987)",
    "Pb probability of boundary (Martin-Fowlkes-Malik 2004)")
add(R, "Edges", "M", "Sketch tokens (Lim-Zitnick-Dollar 2013)")

# === Thresholding & binarisation -- search (Sezgin-Sankur 2004 survey, Trier-Jain 1995, DIBCO entries) ========
R = "Thresholding & binarisation (literature)"
add(R, "Analysis", "G", "Pun entropy threshold (1980)", "Abutaleb 2D entropy threshold (1989)", "Tsallis entropy threshold",
    "Arimoto entropy threshold", "Pal-Pal entropy threshold", "Relative entropy threshold (Chang 1994)",
    "Rosenfeld convex-hull threshold (1983)", "Sezan peak-valley threshold (1990)",
    "Pikaz topological stable-state threshold (1995)", "O'Gorman connectivity threshold (1994)",
    "Beghdadi block-entropy threshold (1995)", "Jawahar fuzzy threshold (1997)", "Hertz-Schafer edge-coincidence threshold (1988)",
    "Lloyd threshold (1985)", "Brink cross-entropy threshold (1996)", "Johannsen-Bille threshold (1982)",
    "AdOtsu (Moghaddam-Cheriet 2012)", "Lelore-Bouchara binarization (2013)", "Jia structural symmetric pixels (2018)",
    "Hedjam spatially adaptive binarization (2011)", "Kligler visibility binarization (2018)",
    "Phase-based binarization (Nafchi 2014)")
add(R, "Analysis", "S", "White-Rohrer dynamic threshold (1983)", "Yanowitz-Bruckstein threshold (1989)",
    "Chow-Kaneko threshold (1972)", "Eikvil threshold (1991)", "Parker threshold (1991)", "Palumbo threshold (1986)",
    "Oh threshold (1999)", "Mardia-Hainsworth threshold (1988)", "Kamel-Zhao threshold (1993)", "Yasuda threshold (1980)",
    "Valizadeh contrast-independent binarization (2009)", "Adaptive water-flow binarization (Valizadeh-Kabir 2012)", "Multiscale Sauvola (Lazzara-Geraud 2013)")

# === Segmentation & superpixels -- search (Stutz superpixel benchmark list, segmentation surveys) ============
R = "Segmentation & superpixels (literature)"
add(R, "Analysis", "G", "Mumford-Shah segmentation", "SNIC simple non-iterative clustering (Achanta 2017)",
    "ETPS extended topology preserving superpixels (Yao 2015)", "Superpixel lattices (Moore 2008)", "JSEG (Deng-Manjunath 2001)",
    "CRS contour relaxed superpixels (Conrad 2013)", "ERGC eikonal region growing clustering (Buyssens 2014)",
    "preSLIC (Neubert-Protzel 2014)", "Power watershed (Couprie 2011)", "Gaussian mixture model segmentation (EM)",
    "Graph cut segmentation (Boykov-Jolly 2001)", "Distance-regularized level set (Li 2010)",
    "Local binary fitting active contour (Li 2007)", "Statistical region merging (Nock-Nielsen 2004)")
add(R, "Analysis", "X", "Lazy snapping (Li 2004)", "Intelligent scissors (Mortensen-Barrett 1995)")

# === Morphology -- search ======================================================================================
R = "Mathematical morphology 2 (literature)"
add(R, "Analysis", "G", "Rank-max opening (Soille 2002)", "Attribute profile (Dalla Mura 2010)", "Tree of shapes (Monasse-Guichard 2000)",
    "Ultimate opening (Beucher 2007)", "Volume opening (Vachier)", "Morphological dynamics (Grimaud 1992)",
    "Extended morphological profile (Benediktsson 2005)")
add(R, "Analysis", "S", "Morphological amoebas (Lerallut 2005)", "Fuzzy morphology (Bloch-Maitre)", "Soft morphological filters (Koskinen 1991)")

# === Halftoning -- search (Lau-Arce book, halftoning literature) ===============================================
R = "Halftoning & dithering 2 (literature)"
add(R, "Retro", "G", "Edge-enhanced error diffusion (Eschbach-Knox 1991)", "Threshold-modulated error diffusion",
    "Green-noise halftoning (Lau-Arce 1998)", "Space-filling curve dither (Velho-Gomes 1991)",
    "Model-based halftoning (Pappas-Neuhoff 1999)",
    "Lattice-Boltzmann dithering (Hagenburg 2009)", "Block error diffusion (Damera-Venkata-Evans 2001)",
    "AM-FM hybrid halftoning", "Sigma-delta modulation halftoning", "Tone-dependent error diffusion (Li-Allebach 2002)",
    "Multiscale error diffusion (Katsavounidis-Kuo 1997)", "Peano curve dither", "Serpentine-scan error diffusion",
    "Electrostatic halftoning (Schmaltz 2010)", "Capacity-constrained point distribution halftoning (Balzer 2009)",
    "Structure-aware halftoning (Pang 2008)")
add(R, "Retro", "S", "Poisson-disk dithering")

# === Image quality metrics -- search (IQA survey / LIVE / TID2013 metric tables) ===============================
R = "Image quality metrics 2 (literature)"
add(R, "Analysis", "X", "IFC information fidelity criterion (Sheikh 2005)", "UQI universal quality index (Wang-Bovik 2002)",
    "MAD most apparent distortion (Larson-Chandler 2010)", "ESSIM edge-strength similarity (Zhang 2013)",
    "RFSIM Riesz-transform feature similarity (Zhang 2010)", "GSM gradient similarity (Liu 2012)",
    "NQM noise quality measure (Damera-Venkata 2000)", "WSNR weighted SNR", "DSS DCT subband similarity (Balanov 2015)",
    "Daly visible differences predictor (1993)", "CIEDE2000 difference map")
add(R, "Analysis", "G", "MLV maximum local variation sharpness (Bahrami 2014)", "LPC-SI local phase coherence sharpness (Hassen 2013)",
    "ARISM autoregressive sharpness (Gu 2015)", "SSEQ spatial-spectral entropy quality (Liu 2014)",
    "CurveletQA (Liu 2014)", "GM-LOG gradient magnitude & LoG quality (Xue 2014)", "CEIQ contrast-enhanced image quality (Yan 2019)",
    "UCIQE underwater colour image quality (Yang-Sowmya 2015)", "UIQM underwater image quality measure (Panetta 2016)",
    "NIQMC no-reference contrast quality (Gu 2017)", "BIQME blind enhanced-image quality (Gu 2018)",
    "Marziliano edge-width blur metric (2002)", "NFERM free-energy quality (Gu 2015)")
add(R, "Analysis", "M", "CORNIA codebook quality (Ye 2012)", "QAC quality-aware clustering (Xue 2013)")

# === Colour constancy & decolourisation -- search (Gijsenij-Gevers-van de Weijer CC survey, decolorization papers)
R = "Colour constancy & decolourisation (literature)"
add(R, "Color", "G", "General gray world (Barnard 2002)", "Gamut mapping colour constancy (Forsyth 1990)" ,
    "Bayesian colour constancy (Gehler 2008)", "Natural image statistics colour constancy (Gijsenij-Gevers 2011)",
    "Local surface reflectance statistics (Gao 2014)", "Grayness index (Qian 2019)", "PCA-based colour constancy (Cheng 2014)",
    "Corrected-moment illuminant estimation (Finlayson 2013)", "Color by correlation (Finlayson-Hordley-Hubel 2001)",
    "Double-opponency colour constancy (Gao 2015)", "Spatio-spectral statistics colour constancy (Chakrabarti 2012)",
    "Dark pixels illuminant estimation", "Color2Gray (Gooch 2005)", "Decolorize (Grundland-Dodgson 2007)",
    "Apparent greyscale (Smith 2008)", "Neumann perceptual decolorization (2007)", "Rasche re-colouring (2005)",
    "Robust colour-to-gray (Kim 2009)", "Recolouring for dichromats (Kuhn 2008)")
add(R, "Color", "S", "Local space average colour (Ebner 2007)")
add(R, "Color", "M", "Convolutional colour constancy (Barron 2015)")

# === Super-resolution & interpolation (non-neural) -- search ==================================================
R = "Interpolation & super-resolution (literature)"
add(R, "Sharpen", "S", "iNEDI improved NEDI (Asuni-Giachetti 2008)", "SAI soft-decision adaptive interpolation (Zhang-Wu 2008)",
    "Curvature interpolation method (Kim-Cha-Kim 2011)", "Akima interpolation", "Lagrange interpolation", "Magic Kernel Sharp (Costella)",
    "Hamming-windowed sinc resampling", "OMOMS interpolation (Blu-Thevenaz-Unser 2001)", "Schaum interpolation (1993)",
    "Edge-statistics upsampling (Fattal 2007)", "Fast image upsampling (Shan 2008)", "Gradient profile prior SR (Sun 2008)",
    "Iterative back-projection SR (Irani-Peleg 1991)")
add(R, "Sharpen", "G", "Single-image SR from internal patches (Glasner 2009)", "Example-based super-resolution (Freeman 2002)",
    "Sparse-coding super-resolution (Yang 2010)", "A+ adjusted anchored neighbourhood regression (Timofte 2014)",
    "Self-exemplars super-resolution (Huang 2015)", "Kernel ridge regression SR (Kim-Kwon 2010)")

# === Inpainting & texture synthesis (non-neural) -- search ====================================================
R = "Inpainting & synthesis (literature)"
add(R, "Repair", "S", "Bertalmio PDE inpainting (2000)", "TV inpainting (Chan-Shen)", "CDD curvature-driven diffusion inpainting",
    "Euler's elastica inpainting", "Mumford-Shah-Euler inpainting (Esedoglu-Shen)", "Oliveira fast inpainting (2001)",
    "Cahn-Hilliard inpainting (Bertozzi 2007)", "Harmonic inpainting")
add(R, "Repair", "G", "Priority-BP inpainting (Komodakis 2006)", "Coherency sensitive hashing (Korman-Avidan 2011)",
    "Resynthesizer (Harrison 2001)", "Wei-Levoy tree-structured texture synthesis (2000)",
    "Ashikhmin natural texture synthesis (2001)", "Graphcut textures (Kwatra 2003)", "Shift-map image editing (Pritch 2009)",
    "Exemplar inpainting with patch sparsity (Xu-Sun 2010)", "Image melding (Darabi 2012)",
    "Statistics of patch offsets completion (He-Sun 2012)")
add(R, "Repair", "X", "Texture-by-numbers (Hertzmann image analogies)")

# === Edge-preserving smoothing 2 -- search ====================================================================
R = "Edge-preserving & robust filters 2 (literature)"
add(R, "Blur", "G", "Static/dynamic filter (Ham 2015)", "Segment graph filter (Zhang 2015)",
    "Region covariance smoothing (Karacan 2013)", "Iterative least squares smoothing ILS (Liu 2020)",
    "Structure-texture decomposition (Aujol 2006)", "Meyer G-norm cartoon-texture decomposition (2001)",
    "Vese-Osher decomposition (2003)", "Total variation L1 (TV-L1, Nikolova)", "L1 image transform smoothing (Bi-Han-Yu 2015)")
add(R, "Blur", "S", "Trilateral filter (Choudhury-Tumblin 2003)", "Permutohedral lattice filtering (Adams 2010)",
    "Interval gradient filtering (Lee 2017)", "Beltrami flow (Sochen-Kimmel-Malladi)", "Alvarez-Mazorra shock filter (1994)",
    "Gaussian KD-tree filtering (Adams 2009)",
    "Recursive bilateral filter (Yang 2012)")

# === Intrinsic / specular / weather removal -- search =========================================================
R = "Reflectance & weather removal (literature)"
add(R, "Repair", "G", "Entropy-minimisation shadow removal (Finlayson 2004)", "Specular-free image (Tan-Ikeuchi 2005)",
     "Specular-free two-band (Shen 2008)",
    "Rain streak removal by sparse decomposition (Kang 2012)",
    "GMM layer-prior deraining (Li 2016)", "Discriminative sparse coding deraining (Luo 2015)",
    "Single-image reflection removal (Li-Brown 2014)", "Single-image snow removal")
add(R, "Repair", "M", "Intrinsic images in the wild (Bell 2014)")
add(R, "Repair", "S", "SA-DCT deblocking (Foi 2007)", "POCS deblocking")

# === Demosaicing -- search ====================================================================================
R = "Demosaicing (literature)"
add(R, "Sensor", "S", "Kimmel demosaic (1999)", "ACPI adaptive colour plane interpolation", "GBTF gradient-based threshold-free demosaic (2010)",
    "Residual interpolation demosaic (Kiku 2013)", "MLRI minimised-Laplacian residual interpolation (2014)",
    "ARI adaptive residual interpolation (Monno 2015)", "Smooth hue transition demosaic (Cok 1987)",
    "Laroche-Prescott demosaic (1994)", "Freeman median demosaic (1988)")

# === Remote sensing RGB indices -- first-hand (rgbIndices CRAN vignette; uavRst rgb_indices docs) ==============
R = "RGB vegetation & soil indices 2"
add(R, "Sensor", "S", "GLAI green leaf area index", "Overall saturation index (SAT)", "Overall hue index (HUE)",
    "Brightness index BI (soil)", "Spectral-slope saturation index SI", "Hue index HI (soil)", "Coloration index CI",
    "Green-blue index GBI", "True colour vegetation index TCVI", "Green-red ratio index GRRI", "Red-blue ratio index RBRI",
    "NRBDI normalised red-blue difference index")

# === Broadcast monitoring -- search ===========================================================================
R = "Broadcast scopes & test signals"
add(R, "Analysis", "S", "Lightning display (Tektronix)", "Diamond gamut display (Tektronix)", "Arrowhead gamut display (Tektronix)",
    "Spearhead display (Tektronix)", "Blue-only monitor check", "Stop display (log waveform, Tektronix)",
    "Superwhite / illegal level highlight")
add(R, "Render", "S", "PLUGE (picture line-up generation equipment)", "SMPTE colour bars", "EBU colour bars", "ARIB STD-B28 colour bars",
    "Multiburst test signal", "Staircase test signal", "SDI checkfield (pathological)", "Philips PM5544 test pattern",
    "Telefunken FuBK test card", "BBC Test Card F", "RCA Indian-head test pattern", "Bowtie test signal",
    "Siemens star", "USAF 1951 resolution target", "ISO 12233 resolution chart")
add(R, "Frames", "S", "Title-safe / action-safe overlay", "Camera frame lines overlay")
add(R, "Analysis", "G", "Slanted-edge MTF (ISO 12233)")

# === Retinex family -- search (Milano Retinex review; Termite Retinex JEI 2014; RSR papers) ====================
R = "Retinex variants (literature)"
add(R, "Tone", "S", "Random spray Retinex RSR (Provenzi 2007)", "Light random sprays Retinex (Banic-Loncaric 2013)",
    "Termite Retinex (Simone 2014)", "QBRIX quantile-based Retinex (Gianini 2014)", "Frankle-McCann Retinex (1983)",
    "McCann99 multiresolution Retinex", "Land path-based Retinex (1971)", "Retinex PDE formalisation (Morel 2010)")
add(R, "Tone", "G", "Variational Retinex (Kimmel 2003)")

# === Inverse tone mapping -- search (ExpandNet survey; Masia 2009; Huo 2014) ==================================
R = "Inverse tone mapping (literature)"
add(R, "Tone", "S", "Akyuz linear-gamma expansion (2007)", "Rempel LDR2HDR brightness enhancement (2007)",
    "Kovaleski-Oliveira bilateral expansion (2009)", "Huo physiological inverse tone mapping (2014)",
    "Masia exposure-adaptive gamma expansion (2009)")

# === Lines, contours & shape from X -- search ================================================================
R = "Lines, contours & shape cues (literature)"
add(R, "Edges", "G", "ELSED enhanced line segment drawing (Suarez 2022)", "EDCircles circle detector (Akinlar-Topal 2013)",
    "ELSDc ellipse & line segment detector (Patraucean)")
add(R, "Edges", "S", "Surround-inhibition contour detector (Grigorescu-Petkov 2003)", "CORF push-pull contour operator (Azzopardi 2014)")
add(R, "Depth", "G", "Tsai-Shah linear shape from shading (1994)", "Zheng-Chellappa shape from shading (1991)",
    "Defocus map estimation (Zhuo-Sim 2011)", "Defocus magnification (Bae-Durand 2007)")
add(R, "Analysis", "S", "Just noticeable defocus blur detection (Shi 2015)", "HiFST high-frequency DCT blur detection (Golestaneh 2017)",
    "LBP-based defocus sharpness (Yi-Eramian 2016)", "Spectral partial blur detection (Liu 2008)")

# === Skin, noise & quantisation -- search ======================================================================
R = "Skin, noise estimation & quantisation (literature)"
add(R, "Analysis", "S", "Jones-Rehg Bayesian skin model (2002)", "YCbCr skin map (Chai-Ngan 1999)")
add(R, "Analysis", "G", "PCA weak-texture noise level estimation (Liu 2013)", "MAD wavelet noise estimator (Donoho 1995)")
add(R, "Retro", "G", "Popularity colour quantisation (Heckbert 1982)", "Spatial colour quantisation (Puzicha 2000 / scolorq)",
    "Pairwise nearest neighbour quantisation (Equitz 1989)", "Variance-based quantisation (Wan 1990)",
    "Greedy orthogonal bipartition quantisation", "Binary splitting quantisation (Orchard-Bouman 1991)")

# === Camera models & lens -- search ============================================================================
R = "Camera & lens models (literature)"
add(R, "Distort", "S", "Division model lens distortion (Fitzgibbon 2001)", "Kannala-Brandt fisheye model (2006)",
    "Unified camera model (Mei 2007)", "Double sphere camera model (Usenko 2018)", "Field-of-view lens model (Devernay-Faugeras 2001)")
add(R, "Analysis", "G", "Single-image vignetting estimation (Zheng 2009)")

# === Focus measure operators -- search (Pertuz et al. 2013 operator set; Memon 2015 confirms CURV/GRAE/HISE/LAPD/LAP3/WAVS)
R = "Focus measure operators (Pertuz 2013)"
add(R, "Analysis", "S", "ACMO absolute central moment focus", "CONT image contrast focus (Nanda)", "CURV image curvature focus",
    "DCTE DCT energy ratio focus", "DCTR DCT reduced energy ratio focus", "GDER Gaussian derivative focus",
    "GLVN normalised grey-level variance focus", "GRAT thresholded absolute gradient focus", "GRAS squared gradient focus",
    "HELM Helmli-Scherer mean focus", "HISE histogram entropy focus", "HISR histogram range focus", "LAPE energy of Laplacian focus",
    "LAPD diagonal Laplacian focus", "LAP3 3-D window Laplacian focus", "SFRQ spatial frequency focus", "TENV Tenengrad variance focus",
    "WAVS sum of wavelet coefficients focus", "WAVV variance of wavelet coefficients focus", "WAVR ratio of wavelet coefficients focus",
    "CHEB Chebyshev moments focus", "EIGV eigenvalues focus")

# === Thinning algorithms -- first-hand (thinr CRAN vignette method list) + search ============================
R = "Thinning algorithms (literature)"
add(R, "Analysis", "G", "Hilditch thinning (1969)", "K3M thinning (Saeed 2010)", "OPTA one-pass thinning (Naccache-Shinghal 1984)",
    "Holt thinning (1987)", "Lee-Kashyap-Chu thinning (1994)", "Stentiford thinning (1983)")

# === Historical photographic & photomechanical processes -- search (PSAP format guide first-hand; screen-plate history)
R = "Historical photo & print processes 2"
add(R, "Film", "S", "Woodburytype", "Collotype (Albertype / Lichtdruck)", "Photogravure (aquatint grain)", "Photochrom (Photoglob)",
    "Fresson direct carbon print", "Argyrotype", "Uranotype", "Cuprotype", "Rawlins oil print", "Calotype paper negative",
    "Lumen print", "Chemigram", "Cliche-verre", "Diazotype (Ozalid)", "Hectograph", "Chromolithograph", "Pochoir stencil colouring",
    "Ukiyo-e woodblock print", "Pannotype", "Ivorytype", "Opalotype", "Crystoleum", "Orotone (goldtone)", "Carbro print",
    "Dye transfer print", "Cibachrome (Ilfochrome)", "Aniline print (Willis 1864)", "Photo-crayon portrait", "Polaroid emulsion lift",
    "Lippmann interference colour plate", "Heliochrome (Niepce de Saint-Victor)", "Hyalotype lantern slide (Langenheim)")
add(R, "Film", "S", "Joly line screen plate", "Paget colour screen plate", "Finlay colour plate", "Dufaycolor reseau",
    "Thames colour plate", "Krayn line screen", "Omnicolore screen plate", "McDonough colour screen")
add(R, "Frames", "S", "Carte de visite mount", "Cabinet card mount", "Stereograph card mount")

# === Demoscene -- search =====================================================================================
R = "Demoscene effects 2"
add(R, "Distort", "S", "Sine scroller wave (demoscene)", "DYCP different-Y character position wave (demoscene)")
