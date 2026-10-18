/* ================= q52b: round-19 Nukepedia gizmos, part 2 (built from the nukepedia.com tool pages; approx. where the gizmo is login-gated) ================= */
f = add('Analysis');
f('q52_gradanalyzer','Gradient Analyzer Isolines (Nukepedia jm_gradientAnalyzer)',[P('Line count',4,128,16,1),P('Roll',0,1,0,.005),P('Line width',.3,3,1,.05,'px'),S('Background',['Dimmed image','Black'])],
  `float l=blurL(uv,u_k);float v=l*u_p0+u_p1;float fw=max(fwidth(v),1e-5);float fd=abs(fract(v+.5)-.5)/fw;float ln=1.-smoothstep(u_p2*u_k*.5,u_p2*u_k*.5+1.,fd);
 vec2 g=sobel(uv);vec3 hc=hsv2rgb(vec3(atan(g.y,g.x)/6.2831853+.5,.55,1.));vec3 bg=u_p3>.5?vec3(0.):c.rgb*.35;return vec4(mix(bg,hc,ln),1.);`,
  'jm_gradientAnalyzer (Johannes Mogelvang): draws lines perpendicular to the gradient - i.e. iso-luminance contours at Line count levels - so bumps from cleanup/cloning in soft gradients show as kinks; Roll shifts the levels (the "Pre CC" roll) so every part of the image can be inspected; lines tinted by gradient direction (approx., built from the description)');

f = add('Render');
f('q52_steelwool','Steel Wool Burning Sparks (Nukepedia T_SteelWool)',[P('Density',.2,3,1,.01),P('Spark length',5,120,40,1,'px'),P('Map threshold',0,1,.6,.01),P('Time',0,10,0,.01)],
  `vec2 pp=PX(uv);float G=u_p1;vec2 ci=floor(pp/G);float fr=floor(u_p3*24.);vec3 acc=vec3(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)for(int k=0;k<3;k++){vec2 id=ci+vec2(float(i),float(j));vec2 hs=id+vec2(float(k)*7.13+fr*.917,u_seed*3.7+fr*.31);
  if(hash(hs)>u_p0/3.)continue;vec2 o=(id+vec2(hash(hs+1.3),hash(hs+2.9)))*G;if(luma(O(fromPX(o)).rgb)<u_p2)continue;
  float an=hash(hs+4.7)*6.2831853;float ln=G*(.35+.65*hash(hs+6.1));vec2 dv=vec2(cos(an),sin(an));vec2 w=pp-o;float t=clamp(dot(w,dv)/ln,0.,1.);
  float bend=(hash(hs+8.3)-.5)*.6*ln*t*t;vec2 nrm=vec2(-dv.y,dv.x);float dd=length(w-dv*t*ln-nrm*bend);
  float br=exp(-dd*dd/.5)*pow(1.-t,1.3)*(.6+.8*hash(hs+9.7));acc+=br*mix(vec3(1.,.38,.06),vec3(1.,.92,.75),pow(1.-t,3.));}
 float m=smoothstep(u_p2-.05,u_p2+.05,L(uv));vec2 gd=vec2(dFdx(m),dFdy(m));float edge=clamp(length(gd)*3.,0.,1.);
 vec3 r=c.rgb+acc*1.4+edge*vec3(1.,.45,.1)*.8;return vec4(clamp(r,0.,1.),1.);`,
  'T_SteelWool (Petar Tsonev) idea: the image luma above Map threshold stands in for the roto/paint map; seeded sparks (cell-scattered emitters on the map) fly out as hot, bending, fading streaks (white core cooling to orange), plus an orange burning-edge line on the map border; Time steps the flicker (approx., no leading-edge mask output)',true);

