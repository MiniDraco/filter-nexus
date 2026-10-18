/* ================= q06: Filter Forge library creative looks (sketch / hatch / brush / wash / geometric / pop / glow / surface) + ITK edge potential ================= */
// Q06_GL(v,q,d): 5x5 Gaussian-weighted luma of the filter input O around q, tap spacing d working px (sigma ~ 1.4 d)
const Q06_GL = (v, q, d) => `float ${v}=0.;{float w_=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float g_=exp(-float(i*i+j*j)/4.);${v}+=g_*luma(O(${q}+vec2(float(i),float(j))*(${d})*u_px).rgb);w_+=g_;}${v}/=w_;}`;
// Q06_GC: same for colour
const Q06_GC = (v, q, d) => `vec3 ${v}=vec3(0.);{float w_=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float g_=exp(-float(i*i+j*j)/4.);${v}+=g_*O(${q}+vec2(float(i),float(j))*(${d})*u_px).rgb;w_+=g_;}${v}/=w_;}`;
// hatch line mask: pattern-space point p_, angle a_, spacing sp_, width w_ (all image px)
const Q06_HDEF = `
#define Q6HL(p_,a_,sp_,w_) (1.-smoothstep((w_)*.5,(w_)*.5+.8,abs(fract(dot((p_),vec2(cos(a_),sin(a_)))/(sp_))-.5)*(sp_)))
`;
// image size in pattern px and distance to the border
// Q06_AUTO: global mean luma of O (10x10 grid) -> gamma ag_ that maps the mean to ~0.55 (keeps dark photos from going solid)
const Q06_AUTO = `float mu_=0.;for(int j=0;j<10;j++)for(int i=0;i<10;i++)mu_+=luma(O((vec2(float(i),float(j))+.5)/10.).rgb);mu_/=100.;float ag_=clamp(log(.55)/log(clamp(mu_,.05,.95)),.35,2.5);`;
const Q06_BD = `vec2 isz_=u_res/u_k;float bd_=min(min(p.x,isz_.x-p.x),min(p.y,isz_.y-p.y));`;

f = add('Paint');
f('q06_ffsketch','Filter Forge Sketch & Marker Styles',[S('Style',['Crayon Master','Lost Sketchbook','Vellum Sketch','Aqua Sketch','Pastel N Carbon Pencil','Felt Marker','Marker Layout','Technical Drawing','Chalk and Paint Sketch']),
  P('Line width',.5,4,1.5,.1,'px'),P('Strength',0,2,1,.01),P('Color',0,1,1,.01)],
  `${Q06_HDEF}${Q06_AUTO}vec3 col=pow(O(uv).rgb,vec3(ag_));float l=luma(col);vec2 p=PX(uv);int m=int(u_p0+.5);float st=u_p2,cm=u_p3;float w=max(R(u_p1)*.7,.6);
  ${Q06_GL('ga','uv','w')}${Q06_GL('gb','uv','w*2.6')}ga=pow(ga,ag_);gb=pow(gb,ag_);
  float ink=smoothstep(.025,.09,gb-ga)*min(st,1.2);
  vec2 pw=p+3.*(vec2(vnoise(p*.035),vnoise(p*.035+7.3))-.5);
  vec3 pap=vec3(.97,.96,.93)*(.95+.05*vnoise(p*.8));vec3 o;
  if(m==0){float dk=smoothstep(.15,1.,1.-l);float hc=0.;float sp=2.5+u_p1*1.2;
    for(int k=0;k<4;k++){float a=.52+float(k)*.785;float th=float(k)*.19;if(dk<th)continue;
      float ln=Q6HL(pw,a,sp,1.1)*(.5+.5*vnoise(rot(p,a)*vec2(.07,1.4)));hc=max(hc,ln*smoothstep(th,th+.2,dk));}
    hc=clamp(hc*st,0.,1.);vec3 pc=mix(vec3(l*.75),clamp(sat(col,1.3),0.,1.),cm);
    o=pap*mix(vec3(1.),pc,.18+.1*cm);o*=mix(vec3(1.),pc*.9,hc*.85);o*=1.-.75*ink;}
  else if(m==1){float sc=40.;vec2 e=vec2(1.5,0.);float cr=fbm(p/sc);float cx=fbm((p+e.xy)/sc)-cr,cy=fbm((p+e.yx)/sc)-cr;
    float crease=pow(1.-abs(2.*vnoise(p/60.+3.)-1.),24.)+pow(1.-abs(2.*vnoise(rot(p,1.1)/45.+9.)-1.),24.)+.6*pow(1.-abs(2.*vnoise(rot(p,2.)/25.+4.)-1.),30.);
    float paper=.66+clamp((cx-cy)*9.,-.12,.12)-.22*min(crease,1.)+.06*(vnoise(p*.9)-.5);
    float dk=pow(1.-l,1.2);float hc=max(Q6HL(pw,.7,3.5,1.2),Q6HL(pw,2.3,4.5,1.)*step(.55,dk))*smoothstep(.25,.7,dk)*(.4+.6*vnoise(rot(p,.7)*vec2(.05,1.)));
    float v=paper*(1.-.55*clamp(hc*st,0.,1.))*(1.-.85*ink)*mix(1.,.55+.45*l,.6*min(st,1.));
    v=mix(v,v+.25,smoothstep(.7,.95,l)*.6);${Q06_BD}float torn=smoothstep(3.,16.,bd_+14.*(fbm(p/9.)-.5));
    o=vec3(mix(.07,v,torn))*vec3(1.,.98,.94);}
  else if(m==2){float th=.42+.06*(vnoise(p*.25)-.5);float ik=1.-smoothstep(th-.03,th+.03,ga);
    vec2 so=vec2(R(4.),-R(4.))*u_px;${Q06_GL('gs','(uv+so)','R(1.4)')}gs=pow(gs,ag_);float sh=smoothstep(th+.15,th-.1,gs)*.5*st;
    ik=max(ik,ink*.8);float gr=(hash(floor(p))-.5)*.08*st;o=vec3(.98,.975,.965)*(1.-sh)*(1.-ik*min(.95,.6+.35*st))+gr*(1.-ik);}
  else if(m==3){vec2 off=(vec2(fbm(p/55.),fbm(p/55.+5.))-.5)*R(36.)*u_px;vec3 wc=O(uv+off).rgb;
    float blob=smoothstep(.42,.62,fbm(p/80.+11.))*(.4+.6*smoothstep(.05,.3,rgb2hsv(wc).y));vec3 wash=mix(vec3(1.),clamp(sat(wc,1.5),0.,1.),blob*.8*cm);
    float scr=step(.93,vnoise(vec2(p.x*.9,p.y*.012)))*step(.5,vnoise(p*.02));
    float gray=mix(1.,.35+.75*l,.55*st);o=pap*(.9+.1*vnoise(p*1.6))*wash*gray*(1.-.85*ink)*(1.-.3*scr);}
  else if(m==4){float tone=smoothstep(-.05,.95,l);float sk=vnoise(rot(p,.7)*vec2(.05,1.1))*.6+vnoise(rot(p,.75)*vec2(.12,2.4))*.4;
    float cov=smoothstep(sk-.18,sk+.18,(1.-tone)*1.45*min(st,1.5));vec3 pc=mix(vec3(.12),clamp(sat(col,1.45)*1.1,0.,1.),cm);
    pc=mix(pc,pc*.45,smoothstep(.55,1.,1.-tone));o=mix(vec3(.985,.98,.97),pc,cov);o*=1.-.85*ink;}
  else if(m==5){float ik2=smoothstep(.006,.03,gb-ga);float blk=smoothstep(.2,.1,ga)*min(st,1.);
    float sk=vnoise(rot(p,.8)*vec2(.025,.55));vec3 fill=mix(vec3(1.),clamp(sat(col,1.6),0.,1.),cm*(.35+.3*sk)*smoothstep(.98,.6,l));
    o=vec3(.97,.94,.86)*(.96+.04*vnoise(p))*fill*(1.-.92*ik2*min(st,1.))*(1.-.9*blk);}
  else if(m==6){vec2 rp=rot(p,.55);float lane=floor(rp.y/10.);float jt=hash(vec2(lane,3.));
    float edge=smoothstep(0.,.18,abs(fract(rp.y/10.)-.5)*2.);float gap=step(.02,fract(rp.x/(220.+jt*120.)+jt));
    vec2 rp2=rot(p,-.35);float lane2=floor(rp2.y/12.);float jt2=hash(vec2(lane2,8.));float gap2=step(.03,fract(rp2.x/(180.+jt2*90.)+jt2));
    vec3 mc=mix(vec3(l),clamp(sat(col,1.3),0.,1.),cm);vec3 lay=mix(vec3(1.),mc*.92+.04,.6*(.85+.15*edge));
    o=vec3(1.);float t1=smoothstep(.85,.75,l),t2=smoothstep(.4,.3,l);o*=mix(vec3(1.),lay,t1*(.9+.1*gap));o*=mix(vec3(1.),lay,t2*(.8+.1*gap2));o*=mix(1.,.6,smoothstep(.15,.05,l));
    vec2 sg=sobelD(uv,R(u_p1));float ol=smoothstep(.35,.8,length(sg)*min(st,1.5));o*=1.-.9*ol;}
  else if(m==7){float dk=smoothstep(.2,1.,1.-l);float sp=4.;float wl=dk*sp*.75*st;float dist=abs(fract(p.x/sp)-.5)*sp;float line=1.-smoothstep(wl*.5,wl*.5+.7,dist);
    vec3 wash=mix(vec3(1.),clamp(sat(col,1.15),0.,1.),.65*cm);float hl=smoothstep(.82,.96,l);
    o=vec3(.84,.87,.83)*wash*(1.-.85*line*smoothstep(.15,.35,dk))*(1.-.9*ink);o=mix(o,vec3(1.),hl*.85);}
  else{float a=1.35+.25*(vnoise(p*.01)-.5);vec2 dir=vec2(cos(a),sin(a))*u_px*u_k;float Ls=(8.+u_p1*5.)*(.6+.8*hash(floor(rot(p,a)/vec2(26.,5.))));
    vec2 nrm=vec2(-dir.y,dir.x);float jit=(vnoise(rot(p,a)*vec2(.05,.9))-.5)*4.;vec3 acc=vec3(0.);
    for(int i=0;i<16;i++)acc+=O(uv+dir*(float(i)-7.5)*Ls/7.5+nrm*jit).rgb;acc/=16.;
    float g=smoothstep(.35,.75,vnoise(p*vec2(1.3,.4)));vec3 pc=mix(acc,vec3(.95,.93,.88),.22);pc=mix(vec3(luma(pc)),pc,mix(.3,1.25,cm));
    o=mix(pc,pc*.85+.18,g*.35*st);o*=1.-.5*ink;}
  return vec4(clamp(o,0.,1.),1.);`,
  'approx. emulations of Filter Forge library filters (Crayon Master v2 by G.A.G, Lost Sketchbook by raabix, Vellum Sketch by JE Strange, Aqua Sketch by Apple, Pastel N Carbon Pencil Artist by Foxxee, Felt Marker by Oolfanska, Marker Layout by caanwe, Technical Drawing by Northernshadow, Chalk and Paint Sketch by Rawn): DoG outlines + brightness-graded hatching / streak masks / paper textures; Color 0 = monochrome (carbon / graphite) variants', true);
