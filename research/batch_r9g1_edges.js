/* ================= Round 9G1: edge operators II, corners, keypoints, local phase, vesselness, GVF, Canny stages ================= */
// scale-normalised Hessian (σ² · second derivatives of Gaussian) of luminance at scale `sig` px
const HESS2 = sig => `float sg=max(R(${sig}),.5);float rr=min(ceil(3.*sg),8.);float st=max(1.,ceil(3.*sg)/8.);float hxx=0.,hyy=0.,hxy=0.,gx=0.,gy=0.,gw=0.;
  for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(float(i))>rr||abs(float(j))>rr)continue;vec2 d=vec2(float(i),float(j))*st;float g=exp(-dot(d,d)/(2.*sg*sg));float v=L(uv+d*u_px);hxx+=v*g*(d.x*d.x/(sg*sg)-1.);hyy+=v*g*(d.y*d.y/(sg*sg)-1.);hxy+=v*g*d.x*d.y/(sg*sg);gx+=v*g*d.x/sg;gy+=v*g*d.y/sg;gw+=g;}
  hxx/=gw;hyy/=gw;hxy/=gw;gx/=gw;gy/=gw;float tmp=sqrt((hxx-hyy)*(hxx-hyy)+4.*hxy*hxy);float ea=.5*(hxx+hyy+tmp),eb=.5*(hxx+hyy-tmp);float l1=abs(ea)<abs(eb)?ea:eb,l2=abs(ea)<abs(eb)?eb:ea;`;
f = add('Edges');
f('edgeops2','Edge Operators II',[S('Operator',['Shen-Castan (ISEF)','Deriche','Nevatia-Babu (6 masks)','Haralick facet','Prewitt compass (8 directions)','SUSAN edge']),P('Scale',.5,4,1.2,.05,'px'),P('Gain',1,40,6,.5),P('SUSAN brightness t',.02,.3,.1,.01)],
  `int m=int(u_p0+.5);float s=R(u_p1);float o=0.;float C=L(uv);
  if(m==0){float bl[5];for(int q=0;q<5;q++){vec2 base=uv+(q==0?vec2(0.):q==1?vec2(u_px.x,0.):q==2?vec2(-u_px.x,0.):q==3?vec2(0.,u_px.y):vec2(0.,-u_px.y));float a=0.,w=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 d=vec2(float(i),float(j))*max(s*.5,1.);float k=exp(-(abs(d.x)+abs(d.y))/s);a+=k*L(base+d*u_px);w+=k;}bl[q]=a/w-L(base);}
   float zc=0.;for(int q=1;q<5;q++)zc=max(zc,step(bl[0]*bl[q],0.)*abs(bl[0]-bl[q]));o=zc*u_p2*4.;}
  else if(m==1){float gx=0.,gy=0.,w=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*max(s*.4,1.);float e=exp(-(abs(d.x)+abs(d.y))/s);float v=L(uv+d*u_px);gx+=d.x*e*v;gy+=d.y*e*v;w+=abs(d.x)*e;}o=length(vec2(gx,gy))/w*u_p2;}
  else if(m==2){float best=0.;for(int k=0;k<6;k++){float a=float(k)*.5236;vec2 n=vec2(cos(a),sin(a));float acc=0.,cnt=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 d=vec2(float(i),float(j));float sd=dot(d,n);if(abs(sd)<.5)continue;acc+=sign(sd)*L(uv+d*max(s*.6,1.)*u_px);cnt+=1.;}best=max(best,abs(acc)/cnt);}o=best*u_p2;}
  else if(m==3){float gx=0.,gy=0.,kxx=0.,kyy=0.,kxy=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 d=vec2(float(i),float(j));float v=L(uv+d*max(s*.6,1.)*u_px);gx+=d.x*v;gy+=d.y*v;kxx+=(d.x*d.x-2.)*v;kyy+=(d.y*d.y-2.)*v;kxy+=d.x*d.y*v;}
   gx/=50.;gy/=50.;float fxx=2.*kxx/70.,fyy=2.*kyy/70.,fxy=kxy/100.;float gm=length(vec2(gx,gy));float f2=(fxx*gx*gx+2.*fxy*gx*gy+fyy*gy*gy)/max(gm*gm,1e-6);o=gm*exp(-pow(f2/max(gm,1e-4)*1.5,2.))*u_p2*4.;}
  else if(m==4){float r[8];ring8(uv,r);float mk[8]=float[8](1.,1.,1.,1.,-1.,-1.,-1.,1.);float best=0.;for(int k=0;k<8;k++){float acc=-2.*C;for(int i=0;i<8;i++){int idx=i-k;if(idx<0)idx+=8;acc+=mk[idx]*r[i];}best=max(best,abs(acc));}o=best*u_p2*.5;}
  else{float n=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));if(dot(d,d)>11.6)continue;float x=(L(uv+d*max(s*.6,1.)*u_px)-C)/u_p3;n+=exp(-x*x*x*x*x*x);}o=max(27.75-n,0.)/27.75*u_p2*.4;}
  return vec4(vec3(clamp(o,0.,1.)),1.);`,'Shen & Castan 1992, Deriche 1987, Nevatia & Babu 1980, Haralick 1984, Smith & Brady 1997 (SUSAN)');
