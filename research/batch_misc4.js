/* ================= misc4: KAZE / AKAZE nonlinear scale space, log-Gabor bank (spatial approx.), SEEDS / LSC superpixels (approx.) ================= */
f = add('Edges');
const MISC_KZ = i => `vec4 me=T(uv);float sg=R(u_p1);float tt=sg*sg*.5;float tau;bool fed=u_p0>.5;
  if(!fed){if(${i}.>=40.)return me;tau=min(.24,tt/40.);}
  else{float M=clamp(ceil(tt/2.5),1.,8.);if(${Math.floor(i / 5)}.>=M)return me;tau=.25/(2.*pow(cos(3.14159265*(2.*${[4,0,3,1,2][i % 5]}.+1.)/22.),2.))*min(tt/M,2.5)/2.5;}
  vec2 e=u_px;float l=me.r,k=me.g;vec4 qn=T(uv+vec2(0.,e.y)),qs=T(uv-vec2(0.,e.y)),qe=T(uv+vec2(e.x,0.)),qw=T(uv-vec2(e.x,0.));
  #define CG(d_) (1./(1.+(d_)*(d_)/(k*k)))
  float fl=fed?(.5*(me.b+qn.b)*(qn.r-l)+.5*(me.b+qs.b)*(qs.r-l)+.5*(me.b+qe.b)*(qe.r-l)+.5*(me.b+qw.b)*(qw.r-l)):(CG(qn.r-l)*(qn.r-l)+CG(qs.r-l)*(qs.r-l)+CG(qe.r-l)*(qe.r-l)+CG(qw.r-l)*(qw.r-l));return vec4(l+tau*fl,k,me.b,1.);`;
// AKAZE: conductance g2(|∇Lσ|) recomputed once per FED cycle (kept fixed inside the cycle, as FED requires)
const MISC_KZG = c => `vec4 me=T(uv);if(u_p0<.5)return me;float sg=R(u_p1);float M=clamp(ceil(sg*sg*.5/2.5),1.,8.);if(${c}.>=M)return me;vec2 e=u_px;float k=me.g;
  float gx=0.,gy=0.;for(int j=-1;j<=1;j++){float w=j==0?2.:1.;gx+=w*(T(uv+vec2(e.x,float(j)*e.y)).r-T(uv+vec2(-e.x,float(j)*e.y)).r);gy+=w*(T(uv+vec2(float(j)*e.x,e.y)).r-T(uv+vec2(float(j)*e.x,-e.y)).r);}
  vec2 g=vec2(gx,gy)/8.;return vec4(me.r,k,1./(1.+dot(g,g)/(k*k)),1.);`;
