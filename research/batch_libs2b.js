/* ================= libs2b: round-10 library functions II (OpenCV contrib, libvips, spatial / texture sensors, ResolveFX Warper) ================= */
/* orthonormal 8-point DCT-II matrix CM[u*8+x] = a_u cos(pi (2x+1) u / 16) */
const LB2B_DCT = Array.from({length: 64}, (_, k) => { const u = k >> 3, x = k & 7; return ((u ? Math.sqrt(2 / 8) : Math.sqrt(1 / 8)) * Math.cos(Math.PI * (2 * x + 1) * u / 16)).toFixed(8); }).join(',');
/* one decorrelated channel K of OpenCV xphoto::dctDenoising (8×8 patches): every patch covering the pixel is DCT'd, hard-thresholded at 3·sigma, and only this pixel's value is reconstructed, then averaged */
const LB2B_DCTP = K => `const float CM[64]=float[64](${LB2B_DCT});float th=3.*u_p0/255.;bool fast=u_p1>.5;
  vec3 tv=${K === 0 ? 'vec3(.57735027)' : K === 1 ? 'vec3(.70710678,0.,-.70710678)' : 'vec3(.40824829,-.81649658,.40824829)'};
  float v[225];for(int j=0;j<15;j++)for(int i=0;i<15;i++)v[j*15+i]=dot(O(uv+vec2(float(i-7),float(j-7))*u_px).rgb,tv);
  float acc=0.,cnt=0.;float t[64];
  for(int py=0;py<8;py++)for(int px=0;px<8;px++){if(fast&&((px&1)==1||(py&1)==1))continue;
   for(int r=0;r<8;r++)for(int u=0;u<8;u++){float s=0.;for(int x=0;x<8;x++)s+=CM[u*8+x]*v[(py+r)*15+px+x];t[r*8+u]=s;}
   int xr=7-px,yr=7-py;float rec=0.;
   for(int w=0;w<8;w++){float by=CM[w*8+yr];for(int u=0;u<8;u++){float cc=0.;for(int r=0;r<8;r++)cc+=CM[w*8+r]*t[r*8+u];if(abs(cc)>th)rec+=cc*CM[u*8+xr]*by;}}
   acc+=rec;cnt+=1.;}
  float d=acc/cnt;`;
/* two-pass global mean / mean-of-squares reduction (see batch_libs2.js), result r_ (mean) and r2_ (mean of squares) */
const LB2B_MEAN1 = expr => `float s_r=ceil(max(u_res.x,u_res.y)/32.);float st_r=max(1.,s_r/16.);vec2 b_r=floor(floor(uv*u_res)/s_r)*s_r;float r_=0.,r2_=0.,n_r=0.;
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 o_r=vec2(float(i),float(j))*st_r;if(o_r.x>=s_r||o_r.y>=s_r)continue;vec2 pq=b_r+o_r;if(pq.x>=u_res.x||pq.y>=u_res.y)continue;vec2 q_=(pq+.5)/u_res;float e_=${expr};r_+=e_;r2_+=e_*e_;n_r+=1.;}r_/=n_r;r2_/=n_r;`;
const LB2B_MEAN2 = `float s_r=ceil(max(u_res.x,u_res.y)/32.);float r_=0.,r2_=0.,w_r=0.;
  for(int j=0;j<32;j++)for(int i=0;i<32;i++){vec2 pq=vec2(float(i),float(j))*s_r;if(pq.x>=u_res.x||pq.y>=u_res.y)continue;vec2 sz=min(vec2(s_r),u_res-pq);vec4 t_=T((pq+.5)/u_res);float a_=sz.x*sz.y;r_+=t_.g*a_;r2_+=t_.b*a_;w_r+=a_;}r_/=w_r;r2_/=w_r;`;
/* Paillou 1997 recursive filters (OpenCV ximgproc GradientPaillouX/Y) written as their exact impulse responses (truncated at 1e-4):
   poles e^(−a±w); g[n] = (p1^(n+1) − p2^(n+1))/(p1 − p2); derivative kD(m) = a1·sign(m)·g[|m|]; smoothing kS(m) from a0p, a1p, a1m, a2m (eq. 12–14, 25–27) */
