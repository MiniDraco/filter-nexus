/* ================= q22: Houdini Copernicus COP nodes (grunge generators, patterns, hyperbolic tile, planar inflate, height to caustics, edge detect by normal, illegal pixel, surface dither) ================= */
const Q22_OUT3 = `float vv=clamp(v,0.,1.);int om=int(u_p3+.5);if(om==0)return vec4(vec3(vv),1.);
 if(om==1)return vec4(c.rgb*mix(vec3(1.),vec3(vv),.85),1.);
 vec3 ov=mix(2.*c.rgb*vv,1.-2.*(1.-c.rgb)*(1.-vv),step(.5,c.rgb));return vec4(mix(c.rgb,ov,.85),1.);`;
f = add('Render');
f('q22_cop_grunge','Copernicus Grunge Generators (Bark Strips / Birch Bark / Galvanized Steel / Leaking Streaks / Mold Spots / Wipe Trails)',[S('Pattern',['Bark Strips','Birch Bark','Galvanized Steel','Leaking Streaks','Mold Spots','Wipe Trails']),P('Element size',10,600,140,1,'px'),P('Mask contrast',.2,4,1,.05),S('Output',['Grunge mask','Multiply over image','Overlay on image'])],
  `int m=int(u_p0+.5);vec2 p=PX(uv)/u_p1+fract(u_seed*.01371)*97.;
 vec2 sc=m==0?vec2(4.,.7):m==1?vec2(1.5,2.5):m==2?vec2(1.4):m==3?vec2(1.):m==4?vec2(1.6):vec2(.9);
 vec2 wq=p+(vec2(fbm(p*1.7),fbm(p*1.7+5.2))-.5)*(m==2?.7:m==5?.5:.3);
 vec2 q=wq*sc;vec2 ip=floor(q);float f1=9.,f2=9.,bl=0.,rg=0.;vec2 cid=vec2(0.),cl=vec2(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 sp=cc+hash2(cc)*.9+.05;vec2 dv=q-sp;float d=length(dv);
  if(d<f1){f2=f1;f1=d;cid=cc;cl=dv;}else if(d<f2)f2=d;
  float h=hash(cc+3.1);float rad=.12+.3*h*h;bl=max(bl,1.-smoothstep(rad*.4,rad*1.7,d+(vnoise(q*4.+cc*7.)-.5)*.3));
  float R0=.3+.55*hash(cc+7.7);float an=atan(dv.y,dv.x);float arc=smoothstep(.3,.6,vnoise(vec2(an*2.2+h*20.,d*2.)));
  rg=max(rg,(1.-smoothstep(.03,.09,abs(d-R0)))*arc*step(.3,hash(cc+9.3)));}
 float v;
 if(m==0){float w=wq.x*3.+(fbm(vec2(wq.x*1.5,wq.y*.25))-.5)*2.;float sf=fract(w);float prof=1.-pow(abs(2.*sf-1.),2.5);
  prof=clamp(prof-(fbm(wq*vec2(5.,1.2))-.45)*.9,0.,1.);
  float g=abs(fract(wq.y*2.5+fbm(wq*vec2(3.,.8))*2.)-.5);float cut=(1.-smoothstep(.02,.08,g))*step(.5,vnoise(wq*vec2(2.,5.)));
  v=prof*(1.-.75*cut)*(.7+.3*smoothstep(0.,.35,f2-f1));}
 else if(m==1){float pch=1.-smoothstep(.3,.4,fbm(wq*1.1+3.));vec2 lq=wq*vec2(1.,7.);float row=floor(lq.y);float fx=fract(lq.x*.6+hash(vec2(row,1.)));
  float len=.12+.3*hash(vec2(row,2.));float lent=(1.-smoothstep(.06,.16,abs(fract(lq.y)-.5)))*(1.-smoothstep(len-.03,len,fx))*step(.35,hash(vec2(row,5.)));
  float cr=1.-smoothstep(0.,.03,abs(fbm(vec2(wq.x*2.5,wq.y*.35))-.5));
  v=.9-.5*pch*(.6+.4*fbm(wq*6.))-.7*lent-.45*cr*step(.45,vnoise(wq*vec2(.5,2.)))-.1*smoothstep(.25,.0,f2-f1);}
 else if(m==2){float h=hash(cid);float a=hash(cid+5.)*6.2832;v=.3+.45*h+dot(cl,vec2(cos(a),sin(a)))*.35+(fbm(q*9.)-.5)*.15-.18*(1.-smoothstep(0.,.05,f2-f1));}
 else if(m==3){float xx=p.x*9.+(fbm(vec2(p.x*3.,p.y*.6))-.5)*1.2;float ci=floor(xx);float fx=fract(xx)-.5;
  float y0=hash(vec2(ci,3.))*4.;float len=.6+2.5*hash(vec2(ci,4.));float wd=.15+.3*hash(vec2(ci,5.));float tt=mod(y0-p.y,4.);
  float st=exp(-tt/len)*(1.-smoothstep(wd*.5,wd,abs(fx)*(1.+tt*.3)))*(.5+.5*hash(vec2(ci,6.)));
  float bg=.3*smoothstep(.45,.75,fbm(vec2(p.x*.7,p.y*3.)+fbm(p*2.)));v=max(st,bg)+.35*smoothstep(.55,.8,st)*step(.5,vnoise(p*vec2(8.,2.)));}
 else if(m==4){float fz=.6+.4*fbm(p*6.);v=max(bl*fz,max(smoothstep(.62,.74,vnoise(p*3.+11.))*.8,smoothstep(.64,.72,vnoise(p*7.+23.))*.6)*fz);}
 else{float bgr=1.-smoothstep(.03,.1,abs(fract(length(fract(wq*.45)-.5)*2.6+hash(floor(wq*.45))*3.)-.5));v=max(rg,.4*bgr*smoothstep(.4,.6,vnoise(wq*1.3)));}
 v=clamp((v-.5)*u_p2+.5,0.,1.);
 ${Q22_OUT3}`,
  'Houdini Copernicus grunge generators (look approx. of the layered-noise nodes from the SideFX docs): Bark Strips = inflated vertical strips with edge breakup + horizontal cuts (secondary) + elongated vertical cells (tertiary swirls); Birch Bark = cellular base patches + horizontal lenticel dashes + vertical cracks; Galvanized Steel = distorted Worley spangle crystals, each with its own grey level and an oriented in-cell gradient; Leaking Streaks = vertically distorted streaks fading downwards + background horizontal folds + tertiary highlights; Mold Spots = three spot layers (primary Worley blobs, secondary / tertiary noise spots) with fuzzy spread; Wipe Trails = broken circular wipe rings (foreground) over fainter background rings. Mask contrast as in the node (around 0.5); seeded', true);