f('q52_treegobo','Tree Gobo Dappled Light (Nukepedia Tree_Gobo)',[P('Tree size',.2,3,1,.01),P('Foliage density',0,1,.55,.01),P('Softness',0,1,.4,.01),P('Shadow strength',0,1,.7,.01)],
  `vec2 p=PX(uv)/(160.*u_p0)+u_seed*5.3;vec2 wq=vec2(fbm(p*.7),fbm(p*.7+4.1));vec2 q=p+wq*1.3;
 float lv=fbm(q*2.2)*.65+fbm(q*7.)*.35;float br=1.-smoothstep(.0,.06+.1*u_p2,abs(fbm(q*.6+9.)-.5)-.02);float fol=max(lv+.5*(u_p1-.5),br*.9*u_p1);
 float sw=.03+.2*u_p2;float lt=1.-smoothstep(.5-sw,.5+sw,fol);vec3 sun=vec3(1.08,1.,.88),sh=vec3(.8,.88,1.)*(1.-u_p3);
 return vec4(clamp(c.rgb*mix(sh,sun,lt),0.,1.),1.);`,
  'Tree_Gobo (Moises Moreno) idea: a tree-shaped gobo of leaf clusters (domain-warped two-scale fbm, Foliage density) and branch silhouettes casts dappled light over the image - lit holes warm, shadowed areas cool and darker (Shadow strength); Softness = the bokeh blur of the gobo; static, no wind animation (approx.)',true);

f = add('Stylize');
f('q52_prisming','Alpha-Driven Prism Light (Nukepedia C_Prisming)',[P('Strength',0,40,12,.5,'px'),P('Dispersion',0,1,.5,.01),P('Smoothness',1,10,3,.5,'px'),S('Surface',['Convex','Concave'])],
  `float d=R(u_p2);vec2 e=vec2(d,0.)*u_px,f2=vec2(0.,d)*u_px;vec2 g=vec2(blurL(uv+e,d*.5)-blurL(uv-e,d*.5),blurL(uv+f2,d*.5)-blurL(uv-f2,d*.5));
 vec2 dv=g*R(u_p0)*2.*(u_p3>.5?-1.:1.);vec3 acc=vec3(0.),ws=vec3(0.);
 for(int k=0;k<9;k++){float t=float(k)/8.;vec3 sp=clamp(abs(fract(t*.85+vec3(0.,.6667,.3333))*6.-3.)-1.,0.,1.);
  vec3 s=O(uv-dv*(1.+u_p1*1.6*(t-.5))*u_px).rgb;acc+=s*sp;ws+=sp;}
 return vec4(acc/ws,1.);`,
  'C_Prisming (Chris Charlton) idea: a height from the alpha (here luma, smoothed; uses a Normalish-style gradient) refracts the image like a convex or concave surface, and the displacement is spread over 9 spectral samples so light splits into a rainbow (Dispersion) (approx., no alpha input)');

f = add('Tone');
f('q52_dscexposure','Digital Still Camera Exposure (Nukepedia / colour-hdri)',[P('ISO',50,6400,100,10),P('Shutter 1 over',1,4000,125,1,'s'),P('Aperture f-number',1,22,8,.1),P('Scene white cd per m2',100,40000,8000,100)],
  `float q=.78539816*.9*.98*pow(cos(radians(10.)),4.);float t=1./u_p1;float k=q*t*u_p0/(78.*u_p2*u_p2)*u_p3;vec3 x=${LIN('c.rgb')}*k;x=min(x,vec3(1.));return vec4(${SRGB('x')},1.);`,
  'Digital Still Camera Exposure (colour-hdri dsc.py, ISO 12232:2006): pixel value 1.0 = scene luminance "Scene white"; focal-plane exposure H = q L t / N^2 with q = pi/4 T f_v cos^4(theta) (T 0.9, f_v 0.98, theta 10 deg), saturation-based-speed exposure H_SBS = H S / 78, so 1.0 = sensor saturation (clipped)');

f('q52_hdribloom','HDRI Bloom Extract (Nukepedia HDRIBloomExtract)',[P('Range',.5,1,.85,.005),P('Range rolloff',0,.5,.12,.005),P('Blur size',2,80,20,1,'px'),S('Output',['Bloom only','Bloom over image','Core removed'])],
  [`float m=smoothstep(u_p0-u_p1,u_p0+.001,L(uv));if(u_p3>1.5)return vec4(c.rgb*(1.-m),1.-m);return vec4(c.rgb*m,1.);`, BH('u_p2'), BV('u_p2'),
   `vec3 o=O(uv).rgb;vec4 b=T(uv);float m=smoothstep(u_p0-u_p1,u_p0+.001,luma(o));if(u_p3>1.5)return vec4(mix(o,b.rgb/max(b.a,.02),m),1.);
 vec3 bl=clamp(b.rgb*1.6,0.,1.);return vec4(u_p3>.5?1.-(1.-o)*(1.-bl):bl,1.);`],
  'HDRIBloomExtract idea: the bloom / light spill around bright areas = pixels above Range (soft Range rolloff) blurred by Blur size; output the bloom alone, screened back, or with the bright core (sun) removed and filled from its blurred surroundings (normalised convolution) - no exposure check / crop-box UI (approx.)');

