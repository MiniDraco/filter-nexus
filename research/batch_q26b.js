/* ================= q26b: Red Giant (Maxon) Universe effects as single-frame filters ================= */
f = add('Blur');
f('q26_uni_glow','Universe Glows (Glo Fi / Glimmer / Ecto / OverLight / Luster)',
 [S('Effect',['Glo Fi (fractal glow)','Glimmer (star streaks)','Ecto (ghost glow)','OverLight (light leak)','Luster (metal sheen)']),P('Amount',0,2,1,.01),P('Size',1,80,20,1,'px'),P('Threshold',0,1,.75,.01)],
 [`int m=int(u_p0+.5);vec2 p=PX(uv);vec3 o=O(uv).rgb;float l=luma(o);
 if(m==0){float n=fbm(p/max(u_p2*2.,2.));n=clamp((n-.5)*3.+.5,0.,1.);return vec4(o*smoothstep(u_p3-.2,u_p3+.2,l)*n,1.);}
 if(m==1)return vec4(o*smoothstep(u_p3,u_p3+.15,l),1.);
 if(m==2){vec2 dq=(vec2(fbm(p/(u_p2*1.5+2.)),fbm(p/(u_p2*1.5+2.)+19.7))-.5)*u_p2*.8;float k=smoothstep(u_p3-.1,u_p3+.1,luma(O(fromPX(p+dq)).rgb));return vec4(vec3(k),1.);}
 if(m==4)return vec4(vec3(l),1.);
 return vec4(o,1.);`,
  `int m=int(u_p0+.5);if(m==1||m==3)return T(uv);return blur1d(u_tex,uv,vec2(1.,0.),R(m==4?u_p2*.3+2.:u_p2));`,
  `int m=int(u_p0+.5);if(m==1||m==3)return T(uv);return blur1d(u_tex,uv,vec2(0.,1.),R(m==4?u_p2*.3+2.:u_p2));`,
  `int m=int(u_p0+.5);vec2 p=PX(uv);vec3 o=O(uv).rgb;float A=u_p1;vec2 Wd=u_res/u_k;
 if(m==0){vec3 g=T(uv).rgb;float i=luma(g);vec3 gc=mix(vec3(1.,.45,.12),vec3(1.,.97,.9),clamp(i*2.5,0.,1.))*i*1.8*A;return vec4(o+gc,1.);}
 if(m==1){vec3 acc=vec3(0.);float Lp=R(u_p2*3.);for(int k=0;k<3;k++){float an=radians(float(k)*60.+15.);vec2 dr=vec2(cos(an),sin(an));vec3 tint=mix(vec3(1.),hsv2rgb(vec3(.55+float(k)*.08,.5,1.)),.5);
   float sh=.4+1.2*vnoise(vec2(dot(p,vec2(-dr.y,dr.x))*.35,float(k)*7.));
   for(int i=1;i<=24;i++){float t=float(i)/24.;vec2 off=dr*t*Lp*u_px;float w=(1.-t)*(1.-t);acc+=(T(uv+off).rgb+T(uv-off).rgb)*w*tint*sh;}}
  return vec4(o+acc*.08*A+T(uv).rgb*.15*A,1.);}
 if(m==2){vec2 dq=(vec2(fbm(p/12.),fbm(p/12.+5.3))-.5)*u_p2*.5;float g=T(fromPX(p+dq)).r;vec3 gc=mix(vec3(.1,.45,1.),vec3(.8,1.,1.),smoothstep(.35,.9,g))*smoothstep(0.,.6,g)*1.4*A;return vec4(screen(o,clamp(gc,0.,1.)),1.);}
 if(m==3){vec2 q=uv*vec2(asp(),1.);vec3 lk=vec3(0.);float sz=u_p2*.01+.12;for(int k=0;k<3;k++){vec2 h=hash2(vec2(float(k)*3.1,u_seed+1.));vec2 cp=vec2(k==0?-.05:h.x*asp(),k==0?h.y:(k==1?-.05:1.05));float d=length(q-cp);
   vec3 cl=hsv2rgb(vec3(fract(1.02+(u_p3-.75)*.5+float(k)*.07),.85,1.));lk+=cl*exp(-d*d/(sz*sz*(1.+float(k))));}
  vec2 a0=hash2(vec2(u_seed,7.));float bd=abs(dot(q-vec2(a0.x*asp(),0.),normalize(vec2(1.,.6+a0.y))));lk+=vec3(1.,.8,.55)*exp(-bd*bd/(sz*sz*.08))*.5;
  return vec4(mix(o,screen(o,clamp(lk,0.,1.)),clamp(.6*A,0.,1.)),1.);}
 vec2 e=u_px*2.;float gx=T(uv+vec2(e.x,0.)).r-T(uv-vec2(e.x,0.)).r,gy=T(uv+vec2(0.,e.y)).r-T(uv-vec2(0.,e.y)).r;vec3 n=normalize(vec3(-gx*6.,-gy*6.,1.));vec3 Ld=normalize(vec3(-1.,-1.,1.2));
 float df=dot(n,Ld);float sp=pow(max(reflect(-Ld,n).z,0.),24.);vec3 rf=reflect(vec3(0.,0.,-1.),n);float hb=smoothstep(.2,0.,abs(rf.y*.5+(fbm(p/90.)-.5)*.3-.1+(uv.y-.5)*.8));
 vec3 met=mix(vec3(luma(o)),o,.4)*(.45+.75*df)+sp*.6*u_p3+hb*.45*u_p3;return vec4(mix(o,clamp(met,0.,1.),clamp(A,0.,1.)),1.);`],
 'single-frame approximations of Maxon Red Giant Universe glows (help.maxon.net parameter docs): Glo Fi = fractal-noise-gated bright areas blurred, coloured outer orange to inner white by intensity, Boost 1.8, Add blend; Glimmer = soft-thresholded highlights streaked along 3 directions (two half-lengths, quadratic falloff) with noise shimmer and per-streak hue; Ecto = noise-displaced luminance matte blurred and mapped inner/outer colour, displaced again, screened; OverLight = procedural leak (soft colour blobs from the frame edges plus a beam) screened at 60% (the product uses texture presets); Luster = luminance treated as a bevel height, lit at 135 degrees, metallic tint with specular and a noise-warped horizon highlight band (Threshold = highlight intensity) (approx.)', true);

