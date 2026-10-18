/* ================= q18: Ignite Pro / HitFilm effects, Capture One grain, catadioptric / Trioplan bokeh ================= */
f = add('Distort');
f('q18_ignite_distort','Ignite Distortions (Energy / Fluid / Pond Ripple / Smoke / Block / Vortex)',[S('Effect',['Energy Distortion','Fluid Distortion','Pond Ripple','Smoke Distortion','Block Displacement','Vortex Displacement Warp']),P('Amount',0,100,25,1,'px'),P('Scale',10,400,90,1,'px'),P('Variation',0,100,0,1)],
  `vec2 p=PX(uv);float A=u_p1,S=max(u_p2,1.);float ph=u_p3*.731;int m=int(u_p0+.5);vec2 dm=u_res/u_k;vec2 d=vec2(0.);vec3 add_=vec3(0.);float ca=0.;
  if(m==0){vec2 q=p/(S*.6)+ph;vec2 w=vec2(fbm(q),fbm(q+vec2(5.2,1.3)));vec2 qq=q+3.*w;float e=fbm(qq);float ex=fbm(qq+vec2(.04,0.)),ey=fbm(qq+vec2(0.,.04));
   vec2 gr=vec2(ex-e,ey-e)/.04;float rg=1.-abs(2.*e-1.);d=gr*A*.07*(.4+rg*rg);ca=.08;add_=vec3(.25,.55,1.)*pow(rg,6.)*A*.004;}
  else if(m==1){vec2 x=p;for(int i=0;i<5;i++){vec2 q=x/S+ph;float e=fbm(q),ex=fbm(q+vec2(.03,0.)),ey=fbm(q+vec2(0.,.03));vec2 v=vec2(ey-e,-(ex-e))/.03;x+=v*A*.05;}d=x-p;}
  else if(m==2){vec2 c0=dm*.5;vec2 v=p-c0;float r=length(v);vec2 dr=r>1e-3?v/r:vec2(0.);float k=6.2831853/S;float env=exp(-r/(S*3.5));
   float wv=sin(k*r-ph*3.)*env,sl=cos(k*r-ph*3.)*env;d=-dr*A*.45*wv;add_=vec3(.12*sl*min(A/25.,2.));}
  else if(m==3){vec2 q=vec2(p.x/S,p.y/(S*2.2))+ph;float w1=fbm(q+fbm(q*1.7+3.1)*2.);d=vec2(fbm(q*2.3+w1*2.)-.5,fbm(q*2.3+w1*2.+7.7)-.5)*A*1.1;d.y-=A*.35*(w1-.45);}
  else if(m==4){float bh=S*.5;float row=floor(p.y/bh);float bw=S*(.5+1.5*hash(vec2(row,ph+1.)));float sh=hash(vec2(row,ph+2.))*bw;vec2 id=vec2(floor((p.x+sh)/bw),row);
   float h=hash(id+ph+3.);if(h<.55){d=vec2(hash(id+ph+4.)-.5,(hash(id+ph+5.)-.5)*.35)*2.*A*(1.+h);}}
  else{vec2 x=p;vec2 cb=floor(p/S);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=cb+vec2(float(i),float(j));vec2 ctr=(id+.5+(vec2(hash(id+ph),hash(id+ph+9.))-.5)*.6)*S;
    float rad=S*(.55+.4*hash(id+ph+2.));float sp=hash(id+ph+3.)<.5?-1.:1.;vec2 v=x-ctr;float r=length(v);if(r<rad){float fo=1.-r/rad;fo*=fo;x=ctr+rot(v,sp*fo*A*.06);}}d=x-p;}
  vec2 u0=fromPX(p+d);vec3 col;if(ca>0.){col=vec3(O(clamp(fromPX(p+d*(1.+ca)),0.,1.)).r,O(clamp(u0,0.,1.)).g,O(clamp(fromPX(p+d*(1.-ca)),0.,1.)).b);}else col=O(clamp(u0,0.,1.)).rgb;
  return vec4(clamp(col+add_,0.,1.),1.);`,
  'HitFilm / Ignite Pro distortions (approx. of the look; Variation = noise phase): Energy = ridged domain-warped fbm displacement with slight RGB split and blue filament glow; Fluid = 5-step advection along a curl-noise (divergence-free) field; Pond Ripple = damped concentric radial ripples from the centre with slope shading; Smoke = vertically stretched warped fbm wisps; Block = rows of random-width blocks, about half shifted; Vortex = jittered grid of vortices (random spin, quadratic falloff)');

