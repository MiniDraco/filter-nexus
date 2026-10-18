/* ================= q57: round-20 SAGA GIS terrain / grid tools (ported from the saga-gis C++ sources) and Max/Jitter jit.* matrix objects ================= */
// Terrain filters read the image luma as the elevation grid (one working pixel = one cell); feed a height / depth map for DEM-like results.
const Q57_DIV = `
#define Q57DV(t_) ((t_)<.5?mix(vec3(.13,.3,.75),vec3(.96),(t_)*2.):mix(vec3(.96),vec3(.8,.15,.1),(t_)*2.-1.))
`;
// separable Gaussian with explicit sigma and truncation radius (working px), reads the previous pass
const Q57_GB = (dir, sig, rad) => `float sg=max(${sig},.3),rd=max(${rad},1.);float st=max(1.,rd/32.);vec4 a=vec4(0.);float w=0.;for(int i=-32;i<=32;i++){float x=float(i)*st;if(abs(x)>rd)continue;float g=exp(-x*x/(2.*sg*sg));a+=T(uv+${dir}*x*u_px)*g;w+=g;}return a/w;`;
// 8 neighbours in SAGA direction order (0 = N, clockwise), y up = north
const Q57_N8 = `vec2 N8[8]=vec2[8](vec2(0.,1.),vec2(1.,1.),vec2(1.,0.),vec2(1.,-1.),vec2(0.,-1.),vec2(-1.,-1.),vec2(-1.,0.),vec2(-1.,1.));`;

f = add('Terrain');
f('q57_saga_heat','Diurnal Anisotropic Heat (SAGA)',[P('Alpha max',0,360,202.5,.5,'deg'),P('Height scale',1,400,40,1),S('Display',['Diverging ramp','Grayscale','Ramp over hillshade'])],
  `${Q57_DIV}vec2 e=u_px*max(u_k,1.);float gx=(L(uv+vec2(e.x,0.))-L(uv-vec2(e.x,0.)))*.5*u_p1,gy=(L(uv+vec2(0.,e.y))-L(uv-vec2(0.,e.y)))*.5*u_p1;
 float gm=length(vec2(gx,gy));float sl=atan(gm);float ha=gm>1e-7?cos(radians(u_p0)-atan(-gx,-gy))*atan(sl):0.;float t=clamp(.5+.5*ha,0.,1.);int m=int(u_p2+.5);
 float hs=clamp(dot(normalize(vec3(-gx,-gy,1.)),normalize(vec3(-.5,.5,.7))),0.,1.);return vec4(m==0?Q57DV(t):m==1?vec3(t):Q57DV(t)*(.35+.65*hs),1.);`,
  'SAGA ta_morphometry 12 (Boehner & Antonic 2009, anisotropic_heating.cpp): Ha = cos(alpha_max - aspect) * atan(slope), slope in radians from central differences, aspect clockwise from north (image top), elevation = luma x Height scale per cell; -1..1 shown blue-white-red');
f('q57_saga_iwahashi','Terrain Surface Convexity / Texture (SAGA, Iwahashi-Pike)',[S('Type',['Convexity','Concavity','Texture']),S('Laplacian kernel',['Four-neighbourhood','Eight-neighbourhood','Eight (distance weighted)']),P('Flat threshold',0,10,1,.1),P('Scale (cells)',1,40,10,1)],
  [`${Q57_N8}vec2 e=u_px*max(u_k,1.);float z=L(uv)*255.;int ty=int(u_p0+.5),kn=int(u_p1+.5);float zz[9];zz[8]=z;
 for(int i=0;i<8;i++){vec2 q=uv+N8[i]*e;zz[i]=(q.x<0.||q.y<0.||q.x>1.||q.y>1.)?z:L(q)*255.;}float fl=0.;
 if(ty<2){float k1=kn==0?0.:kn==1?1.:.70710678;float s=4.*(1.+k1)*z;for(int i=0;i<8;i++)s-=(i%2==0?1.:k1)*zz[i];fl=ty==0?(s>u_p2?1.:0.):(s<-u_p2?1.:0.);}
 else{float md=z;for(int i=0;i<9;i++){int lt=0,eq=0;for(int j=0;j<9;j++){lt+=zz[j]<zz[i]?1:0;eq+=zz[j]==zz[i]?1:0;}if(lt<=4&&lt+eq>4)md=zz[i];}fl=abs(z-md)>u_p2?1.:0.;}
 return vec4(vec3(fl),1.);`,
   Q57_GB('vec2(1.,0.)','.7*R(u_p3)','R(u_p3)'),Q57_GB('vec2(0.,1.)','.7*R(u_p3)','R(u_p3)')],
  'SAGA ta_morphometry 20 / 21 (Iwahashi & Pike 2007, tc_iwahashi_pike.cpp): convexity flag = weighted Laplacian 4(k0+k1)z - sum k z_i > epsilon (concavity < -epsilon; kernels {1,0} / {1,1} / {1,1/sqrt2}), texture flag = |z - 3x3 median| > epsilon; result = Gaussian-weighted share of flagged cells within Scale (bandwidth 0.7 x Scale, the counting method), 0..100 % shown 0..1; elevation = luma in grey levels (epsilon in grey levels)');
