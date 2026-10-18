/* ================= q21: print & craft simulations, G'MIC map projections II, VapourSynth / AviSynth repair, Fusion tools, Weka feature maps ================= */
/* own function-library wrapper: closes F early, then F -> Q21G */
const Q21_FN = (lib, body) => `return c;}
#define F Q21G
${lib}
vec4 Q21G(vec2 uv){vec4 c=T(uv);${body}`;
const Q21_L = `
#define Q21PI 3.14159265
vec2 q21h2(vec2 p){return vec2(hash(p),hash(p+vec2(17.17,3.31)));}
float q21vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float q21fbm(vec2 p){float sm=0.,a=.5;for(int i=0;i<5;i++){sm+=a*q21vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return sm;}
vec3 q21post(vec3 v,float n){float m=max(floor(n+.5)-1.,1.);return floor(clamp(v,0.,1.)*m+.5)/m;}
mat2 q21rot(float a){float sn=sin(a),cs=cos(a);return mat2(cs,sn,-sn,cs);}
vec3 q21img(vec2 p){return O(fromPX(p)).rgb;}
vec3 q21cell(vec2 ctr,vec2 sz,float n){vec3 a=q21img(ctr+sz*vec2(-.22,-.22))+q21img(ctr+sz*vec2(.22,-.22))+q21img(ctr+sz*vec2(-.22,.22))+q21img(ctr+sz*vec2(.22,.22));return q21post(a*.25,n);}
vec4 q21cmyk(vec3 v){v=clamp(v,0.,1.);float k=1.-max(v.r,max(v.g,v.b));float d=max(1.-k,1e-4);return vec4((1.-v.r-k)/d,(1.-v.g-k)/d,(1.-v.b-k)/d,k);}
`;

/* ---------- bead / stitch / hook crafts ---------- */
f = add('Stylize');
f('q21_beads','Bead, Stitch & Hook Patterns (Perler / Loom / Needlepoint / Latch-hook / Crochet)',
  [S('Pattern',['Perler fuse beads','Loom beadwork','Needlepoint tent stitch','Latch-hook rug','Tapestry crochet']),P('Cell size',4,40,10,1,'px'),P('Colors per channel',2,12,6,1),P('Relief',0,1,.7,.01)],
  Q21_FN(Q21_L,`int md=int(u_p0+.5);float cs=u_p1;float nl=u_p2;float rl=u_p3;vec2 p=PX(uv);vec3 L3=normalize(vec3(-.5,.6,.65));
  vec3 bg=vec3(.93,.92,.89);vec3 o=bg;
  if(md==0){vec2 g=p/cs;vec2 id=floor(g);vec2 q=(fract(g)-.5)*2.;float r=length(q);vec3 col=q21cell((id+.5)*cs,vec2(cs),nl);
   float tb=clamp((r-.63)/.35,-1.,1.);float z=sqrt(max(1.-tb*tb,0.));vec3 n=normalize(vec3(q/max(r,1e-4)*tb*1.3*rl,max(z,.08)));
   float dif=max(dot(n,L3),0.);float sp=pow(max(dot(reflect(-L3,n),vec3(0.,0.,1.)),0.),20.)*.3*rl;
   vec3 bead=col*mix(1.,.3+.85*dif,rl)+sp;float ins=smoothstep(.99,.93,r)*smoothstep(.25,.31,r);
   o=mix(r<.3?bg*mix(1.,.4,rl):bg*mix(1.,.82,rl),bead,ins);}
  else if(md==1){vec2 cz=vec2(cs,cs*.85);vec2 g=p/cz;vec2 id=floor(g);vec2 q=(fract(g)-.5)*2.;vec3 col=q21cell((id+.5)*cz,cz,nl);
   vec2 hb=vec2(.9,.84);float rc=.38;float d=length(max(abs(q)-hb+rc,0.))-rc;float ins=smoothstep(.06,-.04,d);
   vec3 n=normalize(vec3(q.x*.25*rl+(abs(q.x)>hb.x-rc?sign(q.x)*.6*rl*smoothstep(hb.x-rc,hb.x,abs(q.x)):0.),q.y*.95*rl,1.));
   float dif=max(dot(n,L3),0.);float sp=pow(max(dot(reflect(-L3,n),vec3(0.,0.,1.)),0.),28.)*.35*rl;vec3 bead=col*mix(1.,.3+.85*dif,rl)+sp;
   float th=smoothstep(.12,.0,abs(abs(q.x)-1.))*.5+smoothstep(.1,.0,abs(abs(q.y)-1.))*.3;vec3 base=mix(vec3(.2,.19,.18),vec3(.85,.83,.78),th);
   o=mix(base,bead,ins);}
  else if(md==2){vec2 id=floor(p/cs);float best=9.;vec3 bc=bg;float bal=0.,bac=0.;vec2 da=vec2(.70710678),dc=vec2(-.70710678,.70710678);
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 d=p-(cid+.5)*cs;float al=dot(d,da)/(.8*cs),ac=dot(d,dc)/(.36*cs);float e=al*al+ac*ac;
    if(e<best){best=e;bc=q21cell((cid+.5)*cs,vec2(cs),nl);bal=al;bac=ac;}}
   float ins=smoothstep(1.,.85,best);float sh=sqrt(max(1.-bac*bac,0.));float ply=.86+.14*sin((bal*5.5+bac*2.2)*Q21PI);
   vec3 yarn=bc*mix(1.,(.45+.6*sh)*ply,rl);vec2 f=fract(p/cs);float hole=smoothstep(.16,.05,length(min(f,1.-f)));vec3 canv=vec3(.86,.82,.72)*(1.-.7*hole);
   o=mix(canv*mix(1.,.6,rl),yarn,ins);}
  else if(md==3){vec2 id=floor(p/cs);float bh=-1.;vec3 bc=vec3(0.);vec2 bd=vec2(0.);float bs=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 cc=(cid+.5+(q21h2(cid)-.5)*.5)*cs;vec2 d=p-cc;float rr=length(d)/(.95*cs);
    if(rr<1.){float h=(1.-rr*rr)*.6+hash(cid+vec2(5.,9.))*.4;if(h>bh){bh=h;bc=q21cell((cid+.5)*cs,vec2(cs),nl);bd=d;bs=hash(cid+vec2(2.,7.));}}}
   if(bh<0.)o=vec3(.06);else{float an=atan(bd.y,bd.x);float n1=q21vn(vec2(an*7.6+bs*40.,length(bd)/cs*1.3));float n2=q21vn(vec2(an*19.+bs*13.,length(bd)/cs*3.));
    float sh=mix(1.,(.45+.6*bh)*(.7+.25*n1+.15*n2),rl);o=bc*sh*(.96+.08*(bs-.5));}}
  else{vec2 g=p/cs;vec2 id=floor(g);vec2 q=(fract(g)-.5)*2.;q.x+=.22*q.y;vec3 col=q21cell((id+.5)*cs,vec2(cs),nl);
   vec2 a1=vec2(-.78,.6),b1=vec2(.78,.6);vec2 pa=q-a1,ba=b1-a1;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);float dbar=length(pa-ba*hh)/.27;
   vec2 qp=q-vec2(.05,-.25);float dpost=length(qp/vec2(.46,.66));float cov=max(1.-dbar,1.-dpost);
   float sh=dbar<dpost?sqrt(max(1.-dbar*dbar,0.))*(.85+.15*sin(q.x*9.)):sqrt(max(1.-dpost*dpost,0.))*(.8+.2*sin((qp.y*7.-qp.x*4.)));
   vec3 st=col*mix(1.,.35+.75*sh,rl);o=mix(col*mix(1.,.25,rl),st,smoothstep(0.,.12,cov));}
  return vec4(o,1.);`),
  'craft-pattern looks (approx.): the image is averaged per cell and posterised (levels per channel); Perler = ironed fuse beads (ring tube shading, centre hole, pegboard between beads); loom beadwork = aligned cylinder beads, horizontal holes, warp threads in the gaps; needlepoint = slanted tent stitches (half cross) as plied yarn on a canvas mesh; latch-hook = jittered shaggy yarn tufts with radial fibre texture; tapestry crochet = single-crochet stitches (top loop bar + leaning post)');