f = add('Render');
f('q18_ignite_light','Ignite Light (Light Streaks / Gleam / Hyperdrive / Dimension Rift)',[S('Effect',['Light Streaks','Gleam','Hyperdrive','Dimension Rift']),P('Threshold or density',0,1,.75,.01),P('Length',10,400,120,1,'px'),P('Angle',0,180,20,1,'°')],
  `int m=int(u_p0+.5);float thr=u_p1;float ang=radians(u_p3);vec3 col=c.rgb;
  if(m<=1){float len=R(u_p2);vec3 acc=vec3(0.);float ws=0.;int nl=m==0?1:3;int nt=m==0?48:24;
   for(int k=0;k<3;k++){if(k>=nl)break;float a=ang+float(k)*1.0471976;vec2 dr=vec2(cos(a),sin(a));
    float spc=len/float(nt);int ns=int(clamp(ceil(spc),1.,4.));float stp=spc/float(ns);
    for(int i=0;i<48;i++){if(i>=nt)break;for(int j=0;j<4;j++){if(j>=ns)break;float x=(float(i)+float(j+1)/float(ns))*spc;float w=exp(-3.5*x/len)/float(ns);
     vec3 s1=O(uv+dr*x*u_px).rgb,s2=O(uv-dr*x*u_px).rgb;float l1=max(s1.r,max(s1.g,s1.b)),l2=max(s2.r,max(s2.g,s2.b));
     float b1=max(l1-thr,0.)/max(1.-thr,.05),b2=max(l2-thr,0.)/max(1.-thr,.05);acc+=(s1*b1*b1+s2*b2*b2)*w;ws+=w;}}}
   vec3 st=acc*(m==0?1.3:1.);
   if(m==1){vec3 gl=vec3(0.);for(int i=0;i<12;i++){float a=float(i)*.5235988;vec2 o=vec2(cos(a),sin(a))*len*.06*u_px;vec3 s=O(uv+o).rgb;float l=max(s.r,max(s.g,s.b));float bb=max(l-thr,0.)/max(1.-thr,.05);gl+=s*bb*bb;}st+=gl/12.*2.;}
   col=screen(col,1.-exp(-st));}
  else if(m==2){vec2 q=(uv-.5)*vec2(asp(),1.);float r=length(q);float an=atan(q.y,q.x)/6.2831853+.5;float H=u_res.y/u_k;
   vec3 zb=vec3(0.);for(int i=0;i<16;i++){zb+=O(.5+(uv-.5)*(1.-.12*float(i)/16.)).rgb;}col=zb/16.*.55;float ls=u_p2/H;vec3 sk=vec3(0.);
   for(int l=0;l<3;l++){float N=180.*float(l+1);float bi=floor(an*N);float da=fract(an*N)-.5;float h0=hash(vec2(bi,float(l)*13.1));
    if(h0<(1.-thr)*.9+.08){float r0=hash(vec2(bi,float(l)*7.3+1.))*.75+.02;float le=ls*(.25+1.5*r0)*(.6+.8*hash(vec2(bi,float(l)+3.)));
     float pd=abs(da)*6.2831853/N*r*H;float inl=smoothstep(r0,r0+.02,r)*(1.-smoothstep(r0+le*.85,r0+le,r));float br=inl*smoothstep(r0,r0+le,r)*exp(-pd*pd/.8);
     sk+=br*mix(vec3(.6,.75,1.),vec3(1.),hash(vec2(bi,float(l)+5.)));}}
   col=screen(col,clamp(sk*1.6,0.,1.));}
  else{vec2 p=PX(uv);vec2 c0=u_res/u_k*.5;vec2 dr=vec2(sin(ang),cos(ang)),nr=vec2(-dr.y,dr.x);float sa=dot(p-c0,dr),ta=dot(p-c0,nr);float Lh=u_p2;
   float env=sqrt(max(1.-(sa/Lh)*(sa/Lh),0.));float jag=1.+.6*(fbm(vec2(sa/(Lh*.12),3.7))-.5);float wd=(thr*.2*Lh+1.)*env*jag;
   float out_=max(abs(ta)-wd,0.);float glo=exp(-out_/(5.+Lh*.05))*smoothstep(0.,.2,env+.05)*step(abs(sa),Lh*1.05);float rim=exp(-out_*out_/8.)*step(.001,env);
   vec2 bp=p+nr*sign(ta)*glo*Lh*.12;vec3 bg=O(clamp(fromPX(bp),0.,1.)).rgb;col=bg;
   if(abs(ta)<wd){vec2 z=vec2(sa,ta)/(Lh*.18);float e=fbm(z+2.*vec2(fbm(z+1.3),fbm(z+4.1)));float ri=abs(ta)/max(wd,1e-3);
    col=mix(vec3(.12,.0,.3),vec3(.3,.8,1.),smoothstep(.4,.8,e))*(.5+.8*e)+vec3(.9,.7,1.)*pow(ri,8.)*.8;}
   col=screen(col,vec3(.5,.3,1.)*glo*.75+vec3(.7,.9,1.)*rim*.8);}
  return vec4(clamp(col,0.,1.),1.);`,
  'HitFilm / Ignite Pro light effects (look approx.): Light Streaks = two-sided streak gathered from the bright-pass along Angle (exponential falloff over Length); Gleam = 6-ray star (3 lines 60 deg apart) + small halo from the bright-pass; Hyperdrive = warp-speed star streaks radiating from the centre (3 angular layers, density from Threshold) over a darkened zoom-blurred plate; Dimension Rift = glowing jagged tear of half-length Length through the centre (Threshold = opening), swirling fbm energy inside, light pushes the plate away from it');

