/* ================= q05: Filter Forge distortions I — shape mappings, lens arrays, water surfaces, glass looks ================= */
f = add('Distort');
f('q05_shapemap','Shape Mapping (Squircles / Lame Curve / Heart / Sphere Remap)',[S('Mapping',['Elliptical grid','Squelched grid','Vertical squelch','Horizontal squelch','FG-Squircular','2-Squircular','Lame curve','Heart','Remap to sphere (equirect)']),S('Direction',['Square to shape','Shape to square']),P('Power / repeats',.5,8,2,.01),P('Fader / seam blend',0,1,1,.01)],
  `vec2 p=(uv-.5)*2.;int m=int(u_p0+.5);bool toS=u_p1>.5;vec2 q=p;bool outside=false;float x=p.x,y=p.y;
  if(m==8){float lon=(uv.x-.5)*2.*PI,lat=(uv.y-.5)*PI;float tl=2.*PI/max(u_p2,.5);
    #define Q05_SPH(lo) T(fract(vec2((lo)*cos(lat),lat)/tl+.5)).rgb
    float bw=max(u_p3,.001);float t=smoothstep(1.-bw,1.,abs(lon)/PI)*.5;
    return vec4(mix(Q05_SPH(lon),Q05_SPH(lon-sign(lon)*2.*PI),t),1.);}
  if(m<=5){
    if(!toS){float u=x,v=y;if(dot(p,p)>1.)outside=true;else{
      if(m==0){float s2=2.*sqrt(2.);float a=2.+u*u-v*v,b=2.-u*u+v*v;q=vec2(.5*sqrt(max(a+s2*u,0.))-.5*sqrt(max(a-s2*u,0.)),.5*sqrt(max(b+s2*v,0.))-.5*sqrt(max(b-s2*v,0.)));}
      else if(m==1)q=vec2(u/sqrt(max(1.-v*v,1e-4)),v/sqrt(max(1.-u*u,1e-4)));
      else if(m==2)q=vec2(u,v/sqrt(max(1.-u*u,1e-4)));
      else if(m==3)q=vec2(u/sqrt(max(1.-v*v,1e-4)),v);
      else{float w=u*u+v*v;float uv2=u*v;if(abs(uv2)<1e-5)q=p;else{float k=m==4?sqrt(max(w-sqrt(max(w*(w-4.*uv2*uv2),0.)),0.)):sqrt(max(1.-sqrt(max(1.-4.*uv2*uv2,0.)),0.));float sg=sign(uv2)/sqrt(2.);q=vec2(sg/v*k,sg/u*k);}}}}
    else{
      if(m==0)q=vec2(x*sqrt(1.-y*y*.5),y*sqrt(1.-x*x*.5));
      else if(m==1){float dn=sqrt(max(1.-x*x*y*y,1e-4));q=vec2(x*sqrt(max(1.-y*y,0.))/dn,y*sqrt(max(1.-x*x,0.))/dn);}
      else if(m==2)q=vec2(x,y*sqrt(max(1.-x*x,0.)));
      else if(m==3)q=vec2(x*sqrt(max(1.-y*y,0.)),y);
      else if(m==4){float w=x*x+y*y;q=w<1e-6?p:p*sqrt(max(w-x*x*y*y,0.))/sqrt(w);}
      else q=p/sqrt(1.+x*x*y*y);}
  }else{float r=length(p);vec2 dr=r>1e-5?p/r:vec2(1.,0.);float rS=1./max(abs(dr.x),abs(dr.y));float rB;
    if(m==6){float n=u_p2;rB=pow(pow(max(abs(dr.x),1e-6),n)+pow(max(abs(dr.y),1e-6),n),-1./n);}
    else{float lo=0.,hi=1.5;for(int i=0;i<40;i++){float t=float(i)/39.*1.5;vec2 hq=dr*t*1.14+vec2(0.,.125);float a=dot(hq,hq)-1.;if(a*a*a-hq.x*hq.x*hq.y*hq.y*hq.y>0.){hi=t;break;}lo=t;}
      for(int i=0;i<10;i++){float t=.5*(lo+hi);vec2 hq=dr*t*1.14+vec2(0.,.125);float a=dot(hq,hq)-1.;if(a*a*a-hq.x*hq.x*hq.y*hq.y*hq.y>0.)hi=t;else lo=t;}rB=.5*(lo+hi)/1.14*1.14;rB=min(rB,rS);}
    if(!toS){float t=r/rB;if(t>1.)outside=true;q=dr*t*rS;}else{float t=r/rS;q=dr*t*rB;}}
  if(outside&&u_p3>.999)return vec4(0.,0.,0.,1.);
  vec2 sp=mix(p,q,u_p3);if(outside)sp=p;
  return vec4(T(clamp(sp*.5+.5,0.,1.)).rgb,1.);`,
  'Filter Forge Squircles / Lame Curve / Heart Warp / Smooth Remap to Sphere: Fong 2017-19 square<->disc mappings (elliptical grid, squelched grid, vertical/horizontal squelch, FG- and 2-squircular, closed-form both ways), radial Lame-curve (superellipse power: .67 astroid, 1 rhombus, 2 ellipse, >2 rounded rectangle) and implicit-heart ((x2+y2-1)^3 = x2 y3) boundary maps, Fader blends from the identity; sphere remap = flat seamless texture laid out as an equirectangular map with rows widened by 1/cos(latitude) so it shows undistorted on a sphere, seam cross-faded; outside the shape = black');

