/* ================= q56b: round-20 Nukepedia / Negative Lab Pro / X-PostProcessing / Fotocx ================= */
const Q56_HW = (c0, w) => `exp(-pow(mod(hue-(${c0}.)+540.,360.)-180.,2.)/${2 * w * w}.)`;
const Q56_RAD = `clamp(length((uv-.5)*vec2(asp(),1.))/(.5*length(vec2(asp(),1.))),0.,1.)`;

f = add('Tone');
f('q56_igamma','IGamma: Per-Pixel Gamma from Control (Nukepedia)',[S('Control',['Luma','Inverted luma','Vertical ramp','Radial'],1),P('Gamma at control 0',.2,5,1,.01),P('Gamma at control 1',.2,5,2,.01),P('Control blur',0,40,16,.5,'px')],
  `int m=int(u_p0+.5);float bl=R(u_p3)*.5;float cl;
 if(m<2){float l=bl>.5?blurL(uv,bl):L(uv);cl=m==0?l:1.-l;}else if(m==2)cl=uv.y;else cl=1.-${Q56_RAD};
 float gm=max(mix(u_p1,u_p2,cl),.01);return vec4(pow(max(c.rgb,0.),vec3(1./gm)),1.);`,
  'Nukepedia IGamma (Ben Pierre): gamma of each pixel set by a control image, out = in^(1/gamma). The control input is derived here (blurred luma or its inverse = adaptive shadow lift, vertical ramp, radial) and mapped linearly between the two gamma values (approx. of the two-input node)');

f('q56_gammagain','GammaGain Preserving Saturation (Nukepedia GammaGain)',[P('Gamma',.2,5,1.6,.01),P('Gain',.2,4,1,.01),P('Restore saturation',-1,2,0,.01)],
  `vec3 x=max(c.rgb,0.);vec3 g=u_p1*pow(x,vec3(1./u_p0));float l=max(luma(x),1e-5);float lg=u_p1*pow(l,1./u_p0);vec3 pr=x*(lg/l);return vec4(mix(pr,g,u_p2),1.);`,
  'Nukepedia GammaGain (Darren MacKay): Grade-style gamma and gain while keeping the original apparent saturation; Restore saturation 0 = original saturation, 1 = plain Grade result, <0 / >1 reverse / exaggerate. Approx.: saturation kept by applying the curve to luma and scaling RGB by the luma ratio, then blending toward the per-channel Grade');

f = add('Blur');
f('q56_irank','IRank: Per-Pixel Rank Filter (Nukepedia)',[S('Rank from',['Luma','Inverted luma','Radial','Median (0.5)']),S('Size from',['Constant','Luma','Radial','Edge strength'],2),P('Max radius',1,12,4,.5,'px')],
  `int rm=int(u_p0+.5),sm=int(u_p1+.5);float l=blurL(uv,R(1.5));float rd=${Q56_RAD};
 float q=rm==0?l:rm==1?1.-l:rm==2?rd:.5;float sz=sm==0?1.:sm==1?l:sm==2?rd:clamp(length(sobel(uv))*2.,0.,1.);
 float r=R(u_p2)*sz;float st=max(1.,R(u_p2)/5.);vec3 lo=vec3(0.),hi=vec3(1.);
 for(int it=0;it<8;it++){vec3 mid=(lo+hi)*.5;vec3 cnt=vec3(0.);float n=0.;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec2 o=vec2(float(i),float(j))*st;if(length(o)>r+.5)continue;cnt+=step(O(uv+o*u_px).rgb,mid);n+=1.;}
  vec3 ge=step(vec3(max(1.,q*n)-.01),cnt);hi=mix(hi,mid,ge);lo=mix(mid,lo,ge);}
 return vec4((lo+hi)*.5,1.);`,
  'Nukepedia IRank (Ben Pierre): like Rank but with a second image setting the per-pixel rank (0 = min, 1 = max) and a third the radius. The control images are derived here (luma, inverted luma, radial, edge strength); rank found per channel by 8-step bisection on the window count (approx. of the 3-input node)');