f('q06_ffhatch','Filter Forge Hatching & Engraving Styles',[S('Style',['Stylized Etching','Magic Hatchmix','Minimal Hatched Engraving','Tri-Lines Hatching','I Can Draw Manga (screentone)','Old Book Illustrator']),
  P('Spacing',2,12,4.5,.1,'px'),P('Contrast',0,2,1,.01),P('Color',0,1,1,.01)],
  `${Q06_HDEF}${Q06_AUTO}vec2 p=PX(uv);int m=int(u_p0+.5);float sp=u_p1,ct=u_p2,cm=u_p3;float w=max(R(1.2),.6);
  vec3 col=pow(O(uv).rgb,vec3(ag_));float l=luma(col);
  ${Q06_GL('ga','uv','w')}${Q06_GL('gb','uv','w*2.6')}ga=pow(ga,ag_);gb=pow(gb,ag_);
  float ink=smoothstep(.025,.09,gb-ga)*min(ct,1.3);float tone=clamp((l-.5)*(.6+.4*ct)+.5,0.,1.);float dk=1.-tone;vec3 o;
  if(m==0){vec2 dp=(vec2(vnoise(p*.07),vnoise(p*.07+4.))-.5)*R(3.)*u_px;${Q06_GC('sc','(uv+dp)','w*1.6')}sc=pow(sc,vec3(ag_));
    float br=smoothstep(.02,.08,ga-gb);float gr=fbm(p/28.);float ro=vnoise(p*.35)-.5;
    vec3 b=mix(vec3(luma(sc)),sc,.6+.6*cm);b=(b-.5)*(1.+.3*ct)+.5;
    vec2 pw=p+4.*(vec2(vnoise(p*.02),vnoise(p*.02+3.))-.5);float el=Q6HL(pw,2.2+.4*vnoise(p*.01),sp*.8,.9)*smoothstep(.45,.75,dk)*(.4+.6*vnoise(rot(p,2.2)*vec2(.04,.6)));float sl=Q6HL(pw,1.4,sp*2.3,.7)*smoothstep(.55,.85,tone)*step(.6,vnoise(rot(p,1.4)*vec2(.03,.3)));
    o=b*(1.+.35*ro*ct)*(1.-.9*min(ink*1.4,1.))*(1.-.6*el*ct)+.3*br*ct+.35*sl*ct;o*=mix(1.,.6+.7*gr,.45*ct);o=mix(o,o*vec3(.92,.97,.95),.5);}
  else if(m==1){${Q06_GC('sc','uv','w*1.2')}sc=pow(sc,vec3(ag_));vec2 pw=p+2.*(vec2(vnoise(p*.04),vnoise(p*.04+3.))-.5);
    float h1=Q6HL(pw,.785,sp,1.)*smoothstep(.35,.6,dk),h2=Q6HL(pw,2.36,sp,1.)*smoothstep(.6,.8,dk),hw=Q6HL(pw,.3,sp*1.3,.9)*smoothstep(.6,.85,tone);
    vec3 b=clamp(sat(sc,1.25),0.,1.);vec3 s1=mix(vec3(.1),b*.35,cm);
    o=mix(b,s1,.75*clamp((h1+h2)*ct,0.,1.));o=mix(o,vec3(1.),.6*hw*ct);o=mix(o,softLight(o,vec3(.95,.85,.55)),.35);o*=1.-.85*ink;}
  else if(m==2){float cs=sp*6.;float rw=floor(p.y/cs);vec2 pc=p+vec2(mod(rw,2.)*cs*.5,0.);vec2 cid=floor(pc/cs);vec2 cuv=fromPX((cid+.5)*cs-vec2(mod(rw,2.)*cs*.5,0.));float e=R(5.);
    ${Q06_GL('lx1','(cuv+vec2(e,0.)*u_px)','R(4.)')}${Q06_GL('lx0','(cuv-vec2(e,0.)*u_px)','R(4.)')}${Q06_GL('ly1','(cuv+vec2(0.,e)*u_px)','R(4.)')}${Q06_GL('ly0','(cuv-vec2(0.,e)*u_px)','R(4.)')}
    vec2 g=vec2(lx1-lx0,ly1-ly0);float gm=length(g);float ca=gm>.02?atan(g.y,g.x):.785+1.2*(hash(cid)-.5);vec2 n=vec2(cos(ca),sin(ca));
    float sp2=sp*.85;float d1=fract(dot(p,n)/sp2+hash(cid+3.));vec2 lc=fract(pc/cs)-.5;float msk=smoothstep(.5,.47,max(abs(lc.x),abs(lc.y)))*.35+.65;
    float wd=sp2*clamp(dk-.25,0.,1.)*.9;float ln=(1.-smoothstep(wd*.5,wd*.5+.7,abs(d1-.5)*sp2))*step(.3,dk)*msk;
    vec2 n2=rot(n,1.1);float d2=fract(dot(p,n2)/sp2);float ln2=(1.-smoothstep(.5,1.2,abs(d2-.5)*sp2))*smoothstep(.72,.82,dk)*msk;
    float a=clamp(max(ln,ln2)*(.7+.3*ct),0.,1.);vec3 ic=mix(vec3(.08,.07,.07),clamp(sat(col,1.4)*.6,0.,1.),cm);
    o=mix(vec3(.985,.98,.97),ic,a);o=mix(o,ic,.8*ink*step(.5,ct));}
  else if(m==3){float a=0.;float cs=sp*3.2;for(int k=0;k<2;k++){vec2 q=p+float(k)*cs*.5;vec2 ci=floor(q/cs);float hsh=hash(ci+float(k)*31.);vec2 cc=fract(q/cs)-.5;
      float msk=step(max(abs(cc.x),abs(cc.y)),.5-.08*float(k));float ang=floor(hsh*3.)*2.094+.3;
      if(k==1&&dk<.62)continue;float ln=Q6HL(q,ang,sp*1.1,1.)*step(.45,dk);if(dk>.68)ln=max(ln,Q6HL(q,ang+2.094,sp*1.1,1.));if(dk>.84)ln=max(ln,Q6HL(q,ang+4.189,sp*1.1,1.));a=max(a,ln*msk);}
    a=max(a,step(.94,dk));a=max(a,smoothstep(.4,.7,ink*1.4));vec3 ic=mix(vec3(0.),col*.4,cm*.3);o=mix(vec3(1.),ic,a);}
  else if(m==4){vec2 q=rot(p,.785)/max(sp,2.);vec2 cc=fract(q)-.5;float rr=length(cc);float rad=sqrt(clamp(dk-.25,0.,1.))*.66;
    float dot_=1.-smoothstep(rad-.08,rad+.08,rr);float blk=smoothstep(.86,.92,dk);float a=max(max(dot_*step(.3,dk),blk),smoothstep(.3,.7,ink*1.5));
    o=mix(vec3(1.),mix(vec3(0.),col*.35,cm*.3),a);}
  else{${Q06_GC('sc','(uv+vec2(R(1.5),R(1.))*u_px)','w*1.8')}sc=pow(sc,vec3(ag_));vec3 q=floor(sc*6.+.5)/6.;vec3 b=mix(sc,q,.5);b=mix(vec3(luma(b)),b,.5+.6*cm);b=(b-.5)*(.8+.3*ct)+.55;
    float gn=hash(floor(p));float st_=step(gn,.07*(1.-tone))*.45;vec3 oc=mix(vec3(.12,.08,.05),sat(sc,2.)*.4,.5*cm);
    o=b*(1.-st_)*vec3(1.,.97,.9);o=mix(o,oc,.9*ink);o=mix(o,o*(.88+.12*vnoise(p*.5)),.6);}
  return vec4(clamp(o,0.,1.),1.);`,
  'approx. emulations of Filter Forge library filters (Stylized Etching by raabix, Magic Hatchmix by SuperDeathGuy, Minimal Hatched Engraving by Luis Valoyes, Tri-Lines Hatching by AlienConception, I Can Draw Manga by Skybase, Old Book Illustrator by Gene S Morgan): brightness-graded hatching (engraving lines follow the smoothed gradient normal, tri-lines = random 0/60/120 deg bundles per cell), 45 deg screentone dots, DoG ink; Color 0 = black ink', true);
