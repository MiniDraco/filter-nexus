/* ================= q07: RetroArch slang misc colour shaders (color-mangler, colorimetry, chromaticity, patchy-color, NES decoder, gamma ramps, natural-vision, night-mode, accessibility, gendither) ================= */
/* Patchy Color: per-demodulator YUV->RGB matrices, computed exactly as yuvAxisMatrix() in patchy-color.slang (hue + saturation re-centred on the 6 colour bars) */
const Q07_PATCHY = (() => {
  const pi = Math.PI, Uup = 2.03206187221989, angFix = -123 / 180 * pi, d = x => x / 180 * pi;
  const sets = [[d(33), 1.13983, -1.979, .70203, d(123), 2.03211], [d(33), 1.28033, -2.085, .43703, d(123), 2.12798],
    [d(123 - 95), .78, d(123 - 240), .3, d(123), 1], [d(123 - 98), .78, d(123 - 243), .31, d(123), 1], [d(123 - 104), .96, d(123 - 235), .36, d(123), 1],
    [d(123 - 104), .91, d(123 - 240), .31, d(123), 1], [d(123 - 112), .84, d(123 - 237), .33, d(123), 1], [d(123 - 112), .83, d(123 - 252), .3, d(123), 1],
    [d(123 - 114), .78, d(123 - 255), .31, d(123), 1]];
  const inv = m => { const [a, b, c] = m[0], [e, f_, g] = m[1], [h, i, j] = m[2]; const A = f_ * j - g * i, B = -(e * j - g * h), C = e * i - f_ * h, det = a * A + b * B + c * C;
    return [[A / det, -(b * j - c * i) / det, (b * g - c * f_) / det], [B / det, (a * j - c * h) / det, -(a * g - c * e) / det], [C / det, -(a * i - b * h) / det, (a * f_ - b * e) / det]]; };
  const mul = (m, v) => m.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  const std = [[.299, .587, .114], [-.14713, -.28886, .436], [.615, -.51499, -.10001]];
  return sets.map(([ro, rm, go, gm, bo, bm]) => {
    const amps = [rm * Uup / bm, gm * Uup / bm, Uup]; let offs = [ro, go, bo].map(o => -(o + angFix));
    const build = () => [0, 1, 2].map(k => [1, amps[k] * Math.cos(offs[k]), amps[k] * Math.sin(offs[k])]);
    let to = build(), from = inv(to), rs = 0;
    for (let i = 1; i <= 6; i++) { const bar = [i & 1, (i >> 1) & 1, i >> 2], j = mul(from, bar), s = mul(std, bar); let r = Math.atan2(j[2], j[1]) - Math.atan2(s[2], s[1]);
      while (r > pi) r -= 2 * pi; while (r < -pi) r += 2 * pi; rs += r; }
    offs = offs.map(o => o - rs / 6); to = build(); from = inv(to); let prop = 1;
    for (let i = 1; i <= 6; i++) { const bar = [i & 1, (i >> 1) & 1, i >> 2], j = mul(from, bar), s = mul(std, bar); prop *= Math.hypot(j[1], j[2]) / Math.hypot(s[1], s[2]); }
    prop = prop ** (1 / 6); const M = to.map(r => [r[0], r[1] * prop, r[2] * prop]);
    return `mat3(${[0, 1, 2].map(c => [0, 1, 2].map(r => M[r][c].toFixed(6)).join(',')).join(',')})`;
  });
})();
/* NES PPU composite palette (Bisqwit generator as in nes-color-decoder.slang): per colour the mean level and the I/Q phase sums of the 12-sample square wave */
const Q07_NES = (() => {
  const lv = [.350, .518, .962, 1.550, 1.094, 1.506, 1.962, 1.962], out = [], seen = new Set();
  for (let level = 0; level < 4; level++) for (let color = 0; color < 16; color++) {
    const L = color < 14 ? level : 1, low = lv[L + 4 * (color === 0)], high = lv[L + 4 * (color < 13)]; let m = 0, I = 0, Q = 0;
    for (let p = 0; p < 12; p++) { const v = ((((color + p + 8) % 12) < 6 ? high : low) - .518) / (1.962 - .518); m += v / 12; I += v * Math.cos(Math.PI / 6 * p) / 12; Q += v * Math.sin(Math.PI / 6 * p) / 12; }
    const k = `vec3(${m.toFixed(5)},${I.toFixed(5)},${Q.toFixed(5)})`; if (!seen.has(k)) { seen.add(k); out.push(k); }
  }
  return out;
})();
const Q07_RAMP = '0.,1.,3.,6.,10.,15.,21.,28.,36.,45.,55.,66.,78.,91.,105.,120.,136.,144.,152.,160.,168.,176.,184.,192.,200.,208.,216.,224.,232.,240.,248.,255.';

