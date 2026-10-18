"""Round 15 raw candidates (input to dedupe15.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.
How each block was confirmed is noted in its header ("first-hand" = read from the source listing, repo tree,
enum or API itself; "search" = from web-search summaries / literature knowledge checked by search).
Concept duplicates of filters.db / rounds 9-14 / index.html option labels were removed by hand with a keyword
sweep (research/wip/harvest15/kw.py, deleted after the run) before listing, e.g. camera "Miniature"/"Diorama" =
tilt-shift, "Pin Hole" = pinhole, "Partial Color"/"Extract Color" kept once only, "Water Color" = Watercolor,
EffecTV DotTV/MatrixTV/WarholTV/OpTV/LensTV/RandomDotStereoTV = dot matrix / Matrix rain / Warhol / Op Art /
magnifier / autostereogram, GStreamer geometric transforms = known distortions, ASC CDL = "Slope, Offset, Power".
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# === Camera in-body effects -- first-hand: ExifTool tag tables (exiftool.org/TagNames/<Vendor>.html enums) ======
R = "Olympus / OM System in-camera"                # ArtFilter, ArtFilterEffect, PictureMode enums
add(R, "Color", "S", "Pale & Light Color (Olympus Art Filter)", "Gentle Sepia (Olympus Art Filter)",
    "i-Enhance (Olympus Picture Mode)", "Color Creator (Olympus Picture Mode)", "Partial Color (Olympus Art Filter)")
add(R, "Tone", "S", "Light Tone (Olympus Art Filter)", "Dramatic Tone (Olympus Art Filter)")
add(R, "Film", "S", "Grainy Film (Olympus Art Filter)")
add(R, "Stylize", "S", "Punk (Olympus Art Filter)", "Key Line (Olympus Art Filter)")
add(R, "Distort", "S", "Fragmented (Olympus Art Filter)")
add(R, "Frames", "S", "White Edge (Olympus Art Effect)")
add(R, "Repair", "S", "e-Portrait (Olympus Picture Mode)")

R = "Panasonic Lumix in-camera"                    # FilterEffect enum
add(R, "Insta", "S", "Expressive (Lumix Creative Control)", "Retro (Lumix Creative Control)",
    "Old Days (Lumix Creative Control)", "Toy Pop (Lumix Creative Control)", "Fantasy (Lumix Creative Control)")
add(R, "Tone", "S", "High Dynamic (Lumix Creative Control)", "Impressive Art (Lumix Creative Control)")
add(R, "Film", "S", "Dynamic Monochrome (Lumix Creative Control)", "Silky Monochrome (Lumix Creative Control)",
    "Rough Monochrome (Lumix Creative Control)")

R = "Sony in-camera"                               # PictureEffect, PictureEffect2, CreativeStyle, ColorMode enums
add(R, "Insta", "S", "Pop Color (Sony Picture Effect)", "Retro Photo (Sony Picture Effect)",
    "Soft High Key (Sony Picture Effect)")
add(R, "Film", "S", "High Contrast Monochrome (Sony Picture Effect)")
add(R, "Tone", "X", "HDR Painting (Sony Picture Effect)", "Rich-tone Monochrome (Sony Picture Effect)")
add(R, "Color", "S", "Autumn Leaves (Sony Creative Style)", "Clear (Sony Creative Style)", "Deep (Sony Creative Style)",
    "Light (Sony Creative Style)", "Sunset (Sony Creative Style)", "FL (Sony Creative Look)", "IN (Sony Creative Look)",
    "SH (Sony Creative Look)", "Vivid 2 (Sony Creative Style)")

R = "Pentax / Ricoh in-camera"                     # Pentax DigitalFilter, ImageTone; Ricoh ImageEffects enums
add(R, "Distort", "S", "Slim (Pentax Digital Filter)")
add(R, "Tone", "S", "Tone Expansion (Pentax Digital Filter)", "HDR Tone (Ricoh Image Control)")
add(R, "Color", "S", "Unicolor Bold (Pentax Digital Filter)", "Muted (Pentax Custom Image)",
    "Reversal Film (Pentax Custom Image)", "Radiant (Pentax Custom Image)", "Flat (Pentax Custom Image)",
    "Positive Film (Ricoh Image Control)", "Negative Film (Ricoh Image Control)")
add(R, "Film", "S", "Bold Monochrome (Pentax Digital Filter)", "Soft Monotone (Ricoh Image Control)",
    "Hard Monotone (Ricoh Image Control)", "Hi-contrast B&W (Ricoh Image Control)")

R = "Nikon in-camera"                              # Creative Picture Controls (Nikon digitutor page) + ToningEffect enum
add(R, "Insta", "S", "Dream (Nikon Creative Picture Control)", "Morning (Nikon Creative Picture Control)",
    "Pop (Nikon Creative Picture Control)", "Sunday (Nikon Creative Picture Control)",
    "Somber (Nikon Creative Picture Control)", "Silence (Nikon Creative Picture Control)",
    "Bleached (Nikon Creative Picture Control)", "Melancholic (Nikon Creative Picture Control)",
    "Pure (Nikon Creative Picture Control)", "Denim (Nikon Creative Picture Control)",
    "Toy (Nikon Creative Picture Control)", "Carbon (Nikon Creative Picture Control)")
add(R, "Film", "S", "Flat Monochrome (Nikon Picture Control)", "Deep Tone Monochrome (Nikon Picture Control)")   # search: Nikon Z f spec page
add(R, "Color", "S", "Rich Tone Portrait (Nikon Picture Control)")

R = "Canon / Fujifilm / Samsung / Casio / Sigma in-camera"
add(R, "Film", "S", "Grainy B/W (Canon Creative Filter)")
add(R, "Tone", "S", "Art Bold (Canon HDR effect)", "Art Embossed (Canon HDR effect)", "Art HDR (Casio Art Shot)",
    "Dynamic Tone (Fujifilm Advanced Filter)")
add(R, "Color", "S", "Faithful (Canon Picture Style)", "Fine Detail (Canon Picture Style)",
    "Color Chrome Effect (Fujifilm)", "Color Chrome FX Blue (Fujifilm)", "Forest (Samsung Picture Wizard)",
    "Calm (Samsung Picture Wizard)", "FOV Classic Blue (Sigma Color Mode)", "Vivid Landscape (Casio)")
# Sigma fp colour modes -- first-hand: sigma-global.com SIGMA Color Mode Library; Leica Looks -- search: leica-camera.com
add(R, "Color", "S", "Cinema (Sigma Color Mode)", "Warm Gold (Sigma Color Mode)", "Sunset Red (Sigma Color Mode)",
    "Forest Green (Sigma Color Mode)", "Powder Blue (Sigma Color Mode)", "FOV Classic Yellow (Sigma Color Mode)",
    "Leica Classic (Leica Look)", "Leica Contemporary (Leica Look)", "Leica Eternal (Leica Look)",
    "Leica Chrome (Leica Look)")

# === EffecTV -- first-hand: github.com/fukuchi/EffecTV effects/*.c + GStreamer gst-plugins-good/gst/effectv =======
R = "EffecTV"
add(R, "Film", "S", "AgingTV (EffecTV film ageing)")
add(R, "Retro", "S", "RevTV (Rutt-Etra scan-line displacement)")
add(R, "Stylize", "S", "ShagadelicTV (psychedelic rings)", "SimuraTV (colour mirror)")
add(R, "Distort", "S", "WarpTV (EffecTV)", "DisplayWallTV (scrolling video wall)", "PuzzleTV (sliding-block shuffle)")
add(R, "Stylize", "X", "BaltanTV (delayed ghost trails)", "NervousTV (random frame shuffle)", "QuarkTV (per-pixel random frame)",
    "StreakTV (motion streaks)", "VertigoTV (zoom-rotate feedback)", "RippleTV (motion-triggered ripples)",
    "TimeDistortionTV", "SlofastTV", "DiffTV (frame-difference image)", "ChameleonTV (fade into background)",
    "BurningTV (flames on moving objects)", "FireTV (fire from motion)", "LifeTV (Game of Life seeded by motion)", "SparkTV (sparks along moving edges)", "SpiralTV (spiral time-warp)",
    "ColorfulStreak (EffecTV)", "EdgeBlurTV", "BlurzoomTV (radioactive zoom trails)", "DizzyTV (rotating feedback)",
    "1DTV (scan-line time slice)", "HolographicTV (hologram of moving subject)", "MosaicTV (mosaic on moving areas)",
    "HalfTV (mirrored half with delay)")

# === frei0r / MLT / Shotcut -- first-hand: github dyne/frei0r src/filter, mltframework.org PluginsFilters, ========
# === mltframework/shotcut src/qml/filters directory names; GStreamer gaudieffects ==================================
R = "frei0r / MLT / Shotcut"
add(R, "Repair", "S", "D90 Stair-Stepping Fix (frei0r)")
add(R, "Distort", "S", "Elastic Scale (frei0r nonlinear widescreen stretch)")
add(R, "Analysis", "S", "Color Distance (frei0r)", "Select0r (frei0r colour-range selection)",
    "Pr0file (frei0r line-profile scope)")
add(R, "Retro", "S", "Nosync0r (frei0r lost vertical sync)")
add(R, "Stylize", "G", "Twolay0r (frei0r dynamic two-level threshold)", "Threelay0r (frei0r dynamic three-level)")
add(R, "Color", "S", "Three Point Balance (frei0r)", "Primaries (frei0r reduce to primaries)")
add(R, "Stylize", "X", "Squigglevision (frei0r line boil)", "Light Graffiti (frei0r)")
add(R, "Frames", "S", "Pillar Echo (MLT blurred pillarbox fill)")
add(R, "Stylize", "X", "Choppy (MLT frame-rate decimation)")
add(R, "Repair", "S", "fspp (FFmpeg fast simple post-processing deblock)", "uspp (FFmpeg ultra simple post-processing)")
add(R, "Materials", "S", "Chromium (GStreamer Gaudi effects)")

# === ParaView colour-map presets -- first-hand: gitlab.kitware.com/paraview/paraview Remoting/Views/ColorMaps.json ==
# (Brewer copies, matplotlib/IDL copies, Jet/Turbo/Magma/hsv, generic Blues/Reds/Warm/Cool and "Step" variants omitted)
R = "ParaView colour-map presets"
add(R, "Color", "S", *[n + " (ParaView colormap)" for n in (
    "Cool to Warm", "Cool to Warm Extended", "Warm to Cool Extended", "Black-Body Radiation", "Black, Blue and White",
    "Black, Orange and White", "Blue Orange divergent", "Gray and Red", "Linear Green Gr4L", "Cold and Hot",
    "Blue - Green - Orange", "Rainbow Desaturated", "Yellow - Gray - Blue", "Rainbow Uniform", "KAAMS",
    "Linear YGB 1211g", "Linear Blue 8_31f", "Rainbow Blended White", "Rainbow Blended Grey", "Rainbow Blended Black",
    "CIELab Blue to Red", "erdc_rainbow_bright", "erdc_rainbow_dark", "nic_CubicL", "nic_CubicYF", "nic_Edge", "2hot",
    "erdc_red2yellow_BW", "erdc_marine2gold_BW", "erdc_blue2gold_BW", "erdc_sapphire2gold_BW", "erdc_red2purple_BW",
    "erdc_purple2pink_BW", "erdc_pbj_lin", "erdc_blue2green_muted", "erdc_green2yellow_BW", "erdc_cyan2orange",
    "erdc_purple2green_dark", "erdc_divHi_purpleGreen", "erdc_divLow_icePeach", "erdc_iceFire_H", "erdc_iceFire_L",
    "heated_object", "hue_L60", "Wild Flower", "Citrus", "Traffic Lights For Deuteranopes", "Muted Blue-Green",
    "Green-Blue Asymmetric Divergent 62Blbc", "Asymmetrical Earth Tones 6_21b", "Yellow 15", "Haze_green", "Haze_lime",
    "GBBr", "GYPi", "GnYlRd", "BrOrYl")])

# === GPU vendor SDKs & engine post-processing -- search: gpuopen.com FidelityFX SDK pages, arm.com ASR, ===========
# === NVIDIA / Intel / Sony / Apple / Epic / Unity developer pages =================================================
R = "GPU vendor SDKs & engine upscalers"
add(R, "Depth", "S", "FidelityFX CACAO (combined adaptive compute AO)", "Screen-space contact shadows")
add(R, "Tone", "S", "FidelityFX LPM (Luma Preserving Mapper)")
add(R, "Render", "X", "FidelityFX SSSR (stochastic screen-space reflections)", "FidelityFX Denoiser (shadows / reflections)",
    "FidelityFX Hybrid Reflections", "NVIDIA NRD ReBLUR denoiser", "NVIDIA NRD ReLAX denoiser", "NVIDIA NRD SIGMA shadow denoiser")
add(R, "Edges", "S", "MLAA (morphological anti-aliasing, Reshetov)")
add(R, "Sharpen", "M", "NVIDIA DLSS super resolution", "Intel XeSS", "PSSR (PlayStation Spectral Super Resolution)",
    "DLSS Ray Reconstruction")
add(R, "Sharpen", "X", "FSR 2 temporal upscaling", "Unreal TSR (Temporal Super Resolution)",
    "Unity STP (Spatial-Temporal Post-processing)", "Arm ASR (Accuracy Super Resolution)", "MetalFX Temporal Scaler")
add(R, "Sharpen", "S", "MetalFX Spatial Scaler")

# === Phone-camera & webcam AI features -- search: Google Pixel / Samsung / Apple / NVIDIA Broadcast pages ========
R = "Phone & webcam AI features"
add(R, "Render", "M", "Portrait Light (Google Photos ML relighting)", "Studio Light (Apple Portrait Lighting)",
    "Virtual Key Light (NVIDIA Broadcast)")
add(R, "Repair", "M", "Photo Unblur (Google Photos)", "Zoom Enhance (Google Pixel)", "Shadow Eraser (Samsung Gallery)",
    "Remaster (Samsung Gallery)", "Eye Contact (NVIDIA Broadcast gaze redirection)", "Generative Fill (Photoshop Firefly)",
    "Generative Expand (Photoshop Firefly)")
add(R, "Repair", "X", "Night Sight (Pixel burst merge)", "Super Res Zoom (Pixel multi-frame)", "Best Take (Pixel face swap)",
    "Add Me (Pixel group-photo merge)", "Action Pan (Pixel motion mode)", "Long Exposure (Pixel motion mode)",
    "Auto Frame (NVIDIA Broadcast)", "Silky Water (Huawei light painting)", "Light Trails (Huawei light painting)",
    "Star Trails (Huawei light painting)")
add(R, "Distort", "M", "Head Pose (Snapseed)", "Magic Editor (Google Photos)")
add(R, "Tone", "M", "RTX Video HDR (NVIDIA SDR-to-HDR)")
add(R, "Color", "M", "RTX Dynamic Vibrance (NVIDIA app)")
add(R, "Sharpen", "M", "RTX Video Super Resolution (NVIDIA)")
add(R, "Augment", "X", "RIFE frame interpolation", "DLSS Frame Generation", "AMD Fluid Motion Frames")
add(R, "Tone", "G", "Inverse tone mapping (SDR-to-HDR expansion, Banterle 2006)")

# === Skylum Aurora HDR -- search: Wikipedia / reviews tool list =====================================================
R = "Aurora HDR / Luminar"
add(R, "Tone", "S", "HDR Smart Structure (Aurora HDR)", "Top & Bottom Lighting (Aurora HDR)")
add(R, "Blur", "S", "Image Radiance (Aurora HDR)")
add(R, "Noise", "S", "HDR Denoise (Aurora HDR)")
add(R, "Render", "M", "Relight AI (Luminar Neo)")
add(R, "Repair", "M", "GenSwap (Luminar Neo)")

# === Capture One / Lightroom -- search: support.captureone.com film grain & clarity articles; helpx.adobe.com ======
R = "Capture One / Lightroom controls"
add(R, "Tone", "S", "Clarity: Natural (Capture One)", "Clarity: Punch (Capture One)", "Clarity: Neutral (Capture One)",
    "Clarity: Classic (Capture One)")
add(R, "Frames", "S", "Post-Crop Vignette: Highlight Priority (Lightroom)", "Post-Crop Vignette: Color Priority (Lightroom)",
    "Post-Crop Vignette: Paint Overlay (Lightroom)")
add(R, "Distort", "G", "Upright: Level (Lightroom auto horizon)", "Upright: Vertical (Lightroom)", "Upright: Full (Lightroom)",
    "Guided Upright (Lightroom)")
add(R, "Repair", "G", "Remove Vignette (Affinity Photo auto devignetting)")

# === G'MIC "Simulate Film" stocks -- first-hand: GreycLab/gmic src/gmic_stdlib.gmic fx_simulate_film preset lists ==
# (HaldCLUTs from RawTherapee Film Simulation / Pat David / Juan Melara; +/- strength and warm/cold variants folded;
#  stocks already known (Kodachrome, Ektar 100, Tri-X 400, Provia 100F, Velvia, Portra 160/400/800, Pro 400H,
#  T-Max P3200, Agfa Ultra 100, Elite Chrome 100, Polaroid 669, FP-100C, Kodak 2383/2393) left out)
R = "G'MIC Simulate Film stocks"
add(R, "Film", "S", *[n + " (film simulation)" for n in (
    "Agfa APX 25", "Fuji Neopan 1600", "Ilford HPS 800", "Kodak HIE High-Speed Infrared", "Rollei IR 400",
    "Rollei Ortho 25", "Rollei Retro 100 Tonal", "Polaroid 664", "Polaroid 667", "Polaroid 672",
    "Polaroid PX-100UV+", "Polaroid PX-680", "Polaroid PX-70", "Polaroid Time Zero Expired", "Polaroid Polachrome",
    "Polaroid 665", "Polaroid 665 Negative", "Polaroid 690", "Fuji FP-3000b", "Fuji FP-3000b Negative",
    "Fuji FP-100c Negative", "Fuji Superia 200", "Fuji Superia HG 1600", "Fuji Superia Reala 100",
    "Fuji Superia X-Tra 800", "Fuji Superia 200 XPRO", "Fuji 160C", "Fuji 800Z", "Fuji Provia 400F", "Fuji Provia 400X",
    "Fuji 3510 print film", "Fuji 3513 print film", "Kodak Elite 100 XPRO", "Kodak Elite Color 200",
    "Kodak Elite Color 400", "Kodak Elite ExtraColor 100", "Kodak Ektachrome 100 VS", "Kodak Kodachrome 25",
    "Kodak Kodachrome 200", "Kodak Portra 160 NC", "Kodak Portra 160 VC", "Kodak Portra 400 NC", "Kodak Portra 400 UC",
    "Kodak Portra 400 VC")])
# further current/cine stocks -- search: Kodak / Lomography / Ferrania / ADOX product pages (emulation targets)
add(R, "Film", "S", "Eastman Double-X 5222 (film simulation)", "Kodak Pro Image 100 (film simulation)",
    "LomoChrome Color '92 (film simulation)", "Ferrania P30 (film simulation)", "ADOX Silvermax 100 (film simulation)")

# === Microsoft Office picture "Artistic Effects" -- first-hand: learn.microsoft.com MsoPictureEffectType enum =====
# (Blur, Cutout, Film Grain, Glass, Glow Edges, Marker, Photocopy, Plastic Wrap, Texturizer, Diffused Glow = known)
R = "Microsoft Office artistic effects"
add(R, "Paint", "S", "Cement (Office artistic effect)", "Chalk Sketch (Office artistic effect)",
    "Crisscross Etching (Office artistic effect)", "Light Screen (Office artistic effect)",
    "Line Drawing (Office artistic effect)", "Mosaic Bubbles (Office artistic effect)",
    "Paint Strokes (Office artistic effect)", "Pastels Smooth (Office artistic effect)",
    "Pencil Grayscale (Office artistic effect)", "Watercolor Sponge (Office artistic effect)",
    "Paint Brush (Office artistic effect)")

# === Picasa 3.9 effects -- search: Neowin Picasa 3.9 thread, Picasa 3.9 guide (Lomo-ish/Holga-ish/HDR-ish/ ======
# === Orton-ish/Focal B&W/Focal Zoom/Graduated Tint = known concepts, left out) ====================================
R = "Picasa effects"
add(R, "Insta", "S", "Cinemascope (Picasa)", "Sixties (Picasa)", "Warmify (Picasa)")

# === DaVinci Resolve ResolveFX -- search: Blackmagic Resolve 19/20 new-features & ResolveFX reference ============
R = "DaVinci Resolve 2"
add(R, "Color", "S", "Color Slice (DaVinci Resolve)")
add(R, "Color", "X", "Color Stabilizer (ResolveFX)", "Shot Match (DaVinci Resolve)")
add(R, "Stylize", "X", "Stop Motion (ResolveFX)")
add(R, "Distort", "X", "Speed Warp (DaVinci Resolve)")
add(R, "Augment", "M", "Smart Reframe (DaVinci Resolve)")

# === Literature: named single-image algorithms -- search/literature knowledge (paper names + years checked); =====
# === concept duplicates already in the db (FGS, WLS, L0, domain transform, Wolf/NICK/Feng/Singh, SEEDS, ACWE, =====
# === geodesic AC, BayesShrink, Toggle contrast, LDP-directional, SSR/MSR/MSRCR, BBHE/DSIHE, LDR, CVC) left out ======
R = "Edge-preserving & robust filters (literature)"
add(R, "Blur", "S", "Vector median filter (Astola 1990)", "Vector directional filter (Trahanias 1993)",
    "Olympic filter (trimmed-extremes mean)", "Peer group filter (Deng-Kenney 2001)",
    "Saint-Marc adaptive smoothing (1991)", "Side window filter (Yin 2019)", "Curvature filter (Gong-Sbalzarini 2017)",
    "Gradient domain guided filter (Kou 2015)", "Weighted guided image filter (Li 2015)")
add(R, "Blur", "G", "Relative total variation structure extraction (Xu 2012)", "Tree filter (Bao 2014)")
add(R, "Blur", "X", "Joint / cross bilateral filter (flash-no-flash)", "Mutual-structure joint filtering (Shen 2015)")

R = "Feature & edge detectors (literature)"
add(R, "Edges", "G", "Petrou-Kittler optimal ramp-edge detector", "Sarkar-Boyer optimal IIR edge filter",
    "Curvature scale space corners (Mokhtarian)", "GLOH descriptor field")
add(R, "Edges", "S", "Difference of Offset Gaussians (DOOG)", "Zuniga-Haralick facet corner", "AGAST keypoints",
    "ORB keypoints (oriented FAST + rotated BRIEF)")

R = "Contrast & low-light enhancement (literature)"
add(R, "Tone", "G", "MMBEBHE (min mean-brightness-error bi-HE)", "RMSHE (recursive mean-separate HE)",
    "BPDHE (brightness-preserving dynamic HE)", "POSHE (partially overlapped sub-block HE)",
    "WTHE (weighted thresholded HE)", "ESIHE (exposure-based sub-image HE)",
    "ACE automatic color equalization (Rizzi 2003)", "MSRCP (multiscale retinex with chromaticity preservation)",
    "Multi-fusion low-light enhancement (Fu 2016)", "JED joint enhancement and denoising (Ren 2018)",
    "Robust Retinex (Li 2018)", "Wavelet companding HDR (Li-Sharan-Adelson 2005)")

R = "Dehazing (literature)"
add(R, "Repair", "G", "Color attenuation prior dehaze (Zhu 2015)", "Fast visibility restoration (Tarel-Hautiere 2009)",
    "Boundary-constraint dehaze (Meng 2013)", "Color-lines dehaze (Fattal 2014)")
add(R, "Repair", "M", "DehazeNet", "AOD-Net")

R = "Segmentation, texture & denoising (literature)"
add(R, "Analysis", "G", "Compact watershed (Neubert-Protzel 2014)", "Random walker segmentation (Grady 2006)",
    "ERS entropy-rate superpixels", "Turbopixels", "Su binarization (Su-Lu-Tan 2010)",
    "GLDM grey-level dependence map")
add(R, "Analysis", "S", "Local derivative pattern (Zhang 2010)", "BSIF binarized statistical image features")
add(R, "Noise", "G", "K-SVD dictionary denoising", "WNNM weighted nuclear norm denoising", "EPLL patch-prior denoising",
    "VisuShrink wavelet threshold", "SureShrink wavelet threshold")

R = "Neural restoration & editing models"
add(R, "Noise", "M", "DnCNN", "FFDNet", "Restormer", "Uformer", "MPRNet", "MIRNet")
add(R, "Tone", "M", "RetinexNet", "KinD low-light", "URetinex-Net", "SCI self-calibrated illumination", "HDRNet (Gharbi 2017)",
    "DeepLPF", "CURL curve-based enhancement", "Image-adaptive 3D LUT (Zeng 2020)")
add(R, "Sharpen", "M", "SRGAN", "EDSR", "RCAN", "HAT (hybrid attention transformer SR)", "BSRGAN")
add(R, "Repair", "M", "CodeFormer", "RestoreFormer", "ZITS inpainting", "Stable Diffusion inpainting")
add(R, "Color", "M", "DDColor", "ColTran", "BigColor")
add(R, "Stylize", "M", "ControlNet", "InstructPix2Pix", "SDEdit")

# === Apple iMovie clip filters -- search: gadgethacks iMovie filter picker list, Macworld comic-filter update ======
R = "Apple iMovie filters"
add(R, "Insta", "S", "Blast (iMovie)", "Blockbuster (iMovie)", "Dreamy (iMovie)", "Western (iMovie)", "Camo (iMovie)",
    "Comic Vintage (iMovie)")
add(R, "Film", "S", "Silent Era (iMovie)")

# === Adobe Premiere Pro -- search: helpx.adobe.com Immersive Video effects page (VR Rotate Sphere / VR Projection ==
# === = known equirect rotation / projection, left out) ============================================================
R = "Premiere Pro immersive & assist"
add(R, "Blur", "S", "VR Blur (seam-aware 360 blur)", "VR Glow (360)")
add(R, "Sharpen", "S", "VR Sharpen (360)")
add(R, "Noise", "S", "VR De-Noise (360)", "VR Fractal Noise (360)")
add(R, "Distort", "S", "VR Chromatic Aberrations (360)", "VR Digital Glitch (360)", "VR Plane to Sphere")
add(R, "Render", "S", "VR Color Gradients (360)")
add(R, "Repair", "X", "Warp Stabilizer (Premiere / After Effects)", "Morph Cut (Premiere)")
add(R, "Augment", "M", "Auto Reframe (Premiere)")

# === Scientific imaging leftovers -- first-hand: Kitware/VTK Imaging/* headers, halide/Halide apps/ dir; ==========
# === search: Fiji Bleach Correction / Linear Kuwahara pages, Icy HK-Means plugin, ERDAS IMAGINE Spatial =============
# === Enhancement & Radiometric menus =================================================================================
R = "Scientific imaging leftovers"
add(R, "Render", "S", "Boolean texture (VTK vtkBooleanTexture)", "Triangular texture (VTK vtkTriangularTexture)")
add(R, "Blur", "G", "Young-van Vliet recursive Gaussian (Halide iir_blur)")
add(R, "Sharpen", "X", "Bilateral guided upsampling (BGU, Chen 2016)")
add(R, "Paint", "S", "Linear Kuwahara (Fiji)")
add(R, "Tone", "X", "Bleach correction (Fiji, photobleaching)")
add(R, "Analysis", "G", "HK-Means (Icy hierarchical K-means)")
add(R, "Sharpen", "S", "Crisp (ERDAS IMAGINE)")
add(R, "Repair", "G", "Destripe (ERDAS / ENVI sensor striping removal)")
add(R, "Repair", "S", "Replace Bad Lines (ERDAS IMAGINE)")

# === lygia shader library -- first-hand: github patriciogonzalezvivo/lygia filter/, color/, generative/ ============
R = "lygia shader library"
add(R, "Blur", "S", "Fibonacci bokeh (lygia)")
add(R, "Color", "S", "RYB hue shift (lygia artist colour wheel)", "Zorn palette (lygia)", "Wada Sanzo palette (lygia)",
    "Ridgway palette (lygia)", "Flexoki palette (lygia)")
add(R, "Tone", "S", "Reinhard-Jodie tonemap")
add(R, "Materials", "S", "Untile (Quilez texture-repetition breakup)")
add(R, "Noise", "S", "psrdnoise (periodic rotating simplex noise)")
add(R, "Terrain", "S", "Gerstner waves heightmap")
