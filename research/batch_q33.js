/* ================= q33: historical photographic & print processes 2 (round 16) - look approximations ================= */
const Q33_TONE = `
#define Q33T(l_,a_,m_,h_) ((l_)<.5?mix((a_),(m_),(l_)*2.):mix((m_),(h_),(l_)*2.-1.))
`;
const Q33_EDGE = amt => `{vec2 ed_=min(uv,1.-uv)*vec2(asp(),1.);float dd_=min(ed_.x,ed_.y);float st_=ed_.x<ed_.y?vnoise(p*vec2(.25,.008)):vnoise(p*vec2(.008,.25));
 float j_=(fbm(p*.02)-.5)*.07+(st_-.5)*.05;float e_=dd_-(.02+.05*(${amt}))+j_;o=mix(paper,o,smoothstep(0.,.015,e_));o=mix(o,paper,(1.-smoothstep(0.,.035,e_))*smoothstep(.45,.8,1.-st_)*.35);}`;
f = add('Film');
f('q33_handprint','Hand-Coated & Camera-less Processes (Fresson, argyrotype, uranotype, cuprotype, oil print, calotype, lumen, cliche-verre, chemigram, photo-crayon)',
  [S('Process',['Fresson direct carbon','Argyrotype','Uranotype','Cuprotype','Rawlins oil print','Calotype paper negative','Lumen print','Cliche-verre','Chemigram','Photo-crayon portrait']),P('Exposure',-1,1,0,.01),P('Contrast',.5,2,1,.01),P('Texture',0,1,.5,.01)],
  [BH('1.+2.*u_p3'), BV('1.+2.*u_p3'), Q33_TONE + `
 int m=int(u_p0+.5);vec3 o0=O(uv).rgb;vec2 p=PX(uv);float tx=u_p3;
 const vec3 TA[10]=vec3[10](vec3(.11,.085,.07),vec3(.17,.09,.05),vec3(.2,.07,.05),vec3(.28,.08,.05),vec3(.08,.07,.06),vec3(.17,.11,.08),vec3(.3,.13,.17),vec3(.14,.1,.08),vec3(0.),vec3(.09,.09,.1));
 const vec3 TM[10]=vec3[10](vec3(.47,.4,.32),vec3(.56,.41,.28),vec3(.6,.37,.26),vec3(.72,.42,.31),vec3(.45,.42,.38),vec3(.5,.37,.26),vec3(.76,.5,.47),vec3(.5,.45,.4),vec3(0.),vec3(.5,.49,.48));
 const vec3 TH[10]=vec3[10](vec3(.93,.9,.83),vec3(.96,.93,.86),vec3(.95,.9,.84),vec3(.97,.92,.87),vec3(.92,.9,.85),vec3(.86,.77,.58),vec3(.94,.88,.88),vec3(.94,.9,.81),vec3(0.),vec3(.95,.93,.89));
 float l=luma(o0),lb=L(uv);
 if(m==0||m==4||m==5||m==9)l=mix(l,lb,m==5?.8:.5);
 if(m==5)l=1.-l;
 l=clamp((l-.5)*u_p2+.5+u_p1*.35,0.,1.);
 vec3 paper=TH[m];float d=1.-l;
 if(m==0){d*=1.+((vnoise(p/1.7)-.5)*.7+(vnoise(p/4.5)-.5)*.4)*tx*.5;d=pow(clamp(d,0.,1.),1.1);}
 else if(m==4){float n=vnoise(p/1.3)*.55+hash(floor(p/1.1))*.25+vnoise(rot(p,.6)*vec2(.06,.5))*.2;d=mix(d,smoothstep(n-.3,n+.3,d),.6*tx);}
 else if(m==5){float fb=vnoise(p*vec2(.7,.06))*.45+vnoise(p*vec2(.07,.8))*.3+fbm(p*.02)*.5;d=clamp(d+(fb-.6)*.25*tx,0.,1.);}
 else if(m==6){d=pow(d,.8);}
 else if(m==7){float e=smoothstep(.12,.4,length(sobelD(uv,1.5)));float j1=vnoise(p*.05)*.8;
  float h1=abs(fract((p.x+p.y)*.1179+j1)-.5)*2.,h2=abs(fract((p.x-p.y)*.1179+j1*.7)-.5)*2.,h3=abs(fract(p.x*.18+j1)-.5)*2.;
  float dk=clamp((.5-lb)*u_p2+.5-u_p1*.35,0.,1.);
  float ink=max(e,max(smoothstep(.25,.08,h1)*step(.4,dk),max(smoothstep(.25,.08,h2)*step(.6,dk),smoothstep(.3,.08,h3)*step(.8,dk))));
  d=ink*(.8+.2*hash(floor(p/2.)));}
 else if(m==9){float tooth=vnoise(p*.7)*.55+hash(floor(p))*.45;d=clamp(d*1.1-(tooth-.5)*.5*tx*d,0.,1.);
  vec2 qv=(uv-.5)*vec2(asp()*.8,1.15);d*=1.-smoothstep(.4,.5+.1*(fbm(p*.03)-.5),length(qv));}
 l=1.-clamp(d,0.,1.);
 vec3 o=Q33T(l,TA[m],TM[m],TH[m]);
 if(m==6){o=mix(o,o*vec3(1.08,.95,.7),smoothstep(.45,.75,fbm(p*.012+3.))*tx);o=mix(o,o*vec3(.85,.97,.85),smoothstep(.5,.8,fbm(p*.02+9.))*tx*.6*(1.-l));}
 if(m==8){vec2 w=vec2(fbm(p*.006),fbm(p*.006+4.3));float fl=fbm(p*.01+w*3.);float v=clamp(l*.75+(fl-.5)*1.3*tx+.12,0.,1.);
  o=stops5(vec3(.06,.04,.03),vec3(.36,.16,.08),vec3(.78,.56,.24),vec3(.62,.66,.52),vec3(.95,.92,.84),v);
  float bd=.5-abs(fract(v*5.)-.5);o*=1.-.35*smoothstep(.06,0.,bd)*tx;}
 o*=1.+(fbm(p*.05)-.5)*.12*tx;
 if(m>=1&&m<=3)` + Q33_EDGE('tx') + `
 return vec4(clamp(o,0.,1.),1.);`],
  'look approximation (tones and textures read from conservation descriptions, not measured): Fresson = direct pigment (charbon-satin) print, soft with coarse pigment grain; argyrotype = iron-silver, sepia brown; uranotype = uranium-salt, red-brown/chocolate; cuprotype = copper-salt, red-brown; argyro/urano/cupro show hand-brushed coating edges; Rawlins oil print = bichromated gelatin inked with a brush (stippled ink); calotype paper negative = soft reversed image in red-brown on translucent waxed paper with fibre texture; lumen print = unprocessed printing-out paper, plum-rose-lavender with ochre/green stains; cliche-verre = drawing scratched in coated glass and contact-printed (hatched line image, salt-print tone); chemigram = chemical resists on photo paper (image modulated by flow patterns, ochre/olive bands); photo-crayon = faint enlargement worked over with charcoal (tooth grain, oval vignette)', 1);

