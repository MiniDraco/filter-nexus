"""Round 12 raw candidates (input to dedupe12.py --build).

C = [(name, source, category, feasibility)]; S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames. DROP / CATEGORY / SOURCE / FEAS are optional overrides keyed by name.
Every name here was read from a real menu, effect index, repo file listing, API or paper list; how each block was
confirmed is noted in its header comment.
"""
C = []
def add(source, cat, feas, *names):
    for n in names: C.append((n, source, cat, feas))

# --- ReShade community repos -- GitHub tree listings (api.github.com git/trees) of prod80-ReShade-Repository,
#     fubax-shaders, AstrayFX, iMMERSE, GShade-Shaders, SweetFX, luluco250/FXShaders, CorgiFX, dh-reshade-shaders,
#     CShade, Insane-Shaders, Daodan317081/reshade-shaders, NiceGuy-Shaders, ZenteonFX, Depth3D, Pirate-Shaders -------
R = "ReShade repos 3"
add(R, "Color", "S", "Color Gamut (prod80)", "Color Gradients (prod80)", "Color Isolation (prod80)",
    "Adaptive Color Grading (GShade)", "Sunset Filter (Fubax)", "Palette Map (Zenteon)", "Retro Tint (Daodan)")
add(R, "Color", "G", "Correct Color (prod80)", "Remove Tint (Daodan)", "Adaptive Tint (Daodan)")
add(R, "Tone", "S", "Color Space Curves (prod80)", "Curved Levels (prod80)", "Luma Fade (prod80)",
    "Blooming HDR (AstrayFX)", "Watch Dogs Tonemap", "Magic HDR (luluco250)", "Whitepoint Fixer (luluco250)")
add(R, "Tone", "G", "Correct Contrast (prod80)", "Filmic Adaptation (prod80)")
add(R, "Stylize", "S", "Magical Rectangle (prod80)", "Flair (AstrayFX)", "SOLARIS bloom (iMMERSE)", "Arcane Bloom (luluco250)",
    "Neo Bloom (luluco250)", "Hex Lens Flare (luluco250)", "Unreal Lens (luluco250)", "Tracking Rays (luluco250)",
    "Bessel Bloom (Insane)", "Deep Fry (Insane)", "Colorful Poster (Daodan)", "Multi Tone Poster (Daodan)",
    "Xenon Bloom (Zenteon)", "Artistic Vignette (luluco250)")
add(R, "Retro", "S", "Posterize Pixelate (prod80)", "Retro Fog (luluco250)", "Virtual Resolution (luluco250)")
add(R, "Sharpen", "S", "Filmic Anamorph Sharpen", "Sharp Contrast (Insane)")
add(R, "Distort", "S", "Perfect Perspective (Fubax)", "Liquid Lens (luluco250)", "Flexible CA (luluco250)",
    "Dynamic Raindrops (NiceGuy)", "Polynomial Barrel Distortion for HMDs")
add(R, "Depth", "S", "Gloom AO (AstrayFX)", "Radiant GI (AstrayFX)", "MXAO (iMMERSE)", "Canvas Fog (CorgiFX)",
    "Stage Depth (GShade)", "Mesh Edges (Daodan)", "NG Lighting (NiceGuy)", "Volumetric Fog (NiceGuy)",
    "Turbo GI (Zenteon)", "Anaglyph to SBS (Depth3D)", "Dimension Plus (Depth3D)", "Hole Filler (NiceGuy)")
add(R, "Repair", "S", "DLAA Plus (AstrayFX)", "CMAA 2 (Insane)", "Smart DeNoise (GShade)", "Undither (DH)")
add(R, "Repair", "G", "ReVeil (Insane)", "Ambient Remove (DH)")
add(R, "Paint", "S", "Bilateral Comic (Insane)")
add(R, "Blur", "S", "Noise Blur (CShade)")
add(R, "Repair", "X", "Temporal AA (AstrayFX)", "Motion Stabilization (CShade)")
add(R, "Stylize", "X", "Trails (AstrayFX)")

