/* ================= Tone mapping & enhancement ================= */
f = add('Tone');
f('tonemap','Tone Mapping (HDR)',[S('Operator',['Reinhard','Reinhard extended','Drago (log)','ACES (Narkowicz)','Hable / Uncharted 2','Hejl-Dawson','Lottes','Uchimura (Gran Turismo)','AgX','Exponential']),P('Exposure',-4,6,1.5,.1,'EV'),P('White point',1,20,6,.1)],
  `vec3 x=pow(max(c.rgb,0.),vec3(2.2))*exp2(u_p1);int m=int(u_p0+.5);float W=u_p2;vec3 y;bool enc=false;
  if(m==0)y=x/(1.+x);
  else if(m==1)y=x*(1.+x/(W*W))/(1.+x);
  else if(m==2){float b=.85;float lmax=W;vec3 l=log(x+1.)/log(2.+8.*pow(x/lmax,vec3(log(b)/log(.5))));y=l/(log(lmax+1.)/log(10.))*.18*2.3;}
  else if(m==3)y=clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);
  else if(m==4){vec3 z=x*2.;const float A=.15,B=.5,C=.1,Dd=.2,E=.02,F=.3;vec3 fz=((z*(A*z+C*B)+Dd*E)/(z*(A*z+B)+Dd*F))-E/F;float fw=((W*(A*W+C*B)+Dd*E)/(W*(A*W+B)+Dd*F))-E/F;y=fz/fw;}
  else if(m==5){vec3 z=max(vec3(0.),x-.004);y=(z*(6.2*z+.5))/(z*(6.2*z+1.7)+.06);enc=true;}
  else if(m==6){float a=1.6,d=.977,hm=W,mi=.18,mo=.267;float b=(-pow(mi,a)+pow(hm,a)*mo)/((pow(hm,a*d)-pow(mi,a*d))*mo);float cc=(pow(hm,a*d)*pow(mi,a)-pow(hm,a)*pow(mi,a*d)*mo)/((pow(hm,a*d)-pow(mi,a*d))*mo);y=pow(x,vec3(a))/(pow(x,vec3(a*d))*b+cc);}
  else if(m==7){float P_=1.,a=1.,mm=.22,l=.4,cc=1.33,b=0.;float l0=((P_-mm)*l)/a,S0=mm+l0,S1=mm+a*l0,C2=a*P_/(P_-S1),CP=-C2/P_;vec3 w0=1.-smoothstep(0.,mm,x),w2=step(mm+l0,x),w1=1.-w0-w2;vec3 Tt=mm*pow(x/mm,vec3(cc))+b,Ss=P_-(P_-S1)*exp(CP*(x-S0)),Ll=mm+a*(x-mm);y=Tt*w0+Ll*w1+Ss*w2;}
  else if(m==8){mat3 ins=mat3(.842479,.042328,.042376,.078434,.878469,.078434,.079224,.079166,.879143);vec3 v=ins*x;v=clamp((log2(max(v,1e-10))+12.47393)/16.5,0.,1.);vec3 v2=v*v,v4=v2*v2;y=15.5*v4*v2-40.14*v4*v+31.96*v4-6.868*v2*v+.4298*v2+.1191*v-.00232;mat3 outs=mat3(1.196879,-.052897,-.052972,-.098021,1.151903,-.098043,-.09903,-.098961,1.151074);y=outs*y;enc=true;}
  else y=1.-exp(-x);
  return vec4(enc?clamp(y,0.,1.):pow(clamp(y,0.,1.),vec3(1./2.2)),1.);`,'10 operators');