f('q57_saga_windshelter','Wind Shelter Index (SAGA, Plattner 2004)',[P('Wind direction',0,360,135,1,'deg'),P('Distance (cells)',1,60,10,1),P('Height scale',1,400,40,1),S('Method',['Windward','Leeward'])],
  `float hs=u_p2;float z=L(uv)*hs;float A=radians(u_p0+(u_p3<.5?180.:0.));float D=R(u_p1);float st=max(1.,D/48.);float mx=0.;bool hit=false;
 for(int k=0;k<5;k++){float a=A+radians(2.5)*float(k-2);vec2 dr=vec2(sin(a),cos(a))*u_px;
  for(int i=1;i<=48;i++){float r=float(i)*st;if(r>D+.01)break;vec2 q=uv+dr*r;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;
   float dz=z-L(q)*hs;if(u_p3>.5)dz=-dz;if(dz>0.){float gg=dz/r;mx=hit?max(mx,gg):gg;hit=true;}}}
 return vec4(vec3((1.5707963-(hit?atan(mx):0.))/1.5707963),1.);`,
  'SAGA ta_morphometry 29 (wind_shelter.cpp, after Plattner et al. 2004 / RSAGA): sector toward the wind direction (+180 deg for windward) with 5 deg tolerance (5 rays) up to Distance cells, dz = z - z_i (sign flipped for leeward), positive gradients dz/distance only, index = 90 deg - atan(max gradient) (quantile 1), shown /90; elevation = luma x Height scale');
