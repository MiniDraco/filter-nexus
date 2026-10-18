/* ================= q44b: Logik Matchbook (Flame Matchbox) shaders, round 18 - generators and overlays ================= */
// raymarch shell: needs a macro Q44DE(POS,OUTD) defined before; MAXT far limit, it/u_* used by the DE
const Q44_MARCH = (ro, rd, eps, steps, maxt) => `float t=0.;int hit=0;int ns=0;for(int i=0;i<${steps};i++){vec3 pp=${ro}+${rd}*t;float dd;Q44DE(pp,dd)if(dd<${eps}*max(t,1.)){hit=1;break;}t+=dd*.9;ns=i;if(t>${maxt})break;}
 vec3 nrm=vec3(0.);if(hit==1){vec3 ps=${ro}+${rd}*t;for(int k=0;k<4;k++){vec3 e=vec3(((k+1)&2)==2?1.:-1.,(k&1)==1?1.:-1.,(k==1||k==2)?1.:-1.)*.5773*${eps}*max(t,1.);float dd;Q44DE(ps+e,dd)nrm+=e*dd;}nrm=normalize(nrm);}`;

f = add('Render');
f('q44_cameraflash','Camera Flashes (Matchbox crok_cameraflash)',[P('Density',0,1,.5,.01),P('Size',2,80,24,1,'px'),P('Flickering',0,1,.5,.01),P('Seed',0,100,1,1)],
  `vec2 p=PX(uv);float sz=u_p1;float cell=sz*5.;vec2 ci=floor(p/cell);vec3 acc=vec3(0.);float sd=floor(u_p3+.5);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=ci+vec2(float(i),float(j));if(hash(id+sd*7.31)>u_p0)continue;vec2 ce=(id+.2+.6*hash2(id+sd*3.7+1.))*cell;
  float br=mix(1.,hash(id+sd+9.),u_p2);float s=sz*(.5+.8*hash(id+sd+4.));vec2 d=p-ce;float r=length(d);
  float ray=exp(-abs(d.y)/(s*.05))*exp(-abs(d.x)/(s*2.))+exp(-abs(d.x)/(s*.05))*exp(-abs(d.y)/(s*2.));acc+=vec3(1.,.97,.92)*br*(exp(-r*r/(s*s*.08))+.6*exp(-r/(s*.7))+.6*ray);}
 return vec4(1.-(1.-O(uv).rgb)*exp(-acc),1.);`,
  'approx. from the crok_cameraflash description (Ivar Beer, after glsl sandbox 15514): random photo-camera flashes - each grid cell flashes with probability Density at a random spot, flash = hot core + exponential halo + short cross streaks, brightness randomised by Flickering, Seed reshuffles; screened over the image');