/* ---------- woven textiles ---------- */
f('q21_weave','Woven Textiles (Jacquard / Tapestry / Ikat)',
  [S('Weave',['Jacquard (satin figure)','Tapestry (weft-faced, hatched)','Ikat (resist-dyed weft)']),P('Thread size',2,20,4,1,'px'),P('Colors (tapestry) or feather (ikat)',2,12,5,1),P('Relief',0,1,.6,.01)],
  Q21_FN(Q21_L,`int md=int(u_p0+.5);float ts=u_p1;float rl=u_p3;vec2 p=PX(uv);vec3 o;
  if(md==0){vec2 id=floor(p/ts);vec2 f=fract(p/ts);vec3 col=q21img((id+.5)*ts);float lm=luma(col);
   #define Q21UP(cid) (luma(q21img(((cid)+.5)*ts))>(mod((cid).x*3.+(cid).y,8.)+.5)/8.)
   bool up=Q21UP(id);vec3 weft=clamp(mix(col,col/max(lm,.2),.55),0.,1.);vec3 warp=vec3(.16,.14,.17);float sh;
   if(up){bool l=Q21UP(id-vec2(1.,0.)),r=Q21UP(id+vec2(1.,0.));sh=sqrt(max(1.-pow(2.*f.y-1.,2.),0.));if(!l)sh*=smoothstep(0.,.3,f.x);if(!r)sh*=smoothstep(1.,.7,f.x);o=weft*mix(1.,.3+.8*sh,rl);}
   else{bool dn=Q21UP(id-vec2(0.,1.)),tp=Q21UP(id+vec2(0.,1.));sh=sqrt(max(1.-pow(2.*f.x-1.,2.),0.));if(dn)sh*=smoothstep(0.,.3,f.y);if(tp)sh*=smoothstep(1.,.7,f.y);o=warp*mix(1.,.5+.9*sh,rl)+vec3(.05)*sh*rl;}}
  else if(md==1){float ws=2.*ts;float j=floor(p.y/ts);float off=mod(j,2.)*ws*.5;float i=floor((p.x+off)/ws);vec2 f=vec2(fract((p.x+off)/ws),fract(p.y/ts));
   vec2 ctr=vec2((i+.5)*ws-off,(j+.5)*ts);float hx=(mod(j,4.)<2.?1.:-1.)*ws*.7;vec3 col=q21post((q21img(ctr+vec2(hx,0.))+q21img(ctr))*.5,u_p2);
   col*=.96+.08*hash(vec2(i,j));float sh=pow(max(1.-pow(2.*f.x-1.,2.),0.),.35)*pow(max(1.-pow(2.*f.y-1.,2.),0.),.5);
   float fib=.9+.1*q21vn(vec2(p.x*1.3/ts,p.y*.3/ts+i*7.));o=col*mix(1.,(.35+.75*sh)*fib,rl);}
  else{float fe=u_p2*ts*.9;float j=floor(p.y/ts);float sh=(hash(vec2(j,3.))-.5)*fe*1.6+(q21vn(vec2(j*.11,5.))-.5)*fe*2.;vec3 a=vec3(0.);
   for(int k=-3;k<=3;k++){float fk=float(k)/3.;a+=q21post(q21img(vec2(p.x+sh+fk*fe*.6,(j+.5)*ts)),4.);}a/=7.;
   vec2 f=fract(p/ts);float chk=mod(floor(p.x/ts)+j,2.);float bump=chk>.5?sqrt(max(1.-pow(2.*f.y-1.,2.),0.)):sqrt(max(1.-pow(2.*f.x-1.,2.),0.))*.8+.2;
   o=a*mix(1.,.45+.65*bump,rl);}
  return vec4(o,1.);`),
  'woven-textile looks (approx.): Jacquard = black warp, image-coloured weft; each thread crossing shows the weft when the luminance beats an 8-shaft satin rank (step 3), so tone becomes satin / twill-like floats with dips where threads change sides; tapestry = weft-faced picks over warp pairs in brick rows, posterised colour with alternating hatching at colour borders; ikat = posterised weft dyed before weaving: each weft thread shifted by a random amount and smeared along its length (feather), on a plain-weave texture');

/* ---------- resist dyeing ---------- */
f('q21_resist','Resist Dyeing (Batik / Tie-dye / Shibori)',
  [S('Style',['Batik (wax crackle)','Tie-dye spiral','Shibori itajime (fold and clamp)','Shibori arashi (pole wrap)','Shibori kumo (spider bind)']),P('Scale',10,300,70,1,'px'),P('Bleed',0,1,.5,.01),P('Dye strength',0,1,.85,.01)],
  Q21_FN(Q21_L,`int md=int(u_p0+.5);float sc=u_p1;float bl=u_p2;float ds=u_p3;vec2 p=PX(uv);vec2 dm=u_res/u_k;
  float wv=.965+.035*sin(p.x*2.1)*sin(p.y*2.1);vec3 cloth=vec3(.95,.93,.88)*wv;vec3 o;
  if(md==0){float rr=1.+bl*4.;vec3 im=(q21img(p)*2.+q21img(p+vec2(rr,0.))+q21img(p-vec2(rr,0.))+q21img(p+vec2(0.,rr))+q21img(p-vec2(0.,rr)))/6.;
   vec3 hd=rgb2hsv(im);hd.x=floor(hd.x*10.+.5)/10.;hd.y=min(q21post(vec3(hd.y),3.).x*.85+.1,1.);hd.z=q21post(vec3(hd.z),4.).x*.9+.1;vec3 dye=hsv2rgb(hd);vec3 base=mix(cloth,cloth*mix(vec3(1.),dye*1.08,1.),ds);
   vec2 w=p/sc*2.5+vec2(q21fbm(p/sc*2.),q21fbm(p/sc*2.+7.))*.8;vec2 id=floor(w);float f1=9.,f2=9.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 pt=cid+q21h2(cid);float d=length(w-pt);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
   float crk=1.-smoothstep(0.,.025+.05*bl,f2-f1);crk*=smoothstep(.25,.75,luma(dye))*(.55+.45*q21vn(w*3.));
   o=mix(base,base*vec3(.25,.22,.3),crk*ds);}
  else if(md==1){vec2 d=p-dm*.5;float r=length(d)/sc;float th=atan(d.y,d.x);float tw=1.6;float sw=th-r*tw*.5;
   vec2 sp=dm*.5+vec2(cos(sw),sin(sw))*length(d);vec3 im=q21img(sp);vec3 hs=rgb2hsv(im);hs.y=min(hs.y*1.6+.15,1.);hs.z=max(hs.z,.35);vec3 dyed=hsv2rgb(hs);
   float nz=(q21fbm(p/sc*1.5)-.5)*(1.+bl*3.);float arm=.5+.5*sin(6.*(th+r*tw)+nz*2.);float wh=smoothstep(.72-bl*.15,.97,arm)*(.6+.4*q21vn(p/sc*4.));
   wh=max(wh,smoothstep(.12+bl*.05,0.,r)*.8);o=mix(cloth,cloth*dyed*1.05,ds*(1.-wh));}
  else{float lm=luma(q21img(p));float dye=ds*(.55+.45*(1.-lm));float R=0.;float nz=(q21fbm(p/sc*5.)-.5)*(.05+bl*.35);
   if(md==2){vec2 q=abs(fract(p/sc)*2.-1.);R=smoothstep(0.,.06+bl*.12,min(q.x,q.y)-.55+nz);R=max(R,(1.-smoothstep(0.,.03+bl*.04,min(q.x,q.y)+nz*.3))*.45);}
   else if(md==3){float a=(p.x+p.y)/sc*9.+(q21fbm(vec2(p.x-p.y,p.x+p.y)/sc*vec2(.6,4.))-.5)*4.;float s1=.5+.5*sin(a);R=smoothstep(.55,.95,s1+nz)*(.5+.5*q21vn(vec2(p.x-p.y,p.x+p.y)/sc*vec2(.5,3.)));
    R=max(R,smoothstep(.97,1.,.5+.5*sin((p.x-p.y)/sc*1.3+nz*3.))*.6);}
   else{vec2 g=p/sc;vec2 id=floor(g);float bd=9.;vec2 bv=vec2(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 pt=cid+.5+(q21h2(cid)-.5)*.5;vec2 dd=g-pt;float d=length(dd);if(d<bd){bd=d;bv=dd;}}
    float an=atan(bv.y,bv.x);float web=smoothstep(.6,.95,abs(cos(an*7.+bd*6.+nz*8.)));float rim=smoothstep(.42,.3,bd+nz);R=web*rim*(.4+.6*smoothstep(.0,.3,bd))+smoothstep(.07,.02,bd+nz*.2);}
   R=clamp(R,0.,1.);float a=dye*(1.-R);vec3 mid=vec3(.2,.34,.58),deep=vec3(.05,.1,.24);o=mix(cloth,mid,smoothstep(0.,.5,a));o=mix(o,deep,smoothstep(.45,1.,a));o*=wv;}
  return vec4(o,1.);`),
  'resist-dye looks (approx.): batik = image posterised into dye baths on cotton, wax crackle veins (warped Voronoi cell borders) dyed dark in the waxed (lighter) areas; tie-dye = the image swirled into a spiral and saturated, with white fold-resist arms bleeding into the dye; shibori = indigo vat dye whose depth follows the image darkness, with itajime (mirrored fold grid + clamped squares), arashi (pole-wrapped diagonal pleats) or kumo (bound spider-web circles) resist patterns and capillary bleed');

