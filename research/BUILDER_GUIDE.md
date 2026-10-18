# Filter Nexus — guide for parallel filter builders

You build new GPU filters as a **batch file** and test it in a **private copy**. Never edit `index.html` directly — the
orchestrator splices finished batches in one at a time. Work from `C:\Users\gamma\Documents\Claude\Projects\nexus\filter-nexus`.
Python: `C:\Python314\python.exe`. Node: `C:\Program Files\nodejs\node.exe` (put it on PATH for the harness).

## Files you may create (only these)
- `research/batch_<yourname>.js` — your filters (one or more files, all prefixed `batch_<yourname>`).
- `research/done_<yourname>.py` — `DONE_PART = {"engine_id": ["exact queue name", ...], ...}` listing every queue name you
  covered, spelled **exactly** as in `research/round9_list.py` / `round10_list.py` (copy-paste). You may also map a queue name
  to an **existing** filter id when that filter already does the job (check first: `python cli/nexus.py list --search <word>`,
  `python cli/nexus.py info <id>`).
- scratch images/sheets under `%TEMP%\nexus_test\<yourname>\`.

Do NOT edit: index.html, cli/*, research/round*_list.py, research/round9_done.py, literature.py, build_db.py, other builders' files.

## Machine load (up to 30 builders run at once)
Wrap every render / numpy-heavy check in the shared throttle so at most 4 heavy jobs run machine-wide:
`python research/heavy.py python cli/nexus.py apply ...` (testbatch already uses it and now tests only your batch's ids).
Render at --max-edge 400 or less, one command at a time.

## Research tools
Use WebFetch / WebSearch for docs and sources. Never disable TLS verification (no `curl -k`, no `verify=False`); if a site's certificate fails, use another source or skip. Do NOT use the in-app browser tools (mcp__Claude_Browser__*): that pane is shared with the orchestrator's WebGL tests.

## Test loop
```
python research/testbatch.py research/batch_<yourname>.js      # splices into research/wip/<batch>/, exports, headless selftest
set NEXUS_SHADERS=<path printed by testbatch>                     # (bash: NEXUS_SHADERS=... python cli/nexus.py ...)
python cli/nexus.py apply in.png -f "id:Param=value,Other=value" -o out.png [--max-edge 400] [--depth depth.png]
```
`testbatch` must end with `0 problems`. Then render every filter (and its main modes) on suitable test images, paste them into
a contact sheet with PIL, **look at it** (Read the image) and fix anything wrong, too weak, saturated, or noisy. Test images in
`%TEMP%\nexus_test\`: photo.png (real photo), scene.png + scene_depth.png (synthetic spheres + exact depth), bin.png (binary
shapes), sprite.png (pixel art at 6×), stars.png (star field), vessels.png (dark curvy lines), noisy.png, speck.png, dark.png.
The machine is shared with heavy jobs: render serially, keep images ≤ 512 px, and if
`python C:\Users\gamma\Documents\Claude\Projects\vitals\vitals.py check` shows RAM ≥ 90% wait a minute before rendering.

## Batch file format (plain JS appended inside the filter library)
```js
/* ================= <yourname>: what this batch is ================= */
f = add('Tone');   // family: Insta Depth Tone Color Film Paint Blur Sharpen Repair Edges Materials Stylize Retro Distort Frames Noise Render Terrain Sensor Augment Analysis
f('myid','Display Name',[P('Amount',0,1,.5,.01), S('Mode',['A','B']), P('Radius',1,40,8,1,'px')],
  `return vec4(c.rgb*u_p0,1.);`,                       // one pass = GLSL body of vec4 F(vec2 uv){ vec4 c=T(uv); ... }
  'short note: method / paper / "approx." if approximate', seeded /* optional: true if it uses u_seed */);
