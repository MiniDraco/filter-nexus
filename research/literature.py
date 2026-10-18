"""Names from the image-processing literature and from PBR texture tools.
Not menu items in any one app, so each carries a reference instead."""
WIKI = "https://en.wikipedia.org/wiki/"
EDGE_OPS = [  # (name, group, reference)
    ("Sobel Operator", "Gradient", WIKI + "Sobel_operator"),
    ("Prewitt Operator", "Gradient", WIKI + "Prewitt_operator"),
    ("Scharr Operator", "Gradient", WIKI + "Sobel_operator#Alternative_operators"),
    ("Roberts Cross", "Gradient", WIKI + "Roberts_cross"),
    ("Kirsch Compass", "Compass", WIKI + "Kirsch_operator"),
    ("Robinson Compass", "Compass", "https://homepages.inf.ed.ac.uk/rbf/HIPR2/"),
    ("Frei-Chen", "Subspace", WIKI + "Frei%E2%80%93Chen_operator"),
    ("Laplacian", "Second derivative", WIKI + "Discrete_Laplace_operator"),
    ("Laplacian of Gaussian", "Second derivative", WIKI + "Blob_detection#The_Laplacian_of_Gaussian"),
    ("Difference of Gaussians", "Band-pass", WIKI + "Difference_of_Gaussians"),
    ("XDoG", "Band-pass", "https://doi.org/10.1016/j.cag.2012.03.004"),
    ("Canny Edge Detector", "Multi-stage", WIKI + "Canny_edge_detector"),
    ("Marr-Hildreth", "Second derivative", WIKI + "Marr%E2%80%93Hildreth_algorithm"),
    ("Hough Lines", "Line detection", WIKI + "Hough_transform"),
    ("Hough Circles", "Line detection", WIKI + "Circle_Hough_Transform"),
    ("Line Detection Kernels", "Line detection", WIKI + "Line_detection"),
    ("Harris Corners", "Corners", WIKI + "Harris_corner_detector"),
    ("Shi-Tomasi Corners", "Corners", WIKI + "Corner_detection#The_Harris_&_Stephens_/_Shi%E2%80%93Tomasi_corner_detection_algorithms"),
    ("FAST Corners", "Corners", WIKI + "Features_from_accelerated_segment_test"),
    ("SUSAN", "Corners", WIKI + "Corner_detection#The_SUSAN_corner_detector"),
    ("Structure Tensor Coherence", "Orientation", WIKI + "Structure_tensor"),
    ("Gabor Filter", "Texture", WIKI + "Gabor_filter"),
    ("Morphological Gradient", "Morphology", WIKI + "Morphological_gradient"),
    ("Dilation", "Morphology", WIKI + "Dilation_(morphology)"),
    ("Erosion", "Morphology", WIKI + "Erosion_(morphology)"),
    ("Opening", "Morphology", WIKI + "Opening_(morphology)"),
    ("Closing", "Morphology", WIKI + "Closing_(morphology)"),
    ("Top-Hat", "Morphology", WIKI + "Top-hat_transform"),
    ("Black-Hat", "Morphology", WIKI + "Top-hat_transform"),
    ("Skeletonize", "Morphology", WIKI + "Morphological_skeleton"),
    ("Distance Transform", "Morphology", WIKI + "Distance_transform"),
    ("Watershed", "Segmentation", WIKI + "Watershed_(image_processing)"),
    ("Otsu Threshold", "Segmentation", WIKI + "Otsu%27s_method"),
    ("Adaptive Threshold", "Segmentation", WIKI + "Thresholding_(image_processing)"),
    ("Histogram Equalization", "Tone", WIKI + "Histogram_equalization"),
    ("CLAHE", "Tone", WIKI + "Adaptive_histogram_equalization#Contrast_Limited_AHE"),
    ("Kuwahara", "Smoothing", WIKI + "Kuwahara_filter"),
    ("Bilateral Filter", "Smoothing", WIKI + "Bilateral_filter"),
    ("Median Filter", "Smoothing", WIKI + "Median_filter"),
    ("Anisotropic Diffusion", "Smoothing", WIKI + "Anisotropic_diffusion"),
    ("Floyd-Steinberg Dithering", "Dithering", WIKI + "Floyd%E2%80%93Steinberg_dithering"),
    ("Ordered Dithering", "Dithering", WIKI + "Ordered_dithering"),
]
MATERIAL_MAPS = [  # PBR texture maps derived from a photo (Substance Sampler, Materialize, CrazyBump, Bitmap2Material)
    ("Normal Map", "https://docs.substance3d.com/sddoc/normal-159450586.html"),
    ("Height Map", "https://docs.substance3d.com/sddoc/height-to-normal-world-units-159450573.html"),
    ("Displacement Map", "https://boundingboxsoftware.com/materialize/"),
    ("Ambient Occlusion", "https://docs.substance3d.com/sddoc/ambient-occlusion-hbao-159450550.html"),
    ("Curvature", "https://docs.substance3d.com/sddoc/curvature-159450574.html"),
    ("Cavity", "https://docs.substance3d.com/"),
    ("Roughness", "https://boundingboxsoftware.com/materialize/"),
    ("Glossiness", "https://boundingboxsoftware.com/materialize/"),
    ("Specular", "https://www.crazybump.com/"),
    ("Metallic", "https://boundingboxsoftware.com/materialize/"),
    ("Albedo De-lighting", "https://docs.substance3d.com/"),
    ("Edge Wear Mask", "https://docs.substance3d.com/"),
    ("Bent Normals", "https://docs.substance3d.com/"),
    ("Thickness", "https://docs.substance3d.com/"),
    ("Opacity Mask", "https://docs.substance3d.com/"),
    ("Emissive", "https://docs.substance3d.com/"),
]
LIGHTROOM = [  # Lightroom / Camera Raw panel controls
    "Temperature", "Tint", "Exposure", "Contrast", "Highlights", "Shadows", "Whites", "Blacks", "Texture", "Clarity",
    "Dehaze", "Vibrance", "Saturation", "Tone Curve", "HSL / Color Mixer", "Color Grading", "Sharpening",
    "Noise Reduction", "Lens Corrections", "Vignetting", "Grain", "Calibration",
]

