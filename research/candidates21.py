"""Round 21 raw candidates (input to dedupe21.py --build).

Verification-first round: every block below was read first-hand from the URL in its header comment
(docs page, API reference, README, catalogue or source file fetched during the harvest).
(name, source, category, feasibility)  S = GPU shader passes, G = whole-image/sequential, M = neural net,
X = several images / video frames.
"""
C = []
DROP = set()

# --- ReShade repos not read before (official EffectPackages.ini list) -----------------------------------------------------
# Package list https://raw.githubusercontent.com/crosire/reshade-shaders/list/EffectPackages.ini ; shader sources
# https://raw.githubusercontent.com/Radegast-FFXIV/Warp-FX/master/Shaders/{Drunk,SplicedRadials,RadialSlitScan}.fx ,
# https://raw.githubusercontent.com/martymcmodding/METEOR/main/Shaders/MartysMods_{TODDYHANCER,SCENEWEAVER}.fx ,
# https://raw.githubusercontent.com/GimleLarpes/potatoFX/master/Shaders/{pPalettePosterize,pCamera}.fx ,
# https://raw.githubusercontent.com/AnastasiaGals/Ann-ReShade/master/Shaders/PixelShifter.fx ,
# https://raw.githubusercontent.com/AlexTuduran/FGFX/main/Shaders/FGFXEnergyConservativeFilmGrain.fx ,
# https://raw.githubusercontent.com/liuxd17thu/BX-Shade/main/Shaders/{BX_XChannelCurve,BX_ToyCurveTool}.fx
S_ = 'ReShade repos 5 (Warp-FX, METEOR, potatoFX, FGFX, BX-Shade, Ann)'
C += [
    ('Spliced radials: concentric ring bands each rotated by a stepped angle (Warp-FX Spliced Radials)', S_, 'Distort', 'S'),
    ('Drunk: grid of oscillating control points with sine-faded interpolated displacement (Warp-FX / StreamFX Drunk)', S_, 'Distort', 'S'),
    ('Radial slit scan: rings sampled from progressively older frames (Warp-FX Radial Slit Scan)', S_, 'Frames', 'X'),
    ('Palette posterize to a colour-harmony palette from one base colour (potatoFX pPalettePosterize)', S_, 'Color', 'S'),
    ('Energy-conservative zero-mean RGB film grain modulated by luminance (FGFX)', S_, 'Film', 'S'),
    ('Cross-channel curve: one channel remapped by a spline of another (BX-Shade XChannelCurve)', S_, 'Color', 'S'),
    ('Composition canvas: aspect letterbox, zoom-out canvas and composition grids (METEOR SceneWeaver)', S_, 'Analysis', 'S'),
    ('Pixel shifter: alternating horizontal/vertical sections displaced by n pixels (Ann-ReShade PixelShifter)', S_, 'Distort', 'S'),
]

# --- Veejay video effects (libvje) -------------------------------------------------------------------------------------------
# Effect list https://github.com/c0ntrol/veejay/tree/master/veejay-current/veejay-server/libvje/effects ; each source read at
# https://raw.githubusercontent.com/c0ntrol/veejay/master/veejay-current/veejay-server/libvje/effects/<name>.c
# (description string, parameter list and apply function)
S_ = 'Veejay effects'
C += [
    ('Fibonacci downscaler: repeated in-place linear-memory 2:1 decimation that tiles shrinking copies (Veejay fibdownscale)', S_, 'Distort', 'S'),
    ('Rainbow shift: sine of the linear pixel index added to Y and Cb, subtracted from Cr, with 8-bit wraparound (Veejay)', S_, 'Color', 'S'),
    ('Cosmic hue: chroma offset by amplitude x sin/cos(frequency x luma) plus hue shift (Veejay)', S_, 'Color', 'S'),
    ('Width mirror: vertical bands with every other band mirrored, drifting phase and edge glow (Veejay)', S_, 'Distort', 'S'),
    ('Kinetic display machine: flip-disc / punch-card / dot-matrix / relay-lamp cells with airport-style flip cascade (Veejay)', S_, 'Retro', 'S'),
    ('Mechanical pixels: kinetic wall of cells raised by brightness and shaded in 3-D (Veejay)', S_, 'Stylize', 'S'),
    ('X-ray solarization: CDF-equalised luma with local contrast and gradient isolation folded through a solarize curve (Veejay)', S_, 'Tone', 'G'),
    ('Complex invert: invert only pixels inside a hue-angle colour key with solidity and spill kill (Veejay)', S_, 'Color', 'S'),
    ('Bathroom window: rows shifted by a sawtooth offset of period n (Veejay)', S_, 'Distort', 'S'),
    ('Shock silk: anisotropic diffusion combined with a shock filter (Veejay)', S_, 'Blur', 'S'),
    ('Pixel raster: keep every 2n-th row, fill the rest black or white (Veejay crosspixel)', S_, 'Retro', 'S'),
    ('Fragment TV: random tiles copied from offset source positions with blend modes (Veejay)', S_, 'Stylize', 'S'),
]