f = add('Color');
f('q07_colormangler','Color Mangler / YIQ Hue (RetroArch misc)',[P('Saturation',0,3,1.2,.01),P('Contrast',0,2,1,.01),P('Gamma boost (red up / blue down)',-1,1,.15,.01),P('Hue (YIQ)',-180,180,0,1,'°')],
 `float st=u_p0;vec4 scr=pow(vec4(max(O(uv).rgb,0.),1.),vec4(2.2));scr=mix(scr,vec4(.5),1.-u_p1);
  mat4 col=mat4(1.,0.,0.,0., 0.,1.,0.,0., 0.,0.,1.,0., 0.,0.,0.,0.);
  mat4 adj=mat4((1.-st)*.2126+st,(1.-st)*.2126,(1.-st)*.2126,1., (1.-st)*.7152,(1.-st)*.7152+st,(1.-st)*.7152,1., (1.-st)*.0722,(1.-st)*.0722,(1.-st)*.0722+st,1., 0.,0.,0.,1.);
  col*=adj;scr=col*clamp(scr,0.,1.);
  vec3 o=pow(max(scr.rgb,0.),vec3(1.)/(vec3(2.2)-vec3(u_p2,0.,-u_p2)));
  vec3 yiq=vec3(dot(o,vec3(.299,.587,.114)),dot(o,vec3(.596,-.274,-.322)),dot(o,vec3(.211,-.523,.312)));
  float hr=radians(u_p3);yiq.yz=vec2(yiq.y*cos(hr)-yiq.z*sin(hr),yiq.y*sin(hr)+yiq.z*cos(hr));
  o=vec3(dot(yiq,vec3(1.,.956,.621)),dot(yiq,vec3(1.,-.272,-.647)),dot(yiq,vec3(1.,-1.106,1.703)));
  return vec4(clamp(o,0.,1.),1.);`,
 'color-mangler.slang (hunterk): linearise with gamma 2.2, contrast toward 0.5, Rec.709 saturation matrix, per-channel output gamma 1/(2.2-boost); then yiq-hue-adjustment.slang (Cesium hue rotation in YIQ)');

f('q07_crtcolorimetry','CRT Colorimetry / Chromaticity (RetroArch misc)',[S('Shader',['colorimetry (Drag NES palgen)','chromaticity (W. M. Martinez)']),S('Primaries',['NTSC 1953','SMPTE C','sRGB','Rec 709','EBU','BT 2020','SMPTE 240M']),S('White point',['D93','D65','D50','D55','D75']),S('Clipping (colorimetry)',['Clamp','Hue-preserving darken','Hue-preserving desaturate'])],
 `vec3 cq=O(uv).rgb;int pm=int(u_p1+.5),wm=int(u_p2+.5),cm=int(u_p3+.5);
  vec2 pr=vec2(.64,.33),pg=vec2(.30,.60),pb=vec2(.15,.06);
  if(pm==0){pr=vec2(.67,.33);pg=vec2(.21,.71);pb=vec2(.14,.08);}else if(pm==1||pm==6){pr=vec2(.63,.34);pg=vec2(.31,.595);pb=vec2(.155,.07);}
  else if(pm==4){pg=vec2(.29,.60);}else if(pm==5){pr=vec2(.708,.292);pg=vec2(.17,.797);pb=vec2(.131,.046);}
  #define Q07XYZ1(p_) vec3((p_).x/(p_).y,1.,(1.-(p_).x-(p_).y)/(p_).y)
  mat3 Pm=mat3(Q07XYZ1(pr),Q07XYZ1(pg),Q07XYZ1(pb));
  mat3 toS=mat3(3.2406255,-0.9689307,0.0557101,-1.5372080,1.8758561,-0.2040211,-0.4986286,0.0415175,1.0569959);
  if(u_p0<.5){vec2 wp=wm==0?vec2(.31,.316):wm==1?vec2(.3127,.329):wm==2?vec2(.3457,.3585):wm==3?vec2(.3324,.3474):vec2(.2990,.3149);
   vec3 Sv=inverse(Pm)*Q07XYZ1(wp);vec3 o=toS*(Pm*(Sv*cq));
   if(cm==1){float mx=max(o.r,max(o.g,o.b));if(mx>1.)o/=mx;}
   else if(cm==2){float mx=max(o.r,max(o.g,o.b));if(mx>1.)o=(o-1.)/mx+1.;}
   return vec4(clamp(o,0.,1.),1.);}
  int md=pm==0?5:pm==1?1:pm==2?0:pm==3?2:pm==4?6:pm==5?3:4;
  vec4 ti=md==0?vec4(.04045,.055,12.92,2.4):md==3?vec4(.018,.099,4.5,2.2):md==4?vec4(.0913,.1115,4.,2.2):vec4(.081,.099,4.5,2.2);
  vec4 to=md==0?vec4(.00313,.055,12.92,2.4):md==4?vec4(.0228,.1115,4.,2.2):vec4(.018,.099,4.5,2.2);
  vec3 Wl=(md==2||md==4)?vec3(.2126,.7152,.0722):md==3?vec3(.2627,.678,.0593):vec3(.299,.587,.114);
  vec3 y=mix(pow((cq+ti.y)/(1.+ti.y),vec3(ti.w)),cq/ti.z,step(cq,vec3(ti.x)-1e-7));
  vec3 o=clamp((toS*Pm)*(Wl*y),0.,1.);
  o=mix((1.+to.y)*pow(o,vec3(1./to.w))-to.y,to.z*o,step(o,vec3(to.x)));
  vec3 tw=wm==1?vec3(.95047,1.,1.0888):wm==2?vec3(.964,1.,.8252):wm==3?vec3(.95682,1.,.92149):wm==4?vec3(.94972,1.,1.22638):vec3(1.);
  return vec4(clamp(o*tw,0.,1.),1.);`,
 'colorimetry.slang (Drag palette generator: CRT primaries + white -> XYZ -> sRGB on the gamma-encoded signal, 3 clip modes) and chromaticity.slang (per-standard transfer, luminance-weighted xyY primaries, output transfer, white XYZ scale; D93 = no scale there). EBU / BT.2020 / SMPTE 240M / D50-D75 in colorimetry use the same Drag maths with those chromaticities');

