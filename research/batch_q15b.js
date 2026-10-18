/* ================= q15 part 2: DFT rays / Ozone / Telecine / zMatte screen tools, scikit-image & Pillow functions, Clip Studio filters, AwesomeBump remove shading ================= */
const Q15_PIXO = `
 #define PXO(pp) O((clamp((pp),vec2(0.),u_res-1.)+.5)/u_res)
 `;

f = add('Render');
f('q15_dftrays','Rays: Fan / Spiral / Random Spikes / Radial Streaks (DFT)',[S('Type',['Fan Rays','Spiral Rays','Random Spikes','Radial Streaks']),P('Center X',0,1,.5,.01),P('Center Y',0,1,.65,.01),P('Intensity',0,2,.6,.01)],
 [`vec3 v=O(uv).rgb;float l=luma(v);float k=smoothstep(.55,.95,l);vec2 d=(uv-vec2(u_p1,u_p2))*vec2(asp(),1.);float g=exp(-dot(d,d)*40.);return vec4(v*k+vec3(1.,.95,.85)*g*.6,1.);`,
  `vec2 ce=vec2(u_p1,u_p2);vec3 acc=vec3(0.);float ws=0.;for(int i=0;i<48;i++){float t=float(i)/48.;float w=exp(-3.*t);acc+=T(mix(uv,ce,t*.85)).rgb*w;ws+=w;}return vec4(acc/ws,1.);`,
  `int m=int(u_p0+.5);vec2 ce=vec2(u_p1,u_p2);vec2 d=(uv-ce)*vec2(asp(),1.);float r=length(d);float th=atan(d.y,d.x);vec3 ry=T(uv).rgb;float mk=1.;
  if(m==0){float fan=smoothstep(.95,.55,abs(sin(.5*(th+1.5707963))));float st=pow(.5+.5*cos(th*36.+2.*vnoise(vec2(th*6.,0.))),3.);mk=st*(1.-fan*.85)*1.6;}
  else if(m==1){float st=pow(.5+.5*cos(th*18.+log(max(r,.002))*9.),4.);mk=st*1.8;}
  else if(m==2){float bn=floor((th+3.14159265)/6.2831853*90.);float a0=(bn+.5)/90.*6.2831853-3.14159265;float ln=.15+.6*hash(vec2(bn,7.+u_seed));float wd=.004+.01*hash(vec2(bn,3.));float ad=abs(th-a0)*r;mk=hash(vec2(bn,1.))>.45?smoothstep(wd,0.,ad)*smoothstep(ln,ln*.4,r)*3.:0.;}
  else mk=1.5;
  vec3 o=O(uv).rgb;vec3 add_=ry*mk*u_p3;return vec4(1.-(1.-o)*(1.-clamp(add_,0.,1.)),1.);`],
 'Digital Film Tools Rays-style ray types (look approx.): highlights above a soft threshold plus a glow at the centre are gathered radially toward the centre (48 taps, exponential decay), then masked by a fan-shaped stripe pattern (Fan), log-spiral stripes (Spiral), seeded random thin spikes of random length (Random Spikes) or left unmasked (Radial Streaks), screen-blended', true);

f = add('Color');
f('q15_ozone','Ozone Zone Grading (DFT)',[P('Shadows (zones 0-III)',-2,2,.5,.05,'zones'),P('Midtones (zones IV-VI)',-2,2,0,.05,'zones'),P('Highlights (zones VII-X)',-2,2,-.5,.05,'zones'),P('Zone softness',.5,3,1.5,.05)],
 `vec3 lin=${LIN('c.rgb')};float Y=max(dot(lin,vec3(.2126,.7152,.0722)),1e-5);float z=clamp(5.+log2(Y/.18),0.,10.);float sf=u_p3;
  float wl=1.-smoothstep(3.5-sf,3.5+sf,z),wh=smoothstep(6.5-sf,6.5+sf,z),wm=max(1.-wl-wh,0.);float dz=wl*u_p0+wm*u_p1+wh*u_p2;float z2=clamp(z+dz,0.,10.5);
  float Y2=.18*exp2(z2-5.);if(z<=0.)Y2=Y*exp2(dz);vec3 o=lin*(Y2/Y);o=clamp(o,0.,1.);
  return vec4(${SRGB('o')},1.);`,
 'Ozone-style 11-zone (Ansel Adams zone system) grading, approx.: linear luminance mapped to zones (zone V = 18% grey, one stop per zone, 0-X), shadow / midtone / highlight zone groups shifted by whole or fractional zones with smooth (Zone softness) group boundaries, colour scaled by the luminance ratio');