# --- Cinelerra-GG native video effects ------------------------------------------------------------------------------------
# Index https://download.cinelerra-gg.org/files/CinelerraGG_Manual/Video_Effects_Native.html ; pages
# https://download.cinelerra-gg.org/files/CinelerraGG_Manual/{Rumbler,CriKey,Timefront,YUVShift,Blue_Banana}.html
S_ = 'Cinelerra-GG effects'
C += [
    ('Rumbler: corners jiggled by interpolated random perspective offsets at a set rate (Cinelerra-GG)', S_, 'Distort', 'S'),
    ('CriKey: regional chroma key flood-filled from several seed points of different colours (Cinelerra-GG)', S_, 'Analysis', 'G'),
    ('Timefront: linear, radial or alpha-defined bands each shown at a different time offset (Cinelerra-GG)', S_, 'Frames', 'X'),
    ('YUVShift: independent dx/dy offsets of the Y, U and V planes (Cinelerra-GG)', S_, 'Repair', 'S'),
    ('Blue Banana HSV qualifier with in-plugin selection mask (Cinelerra-GG)', S_, 'Color', 'S'),
]

# --- Vuo image nodes ------------------------------------------------------------------------------------------------------
# Node set https://doc.vuo.org/latest/node/vuo.image/index.html ; pages
# https://doc.vuo.org/latest/node/vuo.image/vuo.image.<node>.html (mask.liquid, streak.radial, scramble, analogDistortion)
S_ = 'Vuo image nodes'
C += [
    ('Liquid mask: seam-carve the image down then seam-carve it back up to drop uninteresting content (Vuo Apply Liquid Mask)', S_, 'Stylize', 'G'),
    ('Streak radially: keep a circle, streak its edge pixels outward with twirl and fade (Vuo Streak Image Radially)', S_, 'Distort', 'S'),
    ('Scramble: grid squares rearranged, growing from a centre point (Vuo Scramble Image)', S_, 'Distort', 'S'),
]

# --- Tux Paint magic tools ----------------------------------------------------------------------------------------------------
# List https://tuxpaint.org/docs/en/magic-docs/html/index.html ; tool pages https://tuxpaint.org/docs/en/magic-docs/html/<tool>.html
S_ = 'Tux Paint magic tools'
C += [
    ('Circles: picture re-rendered as circular strokes around a clicked point (Tux Paint)', S_, 'Paint', 'S'),
    ('Rays: picture re-rendered as strokes pointing toward a clicked point (Tux Paint)', S_, 'Paint', 'S'),
    ('Panels: image shrunk and repeated in a 2x2 grid (Tux Paint)', S_, 'Distort', 'S'),
    ('Xor Colors: colours XORed with pixel position (Tux Paint)', S_, 'Stylize', 'S'),
]

