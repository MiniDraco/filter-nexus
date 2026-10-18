/* ================= q16 part 2: libdither halftoning, Boris FX Continuum, Procreate, ENVI SAR filters ================= */
/* libdither (Robert Kist) threshold matrices, copied from dither_ordered_data.h: [width, height, divisor, values row-major] */
const Q16_MATS = [
 [6,6,36,[34,25,21,17,29,33,30,13,9,5,12,24,18,6,1,0,8,20,22,10,2,3,4,16,26,14,7,11,15,28,35,31,19,23,27,32]],
 [6,6,36,[30,22,16,21,33,35,24,11,7,9,26,28,13,5,0,2,14,19,15,3,1,4,12,18,27,8,6,10,25,29,32,20,17,23,31,34]],
 [8,8,1000,[567,635,608,514,424,365,392,486,847,878,910,698,153,122,90,302,820,969,941,667,180,31,59,333,725,788,757,545,275,212,243,455,424,365,392,486,567,635,608,514,153,122,90,302,847,878,910,698,180,31,59,333,820,969,941,667,275,212,243,455,725,788,757,545]],
 [14,14,196,[131,187,8,78,50,18,134,89,155,102,29,95,184,73,22,86,113,171,142,105,34,166,9,60,151,128,40,110,168,137,45,28,64,188,82,54,124,189,80,13,156,56,7,61,186,121,154,6,108,177,24,100,38,176,93,123,83,148,96,17,88,133,44,145,69,161,139,72,30,181,115,27,163,47,178,65,164,14,120,48,5,127,153,52,190,58,126,81,116,21,106,77,173,92,191,63,99,12,76,144,4,185,37,149,192,39,135,23,117,31,170,132,35,172,103,66,129,79,3,97,57,159,70,141,53,94,114,20,49,158,19,146,169,122,183,11,104,180,2,165,152,87,182,118,91,42,67,25,84,147,43,85,125,68,16,136,71,10,193,112,160,138,51,111,162,26,194,46,174,107,41,143,33,74,1,101,195,15,75,140,109,90,32,62,157,98,167,119,179,59,36,130,175,55,0,150]],
 [5,5,4.8,[4,3,0,1,2,0,1,2,4,3,2,4,3,0,1,3,0,1,2,4,1,2,4,3,0]],
 [8,8,8,[3,4,2,7,1,6,0,5,6,0,5,3,4,2,7,1,2,7,1,6,0,5,3,4,5,3,4,2,7,1,6,0,1,6,0,5,3,4,2,7,4,2,7,1,6,0,5,3,0,5,3,4,2,7,1,6,7,1,6,0,5,3,4,2]],
 [10,10,10,[9,8,4,7,3,0,1,5,2,6,5,2,6,9,8,4,7,3,0,1,3,0,1,5,2,6,9,8,4,7,8,4,7,3,0,1,5,2,6,9,2,6,9,8,4,7,3,0,1,5,0,1,5,2,6,9,8,4,7,3,4,7,3,0,1,5,2,6,9,8,6,9,8,4,7,3,0,1,5,2,1,5,2,6,9,8,4,7,3,0,7,3,0,1,5,2,6,9,8,4]],
 [10,5,10,[7,6,2,9,0,1,3,8,5,4,0,1,3,8,5,4,7,6,2,9,5,4,7,6,2,9,0,1,3,8,2,9,0,1,3,8,5,4,7,6,3,8,5,4,7,6,2,9,0,1]],
 [8,8,32,[13,9,5,12,18,22,26,19,6,1,0,8,25,30,31,23,10,2,3,4,21,29,28,27,14,7,11,15,17,24,20,16,18,22,26,19,13,9,5,12,25,30,31,23,6,1,0,8,21,29,28,27,10,2,3,4,17,24,20,16,14,7,11,15]],
 [5,5,26,[1,21,16,15,4,5,17,20,19,14,6,21,25,24,12,7,18,22,23,11,2,8,9,10,3]],
 [6,6,37,[1,5,14,13,12,4,6,22,28,27,21,11,15,29,35,34,26,20,16,30,36,33,25,19,7,23,31,32,24,10,2,8,17,18,9,3]],
 [7,7,50,[3,9,18,28,17,8,2,10,24,33,39,32,23,7,19,34,44,48,43,31,16,25,40,45,49,47,38,27,20,35,41,46,42,29,15,11,21,36,37,28,22,6,4,12,13,26,14,5,1]],
 [4,4,9,[4,2,7,5,3,1,8,6,7,5,4,2,8,6,3,1]],
 [6,6,19,[14,13,10,8,2,3,16,18,12,7,1,4,15,17,11,9,6,5,8,2,3,14,13,10,7,1,4,16,18,12,9,6,5,15,17,11]],
 [8,8,33,[13,7,8,14,17,21,22,18,6,1,3,9,28,31,29,23,5,2,4,10,27,32,30,24,16,12,11,15,20,26,25,19,17,21,22,18,13,7,8,14,28,31,29,23,6,1,3,9,27,32,30,24,5,2,4,10,20,26,25,19,16,12,11,15]],
 [2,2,1,[-1.5,1.5,.5,-.5]],
 [4,4,1,[-7.5,.5,-5.5,2.5,4.5,-3.5,6.5,-1.5,-4.5,3.5,-6.5,1.5,7.5,-.5,5.5,-2.5]]];
