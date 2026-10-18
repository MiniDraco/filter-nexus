/* ================= plugins: classic Photoshop plug-in suites (Eye Candy, Xenofex, KPT, Flaming Pear, Topaz) — part 1 ================= */
/* All are look re-creations from the vendors' manuals / product pages; the plug-ins act on a selection, here the "selection"
   is a soft luminance mask (Source / Object threshold). uv.y = 0 is the bottom of the image. */
const PLG_VOR = `
#define PLG_VOR(pv,jit,d1,d2,cid) {d1=8.;d2=8.;vec2 ib_=floor(pv);for(int j_=-1;j_<=1;j_++)for(int i_=-1;i_<=1;i_++){vec2 cc_=ib_+vec2(float(i_),float(j_));vec2 pt_=cc_+.5+(jit)*(hash2(cc_)-.5);float dd_=length((pv)-pt_);if(dd_<d1){d2=d1;d1=dd_;cid=cc_;}else if(dd_<d2){d2=dd_;}}}
`;
const PLG_MASK = `float l_=blurL(uv,R(1.5));float m_=smoothstep(u_p1-.07,u_p1+.07,l_);`;

/* ---------- 1. edge emitters: Corona / Fire / Smoke / Electrify ---------- */
f = add('Stylize');
f('plug_emitters','Edge Emitters: Corona / Fire / Smoke (Eye Candy) / Electrify (Xenofex)',
  [S('Effect',['Corona (Eye Candy)','Fire (Eye Candy)','Smoke (Eye Candy)','Electrify (Xenofex)']),P('Source threshold',0,1,.6,.01),P('Length',5,200,50,1,'px'),P('Intensity',0,2,1,.01)],
  [`${PLG_MASK}return vec4(m_,m_,m_,1.);`,
   `int m=int(u_p0+.5);vec2 pp=PX(uv);float Lp=u_p2;vec3 o=O(uv).rgb;float self=T(uv).r;float I=u_p3;vec3 res=o;
 if(m==1||m==2){bool smk=m==2;float sw=smk?1.1:.45;float fq=smk?1.6:2.6;float hit=-1.;float xs=pp.x;
  for(int k=0;k<=32;k++){float t=float(k)/32.;float w=(fbm(vec2(pp.x,pp.y-t*Lp*.5)*fq/Lp+vec2(0.,-3.7))-.5)*sw*t*Lp;
   if(T(uv+fromPX(vec2(w,-t*Lp))).r>.5){hit=t;xs=pp.x+w;break;}}
  if(hit>=0.){
   if(!smk){float Lc=.3+.85*fbm(vec2(xs*2.2/Lp,5.3));float heat=clamp(1.-hit/Lc,0.,1.);heat*=.7+.6*fbm(pp*vec2(3.,1.5)/Lp-vec2(0.,7.));heat=clamp(heat,0.,1.);
    vec3 fc=mix(vec3(.55,.04,0.),vec3(1.,.42,.03),smoothstep(.08,.45,heat));fc=mix(fc,vec3(1.,.93,.6),smoothstep(.5,.95,heat));
    float a=clamp(smoothstep(.04,.3,heat)*I,0.,1.)*(1.-.5*self);res=mix(o,fc,a);res=screen(res,fc*a*.25);}
   else{float dn=(1.-hit)*(.2+.95*fbm(pp*1.2/Lp-vec2(0.,hit*2.)));dn=clamp(dn*1.7,0.,1.);
    float a=clamp(dn*I*.95,0.,1.)*(1.-.6*self);vec3 sc=mix(vec3(.33,.32,.31),vec3(.86,.86,.87),fbm(pp*2./Lp+9.));res=mix(o,sc,a);}}}
 else{vec2 g=vec2(0.);for(int k=1;k<=3;k++){float rr=Lp*float(k)/6.;vec2 dx=fromPX(vec2(rr,0.)),dy=fromPX(vec2(0.,rr));g+=vec2(T(uv+dx).r-T(uv-dx).r,T(uv+dy).r-T(uv-dy).r);}
  float t0=-1.;vec2 b=pp;
  if(self>.5)t0=0.;else if(length(g)>.02){vec2 di=normalize(g);for(int k=1;k<=24;k++){float t=float(k)/24.;vec2 q=pp+di*t*Lp;if(T(fromPX(q)).r>.5){t0=t;b=q;break;}}}
  if(t0>=0.){
   if(m==0){float n=fbm(b*5./Lp+vec2(11.));float n2=vnoise(b*16./Lp+3.);float Lr=.2+1.1*n*n*1.5*(.7+.6*n2);float gl=pow(clamp(1.-t0/Lr,0.,1.),1.5);
    vec3 cc=mix(vec3(1.,.32,.04),vec3(1.,.8,.35),gl);cc=mix(cc,vec3(1.,.98,.9),smoothstep(.75,1.,gl));float a=clamp(gl*I,0.,1.)*(1.-.75*self);res=screen(o,cc*a);res=mix(res,cc,a*.4);}
   else{float prox=1.-t0;vec2 qn=pp*2.5/Lp;vec2 wq=qn+1.6*vec2(fbm(qn*1.7+3.),fbm(qn*1.7+8.));float n=fbm(wq);float ee=.05;float gn=length(vec2(fbm(wq+vec2(ee,0.))-n,fbm(wq+vec2(0.,ee))-n))/ee*2.5/Lp*1.6;float ln=1.-smoothstep(0.,gn*1.2+1e-4,abs(n-.5));float n2=fbm(wq*2.1+5.);float ln2=(1.-smoothstep(0.,gn*2.1+1e-4,abs(n2-.5)))*.6;
    float arc=max(ln,ln2*smoothstep(.5,.65,fbm(qn*.6+31.)))*smoothstep(.45,.6,fbm(qn*.5+20.))*smoothstep(0.,.5,prox)*(1.-self);float glow=pow(prox,2.5)*.4*(1.-self)+arc*.5;
    res=clamp(o+vec3(.45,.65,1.)*glow*I+vec3(.9,.95,1.)*arc*I,0.,1.);}}}
 return vec4(res,1.);`],
  'Eye Candy 7 Corona (wispy glow radiating outward from the selection edge), Fire (flames rising from the selection edge, tongue length + sway from fbm), Smoke (grey drifting plumes above the selection); Xenofex 2 Electrify (domain-warped electric arcs + blue glow around the selection). Selection = soft luminance mask above Source threshold; flames / plumes found by marching down through the mask, corona / arcs by marching inward along the mask gradient (approx.)',1);