const LB2B_PAIL = `float a=u_p0,w=clamp(u_p1,.01,.95*a);float p1=exp(-a+w),p2=exp(-a-w);float ea=exp(-a),chw=cosh(w),shw=sinh(w);
  float b1=-2.*ea*chw,b2=exp(-2.*a),a1=2.*ea*chw-b2-1.;float dd=(1.-2.*ea*chw+b2)/(2.*a*ea*shw+w*(1.-b2));float c1=a*dd,c2=w*dd;
  float a0p=c2,a1p=(c1*shw-c2*chw)*ea,a1m=a1p-c2*b1,a2m=-c2*b2;float N=min(ceil(9.2/(a-w)),48.);
  #define LB2PG(QQ) ((QQ)<0.?0.:(pow(p1,(QQ)+1.)-pow(p2,(QQ)+1.))/(p1-p2))
  `;

f = add('Repair');
f('cv_dctdenoise','DCT Denoising (OpenCV, Yu-Sapiro)',[P('Sigma (levels)',1,60,15,.5),S('Patch shifts',['All 64 (exact)','16 (fast)'])],
  [LB2B_DCTP(0) + `return vec4(d,0.,0.,1.);`, LB2B_DCTP(1) + `return vec4(T(uv).r,d,0.,1.);`,
   LB2B_DCTP(2) + `vec3 y=vec3(T(uv).rg,d);return vec4(y.x*vec3(.57735027)+y.y*vec3(.70710678,0.,-.70710678)+y.z*vec3(.40824829,-.81649658,.40824829),1.);`],
  'OpenCV xphoto::dctDenoising (Yu & Sapiro, IPOL 2011): RGB → orthonormal opponent space, sliding 8×8 DCT patches (OpenCV default psize is 16), coefficients with |c| ≤ 3·sigma zeroed, inverse DCT, all overlapping patch estimates averaged; sigma in 8-bit levels; the fast mode averages 16 of the 64 shifts (approx.)');

f = add('Blur');
f('cv_bilattexture','Bilateral Texture Filter (OpenCV)',[P('Radius fr',1,5,3,1,'px'),P('Sigma avg (0 = 0.05 sqrt 3)',0,.5,0,.005),P('Sigma alpha (0 = 5 fr)',0,50,0,.5)],
  [`int fr=int(min(floor(u_p0*u_k+.5),5.));vec3 B=vec3(0.),mxL=vec3(-9.),mnL=vec3(9.),mxG=vec3(0.),smG=vec3(0.);float n=0.;
   for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>fr||abs(j)>fr)continue;vec2 q=uv+vec2(float(i),float(j))*u_px;vec3 v=T(q).rgb;B+=v;mxL=max(mxL,v);mnL=min(mnL,v);
    vec3 gx=T(q+vec2(u_px.x,0.)).rgb-v,gy=T(q-vec2(0.,u_px.y)).rgb-v;vec3 G=sqrt(gx*gx+gy*gy);mxG=max(mxG,G);smG+=G;n+=1.;}
   vec3 mr=mxG/max(smG,1e-5)*float(2*fr+1)*(mxL-mnL);return vec4(B/n,(mr.r+mr.g+mr.b)/3.);`,
   `int fr=int(min(floor(u_p0*u_k+.5),5.));float sa=u_p2>0.?u_p2:5.*float(fr);float al=1.;vec3 G=T(uv).rgb;
   for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>fr||abs(j)>fr)continue;vec4 t=T(uv+vec2(float(i),-float(j))*u_px);if(al>t.a){al=t.a;G=t.rgb;}}
   vec4 c0=T(uv);float ab=2.*(1./(1.+exp(-sa*(c0.a-al)))-.5);return vec4(ab*G+(1.-ab)*c0.rgb,1.);`,
   `int fr=int(min(floor(u_p0*u_k+.5),5.));int f2=2*fr;float sv=u_p1>0.?u_p1:.0866025;vec3 g0=T(uv).rgb;vec3 acc=vec3(0.);float ws=0.;
   for(int j=-10;j<=10;j++)for(int i=-10;i<=10;i++){if(abs(i)>f2||abs(j)>f2)continue;vec2 q=uv+vec2(float(i),float(j))*u_px;vec3 d=T(q).rgb-g0;float w=exp(-.5*dot(d,d)/(sv*sv))*exp(-float(i*i+j*j)/(2.*float(f2*f2)));acc+=w*O(q).rgb;ws+=w;}
   return vec4(acc/max(ws,1e-5),1.);`],
  'OpenCV ximgproc::bilateralTextureFilter (Cho, Lee, Kang & Lee 2014), one iteration: box mean B and modified relative total variation mRTV per (2fr+1)² patch, guidance G = B of the min-mRTV patch containing the pixel (OpenCV scan order), blended with B by α = 2(sigmoid(σα·ΔmRTV) − 0.5), then a joint bilateral filter (radius 2fr, spatial σ = 2fr, range σ_avg) of the image guided by it');

