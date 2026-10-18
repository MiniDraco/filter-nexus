/* ================= q20: Corel PHOTO-PAINT effects + PaintShop Pro (scripting-API names) ================= */
f = add('Stylize');
f('q20_cpp_creative','Corel PHOTO-PAINT Creative (The Boss / Smoked Glass / Psychedelic / Whirlpool / Wet Paint)',
  [S('Effect',['The Boss','Smoked Glass','Psychedelic','Whirlpool','Wet Paint (light drips)','Wet Paint (dark drips)']),P('Amount',0,100,50,1,'%'),P('Size',2,120,20,1,'px'),P('Angle / twist',0,360,135,1,'deg')],
  `int m=int(u_p0+.5);float A=u_p1/100.,Sz=u_p2,an=radians(u_p3);vec2 Pp=PX(uv);vec2 W=u_res/u_k;vec3 col=c.rgb;
  if(m==0){float dl=Pp.x,dr=W.x-Pp.x,db=Pp.y,dt=W.y-Pp.y;float d=min(min(dl,dr),min(db,dt));vec2 nI=d==dl?vec2(1.,0.):d==dr?vec2(-1.,0.):d==db?vec2(0.,1.):vec2(0.,-1.);
    float t=clamp(d/Sz,0.,1.);if(t<1.){float u=1.-t;float sl=u/sqrt(max(1.-u*u,.02))*(.4+1.6*A);vec3 n=normalize(vec3(-nI*sl,1.));vec3 Lt=normalize(vec3(cos(an),sin(an),1.));
      float df=dot(n,Lt)-Lt.z;float sp=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),24.);col=c.rgb*(1.+1.1*df)+sp*.55;}}
  else if(m==1){vec3 b=vec3(0.);float w=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 o=vec2(float(i),float(j))*.25;float g=exp(-2.*dot(o,o));b+=O(uv+fromPX(o*Sz*.5)).rgb*g;w+=g;}b/=w;
    col=mix(b,b*vec3(.30,.27,.24)+vec3(.05,.045,.04),A);}
  else if(m==2){vec3 v=c.rgb*1.6+A*2.;col=.5+.5*cos(6.2832*(v+vec3(0.,.33,.67)));col=mix(c.rgb,col,.35+.65*smoothstep(0.,.25,A+.02));}
  else if(m==3){float Sp=Sz*3.;float tw=an*.25;vec3 acc=c.rgb;float wsum=1.;
    for(int s=0;s<2;s++){vec2 q=Pp;float sg=s==0?1.:-1.;for(int i=1;i<=12;i++){vec2 g=q/Sp;vec2 ip=floor(g);vec2 v=vec2(0.);
      for(int jj=-1;jj<=1;jj++)for(int ii=-1;ii<=1;ii++){vec2 cc=ip+vec2(float(ii),float(jj));vec2 ct=cc+.2+.6*hash2(cc);vec2 dv=g-ct;float rot_=mod(cc.x+cc.y,2.)<.5?1.:-1.;v+=rot_*vec2(-dv.y,dv.x)*exp(-3.*dot(dv,dv));}
      v=rot(v,tw);float lv=length(v);if(lv<1e-4)break;q+=sg*v/lv*(A*Sz*.12+.5);float wt=1.-float(i)/13.;acc+=O(fromPX(q)).rgb*wt;wsum+=wt;}}
    col=acc/wsum;float st=vnoise(Pp*vec2(.9,.15)/max(Sz*.05,.5));col*=.94+.12*st;}
  else{float wl=Sz*3.*(.25+.75*hash(vec2(floor(Pp.x),7.)));float l0=luma(c.rgb);bool lt=m==4;
    for(int i=1;i<=32;i++){float d=wl*float(i)/32.;vec3 s=O(fromPX(Pp+vec2(0.,d))).rgb;float l=luma(s);bool wet=lt?(l>1.-A*.7&&l>l0+.02):(l<A*.7&&l<l0-.02);
      if(wet){float fd=float(i)/32.;col=mix(c.rgb,s,1.-.35*fd*fd);break;}}}
  return vec4(clamp(col,0.,1.),1.);`,
  'Corel PHOTO-PAINT effects (approx., Corel publishes no formulas): The Boss = raised rounded bevel along the image edge (no selection: whole-image border), Size = width, Amount = height, Angle = light direction, Phong gloss; Smoked Glass = Gaussian blur (Size) under a smoky brown-grey tint (Amount = tint percentage); Psychedelic = per-channel cosine cycling of the colours into electric hues (Amount = level); Whirlpool = image smeared along streamlines of a grid of alternating vortices (Size = spacing, Amount = smear length, Angle = twist) with streak detail; Wet Paint = colours lighter (or darker) than the pixel run downward in drips of random per-column length (Size = drip length, Amount = wetness)');