/* ---------- 2. Icicles / Snow Drift ---------- */
f('plug_snowice','Icicles / Snow Drift (Eye Candy)',
  [S('Effect',['Icicles','Snow Drift']),P('Object threshold',0,1,.6,.01),P('Size',5,120,30,1,'px'),S('Object is',['Bright areas','Dark areas'])],
  [`${PLG_MASK}if(u_p3>.5)m_=1.-m_;return vec4(m_,m_,m_,1.);`,
   `int m=int(u_p0+.5);vec2 pp=PX(uv);float S_=u_p2;vec3 o=O(uv).rgb;float self=T(uv).r;vec3 res=o;
 if(m==1){float H=S_*(.45+.75*fbm(vec2(pp.x*1.5/S_,2.3)));float cap=H*.3*(.6+.8*vnoise(vec2(pp.x*.4/S_,8.)));float s=2.;float al=0.;
  if(self<.5){for(int k=1;k<=40;k++){float t=float(k)/40.*H;if(T(uv+fromPX(vec2(0.,-t))).r>.5){s=t/H;al=smoothstep(H,H-1.5,t);break;}}}
  else{for(int k=1;k<=12;k++){float t=float(k)/12.*cap;if(T(uv+fromPX(vec2(0.,t))).r<.5){s=-t/cap;al=smoothstep(cap,cap*.55,t);break;}}}
  if(al>0.){vec3 sn=mix(vec3(.7,.77,.9),vec3(.98,.99,1.),smoothstep(-1.,.75,s));sn*=.93+.07*vnoise(pp*.5);sn+=step(.994,hash(floor(pp)))*.25;
   res=mix(o,sn,al);}}
 else{float w=S_*.32;float ci=floor(pp.x/w);float best=0.;vec3 ic=o;
  if(self<.5){
   float cpt=S_*.07*(.6+.8*vnoise(vec2(pp.x*.3,1.)));for(int k=1;k<=8;k++){float t=float(k)/8.*cpt;if(T(uv+fromPX(vec2(0.,t))).r>.5){best=.75;ic=mix(o,vec3(.86,.93,1.),.6)+.08;break;}}
   for(int i=-1;i<=1;i++){float cx_i=ci+float(i);float cx=(cx_i+.5+(hash(vec2(cx_i,3.))-.5)*.5)*w;float Lc=S_*(.25+.75*pow(hash(vec2(cx_i,7.)),1.5));
    float d=-1.;for(int k=0;k<=32;k++){float t=float(k)/32.*Lc*1.02;if(T(fromPX(vec2(cx,pp.y+t))).r>.5){d=t;break;}}
    if(d<0.)continue;
    float hw=w*.42*(.55+.45*hash(vec2(cx_i,11.)))*pow(max(1.-d/Lc,0.),.75);float dx=pp.x-cx;float e=hw-abs(dx);
    if(e>0.){float nx=dx/max(hw,1e-3);float a=clamp(e*1.2,0.,1.);if(a>best){best=a;
     vec3 o2=O(uv+fromPX(vec2(-nx*hw*1.2,hw*.4))).rgb;vec3 ice=mix(o2*vec3(.8,.9,1.),vec3(.82,.91,1.),.5)*(1.-.3*nx*nx);
     ice+=exp(-pow((nx+.4)*5.,2.))*.55+exp(-pow((nx-.6)*9.,2.))*.15;ic=ice;}}}}
  res=mix(o,clamp(ic,0.,1.),best*.92);}
 return vec4(res,1.);`],
  'Eye Candy 5 Nature / 7: Icicles = tapered translucent icicles (random length + spacing per column) hanging from the lower edges of the object plus a thin ice coat, refracting the image with a specular streak; Snow Drift = snow settling on upward-facing edges (fbm-varied drift depth above the surface, a soft cap over the object top, blue-grey shading toward the base, glints). Object = soft luminance mask (approx.)',1);

