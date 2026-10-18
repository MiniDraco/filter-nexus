/* ================= q45: Filter Forge texture generators (round 18: Organic / Techno / Building / Stone) ================= */
// Voronoi into f1,f2 (distances to nearest / 2nd nearest jittered point) and cid (cell id); uses sd (seed offset)
const Q45_V = (pp, jt) => `{vec2 i_=floor(${pp}),g_=fract(${pp});f1=8.;f2=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 rp=o+.5+(vec2(hash(i_+o+sd),hash(i_+o+sd+17.31))-.5)*(${jt})-g_;float d=dot(rp,rp);if(d<f1){f2=f1;f1=d;cid=i_+o;}else if(d<f2)f2=d;}f1=sqrt(f1);f2=sqrt(f2);}`;
// height h / albedo cl / coverage cv evaluated at the pixel and its +x / +y neighbours -> normal, light, output modes
const Q45_F = body => `float sc=max(R(u_p1),2.);float v=u_p2;int st=int(u_p0+.5);float sd=fract(u_seed*.61803)*91.+3.;float h0=0.,h1=0.,h2=0.,bump=1.,gl=.2,cov=.25;vec3 col=vec3(.5);float f1=0.,f2=0.;vec2 cid=vec2(0.);
for(int k=0;k<3;k++){vec2 p=(PX(uv)+vec2(k==1?1.:0.,k==2?1.:0.))/sc;float h=0.;vec3 cl=vec3(.5);float cv=.25;
${body}
if(k==0){h0=h;col=cl;cov=cv;}else if(k==1)h1=h;else h2=h;}
vec3 nr=normalize(vec3((h0-h1)*bump*sc*.5,(h0-h2)*bump*sc*.5,1.));vec3 ld=normalize(vec3(-.45,.55,.7));float dif=max(dot(nr,ld),0.);
float spc=pow(max(dot(reflect(-ld,nr),vec3(0.,0.,1.)),0.),24.)*gl;vec3 m=col*(.3+.2*h0+.8*dif)+spc*.6;vec3 im=O(uv).rgb;int om=int(u_p3+.5);vec3 res=m;
if(om==1){float lm=luma(m);res=lm*mix(vec3(1.),im/max(luma(im),.1),.85);}else if(om==2)res=mix(im*(.45+.8*dif)+spc*.5,m,cov);
return vec4(clamp(res,0.,1.),1.);`;
const Q45_OUT = S('Output',['Material','Tinted by image colours','Relief over image']);
const Q45_N = 'Filter Forge library texture, approx. procedural re-creation from the library preview and name (Filter Forge publishes no source): ';
const Q45_T = '; height field lit from the upper left (normal from the pixel and its +x/+y neighbours), Variation = style-specific shape / wear amount, Output = material colours, its luminance tinted by the input image, or the relief and part of the material laid over the image; seeded';

