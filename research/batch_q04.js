/* ================= q04: Filter Forge library "Photo" looks (toy cameras, old processes, lo-fi looks, cine looks, glows, tone tools, colour-theory hue snapping, light overlays) ================= */
/* shared geometry: q = centred uv, rr = 0 centre .. 1 corner, ef = squarish frame distance (1 = image edge) */
const Q04_GEOM = `vec2 q=uv-.5;vec2 qa=q*vec2(asp(),1.);float rr=length(qa)/length(vec2(asp(),1.)*.5);
 float ef=pow(pow(abs(q.x*2.),6.)+pow(abs(q.y*2.),6.),1./6.);
 float gr=(hash(floor(uv*u_res))+hash(floor(uv*u_res*.5)+9.)-1.);`;
/* Sobel magnitude of the ORIGINAL image (works in any pass) -> float e */
const Q04_OSOBEL = `float e;{vec2 p_=u_px*max(u_k,1.);
 float a0=luma(O(uv+vec2(-p_.x,p_.y)).rgb),a1=luma(O(uv+vec2(0.,p_.y)).rgb),a2=luma(O(uv+p_).rgb),a3=luma(O(uv+vec2(p_.x,0.)).rgb),
 a4=luma(O(uv+vec2(p_.x,-p_.y)).rgb),a5=luma(O(uv-vec2(0.,p_.y)).rgb),a6=luma(O(uv-p_).rgb),a7=luma(O(uv-vec2(p_.x,0.)).rgb);
 e=length(vec2((a2+2.*a3+a4)-(a0+2.*a7+a6),(a0+2.*a1+a2)-(a6+2.*a5+a4)));}`;