f('q57_saga_landform','Fuzzy Landform Elements (SAGA, Schmidt felementf)',[P('Height scale',1,400,60,1),P('Slope threshold',.5,30,5,.5,'deg'),P('Curvature threshold',1,400,60,1),S('Output',['Landform classes','Classes over hillshade','Maximum membership','Confusion index'],1)],
  [BH('3.'),BV('3.'),`vec2 e=u_px*max(u_k,1.);float hs=u_p0;
 float z1=L(uv+vec2(-e.x,e.y))*hs,z2=L(uv+vec2(0.,e.y))*hs,z3=L(uv+e)*hs,z4=L(uv-vec2(e.x,0.))*hs,z5=L(uv)*hs,z6=L(uv+vec2(e.x,0.))*hs,z7=L(uv-e)*hs,z8=L(uv-vec2(0.,e.y))*hs,z9=L(uv+vec2(e.x,-e.y))*hs;
 float r=z4+z6-2.*z5,t=z2+z8-2.*z5,s=(-z1+z3+z7-z9)*.25,p=(z6-z4)*.5,q=(z2-z8)*.5;float pq=p*p+q*q;
 float sld=degrees(atan(sqrt(pq)));float rt=sqrt(.25*(r-t)*(r-t)+s*s);float kmax=-.5*(r+t)+rt,kmin=-.5*(r+t)-rt;
 float pc=pq>1e-12?-(r*p*p+2.*s*p*q+t*q*q)/(pq*pow(1.+pq,1.5)):0.,tc=pq>1e-12?-(r*q*q-2.*s*p*q+t*p*p)/(pq*sqrt(1.+pq)):0.;
 float lo=u_p1,hi=3.*u_p1,cl=u_p2*.001,ch=3.*cl;float bF=sld<=lo?1.:sld>=hi?0.:(hi-sld)/(hi-lo),bS=1.-bF;
 #define Q57SI(k_) (abs(k_)<=cl?1.:abs(k_)>=ch?0.:(ch-abs(k_))/(ch-cl))
 float aS=Q57SI(kmax),aX=kmax>=0.?1.-aS:0.,aV=kmax<=0.?1.-aS:0.;float iS=Q57SI(kmin),iX=kmin>=0.?1.-iS:0.,iV=kmin<=0.?1.-iS:0.;
 float pS=Q57SI(pc),pX=pc>=0.?1.-pS:0.,pV=pc<=0.?1.-pS:0.;float tS=Q57SI(tc),tX=tc>=0.?1.-tS:0.,tV=tc<=0.?1.-tS:0.;
 float M[15]=float[15](min(bF,min(aS,iS)),min(bF,min(aV,iV)),min(bF,min(aX,iX)),min(bF,min(aX,iS)),min(bF,min(aS,iV)),min(bF,min(aX,iV)),
  min(bS,min(pS,tS)),min(bS,min(pV,tS)),min(bS,min(pX,tS)),min(bS,min(pS,tV)),min(bS,min(pV,tV)),min(bS,min(pX,tV)),min(bS,min(pS,tX)),min(bS,min(pV,tX)),min(bS,min(pX,tX)));
 vec3 C[15]=vec3[15](vec3(220.,220.,220.),vec3(0.,0.,100.),vec3(100.,0.,0.),vec3(200.,0.,0.),vec3(0.,0.,255.),vec3(0.,200.,255.),vec3(255.,255.,0.),vec3(240.,220.,0.),vec3(255.,255.,150.),vec3(180.,230.,0.),vec3(100.,230.,0.),vec3(180.,255.,0.),vec3(250.,210.,0.),vec3(250.,170.,0.),vec3(255.,120.,0.));
 int b=0;float m1=-1.,m2=0.;for(int i=0;i<15;i++){if(M[i]>m1){m2=m1;m1=M[i];b=i;}else if(M[i]>m2)m2=M[i];}m2=max(m2,0.);
 int o=int(u_p3+.5);if(o==2)return vec4(vec3(m1),1.);if(o==3)return vec4(vec3(m1>0.?m2/m1:1.),1.);
 float sh=clamp(dot(normalize(vec3(-p,-q,1.)),normalize(vec3(-.5,.5,.7))),0.,1.);return vec4(C[b]/255.*(o==1?.45+.55*sh:1.),1.);`],
  'SAGA ta_morphometry 25 (fuzzy_landform_elements.cpp, Schmidt & Hewitt 2004 felementf): slope and min / max / profile / tangential curvature from the Zevenbergen-Thorne 3x3 fit (convex positive), linear semantic-import memberships (flat vs sloped between the slope thresholds; straight vs convex / concave between the curvature thresholds, in 1000/cell units), class membership = min of its rule terms (15 classes: plain, pit, peak, ridge, channel, saddle; back / foot / shoulder slope, hollow, spur), winner = max membership, SAGA class colours; confusion index = 2nd / 1st membership. Upper thresholds fixed at 3 x the lower (SAGA takes both); elevation = luma x Height scale, pre-smoothed (sigma 1.5 px) against 8-bit steps');