// smoothed structure tensor (doubled-angle form) stored for the brush painters: r,g = .5+.5*(gx2-gy2, 2gxgy), b = energy
const Q06_TENS = `vec2 g=sobelD(uv,R(1.));return vec4(.5+.5*clamp(vec2(g.x*g.x-g.y*g.y,2.*g.x*g.y)*3.,-1.,1.),clamp(dot(g,g)*3.,0.,1.),1.);`;
f('q06_ffbrush','Filter Forge Brush Painters',[S('Style',['Radial Acrylic','Squiggly Brush','Forkpaint','Detail Painter (contour swirl)','Egg Tempera / Oil Paint']),
  P('Brush size',2,24,8,.5,'px'),P('Angle',-90,90,0,1,'deg'),P('Roughness',0,1,.5,.01)],
  [Q06_TENS, BH('max(u_p1*.9,3.)'), BV('max(u_p1*.9,3.)'),
  `vec2 p=PX(uv);int m=int(u_p0+.5);float bs=u_p1,ang=radians(u_p2),rg=u_p3;vec2 isz=u_res/u_k;
  #define Q6DIR(q_) (rot(vec2(-sin(.5*atan((T(q_).g-.5)+1e-4,(T(q_).r-.5)+1e-5)),cos(.5*atan((T(q_).g-.5)+1e-4,(T(q_).r-.5)+1e-5))),ang))
  vec2 cpx=isz*.5;float len=bs*(m==0?(2.+length(p-cpx)/max(isz.x,isz.y)*9.):m==1?1.6:m==2?2.6:m==3?3.2:1.8);float stp=len/16.;
  float ns=max(bs*(m==2?.12:.3),.7);vec3 acc=O(uv).rgb;float nz=hash(floor(p/ns));float ws=1.;
  for(int sg=0;sg<2;sg++){vec2 q=uv;vec2 d=vec2(0.);
    for(int i=0;i<16;i++){vec2 qp=q*isz;vec2 dn;
      if(m==0){vec2 rd=normalize(qp-cpx+1e-3);dn=rot(rd,ang+1.5708*0.);dn=rot(rd,ang);}
      else if(m==1){float e=1.;float fq=1./max(bs*1.2,2.);float n0=vnoise(qp*fq),nx=vnoise((qp+vec2(e,0.))*fq),ny=vnoise((qp+vec2(0.,e))*fq);dn=normalize(vec2(ny-n0,-(nx-n0))+1e-5);}
      else dn=Q6DIR(q);
      if(i==0)d=sg==0?dn:-dn;else{if(dot(dn,d)<0.)dn=-dn;d=dn;}
      q+=d*stp*u_k*u_px;float wt=1.-float(i)/16.;acc+=O(q).rgb*wt;nz+=hash(floor(q*isz/ns))*wt;ws+=wt;}}
  acc/=ws;nz/=ws;float sn=clamp((nz-.5)*3.5+.5,0.,1.);vec3 c0=O(uv).rgb;float e=T(uv).b;vec3 o;
  if(m==0){vec2 rq=rot(p-cpx,-ang);float an=atan(rq.y,rq.x);float rr=length(rq);sn=mix(vnoise(vec2(an*40./(1.+bs*.05),log(rr+8.)*2.5)),hash(vec2(floor(an*90.),floor(log(rr+8.)*4.))),.35);
    vec3 pv=mix(acc,c0,.15)*(1.+(sn-.5)*1.1*rg);pv=mix(pv,pv*vec3(1.08,.96,.92),.3*(hash(vec2(floor(sn*5.),3.))-.5)*rg);o=pv;}
  else if(m==1){acc=mix(acc,c0,.4);float sh=smoothstep(.42,.58,sn);vec3 bg=mix(vec3(.95,.95,.93),acc,.35);float cov=max(sh,smoothstep(.75,.35,luma(acc)));o=mix(bg,acc*(.8+.4*sn),cov);o*=1.-.25*rg*smoothstep(.45,.5,sn)*smoothstep(.55,.5,sn)*4.;}
  else if(m==2){vec2 d0=Q6DIR(uv);float tine=.5+.5*sin(dot(p,vec2(-d0.y,d0.x))*6.2832/max(bs*.35,2.));o=acc*(.7+.45*tine*(.5+rg))*(1.+(sn-.5)*.8*rg);o=mix(o,vec3(.9,.9,.88),.12*(1.-e));}
  else if(m==3){o=mix(acc,c0,smoothstep(.25,.8,e)*.55);o*=1.+(sn-.5)*.6*rg;vec3 hv=rgb2hsv(clamp(o,0.,1.));hv.x+=(sn-.5)*.04*rg;hv.y*=1.1;o=hsv2rgb(hv);}
  else{vec2 d0=Q6DIR(uv);float fx=1./max(bs*1.8,2.),fy=1./max(bs*.18,.8);
    #define Q6RN(pp_) (vnoise(vec2(dot(pp_,d0)*fx,dot(pp_,vec2(-d0.y,d0.x))*fy))*.7+vnoise(vec2(dot(pp_,d0)*fx*2.3,dot(pp_,vec2(-d0.y,d0.x))*fy*2.1)+7.)*.3)
    float h0=Q6RN(p),hx=Q6RN(p+vec2(1.,0.)),hy=Q6RN(p+vec2(0.,1.));vec3 nn=normalize(vec3(-(hx-h0)*(2.+6.*rg),-(hy-h0)*(2.+6.*rg),1.));
    float li=dot(nn,normalize(vec3(-.5,.6,.65)));o=mix(acc,c0,.25)*(.75+.4*li)+.12*pow(max(li,0.),12.);}
  return vec4(clamp(o,0.,1.),1.);`],
  'approx. emulations of Filter Forge library painters (Radial Acrylic by Indigo Ray, Squiggly Brush by BrianDP1977, Forkpaint by Ramlyn, Detail Painter by Rachel Duim, Egg Tempera / Oil Paint by Nutsy): line-integral-convolution smears of colour + stroke noise along a direction field - radial (Angle 0 = burst, +-90 = rings, between = spirals), curl-noise squiggles, or the smoothed structure-tensor contour tangent rotated by Angle; fork tines, detail-preserving blend at edges, anisotropic relief lighting', true);