f('reinhardlocal','Local Tone Mapping (Reinhard dodge & burn)',[P('Key',.05,.6,.18,.01),P('Sharpness',1,16,8,.5),P('Threshold',.01,.2,.05,.005)],
  `vec3 lin=pow(max(c.rgb,0.),vec3(2.2));float L0=luma(lin);float la=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)la+=log(.001+luma(pow(max(O(vec2(float(i)+.5,float(j)+.5)/8.).rgb,0.),vec3(2.2))));la=exp(la/64.);float Ls=u_p0/la*L0;float V1=Ls;
  float sc=1.;for(int k=0;k<5;k++){float s1=pow(1.6,float(k)),s2=s1*1.6;float v1=u_p0/la*pow(blurL(uv,R(s1)),2.2),v2=u_p0/la*pow(blurL(uv,R(s2)),2.2);float V=(v1-v2)/(exp2(u_p1)*u_p0/(s1*s1)+v1);V1=v1;if(abs(V)>u_p2)break;}float Ld=Ls/(1.+V1);return vec4(pow(clamp(lin*Ld/max(L0,1e-4),0.,1.),vec3(1./2.2)),1.);`,'Reinhard 2002 local operator');
f('expofusion','Exposure Fusion (single image)',[P('EV spread',.5,4,2,.1),P('Contrast weight',0,2,1,.05),P('Saturation weight',0,2,1,.05)],
  `vec3 lin=pow(max(c.rgb,0.),vec3(2.2));vec3 acc=vec3(0.);float ws=0.;for(int k=-1;k<=1;k++){vec3 e=pow(clamp(lin*exp2(float(k)*u_p0),0.,1.),vec3(1./2.2));vec3 eb=pow(clamp(pow(max(blur5(uv,R(2.)),0.),vec3(2.2))*exp2(float(k)*u_p0),0.,1.),vec3(1./2.2));float con=pow(length(e-eb)*4.+.02,u_p1);float mu=(e.r+e.g+e.b)/3.;float sat_=pow(length(e-mu)+.02,u_p2);vec3 we=exp(-(e-.5)*(e-.5)/(2.*.04));float w=con*sat_*we.r*we.g*we.b+1e-6;acc+=e*w;ws+=w;}return vec4(acc/ws,1.);`,'Mertens-style, no pyramid');
f('msr','Multi-Scale Retinex',[S('Variant',['MSR','MSRCR (color restoration)']),P('Gain',.5,4,1.4,.05),P('Offset',-.5,.5,0,.01)],
  `vec3 o=c.rgb+.01;vec3 r=vec3(0.);float sc[3]=float[3](15.,80.,250.);for(int k=0;k<3;k++)r+=(log(o)-log(blur5(uv,R(sc[k])*.25)+.01))/3.;if(u_p0>.5){vec3 cr=log(125.*o/(o.r+o.g+o.b))*.46;r*=cr;}return vec4(clamp(r*u_p1*.3+.5+u_p2,0.,1.),1.);`,'Jobson 1997');

/* ================= Texture analysis ================= */
f = add('Analysis');
f('glcm','Haralick Texture (GLCM)',[S('Feature',['Contrast','Homogeneity','Energy (ASM)','Entropy','Correlation','Dissimilarity']),P('Window',3,40,12,1,'px'),P('Offset',1,6,1,1,'px'),S('Direction',['0°','45°','90°','135°','Average'])],
  `float g[64];for(int i=0;i<64;i++)g[i]=0.;int dsel=int(u_p3+.5);float n=0.;for(int dd=0;dd<4;dd++){if(dsel<4&&dd!=dsel)continue;vec2 off=dd==0?vec2(1.,0.):dd==1?vec2(1.,1.):dd==2?vec2(0.,1.):vec2(-1.,1.);off*=u_p2*u_k*u_px;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*R(u_p1)/6.*u_px;int a=int(clamp(L(q)*8.,0.,7.)),b=int(clamp(L(q+off)*8.,0.,7.));g[a*8+b]+=1.;g[b*8+a]+=1.;n+=2.;}}
  int ft=int(u_p0+.5);float v=0.,mi=0.,mj=0.,si=0.,sj=0.;for(int k=0;k<64;k++){float p=g[k]/n;float i=float(k/8),j=float(k-8*(k/8));mi+=i*p;mj+=j*p;}for(int k=0;k<64;k++){float p=g[k]/n;float i=float(k/8),j=float(k-8*(k/8));si+=(i-mi)*(i-mi)*p;sj+=(j-mj)*(j-mj)*p;
   if(ft==0)v+=(i-j)*(i-j)*p/49.;else if(ft==1)v+=p/(1.+(i-j)*(i-j));else if(ft==2)v+=p*p;else if(ft==3){if(p>0.)v-=p*log2(p)/6.;}else if(ft==5)v+=abs(i-j)*p/7.;}
  if(ft==4){float cv=0.;for(int k=0;k<64;k++){float p=g[k]/n;cv+=(float(k/8)-mi)*(float(k-8*(k/8))-mj)*p;}v=.5+.5*cv/max(sqrt(si*sj),1e-4);}return vec4(vec3(clamp(v*(ft==0?4.:1.),0.,1.)),1.);`,'co-occurrence, 8 gray levels');
