/* ================= q37: dehazing & underwater restoration priors, fusion enhancement, ICM / UCM, local thresholds, skin models (round 16 literature) ================= */
const Q37_G16 = `(vec2(float(i),float(j))+.5)/16.`;
const Q37_MN = (dir, skip) => `${skip}vec4 m=T(uv);float r=R(u_p1);float st=max(1.,r/24.);for(int i=-24;i<=24;i++){float o=float(i)*st;if(abs(o)>r)continue;m=min(m,T(uv+${dir}*o*u_px));}return m;`;
const Q37_JB = `vec3 g0=O(uv).rgb;vec4 s=vec4(0.);float ws=0.;float st=max(R(u_p1)*.35,1.);for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 d=vec2(float(i),float(j));vec2 p=uv+d*st*u_px;vec3 g=O(p).rgb-g0;float w=exp(-dot(d,d)/10.-dot(g,g)*60.);s+=T(p)*w;ws+=w;}return s/ws;`;

f = add('Repair');
f('q37_uwprior','Underwater & Haze Priors (Median DCP, UDCP, Red Channel, MIP, ULAP)',[S('Prior',['Median dark channel (Gibson 2012)','UDCP green-blue dark channel (Drews 2013)','Red channel prior (Galdran 2015)','Maximum intensity prior (Carlevaris-Bianco 2010)','ULAP light attenuation prior (Song 2018)']),P('Patch',2,30,7,1,'px'),P('Strength',0,1,.9,.01),S('Output',['Restored','Transmission'])],
  [`int m=int(u_p0+.5);vec3 o=c.rgb;if(m==1)return vec4(o.g,o.b,min(o.g,o.b),1.);if(m==2)return vec4(1.-o.r,o.g,o.b,1.);if(m==3)return vec4(1.-o.r,1.-max(o.g,o.b),0.,1.);return vec4(o,1.);`,
   Q37_MN('vec2(1.,0.)','if(u_p0<.5||u_p0>3.5)return T(uv);'), Q37_MN('vec2(0.,1.)','if(u_p0<.5||u_p0>3.5)return T(uv);'),
   `int m=int(u_p0+.5);vec4 q=T(uv);vec3 o=O(uv).rgb;vec3 A=vec3(.8);float t=1.;float w=u_p2;
 #define Q37D(V0) (.53214829+.51309827*max((V0).g,(V0).b)-.91066194*(V0).r)
 if(m==0){float v[25];float st=R(u_p1)*.5;for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec3 s=O(uv+vec2(float(i-2),float(j-2))*st*u_px).rgb;v[j*5+i]=min(s.r,min(s.g,s.b));}
  float md=v[12];for(int i=0;i<25;i++){int lt=0,le=0;for(int k=0;k<25;k++){lt+=v[k]<v[i]?1:0;le+=v[k]<=v[i]?1:0;}if(lt<=12&&le>12)md=v[i];}
  float mx=.05;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=O(${Q37_G16}).rgb;mx=max(mx,min(s.r,min(s.g,s.b)));}A=vec3(mx);t=1.-w*md/mx;}
 else if(m==1){float bm=-1.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 g=${Q37_G16};float d=T(g).b;if(d>bm){bm=d;A=O(g).rgb;}}A=max(A,vec3(.05));t=1.-w*min(q.r/A.g,q.g/A.b);}
 else if(m==2){float rc[256];float mx=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec4 s=T(${Q37_G16});float v=min(s.r,min(s.g,s.b));rc[j*16+i]=v;mx=max(mx,v);}
  float lo=0.,hi=mx;for(int it=0;it<10;it++){float th=.5*(lo+hi);int n=0;for(int k=0;k<256;k++)n+=rc[k]>=th?1:0;if(n>26)lo=th;else hi=th;}
  float br=2.;for(int k=0;k<256;k++){if(rc[k]<lo)continue;vec3 s=O((vec2(float(k-(k/16)*16),float(k/16))+.5)/16.).rgb;if(s.r<br){br=s.r;A=s;}}
  A=clamp(A,vec3(.05),vec3(.95));t=1.-w*min(q.r/(1.-A.r),min(q.g/A.g,q.b/A.b));}
 else if(m==3){float D=q.g-q.r;float dm=-2.,dn=2.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 g=${Q37_G16};vec4 s=T(g);float d=s.g-s.r;dm=max(dm,d);if(d<dn){dn=d;A=O(g).rgb;}}t=1.-w*(dm-D);}
 else{float dmin=9.,dmax=-9.,bn=-1.;vec3 B=vec3(.5);
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){float d=Q37D(O(${Q37_G16}).rgb);dmin=min(dmin,d);dmax=max(dmax,d);}float dr=max(dmax-dmin,1e-3);
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=O(${Q37_G16}).rgb;if((Q37D(s)-dmin)/dr>.97&&length(s)>bn){bn=length(s);B=s;}}
  float d0=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 e=abs(B-O(${Q37_G16}).rgb)/max(B,1.-B);d0=max(d0,max(e.r,max(e.g,e.b)));}
  A=B;t=.5*((Q37D(o)-dmin)/dr+1.-d0);}
 return vec4(clamp(t,0.,1.),clamp(A,0.,1.));`,
   Q37_JB,
   `int m=int(u_p0+.5);vec4 q=T(uv);vec3 o=O(uv).rgb;vec3 A=q.gba;vec3 t=vec3(q.r);if(m==4)t=pow(vec3(.83,.95,.97),vec3(16.*q.r*u_p2));t=max(t,vec3(.1));if(u_p3>.5)return vec4(t,1.);return vec4(clamp((o-A)/t+A,0.,1.),1.);`],
  'single-image restoration I = J t + A (1 - t), J = (I - A)/max(t, 0.1) + A; transmission smoothed by a joint bilateral pass instead of guided filter / soft matting; airlight from a 16x16 sample grid. Median DCP (Gibson, Vo & Nguyen 2012): dark channel = median (not minimum) of min_c I over the patch, gray A = max dark value, t = 1 - w dark / A. UDCP (Drews et al. 2013): dark channel of G and B only, A = pixel at the brightest G-B dark channel, t = 1 - w min_patch min(I_G/A_G, I_B/A_B). Red channel prior (Galdran et al. 2015): t = 1 - w min(min_patch (1-I_R)/(1-A_R), min_patch I_G/A_G, min_patch I_B/A_B), A = the sample with the lowest red among the 10% highest red-channel values (saturation term omitted). MIP (Carlevaris-Bianco, Mohan & Eustice 2010): D = max_patch R - max_patch max(G,B), t = D + 1 - max D, A = pixel of minimum t. ULAP (Song et al. 2018): relative depth d = 0.53214829 + 0.51309827 max(G,B) - 0.91066194 R stretched to 0..1, B = brightest of the farthest samples, d0 = 1 - max |B - I| / max(B, 1 - B), t_c = Nrer_c^(8 (d + d0)) with Nrer = 0.83 / 0.95 / 0.97 (reference implementation); Strength scales the haze term');

