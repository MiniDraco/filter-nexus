/* ================= q34b: Retinex variants from the literature (sprays, termites, quantiles, paths, Frankle-McCann, McCann99, PDE) ================= */
f = add('Tone');
const Q34_RSH = `
#define Q34_IN(q) (all(greaterThanEqual(q,vec2(0.)))&&all(lessThan(q,u_res)))
#define Q34_AT(q) max(O(((q)+.5)/u_res).rgb,vec3(.004))
`;
f('q34_retinex_spray','Retinex: Random Sprays / Light Sprays / Termites / QBRIX / Land Paths',[S('Method',['Random spray Retinex (RSR)','Light random sprays (LRSR)','Termite Retinex (approx.)','QBRIX local quantile','Land 1971 paths (ratio-threshold-reset)']),P('Radius (x diagonal)',.05,1,1,.01),P('Sprays / agents / paths',1,24,8,1),P('Quantile / threshold / kernel',0,1,.5,.01)],
 [Q34_RSH + `int m=int(u_p0+.5);vec2 p=floor(uv*u_res);float Rr=u_p1*length(u_res);int N=int(u_p2+.5);float ax=u_p3;
 vec3 I=Q34_AT(p);vec3 acc=vec3(0.);vec3 res=I;
 if(m<=1){int n=min(1200/max(N,1),400);
  for(int k=0;k<24;k++){if(k>=N)break;vec3 mx=I;
   for(int j=0;j<400;j++){if(j>=n)break;float h1=hash(p+vec2(float(j)*1.618,float(k)*7.31+.11)),h2=hash(p+vec2(float(k)*3.17+.5,float(j)*2.41+.3));
    vec2 q=floor(p+Rr*h1*vec2(cos(6.2832*h2),sin(6.2832*h2))+.5);if(!Q34_IN(q))continue;mx=max(mx,Q34_AT(q));}
   acc+=I/mx;}
  res=acc/float(max(N,1));}
 else if(m==2){int Ns=min(300/max(N,1),64);float st=max(Rr/float(Ns),1.);
  for(int k=0;k<24;k++){if(k>=N)break;float hd=6.2832*(float(k)+hash(p+float(k)*.7))/float(N);vec2 cur=p;vec3 mx=I;float lc=luma(I);
   for(int s=0;s<64;s++){if(s>=Ns)break;float ws=0.;float wv[4];vec2 cd[4];vec3 cc[4];
    for(int d=0;d<4;d++){float a=hd+(float(d)-1.5)*.7854;vec2 q=floor(cur+st*vec2(cos(a),sin(a))+.5);cd[d]=q;bool ok=Q34_IN(q);cc[d]=ok?Q34_AT(q):vec3(1.);wv[d]=ok?1./(1.+20.*abs(luma(cc[d])-lc)):0.;ws+=wv[d];}
    if(ws<=0.)break;float rr=hash(p+vec2(float(s)*5.1+.2,float(k)*9.7+.4))*ws;int pk=3;for(int d=0;d<4;d++){rr-=wv[d];if(rr<=0.){pk=d;break;}}
    cur=cd[pk];hd+=(float(pk)-1.5)*.39;mx=max(mx,cc[pk]);lc=luma(cc[pk]);}
   acc+=I/mx;}
  res=acc/float(max(N,1));}
 else if(m==3){vec3 sp[80];sp[0]=I;for(int j=1;j<80;j++){float h1=hash(p+vec2(float(j)*1.618,.37)),h2=hash(p+vec2(.5,float(j)*2.41+.3));
   vec2 q=floor(p+Rr*h1*vec2(cos(6.2832*h2),sin(6.2832*h2))+.5);sp[j]=Q34_IN(q)?Q34_AT(q):I;}
  float tg=(.8+.2*ax)*80.;vec3 Q=vec3(1.);
  for(int i=0;i<80;i++){vec3 v=sp[i];vec3 cn=vec3(0.);for(int j=0;j<80;j++)cn+=step(sp[j],v);Q=mix(Q,min(Q,v),step(vec3(tg),cn));}
  res=I/max(Q,vec3(.004));}
 else{int Ns=min(1200/max(N,1),96);float st=max(Rr/float(Ns),1.);float th=ax*.1;
  for(int k=0;k<24;k++){if(k>=N)break;vec3 lg[96];float hd=6.2832*hash(p+vec2(float(k)*4.3,.9));vec2 cur=p;
   for(int s=0;s<96;s++){if(s>=Ns)break;hd+=(hash(p+vec2(float(s)*1.3,float(k)*2.9+.6))-.5)*1.2;vec2 nx=cur+st*vec2(cos(hd),sin(hd));
    if(!Q34_IN(floor(nx+.5))){hd+=3.1416;nx=clamp(nx,vec2(0.),u_res-1.);}cur=nx;lg[s]=log(Q34_AT(floor(cur+.5)));}
   vec3 Pv=vec3(0.);vec3 pv=lg[Ns-1];
   for(int s=94;s>=-1;s--){if(s>Ns-2)continue;vec3 cv=s>=0?lg[s]:log(I);vec3 r=cv-pv;r*=step(vec3(th),abs(r));Pv=min(Pv+r,vec3(0.));pv=cv;}
   acc+=Pv;}
  res=exp(acc/float(max(N,1)));}
 return vec4(clamp(res,0.,1.),1.);`,
  `if(int(u_p0+.5)!=1)return c;float ks=R(5.+u_p3*40.);vec3 sr=vec3(0.),si=vec3(0.);
 for(int j=0;j<9;j++)for(int i=0;i<9;i++){vec2 q=uv+(vec2(float(i),float(j))-4.)/8.*ks*u_px;sr+=T(q).rgb;si+=O(q).rgb;}
 return vec4(clamp(O(uv).rgb*sr/max(si,vec3(.004)),0.,1.),1.);`],
 'RSR (Provenzi et al. 2007): per channel L = mean over N sprays of I / max(spray), spray points at radius R*rand, angle 2pi*rand (identity radial density, so denser near the pixel), R = image diagonal by default; N x n capped at 1200 samples. LRSR (Banic & Loncaric 2013): RSR result R smoothed against the input with an averaging kernel, out = I * (R*k)/(I*k) (kernel 5-45 px, default 25), meant for 1 small spray (no downsampling step here). Termite Retinex (Simone et al. 2014), approx.: per pixel N agents walk Ns steps, each step choosing among 4 forward neighbours with probability ~ bilateral closeness 1/(1+20|dL|) (backtracking tabu, agents start on spread headings; no shared poison map), out = mean I / max(path). QBRIX (Gianini et al. 2014) local version: white reference = quantile (0.8-1, default 0.9) of an 80-sample spray population, out = I / quantile. Land & McCann 1971: N random-walk paths ending at the pixel, log ratios below the threshold set to 0, product reset at 0, out = exp(mean product)',1);

