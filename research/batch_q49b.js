/* ================= q49b: Filter Forge textures + Magic Bullet Looks tools (round 18) ================= */
f = add('Materials');
f('q49_ff_textures','Filter Forge Textures (Iris / Swiss Cheese / Ceiling Tile / Tactile Paving / Solar Panels / Manhole / Petri Dish)',
  [S('Style',['Iris of the eye','Swiss cheese','Acoustic ceiling tile','Tactile warning paving','Solar panels','Manhole cover','Agar plate petri dish']),P('Scale',.25,4,1,.05),P('Wear',0,1,.4,.01),P('Image blend',0,1,0,.01)],
  `int sy=int(u_p0+.5);vec2 W=u_res/u_k;float md=min(W.x,W.y);float sc=u_p1,wr=u_p2;float hh[3];vec3 alb=vec3(.5);float gl=0.;
 for(int k=0;k<3;k++){vec2 p=PX(uv)+(k==1?vec2(1.,0.):k==2?vec2(0.,1.):vec2(0.));vec2 cp=(p-W*.5)/md;float h=0.;vec3 a=vec3(.5);float sp=0.;
  if(sy==0){vec2 e=cp/(.42*sc);float r=length(e);float an=atan(e.y,e.x);float pu=.28+.08*(wr-.4);
   float hi=floor(hash(vec2(5.,9.))*4.);vec3 ic=hi<1.?vec3(.22,.42,.68):hi<2.?vec3(.32,.5,.28):hi<3.?vec3(.42,.25,.1):vec3(.5,.4,.18);
   float fib=vnoise(vec2(cos(an),sin(an))*22.+r*2.5);float fib2=vnoise(vec2(cos(an),sin(an))*60.+r*6.);
   vec3 col=ic*(.45+.7*fib+.3*fib2);col=mix(col,ic*1.6+.12,exp(-pow((r-pu-.16)/.045,2.))*.55);col*=.55+.45*smoothstep(pu,pu+.12,r);
   col*=1.-.45*smoothstep(.62,.72,fbm(rot(e,.5)*9.+3.))*smoothstep(pu+.05,pu+.15,r);col*=1.-.8*smoothstep(.82,1.,r);
   float vn=smoothstep(.035,0.,abs(fbm(e*5.+7.)-.5))*smoothstep(1.05,1.7,r);vec3 scl=mix(vec3(.95,.93,.9),vec3(.78,.22,.18),vn*(.4+.6*wr));
   a=r<pu?vec3(.015):r<1.?col:scl;h=r<1.&&r>pu?fib*2.:0.;vec2 sq=e-vec2(-.3,.32);sp=exp(-dot(sq,sq)/.006);}
  else if(sy==1){float cz=md*.12*sc;vec2 q=p/cz;vec2 ci=floor(q);float hd=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));if(hash(cc+11.)>.3+.6*wr)continue;vec2 ct=cc+.2+.6*hash2(cc);float rd=.12+.33*hash(cc+5.);float d=length(q-ct)/rd;if(d<1.)hd=max(hd,sqrt(1.-d*d)*rd);}
   a=vec3(.98,.83,.36)*(.9+.12*vnoise(p*.05))*(1.-.3*step(.001,hd));h=-hd*cz*.8+vnoise(p*.3)*.6;}
  else if(sy==2){float tl=md*.5*sc;vec2 fq=fract(p/tl);vec2 ed=min(fq,1.-fq)*tl;float e=min(ed.x,ed.y);
   float fs=abs(fbm(p*.045+vec2(hash(floor(p/tl))*50.))-.5);float wm=smoothstep(.035,0.,fs)*step(.45,vnoise(p*.02+9.));vec2 pc6=floor(p/6.);vec2 pq=p-pc6*6.-1.5-3.*hash2(pc6);float pin=step(.55,hash(pc6+2.))*smoothstep(1.4,.9,length(pq));
   a=e<3.?vec3(.88,.88,.86):vec3(.93,.92,.89)*(.92+.08*vnoise(p*.7))*(1.-.35*wm)*(1.-.45*pin);a*=mix(vec3(1.),vec3(.85,.74,.52),wr*smoothstep(.55,.8,fbm(p*.004+2.)));
   h=e<3.?5.:-2.+2.*smoothstep(3.,9.,e)-wm*1.5-pin*1.5+vnoise(p*.7)*.5;}
  else if(sy==3){float cz=md*.08*sc;vec2 fq=fract(p/cz)-.5;float d=length(fq);float dm=smoothstep(.34,.2,d);vec2 g=fract(p/(cz*6.));float jt=min(min(g.x,1.-g.x),min(g.y,1.-g.y))*cz*6.;
   a=vec3(.95,.76,.08)*(.85+.15*vnoise(p*.3));a*=1.-wr*.55*fbm(p*.02+4.)*(1.-dm*.6);if(jt<1.5)a=vec3(.25);h=dm*cz*.16+vnoise(p*.5)*.4-(jt<1.5?2.:0.);}
  else if(sy==4){float cz=md*.1*sc;vec2 pc=p/cz;vec2 pid=floor(pc/vec2(6.,10.));vec2 ip=pc-pid*vec2(6.,10.);float e=min(min(ip.x,6.-ip.x),min(ip.y,10.-ip.y))*cz;
   vec2 cf=fract(ip);float ce=min(min(cf.x,1.-cf.x),min(cf.y,1.-cf.y))*cz;float cr=hash(floor(p/(cz*.13)+vnoise(p*.04)*2.));
   if(e<4.){a=vec3(.74,.75,.77);h=4.;}else if(ce<1.){a=vec3(.84,.86,.9);h=0.;}else{a=vec3(.06,.12,.3)*(.7+.6*cr);float bb=abs(fract(cf.x*3.)-.5)*cz/3.;if(bb<.4)a=vec3(.68,.7,.72);
    float fg=abs(fract(cf.y*18.)-.5)*cz/18.;if(fg<.2)a=mix(a,vec3(.5),.15);a+=.22*vec3(.55,.7,.95)*smoothstep(-.3,.6,cp.y-cp.x*.3);h=1.;sp=.3;}
   a=mix(a,vec3(.6,.55,.5),wr*.45*fbm(p*.01+6.));}
  else if(sy==5){vec2 e=cp/(.44*sc);float r=length(e);float an=atan(e.y,e.x);
   if(r>1.12){a=vec3(.22)*(.7+.6*vnoise(p*.9))+step(.86,hash(floor(p/2.)))*.12;h=vnoise(p*.9)*1.5;}
   else if(r>1.){a=vec3(.36,.35,.34);h=r<1.015?-3.:2.;}
   else{a=vec3(.27,.26,.25)*(.85+.3*vnoise(p*.5));float rz=0.;if(r<.3)rz=step(.5,fract(r*22.));else if(r>.84)rz=step(.88,r)*step(r,.97)*(.6+.4*step(.45,vnoise(vec2(cos(an),sin(an))*14.)));
    else{vec2 g=rot(e,.7853982)*9.;vec2 gf=abs(fract(g)-.5);rz=step(max(gf.x,gf.y),.3);}h=rz*3.;a+=.13*rz*(1.-wr);}
   a=mix(a,vec3(.47,.26,.12),wr*smoothstep(.5,.78,fbm(p*.012+1.)));}
  else{vec2 e=cp/(.45*sc);float r=length(e);vec3 ag=hash(vec2(2.,4.))<.5?vec3(.8,.55,.2):vec3(.55,.08,.07);
   if(r>1.06){a=vec3(.15,.16,.18)*(.85+.3*vnoise(p*.2));}else if(r>1.){a=vec3(.72,.75,.78);h=3.*(1.-abs((r-1.03)/.03));sp=.5;}
   else{a=ag*(.85+.15*vnoise(p*.05))*(1.-.25*smoothstep(.6,1.,r));vec2 q=e/.075;vec2 ci=floor(q);
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));if(hash(cc+3.)>.15+.5*wr)continue;vec2 ct=cc+.2+.6*hash2(cc+7.);if(length(ct*.075)>.93)continue;float rd=.12+.3*hash(cc+1.);float d=length(q-ct)/rd;
     if(d<1.){float dh=sqrt(1.-d*d)*4.;if(dh>h){h=dh;a=vec3(.93,.88,.74)*(1.-.15*smoothstep(.3,0.,d))*(1.-.25*smoothstep(.75,1.,d));}}}
    a+=.3*exp(-pow((length(e-vec2(.15,-.15))-.85)/.02,2.));}}
  hh[k]=h;if(k==0){alb=a;gl=sp;}}
 vec3 n=normalize(vec3(hh[0]-hh[1],hh[0]-hh[2],1.));vec3 ld=normalize(vec3(-.5,.6,.65));float df=clamp(dot(n,ld),0.,1.);float spc=pow(clamp(dot(reflect(-ld,n),vec3(0.,0.,1.)),0.,1.),24.);
 vec3 col=clamp(alb*(.3+.8*df)+gl*.9+spc*.12,0.,1.);return vec4(mix(col,overlay(col,O(uv).rgb),u_p3),1.);`,
  'approx. procedural re-creations of Filter Forge library textures (Organic / Techno / Building categories): iris (radial fibres, collarette, crypts, limbal ring, veined sclera), Swiss cheese (random spherical holes), acoustic ceiling tile (T-bar grid, fissures, pinholes, stains), tactile warning paving (truncated domes), solar panels (6x10 cells, busbars, frame), manhole cover (frame, diamond lugs, rust), agar plate petri dish (amber or blood agar, domed colonies); height-field lit; Wear = dirt, rust, hole/colony density; seeded', true);

