/* ================= aftereffects (1/3): After Effects colour, keying / matte, noise and repair effects (single-frame) ================= */
/* checkerboard behind transparent pixels (16 px squares) */
const AEB_CHK = `float chk_=mod(floor(PX(uv).x/16.)+floor(PX(uv).y/16.),2.);vec3 bgk=vec3(mix(.42,.62,chk_));`;

f = add('Color');
f('ae_colorama','Colorama (After Effects)',[S('Get phase from',['Intensity','Lightness','Hue','Saturation','Red','Green','Blue']),
  S('Output cycle',['Hue Cycle','Fire','Golden','Electric','Pastel','Ramp Grayscale','Negative','Solarize','Ocean']),
  P('Phase shift',0,360,0,1,'°'),P('Cycle repetitions',.25,6,1,.05)],
  `vec3 o=clamp(c.rgb,0.,1.);int ip=int(u_p0+.5);float mx=max(o.r,max(o.g,o.b)),mn=min(o.r,min(o.g,o.b));
 float t=ip==0?(o.r+o.g+o.b)/3.:ip==1?(mx+mn)*.5:ip==2?rgb2hsv(o).x:ip==3?rgb2hsv(o).y:ip==4?o.r:ip==5?o.g:o.b;
 float ph=fract(t*u_p3+u_p2/360.);int m=int(u_p1+.5);vec3 r;
 if(m==0)r=hsv2rgb(vec3(ph,1.,1.));
 else if(m==1)r=stops5(vec3(0.),vec3(.55,0.,0.),vec3(1.,.32,0.),vec3(1.,.82,.18),vec3(1.,1.,.9),ph);
 else if(m==2)r=stops5(vec3(.12,.06,0.),vec3(.5,.28,.03),vec3(.9,.65,.18),vec3(1.,.93,.6),vec3(.45,.26,.04),ph);
 else if(m==3)r=stops5(vec3(0.,0.,.08),vec3(.15,.05,.55),vec3(.3,.45,1.),vec3(.85,.92,1.),vec3(.4,.1,.7),ph);
 else if(m==4)r=hsv2rgb(vec3(ph,.35,1.));
 else if(m==5)r=vec3(ph);
 else if(m==6)r=vec3(1.-ph);
 else if(m==7)r=vec3(1.-abs(2.*ph-1.));
 else r=ramp(4,1.-abs(2.*ph-1.));
 return vec4(r,1.);`,
  'AE Colorama: phase from the chosen property, ×repetitions + shift, looked up in a cyclic output palette (preset palettes approx.)');

f('ae_toner','Tritone / CC Toner (After Effects)',[S('Tones',['Tritone','Duotone','Pentone','Solid']),P('Midtone hue',0,360,32,1,'°'),
  P('Midtone saturation',0,1,.45,.01),P('Blend with original',0,1,0,.01)],
  `vec3 o=clamp(c.rgb,0.,1.);float l=luma(o);vec3 md=hsv2rgb(vec3(u_p1/360.,u_p2,1.));md=clamp(md*.45/max(luma(md),.01),0.,1.);
 int m=int(u_p0+.5);vec3 r;
 if(m==0)r=l<.5?mix(vec3(0.),md,l*2.):mix(md,vec3(1.),l*2.-1.);
 else if(m==1)r=mix(md*.3,mix(md,vec3(1.),.8),smoothstep(0.,1.,l));
 else if(m==2){vec3 dk=hsv2rgb(vec3(u_p1/360.-.05,min(u_p2*1.3,1.),1.));dk=dk*.2/max(luma(dk),.01);vec3 hi=hsv2rgb(vec3(u_p1/360.+.05,u_p2*.6,1.));hi=mix(hi*.75/max(luma(hi),.01),vec3(1.),.2);
  r=stops5(vec3(0.),clamp(dk,0.,1.),md,clamp(hi,0.,1.),vec3(1.),l);}
 else r=clamp(md/max(luma(md),.01)*l,0.,1.);
 return vec4(mix(r,o,u_p3),1.);`,
  'AE Tritone (shadows black → midtone colour → highlights white by luminance) and CC Toner Duotone / Pentone / Solid; midtone colour from hue+saturation at ~45% luminance (CC Toner default colours approx.)');

