/* ================= q48b: Filter Forge library 2 look re-creations (round 18), grouped with selectors ================= */
f = add('Render');
f('q48_ff_tilings','Filter Forge Fractal Tilings & Windows (Gosper / Hexaflake / N-Uniform / Persian Rug / Lace / Rose Window / Cloisonne)',
  [S('Pattern',['Gosper Island tiling','Hexaflake fractal','N-uniform tiling 3.4.6.4','Persian Rug','Lace tablecloth','Rose Window','Cloisonne d Art Nouveau']),P('Depth',1,5,3,1),P('Seed zoom',.2,3,1,.01),P('Seed rotation',-180,180,0,1,'deg')],
  `
#define SEEDC(qq) O(clamp(.5+(RT*(qq))*(.3*mn/u_p2)/Wd,0.,1.)).rgb
#define HEXF(qq) (length(qq)*vec2(cos(abs(mod(atan((qq).y,(qq).x),1.0472)-.5236)),sin(abs(mod(atan((qq).y,(qq).x),1.0472)-.5236))))
 vec2 Wd=PX(vec2(1.));vec2 p=PX(uv)-Wd*.5;float mn=min(Wd.x,Wd.y);int m=int(u_p0+.5);int DP=int(clamp(u_p1+.5,1.,5.));float an=radians(u_p3);mat2 RT=mat2(cos(an),sin(an),-sin(an),cos(an));
 vec3 bg=vec3(.06,.055,.07);float sd=fract(u_seed*.123)*50.;
 if(m==0||m==2){float LL=1.;vec2 z;if(m==0){float s=mn*.45/(1.6*pow(2.6458,float(DP-1)));z=p/s;}else{float s=mn/(1.2+float(DP)*1.4);LL=2.7320508;z=mat2(.866025,-.5,.5,.866025)*(p/s)/LL;}
  float b0=floor(z.y/.866025),a0=floor(z.x+b0*.5);vec2 best=vec2(0.);float bd=1e9;
  for(int j=0;j<2;j++)for(int i=0;i<2;i++){vec2 ab=vec2(a0+float(i),b0+float(j));vec2 e=vec2(ab.x-ab.y*.5,ab.y*.866025);float dd=length(z-e);if(dd<bd){bd=dd;best=ab;}}
  vec2 q=z-vec2(best.x-best.y*.5,best.y*.866025);
  if(m==0){vec2 ab=best;for(int k=0;k<5;k++){if(k>=DP)break;for(int t=0;t<7;t++){vec2 dg=t==0?vec2(0.):t==1?vec2(1.,0.):t==2?vec2(-1.,0.):t==3?vec2(0.,1.):t==4?vec2(0.,-1.):t==5?vec2(1.,1.):vec2(-1.,-1.);vec2 w=ab-dg;
     float u7=3.*w.x-w.y,v7=w.x+2.*w.y;float qu=floor(u7/7.+.5),qv=floor(v7/7.+.5);if(abs(u7-7.*qu)<.5&&abs(v7-7.*qv)<.5){ab=vec2(qu,qv);break;}}}
   float hx=max(max(abs(q.x),abs(dot(q,vec2(.5,.866025)))),abs(dot(q,vec2(-.5,.866025))));
   if(length(ab)>.5)return vec4(bg,1.);if(hx>.45)return vec4(bg*1.6,1.);return vec4(SEEDC(HEXF(q/.577)),1.);}
  q=mat2(.866025,.5,-.5,.866025)*q*LL;float th=atan(q.y,q.x),r=length(q);float ph=abs(mod(th-.5236,1.0472)-.5236);vec2 qf=r*vec2(cos(ph),sin(ph));
  float ln=qf.x<.866?abs(qf.x-.866):(qf.x<1.866?min(abs(qf.x-.866),abs(qf.y-.5)):abs(qf.y-.5));if(qf.x>.866&&qf.y>.5)ln=min(ln,length(qf-vec2(.866,.5)));
  vec3 col;if(qf.x<.866)col=SEEDC(HEXF(q));else if(qf.y<.5&&qf.x<1.866)col=SEEDC(abs(qf-vec2(1.366,0.))*1.6);else col=SEEDC((qf-1.577*vec2(.866,.5))*1.4);
  return vec4(mix(bg,col,smoothstep(.03,.07,ln)),1.);}
 if(m==1){vec2 q=p/(mn*.46);float hz=max(max(abs(q.y),abs(dot(q,vec2(.866025,.5)))),abs(dot(q,vec2(.866025,-.5))));if(hz>.866)return vec4(bg,1.);
  for(int k=0;k<5;k++){if(k>=DP)break;vec2 bc=vec2(0.);float bd=length(q);for(int t=0;t<6;t++){float a=float(t)*1.0472;vec2 cc=.6667*vec2(cos(a),sin(a));if(length(q-cc)<bd){bd=length(q-cc);bc=cc;}}
   q=(q-bc)*3.;hz=max(max(abs(q.y),abs(dot(q,vec2(.866025,.5)))),abs(dot(q,vec2(.866025,-.5))));if(hz>.866)return vec4(bg,1.);}
  return vec4(SEEDC(HEXF(mat2(0.,1.,-1.,0.)*q)),1.);}
 if(m==3){vec2 dq=Wd*.5-abs(p);float dp=min(dq.x,dq.y);float bw=mn*.06;bool hz=dq.y<dq.x;float t=hz?p.x:p.y;
  vec3 nv=vec3(.08,.12,.3),cr=vec3(.6,.07,.08),iv=vec3(.93,.87,.72),gd=vec3(.85,.6,.2),dk=vec3(.12,.05,.05);vec3 col;
  if(dp<bw){float u=dp/bw;col=abs(fract(t/(bw*.7))-.5)+abs(u-.5)<.3?gd:nv;}
  else if(dp<2.2*bw){float u=(dp-bw)/(1.2*bw);col=abs(fract(t/bw)-.5)*2.<u?cr:iv;if(u<.12||u>.88)col=dk;}
  else{vec2 k=abs(p)/(mn*.5);vec2 k2=abs(vec2(k.x+k.y,k.x-k.y))*.7071;vec3 sc=SEEDC(k2*1.3);float l=luma(sc);int pi=int(min(l*5.,4.99));
   vec3 pc=pi==0?dk:pi==1?nv:pi==2?cr:pi==3?gd:iv;col=mix(pc,sc,.25);float dm=abs(k.x+k.y-.55);if(dm<.025)col=gd;if(abs(k.x+k.y-.62)<.012)col=iv;}
  col*=.88+.12*hash(floor(p*.7));col*=.92+.08*sin(p.x*1.7);return vec4(col,1.);}
 if(m==4){
#define LACE(qq) {vec2 lq=(qq)/(mn*.48);float r=length(lq),th=atan(lq.y,lq.x);float tw=.012*u_p2;float sc=.93+.04*cos(th*24.);float a=0.;\
  if(r<sc){float rr=fract(r*float(DP+3));a=max(a,step(abs(rr-.5),tw*float(DP+3)*.8+.03));float sp=abs(fract(th*12./6.2832)-.5);a=max(a,step(sp*r*6.2832/12.,tw));\
   a=max(a,step(abs(fract(r*float(DP+3)+.35*cos(th*12.))-.5),tw*6.));a=max(a,step(abs(r-sc),tw*1.5));if(r<.12)a=max(a,step(.5,fract(r*30.)));}\
  else{vec2 g=(qq)/(mn*.05);vec2 gg=vec2(g.x-g.y*.577,g.y*1.1547);vec2 f3=abs(fract(gg)-.5);a=max(a,step(min(min(f3.x,f3.y),abs(fract(gg.x+gg.y)-.5)),tw*4.+.02));}\
  LA=a;}
  float LA=0.,LB=0.;LACE(p) LB=LA;LACE(p+vec2(-2.,2.)*u_k) vec3 base=c.rgb*.55*vec3(.9,.85,.95);base*=1.-.5*LA;return vec4(mix(base,vec3(.96,.95,.9),LB),1.);}
 if(m==5){float r=length(p)/(mn*.47),th=atan(p.y,p.x);if(r>1.){vec2 b=p/(mn*.06);b.x+=mod(floor(b.y),2.)*.5;vec2 fb=abs(fract(b)-.5);return vec4(vec3(.42,.4,.37)*(.85+.15*hash(floor(b)))*(min(fb.x,fb.y)<.04?.6:1.),1.);}
  if(r>.95)return vec4(vec3(.5,.48,.44)*(.8+.4*(1.-abs(r-.975)*40.)),1.);float N=6.+2.*float(DP);float sw=6.2832/N;float sec=floor(th/sw);float ph=abs(mod(th,sw)-sw*.5);vec2 lq=r*vec2(cos(ph),sin(ph));
  int id;float ld=min(min(abs(r-.2),abs(r-.6)),abs(r-.92));
  if(r<.2){id=cos(th*8.)>0.?0:1;ld=min(ld,abs(cos(th*8.))*r*.12);}
  else if(r<.6){float cd=length(lq-vec2(.4,0.));id=cd<.15?(cd<.06?4:2):3;ld=min(ld,min(abs(cd-.15),abs(cd-.06)));if(id==3)ld=min(ld,abs(lq.y-lq.x*tan(sw*.5)));}
  else if(r<.92){float ar=abs(lq.y)/max(sin(sw*.5)*r,1e-3);float tip=smoothstep(.78,.9,r);id=ar<.62*(1.-tip)?5:6;ld=min(ld,abs(ar-.62*(1.-tip))*sin(sw*.5)*r);if(id==6)ld=min(ld,abs(lq.y-lq.x*tan(sw*.5)));}else id=7;
  vec3 pal[8]=vec3[8](vec3(.9,.65,.1),vec3(.1,.25,.75),vec3(.75,.08,.1),vec3(.08,.2,.65),vec3(.95,.8,.2),vec3(.1,.5,.25),vec3(.12,.15,.6),vec3(.55,.1,.45));vec3 gl=pal[0];for(int i=1;i<8;i++)if(i==id)gl=pal[i];
  gl*=.75+.5*hash(vec2(float(id),mod(sec,2.))+sd);gl*=.75+.45*fbm(p/(mn*.03)+sd);return vec4(mix(vec3(.06),gl,smoothstep(.006*u_p2,.011*u_p2,ld)),1.);}
 float r=length(p)/(mn*.47),th=atan(p.y,p.x);if(r>1.)return vec4(bg,1.);
 if(r>.9){float h=1.-abs(r-.95)*20.;return vec4(vec3(.85,.65,.25)*(.55+.6*h),1.);}
 float N=4.+2.*float(DP);float sw=6.2832/N;float ph=abs(mod(th,sw)-sw*.5);vec2 w=r*vec2(cos(ph),sin(ph))*4.;w+=.35*vec2(fbm(w+sd),fbm(w.yx+sd+3.))-.17;
 vec2 iw=floor(w);float f1=9.,f2=9.;vec2 id=vec2(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=iw+vec2(float(i),float(j));vec2 o=g+.5+.4*(vec2(hash(g+sd),hash(g+sd+7.))-.5);float dd=length(w-o);if(dd<f1){f2=f1;f1=dd;id=g;}else if(dd<f2)f2=dd;}
 float h=hash(id+sd);vec3 en=mix(vec3(.08,.45,.48),vec3(.62,.12,.2),step(.55,h));en=mix(en,vec3(.85,.75,.45),step(.85,h));en*=.7+.5*hash(id+sd+2.);
 float e=f2-f1;float wire=smoothstep(.06,.03,e);vec3 col=mix(en*(.85+.3*smoothstep(.3,0.,f1)),vec3(.88,.7,.3)*(.7+.6*smoothstep(.06,0.,e)),wire);return vec4(col,1.);`,
  'Filter Forge library filters re-created from their descriptions and control lists (approx. looks, not the filter graphs): Gosper Island (Rachel Duim) = hexagonal seed (triangle of the image mirrored 6x) on every cell of a level-Depth Gosper island (exact 7-hex Eisenstein base-(2-w) digit test); Hexaflake (Rachel Duim) = 7-way hexaflake recursion with the hex seed; N-Uniform Tiles = image-seeded 3.4.6.4 semi-regular tiling (one of the N-uniform family; Depth sets the tile count); Persian Rug 2 (Kraellin) = 4-fold kaleidoscope of the image posterised into a rug palette with motif borders; Lace Table Cloth (Persidio) = doily rings, spokes and scallops plus hex net over the darkened image, with drop shadow; Rose Window (ScaryKitty) = radially symmetric stained glass (rosette, roundels, lancets) with leading, in a stone wall; Cloisonne d Art Nouveau (ScaryKitty) = kaleidoscopic warped Voronoi enamel cells in gold wire inside a round frame; Seed zoom/rotation place the image seed, Seed zoom = leading/thread width for the window and lace', true);

