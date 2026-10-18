/* ================= q38: round-16 denoising literature (a trous wavelet shrinkage, impulse medians, DDF, DPAD, no-neighbours deblur, Ebner LSAC) ================= */
// a trous B3 detail-noise factors (Starck & Murtagh) for levels 1..5
const Q38_E = ['.889', '.200', '.086', '.041', '.020'];
// pass k (1..5): computes c_k from c_(k-1); for k>=2 also shrinks d_(k-1) (stored in .g) with the chosen rule.
// state: r = c_k, g = .5+.5*d_k, b = .5+.5*sum of shrunk details, a = noise sigma
const Q38_WSP = k => {
  const s = (1 << (k - 1)).toFixed(1), src = k === 1 ? 'luma(O(q).rgb)' : 'T(q).r';
  let g = `float hw[5]=float[5](1.,4.,6.,4.,1.);vec4 t0=T(uv);float ck=0.;
 for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec2 q=uv+vec2(float(i-2),float(j-2))*${s}*u_px;ck+=hw[i]*hw[j]/256.*${src};}
 float cp=${k === 1 ? 'luma(O(uv).rgb)' : 't0.r'};float dk=cp-ck;`;
  if (k === 1) return g + `float sn=u_p1;if(sn<=0.){float dv[49];for(int bb=0;bb<7;bb++)for(int aa=0;aa<7;aa++){vec2 c0=(floor((vec2(float(aa),float(bb))+.5)/7.*u_res)+.5)/u_res;float sm=0.;
  for(int j=0;j<5;j++)for(int i=0;i<5;i++)sm+=hw[i]*hw[j]/256.*luma(O(c0+vec2(float(i-2),float(j-2))*u_px).rgb);dv[bb*7+aa]=abs(luma(O(c0).rgb)-sm);}
  float lo=0.,hi=.25;for(int it=0;it<16;it++){float md=(lo+hi)*.5;float n=0.;for(int t=0;t<49;t++)n+=step(dv[t],md);if(n<24.5)lo=md;else hi=md;}sn=max((lo+hi)*.5/.6745/.889,1e-4);}
 return vec4(ck,.5+.5*dk,.5,sn);`;
  const sp = (1 << (k - 2)).toFixed(1);
  g += `float sn=t0.a;float y=(t0.g-.5)*2.,Sd=(t0.b-.5)*2.;float sj=max(sn*${Q38_E[k - 2]}*u_p2,1e-6);int m=int(u_p0+.5);float sh=y;
 #define Q38D(P1,P2) ((T(uv+vec2(float(P1),float(P2))*${sp}*u_px).g-.5)*2.)
 if(m==0){float S2=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float v=Q38D(i,j);S2+=v*v;}float lam2=2.*sj*sj*log(u_res.x*u_res.y);sh=y*max(0.,1.-lam2/max(S2,1e-12));}
 else if(m==1){float vy=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float v=Q38D(i,j);vy+=v*v;}vy/=49.;float ss=sqrt(max(vy-sj*sj,0.));float Rr=sqrt(y*y+dk*dk);float th=ss>1e-6?1.7320508*sj*sj/ss:1e9;sh=Rr>0.?y*max(Rr-th,0.)/Rr:0.;}
 else{float m11=0.,m12=0.,m22=0.,c1=0.,c2=0.;for(int bb=0;bb<16;bb++)for(int aa=0;aa<16;aa++){vec2 q=(floor((vec2(float(aa),float(bb))+.5)/16.*u_res)+.5)/u_res;float v=(T(q).g-.5)*2.;float e=exp(-v*v/(12.*sj*sj));float t2=v*e;
  m11+=v*v;m12+=v*t2;m22+=t2*t2;c1+=v*v-sj*sj;c2+=v*t2-sj*sj*e*(1.-v*v/(6.*sj*sj));}
  float det=m11*m22-m12*m12;if(abs(det)>1e-12){float a1=(c1*m22-c2*m12)/det,a2=(m11*c2-m12*c1)/det;sh=a1*y+a2*y*exp(-y*y/(12.*sj*sj));}}
 Sd+=sh;`;
  if (k < 5) return g + `return vec4(ck,.5+.5*dk,.5+.5*Sd,sn);`;
  return g + `float Yd=cp+Sd;vec3 o=O(uv).rgb;float Y=luma(o);int om=int(u_p3+.5);vec3 ch=vec3(0.);
 for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec3 v=O(uv+vec2(float(i-2),float(j-2))*2.*u_px).rgb;ch+=hw[i]*hw[j]/256.*(v-luma(v));}
 vec3 dn=vec3(Yd)+ch;if(om==2)return vec4(clamp(.5+(o-dn)*4.,0.,1.),1.);if(om==1)dn=o+(Yd-Y);return vec4(clamp(dn,0.,1.),1.);`;
};
f = add('Noise');
f('q38_wshrink','Wavelet Shrinkage (NeighShrink / Bivariate / SURE-LET, a trous)',[S('Rule',['NeighShrink (Chen-Bui-Qian)','Bivariate shrinkage (Sendur-Selesnick)','SURE-LET (Luisier-Blu)']),P('Noise sigma (0 = auto)',0,.2,0,.002),P('Strength',0,3,1,.05),S('Output',['Denoised (chroma smoothed)','Denoised luma only','Removed noise x4'])],
  [1, 2, 3, 4, 5].map(Q38_WSP),
  'approx. (the papers use decimated orthogonal / Haar UWT subbands): 4-level undecimated B3 a trous transform of luma, noise sigma from the MAD of level 1 (49 samples, /0.6745/0.889) unless set, per-level sigma_j = sigma x (.889 .200 .086 .041 .020) x Strength. NeighShrink (Chen, Bui & Qian 2004): beta = (1 - lambda^2/S^2)+ with S^2 = sum of squares in the 3x3 coefficient neighbourhood, lambda = sqrt(2 sigma_j^2 ln N). Bivariate (Sendur & Selesnick 2002, local variance): w = y (sqrt(y^2+p^2) - sqrt3 sigma_n^2/sigma)+ / sqrt(y^2+p^2), p = parent (next level, same position), sigma = sqrt((mean y^2 over 7x7 - sigma_n^2)+). SURE-LET (Luisier & Blu 2007): theta(y) = a1 y + a2 y exp(-y^2/(12 sigma^2)), a = M^-1 c from SURE sums over a 16x16 coefficient sample, solved per level (in-band, not the paper\'s joint image-domain solve). Chroma: B3 low-pass (not wavelet-shrunk)');

