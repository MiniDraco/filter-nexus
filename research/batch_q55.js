/* ================= q55: round-19 Leptonica colour / edge / warper / rank ops, Nukepedia EnvironmentBlur / gyroid / cubeKey, SC Post Effects, Seti Astro Star Stretch ================= */
// Leptonica piecewise-linear per-channel map [0,s]->[0,d], [s,1]->[d,1] (pixLinearMapToTargetColor), s clamped to [1,254]/255
const Q55_LMAP = (x, s, d) => `mix((${x})*(${d})/(${s}),(${d})+(1.-(${d}))*((${x})-(${s}))/(1.-(${s})),step((${s})+1e-6,(${x})))`;

f = add('Color');
f('q55_lept_invhue','Hue-Invariant Map (Leptonica pixMapWithInvariantHue)',[P('Ref red',0,255,150,1),P('Ref green',0,255,120,1),P('Ref blue',0,255,100,1),P('Fraction',-1,1,.3,.01)],
  `vec3 s0=vec3(u_p0,u_p1,u_p2)/255.;float fr=u_p3;vec3 d=fr<0.?(1.+fr)*s0:s0+fr*(1.-s0);vec3 s=clamp(s0,1./255.,254./255.);
 vec3 o=${Q55_LMAP('c.rgb','s','d')};return vec4(clamp(o,0.,1.),1.);`,
  'Leptonica coloring.c pixMapWithInvariantHue: dst = pixelFractionalShift(src, fract) (fract < 0: (1+fract)*src toward black; fract > 0: src + fract*(255-src) toward white, hue kept), then pixLinearMapToTargetColor(src -> dst): per channel [0,s] -> [0,d] and [s,255] -> [d,255] (s clamped to 1..254)');
f('q55_lept_lintarget','Linear Map to Target Colour (Leptonica pixLinearMapToTargetColor)',[S('Source colour',['Image mean (12x12 grid)','Mid grey 128','Paper 220 210 190','Skin 200 150 120','Sky 120 160 220']),P('Target hue',0,360,30,1),P('Target saturation',0,1,.3,.01),P('Target value',0,1,.62,.01)],
  `int m=int(u_p0+.5);vec3 s;if(m==0){vec3 a=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)a+=O((vec2(float(i),float(j))+.5)/12.).rgb;s=a/144.;}
 else s=(m==1?vec3(128.):m==2?vec3(220.,210.,190.):m==3?vec3(200.,150.,120.):vec3(120.,160.,220.))/255.;
 s=clamp(s,1./255.,254./255.);vec3 d=hsv2rgb(vec3(u_p1/360.,u_p2,u_p3));vec3 o=${Q55_LMAP('c.rgb','s','d')};return vec4(clamp(o,0.,1.),1.);`,
  'Leptonica coloring.c pixLinearMapToTargetColor: three per-channel piecewise-linear LUTs sending the source colour s to the target d ([0,s] -> [0,d], [s,255] -> [d,255]; s clamped to 1..254); source = a preset or the image mean (12x12 sample grid), target given as HSV');
f('q55_lept_satboost','Saturation-Boosted Grey (Leptonica pixConvertRGBToGraySatBoost)',[P('Reference value',1,255,100,1)],
  `float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));float sv=mx>0.?(mx-mn)/mx:0.;float fs=min(1.,mx*255./u_p0);return vec4(vec3(sv*fs+(1.-sv)*mx),1.);`,
  'Leptonica pixconv.c pixConvertRGBToGraySatBoost (after Qumsiyeh): sat = (max-min)/max, fullsat = min(255, 255*max/refval), out = sat*fullsat + (1-sat)*max; grey pixels give max, saturated ones rise with slope 255/refval');
f('q55_lept_darkengray','Darken Grey Pixels (Leptonica pixDarkenGray)',[P('Threshold',0,255,200,1),P('Saturation limit',1,255,40,1)],
  `float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));float sa=(mx-mn)*255.;vec3 o=c.rgb;if(mx*255.<u_p0&&sa<u_p1)o=c.rgb*sa/u_p1;return vec4(o,1.);`,
  'Leptonica enhance.c pixDarkenGray: sat = max-min; pixels with max >= thresh or sat >= satlimit unchanged, the rest scaled by sat/satlimit (unsaturated grey goes toward black)');