f('ae_broadcast','Broadcast Colors (After Effects)',[S('Broadcast locale',['NTSC','PAL']),
  S('How to make color safe',['Reduce luminance','Reduce saturation','Key out unsafe','Key out safe']),P('Maximum signal amplitude',90,120,100,1,'IRE')],
  `vec3 o=clamp(c.rgb,0.,1.);float Y=dot(o,vec3(.299,.587,.114));float C;bool pal=u_p0>.5;
 if(pal){C=length(vec2(.492*(o.b-Y),.877*(o.r-Y)));}else{C=length(vec2(dot(o,vec3(.596,-.274,-.322)),dot(o,vec3(.211,-.523,.312))));}
 float setup=pal?0.:7.5,span=pal?100.:92.5;float pk=setup+span*(Y+C);float lim=(u_p2-setup)/span;bool bad=pk>u_p2+.01;int m=int(u_p1+.5);vec3 r=o;
 if(m==0){if(bad)r=o*lim/max(Y+C,1e-4);}
 else if(m==1){if(bad){float s=clamp((lim-Y)/max(C,1e-4),0.,1.);r=vec3(Y)+(o-vec3(Y))*s;if(Y>lim)r*=lim/Y;}}
 else if(m==2){if(bad)r=vec3(0.);}
 else{if(!bad)r=vec3(0.);}
 return vec4(r,1.);`,
  'AE Broadcast Colors: composite peak = setup + span·(Y + chroma amplitude) in IRE (NTSC YIQ with 7.5 IRE setup, PAL YUV); unsafe pixels scaled down in luminance or saturation, or keyed to black');

f('ae_coloroffset','CC Color Offset (After Effects)',[P('Red phase',0,360,0,1,'°'),P('Green phase',0,360,90,1,'°'),P('Blue phase',0,360,180,1,'°'),
  S('Overflow',['Wrap','Solarize','Polarize'])],
  `vec3 o=clamp(c.rgb,0.,1.);vec3 x=o+vec3(u_p0,u_p1,u_p2)/360.;int m=int(u_p3+.5);vec3 r;
 if(m==0)r=fract(x);else if(m==1)r=1.-abs(1.-mod(x,2.));else r=.5-.5*cos(PI*mod(x,2.));
 return vec4(clamp(r,0.,1.),1.);`,
  'CC Color Offset: each channel value rotated by its phase; overflow wraps (sawtooth), folds back (solarize) or follows a smooth cosine cycle (polarize, approx.)');

f('ae_thresholdrgb','CC Threshold RGB (After Effects)',[P('Red threshold',0,1,.5,.01),P('Green threshold',0,1,.5,.01),P('Blue threshold',0,1,.5,.01),
  S('Invert',['None','Red','Green','Blue','All'])],
  `vec3 r=step(vec3(u_p0,u_p1,u_p2),c.rgb);int m=int(u_p3+.5);if(m==1||m==4)r.r=1.-r.r;if(m==2||m==4)r.g=1.-r.g;if(m==3||m==4)r.b=1.-r.b;return vec4(r,1.);`,
  'CC Threshold RGB: an independent threshold per channel (8-colour result), optional channel inversion');

f('ae_neutralizer','CC Color Neutralizer (After Effects)',[P('Shadows',0,1.5,1,.01),P('Midtones',0,1.5,1,.01),P('Highlights',0,1.5,1,.01),P('Pinning',0,1,.3,.01)],
  `vec3 cs=vec3(0.),cm=vec3(0.),ch=vec3(0.);float ws=1e-4,wm=1e-4,wh=1e-4;
 for(int j=0;j<14;j++)for(int i=0;i<14;i++){vec3 q=O((vec2(float(i),float(j))+.5)/14.).rgb;float l=luma(q);
  float a=smoothstep(.5,.1,l),b=max(1.-abs(l-.5)*2.6,0.),h=smoothstep(.5,.9,l);cs+=q*a;ws+=a;cm+=q*b;wm+=b;ch+=q*h;wh+=h;}
 cs/=ws;cm/=wm;ch/=wh;vec3 o=c.rgb;float l=luma(o);float a=(1.-l)*(1.-l),b=2.*l*(1.-l),h=l*l;
 vec3 corr=a*u_p0*(cs-luma(cs))+b*u_p1*(cm-luma(cm))+h*u_p2*(ch-luma(ch));corr*=mix(1.,min(1.,8.*l*(1.-l)),u_p3);
 return vec4(clamp(o-corr,0.,1.),1.);`,
  'CC Color Neutralizer without picked samples: the colour cast of shadows / midtones / highlights is measured from a 14×14 grid and subtracted with tonal weights; pinning protects pure black and white (approx.)');

