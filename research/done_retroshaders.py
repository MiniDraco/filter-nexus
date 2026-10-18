"""retroshaders: round-10 RetroArch / mpv / libplacebo queue names -> engine ids (RAVU skipped: needs trained filter weights)."""
DONE_PART = {
    'crtshaders2': ['crt-hyllian', 'crt-pi', 'crt-aperture', 'crt-mattias', 'zfast-crt', 'crt-sines', 'crt-nobody', 'crt-frutbunn', 'crt-caligari', 'crt-cgwg-fast', 'crt-yeetron', 'crt-1tap', 'crt-consumer', 'newpixie-crt'],
    'crtpresent': ['koko-aio', 'Mega Bezel'],
    'ntscretro': ['ntsc-md-rainbows', 'Maister NTSC', 'Tvout-tweaks'],
    'lcdshaders': ['lcd-cgwg', 'lcd3x', 'zfast-lcd', 'Harlequin Game Boy shader'],
    'handheldcolor': ['nds-color', 'psp-color'],
    'pixelscale2': ['omniscale', 'sharp-shimmerless', 'bandlimit-pixel', 'cleanEdge', 'AA shader 4.o', 'ddt (diagonal-directed triangle) scaler'],
    'dedither': ['sgenpt-mix', 'Deposterize', 'Checkerboard dedither', 'PS1 dedither'],
    'resamplekernel2': ['Spline36 resampling', 'Spline64 resampling', 'Robidoux (EWA)', 'Ginseng (EWA)', 'Hermite resampling', 'Haasnsoft'],
    'ssimscale': ['SSimSuperRes', 'SSimDownscaler'],
    'chromaupscale': ['KrigBilateral', 'CfL (chroma from luma)'],
    'adaptivesharpen': ['AdaptiveSharpen'],
    'tonemaphdr': ['BT.2390 tone mapping', 'BT.2446a tone mapping', 'Spline tone mapping (libplacebo)', 'ST 2094-40 tone mapping', 'Mobius tone mapping', 'Contrast recovery (libplacebo)'],
    'gamutmap': ['Perceptual gamut mapping (libplacebo)', 'Gamut highlight'],
    'av1grain': ['AV1 film grain synthesis'],
    'h274grain': ['H.274 film grain'],
}