f('q55_lept_colorgray','Colour Grey (Leptonica pixColorGray)',[S('Type',['Paint light','Paint dark']),P('Threshold',0,255,60,1),P('Hue',0,360,30,1),P('Saturation',0,1,.7,.01)],
  `int m=int(u_p0+.5);float av=floor((c.r+c.g+c.b)*255./3.)/255.;vec3 t=hsv2rgb(vec3(u_p2/360.,u_p3,1.));float th=u_p1/255.;vec3 o=c.rgb;
 if(m==0){if(av>=th)o=t*av;}else{if(av<=th)o=t+(1.-t)*av;}return vec4(o,1.);`,
  'Leptonica coloring.c pixColorGray (RGB path): gray = (r+g+b)/3; LIGHT: pixels with gray >= thresh become target*gray/255 (non-black colourised, antialiasing kept); DARK: pixels with gray <= thresh become target + (255-target)*gray/255. As in the RGB code there is no saturation test (only the colormap path restricts to strictly grey pixels); target = HSV(hue, sat, 1)');

f = add('Edges');
f('q55_lept_twosided','Two-Sided Edge Filter (Leptonica pixTwoSidedEdgeFilter)',[S('Orientation',['Vertical edges','Horizontal edges','Both (max)']),P('Gain',1,10,4,.1)],
  `vec2 e=u_px*max(u_k,1.);float a=L(uv),h=0.,v=0.;
 {float lg=a-L(uv-vec2(e.x,0.)),rg=L(uv+vec2(e.x,0.))-a;if(lg*rg>0.)h=min(abs(lg),abs(rg));}
 {float lg=a-L(uv-vec2(0.,e.y)),rg=L(uv+vec2(0.,e.y))-a;if(lg*rg>0.)v=min(abs(lg),abs(rg));}
 int m=int(u_p0+.5);float o=m==0?h:m==1?v:max(h,v);return vec4(vec3(clamp(o*u_p1,0.,1.)),1.);`,
  'Leptonica edge.c pixTwoSidedEdgeFilter on luma: left and right (or top and bottom) gradients; where both have the same sign (a transition, not one-pixel noise) the smaller magnitude is kept, else 0; x Gain for display');

f = add('Distort');
f('q55_lept_qvshear','Quadratic Vertical Shear (Leptonica pixQuadraticVShear)',[S('Direction',['Warp to left','Warp to right']),P('Top shift',-30,30,10,.5,'%'),P('Bottom shift',-30,30,0,.5,'%')],
  `float W=u_res.x,H=u_res.y;vec2 wp=uv*u_res;float j=wp.x-.5,id=H-wp.y-.5,wm=W-1.,hm=H-1.;float q=u_p0<.5?(wm-j)/wm:j/wm;q*=q;
 float dt=u_p1*.01*H*q,db=u_p2*.01*H*q;float si=id-(dt*(hm-id)+db*id)/H;if(si<0.||si>hm)return vec4(1.);return vec4(T(vec2(uv.x,1.-(si+.5)/H)).rgb,1.);`,
  'Leptonica warper.c pixQuadraticVShear (interpolated, bring in white): column displacement delt = vmaxt*(wm-j)^2/wm^2 (to left; to right uses j^2), same for the bottom, row displacement = (delt*(h-1-i) + delb*i)/h; shifts given as % of the height');
f('q55_lept_hstretch','Horizontal Stretch (Leptonica pixStretchHorizontal)',[S('Direction',['Warp to left','Warp to right']),S('Type',['Linear','Quadratic']),P('Max shift',0,50,15,.5,'%')],
  `float W=u_res.x;float jd=uv.x*W-.5,wm=W-1.;float tl=u_p0<.5?(wm-jd)/wm:jd/wm;if(u_p1>.5)tl*=tl;float js=jd-u_p2*.01*W*tl;
 if(js<0.||js>wm)return vec4(1.);return vec4(T(vec2((js+.5)/W,uv.y)).rgb,1.);`,
  'Leptonica warper.c pixStretchHorizontal (L_INTERPOLATED, bring in white): source column j = jd - hmax*(wm-jd)/wm (to left, linear), (wm-jd)^2/wm^2 (quadratic), jd/wm or jd^2/wm^2 (to right); hmax as % of the width');
