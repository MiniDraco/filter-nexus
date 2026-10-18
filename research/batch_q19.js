/* ================= q19: prepress (separations, press proof, screens, quadtone), Nuke nodes, GRASS r.li / r.colors.stddev, tonemapper operators, Elements guided edits ================= */
/* density-additive ink model: paper x 10^-(sum coverage x ink density); CMY solved from the pixel's RGB density after black generation */
const Q19_INK = `
#define Q19DP vec3(.0223,.0269,.0410)
#define Q19KD vec3(1.55,1.5,1.45)
#define Q19MI mat3(.78724,-.24178,.03851,-.0581,.84703,-.4589,-.0111,-.06293,1.03594)
#define Q19MX mat3(1.3,.38,.12,.1,1.25,.55,.02,.08,1.)
#define Q19OD vec3(.05,.8,1.4)
#define Q19GD vec3(1.2,.1,.9)
#define Q19VD vec3(.9,1.2,.2)
#define Q19PAPER vec3(.95,.94,.91)
#define Q19DENS(RGB) clamp(-log(max(${LIN('clamp(RGB,0.,1.)')},vec3(1e-3)))/2.302585-Q19DP,0.,3.)
#define Q19PROOF(DD) ${SRGB('(Q19PAPER*pow(vec3(10.),-(DD)))')}
#define Q19SEP(RGB,BGM,INKS,CMY,KK,OGV) {vec3 q_d=Q19DENS(RGB);float q_mn=min(q_d.x,min(q_d.y,q_d.z));float q_g=min(1.,q_mn/1.5);float q_nw=1.-smoothstep(.1,.5,max(q_d.x,max(q_d.y,q_d.z))-q_mn);int q_m=int((BGM)+.5);float q_k=q_m==0?q_g*smoothstep(.5,1.,q_g)*q_nw:q_m==1?q_g*.6*smoothstep(.4,1.,q_g):q_m==3?q_g*.95*smoothstep(0.,.5,q_g):q_m==4?q_g:q_g*.85*smoothstep(.15,.9,q_g);vec3 q_r=q_d-q_k*Q19KD;CMY=clamp(Q19MI*q_r,0.,1.);OGV=vec3(0.);if((INKS)>=1){OGV.x=min(CMY.y,CMY.z)*.85;OGV.y=min(CMY.x,CMY.z)*.85;if((INKS)>=2)OGV.z=min(CMY.x,CMY.y)*.85;CMY=clamp(Q19MI*(q_r-OGV.x*Q19OD-OGV.y*Q19GD-OGV.z*Q19VD),0.,1.);}if(q_m==5)CMY=clamp(CMY+.3*smoothstep(.5,1.,q_k)*q_nw*(1.-CMY),0.,1.);KK=q_k;if(q_m==6){float q_s=smoothstep(.55,.85,q_k)*q_nw;CMY=max(CMY,vec3(.6,.4,.4)*q_s);KK=max(q_k,q_s);}}
#define Q19TAC(CMY,KK,OGV,LIM) {float q_t=(CMY).x+(CMY).y+(CMY).z+(OGV).x+(OGV).y+(OGV).z;float q_rm=max((LIM)-(KK),0.);if(q_t>q_rm){CMY*=q_rm/max(q_t,1e-4);OGV*=q_rm/max(q_t,1e-4);}}
#define Q19DSUM(CMY,KK,OGV) (Q19MX*(CMY)+(KK)*Q19KD+(OGV).x*Q19OD+(OGV).y*Q19GD+(OGV).z*Q19VD)
`;

