/* ================= q23b: MONAI / TorchIO 2-D intensity & spatial augmentations, NPR (Papari generalized Kuwahara, Kyprianidis-Doellner orientation-aligned bilateral, Squiggify / SpiralBetty / Lichtenstein Ben-Day), Camera Raw Point Color ================= */
f = add('Augment');
f('q23_med_intensity','Medical Intensity Augment (Bias Field / Rician / Smooth Fields / Remap)',[S('Transform',['MRI bias field (TorchIO RandomBiasField)','Rician noise (MONAI RandRicianNoise)','Smooth-field contrast (MONAI)','Smooth-field intensity (MONAI)','Intensity remap (MONAI RandIntensityRemap)']),P('Strength',0,1,.5,.01),P('Field cell size',10,400,120,1,'px'),S('Channels',['Same for all','Per channel'])],
  `int m=int(u_p0+.5);bool pc=u_p3>.5;vec3 x=c.rgb;float S=u_p1;vec2 sd=vec2(u_seed*31.7,u_seed*11.3);
 if(m==0){vec2 q=uv*2.-1.;vec4 X=vec4(1.,q.x,q.x*q.x,q.x*q.x*q.x),Y=vec4(1.,q.y,q.y*q.y,q.y*q.y*q.y);vec3 b=vec3(0.);
  for(int ch=0;ch<3;ch++){float acc=0.;int idx=0;float co=pc?float(ch):0.;for(int i=0;i<=3;i++)for(int j=0;j<=3;j++){if(i+j>3)continue;acc+=(hash(sd+vec2(float(idx),co*7.+1.))*2.-1.)*S*X[i]*Y[j];idx++;}b[ch]=acc;}
  return vec4(clamp(x*exp(b),0.,1.),1.);}
 if(m==1){float sg=.2*S;vec3 n1,n2;vec2 pp0=floor(uv*u_res);for(int ch=0;ch<3;ch++){vec2 pp=pp0+sd+float(ch)*91.;float u1=max(hash(pp),1e-6),u2=hash(pp+37.1),u3=max(hash(pp+71.3),1e-6),u4=hash(pp+13.9);
   n1[ch]=sqrt(-2.*log(u1))*cos(6.2831853*u2);n2[ch]=sqrt(-2.*log(u3))*cos(6.2831853*u4);}
  return vec4(clamp(sqrt((x+sg*n1)*(x+sg*n1)+sg*sg*n2*n2),0.,1.),1.);}
 if(m<=3){vec2 g=PX(uv)/u_p2+.5;vec2 i0=floor(g),fr=fract(g);fr=fr*fr*(3.-2.*fr);vec3 fl;
  for(int ch=0;ch<3;ch++){vec2 o=sd+vec2((pc?float(ch):0.)*53.1,0.);fl[ch]=mix(mix(hash(i0+o),hash(i0+vec2(1.,0.)+o),fr.x),mix(hash(i0+vec2(0.,1.)+o),hash(i0+vec2(1.,1.)+o),fr.x),fr.y);}
  if(m==2)return vec4(pow(max(x,0.),mix(vec3(1.),mix(vec3(.5),vec3(4.5),fl),S)),1.);
  return vec4(x*mix(vec3(1.),mix(vec3(.1),vec3(1.),fl),S),1.);}
 vec3 o;for(int ch=0;ch<3;ch++){float co=(pc?float(ch):0.)*17.3;float sl=hash(sd+vec2(5.5,co))<.5?-.7:.7;int ix=int(clamp(x[ch],0.,1.)*255.+.5);
  float su=0.;for(int k=0;k<30;k++)su+=hash(sd+vec2(float(k),co+3.));float mn=1e9,mx=-1e9,val=0.;
  for(int i=0;i<256;i++){float cv=su/30.+sl*float(i)/256.;mn=min(mn,cv);mx=max(mx,cv);if(i==ix)val=cv;su+=hash(sd+vec2(float(i+30),co+3.))-hash(sd+vec2(float(i),co+3.));}
  o[ch]=(val-mn)/max(mx-mn,1e-6);}
 return vec4(mix(x,o,S),1.);`,
  '2-D versions of the MONAI / TorchIO definitions, image range taken as 0..1: TorchIO RandomBiasField = x exp(sum c_ij X^i Y^j, i+j <= 3), X,Y in [-1,1], c ~ U(-Strength, Strength) (default 0.5, order 3); MONAI RandRicianNoise = sqrt((x + n1)^2 + n2^2), n ~ N(0, 0.2 Strength) (fixed std, no std sampling); RandSmoothFieldAdjustContrast = x^gamma with gamma field in (0.5, 4.5) and RandSmoothFieldAdjustIntensity = x * field in (0.1, 1.0), both mixed by Strength - random coarse grid (cell size) upsampled with smooth interpolation (MONAI uses AREA resizing: approx.); RandIntensityRemap = curve from a 30-sample moving average of random levels + slope (+-0.7, sign from seed) * index over 256 levels, rescaled to 0..1, mixed by Strength. Seeded',true);