f = add('Edges');
f('cv_paillou','Paillou Gradient (OpenCV)',[P('Alpha',.2,3,1,.01),P('Omega',0,2.5,.1,.01),S('Output',['Magnitude','X gradient','Y gradient','Direction (hue)']),P('Gain',.1,20,3,.1)],
  [LB2B_PAIL + `float D=0.,S=0.;for(int i=-48;i<=48;i++){float m=float(i);if(abs(m)>N)continue;float v=L(uv+vec2(m,0.)*u_px);float am=abs(m);
    D+=m==0.?0.:a1*sign(m)*LB2PG(am)*v;S+=(m>=1.?a1m*LB2PG(m-1.)+a2m*LB2PG(m-2.):a0p*LB2PG(-m)+a1p*LB2PG(-m-1.))*v;}return vec4(D,S,0.,1.);`,
   LB2B_PAIL + `float gx=0.,gy=0.;for(int i=-48;i<=48;i++){float m=float(i);if(abs(m)>N)continue;vec4 t=T(uv-vec2(0.,m)*u_px);float am=abs(m);
    gy+=m==0.?0.:a1*sign(m)*LB2PG(am)*t.y;gx+=(m>=1.?a1m*LB2PG(m-1.)+a2m*LB2PG(m-2.):a0p*LB2PG(-m)+a1p*LB2PG(-m-1.))*t.x;}
   int o=int(u_p2+.5);float mg=sqrt(gx*gx+gy*gy);if(o==0)return vec4(vec3(clamp(mg*u_p3,0.,1.)),1.);if(o==1)return vec4(vec3(.5+.5*gx*u_p3),1.);if(o==2)return vec4(vec3(.5+.5*gy*u_p3),1.);
   return vec4(hsv2rgb(vec3(atan(gy,gx)/6.28318+.5,.85,clamp(mg*u_p3,0.,1.))),1.);`],
  'OpenCV ximgproc GradientPaillouX / GradientPaillouY (Paillou 1997 SAR step-edge operator): the causal + anticausal 2nd-order recursions (poles e^(−α±ω)) applied as their exact impulse responses, truncated where they fall below 1e-4 (border handling differs from the recursion start values); derivative along one axis, Paillou smoothing along the other; on luma; omega < alpha');

f = add('Blur');
f('cv_wmf','Weighted Median Filter (OpenCV)',[P('Radius',1,5,3,1,'px'),P('Sigma',.01,.5,.1,.005),S('Weight',['Exp (WMF_EXP)','IV1','IV2','Cosine','Jaccard','Off (plain median)'])],
  `float rr=min(floor(u_p0*u_k+.5),5.);int ri=int(rr);float sg=u_p1;int wt=int(u_p2+.5);vec3 c0=c.rgb;vec3 vv[121];float ww[121];int n=0;float W=0.;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>ri||abs(j)>ri)continue;vec3 s=T(uv+vec2(float(i),float(j))*u_px).rgb;vec3 d=s-c0;float w;
   if(wt==0)w=exp(-dot(d,d)/(2.*sg*sg));else if(wt==1)w=1./(abs(d.x)+abs(d.y)+abs(d.z)+sg);else if(wt==2)w=1./(dot(d,d)+sg*sg);
   else if(wt==3)w=dot(s,c0)/max(length(s)*length(c0),1e-6);else if(wt==4)w=(min(s.r,c0.r)+min(s.g,c0.g)+min(s.b,c0.b))/max(max(s.r,c0.r)+max(s.g,c0.g)+max(s.b,c0.b),1e-6);else w=1.;
   vv[n]=s;ww[n]=w;W+=w;n++;}
  vec3 o;for(int ch=0;ch<3;ch++){float best=9.;for(int a=0;a<121;a++){if(a>=n)break;float x=vv[a][ch];if(x>=best)continue;float cum=0.;for(int b=0;b<121;b++){if(b>=n)break;cum+=vv[b][ch]<=x?ww[b]:0.;}if(cum>=.5*W)best=x;}o[ch]=best;}
  return vec4(o,1.);`,
  'OpenCV ximgproc::weightedMedianFilter with the image as its own joint image: per RGB channel the weighted median over the (2r+1)² box, weights from the colour difference to the centre (WMF_EXP exp(−|Δ|²/2σ²), IV1 1/(|Δ|₁+σ), IV2 1/(|Δ|²+σ²), COS, JAC, OFF); sigma in 0..1 units (OpenCV 25.5 = 0.1). OpenCV clusters the joint colours into 256 k-means centres and quantises values to 256 levels — here exact colours (approx. of that quantisation)');