DEPTH_TOOLS = [  # depth / 3D effects in other products, plus the classic stereo techniques
    ("Depth Blur", "Photoshop Neural Filters", "https://helpx.adobe.com/photoshop/using/neural-filters-list-and-faq.html"),
    ("Lens Blur", "Lightroom", "https://helpx.adobe.com/lightroom-cc/using/lens-blur.html"),
    ("NVIDIA Normal Map Filter", "NVIDIA Texture Tools for Photoshop", "https://developer.nvidia.com/texture-tools-exporter"),
    ("Depth Estimation", "Depth Anything V2", "https://github.com/DepthAnything/Depth-Anything-V2"),
    ("3D Photos", "Facebook", "https://en.wikipedia.org/wiki/3D_photo"),
    ("Anaglyph 3D", "Stereo imaging", "https://en.wikipedia.org/wiki/Anaglyph_3D"),
    ("Stereoscopy", "Stereo imaging", "https://en.wikipedia.org/wiki/Stereoscopy"),
    ("Autostereogram", "Magic Eye", "https://en.wikipedia.org/wiki/Autostereogram"),
    ("Aerial Perspective", "Painting technique", "https://en.wikipedia.org/wiki/Aerial_perspective"),
    ("Portrait Mode Background Blur", "Smartphone cameras", "https://en.wikipedia.org/wiki/Bokeh"),
]
TEXTURE_TOOLS = [  # (name in that tool, tool, engine filter)
    ("Height to Normal", "Substance Designer", "nvnormal"), ("Normal to Height", "Substance Designer", "normal2height"),
    ("Curvature (from normal)", "Substance Designer", "normal2curv"), ("Normal Invert", "Substance Designer", "normaltools"),
    ("NormalFromHeightmap", "Unreal Engine", "nvnormal"), ("ORM texture", "Unreal Engine", "ormpack"),
    ("Create from Grayscale", "Unity", "nvnormal"), ("Mask Map", "Unity HDRP", "ormpack"), ("Smoothness", "Unity", "smoothness"),
    ("Normal Map from photo", "CrazyBump", "detailnormal"), ("Displacement Map", "CrazyBump", "bumpmap"),
    ("Photo to Normal", "Quixel nDo", "detailnormal"), ("Normalmap", "GIMP normalmap plugin", "gimpnormal"),
    ("Height to Normal", "xNormal Photoshop filters", "nvnormal"), ("Normal Map preview", "Materialize", "normalpreview"),
    ("Occlusion from Normal", "AwesomeBump", "normal2ao"), ("Parallax Occlusion Mapping", "Game engines", "pomview"),
]
# Standard toolkits: (name, toolkit, engine filter or None = planned)
TOOLKITS = [
    # ImageJ / Fiji Auto Threshold (global) and Auto Local Threshold
    *[(n, "ImageJ Auto Threshold", "autothreshold") for n in ["Otsu", "Triangle", "IsoData", "Mean", "MaxEntropy", "Li", "Yen", "Percentile", "MinError", "Huang", "Default (IJ_IsoData)"]],
    *[(n, "ImageJ Auto Threshold", "autothreshold") for n in ["Intermodes", "Minimum", "Moments", "RenyiEntropy"]], ("Shanbhag", "ImageJ Auto Threshold", "autothreshold"),
    *[(n, "ImageJ Auto Local Threshold", "binarize") for n in ["Bernsen", "Contrast", "Mean", "MidGrey", "Niblack", "Phansalkar", "Sauvola"]],
    ("Otsu (local)", "ImageJ Auto Local Threshold", "binarize"), ("Median (local)", "ImageJ Auto Local Threshold", "binarize"),
    *[(n, "Document binarization literature", "binarize") for n in ["NICK (Khurshid 2009)", "WAN (2018)", "Singh (2012)", "Feng (2004)", "ISauvola (2016)", "Gatos (2006)", "Su (2010)", "Wellner (1993)"]],
    # OpenCV imgproc / photo
    ("Sobel", "OpenCV", "sobel"), ("Scharr", "OpenCV", "scharr"), ("Laplacian", "OpenCV", "laplace"), ("Canny", "OpenCV", "cannyfull"),
    ("adaptiveThreshold", "OpenCV", "adaptivethresh"), ("threshold (THRESH_OTSU)", "OpenCV", "autothreshold"), ("threshold (THRESH_TRIANGLE)", "OpenCV", "autothreshold"),
    ("morphologyEx", "OpenCV", "morphfilter"), ("distanceTransform", "OpenCV", "distmap"), ("cornerHarris", "OpenCV", "harris"),
    ("goodFeaturesToTrack", "OpenCV", "harris"), ("FastFeatureDetector", "OpenCV", "fast"), ("bilateralFilter", "OpenCV", "surface"),
    ("edgePreservingFilter", "OpenCV", "rollingguidance"), ("detailEnhance", "OpenCV", "detailseq"), ("pencilSketch", "OpenCV", "sketch"),
    ("stylization", "OpenCV", "toon"), ("fastNlMeansDenoisingColored", "OpenCV", "nlmeans"), ("medianBlur", "OpenCV", "median"),
    ("GaussianBlur", "OpenCV", "gauss"), ("boxFilter", "OpenCV", "box"), ("pyrMeanShiftFiltering", "OpenCV", "meanshift"),
    ("createCLAHE", "OpenCV", "clahe"), ("equalizeHist", "OpenCV", "equalize"), ("applyColorMap", "OpenCV", "colormap"),
    ("ximgproc.thinning", "OpenCV contrib", "skeleton"), ("ximgproc.niBlackThreshold", "OpenCV contrib", "binarize"),
    ("ximgproc.guidedFilter", "OpenCV contrib", "guided"), ("ximgproc.rollingGuidanceFilter", "OpenCV contrib", "rollingguidance"),
    ("inpaint", "OpenCV", None), ("watershed", "OpenCV", None), ("grabCut", "OpenCV", None), ("HoughLinesP", "OpenCV", None),
    # scikit-image
    ("filters.frangi", "scikit-image", "frangims"), ("filters.hessian", "scikit-image", "ridge"), ("filters.sato", "scikit-image", "ridge"),
    ("filters.meijering", "scikit-image", "meijering"), ("filters.gabor", "scikit-image", "gabor"), ("feature.local_binary_pattern", "scikit-image", "lbp"),
    ("feature.hog", "scikit-image", "hog"), ("filters.rank.entropy", "scikit-image", "entropy"), ("filters.threshold_multiotsu", "scikit-image", "autothreshold"),
    ("filters.threshold_sauvola", "scikit-image", "binarize"), ("filters.threshold_niblack", "scikit-image", "binarize"),
    ("filters.difference_of_gaussians", "scikit-image", "dog"), ("feature.structure_tensor", "scikit-image", "coherence"),
    ("morphology.skeletonize", "scikit-image", "skeleton"), ("segmentation.slic", "scikit-image", "slic"), ("segmentation.quickshift", "scikit-image", "meanshift"),
    ("filters.butterworth", "scikit-image", None), ("segmentation.chan_vese", "scikit-image", None), ("segmentation.random_walker", "scikit-image", None),
]
ALB = "albumentations"
IMGAUG = "imgaug"
TOOLKITS += [
    *[(n, ALB, e) for n, e in [
        ("Blur", "box"), ("CLAHE", "clahe"), ("ChannelDropout", "channeldropout"), ("ChannelShuffle", "swap"), ("ChromaticAberration", "chromatic"),
        ("ColorJitter", "basicadj"), ("Defocus", "bokeh"), ("Downscale", "resample"), ("Emboss", "emboss"), ("Equalize", "equalize"),
        ("FancyPCA", "fancypca"), ("GaussNoise", "noise"), ("GaussianBlur", "gauss"), ("GlassBlur", "frosted"), ("HueSaturationValue", "tunehsv"),
        ("ISONoise", "sensornoise"), ("ImageCompression", "jpeg"), ("InvertImg", "invert"), ("MedianBlur", "median"), ("MotionBlur", "motion"),
        ("MultiplicativeNoise", "multnoise"), ("PlanckianJitter", "planckian"), ("PlasmaBrightnessContrast", "plasma"), ("PlasmaShadow", "plasma"),
        ("Posterize", "posterize"), ("RGBShift", "channelproc"), ("RandomBrightnessContrast", "basicadj"), ("RandomFog", "fog"),
        ("RandomGamma", "gamma"), ("RandomGravel", "gravel"), ("RandomRain", "rainsnow"), ("RandomShadow", "randomshadow"),
        ("RandomSnow", "rainsnow"), ("RandomSunFlare", "lensflare"), ("RandomToneCurve", "tonecurves"), ("RingingOvershoot", "ringing"),
        ("SaltAndPepper", "saltpepper"), ("Sharpen", "sharpen"), ("ShotNoise", "sensornoise"), ("Solarize", "solarize"), ("Spatter", "spatter"),
        ("Superpixels", "slic"), ("ToGray", "grayscale"), ("ToSepia", "sepia"), ("UnsharpMask", "unsharp"), ("ZoomBlur", "zoom"),
        ("AdditiveNoise", "noise"), ("AutoContrast", "levels"), ("Illumination", "illumination"), ("ElasticTransform", "elastic"),
        ("GridDistortion", "griddistort"), ("OpticalDistortion", "barrel"), ("PiecewiseAffine", "piecewiseaffine"), ("ThinPlateSpline", "turbulence"),
        ("Perspective", "perspective"), ("CoarseDropout", "dropout"), ("GridDropout", "dropout"), ("XYMasking", "dropout"),
        ("PixelDropout", "dropout"), ("RandomGridShuffle", "shuffle"), ("Morphological", "morphfilter"), ("Rotate", "tiledrot")]],
    *[(n, ALB, None) for n in ["FDA", "HistogramMatching", "PixelDistributionAdaptation", "TextImage"]],
    *[(n, IMGAUG, e) for n, e in [
        ("Cartoon", "toon"), ("Canny", "cannyfull"), ("MeanShiftBlur", "meanshift"), ("AveragePooling", "pooling"), ("MaxPooling", "pooling"),
        ("MinPooling", "pooling"), ("MedianPooling", "pooling"), ("Jigsaw", "shuffle"), ("Clouds", "clouds"), ("Fog", "fog"), ("Snowflakes", "rainsnow"),
        ("Rain", "rainsnow"), ("CoarseSaltAndPepper", "dropout"), ("Dropout", "dropout"), ("Cutout", "dropout"), ("ElasticTransformation", "elastic"),
        ("PerspectiveTransform", "perspective"), ("UniformVoronoi", "crystallize"), ("RegularGridVoronoi", "crystallize"), ("EdgeDetect", "sobel"),
        ("DirectedEdgeDetect", "emboss"), ("AllChannelsCLAHE", "clahe"), ("ChangeColorTemperature", "planckian"),
        ("KMeansColorQuantization", "kmeansquant"), ("UniformColorQuantization", "posterize"), ("Autocontrast", "levels"),
        ("AddToHueAndSaturation", "tunehsv"), ("JpegCompression", "jpeg"), ("MotionBlur", "motion"), ("BilateralBlur", "surface")]],
    *[(n, IMGAUG, None) for n in ["BlendAlpha", "BlendAlphaSimplexNoise"]],
    # tone mapping & morphology from research round 3
    ("Durand bilateral tone mapping", "Tone mapping literature", "durand"), ("Fattal gradient domain", "Tone mapping literature", "fattal"),
    ("Local Laplacian filter", "Tone mapping literature", "locallaplacian"), ("Histogram specification", "Image processing", "histmatch"),
    ("Single-scale retinex (SSR)", "Image processing", "msr"), ("Mantiuk contrast domain", "Tone mapping literature", None),
    ("Ultimate erosion", "Mathematical morphology", "ultimateerosion"), ("Area opening", "Mathematical morphology", "reconstruct"),
    ("H-minima", "Mathematical morphology", "hmaxima"),
]
# science imaging round 4: microscopy, astronomy, remote sensing, documents
TOOLKITS += [
    ("Subtract Background (rolling ball)", "ImageJ / Fiji", "rollingball"), ("Subtract Background (sliding paraboloid)", "ImageJ / Fiji", "rollingball"),
    ("Pseudo flat-field correction", "ImageJ / Fiji", "flatfield"), ("Colour Deconvolution", "ImageJ / Fiji", "stainsep"),
    ("BaSiC shading correction", "ImageJ / Fiji", "flatfield"), ("Homomorphic filtering", "Image processing", "flatfield"),
    ("SCNR", "PixInsight", "scnr"), ("ScreenTransferFunction (STF autostretch)", "PixInsight", "astrostretch"),
    ("HistogramTransformation (midtones)", "PixInsight", "astrostretch"), ("ArcsinhStretch", "PixInsight", "astrostretch"),
    ("StarMask", "PixInsight", "starmask"), ("Star reduction (morphological)", "PixInsight", "starmask"),
    ("DynamicBackgroundExtraction (DBE)", "PixInsight", "rollingball"), ("AutomaticBackgroundExtractor (ABE)", "PixInsight", "flatfield"),
    ("Remove green noise", "Siril", "scnr"), ("Asinh transformation", "Siril", "astrostretch"), ("Background extraction", "Siril", "rollingball"),
    ("Rotational gradient (Larson-Sekanina)", "Astronomy", "larsonsekanina"), ("Starnet++ (starless)", "Astronomy", "starmask"),
    ("Deconvolution (Richardson-Lucy)", "Astronomy", "deconvolve"),
    ("VARI", "Remote sensing", "vegindex"), ("ExG (excess green)", "Remote sensing", "vegindex"), ("ExGR", "Remote sensing", "vegindex"),
    ("GLI (green leaf index)", "Remote sensing", "vegindex"), ("NGRDI", "Remote sensing", "vegindex"), ("MGRVI", "Remote sensing", "vegindex"),
    ("TGI (triangular greenness)", "Remote sensing", "vegindex"), ("CIVE", "Remote sensing", "vegindex"),
    ("NDVI", "Remote sensing", None), ("Pan-sharpening", "Remote sensing", None),
    ("Whiteboard / document enhance", "Document imaging", "whiteboard"), ("Shadow removal (document)", "Document imaging", "whiteboard"),
    ("Deskew", "Document imaging", None),
]