f = add('Color');
f('q19_cmyksep','CMYK Separation (GCR / UCR / UCA / Ink Limit / Hexachrome)',[S('Ink set',['CMYK','Hexachrome CMYKOG','CMYKOGV extended gamut']),S('Black generation',['UCR','GCR light','GCR medium','GCR heavy','GCR maximum','UCA (GCR medium plus UCA)','Rich black (60 40 40 100)'],2),P('Total ink limit',200,400,300,5,'%'),S('View',['Press proof','Separation plates','Total ink coverage (before limit)','Proof difference x4'])],
  Q19_INK + `int ins=int(u_p0+.5);int vw=int(u_p3+.5);float lim=u_p2*.01;
  if(vw==1){int n=ins==0?4:ins==1?6:7;float cols=ins==0?2.:ins==1?3.:4.;vec2 gq=vec2(uv.x*cols,(1.-uv.y)*2.);vec2 cell=floor(gq);vec2 lu=fract(gq);
    int id=int(cell.x)+int(cell.y)*int(cols);vec3 pap=${SRGB('Q19PAPER')};if(id>=n)return vec4(pap*.92,1.);
    vec2 su=vec2(lu.x,1.-lu.y);vec3 cm,og;float kk;Q19SEP(O(su).rgb,u_p1,ins,cm,kk,og);Q19TAC(cm,kk,og,lim);
    float a=id==0?cm.x:id==1?cm.y:id==2?cm.z:id==3?kk:id==4?og.x:id==5?og.y:og.z;
    vec3 dn=id==0?Q19MX[0]:id==1?Q19MX[1]:id==2?Q19MX[2]:id==3?Q19KD:id==4?Q19OD:id==5?Q19GD:Q19VD;
    vec3 o=Q19PROOF(a*dn);vec2 e=min(lu,1.-lu)*u_res/vec2(cols,2.);if(min(e.x,e.y)<1.5)o*=.6;return vec4(o,1.);}
  vec3 cm,og;float kk;Q19SEP(c.rgb,u_p1,ins,cm,kk,og);float tot=cm.x+cm.y+cm.z+kk+og.x+og.y+og.z;
  if(vw==2){vec3 o=ramp(1,clamp(tot/4.,0.,1.));if(tot>lim+.005){float hs=step(.5,fract((PX(uv).x+PX(uv).y)/8.));o=mix(o,vec3(0.,1.,1.),.65*hs);}return vec4(o,1.);}
  Q19TAC(cm,kk,og,lim);vec3 pr=Q19PROOF(Q19DSUM(cm,kk,og));
  if(vw==3)return vec4(clamp(abs(pr-c.rgb)*4.,0.,1.),1.);
  return vec4(pr,1.);`,
  'Separation from RGB through a density-additive ink model (approx., not an ICC profile): pixel density per R/G/B channel (re paper) -> black generation (UCR = K only in neutral shadows; GCR light/medium/heavy/maximum = increasing grey component replaced by K; UCA adds CMY back under neutral shadows; rich black puts 60/40/40 under solid black) -> CMY solved by inverting the 3x3 ink density matrix; Hexachrome adds orange + green inks (CMYKOG, Pantone 1995), CMYKOGV adds violet, each taking over 85% of its two-ink overlap before CMY is re-solved; total area coverage limit scales the colour inks so C+M+Y(+O+G+V)+K stays under the limit. Views: press proof (inks multiplied on paper), separation plates (each plate printed alone in its ink), total ink coverage before the limit (cyan hatching = over the TAC), proof difference');

f('q19_pressproof','Press Proof (Dot Gain / Misregistration / Trapping / Overprint)',[S('Simulation',['Dot gain uncompensated','Dot gain compensated','Misregistration (black knocks out)','Misregistration with trapping','Black overprint preview'],2),P('Dot gain at 50 pct',0,35,18,1,'%'),P('Misregistration',0,8,2,.25,'px'),P('Trap width',0,6,2,.25,'px')],
  [Q19_INK + `int m=int(u_p0+.5);vec3 cm,og;float kk;Q19SEP(c.rgb,2.,0,cm,kk,og);Q19TAC(cm,kk,og,3.);
   float L0=luma(c.rgb);vec3 hs=rgb2hsv(c.rgb);float blk=(1.-smoothstep(.07,.16,L0))*(1.-smoothstep(.25,.5,hs.y*hs.z*4.));
   if(m>=2){kk=max(kk,blk);
     float gr=m==3?R(u_p3):m==4?R(u_p2)+R(3.):0.;
     vec3 trap=cm*(1.-blk),bg=vec3(0.);float bw=0.;
     if(gr>=.5){float st=max(gr/8.,1.);
       for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j))*st;if(dot(o,o)>gr*gr+.01)continue;
         vec3 s=O(uv+o*u_px).rgb;vec3 cq,oq;float kq;Q19SEP(s,2.,0,cq,kq,oq);Q19TAC(cq,kq,oq,3.);float Lq=luma(s);
         if(m==3&&Lq>L0+.12)trap=max(trap,cq);
         if(m==4){float nb=smoothstep(.12,.22,Lq);bg+=cq*nb;bw+=nb;}}}
     if(m==2)cm*=1.-blk;
     if(m==3)cm=trap;
     if(m==4)cm=mix(cm,bw>.01?bg/bw:vec3(0.),blk);}
   return vec4(cm,kk);`,
   Q19_INK + `int m=int(u_p0+.5);float d=m>=2?R(u_p2):0.;
   vec4 a=vec4(T(uv+vec2(d,0.)*u_px).r,T(uv+vec2(-.5*d,.87*d)*u_px).g,T(uv+vec2(-.5*d,-.87*d)*u_px).b,T(uv).a);
   float g=u_p1*.01;
   if(m!=0&&g>.001){float b=1.+4.*g;a=(b-sqrt(max(b*b-16.*g*a,0.)))/(8.*g);}
   a=clamp(a+4.*g*a*(1.-a),0.,1.);
   return vec4(Q19PROOF(Q19MX*a.rgb+a.a*Q19KD),1.);`],
  'Press simulation on a CMYK separation (GCR medium, 300% TAC, density-additive ink model, approx.): dot gain = parabolic tone value increase a + 4g a(1-a) (g = TVI at 50%), compensated = the inverse curve applied to the plates before printing; misregistration shifts the C/M/Y plates 120 deg apart against K; black objects (dark neutral pixels) are set as 100% K and either knock out the colour plates (white/colour gaps appear when misregistered), get trapped (each lighter-colour plate spreads into darker neighbours by the trap width = spread/choke, hiding the gaps) or overprint (overprint preview: the surrounding colour plates continue under the black, no knockout)');

