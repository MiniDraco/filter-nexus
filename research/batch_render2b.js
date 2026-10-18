/* ================= render2b: augmentation II (albumentations / torchvision / kornia / imgaug) and optics ================= */
const R2BFN = (lib, body) => `return c;}
#define F R2G
${lib}
vec4 R2G(vec2 uv){vec4 c=T(uv);${body}`;
const R2BL = `
vec2 r2h2(vec2 p){return vec2(hash(p),hash(p+vec2(17.17,3.31)));}
vec3 r2lin(vec3 v){v=max(v,0.);return mix(v/12.92,pow((v+.055)/1.055,vec3(2.4)),step(vec3(.04045),v));}
vec3 r2srgb(vec3 v){v=max(v,0.);return mix(v*12.92,1.055*pow(v,vec3(1./2.4))-.055,step(vec3(.0031308),v));}
float r2gauss(vec2 p){float u1=max(hash(p),1e-7),u2=hash(p+vec2(5.3,9.1));return sqrt(-2.*log(u1))*cos(6.2831853*u2);}
float r2vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
vec2 r2dims(){return u_res/u_k;}
`;

/* ---------- Augmentation II ---------- */
f = add('Augment');
f('advancedblur','Advanced Blur (albumentations)',[P('Sigma X',.2,10,3,.1,'px'),P('Sigma Y',.2,10,1.2,.1,'px'),P('Rotation',-90,90,30,1,'°'),P('Beta (shape)',.5,8,1,.05)],
  R2BFN(R2BL,`float a=radians(u_p2);mat2 Rm=mat2(cos(a),sin(a),-sin(a),cos(a));vec2 isg=1./vec2(u_p0*u_p0,u_p1*u_p1);float ext=3.*max(u_p0,u_p1);float st=max(1.,ext/15.);
  vec3 acc=vec3(0.);float ws=0.;for(int j=-15;j<=15;j++)for(int i=-15;i<=15;i++){vec2 o=vec2(float(i),float(j))*st;if(length(o)>ext+st)continue;vec2 q=o*Rm;float md=dot(q*q,isg);
   float w=exp(-.5*pow(md,u_p3))*(.75+.5*hash(vec2(float(i)+40.,float(j)+40.)));acc+=T(uv+R(1.)*o*u_px).rgb*w;ws+=w;}return vec4(acc/ws,1.);`),
  'albumentations AdvancedBlur: generalised Gaussian kernel exp(-0.5 (d^T Sigma^-1 d)^beta) with anisotropic sigma X / Y rotated by the angle (beta < 1 heavy-tailed, > 1 plateau-shaped), every kernel weight multiplied by noise in 0.75..1.25 (seeded)',1);
f('gridelastic','Grid Elastic Deform (albumentations)',[P('Grid X',2,16,4,1),P('Grid Y',2,16,4,1),P('Magnitude',0,60,12,1,'px')],
  R2BFN(R2BL+`
vec2 r2gv(vec2 g,vec2 n){if(g.x<=0.||g.y<=0.||g.x>=n.x||g.y>=n.y)return vec2(0.);return floor(r2h2(g+vec2(31.,7.))*(2.*u_p2+1.))-u_p2;}`,
  `vec2 dm=r2dims();vec2 n=floor(vec2(u_p0,u_p1)+.5);vec2 p=PX(uv);vec2 g=p/dm*n;vec2 gi=min(floor(g),n-1.);vec2 t=g-gi;
  vec2 d=mix(mix(r2gv(gi,n),r2gv(gi+vec2(1.,0.),n),t.x),mix(r2gv(gi+vec2(0.,1.),n),r2gv(gi+vec2(1.,1.),n),t.x),t.y);return T(fromPX(p+d));`),
  'albumentations GridElasticDeform: the image is cut into a Grid X x Grid Y mesh, interior vertices get random integer offsets in +-Magnitude px (border vertices fixed), and each output cell samples its distorted source quad bilinearly (PIL MeshTransform)',1);