f = add('Materials');
f('q45_ff_organic','Filter Forge Organic Textures (Ammonite / Bamboo / Blood Cells / Coral Reef / Giraffe Skin / Turtle Shell)',
  [S('Style',['Ammonite fossil','Bamboo','Blood cells','Coral reef','Giraffe skin','Turtle shell']),P('Scale',8,200,40,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){bump=1.2;gl=.35;vec2 a0=p/3.;vec2 ci=floor(a0);vec2 q=fract(a0)-.5-(vec2(hash(ci+sd),hash(ci+sd+5.1))-.5)*.08;float r=length(q)/(.37+.07*hash(ci+sd+3.3));float an=atan(q.y,q.x)+hash(ci+sd+9.7)*6.2832;float kk=.13+.1*v;float w=(log(max(r,.002))/kk-an)/6.2832;float fw=fract(w);
 float sh=sqrt(max(sin(3.1416*fw),0.))*smoothstep(.02,.1,r);float rib=.5+.5*cos(an*26.+r*5.);float mi=1.-smoothstep(.96,1.,r);float mt=fbm(p*1.3+sd)*.35;
 h=mix(mt,.25+.6*sh*(.8+.2*rib*smoothstep(.08,.35,fw)),mi);vec3 mc=vec3(.46,.43,.38)*(.75+.45*fbm(p*4.+sd));vec3 shc=mix(vec3(.42,.27,.15),vec3(.86,.72,.52),sh)*(.85+.25*rib);cl=mix(mc,shc,mi);}
else if(st==1){gl=.45;float ix=floor(p.x);float u=(fract(p.x)-.5)/.44;float cy=sqrt(max(1.-u*u,0.));float ins=step(abs(u),1.);float hx=hash(vec2(ix,sd));float L=3.+3.*hx;float dy=(fract(p.y/L+hash(vec2(ix,sd+2.)))-.5)*L;
 float ring=exp(-dy*dy*60.);float grv=exp(-(dy+.07)*(dy+.07)*500.);h=(cy*.75+ring*.18*cy-grv*.1)*ins;
 vec3 bc=mix(vec3(.42,.58,.18),vec3(.82,.7,.36),clamp(hx*.6+v*.7-.2,0.,1.))*(.88+.14*vnoise(vec2(p.x*36.,p.y*1.2+sd)));bc*=1.-.25*ring+.1*cy;cl=mix(vec3(.07,.06,.04),bc,ins*smoothstep(0.,.25,cy));}
else if(st==2){bump=.9;gl=.5;vec2 q=p*1.1;${Q45_V('q', '.85')}float rr=f1/((.26+.14*v)*(.85+.3*hash(cid+sd+2.)));float dsk=1.-smoothstep(.86,1.,rr);h=dsk*(.45+.55*smoothstep(.05,.7,rr));
 vec3 bg=vec3(.42,.06,.06)*(.7+.5*fbm(p*2.+sd));vec3 rc=mix(vec3(.95,.38,.32),vec3(.72,.06,.07),smoothstep(.1,.75,rr));cl=mix(bg,rc,dsk);}
else if(st==3){gl=.15;vec2 q=p*.6;vec2 w=q+vec2(fbm(q*.6+sd),fbm(q*.6+sd+7.3))*2.2;float n=fbm(w);float rg=1.-abs(sin(n*(14.+18.*v)));h=pow(rg,1.6)*.75;${Q45_V('p*2.6', '1.')}h+=.12*(1.-smoothstep(.05,.3,f1))*rg;
 float c2=fbm(q*.8+sd+3.1);vec3 pc=c2<.42?vec3(.93,.42,.38):c2<.5?vec3(.95,.62,.22):c2<.58?vec3(.58,.3,.66):vec3(.24,.62,.6);cl=pc*(.45+.65*rg);}
else if(st==4){bump=.5;gl=.05;vec2 q=p*.7+vec2(fbm(p*1.1+sd),fbm(p*1.1+sd+4.2))*.45;${Q45_V('q', '.9')}float e=f2-f1;float lw=.08+.16*v;float pt=smoothstep(lw,lw+.05,e);float fu=vnoise(p*28.+sd);h=pt*.25+fu*.08;
 vec3 pc=mix(vec3(.5,.25,.07),vec3(.74,.42,.13),hash(cid+sd+1.))*(1.15-.35*smoothstep(.15,.7,e));cl=mix(vec3(.93,.86,.68),pc,pt)*(.9+.15*fu);}
else{gl=.6;vec2 q=p*.55;${Q45_V('q', '.5')}float e=f2-f1;float sm=smoothstep(0.,.06,e);float rg=.5+.5*sin(e*45.);h=sm*(.35+.5*smoothstep(0.,.8,e))+rg*.04*sm;float bl=fbm(p*1.6+cid*3.1+sd);
 vec3 tc=mix(vec3(.88,.58,.2),vec3(.22,.1,.04),smoothstep(.35,.65,bl+(v-.5)*.4));cl=mix(vec3(.12,.07,.03),tc*(.85+.2*rg),sm);}`),
  Q45_N + 'Ammonite = logarithmic-spiral shell (whorl domes, radial ribs, Variation = coiling) one per jittered cell in a stone matrix; Bamboo = side-by-side culms with node rings at random spacing, green-to-straw colour; Blood Cells = biconcave red discs on Voronoi points in plasma (Variation = cell size); Coral Reef = domain-warped brain-coral meanders with polyp bumps in pink / orange / purple / teal colonies (Variation = groove density); Giraffe Skin = warped Voronoi patches with cream reticulation (Variation = line width); Turtle Shell = Voronoi scutes with growth rings and amber / brown tortoiseshell blotches' + Q45_T, true);

f('q45_ff_metalmesh','Filter Forge Metal Mesh Textures (Barbed Wire / Chain Mail / Chicken Wire / Expanded Metal / Pegboard / Speaker Grill / Knurling / Diamond Plate)',
  [S('Style',['Barbed wire fence','Chain mail','Chicken wire','Expanded metal floor','Pegboard','Speaker grill','Knurling','Diamond tread plate']),P('Scale',6,150,30,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){gl=.6;p/=2.2;float ry=floor(p.y/1.6);float y=p.y-ry*1.6-.8;float ph=p.x*6.2832*2.5+ry;float y1=.04*sin(ph);float wr=.032;float d1=abs(y-y1),d2=abs(y+y1);float a1=sqrt(max(1.-d1*d1/(wr*wr),0.)),a2=sqrt(max(1.-d2*d2/(wr*wr),0.));float z1=cos(ph);float hw=max(a1*(.6+.2*z1),a2*(.6-.2*z1));
 float bx=p.x+hash(vec2(ry,sd))*1.5;bx=bx-(floor(bx/1.5)+.5)*1.5;vec2 l=vec2(bx,y);vec2 da=vec2(.7071,.7071),db=vec2(.7071,-.7071);float dd=min(length(l-da*clamp(dot(l,da),-.11,.11)),length(l-db*clamp(dot(l,db),-.11,.11)));float br=sqrt(max(1.-dd*dd/.000256,0.))*.7;
 float cc=length(l*vec2(1.,1.3));float co=sqrt(max(1.-cc*cc/.0025,0.))*.85;h=max(hw,max(br,co));float ms=smoothstep(0.,.15,h);vec3 bg=mix(vec3(.5,.56,.62),vec3(.7,.74,.78),fbm(p*.25+sd));
 vec3 wc=mix(vec3(.62,.63,.6),vec3(.45,.22,.1),smoothstep(.55,.75,fbm(p*3.+sd)+v*.3-.15));cl=mix(bg,wc,ms);cv=ms;}
else if(st==1){gl=.7;float rb=floor(p.y/.42);float best=-9.,hb=0.;for(int j=-3;j<=3;j++)for(int i=-1;i<=1;i++){float rw=rb+float(j);float off=mod(rw,2.)*.5;vec2 c0=vec2(floor(p.x-off+.5)+float(i)+off,rw*.42);vec2 dl=(p-c0)*vec2(1.,1.15);float tu=(length(dl)-.38)/(.06+.04*v);
 if(abs(tu)<1.){float pf=sqrt(1.-tu*tu);float tl=(mod(rw,2.)*2.-1.)*dl.x*.5;float z=pf*.2+tl;if(z>best){best=z;hb=.45+.4*pf+tl*.5;}}}
 float ms=step(-8.,best);h=hb*ms;cl=mix(vec3(.1,.08,.06),vec3(.7,.71,.74)*(.65+.4*h),ms);cv=ms;}
else if(st==2){gl=.5;vec2 q=p*vec2(1.,.75)/1.5;vec2 s2=vec2(1.,1.732);vec2 a=mod(q,s2)-s2*.5;vec2 b=mod(q-s2*.5,s2)-s2*.5;vec2 g=dot(a,a)<dot(b,b)?a:b;vec2 ag=abs(g);float dg=dot(ag,vec2(.5,.866));float d=.5-max(dg,ag.x);float wr=.045+.03*v;
 float pf=sqrt(max(1.-d*d/(wr*wr),0.));pf*=mix(1.,.6+.4*abs(sin(q.y*30.)),step(dg,ag.x));h=pf*.8;float ms=smoothstep(0.,.2,pf);vec3 bg=mix(vec3(.24,.3,.17),vec3(.42,.38,.26),fbm(p*.5+sd))*(.8+.3*vnoise(p*6.));cl=mix(bg,vec3(.66,.68,.66)*(.75+.35*pf),ms);cv=ms;}
else if(st==3){bump=1.2;gl=.4;vec2 q=vec2(p.x*.7,p.y*1.4);vec2 l=vec2(fract(q.x+q.y),fract(q.x-q.y))-.5;float d=max(abs(l.x),abs(l.y))*2.;float ho=.55+.25*v;float sm=smoothstep(ho,ho+.08,d);h=sm*(.6+.3*(l.x+l.y));
 cl=mix(vec3(.04),vec3(.55,.56,.58)*(.8+.3*fbm(p*2.+sd)),sm);cv=sm;}
else if(st==4){gl=.1;vec2 l=fract(p)-.5;float dc=length(l);float rh=.1+.1*v;float hl=1.-smoothstep(rh-.025,rh,dc);float fb=fbm(p*6.+sd);h=(1.-hl)*(.7+.05*fb);vec3 bc=vec3(.66,.48,.31)*(.88+.2*fb)*(.95+.08*vnoise(p*40.+sd));
 vec3 hc=vec3(.05,.035,.02)+.15*vec3(.66,.48,.31)*smoothstep(-rh,rh,dot(l,vec2(-.7,.7)));cl=mix(bc,hc,hl);}
else if(st==5){bump=.8;gl=.35;vec2 q=p*1.5;vec2 s2=vec2(1.,1.732);vec2 a=mod(q,s2)-s2*.5;vec2 b=mod(q-s2*.5,s2)-s2*.5;vec2 g=dot(a,a)<dot(b,b)?a:b;float rh=.25+.12*v;float hl=1.-smoothstep(rh-.04,rh,length(g));h=(1.-hl)*.6;
 vec3 pc=vec3(.1,.105,.11)*(.9+.2*vnoise(p*30.+sd));vec3 fc=vec3(.03)+.02*sin(p.x*60.)*sin(p.y*60.);cl=mix(pc,fc,hl);}
else if(st==6){bump=.7;gl=.9;float u=(p.x+p.y)*.9,w=(p.x-p.y)*.9;float pk=1.-2.*max(abs(fract(u)-.5),abs(fract(w)-.5));h=pow(max(pk,0.),.6+.8*v)*.8;cl=vec3(.66,.67,.7)*(.8+.15*vnoise(vec2(p.x*.5,p.y*30.)+sd))*(.75+.35*h);}
else{gl=.8;float cb=mod(floor(p.x)+floor(p.y),2.);vec2 l=fract(p)-.5;vec2 dr=cb>.5?vec2(.7071,.7071):vec2(.7071,-.7071);float al=dot(l,dr),ac=dot(l,vec2(-dr.y,dr.x));float dd=length(vec2(max(abs(al)-.27,0.),ac))/(.085+.04*v);float pf=sqrt(max(1.-dd*dd,0.));h=pf*.7;
 cl=vec3(.72,.73,.75)*(.86+.14*vnoise(vec2(p.x*.6,p.y*60.)+sd))*(.9+.15*fbm(p*.7+sd));}`),
  Q45_N + 'Barbed Wire Fence = rows of twisted two-strand wire with four-point barbs and coils, galvanised with rust (Variation = rust) against a grey sky; Chain Mail (Maille Maker) = European 4-in-1 rings on offset rows, alternate rows tilted so rings interlock (Variation = wire gauge); Chicken Wire = hexagonal netting with twisted vertical pairs over grass (Variation = gauge); Expanded Metal Floor = diamond openings in a diagonal lattice with inclined strands (Variation = opening size); Pegboard = hardboard with round holes (Variation = hole size); Speaker Grill = hex-perforated black plate over cloth (Variation = hole size); Knurling = diamond-knurl pyramids on brushed steel (Variation = sharpness); Diamond tread plate = raised lozenges alternating +/-45 deg on brushed aluminium (Variation = lozenge width)' + Q45_T + '; wire styles use their wire mask as coverage', true);