/* ---------- print processes ---------- */
f('q21_print','Print Processes (Gravure / Letterpress / Flexo / Inkjet / Laser / Gocco / Dye-sub)',
  [S('Process',['Rotogravure cells','Letterpress (squeeze + impression)','Flexographic halo / dot gain','Inkjet banding','Laser toner scatter','Gocco screen print','Dye-sublimation']),P('Screen',2,20,6,.5,'px'),P('Ink spread',0,1,.5,.01),P('Defects',0,1,.5,.01)],
  Q21_FN(Q21_L+`
#define Q21IC vec3(.1,.68,.94)
#define Q21IM vec3(.94,.18,.56)
#define Q21IY vec3(1.,.92,.08)
#define Q21IK vec3(.13,.13,.15)
vec3 q21ink(int ch){return ch==0?Q21IC:ch==1?Q21IM:ch==2?Q21IY:Q21IK;}
float q21ang(int ch){return ch==0?.2618:ch==1?1.309:ch==2?0.:.7854;}
float q21ht(vec2 p,float ang,float sc,int ch,float gain,out float tn){mat2 Rm=q21rot(ang);vec2 u=(Rm*p)/sc;vec2 cc=floor(u)+.5;
 vec3 im=O(fromPX(transpose(Rm)*(cc*sc))).rgb;tn=ch<0?1.-luma(im):q21cmyk(im)[ch];vec2 f=fract(u)-.5;float v=.5-.25*(cos(6.2831853*f.x)+cos(6.2831853*f.y));
 float g=.25*6.2831853*length(vec2(sin(6.2831853*f.x),sin(6.2831853*f.y)))/sc;return (tn-v)/max(g,.15/sc)+gain;}
`,`int md=int(u_p0+.5);float sc=u_p1;float sp=u_p2;float df=u_p3;vec2 p=PX(uv);float aw=.6/u_k;vec3 paper=vec3(.97,.96,.93);vec3 o=paper;
  if(md==0){for(int ch=0;ch<4;ch++){mat2 Rm=q21rot(q21ang(ch));vec2 u=(Rm*p)/sc;vec2 cc=floor(u)+.5;vec3 im=O(fromPX(transpose(Rm)*(cc*sc))).rgb;float tn=q21cmyk(im)[ch];
    vec2 f=abs(fract(u)-.5);float hw=.5-(.07+.12*(1.-tn))*(1.-sp*.7);float rc=.12;float d=(length(max(f-hw+rc,0.))-rc)*sc;float cov=smoothstep(aw,-aw,d);
    float miss=hash(cc+float(ch)*13.)<df*.12*(1.-tn)?0.:1.;float dens=tn*(.9+.2*hash(cc*1.7+float(ch)))*miss;
    float flow=mix(cov,1.,sp*.35*smoothstep(.2,.8,tn));o*=mix(vec3(1.),q21ink(ch),clamp(dens*flow,0.,1.));}}
  else if(md==1){float tn;float sd=q21ht(p,.7854,sc,-1,sp*sc*.06,tn);float cov=smoothstep(-aw,aw,sd);float d1,d2,d3,d4;
   float e=max(sc*.12,1.);float cx1=smoothstep(-e,e,q21ht(p+vec2(e,0.),.7854,sc,-1,sp*sc*.06,d1)),cx0=smoothstep(-e,e,q21ht(p-vec2(e,0.),.7854,sc,-1,sp*sc*.06,d2));
   float cy1=smoothstep(-e,e,q21ht(p+vec2(0.,e),.7854,sc,-1,sp*sc*.06,d3)),cy0=smoothstep(-e,e,q21ht(p-vec2(0.,e),.7854,sc,-1,sp*sc*.06,d4));
   float rim=1.-smoothstep(0.,sc*.18*(.4+sp),sd);float mot=q21fbm(p*.35)*df;float dens=cov*clamp(mix(.72,1.,rim)-.35*mot+.1,0.,1.);
   vec2 gr=vec2(cx1-cx0,cy1-cy0);float imp=dot(gr,normalize(vec2(-1.,1.)))*.22;vec3 pp=vec3(.95,.92,.85)*(.97+.03*q21vn(p*.8))*(1.-imp);
   o=mix(pp,vec3(.09,.09,.12),dens);}
  else if(md==2){for(int ch=0;ch<4;ch++){float tn;float sd=q21ht(p,q21ang(ch),sc,ch,sp*sc*.12,tn);float cov=smoothstep(-aw,aw,sd);
    float ring=exp(-pow(sd/(sc*.09+.4),2.));float halo=.35*exp(-pow((sd+sc*.12)/(sc*.05+.4),2.))*step(.02,tn);
    float dens=clamp(cov*(.62+.38*ring)+halo*(.5+.5*df),0.,1.);if(hash(floor(p*.7)+float(ch))<df*.02*tn)dens=1.;o*=mix(vec3(1.),q21ink(ch),dens);}}
  else if(md==3){float dp=max(sc*.22,.7);vec2 id=floor(p/dp);float bh=sc*6.;float bi=floor(p.y/bh);
   for(int ch=0;ch<4;ch++){float fc=float(ch);float tn=q21cmyk(q21img((id+.5)*dp))[ch];
    float gn=1.+df*(.5*(hash(vec2(bi,fc+3.))-.5)+.18*sin(p.y/bh*6.2831853+fc));tn=clamp(tn*gn,0.,1.);if(hash(vec2(id.y,fc+9.))<df*.05)tn=0.;
    vec2 jt=(q21h2(id+fc*7.)-.5)*.4;float d=length(fract(p/dp)-.5-jt);float drop=smoothstep(.62+sp*.25,.5+sp*.2,d)*step(hash(id+vec2(fc*31.,fc*17.)),tn);
    o*=mix(vec3(1.),q21ink(ch),drop*.92);}}
  else if(md==4){for(int ch=0;ch<4;ch++){float tn;float sd=q21ht(p,q21ang(ch)+.1,sc,ch,sp*sc*.05,tn);float dens=smoothstep(-aw,aw,sd);vec2 gp=floor(p*1.3);
    for(int k=0;k<3;k++){vec2 jo=(q21h2(gp+float(k*5+ch*17))-.5)*2.*sc*(.25+.75*sp);float t2;float s2=q21ht(p+jo,q21ang(ch)+.1,sc,ch,0.,t2);
     if(s2>0.&&hash(gp*1.31+float(k+ch*3))<.05+.25*df)dens=max(dens,.85);}
    o*=mix(vec3(1.),q21ink(ch),dens*.95);}o=mix(o,o*o,.12);}
  else if(md==5){float ms=max(sc*.35,1.2);for(int ch=0;ch<3;ch++){float fc=float(ch);vec2 sh=vec2(cos(fc*2.1),sin(fc*2.1))*df*sc*.5;float rr=sp*sc*.3;
    vec3 a=(q21img(p+sh)*2.+q21img(p+sh+vec2(rr,0.))+q21img(p+sh-vec2(rr,0.))+q21img(p+sh+vec2(0.,rr))+q21img(p+sh-vec2(0.,rr)))/6.;
    vec3 hq=rgb2hsv(a);hq.x=floor(hq.x*8.+.5)/8.;hq.y=min(q21post(vec3(hq.y),3.).x*.9+.1,1.);hq.z=q21post(vec3(hq.z),5.).x*.94+.03;float v=hsv2rgb(hq)[ch];float ink=1.-v;float th=.95+.2*(q21fbm(p*.04+fc*5.)-.5);float mesh=.93+.07*sin(p.x*6.2831853/ms)*sin(p.y*6.2831853/ms);
    float gap=q21fbm(p*.25+fc*9.)>1.-df*.3?.45:1.;vec3 tr=vec3(1.);tr[ch]=1.-clamp(ink*th*mesh*gap,0.,1.)*.96;o*=tr;}}
  else{float rr=.5+sp*1.5;vec3 s=vec3(0.);for(int ch=0;ch<3;ch++){vec2 sh=vec2(0.,(float(ch)-1.)*df*.6);
    vec3 a=(q21img(p+sh)*4.+q21img(p+sh+vec2(rr,0.))+q21img(p+sh-vec2(rr,0.))+q21img(p+sh+vec2(0.,rr))+q21img(p+sh-vec2(0.,rr)))/8.;s[ch]=a[ch];}
   vec3 hs=rgb2hsv(s);hs.y=min(hs.y*1.12,1.);s=hsv2rgb(hs);s=pow(s,vec3(1.06))*vec3(1.02,1.,.97);float ln=1.-df*.04*hash(vec2(floor(p.y*u_k),1.))-df*.03*step(.985,hash(vec2(floor(p.y/sc),4.)));
   o=(.02+.97*s)*ln+.015;}
  return vec4(clamp(o,0.,1.),1.);`),
  'print-process looks (approx.): CMYK (GCR) separations at 15/75/0/45 deg; gravure = rotated screens of square engraved cells, ink density = tone (variable depth) with walls that thin in the shadows and missing dots in highlights; letterpress = single-ink halftone with ink squeeze (dark rims, starved mottled interior) and a debossed paper impression; flexo = dot gain plus the doughnut halo (heavy rim, light centre, faint outer ring); inkjet = stochastic drops with per-pass density banding and dead-nozzle lines; laser = AM halftone with toner specks scattered near printed dots; Gocco = a few flat spot inks (hue / saturation / value quantised) with mesh texture, uneven thickness, misregistration and skips; dye-sub = continuous tone, slight dye diffusion, panel misregistration and faint head lines');

