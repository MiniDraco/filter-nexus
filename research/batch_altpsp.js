/* ================= altpsp: darkroom & alternative photographic processes (round 10) ================= */
const ALTPSP_VR = '(u_p1*(u_p0<.5?7.:u_p0<1.5?6.:u_p0<2.5?4.:3.)+.4)';
const ALTPSP_GRAIN = (gs, ga) => `{float gz_=max(${gs},.3);float gn_=(vnoise(p/gz_)-.5)*.7+(hash(floor(p/gz_))-.5)*.3;float lo_=luma(o);o+=gn_*(${ga})*.3*(.25+3.*lo_*(1.-lo_));}`;
f = add('Film');
f('altprocess2','Alternative Process II (albumen, ambrotype, carbon, iron & gold prints, toners)',[S('Process',['Albumen print','Ambrotype','Carbon print','Kallitype','Chrysotype','Ziatype','Anthotype','Gold toning','Copper toning']),P('Exposure',-1,1,0,.01),P('Contrast',.5,2,1,.01),P('Paper / coating edge',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;
 float l=m==1?dot(x,vec3(.06,.3,.64)):luma(x);
 l=clamp((l-.5)*u_p2+.5+u_p1*.4,0.,1.);
 vec2 p=PX(uv);float tx=(fbm(p*.05)-.5)*.6+(hash(floor(p))-.5)*.35;
 vec2 q=(uv-.5)*vec2(asp(),1.);float vg=length(q);float ap=u_p3;
 vec3 s=vec3(.1),md=vec3(.5),h=vec3(.95);
 if(m==0){l=mix(l,l*.75+.25,smoothstep(.35,.85,vg)*ap);l=pow(l,1.1);s=vec3(.2,.08,.12);md=vec3(.56,.4,.33);h=mix(vec3(.94,.88,.72),vec3(.9,.79,.56),smoothstep(.3,.8,vg)*ap);}
 else if(m==1){l=smoothstep(.04,.96,l);s=vec3(.03,.03,.035);md=vec3(.38,.37,.34);h=vec3(.82,.8,.72);}
 else if(m==2){l=l<.3?pow(l/.3,1.35)*.3:l;s=vec3(.05,.035,.03);md=vec3(.4,.31,.25);h=vec3(.96,.94,.9);}
 else if(m==3){l=pow(l,.92);s=vec3(.13,.08,.05);md=vec3(.5,.37,.26);h=vec3(.95,.91,.83);}
 else if(m==4){s=vec3(.24,.1,.3);md=vec3(.62,.43,.62);h=vec3(.97,.95,.94);}
 else if(m==5){l=1.-pow(1.-l,1.25);s=vec3(.16,.12,.09);md=vec3(.55,.48,.41);h=vec3(.95,.93,.88);}
 else if(m==7){s=vec3(.05,.06,.1);md=vec3(.42,.45,.52);h=vec3(.95,.95,.96);}
 else if(m==8){l=pow(l,.9);s=vec3(.24,.08,.05);md=vec3(.74,.44,.35);h=vec3(.97,.91,.87);}
 vec3 o=l<.5?mix(s,md,l*2.):mix(md,h,(l-.5)*2.);
 vec3 paper=min(h*1.01+.01,vec3(1.));
 if(m==6){vec3 dye=vec3(.6,.16,.3);paper=vec3(.96,.93,.88);float dn=pow(1.-l,1.3)*.75*(1.+(fbm(p*.01)-.5)*.6*ap);o=mix(paper,dye,clamp(dn,0.,1.));}
 o*=1.+tx*ap*(m==2||m==1?.08:.22);
 if(m==2){vec2 g=vec2(luma(O(uv+vec2(u_px.x,0.)).rgb)-luma(O(uv-vec2(u_px.x,0.)).rgb),luma(O(uv+vec2(0.,u_px.y)).rgb)-luma(O(uv-vec2(0.,u_px.y)).rgb));o*=1.+(g.x-g.y)*.6*(1.-l);}
 if(m==1){o*=1.+(vnoise(p*vec2(.006,.03))-.5)*.2*ap;float e=length((uv-.5)/vec2(.5,.5));
  o=mix(o,o*.7+hsv2rgb(vec3(fract(e*2.5+.55),.55,.35))*.4,smoothstep(.8,.99,e)*ap*.7);
  vec3 brass=vec3(.55,.43,.22)*(.75+.5*fbm(p*.08));o=mix(o,brass,smoothstep(.99,1.01,e)*min(ap*3.,1.));}
 if(m>=3&&m<=6&&ap>0.){vec2 ed=min(uv,1.-uv)*vec2(asp(),1.);float d=min(ed.x,ed.y);
  float st=ed.x<ed.y?vnoise(p*vec2(.25,.008)):vnoise(p*vec2(.008,.25));
  float j=(fbm(p*.02)-.5)*.07+(st-.5)*.05;float dd=d-(.02+.05*ap)+j;
  o=mix(paper,o,smoothstep(0.,.015,dd));o=mix(o,paper,(1.-smoothstep(0.,.035,dd))*smoothstep(.45,.8,1.-st)*.35);}
 return vec4(clamp(o,0.,1.),1.);`,
  'tone-mapped print looks (approx., not measured): albumen = purple-brown gold-toned image, yellowed highlights fading toward the edges; ambrotype = blue-sensitive collodion positive on black backing, creamy silver highlights, tarnish ring + brass oval mat; carbon = pigment print, deep long-toe blacks + slight relief; kallitype = iron-silver brown-black; chrysotype = gold-salt rose-violet; Ziatype = printing-out palladium (self-masking shoulder), warm brown; anthotype = plant dye (beet) bleached where light passes, faint & uneven; gold toning = blue-black on neutral silver; copper toning = red-brown / salmon; hand-coated brushed edges for the iron & plant processes', 1);

f('darkroomfx','Darkroom Effects (Sabattier, bromoil, mordancage, photogram, transfer)',[S('Process',['Sabattier effect (Mackie lines)','Bromoil','Mordancage','Photogram','Polaroid image transfer']),P('Strength (re-exposure / ink / bleach / exposure / fade)',0,1,.7,.01),P('Radius (line width / brush / penumbra / softness)',1,24,4,.5,'px'),P('Detail (lines / stipple / veils / sharpness / texture)',0,1,.6,.01)],
  [`return vec4(vec3(luma(c.rgb)),1.);`, BH('u_p2'), BV('u_p2'), `
 int m=int(u_p0+.5);vec3 o0=O(uv).rgb;float l=luma(o0),bl=T(uv).r;vec2 p=PX(uv);float k=u_p1,dt=u_p3;vec3 o;
 if(m==0){float kk=.35+.65*k;float v=l*(1.-kk*l);v/=kk>.5?1./(4.*kk):1.-kk;
  float e=l-bl;v+=max(e,0.)*dt*7.*kk;v-=max(-e,0.)*dt*3.5*kk;o=vec3(clamp(v,0.,1.))*vec3(1.,.98,.95);}
 else if(m==1){float b=mix(l,bl,.55);float n=vnoise(p/max(u_p2*.8,1.))*.6+vnoise(p/max(u_p2*.3,.6))*.4;
  float ink=clamp((1.-b)*(.55+k*.6)-.04,0.,1.);ink=pow(ink,1.2);float cv=smoothstep(n-.4,n+.4,ink);
  vec3 paper=vec3(.93,.89,.8)*(1.+(fbm(p*.2)-.5)*.08);o=mix(paper,vec3(.12,.09,.07),mix(ink,cv,dt*.65));}
 else if(m==2){float sh=smoothstep(.42,.1,bl)*k;vec2 w=vec2(fbm(p*.012),fbm(p*.012+7.3))-.5;
  float l2=luma(O(uv+w*u_px*R(40.)*sh).rgb);vec3 pr=mix(vec3(.1,.07,.05),vec3(.95,.91,.82),l2);
  float vn=fbm(p*.018+w*3.);float veil=1.-smoothstep(0.,.02+.025*dt,abs(vn-.5));
  vec3 lift=mix(vec3(.86,.74,.52),vec3(.68,.53,.34),fbm(p*.05));
  o=mix(pr,lift,sh*.85);o=mix(o,vec3(.08,.05,.03),veil*smoothstep(.05,.3,sh)*dt*.9);}
 else if(m==3){float tr=mix(bl,l,.2+.8*dt);float E=.5+2.5*k;float v=exp(-E*pow(tr,1.4)*2.6);
  o=mix(vec3(.03,.03,.035),vec3(.95,.94,.91),v);}
 else{vec2 o1=u_px*R(max(u_p2*.6,.5));vec3 cc=(O(uv+o1)+O(uv-o1)+O(uv+vec2(o1.x,-o1.y))+O(uv-vec2(o1.x,-o1.y))).rgb*.25;cc=mix(o0,cc,.7);
  cc=mix(vec3(luma(cc)),cc,1.-.35*k);cc=.1+.78*cc;cc*=mix(vec3(1.),vec3(1.03,.92,1.06),k);
  vec3 paper=vec3(.95,.94,.9)*(1.+(fbm(p*.3)-.5)*.12*dt);cc*=1.-(fbm(p*.35)-.5)*.3*dt;
  float miss=smoothstep(.6,.78,fbm(p*.025+3.)+(fbm(p*.12)-.5)*.12)*dt;
  vec2 ed=min(uv,1.-uv)*vec2(asp(),1.);float d=min(ed.x,ed.y)-.055+(fbm(p*.05)-.5)*.05+(vnoise(p*.4)-.5)*.012;
  float cv=smoothstep(0.,.006,d)*(1.-miss)*(.65+.35*smoothstep(0.,.05,d));o=mix(paper,cc*paper,cv);}
 return vec4(clamp(o,0.,1.),1.);`],
  'Sabattier: print re-exposed mid-development, fog density grows with the still-undeveloped silver (curve l(1-kl), normalised), Mackie lines = developer-exhaustion edge effect, light line on the thin side and a dark one on the dense side (difference from a blurred copy); bromoil = bleached relief print inked with a stippling brush (ink taken up in proportion to shadow density, noise-thresholded dabs); mordancage = shadows bleached & lifted, gelatin veils drift as dark threads; photogram = paper exposed through the image as a mask (density 1 - exp(-E t), penumbra from blur); Polaroid image transfer = softened, faded, magenta-shifted dyes on watercolour paper with missing patches and a ragged border; approx.', 1);

f('labprocess','Lab Processing (ENR, CCE, push, expired, ARRI K1S1)',[S('Process',['ENR (silver retention)','CCE (color contrast enhancement)','Push processing','Expired film','ARRI K1S1 look']),P('Amount (silver / stops / age / mix)',0,1,.6,.01),P('Grain',0,1,.25,.01),P('Exposure',-1,1,0,.01)],
  `int m=int(u_p0+.5);float a=u_p1;vec3 x=${LIN('c.rgb')}*exp2(u_p3);vec2 p=PX(uv);float ga=u_p2,gs=1.;vec3 o;
 vec3 W=vec3(.2126,.7152,.0722);float Y=max(dot(x,W),1e-4);
 if(m<=1){float w=m==0?1.:smoothstep(.45,.02,Y);float kk=a*(m==0?.75:1.3)*w;vec3 y=x*pow(Y,kk)*(1.+.35*kk);
  y=mix(vec3(dot(y,W)),y,1.-a*(m==0?.45:.3)*(m==0?1.:.4+.6*w));o=${SRGB('clamp(y,0.,1.)')};if(m==1)ga*=1.3;}
 else if(m==2){float N=a*3.;vec3 y=.18*pow(max(x,1e-5)/.18,vec3(1.+.22*N));y*=smoothstep(0.,.012*N+1e-4,Y);
  y*=mix(vec3(1.),mix(vec3(.96,1.,1.05),vec3(1.04,1.,.95),smoothstep(.02,.5,Y)),N/3.);y=mix(vec3(dot(y,W)),y,1.+.08*N);
  o=${SRGB('clamp(y,0.,1.)')};ga*=1.+.6*N;gs=1.+.35*N;}
 else if(m==3){vec3 castc=hsv2rgb(vec3(hash(vec2(7.1,3.3)),.6,1.));
  float fog=a*(.05+.07*fbm(p*.003))+a*.08*smoothstep(.3,.8,length((uv-.5)*vec2(asp(),1.)));
  vec3 y=x*(1.-.35*a)+fog*castc;y*=mix(vec3(1.),castc*.35+.75,a*.6);y=mix(vec3(dot(y,W)),y,1.-.35*a);
  o=${SRGB('clamp(y,0.,1.)')};ga*=1.+a;gs=1.+.6*a;}
 else{vec3 t=log2(max(x,1e-5)/.18)*.6;vec3 v=1./(1.+exp(-1.65*t));float vy=1./(1.+exp(-1.65*log2(Y/.18)*.6));
  v=mix(v,x*vy/Y,.5);v=mix(vec3(luma(v)),v,1.-.35*smoothstep(.6,1.,luma(v)));v*=vec3(1.01,1.,.975);
  o=mix(${SRGB('clamp(x,0.,1.)')},v,a);}
 ${ALTPSP_GRAIN('gs', 'ga')}
 return vec4(clamp(o,0.,1.),1.);`,
  'ENR / CCE: silver kept in the release print adds neutral density in proportion to the print density (out = lin x Y^k; CCE weights it to the dense shadows) -> deeper blacks, lower saturation; push: underexposure + longer development = log-gamma up (1 + .22 per stop) around mid grey, crushed toe, warm/cool crossover, more grain; expired: base fog with a seed-dependent layer castc, contrast and saturation loss, edge fog; ARRI K1S1: Alexa default display look approximated by a log-domain sigmoid with hue-preserving mix, highlight desaturation and slight warmth; all approx.', 1);

f('vintagecamera','Vintage Camera (pinhole, Holga, box camera, Super 8)',[S('Camera',['Pinhole camera','Toy camera (Holga)','Box camera','Super 8']),P('Softness',0,1,.5,.01),P('Vignette',0,1,.6,.01),P('Grain / light leaks',0,1,.4,.01)],
  [BH(ALTPSP_VR), BV(ALTPSP_VR), `
 int m=int(u_p0+.5);vec2 q=(uv-.5)*vec2(asp(),1.);float rn=length(q)/length(vec2(asp(),1.)*.5);
 vec2 p=PX(uv);vec3 sh=O(uv).rgb,bl=T(uv).rgb,o;float vgA=u_p2,ga=u_p3,gsz=1.;
 if(m==0){o=mix(sh,bl,.85);float c4=pow(cos(atan(rn*1.3)),4.);o*=mix(1.,c4,vgA);o=mix(o,o*o*(3.-2.*o),.3);o+=max(bl-.7,0.)*.6*u_p1;}
 else if(m==1){float sf=smoothstep(.15,.85,rn);vec2 ca=q*.012*(.3+u_p1)/vec2(asp(),1.);
  vec3 blc=vec3(T(uv+ca).r,bl.g,T(uv-ca).b);o=mix(sh,blc,sf);o=mix(vec3(luma(o)),o,1.25);o=(o-.5)*1.18+.5;
  o*=1.-vgA*.9*smoothstep(.25,1.1,rn*rn*1.1);
  float lx=hash(vec2(1.7,2.9)),side=hash(vec2(4.1,.3));float e=side<.5?uv.x:1.-uv.x;
  float leak=exp(-e*7.)*smoothstep(.25,.75,fbm(vec2(uv.y*3.+lx*10.,lx*7.)))*ga*1.5;o+=leak*vec3(1.,.42,.12);}
 else if(m==2){vec2 qd=q*(1.-.06*(.3+u_p1)*dot(q,q));vec2 u2=qd/vec2(asp(),1.)+.5;vec3 s2=O(u2).rgb,b2=T(u2).rgb;
  vec3 cc=mix(s2,b2,clamp(smoothstep(.1,.8,rn)*.9+.15*u_p1,0.,1.));float l=dot(cc,vec3(.25,.6,.15));l=smoothstep(-.05,1.05,l);
  l*=1.-vgA*.7*smoothstep(.2,1.,rn);o=mix(vec3(.08,.07,.06),vec3(.93,.89,.8),l);}
 else{vec2 wv=(vec2(hash(vec2(2.,5.)),hash(vec2(9.,1.)))-.5)*u_px*R(3.);vec3 s2=O(uv+wv).rgb,b2=T(uv+wv).rgb;o=mix(s2,b2,.7);
  o=pow(max(o,0.),vec3(1.05,1.,.95));o=mix(vec3(luma(o)),o,1.2);o*=vec3(1.05,1.,.88);o=(o-.5)*1.12+.5;
  o*=1.+(hash(vec2(3.,3.))-.5)*.12;o+=max(b2-.75,0.)*vec3(.6,.2,.05);o*=1.-vgA*.8*smoothstep(.35,1.,rn);
  vec2 g=abs(uv-.5)*2.;vec2 cr=max(g-vec2(1.-.08/asp(),.92),0.)/vec2(.08/asp(),.08);o*=1.-smoothstep(.9,1.05,length(cr))*max(vgA,.5);
  ga*=1.6;gsz=1.6;}
 ${ALTPSP_GRAIN('gsz', 'ga*.8')}
 return vec4(clamp(o,0.,1.),1.);`],
  'pinhole: diffraction-soft everywhere, infinite depth of field, wide-angle cos^4 falloff, glowing highlights of a long exposure; Holga: plastic lens sharp centre / soft, colour-fringed corners, heavy vignette, saturated, seeded red-orange light leak from one film edge; box camera: meniscus lens with barrel distortion and curved-field edge softness on warm-toned B&W; Super 8: small gate = soft + coarse grain, warm Kodachrome-like colour, halation, frame weave & flicker (seeded), rounded gate corners; approx.', 1);

f('filmdusthair','Film Dust & Hair Overlay',[P('Dust',0,1,.5,.01),P('Hairs & fibres',0,1,.5,.01),P('Size',.5,3,1,.05),S('Polarity',['White (dirty negative printed)','Black (dirt on print / scanner)'])],
  `vec2 p=PX(uv);float sz=u_p2;float mk=0.;
 float cs=22.*sz;vec2 ci=floor(p/cs);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));if(hash(cc+.31)>u_p0*.55)continue;
  vec2 ctr=(cc+hash2(cc+1.7))*cs;float rad=sz*(.6+2.6*pow(hash(cc+5.3),3.));vec2 d=p-ctr;float an=atan(d.y,d.x);
  float rr=rad*(1.+.35*sin(an*3.+hash(cc)*6.28)+.2*sin(an*5.+hash(cc+2.)*6.28));mk=max(mk,1.-smoothstep(rr-.6,rr+.6,length(d)));}
 vec2 fc=p/(3.*sz);if(hash(floor(fc)+9.1)<u_p0*.012)mk=max(mk,.75*(1.-smoothstep(.3,.9,length(fract(fc)-.5)*2.)));
 float hs=150.*sz;vec2 hi=floor(p/hs);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=hi+vec2(float(i),float(j));if(hash(cc+.77)>u_p1*.8)continue;
  vec2 a0=(cc+hash2(cc+3.3))*hs;float an=hash(cc+8.1)*6.2832;float len=hs*(.3+.65*hash(cc+4.4));
  vec2 dir=vec2(cos(an),sin(an));vec2 nr=vec2(-dir.y,dir.x);float bend=(hash(cc+6.6)-.5)*.8;float wig=(hash(cc+1.1)-.5)*.2;
  float w=sz*(.45+.6*hash(cc+2.2));vec2 prev=a0;float dm=1e9;
  for(int k=1;k<=14;k++){float t=float(k)/14.;vec2 pt=a0+dir*len*t+nr*len*(bend*t*(1.-t)*2.+wig*sin(t*9.+an));
   vec2 pa=p-prev,ba=pt-prev;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);dm=min(dm,length(pa-ba*hh));prev=pt;}
  mk=max(mk,1.-smoothstep(w-.5,w+.6,dm));}
 vec3 o=c.rgb;o=u_p3<.5?mix(o,vec3(.97),mk*.95):mix(o,vec3(.04,.035,.03),mk*.92);return vec4(o,1.);`,
  'procedural dirt layer: irregular dust specks (one candidate per 22 px cell, lobed outline), fine specks, and hairs / fibres as wiggly bent polylines (one candidate per 150 px cell); white = dirt on the negative printed through, black = dirt on the print or scanner glass; seeded', 1);