f('q33_mechprint','Photomechanical & Copy Prints (Woodburytype, collotype, photogravure, hectograph, diazotype, aniline print)',
  [S('Process',['Woodburytype','Collotype','Photogravure (aquatint grain)','Hectograph','Diazotype (Ozalid)','Aniline print (Willis)']),P('Exposure',-1,1,0,.01),P('Contrast',.5,2,1,.01),P('Grain / texture',0,1,.5,.01)],
  [BH('1.5'), BV('1.5'), Q33_TONE + `
 int m=int(u_p0+.5);vec3 o0=O(uv).rgb;vec2 p=PX(uv);float tx=u_p3;
 const vec3 TA[6]=vec3[6](vec3(.1,.05,.06),vec3(.11,.095,.085),vec3(.06,.05,.045),vec3(.33,.12,.52),vec3(.17,.12,.4),vec3(.2,.07,.26));
 const vec3 TM[6]=vec3[6](vec3(.42,.27,.25),vec3(.47,.42,.37),vec3(.4,.36,.31),vec3(.62,.47,.76),vec3(.52,.47,.7),vec3(.52,.4,.5));
 const vec3 TH[6]=vec3[6](vec3(.95,.92,.87),vec3(.95,.93,.88),vec3(.95,.92,.85),vec3(.96,.95,.97),vec3(.94,.93,.86),vec3(.89,.87,.79));
 float l=luma(o0),lb=L(uv);
 if(m==3)l=mix(l,lb,.7);
 l=clamp((l-.5)*u_p2*(m==5?2.2:m==3?1.5:m==4?.85:1.)+.5+u_p1*.35,0.,1.);
 float d=1.-l;
 if(m==0)d=pow(d,1.15);
 else if(m==1){float r=vnoise(p*.85)*.6+vnoise(p*1.9+7.)*.4;float wr=1.-abs(r-.5)*2.;d=mix(d,smoothstep(.1,.9,d+(wr-.55)*.6),.55*tx);}
 else if(m==2){float gr=hash(floor(p/1.2))*.5+vnoise(p/1.6)*.5;d=.03+.97*d;d=clamp(d+(gr-.5)*.45*tx*min(d*(1.-d)*4.+.15,1.),0.,1.);}
 else if(m==3){d*=.5+.7*fbm(p*.008)*(1.-.4*tx)+.3*tx*fbm(p*.03);}
 else if(m==4){d*=.9;}
 vec3 o=Q33T(1.-clamp(d,0.,1.),TA[m],TM[m],TH[m]);
 if(m==0){vec2 g=vec2(L(uv+vec2(u_px.x,0.))-L(uv-vec2(u_px.x,0.)),L(uv+vec2(0.,u_px.y))-L(uv-vec2(0.,u_px.y)));o*=1.+(g.x-g.y)*6.*tx*(1.-l);}
 if(m==2){vec2 e=min(uv,1.-uv)*vec2(asp(),1.);float dm=min(e.x,e.y);float pm=.045;
  if(dm<pm)o=vec3(.97,.95,.9)*(1.-.07*smoothstep(pm-.008,pm,dm)*tx);else o*=1.-.06*smoothstep(pm+.012,pm,dm);}
 if(m==4)o=mix(o,o*vec3(1.02,.97,.8),smoothstep(.3,.75,length(uv-.5))*tx);
 o*=1.+(fbm(p*.06)-.5)*.08*tx;
 return vec4(clamp(o,0.,1.),1.);`],
  'look approximation: Woodburytype = continuous-tone pigmented gelatin relief, purple-brown, no grain, slight relief; collotype = ink held by reticulated (worm-like) gelatin grain; photogravure = intaglio with aquatint rosin grain, plate tone and plate mark; hectograph = aniline-violet gelatin-pad copy, soft and unevenly inked; diazotype (Ozalid) = blue-violet azo dye, low contrast, yellowing paper; aniline print (Willis 1864) = positive line-copy in aniline purple-black', 1);