f('q55_lept_stereo','Stereoscopic Red Warp (Leptonica pixWarpStereoscopic)',[P('Z bend',-60,60,20,1,'px'),P('Z shift top',-60,60,15,1,'px'),P('Z shift bottom',-60,60,-15,1,'px'),P('Y bend top',-60,60,30,1,'px')],
  `float W=u_res.x,H=u_res.y,hw=floor(W*.5);vec2 wp=uv*u_res;float x=wp.x-.5,id=H-wp.y-.5,hm=H-1.;
 float zb=-R(u_p0),zt=-R(u_p1),zbt=-R(u_p2),yb=R(u_p3);
 #define Q55VS(xx_,o_) {float lw=(xx_)<hw?hw-1.:W-hw-1.;float jj=(xx_)<hw?(xx_):(xx_)-hw;float qq=(xx_)<hw?(lw-jj)/lw:jj/lw;float si=id-yb*qq*qq*(hm-id)/H;o_=(si<0.||si>hm||(xx_)<0.||(xx_)>W-1.)?vec4(1.):T(vec2(((xx_)+.5)/W,1.-(si+.5)/H));}
 vec4 gb;Q55VS(x,gb);
 float sh=zt==zbt?zt:trunc((zt+zbt)*.5)+(zbt-zt)/max(1.,H)*(id-H*.5);float x1=x-sh;float red=1.;
 if(x1>=0.&&x1<=W-1.){bool lf=x1<hw;float lw=lf?hw-1.:W-hw-1.;float jd=lf?x1:x1-hw;float tq=lf?(lw-jd)/lw:jd/lw;float js=jd-zb*tq*tq;
  if(js>=0.&&js<=lw){float x2=lf?js:hw+js;vec4 rv;Q55VS(x2,rv);red=rv.r;}}
 return vec4(red,gb.g,gb.b,1.);`,
  'Leptonica warper.c pixWarpStereoscopic (redleft = 1, so zbend/zshift are negated; ybendb = 0): quadratic vertical shear of each half (left warp-to-left, right warp-to-right, centre line fixed); red only: quadratic horizontal stretch of each half by zbend, then translate by (zshiftt+zshiftb)/2 and horizontal shear about the middle row so the top moves zshiftt and the bottom zshiftb (sign of the shear inferred from the documented intent); white brought in; px at reference scale');
f('q55_lept_harmonic','Random Harmonic Warp (Leptonica pixRandomHarmonicWarp)',[P('Terms',1,4,2,1),P('Magnitude scale',0,4,1,.05),P('Frequency scale',.1,4,1,.05)],
  `int nt=int(u_p0+.5);float xm=nt==1?7.:nt==2?5.:nt==3?4.:3.,ym=nt==1?10.:nt==2?8.:nt==3?6.:5.,xf=nt==1?.12:nt<4?.1:.11,yf=nt==1?.15:nt<4?.13:.11;
 xm*=u_p1;ym*=u_p1;xf*=u_p2;yf*=u_p2;vec2 p=PX(uv);p.y=u_res.y/u_k-p.y;vec2 d=vec2(0.);
 #define Q55RN(n_) (.5+.5*hash(vec2((n_),3.7)))
 for(int i=0;i<8;i++){if(i>=2*nt)break;float b=float(3*i);if(i<nt)d.x+=xm*Q55RN(b)*sin(xf*Q55RN(b+1.)*p.x+6.283185*Q55RN(b+2.))*sin(yf*Q55RN(b+3.)*p.y+6.283185*Q55RN(b+4.));
  else d.y+=ym*Q55RN(b)*sin(yf*Q55RN(b+1.)*p.y+6.283185*Q55RN(b+2.))*sin(xf*Q55RN(b+3.)*p.x+6.283185*Q55RN(b+4.));}
 vec2 q=p+d;q.y=u_res.y/u_k-q.y;vec2 u2=fromPX(q);if(any(lessThan(u2,vec2(0.)))||any(greaterThan(u2,vec2(1.))))return vec4(1.);return vec4(T(u2).rgb,1.);`,
  'Leptonica warper.c pixRandomHarmonicWarp with the pixSimpleCaptcha per-order tables (xmag 7/5/4/3, ymag 10/8/6/5, xfreq .12/.10/.10/.11, yfreq .15/.13/.13/.11, nx = ny = terms): x += xmag*r0*sin(xfreq*r1*x + 2pi r2)*sin(yfreq*r3*y + 2pi r4) and likewise for y, random r in [0.5,1] (indexed with stride 3 as in the source), bilinear, white outside; px at reference scale; the seed re-draws the r values', true);