f('corners2','Corner Detectors II',[S('Detector',['SUSAN corner','Förstner','Kitchen-Rosenfeld','Wang-Brady','Trajkovic']),P('Scale',.5,4,1.5,.05,'px'),P('Gain',1,200,30,1),S('Output',['Response map','Over image'])],
  `int m=int(u_p0+.5);float o=0.;float C=L(uv);
  if(m==0){float n=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));if(dot(d,d)>11.6)continue;float x=(L(uv+d*max(R(u_p1)*.6,1.)*u_px)-C)/.1;n+=exp(-x*x*x*x*x*x);}o=max(18.5-n,0.)/18.5*u_p2*.03*8.;}
  else if(m==1){float a=0.,b=0.,cc=0.;float sg=R(u_p1);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))*max(sg*.6,1.);float w=exp(-dot(d,d)/(2.*sg*sg*2.));vec2 q=uv+d*u_px;float ix=L(q+vec2(u_px.x,0.))-L(q-vec2(u_px.x,0.)),iy=L(q+vec2(0.,u_px.y))-L(q-vec2(0.,u_px.y));a+=w*ix*ix;b+=w*ix*iy;cc+=w*iy*iy;}
   float det=a*cc-b*b,tr=a+cc;float q=4.*det/max(tr*tr,1e-8);o=det/max(tr,1e-6)*smoothstep(.4,.7,q)*u_p2;}
  else if(m==4){float best=1e9;for(int k=0;k<4;k++){float an=float(k)*.785;vec2 d=vec2(cos(an),sin(an))*max(R(u_p1)*1.5,1.)*u_px;float a=L(uv+d)-C,b=L(uv-d)-C;best=min(best,a*a+b*b);}o=best*u_p2*.3;}
  else{${HESS2('u_p1')}float g2=gx*gx+gy*gy;if(m==2)o=abs((hxx*gy*gy+hyy*gx*gx-2.*hxy*gx*gy)/max(g2,1e-5))*sqrt(g2)*u_p2*.3;else{float itt=(hxx*gy*gy-2.*hxy*gx*gy+hyy*gx*gx)/max(g2,1e-5);o=max(itt*itt-.04*g2,0.)*u_p2*.5;}}
  vec3 col=ramp(1,clamp(o,0.,1.));return vec4(u_p3>.5?mix(c.rgb*.5,vec3(1.,.9,.2),clamp(o,0.,1.)):col,1.);`,'Smith & Brady, Förstner & Gülch 1987, Kitchen & Rosenfeld 1982, Wang & Brady 1995, Trajkovic & Hedley 1998');