# --- RetroArch slang-shaders -- GitHub tree of libretro/slang-shaders (handheld/, ntsc/, misc/, interpolation/,
#     sharpen/, denoisers/, deblur/, anti-aliasing/, blurs/, pixel-art-scaling/, dithering/, warp/, motionblur/,
#     reshade/, film/, vhs/, presets/, crt/) ----------------------------------------------------------------------------
RH = "RetroArch: handheld & NTSC"
add(RH, "Retro", "S", "agb001 (GBA LCD)", "ags001 (GBA SP frontlight)", "authentic_gbc", "sameboy-lcd", "simpletex_lcd",
    "lcd1x_psp", "retro-v3 (handheld)", "pixel_transparency (handheld)", "sunlight_shimmer (handheld)",
    "frontlit-reflective (handheld)", "mega-blocks-brick", "mega-blocks-dome",
    "analog_overshoot (NTSC)", "artifact-colors (NTSC)", "mame-ntsc", "ntsc-blastem", "ntsc-xot", "patchy-blastem",
    "patchy-snes", "tiny_ntsc", "ntsc-adaptive")
RM = "RetroArch: misc & scaling"
add(RM, "Color", "S", "color-mangler", "colorimetry (misc)", "chromaticity (misc)", "natural-vision", "night-mode (misc)",
    "patchy-color", "yiq-hue-adjustment", "ss-gamma-ramp", "bsnes-gamma-ramp", "accessibility_mods", "nes-color-decoder")
add(RM, "Retro", "S", "ega (misc)", "pixel-weave (misc)", "print-resolution (misc)", "convergence (CRT misc)",
    "apple-monitor-II", "crtsim-grungy", "mudlord-pal-vhs", "film_noise (slang)", "blur-haze (sh1nra358)")
add(RM, "Sharpen", "S", "jinc2-sharper", "hann-5-taps", "lanczos16-AR", "spline100", "spline256", "cheap-sharpen",
    "rca_sharpen", "super-res-ex", "deblur-luma")
add(RM, "Repair", "S", "aa-shader-4.0", "advanced-aa", "ewa_curvature", "reverse-aa", "sharpsmoother", "fast-bilateral-3d",
    "gdapt", "jinc2-dedither", "cbod_v1", "smart-morph")
add(RM, "Retro", "S", "ControlledSharpness", "SmuberStep", "smootheststep", "aann", "bandlimit-pixel", "edge1pixel",
    "edgeNpixels", "grid-blend-hybrid", "pixel_aa", "soft-pixel-art", "uniform-nearest", "g-sharp_resampler", "gendither")
add(RM, "Stylize", "S", "dual_filter_bloom", "NormalsDisplacement (reshade port)")
add(RM, "Retro", "X", "braid-rewind", "mix_frames_smart", "response-time (LCD)")
RC = "RetroArch: CRT 3"
add(RC, "Retro", "S", "crt-CreativeForce-Arcade", "crt-Cyclon", "crt-beans", "crt-blurPi", "crt-gdv-mini", "crt-pocket",
    "crt-potato", "crt-torridgristle", "crt-yah", "crt-yo6 (Trinitron KV)", "crtglow", "fakelottes", "gizmo-crt",
    "gtu-v050", "lottesRVM", "mame_hlsl", "metacrt", "moire-resolve", "monoCRT", "vt220 (terminal)", "crt-maximus-royale")

# --- mpv / libplacebo user shaders -- GitHub trees of bjin/mpv-prescalers, bloc97/Anime4K, haasn/libplacebo ------------
MP = "mpv / libplacebo shaders 2"
add(MP, "Sharpen", "S", "RAVU-Lite", "RAVU-Zoom", "RAVU-3x", "NVIDIA Image Scaling (NIS)",
    "SGSR (Snapdragon Game Super Resolution)", "Anime4K Thin", "Anime4K Darken", "Anime4K Clamp Highlights",
    "Anime4K Deblur DoG", "Antiringing (libplacebo)", "Sphinx window", "Kaiser window", "Blackman window")
add(MP, "Repair", "S", "hdeband")
add(MP, "Sharpen", "M", "ACNet", "Anime4K Restore CNN")