f = add('Stylize');
f('q48_ff_photo','Filter Forge Photo Stylizers (Bilevel Screening / Chuck Close / Decoupage / Navajo / Barcode / SX-70 / Etch-A-Sketch / Tattoo)',
  [S('Effect',['Bilevel Screening','Chuck Close V2','Decoupage','Navajo Weaver','Barcode Color Art','SX-70 emulsion manipulation','Pocket Etch-A-Sketch','Tattoo Me']),P('Cell size',3,60,12,1,'px'),P('Amount',0,1,.6,.01),P('Detail',0,1,.5,.01)],
  `vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);float cs=u_p1,mn=min(Wd.x,Wd.y);int m=int(u_p0+.5);vec3 C=c.rgb;float l=luma(C);float sd=fract(u_seed*.123)*50.;
 if(m==0){float lp=blurL(uv,R(.6));float hp=l-blurL(uv,R(cs*.35));float v=lp+u_p2*2.5*hp;vec2 pr=mat2(.7071,.7071,-.7071,.7071)*p/cs;float scr=.5+.25*(cos(6.2832*pr.x)+cos(6.2832*pr.y));return vec4(vec3(step(mix(.5,scr,u_p3),v)),1.);}
 if(m==1){vec2 ce=floor(p/cs);vec2 q=fract(p/cs)-.5;vec3 cc=O(fromPX((ce+.5)*cs)).rgb;float h=hash(ce+sd),h2=hash(ce+sd+3.1);vec3 hv=rgb2hsv(cc);
  float dm=h<.5?length(q):(abs(q.x)+abs(q.y))*.78;float r1=.44*(1.-.25*u_p3*h2),r2=.22*(1.-.4*u_p3*h);
  vec3 bgc=hsv2rgb(vec3(fract(hv.x+.5*u_p2),min(hv.y+.2,1.),hv.z*.75));vec3 o1=hsv2rgb(vec3(fract(hv.x+(h-.5)*.4*u_p2),min(hv.y*1.2+.1,1.),min(hv.z*1.1,1.)));vec3 o2=hsv2rgb(vec3(fract(hv.x-(h2-.5)*.6*u_p2),hv.y,clamp(hv.z+(h2-.5)*.5,0.,1.)));
  vec3 col=dm<r2?o2:dm<r1?o1:bgc;if(max(abs(q.x),abs(q.y))>.47)col*=.5;return vec4(col,1.);}
 if(m==2){vec2 g=p/(cs*3.);vec2 ig=floor(g);float f1=9.,f2=9.;vec2 id=vec2(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 gg=ig+vec2(float(i),float(j));vec2 o=gg+.5+.8*(vec2(hash(gg+sd),hash(gg+sd+5.))-.5);float dd=length(g-o);if(dd<f1){f2=f1;f1=dd;id=gg;}else if(dd<f2)f2=dd;}
  vec2 sh=(vec2(hash(id+1.),hash(id+2.))-.5)*cs*.4;vec3 col=O(fromPX(p+sh)).rgb;float e=(f2-f1)+.08*(fbm(p/(cs*.4))-.5);col=mix(col,vec3(.97,.95,.9),smoothstep(.035,.02,e));col*=1.-.35*smoothstep(.08,.035,e)*step(.035,e);
  vec2 g2=p/(cs*.9);vec2 i2=floor(g2);float a1=9.,a2=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 gg=i2+vec2(float(i),float(j));vec2 o=gg+.5+.8*(vec2(hash(gg+sd+9.),hash(gg+sd+4.))-.5);float dd=length(g2-o);if(dd<a1){a2=a1;a1=dd;}else if(dd<a2)a2=dd;}
  col*=1.-.45*u_p2*smoothstep(.06,.0,a2-a1);col=mix(col,col*vec3(1.,.9,.65),.5*u_p2);col*=1.-.4*u_p3*smoothstep(.3,.8,length(uv-.5));col+=.12*smoothstep(.65,.9,fbm(p/(mn*.1)));return vec4(clamp(col,0.,1.),1.);}
 if(m==3){vec2 bs=vec2(cs,cs*.5);vec2 pp=p;if(u_p3>.5)pp.x=Wd.x*.5-abs(pp.x-Wd.x*.5);vec2 ce=floor(pp/bs);vec3 sc=O(fromPX((ce+.5)*bs)).rgb;
  vec3 pal[6]=vec3[6](vec3(.62,.1,.08),vec3(.08,.07,.06),vec3(.9,.87,.8),vec3(.55,.52,.48),vec3(.75,.55,.2),vec3(.4,.25,.15));vec3 bc=pal[0];float bd=9.;for(int i=0;i<6;i++){float dd=length(pal[i]-sc);if(dd<bd){bd=dd;bc=pal[i];}}
  vec3 col=mix(sc,bc,.4+.6*u_p2);float fy=fract(p.y/(cs*.25));col*=.78+.22*sin(3.1416*fy);col*=.93+.07*sin(p.x*6.2832/(cs*.25));col*=.9+.2*vnoise(p*.9);return vec4(col,1.);}
 if(m==4){float TT=cs*3.;float row=floor(p.y/TT);vec2 pp=p+vec2(mod(row,2.)*TT*.5*u_p3,0.);vec2 ti=floor(pp/TT);vec2 lq=fract(pp/TT)-.5;float nb=6.+floor(hash(ti+sd)*10.);float bx=floor((lq.x+.5)*nb);
  vec3 col=O(fromPX(vec2((ti.x+(bx+.5)/nb)*TT-mod(row,2.)*TT*.5*u_p3,(ti.y+.5)*TT))).rgb;col*=.7+.6*hash(vec2(bx,ti.x+ti.y*31.)+sd);float g=luma(col);col=mix(vec3(step(.5,g)),col,u_p2);
  vec2 dq=abs(lq)-.5+.06+.2*u_p3;float rr=.06+.2*u_p3;float sdf=length(max(dq,0.))-rr;col*=sdf>-.01?.15:1.+.25*(lq.y+.5)*smoothstep(-.06,-.01,sdf);
  if(u_p3>.5&&length(abs(lq)-.36)<.05)col=vec3(.75)*(1.2-length(abs(lq)-.36)*10.);return vec4(clamp(col,0.,1.),1.);}
 if(m==5){float b=Wd.x*.05,bb=Wd.y*.17;if(p.x<b||p.x>Wd.x-b||p.y<bb||p.y>Wd.y-b)return vec4(vec3(.95,.94,.9)*(.97+.03*vnoise(p*.3)),1.);
  vec2 u2=(p-vec2(b,bb))/(Wd-vec2(2.*b,b+bb));vec2 n=vec2(fbm(p/(cs*4.)+sd),fbm(p/(cs*4.)+sd+5.3))-.5;vec2 dir=normalize(n+1e-4);vec3 acc=vec3(0.);
  for(int i=0;i<6;i++){acc+=O(clamp(u2+n*u_p2*.07+dir*float(i-3)*cs*u_p3*.25/Wd,0.,1.)).rgb;}vec3 col=acc/6.;float sl=smoothstep(.04,0.,abs(fract(fbm(p/(cs*2.)+sd)*7.)-.5)-.45)*u_p2;
  col=mix(col,vec3(luma(col)),.25);col=col*.86+.06;col=mix(col*vec3(.85,1.,1.05),col*vec3(1.08,1.,.85),smoothstep(.2,.7,luma(col)));col+=sl*.12;return vec4(clamp(col,0.,1.),1.);}
 if(m==6){vec2 q=p-Wd*.5;vec2 hb=Wd*.5-mn*.02;vec2 dq=abs(q)-hb+mn*.06;float fr=length(max(dq,0.))-mn*.06;if(fr>0.)return vec4(vec3(.1),1.);
  float i0=mn*.1,ib=mn*.22;vec2 so=vec2(i0,ib),se=Wd-vec2(i0,i0);vec2 cq=p-(so+se)*.5;vec2 ch=(se-so)*.5;vec2 d2=abs(cq)-ch+mn*.03;float sdf=length(max(d2,0.))+min(max(d2.x,d2.y),0.)-mn*.03;
  if(sdf>0.){vec3 red=vec3(.8,.08,.06)*(.75+.35*(p.y/Wd.y))+.25*smoothstep(-mn*.015,0.,fr);for(int k=0;k<2;k++){vec2 kc=vec2(k==0?mn*.11:Wd.x-mn*.11,mn*.1);float kd=length(p-kc)/(mn*.065);if(kd<1.)red=vec3(.95)*(1.-.35*kd*kd)+.05*dot(normalize(p-kc+1e-4),vec2(-.7,.7));}return vec4(red,1.);}
  vec2 u2=(p-so)/(se-so);float ed=length(sobel(u2))*(1.5+u_p3*4.);float lu=luma(O(u2).rgb);float hat=step(abs(fract(p.y/(cs*.5))-.5),.12)*step(lu,u_p2*.6);
  float ink=max(smoothstep(.25,.6,ed),hat*.8);vec3 col=vec3(.76,.76,.74)*(.95+.05*vnoise(vec2(p.x*.05,p.y*2.)));return vec4(mix(col,vec3(.28,.28,.3),ink)*(1.-.25*smoothstep(-mn*.03,0.,sdf)),1.);}
 vec3 skin=vec3(.87,.67,.55)*(.92+.08*fbm(p*.04+sd));vec2 pc=floor(p/2.5);skin*=1.-.12*step(.93,hash(pc+sd));
 vec2 ec=(p-Wd*.5)/(Wd*.5*vec2(.8,.9)*(.3+u_p2));float mk=smoothstep(1.,.8,length(ec));float ed=length(sobel(uv));vec3 fill=floor(C*4.)/4.;fill=mix(fill,vec3(luma(fill)),.3);fill=mix(fill,fill*vec3(.7,.85,1.),u_p3);
 vec3 col=skin*mix(vec3(1.),fill*.9+.05,mk*(1.-l*.6));col*=mix(vec3(1.),vec3(.12,.14,.2),mk*smoothstep(.15,.45,ed*(1.+u_p3*.5)));return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge library filters re-created from their descriptions and controls (approx. looks): Bilevel Screening (Kutianski, "two level screening" with High/Low Pass) = low-passed luma + Amount x high-pass, thresholded against a 45-degree dot screen (Detail = screen mix); Chuck Close V2 (Indigo Ray) = square grid, each cell a contrasting background with circle or diamond blobs whose hues scatter around the cell colour (Amount = crazy colours, Detail = circle variance); Decoupage (Persidio) = image glued as shifted torn paper pieces with white edges, glue crack network, varnish yellowing, age vignette; Navajo Weaver (tornadotwins) = image blocks snapped to a Navajo dye palette with weft/warp yarn relief (Detail > .5 = symmetric); Barcode Color Art (jffe) = tiles of image-coloured barcode bars, black-white mix, row shift, rounded tile edges with rivets; SX-70 (pixel8ted) = emulsion pushed by a noise flow with smear and scrape lines, SX-70 colour and Polaroid border; Pocket Etch-A-Sketch (ThreeDee) = red toy frame with knobs, image edges and shading hatch drawn as grey lines on aluminium; Tattoo Me (RPspeeder) = posterised image inked onto textured skin inside a soft elliptical mask with dark outline (Detail = ink age)', true);

f = add('Materials');
f('q48_ff_objects','Filter Forge Image Objects (Bubble Wrap / Coin / Cameo / Snowglobe / Neumorphism)',
  [S('Object',['Bubble Wrap','Coin Generator','Cameo Creator','Snowglobe','Neumorphism']),P('Size',.2,1,.8,.01),P('Amount',0,1,.6,.01),P('Variation',0,1,.5,.01)],
  `vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);vec2 ctr=Wd*.5;float mn=min(Wd.x,Wd.y);int m=int(u_p0+.5);float sd=fract(u_seed*.123)*50.;vec3 col;
 if(m==0){float sp=mn*.09*u_p1+2.;float ry=floor(p.y/(sp*.866));vec2 bc=vec2(0.);float bd=1e9;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float rw=ry+float(j);vec2 cc=vec2((floor(p.x/sp)+float(i)+.5+.5*mod(rw,2.))*sp,(rw+.5)*sp*.866);float dd=length(p-cc);if(dd<bd){bd=dd;bc=cc;}}
  float rad=sp*.42;vec2 q=(p-bc)/rad;float r2=dot(q,q);if(r2<1.){float z=sqrt(1.-r2);vec3 n=vec3(q,z);col=O(clamp(fromPX(p-n.xy*rad*.7*u_p2),0.,1.)).rgb;float li=dot(n,normalize(vec3(-.5,.6,.65)));col*=.8+.3*li;col+=pow(max(li,0.),30.)*.8;col*=1.-.35*smoothstep(.75,1.,r2);}
  else{col=c.rgb*.95;float cr=abs(fbm(p/(mn*.25)+sd)-.5);col+=u_p3*.35*smoothstep(.025,0.,cr);col+=.05;}return vec4(clamp(col,0.,1.),1.);}
 if(m==1||m==2){vec2 q=p-ctr;float R0=mn*.46*u_p1;float e=m==1?length(q)/R0:length(q/(vec2(.78,.92)*R0*1.05));
  if(e>1.){float shd=smoothstep(1.15,1.,length((q+vec2(mn*.015,mn*.02))/(m==1?vec2(R0):vec2(.78,.92)*R0*1.05)));return vec4(vec3(.12,.11,.13)*(1.-.5*shd),1.);}
  vec2 u2=clamp(.5+q/(R0*(m==1?.88:.9)*2.)*vec2(mn/Wd.x,mn/Wd.y),0.,1.);float d=R(1.5);float h0=blurL(u2,d),hx=blurL(u2+vec2(u_px.x*3.,0.),d),hy=blurL(u2+vec2(0.,u_px.y*3.),d);
  if(m==1){vec3 mt=u_p3<.33?vec3(1.,.8,.35):u_p3<.66?vec3(.85,.85,.88):vec3(.75,.45,.25);float th=atan(q.y,q.x);
   if(e>.88){float pr=sin((e-.88)/.12*3.1416);vec3 nn=normalize(vec3(-q/length(q)*cos((e-.88)/.12*3.1416)*.8,1.));float li=dot(nn,normalize(vec3(-.5,.5,.7)));col=mt*(.45+.6*li)*(e>.97?.8+.2*cos(th*240.):1.)+pow(max(li,0.),12.)*u_p2*.6;}
   else{vec3 nn=normalize(vec3(-(hx-h0)*25.,-(hy-h0)*25.,1.));float li=dot(nn,normalize(vec3(-.5,.5,.7)));col=mt*(.4+.6*li)+pow(max(li,0.),16.)*u_p2*.5;col=mix(col,col*vec3(.55,.75,.6),.35*smoothstep(.6,.8,fbm(p/(mn*.05)+sd)));}
   return vec4(clamp(col,0.,1.),1.);}
  float th=atan(q.y,q.x);if(e>.9){float bead=.6+.4*cos(th*60.);return vec4(vec3(.85,.68,.3)*(.5+.5*bead)*(1.2-abs(e-.95)*8.),1.);}
  float mk=smoothstep(.42,.6,h0);float hh=mk*(.6+.4*h0);float mx=smoothstep(.42,.6,hx)*(.6+.4*hx),my=smoothstep(.42,.6,hy)*(.6+.4*hy);vec3 nn=normalize(vec3(-(mx-hh)*(4.+8.*u_p2),-(my-hh)*(4.+8.*u_p2),1.));
  float li=dot(nn,normalize(vec3(-.5,.5,.7)));vec3 iv=(u_p3>.5?vec3(.97,.97,.98):vec3(.95,.9,.8))*(.55+.5*li);vec3 bgc=u_p3>.5?vec3(.33,.48,.72):vec3(.75,.42,.32);return vec4(clamp(mix(bgc*(.9+.1*li),iv,mk),0.,1.),1.);}
 if(m==3){float gr=mn*.42*u_p1;vec2 gc=ctr+vec2(0.,mn*.08);vec2 q=(p-gc)/gr;float r2=dot(q,q);float by0=gc.y-gr*1.18,by1=gc.y-gr*.72;
  col=mix(vec3(.03,.04,.1),vec3(.15,.18,.3),uv.y);
  if(p.y>by0&&p.y<by1){float t=(p.y-by0)/(by1-by0);float hw=gr*mix(1.45,1.1,t);if(abs(p.x-ctr.x)<hw){vec3 bc=u_p3>.5?vec3(.85,.65,.3):vec3(.35,.2,.1);col=bc*(.55+.45*cos((p.x-ctr.x)/hw*1.57))*(.8+.2*t);}}
  if(r2<1.){float z=sqrt(1.-r2);vec3 im=O(clamp(.5+q*(.55+.45*z)*.5*vec2(mn/Wd.x,mn/Wd.y)*1.6,0.,1.)).rgb;col=im*(.75+.25*z);
   for(int s=0;s<2;s++){float gs=mn*(s==0?.02:.035);vec2 g=floor(p/gs);vec2 o=(g+.5+.35*(vec2(hash(g+sd+float(s)),hash(g+sd+9.))-.5))*gs;float fl=hash(g+sd+3.);if(fl<u_p2*.6)col=mix(col,vec3(1.),smoothstep(gs*.16,gs*.06,length(p-o)));}
   col*=1.-.4*smoothstep(.75,1.,r2);col+=.7*smoothstep(.22,.05,length(q-vec2(-.4,.45)))+.15*smoothstep(.05,0.,abs(sqrt(r2)-.96));}
  return vec4(clamp(col,0.,1.),1.);}
 float thr=1.-u_p2;float an=radians(-45.+360.*(u_p3-.5));vec2 od=vec2(cos(an),sin(an))*mn*.025*u_p1;vec2 ou=od*u_k/u_res;float bl=R(mn*.012*u_p1+1.);
