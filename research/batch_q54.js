/* ================= q54: round-19 utility-dctls (Thatcher Freeman), other Resolve DCTLs, Fusion Reactor atoms, Filter Forge snippets ================= */
// Ported from the .dctl / .fuse / .setting sources (raw GitHub / GitLab). Scene-linear DCTLs run on the sRGB image linearised
// (LIN) and re-encoded (SRGB) unless the note says they act on code values like the original.
const Q54_DIE = v => `mix((${v})*10.44426855,(log2(max((${v})+.0075,1e-6))+7.)*.07329248,step(vec3(.00262409),(${v})))`;
const Q54_DID = v => `mix((${v})/10.44426855,exp2((${v})/.07329248-7.)-.0075,step(vec3(.02740668),(${v})))`;
// smoothstep2 of utility-dctls (4t^3 / 1-4(1-t)^3) and its anti-aliased circle weight
const Q54_SS2 = `
#define Q54S2(t_) ((t_)<.5?4.*(t_)*(t_)*(t_):1.-4.*(1.-(t_))*(1.-(t_))*(1.-(t_)))
#define Q54CW(d_,rr_) ((d_)<(rr_)-.5?1.:(d_)>(rr_)+.5?0.:1.-Q54S2(clamp((d_)-(rr_)+.5,0.,1.)))
`;
// Soranzo inverse-normal approximation used by the utility-dctls noise tools
const Q54_ZN = `
#define Q54Z(u_) (sign((u_)-.5001)*((abs((u_)-.5)+.5)>=.995?2.5758:(10./log(41.))*log(1.-log(-log(abs((u_)-.5)+.5)/log(2.))/log(22.))))
`;

f = add('Tone');
f('q54_danielecurve','Daniele Curve (utility-dctls)',[P('Peak Ratio',1,10,1,.1),P('Contrast',.5,2,1.2,.01),P('Exposure',.1,10,.4,.01),P('Flare Comp',0,.1,.05,.005)],
  `vec3 a=max(c.rgb,0.);vec3 x=${LIN('a')};float m=u_p0;float s_=u_p2*pow(m,1./u_p1);vec3 fx=m*pow(x/(x+s_),vec3(u_p1));vec3 y=clamp(fx*fx/(fx+u_p3+1e-6),0.,1.);return vec4(${SRGB('y')},1.);`,
  'thatcherfreeman utility-dctls Daniele Curve.dctl (Siragusano ACES-central tonescale): m = peak/white, s = exposure*m^(1/contrast), f = m*(x/(x+s))^contrast, y = f^2/(f+flare); on the linearised image, re-encoded sRGB');
f('q54_protectedtm','Protected Tone Mapping (utility-dctls)',[P('Threshold',0,1,.5,.01),P('Max Limit',.5,4,1,.01),P('Exposure',-2,4,1,.1,'EV'),S('Space',['Linear light','Code values'])],
  `vec3 a=max(c.rgb,0.);vec3 x=u_p3<.5?${LIN('a')}:a;x*=exp2(u_p2);float T0=u_p0,sp=max(u_p1-u_p0,1e-4);vec3 e=max(x-T0,0.);vec3 y=mix(x,T0+sp*e/(e+sp),step(T0,x));y=clamp(y,0.,1.);return vec4(u_p3<.5?${SRGB('y')}:y,1.);`,
  'utility-dctls Protected Tone Mapping.dctl: per channel identity up to Threshold, above it T + s*(x-T)/(x-T+s) with s = Limit-T (slope 1 at the knee, asymptote Limit); Exposure is an added pre-gain');
f('q54_lincontrast','Linear Contrast (utility-dctls)',[P('Neutral Gamma',0,5,1.25,.01),P('Red Gamma',0,5,1,.01),P('Green Gamma',0,5,1,.01),P('Blue Gamma',0,5,1,.01)],
  `vec3 a=c.rgb;vec3 x=${LIN('a')};vec3 e=u_p0*vec3(u_p1,u_p2,u_p3);vec3 y=clamp(sign(x)*.18*pow(abs(x)/.18,e),0.,1.);return vec4(${SRGB('y')},1.);`,
  'utility-dctls Linear Contrast.dctl: out = sign(x)*m*(|x|/m)^(gamma*channel gamma), pivot m = 0.18 grey; on the linearised image');
f('q54_coronahl','Corona Highlight Compression (Reactor TonemappingTools)',[P('Highlight Compression',1,10,3,.1),P('Exposure',-2,4,1,.1,'EV')],
  `vec3 a=max(c.rgb,0.);vec3 x=${LIN('a')}*exp2(u_p1);float n2=u_p0*u_p0;vec3 y=clamp(x*(1.+x/n2)/(1.+x),0.,1.);return vec4(${SRGB('y')},1.);`,
  'RacoonArtworks TonemappingTools CoronaHighlightCompression.setting: Custom tool r*(1+r/(n*n))/(1+r) per channel (n = 1 identity, large n = Reinhard); linear light, Exposure is an added pre-gain');
f('q54_dmcprimal','Primal Exposure + Flare (Demystify Color DMC_Primal)',[P('Exposure',-4,4,0,.1,'EV'),P('Flare Red',-.05,.05,0,.001),P('Flare Green',-.05,.05,0,.001),P('Flare Blue',-.05,.05,.01,.001)],
  `vec3 a=c.rgb;vec3 x=${LIN('a')}*exp2(u_p0)+vec3(u_p1,u_p2,u_p3);x=clamp(x,0.,1.);return vec4(${SRGB('x')},1.);`,
  'Demystify-Color DCTLs Exposure_Tools/DMC_Primal_v2.dctl: decode to linear, gain 2^exposure, then additive per-channel flare offsets (black lift), re-encode; here the decode/encode is sRGB (the DCTL offers camera log curves); temp/tint and the master flare slider are left out');