f('q05_lensarray','Lens Arrays (uberLENS / Art Deco Glass Blocks / Bumpy Glass / Bee Eye)',[S('Lens type',['uberLENS spheres','Art Deco glass blocks','Bumpy glass','Bee POV (compound eye)','Bee honeycomb']),P('Cells across',2,40,8,1),P('Strength',0,1,.6,.01),P('Irregularity / angle',0,1,.3,.01)],
  `int m=int(u_p0+.5);float st=u_p2,va=u_p3;vec2 Pp=PX(uv);vec2 W=u_res/u_k;float cs=W.x/u_p1;vec3 col=c.rgb;
  vec3 Lt=normalize(vec3(-.5,.6,1.));
  if(m==0){vec2 q=Pp/cs;vec2 ip=floor(q);vec2 l=fract(q)-.5;vec2 j=(hash2(ip)-.5)*va*.3;float rad=.48*(1.-va*.45*hash(ip+5.));vec2 d=l-j;float r=length(d)/rad;
    col=c.rgb*.9;if(r<1.){float z=sqrt(1.-r*r);vec2 sl=d*(1.+st*3.5*z);if(hash(ip+9.)<va*.5)sl=-sl;vec3 n=vec3(d/rad,z);
      vec3 s=T(fromPX((ip+.5+j+sl)*cs)).rgb;float df=dot(n,Lt);float sp=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),28.);
      col=s*(.72+.38*df)*(1.-.35*smoothstep(.82,1.,r))+sp*.55;}else{float ao=smoothstep(1.25,1.,r);col*=1.-.25*ao;}}
  else if(m==1){vec2 q=Pp/cs;vec2 ip=floor(q);vec2 l=fract(q)-.5;float r=pow(pow(abs(l.x)*2.,4.)+pow(abs(l.y)*2.,4.),.25);
    vec2 jn=vec2(vnoise(q*5.+ip*7.1),vnoise(q*5.+ip*3.7+31.))-.5;vec2 sl=l*(1.+st*(1.2+5.*dot(l,l)))+jn*va*.7;
    vec3 s=T(clamp(fromPX((ip+.5+sl)*cs),0.,1.)).rgb;s=s*(1.05+.25*(.5-length(l)))*(.92+.16*vnoise(q*13.));
    float e=smoothstep(.86,.95,r);vec3 ec=vec3(.04,.07,.09)+.18*max(0.,l.x-l.y)*e;col=mix(s,ec,e);}
  else if(m==2){vec2 q0=Pp/cs;q0+=(vec2(fbm(q0*.6),fbm(q0*.6+9.3))-.5)*va*1.6;float hs[3];float e=.03;
    for(int k=0;k<3;k++){vec2 q=q0+(k==1?vec2(e,0.):k==2?vec2(0.,e):vec2(0.));vec2 ip=floor(q);vec2 l=fract(q)-.5-(hash2(ip)-.5)*va*.25;float sz=.75+.2*hash(ip+3.);
      float rr=pow(pow(abs(l.x)*2./sz,4.)+pow(abs(l.y)*2./sz,4.),.25);hs[k]=smoothstep(1.,.25,rr)*(.6+.4*hash(ip+7.));}
    vec2 g=vec2(hs[1]-hs[0],hs[2]-hs[0])/e;vec3 s=T(fromPX(Pp-g*st*cs*.12)).rgb;vec3 n=normalize(vec3(-g*.12,1.));
    float sp=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),18.);col=s*(.82+.3*dot(n,Lt))+sp*.6*st;}
  else{float a=m==4?va*PI/3.:0.;vec2 rp=rot(Pp,a)/cs;vec2 rr=vec2(1.,1.7320508);vec2 h=rr*.5;vec2 qa=mod(rp,rr)-h;vec2 qb=mod(rp-h,rr)-h;vec2 g=dot(qa,qa)<dot(qb,qb)?qa:qb;vec2 cc=rp-g;
    float dh=max(abs(g.y),dot(abs(g),vec2(.866,.5)));vec3 s;
    if(m==3){float k=mix(2.4,.55,st);vec2 g2=g*(1.+va*3.*dot(g,g));vec2 cuv=fromPX(rot(cc*cs,-a));s=T(clamp(.5+g2*k*vec2(1.,asp())+(cuv-.5)*.35,0.,1.)).rgb;s*=1.-.45*smoothstep(.36,.5,dh);}
    else{vec2 sp=rot((cc+g*(1.-st*.85))*cs,-a);s=T(fromPX(sp)).rgb;vec2 gn=dh>1e-4?g/max(length(g),1e-4):vec2(0.);s*=.92+.25*dot(gn,vec2(-.6,.8))*smoothstep(.25,.5,dh);s=mix(s,vec3(1.),.35*st*smoothstep(.42,.5,dh));}
    col=s;}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge uberLENS / Art Deco Glass Blocks / Bumpy Glass / Bee POV / Bee Honeycomb: grid of spherical lenses (radial power magnification, optional inverted lenses, Lambert + Phong shading), concave square glass blocks (wide-angle minify + noisy jumble + dark leading), rounded-square glass bumps refracting along the height gradient, hexagonal compound eye where every facet shows the whole scene (field curvature + parallax lensing), and honeycomb facets magnifying their own spot; approx.',1);

f('q05_water','Water Surfaces (Rain Ripples / Water Splatter / Underwater Bubbles / Ripple Surface)',[S('Mode',['Rain ripples','Water splatter','Underwater bubbles','Ripple surface (Coy)']),P('Amount',0,1,.6,.01),P('Size',4,120,24,1,'px'),P('Refraction',0,2,1,.01)],
  `int m=int(u_p0+.5);float A=u_p1,Sz=u_p2,RF=u_p3;vec2 Pp=PX(uv);float hs[3];float e=max(Sz*.03,.5);
  for(int k=0;k<3;k++){vec2 pp=Pp+(k==1?vec2(e,0.):k==2?vec2(0.,e):vec2(0.));float h=0.;
    if(m==0){for(int L=0;L<3;L++){float cs=Sz*(2.+float(L)*1.3);vec2 q=pp/cs+float(L)*17.3;vec2 ip=floor(q);
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));if(hash(cc+.5)>A*.85+.1)continue;vec2 ctr=cc+hash2(cc);float age=hash(cc+3.3);
        float d=length(q-ctr)*cs;float R=age*cs*1.1;float x=(d-R)/(Sz*.22);float fd=(1.-age);h+=sin(x*3.2)*exp(-x*x*.35)*fd*fd;}}}
    else if(m==1){for(int L=0;L<2;L++){float cs=Sz*(L==0?1.:2.5);vec2 st=L==0?vec2(1.):vec2(1.,.28);vec2 q=pp/cs*st+float(L)*5.1;vec2 ip=floor(q);
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));if(hash(cc+1.7+float(L))>A*(L==0?1.1:.6))continue;vec2 ctr=cc+.2+.6*hash2(cc+float(L));float rad=.22+.3*hash(cc+4.4);
        vec2 dv=(q-ctr);if(L==1)dv.y*=dv.y<0.?.6:1.6;float d=length(dv)/rad;h=max(h,sqrt(max(1.-d*d,0.))*rad*cs/Sz);}}}
    else if(m==2){vec2 q=pp/Sz;vec2 ip=floor(q);float f1=9.,f2=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));float d=length(q-cc-hash2(cc));if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
      h=smoothstep(0.,.45,f2-f1)*.6+fbm(pp/Sz*4.)*.12;}
    else{vec2 q=pp/Sz;h=fbm(q*.5+vec2(fbm(q*.25),fbm(q*.25+7.))*1.5)*1.6;}
    hs[k]=h;}
  vec2 g=vec2(hs[1]-hs[0],hs[2]-hs[0])/e;vec3 n=normalize(vec3(-g*Sz*(m==1?.18:.35),1.));vec3 Lt=normalize(vec3(-.5,.6,1.));
  float sp=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),m==1?60.:30.);float df=dot(n,Lt)-Lt.z;
  vec2 off=-g*RF*Sz*(m==1?2.2:m==3?1.6:.6);vec3 s=T(fromPX(Pp+off)).rgb;vec3 col;
  if(m==0){col=mix(s,s*vec3(.78,.9,.96)+vec3(.02,.05,.07),A*.45)*(1.+.6*df)+sp*.5;}
  else if(m==1){float wet=step(.001,hs[0]);col=s*(1.+.7*df*wet)+sp*.85*wet;vec2 sh=Pp+vec2(Sz*.08,-Sz*.08);col*=1.-.12*wet*smoothstep(.0,.3,hs[0]);}
  else if(m==2){vec3 tint=vec3(.55,.8,.9);col=mix(s,s*tint+vec3(.05,.09,.12),A*.6)*(1.+.45*df)+sp*.35*A+.15*A*pow(max(1.-hs[0],0.),6.);}
  else{col=s*(1.+1.8*df*A)+sp*.3*A;}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Rain Ripples / Water Splatter / Under Water Bubbles / Coy\'s Ripple Surface: procedural height field (seeded expanding damped ring waves from random drops in 3 scales; dome droplets + elongated running streaks; Voronoi bubble cells F2-F1 + grain; domain-warped fbm) refracts the image along its gradient, lit with Lambert + Phong highlight, watery / aquatic tint by Amount; approx.',1);