f = add('Film');
f('q15_telecine','Telecine Transfer (DFT)',[P('Amount',0,1,1,.01),P('Black lift',0,.15,.05,.005),P('Highlight knee',0,1,.6,.01),P('Softness',0,3,1,.05,'px')],
 [BH('u_p3'),BV('u_p3'),`vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;vec3 v=mix(o,bl,.6);float kn=1.-u_p2*.35;vec3 hk=mix(v,kn+(1.-kn)*(1.-exp(-(v-kn)/max(1.-kn,.01))),step(kn,v));
  float hal=max(luma(bl)-.75,0.)*2.;hk+=vec3(1.,.55,.35)*hal*.15;vec3 tl=u_p1+(1.-u_p1)*hk;float L_=luma(tl);tl=mix(vec3(L_),tl,.85);tl*=vec3(.98,1.,1.03);tl=pow(clamp(tl,0.,1.),vec3(1.05));return vec4(mix(o,clamp(tl,0.,1.),u_p0),1.);`],
 'look approximation of a film-to-video telecine transfer (DFT Telecine): slightly soft scan (Gaussian Softness), lifted / flashed blacks, soft exponential highlight knee, faint warm halation around highlights, slightly reduced saturation and cool video balance');

f = add('Repair');
f('q15_screentools','Screen Smoother / DeArtifact (DFT zMatte)',[S('Tool',['Screen Smoother (even out green/blue screen)','DeArtifact (chroma restore for keying)']),S('Screen colour',['Green','Blue']),P('Radius',2,60,24,1,'px'),P('Strength',0,1,1,.01)],
 [`int m=int(u_p0+.5);vec3 v=O(uv).rgb;
  #define Q15_SK(cc) (u_p1<.5?clamp(((cc).g-max((cc).r,(cc).b))*4.,0.,1.):clamp(((cc).b-max((cc).r,(cc).g))*4.,0.,1.))
  float r=R(m==0?u_p2:u_p2*.25);float st=max(1.,r/20.);vec4 acc=vec4(0.);float cl=luma(v);
  for(int i=-20;i<=20;i++){float x=float(i)*st;if(abs(x)>r)continue;vec3 s=O(uv+vec2(x,0.)*u_px).rgb;float w;if(m==0)w=Q15_SK(s);else{w=exp(-x*x/(2.*r*r*.25))*exp(-pow((luma(s)-cl)*12.,2.));}acc+=vec4(s*w,w);}
  return vec4(acc.rgb/max(acc.a,1e-4),acc.a/(2.*r/st+1.));`,
  `int m=int(u_p0+.5);vec3 v=O(uv).rgb;float r=R(m==0?u_p2:u_p2*.25);float st=max(1.,r/20.);vec4 acc=vec4(0.);float cl=luma(v);
  for(int i=-20;i<=20;i++){float x=float(i)*st;if(abs(x)>r)continue;vec2 q=uv+vec2(0.,x)*u_px;vec4 s=T(q);float w;if(m==0)w=s.a;else{w=exp(-x*x/(2.*r*r*.25))*exp(-pow((luma(O(q).rgb)-cl)*12.,2.));}acc+=vec4(s.rgb*w,w);}
  return vec4(acc.rgb/max(acc.a,1e-4),1.);`,
  `int m=int(u_p0+.5);vec3 v=O(uv).rgb;vec3 lo=T(uv).rgb;
  #define Q15_SK2(cc) (u_p1<.5?clamp(((cc).g-max((cc).r,(cc).b))*4.,0.,1.):clamp(((cc).b-max((cc).r,(cc).g))*4.,0.,1.))
  if(m==0){vec3 gm=vec3(0.);float gw=0.;for(int j=0;j<14;j++)for(int i=0;i<14;i++){vec3 s=O((vec2(float(i),float(j))+.5)/14.).rgb;float w=Q15_SK2(s);gm+=s*w;gw+=w;}gm/=max(gw,1e-4);
   float k=Q15_SK2(v);vec3 cor=v*gm/max(lo,vec3(.02));if(gw<.5)cor=v;return vec4(clamp(mix(v,cor,k*u_p3),0.,1.),1.);}
  float Y=dot(v,vec3(.299,.587,.114));float Yl=dot(lo,vec3(.299,.587,.114));vec3 o=lo+(Y-Yl);return vec4(clamp(mix(v,o,u_p3),0.,1.),1.);`],
 'DFT zMatte helpers (approx.): Screen Smoother evens out unevenly lit green / blue screens - a screen-masked (key-colour dominance) separable average gives the local screen colour, screen pixels are rescaled by global screen mean / local screen colour; DeArtifact restores compressed (4:1:1 / 4:2:0 / DV) chroma before keying - chroma is replaced by a luma-guided (cross-bilateral) separable average while luma is kept');