const Q16_MATGLSL = (() => { const v = [], hdr = []; for (const [w, h, d, a] of Q16_MATS) { hdr.push(`vec4(${w}.,${h}.,${Number.isInteger(d) ? d + "." : d},${v.length}.)`); for (const x of a) v.push((Number.isInteger(x) ? x + '.' : String(x))); }
  return `const float QM[${v.length}]=float[${v.length}](${v.join(',')});const vec4 QH[${hdr.length}]=vec4[${hdr.length}](${hdr.join(',')});`; })();
/* libdither 3x3 pattern tiles (dither_pattern_data.h) as 9-bit masks, bit k = row*3+col (1 = white) */
const Q16_TILES = (() => { const t = [['000000000','101000101','111101111','000010000','010111010','010101010','000111000','010010010','100000001','001000100','000101000','010000010','111111111'],
  ['111111111','000010000','000011000','010011000','011011000','011011010','011111010','011111110','111111110','000000000'],
  ['111111111','100000000','100000010','100001010','101001010','101101010','101101110','111101110','111111110','000000000']];
  const bits = s => [...s].reduce((a, c, k) => a + (c === '1' ? 1 << k : 0), 0); const all = [], hdr = [];
  for (const set of t) { hdr.push(`ivec2(${all.length},${set.length})`); for (const s of set) all.push(bits(s)); }
  return `const int QT[${all.length}]=int[${all.length}](${all.join(',')});const ivec2 QTH[3]=ivec2[3](${hdr.join(',')});`; })();

