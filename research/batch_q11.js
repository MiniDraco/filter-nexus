/* ================= q11: Filter Forge frames, AviSynth+ plugins 2, Forensically maps, Corel Painter (rounds 12-14) ================= */
const Q11_FR = `
#define Q11BOX(pp,hh,rc) (length(max(abs(pp)-(hh)+(rc),0.))+min(max(abs(pp).x-(hh).x+(rc),abs(pp).y-(hh).y+(rc)),0.)-(rc))
vec2 A=vec2(asp(),1.);vec2 q=uv*A;vec2 cq=q-A*.5;vec2 e2=min(q,A-q);float dist=min(e2.x,e2.y);int m=int(u_p0+.5);float W=u_p1;float aa=1.5/u_res.y;`;

/* ---------- Filter Forge frames I: paper, board and inset frames ---------- */
f = add('Frames');
f('q11_ff_paperframes','Filter Forge Paper & Board Frames',[S('Style',['Ragged and Torn','Paper Art Frame','Picture Matte','Inset Frame in Blurred Background','Picture on an old wooden board','Tacky Tape','Wanted Poster','Emulsion Transfer']),P('Frame width',.02,.25,.08,.005),P('Roughness',0,1,.6,.01),P('Texture',0,1,.5,.01)],
 [BH('22.'),BV('22.'),
  Q11_FR + `float RO=u_p2,TX=u_p3;vec3 img=O(uv).rgb;vec3 o=img;float n2=fbm(q*40.+7.);float gr=hash(floor(PX(uv)))-.5;
 if(m==0){vec2 hh=A*.5-vec2(W);float tn=(fbm(q*14.)-.5)*W*.9*RO+(n2-.5)*W*.25*RO;float d=Q11BOX(cq,hh,.02)+tn;
  vec2 qs=q-vec2(.014,-.014);float ds=Q11BOX(qs-A*.5,hh,.02)+(fbm(qs*14.)-.5)*W*.9*RO;float sh=(1.-smoothstep(-.02,.035,ds))*.5;
  float band=W*(.06+.12*n2*RO);vec3 paper=vec3(.97,.965,.94)*(1.-.06*TX*fbm(q*120.));
  vec3 bg=vec3(1.)*(1.-sh);vec3 inside=mix(paper,img,smoothstep(-band,-band-aa,d));o=mix(inside,bg,smoothstep(-aa,aa,d));}
 else if(m==1){float pt=fbm(q*70.);float em=fbm(q*70.+vec2(.004,.004))-pt;o=img*(.9+.14*pt*TX)+em*1.2*TX+gr*.03*TX;o=mix(o,vec3(luma(o)),.12);
  float t=dist+(fbm(q*12.)-.5)*W*RO+(n2-.5)*W*.3*RO;vec3 paper=vec3(.96,.955,.93)*(.93+.07*pt);o=mix(paper,o,smoothstep(W*.55,W*.95,t));}
 else if(m==2){float s=1.-2.*W*1.2;vec2 hh=A*.5*s;float d=Q11BOX(cq,hh,0.);float bev=.008+.02*RO;
  vec3 mat=vec3(.9,.88,.83)*(1.+(n2-.5)*.18*TX+gr*.04*TX);
  if(d<0.)o=O(cq/(A*s)+.5).rgb;else if(d<bev){vec2 ad=abs(cq)-hh;bool vert=ad.x>ad.y;float lit=vert?(cq.x<0.?1.08:.8):(cq.y>0.?1.1:.78);o=vec3(.97,.96,.92)*lit;}
  else{o=mat;float od=dist;o*=mix(.7,1.,smoothstep(0.,.006,od));}
  o=mix(o,o*.75,smoothstep(bev+.012,bev,d)*step(bev,d)*.6);}
 else if(m==3){float vg=smoothstep(.3,.9,length(cq/A)*1.4);vec3 bg=T(uv).rgb*(1.-.5*vg*TX);float s=1.-2.*W*2.;vec2 hh=A*.5*s;float mw=W*.35,fw=W*.22;
  float d=Q11BOX(cq,hh,0.);float df=Q11BOX(cq,hh+mw+fw,.01+.04*RO);float dsh=Q11BOX(cq-vec2(.01,-.012),hh+mw+fw,.01+.04*RO);
  o=bg*(1.-.45*(1.-smoothstep(-.01,.04,dsh)));vec3 frc=vec3(.08)*(1.+(fbm(q*30.)-.5)*TX)+.02;
  if(df<0.)o=mix(frc,vec3(.98),step(d,mw));if(d<0.)o=O(cq/(A*s)+.5).rgb;}
 else if(m==4){float pl=floor(q.y*6.);float gy=fract(q.y*6.);vec2 wq=vec2(q.x*1.3+hash(vec2(pl,3.))*9.,q.y*6.);float rings=sin((wq.y*14.+fbm(wq*vec2(1.2,4.))*7.+wq.x*.6)*6.2832)*.5+.5;
  float grain=fbm(vec2(wq.x*3.,wq.y*60.));vec3 wood=mix(vec3(.36,.26,.17),vec3(.62,.52,.4),.5*rings+.5*grain);wood=mix(wood,vec3(luma(wood))*.95,.35*TX);
  wood*=1.-.6*smoothstep(.035,0.,min(gy,1.-gy));wood*=.85+.3*fbm(q*5.);
  float s=1.-2.*W*2.2;vec2 hh=A*.5*s;float mw=W*.25;float d=Q11BOX(cq,hh,0.);float dm=Q11BOX(cq,hh+mw,0.);float dsh=Q11BOX(cq-vec2(.008,-.01),hh+mw,0.);
  o=wood*(1.-.5*(1.-smoothstep(-.005,.03,dsh)));if(dm<0.)o=vec3(.95,.94,.9);if(d<0.)o=O(cq/(A*s)+.5).rgb;
  vec2 ac=hh+mw-abs(cq);float cor=step(ac.x+ac.y,W*1.6*(.4+RO))*step(dm,0.);o=mix(o,o*.72+vec3(.08,.06,.04),cor*.85);}
 else if(m==5){float s=1.-2.*W*1.8;vec2 hh=A*.5*s;float d=Q11BOX(cq,hh,0.);o=vec3(.04)+gr*.02;if(d<0.)o=O(cq/(A*s)+.5).rgb;
  for(int k=0;k<3;k++){float fk=float(k);vec2 cen=k==0?vec2(-hh.x,hh.y):k==1?vec2(hh.x,-hh.y):vec2(hh.x*.9,hh.y);float ang=k==0?.75:k==1?.7:-.6;
   vec2 lp=rot(cq-cen,ang);float len=.11+.06*hash1(fk+2.),wd=.035+.012*hash1(fk+5.);float teeth=abs(fract(lp.y*90.)-.5)*.008*(.5+RO);
   float inb=step(abs(lp.y),wd)*step(abs(lp.x),len-teeth);float bub=step(vnoise(lp*160.+fk*7.),.18*TX);vec3 tape=vec3(.9,.9,.86);
   o=mix(o,mix(o,tape,.55)+bub*.12,inb);o=mix(o,o*.8,inb*smoothstep(wd*.7,wd,abs(lp.y)));}}
 else if(m==6){float n1=fbm(q*4.);vec3 par=mix(vec3(.88,.74,.5),vec3(.7,.5,.28),n1*.9+.1*TX*n2);par*=1.-.25*TX*smoothstep(.55,.8,fbm(q*9.+3.));
  float tb=dist+(fbm(q*9.)-.5)*W*.8*RO;par=mix(vec3(.08,.04,.02),par,smoothstep(W*.12,W*.6,tb));par=mix(par*vec3(.6,.4,.25),par,smoothstep(W*.4,W*.9,tb));
  float d=Q11BOX(cq,A*.5-vec2(W*1.8),0.)+(fbm(q*11.+5.)-.5)*W*.9*RO+(n2-.5)*W*.2;vec3 sep=mix(img,vec3(dot(img,vec3(.393,.769,.189)),dot(img,vec3(.349,.686,.168)),dot(img,vec3(.272,.534,.131))),.35);
  o=mix(mix(sep,vec3(.95,.88,.72),smoothstep(-W*.12,-W*.04,d)),par,smoothstep(-aa,aa,d));}
 else{float d=Q11BOX(cq,A*.5-vec2(W),.01)+(fbm(q*5.)-.5)*W*.9*RO+(fbm(q*30.)-.5)*W*.25;vec3 em=mix(img,vec3(1.),.1);em=mix(vec3(luma(em)),em,.85);
  float rd=1.-abs(fbm(q*6.+2.)*2.-1.);em*=1.-.22*TX*smoothstep(.86,.97,rd);em+=.08*TX*smoothstep(.75,.86,rd)*step(rd,.86);
  vec3 paper=vec3(.97,.965,.95)*(1.-.04*fbm(q*90.));float lip=smoothstep(-W*.08,0.,d)*step(d,0.);em=mix(em,em*.6,lip);o=mix(em,paper,smoothstep(-aa,aa,d));}
 return vec4(clamp(o,0.,1.),1.);`],
 'Filter Forge library frames (approx. procedural re-creations from the filter descriptions and previews): Ragged and Torn (image as a torn paper rag with fibrous white edge and drop shadow on white), Paper Art Frame (fine embossed paper grain over the image, torn whitened border), Picture Matte (image scaled into a textured mat board with a lit 45-degree bevel), Inset Frame in Blurred Background (Google "Awesome" style: smaller copy with white mat and dark frame over a blurred vignetted full-size copy), Picture on an old wooden board (weathered planks, white-bordered print with translucent photo corners), Tacky Tape (print on black held by three translucent tape strips with torn teeth and bubbles), Wanted Poster (aged parchment with burnt edges, image in a torn opening, sepia cast), Emulsion Transfer (lifted Polaroid emulsion: wavy edge, wrinkles, washed colours, on paper)',1);