f = add('Analysis');
f('q15_skfeatures','Multi-block LBP / Haar-like Features / Rank Noise Filter (scikit-image)',[S('Feature',['multiblock_lbp (MB-LBP code)','haar_like_feature type-2-x','haar_like_feature type-2-y','haar_like_feature type-3-x','haar_like_feature type-3-y','haar_like_feature type-4','rank.noise_filter (disk)']),P('Block size / radius',1,8,3,1,'px'),P('Gain',.1,20,4,.1)],
 `${Q15_PIXO}int m=int(u_p0+.5);vec2 p=floor(uv*u_res);int B=int(u_p1+.5);float Bf=float(B);
  #define G8(pp) floor(luma(PXO(pp).rgb)*255.+.5)
  #define BSUM(ox,oy,OUT) {float s_=0.;for(int j_=0;j_<8;j_++){if(j_>=B)break;for(int i_=0;i_<8;i_++){if(i_>=B)break;s_+=G8(p+vec2((ox)+float(i_),-((oy)+float(j_))));}}OUT=s_;}
  if(m==0){vec2 o0=vec2(-floor(1.5*Bf),-floor(1.5*Bf));float s[9];for(int k=0;k<9;k++){float bx=float(k-3*(k/3)),by=float(k/3);float v_;BSUM(o0.x+bx*Bf,o0.y+by*Bf,v_)s[k]=v_;}
   float ce=s[4];float code=(s[0]>=ce?128.:0.)+(s[1]>=ce?64.:0.)+(s[2]>=ce?32.:0.)+(s[5]>=ce?16.:0.)+(s[8]>=ce?8.:0.)+(s[7]>=ce?4.:0.)+(s[6]>=ce?2.:0.)+(s[3]>=ce?1.:0.);return vec4(vec3(code/255.),1.);}
  if(m<=5){float v=0.;float h=floor(Bf*.5);
   if(m==1){float a,b;BSUM(-Bf,-h,a)BSUM(0.,-h,b)v=b-a;}
   else if(m==2){float a,b;BSUM(-h,-Bf,a)BSUM(-h,0.,b)v=b-a;}
   else if(m==3){float a,b,c3;BSUM(-Bf-h,-h,a)BSUM(-h,-h,b)BSUM(Bf-h,-h,c3)v=b-a-c3;}
   else if(m==4){float a,b,c3;BSUM(-h,-Bf-h,a)BSUM(-h,-h,b)BSUM(-h,Bf-h,c3)v=b-a-c3;}
   else{float a,b,c3,d;BSUM(-Bf,-Bf,a)BSUM(0.,-Bf,b)BSUM(0.,0.,c3)BSUM(-Bf,0.,d)v=b+d-a-c3;}
   return vec4(vec3(clamp(.5+v*u_p2/(255.*Bf*Bf*4.),0.,1.)),1.);}
  float g=G8(p);float db=g,da=255.-g;bool same=false;float rr=Bf;
  for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j));if(abs(o.x)>rr||abs(o.y)>rr||dot(o,o)>rr*rr+1e-3||(i==0&&j==0))continue;vec2 q=p+o;if(q.x<0.||q.y<0.||q.x>u_res.x-1.||q.y>u_res.y-1.)continue;float v=G8(q);if(v==g)same=true;else if(v<g)db=min(db,g-v);else da=min(da,v-g);}
  float out_=same?0.:min(db,da);return vec4(vec3(clamp(out_/255.*u_p2,0.,1.)),1.);`,
 'scikit-image: feature.multiblock_lbp (Zhang et al. 2007) evaluated densely - 3x3 grid of BxB block sums around each pixel, bit set when a neighbour block sum >= the centre (TL=128 clockwise to L=1), shown as code/255; feature.haar_like_feature full-window features with blocks BxB centred on the pixel (2-x right-left, 2-y bottom-top, 3-x / 3-y middle-outer, type-4 anti-diagonal minus diagonal; shown 0.5 + Gain x sum / (4 x 255 B^2)); filters.rank.noise_filter on 8-bit luma with a disk footprint of radius B (centre excluded): 0 when a neighbour equals the centre, else the distance to the nearest occupied grey level (x Gain / 255); measured against skimage 0.26 on 8-bit grey input (see note in report)');