f('keypoints','Keypoint Response (DoG / Hessian / SURF / CenSurE)',[S('Detector',['SIFT DoG (multi-scale)','Hessian-Laplace (det, multi-scale)','SURF box Hessian','CenSurE / STAR (center-surround)']),P('Base scale',.8,6,1.6,.05,'px'),P('Gain',1,100,20,.5),S('Output',['Response (colour = scale)','Over image'])],
  `int m=int(u_p0+.5);float best=0.,bs=0.;
  if(m==0){float pv=0.;for(int k=0;k<4;k++){float sg=R(u_p1)*pow(1.6,float(k));float a=0.,w=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*sg*.5;float g=exp(-dot(d,d)/(2.*sg*sg));a+=g*L(uv+d*u_px);w+=g;}a/=w;if(k>0){float r=abs(a-pv)*u_p2;if(r>best){best=r;bs=float(k-1)/2.;}}pv=a;}}
  else if(m==1){for(int k=0;k<3;k++){float scl=u_p1*pow(1.6,float(k));${HESS2('scl')}float r=abs(hxx*hyy-hxy*hxy)*u_p2*4.;if(r>best){best=r;bs=float(k)/2.;}}}
  else if(m==2){for(int k=0;k<3;k++){float l=max(floor(R(u_p1)*1.5*pow(1.6,float(k))),1.);vec4 sx=vec4(0.),sy=vec4(0.),sq=vec4(0.);for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*l/3.;float v=L(uv+d*u_px);
    float ax=abs(d.x),ay=abs(d.y);if(ay<l){if(ax<l*.5)sx.xy+=vec2(v,1.);else if(ax<l*1.5)sx.zw+=vec2(v,1.);}if(ax<l){if(ay<l*.5)sy.xy+=vec2(v,1.);else if(ay<l*1.5)sy.zw+=vec2(v,1.);}if(ax>0.&&ay>0.&&ax<=l&&ay<=l){if(d.x*d.y>0.)sq.xy+=vec2(v,1.);else sq.zw+=vec2(v,1.);}}
    float dxx=sx.z/max(sx.w,1.)-sx.x/max(sx.y,1.),dyy=sy.z/max(sy.w,1.)-sy.x/max(sy.y,1.),dxy=sq.x/max(sq.y,1.)-sq.z/max(sq.w,1.);float r=abs(dxx*dyy-.81*dxy*dxy)*u_p2*4.;if(r>best){best=r;bs=float(k)/2.;}}}
  else{for(int k=0;k<3;k++){float n=max(R(u_p1)*pow(1.6,float(k)),1.);float ai=0.,ci=0.,ao=0.,co=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*n/3.;float v=L(uv+d*u_px);float mx=max(abs(d.x),abs(d.y));if(mx<=n){ai+=v;ci+=1.;}else if(mx<=2.*n){ao+=v;co+=1.;}}float r=abs(ai/max(ci,1.)-ao/max(co,1.))*u_p2;if(r>best){best=r;bs=float(k)/2.;}}}
  best=clamp(best,0.,1.);if(u_p3>.5)return vec4(mix(c.rgb*.45,hsv2rgb(vec3(.6-bs*.6,.9,1.)),best),1.);return vec4(hsv2rgb(vec3(.6-bs*.6,.9,best)),1.);`,'scale-space detector responses (Lowe 2004, Mikolajczyk 2004, Bay 2006, Agrawal 2008)');
f('monogenic','Monogenic Signal (Local Phase / Orientation)',[P('Scale',1,16,3,.1,'px'),S('Output',['Local phase','Local orientation (colour)','Local energy','Feature asymmetry (edges)','Feature symmetry (lines)']),P('Gain',.2,10,2,.05)],
  [`float l=L(uv);return vec4(l,l,0.,1.);`,
   `float s1=R(u_p0),s2=R(u_p0)*2.;vec2 a=vec2(0.),w=vec2(0.);for(int k=-24;k<=24;k++){float x=float(k)*max(s2/12.,1.);vec2 g=vec2(exp(-x*x/(2.*s1*s1)),exp(-x*x/(2.*s2*s2)));vec2 v=T(uv+vec2(x*u_px.x,0.)).rg;a+=g*v;w+=g;}return vec4(a/w,0.,1.);`,
   `float s1=R(u_p0),s2=R(u_p0)*2.;vec2 a=vec2(0.),w=vec2(0.);for(int k=-24;k<=24;k++){float x=float(k)*max(s2/12.,1.);vec2 g=vec2(exp(-x*x/(2.*s1*s1)),exp(-x*x/(2.*s2*s2)));vec2 v=T(uv+vec2(0.,x*u_px.y)).rg;a+=g*v;w+=g;}vec2 b=a/w;return vec4(b.x-b.y+.5,0.,0.,1.);`,
   `float bp=T(uv).r-.5;vec2 rz=vec2(0.);float st=max(R(u_p0)*.5,1.);for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(i==0&&j==0)continue;vec2 d=vec2(float(i),float(j));float r=length(d);if(r>8.5)continue;rz+=(T(uv+d*st*u_px).r-.5)*d/(r*r*r);}rz/=6.2832;
   float A=sqrt(bp*bp+dot(rz,rz));int m=int(u_p1+.5);float ph=atan(length(rz),bp);vec3 o;if(m==0)o=vec3(ph/3.14159);else if(m==1)o=hsv2rgb(vec3(atan(rz.y,rz.x)/6.2832+.5,1.,clamp(A*u_p2*20.,0.,1.)));else if(m==2)o=vec3(clamp(A*u_p2*20.,0.,1.));
   else if(m==3)o=vec3(clamp((length(rz)-abs(bp))*u_p2*30.,0.,1.));else o=vec3(clamp((abs(bp)-length(rz))*u_p2*30.,0.,1.));return vec4(o,1.);`],'Felsberg & Sommer 2001: DoG band-pass + Riesz transform');