f = add('Render');
f('q56_edgeflare','Edge Flare from Off-Frame Light (Nukepedia ct_EdgeFlare)',[P('Source angle',0,360,165,1),P('Distance outside',0,.6,.08,.01),P('Intensity',0,2,1,.01),S('Tint',['Warm','Cool','Neutral'])],
  `vec2 a=vec2(asp(),1.);vec2 p=(uv-.5)*a;float th=radians(u_p0);vec2 dir=vec2(cos(th),sin(th));vec2 hb=.5*a;
 float tb=min(hb.x/max(abs(dir.x),1e-4),hb.y/max(abs(dir.y),1e-4));vec2 E=dir*tb;vec2 Sc=dir*(tb+u_p1);float ds=length(p-Sc);
 vec2 en=abs(E.x)/hb.x>abs(E.y)/hb.y-1e-4?vec2(sign(E.x),0.):vec2(0.,sign(E.y));float de=max(dot(hb,abs(en))-dot(p,en),0.);vec2 tg=vec2(-en.y,en.x);float al=dot(p-E,tg);
 float fall=exp(-u_p1*2.5);float glow=exp(-ds*2.6)*1.;float streak=exp(-de/.025)*exp(-al*al/.06)*1.3;float veil=exp(-de/.15)*exp(-al*al/.4)*.5;
 float ring=exp(-pow((ds-u_p1-.3)/.025,2.))*.2*exp(-de/.3);vec3 gh=vec3(0.);
 for(int i=1;i<=4;i++){float t=float(i)*.42;vec2 gp=Sc*(1.-t*1.5);float rr=.025+.022*float(i);vec2 ca=normalize(Sc)*.006;
  gh+=vec3(exp(-pow(length(p-gp-ca)/rr,4.)),exp(-pow(length(p-gp)/rr,4.)),exp(-pow(length(p-gp+ca)/rr,4.)))*.1;}
 int tn=int(u_p3+.5);vec3 tint=tn==0?vec3(1.,.72,.42):tn==1?vec3(.55,.75,1.):vec3(1.);
 vec3 fl=(tint*(glow+streak+veil)+ring*vec3(.8,.9,1.)+gh*tint)*u_p2*fall;return vec4(1.-(1.-c.rgb)*(1.-clamp(fl,0.,1.)),1.);`,
  'Nukepedia ct_EdgeFlare (Chris Turner) idea: secondary flare hugging the frame edge from a light just outside the frame (screen-space position set here by angle + distance outside instead of camera / axis): hot streak along the nearest edge, veiling glow, faint ring and chromatic ghosts toward the centre, screen-blended (approx. from the description)');

f = add('Analysis');
f('q56_tempkeyer','Temperature Keyer L*a*b* (Nukepedia TemperatureKeyer)',[S('Key',['Warm','Cool']),P('Threshold',-20,60,10,.5),P('Softness',1,60,20,.5),S('Output',['Matte','Keyed colour over grey','Temperature map'])],
  `vec3 li=${LIN('c.rgb')};vec3 X=vec3(dot(vec3(.4124,.3576,.1805),li)/.95047,dot(vec3(.2126,.7152,.0722),li),dot(vec3(.0193,.1192,.9505),li)/1.08883);
 vec3 fx=mix(X*7.787+16./116.,pow(max(X,vec3(1e-6)),vec3(1./3.)),step(vec3(.008856),X));float aa=500.*(fx.x-fx.y),bb=200.*(fx.y-fx.z);float tau=bb+.3*aa;
 float s_=u_p0<.5?tau:-tau;float m=smoothstep(u_p1-u_p2*.5,u_p1+u_p2*.5,s_);int o=int(u_p3+.5);
 if(o==0)return vec4(vec3(m),1.);if(o==1)return vec4(mix(vec3(luma(c.rgb)),c.rgb,m),1.);
 return vec4(mix(vec3(.15,.4,1.),vec3(1.,.55,.1),clamp(.5+tau/60.,0.,1.))*(.25+.75*fx.y),1.);`,
  'Nukepedia TemperatureKeyer (Donald Strubler, "L*a*b* perceptual temperature keyer"): matte from a warm/cool axis in CIE L*a*b* (D65); approx.: temperature coordinate = b* + 0.3 a* (yellow/orange vs blue/cyan), smoothstep key around Threshold with Softness width');