f = add('Sharpen');
f('q15_skconv','Fourier Uniform / Ellipsoid / Edge Enhance More (scipy / Pillow)',[S('Filter',['scipy.ndimage.fourier_uniform (periodic box)','scipy.ndimage.fourier_ellipsoid (periodic disk)','PIL ImageFilter.EDGE_ENHANCE_MORE']),P('Size',1,31,9,1,'px'),P('Amount',0,1,1,.01)],
 [`int m=int(u_p0+.5);vec3 c0=O(uv).rgb;vec2 p=floor(uv*u_res);
  #define WRP(pp) O((mod((pp),u_res)+.5)/u_res).rgb
  if(m==2){vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;s+=WRP(p+vec2(float(i),float(j)));}vec3 o=9.*c0-s;bool brd=p.x<1.||p.y<1.||p.x>u_res.x-2.||p.y>u_res.y-2.;if(brd)o=c0;o=floor(clamp(o,0.,1.)*255.+.5)/255.;return vec4(mix(c0,o,u_p2),1.);}
  float sz=R(u_p1);float hr=sz*.5;float st=max(1.,ceil(hr)/15.);vec3 acc=vec3(0.);float ws=0.;
  if(m==0){for(int i=-16;i<=16;i++){float x=float(i)*st;float w=clamp(hr+.5*st-abs(x),0.,st);if(w<=0.)continue;acc+=WRP(p+vec2(x,0.))*w;ws+=w;}return vec4(acc/ws,1.);}
  for(int j=-16;j<=16;j++)for(int i=-16;i<=16;i++){vec2 o=vec2(float(i),float(j))*st;float d=length(o);float w=clamp(hr+.5*st-d,0.,st)/st;if(w<=0.)continue;acc+=WRP(p+o)*w;ws+=w;}return vec4(acc/ws,1.);`,
  `int m=int(u_p0+.5);vec3 c0=O(uv).rgb;if(m==2)return vec4(T(uv).rgb,1.);if(m==1)return vec4(mix(c0,T(uv).rgb,u_p2),1.);vec2 p=floor(uv*u_res);float sz=R(u_p1);float hr=sz*.5;float st=max(1.,ceil(hr)/15.);vec3 acc=vec3(0.);float ws=0.;
  for(int i=-16;i<=16;i++){float x=float(i)*st;float w=clamp(hr+.5*st-abs(x),0.,st);if(w<=0.)continue;acc+=T((mod(p+vec2(0.,x),u_res)+.5)/u_res).rgb*w;ws+=w;}return vec4(mix(c0,acc/ws,u_p2),1.);`],
 'scipy.ndimage.fourier_uniform / fourier_ellipsoid applied as in the usual ifftn(fourier_x(fftn(img), size)) round trip, implemented in the spatial domain: a size-wide box (separable) / a disk of diameter size, both with wrap-around borders (the FFT is periodic) and linear partial-pixel edge weights (approx. for even / fractional sizes); Pillow EDGE_ENHANCE_MORE = 3x3 kernel (-1 x8, centre 9, scale 1), 8-bit rounding, outermost pixel ring left unfiltered as in Pillow');