// Frankle-McCann (1983) and McCann99 (Funt, Ciurea & McCann 2000 MATLAB code): log image, ratio-product-reset-average
const Q34_FMH = `
#define Q34_RR(q) (log(clamp(O(((q)+.5)/u_res).rgb,0.,1.)*255.+1.)/log(256.))
#define Q34_IN(q) (all(greaterThanEqual(q,vec2(0.)))&&all(lessThan(q,u_res)))
#define Q34_OP(q) T(((q)+.5)/u_res).rgb
`;
const Q34_FMPASS = k => Q34_FMH + `int m=int(u_p0+.5);int it=${k % 3},lv=${Math.floor(k / 3)};if(it>=int(u_p1+.5))return c;bool first=${k === 0 ? 'true' : 'false'};
 vec3 M=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++)M=max(M,Q34_RR(floor((vec2(float(i),float(j))+.5)/16.*u_res)));
 vec2 p=floor(uv*u_res);
 if(m==0){int Lt=min(int(floor(log2(min(u_res.x,u_res.y)))),10);float sh=exp2(float(Lt-1-lv));if(sh<1.)return c;float s=lv%2==0?sh:-sh;vec2 dx=vec2(s,0.),dy=vec2(0.,-s);
  #define Q34_O0(q) (first?M:Q34_OP(q))
  #define Q34_S1(q) (Q34_IN((q)-dx)?.5*(min(Q34_O0((q)-dx)+Q34_RR(q)-Q34_RR((q)-dx),M)+Q34_O0(q)):Q34_O0(q))
  vec3 a=Q34_S1(p);vec3 r=a;if(Q34_IN(p-dy)){vec3 b=Q34_S1(p-dy);r=.5*(min(b+Q34_RR(p)-Q34_RR(p-dy),M)+a);}return vec4(r,1.);}
 int Lm=clamp(int(floor(log2(min(u_res.x,u_res.y))))-2,0,9);if(lv>Lm)return c;float bs=exp2(float(Lm-lv));vec2 B=floor(p/bs);float n=min(bs,4.);float stp=bs/n;
 vec3 rr[9];vec3 op[9];bool ok[9];
 for(int t=0;t<9;t++){vec2 BB=B+vec2(float(t%3-1),float(t/3-1));vec2 o=BB*bs;ok[t]=all(greaterThanEqual(BB,vec2(0.)))&&all(lessThan(o,u_res));vec3 sm=vec3(0.);float cn=0.;op[t]=M;
  if(ok[t]){vec2 ex=min(vec2(bs),u_res-o);for(int j=0;j<4;j++)for(int i=0;i<4;i++){if(float(i)>=n||float(j)>=n)continue;sm+=Q34_RR(min(floor(o+(vec2(float(i),float(j))+.5)*ex/n),u_res-1.));cn+=1.;}
   if(!first)op[t]=Q34_OP(min(o+floor(ex*.5),u_res-1.));}
  rr[t]=sm/max(cn,1.);}
 int ord[8]=int[8](7,8,5,2,1,0,3,6);vec3 cur=op[4];
 for(int e=0;e<8;e++){int t=ord[e];if(!ok[t])continue;cur=.5*(cur+min(op[t]+rr[4]-rr[t],M));}
 return vec4(cur,1.);`;