f('q37_nightprior','Night & Low-Light Priors (Maximum Reflectance, Bright Channel)',[S('Prior',['Maximum reflectance prior (Zhang 2017)','Bright channel prior (Shi 2018)']),P('Patch',2,30,7,1,'px'),P('Strength',0,1,.8,.01),S('Output',['Restored','Transmission'])],
  [`vec3 o=c.rgb;return u_p0>.5?vec4(o,1.-max(o.r,max(o.g,o.b))):vec4(1.-o,1.);`,
   Q37_MN('vec2(1.,0.)',''), Q37_MN('vec2(0.,1.)',''),
   `vec4 q=T(uv);vec3 o=O(uv).rgb;float w=u_p2;
 if(u_p0<.5){vec3 A=max(1.-q.rgb,vec3(.02));float dk=1.;float st=R(u_p1)*.5;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 p=uv+vec2(float(i),float(j))*st*u_px;vec3 v=O(p).rgb/max(1.-T(p).rgb,vec3(.02));dk=min(dk,min(v.r,min(v.g,v.b)));}return vec4(clamp(1.-w*dk,0.,1.),A);}
 float br[256];float mx=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float b=1.-T(${Q37_G16}).a;br[j*16+i]=b;mx=max(mx,b);}
 float lo=0.,hi=mx;for(int it=0;it<10;it++){float th=.5*(lo+hi);int n=0;for(int k=0;k<256;k++)n+=br[k]>=th?1:0;if(n>26)lo=th;else hi=th;}
 vec3 A=vec3(0.);float na=0.;for(int k=0;k<256;k++){if(br[k]<lo)continue;A+=O((vec2(float(k-(k/16)*16),float(k/16))+.5)/16.).rgb;na+=1.;}A/=max(na,1.);
 float Ac=min(max(A.r,max(A.g,A.b)),.98);float tn=9.,tx=-9.;for(int k=0;k<256;k++){float ti=(br[k]-Ac)/(1.-Ac);tn=min(tn,ti);tx=max(tx,ti);}
 float bx=1.-q.a;float ti=((bx-Ac)/(1.-Ac)-tn)/max(tx-tn,1e-3);float dI=min(q.r,min(q.g,q.b));vec3 qa=q.rgb/max(A,vec3(.02));
 if(bx-dI<.4)ti*=1.-w*min(qa.r,min(qa.g,qa.b));return vec4(clamp(ti,0.,1.),A);`,
   Q37_JB,
   `vec4 q=T(uv);vec3 o=O(uv).rgb;vec3 A=q.gba;float t=max(q.r,.1);if(u_p3>.5)return vec4(vec3(q.r),1.);
 if(u_p0<.5){vec3 Rf=(o/max(A,vec3(.02))-1.)/t+1.;return vec4(clamp(Rf*max(A.r,max(A.g,A.b)),0.,1.),1.);}
 float jn=9.,jx=-9.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 g=${Q37_G16};vec4 s=T(g);vec3 J=(O(g).rgb-s.gba)/max(s.r,.1)+s.gba;jn=min(jn,min(J.r,min(J.g,J.b)));jx=max(jx,max(J.r,max(J.g,J.b)));}
 vec3 J=(o-A)/t+A;return vec4(clamp((J-jn)/max(jx-jn,1e-3),0.,1.),1.);`],
  'night / low-light scattering priors; transmission smoothed by a joint bilateral pass instead of a guided filter. Maximum reflectance prior (Zhang, Cao, Fang, Kang & Chen 2017), approx.: nighttime model I = L eta R t + L eta (1 - t); the local per-channel patch maximum estimates the ambient illumination L eta, a dark channel of I / (L eta) gives t = 1 - w dark, reflectance R = (I/(L eta) - 1)/t + 1 is shown re-lit by L = max_c (L eta), i.e. the coloured glow cast removed. Bright channel prior (Shi et al. 2018, as in the LearnOpenCV reference code): bright channel = patch max of max_c, A = mean of the 10% brightest bright-channel samples, t = (bright - max A)/(1 - max A) min-max normalised, multiplied by the dark-channel transmission 1 - w dark(I/A) where bright - dark < 0.4, J = (I - A)/max(t, 0.1) + A min-max normalised (detail-enhance post-filters omitted)');

