/* ================= q51c: Filter Forge library 5 pattern textures (round 18) - approx. procedural re-creations ================= */
// pointy-top hex lattice (apothem .5, centre spacing 1): q = offset from the nearest centre, id = that centre
const Q51_HEX = (p, q, id) => `vec2 ${q},${id};{vec2 hs_=vec2(1.,1.7320508),a_=mod(${p},hs_)-hs_*.5,b_=mod(${p}-hs_*.5,hs_)-hs_*.5;${q}=dot(a_,a_)<dot(b_,b_)?a_:b_;${id}=${p}-${q};}`;

f = add('Render');
f('q51_ff_arabesque','Arabesque Pattern (Filter Forge)',[P('Scale',1,16,4,.1),P('Band width',.01,.08,.035,.001),P('Petal radius',.15,.45,.3,.005),S('Colours',['Gold on teal','Ivory on terracotta','Blue on white','Over image'])],
  `vec2 p=(uv-.5)*vec2(asp(),1.)*u_p0;vec2 q=fract(p)-.5,aq=abs(q);float w=u_p1,aa=fwidth(p.x)*1.5;
 float d[3];d[0]=abs(length(q)-u_p2);d[1]=abs(length(aq-.5)-(.5-u_p2*.5));d[2]=abs(length(aq-vec2(.5,0.))-.5)*1.;d[2]=min(d[2],abs(length(aq-vec2(0.,.5))-.5));
 int m=int(u_p3+.5);vec3 bg=m==0?vec3(.03,.22,.24):m==1?vec3(.55,.22,.12):m==2?vec3(.96,.95,.9):c.rgb*.55,bd=m==0?vec3(.9,.72,.3):m==1?vec3(.96,.9,.76):m==2?vec3(.1,.25,.65):vec3(.95,.85,.55),ln=vec3(.05,.04,.03);
 vec3 col=bg*(.85+.15*smoothstep(.0,.5,length(q)));bool o=mod(floor(p.x*2.)+floor(p.y*2.),2.)<.5;
 for(int k=0;k<3;k++){int j=k==0?2:(o?(k==1?0:1):(k==1?1:0));float dd=d[j];float sh=1.-smoothstep(w+aa*.5,w+aa*.5+.03,dd);col*=1.-.35*sh;
  float b=1.-smoothstep(w,w+aa,dd);float ol=1.-smoothstep(w-.01-aa,w-.01,dd);vec3 bc=bd*(.75+.25*cos(dd/w*1.5));col=mix(col,ln,b);col=mix(col,bc,ol);}
 return vec4(col,1.);`,
  'approx. of the Filter Forge "Arabesque" texture family: interlaced curvilinear ribbons on a square lattice (centre circles, corner quarter-circles and overlapping unit circles forming petals), outlined bands with alternating over/under order per half-cell, drop shadow');

f('q51_ff_celtic','Celtic Knots (Filter Forge)',[P('Scale',2,30,8,.1),P('Band width',.1,.45,.3,.005),P('Rotation',0,90,45,1,'deg'),S('Colours',['Green and gold','Black and white','Bronze','Over image'])],
  `vec2 p=rot((uv-.5)*vec2(asp(),1.),radians(u_p2))*u_p0;vec2 g=p+.5;float w=u_p1*.5,aa=fwidth(p.x)*1.2;
 float du=abs(fract(g.x)-.5),dv=abs(fract(g.y)-.5);vec2 ij=floor(g);
 vec2 e=vec2(p.x+p.y,p.x-p.y)*.70710678;vec2 eg=e+.5;float a1=abs(fract(eg.x)-.5),a2=abs(fract(eg.y)-.5);vec2 kc=floor(eg);
 bool top1=mod(kc.x+kc.y,2.)<.5;int m=int(u_p3+.5);
 vec3 bg=m==0?vec3(.08,.2,.1):m==1?vec3(1.):m==2?vec3(.15,.1,.06):c.rgb*.5,bc=m==0?vec3(.86,.68,.25):m==1?vec3(0.):m==2?vec3(.72,.45,.2):vec3(.95,.9,.7),ol=m==1?vec3(1.):vec3(.04,.03,.02);
 float i1=1.-smoothstep(w-aa,w,a1),i2=1.-smoothstep(w-aa,w,a2);vec3 col=bg;
 float dTop=top1?a1:a2,dBot=top1?a2:a1,iT=top1?i1:i2,iB=top1?i2:i1;
 vec3 cB=mix(ol,bc*(.65+.35*cos(dBot/w*1.57)),1.-smoothstep(w*.78-aa,w*.78,dBot));col=mix(col,cB,iB);
 col*=1.-.45*iB*(1.-smoothstep(w,w+.12,dTop))*(1.-iT);
 vec3 cT=mix(ol,bc*(.65+.35*cos(dTop/w*1.57)),1.-smoothstep(w*.78-aa,w*.78,dTop));col=mix(col,cT,iT);return vec4(col,1.);`,
  'approx. of the Filter Forge Celtic Knots texture: plaitwork (the base Celtic knot grid) - two families of diagonal ribbons crossing with strictly alternating over/under (checkerboard parity of the crossing), outlined bands with rounded shading and a shadow cast by the upper strand; no knot breaks');