f('cv_brightedges','BrightEdges (OpenCV)',[P('Contrast',0,10,1,1),S('Short range',['3','5','7']),P('Long range',3,31,9,2,'px')],
  [`int ks=int(u_p1+.5);float k3[3]=float[3](.25,.5,.25);float k5[5]=float[5](.0625,.25,.375,.25,.0625);float k7[7]=float[7](.03125,.109375,.21875,.28125,.21875,.109375,.03125);
   int hs=ks+1;vec3 gb=vec3(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>hs||abs(j)>hs)continue;float wi=ks==0?k3[clamp(i+1,0,2)]:ks==1?k5[clamp(i+2,0,4)]:k7[i+3];float wj=ks==0?k3[clamp(j+1,0,2)]:ks==1?k5[clamp(j+2,0,4)]:k7[j+3];gb+=wi*wj*T(uv+vec2(float(i),float(j))*u_px).rgb;}
   int lr=int(min(floor(u_p2*.5),15.));vec3 bb=vec3(0.);float n=0.;for(int j=-15;j<=15;j++)for(int i=-15;i<=15;i++){if(abs(i)>lr||abs(j)>lr)continue;bb+=T(uv+vec2(float(i),float(j))*u_px).rgb;n+=1.;}
   vec3 d=abs(floor(gb*255.+.5)-floor(bb/n*255.+.5));return vec4(vec3(floor(dot(d,vec3(.299,.587,.114))+.5)/255.),1.);`,
   `float v=floor(T(uv).r*255.+.5);float lo=0.,le=0.,mn=1e9,nmn=0.;for(int j=0;j<32;j++)for(int i=0;i<32;i++){float s=floor(T((floor((vec2(float(i),float(j))+.5)/32.*u_res)+.5)/u_res).r*255.+.5);le+=s<=v?1.:0.;if(s<mn){mn=s;nmn=0.;}nmn+=s==mn?1.:0.;}
   float e=nmn>=1024.?v:floor(255.*max(le-nmn,0.)/(1024.-nmn)+.5);return vec4(vec3(e/255.),1.);`,
   `if(u_p0<.5)return T(uv);
   #define LB2E(dx,dy) floor(T(uv+vec2(float(dx),-float(dy))*u_px).r*255.+.5)
   float px=LB2E(0,0)+u_p0-1.;int cn=0;float m2,m1,p1,p2;
   m2=LB2E(-2,-2);m1=LB2E(-1,-1);p1=LB2E(1,1);p2=LB2E(2,2);if(px<=m1&&px<=p1&&px<floor((m1+m2)*.5)&&px<floor((p1+p2)*.5))cn++;
   m2=LB2E(0,-2);m1=LB2E(0,-1);p1=LB2E(0,1);p2=LB2E(0,2);if(px<=m1&&px<=p1&&px<floor((m1+m2)*.5)&&px<floor((p1+p2)*.5))cn++;
   m2=LB2E(2,-2);m1=LB2E(1,-1);p1=LB2E(-1,1);p2=LB2E(-2,2);if(px<=m1&&px<=p1&&px<floor((m1+m2)*.5)&&px<floor((p1+p2)*.5))cn++;
   m2=LB2E(2,0);m1=LB2E(1,0);p1=LB2E(-1,0);p2=LB2E(-2,0);if(px<=m1&&px<=p1&&px<floor((m1+m2)*.5)&&px<floor((p1+p2)*.5))cn++;
   vec2 ip=floor(uv*u_res);bool brd=ip.x<2.||ip.y<2.||ip.x>u_res.x-3.||ip.y>u_res.y-3.;return vec4(vec3(cn>1&&!brd?0.:1.),1.);`,
   `if(u_p0<.5)return T(uv);vec2 ip=floor(uv*u_res);if(ip.x<2.||ip.y<2.||ip.x>u_res.x-3.||ip.y>u_res.y-3.)return vec4(1.);
   #define LB2W(dx,dy) T(uv+vec2(float(dx),-float(dy))*u_px).r
   int ln=0;
   if(LB2W(-2,-1)+LB2W(-1,-1)+LB2W(1,0)+LB2W(2,0)<.5)ln++;
   if(LB2W(-2,0)+LB2W(-1,0)+LB2W(1,1)+LB2W(2,1)<.5)ln++;
   if(LB2W(0,-2)+LB2W(0,-1)+LB2W(1,1)+LB2W(1,2)<.5)ln++;
   if(LB2W(-1,-2)+LB2W(-1,-1)+LB2W(0,1)+LB2W(0,2)<.5)ln++;
   if(LB2W(-2,-2)+LB2W(-2,-1)+LB2W(-1,-2)+LB2W(-1,-1)+LB2W(1,1)+LB2W(2,1)+LB2W(1,2)+LB2W(2,2)<3.5)ln++;
   if(LB2W(0,-2)+LB2W(0,-1)+LB2W(-1,-2)+LB2W(1,-2)+LB2W(0,1)+LB2W(0,2)+LB2W(1,2)+LB2W(-1,2)<3.5)ln++;
   if(LB2W(2,-2)+LB2W(1,-1)+LB2W(-1,-2)+LB2W(2,-1)+LB2W(-1,1)+LB2W(-2,2)+LB2W(-1,2)+LB2W(-2,1)<3.5)ln++;
   if(LB2W(-2,0)+LB2W(-1,0)+LB2W(-2,-1)+LB2W(-2,1)+LB2W(1,0)+LB2W(2,0)+LB2W(2,1)+LB2W(2,-1)<3.5)ln++;
   if(ln==1)return vec4(vec3(0.),1.);float su=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(i!=0||j!=0)su+=LB2W(i,j);
   if(su>7.5||su<.5)return vec4(1.);return vec4(vec3(LB2W(0,0)),1.);`],
  'OpenCV ximgproc::BrightEdges (Bertrand Kerautret): |GaussianBlur(short) − box blur(long)| per channel → grey (BGR2GRAY) → equalizeHist (CDF from a 32×32 sample grid, approx.) → contrast > 0: pixels that are a local minimum along ≥ 2 of 4 directions become black edges, then the 8 line / gap correction rules; contrast 0 = the equalised difference image');