/* ---------- 3. Reptile Skin / Classic Mosaic / Crumple / Texture Noise ---------- */
f = add('Materials');
f('plug_surfaces','Surface Textures: Reptile Skin / Texture Noise (Eye Candy), Classic Mosaic / Crumple (Xenofex)',
  [S('Effect',['Reptile Skin (Eye Candy)','Classic Mosaic (Xenofex)','Crumple (Xenofex)','Texture Noise (Eye Candy)']),P('Size',4,80,16,1,'px'),P('Relief',0,2,1,.01),P('Variation',0,1,.5,.01)],
  `${PLG_VOR}
#define PLG_TNH(q) mix(fbm(q),1.-abs(2.*fbm((q)*1.7+4.)-1.),u_p3)
int m=int(u_p0+.5);vec2 pp=PX(uv);float S_=u_p1;vec3 o=c.rgb;vec3 res=o;vec3 Ld=normalize(vec3(-.6,.7,.9));
 if(m==0){vec2 pv=pp/S_;float d1,d2;vec2 cid,cidc;float h0=0.,hx=0.,hy=0.,gr=1.;
  for(int s_=0;s_<3;s_++){vec2 q=pv+(s_==1?vec2(.03,0.):s_==2?vec2(0.,.03):vec2(0.));PLG_VOR(q,.3+.7*u_p3,d1,d2,cid);float e=d2-d1;float h=sqrt(clamp(e*2.2,0.,1.))*(.8+.2*hash(cid+5.));
   if(s_==0){h0=h;cidc=cid;gr=smoothstep(0.,.07,e);}else if(s_==1)hx=h;else hy=h;}
  vec3 n=normalize(vec3(-(hx-h0)/.03*u_p2*.12,-(hy-h0)/.03*u_p2*.12,1.));float sh=clamp(dot(n,Ld)/Ld.z,0.,1.6);
  vec3 base=mix(o,O(fromPX((cidc+.5)*S_)).rgb,.55)*(.85+.3*hash(cidc));
  res=base*sh*mix(.3,1.,gr)+pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),20.)*.3*u_p2;}
 else if(m==1){vec2 pv=pp/S_;vec2 q=pv+(vec2(vnoise(pv*3.1),vnoise(pv*3.1+7.))-.5)*.14*u_p3;vec2 ip=floor(q);vec2 fq=fract(q);
  float gw=.06+.04*u_p3;vec2 ed=min(fq,1.-fq);float e=min(ed.x,ed.y);vec3 tc=vec3(0.);
  for(int j=0;j<3;j++)for(int i=0;i<3;i++)tc+=O(fromPX((ip+vec2(.25+.25*float(i),.25+.25*float(j)))*S_)).rgb;tc/=9.;tc*=1.+(hash(ip)-.5)*.3*u_p3;
  float bv=.14;vec2 nd=ed.x<ed.y?vec2(fq.x<.5?-1.:1.,0.):vec2(0.,fq.y<.5?-1.:1.);float sl=(e>gw&&e<gw+bv)?1.-(e-gw)/bv:0.;
  vec3 n=normalize(vec3(nd*sl*u_p2*.9,1.));float sh=clamp(dot(n,Ld)/Ld.z,0.,1.5);vec3 grout=vec3(.55,.53,.5)*(.8+.2*vnoise(pp*.7));
  res=mix(grout*.7,tc*sh+pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),30.)*.25*u_p2,smoothstep(gw-.02,gw+.01,e));}
 else if(m==2){vec2 nacc=vec2(0.);float cr=0.;
  for(int o_=0;o_<2;o_++){vec2 pv=pp/(S_*(o_==0?2.:.8));float d1,d2;vec2 cid;PLG_VOR(pv,1.,d1,d2,cid);nacc+=(hash2(cid+13.)-.5)*(o_==0?.75:.45);cr+=(1.-smoothstep(0.,.05,d2-d1))*(o_==0?.5:.3);}
  nacc+=(vec2(fbm(pp*.25/S_*4.),fbm(pp*.25/S_*4.+5.))-.5)*u_p3*.8;
  vec3 n=normalize(vec3(nacc*u_p2*.7,1.));float sh=clamp(dot(n,Ld)/Ld.z,.4,1.5);vec3 im=O(uv+fromPX(nacc*S_*.08*u_p2)).rgb;
  res=im*sh*(1.-cr*.25*u_p2);}
 else{vec2 pv=pp/S_;float h0=PLG_TNH(pv),hx=PLG_TNH(pv+vec2(.05,0.)),hy=PLG_TNH(pv+vec2(0.,.05));
  vec3 n=normalize(vec3(-(hx-h0)/.05*u_p2*.18,-(hy-h0)/.05*u_p2*.18,1.));float sh=clamp(dot(n,Ld)/Ld.z,0.,1.6);
  res=o*sh*(.78+.45*h0);}
 return vec4(clamp(res,0.,1.),1.);`,
  'Eye Candy Reptile Skin = bevelled Voronoi scales (dome height from the F2-F1 edge distance, dark grooves, scale colour from the image at the scale centre); Xenofex Classic Mosaic = square tiles with averaged colour, bevelled edges, irregular grout; Xenofex Crumple = flat facets with random tilt on two Voronoi scales (sharp creases) + wrinkles, lit and slightly displacing the image; Eye Candy Texture Noise = fbm / ridged-turbulence bump texture lit over the image (Variation mixes smooth and ridged). Light from upper left (approx.)',1);