f = add('Paint');
f('q20_cpp_artstrokes','Corel PHOTO-PAINT Art Strokes (Dabble / Pen and Ink / Water Marker / Wave Paper)',
  [S('Style',['Dabble','Pen and Ink (crosshatch)','Pen and Ink (stipple)','Water Marker','Wave Paper (color)','Wave Paper (B and W)']),P('Brush size',1,20,6,1,'px'),P('Density',0,100,50,1),P('Variation',0,100,40,1)],
  [BH('u_p1*.5'),BV('u_p1*.5'),
  `int m=int(u_p0+.5);float Bs=u_p1,Dn=u_p2/100.,Vr=u_p3/100.;vec2 Pp=PX(uv);vec3 b=T(uv).rgb;float tl=luma(b);vec3 col;vec2 sd=vec2(u_seed*1.37,u_seed*.71);
  vec2 gr=sobelD(uv,max(u_k,1.));float e=0.;{float l0=luma(O(uv).rgb);vec2 e1=fromPX(vec2(1.,0.)),e2=fromPX(vec2(0.,1.));e=length(vec2(luma(O(uv+e1).rgb)-luma(O(uv-e1).rgb),luma(O(uv+e2).rgb)-luma(O(uv-e2).rgb)));}
  if(m==0){float cs=Bs*2.2;vec2 q=Pp/cs;vec2 ip=floor(q);float best=-1.;vec3 dc=b;float edge=1.;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 ct=cc+hash2(cc+sd);float a=hash(cc+sd+3.1)*3.1416;vec2 dv=rot(q-ct,a);dv/=vec2(.95,.45+.25*Dn);float d=length(dv);
      float pr=hash(cc+sd+5.7);if(d<1.&&pr>best){best=pr;vec3 s=T(fromPX(ct*cs)).rgb;s*=1.+(hash(cc+sd+9.)-.5)*.35*Vr;dc=s;edge=d;}}
    col=best<0.?b:dc*(1.-.18*smoothstep(.65,1.,edge))+.06*(1.-edge);}
  else if(m==1||m==2){float sp=1.5+Bs*.6;float tt=clamp(tl*1.6+.12+(Dn-.5)*.5,0.,1.);float ink=0.;
    if(m==1){vec2 d1=vec2(.7071,.7071),d2=vec2(.7071,-.7071);float wob=(vnoise(Pp*.08+sd)-.5)*.6*Vr;
      float h1=abs(fract(dot(Pp,d1)/sp+wob)-.5),h2=abs(fract(dot(Pp,d2)/sp+wob)-.5),h3=abs(fract(Pp.y/sp*.8+wob)-.5);
      ink=max(ink,(1.-smoothstep(.12,.24,h1))*step(tt,.8));ink=max(ink,(1.-smoothstep(.12,.24,h2))*step(tt,.55));ink=max(ink,(1.-smoothstep(.14,.26,h3))*step(tt,.3));ink=max(ink,step(tt,.05));}
    else{float cs=sp*.9;vec2 q=Pp/cs;vec2 ip=floor(q);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 ct=cc+hash2(cc+sd);
      float dk=1.-luma(T(fromPX(ct*cs)).rgb);dk=clamp(dk+(Dn-.5)*.5,0.,1.);if(hash(cc+sd+2.2)<dk*dk*1.3){float rr=.32+.2*Vr*hash(cc+4.4);ink=max(ink,1.-smoothstep(rr-.1,rr,length(q-ct)));}}}
    ink=max(ink,smoothstep(.12,.35,e)*(.4+.6*Vr));col=mix(vec3(.97,.96,.93),vec3(.06),ink);}
  else if(m==3){float cs=Bs*3.;vec2 q=Pp/cs;vec2 ip=floor(q+.5);float a=(hash(ip+sd)-.5)*1.6*Vr+.6;float st=strokeTex(Pp+sd*50.,a,.6/cs,4./cs);
    vec3 pc=floor(sat(b,1.35)*4.+.5)/4.;float cov=clamp((1.-tl)*1.6+.25+Dn*.4,0.,1.);float mk=smoothstep(.25,.45,st*cov+cov*.5);
    float rim=smoothstep(.3,.42,st*cov+cov*.5)-smoothstep(.42,.6,st*cov+cov*.5);col=mix(vec3(.98,.97,.95),pc,mk);col*=1.-.25*rim;col=mix(col,vec3(.08),smoothstep(.15,.4,e)*.7);}
  else{float wv=Bs*1.6;float ph=(Pp.x+sin(Pp.y/(wv*2.3)+vnoise(Pp/(wv*6.))*3.)*wv*.9)/wv;float h=.5+.5*sin(ph*6.2832);float hx=cos(ph*6.2832);
    float sh=hx*(.15+.35*Dn);vec3 base=m==5?vec3(smoothstep(.15,.85,tl)):b;base=mix(base,base*base*1.2,Vr*.4);col=base*(1.+sh)+.03*h;col=mix(col,vec3(.08),smoothstep(.2,.5,e)*.4);}
  return vec4(clamp(col,0.,1.),1.);`],
  'Corel PHOTO-PAINT Art Strokes (approx., no published algorithm): Dabble = random oriented elliptical paint daubs, each filled from the softened image at its centre, topmost by random order; Pen and Ink = black ink on paper, crosshatching (45, -45, horizontal layers by tone) or stippling (random dots, probability ~ darkness^2), ink pool = Sobel outlines; Water Marker = posterised marker colours laid in streaky strokes with darker overlap rims on white; Wave Paper = painting on paper with a wavy ridge texture (relief by Density), colour or black and white', true);