f = add('Tone');
f('cv_bimef','BIMEF Low-Light Fusion (OpenCV)',[P('Exposure ratio k',1,12,5,.1),P('Mu',0,1,.5,.01),P('Smoothing lambda',.05,4,.5,.05),S('Output',['Enhanced','Illumination map t'])],
  [`return vec4(max(c.r,max(c.g,c.b)),0.,0.,1.);`,
   ...[32, 32, 16, 16, 8, 8, 4, 4, 2, 2, 1, 1].map(st => `float s=${st}.*2.*u_k;
   #define LB2BT(o) max(O(uv+(o)*u_px).r,max(O(uv+(o)*u_px).g,O(uv+(o)*u_px).b))
   float t0=LB2BT(vec2(0.));float x0=T(uv).r;float num=t0,den=1.;
   for(int k=0;k<4;k++){vec2 dv=k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.);float dn=LB2BT(dv*s)-t0;float sb=0.;for(int b=-2;b<=2;b++)sb+=LB2BT(dv*s*float(b+1))-LB2BT(dv*s*float(b));
    float w=u_p2/(abs(sb)*abs(dn)+.001);num+=w*T(uv+dv*s*u_px).r;den+=w;}
   return vec4(num/den,0.,0.,1.);`),
   `float tt=clamp(T(uv).r,0.,1.);if(u_p3>.5)return vec4(vec3(tt),1.);float W=pow(tt,u_p1);vec3 I=O(uv).rgb;float ka=pow(u_p0,-.3293);vec3 J=min(vec3(1.),exp((1.-ka)*1.1258)*pow(max(I,0.),vec3(ka)));return vec4(I*W+J*(1.-W),1.);`],
  'OpenCV intensity_transform::BIMEF (Ying, Li & Gao 2017) with a given exposure ratio k: illumination t = max(R,G,B) smoothed by the RTV-weighted least-squares of the paper (weights 1/(|Σ5 ∂t|·|∂t| + 0.001)) — here 12 weighted Jacobi sweeps at strides 32…1 on the half-resolution pixel grid (2 px units) instead of the sparse conjugate-gradient solve (approx.); camera-response BTF J = e^((1−k^a)b)·I^(k^a) (a −0.3293, b 1.1258), fused out = I·t^μ + J·(1 − t^μ); OpenCV picks k by entropy maximisation — here a parameter');