# --- Boris FX Sapphire -- borisfx.com/documentation/sapphire/ofx/picture-index (fetched) -----------------------------
SA = "Boris FX Sapphire"
add(SA, "Stylize", "S", "S_GlowOrthicon", "S_GlowRings", "S_GlowRainbow", "S_GlowAura", "S_GlowNoise", "S_GlowDist",
    "S_UltraGlow", "S_GlintRainbow", "S_EdgeRays", "S_EdgeFlash", "S_ZGlow", "S_Hotspots", "S_LaserBeam",
    "S_Sparkles", "S_Zebrafy", "S_ColorFuse")
add(SA, "Edges", "S", "S_EdgeColorize", "S_EdgeDetectDouble", "S_EdgesInDirection")
add(SA, "Blur", "S", "S_EdgeAwareBlur", "S_BlurChroma", "S_BlurMoCurves", "S_DefocusPrism", "S_RackDefocus",
    "S_ZFogExponential", "S_ZFogLinear")
add(SA, "Distort", "S", "S_DogVision", "S_FlysEyeHex", "S_FlysEyeCircles", "S_KaleidoDiamonds", "S_KaleidoOct",
    "S_KaleidoRadial", "S_WarpPuff", "S_WarpPuddle", "S_WarpDrops", "S_WarpChroma", "S_WarpRepeat", "S_HyperPull",
    "S_HyperPush", "S_InfiniteZoom", "S_StretchFrameEdges", "S_TileScramble", "S_RomanTile", "S_FreeLens")
add(SA, "Paint", "S", "S_HalfToneRings", "S_EmbossGlass", "S_EmbossShiny", "S_Etching", "S_BrushChalk", "S_CartoonPaint")
add(SA, "Paint", "G", "S_AutoPaint")
add(SA, "Noise", "S", "S_TextureCells", "S_TextureChromaSpiral", "S_TextureFlux", "S_TextureFolded", "S_TextureLoops",
    "S_TextureMicro", "S_TextureNeurons", "S_TextureNoiseEmboss", "S_TextureRidges", "S_TextureWeave", "S_CloudsPsyko",
    "S_CloudsVortex", "S_PsykoBlobs", "S_PsykoStripes", "S_UltraGrain")
add(SA, "Retro", "S", "S_DigitalDamage", "S_JpegDamage")
add(SA, "Analysis", "S", "S_ShowBadColors", "S_NearestColor")
add(SA, "Color", "S", "S_ClampChroma")
add(SA, "Render", "S", "S_Luna", "S_NightSky")
add(SA, "Stylize", "X", "S_TimeWarpRGB", "S_TimeSlice", "S_TrailsDiffuse", "S_PixelMosh")
add(SA, "Analysis", "X", "S_MotionDetect")

# --- Boris FX Continuum (BCC) 2026 -- borisfx.com/documentation/continuum/bcc-effects-list/ (fetched) and the VEGAS
#     plug-in CSV at vegtips.readthedocs.io/csv/videofx.csv -------------------------------------------------------------
BC = "Boris FX Continuum (BCC)"
add(BC, "Paint", "S", "BCC Artists Poster", "BCC Cartooner", "BCC Charcoal Sketch", "BCC Spray Paint Noise",
    "BCC Tile Mosaic", "BCC Water Color")
add(BC, "Stylize", "S", "BCC+ Color Infrared", "BCC+ Color Shadow", "BCC+ Super LED", "BCC Color Choker", "BCC Colorize Glow",
    "BCC Damaged TV", "BCC Edge Grunge", "BCC Misalignment", "BCC Multi-Shadow", "BCC RGB Edges", "BCC RGB PixelNoise",
    "BCC Scatterize", "BCC Glow Alpha Edges", "BCC Reverse Spotlight", "BCC Rays Puffy", "BCC Rays Radiant Edges",
    "BCC Edge Lighting", "BCC+ Ice Halos", "BCC+ Multi-Star", "BCC+ Chroma Bands", "BCC+ Eye Light", "BCC+ Key Light",
    "BCC+ Ambient Light", "BCC+ Overexpose", "BCC+ Reflector", "BCC+ Orbs", "BCC+ Film Glow", "BCC+ Flashing",
    "BCC+ Atmospheric Glow")