f('q57_saga_ssp','Surface Specific Points (SAGA)',[S('Method',['Flagging neighbours of highest elevation','Opposite neighbours','Flow direction (down)','Flow direction (up and down)','Peucker and Douglas'],1),P('Threshold',0,20,1,.1),P('Pre-smooth',0,6,1,.1,'px'),S('Display',['Classes over hillshade','Classes on black'])],
  [BH('u_p2'),BV('u_p2'),`${Q57_DIV}${Q57_N8}vec2 e=u_px*max(u_k,1.);
 #define Q57IN(q_) ((q_).x>=0.&&(q_).y>=0.&&(q_).x<=1.&&(q_).y<=1.)
 #define Q57Z(q_) (luma(T(q_).rgb)*255.)
 float z=Q57Z(uv);int me=int(u_p0+.5);vec3 col=vec3(-1.);float v=0.;
 if(me==0){bool chi=false,clo=false;for(int k=0;k<5;k++){vec2 w=uv-(k==0?vec2(0.):N8[k-1])*e;if(!Q57IN(w))continue;float hv=Q57Z(w),lv=hv;int hk=0,lk=0;
   for(int i=0;i<4;i++){vec2 q=w+N8[i]*e;if(!Q57IN(q))continue;float zq=Q57Z(q);if(zq>hv){hv=zq;hk=i+1;}else if(zq<lv){lv=zq;lk=i+1;}}
   if(hk==k)chi=true;if(lk==k)clo=true;}
  col=!chi&&!clo?vec3(.1,.9,.2):!chi?vec3(.15,.4,1.):!clo?vec3(1.,.2,.15):vec3(-1.);}
 else if(me==1){float ch=0.,cl=0.;for(int i=0;i<4;i++){vec2 a=uv+N8[i]*e,b=uv-N8[i]*e;if(!Q57IN(a)||!Q57IN(b))continue;float za=Q57Z(a),zb=Q57Z(b);if(za>z&&zb>z)ch+=1.;else if(za<z&&zb<z)cl+=1.;}
  col=ch>0.&&cl>0.?vec3(.1,.9,.2):ch>0.?mix(vec3(.5,.7,1.),vec3(0.,.2,1.),ch/4.):cl>0.?mix(vec3(1.,.7,.5),vec3(1.,.1,0.),cl/4.):vec3(-1.);}
 else if(me<4){float dn=0.,up=0.;for(int k=0;k<8;k++){vec2 nq=uv+N8[k]*e;if(!Q57IN(nq))continue;float zn=Q57Z(nq),lo=zn,hi=zn;int il=-1,ih=-1;
   for(int i=0;i<8;i++){vec2 q=nq+N8[i]*e;if(!Q57IN(q))continue;float zq=Q57Z(q);if(zq<zn&&zq<lo){lo=zq;il=i;}if(zq>zn&&zq>hi){hi=zq;ih=i;}}
   if(il==(k+4)%8)dn+=1.;if(ih==(k+4)%8)up+=1.;}
  if(me==2)col=dn>0.?mix(vec3(.4,.6,1.),vec3(0.,.1,.8),dn/8.):vec3(-1.);else{v=up-dn;col=abs(v)>0.?Q57DV(clamp(.5+v/8.,0.,1.)):vec3(-1.);}}
 else{float alt[8];float dP=0.,dM=0.;int ns=0;bool wp=false;for(int i=0;i<8;i++){vec2 q=uv+N8[i]*e;alt[i]=Q57IN(q)?Q57Z(q):z;}wp=alt[7]-z>0.;
  for(int i=0;i<8;i++){float d=alt[i]-z;if(d>0.){dP+=d;if(!wp){ns++;wp=true;}}else if(d<0.){dM-=d;if(wp){ns++;wp=false;}}}
  int cls=0;if(dP==0.)cls=9;else if(dM==0.)cls=-9;else if(ns==4)cls=1;else if(ns==2){bool up=alt[7]>z;int i=0;for(int k=0;k<8;k++){bool cn=up?alt[i]>z:alt[i]<z;i++;if(!cn||i>7)break;}
   int n=0;for(int k=0;k<8;k++){n++;if(i>7)break;bool cn=up?alt[i]<z:alt[i]>z;i++;if(!cn)break;}
   if(n==4){if(dM-dP>u_p1)cls=2;else if(dP-dM>u_p1)cls=-2;}else cls=dM-dP>0.?7:-7;}
  col=cls==9?vec3(1.,.1,.1):cls==-9?vec3(.1,.1,.6):cls==1?vec3(.1,.9,.2):cls==2?vec3(1.,.6,.1):cls==-2?vec3(.1,.85,.9):cls==7?vec3(1.,.9,.2):cls==-7?vec3(.15,.4,1.):vec3(-1.);}
 float gx=(Q57Z(uv+vec2(e.x,0.))-Q57Z(uv-vec2(e.x,0.)))*.02,gy=(Q57Z(uv+vec2(0.,e.y))-Q57Z(uv-vec2(0.,e.y)))*.02;float sh=clamp(dot(normalize(vec3(-gx,-gy,1.)),normalize(vec3(-.5,.5,.7))),0.,1.);
 vec3 bg=u_p3<.5?vec3(.2+.6*sh):vec3(0.);return vec4(col.r<0.?bg:col,1.);`],
  'SAGA ta_morphometry 3 (SurfaceSpecificPoints.cpp): 0 = mark the highest / lowest of each cell + its N, NE, E, SE neighbours (never highest = channel blue, never lowest = divide red, neither = saddle green); 1 = opposite-neighbour pairs both higher (channel, blue by count) / both lower (divide, red) / both = saddle; 2 = number of neighbours whose steepest-descent (lowest lower) neighbour is this cell; 3 = same on the inverted surface minus 2 (blue-red); 4 = Peucker & Douglas ring test: peak red, pit navy, pass green, convex / concave break (run of 4, |dMinus - dPlus| > Threshold) orange / cyan, ridge yellow, channel blue. Elevation = luma in grey levels, optional pre-smoothing');