f = add('Render');
f('q56_screensnow','Melting Snow on Lens (Nukepedia screen_snow)',[P('Amount',0,1,.5,.01),P('Flake size',5,60,18,.5,'px'),P('Melt',0,1,.5,.01),P('Distortion',0,1,.5,.01)],
  `vec2 P=PX(uv)/u_k;float cs=u_p1*2.6;vec2 cell=floor(P/cs);float bw=0.;vec2 bd=vec2(0.);float brn=1.;vec2 bid=vec2(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=cell+vec2(float(i),float(j));if(hash(id*1.7+u_seed*3.1)>u_p0)continue;vec2 h=hash2(id+u_seed*13.1);
  vec2 ctr=(id+.2+.6*h)*cs;float rad=u_p1*(.5+.6*hash(id+3.3));vec2 dd=P-ctr;if(dd.y<0.)dd.y/=1.+u_p2*2.5*hash(id+5.);
  float ang=atan(dd.y,dd.x);float rn=rad*(1.+.35*(1.-u_p2)*(vnoise(vec2(ang*2.5+6.*h.x,id.x+id.y*7.))-.5)*2.);float r=length(dd)/rn;
  if(r<1.&&1.-r>bw){bw=1.-r;bd=dd/rn;brn=rn;bid=id;}}
 if(bw<=0.)return c;float r=1.-bw;float k=u_p3*brn*.9*(1.-r*r);vec2 off=-bd*k;vec3 rf=vec3(0.);
 for(int s=0;s<4;s++){vec2 jo=(hash2(bid+float(s))-.5)*3.;rf.r+=O(uv+(off*1.08+jo)*u_k*u_px).r;rf.g+=O(uv+(off+jo)*u_k*u_px).g;rf.b+=O(uv+(off*.92+jo)*u_k*u_px).b;}
 rf*=.25;float rim=smoothstep(.7,1.,r);float fr=(1.-u_p2)*(.5+.5*fbm(P*.18+bid))*smoothstep(1.,.55,r);
 vec3 o3=mix(rf*(1.-.35*rim)+.12*pow(max(1.-length(bd+vec2(.35,-.35)),0.),6.),vec3(.93,.95,1.),clamp(fr,0.,.9));
 return vec4(mix(c.rgb,o3,smoothstep(0.,.08,bw)),1.);`,
  'Nukepedia screen_snow (ali rahbari) look: snow clumps stuck to the lens melting into drops - irregular frosty flakes (Melt 0) turn into smooth refracting drops with downward melt trails (Melt 1), drop refraction with chromatic aberration and slight defocus inside; a single still frame (the gizmo\'s particle bounce / caching is not modelled; approx.)',1);

