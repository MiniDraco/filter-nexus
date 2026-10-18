/* ================= q08: ReShade repos 3, part 1 — prod80 / Fubax / Daodan / Zenteon colour, luluco250 / iMMERSE / Insane HDR bloom + lens flares, AstrayFX Flair, posters, Deep Fry, vignettes ================= */
/* prod80 PD80_01_Color_Gamut: XYZ_To_<gamut> * whitepoint-adapt * sRGB_To_XYZ, pre-multiplied (columns for GLSL mat3) */
const Q08_GAMUT = `mat3 GM[16]=mat3[16](mat3(1.00000,0.00000,-0.00000,0.00000,1.00000,-0.00000,0.00000,-0.00000,1.00000),
 mat3(0.71516,0.00000,0.00000,0.28484,1.00000,0.04117,0.00000,-0.00000,0.95883),
 mat3(0.93400,-0.02344,-0.00095,0.07680,1.04019,-0.03209,-0.01079,-0.01675,1.03304),
 mat3(0.65428,0.09830,0.01593,0.30458,0.87282,0.10886,0.04114,0.02888,0.87520),
 mat3(0.63544,0.04412,0.01547,0.31824,0.93084,0.07548,0.04632,0.02504,0.90904),
 mat3(0.88242,0.00000,0.00000,0.11758,1.00000,0.04329,-0.00000,-0.00000,0.95671),
 mat3(0.83080,0.09383,0.01653,0.23982,0.81834,0.10316,-0.07062,0.08782,0.88031),
 mat3(0.87454,-0.02654,-0.00635,0.10224,1.04943,-0.02822,0.02322,-0.02289,1.03457),
 mat3(0.65552,0.05756,0.01302,0.30331,0.91445,0.09898,0.04117,0.02798,0.88800),
 mat3(0.66309,0.01466,0.01708,0.30408,1.02424,0.03647,0.03283,-0.03889,0.94645),
 mat3(0.70811,0.05155,0.01502,0.22436,0.89540,0.07597,0.06753,0.05306,0.90901),
 mat3(0.67850,0.01653,0.01792,0.28834,1.05187,0.05061,0.03315,-0.06840,0.93147),
 mat3(0.95782,0.00000,-0.00000,0.04218,1.00000,-0.01194,0.00000,-0.00000,1.01194),
 mat3(0.52935,0.09837,0.01688,0.33007,0.87346,0.11767,0.14058,0.02816,0.86544),
 mat3(1.06536,-0.01964,0.00163,-0.05539,1.03636,0.00441,-0.00997,-0.01673,0.99395),
 mat3(0.59312,0.09542,0.01163,0.40468,0.84315,0.06910,0.00220,0.06143,0.91927));`;
/* luluco250 FXShaders Tonemap.fxh: BakingLab ACES fit + its inverse, Reinhard inverse */
const Q08_ACES = `
#define Q8ACES(cc) clamp(((cc)*((cc)+.0245786)-.000090537)/((cc)*(.983729*(cc)+.432951)+.238081),0.,1.)
#define Q8ACESI(cc) abs(((.0245786-.432951*(cc))-sqrt(pow(abs(.432951*(cc)-.0245786),vec3(2.))-4.*(.983729*(cc)-1.)*(.000090537+.238081*(cc))))/(2.*(.983729*(cc)-1.)))
#define Q8RINV(cc) (-(cc)/min((cc)-1.,vec3(-.1)))
#define Q8ERF(v) tanh(clamp(1.128379*(v)+.100929*(v)*(v)*(v),-9.,9.))
`;
/* OKLab (Ottosson) as used by Zenteon PaletteMap (applied to the gamma-encoded values, as in the shader) */
const Q08_OKLAB = `
#define Q8LAB(cc) (mat3(.2104542553,1.9779984951,.0259040371,.7936177850,-2.4285922050,.7827717662,-.0040720468,.4505937099,-.8086757660)*pow(max(mat3(.4122214708,.2119034982,.0883024619,.5363325363,.6806995451,.2817188376,.0514459929,.1073969566,.6299787005)*(cc),vec3(0.)),vec3(.3334)))
#define Q8LABI(cc) (mat3(4.0767416621,-1.2684380046,-.0041960863,-3.3077115913,2.6097574011,-.7034186147,.2309699292,-.3413193965,1.7076147010)*pow(mat3(1.,1.,1.,.3963377774,-.1055613458,-.0894841775,.2158037573,-.0638541728,-1.2914855480)*(cc),vec3(3.)))
`;