f = add('Distort');
f('q15_pildeform','ImageOps.deform (Pillow mesh warp)',[S('Deformer',['Wave mesh','Random corner jitter','Swirl mesh']),P('Grid cells',2,32,8,1),P('Amount',0,60,12,.5,'px')],
 `int m=int(u_p0+.5);vec2 px=vec2(uv.x,1.-uv.y)*u_res;float G=floor(u_p1+.5);vec2 cs=u_res/G;vec2 ci=floor(px/cs);vec2 fu=(px-ci*cs)/cs;float A=R(u_p2);
  #define Q15_DEF(vv,OUT) {vec2 v_=(vv)*cs;vec2 d_=vec2(0.);if(m==0)d_=A*vec2(sin(6.2831853*v_.y/(cs.y*4.)),sin(6.2831853*v_.x/(cs.x*4.)));else if(m==1)d_=A*(vec2(hash((vv)+u_seed),hash((vv)+17.3+u_seed))-.5)*2.;else{vec2 q_=v_-u_res*.5;float r_=length(q_)/length(u_res*.5);float a_=A/60.*2.5*(1.-r_)*step(r_,1.);d_=vec2(cos(a_)*q_.x-sin(a_)*q_.y,sin(a_)*q_.x+cos(a_)*q_.y)-q_;}OUT=v_+d_;}
  vec2 nw,sw,se,ne;Q15_DEF(ci,nw)Q15_DEF(ci+vec2(0.,1.),sw)Q15_DEF(ci+vec2(1.,1.),se)Q15_DEF(ci+vec2(1.,0.),ne)
  vec2 sp=nw+(ne-nw)*fu.x+(sw-nw)*fu.y+(se-sw-ne+nw)*fu.x*fu.y;vec2 su=(sp)/u_res;if(su.x<0.||su.y<0.||su.x>1.||su.y>1.)return vec4(0.,0.,0.,1.);return vec4(O(vec2(su.x,1.-su.y)).rgb,1.);`,
 'Pillow ImageOps.deform(image, deformer): the deformer getmesh() returns a G x G grid of target rectangles, each mapped to a source quadrilateral with Image.transform(MESH) - the QUAD transform is the bilinear map x = a0 + a1 u + a2 v + a3 u v of the four source corners (bilinear resampling, outside = black). Deformers here: wave (corner offset = Amount x sin(2 pi y / 4 cells), and the same for x), seeded random corner jitter (+-Amount), swirl about the centre', true);