f('q22_cop_patterns','Copernicus Patterns (Bubble Noise / Chladni / Cell Pattern / Tile Pattern)',[S('Pattern',['Bubble Noise','Chladni nodal lines','Chladni absolute value','Cell Pattern grid','Cell Pattern hexagonal','Tile Pattern stretcher bond','Tile Pattern herringbone','Tile Pattern basketweave']),P('Element size',10,600,120,1,'px'),P('Shape',0,1,.5,.01),S('Output',['Pattern','Multiply over image','Overlay on image'])],
  `int m=int(u_p0+.5);vec2 p=PX(uv)/u_p1;float sh=u_p2;vec2 sd=fract(u_seed*vec2(.0131,.0173))*91.;float v=0.;
 if(m==0){float a=.5,tot=0.;vec2 q=p+sd;for(int o=0;o<5;o++){vec2 w=vec2(vnoise(q*.5+3.1),vnoise(q*.5+7.7))-.5;float n=vnoise(q+w*(.5+3.*sh));v+=a*(1.-abs(2.*n-1.));tot+=a;q=q*2.02+11.3;a*=.55;}v=pow(v/tot,1.6)*1.3;}
 else if(m<=2){float n=3.,mm=n*pow(2.,.2+sh*1.4);vec2 x=p*.5;
  float z=cos(n*PI*x.x)*cos(mm*PI*x.y)-cos(mm*PI*x.x)*cos(n*PI*x.y);
  v=m==1?1.-smoothstep(.04,.14,abs(z)):abs(z)*.5;}
 else if(m<=4){vec2 q=p+sd;float f1=9.,f2=9.;vec2 id=vec2(0.);bool hx=m==4;float ry=hx?.8660254:1.;float jy=floor(q.y/ry);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float rr=jy+float(j);float sx=hx?.5*mod(rr,2.):0.;vec2 cc=vec2(floor(q.x-sx)+float(i),rr);vec2 sp=vec2(cc.x+sx,cc.y*ry)+.5*vec2(1.,ry)+(hash2(cc)-.5)*.6;
   float d=length(q-sp);if(d<f1){f2=f1;f1=d;id=cc;}else if(d<f2)f2=d;}
  float b=.5*(f2-f1);float gap=.03;float bev=.02+.35*sh;v=smoothstep(gap,gap+bev,b)*(.65+.35*hash(id+.5));}
 else{vec2 id;float e;
  if(m==5){float row=floor(p.y);float bx=(p.x+.5*mod(row,2.))*.5;e=min(min(fract(bx),1.-fract(bx))*2.,min(fract(p.y),1.-fract(p.y)));id=vec2(floor(bx),row);}
  else if(m==6){float i0=floor(p.x),j0=floor(p.y);float d=mod(i0-j0,4.);vec2 fq=fract(p);
   if(d<1.5){float lx=fq.x+(d>.5?1.:0.);e=min(min(lx,2.-lx),min(fq.y,1.-fq.y));id=vec2(i0-d,j0);}
   else{float ly=fq.y+(d<2.5?1.:0.);e=min(min(fq.x,1.-fq.x),min(ly,2.-ly));id=vec2(i0,j0-(d<2.5?1.:0.))+.37;}}
  else{vec2 B=floor(p*.5);vec2 l=fract(p*.5)*2.;if(mod(B.x+B.y,2.)>.5)l=l.yx;e=min(min(l.x,2.-l.x),min(fract(l.y),1.-fract(l.y)));id=B*2.+vec2(0.,floor(l.y))+.1*mod(B.x+B.y,2.);}
  float ins=.02+.2*sh;v=smoothstep(ins,ins+.03,e)*(.6+.4*hash(id+sd));}
 ${Q22_OUT3}`,
  'Houdini Copernicus generators: Bubble Noise = fractal octaves of folded noise, each octave domain-warped (Shape = Distortion) which compresses / expands it into bubbles; Chladni Cymatic Patterns = interference of two waves with swapped frequencies, z = cos(n pi x)cos(m pi y) - cos(m pi x)cos(n pi y) with non-integer m = n*2^anisotropy (Shape), output Nodal Lines or Absolute Value; Cell Pattern = Worley cells on a grid or hexagonal lattice with gap, bevel (Shape) and random height; Tile Pattern = stretcher (running) bond, herringbone 2:1 and basketweave layouts with Inset (Shape) and per-tile value variation. approx. of the node parameter sets; seeded', true);