f = add('Film');
f('q04_toycam','Toy Camera Looks (Toycam-82 / Toycam-68 / Random Retro / Retro Hipster / Light Pollution)',
  [S('Look',['Toycam-82 (colour 70s-80s)','Toycam-68 (B&W supergrain)','Random Retro Camera (seeded)','Retro Hipster Analog','Light Pollution (streaks)']),
   P('Amount',0,1,.75,.01),P('Grain',0,1,.35,.01),P('Light leaks / streaks',0,1,.5,.01)],
  [BH('4.'), BV('4.'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,G=u_p2,V=u_p3;
 float s1=hash1(1.),s2=hash1(2.),s3=hash1(3.),s4=hash1(4.);
 vec3 o0=O(uv).rgb;
 float caK=(m==3?.014:m==0?.007:m==4?.005:.002)*A;vec2 cd=q*caK;
 vec3 cq=vec3(O(uv+cd).r,o0.g,O(uv-cd).b);vec3 bl=T(uv).rgb;
 cq=mix(cq,bl,clamp(.2+rr*rr,0.,1.)*A*(m==1?.45:.75));
 cq=screen(cq,bl*bl*.22*A);
 if(m==0){cq=pow(cq,vec3(.9,.95,1.12));cq=vec3(smoothstep(-.05,1.,cq.r),cq.g,cq.b*.84+.07);
  cq=mix(vec3(luma(cq)),cq,1.12);cq=cq*vec3(1.06,1.,.86)+vec3(.05,.04,0.);}
 else if(m==1){float g=luma(cq);g=smoothstep(.03,.97,g);g=mix(g,g*g*(3.-2.*g),.6);cq=vec3(g)*vec3(1.02,1.,.97);}
 else if(m==2){vec3 tn=hsv2rgb(vec3(s1,.2+.25*s2,1.));cq=cq*mix(vec3(1.),tn/max(luma(tn),.05),.55);
  cq=pow(max(cq,0.),vec3(1.)+(vec3(s2,s3,s4)-.5)*.5);cq=mix(vec3(luma(cq)),cq,.75+.45*s3);
  float fd=.05+.14*s2;cq=cq*(1.-fd)+fd*vec3(1.,.96,.94);}
 else if(m==3){float wv=fbm(qa*2.2+s1*10.);vec3 wc=hsv2rgb(vec3(fract(s2+wv*.7),.65,1.));
  cq=screen(cq,wc*.75*A*smoothstep(.3,.75,wv));cq=vec3(cq.r,cq.g,cq.b*.82+.1);
  cq=min(cq*1.12,1.);cq=cq*.84+vec3(.1,.07,.13);}
 else{cq=mix(vec3(luma(cq)),cq,.72);cq=cq*vec3(.95,.97,1.05)+vec3(.03,.03,.06);
  float an=s1*PI;vec2 dn=vec2(cos(an),sin(an));
  float tt=dot(qa,dn)+(fbm(qa*3.+s2*9.)-.5)*.45;
  float st=exp(-pow((tt-(s3-.5)*.5)/.06,2.))+.6*exp(-pow((tt-(s4-.5)*.8)/.03,2.))+.35*exp(-pow((tt-(s1-.5)*.7)/.12,2.));
  vec3 scl=hsv2rgb(vec3(fract(.97+.12*s2),.65,1.));cq=screen(cq,scl*st*V*.85);
  cq=mix(cq,vec3(.95,.92,.85),step(.9965,hash(floor(uv*u_res*.5)+3.))*G);}
 if(m<=2){vec2 lp=vec2(s3>.5?1.08:-.08,.15+.7*s4);float dl=length((uv-lp)*vec2(asp(),1.));
  vec3 lc=m==1?vec3(1.):m==0?hsv2rgb(vec3(.01+.08*s2,.85,1.)):hsv2rgb(vec3(fract(s1+.5),.7,1.));
  cq=screen(cq,lc*exp(-dl*dl/.09)*V*.9);
  float ln=step(.996,hash(vec2(floor(PX(uv).x/1.5),3.)))*vnoise(vec2(PX(uv).x*.05,uv.y*5.));
  cq+=ln*.28*V*(m==2?0.:1.);}
 float l0=luma(cq);
 cq+=gr*G*(m==1?.24:.13)*(.35+2.6*l0*(1.-l0));
 cq*=1.-A*(m==1?.7:m==3?.35:.5)*smoothstep(.3,1.2,rr);
 float fe=ef+(fbm(uv*9.+s1*7.)-.5)*.07;
 cq=mix(cq,vec3(.03),smoothstep(.91,1.01,fe)*A*(m<=1?.9:m==2?.9*step(.5,s4):0.));
 return vec4(mix(o0,clamp(cq,0.,1.),smoothstep(0.,.3,A)),1.);`],
  'Filter Forge library looks (truman / others, approx.): radial chroma aberration + soft-focus edges + halation glow, per-look toning (Toycam-82 warm nonlinear curves, Toycam-68 contrasty B&W with midtone "supergrain", Random Retro = seed-picked tint/curves/fade, Retro Hipster = coloured fbm washes + blown highlights + washed shadows, Light Pollution = desaturated cool + warped seeded light streaks + film specks), seeded edge light leak, film streaks, vignette, irregular dark frame', true);

f('q04_oldprocess','Old Process Looks (Caffenol / Kings of Sepia / Pure Silver B&W / Low-Fi Daguerreotype / Victorian / Memory / Washed-out Vintage)',
  [S('Look',['Caffenol (coffee developer)','Kings of Sepia (tritone)','Pure Silver B&W','Extremely Low-Fi (daguerreotype)','Vintage Victorian (halo)','Vintage Memory (faded B&W)','Washed-out Vintage (worn print)']),
   P('Amount',0,1,1,.01),P('Grain / wear',0,1,.4,.01),P('Vignette / halo',0,1,.55,.01)],
  [BH('2.5'), BV('2.5'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,G=u_p2,V=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o),lb=luma(b);vec3 cq;
 if(m==0){float g=dot(o,vec3(.45,.35,.2)),gb=dot(b,vec3(.45,.35,.2));g=g+(g-gb)*3.;
  g=clamp((g-.08)/.84,0.,1.);g=pow(g,1.1);float bt=fbm(PX(uv)/40.+hash1(5.)*20.);
  g=mix(g,g*(.75+.5*bt),.6*G);g+=gr*.1*G;
  cq=stops5(vec3(.12,.03,.02),vec3(.4,.13,.08),vec3(.68,.38,.3),vec3(.88,.7,.62),vec3(1.,.95,.9),g);
  cq*=1.-.85*V*smoothstep(.3,1.2,rr);}
 else if(m==1){float g=smoothstep(.02,.98,l);g=mix(g,g*g*(3.-2.*g),.6);
  cq=stops5(vec3(.04,.02,.01),vec3(.3,.15,.05),vec3(.66,.44,.18),vec3(.9,.75,.45),vec3(1.,.97,.85),g);
  cq=mix(cq,cq*o/max(l,.03),.12);cq+=gr*.05*G;cq*=1.-.6*V*smoothstep(.35,1.2,rr);}
 else if(m==2){float g=mix(min(o.r,min(o.g,o.b)),max(o.r,max(o.g,o.b)),.55);
  float g2=mix(min(b.r,min(b.g,b.b)),max(b.r,max(b.g,b.b)),.55);g+=(g-g2)*1.2;g=smoothstep(.05,.95,g);
  g+=gr*.05*G;cq=vec3(g)*(1.-.35*V*smoothstep(.4,1.2,rr));}
 else if(m==3){float g=luma(mix(o,b,.6));float fg=fbm(PX(uv)/150.+hash1(6.)*13.);
  g=g*.85+.15*fg;g=smoothstep(.12,.85,g);
  vec2 sp=PX(uv)/26.;vec2 ci=floor(sp);vec2 fq=fract(sp)-.5-(hash2(ci)-.5)*.5;float sz=.06+.18*hash(ci+3.);
  float spot=step(.86,hash(ci+7.))*smoothstep(sz,sz*.4,length(fq)*(1.+.4*vnoise(PX(uv)/3.)));
  g=mix(g,step(.5,hash(ci+11.)),spot*G);
  for(int k=0;k<3;k++){float fk=float(k);float a=(hash1(20.+fk)-.5)*.6+fk*1.05;vec2 dn=vec2(cos(a),sin(a));
   float d=dot(PX(uv),dn);float ln=step(.9975,hash(vec2(floor(d/1.3),fk+30.)))*step(.45,vnoise(vec2(dot(PX(uv),vec2(-dn.y,dn.x))/50.,floor(d/1.3))));
   g=mix(g,.95,ln*G*.85);}
  float vv=smoothstep(.35,1.1,rr+(fbm(uv*5.+hash1(7.)*9.)-.5)*.35);g*=1.-vv*V*.85;
  g+=gr*.14*G;cq=max(vec3(g),0.)*vec3(1.,.99,.95);}
 else if(m==4){float h=smoothstep(.25,1.,rr);float g=luma(mix(o,b,.5+.5*h));g=mix(.5,g,.75)+.03;
  g=mix(g,1.,h*V*.9);g+=gr*.16*G;cq=vec3(g)*vec3(1.,.98,.94)+vec3(gr*.03*G,0.,-gr*.03*G);}
 else if(m==5){float g=l;g=.08+.84*mix(g,g*g*(3.-2.*g),.5);cq=vec3(g)*vec3(1.02,1.,.96)+gr*.06*G;
  cq*=1.-.4*V*smoothstep(.35,1.2,rr);}
 else{vec3 pp=vec3(.98,.91,.76);vec3 cc=mix(vec3(lb),b,.65);cc=mix(cc,floor(cc*6.+.5)/6.,.35);
  cc=1.-(1.-cc)*.65;cc=cc*.6*pp+.4*pp;${Q04_OSOBEL}
  cc=mix(cc,vec3(.36,.26,.18),clamp(e*2.,0.,.6));
  float w=fbm(PX(uv)/30.+hash1(8.)*11.);cc=mix(cc,pp,smoothstep(.5,.75,w)*G*.8);
  float st=smoothstep(.7,1.,ef+(fbm(uv*7.+hash1(9.)*5.)-.5)*.35);cc=mix(cc,cc*vec3(.62,.5,.38),st*V);cq=cc;}
 return vec4(mix(o,clamp(cq,0.,1.),A),1.);`],
  'Filter Forge library looks (approx.): Caffenol = red-grey channel mix + strong unsharp + blotchy noise + reddish-brown duotone + vignette; Kings of Sepia = 5-stop tritone with 12% original colour; Pure Silver = min/max channel blend B&W with local contrast; Extremely Low-Fi = blurred fogged daguerreotype with threshold contrast, seeded spots, 3-angle scratches, irregular vignette; Victorian = soft low-contrast grain with white halo at the edges; Vintage Memory = faded warm B&W; Washed-out Vintage = cream-paper faded posterised print with dark brown outlines, worn patches and stained edges', true);

f = add('Insta');
f('q04_lofilooks','Lo-Fi Colour Looks (Insta-Hips / Glo-Fi Rainout / Developed with Luv / Creamy Colors / Summer Heat)',
  [S('Look',['Insta-Hips (matte split tone)','Glo-Fi Rainout (per-channel lo-fi)','Developed with Luv (rich)','Creamy Colors (pastel hue)','Summer Heat (warm glow)']),
   P('Amount',0,1,.85,.01),P('Hue shift',-180,180,0,1,'deg'),P('Fade / glow',0,1,.45,.01)],
  [BH('12.'), BV('12.'), `
 int m=int(u_p0+.5);float A=u_p1,H=u_p2,F=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o);vec3 cq=o;
 if(m==0){vec3 sc=hsv2rgb(vec3(fract((205.+H)/360.),.6,1.)),hc=hsv2rgb(vec3(fract((30.+H)/360.),.5,1.));
  cq=mix(vec3(l),o,.72);cq=(cq-.5)*1.1+.5;float ws=(1.-l)*(1.-l),wh=l*l;
  cq+=(sc-luma(sc))*ws*.3+(hc-luma(hc))*wh*.22;cq=F*.17+cq*(1.-F*.17-.06);}
 else if(m==1){vec3 bp=vec3(.05,.0,.1),wp=vec3(.9,.96,.84);cq=clamp((o-bp)/(wp-bp),0.,1.);
  cq=pow(cq,vec3(.85,1.05,1.2));cq=mix(cq,cq*cq*(3.-2.*cq),vec3(.8,.55,-.3));
  cq.b=mix(cq.b,smoothstep(.3,.7,cq.b)*.7+.15,F*.6);cq=cssHue(clamp(cq,0.,1.),H);}
 else if(m==2){cq=mix(o,o*o*(3.-2.*o),.5);float s=max(cq.r,max(cq.g,cq.b))-min(cq.r,min(cq.g,cq.b));
  cq=mix(vec3(luma(cq)),cq,1.+.35*(1.-s));cq*=vec3(1.03,1.,.95);cq=max(cq-.025,0.)*1.04;
  cq=cq*(1.-.08*F)+.08*F*vec3(.95,.9,1.);cq=cssHue(clamp(cq,0.,1.),H);}
 else if(m==3){cq=cssHue(o,180.+H);cq=pow(cq,vec3(.85));cq=mix(vec3(luma(cq)),cq,.8);
  cq=mix(cq,vec3(1.,.97,.93),.15+.2*F);cq+=vec3(.02,0.,.04)*(1.-luma(cq));}
 else{vec3 d=o+(o-b)*.6;cq=mix(vec3(luma(d)),d,1.45);cq=(cq-.5)*1.12+.5;
  cq=cq*vec3(1.06,1.02,.8)+vec3(.04,.02,0.);vec3 g=max(b-.4,0.)*1.7;cq=screen(clamp(cq,0.,1.),g*vec3(1.,.82,.35)*F*1.2);
  cq=cssHue(clamp(cq,0.,1.),H);}
 return vec4(mix(o,clamp(cq,0.,1.),A),1.);`],
  'Filter Forge library looks (approx.): Insta-Hips = matte (raised black / lowered white) + shadow/highlight colour toning; Glo-Fi Rainout = per-channel black/white point, gamma and contrast with a soft blue-channel threshold (multiband lo-fi); Developed with Luv = S-curve, vibrance, warm, deep blacks; Creamy Colors = 180 deg hue rotation + lighten to pastel cream; Summer Heat = vivid saturation + detail + golden tint + warm highlight glow');

f = add('Stylize');
f('q04_cinelooks','Cinema & Neon Looks (Horror Film / Movie Poster / Because The Night / Paranormal Lighting / SeeStar Rainbow)',
  [S('Look',['Horror Film','Movie Poster (painted)','Because The Night (colour gradient)','Low-Fi Paranormal Lighting (neon)','SeeStar Rainbow (spectrum)']),
   P('Amount',0,1,.9,.01),P('Detail / outlines',0,1,.5,.01),P('Hue shift',-180,180,0,1,'deg')],
  [BH('6.'), BV('6.'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,Dt=u_p2,H=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o),lb=luma(b);${Q04_OSOBEL}vec3 cq=o;
 if(m==0){vec2 ab=q*.012;vec3 cc=vec3(O(uv+ab).r,o.g,O(uv-ab).b);float g=dot(cc,vec3(.1,.6,.3));
  cq=mix(vec3(g),cc,.15)*vec3(.8,1.,.9);cq=clamp((cq-.22)/.58,0.,1.);cq=cq*cq*(3.-2.*cq);
  cq=screen(cq,max(b-.45,0.)*1.8*vec3(.85,1.,.9));cq+=gr*.12*Dt;cq*=1.-.5*smoothstep(.4,1.2,rr);cq=cssHue(clamp(cq,0.,1.),H);}
 else if(m==1){vec3 s=mix(o,b,.3);vec3 hv=rgb2hsv(s);float v=hv.z*5.;v=(floor(v)+smoothstep(.25,.75,fract(v)))/5.;
  cq=hsv2rgb(vec3(hv.x,hv.y*.85,v));cq=cq*vec3(1.05,.97,.78)+vec3(.03,.02,0.);cq=screen(cq,max(b-.7,0.)*1.5);
  cq=mix(cq,vec3(.15,.1,.06),clamp((e-.08)*4.*Dt,0.,.85));cq=cssHue(clamp(cq,0.,1.),H);}
 else if(m==2){float t=clamp(uv.x+(uv.y-.5)*.3,0.,1.);
  vec3 c1=hsv2rgb(vec3(fract((38.+H)/360.),.85,1.)),c2=hsv2rgb(vec3(fract((195.+H)/360.),.85,1.));
  vec3 sr=mix(c1,c2,smoothstep(.2,.8,t));float g=clamp(l+(l-lb)*3.*Dt,0.,1.);
  cq=mix(overlay(vec3(g),sr),o*(1.+.3*(1.-l)),.3*(max(o.r,max(o.g,o.b))-min(o.r,min(o.g,o.b))));
  cq=(cq-.5)*1.15+.5;cq*=1.-clamp(e*2.*Dt,0.,.75);}
 else if(m==3){float hp=l-lb;vec3 bs=pow(o,vec3(.45));bs=mix(vec3(luma(bs)),bs,.55);
  vec3 wv=.5+.5*cos(6.2832*(hp*(5.+10.*Dt)+vec3(0.,.33,.67)+H/360.));
  cq=mix(bs,wv,smoothstep(.03,.16,abs(hp))*.9);cq=mix(cq,cq*vec3(.9,.95,1.08),.4);}
 else{float ph=l*.9+dot(q,vec2(.6,.9))+H/360.;vec3 sp=hsv2rgb(vec3(fract(ph),.55,1.));
  cq=softLight(o,sp);cq=mix(cq,sp*(.3+.85*l),.45);cq=mix(cq,cq+(o-b)*1.5,Dt);}
 return vec4(mix(o,clamp(cq,0.,1.),A),1.);`],
  'Filter Forge library looks (approx.): Horror Film = chromatic aberration, green colour spill, crushed levels, bloom, grain; Movie Poster = smoothed 5-level value posterise, warm drab tint, highlight glow, dark outlines (Drew Struzan-ish); Because The Night = local-contrast grey overlaid with a warm-to-cyan colour gradient, edges darkened; Low-Fi Paranormal Lighting = gamma-lifted pastel base with cosine-wave neon colour mapping of the high-pass; SeeStar Rainbow = luminance+position spectrum blended by soft light', true);

f = add('Blur');
f('q04_glowfx','Glow & Dream Looks (Ethereal / Youthful Glow / Eerie Glow / Mystic Mood Light / Aether Dream / Strange Aura)',
  [S('Look',['Ethereal Photo Effect','Youthful Glow (restore)','Eerie Glow (coloured)','Mystic Mood Light','Aether Dream','Strange Aura (ghost mist)']),
   P('Amount',0,1,.75,.01),P('Radius',2,60,14,1,'px'),P('Hue shift',-180,180,0,1,'deg')],
  [BH('u_p2'), BV('u_p2'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,H=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o),lb=luma(b);vec3 cq=o;
 if(m==0){cq=o+(o-b)*.4;cq=(cq-.5)*1.15+.47;cq=screen(clamp(cq,0.,1.),b*b*1.1);}
 else if(m==1){float lo=1.,hi=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){float v=luma(T((vec2(float(i),float(j))+.5)/12.).rgb);lo=min(lo,v);hi=max(hi,v);}
  vec3 n=(o-lo)/max(hi-lo,.15),nb=(b-lo)/max(hi-lo,.15);
  cq=mix(n,nb,.35*(1.-smoothstep(.02,.1,abs(l-lb))));cq=mix(vec3(luma(cq)),cq,1.15);cq=screen(clamp(cq,0.,1.),nb*nb*.15);}
 else if(m==2){vec3 hc=hsv2rgb(vec3(fract((235.+H)/360.),.75,1.));cq=screen(o,hc*pow(clamp(lb*1.3-.2,0.,1.),1.5)*1.2);cq=mix(cq,cq*cq,.15);}
 else if(m==3){vec3 hc=hsv2rgb(vec3(fract((35.+H)/360.),.55,1.));vec3 sf=mix(o,b,.6);cq=screen(sf,b*b*hc*.9);
  cq=mix(vec3(luma(cq)),cq,.75);cq*=.88+.12*l;cq*=1.-.55*smoothstep(.4,1.2,rr);}
 else if(m==4){float t=smoothstep(.4,.65,lb);vec3 dk=pow(o,vec3(1.6));dk=mix(vec3(luma(dk)),dk,.5)*vec3(.9,.84,.86);
  vec3 lt=screen(o,b)*1.03;cq=mix(dk,lt,t);vec3 nc=hsv2rgb(vec3(fract((280.+H)/360.+l*.8),.5,1.));cq=mix(cq,softLight(clamp(cq,0.,1.),nc),.45);}
 else{vec2 w=(vec2(fbm(PX(uv)/90.+hash1(1.)*30.),fbm(PX(uv)/90.+hash1(2.)*30.+7.))-.5)*R(40.)*u_px;
  vec3 gh=T(uv+w).rgb;float ms=fbm(PX(uv)/140.+hash1(3.)*20.);vec3 hc=hsv2rgb(vec3(fract((190.+H)/360.),.25,1.));
  cq=screen(o*.9,gh*.5);cq=mix(cq,hc*.95,smoothstep(.35,.8,ms)*.3);}
 return vec4(mix(o,clamp(cq,0.,1.),A),1.);`],
  'Filter Forge library looks (approx.): Ethereal = sharpen + contrast + screen of the squared blur (diffuse glow); Youthful Glow = auto levels from a 12x12 grid of the blurred image, airbrush in flat areas, saturation, soft glow; Eerie Glow = colour glow screened from the blurred light areas; Mystic Mood Light = soft warm glow, desaturation, shadowing, dark corners; Aether Dream = light/dark threshold (dark side darkened + desaturated, light side screened with its blur) + luminance-cycled new-colour tint; Strange Aura = fbm-warped blurred ghost copy + coloured mist', true);

f = add('Tone');
f('q04_tonetools','Photo Tone Tools (Bigger Hammer / Midtone Enhancer / Detail Multiplier / Betterizer / Luminosity Contrast / Photon Chamber / Sharpen Landscape)',
  [S('Tool',["Dan Margulis' Bigger Hammer",'Midtone Enhancer','Detail Multiplier','Betterizer (one slider)','Luminosity Contrast (L curve)','The Photon Chamber','Sharpen Landscape']),
   P('Amount',0,1,.6,.01),P('Radius',1,80,20,1,'px'),P('Bias / gamma / exposure',-1,1,0,.01)],
  [BH('u_p2'), BV('u_p2'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,Pb=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o),lb=luma(b);vec3 cq=o;
 if(m==0){float ov=clamp(1.-lb+Pb*.25,0.,1.);float ln=l<.5?2.*l*ov:1.-2.*(1.-l)*(1.-ov);ln=mix(l,ln,A);
  cq=mix(o+(ln-l),o*ln/max(l,.01),.5);}
 else if(m==1){float lg=pow(max(l,0.),exp2(-Pb*1.5));float w=4.*lg*(1.-lg);float ln=l+(l-lb)*w*A*2.+A*.08*w*(.5-lb);cq=o+(ln-l);}
 else if(m==2){cq=o*pow((o+.03)/(b+.03),vec3(A*1.3));cq=mix(cq,overlay(clamp(cq,0.,1.),b),A*.35);}
 else if(m==3){float lo=1.,hi=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){float v=luma(T((vec2(float(i),float(j))+.5)/12.).rgb);lo=min(lo,v);hi=max(hi,v);}
  float l2=lo*A,h2=mix(1.,hi,A);cq=(o-l2)/max(h2-l2,.2);cq=mix(cq,cq*cq*(3.-2.*cq),.25*A);cq=mix(vec3(luma(cq)),cq,1.+.3*A);
  cq+=(o-b)*.35*A;cq*=exp2(Pb*.7);}
 else if(m==4){float ln=clamp(.5+(pow(max(l,0.),exp2(Pb))-.5)*(1.+.8*A),0.,1.);cq=o+(ln-l);}
 else if(m==5){cq=o*exp2(Pb);cq+=(o-b)*A*1.2;float s=max(cq.r,max(cq.g,cq.b))-min(cq.r,min(cq.g,cq.b));
  cq=mix(vec3(luma(cq)),cq,1.+.5*A*(1.-clamp(s,0.,1.)));cq*=vec3(1.+.05*A,1.,1.-.06*A);cq*=1.-.25*A*smoothstep(.4,1.2,rr);}
 else{vec2 p_=u_px;vec3 g3=(4.*o+2.*(O(uv+vec2(p_.x,0.)).rgb+O(uv-vec2(p_.x,0.)).rgb+O(uv+vec2(0.,p_.y)).rgb+O(uv-vec2(0.,p_.y)).rgb)
  +O(uv+p_).rgb+O(uv-p_).rgb+O(uv+vec2(p_.x,-p_.y)).rgb+O(uv+vec2(-p_.x,p_.y)).rgb)/16.;
  float w=4.*l*(1.-l);cq=o+(o-g3)*A*3.+(o-b)*A*.45*w;cq=mix(vec3(luma(cq)),cq,1.+.15*A);cq*=exp2(Pb*.5);}
 return vec4(clamp(cq,0.,1.),1.);`],
  "Bigger Hammer: Dan Margulis' shadow/highlight compression = luminosity overlaid with its own inverted blur (Professional Photoshop), luminance-only; Midtone Enhancer: gamma-weighted midtone local contrast; Detail Multiplier: colour ratio to the blur raised to a power + overlay with the blur; Betterizer: auto levels (12x12 grid of the blurred image) + S-curve + saturation + sharpen; Luminosity Contrast: L-only curve (bias gamma, steepness) with chroma kept; Photon Chamber: re-exposure, extrapolated-HDR local contrast, vibrance, warmth, vignette; Sharpen Landscape (BoltBait): 3x3 unsharp + midtone clarity + slight saturation (approx.)");

f = add('Color');
f('q04_colortheory','Colour Theory Hue Snap (Color Gravity / Color Harmonies / Color Diad)',
  [S('Scheme',['Gravity: complementary','Gravity: triad','Gravity: extreme (Warhol)','Harmony: monochromatic','Harmony: complementary','Harmony: tetrad 30','Harmony: tetrad 60','Harmony: tetrad 90 (square)','Harmony: triad','Harmony: close triad','Harmony: close diad','Color Diad (Hue 1 + Hue 2)']),
   P('Hue 1',0,360,25,1,'deg'),P('Hue 2 (Color Diad)',0,360,200,1,'deg'),P('Strength',0,1,.6,.01)],
  `
#define Q04_TOYB(hh) ((hh)<30.?(hh)*2.:(hh)<60.?60.+((hh)-30.)*2.:(hh)<120.?60.+(hh):(hh)<240.?120.+(hh)*.5:(hh))
#define Q04_FROMYB(hh) ((hh)<60.?(hh)*.5:(hh)<120.?30.+((hh)-60.)*.5:(hh)<180.?(hh)-60.:(hh)<240.?120.+((hh)-180.)*2.:(hh))
 int m=int(u_p0+.5);float Sg=u_p3;vec3 o=T(uv).rgb;vec3 hv=rgb2hsv(o);
 float h0=mod(hv.x*360.,360.);float hy=Q04_TOYB(h0);
 float t1=Q04_TOYB(mod(u_p1,360.)),t2=Q04_TOYB(mod(u_p2,360.));
 vec4 off=vec4(0.,180.,0.,0.);int n=2;
 if(m==1||m==8){off=vec4(0.,120.,240.,0.);n=3;}else if(m==3){n=1;}else if(m==5){off=vec4(0.,30.,180.,210.);n=4;}
 else if(m==6){off=vec4(0.,60.,180.,240.);n=4;}else if(m==7){off=vec4(0.,90.,180.,270.);n=4;}
 else if(m==9){off=vec4(0.,30.,60.,0.);n=3;}else if(m==10){off=vec4(0.,60.,0.,0.);}
 else if(m==11){off=vec4(0.,mod(t2-t1+360.,360.),0.,0.);}
 float best=1e3;for(int i=0;i<4;i++){if(i>=n)break;float tt=mod(t1+off[i],360.);float d=mod(hy-tt+540.,360.)-180.;if(abs(d)<abs(best))best=d;}
 float half_=n==1?180.:n==2?(m==10?150.:90.):n==3?(m==9?150.:60.):(m==5?75.:45.);
 bool grav=m<=2;float pull=grav?(m==2?1.:Sg):Sg;
 float hy2=mod(hy-best*pull,360.);float far=clamp(abs(best)/half_,0.,1.);
 float sat=hv.y*(grav?1.:1.-Sg*.85*smoothstep(.3,1.,far));
 if(m==2)sat=min(sat*1.35+.05,1.);
 vec3 cq=hsv2rgb(vec3(Q04_FROMYB(hy2)/360.,sat,hv.z));
 if(grav)cq=mix(cq,cq*cq*(3.-2.*cq),Sg*(m==2?.7:.3));
 return vec4(clamp(cq,0.,1.),1.);`,
  'Filter Forge Color Gravity / Color Harmonies / Color Diad (approx.): hue converted to an artists RYB wheel (piecewise-linear RGB<->RYB), pulled toward the nearest target hue of the scheme by Strength; harmonies also desaturate colours far from every target; gravity adds contrast (extreme = full snap + saturation, Warhol-like)');

f = add('Stylize');
f('q04_lightoverlay','Light & Metal Overlays (Snow Photo / Dappled Light / Goldleaf / Silver Dust)',
  [S('Look',['Snow photo (falling snow)','Dappled light','Goldleaf (gold)','Goldleaf (silver)','Goldleaf (bronze)','Silver Dust']),
   P('Amount',0,1,.9,.01),P('Scale',.3,3,1,.01),P('Hue shift',-180,180,0,1,'deg')],
  [BH('2.'), BV('2.'), `${Q04_GEOM}
 int m=int(u_p0+.5);float A=u_p1,Sc=u_p2,H=u_p3;
 vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o),lb=luma(b);vec3 cq=o;
 if(m==0){vec3 tn=hsv2rgb(vec3(fract((215.+H)/360.),.45,1.));vec3 bs=mix(vec3(l),o,.6);bs=pow(bs,vec3(1.15));
  bs=bs*mix(vec3(1.),tn/luma(tn)*.85,.6)*.9;float clr=smoothstep(.1,.55,rr);float sn=0.;
  for(int k=0;k<3;k++){float fk=float(k);float cs=(k==0?90.:k==1?38.:15.)*Sc;vec2 p=PX(uv)/cs+fk*17.3;vec2 ci=floor(p);vec2 fq=fract(p);
   vec2 c0=.3+.4*hash2(ci+fk*5.1);float rad=(.05+.12*hash(ci+fk*3.7));float pres=step(hash(ci+fk*9.1+.5),k==0?.12:k==1?.3:.6);
   float sf=k==0?.75:k==1?.4:.2;float fl=pres*(1.-smoothstep(rad*(1.-sf),rad,length(fq-c0)))*(k==0?.55:k==1?.8:.92);
   sn=max(sn,fl*(k==2?1.:clr*.7+.3));}
  cq=mix(bs,vec3(.96,.98,1.),sn);}
 else if(m==1){vec2 p=PX(uv)/(70.*Sc)+hash1(1.)*40.;float lt=smoothstep(.45,.62,fbm(p+.7*vec2(fbm(p*.5),fbm(p*.5+3.))));
  vec3 lc=hsv2rgb(vec3(fract((75.+H)/360.),.3,1.));cq=o*mix(vec3(.74,.78,.74),lc*1.3,lt);}
 else if(m<=4){vec2 d=u_px*max(R(2.*Sc),1.);vec2 g=vec2(luma(T(uv+vec2(d.x,0.)).rgb)-luma(T(uv-vec2(d.x,0.)).rgb),luma(T(uv+vec2(0.,d.y)).rgb)-luma(T(uv-vec2(0.,d.y)).rgb));
  g+=(vec2(vnoise(PX(uv)/(9.*Sc)),vnoise(PX(uv)/(9.*Sc)+9.))-.5)*.02;
  vec3 n=normalize(vec3(-g*7.,1.));vec3 ld=normalize(vec3(-.5,.6,.65));float df=max(dot(n,ld),0.);float sp=pow(max(dot(n,normalize(ld+vec3(0.,0.,1.))),0.),24.);
  float t=clamp(lb*.55+df*.5-.05,0.,1.);
  if(m==2)cq=stops5(vec3(.18,.1,.02),vec3(.45,.28,.05),vec3(.78,.55,.15),vec3(.95,.8,.35),vec3(1.,.96,.75),t);
  else if(m==3)cq=stops5(vec3(.1,.11,.12),vec3(.35,.36,.38),vec3(.62,.63,.66),vec3(.85,.86,.88),vec3(1.),t);
  else cq=stops5(vec3(.14,.06,.02),vec3(.38,.18,.07),vec3(.62,.36,.16),vec3(.82,.56,.3),vec3(.98,.84,.62),t);
  cq+=sp*.5*mix(vec3(1.),cq,.4);cq=cssHue(clamp(cq,0.,1.),H);}
 else{float hp=l-lb;float s=.85-abs(l-.5)*.9+hp*5.;
  float dd=step(.985,hash(floor(uv*u_res)))*hash(floor(uv*u_res)+3.);s+=dd*.4;cq=vec3(s)*vec3(.98,1.,1.03);}
 return vec4(mix(o,clamp(cq,0.,1.),A),1.);`],
  'Filter Forge library looks (approx.): Snow photo = cold tinted desaturated photo + 3 parallax layers of seeded soft snowflakes (front big/blurred, back small/dense) with a clearer centre; Dappled light = domain-warped fbm light/shade pattern in a pale light colour; Goldleaf = blurred-luminance relief normals + beaten-metal noise, diffuse + specular shading through a gold / silver / bronze ramp; Silver Dust = inverted-ish grey local-contrast silver with fine bright dust specks', true);