f('q54_ratioshaper','Ratio Shaper Key / Fill (Moaz Elgabry)',[P('Key Exposure',-6,6,.5,.1,'EV'),P('Key Falloff',0,1,.5,.01),P('Fill Exposure',-6,6,-1,.1,'EV'),P('Fill Falloff',0,1,.5,.01)],
  `vec3 a=c.rgb;vec3 ln=${LIN('a')};vec3 v=${Q54_DIE('ln')};float t0=.18*exp2(.5+(log2(.1875)+7.)*.07329248);
  float n=max(v.r,max(v.g,v.b)),Lm=dot(v,vec3(.27411851,.8736319,-.14775041));
  float ff=6.-5.*u_p3,fp=min(ff*.5,ff*.5*pow(.5,u_p2)),fc=exp2(u_p2);float fa=fp*(fc-1.)/pow(t0,fp+1.),fb=(1.-fc)*(fp+1.)/pow(t0,fp);
  float kf=5.*pow(u_p1,1.6)+1.,kp=(u_p0+kf)/kf,km=exp2(u_p0);float ka=pow(t0,1.-kp)/kp,kb=t0*(1.-1./kp),kx1=t0*exp2(kf);float ky1=ka*pow(kx1,kp)+kb;
  #define Q54FS(n_) (((n_)>t0||(n_)<0.)?1.:pow(max(n_,0.),fp)*(fa*(n_)+fb)+fc)
  #define Q54KS(n_) ((n_)<t0?1.:(n_)<=kx1?(ka*pow(max(n_,1e-6),kp)+kb)/(n_):(km*((n_)-kx1)+ky1)/(n_))
  vec3 fo=mix(v*Q54FS(n),v-Lm+Lm*Q54FS(Lm),.5);vec3 ko=mix(v*Q54KS(n),v-Lm+Lm*Q54KS(Lm),.5);vec3 o=fo+ko-v;vec3 y=clamp(${Q54_DID('o')},0.,1.);return vec4(${SRGB('y')},1.);`,
  'MoazElgabry DCTLs ME_Ratio Shaper v1.2.dctl gain curves: in DaVinci Intermediate, fill gain n^p(a n+b)+c below pivot t0 (-> 2^E at black), key gain (a n^p+b)/n above t0 with a linear 2^E slope beyond t0*2^f, n = max(RGB), each blended 50/50 with the luma (0.274,0.874,-0.148) version (Preserve Color 0.5) and summed; approx.: pivots at 0, the highlight/shadow protection masks and overall exposure left out');

f = add('Film');
f('q54_dyesim','Dye Density Simulator (utility-dctls)',[P('Input Gain',0,3,1,.01),P('Silver Ratio',0,1,0,.01),S('Observer',['Status M transmittance','Status M density'])],
  `vec3 cc=max(c.rgb,0.)*u_p0;float sv=(cc.r+cc.g+cc.b)*u_p1;vec3 nm=vec3(0.),dn=vec3(0.);
  for(int i=0;i<43;i++){float l=360.+10.*float(i);float sc=l<676.?75.:55.,sm=l<533.?53.:37.,sy=l<419.?150.:52.;
   float gC=exp(-(l-676.)*(l-676.)/(2.*sc*sc))*(1.96-.0133)+.0133,gM=exp(-(l-533.)*(l-533.)/(2.*sm*sm)),gY=exp(-(l-419.)*(l-419.)/(2.*sy*sy))*1.44,gS=exp(-(l-500.)*(l-500.)/180000.);
   float Dn=cc.r*gC+cc.g*gM+cc.b*gY+sv*gS;float tr=pow(10.,-Dn);
   vec3 w=exp(-vec3((l-645.)*(l-645.)/338.,(l-535.)*(l-535.)/648.,(l-440.)*(l-440.)/450.));nm+=w*tr;dn+=w;}
  vec3 X=nm/dn;return vec4(u_p2<.5?X:clamp(-log(max(X,1e-6))/log(10.)*.5,0.,1.),1.);`,
  'utility-dctls Dye Simulator.dctl: R,G,B (x gain) are cyan/magenta/yellow dye concentrations (+ silver = sum x ratio), each dye a two-sided Gaussian density spectrum (defaults 676/533/419 nm, left/right sigma 75-55 / 53-37 / 150-52, max 1.96/1/1.44), transmittance 10^-D integrated 360-780 nm under the observer; approx.: Status M sensitivities modelled as Gaussians (645/535/440 nm), density view shown /2');
f('q54_filmcurve','Film Characteristic Curve (utility-dctls)',[P('Gamma',0,4,1,.01),P('D Max',.5,6,2,.05),P('Offset',-3,3,0,.01),S('Output',['Transmittance (sigmoid)','Transmittance (quadratic)','Density (sigmoid)','Density (quadratic)'],0)],
  `vec3 a=max(c.rgb,0.);vec3 x=log(max(${LIN('a')}/.18,1e-6))/log(10.)+u_p2;float dm=.01,dd=max(u_p1-dm,.01);int o=int(u_p3+.5);vec3 Dn;
  if(o==0||o==2)Dn=dd/(1.+exp(-u_p0/(.25*dd)*x))+dm;
  else{vec3 q=u_p0/dd*x;vec3 lo=q+.5,hi=.5-q;vec3 rl=mix(mix(vec3(0.),(lo+.1)*(lo+.1)*2.5,step(-.1,lo)),lo,step(.1,lo));vec3 rh=mix(mix(vec3(0.),(hi+.1)*(hi+.1)*2.5,step(-.1,hi)),hi,step(.1,hi));Dn=dd*mix(rl,1.-rh,step(0.,q))+dm;}
  return vec4(o<2?pow(vec3(10.),-Dn):clamp(Dn/u_p1,0.,1.),1.);`,
  'utility-dctls Film Curve.dctl: log10(linear*gain/0.18) -> density D = dD*sigmoid(gamma/(0.25 dD)*(x+offset)) + Dmin (or quadratic sigmoid built from smoothrelu w=0.1), -> transmittance 10^-D (a negative); Dmin 0.01, one curve for all channels, density view shown /Dmax');