f('q52_lightoff','Light Off Highlight Flatten (Nukepedia MM_LightOff)',[P('Amount',0,1,.6,.01),P('Flatten',0,1,.5,.01),P('Darken',0,1,.15,.01)],
  [`return vec4(vec3(L(uv)),1.);`, BH('40.'), BV('40.'),
   `vec3 o=O(uv).rgb;vec3 x=${LIN('o')};float kk=u_p0*1.5;for(int i=0;i<3;i++)x=x/(1.+kk*x)*(1.+kk*.18);
 float ml=T(uv).r;float mlin=pow(max(ml,.02),2.2);x*=pow(mlin/.18,-u_p1*.6);float y=dot(x,vec3(.2126,.7152,.0722));
 x=mix(vec3(y),x,1.-.35*u_p0);x*=1.-u_p2*.85;x=clamp(x,0.,1.);return vec4(${SRGB('x')},1.);`],
  'MM_LightOff idea (after the grade-stacking technique of Kenn Hedin Kalvik): three stacked highlight-compressing grades pivoting at mid grey kill the highlights, a large-scale local mean divides out the light direction (Flatten) to turn sun into overcast, slight desaturation, optional Darken for day-for-night (approx.)');

f('q52_perlingain','Perlin Gain Contrast (Nukepedia Perlin Gain)',[P('Gain',0,1,.65,.005),S('Apply to',['Luminance','RGB'])],
  `float e=log(max(1.-u_p0,1e-4))/-.6931472;vec3 x=c.rgb;
 vec3 lo=.5*pow(clamp(2.*x,0.,1.),vec3(e)),hi=1.-.5*pow(clamp(2.-2.*x,0.,1.),vec3(e));vec3 gx=mix(lo,hi,step(.5,x));gx=mix(gx,x,step(1.,x));
 if(u_p1>.5)return vec4(gx,1.);float y=luma(x);float gy=y<.5?.5*pow(2.*y,e):1.-.5*pow(max(2.-2.*y,0.),e);if(y>=1.)gy=y;
 return vec4(x*gy/max(y,1e-4),1.);`,
  'Ken Perlin gain function: gain(x,g) = bias(2x,1-g)/2 below 0.5, 1 - bias(2-2x,1-g)/2 above, bias(t,b) = t^(ln b / ln 0.5); g = 0.5 is identity, above boosts and below mutes contrast; on luminance only (RGB scaled, hue/saturation kept) or per channel; superwhites untouched');

f = add('Materials');
f('q52_voronoitex','Voronoi Texture Extractor (Nukepedia VoronoiTextureExtractor)',[P('Patch X',0,1,.5,.01),P('Patch Y',0,1,.5,.01),P('Patch size',.05,.5,.15,.005),P('Cell scale',.02,.5,.1,.005)],
  `vec2 p=uv*vec2(asp(),1.)/u_p3;vec2 ci=floor(p);float dmin=1e9;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=ci+vec2(float(i),float(j));vec2 cc=id+vec2(hash(id+u_seed),hash(id+u_seed+1.7));dmin=min(dmin,length(p-cc));}
 vec3 acc=vec3(0.);float ws=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=ci+vec2(float(i),float(j));vec2 cc=id+vec2(hash(id+u_seed),hash(id+u_seed+1.7));float w=exp(-(length(p-cc)-dmin)*24.);
  float an=hash(id+u_seed+3.3)*6.2831853;vec2 lc=(p-cc)*u_p3;lc=vec2(cos(an)*lc.x-sin(an)*lc.y,sin(an)*lc.x+cos(an)*lc.y)/u_p2;
  vec2 tr=abs(fract(.5*lc+.25)*2.-1.)-.5;vec2 su=vec2(u_p0+tr.x*u_p2/asp(),u_p1+tr.y*u_p2);acc+=O(su).rgb*w;ws+=w;}
 return vec4(acc/ws,1.);`,
  'VoronoiTextureExtractor (MassieVFX) idea: crops a square patch (centre Patch X/Y, size in frame heights) and scatters it over the frame in Voronoi cells (Cell scale), each cell with a seeded random rotation and mirrored tiling of the patch, soft-blended at cell borders (approx.)',true);