/* ---------- map projections II (G'MIC Map Projection category) ---------- */
f = add('Distort');
f('q21_mapproj2','Map Projections II (conic / azimuthal / Eckert / G\'MIC)',
  [S('Projection',['Albers equal-area conic','Azimuthal equidistant','Equidistant conic','Cylindrical equal-area (std parallel)','Eckert IV','Eckert VI','Lambert azimuthal equal-area','Lambert conformal conic','Triangular (GMIC naive)']),
   P('Central meridian',-180,180,0,1,'°'),P('Parallel 1 or centre latitude',-85,85,30,1,'°'),P('Parallel 2 or pole width',-85,85,60,1,'°')],
  Q21_FN(Q21_L+`
vec2 q21cone(int t,float p1,float p2){float n,K;
 if(t==0){n=(sin(p1)+sin(p2))*.5;if(abs(n)<1e-3)n=1e-3;K=cos(p1)*cos(p1)+2.*n*sin(p1);}
 else if(t==2){n=abs(p2-p1)<1e-3?sin(p1):(cos(p1)-cos(p2))/(p2-p1);if(abs(n)<1e-3)n=1e-3;K=cos(p1)/n+p1;}
 else{float t1=tan(Q21PI*.25+p1*.5),t2=tan(Q21PI*.25+p2*.5);n=abs(p2-p1)<1e-3?sin(p1):log(cos(p1)/cos(p2))/log(t2/t1);if(abs(n)<1e-3)n=1e-3;K=cos(p1)*pow(t1,n)/n;}
 return vec2(n,K);}
float q21rho(int t,vec2 nk,float ph){if(t==0)return sqrt(max(nk.y-2.*nk.x*sin(ph),0.))/nk.x;if(t==2)return nk.y-ph;return nk.y*pow(max(tan(Q21PI*.25+ph*.5),1e-6),-nk.x);}
vec2 q21cfwd(int t,vec2 nk,float la,float ph){float r=q21rho(t,nk,ph);float th=nk.x*la;return vec2(r*sin(th),-r*cos(th));}
`,`int pj=int(u_p0+.5);float l0=radians(u_p1);float p1=radians(u_p2),p2=radians(u_p3);vec2 dm=u_res/u_k;vec4 bb;vec2 ll;bool ok=true;bool az=false;
  int ct=pj==0?0:pj==2?2:7;bool cone=pj==0||pj==2||pj==7;vec2 nk=vec2(0.);float pmin=-Q21PI*.5,pmax=Q21PI*.5;
  if(cone){nk=q21cone(ct,p1,p2);if(ct==7){if(nk.x>0.)pmin=-radians(80.);else pmax=radians(80.);}
   bb=vec4(1e9,1e9,-1e9,-1e9);for(int i=0;i<=24;i++){float fi=float(i)/24.;float ph=mix(pmin,pmax,fi);float la=(fi*2.-1.)*Q21PI;
    vec2 a=q21cfwd(ct,nk,Q21PI,ph),b=q21cfwd(ct,nk,-Q21PI,ph),e=q21cfwd(ct,nk,la,pmin),g=q21cfwd(ct,nk,la,pmax),h=q21cfwd(ct,nk,0.,ph);
    bb.xy=min(bb.xy,min(min(a,b),min(min(e,g),h)));bb.zw=max(bb.zw,max(max(a,b),max(max(e,g),h)));}}
  else if(pj==1)bb=vec4(-Q21PI,-Q21PI,Q21PI,Q21PI);else if(pj==6)bb=vec4(-2.,-2.,2.,2.);
  else if(pj==3){float cs=cos(p1);bb=vec4(-Q21PI*cs,-1./cs,Q21PI*cs,1./cs);}
  else if(pj==4){float xm=4.*Q21PI/sqrt(Q21PI*(4.+Q21PI)),ym=2.*sqrt(Q21PI/(4.+Q21PI));bb=vec4(-xm,-ym,xm,ym);}
  else if(pj==5){float xm=2.*Q21PI/sqrt(2.+Q21PI),ym=Q21PI/sqrt(2.+Q21PI);bb=vec4(-xm,-ym,xm,ym);}
  else bb=vec4(-Q21PI,-Q21PI*.5,Q21PI,Q21PI*.5);
  vec2 bs=bb.zw-bb.xy;float s=min(dm.x/bs.x,dm.y/bs.y);vec2 xy=(PX(uv)-dm*.5)/s+(bb.xy+bb.zw)*.5;float X=xy.x,Y=xy.y;
  if(cone){float sg=nk.x<0.?-1.:1.;float r=sg*length(xy);float th=atan(sg*X,-sg*Y);float la=th/nk.x;float ph;
   if(ct==0){float a=(nk.y-r*r*nk.x*nk.x)/(2.*nk.x);ok=abs(a)<=1.;ph=asin(clamp(a,-1.,1.));}else if(ct==2)ph=nk.y-r;else ph=2.*atan(pow(max(nk.y/r,0.),1./nk.x))-Q21PI*.5;
   ok=ok&&abs(la)<=Q21PI&&ph>=pmin-1e-4&&ph<=pmax+1e-4;ll=vec2(la,ph);}
  else if(pj==1||pj==6){az=true;float r=length(xy);float cc=pj==6?2.*asin(min(r*.5,1.)):r;ok=pj==6?r<=2.:r<=Q21PI;
   if(r<1e-6)ll=vec2(l0,p1);else ll=vec2(l0+atan(X*sin(cc),r*cos(p1)*cos(cc)-Y*sin(p1)*sin(cc)),asin(clamp(cos(cc)*sin(p1)+Y*sin(cc)*cos(p1)/r,-1.,1.)));}
  else if(pj==3){float cs=cos(p1);float a=Y*cs;ok=abs(a)<=1.&&abs(X/cs)<=Q21PI;ll=vec2(X/cs,asin(clamp(a,-1.,1.)));}
  else if(pj==4){float a=Y/(2.*sqrt(Q21PI/(4.+Q21PI)));ok=abs(a)<=1.;float th=asin(clamp(a,-1.,1.));float la=X/(2./sqrt(Q21PI*(4.+Q21PI))*(1.+cos(th)));
   ll=vec2(la,asin(clamp((th+sin(th)*cos(th)+2.*sin(th))/(2.+Q21PI*.5),-1.,1.)));ok=ok&&abs(la)<=Q21PI;}
  else if(pj==5){float th=Y*sqrt(2.+Q21PI)*.5;ok=abs(th)<=Q21PI*.5;float la=X*sqrt(2.+Q21PI)/(1.+cos(th));ll=vec2(la,asin(clamp((th+sin(th))/(1.+Q21PI*.5),-1.,1.)));ok=ok&&abs(la)<=Q21PI;}
  else{float pw=clamp(abs(u_p3)/90.,0.,1.);float sq=mix(pw,1.,1.-abs(Y)/(Q21PI*.5));float la=X/max(sq,1e-4);ok=abs(la)<=Q21PI&&abs(Y)<=Q21PI*.5;ll=vec2(la,Y);}
  if(!ok)return vec4(0.,0.,0.,1.);if(!az)ll.x+=l0;
  vec2 q=vec2(fract(ll.x/(2.*Q21PI)+.5),clamp(ll.y/Q21PI+.5,0.,1.));return vec4(T(q).rgb,1.);`),
  'forward map projections with the image taken as an equirectangular (plate carree) world map, fitted uniformly into the frame (outside the map = black), Snyder 1987 formulas inverted per pixel: Albers equal-area conic, equidistant conic and Lambert conformal conic on the two standard parallels (LCC cut at 80 deg toward the far pole); azimuthal equidistant and Lambert azimuthal equal-area centred on (central meridian, centre latitude); cylindrical equal-area with the given standard parallel (30 = Behrmann, 45 = Gall-Peters); Eckert IV and VI; G\'MIC Triangular Projection (Jarventaus): naive linear row squeeze to the pole width (Parallel 2 / 90; 0.5 = Eckert I-like). Orthographic and sinusoidal: see Map Projections (mapproj)');

