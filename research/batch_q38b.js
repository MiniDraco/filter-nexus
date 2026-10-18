/* ================= q38b: round-16 interpolation (Lagrange / Schaum / Akima / Hamming sinc / Magic Kernel Sharp / O-MOMS, IBP), texture patterns, surround-inhibition contours, LBP defocus sharpness ================= */
f = add('Sharpen');
f('q38_resample3','Resampling Kernels III (Lagrange / Schaum / Akima / O-MOMS / Magic Kernel Sharp)',[P('Source pixel size',1,16,4,.5,'px'),S('Kernel',['Lagrange cubic 4-pt (= cubic Schaum)','Lagrange quintic 6-pt','Schaum quadratic 3-pt','Hamming-windowed sinc (radius 3)','Magic Kernel Sharp 2013','Magic Kernel Sharp 2021','O-MOMS cubic (prefiltered)','Akima spline']),P('Anti-ringing',0,1,0,.01)],
  `float B=max(R(u_p0),1.);vec2 p=PX(uv)/B-.5;vec2 i0=floor(p),fr=p-i0;int m=int(u_p1+.5);
 #define Q38TX(I_,J_) T(fromPX((i0+vec2(float(I_),float(J_))+.5)*B)).rgb
 vec3 o=vec3(0.);
 if(m==7){vec3 rw[6];for(int ln=0;ln<7;ln++){vec3 yv[6];float tt;if(ln<6){for(int i=0;i<6;i++)yv[i]=Q38TX(i-2,ln-2);tt=fr.x;}else{yv=rw;tt=fr.y;}
   vec3 mm[5];for(int k=0;k<5;k++)mm[k]=yv[k+1]-yv[k];
   vec3 w1=abs(mm[3]-mm[2]),w2=abs(mm[1]-mm[0]),dn=w1+w2;vec3 t0=mix(.5*(mm[1]+mm[2]),(w1*mm[1]+w2*mm[2])/max(dn,vec3(1e-9)),step(vec3(1e-9),dn));
   w1=abs(mm[4]-mm[3]);w2=abs(mm[2]-mm[1]);dn=w1+w2;vec3 t1=mix(.5*(mm[2]+mm[3]),(w1*mm[2]+w2*mm[3])/max(dn,vec3(1e-9)),step(vec3(1e-9),dn));
   float t2=tt*tt,t3=t2*tt;vec3 r_=(2.*t3-3.*t2+1.)*yv[2]+(t3-2.*t2+tt)*t0+(-2.*t3+3.*t2)*yv[3]+(t3-t2)*t1;if(ln<6)rw[ln]=r_;else o=r_;}}
 else{float wx[14],wy[14];float sx=0.,sy=0.;
  for(int a=0;a<2;a++)for(int k=0;k<14;k++){float ff=a==0?fr.x:fr.y;float d=float(k-6)-ff;float x=abs(d);float w=0.;
   if(m==0)w=x<=1.?((x-2.)*x-1.)*x*.5+1.:x<2.?((-x+6.)*x-11.)*x/6.+1.:0.;
   else if(m==1){int kk=k-6;if(kk>=-2&&kk<=3){w=1.;for(int q=-2;q<=3;q++)if(q!=kk)w*=(ff-float(q))/float(kk-q);}}
   else if(m==2)w=x<.5?1.-x*x:x<1.5?(x-3.)*x*.5+1.:0.;
   else if(m==3)w=x<1e-5?1.:x<3.?sin(PI*x)/(PI*x)*(.54+.46*cos(PI*x/3.)):0.;
   else if(m<=5){for(int t=-3;t<=3;t++){int at=abs(t);float st=m==4?(at==0?1.5:at==1?-.25:0.):(at==0?204.:at==1?-35.:at==2?6.:-1.)/144.;float z=abs(d-float(t));w+=st*(z<=.5?.75-z*z:z<1.5?.5*(z-1.5)*(z-1.5):0.);}}
   else{for(int t=-5;t<=5;t++){float z=abs(d-float(t));float om=z<1.?((z*.5-1.)*z+1./14.)*z+13./21.:z<2.?((-z/6.+1.)*z-85./42.)*z+29./21.:0.;w+=2.04939*pow(.3441312,float(abs(t)))*(abs(t)%2==1?-1.:1.)*om;}}
   if(a==0){wx[k]=w;sx+=w;}else{wy[k]=w;sy+=w;}}
  for(int j=0;j<14;j++){if(wy[j]==0.)continue;for(int i=0;i<14;i++){if(wx[i]==0.)continue;o+=wx[i]*wy[j]*Q38TX(i-6,j-6);}}o/=sx*sy;}
 vec3 mn=min(min(Q38TX(0,0),Q38TX(1,0)),min(Q38TX(0,1),Q38TX(1,1))),mx=max(max(Q38TX(0,0),Q38TX(1,0)),max(Q38TX(0,1),Q38TX(1,1)));
 o=mix(o,clamp(o,mn,mx),u_p2);return vec4(clamp(o,0.,1.),1.);`,
  'input = image enlarged N x (block pixels), resampled separably from the block grid. Lagrange 4-point = Schaum cubic and Schaum quadratic (Schaum 1993) kernels as in IPOL "Linear methods for image interpolation" (Getreuer 2011); Lagrange 6-point basis polynomials; Hamming window 0.54 + 0.46 cos(pi x/3) x sinc; Magic Kernel Sharp (Costella): quadratic-B-spline Magic Kernel after the input-space sharpening {-1/4, 3/2, -1/4} (2013) or {-1, 6, -35, 204, -35, 6, -1}/144 (2021); O-MOMS cubic (Blu, Thevenaz & Unser 2001) after the causal/anticausal prefilter with pole (sqrt(105) - 13)/8, applied as its truncated symmetric impulse response (|k| <= 5); Akima 1970 slopes (weights |m_i+1 - m_i|) with cubic Hermite segments, x then y');

