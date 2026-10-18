/* ================= apps2 (part 2): G'MIC community filters (Contrast Swiss Mask, Graphic Boost, Blockism, Annular Steiner Chain Round Tile, Pen Drawing, Aurora, Chalk It Up, Metallic Look, Kitaoka Spin Illusion) + Paint.NET BoltBait Outline / Feather Object ================= */
f = add('Tone');
f('gm_contrastswiss','Contrast Swiss Mask (G\'MIC)',[P('Blur the mask',.5,10,2,.1,'px'),S('Mode',['Contrast mask','Contrast boost']),P('Intensity',0,1,1,.01)],
  [`return vec4(vec3(luma(c.rgb)),1.);`,BH('u_p0*2.'),BV('u_p0*2.'),
   `float m=T(uv).r;if(u_p1<.5)m=1.-m;vec3 o=O(uv).rgb;vec3 r=mix(2.*m*o,1.-2.*(1.-m)*(1.-o),step(.5,o));return vec4(mix(o,clamp(r,0.,1.),u_p2),1.);`],
  'PhotoComiX Contrast Swiss Mask (fx_contrast_swm): blurred luminance (sigma = Blur), negated for Contrast mask, then hard light with the mask as base and the image as blend layer (= overlay of the mask on the image); Intensity mixes with the original here (G\'MIC mixes with the mask layer)');

f = add('Stylize');
f('gm_graphicboost','Graphic Boost (G\'MIC)',[P('Radius',0,20,1.25,.05,'px'),P('Darken',0,10,2,.05),P('Pencil amplitude',0,1,.5,.01),P('Opacity',0,1,1,.01)],
  [BH('u_p0*2.'),BV('u_p0*2.'),
   `vec3 o=O(uv).rgb;vec3 d=(o-T(uv).rgb)*3.;vec3 u=clamp(o+min(d,0.)*u_p1+max(d,0.)*.4,0.,1.);return vec4(u,length(u)*.57735);`,
   `vec4 o=T(uv);float s=0.,w=0.;float st=max(u_k,1.);for(int i=-8;i<=8;i++){float g=exp(-float(i*i)/18.);s+=T(uv+vec2(float(i)*st*u_px.x,0.)).a*g;w+=g;}return vec4(o.rgb,s/w);`,
   `vec4 o=T(uv);float s=0.,w=0.;float st=max(u_k,1.);for(int i=-8;i<=8;i++){float g=exp(-float(i*i)/18.);s+=T(uv+vec2(0.,float(i)*st*u_px.y)).a*g;w+=g;}
   vec3 U=o.rgb;float n=length(U)*.57735;float pn=sqrt(clamp(.5+(n-s/w)*(3.+u_p2*30.),0.,1.));vec3 r=mix(2.*pn*U,1.-2.*(1.-pn)*(1.-U),step(.5,U));return vec4(mix(O(uv).rgb,clamp(r,0.,1.),u_p3),1.);`],
  'PhotoComiX Graphic Boost, approx.: G\'MIC unsharp (amount 3, darkness x Darken on the negative detail, lightness 0.4 on the positive) -> B&W pencil layer of it (norm, strong local sharpening, sqrt) -> hard light of the boosted image over the pencil layer; the anisotropic "pencil smoother" / "painter\'s touch" passes are left out');

