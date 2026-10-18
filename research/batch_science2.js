/* ================= science2: RGB remote-sensing indices, astro tools, SAR speckle, document, luminosity masks ================= */
const SCI2_DIV = t => `stops5(vec3(.13,.3,.6),vec3(.55,.7,.85),vec3(.97),vec3(.9,.55,.4),vec3(.6,.1,.1),${t})`;
f = add('Sensor');
f('rgbindex2','RGB Spectral Indices II',[S('Index',['ExR (excess red)','ExB (excess blue)','VEG (Hague)','COM (Guijarro)','GCC (green chromatic coord.)','WI (Woebbecke)','MExG (Burgos-Artizzu)','IKAW (Kawashima)','NGBDI','RGRI (red-green ratio)','RI (soil redness)','NDTI (turbidity)']),S('Output',['Diverging ramp','Viridis','Gray','Mask over image']),P('Gain',.2,5,1.5,.01),P('Mask threshold',-1,1,.15,.01)],
  `vec3 q=max(c.rgb,vec3(0.))+.004;int m=int(u_p0+.5);float vv[2];
  for(int k=0;k<2;k++){vec3 p=k==0?q:vec3((q.r+q.g+q.b)/3.);float R_=p.r,G_=p.g,B_=p.b;float sm=R_+G_+B_;float r=R_/sm,g=G_/sm,b=B_/sm;float v;
   if(m==0)v=1.4*r-g;else if(m==1)v=1.4*b-g;else if(m==2)v=log(g/(pow(r,.667)*pow(b,.333)));
   else if(m==3){float exg=2.*g-r-b,exr=1.4*r-g,cive=.441*r-.811*g+.385*b+18.78745,veg=g/(pow(r,.667)*pow(b,.333));v=.25*exg+.3*(exg-exr)+.33*cive+.12*veg;}
   else if(m==4)v=g;else if(m==5){float dn=R_-G_;dn=abs(dn)<.02?(dn<0.?-.02:.02):dn;v=atan((G_-B_)/dn)/1.5708;}
   else if(m==6)v=1.262*g-.884*r-.311*b;else if(m==7)v=(R_-B_)/(R_+B_);else if(m==8)v=(G_-B_)/(G_+B_);
   else if(m==9)v=log(R_/G_);else if(m==10)v=log(R_*R_/(B_*G_*G_*G_));else v=(R_-G_)/(R_+G_);vv[k]=v;}
  float sc=m==0?2.:m==1?2.:m==2?1.:m==3?2.:m==4?4.:m==5?1.:m==6?3.:m==7?1.:m==8?1.5:m==9?1.:m==10?.25:1.5;
  float d=clamp((vv[0]-vv[1])*sc,-1.,1.);float t=clamp(.5+d*u_p2*.5,0.,1.);int pal=(m==2||m==3||m==4||m==6||m==8)?0:m==1?2:1;int o=int(u_p1+.5);
  vec3 hi=pal==0?vec3(.1,.9,.2):pal==1?vec3(1.,.25,.1):vec3(.15,.45,1.);
  if(o==0){vec3 col=pal==0?stops5(vec3(.65,0.,.15),vec3(.96,.43,.26),vec3(1.,1.,.75),vec3(.4,.74,.39),vec3(0.,.41,.22),t):pal==1?stops5(vec3(0.,.35,.4),vec3(.4,.7,.7),vec3(1.,1.,.85),vec3(.95,.55,.3),vec3(.6,.1,.05),t):stops5(vec3(.55,.4,.05),vec3(.85,.75,.4),vec3(1.,1.,.85),vec3(.45,.65,.85),vec3(.05,.2,.55),t);return vec4(col,1.);}
  if(o==1)return vec4(ramp(2,t),1.);if(o==2)return vec4(vec3(t),1.);return vec4(d*u_p2>u_p3?mix(c.rgb,hi,.55):c.rgb*.45,1.);`,
  'published formulas on chromatic coords r,g,b = R,G,B/(R+G+B): ExR = 1.4r - g (Meyer et al. 1998); ExB = 1.4b - g = (1.4B - G)/(R+G+B) (Mao et al. 2003); VEG = g/(r^0.667 b^0.333) (Hague et al. 2006); COM = 0.25 ExG + 0.30 ExGR + 0.33 CIVE + 0.12 VEG (Guijarro et al. 2011); GCC = G/(R+G+B) (Gillespie 1987, PhenoCam); WI = (G-B)/(R-G) (Woebbecke et al. 1995, shown as atan); MExG = 1.262g - 0.884r - 0.311b (Burgos-Artizzu et al. 2011); IKAW = (R-B)/(R+B) (Kawashima & Nakatani 1998); NGBDI = (G-B)/(G+B); RGRI = R/G (Gamon & Surfus 1999); RI = R^2/(B G^3) (Madeira et al. 1997); NDTI = (R-G)/(R+G) (Lacaux et al. 2007); ratio indices shown as log; display = index minus its value for neutral grey of the same brightness, times Gain');