f = add('Distort');
f('q22_cop_hyptile','Hyperbolic Tile (Copernicus)',[P('Polygon sides',3,12,6,1),P('Polygons per vertex',3,12,4,1),S('Output',['Image in tiles','Checker tiles','Tile id colours','Image with tile edges']),S('Rectanglize',['Poincare disk','Elliptic grid','Squircle (FG)'])],
  `float pp=floor(u_p0+.5),qq=floor(u_p1+.5);if(1./pp+1./qq>=.499)qq=floor(2.*pp/(pp-2.))+1.;
 float a=PI/pp,b=PI/qq;float den=sqrt(cos(b)*cos(b)-sin(a)*sin(a));float rr=sin(a)/den,cx=cos(b)/den;
 int rm=int(u_p3+.5);vec2 z;
 if(rm==0){z=(uv-.5)*2.*vec2(max(asp(),1.),max(1./asp(),1.));float l2=dot(z,z);if(l2>1.)z/=l2;}
 else{vec2 s=clamp((uv-.5)*2.,-1.,1.);if(rm==1)z=vec2(s.x*sqrt(1.-s.y*s.y*.5),s.y*sqrt(1.-s.x*s.x*.5));else{float r2=dot(s,s);z=r2>1e-6?s*sqrt(max(r2-s.x*s.x*s.y*s.y,0.)/r2):s;}}
 z*=.9995;float idv=0.;int inv=0;float d2=9.;
 for(int it=0;it<60;it++){float an=atan(z.y,z.x);float k=floor(an/(2.*a)+.5);float ca=k*2.*a;vec2 cc=cx*vec2(cos(ca),sin(ca));vec2 d=z-cc;d2=dot(d,d);if(d2>=rr*rr)break;z=cc+d*rr*rr/d2;inv++;idv=fract(idv*3.71+(mod(k,pp)+1.)*.1173);}
 int om=int(u_p2+.5);float hs=(cx-rr)*.85;vec2 tq=.5+z/(2.*hs);tq=1.-abs(1.-mod(tq,2.));
 float an=atan(z.y,z.x);float k=floor(an/(2.*a)+.5);float ca=k*2.*a;float de=length(z-cx*vec2(cos(ca),sin(ca)))-rr;float ln=1.-smoothstep(.004,.02,de);
 if(om==0)return O(tq);
 if(om==1)return vec4(vec3(mod(float(inv),2.)<.5?.85:.18),1.);
 if(om==2)return vec4(hsv2rgb(vec3(hash(vec2(idv,float(inv))),.55,.9))*(1.-.6*ln),1.);
 return vec4(O(tq).rgb*(1.-.85*ln),1.);`,
  'Houdini Copernicus Hyperbolic Tile: regular hyperbolic {p,q} tiling of the Poincare disk; points are folded into the central polygon by repeated inversion in the polygon edge circles (circle centre c = cos(pi/q)/D, radius r = sin(pi/p)/D, D = sqrt(cos^2(pi/q) - sin^2(pi/p)), orthogonal to the unit circle), so copies are reflected and inverted toward the boundary; outside the disk the pattern is mirrored by inversion. Rectanglize maps the square image onto the disk (elliptic grid or FG-squircle). The polygon-per-vertex count replaces the node Size / Flattening controls (it fixes the polygon size); uv = image fitted in the polygon (mirror-repeated near the corners)');