f('hestain','H&E Stain Augmentation (albumentations HEStain)',[P('Hematoxylin scale',.5,1.5,1.3,.01),P('Eosin scale',.5,1.5,.7,.01),P('Hematoxylin shift',-.3,.3,0,.01),P('Eosin shift',-.3,.3,0,.01)],
  R2BFN(R2BL,`vec3 h=normalize(vec3(.650,.704,.286)),e=normalize(vec3(.072,.990,.105));vec3 r=normalize(cross(h,e));mat3 M=mat3(h,e,r);mat3 Mi=inverse(M);
  vec3 od=-log((c.rgb*255.+1.)/256.);vec3 cc=Mi*od;cc.x=cc.x*u_p0+u_p2;cc.y=cc.y*u_p1+u_p3;vec3 o=clamp(exp(-(M*cc))*256./255.-1./255.,0.,1.);
  float tissue=1.-smoothstep(.78,.9,luma(c.rgb));return vec4(mix(c.rgb,o,tissue),1.);`),
  'albumentations HEStain (method "matrix", Ruifrok & Johnston H&E vectors + orthogonal residual): RGB -> optical density -log((I+1)/256), stain concentrations by the inverse stain matrix, H and E concentrations scaled and shifted, reconstructed; background (bright, untissued) pixels kept as with augment_background = False (soft luminance mask, approx.)');

