/* ================= q17: symmetry groups (17 wallpaper + 7 frieze), DaltonLens CVD (Brettel 1997 / Vienot 1999), medical (CT window presets, B-COSFIRE, DullRazor), weighted gray-edge ================= */
f = add('Distort');
f('q17_wallpaper','Wallpaper Groups (17 plane symmetry groups)',[S('Group',['p1','p2','pm','pg','cm','pmm','pmg','pgg','cmm','p4','p4m','p4g','p3','p3m1','p31m','p6','p6m']),P('Cell size',20,400,120,1,'px'),P('Source angle',-180,180,0,1,'deg'),P('Source zoom',.2,3,1,.01)],
  `int g=int(u_p0+.5);float cs=u_p1;vec2 p=(PX(uv)-.5*u_res/u_k)/cs;vec2 s;
 if(g<12){vec2 f=fract(p);
  if(g==1){if(f.y>=.5)f=1.-f;}
  else if(g==2){f.x=min(f.x,1.-f.x);}
  else if(g==3){if(f.y>=.5)f=vec2(1.-f.x,f.y-.5);}
  else if(g==4){if(f.y>=.5)f=fract(f-.5);f.x=min(f.x,1.-f.x);}
  else if(g==5){f=min(f,1.-f);}
  else if(g==6){if(f.y>.5)f=fract(-f);if(f.x<.25)f.x=.5-f.x;else if(f.x>.75)f.x=1.5-f.x;}
  else if(g==7){if(f.x>=.5&&f.y>=.5)f=1.-f;else if(f.y>=.5)f=vec2(.5-f.x,f.y-.5);else if(f.x>=.5)f=vec2(f.x-.5,.5-f.y);}
  else if(g==8){if(f.y>=.5)f=fract(f-.5);if(f.y>.25)f=vec2(fract(f.x+.5),.5-f.y);f.x=min(f.x,1.-f.x);}
  else if(g>=9){vec2 q=f-.5;
   if(q.x<0.&&q.y>=0.)q=vec2(q.y,-q.x);else if(q.x<0.&&q.y<0.)q=-q;else if(q.x>=0.&&q.y<0.)q=vec2(-q.y,q.x);
   if(g==10&&q.y>q.x)q=q.yx;
   if(g==11&&q.x+q.y>.5)q=vec2(.5-q.y,.5-q.x);
   f=q+.5;}
  s=f-.5;}
 else{const float H=.8660254;float jj=p.y/H;float ii=p.x-.5*jj;vec2 b=floor(vec2(ii,jj));vec2 v=vec2(0.);float bd=1e9;
  for(int k=0;k<4;k++){vec2 cc=b+vec2(float(k-2*(k/2)),float(k/2));vec2 lp=vec2(cc.x+.5*cc.y,cc.y*H);float d=dot(p-lp,p-lp);if(d<bd){bd=d;v=p-lp;}}
  float rr=length(v);float a=atan(v.y,v.x);const float QPI=3.14159265;
  if(g==12)a=mod(a,2.*QPI/3.);
  else if(g==13){a=mod(a-QPI/6.,2.*QPI/3.)+QPI/6.;if(a>QPI/2.)a=QPI-a;}
  else if(g==14){a=mod(a,2.*QPI/3.);if(a>QPI/3.)a=2.*QPI/3.-a;}
  else if(g==15)a=mod(a,QPI/3.);
  else{a=mod(a,QPI/3.);if(a>QPI/6.)a=QPI/3.-a;}
  s=rr*vec2(cos(a),sin(a));}
 float an=radians(u_p2);s=mat2(cos(an),sin(an),-sin(an),cos(an))*s*cs*u_p3;
 return O(clamp(.5+fromPX(s),0.,1.));`,
  'exact wallpaper-group orbit folding: each output point is mapped by the group operations (translations, 2/3/4/6-fold rotations, mirrors, glides) into one fundamental domain, which samples a cell cut from the image centre (square lattice for p1..p4g, hexagonal for p3..p6m; Conway: o 2222 ** xx *x 22* 22x 2*22 442 *442 4*2 333 *333 3*3 632 *632)');

