/* ================= plugins: classic Photoshop plug-in suites — part 2 (KPT, Flaming Pear, Topaz, Xenofex Television) ================= */

/* ---------- 9. KPT Equalizer ---------- */
f = add('Sharpen');
f('kpt_equalizer','KPT Equalizer (Bounded Sharpen)',
  [P('Fine detail',-1,3,1.2,.01),P('Medium detail',-1,3,.6,.01),P('Coarse detail',-1,2,.25,.01),S('Mode',['Bounded (no halos)','Unbounded'])],
  [`float s1=R(1.2),s2=R(3.5),s3=R(10.);float st=max(1.,s3*3./30.);vec3 acc=vec3(0.),ws=vec3(0.);
 for(int i=-30;i<=30;i++){float x=float(i)*st;float l=luma(O(uv+vec2(x,0.)*u_px).rgb);vec3 w=exp(-x*x/(2.*vec3(s1*s1,s2*s2,s3*s3)));acc+=l*w;ws+=w;}return vec4(acc/ws,1.);`,
   `float s1=R(1.2),s2=R(3.5),s3=R(10.);float st=max(1.,s3*3./30.);vec3 acc=vec3(0.),ws=vec3(0.);
 for(int i=-30;i<=30;i++){float x=float(i)*st;vec3 v=T(uv+vec2(0.,x)*u_px).rgb;vec3 w=exp(-x*x/(2.*vec3(s1*s1,s2*s2,s3*s3)));acc+=v*w;ws+=w;}return vec4(acc/ws,1.);`,
   `vec3 o=O(uv).rgb;float l0=luma(o);vec3 b=T(uv).rgb;float d1=l0-b.x,d2=b.x-b.y,d3=b.y-b.z;float nl=l0+u_p0*d1*1.5+u_p1*d2*1.5;
 if(u_p3<.5){float mn=1.,mx=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float l=luma(O(uv+vec2(float(i),float(j))*R(1.)*u_px).rgb);mn=min(mn,l);mx=max(mx,l);}nl=clamp(nl,mn-.01,mx+.01);}
 nl+=u_p2*d3*1.2;return vec4(clamp(o+(nl-l0),0.,1.),1.);`],
  'KPT Equalizer: three-band luminance equaliser (Gaussian sigma 1.2 / 3.5 / 10 px difference bands); Bounded mode clamps the fine + medium sharpening to the local 5x5 min / max so no halos or overshoot appear (the KPT "bounded sharpen" idea); coarse band added unbounded. Colour kept by adding the luma change to RGB');

/* ---------- 10. KPT Convolver ---------- */
f = add('Stylize');
f('kpt_convolver','KPT Convolver (Blur / Sharpen / Edge / Relief / Explore)',
  [S('Kernel',['Blur','Sharpen','Edge detect','Relief','Explore (random mutation)']),P('Amount',0,2,1,.01),P('Hue rotate',-180,180,0,1),P('Relief angle',0,360,135,1)],
  `int m=int(u_p0+.5);vec3 o=c.rgb;float d=R(1.+u_p1*1.5);vec2 e=u_px*d;
 vec3 s0=T(uv+vec2(-e.x,e.y)).rgb,s1=T(uv+vec2(0.,e.y)).rgb,s2=T(uv+e).rgb,s3=T(uv-vec2(e.x,0.)).rgb,s5=T(uv+vec2(e.x,0.)).rgb,s6=T(uv-e).rgb,s7=T(uv-vec2(0.,e.y)).rgb,s8=T(uv+vec2(e.x,-e.y)).rgb;
 vec3 bl=(s0+s2+s6+s8+2.*(s1+s3+s5+s7)+4.*o)/16.;vec3 gx=(s2+2.*s5+s8)-(s0+2.*s3+s6),gy=(s0+2.*s1+s2)-(s6+2.*s7+s8);vec3 ed=sqrt(gx*gx+gy*gy);
 float an=radians(u_p3);float rel=luma(gx)*cos(an)+luma(gy)*sin(an);vec3 res;
 if(m==0)res=mix(o,bl,min(u_p1,1.));else if(m==1)res=o+(o-bl)*u_p1*1.5;else if(m==2)res=ed*u_p1*1.5;else if(m==3)res=o+rel*u_p1*.8;
 else{float w1=hash1(1.),w2=hash1(2.),w3=hash1(3.),w4=hash1(4.);res=o+(bl-o)*w1*u_p1+(o-bl)*w2*u_p1*2.+ed*w3*u_p1*.8*(hash1(6.)>.5?1.:-1.)+rel*(w4-.3)*u_p1;
  res=cssHue(clamp(res,0.,1.),(hash1(5.)-.5)*240.*u_p1);res=mix(vec3(luma(res)),res,.6+hash1(7.)*1.);}
 return vec4(cssHue(clamp(res,0.,1.),u_p2),1.);`,
  'KPT 6 Convolver: 3x3 kernel family at a spacing set by Amount: Gaussian blur, unsharp sharpen, per-channel Sobel edge magnitude, directional relief (angle); Explore = seeded random mutation mixing the kernels with a random hue twist and saturation (change the seed to mutate); global Hue rotate like the Tweak mode (approx.)',1);