f('q54_timingstreaks','Timing Shift Streaks (utility-dctls)',[P('Length',0,.5,.1,.005),P('Streak Exposure',-8,0,-2,.1,'EV'),S('Falloff',['Cosine 1','Cosine 2','Linear','Box','Gaussian']),S('Direction',['Up','Down','Left','Right'])],
  `int dm=int(u_p3+.5);vec2 dir=dm==0?vec2(0.,-1.):dm==1?vec2(0.,1.):dm==2?vec2(1.,0.):vec2(-1.,0.);float Lp=u_p0*min(u_res.x,u_res.y);int fm=int(u_p2+.5);
  float st=max(1.,Lp/160.);vec3 acc=vec3(0.);float ws=0.;
  for(int k=0;k<=160;k++){float d=float(k)*st;if(d>floor(Lp)+.001)break;float t=clamp(d/max(Lp,1e-4),0.,1.);
   float w=fm==0?(cos(PI*t)+1.)*.5:fm==1?cos(PI*.5*t):fm==2?1.-t:fm==3?(d<Lp?1.:0.):exp(-6.*d*d/max(Lp*Lp,1e-4));
   acc+=w*T(uv+dir*d*u_px).rgb;ws+=w;}
  vec3 b=ws>0.?acc/ws:c.rgb;float op=min(exp2(u_p1),1.);return vec4(mix(c.rgb,b,op),1.);`,
  'utility-dctls Timing Shift Streaks.dctl (Arri timing-shift artefact): one-sided weighted blur over Length*min(W,H) px toward the chosen direction (Cosine/Linear/Box/Gaussian falloff), blended in with opacity min(2^StreakExposure,1); per-frame jitter left out');

f = add('Blur');
f('q54_fieldcurv','Field Curvature Edge Defocus (utility-dctls)',[P('Protected Radius',.001,1.5,.5,.01),P('Max Blur',0,100,40,.5),P('Cats Eye',0,1,.4,.01),P('Curve Falloff',0,1,0,.01)],
  `${Q54_SS2}vec2 np=2.*(uv-.5);float r=length(np);float a=u_p0;float Tm=max(a,1.41421356);float fl=a>=Tm?step(a,r):clamp((r-a)/(Tm-a),0.,1.);
  float cv=clamp((fl-.5)*(1.+u_p3)+.5,0.,1.);float k=Q54S2(cv);float Rr=k*u_p1*u_res.x/2048.;float C=u_p2*cv;
  if(Rr<.5)return c;vec2 P0=uv*u_res;vec2 ud=r>1e-4?normalize(.5*u_res-P0):vec2(0.);vec2 Pc=-ud*Rr*C,Sc=ud*Rr*C;float Rb=Rr*(1.+2.*C)+1.;
  vec3 acc=vec3(0.);float ws=0.;
  for(int i=0;i<160;i++){float fi=float(i);vec2 o=Rb*sqrt((fi+.5)/160.)*vec2(cos(fi*2.39996),sin(fi*2.39996));
   float w=C<=0.?Q54CW(length(o),Rr):Q54CW(length(Pc-o),Rr)*Q54CW(length(Sc-o),1.2*Rr);if(w<=0.)continue;acc+=w*T(uv+o*u_px).rgb;ws+=w;}
  return ws>0.?vec4(acc/ws,1.):c;`,
  'utility-dctls Field Curvature.dctl: blur radius = smoothstep2((f-.5)(1+falloff)+.5)*strength*W/2048 with f ramping from the protected circle to the max ellipse, disc kernel with anti-aliased edge; Cats Eye intersects two circles offset +/- R*C along the centre direction (second one 1.2R); approx.: 160 Vogel-spiral taps instead of the full pixel window, Couple XY on, Sigmoid curve');
f('q54_linedgeblur','Linear Edge Blur (utility-dctls)',[P('Protected Radius',.001,1.5,.5,.01),P('Max Blur',0,100,40,.5),S('Falloff Curve',['Sigmoid','Ellipse','Linear']),S('Direction',['Horizontal','Vertical'])],
  `${Q54_SS2}vec2 np=2.*(uv-.5);float r=length(np);float a=u_p0;float den=max(a*a,1.41421356*a)-a*a;float fl=den<=1e-5?step(a,r):clamp((a*r-a*a)/den,0.,1.);
  int cm=int(u_p2+.5);float k=cm==0?Q54S2(fl):cm==1?1.-sqrt(max(1.-fl*fl,0.)):fl;float Rr=k*u_p1*u_res.x/2048.;if(Rr<.5)return c;
  vec2 dir=u_p3<.5?vec2(u_px.x,0.):vec2(0.,u_px.y);float n=floor(Rr+1.);float st=max(1.,n/64.);vec3 acc=vec3(0.);float ws=0.;
  for(int i=-64;i<=64;i++){float d=float(i)*st;if(abs(d)>n)continue;float w=Q54CW(abs(d),Rr);acc+=w*T(uv+dir*d).rgb;ws+=w;}
  return vec4(acc/ws,1.);`,
  'utility-dctls Linear Edge Blur.dctl: 1-D (horizontal or vertical) anti-aliased box blur whose radius = curve(f)*strength*W/2048 grows from the protected circle to the max ellipse (Sigmoid 4t^3 / Ellipse 1-sqrt(1-f^2) / Linear); Couple XY on, falloff 0');
f('q54_ellipblur','Elliptical / Zoom Vector Blur (Reactor EllipticalBlur)',[S('Type',['Elliptical','Zoom']),P('Speed',0,20,2,.1),P('Aspect W to H',.1,10,3,.05),P('Angle',-80,80,0,1,'deg')],
  `float n4=tan(radians(u_p3));float rd=(.5-uv.y-n4*(.5-uv.x))*u_p2*u_p1/15.;float gr=(uv.x-.5+n4*(.5-uv.y))*u_p1/15.;
  vec2 v=u_p0<.5?vec2(rd,gr*asp()):vec2(-gr,rd*asp());vec3 acc=vec3(0.);
  for(int i=0;i<40;i++){float t=(float(i)+.5)/40.-.5;acc+=pow(max(T(uv+v*t).rgb,0.),vec3(2.2));}
  vec3 o=pow(acc/40.,vec3(1./2.2));return vec4(o,1.);`,
  'Gregory Chalenko EllipticalBlur.setting (Reactor): a Custom tool builds a vector field red=(cy-y-tan(angle)(0.5-x))*W/H*speed*w/15, green=(x-cx+tan(angle)(0.5-y))*speed*w/15 fed to VectorMotionBlur (Elliptical: X=red,Y=green, i.e. along ellipses; Zoom: X=-green,Y=red), in degamma 2.2 space; approx.: centred field, gradient modulation and motion correction left out');