f = add('Tone');
f('ghs','Generalized Hyperbolic Stretch (GHS)',[P('Stretch ln(D+1)',0,10,2,.01),P('Local intensity b',-5,15,2,.1),P('Symmetry point SP',0,1,.1,.001),P('Protect highlights HP',0,1,1,.001)],
  `float D=exp(u_p0)-1.;if(D<1e-4)return vec4(c.rgb,1.);float b=u_p1,SP=u_p2,HP=max(u_p3,SP);
#define SCI2GB(u) (abs(b)<1e-3?1.-exp(-D*(u)):abs(b+1.)<1e-3?log(1.+D*(u)):b<0.?(1.-pow(1.-b*D*(u),(b+1.)/b))/(b+1.):1.-pow(1.+b*D*(u),-1./b))
#define SCI2GD(u) (abs(b)<1e-3?D*exp(-D*(u)):abs(b+1.)<1e-3?D/(1.+D*(u)):b<0.?D*pow(1.-b*D*(u),1./b):D*pow(1.+b*D*(u),-(1.+b)/b))
#define SCI2TT(v_) ((v_)<SP?-SCI2GB(SP-(v_)):(v_)<HP?SCI2GB((v_)-SP):SCI2GB(HP-SP)+SCI2GD(HP-SP)*((v_)-HP))
  float t0=SCI2TT(0.),t1=SCI2TT(1.);vec3 x=clamp(c.rgb,0.,1.);vec3 y=vec3(SCI2TT(x.r),SCI2TT(x.g),SCI2TT(x.b));return vec4(clamp((y-t0)/(t1-t0),0.,1.),1.);`,
  'Payne & Cranfield 2021 (PixInsight / Siril GHS): b = -1 log, b < 0 integral, b = 0 exponential, b > 0 hyperbolic (b = 1 harmonic) branches, mirrored below SP, linear above HP (continuous slope), normalised to 0..1; LP fixed at 0; per channel (RGB/K)');
f('lumamasks','Luminosity Masks (Lights / Darks / Midtones)',[S('Mask',['Lights','Darks','Midtones']),P('Level',1,6,2,1),S('Output',['Mask','Mask overlay','Brighten through mask','Darken through mask']),P('Amount',0,1,.5,.01)],
  `float l=clamp(luma(c.rgb),0.,1.);float n=floor(u_p1+.5);int m=int(u_p0+.5);float mk=m==0?pow(l,n):m==1?pow(1.-l,n):clamp(1.-pow(l,n+1.)-pow(1.-l,n+1.),0.,1.);int o=int(u_p2+.5);
  if(o==0)return vec4(vec3(mk),1.);if(o==1)return vec4(mix(c.rgb*.6,vec3(1.,.15,.1),mk*.65),1.);if(o==2)return vec4(c.rgb+(1.-c.rgb)*mk*u_p3*.7,1.);return vec4(c.rgb*(1.-mk*u_p3*.7),1.);`,
  'Kuyper-style luminosity masks: Lights n = L^n (n-fold self-intersection), Darks n = (1-L)^n, Midtones n = 1 - Lights(n+1) - Darks(n+1); adjustment applied through the mask');