# --- Gem pix_ objects (Pure Data) / Pete's Plugins (FreeFrame) --------------------------------------------------------------------
# Object list https://github.com/umlaeute/Gem/tree/master/src/Pixes ; headers/sources
# https://raw.githubusercontent.com/umlaeute/Gem/master/src/Pixes/{pix_colorclassify,pix_backlight,pix_lumaoffset,pix_refraction}.{h,cpp} ;
# Pete's Plugins list https://support.troikatronix.com/support/solutions/articles/13000030589-where-are-the-old-freeframe-v1-0-plugins-
S_ = "Gem / Pete's Plugins"
C += [
    ('Colour classify: HSV interval logic labels pixels red/green/blue/yellow/white/black or not-sure (Gem pix_colorclassify)', S_, 'Analysis', 'S'),
    ("Backlight: each pixel casts a spike away from the frame centre, length from clamped luminance (Pete's Plugins / Gem pix_backlight)", S_, 'Stylize', 'G'),
    ("Luma offset: every n-th line displaced vertically by luminance, optional filled lines (Pete's Plugins / Gem pix_lumaoffset)", S_, 'Stylize', 'G'),
    ("Refraction: view through glass blocks (Pete's Plugins / Gem pix_refraction)", S_, 'Distort', 'S'),
]

# --- ofxPostGlitch / ofxPostProcessing (openFrameworks addons) -------------------------------------------------------------------
# Shaders https://github.com/maxillacult/ofxPostGlitch/tree/master/example/bin/data/Shaders (convergence, cut_slider, swell, twist,
# crHighContrast, crBlueraise, outline read) ; passes https://github.com/neilmendoza/ofxPostProcessing/tree/master/src
S_ = 'openFrameworks post-process addons'
C += [
    ('Cut slider: rows shifted by a stepped sine of y (ofxPostGlitch)', S_, 'Retro', 'S'),
    ('Logistic per-channel contrast with a raised blue floor and lowered ceiling (ofxPostGlitch crBlueraise)', S_, 'Color', 'S'),
]

# --- Netpbm programs ----------------------------------------------------------------------------------------------------------
# Directory https://netpbm.sourceforge.net/doc/directory.html ; program pages https://netpbm.sourceforge.net/doc/<prog>.html
# (pamaltsat, ppmdist, pamrecolor, pnmnlfilt, pgmenhance, pgmbentley, pamwipeout, pgmabel, ppmglobe, pgmdeshadow, pambackground,
#  pbmlife, pnmalias, pampaintspill, pampop9, pamshuffle, ppmtv, pamsharpmap read)
S_ = 'Netpbm programs'
C += [
    ('Logarithmic alternative saturation from colour-integrity intensity ratios (Netpbm pamaltsat)', S_, 'Color', 'S'),
    ('Stepped greyscale for few-colour images ordered by intensity or frequency, maximising grey spacing (Netpbm ppmdist)', S_, 'Color', 'G'),
    ('Luminance-locked recolour toward a target colour, random colours or a target image (Netpbm pamrecolor)', S_, 'Color', 'S'),
    ('Seven-hexagon neighbourhood filter: alpha-trimmed mean, optimal estimation or edge enhancement (Netpbm pnmnlfilt)', S_, 'Blur', 'S'),
    ('Jarvis edge enhancement from Knuth dot-diffusion paper (Netpbm pgmenhance)', S_, 'Sharpen', 'S'),
    ('Bentley effect: vertical smearing of pixels by brightness (Holzmann, Netpbm pgmbentley)', S_, 'Stylize', 'G'),
    ('Wipeout: each row or column replaced by a linear gradient between its two edge pixels (Netpbm pamwipeout)', S_, 'Repair', 'S'),
    ('Abel inversion: cross-section of an axially symmetric transparent object (Netpbm pgmabel)', S_, 'Analysis', 'G'),
    ('Globe gores: cylindrical projection cut into strips to glue onto a sphere (Netpbm ppmglobe)', S_, 'Distort', 'S'),
    ('Deshadow: divide by a grayscale-reconstruction estimate of the smooth shadow (Vincent, Netpbm pgmdeshadow)', S_, 'Repair', 'G'),
    ('Background mask: edge-connected flood of the corner-majority colour (Netpbm pambackground)', S_, 'Analysis', 'G'),
    ("One generation of Conway's Life on a binary image (Netpbm pbmlife)", S_, 'Stylize', 'S'),
    ('Anti-alias only between a chosen foreground and background colour (Netpbm pnmalias)', S_, 'Repair', 'S'),
    ('Paint spill: smooth gradient spilled from sparse coloured pixels (Netpbm pampaintspill)', S_, 'Color', 'G'),
    ('Pop9 multi-lens camera: tile grid with per-tile source offset (Netpbm pampop9)', S_, 'Stylize', 'S'),
    ('Shuffle pixels within rows (Netpbm pamshuffle)', S_, 'Distort', 'G'),
    ('Per-channel sharpness map: mean absolute difference to the 8 neighbours (Netpbm pamsharpmap)', S_, 'Analysis', 'S'),
]

