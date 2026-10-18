/* ================= q35b: contrast & low-light enhancement from the literature (Fu 2016 MF, Ying 2017 camera response, alpha rooting, LIP / PLIP, Toet ratio pyramid, rational UM) ================= */
f = add('Tone');
f('q35_fu_mf','Fusion-Based Low-Light Enhancement (Fu 2016)',[P('Guided radius',2,40,10,1,'px'),P('CLAHE window',16,300,96,1,'px'),P('CLAHE strength',0,1,.6,.01),S('Output',['Enhanced','Estimated illumination I','Fused illumination'])],
 [`return vec4(max(c.r,max(c.g,c.b)),0.,0.,1.);`,
  `float m=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(i*i+j*j>10)continue;m=max(m,T(uv+vec2(float(i),float(j))*R(1.)*u_px).r);}return vec4(m,0.,0.,1.);`,
  `float m=1.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(i*i+j*j>10)continue;m=min(m,T(uv+vec2(float(i),float(j))*R(1.)*u_px).r);}return vec4(m,0.,0.,1.);`,
  `float st=R(u_p0)/3.;float mg=0.,mp=0.,mgp=0.,mgg=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*st*u_px;vec3 o=O(q).rgb;float g=max(o.r,max(o.g,o.b));float p=T(q).r;mg+=g;mp+=p;mgp+=g*p;mgg+=g*g;}
  mg/=49.;mp/=49.;mgp/=49.;mgg/=49.;float a=(mgp-mg*mp)/(mgg-mg*mg+.001);float b=mp-a*mg;return vec4(.5+.25*a,.5+.5*b,0.,1.);`,
  `float st=R(u_p0)/3.;vec2 ab=vec2(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec4 t=T(uv+vec2(float(i),float(j))*st*u_px);ab+=vec2(4.*(t.r-.5),2.*(t.g-.5));}ab/=49.;
  vec3 o=O(uv).rgb;return vec4(clamp(ab.x*max(o.r,max(o.g,o.b))+ab.y,0.,1.),0.,0.,1.);`,
  `float I=clamp(T(uv).r,.02,1.);float im=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++)im+=T((vec2(float(i),float(j))+.5)/12.).r;im=clamp(im/144.,.02,1.);
  float lam=10.+(1.-im)/im;float I2=.63662*atan(lam*I);float ws=R(u_p1)/8.;float cdf=0.;
  for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++)cdf+=smoothstep(-.03,.03,I-T(uv+vec2(float(i),float(j))*ws*u_px).r);float I3=mix(I,cdf/81.,u_p2);
  vec3 hsv=rgb2hsv(O(uv).rgb);float wc=1.+cos(2.*6.2831853*hsv.x+4.3633231)*hsv.y;vec3 Ik=vec3(I,I2,I3);vec3 W=exp(-(Ik-.5)*(Ik-.5)/.125)*Ik*max(wc,0.)+1e-5;W/=W.x+W.y+W.z;float If=dot(W,Ik);
  int om=int(u_p3+.5);if(om==1)return vec4(vec3(I),1.);if(om==2)return vec4(vec3(If),1.);return vec4(clamp(O(uv).rgb*If/I,0.,1.),1.);`],
 'Fu, Zeng, Huang, Liao, Ding & Paisley 2016 (Signal Processing 129): illumination L = max(R,G,B), morphological closing with a 7x7 disk, refined by a guided filter guided by the HSV V channel; reflectance = S/I; inputs I1 = I, I2 = (2/pi) arctan(lambda I) with lambda = 10 + (1 - mean I)/mean I, I3 = CLAHE(I); weights W_B = exp(-(I_k - .5)^2 / (2 x .25^2)) and chromatic W_C = I_k (1 + cos(alpha H + phi) S) with alpha 2, phi 250 deg; output = R x sum normalised W_k I_k. Approx.: CLAHE replaced by a clipped local rank equalisation (strength = mix), guided-filter eps .001, and single-scale (naive) fusion instead of the 6-level Laplacian / Gaussian pyramids');