# round 5: edge-aware solvers, color science, transforms
TOOLKITS += [
    ("Domain transform filter (dtFilter)", "Toolkits & texture tools", "domaintransform"), ("ximgproc.dtFilter", "OpenCV", "domaintransform"),
    ("edgePreservingFilter", "OpenCV", "domaintransform"), ("Weighted least squares (WLS)", "Image processing", "wls"),
    ("ximgproc.fastGlobalSmootherFilter", "OpenCV", "wls"), ("L0 gradient smoothing", "Image processing", "wls"),
    ("Frequency separation", "Photoshop", "freqsep"), ("Color blindness simulation (Machado)", "Accessibility", "cvd"),
    ("Proof Setup: Protanopia", "Photoshop", "cvd"), ("Proof Setup: Deuteranopia", "Photoshop", "cvd"), ("Daltonize", "Accessibility", "cvd"),
    ("Bradford chromatic adaptation", "Color science", "chromadapt"), ("CAT02", "Color science", "chromadapt"),
    ("Von Kries adaptation", "Color science", "chromadapt"), ("Highlight/shadow clipping warning", "Lightroom", "clipwarn"),
    ("Zebra stripes", "Camera", "clipwarn"), ("Census transform", "Image processing", "census"), ("Rank transform", "Image processing", "census"),
    ("Hough transform (lines)", "Image processing", "houghspace"), ("transform.hough_line", "scikit-image", "houghspace"),
    ("Radon transform", "Image processing", "houghspace"), ("Gamut warning (CMYK)", "Photoshop", None), ("Phase congruency", "Image processing", None),
    ("Watershed segmentation", "Image processing", None), ("Floyd-Steinberg error diffusion", "Image processing", None),
]