f = add('Stylize');
f('q33_colorlitho','Colour Lithographic & Stencil Prints (Photochrom, chromolithograph, pochoir, ukiyo-e)',
  [S('Process',['Photochrom (Photoglob)','Chromolithograph','Pochoir stencil colouring','Ukiyo-e woodblock print']),P('Levels / colours',3,10,6,1),P('Key line weight',0,3,1,.1,'px'),P('Texture',0,1,.5,.01)],
  [BH('2.'), BV('2.'), `
 int m=int(u_p0+.5);vec3 sm=T(uv).rgb;vec2 p=PX(uv);float n=floor(u_p1+.5);float tx=u_p3;
 float e=length(sobelD(uv,max(R(u_p2),1.)));float ink=u_p2<.05?0.:smoothstep(.16,.42,e);vec3 o;
 if(m==0){const vec3 PC[7]=vec3[7](vec3(.66,.63,.53),vec3(.56,.72,.78),vec3(.5,.56,.31),vec3(.78,.63,.41),vec3(.75,.5,.42),vec3(.42,.6,.6),vec3(.62,.56,.68));
  const float PH[7]=float[7](0.,.56,.24,.1,.02,.47,.75);vec3 h=rgb2hsv(sm);int k=0;
  if(h.y>.13){float bd=9.;for(int i=1;i<7;i++){float dh=abs(fract(h.x-PH[i]+.5)-.5);if(dh<bd){bd=dh;k=i;}}}
  float v=clamp(luma(sm)+(hash(floor(p))-.5)*.07*tx+(vnoise(p*.5)-.5)*.08*tx,0.,.999)*n;v=(floor(v)+smoothstep(.3,.7,fract(v)))/n;
  o=v<.5?mix(vec3(.17,.16,.15),PC[k],v*2.):mix(PC[k],vec3(.95,.93,.85),v*2.-1.);ink*=.25;}
 else if(m==1){vec2 dr=fromPX(vec2(.8,.5));vec3 v=sat(vec3(T(uv+dr).r,sm.g,T(uv-dr.yx).b),1.25);
  float th=mix(.5,vnoise(p*.9)*.5+hash(floor(p))*.5,tx);o=floor(clamp(v,0.,1.)*(n-1.)+th)/(n-1.)*vec3(.97,.94,.86);ink*=.7;}
 else if(m==2){o=floor(clamp(sat(sm,1.35),0.,1.)*(n-1.)+.5)/(n-1.)*vec3(.97,.95,.9);
  o*=1.+(vnoise(p*.35)-.5)*.14*tx+(hash(floor(p/2.))-.5)*.05*tx;o*=1.-.12*smoothstep(.05,.2,e)*tx;}
 else{const vec3 PU[10]=vec3[10](vec3(.93,.89,.8),vec3(.13,.12,.12),vec3(.16,.3,.52),vec3(.82,.35,.22),vec3(.85,.7,.38),vec3(.4,.52,.32),vec3(.52,.66,.76),vec3(.88,.62,.6),vec3(.5,.36,.25),vec3(.58,.57,.55));
  vec3 v=sat(sm,1.3);float bd=9.;int k=0;for(int i=0;i<10;i++){if(i>=int(n))break;vec3 dd=v-PU[i];float de=dot(dd,dd);if(de<bd){bd=de;k=i;}}
  o=PU[k]*(.92+.16*(luma(sm)-luma(PU[k])+.5));if(k==2||k==6)o=mix(o,PU[2]*.7,smoothstep(.6,1.,uv.y));
  o*=1.+(vnoise(p*vec2(.02,.5))-.5)*.16*tx;o+=.035*tx*smoothstep(.72,.95,vnoise(p*vec2(.9,.05)));}
 o=mix(o,vec3(.1,.09,.09),ink);
 return vec4(clamp(o,0.,1.),1.);`],
  'look approximation: Photochrom = lithographic colouring of a b&w negative from several stones (muted hand-assigned inks: sky, foliage, ochre, brick, water, mauve, shaded by stepped tone with stone grain, no key line); chromolithograph = one stone per tone/colour, crayon-stipple dither and slight misregistration under a key drawing; pochoir = flat gouache areas brushed through stencils over a key line, sponge texture; ukiyo-e = sumi keyblock lines, flat pigment palette (washi, Prussian blue with bokashi gradient, vermilion, ochre, green, beni) and woodgrain; Levels sets stones / palette size');

