"""q08: round-12 ReShade repos 3 + round-11 astro queue names -> engine ids.
Skipped: Luma Fade (prod80) - a stack-control technique (fades the shaders placed between its Start/End techniques by a temporally averaged scene luminance, needs the stored pre-effect frame); Adaptive Color Grading (GShade) - needs its external day / night LUT textures; Stage Depth (GShade) - composites an external PNG layer at a depth (second image)."""
DONE_PART = {
    'q08_colorgamut': ['Color Gamut (prod80)'],
    'q08_colorlooks': ['Color Gradients (prod80)', 'Sunset Filter (Fubax)', 'Retro Tint (Daodan)', 'Palette Map (Zenteon)'],
    'isolate': ['Color Isolation (prod80)'],
    'q08_tonefix': ['Watch Dogs Tonemap', 'Whitepoint Fixer (luluco250)'],
    'q08_hdrbloom': ['SOLARIS bloom (iMMERSE)', 'Magic HDR (luluco250)', 'Bessel Bloom (Insane)'],
    'q08_lensghosts': ['Unreal Lens (luluco250)', 'Liquid Lens (luluco250)', 'Hex Lens Flare (luluco250)'],
    'q08_rays': ['Flair (AstrayFX)', 'Tracking Rays (luluco250)'],
    'q08_poster': ['Colorful Poster (Daodan)', 'Multi Tone Poster (Daodan)', 'Posterize Pixelate (prod80)', 'Virtual Resolution (luluco250)', 'Bilateral Comic (Insane)'],
    'q08_deepfry': ['Deep Fry (Insane)'],
    'q08_vignettes': ['Artistic Vignette (luluco250)', 'Magical Rectangle (prod80)'],
    'q08_lensproj': ['Perfect Perspective (Fubax)', 'Flexible CA (luluco250)'],
    'q08_sharpcontrast': ['Filmic Anamorph Sharpen', 'Sharp Contrast (Insane)'],
    'q08_aa': ['DLAA Plus (AstrayFX)', 'CMAA 2 (Insane)'],
    'q08_denoise': ['Smart DeNoise (GShade)', 'Noise Blur (CShade)'],
    'q08_greyc': ['GREYCstoration (PixInsight)'],
    'q08_astro': ['RepairedHSVSeparation (PixInsight)', 'Siril grey_flat (CFA equalize)'],
    'q08_depthfx': ['Mesh Edges (Daodan)', 'Volumetric Fog (NiceGuy)', 'Hole Filler (NiceGuy)', 'Retro Fog (luluco250)'],
    'q08_anaglyph2sbs': ['Anaglyph to SBS (Depth3D)'],
    'ssao2': ['MXAO (iMMERSE)'],
    'parallax': ['Dimension Plus (Depth3D)'],
}