const R2POL = R2BL + `
float r2r(float a,float b){return hash(vec2(a+u_p3*101.+.5,b+17.25));}
float r2val(int pol,int o,float b){vec2 dm=r2dims();
 if(pol==1){if(o==1||o==2)return .99*b/30.;if(o==3||o==4)return 32.*b/30.;if(o==5)return 135.*b/30.;if(o>=6&&o<=9)return .99*b/30.;if(o==10)return 8.-round(b/5.);if(o==11)return 255.*(1.-b/30.);return 0.;}
 float nb=pol==0?30.:pol==2?9.:10.;float t=b/nb;
 if(o==1||o==2)return .3*t;if(o==3)return (pol==3?dm.x/3.:150./331.*dm.x)*t;if(o==4)return (pol==3?dm.y/3.:150./331.*dm.y)*t;if(o==5)return 30.*t;if(o>=6&&o<=9)return .9*t;
 if(o==10)return pol==3?4.-round(b/2.5):pol==2?8.-round(b/2.25):8.-round(b/7.5);if(o==11)return 255.*(1.-t);return 0.;}
bool r2signed(int o){return o>=1&&o<=9;}
vec3 r2pt(int o,float m,vec3 v){
 if(o==6)return clamp(v*(1.+m),0.,1.);
 if(o==7){float g=dot(v,vec3(.299,.587,.114));return clamp(g+(1.+m)*(v-g),0.,1.);}
 if(o==10){float q=exp2(8.-max(m,0.));return floor(floor(v*255.+.5)/q)*q/255.;}
 if(o==11)return mix(v,1.-v,step(vec3(m/255.-1e-4),v));
 if(o==14)return 1.-v;return v;}
vec3 r2pre(vec3 v,int k,int op[4],float mg[4]){for(int i=0;i<4;i++){if(i>=k)break;v=r2pt(op[i],mg[i],v);}return v;}
vec3 r2src(vec2 s){vec2 dm=r2dims();vec2 q=(floor(s)+.5)/dm;return O(vec2(q.x,1.-q.y)).rgb;}
vec3 r2cop(int o,float m,vec3 v,vec2 s,int k,int op[4],float mg[4]){
 if(o==6||o==7||o==10||o==11||o==14)return r2pt(o,m,v);
 if(o==9){vec3 sm=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)sm+=r2pre(r2src(s+vec2(float(i),float(j))),k,op,mg)*(i==0&&j==0?5.:1.);sm/=13.;return clamp(sm+(1.+m)*(v-sm),0.,1.);}
 if(o==8||o==12||o==13){float mean=0.;vec3 mn=vec3(1.),mx=vec3(0.),lo=vec3(0.),top=vec3(-1.),ntop=vec3(0.);vec3 v8=floor(v*255.+.5);
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 sv=r2pre(O((vec2(float(i),float(j))+.5)/16.).rgb,k,op,mg);
   if(o==8)mean+=dot(sv,vec3(.299,.587,.114));else if(o==12){mn=min(mn,sv);mx=max(mx,sv);}
   else{vec3 s8=floor(sv*255.+.5);lo+=vec3(lessThan(s8,v8));vec3 gt=vec3(greaterThan(s8,top));vec3 eq=vec3(equal(s8,top));ntop=gt+(1.-gt)*(ntop+eq);top=max(top,s8);}}
  if(o==8){mean=floor(mean/256.*255.+.5)/255.;return clamp(mean+(1.+m)*(v-mean),0.,1.);}
  if(o==12){vec3 r=mx-mn;return mix(v,clamp((v-mn)/max(r,1e-4),0.,1.),step(1e-4,r));}
  vec3 stp=(256.-ntop)/255.;vec3 eqd=clamp(floor((lo+stp*.5)/max(stp,1e-4))/255.,0.,1.);return mix(v,eqd,step(.01,stp));}
 return v;}
vec2 r2geo(int o,float m,vec2 s){vec2 dm=r2dims();
 if(o==1)return vec2(s.x+m*s.y,s.y);if(o==2)return vec2(s.x,s.y+m*s.x);if(o==3)return s-vec2(m,0.);if(o==4)return s-vec2(0.,m);
 if(o==5){vec2 cc=dm*.5;float a=radians(m);vec2 d=s-cc;return cc+vec2(cos(a)*d.x-sin(a)*d.y,sin(a)*d.x+cos(a)*d.y);}return s;}
bool r2isgeo(int o){return o>=1&&o<=5;}
vec3 r2chain(vec2 px,int n,int op[4],float mg[4]){vec2 dm=r2dims();vec2 s=px;int fill=-1;
 for(int k=3;k>=0;k--){if(k>=n)continue;if(r2isgeo(op[k])){s=r2geo(op[k],mg[k],s);if(s.x<0.||s.y<0.||s.x>=dm.x||s.y>=dm.y){fill=k;break;}}}
 vec3 v=fill>=0?vec3(0.):r2src(s);for(int k=0;k<4;k++){if(k>=n)break;if(k<=fill||r2isgeo(op[k]))continue;v=r2cop(op[k],mg[k],v,s,k,op,mg);}return v;}
void r2pick(int pol,float ci,out int op[4],out float mg[4],out int n){
 for(int k=0;k<4;k++){op[k]=0;mg[k]=0.;}n=0;
 if(pol==0){n=int(u_p2+.5);for(int k=0;k<4;k++){if(k>=n)break;float fk=float(k);int o=min(int(r2r(fk,1.)*14.),13);float m=r2val(0,o,clamp(floor(u_p1+.5),0.,30.));if(r2signed(o)&&r2r(fk,2.)<.5)m=-m;op[k]=o;mg[k]=m;}}
 else if(pol==1){n=1;int o=min(int(r2r(0.,1.)*14.),13);float m=r2val(1,o,floor(r2r(0.,3.)*31.));if(r2signed(o)&&r2r(0.,2.)<.5)m=-m;op[0]=o;mg[0]=m;}
 else if(pol==2){int AO[50]=int[50](10,5, 11,12, 13,13, 10,10, 13,11, 13,5, 11,13, 10,13, 5,11, 13,10, 5,7, 5,13, 13,13, 14,13, 7,8, 5,7, 7,11, 9,14, 1,13, 7,13, 13,11, 11,12, 14,13, 7,8, 13,13);
  float AP[50]=float[50](.4,.6, .6,.6, .8,.6, .6,.6, .4,.2, .4,.8, .6,.6, .8,1., .2,.6, .6,.4, .8,.4, .4,.6, 0.,.8, .6,1., .6,1., .8,1., .8,.8, .4,.6, .6,1., .4,.6, .4,.2, .6,.6, .6,1., .6,1., .8,.6);
  float AM[50]=float[50](8.,9., 5.,0., 0.,0., 7.,6., 0.,4., 0.,8., 3.,0., 5.,0., 3.,8., 0.,6., 8.,0., 9.,0., 0.,0., 0.,0., 4.,8., 8.,2., 8.,7., 7.,0., 5.,0., 0.,0., 0.,4., 5.,0., 0.,0., 4.,8., 0.,0.);
  int sp=min(int(r2r(0.,5.)*25.),24);for(int k=0;k<2;k++){int id=sp*2+k;if(r2r(float(k),6.)<AP[id]){int o=AO[id];float m=r2val(2,o,AM[id]);if(r2signed(o)&&r2r(float(k),2.)<.5)m=-m;op[n]=o;mg[n]=m;n++;}}}
 else{int AX[13]=int[13](1,2,3,4,5,10,11,12,13,6,7,8,9);float sev=clamp(floor(u_p1/3.+.5),1.,10.);n=1+min(int(r2r(ci,7.)*3.),2);
  for(int k=0;k<3;k++){if(k>=n)break;float fk=float(k)+ci*4.;int o=AX[min(int(r2r(fk,1.)*13.),12)];float m=r2val(3,o,floor(r2r(fk,3.)*sev));if(r2signed(o)&&r2r(fk,2.)<.5)m=-m;op[k]=o;mg[k]=m;}}}
`;
f('policyaug','Policy Augment (RandAugment / TrivialAugment / AutoAugment / AugMix)',[S('Policy',['RandAugment','TrivialAugmentWide','AutoAugment (ImageNet)','AugMix']),P('Magnitude',0,30,9,1),P('Ops (RandAugment)',1,4,2,1),P('Variant',0,99,0,1)],
  R2BFN(R2POL,`int pol=int(u_p0+.5);vec2 dm=r2dims();vec2 px=vec2(PX(uv).x,dm.y-PX(uv).y);int op[4];float mg[4];int n;
  if(pol<3){r2pick(pol,0.,op,mg,n);return vec4(r2chain(px,n,op,mg),1.);}
  float w0=-log(max(r2r(0.,8.),1e-6)),w1=-log(max(r2r(1.,8.),1e-6)),w2=-log(max(r2r(2.,8.),1e-6));float ws=w0+w1+w2;float mb=r2r(0.,9.);
  vec3 mix3=vec3(0.);r2pick(3,0.,op,mg,n);mix3+=w0/ws*r2chain(px,n,op,mg);r2pick(3,1.,op,mg,n);mix3+=w1/ws*r2chain(px,n,op,mg);r2pick(3,2.,op,mg,n);mix3+=w2/ws*r2chain(px,n,op,mg);
  return vec4(mb*r2src(px)+(1.-mb)*mix3,1.);`),
  'torchvision policies over the PIL op set (Identity, ShearX/Y, TranslateX/Y, Rotate, Brightness, Color, Contrast, Sharpness, Posterize, Solarize, AutoContrast, Equalize, Invert; nearest sampling, black fill): RandAugment (N ops, magnitude bin of 31), TrivialAugmentWide (1 op, random bin, wide ranges), AutoAugment ImageNet policy (25 two-op sub-policies with probabilities), AugMix (3 chains of depth 1-3 at severity = Magnitude/3, Dirichlet(1) mixing weights, Beta(1,1) skip blend); randomness from the seed and Variant; approx.: image statistics for Contrast / AutoContrast / Equalize from a 16x16 sample grid, ignoring earlier geometric ops',1);