f('q15_cspdistort','Curved Surface / Convert to Panoramic / Geometric Distortion (Clip Studio)',[S('Filter',['Curved surface - cylinder','Curved surface - sphere','Convert to panoramic','Geometric distortion (corner pin)']),P('Amount',0,1,.85,.01),P('Angle / pan',-90,90,0,1,'deg'),P('Tilt / skew',-1,1,0,.01)],
 `int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 q=(uv-.5)*2.;float am=u_p1;vec2 s=q;
  if(m==0){float th=max(am,.001)*1.5707963*.98;float an=radians(u_p2);mat2 rt=mat2(cos(an),sin(an),-sin(an),cos(an));vec2 w=rt*(q*a);float L_=(abs(cos(an))*a.x+abs(sin(an))*a.y);float xn=w.x/L_;if(abs(xn*sin(th))>1.)return vec4(0.,0.,0.,1.);float ph=asin(clamp(xn*sin(th),-1.,1.));w.x=ph/th*L_;w.y*=1.+u_p3*.3*(1.-cos(ph));s=(transpose(rt)*w)/a;float sh=.75+.25*cos(ph);if(any(greaterThan(abs(s),vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(s*.5+.5).rgb*mix(1.,sh,.6),1.);}
  if(m==1){float th=max(am,.001)*1.5707963*.98;vec2 w=q*a;float Rm=length(a);float rr=length(w)/Rm;if(rr*sin(th)>1.)return vec4(0.,0.,0.,1.);float ph=asin(clamp(rr*sin(th),0.,1.));float rs=ph/th;vec2 ws=rr>1e-5?w/length(w)*rs*Rm:w;s=ws/a;if(any(greaterThan(abs(s),vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(s*.5+.5).rgb*mix(1.,.75+.25*cos(ph),.6),1.);}
  if(m==2){float fov=radians(mix(30.,150.,am));float hf=tan(fov*.5);float lam=q.x*fov*.5+radians(u_p2);float phi=q.y*fov*.5/a.x+u_p3*.6;vec3 d=vec3(cos(phi)*sin(lam),sin(phi),cos(phi)*cos(lam));if(d.z<=.01)return vec4(0.,0.,0.,1.);vec2 pp=d.xy/d.z/hf;s=vec2(pp.x,pp.y*a.x);if(any(greaterThan(abs(s),vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(s*.5+.5).rgb,1.);}
  vec2 c0=vec2(0.,0.)+vec2(am*.35,0.),c1=vec2(1.,0.)-vec2(am*.35,0.),c2=vec2(1.,1.),c3=vec2(0.,1.);float ky=u_p2/90.*.35;c1.y+=ky;c2.y-=ky;float sk=u_p3*.3;c2.x+=sk;c3.x+=sk;
  float sx=c0.x-c1.x+c2.x-c3.x,sy=c0.y-c1.y+c2.y-c3.y;float dx1=c1.x-c2.x,dx2=c3.x-c2.x,dy1=c1.y-c2.y,dy2=c3.y-c2.y;float den=dx1*dy2-dx2*dy1;float g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den;
  mat3 Hm=mat3(c1.x-c0.x+g*c1.x,c1.y-c0.y+g*c1.y,g, c3.x-c0.x+h*c3.x,c3.y-c0.y+h*c3.y,h, c0.x,c0.y,1.);vec3 hp=inverse(Hm)*vec3(uv,1.);vec2 su=hp.xy/hp.z;if(hp.z<=0.||any(lessThan(su,vec2(0.)))||any(greaterThan(su,vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(su).rgb,1.);`,
 'Clip Studio Paint 3 distortion filters (approx.): Curved surface = the picture wrapped on a cylinder (axis rotated by Angle; Tilt adds vertical bulge) or a sphere seen from the front (orthographic, Amount = covered arc up to 90 deg, mild Lambert shading); Convert to panoramic = the image read as a rectilinear photo (horizontal field of view 30-150 deg from Amount) re-projected to an equirectangular / spherical panorama view panned by Angle and tilted by Tilt; Geometric distortion = 4-corner pin (top edge narrowed by Amount, right edge raised / lowered by Angle, bottom skew by Tilt) as an exact projective homography; outside = black');

f = add('Paint');
f('q15_csplinewidth','Adjust Line Width (Clip Studio)',[P('Width change',-6,6,1.5,.25,'px'),S('Lines are',['Dark on light','Light on dark'])],
 `float w=R(abs(u_p0));bool thick=(u_p0>0.)==(u_p1<.5);vec3 best=c.rgb;float bl=luma(best);float st=max(1.,ceil(w)/8.);
  for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j))*st;float d=length(o);if(d>w+.5)continue;float cov=clamp(w+.5-d,0.,1.);vec3 v=O(uv+o*u_px).rgb;float lv=luma(v);
   if(thick){vec3 vv=mix(c.rgb,v,cov);float l2=luma(vv);if(l2<bl){bl=l2;best=vv;}}else{vec3 vv=mix(c.rgb,v,cov);float l2=luma(vv);if(l2>bl){bl=l2;best=vv;}}}
  return vec4(best,1.);`,
 'Clip Studio Paint Filter > Correct line > Adjust line width: the whole line drawing is thickened or thinned by a fixed width - grey / colour morphology with an anti-aliased disk: thicken dark lines = take the darkest (by luma) pixel within the radius, thin = the lightest; "Light on dark" swaps the roles');