DROP |= {   # keyword concept review against filters.db names, aliases, rounds 9-20 and index.html options
    'Radial slit scan: rings sampled from progressively older frames (Warp-FX Radial Slit Scan)',   # = Slit-Scan (db), radial variant
    'Palette posterize to a colour-harmony palette from one base colour (potatoFX pPalettePosterize)',  # = Harmony recolour options (index.html)
    'Energy-conservative zero-mean RGB film grain modulated by luminance (FGFX)',                # = Film grain (db)
    'Cross-channel curve: one channel remapped by a spline of another (BX-Shade XChannelCurve)',  # = Cross-channel color adjustment (Krita)
    'Composition canvas: aspect letterbox, zoom-out canvas and composition grids (METEOR SceneWeaver)',  # = Rule-of-thirds / golden ratio overlay
    'Pixel shifter: alternating horizontal/vertical sections displaced by n pixels (Ann-ReShade PixelShifter)',  # = Grouped Pixel Shift options
    'Bathroom window: rows shifted by a sawtooth offset of period n (Veejay)',                    # = Fluted (Reeded) Glass
    'Shock silk: anisotropic diffusion combined with a shock filter (Veejay)',                    # = Shock Filter / Alvarez-Mazorra (db)
    'Pixel raster: keep every 2n-th row, fill the rest black or white (Veejay crosspixel)',       # = scanlines
    'Fragment TV: random tiles copied from offset source positions with blend modes (Veejay)',   # = Shuffle Patches / Fragment (db)
    'Timefront: linear, radial or alpha-defined bands each shown at a different time offset (Cinelerra-GG)',  # = Time displacement (db)
    'YUVShift: independent dx/dy offsets of the Y, U and V planes (Cinelerra-GG)',                # = Chroma plane shift (chromashift)
    'Blue Banana HSV qualifier with in-plugin selection mask (Cinelerra-GG)',                    # = HSL qualifier / secondary correction
    'Scramble: grid squares rearranged, growing from a centre point (Vuo Scramble Image)',        # = RandomGridShuffle / Shuffle Patches
    'Circles: picture re-rendered as circular strokes around a clicked point (Tux Paint)',        # = Spin blur smear
    'Rays: picture re-rendered as strokes pointing toward a clicked point (Tux Paint)',           # = Radial/zoom blur smear
    'Panels: image shrunk and repeated in a 2x2 grid (Tux Paint)',                                # = Tile (db)
    'Xor Colors: colours XORed with pixel position (Tux Paint)',                                  # = XOR pattern option (index.html)
    "Luma offset: every n-th line displaced vertically by luminance, optional filled lines (Pete's Plugins / Gem pix_lumaoffset)",  # = RevTV / Rutt-Etra (db)
    "Refraction: view through glass blocks (Pete's Plugins / Gem pix_refraction)",               # = Glass Tile (db)
    'Cut slider: rows shifted by a stepped sine of y (ofxPostGlitch)',                            # = slice / wave displacement glitches
    'Logistic per-channel contrast with a raised blue floor and lowered ceiling (ofxPostGlitch crBlueraise)',  # = Sigmoidal contrast + levels
    'Paint spill: smooth gradient spilled from sparse coloured pixels (Netpbm pampaintspill)',    # = Sparse color: Shepards (ImageMagick)
    'Pop9 multi-lens camera: tile grid with per-tile source offset (Netpbm pampop9)',             # = Multi-Lens (Analog Efex)
    'Shuffle pixels within rows (Netpbm pamshuffle)',                                             # = Shuffle Pixels (augmentation)
    'Per-channel sharpness map: mean absolute difference to the 8 neighbours (Netpbm pamsharpmap)',  # = local gradient / Standard deviation map
}