/* ---------- Filter Forge frames II: textured / patterned border bands over the image ---------- */
f('q11_ff_textureframes','Filter Forge Texture Frames',[S('Style',['Rocky Edge Frame','Grunge Drip Frames','Speckled Vignette','Halftone Frame','Confetti Frame','Broken Window','Dragon scales frame','Lacy Framed','Smooth to crinkled','Op Art Frame']),P('Frame width',.02,.25,.09,.005),P('Roughness',0,1,.6,.01),P('Pattern scale',.5,2,1,.01)],
 Q11_FR + `float RO=u_p2,SC=u_p3;vec3 img=c.rgb;vec3 o=img;
 if(m==0){float t=dist+(fbm(q*6./SC)-.5)*W*.9*RO+(fbm(q*30./SC)-.5)*W*.15;vec2 g=q*16./SC;vec2 ig=floor(g);float md=9.,md2=9.;vec2 bc=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ig+vec2(float(i),float(j));float dd=length(g-cc-hash2(cc));if(dd<md){md2=md;md=dd;bc=cc;}else if(dd<md2)md2=dd;}
  float h=fbm(q*40./SC);float hx=fbm((q+vec2(.002,0.))*40./SC),hy=fbm((q+vec2(0.,.002))*40./SC);float sh=.75+2.5*((h-hx)+(hy-h))+.3*(1.-md);
  vec3 rock=mix(vec3(.72,.58,.42),vec3(.42,.3,.32),hash(bc))*mix(1.,.55,smoothstep(.06,0.,md2-md))*sh;rock=mix(rock,vec3(.55,.35,.25)*sh,.4*smoothstep(.6,.7,fbm(q*8./SC)));
  o=mix(rock,img,smoothstep(W-aa,W+aa,t));o=mix(vec3(0.),o,smoothstep(W*.12,W*.2,t));}
 else if(m==1){float col=floor(q.x*55./SC);float hl=hash(vec2(col,1.));float L=W*(.5+2.5*hl*hl*hl)*(.5+RO);float top=A.y-q.y;float wob=(vnoise(vec2(q.x*55./SC,3.))-.5)*.3;
  float dr=step(top,L)*step(abs(fract(q.x*55./SC)-.5+wob*.5),.12+.14*hl)*step(.5,hash(vec2(col,2.)));float dtip=length(vec2((fract(q.x*55./SC)-.5)*.02*SC,top-L));dr=max(dr,step(dtip,.004*SC*(.5+hl))*step(.5,hash(vec2(col,2.))));
  float gm=1.-smoothstep(W*.3,W,dist+(fbm(q*8./SC)-.5)*W*1.2*RO);float msk=max(gm,dr*.95);vec3 dk=vec3(.07,.08,.06)*(.5+fbm(q*30./SC));
  o=img*(.82+.3*fbm(q*18./SC));o=mix(o,dk,msk);}
 else if(m==2){float d=Q11BOX(cq,A*.5-vec2(W),W*.7);float base=smoothstep(-W*.9,W*.25,d+(fbm(q*5.)-.5)*W*.5*RO);vec2 sq=rot(q,.5)*vec2(1.,1.+2.*RO);float sp=vnoise(sq*90./SC)*.6+vnoise(sq*25./SC)*.4;
  float msk=smoothstep(sp-.06,sp+.06,base*1.15-.05);o=mix(img,vec3(0.),msk);}
 else if(m==3){float t=clamp(1.-dist/W,0.,1.);float cell=.022*SC;vec2 g=q/cell;float row=floor(g.y);g.x+=.5*mod(row,2.);vec2 fq=fract(g)-.5;
  float rad=.74*pow(t,.85)+(hash(floor(g))-.5)*.15*RO*t;float dt=smoothstep(rad+.04,rad-.04,length(fq));o=mix(img,vec3(.97),max(dt,step(.995,t)));}
 else if(m==4){float d=Q11BOX(cq,A*.5-vec2(W),.03);float band=smoothstep(-aa,aa,d+(fbm(q*7.)-.5)*.01);
  vec3 bg=mix(mix(vec3(1.,.75,.85),vec3(1.,.95,.6),fbm(q*4.)),vec3(.6,.9,1.),smoothstep(.45,.7,fbm(q*3.+9.)));
  float cell=.03*SC;vec2 g=q/cell;vec2 ig=floor(g);float h=hash(ig);vec2 lp=rot(fract(g)-.5-(hash2(ig+3.)-.5)*.3,h*6.2832*RO);float sz=.12+.2*hash(ig+5.);
  float chance=smoothstep(0.,W,W-dist)*.9+.15;float sq=step(max(abs(lp.x),abs(lp.y)),sz)*step(hash(ig+8.),chance);
  float hc=hash(ig+11.);vec3 cc=hc<.2?vec3(.95,.25,.45):hc<.4?vec3(.2,.6,.95):hc<.6?vec3(.98,.8,.15):hc<.8?vec3(.45,.85,.35):vec3(.7,.4,.9);
  vec3 fr=mix(bg,cc*(.75+.5*hash(ig+13.)),sq);o=mix(img,fr,band);}
 else if(m==5){float dd=dist+(fbm(q*4./SC)-.5)*W*1.3*RO;float msk=1.-smoothstep(W*.35,W*1.35,dd);float st=fbm(rot(q,.6)*vec2(4.,40.)/SC);
  vec3 pc=mix(vec3(.94,.96,.78),vec3(.72,.84,.62),st);pc=mix(pc,vec3(.98,.9,.75),smoothstep(.55,.75,fbm(q*6./SC+4.)));vec3 im=mix(img,vec3(luma(img)),.25)*.9+.08;
  o=mix(im,pc,clamp(msk*(.55+.6*st),0.,1.));}
 else if(m==6){float t=dist+(fbm(q*7./SC)-.5)*W*.8*RO;vec2 g=q/(.055*SC);vec3 sc=vec3(0.);float got=0.;
  for(int j=0;j<3;j++){float ry=floor(g.y)+float(j);float off=.5*mod(ry,2.);float cx=floor(g.x+off)+.5-off;
   for(int i=-1;i<=1;i++){vec2 cen=vec2(cx+float(i),ry);vec2 dp=g-cen;float rr=length(dp*vec2(1.,1.1))/.62;if(dp.y<=.05&&rr<1.){float gl=pow(1.-rr,.6);vec3 gc=mix(vec3(.45,.3,.08),vec3(1.,.85,.45),gl)*(.85+.3*hash(cen));gc=mix(gc,vec3(.25,.15,.03),smoothstep(.82,.98,rr));sc=gc;got=1.;}}}
  sc=mix(vec3(.3,.2,.05),sc,got);o=mix(sc,img,smoothstep(W-aa,W+aa,t));o=mix(o,o*.55,smoothstep(W+.012,W,t)*step(W,t));}
 else if(m==7){float v=sin((q.x+q.y)*18./SC+fbm(q*5./SC)*9.)*.5+.5;vec3 mb=stops5(vec3(.35,.25,.18),vec3(.75,.62,.45),vec3(.95,.92,.82),vec3(.55,.55,.58),vec3(.25,.22,.25),fract(v+fbm(q*2.)*.3));
  float lw=W*.16;o=dist<W?mb:img;o=mix(o,vec3(.18,.12,.08),step(abs(dist-W-lw*.5),lw*.5));o=mix(o,mix(o,vec3(.96),.5),step(abs(dist-W*.55),W*.04)*step(dist,W));}
 else if(m==8){float t=dist+(fbm(q*5.)-.5)*W*.5;float hf=mix(fbm(q*6./SC),1.-abs(2.*fbm(q*14./SC)-1.),RO);float e=.0015;
  float hx=mix(fbm((q+vec2(e,0.))*6./SC),1.-abs(2.*fbm((q+vec2(e,0.))*14./SC)-1.),RO),hy=mix(fbm((q+vec2(0.,e))*6./SC),1.-abs(2.*fbm((q+vec2(0.,e))*14./SC)-1.),RO);
  vec3 nn=normalize(vec3((hf-hx)*30.,(hf-hy)*30.,1.));float dif=max(dot(nn,normalize(vec3(-.5,.6,.7))),0.);float spc=pow(max(reflect(-normalize(vec3(-.5,.6,.7)),nn).z,0.),16.);
  vec3 foil=vec3(.72,.72,.75)*(.35+.75*dif)+spc*.6;foil=mix(foil,O(uv+nn.xy*.03).rgb*(.4+.8*dif),.25);o=mix(foil,img,smoothstep(W-aa,W+aa,t));o=mix(vec3(.1),o,smoothstep(W*.08,W*.12,dist));}
 else{float u=dist;bool hz=e2.y<e2.x;float v=hz?q.x:q.y;float mw=W*.18;
  if(u<mw)o=vec3(0.);else if(u<W*.82){float pv=sin(((u-mw)*90.+sin(v*28./SC)*3.*(.3+RO))/SC);float pv2=sin(v*60./SC+(u-mw)*40.);float b=step(0.,pv*(.6+.4*pv2));o=vec3(b);}
  else if(u<W)o=step(.5,fract((u-W*.82)/(W*.18)*4.))>.5?vec3(.85):vec3(.15);}
 return vec4(clamp(o,0.,1.),1.);`,
 'Filter Forge library frames (approx. procedural re-creations from the filter descriptions and previews), drawn over the image: Rocky Edge Frame (Voronoi stones, lit bump, sandstone to agate, black rim, jagged inner edge), Grunge Drip Frames (dark grunge border with per-column drips from the top), Speckled Vignette (rounded vignette broken up by stretched speckle noise), Halftone Frame (dot screen whose dots grow toward the edge until they merge), Confetti Frame (rotated coloured squares on a pastel band, denser outward), Broken Window (pastel painterly stroke frame, softened image), Dragon scales frame (overlapping gold scales), Lacy Framed (marble band with keyline), Smooth to crinkled (metallic foil, Roughness = smooth to crinkled), Op Art Frame (black margin, wavy black/white stripe band, grooved inner margin)',1);