f('laws','Laws Texture Energy',[S('Mask',['L5E5','E5L5','L5S5','S5L5','E5E5','S5S5','R5R5','L5R5','E5S5','W5W5','L5W5','R5S5']),P('Energy window',2,40,10,1,'px'),P('Gain',1,40,8,.5)],
  [`float v5[25];int m=int(u_p0+.5);float A[5],B[5];float L5[5]=float[5](1.,4.,6.,4.,1.),E5[5]=float[5](-1.,-2.,0.,2.,1.),S5[5]=float[5](-1.,0.,2.,0.,-1.),R5[5]=float[5](1.,-4.,6.,-4.,1.),W5[5]=float[5](-1.,2.,0.,-2.,1.);
   int ia=m==0||m==2||m==7||m==10?0:m==1||m==4||m==8?1:m==3||m==5||m==11?2:m==6?3:4;int ib=m==0?1:m==1?0:m==2?2:m==3?0:m==4?1:m==5?2:m==6?3:m==7?3:m==8?2:m==9?4:m==10?4:2;
   for(int k=0;k<5;k++){A[k]=ia==0?L5[k]:ia==1?E5[k]:ia==2?S5[k]:ia==3?R5[k]:W5[k];B[k]=ib==0?L5[k]:ib==1?E5[k]:ib==2?S5[k]:ib==3?R5[k]:W5[k];}
   float mean_=blurL(uv,R(4.));float s=0.;for(int j=0;j<5;j++)for(int i=0;i<5;i++)s+=A[j]*B[i]*(L(uv+vec2(float(i-2),float(2-j))*u_px*max(u_k,1.))-mean_);return vec4(vec3(abs(s)/64.),1.);`,
   `float e=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++)e+=T(uv+vec2(float(i),float(j))*R(u_p1)/6.*u_px).r;return vec4(vec3(clamp(e/49.*u_p2,0.,1.)),1.);`],'Laws 1980, 5×5 masks');
f('tamura','Tamura Features',[S('Feature',['Coarseness','Contrast','Directionality']),P('Window',4,40,12,1,'px')],
  `int m=int(u_p0+.5);if(m==0){float best=0.,bk=0.;for(int k=0;k<5;k++){float s=exp2(float(k));float eh=abs(blurL(uv+vec2(s,0.)*u_k*u_px,R(s)*.5)-blurL(uv-vec2(s,0.)*u_k*u_px,R(s)*.5)),ev=abs(blurL(uv+vec2(0.,s)*u_k*u_px,R(s)*.5)-blurL(uv-vec2(0.,s)*u_k*u_px,R(s)*.5));float e=max(eh,ev);if(e>best*1.1){best=e;bk=float(k);}}return vec4(vec3(bk/4.),1.);}
  float m1=0.,m2=0.,m4=0.;float hist[8];for(int i=0;i<8;i++)hist[i]=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*R(u_p1)/6.*u_px;float l=L(q);m1+=l;m2+=l*l;vec2 g=sobel(q);if(length(g)>.1)hist[int(mod(atan(g.y,g.x),PI)/PI*7.99)]+=1.;}m1/=49.;float var=max(m2/49.-m1*m1,1e-6);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float d=L(uv+vec2(float(i),float(j))*R(u_p1)/6.*u_px)-m1;m4+=d*d*d*d;}m4/=49.;
  if(m==1)return vec4(vec3(clamp(sqrt(var)/pow(m4/(var*var),.25)*3.,0.,1.)),1.);float tot=0.,mx=0.;for(int i=0;i<8;i++){tot+=hist[i];mx=max(mx,hist[i]);}return vec4(vec3(tot>0.?mx/tot:0.),1.);`,'Tamura 1978');