f('q44_fireflies','Fireflies (Matchbox MM_Fireflies)',[P('Count',5,200,60,1),P('Glow size',2,40,10,.5,'px'),P('Time',0,20,3,.05),P('Seed',0,100,1,1)],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);float tm=u_p2;vec3 acc=vec3(0.);int n=int(u_p0+.5);float sd=floor(u_p3+.5);
 for(int i=0;i<200;i++){if(i>=n)break;float fi=float(i)+sd*211.;vec2 h=hash2(vec2(fi,1.7)),h2=hash2(vec2(fi,5.3));
  vec2 pos=(.06+.88*h)*W+vec2(sin(tm*(.3+.4*h2.x)+h2.y*6.28),cos(tm*(.25+.35*h2.y)+h.x*6.28))*W.y*.04;float z=.5+hash(vec2(fi,8.1));
  float cy=tm*(.15+.2*h2.x)+h.y;float ph=fract(cy);float on=step(.45,hash(vec2(fi,floor(cy)+3.)));float fl=(ph<.08?ph/.08:pow(max(1.-(ph-.08)/.6,0.),2.5))*on;
  float gs=u_p1*z;float r=length(p-pos);acc+=vec3(.75,1.,.35)*fl*(exp(-r*r/(gs*gs*.05))*1.2+exp(-r/gs)*.35);}
 return vec4(1.-exp(-acc*1.5),1.);`,
  'approx. from the MM_Fireflies description (Marcus M.): Count fireflies at random spots drifting on slow sinusoids, each with an asymmetric flash (fast linear rise, slow power decay) that fires only in some cycles (intermittent bursts), random depth scaling the glow; core + halo glow on black for Screen/Add compositing. Time = frame position');
f('q44_hud','Sci-fi HUD Overlay (Matchbox BB_FutureHUD / BB_RetroHUD)',[S('Style',['Future (holographic)','Retro (CRT)']),P('Opacity',0,1,.85,.01),P('Scale',.5,2,1,.01),P('Time',0,10,0,.05)],
  `vec2 W=u_res/u_k;vec2 p=(PX(uv)-W*.5)/(W.y*.5*u_p2);float tm=u_p3;bool rt=u_p0>.5;float mk=0.;float r=length(p),a=atan(p.y,p.x);float ax=asp()/u_p2;
 for(int i=0;i<4;i++){float fi=float(i);float rr=.25+fi*.13;float sg=fract(a/6.28318*(3.+fi*2.)+tm*(.1+.07*fi)*(mod(fi,2.)*2.-1.));mk+=step(.3,sg)*smoothstep(.006+.004*fi,0.,abs(r-rr))*(.6+.4*fract(fi*.37+.2));}
 mk+=step(.85,fract(a/6.28318*72.))*step(abs(r-.84),.03)*.8+smoothstep(.004,0.,abs(r-.88))*.5;
 mk+=smoothstep(.004,0.,abs(p.x))*step(abs(p.y),.12)*step(.04,abs(p.y))+smoothstep(.004,0.,abs(p.y))*step(abs(p.x),.12)*step(.04,abs(p.x));
 vec2 sb=vec2(abs(p.x)-(ax-.3),p.y+tm*.2*sign(p.x));if(abs(sb.x)<.12&&abs(p.y)<.6){vec2 id=floor(sb/.045);vec2 fq=fract(sb/.045);mk+=step(.45,hash(id+vec2(sign(p.x),0.)))*step(abs(fq.x-.5),.32)*step(abs(fq.y-.5),.32)*.8;}
 if(abs(p.x)<.5&&p.y<-.72&&p.y>-.95){float id=floor((p.x+.5)/.03);float h=.04+.18*(.5+.5*sin(id*.7+tm*3.))*(.5+.5*hash(vec2(id,1.)));mk+=step(abs(fract((p.x+.5)/.03)-.5),.32)*step(p.y,-.95+h)*.9;}
 vec2 bq=vec2(ax-.08,.92)-abs(p);if(bq.x>0.&&bq.y>0.&&min(bq.x,bq.y)<.006&&max(bq.x,bq.y)<.15)mk+=1.;
 mk+=.18*smoothstep(.012,0.,length(fract(p/.08+vec2(tm*.05,0.))-.5)*.08);
 vec3 col=rt?vec3(.35,1.,.45):vec3(.3,.85,1.);if(rt)mk*=.7+.3*sin(PX(uv).y*3.14159);mk=clamp(mk,0.,1.)*u_p1;
 return vec4(screen(O(uv).rgb*(rt?.8:.9),col*mk),1.);`,
  'approx. from the BB_FutureHUD / BB_RetroHUD READMEs (BayleyBY, CC BY-SA 4.0): procedural HUD elements - segmented concentric rings rotating with Time, tick ring, crosshair, scrolling block strips at both sides, bouncing waveform bars, corner brackets and a drifting dot grid; Future = cyan holographic, Retro = green CRT with scanlines; screened over the image');

f = add('Materials');
f('q44_molten','Molten Metal (Matchbox L_Molten)',[S('Source',['Image luma','Procedural']),P('Scale',.5,10,3,.1),P('Heat',0,1.5,.75,.01),P('Crust',0,1,.5,.01)],
  `vec2 p=PX(uv)/(u_res.y/u_k)*u_p1;float src=u_p0<.5?luma(O(uv).rgb):fbm(p*1.5+fbm(p*.7)*1.5);float n=fbm(p*2.+vec2(3.1,7.7));float crack=1.-smoothstep(0.,.06+.04*(1.-u_p3),abs(n-.5));
 float crust=smoothstep(.35,.75,fbm(p*3.3+11.))*u_p3;float h=clamp(src*u_p2*1.1+crack*.55-crust*.6,0.,1.);
 vec3 col=stops5(vec3(.02,.01,.01),vec3(.35,.03,0.),vec3(.85,.22,.02),vec3(1.,.6,.1),vec3(1.,.95,.75),h);col+=(fbm(p*12.)-.5)*.08*(1.-h);return vec4(col,1.);`,
  'approx. from the L_Molten description ("molten metal texture gradient"): the heat value (image luma or domain-warped fbm) plus glowing fbm vein cracks minus a dark cooled crust is mapped through a black - deep red - orange - yellow - white-hot gradient');

f = add('Render');
f('q44_symbols','Ancient Symbols (Matchbox crok_ancient_symbols)',[P('Grid size',8,96,28,1,'px'),P('Stroke',.5,4,1.6,.1,'px'),P('Density',.1,1,.55,.01),S('Look',['Gold on dark','Ink on paper','Carved stone'])],
  `vec2 p=PX(uv);float gs=u_p0;vec2 id=floor(p/gs);vec2 fc=(fract(p/gs)-.5)*1.3;float dm=1e5;
 for(int e=0;e<20;e++){vec2 a,b;if(e<6){a=vec2(float(e%2),float(e/2));b=a+vec2(1.,0.);}else if(e<12){int k=e-6;a=vec2(float(k/2),float(k%2));b=a+vec2(0.,1.);}
  else{int k=e-12;int sq=k/2;vec2 o=vec2(float(sq%2),float(sq/2));if(k%2==0){a=o;b=o+1.;}else{a=o+vec2(1.,0.);b=o+vec2(0.,1.);}}
  if(hash(id+vec2(float(e)*1.37,float(e)*.71))>u_p2*(e<12?.62:.3))continue;a=(a-1.)*.4;b=(b-1.)*.4;vec2 pa=fc-a,ba=b-a;dm=min(dm,length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.)));}
 if(hash(id+4.4)<.3)dm=min(dm,abs(length(fc)-.2));if(hash(id+8.8)<.35)dm=min(dm,length(fc-vec2(.4*(floor(hash(id+2.2)*3.)-1.),.4))-.03);
 float hw=u_p1/gs*.65,aa=1.3/gs;float mk=smoothstep(hw+aa,hw-aa,dm);float nz=fbm(p*.05);int lk=int(u_p3+.5);vec3 bg,ink;
 if(lk==0){bg=vec3(.12,.09,.06)*(.7+.6*nz);ink=vec3(.95,.75,.3)*(.85+.3*nz);}else if(lk==1){bg=vec3(.93,.88,.76)*(.9+.15*nz);ink=vec3(.12,.08,.05);}
 else{bg=vec3(.55,.53,.5)*(.75+.5*nz);ink=bg*.45;mk=clamp(mk,0.,1.);bg+=.15*smoothstep(hw+2.*aa,hw,dm)*(1.-mk);}
 return vec4(mix(bg,ink,mk),1.);`,
  'approx. from the crok_ancient_symbols description (Ivar Beer port of BackwardsCap shadertoy wl2yDc, CC BY-NC-SA 3.0): one random glyph per grid cell built from strokes between the nodes of a 3x3 lattice (horizontal, vertical and diagonal links chosen by hash), plus occasional rings and dots; gold, ink or carved-stone look');
f('q44_fireball','Fireball (Matchbox CPGP_Fireball)',[P('Size',.1,1,.45,.01),P('Turbulence',0,2,1,.01),P('Time',0,10,0,.05),S('Palette',['Fire','Blue plasma'])],
  `vec2 W=u_res/u_k;vec2 p=(PX(uv)-W*.5)/(W.y*.5);float r=length(p)/u_p0;vec2 q=p/u_p0;
 float n=fbm(q*2.5+vec2(0.,-u_p2))+.5*fbm(q*5.-vec2(u_p2*1.3,u_p2))+.25*fbm(vec2(atan(p.y,p.x)*3.,r*3.-u_p2*2.));
 float fl=1.-r+(n-.85)*u_p1*.9;float it=clamp(fl*1.6,0.,1.);
 vec3 col=u_p3<.5?stops5(vec3(0.),vec3(.5,.04,0.),vec3(.95,.3,.02),vec3(1.,.75,.2),vec3(1.,1.,.9),it):stops5(vec3(0.),vec3(.05,.05,.45),vec3(.15,.4,1.),vec3(.55,.85,1.),vec3(1.),it);
 col+=(u_p3<.5?vec3(1.,.35,.05):vec3(.2,.4,1.))*.25*exp(-max(r-.8,0.)*4.);return vec4(col,1.);`,
  'approx. from the CPGP_Fireball description (after shadertoy lsf3RH, CC BY-NC-SA 3.0): a ball whose radius is perturbed by layered fbm turbulence scrolling with Time (radial and angular layers), intensity mapped through a fire (or blue plasma) gradient with a soft outer glow');

f('q44_menger','Menger Sponge Flythrough (Matchbox crok_menger_system)',[P('Iterations',1,6,4,1),P('Field of view',30,120,75,1,'deg'),P('Twirl',-1,1,.25,.01),P('Fly',0,20,2,.01)],
  `
