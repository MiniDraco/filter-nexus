/* ================= Round 6: classic denoise families, local moments, low light ================= */
f = add('Noise');
f('statfilters','Mean & Order-Statistic Filters',[S('Type',['Arithmetic mean','Geometric mean','Harmonic mean','Contraharmonic mean','Midpoint','Alpha-trimmed mean','Conservative smoothing']),S('Window',['3×3','5×5','7×7']),P('Contraharmonic Q',-3,3,1.5,.1),P('Trim (d of n)',0,.9,.4,.01)],
  `int r=int(u_p1+.5)+1;vec3 s[49];int n=0;float e=max(u_k,1.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>r||abs(j)>r)continue;s[n]=T(uv+vec2(float(i),float(j))*u_px*e).rgb;n++;}
  int m=int(u_p0+.5);vec3 a=vec3(0.),g=vec3(0.),h=vec3(0.),cp=vec3(0.),cq=vec3(0.),mx=vec3(0.),mn=vec3(1.),nx=vec3(0.),nn=vec3(1.);float fn=float(n);
  for(int k=0;k<49;k++){if(k>=n)break;vec3 v=max(s[k],vec3(.002));a+=v;g+=log(v);h+=1./v;cp+=pow(v,vec3(u_p2+1.));cq+=pow(v,vec3(u_p2));mx=max(mx,v);mn=min(mn,v);if(k!=n/2){nx=max(nx,v);nn=min(nn,v);}}
  if(m==0)return vec4(a/fn,1.);if(m==1)return vec4(exp(g/fn),1.);if(m==2)return vec4(fn/h,1.);if(m==3)return vec4(clamp(cp/cq,0.,1.),1.);if(m==4)return vec4((mx+mn)*.5,1.);if(m==6)return vec4(clamp(c.rgb,nn,nx),1.);
  int d=int(u_p3*fn*.5);vec3 acc=vec3(0.);float w=0.;for(int k=0;k<49;k++){if(k>=n)break;float l=luma(s[k]);int rk=0;for(int q=0;q<49;q++){if(q>=n)break;float lq=luma(s[q]);rk+=(lq<l||(lq==l&&q<k))?1:0;}if(rk>=d&&rk<n-d){acc+=s[k];w+=1.;}}return vec4(acc/max(w,1.),1.);`,'Gonzalez & Woods ch. 5');
f('speckle','Speckle Filter (Lee / Kuan / Frost)',[S('Method',['Lee','Kuan','Frost','Lee sigma (additive)']),P('Window radius',1,7,3,1,'px'),P('Looks (ENL)',1,16,4,.5),P('Frost damping / sigma',.01,1,.2,.01)],
  `int r=int(u_p1+.5);float e=max(u_k,1.);vec3 sm=vec3(0.),sq=vec3(0.);float n=0.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;sm+=v;sq+=v*v;n+=1.;}
  vec3 mu=sm/n,va=max(sq/n-mu*mu,vec3(0.));vec3 ci2=va/max(mu*mu,vec3(1e-4));float cu2=1./u_p2;int m=int(u_p0+.5);
  if(m==0)return vec4(mu+clamp(1.-cu2/max(ci2,vec3(1e-5)),0.,1.)*(c.rgb-mu),1.);if(m==1)return vec4(mu+clamp((1.-cu2/max(ci2,vec3(1e-5)))/(1.+cu2),0.,1.)*(c.rgb-mu),1.);
  vec3 acc=vec3(0.),ws=vec3(0.);for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;vec3 w;
   if(m==2)w=exp(-u_p3*10.*ci2*length(vec2(float(i),float(j))));else w=step(abs(v-c.rgb),vec3(2.*u_p3*.25));acc+=w*v;ws+=w;}return vec4(acc/max(ws,vec3(1e-5)),1.);`,'SAR / ultrasound speckle (Lee 1980, Kuan 1985, Frost 1982)');
const SRAD_C = `vec3 o=T(uv).rgb;float I=max(luma(o),.01);vec2 e=u_px;float n_=L(uv+vec2(0.,e.y)),s_=L(uv-vec2(0.,e.y)),e_=L(uv+vec2(e.x,0.)),w_=L(uv-vec2(e.x,0.));
  float g2=((e_-I)*(e_-I)+(I-w_)*(I-w_)+(n_-I)*(n_-I)+(I-s_)*(I-s_))/(I*I);float lap=(n_+s_+e_+w_-4.*I)/I;float q2=(.5*g2-.0625*lap*lap)/((1.+.25*lap)*(1.+.25*lap));float q0=u_p0*u_p0;
  return vec4(o,clamp(1./(1.+(q2-q0)/(q0*(1.+q0))),0.,1.));`;
const SRAD_U = `vec4 o=T(uv);vec2 e=u_px;vec3 d=vec3(0.);for(int k=0;k<4;k++){vec2 q=uv+(k==0?vec2(e.x,0.):k==1?vec2(-e.x,0.):k==2?vec2(0.,e.y):vec2(0.,-e.y));vec4 t=T(q);d+=.5*(o.a+t.a)*(t.rgb-o.rgb);}return vec4(o.rgb+u_p1*.24*d,o.a);`;
f('srad','SRAD (Speckle-Reducing Anisotropic Diffusion)',[P('Speckle scale q0',.02,1,.25,.01),P('Step',.1,1,.8,.01)],
  [`return O(uv);`,...Array(14).fill(0).flatMap(() => [SRAD_C, SRAD_U]),`return vec4(T(uv).rgb,1.);`],'Yu & Acton 2002, 14 iterations');