f('q06_ffwash','Filter Forge Wash & Flat Painters',[S('Style',['Stoney Painter','Angel Wash (ink wash)','Ink Over Paint','Chinaware Painting','Water Contour','Paint Capriccio (three colours)']),
  P('Smoothing',1,20,4,.5,'px'),P('Strength',0,2,1,.01),P('Color',0,1,1,.01)],
  [BH('u_p1'), BV('u_p1'),
  `${Q06_AUTO}vec2 p=PX(uv);int m=int(u_p0+.5);float st=u_p2,cm=u_p3;float w=max(R(1.),.6);
  vec3 b=pow(T(uv).rgb,vec3(ag_));vec3 c0=pow(O(uv).rgb,vec3(ag_));float lb=luma(b);
  ${Q06_GL('ga','uv','w')}${Q06_GL('gb','uv','w*2.6')}ga=pow(ga,ag_);gb=pow(gb,ag_);float ink=smoothstep(.025,.09,gb-ga);vec3 o;
  if(m==0){vec3 pap=vec3(.93,.9,.82)*(.95+.05*vnoise(p*.6));o=pap;
    for(int k=0;k<3;k++){float fk=float(k);vec2 qo=(vec2(vnoise(p/60.+fk*3.),vnoise(p/60.+fk*3.+9.))-.5)*R(40.)*u_px;vec3 bc=pow(T(uv+qo).rgb,vec3(ag_));float lc=luma(bc);
      float bl=smoothstep(.49,.53,fbm(p/(45.+fk*30.)+fk*7.)+(.5-lc)*.55-.06*fk);vec3 hv=rgb2hsv(bc);
      vec3 pc=lc<.3?vec3(.12,.18,.42):(hv.y>.25&&(hv.x<.14||hv.x>.85))?vec3(.92,.35,.22):lc>.7?vec3(.95,.85,.7):vec3(.3,.48,.72);
      pc=mix(clamp(sat(bc,1.4),0.,1.),pc,cm);o*=mix(vec3(1.),pc,(.55+.1*fk)*bl*min(st,1.5));}
    o*=1.-.75*ink*vec3(.8,.7,.3);o=mix(o,o*vec3(.6,.7,1.),.5*ink);}
  else if(m==1){float gr=fbm(p/14.);float dens=smoothstep(.98,.25,lb)*(.6+.5*gr)*min(st,1.6);
    vec2 ro=vec2(0.,-R(14.)*vnoise(vec2(p.x*.15,1.)))*u_px;vec3 rb=pow(T(uv+ro).rgb,vec3(ag_));vec3 wc=clamp(sat(mix(b,rb,.4),1.+.6*cm),0.,1.);
    float edge=smoothstep(.02,.1,abs(luma(T(uv+vec2(R(2.),0.)*u_px).rgb)-luma(T(uv-vec2(R(2.),0.)*u_px).rgb)));
    o=mix(vec3(.99,.985,.975),wc*(1.-.15*edge),clamp(dens,0.,1.));o*=1.-.45*ink;${Q06_BD}float brd=smoothstep(4.,30.,bd_+22.*(fbm(p/12.)-.5));o=mix(vec3(1.),o,brd);}
  else if(m==2){vec3 pst=floor(b*5.+.5)/5.;vec3 und=mix(b,pst,clamp(st*.5,0.,1.));vec3 hp=c0-b;
    o=und+max(hp,0.)*1.6+min(hp,0.)*.6;o=mix(vec3(luma(o)),o,1.+.4*cm);o*=1.-.8*ink;}
  else if(m==3){vec3 hp=c0-b;vec3 base=mix(b,vec3(1.),.42);o=base+hp*(1.6+1.4*st);o=mix(o,o*vec3(.97,.98,1.02),.6);o=pow(clamp(o,0.,1.),vec3(1.15));o=mix(vec3(luma(o)),o,.6+.6*cm);
    float gl=smoothstep(.75,1.,luma(c0))*.15;o+=gl;}
  else if(m==4){vec3 hv=rgb2hsv(clamp(b,0.,1.));hv.z=floor(hv.z*5.+.5)/5.;hv.y=min(1.,hv.y*(1.+.4*cm));vec3 pc=hsv2rgb(hv);pc=mix(b,pc,.75);
    float edge=smoothstep(.015,.06,gb-ga)*min(st,1.5);o=pc*(1.-.85*edge);}
  else{float th=lb+.08*(fbm(p/18.)-.5);vec3 c1=vec3(.86,.33,.3),c2=vec3(.97,.85,.36),c3=vec3(.62,.86,.95);vec3 pc=th<.38?c1:th<.66?c2:c3;
    pc=mix(clamp(sat(b,1.3),0.,1.),pc,cm);float cv=.5*(abs(sin(dot(p,vec2(.7071,.7071))*2.1))+abs(sin(dot(p,vec2(-.7071,.7071))*2.1)));o=pc*(.9+.1*cv)*(.93+.07*vnoise(p*.4));o*=1.-.6*ink*min(st,1.4);}
  return vec4(clamp(o,0.,1.),1.);`],
  'approx. emulations of Filter Forge library painters (Stoney Painter by Skybase, Angel Wash by Carl, Ink Over Paint by Gene S Morgan, Chinaware painting by JuergB, Water Contour by Yesbird, Paint Capriccio by Ramlyn): Gaussian-smoothed underpaint + DoG ink; translucent noise-shaped multiply blobs in a limited palette, high-key wash with drips and a ragged white border, posterize + oversharpen halo, lightened high-pass porcelain look, value-posterised cartoon contours, three-colour threshold painting on crosshatch canvas; Color 0 = image colours', true);