f = add('Sharpen');
f('q20_cpp_smoothsharp','Corel PHOTO-PAINT Directional Smooth / Jaggy Despeckle / Adaptive Unsharp / Directional Sharpen',
  [S('Effect',['Directional Smooth','Jaggy Despeckle','Adaptive Unsharp','Directional Sharpen']),P('Percentage',0,100,60,1,'%'),P('Radius',.5,8,2,.5,'px')],
  `int m=int(u_p0+.5);float A=u_p1/100.,rr=u_p2;vec3 col=c.rgb;vec2 g=sobelD(uv,max(u_k,1.));float gm=length(g);vec2 nn=gm>1e-5?g/gm:vec2(1.,0.);vec2 tg=vec2(-nn.y,nn.x);
  if(m==0){vec3 s=vec3(0.);float w=0.;for(int i=-6;i<=6;i++){float x=float(i)/6.;float gw=exp(-2.5*x*x);vec2 o=gm>.02?tg*x*rr*1.5:vec2(x,0.)*rr*.5;s+=O(uv+fromPX(o)).rgb*gw;w+=gw;}
    vec3 s2=vec3(0.);if(gm<=.02){float w2=0.;for(int i=-6;i<=6;i++){float x=float(i)/6.;float gw=exp(-2.5*x*x);s2+=O(uv+fromPX(vec2(0.,x)*rr*.5)).rgb*gw;w2+=gw;}s=.5*(s/w+s2/w2);}else s/=w;col=mix(c.rgb,s,A);}
  else if(m==1){vec3 s=vec3(0.);float w=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j))/3.;float gw=exp(-2.*dot(o,o));s+=O(uv+fromPX(o*rr)).rgb*gw;w+=gw;}s/=w;
    col=mix(c.rgb,s,A*smoothstep(.05,.4,gm));}
  else if(m==2){vec3 s=vec3(0.),s2=vec3(0.);float w=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j))/3.;float gw=exp(-2.*dot(o,o));vec3 q=O(uv+fromPX(o*rr)).rgb;s+=q*gw;s2+=q*q*gw;w+=gw;}s/=w;s2/=w;
    float sd=sqrt(max(dot(s2-s*s,vec3(.333)),0.));float gain=A*3.*smoothstep(.015,.08,sd)*(1.-.5*smoothstep(.15,.35,sd));col=c.rgb+(c.rgb-s)*gain;}
  else{vec2 o=fromPX(nn*rr*.75);vec3 a=O(uv+o).rgb,b=O(uv-o).rgb;vec3 d2=a+b-2.*c.rgb;col=c.rgb-d2*A*1.4*smoothstep(.01,.08,gm);}
  return vec4(clamp(col,0.,1.),1.);`,
  'Corel PHOTO-PAINT Blur / Noise / Sharpen effects, approx. from the documented intent: Directional Smooth = smoothing along the local edge direction (Sobel tangent) so edges stay crisp; Jaggy Despeckle = soft Gaussian scatter applied only on edges (removes stair-step jaggies in line art and high-contrast images); Adaptive Unsharp = unsharp mask gated by local standard deviation (flat and noisy areas untouched, edge detail accentuated); Directional Sharpen = second derivative taken only across the edge (along the gradient) and subtracted');