// PSM: alpha = (flags bits R1 G2 B4 + 8 * noise-ratio code 0..31) / 255
const Q38_PSMD = n => `vec4 t0=T(uv);float fl=0.,qR=0.;` + (n === 1 ? `float cnt=0.;
 for(int bb=0;bb<12;bb++)for(int aa=0;aa<12;aa++){vec2 c0=(floor((vec2(float(aa),float(bb))+.5)/12.*u_res)+.5)/u_res;vec3 w[9];for(int k=0;k<9;k++)w[k]=O(c0+vec2(float(k%3-1),float(k/3-1))*u_px).rgb;
  for(int c=0;c<3;c++){float md=0.;for(int k=0;k<9;k++){int r=0;for(int j=0;j<9;j++)if(w[j][c]<w[k][c]||(w[j][c]==w[k][c]&&j<k))r++;if(r==4)md=w[k][c];}cnt+=step(40./255.,abs(md-w[4][c]));}}
 qR=floor(cnt/432.*31.+.5);` : `float av=floor(t0.a*255.+.5);fl=mod(av,8.);qR=floor(av/8.);`) + `
 float Rn=qR/31.;int wm=int(u_p1+.5);int wd=wm==1?1:wm==2?2:(Rn<=.25?1:2);float TD=u_p0>0.?u_p0/255.:(65.-50.*Rn)/255.;
 vec3 x=t0.rgb;vec3 v[25];int n=0;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>wd||abs(j)>wd)continue;v[n]=T(uv+vec2(float(i),float(j))*u_px).rgb;n++;}
 float nf=0.;vec3 xo=x;for(int c=0;c<3;c++){float md=x[c];for(int k=0;k<25;k++){if(k>=n)break;int r=0;for(int j=0;j<25;j++){if(j>=n)break;if(v[j][c]<v[k][c]||(v[j][c]==v[k][c]&&j<k))r++;}if(r==(n-1)/2)md=v[k][c];}
  float pw=c==0?1.:c==1?2.:4.;float bit=mod(floor(fl/pw),2.);if(abs(x[c]-md)>=TD){if(bit<.5)xo[c]=md;bit=1.;}nf+=bit*pw;}
 return vec4(${n === 3 ? 'O(uv).rgb' : 'xo'},(nf+8.*qR)/255.);`;