f('q06_ffgeom','Filter Forge Geometric Painters',[S('Style',['Stripe Painter (spectrum contour stripes)','Triquad Painter','Americana (abstract waves)']),
  P('Size',4,60,16,1,'px'),P('Angle',0,180,30,1,'deg'),P('Variation',0,1,.5,.01)],
  [BH('max(u_p1*.35,1.)'), BV('max(u_p1*.35,1.)'),
  `vec2 p=PX(uv);int m=int(u_p0+.5);float sz=u_p1,an=radians(u_p2),vr=u_p3;vec3 o;vec3 c0=O(uv).rgb;
  if(m==0){float lb=luma(T(uv).rgb);vec2 dr=vec2(cos(an),sin(an));float v=lb*(90./sz)+dot(p,vec2(-dr.y,dr.x))/(sz*.9)+2.5*(fbm(p/(sz*4.))-.5);float id=floor(v),fv=fract(v);
    float s2=dot(p,dr)/(sz*1.3)+id*.37+.6*(vnoise(p/(sz*2.))-.5);float sg=floor(s2);
    float hue=fract(lb*.9+id*.071+hash(vec2(id,sg))*.35*vr+.55);vec3 hv=rgb2hsv(c0);
    o=hsv2rgb(vec3(hue,.55+.35*vr,.5+.5*luma(c0)));o=mix(o,hsv2rgb(vec3(hv.x,.8,hv.z)),.25*(1.-vr));
    float ol=1.-smoothstep(.0,.1,min(fv,1.-fv)*sz*.25);float sm=1.-smoothstep(.0,.05,min(fract(s2),1.-fract(s2))*sz*.08);o=mix(o,vec3(.95),.75*ol);o*=1.-.35*sm;}
  else if(m==1){vec2 q=rot(p,-an);float cs=sz*2.;vec2 ci=floor(q/cs);vec2 cc=q/cs-ci;
    vec2 c1=fromPX(rot((ci+vec2(.25,.25))*cs,an)),c2=fromPX(rot((ci+vec2(.75,.75))*cs,an)),c3=fromPX(rot((ci+vec2(.75,.25))*cs,an)),c4=fromPX(rot((ci+vec2(.25,.75))*cs,an));
    float dv=length(O(c1).rgb-O(c2).rgb)+length(O(c3).rgb-O(c4).rgb);if(dv>.35-.25*vr){cs*=.5;ci=floor(q/cs);cc=q/cs-ci;}
    float h=hash(ci+cs);bool dg=h<.5;float side=dg?step(cc.x,cc.y):step(1.-cc.x,cc.y);
    vec2 cen=dg?(side>.5?vec2(1.,2.)/3.:vec2(2.,1.)/3.):(side>.5?vec2(2.,2.)/3.:vec2(1.,1.)/3.);vec3 tc=O(fromPX(rot((ci+cen)*cs,an))).rgb;
    tc=mix(tc,floor(tc*5.+.5)/5.,.4);float h2=hash(ci+side*7.+cs);if(h2<.3*vr){float sp_=fract(dot(cc,dg?vec2(1.,1.):vec2(1.,-1.))*5.);tc*=mix(1.,.55,step(.5,sp_));}
    float ex=min(min(cc.x,1.-cc.x),min(cc.y,1.-cc.y))*cs;float ed=(dg?abs(cc.x-cc.y):abs(cc.x+cc.y-1.))*.7071*cs;float ln=1.-smoothstep(.4,1.3,min(ex,ed));
    o=tc*(1.-.85*ln);}
  else{vec2 dr=vec2(cos(an),sin(an));vec2 nr=vec2(-dr.y,dr.x);float a1=fbm(vec2(dot(p,dr)/(sz*8.),dot(p,nr)/(sz*.35)));float a2=vnoise(vec2(dot(p,dr)/(sz*3.),dot(p,nr)/(sz*1.5))+5.);
    float sh=(a1-.5)*sz*(1.+4.*vr)+sin(dot(p,nr)/sz*1.3)*sz*.6*vr;float ln=sz*(.2+1.6*a2*a2*vr);vec3 acc=vec3(0.);
    for(int i=0;i<12;i++)acc+=O(uv+dr*(sh+ln*float(i)/11.)*u_k*u_px).rgb;acc/=12.;float sk=vnoise(vec2(dot(p,dr)*.02,dot(p,nr)*.9));
    o=mix(acc,acc*(.85+.3*sk),.6);}
  return vec4(clamp(o,0.,1.),1.);`],
  'approx. emulations of Filter Forge library filters (Stripe Painter and Triquad Painter by Rachel Duim, Americana by Firemup): spectrum-coloured stripes along iso-luminance contours of the blurred image cut into segments, rotated square grid split into flat-coloured triangles (cells halved where the image varies, some striped) with black outlines, wavy directional smear streaks', true);