f = add('Retro');
f('q26_uni_retro','Universe Retro (MisFire / RetroGrade / Analog / AV Club / Holomatrix II)',
 [S('Effect',['MisFire (film damage)','RetroGrade (8mm film)','Analog (CRT)','AV Club (bad key)','Holomatrix II (hologram)']),P('Damage',0,1,.5,.01),P('Scale',1,10,3,.1,'px'),P('Color amount',0,1,.5,.01)],
 `int m=int(u_p0+.5);vec2 Wd=u_res/u_k;vec2 p=PX(uv);float A=u_p1,Sc=u_p2,Ca=u_p3;vec3 col;
 if(m==0){float gw=(hash(vec2(u_seed,3.))-.5)*10.*A;vec2 q=p+vec2(gw,0.)+(vec2(vnoise(p/40.),vnoise(p/40.+9.))-.5)*4.*A;col=O(fromPX(q)).rgb;
  col=mix(col,.07+col*.86,A);col*=1.+(fbm(p/200.)-.5)*.4*A;float bl=smoothstep(.7,.8,fbm(p/60.+11.))*A;col=mix(col,col*.45,bl*.7);
  vec2 dc=floor(p/2.);float hd=hash(dc+3.);if(hd>1.-.002*A)col=hash(dc+5.)>.5?vec3(.03):vec3(.95);
  if(hash(vec2(floor(p.x),17.))>1.-.004*A)col*=.75+.25*vnoise(vec2(p.x,p.y/60.));
  float xs=hash(vec2(u_seed,21.))*Wd.x+6.*sin(p.y/90.+u_seed);if(abs(p.x-xs)<.8)col=mix(col,vec3(.95),A*smoothstep(0.,1.,uv.y));
  float xd=hash(vec2(u_seed,23.))*Wd.x;if(abs(p.x-xd)<1.2&&A>.3)col=mix(col,vec3(.25,.7,.35),.6);
  vec2 g=floor(p/Sc);col+=(vec3(hash(g),hash(g+1.3),hash(g+2.7))-.5)*.16*A*Ca+(hash(g+4.1)-.5)*.1*A;
  col=sat(col,1.-.3*A);col*=1.-.7*A*pow(length(uv-.5)*1.3,2.5);col*=1.+(hash(vec2(u_seed,9.))-.5)*.15*A;col=(col-.5)*1.1+.5;}
 else if(m==1){float fw=min(Wd.x,Wd.y*4./3.),fh=fw*.75;vec2 d=abs(p-Wd*.5)-vec2(fw,fh)*.5+16.;float sd=length(max(d,0.))+min(max(d.x,d.y),0.)-16.;float mk=smoothstep(0.,14.,-sd);
  vec3 b=vec3(0.);for(int k=0;k<5;k++){vec2 o=k==0?vec2(0.):vec2(float(k-2*(k/2))*2.-1.,float(k/3)*2.-1.)*.7;b+=O(fromPX(p+o)).rgb;}col=b/5.;
  col=mix(col,vec3(luma(col))*vec3(1.1,.97,.78),.5*Ca);col=mix(col,.1+col*.82,.6*A);vec2 g=floor(p/Sc);col+=(hash(g)-.5)*.14*A;
  vec2 dc=floor(p/2.);if(hash(dc+3.)>1.-.0015*A)col=vec3(.05);
  float hx=hash(vec2(u_seed,31.))*Wd.x,hy=hash(vec2(u_seed,32.))*Wd.y;vec2 hp=p-vec2(hx,hy);if(abs(hp.y-12.*sin(hp.x/18.))<.7&&abs(hp.x)<40.)col*=.3;
  col*=1.-.8*pow(length((p-Wd*.5)/vec2(fw,fh)),2.2)*A;col=mix(vec3(.02,.015,.01),col,mk);}
 else if(m==2){vec2 c2=uv-.5;c2*=1.+.18*A*dot(c2,c2);vec2 q=c2+.5;if(any(lessThan(q,vec2(0.)))||any(greaterThan(q,vec2(1.))))return vec4(0.,0.,0.,1.);
  float sp=fromPX(vec2(3.*A,0.)).x;col=vec3(O(q+vec2(sp,0.)).r,O(q).g,O(q-vec2(sp,0.)).b);vec3 gl=vec3(0.);for(int k=0;k<8;k++){float an=float(k)*.785398;gl+=O(q+vec2(cos(an),sin(an))*fromPX(vec2(4.))).rgb;}
  col=sat(col+gl/8.*.25,1.+.3*Ca);vec2 pq=PX(q);float sl=.5+.5*cos(6.2831853*pq.y/Sc);col*=mix(1.,.5+.5*sl,.8);float tr=mod(floor(pq.x),3.);col*=mix(vec3(1.),vec3(tr==0.?1.:.75,tr==1.?1.:.75,tr==2.?1.:.75),.5);
  col+=(hash(pq+u_seed)-.5)*.14*A;float y0=hash(vec2(u_seed,41.))*Wd.y;col+=.1*A*exp(-pow((pq.y-y0)/(Wd.y*.04),2.));}
 else if(m==3){float B=Sc*1.5;vec2 pb=(floor(p/B)+.5)*B;float sep=4.*A;vec3 s=O(fromPX(pb+vec2(sep,-sep))).rgb;float nq=mix(16.,3.,A);s=floor(s*nq+.5)/nq;
  float e=0.;for(int k=0;k<8;k++){float an=float(k)*.785398;e=max(e,length(sobel(uv+vec2(cos(an),sin(an))*R(2.)*u_px)));}e=smoothstep(.45,1.1,e);
  float hu=fract(.85+(vnoise(p/6.)-.5)*.6*Ca);vec3 ec=hsv2rgb(vec3(hu,.8,1.))*(.8+.4*vnoise(p/2.));float sh=smoothstep(.45,1.1,length(sobel(uv-R(6.)*u_px)));
  col=mix(s,s*.35,sh*.6);col=mix(col,ec,e*.75);col+=(hash(p+u_seed)-.5)*.1*A;}
 else{float row=floor(p.y/(Sc*8.));float dx=hash(vec2(row,u_seed))>1.-.35*A?(hash(vec2(row,u_seed+1.))-.5)*50.*A:0.;vec2 q=p+vec2(dx,0.);float sep=4.*A;
  vec3 s=vec3(O(fromPX(q+vec2(sep,0.))).r,O(fromPX(q)).g,O(fromPX(q-vec2(sep,0.))).b);vec3 lr=O(fromPX((floor(q/8.)+.5)*8.)).rgb;s=mix(s,lr,.3*A);
  float l=clamp((luma(s)-.5)*1.3+.5,0.,1.);vec3 tone=l<.5?mix(vec3(0.),vec3(.1,.35,.9),l*2.):mix(vec3(.1,.35,.9),vec3(.65,.92,1.),l*2.-1.);
  col=mix(s,tone,.5+.5*Ca);col+=tone*luma(O(fromPX(q+vec2(14.,0.))).rgb)*.25;float gl=0.;for(int k=0;k<8;k++){float an=float(k)*.785398;gl+=luma(O(fromPX(q+vec2(cos(an),sin(an))*6.)).rgb);}col+=vec3(.2,.5,1.)*smoothstep(.5,1.,gl/8.)*.4;
  col*=.62+.38*(.5+.5*cos(6.2831853*p.y/Sc));col+=(hash(floor(p/1.5)+u_seed)-.5)*.15*A;}
 return vec4(clamp(col,0.,1.),1.);`,
 'single-frame approximations of Maxon Red Giant Universe stylizers (help.maxon.net parameter docs; time-based flicker / weave / frame-rate effects frozen to one seeded state): MisFire = gate weave, warp, fading, funk, splotches, dust, micro / deep / basic scratches, colour + luma grain, desaturation, vignette, flicker, post contrast; RetroGrade = 4:3 rounded faded frame, slight blur, colour process tint, film fading, grain, dust, hair, vignette; Analog = barrel curvature, chroma split, glow, scan lines + RGB triad mask, static, interference bar; AV Club = block pixelate + colour quantize, separated source, hue-noisy dilated edge band, 45 degree shadow, post noise; Holomatrix II = line-band displacement, RGB split, low-res mix, three-tone blue colorize, interference ghost, glow, scan lines, static', true);