/* ---------- 11. Gel / Materializer / Lacquer ---------- */
f = add('Materials');
f('plug_gloss','Gloss Materials: Gel / Materializer (KPT), Lacquer (Flaming Pear)',
  [S('Effect',['Gel (KPT)','Materializer (KPT)','Lacquer: transparent','Lacquer: metallic','Lacquer: prismatic']),P('Relief',0,2,1,.01),P('Smoothness',2,40,8,1,'px'),P('Gloss',0,1,.6,.01)],
  [BH('u_p2*.5'),BV('u_p2*.5'),
   `
#define PLG_GEL(q) (vnoise(q)*.65+vnoise((q)*2.1+5.)*.35)
int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;vec2 pp=PX(uv);vec2 e=u_px*R(max(u_p2*.3,1.));
 float hx=luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb),hy=luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb);
 vec3 Ld=normalize(vec3(-.5,.6,.8));vec3 n=normalize(vec3(-vec2(hx,hy)*u_p1*10.,1.));float df=clamp(dot(n,Ld)/Ld.z,0.,1.6);float sp=pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),60.);vec3 res=o;
 if(m==0){float k=1./(u_p2*6.);vec2 q=pp*k;float g0=PLG_GEL(q);float th=.6;float gel=smoothstep(th,th+.03,g0);
  if(gel>0.){float gx=PLG_GEL(q+vec2(.02,0.))-g0,gy=PLG_GEL(q+vec2(0.,.02))-g0;float hh=smoothstep(th,th+.2,g0);vec3 gn=normalize(vec3(-vec2(gx,gy)/.02*1.2*u_p1,1.));
   vec3 im=O(uv+fromPX(-gn.xy*u_p2*3.*u_p1)).rgb;vec3 gc=sat(im,1.3)*1.05*(.85+.25*hh)+pow(max(dot(reflect(-Ld,gn),vec3(0.,0.,1.)),0.),40.)*u_p3*1.6+pow(1.-gn.z,1.5)*.25;gc*=1.-.5*smoothstep(.04,0.,g0-th);
   res=mix(o,clamp(gc,0.,1.),gel);}
  else{float sh=smoothstep(th-.06,th,PLG_GEL((pp+vec2(4.,-4.)*u_p2*.3)*k));res=o*(1.-.3*sh);}}
 else if(m==1){vec2 q=pp/(u_p2*.9);float tx=fbm(q)*.6+vnoise(q*3.)*.4;float tx1=fbm(q+vec2(.08,0.))*.6+vnoise((q+vec2(.08,0.))*3.)*.4,tx2=fbm(q+vec2(0.,.08))*.6+vnoise((q+vec2(0.,.08))*3.)*.4;
  vec3 n2=normalize(n+vec3(-(tx1-tx)/.08*.18*u_p1,-(tx2-tx)/.08*.18*u_p1,0.));float d2=clamp(dot(n2,Ld)/Ld.z,0.,1.6);float s2=pow(max(dot(reflect(-Ld,n2),vec3(0.,0.,1.)),0.),25.);
  res=o*(.25+.75*d2)+s2*u_p3*.5;}
 else{vec3 bc=mix(o,bl,.55);
  if(m==2)res=bc*(.8+.25*df)+sp*u_p3*1.2+pow(1.-n.z,2.)*.4*u_p3;
  else if(m==3){float env=.5+.5*sin(n.x*7.+n.y*4.+luma(bl)*6.);res=bc*(.35+.9*env)*(.7+.35*df)+sp*u_p3*1.5;res=mix(vec3(luma(res)),res,.8);}
  else{vec3 rb=hsv2rgb(vec3(fract(atan(n.y,n.x)/6.2832+length(n.xy)*3.+luma(bl)),.7,1.));res=bc*(.8+.25*df)+rb*clamp(length(n.xy)*4.,0.,1.)*u_p3*.55+sp*u_p3;}}
 return vec4(clamp(res,0.,1.),1.);`],
  'KPT Gel = clear coloured gel blobs (fbm blob field) that refract the image through their surface normal, with specular highlights, darkened rims and a cast shadow; KPT Materializer = image turned into a lit relief material (smoothed-luma height + stucco texture); Flaming Pear Lacquer = thick smoothed coat over the image: transparent (gloss + Fresnel sheen), metallic (banded environment reflection, desaturated), prismatic (rainbow sheen from the surface normal). Smoothness = height blur (approx.)',1);