f('q19_quadtone','Quadtone (4-Ink Monotone Print)',[S('Inks',['Warm black (black / warm greys)','Cool black (black / cool greys)','Sepia brown','Selenium (purple-black)']),P('Black ink',0,1.5,1,.01),P('Highlight ink',0,1.5,1,.01),P('Contrast',.5,2,1,.01)],
  Q19_INK + `int pr=int(u_p0+.5);
  vec3 D[16]=vec3[16](vec3(1.6,1.6,1.6),vec3(.5,.55,.65),vec3(.3,.42,.62),vec3(.1,.13,.2),
    vec3(1.6,1.6,1.6),vec3(.62,.55,.47),vec3(.5,.4,.3),vec3(.15,.12,.08),
    vec3(1.3,1.6,1.9),vec3(.5,.75,1.1),vec3(.2,.35,.6),vec3(.03,.07,.16),
    vec3(1.6,1.75,1.55),vec3(.6,.75,.6),vec3(.3,.36,.3),vec3(.1,.1,.12));
  float Y=clamp(luma(c.rgb),0.,1.);Y=clamp(.5+(Y-.5)*u_p3,0.,1.);float t=1.-Y;
  vec4 a=vec4(u_p1*pow(t,2.4),.9*pow(t,1.5),.8*t,.6*u_p2*pow(t,.7));
  vec3 dn=a.x*D[pr*4]+a.y*D[pr*4+1]+a.z*D[pr*4+2]+a.w*D[pr*4+3];
  float tgt=clamp(-log(max(${LIN('vec3(Y)')}.x,1e-3))/2.302585-.027,0.,2.3);float cur=luma(dn);
  dn*=cur>1e-4?tgt/cur:0.;return vec4(Q19PROOF(dn),1.);`,
  'Photoshop-style quadtone: four inks laid down by their own curves (black in the shadows only, then two mid inks, the lightest ink reaching into the highlights), printed with a density-additive ink model on warm paper; total density rescaled so the print keeps the image tone (approx. preset inks, not Pantone spot data)');

f = add('Stylize');
f('q19_screens','AM Screening: Euclidean / Elliptical / Hybrid XM / Rosette',[S('Spot function',['Round','Euclidean','Elliptical','Hybrid XM (AM plus FM)'],1),P('Screen period',3,24,7,.5,'px'),S('Inks',['Mono black','CMYK rosette']),P('Angle error (moire)',0,10,0,.1,'deg')],
  Q19_INK + `
#define Q19ELL(AX,AY,WW) ((WW)<0.?1.-((AX)*(AX)+((AY)/.75)*((AY)/.75))/4.:(WW)>1.?((1.-(AX))*(1.-(AX))+((1.-(AY))/.75)*((1.-(AY))/.75))/4.-1.:.5-(WW))
#define Q19SPOT(PP,TY) ((TY)==1?(abs((PP).x)+abs((PP).y)>1.?(abs((PP).x)-1.)*(abs((PP).x)-1.)+(abs((PP).y)-1.)*(abs((PP).y)-1.)-1.:1.-dot(PP,PP)):(TY)==2?Q19ELL(abs((PP).x),abs((PP).y),3.*abs((PP).x)+4.*abs((PP).y)-3.):1.-dot(PP,PP))
  int ty=int(u_p0+.5);int sty=ty==3?1:ty;bool cmyk=u_p2>.5;float per=max(R(u_p1),2.);
  vec4 cov;vec3 cm,og;float kk;
  if(cmyk){Q19SEP(c.rgb,2.,0,cm,kk,og);Q19TAC(cm,kk,og,3.);cov=vec4(cm,kk);}else cov=vec4(0.,0.,0.,1.-luma(c.rgb));
  vec4 ang=cmyk?vec4(15.+u_p3,75.-u_p3,0.,45.):vec4(0.,0.,0.,45.+u_p3);
  vec4 ink=vec4(0.);
  for(int n=0;n<4;n++){if(!cmyk&&n<3)continue;float a=cov[n];
    vec2 p=rot(PX(uv)*u_k,radians(ang[n]))/per;vec2 cell=floor(p);vec2 pc=fract(p)*2.-1.;
    float amin=.14;float aa=a;
    if(ty==3&&a<amin)aa=hash(cell+float(n)*31.7)<a/amin?amin:0.;
    if(ty==3&&a>1.-amin)aa=hash(cell+float(n)*31.7)<(1.-a)/amin?1.-amin:1.;
    float s0=Q19SPOT(pc,sty);float rr=0.;
    for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 gp=(vec2(float(i),float(j))+.5)/6.-1.;rr+=Q19SPOT(gp,sty)>s0?1.:0.;}
    rr/=144.;float w=.5/144.+1.2/(per*per);ink[n]=aa<=0.?0.:aa>=1.?1.:smoothstep(rr-w,rr+w,aa);}
  if(!cmyk)return vec4(Q19PROOF(ink.w*vec3(1.75)),1.);
  return vec4(Q19PROOF(Q19MX*ink.rgb+ink.a*Q19KD),1.);`,
  'Amplitude-modulated halftone with PostScript spot functions (Round 1-x2-y2, Euclidean = round below 50% / inverted round above, Adobe Elliptical dot with its 3x+4y-3 split); the threshold for each cell position is its exact rank among 144 sampled spot values, so coverage equals ink area; Hybrid XM keeps a minimum dot (14%) and in highlights / shadows switches to frequency modulation (random dot or hole dropout per cell, approx. of Agfa Sublima / Kodak Staccato hybrids); CMYK uses the classic 15/75/0/45 deg angles (C, M, Y, K) on a GCR separation, Angle error rotates C and M off-angle to show rosette moire');