f = add('Stylize');
f('q18_ignite_stylize','Ignite Derez / Dot Matrix',[S('Effect',['Derez (VGHS)','Dot Matrix']),P('Cell size',2,40,8,1,'px'),P('Amount',0,1,.5,.01),P('Variation',0,100,30,1)],
  `int m=int(u_p0+.5);vec2 p=PX(uv);float cs=max(u_p1,1.);float A=u_p2;vec3 col;
  if(m==0){float sw=uv.x*.65+.35*vnoise(p/(cs*6.)+u_p3*.37);float t=clamp(A*1.7-sw,0.,1.);if(t<=0.)return vec4(O(uv).rgb,1.);
   float lv=floor(t*3.);float s2=cs*exp2(lv);vec2 id=floor(p/s2);vec2 ctr=(id+.5)*s2;float h=hash(id+lv*31.+u_p3);
   vec2 off=(vec2(hash(id+5.),hash(id+9.))-.5)*s2*t*1.5;vec3 b=O(clamp(fromPX(ctr+off),0.,1.)).rgb;
   float alive=step(t*1.15-.05,h);vec2 fr=abs(fract(p/s2)-.5);float edge=smoothstep(.36,.5,max(fr.x,fr.y));
   vec3 tint=mix(b,vec3(.3,.95,1.)*(.4+luma(b)),.35*t);col=(tint+edge*vec3(.2,.8,1.)*t*.8)*alive;}
  else{vec2 id=floor(p/cs);vec2 ctr=(id+.5)*cs;vec3 b=(O(fromPX(ctr+cs*vec2(-.25))).rgb+O(fromPX(ctr+cs*vec2(.25))).rgb+O(fromPX(ctr+cs*vec2(-.25,.25))).rgb+O(fromPX(ctr+cs*vec2(.25,-.25))).rgb)*.25;
   float rr=mix(.18,.5,A);float dd=length(p-ctr)/cs;float dot_=1.-smoothstep(rr-.06,rr+.03,dd);float gl=exp(-dd*dd*6.)*u_p3/100.*.6;
   col=b*(dot_*1.15+gl)+vec3(.02)*(1.-dot_);}
  return vec4(clamp(col,0.,1.),1.);`,
  'HitFilm / Ignite Pro (look approx.): Derez (Video Game High School) = left-to-right noisy dissolve front - blocks grow in powers of two, scatter, pick up a cyan rim and drop out to black as Amount (progress) rises; Dot Matrix = round LED dots on a dark panel, each dot coloured by its cell average, Amount = dot size, Variation = dot glow');