f('q35_lecarm','Camera Response Low-Light Enhancement (Ying 2017 / LECARM)',[S('Camera model',['Beta-Gamma','Preferred','Affine','Beta']),P('Max exposure ratio',1,12,7,.1),P('Smoothing lambda',.05,4,.5,.05),S('Output',['Enhanced','Illumination map T'])],
 [`return vec4(max(c.r,max(c.g,c.b)),0.,0.,1.);`,
  ...[32, 32, 16, 16, 8, 8, 4, 4, 2, 2, 1, 1].map(st => `float s=${st}.*2.*u_k;
#define Q35BT(o) max(O(uv+(o)*u_px).r,max(O(uv+(o)*u_px).g,O(uv+(o)*u_px).b))
  float t0=Q35BT(vec2(0.));float num=t0,den=1.;
  for(int k=0;k<4;k++){vec2 dv=k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.);float dn=Q35BT(dv*s)-t0;float sb=0.;for(int b=-2;b<=2;b++)sb+=Q35BT(dv*s*float(b+1))-Q35BT(dv*s*float(b));
   float w=u_p2/(abs(sb)*abs(dn)+.001);num+=w*T(uv+dv*s*u_px).r;den+=w;}
  return vec4(num/den,0.,0.,1.);`),
  `float T0=clamp(T(uv).r,.001,1.);if(u_p3>.5)return vec4(vec3(T0),1.);float K=min(1./T0,u_p1);vec3 I=max(O(uv).rgb,0.);int md=int(u_p0+.5);vec3 J;
  if(md==0){float ka=pow(K,-.3293);J=exp((1.-ka)*1.1258)*pow(I,vec3(ka));}
  else if(md==1){float ka=pow(K,4.3536);J=I*pow(K,4.3536*.1447)/pow(pow(I,vec3(1./.1447))*(ka-1.)+1.,vec3(.1447));}
  else if(md==2){float kg=pow(K,.3988);J=I*kg-.1797*(1.-kg);}
  else J=I*pow(K,.48);
  return vec4(clamp(J,0.,1.),1.);`],
 'Ying, Li, Ren, Wang & Wang 2017 (ICCVW, "A new low-light image enhancement algorithm using camera response model"; journal version LECARM, Ren et al.) after the authors\' code: T = max(R,G,B) refined by the RTV-weighted least squares (weights 1/(|sum5 dT| |dT| + .001), lambda) on the half-resolution grid, exposure ratio K = min(1/T, 7), each pixel moved to its exposure by the camera brightness-transform g(P,K): Beta-Gamma e^(b(1-K^a)) P^(K^a) (a -.3293, b 1.1258), Preferred (a 4.3536, c .1447), Affine (alpha -.1797, gamma .3988), Beta (c .48); no fusion. Approx.: 12 weighted Jacobi sweeps at strides 32..1 instead of the PCG solve');
f('q35_alpharoot','Alpha Rooting (block DCT, Aghagolzadeh-Ersoy 1992)',[P('Alpha',.3,1.2,.8,.01),S('Channels',['Luma','RGB'])],
  `float cs[64];for(int k=0;k<64;k++){int u=k/8,x=k%8;cs[k]=(u==0?.35355339:.5)*cos(3.14159265*(2.*float(x)+1.)*float(u)/16.);}
  vec3 o=O(uv).rgb;vec3 res=o;int nc=u_p1>.5?3:1;
  for(int ch=0;ch<3;ch++){if(ch>=nc)break;float l[64];for(int k=0;k<64;k++){vec3 v=O(uv+vec2(float(k%8)-4.,float(k/8)-4.)*R(1.)*u_px).rgb;l[k]=nc==1?luma(v):v[ch];}
   float rw[64];for(int y=0;y<8;y++)for(int u=0;u<8;u++){float a=0.;for(int x=0;x<8;x++)a+=l[y*8+x]*cs[u*8+x];rw[y*8+u]=a;}
   float X[64];for(int v=0;v<8;v++)for(int u=0;u<8;u++){float a=0.;for(int y=0;y<8;y++)a+=rw[y*8+u]*cs[v*8+y];X[v*8+u]=a;}
   float dc=abs(X[0])+1e-4;float Y=0.;for(int k=0;k<64;k++){float xv=X[k]*pow(abs(X[k])/dc+1e-7,u_p0-1.);Y+=cs[(k/8)*8+4]*cs[(k%8)*8+4]*xv;}
   if(nc==1)res=o+(Y-l[36]);else res[ch]=Y;}
  return vec4(clamp(res,0.,1.),1.);`,
 'Alpha rooting X\' = X |X|^(alpha-1), normalised so the DC term is unchanged, in an 8x8 orthonormal DCT (one of the block transforms of Aghagolzadeh & Ersoy 1992, Opt. Eng. 31(3)); evaluated per pixel on the sliding block (maximal overlap-save, no block edges), keeping the reconstructed sample at the block position of the pixel. alpha < 1 boosts the high-frequency (low-magnitude) coefficients relative to DC. The classic whole-image DFT version needs an FFT and is not built');