f = add('Tone');
f('q19_nuketone','Nuke PLogLin / SoftClip / RolloffContrast / CrossTalk',[S('Node',['PLogLin lin to log','PLogLin log to lin','SoftClip logarithmic compress','SoftClip preserve hue and brightness','SoftClip preserve hue and saturation','RolloffContrast','CrossTalk'],2),P('Exposure',-3,4,1.5,.1,'EV'),P('A (neg gamma or clip min or contrast or bleed)',0,1,.6,.01),P('B (clip max or soft clip)',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec3 x=${LIN('c.rgb')}*exp2(u_p1);vec3 o;
  if(m==0){float ng=max(u_p2,.05);o=(445.+log(max(x/.18,vec3(1e-10)))/2.302585*ng/.002)/1023.;return vec4(clamp(o,0.,1.),1.);}
  if(m==1){float ng=max(u_p2,.05);o=.18*pow(vec3(10.),(c.rgb*1023.-445.)*.002/ng)*exp2(u_p1-1.5);vec3 oc=clamp(o,0.,1.);return vec4(${SRGB('oc')},1.);}
  if(m==2){float mn=min(u_p2,.95);float mx=max(1.+u_p3*7.,mn+.05);vec3 t=clamp((x-mn)/(mx-mn),0.,1.);vec3 y=mn+(1.-mn)*log(1.+1.71828*t);o=mix(x,y,step(mn,x));}
  else if(m==3){float mx=max(x.r,max(x.g,x.b));float Lm=luma(x);o=x;if(mx>1.){o=Lm>=1.?vec3(1.):Lm+(x-Lm)*(1.-Lm)/max(mx-Lm,1e-4);}}
  else if(m==4){float mx=max(x.r,max(x.g,x.b));o=mx>1.?x/mx:x;}
  else if(m==5){vec3 v=c.rgb*exp2(u_p1-1.5);vec3 y=(v-.5)*u_p2*2.5+.5;float s=u_p3*.5;
    if(s>.001){vec3 lo=clamp((y+s)/(2.*s),0.,1.);y=mix(vec3(0.),y,step(vec3(s),y))+mix((y+s)*lo*.5,vec3(0.),step(vec3(s),y));
      vec3 z=1.-y;vec3 hi=clamp((z+s)/(2.*s),0.,1.);z=mix(vec3(0.),z,step(vec3(s),z))+mix((z+s)*hi*.5,vec3(0.),step(vec3(s),z));y=1.-z;}
    return vec4(clamp(y,0.,1.),1.);}
  else{float a=(u_p2-.5)*2.;o=max(x*(1.-a)+a*.5*(x.gbr+x.brg),0.);}
  o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`,
  'Nuke colour nodes on the linearised image x 2^Exposure: PLogLin (Josh Pines log, linRef .18, logRef 445, density/code .002, negative gamma = A; lin to log shows the log code values, log to lin reads the image as log codes); SoftClip (logarithmic compress maps softclip min..max (min = A, max = 1+7B) onto min..1; preserve hue and brightness desaturates toward luma until the max channel is 1; preserve hue and saturation scales the colour down until max = 1); RolloffContrast on display values (contrast = 2.5A about centre .5, soft clip B = quadratic shoulders at both ends, approx. of its bezier shoulders); CrossTalk with linear crossover curves (each channel bleeds into the other two by A-.5 x2, neutral-preserving; Nuke uses user-drawn curves)');

f('q19_tonemapper','Filmic Tone Curves (ACES Hill / Romain Guy / Aldridge / Day)',[S('Operator',['ACES (Stephen Hill fit)','ACES (Romain Guy fit)','Aldridge filmic','Day filmic (Insomniac)']),P('Exposure',-3,4,.8,.1,'EV'),P('Aldridge cutoff',.002,.5,.025,.001),P('Day white point',1,20,10,.1)],
  `int m=int(u_p0+.5);vec3 x=${LIN('c.rgb')}*exp2(u_p1);vec3 o;
  if(m==0){vec3 v=vec3(dot(x,vec3(.59719,.35458,.04823)),dot(x,vec3(.076,.90834,.01566)),dot(x,vec3(.0284,.13383,.83777)));
    vec3 a=v*(v+.0245786)-.000090537,b=v*(.983729*v+.432951)+.238081;v=a/b;
    o=vec3(dot(v,vec3(1.60475,-.53108,-.07367)),dot(v,vec3(-.10208,1.10813,-.00605)),dot(v,vec3(-.00327,-.07276,1.07602)));o=pow(max(o,0.),vec3(1./2.2));}
  else if(m==1)o=x/(x+.155)*1.019;
  else if(m==2){float co=u_p2;vec3 tp=vec3(2.*co);vec3 y=x+(tp-x)*clamp(tp-x,0.,1.)*(.25/co)-co;o=(y*(6.2*y+.5))/(y*(6.2*y+1.7)+.06);}
  else{float La=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++)La+=luma(${LIN('O((vec2(float(i),float(j))+.5)/12.).rgb')});La=max(La/144.,1e-3);
    float w=u_p3,b=.1,t=.7,s=.8,cc=2.;float k=(1.-t)*(cc-b)/((1.-s)*(w-cc)+(1.-t)*(cc-b));vec3 v=x/La;
    vec3 toe=k*(1.-t)*(v-b)/(cc-(1.-t)*b-t*v);vec3 sh=(1.-k)*(v-cc)/(s*v+(1.-s)*w-cc)+k;o=mix(toe,sh,step(vec3(cc),v));o=pow(max(o,0.),vec3(1./2.2));}
  return vec4(clamp(o,0.,1.),1.);`,
  'Operators from Tizian Zeltner\'s tonemapper collection on the linearised image x 2^Exposure: ACES fit by Stephen Hill (BakingLab ACES.hlsl input/output matrices + RRT/ODT rational fit, gamma 2.2), ACES-like curve by Romain Guy x/(x+.155)x1.019 (gamma built in), Graham Aldridge\'s variation of the Hejl / Burgess-Dawson curve with a black cutoff, Mike Day\'s Insomniac curve (black .1, toe .7, shoulder .8, cross-over 2, white point W, input divided by the mean luminance sampled on a 12x12 grid, gamma 2.2)');

f = add('Stylize');
f('q19_nukerays','Nuke GodRays / VolumeRays',[S('Node',['GodRays (rays only)','GodRays of highlights plus source','VolumeRays'],1),P('Center X',0,1,.62,.01),P('Center Y',0,1,.6,.01),P('Scale or ray length',0,1,.45,.01)],
  `int m=int(u_p0+.5);vec2 C=vec2(u_p1,u_p2);vec3 acc=vec3(0.);float ws=0.;
  if(m<2){float Sc=1.+u_p3*1.5;
    for(int i=0;i<64;i++){float t=(float(i)+.5)/64.;float sc=mix(1.,Sc,t);vec2 q=C+(uv-C)/sc;vec3 v=O(q).rgb;if(m==1)v=max(v-.6,0.)/.4;float w=1.-t;acc+=v*w;ws+=1.;}
    acc/=ws;if(m==0)return vec4(clamp(acc*2.,0.,1.),1.);
    return vec4(clamp(c.rgb+acc*2.2,0.,1.),1.);}
  float len=u_p3*.9;
  for(int i=0;i<64;i++){float t=(float(i)+.5)/64.;vec2 q=uv+(C-uv)*t*len;vec3 v=O(q).rgb;float k=smoothstep(.55,.9,luma(v));
    float w=exp(-3.*t);acc+=v*k*w;ws+=w;}
  acc/=ws;return vec4(screen(c.rgb,clamp(acc*1.6,0.,1.)),1.);`,
  'Nuke GodRays: 64 copies scaled from 1 to Scale about Center, colour ramp from white (start) to black (end) = linear decay, averaged (rays only = the node output; second mode keys the highlights first and adds the rays to the source, the usual comp setup); VolumeRays (approx. of the gizmo): light from bright pixels marched toward vol_pos with exponential fade and screened over the source, dark objects block the rays');

f = add('Color');
f('q19_nukekeyers','Nuke Keyers: HueKeyer / Primatte / Ultimatte / IBK + EdgeExtend',[S('Keyer',['HueKeyer','Primatte (approx.)','Ultimatte (approx.)','IBKGizmo (pick colour)'],3),S('Screen',['Green','Blue']),P('Tolerance or weight',0,1,.5,.01),S('View',['Comp over checker (EdgeExtend)','Matte','EdgeExtend foreground','Comp without EdgeExtend'])],
  [`int kt=int(u_p0+.5);bool blu=u_p1>.5;
  vec3 sc=vec3(0.);float sw=0.;
  for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 v=O((vec2(float(i),float(j))+.5)/12.).rgb;float d=blu?v.b-max(v.r,v.g):v.g-max(v.r,v.b);float w=max(d,0.);w*=w;sc+=v*w;sw+=w;}
  sc=sw>1e-4?sc/sw:(blu?vec3(.1,.2,.8):vec3(.2,.7,.25));
  vec3 p=c.rgb;float S=blu?p.b:p.g,A=p.r,B=blu?p.g:p.b;float Ss=blu?sc.b:sc.g,As=sc.r,Bs=blu?sc.g:sc.b;float al;
  if(kt==0){vec3 h=rgb2hsv(p),hs=rgb2hsv(sc);float dh=abs(h.x-hs.x);dh=min(dh,1.-dh)*360.;float wd=20.+60.*u_p2;
    float amt=dh<wd?.5+.5*cos(3.14159*dh/wd):0.;amt*=smoothstep(.12,.3,h.y);al=1.-amt;}
  else if(kt==1){vec3 d=p-sc;vec3 yuv=vec3(dot(d,vec3(.299,.587,.114)),dot(d,vec3(-.169,-.331,.5)),dot(d,vec3(.5,-.419,-.081)));
    float dist=length(yuv*vec3(.5,1.,1.));float r1=.04+.16*u_p2,r2=r1*1.8+.02;al=smoothstep(r1,r2,dist);}
  else if(kt==2){float vc=S-max(A,B),vs=max(Ss-max(As,Bs),1e-3);al=clamp(1.-vc/vs*(.6+.8*u_p2),0.,1.);}
  else{float rw=u_p2;float vc=S-(A*rw+B*(1.-rw)),vs=max(Ss-(As*rw+Bs*(1.-rw)),1e-3);al=clamp(1.-vc/vs,0.,1.);}
  float lim=kt==3?A*u_p2+B*(1.-u_p2):max(A,B);if(S>lim){if(blu)p.b=lim;else p.g=lim;}
  return vec4(p,al);`,
  `vec4 me=T(uv);if(me.a>.995)return me;vec3 acc=me.rgb*me.a*me.a;float ws=me.a*me.a;float Rr=R(24.);
  for(int i=0;i<96;i++){float t=(float(i)+.5)/96.;float r=Rr*t*t;float an=float(i)*2.39996;vec4 v=T(uv+vec2(cos(an),sin(an))*r*u_px);float w=v.a*v.a*v.a/(1.+r*.15);acc+=v.rgb*w;ws+=w;}
  vec3 ext=ws>1e-4?acc/ws:me.rgb;return vec4(mix(ext,me.rgb,me.a*me.a),me.a);`,
  `int vw=int(u_p3+.5);vec4 me=T(uv);vec2 pp=floor(PX(uv)/16.);vec3 chk=vec3(mod(pp.x+pp.y,2.)<.5?.42:.62);
  if(vw==1)return vec4(vec3(me.a),1.);if(vw==2)return vec4(me.rgb,1.);
  vec3 fg=me.rgb;if(vw==3){vec3 p=O(uv).rgb;fg=p;}
  return vec4(mix(chk,fg,me.a),1.);`],
  'Single-frame keyers on a screen colour picked automatically (most green/blue-dominant pixels of a 12x12 grid): HueKeyer = amount curve as a raised-cosine bump around the screen hue (width from Tolerance) with a saturation threshold; Primatte (approx.) = inner/outer shells around the backing colour in a chroma-weighted YUV distance (clear inside, opaque outside, soft between); Ultimatte (approx.) = Vlahos colour difference S - max(other two) normalised by the backing; IBKGizmo pick mode = 1 - (S - (R*rw + other*(1-rw))) / same for the screen colour, rw = weight; despill limits the screen channel; EdgeExtend pushes solid-foreground colour outward under semi-transparent edges (alpha-weighted spiral gather) so fringes lose the screen colour');

f = add('Repair');
f('q19_degrainblue','DegrainBlue (Nuke)',[P('Size',0,40,8,.5,'px')],
  [BH('u_p0*.5'),BV('u_p0*.5'),`vec3 o=O(uv).rgb;return vec4(o.r,o.g,T(uv).b,1.);`],
  'Nuke DegrainBlue: grain concentrates in the blue record, so only the blue channel is blurred (gaussian, Size); red and green untouched');

f = add('Materials');
f('q19_bumpboss','BumpBoss (Nuke, image as its own bump)',[P('Bump size',.5,12,2,.1,'px'),P('Light angle',0,360,135,1,'deg'),P('Light height',.05,4,1,.01),P('Minimum shadow',0,1,.15,.01)],
  [BH('u_p0'),BV('u_p0'),
  `vec2 e=u_px*max(R(1.),1.);float hx=luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb),hy=luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb);
  vec3 n=normalize(vec3(-hx*6.,-hy*6.,1.));float an=radians(u_p1);vec3 l=normalize(vec3(cos(an),sin(an),u_p2));
  float sh=dot(n,l)/max(l.z,1e-3);sh=max(sh,u_p3);return vec4(clamp(O(uv).rgb*sh,0.,1.),1.);`],
  'Nuke BumpBoss lights input B through a bump taken from input A; here A = the image itself (single-input use): luma blurred by Bump size gives the relief, a directional light from Light angle at Light height shades it (flat areas keep their value), Minimum shadow limits how dark the shadows get');

f = add('Analysis');
f('q19_landscape','Landscape Metrics (GRASS r.li moving window)',[S('Index',['Class richness','Simpson diversity','Pielou evenness','Patch density','Mean patch size','Contrast-weighted edge density','Input classes']),P('Classes',2,8,5,1),P('Window radius',2,24,6,1,'px'),S('Classify by',['Luma levels','Hue sectors'])],
  [`int N=int(u_p1+.5);float k;if(u_p3<.5)k=floor(clamp(luma(c.rgb),0.,.9999)*float(N));else{vec3 h=rgb2hsv(c.rgb);k=floor(fract(h.x+1./float(2*N))*float(N));}
   return vec4(vec3((k+.5)/8.),1.);`,
   `int N=int(u_p1+.5);float fN=float(N);int ix=int(u_p0+.5);
   if(ix==6)return vec4(ramp(2,(floor(T(uv).r*8.)+.5)/fN),1.);
   float rad=R(u_p2);float st=max(rad/8.,1.);int nr=int(min(floor(rad/st+.5),8.));
   float cnt[8];for(int q=0;q<8;q++)cnt[q]=0.;
   float V=0.,E=0.,F=0.,ew=0.;vec2 dx=vec2(st,0.)*u_px,dy=vec2(0.,st)*u_px;
   for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>nr||abs(j)>nr)continue;vec2 q=uv+vec2(float(i),float(j))*st*u_px;
     int a=int(T(q).r*8.);cnt[a]+=1.;V+=1.;int b=-1,d=-1;
     if(i<nr){b=int(T(q+dx).r*8.);if(a==b)E+=1.;else ew+=abs(float(a-b))/max(fN-1.,1.);}
     if(j<nr){d=int(T(q+dy).r*8.);if(a==d)E+=1.;else ew+=abs(float(a-d))/max(fN-1.,1.);}
     if(i<nr&&j<nr&&a==b&&a==d){int e=int(T(q+dx+dy).r*8.);if(a==e)F+=1.;}}
   float rich=0.,simp=0.,H=0.;for(int q=0;q<8;q++){float p=cnt[q]/V;if(p>0.){rich+=1.;simp+=p*p;H-=p*log(p);}}
   float np=max(V-E+F,1.);float side=2.*float(nr)+1.;float t;
   if(ix==0)t=(rich-1.)/max(fN-1.,1.);
   else if(ix==1)t=(1.-simp)/max(1.-1./fN,1e-3);
   else if(ix==2)t=rich>1.?H/log(rich):0.;
   else if(ix==3)t=np/V*side*.6;
   else if(ix==4)t=sqrt((V/np)/V);
   else t=ew/(2.*V)*6.;
   return vec4(ramp(2,clamp(t,0.,1.)),1.);`],
  'GRASS r.li landscape indices in a square moving window over a classified map (image quantised into N luma levels or hue sectors; window sampled at up to 17x17 cells): r.li.richness = number of classes present, r.li.simpson = 1 - sum p_i^2, r.li.pielou = Shannon H / ln(richness), r.li.patchdensity = patches per window area, r.li.mps = window area / patches, r.li.cwed = class-boundary length weighted by class contrast |i-j|/(N-1) per area; patches counted by the 4-connected Euler number V - E + F (approx.: holes count against patches); viridis display, normalised to 0..1');

f('q19_stddevcolors','Std-Dev Colour Rules (GRASS r.colors.stddev)',[S('Rule',['Blue white red (mean +- 2 sd)','Bands (1 2 3 sd)','Zero-centred blue white red','Zero-centred bands']),S('Input',['Luma','Luma minus local mean']),P('Local mean radius',2,80,16,1,'px')],
  [BH('u_p2'),BV('u_p2'),
  `int rl=int(u_p0+.5);bool hp=u_p1>.5;