f('q23_med_spatial','Medical Spatial Augment (Anisotropy / Low Resolution / Smooth Deform / Patch Swap)',[S('Transform',['Anisotropy (TorchIO RandomAnisotropy)','Simulate low resolution (MONAI)','Smooth-field deform (MONAI RandSmoothDeform)','Patch swap (TorchIO RandomSwap)']),P('Amount',0,1,.5,.01),P('Cell or patch size',4,300,40,1,'px'),S('Axis',['Horizontal','Vertical','Random (seed)'])],
  `int m=int(u_p0+.5);vec2 WH=u_res/u_k;vec2 p=PX(uv);float A=u_p1;vec2 sd=vec2(u_seed*23.1,u_seed*5.3);
 if(m<=1){vec2 fac;if(m==0){float mm=1.5+3.5*A;int ax=int(u_p3+.5);if(ax==2)ax=hash(sd)<.5?0:1;fac=ax==0?vec2(mm,1.):vec2(1.,mm);}else fac=vec2(1./max(1.-.9*A,.1));
  vec2 t=p/fac-.5;vec2 k0=floor(t);vec2 fr=t-k0;
  #define Q23S(kk) O(fromPX(floor(((kk)+.5)*fac)+.5))
  vec4 a=mix(Q23S(k0),Q23S(k0+vec2(1.,0.)),fr.x),b=mix(Q23S(k0+vec2(0.,1.)),Q23S(k0+vec2(1.,1.)),fr.x);return vec4(mix(a,b,fr.y).rgb,1.);}
 if(m==2){vec2 g=p/u_p2+.5;vec2 i0=floor(g),fr=fract(g);fr=fr*fr*(3.-2.*fr);
  #define Q23H(oo) (vec2(hash((oo)+sd),hash((oo)+sd+vec2(41.7,9.2)))*2.-1.)
  vec2 dv=mix(mix(Q23H(i0),Q23H(i0+vec2(1.,0.)),fr.x),mix(Q23H(i0+vec2(0.,1.)),Q23H(i0+vec2(1.,1.)),fr.x),fr.y);
  return O(fromPX(clamp(p+dv*.1*A*WH,vec2(.5),WH-.5)));}
 vec2 q=floor(p);float ps=floor(u_p2);int N=int(A*200.+.5);vec2 lim=max(WH-ps,vec2(1.));
 for(int it=399;it>=0;it--){if(it>=N)continue;vec2 Pa=floor(hash2(sd+vec2(float(it),1.3))*lim),Pb=floor(hash2(sd+vec2(float(it),7.9))*lim);
  if(all(greaterThanEqual(q,Pb))&&all(lessThan(q,Pb+ps)))q+=Pa-Pb;else if(all(greaterThanEqual(q,Pa))&&all(lessThan(q,Pa+ps)))q+=Pb-Pa;}
 return O(fromPX(q+.5));`,
  '2-D versions: TorchIO RandomAnisotropy = nearest-neighbour downsampling along one axis by a factor 1.5 + 3.5 Amount (TorchIO range 1.5..5) then linear upsampling back; MONAI SimulateLowResolution = nearest downsampling by zoom 1 - 0.9 Amount on both axes (MONAI default zoom 0.5..1) then bilinear upsampling; MONAI RandSmoothDeform = displacement field from a random coarse grid (cell size) smoothly upsampled (MONAI: AREA, approx.), def_range = 0.2 Amount in [-1,1] grid units, border padding; TorchIO RandomSwap = 200 Amount sequential swaps (default 100) of two random patch-size squares, evaluated backwards per pixel. Seeded',true);

