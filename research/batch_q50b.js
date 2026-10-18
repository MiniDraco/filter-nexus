/* ================= q50b: round-18 WhiteboxTools tools, ReShade community shaders (dh / Depth3D / Lilium), Notch post-FX, Acorn ================= */
// WhiteboxTools terrain tools read the DEM as luma x Height scale (full-res px units); one working pixel = 1/u_k full-res px.
// Florinsky (2016) 5x5 third-order partials as in whitebox-tools maximal_curvature.rs / relative_aspect.rs (z[n]: n = (dy+2)*5+dx+2, dy = row down)
const Q50_FL = H => `float z[25];for(int j=0;j<5;j++)for(int i=0;i<5;i++)z[j*5+i]=L(uv+vec2(float(i-2),float(2-j))*u_px)*(${H});float res=1./u_k;
 float rr=(2.*(z[0]+z[4]+z[5]+z[9]+z[10]+z[14]+z[15]+z[19]+z[20]+z[24])-2.*(z[2]+z[7]+z[12]+z[17]+z[22])-z[1]-z[3]-z[6]-z[8]-z[11]-z[13]-z[16]-z[18]-z[21]-z[23])/(35.*res*res);
 float tt=(2.*(z[0]+z[1]+z[2]+z[3]+z[4]+z[20]+z[21]+z[22]+z[23]+z[24])-2.*(z[10]+z[11]+z[12]+z[13]+z[14])-z[5]-z[6]-z[7]-z[8]-z[9]-z[15]-z[16]-z[17]-z[18]-z[19])/(35.*res*res);
 float ss=(z[8]+z[16]-z[6]-z[18]+4.*(z[4]+z[20]-z[0]-z[24])+2.*(z[3]+z[9]+z[15]+z[21]-z[1]-z[5]-z[19]-z[23]))/(100.*res*res);
 float pp=(44.*(z[3]+z[23]-z[1]-z[21])+31.*(z[0]+z[20]-z[4]-z[24]+2.*(z[8]+z[18]-z[6]-z[16]))+17.*(z[14]-z[10]+4.*(z[13]-z[11]))+5.*(z[9]+z[19]-z[5]-z[15]))/(420.*res);
 float qq=(44.*(z[5]+z[9]-z[15]-z[19])+31.*(z[20]+z[24]-z[0]-z[4]+2.*(z[6]+z[8]-z[16]-z[18]))+17.*(z[2]-z[22]+4.*(z[7]-z[17]))+5.*(z[1]+z[3]-z[21]-z[23]))/(420.*res);`;
// Horn 3x3 gradient of channel ch of the previous pass (WhiteboxTools n0..n7 = NE,E,SE,S,SW,W,NW,N), heights x H
const Q50_HG = (nm, ch, H) => `vec2 ${nm};{float e=u_px.x,g=u_px.y;float n0=T(uv+vec2(e,g)).${ch},n1=T(uv+vec2(e,0.)).${ch},n2=T(uv+vec2(e,-g)).${ch},n3=T(uv+vec2(0.,-g)).${ch},n4=T(uv+vec2(-e,-g)).${ch},n5=T(uv+vec2(-e,0.)).${ch},n6=T(uv+vec2(-e,g)).${ch},n7=T(uv+vec2(0.,g)).${ch};
 ${nm}=vec2(n2-n4+2.*(n1-n5)+n0-n6,n6-n4+2.*(n7-n3)+n0-n2)*(${H})*u_k/8.;}`;

f = add('Sharpen');
f('q50_wbt_hpbilateral','High-Pass Bilateral Filter (WhiteboxTools)',[P('Sigma dist',.5,20,.75,.05,'px'),P('Sigma int',.01,2,1,.01),P('Gain',1,20,4,.1)],
  `float sd=u_p0;float rad=1.;float a0=.001*2.5066*sd;if(a0<1.)rad=max(1.,floor(sqrt(-2.*sd*sd*log(a0)))+1.);float st=max(1.,rad/12.);float z0=dot(O(uv).rgb,vec3(1./3.));float acc=0.,ws=0.;
  for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>rad||abs(o.y)>rad)continue;float zn=dot(O(uv+o*u_k*u_px).rgb,vec3(1./3.));
   float w=exp(-dot(o,o)/(2.*sd*sd))*exp(-(zn-z0)*(zn-z0)/(2.*u_p1*u_p1));acc+=w*zn;ws+=w;}
  return vec4(vec3(clamp(.5+u_p2*(z0-acc/ws),0.,1.)),1.);`,
  'WhiteboxTools HighPassBilateralFilter: input (mean of R,G,B, 0-1) minus its bilateral filter (Gaussian spatial weight sigma_dist, window out to where the 1-D weight falls to 0.001; Gaussian intensity weight sigma_int); shown as 0.5 + Gain x residual');