add(BC, "Blur", "S", "BCC+ Smear Blur", "BCC Lens Shape", "BCC+ Center Spot", "BCC+ Double Fog", "BCC+ Net", "BCC+ Silk",
    "BCC+ Mist", "BCC+ Split Field", "BCC+ Smoke and Fog")
add(BC, "Color", "S", "BCC+ DeFog", "BCC+ F Stop", "BCC+ Florescent", "BCC+ Polarizer", "BCC+ Selective Saturation",
    "BCC+ High Contrast", "BCC+ Low Contrast", "BCC Invert Solarize", "BCC Multitone Mix", "BCC+ Color Spot",
    "BCC+ Dual Gradient", "BCC+ Gels", "BCC+ ND Gradient", "BCC+ Radial Tint", "BCC+ Skin Tone", "BCC+ Sunset",
    "BCC Broadcast Safe", "BCC+ Radial Exposure")
add(BC, "Repair", "S", "BCC+ DeBlock", "BCC Pixel Fixer", "BCC+ Wide Angle Lens")
add(BC, "Distort", "S", "BCC Polar Displacement", "BCC Vector Displacement")
add(BC, "Noise", "S", "BCC Mixed Colors", "BCC Noise Map 2", "BCC Organic Strands")
add(BC, "Render", "S", "BCC Pin Art 3D")
add(BC, "Stylize", "X", "BCC+ Harris Shutter", "BCC+ Light Flicker", "BCC Posterize Time")
add(BC, "Film", "X", "BCC Match Grain")

# --- Digital Film Tools (DFT) OFX names not shared with BCC+ -- vegtips videofx.csv, group "DFT" -------------------------
DF = "Digital Film Tools (DFT)"
add(DF, "Stylize", "S", "Fan Rays (DFT)", "Spiral Rays (DFT)", "Random Spikes (DFT)", "Radial Streaks (DFT)",
    "Water Droplets (DFT)", "Turb Distort (DFT)", "Ozone (DFT)")
add(DF, "Color", "S", "Printer Points (DFT)", "Color Suppress (DFT)", "Telecine (DFT)")
add(DF, "Repair", "S", "Screen Smoother (DFT)", "DeArtifact (DFT)")
add(DF, "Blur", "X", "Frame Averager (DFT)", "Time Blur (DFT)")

# --- FXHOME Ignite Pro (HitFilm effects) -- vegtips videofx.csv, group "Ignite Pro" ------------------------------------
IG = "Ignite Pro / HitFilm"
add(IG, "Stylize", "S", "Ignite Chromenator", "Ignite Derez (VGHS)", "Ignite Dimension Rift", "Ignite Dot Matrix",
    "Ignite Electro", "Ignite Insect Vision", "Ignite Light Streaks", "Ignite Gleam", "Ignite Hyperdrive",
    "Ignite Radio Waves")
add(IG, "Distort", "S", "Ignite Energy Distortion", "Ignite Fluid Distortion", "Ignite Heat Distortion", "Ignite Pond Ripple",
    "Ignite Rain On Glass", "Ignite Smoke Distortion", "Ignite Block Displacement", "Ignite Vortex Displacement Warp")
add(IG, "Color", "S", "Ignite Crush Blacks & Whites", "Ignite Custom Gray", "Ignite Leave Color", "Ignite Vignette Exposure")
add(IG, "Blur", "S", "Ignite Chroma UV Blur")
add(IG, "Analysis", "G", "Ignite Distance Field")
add(IG, "Stylize", "X", "Ignite Echo", "Ignite Stutter", "Ignite Channel Time Shift", "Ignite Rolling Shutter")