f('q07_patchycolor','Patchy Color (consumer CRT colour decoders)',[S('Demodulator',['BT.470 (standard)','BT.709','Japan (95 / 240 deg)','Japan (98 / 243 deg)','US (104 / 235 deg)','US (104 / 240 deg)','US (112 / 237 deg)','US (112 / 252 deg)','US (114 / 255 deg)'],6),P('Color (saturation)',0,3,1,.01),P('Tint',-45,45,0,.5,'°'),S('Gamma',['BT.1886 + black lift fix','BT.1886','Power 2.4','sRGB'],1)],
 `vec3 cq=O(uv).rgb;int dm=int(u_p0+.5);mat3 toR=${Q07_PATCHY[0]};
  ${Q07_PATCHY.slice(1).map((m, i) => `if(dm==${i + 1})toR=${m};`).join('')}
  mat3 toY=mat3(0.299,-0.14713,0.615,0.587,-0.28886,-0.51499,0.114,0.436,-0.10001);
  vec3 yuv=toY*cq;float tn=-u_p2*3.14159265/180.;yuv.yz=vec2(yuv.y*cos(tn)-yuv.z*sin(tn),yuv.y*sin(tn)+yuv.z*cos(tn))*u_p1;
  vec3 v=toR*yuv;int gm=int(u_p3+.5);float br=-.05,ct=.85;vec3 o;
  if(gm==0){float bl=.0381629;float b=pow(bl,1./2.4);float a=pow(100.,1./2.4)-b;b=br*100./250.+b/a;float Lb=min(b*ct,.35);float k=ct/pow(1.+Lb,2.6);float sl=k*pow(.35+Lb,-.4);
   vec3 vb=max(v+Lb,0.);o=mix(sl*pow(vb,vec3(3.)),k*pow(vb,vec3(2.6)),step(.35,v));float bc=.00446395*pow(bl,1.23486);o=min(max(o-bc,0.)/(1.-bc),1.);o=pow(o,vec3(1.-.00843283*pow(bl,1.22744)));}
  else if(gm==1){float k=ct/pow(1.+br,2.6);vec3 vb=max(v+br,0.);o=mix(k*pow(.35+br,-.4)*pow(vb,vec3(3.)),k*pow(vb,vec3(2.6)),step(.35,v));}
  else if(gm==2){o=pow(max((v+br)/(1.+br),0.),vec3(2.4))*ct;}
  else{float cr=1.055*pow(ct,1./2.4)-.055;vec3 q=clamp((v+br)/(1.+br)*cr,0.,1.);o=mix(pow((q+.055)/1.055,vec3(2.4)),q/12.92,step(q,vec3(.04045)));}
  o=clamp(o,0.,1.);o=mix(1.055*pow(o,vec3(1./2.4))-.055,o*12.92,step(o,vec3(.0031308)));
  return vec4(o,1.);`,
 'patchy-color.slang (Patchy68k / PlainOldPants), "Other" console path: BT.470 YUV, tint + colour, jungle-chip demodulator axes (hue/saturation re-centred on the colour bars, matrices precomputed), contrast 0.85 / black -0.05, BT.1886 or power / sRGB EOTF; result re-encoded to sRGB for display');