f('gm_blockism','Blockism (G\'MIC)',[P('Relative size',.5,20,3,.1,'%'),P('Ratio',1,10,1.6,.05),P('Relative block count',1,500,50,1),P('Opacity',0,1,.5,.01)],
  `vec2 P=uv*u_res;float XS=max(floor(u_p0/100.*u_res.x),1.);float YS=floor(u_p1*XS);float MX=floor(XS*1.5);float MY=floor(MX*u_p1);
  float cnt=max(floor(u_p2/100.*max(u_res.x,u_res.y)),1.);float hf=.5*max(MX,MY)+1.;float area=u_res.x*u_res.y;float cell=max(sqrt(area/cnt),hf);float per=cnt*cell*cell/area;
  int np=int(min(ceil(per),6.));float pk=per/float(np);vec2 ci=floor(P/cell);float keys[54];vec3 cols[54];int n=0;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)for(int s=0;s<6;s++){if(s>=np)break;vec2 cid=ci+vec2(float(i),float(j));vec2 sd=cid*1.37+vec2(float(s)*7.31,float(s)*3.17);
   if(hash(sd+.5)>pk)continue;vec2 ctr=(cid+hash2(sd+9.1))*cell;vec3 col=O(clamp(ctr/u_res,0.,1.)).rgb;vec3 lc=${LIN('col')};float Y=luma(lc);float Lv=Y>.008856?116.*pow(Y,1./3.)-16.:903.3*Y;
   float a1=floor(abs(XS+(MX-XS)*(hash(sd+2.3)*2.-1.))),a2=floor(abs(YS+(MY-YS)*(hash(sd+4.7)*2.-1.)));vec2 bs=Lv>64.?vec2(a1,a2):vec2(a2,a1);
   vec2 p0=floor(ctr-bs*.5);if(P.x>=p0.x&&P.x<=p0.x+bs.x+1.&&P.y>=p0.y&&P.y<=p0.y+bs.y+1.&&n<54){keys[n]=hash(sd+6.6);cols[n]=col;n++;}}
  vec3 res=c.rgb;float last=-1.;for(int k=0;k<54;k++){if(k>=n)break;float best=2.;int bi=0;for(int q=0;q<54;q++){if(q>=n)break;if(keys[q]>last&&keys[q]<best){best=keys[q];bi=q;}}last=best;res=mix(res,cols[bi],u_p3);}
  return vec4(res,1.);`,
  'Arto Huotari (Naggobot) Blockism: Count = relative x max(w,h) random rectangles, each filled with the colour at its centre at the given opacity, drawn in random order; width = relative size x image width (+-50 % variance), height = width x ratio, swapped where the centre lightness L* <= 64 (flip tolerance); blocks scattered per grid cell (stratified, not purely uniform) and blended in RGB rather than Lab',1);

f('gm_steinertile','Annular Steiner Chain Round Tile (G\'MIC)',[P('Circles',3,60,12,1),P('Tilt',0,360,0,1,'deg'),P('Outer image size',10,100,100,1,'%'),S('Background',['Black','White','Dimmed image'])],
  `vec2 p=(uv-.5)*u_res;float mr=min(u_res.x,u_res.y);float Rr=.5*mr*.98;float n=floor(u_p0+.5);float th=PI/n;float sn=sin(th);float rc=Rr*(1.-sn)/(1.+sn);float rho=(Rr-rc)*.5;float dc=rc+rho;
  int bm=int(u_p3+.5);vec3 col=bm==0?vec3(0.):bm==1?vec3(1.):O(uv).rgb*.3;vec2 sc=vec2(mr/u_res.x,mr/u_res.y)*.5;float r=length(p);
  float k1=clamp(rc-r+.5,0.,1.);if(k1>0.)col=mix(col,O(.5+p/rc*sc).rgb,k1);
  float tl=radians(u_p1);float a=atan(p.y,p.x)-tl;float k=floor(a/(2.*th)+.5);float ak=k*2.*th+tl;vec2 d=p-dc*vec2(cos(ak),sin(ak));float rr=rho*u_p2/100.;
  float k2=clamp(rr-length(d)+.5,0.,1.);if(k2>0.)col=mix(col,O(.5+d/rr*sc).rgb,k2);return vec4(col,1.);`,
  'samj Annular Steiner Chain Round Tile: the image (centred square crop, cut to a disc) in the central circle and in the N tangent circles of an annular Steiner chain: outer radius R, inner rc = R(1 - sin(pi/N))/(1 + sin(pi/N)), ring circles (R - rc)/2 centred at rc + their radius; the optional tint / contour layers are left out, output keeps the input size');

f = add('Paint');
f('gm_pendrawing','Pen Drawing (G\'MIC)',[P('Amplitude',0,30,10,.5),P('Sharpen',0,3,1.5,.05)],
  [`vec2 g=sobelD(uv,2.*u_k);float gl=length(g);vec2 t=gl>1e-4?vec2(-g.y,g.x)/gl:vec2(1.,0.);float Ln=R(u_p0);vec3 s=vec3(0.);float w=0.;
   for(int i=-8;i<=8;i++){float x=float(i)/8.*Ln;float gw=exp(-float(i*i)/32.);s+=T(uv+t*x*u_px).rgb*gw;w+=gw;}return vec4(s/w,1.);`,
   BH('4.'),BV('4.'),
   `vec3 b=blur5(uv,u_k);vec3 s=c.rgb+(c.rgb-b)*(2.+u_p1*6.);return vec4(clamp(s,0.,1.),1.);`,
   `float mu=0.,m2=0.;for(int j=0;j<20;j++)for(int i=0;i<20;i++){vec3 q=O((vec2(float(i),float(j))+.5)/20.).rgb;mu+=q.r+q.g+q.b;m2+=dot(q,q);}mu/=1200.;float sg=sqrt(max(m2/1200.-mu*mu,1e-5));
   vec3 v=c.rgb;vec3 best=v;float bd=1e9;for(int j=0;j<20;j++)for(int i=0;i<20;i++){vec3 q=O((vec2(float(i),float(j))+.5)/20.).rgb;q=1./(1.+exp(-1.702*(q-mu)/sg));vec3 dd=q-v;float e=dot(dd,dd);if(e<bd){bd=e;best=q;}}
   return vec4(best,1.);`],
  'G\'MIC Pen Drawing (Tschumperle), approx.: smoothing along isophotes (stands in for anisotropic smooth, length = Amplitude), blur 2, strong sharpening, then each pixel mapped to the nearest colour of a 20x20 palette taken from the image and equalised (equalisation approximated by a logistic CDF of the palette values, no dithering)');