f('fractaldim','Local Fractal Dimension',[P('Window',4,40,12,1,'px')],
  `float x1=0.,y1=0.,xy=0.,xx=0.;for(int k=0;k<4;k++){float s=exp2(float(k));float v=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*R(u_p0)/2.*u_px;v+=abs(L(q+vec2(s,0.)*u_k*u_px)-L(q))+abs(L(q+vec2(0.,s)*u_k*u_px)-L(q));}float lx=log(s),ly=log(v/9.+1e-4);x1+=lx;y1+=ly;xy+=lx*ly;xx+=lx*lx;}float slope=(4.*xy-x1*y1)/(4.*xx-x1*x1);return vec4(vec3(clamp((3.-slope-2.)*1.,0.,1.)),1.);`,'variation method, D in 2–3');
f('ssimmap','SSIM vs Source',[P('Window',2,20,6,.5,'px'),S('Display',['SSIM (white = same)','Dissimilarity ramp'])],
  `float ma=0.,mb=0.,va=0.,vb=0.,cov=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*R(u_p0)/3.*u_px;float a=L(q),b=luma(texture(u_src,q).rgb);ma+=a;mb+=b;va+=a*a;vb+=b*b;cov+=a*b;}ma/=49.;mb/=49.;va=va/49.-ma*ma;vb=vb/49.-mb*mb;cov=cov/49.-ma*mb;const float C1=.0001,C2=.0009;float s=((2.*ma*mb+C1)*(2.*cov+C2))/((ma*ma+mb*mb+C1)*(va+vb+C2));return vec4(u_p1<.5?vec3(clamp(s,0.,1.)):ramp(1,clamp(1.-s,0.,1.)),1.);`,'structural similarity, stack vs original');
f('blobdetect','Blob Detector (DoH / LoG)',[P('Scale (σ)',1,30,6,.5,'px'),S('Method',['Determinant of Hessian','Laplacian of Gaussian']),P('Gain',1,200,40,1)],
  `vec2 e=u_px*R(u_p0);float s=R(u_p0)*.5;float h=blurL(uv,s);float hxx=blurL(uv+vec2(e.x,0.),s)+blurL(uv-vec2(e.x,0.),s)-2.*h,hyy=blurL(uv+vec2(0.,e.y),s)+blurL(uv-vec2(0.,e.y),s)-2.*h,hxy=(blurL(uv+e,s)+blurL(uv-e,s)-blurL(uv+vec2(e.x,-e.y),s)-blurL(uv+vec2(-e.x,e.y),s))*.25;float v=u_p1<.5?(hxx*hyy-hxy*hxy)*u_p2*20.:abs(hxx+hyy)*u_p2*.5;return vec4(ramp(1,clamp(v,0.,1.)),1.);`,'scale-normalized blobs');
f('moravec','Moravec Corners',[P('Threshold',0,.5,.06,.005),P('Window',1,4,1,1,'px')],
  `float best=1e9;for(int k=0;k<8;k++){vec2 d=vec2(cos(float(k)*.785),sin(float(k)*.785))*u_px*max(u_k,1.);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*R(u_p1)*u_px;float df=L(q+d)-L(q);s+=df*df;}best=min(best,s);}float m=step(u_p0*.05,best);return vec4(mix(sat(c.rgb,.2)*.6,vec3(1.,.8,0.),m),1.);`,'Moravec 1980');