f('q54_panowrap','Seam-free Panoramic Wrap Blur (KartaVR)',[P('Size',0,60,10,.5,'px'),S('Operation',['Blur','Unsharp Mask','Glow']),P('Amount',0,3,1,.05),S('Pole Wrap',['Off','On'],1)],
  [`float r=R(u_p0);if(r<.5)return T(uv);float sg=r*.5,st=max(1.,r/24.);vec4 a=vec4(0.);float w=0.;for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>r)continue;float g=exp(-x*x/(2.*sg*sg));a+=g*T(vec2(fract(uv.x+x*u_px.x),uv.y));w+=g;}return a/w;`,
   `float r=R(u_p0);if(r<.5)return T(uv);float sg=r*.5,st=max(1.,r/24.);vec4 a=vec4(0.);float w=0.;for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>r)continue;float g=exp(-x*x/(2.*sg*sg));vec2 q=vec2(uv.x,uv.y+x*u_px.y);
    if(u_p3>.5){if(q.y>1.){q.y=2.-q.y;q.x+=.5;}else if(q.y<0.){q.y=-q.y;q.x+=.5;}}q=vec2(fract(q.x),clamp(q.y,0.,1.));a+=g*T(q);w+=g;}return a/w;`,
   `vec3 o=O(uv).rgb,b=T(uv).rgb;int m=int(u_p1+.5);vec3 y=m==0?mix(o,b,min(u_p2,1.)):m==1?o+u_p2*(o-b):1.-(1.-o)*(1.-b*b*u_p2);return vec4(clamp(y,0.,1.),1.);`],
  'Andrew Hazelden KartaVR BlurPanoramicWrap / UnSharpenMaskPanoramicWrap / GlowPanoramicWrap (.setting): the equirectangular frame is surrounded by copies shifted one width left/right and 180-degree-rotated copies above/below the poles, filtered, then cropped back; here the Gaussian samples wrap in x and reflect across the poles with a half-turn longitude shift');

f = add('Noise');
f('q54_fixedsnr','Fixed SNR Noise (utility-dctls)',[P('Target SNR',1,50,6,.1),S('Noise Mode',['RGB Noise','Monochrome Noise'],1),S('Clamp Behavior',['No Clamp','Nonnegative output','Nonnegative noise'])],
  `${Q54_ZN}vec2 ip=floor(PX(uv));float u0=hash(ip),u1=hash(ip+vec2(.37,7.1)),u2=hash(ip+vec2(5.3,.71));vec3 u=u_p1>.5?vec3(u0):vec3(u0,u1,u2);
  vec3 z=vec3(Q54Z(u.x),Q54Z(u.y),Q54Z(u.z));vec3 n=abs(c.rgb)/max(u_p0,1e-3)*z;int cm=int(u_p2+.5);if(cm==2)n=max(n,0.);vec3 o=c.rgb+n;if(cm==1)o=max(o,0.);return vec4(o,1.);`,
  'utility-dctls Fixed SNR Noise.dctl: n = |v|/SNR * Z(u) per channel (mono: one uniform for all channels), Z = Soranzo inverse-normal approximation capped at 2.5758, added to the code values; clamp options as in the DCTL', true);
f('q54_fractalblocks','Fractal Blocks Noise (Reactor MT_FractalBlocks)',[P('Size',10,400,100,1),P('Complexity',0,4,4,1),P('Contrast',0,4,1.6,.01),P('Sub Influence',0,1,1,.01)],
  `vec2 Pp=PX(uv);vec2 SZ=u_res/u_k;float N0=SZ.x/u_p0;float s_=0.,ws=0.;int cx=int(u_p1+.5);
  for(int k=0;k<5;k++){if(k>cx)break;float N=N0*exp2(float(k));float cell=SZ.x/N;vec2 ci=floor(Pp/cell);float g=k==0?.5:.5*exp2(-float(k-1))*u_p3;
   float v=vnoise((ci+.5)*.45+vec2(31.7,11.3)*float(k));s_+=g*v;ws+=g;}
  float y=clamp((s_/max(ws,1e-4)-.5)*u_p2+.5,0.,1.);return vec4(vec3(y),1.);`,
  'MuseVFX MT_FractalBlocks.setting: FastNoise rendered at W/Size x H/Size and nearest-resized to the frame, plus octaves at 2,4,8,16x the cell count with gains 0.5,0.25,... times Sub Influence summed (Complexity = octave count), then Contrast; approx.: value noise per block instead of Fusion FastNoise, no sub-rotation/offset', true);