f = add('Retro');
f('q16_libdither','libdither Halftoning (grid / ordered matrices / pattern)',[S('Method',['Grid dither','Central white-point ordered','Balanced central white-point ordered','Ulichney clustered-dot ordered','Ulichney void dispersed-dots ordered','Non-rectangular ordered','Variable ordered','Diagonal ordered','ImageMagick circle ordered','ImageMagick 45-degree ordered','Pattern dither (3x3)']),
  P('Variant (grid size / matrix / pattern)',1,4,1,1),P('Pixel size',1,8,1,1,'px'),P('Noise sigma (variable: step)',0,1,0,.01)],
 `${Q16_MATGLSL}${Q16_TILES}int m=int(u_p0+.5);int vr=int(u_p1+.5);float ps=max(floor(R(u_p2)+.5),1.);vec2 Pp=floor(vec2(uv.x,1.-uv.y)*u_res/ps);
 #define Q16LUM(q) dot(mix(O(q).rgb/12.92,pow((O(q).rgb+.055)/1.055,vec3(2.4)),step(vec3(.04045),O(q).rgb)),vec3(.2126,.7152,.0722))
 #define Q16AT(pq) vec2(((pq).x+.5)*ps/u_res.x,1.-((pq).y+.5)*ps/u_res.y)
 float px=Q16LUM(Q16AT(Pp));float outv=0.;
 if(m==0){/* grid_dither: per w x h cell, n = (1-avg)^2 area^2/(area/4) random black pixels (with replacement) */
  float g=float(vr)+3.;vec2 C=floor(Pp/g);vec2 lc=Pp-C*g;float av=0.;for(int j=0;j<6;j++)for(int i=0;i<6;i++){if(float(i)>=g||float(j)>=g)continue;av+=Q16LUM(Q16AT(C*g+vec2(float(i),float(j))));}
  av/=g*g;float n=floor((1.-av)*(1.-av)*g*g*4.);outv=1.;for(int k=0;k<144;k++){if(float(k)>=n)break;vec2 rr=floor(vec2(hash(C*1.731+vec2(float(k)*.37+u_seed*17.,3.1)),hash(C*2.113+vec2(5.7,float(k)*.53+u_seed*29.)))*g);if(rr==lc){outv=0.;break;}}}
 else if(m==10){/* pattern_dither: per 3x3 block pick the tile minimising |mean(cur - t)| + mean|cur - t| */
  int ts=min(vr,3)-1;vec2 Bk=floor(Pp/3.);vec2 lc=Pp-Bk*3.;float cu[9];for(int k=0;k<9;k++)cu[k]=Q16LUM(Q16AT(Bk*3.+vec2(float(k-(k/3)*3),float(k/3))));
  ivec2 th=QTH[ts];float best=1e9;int bt=0;for(int n=0;n<13;n++){if(n>=th.y)break;int tb=QT[th.x+n];float d1=0.,d2=0.;for(int k=0;k<9;k++){float tv=float((tb>>k)&1);d1+=(cu[k]-tv)/9.;d2+=abs(cu[k]-tv)/9.;}float dd=abs(d1)+d2;if(dd<best){best=dd;bt=tb;}}
  int kk=int(lc.y)*3+int(lc.x);outv=float((bt>>kk)&1);}
 else {/* ordered_dither: px + (M/divisor - .5) [+ N(0, sigma)] > .5 -> white */
  int mi=m==1?0:m==2?1:m==3?2:m==4?3:m==5?4+min(vr,4)-1:m==6?(vr<=2?15:16):m==7?8:m==8?9+min(vr,3)-1:12+min(vr,3)-1;vec4 H=QH[mi];
  float mx=mod(Pp.x,H.x),my=mod(Pp.y,H.y);float mv=QM[int(H.w+my*H.x+mx+.5)];float th;
  if(m==6){float full=vr<=2?85.:17.;float stp=u_p3>0.?u_p3*full:.5*full;th=floor(clamp(127.5+stp*mv,0.,255.))/255.-.5;}
  else{th=mv/H.z-.5;if(u_p3>0.){vec2 hq=Pp+u_seed*7.31;float u1=max(hash(hq),1e-6),u2=hash(hq+19.19);px+=u_p3*sqrt(-2.*log(u1))*cos(6.2831853*u2);}}
  outv=px+th>.5?1.:0.;}
 return vec4(vec3(outv),1.);`,
 'libdither (robertkist) mono ditherers, linear-light luminance: grid_dither (cell = Variant+3 px, random placement per cell with a seeded hash instead of rand()), ordered_dither with the library\'s matrices (central / balanced central white-point 6x6, Ulichney clustered-dot 8x8 / void dispersed-dots 14x14, non-rectangular 1-4, variable 2x2 / 4x4 (Variant 1-2 / 3-4, step = slider x full range, half range at 0), diagonal 8x8, ImageMagick circle 5/6/7 and 45-degree 4/6/8 by Variant) and its Gaussian sigma noise; pattern_dither with the 3x3 v1/v2/v3 tile sets (Variant)', true);