f('vips_wallis','Wallis Filter / Statistical Differencing (libvips)',[P('Window',3,25,11,2,'px'),P('Mean weight A',0,1,.5,.01),P('Deviation weight B',0,1,.5,.01),P('Target deviation s0 (levels)',1,128,50,1)],
  `int h=int(min(floor(u_p0*u_k*.5),12.));vec3 s=vec3(0.),s2=vec3(0.);float n=0.;for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){if(abs(i)>h||abs(j)>h)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px).rgb;s+=v;s2+=v*v;n+=1.;}
  vec3 m=s/n;vec3 sd=sqrt(max(s2/n-m*m,0.));float s0=u_p3/255.;vec3 o=u_p1*(128./255.)+(1.-u_p1)*m+(c.rgb-m)*(u_p2*s0)/(s0+u_p2*sd);return vec4(o,1.);`,
  'libvips stdif (Wallis 1976 statistical differencing): out = A·m0 + (1−A)·mean + (in − mean)·B·s0/(s0 + B·σ) over a W×W window per band, m0 = 128, s0 in 8-bit levels, edge pixels copied outward as in vips');

f = add('Render');
f('vips_zoneplate','Zone Plate (libvips)',[P('Frequency scale',.1,4,1,.05),S('Output',['Zone plate','Multiply image','Add to image'])],
  `vec2 p=floor(uv*u_res);float x=p.x-floor(u_res.x*.5),y=(u_res.y-1.-p.y)-floor(u_res.y*.5);float z=cos(3.14159265/u_res.x*u_p0*(x*x+y*y));float pl=.5+.5*z;int m=int(u_p1+.5);
  if(m==0)return vec4(vec3(pl),1.);if(m==1)return vec4(c.rgb*pl,1.);return vec4(clamp(c.rgb+.5*z*.5,0.,1.),1.);`,
  'libvips zone: cos(π/width · ((x − w/2)² + (y − h/2)²)) on the integer pixel grid (frequency reaches Nyquist at the left/right edges at scale 1), shown as 0.5 + 0.5·z; test pattern for resampling / aliasing');

f = add('Analysis');
f('s2_ngtdm','NGTDM Texture (Amadasun-King)',[S('Feature',['Coarseness','Contrast','Busyness','Complexity','Strength']),P('Window radius',2,8,5,1,'px'),P('Grey levels',4,16,8,1),P('Gain',.1,10,1,.05)],
  [`float Ng=floor(u_p2+.5);
   #define LB2Q(o) (clamp(floor(L(uv+(o)*u_px)*Ng),0.,Ng-1.)+1.)
   float q=LB2Q(vec2(0.));float a=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(i!=0||j!=0)a+=LB2Q(vec2(float(i),float(j)));return vec4(q,abs(q-a/8.),0.,1.);`,
   `int R=int(min(floor(u_p1*u_k+.5),8.));float nn[16],ss[16];for(int k=0;k<16;k++){nn[k]=0.;ss[k]=0.;}float N=0.;
   for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>R||abs(j)>R)continue;vec4 t=T(uv+vec2(float(i),float(j))*u_px);int k=int(t.r+.5)-1;k=clamp(k,0,15);nn[k]+=1.;ss[k]+=t.g;N+=1.;}
   float ps=0.,sst=0.,ngp=0.;for(int k=0;k<16;k++){ps+=nn[k]/N*ss[k];sst+=ss[k];ngp+=nn[k]>0.?1.:0.;}
   int m=int(u_p0+.5);float o=0.;
   if(m==0)o=ps>0.?1./ps:1e6;
   else{float s1=0.,s2=0.;for(int a=0;a<16;a++){if(nn[a]==0.)continue;float pa=nn[a]/N,ia=float(a+1);for(int b=0;b<16;b++){if(nn[b]==0.)continue;float pb=nn[b]/N,ib=float(b+1);
     if(m==1)s1+=pa*pb*(ia-ib)*(ia-ib);else if(m==2)s1+=abs(ia*pa-ib*pb);else if(m==3)s1+=abs(ia-ib)*(pa*ss[a]+pb*ss[b])/(pa+pb);else s1+=(pa+pb)*(ia-ib)*(ia-ib);}}
    if(m==1)o=ngp>1.?s1/(ngp*(ngp-1.))*sst/N:0.;else if(m==2)o=s1>0.?ps/s1:0.;else if(m==3)o=s1/N;else o=sst>0.?s1/sst:0.;}
   float sc=m==0?2.2:m==1?16.:m==2?.5:m==3?.6:.4;return vec4(ramp(1,clamp(o*sc*u_p3,0.,1.)),1.);`],
  'Neighbourhood grey-tone difference matrix (Amadasun & King 1989) in a sliding (2R+1)² window, formulas as in pyradiomics: s_i = Σ|i − Ā| over the pixels of level i (Ā = mean of the 8 neighbours), p_i = n_i/N; coarseness 1/Σp_i s_i, contrast, busyness, complexity, strength; Ng uniform grey levels on luma; display = inferno(value × fixed scale × gain)');