f('q21_eqrotate','Rotate Equirectangular Map (G\'MIC)',
  [P('Roll',-360,360,0,1,'°'),P('Pitch (north-south)',-360,360,30,1,'°'),P('Yaw (east-west)',-360,360,0,1,'°'),S('Revert rotations',['No','Yes'])],
  `float al=-radians(u_p0),be=-radians(u_p1),ga=-radians(u_p2);float ot=3.14159265+uv.x*6.2831853,op=(1.-uv.y)*3.14159265;
  float cx=sin(op)*cos(ot),cy=sin(op)*sin(ot),cz=cos(op);float rx,ry,rz;
  if(u_p3<.5){rz=cz*cos(al)*cos(be)+cy*(cos(al)*sin(be)*sin(ga)-sin(al)*cos(ga))+cx*(cos(al)*sin(be)*cos(ga)+sin(al)*sin(ga));
   ry=cz*sin(al)*cos(be)+cy*(sin(al)*sin(be)*sin(ga)+cos(al)*cos(ga))+cx*(sin(al)*sin(be)*cos(ga)-cos(al)*sin(ga));
   rx=-cz*sin(be)+cy*cos(be)*sin(ga)+cx*cos(be)*cos(ga);}
  else{float a=-al,b2=-be,g=-ga;rz=cz*cos(a)*cos(b2)-cy*sin(a)*cos(b2)+cx*sin(b2);
   ry=cz*(sin(b2)*sin(g)*cos(a)+sin(a)*cos(g))+cy*(-sin(a)*sin(b2)*sin(g)+cos(a)*cos(g))-cx*sin(g)*cos(b2);
   rx=cz*(sin(a)*sin(g)-sin(b2)*cos(a)*cos(g))+cy*(sin(g)*cos(a)+sin(a)*sin(b2)*cos(g))+cx*cos(b2)*cos(g);}
  float nt=atan(ry,rx);float np=acos(clamp(rz/max(length(vec3(rx,ry,rz)),1e-6),-1.,1.));
  return vec4(T(vec2(fract(nt/6.2831853+.5),1.-np/3.14159265)).rgb,1.);`,
  'G\'MIC rotate_equirectangular_map (Kristian Jarventaus) ported exactly: each output pixel -> unit-sphere point (theta = pi + 2 pi x/w, phi = pi y/h) -> roll / pitch / yaw rotation matrix (or its reverse) -> back to equirectangular coordinates');

/* ---------- VapourSynth / AviSynth: halo removal ---------- */
const Q21_MB = (nm, smp) => `
vec3 ${nm}(vec2 q){vec3 x=${smp}(q).rgb;vec3 bl=vec3(0.);float ws=0.;
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float wx=i==0?4.:abs(i)==1?3.:1.;float wy=j==0?4.:abs(j)==1?3.:1.;bl+=${smp}(q+vec2(float(i),float(j))*u_px).rgb*wx*wy;ws+=wx*wy;}bl/=ws;
 vec3 p0=${smp}(q+vec2(-1.,-1.)*u_px).rgb,p1=${smp}(q+vec2(0.,-1.)*u_px).rgb,p2=${smp}(q+vec2(1.,-1.)*u_px).rgb,p3=${smp}(q+vec2(-1.,0.)*u_px).rgb,p4=x,
  p5=${smp}(q+vec2(1.,0.)*u_px).rgb,p6=${smp}(q+vec2(-1.,1.)*u_px).rgb,p7=${smp}(q+vec2(0.,1.)*u_px).rgb,p8=${smp}(q+vec2(1.,1.)*u_px).rgb;
 Q21S(p1,p2);Q21S(p4,p5);Q21S(p7,p8);Q21S(p0,p1);Q21S(p3,p4);Q21S(p6,p7);Q21S(p1,p2);Q21S(p4,p5);Q21S(p7,p8);Q21S(p0,p3);Q21S(p5,p8);Q21S(p4,p7);Q21S(p3,p6);Q21S(p1,p4);Q21S(p2,p5);Q21S(p4,p7);Q21S(p4,p2);Q21S(p6,p4);Q21S(p4,p2);
 vec3 o;for(int k=0;k<3;k++){float a=x[k],yb=bl[k],zm=p4[k];o[k]=(a-yb)*(a-zm)<0.?a:(abs(a-yb)<abs(a-zm)?yb:zm);}return o;}
vec3 ${nm}B(vec2 q){vec3 a=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?2.:1.)*(j==0?2.:1.);a+=${nm}(q+vec2(float(i),float(j))*u_px)*w;}return a/16.;}
`;
const Q21_SORT = `
#define Q21S(pa,pb) {vec3 tq=min(pa,pb);pb=max(pa,pb);pa=tq;}
`;
f = add('Repair');
f('q21_halo','Halo Removal II (YAHR / BlindDeHalo3 / EdgeCleaner)',
  [S('Method',['YAHR','BlindDeHalo3','EdgeCleaner']),P('Radius (BlindDeHalo3)',1,6,3,.1,'px'),P('Strength',0,2,1,.01),S('Output',['Cleaned','Difference x4'])],
  [`int md=int(u_p0+.5);if(md==1)return blur1d(u_tex,uv,vec2(1.,0.),R(1.2*u_p1));vec2 g=sobel(uv);return vec4(vec3(clamp(length(g)*1.5,0.,1.)),1.);`,
   `int md=int(u_p0+.5);if(md==1)return blur1d(u_tex,uv,vec2(0.,1.),R(1.2*u_p1));return vec4(vec3(blurL(uv,1.)),1.);`,
   `int md=int(u_p0+.5);if(md==1)return c;float dep=md==0?32.*u_p2:5.*u_p2;
   vec2 d=vec2(T(uv-vec2(u_px.x,0.)).r-T(uv+vec2(u_px.x,0.)).r,T(uv-vec2(0.,u_px.y)).r-T(uv+vec2(0.,u_px.y)).r)*dep*.12;float l=length(d);if(l>3.)d*=3./l;
   return vec4(O(uv+d*u_px).rgb,1.);`,
   Q21_FN(Q21_SORT+Q21_MB('q21mbt','T'),`int md=int(u_p0+.5);if(md==1)return c;
   if(md==0){vec3 w1=c.rgb;return vec4(w1-q21mbtB(uv)+.5,1.);}
   vec3 mn=vec3(1.),mx=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 v=O(uv+vec2(float(i),float(j))*u_px).rgb;mn=min(mn,v);mx=max(mx,v);}return vec4(clamp(c.rgb,mn,mx),1.);`),
   Q21_FN(Q21_SORT+Q21_MB('q21mbo','O'),`int md=int(u_p0+.5);vec3 src=O(uv).rgb;vec3 o;
   if(md==0){vec3 b1D=src-q21mboB(uv);vec3 mn=vec3(9.),mx=vec3(-9.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 v=T(uv+vec2(float(i),float(j))*u_px).rgb-.5;mn=min(mn,v);mx=max(mx,v);}
    vec3 DD=clamp(b1D,mn,mx);o=src-(b1D-DD);}
   else if(md==1){float Y=luma(src);float rng=0.;float mxl=0.,mnl=1.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float v=luma(T(uv+vec2(float(i),float(j))*R(u_p1)*u_px).rgb);mxl=max(mxl,v);mnl=min(mnl,v);}
    float mm=clamp((mxl-mnl)*4.,0.,1.);float d=(Y-luma(c.rgb))*255.;float ST=1.25*u_p2;float tw=abs(d)*ST*u_p1/12.;float A=tw+(128.-tw)*tw/128.;
    float h=d==0.?0.:sign(d)*A/255.;o=src-vec3(h*mm);}
   else{float acc=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;vec2 p=u_px;
     float gx=luma(O(q+vec2(p.x,p.y)).rgb)+luma(O(q+vec2(p.x,0.)).rgb)+luma(O(q+vec2(p.x,-p.y)).rgb)-luma(O(q+vec2(-p.x,p.y)).rgb)-luma(O(q+vec2(-p.x,0.)).rgb)-luma(O(q+vec2(-p.x,-p.y)).rgb);
     float gy=luma(O(q+vec2(-p.x,p.y)).rgb)+luma(O(q+vec2(0.,p.y)).rgb)+luma(O(q+p).rgb)-luma(O(q-p).rgb)-luma(O(q+vec2(0.,-p.y)).rgb)-luma(O(q+vec2(p.x,-p.y)).rgb);
     float v=length(vec2(gx,gy))*255.;v=v<4.?0.:(v>32.?255.:v);acc+=1.-v/255.;}
    o=mix(src,c.rgb,acc/9.);}
   if(u_p3>.5)return vec4(.5+(o-src)*4.,1.);return vec4(clamp(o,0.,1.),1.);`)],
  'single-frame ports (approx.) of the AviSynth / VapourSynth dehalo scripts, per RGB channel: YAHR (Didee) = clp - (b1D - repair(b1D, w1b1D)) with b1 = MinBlur(r=2) + [1 2 1] (3x3 median stands in for the 5x5 CTMF) and w1 = an aWarpSharp2-style warp (Sobel mask, 5x5 blur, depth 32 x Strength) - repair approximated by the 3x3 min/max clamp; BlindDeHalo3 (Didee 2005) = blurred copy (Gaussian ~ the rx down/up-size), TWK_HLIGHT curve h = TWK + (128 - TWK) TWK / 128 with TWK = |x - blur| strength rx / 12 (lodamp = hidamp = 0) subtracted from luma, masked by 4 x the local range of the blur; EdgeCleaner = AWarpSharp2(depth = strength / 2) repaired to the source 3x3 range, merged through the inverted, levelled (4..32) Prewitt mask box-blurred 3x3');