f = add('Stylize');
f('q06_ffpop','Filter Forge Pop & Poster Styles',[S('Style',['Old Poster Print','POPsterize (pop quad)','Minimalist POP','Overlay 80s (vaporwave)','Pin Up Magazine','Fake Comics (panels)']),
  P('Pattern size',2,20,6,.5,'px'),P('Contrast',0,2,1,.01),P('Hue',0,360,0,1,'deg')],
  `${Q06_HDEF}${Q06_AUTO}vec2 p=PX(uv);int m=int(u_p0+.5);float ps=u_p1,ct=u_p2,hu=u_p3;vec2 isz=u_res/u_k;float w=max(R(1.2),.6);vec3 o;
  #define Q6CT(v_) clamp(((v_)-.5)*(.5+.5*ct)+.5,0.,1.)
  if(m==0){${Q06_GC('sc','uv','w*1.5')}sc=pow(sc,vec3(ag_));float l=Q6CT(luma(sc));${Q06_GL('lr','(uv+vec2(R(2.),R(1.5))*u_px)','w*1.5')}lr=Q6CT(pow(lr,ag_));
    vec3 pap=vec3(.95,.92,.84);vec3 red=cssHue(vec3(.82,.36,.34),hu),tea=cssHue(vec3(.1,.38,.4),hu);
    float scr=Q6HL(p,.785,ps,ps*.5);o=pap;o=mix(o,red,step(l,.54)*(.55+.45*scr));o=mix(o,tea,step(lr,.24)*.92);
    vec2 fu=abs(uv-.5);float fold=exp(-pow(fu.x*isz.x/3.,2.))+exp(-pow(fu.y*isz.y/3.,2.));o*=1.-.18*fold;o*=.92+.1*sign(uv.x-.5)*sign(uv.y-.5)*.3+.06*fbm(p/40.);
    o=mix(o,o*vec3(.9,.82,.65),.35*smoothstep(.45,.75,fbm(p/70.+3.)));${Q06_BD}o=mix(vec3(.82,.75,.6),o,smoothstep(2.,10.,bd_+8.*(fbm(p/6.)-.5)));}
  else if(m==1){vec2 qd=floor(uv*2.);float qi=qd.x+2.*qd.y;vec2 lu=fract(uv*2.);vec2 mg=vec2(.04,.04*asp());vec2 su=(lu-mg)/(1.-2.*mg);
    if(any(lessThan(su,vec2(0.)))||any(greaterThan(su,vec2(1.)))){o=vec3(.96);}
    else{${Q06_GL('l0','su','w*1.6')}float l=Q6CT(pow(l0,ag_));
      vec3 bgc=qi<.5?vec3(.75,.84,.4):qi<1.5?vec3(.55,.85,.97):qi<2.5?vec3(.72,.72,.95):vec3(.88,.86,.35);vec3 mlc=qi<.5?vec3(.9,.2,.2):qi<1.5?vec3(.2,.5,.85):qi<2.5?vec3(.15,.7,.1):vec3(.92,.2,.8);
      vec3 mdc=qi<.5?vec3(.12,.2,.45):qi<1.5?vec3(.35,.2,.15):qi<2.5?vec3(.1,.3,.1):vec3(.4,.15,.5);bgc=cssHue(bgc,hu);mlc=cssHue(mlc,hu);mdc=cssHue(mdc,hu);
      vec2 qp=su*isz*.5;vec2 cc=fract(qp/ps)-.5;float dt=1.-smoothstep(.22,.3,length(cc));float rg=abs(fract(length(fract(qp/(ps*8.))-.5)*3.)-.5);
      o=bgc*(1.-.15*step(rg,.06));if(l<.62)o=mlc;if(l<.4)o=mix(mdc,mix(mdc,vec3(0.),.5),dt);if(l<.18)o=vec3(.03);
      ${Q06_GL('l1','su','w*.7')}float ed=smoothstep(.03,.08,abs(l0-l1)*2.);o*=1.-.8*ed;
      float bx=min(min(su.x,1.-su.x)*isz.x*.5,min(su.y,1.-su.y)*isz.y*.5);o*=step(1.2,bx);o*=.94+.06*vnoise(p*.7);}}
  else if(m==2){${Q06_GL('l0','uv','R(5.)')}float l=Q6CT(pow(l0,ag_)+.08*(vnoise(p/30.)-.5));vec3 bc=hsv2rgb(vec3(fract(hu/360.+.62),.9,.95));
    vec3 c1=bc,c2=hsv2rgb(vec3(fract(hu/360.+.62+.5),.55,.95)),c3=hsv2rgb(vec3(fract(hu/360.+.62+.28),.65,.9)),c4=hsv2rgb(vec3(fract(hu/360.+.62+.12),.4,1.));
    float lv=floor(l*4.);o=lv<.5?c1:lv<1.5?c3:lv<2.5?c2:c4;vec2 cc=fract(rot(p,.6)/ps)-.5;if(lv>.5&&lv<1.5)o=mix(o,o*.6,1.-smoothstep(.2,.28,length(cc)));
    float f4=fract(l*4.);float ln=1.-smoothstep(.0,.06,min(f4,1.-f4));o=mix(o,vec3(1.),ln*.9);}
  else if(m==3){vec2 d=(uv-.5)*vec2(asp(),1.);float rr=length(d);vec3 bg=cssHue(vec3(.15,.95,.98),hu);float l=Q6CT(luma(pow(O(uv).rgb,vec3(ag_))));
    vec3 gm=stops5(vec3(.15,.05,.4),vec3(.45,.05,.55),vec3(.95,.1,.35),vec3(.98,.55,.65),vec3(1.,.95,.97),l);gm=cssHue(gm,hu);float ci=1.-smoothstep(.43,.435,rr);
    float yy=-d.y;float stripe=1.;if(yy>.02){float k=fract(pow(yy/.45,.6)*7.);stripe=step(.22+.25*(yy/.45),k);}o=mix(bg,gm,ci*stripe);
    vec2 sp_=d-vec2(.36*asp(),.36);float an_=atan(sp_.y,sp_.x);float sr=.06*(.6+.4*cos(an_*5.));o=mix(o,vec3(.95,.45,.95),1.-smoothstep(sr,sr+.004,length(sp_)));}
  else if(m==4){${Q06_GC('sc','uv','w*1.5')}sc=pow(sc,vec3(ag_));vec3 c0=pow(O(uv).rgb,vec3(ag_));vec3 b=mix(c0,sc,.35);
    float mx=max(b.r,max(b.g,b.b)),mn=min(b.r,min(b.g,b.b));b=mix(vec3(luma(b)),b,1.+.5*(1.-(mx-mn)));b=(b-.5)*(1.+.25*ct)+.5;
    vec3 tint=cssHue(vec3(1.,.9,.62),hu);b=mix(b,b*tint*1.08,.45);b+=.25*pow(max(luma(b)-.6,0.)/.4,2.)*vec3(1.,.95,.85);o=b*(.95+.05*vnoise(p*.9));}
  else{float ry=uv.y*3.;float ri=floor(ry),fy=fract(ry);float nc=2.+floor(hash(vec2(ri,5.))*2.);float inc=(hash(vec2(ri,9.))-.5)*.25;float cx=uv.x*nc+inc*(fy-.5)*nc*.5;
    float ci=floor(cx),fx=fract(cx);float g=R(ps*1.4)/u_k;float dx=min(fx,1.-fx)*isz.x/nc,dy=min(fy,1.-fy)*isz.y/3.;float dm=min(dx,dy);vec3 pap=vec3(1.,.98,.9);
    if(dm<g)o=pap;else{float zm=1.+.7*hash(vec2(ci,ri));vec2 sh_=(hash2(vec2(ci,ri)+4.)-.5)*.25;vec2 su=clamp((vec2((ci+fx)/nc,(ri+fy)/3.)-.5)/zm+.5+sh_,0.,1.);
      vec3 sc=pow(O(su).rgb,vec3(ag_));${Q06_GL('ga','su','w')}${Q06_GL('gb','su','w*2.6')}float ink=smoothstep(.025,.09,pow(gb,ag_)-pow(ga,ag_));float l=Q6CT(luma(sc));
      vec3 pc=cssHue(floor(clamp(sat(sc,1.4),0.,1.)*4.+.5)/4.,hu);vec2 cc=fract(rot(p,.785)/ps)-.5;float dt=1.-smoothstep(.25,.33,length(cc));pc*=1.-.5*dt*smoothstep(.55,.35,l);
      o=pc*(1.-.9*ink);o=mix(o,vec3(0.),smoothstep(.12,.05,l));o*=step(g+1.5,dm);
      if(hash(vec2(ci,ri)+2.)<.55){vec2 pl=vec2(fx*isz.x/nc,fy*isz.y/3.);vec2 bc=vec2((.3+.4*hash(vec2(ci,ri)+6.))*isz.x/nc,isz.y/3.*.75);vec2 rr_=vec2(isz.x/nc*.3,isz.y/3.*.15);
        float e=length((pl-bc)/rr_);float tl=step(abs(pl.x-bc.x-rr_.x*.3+(pl.y-bc.y+rr_.y)*.6),3.)*step(pl.y,bc.y-rr_.y*.7)*step(bc.y-rr_.y*1.6,pl.y);
        if(e<1.||tl>.5){o=vec3(1.);float tx=step(.5,fract((pl.y-bc.y)/6.))*step(e,.75)*step(.35,vnoise(vec2(pl.x*.35,floor((pl.y-bc.y)/6.)*7.)));o*=1.-.85*tx;}
        float ow=abs(e-1.)*min(rr_.x,rr_.y);o*=mix(1.,0.,(1.-smoothstep(.6,1.5,ow))*step(tl,.5));}}}
  return vec4(clamp(o,0.,1.),1.);`,
  'approx. emulations of Filter Forge library filters (Old Poster Print, POPsterized!, Minimalist POP by Luis Valoyes, Overlay 80 by Ramlyn, Pin Up Magazine by CFandM, Fake Comics by inujima): tone-thresholded ink layers with line screen, misregistration, folds and worn edge; 2x2 pop quad with four palettes, dot / ring patterns and frames; flat 4-level palette from a base hue with white contour lines; synthwave sun disc with gradient map and stripe cuts; vibrance + warm tint + highlight bloom; jittered comic panel grid with zoomed crops, inks, posterised colour, dots and speech balloons', true);