f = add('Analysis');
f('q50_wbt_diversity','Diversity Filter (WhiteboxTools)',[P('Window',3,25,11,2,'px'),P('Levels',2,256,256,1),S('Display',['Gray','Inferno'])],
  `float n=floor(u_p0);if(mod(n,2.)==0.)n+=1.;int h=int(n*.5);float Lv=floor(u_p1);uint b[8];for(int k=0;k<8;k++)b[k]=0u;
  for(int j=-12;j<=12;j++){if(abs(j)>h)continue;for(int i=-12;i<=12;i++){if(abs(i)>h)continue;int q=int(floor(clamp(luma(O(uv+vec2(float(i),float(j))*u_k*u_px).rgb),0.,1.)*(Lv-1.)+.5));b[q>>5]|=1u<<uint(q&31);}}
  uint cn=0u;for(int k=0;k<8;k++){uint x=b[k];x=x-((x>>1)&0x55555555u);x=(x&0x33333333u)+((x>>2)&0x33333333u);x=(x+(x>>4))&0x0F0F0F0Fu;cn+=(x*0x01010101u)>>24;}
  float v=float(cn)/min(Lv,n*n);return vec4(u_p2<.5?vec3(v):ramp(1,v),1.);`,
  'WhiteboxTools DiversityFilter: number of distinct values in the n x n window (luma quantised to Levels integer classes, 256 = 8-bit grey values; counted with a 256-bit set), shown as count / min(Levels, n^2)');

f = add('Terrain');
f('q50_wbt_curvature','Maximal / Minimal / Tangential Curvature (WhiteboxTools)',[S('Type',['Maximal','Minimal','Tangential']),P('Height scale',1,500,20,1),P('Log exponent',0,6,3,1),P('Gain',.01,2,.08,.01)],
  `${Q50_FL('u_p1')}int m=int(u_p0+.5);float g2=1.+pp*pp+qq*qq;float k;
  if(m<2){float H_=-((1.+qq*qq)*rr-2.*pp*qq*ss+(1.+pp*pp)*tt)/(2.*sqrt(g2*g2*g2));float K_=(rr*tt-ss*ss)/(g2*g2);float sq=sqrt(max(H_*H_-K_,0.));k=m==0?H_+sq:H_-sq;}
  else k=abs(pp+qq)>0.?-(qq*qq*rr-2.*pp*qq*ss+pp*pp*tt)/((pp*pp+qq*qq)*sqrt(g2)):0.;
  if(u_p2>.5)k=sign(k)*log(1.+pow(10.,floor(u_p2))*abs(k));else k*=100.;return vec4(vec3(clamp(.5+u_p3*k,0.,1.)),1.);`,
  'WhiteboxTools MaximalCurvature / MinimalCurvature / TangentialCurvature: Florinsky (2016) 5x5 partials p,q,r,s,t; k_max,min = H +- sqrt(H^2 - K) with mean H = -((1+q^2)r - 2pqs + (1+p^2)t) / (2(1+p^2+q^2)^1.5), Gaussian K = (rt - s^2)/(1+p^2+q^2)^2; k_tan = -(q^2 r - 2pqs + p^2 t)/((p^2+q^2) sqrt(1+p^2+q^2)); optional Shary log transform sign(k) ln(1 + 10^e |k|); 0.5 + Gain x value');

