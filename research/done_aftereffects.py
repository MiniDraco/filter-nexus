"""aftereffects: round-10 After Effects queue names -> engine ids (batch_aftereffects.js, batch_aftereffects2.js, batch_aftereffects3.js + 3 existing ids)."""
DONE_PART = {
    'ae_colorama': ['Colorama'],
    'ae_toner': ['Tritone', 'CC Toner'],
    'ae_broadcast': ['Broadcast Colors'],
    'ae_coloroffset': ['CC Color Offset'],
    'ae_thresholdrgb': ['CC Threshold RGB'],
    'ae_neutralizer': ['CC Color Neutralizer'],
    'ae_colorkey': ['Color Difference Key', 'Keylight', 'Linear Color Key'],
    'ae_spill': ['Spill Suppressor'],
    'ae_matte': ['Set Matte', 'Simple Choker', 'Matte Choker'],
    'ae_noisehls': ['Noise HLS'],
    'ae_noisealpha': ['Noise Alpha'],
    'ae_wireremoval': ['CC Simple Wire Removal'],
    'ae_interlaceflicker': ['Reduce Interlace Flicker'],
    'ae_turbdisplace': ['Turbulent Displace'],
    'ae_bend': ['CC Bend It', 'CC Bender', 'Bezier Warp', 'CC Slant', 'CC Split', 'CC Cylinder'],
    'ae_pointwarp': ['CC Smear', 'CC Flo Motion', 'CC Ripple Pulse'],
    'ae_tiles': ['Motion Tile', 'CC Griddler', 'CC HexTile', 'CC Ball Action', 'Card Dance'],
    'ae_bumpshade': ['CC Glass', 'CC Plastic', 'CC Blobbylize', 'CC Environment'],
    'ae_channelblur': ['Channel Blur'],
    'ae_crossblur': ['CC Cross Blur'],
    'ae_vectorblur': ['CC Vector Blur'],
    'ae_roughedges': ['Roughen Edges'],
    'ae_vegas': ['Vegas (outline stroke)'],
    'ae_radialshadow': ['Radial Shadow'],
    'ae_smoothie': ['CC Mr. Smoothie'],
    'ae_4colorgrad': ['4-Color Gradient'],
    'ae_light': ['CC Light Sweep', 'CC Spotlight', 'Beam'],
    'ae_radiowaves': ['Radio Waves'],
    'ae_starburst': ['CC Star Burst'],
    # existing filters that already do the job
    'emboss': ['Color Emboss'],          # Mode = Color: relief added to the colour image (AE Color Emboss)
    'lightrays': ['CC Light Burst 2.5'],  # radial streaks from bright pixels toward a centre
    'clipwarn': ['CC Overbrights'],       # over-bright / clipped value warning
}
