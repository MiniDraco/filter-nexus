# Round 21 harvest: 47 techniques not yet in Filter Nexus

Checked by `research/dedupe21.py` against every filter, engine id and alias name in `filters.db`, all round-9 to round-20 names and the index.html option labels. 37 are buildable as GPU shaders; 10 need whole-image/sequential work, 0 need a neural net, 0 need several images or frames.

Legend: no mark = GPU shader · ⓖ whole-image/sequential · ⓜ neural net · ⓧ multi-image/video


## ReShade repos 5 (Warp-FX, METEOR, potatoFX, FGFX, BX-Shade, Ann) (2)

1. Spliced radials: concentric ring bands each rotated by a stepped angle (Warp-FX Spliced Radials)  — Distort
2. Drunk: grid of oscillating control points with sine-faded interpolated displacement (Warp-FX / StreamFX Drunk)  — Distort

## Veejay effects (8)

3. Fibonacci downscaler: repeated in-place linear-memory 2:1 decimation that tiles shrinking copies (Veejay fibdownscale)  — Distort
4. Rainbow shift: sine of the linear pixel index added to Y and Cb, subtracted from Cr, with 8-bit wraparound (Veejay)  — Color
5. Cosmic hue: chroma offset by amplitude x sin/cos(frequency x luma) plus hue shift (Veejay)  — Color
6. Width mirror: vertical bands with every other band mirrored, drifting phase and edge glow (Veejay)  — Distort
7. Kinetic display machine: flip-disc / punch-card / dot-matrix / relay-lamp cells with airport-style flip cascade (Veejay)  — Retro
8. Mechanical pixels: kinetic wall of cells raised by brightness and shaded in 3-D (Veejay)  — Stylize
9. X-ray solarization: CDF-equalised luma with local contrast and gradient isolation folded through a solarize curve (Veejay) ⓖ  — Tone
10. Complex invert: invert only pixels inside a hue-angle colour key with solidity and spill kill (Veejay)  — Color

## Cinelerra-GG effects (2)

11. Rumbler: corners jiggled by interpolated random perspective offsets at a set rate (Cinelerra-GG)  — Distort
12. CriKey: regional chroma key flood-filled from several seed points of different colours (Cinelerra-GG) ⓖ  — Analysis

## Vuo image nodes (2)

13. Liquid mask: seam-carve the image down then seam-carve it back up to drop uninteresting content (Vuo Apply Liquid Mask) ⓖ  — Stylize
14. Streak radially: keep a circle, streak its edge pixels outward with twirl and fade (Vuo Streak Image Radially)  — Distort

## Gem / Pete's Plugins (2)

15. Colour classify: HSV interval logic labels pixels red/green/blue/yellow/white/black or not-sure (Gem pix_colorclassify)  — Analysis
16. Backlight: each pixel casts a spike away from the frame centre, length from clamped luminance (Pete's Plugins / Gem pix_backlight) ⓖ  — Stylize

## Netpbm programs (13)

17. Logarithmic alternative saturation from colour-integrity intensity ratios (Netpbm pamaltsat)  — Color
18. Stepped greyscale for few-colour images ordered by intensity or frequency, maximising grey spacing (Netpbm ppmdist) ⓖ  — Color
19. Luminance-locked recolour toward a target colour, random colours or a target image (Netpbm pamrecolor)  — Color
20. Seven-hexagon neighbourhood filter: alpha-trimmed mean, optimal estimation or edge enhancement (Netpbm pnmnlfilt)  — Blur
21. Jarvis edge enhancement from Knuth dot-diffusion paper (Netpbm pgmenhance)  — Sharpen
22. Bentley effect: vertical smearing of pixels by brightness (Holzmann, Netpbm pgmbentley) ⓖ  — Stylize
23. Wipeout: each row or column replaced by a linear gradient between its two edge pixels (Netpbm pamwipeout)  — Repair
24. Abel inversion: cross-section of an axially symmetric transparent object (Netpbm pgmabel) ⓖ  — Analysis
25. Globe gores: cylindrical projection cut into strips to glue onto a sphere (Netpbm ppmglobe)  — Distort
26. Deshadow: divide by a grayscale-reconstruction estimate of the smooth shadow (Vincent, Netpbm pgmdeshadow) ⓖ  — Repair
27. Background mask: edge-connected flood of the corner-majority colour (Netpbm pambackground) ⓖ  — Analysis
28. One generation of Conway's Life on a binary image (Netpbm pbmlife)  — Stylize
29. Anti-alias only between a chosen foreground and background colour (Netpbm pnmalias)  — Repair

## vkdt modules (2)

30. Weibull film curve: scene-linear to display via a Weibull-distribution tone curve (vkdt filmcurv)  — Tone
31. Oklab gamut clipping toward a chosen focal point (Ottosson, vkdt okgmtclp)  — Color

## LiVES Weed plugins (1)

32. Haip worms: agents crawl toward brighter or darker neighbours stamping 3x3 trails over the frame (LiVES haip) ⓖ  — Stylize

## Mobile GPU filter libraries (Harbeth, android-gpuimage-plus) (3)

33. Soul out: centred zoomed copy blended over the frame, opacity falling as it grows (Harbeth C7SoulOut)  — Stylize
34. Sharpness falloff correction: capture sharpening ramped in between two radii toward the corners (Harbeth)  — Sharpen
35. Multi-zone lookup: separate LUTs for shadows, midtones and highlights blended across thresholds (Harbeth C7MultiZoneLookup)  — Color

## Douyin dynamic filters (GLSL) (3)

36. Douyin shake: periodic zoom pulse with a growing diagonal red/blue channel split  — Stylize
37. Douyin burr glitch: fixed random rows torn sideways in pulses plus red/blue x offsets  — Retro
38. Hallucination: zoomed frame with orbiting ghost samples whose red weight decays slowest, red trails  — Stylize

## Acid Cam shader library (game screen effects) (4)

39. Stealth cloak: glassy sine displacement with desaturated cyan shimmer veil (lostjared game_codex_stealth_cloak)  — Distort
40. Shield hit: hex energy shimmer with a pulsing blue edge flash (lostjared game_codex_shield_hit)  — Render
41. Portal rift: twisting centre tear with cyan-magenta energy (lostjared game_codex_portal_rift)  — Distort
42. Freeze crystal: blue tint, reduced saturation and faceted ice tessellation distortion (lostjared game_freeze_crystal)  — Distort

## StreamFX example shaders (1)

43. Semiline: below an edge line, stepped rows cut by transparent bars that widen row by row (StreamFX)  — Stylize

## Emulator scalers 2 (ScummVM, Mednafen) (4)

44. Edge2x / Edge3x: edge-direction-refined anti-aliasing pixel-art scaler (Eric Welsh, ScummVM)  — Retro
45. 2xPM pixel-art scaler (Pablo Medina, ScummVM)  — Retro
46. 320x200 to 240-line aspect-ratio correction with fixed-phase line interpolation (ScummVM aspect)  — Retro
47. Goat CRT: Goatron / Borg / Slenderman mask patterns with constant RGB divergence and scanlines (Mednafen)  — Retro
