/* ================= reshade (part 2): photo-app tools — Affinity, DxO, Capture One, ON1, Topaz, Snapseed, Apple Photos, layer styles, Lightroom ================= */
/* three Gaussian blurs (sigma 1.5 / 5 / 15 px) in one separable pass: first pass blurs luma of the image into r,g,b, second blurs each channel */
const RSH_TRI = (dir, first) => `vec3 acc=vec3(0.),ws=vec3(0.);vec3 sg=vec3(1.5,5.,15.)*u_k;float st=max(u_k,1.);
 for(int i=-40;i<=40;i++){float x=float(i)*st;vec3 w=exp(-x*x/(2.*sg*sg));vec2 q=uv+${dir}*x*u_px;vec3 v=${first ? 'vec3(luma(T(q).rgb))' : 'T(q).rgb'};acc+=v*w;ws+=w;}
 return vec4(acc/ws,1.);`;
/* Volume deformation: output position (half-height = 1 units) -> source position; m = mode, f = focal length, A = amount, swp = portrait */
const RSH_VD = (pi, po) => `{vec2 q_=${pi};if(swp)q_=q_.yx;vec2 r_;
 if(m==1){float ro=length(q_);float rs=f*tan(min(2.*atan(ro/(2.*f)),1.5));r_=q_*(mix(ro,rs,A)/max(ro,1e-5));}
 else{float ph=clamp(2.*atan(q_.x/(2.*f)),-1.5,1.5);r_=vec2(mix(q_.x,f*tan(ph),A),mix(q_.y,q_.y/cos(ph),A));}
 if(swp)r_=r_.yx;${po}=r_;}`;
/* layer-style shape mask from the image luma (0 auto = minority tone, 1 bright, 2 dark) */
const RSH_LSMASK = (q, o) => `{float l_=luma(O(${q}).rgb);float k_=smoothstep(.46,.54,l_);int sh_=int(u_p1+.5);
 if(sh_==0){float mn_=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn_+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb);if(mn_/64.>.5)k_=1.-k_;}
 else if(sh_==2)k_=1.-k_;${o}=k_;}`;

f = add('Color');
f('erasepaper','Erase White Paper / Remove Black / Recolor (Affinity)',[S('Mode',['Erase White Paper','Remove Black','Recolor']),P('Hue (Recolor)',0,360,30,1),P('Threshold or saturation',0,1,.5,.01),S('Show transparency on',['Checkerboard','Black','White','Grey'])],
  `int m=int(u_p0+.5);vec3 col=clamp(c.rgb,0.,1.);
 if(m==2){vec3 h=rgb2hsl(col);return vec4(hsl2rgb(vec3(u_p1/360.,u_p2,h.z)),1.);}
 float a0,th=u_p2*.2;vec3 fg;
 if(m==0){a0=1.-min(col.r,min(col.g,col.b));fg=1.-(1.-col)/max(a0,1e-4);}else{a0=max(col.r,max(col.g,col.b));fg=col/max(a0,1e-4);}
 float a=clamp((a0-th)/(1.-th),0.,1.);int bgm=int(u_p3+.5);vec2 p=floor(PX(uv)/8.);
 vec3 bg=bgm==0?vec3(mod(p.x+p.y,2.)<.5?.8:.6):bgm==1?vec3(0.):bgm==2?vec3(1.):vec3(.5);
 return vec4(mix(bg,clamp(fg,0.,1.),a),1.);`,
  'Erase White Paper = un-multiply from white (alpha = 1 - min RGB, colour = 1 - (1 - c) / alpha), Remove Black = un-multiply from black (alpha = max RGB, colour = c / alpha); Threshold clears near-white / near-black paper texture; the transparent result is shown over the chosen backdrop. Recolor = HSL hue + saturation set, lightness kept');