# round 6: classic denoise families, local moments, low light
TOOLKITS += [
    *[(n, "Image processing", "statfilters") for n in ["Arithmetic mean filter", "Geometric mean filter", "Harmonic mean filter",
        "Contraharmonic mean filter", "Midpoint filter", "Alpha-trimmed mean filter", "Conservative smoothing"]],
    ("Lee filter", "Remote sensing", "speckle"), ("Kuan filter", "Remote sensing", "speckle"), ("Frost filter", "Remote sensing", "speckle"),
    ("Lee sigma filter", "Remote sensing", "speckle"), ("Refined Lee", "Remote sensing", "speckle"), ("Gamma-MAP filter", "Remote sensing", "speckle"),
    ("SRAD", "Medical imaging", "srad"), ("denoise_tv_chambolle", "scikit-image", "tvdenoise"), ("ROF total variation", "Image processing", "tvdenoise"),
    ("Mode filter", "Image processing", "modefilter"), ("Majority filter", "GIS", "modefilter"), ("filters.rank.majority", "scikit-image", "modefilter"),
    ("Local skewness", "Image processing", "localmoments"), ("Local kurtosis", "Image processing", "localmoments"),
    ("Coefficient of variation", "Image processing", "localmoments"), ("filters.rank.percentile", "scikit-image", "localmoments"),
    ("LIME low-light enhancement", "Image processing", "lowlight"), ("Low-light enhancement (Dong)", "Image processing", "lowlight"),
    ("Zero-DCE", "Neural", None), ("BM3D", "Image processing", None),
]