f = add('Materials');
const Q22_INFL = s => `float s=${s}.;vec2 o=u_px*s;float mg=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mg+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb)/64.;float inr=step(u_p0,luma(O(uv).rgb));if(mg>u_p0)inr=1.-inr;float md=min(u_res.x,u_res.y);
 float h=inr*(.25*(T(uv+vec2(o.x,0.)).r+T(uv-vec2(o.x,0.)).r+T(uv+vec2(0.,o.y)).r+T(uv-vec2(0.,o.y)).r)+s*s/(md*md));return vec4(h,0.,0.,1.);`;
f('q22_cop_inflate','Planar Inflate (Copernicus)',[P('Threshold',0,1,.5,.01),P('Height scale',.2,8,2,.05),P('Mounds noise',0,1,0,.01),S('Output',['Height','Shaded over image','Normal map'])],
  [`return vec4(0.,0.,0.,1.);`].concat([32,32,32,16,16,16,8,8,8,4,4,4,2,2,2,1,1,1,1].map(Q22_INFL)).concat([
  `float md=min(u_res.x,u_res.y);vec2 e=u_px;float mg=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mg+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb)/64.;float inr=step(u_p0,luma(O(uv).rgb));if(mg>u_p0)inr=1.-inr;
 float mn=u_p2*.35*(fbm(PX(uv)/40.)-.45);
 #define Q22H(q) (sqrt(max(T(q).r,0.))*u_p1*1.5*(1.+mn))
 float h=Q22H(uv);float hx=(Q22H(uv+vec2(e.x,0.))-Q22H(uv-vec2(e.x,0.)))*.5,hy=(Q22H(uv+vec2(0.,e.y))-Q22H(uv-vec2(0.,e.y)))*.5;
 vec3 n=normalize(vec3(-hx*md*.05,-hy*md*.05,1.));int om=int(u_p3+.5);
 if(om==0)return vec4(vec3(clamp(h,0.,1.)),1.);
 if(om==2)return vec4(n*.5+.5,1.);
 float lam=clamp(dot(n,normalize(vec3(-.5,.6,.8))),0.,1.);float sp=pow(max(dot(reflect(-normalize(vec3(-.5,.6,.8)),n),vec3(0.,0.,1.)),0.),30.);
 vec3 sh=mix(O(uv).rgb,vec3(.75),.5)*(.25+.85*lam)/(.25+.85*.8)+.35*sp*inr;return vec4(clamp(mix(O(uv).rgb,sh,inr>.5?1.:0.),0.,1.),1.);`]),
  'Houdini Copernicus Planar Inflate: the region (pixels on the minority side of Threshold, i.e. light shapes on dark or dark shapes on light; the node uses an SDF) is inflated by solving the Poisson equation lap(h) = -f inside, h = 0 outside, with Jacobi iterations on a coarse-to-fine stride ladder (32 > 16 > 8 > 4 > 2 > 1 px, 19 sweeps), a round pillow profile; output height = sqrt-shaped solution x Height scale (approx. of the node Pre Scale / Height Scale), optional fractal Mounds noise, shaded (Lambert + specular) or tangent normal map');