/* ---------- NPR ---------- */
f = add('Paint');
f('q23_gkuwahara','Generalized Kuwahara (Papari-Petkov-Campisi)',[P('Radius',2,12,6,.5,'px'),P('Sharpness q',1,16,8,.5),S('Sectors',['8 sectors','4 sectors'])],
  `float rad=R(u_p0);float st=max(1.,rad/12.);float N=u_p2>.5?4.:8.;float sw=6.2831853/N;vec4 mm[8];vec3 s2[8];for(int k=0;k<8;k++){mm[k]=vec4(0.);s2[k]=vec3(0.);}
 for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){vec2 o=vec2(float(i),float(j))*st;float d=length(o);if(d>rad+.5)continue;vec3 cc=O(uv+o*u_px).rgb;float gr=exp(-2.*d*d/(rad*rad));float th=atan(o.y,o.x);
  for(int k=0;k<8;k++){if(float(k)>=N)break;float da=abs(mod(th-float(k)*sw+PI,2.*PI)-PI);float wa=d<.5?1./N:clamp(.5+(.5*sw-da)/(.5*sw),0.,1.);float w=wa*gr;mm[k]+=vec4(cc*w,w);s2[k]+=cc*cc*w;}}
 float sg[8];float smin=1e9;for(int k=0;k<8;k++){if(float(k)>=N)break;vec3 mu=mm[k].rgb/max(mm[k].w,1e-6);vec3 v=abs(s2[k]/max(mm[k].w,1e-6)-mu*mu);sg[k]=max(sqrt(v.r+v.g+v.b),1e-4);smin=min(smin,sg[k]);}
 vec3 o=vec3(0.);float W=0.;for(int k=0;k<8;k++){if(float(k)>=N)break;float w=pow(smin/sg[k],u_p1);o+=w*mm[k].rgb/max(mm[k].w,1e-6);W+=w;}return vec4(o/W,1.);`,
  'Papari, Petkov & Campisi 2007 (artistic edge and corner enhancing smoothing): disc split into N = 8 (or 4) sectors with smooth weighting functions (here a linear angular cross-fade forming a partition of unity, approx. of the Gaussian-smoothed sector indicators) x Gaussian radial falloff; output = sum m_i s_i^-q / sum s_i^-q with s_i the sector colour standard deviation; sampling stride grows above 12 px');

const Q23_OBF = (along) => `float a=T(uv).a*PI;vec2 tg=vec2(cos(a),sin(a));vec3 c0=T(uv).rgb;float sdd=max(R(u_p0),.5);float sr=max(u_p1,.005);float K=min(ceil(2.*sdd),16.);float st=max(1.,K/16.);
 vec3 s=c0;float W=1.;${along?'':'vec2 dn=vec2(-tg.y,tg.x);'}
 for(int dir=0;dir<2;dir++){vec2 pp=uv;vec2 dv=${along?'tg':'dn'}*(dir==0?1.:-1.);
  for(int i=1;i<=16;i++){float o=float(i)*st;if(o>K)break;${along?'pp+=dv*st*u_px;float a2=T(pp).a*PI;vec2 t2=vec2(cos(a2),sin(a2));if(dot(t2,dv)<0.)t2=-t2;dv=t2;vec3 cs=T(pp).rgb;':'vec3 cs=T(uv+dv*o*u_px).rgb;'}
   vec3 df=cs-c0;float w=exp(-o*o/(2.*sdd*sdd))*exp(-dot(df,df)/(2.*sr*sr));s+=cs*w;W+=w;}}
 return vec4(s/W,T(uv).a);`;