f('steerable','Steerable Filters (G2)',[P('Scale',.7,6,1.5,.05,'px'),S('Output',['Max oriented energy','Orientation (colour)','Steered to angle']),P('Angle',0,180,0,1,'°'),P('Gain',1,60,12,.5)],
  `float sg=R(u_p0);float a=0.,b=0.,cc=0.,w=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*max(sg*.45,.5);vec2 x=d/sg;float g=exp(-dot(x,x));float v=L(uv+d*u_px);a+=.9213*(2.*x.x*x.x-1.)*g*v;b+=1.843*x.x*x.y*g*v;cc+=.9213*(2.*x.y*x.y-1.)*g*v;w+=g;}a/=w;b/=w;cc/=w;
  int m=int(u_p1+.5);float r1=.5*(a+cc+sqrt((a-cc)*(a-cc)+4.*b*b)),r2=.5*(a+cc-sqrt((a-cc)*(a-cc)+4.*b*b));float e=max(abs(r1),abs(r2));
  if(m==0)return vec4(vec3(clamp(e*u_p3,0.,1.)),1.);if(m==1){float th=.5*atan(-2.*b,a-cc);return vec4(hsv2rgb(vec3(th/3.14159+.5,1.,clamp(e*u_p3,0.,1.))),1.);}
  float t=radians(u_p2);float cs=cos(t),sn=sin(t);float r=cs*cs*a-2.*cs*sn*b+sn*sn*cc;return vec4(vec3(clamp(.5+r*u_p3,0.,1.)),1.);`,'Freeman & Adelson 1991 second-derivative basis');
f('vesselness2','Vesselness II (Jerman / Zana-Klein / OOF / Blobness)',[S('Method',['Jerman 2016','Zana-Klein (line openings)','Optimally oriented flux','Hessian blobness']),P('Scale',.7,6,2,.05,'px'),S('Polarity',['Bright structures','Dark structures']),P('Gain / τ',.01,1,.3,.01)],
  `int m=int(u_p0+.5);float pol=u_p2>.5?-1.:1.;float o=0.;
  if(m==1){float Lg=max(R(u_p1)*3.,3.);float sup=0.,inf=1.;for(int k=0;k<12;k++){float an=float(k)*.2618;vec2 dir=vec2(cos(an),sin(an))*u_px;float op=0.;for(int t=-5;t<=0;t++){float mn=1.;for(int q=0;q<=5;q++){float v=L(uv+dir*float(t+q)*Lg/5.);mn=min(mn,pol>0.?v:1.-v);}op=max(op,mn);}sup=max(sup,op);inf=min(inf,op);}o=(sup-inf)*u_p3*8.;}
  else if(m==2){float r=R(u_p1);float q11=0.,q12=0.,q22=0.;for(int k=0;k<16;k++){float an=float(k)*.3927;vec2 n=vec2(cos(an),sin(an));vec2 p=uv+n*r*u_px;vec2 g=vec2(L(p+vec2(u_px.x,0.))-L(p-vec2(u_px.x,0.)),L(p+vec2(0.,u_px.y))-L(p-vec2(0.,u_px.y)))*.5*pol;float fl=dot(g,n);q11+=fl*n.x*n.x;q12+=fl*n.x*n.y;q22+=fl*n.y*n.y;}
   float tmp=sqrt((q11-q22)*(q11-q22)+4.*q12*q12);float e1=.5*(q11+q22-tmp),e2=.5*(q11+q22+tmp);o=e1<0.?max(-e1-abs(e2),0.)*u_p3*20.:0.;}
  else{${HESS2('u_p1')}float a1=-l1*pol,a2=-l2*pol;if(m==0){float tau=u_p3*.3;float lr=a2>tau?a2:tau;o=a2<=0.||lr<=0.?0.:a2>=lr*.5?1.:a2*a2*(lr-a2)*pow(3./(a2+lr),3.);}else o=a1>0.&&a2>0.?sqrt(a1*a2)*u_p3*12.:0.;}
  return vec4(vec3(clamp(o,0.,1.)),1.);`,'Jerman 2016, Zana & Klein 2001, Law & Chung 2008 (2-D flux matrix), Hessian blob measure');