f('q51_ff_islamic','Islamic Geometric Tiling 8/12-fold (Filter Forge)',[S('Symmetry',['8-fold (square)','12-fold (hexagonal)']),P('Scale',1,20,5,.1),P('Contact angle',15,85,67.5,.5,'deg'),P('Line width',.005,.08,.03,.001)],
  `vec2 p=(uv-.5)*vec2(asp(),1.)*u_p1;bool hx=u_p0>.5;vec2 q;if(hx){${Q51_HEX('p', 'h', 'hid')}q=h;}else q=fract(p+.5)-.5;
 float sec=hx?1.0471976:1.5707963,ph=mod(atan(q.y,q.x),sec);if(ph>sec*.5)ph=sec-ph;vec2 r=length(q)*vec2(cos(ph),sin(ph));
 float th=radians(u_p2);vec2 M=vec2(.5,0.),dr=vec2(-sin(th),cos(th));float tn=tan(sec*.5);float tl=.5*tn/(cos(th)+sin(th)*tn);
 vec2 rm=r-M;float t=clamp(dot(rm,dr),0.,tl);float d=length(rm-dr*t);float sd=dr.x*rm.y-dr.y*rm.x;
 float aa=fwidth(p.x)*1.2,w=u_p3;bool star=sd>0.;
 vec3 col=star?vec3(.08,.18,.48):vec3(.9,.86,.74);col*=.9+.1*smoothstep(0.,.5,length(q));
 col=mix(col,vec3(.03,.03,.05),1.-smoothstep(w,w+aa,d));col=mix(col,vec3(.92,.74,.32),1.-smoothstep(w*.55,w*.55+aa,d));return vec4(col,1.);`,
  'approx. of the Filter Forge Islamic tiling generator: Hankin polygons-in-contact method - from every edge midpoint of a square (8-fold) or hexagonal (12-fold) cell two rays at the contact angle meet on the symmetry axes, giving the classic star-and-cross / 12-point star networks; lapis star fills, cream background, gold strapwork with dark outline');

f('q51_ff_quasicrystal','Quasicrystal Pattern (Filter Forge)',[P('Symmetry',3,15,7,1),P('Scale',5,200,90,.5),P('Phase',0,6.2832,0,.01),S('Colouring',['Grey waves','Wrapped stripes','Inferno ramp','Over image'])],
  `vec2 p=(uv-.5)*vec2(asp(),1.)*u_p1;float n=floor(u_p0+.5),v=0.;for(int k=0;k<15;k++){float fk=float(k);if(fk>=n)break;float a=3.14159265*fk/n;v+=.5+.5*cos(dot(p,vec2(cos(a),sin(a)))+u_p2);}
 int m=int(u_p3+.5);float g=v/n;float wv=abs(mod(v,2.)-1.);vec3 col=m==0?vec3(g):m==1?vec3(1.-wv):m==2?ramp(1,wv):c.rgb*(.35+.9*(1.-wv));return vec4(col,1.);`,
  'Quasicrystal: superposition of N plane waves at angles k*pi/N (N-fold quasi-periodic symmetry); grey = mean, stripes / ramp = sum wrapped with a triangle fold (the classic quasicrystal rendering)');

