/* ================= q05c: Filter Forge distortions III — slices & glitches, 3-D blocks, spiderwebs; MorphoLibJ Labels To RGB ================= */
f = add('Distort');
f('q05_slicecut','Slice & Glitch Distortions (Multi Slice / Data Bending / Recutter / Image Smasher / Eroding Pixels)',[S('Mode',['Multi slice','Data bending','Recutter','Image smasher','Eroding pixels']),P('Amount',0,1,.5,.01),P('Scale',2,200,24,1,'px'),P('Angle / variant',0,359,40,1,'deg')],
  `int m=int(u_p0+.5);float A=u_p1,Sc=u_p2;vec2 Pp=PX(uv);vec3 col=c.rgb;
  if(m==0){vec2 s=uv;for(int k=0;k<4;k++){float fk=float(k);float y0=hash(vec2(fk,1.))*.9,hh=.04+.16*hash(vec2(fk,2.));if(s.y>y0&&s.y<y0+hh)s.x=fract(s.x+(hash(vec2(fk,3.))-.5)*A*.7);}
    for(int k=0;k<4;k++){float fk=float(k)+10.;float x0=hash(vec2(fk,1.))*.9,hw=.04+.16*hash(vec2(fk,2.));if(s.x>x0&&s.x<x0+hw)s.y=fract(s.y+(hash(vec2(fk,3.))-.5)*A*.7);}col=T(s).rgb;}
  else if(m==1){vec2 bs=vec2(Sc*6.,Sc);vec2 bi=floor(Pp/bs);vec2 sp=Pp;if(hash(bi)<A)sp.x+=(hash(bi+1.)-.5)*Sc*8.;
    if(hash(vec2(floor(Pp.y/2.),7.))<A*.2)sp.x=floor(sp.x/(Sc*3.))*Sc*3.;vec3 s=T(fromPX(sp)).rgb;
    float pm=floor(hash(bi+3.)*6.);if(hash(bi+2.)<A){s=pm<1.?s.gbr:pm<2.?s.brg:pm<3.?s.rbg:pm<4.?s.bgr:pm<5.?s.grb:1.-s;}
    vec3 hc=hsv2rgb(vec3(fract(luma(s)*(2.+6.*hash(bi+4.))+hash(bi+5.)+radians(u_p3)/6.2832),.95,1.));col=mix(s,hc,step(hash(bi+6.),A*.75));col=floor(col*6.+.5)/6.;}
  else if(m==2){vec3 c0=c.rgb;float cut=.06+A*.5;col=c0;float sp=radians(u_p3);for(int i=1;i<=64;i++){float fi=float(i);vec2 qq=Pp+vec2(cos(fi*sp),sin(fi*sp))*fi/64.*Sc*2.;vec3 s=T(fromPX(qq)).rgb;if(length(s-c0)>cut){col=s;break;}}}
  else if(m==3){int v=int(u_p3/90.);float e=exp((A-.5)*4.);vec2 s=uv;float z=v>=2?uv.y:uv.x;float zz=(v==1||v==3)?.5+sign(z-.5)*.5*pow(abs(2.*z-1.),e):pow(z,e);if(v>=2)s.y=zz;else s.x=zz;col=T(s).rgb;}
  else{float n=fbm(Pp/Sc);float g=clamp(length(sobel(uv))*1.5,0.,1.);float er=n*1.1+g*.7-(1.-A)*1.25;float e1=smoothstep(.3,.5,er);
    vec2 jit=(hash2(floor(Pp/2.))-.5)*Sc*1.6*A*e1+(vec2(fbm(Pp/Sc+3.),fbm(Pp/Sc+8.))-.5)*Sc*A*e1*1.5;vec3 s=T(fromPX(Pp+jit)).rgb;
    float e2=smoothstep(.55,.7,er+(hash(floor(Pp/1.5))-.5)*.35);col=mix(s,mix(vec3(.94,.93,.9),s,.15),e2*.9);}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Multi Slice (4 horizontal + 4 vertical seeded bands offset with wrap), Data Bending (block channel permutation / inversion, row smears, luma-to-hue false colour, posterised), Recutter (each pixel replaced by the first pixel along a spiral, Angle = angle speed, whose colour differs by more than the cut force), Image Smasher (power stretch toward one side; Angle 0-89 horizontal, 90-179 horizontal mirrored half, 180-269 vertical, 270-359 vertical half; Amount 0.5 = unchanged), Eroding Pixels (edges and noise-selected areas disperse into scattered pixels and white spatter); approx.',1);

f = add('Stylize');
f('q05_blocks3d','3-D Blocks (Trixelate / Cube Wall / Image Cube)',[S('Mode',['Trixelate','Trixelate (extruded)','Cube wall','Image cube']),P('Size',4,120,24,1,'px'),P('Depth / rotation',0,1,.5,.01),P('Shadow / flip / border',0,1,.5,.01)],
  `int m=int(u_p0+.5);float Sz=u_p1,Dp=u_p2,Sh=u_p3;vec2 Pp=PX(uv);vec3 col=c.rgb;
  if(m<=1){vec2 q=Pp/Sz;vec2 ip=floor(q),fq=fract(q);bool fl=(mod(ip.x+ip.y,2.)>.5)!=(Sh>.5);float fx=fl?1.-fq.x:fq.x;bool ta=fx>fq.y;vec2 ce=ta?vec2(2./3.,1./3.):vec2(1./3.,2./3.);if(fl)ce.x=1.-ce.x;
    col=T(fromPX((ip+ce)*Sz)).rgb;if(m==1){float de=ta?min(min(fq.y,1.-fx),fx-fq.y):min(min(fx,1.-fq.y),fq.y-fx);float bev=smoothstep(0.,.12,de);col*=ta?1.+.3*Dp:1.-.3*Dp;col=mix(col*(ta?1.3:.6),col,mix(1.,bev,Dp));}}
  else if(m==2){float cs=Sz*2.;vec2 o=vec2(-.7,.7);vec2 ls=vec2(.75,-.45)*(.5+Sh*1.5);vec2 ip=floor(Pp/cs);float bh=-1.;int kind=0;vec2 bc=vec2(0.);float face=0.;float shd=0.;
    for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 cc=ip+vec2(float(i),float(j));float h=hash(cc)<.7?(.25+.75*hash(cc+1.))*Dp*cs:0.;if(h<=0.)continue;vec2 b0=cc*cs,b1=b0+cs;
      vec2 lo=(Pp-b1)/ls,hi=(Pp-b0)/ls;vec2 tn=min(lo,hi),tx=max(lo,hi);if(max(max(tn.x,tn.y),0.)<=min(tx.x,tx.y)&&min(tx.x,tx.y)>0.&&max(tn.x,tn.y)<h)shd=max(shd,1.-max(max(tn.x,tn.y),0.)/h*.5);
      if(h<=bh)continue;if(all(greaterThanEqual(Pp,b0+h*o))&&all(lessThan(Pp,b1+h*o))){bh=h;kind=1;bc=cc;continue;}
      lo=(Pp-b1)/o;hi=(Pp-b0)/o;tn=min(lo,hi);tx=max(lo,hi);float ta=max(max(tn.x,tn.y),0.),tb=min(min(tx.x,tx.y),h);if(ta<=tb){bh=h;kind=2;bc=cc;face=tn.x>tn.y?0.:1.;}}
    if(kind==1){vec2 fp=Pp-bh*o;col=T(fromPX(fp)).rgb*1.06;vec2 l=fract(fp/cs);float ed=min(min(l.x,1.-l.x),min(l.y,1.-l.y));col=mix(col*.25,col,smoothstep(.0,.03,ed));}
    else if(kind==2){vec2 fp=clamp(Pp,bc*cs,bc*cs+cs);vec3 e=T(fromPX(fp)).rgb;col=face<.5?e*.45:e*.75;col=mix(col,vec3(.05,.45,.5)*(face<.5?.6:1.),.35);}
    else col*=1.-Sh*.6*shd;}
  else{vec2 p=(uv-.5)*vec2(asp(),1.)*2.;float ay=Dp*2.*PI+.6,ax=-.45;vec3 ro=vec3(0.,0.,6.),rd=normalize(vec3(p,-2.9));
    ro.yz=rot(ro.yz,-ax);rd.yz=rot(rd.yz,-ax);ro.xz=rot(ro.xz,-ay);rd.xz=rot(rd.xz,-ay);vec3 t0=(-1.-ro)/rd,t1=(1.-ro)/rd;vec3 tn=min(t0,t1),tx=max(t0,t1);float a=max(max(tn.x,tn.y),tn.z),b=min(min(tx.x,tx.y),tx.z);
    col=mix(vec3(.96,.58,.22),vec3(1.,.98,.94),smoothstep(-1.,1.,p.y));
    if(a<b&&b>0.){vec3 hp=ro+rd*a;vec3 ah=abs(hp);vec3 n;vec2 fu;if(ah.x>=ah.y&&ah.x>=ah.z){n=vec3(sign(hp.x),0.,0.);fu=vec2(hp.z*sign(hp.x),hp.y);}else if(ah.y>=ah.z){n=vec3(0.,sign(hp.y),0.);fu=vec2(hp.x,-hp.z*sign(hp.y));}else{n=vec3(0.,0.,sign(hp.z));fu=vec2(hp.x*sign(hp.z),hp.y);}
      n.xz=rot(n.xz,ay);n.yz=rot(n.yz,ax);float df=.6+.4*max(dot(n,normalize(vec3(-.4,.6,.7))),0.);col=T(clamp(fu*.5+.5,0.,1.)).rgb*df;float bw=.02+.06*Sh;if(max(abs(fu.x),abs(fu.y))>1.-bw)col=vec3(.85,.62,.22)*df;}}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Trixelate (square cells split along alternating diagonals into flat triangles coloured at their centroids; extruded = lit / shadowed facets with bevels; Shadow > 0.5 flips the diagonals), Cube Wall (random cells extruded toward the viewer as oblique-projected cubes: front faces carry the image, side faces shaded with a teal edge tint, cast shadows on the wall), Image Cube (ray-cast cube with the image on every face, rotated about Y by Rotation, gold borders, gradient backdrop); approx.',1);

