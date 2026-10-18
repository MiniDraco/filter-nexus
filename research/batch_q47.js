/* ================= q47: round-18 Filter Forge "Misc effects" look re-creations (materials, textures, objects) ================= */
// Filter Forge library filters are only published as descriptions + preview renders, so these are approx. look re-creations
// grouped by kind. Shared single-pass bump lighter: the body runs 3x (pixel, +1 px x, +1 px y) and sets albedo a, height h
// (and optionally sp/sh specular, lm lighting mix, rk slope gain, lv light vector); slopes come from the 3 heights.
const Q47_LIT = (body, rel, lvx) => `vec2 e=u_px*u_k;float hh[3];vec3 al=vec3(0.);float SP=0.,SH=8.,LM=1.,RK=1.;vec3 LV=normalize(${lvx});
for(int k=0;k<3;k++){vec2 q=uv+(k==1?vec2(e.x,0.):k==2?vec2(0.,e.y):vec2(0.));vec2 p=PX(q);vec3 a=vec3(0.);float h=0.,sp=0.,sh=8.,lm=1.,rk=1.;vec3 lv=LV;
${body}
hh[k]=h;if(k==0){al=a;SP=sp;SH=sh;LM=lm;RK=rk;LV=normalize(lv);}}
float gx_=(hh[0]-hh[1])*RK*(${rel}),gy_=(hh[0]-hh[2])*RK*(${rel});vec3 N=normalize(vec3(gx_,gy_,1.));
float df=max(dot(N,LV),0.)/max(LV.z,.2);vec3 H=normalize(LV+vec3(0.,0.,1.));
float s_=max(pow(max(dot(N,H),0.),SH)-pow(H.z,SH),0.)*SP;
return vec4(clamp(al*mix(1.,df,LM)+s_,0.,1.),1.);`;
const Q47_LV = 'vec3(cos(radians(u_p3)),sin(radians(u_p3)),1.1)';
// object coords: unit disc fits the shorter side at Size; image mapped into a disc of radius R_
const Q47_OBJ = `
#define Q47IM(W_,R_) (.5+(W_)/(2.*(R_))*vec2(min(1.,1./asp()),min(1.,asp())))
`;

/* ---------- image-driven surfaces ---------- */
f = add('Materials');
f('q47_ffsurface','Filter Forge Image Surfaces',[S('Surface',['Sandpaper','Tin Can','Styrofoam','Suede','Picture to Plush','Patina','Corrugated Metal']),P('Relief',0,3,1,.01),P('Grain scale',.25,4,1,.01,'x'),P('Light angle',0,360,135,1,'deg')],
  Q47_LIT(`int m=int(u_p0+.5);float S=u_p2;vec3 o=O(q).rgb;float l=luma(o);float lb=blurL(q,u_k);
 if(m==0){float g=hash(floor(p*1.3/S));float g2=vnoise(p*.35/S);h=.5*lb+.3*g+.2*g2;a=vec3(.6,.57,.52)*(.6+.45*lb)*(.85+.25*g);sp=.35;sh=10.;rk=2.5;}
 else if(m==1){h=lb+.04*vnoise(p*.5/S);a=vec3(.7,.71,.74)*(.55+.55*l);sp=1.;sh=24.;rk=6.;}
 else if(m==2){vec2 g_=p/(5.*S);vec2 ci=floor(g_);float dmin=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));vec2 d_=g_-cc-hash2(cc)*.8-.1;dmin=min(dmin,dot(d_,d_));}
  float bead=sqrt(max(1.-dmin*1.6,0.));h=.45*lb+.35*bead;a=vec3(.94,.93,.9)*(.86+.14*bead)*(.88+.12*lb);sp=.12;sh=6.;rk=2.5;}
 else if(m==3){float n=vnoise(rot(p,.4)*vec2(.7,.12)/S)*.5+vnoise(p*1.1/S)*.5;h=.25*n+.5*lb;a=vec3(.64,.5,.46)*(.4+.65*lb)*(.82+.3*n);sp=.04;sh=4.;rk=1.5;}
 else if(m==4){float fi=vnoise(rot(p,.25)*vec2(1.4,.2)/S)*.6+hash(floor(p*vec2(.9,.3)/S))*.4;h=.55*fi+.35*lb;a=o*(.62+.55*fi);sp=.12;sh=5.;rk=1.6;}
 else if(m==5){float fb=fbm(p*.018/S);float msk=smoothstep(.5,.78,fb+.3*(1.-lb)-.1)*(.75+.25*hash(floor(p*.7/S)));float ty=step(.5,fbm(p*.011/S+7.));vec3 pc=mix(vec3(.33,.66,.56),vec3(.52,.2,.09),ty)*(.65+.7*vnoise(p*.25/S));
  vec3 so=clamp(mix(vec3(l),o,1.35)*1.08,0.,1.);a=mix(so,pc,msk*.85);h=.45*msk+.35*lb+.15*vnoise(p*.3/S);sp=.25*(1.-msk);sh=10.;rk=2.;}
 else{float wv=.5+.5*sin(p.x*6.2832/(18.*S));float lg=smoothstep(.6,.68,1.-lb);float sc=smoothstep(.93,.99,vnoise(rot(p,.6)*vec2(.04,2.5)/S+3.));
  a=mix(vec3(.72,.7,.68)*(.8+.25*fbm(p*.03/S)),vec3(.07,.06,.06),lg*.95);a=mix(a,vec3(.9),sc*.6);h=wv*.85+lg*.04-sc*.05;sp=.7*(1.-.7*lg);sh=16.;rk=1.2;}`,'u_p1',Q47_LV),
  'approx. look re-creations of Filter Forge library filters from their descriptions / preview renders: Sandpaper (photoman: sandy grain + image emboss, slightly metallic), Tin Can (photoman: image embossed in bright metal), Styrofoam Image (bead texture + emboss), Suede (napped suede tinted by the image), Picture to Plush (image colours on short fibre pile), Patina (copper-green / rust corrosion patches spreading from dark areas), Corrugated Metal (vertical corrugation, dark areas painted as a logo, scratches); single-pass bump lighting');