/* ---------- Filter Forge frames III: glass, ice and round frames ---------- */
f('q11_ff_glassframes','Filter Forge Glass & Ice Frames',[S('Style',['Glass Heart Frame','through a glass darkly','December Window','Frozen Vignette','Fire and Ice','Porcelain Flame Frame','Scrying Frame','dinner plate theater']),P('Frame width',.02,.3,.1,.005),P('Refraction',0,1,.5,.01),P('Detail scale',.5,2,1,.01)],
 Q11_FR + `float RF=u_p2,SC=u_p3;vec3 img=c.rgb;vec3 o=img;
 if(m==0){float sz=.62-W;vec2 hp=cq/sz*vec2(1.,1.)+vec2(0.,.62);hp.x=abs(hp.x);float hd;
  if(hp.y+hp.x>1.)hd=sqrt(dot(hp-vec2(.25,.75),hp-vec2(.25,.75)))-.35355;else{vec2 a1=hp-vec2(0.,1.);vec2 a2=hp-.5*max(hp.x+hp.y,0.);hd=sqrt(min(dot(a1,a1),dot(a2,a2)))*sign(hp.x-hp.y);}
  hd*=sz;if(hd>0.){float stp=8./SC;float fr=fract(hd/(.03*SC));vec2 dir=normalize(cq+1e-4);vec2 off=dir*(fr-.5)*.04*RF+dir*hd*.15*RF;
   vec3 rf=blur5(uv-off/A,R(2.)+R(4.)*RF);vec3 tint=vec3(1.,.7,.35);o=mix(rf,rf*tint,.45)*(.8+.35*smoothstep(.7,1.,fr))+.15*smoothstep(.92,1.,fr);o=(o-.5)*1.1+.5;}}
 else if(m==1){float mw=W*.18;float e=min(min(abs(cq.x),abs(cq.y)),dist)-mw*.5;vec2 pid=step(0.,cq);float bw=W*1.2;float sh=smoothstep(0.,bw,e);
  vec2 pc=(pid-.5)*A*.5;vec2 toC=normalize(pc-cq+1e-4);vec3 im=O(uv+toC/A*(1.-sh)*.03*RF).rgb;float pn=hash(pid+2.);vec3 tint=pn<.33?vec3(1.,.55,.95):pn<.66?vec3(.75,1.,.8):vec3(1.);
  float cr=length((cq-pc)/(A*.25));o=im*tint*mix(.12,1.,pow(sh,.7))*(1.-.6*smoothstep(.6,1.3,cr))*.9;o+=vec3(.9)*smoothstep(.0,.02,e)*smoothstep(.04,.02,e)*.25;if(e<0.)o=vec3(.05,.05,.06)*(1.+fbm(q*60.));}
 else if(m==2){float fm=smoothstep(W*1.7,W*.1,dist+(fbm(q*5./SC)-.5)*W*1.4);float r1=1.-abs(2.*fbm(q*14./SC)-1.);float r2=pow(r1,7.);float r3=pow(1.-abs(2.*fbm(q*40./SC+3.)-1.),9.);
  float frost=clamp(fm*(.45+r2*.7+r3*.5),0.,1.);vec2 gq=vec2(fbm(q*9./SC+.01)-fbm(q*9./SC),fbm(q*9./SC+vec2(0.,.01))-fbm(q*9./SC));vec3 rf=blur5(uv+gq*RF*.6*fm,R(1.)+R(5.)*fm);
  o=mix(rf,vec3(.88,.94,1.),frost*.85);o+=step(.985,hash(floor(PX(uv))))*frost*.4;}
 else if(m==3){float d=Q11BOX(cq,A*.5-vec2(W*1.3),W*1.5);float msk=smoothstep(-W*1.2,W*.6,d+(fbm(q*4.)-.5)*W);vec2 g=q*9./SC;vec2 ig=floor(g);float md=9.,md2=9.;vec2 bc=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ig+vec2(float(i),float(j));float dd=length(g-cc-hash2(cc));if(dd<md){md2=md;md=dd;bc=cc;}else if(dd<md2)md2=dd;}
  float edge=smoothstep(.08,0.,md2-md);vec2 fo=(hash2(bc+4.)-.5)*.06*RF;vec3 rf=O(uv+fo*msk).rgb;float fac=.55+.6*hash(bc+1.);vec3 ice=mix(vec3(.85,.85,.95),vec3(.6,.45,.75),hash(bc+7.)*.7)*fac;
  o=mix(img,mix(rf*ice*1.2,vec3(.97),edge),msk*.92);}
 else if(m==4){float rr=Q11BOX(cq,A*.5-vec2(W*2.2),.08);float t=smoothstep(-.01,.02,rr);float rip=sin(rr*90./SC);vec2 nd=normalize(cq+1e-4);vec3 rf=O(uv+nd/A*rip*.012*RF*t+nd/A*rr*.1*RF*t).rgb;
  vec3 tint=mix(vec3(.7,.85,1.),vec3(1.,.6,.3),smoothstep(.3,.7,fbm(q*3.)));float spc=smoothstep(.85,1.,rip)*.35;rf=(rf-.5)*1.15+.5;o=mix(img,mix(rf,rf*tint,.6)+spc+(hash(floor(PX(uv)))-.5)*.05,t);}
 else if(m==5){float n=fbm(q*vec2(5.,5.)/SC+vec2(0.,1.));float d=Q11BOX(cq,A*.5-vec2(W*1.5),.06)+(n-.5)*W*2.*(.4+RF)+(fbm(q*18./SC)-.5)*W*.3;
  float t=smoothstep(-aa,aa,d);float ridge=exp(-d*d/(W*W*.03));float sw=fbm(q*7./SC+5.);vec3 glaze=mix(vec3(.08,.16,.5),vec3(.35,.5,.85),sw)*(.7+.5*fbm(q*20./SC));
  vec2 nd=normalize(cq+1e-4);vec3 rf=O(uv-nd/A*.02*RF*sin(d*120.)).rgb;glaze=mix(glaze,rf*vec3(.4,.55,1.),.25)+ridge*.6+.25*smoothstep(.7,.9,sw);o=mix(img,glaze,t);}
 else if(m==6){float R0=.5-W*1.1;float r=length(cq)/R0;float fw=W*.28;float ac=step(abs(dist-fw*.65),fw*.12);
  vec3 mat=mix(vec3(.03,.08,.07),vec3(.1,.6,.55),pow(1.-abs(2.*fbm(q*10./SC)-1.),8.));o=mat;
  if(dist<fw){float g=dist/fw;o=mix(vec3(.25,.14,.08),vec3(.7,.45,.28),.5+.5*sin(g*3.14))*(.7+.3*fbm(q*50.));o=mix(o,vec3(.2,.75,.7),ac);}
  if(r<1.){float z=sqrt(1.-r*r);float sw=(1.-r)*(1.-r)*4.*RF*(fbm(q*3.)-.2);vec2 lq=rot(cq/R0*(.55+.45*z),sw);vec3 im=blur5(lq*R0/A+.5,R(1.));
   im=mix(vec3(luma(im)),im,.7)*mix(vec3(1.),vec3(.8,.9,1.05),.5);float hl=smoothstep(.25,0.,length(cq/R0-vec2(-.35,.4)))*.6;o=im*(.35+.65*z)+hl+smoothstep(.85,1.,r)*vec3(.2,.3,.35);}
  else o*=1.-.5*smoothstep(1.12,1.,r);}
 else{float R0=.47;float r=length(cq)/R0;vec3 bg=blur5(uv,R(6.))*vec3(.6,.85,.55)*.7;o=bg*(1.-.35*smoothstep(1.15,1.,r));float wl=.7-W*.8;
  if(r<1.){if(r<wl){o=O(cq/(R0*wl)*.5*vec2(1./asp(),1.)*1.+.5).rgb;o*=1.-.35*smoothstep(wl*.8,wl,r);}
   else{float t=(r-wl)/(1.-wl);float bev=sin(t*3.1416);vec3 rim=vec3(.97,.95,.97)*(.6+.45*bev);float band=step(abs(t-.5),.12+.05*RF)+step(abs(t-.88),.03);rim=mix(rim,vec3(.75,.55,.85)*(.6+.4*bev),band*.8);
    rim*=1.-.08*fbm(q*40./SC);float sl=dot(normalize(cq+1e-4),normalize(vec2(-.6,.6)));o=rim*(1.+.18*sl*(1.-2.*step(.5,t)));}}}
 return vec4(clamp(o,0.,1.),1.);`,
 'Filter Forge library frames (approx. procedural re-creations from the filter descriptions and previews): Glass Heart Frame (image seen through a heart-shaped opening in stepped refractive tinted glass), through a glass darkly (2x2 old stained-glass panes: lead mortar, dark bevels, refraction and per-pane tint), December Window (frost-crystal lattice creeping in from the margins, refracted and blurred), Frozen Vignette (faceted icy Voronoi shards with purple metallic tint), Fire and Ice (concentric rippled refracting glass with warm / cold tint), Porcelain Flame Frame (cobalt china glaze with flame-licked glossy rim), Scrying Frame (crystal orb with swirl lens, highlight, teal-veined mat and metal frame), dinner plate theater (image in the well of a porcelain plate with coloured rim bands over a blurred green-tinted background)');