/* ---------------- keying ---------------- */
const AEB_KEYCOL = `float kh=u_p1/360.;vec3 o=clamp(O(uv).rgb,0.,1.);vec3 hv=rgb2hsv(o);vec3 rt=hsv2rgb(vec3(fract(hv.x+1./3.-kh),hv.y,hv.z));`;
f('ae_colorkey','Color Keys: Linear / Color Difference / Keylight (After Effects)',[S('Keyer',['Linear Color Key (RGB)','Linear Color Key (Hue)','Linear Color Key (Chroma)','Color Difference Key','Keylight (screen balance)']),
  P('Key colour hue',0,360,120,1,'°'),P('Matching tolerance',0,1,.3,.01),S('View',['Final result (over checker)','Matte','Status (black/gray/white)','Spill-suppressed source'])],
  `${AEB_KEYCOL}${AEB_CHK}
 int m=int(u_p0+.5);vec3 kc=hsv2rgb(vec3(kh,.85,.8));float a;float tl=u_p2;vec3 src=o;
 if(m==0){float d=distance(o,kc)/1.2;a=smoothstep(tl*.6,tl*.6+.12,d);}
 else if(m==1){float d=abs(hv.x-kh);d=min(d,1.-d)*2.;a=max(smoothstep(tl*.5,tl*.5+.08,d),smoothstep(.25,.1,hv.y*hv.z*2.));}
 else if(m==2){vec2 uvp=vec2(dot(o,vec3(-.169,-.331,.5)),dot(o,vec3(.5,-.419,-.081)));vec2 kp=vec2(dot(kc,vec3(-.169,-.331,.5)),dot(kc,vec3(.5,-.419,-.081)));
  float d=distance(uvp,kp)/max(length(kp),.05);a=smoothstep(tl*.9,tl*.9+.2,d);}
 else if(m==3){float df=rt.g-max(rt.r,rt.b);a=clamp(1.-df*(1.5+tl*8.),0.,1.);}
 else{float dk=.05;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 q=clamp(O((vec2(float(i),float(j))+.5)/12.).rgb,0.,1.);vec3 qh=rgb2hsv(q);q=hsv2rgb(vec3(fract(qh.x+1./3.-kh),qh.y,qh.z));dk=max(dk,q.g-.5*(q.r+q.b));}
  float df=rt.g-(.5*rt.r+.5*rt.b);dk*=.92;a=1.-clamp(df/dk,0.,1.);a=smoothstep(tl*.35,1.-tl*.3,a);}
 if(m>=3){vec3 sp=vec3(rt.r,min(rt.g,(rt.r+rt.b)*.5),rt.b);vec3 sh=rgb2hsv(sp);src=hsv2rgb(vec3(fract(sh.x-1./3.+kh),sh.y,sh.z));}
 int v=int(u_p3+.5);
 if(v==1)return vec4(vec3(a),1.);
 if(v==2)return vec4(vec3(a>.98?1.:a<.02?0.:.5),1.);
 if(v==3)return vec4(src,1.);
 return vec4(mix(bgk,src,a),1.);`,
  'AE Linear Color Key (RGB distance / hue angle / YUV chroma distance to the key colour), Color Difference Key (key channel minus max of the others, after rotating the key hue to green) and Keylight-style screen-balance matte (difference ÷ strongest screen difference found on a 12×12 grid, clip black/white) with despill; single-frame keyers, Keylight approx.');