/* ---------- generated textures ---------- */
f('q47_fftexture','Filter Forge Generated Textures',[S('Texture',['Mulberry Paper','Raked Sand','Thatched','Changeable Taffeta','Sequined']),P('Relief',0,3,1,.01),P('Pattern scale',.25,4,1,.01,'x'),P('Image influence',0,1,.3,.01)],
  Q47_LIT(`int m=int(u_p0+.5);float S=u_p2,im=u_p3;vec3 o=O(q).rgb;float lb=blurL(q,u_k*2.);
 if(m==0){vec3 bc=mix(vec3(.62,.46,.7),o,im*.8);float mt=fbm(p*.02/S);float fib=0.,fc=0.;for(int i=0;i<4;i++){float fi=float(i);vec2 rp=rot(p/S,hash(vec2(fi,3.))*6.28)*vec2(.012,.09)+fi*7.3;float w=abs(vnoise(rp)-.5);float ln=(1.-smoothstep(.0,.02,w))*step(.45,vnoise(rp*vec2(3.,.4)+5.));fib=max(fib,ln);fc+=ln*(fi<2.?1.:-1.);}
  a=bc*(.88+.18*mt)*(1.+.25*clamp(fc,-1.,1.));h=.35*mt+.45*fib;sp=.04;sh=4.;rk=1.5;}
 else if(m==1){float v=p.y/(9.*S)+2.2*fbm(p*.004/S)+im*4.*lb;float st=.5+.5*sin(v*6.2832);float gr=.88+.24*hash(floor(p));a=mix(vec3(.47,.39,.24),vec3(.83,.77,.62),smoothstep(.3,.7,st))*gr;h=st*.8+.1*gr;sp=.03;sh=4.;rk=1.2;}
 else if(m==2){float rh=22.*S;float yy=p.y+8.*S*vnoise(vec2(p.x*.05/S,1.));float row=floor(yy/rh);float t=fract(yy/rh);float st=vnoise(vec2(p.x*.6/S+row*17.,yy*.015/S))*.55+vnoise(vec2(p.x*1.7/S-row*5.,yy*.04/S))*.45;
  h=st*.6+t*.15+im*.5*lb;a=mix(vec3(.2,.14,.08),vec3(.78,.64,.42),clamp(st*1.1+t*.2-.2,0.,1.))*(.85+.3*hash(vec2(floor(p.x*.7/S),row)));sp=.08;sh=6.;rk=1.4;}
 else if(m==3){float fx=p.x/(55.*S)+.5*fbm(vec2(p.x*.012,p.y*.0025)/S);float fo=.5+.5*sin(fx*6.2832);float sn=pow(fo,5.);vec3 c1=mix(vec3(.28,.05,.5),o,im);vec3 c2=mix(vec3(.12,.62,.42),hsv2rgb(vec3(fract(rgb2hsv(o).x+.4),.8,1.)),im);
  a=mix(c1*(.2+.75*fo),c2,sn*.75)*(.92+.08*vnoise(vec2(p.x*.8,p.y*.05)/S));h=fo*.7;sp=.35;sh=18.;rk=1.;}
 else{float R_=11.*S;vec2 g_=p/R_;vec2 ci=floor(vec2(g_.x,g_.y*1.15));float best=-1e9;vec2 bc_=vec2(0.);float bd=9.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));vec2 ce=vec2(cc.x+.5*mod(cc.y,2.),cc.y/1.15)+.5+(hash2(cc)-.5)*.08;float d_=length(g_-ce)/.72;if(d_<1.&&-ce.y>best){best=-ce.y;bc_=ce;bd=d_;}}
  if(best>-1e8){vec2 td=hash2(bc_*3.1)-.5;vec3 sc=mix(vec3(.3,.58,.14),O(fromPX(bc_*R_)).rgb*1.2,im);h=.4*(1.-bd*bd)+.35*dot(g_-bc_,td)+.3;a=sc*(.7+.2*hash(bc_));if(bd<.16){a=vec3(.04,.05,.03);h=.05;}sp=1.;sh=30.;}
  else{a=vec3(.05,.08,.04);h=0.;}rk=1.6;}`,'u_p1','vec3(-.6,.6,.8)'),
  'approx. look re-creations of Filter Forge library filters: Mulberry Paper (Mardar: tinted paper with coloured fibre strands), Raked Sand (tobesedated: two-tone raked ripples, bent by the image), Thatched! (jitspoe: overlapping rows of straw, image adds stick-out), Changeable Taffeta (crispalomino: vertical satin folds whose shadows and sheen show two different colours, from the image when Image influence is up), Sequined (xirja: overlapping tilted sequins with centre holes on dark fabric, coloured from the image); Image influence mixes in the input');