/* ---------- Filter Forge frames IV: self-copy, mirror and token layouts ---------- */
f('q11_ff_copyframes','Filter Forge Mirror, Token & Laser Frames',[S('Style',['Radial Self-Copy Frame','Icon Mirror','Roll20 Token Maker','Laser Art Vignette']),P('Copies / lines',2,8,3,1),P('Size',.2,1,.6,.01),P('Rotation / ring',0,1,.3,.01)],
 Q11_FR + `float N=floor(u_p1+.5),SZ=u_p2,RT=u_p3;vec3 o=c.rgb;
 if(m==0){float rl=length(cq);vec2 bq=rot(cq,sin(rl*45.)*.06);vec3 bg=O(bq*.6/A+.5).rgb*.35*(1.-.5*smoothstep(.2,.75,rl));o=bg;float sec=6.2832/N;float a=atan(cq.y,cq.x)+RT*6.2832;
  float k=floor(a/sec+.5);vec2 pl=rot(cq,k*sec-RT*6.2832);float R0=.12+.15*SZ;float sz=.18+.3*SZ;vec2 ci=vec2(-pl.y,pl.x-R0)/(sz*vec2(asp(),1.))+.5;
  if(all(greaterThan(ci,vec2(0.)))&&all(lessThan(ci,vec2(1.)))){float cut=smoothstep(.5,.42,length(ci-.5));o=mix(o,O(ci).rgb,cut);}}
 else if(m==1){vec3 bg=mix(vec3(.55),vec3(.98),smoothstep(-.1,.75,uv.y));bg=mix(bg,vec3(.35),smoothstep(.22,.05,uv.y));o=bg;float s=.25+.5*SZ;vec2 hh=vec2(asp()*.5,.5)*s*vec2(.6,1.);vec2 cen=vec2(0.,.08+.1*SZ);
  vec2 lp=cq-cen;vec2 iu=lp/(2.*hh)+.5;if(all(greaterThan(iu,vec2(0.)))&&all(lessThan(iu,vec2(1.))))o=O(vec2(.2,0.)+iu*vec2(.6,1.)).rgb;
  else{float y0=cen.y-hh.y;float dy=y0-cq.y;float len=hh.y*2.*(.3+.5*RT);if(dy>0.&&dy<len&&abs(lp.x)<hh.x){vec2 mu=vec2(iu.x,dy/(2.*hh.y));vec3 rfl=O(vec2(.2,0.)+mu*vec2(.6,1.)).rgb;o=mix(o,rfl,.45*(1.-dy/len));}}}
 else if(m==2){float R0=.47;float r=length(cq);float rw=.02+.08*RT;vec2 ck=floor(PX(uv)/R(12.));o=mix(vec3(.78),vec3(.97),mod(ck.x+ck.y,2.));
  if(r<R0-rw){float z=.9-.5*SZ;o=O(cq*z/A*2.+.5).rgb;}else if(r<R0){float t=(r-(R0-rw))/rw*2.-1.;vec3 nn=normalize(vec3(normalize(cq)*t,sqrt(max(1.-t*t,0.))));
   float dif=max(dot(nn,normalize(vec3(-.5,.6,.65))),0.);float spc=pow(max(dot(reflect(-normalize(vec3(-.5,.6,.65)),nn),vec3(0.,0.,1.)),0.),20.);o=vec3(.78,.72,.2)*(.3+.85*dif)+spc*.5;}
  o=mix(o,o*.6,smoothstep(R0+.02,R0,r)*step(R0,r));}
 else{float r=length(cq/vec2(A.x*.6,.6));float msk=smoothstep(.35+.3*SZ*.5,.95,r);vec3 dk=c.rgb*(1.-msk*.92);float a=atan(cq.y,cq.x);vec3 glow=vec3(0.);
  for(int i=0;i<8;i++){if(float(i)>=N)break;float fi=float(i);float rr=.55+fi*.07+.035*sin(a*(3.+fi)+fi*1.7+RT*6.2832)+.02*sin(a*(11.+fi*2.));float dd=abs(r-rr);glow+=vec3(1.,.45,.12)*(exp(-dd*dd/.00002)+.35*exp(-dd*dd/.0006));}
  o=dk+glow*msk;}
 return vec4(clamp(o,0.,1.),1.);`,
 'Filter Forge library frames (approx. procedural re-creations from the filter descriptions and previews): Radial Self-Copy Frame (N rotated copies of the picture arranged around the centre, bottoms inward, over a rippled dark copy; Rotation turns the ring, Size = copy size / radius), Icon Mirror (the picture as a centred icon with a fading mirror reflection below on a grey studio gradient; Size and reflection length), Roll20 Token Maker (circular portrait crop with a bevelled gold ring on a transparency checkerboard; Size = zoom, Ring = ring width), Laser Art Vignette (dark vignette crossed by N glowing orange wavy laser lines)');