f('q22_cop_caustics','Height to Caustics (Copernicus)',[P('Ground depth',0,60,18,.5,'px'),P('Index of refraction',1,2.5,1.33,.01),P('Light altitude',30,90,90,1,'deg'),S('Output',['Caustics (mono)','Caustics over image','Dispersion RGB'])],
  [`vec2 e=u_px*1.5;float gx=(blurL(uv+vec2(e.x,0.),1.)-blurL(uv-vec2(e.x,0.),1.))/3.,gy=(blurL(uv+vec2(0.,e.y),1.)-blurL(uv-vec2(0.,e.y),1.))/3.;
 float hs=60.;vec3 N=normalize(vec3(-gx*hs,-gy*hs,1.));float al=radians(u_p2);vec3 I=-normalize(vec3(cos(al)*.7071,cos(al)*.7071,sin(al)));
 vec3 Tr=refract(I,N,1./u_p1);vec3 T0=refract(I,vec3(0.,0.,1.),1./u_p1);vec2 off=(Tr.xy/max(-Tr.z,.05)-T0.xy/max(-T0.z,.05))*R(u_p0);
 off=clamp(off,-11.,11.);return vec4(.5+off/24.,0.,1.);`,
  `int om=int(u_p3+.5);float ior=u_p1;float kb=(1.-1./(ior+.03))/(1.-1./ior+1e-4),kr=(1.-1./(ior-.03))/(1.-1./ior+1e-4);if(om<2){kb=1.;kr=1.;}
 vec3 acc=vec3(0.);float w0=0.;float sg=.9;
 for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){vec2 dq=vec2(float(i),float(j));vec2 off=(T(uv+dq*u_px).rg-.5)*24.;
  vec2 tg=dq+off,tr=dq+off*kr,tb=dq+off*kb;acc+=vec3(exp(-dot(tr,tr)/(2.*sg*sg)),exp(-dot(tg,tg)/(2.*sg*sg)),exp(-dot(tb,tb)/(2.*sg*sg)));w0+=exp(-dot(dq,dq)/(2.*sg*sg));}
 vec3 ca=acc/w0;if(om==0)return vec4(vec3(clamp(ca.g*.5,0.,1.)),1.);
 if(om==1)return vec4(clamp(O(uv).rgb*(.35+.65*ca.g),0.,1.),1.);return vec4(clamp(ca*.5,0.,1.),1.);`],
  'Houdini Copernicus Height to Caustics, approx.: luma = refractive height; per pixel the light ray (directional, azimuth 45 deg, altitude as set) is refracted through the surface normal (Snell, IOR, default 1.33 water) and travels Ground depth to a flat ground plane; photons are gathered back with a small Gaussian splat (25x25 window, displacement capped at 11 px) and normalised so a flat surface = 1 (shown as mid-grey); dispersion = per-channel IOR +/- 0.03 (Perturbation method)');

f = add('Edges');
f('q22_cop_edgenormal','Edge Detect by Normal (Copernicus)',[P('Thickness',1,12,3,.5,'px'),P('Normal tolerance',.5,.999,.95,.001),S('Input is',['Height (luma)','Normal map (RGB)']),P('Edge spread',.2,3,1,.05)],
  `float r=R(u_p0);bool nm=u_p2>.5;vec2 e=u_px*max(1.,r*.35);
 #define Q22N(q) (nm?normalize(O(q).rgb*2.-1.):normalize(vec3(-(luma(O((q)+vec2(e.x,0.)).rgb)-luma(O((q)-vec2(e.x,0.)).rgb))*4.,-(luma(O((q)+vec2(0.,e.y)).rgb)-luma(O((q)-vec2(0.,e.y)).rgb))*4.,1.)))
 vec3 n0=Q22N(uv);float acc=0.,ws=0.;float sg=max(r*u_p3*.6,.5);float st=r/6.;
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j))*st;float dd=dot(d,d);if(dd>r*r+.01||dd<.01)continue;float w=exp(-dd/(2.*sg*sg));
  acc+=w*step(dot(n0,Q22N(uv+d*u_px)),u_p1);ws+=w;}
 return vec4(vec3(clamp(acc/max(ws,1e-4)*2.5,0.,1.)),1.);`,
  'Houdini Copernicus Edge Detect by Normal: crease lines of variable width; each neighbour within the Thickness radius whose normal has dot(n, n_neighbour) below Normal tolerance votes for an edge, Gaussian-weighted (Edge spread scales the sigma); normals read from a tangent normal map or derived from luma as height (approx.: plain neighbour comparison instead of the node ray differentials)');