f = add('Blur');
f('q20_cpp_spotfilter','Corel PHOTO-PAINT Spot Filter',[P('Radius',5,100,35,1,'%'),P('Feather',0,100,50,1,'%'),P('Blur',0,40,8,.5,'px'),P('Darken',0,100,35,1,'%')],
  [BH('u_p2'),BV('u_p2'),
  `vec2 p=(uv-.5)*vec2(asp(),1.);float r0=u_p0/100.*.5;float d=length(p);float mk=smoothstep(r0,r0*(1.+u_p1/100.*1.5)+.002,d);
  vec3 col=mix(O(uv).rgb,T(uv).rgb,mk)*(1.-u_p3/100.*mk);return vec4(col,1.);`],
  'Corel PHOTO-PAINT Camera > Spot Filter (depth-of-field look): an in-focus circle at the image centre (Radius in % of the half height, soft Feather edge), Gaussian blur outside, light in the surroundings decreased by Darken');

f = add('Materials');
f('q20_cpp_texture','Corel PHOTO-PAINT Textures (Cobblestone / Elephant Skin / Stone / Screen Door)',
  [S('Texture',['Cobblestone','Elephant Skin','Stone','Screen Door']),P('Size',2,80,18,1,'px'),P('Relief',0,100,55,1),P('Light angle',0,360,135,1,'deg')],
  `int m=int(u_p0+.5);float Sz=u_p1,Rf=u_p2/100.;vec2 Pp=PX(uv);float hs[3];float mort=0.;float e=max(Sz*.04,.35);
  for(int k=0;k<3;k++){vec2 pp=Pp+(k==1?vec2(e,0.):k==2?vec2(0.,e):vec2(0.));float h=0.;
    if(m==0){vec2 q=pp/Sz;q+=(vec2(vnoise(q*1.7),vnoise(q*1.7+9.))-.5)*.35;vec2 ip=floor(q);float f1=9.,f2=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));float d=length(q-cc-hash2(cc));if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
      float bd=f2-f1;h=sqrt(smoothstep(0.,.45,bd))*.9+.08*vnoise(q*6.);if(k==0)mort=1.-smoothstep(.03,.09,bd);}
    else if(m==1){vec2 q=pp/Sz;vec2 w=vec2(fbm(q*.6),fbm(q*.6+4.3));float r1=1.-abs(2.*vnoise(q*vec2(1.,2.2)+w*2.)-1.);float r2=1.-abs(2.*vnoise(q*vec2(2.6,1.)*1.7+w*3.+11.)-1.);
      h=-pow(r1,7.)*.9-pow(r2,9.)*.5+.25*fbm(q*3.);}
    else if(m==2){vec2 q=pp/Sz;h=fbm(q*.8)*.8+.25*vnoise(q*4.)+.12*hash(floor(pp*.8));}
    else{float sp=max(Sz*.18,2.);vec2 f_=abs(fract(pp/sp)-.5);float wx=1.-smoothstep(.06,.2,f_.x),wy=1.-smoothstep(.06,.2,f_.y);float ov=mod(floor(pp.x/sp)+floor(pp.y/sp),2.);
      h=max(wx*(ov<.5?1.:.6),wy*(ov<.5?.6:1.));}
    hs[k]=h;}
  vec2 gg=vec2(hs[1]-hs[0],hs[2]-hs[0])/e;float an=radians(u_p3);vec3 Lt=normalize(vec3(cos(an),sin(an),1.2));vec3 n=normalize(vec3(-gg*Sz*(m==3?.08:.22)*Rf*1.6,1.));float df=dot(n,Lt)-Lt.z;
  vec3 col;
  if(m==0){col=c.rgb*(1.+1.3*df);col=mix(col,vec3(.32,.30,.28)*(.6+.5*luma(c.rgb)),mort*.85);}
  else if(m==1){col=mix(c.rgb,vec3(luma(c.rgb))*vec3(.92,.9,.88),.3*Rf)*(1.+1.4*df);}
  else if(m==2){vec3 st=vec3(.62,.6,.57)*(.75+.5*hs[0]);col=mix(c.rgb,c.rgb*st*1.5,.35*Rf)*(1.+1.2*df);}
  else{float wire=hs[0];col=mix(c.rgb,vec3(.5),.12*Rf);col=mix(col,vec3(.18,.18,.17)*(1.+df*2.),wire*(.35+.6*Rf));}
  return vec4(clamp(col,0.,1.),1.);`,
  'Corel PHOTO-PAINT Texture effects (approx., procedural, Corel ships its own maps): Cobblestone = warped Voronoi stones (F2 - F1 domes) with mortar joints, lit relief over the image; Elephant Skin = domain-warped ridged-noise wrinkles embossed and slightly desaturated; Stone = fbm + speckle granite relief with stone tint; Screen Door = woven fine wire mesh (period ~ Size x 0.18) over a slightly flattened image');

