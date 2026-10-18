# textures builder: queue_textures.txt -> engine ids (round 9, Texture nodes)
DONE_PART = {
    "procnoise2": ["Anisotropic noise", "Gaussian spots", "Worley F1", "Worley F2-F1", "Billow noise", "Gabor noise",
                   "Wavelet noise", "Domain warping", "Curl noise", "Flow noise", "Crystal noise", "Voronoi fractal",
                   "Ridged multifractal"],
    "matgen": ["Wood grain", "Brick generator", "Tile generator", "Weave generator", "Scratches generator", "Leather",
               "Fabric weave", "Hexagon pattern"],
    "texwarp": ["Directional warp", "Vector warp", "Multi-directional warp", "Slope blur", "Non-uniform blur"],
    "normblend2": ["Normal blend (RNM)", "Normal blend (UDN)", "Normal blend (whiteout)"],
    "histnodes": ["Histogram scan", "Histogram range", "Histogram shift"],
    "matmasks": ["Dirt mask", "Rust mask", "Moss mask", "Height blend"],
    "colortomask": ["Color to mask"],
    "embossgloss": ["Emboss with gloss"],
    "shapeglow": ["Shape glow"],
    # existing filters that already do exactly this
    "seamless": ["Make it tile (seamless)"],
    "polar": ["Cartesian to polar"],
    "normaltools": ["Normal normalize"],
}