/* ================= Camera & sensor simulation ================= */
f = add('Sensor');
f('sensornoise','Sensor Noise',[P('ISO gain',0,1,.4,.01),P('Read noise',0,.1,.015,.001),P('Pixel non-uniformity',0,.1,.02,.001),P('Row banding',0,.05,.008,.001)],
  `vec2 p=floor(uv*u_res);vec3 lin=pow(max(c.rgb,0.),vec3(2.2));vec2 h1=hash2(p+.31),h2=hash2(p+7.7);vec3 gz=vec3(sqrt(-2.*log(max(h1.x,1e-6)))*cos(6.2832*h1.y),sqrt(-2.*log(max(h1.x,1e-6)))*sin(6.2832*h1.y),sqrt(-2.*log(max(h2.x,1e-6)))*cos(6.2832*h2.y));
  vec3 shot=gz*sqrt(lin*u_p0*.02+1e-6);vec3 rd=vec3(hash(p+1.),hash(p+2.),hash(p+3.))-.5;float prnu=1.+(hash(p*1.7+11.)-.5)*u_p2*2.;float band=(hash(vec2(p.y,99.))-.5)*u_p3*2.;vec3 y=lin*prnu+shot+rd*u_p1*2.+band;return vec4(pow(clamp(y,0.,1.),vec3(1./2.2)),1.);`,'shot + read + PRNU + banding',1);
f('bayersim','Bayer Demosaic Artifacts',[S('Demosaic',['Bilinear','Nearest (raw-ish)'])],
  [`vec2 px=floor(uv*u_res);bool ex=mod(px.x,2.)<.5,ey=mod(px.y,2.)<.5;float v=(ex==ey)?c.g:(ex?c.r:c.b);return vec4(v,0.,0.,1.);`,
   `vec2 px=floor(uv*u_res);bool ex=mod(px.x,2.)<.5,ey=mod(px.y,2.)<.5;vec2 e=u_px;float C=T(uv).r,N=T(uv+vec2(0.,e.y)).r,S_=T(uv-vec2(0.,e.y)).r,E=T(uv+vec2(e.x,0.)).r,W=T(uv-vec2(e.x,0.)).r,NE=T(uv+e).r,NW=T(uv+vec2(-e.x,e.y)).r,SE=T(uv+vec2(e.x,-e.y)).r,SW=T(uv-e).r;
   if(u_p0>.5){vec2 b=floor(px/2.)*2.;vec2 q=(b+.5)/u_res;return vec4(T(q+vec2(e.x,0.)).r,T(q).r,T(q+vec2(0.,e.y)).r,1.);}
   vec3 r;if(ex==ey){r=ex?vec3((N+S_)*.5,C,(E+W)*.5):vec3((E+W)*.5,C,(N+S_)*.5);}else if(ex){r=vec3(C,(N+S_+E+W)*.25,(NE+NW+SE+SW)*.25);}else{r=vec3((NE+NW+SE+SW)*.25,(N+S_+E+W)*.25,C);}return vec4(r,1.);`],'RGGB mosaic → demosaic');
f('rollingshutter','Rolling Shutter',[P('Skew',-1,1,.3,.01),P('Wobble',0,1,.2,.01),P('Wobble frequency',1,40,8,.5)],
  `float t=1.-uv.y;vec2 q=vec2(uv.x+t*u_p0*.2+sin(t*u_p2+u_seed)*u_p1*.02,uv.y);return T(fract(q));`,'skew + jello',1);
f('lensvignette','Natural Vignetting (cos⁴)',[P('Focal length',8,135,28,1,'mm'),P('Mechanical',0,1,.2,.01)],
  `vec2 p=(uv-.5)*vec2(36.,36./asp());float r=length(p);float th=atan(r/u_p0);float v=pow(cos(th),4.);v*=1.-u_p1*smoothstep(.35,.75,length((uv-.5)*vec2(asp(),1.)));return vec4(c.rgb*v,1.);`,'36 mm sensor, cos⁴ law');
f('camshake','Camera Shake',[P('Shake',0,60,14,.5,'px'),P('Smoothness',0,1,.6,.01)],
  `vec2 pos=vec2(0.),vel=vec2(0.);vec4 a=vec4(0.);for(int i=0;i<24;i++){vec2 rnd=vec2(hash1(float(i)*1.7),hash1(float(i)*3.1+5.))-.5;vel=mix(rnd,vel,u_p1);pos+=vel;a+=T(uv+pos/12.*R(u_p0)*u_px);}return a/24.;`,'random motion-blur kernel',1);