#define NMK(qq) smoothstep(thr-.06,thr+.06,blurL(qq,bl))
 float s0=NMK(uv),sdk=NMK(uv-ou),slt=NMK(uv+ou);vec3 bgc=vec3(.88,.9,.93);col=bgc-.2*sdk*(1.-s0)+.1*slt*(1.-s0);col=mix(col,bgc*(1.+.04*(1.-sdk)-.04*(1.-slt)),s0);return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge library filters re-created from their descriptions and controls (approx. looks): Bubble Wrap (Bubblewrap 1 by Stefan Beckmann / Super Bubble Wrap by Indigo Ray) = hex-packed hemispherical bubbles refracting the image with specular highlights, foil folds between (Amount = refraction, Variation = folds); Coin Generator (Austy51) = image embossed into a round coin, gold/silver/bronze by Variation, raised reeded rim, patina patches, Amount = shine; Cameo Creator (Foxxee) = bright image areas carved as relief ivory over a shell-coral (or porcelain blue, Variation > .5) ground in a beaded gold oval; JLE Snowglobe = image refracted inside a glass sphere with snow flakes (Amount = density), highlight and a wooden or metallic base; Neumorphism (Martin Naumann) = image thresholded (Amount = percentage) into a soft extruded shape on a light grey UI ground with paired light/dark shadows (Variation = light angle)', true);