# --- vkdt processing modules ------------------------------------------------------------------------------------------------
# Module list https://github.com/hanatos/vkdt/tree/master/src/pipe/modules ; readmes
# https://raw.githubusercontent.com/hanatos/vkdt/master/src/pipe/modules/<module>/readme.md (filmcurv, okgmtclp, eq, zones, ca, filmsim read)
S_ = 'vkdt modules'
C += [
    ('Weibull film curve: scene-linear to display via a Weibull-distribution tone curve (vkdt filmcurv)', S_, 'Tone', 'S'),
    ('Oklab gamut clipping toward a chosen focal point (Ottosson, vkdt okgmtclp)', S_, 'Color', 'S'),
    ('Decimated-wavelet local contrast equaliser with variance shielding (vkdt eq)', S_, 'Sharpen', 'G'),
]

# --- LiVES Weed plugins ----------------------------------------------------------------------------------------------------
# List https://github.com/salsaman/LiVES/tree/master/lives-plugins/weed-plugins ; sources
# https://raw.githubusercontent.com/salsaman/LiVES/master/lives-plugins/weed-plugins/{haip,tvpic,softlight,textfun,bump2d}.c
S_ = 'LiVES Weed plugins'
C += [
    ('Haip worms: agents crawl toward brighter or darker neighbours stamping 3x3 trails over the frame (LiVES haip)', S_, 'Stylize', 'G'),
    ('TV picture: each pixel expanded to an RGB triad cell with black gaps (LiVES tvpic)', S_, 'Retro', 'S'),
]

# --- Harbeth Metal filters / android-gpuimage-plus ---------------------------------------------------------------------------
# Category trees https://github.com/yangKJ/Harbeth/tree/master/Sources/Compute/<category> ; sources
# https://raw.githubusercontent.com/yangKJ/Harbeth/master/Sources/Compute/<category>/<C7Name>.swift (and C7SoulOut.metal) ;
# https://github.com/wysaid/android-gpuimage-plus/tree/master/library/src/main/jni/cge/filters (cgeLerpblurFilter.h read)
S_ = 'Mobile GPU filter libraries (Harbeth, android-gpuimage-plus)'
C += [
    ('Soul out: centred zoomed copy blended over the frame, opacity falling as it grows (Harbeth C7SoulOut)', S_, 'Stylize', 'S'),
    ('Sharpness falloff correction: capture sharpening ramped in between two radii toward the corners (Harbeth)', S_, 'Sharpen', 'S'),
    ('Multi-zone lookup: separate LUTs for shadows, midtones and highlights blended across thresholds (Harbeth C7MultiZoneLookup)', S_, 'Color', 'S'),
    ('Storyboard: frame divided into ranks-squared copies (Harbeth C7Storyboard)', S_, 'Distort', 'S'),
    ('Colour packing: green and blue contour shadows offset right and down (Harbeth C7ColorPacking)', S_, 'Retro', 'S'),
    ('Sticker outline: coloured outline of the alpha shape with thickness and blur (Harbeth)', S_, 'Stylize', 'S'),
    ('Diffraction correction: threshold-protected capture sharpening (Harbeth)', S_, 'Sharpen', 'S'),
    ('Scene relight: 2.5-D point, spot, directional and rim lights from depth normals (Harbeth C7SceneRelight)', S_, 'Depth', 'S'),
    ('Lerp blur: progressive downscale by a factor then lerped upscale (android-gpuimage-plus cgeLerpblurFilter)', S_, 'Blur', 'S'),
]

# --- Douyin (TikTok) dynamic filters, GLSL walk-through ----------------------------------------------------------------------
# Article https://juejin.cn/post/6967996341737766942 (OpenGL ES case 13: six dynamic filters, shader code walked through)
S_ = 'Douyin dynamic filters (GLSL)'
C += [
    ('Douyin shake: periodic zoom pulse with a growing diagonal red/blue channel split', S_, 'Stylize', 'S'),
    ('Douyin burr glitch: fixed random rows torn sideways in pulses plus red/blue x offsets', S_, 'Retro', 'S'),
    ('Hallucination: zoomed frame with orbiting ghost samples whose red weight decays slowest, red trails', S_, 'Stylize', 'S'),
    ('Soul out: zoomed copy fading as it grows each 0.7 s cycle (Douyin)', S_, 'Stylize', 'S'),
]