/* ---------- PaintShop Pro ---------- */
f = add('Paint');
f('q20_psp_artmedia','PaintShop Pro Black Pencil / Colored Chalk / Brush Strokes / Colored Edges',
  [S('Effect',['Black Pencil','Colored Chalk','Brush Strokes','Colored Edges']),P('Detail',1,100,50,1),P('Opacity',0,100,100,1),P('Angle',0,359,102,1,'deg')],
  [BH('1.5'),BV('1.5'),
  `int m=int(u_p0+.5);float Dt=u_p1/100.,Op=u_p2/100.,an=radians(u_p3);vec2 Pp=PX(uv);vec3 b=T(uv).rgb;float tl=luma(b);vec3 o=O(uv).rgb;vec3 col;vec2 sd=vec2(u_seed*1.37,u_seed*.71);
  float e;{vec2 e1=fromPX(vec2(1.,0.)),e2=fromPX(vec2(0.,1.));e=length(vec2(luma(T(uv+e1).rgb)-luma(T(uv-e1).rgb),luma(T(uv+e2).rgb)-luma(T(uv-e2).rgb)));}
  if(m==0){float cs=14.;vec2 ip=floor(Pp/cs);float a=.785+(hash(ip+sd)-.5)*.5;float st=strokeTex(Pp+sd*40.,a,.35,3.2);float st2=strokeTex(Pp+sd*40.+7.,a+1.4,.3,2.6);
    float dk=clamp((1.-tl*1.3)*(.45+.7*Dt),0.,1.);float ink=smoothstep(1.-dk,1.-dk+.25,st)*.85+smoothstep(1.-dk*.6,1.1-dk*.6,st2)*.4*step(.45,dk);
    ink=max(ink,smoothstep(.06,.25,e)*(.5+.5*Dt));col=vec3(.98)-vec3(.92,.92,.9)*clamp(ink,0.,1.);}
  else if(m==1){float cs=22.;vec2 ip=floor(Pp/cs);float a=.6+(hash(ip+sd)-.5)*.7;float st=strokeTex(Pp+sd*40.,a,.12,1.1);float gr=hash(floor(Pp*.9)+sd);
    float cov=clamp(tl*1.25+.15,0.,1.);float ch=smoothstep(.15,.6,st*cov*1.4+cov*.3)*(.75+.25*gr);vec3 pap=vec3(.07,.07,.08);col=mix(pap,sat(b,1.35)*1.1+.05,ch);col=mix(col,pap,smoothstep(.1,.35,e)*(.3+.6*Dt));}
  else if(m==2){float hs[3];for(int k=0;k<3;k++){vec2 pp=Pp+(k==1?vec2(.7,0.):k==2?vec2(0.,.7):vec2(0.));vec2 ip=floor(pp/12.);float a=-.6+(hash(ip+sd)-.5)*.9;vec2 r_=rot(pp+sd*30.,a);
      hs[k]=vnoise(r_*vec2(.08,1.1))*.6+vnoise(r_*vec2(.03,.35)+5.)*.4*(.4+.6*Dt);}
    vec2 gg=vec2(hs[1]-hs[0],hs[2]-hs[0])/.7;vec3 n=normalize(vec3(-gg*2.5,1.));vec3 Lt=normalize(vec3(cos(an),sin(an),1.));float df=dot(n,Lt)-Lt.z;
    col=b*(1.+.9*df)+vec3(.31)*max(df,0.)*.8;}
  else{col=b+.12;col=mix(col,vec3(0.),clamp(e*(1.5+6.*Dt),0.,1.));}
  return vec4(clamp(mix(o,col,Op),0.,1.),1.);`],
  'PaintShop Pro Art Media / Artistic effects (CmdArtistic; approx., Corel publishes no algorithm): Black Pencil = fine dark pencil strokes (two hatching directions, count and darkness by Detail) plus edges on white; Colored Chalk = wide chalk strokes in the image colours with grainy coverage on dark paper; Brush Strokes = softened image with bristle-stroke relief lit from Angle (light colour grey 80, Detail = stroke density); Colored Edges = slightly blurred, brightened image (Luminance) with edges darkened in the edge colour (black, Intensity = Detail); Opacity mixes with the original', true);