f('s2_spatialstats',"Spatial Autocorrelation: Local Moran's I / Getis-Ord Gi* / Semivariance",[S('Statistic',["Local Moran's I (LISA colours)","Getis-Ord Gi* z-score","Local semivariance (isotropic)","Local semivariance (horizontal lag)"]),P('Radius or lag',1,8,1,1,'px'),P('Window (semivariance)',1,8,4,1,'px'),P('Gain',.1,10,1,.05)],
  [LB2B_MEAN1('luma(O(q_).rgb)') + `return vec4(0.,r_,r2_,1.);`, LB2B_MEAN2 + `return vec4(0.,r_,r2_,1.);`,
   `int m=int(u_p0+.5);float xb=T(uv).g,m2=max(T(uv).b-xb*xb,1e-8);float x0=luma(O(uv).rgb);int r=int(min(floor(u_p1*u_k+.5),8.));
   #define LB2X(o) luma(O(uv+(o)*u_px).rgb)
   if(m==0){float lag=0.,n=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>r||abs(j)>r||(i==0&&j==0))continue;lag+=LB2X(vec2(float(i),float(j)))-xb;n+=1.;}lag/=n;float z=x0-xb;float I=z*lag/m2;
    float mg=clamp(abs(I)*u_p3*.25,0.,1.);vec3 col=z>=0.?(lag>=0.?vec3(1.,.15,.1):vec3(1.,.7,.6)):(lag<0.?vec3(.15,.35,1.):vec3(.6,.8,1.));return vec4(col*mg,1.);}
   if(m==1){float sx=0.,W=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(float(i*i+j*j)>float(r*r))continue;sx+=LB2X(vec2(float(i),float(j)));W+=1.;}float nT=u_res.x*u_res.y;
    float z=(sx-xb*W)/(sqrt(m2)*sqrt((nT*W-W*W)/(nT-1.)));float v=clamp(z*u_p3/8.,-1.,1.);return vec4(v>0.?mix(vec3(.95),vec3(.8,.05,.05),v):mix(vec3(.95),vec3(.05,.2,.8),-v),1.);}
   int w=int(min(floor(u_p2*u_k+.5),8.));float h=float(r);float g=0.,n=0.;
   for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>w||abs(j)>w)continue;vec2 p=vec2(float(i),float(j));float xp=LB2X(p);float d=xp-LB2X(p+vec2(h,0.));g+=d*d;n+=1.;
    if(m==2){float e=xp-LB2X(p+vec2(0.,h));float hd=h*.70710678;float f1=xp-LB2X(p+vec2(hd,hd)),f2=xp-LB2X(p+vec2(hd,-hd));g+=e*e+f1*f1+f2*f2;n+=3.;}}
   g/=2.*n;return vec4(ramp(1,clamp(sqrt(g)*u_p3*4.,0.,1.)),1.);`],
  "Local indicators of spatial association on luma (global mean / variance by a two-pass block reduction): Anselin local Moran's I = z_i·mean_{j∈window, j≠i}(z_j)/m2 (row-standardised queen weights at radius 1; colours HH red, LL blue, HL pink, LH light blue, brightness |I|; no permutation significance); Getis-Ord Gi* z-score with binary disc weights incl. self (red hot spot / blue cold spot); local semivariance γ(h) = Σ(x_p − x_p+h)²/2N over the window, isotropic = 4 directions (diagonals bilinear, approx.), shown as sqrt(γ)");