f = add('Distort');
f('q16_bccdistort','BCC Wide Angle Lens / Polar Displacement / Vector Displacement',[S('Mode',['Wide Angle Lens (BCC+)','Polar Displacement','Vector Displacement']),
  P('Amount',-1,1,.5,.01),S('Map',['Image (blurred)','Fractal noise']),P('Map softness or field of view',0,1,.5,.01)],
 [`int m=int(u_p0+.5);if(m==0)return vec4(0.);float sc=mix(2.,40.,u_p3);vec3 a=vec3(0.);
  if(u_p2<.5){float w=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float ww=exp(-.25*float(i*i+j*j));a+=O(uv+vec2(float(i),float(j))*R(sc)*.5*u_px).rgb*ww;w+=ww;}a/=w;}
  else{vec2 p=PX(uv)/R(sc*6.);a=vec3(fbm(p+u_seed*13.),fbm(p*1.3+vec2(17.3,4.1)+u_seed*7.),fbm(p*.8+vec2(-9.2,31.7)));}
  return vec4(a,1.);`,
 `int m=int(u_p0+.5);vec2 cI=uv-.5;vec2 ca=cI*vec2(asp(),1.);
  if(m==0){/* rectilinear <-> equidistant fisheye re-projection at the given diagonal FOV; Amount > 0 bends straight lines outward (wide-angle / fisheye look), < 0 straightens a fisheye */
   float fov=radians(mix(60.,170.,u_p3));float rmax=length(vec2(asp(),1.))*.5;float r=length(ca);float am=u_p1;
   float f1=rmax/tan(fov*.5);float f2=rmax/(fov*.5);float rs;
   if(am>=0.){float th=r/f2;rs=mix(r,f1*tan(min(th,1.55)),am);}else{float th=atan(r/f1);rs=mix(r,f2*th,-am);}
   vec2 q=r>1e-6?ca*(rs/r):ca;q/=vec2(asp(),1.);vec2 su=q+.5;if(su.x<0.||su.x>1.||su.y<0.||su.y>1.)return vec4(0.,0.,0.,1.);return vec4(O(su).rgb,1.);}
  vec3 mp=T(uv).rgb;
  if(m==1){/* polar: radius displaced by map luma, angle by a second map channel */
   float lm=dot(mp,vec3(.299,.587,.114))-.5;float m2=(u_p2<.5?(mp.r-mp.b)*.5:mp.g-.5);float r=length(ca),an=atan(ca.y,ca.x);
   r*=1.+u_p1*lm*(u_p2<.5?1.1:.8);an+=u_p1*m2*(u_p2<.5?2.:1.5);vec2 q=vec2(cos(an),sin(an))*r/vec2(asp(),1.);return vec4(O(clamp(q+.5,0.,1.)).rgb,1.);}
  /* vector: red = horizontal, green = vertical displacement, 0.5 = none */
  vec2 d=(mp.rg-.5)*u_p1*.25*vec2(1./asp(),1.);if(u_p2<.5)d=vec2(mp.r-dot(mp,vec3(.333)),mp.g-dot(mp,vec3(.333)))*u_p1*1.6*vec2(1./asp(),1.)+(dot(mp,vec3(.333))-.5)*u_p1*.12;
  return vec4(O(clamp(uv+d,0.,1.)).rgb,1.);`],
 'Boris FX Continuum look approximations: BCC+ Wide Angle Lens = rectilinear <-> equidistant fisheye re-projection at the chosen field of view (Map softness slider = FOV 60-170 deg); BCC Polar Displacement = radial (map luma) + angular (second map channel) offset about the centre; BCC Vector Displacement = red -> x, green -> y offset. Without a second layer the map is the blurred image itself (chroma-differenced) or seeded fractal noise (approx.)', true);