/* ---------- Vinverse / SangNom2 ---------- */
const Q21_ELA = (smp, ax, perp) => `vec3 q21ela(vec2 q){vec3 bv=vec3(0.);float bc=1e9;
 for(int k=-3;k<=3;k++){float fk=float(k);float cst=0.;for(int j=-1;j<=1;j++){float fj=float(j);
   cst+=abs(luma(${smp}(q+(${ax})*(fk+fj)*u_px+(${perp})*u_px).rgb)-luma(${smp}(q-(${ax})*(fk-fj)*u_px-(${perp})*u_px).rgb));}
  cst+=abs(fk)*.01;if(cst<bc){bc=cst;bv=(${smp}(q+(${ax})*fk*u_px+(${perp})*u_px).rgb+${smp}(q-(${ax})*fk*u_px-(${perp})*u_px).rgb)*.5;}}return bv;}`;
f('q21_combfix','Vinverse / SangNom2 (comb and aliasing repair)',
  [S('Mode',['Vinverse','Vinverse2','SangNom2 (field re-interpolation)','SangNom2 anti-aliasing (rows + columns)']),P('Contra-sharpening (sstr)',0,5,2.7,.05),P('Opposite-sign scale (scl)',0,1,.25,.01),S('Field kept',['Top (even rows)','Bottom (odd rows)'])],
  [Q21_FN(Q21_ELA('O','vec2(1.,0.)','vec2(0.,1.)')+`
vec3 q21s(vec2 uv,float k){return O(uv+vec2(0.,k*u_px.y)).rgb;}
vec3 q21b3(vec2 uv,float k){return (q21s(uv,k-1.)+2.*q21s(uv,k)+q21s(uv,k+1.))*.25;}
vec3 q21D(vec2 uv,float k){return q21s(uv,k)-q21b3(uv,k);}
vec3 q21sbr(vec2 uv,float k){vec3 sv=q21s(uv,k);vec3 D=q21D(uv,k);vec3 Db=(q21D(uv,k-1.)+2.*D+q21D(uv,k+1.))*.25;vec3 o;
 for(int i=0;i<3;i++){float t1=D[i]-Db[i];float t2=D[i];o[i]=t1*t2<0.?sv[i]:(abs(t1)<abs(t2)?sv[i]-t1:sv[i]-t2);}return o;}
`,`int md=int(u_p0+.5);vec3 sv=O(uv).rgb;
  if(md>=2){float row=u_res.y-1.-floor(uv.y*u_res.y);if(mod(row,2.)==u_p3)return vec4(sv,1.);return vec4(q21ela(uv),1.);}
  vec3 pb3,pb6;if(md==0){pb3=q21b3(uv,0.);pb6=(q21b3(uv,-2.)+4.*q21b3(uv,-1.)+6.*pb3+4.*q21b3(uv,1.)+q21b3(uv,2.))/16.;}
  else{pb3=q21sbr(uv,0.);pb6=(q21sbr(uv,-1.)+2.*pb3+q21sbr(uv,1.))*.25;}
  vec3 o;for(int i=0;i<3;i++){float d1=sv[i]-pb3[i];float y2=(pb3[i]-pb6[i])*u_p1;float da=abs(d1)<abs(y2)?d1:y2;o[i]=pb3[i]+(d1*y2<0.?da*u_p2:da);}
  return vec4(clamp(o,0.,1.),1.);`),
   Q21_FN(Q21_ELA('T','vec2(0.,1.)','vec2(1.,0.)'),`int md=int(u_p0+.5);if(md!=3)return c;float col=floor(uv.x*u_res.x);if(mod(col,2.)==u_p3)return c;return vec4(q21ela(uv),1.);`)],
  'Vinverse (tritical / Didee, VS port by HolyWu / Asd-g) exactly per RGB channel: pb3 = vertical [1 2 1], pb6 = [1 4 6 4 1] of pb3; d1 = src - pb3, d2 = (pb3 - pb6) x sstr; out = pb3 + (the smaller-magnitude of d1, d2; x scl when they disagree in sign); Vinverse2 uses the vertical sbr (blur-difference highpass) instead of pb3. SangNom2 (approx.): the other field is dropped and re-interpolated by edge-directed averaging (best of 7 directions by 3-pixel SAD); AA mode repeats it on columns');

f('q21_msmooth','MSmooth (masked smoother, tritical)',
  [P('Threshold',1,60,15,1),P('Strength (iterations)',1,8,3,1),S('Output',['Smoothed','Edge mask'])],
  [Q21_FN(`
float q21bl(vec2 q){float a=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)a+=luma(O(q+vec2(float(i),float(j))*u_px).rgb);return a/9.;}
`,`vec2 p=u_px;float m=max(max(abs(q21bl(uv+vec2(p.x,0.))-q21bl(uv-vec2(p.x,0.))),abs(q21bl(uv+vec2(0.,p.y))-q21bl(uv-vec2(0.,p.y)))),max(abs(q21bl(uv+p)-q21bl(uv-p)),abs(q21bl(uv+vec2(p.x,-p.y))-q21bl(uv-vec2(p.x,-p.y)))));return vec4(c.rgb,m*255.>u_p0?1.:0.);`)]
  .concat([1,2,3,4,5,6,7,8].map(k=>`if(${k}.>u_p1+.01||c.a>.5)return c;vec3 a=vec3(0.);float w=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 v=T(uv+vec2(float(i),float(j))*u_px);if(v.a<.5){a+=v.rgb;w+=1.;}}return vec4(a/max(w,1.),c.a);`))
  .concat([`if(u_p2>.5)return vec4(vec3(c.a),1.);return vec4(c.rgb,1.);`]),
  'MSmooth (AviSynth, tritical) single-frame: edge mask = 3x3-box-blurred luma differs across the pixel (4 directions) by more than Threshold (8-bit); non-edge pixels are replaced Strength times by the mean of their non-edge 3x3 neighbours, so smoothing never crosses detected edges (approx. of the original mask / blur iteration)');