f = add('Analysis');
f('q55_lept_rankcascade','Cascaded 2x Rank Reduction (Leptonica pixScaleGrayRankCascade)',[P('Level 1 rank',0,4,1,1),P('Level 2 rank',0,4,1,1),P('Level 3 rank',0,4,0,1),P('Level 4 rank',0,4,0,1)],
  `vec4 rk=floor(vec4(u_p0,u_p1,u_p2,u_p3)+.5);int n=rk.x<.5?0:rk.y<.5?1:rk.z<.5?2:rk.w<.5?3:4;vec2 wp=floor(uv*u_res);
 if(n==0)return vec4(vec3(luma(c.rgb)),1.);int S=1<<n;vec2 o=floor(wp/float(S))*float(S);float a[256];
 for(int j=0;j<16;j++){if(j>=S)break;for(int i=0;i<16;i++){if(i>=S)break;a[j*S+i]=luma(O(min(o+vec2(float(i),float(j))+.5,u_res-.5)/u_res).rgb);}}
 for(int lv=0;lv<4;lv++){if(lv>=n)break;int s=S>>lv;int hh=s/2;int r=int(rk[lv]);
  for(int cy=0;cy<8;cy++){if(cy>=hh)break;for(int cx=0;cx<8;cx++){if(cx>=hh)break;int b=2*cy*s+2*cx;float v0=a[b],v1=a[b+1],v2=a[b+s],v3=a[b+s+1];
   float s0=min(v0,v1),s1=max(v0,v1),s2=min(v2,v3),s3=max(v2,v3);float m1=max(s0,s2),m2=min(s1,s3);
   a[cy*hh+cx]=r==1?min(s0,s2):r==4?max(s1,s3):r==2?min(m1,m2):max(m1,m2);}}}
 return vec4(vec3(a[0]),1.);`,
  'Leptonica scale2.c pixScaleGrayRankCascade: up to four cascaded pixScaleGrayRank2 reductions of the grey image (rank 1 = min, 2 = second smallest, 3 = second largest, 4 = max of each 2x2 block), a level of 0 ends the cascade; shown pixel-replicated at the input size (working pixels)');

f = add('Blur');
f('q55_envblur','Environment Blur (Nukepedia EnvironmentBlur)',[P('Phong exponent',1,60,4,.5)],
  [`vec3 a=vec3(0.);for(int j=0;j<6;j++)for(int i=0;i<6;i++)a+=O(uv+(vec2(float(i),float(j))-2.5)/6.*vec2(1./48.,1./24.)).rgb;return vec4(a/36.,1.);`,
   `float n=max(u_p0,1.);float th=(2.*uv.x-1.)*PI,ga=(2.*uv.y-1.)*PI*.5;vec3 cd=vec3(sin(th)*cos(ga),sin(ga),cos(th)*cos(ga));vec3 acc=vec3(0.);float ws=0.;
 for(int j=0;j<24;j++){float gj=((float(j)+.5)/24.*2.-1.)*PI*.5;float cg=cos(gj),sg=sin(gj);for(int i=0;i<48;i++){float ti=((float(i)+.5)/48.*2.-1.)*PI;
  float dd=dot(cd,vec3(sin(ti)*cg,sg,cos(ti)*cg));if(dd<=0.)continue;float w=pow(dd,n)*cg;acc+=w*T(vec2((float(i)+.5)/48.,(float(j)+.5)/24.)).rgb;ws+=w;}}
 return vec4(ws>0.?acc/ws:c.rgb,1.);`],
  'Nukepedia EnvironmentBlur (Haarm-Pieter Duiker, BlinkScript source on the tool page): lat-long panorama, every output direction = sum of max(dot(c,d),0)^exponent * solid angle * src / sum of weights (1 = Lambertian diffuse); here integrated over a 48x24 grid of area-prefiltered cells (approx. of the per-pixel sum; exponent capped at 60 to stay above the grid resolution)');

f = add('Noise');
f('q55_gyroid','Gyroid Noise (Nukepedia WorleyNoise gyroid mode)',[P('Scale',4,200,40,1,'px'),P('Z slice',0,6.283,1.2,.01),P('Line width',.02,1,.25,.01),P('Distortion',0,2,1.2,.01)],
  `vec2 p=PX(uv)/u_p0*6.2831853;p+=u_p3*6.*(vec2(fbm(p*.07),fbm(p*.07+7.3))-.5);float z=u_p1+u_p3*9.*fbm(p*.05+3.1);
 float g=sin(p.x)*cos(p.y)+sin(p.y)*cos(z)+sin(z)*cos(p.x);return vec4(vec3(clamp(1.-abs(g)/max(u_p2,.001),0.,1.)),1.);`,
  'approx.: the WorleyNoise tool page only lists a gyroid mode (worm / brain-coral patterns, domain warping); this uses the standard gyroid sin x cos y + sin y cos z + sin z cos x on a z slice, fbm domain distortion plus an fbm-varied z slice, and an |g| < width band', true);