/* ---------- 12. KPT Reaction ---------- */
const PLG_RD = `float s=R(u_p0);float a=0.,b=0.;float jr=hash(floor(PX(uv)))*6.2832;
 for(int k=0;k<32;k++){float fk=float(k)+.5;float an=fk*2.39996+jr;float rr=sqrt(fk/32.);vec2 d=vec2(cos(an),sin(an))*rr*u_px;a+=T(uv+d*s*.55).r;b+=T(uv+d*s*1.5).r;}
 a/=32.;b/=32.;float v=T(uv).r;float nv=clamp(.5+6.*(a-b)+u_p1*.1+u_p2*.08*(luma(O(uv).rgb)-.5),0.,1.);nv=mix(v,nv,.75);return vec4(nv,nv,nv,1.);`;
f = add('Render');
f('kpt_reaction','KPT Reaction (reaction-diffusion pattern)',
  [P('Scale',3,30,7,1,'px'),P('Spots or stripes',-1,1,0,.01),P('Image influence',0,1,.5,.01),S('Colour',['Image tones','Black and white','Duotone'])],
  [`vec2 pp=PX(uv);float v=mix(vnoise(pp/(u_p0*.35)),luma(c.rgb),u_p2*.7);return vec4(v,v,v,1.);`,
   PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,PLG_RD,
   `float v=T(uv).r;float e=smoothstep(.35,.65,v);vec3 o=O(uv).rgb;int m=int(u_p3+.5);vec2 dd=u_px*R(1.);
 float gx=T(uv+vec2(dd.x,0.)).r-T(uv-vec2(dd.x,0.)).r,gy=T(uv+vec2(0.,dd.y)).r-T(uv-vec2(0.,dd.y)).r;float sh=1.+(-gx+gy)*.6;
 vec3 res=m==0?mix(o*.3,clamp(sat(o,1.2)*1.1+.05,0.,1.),e):m==1?vec3(e):mix(vec3(.12,.1,.25),vec3(.98,.75,.35),e);return vec4(clamp(res*sh,0.,1.),1.);`],
  'KPT Reaction look: activator-inhibitor iteration (12 passes): each pass sets v = clamp(0.5 + 6 (disc mean r 0.55 Scale - disc mean r 1.5 Scale) + bias), seeded noise + image luma as the start, so Turing labyrinths / spots form at the chosen scale (Spots or stripes = bias, Image influence steers where); shaded and coloured. Approx. (DoG Turing model, not a Gray-Scott solver)',1);