# --- NewBlue FX (OFX) -- vegtips videofx.csv, group "NewBlue OFX" / "NewBlue DXT" --------------------------------------
NB = "NewBlue FX"
add(NB, "Paint", "S", "Impressionist (NewBlue)", "Mural (NewBlue)", "Paper Collage (NewBlue)", "Pencil Rubbing (NewBlue)",
    "Hand Drawn (NewBlue)", "Line Drawing (NewBlue)", "Cartoonr Plus", "Metallic (NewBlue)")
add(NB, "Stylize", "S", "Dream Glow (NewBlue)", "Halovision Plus", "Light Bender (NewBlue)", "Shear Energy (NewBlue)",
    "Spinning Light (NewBlue)", "Starlight (NewBlue)", "Mirage (NewBlue)", "Color Melt (NewBlue)")
add(NB, "Sharpen", "S", "Detail by Chroma (NewBlue)", "Detail by Luma (NewBlue)", "Dual Booster (NewBlue)")
add(NB, "Stylize", "X", "Psycho Strobe (NewBlue)")

# --- Red Giant Universe -- vegtips videofx.csv, group "Universe" ------------------------------------------------------
UV = "Red Giant Universe"
add(UV, "Stylize", "S", "uni.Glo Fi", "uni.Holomatrix II", "uni.Luster", "uni.MisFire", "uni.OverLight", "uni.Spectralicious",
    "uni.Ecto", "uni.Electrify", "uni.ChromaTown", "uni.Glimmer", "uni.AV Club", "uni.Analog (Universe)")
add(UV, "Paint", "S", "uni.Sketchify", "uni.Symbol Mapper", "uni.Threshold Dither", "uni.Halftone Dither", "uni.Texturize")
add(UV, "Color", "S", "uni.Noir", "uni.RetroGrade", "uni.Finisher")
add(UV, "Distort", "S", "uni.Point Zoom", "uni.ShrinkRay")

# --- GenArts Monsters GT -- vegtips videofx.csv, group "Monsters" -------------------------------------------------------
MO = "GenArts Monsters GT"
add(MO, "Stylize", "S", "M_CCTV", "M_Facet", "M_EdgeLeak")
add(MO, "Distort", "S", "M_HeatHaze", "M_Pool3D", "M_Puddle3D")
add(MO, "Materials", "S", "M_ClipTex", "M_PatchTex")
add(MO, "Noise", "S", "M_Cumulo")
add(MO, "Stylize", "X", "M_TrailAverage", "M_PixFlow")

# --- VEGAS Pro native FX -- vegtips videofx.csv, group "VEGAS" -------------------------------------------------------
VG = "VEGAS Pro FX"
add(VG, "Tone", "S", "VEGAS Black Restore", "VEGAS Soft Contrast", "VEGAS Fill Light", "VEGAS Broadcast Colors")
add(VG, "Stylize", "S", "VEGAS Cookie Cutter", "VEGAS Radial Pixelate", "VEGAS TV Simulator", "VEGAS Light Rays")
add(VG, "Blur", "S", "VEGAS Linear Blur", "VEGAS Chroma Blur")
add(VG, "Analysis", "S", "VEGAS Min and Max")
add(VG, "Distort", "S", "VEGAS Offset and Wrap")
add(VG, "Paint", "M", "VEGAS AI Style Transfer")
add(VG, "Repair", "M", "VEGAS AI Smoothen", "VEGAS AI Colorization")
add(VG, "Depth", "M", "VEGAS AI Z-Depth")

# --- RE:Vision Effects -- vegtips videofx.csv, group "REVision Effects" --------------------------------------------------
RV = "RE:Vision Effects"
add(RV, "Blur", "X", "RSMB (ReelSmart Motion Blur)")
add(RV, "Repair", "X", "DEFlicker Rolling Bands", "DE:Noise Frame Average")

# --- Affinity Photo 2 -- affinity.help photo2 Filters pages (distortion, blur, sharpen, noise, colour) fetched --------
AF = "Affinity Photo 2"
add(AF, "Distort", "S", "Equations (Affinity)")
add(AF, "Blur", "S", "Custom Blur (Affinity)")
add(AF, "Color", "S", "Divide by Alpha", "Multiply by Alpha", "Remove White Matte")
add(AF, "Retro", "S", "Web Safe Dither")
add(AF, "Repair", "G", "Remove Vignette (Affinity)")