f('multi','Multi Pass',[P('Radius',1,40,8,1,'px')],[BH('u_p0'), BV('u_p0'), `return vec4(O(uv).rgb-T(uv).rgb+.5,1.);`],'note');
```
- Max **4 params** (u_p0..u_p3). `P(label,min,max,def,step,unit)`, `S(label,[options],defIndex)` → u_pN is the option index (float).
- Ids: lowercase `[a-z0-9_]`, must not exist yet (testbatch refuses clashes). Prefer descriptive ids; JS `const` helper names must be unique too (prefix them with your name).

## GLSL helpers available (ES 3.00, also run as desktop GL 3.30)
`T(uv)` previous pass · `O(uv)` the filter's input image · `D(uv)` depth 0..1 (1 = near; only for family 'Depth') ·
`L(uv)`=luma(T(uv)) · `luma(rgb)` · `u_px` texel size · `u_res` working resolution · `u_k` scale (use `R(px)`=px*u_k for any pixel
radius param) · `PX(uv)` → working-pixel coords, `fromPX(p)` back · `asp()` aspect · `u_seed` · `hash(vec2)` `vnoise(vec2)` `fbm(vec2)` ·
`ramp(int 0..4, t)` colormaps (1 = inferno, 2 = viridis) · `stops5(c0..c4,t)` · `rgb2hsv/hsv2rgb`, `rgb2hsl/hsl2rgb` · `sobel(uv)` (vec2)
· `ring8(uv,out float r[8])` · `blurL(uv,d)` 5×5 luma blur with spacing d · `blur1d/box1d(u_tex,uv,dir,r)`.
JS templates: `BH(r)`,`BV(r)` separable Gaussian passes (r = GLSL expr string like 'u_p0'), `LIN(v)`/`SRGB(v)` sRGB↔linear expression
strings, `MM1(dir,r,erode)` separable min/max pass (dir 'vec2(1.,0.)'), `HESS2(sig)` scale-normalised Hessian snippet (defines
hxx,hyy,hxy,gx,gy,l1,l2), `BINF(thr,pol)` defines macro BIN(q) = binary foreground from O.

## Pitfalls that already bit us (avoid them)
1. **In passes after the first, T()/L() read the previous pass, not the image.** Read the image with `O(uv)`/`luma(O(q).rgb)`.
2. WebGL is strict: no implicit int→float (`float(i)`, write `1.` not `1`), loop bounds must be constant (use `if(i>=n)break;`).
3. Macros: parenthesise every argument use; never name macro params x/y/z/r/g/b/s/t (they replace swizzles like `.x`);
   put `#define` on its own line (start the line with a newline inside the template string).
4. Carry state between passes in RGBA channels (alpha is kept between intermediate passes since 2026-10-17; the last pass is forced opaque); storage is half-float, or 8-bit on some GPUs → store signed values as `.5+.5*v`.
10. GLSL ES reserved words compile on desktop GL but fail in WebGL — never name variables `cast`, `input`, `output`, `filter`, `sample`, `common`, `partition`, `active`, `class`, `union`, `enum`, `typedef`, `template`, `this`, `packed`, `goto`, `inline`, `noinline`, `volatile`, `public`, `static`, `extern`, `external`, `interface`, `long`, `short`, `double`, `half`, `fixed`, `unsigned`, `superp`, `namespace`, `using`, `asm`, `sizeof`, `resource`.
9. Parameter and option labels: ASCII only (e.g. "Scale (sigma)", not "σ"), so the CLI can set them.
5. Multi-pass propagation (flood fill, reconstruction) reaches only N px for N passes of 3×3 — use path-checked jumps
   (steps 32,16,8,4,2,1 with a min/check along the path) when you need whole-image reach.
6. Keep per-pixel loops ≲ 1500 texture taps; whole-image statistics: sample a 12×12–16×16 grid of `O()`.
7. Defaults must look good on photo.png at strength 1 (not black, not saturated). Calibrate gains against the contact sheet.
8. Be honest: if something is an approximation, say "approx." in the note; if a queue item genuinely needs FFT / a neural net /
   multiple images / sequential processing, don't fake it — leave it out and list it in your report as "skipped: reason".

## Report (final message)
Ids built (one line each: id — what it covers), the done-map file name and count of queue names covered, anything skipped and
why, and the last `testbatch` result line. Keep it short.