f = add('Film');
f('q33_plate','Cased, Glass & Interference Images (pannotype, ivorytype, opalotype, crystoleum, orotone, lantern slide, heliochrome, Lippmann, emulsion lift)',
  [S('Process',['Pannotype','Ivorytype','Opalotype','Crystoleum','Orotone (goldtone)','Hyalotype lantern slide','Heliochrome (Niepce de Saint-Victor)','Lippmann interference plate','Polaroid emulsion lift']),P('Exposure',-1,1,0,.01),P('Age / wear',0,1,.4,.01),P('Mount / edge / angle',0,1,.5,.01)],
  [BH('2.'), BV('2.'), Q33_TONE + `
 int m=int(u_p0+.5);vec3 o0=O(uv).rgb;vec3 sm=T(uv).rgb;vec2 p=PX(uv);float ag=u_p2,mt=u_p3,A=asp();vec2 q=(uv-.5)*vec2(A,1.);
 float lb=clamp(dot(o0,vec3(.06,.3,.64))+u_p1*.35,0.,1.),l=clamp(luma(o0)+u_p1*.35,0.,1.);
 float E=length((uv-.5)*2.)/(1.32-.36*mt);vec3 o;
 if(m==0){o=Q33T(smoothstep(.05,.95,lb),vec3(.05,.045,.04),vec3(.3,.29,.24),vec3(.68,.65,.56));
  vec2 cp=p/22.;vec2 ci=floor(cp);float m1=9.,m2=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));float dd=length(cp-cc-hash2(cc));if(dd<m1){m2=m1;m1=dd;}else if(dd<m2)m2=dd;}
  o=mix(o,vec3(.02),smoothstep(.06,0.,m2-m1)*ag*.7);o*=1.+(fbm(p*.012+vec2(.05,0.))-fbm(p*.012))*6.*ag;
  o=mix(o,vec3(.06,.05,.05)*(.8+.4*fbm(p*.1)),smoothstep(.97,1.,E)*step(.01,mt));}
 else if(m==1){float v=clamp(mix(l,luma(sm)+u_p1*.35,.5),0.,1.);o=Q33T(v,vec3(.25,.17,.11),vec3(.63,.52,.4),vec3(.97,.93,.82));
  o*=mix(vec3(1.),sm/max(luma(sm),.03),.4);o*=mix(vec3(1.),vec3(1.,.96,.85),ag*.6);o=mix(o,vec3(.95,.9,.78),smoothstep(.85,1.05,E)*step(.01,mt));}
 else if(m==2){o=Q33T(l,vec3(.07,.065,.065),vec3(.44,.42,.4),vec3(.97,.97,.95));o=mix(o,max(o,Q33T(clamp(luma(sm)+u_p1*.35,0.,1.),vec3(.07),vec3(.44,.42,.4),vec3(.97,.97,.95))),.5);
  o=mix(o,vec3(.96,.96,.94),.07);o*=mix(vec3(1.),vec3(1.,.97,.9),ag*.4);
  vec3 gilt=vec3(.72,.57,.3)*(.75+.5*vnoise(p*.4));o=mix(o,gilt*(1.+.4*smoothstep(.02,0.,abs(E-1.02))),smoothstep(.99,1.,E)*step(.01,mt));}
 else if(m==3){o=sat(sm*exp2(u_p1),1.15)*.85+.12;o*=1.-.35*smoothstep(.35,.75,length(q/vec2(A,1.)));
  o=mix(o,o*vec3(1.,.95,.8),ag*smoothstep(.4,.7,fbm(p*.01)));float sp=exp(-pow((length(q-vec2(.12,-.12))-.42)/.035,2.))*smoothstep(0.,.35,q.y-q.x);o+=sp*.4*mt;}
 else if(m==4){float v=pow(lb,.75);float sh=.8+.5*fbm(p*.015+vec2(q.x*1.5,0.));vec3 gold=vec3(1.,.8,.36)*sh+step(.992,hash(floor(p)))*.3;
  o=mix(vec3(.07,.045,.025),gold,v);o*=mix(vec3(1.),vec3(.85,.8,.75),ag*smoothstep(.5,.8,fbm(p*.02+5.)));o*=1.-.6*mt*smoothstep(.42,.72,length(uv-.5));}
 else if(m==5){o=Q33T(smoothstep(.02,.98,l),vec3(.03,.03,.03),vec3(.36,.33,.29),vec3(.98,.96,.9));
  float sh=.5-.12*mt;vec2 hs=vec2(A*sh,sh)-.05;vec2 dq=abs(q)-hs;float sd=length(max(dq,0.))+min(max(dq.x,dq.y),0.)-.05;
  o=mix(o,vec3(.035,.03,.03)*(.8+.4*fbm(p*.2)),smoothstep(-.002,.002,sd)*step(.01,mt));
  vec2 ee=min(uv,1.-uv)*vec2(A,1.);o=mix(o,vec3(.01),step(min(ee.x,ee.y),.02)*step(.01,mt));
  o=mix(o,vec3(.05),step(1.-.006*ag,hash(floor(p/2.))));o=mix(o,o*.6,step(.997,hash(vec2(floor(p.x/1.5),3.)))*ag);}
 else if(m==6){vec3 col=mix(vec3(l),o0*exp2(u_p1),.45);o=vec3(.12,.1,.12)+col*vec3(.66,.6,.64);
  o=mix(o,vec3(.42,.36,.33),clamp(fbm(p*.006)*ag*.8+smoothstep(.3,.65,length(uv-.5))*ag*.5,0.,1.));}
 else if(m==7){vec3 h=rgb2hsv(o0*exp2(u_p1));h.x=fract(h.x+(uv.x-.5+(uv.y-.5)*.5)*.15*mt);h.y=clamp(h.y*1.6+.1,0.,1.);h.z=pow(h.z,1.5)*.92;
  o=hsv2rgb(h)+vec3(.015,.02,.045);o+=.07*mt*(1.-h.z)*(.5+.5*cos(6.2832*(vec3(0.,.33,.67)+uv.x*2.+uv.y*1.3)));
  o=mix(o,o*vec3(.8,.7,.55)+.03,ag*smoothstep(.35,.5,length(uv-.5))*.8);}
 else{vec2 dsp=(vec2(fbm(p*.005+11.),fbm(p*.005+23.))-.5)*40.*ag;vec2 pp=p+dsp;vec3 c2=O(fromPX(pp)).rgb;
  float sh=(fbm(pp*.02+vec2(.06,0.))-fbm(pp*.02))*5.*ag;c2=(mix(c2,vec3(luma(c2)),.15)*.88+.07)*(1.+sh)*exp2(u_p1);
  vec3 pap=vec3(.95,.94,.9)*(1.+(vnoise(p*.3)-.5)*.05);vec2 ee=min(uv,1.-uv)*vec2(A,1.);
  float ed=min(ee.x,ee.y)-(.03+.07*mt)+(fbm(p*.03)-.5)*.06;float ins=smoothstep(0.,.004,ed);
  c2=mix(c2,pap*.97,(1.-smoothstep(0.,.02,ed))*.45);o=mix(pap*(1.-.08*smoothstep(.03,0.,-ed)),c2,ins);}
 return vec4(clamp(o,0.,1.),1.);`],
  'look approximation (from museum descriptions): pannotype = collodion positive on black oilcloth (dark, low contrast, crazed and wrinkled); ivorytype = hand-tinted print on ivory-toned waxed paper (soft, warm); opalotype = positive on milk (opal) glass, luminous white base, gilt oval mat; crystoleum = albumen print fixed face-down to convex glass and painted behind (pastel colour, curved-glass highlight); orotone = glass positive backed with gold (gold highlights, dark shadows); hyalotype lantern slide = albumen positive on glass with black mask and binding; heliochrome = faint, unstable silver-chloride colours on a dull violet base; Lippmann plate = interference colours over a dark mirror, hue shifting with viewing angle (Mount slider = angle); Polaroid emulsion lift = floated emulsion with folds and torn edges on watercolour paper', 1);