f('ae_spill','Spill Suppressor (After Effects)',[S('Color to suppress',['Green','Blue','Custom hue']),P('Custom hue',0,360,300,1,'°'),
  P('Suppression',0,200,100,1,'%'),S('Limit',['Average of the others','Maximum of the others'])],
  `vec3 o=clamp(c.rgb,0.,1.);int m=int(u_p0+.5);float kh=m==0?1./3.:m==1?2./3.:u_p1/360.;vec3 hv=rgb2hsv(o);
 vec3 rt=hsv2rgb(vec3(fract(hv.x+1./3.-kh),hv.y,hv.z));float lim=u_p3>.5?max(rt.r,rt.b):(rt.r+rt.b)*.5;
 rt.g=mix(rt.g,min(rt.g,lim),min(u_p2/100.,1.))-max(rt.g-lim,0.)*max(u_p2/100.-1.,0.);rt=clamp(rt,0.,1.);
 vec3 sh=rgb2hsv(rt);return vec4(hsv2rgb(vec3(fract(sh.x-1./3.+kh),sh.y,sh.z)),1.);`,
  'AE Spill Suppressor: the key channel (after rotating the spill hue to green) is limited to the average / maximum of the other two; >100% over-suppresses');

f('ae_matte','Set Matte / Simple Choker / Matte Choker (After Effects)',[S('Operation',['Set Matte','Simple Choker','Matte Choker'],2),
  S('Take matte from',['Luminance','Red','Green','Blue','Saturation','Hue','Lightness','Green-screen difference','Inverted luminance']),
  P('Choke',-12,12,3,.5,'px'),S('View',['Over checker','Matte','Over black'])],
  [`vec3 o=clamp(c.rgb,0.,1.);int s=int(u_p1+.5);vec3 hv=rgb2hsv(o);float mx=max(o.r,max(o.g,o.b)),mn=min(o.r,min(o.g,o.b));
 float m=s==0?luma(o):s==1?o.r:s==2?o.g:s==3?o.b:s==4?hv.y:s==5?hv.x:s==6?(mx+mn)*.5:s==7?1.-clamp((o.g-max(o.r,o.b))*4.,0.,1.):1.-luma(o);
 return vec4(vec3(m),1.);`,
   `float rr=R(abs(u_p2));float v=T(uv).r;int op=int(u_p0+.5);
 if(op==1){for(int i=-24;i<=24;i++){float x=float(i);if(abs(x)>rr)continue;float s=T(uv+vec2(x,0.)*u_px).r;v=u_p2>0.?min(v,s):max(v,s);}}
 else if(op==2)v=blur1d(u_tex,uv,vec2(1.,0.),max(rr*1.5,R(2.))).r;
 return vec4(vec3(v),1.);`,
   `float rr=R(abs(u_p2));float v=T(uv).r;int op=int(u_p0+.5);
 if(op==1){for(int i=-24;i<=24;i++){float x=float(i);if(abs(x)>rr)continue;float s=T(uv+vec2(0.,x)*u_px).r;v=u_p2>0.?min(v,s):max(v,s);}}
 else if(op==2)v=blur1d(u_tex,uv,vec2(0.,1.),max(rr*1.5,R(2.))).r;
 return vec4(vec3(v),1.);`,
   `${AEB_CHK}float m=T(uv).r;int op=int(u_p0+.5);if(op==2){float t=.5+u_p2/30.;m=smoothstep(t-.08,t+.08,m);}
 int v=int(u_p3+.5);vec3 o=O(uv).rgb;if(v==1)return vec4(vec3(m),1.);return vec4(mix(v==2?vec3(0.):bgk,o,m),1.);`],
  'AE Set Matte (alpha taken from a channel / property of the image), Simple Choker (matte eroded / dilated by the choke radius) and Matte Choker (geometric softness blur → gray-level-softness threshold shifted by choke); one-iteration Matte Choker approx.');