f('q07_nescolor','NES Color Decoder (PPU composite palette)',[P('Saturation',0,3,1,.01),P('Hue',-180,180,0,1,'°'),S('Decoder and dither',['FCC matrix + Bayer dither','FCC matrix no dither','Sony CXA2025AS + Bayer dither','Sony CXA2025AS no dither']),P('Pixel size',1,8,2,1,'px')],
 `float B=max(R(u_p3),1.);vec2 cp=floor(uv*u_res/B);vec3 cq=O(clamp((cp+.5)*B,vec2(.5),u_res-.5)/u_res).rgb;int dm=int(u_p2+.5);
  const vec3 NP[${Q07_NES.length}]=vec3[${Q07_NES.length}](${Q07_NES.join(',')});
  if(dm==0||dm==2){vec2 q=mod(cp,4.);float b4=(bayer2(q)*4.+bayer2(floor(q*.5)))/4.;cq+=(b4-.47)*.16;}
  float hr=radians(u_p1),sa=u_p0;vec3 mi=dm<2?vec3(0.946882,0.623557,-0.274788):vec3(1.630,0.317,-0.378);vec3 mj=dm<2?vec3(-0.635691,-1.108545,1.709007):vec3(-0.466,-1.089,1.677);
  float bd=1e9;vec3 best=vec3(0.);
  for(int k=0;k<${Q07_NES.length};k++){vec3 e=NP[k];float y=e.x;float ii=(e.y*cos(hr)-e.z*sin(hr))*sa,qq=(e.z*cos(hr)+e.y*sin(hr))*sa;
   vec3 rgb=vec3(y+mi.x*ii+mi.y*qq,y+mi.z*ii+mj.x*qq,y+mj.y*ii+mj.z*qq);rgb=clamp(pow(max(rgb,0.),vec3(2.2/1.8)),0.,1.);
   vec3 df=rgb-cq;float dd=dot(df*df,vec3(.3,.59,.11));if(dd<bd){bd=dd;best=rgb;}}
  return vec4(best,1.);`,
 'nes-color-decoder.slang (Bisqwit NTSC palette generator): each of the 54 distinct PPU colours is built from its 12-sample square-wave levels (mean + I/Q phase sums, precomputed), with live saturation / hue, FCC or Sony CXA2025AS YIQ matrix and gamma 1.8; the image is mapped to the nearest generated colour per N-pixel block (the shader itself expects raw palette indices, so this quantising step is added)');

f('q07_retrotone','Retro Gamma Ramps & Tone (ss / bsnes ramp, natural-vision, night-mode, accessibility, gendither)',[S('Shader',['ss-gamma-ramp (Saturn)','bsnes-gamma-ramp (LUT)','natural-vision (ShadX)','night-mode (DariusG)','accessibility_mods protanopia','accessibility_mods deuteranopia','accessibility_mods tritanopia','gendither (4x4 + posterize)']),P('Strength (1 is shader default)',0,2,1,.01)],
 `vec3 cq=clamp(O(uv).rgb,0.,1.);int m=int(u_p0+.5);float s=u_p1;
  const float RP[32]=float[32](${Q07_RAMP});
  if(m==0){ivec3 ix=min(ivec3(floor(cq*256.)),ivec3(255))/8;vec3 rr=vec3(RP[ix.r],RP[ix.g],RP[ix.b])/255.;return vec4(clamp(mix(cq,rr,.5*s),0.,1.),1.);}
  if(m==1){vec3 x=cq*31.;ivec3 i0=ivec3(min(floor(x),vec3(30.)));vec3 fr=x-vec3(i0);
   vec3 rr=vec3(mix(RP[i0.r],RP[i0.r+1],fr.r),mix(RP[i0.g],RP[i0.g+1],fr.g),mix(RP[i0.b],RP[i0.b+1],fr.b))/255.;return vec4(clamp(mix(cq,rr,s),0.,1.),1.);}
  if(m==2){float g=1.+.1*s;vec3 v=pow(cq,vec3(2.2));v=v*mat3(.299,.587,.114,.595716,-.274453,-.321263,.211456,-.522591,.311135);
   v=vec3(pow(max(v.x,0.),g),v.y*g,v.z*g);v=clamp(v,vec3(0.,-.595716,-.522591),vec3(1.,.595716,.522591));v=v*mat3(1.,.95629572,.62102442,1.,-.27212210,-.64738060,1.,-1.10698902,1.70461500);
   return vec4(clamp(pow(max(v,0.),vec3(1./2.2)),0.,1.),1.);}
  if(m==3){vec3 v=cq*(1.-.2*s);v=vec3(v.r+.1*s,v.g,v.b-.1*s);return vec4(clamp(v,0.,1.),1.);}
  if(m<=6){float df=.5*s;mat3 toL=mat3(17.8824,43.5161,4.1193,3.4557,27.1554,3.8671,.02996,.18431,1.4670);mat3 toC=mat3(.0809,-.1305,.1167,-.0102,.0540,-.1136,-.0003,-.0041,.6935);
   vec3 L=toL*cq;vec3 dl=L;if(m==4)dl.r=2.02344*L.g-2.5281*L.b;if(m==5)dl.g=.494207*L.r+1.24827*L.b;if(m==6)dl.b=-.395913*L.r+.801109*L.g;
   vec3 dfc=cq-toC*dl;vec3 o=clamp(cq+vec3(0.,dfc.g+dfc.r,dfc.b+dfc.r),0.,1.);return vec4(mix(cq,o,df),1.);}
  vec2 dp=floor(PX(uv));int di=int(mod(dp.x,4.))*4+int(mod(dp.y,4.));float oy=(di/4)%2==0?float(di%2):(di%2==0?16.:15.);
  vec3 fi=cq+(floor(cq)*224.+oy)/255.;vec3 q=clamp(floor(fi*4.4)/4.4,0.,.875);return vec4(mix(cq,q,clamp(s,0.,1.)),1.);`,
 'ss-gamma-ramp.slang (bsnes/Saturn 32-entry gamma ramp, floor index, mixed at 150%), bsnes-gamma-ramp (ReShade LUT = same ramp, linear interpolation), natural-vision.slang (ShadX, gamma 2.2, YIQ gains 1.1), night_mode.slang, accessibility_mods.slang (LMS daltonize, strength 0.5), gendither.slang (4x4 offset table + 4.4-level posterize clamped to 0.875); strength 1 = each shader default');