f('q33_colorprint','Pigment & Dye Colour Prints (carbro, dye transfer, Cibachrome)',
  [S('Process',['Carbro (tri-colour carbon)','Dye transfer (Kodak)','Cibachrome (Ilfochrome)']),P('Amount',0,1,1,.01),P('Contrast',.5,2,1,.01),P('Exposure',-1,1,0,.01)],
  `int m=int(u_p0+.5);vec3 x0=c.rgb,x=x0;
 if(m==0){vec2 dr=fromPX(vec2(.7,.4));x=vec3(O(uv+dr).r,x.g,O(uv-dr.yx).b);}
 x=clamp((x*exp2(u_p3)-.5)*u_p2+.5,0.,1.);float l=luma(x);vec3 o;
 if(m==0){o=sat(pow(x,vec3(1.12)),1.25)*vec3(1.02,1.,.96);
  vec2 g=vec2(luma(O(uv+vec2(u_px.x,0.)).rgb)-luma(O(uv-vec2(u_px.x,0.)).rgb),luma(O(uv+vec2(0.,u_px.y)).rgb)-luma(O(uv-vec2(0.,u_px.y)).rgb));o*=1.+(g.x-g.y)*1.2*(1.-l);}
 else if(m==1){o=clamp(sat(x,1.35),0.,1.);o=o*o*(3.-2.*o)*.35+o*.65;o=mix(o*vec3(.93,1.,1.05),o,smoothstep(0.,.35,l));}
 else{o=clamp((sat(x,1.55)-.5)*1.25+.5,0.,1.);o=o*o*(3.-2.*o)*.5+o*.5;o=vec3(o.r*.95+o.b*.05,o.g,o.b)*vec3(.98,.99,1.03);}
 return vec4(clamp(mix(x0,o,u_p1),0.,1.),1.);`,
  'look approximation: carbro = three pigment carbon tissues (rich long-toe blacks, pigment saturation, faint relief and tissue misregistration); dye transfer = dye-imbibition matrices (saturated, smooth, deep cyan-leaning shadows, wide tonal range); Cibachrome = silver dye-bleach azo dyes (high contrast and saturation, cool, magenta-leaning reds)');