f = add('Render');
f('gm_aurora','Aurora (G\'MIC)',[P('Vertical amount',0,50,6,.1,'%'),P('Horizontal amount',0,50,1,.1,'%'),S('Blend mode',['None','Average'])],
  [`float sg=max(u_p0/100.*u_res.y,.7);float st=max(1.,3.*sg/32.);vec3 acc=vec3(0.);float wn=0.;
   for(int i=-32;i<=32;i++){float y=float(i)*st;if(abs(y)>3.*sg)continue;float g=exp(-y*y/(2.*sg*sg));acc+=O(uv+vec2(0.,y*u_px.y)).rgb*g*(y*y/(sg*sg)-1.);wn+=g;}
   acc/=wn;return vec4(.5+.5*clamp(acc,-1.,1.),1.);`,
   `float sg=u_p1/100.*u_res.x;return blur1d(u_tex,uv,vec2(1.,0.),2.*sg);`,
   `vec3 v=max((c.rgb-.5)*2.,0.);float mx=1e-4;for(int j=0;j<24;j++)for(int i=0;i<24;i++){vec3 q=max((T((vec2(float(i),float(j))+.5)/24.).rgb-.5)*2.,0.);mx=max(mx,max(q.r,max(q.g,q.b)));}
   v=clamp(v/mx,0.,1.);return vec4(u_p2>.5?(v+O(uv).rgb)*.5:v,1.);`],
  'Garagecoder Aurora (gcd_aurora): 2nd-order Deriche (Gaussian 2nd derivative) along y with sigma = vertical %, Gaussian smoothing along x with sigma = horizontal %, negatives clipped, normalised to the full range (max from a 24x24 sample grid); Average blends 50/50 with the image');

f = add('Paint');
f('gm_chalkitup','Chalk It Up (G\'MIC)',[P('Abstraction',0,10,5,1),P('Morpho size',1,32,5,1,'px'),P('Spread',0,5,1.9,.05,'px'),S('Invert colors',['Off','On'])],
  [`return vec4(kuwa(uv,1.+u_p0*.6),1.);`,
   `float hs=R(u_p1*.5);float st=max(hs/6.,1.);vec3 mx=c.rgb;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>hs||abs(o.y)>hs)continue;mx=max(mx,T(uv+o*u_px).rgb);}
   vec3 d=max(${LIN('mx')}-${LIN('c.rgb')},0.);return vec4(${SRGB('d')},1.);`,
   `vec2 o=(hash2(floor(uv*u_res))-.5)*2.*vec2(.42,1.)*R(u_p2);vec3 v=T(uv+o*u_px).rgb;return vec4(u_p3>.5?1.-v:v,1.);`],
  'samj / Lylejk Chalk It Up: painting abstraction (here Kuwahara) -> morphology "Dilation - Original" on linear RGB with a square of Morpho size -> random spread (x : y = 0.8 : 1.9, scaled by Spread); approx. of the G\'MIC painting step');