/* ---------- FFT3DFilter (single frame) ---------- */
f = add('Noise');
f('q21_fft3d','FFT3DFilter (2D Wiener, single frame)',
  [P('Sigma',0,12,3,.1),P('Beta',1,4,1,.05),P('Sharpen',0,1,0,.01),S('Output',['Denoised','Removed noise x4'])],
  [`vec2 pw=floor(uv*u_res);float sg=u_p0/255.;float lo=(u_p1-1.)/u_p1;vec4 res=vec4(0.);
  for(int g=0;g<4;g++){vec2 o=vec2((g==1||g==3)?8.:0.,g>=2?8.:0.);vec2 b=floor((pw-o)/16.)*16.+o;vec2 k=pw-b;float C=0.,Sn=0.;
   for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 n=vec2(float(i),float(j));float v=luma(O(clamp((b+n+.5)/u_res,vec2(0.),vec2(1.))).rgb);float a=6.2831853*dot(k,n)/16.;C+=v*cos(a);Sn+=v*sin(a);}
   C/=16.;Sn/=16.;float P=C*C+Sn*Sn;float w=max((P-sg*sg)/max(P,1e-12),lo);vec2 kf=mod(k+8.,16.)-8.;w*=1.+u_p2*1.5*(1.-exp(-dot(kf,kf)/18.));res[g]=w*(C+Sn);}
  return res;`,
   `vec2 pw=floor(uv*u_res);float y=0.,ws=0.;
  for(int g=0;g<4;g++){vec2 o=vec2((g==1||g==3)?8.:0.,g>=2?8.:0.);vec2 b=floor((pw-o)/16.)*16.+o;if(b.x<0.||b.y<0.||b.x+16.>u_res.x||b.y+16.>u_res.y)continue;vec2 n=pw-b;float xs=0.;
   for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 kk=vec2(float(i),float(j));float a=6.2831853*dot(kk,n)/16.;xs+=T((b+kk+.5)/u_res)[g]*(cos(a)+sin(a));}
   xs/=16.;float wx=sin(3.14159265*(n.x+.5)/16.),wy=sin(3.14159265*(n.y+.5)/16.);float w=wx*wx*wy*wy;y+=w*xs;ws+=w;}
  vec3 src=O(uv).rgb;float y0=luma(src);float yn=ws>1e-4?y/ws:y0;vec3 o=src+(yn-y0);if(u_p3>.5)return vec4(vec3(.5+(y0-yn)*4.),1.);return vec4(clamp(o,0.,1.),1.);`],
  'FFT3DFilter (Fizick) bt=1 mode, one frame, luma only: 16x16 blocks with 50% overlap (4 shifted grids), per-block 2D DFT computed as a Hartley transform (|F|^2 = C^2 + S^2), Wiener factor max((|F|^2 - sigma^2) / |F|^2, (beta - 1) / beta) with sigma in 8-bit units, optional high-frequency sharpen gain, inverse transform and sin^2 window overlap-add; chroma untouched; pixels within 8 px of the right / top border may stay unfiltered');

/* ---------- Fusion tools ---------- */
f = add('Blur');
f('q21_variblur','VariBlur (Fusion)',
  [P('Blur size',1,40,12,.5,'px'),S('Blur channel',['Luma','Inverted luma','Vertical gradient','Radial (centre sharp)']),S('Method',['Soften (Gaussian)','Box'])],
  [`float m=u_p1<.5?luma(O(uv).rgb):u_p1<1.5?1.-luma(O(uv).rgb):u_p1<2.5?1.-uv.y:clamp(length((uv-.5)*vec2(asp(),1.))*1.6,0.,1.);float r=R(u_p0*m);
   if(r<.5)return vec4(O(uv).rgb,m);float st=max(1.,r/16.);vec3 a=vec3(0.);float w=0.;for(int i=-16;i<=16;i++){float x=float(i)*st;if(abs(x)>r)continue;float g=u_p2<.5?exp(-2.*x*x/(r*r)):1.;a+=O(uv+vec2(x,0.)*u_px).rgb*g;w+=g;}return vec4(a/w,m);`,
   `float m=c.a;float r=R(u_p0*m);if(r<.5)return vec4(c.rgb,1.);float st=max(1.,r/16.);vec3 a=vec3(0.);float w=0.;for(int i=-16;i<=16;i++){float x=float(i)*st;if(abs(x)>r)continue;float g=u_p2<.5?exp(-2.*x*x/(r*r)):1.;a+=T(uv+vec2(0.,x)*u_px).rgb*g;w+=g;}return vec4(a/w,1.);`],
  'Fusion VariBlur (approx.): per-pixel blur radius = Blur size x the chosen blur channel (0 = sharp, 1 = full size), separable Gaussian (soften) or box with the radius of the pixel being written in each pass');

f = add('Distort');
f('q21_dent','Dent (Fusion)',
  [S('Type',['Dent 1 (bulge)','Kaleidoscope','Dent 2 (displace)','Dent 3 (deform)','Cosine dent','Sine dent']),P('Size',.05,1,.4,.01),P('Strength',-1,1,.5,.01)],
  `int ty=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 d=(uv-.5)*a;float r=length(d)/u_p1;if(r>=1.)return c;float an=atan(d.y,d.x);float s=u_p2;float r2=r;
  if(ty==0)r2=pow(r,1.+s*.9);
  else if(ty==1){float seg=6.2831853/6.;an=mod(an,seg);an=min(an,seg-an);r2=1.-pow(1.-r,1.+s*.9);}
  else if(ty==2)r2=r-s*.25*sin(3.14159265*r);
  else if(ty==3)an+=s*3.14159265*(1.-r)*(1.-r);
  else if(ty==4){an+=s*.25*cos(an*12.)*(1.-r);r2=r+s*.08*cos(r*25.)*(1.-r);}
  else r2=r-s*.18*sin(3.14159265*r)*sin(3.14159265*r);
  vec2 q=vec2(cos(an),sin(an))*r2*u_p1/a+.5;return T(clamp(q,0.,1.));`,
  'Fusion Dent (approx.: the exact Fusion warp curves are undocumented): a circular warp of the given size around the frame centre; Dent 1 = power-law bulge / pinch, Kaleidoscope = 6-way mirrored angle with an inverted dent, Dent 2 = sinusoidal radial displacement, Dent 3 = swirl-like deform growing toward the centre, Cosine dent = angular fracture creases toward the centre, Sine dent = smooth rounded sine-squared dent');

f = add('Render');
f('q21_daysky','Day Sky (Fusion, Preetham)',
  [P('Time (solar hours)',4,20,15,.05,'h'),P('Latitude',-70,70,40,1,'°'),P('Day of year',1,365,172,1),P('Turbidity',2,10,3,.1)],
  Q21_FN(`
float q21pz(float th,float gm,float A,float B,float C2,float D2,float E){return (1.+A*exp(B/max(cos(th),.01)))*(1.+C2*exp(D2*gm)+E*cos(gm)*cos(gm));}
`,`float T2=u_p3;float lat=radians(u_p1);float J=u_p2;float dec=.4093*sin(6.2831853*(J-81.)/368.);float ha=3.14159265*u_p0/12.;
  float se=sin(lat)*sin(dec)-cos(lat)*cos(dec)*cos(ha);float ths=acos(clamp(se,-1.,1.));float phs=atan(-cos(dec)*sin(ha),-(cos(lat)*sin(dec)-sin(lat)*cos(dec)*cos(ha)));
  float night=smoothstep(-.1,.05,se);float ts=min(ths,1.5533);
  float az=(uv.x-.5)*6.2831853;float el=uv.y*1.5707963;float th=1.5707963-el;vec3 v=vec3(cos(el)*cos(az),cos(el)*sin(az),sin(el));vec3 sv=vec3(sin(ts)*cos(phs),sin(ts)*sin(phs),cos(ts));
  float gm=acos(clamp(dot(v,sv),-1.,1.));
  float chi=(4./9.-T2/120.)*(3.14159265-2.*ts);float Yz=(4.0453*T2-4.971)*tan(chi)-.2155*T2+2.4192;
  float t3=ts*ts*ts,t2=ts*ts;float xz=T2*T2*(.00166*t3-.00375*t2+.00209*ts)+T2*(-.02903*t3+.06377*t2-.03202*ts+.00394)+(.11693*t3-.21196*t2+.06052*ts+.25886);
  float yz=T2*T2*(.00275*t3-.0061*t2+.00317*ts)+T2*(-.04214*t3+.0897*t2-.04153*ts+.00516)+(.15346*t3-.26756*t2+.0667*ts+.26688);
  float Y=Yz*q21pz(th,gm,.1787*T2-1.463,-.3554*T2+.4275,-.0227*T2+5.3251,.1206*T2-2.5771,-.067*T2+.3703)/q21pz(0.,ts,.1787*T2-1.463,-.3554*T2+.4275,-.0227*T2+5.3251,.1206*T2-2.5771,-.067*T2+.3703);
  float xc=xz*q21pz(th,gm,-.0193*T2-.2592,-.0665*T2+.0008,-.0004*T2+.2125,-.0641*T2-.8989,-.0033*T2+.0452)/q21pz(0.,ts,-.0193*T2-.2592,-.0665*T2+.0008,-.0004*T2+.2125,-.0641*T2-.8989,-.0033*T2+.0452);
  float yc=yz*q21pz(th,gm,-.0167*T2-.2608,-.095*T2+.0092,-.0079*T2+.2102,-.0441*T2-1.6537,-.0109*T2+.0529)/q21pz(0.,ts,-.0167*T2-.2608,-.095*T2+.0092,-.0079*T2+.2102,-.0441*T2-1.6537,-.0109*T2+.0529);
  vec3 XYZ=vec3(xc*Y/max(yc,1e-4),Y,(1.-xc-yc)*Y/max(yc,1e-4));vec3 rgb=mat3(3.2406,-.9689,.0557,-1.5372,1.8758,-.204,-.4986,.0415,1.057)*XYZ;
  rgb=max(rgb/max(Yz,.05),0.)*night;rgb+=vec3(30.,26.,20.)*smoothstep(.0105,.0085,gm)*night;rgb=1.-exp(-rgb*.6);
  return vec4(pow(rgb,vec3(1./2.2)),1.);`),
  'Fusion Day Sky (approx.; generator, input ignored): Preetham, Shirley & Smits 1999 analytic daylight with the Perez distribution in Yxy for the given turbidity, sun position from latitude, day of year and solar time (declination 0.4093 sin(2 pi (J - 81) / 368)), rendered as a lat-long of the upper hemisphere (azimuth across, horizon at the bottom, zenith at the top) with a sun disk, exposure-tone-mapped 1 - exp(-k Y / Yzenith); the sky fades out with the sun below the horizon');