f = add('Color');
f('q54_sphcyl','Spherical / Cylindrical RGB Model (utility-dctls)',[S('Model',['Spherical','Cylindrical']),S('Direction',['RGB to model','Model to RGB','Round trip'],2),P('Saturation',0,3,1.5,.01),P('Hue Shift',-180,180,0,1,'deg')],
  `vec3 x=c.rgb;int dm=int(u_p1+.5);vec3 hs;const float TAU=6.2831853;
  if(u_p0<.5){
   vec3 t0=vec3(dot(x,vec3(.57735027)),dot(x,vec3(-.57735027,.78867513,-.21132487)),dot(x,vec3(-.57735027,-.21132487,.78867513)));
   vec3 y=vec3(t0.x,-.70710678*(t0.y+t0.z),.70710678*(t0.y-t0.z));float th=mod(atan(y.z,y.y),TAU);float sa=atan(length(y.yz),y.x);
   hs=vec3(th/TAU,sa,length(y));if(abs(sa-PI)<1e-5)hs.x=0.;if(dm==1)hs=x;if(dm==0)return vec4(hs,1.);
   if(dm==2){hs.y*=u_p2;hs.x+=u_p3/360.;}
   float ph=TAU*fract(hs.x);vec3 d=hs.z*vec3(cos(hs.y),cos(ph)*sin(hs.y),sin(ph)*sin(hs.y));vec3 t=vec3(d.x,.70710678*(d.z-d.y),-.70710678*(d.y+d.z));
   vec3 o=t.x*vec3(.57735027)+t.y*vec3(-.57735027,.78867513,-.21132487)+t.z*vec3(-.57735027,-.21132487,.78867513);return vec4(o,1.);}
  float aa=x.r-(x.g+x.b)*.5,bb=.8660254*(x.g-x.b),ll=(x.r+x.g+x.b)/3.;
  hs=abs(ll)<1e-6?vec3(0.):vec3(mod(atan(bb,aa),TAU)/TAU,length(vec2(aa,bb))/(3.*abs(ll)),ll);if(dm==1)hs=x;if(dm==0)return vec4(hs,1.);
  if(dm==2){hs.y*=u_p2;hs.x+=u_p3/360.;}
  float ph=TAU*fract(hs.x);float cr=abs(hs.z)*3.*hs.y*cos(ph),cb=abs(hs.z)*3.*hs.y*sin(ph);
  return vec4(2./3.*cr+hs.z,-cr/3.+hs.z+cb*.57735027,-cr/3.+hs.z-cb*.57735027,1.);`,
  'utility-dctls Spherical.dctl (achromatic axis rotated onto x: hue = atan2, saturation = polar angle in radians, value = |RGB|) and Cylindrical.dctl (a = R-(G+B)/2, b = sqrt3/2(G-B), hue, S = |ab|/(3|mean|), L = mean) and their inverses on code values; Round trip scales saturation and shifts hue between the two');
f('q54_softmax','Softmax Colour (utility-dctls)',[P('Temperature',0,20,4,.1),P('Output Gain',.5,3,1,.01)],
  `vec3 e=exp(u_p0*(c.rgb-max(c.r,max(c.g,c.b))));vec3 o=e/(e.r+e.g+e.b);return vec4(clamp(o*u_p1,0.,1.),1.);`,
  'utility-dctls Softmax.dctl: out_i = exp(T x_i) / sum_j exp(T x_j) (channels sum to 1; computed max-shifted for stability); Output Gain is an added display scale');
f('q54_rootpoly','Root-Polynomial Colour Mix (utility-dctls)',[P('R from GB root',-1,1,.3,.01),P('G from RB root',-1,1,.3,.01),P('B from RG root',-1,1,.3,.01),S('Preserve Neutral',['Off','On'],1)],
  `vec3 a=c.rgb;vec3 x=${LIN('a')};vec3 rt=vec3(sign(x.g*x.b)*sqrt(abs(x.g*x.b)),sign(x.r*x.b)*sqrt(abs(x.r*x.b)),sign(x.r*x.g)*sqrt(abs(x.r*x.g)));
  vec3 k=vec3(u_p0,u_p1,u_p2);vec3 y=clamp(x*(1.-k*step(.5,u_p3))+k*rt,0.,1.);return vec4(${SRGB('y')},1.);`,
  'utility-dctls Root Polynomial Degree 2.dctl: 3x6 matrix on (R,G,B, sqrt|RG|, sqrt|RB|, sqrt|GB|) (signed roots, exposure-invariant); here a 3-slider sub-matrix: each channel gets k * the root term of the other two (Preserve Neutral subtracts k from its own diagonal), linear light');
f('q54_polykernel','Polynomial / Sigmoid Kernel Mix (utility-dctls)',[S('Kernel',['Polynomial','Sigmoid']),P('Amount',-2,2,.6,.01),P('Power',0,5,1,.01),P('Mid Gray',.05,1,.18,.01)],
  `vec3 x=c.rgb;float m=u_p3,pw=u_p2;vec3 pr=vec3(x.g*x.b,x.r*x.b,x.r*x.g);float mm=m*m;vec3 P_;float Pm;
  if(u_p0<.5){P_=sign(pr)*pow(abs(pr),vec3(pw));Pm=pow(mm,pw);}else{vec3 q=sign(pr)*pow(abs(pr),vec3(pw));P_=q/(q+1.);float qm=pow(mm,pw);Pm=qm/(qm+1.);}
  vec3 o=x+u_p1*P_;o*=m/(m+u_p1*Pm);return vec4(clamp(o,0.,1.),1.);`,
  'utility-dctls Polynomial Kernel.dctl / Sigmoid Kernel.dctl: 3x9 matrix on (R,G,B, products RR GG BB RG RB GB) with product kernel sign(ab)|ab|^p (normalised, identity point 1) or the sigmoid q/(q+W), Preserve Gray rescales so mid gray maps to itself; here one slider weights each channel by the product of the other two (R += a*P(G,B) ...)');
f('q54_chansat','Channel Saturation with Thresholds (xtremestuff)',[S('Channel',['All','Red','Green','Blue'],3),P('Saturation',0,1,.6,.01),P('Upper Threshold',.005,1,1,.005),P('Lower Threshold',0,.995,.3,.005)],
  `vec3 x=c.rgb;int ch=int(u_p0+.5);vec3 sel=ch==0?vec3(1.):ch==1?vec3(1.,0.,0.):ch==2?vec3(0.,1.,0.):vec3(0.,0.,1.);
  vec3 g=step(vec3(u_p3),x)*step(x,vec3(u_p2))*sel;return vec4(mix(x,x*u_p1,g),1.);`,
  'xtremestuff resolve-dctl Channel-Saturation.dctl (Scene mode): each selected channel whose value lies in [lower, upper] is multiplied by its Saturation (a channel gain, not a blend toward luma); one slider set shared by the selected channels');