/* ---------- 4. Burnt Edges / Rip Open ---------- */
f = add('Frames');
f('plug_paperfx','Burnt Edges / Rip Open (Xenofex)',
  [S('Effect',['Burnt Edges','Rip Open']),P('Width',.02,.4,.12,.005),P('Roughness',0,1,.5,.01),S('Background',['Black','White'])],
  `int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 q=uv*a;vec2 pp=PX(uv);vec3 o=c.rgb;vec3 bg=u_p3<.5?vec3(0.):vec3(1.);float W=u_p1;float rg=u_p2;vec3 res=o;
 if(m==0){vec2 e2=min(q,a-q);float e=min(e2.x,e2.y);e+=((fbm(pp*.02)-.5)*.9+(fbm(pp*.11+3.)-.5)*.35)*W*rg*1.6;float t=e/W;
  if(t<.18)res=bg;else{float scorch=1.-smoothstep(.24,1.,t);vec3 br=o*mix(vec3(1.),vec3(.6,.36,.16),scorch*.9)*(1.-scorch*scorch*.55);
   res=mix(vec3(.05,.03,.02),br,smoothstep(.22,.4,t));res+=vec3(1.,.4,.08)*exp(-pow((t-.205)/.025,2.))*.7*(.4+fbm(pp*.2));res=mix(bg,res,smoothstep(.18,.2,t));}}
 else{vec2 p=(uv-.5)*a;float r=length(p);vec2 cs=p/max(r,1e-5);float Rh=W*1.6;
  float rb=Rh*(1.+(fbm(cs*2.2+7.)-.5)*.9*rg+(fbm(cs*14.+1.)-.5)*.3*rg)*(1.+pow(fbm(cs*5.+20.),3.)*.8*rg);
  float fw=Rh*(.05+.07*fbm(cs*30.+4.))*(.7+.6*vnoise(pp*.5));
  if(r<rb){float sh=smoothstep(rb-Rh*.18,rb,r);res=bg*(1.-.45*sh)+(1.-bg)*.0;}
  else if(r<rb+fw){float fib=.86+.14*vnoise(pp*vec2(1.3,.4));res=vec3(.96,.95,.91)*fib*(1.-.12*smoothstep(rb,rb+fw,r));}
  else res=o*(1.-.3*exp(-(r-rb-fw)/(Rh*.06)));}
 return vec4(res,1.);`,
  'Xenofex 2 Burnt Edges = noisy burn line inset from the frame edge: burned-away background, charred rim with ember glow, brown scorch gradient into the image; Rip Open = jagged torn hole in the centre (angle-periodic fbm outline + tear spikes) showing the background with an inner shadow, ringed by a white fibrous paper edge and a soft shadow on the image (approx.)',1);