const Q38_PSMF = last => `vec4 t0=T(uv);float av=floor(t0.a*255.+.5);float fl=mod(av,8.);float qR=floor(av/8.);
 vec3 v[9];vec3 gd[9];for(int k=0;k<9;k++){vec4 s_=T(uv+vec2(float(k%3-1),float(k/3-1))*u_px);float f_=mod(floor(s_.a*255.+.5),8.);v[k]=s_.rgb;gd[k]=vec3(1.-mod(f_,2.),1.-mod(floor(f_/2.),2.),1.-floor(f_/4.));}
 vec3 yv=t0.rgb;float nf=0.;for(int c=0;c<3;c++){float pw=c==0?1.:c==1?2.:4.;float bit=mod(floor(fl/pw),2.);
  if(bit>.5){int M=0;for(int k=0;k<9;k++)if(gd[k][c]>.5)M++;
   if(M>0){float lo_=0.,hi_=0.;int h1=(M-1)/2,h2=M/2;for(int k=0;k<9;k++){if(gd[k][c]<.5)continue;int r=0;for(int j=0;j<9;j++){if(gd[j][c]>.5&&(v[j][c]<v[k][c]||(v[j][c]==v[k][c]&&j<k)))r++;}if(r==h1)lo_=v[k][c];if(r==h2)hi_=v[k][c];}
    yv[c]=M%2==1?lo_:.5*(lo_+hi_);bit=0.;}}
  nf+=bit*pw;}
 ` + (last ? `if(int(u_p2+.5)==1)return vec4(vec3(step(.5,nf)),1.);return vec4(yv,1.);` : `return vec4(yv,(nf+8.*qR)/255.);`);
f('q38_psm','Progressive Switching Median (Wang-Zhang)',[P('Detection threshold T_D (0 = auto)',0,128,0,1),S('Detection window W_D',['Auto (from noise ratio)','3x3','5x5']),S('Output',['Restored','Impulses left after 6 iterations'])],
  [Q38_PSMD(1), Q38_PSMD(2), Q38_PSMD(3), Q38_PSMF(0), Q38_PSMF(0), Q38_PSMF(0), Q38_PSMF(0), Q38_PSMF(0), Q38_PSMF(1)],
  'Wang & Zhang 1999 (IEEE TCAS-II 46(1)), per RGB channel: noise ratio R from Sun-Neuvo switch-I counts (|med3x3 - x| >= 40) on a 12x12 sample, W_D = 3 if R <= 25% else 5, T_D = 65 - 50 R; N_D = 3 progressive detection iterations (newly flagged pixels replaced by the W_D median); then 6 filtering iterations from the noisy image with W_F = 3: flagged pixels take the median (left/right median mean for even M) of the good pixels only and become good');

f('q38_rankmed','Center-Weighted / Rank-Conditioned / Decision-Based Median',[S('Method',['Center-weighted median (Ko-Lee)','Rank-conditioned median (RCRS family)','Decision-based median (Srinivasan-Ebenezer)']),S('Window',['3x3','5x5']),P('Center weight K / trim k',0,12,2,1),P('Impulse tolerance (DBA)',0,16,0,1)],
  [`vec3 x=O(uv).rgb;int md=int(u_p0+.5);int wr=int(u_p1+.5)+1;int K=int(u_p2+.5);float tol=u_p3/255.;
 vec3 v[25];int n=0;int ci=0;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>wr||abs(j)>wr)continue;if(i==0&&j==0)ci=n;v[n]=O(uv+vec2(float(i),float(j))*u_px).rgb;n++;}
 vec3 o=x;float mk=0.;float half_=float(n+2*K+1)*.5;
 for(int c=0;c<3;c++){float med=x[c],cwm=x[c];int rc=0,rg=0;
  for(int k=0;k<25;k++){if(k>=n)break;float lt=0.,le=0.;int r=0;for(int j=0;j<25;j++){if(j>=n)break;float w=j==ci?float(2*K+1):1.;if(v[j][c]<v[k][c])lt+=w;if(v[j][c]<=v[k][c])le+=w;if(v[j][c]<v[k][c]||(v[j][c]==v[k][c]&&j<k))r++;}
   if(r==(n-1)/2)med=v[k][c];if(lt<half_&&le>=half_)cwm=v[k][c];if(v[k][c]<x[c])rc++;if(v[k][c]>x[c])rg++;}
  float pw=c==0?1.:c==1?2.:4.;
  if(md==0)o[c]=cwm;else if(md==1){if(rc<K||rg<K)o[c]=med;}
  else if(x[c]<=tol||x[c]>=1.-tol){if(med>tol&&med<1.-tol)o[c]=med;else mk+=pw;}}
 return vec4(o,mk/8.);`,
   `vec4 t0=T(uv);if(int(u_p0+.5)!=2)return vec4(t0.rgb,1.);float mk=floor(t0.a*8.+.5);vec3 o=t0.rgb;
 for(int c=0;c<3;c++){float pw=c==0?1.:c==1?2.:4.;if(mod(floor(mk/pw),2.)>.5){for(int s_=1;s_<=16;s_++){vec4 l_=T(uv-vec2(float(s_),0.)*u_px);float lm=floor(l_.a*8.+.5);if(mod(floor(lm/pw),2.)<.5){o[c]=l_[c];break;}}}}
 return vec4(o,1.);`],
  'per RGB channel. CWM (Ko & Lee 1991): weighted median with the centre sample repeated 2K+1 times. Rank-conditioned median: the centre is replaced by the window median only when fewer than k window samples are below it or fewer than k above it (centre rank among the k lowest / highest, ties counted in its favour) (order-1 RCRS selection conditioned on the centre rank, Hardie & Barner 1994 / Alparone et al.; trained selection tables are not reproduced). Decision-based (Srinivasan & Ebenezer 2007): only 0 / 255 pixels (within the tolerance) are processed; they take the 3x3 median unless it is itself 0 / 255, then the left neighbour (approx.: parallel, the nearest unflagged pixel to the left instead of the raster-processed value)');