f('q33_screenplate','Additive Colour Screen Plates (Joly, McDonough, Krayn, Paget, Finlay, Thames, Omnicolore, Dufaycolor)',
  [S('Screen',['Joly line screen','McDonough line screen','Krayn line screen','Paget mosaic','Finlay mosaic','Thames (circles)','Omnicolore (crossed lines)','Dufaycolor reseau']),P('Element size',1,12,3,.1,'px'),P('Exposure',-1,1,0,.01),P('Mosaic visibility',0,1,.8,.01)],
  `int m=int(u_p0+.5);vec2 p=PX(uv)/max(u_p1,.5);
 const vec3 CR[8]=vec3[8](vec3(.85,.2,.12),vec3(.85,.15,.1),vec3(.8,.15,.15),vec3(.85,.15,.1),vec3(.82,.18,.12),vec3(.85,.2,.12),vec3(.85,.25,.1),vec3(.8,.1,.08));
 const vec3 CG[8]=vec3[8](vec3(.35,.7,.12),vec3(.45,.75,.1),vec3(.15,.65,.25),vec3(.15,.65,.15),vec3(.18,.62,.2),vec3(.2,.65,.15),vec3(.2,.6,.15),vec3(.12,.6,.18));
 const vec3 CB[8]=vec3[8](vec3(.22,.2,.85),vec3(.15,.2,.8),vec3(.15,.2,.8),vec3(.12,.15,.8),vec3(.12,.2,.78),vec3(.15,.18,.75),vec3(.25,.25,.85),vec3(.1,.18,.75));
 int k=2;vec3 ar=vec3(1./3.);float gap=0.;
 if(m==0){float u=p.x+(vnoise(vec2(floor(p.x/3.),p.y*.05))-.5)*.3;k=int(mod(floor(u),3.));}
 else if(m==1){k=int(mod(floor(p.x),3.));gap=step(.84,fract(p.x));ar=vec3(.28);}
 else if(m==2){float u=(p.x+p.y)*.7071;u+=(hash(vec2(floor(u/3.),5.))-.5)*.5;k=int(mod(floor(u),3.));gap=step(.985,hash(vec2(floor(u),2.)))*step(.85,fract(u));}
 else if(m==3||m==4){vec2 r=m==3?rot(p,.7854):p;vec2 cc=floor(r);vec2 fq=abs(fract(r)-.5);float bs=m==3?.375:.4;
  k=(mod(cc.x+cc.y,2.)<.5&&max(fq.x,fq.y)<bs)?2:int(mod(cc.y,2.));float ab=2.*bs*bs;ar=vec3((1.-ab)*.5,(1.-ab)*.5,ab);}
 else if(m==5){vec2 cc=floor(p);k=length(fract(p)-.5)<.42?int(mod(cc.x+cc.y,2.)):2;float ac=PI*.1764;ar=vec3(ac*.5,ac*.5,1.-ac);}
 else if(m==6){vec2 cc=floor(p);vec2 fq=fract(p);k=(fq.x<.3||fq.y<.3)?2:int(mod(cc.x+cc.y,2.));ar=vec3(.245,.245,.51);}
 else{vec2 r=rot(p,.4014);vec2 cc=floor(r);k=mod(cc.y,2.)<.5?0:1+int(mod(cc.x,2.));ar=vec3(.5,.25,.25);}
 vec3 cr=CR[m],cg=CG[m],cb=CB[m];
 vec3 lin=pow(clamp(c.rgb,0.,1.),vec3(2.2))*exp2(u_p2)*(1.+(hash(floor(PX(uv)))-.5)*.12);
 vec3 rs=vec3(dot(lin,vec3(.82,.16,.02)),dot(lin,vec3(.12,.76,.12)),dot(lin,vec3(.02,.16,.82)));
 vec3 wht=ar.x*cr+ar.y*cg+ar.z*cb;vec3 wb=dot(wht,vec3(1./3.))/wht*2.;
 vec3 avg=(ar.x*cr*rs.r+ar.y*cg*rs.g+ar.z*cb*rs.b)*wb;
 vec3 mos=(k==0?cr*rs.r:k==1?cg*rs.g:cb*rs.b)*wb*(1.-gap);
 return vec4(pow(clamp(mix(avg,mos,u_p3),0.,1.),vec3(1./2.2)),1.);`,
  'look approximation of the screen geometry (from filmcolors.org / Penichon / colour-screen literature): panchromatic record through the taking screen, viewed through the same dyed elements; Joly = ruled R/G/B-violet lines; McDonough = thinner R / yellow-green / B lines with gaps; Krayn = lines cut from stacked dyed celluloid (diagonal, uneven widths, splits); Paget = 45 deg rows of red+blue and green+blue squares, blue smaller; Finlay = orthogonal chequer of the same kind; Thames = red and green circles on a blue field; Omnicolore = blue-violet crossed lines with red / green squares; Dufaycolor = red lines alternating with rows of green and blue squares at about 23 deg. Visibility 0 = viewed from a distance (averaged)', 1);