f = add('Materials');
f('normaladjust','Normals Adjustment (Affinity)',[P('Rotation',0,360,0,1,'deg'),P('Intensity',0,4,1,.01),S('Invert',['None','Invert X','Invert Y (OpenGL / DirectX)','Invert X and Y']),S('Z',['Renormalize','Keep blue channel'])],
  `vec3 n=c.rgb*2.-1.;int iv=int(u_p2+.5);if(iv==1||iv==3)n.x=-n.x;if(iv>=2)n.y=-n.y;n.xy=rot(n.xy,radians(u_p0));n.xy*=u_p1;
 if(u_p3<.5)n=normalize(vec3(n.xy,max(n.z,1e-3)));return vec4(clamp(n*.5+.5,0.,1.),1.);`,
  'tangent-space normal map (image = normal map): X/Y inversion, rotation of the XY slope about Z, intensity scales the slopes, then renormalised (or Z kept)');

f = add('Sharpen');
f('finecontrast','Fine Contrast / Dynamic Contrast (DxO / ON1)',[S('Mode',['Fine Contrast (DxO)','Dynamic Contrast (ON1)']),P('Amount',-1,2,.6,.01),P('Detail size (fine to large)',0,1,.4,.01),P('Protect shadows and highlights',0,1,.5,.01)],
  [RSH_TRI('vec2(1.,0.)', true), RSH_TRI('vec2(0.,1.)', false), `vec3 col=O(uv).rgb;float l=luma(col);vec3 b=T(uv).rgb;int m=int(u_p0+.5);float sz=u_p2;float d;
 if(m==0)d=(l-b.x)*1.6+.6*sz*(b.x-b.y);else d=(1.-sz)*(l-b.x)+.8*(b.x-b.y)+sz*(b.y-b.z);
 float t=clamp(b.y,0.,1.);float w=1.-u_p3*(1.-4.*t*(1.-t));
 return vec4(clamp(col+u_p1*1.6*d*w,0.,1.),1.);`],
  'luminance band-pass detail from 3 Gaussian scales (1.5 / 5 / 15 px) added back: DxO Fine Contrast = finest band (+ some mid band as Detail size grows); ON1 Dynamic Contrast = small / medium / large bands weighted by Detail size; tonal protection fades the boost toward black and white (approx. of the proprietary filters)');
f('diffractioncorr','Diffraction Correction (Capture One)',[P('Aperture (f-number)',2,32,11,.1),P('Pixel pitch',1,10,4,.1,'um'),P('Amount',0,2,1,.01),P('Noise threshold',0,.05,.005,.001)],
  [BH('(.462*u_p0/u_p1)'), BV('(.462*u_p0/u_p1)'), `vec3 f0=O(uv).rgb;vec3 d=f0-T(uv).rgb;vec3 ad=sign(d)*max(abs(d)-u_p3,0.);return vec4(clamp(f0+u_p2*ad,0.,1.),1.);`],
  'approx.: one Van Cittert deconvolution step against the diffraction PSF of the chosen aperture, the Airy disc approximated by a Gaussian with sigma = 0.42 x 0.55 um x N / pixel pitch (assumes the image is at sensor resolution), with a noise threshold on the correction');

f = add('Distort');
f('volumedeform','Volume Deformation Correction (DxO)',[S('Mode',['Horizontal / vertical (cylindrical)','Diagonal (spherical)']),P('Field of view (diagonal)',30,140,100,1,'deg'),P('Amount',0,1,1,.01),S('Edges',['Auto-crop','Show all (black corners)'])],
  `int m=int(u_p0+.5);float A=u_p2;vec2 hd=vec2(asp(),1.);bool swp=asp()<1.;float f=length(hd)/tan(radians(u_p1)*.5);
 float sc=1.;if(u_p3<.5){float lo=.15,hi=1.;for(int i=0;i<16;i++){float md=(lo+hi)*.5;vec2 cs;${RSH_VD('hd*md', 'cs')}if(cs.x<=hd.x&&cs.y<=hd.y)lo=md;else hi=md;}sc=lo;}
 vec2 p=(uv-.5)*2.*hd*sc;vec2 src;${RSH_VD('p', 'src')}vec2 su=src/(2.*hd)+.5;
 if(any(lessThan(su,vec2(0.)))||any(greaterThan(su,vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(T(su).rgb,1.);`,
  'rectilinear wide-angle image re-projected so off-centre subjects are no longer stretched: spherical = stereographic radius r = 2f tan(theta/2), cylindrical = stereographic along the long axis with vertical cos(phi) compensation (keeps verticals straight), mixed by Amount, focal length from the diagonal field of view, auto-crop by bisection on the corner (approx. of DxO ViewPoint)');