/* ---------- objects ---------- */
f = add('Render');
f('q47_ffobject','Filter Forge Objects',[S('Object',['Lunar Phases','Realistic Vinyl','Wax Seal','Wood Burning','Lathe Custom Profile']),P('Size',.3,1.2,.85,.01),P('Variant',0,1,.35,.01),P('Image mix',0,1,1,.01)],
  Q47_OBJ + Q47_LIT(`int m=int(u_p0+.5);float sz=u_p1,vr=u_p2,im=u_p3;float mn=min(u_res.x,u_res.y)/u_k;vec2 w=(q-.5)*vec2(asp(),1.)/min(asp(),1.)*2./sz;float r=length(w),th=atan(w.y,w.x);rk=sz*mn*.5;
 if(m==0){a=vec3(0.);float stp=hash(floor(p*.5));a+=vec3(step(.996,stp)*hash(floor(p*.5)+3.));if(r<1.){float z=sqrt(1.-r*r);vec3 n=vec3(w,z);float cr=fbm(w*3.+9.);
   vec2 g_=w*5.;vec2 ci=floor(g_);float crt=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));vec2 ce=cc+hash2(cc);float d_=length(g_-ce)/(.15+.3*hash(cc+5.));crt+=d_<1.?(d_*d_-.6):0.;}
   float pt=mix(.62+.25*cr-.25*smoothstep(.5,.6,fbm(w*1.6+2.))+.06*crt,luma(O(Q47IM(w,1.)).rgb),im);float ph=6.2832*vr;vec3 L_=vec3(sin(ph),0.,-cos(ph));float lit=smoothstep(-.06,.12,dot(n,L_));
   a=vec3(pt)*(.03+.97*lit);a+=vec3(.25,.3,.4)*pow(1.-z,4.)*.5;h=z+.012*crt+.01*cr;lm=.5;}
   else{a+=vec3(.25,.3,.45)*.35*exp(-(r-1.)*14.);h=0.;}}
 else if(m==1){a=vec3(.8);h=0.;lm=0.;if(r<1.){float gv=.5+.5*sin(r*700.+3.*vnoise(vec2(r*40.,0.)));float sh_=pow(abs(cos(th-.7)),10.)*.4+pow(abs(cos(th+.5)),40.)*.15;
   a=vec3(.025)+vec3(.05)*gv*step(.35,r)+vec3(sh_)*(.45+.55*gv)*step(.35,r)+vec3(.04)*smoothstep(.97,1.,r);
   if(r<.33){a=mix(hsv2rgb(vec3(vr,.75,.85)),O(Q47IM(w,.33)).rgb,im);a*=.9+.1*(1.-smoothstep(.3,.33,r));}if(r<.025)a=vec3(.8);}}
 else if(m==2){float rr=r+.14*(fbm(w*2.2+4.)-.5);a=vec3(.82);h=0.;if(rr<.92){vec3 wx=hsv2rgb(vec3(vr,.88,.72));float pd=(1.-smoothstep(.7,.92,rr));float ins=(1.-smoothstep(.6,.63,r));float rim=exp(-pow((r-.64)/.035,2.));
   float rel=luma(O(Q47IM(w,.6)).rgb);h=.06*pd+.035*rim+ins*(.035-.02*mix(.5,rel,im));a=wx*(.85-.15*ins);sp=.9;sh=30.;rk*=1.4;}}
 else if(m==3){float rr=r*(1.+.04*sin(3.*th+1.)+.05*(fbm(w*2.+1.)-.5));a=vec3(.94);h=0.;lm=.5;if(rr<.95){float rg=fract(rr*13.+.35*fbm(w*3.));vec3 wd=mix(vec3(.88,.71,.47),vec3(.66,.47,.27),smoothstep(.6,1.,rg))*(.9+.1*vnoise(vec2(th*30.,rr*80.)));
   if(rr>.88)wd=vec3(.32,.2,.11)*(.7+.4*vnoise(vec2(th*40.,rr*20.)));float bn=pow(1.-luma(O(Q47IM(w,.86)).rgb),1.3)*im*(.6+.5*vr)*(1.-smoothstep(.84,.88,rr));a=mix(wd,vec3(.16,.07,.03),clamp(bn,0.,1.));h=.02*(1.-rg)*0.+.01*(1.-smoothstep(.9,.95,rr));}}
 else{float y=w.y;a=vec3(.82);h=0.;if(abs(y)<.9){float rp=.3+(.25+.35*vr)*sqrt(max(1.-y*y*1.1,0.))+.05*cos(y*12.);if(abs(w.x)<rp){float nx=w.x/rp;float z=sqrt(1.-nx*nx);
   vec2 tu=vec2(asin(nx)/3.14159+.5,y/1.8+.5);vec3 tx=mix(vec3(.75),O(tu).rgb,im);float env=.5+.5*sin(nx*5.+1.);a=mix(tx,vec3(env),.25);h=z*rp;sp=.8;sh=20.;}}}`,'1.',Q47_LV.replace('u_p3','135.')),
  'approx. look re-creations of Filter Forge library object filters: Lunar Phases (tigerAspect: moon sphere, the image or a procedural crater texture, Variant = phase 0 new .5 full, blue rim glow, stars), Realistic Vinyl (Inky Bar: black grooved disc with anisotropic sheen and the image or a Variant-hue colour as the label), Wax Seal (Redcap: irregular wax puddle of Variant hue with the image pressed into the stamp), Wood Burning (Revelation: end-grain wood slice with bark, the image burned in, Variant = burn amount), Lathe Custom Profile (ThreeDee: the image wrapped round a lathe-turned vessel, Variant = bulge; fixed profile, no custom selection)');