f('q17_frieze','Frieze Groups (7 strip symmetry groups)',[S('Group',['hop (p1)','step (p11g)','sidle (p1m1)','spinning hop (p2)','spinning sidle (p2mg)','jump (p11m)','spinning jump (p2mm)']),P('Period',20,400,120,1,'px'),P('Band height',10,400,110,1,'px'),S('Outside band',['Repeat band','Original image','Black'])],
  `int g=int(u_p0+.5);vec2 P0=PX(uv)-.5*u_res/u_k;float W=u_p1,Hh=u_p2;
 float yb=P0.y/Hh;float bi=floor(yb+.5);int mo=int(u_p3+.5);
 if(bi!=0.&&mo==1)return c;if(bi!=0.&&mo==2)return vec4(0.,0.,0.,1.);
 float y=2.*(yb-bi);float f=fract(P0.x/W);
 if(g==1){if(f>=.5){f-=.5;y=-y;}}
 else if(g==2){f=min(f,1.-f);}
 else if(g==3){if(y<0.){f=fract(-f);y=-y;}}
 else if(g==4){if(y<0.){f=fract(-f);y=-y;}if(f<.25)f=.5-f;else if(f>.75)f=1.5-f;}
 else if(g==5){y=abs(y);}
 else if(g==6){y=abs(y);f=min(f,1.-f);}
 return O(clamp(.5+fromPX(vec2((f-.5)*W,.5*y*Hh)),0.,1.));`,
  'the 7 frieze groups (Conway names): a strip of the image centre folded into one fundamental domain by the group operations (translation, glide, vertical / horizontal mirrors, half-turns); bands stacked by plain translation or shown alone');

f = add('Color');
f('q17_cvd_dalton','Dichromacy Simulation (Brettel 1997 / Vienot 1999)',[S('Model',['Brettel 1997','Vienot 1999']),S('Type',['Protan','Deutan','Tritan']),P('Severity',0,1,1,.01)],
  `vec3 l=${LIN('c.rgb')};int m=int(u_p0+.5),t=int(u_p1+.5);vec3 o;
 if(m==1){mat3 M=t==0?mat3(.11238,.88762,0.,.11238,.88762,0.,.00401,-.00401,1.):t==1?mat3(.29275,.70725,0.,.29275,.70725,0.,-.02234,.02234,1.):mat3(1.,.14461,-.14461,0.,.85924,.14076,0.,.85924,.14076);o=l*M;}
 else{mat3 A,B;vec3 n;
  if(t==0){A=mat3(.14980,1.19548,-.34528,.10764,.84864,.04372,.00384,-.00540,1.00156);B=mat3(.14570,1.16172,-.30742,.10816,.85291,.03892,.00386,-.00524,1.00139);n=vec3(.00048,.00393,-.00441);}
  else if(t==1){A=mat3(.36477,.86381,-.22858,.26294,.64245,.09462,-.02006,.02728,.99278);B=mat3(.37298,.88166,-.25464,.25954,.63506,.10540,-.01980,.02784,.99196);n=vec3(-.00281,-.00611,.00892);}
  else{A=mat3(1.01277,.13548,-.14826,-.01243,.86812,.14431,.07589,.80500,.11911);B=mat3(.93678,.18979,-.12657,.06154,.81526,.12320,-.37562,1.12767,.24796);n=vec3(.03901,-.02788,-.01113);}
  o=dot(l,n)>=0.?l*A:l*B;}
 o=clamp(mix(l,o,u_p2),0.,1.);return vec4(${SRGB('o')},1.);`,
  'DaltonLens (libDaltonLens) precomputed linear-RGB matrices: Brettel, Vienot & Mollon 1997 two half-plane projection (separation-plane normal picks the half-plane), Vienot, Brettel & Mollon 1999 single-plane projection (inaccurate for tritan, as DaltonLens warns); sRGB decoded to linear, severity = linear interpolation');

f = add('Analysis');
f('q17_ctwindow','CT Window Presets (Lung / Bone / ...)',[S('Preset',['Lung (W1500 L-600)','Bone (W1800 L400)','Mediastinum (W350 L50)','Soft tissue abdomen (W400 L50)','Liver (W150 L30)','Brain (W80 L40)','Subdural (W200 L75)','Stroke (W40 L40)','Temporal bone (W2800 L600)']),P('Input HU at black',-2048,0,-1024,1),P('Input HU at white',500,4000,3071,1)],
  `const float WW[9]=float[](1500.,1800.,350.,400.,150.,80.,200.,40.,2800.);const float LL[9]=float[](-600.,400.,50.,50.,30.,40.,75.,40.,600.);
 int k=int(u_p0+.5);float hu=mix(u_p1,u_p2,luma(c.rgb));float v=clamp((hu-(LL[k]-.5*WW[k]))/WW[k],0.,1.);return vec4(vec3(v),1.);`,
  'standard radiology display windows (Radiopaedia values): grey = input luma mapped linearly to Hounsfield units (default 12-bit CT range -1024..3071), then linear window (L - W/2 .. L + W/2) to black..white');