f = add('Render');
f('q05_spiderweb','Spiderweb (Distorted Spiderweb / Wet Net)',[S('Mode',['Distorted spiderweb','Wet net (water drops)']),P('Sides',5,24,13,1),P('Spacing',.01,.1,.032,.001),P('Distortion',0,1,.4,.01)],
  `int m=int(u_p0+.5);float Nn=floor(u_p1+.5),Sp=u_p2,Ds=u_p3;vec2 W=u_res/u_k;float U=W.y;vec2 Pp=PX(uv);vec2 p=(Pp-W*.5)/U;p-=(hash2(vec2(3.,5.))-.5)*.1*Ds;
  p+=(vec2(fbm(p*2.5+1.),fbm(p*2.5+7.))-.5)*Ds*.12;float r=length(p),a=atan(p.y,p.x)+PI;float sw=2.*PI/Nn;float k=floor(a/sw);float t=fract(a/sw);
  float lw=1.1/U;float dRad=r*sin(min(t,1.-t)*sw);float rad=smoothstep(lw*1.6,lw*.4,dRad)*step(.012,r);
  float rp=r*cos((t-.5)*sw)/cos(.5*sw)+Sp*.22*sin(PI*t)*(1.+Ds);float spv=rp/Sp+(k+t)/Nn;float ring=floor(spv);float fr=fract(spv);float dR=min(fr,1.-fr)*Sp*.9;
  float rid=fr<.5?ring:ring+1.;float Rm=.42+.06*sin(a*3.+Ds*5.);float ok=step(.05,r)*step(r,Rm)*step(Ds*.3,hash(vec2(rid,k)));
  float rng=smoothstep(lw*1.4,lw*.3,dR)*ok;float web=max(rad,rng);vec3 bg=c.rgb*.3;vec3 col=mix(bg,vec3(.93,.94,.95),web*.95);
  if(m==1){float bs=Sp*.55;float arc=(k+t)*sw*r/bs;float bi=floor(arc+.5);float da=(arc-bi)*bs;float br=Sp*(.06+.14*hash(vec2(bi,rid+k*31.)));float dd=length(vec2(da,dR));
    if(ok>.5&&dd<br&&hash(vec2(bi,rid+k*17.))<.75){float z=sqrt(1.-dd*dd/(br*br));vec2 nn=vec2(da,fr<.5?-dR:dR)/br;vec3 s=T(uv-nn*br*U*u_px*u_k*2.).rgb*.6;float hl=pow(max(0.,dot(normalize(vec3(nn,z)),normalize(vec3(-.4,.5,.8)))),30.);col=s+vec3(.15)*z+hl*.9;}
    else{float dr=r*sin(min(t,1.-t)*sw);float bi2=floor(r/bs+.5);float dd2=length(vec2(r-bi2*bs,dr));float br2=Sp*(.05+.1*hash(vec2(bi2,k+3.)));if(dd2<br2&&r>.06&&hash(vec2(bi2,k))<.6){float z=sqrt(1.-dd2*dd2/(br2*br2));col=c.rgb*.18+vec3(.2)*z+pow(z,12.)*.7;}}}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Distorted Spiderweb / Wet Net: orb web drawn procedurally - N radial threads plus a sagging spiral (chords between radials bowed toward the hub, one ring per turn), seeded gaps and fbm distortion, over the image dimmed to 30% (FF draws it on transparency); Wet Net adds refracting, highlighted water beads strung along the threads; approx.',1);

f = add('Analysis');
f('q05_labels2rgb','Labels To RGB (MorphoLibJ)',[S('Label source',['Gray level 0-255','Packed RGB 24-bit']),S('Colormap',['Golden angle','Glasbey-like (hashed)','Jet','Spectrum','Fire']),S('Shuffle',['No','Yes']),S('Background',['Black','White','Gray'])],
  `vec3 v=c.rgb;float lab=u_p0<.5?floor(luma(v)*255.+.5):floor(v.r*255.+.5)*65536.+floor(v.g*255.+.5)*256.+floor(v.b*255.+.5);
  if(lab<.5)return vec4(u_p3<.5?vec3(0.):u_p3<1.5?vec3(1.):vec3(.5),1.);
  float mx=1.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 w=T((vec2(float(i),float(j))+.5)/16.).rgb;mx=max(mx,u_p0<.5?floor(luma(w)*255.+.5):floor(w.r*255.+.5)*65536.+floor(w.g*255.+.5)*256.+floor(w.b*255.+.5));}
  float key=u_p2>.5?floor(hash(vec2(lab,7.31))*(mx-1.)+1.):lab;float tN=clamp(key/mx,0.,1.);int cm=int(u_p1+.5);vec3 col;
  if(cm==0)col=hsv2rgb(vec3(fract(key*.38196601),mod(key,3.)<1.?1.:.75,mod(floor(key/3.),2.)<1.?1.:.7));
  else if(cm==1){vec3 h=vec3(hash(vec2(key,1.)),hash(vec2(key,2.)),hash(vec2(key,3.)));h=u_p2>.5?h:vec3(fract(sin(key*12.9898)*43758.5453),fract(sin(key*78.233)*43758.5453),fract(sin(key*37.719)*43758.5453));col=mix(h,h/max(max(h.r,h.g),max(h.b,.01)),.6);}
  else if(cm==2)col=clamp(1.5-abs(4.*tN-vec3(3.,2.,1.)),0.,1.);
  else if(cm==3)col=hsv2rgb(vec3(tN*.85,1.,1.));
  else col=clamp(vec3(tN*3.,tN*3.-1.,tN*3.-2.),0.,1.);
  return vec4(col,1.);`,
  'MorphoLibJ Labels To RGB: label image (gray level 0-255, or 24-bit packed RGB) -> colour per label from a LUT (golden-angle hues, Glasbey-like hashed distinct colours, Jet, Spectrum, Fire scaled to the largest label found on a 16x16 sample grid); label 0 = background colour; Shuffle permutes label -> colour pseudo-randomly (seeded); Glasbey here is hashed, not the optimised Glasbey table; approx.',1);