f('q51_ff_galaxy','Spiral Galaxy Generator (Filter Forge)',[P('Arms',1,6,2,1),P('Twist',.5,8,3,.05),P('Tilt',0,.85,.35,.01),P('Size',.15,1,.5,.01)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);p=rot(p,.4+u_seed*.37);p.y/=1.-u_p2;float r=length(p)/u_p3,a=atan(p.y,p.x);vec2 so=vec2(u_seed*13.1,u_seed*7.7);
 float wn=fbm(p*9./u_p3+so)-.5,arm=pow(.5+.5*cos(u_p0*(a-u_p1*log(r+.02))+wn*2.5),3.);float disk=exp(-r*3.2);float dust=pow(.5+.5*cos(u_p0*(a-u_p1*log(r+.02))+.9+wn*3.),12.)*smoothstep(.05,.3,r);
 float neb=fbm(p*22./u_p3+so*2.);vec3 col=vec3(.55,.65,1.)*arm*disk*(.6+.8*neb)*1.7+vec3(1.,.82,.55)*exp(-r*r*55.)*1.3+vec3(1.,.9,.75)*disk*.25;
 col*=1.-.65*dust*disk*2.;vec2 sc=uv*u_res/u_k;float st=hash(floor(sc)+so);col+=vec3(.9,.92,1.)*step(.995,st)*pow(fract(st*97.),3.)*1.5;
 col+=vec3(1.,.55,.7)*pow(max(neb-.55,0.)*2.,2.)*arm*disk*.8;return vec4(col,1.);`,
  'approx. of the Filter Forge spiral galaxy generator: logarithmic-spiral arm density (Arms, Twist) with fbm turbulence, exponential disk, bright bulge, dust lanes trailing the arms, pink HII knots, tilt = disk inclination squash, seeded star field',true);

f('q51_ff_tumbling','Escher Cube Tumbling Blocks (Filter Forge)',[P('Size',2,40,9,.1),P('Rotation',0,360,0,1,'deg'),P('Shade contrast',0,1,.6,.01),S('Colours',['Classic grey','Escher brown','Pastel','From image'])],
  `vec2 p=rot((uv-.5)*vec2(asp(),1.),radians(u_p1))*u_p0;${Q51_HEX('p', 'h', 'hid')}float an=degrees(atan(h.y,h.x));int fc=(an>30.&&an<150.)?0:(an>=150.||an<-90.)?1:2;
 int m=int(u_p3+.5);vec3 c0,c1,c2;if(m==0){c0=vec3(.92);c1=vec3(.6);c2=vec3(.3);}else if(m==1){c0=vec3(.93,.84,.66);c1=vec3(.62,.42,.24);c2=vec3(.3,.18,.1);}else if(m==2){c0=vec3(.98,.86,.9);c1=vec3(.65,.85,.95);c2=vec3(.75,.7,.95);}
 else{vec3 im=O(rot(hid/u_p0,-radians(u_p1))/vec2(asp(),1.)+.5).rgb;c0=min(im*1.3+.1,1.);c1=im*.8;c2=im*.45;}
 vec3 mid=(c0+c1+c2)/3.,fcol=fc==0?c0:fc==1?c1:c2;vec3 col=mid+(fcol-mid)*u_p2/.6;
 vec2 hq=abs(h);float de=.5-max(hq.x,dot(hq,vec2(.5,.8660254)));
 float r1=dot(h,vec2(.8660254,.5))>0.?abs(dot(h,vec2(-.5,.8660254))):1e3,r2=dot(h,vec2(-.8660254,.5))>0.?abs(dot(h,vec2(.5,.8660254))):1e3,r3=h.y<0.?abs(h.x):1e3;
 float aa=fwidth(p.x)*1.2;col*=1.-.75*(1.-smoothstep(0.,.012+aa,min(de,min(r1,min(r2,r3)))));return vec4(clamp(col,0.,1.),1.);`,
  'approx. of the Filter Forge Escher Cube / tumbling-blocks texture: hexagonal lattice, each hexagon split from its centre into three rhombi (top / left / right faces) shaded light, mid, dark to read as stacked cubes, dark edge lines; From image samples one colour per cube');

f('q51_ff_aztec','Inca and Aztec Designs (Filter Forge)',[S('Design',['Stepped diamonds','Step fret','Chakana cross','Zigzag bands']),P('Tile size',16,200,64,1,'px'),S('Palette',['Terracotta','Turquoise and gold','Black and cream'])],
  `vec2 px=PX(uv);vec2 tc=px/u_p1;vec2 ti=floor(tc),f=fract(tc);float N=12.;vec2 g=floor(f*N);int m=int(u_p0+.5);float v=0.;
 if(m==0){vec2 d=abs(g-5.5);float md=floor(d.x+d.y);v=mod(floor(md/2.)+mod(ti.x+ti.y,2.),4.);}
 else if(m==1){vec2 q=mod(ti.x+ti.y,2.)<.5?g:vec2(N-1.-g.x,g.y);float ring=max(abs(q.x-5.5),abs(q.y-5.5));float rk=floor(ring);
  bool on=mod(rk,2.)<.5&&rk<5.;if(q.y>=5.&&q.y<6.&&q.x>=6.&&rk<5.)on=!on;v=on?1.:(q.x+q.y<N-1.?0.:2.);}
 else if(m==2){vec2 d=abs(g-5.5);bool cr=(d.x<1.5&&d.y<5.5)||(d.x<3.5&&d.y<3.5)||(d.x<5.5&&d.y<1.5);bool hole=length(d)<1.6;v=cr?(hole?0.:1.+mod(ti.x+ti.y,2.)):(max(d.x,d.y)>4.5&&min(d.x,d.y)>3.5?3.:0.);}
 else{float zz=abs(mod(g.x+ti.x*N,8.)-4.);float row=g.y+ti.y*N;float b=floor((row+zz)/3.);v=mod(b,4.);}
 int pl=int(u_p2+.5);vec3 c0,c1,c2,c3;if(pl==0){c0=vec3(.86,.75,.58);c1=vec3(.62,.24,.12);c2=vec3(.12,.08,.06);c3=vec3(.85,.55,.2);}
 else if(pl==1){c0=vec3(.93,.88,.74);c1=vec3(.1,.55,.55);c2=vec3(.85,.65,.15);c3=vec3(.55,.12,.1);}else{c0=vec3(.92,.88,.78);c1=vec3(.08);c2=vec3(.55,.2,.1);c3=vec3(.5);}
 int vi=int(v+.5);vec3 col=vi==0?c0:vi==1?c1:vi==2?c2:c3;vec2 e=abs(fract(f*N)-.5);col*=.94+.06*smoothstep(.5,.35,max(e.x,e.y));return vec4(col,1.);`,
  'approx. of the Filter Forge Inca/Aztec design textures: 12x12 pixel-grid motifs tiled - concentric stepped diamonds, step-fret (xicalcoliuhqui-like square spiral with stair background), chakana (Inca stepped cross with central hole), stepped zigzag bands; terracotta / turquoise-gold / black-cream palettes, faint woven cell texture');

f('q51_ff_tribal','Tribal Tattoo Patterns (Filter Forge)',[P('Scale',.5,8,2.5,.05),P('Thickness',.1,1,.5,.01),S('Symmetry',['Mirror','None']),S('Background',['White','Skin','Over image'])],
  `vec2 p=(uv-.5)*vec2(asp(),1.);if(u_p2<.5)p.x=abs(p.x);p*=u_p0;vec2 so=vec2(u_seed*5.3,u_seed*2.9);vec2 w=vec2(fbm(p*.7+so),fbm(p*.7+so+4.1))-.5;vec2 q=p+w*1.6;
 float r=length(q-vec2(.6,.2)),a=atan(q.y-.2,q.x-.6);float f1=sin(a*2.+log(r+.05)*4.+fbm(q+so)*3.);float f2=sin(q.x*1.7-q.y*2.3+fbm(q*1.3+so.yx)*4.);
 float rid=max(1.-abs(f1),1.-abs(f2)*1.1);float tp=fbm(q*1.1+so*1.7);float th=1.-u_p1*.6*(.15+1.1*smoothstep(.3,.7,tp));
 float aa=fwidth(rid)*1.2+.002;float ink=smoothstep(th-aa,th+aa,rid);
 vec3 bg=u_p3<.5?vec3(.97,.96,.93):u_p3<1.5?vec3(.86,.66,.53):c.rgb;vec3 ic=u_p3<1.5?vec3(.04):mix(c.rgb,vec3(.03,.05,.12),.88);return vec4(mix(bg,ic,ink),1.);`,
  'approx. of the Filter Forge tribal tattoo pattern: two domain-warped flowing stroke fields (log-spiral swirl + diagonal waves), ridge thresholded with a noise-modulated width so strokes taper into sharp points, optional mirror symmetry, black ink on paper / skin / image',true);

f('q51_ff_barber','Barber Pole / Candy-Cane Coil (Filter Forge)',[P('Stripes',1,12,3,1),P('Twist',.2,4,1.2,.01),P('Pole width',.1,1,.35,.01),S('Style',['Barber pole','Candy cane','Full-frame coil'])],
  `int m=int(u_p3+.5);float W=m==2?1.:u_p2;float x=(uv.x-.5)*asp()/(W*.5*(m==2?asp():1.));if(abs(x)>1.)return vec4(c.rgb*.35,1.);
 float an=asin(clamp(x,-1.,1.));float s=(an/3.14159265*.5+uv.y*u_p1/W*.5)*u_p0;float fs=fract(s);float aa=fwidth(s)*1.2;
 vec3 col;if(m==1){col=mix(vec3(.95,.95,.92),vec3(.85,.05,.1),smoothstep(.5-aa,.5+aa,fs)*smoothstep(1.-aa,.97-aa,fs));col=mix(col,vec3(.2,.6,.25),(1.-smoothstep(.06,.06+aa,abs(fs-.25)))*.9);}
 else{float k=fs*3.;col=k<1.?vec3(.85,.08,.1):k<2.?vec3(.97):vec3(.1,.2,.7);}
 float nz=sqrt(max(1.-x*x,0.));float lam=.35+.65*nz;float spec=pow(max(1.-abs(x+.35)*2.2,0.),6.)*.6;col=col*lam+spec;return vec4(col,1.);`,
  'approx. of the Filter Forge barber-pole / candy-cane texture: helical stripes on a cylinder (stripe phase = asin(x)/2pi + height x twist, so stripes curve over the round surface), Lambert shading and a specular streak; barber red/white/blue, candy cane red/white with a green pinstripe, or a full-frame coil; outside the pole the image is darkened');