/* ================= q07: RetroArch misc CRT / film / signal shaders ================= */
const Q07_FONT = {' ':[0,0],'-':[7,1572864],'.':[0,1560],'A':[935188,780450],'F':[2048263,1181728],'H':[1131799,1714338],'I':[921665,33308],'O':[935188,665756],'R':[1983767,1198242],'S':[935171,1058972],'V':[1131796,664840],
  'a':[224,649374],'c':[228,657564],'e':[228,772124],'g':[244,665474],'i':[262209,33292],'l':[266305,33292],'n':[452,1198372],'o':[228,665756],'p':[484,667424],'r':[354,590904],'s':[228,114844],'t':[8674,66824],'v':[276,664840],'w':[276,700308],'x':[292,1149220],'z':[480,1148988]};
const Q07_DIG = [[935221,731292],[274497,33308],[934929,1116222],[934931,1058972],[137380,1302788],[2048263,1058972],[401671,1190044],[2032673,66576],[935187,1190044],[935187,1581336]];
const Q07_STR = s => [...s].map(ch => `Q07CH(vec2(${Q07_FONT[ch][0]}.,${Q07_FONT[ch][1]}.))`).join('');

f = add('Retro');
f('q07_crtmisc','RetroArch Misc FX (convergence, pixel-weave, PAL VHS, film noise, blur-haze, EWA curvature, NormalsDisplacement, print-resolution)',[S('Shader',['convergence (DariusG)','pixel-weave-4x2 (crashGG)','pixel-weave-sync (crashGG)','mudlord-pal-vhs','film_noise (hunterk)','blur-haze (sh1nra358)','ewa_curvature (CRT warp + EWA filter)','NormalsDisplacement (ReShade port)','print-resolution (text overlay)']),P('Strength (1 is shader default)',0,3,1,.01),P('Source pixel size',1,8,2,1,'px')],
 `int m=int(u_p0+.5);float s=u_p1;float N=max(R(u_p2),1.);vec2 px=1./u_res;vec3 cq=O(uv).rgb;
  float FC=floor(fract(u_seed*.61803+.2)*700.)+31.;
  if(m==0){float rr=O(uv+px*N*s*vec2(.9,.05)).r,gg=O(uv+px*N*s*vec2(-.95,-.05)).g,bb=O(uv+px*N*s*vec2(.9,.05)).b;return vec4(mix(cq,vec3(rr,gg,bb),.5),1.);}
  if(m==1||m==2){float cY=.12*s,cX=.04*s;vec2 st=fromPX(vec2(1.));vec2 fc=floor(PX(uv))+.5;
   vec3 U=O(uv-vec2(0.,st.y)).rgb,Dn=O(uv+vec2(0.,st.y)).rgb,Lf=O(uv-vec2(st.x,0.)).rgb,Rt=O(uv+vec2(st.x,0.)).rgb;vec3 mY,mX;
   if(m==1){vec2 wv=step(.5,fract(fc*vec2(.5,.25)+.25))*2.-1.;vec3 sUD=step(max((cq-U)*wv.y,(cq-Dn)*wv.y),vec3(cY*.381966)),sLR=step(max((cq-Lf)*wv.x,(cq-Rt)*wv.x),vec3(cX*.381966));mY=cY*wv.y*sUD;mX=cX*wv.x*sLR;}
   else{float wy=-cos(6.2831853*fract(fc.y*2./max(u_p2,1.)));float wx=step(.5,fract(fc.x*.5))*2.-1.;
    vec3 sUD=step(max((cq-U)*sign(wy),(cq-Dn)*sign(wy)),vec3(cY*.381966)),sLR=step(max((cq-Lf)*wx,(cq-Rt)*wx),vec3(cX*.381966));
    float sl=clamp(abs(wy)*7.142857-5.5,0.,1.)*.618034;mY=cY*wy*mix(vec3(sl),vec3(1.),sUD);mX=cX*wx*sLR;}
   return vec4(cq+cq*(mX+mY)*2.*cq*(1.-cq),1.);}
  if(m==3){vec2 q=vec2(uv.x,1.-uv.y);float xi=(q.x*FC)*.1+(q.y*FC)*50.+FC;float rn=fract(sin(mod(dot(vec2(xi),vec2(12.9898,78.233)),3.14))*43758.5453);float sh=1.-rn*.5*s;
   mat3 ty=mat3(.299,-.147,.615,.587,-.289,-.515,.114,.436,-.100),tr=mat3(1.,1.,1.,0.,-.395,2.032,1.140,-.581,0.);vec3 yuv=vec3(0.);
   for(int x=10;x>=0;x--){float xx=float(x)/10.;float x1=(xx*-.05)*.3-.002,x2=(xx*.1)*.3-.002;vec3 mu=(vec3(1.)-pow(vec3(xx),vec3(.2,1.,1.)))*.2;
    yuv+=(ty*O(uv+vec2(x1,0.)).rgb)*mu+(ty*O(uv+vec2(x2,0.)).rgb)*mu;}
   yuv.r=yuv.r*.2+(ty*cq).r*.8;vec3 o=tr*yuv*sh;o*=mix(vec3(1.,.7,1.),vec3(.7,1.,.7),floor(mod(PX(uv).y,2.)));
   vec2 t=q-.5;t.x*=1.+pow(abs(t.y)/2.,2.);t.y*=1.+pow(abs(t.x)/2.,2.);vec2 p=2.*t;float ff=(1.-p.x*p.x)*(1.-p.y*p.y);
   o*=clamp(1.1*(pow(max(ff,0.),.35)-.3),0.,1.);return vec4(clamp(o,0.,1.),1.);}
  if(m==4){float tm=mod(FC,4268.);
   #define Q07H(n_) fract(sin(n_)*43758.5453123)
   vec2 cc=uv-.5;cc.y+=.003*Q07H(sin(mod(tm,403.)));float h3=cos(Q07H(mod(tm,361.)));
   float vg=smoothstep(0.,1.-.15,length(cc)/1.25);vec2 ro=cc+.01*vec2(.12,.07)+.5,go=cc+.01*vec2(-.06,-.08)+.5;
   vec3 fm=vec3(O(ro).r,O(go).g,O(ro).b);float bg=(fm.g+fm.b*.7)/2.;fm=mix(fm,vec3(fm.r,bg,.7*bg),.5*s);
   float gx=(uv.x+4.)*(uv.y+4.)*((mod(tm/10.,800.)+10.)*10.);fm+=(mod((mod(gx,13.)+1.)*(mod(gx,123.)+1.),.01)-.005)*24.*min(s,1.);
   float vm=1.+.1*h3;fm*=mix(1.,1.-vg,vm);fm+=((1.-vg)*.2)*vm;return vec4(clamp(fm,0.,1.),1.);}
  if(m==5){vec2 ps=N*px;const float so[5]=float[5](0.,1.4347826,3.3478260,5.2608695,7.1739130);const float sw[5]=float[5](.16818994,.27276957,.11690125,.024067905,.0021112196);
   vec3 col=cq*sw[0];for(int i=1;i<5;i++){vec2 d=vec2(so[i]*2.*ps.x,so[i]*ps.y);col+=(O(uv+d).rgb+O(uv-d).rgb+O(uv+vec2(-d.x,d.y)).rgb+O(uv+vec2(d.x,-d.y)).rgb)*sw[i];}
   vec3 bl=.5*col;vec3 o=mix(cq,bl,.3*s);o=(o+mix(o,bl*4.,.33*s))*.5;return vec4(clamp(o,0.,1.),1.);}
  if(m==6){vec2 Ds=vec2(.031,.041)*s*15.;
   #define Q07WP(tc,OUT) {vec2 cv=(tc)*2.-1.;float cd=max(length(cv),1e-5);cv/=cd;cv*=1.-pow(vec2(max(1.-cd/1.41421356,0.)),1./(1.+Ds*.2));cv/=1.-pow(vec2(.29289321881),1./(1.+Ds*.2));OUT=cv*.5+.5;}
   vec2 w0,wx,wy;Q07WP(uv,w0)Q07WP(uv+vec2(px.x,0.),wx)Q07WP(uv+vec2(0.,px.y),wy)
   if(any(lessThan(w0,vec2(0.)))||any(greaterThan(w0,vec2(1.))))return vec4(0.,0.,0.,1.);
   vec2 du=(wx-w0)*u_res,dv=(wy-w0)*u_res;float ux=.8*du.x,vx=.8*du.y,uy=.8*dv.x,vy=.8*dv.y;
   float A=vx*vx+vy*vy+1.,Bq=-2.*(ux*vx+uy*vy),C=ux*ux+uy*uy+1.,F=A*C-Bq*Bq/4.;vec2 p=w0*u_res-.5;vec2 pi=floor(p);vec3 num=vec3(0.);float den=0.;
   for(int j=-3;j<=4;j++)for(int i=-3;i<=4;i++){vec2 tq=pi+vec2(float(i),float(j));float U=tq.x-p.x,V=tq.y-p.y;float q=A*U*U+Bq*U*V+C*V*V;
    if(q<F){float w=exp(-q/F);num+=w*O((tq+.5)/u_res).rgb;den+=w;}}
   vec3 o=den>0.?num/den:O(w0).rgb;o=pow(max(o,0.),vec3(2.2));vec2 mp=floor(PX(uv)*1.000001+.5);float mx=fract((mp.x+mp.y*3.)/6.);
   vec3 mk=vec3(.5);if(mx<.333)mk.r=1.5;else if(mx<.666)mk.g=1.5;else mk.b=1.5;return vec4(clamp(pow(o*mk,vec3(1./2.2)),0.,1.),1.);}
  if(m==7){vec2 cd=uv-.5;vec2 nm=.5*vec2(sin(3.6*cd.x)*cos(2.25*cd.y),sin(3.6*cd.y)*cos(2.25*cd.x));vec2 q=(uv-nm*R(20.*s)/u_res)*1.1-.05;
   if(any(lessThan(q,vec2(0.)))||any(greaterThan(q,vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(q).rgb,1.);}
  vec2 WH=floor(u_res/u_k+.5);vec2 opx=floor(vec2(uv.x,1.-uv.y)*u_res);vec2 dsc=vec2(max(floor(u_res.x/240.),1.),max(ceil(u_res.y/200.),1.));
  const vec2 DG[10]=vec2[10](${Q07_DIG.map(d => `vec2(${d[0]}.,${d[1]}.)`).join(',')});
  #define Q07EB(n_,b_) floor(mod(floor((n_)/exp2(floor(clamp((b_),-1.,22.)))),2.))
  #define Q07CH(G_) {vec2 qq=floor(cu-pp);qq.y=6.-qq.y;if(qq.x>=0.&&qq.y>=0.&&qq.x<6.&&qq.y<7.){float bt=(5.-qq.x)+qq.y*6.;tm+=Q07EB((G_).x,bt-21.)+Q07EB((G_).y,bt);}pp.x+=6.;}
  #define Q07NUM(v_) {float nv=floor((v_)+.5);for(int ii=4;ii>=0;ii--){float pw=pow(10.,float(ii));if(nv>=pw||ii==0){int dg=int(mod(floor(nv/pw+1e-3),10.));Q07CH(DG[dg])}}}
  float alpha=0.,ac=0.;vec2 oo=vec2(max(floor(u_res.x/240.),1.),max(floor(u_res.y/200.),1.));
  for(int k=0;k<9;k++){vec2 ko=vec2(float(k%3-1),float(k/3-1))*oo;vec2 cu=floor((opx+ko)/dsc);float tm=0.;vec2 pp;
   pp=vec2(11.,11.);${Q07_STR('Int Scl Vert ------ ')}Q07NUM(N/u_k)
   pp=vec2(11.,22.);${Q07_STR('Int Scl Horz ------ ')}Q07NUM(N/u_k)
   pp=vec2(11.,33.);${Q07_STR('Final Aspect ------ ')}{float ar=max(WH.x/WH.y,WH.y/WH.x);Q07NUM(floor(ar))${Q07_STR('.')}float fr=floor(fract(ar)*100.+.5);Q07CH(DG[int(floor(fr/10.))])Q07CH(DG[int(mod(fr,10.))])}
   pp=vec2(11.,44.);${Q07_STR('Final Viewport ---- ')}Q07NUM(WH.x)${Q07_STR(' x ')}Q07NUM(WH.y)
   pp=vec2(11.,55.);${Q07_STR('Original Res ------ ')}Q07NUM(floor(WH.x*u_k/N))${Q07_STR(' x ')}Q07NUM(floor(WH.y*u_k/N))
   tm=min(tm,1.);if(k==4)ac=tm;alpha+=tm;}
  alpha=clamp(alpha,0.,1.);return vec4(ac*vec3(1.,1.,0.)+cq*(1.-alpha),1.);`,
 'convergence.slang (R/G/B offsets in source pixels, 50% mix), pixel-weave-4x2 / -sync (crashGG halftone weave with 5-tap edge shielding), mudlord-pal-vhs (line noise, PAL luma/chroma smear, phosphor rows, border mask), film_noise.slang (technicolor 2-strip, misaligned channels, grain, vignette + hotspot; scratch frames need its noise texture - omitted), blur-haze (ReShade Gauss + bloom), ewa_curvature.slang (CRT warp, EWA gaussian footprint filter, Lottes mask), NormalsDisplacement (CurveNormals map fitted as a sine field - approx.), print-resolution (Flyguy 6x7 bitfont overlay of scale / aspect / sizes); noise frames seeded', true);