f('kornia_illum','Random Linear / Gaussian Illumination (kornia)',[S('Pattern',['Linear','Gaussian']),P('Gain',-.4,.4,.15,.01),S('Direction',['Top to bottom','Bottom to top','Left to right','Right to left']),P('Sigma',.1,1,.35,.01)],
  `int d=int(u_p2+.5);vec2 q=vec2(uv.x,1.-uv.y);float g;if(u_p0<.5){g=d==0?1.-q.y:d==1?q.y:d==2?1.-q.x:q.x;}
  else{vec2 cn=vec2(.5)+(d==0?vec2(0.,-.25):d==1?vec2(0.,.25):d==2?vec2(-.25,0.):vec2(.25,0.));vec2 dd=q-cn;g=exp(-dot(dd,dd)/(2.*u_p3*u_p3));}
  return vec4(clamp(c.rgb+u_p1*g,0.,1.),1.);`,
  'kornia RandomLinearIllumination (additive ramp 0..1 from the chosen side, gain x sign) and RandomGaussianIllumination (additive Gaussian of the given sigma in normalised coordinates, centre offset toward the chosen side); result clamped to 0..1');
f('snowylandscape','Fast Snowy Landscape (imgaug)',[P('Lightness threshold',0,255,140,1),P('Lightness multiplier',1,4,2.5,.05)],
  `vec3 h=rgb2hsl(c.rgb);float L=h.z*255.;if(L<u_p0)h.z=min(L*u_p1,255.)/255.;return vec4(hsl2rgb(h),1.);`,
  'imgaug FastSnowyLandscape: RGB -> HLS, lightness below the threshold multiplied (clipped at 255), back to RGB - turns greens / greys of a landscape snow-white');