f = add('Repair');
f('acdnr','ACDNR (Adaptive Contrast-Driven Noise Reduction)',[P('Std dev',.5,8,1.5,.1,'px'),P('Amount',0,1,.8,.01),P('Edge protection',.002,.2,.03,.001),P('Lightness mask',0,1,.6,.01)],
  [BH('u_p0*2.'),BV('u_p0*2.'),
   `vec3 o=O(uv).rgb,d=T(uv).rgb-o;vec3 w=1.-smoothstep(vec3(u_p2),vec3(u_p2*2.),abs(d));float mk=mix(1.,1.-smoothstep(.1,.9,luma(o)),u_p3);return vec4(o+d*w*u_p1*mk,1.);`],
  'PixInsight ACDNR idea, approx.: Gaussian smoothing (std dev) whose per-pixel change is cut where it exceeds the edge-protection threshold (fades out between 1x and 2x), weighted by an inverted lightness mask so dark low-SNR areas get the most; single pass, no structure-size or iteration controls');
f('enhspeckle','Enhanced Lee / Frost (SAR speckle)',[S('Method',['Enhanced Lee','Enhanced Frost']),P('Window radius',1,7,3,1,'px'),P('Looks (ENL)',1,16,4,.5),P('Damping K',.1,4,1,.05)],
  `int r=int(u_p1+.5);float e=max(u_k,1.);vec3 sm=vec3(0.),sq=vec3(0.);float n=0.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;sm+=v;sq+=v*v;n+=1.;}
  vec3 mu=sm/n,sd=sqrt(max(sq/n-mu*mu,vec3(0.)));vec3 ci=sd/max(mu,vec3(1e-3));float cu=1./sqrt(u_p2),cmax=sqrt(1.+2./u_p2);vec3 cl=clamp(ci,vec3(cu),vec3(cmax-1e-3));vec3 kk=u_p3*(cl-cu)/(cmax-cl);vec3 res;
  if(u_p0<.5){vec3 w=exp(-kk);res=mu*w+c.rgb*(1.-w);}else{vec3 acc=vec3(0.),ws=vec3(0.);for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;vec3 w=exp(-kk*length(vec2(float(i),float(j))));acc+=w*v;ws+=w;}res=acc/ws;}
  res=mix(res,mu,step(ci,vec3(cu)));res=mix(res,c.rgb,step(vec3(cmax),ci));return vec4(res,1.);`,
  'Lopes, Touzi & Nezry 1990: Cu = 1/sqrt(ENL), Cmax = sqrt(1 + 2/ENL), Ci = local std/mean; Ci <= Cu -> local mean, Ci >= Cmax -> original, between: Lee w = exp(-K (Ci-Cu)/(Cmax-Ci)) mixes mean and pixel, Frost kernel exp(-K (Ci-Cu)/(Cmax-Ci) |d|); per channel');

f = add('Sharpen');
f('darkstructure','Dark Structure Enhance',[P('Structure scale',2,64,12,1,'px'),P('Amount',0,1,.4,.01),P('Mask gain',1,40,5,.5),S('Output',['Enhanced','Dark structure mask'])],
  [BH('u_p0'),BV('u_p0'),
   `vec3 o=O(uv).rgb;float l=luma(o),bg=luma(T(uv).rgb);float mk=clamp((bg-l)*u_p2,0.,1.);mk=mk*mk*(3.-2.*mk);if(u_p3>.5)return vec4(vec3(mk),1.);return vec4(o*(1.-u_p1*mk),1.);`],
  'after the PixInsight DarkStructureEnhance script, approx.: dark-structure mask = large-scale background (the wavelet residual; here a Gaussian of the structure scale) minus lightness, then the image is darkened through that mask');