f = add('Tone');
f('app_glowlooks','Sunshine / Big Softy / Retrolux / Silvertone',[S('Look',['Sunshine (ON1)','Big Softy (ON1)','Retrolux (Snapseed)','Silvertone (Apple Photos)']),P('Strength',0,1,.85,.01),P('Glow radius',2,80,24,1,'px'),P('Style (Retrolux)',0,12,3,1)],
  [BH('u_p2'), BV('u_p2'), `vec3 o=O(uv).rgb;vec3 g=T(uv).rgb;int m=int(u_p0+.5);vec3 r=o;
 if(m==0){vec3 w=pow(clamp(o*vec3(1.08,1.,.86),0.,1.),vec3(.85));vec3 gw=g*vec3(1.12,.95,.68);r=1.-(1.-w)*(1.-gw*.4);r=mix(vec3(luma(r)),r,1.15);r=(r-.5)*1.06+.5;}
 else if(m==1){r=mix(o,1.-(1.-o)*(1.-g),.55);r=mix(r,g,.3);r=r*.9+.07;}
 else if(m==2){float st=floor(u_p3+.5);vec3 tint=hsv2rgb(vec3(fract(st*.137+.05),.4,1.));r=o*o*(3.-2.*o);r=mix(vec3(luma(r)),r,.7)*mix(vec3(1.),tint,.45);r=r*.86+.08*vec3(1.,.94,.82);
  vec2 q=uv*vec2(asp(),1.);vec3 lk=vec3(0.);for(int k=0;k<2;k++){vec2 h2=hash2(vec2(st*3.1+float(k),7.3));vec2 cp=vec2(h2.x*asp(),step(.5,h2.y));float dd=length(q-cp);
   lk+=exp(-dd*dd/.08)*hsv2rgb(vec3(.02+.08*hash(vec2(float(k),st)),.85,1.));}r=1.-(1.-r)*(1.-clamp(lk,0.,1.)*.75);
  vec2 pp=PX(uv);float scr=0.;for(int k=0;k<4;k++){float xs=hash(vec2(float(k)*1.7,st+2.));float wv=step(.35,vnoise(vec2(pp.y*.03,float(k)*9.+st)));scr+=wv*smoothstep(R(1.2),0.,abs(pp.x-xs*u_res.x/u_k*1.)*u_k)*.6;}
  float dust=step(.9975,hash(floor(pp/2.)+st));r=mix(r,vec3(.97,.95,.9),clamp(scr+dust,0.,1.));
  vec2 vq=uv-.5;r*=1.-.55*dot(vq,vq)*2.;}
 else{float l=clamp(luma(o)*1.06-.02,0.,1.);l=mix(l,l*l*(3.-2.*l),.7);float gl=luma(g);l=mix(l,1.-(1.-l)*(1.-gl*.3),.4);r=vec3(l)*vec3(.965,.995,1.04)+.015;}
 return vec4(clamp(mix(o,r,u_p1),0.,1.),1.);`],
  'look approximations: ON1 Sunshine (warm, brightened, warm screened glow, a little saturation + contrast), ON1 Big Softy (strong soft glow, lowered contrast, lifted blacks), Snapseed Retrolux (S-curve, faded tinted colour, light leaks, scratches, dust, vignette; Style picks the tint and leak layout), Apple Photos Silvertone (contrasty B&W with a slight cool silver tone and soft highlight glow)', 1);