f('alphablendmask','Alpha Blend: Frequency Noise / Some Colors (imgaug)',[S('Mask',['Frequency noise','Some colors']),S('Foreground',['Grayscale','Invert','Hue rotate 180','Posterize 3 bit','Blur']),P('Noise exponent',-4,4,-2,.1),P('Noise size / hue bins',4,16,8,1)],
  R2BFN(R2BL,`int mk=int(u_p0+.5),fg=int(u_p1+.5);float a;
  if(mk==0){vec2 q=uv*vec2(asp(),1.)*u_p3*.5;float s=0.,tw=0.;for(int k=0;k<5;k++){float fq=exp2(float(k));float w=pow(fq,u_p2*.5);s+=w*(r2vn(q*fq+vec2(float(k)*7.3,3.1))-.5);tw+=w*w;}a=clamp(.5+1.6*s/sqrt(tw),0.,1.);}
  else{float nb=floor(u_p3+.5);float hu=fract(rgb2hsv(c.rgb).x+hash(vec2(3.,9.)));float bf=hu*nb;float b0=floor(bf),fr=fract(bf);float a0=step(.5,hash(vec2(b0,41.))),a1=step(.5,hash(vec2(mod(b0+1.,nb),41.)));
   float sm=.2;a=mix(a0,a1,smoothstep(1.-sm,1.,fr));}
  vec3 f=c.rgb;if(fg==0)f=vec3(luma(c.rgb));else if(fg==1)f=1.-c.rgb;else if(fg==2){vec3 h=rgb2hsv(c.rgb);h.x=fract(h.x+.5);f=hsv2rgb(h);}else if(fg==3)f=floor(c.rgb*255./32.)*32./255.;
  else{vec3 s=vec3(0.);float w=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){float g=exp(-float(i*i+j*j)/8.);s+=T(uv+vec2(float(i),float(j))*R(1.5)*u_px).rgb*g;w+=g;}f=s/w;}
  return vec4(mix(c.rgb,f,a),1.);`),
  'imgaug BlendAlphaFrequencyNoise / BlendAlphaSomeColors with a fixed foreground branch: frequency-noise mask = noise with amplitude ~ f^exponent on a grid of Noise size cells, linearly upscaled (approx.: octave sum instead of an inverse FFT, no random sigmoid); some-colors mask = hue split into N bins (random rotation) each randomly on / off, smoothed at the bin borders; alpha 1 = foreground',1);

/* ---------- Optics ---------- */
f = add('Blur');
f('opticbokeh','Optical Bokeh (Lensbaby / Petzval / Cat\'s-eye / Onion / STF / Anamorphic / Coma)',[S('Lens',['Lensbaby sweet spot','Petzval swirl','Cat\'s-eye (optical vignetting)','Onion-ring','Apodization (STF)','Anamorphic oval','Coma']),P('Radius',1,30,10,.5,'px'),P('Shape amount',0,1,.6,.01),P('Highlight boost',0,4,1,.05)],
  R2BFN(R2BL,`int ln=int(u_p0+.5);float A=u_p2;vec2 dm=r2dims();vec2 d=(uv-.5)*vec2(asp(),1.);float r=length(d)/length(vec2(asp(),1.)*.5);vec2 er=length(d)>1e-5?normalize(d):vec2(1.,0.);vec2 et=vec2(-er.y,er.x);
  float rad=R(u_p1);vec3 acc=vec3(0.);float ws=0.;
  for(int k=0;k<144;k++){float fk=float(k)+.5;float rho=sqrt(fk/144.);float ph=fk*2.39996323;vec2 s=rho*vec2(cos(ph),sin(ph));vec2 o;float w=1.;
   if(ln==0){float sp=mix(.55,.12,A);float m=pow(smoothstep(sp,1.,r),1.4);vec2 sl=s.x*er+s.y*et*.65;o=sl*rad*m*1.6;}
   else if(ln==1){float sq=1.-A*.75*smoothstep(.1,1.,r);o=(s.x*sq*er+s.y*et)*rad*(.55+.45*r);}
   else if(ln==2){float sh=A*2.4*r;if(length(s+er*sh)>1.)w=0.;o=s*rad;}
   else if(ln==3){w=(1.+A*.8*sin(6.2831853*3.*rho))*(1.+A*1.2*smoothstep(.82,1.,rho));o=s*rad;}
   else if(ln==4){float sg=mix(1.2,.32,A);w=exp(-rho*rho/(2.*sg*sg));o=s*rad;}
   else if(ln==5){o=vec2(s.x/(1.+A),s.y)*rad;}
   else{float p2=rho*rho;float ang=2.*ph;vec2 cm=p2*vec2(2.+cos(ang),sin(ang))/3.;o=(cm.x*er+cm.y*et)*rad*(.25+1.75*A)*r;}
   vec3 sc=O(uv+o*u_px).rgb;vec3 l=r2lin(sc)*(1.+u_p3*smoothstep(.85,1.,max(sc.r,max(sc.g,sc.b))));acc+=l*w;ws+=w;}
  vec3 bl=acc/max(ws,1e-5);bl=mix(bl,.8+.2*tanh((bl-.8)/.2),step(.8,bl));return vec4(r2srgb(bl),1.);`),
  'gathered lens PSFs (144 Vogel-spiral pupil samples, linear light, highlight boost): Lensbaby = sharp sweet spot with blur growing toward the edges (slightly radial); Petzval = background blur whose disc is squeezed radially toward the edges (tangential swirl); cat\'s-eye = aperture disc clipped by the shifted rear-element disc (shift grows with field radius); onion-ring = concentric ripple + bright rim from aspherical polishing marks; STF = Gaussian apodization filter (soft-edged discs); anamorphic = horizontally squeezed oval (squeeze 1 + amount); coma = third-order coma spot (rho^2 (2 + cos 2phi), rho^2 sin 2phi) growing linearly with field radius; approx.: PSF taken at the output pixel (gather)');
