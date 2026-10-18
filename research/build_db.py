"""Build filter-nexus/filters.db (SQLite) + filters.json from the researched name lists.

Sources (research/raw/*.json): photoshop, gimp, krita, paintnet, gmic, instagram (+css recipes),
plus literature.py (edge/feature operators, PBR maps, Lightroom controls) and the engine's own
filters parsed from index.html.

Each source name becomes an alias; aliases that mean the same operation collapse into one
canonical filter. status: implemented (engine has it) | planned (doable as a GPU shader) |
out_of_scope (needs layers/3D/ML/animation/another image).

Run: python -I build_db.py
"""
import json
import re
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent
RAW = HERE / "raw"
import importlib.util
_spec = importlib.util.spec_from_file_location("literature", HERE / "literature.py")
lit = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(lit)

APP = {"toolkit": "Toolkits", "photoshop": "Photoshop", "gimp": "GIMP 3", "krita": "Krita", "paintnet": "Paint.NET", "gmic": "G'MIC",
       "instagram": "Instagram", "literature": "Image processing", "pbr": "PBR texture tools", "lightroom": "Lightroom / Camera Raw", "toolkit_unused": "", "depth3d": "Depth & 3D tools", "textools": "Toolkits & texture tools", "toolkit": "Toolkits",
       "engine": "Filter Nexus"}