f = add('Film');
f('q49_mbl_telecinenet','Telecine Net Silk (Magic Bullet Looks)',[P('Size',1,40,10,.5,'px'),P('Strength',0,100,50,1),P('Exposure comp',-2,2,0,.05)],
  [BH('u_p0'), BV('u_p0'),
   `vec3 x=O(uv).rgb;vec3 b=T(uv).rgb;float s=u_p1/100.;float sh=1.-smoothstep(0.,.75,luma(x));vec3 r=x+s*max(b-x,0.)*sh*.9+s*.025*sh;r=mix(r,mix(r,b,.25),s*.3);return vec4(clamp(r*exp2(u_p2),0.,1.),1.);`],
  'Magic Bullet Looks Telecine Net: silk net in the telecine softens the blacks - light from the surroundings (Gaussian, net Size) bleeds into the shadows plus a slight veil and overall softening, scaled by Strength, Exposure Compensation in stops; approx. (Maxon help gives only the parameter meanings)');

f('q49_mbl_shutterstreak','Shutter Streak (Magic Bullet Looks)',[P('Size',0,100,40,1),P('Boost',-3,3,1,.1),P('Falloff',-1,1,0,.05)],
  [`vec3 acc=vec3(0.);for(int i=0;i<48;i++){vec3 s=O(vec2(uv.x,(float(i)+.5)/48.)).rgb;acc+=max(s-.55,0.)*2.2;}return vec4(acc/48.,1.);`,
   `return blur1d(u_tex,uv,vec2(1.,0.),R(3.));`,
   `vec3 x=O(uv).rgb;float e=abs(2.*uv.y-1.);float sz=max(u_p0/100.,.01);float w=clamp((e-(1.-sz))/sz,0.,1.);w=pow(w,exp2(u_p2*1.5)*1.2);vec3 st=T(uv).rgb*w*exp2(u_p1)*1.6;return vec4(clamp(x+st*(1.-x*.5),0.,1.),1.);`],
  'Magic Bullet Looks Shutter Streak: misaligned film gate lets light leak into the top and bottom of the frame - each column\'s highlight energy is smeared from the top and bottom edges toward the middle (Size = reach toward the midpoint, Boost = exposure of the streak in stops, Falloff = softness toward the centre); approx.');