f('q45_ff_scifi','Filter Forge Techno Textures (Carbon Fiber / Greebles / Spaceship Hull Plates)',
  [S('Style',['Carbon fiber weave','Greebles sci-fi detailing','Spaceship hull plates']),P('Scale',6,150,24,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){bump=.5;gl=.9;float ix=floor(p.x),iy=floor(p.y);float hz=v<.5?step(mod(ix-iy,4.),1.5):step(mod(ix+iy,2.),.5);float ac=mix(fract(p.x),fract(p.y),hz);float al=mix(p.y,p.x,hz);float pf=sin(3.1416*ac);
 float fi=.82+.18*vnoise(vec2(ac*50.,al*2.)+sd);h=pf*.5;cl=vec3(mix(.12,.3,hz))*fi*(.55+.6*pf)*vec3(.95,.97,1.05);}
else if(st==1){bump=.9;gl=.3;vec2 cq=p*.25;float lev=1.;for(int l=0;l<3;l++){if(hash(floor(cq)+sd+float(l)*13.7)>.45+.3*v)break;cq*=2.;lev*=2.;}
 vec2 id=floor(cq)+lev*31.;vec2 lq=fract(cq);float e=min(min(lq.x,1.-lq.x),min(lq.y,1.-lq.y));float bev=smoothstep(0.,.03*lev,e);float ins=step(.12,e);float ph=.25+.5*hash(id+sd+3.);float dt=hash(id+sd+5.);float dh=0.;
 if(dt<.2)dh=-.15*step(.5,fract(lq.y*7.))*ins;else if(dt<.38){float dc=length(lq-.5);dh=.2*(1.-smoothstep(.29,.32,dc))-.15*(1.-smoothstep(.17,.2,dc));}else if(dt<.5){vec2 g2=fract(lq*4.)-.5;dh=.12*step(max(abs(g2.x),abs(g2.y)),.3)*ins;}else if(dt<.62)dh=-.12*step(.18,e);
 h=(ph+dh)*bev;vec3 gc=vec3(.55,.57,.6)*(.78+.3*hash(id+sd+8.));if(hash(id+sd+11.)>.93)gc=vec3(.75,.55,.15);cl=gc*(.6+.4*bev)*(1.+.6*min(dh,0.));}
else{gl=.45;float r=floor(p.y/2.);float x=p.x/4.+mod(r,2.)*.5;vec2 id=vec2(floor(x),r);float lx=fract(x)*4.,ly=fract(p.y/2.)*2.;float e=min(min(lx,4.-lx),min(ly,2.-ly));float sm=smoothstep(0.,.05,e);
 float dr=length(vec2(abs(fract(lx*4.)-.5)*.25,min(abs(ly-.14),abs(ly-1.86))));dr=min(dr,length(vec2(min(abs(lx-.14),abs(lx-3.86)),abs(fract(ly*4.)-.5)*.25)));float rv=sqrt(max(1.-dr*dr/.0025,0.));
 float ph=hash(id+sd)*.2;float gr=fbm(vec2(p.x*1.5,p.y*.25)+sd);h=sm*(.5+ph+.05*sin(3.1416*lx/4.)*sin(3.1416*ly/2.))+rv*.12;
 vec3 bc=vec3(.48,.51,.55)*(.82+.3*hash(id+sd+4.));if(hash(id+sd+9.)>.86)bc=vec3(.55,.52,.42);bc*=1.-v*.45*smoothstep(.45,.7,gr);cl=mix(vec3(.08),bc,sm);cl=mix(cl,vec3(.62,.64,.66),rv*.6);}`),
  Q45_N + 'Carbon Fiber = 2/2 twill (Variation < 0.5) or plain weave of tows with fibre streaks, anisotropic sheen (warp/weft tows lit differently) and clear-coat gloss; Greebles = quadtree-split panels (up to 3 levels, Variation = split rate) at random heights with bevels and vents / knobs / studs / recesses, rare accent panels; Spaceship Hull Plates = staggered 2:1 plates with seams, rivet rows, slight bulge, paint variation and streaky grime (Variation = grime)' + Q45_T, true);

f('q45_ff_fibre','Filter Forge Fibre Textures (Berber Carpet / Cardboard / Tatami Mat / Woven Wicker)',
  [S('Style',['Berber carpet','Cardboard','Tatami mat','Woven wicker']),P('Scale',5,120,20,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){bump=.8;gl=0.;float r=floor(p.y);float xx=p.x*1.4+mod(r,2.)*.5;vec2 l=vec2(fract(xx)-.5,fract(p.y)-.5);vec2 id=vec2(floor(xx),r);float d=length(l/vec2(.48,.5));float pf=sqrt(max(1.-d*d,0.));float tw=.8+.2*sin((l.x*1.2+l.y)*28.);h=pf*tw*.8;
 float fh=hash(id+sd);vec3 yc=fh<.06+.12*v?vec3(.33,.25,.17):fh<.3?vec3(.9,.85,.74):vec3(.8,.74,.62);cl=yc*(.5+.6*pf)*(.9+.15*vnoise(p*25.+sd));}
else if(st==1){bump=.4;gl=.05;float fb=fbm(p*.8+sd);float fi=vnoise(vec2(p.x*24.,p.y*2.5)+sd)*.5+vnoise(vec2(p.x*3.,p.y*30.)+sd+5.)*.5;float cg=.5+.5*sin(p.y*3.1416*.9);float cr=exp(-abs(fbm(p*.15+sd+9.)-.5)*60.)*.7;
 h=cg*.4*v+fb*.25+fi*.05-cr*.15;cl=vec3(.7,.53,.35)*(.85+.25*fb)*(.9+.15*fi)*(1.-.25*cr);}
else if(st==2){bump=.6;gl=.1;p*=1.8;float r=floor(p.y/6.);float x=p.x/12.+mod(r,2.)*.5;vec2 id=vec2(floor(x),r);float lx=fract(x)*12.,ly=fract(p.y/6.)*6.;float her=step(min(ly,6.-ly),.55);float sn=smoothstep(0.,.06,min(lx,12.-lx));
 float pf=sin(3.1416*fract(lx*3.));float wp=fract(ly*1.2);float gv=1.-smoothstep(0.,.08,min(wp,1.-wp));h=mix(pf*.4*(1.-.5*gv),.7,her)*sn;
 vec3 sw=mix(vec3(.78,.72,.45),vec3(.6,.68,.36),v)*(.85+.25*hash(vec2(floor(lx*3.),id.x+id.y*7.)+sd))*(.75+.3*pf);vec3 hc=vec3(.07,.12,.1)*(.85+.3*step(.5,fract((lx+ly)*2.)));cl=mix(sw,hc,her)*(.4+.6*sn);}
else{gl=.25;float r=floor(p.y*1.6);float ly=fract(p.y*1.6);float z=cos(3.1416*(p.x+r));float wp=sin(3.1416*ly);float hw=(.45+.3*z)*pow(max(wp,0.),.6+.6*v);float dx=p.x-floor(p.x+.5);float hs=.5*sqrt(max(1.-dx*dx/.03,0.));h=max(hw,hs);
 vec3 wc=vec3(.78,.6,.34)*(.85+.25*hash(vec2(r,sd)))*(.85+.15*vnoise(vec2(p.x*3.,ly*20.)+sd));cl=(hw>=hs?wc:vec3(.6,.45,.25))*(.35+.65*smoothstep(0.,.4,h));}`),
  Q45_N + 'Berber Carpet = offset rows of looped-pile tufts with ply twist, oatmeal yarn with dark berber flecks (Variation = fleck amount); Cardboard = kraft brown fibres, mottling, soft creases and corrugation ridges showing through (Variation = corrugation); Tatami Mat = staggered 2:1 mats of igusa rush straws with warp grooves and dark heri borders (Variation = straw green-ness); Woven Wicker = round weavers passing over / under upright stakes in alternate rows (Variation = weaver fullness)' + Q45_T, true);