f = add('Analysis');
f('q57_saga_multiband','Multi-Band Spectral Variation (SAGA)',[P('Radius (cells)',1,8,2,1),S('Weighting',['None','Inverse distance (power 2)','Exponential (bandwidth 1)','Gaussian (bandwidth 1)']),S('Output',['Mean distance','Standard deviation','Centre distance']),P('Gain',1,20,5,.1)],
  `vec2 e=u_px*max(u_k,1.);int rr=int(u_p0+.5);int wm=int(u_p1+.5);
 #define Q57W(d_) (wm==0?1.:wm==1?((d_)>0.?pow(d_,-2.):1.):wm==2?exp(-(d_)):exp(-.5*(d_)*(d_)))
 vec3 cs=vec3(0.);float ws=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>rr||abs(j)>rr)continue;float d=length(vec2(float(i),float(j)));if(d>float(rr)+.001)continue;vec2 q=uv+vec2(float(i),float(j))*e;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;float w=Q57W(d);cs+=w*O(q).rgb;ws+=w;}
 cs/=ws;float s1=0.,s2=0.,dc=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>rr||abs(j)>rr)continue;float d=length(vec2(float(i),float(j)));if(d>float(rr)+.001)continue;vec2 q=uv+vec2(float(i),float(j))*e;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;float w=Q57W(d);float ds=length(O(q).rgb-cs);s1+=w*ds;s2+=w*ds*ds;if(i==0&&j==0)dc=ds;}
 float mn=s1/ws,sd=sqrt(max(s2/ws-mn*mn,0.));int o=int(u_p2+.5);return vec4(vec3(clamp((o==0?mn:o==1?sd:dc)*u_p3,0.,1.)),1.);`,
  'SAGA statistics_grid 9 (multiband_variation.cpp, spectral variation hypothesis after Palmer et al. 2002): the R, G, B bands as a 3-band grid set; weighted feature-space centroid of the circular neighbourhood, Euclidean distance of every neighbour to it -> weighted mean (MEAN), standard deviation (STDDEV) and the centre cell distance (DIFF), x Gain for display; IDW centre weight 1');