f = add('Paint');
f('buzsim','BuzSim (Topaz Simplify)',[P('Size',1,8,4,1,'px'),P('Colour simplify',0,1,.5,.01),P('Edges',0,1,.35,.01)],
  [`return vec4(kuwa(uv,u_p0),1.);`, `return vec4(kuwa(uv,u_p0),1.);`, `vec3 s=T(uv).rgb;vec3 h=rgb2hsv(s);float n=mix(24.,4.,u_p1);h.z=mix(h.z,floor(h.z*n+.5)/n,u_p1*.85);float ns=n*.5;h.y=mix(h.y,floor(h.y*ns+.5)/ns,u_p1*.5);
 vec3 r=hsv2rgb(h);float e=length(sobel(uv));r*=1.-u_p2*smoothstep(.12,.55,e);return vec4(r,1.);`],
  'approx. of the Topaz Simplify BuzSim preset: two passes of Kuwahara smoothing (flat painterly regions, edges kept), value / saturation quantisation, optional dark edges from the simplified image');

f = add('Stylize');
f('layerstyle','Layer Styles (Inner Shadow / Outer Glow / Inner Glow / Drop Shadow)',[S('Style',['Inner Shadow','Outer Glow','Inner Glow','Drop Shadow']),S('Shape',['Auto (minority tone)','Bright on dark','Dark on light','Whole canvas']),P('Size',1,60,12,.5,'px'),P('Opacity',0,1,.75,.01)],
  [`float mk=1.;if(u_p1<2.5){${RSH_LSMASK('uv', 'mk')}}return vec4(vec3(mk),1.);`, BH('u_p2*.5'), BV('u_p2*.5'), `
 vec3 col=O(uv).rgb;int st=int(u_p0+.5);bool cv=u_p1>2.5;float sz=R(u_p2);vec2 off=vec2(.5,-.8660254)*sz*.5*u_px;
 float m0=1.;if(!cv){${RSH_LSMASK('uv', 'm0')}}
 vec2 wp=uv*u_res,wq=(uv-off)*u_res;float dc=min(min(wp.x,u_res.x-wp.x),min(wp.y,u_res.y-wp.y)),dq=min(min(wq.x,u_res.x-wq.x),min(wq.y,u_res.y-wq.y));
 float b0=cv?smoothstep(-sz,sz,dc):T(uv).r,bo=cv?smoothstep(-sz,sz,dq):T(uv-off).r;vec3 gc=vec3(1.,1.,.745);float a=u_p3;vec3 r=col;
 if(st==0)r=col*(1.-a*m0*clamp((1.-bo)*1.6,0.,1.));
 else if(st==1){float gg=(1.-m0)*clamp(b0*2.,0.,1.);r=1.-(1.-col)*(1.-gc*gg*a);}
 else if(st==2){float gg=m0*clamp((1.-b0)*2.,0.,1.);r=1.-(1.-col)*(1.-gc*gg*a);}
 else r=col*(1.-a*(1.-m0)*clamp(bo*1.3,0.,1.));
 return vec4(r,1.);`],
  'Photoshop layer-style defaults (angle 120 deg, distance = size / 2, shadows black multiply, glows pale yellow 255/255/190 screen) applied to a shape taken from the image: luma > 0.5 (or the dark side, or automatically the minority tone), or the whole canvas; Gaussian falloff instead of the precise / choke options');

f = add('Analysis');
f('visualizespots','Visualize Spots (Lightroom)',[P('Threshold',0,1,.35,.01),P('Spot size',1,8,2,.5,'px'),S('Output',['Visualize (white on black)','Overlay on image'])],
  `float l=L(uv);float d=max(R(u_p1),1.);float hp=abs(l-blurL(uv,d*.6))+.5*abs(l-blurL(uv,d*1.6));float t=mix(.16,.006,u_p0);float v=smoothstep(t,t*1.7,hp);
 if(u_p2>.5)return vec4(mix(c.rgb*.55,vec3(1.,.95,.2),v),1.);return vec4(vec3(v),1.);`,
  'Lightroom Spot Removal "Visualize Spots" approx.: local luminance deviation from small-scale means (high-pass at the spot size), thresholded by the slider so dust spots and edges show as white outlines on black');