f('q50_wbt_normaldisp','Normal / Aspect Dispersion (WhiteboxTools)',[S('Measure',['Spherical std dev of normals','Average normal angular deviation','Circular variance of aspect']),P('Window',3,31,11,2,'px'),P('Height scale',1,500,20,1),P('Range',1,90,30,1,'deg')],
  [`float n=floor(u_p1);if(mod(n,2.)==0.)n+=1.;float sg=n>3.?(floor(n*.5)+.5)/3.:0.;if(int(u_p0+.5)==1)sg=max(sg,1.);return vec4(L(uv),luma(blur1d(u_tex,uv,vec2(1.,0.),R(2.*sg)).rgb),0.,1.);`,
   `float n=floor(u_p1);if(mod(n,2.)==0.)n+=1.;float sg=n>3.?(floor(n*.5)+.5)/3.:0.;if(int(u_p0+.5)==1)sg=max(sg,1.);return vec4(T(uv).r,blur1d(u_tex,uv,vec2(0.,1.),R(2.*sg)).g,0.,1.);`,
   `int m=int(u_p0+.5);${Q50_HG('gs', 'g', 'u_p2')}
   if(m==0){vec3 nv=normalize(vec3(-gs,1.));return vec4(.5+.5*nv,1.);}
   if(m==1){${Q50_HG('go', 'r', 'u_p2')}vec3 a=vec3(-go,1.),b=vec3(-gs,1.);return vec4(acos(clamp(dot(a,b)/sqrt(dot(a,a)*dot(b,b)),-1.,1.))/PI,0.,0.,1.);}
   bool ok=gs.x!=0.&&length(gs)>1e-6;vec2 a=ok?normalize(gs):vec2(0.);return vec4(.5+.5*a,ok?1.:0.,1.);`,
   `float n=floor(u_p1);if(mod(n,2.)==0.)n+=1.;return box1d(u_tex,uv,vec2(1.,0.),R(floor(n*.5)));`,
   `float n=floor(u_p1);if(mod(n,2.)==0.)n+=1.;vec4 a=box1d(u_tex,uv,vec2(0.,1.),R(floor(n*.5)));int m=int(u_p0+.5);float v;
   if(m==0){float Rr=min(1.,length(a.rgb*2.-1.));v=degrees(sqrt(-2.*log(max(Rr,1e-6))));}else if(m==1)v=a.r*180.;else v=a.b>1e-4?(1.-min(1.,length(a.rg*2.-1.)/a.b))*90.:0.;
   return vec4(vec3(clamp(v/u_p3,0.,1.)),1.);`],
  'WhiteboxTools SphericalStdDevOfNormals (sqrt(-2 ln R) in degrees, R = mean resultant length of the unit normals of the Gaussian-smoothed DEM in the window), AverageNormalVectorAngularDeviation (mean angle between normals of the DEM and of the smoothed DEM), CircularVarianceOfAspect (1 - R of the 2-D aspect unit vectors, shown x 90); smoothing sigma = (window/2 + 0.5)/3 (exact Gaussian instead of the 4-box approximation), Horn 3x3 gradients, box window means; output / Range');

f('q50_wbt_relaspect','Relative Aspect (WhiteboxTools)',[P('Azimuth',0,360,0,1,'deg'),P('Height scale',1,500,20,1),S('Display',['Gray','Viridis'])],
  `${Q50_FL('u_p1')}if(pp==0.)return vec4(vec3(0.),1.);float ra=abs(180.-degrees(atan(qq/pp))+90.*sign(pp)-u_p0);if(ra>180.)ra=360.-ra;float v=ra/180.;
  return vec4(u_p2<.5?vec3(v):ramp(2,v),1.);`,
  'WhiteboxTools RelativeAspect: |180 - atan(q/p) + 90 sign(p) - azimuth| folded into 0 (windward) .. 180 deg (leeward), Florinsky 5x5 partials p,q; flat cells (p = 0, source -1) black');