f('q38_ddf','Directional Distance Filter (Karakos-Trahanias)',[P('Distance weight p',0,1,.5,.01),S('Window',['3x3','5x5'])],
  `int wr=int(u_p1+.5)+1;vec3 v[25];int n=0;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>wr||abs(j)>wr)continue;v[n]=O(uv+vec2(float(i),float(j))*u_px).rgb;n++;}
 float best=1e9;vec3 o=O(uv).rgb;
 for(int k=0;k<25;k++){if(k>=n)break;float sa=0.,sd=0.;vec3 a=v[k]+.004;for(int j=0;j<25;j++){if(j>=n)break;vec3 b_=v[j]+.004;sa+=acos(clamp(dot(a,b_)/(length(a)*length(b_)),-1.,1.));sd+=length(v[k]-v[j]);}
  float om=pow(sa+1e-6,1.-u_p0)*pow(sd+1e-6,u_p0);if(om<best){best=om;o=v[k];}}
 return vec4(o,1.);`,
  'Karakos & Trahanias 1997 DDF: output = the window colour vector minimising (sum of angles to the others)^(1-p) x (sum of Euclidean distances)^p; p = 0 gives the BVDF, p = 1 the vector median; p = 0.5 as in Celebi et al. 2007');

const Q38_DPAD = k => `if(${k}.>u_p0+.5)return T(uv);int wr=int(u_p2+.5)+1;float nw=float((2*wr+1)*(2*wr+1));
 vec3 cq[5];vec3 In[5];for(int t=0;t<5;t++){vec2 o_=t==0?vec2(0.):t==1?vec2(1.,0.):t==2?vec2(-1.,0.):t==3?vec2(0.,1.):vec2(0.,-1.);vec2 c0=uv+o_*u_px;
  vec3 s1=vec3(0.),s2=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>wr||abs(j)>wr)continue;vec3 v=T(c0+vec2(float(i),float(j))*u_px).rgb+.004;s1+=v;s2+=v*v;}
  vec3 mu=s1/nw;cq[t]=max((s2-nw*mu*mu)/(nw-1.),0.)/(mu*mu);In[t]=T(c0).rgb;}
 vec3 q0=vec3(u_p3*u_p3);if(u_p3<=0.){vec3 qs[36];for(int bb=0;bb<6;bb++)for(int aa=0;aa<6;aa++){vec2 c0=(floor((vec2(float(aa),float(bb))+.5)/6.*u_res)+.5)/u_res;vec3 s1=vec3(0.),s2=vec3(0.);
   for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>wr||abs(j)>wr)continue;vec3 v=T(c0+vec2(float(i),float(j))*u_px).rgb+.004;s1+=v;s2+=v*v;}vec3 mu=s1/nw;qs[bb*6+aa]=max((s2-nw*mu*mu)/(nw-1.),0.)/(mu*mu);}
  vec3 lo=vec3(0.),hi=vec3(1.);for(int it=0;it<14;it++){vec3 md=(lo+hi)*.5;vec3 cn=vec3(0.);for(int t=0;t<36;t++)cn+=step(qs[t],md);vec3 lt=step(cn,vec3(17.5));lo=mix(lo,md,lt);hi=mix(md,hi,lt);}q0=max((lo+hi)*.5,vec3(1e-5));}
 vec3 cc[5];for(int t=0;t<5;t++)cc[t]=clamp((1.+1./max(cq[t],1e-6))/(1.+1./q0),0.,1.);
 vec3 dv=vec3(0.);for(int t=1;t<5;t++)dv+=.5*(cc[t]+cc[0])*(In[t]-In[0]);return vec4(clamp(In[0]+u_p1*dv,0.,1.),1.);`;
