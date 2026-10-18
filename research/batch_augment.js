/* ================= More tone mapping (from research round 3) ================= */
f = add('Tone');
f('durand','Bilateral Tone Mapping (Durand)',[P('Base compression',.1,1,.45,.01),P('Detail boost',.5,3,1.2,.05),P('Range σ',.1,1,.4,.01)],
  `float L0=log(max(luma(pow(max(c.rgb,0.),vec3(2.2))),1e-4));float acc=0.,ws=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 o=vec2(float(i),float(j))*R(3.);float l=log(max(luma(pow(max(T(uv+o*u_px).rgb,0.),vec3(2.2))),1e-4));float w=exp(-dot(o,o)/(2.*R(6.)*R(6.)+.01))*exp(-(l-L0)*(l-L0)/(2.*u_p2*u_p2));acc+=l*w;ws+=w;}float base=acc/ws,det=L0-base;
  float mx=-20.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mx=max(mx,log(max(luma(pow(max(O(vec2(float(i)+.5,float(j)+.5)/8.).rgb,0.),vec3(2.2))),1e-4)));float outL=exp((base-mx)*u_p0+det*u_p1);vec3 lin=pow(max(c.rgb,0.),vec3(2.2));return vec4(pow(clamp(lin/exp(L0)*outL,0.,1.),vec3(1./2.2)),1.);`,'Durand & Dorsey 2002');
const FATTAL_JACOBI = `vec2 e=u_px;vec4 s=T(uv);float n=T(uv+vec2(e.x,0.)).r+T(uv-vec2(e.x,0.)).r+T(uv+vec2(0.,e.y)).r+T(uv-vec2(0.,e.y)).r;return vec4((n-s.g)*.25,s.g,s.b,1.);`;
f('fattal','Gradient Domain Compression (Fattal)',[P('Alpha',.01,.5,.1,.005),P('Beta',.7,.95,.85,.01),P('Saturation',.3,1.5,.8,.01)],
  [`return vec4(log(max(luma(pow(max(c.rgb,0.),vec3(2.2))),1e-4))*.1+.5,0.,0.,1.);`,
   `vec2 e=u_px;float H=T(uv).r;vec2 g0=vec2(T(uv+vec2(e.x,0.)).r-H,T(uv+vec2(0.,e.y)).r-H);vec2 g1=vec2(H-T(uv-vec2(e.x,0.)).r,H-T(uv-vec2(0.,e.y)).r);float a=u_p0*.1;vec2 G0=g0*pow(max(length(g0),1e-5)/a,u_p1-1.),G1=g1*pow(max(length(g1),1e-5)/a,u_p1-1.);float div=(G0.x-G1.x)+(G0.y-G1.y);return vec4(H,div,H,1.);`,
   ...Array(30).fill(FATTAL_JACOBI),
   `float I=T(uv).r;float H=T(uv).b;float mx=-9.;for(int j=0;j<6;j++)for(int i=0;i<6;i++)mx=max(mx,T(vec2(float(i)+.5,float(j)+.5)/6.).r);float Lout=exp((I-mx)*10.)*1.2;vec3 lin=pow(max(O(uv).rgb,0.),vec3(2.2));float Lin=max(luma(lin),1e-4);return vec4(pow(clamp(pow(lin/Lin,vec3(u_p2))*Lout,0.,1.),vec3(1./2.2)),1.);`],'single scale, 30 Jacobi iterations (approx.)');
f('locallaplacian','Local Laplacian (detail remap)',[P('Detail (α)',.2,2,.5,.01),P('Edge compression (β)',0,1,.8,.01),P('Edge threshold (σr)',.02,.5,.15,.01),P('Scale',2,40,10,.5,'px')],
  [BH('u_p3'),`vec3 g=blur1d(u_tex,uv,vec2(0.,1.),R(u_p3)).rgb;vec3 o=O(uv).rgb;vec3 d=o-g;vec3 ad=abs(d);vec3 r=mix(sign(d)*u_p2*pow(ad/u_p2,vec3(u_p0)),sign(d)*(u_p2+u_p1*(ad-u_p2)),step(u_p2,ad));return vec4(g+r,1.);`],'Paris 2011, single level');