f = add('Analysis');
f('rangemask','Range Selection Mask',[P('Lower limit',0,1,.25,.005),P('Upper limit',0,1,.75,.005),P('Fuzziness',0,.5,.05,.005),P('Smoothness',0,40,2,.5,'px')],
  [`float l=luma(c.rgb);float lo=min(u_p0,u_p1),hi=max(u_p0,u_p1),fz=max(u_p2,1e-4);float m=smoothstep(lo-fz,lo+fz,l)*(1.-smoothstep(hi-fz,hi+fz,l));if(u_p0>u_p1)m=1.-m;return vec4(vec3(m),1.);`,
   BH('u_p3'),BV('u_p3')],
  'PixInsight RangeSelection: 1 between the lower and upper lightness limits, fuzziness = soft transition half-width, smoothness = Gaussian blur of the mask; lower > upper selects outside the range (invert)');
f('bataineh','Bataineh Binarization',[P('Window',6,160,40,1,'px'),S('Output',['Binary','Threshold surface','Overlay'])],
  [`float r=R(u_p0*.5);float st=r/5.;float s=0.,s2=0.;for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){float v=L(uv+vec2(float(i),float(j))*st*u_px);s+=v;s2+=v*v;}s/=121.;return vec4(s,sqrt(max(s2/121.-s*s,0.))*2.,0.,1.);`,
   `vec4 s=T(uv);float mw=s.r,sw=s.g*.5;float smin=1.,smax=0.,mg=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;float sd=T(q).g*.5;smin=min(smin,sd);smax=max(smax,sd);mg+=luma(O(q).rgb);}mg/=256.;
   float sa=(sw-smin)/max(smax-smin,1e-4);float th=mw-mw*mw*sw/((mg+sw)*(sa+sw)+1e-6);vec3 o=O(uv).rgb;float bw=step(th,luma(o));int m=int(u_p1+.5);
   if(m==1)return vec4(vec3(clamp(th,0.,1.)),1.);if(m==0)return vec4(vec3(bw),1.);return vec4(mix(o,vec3(1.,.1,.1),(1.-bw)*.6),1.);`],
  'Bataineh, Abdullah & Omar 2011: T = m - m^2 s / ((M + s)(s_a + s)), m, s = window mean / std, M = global mean, s_a = (s - s_min)/(s_max - s_min); fixed window (the paper picks the window size per image), 11x11 sparse window, global stats from a 16x16 grid');

f = add('Color');
const SCI2_DIL = d => `vec4 o=T(uv);float r=R(u_p2);float st=max(1.,r/16.);float m=o.a;for(int i=-16;i<=16;i++){float x=float(i)*st;if(abs(x)>r)continue;m=max(m,T(uv+${d}*x*u_px).a*(1.-.5*abs(x)/(r+1.)));}return vec4(o.rgb,m);`;
f('unpurple','Unpurple (Star Halo)',[P('Amount',0,1,.8,.01),P('Star threshold',0,.5,.06,.005),P('Halo radius',1,40,4,.5,'px'),S('Apply to',['Star halos','Whole image','Show halo mask'])],
  [`float l=L(uv);float bg=blurL(uv,R(5.));return vec4(c.rgb,smoothstep(u_p1,u_p1+.05,l-bg));`,SCI2_DIL('vec2(1.,0.)'),SCI2_DIL('vec2(0.,1.)'),
   `vec3 o=O(uv).rgb;int m=int(u_p3+.5);float mk=m==1?1.:smoothstep(.45,1.,T(uv).a);if(m==2)return vec4(vec3(mk),1.);float k=u_p0*mk;float pb=max(o.b-o.g,0.),pr=max(min(o.r,o.b)-o.g,0.);return vec4(o.r-k*pr*.5,o.g,o.b-k*pb,1.);`],
  'after Siril Unpurple, approx.: star mask (luminance above local background) dilated to the halo radius; inside it the blue excess over green and the magenta (min(R,B) over G) excess are removed, so violet halos from refractor / filter chromatic aberration turn neutral');