f('moire','Moiré Pattern',[P('Grid period',2,12,4,.1,'px'),P('Angle',0,45,6,.1,'°'),P('Strength',0,1,.5,.01)],
  `vec2 p=PX(uv);float g1=.5+.5*cos(6.2832*p.x/u_p0),g2=.5+.5*cos(6.2832*rot(p,radians(u_p1)).x/(u_p0*1.04));float beat=g1*g2;float lowpass=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=p+vec2(float(i),float(j))*u_p0*.5;lowpass+=(.5+.5*cos(6.2832*q.x/u_p0))*(.5+.5*cos(6.2832*rot(q,radians(u_p1)).x/(u_p0*1.04)));}lowpass/=25.;return vec4(c.rgb*(1.-u_p2+u_p2*lowpass*2.2),1.);`,'screen-capture interference');
f('deadpixels','Hot & Dead Pixels',[P('Hot pixels',0,.01,.001,.0001),P('Dead pixels',0,.01,.0005,.0001),P('Stuck colors',0,1,.3,.01)],
  `vec2 p=floor(uv*u_res);float h=hash(p*1.3+.7);if(h<u_p0)return vec4(hash(p+5.)<u_p2?hsv2rgb(vec3(hash(p+9.),1.,1.)):vec3(1.),1.);if(h>1.-u_p1)return vec4(vec3(0.),1.);return c;`,'sensor defects',1);
f('interlace','Interlace Combing',[P('Motion',0,40,8,.5,'px')],
  `float row=floor(uv.y*u_res.y);return mod(row,2.)<.5?T(uv+vec2(R(u_p0)*u_px.x,0.)):c;`,'fields captured at different times');
f('resample','Low-Res Resample',[P('Scale',.05,1,.25,.01),S('Upscale',['Nearest','Bilinear','Bicubic-ish'])],
  `vec2 r=u_res*u_p0;vec2 p=uv*r-.5;int m=int(u_p1+.5);if(m==0)return T((floor(uv*r)+.5)/r);if(m==1){vec2 i=floor(p),fq=fract(p);return mix(mix(T((i+.5)/r),T((i+vec2(1.5,.5))/r),fq.x),mix(T((i+vec2(.5,1.5))/r),T((i+1.5)/r),fq.x),fq.y);}
  vec2 i=floor(p),fq=fract(p);vec4 acc=vec4(0.);float ws=0.;for(int j=-1;j<=2;j++)for(int k=-1;k<=2;k++){vec2 d=vec2(float(k),float(j))-fq;float w=max(0.,1.-length(d)/2.);w=w*w*(3.-2.*w);acc+=T((i+vec2(float(k),float(j))+.5)/r)*w;ws+=w;}return acc/ws;`,'simulate a lower-res sensor');

/* ================= Morphology, wavelets, color constancy ================= */
const GDIL = `vec3 m=T(uv).rgb;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)m=max(m,T(uv+vec2(float(i),float(j))*u_px).rgb);return vec4(min(m,O(uv).rgb),1.);`;
const GREC = `int op=int(u_p0+.5);vec3 m=T(uv).rgb;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 s=T(uv+vec2(float(i),float(j))*u_px).rgb;m=op==0?max(m,s):min(m,s);}vec3 o=O(uv).rgb;return vec4(op==0?min(m,o):max(m,o),1.);`;
const GERO = `vec3 m=T(uv).rgb;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)m=min(m,T(uv+vec2(float(i),float(j))*u_px).rgb);return vec4(max(m,O(uv).rgb),1.);`;
f = add('Edges');
f('reconstruct','Morphological Reconstruction',[S('Operation',['Opening by reconstruction','Closing by reconstruction']),P('Marker radius',1,6,3,1,'px')],
  [`int op=int(u_p0+.5);vec3 m=vec3(op==0?1.:0.);for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j));if(length(o)>u_p1+.5)continue;vec3 s=T(uv+o*u_px).rgb;m=op==0?min(m,s):max(m,s);}return vec4(m,1.);`,
   ...Array(10).fill(GREC)],'geodesic, 10 iterations');