f = add('Color');
f('q17_wgrayedge','Weighted Gray-Edge Color Constancy',[P('Gradient scale (sigma)',.5,6,1.5,.1,'px'),P('Minkowski p',1,12,6,.5),P('Weight power (kappa)',0,20,4,.5),S('Edge weighting',['Specular edges','Shadow-shading edges','Material edges'])],
  [`return vec4(${LIN('c.rgb')},1.);`, BH('2.*u_p0'), BV('2.*u_p0'),
  `vec3 GX[256];vec3 GY[256];vec3 CD[256];float mx=1e-6;vec2 e=u_px*max(1.,R(u_p0));
 for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;int k=j*16+i;
  vec3 gx=.5*(T(q+vec2(e.x,0.)).rgb-T(q-vec2(e.x,0.)).rgb);vec3 gy=.5*(T(q+vec2(0.,e.y)).rgb-T(q-vec2(0.,e.y)).rgb);
  GX[k]=gx;GY[k]=gy;CD[k]=normalize(T(q).rgb+1e-4);mx=max(mx,sqrt(dot(gx,gx)+dot(gy,gy)));}
 int wt=int(u_p3+.5);vec3 il=vec3(.57735);
 for(int it=0;it<4;it++){vec3 acc=vec3(1e-12);
  for(int k=0;k<256;k++){vec3 gx=GX[k]/mx,gy=GY[k]/mx;float n2=dot(gx,gx)+dot(gy,gy);if(n2<1e-10)continue;
   float w;
   if(wt==0){float a=dot(gx,il),b=dot(gy,il);w=sqrt((a*a+b*b)/n2);}
   else if(wt==1){vec3 cd=CD[k];float a=dot(gx,cd),b=dot(gy,cd);w=sqrt((a*a+b*b)/n2);}
   else{vec3 cd=CD[k];vec3 u2=normalize(il-dot(il,cd)*cd+1e-6);vec3 hx=gx-dot(gx,cd)*cd-dot(gx,u2)*u2;vec3 hy=gy-dot(gy,cd)*cd-dot(gy,u2)*u2;w=sqrt((dot(hx,hx)+dot(hy,hy))/n2);}
   vec3 m=sqrt(gx*gx+gy*gy);acc+=pow(clamp(w,0.,1.),u_p2)*pow(m,vec3(u_p1));}
  il=normalize(pow(acc,vec3(1./u_p1))+1e-6);}
 vec3 l=${LIN('O(uv).rgb')};vec3 o=l/max(il*1.7320508,vec3(.05));o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`],
  'Gijsenij, Gevers & van de Weijer 2012 (PAMI) weighted gray-edge: illuminant e = (sum w^kappa |grad f|^p)^(1/p) per channel on Gaussian-derivative edges of the linear image (16x16 sample grid), w = share of the edge energy in the specular (illuminant direction), shadow-shading (pixel colour direction) or material (residual) quasi-invariant, iterated 4x from a white start; von Kries correction in linear RGB');

f = add('Edges');
f('q17_bcosfire','B-COSFIRE Vessel / Line Filter',[P('DoG sigma',1,6,2.4,.1,'px'),P('Max radius',2,20,8,1,'px'),S('Polarity',['Dark lines','Bright lines']),P('Gain',.5,40,2,.1)],
  [`float v=luma(c.rgb);if(u_p2<.5)v=1.-v;return vec4(vec3(v),1.);`, BH('2.*u_p0'), BV('2.*u_p0'),
  `float sg=.5*R(u_p0);float acc=0.,ws=0.;float pv=u_p2<.5?-1.:1.;
 for(int j=-9;j<=9;j++)for(int i=-9;i<=9;i++){float d2=float(i*i+j*j);if(d2>9.*sg*sg+1.)continue;float w=exp(-d2/(2.*sg*sg));float v=luma(O(uv+vec2(float(i),float(j))*u_px).rgb);acc+=w*(u_p2<.5?1.-v:v);ws+=w;}
 float dog=max(acc/ws-T(uv).r,0.);return vec4(vec3(clamp(dog*16.,0.,1.)),1.);`,
  BH('2.*max(.5,.35*u_p0)'), BV('2.*max(.5,.35*u_p0)'),
  `float best=0.;float rm=max(R(u_p1),2.);int nr=int(clamp(floor(rm/2.),1.,10.));float sh=max(rm/3.,1.);
 for(int o=0;o<12;o++){float th=float(o)*3.14159265/12.;vec2 dir=vec2(cos(th),sin(th));vec2 nrm=vec2(-dir.y,dir.x);float sl=0.,sw=0.;
  for(int i=-10;i<=10;i++){if(abs(i)>nr)continue;float rho=float(i)*2.*u_k;float ar=abs(rho);vec2 q=uv+dir*rho*u_px;
   float sp=max(.7*ar*.5,.5);float v=T(q).r;float g1=exp(-.5);
   v=max(v,g1*T(q+dir*sp*u_px).r);v=max(v,g1*T(q-dir*sp*u_px).r);v=max(v,g1*T(q+nrm*sp*u_px).r);v=max(v,g1*T(q-nrm*sp*u_px).r);
   float w=exp(-ar*ar/(2.*sh*sh));sl+=w*log(v+1e-3);sw+=w;}
  best=max(best,exp(sl/sw));}
 return vec4(vec3(clamp(best*u_p3,0.,1.)),1.);`],
  'Azzopardi, Strisciuglio, Vento & Petkov 2015 B-COSFIRE (symmetric bar configuration): rectified centre-on DoG (sigma, 0.5 sigma) responses taken at points rho = 0, +-2, +-4 ... along a line, each blurred (Gaussian-weighted max with sigma\' growing with rho, approx. 5-tap) and combined by the Gaussian-weighted geometric mean; rotation tolerance = max over 12 orientations');