f = add('Film');
f('q56_nlplook','Negative Lab Pro Lab Scanner Looks (Frontier / Noritsu / Pakon / Crystal)',[S('Model',['Frontier','Noritsu','Pakon F135','Crystal Archive print']),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;vec3 h=rgb2hsv(x);float hue=h.x*360.;float sh=0.,sm=1.;
 float wB=${Q56_HW(215, 30)},wY=${Q56_HW(55, 18)},wS=${Q56_HW(25, 15)},wR=${Q56_HW(355, 14)},wG=${Q56_HW(110, 30)},wC=${Q56_HW(185, 20)};
 if(m==0){sh=-14.*wB-7.*wY+4.*wS+8.*wR+6.*wG;sm=1.08-.06*wS-.12*wC;}
 else if(m==1){sh=-8.*wB-4.*wY+4.*wR+4.*wG;sm=1.05-.05*wC;}
 else if(m==2){sh=-5.*wB+3.*wR;sm=1.+.3*(1.-h.y)*smoothstep(.06,.22,h.y)-.6*(1.-smoothstep(.04,.1,h.y));}
 else{sh=-4.*wB+5.*wG;sm=1.12;}
 h.x=fract((hue+sh)/360.);h.y=clamp(h.y*sm,0.,1.);vec3 y=hsv2rgb(h);float l=luma(y);
 if(m==0){y*=vec3(1.045,1.,.93)+vec3(-.01,0.,.04)*(1.-l);y=mix(y,y*y*(3.-2.*y),.25);}
 else if(m==1){y*=vec3(1.015,1.,.975);y=mix(y,y*y*(3.-2.*y),.35);}
 else if(m==2){y=pow(max(y,0.),vec3(.88));y=mix(y,y*y*(3.-2.*y),.3);}
 else{y*=1.-.16*h.y;y=pow(max(y,0.),vec3(1.12));y=mix(y,y*y*(3.-2.*y),.4);y+=vec3(-.02,.025,-.008)*(1.-l)*(1.-l);}
 return vec4(mix(c.rgb,clamp(y,0.,1.),u_p1),1.);`,
  'Negative Lab Pro guide colour models / LUTs, approx. from their descriptions: Frontier = teal-blues, golden yellows, warm tints, peachier skin, fewer cherry reds, greens/yellows separated; Noritsu = similar but less warm; Pakon F135 = enhanced luminosity, clean contrast, strong separation of colours from (bright, pure) neutrals; Crystal = Fuji Crystal Archive print: subtractive density in saturated colours, deeper tonality, greenish shadows');

f('q56_nlppresat','Negative Pre-Saturation before Inversion (Negative Lab Pro)',[P('Pre-saturation',0,6,3,.1),S('Input',['Positive image','Scanned colour negative'])],
  `float k=.4+.2*u_p0;
 vec3 nn;float sk;vec3 dmin=vec3(9.),dmax=vec3(-9.);
 for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s=O((vec2(float(i),float(j))+.5)/12.).rgb;
  if(u_p1<.5){vec3 li=${LIN('s')};nn=vec3(1.,.62,.38)*pow(vec3(10.),-.6*log(.01+li)/log(10.)-1.2);}else nn=max(s,vec3(1e-3));
  sk=luma(nn);nn=max(sk+k*(nn-sk),vec3(1e-4));vec3 D=-log(nn)/log(10.);dmin=min(dmin,D);dmax=max(dmax,D);}
 vec3 s=c.rgb;if(u_p1<.5){vec3 li=${LIN('s')};nn=vec3(1.,.62,.38)*pow(vec3(10.),-.6*log(.01+li)/log(10.)-1.2);}else nn=max(s,vec3(1e-3));
 sk=luma(nn);nn=max(sk+k*(nn-sk),vec3(1e-4));vec3 D=-log(nn)/log(10.);vec3 pp=clamp((D-dmin)/max(dmax-dmin,vec3(1e-3)),0.,1.);
 vec3 lin=pow(vec3(10.),(pp-1.)*2.);vec3 o=${SRGB('lin')};float tl=(3.-u_p0)*.02;o*=vec3(1.+tl,1.,1.-tl);return vec4(clamp(o,0.,1.),1.);`,
  'Negative Lab Pro pre-saturation: saturation changed on the negative before conversion (default 3; lower = less colour separation, warmer, less vivid; higher = more separation, cooler, more vivid). Approx.: the scanned negative (or a positive turned into a synthetic orange-mask negative) is saturated around its luma, inverted to log density, auto-levelled per channel from a 12x12 sample grid and mapped back to display; small warm/cool tilt as described');

f = add('Stylize');
f('q56_pixelizeleaf','Pixelize Leaf (X-PostProcessing)',[P('Pixel size',.01,1,.8,.01),P('Pixel scale X',.2,5,1,.01),P('Pixel scale Y',.2,5,1,.01)],
  `vec2 ps=(1.01-u_p0)*10.*vec2(u_p1*20.,u_p2*20./asp());vec2 co=floor(uv*ps)/ps;vec2 l=(uv-co)*ps;co+=vec2(step(1.-l.y,l.x)/ps.x,step(l.x,l.y)/ps.y);return T(co);`,
  'X-PostProcessing-Library PixelizeLeaf (QianMo, MIT): UV snapped to a grid of (1.01-size)*10*20 cells (Y divided by the screen ratio), then shifted by step(1-v,u) / step(u,v) of the in-cell position so each cell splits into diagonal "leaf" halves sampled at different corners');

f('q56_auroravignette','Aurora Vignette (X-PostProcessing)',[P('Vignette area',0,1,.8,.01),P('Smoothness',0,1,.5,.01),P('Fading',0,1,1,.01),P('Time',0,100,1,.05)],
  `float tx=u_p3;vec2 u0=uv-vec2(.5+.5*sin(1.4*6.28*uv.x+2.8*tx),.5);
 vec3 wv=vec3(.5*(cos(sqrt(dot(u0,u0))*5.6)+1.),cos(4.62*dot(uv,uv)+tx),cos(distance(uv,vec2(1.6*cos(tx*2.),sin(tx*1.7)))*1.3));
 float wf=dot(wv,vec3(1.));float e0=u_p0,e1=u_p0-.05-u_p1;float tt=clamp((length(vec2(.5)-uv)-e0)/(e1-e0),0.,1.);float vi=1.-tt*tt*(3.-2.*tt);
 vec3 ac=vec3(.5*(sin(1.28*wf+tx*3.45)+1.),.5*(sin(1.28*wf+tx*3.15)+1.),.4*(sin(1.28*wf+tx*1.26)+1.));return vec4(mix(c.rgb,ac,vi*u_p2),1.);`,
  'X-PostProcessing-Library AuroraVignette (QianMo, MIT): three-cosine wave field -> phase (colour factor 1,1,1, colour change 1), aurora colour from three phase-shifted sines, blended in by 1 - smoothstep(area, area-0.05-smoothness, distance from centre) * fading; Time = the animated _TimeX (flow speed folded in)');

f = add('Retro');
f('q56_tilejitter','Glitch Tile Jitter (X-PostProcessing)',[P('Splitting number',1,50,5,1),P('Amount',0,100,10,.5,'px'),S('Layout',['Vertical tiles / horizontal jitter','Vertical tiles / vertical jitter','Horizontal tiles / horizontal jitter','Horizontal tiles / vertical jitter']),P('Phase',0,6.283,0,.01)],
  `int lay=int(u_p2+.5);vec2 q=uv;float o=u_px.x*u_k*cos(u_p3)*u_p1;float s=lay<2?uv.x:uv.y;if(mod(s*u_p0,2.)<1.){if(lay==0||lay==2)q.x+=o;else q.y+=o;}return T(q);`,
  'X-PostProcessing-Library GlitchTileJitter (QianMo, MIT): the image is split into Splitting-number bands along x (vertical tiles) or y; every other band (fmod(uv*N,2) < 1) is offset by pixelSize * cos(time*speed) * amount horizontally or vertically (infinite-frequency mode; Phase = time*speed)');

f = add('Distort');
f('q56_unwarpcloseup','Unwarp Close-up Portrait (Fotocx)',[P('Strength',0,1,.35,.01),P('Radius',.1,1,.45,.01),P('Center X',0,1,.5,.01),P('Center Y',0,1,.55,.01)],
  `vec2 a=vec2(asp(),1.);vec2 C=vec2(u_p2,u_p3);vec2 d=(uv-C)*a;float r=length(d)/u_p1;vec2 s=d;if(r<1.){float w=1.-r*r;s=d*(1.+u_p0*w*w);}return T(C+s/a);`,
  'Fotocx "unwarp closeup" (fix balloon-face distortion of close-up selfies), approx.: the central region (nose / mid-face, enlarged by the short camera distance) is shrunk relative to the face outline with a smooth radial remap src = d*(1 + k(1-r^2)^2) inside the radius, identity outside');

f('q56_unbend','Unbend Bowed Photos (Fotocx Unbend)',[P('Horizon bend',-1,1,.2,.01),P('Vertical-line bend',-1,1,0,.01),P('Zoom in',0,.3,.04,.005)],
  `vec2 q=uv;float x=uv.x-.5,y=uv.y-.5;q.y+=u_p0*.25*(4.*x*x-1./3.);q.x+=u_p1*.5*x*(4.*y*y-1./3.);q=.5+(q-.5)*(1.-u_p2);return T(q);`,
  'Fotocx Unbend (straighten panoramas / wide-angle photos), approx.: quadratic vertical shift across the width removes a bowed (smile / frown) horizon, and a horizontal shift growing with distance from centre and from mid-height straightens bowed verticals; zoom hides the edges');