/* ---------- AviSynth+ plugins: spatial cleaners ---------- */
f = add('Noise');
f('q11_avs_cleaners','AviSynth Spatial Cleaners (MinBlur / SPresso / FluxSmooth / SmoothUV / FixChromaBleeding)',[S('Filter',['MinBlur r1','MinBlur r2','MinBlur r3','SPresso','FluxSmoothS (spatial)','SmoothUV','FixChromaBleeding']),P('Threshold (0 means default)',0,64,0,1),P('SPresso bias',1,100,25,1),P('SmoothUV radius',1,7,3,1,'px')],
 VF_YUV + `int m=int(u_p0+.5);vec2 e=u_px;vec3 cc=c.rgb;vec3 o=cc;
 if(m<=2){int rad=m+1;vec3 bl=vec3(0.);float ws=0.;vec3 v[49];int n=0;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rad||abs(j)>rad)continue;vec3 s=T(uv+vec2(float(i),float(j))*e).rgb;
   float wi=rad==1?(abs(i)==0?2.:1.):rad==2?(abs(i)==0?4.:abs(i)==1?3.:1.):(abs(i)==0?10.:abs(i)==1?8.:abs(i)==2?4.:1.);
   float wj=rad==1?(abs(j)==0?2.:1.):rad==2?(abs(j)==0?4.:abs(j)==1?3.:1.):(abs(j)==0?10.:abs(j)==1?8.:abs(j)==2?4.:1.);bl+=s*wi*wj;ws+=wi*wj;v[n]=s;n++;}
  bl/=ws;vec3 md=vec3(0.);float K=float(n/2);
  for(int i=0;i<49;i++){if(i>=n)break;vec3 rk=vec3(0.);for(int j=0;j<49;j++){if(j>=n)break;rk+=vec3(lessThan(v[j],v[i]));if(j<i)rk+=vec3(equal(v[j],v[i]));}md+=v[i]*vec3(equal(rk,vec3(K)));}
  vec3 d1=cc-bl,d2=cc-md;vec3 dd=mix(mix(d2,d1,vec3(lessThan(abs(d1),abs(d2)))),vec3(0.),vec3(lessThan(d1*d2,vec3(0.))));o=cc-dd;}
 else if(m==3){vec3 yc=VFY(cc);float x0=yc.x*255.;float lv[9];int n=0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){lv[n]=VFY(T(uv+vec2(float(i),float(j))*e).rgb).x*255.;n++;}
  float md=0.;for(int i=0;i<9;i++){float rk=0.;for(int j=0;j<9;j++){if(lv[j]<lv[i]||(lv[j]==lv[i]&&j<i))rk+=1.;}if(rk==4.)md=lv[i];}
  float lim=u_p1>.5?u_p1:2.;float bias=u_p2;float L1=floor(lim*100./bias-1.+.5),L2=lim;float y2;
  if(abs(x0-md)<.001)y2=x0;else if(x0+L1<md)y2=x0+L2;else if(x0-L1>md)y2=x0-L2;else y2=(x0*(100.-bias)+md*bias)/100.;o=VFRGB(vec3(y2/255.,yc.yz));}
 else if(m==4){float th=(u_p1>.5?u_p1:7.)/255.;vec3 yc=VFY(cc);vec3 l=VFY(T(uv-vec2(e.x,0.)).rgb),r=VFY(T(uv+vec2(e.x,0.)).rgb),dn=VFY(T(uv-vec2(0.,e.y)).rgb),up=VFY(T(uv+vec2(0.,e.y)).rgb);
  vec3 fl=vec3(greaterThan((l-yc)*(r-yc),vec3(0.)))*vec3(greaterThan((dn-yc)*(up-yc),vec3(0.)))*vec3(greaterThan((l-yc)*(up-yc),vec3(0.)));
  vec3 su=yc,cn=vec3(1.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;vec3 s=VFY(T(uv+vec2(float(i),float(j))*e).rgb);vec3 w=vec3(lessThanEqual(abs(s-yc),vec3(th)));su+=s*w;cn+=w;}
  o=VFRGB(mix(yc,su/cn,fl));}
 else if(m==5){float th=(u_p1>.5?u_p1:30.)/255.;float rd=floor(u_p3+.5);vec3 yc=VFY(cc);vec2 su=vec2(0.);float n=0.;
  for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){if(abs(float(i))>rd||abs(float(j))>rd)continue;vec3 s=VFY(T(uv+vec2(float(i),float(j))*e).rgb);if(abs(s.y-yc.y)+abs(s.z-yc.z)<=th){su+=s.yz;n+=1.;}}
  o=VFRGB(vec3(yc.x,su/max(n,1.)));}
 else{float ext=0.;for(int j=-3;j<=3;j++)for(int i=-4;i<=2;i++){vec3 s=VFY(T(uv+vec2(float(i),float(j))*e).rgb);ext=max(ext,step(.124,abs(s.z)));}
  vec3 yc=VFY(cc);vec3 sh=VFY(T(uv+vec2(4.*e.x,0.)).rgb);vec3 fx=vec3(yc.x,sh.yz*.8);o=VFRGB(mix(yc,fx,ext));}
 return vec4(clamp(o,0.,1.),1.);`,
 'AviSynth spatial cleaners on the working-pixel grid. MinBlur (Didee): per channel, d1 = x - RemoveGrain(11)[then 20, 20] blur (3x3 binomial; 5x5 [1 3 4 3 1]; 7x7 [1 4 8 10 8 4 1]) and d2 = x - median (RG4 3x3 / MedianBlur 5x5 / 7x7); out = x - (0 if signs differ else the smaller-magnitude difference). SPresso (Didee 2006, luma only): RG4 median y; if x = y keep, if x+LIM1 < y then x+limit, if x-LIM1 > y then x-limit, else (x(100-bias)+y bias)/100, LIM1 = round(limit 100/bias - 1); default limit 2. FluxSmoothS: FluxSmoothST spatial averaging (centre plus the 8 neighbours within the threshold, default 7, per Y/Cb/Cr) applied to "fluctuating" pixels, with the temporal prev/next test replaced by a spatial one (both opposite neighbour pairs on the same side) - approx. SmoothUV (Kurosu, derainbow): chroma replaced by the mean chroma of the radius window whose |dCb|+|dCr| is within the threshold (default 30; luma untouched) - approx. FixChromaBleeding (ajordan script): mask of extreme Cr (sat x4 clipped, i.e. |Cr| >= ~32/255), dilated by a shifted 7x7 window (approx. of the half-res GeneralConvolution + resize), where chroma is shifted 4 px left and desaturated to 0.8');