# --- Pixelmator Pro / Photomator -- support.pixelmator.com llms.txt + effect guide pages ---------------------------------
PX = "Pixelmator / Photomator"
add(PX, "Repair", "M", "ML Enhance (Photomator)", "Smart Deband (Photomator)")

# --- Luminar (Skylum) -- support.skylum.com/editing-tools/*-tools.md card tables (fetched) ------------------------------
LU = "Luminar Neo"
add(LU, "Stylize", "S", "Mystical (Luminar)", "Dramatic (Luminar)", "Neon & Glow (Luminar)", "Sunrays (Luminar)",
    "High Key (Luminar)")
add(LU, "Repair", "M", "Enhance AI (Luminar)", "Structure AI (Luminar)", "Skin AI (Luminar)", "Face AI (Luminar)",
    "Body AI (Luminar)", "Water Enhancer AI (Luminar)", "Twilight Enhancer AI (Luminar)")
add(LU, "Depth", "M", "Atmosphere AI (Luminar)", "Magic Light AI (Luminar)", "Bokeh AI (Luminar)", "Studio Light (Luminar)",
    "Light Depth (Luminar)")
add(LU, "Render", "M", "Sky AI (Luminar)")

# --- ON1 Effects 2026 -- on1.com/products/effects/features/ (fetched: 32 filters + 4 new) --------------------------------
ON = "ON1 Effects"
add(ON, "Tone", "S", "Dynamic Contrast (ON1)", "Tone Enhancer (ON1)", "HDR Look (ON1)")
add(ON, "Color", "S", "Antique (ON1)", "Sunshine (ON1)", "Color Enhancer (ON1)")
add(ON, "Stylize", "S", "Weather (ON1)", "Motion (ON1)")
add(ON, "Depth", "M", "Depth Lighting (ON1)")
add(ON, "Stylize", "X", "Double Exposure (ON1)")

# --- Capture One film grain types -- captureone.com blog "film grains" (search-confirmed) -------------------------------
CO = "Capture One"
add(CO, "Film", "S", "Silver Rich grain (Capture One)", "Soft Grain (Capture One)", "Cubic Grain (Capture One)",
    "Tabular Grain (Capture One)", "Harsh Grain (Capture One)")

# --- Lightroom distraction removal -- helpx.adobe.com lightroom-classic distraction-removal pages (search-confirmed) -----
add("Lightroom AI tools", "Repair", "M", "Remove Reflections (Lightroom)")

# --- Paint.NET plug-in packs (Ed Harvey, MadJik, Red ochre) -- paint.net forum threads / Softpedia (search-confirmed) ---
PN = "Paint.NET plug-in packs"
add(PN, "Blur", "S", "True Blur (Ed Harvey)", "Simplify (Ed Harvey)")
add(PN, "Distort", "S", "Drop Ripple (Ed Harvey)", "InsideOut (Ed Harvey)", "Multiview Warp (Ed Harvey)",
    "Wobble (Ed Harvey)", "Gravity (MadJik)", "Vibrato (MadJik)")
add(PN, "Stylize", "S", "Seismograph (Ed Harvey)", "Psychocolour (Red ochre)", "Object Edge (Red ochre)", "Cobweb (Red ochre)",
    "Change Extreme Colors (MadJik)", "Nebulous (MadJik)", "Hexagonal Grid (MadJik)")
add(PN, "Paint", "G", "ArtyThing (Red ochre)", "Scribble (Red ochre)", "Furblur (Red ochre)")
add(PN, "Render", "G", "Fractal Curly Tree (MadJik)", "Fractal Fern (MadJik)")
add(PN, "Color", "G", "Poster (Red ochre, average colours)")

# --- Shadertoy -- 'Heartfelt' by Martijn Steinrucken (BigWings) 2017 (search-confirmed header) --------------------------
add("Shadertoy classics", "Distort", "S", "Heartfelt (rain on window)")

