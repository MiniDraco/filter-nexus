/* ================= q37b: saliency models and edge-preserving / robust filters (round 16 literature) ================= */
const Q37_GR = (n) => `(vec2(float(i),float(j))+.5)/${n}.`;
const Q37_LV = (pos, arr) => `{float nn=0.;for(int q=0;q<9;q++){vec2 dv=vec2(float(q-(q/3)*3-1),float(q/3-1));vec4 tq=T((${pos})+dv*e);float tr=tq.r+tq.b+4e-3;vec3 cn=vec3(tq.r+2e-3,(tq.g-.5)*2.,tq.b+2e-3)/tr;float k=sqrt(max(cn.x*cn.z-cn.y*cn.y,1e-6))*exp(-(cn.x*dv.x*dv.x+2.*cn.y*dv.x*dv.y+cn.z*dv.y*dv.y)*2.);${arr}[q]=k;nn+=k*k;}nn=inversesqrt(max(nn,1e-12));for(int q=0;q<9;q++)${arr}[q]*=nn;}`;

f = add('Analysis');
f('q37_saliency','Saliency Models (LC, Maximum Symmetric Surround, SUN, Self-Resemblance)',[S('Model',['LC luminance contrast (Zhai-Shah 2006)','Maximum symmetric surround (Achanta 2010)','SUN DoG self-information (Zhang 2008)','Self-resemblance LARK (Seo-Milanfar 2009)']),P('Scale',1,30,6,.5,'px'),P('Gain',.2,10,2,.05),S('Output',['Map','Over image'])],
  [`if(u_p0<2.5)return c;float a=0.,b=0.,d=0.;vec2 e=u_px*max(u_k,1.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 p=uv+vec2(float(i),float(j))*e;float gx=L(p+vec2(e.x,0.))-L(p-vec2(e.x,0.)),gy=L(p+vec2(0.,e.y))-L(p-vec2(0.,e.y));a+=gx*gx;b+=gx*gy;d+=gy*gy;}return vec4(a/9.,.5+.5*b/9.,d/9.,1.);`,
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;float s=0.;vec2 e=u_px*max(u_k,1.);
 if(m==0){float h[64];for(int k=0;k<64;k++)h[k]=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++)h[int(clamp(luma(O(${Q37_GR(16)}).rgb)*64.,0.,63.))]+=1.;
  float smx=0.,smn=1e9;for(int k=0;k<64;k++){if(h[k]==0.)continue;float v=0.;for(int q=0;q<64;q++)v+=h[q]*abs(float(k-q));smx=max(smx,v);smn=min(smn,v);}
  float l=luma(o)*64.-.5;float v=0.;for(int q=0;q<64;q++)v+=h[q]*abs(l-float(q));s=clamp((v-smn)/max(smx-smn,1e-3),0.,1.)*u_p2*.5;}
 else if(m==1){
  #define Q37LIN(V0) mix((V0)/12.92,pow(((V0)+.055)/1.055,vec3(2.4)),step(vec3(.04045),(V0)))
  #define Q37LF(V0) pow(max(mat3(.4124,.2126,.0193,.3576,.7152,.1192,.1805,.0722,.9505)*Q37LIN(V0)/vec3(.9505,1.,1.089),vec3(1e-6)),vec3(1./3.))
  #define Q37LAB(F0) vec3(116.*(F0).y-16.,500.*((F0).x-(F0).y),200.*((F0).y-(F0).z))
  vec2 px=uv*u_res;vec2 h0=max(min(px,u_res-px),vec2(1.));vec3 mu=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 p=(px+(${Q37_GR(12)}*2.-1.)*h0)/u_res;mu+=Q37LAB(Q37LF(O(p).rgb));}mu/=144.;
  vec3 bl=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)bl+=O(uv+vec2(float(i),float(j))*e).rgb*(i==0?2.:1.)*(j==0?2.:1.);bl/=16.;
  s=length(Q37LAB(Q37LF(bl))-mu)*u_p2*.012;}
 else if(m==2){
  #define Q37F3(V0) vec3(((V0).r+(V0).g+(V0).b)/3.,(V0).r-(V0).g,(V0).b-.5*((V0).r+(V0).g))
  float sc0=R(u_p1)*.5;vec3 fr[108];vec3 fx[3];
  for(int n=0;n<37;n++){vec2 c0=n==36?uv:(vec2(float(n-(n/6)*6),float(n/6))+.5)/6.;
   for(int k=0;k<3;k++){float sc=sc0*pow(2.,float(k));vec3 a=Q37F3(O(c0).rgb)*2.;vec3 b=vec3(0.);
    for(int q=0;q<4;q++){float an=float(q)*1.5707963;a+=Q37F3(O(c0+vec2(cos(an),sin(an))*sc*.7*u_px).rgb);}
    for(int q=0;q<8;q++){float an=float(q)*.7853982+.3927;b+=Q37F3(O(c0+vec2(cos(an),sin(an))*sc*2.*u_px).rgb);}
    vec3 dg=a/6.-b/8.;if(n<36)fr[n*3+k]=dg;else fx[k]=dg;}}
  float z=0.;for(int k=0;k<3;k++){vec3 m1=vec3(0.),m2=vec3(0.);for(int n=0;n<36;n++){vec3 v=fr[n*3+k];m1+=abs(v);m2+=v*v;}m1/=36.;m2/=36.;
   vec3 r=m1*m1/max(m2,vec3(1e-10));vec3 th=clamp(mix(mix(vec3(.5),vec3(1.),(r-.3)/.2),mix(vec3(1.),vec3(2.),(r-.5)/.1366),step(vec3(.5),r)),vec3(.4),vec3(2.5));
   vec3 mt=vec3(0.);for(int n=0;n<36;n++)mt+=pow(abs(fr[n*3+k])+1e-9,th);mt/=36.;vec3 sg=pow(th*mt+1e-12,1./th);
   vec3 lt=pow(abs(fx[k])/sg+1e-9,th)-1./th;z+=lt.x+lt.y+lt.z;}
  s=1.-exp(-max(z,0.)*u_p2*.015);}
 else{float F0[9];float Fj[9];float sp=max(R(u_p1)/3.,1.);${Q37_LV('uv','F0')}
  float den=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 pj=uv+vec2(float(i),float(j))*sp*u_px;${Q37_LV('pj','Fj')}float rho=0.;for(int q=0;q<9;q++)rho+=F0[q]*Fj[q];den+=exp((rho-1.)/.0049);}
  s=clamp((49./den-1.)/48.*u_p2,0.,1.);}
 s=clamp(s,0.,1.);return vec4(u_p3>.5?mix(o*.3,o,s):vec3(s),1.);`],
  'saliency maps. LC (Zhai & Shah 2006): S(I_k) = sum over all pixels |I_k - I_i|, from a 64-bin luminance histogram of a 16x16 sample grid, min-max normalised. Maximum symmetric surround (Achanta & Susstrunk 2010): S = || mean CIELAB over the largest symmetric window centred at the pixel (half sizes min(x, w-x), min(y, h-y); 12x12 samples) - 3x3 binomial-blurred CIELAB ||. SUN (Zhang, Tong, Marks, Shan & Cottrell 2008) DoG version, approx.: DoG responses of intensity, R-G, B-Y at 3 scales, generalized-Gaussian fits per feature (shape from the moment ratio, scale from E|f|^theta) on a 6x6 sample grid of the image itself instead of a natural-image training set, log s = sum |f_i / sigma_i|^theta_i (minus its mean). Self-resemblance (Seo & Milanfar 2009), approx.: LARK kernels sqrt(det C) exp(-dx^T C dx) from the normalised local gradient covariance C over a 3x3 neighbourhood (one 9-D LARK vector per pixel instead of a 3x3 patch of them, no 64x64 downsampling), matrix cosine similarity rho to the 7x7 surround, S = 1 / sum exp((rho - 1) / 0.07^2)');

f = add('Blur');
f('q37_rbf','Recursive Bilateral Filter (Yang 2012)',[P('Sigma spatial',2,60,12,1,'px'),P('Sigma range',.02,1,.1,.01)],
  [`float sg=R(u_p0);float st=max(1.,sg/16.);float a=exp(-1.41421356*st/sg);vec2 dx=vec2(st,0.)*u_px;vec4 acc=vec4(0.);
 for(int sd=0;sd<2;sd++){vec2 dir=sd==0?-dx:dx;float wgt=1.;vec3 gp=O(uv).rgb;for(int k=0;k<64;k++){vec2 p=uv+dir*float(k);vec3 g=O(p).rgb;if(k>0)wgt*=a*exp(-dot(abs(g-gp),vec3(.5,.25,.25))/u_p1);gp=g;if(wgt<1e-3)break;acc+=vec4(T(p).rgb,1.)*wgt;}}
 return acc*(1.-a)*.5;`,
   `float sg=R(u_p0);float st=max(1.,sg/16.);float a=exp(-1.41421356*st/sg);vec2 dx=vec2(0.,st)*u_px;vec4 acc=vec4(0.);
 for(int sd=0;sd<2;sd++){vec2 dir=sd==0?-dx:dx;float wgt=1.;vec3 gp=O(uv).rgb;for(int k=0;k<64;k++){vec2 p=uv+dir*float(k);vec3 g=O(p).rgb;if(k>0)wgt*=a*exp(-dot(abs(g-gp),vec3(.5,.25,.25))/u_p1);gp=g;if(wgt<1e-3)break;acc+=T(p)*wgt;}}
 return vec4(acc.rgb/max(acc.a,1e-6),1.);`],
  'Yang 2012 recursive bilateral filter (as in the RecursiveBF reference code): first-order causal + anticausal recursions y_i = (1 - a) x_i + a R(i, i-1) y_(i-1), a = exp(-sqrt(2) / sigma_s), range weight exp(-(2|dR| + |dG| + |dB|)/4 / sigma_r) between successive pixels, the same recursion on a constant image gives the normalisation; horizontal then vertical, divided once at the end. Each recursion is evaluated in parallel as its truncated weighted sum (64 steps, step widened for large sigma), so it matches the sequential filter up to the truncation');

f('q37_hdgauss','High-Dimensional Gaussian Filter (Permutohedral / Gaussian KD-tree target)',[S('Space',['Bilateral: x y r g b','Non-local means: patch space']),P('Spatial sigma',1,30,6,.5,'px'),P('Range sigma',.02,.5,.1,.01)],
  `int m=int(u_p0+.5);float ss=R(u_p1);vec3 c0=c.rgb;vec3 acc=vec3(0.);float ws=0.;
 if(m==0){float st=ss*2./7.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 d=vec2(float(i),float(j))*st;vec3 s=T(uv+d*u_px).rgb;vec3 dc=s-c0;float w=exp(-dot(d,d)/(2.*ss*ss)-dot(dc,dc)/(2.*u_p2*u_p2));acc+=s*w;ws+=w;}}
 else{float st=max(ss/3.,1.);vec2 e=u_px*max(u_k,1.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))*st;vec2 p=uv+d*u_px;float pd=0.;for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){vec2 o=vec2(float(a),float(b))*e;vec3 dd=T(p+o).rgb-T(uv+o).rgb;pd+=dot(dd,dd);}float w=exp(-pd/9./(2.*u_p2*u_p2)-dot(d,d)/(8.*ss*ss));acc+=T(p).rgb*w;ws+=w;}}
 return vec4(acc/ws,1.);`,
  'the Gaussian filter in a high-dimensional feature space that the permutohedral lattice (Adams, Baek & Davis 2010) and the Gaussian KD-tree (Adams et al. 2009) accelerate, evaluated directly on sparse samples instead of through the lattice / tree: 5-D (x, y, r, g, b) Gaussian = colour bilateral filter (15x15 samples over 2 sigma), or the patch-space Gaussian = non-local means (3x3 patches, 7x7 search positions, Gaussian position term)');

f = add('Repair');
f('q37_trilateral','Trilateral Filter (Choudhury-Tumblin)',[P('Sigma',1,20,5,.5,'px'),P('Range',.01,.4,.12,.01),P('Neighbourhood tolerance',.005,.2,.04,.005)],
  [`float e=max(u_k,1.);vec2 ex=vec2(e,0.)*u_px,ey=vec2(0.,e)*u_px;return vec4(.5+.5*(L(uv+ex)-L(uv-ex)),.5+.5*(L(uv+ey)-L(uv-ey)),L(uv),1.);`,
   `vec4 q=T(uv);vec2 acc=vec2(0.);float ws=0.;float st=R(u_p0)*.4;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 d=vec2(float(i),float(j));vec2 g=T(uv+d*st*u_px).rg;vec2 dg=g-q.rg;float w=exp(-dot(d,d)/8.-dot(dg,dg)/(2.*u_p1*u_p1));acc+=g*w;ws+=w;}return vec4(acc/ws,q.b,1.);`,
   `vec4 q=T(uv);vec2 G=q.rg-.5;vec3 o=O(uv).rgb;float Y=luma(o);float st=R(u_p0)*.4;float e=max(u_k,1.);float sw=0.,sp=0.;
 for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 d=vec2(float(i),float(j));vec2 p=uv+d*st*u_px;vec4 qq=T(p);if((i!=0||j!=0)&&length(qq.rg-q.rg)>u_p2)continue;float Pd=luma(O(p).rgb)-Y-dot(G,d*st/e);float w=exp(-dot(d,d)/8.-Pd*Pd/(2.*u_p1*u_p1));sp+=w*Pd;sw+=w;}
 return vec4(clamp(o+sp/sw,0.,1.),1.);`],
  'Choudhury & Tumblin 2003 trilateral filter, approx.: luminance gradients smoothed by a bilateral filter, then each neighbour is compared with the plane tilted by the smoothed gradient, P = I(x+d) - I(x) - G.d, and filtered with spatial x range(P) weights; the adaptive neighbourhood (min-max stack of gradients) is replaced by a per-sample gradient-similarity test; luma filtered, chroma kept');

f('q37_beltrami','Beltrami Flow (Sochen-Kimmel-Malladi)',[P('Beta',1,60,25,.5),P('Step',.02,.25,.12,.01)],
  Array(10).fill(`vec2 e=u_px*max(u_k,1.);float b2=u_p0*u_p0;vec3 dv=vec3(0.);float gc=1.;
 for(int k=0;k<5;k++){vec2 o=k==0?vec2(0.):k==1?vec2(e.x,0.):k==2?vec2(-e.x,0.):k==3?vec2(0.,e.y):vec2(0.,-e.y);vec2 p=uv+o;
  vec3 gx=.5*(T(p+vec2(e.x,0.)).rgb-T(p-vec2(e.x,0.)).rgb),gy=.5*(T(p+vec2(0.,e.y)).rgb-T(p-vec2(0.,e.y)).rgb);
  float a=1.+b2*dot(gx,gx),bq=b2*dot(gx,gy),d=1.+b2*dot(gy,gy);float sg=sqrt(a*d-bq*bq);if(k==0){gc=sg;continue;}
  vec3 fx=(d*gx-bq*gy)/sg,fy=(a*gy-bq*gx)/sg;if(k==1)dv+=.5*fx;else if(k==2)dv-=.5*fx;else if(k==3)dv+=.5*fy;else dv-=.5*fy;}
 return vec4(clamp(T(uv).rgb+u_p1*4.*dv/gc,0.,1.),1.);`),
  'Sochen, Kimmel & Malladi 1998 Beltrami flow for colour images: the image is a 2-D surface (x, y, beta R, beta G, beta B), induced metric g = I + beta^2 sum_c grad u_c grad u_c^T, each channel evolves by the Laplace-Beltrami operator u_t = (1/sqrt g) div(sqrt g g^-1 grad u); 10 explicit steps with central differences');

f = add('Sharpen');
f('q37_amshock','Alvarez-Mazorra Shock Filter',[P('Smoothing sigma',.5,6,1.5,.1,'px'),P('Diffusion c',0,1,.3,.01),P('Step',.05,.5,.25,.01)],
  Array(12).fill(`vec2 e=u_px*max(u_k,1.);float sg=max(R(u_p0),.5);float B[9];
 for(int q=0;q<9;q++){vec2 p=uv+vec2(float(q-(q/3)*3-1),float(q/3-1))*e;float s=0.,ws=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?2.:1.)*(j==0?2.:1.);s+=luma(T(p+vec2(float(i),float(j))*sg*u_px).rgb)*w;ws+=w;}B[q]=s/ws;}
 float Lx=.5*(B[5]-B[3]),Ly=.5*(B[7]-B[1]),Lxx=B[5]-2.*B[4]+B[3],Lyy=B[7]-2.*B[4]+B[1],Lxy=.25*(B[8]-B[6]-B[2]+B[0]);float g2=Lx*Lx+Ly*Ly;
 float sn=g2<1e-9?0.:sign(Lxx*Lx*Lx+2.*Lxy*Lx*Ly+Lyy*Ly*Ly);vec2 xi=g2<1e-9?vec2(1.,0.):vec2(-Ly,Lx)/sqrt(g2);
 vec3 u=T(uv).rgb,ue=T(uv+vec2(e.x,0.)).rgb,uw=T(uv-vec2(e.x,0.)).rgb,un=T(uv+vec2(0.,e.y)).rgb,us=T(uv-vec2(0.,e.y)).rgb;
 vec3 ne=T(uv+e).rgb,nw=T(uv+vec2(-e.x,e.y)).rgb,se=T(uv+vec2(e.x,-e.y)).rgb,sw=T(uv-e).rgb;vec3 dxp=ue-u,dxm=u-uw,dyp=un-u,dym=u-us;
 vec3 gE=sqrt(max(dxm,0.)*max(dxm,0.)+min(dxp,0.)*min(dxp,0.)+max(dym,0.)*max(dym,0.)+min(dyp,0.)*min(dyp,0.));
 vec3 gD=sqrt(min(dxm,0.)*min(dxm,0.)+max(dxp,0.)*max(dxp,0.)+min(dym,0.)*min(dym,0.)+max(dyp,0.)*max(dyp,0.));
 vec3 uxi=(ue-2.*u+uw)*xi.x*xi.x+.5*(ne-nw-se+sw)*xi.x*xi.y+(un-2.*u+us)*xi.y*xi.y;
 return vec4(clamp(u+u_p2*((sn>0.?-gE:sn<0.?gD:vec3(0.))+u_p1*uxi),0.,1.),1.);`),
  'Alvarez & Mazorra 1994: u_t = -sign(G_sigma * u_eta_eta) |grad u| + c u_xi_xi - shock (erosion / dilation with Osher-Rudin upwind gradients) steered by the second derivative of the Gaussian-presmoothed luminance along its gradient, plus diffusion along the isophote xi; 12 explicit steps');