f = add('Sharpen');
f('q11_avs_asharp','aSharp (AviSynth adaptive sharpening)',[P('T (threshold)',0,32,2,.1),P('D (adaptive strength)',0,16,4,.1),P('B (block adaptive)',-1,4,-1,.1),S('hqbf',['Off','On'])],
 VF_YUV + `vec3 yc=VFY(c.rgb);float x0=floor(yc.x*255.+.5);vec2 ip=floor(uv*u_res);vec2 blk=floor(ip/8.);float sm=0.,dev=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o2=vec2(float(i),float(j));float v=floor(VFY(T(uv+o2*u_px).rgb).x*255.+.5);sm+=v;
  if(i==0&&j==0)continue;bool inb=all(equal(floor((ip+o2)/8.),blk));if(u_p3<.5||inb)dev=max(dev,abs(v-x0));}
 float avg=sm/9.;float diff=x0-floor(avg+.5);float Ti=u_p0*512.;float D2=u_p1*512.;
 if(u_p2>0.){float b1=256.-u_p2*64.,b2=256.-u_p2*48.;vec2 md=mod(ip,8.);for(int a=0;a<2;a++){float mm=a==0?md.x:md.y;if(mm==6.||mm==1.)D2=floor(D2*b2/256.);if(mm==7.||mm==0.)D2=floor(D2*b1/256.);}}
 float Da=-32.+floor(u_p1*512./128.);float T2=Ti;if(u_p1>0.)T2=(floor(dev*128.*D2/65536.)+Da)*16.;T2=clamp(T2,-32.,Ti);
 float y2=clamp(x0+floor(diff*128.*T2/65536.),0.,255.);return vec4(VFRGB(vec3(y2/255.,yc.yz)),1.);`,
 'ASharp (Marc FD, AviSynth+ port by Asd-g), luma only, 8-bit integer arithmetic as in asharp_run_c: diff = x - round(3x3 mean), dev = max |neighbour - x| (hqbf: only neighbours inside the same 8x8 block); T2 = ((dev 128 D2) >> 16 + Da) 16 with T = T 512, D = D 512, Da = -32 + D >> 7, clamped to [-32, T]; B > 0 lowers D2 near 8x8 block borders (x, y mod 8 = 6/1 by 256 - 48B, 7/0 by 256 - 64B); out = x + diff T2 / 512. Flat areas (small dev) are slightly softened, edges sharpened up to T');

f('q11_avs_msharpen','MSharpen (AviSynth masked sharpening)',[P('Threshold',0,255,15,1),P('Strength',0,255,100,1),S('High quality',['Off','On'],1),S('Mask',['Off','On'])],
 `vec2 e=u_px;
#define Q11BL(o2) ((T(uv+(o2)+vec2(-e.x,e.y)).rgb+T(uv+(o2)+vec2(0.,e.y)).rgb+T(uv+(o2)+e).rgb+T(uv+(o2)-vec2(e.x,0.)).rgb+T(uv+(o2)).rgb+T(uv+(o2)+vec2(e.x,0.)).rgb+T(uv+(o2)-e).rgb+T(uv+(o2)-vec2(0.,e.y)).rgb+T(uv+(o2)+vec2(e.x,-e.y)).rgb)/9.)
 float th=max(u_p0,1.)/255.;vec3 b0=Q11BL(vec2(0.));bool ed;
 if(u_p2>.5){vec3 bd=Q11BL(vec2(0.,-e.y)),br=Q11BL(vec2(e.x,0.));ed=any(greaterThanEqual(abs(b0-bd),vec3(th)))||any(greaterThanEqual(abs(b0-br),vec3(th)));}
 else{vec3 br=Q11BL(vec2(e.x,0.)),bdr=Q11BL(vec2(e.x,-e.y)),bd=Q11BL(vec2(0.,-e.y));ed=any(greaterThanEqual(abs(b0-bdr),vec3(th)))||any(greaterThanEqual(abs(br-bd),vec3(th)));}
 if(u_p3>.5)return vec4(vec3(ed?1.:0.),1.);if(!ed)return c;vec3 t=clamp(4.*c.rgb-3.*b0,0.,1.);return vec4((u_p1*t+(255.-u_p1)*c.rgb)/256.,1.);`,
 'MSharpen (neuron2, reimplementation by tp7), RGB path: 3x3 mean blur per channel; edge mask where any channel of the blur differs by >= threshold from the pixel below or to the right (High quality) or across the two diagonals (fast); masked pixels become (strength (4x - 3 blur) + (255 - strength) x) / 256 with 4x - 3 blur clipped; Mask shows the edge map');

f = add('Repair');
f('q11_avs_eedi3','eedi3 (edge-directed field interpolation, AviSynth)',[S('Field',['Keep top field','Keep bottom field']),P('alpha',0,1,.2,.01),P('beta',0,1,.25,.01),P('mdis',1,20,20,1,'px')],
 `vec2 ip=floor(uv*u_res);float rowT=u_res.y-1.-ip.y;if(mod(rowT,2.)==u_p0)return c;float al=u_p1,be=min(u_p2,1.-al);float ga=max(1.-al-be,0.);vec2 e=u_px;
 vec2 uu=uv+vec2(0.,e.y),ud=uv-vec2(0.,e.y);float lu0=luma(T(uu).rgb)*255.,ld0=luma(T(ud).rgb)*255.;float best=1e9;vec3 res=(T(uu).rgb+T(ud).rgb)*.5;
 for(int d=-20;d<=20;d++){float fd=float(d);if(abs(fd)>u_p3)continue;if(ip.x+abs(fd)+2.>u_res.x-1.||ip.x-abs(fd)-2.<0.)continue;float sc=0.;
  for(int k=-2;k<=2;k++){float fk=float(k);sc+=abs(luma(T(uu+vec2((fd+fk)*e.x,0.)).rgb)-luma(T(ud+vec2((fk-fd)*e.x,0.)).rgb))*255.;}
  vec3 a=T(uu+vec2(fd*e.x,0.)).rgb,b=T(ud-vec2(fd*e.x,0.)).rgb;float iv=luma((a+b)*.5)*255.;float vc=abs(iv-lu0)+abs(iv-ld0);
  float cost=al*sc+be*vc+ga*abs(fd);if(cost<best){best=cost;res=(a+b)*.5;}}
 return vec4(res,1.);`,
 'eedi3 (tritical; VapourSynth eedi3m doc): keeps one field (every other working-pixel row) and rebuilds the missing rows; for each missing pixel the connection direction d in [-mdis, mdis] minimises alpha x neighbourhood similarity (sum of |up(x+d+u) - down(x-d+u)|, u = -2..2, nrad 2) + beta x vertical difference created (|interp - up| + |interp - down|) + (1 - alpha - beta) |d|, in 8-bit luma units, and the pixel is the 2-point average along d. Simplified (approx.): gamma = 0 (no dynamic-programming smoothness along the row, so directions are chosen per pixel), cost3 off, ucubic off, vcheck 0; direction chosen on luma and applied to RGB');