f('histmatch','Histogram Specification',[S('Target',['Uniform (equalize)','Gaussian','Exponential (dark key)','Exponential (bright key)','Bimodal']),P('Spread',.05,.4,.18,.01),P('Amount',0,1,1,.01)],
  `float l=luma(c.rgb);float n=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float s=luma(O(vec2(float(i)+.5,float(j)+.5)/16.).rgb);n+=smoothstep(s-.01,s+.01,l);}float q=clamp(n/256.,.002,.998);int m=int(u_p0+.5);float t;
  if(m==0)t=q;else if(m==1){float x=2.*q-1.;float a=.147;float ln_=log(1.-x*x);float z=sign(x)*sqrt(sqrt(pow(2./(PI*a)+ln_/2.,2.)-ln_/a)-(2./(PI*a)+ln_/2.));t=.5+u_p1*1.41421*z;}else if(m==2)t=-log(1.-q)*u_p1;else if(m==3)t=1.+log(q)*u_p1;else t=q<.5?.3+u_p1*(q*2.-1.)*.8:.7+u_p1*(q*2.-1.)*.8;
  t=clamp(t,0.,1.);return vec4(mix(c.rgb,c.rgb*t/max(l,1e-3),u_p2),1.);`,'remap luma CDF to a target shape');
f('tonecurves','Tone Curve',[S('Curve',['Log','Exponential','Sigmoid','Inverse sigmoid','Square root','Square','Random (seeded)']),P('Amount',0,1,.6,.01)],
  `vec3 x=c.rgb;int m=int(u_p0+.5);float k=1.+u_p1*9.;vec3 y;if(m==0)y=log(1.+x*k)/log(1.+k);else if(m==1)y=(exp(x*log(1.+k))-1.)/k;else if(m==2){vec3 s=1./(1.+exp(-(x-.5)*k));y=(s-1./(1.+exp(k*.5)))/(1./(1.+exp(-k*.5))-1./(1.+exp(k*.5)));}else if(m==3){y=.5-log(1./clamp(x*(1.-2./(1.+exp(k*.5)))+1./(1.+exp(k*.5)),1e-4,.9999)-1.)/k;}else if(m==4)y=sqrt(x);else if(m==5)y=x*x;else{float a=hash1(1.)*.6-.3,b=hash1(2.)*.6-.3;y=x+u_p1*(a*sin(x*PI)+b*sin(x*PI*2.)*.5);}return vec4(mix(x,clamp(y,0.,1.),u_p1>0.?1.:0.),1.);`,'albumentations RandomToneCurve style',1);

/* ================= Morphology additions ================= */
f = add('Edges');
f('ultimateerosion','Ultimate Erosion',[P('Threshold',0,1,.5,.01),P('Max radius',2,40,16,1,'px'),S('Objects are',['Bright','Dark'])],
  `bool inv=u_p2>.5;float dc=0.;float best=0.;for(int k=0;k<9;k++){vec2 o=k==0?vec2(0.):vec2(cos(float(k)*.785),sin(float(k)*.785))*u_px*max(u_k,1.);vec2 q=uv+o;if((L(q)>u_p0)==inv){if(k==0)return vec4(vec3(0.),1.);continue;}float d=u_p1;for(int i=0;i<48;i++){float fi=float(i);float rr=sqrt((fi+.5)/48.)*R(u_p1);float a=fi*2.39996;if((L(q+vec2(cos(a),sin(a))*rr*u_px)>u_p0)==inv)d=min(d,rr);}if(k==0)dc=d;else best=max(best,d);}return vec4(dc>=best&&dc>R(1.)?vec3(1.,.3,.2):vec3(dc/R(u_p1)*.6),1.);`,'distance-map peaks (object centers)');

/* ================= Data augmentation (albumentations / imgaug) ================= */
f = add('Augment');
f('channeldropout','Channel Dropout',[S('Channel',['Red','Green','Blue','Random']),P('Fill value',0,1,0,.01)],
  `int m=int(u_p0+.5);if(m==3)m=int(hash1(1.)*2.999);vec3 x=c.rgb;if(m==0)x.r=u_p1;else if(m==1)x.g=u_p1;else x.b=u_p1;return vec4(x,1.);`,'albumentations ChannelDropout',1);