// sharp line layer for the glow filter (reads O, so it works in any pass): edges (Sobel-like slope of smoothed luma) or iso-luma contour wires
const Q06_GLINE = `int m=int(u_p0+.5);float w=max(R(1.2),.6);float e1=u_k;
  ${Q06_GL('l0','uv','w')}${Q06_GL('lx1','(uv+vec2(e1,0.)*u_px)','w')}${Q06_GL('lx0','(uv-vec2(e1,0.)*u_px)','w')}${Q06_GL('ly1','(uv+vec2(0.,e1)*u_px)','w')}${Q06_GL('ly0','(uv-vec2(0.,e1)*u_px)','w')}
  vec2 gd=vec2(lx1-lx0,ly1-ly0)*.5;float slope=length(gd)/u_k;float edge=smoothstep(.006,.03,slope);float N=9.;
  float dist=abs(fract(l0*N+.5)-.5)/N/max(slope,1e-4);float cline=(1.-smoothstep(.5,1.6,dist))*smoothstep(.0015,.006,slope);
  vec3 c0=O(uv).rgb;vec3 hv=rgb2hsv(c0);vec3 lc;
  if(m==0)lc=edge*hsv2rgb(vec3(u_p3/360.,.55,1.));else if(m==1)lc=cline*hsv2rgb(vec3(fract(u_p3/360.+l0*.7+hv.x*.5),.75,1.));else lc=edge*hsv2rgb(vec3(u_p3/360.,.7,1.));`;
f('q06_ffglow','Filter Forge Neon & Glow Styles',[S('Style',['Fiber Optic Neon','Glow Wires (contour lines)','Tron Legacy (grid glow + flares)']),
  P('Glow',1,30,8,.5,'px'),P('Intensity',0,3,1,.01),P('Hue',0,360,195,1,'deg')],
  [`${Q06_GLINE}return vec4(lc,1.);`, BH('u_p1'), BV('u_p1'),
  `${Q06_GLINE}vec3 gl=T(uv).rgb;float it=u_p2;vec2 p=PX(uv);vec3 o;
  if(m==0){float emb=(gd.x-gd.y)/u_k*14.;vec3 base=pow(c0,vec3(1.4))*.7;o=base*(.75+clamp(emb,-.6,.9))+.05*vec3(vnoise(p*.9));o+=gl*.55*it+lc*.35*it;}
  else if(m==1){vec3 bg=pow(c0,vec3(1.3))*.2*mix(vec3(1.),hsv2rgb(vec3(u_p3/360.,.5,1.)),.5);o=bg+gl*1.3*it+lc*.85;}
  else{vec3 tc=hsv2rgb(vec3(u_p3/360.,.7,1.));o=pow(c0,vec3(1.6))*.18*tc+gl*1.1*it+lc*mix(tc,vec3(1.),.5)*.8;
    vec2 a=uv*vec2(asp(),1.);vec2 f1=vec2(.3*asp(),.62),f2=vec2(.72*asp(),.36);
    for(int k=0;k<2;k++){vec2 fp=k==0?f1:f2;vec2 d=a-fp;float r=length(d);o+=it*(vec3(.55,.85,1.)*(.012/(r*r+.0015))*.06+tc*exp(-r*7.)*.35+vec3(.7,.9,1.)*exp(-abs(d.y)*260.)*exp(-abs(d.x)*3.)*.6);}}
  return vec4(clamp(o,0.,1.),1.);`],
  'approx. emulations of Filter Forge library filters (Fiber optic neon by Dynamicsage, Glow Wires by Skybase, Tron 2.0 Legacy by Carlos Carreno): edge / iso-luminance contour line layer, separable Gaussian glow, composited over a darkened (embossed) image; two lens flares with anamorphic streaks for the Tron look');