f('q50_wbt_sar','Surface Area Ratio (WhiteboxTools)',[P('Height scale',1,500,20,1),P('Gain',1,200,5,1),S('Display',['Gray','Inferno'])],
  `float z[9];for(int j=0;j<3;j++)for(int i=0;i<3;i++)z[j*3+i]=L(uv+vec2(float(i-1),float(1-j))*u_px)*u_p0;float rs=1./u_k,rd=rs*1.41421356;
  int ea[16]=int[16](0,1,3,4,6,7,0,1,2,3,4,5,4,4,4,4),eb[16]=int[16](1,2,4,5,7,8,3,4,5,6,7,8,0,2,6,8);float dl[16];
  for(int c=0;c<16;c++){float pl=c<12?rs:rd;float dz=z[ea[c]]-z[eb[c]];dl[c]=sqrt(pl*pl+dz*dz)*.5;}
  int ts[24]=int[24](0,7,12,1,7,13,2,6,12,3,8,13,2,9,14,3,11,15,4,10,14,5,10,15);float ar=0.;
  for(int k=0;k<8;k++){float a=dl[ts[k*3]],b=dl[ts[k*3+1]],cc=dl[ts[k*3+2]];float s=(a+b+cc)*.5;ar+=sqrt(max(s*(s-a)*(s-b)*(s-cc),0.));}
  float v=clamp((ar/(rs*rs)-1.)*u_p1,0.,1.);return vec4(u_p2<.5?vec3(v):ramp(1,v),1.);`,
  'WhiteboxTools SurfaceAreaRatio (Jenness 2004): 3D surface area of the eight centre triangles from halved 3D edge lengths (Heron) over the planar cell area; shown as (ratio - 1) x Gain');

/* ---------- ReShade community shaders ---------- */
f = add('Stylize');
f('q50_lain','Lain Shadow Style (DH_Lain)',[P('Brightness limit',.01,1,.1,.01),P('Primary intensity',0,1,.4,.01),P('Secondary intensity',0,1,.3,.01),P('Border intensity',0,1,.2,.01)],
  `vec3 col=O(uv).rgb;float br=(col.r+col.g+col.b)/3.;if(br>u_p0)return vec4(col,1.);float dk=1.-br/u_p0;vec2 SZ=u_res/u_k;vec2 tc=PX(uv)/SZ.y;
  float t1=fbm(tc*7.+3.1);t1=smoothstep(.45,.75,t1)*(.6+.4*fbm(tc*40.));float t2=fbm(tc/1.5*4.+11.7);
  vec3 a1=hsv2rgb(vec3(0.,1.,t1))*u_p1*pow(dk,2.5);vec3 a2=hsv2rgb(vec3(rgb2hsv(vec3(133.,0.,174.)/255.).xy,t2))*u_p2*pow(dk,3.);vec3 ad=max(a1,a2);
  if(u_p3>0.){float bd=0.;for(int s=1;s<=11;s++){float r=float(s)*3.;bool hit=false;for(int k=0;k<16;k++){float an=float(k)*.3927;vec3 q=O(uv+fromPX(vec2(cos(an),sin(an))*r)).rgb;if((q.r+q.g+q.b)/3.>u_p0){hit=true;break;}}
    if(hit){bd=1.-r/32.;break;}}ad=max(ad,vec3(1.,0.,0.)*u_p3*dk*bd);}
  return vec4(col+ad,1.);`,
  'AlucardDH dh_Lain 1.1: pixels darker than the brightness limit get additive overlays scaled by intensity x (1 - brightness/limit)^power (2.5 / 3): a red-forced primary texture and a purple (133,0,174) secondary texture at scale 1.5 (the shipped blood/cloud PNGs replaced by procedural fbm stains/clouds, approx.; no depth scaling), plus an optional red glow from the nearest brighter pixel within 32 px (ring search step 3, source default off), combined by per-channel max', 1);