#define Q44DE(POS,OUTD) {vec3 q_=(POS);float d_=-1e9;float sc_=1.;for(int m_=0;m_<6;m_++){if(m_>=it)break;vec3 a_=mod(q_*sc_,2.)-1.;sc_*=3.;vec3 rr_=abs(1.-3.*abs(a_));float da_=max(rr_.x,rr_.y),db_=max(rr_.y,rr_.z),dc_=max(rr_.z,rr_.x);d_=max(d_,(min(da_,min(db_,dc_))-1.)/sc_);}OUTD=d_;}
int it=int(u_p0+.5);vec2 q=(uv-.5)*2.*vec2(asp(),1.);vec3 rd=normalize(vec3(rot(q,u_p2*1.5)*tan(radians(u_p1)*.5),1.));rd.xz=rot(rd.xz,u_p2*.35);rd.yz=rot(rd.yz,u_p2*.2);vec3 ro=vec3(0.,0.,u_p3);
 ${Q44_MARCH('ro', 'rd', '.0006', 140, '30.')}
 vec3 bg=vec3(.02,.03,.06);if(hit==0)return vec4(bg,1.);vec3 ld=normalize(vec3(.4,.6,-.7));float dif=max(dot(nrm,ld),0.),dif2=max(dot(nrm,-rd),0.);float ao=1.-float(ns)/140.;
 vec3 col=vec3(.9,.8,.65)*(.12+.55*dif+.4*dif2*vec3(.6,.75,1.))*ao;col=mix(bg,col,exp(-t*.12));return vec4(pow(col,vec3(.8)),1.);`,
  'crok_menger_system (Ivar Beer port of Syntopia shadertoy Mdf3z7, CC BY-NC-SA 3.0): ray-marched infinite Menger sponge - per level a = mod(p * 3^k, 2) - 1, distance = max over levels of (min of the pairwise maxima of |1 - 3|a|| - 1) / 3^(k+1) - flown along a tunnel axis (Fly), with camera Twirl, diffuse + headlight shading, step-count AO and depth fog (approx. lighting)');
f('q44_mandelbox','Mandelbox Fractal (Matchbox crok_mandelbox)',[P('Scale',-3,3,-1.8,.01),P('Iterations',4,20,12,1),P('Camera distance',2,20,6,.1),P('Rotation',-180,180,35,1,'deg')],
  `