# round 7 (research campaign nexus4-domains + follow-ups)
TOOLKITS += [
    ("L.A.Cosmic", "Astronomy", "cosmicray"), ("Cosmic ray removal", "Astronomy", "cosmicray"), ("Hot/cold pixel cosmetic correction", "Siril", "cosmicray"),
    ("Deband", "Video tools", "deband"), ("f3kdb", "Video tools", "deband"), ("Gradient banding removal", "Image processing", "deband"),
    ("Defringe (purple fringing)", "Lightroom", "defringe"), ("Purple fringing removal", "darktable", "defringe"),
    ("Chromatic aberration correction", "Lightroom", "cacorrect"), ("Lateral CA correction", "RawTherapee", "cacorrect"),
    ("Matched filter (retinal vessels)", "Medical imaging", "matchedfilter"), ("Matched filter (point sources)", "Astronomy", "matchedfilter"),
    ("Anscombe transform", "Image processing", "anscombe"), ("Variance-stabilizing transform", "Image processing", "anscombe"),
    ("Dark frame subtraction", "Astronomy", None), ("Notch filter (periodic noise)", "Image processing", None),
]

# round 8: darktable / Snapseed / RawTherapee modules
TOOLKITS += [
    ("negadoctor", "darktable", "negadoctor"), ("invert (film negative)", "darktable", "negadoctor"), ("Film Negative", "RawTherapee", "negadoctor"),
    ("Negative Lab Pro (conversion)", "Lightroom", "negadoctor"), ("filmic rgb", "darktable", "filmic"), ("sigmoid", "darktable", "filmic"),
    ("AgX / filmic view transform", "Blender", "tonemap"), ("tone equalizer", "darktable", "toneequalizer"), ("graduated density", "darktable", "gradnd"),
    ("Graduated Filter", "Lightroom", "gradnd"), ("Graduated Filter", "RawTherapee", "gradnd"), ("velvia", "darktable", "velvia"),
    ("censorize", "darktable", "censor"), ("zone system", "darktable", "zonesystem"), ("contrast equalizer", "darktable", "detailseq"),
    ("local contrast", "darktable", "clarity"), ("haze removal", "darktable", "dehaze"), ("lowlight vision", "darktable", "nightvision"),
    ("highpass", "darktable", "highpass"), ("lowpass", "darktable", "gauss"), ("shadows and highlights", "darktable", "shadhi"),
    ("split-toning", "darktable", "split"), ("vibrance", "darktable", "vibrance"), ("color balance rgb", "darktable", "colorbalance"),
    ("monochrome", "darktable", "grayscale"), ("bloom", "darktable", "bloom"), ("soften", "darktable", "softfocus"), ("grain", "darktable", "grain"),
    ("Glamour Glow", "Snapseed", "glamourglow"), ("Tonal Contrast", "Snapseed", "tonalcontrast"), ("Drama", "Snapseed", "drama"),
    ("Grunge", "Snapseed", "grunge"), ("Details (Structure)", "Snapseed", "clarity"), ("HDR Scape", "Snapseed", "hdrtoning"),
    ("Noir", "Snapseed", "noir"), ("Lens Blur", "Snapseed", "tiltshift"), ("Vignette", "Snapseed", "vignette"),
]