f('q05_glassy','Glass & Gel Distortions (Hot Glass / Warped Glass / VacuForm / Clear Jelly / Wamble / Ripples in Time)',[S('Mode',['Hot glass','Warped glass (blocks)','VacuForm plastic','Clear jelly','Wamble bomb','Ripples in time']),P('Amount',0,1,.6,.01),P('Scale',4,200,40,1,'px'),P('Angle',0,180,0,1,'deg')],
  [BH('u_p2*.3'),BV('u_p2*.3'),`int m=int(u_p0+.5);float A=u_p1,Sc=u_p2;float an=radians(u_p3);vec2 dir=vec2(cos(an),sin(an)),pe=vec2(-dir.y,dir.x);vec2 Pp=PX(uv);vec3 col;vec3 Lt=normalize(vec3(-.5,.6,1.));
  if(m==0){vec2 rq=vec2(dot(Pp,dir),dot(Pp,pe));float n1=fbm(rq/vec2(Sc*3.,Sc*.35))-.5,n2=fbm(rq/vec2(Sc*1.5,Sc*.2)+13.)-.5;
    vec2 o=(pe*n1*1.6+dir*n2*.6)*A*Sc*1.2;float r=O(fromPX(Pp+o)).r,gg=O(fromPX(Pp+o*1.18)).g,b=O(fromPX(Pp+o*1.36)).b;col=sat(vec3(r,gg,b),1.+.5*A);col+=(n1*.5)*A*.3;}
  else if(m==1){vec2 q=rot(Pp,an)/(Sc*2.);vec2 ip=floor(q);vec2 l=fract(q);if(hash(ip+.3)<.6){vec2 hv=step(.5,l);ip=ip*2.+hv;l=fract(l*2.);}
    float k=hash(ip+1.1);vec2 lc=l-.5;float ra=(hash(ip+2.2)-.5)*1.2*A;float sc=mix(1.,.5+1.2*hash(ip+3.3),A);vec2 sl=rot(lc,ra)*sc;if(k<.25*A)sl.x=-sl.x;
    vec2 cpx=rot((floor(q)+.5)*Sc*2.,-an);vec2 sp=Pp+rot((sl-lc)*Sc*2.*(fract(q)==l?1.:.5),-an)+(hash2(ip+4.4)-.5)*Sc*A;vec3 s=O(fromPX(sp)).rgb;
    float bd=min(min(l.x,1.-l.x),min(l.y,1.-l.y));float bev=smoothstep(.0,.08,bd);s=mix(s,vec3(luma(s)),.45*A);col=s*(.8+.2*bev)+(1.-bev)*.35*max(0.,lc.x-lc.y+.3);}
  else if(m==2||m==3){float d=Sc*.25;vec2 e=fromPX(vec2(d*.5));float h0=L(uv),hx=L(uv+vec2(e.x,0.)),hy=L(uv+vec2(0.,e.y));vec2 g=vec2(hx-h0,hy-h0)*2.;
    if(m==3)g+=(vec2(vnoise(Pp/(Sc*3.)),vnoise(Pp/(Sc*3.)+7.))-.5)*.25;vec3 n=normalize(vec3(-g*(m==2?9.:6.),1.));
    vec2 o=-g*Sc*A*(m==2?.8:5.);vec3 s=vec3(0.);vec3 sb=T(fromPX(Pp+o)).rgb,so=O(fromPX(Pp+o)).rgb;s=m==2?mix(so,sb,.7):mix(so,sb,.2);
    float sp=pow(max(dot(reflect(-Lt,n),vec3(0.,0.,1.)),0.),m==2?24.:40.);float df=dot(n,Lt)-Lt.z;
    if(m==2)col=mix(s,mix(s,vec3(.92),.3),A)*(1.+1.6*df*A)+sp*.9*A;else col=s*(1.+.6*df)+sp*.45*A;}
  else if(m==4){vec2 q=Pp/(Sc*3.);vec2 w=vec2(vnoise(q),vnoise(q+5.2));vec2 w2=vec2(vnoise(q*.8+2.5*w+1.7),vnoise(q*.8+2.5*w+9.2));float fl=vnoise(q*.7+3.*w2)*1.4+L(uv)*.8;
    vec3 s=O(fromPX(Pp+(w2-.5)*Sc*4.*A)).rgb;float band=.5+.5*sin(fl*PI*2.*4.);float sh=smoothstep(.1,.9,band);col=mix(s,mix(s*.3,mix(s,vec3(1.),.5),sh),A*.8);}
  else{float s0=dot(Pp,dir)/Sc;float ds=fbm(Pp/(Sc*2.))-.5;float ph=s0*2.*PI+ds*6.*A;vec2 o=pe*sin(ph)*Sc*.35*A+dir*cos(ph*.5)*Sc*.15*A;vec3 s=O(fromPX(Pp+o)).rgb;
    vec3 hv=rgb2hsv(s);hv.x=fract(hv.x+sin(ph)*.05*A+.03*A);col=mix(hsv2rgb(hv),vec3(1.),.12*A*(.5+.5*cos(ph)));}
  return vec4(clamp(col,0.,1.),1.);`],
  'Filter Forge Hot Glass Distortion (heat-wave noise stretched along Angle + low-quality-glass RGB dispersion), Warped Glass (Picasso-like blocks: quadtree-split blocks each rotated / scaled / mirrored / offset, partly desaturated, bevelled), VacuForm (image under thick plastic: blurred luminance relief refracts a softened image, milky veil + glossy highlights), clear jelly (gel wobble along the smoothed luminance gradient + noise), Wamble Bomb (domain-warped sinuous gel bands over a warped image), Ripples in Time (noise-perturbed directional waves with hue shift + washout); approx.',1);