f = add('Tone');
f('q18_crushbw','Crush Blacks & Whites',[P('Black point',0,.5,.08,.005),P('White point',.5,1,.92,.005),P('Softness',0,.2,.02,.005)],
  `vec3 y=(c.rgb-u_p0)/max(u_p1-u_p0,.01);float s=max(u_p2,.002);vec3 a=clamp(y/s,-60.,60.),b=clamp((y-1.)/s,-60.,60.);
  vec3 r=s*(log(1.+exp(a))-log(1.+exp(b)));return vec4(clamp(r,0.,1.),1.);`,
  'Ignite Pro / HitFilm Crush Blacks & Whites: values below the black point go to black and above the white point to white, linear stretch between; Softness rounds both knees (softplus clamp)');
f('q18_customgray','Custom Gray (channel weights)',[P('Red',-200,200,30,1,'%'),P('Green',-200,200,59,1,'%'),P('Blue',-200,200,11,1,'%'),S('Normalize',['Yes','No'])],
  `vec3 w=vec3(u_p0,u_p1,u_p2)/100.;float sm=w.r+w.g+w.b;if(u_p3<.5&&abs(sm)>.01)w/=sm;return vec4(vec3(clamp(dot(c.rgb,w),0.,1.)),1.);`,
  'Ignite Pro / HitFilm Custom Gray: monochrome from user channel weights (Normalize divides by their sum so overall brightness is kept)');

f = add('Film');
f('q18_vigexposure','Vignette Exposure',[P('Exposure',-5,3,-2,.05,'EV'),P('Size',0,1.5,.55,.01),P('Softness',.05,1.5,.6,.01),P('Roundness',0,1,1,.01)],
  `vec2 d=(uv-.5)*2.;d.x*=mix(1.,asp(),u_p3);float n=length(mix(vec2(1.),vec2(asp(),1.),u_p3));float r=length(d)/n*1.41421356;
  float fo=smoothstep(u_p1,u_p1+u_p2,r);vec3 l=${LIN('c.rgb')}*exp2(u_p0*fo);return vec4(${SRGB('l')},1.);`,
  'Ignite Pro / HitFilm Vignette Exposure: the edge falloff is applied as an exposure change in linear light (EV x smoothstep of the radius), so highlights brighten/darken like a real exposure rather than a grey overlay; Roundness 1 = circle, 0 = follows the frame');

f = add('Blur');
f('q18_chromauvblur','Chroma UV Blur',[P('Radius',0,60,10,.5,'px'),S('Space',['YUV (BT.601)','YCbCr (BT.709)']),P('Amount',0,1,1,.01)],
  [`vec3 k=u_p1<.5?vec3(.299,.587,.114):vec3(.2126,.7152,.0722);float y=dot(c.rgb,k);vec2 uvv=u_p1<.5?vec2(.492*(c.b-y),.877*(c.r-y)):vec2((c.b-y)/1.8556,(c.r-y)/1.5748);return vec4(y,uvv+.5,1.);`,
   BH('u_p0'),BV('u_p0'),
   `vec3 o=O(uv).rgb;vec3 k=u_p1<.5?vec3(.299,.587,.114):vec3(.2126,.7152,.0722);float y=dot(o,k);vec2 q=T(uv).gb-.5;float b,r;
   if(u_p1<.5){b=y+q.x/.492;r=y+q.y/.877;}else{b=y+q.x*1.8556;r=y+q.y*1.5748;}float g=(y-k.r*r-k.b*b)/k.g;return vec4(clamp(mix(o,vec3(r,g,b),u_p2),0.,1.),1.);`],
  'Ignite Pro / HitFilm Chroma UV Blur: Gaussian blur of the chroma (U,V / Cb,Cr) planes only, luma kept sharp from the input - hides chroma noise / compression blocking');