const Q37_WBDEF = `int m=int(u_p0+.5);vec3 mu=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++)mu+=O(${Q37_G16}).rgb;mu/=256.;
 float cr=mu.r;if(m==0){cr=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=O(${Q37_G16}).rgb;cr+=s.r+(mu.g-mu.r)*(1.-s.r)*s.g;}cr/=256.;}
 vec3 mc=vec3(cr,mu.g,mu.b);vec3 gain=((mc.r+mc.g+mc.b)/3.)/max(mc,vec3(.02));
 #define Q37WB(V0) (m==2?(V0):clamp(vec3((V0).r+(m==0?(mu.g-mu.r)*(1.-(V0).r)*(V0).g:0.),(V0).g,(V0).b)*gain,0.,1.))
`;
f = add('Tone');
f('q37_fusion','Fusion Enhancement (Ancuti Underwater 2018, Ancuti Dehaze 2013, AMEF)',[S('Method',['Underwater colour balance + fusion (Ancuti 2018)','Fusion dehazing (Ancuti 2013)','AMEF multi-exposure dehaze (Galdran 2018)']),P('Radius',2,40,12,1,'px'),P('Strength',0,1,1,.01)],
  [Q37_WBDEF+`return vec4(Q37WB(c.rgb),1.);`, BH('u_p1'), BV('u_p1'),
   Q37_WBDEF+`float Ib=luma(mu);float gam=2.*(.5+Ib);
 #define Q37LAB(V0) vec3(luma(V0),(V0).r-(V0).g,.5*((V0).r+(V0).g)-(V0).b)
 vec3 dn=vec3(9.),dx=vec3(-9.),lm=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 g=${Q37_G16};vec3 b=T(g).rgb;vec3 dd=Q37WB(O(g).rgb)-b;dn=min(dn,dd);dx=max(dx,dd);lm+=Q37LAB(b);}lm/=256.;
 #define Q37IN(K,S0,W0,B0) (m==2?pow((S0),vec3(float(K)+1.)):m==0?((K)==0?(W0)*(W0):.5*((W0)+((W0)-(B0)-dn)/max(dx-dn,vec3(1e-3)))):((K)==0?(W0):clamp(gam*((S0)-Ib),0.,1.)))
 int K=m==2?5:2;float st=R(u_p1)*.4;vec2 e=u_px*max(u_k,1.);float wB[5],wC[5];vec3 bB[5],iC[5];for(int k=0;k<5;k++){wB[k]=0.;wC[k]=0.;bB[k]=vec3(0.);iC[k]=vec3(0.);}float gs=0.;
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 d=vec2(float(i),float(j));float gw=exp(-dot(d,d)/4.);vec2 p=uv+d*st*u_px;
  vec2 p1=p+vec2(e.x,0.),p2=p-vec2(e.x,0.),p3=p+vec2(0.,e.y),p4=p-vec2(0.,e.y);
  vec3 s0=O(p).rgb,s1=O(p1).rgb,s2=O(p2).rgb,s3=O(p3).rgb,s4=O(p4).rgb;vec3 b0=T(p).rgb,b1=T(p1).rgb,b2=T(p2).rgb,b3=T(p3).rgb,b4=T(p4).rgb;
  vec3 W0=Q37WB(s0),W1=Q37WB(s1),W2=Q37WB(s2),W3=Q37WB(s3),W4=Q37WB(s4);float sal=length(Q37LAB(b0)-lm);
  for(int k=0;k<5;k++){if(k>=K)break;vec3 x0=Q37IN(k,s0,W0,b0);
   float lp=abs(4.*luma(x0)-luma(Q37IN(k,s1,W1,b1))-luma(Q37IN(k,s2,W2,b2))-luma(Q37IN(k,s3,W3,b3))-luma(Q37IN(k,s4,W4,b4)));
   float l=luma(x0);float sd=sqrt(dot(x0-l,x0-l)/3.);float wt;
   if(m==2)wt=lp*sd+1e-5;else if(m==0)wt=4.*lp+sal+sd+.1;else{float sa=rgb2hsv(clamp(x0,0.,1.)).y;wt=sd+exp(-(sa-1.)*(sa-1.)/.18)+sal+.1;}
   wB[k]+=wt*gw;bB[k]+=x0*gw;if(i==0&&j==0){wC[k]=wt;iC[k]=x0;}}
  gs+=gw;}
 float sB=0.,sC=0.;for(int k=0;k<5;k++){sB+=wB[k];sC+=wC[k];}vec3 r=vec3(0.);for(int k=0;k<5;k++){if(k>=K)break;vec3 bk=bB[k]/gs;r+=wB[k]/sB*bk+wC[k]/sC*(iC[k]-bk);}
 return vec4(mix(O(uv).rgb,clamp(r,0.,1.),u_p2),1.);`],
  'image fusion with two-scale blending (Gaussian-smoothed normalised weights for the base layer, per-pixel weights for the detail layer) instead of the Laplacian pyramid, approx. Ancuti, Ancuti, De Vleeschouwer & Bekaert 2018: red compensation I_rc = I_r + (mean G - mean R)(1 - I_r) I_g, gray-world white balance; inputs = gamma-corrected (gamma 2) and sharpened (I + N(I - Gaussian(I)))/2 with N = min-max stretch; weights = Laplacian contrast + saliency (|Gaussian-blurred opponent colour - image mean|, Achanta-style) + saturation (std of R,G,B about luminance), (W + 0.1)/(sum W + 0.2). Ancuti & Ancuti 2013 dehazing: inputs = gray-world white-balanced image and gamma (I - mean luminance) with gamma = 2(0.5 + mean); weights = luminance (channel std), chromatic exp(-(S - 1)^2 / (2 0.3^2)), saliency (constants from memory, approx.). Galdran 2018 AMEF: exposures I^gamma for gamma = 1..5 (the per-channel CLAHE member is omitted), weight = |Laplacian of gray| x saturation (reference amef.m)');