f = add('Color');
f('q26_uni_finish','Universe Finish (Finisher / ShrinkRay / ChromaTown / Spectralicious)',
 [S('Effect',['Finisher (contrast + detail)','ShrinkRay (tilt-shift miniature)','ChromaTown (spectral zoom streak)','Spectralicious (6-point colour field)']),P('Amount',0,2,1,.01),P('Radius or spread',1,60,12,1,'px'),P('Angle',-180,180,0,1,'deg')],
 [`int m=int(u_p0+.5);if(m>1)return T(uv);return blur1d(u_tex,uv,vec2(1.,0.),R(u_p2));`,
  `int m=int(u_p0+.5);if(m>1)return T(uv);return blur1d(u_tex,uv,vec2(0.,1.),R(u_p2));`,
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb;float A=u_p1;vec2 Wd=u_res/u_k;vec2 p=PX(uv);
 if(m==0){vec3 b=T(uv).rgb;vec3 c=o+(o-b)*.6*A;c=clamp(c,0.,1.);c=mix(c,smoothstep(0.,1.,c),.6*A*abs(c-.5)*2.);c=(c-.5)*(1.+.12*A)+.5;return vec4(clamp(sat(c,1.+.15*A),0.,1.),1.);}
 if(m==1){vec2 d=rot(p-Wd*.5,radians(u_p3));float fd=abs(d.y)/Wd.y;float mk=smoothstep(.1,.32,fd);vec3 b=T(uv).rgb;b*=1.+.3*A*luma(b);vec3 c=mix(o,b,clamp(mk*A,0.,1.));c=(c-.5)*1.08+.5;return vec4(clamp(sat(c,1.3),0.,1.),1.);}
 if(m==2){vec2 C=Wd*.5;vec3 acc=vec3(0.),ws=vec3(0.);for(int i=0;i<30;i++){float t=(float(i)+.5)/30.;float s=1.+t*.3*A;vec2 q=C+rot(p-C,t*radians(u_p3)*.25)/s;vec3 sp=hsv2rgb(vec3(t*.8,1.,1.));float w=sin(3.14159265*t);acc+=O(clamp(fromPX(q),0.,1.)).rgb*sp*w;ws+=sp*w;}
  return vec4(clamp(acc/ws,0.,1.),1.);}
 vec2 q=uv*vec2(asp(),1.);vec3 acc=vec3(0.);float ws=0.;float ex=2.*30./(u_p2+5.);for(int k=0;k<6;k++){float an=float(k)*1.0471976+radians(u_p3);vec2 cp=vec2(.5*asp(),.5)+vec2(cos(an)*.42*asp(),sin(an)*.42)+(hash2(vec2(float(k),u_seed))-.5)*.15;
  float d=length(q-cp)+1e-3;float w=pow(d,-ex);acc+=hsv2rgb(vec3(float(k)/6.,.85,1.))*w;ws+=w;}
 vec3 g=sat(acc/ws,1.2);return vec4(mix(o,g,clamp(.5*A,0.,1.)),1.);`],
 'single-frame approximations of Maxon Red Giant Universe: Finisher = unsharp detail, enhanced contrast (S-curve on the extremes only), contrast, saturation (the 16 named look LUTs are undocumented and not included); ShrinkRay = rotated focus band, Gaussian blur outside it with highlight gain, saturation and contrast; ChromaTown = 30 samples along a start-to-end zoom (+ rotation) transform tinted by a spectrum and colour-normalised (smooth in/out falloff); Spectralicious = 6 coloured points blended by inverse-distance weights (Spread = Radius), shown over the image at 50% (approx.)', true);