# round 9 harvest (research/round9_list.py, generated by dedupe.py): unbuilt techniques, tracked as planned / out_of_scope
import importlib.util as _u, pathlib as _p
_s = _u.spec_from_file_location("round9_list", _p.Path(__file__).parent / "round9_list.py")
_r9 = _u.module_from_spec(_s); _s.loader.exec_module(_r9)
R9, R9_FAMILY, R9_REASON = _r9.R9, _r9.FAMILY, _r9.REASON
_s2 = _u.spec_from_file_location("round9_done", _p.Path(__file__).parent / "round9_done.py")
_d9 = _u.module_from_spec(_s2); _s2.loader.exec_module(_d9)
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R9]

# round 10 harvest (research/round10_list.py, from the harvest agent; verified by dedupe10.py)
_s10 = _u.spec_from_file_location("round10_list", _p.Path(__file__).parent / "round10_list.py")
_r10 = _u.module_from_spec(_s10); _s10.loader.exec_module(_r10)
R10, R10_FAMILY, R10_REASON = _r10.R10, _r10.FAMILY, _r10.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R10]

# round 11 harvest (research/round11_list.py, from the harvest agent; verified by dedupe11.py)
_s11 = _u.spec_from_file_location("round11_list", _p.Path(__file__).parent / "round11_list.py")
_r11 = _u.module_from_spec(_s11); _s11.loader.exec_module(_r11)
R11, R11_FAMILY, R11_REASON = _r11.R11, _r11.FAMILY, _r11.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R11]