f('q23_oabf','Orientation-Aligned Bilateral Filter (Kyprianidis-Doellner)',[P('Sigma d (spatial)',1,8,3,.1,'px'),P('Sigma r (range)',.01,.5,.08,.005),S('Iterations',['1','2','3'],1),P('Tensor smoothing',.5,5,2,.1,'px')],
  [`vec2 p=u_px;vec3 tl=T(uv+vec2(-p.x,p.y)).rgb,t=T(uv+vec2(0.,p.y)).rgb,tr=T(uv+p).rgb,l=T(uv-vec2(p.x,0.)).rgb,r=T(uv+vec2(p.x,0.)).rgb,bl=T(uv-p).rgb,b=T(uv-vec2(0.,p.y)).rgb,br=T(uv+vec2(p.x,-p.y)).rgb;
   vec3 gx=((tr+2.*r+br)-(tl+2.*l+bl))*.25,gy=((tl+2.*t+tr)-(bl+2.*b+br))*.25;return vec4(dot(gx,gx)/3.,.5+dot(gx,gy)/6.,dot(gy,gy)/3.,1.);`,
   BH('u_p3'),BV('u_p3'),
   `float E=c.r*3.,F=(c.g-.5)*6.,G=c.b*3.;float dd=sqrt(max((E-G)*(E-G)+4.*F*F,0.));float l1=.5*(E+G+dd);vec2 v=vec2(l1-E,-F);vec2 tg=length(v)>1e-7?normalize(v):vec2(1.,0.);
   float a=atan(tg.y,tg.x);if(a<0.)a+=PI;if(a>=PI)a-=PI;return vec4(O(uv).rgb,a/PI);`,
   Q23_OBF(false),Q23_OBF(true),
   `if(u_p2<.5)return c;${Q23_OBF(false)}`,`if(u_p2<.5)return c;${Q23_OBF(true)}`,
   `if(u_p2<1.5)return c;${Q23_OBF(false)}`,`if(u_p2<1.5)return c;${Q23_OBF(true)}`],
  'Kyprianidis & Doellner 2008 (image abstraction by structure adaptive filtering): smoothed structure tensor gives the local edge tangent; separable bilateral filtering, first across the edge (along the gradient), then along the flow (stream line traced through the tangent field), iterated; Gaussian spatial weight sigma d, colour range weight sigma r (RGB distance)');

