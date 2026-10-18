/* ================= q02: Boris FX Continuum (BCC / BCC+) looks, lights, glows, optics + Heartfelt rain ================= */
f = add('Blur');
f('q02_bcc_diffusion','Lens Diffusion (BCC+ Net / Silk / Center Spot / Low Contrast)',[S('Filter',['Net','Silk','Center Spot','Low Contrast']),
  P('Amount',0,1,.6,.01),P('Blur',1,40,10,.5,'px'),P('Spot radius',.05,.9,.3,.01)],
  [BH('u_p2'), BV('u_p2'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float a=u_p1;vec3 r=o;
 if(m==0){r=mix(o,.55*o+.45*b,a)+a*.18*max(b-o,0.);}
 else if(m==1){vec3 acc=vec3(0.);float ws=0.;float st=max(R(u_p2)/3.,1.);
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*st*u_px;vec3 v=O(q).rgb;vec3 dv=v-o;float w=exp(-dot(dv,dv)/(2.*.012))*exp(-float(i*i+j*j)/8.);acc+=v*w;ws+=w;}
  r=mix(o,acc/ws,a);}
 else if(m==2){float d=length((uv-.5)*vec2(asp(),1.));float w=smoothstep(u_p3*.5,u_p3*.5+.3,d);r=mix(o,b,w*a);}
 else{vec3 hl=b*smoothstep(.3,1.,luma(b));r=o+a*1.3*hl*(1.-o)*(1.-.5*luma(o));}
 return vec4(clamp(r,0.,1.),1.);`],
  'BCC+ (DFT 55mm-style) optical diffusion filters: Net = diffusion mixed into the image by opacity with soft highlight halos; Silk = edge-aware (bilateral) smoothing of fine detail; Center Spot = sharp central spot, blurred surround; Low Contrast = light from bright areas spread into the shadows (blurred highlights added to dark tones). Colour-correct / warming groups omitted');

f('q02_bcc_smearblur','Smear Blur (BCC+)',[P('Scale',0,.5,.06,.005),P('Spiral angle',-45,45,6,.5,'°'),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01)],
  `vec2 ct=vec2(u_p2,1.-u_p3);vec2 Am=vec2(asp(),1.);vec2 p=(uv-ct)*Am;vec3 acc=vec3(0.);float a=radians(u_p1);
 for(int i=0;i<41;i++){float t=float(i)/20.-1.;vec2 q=ct+rot(p,a*t)*(1.+u_p0*t)/Am;acc+=O(clamp(q,0.,1.)).rgb;}
 return vec4(acc/41.,1.);`,
  'BCC+ Smear Blur: pixels smeared forward and backward along Z (zoom from scale 1−Scale to 1+Scale) with an optional spiral rotation about the centre; 41 taps, edge mode Repeat');

f = add('Tone');
f('q02_bcc_tone','Tone Tools (BCC+ F Stop / Fluorescent / High Contrast / Selective Saturation / Flashing / Reflector / Color Infrared)',
  [S('Mode',['F Stop','Fluorescent','High Contrast','Selective Saturation','Flashing','Reflector (silver)','Reflector (gold)','Color Infrared']),
  P('Amount',-1,1,.5,.01),P('Tonal position',0,1,.5,.01),P('Range',.05,1,.35,.01)],
  `int m=int(u_p0+.5);vec3 o=c.rgb;float l=luma(o);float a=u_p1,po=u_p2,rg=u_p3;vec3 r=o;
 float w=exp(-(l-po)*(l-po)/(2.*rg*rg));vec3 lin=pow(max(o,0.),vec3(2.2));
 if(m==0){r=pow(lin*exp2(a*2.*w),vec3(1./2.2));}
 else if(m==1){vec3 q=lin*vec3(1.+.35*a,1.-.12*a,1.+.35*a);q*=luma(lin)/max(luma(q),1e-4);r=pow(max(q,0.),vec3(1./2.2));}
 else if(m==2){float k=3.+8.*abs(a);vec3 s0=1./(1.+exp(-k*(o-po)));float lo=1./(1.+exp(k*po)),hi=1./(1.+exp(-k*(1.-po)));r=mix(o,(s0-lo)/(hi-lo),clamp(abs(a)*2.,0.,1.));}
 else if(m==3){r=sat(o,max(1.+1.5*a*w,0.));}
 else if(m==4){float ms=1.-smoothstep(po-rg*.5,po+rg*.5,l);vec3 fc=vec3(1.,.93,.82);r=o+a*.3*(1.-o)*ms*fc-a*.18*o*(1.-ms)*(vec3(2.)-fc);}
 else if(m<=6){float ms=1.-smoothstep(po-rg*.5,po+rg*.5,l);vec3 rc=m==5?vec3(1.):vec3(1.,.76,.4);r=o+a*.45*ms*rc*(1.-o)*(.4+.6*(1.-l));}
 else{float nir=clamp(o.g*1.1+max(o.g-o.r,0.)*.9+.12*l,0.,1.);vec3 ci=vec3(nir,o.r,o.g);ci=(ci-.5)*(.6+rg*1.4)+.5;
  vec3 hs=rgb2hsv(clamp(ci,0.,1.));hs.x=fract(hs.x+po-.5);ci=hsv2rgb(hs);r=mix(o,ci,clamp(abs(a)*2.,0.,1.));}
 return vec4(clamp(r,0.,1.),1.);`,
  'BCC+ colour & tone tools. F Stop: exposure in stops (Amount×2) in linear light, weighted to a tonal band (Position ± Range; Range 1 ≈ global). Fluorescent: removes the fluorescent green cast (red + blue up, green down, luminance kept). High Contrast: normalised sigmoid about Position, Amount = contrast + mix. Selective Saturation: saturation × (1 + 2·Amount) in the tonal band. Flashing: lab flashing — shadows lifted with a warm flash colour, whites softened (negative = reverse). Reflector: silver / gold bounce light added to shadow tones selected by Position / Range. Color Infrared: false-colour CIR film (R ← near-IR estimated from foliage green, G ← red, B ← green), Range = contrast, Position = hue shift (approx.)');

f = add('Color');
f('q02_bcc_gradtint','Grads & Tints (BCC+ Gels / Dual Gradient / Radial Tint / Color Spot / Radial Exposure)',
  [S('Mode',['Gels','Dual Gradient','Radial Tint','Color Spot','Radial Exposure']),P('Hue',0,360,30,1,'°'),P('Amount',-1,1,.6,.01),P('Size',.05,1,.5,.01)],
  `
#define Q2GEL(col_,op_) (o*mix(vec3(1.),(col_),(op_))/max(luma(mix(vec3(1.),(col_),(op_))),.25))
 int m=int(u_p0+.5);vec3 o=c.rgb;float h=u_p1/360.;float a=u_p2,sz=u_p3;vec2 P2=(uv-.5)*vec2(asp(),1.);float d=length(P2)/(.5*max(asp(),1.));
 vec3 c1=hsv2rgb(vec3(h,.7,1.));vec3 r=o;float spot=1.-smoothstep(sz*.5,sz*.5+.35,d);
 if(m==0)r=Q2GEL(c1,abs(a));
 else if(m==1){float t=smoothstep(.5-sz*.5,.5+sz*.5+.001,uv.y);vec3 c2=hsv2rgb(vec3(fract(h+.5),.7,1.));r=Q2GEL(mix(c2,c1,t),abs(a));}
 else if(m==2){float an=atan(P2.y,P2.x);vec3 cs=vec3(0.);float ws=0.;for(int i=0;i<4;i++){float ai=radians(135.-90.*float(i));float wi=pow(max(cos(an-ai),0.),2.)+1e-4;cs+=hsv2rgb(vec3(fract(h+.25*float(i)),.7,1.))*wi;ws+=wi;}
  r=Q2GEL(cs/ws,abs(a)*smoothstep(0.,max(sz,.05)*1.2,d));}
 else if(m==3){float mk=a>=0.?1.-spot:spot;r=Q2GEL(c1,abs(a)*mk);}
 else{vec3 lin=pow(max(o,0.),vec3(2.2));r=pow(lin*exp2(a*2.*(1.-spot)),vec3(1./2.2));}
 if(m<4)r=mix(r,o,smoothstep(.85,1.,luma(o)));
 return vec4(clamp(r,0.,1.),1.);`,
  'BCC+ grads & tints as photographic colour filters (multiply by the filter colour with exposure compensation, highlights preserved). Gels: whole-frame gel. Dual Gradient: Hue on top, complementary hue at the bottom, transition band = Size. Radial Tint: four quadrant colours (Hue + 0/90/180/270°) as a radial gradient growing outward. Color Spot: tint everywhere except a clear central spot (negative Amount = inverted spot). Radial Exposure: ± 2 stops outside the central spot (vignette / anti-vignette). Gradient corner pins omitted');

f = add('Stylize');
f('q02_bcc_lights','Lights (BCC+ Key Light / Eye Light / Overexpose / BCC Reverse Spotlight)',
  [S('Light',['Key Light (point)','Key Light (parallel)','Eye Light','Overexpose','Reverse Spotlight']),P('Strength',0,2,.8,.01),P('Light X',0,1,.35,.01),P('Light Y',0,1,.35,.01)],
  [BH('14.'), BV('14.'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float s=u_p1;vec2 lp=vec2(u_p2,1.-u_p3);float A=asp();vec2 P2=(uv-lp)*vec2(A,1.);float d=length(P2);
 vec3 lin=pow(max(o,0.),vec3(2.2));vec3 r=o;
 if(m==0){r=pow(lin*exp2(s*(1.-2.*smoothstep(0.,1.,d))),vec3(1./2.2));}
 else if(m==1){vec2 dr=(lp-.5)*vec2(A,1.);dr=length(dr)<1e-3?vec2(0.,1.):normalize(dr);float t=clamp(dot((uv-.5)*vec2(A,1.),dr)/.55,-1.,1.);r=pow(lin*exp2(s*t),vec3(1./2.2));}
 else if(m==2){vec2 e=P2/vec2(.17,.065);float mk=exp(-dot(e,e)*1.5);r=screen(o*(1.-.25*s*(1.-mk)),vec3(1.,.97,.92)*mk*s*.6);}
 else if(m==3){vec3 bl=pow(max(b,0.),vec3(2.2));vec3 e=lin*(1.+2.*s)+bl*s*1.2;r=pow((1.-exp(-1.8*e))/(1.-exp(-1.8)),vec3(1./2.2));r=sat(r,1.-.25*min(s,1.));}
 else{vec2 e=P2/vec2(.3,.4);float sp=1.-smoothstep(.65,1.,length(e));r=pow(lin*(.3+s*1.3*sp*vec3(1.,.95,.84)),vec3(1./2.2));}
 return vec4(clamp(r,0.,1.),1.);`],
  'BCC+ Key Light: relight in linear light, point type (+Strength stops at the light, −Strength far away) or parallel type (directional ramp, direction = centre → light point). Eye Light: soft elliptical catch-light screened at the point, surround slightly darkened. Overexpose: over-exposed film look (exposure boost + blurred highlight bleed, soft-clipped, slightly desaturated). Reverse Spotlight: ambient lowered and a soft elliptical spotlit region at the point (edge-light group omitted; approx.)');