const Q38_IBP = k => `if(${k}.>u_p1+.5)return T(uv);float B=max(R(u_p0),1.);int bk=int(u_p3+.5);vec2 pp=PX(uv)/B;vec2 p=pp-.5;vec2 i0=floor(p),fr=p-i0;
 int ns=int(min(ceil(B),6.));vec3 e=vec3(0.);
 for(int t=0;t<4;t++){if(bk==1&&t>0)break;vec2 cell=bk==1?floor(pp):i0+vec2(float(t%2),float(t/2));float w=bk==1?1.:(t%2==0?1.-fr.x:fr.x)*(t/2==0?1.-fr.y:fr.y);
  vec3 sm=vec3(0.);for(int bb=0;bb<6;bb++)for(int aa=0;aa<6;aa++){if(aa>=ns||bb>=ns)continue;sm+=T(fromPX((cell+(vec2(float(aa),float(bb))+.5)/float(ns))*B)).rgb;}sm/=float(ns*ns);
  e+=w*(O(fromPX((cell+.5)*B)).rgb-sm);}
 return vec4(clamp(T(uv).rgb+u_p2*e,0.,1.),1.);`;
f('q38_ibp','Iterative Back-Projection SR (Irani-Peleg, from N x grid)',[P('Source pixel size',2,16,4,.5,'px'),P('Iterations',1,8,5,1),P('Step lambda',.2,2,1,.05),S('Back-projection kernel',['Bilinear','Nearest (box)'])],
  [`float B=max(R(u_p0),1.);vec2 p=PX(uv)/B-.5;vec2 i0=floor(p),fr=p-i0;vec3 o=vec3(0.);
 for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec2 d=abs(vec2(float(i),float(j))-fr);vec2 w=mix(((1.5*d-2.5)*d)*d+1.,((-.5*d+2.5)*d-4.)*d+2.,step(1.,d));o+=w.x*w.y*T(fromPX((i0+vec2(float(i),float(j))+.5)*B)).rgb;}
 return vec4(clamp(o,0.,1.),1.);`].concat([1, 2, 3, 4, 5, 6, 7, 8].map(Q38_IBP)),
  'Irani & Peleg 1991 with a single low-resolution frame: start from a Keys (Catmull-Rom) upscale of the N x N blocks, then x <- x + lambda BP(y - D x) per iteration, D = box average over each block (pixel-integration PSF, up to 6 x 6 sub-samples), BP = bilinear (or nearest) spreading of the per-block error');