const Q23_DK = `(1.-.2*(luma(O(fromPX(pt)).rgb)+luma(O(fromPX(pt+vec2(sp*.3,0.))).rgb)+luma(O(fromPX(pt-vec2(sp*.3,0.))).rgb)+luma(O(fromPX(pt+vec2(0.,sp*.3))).rgb)+luma(O(fromPX(pt-vec2(0.,sp*.3))).rgb)))`;
f('q23_npr_lineart','Squiggle / Spiral / Ben-Day Line Art',[S('Style',['Squiggle lines (Squiggify)','Spiral line (SpiralBetty)','Ben-Day pop art (Lichtenstein)']),P('Spacing',3,30,7,.5,'px'),P('Strength',0,2,1,.01),S('Ink',['Black on paper','Image colour'])],
  `int m=int(u_p0+.5);float sp=u_p1;vec2 p=PX(uv);vec2 WH=u_res/u_k;float ink=0.;vec3 paper=vec3(.97,.96,.93);vec3 ic=u_p3>.5?clamp(sat(O(uv).rgb,1.3)*.85,0.,1.):vec3(.06);
 if(m==0){float k0=floor(p.y/sp);float lw=max(.7,sp*.12);float w=6.2831853/(sp*.55);
  for(int dk=-1;dk<=1;dk++){float yc=(k0+float(dk)+.5)*sp;vec2 pt=vec2(p.x,yc);float D=clamp(smoothstep(.12,.9,${Q23_DK})*u_p2,0.,1.);float a=.5*sp*D;float y=yc+a*sin(w*p.x);float sl=a*w*cos(w*p.x);float dist=abs(p.y-y)/sqrt(1.+sl*sl);ink=max(ink,1.-smoothstep(lw*.5-.5,lw*.5+.5,dist));}}
 else if(m==1){vec2 v=p-WH*.5;float r=length(v);float th=atan(v.y,v.x);float u=r/sp-th/6.2831853;float n=floor(u+.5);float dist=abs(u-n)*sp;
  float ra=max((n+th/6.2831853)*sp,0.);vec2 pt=WH*.5+ra*vec2(cos(th),sin(th));float D=clamp(smoothstep(.2,.95,${Q23_DK})*u_p2,0.,1.);float hw=.5*sp*.92*D+.25;ink=1.-smoothstep(hw-.5,hw+.5,dist);}
 else{vec3 sm=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)sm+=O(uv+vec2(float(i),float(j))*R(1.5)*u_px).rgb;sm/=9.;vec3 hv=rgb2hsv(sm);float h=hv.x,s=hv.y,v=hv.z;
  vec3 RED=vec3(.86,.12,.14),YEL=vec3(1.,.86,.12),BLU=vec3(.1,.32,.72),WHT=vec3(.98,.96,.9),BLK=vec3(.05);
  vec2 q=rot(p,.7853982)/sp;float dd=length(fract(q)-.5)*sp;float dot_=1.-smoothstep(.3*sp-.6,.3*sp+.6,dd);vec3 col;
  if(v<.2)col=BLK;else if(s<.25){col=v>.78?WHT:v>.48?mix(WHT,BLU,dot_):BLU;}
  else if(h<.07||h>.9){col=(v>.7&&s<.6)?mix(WHT,RED,dot_):RED;}else if(h<.2){col=(v>.8&&s<.45)?mix(WHT,YEL,dot_):v<.62?mix(YEL,RED,dot_):YEL;}else if(h<.45){col=mix(YEL,BLU,dot_);}else{col=(v>.7&&s<.5)?mix(WHT,BLU,dot_):BLU;}
  float e=0.;vec2 o=R(1.5)*u_px;float gx=luma(O(uv+vec2(o.x,0.)).rgb)-luma(O(uv-vec2(o.x,0.)).rgb),gy=luma(O(uv+vec2(0.,o.y)).rgb)-luma(O(uv-vec2(0.,o.y)).rgb);e=smoothstep(.12,.22,length(vec2(gx,gy))*u_p2);
  return vec4(mix(col,BLK,e),1.);}
 return vec4(mix(paper,ic,ink),1.);`,
  'single-line NPR renderers: Squiggify-style = horizontal lines every Spacing px drawn as sine squiggles whose amplitude grows with the local darkness (fixed frequency, exact point-to-curve distance approx. by |dy| / sqrt(1 + slope^2)); SpiralBetty-style = one Archimedean spiral from the centre whose stroke width follows the darkness under it; Ben-Day pop art (Lichtenstein) = image classified into black, white, red, yellow, blue flats and light tints rendered as 45 deg Ben-Day dot screens of colour on white, with black outlines from the luminance gradient');

f = add('Color');
f('q23_pointcolor','Point Color (Camera Raw)',[P('Target hue',0,360,25,1,'deg'),P('Hue shift',-60,60,15,1,'deg'),P('Saturation shift',-1,1,.3,.01),P('Luminance shift',-1,1,0,.01)],
  `vec3 hl=rgb2hsl(c.rgb);float dh=abs(fract(hl.x-u_p0/360.+.5)-.5)*360.;float w=(1.-smoothstep(18.,45.,dh))*smoothstep(.04,.16,hl.y);
 float h2=fract(hl.x+w*u_p1/360.);float s2=u_p2>=0.?mix(hl.y,1.,w*u_p2*.8):hl.y*(1.+w*u_p2);float l2=u_p3>=0.?mix(hl.z,1.,w*u_p3*.5):hl.z*(1.+w*u_p3*.5);
 return vec4(clamp(hsl2rgb(vec3(h2,s2,l2)),0.,1.),1.);`,
  'Adobe Camera Raw / Lightroom Point Color, approx.: the picked colour is given as a target hue; pixels within about +-18 deg of it (soft to +-45 deg, near-greys excluded) get Hue Shift, Saturation Shift (towards full / towards grey) and Luminance Shift (towards white / black), weighted by the selection; the range refinement sliders are fixed');