# round 12 harvest (research/round12_list.py, from the harvest agent; verified by dedupe12.py)
_s12 = _u.spec_from_file_location("round12_list", _p.Path(__file__).parent / "round12_list.py")
_r12 = _u.module_from_spec(_s12); _s12.loader.exec_module(_r12)
R12, R12_FAMILY, R12_REASON = _r12.R12, _r12.FAMILY, _r12.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R12]

# round 13 harvest (research/round13_list.py, from the harvest agent; verified by dedupe13.py)
_s13 = _u.spec_from_file_location("round13_list", _p.Path(__file__).parent / "round13_list.py")
_r13 = _u.module_from_spec(_s13); _s13.loader.exec_module(_r13)
R13, R13_FAMILY, R13_REASON = _r13.R13, _r13.FAMILY, _r13.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R13]

# round 14 harvest (research/round14_list.py, from the harvest agent; verified by dedupe14.py)
_s14 = _u.spec_from_file_location("round14_list", _p.Path(__file__).parent / "round14_list.py")
_r14 = _u.module_from_spec(_s14); _s14.loader.exec_module(_r14)
R14, R14_FAMILY, R14_REASON = _r14.R14, _r14.FAMILY, _r14.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R14]

# round 15 harvest (research/round15_list.py, from the harvest agent; verified by dedupe15.py)
_s15 = _u.spec_from_file_location("round15_list", _p.Path(__file__).parent / "round15_list.py")
_r15 = _u.module_from_spec(_s15); _s15.loader.exec_module(_r15)
R15, R15_FAMILY, R15_REASON = _r15.R15, _r15.FAMILY, _r15.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R15]