const GVF_F = `
  #define FE(q) min(dot(vec2(L((q)+vec2(u_px.x,0.))-L((q)-vec2(u_px.x,0.)),L((q)+vec2(0.,u_px.y))-L((q)-vec2(0.,u_px.y))),vec2(L((q)+vec2(u_px.x,0.))-L((q)-vec2(u_px.x,0.)),L((q)+vec2(0.,u_px.y))-L((q)-vec2(0.,u_px.y))))*4.,1.)
  vec2 e=u_px*max(u_k,1.);float fx=(FE(uv+vec2(e.x,0.))-FE(uv-vec2(e.x,0.)))*.5,fy=(FE(uv+vec2(0.,e.y))-FE(uv-vec2(0.,e.y)))*.5;`;
f('gvf','Gradient Vector Flow',[P('Smoothness μ',.05,.25,.2,.005),S('Output',['Flow (hue = direction)','Divergence','Magnitude']),P('Gain',1,200,40,1)],
  [`${GVF_F}return vec4(.5+.5*fx,.5+.5*fy,0.,1.);`,
   ...Array(40).fill(`${GVF_F}vec2 u=T(uv).rg*2.-1.;vec2 lap=(T(uv+vec2(e.x,0.)).rg+T(uv-vec2(e.x,0.)).rg+T(uv+vec2(0.,e.y)).rg+T(uv-vec2(0.,e.y)).rg)*2.-4.-4.*u;u+=u_p0*lap-(u-vec2(fx,fy))*(fx*fx+fy*fy);return vec4(.5+.5*clamp(u,-1.,1.),0.,1.);`),
   `vec2 e=u_px*max(u_k,1.);vec2 u=T(uv).rg*2.-1.;int m=int(u_p1+.5);if(m==0)return vec4(hsv2rgb(vec3(atan(u.y,u.x)/6.2832+.5,.9,clamp(length(u)*u_p2,0.,1.))),1.);
   if(m==1){float dv=(T(uv+vec2(e.x,0.)).r-T(uv-vec2(e.x,0.)).r+T(uv+vec2(0.,e.y)).g-T(uv-vec2(0.,e.y)).g);return vec4(vec3(clamp(.5+dv*u_p2,0.,1.)),1.);}return vec4(vec3(clamp(length(u)*u_p2,0.,1.)),1.);`],'Xu & Prince 1998, 40 iterations');
f('edgethin','Canny Stages (NMS / Hysteresis / Sub-pixel)',[S('Output',['Non-max suppression','Hysteresis (edge linking)','Sub-pixel edges (antialiased)']),P('Low threshold',.02,.5,.08,.005),P('High threshold',.05,1,.2,.005),P('Pre-smoothing',0,4,1,.05,'px')],
  [`
  #define GR(q) (u_p3<.05?sobel(q)*.25:vec2(blurL((q)+vec2(u_px.x,0.),R(u_p3)*.5)-blurL((q)-vec2(u_px.x,0.),R(u_p3)*.5),blurL((q)+vec2(0.,u_px.y),R(u_p3)*.5)-blurL((q)-vec2(0.,u_px.y),R(u_p3)*.5)))
  vec2 g=GR(uv);float mg=length(g);vec2 dn=mg>1e-5?g/mg:vec2(1.,0.);vec2 st=vec2(abs(dn.x)>.38?sign(dn.x):0.,abs(dn.y)>.38?sign(dn.y):0.)*u_px;float ma=length(GR(uv+st)),mb=length(GR(uv-st));
  float nm=mg>=ma&&mg>=mb?mg:0.;float den=ma-2.*mg+mb;float off=abs(den)>1e-6?clamp(.5*(mb-ma)/den,-.5,.5):0.;float cl=nm>u_p2?1.:nm>u_p1?.5:0.;return vec4(cl,nm,.5+off,1.);`,
   ...Array(24).fill(`vec4 me=T(uv);if(me.r>.25&&me.r<.75){for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(T(uv+vec2(float(i),float(j))*u_px).r>.75){me.r=1.;}}return me;`),
   `vec4 me=T(uv);int m=int(u_p0+.5);if(m==0)return vec4(vec3(clamp(me.g*4.,0.,1.)),1.);if(m==1)return vec4(vec3(step(.75,me.r)),1.);
   float cov=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;vec4 t=T(q);if(t.r<.75)continue;vec2 g=sobel(q);vec2 dn=length(g)>1e-5?normalize(g):vec2(1.,0.);vec2 ep=vec2(float(i),float(j))+dn*(t.b-.5);float d=abs(dot(-ep,dn));cov=max(cov,1.-clamp(d,0.,1.));}return vec4(vec3(cov),1.);`],'Canny 1986 stages; parabolic sub-pixel offset along the gradient');