f = add('Render');
f('q16_bccgen','BCC Mixed Colors / Organic Strands / Pin Art 3D',[S('Mode',['Mixed Colors','Organic Strands','Pin Art 3D']),P('Scale',4,80,16,1,'px'),P('Amount',0,1,.6,.01),P('Detail or light angle',0,1,.5,.01)],
 `int m=int(u_p0+.5);vec3 cI=O(uv).rgb;float sc=R(u_p1);vec2 p=PX(uv);
  if(m==0){/* Mixed Colors: domain-warped fbm drives a smooth multi-hue colour field (4 hues around the detail hue), composited soft-light / mix */
   vec2 q=p/(sc*8.);vec2 w=vec2(fbm(q+u_seed*11.),fbm(q+vec2(5.2,1.3)-u_seed*7.));vec2 w2=vec2(fbm(q+3.*w+vec2(1.7,9.2)),fbm(q+3.*w+vec2(8.3,2.8)));float t=fbm(q+3.*w2);
   vec3 col=hsv2rgb(vec3(fract(u_p3+t*1.6+w.x*.5),.75,.95));col=mix(col,hsv2rgb(vec3(fract(u_p3+.5+w2.y),.8,.9)),smoothstep(.3,.7,w2.x));
   vec3 sl=mix(2.*cI*col+cI*cI*(1.-2.*col),sqrt(cI)*(2.*col-1.)+2.*cI*(1.-col),step(.5,col));return vec4(mix(cI,mix(sl,col,.35),u_p2),1.);}
  if(m==1){/* Organic Strands: iso-lines of a warped noise field drawn as thin glowing fibres, tinted by the image */
   vec2 q=p/(sc*6.);vec2 w=vec2(fbm(q*.7+u_seed*5.),fbm(q*.7+vec2(3.1,7.7)));float fld=fbm(q+2.2*w)*mix(4.,14.,u_p3);float f1=abs(fract(fld)-.5);float gw=fwidth(fld);
   float ln=smoothstep(gw*1.5,0.,f1-.02)+.35*exp(-f1*f1/(.02+gw*gw*4.));float f2=abs(fract(fld*2.7+w.x*3.)-.5);ln+=.4*smoothstep(gw*3.,0.,f2-.01);
   vec3 tint=mix(vec3(1.),normalize(cI+.05)*1.6,.6);return vec4(mix(cI*(1.-.35*u_p2),cI,1.-u_p2)+tint*ln*u_p2*.6,1.);}
  /* Pin Art 3D: square grid of pins, height = cell luma x Amount, seen obliquely from the front; heads shaded by a light at the chosen angle, nearer pins occlude farther ones */
  vec2 cell=vec2(sc);vec2 g=floor(p/cell);float hmax=u_p2*sc*4.;vec3 bg=vec3(.07);vec3 res=bg*(.6+.4*(1.-uv.y));float la=u_p3*6.2831853;vec3 L=normalize(vec3(cos(la),sin(la),1.2));
  for(int k=0;k<=12;k++){float fk=float(k);vec2 gc=vec2(g.x,g.y-fk);vec2 base=(gc+.5)*cell;vec2 bu=fromPX(base);vec3 cc=O(clamp(bu,0.,1.)).rgb;float hh=dot(cc,vec3(.299,.587,.114))*hmax;
   vec2 head=base+vec2(0.,hh*.55);float rad=sc*.42;vec2 d=p-head;
   if(abs(d.x)<rad*.28&&p.y>base.y&&p.y<head.y){float sh=.45+.4*(1.-abs(d.x)/(rad*.28));res=cc*.35*sh+vec3(.05);}
   if(dot(d,d)<rad*rad){vec2 nd=d/rad;vec3 N=vec3(nd,sqrt(max(1.-dot(nd,nd),0.)));float df=max(dot(N,L),0.);float spv=pow(max(dot(reflect(-L,N),vec3(0.,0.,1.)),0.),24.);res=cc*(.25+.85*df)+spv*.35;}}
  return vec4(res,1.);`,
 'Boris FX Continuum generator look approximations: Mixed Colors (domain-warped fractal colour field blended soft-light over the image), Organic Strands (fibres along iso-lines of warped noise, image-tinted, additive), Pin Art 3D (pinscreen of image-luma-height pins in an oblique view, Lambert + specular heads, front pins occlude back ones); single frame, seeded by Variation', true);