/* ---------------- noise ---------------- */
f = add('Noise');
f('ae_noisehls','Noise HLS (After Effects)',[P('Hue',0,100,8,1,'%'),P('Lightness',0,100,15,1,'%'),P('Saturation',0,100,10,1,'%'),
  S('Noise',['Uniform','Squared','Grain'])],
  `vec3 hl=rgb2hsl(clamp(c.rgb,0.,1.));int m=int(u_p3+.5);vec2 p=PX(uv);vec3 n;
 if(m==2){vec2 g=p/3.;n=vec3(vnoise(g),vnoise(g+31.7),vnoise(g+67.1))*2.-1.;n*=1.6;}
 else{vec2 q=floor(p)+.5;n=vec3(hash(q),hash(q+19.3),hash(q+41.9))*2.-1.;if(m==1)n=sign(n)*n*n;}
 hl.x=fract(hl.x+n.x*u_p0/200.);hl.z=clamp(hl.z+n.y*u_p1/200.,0.,1.);hl.y=clamp(hl.y+n.z*u_p2/100.,0.,1.);
 return vec4(hsl2rgb(hl),1.);`,
  'AE Noise HLS: independent noise added to hue, lightness and saturation (uniform / squared distribution, or smooth 3 px grain)',1);

f('ae_noisealpha','Noise Alpha (After Effects)',[S('Noise',['Uniform random','Squared random','Uniform blocks']),P('Amount',0,100,40,1,'%'),
  S('Original alpha',['Add','Clamp','Scale']),S('Overflow',['Clip','Wrap back','Wrap'])],
  `${AEB_CHK}int m=int(u_p0+.5);vec2 q=m==2?floor(PX(uv)/4.)+.5:floor(PX(uv))+.5;float n=hash(q)*2.-1.;if(m==1)n=sign(n)*n*n;
 float am=u_p1/100.;int oa=int(u_p2+.5);float a=oa==0?1.+n*am:oa==1?min(1.,1.-am+(n*.5+.5)*am*2.):1.+n*am*.5-am*.5;
 int ov=int(u_p3+.5);if(ov==0)a=clamp(a,0.,1.);else if(ov==1)a=1.-abs(1.-mod(a,2.));else if(a>1.||a<0.)a=fract(a);
 a=clamp(a,0.,1.);return vec4(mix(bgk,c.rgb,a),1.);`,
  'AE Noise Alpha on an opaque layer: random alpha noise added to / clamped by / scaling the original alpha, with clip or wrap overflow; shown over a checkerboard',1);

/* ---------------- repair ---------------- */
f = add('Repair');
f('ae_wireremoval','CC Simple Wire Removal (After Effects)',[P('Position',-.5,.5,0,.002),P('Angle',0,180,75,.5,'°'),P('Thickness',1,24,5,.5,'px'),
  S('Method',['Fade (interpolate)','Displace (mirror)'])],
  `vec2 p=PX(uv),ctr=PX(vec2(.5));float a=radians(u_p1);vec2 d=vec2(cos(a),sin(a)),n=vec2(-d.y,d.x);vec2 p0=ctr+n*u_p0*length(PX(vec2(1.)));
 float s=dot(p-p0,n);float w=R(u_p2)*.5/u_k+1.;if(abs(s)>w)return c;
 vec3 r;if(u_p3<.5){vec3 A=O(fromPX(p-n*(s+w))).rgb,B=O(fromPX(p+n*(w-s))).rgb;r=mix(A,B,(s+w)/(2.*w));}
 else{float sg=s>=0.?1.:-1.;r=O(fromPX(p+n*sg*(2.*w-2.*abs(s)))).rgb;}
 return vec4(r,1.);`,
  'CC Simple Wire Removal: a straight wire across the frame (position / angle / thickness) replaced by interpolating the pixels either side, or by mirroring the neighbouring strip');
f('ae_interlaceflicker','Reduce Interlace Flicker (After Effects)',[P('Softness',0,3,1,.05,'px')],
  `return blur1d(u_tex,uv,vec2(0.,1.),R(u_p0*2.));`,
  'AE Reduce Interlace Flicker: vertical-only Gaussian (σ = softness) that suppresses 1-line interlace twitter');