/* ---------- 5. Flag / Swerve / Goo / Projector ---------- */
f = add('Distort');
f('plug_warps','Plug-in Warps: Flag (Xenofex) / Swerve (Flaming Pear) / Goo / Projector (KPT)',
  [S('Effect',['Flag (Xenofex)','Swerve (Flaming Pear)','Goo (KPT)','Projector (KPT)']),P('Amount',0,1,.5,.01),P('Scale',.2,4,1,.01),P('Angle or choppiness',-180,180,0,1)],
  `int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);float A=u_p1;float sc=u_p2;float ang=radians(u_p3);vec2 pp=PX(uv);vec3 res;
 if(m==0){float x=uv.x;float ph=x*sc*9.42-uv.y*sc*2.-ang;float amp=A*.11*x;vec2 q=uv;q.y+=amp*sin(ph);q.x+=A*.02*x*cos(ph);q=(q-.5)/.9+.5;
  float sh=1.+A*.8*cos(ph)*min(x*3.,1.);if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)res=vec3(.08);else res=T(q).rgb*sh;
  float pole=smoothstep(.012,.006,abs(uv.x-.045));res=mix(res,vec3(.55,.52,.48)*(.7+.3*cos((uv.x-.045)*300.)),pole);}
 else if(m==1){vec2 p=pp/(120.*sc);float ch=(u_p3+180.)/360.;vec2 d1=vec2(fbm(p),fbm(p+5.2))-.5;vec2 d2=vec2(1.-abs(2.*fbm(p*3.+1.)-1.),1.-abs(2.*fbm(p*3.+9.)-1.))-.55;
  vec2 d=mix(d1,d2,ch);vec2 q=uv+d*A*.35*vec2(1./asp(),1.);q=1.-abs(1.-abs(q));res=T(q).rgb;}
 else if(m==2){vec2 p=pp/(150.*sc);vec2 q=p;float stp=A*.3/12.;vec2 ao=vec2(cos(ang),sin(ang))*.3;
  for(int i=0;i<12;i++){float e=.05;float n0=fbm(q+ao),nx=fbm(q+vec2(e,0.)+ao),ny=fbm(q+vec2(0.,e)+ao);q+=vec2(ny-n0,-(nx-n0))/e*stp;}
  vec2 src=uv+fromPX((q-p)*150.*sc);src=1.-abs(1.-abs(src));res=T(src).rgb;}
 else{vec2 p=(uv-.5)*a;float tilt=A*1.3;vec3 ro=vec3(0.,0.,-1.6);vec3 rd=normalize(vec3(p,1.6));vec3 nrm=vec3(0.,-sin(tilt),-cos(tilt));float den=dot(rd,nrm);float tt=den<-1e-4?-dot(ro,nrm)/den:-1.;
  if(tt<=0.)res=vec3(.04);else{vec3 hp=ro+rd*tt;vec2 w=vec2(hp.x,dot(hp,vec3(0.,cos(tilt),-sin(tilt))));w=rot(w,ang)/(sc*.8);vec2 su=vec2(w.x/asp(),w.y)+.5;su=1.-abs(1.-mod(su,2.));
   res=mix(T(su).rgb,vec3(.04),smoothstep(3.,14.,tt));}}
 return vec4(res,1.);`,
  'Xenofex Flag = diagonal travelling waves growing away from a pole on the left, cosine shading on the folds; Flaming Pear Swerve = fbm displacement, the choppiness control (Angle or choppiness, -180 smooth .. +180 choppy) blends languid curves into ridged fractal blotches; KPT Goo = liquid smear by 12 advection steps along a curl-noise field (procedural, not interactive brush strokes); KPT Projector = image plane tilted in 3D (Amount = tilt), rotated (Angle), scaled and mirror-tiled to the horizon with depth fade (approx.)',1);