f = add('Render');
f('q50_virtualnose','Virtual Nose VR Overlay (Depth3D VirtualNose)',[S('Skin colour',['Tone -4','Tone -3','Tone -2','Tone -1','Off','Tone 1','Tone 2','Tone 3','Tone 4'],5),P('Size',0,1,.125,.005),P('Separation',0,.25,0,.005),S('Ambiance',['Off','On Shade','On Color'])],
  `int sk=int(u_p0+.5);vec3 col=O(uv).rgb;if(sk==4)return vec4(col,1.);
  vec3 HC[9]=vec3[9](vec3(247.,217.,214.),vec3(240.,186.,173.),vec3(212.,128.,107.),vec3(230.,178.,148.),vec3(255.),vec3(235.,179.,133.),vec3(195.,116.,77.),vec3(69.,42.,29.),vec3(34.,21.,15.));
  vec2 SZ=u_res/u_k;float NW=mix(-10.,5.,.625),NH=mix(-5.,5.,.375),NS=mix(-10.,10.,u_p1);float sp=uv.x<.5?u_p2:-u_p2;
  #define Q50NF(X_,Y_,A_,B_) {vec2 t_=vec2((X_)+sp,1.-(Y_))-.5;t_.y+=(-2.5+NH)*25./SZ.y;t_*=1.+(5.-NS)*.05;t_.x*=1.-NW*.1;float a_=6.*abs(t_.x)+abs(.75-2.*t_.y);float b_=(t_.x*5.395)*(t_.x*5.395)+(2.-t_.y*4.165)*(2.-t_.y*4.165);t_.x*=.9625;float c_=5.775*abs(t_.x)+abs(.75-2.*t_.y);float d_=(t_.x*5.395)*(t_.x*5.395)+(2.-t_.y*4.165)*(2.-t_.y*4.165);A_=(a_<1.||b_<1.)?1.:0.;B_=(c_<1.||d_<1.)?1.:0.;}
  float inAB,M=0.,mm,dum;Q50NF(uv.x,uv.y,inAB,mm)M+=mm*2.;float bw=12./SZ.x;for(int k=1;k<=4;k++){float o=float(k)*.25*bw;Q50NF(uv.x+o,uv.y,dum,mm)M+=mm;Q50NF(uv.x-o,uv.y,dum,mm)M+=mm;}M/=10.;
  vec2 tc=vec2(uv.x,1.-uv.y)-.5;vec3 nc=smoothstep(0.,1.,500.*tc.x*tc.x*tc.y*tc.y+.5)*HC[sk]/255.;int am=int(u_p3+.5);
  if(am>0){vec3 av=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)av+=O(vec2((float(i)+.5)/24.,(float(j)+.5)/12.)).rgb;av/=144.;nc*=am==1?vec3(dot(av,vec3(.299,.587,.114))):av;}
  return vec4(mix(col,inAB>.5?nc:col,M),1.);`,
  'Depth3D VirtualNose (BlueSkyDefender): procedural nose from two distance fields (bridge 6|x| + |0.75 - 2y| < 1, nostril (5.395x)^2 + (2 - 4.165y)^2 < 1, second set with x x 0.9625 as the alpha mask), width/height/size mapping of the shader (W 0.625, H 0.375, Size adjustable), skin colour table, smoothstep(500 x^2 y^2 + 0.5) shading, 8-tap horizontal edge blur (BlurAdjust 0.5), left/right halves offset by Separation for side-by-side VR, Ambiance = average luma / colour of the left half; dither and the 10-s logo omitted');