f = add('Analysis');
f('q38_lbp_a','LBP Variants III (CS-LBP / Median Binary / LDN / Elongated)',[S('Pattern',['CS-LBP (Heikkila 2009)','Median binary pattern (Hafiane 2007)','Local directional number LDN (Rivera 2013)','Elongated LBP (Liao-Chung 2007)']),P('Radius / long axis A',1,4,1,.5,'px'),P('CS-LBP threshold T',0,.1,.01,.002),S('ELBP orientation',['0','45','90','135'])],
  `int m=int(u_p0+.5);float rd=R(u_p1);float gc=L(uv);float nb[8];
 for(int k=0;k<8;k++){float th=float(k)*.7853982;vec2 e=vec2(cos(th),sin(th))*rd;
  if(m==1||m==2)e=floor(vec2(cos(th),sin(th))+.5)*rd;
  if(m==3){float an=u_p3*.7853982;vec2 el=vec2(rd*cos(th),max(rd*.5,1.)*sin(th));e=vec2(el.x*cos(an)-el.y*sin(an),el.x*sin(an)+el.y*cos(an));}
  nb[k]=L(uv+e*u_px);}
 float code=0.;
 if(m==0){for(int k=0;k<4;k++)if(nb[k]-nb[k+4]>u_p2)code+=exp2(float(k));code/=15.;}
 else if(m==1){float a9[9];for(int k=0;k<8;k++)a9[k]=nb[k];a9[8]=gc;float md=gc;for(int k=0;k<9;k++){int r=0;for(int j=0;j<9;j++)if(a9[j]<a9[k]||(a9[j]==a9[k]&&j<k))r++;if(r==4)md=a9[k];}
  for(int k=0;k<9;k++)if(a9[k]>=md)code+=exp2(float(k));code/=511.;}
 else if(m==2){float sa=0.;for(int k=0;k<8;k++)sa+=nb[k];float mx=-1e9,mn=1e9;int ix=0,jn=0;
  for(int k=0;k<8;k++){float r_=8.*(nb[(k+7)%8]+nb[k]+nb[(k+1)%8])-3.*sa;if(r_>mx){mx=r_;ix=k;}if(r_<mn){mn=r_;jn=k;}}code=float(8*ix+jn)/63.;}
 else{for(int k=0;k<8;k++)if(nb[k]>=gc)code+=exp2(float(k));code/=255.;}
 return vec4(vec3(code),1.);`,
  'codes shown as grey = code / max code. CS-LBP: sum over 4 centre-symmetric pairs of s(n_i - n_i+4 > T) 2^i on a radius-R circle (bilinear); MBP: 3x3 block (spacing R) incl. centre thresholded at its median, 9 bits; LDN: Kirsch compass responses on the 3x3 ring, code = 8 x argmax + argmin (6 bits); ELBP: 8 neighbours on an ellipse with axes A and B = A/2 at the chosen orientation, s(n_p - g_c >= 0)');