f('q35_lip','Logarithmic Image Processing LIP (Jourlin-Pinoli)',[S('Operation',['Scalar multiplication','Dynamic expansion (optimal lambda)','LIP unsharp (f + k(f - mean))'],2),P('Lambda / k',.1,4,1.6,.01),P('Radius',1,40,8,1,'px')],
 [BH('u_p2'), BV('u_p2'),
  `int md=int(u_p0+.5);vec3 I=clamp(O(uv).rgb,.002,.998);vec3 f=1.-I;
  if(md==0)return vec4(pow(I,vec3(u_p1)),1.);
  if(md==1){float mn=1.,mx=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float l=luma(O((vec2(float(i),float(j))+.5)/16.).rgb);mn=min(mn,l);mx=max(mx,l);}
   float a=clamp(mn,.002,.99),b=clamp(mx,a+.005,.998);float l0=log(log(a)/log(b))/log(b/a);return vec4(pow(I,vec3(l0)),1.);}
  vec3 fb=1.-clamp(T(uv).rgb,.002,.998);vec3 g=(f-fb)/(1.-fb);vec3 kg=1.-pow(max(1.-g,1e-4),vec3(u_p1));vec3 fo=f+kg-f*kg;return vec4(clamp(1.-fo,0.,1.),1.);`],
 'Jourlin & Pinoli LIP model on grey tones f = M - I (M = 1): f + g = f+g-fg/M, f - g = (f-g)/(1-g/M), lambda x f = M - M(1-f/M)^lambda. Scalar multiplication (on intensities = I^lambda); dynamic expansion with the lambda that maximises lambda x fmax - lambda x fmin, lambda0 = ln(ln a / ln b) / ln(b/a) with a = 1-fmax/M, b = 1-fmin/M (min / max from a 16x16 sample grid); LIP unsharp f (+) k (x) (f (-) Gaussian mean of f) built from the same LIP operations');
f('q35_plip','Parameterized LIP PLIP (Panetta 2008)',[S('Operation',['Scalar multiplication','PLIP unsharp (g + c(g - mean))'],1),P('c',.1,4,1.8,.01),P('gamma and k (x M)',1,8,4.008,.01),P('Radius',1,40,8,1,'px')],
 [BH('u_p3'), BV('u_p3'),
  `int md=int(u_p0+.5);float G=u_p2;vec3 g=1.-clamp(O(uv).rgb,0.,1.);vec3 go;
  if(md==0)go=G-G*pow(max(1.-g/G,0.),vec3(u_p1));
  else{vec3 gb=1.-clamp(T(uv).rgb,0.,1.);vec3 d=G*(g-gb)/(G-gb);vec3 kd=G-G*pow(max(1.-d/G,1e-5),vec3(u_p1));go=g+kd-g*kd/G;}
  return vec4(clamp(1.-go,0.,1.),1.);`],
 'Panetta, Wharton & Agaian PLIP model (IEEE TSMC-B, 2008/2011) on grey tones g = mu(M) - f with mu = M = 1: a (+) b = a+b-ab/gamma(M), a (-) b = k(M)(a-b)/(k(M)-b), c (x) a = gamma(M) - gamma(M)(1 - a/gamma(M))^c, gamma = k (default 1026/256 x M as recommended; gamma = k = M gives classic LIP). Scalar multiplication, and PLIP unsharp g (+) c (x) (g (-) Gaussian mean of g)');