f('q54_filmsat','Film Saturation Emulation in Log (Tims DCTL)',[P('Log Saturation',0,5,1.5,.05),P('Log Offset',0,1,1,.01),S('Channel Option',['All Channels','Channel Red','Channel Green','Channel Blue'])],
  `vec3 x=c.rgb;vec3 h=rgb2hsl(x);float mx=max(x.r,max(x.g,x.b)),mn=min(x.r,min(x.g,x.b));if(mx-mn<1e-6)h.x=0.;float s_=h.y*u_p0;
  if(s_>=.9)s_=.9+.1*log(1.+(s_-.9)/.1)*.5;if(s_<=.1)s_=.1-.9*log(1.+(.1-s_)/.1)*.005;s_*=u_p1;vec3 y=hsl2rgb(vec3(h.x,s_,h.z));
  int o=int(u_p2+.5);vec3 sel=o==0?vec3(1.):o==1?vec3(1.,0.,0.):o==2?vec3(0.,1.,0.):vec3(0.,0.,1.);return vec4(mix(x,y,sel),1.);`,
  'mitkunz resolve_DCTLs Tims-Film-Saturation-Emulation.dctl: HSL saturation x Log Saturation with a log roll-off above 0.9 and below 0.1, x Log Offset, back to RGB (lightness kept); the channel option replaces only that channel. As in the DCTL, S = 0 maps to about 0.097 so neutrals pick up a slight warm cast');
f('q54_chromacomp','Chroma Compress Soft Knee (Reactor ChromaCompress)',[P('Compression',0,1,.5,.01),P('Color Distance',0,2,.3,.01),P('Fade',0,2,.4,.01),S('View',['Compressed','Matte'])],
  `vec3 x=c.rgb;float M=max(x.r,max(x.g,x.b)),mn=min(x.r,min(x.g,x.b));float d=M-mn;float pv=mix(mn,M,.5);
  float w=d<=u_p1?0.:min(1.,(d-u_p1)/(u_p2+.001));if(u_p3>.5)return vec4(vec3(w),1.);return vec4(x+u_p0*w*(pv-x),1.);`,
  'Jacob Danell Chroma Compress.Fuse: spread d = max-min; above Color Distance a linear soft knee w = min(1,(d-T)/Fade) pulls each channel toward the pivot mix(min,max,0.5) by Compression*w (gains 1, strengths 1); Matte view outputs w. Defaults lowered from 0.8/0.8 for display-referred images');
f('q54_conical','Conical Coordinates Saturation (Juan Pablo Zambrano)',[S('Direction',['RGB to Cone','Cone to RGB','Round trip'],2),P('Saturation',0,3,1.4,.01),P('Hue Shift',-180,180,0,1,'deg')],
  `vec3 x=c.rgb;const float K=1.27610408,HC1=1.38143;int dm=int(u_p0+.5);
  #define Q54SM(th_,ph_) sin(((acos(cos(3.*(th_)+PI))/(PI*HC1)+(K-1.))*(2.*(ph_)*sin(2.0943951-mod((th_),1.0471976))/1.7320508))+.61547971)
  vec3 cz;if(dm==1)cz=x;else{float rr=.81649658*x.r-.40824829*x.g-.40824829*x.b,rg=.70710678*(x.g-x.b),rb=.57735027*(x.r+x.g+x.b);
   float th=atan(rg,rr);if(th<0.)th+=6.2831853;float ph=atan(length(vec2(rr,rg)),rb);cz=vec3(length(vec3(rr,rg,rb))*Q54SM(th,ph),th/6.2831853,ph*1.04677337);
   if(dm==0)return vec4(cz,1.);cz.z*=u_p1;cz.y+=u_p2/360.;}
  float th2=6.2831853*fract(cz.y),ph2=cz.z*.95531662;float r2=cz.x/max(Q54SM(th2,ph2),1e-4);vec3 ct=r2*vec3(sin(ph2)*cos(th2),sin(ph2)*sin(th2),cos(ph2));
  return vec4(.81649658*ct.x+.57735027*ct.z,-.40824829*ct.x+.70710678*ct.y+.57735027*ct.z,-.40824829*ct.x-.70710678*ct.y+.57735027*ct.z,1.);`,
  'JuanPabloZambrano DCTL OldDctls/JP-ConicalCoordinate.dctl (after Yedlin / Stoopman cone coordinates): orthonormal rotation to the neutral axis, spherical hue and polar angle, radius scaled by sin(huemag + 0.6155) with a hue-dependent triangle-wave term; inverse divides it out. Round trip scales the polar angle (saturation) and shifts hue in cone space');

f = add('Analysis');
f('q54_expstrips','Exposure Strips (utility-dctls)',[P('Number of Strips',1,33,7,1),P('X Position',0,1,.5,.01),S('Exposure Setup',['Under and Over','Overexposures Only','Underexposures Only']),S('Strip Contents',['Exposure Strip','Exposure Overlay'])],
  `float n=floor(u_p0+.5);float cs=min(floor(uv.x*n),n-1.);int su=int(u_p2+.5);float md=su==0?floor(n*.5):su==1?0.:n-1.;float gn=exp2(cs-md);
  float sx=uv.x;if(u_p3<.5){float ww=1./n;float wl=u_p1-ww*.5;wl=clamp(wl,0.,1.-ww);sx=wl+ww*clamp((uv.x-cs/n)*n,0.,1.);}
  vec3 a=O(vec2(sx,uv.y)).rgb;vec3 x=${LIN('a')}*gn;x=clamp(x,0.,1.);return vec4(${SRGB('x')},1.);`,
  'utility-dctls Exposure Strip.dctl: the frame is cut into N vertical strips one stop apart (zero-stop strip centred, leftmost or rightmost); each strip shows the same window of width W/N around X Position (or the frame itself in Overlay mode) times 2^(strip-mid); gain applied in linear light here; the stop labels are left out');
f('q54_screensize','Screen Size Simulator (utility-dctls)',[P('Target Size',2,65,13,.1,'in'),P('Current Size',2,65,31.5,.1,'in'),S('Output Blanking',['Off','On']),P('Blanking Aspect',1,3,2.4,.01)],
  `vec2 p=uv-.5;float dw=1.,dh=1.;if(u_p2>.5){float A=u_p3,ar=asp();if(ar>A)dw=A/ar;else dh=ar/A;}p/=vec2(dw,dh);
  float s_=min(u_p0,u_p1)/u_p1;if(abs(p.x)>s_*.5||abs(p.y)>s_*.5)return vec4(0.,0.,0.,1.);vec2 q=(p/s_+.5)*vec2(dw,dh)+.5*vec2(1.-dw,1.-dh);return vec4(T(q).rgb,1.);`,
  'utility-dctls Screen Size Simulator.dctl: the picture (optionally inside a blanking aspect) is shrunk by target/current diagonal about the centre with bilinear sampling on a black background, to judge how it reads on a smaller screen');