f = add('Frames');
f('q33_cardmount','Carte de Visite / Cabinet Card / Stereograph Mount',
  [S('Mount',['Carte de visite','Cabinet card','Stereograph card']),S('Card',['Cream','Buff','Black with gilt edge','Grey-green']),P('Wear',0,1,.35,.01),S('Print tone',['Keep colours','Albumen sepia'])],
  Q33_TONE + `
 int m=int(u_p0+.5),cd=int(u_p1+.5);float wr=u_p2,A=asp();vec2 q=vec2(uv.x*A,1.-uv.y);vec2 p=PX(uv);
 vec2 cs=m==0?vec2(2.5,4.):m==1?vec2(4.25,6.5):vec2(7.,3.5);
 float sc=min(A*.92/cs.x,.92/cs.y);vec2 c0=(vec2(A,1.)-cs*sc)*.5;vec2 ci=(q-c0)/sc;vec2 hd=cs*.5;
 vec2 dq=abs(ci-hd)-(hd-.12);float sd=length(max(dq,0.))+min(max(dq.x,dq.y),0.)-.12;sd+=(fbm(p*.08)-.5)*.03*wr;
 vec3 o=vec3(.2,.19,.18)*(.9+.2*fbm(p*.02))*(1.-.5*smoothstep(.15,0.,sd-.05));
 const vec3 CC[4]=vec3[4](vec3(.9,.86,.76),vec3(.8,.69,.52),vec3(.07,.065,.06),vec3(.52,.55,.47));
 vec3 card=CC[cd]*(1.+(fbm(p*.15)-.5)*.06);
 card*=1.-.35*wr*smoothstep(0.,.7,length(max(abs(ci-hd)-hd+.7,0.)))*fbm(p*.05+3.);
 card=mix(card,card*vec3(.8,.66,.48),wr*step(.985,hash(floor(p/3.)))*.8);
 if(cd==2||m==1)card=mix(card,vec3(.78,.62,.3)*(.8+.4*vnoise(p*.5)),smoothstep(.06,.035,-sd)*(cd==2?1.:.75));
 vec3 tc=cd==2||m==1?vec3(.72,.58,.3):vec3(.3,.2,.13);
 vec2 wa=m==0?vec2(.19,.15):m==1?vec2(.13,.25):vec2(ci.x>3.5?3.6:.4,.25);vec2 wb=m==0?vec2(2.31,3.6):m==1?vec2(4.12,5.75):wa+3.;
 float shf=m==2?(ci.x>3.5?.012:-.012):0.;
 vec2 lu=(ci-wa)/(wb-wa);bool inW=all(greaterThan(lu,vec2(0.)))&&all(lessThan(lu,vec2(1.)));
 if(m==2&&inW&&lu.y<.18){vec2 ea=(lu-vec2(.5,.18))/vec2(.5,.18);inW=dot(ea,ea)<1.;}
 float ty=ci.y-(wb.y+(cs.y-wb.y)*(m==2?.5:.38));float tw=m==1?.075:m==0?.05:.035;
 if(abs(ty)<tw&&abs(ci.x-hd.x)<(m==2?.8:cs.x*.3)){float gc=floor(ci.x*(m==1?11.:15.));card=mix(card,tc,step(.3,hash(vec2(gc,float(cd)+7.)))*step(.18,fract(ci.x*(m==1?11.:15.)))*smoothstep(tw,tw*.6,abs(ty)));}
 if(m!=2&&abs(ty-tw*2.6)<tw*.45&&abs(ci.x-hd.x)<cs.x*.18)card=mix(card,tc,.8*step(.4,hash(vec2(floor(ci.x*22.),3.))));
 if(sd<0.)o=card;
 if(inW&&sd<0.){float wa_=(wb.x-wa.x)/(wb.y-wa.y);vec2 iu=lu;if(wa_>A)iu.y=.5+(lu.y-.5)*A/wa_;else iu.x=.5+(lu.x-.5)*wa_/A;
  vec3 pc=O(vec2(clamp(iu.x+shf,0.,1.),1.-iu.y)).rgb;
  if(u_p3>.5){float l=luma(pc);pc=Q33T(l,vec3(.2,.08,.12),vec3(.56,.4,.33),vec3(.94,.88,.72));
   vec2 ed=min(lu,1.-lu);pc=mix(pc,pc*vec3(1.,.93,.75)+.04,wr*smoothstep(.12,0.,min(ed.x,ed.y)));}
  o=pc*(1.-.08*wr*fbm(p*.03));}
 return vec4(clamp(o,0.,1.),1.);`,
  'look approximation of the 19th-century card formats (dimensions from collector / museum guides): carte de visite card about 2.5 x 4 in with a 2.1 x 3.5 in albumen print and studio imprint below; cabinet card 4.25 x 6.5 in with large imprint margin and gilt edge; stereograph 7 x 3.5 in with two arched-top prints (the right/left views are a small crop shift of the same image, not real parallax). Image is cover-fitted into the print window; Wear adds soiling, foxing and chipped edges');