f = add('Distort');
f('q20_psp_geometric','PaintShop Pro Curlicues / Magnifying Lens / Sunburst',
  [S('Effect',['Curlicues (clockwise)','Curlicues (counter-clockwise)','Magnifying Lens','Sunburst']),P('Strength',0,100,50,1),P('Size',0,100,50,1),P('Center X',0,100,50,1,'%')],
  `int m=int(u_p0+.5);float St=u_p1/100.,Sz=u_p2/100.;vec2 Pp=PX(uv);vec2 W=u_res/u_k;vec3 col=c.rgb;
  if(m<=1){float n=floor(3.+17.*Sz+.5);vec2 cell=W/n;vec2 q=Pp/cell;vec2 ip=floor(q);vec2 lc=(fract(q)-.5)*cell;float Rr=.5*min(cell.x,cell.y);float r=length(lc);
    vec2 sp=Pp;if(r<Rr){float t=1.-r/Rr;float a=(m==0?-1.:1.)*St*12.566*t*t;sp=(ip+.5)*cell+rot(lc,a);}col=O(fromPX(sp)).rgb;}
  else if(m==2){vec2 C=vec2(W.x*u_p3/100.,W.y*.5);float Rr=min(W.x,W.y)*(.12+.38*Sz);vec2 dv=Pp-C;float r=length(dv)/Rr;
    if(r<1.){float mg=.55+.3*r*r;vec3 s=O(fromPX(C+dv*mg)).rgb;float hl=pow(max(0.,1.-length(dv/Rr-vec2(-.35,.4))*1.6),3.);col=s*(1.-.15*r*r*r)+hl*.35;}
    else{col=c.rgb*(1.-St*.9);}float rim=smoothstep(.93,.97,r)*(1.-smoothstep(1.03,1.08,r));vec3 metal=vec3(.55,.55,.58)*(.6+.6*clamp(dv.y/Rr,-1.,1.)*.5+.3);col=mix(col,metal,rim);}
  else{vec2 C=vec2(W.x*u_p3/100.,W.y*.83);vec2 dv=Pp-C;float md=min(W.x,W.y);float r=length(dv)/md;float a=atan(dv.y,dv.x);float dens=4.+60.*Sz;
    float ry=pow(vnoise(vec2(a/6.2832*dens,0.)*2.+3.),3.)+.5*pow(vnoise(vec2(a/6.2832*dens*2.3,5.)),4.);float glow=.8*exp(-r*7.)+.25*exp(-r*2.);float rays=ry*St*1.6*exp(-r*1.8);
    float circ=0.;for(int i=1;i<=3;i++){vec2 gc=C+(W*.5-C)*(.5+.45*float(i));float rd=md*(.03+.025*float(i));float dd=length(Pp-gc);circ+=.12*smoothstep(rd,rd*.6,dd);}
    vec3 lt=vec3(1.,.97,.9)*(glow+rays+circ);col=1.-(1.-c.rgb)*(1.-clamp(lt,0.,1.));}
  return vec4(clamp(col,0.,1.),1.);`,
  'PaintShop Pro Distortion Curlicues (CmdGeometry: grid of N x N cells, N = 3..20 by Size, each a swirl of its inscribed circle growing toward the centre, Strength = twist, clockwise or counter-clockwise), Artistic Magnifying Lens (lens at Center X, mid height, radius by Size: magnified with spherical edge falloff, metal rim and glass highlight, outside darkened by Strength; defocus and frame repositories not modelled) and Illumination Sunburst (light at Center X, 17 % from the top as in the PSP default: glow, rays of density Size and brightness Strength, light circles toward the centre, screen-blended); approx.');