/* ---------- 6. sky / space generators ---------- */
f = add('Render');
f('plug_cosmos','Sky & Space Generators: Little Fluffy Clouds (Xenofex) / SkyEffects (KPT) / LunarCell / SolarCell / Glitterato (Flaming Pear)',
  [S('Effect',['Little Fluffy Clouds (Xenofex)','SkyEffects (KPT)','LunarCell planet (Flaming Pear)','SolarCell sun (Flaming Pear)','Glitterato stars and nebula (Flaming Pear)']),P('Size',.1,1,.5,.01),P('Detail or coverage',0,1,.5,.01),P('Show image',0,1,0,.01)],
  `
#define PLG_CLD(q) (fbm(q)*.65+fbm((q)*2.3+5.)*.35)
#define PLG_TRI(w,k,o3) ((fbm((w).xy*(k)+(o3))+fbm((w).yz*(k)+(o3)+11.)+fbm((w).zx*(k)+(o3)+23.))/3.)
int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 p=(uv-.5)*a;vec2 pp=PX(uv);float sz=u_p1;float dt=u_p2;vec3 o=c.rgb;vec3 rnd=vec3(0.);vec3 ovl=o;
 if(m==0){vec2 q=p*vec2(1.,1.7)*2.6/sz;float d0=PLG_CLD(q);float du=PLG_CLD(q+vec2(0.,.09));float th=mix(.62,.36,dt);float den=smoothstep(th,th+.16,d0);
  float sh=clamp(.62+(d0-du)*6.,.3,1.15);vec3 cc=mix(vec3(.55,.6,.7),vec3(1.,1.,.99),sh);vec3 sky=mix(vec3(.62,.77,.96),vec3(.23,.45,.85),uv.y);
  rnd=mix(sky,cc,den);ovl=mix(o,cc,den);}
 else if(m==1){vec2 sp=vec2(.22*asp(),.2);float ds=length(p-sp);float sr=.02+.06*sz;vec3 sky=mix(vec3(1.,.78,.55),vec3(.16,.36,.78),smoothstep(0.,.85,uv.y));
  sky=mix(sky,vec3(.75,.85,.97),.25*exp(-uv.y*6.));sky+=vec3(1.,.8,.5)*(.5*exp(-ds*4.)+.25*exp(-ds*14.));
  vec2 q=vec2(p.x*1.2,p.y*4.5)/sz;float cl=fbm(q+fbm(q*.7)*.8);float ci=fbm(vec2(p.x*.6,p.y*9.)/sz+3.);float cov=smoothstep(mix(.7,.35,dt),mix(.85,.6,dt),cl)*(.4+.6*smoothstep(.1,.6,uv.y));
  vec3 ccol=mix(vec3(.7,.68,.72),vec3(1.,.93,.82),.5+.5*exp(-ds*2.5));sky=mix(sky,ccol,cov*.9);sky=mix(sky,vec3(1.,.97,.93),smoothstep(.55,.8,ci)*.35*dt);
  sky=mix(sky,vec3(1.,.98,.9),smoothstep(sr,sr*.85,ds));rnd=sky;ovl=mix(o,sky,smoothstep(.45,.9,luma(o))*smoothstep(.35,.85,uv.y));}
 else if(m==2){float R0=.15+.3*sz;float r=length(p)/R0;vec3 bgc=vec3(step(.997,hash(floor(pp)))*hash(floor(pp)+3.));vec3 Ld=normalize(vec3(-.55,.4,.75));float al=0.;vec3 pl=bgc;
  if(r<1.){vec3 n=vec3(p/R0,sqrt(max(1.-r*r,0.)));vec3 w=n;w.yz=rot(w.yz,.4);float h=(PLG_TRI(w,2.5,3.)-.47)*2.+.5+(PLG_TRI(w,9.,40.)-.47)*.5;float sea=.32+.35*dt;
   vec3 col;if(h<sea)col=mix(vec3(.02,.08,.25),vec3(.08,.3,.55),smoothstep(sea-.25,sea,h));else{float t=clamp((h-sea)/(1.-sea),0.,1.);col=stops5(vec3(.75,.68,.48),vec3(.25,.45,.18),vec3(.42,.36,.22),vec3(.5,.47,.44),vec3(.95,.96,.98),t*1.2);}
   col=mix(col,vec3(.93,.95,1.),smoothstep(.72,.8,abs(w.y)+(h-.5)*.2));float cl=smoothstep(.5,.72,PLG_TRI(w,4.,70.));col=mix(col,vec3(.97),cl*.85);
   float df=dot(n,Ld);col*=smoothstep(-.08,.3,df)*.95+.02;if(h<sea)col+=pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),40.)*.5*(1.-cl);
   col+=pow(1.-n.z,3.)*vec3(.35,.55,1.)*smoothstep(-.2,.4,df);pl=col;al=smoothstep(1.,.99,r);}
  float halo=exp(-max(r-1.,0.)*14.)*.6*smoothstep(-.3,.5,dot(normalize(vec3(p,.2)),Ld))*step(1.,r);
  rnd=mix(bgc,pl,al)+vec3(.3,.5,1.)*halo;ovl=mix(o,pl,al)+vec3(.3,.5,1.)*halo;}
 else if(m==3){float R0=.05+.2*sz;float r=length(p)/R0;vec2 cs=p/max(length(p),1e-5);vec3 sun;
  if(r<1.){vec3 n=vec3(p/R0,sqrt(max(1.-r*r,0.)));float gr=PLG_TRI(n,14.,5.);float spot=smoothstep(.62,.7,PLG_TRI(n,3.,9.));
   sun=mix(vec3(1.,.5,.12),vec3(1.,.93,.65),gr)*pow(n.z,.35)*(1.-spot*.6)+vec3(.15,.1,0.)*n.z;}
  else{float co=pow(fbm(cs*3.+7.),2.)*2.+.3;float st=fbm(cs*16.)*.5+.5;float dr=r-1.;sun=vec3(1.,.6,.25)*co*st*exp(-dr*2.2)*.9+vec3(1.,.8,.5)*exp(-dr*.8)*.18;
   float fl=smoothstep(.62,.7,fbm(vec2(atan(p.y,p.x)*2.,dr*3.)))*exp(-dr*5.)*dt*1.5;sun+=vec3(1.,.3,.1)*fl;
   vec2 sp=p/R0;float spk=(exp(-abs(sp.y)*25.)*exp(-abs(sp.x)*.35)+exp(-abs(sp.x)*25.)*exp(-abs(sp.y)*.35))*dt;sun+=vec3(1.,.9,.8)*spk;
   sun+=hsv2rgb(vec3(fract(r*.4),.6,1.))*exp(-pow((r-3.2)*3.,2.))*.12*dt;}
  rnd=sun;ovl=clamp(o+sun,0.,1.);}
 else{vec2 q=p*2.2/sz;float n1=fbm(q+1.5*vec2(fbm(q*1.5),fbm(q*1.5+4.)));float n2=fbm(q*1.3+7.);float neb=smoothstep(.35,.85,n1)*dt*1.4*smoothstep(.25,.6,fbm(q*2.1+13.));
  vec3 nc=mix(vec3(.6,.12,.55),vec3(.12,.38,.9),n2)*neb+vec3(1.,.75,.85)*smoothstep(.72,.9,n1)*neb*.6;vec3 stc=vec3(0.);
  for(int L_=0;L_<3;L_++){float cs=(L_==0?3.:L_==1?8.:20.)*(.5+sz);vec2 g=pp/cs;vec2 ip=floor(g);vec2 jp=ip+.5+(hash2(ip+float(L_)*31.)-.5)*.8;float d=length(g-jp)*cs;
   float b=pow(hash(ip+float(L_)*57.),L_==0?18.:L_==1?10.:5.)*(.4+neb*1.5+.6*float(L_));vec3 tc=mix(vec3(.7,.8,1.),vec3(1.,.85,.6),hash(ip+9.));float rad=.7+float(L_)*.6;
   stc+=tc*b*(exp(-d*d/(rad*rad))*2.+(L_==2?(exp(-abs(g.x-jp.x)*cs*1.2)*exp(-abs(g.y-jp.y)*cs*.12)+exp(-abs(g.y-jp.y)*cs*1.2)*exp(-abs(g.x-jp.x)*cs*.12))*.5:0.));}
  rnd=nc+stc;ovl=screen(o,clamp(rnd,0.,1.));}
 return vec4(clamp(mix(rnd,ovl,u_p3),0.,1.),1.);`,
  'Seeded generators (change the seed for a new scene): Xenofex Little Fluffy Clouds = puffy fbm cumulus lit from above (Detail = coverage); KPT SkyEffects = sunset sky gradient, sun with glow, stratus + cirrus layers (Show image replaces only the bright upper sky of the photo); Flaming Pear LunarCell = shaded planet with tri-planar fbm terrain, sea level (Detail), hypsometric colours, polar ice, cloud layer, specular ocean, atmosphere rim; SolarCell = granulated limb-darkened sun with sunspots, streaky corona, flares, diffraction spikes and a faint rainbow halo; Glitterato = domain-warped nebula with dust lanes + three star layers (power-law brightness, colour temperature, spikes on the brightest). Show image composites the render over the photo (approx.)',1);