# --- Image forensics -- 29a.ch/photo-forensics (Forensically tool list, fetched), EldritchJS/pyIFD file list (GitHub),
#     Noiseprint / ManTra-Net / Splicebuster / PRNU (arXiv, search-confirmed) ---------------------------------------------
FO = "Image forensics"
add(FO, "Analysis", "S", "Noise Analysis (Forensically)", "Level Sweep (Forensically)", "Luminance Gradient (Forensically)",
    "Magnifier enhancement (Forensically)", "NOI4 median-filter noise residue")
add(FO, "Analysis", "G", "Error Level Analysis (ELA)", "Clone Detection (Forensically)", "Principal Component Analysis (Forensically)",
    "JPEG Ghost (Farid)", "ADQ1 aligned double quantization", "NADQ non-aligned double JPEG", "BLK block artifact grid",
    "CAGI grid inconsistency", "CFA1 (Ferrara demosaicing artifacts)", "CFA2 (Dirik-Memon CFA)", "DCT (Ye block DCT histogram)",
    "NOI1 (Mahdian wavelet noise)", "NOI2 (Lyu local noise level)", "NOI5 (PCA noise)", "Splicebuster")
add(FO, "Analysis", "M", "Noiseprint", "ManTra-Net")
add(FO, "Analysis", "X", "PRNU fingerprint")

# --- Pan-sharpening -- codegaj/py_pansharpening file list (GitHub), ArcGIS Pansharpening function, arXiv 1606.05703 ------
PS = "Pan-sharpening methods"
add(PS, "Sensor", "X", "Brovey transform", "Gram-Schmidt pan-sharpening", "IHS fusion", "GSA pan-sharpening", "SFIM",
    "MTF-GLP", "MTF-GLP-HPM", "GFPCA", "Esri pan-sharpening", "Simple Mean pan-sharpening", "PCA pan-sharpening",
    "CNMF (coupled NMF fusion)")
add(PS, "Sensor", "M", "PNN pan-sharpening", "PanNet")

# --- Document image enhancement -- ZZZHANG-jx/Recommendations-Document-Image-Processing README (fetched) ----------------
DO = "Document enhancement 3"
add(DO, "Repair", "M", "DocTr", "DewarpNet", "DocProj", "FDRNet (Fourier document restoration)", "UDoc-GAN", "GCDRNet",
    "BEDSR-Net", "ShaDocNet", "ShaDocFormer", "LP-IOANet", "DocUNet", "DeepOtsu", "SVDocNet", "Marior")
add(DO, "Repair", "G", "Selective-median black-top-hat shadow removal")

# --- Inpainting models -- Sanster/IOPaint model file list (GitHub) -----------------------------------------------------
IP = "Inpainting models (IOPaint)"
add(IP, "Repair", "M", "MAT inpainting", "ZITS inpainting", "FcF inpainting", "MI-GAN", "Manga inpainting", "Paint by Example")

# --- Histology / medical -- TIA Toolbox stain-normalization notebook (fetched) ---------------------------------------
add("Histology stain tools", "Color", "G", "Reinhard stain normalization")
add("Histology stain tools", "Augment", "S", "Stain augmentation (TIAToolbox)")

# --- Texture / material tools -- BoundingBoxSoftware/Materialize and kmkolasinski/AwesomeBump file lists (GitHub) --------
MA = "Materialize / AwesomeBump"
add(MA, "Materials", "S", "Edge from Normal (Materialize)", "AO from Normal (Materialize)", "Smoothness map (Materialize)",
    "Seamless Texture Maker (Materialize)", "Remove Shading (AwesomeBump)", "Normal Mixer (AwesomeBump)")

# --- Textbook operators still missing -----------------------------------------------------------------------------------
add("Textbook classics 3", "Edges", "G", "Hueckel operator")
add("Textbook classics 3", "Edges", "S", "Argyle operator", "Macleod operator")
add("Textbook classics 3", "Analysis", "S", "Stentiford thinning")