f = add('Materials');
f('gm_metallic','Metallic Look (G\'MIC)',[P('Strength',0,1,1,.01),P('Smoothness',0,20,0,.1,'px'),S('Metal',['Silver','Gold','Copper','Bronze','Blue steel'])],
  [BH('u_p1*2.'),BV('u_p1*2.'),
   `float X[7]=float[7](0.,31.,64.,110.,148.,177.,255.);float Y[7]=float[7](0.,111.,17.,176.,75.,235.,186.);float l=luma(c.rgb)*255.;float v=l;
   for(int it=0;it<2;it++){int k=0;for(int q=0;q<6;q++){if(v>=X[q])k=q;}float x0=X[k],x1=X[k+1];float h=x1-x0;float t=clamp((v-x0)/h,0.,1.);
    float m0=k==0?(Y[1]-Y[0])/(X[1]-X[0]):(Y[k+1]-Y[k-1])/(X[k+1]-X[k-1]);float m1=k==5?(Y[6]-Y[5])/(X[6]-X[5]):(Y[k+2]-Y[k])/(X[k+2]-X[k]);
    float t2=t*t,t3=t2*t;v=clamp((2.*t3-3.*t2+1.)*Y[k]+(t3-2.*t2+t)*h*m0+(-2.*t3+3.*t2)*Y[k+1]+(t3-t2)*h*m1,0.,255.);}
   float g=mix(l,v,u_p0);int m=int(u_p2+.5);vec3 fc=m==4?vec3(1.,1.,1.1):vec3(1.);vec3 sh=m==1?vec3(50.,50.,-50.):m==2?vec3(75.,5.,-25.):m==3?vec3(70.,40.,-20.):m==4?vec3(-5.,0.,12.):vec3(0.);
   return vec4(clamp(((g-128.)*fc+sh+128.)/255.,0.,1.),1.);`],
  'Tom Keil Metallic Look (fx_tk_metallic): Gaussian blur (Smoothness), luminance, the curve through (0,0) (31,111) (64,17) (110,176) (148,75) (177,235) (255,186) applied twice (cubic Hermite here; G\'MIC rescales to the image min / max first), value-composed at Strength, then the metal tint from fx_mix_rgb (gold +50 / +50 / -50, copper +75 / +5 / -25, bronze +70 / +40 / -20, blue steel B x1.1 and -5 / 0 / +12)');

f = add('Render');
f('gm_kitaoka','Kitaoka Spin Illusion (G\'MIC)',[P('Sectors',10,80,30,1),P('Zoom',1,30,8,.1),P('Inner radius',0,2,0,.01),P('Outer radius',0,2,1,.01)],
  `vec2 q=uv*2.-1.;float a=atan(q.y,q.x);if(a<0.)a+=2.*PI;float r=length(q);float rf=floor(log(max(r,1e-6))*u_p1);float v=fract(u_p0*a/(2.*PI)+rf*.5);vec3 col=vec3(0.);
  if(r>u_p2&&r<u_p3){if(v>.15&&v<.5)col=vec3(113.,0.,113.)/255.;if(v>.5&&v<.65)col=vec3(1.);if(v>.65)col=vec3(0.,1.,0.);}return vec4(col,1.);`,
  'Souphead KittyRings (step7 MathMap port), exact: log-polar rings (ring = floor(zoom ln r)) of N sectors, each sector black 0-0.15, colour 1 0.15-0.5, white 0.5-0.65, colour 2 0.65-1 and shifted half a sector per ring, giving Kitaoka\'s Rotating Snakes drift; colours 113,0,113 and 0,255,0; coordinates stretched to the frame as in G\'MIC');

f = add('Stylize');
f('pn_objectedge','Outline / Feather Object (BoltBait)',[S('Mode',['Outline object','Feather object']),P('Width',1,60,6,.5,'px'),P('Tolerance',0,1,.15,.01),S('Background',['Corner colour','White','Black'])],
  `int bm=int(u_p3+.5);vec3 bg=bm==1?vec3(1.):vec3(0.);if(bm==0){bg=vec3(0.);for(int k=0;k<4;k++)for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec2 q=(vec2(float(i),float(j))+.5)*.01;bg+=O(vec2(k==1||k==3?1.-q.x:q.x,k>=2?1.-q.y:q.y)).rgb;}bg/=36.;}
#define A2OBJ(q) step(u_p2,length(O(q).rgb-bg)*.57735)
  float w=R(u_p1);float in0=A2OBJ(uv);float dmin=1e4;
  for(int i=0;i<16;i++){float rr=(float(i)+1.)/16.*(w+R(1.));for(int k=0;k<24;k++){float an=(float(k)+.37*float(i))*.261799;vec2 q=uv+vec2(cos(an),sin(an))*rr*u_px;if(A2OBJ(q)!=in0)dmin=min(dmin,rr);}}
  vec3 o=c.rgb;if(u_p0<.5){float al=in0>.5?0.:1.-smoothstep(w-.5*u_k,w+.5*u_k,dmin);return vec4(mix(o,vec3(0.),al),1.);}
  float al=in0>.5?clamp(dmin/w,0.,1.):0.;return vec4(mix(bg,o,al),1.);`,
  'BoltBait Outline Object / Feather Object (Paint.NET): the plugins work on the layer alpha; here the object = pixels farther than Tolerance from the background colour (corner average, white or black). Outline draws a black band of Width around the object, Feather fades the object edge into the background over Width (distance by 16 x 24 polar samples)');