f('multnoise','Multiplicative Noise',[P('Range',0,1,.3,.01),S('Per channel',['Yes','No'])],
  `vec2 p=floor(uv*u_res);vec3 n=u_p1<.5?vec3(hash(p),hash(p+3.1),hash(p+7.3)):vec3(hash(p));return vec4(c.rgb*(1.+(n-.5)*2.*u_p0),1.);`,'albumentations MultiplicativeNoise',1);
f('planckian','Planckian Jitter (color temperature)',[P('Temperature',1500,15000,4000,50,'K'),S('Preserve brightness',['Yes','No'])],
  `float t=u_p0/100.;vec3 bb;bb.r=t<=66.?255.:329.698727*pow(t-60.,-.1332048);bb.g=t<=66.?99.470803*log(t)-161.119568:288.122170*pow(t-60.,-.0755148);bb.b=t>=66.?255.:(t<=19.?0.:138.517731*log(t-10.)-305.044793);bb=clamp(bb/255.,0.,1.)/vec3(1.,.996,.98);vec3 x=c.rgb*bb;if(u_p1<.5)x*=luma(c.rgb)/max(luma(x),1e-3);return vec4(x,1.);`,'blackbody white balance shift');
f('fancypca','Fancy PCA Color Jitter',[P('Alpha σ',0,1,.3,.01)],
  `vec3 ev=vec3(.2175,.0188,.0045);mat3 V=mat3(-.5675,-.5808,-.5836,.7192,-.0045,-.6948,.4009,-.814,.4203);vec3 a=(vec3(hash1(1.),hash1(2.),hash1(3.))-.5)*2.*u_p0;return vec4(c.rgb+V*(a*ev),1.);`,'AlexNet PCA lighting noise',1);
f('plasma','Plasma Brightness / Shadow',[S('Mode',['Brightness & contrast','Shadow']),P('Strength',0,1,.4,.01),P('Roughness',20,600,180,1,'px')],
  `float n=fbm(PX(uv)/u_p2);if(u_p0<.5){float b=(n-.5)*u_p1;float k=1.+(fbm(PX(uv)/u_p2+19.)-.5)*u_p1;return vec4((c.rgb-.5)*k+.5+b,1.);}return vec4(c.rgb*(1.-u_p1*smoothstep(.45,.75,n)),1.);`,'albumentations Plasma* transforms',1);
f('randomshadow','Random Shadow',[P('Shadows',1,5,2,1),P('Darkness',0,1,.5,.01),P('Region (bottom part)',.2,1,.6,.01)],
  `float sh=0.;for(int k=0;k<5;k++){if(float(k)>=u_p0)break;float fk=float(k);vec2 a=vec2(hash1(fk*3.1),hash1(fk*5.3)*u_p2),b=vec2(hash1(fk*7.7),hash1(fk*2.9)*u_p2),cc=vec2(hash1(fk*1.3+4.),hash1(fk*9.1)*u_p2);vec2 p=uv;float d1=(p.x-b.x)*(a.y-b.y)-(a.x-b.x)*(p.y-b.y),d2=(p.x-cc.x)*(b.y-cc.y)-(b.x-cc.x)*(p.y-cc.y),d3=(p.x-a.x)*(cc.y-a.y)-(cc.x-a.x)*(p.y-a.y);bool neg=d1<0.||d2<0.||d3<0.,pos=d1>0.||d2>0.||d3>0.;if(!(neg&&pos))sh=1.;}return vec4(c.rgb*(1.-sh*u_p1),1.);`,'albumentations RandomShadow',1);
f('gravel','Random Gravel',[P('Density',0,1,.4,.01),P('Stone size',1,8,3,.5,'px'),P('Region (bottom part)',.1,1,.4,.01)],
  `if(uv.y>u_p2)return c;vec2 p=PX(uv)/u_p1;vec2 ip=floor(p);float cl=fbm(ip*.05);if(cl<1.-u_p0*.6)return c;vec2 fq=fract(p)-.5-(hash2(ip)-.5)*.3;float r=.25+.2*hash(ip+3.);if(length(fq)>r)return c;float sh=.4+.5*hash(ip+5.)+dot(normalize(fq+1e-4),vec2(-.6,.6))*.15;return vec4(vec3(.42,.38,.33)*sh*1.4,1.);`,'albumentations RandomGravel',1);