// Chambolle (2004) dual projection on luminance, p stored as .rg (encoded .5+.5p)
const TVP = `vec2 e=u_px;float lam=u_p0;
  #define PP(q) (T(q).rg*2.-1.)
  #define DIV(q) (PP(q).x-PP(q-vec2(e.x,0.)).x+PP(q).y-PP(q-vec2(0.,e.y)).y)
  #define W(q) (DIV(q)-luma(O(q).rgb)/lam)
  float w0=W(uv);vec2 g=vec2(W(uv+vec2(e.x,0.))-w0,W(uv+vec2(0.,e.y))-w0);vec2 p=(PP(uv)+.125*g)/(1.+.125*length(g));return vec4(p*.5+.5,0.,1.);`;
f('tvdenoise','Total Variation Denoise (ROF)',[P('Weight',.01,.4,.08,.005)],
  [`return vec4(.5,.5,0.,1.);`,...Array(40).fill(TVP),
   `vec2 e=u_px;vec2 p=T(uv).rg*2.-1.;float dv=p.x-(T(uv-vec2(e.x,0.)).r*2.-1.)+p.y-(T(uv-vec2(0.,e.y)).g*2.-1.);vec3 o=O(uv).rgb;float u=luma(o)-u_p0*dv;return vec4(clamp(o+(u-luma(o)),0.,1.),1.);`],'Chambolle projection, 40 iterations (skimage denoise_tv_chambolle)');
f('modefilter','Majority / Mode Filter',[P('Levels',2,16,6,1),P('Window radius',1,4,2,1,'px')],
  `int r=int(u_p1+.5);float N=floor(u_p0+.5);float cnt[16];vec3 sm[16];for(int b=0;b<16;b++){cnt[b]=0.;sm[b]=vec3(0.);}float e=max(u_k,1.);
  for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;int b=int(min(floor(luma(v)*N),N-1.));cnt[b]+=1.;sm[b]+=v;}
  int cb=int(min(floor(luma(c.rgb)*N),N-1.));int best=cb;for(int b=0;b<16;b++)if(cnt[b]>cnt[best])best=b;return vec4(sm[best]/max(cnt[best],1.),1.);`,'cleans label / segmentation maps');
f = add('Analysis');
f('localmoments','Local Moments (Skewness / Kurtosis / CV)',[S('Statistic',['Skewness','Excess kurtosis','Coefficient of variation','Interquartile range','Percentile']),P('Window',2,40,8,1,'px'),P('Gain',.2,10,1,.1),P('Percentile',0,100,90,1,'%')],
  `float st=R(u_p1)/3.;float s[49];float m1=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float v=L(uv+vec2(float(i),float(j))*st*u_px);s[(j+3)*7+i+3]=v;m1+=v;}m1/=49.;float m2=0.,m3=0.,m4=0.;
  for(int k=0;k<49;k++){float d=s[k]-m1;m2+=d*d;m3+=d*d*d;m4+=d*d*d*d;}m2/=49.;m3/=49.;m4/=49.;int m=int(u_p0+.5);float o;
  if(m==0)o=.5+m3/pow(max(m2,1e-6),1.5)*u_p2*.15;else if(m==1)o=.5+(m4/max(m2*m2,1e-8)-3.)*u_p2*.06;else if(m==2)o=sqrt(m2)/max(m1,.01)*u_p2;else{
   float q1=m==3?.25:u_p3/100.;float q2=.75;float a1=0.,a2=0.;for(int k=0;k<49;k++){int rk=0;for(int q=0;q<49;q++)rk+=(s[q]<s[k]||(s[q]==s[k]&&q<k))?1:0;if(rk==int(q1*48.+.5))a1=s[k];if(rk==int(q2*48.+.5))a2=s[k];}o=m==3?(a2-a1)*u_p2*2.:a1;}
  return vec4(vec3(clamp(o,0.,1.)),1.);`,'7×7 sampled window');
f = add('Tone');
f('lowlight','Low-Light Enhancement (LIME / Dong)',[S('Method',['LIME (illumination map)','Dong (inverted dehaze)']),P('Gamma / strength',.3,1,.7,.01),P('Window',2,40,8,1,'px')],
  [`vec3 o=O(uv).rgb;return vec4(vec3(u_p0<.5?max(o.r,max(o.g,o.b)):min(1.-o.r,min(1.-o.g,1.-o.b))),1.);`,MM1('vec2(1.,0.)','u_p2','u_p0>.5'),MM1('vec2(0.,1.)','u_p2','u_p0>.5'),BH('u_p2*.5'),BV('u_p2*.5'),
   `vec3 o=O(uv).rgb;float t=T(uv).r;if(u_p0<.5)return vec4(clamp(o/pow(max(t,.04),u_p1),0.,1.),1.);vec3 iv=1.-o;float tr=max(1.-u_p1*t,.1);return vec4(clamp(1.-((iv-1.)/tr+1.),0.,1.),1.);`],'Guo 2017 LIME, Dong 2011');