f('q38_lbp_b','Extended LBP & Local Tetra Patterns (NI / RD / AD / CI-LBP, LTrP)',[S('Pattern',['NI-LBP (neighbours vs their mean)','RD-LBP (radial difference)','AD-LBP (angular difference)','CI-LBP (centre vs image mean)','LTrP tetra patterns (3 codes as RGB)','LTrP direction map','LTrP magnitude pattern']),P('Radius',1,4,2,.5,'px'),P('Delta (RD radial / AD angular)',1,3,1,1),P('Threshold',0,.05,0,.001)],
  `int m=int(u_p0+.5);float rd=R(u_p1);float gc=L(uv);
 if(m<=3){if(m==3){float mu=0.;for(int bb=0;bb<16;bb++)for(int aa=0;aa<16;aa++)mu+=L((vec2(float(aa),float(bb))+.5)/16.);return vec4(vec3(step(mu/256.,gc)),1.);}
  float nb[8],ni[8];float mu=0.;float r2=max(rd-R(u_p2),0.);for(int k=0;k<8;k++){vec2 dr=vec2(cos(float(k)*.7853982),sin(float(k)*.7853982));nb[k]=L(uv+dr*rd*u_px);ni[k]=L(uv+dr*r2*u_px);mu+=nb[k];}mu/=8.;
  int dl=int(u_p2+.5);float code=0.;for(int k=0;k<8;k++){float df=m==0?nb[k]-mu:m==1?nb[k]-ni[k]:nb[k]-nb[(k+dl)%8];if(df>=u_p3)code+=exp2(float(k));}return vec4(vec3(code/255.),1.);}
 #define Q38DIR(Q_) (L((Q_)+vec2(u_px.x,0.))>=L(Q_)?(L((Q_)+vec2(0.,u_px.y))>=L(Q_)?1:4):(L((Q_)+vec2(0.,u_px.y))>=L(Q_)?2:3))
 #define Q38MAG(Q_) length(vec2(L((Q_)+vec2(u_px.x,0.))-L(Q_),L((Q_)+vec2(0.,u_px.y))-L(Q_)))
 int dc=Q38DIR(uv);if(m==5)return vec4(hsv2rgb(vec3(float(dc-1)/4.,.75,.35+6.*Q38MAG(uv))),1.);
 float mc=Q38MAG(uv);vec3 pc=vec3(0.);float mg=0.;int dd[3];int n=0;for(int d=1;d<=4;d++)if(d!=dc){dd[n]=d;n++;}
 for(int k=0;k<8;k++){float th=float(k)*.7853982;vec2 q=uv+floor(vec2(cos(th),sin(th))+.5)*rd*u_px;int dp=Q38DIR(q);float bw=exp2(float(k));
  if(dp!=dc){if(dp==dd[0])pc.x+=bw;else if(dp==dd[1])pc.y+=bw;else pc.z+=bw;}if(Q38MAG(q)>=mc)mg+=bw;}
 return vec4(m==4?pc/255.:vec3(mg/255.),1.);`,
  'Liu et al. 2012 extended LBP (8 samples): NI-LBP s(x_r,p - mean of the ring), RD-LBP s(x_r,p - x_r-delta,p), AD-LBP s(x_r,p - x_r,p+delta), CI-LBP s(x_c - image mean); Murala, Maheshwari & Balasubramanian 2012 LTrP: direction of each pixel from the signs of its horizontal / vertical first differences (1..4), tetra code 0 where a neighbour (radius R ring) shares the centre direction else its direction, split into 3 binary patterns (one per other direction, shown as RGB), plus the magnitude pattern s(M_p - M_c); direction map = hue by direction, value by magnitude');