f('spatter','Spatter (mud / rain)',[S('Type',['Mud','Rain drops']),P('Amount',0,1,.5,.01),P('Blob size',5,200,40,1,'px')],
  `vec2 p=PX(uv);float n=fbm(p/u_p2)*.7+vnoise(p/(u_p2*.2))*.3;float m=smoothstep(1.-u_p1*.5,1.-u_p1*.5+.04,n);if(u_p0<.5)return vec4(mix(c.rgb,vec3(.3,.22,.12)*(.8+.3*vnoise(p*.3)),m*.85),1.);vec2 g=vec2(fbm((p+vec2(2.,0.))/u_p2)-fbm((p-vec2(2.,0.))/u_p2),fbm((p+vec2(0.,2.))/u_p2)-fbm((p-vec2(0.,2.))/u_p2));return vec4(mix(c.rgb,T(uv+g*m*R(30.)*u_px).rgb*1.08,m),1.);`,'albumentations Spatter',1);
f('ringing','Ringing / Overshoot',[P('Cutoff',.05,.45,.15,.005),P('Taps',3,15,11,2)],
  [`float fc=u_p0;vec4 a=vec4(0.);float ws=0.;for(int i=-7;i<=7;i++){if(abs(float(i))*2.+1.>u_p1)continue;float n=float(i);float h=n==0.?2.*fc:sin(2.*PI*fc*n)/(PI*n);a+=T(uv+vec2(n,0.)*u_px*max(u_k,1.))*h;ws+=h;}return a/ws;`,
   `float fc=u_p0;vec4 a=vec4(0.);float ws=0.;for(int i=-7;i<=7;i++){if(abs(float(i))*2.+1.>u_p1)continue;float n=float(i);float h=n==0.?2.*fc:sin(2.*PI*fc*n)/(PI*n);a+=T(uv+vec2(0.,n)*u_px*max(u_k,1.))*h;ws+=h;}return a/ws;`],'truncated-sinc Gibbs ripples');
f('elastic','Elastic Transform',[P('Alpha (strength)',0,80,20,1,'px'),P('Sigma (smoothness)',4,200,40,1,'px')],
  `vec2 p=PX(uv);vec2 d=vec2(vnoise(p/u_p1),vnoise(p/u_p1+37.1))-.5;return T(fromPX(p+d*2.*u_p0));`,'Simard 2003',1);
f('griddistort','Grid Distortion',[P('Cells',2,16,5,1),P('Distort limit',0,.5,.3,.01)],
  `vec2 g=uv*u_p0;vec2 i=floor(g),fq=fract(g);float ox0=(hash1(i.x*1.7)-.5)*u_p1,ox1=(hash1((i.x+1.)*1.7)-.5)*u_p1,oy0=(hash1(i.y*2.3+50.)-.5)*u_p1,oy1=(hash1((i.y+1.)*2.3+50.)-.5)*u_p1;if(i.x<=0.)ox0=0.;if(i.x+1.>=u_p0)ox1=0.;if(i.y<=0.)oy0=0.;if(i.y+1.>=u_p0)oy1=0.;vec2 s=(i+vec2(mix(ox0,ox1,fq.x),mix(oy0,oy1,fq.y))+fq)/u_p0;return T(clamp(s,0.,1.));`,'albumentations GridDistortion',1);
f('piecewiseaffine','Piecewise Affine',[P('Grid',2,12,4,1),P('Jitter',0,.5,.2,.01)],
  `vec2 g=uv*u_p0;vec2 i=floor(g),fq=fract(g);vec2 j00=(hash2(i)-.5)*u_p1,j10=(hash2(i+vec2(1.,0.))-.5)*u_p1,j01=(hash2(i+vec2(0.,1.))-.5)*u_p1,j11=(hash2(i+1.)-.5)*u_p1;vec2 j=mix(mix(j00,j10,fq.x),mix(j01,j11,fq.x),fq.y);return T(clamp(uv+j/u_p0,0.,1.));`,'imgaug PiecewiseAffine',1);