f('q49_mbl_hazeflare','Haze / Flare Uncoated Lens (Magic Bullet Looks)',[P('Spillage',0,100,40,1),P('Softness',0,100,50,1),P('Reach',0,100,50,1),P('Exposure',-4,2,-1,.1)],
  [`vec3 x=O(uv).rgb;vec2 q=abs(uv*2.-1.);float ed=max(q.x,q.y);float sp=u_p0/100.;float m=smoothstep(1.-sp-.1,1.-sp+.25,ed)+sp*sp*.5;return vec4(x*x*clamp(m,0.,1.),1.);`,
   `float r=R(4.+u_p2/100.*u_res.x/u_k*.5);vec4 a=blur1d(u_tex,uv,vec2(1.,0.),r);vec4 b=blur1d(u_tex,uv,vec2(1.,0.),r*.25);return vec4(a.rgb*.6+b.rgb*.4,1.);`,
   `return blur1d(u_tex,uv,vec2(0.,1.),R(1.+u_p1*.4));`,
   `vec3 x=O(uv).rgb;vec3 fl=T(uv).rgb*exp2(u_p3)*2.;vec3 rf=T(1.-uv).rgb*exp2(u_p3+.5)*vec3(1.,.82,.62)*1.2;return vec4(clamp(screen(x,fl+rf),0.,1.),1.);`],
  'Magic Bullet Looks Haze/Flare: light from the image (Spillage: frame edges only at low values, nearly the whole image at high values) spreads horizontally (Reach) with Softness blur, added at Exposure (stops) plus a tinted reflection mirrored through the centre at higher exposure; approx.: matte box options omitted');

f = add('Color');
f('q49_mbl_huenity','Huenity Hue Unification (Magic Bullet Looks)',[P('Strength',0,100,100,1),P('Target hue',0,360,25,1,'deg'),P('Hue range',0,90,20,1,'deg'),P('Feather',0,90,25,1,'deg')],
  `vec3 h=rgb2hsv(c.rgb);float dh=mod(h.x*360.-u_p1+540.,360.)-180.;float w=1.-smoothstep(u_p2,u_p2+max(u_p3,.01),abs(dh));w*=smoothstep(.04,.14,h.y)*smoothstep(.02,.1,h.z);
 h.x=fract((h.x*360.-dh*w*u_p0/100.)/360.+1.);return vec4(hsv2rgb(h),1.);`,
  'Magic Bullet Looks Huenity: hues inside the range around the target (default skin tones) are pulled onto the target, with a feathered falloff zone where they shift partially; low-saturation and black pixels excluded; Strength 0-100%');