f = add('Analysis');
f('q55_cubekey','Cube Key (Nukepedia cubeKey)',[S('Colour space',['RGB','HSV','YCbCr']),S('Key colour',['Green screen','Blue screen','Red','Skin','Sky'],3),P('Cube size',.02,1,.4,.01),P('Softness',0,.5,.1,.01)],
  `int sp=int(u_p0+.5),kc=int(u_p1+.5);vec3 k=kc==0?vec3(.2,.7,.25):kc==1?vec3(.1,.25,.75):kc==2?vec3(.8,.15,.12):kc==3?vec3(.85,.62,.5):vec3(.45,.65,.9);
 vec3 p=c.rgb;vec3 q=k;if(sp==1){p=rgb2hsv(p);q=rgb2hsv(q);}else if(sp==2){p=vec3(dot(p,vec3(.299,.587,.114)),.5+dot(p,vec3(-.168736,-.331264,.5)),.5+dot(p,vec3(.5,-.418688,-.081312)));q=vec3(dot(q,vec3(.299,.587,.114)),.5+dot(q,vec3(-.168736,-.331264,.5)),.5+dot(q,vec3(.5,-.418688,-.081312)));}
 vec3 d=abs(p-q);if(sp==1)d.x=min(d.x,1.-d.x);float h=u_p2*.5;vec3 mm=1.-smoothstep(vec3(h),vec3(h+u_p3+1e-4),d);float m=mm.x*mm.y*mm.z;
 return vec4(mix(vec3(luma(c.rgb))*.25,c.rgb,m),1.);`,
  'approx. of Nukepedia cubeKey (Derek Rein; page: select colours in a 3D cube in a chosen colour space, with softness): axis-aligned cube of side Size around a preset key colour in RGB, HSV (circular hue) or YCbCr, soft edge per axis; selected colours shown, the rest dimmed grey (matte = selection)');

f = add('Render');
f('q55_cloudshadow','Cloud Shadows (SC Post Effects)',[P('Cloud size',20,600,180,1,'px'),P('Density',0,1,.5,.01),P('Opacity',0,1,.6,.01),P('Scroll',0,1,0,.01)],
  `vec2 p=PX(uv)/u_p0+vec2(u_p3*4.,u_p3*1.5);float n=fbm(p);float t=mix(.72,.3,u_p1);float cl=smoothstep(t-.07,t+.07,n);
 float k=cl*u_p2;return vec4(c.rgb*(1.-k)*mix(vec3(1.),vec3(.88,.93,1.),k),1.);`,
  'approx. of SC Post Effects Cloud Shadows (docs: projects a scrolling cloud texture over the world): an fbm cloud texture in screen space (no world projection) thresholded by Density darkens the image by Opacity with a slightly cool shadow tint; Scroll moves it', true);

f = add('Blur');
f('q55_doublevision','Double Vision (SC Post Effects)',[S('Mode',['Full screen','Edges']),P('Offset',0,10,2.5,.1,'%'),P('Intensity',0,1,.6,.01)],
  `float a=u_p1*.01;if(int(u_p0+.5)==1){vec2 d=(uv-.5)*vec2(asp(),1.);a*=smoothstep(.2,.75,length(d));}
 vec3 dv=.5*(T(uv+vec2(a,0.)).rgb+T(uv-vec2(a,0.)).rgb);return vec4(mix(c.rgb,dv,u_p2),1.);`,
  'approx. of SC Post Effects Double Vision (docs: makes the camera look cross-eyed, optionally limited to the screen edges): average of two horizontally offset copies mixed by Intensity; Edges mode scales the offset with the distance from the centre');

f = add('Tone');
f('q55_starstretch','Star Stretch (Seti Astro Suite Pro)',[P('Stretch amount',0,8,1,.01),P('Color boost',0,2,1,.01),S('SCNR',['Off','On (average neutral)'])],
  `float fa=pow(3.,u_p0);vec3 x=clamp(fa*c.rgb/((fa-1.)*c.rgb+1.),0.,1.);vec3 m=vec3((x.r+x.g+x.b)/3.);x=clamp(m+(x-m)*u_p1,0.,1.);if(u_p2>.5)x.g=min(x.g,.5*(x.r+x.b));return vec4(x,1.);`,
  'Seti Astro Suite Pro star_stretch.py + legacy/numba_utils.py: per channel f = 3^amount, out = f x / ((f-1) x + 1) (meant for linear star images; SASpro default amount 5), colour boost = mean + (rgb-mean)*boost, optional SCNR green = min(G, (R+B)/2)');