f = add('Color');
f('q08_colorgamut','Color Gamut Reinterpretation (prod80)',[S('Target gamut',['No change (sRGB)','Adobe RGB','Apple RGB','Best RGB','Beta RGB','Bruce RGB','CIE RGB','ColorMatch','Don RGB 4','ECI RGB','Ekta Space PS5','NTSC (1953)','PAL-SECAM','ProPhoto','SMPTE-C','Wide Gamut RGB'],13),P('Strength',0,1,1,.01)],
  `${Q08_GAMUT}int gi=int(u_p0+.5);mat3 M=GM[0];for(int i=0;i<16;i++){if(i==gi)M=GM[i];}vec3 x=clamp(c.rgb,0.,1.);vec3 l=${LIN('x')};vec3 o=clamp(M*l,0.,1.);o=${SRGB('o')};return vec4(mix(x,o,u_p1),1.);`,
  'prod80 PD80_01_Color_Gamut: linearise sRGB, sRGB->XYZ (D65), Bradford-style white adaptation to D50 / E / C where the target space uses it, XYZ->target RGB, re-encode as sRGB, i.e. shows the sRGB image as if its numbers were in the wider/narrower space (matrices from the shader, pre-multiplied)');

f('q08_colorlooks','ReShade Colour Looks (Color Gradients / Sunset / Retro Tint / Palette Map)',[S('Look',['Color Gradients (prod80)','Sunset Filter (Fubax)','Retro Tint (Daodan)','Palette Map (Zenteon)']),P('Strength',0,1,1,.01),P('Hue / angle shift',-180,180,0,1,'deg'),P('Spread',0,2,1,.01)],
  `${Q08_OKLAB}int m=int(u_p0+.5);vec3 x=clamp(c.rgb,0.,1.);vec3 r=x;float hsh=u_p2/360.;
  if(m==0){float sl=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 q=O((vec2(float(i),float(j))+.5)/12.).rgb;sl+=max(q.r,max(q.g,q.b));}sl=smoothstep(.125,.3,sl/144.);
   float cw=dot(x,vec3(1./3.));float a1=max(1.-cw*2.,0.),a2=max((cw-.5)*2.,0.);float ws=a1*a1*(3.-2.*a1),wh=a2*a2*(3.-2.*a2),wm=clamp(1.-ws-wh,0.,1.);
   vec3 C0=vec3(.98,.588,0.),C1=vec3(0.,.365,1.),C2=vec3(0.,.365,1.),C3=vec3(0.,.039,.588);
   C0=hsv2rgb(vec3(fract(rgb2hsv(C0).x+hsh),rgb2hsv(C0).yz));C1=hsv2rgb(vec3(fract(rgb2hsv(C1).x+hsh),rgb2hsv(C1).yz));C2=hsv2rgb(vec3(fract(rgb2hsv(C2).x+hsh),rgb2hsv(C2).yz));C3=hsv2rgb(vec3(fract(rgb2hsv(C3).x+hsh),rgb2hsv(C3).yz));
   vec3 lsm=softLight(x,C0),lss=mix(x,max(x,C1),.3),dsm=softLight(x,C2),dss=softLight(x,C3);
   vec3 LS=lss*ws+lsm*wm+wh,DS=dss*ws+dsm*wm+wh;r=mix(x,mix(DS,LS,sl),clamp(.333*u_p3*1.5,0.,1.));}
  else if(m==1){vec3 im=pow(x,vec3(2.2));float A=asp();vec2 q=vec2(uv.x,1.-uv.y);q.y+=A*.5-.5;q.y/=A;q=q*2.-1.;q*=u_p3;float an=radians(-(-7.+u_p2));float bm=dot(vec2(sin(an),cos(an)),q);bm=bm*.5+.5;
   float mn=min(bm,.5),mx=max(bm,.5);bm=2.*(mn*mn+2.*mx-mx*mx)-1.5;vec3 ca=pow(hsv2rgb(vec3(fract(hsh),1.,1.)),vec3(2.2));im=screen(im,mix(ca,vec3(0.),clamp(bm,0.,1.)));r=pow(clamp(im,0.,1.),vec3(1./2.2));}
  else if(m==2){vec3 tc=hsv2rgb(vec3(fract(260./360.+hsh),1.,clamp(.3*u_p3,0.,1.)));r=screen(x,tc);}
  else{vec3 PL[10]=vec3[10](vec3(0.),vec3(1.),vec3(1.,.6235,.54117),vec3(.9852,.749,.1372),vec3(1.,.6253,.2993),vec3(.7532,.3376,.3282),vec3(.2691,.1983,.3074),vec3(.1843,.1323,.2298),vec3(0.),vec3(0.));
   vec3 xl=Q8LAB(x);vec3 acc=vec3(0.);float aw=0.;float sel=1.5*u_p3;for(int i=0;i<10;i++){vec3 pl=Q8LAB(PL[i]);float d=distance(xl,pl);float w=exp(-10.*sel*sel*d*d)+1e-6;acc+=PL[i]*w;aw+=w;}
   vec3 cl=Q8LAB(acc/aw);float ch=length(xl.yz);float hu=atan(cl.z,cl.y)+u_p2*PI/180.;vec3 o=vec3(xl.x,ch*cos(hu),ch*sin(hu));r=clamp(Q8LABI(o),0.,1.);}
  return vec4(mix(x,r,u_p1),1.);`,
  'Color Gradients (prod80): shadow / midtone weights from the RGB average (harsh separation), light-scene tints (orange soft light + 30% blue lighten) and dark-scene tints (blue / deep-blue soft light) mixed by the image-average max-channel luminance (smoothstep 0.125..0.3; one still image, no temporal adaptation), highlights pass through as in the shader, final mix 1/3 x Spread x 1.5. Sunset Filter (Fubax): tilted (-7 deg) linear mask through its overlay curve, screen of a red-to-black gradient in linear light (Spread = scale). Retro Tint (Daodan): screen with (0.1,0,0.3). Palette Map (Zenteon): soft nearest-palette weights exp(-10 s^2 d^2) in OKLab over its 8-colour default palette + black/white, keeps the pixel lightness and chroma and takes the palette hue. Hue shift rotates the look colours');