/* ================= science2: terrain analysis (luminance = elevation) ================= */
f = add('Terrain');
f('rrim','Red Relief Image Map (RRIM)',[P('Radius',4,120,30,1,'px'),P('Height scale',1,300,20,1),P('Slope gain',.2,5,1,.05),P('Openness gain',.2,5,1,.05)],
  `float h=L(uv)*u_p1;float po=0.,no=0.;for(int k=0;k<8;k++){vec2 d=vec2(cos(float(k)*.7854),sin(float(k)*.7854));float up=-1.57,dn=-1.57;for(int s=1;s<=16;s++){float r=float(s)/16.*R(u_p0);float a=atan((L(uv+d*r*u_px)*u_p1-h)/(r/u_k));up=max(up,a);dn=max(dn,-a);}po+=1.5708-up;no+=1.5708-dn;}
  float I=(po-no)/16.;vec2 g=sobelD(uv,max(u_k,1.))*.125*u_p1;float sl=atan(length(g));float s=clamp(sl/1.1*u_p2,0.,1.);float v=clamp(.62+I*1.6*u_p3,0.,1.);return vec4(v*mix(vec3(1.),vec3(.95,.12,.05),s),1.);`,
  'Chiba, Kaneta & Suzuki 2008: slope -> red saturation, openness differential (positive - negative openness)/2 -> brightness (ridges light, valleys dark); openness from 8 horizon directions');
f('lrm','Local Relief Model (LRM)',[P('Window',4,120,24,1,'px'),P('Gain',1,40,3,.5),S('Output',['Gray','Diverging'])],
  [BH('u_p0'),BV('u_p0'),
   `float h=luma(O(uv).rgb);vec2 e=u_px;float s0=luma(T(uv).rgb);float d0=h-s0;float w=0.;for(int k=0;k<4;k++){vec2 q=uv+(k==0?vec2(e.x,0.):k==1?vec2(-e.x,0.):k==2?vec2(0.,e.y):vec2(0.,-e.y));float dk=luma(O(q).rgb)-luma(T(q).rgb);if(d0*dk<=0.)w=1.;}return vec4(h*w,w,s0,1.);`,
   BH('u_p0'),BV('u_p0'),
   `vec4 t=T(uv);float pd=t.g>.002?t.r/t.g:t.b;float v=clamp(.5+(luma(O(uv).rgb)-pd)*u_p1,0.,1.);return vec4(u_p2<.5?vec3(v):${SCI2_DIV('v')},1.);`],
  'Hesse 2010: DEM low-pass -> difference map -> its zero contours -> DEM heights on those contours interpolated to a purged DEM -> LRM = DEM - purged DEM; here the interpolation is a Gaussian normalised convolution of the zero-crossing heights (approx. of the TIN)');
f('vrm','Vector Ruggedness Measure (VRM)',[P('Window radius',1,6,1,1,'px'),P('Height scale',1,300,20,1),P('Gain',1,100,8,.5),S('Display',['Gray','Color ramp'])],
  `int r=int(u_p0+.5);float sp=max(u_k,1.);vec2 e=u_px*sp;float zs=u_p1*.5*u_k/sp;vec3 sm=vec3(0.);float n=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){if(abs(i)>r||abs(j)>r)continue;vec2 q=uv+vec2(float(i),float(j))*e;float zx=(L(q+vec2(e.x,0.))-L(q-vec2(e.x,0.)))*zs,zy=(L(q+vec2(0.,e.y))-L(q-vec2(0.,e.y)))*zs;sm+=normalize(vec3(-zx,-zy,1.));n+=1.;}
  float t=clamp((1.-length(sm)/n)*u_p2,0.,1.);return vec4(u_p3<.5?vec3(t):ramp(0,t),1.);`,
  'Sappington, Longshore & Thompson 2007: unit surface normals summed over the window, VRM = 1 - |sum|/n (0 = flat or uniform slope)');