f('q34_retinex_fm','Retinex: Frankle-McCann / McCann99',[S('Method',['Frankle-McCann (1983)','McCann99 (multiresolution)']),P('Iterations per level',1,3,2,1),S('Output',['Inverse log (display)','Raw log Retinex'])],
 [...Array.from({length: 30}, (_, k) => Q34_FMPASS(k)),
  `vec3 r=c.rgb;return vec4(u_p2>.5?r:clamp((pow(vec3(256.),r)-1.)/255.,0.,1.),1.);`],
 'Ciurea, Funt & McCann "Retinex in Matlab" (2000) per channel on the log image log(255 I + 1)/log 256: Frankle-McCann = shifts from 2^(floor(log2 min side)-1) halving with alternating sign, each iteration a horizontal then a vertical ratio-product (OP(x-s) + r(x) - r(x-s)), reset at the image maximum, average with the old product (both steps exact in one pass); McCann99 = pyramid of block means (coarsest block 2^(floor(log2 min side)-2)), per level 8 neighbour comparisons N, NE ... NW with reset and averaging, product replicated to the next level; neighbours read from the previous pass (approx. of the sequential sweep); image maximum from a 16x16 sample grid; max 10 levels, 1-3 iterations');

// Retinex Poisson equation (Morel, Petro & Sbert 2010; Limare et al. IPOL 2011): -Lap u = sum_n f(I(x)-I(n)), f zeroes |d| < t, Neumann
const Q34_PDEST = [64, 64, 64, 32, 32, 32, 16, 16, 16, 8, 8, 8, 4, 4, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1];
const Q34_PDEPASS = (s, k) => `vec2 p=floor(uv*u_res);float s=${s}.;float th=u_p0/255.;
#define Q34_I(q) O((clamp(q,vec2(0.),u_res-1.)+.5)/u_res).rgb
#define Q34_IN(q) (all(greaterThanEqual(q,vec2(0.)))&&all(lessThan(q,u_res)))
#define Q34_E(q) (${k === 0 ? 'true' : 'false'}?vec3(0.):T(((q)+.5)/u_res).rgb*2.-1.)
 vec3 Sm=vec3(0.);float n=min(s,4.);float stp=s/n;float cn=0.;
 for(int j=0;j<4;j++)for(int i=0;i<4;i++){if(float(i)>=n||float(j)>=n)continue;vec2 q=clamp(p+floor((vec2(float(i),float(j))+.5)*stp-s*.5),vec2(0.),u_res-1.);vec3 Iq=Q34_I(q);
  for(int d=0;d<4;d++){vec2 nq=q+(d==0?vec2(1.,0.):d==1?vec2(-1.,0.):d==2?vec2(0.,1.):vec2(0.,-1.));if(!Q34_IN(nq))continue;vec3 dd=Iq-Q34_I(nq);Sm+=dd*(1.-step(vec3(th),abs(dd)));}cn+=1.;}
 Sm/=max(cn,1.);vec3 e=vec3(0.);float nv=0.;
 for(int d=0;d<4;d++){vec2 nq=p+s*(d==0?vec2(1.,0.):d==1?vec2(-1.,0.):d==2?vec2(0.,1.):vec2(0.,-1.));if(!Q34_IN(nq))continue;e+=Q34_E(nq);nv+=1.;}
 e=(e-s*s*Sm)/max(nv,1.);e=mix(Q34_E(p),e,.67);return vec4(clamp(.5+.5*e,0.,1.),1.);`;
f('q34_retinex_pde','Retinex PDE (Poisson, Morel-Petro-Sbert)',[P('Threshold t (of 255)',0,40,4,.5),P('Mix',0,1,1,.01)],
 [...Q34_PDEST.map((s, k) => Q34_PDEPASS(s, k)),
  `vec3 su=vec3(0.),su2=vec3(0.),si=vec3(0.),si2=vec3(0.);
 for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;vec3 I=O(q).rgb;vec3 u=I+T(q).rgb*2.-1.;su+=u;su2+=u*u;si+=I;si2+=I*I;}
 su/=256.;si/=256.;vec3 du=sqrt(max(su2/256.-su*su,vec3(1e-6))),di=sqrt(max(si2/256.-si*si,vec3(1e-6)));
 vec3 I=O(uv).rgb;vec3 u=I+c.rgb*2.-1.;vec3 r=(u-su)/du*di+si;return vec4(clamp(mix(I,r,u_p1),0.,1.),1.);`],
 'PDE Retinex (Morel, Petro & Sbert 2010; Limare et al. IPOL 2011): per channel solve -Lap u = F with F(x) = sum over the 4 neighbours of f(I(x)-I(n)), f(d) = 0 if |d| < t else d (t = 4 of 255 by default), Neumann boundary, then give u the mean and variance of the input (16x16 sample grid). Solved here as u = I + e with -Lap e = -(sum of the small differences) by cascaded damped (w = 2/3) strided Jacobi sweeps (strides 64..1, 24 passes) instead of the reference DFT solve - approx.');