# round 16 harvest (research/round16_list.py; literature-heavy, mostly search-summary verified)
_s16 = _u.spec_from_file_location("round16_list", _p.Path(__file__).parent / "round16_list.py")
_r16 = _u.module_from_spec(_s16); _s16.loader.exec_module(_r16)
R16, R16_FAMILY, R16_REASON = _r16.R16, _r16.FAMILY, _r16.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R16]
# round 17 harvest (research/round17_list.py; every entry read from a fetched menu/doc/source URL, verified by dedupe17.py)
_s17 = _u.spec_from_file_location("round17_list", _p.Path(__file__).parent / "round17_list.py")
_r17 = _u.module_from_spec(_s17); _s17.loader.exec_module(_r17)
R17, R17_FAMILY, R17_REASON = _r17.R17, _r17.FAMILY, _r17.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R17]
# round 18 harvest (research/round18_list.py; every entry read from a fetched page/catalogue/source, verified by dedupe18.py)
_s18 = _u.spec_from_file_location("round18_list", _p.Path(__file__).parent / "round18_list.py")
_r18 = _u.module_from_spec(_s18); _s18.loader.exec_module(_r18)
R18, R18_FAMILY, R18_REASON = _r18.R18, _r18.FAMILY, _r18.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R18]
# round 19 harvest (research/round19_list.py; verified from fetched catalogues/sources by dedupe19.py)
_s19 = _u.spec_from_file_location("round19_list", _p.Path(__file__).parent / "round19_list.py")
_r19 = _u.module_from_spec(_s19); _s19.loader.exec_module(_r19)
R19, R19_FAMILY, R19_REASON = _r19.R19, _r19.FAMILY, _r19.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R19]
# round 20 harvest (research/round20_list.py; verified from fetched docs/sources by dedupe20.py)
_s20 = _u.spec_from_file_location("round20_list", _p.Path(__file__).parent / "round20_list.py")
_r20 = _u.module_from_spec(_s20); _s20.loader.exec_module(_r20)
R20, R20_FAMILY, R20_REASON = _r20.R20, _r20.FAMILY, _r20.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R20]
# round 21 harvest (research/round21_list.py; verified by dedupe21.py; yield near saturation)
_s21 = _u.spec_from_file_location("round21_list", _p.Path(__file__).parent / "round21_list.py")
_r21 = _u.module_from_spec(_s21); _s21.loader.exec_module(_r21)
R21, R21_FAMILY, R21_REASON = _r21.R21, _r21.FAMILY, _r21.REASON
TOOLKITS += [(n, src, _d9.DONE.get(n)) for n, src, cat, fe in R21]
