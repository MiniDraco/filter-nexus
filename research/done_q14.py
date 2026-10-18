"""q14: round 11/14 queue (Filter Forge misc, camera ISP stages, Corel Painter, OtisFX / GShade) -> engine ids (batch_q14.js, batch_q14b.js + existing reflection, gradmap)."""
DONE_PART = {
    'q14_ff_material': ['Rusterizer (Filter Forge)', 'Carve And Stain (Filter Forge)', 'Erode Decal (Filter Forge)', 'Splotchy Concrete (Filter Forge)', '3D engraved painting (Filter Forge)', "Chris's Foil It! Embosser (Filter Forge)"],
    'q14_ff_graphic': ['Film Noir Comic (Filter Forge)', 'Old computer graphics (Filter Forge)', 'Urban Artistry (Filter Forge)', 'Negative passing (Filter Forge)', 'Banded Grayscale Portrait Distortion (Filter Forge)', 'Hardline Cut (Filter Forge)', 'Sketch Cleaner (Filter Forge)', 'Flatten Lightness (Filter Forge)'],
    'q14_ff_maps': ['Satellite Image (Filter Forge)', 'Cartograph (Filter Forge)'],
    'q14_ff_overlay': ['Blood Spatter Analyst (Filter Forge)', 'Jack Frost (Filter Forge)'],
    'q14_ff_geometry': ['Circular Agamograph (Filter Forge)', 'ReMondrian Lite (Filter Forge)', 'Polygonal Mandalas (Filter Forge)'],
    'reflection': ['Sea level (Filter Forge)'],
    'gradmap': ['Luminance Color Gradient (Filter Forge)'],
    'q14_isp_cfa': ['Black level subtraction', 'Defective pixel correction', 'Green imbalance correction', 'False color suppression', 'Quad Bayer remosaic', 'Bayer binning', 'Hamilton-Adams demosaic'],
    'q14_isp_color': ['Color correction matrix (CCM)', 'Camera to XYZ matrix (DNG ColorMatrix)', 'DNG forward matrix'],
    'q14_painter_surface': ['Apply Surface Texture (Painter)', 'Express Texture (Painter)', 'Dye Concentration (Painter)', 'Serigraphy (Painter)', 'Distress (Painter)', 'Apply Screen (Painter)'],
    'q14_otis_depth': ['Directional Depth Blur (OtisFX)', 'Depth Darkness (OtisFX)', 'Magic Border (OtisFX)'],
    'q14_pandafx': ['PandaFX (OtisFX)'],
    'q14_smartnoise': ['SmartNoise anti-banding (GShade)'],
    'q14_patternshade': ['Pattern Shading (GShade)'],
}