f = add('Blur');
f('q57_saga_resample','Resampling Filter (SAGA)',[P('Scale factor',1,40,10,.5),S('Output',['Low pass','High pass','High pass added to image']),P('Gain',.5,10,2,.1)],
  [`float S=max(R(u_p0),1.);float px=uv.x*u_res.x;float b0=floor(px/S)*S;float n=min(ceil(S),64.);vec3 a=vec3(0.);for(int k=0;k<64;k++){if(float(k)>=n)break;float x=min(b0+(float(k)+.5)*S/n,u_res.x-.5);a+=O(vec2(x/u_res.x,uv.y)).rgb;}return vec4(a/n,1.);`,
   `float S=max(R(u_p0),1.);float py=uv.y*u_res.y;float b0=floor(py/S)*S;float n=min(ceil(S),64.);vec3 a=vec3(0.);for(int k=0;k<64;k++){if(float(k)>=n)break;float y=min(b0+(float(k)+.5)*S/n,u_res.y-.5);a+=T(vec2(uv.x,y/u_res.y)).rgb;}return vec4(a/n,1.);`,
   `float S=max(R(u_p0),1.);vec2 fp=uv*u_res/S-.5;vec2 i0=floor(fp),t=fp-i0;vec4 wx=vec4((1.-t.x)*(1.-t.x)*(1.-t.x),3.*t.x*t.x*t.x-6.*t.x*t.x+4.,-3.*t.x*t.x*t.x+3.*t.x*t.x+3.*t.x+1.,t.x*t.x*t.x)/6.;
 vec4 wy=vec4((1.-t.y)*(1.-t.y)*(1.-t.y),3.*t.y*t.y*t.y-6.*t.y*t.y+4.,-3.*t.y*t.y*t.y+3.*t.y*t.y+3.*t.y+1.,t.y*t.y*t.y)/6.;vec3 lp=vec3(0.);
 for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 cc=clamp((i0+vec2(float(i-1),float(j-1))+.5)*S,vec2(.5),u_res-.5);lp+=wx[i]*wy[j]*T(cc/u_res).rgb;}
 int o=int(u_p1+.5);vec3 hp=O(uv).rgb-lp;return vec4(clamp(o==0?lp:o==1?.5+hp*u_p2:O(uv).rgb+hp*u_p2,0.,1.),1.);`],
  'SAGA grid_filter 11 (Filter_Resample.cpp): up-scale to cells of Scale factor x the cell size by the mean of the covered cells, then back to the original cells by cubic B-spline interpolation (SAGA Get_Value default) = low pass; high pass = grid - low pass (shown +0.5, x Gain)');

/* ---- Max/Jitter matrix objects ---- */
f = add('Stylize');
f('q57_jit_eclipse','Eclipse Meta-Image (Jitter jit.eclipse)',[P('Cells',1,32,12,1),S('Tint',['Addition','Multiplication'],1),S('Colour mode',['Both colour','First grey','Second grey','Both grey'],1),P('Invert threshold',-1.01,1,-1.01,.01)],
  `float n=floor(u_p0+.5);vec2 cl=floor(uv*n);vec3 a=O(fract(uv*n)).rgb;vec3 t=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++)t+=O((cl+(vec2(float(i),float(j))+.5)/4.)/n).rgb;t/=16.;
 int m=int(u_p2+.5);if(m==1||m==3)a=vec3(luma(a));if(m==2||m==3)t=vec3(luma(t));vec3 o=clamp(u_p1<.5?a+t:a*t,0.,1.);if(luma(t)<u_p3)o=1.-o;return vec4(o,1.);`,
  'jit.eclipse (Cycling 74 reference): the frame split into rows x columns cells, each a scaled-down copy of the whole frame, tinted (add or multiply) by the cell colour of the second matrix (here the same image, cell mean) so the grid rebuilds it; mode greys either matrix; cells whose tint luminance is below the threshold are colour-inverted (approx.: exact inversion rule and the r/g/b scaling attributes not documented)');
f('q57_jit_fluoride','Fluoride Neon Glow (Jitter jit.fluoride)',[P('Glow hue',0,360,120,1,'deg'),P('Lum threshold',0,1,.6,.01),P('Tolerance',.01,1,.2,.01),S('Mode',['Greyscale output','Keep colour'],1)],
  `vec3 gc=hsv2rgb(vec3(u_p0/360.,1.,1.));float l=luma(c.rgb);float d=l-u_p1;vec3 o=c.rgb;if(d<=0.){if(d>-u_p2)o=mix(c.rgb,gc,(d+u_p2)/u_p2);}else o=d<u_p2?mix(gc,vec3(0.),d/u_p2):vec3(0.);
 return vec4(u_p3<.5?vec3(luma(o)):o,1.);`,
  'jit.fluoride (reference: values fade toward the glow colour as they approach the luminance threshold, values above it fade to black, outside the tolerance unchanged; mode 0 greys the result): linear ramps over the tolerance band below and above lum, brighter than lum + tol black; defaults here lum 0.6 and colour mode (Jitter: 0.88, greyscale); approx.');
