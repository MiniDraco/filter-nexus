"""Photoshop names: Filter menu as read from Adobe's 'Filter effects reference'
(helpx.adobe.com/photoshop/using/filter-effects-reference.html, read 2026-10-16),
plus the Filter menus and Image > Adjustments items that page does not list."""
import json
from pathlib import Path

URL = "https://helpx.adobe.com/photoshop/using/filter-effects-reference.html"
SCRAPED = {
    "Artistic": ["Colored Pencil", "Cutout", "Dry Brush", "Film Grain", "Fresco", "Neon Glow", "Paint Daubs", "Palette Knife",
                 "Plastic Wrap", "Poster Edges", "Rough Pastels", "Smudge Stick", "Sponge", "Underpainting", "Watercolor"],
    "Blur": ["Average", "Blur", "Blur More", "Box Blur", "Gaussian Blur", "Lens Blur", "Motion Blur", "Radial Blur", "Shape Blur",
             "Smart Blur", "Surface Blur"],
    "Brush Strokes": ["Accented Edges", "Angled Strokes", "Crosshatch", "Dark Strokes", "Ink Outlines", "Spatter", "Sprayed Strokes", "Sumi-e"],
    "Distort": ["Diffuse Glow", "Displace", "Glass", "Ocean Ripple", "Pinch", "Polar Coordinates", "Ripple", "Shear", "Spherize",
                "Twirl", "Wave", "ZigZag"],
    "Noise": ["Add Noise", "Despeckle", "Dust & Scratches", "Median", "Reduce Noise"],
    "Pixelate": ["Color Halftone", "Crystallize", "Facet", "Fragment", "Mezzotint", "Mosaic", "Pointillize"],
    "Render": ["Clouds", "Difference Clouds", "Fibers", "Lens Flare"],
    "Sharpen": ["Sharpen", "Sharpen More", "Sharpen Edges", "Unsharp Mask", "Smart Sharpen"],
    "Sketch": ["Bas Relief", "Chalk & Charcoal", "Charcoal", "Chrome", "Conté Crayon", "Graphic Pen", "Halftone Pattern",
               "Photocopy", "Plaster", "Reticulation", "Stamp", "Torn Edges", "Water Paper"],
    "Stylize": ["Diffuse", "Emboss", "Extrude", "Find Edges", "Glowing Edges", "Solarize", "Tiles", "Trace Contour", "Wind"],
    "Texture": ["Craquelure", "Grain", "Mosaic Tiles", "Patchwork", "Stained Glass", "Texturizer"],
    "Video": ["De-Interlace", "NTSC Colors"],
    "Other": ["Custom", "High Pass", "Maximum", "Minimum", "Offset"],
}
# Not on that page: current Filter menu additions and Image > Adjustments (Photoshop 2024-2026 menus).
EXTRA = {
    "Blur Gallery": ["Field Blur", "Iris Blur", "Tilt-Shift", "Path Blur", "Spin Blur"],
    "Render": ["Lighting Effects", "Flame", "Picture Frame", "Tree"],
    "Stylize": ["Oil Paint"],
    "Sketch": ["Note Paper"],
    "Sharpen": ["Shake Reduction"],
    "Other": ["HSB/HSL"],
    "3D (removed 2024)": ["Generate Bump Map", "Generate Normal Map", "New Mesh from Layer › Depth Map"],
    "Adjustments": ["Brightness/Contrast", "Levels", "Curves", "Exposure", "Vibrance", "Hue/Saturation", "Color Balance",
                    "Black & White", "Photo Filter", "Channel Mixer", "Color Lookup", "Invert", "Posterize", "Threshold",
                    "Gradient Map", "Selective Color", "Shadows/Highlights", "HDR Toning", "Desaturate", "Match Color",
                    "Replace Color", "Equalize"],
}
rows = [{"name": n, "group": g, "url": URL} for g, ns in SCRAPED.items() for n in ns]
rows += [{"name": n, "group": g, "url": "", "note": "menu item not on the reference page"} for g, ns in EXTRA.items() for n in ns]
Path(__file__).with_name("raw").joinpath("photoshop.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding="utf-8")
print("photoshop:", len(rows))