f('hmaxima','H-Maxima / Peaks',[P('Height h',0,.5,.1,.005),S('Output',['Peaks (f − reconstruction)','Reconstruction'])],
  [`return vec4(max(c.rgb-u_p0,0.),1.);`,...Array(10).fill(GDIL),`vec3 r=T(uv).rgb;return vec4(u_p1<.5?clamp((O(uv).rgb-r)/max(u_p0,.01),0.,1.):r,1.);`],'regional maxima taller than h');
f('regionalmax','Regional Extrema',[P('Window',1,20,4,1,'px'),S('Find',['Maxima','Minima'])],
  `float l=L(uv);bool ext=true;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(i==0&&j==0)continue;float s=L(uv+vec2(float(i),float(j))*R(u_p0)/4.*u_px);if(u_p1<.5?s>l:s<l)ext=false;}return vec4(ext?vec3(1.,.3,.2):sat(c.rgb,.2)*.5,1.);`,'local peaks / pits');
const ASF = r => [`vec3 m=vec3(1.);for(int j=-${r};j<=${r};j++)for(int i=-${r};i<=${r};i++){if(length(vec2(float(i),float(j)))>${r}.5)continue;m=min(m,T(uv+vec2(float(i),float(j))*u_k*u_px).rgb);}return vec4(m,1.);`,
  `vec3 m=vec3(0.);for(int j=-${r};j<=${r};j++)for(int i=-${r};i<=${r};i++){if(length(vec2(float(i),float(j)))>${r}.5)continue;m=max(m,T(uv+vec2(float(i),float(j))*u_k*u_px).rgb);}return vec4(m,1.);`];
f('asf','Alternating Sequential Filter',[],[...ASF(1),...ASF(1).reverse(),...ASF(2),...ASF(2).reverse(),...ASF(3),...ASF(3).reverse()],'open/close, radii 1→3');
const ATROUS = i => `if(${i}.>=u_p0)return T(uv);float sp=${1 << i}.*max(u_k,1.);float w[5]=float[5](1.,4.,6.,4.,1.);vec3 a=vec3(0.);for(int j=-2;j<=2;j++)for(int k=-2;k<=2;k++)a+=T(uv+vec2(float(k),float(j))*sp*u_px).rgb*w[j+2]*w[k+2];return vec4(a/256.,1.);`;
f('atrous','Wavelet Decompose (à trous)',[P('Level',1,6,2,1),S('Output',['Detail band','Smooth residual','Detail boosted'])],
  [ATROUS(0),ATROUS(1),ATROUS(2),ATROUS(3),ATROUS(4),
   `float sp=exp2(u_p0)*max(u_k,1.);float w[5]=float[5](1.,4.,6.,4.,1.);vec3 a=vec3(0.);for(int j=-2;j<=2;j++)for(int k=-2;k<=2;k++)a+=T(uv+vec2(float(k),float(j))*sp*u_px).rgb*w[j+2]*w[k+2];a/=256.;vec3 band=T(uv).rgb-a;int o=int(u_p1+.5);return vec4(o==0?.5+band*2.:o==1?a:O(uv).rgb+band*1.5,1.);`],'B3-spline, GIMP / Krita wavelets');
f = add('Color');
f('colorconstancy','Color Constancy',[S('Method',['Gray world','White patch (max RGB)','Shades of gray (p = 6)','Gray edge']),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 acc=vec3(0.);vec3 mx=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;vec3 s=O(q).rgb;if(m==0)acc+=s;else if(m==1)mx=max(mx,s);else if(m==2)acc+=pow(s,vec3(6.));else{vec2 e=vec2(.004);acc+=abs(O(q+vec2(e.x,0.)).rgb-O(q-vec2(e.x,0.)).rgb)+abs(O(q+vec2(0.,e.y)).rgb-O(q-vec2(0.,e.y)).rgb);}}
  vec3 ill=m==1?mx:m==2?pow(acc/256.,vec3(1./6.)):acc;ill/=max(dot(ill,vec3(1./3.)),1e-4);return vec4(mix(c.rgb,c.rgb/max(ill,vec3(.05)),u_p1),1.);`,'automatic white balance');