def norm(s):
    s = s.lower().replace("&", " and ").replace("‑", "-")
    s = re.sub(r"[\[\]()/,.:'’\"]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# ---------------------------------------------------------------- engine filters
html = (ROOT / "index.html").read_text(encoding="utf-8")
engine = []
cat = None
for m in re.finditer(r"f = add\('(\w+)'\)|f\('([a-z0-9_]+)',(?:'([^']+)'|\"([^\"]+)\")", html):  # name may be '...' or "..."
    if m.group(1):
        cat = m.group(1)
    else:
        engine.append({"id": m.group(2), "name": m.group(3) or m.group(4), "cat": cat})
ENGINE = {e["id"]: e for e in engine}
FAMILY_LABEL = {"Tone": "Tone", "Color": "Color", "Film": "Film looks", "Blur": "Blur", "Sharpen": "Sharpen",
                "Edges": "Edges & lines", "Materials": "Materials", "Stylize": "Stylize", "Retro": "Retro & glitch",
                "Distort": "Distort", "Noise": "Noise", "Analysis": "Analysis", "Render": "Render", "Repair": "Repair",
                "Frames": "Frames & borders", "Artistic": "Stylize", "Insta": "Instagram looks", "Paint": "Paint & sketch", "Depth": "Depth & 3D", "Terrain": "Terrain", "Sensor": "Camera & sensor", "Augment": "Augmentation"}

# names (any app) that are the same operation as an engine filter
ENGINE_ALIASES = {
    "brightness": ["Brightness"], "contrast": ["Contrast", "Brightness/Contrast", "Brightness / Contrast", "Brightness/Contrast curves"],
    "exposure": ["Exposure"], "gamma": ["Gamma", "Slope, Offset, Power"], "levels": ["Levels", "Auto-Level", "Auto Contrast", "Normalize"],
    "shadhi": ["Shadows/Highlights", "Highlights / Shadows", "Shadows", "Highlights", "Whites", "Blacks"],
    "scurve": ["Curves", "Tone Curve", "Color Adjustment Curves"], "invert": ["Invert", "Invert Colors"],
    "grayscale": ["Desaturate", "Black & White", "Black and White", "Lightness"], "threshold": ["Threshold"],
    "posterize": ["Posterize"], "solarize": ["Solarize"], "matte": [], "noir": [],
    "saturation": ["Saturation", "Hue/Saturation", "Hue / Saturation", "HSV/HSL Adjustment", "HSB/HSL"], "vibrance": ["Vibrance"],
    "hue": ["Hue"], "temp": ["Temperature and Tint", "Temperature", "Tint", "Photo Filter", "Color Balance"],
    "swap": ["Channel Mixer", "Cross-channel color adjustment"], "isolate": ["Replace Color"], "duotone": [],
    "split": ["Color Grading"], "gradmap": ["Gradient Map"], "sepia": ["Sepia"], "cyanotype": [], "tealorange": [],
    "bleach": [], "crossproc": [], "techni2": [], "infrared": [], "xray": [], "pastel": [],
    "kodachrome": [], "polaroid": [], "vintage": [], "brownie": [], "lomo": [], "grain": ["Film Grain", "Grain", "Add Grain"],
    "vignette": ["Vignette", "Vignetting"], "lightleak": [], "oldfilm": ["Old Photo"], "nightvision": [], "thermal": [],
    "gauss": ["Gaussian Blur", "Blur [Gaussian]"], "box": ["Box Blur", "Square Blur", "Blur", "Blur More", "Average"],
    "motion": ["Motion Blur", "Linear Motion Blur", "Blur [Linear]"],
    "zoom": ["Zoom Blur", "Zoom Motion Blur", "Radial Blur", "Blur [Radial]"], "spin": ["Spin Blur", "Circular Motion Blur", "Blur [Angular]"],
    "tiltshift": ["Tilt-Shift", "Blur [Tilt-Shift]", "Field Blur", "Iris Blur", "Variable Blur"],
    "bokeh": ["Lens Blur", "Bokeh Blur", "Focus Blur", "Blur [Depth-of-Field]"],
    "surface": ["Surface Blur", "Smart Blur", "Selective Gaussian Blur", "Bilateral Filter", "Smooth [Bilateral]"],
    "bloom": ["Bloom", "Glow", "Blur [Bloom]"], "orton": [], "softfocus": ["Diffuse Glow", "Soften Portrait", "Softglow"],
    "sharpen": ["Sharpen", "Sharpen More", "Sharpen Edges", "Sharpening"],
    "unsharp": ["Unsharp Mask", "Sharpen (Unsharp Mask)", "Smart Sharpen", "Sharpen [Unsharp Mask]"],
    "highpass": ["High Pass", "Gaussian High Pass"], "clarity": ["Clarity", "Texture"],
    "sobel": ["Sobel", "Sobel Operator", "Edge Detect", "Find Edges", "Edge Detection", "Edge", "Image Gradient", "Edges", "Outline"],
    "prewitt": ["Prewitt Operator"], "scharr": ["Scharr Operator"], "roberts": ["Roberts Cross"],
    "laplace": ["Laplace", "Laplacian"], "log": ["Laplacian of Gaussian", "Marr-Hildreth"],
    "dog": ["Difference of Gaussians"], "xdog": ["XDoG"], "canny": ["Canny Edge Detector"],
    "kirsch": ["Kirsch Compass"], "robinson": ["Robinson Compass"], "freichen": ["Frei-Chen"], "edgedir": [],
    "coloredges": [], "neonedges": ["Neon", "Glowing Edges"], "lineart": ["Ink Outlines"],
    "sketch": ["Pencil Sketch", "Ink Sketch", "Colored Pencil"], "hatch": ["Crosshatch"], "contours": ["Trace Contour", "Isophotes"],
    "emboss": ["Emboss", "Relief", "Emboss Horizontal Only", "Emboss in all Directions", "Emboss (Laplacian)", "Emboss Vertical Only",
               "Emboss with Variable depth", "Emboss Horizontal and Vertical"],
    "dilate": ["Dilate", "Dilation", "Maximum", "Maximize Channel"], "erode": ["Erode", "Erosion", "Minimum", "Minimize Channel"],
    "morphgrad": ["Morphological Gradient", "Morphology"],
    "height": ["Height Map"], "normal": ["Normal Map", "Height to Normal Map"], "ao": ["Ambient Occlusion"],
    "curvature": ["Curvature"], "cavity": ["Cavity"], "roughness": ["Roughness", "Glossiness"], "specular": ["Specular"],
    "displace": ["Displacement Map"], "albedo": ["Albedo De-lighting"],
    "relight": ["Lighting Effects", "Phong Bumpmap", "Bump Map"],
    "pixelate": ["Pixelate", "Pixelize", "Mosaic"], "hexmosaic": [], "crystallize": ["Crystallize", "Crystalize"],
    "stainedglass": ["Stained Glass"], "halftone": ["Color Halftone", "Halftone", "Newsprint"],
    "halftonemono": ["Halftone Pattern"], "engrave": ["Engrave"], "toon": ["Cartoon"], "comic": [],
    "kuwahara": ["Kuwahara"], "oil": ["Oil Paint", "Oilify", "Oilpaint", "Oil Painting"], "watercolor": ["Watercolor"],
    "charcoal": ["Charcoal"], "pointillism": ["Pointillize"], "popart": [],
    "dither": ["Ordered Dithering", "Dithering Threshold Modes", "Dithering Color Modes"],
    "palette": ["Palettize", "Quantize", "Index Color"], "gameboy": [], "ascii": ["Ascii Art"],
    "crt": ["Video Degradation"], "vhs": [], "glitch": [], "chromatic": ["Chromatic Aberrations"], "rgbsplit": [],
    "pixelsort": ["Pixel Sort"],
    "barrel": ["Lens Distortion", "Lens Corrections"], "bulge": ["Bulge", "Pinch"], "swirl": ["Twirl", "Twist", "Whirl and Pinch"],
    "wave": ["Wave", "Ripple", "ZigZag"], "ripple": ["Waves", "Ocean Ripple"],
    "polar": ["Polar Coordinates", "Little Planet"], "spherize": ["Spherize"], "kaleido": ["Kaleidoscope"],
    "mirror": ["Tile Reflection"], "tile": ["Tile", "Small Tiles"], "flip": [], "shear": ["Shear"],
    "frosted": ["Frosted Glass", "Spread", "Diffuse", "Glass"], "turbulence": ["Displace", "Warp"],
    "noise": ["Add Noise", "RGB Noise", "HSV Noise", "CIE lch Noise", "Random Noise"], "saltpepper": ["Hurl"],
    "clouds": ["Clouds", "Difference Clouds", "Solid Noise", "Plasma", "Perlin Noise"], "fog": ["Fog"], "static": [],
    "falsecolor": [], "zebra": [], "peaking": [], "clipping": [], "channel": [], "satmap": [], "huemap": [],
    "texturemap": [], "noisemap": [], "chromakey": ["Color to Alpha"], "difference": [],
}
# filters added after the first engine build (Photoshop batch); later entries win on shared names
ENGINE_ALIASES.update({
    "cutout": ["Cutout"], "drybrush": ["Dry Brush"], "fresco": ["Fresco"], "neonglow": ["Neon Glow"], "paintdaubs": ["Paint Daubs"],
    "paletteknife": ["Palette Knife"], "plasticwrap": ["Plastic Wrap"], "posteredges": ["Poster Edges"], "roughpastels": ["Rough Pastels"],
    "smudgestick": ["Smudge Stick"], "sponge": ["Sponge"], "underpainting": ["Underpainting"], "accentededges": ["Accented Edges"],
    "angledstrokes": ["Angled Strokes"], "darkstrokes": ["Dark Strokes"], "spatter": ["Spatter"], "sprayedstrokes": ["Sprayed Strokes"],
    "sumie": ["Sumi-e"], "basrelief": ["Bas Relief"], "chalkcharcoal": ["Chalk & Charcoal"], "chrome": ["Chrome"], "conte": ["Conté Crayon"],
    "graphicpen": ["Graphic Pen"], "notepaper": ["Note Paper"], "photocopy": ["Photocopy"], "plaster": ["Plaster"],
    "reticulation": ["Reticulation"], "stamp": ["Stamp"], "tornedges": ["Torn Edges"], "waterpaper": ["Water Paper"],
    "craquelure": ["Craquelure"], "mosaictiles": ["Mosaic Tiles"], "patchwork": ["Patchwork"],
    "texturizer": ["Texturizer", "Apply Canvas", "Canvas Texture"], "facet": ["Facet"], "fragment": ["Fragment"], "mezzotint": ["Mezzotint"],
    "extrude": ["Extrude"], "tiles": ["Tiles"], "wind": ["Wind"],
    "median": ["Median", "Median Blur", "Median Filter", "Smooth [Median]"], "dustscratch": ["Dust & Scratches"], "despeckle": ["Despeckle"],
    "reducenoise": ["Reduce Noise", "Noise Reduction"], "glass": ["Glass"], "zigzag": ["ZigZag"], "oceanripple": ["Ocean Ripple"],
    "offset": ["Offset"], "fibers": ["Fibers"], "lensflare": ["Lens Flare"], "average": ["Average"], "iris": ["Iris Blur"],
    "deinterlace": ["De-Interlace", "Deinterlace"], "ntsc": ["NTSC Colors"], "custom": ["Custom", "Convolution Matrix", "Convolve"],
    "hsbhsl": ["HSB/HSL"], "colorbalance": ["Color Balance"], "photofilter": ["Photo Filter"], "channelmixer": ["Channel Mixer"],
    "selectivecolor": ["Selective Color"], "replacecolor": ["Replace Color"], "hdrtoning": ["HDR Toning", "Tone Mapping"],
    "equalize": ["Equalize", "Histogram Equalization"], "colorlookup": ["Color Lookup"], "shapeblur": ["Shape Blur"],
    "pathblur": ["Path Blur"], "flame": ["Flame"], "pictureframe": ["Picture Frame"], "tree": ["Tree"],
})
# batch 1: Tone, Noise, Blur, Color
ENGINE_ALIASES.update({
    "dodge": ["Dodge"], "burn": ["Burn"], "dehaze": ["Dehaze"], "hslmixer": ["HSL / Color Mixer"], "pick": ["Pick", "Random Pick"],
    "slur": ["Slur"], "fragmentblur": ["Fragment Blur"], "meancurvblur": ["Mean Curvature Blur", "Smooth [Mean-Curvature]"],
    "sketchblur": ["Sketch Blur"], "tileableblur": ["Tileable Blur"], "unfocus": ["Unfocus"], "abstraction": ["Abstraction"],
    "basicadj": ["Basic Adjustments"], "boostchroma": ["Boost Chromaticity"], "boostfade": ["Boost-Fade"],
    "channelproc": ["Channel Processing"], "colorblind": ["Color Blindness"], "colorfulblobs": ["Colorful Blobs"],
    "detectskin": ["Detect Skin"], "equalizehsv": ["Equalize HSV", "Equalize HSI-HSL-HSV"],
    "mixer": ["Mixer [CMYK]", "Mixer [Generic]", "Mixer [HSV]", "Mixer [Lab]", "Mixer [PCA]", "Mixer [RGB]", "Mixer [YCbCr]"],
    "randomcolor": ["Random Color Transformation"], "retinex": ["Retinex"], "retrofade": ["Retro Fade"], "tunehsv": ["Tune HSV Colors"],
})
EXTRA_ALIASES = [  # more app names for filters that already exist
    ("colorlookup", ["Apply From CLUT Set", "Color Presets", "Simulate Film"]), ("replacecolor", ["Select-Replace Color"]),
    ("isolate", ["Selective Desaturation"]), ("palette", ["Colormap"]), ("gradmap", ["Colorize [with Colormap]"]),
    ("shadhi", ["Equalize Light", "Equalize Shadow"]),
]
OOS_NAMES = {"Customize CLUT": "interactive tool, not a filter", "User-Defined": "needs a typed formula",
             "Transfer Colors [Multi]": "needs a second reference image"}
# batch 2: Edges & lines, Sharpen, Repair
ENGINE_ALIASES.update({
    "morphfilter": ["Morphological Filter", "Opening", "Closing", "Top-Hat", "Black-Hat"], "adaptivethresh": ["Adaptive Threshold"],
    "otsu": ["Otsu Threshold"], "distmap": ["Distance Map", "Distance Transform", "Edges Offsets"],
    "harris": ["Harris Corners", "Shi-Tomasi Corners"], "fast": ["FAST Corners"], "susan": ["SUSAN"], "gabor": ["Gabor Filter"],
    "coherence": ["Structure Tensor Coherence", "Diffusion Tensors"], "linedetect": ["Line Detection Kernels"],
    "clahe": ["CLAHE", "Equalize Local Histograms"], "slic": ["Simple Linear Iterative Clustering (SLIC)", "Super-Pixels", "Segmentation", "Waterpixels"],
    "detailseq": ["Details Equalizer", "Sharpen [Multiscale]", "Sharpen [Octave Sharpening]", "Magic Details"],
    "freaky": ["Freaky Details", "Mighty Details"], "localnorm": ["Local Normalization", "Local Processing"],
    "deconvolve": ["Sharpen [Richardson-Lucy]", "Sharpen [Gold-Meinel]", "Sharpen [Deblur]"],
    "shock": ["Sharpen [Shock Filters]", "Sharpen [Inverse Diffusion]"],
    "anisodiff": ["Anisotropic Diffusion", "Smooth [Anisotropic]", "Smooth [Perona-Malik]", "Smooth [Diffusion]", "Smooth [Total Variation]"],
    "antialias": ["Antialias", "Smooth [Antialias]", "Smooth [Thin Brush]"], "nlfilter": ["NL Filter"], "redeye": ["Red-Eye Attenuation"],
    "hotpixels": ["Remove Hot Pixels"], "guided": ["Smooth [Guided]"], "nlmeans": ["Smooth [NL-Means]", "Smooth [Patch-Based]", "Smooth [Patch-PCA]"],
    "skinsmooth": ["Smooth [Skin]"], "snn": ["Symmetric Nearest Neighbor"],
})
EXTRA_ALIASES += [("canny", ["Edges (Canny)", "Thin Edges"]), ("sobel", ["Gradient Norm"]), ("coloredges", ["Gradient RGB"]),
                  ("edgedir", ["Local Orientation"]), ("hdrtoning", ["Tone Mapping [Fast]"]), ("highpass", ["Split Details [Gaussian]", "Split Details [Wavelets]"]),
                  ("unsharp", ["Sharpen [Texture]"]), ("surface", ["Smooth [Selective Gaussian]"]), ("reducenoise", ["Smooth [Wavelets]"])]
OOS_NAMES.update({"Floyd-Steinberg Dithering": "sequential error diffusion, no single-pass GPU form",
                  "Skeletonize": "iterative thinning", "Skeleton": "iterative thinning",
                  "Hough Lines": "needs a vote accumulator", "Hough Circles": "needs a vote accumulator", "Hough Sketch": "needs a vote accumulator",
                  "Watershed": "needs region flooding", "Bayer Reconstruction": "needs raw sensor data",
                  "Sharpen [Alpha]": "works on transparency or selections", "Split Details [Alpha]": "works on transparency or selections",
                  "Solidify": "works on transparency or selections"})
# batch 3: Retro & glitch, Distort
ENGINE_ALIASES.update({
    "jpeg": ["JPEG Artefacts"], "jpegglitch": ["Huffman Glitches"], "messbits": ["Mess with Bits"], "crtphosphor": ["CRT Phosphors"],
    "dirty": ["Dirty"], "flipblocks": ["Flip & Rotate Blocks"], "gradnoise": ["Noise [Gradient]"], "offsetstripes": ["Offset Stripes"],
    "shadestripes": ["Random Shade Stripes"], "rainsnow": ["Rain & Snow"], "selfglitch": ["Self Glitching"],
    "warpintensity": ["Warp by Intensity", "Heightfield Warp"], "multidirblur": ["Blur [Multidirectional]"],
    "conformal": ["Conformal Maps", "Polar Inversion"], "fisheye": ["Fish-Eye"],
    "stereo": ["Stereographic Projection", "Equirectangular to Nadir-Zenith"], "poincare": ["Poincaré Disk", "Poincar� Disk"],
    "droste": ["Droste", "Recursive Transform"], "fractaltrace": ["Fractal Trace"], "flower": ["Flower"], "illusion": ["Illusion"],
    "curvebend": ["Curve Bend"], "crease": ["Crease"], "waterdrops": ["Drop Water", "Raindrops"], "pagecurl": ["Page Curl"],
    "perspective": ["Quadrangle"], "reflection": ["Reflection"], "rowshift": ["Shift"], "shuffle": ["Shuffle Patches", "Taquin"],
    "squarecircle": ["Square to Circle", "Square to Circle [alt]", "Circle Transform"], "shatter": ["Breaks"], "blinds": ["Blinds"],
    "ministeck": ["Ministeck"], "puzzle": ["Puzzle", "Jigsaw"], "seamless": ["Make Seamless [Diffusion]", "Make Seamless [Patch-Based]", "Tile Seamless"],
    "tiledrot": ["Tiled Rotation", "Tileable Rotation"], "tiledfx": ["Tiled Normalization", "Tiled Isolation", "Tiled Random Shifts", "Tiled Parameterization"],
    "arrayfx": ["Array [Mirrored]", "Array [Faded]", "Array [Random]", "Array [Random Colors]"],
    "imagegrid": ["Grid [Cartesian]", "Grid [Hexagonal]", "Grid [Triangular]"], "chessboard": ["Chessboard"], "dice": ["Dices"], "zoomscale": ["Zoom"],
})
EXTRA_ALIASES += [("bloom", ["Blur [Glow]"]), ("motion", ["Blur [Motion]"]), ("noise", ["Noise [Additive]"]), ("clouds", ["Noise [Perlin]"]),
                  ("frosted", ["Noise [Spread]"]), ("crt", ["CRT Scanlines", "Scanlines"]), ("vhs", ["VHS Filter"]), ("palette", ["Oldschool 8bits"]),
                  ("oldfilm", ["Old-Movie Stripes"]), ("wind", ["Streak"]), ("spherize", ["Apply Lens", "Sphere"]), ("barrel", ["Distort Lens"]),
                  ("kaleido", ["Kaleidoscope [Blended]", "Kaleidoscope [Polar]", "Kaleidoscope [Symmetry]"]), ("polar", ["Euclidean - Polar", "Polar Transform"]),
                  ("mirror", ["Symmetrize"]), ("tile", ["Array [Regular]"]), ("turbulence", ["Dents", "Random"]), ("oceanripple", ["Water"]),
                  ("glass", ["Textured Glass"]), ("tiles", ["Paper Tile"]), ("morphfilter", ["Value Propagate"])]
OOS_NAMES.update({"Rebuild From Similar Blocks": "needs a patch search across the image", "Visible Watermark": "renders text",
                  "Cartesian Transform": "needs a typed formula", "Distort [RBF]": "needs control points", "Warp [RBF]": "needs control points",
                  "Extract Objects": "needs object segmentation", "Loose Photos": "layout generator, not a filter",
                  "Seamcarve": "content-aware resizing", "Morph [Interactive]": "interactive tool, not a filter"})
# batch 4: Stylize, Frames, Materials, Analysis
ENGINE_ALIASES.update({
    "lowpoly": ["Polygonize [Delaunay]", "Polygonize [Energy]"], "quadtree": ["Quadtree Variations"], "lic": ["Van Gogh (LIC)", "Filaments"],
    "brushify": ["Brushify", "GIMPressionist", "Paint With Brush"], "circleabs": ["Circle Abstraction"], "ellipsionism": ["Ellipsionism"],
    "cubism": ["Cubism"], "feltpen": ["Felt Pen", "Marker Drawing"], "doodle": ["Doodle"], "freakybw": ["Freaky B&W"], "ghost": ["Ghost"],
    "fractalize": ["Fractalize"], "glasstile": ["Glass Tile"], "lightrays": ["Light Rays", "Guided Light Rays"], "hopeposter": ["Hope Poster"],
    "lightpatch": ["Light Patch", "Shadow Patch"], "linify": ["Linify", "Stringify"], "popshadow": ["Pop Shadows"], "rodilius": ["Rodilius"],
    "shapeism": ["Shapeism"], "sliceluma": ["Slice Luminosity"], "sparkle": ["Sparkle"], "supernova": ["Supernova"], "weave": ["Weave"],
    "vectorpaint": ["Vector Painting", "Sharp Abstract"], "bokehlights": ["Bokeh"],
    "frame": ["Add Border", "Frame [Blur]", "Frame [Fuzzy]", "Frame [Mirror]", "Frame [Pattern]", "Frame [Regular]", "Frame [Round]", "Frame [Smooth]", "Fuzzy Border"],
    "oldphoto": ["Old Photograph"], "filmslide": ["Slide"], "stain": ["Stain"], "tunnel": ["Tunnel"],
    "edgewear": ["Edge Wear Mask"], "metallic": ["Metallic"], "emissive": ["Emissive"], "opacitymask": ["Opacity Mask"],
    "thickness": ["Thickness"], "bentnormal": ["Bent Normals"], "histogram": ["Histogram Analysis"], "knit": ["Intarsia"],
})
EXTRA_ALIASES += [("texturizer", ["Clothify"]), ("dither", ["Dithering"]), ("lensflare", ["Gradient Flare"]), ("xdog", ["Hard Sketch"]),
                  ("bloom", ["Highlight Bloom"]), ("relight", ["Illuminate 2D Shape", "Relief Light"]), ("sumie", ["Ink Wash"]),
                  ("softfocus", ["Light Glow"]), ("lightleak", ["Light Leaks"]), ("oil", ["Lylejk's Painting", "Painting"]),
                  ("kuwahara", ["Smooth Abstract"]), ("sketch", ["Pencil", "Pencil Portrait", "Sketch"]), ("popart", ["Warhol"]),
                  ("pictureframe", ["Frame [Painting]"]), ("dog", ["Bandpass"]), ("palette", ["Color Modes", "Colorspace Modes"])]
OOS_NAMES.update({"Colorize Lineart [Auto-Fill]": "needs line-art input and color hints", "Colorize Lineart [Propagation]": "needs line-art input and color hints",
                  "Colorize Lineart [Smart Coloring]": "needs line-art input and color hints", "Stylize": "style transfer needs a second style image",
                  "Xach-Effect": "works on transparency or selections", "Long Shadow": "works on transparency or selections",
                  "Frame [Cube]": "3D scene rendering", "Dithering Alpha Modes": "works on transparency or selections",
                  "Fourier Analysis": "needs a whole-image FFT", "Fourier Transform": "needs a whole-image FFT", "Fourier Watermark": "needs a whole-image FFT",
                  "Sample Image": "loads a sample picture, not a filter", "Solve Maze": "path-finding, not a filter"})
# batch 5: Render
ENGINE_ALIASES.update({
    "fractal": ["Mandelbrot Fractal", "Julia Fractal", "Mandelbrot - Julia Sets", "Fractal Explorer", "Newton Fractal"],
    "ifsfrac": ["Sierpinski Triangle", "Snowflake", "Variable-Density Hilbert Curve"],
    "gradientfill": ["Gradient [Linear]", "Gradient [Radial]", "Gradient [Corners]", "Gradient [Poles]", "Gradient [Random]", "Rainbow"],
    "pattern": ["Checkerboard", "Stripes", "Polka Dots", "Plaid", "Grid", "Triangular Pattern", "Truchet", "Op Art", "Pills", "Hearts",
                "Stars", "Maze", "Circuit", "Bayer Matrix", "Tetris", "Linear Sinusoid"],
    "texture": ["Cell Noise", "Voronoi", "Simplex Noise", "Marble", "Lava", "Satin", "Camouflage", "Seamless Turbulence", "Paper Texture",
                "Canvas", "Cracks", "Crystal", "Crystal Background", "Mineral Mosaic", "Organic Fibers", "Reaction-Diffusion",
                "Diffraction Patterns", "Shade Bobs", "Rorschach", "Sinus", "Random Pattern", "Qbist", "CML Explorer", "Algorithm A"],
    "curves": ["Lissajous", "Hypotrochoid", "Spline Spirograph", "Spyrogimp", "Spiral", "Superformula", "Line Nova", "Sine Curve",
               "Whirls", "Whirl Drawing", "Shock Waves"],
    "lightning": ["Lightning", "Neon Lightning"], "shape2d": ["Heart", "Gear", "Ball", "Symmetric 2D Shape"],
    "shapepack": ["Box Fitting", "Pack Ellipses", "Random Rectangles", "Random Color Ellipses", "Circle Art"],
    "bayerfilter": ["Bayer Filter"],
})
EXTRA_ALIASES += [("normal", ["Generate Normal Map"]), ("depthview", ["New Mesh from Layer › Depth Map"]), ("halftonemono", ["Halftone [Generic]"]), ("pixelsort", ["Pixel Stretch"]), ("pattern", ["Checkerboard (legacy)", "Grid (legacy)"]), ("curves", ["Twisted Rays"])]
OOS_NAMES.update({"Barnsley Fern": "needs point plotting (chaos game)", "Dragon Curve": "needs point plotting (chaos game)",
                  "IFS Fractal": "needs point plotting (chaos game)", "Cupid": "fixed silhouette artwork, not a filter",
                  "Pack Sprites": "needs a sprite image", "Resynthesize Texture [FFT]": "texture synthesis from a sample",
                  "Resynthesize Texture [Patch-Based]": "texture synthesis from a sample", "Generate Random Portrait": "needs a face generator",
                  "Quick Copyright": "renders text", "Random Signature": "renders text", "Speech Bubble": "renders text",
                  "Equation Plot [Parametric]": "needs a typed formula", "Equation Plot [Y=f(X)]": "needs a typed formula",
                  "Gradient [Custom Shape]": "needs a drawn shape", "Gradient [from Curve]": "needs a drawn curve",
                  "HoughLinesP": "needs a vote accumulator", "grabCut": "interactive segmentation", "segmentation.chan_vese": "iterative level-set segmentation",
                  "segmentation.random_walker": "needs seed labels", "filters.butterworth": "needs a whole-image FFT", "FDA": "needs a second reference image", "HistogramMatching": "needs a second reference image", "PixelDistributionAdaptation": "needs a second reference image", "TextImage": "renders text", "BlendAlpha": "needs several layers or images", "BlendAlphaSimplexNoise": "needs several layers or images", "Mantiuk contrast domain": "needs a multi-scale contrast-domain solver", "NDVI": "needs a near-infrared band", "Pan-sharpening": "needs a separate panchromatic band", "Deskew": "needs a global skew-angle estimate (whole-image Hough)", "Gamut warning (CMYK)": "needs an ICC printer profile", "Phase congruency": "needs a log-Gabor filter bank in the frequency domain", "Watershed segmentation": "sequential flooding (priority queue)", "Floyd-Steinberg error diffusion": "sequential error diffusion; use ordered dither", "Zero-DCE": "needs a neural network", "Dark frame subtraction": "needs a second (dark) exposure", "Notch filter (periodic noise)": "needs a whole-image FFT", "BM3D": "block matching + 3D transform; too heavy for a fragment shader (use nlmeans)", "inpaint": "needs a trained model or inpainting", "watershed": "needs region flooding"})
# depth & 3D
ENGINE_ALIASES.update({
    "depthview": ["Depth Estimation"], "depthdof": ["Depth Blur", "Lens Blur", "Portrait Mode Background Blur"], "depthfog": ["Aerial Perspective"],
    "nvnormal": ["NVIDIA Normal Map Filter"], "bumpmap": ["Generate Bump Map"],
    "parallax": ["3D Photos"], "anaglyph": ["Anaglyph 3D"], "stereopair": ["Stereoscopy"], "stereogram": ["Autostereogram"],
})
# texture, terrain, line & structure detectors, general sensors
ENGINE_ALIASES.update({
    "flowmap": ["Flow Map"], "sdf": ["Signed Distance Field", "SDF"], "colorid": ["ID Map", "Color ID Map"], "toksvig": ["Toksvig"],
    "slopemap": ["Gradient Map (dX/dY)"], "matcap": ["Matcap"], "toonramp": ["Toon Shading"], "hillshade": ["Hillshade", "Shaded Relief"],
    "slopedeg": ["Slope"], "aspectmap": ["Aspect"], "terraces": ["Terraces", "Terrace"], "erosion": ["Thermal Erosion", "Erosion"],
    "cld": ["Coherent Line Drawing", "FDoG", "Flow-based Difference of Gaussians"], "ridge": ["Ridge Detection", "Valley Detection"],
    "frangi": ["Frangi Vesselness"], "cannyfull": ["Canny with hysteresis"], "skeleton": ["Zhang-Suen Thinning", "Skeletonize", "Skeleton"],
    "junctions": ["Junction Detection", "Endpoint Detection"], "binarize": ["Sauvola", "Niblack", "Wolf", "Bernsen", "Bradley", "Phansalkar"],
    "descreen": ["Descreen", "Screentone Removal"], "inkextract": ["Ink Extraction", "Line Art Extraction"], "strokewidth": ["Stroke Width Transform"],
    "gaborbank": ["Gabor Filter Bank"], "multiedge": ["Multi-scale Edges"], "zerocross": ["Zero Crossing"], "etf": ["Edge Tangent Flow"],
    "frangims": ["Multi-scale Frangi"], "steger": ["Steger's method", "Steger Line Detector"], "linedetector": ["Line Detector (Ricci-Perfetti)"],
    "rollingguidance": ["Rolling Guidance Filter"], "colorspace": ["Color Space Conversion"], "lbp": ["Local Binary Pattern"], "hog": ["HOG"],
    "entropy": ["Local Entropy"], "saliency": ["Saliency Map"], "localstats": ["Local Statistics"], "darkchannel": ["Dark Channel Prior"],
    "specular_detect": ["Specular Highlight Detection"], "shadowmask": ["Shadow Detection"], "focusmap": ["Focus Measure", "Blur Detection"],
    "blockiness": ["JPEG Blockiness"], "meijering": ["Meijering Neuriteness"], "autothreshold": ["Auto Threshold", "Multi-Otsu"], "colormap": ["Colormap"], "meanshift": ["Mean Shift Filter"],
})
# tone mapping, texture analysis, sensor simulation, morphology, wavelets, terrain analysis
ENGINE_ALIASES.update({
    "tonemap": ["Reinhard", "Drago", "ACES", "Hable", "Uncharted 2", "Hejl-Dawson", "Lottes", "Uchimura", "AgX", "Tone Mapping"],
    "reinhardlocal": ["Reinhard local operator", "Dodge and Burn (Reinhard)"], "expofusion": ["Exposure Fusion"],
    "msr": ["Multi-Scale Retinex", "MSRCR", "Retinex (MSR)"], "glcm": ["Haralick", "GLCM", "Gray-Level Co-occurrence Matrix"],
    "laws": ["Laws Texture Energy"], "tamura": ["Tamura Features"], "fractaldim": ["Fractal Dimension"], "ssimmap": ["SSIM"],
    "blobdetect": ["Determinant of Hessian", "Blob Detection"], "moravec": ["Moravec"],
    "sensornoise": ["Shot Noise", "Read Noise", "PRNU", "Fixed Pattern Noise", "Dark Current"], "bayersim": ["Demosaicing Artifacts"],
    "rollingshutter": ["Rolling Shutter"], "lensvignette": ["Natural Vignetting"], "camshake": ["Camera Shake", "Motion Blur Kernel"],
    "moire": ["Moiré", "Moire"], "deadpixels": ["Hot Pixels", "Dead Pixels"], "interlace": ["Interlace"], "resample": ["Downscale", "Resample"],
    "reconstruct": ["Morphological Reconstruction", "Opening by Reconstruction", "Fill Sinks"], "hmaxima": ["H-Maxima"],
    "regionalmax": ["Regional Maxima", "Regional Minima"], "asf": ["Alternating Sequential Filter"],
    "atrous": ["Wavelet Decompose", "A Trous Wavelet"], "colorconstancy": ["Gray World", "White Patch", "Shades of Gray", "Gray Edge"],
    "tpi": ["Topographic Position Index", "TPI"], "tri": ["Terrain Ruggedness Index", "TRI", "Ruggedness"], "hypsometric": ["Hypsometric Tint"],
    "strata": ["Strata", "Stratify"], "curvature2": ["Plan Curvature", "Profile Curvature"], "skyview": ["Sky View Factor", "Openness"],
    "terrainshadow": ["Terrain Shadows"], "viewshed": ["Viewshed"], "flowacc": ["Flow Accumulation", "Rivers", "Wetness", "TWI"],
    "snowmask": ["Snow"],
})
for _eid, _names in EXTRA_ALIASES:
    ENGINE_ALIASES[_eid] = ENGINE_ALIASES.get(_eid, []) + _names
ENGINE_ALIASES.update({e["id"]: [] for e in engine if e["id"] not in ENGINE_ALIASES})
# synonyms that merge non-engine names into one canonical filter
SYN = {"median": "Median", "median blur": "Median", "median filter": "Median",
       "reduce noise": "Noise Reduction", "noise reduction": "Noise Reduction", "despeckle": "Despeckle",
       "de-interlace": "Deinterlace", "deinterlace": "Deinterlace", "red eye removal": "Red Eye Removal",
       "drop shadow legacy": "Drop Shadow", "checkerboard legacy": "Checkerboard", "grid legacy": "Grid",
       "histogram equalization": "Equalize", "equalize": "Equalize", "fractal trace": "Fractal Trace"}

# source group -> family for names that are not engine filters
GROUP_FAMILY = {
    "photoshop": {"Artistic": "Stylize", "Blur": "Blur", "Blur Gallery": "Blur", "Brush Strokes": "Stylize", "Distort": "Distort",
                  "Noise": "Noise", "Pixelate": "Stylize", "Render": "Render", "Sharpen": "Sharpen", "Sketch": "Stylize",
                  "Stylize": "Stylize", "Texture": "Stylize", "Video": "Retro", "Other": "Tone", "Adjustments": "Tone"},
    "gimp": {"Blur": "Blur", "Enhance": "Repair", "Distort": "Distort", "Light and Shadow": "Stylize", "Noise": "Noise",
             "Edge-Detect": "Edges", "Generic": "Edges", "Combine": "Frames", "Artistic": "Stylize", "Decor": "Frames",
             "Map": "Distort", "Rendering": "Render"},
    "krita": {"Adjust": "Tone", "Artistic": "Stylize", "Blur": "Blur", "Colors": "Color", "Edge Detection": "Edges",
              "Emboss": "Edges", "Enhance": "Sharpen", "Map": "Materials", "Other": "Noise", "Wavelet Decompose": "Analysis"},
    "paintnet": {"Adjustments": "Tone"},
    "gmic": {"Arrays & Tiles": "Distort", "Artistic": "Stylize", "Black & White": "Stylize", "Colors": "Color", "Contours": "Edges",
             "Deformations": "Distort", "Degradations": "Retro", "Details": "Sharpen", "Frames": "Frames", "Frequencies": "Analysis",
             "Layers": "Frames", "Lights & Shadows": "Stylize", "Patterns": "Render", "Rendering": "Render", "Repair": "Repair",
             "Sequences": "Render", "Silhouettes": "Render", "Various": "Analysis"},
}
PDN_GROUP = {"Artistic": "Stylize", "Blurs": "Blur", "Color": "Color", "Distort": "Distort", "Noise": "Noise", "Object": "Frames",
             "Photo": "Tone", "Render": "Render", "Stylize": "Stylize"}

OOS = [  # (regex on "name | group", reason)
    (r"\b3d\b|3D |extrusion|elevation", "3D scene rendering"),
    (r"animated|sequence|playback|spinning globe|burn-in|rippling", "animation, not a still filter"),
    (r"\bcnn\b|inpaint|denoise \[|upscale|super-resolution|ai |neural|colorize \[photographs\]|content aware", "needs a trained model or inpainting"),
    (r"\blayers?\b|blend \[|align layers|depth merge|filmstrip|montage|image map|semi-flatten|stack|compose", "needs several layers or images"),
    (r"custom code|gmic|download|export|import|privacy|release notes|feedback|what's new|tribute|games & demos|gmicky", "app utility, not a filter"),
    (r"interactive|text styling|\btext\b|gfig|script|guides|gegl graph|sphere designer|map object|panorama projection|vanishing point", "interactive tool, not a filter"),
    (r"match color|color transfer|apply external clut|clut from", "needs a second reference image"),
    (r"red eye|shake reduction|straighten|perspective$|lens corrections|calibration", "needs detection or camera data"),
    (r"drop shadow|inner glow|bevel|round corners|color to alpha|reset transparent|invert alpha|stencil|propagate colors|fast color overlay", "works on transparency or selections"),
]

def oos_reason(name, group):
    s = (name + " | " + group).lower()
    for rx, why in OOS:
        if re.search(rx, s):
            return why
    return ""

JUNK = re.compile(r"^(documentation|about|introduction|misc)$", re.I)
SKIP_GROUPS = {("gimp", "Web"), ("gimp", "Animation")}

# ---------------------------------------------------------------- collect aliases
aliases = []  # (src, group, name, url, note)
for src in ["photoshop", "gimp", "krita", "paintnet", "gmic"]:
    for r in json.loads((RAW / f"{src}.json").read_text(encoding="utf-8")):
        if JUNK.match(r["name"]) or (src, r.get("group", "")) in SKIP_GROUPS:
            continue
        aliases.append((src, r.get("group", ""), r["name"], r.get("url", ""), r.get("note", "")))
ig = json.loads((RAW / "instagram.json").read_text(encoding="utf-8-sig"))
ig_names = sorted({("xpro-ii" if r["name"] == "xpro2" else r["name"]) for r in ig if r["name"] != "cssgram"})
for n in ig_names:
    aliases.append(("instagram", "Filters", n, "https://github.com/picturepan2/instagram.css", ""))
for n, g, u in lit.EDGE_OPS:
    aliases.append(("literature", g, n, u, ""))
for n, u in lit.MATERIAL_MAPS:
    aliases.append(("pbr", "Maps", n, u, ""))
for n, g, u in lit.DEPTH_TOOLS:
    aliases.append(("depth3d", g, n, u, ""))
for n, g, eid in lit.TEXTURE_TOOLS:
    aliases.append(("textools", g, n, "", "maps to " + eid))
for n, g, eid in lit.TOOLKITS:
    aliases.append(("textools" if eid else "toolkit", g, n, "", ("maps to " + eid) if eid else ""))
for n in lit.LIGHTROOM:
    aliases.append(("lightroom", "Develop", n, "https://helpx.adobe.com/lightroom-cc/using/adjust-colors-tones.html", ""))

# Instagram CSS recipes: filter() chain + optional ::before overlay
css = (RAW / "instagram.css").read_text(encoding="utf-8-sig")
RECIPES = {}
for n in ig_names:
    key = n
    m = re.search(rf"\.filter-{re.escape(key)}\s*\{{[^}}]*?\bfilter:\s*([^;]+);", css)
    ov = re.search(rf"\.filter-{re.escape(key)}::before\s*\{{([^}}]*)\}}", css)
    ops = re.findall(r"([a-z-]+)\(([-\d.]+)(deg)?\)", m.group(1)) if m else []
    overlay = None
    if ov:
        bg = re.search(r"background:\s*([^;]+);", ov.group(1)); bl = re.search(r"mix-blend-mode:\s*([^;]+);", ov.group(1))
        overlay = {"background": bg.group(1).strip() if bg else None, "blend": bl.group(1).strip() if bl else "normal"}
    RECIPES[n] = {"ops": [[o, float(v)] for o, v, _ in ops], "overlay": overlay}

# ---------------------------------------------------------------- canonicalize
alias_to_engine = {}
for eid, names in ENGINE_ALIASES.items():
    assert eid in ENGINE, eid
    for n in names + [ENGINE[eid]["name"]]:
        alias_to_engine[norm(n)] = eid

canon = {}  # key -> record
def get_canon(key, **init):
    if key not in canon:
        canon[key] = dict(init, aliases=[], sources=set())
    return canon[key]

for e in engine:
    get_canon("engine:" + e["id"], name=e["name"], family=e["cat"], engine_id=e["id"], status="implemented", reason="")

# round 9 queue: family by source group, reason for non-shader entries
GROUP_FAMILY.setdefault("toolkit", {}).update(lit.R9_FAMILY)
R9_SHADER = {n for n, src, cat, fe in lit.R9 if fe == "S"}  # vetted by hand: skip the generic regex classifier
GROUP_FAMILY["toolkit"].update(lit.R10_FAMILY)
OOS_NAMES.update({n: lit.R10_REASON[fe] for n, src, cat, fe in lit.R10 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R10 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R11_FAMILY)
OOS_NAMES.update({n: lit.R11_REASON[fe] for n, src, cat, fe in lit.R11 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R11 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R12_FAMILY)
OOS_NAMES.update({n: lit.R12_REASON[fe] for n, src, cat, fe in lit.R12 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R12 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R13_FAMILY)
OOS_NAMES.update({n: lit.R13_REASON[fe] for n, src, cat, fe in lit.R13 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R13 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R14_FAMILY)
OOS_NAMES.update({n: lit.R14_REASON[fe] for n, src, cat, fe in lit.R14 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R14 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R15_FAMILY)
OOS_NAMES.update({n: lit.R15_REASON[fe] for n, src, cat, fe in lit.R15 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R15 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R16_FAMILY)
OOS_NAMES.update({n: lit.R16_REASON[fe] for n, src, cat, fe in lit.R16 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R16 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R17_FAMILY)
OOS_NAMES.update({n: lit.R17_REASON[fe] for n, src, cat, fe in lit.R17 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R17 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R18_FAMILY)
OOS_NAMES.update({n: lit.R18_REASON[fe] for n, src, cat, fe in lit.R18 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R18 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R19_FAMILY)
OOS_NAMES.update({n: lit.R19_REASON[fe] for n, src, cat, fe in lit.R19 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R19 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R20_FAMILY)
OOS_NAMES.update({n: lit.R20_REASON[fe] for n, src, cat, fe in lit.R20 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R20 if fe == "S"}
GROUP_FAMILY["toolkit"].update(lit.R21_FAMILY)
OOS_NAMES.update({n: lit.R21_REASON[fe] for n, src, cat, fe in lit.R21 if fe != "S"})
R9_SHADER |= {n for n, src, cat, fe in lit.R21 if fe == "S"}
OOS_NAMES.update({n: lit.R9_REASON[fe] for n, src, cat, fe in lit.R9 if fe != "S"})
for src, group, name, url, note in aliases:
    nn = norm(name)
    eid = alias_to_engine.get(nn) if src != "textools" else note.split(" ")[-1]
    if src == "instagram" and ("ig_" + name.replace("-", "")) in ENGINE:
        rec = canon["engine:ig_" + name.replace("-", "")]; rec["recipe"] = RECIPES.get(name)
    elif src == "instagram":
        rec = get_canon("ig:" + name, name={"xpro-ii": "X-Pro II", "lofi": "Lo-Fi", "poprocket": "Poprocket"}.get(name, name.title()),
                        family="Film", engine_id=None, status="planned", reason="", recipe=RECIPES.get(name))
    elif eid and ("engine:" + eid) in canon:  # done-maps may name ids not spliced yet -> stay planned
        rec = canon["engine:" + eid]
    else:
        key = norm(SYN.get(nn, name))
        fam = (PDN_GROUP.get(group.split("/")[-1].strip(), "Stylize") if src == "paintnet" and group != "Adjustments"
               else GROUP_FAMILY.get(src, {}).get(group, {"literature": "Edges", "pbr": "Materials", "lightroom": "Tone"}.get(src, "Stylize")))
        why = OOS_NAMES.get(SYN.get(nn, name)) or ("" if name in R9_SHADER else oos_reason(name, group))
        rec = get_canon("n:" + key, name=SYN.get(nn, name), family=fam, engine_id=None,
                        status="out_of_scope" if why else "planned", reason=why)
    rec["aliases"].append({"app": APP[src], "menu": group, "name": name, "url": url, "note": note})
    rec["sources"].add(APP[src])

for k, r in canon.items():
    if k.startswith("engine:"):
        r["aliases"].insert(0, {"app": "Filter Nexus", "menu": FAMILY_LABEL[r["family"]], "name": r["name"], "url": "", "note": ""})
        r["sources"].add("Filter Nexus")

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

rows, used = [], set()
for k, r in canon.items():
    fid = r["engine_id"] or slug(r["name"])
    while fid in used:
        fid += "-2"
    used.add(fid)
    rows.append({"id": fid, "name": r["name"], "family": FAMILY_LABEL.get(r["family"], r["family"]), "status": r["status"],
                 "engine_id": r["engine_id"], "reason": r["reason"], "apps": sorted(r["sources"]),
                 "aliases": r["aliases"], "recipe": r.get("recipe")})
rows.sort(key=lambda r: (r["family"], r["name"].lower()))

# ---------------------------------------------------------------- write
db_path = ROOT / "filters.db"
if db_path.exists():
    db_path.unlink()
db = sqlite3.connect(db_path)
db.executescript("""
CREATE TABLE filter (id TEXT PRIMARY KEY, name TEXT NOT NULL, family TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('implemented','planned','out_of_scope')),
  engine_id TEXT, reason TEXT, app_count INTEGER);
CREATE TABLE alias (filter_id TEXT REFERENCES filter(id), app TEXT, menu TEXT, name TEXT, url TEXT, note TEXT);
CREATE TABLE recipe (filter_id TEXT REFERENCES filter(id), kind TEXT, data TEXT);
CREATE INDEX alias_name ON alias(name);
CREATE VIEW by_app AS SELECT app, COUNT(*) n FROM alias GROUP BY app;
""")
for r in rows:
    db.execute("INSERT INTO filter VALUES (?,?,?,?,?,?,?)", (r["id"], r["name"], r["family"], r["status"], r["engine_id"], r["reason"], len(r["apps"])))
    for a in r["aliases"]:
        db.execute("INSERT INTO alias VALUES (?,?,?,?,?,?)", (r["id"], a["app"], a["menu"], a["name"], a["url"], a["note"]))
    if r["recipe"]:
        db.execute("INSERT INTO recipe VALUES (?,?,?)", (r["id"], "css-filter", json.dumps(r["recipe"])))
db.commit()
(ROOT / "filters.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding="utf-8")

st = Counter(r["status"] for r in rows)
fam = defaultdict(Counter)
for r in rows:
    fam[r["family"]][r["status"]] += 1
print(f"filters: {len(rows)}  aliases: {sum(len(r['aliases']) for r in rows)}  " + "  ".join(f"{k}={v}" for k, v in st.items()))
for f_, c in sorted(fam.items()):
    print(f"  {f_:<18} impl={c['implemented']:<3} planned={c['planned']:<4} oos={c['out_of_scope']}")
print("aliases by app:", dict(db.execute("SELECT app, n FROM by_app ORDER BY n DESC").fetchall()))