f('q02_bcc_glow','Glows (BCC+ Film Glow / Colorize Glow / Glow Alpha Edges / Atmospheric Glow)',
  [S('Glow',['Film Glow','Colorize Glow','Glow Alpha Edges','Atmospheric Glow']),P('Intensity',0,3,1,.01),P('Radius',2,60,20,1,'px'),P('Threshold',0,1,.6,.01)],
  [`int m=int(u_p0+.5);vec3 o=c.rgb;float l=luma(o);
 if(m==2){float mn=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb);float s=smoothstep(u_p3-.05,u_p3+.05,l);if(mn>32.)s=1.-s;return vec4(vec3(s),1.);}
 if(m==1)return vec4(vec3(smoothstep(u_p3-.15,1.,l)),1.);
 return vec4(o*smoothstep(u_p3,1.,l),1.);`,
   BH('u_p2'), BV('u_p2'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 g=T(uv).rgb*u_p1;vec3 r=o;
 if(m==0){r=screen(o,clamp(g*1.6,0.,1.));}
 else if(m==1){float gl=clamp(g.r*1.4,0.,1.);r=screen(o,ramp(1,gl)*smoothstep(0.,.15,gl));}
 else if(m==2){float mn=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn+=luma(O((vec2(float(i),float(j))+.5)/8.).rgb);float sh=smoothstep(u_p3-.05,u_p3+.05,luma(o));if(mn>32.)sh=1.-sh;float gl=clamp(T(uv).r*2.2,0.,1.)*(1.-sh)*u_p1;r=mix(o,vec3(1.,.72,.28),clamp(gl,0.,1.));}
 else{vec2 lp=vec2(.5,.8);vec3 ry=vec3(0.);for(int i=0;i<24;i++){float t=float(i)/24.;ry+=T(mix(uv,lp,t*.6)).rgb*(1.-t);}ry*=u_p1/12.;
  float fg=fbm(PX(uv)/140.+3.7);float d=length((uv-.5)*vec2(asp(),1.));
  r=screen(o,clamp(g*1.3+ry*1.2*vec3(1.,.92,.75)+fg*.16*vec3(1.,.9,.8),0.,1.));r*=1.-.45*d*d;r+=(hash(floor(PX(uv)))-.5)*.05;}
 return vec4(clamp(r,0.,1.),1.);`],
  'BCC+ Film Glow: thresholded highlights blurred (Gaussian, Radius) and screened (Glow Apply Mode default Screen). Colorize Glow: luma glow map tinted with a gradient (inferno-type fire preset) and screened. Glow Alpha Edges: the luma-keyed shape (key = Threshold; dark shapes when the image is mostly bright) glows outward under the image (Apply Mode Under; gold glow colour so it shows on white too). Atmospheric Glow: film glow + volumetric rays from the upper centre + fog + vignette + grain (flicker / orbs / animation omitted)',1);

f('q02_bcc_rays','Rays (BCC Rays Puffy / Rays Radiant Edges)',[S('Rays',['Puffy','Puffy (fat)','Radiant Edges','Radiant Edges (fat)']),
  P('Ray length',.05,1,.45,.01),P('Light X',0,1,.5,.01),P('Light Y',0,1,.25,.01)],
  [`int m=int(u_p0+.5);vec3 o=c.rgb;float l=luma(o);vec3 s;
 if(m<2)s=o*smoothstep(.4,1.,l);else{float e=smoothstep(.05,.35,length(sobelD(uv,R(1.5))));s=e*mix(vec3(1.,.85,.55),o,.4);}
 return vec4(s,1.);`,
   BH('(mod(u_p0,2.)>.5?7.:0.)'), BV('(mod(u_p0,2.)>.5?7.:0.)'),
   `vec2 lp=vec2(u_p2,1.-u_p3);vec3 acc=vec3(0.);float w=0.;for(int i=0;i<48;i++){float t=float(i)/48.;float k=1.-t;acc+=T(mix(uv,lp,t*u_p1)).rgb*k;w+=k;}return vec4(acc/w,1.);`,
   `vec2 lp=vec2(u_p2,1.-u_p3);vec3 acc=vec3(0.);for(int i=0;i<16;i++){float t=float(i)/16.;acc+=T(mix(uv,lp,t*u_p1*.08)).rgb;}acc/=16.;
 int m=int(u_p0+.5);vec3 o=O(uv).rgb;float gain=m<2?2.2:1.5;return vec4(clamp(screen(o,clamp(acc*gain,0.,1.)),0.,1.),1.);`],
  'BCC Rays: light built from the image (Puffy: luma above a soft threshold, image colours; Radiant Edges: Sobel edges tinted warm) is smeared radially toward the light source (48-tap decaying march + 16-tap smoothing) and screened over the source; "fat" = rays from a blurred source (less distinct). String/shimmer textures omitted');

f = add('Render');
f('q02_bcc_optics','Optical Elements (BCC+ Ice Halos / Multi-Star / Chroma Bands / Orbs)',
  [S('Element',['Ice Halos','Multi-Star 4','Multi-Star 6','Multi-Star 8','Chroma Bands','Orbs']),P('Brightness',0,2,1,.01),P('Size',.05,1,.35,.01),P('Angle or altitude',0,90,20,1,'°')],
  `int m=int(u_p0+.5);vec3 o=c.rgb;float A=asp();vec2 Am=vec2(A,1.);vec3 add_=vec3(0.);
 vec2 lp=vec2(.5);float bl=-1.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;float v=luma(O(q).rgb)+luma(O(q+u_px*3.).rgb)+luma(O(q-u_px*3.).rgb);if(v>bl+.01){bl=v;lp=q;}}
 vec2 p=(uv-lp)*Am;float rr=length(p);
 if(m==0){float Rr=u_p2*.5;float alt=u_p3;
  float ring=smoothstep(Rr*.97,Rr,rr)*exp(-max(rr-Rr,0.)/(Rr*.13));vec3 rc=mix(vec3(1.,.5,.3),vec3(.85,.92,1.),clamp((rr-Rr)/(Rr*.18),0.,1.));
  float ring2=smoothstep(Rr*2.07,Rr*2.1,rr)*exp(-max(rr-Rr*2.1,0.)/(Rr*.2))*.3;
  float arc=ring*smoothstep(.75,1.,p.y/max(rr,1e-4))*.8;
  float dsd=Rr*(1.+.25*pow(alt/45.,2.));vec2 q=vec2(abs(p.x)-dsd,p.y);float sd=exp(-(q.x*q.x)/(Rr*Rr*.004)-(q.y*q.y)/(Rr*Rr*.006))*smoothstep(-.02*Rr,0.,q.x)+exp(-max(q.x,0.)/(Rr*.25)-(q.y*q.y)/(Rr*Rr*.003))*step(0.,q.x)*.35;
  vec3 sdc=mix(vec3(1.,.55,.35),vec3(.9,.95,1.),clamp(q.x/(Rr*.1),0.,1.));
  float pc=exp(-p.y*p.y/(.00002+Rr*Rr*.0004))*.12*smoothstep(Rr*.5,Rr,rr);
  add_=(ring*rc+ring2*rc+arc*rc+sd*sdc*1.3+vec3(pc))*.55;}
 else if(m<=3){float N=m==1?4.:m==2?6.:8.;float len=u_p2*.25;float st=0.;
  for(int j=0;j<8;j++){if(float(j)>=N)break;float an=radians(u_p3)+6.2832*float(j)/N;vec2 dr=vec2(cos(an),sin(an))/Am;
   for(int k=1;k<=22;k++){float t=float(k)/22.;vec2 q2=uv-dr*t*len;float mt=smoothstep(.75,.95,luma(O(q2).rgb));st+=mt*pow(1.-t,2.)*(1.-.5*t);}}
  float core=smoothstep(.75,.95,luma(o));add_=vec3(st*.3+core*.3);}
 else if(m==4){float sc=u_p2*.6;float ang=atan(p.y,p.x)+radians(u_p3);float rays=.55+.45*sin(ang*36.+3.*vnoise(vec2(ang*6.,1.)));
  float hue=fract((rr/sc)*3.);vec3 rb=hsv2rgb(vec3(hue,.75,1.));float env=smoothstep(sc*.12,sc*.3,rr)*exp(-rr/(sc*.9));add_=rb*env*rays*.45;}
 else{float cs=max(u_p2*.22,.02);vec2 gp=uv*Am/cs;vec2 gi=floor(gp);vec3 acc=vec3(0.);float dens=.15+.8*u_p3/90.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=gi+vec2(float(i),float(j));vec2 h2=hash2(cid);if(hash(cid+5.3)>dens)continue;
   vec2 cc=cid+h2;float rad=.25+.35*hash(cid+9.1);float dd=length(gp-cc);float ill=exp(-dot(cc*cs/Am-lp,cc*cs/Am-lp)*6.);
   float disc=smoothstep(rad,rad*.82,dd)*(.55+.45*smoothstep(rad*.5,rad*.95,dd));vec3 oc=mix(vec3(1.,.85,.6),hsv2rgb(vec3(hash(cid+2.2),.5,1.)),.45);acc+=disc*oc*ill*(.4+.6*hash(cid+7.7));}
  add_=acc*.6;}
 return vec4(clamp(screen(o,clamp(add_*u_p1,0.,1.)),0.,1.),1.);`,
  'BCC+ optical elements placed at the brightest point of the image (16×16 search, matte placement approx.), screened over the image. Ice Halos: 22° halo (red inner edge), faint 46° halo, upper tangent arc, parhelia (sundogs; distance grows with sun altitude) and parhelic circle. Multi-Star: 4/6/8-spoke star streaks from the highlight matte, rotated by Angle. Chroma Bands: rainbow diffraction rings with ray texture (Angle rotates). Orbs: random soft bokeh orbs with brighter rims around the light (Angle = density; seed varies layout; no motion/flicker)',1);

f = add('Stylize');
f('q02_bcc_stylize','Color Stylize (BCC Artists Poster / Color Choker / Color Shadow / Multitone Mix / RGB Edges)',
  [S('Mode',['Artists Poster','Color Choker','Color Shadow','Multitone Mix','RGB Edges']),P('Threshold',0,1,.5,.01),P('Pre blur',0,20,2,.5,'px'),P('Variant',0,5,0,1)],
  [BH('u_p2'), BV('u_p2'),
   `int m=int(u_p0+.5);int v=int(u_p3+.5);vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float th=u_p1;vec3 r=o;
 if(m==0){float sf=.004+float(v)*.04;vec3 q=smoothstep(th-sf,th+sf,b);r=sat(q*.85+.075,.85);}
 else if(m==1){float n=3.+float(v);float ch=th;vec3 k=clamp(b,0.,1.)*(n-1.);vec3 i0=floor(k);vec3 fr=k-i0;r=(i0+smoothstep(.5-.5*ch,.5+.5*ch+.001,fr))/(n-1.);}
 else if(m==2){vec3 bg,c1,c2;
  if(v==0){bg=vec3(.08,.07,.2);c1=vec3(1.,.62,.15);c2=vec3(.9,.15,.5);}else if(v==1){bg=vec3(0.);c1=vec3(.3,.95,1.);c2=vec3(.1,.25,.9);}
  else if(v==2){bg=vec3(.15,.03,.2);c1=vec3(1.,.95,.3);c2=vec3(.95,.2,.1);}else if(v==3){bg=vec3(.02,.06,.04);c1=vec3(.7,1.,.2);c2=vec3(.05,.55,.55);}
  else if(v==4){bg=vec3(.05,.05,.15);c1=vec3(1.,.6,.8);c2=vec3(.45,.2,.85);}else{bg=vec3(0.);c1=vec3(1.);c2=vec3(.45);}
  float mk=smoothstep(th-.02,th+.02,luma(b));r=mix(bg,mix(c2,c1,uv.y),mk);}
 else if(m==3){float l=luma(b);float t=pow(clamp(l,0.,1.),log(.5)/log(clamp(th,.05,.95)));vec3 k0,k1,k2,k3,k4;
  if(v==0){k0=vec3(.02,.02,.08);k1=vec3(.25,.1,.35);k2=vec3(.8,.3,.3);k3=vec3(1.,.75,.4);k4=vec3(1.,.98,.9);}
  else if(v==1){k0=vec3(0.,.03,.05);k1=vec3(.05,.25,.3);k2=vec3(.45,.55,.5);k3=vec3(.85,.8,.6);k4=vec3(1.,.97,.9);}
  else if(v==2){k0=vec3(.1,.05,0.);k1=vec3(.4,.2,.08);k2=vec3(.7,.5,.3);k3=vec3(.9,.8,.6);k4=vec3(1.,.97,.9);}
  else if(v==3){k0=vec3(.05,0.,.1);k1=vec3(.1,.2,.6);k2=vec3(.2,.7,.7);k3=vec3(.9,.9,.3);k4=vec3(1.);}
  else if(v==4){k0=vec3(0.);k1=vec3(.5,0.,0.);k2=vec3(1.,.4,0.);k3=vec3(1.,.85,.2);k4=vec3(1.);}
  else{k0=vec3(.03,.05,.1);k1=vec3(.2,.3,.45);k2=vec3(.5,.5,.5);k3=vec3(.8,.7,.55);k4=vec3(1.,.95,.85);}
  r=stops5(k0,k1,k2,k3,k4,t);}
 else{vec2 e=u_px*max(u_k,1.);vec3 gx=(T(uv+vec2(e.x,0.)).rgb-T(uv-vec2(e.x,0.)).rgb)*.5,gy=(T(uv+vec2(0.,e.y)).rgb-T(uv-vec2(0.,e.y)).rgb)*.5;
  float an=radians(45.+60.*float(v));vec3 ed=(gx*cos(an)+gy*sin(an))*12.;vec3 fl=vec3(th*.3);ed=sign(ed)*max(abs(ed)-fl,0.);r=o+ed;}
 return vec4(clamp(r,0.,1.),1.);`],
  'BCC stylize looks on a pre-blurred image. Artists Poster: each channel thresholded → the 8 pure colours (RGBCMYKW) pulled to NTSC-safe levels, Variant = colour soften. Color Choker: per-channel posterize to 3+Variant levels with a choke softness (Threshold) on the blurred image. Color Shadow: high-contrast threshold image with a top→bottom two-colour gradient over a background colour (Variant = palette). Multitone Mix: luma mapped through black / colour 1 / midpoint / colour 3 / white (Threshold = midpoint level, Variant = palette). RGB Edges: directional edges found per RGB channel independently (light direction 45° + 60°·Variant, Threshold = edge floor) added to the source');

f = add('Noise');
f('q02_bcc_noise','Noise & Scatter (BCC Spray Paint Noise / RGB PixelNoise / Scatterize / Edge Grunge)',
  [S('Mode',['Spray Paint Noise','RGB PixelNoise','RGB PixelNoise (luma)','Scatterize (uncontrolled)','Scatterize (directional)','Scatterize (radial)','Edge Grunge']),
  P('Amount',0,1,.3,.01),P('Size',1,60,10,.5,'px'),P('Angle or hue',0,360,30,1,'°')],
  `int m=int(u_p0+.5);vec2 pp=floor(PX(uv));vec3 o=c.rgb;vec3 r=o;float h1=hash(pp),h2=hash(pp+31.7),h3=hash(pp+71.3);
 if(m==0){if(h1<u_p1){vec3 pc=hsv2rgb(vec3(u_p3/360.,.75,.95));r=mix(o,pc,mix(.35,1.,h2));}}
 else if(m==1){if(h1<u_p1)r=o+(vec3(h2,h3,hash(pp+11.1))-.5)*2.*u_p2/60.;}
 else if(m==2){if(h1<u_p1)r=o+(h2-.5)*2.*u_p2/60.;}
 else if(m<=5){if(h1<u_p1){vec2 off;float rn=(h2-.5)*2.*R(u_p2);
   if(m==3)off=(vec2(h2,h3)-.5)*2.*R(u_p2);else if(m==4){float an=radians(u_p3);off=vec2(cos(an),sin(an))*rn;}
   else{vec2 dv=(uv-.5)*vec2(asp(),1.);off=(length(dv)<1e-4?vec2(1.,0.):normalize(dv))*rn;}
   r=O(clamp(uv+off*u_px,0.,1.)).rgb;}}
 else{vec2 sz=PX(vec2(1.));vec2 q=PX(uv);float d=min(min(q.x,sz.x-q.x),min(q.y,sz.y-q.y));float n=fbm(q/14.+1.3);float n2=vnoise(q/3.);
  float bv=d/max(u_p2*2.,1.)-1.+(n-.5)*1.6*(.4+u_p1)+(n2-.5)*.25;float al=smoothstep(-.06,.06,bv);float u=clamp(bv/.5,0.,1.);
  vec3 bc=u<.33?mix(vec3(1.,.95,.6),vec3(1.,.55,.1),u*3.):u<.66?mix(vec3(1.,.55,.1),vec3(.55,.12,.04),u*3.-1.):mix(vec3(.55,.12,.04),vec3(.12,.05,.03),u*3.-2.);
  vec3 burnt=mix(bc,o,smoothstep(.0,1.,u));float glow=exp(-max(-bv,0.)*5.)*(1.-al);r=al*burnt+glow*vec3(1.,.7,.25)*.9;}
 return vec4(clamp(r,0.,1.),1.);`,
  'BCC Spray Paint Noise: Amount = share of pixels covered by flat paint specks (colour hue = Angle) with random opacity 35–100 %. RGB PixelNoise: Amount = share of pixels, Size/60 = noise amplitude, independent per channel or luma-only, clipped. Scatterize: Amount = scatter percentage, Size = variance, uncontrolled / directional (Angle) / radial from the centre. Edge Grunge: the frame edge (no alpha) eroded by Size with a grunge fBm texture, burn coloured in 4 bands (yellow → orange → red → brown) with an outer glow (approx.)',1);

f('q02_bcc_shadows','Multi-Shadow / Edge Lighting (BCC)',[S('Mode',['Multi-Shadow (luma)','Multi-Shadow (luma inverse)','Multi-Shadow (cartoon edges)','Edge Lighting']),
  P('Distance or strength',0,60,12,.5),P('Softness',0,30,4,.5,'px'),P('Angle',0,360,45,1,'°')],
  [`int m=int(u_p0+.5);float l=luma(c.rgb);float k=m==0?smoothstep(.45,.75,l):m==1?smoothstep(.55,.25,l):m==2?smoothstep(.12,.35,length(sobelD(uv,R(1.)))):l;return vec4(vec3(k),1.);`,
   BH('max(u_p2,.6)'), BV('max(u_p2,.6)'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;float l=luma(o);vec3 r=o;float an=radians(u_p3);
 if(m<3){float self=m==0?smoothstep(.45,.75,l):m==1?smoothstep(.55,.25,l):0.;vec3 sh=vec3(1.);
  for(int i=0;i<3;i++){float fi=float(i);float ai=an+radians(fi==1.?15.:fi==2.?-15.:0.);vec2 off=vec2(cos(ai),-sin(ai))*R(u_p1*(1.+fi))*u_px;
   float s=T(uv-off).r*(fi==0.?.65:fi==1.?.4:.25);vec3 scol=fi==0.?vec3(0.):fi==1.?vec3(.05,.05,.3):vec3(.3,.03,.05);sh=mix(sh,sh*scol,s);}
  r=mix(o*sh,o,self);}
 else{vec2 e=u_px*max(u_k,1.);vec2 g=vec2(T(uv+vec2(e.x,0.)).r-T(uv-vec2(e.x,0.)).r,T(uv+vec2(0.,e.y)).r-T(uv-vec2(0.,e.y)).r)*.5;
  float ed=dot(g,vec2(cos(an),-sin(an)))*u_p1;r=o+max(ed,0.)*vec3(1.,.97,.9)-max(-ed,0.)*.8*o;}
 return vec4(clamp(r,0.,1.),1.);`],
  'BCC Multi Shadow: three drop shadows (distance ×1/×2/×3, angles Angle / +15° / −15°, black / dark blue / dark red, opacity 65/40/25 %, blurred by Softness) cast by a luma key, luma-inverse key or cartoon edges; the opaque source stays in front (shadows fall on non-subject pixels). BCC Edge Lighting: highlights and shadows along edges of the blurred luma facing / away from a light at Angle, Strength = Distance');