f = add('Tone');
f('q50_blackfloor','HDR Black Floor Fix (Lilium)',[S('Processing mode',['YRGB (luminance in PQ)','RGB in PQ','RGB (linear)']),P('Old black point',0,5,.5,.01,'nits'),P('New black point',-1,1,0,.01,'nits'),P('Roll-off stop',.5,100,10,.1,'nits')],
  `
#define Q50PQ(Y_) pow((.8359375+18.8515625*pow(max(Y_,0.),.1593017578125))/(1.+18.6875*pow(max(Y_,0.),.1593017578125)),78.84375)
  #define Q50IPQ(E_) pow(max(pow(max(E_,0.),1./78.84375)-.8359375,0.)/(18.8515625-18.6875*pow(max(E_,0.),1./78.84375)),1./.1593017578125)
  vec3 sv=O(uv).rgb;vec3 lin=mix(sv/12.92,pow((sv+.055)/1.055,vec3(2.4)),step(.04045,sv))*80./10000.;int m=int(u_p0+.5);
  float ro=u_p3/1e4,ob=u_p1/1e4,nb=u_p2/1e4;if(m<2){ro=Q50PQ(ro);ob=Q50PQ(ob);nb=sign(nb)*Q50PQ(abs(nb));}float rmo=ro-ob;float ml=(nb-ob)/max(rmo,1e-7);
  #define Q50BA(C_) ((ml*pow(abs(1.-((C_)-ob)/rmo),4.)+((C_)-ob)/rmo)*rmo+ob)
  float y1=dot(lin,vec3(.2126,.7152,.0722));vec3 o=lin;
  if(m==0){float yp=Q50PQ(y1);if(yp<=ro&&y1>0.){float y2=Q50IPQ(Q50BA(yp));o=lin*max(y2,0.)/y1;}}
  else if(m==1){if(Q50PQ(y1)<=ro){vec3 e=vec3(Q50PQ(lin.r),Q50PQ(lin.g),Q50PQ(lin.b));e=vec3(Q50BA(e.r),Q50BA(e.g),Q50BA(e.b));o=max(vec3(Q50IPQ(e.r),Q50IPQ(e.g),Q50IPQ(e.b)),0.);}}
  else if(y1<=ro)o=max(vec3(Q50BA(lin.r),Q50BA(lin.g),Q50BA(lin.b)),0.);
  o=clamp(o*125.,0.,1.);return vec4(mix(o*12.92,1.055*pow(o,vec3(1./2.4))-.055,step(.0031308,o)),1.);`,
  'Lilium (EndlesslyFlowering) HDR black floor fix, lowering: black point adaption C2 = (C - old)/(rolloff - old), C2 = MinLum (1 - C2)^4 + C2, back to absolute, MinLum = (new - old)/(rolloff - old); applied to luminance in PQ (colour scaled by Y2/Y1), to PQ-encoded RGB, or to linear RGB, only below the roll-off stop; the SDR image is taken as 80-nit scRGB (sRGB decode x 80 nits) for this demo; gamma 2.2 emulation stage not included');

f('q50_trcfix','SDR TRC Fix sRGB vs Gamma 2.2 (Lilium)',[S('Input TRC',['Power gamma','sRGB']),S('Target TRC',['sRGB','Power gamma']),P('Input gamma',1,3,2.2,.01),P('Target gamma',1,3,2.2,.01)],
  `vec3 v=clamp(O(uv).rgb,0.,1.);v=u_p0<.5?pow(v,vec3(u_p2)):mix(v/12.92,pow((v+.055)/1.055,vec3(2.4)),step(.04045,v));
  v=u_p1<.5?mix(v*12.92,1.055*pow(v,vec3(1./2.4))-.055,step(.0031308,v)):pow(v,vec3(1./u_p3));return vec4(v,1.);`,
  'Lilium SDR TRC fix: decode with the input transfer curve (power gamma or the piecewise sRGB EOTF), re-encode with the target curve (sRGB inverse EOTF or 1/gamma); default power 2.2 -> sRGB; optional BT.1886 black-point step not included');

/* ---------- Notch post-FX (manual descriptions; approx.) ---------- */
f = add('Render');
f('q50_gradpatch','Gradient Patch (Notch)',[P('Points X',2,8,3,1),P('Points Y',2,8,3,1),S('Apply mode',['Replace','Multiply','Screen','Overlay','Add','Soft light']),P('Alpha',0,1,.6,.01)],
  `vec2 n=floor(vec2(u_p0,u_p1));vec2 g=uv*(n-1.);vec2 i0=min(floor(g),n-2.);vec2 fq=smoothstep(0.,1.,g-i0);
  #define Q50GC(c_) hsv2rgb(vec3(hash(c_),.55+.45*hash((c_)+17.),.75+.25*hash((c_)+31.)))
  vec3 gc=mix(mix(Q50GC(i0),Q50GC(i0+vec2(1.,0.)),fq.x),mix(Q50GC(i0+vec2(0.,1.)),Q50GC(i0+1.),fq.x),fq.y);vec3 b=O(uv).rgb;int m=int(u_p2+.5);
  vec3 r=m==0?gc:m==1?b*gc:m==2?screen(b,gc):m==3?overlay(b,gc):m==4?min(b+gc,1.):softLight(b,gc);return vec4(mix(b,r,u_p3),1.);`,
  'Notch Gradient Patch: a Points X x Points Y array of colours (seeded random) with smooth gradients blending between them, applied over the image with an apply mode and alpha (approx. from the manual; colours are set by hand in Notch)', 1);