f('convergence','Convergence Index',[P('Distance',1,20,2,.5,'px'),P('Gain',.5,4,1.5,.05),S('Display',['Gray','Diverging'])],
  `float dd=R(u_p0);float acc=0.;for(int k=0;k<8;k++){float an=float(k)*.7854;vec2 dv=vec2(cos(an),sin(an));vec2 g=sobelD(uv+dv*dd*u_px,max(dd*.5,1.));float lg=length(g);acc+=lg<1e-5?0.:acos(clamp(dot(-g/lg,-dv),-1.,1.))-1.5708;}
  float t=clamp(.5+acc/8./1.5708*u_p1*.5,0.,1.);return vec4(u_p2<.5?vec3(t):${SCI2_DIV('t')},1.);`,
  'Koethe & Lehmeier 1996 (SAGA Convergence Index): mean over 8 neighbours of (angle between the neighbour aspect and the direction to the centre) - 90 deg; negative = convergent (valleys, dark / blue), positive = divergent (ridges)');
f('woodfeatures','Morphometric Features (Wood)',[P('Window radius',1,7,3,1,'px'),P('Slope tolerance',.1,30,3,.1,'deg'),P('Curvature tolerance',.0001,.05,.002,.0001),P('Height scale',1,300,20,1)],
  `int r=int(u_p0+.5);float sp=max(u_k,1.);vec2 e=u_px*sp;float ou=sp/u_k;float fr=float(r);float m2=0.;for(int i=-7;i<=7;i++){if(abs(i)>r)continue;m2+=float(i*i)*ou*ou;}m2/=2.*fr+1.;
  float szu=0.,szv=0.,suu=0.,szx=0.,szy=0.,sxx=0.,szxy=0.,sx2y2=0.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>r||abs(j)>r)continue;float x=float(i)*ou,y=float(j)*ou;float z=L(uv+vec2(float(i),float(j))*e)*u_p3;float u=x*x-m2,v=y*y-m2;szu+=z*u;szv+=z*v;suu+=u*u;szx+=z*x;szy+=z*y;sxx+=x*x;szxy+=z*x*y;sx2y2+=x*x*y*y;}
  float a=szu/suu,b=szv/suu,cc=szxy/sx2y2,d=szx/sxx,ee=szy/sxx;float slope=degrees(atan(sqrt(d*d+ee*ee)));float rt=sqrt((a-b)*(a-b)+cc*cc);float maxic=-a-b+rt,minic=-a-b-rt;float crosc=-2.*(b*d*d+a*ee*ee-cc*d*ee)/max(d*d+ee*ee,1e-12);float tol=u_p2;int cls;
  if(slope>u_p1)cls=crosc>tol?4:crosc<-tol?2:0;else if(maxic>tol)cls=minic>tol?5:minic<-tol?3:4;else if(minic<-tol)cls=maxic<-tol?1:2;else cls=0;
  vec3 col=cls==0?vec3(.71):cls==1?vec3(0.):cls==2?vec3(0.,0.,1.):cls==3?vec3(0.,1.,0.):cls==4?vec3(1.,1.,0.):vec3(1.,0.,0.);return vec4(col,1.);`,
  'Wood 1996 (GRASS r.param.scale): least-squares quadratic z = ax2+by2+cxy+dx+ey+f over the window; sloped cells by cross-sectional curvature (ridge / channel / planar), flat cells by max/min curvature (peak / pass / ridge / pit / channel / planar); colours: planar grey, pit black, channel blue, pass green, ridge yellow, peak red');