f = add('Materials');
f('q06_ffsurface','Filter Forge Surface FX (Delft tiles, peeling paint, sponge, ice, fire, insects)',[S('Style',['Delfts Blauw (Delft tiles)','Peeling Paint','Spongiform','Ice Age','Incinerate','Insects Storm']),
  P('Scale',10,200,60,1,'px'),P('Amount',0,1,.6,.01),P('Variation',0,1,.5,.01)],
  `${Q06_AUTO}vec2 p=PX(uv);int m=int(u_p0+.5);float sc=u_p1,am=u_p2,vr=u_p3;vec2 isz=u_res/u_k;vec3 c0=pow(O(uv).rgb,vec3(ag_));float l=luma(c0);vec3 o;
  #define Q6WOR(q_,f1_,f2_) {f1_=9.;f2_=9.;vec2 ci_=floor(q_);for(int j_=-1;j_<=1;j_++)for(int i_=-1;i_<=1;i_++){vec2 nb_=ci_+vec2(float(i_),float(j_));vec2 dd_=nb_+hash2(nb_)-(q_);float r_=dot(dd_,dd_);if(r_<f1_){f2_=f1_;f1_=r_;}else if(r_<f2_)f2_=r_;}f1_=sqrt(f1_);f2_=sqrt(f2_);}
  if(m==0){float ts=sc*2.;vec2 lc=fract(p/ts);vec2 tid=floor(p/ts);float mw=3./ts;vec2 dE=min(lc,1.-lc);float de=min(dE.x,dE.y);
    float bev=smoothstep(mw,mw+.05,de);vec3 glaze=vec3(.93,.91,.85)*(.96+.04*vnoise(p*.3));
    ${Q06_GL('lb','uv','R(1.5)')}lb=pow(lb,ag_);float paint=smoothstep(.5,.42,lb+.06*(fbm(p/25.)-.5));vec3 blue=mix(vec3(.2,.24,.6),vec3(.42,.45,.78),vnoise(p/9.));
    vec2 cq=abs(lc-.5);float sq=max(cq.x,cq.y);float an=atan(lc.y-.5,lc.x-.5);float orn=abs(sq-.43-.012*sin(an*16.))<.008+.006*vr?1.:0.;
    float dots_=step(length(cq-vec2(.43))*ts,4.);float orn2=step(abs(sq-.39),.0035);o=mix(glaze,blue,max(paint*am*1.4,max(orn,max(dots_,orn2))*.9));
    float f1,f2;vec2 wq=p/(ts*.35)+tid*3.;Q6WOR(wq,f1,f2);float crk=(1.-smoothstep(.0,.012,f2-f1))*.22*vr*step(.45,vnoise(p/(ts*.3)));float scr=step(.997,vnoise(vec2(dot(p,vec2(.8,.6))*.03,dot(p,vec2(-.6,.8))*1.5)+tid*5.))*vr;
    o*=1.-crk-.25*scr;o*=.82+.18*bev;o+=(.06*(lc.y-lc.x))*smoothstep(mw+.12,mw,de)*bev;o=mix(vec3(.55,.53,.5)*(.9+.1*vnoise(p)),o,smoothstep(mw*.6,mw,de));}
  else if(m==1){float n=fbm(p/sc)+.25*(vnoise(p/(sc*.2))-.5);float t=1.-am*.75;float pm=smoothstep(t-.01,t+.01,n);
    vec2 so=vec2(-3.,3.);float ns=fbm((p+so)/sc)+.25*(vnoise((p+so)/(sc*.2))-.5);float sh=smoothstep(t-.04,t+.04,ns)*(1.-pm);
    vec3 und=mix(vec3(.72,.71,.68),vec3(.5,.42,.33),vr*step(.5,vnoise(p/(sc*3.))))*(.85+.15*vnoise(p*vec2(.05,.6)));
    float lip=smoothstep(t+.01,t+.03,n)*(1.-smoothstep(t+.03,t+.07,n));float f1,f2;vec2 wq=p/(sc*.18);Q6WOR(wq,f1,f2);float crk=(1.-smoothstep(.0,.04,f2-f1))*step(.4,vnoise(p/(sc*.5)));
    vec3 pt=c0*(1.-.3*crk*am)*(.95+.05*vnoise(p*.5));
    o=pm>.5?und*(1.-.55*sh):pt*(1.+.35*lip);}
  else if(m==2){float f1,f2,g1,g2;vec2 q1=p/(sc*.3);Q6WOR(q1,f1,f2);vec2 q2=p/(sc*.13)+7.;Q6WOR(q2,g1,g2);
    float wall=1.-smoothstep(.05,.22,f2-f1);float wall2=1.-smoothstep(.05,.2,g2-g1);float sp=max(wall,wall2*.85);float hole=1.-sp;
    vec3 spc=mix(vec3(.85,.84,.82),c0*1.2+.1,.3+.4*vr)*(.55+.45*sp);spc=mix(spc,vec3(.04),smoothstep(.3,.9,hole)*.9);
    float msk=smoothstep(am*.8+.1,am*.8,l+.08*(vnoise(p/20.)-.5));o=mix(c0,spc,msk);}
  else if(m==3){float n0=fbm(p/sc),nx=fbm((p+vec2(2.,0.))/sc),ny=fbm((p+vec2(0.,2.))/sc);vec2 gn=vec2(nx-n0,ny-n0)*sc*.5;vec2 off=gn*R(6.+18.*vr)*u_px;
    ${Q06_GC('bc','(uv+off)','R(1.+3.*am)')}bc=pow(bc,vec3(ag_));vec3 ice=vec3(.8,.92,1.);o=mix(bc,bc*ice+vec3(.06,.1,.14),.55+.3*am);
    float f1,f2;vec2 wq=p/(sc*.7)+gn*.3;Q6WOR(wq,f1,f2);float crk=1.-smoothstep(.0,.05,f2-f1);o+=crk*.22*am;
    vec3 nn=normalize(vec3(-gn*2.,1.));float spc=pow(max(dot(nn,normalize(vec3(-.4,.5,.8))),0.),30.);o+=spc*.35;o=mix(o,vec3(.95,.98,1.),smoothstep(.62,.8,fbm(p/(sc*.25)+3.))*.35*am);
    float g1,g2;vec2 bq=p/(sc*.12);Q6WOR(bq,g1,g2);float bub=(1.-smoothstep(.08,.12,g1))*step(.85-.25*vr,hash(floor(bq)+.5));o=mix(o,o*.75+.25,bub*.7);}
  else if(m==4){vec2 d=(uv-.5)*vec2(asp(),1.);float rr=length(d)*2.+(fbm(p/sc)-.5)*.7*(.5+vr);float Rb=am*1.1;float x=rr-Rb;
    float hole=step(x,0.);float ch=smoothstep(.0,.06,x);float ember=exp(-x*x/.0006)*step(0.,x);float heat=1.-smoothstep(.0,.35,x);
    vec3 pc=mix(c0,c0*vec3(.75,.55,.35),heat*.6);pc*=1.-.35*smoothstep(.55,.75,vnoise(p/(sc*.15)))*heat;pc=mix(vec3(.05,.03,.02),pc,ch);
    float fl=fbm(vec2(p.x/(sc*.35),p.y/(sc*.9)))*1.2;float fz=clamp(1.-x/(.18+.25*fl),0.,1.)*step(0.,x)*smoothstep(.0,.02,x);vec3 fire=ramp(1,clamp(fz*fl*1.3,0.,1.));
    o=pc+fire*fz*1.1+vec3(1.,.55,.15)*ember*1.5;o=mix(o,vec3(.02),hole);}
  else{o=c0;for(int ly=0;ly<2;ly++){float cs=sc*(ly==0?.7:.45);vec2 q=p/cs+float(ly)*17.;vec2 ci=floor(q);
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 nb=ci+vec2(float(i),float(j));if(hash(nb+3.)>am)continue;vec2 ip=nb+hash2(nb);float ia=hash(nb+9.)*6.2832;float is=(.24+.14*hash(nb+5.))*(ly==0?1.:.8);
        for(int sh=0;sh<2;sh++){vec2 lq=rot(q-ip-(sh==0?vec2(.07,-.07):vec2(0.)),-ia)/is;
          float bd=min(length((lq-vec2(.0,-.45))/vec2(.22,.55)),min(length(lq/vec2(.2,.18)),length((lq-vec2(0.,.3))/vec2(.13,.12))));
          float wg=min(length((rot(lq-vec2(.28,-.05),.5))/vec2(.2,.48)),length((rot(lq-vec2(-.28,-.05),-.5))/vec2(.2,.48)));float lg=1.;
          for(int k=0;k<3;k++){float yk=-.12+float(k)*.14;float xa=abs(lq.x);lg=min(lg,(xa>.1&&xa<.55&&abs(lq.y-yk-(xa-.1)*.35*(float(k)-1.))<.025)?0.:1.);}
          float body=1.-smoothstep(.95,1.05,bd);float wing=(1.-smoothstep(.95,1.05,wg))*(1.-body);float leg=1.-lg;
          if(sh==0)o*=1.-.45*max(body,max(wing*.5,leg))*(ly==0?1.:.6);
          else{vec3 ic=mix(vec3(.18,.18,.2),vec3(.85,.45,.08),step(.6,fract(lq.y*3.))*step(lq.y,-.1)*vr);o=mix(o,ic*(.8+.4*(1.-bd)),body);o=mix(o,mix(o,vec3(.75,.8,.85),.5),wing*.7);o=mix(o,vec3(.1),leg);}}}}}
  return vec4(clamp(o,0.,1.),1.);`,
  'approx. emulations of Filter Forge library filters (Delfts blauw by Sjeiti, Peeling Paint by Vladimir Golovin, Spongiformia by Ramlyn, Ice Age and Incinerate by Crapadilla, Insects Storm by Ramlyn): procedural tiles with mortar, bevel, ornament band and thresholded image glazed in Delft blue; fBm peel mask with cast shadow and Worley craquelure over plaster; two-octave Worley sponge in the darker image areas; fBm-gradient refraction, frost, Worley cracks and bubbles; radial noisy burn front with ember line, flames and heat browning; scattered procedural insect silhouettes with drop shadows', true);
f = add('Sensor');
f('q06_edgepotential','Edge Potential (ITK)',[P('Sigma',.5,8,1.5,.1,'px'),S('Mapping',['exp(-|grad|/K) (EdgePotential)','1/(1+|grad|/K) (bounded reciprocal)','Sigmoid speed (alpha, beta)']),P('K / beta',.005,.5,.05,.005),P('Sigmoid alpha',.002,.2,.02,.002)],
  [BH('u_p0*2.'), BV('u_p0*2.'),
  `vec2 e=u_px;float gx=L(uv+vec2(e.x,0.))-L(uv-vec2(e.x,0.)),gy=L(uv+vec2(0.,e.y))-L(uv-vec2(0.,e.y));float g=length(vec2(gx,gy))*.5/u_k;
  int m=int(u_p1+.5);float v=m==0?exp(-g/u_p2):m==1?1./(1.+g/u_p2):1./(1.+exp((g-u_p2)/u_p3));return vec4(vec3(v),1.);`],
  'ITK EdgePotentialImageFilter on GradientMagnitudeRecursiveGaussian: P = exp(-|grad(G_sigma * I)|) with the magnitude divided by K (ITK uses K = 1 on the raw intensity scale; here luma 0..1, gradient per image pixel), plus the usual alternatives for level-set speed images: bounded reciprocal 1/(1+|grad|/K) and Sigmoid((|grad| - beta)/alpha) decreasing; 1 = flat, 0 = edge');