f = add('Repair');
f('q20_psp_makeover','PaintShop Pro Makeover: Thinify / Toothbrush',
  [S('Tool',['Thinify','Toothbrush']),P('Strength',1,100,50,1),P('X',0,100,50,1,'%'),P('Y',0,100,50,1,'%')],
  `int m=int(u_p0+.5);float St=u_p1/100.;vec3 col;
  if(m==0){float x0=u_p2/100.;float hw=max(min(x0,1.-x0),.15);float u=(uv.x-x0)/hw;float au=abs(u);float sx=uv.x;if(au<1.){float k=St*1.5;sx=x0+hw*u*(1.+k*(1.-au)*(1.-au));}col=O(vec2(clamp(sx,0.,1.),uv.y)).rgb;}
  else{vec2 p0=vec2(u_p2,u_p3)/100.;float d=length((uv-p0)*vec2(asp(),1.));float reg=1.-smoothstep(.07,.13,d);vec3 hv=rgb2hsv(c.rgb);
    float hd=abs(hv.x-.11);float tooth=smoothstep(.3,.5,hv.z)*(1.-smoothstep(.35,.6,hv.y))*(1.-smoothstep(.07,.18,hd)*step(.12,hv.y));float w=reg*tooth*St;
    hv.y*=1.-.85*w;hv.z=mix(hv.z,min(1.,hv.z*1.18+.04),w);col=hsv2rgb(hv);}
  return vec4(clamp(col,0.,1.),1.);`,
  'PaintShop Pro Makeover tools (CmdBase2 scripting names): Thinify = the subject narrowed horizontally around X (central band shows content from farther out, monotonic remap fading to no change at the band edges; Y unused); Toothbrush = whitening of teeth-like pixels (bright, low-saturation or yellowish) inside a soft region around the clicked point X, Y: saturation lowered and value raised by Strength (PSP finds the teeth region from the click itself; approx.)');