f('dropout','Dropout / Cutout',[S('Type',['Coarse dropout','Grid dropout','XY masking','Pixel dropout','Coarse salt & pepper']),P('Hole size',2,200,32,1,'px'),P('Fraction',0,1,.2,.01),P('Fill value',0,1,0,.01)],
  `int m=int(u_p0+.5);vec2 p=PX(uv);vec2 ip=floor(p/u_p1);bool hole=false;vec3 fill=vec3(u_p3);if(m==0)hole=hash(ip)<u_p2;else if(m==1){vec2 fq=fract(p/u_p1);hole=fq.x<sqrt(u_p2)&&fq.y<sqrt(u_p2);}else if(m==2){float cx=floor(p.x/u_p1),cy=floor(p.y/u_p1);hole=hash(vec2(cx,1.))<u_p2*.5||hash(vec2(2.,cy))<u_p2*.5;}else if(m==3)hole=hash(floor(uv*u_res))<u_p2;else{hole=hash(ip)<u_p2;fill=vec3(step(.5,hash(ip+9.)));}return hole?vec4(fill,1.):c;`,'albumentations CoarseDropout, GridDropout, XYMasking',1);
f('illumination','Illumination Gradient',[S('Mode',['Linear','Corner','Gaussian spot']),P('Intensity',-1,1,.4,.01),P('Angle / position',0,1,.3,.01)],
  `int m=int(u_p0+.5);float g;if(m==0){float a=u_p2*6.2832;g=dot(uv-.5,vec2(cos(a),sin(a)))+.5;}else if(m==1){vec2 cn=vec2(step(.5,fract(u_p2*2.)),step(.5,u_p2));g=1.-length(uv-cn)/1.414;}else g=exp(-dot(uv-vec2(u_p2,1.-u_p2),uv-vec2(u_p2,1.-u_p2))*8.);return vec4(c.rgb*(1.+u_p1*(g-.5)*2.),1.);`,'albumentations Illumination');
f('pooling','Pooling',[S('Operation',['Average','Max','Min','Median']),P('Block size',2,32,6,1,'px')],
  `vec2 ip=floor(PX(uv)/u_p1);vec3 s[16];vec3 a=vec3(0.),mx=vec3(0.),mn=vec3(1.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec3 v=T(fromPX((ip+(vec2(float(i),float(j))+.5)/4.)*u_p1)).rgb;s[j*4+i]=v;a+=v;mx=max(mx,v);mn=min(mn,v);}int m=int(u_p0+.5);if(m==0)return vec4(a/16.,1.);if(m==1)return vec4(mx,1.);if(m==2)return vec4(mn,1.);
  vec3 med=a/16.;float best=1e9;for(int i=0;i<16;i++){float l=luma(s[i]);int lo=0;for(int k=0;k<16;k++)lo+=luma(s[k])<l?1:0;float d=abs(float(lo)-7.5);if(d<best){best=d;med=s[i];}}return vec4(med,1.);`,'imgaug Average/Max/Min/MedianPooling');
f('kmeansquant','K-Means Color Quantization',[P('Colors (k)',2,12,6,1),P('Iterations',1,6,4,1)],
  `vec3 smp[64];for(int j=0;j<8;j++)for(int i=0;i<8;i++)smp[j*8+i]=O((vec2(float(i),float(j))+.5)/8.).rgb;int K=int(u_p0+.5);vec3 cen[12];for(int k=0;k<12;k++)cen[k]=smp[(k*64/max(K,1))%64];
  for(int it=0;it<6;it++){if(float(it)>=u_p1)break;vec3 sm[12];float cn[12];for(int k=0;k<12;k++){sm[k]=vec3(0.);cn[k]=0.;}for(int s=0;s<64;s++){int b=0;float bd=1e9;for(int k=0;k<12;k++){if(k>=K)break;vec3 d=smp[s]-cen[k];float dd=dot(d,d);if(dd<bd){bd=dd;b=k;}}sm[b]+=smp[s];cn[b]+=1.;}for(int k=0;k<12;k++)if(cn[k]>0.)cen[k]=sm[k]/cn[k];}
  vec3 best=cen[0];float bd=1e9;for(int k=0;k<12;k++){if(k>=K)break;vec3 d=c.rgb-cen[k];float dd=dot(d,d);if(dd<bd){bd=dd;best=cen[k];}}return vec4(best,1.);`,'imgaug KMeansColorQuantization');