f = add('Frames');
f('q48_ff_overlays','Filter Forge Overlays (Scorched Parchment / Shoji Screen / Speedliner / Plexus)',
  [S('Overlay',['Scorched Parchment','Shoji Screen','Speedliner speed lines','Plexus network']),P('Size',.1,1,.5,.01),P('Amount',0,1,.6,.01),P('Variation',0,1,.5,.01)],
  `vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);vec2 ctr=Wd*.5;float mn=min(Wd.x,Wd.y);int m=int(u_p0+.5);float sd=fract(u_seed*.123)*50.;float l=luma(c.rgb);vec3 col;
 if(m==0){vec3 pa=vec3(.87,.78,.6)*(.85+.25*fbm(p/(mn*.15)+sd));pa*=1.-.18*smoothstep(.55,.8,fbm(p/(mn*.05)+sd+4.));col=pa*mix(vec3(1.),mix(vec3(.25,.17,.1),vec3(1.),l),.85);
  vec2 dq=min(p,Wd-p);float de=min(dq.x,dq.y)/mn;float bl=u_p1*.12+(.03+.1*u_p3)*(fbm(p/(mn*.08)+sd)-.5)*2.;
  if(de<bl)return vec4(vec3(.05,.04,.04),1.);float t=de-bl;col=mix(vec3(.1,.05,.02),col,smoothstep(0.,.012,t));col*=mix(1.,smoothstep(0.,.08,t)*.5+.5,u_p2);col=mix(col,col*vec3(1.,.8,.55),u_p2*(1.-smoothstep(0.,.1,t)));return vec4(clamp(col,0.,1.),1.);}
 if(m==1){float fw=mn*.05;vec2 dq=min(p,Wd-p);float de=min(dq.x,dq.y);float cl=mn*.25*u_p1+4.;vec2 g=(p-fw)/vec2(cl,cl*1.5);vec2 fg=abs(fract(g)-.5)*vec2(cl,cl*1.5);float bw=cl*.05+1.;
  vec3 wd=vec3(.55,.38,.22)*(.85+.15*sin(p.x*.15+3.*fbm(p*.02))+.05*sin(p.y*.4));
  if(de<fw){col=wd*(.7+.3*smoothstep(0.,fw,de));return vec4(col,1.);}
  if(min(.5*cl-fg.x,.75*cl-fg.y)<bw){float e=min(.5*cl-fg.x,.75*cl-fg.y)/bw;return vec4(wd*(.75+.35*e),1.);}
  vec3 bc=vec3(0.);for(int i=0;i<9;i++){float a=float(i)*2.4;bc+=O(uv+vec2(cos(a),sin(a))*sqrt(float(i)/9.)*R(cl*.35)*u_px).rgb;}bc/=9.;
  vec3 pp=vec3(.95,.92,.85)*(.93+.07*fbm(p*.08+sd));col=pp*(.55+.45*luma(bc));col=mix(col,col*(.6+.6*bc),u_p2*.6);
  float hl=fbm(p/(mn*.08)+sd+2.);float ho=smoothstep(1.-.35*u_p3,1.-.33*u_p3,hl);col=mix(col,vec3(.8,.75,.65),smoothstep(1.-.4*u_p3,1.-.35*u_p3,hl)*(1.-ho));col=mix(col,c.rgb,ho*step(.01,u_p3));return vec4(clamp(col,0.,1.),1.);}
 if(m==2){vec2 q=p-ctr;float r=length(q);float ln=0.;
  if(u_p3>.66){float rw=floor(p.y/2.5);float h=hash(vec2(rw,sd));float on=step(.55,h);float x0=Wd.x*(.1+.6*hash(vec2(rw,sd+1.)));ln=on*smoothstep(x0,x0+Wd.x*.3,p.x)*(1.-step(.5*(.3+h),abs(fract(p.y/2.5)-.5)*2.));}
  else{float th=atan(q.y,q.x)/6.2832+.5;float N=120.+240.*u_p3;float id=floor(th*N);float h=hash(vec2(id,sd)),h2=hash(vec2(id,sd+3.));float fw=(.15+.6*h)*smoothstep(0.,mn*.6,r);
   float rin=u_p1*mn*.45*(.7+.6*h2);ln=step(abs(fract(th*N)-.5),fw*.5)*smoothstep(rin,rin+mn*.12,r);}
  return vec4(mix(c.rgb,vec3(0.),ln*u_p2*1.2>1.?1.:ln*u_p2*1.2),1.);}
 vec3 bgc=vec3(0.);for(int i=0;i<9;i++){float a=float(i)*2.4;bgc+=O(uv+vec2(cos(a),sin(a))*sqrt(float(i)/9.)*R(4.)*u_px).rgb;}bgc=pow(bgc/9.,vec3(1.4))*.55;
 float G=mn*.18*u_p1+6.;vec2 cg=floor(p/G);vec2 pts[16];for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 g=cg+vec2(float(i-1),float(j-1));pts[j*4+i]=(g+.5+.8*(vec2(hash(g+sd),hash(g+sd+7.))-.5))*G;}
 float li=0.,no=0.;for(int i=0;i<16;i++){vec2 a=pts[i];no=max(no,exp(-dot(p-a,p-a)/(G*G*.0015)));for(int j=0;j<16;j++){if(j<=i)continue;vec2 b=pts[j];float LL=length(b-a);if(LL>1.6*G)continue;vec2 pa=p-a,ba=b-a;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);float dd=length(pa-ba*hh);li+=(1.-LL/(1.6*G))*smoothstep(1.3,.2,dd);}}
 vec3 pc=mix(vec3(.55,.85,1.),vec3(1.,.6,.85),u_p3);col=bgc+pc*(min(li,1.5)*.6+no)*u_p2*1.4;return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge library filters re-created from their descriptions and controls (approx. looks): Scorched Parchment (Redcap) = image inked onto mottled parchment with noisy burnt edges, char band and singe gradient (Size = burn amount, Amount = singe, Variation = edge roughness); Shoji Screen Lv2 (Zephos) = wooden kumiko lattice and frame over rice paper lit from behind by the blurred image, with shredded holes showing the image (Size = grid, Amount = translucency, Variation = shred); Speedliner Lv2 (Zephos) = manga burst of tapered black speed lines around a clear focus (Size = focus radius, Amount = opacity, Variation = density; > .66 = horizontal streak mode); Plexus (ThreeDee) = jittered points joined by lines when closer than 1.6 cells, glowing nodes, over the darkened blurred image (Size = spacing, Amount = brightness, Variation = colour)', true);