f('promist','Pro-Mist Diffusion Filter',[S('Filter',['Black Pro-Mist','Pro-Mist (white)']),P('Strength (grade)',0,2,.5,.01),P('Halo size',2,80,24,1,'px')],
  [R2BFN(R2BL,`return vec4(r2lin(c.rgb),1.);`),BH('u_p2'),BV('u_p2'),
   R2BFN(R2BL,`vec3 l=r2lin(O(uv).rgb);vec3 b=T(uv).rgb;float s=u_p1*.35;vec3 o;
   if(u_p0<.5){vec3 gl=max(b-l,0.);vec3 hi=b*smoothstep(.15,.7,luma(b));o=l*(1.-.25*s)+s*(.9*gl+.6*hi)*1.2;}
   else{o=l*(1.-s)+s*b*1.05+s*.02;}return vec4(r2srgb(o),1.);`)],
  'diffusion filter as linear-light scattering of a fraction of the light into a wide Gaussian halo (strength 1 ~ grade 1/2 x 2): white Pro-Mist scatters everything (veiling glare lifts the blacks, lower contrast); Black Pro-Mist, whose black particles absorb part of the scatter, only adds the halo where it is brighter than the pixel (glow around highlights, blacks kept)');
f = add('Depth');
f('splitdiopter','Split Diopter',[P('Split position',0,1,.5,.01),P('Angle',-90,90,0,1,'°'),P('Aperture',0,30,12,.5,'px'),P('Diopter focus',0,1,.85,.01)],
  R2BFN(R2BL,`float a=radians(u_p1);vec2 nn=vec2(cos(a),sin(a));float sd=dot((uv-.5)*vec2(asp(),1.),nn)-(u_p0-.5)*asp()*abs(nn.x)-(u_p0-.5)*abs(nn.y);
  float half_=smoothstep(-.03,.03,sd);float fz=mix(.15,u_p3,half_);float coc=clamp(abs(D(uv)-fz)*2.5,0.,1.);float edge=1.-smoothstep(0.,.02,abs(sd));coc=max(coc,edge*.35);
  float rad=R(u_p2)*coc;vec3 acc=vec3(0.);for(int k=0;k<64;k++){float fk=float(k)+.5;float rho=sqrt(fk/64.);float ph=fk*2.39996323;acc+=r2lin(O(uv+rho*vec2(cos(ph),sin(ph))*rad*u_px).rgb);}
  return vec4(r2srgb(acc/64.),1.);`),
  'split-field diopter: one side of the line (diopter half) is focused at Diopter focus depth, the other at the far background (depth 0.15); disc blur radius = Aperture x |depth - focus| (64-tap gather, linear light, approx.) with the soft blurred seam of the diopter edge');