f = add('Color');
f('q21_ultrakeyer','Ultra Keyer (Fusion)',
  [S('Screen',['Green','Blue']),P('Clip black',0,1,.15,.01),P('Clip white',0,1,.75,.01),S('Output',['Composite on grey','Matte','Despilled foreground'])],
  `vec3 s=O(uv).rgb;bool gr=u_p0<.5;float mxd=.05;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 v=O((vec2(float(i),float(j))+.5)/12.).rgb;mxd=max(mxd,gr?v.g-max(v.r,v.b):v.b-max(v.r,v.g));}
  float df=gr?s.g-max(s.r,s.b):s.b-max(s.r,s.g);float ar=1.-max(df,0.)/mxd;float al=clamp((ar-u_p1)/max(u_p2-u_p1,.01),0.,1.);
  vec3 fg=s;if(gr)fg.g=min(fg.g,max(fg.r,fg.b));else fg.b=min(fg.b,max(fg.r,fg.g));
  if(u_p3>1.5)return vec4(fg*al,1.);if(u_p3>.5)return vec4(vec3(al),1.);return vec4(mix(vec3(.45),fg,al),1.);`,
  'Fusion Ultra Keyer core (approx.): colour-difference matte (screen channel minus the larger other channel), normalised by the strongest screen difference found on a 12x12 grid of the frame, with clip black / clip white matte levels; screen-colour despill limits the screen channel to the larger other channel; composite over grey, matte or premultiplied despilled foreground');

f = add('Depth');
f('q21_ztoworld','Z to World Position (Fusion)',
  [P('Vertical FOV',10,120,50,1,'°'),P('Near',.1,10,1,.1),P('Far',1,100,10,.5),S('Output',['World position (XYZ as RGB)','Distance','Normals from position'])],
  `float th=tan(radians(u_p0)*.5);float a=asp();float fr=max(u_p2,u_p1+.01);
  #define Q21WP(q) (vec3(((q).x-.5)*2.*th*a,((q).y-.5)*2.*th,-1.)*(u_p1+(1.-D(q))*(fr-u_p1)))
  vec3 P=Q21WP(uv);if(u_p3<.5)return vec4(.5+.5*P.x/(fr*th*a),.5+.5*P.y/(fr*th),-P.z/fr,1.);
  if(u_p3<1.5)return vec4(vec3(clamp(length(P)/(fr*sqrt(1.+th*th*(1.+a*a))),0.,1.)),1.);
  vec3 dx=Q21WP(uv+vec2(3.*u_px.x,0.))-Q21WP(uv-vec2(3.*u_px.x,0.)),dy=Q21WP(uv+vec2(0.,3.*u_px.y))-Q21WP(uv-vec2(0.,3.*u_px.y));vec3 n=normalize(cross(dx,dy));return vec4(n*.5+.5,1.);`,
  'Fusion Z to World Pos (approx.): the depth map (1 = near) is taken as linear camera distance between Near and Far, each pixel is unprojected through a pinhole camera of the given vertical FOV at the origin looking down -Z: position shown as RGB (X, Y scaled to the far frustum, -Z / Far), Euclidean distance, or the normal from the cross product of the position derivatives');

/* ---------- Weka trainable segmentation features ---------- */
f = add('Sensor');
f('q21_membrane','Membrane Projections (Weka)',
  [S('Projection',['Sum (shown /30)','Mean','Std dev','Median','Max','Min']),P('Patch size',5,31,19,2,'px'),P('Std dev gain',.5,10,4,.1)],
  `int pj=int(u_p0+.5);float hl=floor(u_p1*.5);float v[30];float sm=0.,s2=0.,mx=-1.,mn=2.;
  for(int a=0;a<30;a++){float an=radians(6.*float(a));vec2 d=vec2(sin(an),cos(an))*R(1.)*u_px;float s=0.;
   for(int t=-15;t<=15;t++){if(abs(float(t))>hl)continue;s+=luma(O(uv+d*float(t)).rgb);}s/=2.*hl+1.;v[a]=s;sm+=s;s2+=s*s;mx=max(mx,s);mn=min(mn,s);}
  float o;if(pj<=1)o=sm/30.;else if(pj==2)o=sqrt(max(s2/30.-sm*sm/900.,0.))*u_p2;else if(pj==4)o=mx;else if(pj==5)o=mn;
  else{for(int i=1;i<30;i++){float k=v[i];int j=i-1;for(int q=0;q<30;q++){if(j<0||v[j]<=k)break;v[j+1]=v[j];j--;}v[j+1]=k;}o=.5*(v[14]+v[15]);}
  return vec4(vec3(clamp(o,0.,1.)),1.);`,
  'Trainable Weka Segmentation membrane projections: a patch-size line kernel (thickness 1, normalised by its length) rotated in 30 steps of 6 deg is correlated with the luminance, and the 30 responses are projected per pixel as sum, mean, standard deviation, median, max or min (Weka default patch 19)');

f('q21_lipschitz','Lipschitz Filter (Weka)',
  [S('Output',['Downhill cover','Uphill cover','Downhill top-hat','Uphill top-hat']),P('Slope',1,50,10,1),P('Top-hat gain',1,10,3,.1)],
  [`int md=int(u_p0+.5);bool dn=md==0||md==2;vec3 f=O(uv).rgb;return vec4(dn?f:1.-f,1.);`]
  .concat([32,16,8,4,2,1,2,1].map(k=>`float s=u_p1/255./u_k*${k}.;vec3 m=c.rgb;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;float l=(i!=0&&j!=0)?1.41421356:1.;m=max(m,T(uv+vec2(float(i),float(j))*${k}.*u_px).rgb-s*l);}return vec4(m,1.);`))
  .concat([`int md=int(u_p0+.5);vec3 f=O(uv).rgb;vec3 G=c.rgb;vec3 o;if(md==0)o=G;else if(md==1)o=1.-G;else if(md==2)o=(G-f)*u_p2;else o=(f-(1.-G))*u_p2;return vec4(clamp(o,0.,1.),1.);`]),
  'Trainable Weka Segmentation Lipschitz filter (Stencel): Lipschitz cover with the given slope (8-bit levels per pixel, diagonal slope x sqrt 2): downhill = upper cover max over y of f(y) - slope d(x, y), uphill = lower cover; top-hat = cover minus image (shown x gain); approx.: the two raster sweeps of the original are replaced by jump propagation (steps 32..1, 2, 1), per RGB channel');