f = add('Retro');
f('q57_jit_scanwrap','Scanline Rewrap (Jitter jit.scanwrap)',[P('Row width',.5,2,1.03,.001,'x'),S('Mode',['Wrap (loop input)','Dump (zero fill)'])],
  `vec2 R0=floor(u_res+.5);float W2=max(floor(R0.x*u_p0+.5),1.);float H2=ceil(R0.x*R0.y/W2);float ox=floor(uv.x*W2),oy=floor((1.-uv.y)*H2);float n=oy*W2+ox;
 float ix=mod(n,R0.x),iy=floor(n/R0.x);if(iy>=R0.y){if(u_p1>.5)return vec4(0.,0.,0.,1.);iy=mod(iy,R0.y);}return vec4(O(vec2(ix+.5,R0.y-iy-.5)/R0).rgb,1.);`,
  'jit.scanwrap: the cells are read in scanline order and rewrapped into rows of Row width x the input width (output height = cells / new width, shown stretched to the frame), so a different width shears and repeats the picture; wrap loops short input, dump fills the rest with zero');
f('q57_jit_altern','Altern Colour Screen (Jitter jit.altern)',[P('Gap width',1,16,2,1,'px'),P('Interval',1,32,3,1,'px'),P('Threshold',0,1,.25,.01),S('Screen colour',['Black','White','Red','Blue'])],
  `vec2 p=floor(uv*u_res/max(u_k,1.));float g=floor(u_p0+.5),iv=floor(u_p1+.5);bool gap=mod(p.x,g+iv)<g||mod(p.y,g+iv)<g;int sc=int(u_p3+.5);
 vec3 bg=sc==0?vec3(0.):sc==1?vec3(1.):sc==2?vec3(.85,.1,.1):vec3(.1,.2,.85);return vec4(gap&&(c.r+c.g+c.b)/3.>u_p2?c.rgb:bg,1.);`,
  'jit.altern: a colour screen (bgcolor) laid over the image with vertical gaps colwidth wide every colwidth + xinterval and horizontal gaps rowheight high every rowheight + yinterval; inside the gaps cells whose plane average exceeds the threshold show the image, everything else the screen colour (gap layout approx.; one width / interval for both axes)');
f('q57_jit_avg4','Four-Point Average (Jitter jit.avg4)',[P('X distance',0,64,6,1,'px'),P('Y distance',0,64,6,1,'px'),S('Boundary',['Wrap','Clip','Fold'])],
  `vec2 dd=vec2(R(u_p0),R(u_p1))*u_px;int m=int(u_p2+.5);vec3 a=vec3(0.);for(int k=0;k<4;k++){vec2 q=uv+dd*vec2(k%2==0?1.:-1.,k<2?1.:-1.);
  q=m==0?fract(q):m==1?clamp(q,u_px*.5,1.-u_px*.5):1.-abs(1.-mod(q,2.));a+=O(q).rgb;}return vec4(a*.25,1.);`,
  'jit.avg4: every cell replaced by the average of four cells at the x / y distance (here the diagonal set x +- dx, y +- dy, approx.: the reference does not list the pattern), out-of-range positions wrapped, clipped or folded');
f('q57_jit_hatch','Cross-Hatch Grid (Jitter jit.hatch)',[P('Grid',2,64,8,1,'px'),P('Threshold',0,1,0,.01),S('Background',['Black','White']),P('Line width',1,6,1,1,'px')],
  `vec2 p=floor(uv*u_res);float g=max(floor(R(u_p0)+.5),2.),lw=max(floor(R(u_p3)+.5),1.);vec2 pt=vec2(p.x,u_res.y-1.-p.y);vec2 cl=floor(pt/g);vec2 lc=pt-cl*g;
 float h0=floor((g-lw)*.5);bool ax=(lc.x>=h0&&lc.x<h0+lw)||(lc.y>=h0&&lc.y<h0+lw);vec2 tl=cl*g;vec3 v=O(vec2(tl.x+.5,u_res.y-tl.y-.5)/u_res).rgb;
 vec3 bg=vec3(u_p2>.5?1.:0.);return vec4(ax&&luma(v)>u_p1?v:bg,1.);`,
  'jit.hatch: the frame divided into Grid x Grid squares; along the two central axes of each square the colour of its top-left cell is drawn (if its luminance exceeds the threshold), all else the background colour; line width is an added control');