f = add('Film');
f('q11_avs_grainfactory3','GrainFactory3 (AviSynth luma-zoned grain)',[P('Strength scale',0,4,1,.05),P('Size scale',.5,3,1,.05),P('Texture',0,100,0,1),S('Output',['Grain applied','Grain only (x4)','Zone map'])],
 VF_YUV + `
#define Q11BC(xx,bb,cc) (abs(xx)<1.?((12.-9.*(bb)-6.*(cc))*pow(abs(xx),3.)+(-18.+12.*(bb)+6.*(cc))*abs(xx)*abs(xx)+(6.-2.*(bb)))/6.:abs(xx)<2.?((-(bb)-6.*(cc))*pow(abs(xx),3.)+(6.*(bb)+30.*(cc))*abs(xx)*abs(xx)+(-12.*(bb)-48.*(cc))*abs(xx)+(8.*(bb)+24.*(cc)))/6.:0.)
#define Q11GN(cl,zz) (sqrt(-2.*log(max(hash((cl)+vec2(zz*71.,3.)),1e-6)))*cos(6.2832*hash((cl)+vec2(zz*71.+19.,7.))))
#define Q11NV(cl,zz) (tx>0.?tx*(Q11GN(cl,zz)-Q11GN((cl)-1.,zz)):Q11GN(cl,zz))
 vec3 yc=VFY(c.rgb);float y=yc.x*255.;vec2 p=PX(uv);float tx=u_p2/100.;float gz[3];
 for(int z=0;z<3;z++){float fz=float(z);float st=z==0?13.:z==1?15.:25.;float sz=(z==0?1.5:z==1?1.2:.9)*u_p1;float sh=z==0?60.:z==1?66.:80.;float bb=sh/-50.+1.;if(sz>1.5)bb*=.5;float cc=(1.-bb)/2.;
  vec2 g=p/sz-.5;vec2 ig=floor(g);vec2 fg=g-ig;float acc=0.,wsum=0.;
  for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec2 cl=ig+vec2(float(i),float(j));float w=Q11BC(fg.x-float(i),bb,cc)*Q11BC(fg.y-float(j),bb,cc);acc+=w*Q11NV(cl,fz);wsum+=w;}
  gz[z]=acc/wsum*sqrt(st)*u_p0;}
 float wd=clamp((56.-y)/(56.-24.),0.,1.),wb=clamp((y-128.)/(160.-128.),0.,1.),wm=1.-wd-wb;float gr=wd*gz[0]+wm*gz[1]+wb*gz[2];
 int m=int(u_p3+.5);if(m==2)return vec4(wd,wm,wb,1.);if(m==1)return vec4(vec3(.5+gr*4./255.),1.);
 return vec4(VFRGB(vec3(clamp(y+gr,0.,255.)/255.,yc.yz)),1.);`,
 'GrainFactory3 (Didee 2008) defaults: three grain layers (dark / mid / bright) of AddGrainC Gaussian noise with variance g1-3str 13/15/25 generated at size 1.5/1.2/0.9 (lattice spacing in source pixels) and bicubic-resized back with b = shrp/-50 + 1, c = (1 - b)/2 for shrp 60/66/80 (b halved for size > 1.5, single resize - approx.), optional texture = gtex/100 x (g - g of the diagonal neighbour) as the mt_edge bump kernel; blended by luma zones th1-th4 = 24/56/128/160 (dark->mid and mid->bright ramps) and added to luma only. Strength / Size scale multiply all three; temporal averaging and ontop_grain need video and are omitted',1);

f = add('Repair');
f('q11_avs_descratch','DeScratch (AviSynth vertical scratch removal)',[S('Mode',['Dark scratches (low)','Bright scratches (high)','Both']),P('mindif',1,60,5,1),P('minlen',10,400,100,1,'px'),S('Output',['Repaired','Mark scratches'])],
 [`return vec4(vec3(luma(box1d(u_tex,uv,vec2(0.,1.),R(15.)).rgb)),1.);`,
  `float cv=T(uv).r*255.;int md=int(u_p0+.5);float mark=0.,dl=0.,wd=0.;
  for(int w=0;w<2;w++){float hw=float(w)+1.;float lv=T(uv-vec2(hw*u_px.x,0.)).r*255.,rv=T(uv+vec2(hw*u_px.x,0.)).r*255.;if(abs(lv-rv)>10.)continue;float nb=(lv+rv)*.5;
   bool lo=cv<lv-u_p1&&cv<rv-u_p1,hi=cv>lv+u_p1&&cv>rv+u_p1;if(((md==0||md==2)&&lo)||((md==1||md==2)&&hi)){mark=1.;dl=nb-cv;wd=float(w);break;}}
  return vec4(mark,.5+dl/255.,wd,1.);`,
  `float hl=R(u_p2);float up=0.,dn=0.;float miss=0.;
  for(int k=1;k<=200;k++){float fk=float(k)*2.;if(fk>hl)break;vec2 o2=vec2(0.,fk)*u_px;float mx=max(T(uv+o2).r,max(T(uv+o2-vec2(u_px.x,0.)).r,T(uv+o2+vec2(u_px.x,0.)).r));if(mx>.5){up=fk;miss=0.;}else{miss+=1.;if(miss>1.)break;}}
  miss=0.;for(int k=1;k<=200;k++){float fk=float(k)*2.;if(fk>hl)break;vec2 o2=vec2(0.,-fk)*u_px;float mx=max(T(uv+o2).r,max(T(uv+o2-vec2(u_px.x,0.)).r,T(uv+o2+vec2(u_px.x,0.)).r));if(mx>.5){dn=fk;miss=0.;}else{miss+=1.;if(miss>1.)break;}}
  float ok=step(R(u_p2)-2.5,up+dn+1.)*T(uv).r;return vec4(ok,T(uv).g,T(uv).b,1.);`,
  `vec3 src=O(uv).rgb;float best=0.;float dl=0.;
  for(int i=-1;i<=1;i++){vec4 s=T(uv+vec2(float(i)*u_px.x,0.));if(s.r>.5&&abs(float(i))<=s.b+.01){best=1.;dl=(s.g-.5);}}
  if(u_p3>.5)return vec4(best>.5?(dl>0.?vec3(0.):vec3(1.)):src*.6+.2,1.);return vec4(clamp(src+dl*best,0.,1.),1.);`],
 'DeScratch (Fizick, AviSynth+ port): detection on a vertically blurred copy (blurlen 15), local horizontal extremes of luma darker (low) / brighter (high) than both neighbours at width/2+1 by mindif with neighbour asymmetry < 10 (maxwidth 3), kept only where the run of extremes through the pixel (searched up and down in 2 px steps, 1 px horizontal slack per step, gaps up to 3 px closed) is at least minlen long (approx. of the length / gap / maxangle test); removal with keep = 100: the smooth (blurred) scratch offset is subtracted, so image detail inside the scratch is kept; the detected width (1 or 3) is corrected. Mark shows dark scratches black, bright white');