/* ---------- lightsaber ---------- */
f('q47_lightsaber','Lightsaber Glow (Filter Forge)',[P('Threshold',0,1,.75,.01),P('Glow radius',2,60,16,1,'px'),P('Glow hue',0,360,0,1,'deg'),P('Opacity',0,1,1,.01)],
  [`float m=smoothstep(u_p0-.03,u_p0+.03,luma(O(uv).rgb));return vec4(vec3(m),1.);`,BH('u_p1'),BV('u_p1'),
   `vec3 o=O(uv).rgb;float m=smoothstep(u_p0-.03,u_p0+.03,luma(o));float g=T(uv).r;vec3 gc=hsv2rgb(vec3(u_p2/360.,.9,1.));
   vec3 core=mix(vec3(1.),gc,clamp((1.-g)*1.8,0.,1.)*.85);vec3 col=mix(o,core,m);col=screen(col,gc*clamp(g*2.4,0.,1.)*(1.-m));return vec4(mix(o,col,u_p3),1.);`],
  'approx. re-creation of Filter Forge Lightsaber (Vikram K. Mulligan; "sci-fi laser effect from the selection"): the selection is taken as the pixels brighter than Threshold; they become a white core whose edges take the glow colour (inner glow) and a Gaussian outer glow of Glow radius in that colour is screened around them');