f('q35_toet','Ratio of Low-Pass Pyramid Contrast (Toet 1989)',[P('Contrast gain',.3,3,1.6,.01),S('Levels',['2','3','4'],2),P('Base gain',0,1.5,1,.01)],
 [`vec4 sg=vec4(1.,2.,4.,8.)*u_k;vec4 a=vec4(0.),w=vec4(0.);for(int i=-12;i<=12;i++){float t=float(i)/4.;float g=exp(-.5*t*t);for(int k=0;k<4;k++){a[k]+=g*luma(O(uv+vec2(t*sg[k],0.)*u_px).rgb);w[k]+=g;}}return a/w;`,
  `vec4 sg=vec4(1.,2.,4.,8.)*u_k;vec4 a=vec4(0.),w=vec4(0.);for(int i=-12;i<=12;i++){float t=float(i)/4.;float g=exp(-.5*t*t);for(int k=0;k<4;k++){a[k]+=g*T(uv+vec2(0.,t*sg[k])*u_px)[k];w[k]+=g;}}return a/w;`,
  `vec4 Gs=T(uv)+.01;float G0=luma(O(uv).rgb)+.01;int nl=int(u_p1+.5)+2;float y=1.;float prev=G0;float base=Gs[0];
  for(int k=0;k<4;k++){if(k>=nl)break;float nx=Gs[k];y*=pow(prev/nx,u_p0);prev=nx;base=nx;}
  float im=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)im+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb);im=im/64.+.01;
  y*=im*pow(base/im,u_p2);return vec4(clamp(O(uv).rgb*(y-.01)/(G0-.01+1e-4),0.,1.),1.);`],
 'Toet 1989 ratio-of-low-pass (contrast) pyramid R_k = G_k / G_(k+1), image = G_N x prod R_k; contrast enhancement by raising every ratio to a gain (R_k^g) and the base level about the image mean (base gain), applied to luma and transferred to RGB as a ratio. Approx.: undecimated Gaussian levels (sigma 1, 2, 4, 8 px) instead of REDUCE / EXPAND subsampling');
f('q35_rum','Rational Unsharp Masking (Ramponi 1996)',[P('Lambda',0,3,.8,.01),P('d1 (levels)',1,60,6,.5),P('d2 (levels)',2,160,40,.5),P('Spacing',1,4,1,.1,'px')],
  `vec2 ex=vec2(R(u_p3)*u_px.x,0.),ey=vec2(0.,R(u_p3)*u_px.y);vec3 x0=O(uv).rgb,xl=O(uv-ex).rgb,xr=O(uv+ex).rgb,xu=O(uv-ey).rgb,xd=O(uv+ey).rgb;
  float d1=u_p1/255.,d2=max(u_p2,u_p1+1.)/255.;float k=1./(d1*d1+d2*d2),h=d1*d1*d2*d2/(d1*d1+d2*d2);vec3 dx=xl-xr,dy=xu-xd;
  vec3 cx=dx*dx/(k*dx*dx*dx*dx+h),cy=dy*dy/(k*dy*dy*dy*dy+h);return vec4(clamp(x0+u_p0*((2.*x0-xl-xr)*cx+(2.*x0-xu-xd)*cy),0.,1.),1.);`,
 'Ramponi & Polesel rational unsharp masking: y = x + lambda (z_x c(d_x) + z_y c(d_y)), z = 2x(n) - x(n-1) - x(n+1), edge sensor d = x(n-1) - x(n+1), rational control c(d) = d^2 / (k d^4 + h) with k = 1/(d1^2+d2^2), h = d1^2 d2^2/(d1^2+d2^2) (c is largest for medium edges between d1 and d2: low on noise, no overshoot on strong edges); per RGB channel');