f = add('Tone');
f('q08_tonefix','Watch Dogs Tonemap / Whitepoint Fixer',[S('Mode',['Watch Dogs filmic tonemap','Whitepoint Fixer (auto max)','Whitepoint Fixer (manual)']),P('Amount',.1,2,1,.01)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;
  if(m==0){vec3 A=vec3(.55,.5,.45),B=vec3(.3,.27,.22),C=vec3(.1),D=vec3(.1,.07,.03),E=vec3(.01),F=vec3(.3),W=vec3(2.8,2.9,3.1);
   vec3 fw=((W*(A*W+C*B)+D*E)/(W*(A*W+B)+D*F))-E/F;vec3 fc=((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;return vec4(pow(clamp(fc*1.25*u_p1/fw,0.,1.),vec3(1.25)),1.);}
  float wp=u_p1;if(m==1){wp=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=O((vec2(float(i),float(j))+.5)/16.).rgb;wp=max(wp,dot(q,vec3(.333)));}if(wp<.8*u_p1)wp=1.;}
  return vec4(x/max(wp,1e-6),1.);`,
  'Watch Dogs tonemap (GShade WatchDogs.fx): per-channel Hable-style curve A .55/.50/.45, B .30/.27/.22, C .1, D .10/.07/.03, E .01, F .3, white 2.8/2.9/3.1, output (curve x 1.25 x Amount / white)^1.25. Whitepoint Fixer (luluco250, mode 2): colour divided by the brightest grey (average) of a 16x16 downsample; if that is under 0.8 x Amount it is remapped to 1 (no temporal smoothing on a still). Manual mode: divide by Amount');

f = add('Blur');
const Q08_BLOOMBLUR = dir => `${Q08_ACES}int m=int(u_p0+.5);float hs=u_res.y/1080.*max(u_p2,.05);
  float ext=m<=2?3.*192.*hs:m==3?3.*256.*hs:1.5*128.*hs;ext=min(ext,max(u_res.x,u_res.y));float st=max(ext/32.,1.);
  float HB[13]=float[13](1.,.927,.7721,.5987,.439,.3066,.2042,.1293,.0771,.0425,.0206,.0076,.0004);
  vec4 acc=vec4(0.);float ws=0.;for(int i=-32;i<=32;i++){float x=float(i)*st;if(abs(x)>ext+.5*st)continue;float a=x-.5*st,b=x+.5*st;float w=0.;
   if(m<=2){for(int k=0;k<8;k++){float sg=max(1.5*exp2(float(k))*hs,.35);w+=(Q8ERF(b/(1.4142*sg))-Q8ERF(a/(1.4142*sg)))*.5;}}
   else if(m==3){for(int k=0;k<7;k++){float sg=max(4.*exp2(float(k))*hs,.35);float nd=exp(-pow(float(k+1)-5.6,2.)/7.);w+=nd*(Q8ERF(b/(1.4142*sg))-Q8ERF(a/(1.4142*sg)))*.5;}}
   else{float t=abs(x)/(128.*hs)*8.;int ti=int(t);w=ti>=12?0.:mix(HB[ti],HB[ti+1],fract(t))*st;if(i==0)w=max(w,1e-3);}
   acc+=T(uv+${dir}*x*u_px)*w;ws+=w;}
  return acc/max(ws,1e-6);`;
f('q08_hdrbloom','HDR Bloom (SOLARIS / Magic HDR / Bessel Bloom)',[S('Method',['SOLARIS energy conserving (iMMERSE)','SOLARIS HDR drama','SOLARIS dreamy','Magic HDR (luluco250)','Bessel Bloom (Insane)']),P('Intensity',0,3,1,.01),P('Radius',.25,3,1,.01),P('Threshold / white point',.1,.95,.7,.01)],
  [`int m=int(u_p0+.5);vec3 x=clamp(c.rgb,0.,1.);vec3 o;
  if(m<=2){float W=10.*u_p3;float k=.132;vec3 co=x*(1.-3.*k)+k*(x.r+x.g+x.b);co*=co;co/=exp2(W)*(1.-co)+1.;o=co;}
  else if(m==3){${Q08_ACES}vec3 s=Q8RINV(x);s*=exp(3.*u_p3/.7);o=s/512.;}
  else{vec3 l=pow(x,vec3(2.2));float br=max(l.r,max(l.g,l.b));float th=u_p3;float kn=th*.5+1e-5;float rq=clamp(br-(th-kn),0.,2.*kn);rq=.25/kn*rq*rq;o=l*(max(rq,br-th)/max(br,1e-5))/(1.-th);o/=4.;}
  return vec4(o,1.);`, Q08_BLOOMBLUR('vec2(1.,0.)'), Q08_BLOOMBLUR('vec2(0.,1.)'),
  `${Q08_ACES}int m=int(u_p0+.5);vec3 x=clamp(O(uv).rgb,0.,1.);vec3 bl=max(T(uv).rgb,0.);vec3 r;float I=u_p1;
  if(m<=2){float W=10.*u_p3;float k=.132;float e=exp2(-W);vec2 fi=vec2(k-1.,k)/(3.*k-1.);
   vec3 co=x*(1.-3.*k)+k*(x.r+x.g+x.b);co*=co;co/=exp2(W)*(1.-co)+1.;vec3 col=co*128.;vec3 b=bl*128.*exp2(-W*.25);float I0=.45*I;
   vec3 u1;if(m==0){col=mix(col,b,clamp(I0*I0,0.,1.)*.5);u1=col;}else if(m==2){col=col*(1.+b*I0*6.);u1=col;}else u1=b;
   vec3 v=u1/128.;v=sqrt(max(v*(1.+e)/(v+e),0.));v=(fi.x-fi.y)*v+fi.y*(v.r+v.g+v.b);
   if(m==1){vec3 cs=col/128.;cs=sqrt(max(cs*(1.+e)/(cs+e),0.));cs=(fi.x-fi.y)*cs+fi.y*(cs.r+cs.g+cs.b);vec3 bd=(1.-2.*v)*cs*cs+2.*cs*v;r=mix(cs,bd,clamp(I0*I0*4.,0.,1.));}else r=v;}
  else if(m==3){vec3 col=Q8RINV(x);col=mix(col,bl*512.*.1207,log(.3*I+1.)/log(10.));r=Q8ACES(col);}
  else{r=pow(max(pow(x,vec3(2.2))+bl*4.*I*(1.-u_p3),0.),vec3(1./2.2));}
  return vec4(clamp(r,0.,1.),1.);`],
  'SOLARIS (iMMERSE): sdr_to_hdr (cone overlap k=0.132, square, whitepoint 2^W compression, x128), equal-weight pyramid of 8 octaves (here a sum of 8 Gaussians sigma 1.5..192 px at 1080p, separable so cross terms make it slightly star-shaped, approx.), blends: energy-conserving lerp (int^2/2), HDR drama overlay-style, dreamy multiply, then hdr_to_sdr; intensity default 1.5x the shader. Magic HDR (luluco250): inverse Reinhard, x e^3 bloom brightness, 7 blur levels weighted by a normal distribution (mean 5.6, var 3.5) and divided by 7, lerp by log10(0.3+1), BakingLab ACES. Bessel Bloom (Insane): gamma 2.2, soft-knee threshold, its 2nd-order Bessel IIR run forward+backward replaced by the exact zero-phase impulse response as an FIR kernel (K=128 at 1080p), added in linear light');

f = add('Render');
const Q08_GDIR = k => `int m=int(u_p0+.5);float hs=u_res.y/1080.*u_p3;vec4 acc=vec4(0.);
  if(m==1){${k===2?'return c;':''}vec2 d=${k===0?'vec2(1.,0.)':'vec2(0.,1.)'};float w=0.;for(int i=-4;i<=4;i++){float g=exp(-float(i*i)/(2.*2.25));acc+=T(uv+d*float(i)*4.*hs*u_px)*g;w+=g;}return acc/w;}
  float an=m==0?radians(${[75,15,-45][k]}.):radians(${[0,60,120][k]}.);vec2 d=vec2(cos(an),sin(an));int n=m==0?9:16;float stp=4.*hs;
  for(int i=0;i<16;i++){if(i>=n)break;float o=float(i)-float(n-1)*.5;acc+=T(uv+d*o*stp*u_px);}return acc/float(n);`;
f('q08_lensghosts','Lens Ghosts (Unreal Lens / Liquid Lens / Hex Lens Flare)',[S('Flare',['Unreal Lens (luluco250)','Liquid Lens (luluco250)','Hex Lens Flare (luluco250)']),P('Threshold',.5,1,.8,.005),P('Intensity',0,4,1,.01),P('Bokeh size',.25,4,1,.01)],
  [`${Q08_ACES}int m=int(u_p0+.5);vec3 o=vec3(0.);
  if(m<2){vec2 q=(1.-uv-.5)*4.+.5;if(q.x>=0.&&q.y>=0.&&q.x<=1.&&q.y<=1.){vec3 s=clamp(O(q).rgb,0.,1.);vec3 l=${LIN('s')};vec3 x=Q8ACESI(l);
    if(m==0){float mk=1.-distance(q,vec2(.5));x*=clamp(mix(1.,mk,.9),0.,1.);}x=mix(vec3(luma(x)),x,.7);float th=Q8ACESI(vec3(u_p1)).x;x*=step(vec3(th),x);x*=(m==0?.01:.1)*u_p2;o=x/4.;}}
  else{vec2 u=1.-uv;vec2 P4[4]=vec2[4](u,(u-.5)*3.+.5,(u-.5)*9.+.5,(1.-u-.5)*.666+.5);vec3 C4[4]=vec3[4](vec3(147.,255.,0.)/255.,vec3(66.,151.,255.)/255.,vec3(255.,147.,0.)/255.,vec3(100.,236.,255.)/255.);
   for(int i=0;i<4;i++){vec2 q=P4[i];if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;vec3 s=clamp(O(q).rgb,0.,1.);vec3 l=${LIN('s')};o+=step(u_p1,dot(l,vec3(.333)))*C4[i];}o/=4.;}
  return vec4(o,1.);`, Q08_GDIR(0), Q08_GDIR(1), Q08_GDIR(2),
  `${Q08_ACES}int m=int(u_p0+.5);vec3 x=clamp(O(uv).rgb,0.,1.);vec3 l=${LIN('x')};
  if(m==2){vec3 fl=T(uv).rgb*4.;l=1.-(1.-l)*(1.-clamp(fl*u_p2,0.,1.));return vec4(${SRGB('clamp(l,0.,1.)')},1.);}
  vec3 col=Q8ACESI(l);vec3 lens=vec3(0.);
  if(m==0){float S5[5]=float[5](.6,.2,.1,.05,-1.);for(int i=0;i<5;i++){vec2 q=(uv-.5)*S5[i]*4.+.5;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;lens+=T(q).rgb*4.;}}
  else{vec2 p=uv*2.-1.;vec2 fu=p*vec2(asp(),1.)/length(vec2(asp(),1.));float dis=sqrt(max(1.-dot(fu,fu),0.));p*=mix(1.,dis*3.,-1.);vec2 uf=(p+1.)*.5;
   vec3 TN[7]=vec3[7](vec3(1.,0.,0.),vec3(1.,.5,0.),vec3(1.,1.,0.),vec3(0.,1.,0.),vec3(0.,1.,1.),vec3(0.,0.,1.),vec3(1.,0.,1.));
   for(int i=0;i<7;i++){vec2 q=(uf-.5)*(.01*float(i+1))*4.+.5;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;lens+=T(q).rgb*4.*TN[i];}}
  col+=lens/7.;vec3 r=Q8ACES(col);return vec4(${SRGB('r')},1.);`],
  'luluco250 FXShaders. Unreal Lens: point-mirrored image zoomed out 4x, inverse BakingLab ACES, edge mask, saturation 0.7, per-channel threshold, x0.01 brightness, hexagonal bokeh from three 9-tap blurs 60 deg apart (75/15/-45 deg), then 5 ghosts sampled at scales 0.6/0.2/0.1/0.05/-1 (x4) added in HDR and re-tonemapped. Liquid Lens: same prepare (threshold, x0.1), 9-tap Gaussian blur, 7 rainbow-tinted ghosts at scales 0.01..0.07 (x4) through its fisheye (amount -1, zoom 3). Hex Lens Flare: 4 thresholded ghosts (x1, x3, x9, mirrored x0.666) in green / blue / orange / cyan, hexagonal blur (here three sequential 16-tap box blurs at 0/60/120 deg = a hexagon, approx.), screen blend. Outside-the-image samples are black (the shaders clamp), sizes relative to 1080p');

const Q08_FLAIRW = `float FW[25]=float[25](.10761,.10306,.0975,.0911,.08409,.07666,.06903,.06139,.05394,.0468,.0401,.0339,.0284,.0234,.0191,.0154,.0122,.0096,.0074,.0057,.0043,.0032,.0024,.0017,.0012);`;
f('q08_rays','Tracking Rays / Flair Streaks',[S('Effect',['Tracking Rays (luluco250)','Flair star full (AstrayFX)','Flair star half','Flair cross +','Flair cross x','Flair skew','Flair horizontal','Flair vertical']),P('Threshold / curve',.5,1,.95,.005),P('Length',.25,4,1,.01),P('Intensity',0,3,1,.01)],
  `int m=int(u_p0+.5);vec3 x=clamp(c.rgb,0.,1.);vec3 lx=${LIN('x')};float hs=u_res.y/1080.;
  if(m==0){vec2 pv=vec2(.5);float br=0.;for(int i=0;i<16;i++)for(int j=0;j<16;j++){vec2 ps=(vec2(float(i),float(j))+.5)/16.;vec3 s=clamp(O(vec2(ps.x,1.-ps.y)).rgb,0.,1.);float px=luma(${LIN('s')});
     if(abs(px-br)<.1){br=(br+px)*.5;pv=(pv+ps)*.5;}else if(px>br){pv=ps;br=px;}}
   vec2 piv=vec2(pv.x,1.-pv.y);float sc=1.+(10.*u_p2-1.)/13.*.1;vec2 q=uv;vec3 acc=lx;for(int i=1;i<13;i++){q=(q-piv)/sc+piv;vec3 s=clamp(O(q).rgb,0.,1.);acc+=${LIN('s')};}acc/=13.;
   acc=pow(acc,vec3(u_p1*3.158));vec3 r=1.-(1.-lx)*(1.-clamp(acc*u_p3,0.,1.));return vec4(${SRGB('r')},1.);}
  ${Q08_FLAIRW}int ty=m-1;vec2 D4[4]=vec2[4](vec2(1.,0.),vec2(0.,1.),vec2(.7071,.7071),vec2(.7071,-.7071));float LM[4]=float[4](1.,1.,1.,1.);bool on[4]=bool[4](false,false,false,false);
  if(ty==0||ty==1||ty==2){on[0]=true;on[1]=true;}if(ty==0||ty==1||ty==3){on[2]=true;on[3]=true;}if(ty==1){LM[2]=.5;LM[3]=.5;}if(ty==4)on[2]=true;if(ty==5)on[0]=true;if(ty==6)on[1]=true;
  vec3 acc=vec3(0.);float bs=1.1*hs*u_p2;vec2 cd=vec2(6.,6.)*hs*u_px;
  for(int d=0;d<4;d++){if(!on[d])continue;for(int i=0;i<25;i++){float of=i==0?0.:(2.*float(i)-1.)*bs*LM[d];for(int sg=-1;sg<=1;sg+=2){if(i==0&&sg>0)continue;vec2 q=uv+D4[d]*float(sg)*of*u_px;
     vec3 s=O(q).rgb;float a=step(u_p1,luma(s));if(a<.5)continue;vec3 cm=(O(q+cd).rgb+O(q-cd).rgb+O(q+vec2(cd.x,-cd.y)).rgb+O(q-vec2(cd.x,-cd.y)).rgb)*.25;cm=clamp(mix(vec3(luma(cm)),cm,5.),0.,1.);acc+=cm*FW[i]*(i==0?1.:1.);}}}
  return vec4(clamp(x+acc*.5*u_p3*2.,0.,1.),1.);`,
  'Tracking Rays (luluco250): brightest point of a 16x16 coarse grid (neighbours within 0.1 are merged), 13-step zoom blur toward it (scale 1+(10-1)/13x0.1), pow curve 3, screen. Flair (AstrayFX): pixels with luma above the threshold (shader default 0.999), coloured from a blurred colour map with saturation x5, streaked with its 25-tap Gaussian weights at odd offsets x1.1 (spread 0.5) in the chosen star / cross / skew / horizontal / vertical pattern, added; one still frame so the temporal alternation of tap offsets is not used; sizes relative to 1080p');

f = add('Stylize');
f('q08_poster','ReShade Posters (Colorful / Multi Tone / Posterize Pixelate / Virtual Resolution / Bilateral Comic)',[S('Effect',['Colorful Poster (Daodan)','Multi Tone Poster (Daodan)','Posterize Pixelate (prod80)','Virtual Resolution (luluco250)','Bilateral Comic (Insane)']),P('Levels',2,64,12,1),P('Pixel size',1,16,4,1,'px'),P('Strength',0,1,1,.01)],
  [`if(int(u_p0+.5)!=4)return c;vec3 acc=vec3(0.);float ws=0.;float lc=luma(c.rgb);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j));vec3 s=T(uv+o*u_k*u_px).rgb;float dl=luma(s)-lc;float w=exp(-dot(o,o)/8.-dl*dl/(2.*.1*.1));acc+=s*w;ws+=w;}return vec4(acc/ws,1.);`,
  `int m=int(u_p0+.5);vec3 x=clamp(O(uv).rgb,0.,1.);float L=max(floor(u_p1+.5),2.);vec3 r=x;
  if(m==0){float l=dot(x,vec3(.2126,.7151,.0721));vec3 ch=x-l;float st=1./L;float sn=floor(l*L);float fr=fract(l*L);float lp=1./(1.+exp(-13.*(fr-.5)))*st+st*sn;
   float K=1.-max(x.r,max(x.g,x.b));vec3 cmy=(1.-x-K)/max(1.-K,1e-5);cmy+=vec3(.2,-.1,-.2);vec3 mk=1.-clamp(cmy,0.,1.);vec3 im=ch+lp;r=mix(2.*im*mk,1.-2.*(1.-im)*(1.-mk),step(.5,l));}
  else if(m==1){vec2 vp=floor(vec2(uv.x,1.-uv.y)*u_res)+.5;float w=max(1.,floor(u_k+.5));float sx=step(mod(vp.x,2.*w),w),sy=step(mod(vp.y,2.*w),w),sq=step(sx+sy,0.);
   vec3 C1=vec3(0.,.05,.17),C2=vec3(.2,.16,.25),C3=vec3(1.,.16,.1),C4=vec3(1.);vec3 CL[7]=vec3[7](C1,mix(C1,C2,sq),C2,mix(C2,C3,sq),C3,mix(C3,C4,sy),C4);
   int id=int(clamp(floor(luma(x)*7.),0.,6.));r=CL[id];}
  else if(m==2||m==3){float bs=m==2?exp2(floor(log2(max(u_p2,1.))+.5)):max(floor(u_p2+.5),1.);bs*=u_k;vec2 p=vec2(uv.x,1.-uv.y)*u_res;vec2 cell=floor(p/bs);vec2 cc=(cell+.5)*bs;
   vec3 s=vec3(0.);for(int j=0;j<2;j++)for(int i=0;i<2;i++){vec2 q=cc+(vec2(float(i),float(j))-.5)*bs*.5;s+=O(vec2(q.x/u_res.x,1.-q.y/u_res.y)).rgb;}s*=.25;
   r=m==2?clamp(floor(s*L)/(L-1.),0.,1.):s;}
  else{vec2 sm=vec2(0.);float SB[9]=float[9](1.,2.,1.,0.,0.,0.,-1.,-2.,-1.);for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){float v=dot(O(uv+vec2(float(i),float(j))*u_px).rgb,vec3(.333));sm+=vec2(v*SB[(i+1)*3+(j+1)],v*SB[(j+1)*3+(i+1)]);}
   float e=clamp(length(sm),0.,1.);if(e<.3)e=0.;e*=exp(-(2.-1.4));e=floor(e*L+.5)/L;vec3 col=T(uv).rgb*(1.-e);
   float y=floor(dot(col,vec3(.299,.587,.114))*L+.5)/L;float cb=dot(col,vec3(-.168736,-.331264,.5)),cr=dot(col,vec3(.5,-.418688,-.081312));r=vec3(y+1.402*cr,y-.344136*cb-.714136*cr,y+1.772*cb);}
  return vec4(mix(x,clamp(r,0.,1.),u_p3),1.);`],
  'Colorful Poster (Daodan): luma posterized with sigmoid steps (slope 13), chroma re-added and overlaid with a CMYK-shifted (+0.2 C, -0.1 M, -0.2 Y, K=0) colour mask. Multi Tone Poster (Daodan): 7 luma bands of its 4 default colours with square / square / horizontal-stripe dither patterns between them. Posterize Pixelate (prod80): power-of-two mip block (box average), floor(c x L)/(L-1) posterize (no dither, no border). Virtual Resolution (luluco250): linear downsample to res / size, point upsample. Bilateral Comic (Insane): 5x5 bilateral (sigma 2 px, here with a real 0.1 luma range term - the shader range term is effectively off), Sobel edges above 0.3 darkened x e^-0.6, edge and luma quantized to Levels (shader 48)');

f = add('Retro');
const Q08_DPX = `vec2 P=floor(vec2(uv.x,1.-uv.y)*u_res);`;
const Q08_DUV = q => `vec2(((${q}).x+.5)/u_res.x,1.-((${q}).y+.5)/u_res.y)`;
f('q08_deepfry','Deep Fry (Insane)',[P('Quality factor',.5,10,6,.1),P('Reds',-.5,.5,.2,.01),P('Strength',0,1,1,.01)],
  [`vec3 x=clamp(c.rgb,0.,1.);return vec4(dot(x,vec3(.299,.587,.114)),dot(x,vec3(-.168736,-.331264,.5))+.5-u_p1,dot(x,vec3(.5,-.418688,-.081312))+.5+u_p1,1.);`,
   `${Q08_DPX}float ix=mod(P.x,8.);float ox=P.x-ix;vec3 s=vec3(0.);for(int i=0;i<8;i++){vec2 Q=vec2(ox+float(i),P.y);s+=(T(${Q08_DUV('Q')}).rgb-.5)*cos((2.*float(i)+1.)*ix*PI/16.);}s*=(ix<.5?.707107:1.)*.5;return vec4(s*.2+.5,1.);`,
   `${Q08_DPX}float LQ[64]=float[64](16.,11.,10.,16.,24.,40.,51.,61.,12.,12.,14.,19.,26.,58.,60.,55.,14.,13.,16.,24.,40.,57.,69.,56.,14.,17.,22.,29.,51.,87.,80.,62.,18.,22.,37.,56.,68.,109.,103.,77.,24.,36.,55.,64.,81.,104.,113.,92.,49.,64.,78.,87.,103.,121.,120.,101.,72.,92.,95.,98.,112.,100.,103.,99.);
   float CQ[64]=float[64](17.,18.,24.,47.,99.,99.,99.,99.,18.,21.,26.,66.,99.,99.,99.,99.,24.,26.,56.,99.,99.,99.,99.,99.,47.,66.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.);
   float ix=mod(P.x,8.),iy=mod(P.y,8.);float oy=P.y-iy;vec3 s=vec3(0.);for(int j=0;j<8;j++){vec2 Q=vec2(P.x,oy+float(j));s+=(T(${Q08_DUV('Q')}).rgb-.5)/.2*cos((2.*float(j)+1.)*iy*PI/16.);}
   s*=(iy<.5?.707107:1.)*.5;int id=int(iy)*8+int(ix);vec3 q=vec3(LQ[id],CQ[id],CQ[id])*u_p0;vec3 F=floor(s*255./q+.5)*q/255.;return vec4(F*.1+.5,1.);`,
   `${Q08_DPX}float ix=mod(P.x,8.);float ox=P.x-ix;vec3 s=vec3(0.);for(int i=0;i<8;i++){vec2 Q=vec2(ox+float(i),P.y);s+=(T(${Q08_DUV('Q')}).rgb-.5)/.1*cos((2.*ix+1.)*float(i)*PI/16.)*(i==0?.707107:1.);}s*=.5;return vec4(s*.1+.5,1.);`,
   `${Q08_DPX}float iy=mod(P.y,8.);float oy=P.y-iy;vec3 s=vec3(0.);for(int j=0;j<8;j++){vec2 Q=vec2(P.x,oy+float(j));s+=(T(${Q08_DUV('Q')}).rgb-.5)/.1*cos((2.*iy+1.)*float(j)*PI/16.)*(j==0?.707107:1.);}s=s*.5+.5;
   s.yz-=.5;vec3 r=vec3(s.x+1.402*s.z,s.x-.344136*s.y-.714136*s.z,s.x+1.772*s.y);return vec4(mix(O(uv).rgb,clamp(r,0.,1.),u_p2),1.);`],
  'Insane-Shaders DeepFry: YCbCr with the Reds offset (Cb -= reds, Cr += reds), separable 8x8 DCT-II per block, standard JPEG luminance / chrominance tables x Quality, round, inverse DCT, back to RGB (5 passes, blocks on working pixels from the top-left)');

f = add('Stylize');
f('q08_vignettes','Artistic Vignette / Magical Rectangle',[S('Shape',['Artistic Vignette radial (luluco250)','Artistic Vignette top-bottom','Artistic Vignette left-right','Artistic Vignette box','Artistic Vignette sky','Artistic Vignette ground','Magical Rectangle (prod80)','Magical Circle (prod80)']),P('Start / softness',0,1,0,.01),P('End / size',0,1.5,1,.01),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;vec2 rs=vec2(uv.x,1.-uv.y);vec3 r;
  if(m<6){float v=1.;if(m==0)v=distance(vec2(.5),rs)*1.5708;else if(m==1)v=abs(rs.y-.5)*2.;else if(m==2)v=abs(rs.x-.5)*2.;else if(m==3){vec2 g=abs(rs-.5)*2.;v=max(g.x,g.y);}else if(m==4)v=distance(vec2(.5,1.),rs);else v=distance(vec2(.5,0.),rs);
   v=smoothstep(u_p1,max(u_p2,u_p1+1e-3),v);r=mix(x,vec3(0.),v*u_p3);}
  else{float A=asp();float dg=length(u_res);float dv=dg/min(u_res.x,u_res.y),dp=dg/max(u_res.x,u_res.y);vec2 t2=(rs-.5)*vec2(1.,1./A)/dv+.5;vec2 q=t2*2.-1.;float sz=.2*u_p2;float sm=.01+u_p1*.5;
   q/=vec2(sz+sz*sm)*dp;if(m==7)q=vec2(dot(q,q));q=(q+1.)*.5;vec2 bl=smoothstep(0.,sm,q),tr=smoothstep(0.,sm,1.-q);float Rr=bl.x*bl.y*tr.x*tr.y;
   vec3 lay=mix(x,clamp(x*(1.-Rr)+Rr*.5,0.,1.),Rr);lay=vec3(max(lay.r,max(lay.g,lay.b)));r=mix(x,lay,Rr*u_p3);}
  return vec4(r,1.);`,
  'Artistic Vignette (luluco250): distance shapes (radial x pi/2, top/bottom, left/right, box, sky = from bottom centre, ground = from top centre) through smoothstep(start, end), mixed to its default black. Magical Rectangle (prod80): soft rectangle / circle in its rotated, diagonal-normalised layer coordinates, layer = image pushed toward the rectangle colour value (default grey 0.5) and recoloured to its hue / saturation (grey), default normal blend; rotation, depth fade and the in-layer exposure / contrast controls are left at their defaults (off)');