f = add('Repair');
f('q38_dpad','DPAD Detail-Preserving Anisotropic Diffusion (Aja-Fernandez)',[P('Iterations',1,16,10,1),P('Time step',.05,.25,.2,.01),S('Statistics window',['3x3','5x5'],1),P('Noise coeff. of variation Cu (0 = auto)',0,1,0,.01)],
  Array.from({length: 16}, (_, i) => Q38_DPAD(i + 1)),
  'Aja-Fernandez & Alberola-Lopez 2006 (IEEE TIP 15(9)) per RGB channel: SRAD-style explicit diffusion I += dt div(c grad I) with the Kuan-based coefficient c = (1 + 1/Ci^2) / (1 + 1/Cu^2) (clipped to [0,1]), Ci^2 = local variance / mean^2 over a 5x5 (or 3x3) window (unbiased variance); Cu^2 per iteration = median of Ci^2 over a 6x6 sample of windows (or set). Up to 16 iterations (the paper runs hundreds)');

f = add('Sharpen');
f('q38_noneighbors','No-Neighbours Deblurring',[P('PSF radius (2 sigma)',1,40,6,.5,'px'),P('c1 (out-of-focus fraction)',0,.49,.2,.01),P('c2 gain (0 = 1/(1-2 c1))',0,4,0,.05)],
  [BH('u_p0'), `vec3 bl=blur1d(u_tex,uv,vec2(0.,1.),R(u_p0)).rgb;vec3 gi=O(uv).rgb;float c2=u_p2>0.?u_p2:1./(1.-2.*u_p1);return vec4(clamp(c2*(gi-2.*u_p1*bl),0.,1.),1.);`],
  'single-plane no-neighbours deblurring (optical-sectioning microscopy, after Agard 1984): f = c2 [g - 2 c1 (g * h)], the out-of-focus planes above and below approximated by the plane itself blurred with a Gaussian PSF h; default c2 keeps the mean');

f = add('Color');
f('q38_lsac','Local Space Average Colour (Ebner)',[P('Scale L (% of height)',1,100,15,.5),P('Factor f',1,4,2,.05),S('Output',['Corrected','Local space average a'])],
  `float q38r[32]=float[32](.1041,.2059,.2876,.3617,.432,.5002,.5675,.6345,.7018,.7698,.839,.9097,.9823,1.057,1.135,1.215,1.3,1.388,1.482,1.581,1.688,1.802,1.927,2.063,2.215,2.387,2.585,2.82,3.111,3.496,4.071,5.282);
 float Lp=u_p0*.01*u_res.y;vec3 a=vec3(0.);for(int i=0;i<32;i++){float ph=fract(float(i)*.618034);for(int j=0;j<12;j++){float th=6.2831853*(float(j)+ph)/12.;vec3 v=O(uv+vec2(cos(th),sin(th))*q38r[i]*Lp*u_px).rgb;a+=${LIN('v')};}}a/=384.;
 vec3 cl=O(uv).rgb;cl=${LIN('cl')};if(int(u_p2+.5)==1)return vec4(${SRGB('a')},1.);vec3 o=clamp(cl/max(u_p1*a,vec3(1e-4)),0.,1.);return vec4(${SRGB('o')},1.);`,
  'Ebner 2003/2007: each pixel divided by f x its local space average colour (out = c / (2 a), linear light). The iterative 4-neighbour averaging a = p c + (1 - p) avg(a) converges to the screened-Poisson Green function K0(r/L), L^2 = (1-p)/(4p); here it is applied directly by importance sampling (32 radius quantiles of 1 - x K1(x) x 12 angles, approx.: edge-clamped borders instead of the grid boundary)');