f = add('Stylize');
f('q50_linedistort','Line Distortion (Notch)',[P('Amount',0,300,80,1,'px'),P('Rotation',0,360,90,1,'deg'),P('Sparseness',1,20,4,.5,'px'),P('Threshold',0,1,.5,.01)],
  `vec2 p=PX(uv);float an=radians(u_p1);vec2 dr=vec2(cos(an),sin(an)),pr=vec2(-dr.y,dr.x);vec3 b=O(uv).rgb;float lw=max(1.,1./u_k);
  if(fract(dot(p,pr)/u_p2)*u_p2>=lw)return vec4(b,1.);vec3 best=b;float bl=-1.;
  for(int k=0;k<64;k++){float d=float(k)/63.*u_p0;vec3 s=O(fromPX(p-dr*d)).rgb;float l=luma(s);if(l>u_p3&&d<=u_p0*(l-u_p3)/max(1.-u_p3,1e-3)&&l>bl){bl=l;best=s;}}
  return vec4(best,1.);`,
  'Notch Line Distortion (manual description, approx.): every pixel brighter than Threshold emits a line in the Rotation direction whose length grows with its luminance (up to Amount px); lines lie on 1-px lanes Sparseness px apart; the brightest emitter reaching a lane pixel wins; Line Wave and Line Width controls not included');

f = add('Blur');
f('q50_feedbackblur','Feedback Blur Line Trail (Notch)',[P('Rotation',0,360,0,1,'deg'),P('Stretch position',0,1,.5,.01),P('Stretch falloff',.01,1,.5,.01),P('Blur scale',0,1,.35,.01)],
  `vec2 SZ=u_res/u_k;float mn=min(SZ.x,SZ.y);vec2 p=PX(uv);float an=radians(u_p0);vec2 nd=vec2(cos(an),sin(an));vec2 c0=SZ*.5+nd*(u_p1-.5)*dot(abs(nd),SZ);
  float s=dot(p-c0,nd);float L_=u_p3*abs(s);vec3 acc=vec3(0.);for(int k=0;k<32;k++){float t=float(k)/31.;acc+=O(clamp(fromPX(p-nd*sign(s)*L_*t),0.,1.)).rgb;}
  float w=exp(-abs(s)/(u_p2*mn));vec3 b=O(uv).rgb;return vec4(mix(b,acc/32.,w),1.);`,
  'Notch Feedback Blur (manual description, approx.): a line across the image (Rotation, Stretch position) from which the picture is smeared outward, blur length = Blur scale x distance from the line, effect fading with Stretch falloff; previous-frame feedback (multi-frame) not included');

/* ---------- Acorn ---------- */
f = add('Frames');
f('q50_fuzzstroke','Fuzz Stroke (Acorn)',[P('Width',1,80,14,1,'px'),P('Fuzz',0,1,.6,.01),S('Colour',['Black','White','Gray'])],
  `vec2 SZ=u_res/u_k;vec2 p=PX(uv);float d=min(min(p.x,SZ.x-p.x),min(p.y,SZ.y-p.y));float al=(p.x<d+.5||SZ.x-p.x<d+.5)?p.y:p.x;
  float w=u_p0*(1.+u_p1*(fbm(vec2(al/(u_p0*1.5),d<min(p.y,SZ.y-p.y)+.5?7.:3.))-.5)*1.6);float fr=hash(floor(p));float e=w-d;
  float cov=smoothstep(-1.,1.,e)*mix(1.,step(.15+.7*smoothstep(-u_p0*.5,u_p0*.6*u_p1,-e),fr),u_p1*(1.-smoothstep(0.,u_p0*.5,e)));cov=max(cov,step(fr,u_p1*.5*exp(min(e,0.)/max(u_p0*.15,1.))));
  vec3 sc=u_p2<.5?vec3(0.):u_p2<1.5?vec3(1.):vec3(.5);return vec4(mix(O(uv).rgb,sc,clamp(cov,0.,1.)),1.);`,
  'Acorn Fuzz Stroke ("adds a fuzzy stroke to the edges of your layer"; the layer is the whole image here): a stroke inward from the image edges whose width wanders with fbm and whose inner edge breaks into random fibres (approx.)', 1);