/* ---------- Forensically (29a.ch) single-image maps ---------- */
f = add('Analysis');
f('q11_forensic_noise','Forensically Noise Analysis / Luminance Gradient',[S('Tool',['Noise Analysis','Luminance Gradient']),P('Amplitude',1,100,20,1),S('Equalize histogram',['Off','On'])],
 [`if(u_p0>.5){vec2 e=u_px;float gx=L(uv+vec2(e.x,0.))-L(uv-vec2(e.x,0.)),gy=L(uv+vec2(0.,e.y))-L(uv-vec2(0.,e.y));float k=u_p1*.15;return vec4(clamp(vec3(.5+gx*k,.5+gy*k,.5+length(vec2(gx,gy))*k*.5),0.,1.),1.);}
  vec2 e=u_px;vec3 h[3];for(int j=-1;j<=1;j++){vec3 a=T(uv+vec2(-e.x,float(j)*e.y)).rgb,b=T(uv+vec2(0.,float(j)*e.y)).rgb,d=T(uv+vec2(e.x,float(j)*e.y)).rgb;h[j+1]=max(min(a,b),min(max(a,b),d));}
  vec3 md=max(min(h[0],h[1]),min(max(h[0],h[1]),h[2]));return vec4(clamp(abs(c.rgb-md)*u_p1,0.,1.),1.);`,
  `if(u_p2<.5)return c;vec3 cnt=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=T((vec2(float(i),float(j))+.5)/16.).rgb;cnt+=step(s,c.rgb);}return vec4(cnt/256.,1.);`],
 'Forensically (Jonas Wagner): Noise Analysis isolates noise with a separable 3-tap median (rows, then columns) and shows |image - median| x amplitude per channel ("removes the rest of the image"); Equalize histogram = per-channel histogram equalisation of that layer (CDF estimated from a 16x16 grid of samples - approx.). Luminance Gradient: brightness change along x and y shown as R = 0.5 + dx, G = 0.5 + dy, B = magnitude (colour encoding approx.); similar surfaces at similar angles to the light should look alike');

f('q11_forensic_levelsweep','Forensically Level Sweep',[P('Sweep',0,1,.5,.005),P('Width',1,128,32,1),P('Opacity',0,1,1,.01)],
 `vec3 v=c.rgb*255.;float lo=u_p0*255.-u_p1*.5;vec3 o=clamp((v-lo)/u_p1,0.,1.);return vec4(mix(c.rgb,o,u_p2),1.);`,
 'Forensically Level Sweep: a slice of the histogram of width Width (8-bit levels) around position Sweep is stretched to the full output range (position 0.5, width 32: 127 - 16 maps to 0), revealing edges of pasted regions that differ in level; Opacity mixes with the original');

f('q11_forensic_magnifier','Forensically Magnifier (enhancement)',[P('Zoom',1,8,3,.1),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01),S('Enhancement',['None','Histogram Equalization','Auto Contrast','Auto Contrast by Channel'],1)],
 `vec2 ctr=vec2(u_p1,u_p2);vec2 vu=ctr+(uv-.5)/u_p0;vec3 v=T(vu).rgb;int m=int(u_p3+.5);if(m==0)return vec4(v,1.);
 vec3 mn=vec3(1.),mx=vec3(0.);float lmn=1.,lmx=0.;vec3 cnt=vec3(0.);
 for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=T(ctr+((vec2(float(i),float(j))+.5)/16.-.5)/u_p0).rgb;mn=min(mn,s);mx=max(mx,s);float l=luma(s);lmn=min(lmn,l);lmx=max(lmx,l);cnt+=step(s,v);}
 vec3 o=m==1?cnt/256.:m==2?(v-lmn)/max(lmx-lmn,1./255.):(v-mn)/max(mx-mn,vec3(1./255.));return vec4(clamp(o,0.,1.),1.);`,
 'Forensically Magnifier: shows the region around (Center X, Center Y) enlarged Zoom times with an enhancement computed from the visible region: Histogram Equalization (per channel, CDF from a 16x16 sample grid - approx.), Auto Contrast (one min-max stretch from luminance extremes, keeps colours) or Auto Contrast by Channel (per-channel min-max stretch, can shift colours); bilinear magnification');

/* ---------- Corel Painter effects ---------- */
f = add('Stylize');
f('q11_painter_popart','Pop Art Fill (Painter)',[P('Scale',3,40,10,.5,'px'),P('Contrast',0,1,1,.01),S('Invert',['Off','On']),S('Colors',['Black dots on yellow','Red dots on white','Blue dots on pink','Black dots on white'])],
 `vec2 p=PX(uv);vec2 g=rot(p,.7854)/u_p0;vec2 ce=floor(g)+.5;vec2 fq=g-ce;float l=luma(T(fromPX(rot(ce*u_p0,-.7854))).rgb);if(u_p2>.5)l=1.-l;
 float cov=mix(.5,1.-l,u_p1);float rad=sqrt(clamp(cov,0.,1.)/3.1416)*1.12;float dt=smoothstep(rad+.06,rad-.06,length(fq));int m=int(u_p3+.5);
 vec3 dab=m==0?vec3(.05):m==1?vec3(.86,.1,.12):m==2?vec3(.12,.25,.75):vec3(0.);vec3 bg=m==0?vec3(1.,.9,.15):m==1?vec3(1.):m==2?vec3(1.,.72,.8):vec3(1.);return vec4(mix(bg,dab,dt),1.);`,
 'Corel Painter Effects > Esoterica > Pop Art Fill using Image Luminance: covers the image with pseudo-halftone dots (45-degree screen) in the Dab colour on the Background colour; Scale = dot cell size, Contrast mixes in the luminance (0 = uniform dots), Invert flips the source');

f('q11_painter_gridpaper','Grid Paper (Painter)',[S('Grid type',['Rectangular grid','Vertical lines','Horizontal lines','Dot grid']),P('Spacing',4,100,24,1,'px'),P('Line thickness',1,8,1,.5,'px'),S('Background',['Transparent (over image)','Paper colour'])],
 `vec2 p=PX(uv);vec2 f2=mod(p,u_p1);vec2 dd=min(f2,u_p1-f2);int m=int(u_p0+.5);float hw=u_p2*.5;float ln;
 if(m==3)ln=smoothstep(hw+.7,hw-.3,length(dd));else{float lx=smoothstep(hw+.5,hw-.5,dd.x),ly=smoothstep(hw+.5,hw-.5,dd.y);ln=m==0?max(lx,ly):m==1?lx:ly;}
 vec3 bg=u_p3>.5?vec3(.98,.97,.94):c.rgb;return vec4(mix(bg,vec3(.35,.55,.85),ln),1.);`,
 'Corel Painter Effects > Esoterica > Grid Paper: rectangular grid, vertical lines, horizontal lines or dot grid at the given spacing and line thickness (blue grid colour), drawn over the image (transparent background) or on paper colour');

f = add('Distort');
f('q11_painter_glassdist','Glass Distortion (Painter)',[S('Using',['Image luminance','Paper texture']),S('Map',['Refraction','Vector displacement','Angle displacement']),P('Amount',0,40,8,.5,'px'),P('Softness',0,8,2,.1,'px')],
 `vec2 p=PX(uv);float sd=max(R(u_p3),.5);vec2 e=u_px*max(sd,1.);float h,hx,hy;
 if(u_p0<.5){h=blurL(uv,sd*.5);hx=blurL(uv+vec2(e.x,0.),sd*.5);hy=blurL(uv+vec2(0.,e.y),sd*.5);}
 else{float k=.12/max(u_p3*.5+1.,1.);h=fbm(p*k);hx=fbm((p+vec2(max(u_p3,1.),0.))*k);hy=fbm((p+vec2(0.,max(u_p3,1.)))*k);}
 int m=int(u_p1+.5);vec2 off;if(m==0)off=vec2(hx-h,hy-h)*8.;else if(m==1)off=vec2(h-.5)*1.4142;else{float a=h*6.2832;off=vec2(cos(a),sin(a))*.5;}
 return vec4(T(fromPX(p+off*u_p2)).rgb,1.);`,
 'Corel Painter Effects > Focus > Glass Distortion: displaces the image as if seen through glass whose relief comes from the image luminance or a paper texture (procedural paper grain here); Softness blurs the relief; Map: Refraction (offset along the relief gradient), Vector displacement (offset along a fixed diagonal by luminance), Angle displacement (luminance sets the offset direction); approx.',1);
