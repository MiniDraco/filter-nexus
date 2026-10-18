/* ================= Round 8: darktable / Snapseed / RawTherapee modules ================= */
f = add('Tone');
f('negadoctor','Film Negative Inversion',[S('Film base',['Color negative (orange mask)','Color negative (Fuji-ish)','B&W negative']),P('White density',.3,3,1.4,.01),P('Film gamma',.3,1.5,.6,.01),P('Exposure',-1,1,0,.01,'EV')],
  `int fb=int(u_p0+.5);vec3 dmin=fb==0?vec3(.88,.58,.38):fb==1?vec3(.85,.62,.45):vec3(.9);vec3 l=${LIN('c.rgb')};vec3 lb=${LIN('dmin')};vec3 d=max(log(lb/max(l,vec3(1e-4)))/log(10.),0.);
  if(fb==2)d=vec3(dot(d,vec3(.3333)));vec3 y=pow(vec3(10.),(d-u_p1)/u_p2)*exp2(u_p3);y=clamp(y,0.,1.);return vec4(${SRGB('y')},1.);`,'darktable negadoctor: exposure = 10^((density over base − white density) / film gamma)');
f('filmic','Filmic / Sigmoid Tone Mapping',[S('Curve',['Sigmoid (log-logistic)','Filmic (log + S-curve)']),P('Exposure',-4,4,0,.05,'EV'),P('Contrast',.8,3,1.5,.01),S('Color',['Per channel','Preserve hue'])],
  `vec3 x=${LIN('c.rgb')}*exp2(u_p1);float k=u_p2;vec3 v=u_p3>.5?vec3(max(x.r,max(x.g,x.b))):x;vec3 y;
  if(u_p0<.5){float g=.1845;float sc=pow(g,k)*(1./g-1.);vec3 xc=pow(max(v,vec3(0.)),vec3(k));y=xc/(xc+sc);y=${SRGB('y')};}
  else{vec3 L=clamp((log2(max(v,vec3(1e-6))/.1845)+7.)/(7.+4.5),0.,1.);vec3 s0=1./(1.+exp(-k*5.*(L-.6)));float a=1./(1.+exp(k*5.*.6)),b=1./(1.+exp(-k*5.*.4));y=(s0-a)/(b-a);}
  if(u_p3>.5){vec3 yl=${LIN('y')}*clamp(x/max(v,vec3(1e-6)),0.,1.);y=${SRGB('yl')};}return vec4(clamp(y,0.,1.),1.);`,'darktable sigmoid / filmic rgb');
f('toneequalizer','Tone Equalizer',[P('Shadows',-3,3,1,.05,'EV'),P('Midtones',-3,3,0,.05,'EV'),P('Highlights',-3,3,-.5,.05,'EV'),P('Mask smoothing',0,60,12,1,'px')],
  [`return vec4(vec3(luma(${LIN('O(uv).rgb')})),1.);`,BH('u_p3'),BV('u_p3'),
   `float ev=log2(max(T(uv).r,1e-5));float ws=exp(-pow((ev+6.)/2.,2.)),wm=exp(-pow((ev+2.7)/1.6,2.)),wh=exp(-pow((ev+.5)/1.2,2.));float g=(ws*u_p0+wm*u_p1+wh*u_p2)/max(ws+wm+wh,1e-4);
   vec3 l=${LIN('O(uv).rgb')}*exp2(g);l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);`],'darktable tone equalizer (EV zones on a smoothed luminance mask)');
f('gradnd','Graduated ND Filter',[P('Density',-4,4,-1.5,.05,'EV'),P('Angle',-180,180,0,1,'°'),P('Position',0,1,.5,.01),P('Softness',.01,1,.35,.01)],
  `float a=radians(u_p1);vec2 d=vec2(sin(a),cos(a));vec2 p=(uv-.5)*vec2(asp(),1.);float t=dot(p,d)-(u_p2-.5);float m=smoothstep(-u_p3*.5,u_p3*.5,t);vec3 l=${LIN('c.rgb')}*exp2(u_p0*m);l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);`,'darkens the sky side (Lightroom graduated filter)');
f = add('Color');
f('velvia','Velvia',[P('Strength',0,1,.4,.01),P('Midtone bias',0,1,.5,.01)],
  `vec3 h=rgb2hsl(c.rgb);float l=h.z;float w=1.-pow(abs(2.*l-1.),mix(1.,4.,u_p1));h.y=clamp(h.y+u_p0*(1.-h.y)*h.y*w*2.,0.,1.);return vec4(hsl2rgb(h),1.);`,'darktable velvia: boosts weakly saturated, protects highlights');