f('geomorphons','Geomorphons',[P('Search radius',4,120,30,1,'px'),P('Flatness threshold',0,10,1,.1,'deg'),P('Height scale',1,300,20,1),S('Output',['Landforms','Landforms over hillshade','Ternary counts (R higher, G lower)'])],
  `float h=L(uv)*u_p2;float th=radians(u_p1);int np=0,nm=0;for(int k=0;k<8;k++){vec2 d=vec2(cos(float(k)*.7854),sin(float(k)*.7854));float up=-1.6,dn=-1.6;for(int s=1;s<=20;s++){float r=float(s)/20.*R(u_p0);float a=atan((L(uv+d*r*u_px)*u_p2-h)/(r/u_k));up=max(up,a);dn=max(dn,-a);}if(abs(up-dn)>th){if(up>dn)np++;else nm++;}}
  int o=int(u_p3+.5);if(o==2)return vec4(float(np)/8.,float(nm)/8.,0.,1.);
  int FT[81]=int[81](0,0,0,7,7,8,8,8,9, 0,0,7,7,7,8,8,8,0, 0,3,5,5,6,6,8,0,0, 3,3,5,5,5,6,0,0,0, 3,3,4,5,5,0,0,0,0, 2,2,4,4,0,0,0,0,0, 2,2,2,0,0,0,0,0,0, 2,2,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0);
  vec3 PAL[10]=vec3[10](vec3(220.,220.,220.),vec3(56.,0.,0.),vec3(200.,0.,0.),vec3(255.,80.,20.),vec3(250.,210.,60.),vec3(255.,255.,60.),vec3(180.,230.,20.),vec3(60.,250.,150.),vec3(0.,0.,255.),vec3(0.,0.,56.));
  vec3 col=PAL[FT[nm*9+np]]/255.;if(o==0)return vec4(col,1.);vec2 g=sobelD(uv,max(u_k,1.))*.125*u_p2;float hs=clamp(dot(normalize(vec3(-g,1.)),normalize(vec3(-.5,.5,.7))),0.,1.);return vec4(col*(.35+.75*hs),1.);`,
  'Jasiewicz & Stepinski 2013 (GRASS r.geomorphon): 8-direction line-of-sight zenith / nadir angles within the search radius -> ternary pattern (higher / lower / flat by the flatness threshold) -> 10 landforms from the (#lower, #higher) lookup table: flat, peak, ridge, shoulder, spur, slope, hollow, footslope, valley, pit (r.geomorphon colours)');
f('devmean','Deviation from Mean Elevation (DEV)',[P('Window radius',4,120,20,1,'px'),P('Gain',.5,4,1,.05),S('Display',['Gray','Diverging'])],
  `float st=R(u_p0)/7.;float s=0.,s2=0.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){float v=L(uv+vec2(float(i),float(j))*st*u_px);s+=v;s2+=v*v;}s/=225.;float sd=sqrt(max(s2/225.-s*s,1e-8));float dv=(L(uv)-s)/sd;
  float t=clamp(.5+dv*u_p1*.2,0.,1.);return vec4(u_p2<.5?vec3(t):${SCI2_DIV('t')},1.);`,
  'Wilson & Gallant 2000: DEV = (z - local mean) / local std over the window (15x15 sparse samples); 0 = mid grey, +-2.5 std at Gain 1');
f('d8dir','D8 Flow Direction',[S('Output',['Direction colours','ESRI code (gray = code/255)','Arrows']),P('Arrow spacing',8,64,16,1,'px'),P('Smoothing',0,8,2,.1,'px')],
  [BH('u_p2'),BV('u_p2'),
   `vec2 e=u_px*max(u_k,1.);int o=int(u_p0+.5);vec2 p=PX(uv);vec2 cc=(floor(p/u_p1)+.5)*u_p1;vec2 q=o==2?fromPX(cc):uv;float z=luma(T(q).rgb);float best=0.;int bi=-1;
   for(int k=0;k<8;k++){vec2 dv=vec2(float(k==0||k==1||k==7)-float(k==3||k==4||k==5),float(k==1||k==2||k==3)-float(k==5||k==6||k==7));float drop=(z-luma(T(q+dv*e).rgb))/length(dv);if(drop>best){best=drop;bi=k;}}
   if(o==1)return vec4(vec3(bi<0?0.:bi==0?1./255.:pow(2.,float(8-bi))/255.),1.);
   if(o==0)return vec4(bi<0?vec3(0.):hsv2rgb(vec3(float(bi)/8.,.8,.95)),1.);
   vec3 bg=vec3(.25+.6*luma(T(uv).rgb));if(bi<0)return vec4(bg,1.);float an=float(bi)*.7854;vec2 d=vec2(cos(an),sin(an));vec2 lp=p-cc;float al=dot(lp,d),pe=abs(dot(lp,vec2(-d.y,d.x)));float hl=u_p1*.4;
   float sh=step(pe,.7)*step(-hl,al)*step(al,hl);float hd=step(hl-u_p1*.25,al)*step(al,hl)*step(pe,(hl-al)*.6+.3);return vec4(mix(bg,vec3(1.,.2,.1),max(sh,hd)),1.);`],
  "O'Callaghan & Mark 1984: steepest drop (height difference / distance) to one of the 8 neighbours; ESRI codes E 1, SE 2, S 4, SW 8, W 16, NW 32, N 64, NE 128 (0 = pit / flat), image up = north");