# --- lostjared/shaders (Acid Cam GLSL library), game screen effects ----------------------------------------------------------------
# Index https://raw.githubusercontent.com/lostjared/shaders/main/index.txt ; shader sources with header comment
# https://raw.githubusercontent.com/lostjared/shaders/main/G/<name>.glsl (game_codex_* and game_* series read)
S_ = 'Acid Cam shader library (game screen effects)'
C += [
    ('Stealth cloak: glassy sine displacement with desaturated cyan shimmer veil (lostjared game_codex_stealth_cloak)', S_, 'Distort', 'S'),
    ('Shield hit: hex energy shimmer with a pulsing blue edge flash (lostjared game_codex_shield_hit)', S_, 'Render', 'S'),
    ('Portal rift: twisting centre tear with cyan-magenta energy (lostjared game_codex_portal_rift)', S_, 'Distort', 'S'),
    ('Critical hit: white flash, red shards and impact ripple (lostjared game_codex_critical_hit)', S_, 'Stylize', 'S'),
    ('Magic barrier: circular runes with teal refraction (lostjared game_codex_magic_barrier)', S_, 'Render', 'S'),
    ('Target lock: animated reticle and range rings with contrast lift (lostjared game_codex_target_lock)', S_, 'Render', 'S'),
    ('Rage mode: zoom punch-in, red overlay, RGB split and vignette (lostjared game_rage_mode)', S_, 'Stylize', 'S'),
    ('Low ammo warning: amber HUD stripes with rhythmic edge pulse (lostjared game_codex_low_ammo_warning)', S_, 'Render', 'S'),
    ('Disco floor: animated coloured tile overlay multiplied with the source (lostjared game_disco_floor)', S_, 'Stylize', 'S'),
    ('Freeze crystal: blue tint, reduced saturation and faceted ice tessellation distortion (lostjared game_freeze_crystal)', S_, 'Distort', 'S'),
    ('Radar ping: green sweep line and expanding detection rings (lostjared game_codex_radar_ping)', S_, 'Render', 'S'),
    ('EMP blast: expanding shockwave ring with colour invert inside (lostjared game_emp_blast)', S_, 'Distort', 'S'),
    ('Super-saiyan aura: golden bloom of bright pixels with flicker (lostjared game_super_saiyan)', S_, 'Stylize', 'S'),
    ('Boss warning: pulsing red vignette with edge bands (lostjared game_boss_warning)', S_, 'Render', 'S'),
    ('Bullet time: desaturated cool grade with soft radial blur (lostjared game_bullet_time)', S_, 'Blur', 'S'),
]

DROP |= {   # second batch review
    'Decimated-wavelet local contrast equaliser with variance shielding (vkdt eq)',            # = wavelet local contrast (db)
    'TV picture: each pixel expanded to an RGB triad cell with black gaps (LiVES tvpic)',       # = CRT shadow/aperture mask (db)
    'Storyboard: frame divided into ranks-squared copies (Harbeth C7Storyboard)',               # = Tile (db)
    'Colour packing: green and blue contour shadows offset right and down (Harbeth C7ColorPacking)',  # = RGB shift (db)
    'Sticker outline: coloured outline of the alpha shape with thickness and blur (Harbeth)',   # = Outline Object (BoltBait)
    'Diffraction correction: threshold-protected capture sharpening (Harbeth)',                 # = Diffraction Correction (Capture One)
    'Scene relight: 2.5-D point, spot, directional and rim lights from depth normals (Harbeth C7SceneRelight)',  # = Depth Relight (db)
    'Lerp blur: progressive downscale by a factor then lerped upscale (android-gpuimage-plus cgeLerpblurFilter)',  # = pyramid / dual blur
    'Soul out: zoomed copy fading as it grows each 0.7 s cycle (Douyin)',                      # = Soul out (Harbeth, this round)
    'Radar ping: green sweep line and expanding detection rings (lostjared game_codex_radar_ping)',  # = Radar Display (UnPlugged-X)
    'EMP blast: expanding shockwave ring with colour invert inside (lostjared game_emp_blast)',  # = Shock Waves (G'MIC) + invert
    'Super-saiyan aura: golden bloom of bright pixels with flicker (lostjared game_super_saiyan)',  # = tinted bloom
    'Boss warning: pulsing red vignette with edge bands (lostjared game_boss_warning)',          # = Damage Hurt screen-edge pulse
    'Bullet time: desaturated cool grade with soft radial blur (lostjared game_bullet_time)',    # = radial blur + grade combination
}