#define Q44DE(POS,OUTD) {vec3 c_=(POS);vec3 z_=c_;float dr_=1.;for(int m_=0;m_<20;m_++){if(m_>=it)break;z_=clamp(z_,-1.,1.)*2.-z_;float r2_=dot(z_,z_);if(r2_<.25){z_*=4.;dr_*=4.;}else if(r2_<1.){z_/=r2_;dr_/=r2_;}z_=z_*sc+c_;dr_=dr_*abs(sc)+1.;trap=min(trap,length(z_));}OUTD=length(z_)/abs(dr_);}
int it=int(u_p1+.5);float sc=abs(u_p0)<1.1?(u_p0<0.?-1.1:1.1):u_p0;float trap=1e9;vec2 q=(uv-.5)*2.*vec2(asp(),1.);float ang=radians(u_p3);
 vec3 ro=vec3(sin(ang)*cos(.45),sin(.45),-cos(ang)*cos(.45))*u_p2;vec3 fw=normalize(-ro),rg=normalize(cross(vec3(0.,1.,0.),fw)),up=cross(fw,rg);vec3 rd=normalize(fw+(q.x*rg+q.y*up)*.45);
 ${Q44_MARCH('ro', 'rd', '.0008', 160, '40.')}
 vec3 bg=mix(vec3(.02,.02,.04),vec3(.1,.12,.2),uv.y);if(hit==0)return vec4(bg,1.);trap=1e9;{vec3 pp=ro+rd*t;float dd;Q44DE(pp,dd)}
 vec3 base=ramp(2,clamp(trap*.35,0.,1.));float dif=max(dot(nrm,normalize(vec3(.5,.8,-.3))),0.);float ao=1.-float(ns)/160.;vec3 col=base*(.15+.85*dif)*ao+.25*pow(max(dot(reflect(rd,nrm),normalize(vec3(.5,.8,-.3))),0.),16.);
 return vec4(mix(bg,col,exp(-t*.03)),1.);`,
  'crok_mandelbox (Ivar Beer, after shadertoy sources): ray-marched Mandelbox - box fold clamp(z,-1,1)*2 - z, sphere fold (min radius .5, fixed radius 1), z = Scale z + c, distance |z|/|dr|; camera orbits the origin (Rotation, Camera distance), orbit-trap colouring with diffuse, specular and step-count AO (approx. shading)');
f('q44_mandelbulb','Mandelbulb Fractal (Matchbox crok_mandelbulb)',[P('Power',2,12,8,.1),P('Iterations',2,12,8,1),P('Rotation',-180,180,30,1,'deg'),P('Zoom',.5,3,1,.01)],
  `