f('tanaka','Tanaka Illuminated Contours',[P('Levels',4,40,12,1),P('Line width',.5,6,1.6,.1,'px'),P('Light azimuth',0,360,315,1,'deg'),S('Background',['Stepped gray','Hypsometric','Image'])],
  [BH('1.5'),BV('1.5'),
   `vec2 e=u_px;float h=luma(T(uv).rgb)*u_p0;vec2 g=vec2(luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb),luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb))*.5*u_p0;float gl=max(length(g),1e-5);
   float fr=fract(h);float dpx=min(fr,1.-fr)/gl;float az=radians(u_p2);vec2 ld=vec2(sin(az),cos(az));float cs=dot(-g/gl,ld);float w=R(u_p1)*(.3+.7*abs(cs));float line=(1.-smoothstep(w*.5-.6,w*.5+.6,dpx))*smoothstep(0.,.002,gl);
   float band=clamp(floor(h)/max(u_p0-1.,1.),0.,1.);int m=int(u_p3+.5);vec3 bg=m==0?vec3(mix(.3,.75,band)):m==1?stops5(vec3(.2,.45,.3),vec3(.55,.68,.38),vec3(.8,.72,.48),vec3(.6,.45,.33),vec3(.93),band):O(uv).rgb;
   return vec4(mix(bg,vec3(smoothstep(-.25,.25,cs)),line),1.);`],
  'Tanaka 1950 relief contours: contour lines lit white where the downhill side faces the light, black where it faces away, line width ~ |cos| of the angle to the light, over stepped layer tints');
f('heteroterrain','Hetero Terrain (Musgrave)',[P('Scale',.5,20,4,.1),P('Roughness H',0,2,.9,.01),P('Offset',0,2,.7,.01),S('Output',['Height map','Shaded relief'])],
  `float mn=1e9,mx=-1e9;float hv[3];vec2 dx=vec2(u_px.x,0.)*2.,dy=vec2(0.,u_px.y)*2.;for(int s=0;s<67;s++){vec2 q=s<64?(vec2(float(s-s/8*8),float(s/8))+.5)/8.:s==64?uv:s==65?uv+dx:uv+dy;
   vec2 p=q*vec2(asp(),1.)*u_p0+vec2(u_seed*7.31,u_seed*3.17);float val=u_p2+vnoise(p)*2.-1.;p=mat2(.8,-.6,.6,.8)*p*2.;for(int o=1;o<8;o++){float inc=(vnoise(p)*2.-1.+u_p2)*pow(2.,-u_p1*float(o))*val;val+=inc;p=mat2(.8,-.6,.6,.8)*p*2.;}
   if(s<64){mn=min(mn,val);mx=max(mx,val);}else hv[s-64]=val;}
  float rg=max(mx-mn,1e-4);float h=clamp((hv[0]-mn)/rg,0.,1.);if(u_p3<.5)return vec4(vec3(h),1.);vec2 g=vec2(hv[1]-hv[0],hv[2]-hv[0])/rg*u_res.y*.15;float hs=clamp(dot(normalize(vec3(-g,1.)),normalize(vec3(-.5,.5,.7))),0.,1.);return vec4(vec3(.15+.85*hs)*mix(vec3(.55,.6,.45),vec3(1.),h),1.);`,
  'Musgrave HeteroTerrain (Texturing & Modeling, ch. 16): value = offset + noise; each further octave adds (noise + offset) * lacunarity^(-H i) * value (smooth lowlands, rough peaks); value noise, 8 octaves, lacunarity 2 with rotation, normalised by an 8x8 sample grid (approx.)',1);
