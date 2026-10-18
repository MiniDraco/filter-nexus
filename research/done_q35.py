# q35: queue_q35.txt -> engine ids (round 16: Pertuz focus measures, low-light / contrast, PDE inpainting, camera models)
DONE_PART = {
    'q35_fm_grad': ['GDER Gaussian derivative focus', 'GRAT thresholded absolute gradient focus', 'GRAS squared gradient focus', 'SFRQ spatial frequency focus', 'TENV Tenengrad variance focus', 'CURV image curvature focus', 'CONT image contrast focus (Nanda)', 'LAPE energy of Laplacian focus', 'LAPD diagonal Laplacian focus', 'HELM Helmli-Scherer mean focus'],
    'q35_fm_stat': ['ACMO absolute central moment focus', 'GLVN normalised grey-level variance focus', 'HISE histogram entropy focus', 'HISR histogram range focus', 'DCTE DCT energy ratio focus', 'DCTR DCT reduced energy ratio focus', 'CHEB Chebyshev moments focus', 'EIGV eigenvalues focus'],
    'q35_fm_wav': ['WAVS sum of wavelet coefficients focus', 'WAVV variance of wavelet coefficients focus', 'WAVR ratio of wavelet coefficients focus'],
    'q35_fu_mf': ['Multi-scale fusion low-light (Fu 2016)'],
    'q35_lecarm': ['LECARM camera-response enhancement (Ying 2017)'],
    'q35_alpharoot': ['Alpha rooting (Aghagolzadeh 1992)'],
    'q35_lip': ['Logarithmic image processing LIP (Jourlin-Pinoli)'],
    'q35_plip': ['Parameterized LIP (Panetta 2008)'],
    'q35_toet': ['Contrast pyramid / ratio of low-pass pyramid (Toet 1989)'],
    'q35_rum': ['Rational unsharp masking (Ramponi 1996)'],
    'q35_inpaint_pde': ['Bertalmio PDE inpainting (2000)', 'TV inpainting (Chan-Shen)', 'CDD curvature-driven diffusion inpainting', 'Oliveira fast inpainting (2001)', 'Harmonic inpainting'],
    'q35_cam_division': ['Division model lens distortion (Fitzgibbon 2001)'],
    'q35_cam_kb': ['Kannala-Brandt fisheye model (2006)'],
    'q35_cam_ucm': ['Unified camera model (Mei 2007)'],
    'q35_cam_ds': ['Double sphere camera model (Usenko 2018)'],
    'q35_cam_fov': ['Field-of-view lens model (Devernay-Faugeras 2001)'],
}