const Q07_CSIM_COMP = `float N=max(R(u_p0),1.);vec2 sp=uv*u_res/N;vec2 tx=floor(fract(sp*1.0001/200.)*vec2(256.,224.));float a2=mod(tx.x-tx.y-1.,3.)<.5?1.:0.;float TA=u_p1;
  vec3 cL=O(uv-vec2(N/u_res.x,0.)).rgb,cC=O(uv).rgb,cR=O(uv+vec2(N/u_res.x,0.)).rgb;vec3 cur=clamp(cC+((cL-cC)+(cR-cC))*a2*TA,0.,1.);
  vec3 lw=vec3(.299,.587,.114);float cb=dot(cur,lw);float off=0.;
  for(int i=0;i<3;i++){vec2 stp=vec2(float(i+1)/256.,0.);off+=((cb-dot(O(uv-stp).rgb,lw))+(cb-dot(O(uv+stp).rgb,lw)))*(i==0?1.:i==1?-.3162277:.1);}
  cur=clamp(cur+off*.2*mix(1.,a2,TA),0.,1.);cur=clamp(max(cur,vec3(.075,.06,.06)*(10./3.)*(cC+(cL+cR))),0.,1.);
  float FC=floor(fract(u_seed*.61803+.2)*700.)+31.;float gx=(uv.x+4.)*(uv.y+4.)*((mod(FC,800.)+10.)*10.);cur+=(mod((mod(gx,13.)+1.)*(mod(gx,123.)+1.),.01)-.005)*u_p3;`;