f('kaze','KAZE / AKAZE Nonlinear Scale Space',[S('Scheme',['KAZE (explicit steps, approx. of AOS)','AKAZE (FED cycles)']),P('Scale (sigma)',1,8,3,.1,'px'),S('Output',['Nonlinear scale space','Hessian determinant','Keypoints']),P('Keypoint threshold',0,.5,.08,.005)],
  [`float h[24];for(int i=0;i<24;i++)h[i]=0.;float gmax=1e-4;float gs[256];for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;vec2 e=u_px*max(u_k,1.);
     float g=length(vec2(L(q+vec2(e.x,0.))-L(q-vec2(e.x,0.)),L(q+vec2(0.,e.y))-L(q-vec2(0.,e.y))))*.5;gs[j*16+i]=g;gmax=max(gmax,g);}
    for(int n=0;n<256;n++)h[int(min(gs[n]/gmax*24.,23.))]+=1.;float acc=0.;float k=gmax;for(int i=0;i<24;i++){acc+=h[i];if(acc>=.7*256.){k=(float(i)+.5)/24.*gmax;break;}}
    return vec4(blurL(uv,.5),max(k,.005),1.,1.);`,
   ...Array(40).fill(0).flatMap((_, i) => i % 5 === 0 ? [MISC_KZG(i / 5), MISC_KZ(i)] : [MISC_KZ(i)]),
   `vec4 me=T(uv);vec2 e=u_px;float l=me.r;float lxx=T(uv+vec2(e.x,0.)).r+T(uv-vec2(e.x,0.)).r-2.*l,lyy=T(uv+vec2(0.,e.y)).r+T(uv-vec2(0.,e.y)).r-2.*l,lxy=(T(uv+e).r+T(uv-e).r-T(uv+vec2(e.x,-e.y)).r-T(uv+vec2(-e.x,e.y)).r)*.25;
    float sg=R(u_p1);return vec4(l,me.g,(lxx*lyy-lxy*lxy)*sg*sg*sg*sg,1.);`,
   `vec4 me=T(uv);int m=int(u_p2+.5);if(m==0)return vec4(vec3(me.r),1.);if(m==1)return vec4(vec3(clamp(.5+me.b*12.,0.,1.)),1.);
    vec3 o=O(uv).rgb*.55;float mk=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;float v=T(q).b;if(v<u_p3)continue;bool mx=true;
     for(int b=-2;b<=2;b++)for(int a=-2;a<=2;a++){if(a==0&&b==0)continue;if(T(q+vec2(float(a),float(b))*u_px).b>v)mx=false;}float rr=length(vec2(float(i),float(j)));if(mx)mk=max(mk,1.-smoothstep(.6,1.2,abs(rr-2.5)));}
    return vec4(mix(o,vec3(1.,.85,.1),mk),1.);`],
  'Alcantarilla et al.: Perona-Malik g2 diffusion with contrast factor k = 70th percentile of |∇L| (sampled), evolution time t = σ²/2; KAZE uses AOS (here: 40 explicit steps, approx.), AKAZE uses Fast Explicit Diffusion cycles (n = 5, τmax = 0.25, reordered steps, conductance fixed per cycle; up to 8 cycles, t ≤ 20); scale-normalised Hessian determinant and single-scale 3×3 maxima');
f('loggabor','Log-Gabor Filter Bank (spatial approx.)',[P('Min wavelength',3,24,6,.5,'px'),P('Scales',1,4,3,1),S('Output',['Energy (orientation colour)','Phase congruency (approx.)','Even / line response','Odd / edge magnitude']),P('Gain',.5,10,3,.1)],
  `float lmin=R(u_p0);float E[4],Od[4],A[4];for(int o=0;o<4;o++){E[o]=0.;Od[o]=0.;A[o]=0.;}float tot=0.;
  for(int s=0;s<4;s++){if(float(s)>=u_p1)break;float lam=lmin*pow(2.1,float(s));float sg=.33*lam;float sp=sg*.83;float Lq[49];float ws=0.,wl=0.;
   for(int j=0;j<7;j++)for(int i=0;i<7;i++){vec2 off=vec2(float(i)-3.,float(j)-3.)*sp;float v=L(uv+off*u_px);Lq[j*7+i]=v;float w=exp(-dot(off,off)/(2.*sg*sg));ws+=w;wl+=w*v;}float mL=wl/ws;
   for(int o=0;o<4;o++){vec2 dir=vec2(cos(float(o)*.785398),sin(float(o)*.785398));float ev=0.,od=0.,wc=0.;
    for(int j=0;j<7;j++)for(int i=0;i<7;i++){vec2 off=vec2(float(i)-3.,float(j)-3.)*sp;float w=exp(-dot(off,off)/(2.*sg*sg));float ph=6.28318*dot(off,dir)/lam;float v=Lq[j*7+i]-mL;ev+=w*cos(ph)*v;od+=w*sin(ph)*v;}
    ev/=ws;od/=ws;E[o]+=ev;Od[o]+=od;A[o]+=sqrt(ev*ev+od*od);}}
  int m=int(u_p2+.5);float g=u_p3;
  if(m==0){vec3 col=vec3(0.);float en=0.;for(int o=0;o<4;o++){float eo=sqrt(E[o]*E[o]+Od[o]*Od[o]);en+=eo;col+=hsv2rgb(vec3(float(o)/4.,.85,1.))*eo;}return vec4(clamp(col*g*.6,0.,1.),1.);}
  if(m==1){float num=0.,den=1e-4;for(int o=0;o<4;o++){num+=max(sqrt(E[o]*E[o]+Od[o]*Od[o])-.015,0.);den+=A[o];}return vec4(vec3(clamp(num/den*g*.35,0.,1.)),1.);}
  if(m==2){float s_=E[0]+E[1]+E[2]+E[3];return vec4(vec3(clamp(.5-s_*g,0.,1.)),1.);}
  float s_=abs(Od[0])+abs(Od[1])+abs(Od[2])+abs(Od[3]);return vec4(vec3(clamp(s_*g,0.,1.)),1.);`,
  'approx.: log-Gabor bank (4 orientations, up to 4 scales, scale factor 2.1) emulated in the spatial domain with zero-mean Gaussian-windowed quadrature pairs of matched ~2-octave bandwidth (true log-Gabor needs the FFT); phase congruency = Kovesi energy / Σ amplitude with a fixed noise floor');