DROP = {
    'BCC Posterize Time',
    'BCC Match Grain',
    'Ignite Radio Waves',
    'Ignite Rolling Shutter',
    'VEGAS Broadcast Colors',
    'VEGAS Light Rays',
    'BCC Broadcast Safe',
    'BCC Noise Map 2',
    'uni.Electrify',
    'M_HeatHaze',
    'Ignite Heat Distortion',
    'BCC Charcoal Sketch',
    'BCC Water Color',
    'BCC Cartooner',
    'Cartoonr Plus',
    'BCC Invert Solarize',
    'Line Drawing (NewBlue)',
    'Impressionist (NewBlue)',
    'VEGAS AI Colorization',
    'Color Enhancer (ON1)',
    'S_Sparkles',
    'S_Hotspots',
    'BCC+ Ambient Light',
    'Smoothness map (Materialize)',
    'Seamless Texture Maker (Materialize)',
    'uni.Threshold Dither',
    'uni.Halftone Dither',
    'Ignite Channel Time Shift',
    'S_TimeWarpRGB',
    'Dynamic Raindrops (NiceGuy)',
    'Ignite Rain On Glass',
    'Water Droplets (DFT)',
    'DE:Noise Frame Average',
    'M_TrailAverage',
    'Time Blur (DFT)',
    'Trails (AstrayFX)',
    'S_PixelMosh',
    'S_RackDefocus',
    'NOI4 median-filter noise residue',
    'Arcane Bloom (luluco250)',
    'Neo Bloom (luluco250)',
    'Xenon Bloom (Zenteon)',
    'dual_filter_bloom',
    'Blooming HDR (AstrayFX)',
    'spline256',
    'lanczos16-AR',
    'Remove Vignette (Affinity)',
    'S_InfiniteZoom',
    'S_BrushChalk',
    'BCC+ Split Field',
    'BCC+ Double Fog',
    'BCC+ Smoke and Fog',
    'S_Luna',
    'BCC Damaged TV',
    'BCC+ ND Gradient',
    'BCC+ Skin Tone',
    'Temporal AA (AstrayFX)',
    'M_Facet',
    'S_ZFogExponential',
    'S_ZFogLinear',
    'Canvas Fog (CorgiFX)',
    'Ignite Echo',
    'AO from Normal (Materialize)',
    'Edge from Normal (Materialize)',
    'BCC+ Super LED',
    'BCC Tile Mosaic',
    'BCC+ Polarizer',
    'BCC+ DeFog',
    'BCC+ Mist',
    'BCC+ Sunset',
    'Studio Light (Luminar)',
    'Light Depth (Luminar)',
    'Depth Lighting (ON1)',
    'ega (misc)',
    'apple-monitor-II',
    'pixel_aa',
    'Gloom AO (AstrayFX)',
    'Radiant GI (AstrayFX)',
    'Turbo GI (Zenteon)',
    'NG Lighting (NiceGuy)',
    'Polynomial Barrel Distortion for HMDs',
    'Undither (DH)',
    'jinc2-dedither',
    'gdapt',
    'cbod_v1',
    'Curved Levels (prod80)',
    'Color Space Curves (prod80)',
    'Hexagonal Grid (MadJik)',
    'S_FlysEyeCircles',
    'Ignite Insect Vision',
    'S_KaleidoRadial',
    'S_WarpPuff',
    'S_HyperPull',
    'S_TileScramble',
    'S_RomanTile',
    'S_Etching',
    'S_EmbossShiny',
    'S_EdgeAwareBlur',
    'S_Zebrafy',
    'S_ShowBadColors',
    'S_NearestColor',
    'S_TextureWeave',
    'S_TextureCells',
    'S_TextureRidges',
    'S_TimeSlice',
    'Psycho Strobe (NewBlue)',
    'uni.Noir',
    'uni.Texturize',
    'uni.Symbol Mapper',
    'uni.Sketchify',
    'uni.Point Zoom',
    'Dream Glow (NewBlue)',
    'S_GlowAura',
    'S_GlowDist',
    'S_UltraGlow',
}  # concept duplicates of filters.db / earlier rounds or of each other, found by manual near-match review
CATEGORY = {}
SOURCE = {}
FEAS = {}