f('s2_peli','Peli Band-Limited Contrast',[P('Band (octave)',1,6,3,1),S('Output',['Signed contrast','Contrast magnitude']),P('Gain',.5,20,4,.1),S('Luminance',['sRGB values','Linear luminance'])],
  [`float s1=pow(2.,u_p0-1.)*u_k,s2=2.*s1;float rr=ceil(3.*s2);float st=max(1.,rr/48.);float a=0.,b=0.,wa=0.,wb=0.;for(int i=-48;i<=48;i++){float x=float(i)*st;if(abs(x)>rr)continue;vec3 v3=T(uv+vec2(x,0.)*u_px).rgb;float v=u_p3>.5?luma(pow(max(v3,0.),vec3(2.2))):luma(v3);
    float ga=exp(-x*x/(2.*s1*s1)),gb=exp(-x*x/(2.*s2*s2));a+=ga*v;b+=gb*v;wa+=ga;wb+=gb;}return vec4(a/wa,b/wb,0.,1.);`,
   `float s1=pow(2.,u_p0-1.)*u_k,s2=2.*s1;float rr=ceil(3.*s2);float st=max(1.,rr/48.);float a=0.,b=0.,wa=0.,wb=0.;for(int i=-48;i<=48;i++){float x=float(i)*st;if(abs(x)>rr)continue;vec4 t=T(uv+vec2(0.,x)*u_px);
    float ga=exp(-x*x/(2.*s1*s1)),gb=exp(-x*x/(2.*s2*s2));a+=ga*t.r;b+=gb*t.g;wa+=ga;wb+=gb;}a/=wa;b/=wb;float cc=(a-b)/max(b,.004);
   return vec4(vec3(u_p1>.5?clamp(abs(cc)*u_p2,0.,1.):clamp(.5+.5*cc*u_p2,0.,1.)),1.);`],
  'Peli 1990 local band-limited contrast c_i = a_i / l_i: band-pass a_i and the low-pass l_i below it — here difference of Gaussians (σ = 2^(band−1) px and 2σ) and the 2σ Gaussian instead of the cosine-log FFT filters (approx.); signed or magnitude, on sRGB luma or linear luminance');
f('s2_sml','Sum-Modified Laplacian (SML)',[P('Step',1,4,1,1,'px'),P('Window N',0,6,2,1,'px'),P('Threshold T',0,.2,0,.002),P('Gain',.1,20,3,.1)],
  `float st=floor(u_p0*u_k+.5);int N=int(min(floor(u_p1*u_k+.5),6.));float sm=0.,n=0.;
  for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){if(abs(i)>N||abs(j)>N)continue;vec2 q=uv+vec2(float(i),float(j))*u_px;float l=L(q);
   float ml=abs(2.*l-L(q-vec2(st*u_px.x,0.))-L(q+vec2(st*u_px.x,0.)))+abs(2.*l-L(q-vec2(0.,st*u_px.y))-L(q+vec2(0.,st*u_px.y)));sm+=ml>=u_p2?ml:0.;n+=1.;}
  return vec4(ramp(1,clamp(sm/n*u_p3*4.,0.,1.)),1.);`,
  'Nayar & Nakagawa 1994 shape-from-focus measure: modified Laplacian ML = |2I − I(x−s) − I(x+s)| + |2I − I(y−s) − I(y+s)|, summed over the (2N+1)² window where ML ≥ T; shown as window mean × gain (inferno)');

f = add('Distort');
f('rfx_warper','Warper (ResolveFX)',[P('Point X',0,1,.5,.005),P('Point Y',0,1,.5,.005),P('Drag X',-.4,.4,.12,.005),P('Drag Y',-.4,.4,.06,.005)],
  `vec2 a=vec2(asp(),1.);vec2 qp=uv*a;vec2 dv=vec2(u_p2,-u_p3)*a;vec2 dst=vec2(u_p0,1.-u_p1)*a+dv;
  float w0=1./max(dot(qp-dst,qp-dst),1e-9);float db=max(min(min(qp.x,a.x-qp.x),min(qp.y,1.-qp.y)),1e-5);float wb=1./(db*db);
  vec2 D=dv*w0/(w0+wb);return vec4(O((qp-D)/a).rgb,1.);`,
  'ResolveFX Warper (point warp), approx.: one control point dragged from (X, Y) by (Drag X, Drag Y) with the frame border pinned; displacement field = Shepard inverse-distance² blend of the drag and the zero border, sampled backwards from the destination');