f = add('Stylize');
f('censor','Censorize',[P('Pixel size',2,80,18,1,'px'),P('Blur',0,40,8,1,'px'),P('Noise',0,.3,.08,.01)],
  [`vec2 b=floor(PX(uv)/u_p0)*u_p0+u_p0*.5;return T(fromPX(b));`,BH('u_p1'),BV('u_p1'),`return vec4(T(uv).rgb+(hash(floor(PX(uv)))-.5)*u_p2,1.);`],'darktable censorize (pixelate + blur + noise)',1);
f('glamourglow','Glamour Glow',[P('Glow',0,1,.5,.01),P('Saturation',-1,1,.1,.01),P('Warmth',-1,1,.2,.01),P('Radius',4,60,18,1,'px')],
  [BH('u_p3'),BV('u_p3'),`vec3 o=O(uv).rgb,b=T(uv).rgb;vec3 s=1.-(1.-o)*(1.-b);vec3 r=mix(o,s,u_p0*.8);float l=luma(r);r=mix(vec3(l),r,1.+u_p1);r+=vec3(.06,.02,-.06)*u_p2;return vec4(clamp(r,0.,1.),1.);`],'Snapseed Glamour Glow');
f('tonalcontrast','Tonal Contrast',[P('High tones',0,1,.5,.01),P('Mid tones',0,1,.5,.01),P('Low tones',0,1,.5,.01),P('Radius',2,60,14,1,'px')],
  [BH('u_p3'),BV('u_p3'),`vec3 o=O(uv).rgb;float l=luma(o),bl=luma(T(uv).rgb);float d=l-bl;float wh=smoothstep(.45,.85,l),wl=1.-smoothstep(.15,.55,l),wm=1.-wh-wl;float g=1.+3.*(wh*u_p0+max(wm,0.)*u_p1+wl*u_p2);return vec4(clamp(o+(g-1.)*d,0.,1.),1.);`],'Snapseed Tonal Contrast');
f('drama','Drama',[S('Style',['Bright 1','Bright 2','Dark 1','Dark 2']),P('Strength',0,1,.6,.01),P('Saturation',-1,1,-.3,.01),P('Radius',8,120,40,1,'px')],
  [BH('u_p3'),BV('u_p3'),`vec3 o=O(uv).rgb,b=T(uv).rgb;int s=int(u_p0+.5);float k=u_p1*(s==1||s==3?3.5:2.2);vec3 r=o+(o-b)*k;if(s>=2)r*=mix(1.,.72,u_p1);else r=mix(r,r*1.08+.03,u_p1);float l=luma(r);r=mix(vec3(l),r,1.+u_p2);return vec4(clamp(r,0.,1.),1.);`],'Snapseed Drama');
f('grunge','Grunge',[P('Style',0,1,.3,.01),P('Texture',0,1,.6,.01),P('Contrast',0,1,.4,.01),P('Saturation',-1,1,-.3,.01)],
  `vec2 p=PX(uv);float n=fbm(p*.012+u_p0*37.)*.6+fbm(p*.07+u_p0*11.)*.4;float sc=hash(vec2(u_p0*91.,3.));vec3 tint=mix(vec3(1.,.9,.75),vec3(.8,.95,1.),sc);vec3 r=c.rgb*tint;r=(r-.5)*(1.+u_p2)+.5;
  r*=mix(1.,.6+.8*n,u_p1);float v=length((uv-.5)*vec2(asp(),1.));r*=1.-smoothstep(.3,.9,v)*.5;float l=luma(r);r=mix(vec3(l),r,1.+u_p3);return vec4(clamp(r,0.,1.),1.);`,'Snapseed Grunge (texture + tint + vignette)',1);
f = add('Analysis');
f('zonesystem','Zone System Map',[P('Zones',5,16,11,1),S('Display',['Gray zones','Colored zones']),S('Measure',['Luminance (sRGB)','Linear luminance'])],
  `float l=u_p2>.5?pow(luma(${LIN('c.rgb')}),1./2.2):luma(c.rgb);float n=floor(u_p0+.5);float z=min(floor(l*n),n-1.);if(u_p1<.5)return vec4(vec3(z/(n-1.)),1.);return vec4(ramp(3,z/(n-1.))*(.55+.45*z/(n-1.)),1.);`,'Ansel Adams zones (darktable zone system)');