/* ---------- 7. Glow / Star Effects / Constellation ---------- */
f = add('Stylize');
f('plug_lightfx','Light Effects: Glow / Star Effects (Topaz) / Constellation (Xenofex)',
  [S('Effect',['Glow (Topaz)','Star Effects (Topaz)','Constellation (Xenofex)']),P('Threshold',0,1,.6,.01),P('Size',2,80,16,1,'px'),P('Intensity',0,2,1,.01)],
  [`int m=int(u_p0+.5);vec3 o=O(uv).rgb;if(m==0){vec2 e=u_px*R(1.);float gx=luma(O(uv+vec2(e.x,0.)).rgb)-luma(O(uv-vec2(e.x,0.)).rgb),gy=luma(O(uv+vec2(0.,e.y)).rgb)-luma(O(uv-vec2(0.,e.y)).rgb);
   float ln=smoothstep(u_p1*.25,u_p1*.25+.12,length(vec2(gx,gy)));return vec4(clamp(sat(o,2.)*1.3+.1,0.,1.)*ln,1.);}
   return vec4(max(o-u_p1,0.)/(1.-u_p1+1e-3),1.);`,BH('u_p2*.5'),BV('u_p2*.5'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;vec3 res=o;float I=u_p3;
 if(m==0){vec2 e=u_px*R(1.);float gx=luma(O(uv+vec2(e.x,0.)).rgb)-luma(O(uv-vec2(e.x,0.)).rgb),gy=luma(O(uv+vec2(0.,e.y)).rgb)-luma(O(uv-vec2(0.,e.y)).rgb);
  float ln=smoothstep(u_p1*.25,u_p1*.25+.12,length(vec2(gx,gy)));vec3 lc=clamp(sat(o,2.)*1.3+.1,0.,1.);res=o*.22+lc*ln*I*.9+bl*2.2*I;}
 else if(m==1){vec3 acc=vec3(0.);float Lr=R(u_p2)*2.5;for(int d=0;d<4;d++){float an=float(d)*.785+.26;vec2 dir=vec2(cos(an),sin(an))*u_px;float ln=d==0||d==2?1.:.55;
   for(int k=1;k<=32;k++){float t=float(k)/32.;vec2 o1=dir*t*Lr*ln;vec3 h=max(max(O(uv+o1).rgb-u_p1,0.)/(1.-u_p1+1e-3)-T(uv+o1).rgb*1.3,0.)+max(max(O(uv-o1).rgb-u_p1,0.)/(1.-u_p1+1e-3)-T(uv-o1).rgb*1.3,0.);acc+=h*exp(-t*3.)*(1.+.25*vec3(sin(t*9.),sin(t*9.+2.),sin(t*9.+4.)));}}
  vec3 pk=max(max(o-u_p1,0.)/(1.-u_p1+1e-3)-bl*1.3,0.);res=screen(o,clamp(acc*I*.5+bl*I*.35*smoothstep(0.,.3,luma(pk)+luma(bl)*.5),0.,1.));}
 else{float cs=max(3.,u_p2*.45);vec2 g=PX(uv)/cs;vec2 ip=floor(g);vec3 acc=vec3(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 jp=cc+.5+(hash2(cc)-.5)*.8;vec3 sc=O(fromPX(jp*cs)).rgb;float lb=luma(sc);float b=smoothstep(u_p1*.5,u_p1*.5+.5,lb);
   vec2 dd=(g-jp)*cs;float rad=.5+1.3*lb*b;float core=exp(-dot(dd,dd)/(rad*rad));float spk=(exp(-abs(dd.y)*1.6)*exp(-abs(dd.x)/(cs*.5))+exp(-abs(dd.x)*1.6)*exp(-abs(dd.y)/(cs*.5)))*smoothstep(.6,.95,lb);
   acc+=clamp(sat(sc,1.5)+.15,0.,1.)*(core*1.6+spk*.5)*b;}
  res=o*.06+acc*I;}
 return vec4(clamp(res,0.,1.),1.);`],
  'Topaz Glow (Electric style) = crisp gradient-magnitude lines in saturated image colour plus their Gaussian glow over a darkened image; Topaz Star Effects = 8-point stars (alternating long / short spikes, slight spectral banding) gathered from highlights above Threshold plus a soft halo; Xenofex Constellation = image rebuilt as jittered star points on black, one per cell (Size), sized and coloured by the image, the brightest with cross spikes (approx.)',1);

/* ---------- 8. Squint / Topaz Lens Effects ---------- */
f = add('Blur');
f('plug_lens','Squint (Eye Candy) / Lens Effects (Topaz)',
  [S('Effect',['Squint (Eye Candy)','Lens: Toy camera (Topaz)','Lens: Diffusion (Topaz)','Lens: Tilt-shift (Topaz)']),P('Radius',2,40,10,1,'px'),P('Amount',0,1,.85,.01),P('Highlight bloom',0,3,1,.01)],
  [BH('u_p1*.1'),BV('u_p1*.1'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec2 a=vec2(asp(),1.);float r=length((uv-.5)*a);float rad=R(u_p1);
 if(m==1)rad*=smoothstep(.2,.75,r);if(m==3)rad*=smoothstep(.06,.32,abs(uv.y-.45));
 vec3 acc=vec3(0.);float ws=0.;for(int k=0;k<64;k++){float fk=float(k)+.5;float rr=sqrt(fk/64.);float an=fk*2.39996;vec3 s=T(uv+vec2(cos(an),sin(an))*rr*rad*u_px).rgb;
  float w=(1.+pow(luma(s),4.)*u_p3*6.)*(m==0?(.35+1.3*rr*rr):1.);acc+=s*w;ws+=w;}
 vec3 bl=acc/ws;vec3 res;
 if(m==0)res=mix(o,bl,u_p2);
 else if(m==1){vec3 x=sat(bl,1.4);x=x*x*(3.-2.*x)*.5+x*.5;x=x*vec3(1.04,1.,.88)+vec3(0.,.02,.06)*(1.-luma(x));x*=1.-.65*smoothstep(.25,.85,r);res=mix(bl,x,u_p2);}
 else if(m==2){vec3 x=screen(o*.9+.04,bl*bl*.9);res=mix(o,x,u_p2);}
 else res=mix(bl,sat(bl,1.35)*1.03,u_p2);
 return vec4(clamp(res,0.,1.),1.);`],
  'Eye Candy Squint = defocus with a ring-weighted disc kernel (64 golden-angle taps, weight rising toward the rim) so highlights spread into doubled halos, like squinting / out-of-focus eyes; Topaz Lens Effects: Toy camera (blur growing toward the corners, saturated cross-processed colour, heavy vignette), Diffusion (soft glow screened over a lifted, lower-contrast image), Tilt-shift (sharp band, blurred above and below, saturation pop). Highlight bloom weights bright taps (approx.)');