f = add('Analysis');
const MISC_SPH = `float S=max(R(u_p1),4.);vec2 gc=floor(uv*u_res/S);
  #define DEC(v_) vec2(float(int((v_)*8.+.5)/3)-1.,float(int((v_)*8.+.5)-(int((v_)*8.+.5)/3)*3)-1.)
  #define LAB_(q_) (floor((q_)*u_res/S)+DEC(T(q_).r))
  `;
const MISC_FEAT = `
  #define LABC(c_) vec3(116.*pow(max(dot(pow(c_,vec3(2.2)),vec3(.2126,.7152,.0722)),1e-4),1./3.)-16.,500.*(pow(max(dot(pow(c_,vec3(2.2)),vec3(.4124,.3576,.1805))/.9505,1e-4),1./3.)-pow(max(dot(pow(c_,vec3(2.2)),vec3(.2126,.7152,.0722)),1e-4),1./3.)),200.*(pow(max(dot(pow(c_,vec3(2.2)),vec3(.2126,.7152,.0722)),1e-4),1./3.)-pow(max(dot(pow(c_,vec3(2.2)),vec3(.0193,.1192,.9505))/1.089,1e-4),1./3.)))
  `;
const MISC_SP = it => `${MISC_SPH}${MISC_FEAT}vec4 me=T(uv);if(mod(gc.x+gc.y+floor(uv.x*u_res.x)+floor(uv.y*u_res.y)+${it}.,2.)>.5)return me;vec2 cur=LAB_(uv);
  vec2 cands[5];cands[0]=cur;int nc=1;bool bd=false;for(int k=0;k<4;k++){vec2 d=k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.);vec2 lb=LAB_(uv+d*u_px);if(any(notEqual(lb,cur))){bd=true;bool dup=false;for(int q=0;q<5;q++){if(q>=nc)break;if(all(equal(cands[q],lb)))dup=true;}if(!dup&&abs(lb.x-gc.x)<1.5&&abs(lb.y-gc.y)<1.5){cands[nc]=lb;nc++;}}}
  if(!bd||nc<2)return me;vec3 pc=O(uv).rgb;vec3 lab=LABC(pc);float best=-1e9;vec2 bl=cur;
  float th=1.5708,Cs=u_p2*.1*u_res.x/S;
  #define PH1(l_) vec4(cos(th*(l_).x/100.),sin(th*(l_).x/100.),2.55*cos(th*((l_).y+128.)/256.),2.55*sin(th*((l_).y+128.)/256.))
  #define PH2(l_,q_) vec4(2.55*cos(th*((l_).z+128.)/256.),2.55*sin(th*((l_).z+128.)/256.),Cs*cos(th*(q_).x),Cs*sin(th*(q_).x))
  #define PH3(q_) vec2(Cs*cos(th*(q_).y),Cs*sin(th*(q_).y))
  vec4 g1=vec4(0.),g2=vec4(0.);vec2 g3=vec2(0.);if(u_p0>.5){for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec2 q=(vec2(float(i),float(j))+.5)/8.;vec3 lq=LABC(O(q).rgb);g1+=PH1(lq);g2+=PH2(lq,q);g3+=PH3(q);}g1/=64.;g2/=64.;g3/=64.;}
  vec4 p1=PH1(lab),p2=PH2(lab,uv);vec2 p3=PH3(uv);float wp=dot(p1,g1)+dot(p2,g2)+dot(p3,g3);
  for(int q=0;q<5;q++){if(q>=nc)break;vec2 cd=cands[q];float n=0.,hits=0.,sw=0.;vec4 s1=vec4(0.),s2=vec4(0.);vec2 s3=vec2(0.);
   for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec2 sp=(cd+.5+vec2(float(i)-2.,float(j)-2.)*.42)*S/u_res;if(any(notEqual(LAB_(sp),cd)))continue;vec3 sc=O(sp).rgb;n+=1.;
    if(u_p0<.5){if(all(equal(floor(sc*4.),floor(pc*4.))))hits+=1.;}else{vec3 ls=LABC(sc);vec4 a1=PH1(ls),a2=PH2(ls,sp);vec2 a3=PH3(sp);s1+=a1;s2+=a2;s3+=a3;sw+=dot(a1,g1)+dot(a2,g2)+dot(a3,g3);}}
   float nb=0.;for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){if(a==0&&b==0)continue;if(all(equal(LAB_(uv+vec2(float(a),float(b))*u_px),cd)))nb+=1.;}
   float sc_;if(u_p0<.5)sc_=log((hits+.3)/(n+2.))+u_p2*.35*nb;
   else if(n<1.)sc_=-1e8;else{vec4 d1=p1/wp-s1/sw,d2=p2/wp-s2/sw;vec2 d3=p3/wp-s3/sw;sc_=-(dot(d1,d1)+dot(d2,d2)+dot(d3,d3))*400.+.05*nb;}
   if(sc_>best){best=sc_;bl=cd;}}
  vec2 dc=bl-gc;return vec4((dc.x+1.)*3.+dc.y+1.,0.,0.,8.)/8.;`;