f('q15_cspartistic','Artistic (Clip Studio)',[P('Brush size (smoothing)',1,8,4,1,'px'),P('Colour levels',2,24,8,1),P('Line strength',0,1,.7,.01),P('Line threshold',0,1,.35,.01)],
 [`float r=R(u_p0);float st=max(1.,r/6.);vec3 m_[4];vec3 s_[4];for(int k=0;k<4;k++){m_[k]=vec3(0.);s_[k]=vec3(0.);}float n=0.;
  for(int j=0;j<=6;j++)for(int i=0;i<=6;i++){vec2 o=vec2(float(i),float(j))*st;if(o.x>r+.01||o.y>r+.01)continue;n+=1.;
   vec3 a=O(uv+o*u_px).rgb,b=O(uv+vec2(-o.x,o.y)*u_px).rgb,c2=O(uv-o*u_px).rgb,d=O(uv+vec2(o.x,-o.y)*u_px).rgb;m_[0]+=a;s_[0]+=a*a;m_[1]+=b;s_[1]+=b*b;m_[2]+=c2;s_[2]+=c2*c2;m_[3]+=d;s_[3]+=d*d;}
  vec3 best=m_[0]/n;float bv=1e9;for(int k=0;k<4;k++){vec3 mu=m_[k]/n;vec3 va=s_[k]/n-mu*mu;float v=va.r+va.g+va.b;if(v<bv){bv=v;best=mu;}}return vec4(best,1.);`,
  `vec3 v=T(uv).rgb;float lv=u_p1;vec3 hs=rgb2hsv(clamp(v,0.,1.));hs.y=min(hs.y*1.15,1.);v=hsv2rgb(hs);vec3 pz=floor(v*(lv-1.)+.5)/(lv-1.);vec3 o=mix(v,pz,.75);
  float d=R(1.);float gx=luma(T(uv+vec2(d,0.)*u_px).rgb)-luma(T(uv-vec2(d,0.)*u_px).rgb),gy=luma(T(uv+vec2(0.,d)*u_px).rgb)-luma(T(uv-vec2(0.,d)*u_px).rgb);float gm=length(vec2(gx,gy));
  float ln=smoothstep(u_p3*.25,u_p3*.25+.08,gm);o*=1.-ln*u_p2*.85;return vec4(clamp(o,0.,1.),1.);`],
 'Clip Studio Paint Filter > Effect > Artistic (photo to illustration), approx.: colour areas flattened by a 4-sector Kuwahara filter (Brush size), saturation boost and partial posterisation to Colour levels, dark outlines where the gradient of the flattened image exceeds Line threshold');

f = add('Materials');
f('q15_abremoveshading','Remove Shading (AwesomeBump)',[P('Low-frequency radius',5,200,60,1,'px'),P('Low-frequency blending',0,1,1,.01),P('AO cancellation',0,1,.15,.01),P('AO radius',2,40,8,.5,'px')],
 [BH('u_p0'),BV('u_p0'),`vec3 cA=O(uv).rgb;vec3 bl=T(uv).rgb;vec3 avg=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)avg+=O((vec2(float(i),float(j))+.5)/12.).rgb;avg/=144.;
  vec3 fc=cA+(avg-bl);vec3 o=mix(cA,fc,u_p1);float h=luma(cA);float ar=R(u_p3);float occ=0.,ws=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(i==0&&j==0)continue;vec2 of=vec2(float(i),float(j));float w=1./length(of);occ+=max(luma(O(uv+of*ar/3.*u_px).rgb)-h,0.)*w;ws+=w;}
  float ao=clamp(1.-occ/ws*2.,0.,1.);o=o+(1.-ao)*u_p2;return vec4(clamp(o,0.,1.),1.);`],
 'AwesomeBump diffuse "Remove shading": remove-low-frequency filter colour + (image mean - Gaussian blur) blended by LF blending (exact formula of mode_remove_low_freq_filter), then AO cancellation colour + (1 - AO) x amount (mode_ao_cancellation_filter with an opaque AO map); the AO here is a 48-tap height-difference occlusion estimate from luminance-as-height, not AwesomeBump\'s own SSAO pass (approx.)');