f('q54_snrcheck','Local SNR Checker (utility-dctls)',[P('Sample Size',2,8,5,1,'px'),P('Black Point',0,.2,0,.005),S('Output Mode',['Sample Mean','Sample Std','Sample Var','SNR','False Color'],4)],
  `int ws=int(u_p0+.5);int rt=ws/2;int lf=rt-((ws/2)*2==ws?1:0);vec3 s1=vec3(0.),s2=vec3(0.);float N=0.;
  for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(i< -lf||i>rt||j< -lf||j>rt)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px).rgb;s1+=v;s2+=v*v;N+=1.;}
  vec3 mu=s1/N;vec3 vr=max((s2-N*mu*mu)/max(N-1.,1.),0.);vec3 sd=sqrt(vr);vec3 snr=(mu-u_p1)/max(sd,1e-5);int om=int(u_p2+.5);
  if(om==0)return vec4(mu,1.);if(om==1)return vec4(sd,1.);if(om==2)return vec4(vr,1.);if(om==3)return vec4(clamp(snr/16.,0.,1.),1.);
  float av=(snr.r+snr.g+snr.b)/3.;if(av>=16.)return vec4(1.);float H=av<.5?5./6.:av<1.?4./6.:av<2.?.5:av<4.?2./6.:av<8.?1./6.:0.;
  float ph=6.2831853*H;float cr=.18*1.5*cos(ph),cb=.18*1.5*sin(ph);vec3 fc=vec3(2./3.*cr+.18,-cr/3.+.18+cb*.57735027,-cr/3.+.18-cb*.57735027);fc=max(fc,0.);return vec4(${SRGB('fc')},1.);`,
  'utility-dctls SNR Checker.dctl: per-channel mean and unbiased std over a size x size window, SNR = (mean - black point)/std; False Color bins the mean SNR at 0.5/1/2/4/8/16 into magenta/blue/cyan/green/yellow/red/white (cylindrical-model colours, shown sRGB-encoded); SNR view shown /16');
f('q54_satmatte','Oklab Saturation Matte (Moaz Elgabry)',[P('Coverage',0,100,40,.5),S('Output',['Matte','Gray Background']),S('Invert Matte',['Off','On'])],
  `vec3 a=c.rgb;vec3 x=${LIN('a')};float rg=x.r-x.g,bg=x.b-x.g,bs=x.g+.02;float l=bs+.5872198589*rg-.0075927843*bg,m=bs+.2827499676*rg+.0334949664*bg,s_=bs+.1120041085*rg+.6933883919*bg;
  float fl=l/pow(l*l+1e-6,1./3.),fm=m/pow(m*m+1e-6,1./3.),fs=s_/pow(s_*s_+1e-6,1./3.);float dl=fl-fm,ds=fs-fm;float Lk=fm+.2104542553*dl-.0040720468*ds,ak=1.9779984951*dl+.4505937099*ds,bk=.0259040371*dl-.808675766*ds;
  float C2=ak*ak+bk*bk;float sc=clamp(C2/(C2+.0625*(Lk*Lk+.01)),0.,1.);float p=u_p0/100.;float t=clamp((p-.6*sc)/.4,0.,1.);float M=t*t*t*(t*(t*6.-15.)+10.);
  if(u_p0<=0.)M=0.;if(u_p0>=100.)M=1.;float mt=u_p2>.5?M:1.-M;if(u_p1<.5)return vec4(vec3(mt),1.);return vec4(.5+mt*(a-.5),1.);`,
  'MoazElgabry DCTLs ME_Sat_Matte.dctl: Oklab-style L,a,b (custom LMS matrix, smooth signed cube root) -> score = C^2/(C^2 + 0.0625(L^2+0.01)), matte = 1 - smootherstep((coverage - 0.6 score)/0.4) (low-saturation pixels leave the matte first); Gray Background composites over 0.5; spatial smoothing left out');
f('q54_plotscan','Plot Scanline Overlay (Reactor PlotScanline)',[S('Type',['RGB','Luminance'],1),P('Thickness',.1,3,.53,.01),P('Black Point',-.5,1,0,.01),P('White Point',0,2,1,.01)],
  `vec3 av=vec3(0.);for(int i=0;i<64;i++)av+=O(vec2(uv.x,(float(i)+.5)/64.)).rgb;av/=64.;if(u_p0>.5)av=vec3((av.r+av.g+av.b)/3.);
  vec3 vv=(av-u_p2)/max(u_p3-u_p2,1e-4);float th=u_p1/100.;vec3 fg=step(abs(uv.y-vv),vec3(th));float al=min(1.,fg.r+fg.g+fg.b);return vec4(fg+c.rgb*(1.-al),1.);`,
  'Jacob Danell PlotScanline.setting: the frame is resized to one row (each column averaged), mapped through black/white point, and a Custom tool lights pixels with |y - value| <= Thickness/100 per channel (RGB) or for the channel mean (Luminance), merged over the image; grid and number labels left out');

f = add('Retro');
f('q54_humbar','Hum Bar / Ground Loop (Reactor MT_Glitch)',[S('Mode',['Hum Bar','Ground Loop','Both']),P('Position',0,1,.35,.005),P('Strength',0,1,.6,.01),P('Bar Height',.02,.6,.18,.005)],
  `int md=int(u_p0+.5);vec2 q=uv;if(md>=1){float yy=uv.y*18.3+u_p1*7.;float nz=vnoise(vec2(3.7,yy))*.65+vnoise(vec2(9.1,yy*2.03))*.35;nz=clamp((nz-.5)*3.168675+.5,0.,1.);q.x+=(nz-.5)*.0168675*u_p2/.6;}
  vec3 o=T(clamp(q,0.,1.)).rgb;if(md!=1){float d=abs(fract(uv.y-u_p1+.5)-.5);float se=.008;float mk=1.-smoothstep(u_p3*.5-se,u_p3*.5+se,d);float al=mk*u_p2;o=o+.3154078*al*(1.-o);}return vec4(o,1.);`,
  'MuseVFX GlitchTools MT_Glitch_HumBar.setting (soft-edged full-width rectangle, Level = pulse wave 0.5-0.6, wrapped vertical scroll, white merged over at Blend 0.315) and MT_Glitch_GroundLoop.setting (FastNoise varying only in y, contrast 3.17, Displace XY with refraction 0.0169 shifting rows sideways); Position replaces time; approx.: value noise for FastNoise', true);