f = add('Distort');
f('q02_heartfelt','Heartfelt (rain on window)',[P('Rain amount',0,1,.75,.01),P('Fog blur',0,30,10,.5,'px'),P('Drop scale',.4,3,1,.05),P('Time',0,100,13,.1,'s')],
  [BH('u_p1'), BV('u_p1'),
   `
#define Q2SS(a_,b_,v_) (clamp(((v_)-(a_))/((b_)-(a_)),0.,1.)*clamp(((v_)-(a_))/((b_)-(a_)),0.,1.)*(3.-2.*clamp(((v_)-(a_))/((b_)-(a_)),0.,1.)))
 float ra=u_p0;float tm=u_p3*.2;float Ttm=u_p3;vec2 base=(uv-.5)*vec2(asp(),1.)*.7/u_p2;
 float l0=Q2SS(-.5,1.,ra)*2.,l1=Q2SS(.25,.75,ra),l2=Q2SS(0.,.5,ra);float cv[3];float tr0=0.;
 for(int k=0;k<3;k++){vec2 u0=base+(k==1?vec2(.001,0.):k==2?vec2(0.,.001):vec2(0.));
  vec2 su=u0*40.;vec2 sid=floor(su);su=fract(su)-.5;
  vec3 n0=fract(sin(vec3(dot(sid,vec2(107.45,3543.654)),dot(sid,vec2(23.17,91.3)),dot(sid,vec2(71.9,13.7))))*43758.5453);
  float sd=length(su-(n0.xy-.5)*.7);float ft=fract(tm+n0.z);float fade=Q2SS(0.,.025,ft)*Q2SS(1.,.025,ft);float cst=Q2SS(.3,0.,sd)*fract(n0.z*10.)*fade*l0;
  float msum=cst;float trl=0.;
  for(int L=0;L<2;L++){vec2 UV=u0*(L==0?1.:1.85);vec2 q=UV;q.y+=tm*.75;vec2 aa=vec2(6.,1.);vec2 grid=aa*2.;vec2 id=floor(q*grid);
   float colShift=fract(sin(id.x*12345.564)*7658.76);q.y+=colShift;id=floor(q*grid);
   vec3 n=fract(sin(vec3(id.x*35.2+id.y*2376.1,id.x*17.3+id.y*911.7,id.x*63.1+id.y*413.9))*43758.5453);
   vec2 st=fract(q*grid)-vec2(.5,0.);float x=n.x-.5;float yy=UV.y*20.;float wig=sin(yy+sin(yy));x+=wig*(.5-abs(x))*(n.z-.5);x*=.7;
   float ti=fract(tm+n.z);float yv=(Q2SS(0.,.85,ti)*Q2SS(1.,.85,ti)-.5)*.9+.5;vec2 pd=vec2(x,yv);
   float dd=length((st-pd)*aa.yx);float mainDrop=Q2SS(.4,0.,dd);float rr=sqrt(Q2SS(1.,yv,st.y));float cd=abs(st.x-x);
   float trail=Q2SS(.23*rr,.15*rr*rr,cd);float tf=Q2SS(-.02,.02,st.y-yv);trail*=tf*rr*rr;
   float y2=fract(UV.y*10.)+(st.y-.5);float dl=Q2SS(.3,0.,length(st-vec2(x,y2)));
   float mm=mainDrop+dl*rr*tf;float lw=L==0?l1:l2;msum+=mm*lw;trl=max(trl,trail*(L==0?l0:l1));}
  cv[k]=Q2SS(.3,1.,msum);if(k==0)tr0=trl;}
 vec2 nrm=vec2(cv[1]-cv[0],cv[2]-cv[0]);float focus=Q2SS(.1,.2,cv[0]);float clr=max(focus,tr0*.85);
 vec2 q2=clamp(uv+nrm*.6,0.,1.);vec3 sharp=O(q2).rgb;vec3 fog=T(q2).rgb;vec3 col=mix(fog,sharp,clr);
 return vec4(col,1.);`],
  'Shadertoy "Heartfelt" (BigWings / Martijn Steinrucken 2017, CC BY-NC-SA 3.0): rain on a window — static droplets plus two layers of sliding drops with trails (same grid / saw / wiggle construction); drop normals by finite differences refract the view; the background is fogged (Gaussian Fog blur standing in for the mip-level blur) except where drops and trails have wiped the glass. Single frame at Time; the original heart-shaped wipe / lightning / zoom animation omitted',);