f = add('Stylize');
f('q20_psp_mosaic','PaintShop Pro Mosaic - Antique / Mosaic - Glass / Sandstone',
  [S('Effect',['Mosaic - Antique','Mosaic - Glass','Sandstone']),P('Columns / detail',5,100,30,1),P('Grout width / blur',0,10,2,.5,'px'),P('Angle',0,360,315,1,'deg')],
  [BH('u_p2*1.5'),BV('u_p2*1.5'),
  `int m=int(u_p0+.5);float Nc=u_p1,Gw=u_p2;vec2 Pp=PX(uv);vec2 W=u_res/u_k;vec3 col;float an=radians(u_p3);vec3 Lt=normalize(vec3(cos(an),sin(an),1.));
  if(m<=1){float cs=W.x/Nc;vec2 q=Pp/cs;if(m==0)q+=(vec2(vnoise(q*2.3),vnoise(q*2.3+7.))-.5)*.12;vec2 ip=floor(q);vec2 lc=fract(q)-.5;float bd=.5-max(abs(lc.x),abs(lc.y));float gw=Gw/cs;float grout=1.-smoothstep(gw*.5,gw*.5+.6/cs,bd);
    if(m==0){vec3 tc=mix(O(fromPX((ip+.5)*cs)).rgb,T(uv).rgb,.35);tc*=.92+.16*hash(ip);tc*=1.-.08*vnoise(Pp*.35);float sh=dot(normalize(vec3(-lc*smoothstep(.0,.15,.5-bd)*1.2,1.)),Lt)-Lt.z;tc*=1.+.6*sh;
      col=mix(tc,vec3(.62,.58,.5),grout*.9);}
    else{float ec=1.+1.6*dot(lc,lc)*2.;vec2 sp=(ip+.5)*cs+lc*cs*1.7*ec;vec3 s=O(fromPX(sp)).rgb;vec3 n=normalize(vec3(-lc*2.2*ec,1.));float df=dot(n,Lt)-Lt.z;float spc=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),30.);
      s=s*(1.+.5*df)+spc*.35;col=mix(s,vec3(.08),grout*.85);}}
  else{float d=mix(6.,1.,Nc/100.);vec2 g=sobelD(uv,max(d*u_k,1.))*.125;vec3 n=normalize(vec3(-g*12.,1.));float df=dot(n,Lt)-Lt.z;float t=luma(T(uv).rgb);
    vec3 sand=vec3(.80,.66,.47)*(.62+.5*t);float gr=hash(floor(Pp))-.5;float gr2=vnoise(Pp*.6)-.5;col=sand*(1.+1.4*df)+vec3(1.,.95,.85)*max(df,0.)*.4+gr*.07+gr2*.06;}
  return vec4(clamp(col,0.,1.),1.);`],
  'PaintShop Pro Texture effects: Mosaic - Antique = square tiles (column count, symmetric) with slightly irregular joints, each tile its centre colour diffused with the blurred image, worn and bevel-shaded, in light grout of Grout width; Mosaic - Glass = each tile a curved glass block showing a zoomed-out, edge-curved view of its area (glass + edge curvature), Phong highlight, dark gaps; Sandstone = blurred image (Blur) as relief at the Detail scale, lit from Angle, carved in sandstone colour with sand grain; approx.');