f = add('Film');
f('q18_c1_grain','Capture One Grain',[S('Type',['Fine','Silver Rich','Soft','Cubic','Tabular','Harsh']),P('Impact',0,100,40,1),P('Granularity',0,100,50,1)],
  `int m=int(u_p0+.5);vec2 p=PX(uv)+u_seed*13.7;float g=mix(.7,3.2,u_p2/100.);float a=u_p1/100.;float l=luma(c.rgb);float n;float w=pow(4.*l*(1.-l),.6);float amp=.16;
  if(m==0){n=(vnoise(p/g)-.5)+.5*(vnoise(p/(g*.5)+17.)-.5);amp=.14;}
  else if(m==1){float n1=vnoise(p/g)-.5,n2=vnoise(p/(g*2.4)+5.)-.5;n=n1+.7*n2;n=n<0.?n*1.35:n*.8;w=pow(1.-l,.35)*pow(max(l,0.),.15)*1.2;amp=.2;}
  else if(m==2){vec2 q=p/(g*1.5);n=(vnoise(q)+vnoise(q+vec2(.5,.31))+vnoise(q*.7+9.))/3.-.5;n*=1.6;amp=.12;}
  else if(m==3){float cg=g*1.6;vec2 id=floor(p/cg);vec2 id2=floor(p/cg+.5);n=(hash(id)-.5)*.75+(hash(id2+7.)-.5)*.5;amp=.15;}
  else if(m==4){vec2 cid=floor(p/(g*5.));float an=hash(cid)*3.1416;vec2 q=rot(p,an)/g;q.y*=3.;n=(vnoise(q)-.5)*1.2+(vnoise(q*vec2(1.,.5)+3.)-.5)*.4;amp=.12;w=pow(4.*l*(1.-l),.9);}
  else{vec2 q=p/(g*.8);n=hash(floor(q))-.5;n+=.6*(vnoise(q*.5+3.)-.5);n=sign(n)*pow(abs(n)*1.6,.7)*.55;amp=.24;w=.35+.65*pow(4.*l*(1.-l),.3);}
  vec3 r=c.rgb+n*a*amp*w*2.;return vec4(clamp(r,0.,1.),1.);`,
  'Capture One Grain tool types (look approx. from the published descriptions): Fine = small even grain; Silver Rich = clumped two-scale silver grain, dark-biased, strongest in shadows/mid; Soft = smooth low-contrast grain; Cubic = blocky crystal grain on two offset grids; Tabular = fine flat T-grain platelets (anisotropic, randomly oriented, low visibility); Harsh = sharp high-contrast grit across all tones. Impact = strength, Granularity = grain size; monochrome luminance grain from the seed', true);

f = add('Blur');
f('q18_bokeh_cata','Mirror-lens Donut / Soap-bubble Bokeh',[S('Lens',['Mirror lens (donut)','Soap bubble (Trioplan)']),P('Radius',2,40,12,.5,'px'),P('Highlight boost',0,4,1.5,.05),P('Ring',0,1,.5,.01)],
  `int ln=int(u_p0+.5);float rad=R(u_p1);float ir=.25+.4*u_p3;vec3 acc=vec3(0.);float ws=0.;
  for(int k=0;k<144;k++){float fk=float(k)+.5;float rho=sqrt(fk/144.);float ph=fk*2.39996323;vec2 s=rho*vec2(cos(ph),sin(ph));float w;
   if(ln==0){w=smoothstep(ir-.04,ir+.04,rho)*(1.+.3*smoothstep(.85,1.,rho));}
   else{w=mix(.4,.12,u_p3)+(1.2+3.*u_p3)*exp(-pow((rho-.94)/.045,2.));}
   vec3 sc=O(uv+s*rad*u_px).rgb;vec3 lc=${LIN('sc')}*(1.+u_p2*smoothstep(.8,1.,max(sc.r,max(sc.g,sc.b))));acc+=lc*w;ws+=w;}
  vec3 bl=acc/max(ws,1e-5);bl=mix(bl,.8+.2*tanh((bl-.8)/.2),step(.8,bl));return vec4(${SRGB('bl')},1.);`,
  'gathered pupil PSFs (144 Vogel-spiral samples, linear light, highlight boost): mirror (catadioptric) lens = annular aperture - the secondary mirror blocks the centre (Ring = obstruction ratio .25-.65) so out-of-focus highlights become donuts with a slightly bright edge; Meyer Trioplan soap bubble = over-corrected spherical aberration piles light into a thin bright rim around a dim disc (Ring = rim strength); uniform blur, approx.');