f = add('Blur');
f('q16_perspblur','Perspective Blur (Procreate)',[S('Mode',['Positional','Directional']),P('Amount',0,1,.35,.01),P('Position X (or direction)',0,1,.5,.01),P('Position Y (or direction)',0,1,.5,.01)],
 `int m=int(u_p0+.5);vec2 ctr=vec2(u_p2,u_p3);vec2 d=(uv-ctr)*vec2(asp(),1.);float dist=length(d);vec3 a=vec3(0.);float w=0.;
  vec2 dir;float len;
  if(m==0){dir=-(uv-ctr);len=u_p1*.35;}else{vec2 dv=(ctr-.5)*vec2(asp(),1.);dv=length(dv)<.02?vec2(1.,0.):normalize(dv);dir=dv/vec2(asp(),1.);len=u_p1*.25*(.15+dist);}
  for(int i=0;i<48;i++){float t=(float(i)+hash(PX(uv)+float(i))*.999)/48.;float tt=m==0?t:t-.5;vec2 q=uv+dir*len*tt;float ww=1.-.5*t;a+=O(clamp(q,0.,1.)).rgb*ww;w+=ww;}
  return vec4(a/w,1.);`,
 'Procreate Adjustments > Perspective Blur: Positional = blur radiating from the puck (zoom blur whose streak length grows with distance from it); Directional = linear streaks along the puck direction (puck offset from the centre gives the angle), stronger away from the puck. 48 jittered taps (approx.)');

f = add('Retro');
f('q16_procglitch','Glitch (Procreate: Artifact / Wave / Signal / Diverge)',[S('Mode',['Artifact','Wave','Signal','Diverge']),P('Amount',0,1,.5,.01),P('Block size',2,80,18,1,'px'),P('Zoom',.25,4,1,.01)],
 `int m=int(u_p0+.5);float am=u_p1;float bs=R(u_p2)*u_p3;vec2 p=PX(uv);float sd=u_seed*13.17;vec3 cI=O(uv).rgb;
  if(m==0){/* Artifact: rectangular shards (random-size blocks) displaced horizontally, some duplicated with a hue-shifted copy, block-wise posterise */
   vec2 bsz=vec2(bs*mix(1.,6.,hash(vec2(floor(p.y/bs),sd))),bs);vec2 b=floor(p/bsz);float h1=hash(b+sd),h2=hash(b+sd+7.7);vec3 o=cI;
   if(h1<am*.75){vec2 sh=vec2((h2-.5)*bsz.x*3.,(hash(b+3.3+sd)-.5)*bs*.5)*am;vec2 q=fromPX(p+sh);o=O(clamp(q,0.,1.)).rgb;if(h2>.7)o=o.gbr;if(h2<.15)o=floor(o*4.)/4.;}
   return vec4(o,1.);}
  if(m==1){/* Wave: stepped rows displaced by a sum of sines (row height = block size), RGB channels offset in opposite phases */
   float row=floor(p.y/bs);float ph=row*.61+sd;float off=(sin(ph)+.5*sin(ph*2.3+1.7)+.25*sin(ph*5.1))*am*bs*1.6*u_p3;float co=am*bs*.25;
   vec3 o=vec3(O(clamp(fromPX(p+vec2(off+co,0.)),0.,1.)).r,O(clamp(fromPX(p+vec2(off,0.)),0.,1.)).g,O(clamp(fromPX(p+vec2(off-co,0.)),0.,1.)).b);return vec4(o,1.);}
  if(m==2){/* Signal: horizontal interference bands - line tearing, colour noise bars, channel-separated bright stripes */
   float band=floor(p.y/(bs*.5));float hb=hash(vec2(band,sd));float on=step(1.-am*.7,hb);float tear=on*(hash(vec2(band,sd+2.))-.5)*bs*4.*am;
   vec3 o=O(clamp(fromPX(p+vec2(tear,0.)),0.,1.)).rgb;float ln=floor(p.y/max(u_p3,.25));float nz=hash(vec2(floor(p.x/(2.*u_p3)),ln+sd));
   o=mix(o,vec3(nz,hash(vec2(nz,ln)),hash(vec2(ln,nz)))*(.6+.4*o),on*.35*am);float ch=hash(vec2(band,sd+5.));if(on>0.){if(ch<.33)o.r=min(1.,o.r*1.6);else if(ch<.66)o.g=min(1.,o.g*1.6);else o.b=min(1.,o.b*1.6);}
   o*=1.-.15*am*step(.5,fract(p.y/2.));return vec4(o,1.);}
  /* Diverge: R and B pulled apart radially from the centre (green fixed), offset growing with distance, plus block-wise jitter */
  vec2 d=uv-.5;float j=(hash(floor(p/bs)+sd)-.5)*.3;vec2 off=d*am*.08*u_p3*(1.+j);
  return vec4(O(clamp(uv+off,0.,1.)).r,cI.g,O(clamp(uv-off,0.,1.)).b,1.);`,
 'Procreate Adjustments > Glitch look approximations (single frame, seeded by Variation): Artifact (displaced / duplicated / hue-swapped rectangular shards), Wave (stepped sine row displacement with RGB phase split), Signal (tearing bands, colour-noise bars, channel-boosted stripes), Diverge (red and blue pulled apart from the centre); Block size and Zoom as in Procreate', true);