f('q54_rollslide','Roll and Slide Sync Loss (Reactor MT_Glitch)',[P('Roll',0,1,.3,.005),P('Slide',-.5,.5,0,.005),P('V Blanking',0,120,39,1,'px'),P('H Blanking',0,120,37,1,'px')],
  `vec2 SZ=u_res/u_k;vec2 cv=SZ+vec2(u_p3,u_p2);vec2 p=(uv-.5)*SZ-vec2(u_p1,u_p0)*cv;p=mod(p+.5*cv,cv)-.5*cv;if(abs(p.x)>SZ.x*.5||abs(p.y)>SZ.y*.5)return vec4(0.,0.,0.,1.);return vec4(T(p/SZ+.5).rgb,1.);`,
  'MuseVFX GlitchTools MT_Glitch_RollAndSlide.setting: the picture is padded with black blanking (37 x 39 px) and offset by the roll (vertical, up to 0.88 frame) and slide (horizontal) waves with wrap-around, so a black bar runs between repeated frames; Roll/Slide set the offset directly instead of the time waves');

f = add('Edges');
f('q54_aoedges','Edge Detector by AO Map (Filter Forge)',[P('Radius',1,30,6,.5,'px'),P('Detail',.5,20,2,.1),S('Mode',['Crevices','Ridges','Both']),S('Invert',['Off','On'])],
  `float h0=luma(O(uv).rgb);float r=R(u_p0);float cv=0.,rd=0.;
  for(int i=0;i<12;i++){float an=float(i)*.5235988;vec2 dr=vec2(cos(an),sin(an));for(int k=1;k<=4;k++){float d=r*float(k)/4.;float dh=(luma(O(uv+dr*d*u_px).rgb)-h0)*u_p1*u_p0/max(d/u_k,1.);cv+=clamp(dh,0.,1.);rd+=clamp(-dh,0.,1.);}}
  cv/=48.;rd/=48.;int md=int(u_p2+.5);float e=md==0?cv:md==1?rd:max(cv,rd);e=clamp(e*1.5,0.,1.);if(u_p3>.5)e=1.-e;return vec4(vec3(e),1.);`,
  'Filter Forge snippet "Edge Detector by Ambient Occlusion Map" (description: cleaner edge detector built on a height-to-AO map): luminance as height, occlusion = mean clamped height-rise slope over 12 directions x 4 radii (crevices) or the mirrored fall (ridges); approx. from the description');

f = add('Distort');
f('q54_worleydist','Worley Noise Distortion (Filter Forge)',[S('Worley Type',['F1','F2','F2 minus F1','F1 times F2']),P('Distortion',0,100,25,.5),P('Scale',4,400,60,1,'px'),P('Roughness',0,1,.5,.01)],
  `vec2 Pp=PX(uv);int wt=int(u_p0+.5);vec2 dsp=vec2(0.);float amp=1.,sc=u_p2,tot=0.;
  for(int o=0;o<3;o++){vec2 dv=vec2(0.);for(int ax=0;ax<2;ax++){vec2 p=Pp/sc+vec2(float(ax)*37.1+float(o)*11.3,float(ax)*5.7);vec2 ip=floor(p);float f1=9.,f2=9.;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=ip+vec2(float(i),float(j));vec2 fp=g+hash2(g+float(ax)*101.+float(o)*57.);float dd=length(p-fp);if(dd<f1){f2=f1;f1=dd;}else if(dd<f2)f2=dd;}
    float v=wt==0?f1-.5:wt==1?f2-.85:wt==2?(f2-f1)-.35:f1*f2-.45;if(ax==0)dv.x=v;else dv.y=v;}
   dsp+=amp*dv*sc;tot+=amp;amp*=u_p3;sc*=.5;}
  dsp/=tot;vec2 q=uv+fromPX(dsp*u_p1/50.);return vec4(T(clamp(q,0.,1.)).rgb,1.);`,
  'Filter Forge snippet "Worley Distortion" (Noise Distortion driven by Worley noises: type, distortion, scale, roughness, details): x and y offsets from two independent Worley fields (F1 / F2 / F2-F1 / F1*F2, centred), 3 octaves with Roughness gain; approx. from the description', true);

f = add('Stylize');
f('q54_varpixel','Variable Pixelation by Map (Filter Forge)',[P('Max Block',2,128,32,1,'px'),S('Map',['Image Luma','Noise','Radial']),P('Dither Amount',0,1,.2,.01),S('Invert Map',['Off','On'])],
  `vec2 Pp=PX(uv);int mp=int(u_p1+.5);vec4 o=c;
  for(int k=0;k<6;k++){float b=max(u_p0*exp2(-float(k)),1.);vec2 ci=floor(Pp/b);vec2 cu=fromPX((ci+.5)*b);
   float m=mp==0?luma(O(cu).rgb):mp==1?fbm(cu*vec2(asp(),1.)*3.):1.-length((cu-.5)*vec2(asp(),1.))*1.3;if(u_p3>.5)m=1.-m;
   m+=u_p2*(hash(ci+float(k)*31.)-.5);float kw=floor((1.-clamp(m,0.,1.))*5.999);
   if(float(k)>=kw){o=.25*(O(fromPX((ci+vec2(.3,.3))*b))+O(fromPX((ci+vec2(.7,.3))*b))+O(fromPX((ci+vec2(.3,.7))*b))+O(fromPX((ci+vec2(.7,.7))*b)));break;}}
  return vec4(o.rgb,1.);`,
  'Filter Forge snippet "Variable Pixelation" (pixelate by a grayscale map, with dither): a quadtree of power-of-two blocks from Max Block down, each block keeping the largest size whose map value (+ per-block dither) asks for it; approx.: the map is built in (image luma, fbm noise or radial) instead of a second input', true);