f('superpix2','Superpixels II (SEEDS / LSC, approx.)',[S('Method',['SEEDS (histogram hill-climbing)','LSC (linear spectral clustering)']),P('Region size',8,80,24,1,'px'),P('Compactness / boundary prior',0,3,1,.05),S('Display',['Borders over image','Mean colour','Mean colour + borders'])],
  [`return vec4(4./8.,0.,0.,1.);`, ...Array(16).fill(0).map((_, i) => MISC_SP(i)),
   `${MISC_SPH}vec2 cur=LAB_(uv);float bd=0.;for(int k=0;k<4;k++){vec2 d=k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.);if(any(notEqual(LAB_(uv+d*u_px),cur)))bd=1.;}
    int m=int(u_p3+.5);vec3 o=O(uv).rgb;if(m==0)return vec4(mix(o,vec3(1.,.95,.2),bd),1.);vec3 ms=vec3(0.);float n=0.;
    for(int j=0;j<6;j++)for(int i=0;i<6;i++){vec2 sp=(cur+.5+vec2(float(i)-2.5,float(j)-2.5)*.36)*S/u_res;if(any(notEqual(LAB_(sp),cur)))continue;ms+=O(sp).rgb;n+=1.;}ms=n>0.?ms/n:o;
    return vec4(m==1?ms:mix(ms,vec3(0.),bd*.8),1.);`],
  'approx.: labels start on a regular grid and boundary pixels hill-climb (checkerboard updates, 16 iterations) between neighbouring labels; SEEDS = colour-histogram likelihood (4³ bins, sampled members) + 3×3 boundary prior, no block levels; LSC = assignment to the nearest weighted mean in the 10-D cosine feature space φ(L,a,b,x,y) with weights w = φ·φ̄ (Li & Chen 2015), cluster means estimated from sampled members');