f = add('Edges');
f('q38_surround','Surround-Inhibition Contours (Grigorescu-Petkov)',[P('Gabor sigma',1,6,2,.1,'px'),P('Inhibition alpha',0,3,1,.05),P('Gain',.5,40,14,.1),S('Output',['Contours (thinned, dark on white)','Inhibited energy','Gabor energy (no inhibition)'])],
  [`float sg=R(u_p0);float lam=sg/.56;float st=max(1.,3.*sg/7.);float re[8],ro[8],me[8];float sl=0.,sgw=0.;for(int k=0;k<8;k++){re[k]=0.;ro[k]=0.;me[k]=0.;}
 for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 o_=vec2(float(i),float(j))*st;float l=L(uv+o_*u_px);sl+=l;
  for(int k=0;k<8;k++){float th=float(k)*.3926991;float xp=o_.x*cos(th)+o_.y*sin(th),yp=-o_.x*sin(th)+o_.y*cos(th);float g=exp(-(xp*xp+.25*yp*yp)/(2.*sg*sg));if(k==0)sgw+=g;float ph=6.2831853*xp/lam;re[k]+=g*cos(ph)*l;me[k]+=g*cos(ph);ro[k]+=g*sin(ph)*l;}}
 float E=0.;int kb=0;for(int k=0;k<8;k++){float r_=re[k]-me[k]*sl/225.;float e=sqrt(r_*r_+ro[k]*ro[k])/sgw;if(e>E){E=e;kb=k;}}
 return vec4(E,float(kb)/8.,0.,1.);`,
   `float sg=R(u_p0);float st=1.5*sg;float tw=0.,ti=0.;float E=T(uv).r;
 for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o_=vec2(float(i),float(j))*st;float r2=dot(o_,o_);float w=max(exp(-r2/(32.*sg*sg))/16.-exp(-r2/(2.*sg*sg)),0.);if(w<=0.)continue;tw+=w;ti+=w*T(uv+o_*u_px).r;}
 float b=max(E-u_p1*ti/max(tw,1e-9),0.);return vec4(b,T(uv).g,E,1.);`,
   `vec4 t0=T(uv);int om=int(u_p3+.5);if(om==2)return vec4(vec3(clamp(t0.b*u_p2,0.,1.)),1.);if(om==1)return vec4(vec3(clamp(t0.r*u_p2,0.,1.)),1.);
 float th=t0.g*8.*.3926991;vec2 nr=vec2(cos(th),sin(th))*u_px;float b=t0.r;if(T(uv+nr).r>b||T(uv-nr).r>b)b=0.;return vec4(vec3(1.-clamp(b*u_p2,0.,1.)),1.);`],
  'Grigorescu, Petkov & Westenberg 2003 isotropic surround inhibition: Gabor energy (8 orientations, lambda = sigma/0.56, aspect 0.5, DC-free even part) maximised over orientation, inhibition term = Gabor energy weighted by the normalised positive part of DoG(4 sigma) - G(sigma) (sampled 17x17), b = (E - alpha t)+, then non-maximum suppression across the winning orientation (no hysteresis)');

f = add('Analysis');
f('q38_lbpsharp','LBP Defocus Sharpness Map (Yi-Eramian)',[P('LBP threshold T',0,.1,.016,.001),P('Window size',5,61,21,2,'px'),S('Normalise',['Min-max (sampled)','None']),S('Display',['Grey','Inferno'])],
  [`float gc=L(uv);float s=0.,pv=0.,first=0.;int tr=0;for(int k=0;k<8;k++){float th=float(k)*.7853982;float n=L(uv+vec2(cos(th),sin(th))*u_px);float bt=n-gc-u_p0>0.?1.:0.;s+=bt;if(k==0)first=bt;else if(bt!=pv)tr++;pv=bt;}
 if(pv!=first)tr++;float code=tr<=2?s:9.;return vec4(vec3(step(5.5,code)),1.);`,
   `return box1d(u_tex,uv,vec2(1.,0.),R((u_p1-1.)*.5));`,
   `float rr=R((u_p1-1.)*.5);float v=box1d(u_tex,uv,vec2(0.,1.),rr).r;if(u_p2<.5){float lo=1.,hi=0.;for(int bb=0;bb<8;bb++)for(int aa=0;aa<8;aa++){float sv=box1d(u_tex,(vec2(float(aa),float(bb))+.5)/8.,vec2(0.,1.),rr).r;lo=min(lo,sv);hi=max(hi,sv);}v=clamp((v-lo)/max(hi-lo,1e-4),0.,1.);}
 return vec4(int(u_p3+.5)==1?ramp(1,v):vec3(v),1.);`],
  'Yi & Eramian 2016 sharpness metric: rotation-invariant uniform LBP (P = 8, R = 1, bilinear diagonals, bit = n_p - n_c > T_LBP, T = 0.016 on [0,1]), fraction of pixels with riu2 code 6, 7, 8 or 9 (non-uniform) in an s x s window (box filter, s = 21); min-max normalised over an 8x8 sample of the map (approx. of the global normalisation in the paper); single scale, no matting');
