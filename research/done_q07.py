"""q07: RetroArch slang misc & scaling shaders + 3 G'MIC community filters -> engine ids (batch_q07.js, batch_q07b.js, batch_q07c.js)."""
DONE_PART = {
    'q07_colormangler': ['color-mangler', 'yiq-hue-adjustment'],
    'q07_crtcolorimetry': ['colorimetry (misc)', 'chromaticity (misc)'],
    'q07_patchycolor': ['patchy-color'],
    'q07_nescolor': ['nes-color-decoder'],
    'q07_retrotone': ['natural-vision', 'night-mode (misc)', 'ss-gamma-ramp', 'bsnes-gamma-ramp', 'accessibility_mods', 'gendither'],
    'q07_crtmisc': ['pixel-weave (misc)', 'print-resolution (misc)', 'convergence (CRT misc)', 'mudlord-pal-vhs', 'film_noise (slang)',
                    'blur-haze (sh1nra358)', 'ewa_curvature', 'NormalsDisplacement (reshade port)'],
    'q07_crtsim': ['crtsim-grungy'],
    'q07_resample3': ['jinc2-sharper', 'hann-5-taps', 'spline100', 'g-sharp_resampler'],
    'q07_pixinterp': ['SmuberStep', 'smootheststep', 'ControlledSharpness', 'aann', 'edge1pixel', 'edgeNpixels', 'uniform-nearest', 'soft-pixel-art'],
    'q07_aasharp': ['cheap-sharpen', 'super-res-ex', 'deblur-luma', 'advanced-aa', 'reverse-aa', 'sharpsmoother', 'fast-bilateral-3d', 'smart-morph'],
    'q07_skinmask': ["Skin Mask (G'MIC)"],
    'q07_denim': ['Denim Texture (samj)'],
    'q07_filigree': ['ABN Filigrees (Garry Osgood)'],
    # existing filters that already implement the shader
    'rcas': ['rca_sharpen'],                 # rca_sharpen.slangp = FSR RCAS
    'pixelscale2': ['aa-shader-4.0'],        # 'AA shader 4.0 (guest.r)' mode
    'sharppixels': ['grid-blend-hybrid'],    # sharp-bilinear: blend over one output pixel at texel edges
}