f = add('Repair');
f('q16_envifilter','Local Sigma / Bit Error (ENVI) and Pixel Fixer (BCC)',[S('Method',['Local Sigma (ENVI)','Bit Error (ENVI)','Pixel Fixer (BCC)']),P('Window radius',1,7,2,1,'px'),P('Sigma factor or threshold',.5,5,2,.05),S('Output',['Filtered','Changed-pixel mask'])],
 `int m=int(u_p0+.5);int rr=int(u_p1+.5);float k=u_p2;vec3 cI=O(uv).rgb;vec3 res=cI;
  if(m<2){vec3 s1=vec3(0.),s2=vec3(0.);float n=0.;
   for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>rr||abs(j)>rr)continue;if(m==1&&i==0&&j==0)continue;vec3 v=O(uv+vec2(float(i),float(j))*u_px).rgb;s1+=v;s2+=v*v;n+=1.;}
   vec3 mu=s1/n;vec3 sg=sqrt(max(s2/n-mu*mu,0.));vec3 lo=(m==0?cI:mu)-k*sg,hi=(m==0?cI:mu)+k*sg;vec3 a=vec3(0.),cnt=vec3(0.);
   for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(i)>rr||abs(j)>rr)continue;if(m==1&&i==0&&j==0)continue;vec3 v=O(uv+vec2(float(i),float(j))*u_px).rgb;vec3 ok=step(lo,v)*step(v,hi);a+=v*ok;cnt+=ok;}
   vec3 vm=mix(mu,a/max(cnt,vec3(1.)),step(vec3(.5),cnt));
   if(m==0)res=vm;else{vec3 bad=step(k*sg+.02,abs(cI-mu));res=mix(cI,vm,bad);}}
  else{/* Pixel Fixer: a pixel outside the 8-neighbour range by more than threshold x (neighbour spread + 1/64) is replaced by the neighbour mean */
   vec3 mn=vec3(1e3),mx=vec3(-1e3),sm=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;vec3 v=O(uv+vec2(float(i),float(j))*u_px).rgb;mn=min(mn,v);mx=max(mx,v);sm+=v;}
   float tol=k*.04;float b=max(max(cI.r-mx.r,cI.g-mx.g),max(cI.b-mx.b,max(max(mn.r-cI.r,mn.g-cI.g),mn.b-cI.b)));float sp=max(max(mx.r-mn.r,mx.g-mn.g),mx.b-mn.b);
   if(b>tol+sp*.5)res=sm/8.;}
  if(u_p3>.5)return vec4(vec3(step(.004,length(res-cI))),1.);return vec4(res,1.);`,
 'ENVI adaptive filters per band: Local Sigma (Lee 1983 local-sigma: mean of the window pixels within +- k local standard deviations of the centre); Bit Error (spikes deviating from the window mean, centre excluded, by more than k sigma are replaced by the mean of the valid in-range pixels; approx. of ENVI\'s implementation); BCC Pixel Fixer automatic mode (approx.: isolated dead / hot / stuck pixels outside their 8-neighbour range replaced by the neighbour mean)');