const Q07_POIS = (scale, swz) => `vec3 b=vec3(0.);const vec2 PS[7]=vec2[7](vec2(0.,0.),vec2(0.,1.),vec2(0.,-1.),vec2(-.866025,.5),vec2(-.866025,-.5),vec2(.866025,.5),vec2(.866025,-.5));
  for(int i=0;i<7;i++)b+=${swz === 'O' ? 'O' : 'T'}(uv+PS[i]${swz === 'yx' ? '.yx' : ''}*${scale}).rgb;return vec4(b/7.,1.);`;
f('q07_crtsim','CRTSim Grungy (Kurt Bennett crtsim)',[P('Source pixel size',1,8,3,1,'px'),P('Composite artifacts',0,1,.7,.01),P('Mask opacity',0,1,.5,.01),P('Film grain',0,12,3,.5)],
 [Q07_POIS('.015', 'O'), Q07_POIS('.02', 'yx'),
  `${Q07_CSIM_COMP}
  vec3 mk=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 tq=fract(sp+(vec2(float(i),float(j))-1.5)/(4.*N));float x=tq.x*64.,y=tq.y*32.;float hf=step(32.,x);float xl=mod(x,32.),yy=mod(y-16.*hf,32.);
   float vy=smoothstep(5.,7.,yy)*(1.-smoothstep(26.,28.,yy));
   vec3 sl=vec3(smoothstep(1.5,3.,xl)*(1.-smoothstep(9.,10.5,xl)),.87*smoothstep(11.5,13.,xl)*(1.-smoothstep(19.,20.5,xl)),smoothstep(21.5,23.,xl)*(1.-smoothstep(29.5,31.,xl)));
   mk+=.31+.69*sl*vy;}
  mk=mix(vec3(1.),mk/16.+.6,u_p2);vec3 em=cur*mk;em=mix(vec3(dot(em,vec3(.299,.587,.114))),em,.9);
  return vec4(clamp(em+T(uv).rgb*.1,0.,1.),1.);`],
 'crtsim-grungy preset (Kurt Bennett crtsim, slang port): composite pass (diagonal 3-phase NTSC artifact pattern from artifacts.png, 3-step luma sharpen, phosphor persistence on a still frame), image-adjustment film grain, 2-step Poisson bloom of the input, slot shadow-mask (mask.png tile per source pixel, box-filtered over each output pixel - procedural approx. of the PNG), saturation 0.9, bloom 0.1', true);