#define Q19VAL(QQ) (hp?luma(O(QQ).rgb)-luma(T(QQ).rgb):luma(O(QQ).rgb))
  float s1=0.,s2=0.,mxa=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float v=Q19VAL((vec2(float(i),float(j))+.5)/16.);s1+=v;s2+=v*v;mxa=max(mxa,abs(v));}
  float mean=s1/256.,sd=sqrt(max(s2/256.-mean*mean,1e-8)),rms=sqrt(s2/256.);
  float v=Q19VAL(uv);vec3 BLU=vec3(0.,0.,1.),WHI=vec3(1.),RED=vec3(1.,0.,0.),YEL=vec3(1.,1.,0.),GRN=vec3(0.,1.,0.);vec3 o;
  if(rl==0){float z=(v-mean)/sd;o=z<0.?mix(WHI,BLU,clamp(-z/2.,0.,1.)):mix(WHI,RED,clamp(z/2.,0.,1.));}
  else if(rl==1){float z=abs(v-mean)/sd;o=z<1.?GRN:z<2.?YEL:z<3.?RED:vec3(0.);}
  else if(rl==2){float s2d=max(2.*rms,1e-4);o=v<0.?mix(WHI,BLU,clamp(-v/s2d,0.,1.)):mix(WHI,RED,clamp(v/s2d,0.,1.));}
  else{float z=abs(v)/max(rms,1e-4);o=z<1.?GRN:z<2.?YEL:z<3.?RED:vec3(0.);}
  return vec4(o,1.);`],
  'GRASS r.colors.stddev colour tables from statistics of a 16x16 sample grid: blue at mean-2sd -> white at the mean -> red at mean+2sd; bands: green within 1 sd, yellow 1-2, red 2-3, black beyond 3; zero-centred versions pin white at 0 (for difference maps; GRASS takes the 68/95/99.7 percentiles of |v|, here 1/2/3 x RMS, approx.); input = luma or luma minus a gaussian local mean (a signed difference map)');

f = add('Film');
f('q19_pse_oldphoto','Old Fashioned Photo (Elements guided edit)',[S('Black and white style',['Portraits','Scenic Landscape','Urban Snapshots','Vivid Landscapes','Infrared Effect','Newspaper']),P('Texture',0,1,.45,.01),P('Hue (tint amount)',0,1,.6,.01),P('Tone (contrast)',-1,1,.1,.01)],
  `int st=int(u_p0+.5);vec3 w=st==0?vec3(.45,.4,.15):st==1?vec3(.25,.55,.2):st==2?vec3(.3,.5,.2):st==3?vec3(.35,.6,.05):st==4?vec3(-.3,1.6,-.3):vec3(.33,.34,.33);
  float ct=st==2?1.25:st==5?1.6:st==4?1.15:1.05;float y=clamp(dot(c.rgb,w),0.,1.);y=clamp((y-.5)*ct*(1.+.6*u_p3)+.5+.05*u_p3,0.,1.);
  vec2 p=PX(uv);float paper=fbm(p*.08)*.6+fbm(p*.6)*.4;float fib=vnoise(vec2(p.x*.04,p.y*1.3))*.5+vnoise(vec2(p.x*1.1,p.y*.05))*.5;float tx=(paper-.5)*.35+(fib-.5)*.15;
  vec2 d=uv-.5;float vig=1.-smoothstep(.35,.85,length(d*vec2(asp(),1.)/max(asp(),1.))*1.2);
  y=clamp(y+tx*u_p1,0.,1.)*mix(1.,.82+.18*vig,u_p1);
  vec3 tint=hsv2rgb(vec3(.085,.42,1.));vec3 col=mix(vec3(y),y*tint*1.08+vec3(.03,.02,0.)*(1.-y),u_p2);
  return vec4(clamp(col,0.,1.),1.);`,
  'Photoshop Elements Old Fashioned Photo guided edit: 1 choose a black-and-white style (Convert to B&W channel mixes, approx. weights), 2 Add Texture (aged paper grain + fibres, slight edge darkening), 3 Add Hue (Hue/Saturation colorize toward sepia, amount), 4 Adjust Tone (brightness/contrast)', 1);

f = add('Depth');
f('q19_pse_speed','Speed Effect (Elements guided edit, subject from depth)',[P('Angle',0,360,0,1,'deg'),P('Blur length',5,250,70,1,'px'),P('Subject depth',0,1,.5,.01),P('Focus area',0,1,.35,.01)],
  `float an=radians(u_p0);vec2 dir=vec2(cos(an),sin(an))*vec2(1.,asp());vec2 du=dir*R(u_p1)*u_px;
#define Q19SUBJ(QQ) smoothstep(u_p2-.04,u_p2+.04,D(QQ))
  vec3 acc=vec3(0.);float ws=0.,cov=0.;
  for(int i=0;i<48;i++){float t=(float(i)+.5)/48.;vec2 q=uv+du*t;float m=Q19SUBJ(q);acc+=O(q).rgb*m;ws+=m;cov+=m*(1.-t*.6);}
  cov/=48.;vec3 sm=ws>1e-3?acc/ws:c.rgb;float lay=clamp(cov*1.6,0.,1.);
  float me=Q19SUBJ(uv);float front=me*(1.-Q19SUBJ(uv-du*(1.-u_p3)));float keep=clamp(front*smoothstep(0.,.05,u_p3),0.,1.);
  return vec4(mix(c.rgb,sm,lay*(1.-keep)),1.);`,
  'Photoshop Elements Speed Effect guided edit: the selected subject (here: pixels nearer than Subject depth on the depth map, instead of the Quick Selection brush) gets a motion-blurred copy that smears and trails behind it along Angle; the focus area keeps the leading part of the subject sharp');