f = add('Blur');
f('airyblur','Airy Disk Diffraction Blur',[P('f-number',1.4,32,16,.1),P('Pixel pitch',1,10,4,.1,'um'),S('Wavelengths',['RGB (620 / 540 / 460 nm)','Mono 550 nm'])],
  R2BFN(R2BL+`
float r2j1(float x){float ax=abs(x);if(ax<8.){float y=x*x;float a1=x*(72362614232.+y*(-7895059235.+y*(242396853.1+y*(-2972611.439+y*(15704.4826+y*(-30.16036606))))));float a2=144725228442.+y*(2300535178.+y*(18583304.74+y*(99447.43394+y*(376.9991397+y))));return a1/a2;}
 float z=8./ax;float y=z*z;float xx=ax-2.356194491;float p1=1.+y*(.00183105+y*(-.00003516396496+y*(.000002457520174+y*(-.000000240337019))));float p2=.04687499995+y*(-.0002002690873+y*(.000008449199096+y*(-.00000088228987+y*.000000105787412)));
 float an=sqrt(.636619772/ax)*(cos(xx)*p1-z*sin(xx)*p2);return x<0.?-an:an;}
float r2airy(float r,float r0){float x=3.8317*r/r0;if(x<1e-3)return 1.;float v=2.*r2j1(x)/x;return v*v;}`,
  `vec3 lam=u_p2>.5?vec3(.55):vec3(.62,.54,.46);vec3 r0=1.22*lam*u_p0/u_p1*u_k;float ext=3.3*max(r0.r,max(r0.g,r0.b));float st=max(.5,ext/16.);
  vec3 acc=vec3(0.),ws=vec3(0.);for(int j=-16;j<=16;j++)for(int i=-16;i<=16;i++){vec2 o=vec2(float(i),float(j))*st;float rr=length(o);if(rr>ext+st)continue;vec3 w=vec3(r2airy(rr,r0.r),r2airy(rr,r0.g),r2airy(rr,r0.b));acc+=w*r2lin(T(uv+o*u_px).rgb);ws+=w;}
  return vec4(r2srgb(acc/ws),1.);`),
  'Fraunhofer diffraction of a circular aperture: PSF (2 J1(x)/x)^2 with first zero at 1.22 lambda N (converted to pixels by the pixel pitch), per-channel wavelengths, convolved in linear light out to ~3 rings (J1 by the Numerical Recipes rational / asymptotic approximation)');
f('stackblur','Stack Blur (Klingemann)',[P('Radius',1,48,8,1,'px')],
  [`float r=floor(R(u_p0)+.5);vec4 a=vec4(0.);float w=0.;for(int i=-64;i<=64;i++){float fi=float(i);if(abs(fi)>r)continue;float k=r+1.-abs(fi);a+=T(uv+vec2(fi,0.)*u_px)*k;w+=k;}return a/w;`,
   `float r=floor(R(u_p0)+.5);vec4 a=vec4(0.);float w=0.;for(int i=-64;i<=64;i++){float fi=float(i);if(abs(fi)>r)continue;float k=r+1.-abs(fi);a+=T(uv+vec2(0.,fi)*u_px)*k;w+=k;}return a/w;`],
  'Mario Klingemann 2004 StackBlur: separable triangular (tent) kernel of weights r + 1 - |i| per axis on the raw channel values (the stack is just an incremental way to compute it)');
f = add('Noise');
f('sensordust','Sensor Dust Spots',[P('Count',1,40,12,1),P('Size',4,60,18,1,'px'),P('f-number',2,22,11,.5),P('Opacity',0,1,.4,.01)],
  R2BFN(R2BL,`vec2 dm=r2dims();vec2 p=PX(uv);float t=1.;
  for(int k=0;k<40;k++){if(float(k)>=u_p0)break;float fk=float(k);vec2 cp=r2h2(vec2(fk,3.))*dm;float a=u_p1*(.25+.75*hash(vec2(fk,5.)))*.5;float b=u_p1*1.6/u_p2*(.6+.8*hash(vec2(fk,6.)));
   float dd=length(p-cp+vec2(sin(fk*1.7),cos(fk*2.3))*a*.3*smoothstep(4.,22.,u_p2));float cover=clamp((a+b-dd)/(2.*b),0.,1.);cover=cover*cover*(3.-2.*cover);float pk=a*a/((a+b)*(a+b))*4.;
   t*=1.-u_p3*min(pk,1.)*cover*(.6+.4*hash(vec2(fk,8.)));}
  return vec4(r2srgb(r2lin(c.rgb)*t),1.);`),
  'shadows of dust on the sensor cover glass: each particle is a disc whose shadow is blurred by the light cone (blur width ~ 1/f-number), so stopped down the spots are small, dark and crisp (irregular outline) and wide open they spread into faint large rings; multiplicative in linear light (absorbed light conserved: peak opacity ~ a^2 / (a + b)^2)',1);