f = add('Repair');
f('q17_dullrazor','DullRazor Hair Removal',[P('Line length',5,31,11,2,'px'),P('Threshold',.02,.4,.14,.01),S('Hair',['Dark','Light']),S('Output',['Hair removed','Hair mask','Mask overlay'])],
  [`int h=int(clamp(floor(R(u_p0)*.5),2.,15.));bool dk=u_p2<.5;vec3 best=dk?vec3(0.):vec3(1.);
 for(int d=0;d<3;d++){vec2 dir=d==0?vec2(1.,0.):d==1?vec2(.70710678,.70710678):vec2(0.,1.);if(d==1)dir*=1.41421356;
  vec3 L[61];for(int i=-30;i<=30;i++){if(abs(i)>2*h)continue;L[i+30]=O(uv+dir*float(i)*u_px).rgb;}
  vec3 cl=dk?vec3(1.):vec3(0.);
  for(int i=-15;i<=15;i++){if(abs(i)>h)continue;vec3 m=dk?vec3(0.):vec3(1.);
   for(int j=-15;j<=15;j++){if(abs(j)>h)continue;vec3 v=L[i+j+30];m=dk?max(m,v):min(m,v);}
   cl=dk?min(cl,m):max(cl,m);}
  best=dk?max(best,cl):min(best,cl);}
 vec3 df=abs(O(uv).rgb-best);return vec4(best,max(df.r,max(df.g,df.b)));`,
  `float m=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)m=max(m,step(u_p1,T(uv+vec2(float(i),float(j))*u_px).a));return vec4(O(uv).rgb,m);`,
  `vec4 me=T(uv);if(me.a<.5)return vec4(me.rgb,0.);vec3 bc=me.rgb;float bl=1e9;
 for(int d=0;d<4;d++){vec2 dir=d==0?vec2(1.,0.):d==1?vec2(0.,1.):d==2?vec2(1.,1.):vec2(1.,-1.);
  float a=-1.,b=-1.;vec3 ca=vec3(0.),cb=vec3(0.);
  for(int i=1;i<=40;i++){if(a<0.){vec4 s=T(uv+dir*float(i)*u_px);if(s.a<.5){a=float(i);ca=s.rgb;}}if(b<0.){vec4 s=T(uv-dir*float(i)*u_px);if(s.a<.5){b=float(i);cb=s.rgb;}}if(a>0.&&b>0.)break;}
  if(a>0.&&b>0.){float ln=(a+b)*length(dir);if(ln<bl){bl=ln;bc=mix(ca,cb,a/(a+b));}}}
 return vec4(bc,1.);`,
  `vec4 me=T(uv);int om=int(u_p3+.5);float hm=step(.5,me.a);
 if(om==1)return vec4(vec3(hm),1.);
 if(om==2)return vec4(mix(O(uv).rgb,vec3(1.,0.,0.),.7*hm),1.);
 if(hm<.5)return vec4(O(uv).rgb,1.);
 vec3 v[9];int n=0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){v[n]=T(uv+vec2(float(i),float(j))*u_px).rgb;n++;}
 for(int i=0;i<9;i++)for(int j=0;j<8;j++){if(j>=8-i)break;vec3 a=min(v[j],v[j+1]),b=max(v[j],v[j+1]);v[j]=a;v[j+1]=b;}
 return vec4(v[4],1.);`],
  'Lee, Ng, Gallagher, Coldman & McLean 1997 DullRazor: generalized grey closing per RGB channel with linear structuring elements at 0, 45 and 90 degrees (max of the three closings), hair mask = |original - closing| > threshold (any channel, 3x3 dilated); hair pixels replaced by linear interpolation between the nearest non-hair pixels along the shortest of 4 line directions, then a 3x3 median on the replaced pixels; the thin/long shape verification step is omitted (approx.)');