f = add('Frames');
f('q52_edgemirror','Edge Mirror Padding (Nukepedia EdgeMirror)',[P('Shift X',-.5,.5,.1,.005),P('Shift Y',-.5,.5,0,.005),P('Zoom out',1,3,1.5,.01)],
  `vec2 q=(uv-.5)*u_p2+.5-vec2(u_p0,u_p1);q=1.-abs(mod(q,2.)-1.);return vec4(O(q).rgb,1.);`,
  'EdgeMirror (Andriy Koval): the image edges are mirrored in all directions, so area uncovered by a shift (camera shake / stabilisation) or a zoom-out is filled with reflected picture instead of black; Shift and Zoom out show the padding');

f = add('Depth');
f('q52_beerlambert','Beer-Lambert Underwater Attenuation (Nukepedia)',[P('Distance max',1,60,15,.5,'m'),P('Water depth',0,40,6,.5,'m'),P('Haze',0,1,.5,.01),S('Water type',['Clear ocean','Coastal','Turbid green'])],
  `vec3 al=u_p3<.5?vec3(.45,.07,.025):u_p3<1.5?vec3(.5,.11,.12):vec3(.6,.16,.4);vec3 bi=u_p3<.5?vec3(.01,.2,.35):u_p3<1.5?vec3(.03,.25,.27):vec3(.1,.27,.12);
 float l=(1.-D(uv))*u_p0;vec3 x=${LIN('c.rgb')};vec3 dw=exp(-al*u_p1);vec3 tr=exp(-al*l);vec3 r=x*dw*tr+bi*dw*(1.-tr)*u_p2*1.5;r=clamp(r*1.6,0.,1.);
 return vec4(${SRGB('r')},1.);`,
  'Beer-Lambert underwater attenuation: I = I0 exp(-alpha l) per channel with water absorption coefficients (red absorbed fastest); path l = (1 - depth) x Distance max, downwelling light attenuated by Water depth, optional haze = backscatter toward the water colour (1 - transmission); depth pass input (approx. coefficients, no deep version)');

f = add('Repair');
f('q52_wrinkle','Directional Wrinkle Removal (Nukepedia Directional_wrinkle_remove)',[P('Wrinkle blur',1,40,10,.5,'px'),P('Texture',0,2,1,.01),P('Angle',-90,90,0,1,'deg')],
  [`float a=radians(u_p2);return blur1d(u_tex,uv,vec2(-sin(a),cos(a)),R(u_p0));`,
   `vec3 o=O(uv).rgb;vec3 sb=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)sb+=O(uv+vec2(float(i),float(j))*u_px*max(u_k,1.)).rgb;sb/=9.;
 return vec4(clamp(T(uv).rgb+(o-sb)*u_p1,0.,1.),1.);`],
  'Directional_wrinkle_remove (Ashish Kumar) idea: wrinkles running along Angle are blurred across (directional blur perpendicular to them, WrinkleBlur), then fine skin texture (3x3 high-pass of the original) is added back (texture_ctrl); use under a mask for de-aging (approx.)');

f = add('Distort');
f('q52_dirdisplace','Directional Displace by HSV Map (Nukepedia Directional Displace)',[P('Position',0,1,.5,.01),P('Scale',0,80,20,.5,'px'),P('Map blur',0,20,4,.5,'px')],
  [BH('u_p2'), BV('u_p2'),
   `vec3 h=rgb2hsv(clamp(c.rgb,0.,1.));float an=h.x*6.2831853;float amt=abs(sin(1.5707963*(u_p0+2.*(1.-h.z))));vec2 off=vec2(cos(an),sin(an))*h.y*R(u_p1)*amt;
 return vec4(O(uv+off*u_px).rgb,1.);`],
  'Directional Displace (dninosores, github directional-displace-gizmo): map hue = displacement direction (angle on the colour wheel), saturation = distance, value = phase of the Position knob (value 1: none at 0, max at 1; value 0.5: max at 0, none at 1); there is no second input here, so the map is the blurred image itself (approx.)');