f('q45_ff_building','Filter Forge Building Textures (Asphalt / Roof Shingles / Cinder Blocks / Flagstones / Terrazzo / Wattle and Daub)',
  [S('Style',['Asphalt road','Asphalt roof shingles','Cinder blocks','Flagstones','Terrazzo tiles','Wattle and daub']),P('Scale',6,150,30,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){bump=.8;gl=.15;${Q45_V('p*4.5', '1.')}float e=f2-f1;float hs=hash(cid+sd+1.);float stn=smoothstep(.12,.2,e)*step(.25,hs);float fn=vnoise(p*30.+sd);float cr=(1.-smoothstep(0.,.035,abs(fbm(p*.25+sd+2.)-.5)))*smoothstep(.3,.8,v);
 h=stn*(.3+.2*hs)+fn*.08-cr*.4;vec3 sc3=mix(vec3(.28,.27,.26),vec3(.62,.6,.57),hs)*mix(.6,1.,v);cl=mix(vec3(.11,.11,.115)*(1.+v*.6),sc3,stn*mix(.5,1.,v))*(.85+.25*fn)*(1.-.7*cr);}
else if(st==1){gl=.1;float r=floor(p.y);float ly=fract(p.y);float x=p.x/1.6+r*.5;float tx=fract(x);float ti=floor(x);float slot=step(min(tx,1.-tx)*1.6,.035)*step(ly,.62);float gr=hash(floor(p*28.)+sd);h=(.25+.55*(1.-ly))*(1.-slot*.8)+gr*.04;
 float tv=hash(vec2(ti,r)+sd);vec3 sh=mix(vec3(.25,.26,.27),mix(vec3(.38,.3,.24),vec3(.18,.18,.2),tv),v)*(.75+.5*gr)*(.85+.3*tv*v);cl=sh*(1.-.55*smoothstep(.75,1.,ly))*(1.-.75*slot);}
else if(st==2){gl=.05;float r=floor(p.y/2.);float x=p.x/4.+mod(r,2.)*.5;vec2 id=vec2(floor(x),r);float lx=fract(x)*4.,ly=fract(p.y/2.)*2.;float e=min(min(lx,4.-lx),min(ly,2.-ly));float blk=smoothstep(.06,.12,e);${Q45_V('p*6.', '1.')}
 float pit=(1.-smoothstep(.1,.2,f1))*step(.7-.4*v,hash(cid+sd+2.));float fb=fbm(p*2.+sd);h=blk*(.7+.1*fb)-pit*.25*blk+(1.-blk)*.2;vec3 bc=vec3(.58,.57,.54)*(.88+.18*hash(id+sd))*(.85+.25*fb);cl=mix(vec3(.68,.66,.6),bc*(1.-.55*pit),blk);}
else if(st==3){gl=.15;vec2 q=p*.45+vec2(fbm(p*.4+sd),fbm(p*.4+sd+3.))*.35;${Q45_V('q', '1.')}float e=f2-f1;float gw=.05+.1*v;float sn=smoothstep(gw,gw+.05,e);float fb=fbm(p*1.2+cid*2.3+sd);h=sn*(.55+.25*smoothstep(gw,gw+.35,e)+.15*fb)+(1.-sn)*.1*vnoise(p*8.);
 float hs=hash(cid+sd+6.);vec3 stc=hs<.33?vec3(.45,.48,.5):hs<.66?vec3(.7,.6,.46):vec3(.6,.43,.34);cl=mix(vec3(.26,.28,.18)*(.8+.4*vnoise(p*10.+sd)),stc*(.78+.35*fb),sn);}
else if(st==4){bump=.3;gl=.6;cl=vec3(.86,.84,.79)*(.94+.08*vnoise(p*20.+sd));${Q45_V('p*.9', '1.')}float c1=smoothstep(.3,.34,f2-f1)*step(hash(cid+sd+1.),.25+.45*v);float hc=hash(cid+sd+4.);
 vec3 cc=hc<.25?vec3(.95,.94,.9):hc<.45?vec3(.15,.14,.14):hc<.65?vec3(.62,.6,.57):hc<.82?vec3(.7,.33,.24):vec3(.35,.5,.4);cl=mix(cl,cc*(.9+.15*vnoise(p*12.+cid)),c1);${Q45_V('p*3.2', '1.')}
 float c2=smoothstep(.25,.3,f2-f1)*step(hash(cid+sd+7.),.35+.4*v)*(1.-c1);hc=hash(cid+sd+9.);cc=hc<.3?vec3(.1):hc<.55?vec3(.97):hc<.75?vec3(.75,.4,.25):vec3(.55,.55,.52);cl=mix(cl,cc,c2);h=.4+.03*(c1+c2);}
else{gl=.05;float r=floor(p.y*1.2);float ly=fract(p.y*1.2);float z=cos(3.1416*(p.x/1.5+r));float wp=sin(3.1416*ly);float hw=(.35+.2*z)*pow(max(wp,0.),.5)*(.85+.3*vnoise(vec2(p.x*.8,r)+sd));vec3 wc=vec3(.42,.32,.2)*(.75+.35*vnoise(vec2(p.x*4.,ly*12.+r)+sd))*(.4+.6*wp);
 float th=.54-.2*v;float db=1.-smoothstep(th,th+.04,fbm(p*.3+sd+5.));float fb=fbm(p*1.5+sd);float sw=smoothstep(.72,.8,vnoise(vec2(p.x*1.5+p.y*.7,p.y*25.)+sd));${Q45_V('p*.8', '1.')}float crk=(1.-smoothstep(0.,.05,f2-f1))*step(.62,fbm(p*.5+sd+8.));
 h=mix(hw,.75+.12*fb-.2*crk,db);vec3 dc=mix(vec3(.74,.64,.48)*(.85+.25*fb),vec3(.85,.75,.45),sw*.5)*(1.-.35*crk);cl=mix(wc,dc,db);}`),
  Q45_N + 'Asphalt road = Voronoi aggregate stones in dark binder, fine grit, wear exposing lighter stones and cracks (Variation = wear); Asphalt Roof Shingles = 3-tab shingle rows offset by half a tab, cut-out slots, butt-edge shadow and granule speckle (Variation = tab colour mix); Cinder Blocks = 2:1 running-bond concrete masonry units with mortar joints and porous pits (Variation = pit density); Flagstones = warped irregular Voronoi stones in slate / sandstone / red tones with soil-and-moss joints (Variation = joint width); Terrazzo Tiles = two sizes of angular chips (shrunk Voronoi cells) in white / black / grey / terracotta / green over cement, polished (Variation = chip density); Wattle and Daub = clay daub with straw and cracks over woven wattle that shows through where it has fallen away (Variation = loss)' + Q45_T, true);

f('q45_ff_stone','Filter Forge Stone Textures (Dry Lakebed / Malachite / Geode / Lichen Stone / Stalactite Cave / Travertine / Widmanstatten)',
  [S('Style',['Dry lakebed cracked mud','Malachite','Geode','Lichen covered stone','Stalactite cave','Travertine','Widmanstatten pattern']),P('Scale',8,200,40,1,'px'),P('Variation',0,1,.5,.01),Q45_OUT],
  Q45_F(`if(st==0){gl=.05;vec2 q=p*.6+vec2(fbm(p*.6+sd),fbm(p*.6+sd+4.))*.3;${Q45_V('q', '.9')}float e=f2-f1;float cw=.04+.07*v;float pl=smoothstep(cw,cw+.03,e);float cu=1.-smoothstep(cw,cw+.35,e);float fb=fbm(p*2.+sd);${Q45_V('p*2.2', '1.')}float fc=(1.-smoothstep(0.,.05,f2-f1))*.5;
 h=pl*(.45+.3*cu+.08*fb-.15*fc);cl=mix(vec3(.18,.14,.1),vec3(.75,.65,.5)*(.85+.25*fb)*(1.+.12*cu)*(1.-.4*fc),pl);}
else if(st==1){bump=.3;gl=.8;vec2 q=p*.5;vec2 w=q+vec2(fbm(q*.7+sd),fbm(q*.7+sd+5.))*.9;${Q45_V('w', '.9')}float fq=25.+30.*v;float bd=sin(f1*fq+fbm(q*3.+sd)*3.);float tn=smoothstep(-.3,.6,bd)*(.8+.2*sin(f1*fq*.37));
 cl=mix(vec3(.02,.2,.12),vec3(.3,.78,.52),tn)*(.7+.3*smoothstep(0.,.06,f2-f1));h=tn*.1;}
else if(st==2){bump=.9;gl=.55;vec2 q=p/4.;vec2 ci=floor(q);vec2 l=fract(q)-.5;float rr=length(l)/(.42*(1.+.18*(fbm(l*3.+ci*5.+sd)-.5)));float hn=hash(ci+sd);
 vec3 ag=mix(vec3(.85,.85,.88),mix(vec3(.35,.45,.7),vec3(.55,.35,.6),hn),.5+.5*sin(rr*70.+fbm(l*6.+sd)*4.));${Q45_V('p*1.6', '1.')}float fac=hash(cid+sd+3.);vec3 crc=mix(vec3(.45,.22,.6),vec3(.85,.8,.9),v)*(.55+.5*fac)*(.4+rr);
 if(rr>1.){cl=vec3(.42,.38,.33)*(.75+.4*fbm(p*.8+sd));h=.35+.15*fbm(p*.8+sd);}else if(rr>.88){cl=vec3(.88,.86,.8)*(.9+.1*fbm(p*5.));h=.6;}else if(rr>.6){cl=ag;h=.55;}else{cl=crc;h=.15+.4*rr+.25*(1.-f1);}}
else if(st==3){gl=.05;float fb=fbm(p*.5+sd);float fd=fbm(p*3.+sd+2.);vec3 rk=vec3(.55,.55,.53)*(.75+.35*fb)*(.88+.2*fd)*(.9+.15*step(.8,hash(floor(p*14.)+sd)));h=fb*.6+fd*.12;
 float lp=fbm(p*.7+sd+9.)-(.58-.25*v);float lm=smoothstep(0.,.04,lp);float rg=.5+.5*sin(lp*90.);float cr=vnoise(p*12.+sd);float sp=fbm(p*.2+sd+4.);vec3 lc=sp<.45?vec3(.72,.76,.38):sp<.55?vec3(.88,.55,.16):vec3(.66,.72,.62);
 lc*=(.8+.25*rg)*(.85+.25*cr)*(1.+.25*(1.-smoothstep(0.,.08,lp)));h+=lm*(.08+.04*rg+.04*cr);cl=mix(rk,lc,lm);}
else if(st==4){gl=.6;float ty=fract(p.y/6.);float cy=floor(p.y/6.);cl=vec3(.04,.035,.03)*(1.+fbm(p*.6+sd));
 for(int m=0;m<3;m++){float fm=float(m);float zs=1.6-.3*fm;float qx=p.x*zs+fm*3.7;float ix=floor(qx);float xc=fract(qx)-.5-(hash(vec2(ix,cy+fm*5.)+sd)-.5)*.3;float dcz=(1.-ty)*6.*zs;float w=.42*pow(max(1.-dcz/(1.+(2.+2.*v)*hash(vec2(ix,cy+fm*11.)+sd)),0.),1.3);
  float wg=.45*pow(max(1.-ty*6.*zs/(.4+1.4*hash(vec2(ix,cy+fm*7.)+sd+1.)),0.),.8);float ww=max(w,wg);
  if(abs(xc)<ww&&ww>.005){float pf=sqrt(1.-xc*xc/(ww*ww));h=.3+.35*fm+.3*pf;cl=vec3(.78,.66,.5)*(.35+.3*fm)*(.6+.5*pf)*(.85+.15*sin(dcz*25.+fbm(vec2(qx*3.,ty*9.))*4.));}}
 float rb=max(smoothstep(.9,.97,ty+.04*fbm(p*.8+sd)),1.-smoothstep(.03,.1,ty-.04*fbm(p*.8+sd+2.)));cl=mix(cl,vec3(.35,.3,.24)*(.7+.4*fbm(p*2.+sd)),rb);h=max(h,rb*.8);}
else if(st==5){bump=.6;gl=.3;float bd=fbm(p*vec2(.3,1.4)+sd);float s5=.5+.5*sin(p.y*5.+bd*6.);vec3 tc=mix(vec3(.9,.83,.7),vec3(.74,.6,.43),smoothstep(.35,.7,bd))*(.9+.1*s5);float hv=vnoise(p*vec2(.9,5.)+sd+11.)*.6+vnoise(p*vec2(2.5,12.)+sd)*.4;float th=.7-.12*v;float hl=smoothstep(th,th+.04,hv);
 h=.6-.4*hl+.03*s5;cl=mix(tc,vec3(.5,.4,.28)*(.7+.3*hv),hl);}
else{bump=.4;gl=.5;float bk=0.,tone=.45,rim=0.;for(int m=0;m<3;m++){float fm=float(m);float a=fm*1.0472+.3;vec2 dr=vec2(cos(a),sin(a));float d=dot(p,dr)*2.2+.5*fbm(p*.25+fm*7.+sd);float bi=floor(d);float fr=abs(fract(d)-.5)*2.;float lw=.45+.35*hash(vec2(bi,fm)+sd);
  float sg=smoothstep(.42,.5,vnoise(vec2(bi*7.31+fm*31.,dot(p,vec2(-dr.y,dr.x))*(.25+.3*v))+sd));float ins=(1.-smoothstep(lw-.06,lw,fr))*sg;float pr=ins*(.6+.4*hash(vec2(bi,fm)+sd+3.));if(pr>bk){bk=pr;tone=m==0?.85:m==1?.55:.7;rim=smoothstep(lw-.12,lw-.03,fr)*ins;}}
 float pl=vnoise(p*14.+sd);float ks=smoothstep(0.,.15,bk);cl=mix(vec3(.32,.33,.34)*(.7+.5*pl),vec3(.62,.64,.67)*tone*(.9+.1*vnoise(p*3.+sd)),ks)+rim*.35;h=.5*ks+.05*pl;}`),
  Q45_N + 'Dry Lakebed = warped Voronoi mud plates curling up at the crack edges plus fine secondary cracks (Variation = crack width); Malachite = concentric light / dark green bands around warped botryoidal centres, polished (Variation = band density); Geode = one cut geode per cell: host rock, white rind, blue-violet agate banding and a faceted crystal cavity (Variation = amethyst to clear quartz); Lichen Covered Stone = grey granite with yellow-green / orange / grey-green rosette lichen patches (Variation = coverage); Stalactite Cave = three depth layers of tapering stalactites and stalagmites with flowstone ripples between rock ceiling and floor bands (Variation = stalactite length); Travertine = cream / tan banded stone with horizontally elongated voids (Variation = void amount); Widmanstatten = etched meteoritic iron: interrupted kamacite lamellae in three directions 60 deg apart with orientation-dependent sheen, bright taenite rims and dark plessite fill (Variation = lamella length)' + Q45_T, true);