f('q37_uwstretch','ICM / UCM Underwater Colour Correction (Iqbal)',[S('Method',['ICM integrated colour model (Iqbal 2007)','UCM unsupervised colour correction (Iqbal 2010)']),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 mu=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++)mu+=O(${Q37_G16}).rgb;mu/=256.;
 vec3 gn=m==1?vec3(mu.b/max(mu.r,.01),mu.b/max(mu.g,.01),1.):vec3(1.);
 #define Q37EQ(V0) clamp((V0)*gn,0.,1.)
 vec3 lo=vec3(1.),hi=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=Q37EQ(O(${Q37_G16}).rgb);lo=min(lo,s);hi=max(hi,s);}vec3 rg=max(hi-lo,vec3(1e-3));
 #define Q37ST(V0) clamp(m==0?((V0)-lo)/rg:vec3(max((V0).r-lo.r,0.)*(1.-lo.r)/rg.r+lo.r,((V0).g-lo.g)/rg.g,min(max((V0).b-lo.b,0.)*hi.b/rg.b,hi.b)),0.,1.)
 float sn=1.,sx=0.,vn=1.,vx=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 h=rgb2hsv(Q37ST(Q37EQ(O(${Q37_G16}).rgb)));sn=min(sn,h.y);sx=max(sx,h.y);vn=min(vn,h.z);vx=max(vx,h.z);}
 vec3 h=rgb2hsv(Q37ST(Q37EQ(c.rgb)));h.y=clamp((h.y-sn)/max(sx-sn,1e-3),0.,1.);h.z=clamp((h.z-vn)/max(vx-vn,1e-3),0.,1.);return vec4(mix(c.rgb,hsv2rgb(h),u_p1),1.);`,
  'Iqbal et al. (as in the Wang et al. 2019 review reference code): ICM = per-channel min-max contrast stretch of R, G, B, then min-max stretch of HSV saturation and value. UCM = von Kries colour equalisation (R and G scaled to the blue mean), selective histogram stretching (R stretched toward the top, G both ways, B toward the bottom between its 0.2 % percentiles), then HSV saturation / value stretch; global extremes from a 16x16 sample grid instead of exact percentiles');

const Q37_JRS = [[73.53,29.94,17.76,765.40,121.44,112.80,.0294],[249.71,233.94,217.49,39.94,154.44,396.05,.0331],[161.68,116.25,96.95,291.03,60.48,162.85,.0654],[186.07,136.62,114.40,274.95,64.60,198.27,.0756],[189.26,98.37,51.18,633.18,222.40,250.69,.0554],[247.00,152.20,90.84,65.23,691.53,609.92,.0314],[150.10,72.66,37.76,408.63,200.77,257.57,.0454],[206.85,171.09,156.34,530.08,155.08,572.79,.0469],[212.78,152.82,120.04,160.57,84.52,243.90,.0956],[234.87,175.43,138.94,163.80,121.57,279.22,.0763],[151.19,97.74,74.59,425.40,73.56,175.11,.1100],[120.52,77.55,59.82,330.45,70.34,151.82,.0676],[192.20,119.62,82.32,152.76,92.14,259.15,.0755],[214.29,136.08,87.24,204.90,140.17,270.19,.0500],[99.57,54.33,38.06,448.13,90.18,151.29,.0667],[238.88,203.08,176.91,178.38,156.27,404.99,.0749]];
const Q37_JRN = [[254.37,254.41,253.82,2.77,2.81,5.46,.0637],[9.39,8.09,8.52,46.84,33.59,32.48,.0516],[96.57,96.95,91.53,280.69,156.79,436.58,.0864],[160.44,162.49,159.06,355.98,115.89,591.24,.0636],[74.98,63.23,46.33,414.84,245.95,361.27,.0747],[121.83,60.88,18.31,2502.24,1383.53,237.18,.0365],[202.18,154.88,91.04,957.42,1766.94,1582.52,.0349],[193.06,201.93,206.55,562.88,190.23,447.28,.0649],[51.88,57.14,61.55,344.11,191.77,433.40,.0656],[30.88,26.84,25.32,222.07,118.65,182.41,.1189],[44.97,85.96,131.95,651.32,840.52,963.67,.0362],[236.02,236.27,230.70,225.03,117.29,331.95,.0849],[207.86,191.20,164.12,494.04,237.69,533.52,.0368],[99.83,148.11,188.17,955.88,654.95,916.70,.0389],[135.06,131.92,123.10,350.35,130.30,388.43,.0943],[135.96,103.89,66.88,806.44,642.20,350.36,.0477]];
const Q37_ARR = (n, t) => `const float ${n}[112]=float[112](${t.map(k => [k[0], k[1], k[2], 1 / k[3], 1 / k[4], 1 / k[5], Math.log(k[6]) - .5 * Math.log(k[3] * k[4] * k[5])].map(v => v.toPrecision(7)).join(',')).join(',')});`;
f = add('Color');
f('q37_skin','Skin Colour Models (Jones-Rehg GMM, Chai-Ngan YCbCr)',[S('Model',['Jones-Rehg Bayesian mixture (2002)','Chai-Ngan YCbCr map (1999)']),P('Threshold (log ratio)',-6,8,0,.1),S('Output',['Mask','Score map','Highlight on image'])],
  Q37_ARR('Q37S', Q37_JRS) + Q37_ARR('Q37N', Q37_JRN) + `
 vec3 x=c.rgb*255.;float sc,mk;
 if(u_p0<.5){float a=-1e30,b=-1e30;float ls[16],ln[16];for(int k=0;k<16;k++){vec3 d=x-vec3(Q37S[k*7],Q37S[k*7+1],Q37S[k*7+2]);ls[k]=Q37S[k*7+6]-.5*dot(d*d,vec3(Q37S[k*7+3],Q37S[k*7+4],Q37S[k*7+5]));a=max(a,ls[k]);
  vec3 e=x-vec3(Q37N[k*7],Q37N[k*7+1],Q37N[k*7+2]);ln[k]=Q37N[k*7+6]-.5*dot(e*e,vec3(Q37N[k*7+3],Q37N[k*7+4],Q37N[k*7+5]));b=max(b,ln[k]);}
  float sa=0.,sb=0.;for(int k=0;k<16;k++){sa+=exp(ls[k]-a);sb+=exp(ln[k]-b);}float lr=a+log(sa)-b-log(sb);sc=1./(1.+exp(-(lr-u_p1)));mk=lr>u_p1?1.:0.;}
 else{float cb=128.-.168736*x.r-.331264*x.g+.5*x.b;float cr=128.+.5*x.r-.418688*x.g-.081312*x.b;mk=(cb>=77.&&cb<=127.&&cr>=133.&&cr<=173.)?1.:0.;sc=mk;}
 int o=int(u_p2+.5);return o==0?vec4(vec3(mk),1.):o==1?vec4(vec3(sc),1.):vec4(mix(c.rgb*.3,c.rgb,mk),1.);`,
  'Jones & Rehg 2002 (CRL 98/11 Table 5): 16-kernel diagonal-covariance Gaussian mixtures for skin and non-skin RGB (8-bit), pixel is skin when log P(rgb|skin) - log P(rgb|non-skin) > threshold (score = logistic of the margin). Chai & Ngan 1999 skin map: BT.601 Cb in [77,127] and Cr in [133,173]');

f = add('Analysis');
f('q37_localthresh','Local Thresholds (Eikvil, Kamel-Zhao, Parker)',[S('Method',['Eikvil-Taxt-Moen (1991)','Kamel-Zhao logical level (1993)','Parker local intensity gradient (1991)']),P('Window / stroke width',1,40,7,1,'px'),P('Threshold',0,.3,.06,.005),S('Output',['Black on white','White on black','Over image'])],
  `int m=int(u_p0+.5);float f=L(uv);float W=R(u_p1);float b=0.;
 if(m==0){float h[32];for(int i=0;i<32;i++)h[i]=0.;float st=W/7.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){float v=L(uv+vec2(float(i),float(j))*st*u_px);h[int(clamp(v*32.,0.,31.))]+=1.;}
  float N=225.,mu=0.;for(int i=0;i<32;i++)mu+=float(i)*h[i];float wB=0.,sB=0.,best=-1.,th=16.,m1=0.,m2=31.;
  for(int i=0;i<32;i++){wB+=h[i];if(wB==0.||wB==N)continue;sB+=float(i)*h[i];float a=sB/wB,bb=(mu-sB)/(N-wB);float v=wB*(N-wB)*(a-bb)*(a-bb);if(v>best){best=v;th=float(i);m1=a;m2=bb;}}
  m1=(m1+.5)/32.;m2=(m2+.5)/32.;
  if(m2-m1>=u_p2)b=f<(th+1.)/32.?1.:0.;else{float sm=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)sm+=L(uv+vec2(float(i),float(j))*u_px*max(u_k,1.))/9.;b=abs(sm-m1)<abs(sm-m2)?1.:0.;}}
 else if(m==1){float lv[8];for(int k=0;k<8;k++){float a=float(k)*.7853982;vec2 P0=uv+vec2(cos(a),sin(a))*W*u_px;float av=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)av+=L(P0+vec2(float(i),float(j))*W*.5*u_px);lv[k]=av/25.-f>u_p2?1.:0.;}
  for(int i=0;i<4;i++){int i5=i+5;if(i5>7)i5-=8;if(lv[i]*lv[i+4]*lv[i+1]*lv[i5]>.5)b=1.;}}
 else{float e=max(u_k,1.);
  #define Q37DD(P0) (255.*(L(P0)-max(max(max(L((P0)+vec2(e,0.)*u_px),L((P0)-vec2(e,0.)*u_px)),max(L((P0)+vec2(0.,e)*u_px),L((P0)-vec2(0.,e)*u_px))),max(max(L((P0)+vec2(e,e)*u_px),L((P0)-vec2(e,e)*u_px)),max(L((P0)+vec2(e,-e)*u_px),L((P0)-vec2(e,-e)*u_px))))))
  float dc=Q37DD(uv);float s1=0.,s2=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float d=Q37DD(uv+vec2(float(i),float(j))*W*.33*u_px);s1+=d;s2+=d*d;}
  float M=s1/49.,Sd=sqrt(max(s2/49.-M*M,0.));if(!(M>=-1.||Sd<1.)&&dc<M-Sd)b=1.;}
 int o=int(u_p3+.5);return o==0?vec4(vec3(1.-b),1.):o==1?vec4(vec3(b),1.):vec4(mix(c.rgb,vec3(1.,0.,0.),b*.7),1.);`,
  'local document thresholds (b = dark print). Eikvil, Taxt & Moen 1991 (as described by Trier-Taxt / Blayvas 2006): Otsu on the large window L (sampled 15x15, 32 bins); if the class means differ by at least Threshold (paper 15/255) the pixel is thresholded by T, otherwise it joins the class whose mean is closest to its 3x3 mean (local class means stand in for the running updated means). Kamel & Zhao 1993 logical level technique: L(P) = ave(P) - g > T with ave the (2SW+1)^2 box mean (5x5 samples) at the 8 points P_i at distance SW; print iff L(P_i) and L(P_i+4) and L(P_i+1) and L(P_i+5) for some i = 0..3. Parker 1991 local intensity gradient (as in Yang & Yan 2000): d = min over 8 neighbours (f - f_i), local mean M and std S of d over the window, print where not (M >= -1 or S < 1) and d < M - S (8-bit units); the region-growing fill of object interiors is omitted, so mostly stroke borders are marked (approx.)');