/* ---------- 13. Melancholytron / Aetherize / Hue and Cry ---------- */
f = add('Stylize');
f('fp_moods','Flaming Pear Moods: Melancholytron / Aetherize / Hue and Cry',
  [S('Effect',['Melancholytron','Aetherize','Hue and Cry']),P('Strength',0,1,.8,.01),P('Blur or scale',2,60,14,1,'px'),P('Style',0,1,.5,.01)],
  [BH('u_p2'),BV('u_p2'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;vec2 a=vec2(asp(),1.);float r=length((uv-.5)*a)/length(a*.5);vec3 x;
 if(m==0){float foc=smoothstep(.12,.85,r);x=mix(o,bl,foc*.9);float y=luma(x);x=mix(sat(x,.5),y*vec3(1.08,.95,.76),u_p3);x=.07+x*.86;x=mix(x,screen(x,bl*.3),.4);x*=1.-.6*foc*foc;x=mix(x,x*vec3(.95,.97,1.05),.5);}
 else if(m==1){vec3 g=screen(o,bl*.75);vec3 hs=rgb2hsv(g);hs.x=fract(hs.x+(u_p3-.5)*.6);hs.y=min(1.,hs.y*(1.+u_p1*.9));x=hsv2rgb(hs);x=.06+x*.92;x=mix(x,vec3(1.,.97,.95),.4*smoothstep(.35,1.,r));}
 else{vec2 q=PX(uv)/(u_p2*8.);vec2 w=q+1.5*vec2(fbm(q*.8+1.),fbm(q*.8+9.));float n1=fbm(w);float n2=fbm(w*1.7+4.);float rid=1.-abs(2.*n2-1.);float sv=mix(n1,rid,u_p3);
  x=.5+.5*cos(6.2832*(vec3(0.,.33,.67)*(.6+hash1(8.)*.8)+sv*2.2+hash1(3.)));x=mix(vec3(luma(x)),x,.4+.8*hash1(5.))*(.55+.6*n1);}
 return vec4(clamp(mix(o,x,u_p1),0.,1.),1.);`],
  'Flaming Pear Photography Pack looks: Melancholytron = focus and saturation subdued toward the edges, lifted blacks, soft glow, deep vignette (Style: full colour -> sepia-like); Aetherize = gauzy screened glow, hue twist (Style; 0.5 = none, ends = toward acidic shifted hues), saturation push and a pale vignette; Hue and Cry = seeded generator of abstract colour regions (domain-warped fbm through a cosine palette; Style = diffuse -> structured ridges; seed sets vivid / pallid palette), mixed over the image by Strength (approx.)',1);

/* ---------- 14. Television ---------- */
f = add('Retro');
f('xf_television','Television (Xenofex)',
  [S('Mode',['Colour','Black and white','Bad reception']),P('Scanlines',0,1,.6,.01),P('Noise',0,1,.3,.01),P('Distortion',0,1,.35,.01)],
  `int m=int(u_p0+.5);vec2 p=(uv-.5)*2.;float k=u_p3*.22;vec2 q=p*(1.+k*dot(p,p)*.5);vec2 bx=abs(q)-vec2(1.)+.12;float bd=length(max(bx,0.))-.12;
 if(bd>0.)return vec4(vec3(.035),1.);vec2 tuv=q*.5+.5;float pitch=R(3.);float ln=floor(tuv.y*u_res.y/pitch);float bad=m==2?1.:0.;
 tuv.x+=(hash(vec2(ln,7.))-.5)*u_p2*.008*(1.+bad*3.)+sin(tuv.y*40.+hash1(2.)*6.)*u_p3*.004+bad*.03*smoothstep(.9,1.,sin(tuv.y*3.+hash1(4.)*6.));
 float ca=.003*u_p3*(1.+bad);vec3 col=vec3(T(tuv+vec2(ca,0.)).r,T(tuv).g,T(tuv-vec2(ca,0.)).b);col=mix(col,T(tuv-vec2(.025,0.)).rgb,(.1+.25*bad)*u_p3);
 if(m==1)col=vec3(luma(col));if(m==2){col*=.8+.2*sin(tuv.y*6.+hash1(4.)*6.);col=mix(col,vec3(luma(col)),.4);}
 float sl=.5+.5*cos(fract(tuv.y*u_res.y/pitch)*6.2832);col*=(1.-u_p1*.55*(1.-sl))*(1.+u_p1*.25);
 col+=(hash(floor(PX(uv)))-.5)*u_p2*(.45+bad*.4);col*=1.-.3*dot(p,p)*.5;col*=smoothstep(0.,-.02,bd);
 return vec4(clamp(col,0.,1.),1.);`,
  'Xenofex 2 Television: curved screen with rounded bezel, scanlines (3 px pitch), per-line horizontal jitter and wavering, RGB fringing, ghost image, snow noise, vignette; Bad reception adds a rolling hum bar, line tearing and washed colour (approx.)',1);

/* ---------- 15. India Ink ---------- */
f = add('Paint');
f('fp_indiaink','India Ink Halftones (Flaming Pear)',
  [S('Pattern',['Round dots','Lines','Concentric rings','Worms','Mezzotint','Etched colour']),P('Cell size',3,30,7,1,'px'),P('Angle',0,180,45,1),P('Contrast',.5,3,1.3,.05)],
  `int m=int(u_p0+.5);vec2 pp=PX(uv);float cs=u_p1;vec2 q=rot(pp,radians(u_p2))/cs;vec3 o=c.rgb;
 if(m==5){vec3 ink=vec3(0.);for(int ch=0;ch<3;ch++){vec2 qq=rot(pp,radians(u_p2+float(ch)*30.))/cs;float v=abs(fract(qq.y)-.5)*2.;float dk=clamp((1.-o[ch]-.5)*u_p3+.5,0.,1.);float w=fwidth(v)+1e-4;ink[ch]=1.-smoothstep(dk-w,dk+w,v);}
  return vec4(1.-ink*vec3(.9,.85,.8),1.);}
 float y=clamp((luma(o)-.5)*u_p3+.5,0.,1.);float dk=1.-y;float v;
 if(m==0){v=length(fract(q)-.5)*1.414;v*=v;}else if(m==1)v=abs(fract(q.y)-.5)*2.;else if(m==2)v=abs(fract(length(pp-u_res/u_k*.5)/cs)-.5)*2.;
 else if(m==3)v=abs(fract(fbm(q*.3)*5.)-.5)*2.;else v=hash(floor(pp/max(cs*.2,1.)));
 float w=m==4?0.:fwidth(v)+1e-4;float ink=1.-smoothstep(dk-w,dk+w,v);return vec4(vec3(1.-ink),1.);`,
  'Flaming Pear India Ink: black-and-white halftone screens: rotated round dots (area-correct), line screen, concentric rings from the centre, worms (ridged-noise contour lines thickening in the shadows), mezzotint (random threshold grain), and the etched colour mode (three rotated line screens, one per channel); anti-aliased with fwidth',1);

/* ---------- 16. Topaz Adjust / ReStyle / B&W Effects ---------- */
f = add('Tone');
f('topaz_tone','Topaz Adjust / ReStyle / B&W Effects',
  [S('Effect',['Adjust (detail and vibrance)','ReStyle (palette restyle)','B&W Effects (toned monochrome)']),P('Strength',0,1,.8,.01),P('Preset',1,8,1,1),P('Detail',0,2,1,.01)],
  [BH('14.'),BV('14.'),
   `int m=int(u_p0+.5);int v=clamp(int(u_p2+.5)-1,0,7);vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;float y=luma(o);float yb=luma(bl);vec3 x;
 if(m==0){int pr=v-4*(v/4);float kk=v>=4?1.6:1.;const float DK[4]=float[](1.4,2.2,1.,.8);const float SL[4]=float[](.35,.15,.2,.25);const float VB[4]=float[](.8,-.3,.2,1.);
  x=o+(o-bl)*DK[pr]*u_p3*kk;x*=1.+SL[pr]*kk*(1.-smoothstep(0.,.6,yb));x=x/(1.+max(luma(x)-.9,0.));float s=rgb2hsv(clamp(x,0.,1.)).y;x=mix(vec3(luma(x)),x,1.+VB[pr]*kk*(1.-s));}
 else if(m==1){const vec3 PL[40]=vec3[](
   vec3(.08,.06,.12),vec3(.35,.18,.3),vec3(.8,.4,.35),vec3(.98,.75,.5),vec3(1.,.96,.85),
   vec3(.02,.08,.12),vec3(.05,.3,.38),vec3(.3,.6,.55),vec3(.85,.8,.6),vec3(.98,.95,.88),
   vec3(.1,.07,.04),vec3(.38,.25,.12),vec3(.7,.5,.25),vec3(.9,.78,.5),vec3(1.,.97,.85),
   vec3(.05,.05,.15),vec3(.25,.15,.45),vec3(.65,.3,.6),vec3(.95,.6,.6),vec3(1.,.92,.85),
   vec3(.06,.1,.06),vec3(.2,.32,.15),vec3(.5,.6,.3),vec3(.82,.8,.55),vec3(.98,.96,.86),
   vec3(.1,.02,.02),vec3(.45,.05,.08),vec3(.85,.3,.15),vec3(.98,.7,.3),vec3(1.,.95,.8),
   vec3(.03,.04,.1),vec3(.12,.2,.4),vec3(.4,.5,.7),vec3(.75,.8,.88),vec3(.97,.97,1.),
   vec3(.12,.08,.1),vec3(.45,.35,.38),vec3(.72,.62,.6),vec3(.9,.83,.75),vec3(.99,.96,.9));
  vec3 pc=stops5(PL[v*5],PL[v*5+1],PL[v*5+2],PL[v*5+3],PL[v*5+4],y);vec3 h=mix(pc,o*pc/max(luma(pc),.05)*y,.3);x=h+(o-bl)*u_p3*.6;}
 else{const vec3 MID[8]=vec3[](vec3(.5),vec3(.5,.46,.52),vec3(.6,.48,.36),vec3(.3,.5,.68),vec3(.55,.5,.44),vec3(.6,.5,.38),vec3(.5,.4,.33),vec3(.46,.52,.5));
  const vec3 HI[8]=vec3[](vec3(.97),vec3(.96,.95,.97),vec3(.99,.94,.84),vec3(.88,.95,1.),vec3(.97,.94,.89),vec3(1.,.95,.8),vec3(.96,.9,.82),vec3(.95,.98,.96));
  float g=dot(o,vec3(.42,.45,.13));g+=(g-yb)*u_p3*.9;g=clamp(g,0.,1.);g=mix(g,g*g*(3.-2.*g),.5);x=g<.5?MID[v]*g*2.:mix(MID[v],HI[v],(g-.5)*2.);
  x+=(hash(floor(PX(uv)))-.5)*.035;vec2 a=vec2(asp(),1.);x*=1.-.25*smoothstep(.4,1.,length((uv-.5)*a)/length(a*.5));}
 return vec4(clamp(mix(o,x,u_p1),0.,1.),1.);`],
  'Topaz look approximations: Adjust = local-contrast detail from a 14 px base, shadow lift, highlight roll-off, vibrance (presets 1-4 Spicify, Dramatic, Clarity, Vibrant; 5-8 strong versions); ReStyle = 8 five-colour palettes gradient-mapped by luminance (partly keeping image hue) with detail; B&W Effects = red-weighted mono, local contrast, S curve, split toning presets 1-8 Neutral, Selenium, Sepia, Cyanotype, Platinum, Albumen, Van Dyke, Opalotype, fine grain + vignette (approx.)');

/* ---------- 17. Topaz Impression ---------- */
f = add('Paint');
f('topaz_impression','Impression Painting (Topaz)',
  [S('Style',['Oil','Watercolor','Pastel','Impasto']),P('Stroke size',2,20,6,1,'px'),P('Stroke length',.5,4,2,.1),P('Texture',0,1,.5,.01)],
  [`return vec4(kuwa(uv,clamp(u_p1*.6,1.,8.)),1.);`,
   `int m=int(u_p0+.5);vec2 pp=PX(uv);vec3 J=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=sobelD(uv+vec2(float(i),float(j))*R(u_p1)*u_px,R(u_p1*.5));J+=vec3(g.x*g.x,g.y*g.y,g.x*g.y);}J/=9.;
 float gl=sqrt(J.x+J.y);float an=.5*atan(2.*J.z,J.x-J.y+1e-9)+1.5708;float fl=1.-smoothstep(.02,.15,gl);an+=fl*(vnoise(pp/(u_p1*6.))-.5)*3.;vec2 tg=vec2(cos(an),sin(an));vec2 nm=vec2(-tg.y,tg.x);
 float sl=u_p1*u_p2*2.;vec3 acc=vec3(0.);float ws=0.;for(int i=-8;i<=8;i++){float t=float(i)/8.;vec3 s=T(uv+fromPX(tg*t*sl)).rgb;float w=1.-abs(t)*.5;acc+=s*w;ws+=w;}
 vec3 lc=acc/ws;float wd=u_p1;float lg=u_p1*u_p2*3.;vec2 sc=vec2(dot(pp,tg),dot(pp,nm));float rw=floor(sc.y/wd);float ofs=hash(vec2(rw,1.))*lg;float cl=floor((sc.x+ofs)/lg);
 vec2 cen=vec2((cl+.5)*lg-ofs,(rw+.5)*wd);vec3 dab=T(fromPX(tg*cen.x+nm*cen.y)).rgb;float fx=fract((sc.x+ofs)/lg);float dend=smoothstep(0.,.15,fx)*smoothstep(1.,.85,fx);
 vec3 col=mix(lc,dab,.65*mix(.5,1.,dend));float br=vnoise(vec2(sc.y*3./wd,sc.x*.12/wd+cl*7.));float sid=hash(vec2(rw,cl));col*=.95+.1*sid;col*=.92+.08*dend;float tx=u_p3;
 if(m==0){col=sat(col,1.15);col*=1.+(br-.5)*.5*tx;}
 else if(m==1){col=mix(col,vec3(1.),.15);col*=1.-.5*smoothstep(.05,.4,gl)*tx;col*=1.-.15*tx*fbm(pp*.3);col=mix(col,col*col,.2);}
 else if(m==2){float gr=vnoise(pp*.9)*.6+vnoise(pp*.23)*.4;col=mix(sat(col,.85)*1.06,vec3(.97,.96,.93),tx*smoothstep(.62,.85,gr)*.7);}
 else{float b2=vnoise(vec2((sc.y+1.)*3./wd,(sc.x+1.)*.12/wd+cl*7.));col*=1.+(br-b2)*1.6*tx+(br-.5)*.2;col+=pow(max(br-b2,0.),2.)*1.2*tx;}
 return vec4(clamp(col,0.,1.),1.);`],
  'Topaz Impression look: Kuwahara-flattened colour smeared along the local edge tangent (17-tap line integral, random directions in flat areas), per-stroke colour variation and bristle texture; Oil, Watercolor (lighter, darkened edges, paper granulation), Pastel (paper tooth showing through chalky strokes), Impasto (embossed bristle relief with highlights) (approx.)',1);

/* ---------- 18. Topaz Texture Effects ---------- */
f = add('Stylize');
f('topaz_texture','Texture Effects (Topaz)',
  [S('Effect',['Grunge overlay','Light leaks','Old paper','Vintage combo']),P('Strength',0,1,.7,.01),P('Scale',.3,3,1,.01),P('Warmth',-1,1,.3,.01)],
  `int m=int(u_p0+.5);vec2 pp=PX(uv)/u_p2;vec2 a=vec2(asp(),1.);float r=length((uv-.5)*a)/length(a*.5);vec3 o=c.rgb;vec3 x=o;
 vec3 wc=u_p3>0.?mix(vec3(1.),vec3(1.08,.98,.82),u_p3):mix(vec3(1.),vec3(.88,.97,1.1),-u_p3);
 float gg=fbm(pp*.015)*.6+fbm(pp*.08)*.4;float stn=smoothstep(.55,.75,fbm(pp*.01+3.));float scr=smoothstep(.012,0.,abs(fract(rot(pp,.4).x*.02+fbm(pp*.004)*3.)-.5))*step(.6,vnoise(pp*.01+7.));float spk=step(.996,hash(floor(pp*.5)));
 vec3 gru=o*(.6+.75*gg)*(1.-.5*stn)+scr*.4+spk*.3;gru*=1.-.4*smoothstep(.45,1.,r);
 vec2 l1=vec2(hash1(1.)*asp(),hash1(2.)>.5?1.:0.);vec2 l2=vec2(hash1(3.)>.5?asp():0.,hash1(4.));vec2 qa=uv*a;
 vec3 leak=vec3(1.,.45,.12)*exp(-length((qa-l1)*vec2(1.,1.8))*3.)*1.2+vec3(1.,.2,.35)*exp(-length((qa-l2)*vec2(1.8,1.))*3.5)+vec3(1.,.85,.4)*exp(-length(qa-l1*.9)*6.)*.6;vec3 lk=screen(o,clamp(leak*1.6,0.,1.));
 vec3 paper=vec3(.93,.86,.7)*(.9+.1*fbm(pp*.05))*(1.-.25*fbm(pp*.008));paper=mix(paper,vec3(.55,.38,.2),smoothstep(.72,.78,fbm(pp*.03+9.))*.35);vec3 pa=sat(o,.55)*paper*1.08;pa*=1.-.45*smoothstep(.55,1.05,r)*vec3(.6,.8,1.);
 if(m==0)x=gru;else if(m==1)x=lk;else if(m==2)x=pa;else{x=sat(o,.7)*mix(vec3(1.),paper,.6)*1.1;x=x*(.85+.3*gg)*(1.-.25*stn)+scr*.2;x=screen(x,clamp(leak*.6,0.,1.));x*=1.-.35*smoothstep(.45,1.,r);}
 return vec4(clamp(mix(o,x*wc,u_p1),0.,1.),1.);`,
  'Topaz Texture Effects look: seeded procedural layers: grunge (blotchy fbm texture, stains, scratches, specks, edge burn), light leaks (warm orange / magenta / gold glows screened in from random edges), old paper (desaturated image multiplied onto stained fibrous paper with foxing and brown edges), and a vintage combo of all three, tinted by Warmth (approx.)',1);