#define Q44DE(POS,OUTD) {vec3 c_=(POS);vec3 z_=c_;float dr_=1.,r_=length(z_);for(int m_=0;m_<12;m_++){if(m_>=it)break;r_=length(z_);if(r_>2.)break;trap=min(trap,r_);float th_=acos(clamp(z_.z/max(r_,1e-6),-1.,1.))*pw,ph_=atan(z_.y,z_.x)*pw;dr_=pow(r_,pw-1.)*pw*dr_+1.;z_=pow(r_,pw)*vec3(sin(th_)*cos(ph_),sin(th_)*sin(ph_),cos(th_))+c_;r_=length(z_);}OUTD=.5*log(max(r_,1e-6))*r_/dr_;}
int it=int(u_p1+.5);float pw=u_p0;float trap=1e9;vec2 q=(uv-.5)*2.*vec2(asp(),1.);float ang=radians(u_p2);
 vec3 ro=vec3(sin(ang)*cos(.35),sin(.35),-cos(ang)*cos(.35))*2.8/u_p3;vec3 fw=normalize(-ro),rg=normalize(cross(vec3(0.,1.,0.),fw)),up=cross(fw,rg);vec3 rd=normalize(fw+(q.x*rg+q.y*up)*.5);
 ${Q44_MARCH('ro', 'rd', '.0007', 140, '8.')}
 vec3 bg=mix(vec3(.03,.02,.02),vec3(.15,.1,.12),uv.y);if(hit==0)return vec4(bg,1.);trap=1e9;{vec3 pp=ro+rd*t;float dd;Q44DE(pp,dd)}
 vec3 base=ramp(1,clamp(trap*1.1-.2,0.,1.))*.8+.2;vec3 ld=normalize(vec3(.6,.7,-.4));float dif=max(dot(nrm,ld),0.);float ao=1.-float(ns)/140.;
 vec3 col=base*(.12+.88*dif)*ao+.3*pow(max(dot(reflect(rd,nrm),ld),0.),20.);return vec4(col,1.);`,
  'crok_mandelbulb (Ivar Beer, after shadertoy sources): ray-marched Mandelbulb - spherical power z -> r^n (sin(n th) cos(n ph), sin(n th) sin(n ph), cos(n th)) + c with bailout 2 and distance .5 log(r) r / dr; orbiting camera (Rotation, Zoom), orbit-trap colour, diffuse + specular + step AO (approx. shading)');

f('q44_wavelines','Wave Lines (Matchbox crok_wave_lines)',[P('Lines',1,30,12,1),P('Glow',.2,4,1,.01),P('Time',0,10,0,.05),P('Offset',0,2,.4,.01)],
  `vec2 W=u_res/u_k;vec2 p=(PX(uv)-W*.5)/W.y;vec3 acc=vec3(0.);int n=int(u_p0+.5);
 for(int i=0;i<30;i++){if(i>=n)break;float fi=float(i)/max(float(n-1),1.);float y=.22*sin(p.x*(3.+fi*2.)+u_p2*1.5+fi*u_p3*6.28)*cos(p.x*1.3-u_p2*.7+fi*u_p3*3.)+(fi-.5)*.25;
  vec3 col=stops5(vec3(.1,.3,1.),vec3(.2,.8,1.),vec3(.9,.3,1.),vec3(1.,.5,.2),vec3(1.,.9,.3),fi);acc+=col*u_p1*.0012/max(abs(p.y-y),.0006);}
 return vec4(1.-exp(-acc),1.);`,
  'approx. from the crok_wave_lines description (Ivar Beer, after glsl sandbox 13475): Lines glowing sine-modulated wave curves, phase-staggered by Offset and moving with Time, intensity 1/distance (Glow), coloured along a four-point gradient');
f('q44_twinkle','Twinkle Stars (Matchbox crok_twinkle)',[P('Amount',0,1,.35,.01),P('Size',1,20,5,.1,'px'),P('Rays',1,6,2,1),P('Rotation',0,180,0,1,'deg')],
  `vec2 p=PX(uv);float sz=u_p1;float cell=sz*8.;vec2 ci=floor(p/cell);vec3 acc=vec3(0.);int nr=int(u_p2+.5);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=ci+vec2(float(i),float(j));if(hash(id+.5)>u_p0)continue;vec2 ce=(id+.15+.7*hash2(id+3.3))*cell;
  float br=.25+.75*(.5+.5*sin(hash(id+7.7)*40.));float s=sz*(.5+hash(id+1.9));vec2 d=p-ce;float sh=exp(-dot(d,d)/(s*s*.3));
  for(int k=0;k<6;k++){if(k>=nr)break;vec2 dd=rot(d,radians(u_p3)+float(k)*PI/float(nr));sh+=exp(-abs(dd.y)/(s*.06))*exp(-abs(dd.x)/(s*1.6))*.8;}
  acc+=mix(vec3(.75,.85,1.),vec3(1.,.9,.75),hash(id+5.1))*br*sh;}
 return vec4(1.-exp(-acc*1.3),1.);`,
  'approx. from the crok_twinkle description (Ivar Beer, after glsl sandbox 23725): random stars (Amount) of random size with Rays streak pairs at Rotation and pulsating (random-phase) brightness, slightly tinted, on black');
f('q44_kleinian','Kleinian Fractal Particles (Matchbox CPGP_ParticuleFractale)',[P('Fold scale',1,1.8,1.3,.01),P('Iterations',4,30,14,1),P('Particle size',.5,4,1.4,.1,'px'),P('Time',0,10,0,.05)],
  `vec2 W=u_res/u_k;vec2 p=(PX(uv)-W*.5)/(W.y*.5);vec2 z=p*1.3;vec2 cc=vec2(.45*sin(u_p3*.3+.5),.35*cos(u_p3*.2));float sc=1.,tr=1e9,ti=0.;int it=int(u_p1+.5);
 for(int i=0;i<30;i++){if(i>=it)break;z=2.*clamp(z,vec2(-1.,-.9),vec2(1.,.9))-z;float r2=dot(z,z);float k=max(u_p0/max(r2,1e-4),1.);z*=k;sc*=k;float dd=(length(z-cc)-.015)/sc;if(dd<tr){tr=dd;ti=float(i);}}
 float px=max(tr,0.)*W.y*.5;float g=exp(-px*px/(u_p2*u_p2));vec3 col=hsv2rgb(vec3(fract(.55+ti*.07),.6,1.))*g;return vec4(1.-exp(-col*1.6),1.);`,
  'approx. from the CPGP_ParticuleFractale description (after shadertoy MssGD8): Kleinian-style limit set by iterated box fold (Knighty pseudo-Kleinian, 2-D) and sphere inversion max(scale / r^2, 1) with a moving offset, rendered as glowing particles where the orbit passes close to a point trap (distance scaled back by the accumulated inversion factor), hue by trap iteration');
f('q44_fireworks','Fireworks (Matchbox crok_fireworks)',[P('Bursts',1,8,4,1),P('Particles',10,120,60,1),P('Age',0,1,.45,.01),P('Seed',0,100,1,1)],
  `vec2 W=u_res/u_k;vec2 p=PX(uv)/W.y;vec3 acc=vec3(0.);int nb=int(u_p0+.5),np=int(u_p1+.5);float sd=floor(u_p3+.5);float ps=1.6/W.y;
 for(int b=0;b<8;b++){if(b>=nb)break;float fb=float(b)+sd*13.;vec2 c=vec2((.15+.7*hash(vec2(fb,1.)))*asp(),.5+.35*hash(vec2(fb,2.)));float ag=clamp(u_p2+(hash(vec2(fb,3.))-.5)*.3,.02,1.);
  vec3 col=hsv2rgb(vec3(hash(vec2(fb,4.)),.65,1.));float rad=.18+.12*hash(vec2(fb,5.));
  for(int k=0;k<120;k++){if(k>=np)break;float a=hash(vec2(fb,10.+float(k)))*6.28318;float sp=rad*(.6+.4*hash(vec2(fb,200.+float(k))));
   for(int tr=0;tr<3;tr++){float tt=ag-float(tr)*.035;if(tt<0.)break;vec2 q=c+vec2(cos(a),sin(a))*sp*(1.-exp(-tt*4.))/(1.-exp(-4.))-vec2(0.,.12*tt*tt);float d=length(p-q);acc+=col*(1.-ag)*(1.-float(tr)*.3)*exp(-d*d/(ps*ps));}}}
 return vec4(vec3(.01,.015,.04)+1.-exp(-acc*1.5),1.);`,
  'approx. from the crok_fireworks description (Ivar Beer port of Qqwy shadertoy 4dBGRw, CC BY-NC-SA 3.0): Bursts shells at random heights, each throwing Particles sparks radially with drag (1 - e^-4t) and gravity, short fading trails, colour per shell, Age = time since the explosion, over a night sky');

f = add('Noise');
f('q44_blocknoise','Block Noise (Matchbox crok_block_noise)',[P('Size',4,200,48,1,'px'),P('Detail',1,6,4,1),P('Aspect',.25,4,1,.01),P('Seed',0,100,1,1)],
  `vec2 p=PX(uv)*vec2(1.,u_p2);float v=0.,a=1.,ws=0.;float sz=u_p0;int n=int(u_p1+.5);float sd=floor(u_p3+.5);
 for(int k=0;k<6;k++){if(k>=n)break;v+=a*hash(floor(p/sz)+vec2(sd*17.,float(k)*31.));ws+=a;a*=.55;sz*=.5;}return vec4(vec3(v/ws),1.);`,
  'approx. from the crok_block_noise description (Ivar Beer, after glsl sandbox 16104): blocky texture = sum of Detail octaves of per-cell random values on rectangular grids halving in size (weights .55^k), block Aspect, Seed reshuffles');