f = add('Repair');
f('q22_cop_illpixel','Illegal Pixel (Copernicus)',[S('Detect',['NaN and infinite values','Greater than','Less than','Greater or equal','Less or equal','Equal']),P('Compare value',0,1,.95,.005),S('Illegal pixels',['Fix by blending surrounding pixels','Fix by zeroing','Show with highlight','Show by isolating']),S('Test',['Each component','Luma'])],
  `int dm=int(u_p0+.5);float cv=u_p1;bool lu=u_p3>.5;
 #define Q22BAD(v) (dm==0?(isnan(v)||isinf(v)):dm==1?(v)>cv:dm==2?(v)<cv:dm==3?(v)>=cv:dm==4?(v)<=cv:abs((v)-cv)<.5/255.)
 #define Q22BV(col) (lu?vec3(Q22BAD(luma(col))?1.:0.):vec3(Q22BAD((col).r)?1.:0.,Q22BAD((col).g)?1.:0.,Q22BAD((col).b)?1.:0.))
 vec3 x=c.rgb;vec3 bm=Q22BV(x);bool bad=max(bm.r,max(bm.g,bm.b))>.5;int om=int(u_p2+.5);
 if(om==2)return vec4(bad?vec3(1.,0.,1.):x,1.);if(om==3)return vec4(bad?vec3(1.,0.,1.):vec3(0.),1.);
 if(!bad)return c;if(om==1)return vec4(0.,0.,0.,1.);
 vec3 o=x;vec3 need=bm;
 for(int rr=1;rr<=6;rr++){if(max(need.r,max(need.g,need.b))<.5)break;vec3 s=vec3(0.),n=vec3(0.);
  for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){if(max(abs(i),abs(j))!=rr)continue;vec3 v=T(uv+vec2(float(i),float(j))*u_px).rgb;vec3 g=1.-Q22BV(v);s+=v*g;n+=g;}
  vec3 hv=step(.5,n);o=mix(o,s/max(n,vec3(1.)),need*hv);need*=1.-hv;}
 return vec4(o,1.);`,
  'Houdini Copernicus Illegal Pixel: finds NaN / Inf (float images; never present in 8-bit input) or values matching a Custom rule against Compare value, per component or on luma; fixes by blending the legal neighbours (nearest square ring with a legal value, up to 6 px, only the bad components replaced), zeroes the whole pixel, highlights in magenta, or isolates (bad = magenta, good = black)');

f = add('Stylize');
f('q22_cop_surfdither','Surface Dither (Copernicus)',[P('Density scale',4,80,12,.5,'px'),P('Pattern rotate',0,90,45,1,'deg'),P('Iso offset',-.5,.5,0,.01),S('Output type',['Mask','SDF','Mask over image'])],
  `float cs=u_p0;float a=radians(u_p1);vec2 q=rot(PX(uv),a)/cs;vec2 cell=floor(q)+.5;vec2 fq=q-cell;
 float best=1e9;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=cell+vec2(float(i),float(j));float dk=1.-luma(O(fromPX(rot(cc*cs,-a))).rgb);float rad=sqrt(clamp(dk,0.,1.))*.7071;float sd=length(q-cc)-rad;best=min(best,sd);}
 int om=int(u_p3+.5);float sdf=best-u_p2;float aa=.7/cs;float mk=smoothstep(-aa,aa,sdf);
 if(om==1)return vec4(vec3(clamp(.5+sdf,0.,1.)),1.);if(om==2)return vec4(c.rgb*mix(.12,1.,mk),1.);return vec4(vec3(mk),1.);`,
  'Houdini Copernicus Surface Dither (2-D image case, UV = image coordinates, dotscale = darkness): round halftone dots on a rotated grid built as a signed distance field (min over the 3x3 neighbouring dots, radius sqrt(darkness) x 0.707 cell) and output raw (SDF, 0.5 = edge, in cell units) or converted to a black / white mask at Iso offset with a 1 px smooth; single texture level (no level transitions)');