# --- StreamFX example shaders (OBS) -----------------------------------------------------------------------------------------
# Lists https://github.com/Xaymar/obs-StreamFX/tree/root/data/examples/shaders/{filter,transition} ; sources
# https://raw.githubusercontent.com/Xaymar/obs-StreamFX/root/data/examples/shaders/{filter/semiline,filter/hexagonize,transition/luma-burn}.effect
S_ = 'StreamFX example shaders'
C += [
    ('Semiline: below an edge line, stepped rows cut by transparent bars that widen row by row (StreamFX)', S_, 'Stylize', 'S'),
    ('Hexagonize: hexagon cells whose wall thickness scales with luminance (StreamFX)', S_, 'Stylize', 'S'),
    ('Luma burn transition: luminance-ordered burn with an eased colour edge (StreamFX)', S_, 'Frames', 'X'),
]

# --- ScummVM scalers / Mednafen shaders ---------------------------------------------------------------------------------------
# Scaler sources https://github.com/scummvm/scummvm/tree/master/graphics/scaler ({edge,pm,tv,dotmatrix,aspect}.cpp read) ;
# Mednafen settings documentation https://mednafen.github.io/documentation/ (<system>.shader, goat.* , special, video.deinterlacer)
S_ = 'Emulator scalers 2 (ScummVM, Mednafen)'
C += [
    ('Edge2x / Edge3x: edge-direction-refined anti-aliasing pixel-art scaler (Eric Welsh, ScummVM)', S_, 'Retro', 'S'),
    ('2xPM pixel-art scaler (Pablo Medina, ScummVM)', S_, 'Retro', 'S'),
    ('320x200 to 240-line aspect-ratio correction with fixed-phase line interpolation (ScummVM aspect)', S_, 'Retro', 'S'),
    ('Goat CRT: Goatron / Borg / Slenderman mask patterns with constant RGB divergence and scanlines (Mednafen)', S_, 'Retro', 'S'),
    ('TV2x: doubled pixels with dimmed interpolated odd lines (ScummVM tv)', S_, 'Retro', 'S'),
    ('Gamma-respecting field blend deinterlacer (Mednafen blend_rg)', S_, 'Repair', 'S'),
]

DROP |= {   # third batch review
    'Hexagonize: hexagon cells whose wall thickness scales with luminance (StreamFX)',          # = Hexagonal pixelate / grid (db)
    'Luma burn transition: luminance-ordered burn with an eased colour edge (StreamFX)',        # = Luminance melt transition (gl-transitions)
    'TV2x: doubled pixels with dimmed interpolated odd lines (ScummVM tv)',                    # = scanline doublers (db)
    'Gamma-respecting field blend deinterlacer (Mednafen blend_rg)',                           # = blend deinterlace (db)
}
DROP |= {   # final review of the near-match list: preset combinations and HUD overlays rather than filters
    'Rage mode: zoom punch-in, red overlay, RGB split and vignette (lostjared game_rage_mode)',             # = RGB Split + Vignette preset
    'Low ammo warning: amber HUD stripes with rhythmic edge pulse (lostjared game_codex_low_ammo_warning)',  # HUD overlay, = Stripes + edge pulse
    'Target lock: animated reticle and range rings with contrast lift (lostjared game_codex_target_lock)',  # HUD overlay, not a filter
    'Disco floor: animated coloured tile overlay multiplied with the source (lostjared game_disco_floor)',  # = generated tiles + Multiply blend
    'Critical hit: white flash, red shards and impact ripple (lostjared game_codex_critical_hit)',         # = flash + ripple combination
    'Magic barrier: circular runes with teal refraction (lostjared game_codex_magic_barrier)',             # = refraction + rune overlay
}
