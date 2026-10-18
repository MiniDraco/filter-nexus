/* ================= altpsp (2): Corel PaintShop Pro effects (round 10) ================= */
const ALTPSP_TR = '(mix(10.,1.,u_p1/100.)*(u_p0>.5&&u_p0<1.5?1.8:1.))';
f = add('Materials');
f('psp_texture','PaintShop Pro Artistic / Texture Effects',[S('Effect',['Enamel','Hot Wax Coating','Polished Stone','Soft Plastic','Colored Foil','Straw-Wall','Topography','Fur','Sculpture']),P('Detail',1,100,50,1),P('Density',1,100,50,1),P('Angle (light)',0,360,135,1,'deg')],
  [BH(ALTPSP_TR), BV(ALTPSP_TR), `
#define APS_H(q) luma(T(q).rgb)
#define APS_P(q) (1.-abs(2.*fbm(q)-1.))
 int m=int(u_p0+.5);float det=u_p1/100.,den=u_p2/100.,a=radians(u_p3);vec2 ld=vec2(cos(a),sin(a));vec3 Ld=normalize(vec3(ld,1.1));vec3 Hv=normalize(Ld+vec3(0.,0.,1.));
 vec2 p=PX(uv);vec3 sm=T(uv).rgb,src=O(uv).rgb;vec2 e=u_px*max(u_k*1.5,1.);float hc=APS_H(uv);
 vec2 g=vec2(APS_H(uv+vec2(e.x,0.))-APS_H(uv-vec2(e.x,0.)),APS_H(uv+vec2(0.,e.y))-APS_H(uv-vec2(0.,e.y)));
 vec3 n=normalize(vec3(-g*(3.+20.*den),1.));vec3 col=sm;float amb=.4,ex=30.,ks=.5;vec3 o;
 if(m==0){col=mix(vec3(luma(sm)),sm,1.3);col=mix(col,floor(col*6.+.5)/6.,.35);amb=.35;ex=60.;ks=.9;}
 else if(m==1){col=mix(sm,vec3(.86,.6,.3)*(.35+.8*luma(sm)),.5);amb=.5;ex=18.;ks=.5;}
 else if(m==2){float v=abs(sin((p.x+p.y)*.02+fbm(p*.01)*8.));col=mix(sm,vec3(luma(sm)),.2)*(.88+.12*smoothstep(0.,.15,v));amb=.4;ex=80.;ks=.7;}
 else if(m==3){col=mix(vec3(luma(sm)),sm,1.25);amb=.55;ex=10.;ks=.45;}
 else if(m==4){float hu=fract(hc*2.+dot(n.xy,vec2(.7,.4))*2.);col=mix(sm,hsv2rgb(vec3(hu,.65,1.))*(.4+.6*luma(sm)),.35+.2*den);amb=.6;ex=30.;ks=.6;}
 else if(m==5){float fs=2.+6.*(1.-det);vec2 pr=vec2(dot(p,vec2(-ld.y,ld.x)),dot(p,ld));float f1=vnoise(vec2(pr.x*.02,pr.y/fs*.5));
  float ph=pr.y/fs*3.1416+f1*6.;float sv=.5+.5*sin(ph);n=normalize(vec3(-ld*cos(ph)*(.3+1.*den),1.));
  col=mix(src,vec3(.85,.72,.42)*(.5+.6*luma(src)),.15+.35*den)*(.8+.25*sv)*(.9+.2*vnoise(vec2(pr.x*.05,floor(pr.y/fs/2.))));amb=.5;ex=24.;ks=.12;}
 else if(m==8){float sc=mix(.07,.012,det);vec2 qq=p*sc;float dq=1.5*sc;
  vec2 gp=vec2(APS_P(qq+vec2(dq,0.))-APS_P(qq-vec2(dq,0.)),APS_P(qq+vec2(0.,dq))-APS_P(qq-vec2(0.,dq)));n=normalize(vec3(-gp*(2.+14.*den),1.));
  col=src;amb=.45;ex=30.;ks=.35;}
 float dif=max(dot(n,Ld),0.)/Ld.z;float sp=pow(max(dot(n,Hv),0.),ex);
 o=col*(amb+(1.-amb)*dif)+ks*sp;
 if(m==6){float nl=3.+17.*den;float w=1.+5.*det;vec2 off=ld*u_px*R(w);
  float l0=floor(hc*nl),lu=floor(APS_H(uv+off)*nl),lw=floor(APS_H(uv-off)*nl);
  float dk=min(max(lu-l0,0.),2.),lt=min(max(lw-l0,0.),2.);col=mix(sm,sm*((l0+.5)/nl)/max(hc,.03),.6);
  o=col*(1.+.4*lt-.45*dk);}
 else if(m==7){float Lf=4.+22.*det;float an=a+(fbm(p*.008)-.5)*2.;vec2 dr=vec2(cos(an),sin(an));float acc=0.;
  for(int k=0;k<16;k++){float t=float(k)/15.*Lf;acc+=hash(floor(p-dr*t));}acc/=16.;
  float fz=clamp(.5+(acc-.5)*4.5*(.4+.6*den),0.,1.);vec3 base=O(uv-fromPX(dr*Lf*.4)).rgb;o=base*(.45+.85*fz)+.08*fz*fz;}
 return vec4(clamp(o,0.,1.),1.);`],
  'PSP Artistic Enamel / Hot Wax Coating / Colored Foil / Topography and Texture Polished Stone / Soft Plastic / Straw-wall / Fur / Sculpture: relief from the smoothed image (Detail = smoothing, Density = relief depth) lit from Angle with Blinn-Phong gloss per material; foil = hue cycling with height & normal; straw = ridged fibres across the light; topography = luminance terraces with lit / shadowed step faces; fur = line-integral strands along a curling direction field; sculpture = ridged-noise pattern embossed over the image (Corel ships a pattern library); approx.', 1);

f = add('Distort');
f('psp_geometric','PaintShop Pro Geometric / Distortion (cylinder, pentagon, curtain, spiky halo)',[S('Effect',['Cylinder - Horizontal','Cylinder - Vertical','Pentagon','Curtain','Spiky Halo']),P('Strength',-100,100,70,1,'%'),P('Folds / spikes',2,40,8,1),S('Edge mode',['Background (black)','Repeat (clamp)','Wrap','Mirror'])],
  `int m=int(u_p0+.5);float k=u_p1/100.;vec2 q=uv*2.-1.;vec2 s=q;float sh=1.;
 if(m<=1){float v=m==0?q.x:q.y;float w=k>=0.?mix(v,asin(clamp(v,-1.,1.))/1.5708,k):mix(v,sin(v*1.5708),-k);if(m==0)s.x=w;else s.y=w;}
 else if(m==2){vec2 qa=q*vec2(asp(),1.);float ph=atan(qa.y,qa.x);float tp=mod(ph-1.5708,1.2566)-.6283;float rp=.809/cos(tp);
  float rs=1./max(abs(cos(ph))/asp(),abs(sin(ph)));float fct=k>=0.?mix(1.,rs/rp,k):mix(1.,rp/rs,-k);s=qa*fct/vec2(asp(),1.);}
 else if(m==3){float n=floor(u_p2+.5);float amp=abs(k)*(.45+.55*uv.y);float ph=6.2832*n*uv.x;
  s.x=(uv.x+amp*.9*sin(ph)/(6.2832*n))*2.-1.;sh=1.-.6*amp*cos(ph+(k<0.?3.1416:0.))*(.7+.3*sin(ph*.5+1.));}
 else{vec2 qa=q*vec2(asp(),1.);float r=length(qa);float th=atan(qa.y,qa.x)+3.1416;float n=floor(u_p2+.5);float t=th/6.2832*n;
  float sp=pow(1.-abs(fract(t)*2.-1.),3.)*(.5+hash(vec2(mod(floor(t),n),7.)));float B=.6*length(vec2(asp(),1.))*(1.+.4*k*sp-.2*abs(k));
  if(r>B){float rs=B+(r-B)*.35;qa*=rs/r;sh=1.+.35*smoothstep(B,B+.3,r);}s=qa/vec2(asp(),1.);}
 vec2 su=s*.5+.5;int em=int(u_p3+.5);vec3 o;
 if(em==0&&(su.x<0.||su.x>1.||su.y<0.||su.y>1.))o=vec3(0.);
 else{if(em==2)su=fract(su);else if(em==3)su=1.-abs(mod(su,2.)-1.);o=O(clamp(su,0.,1.)).rgb*sh;}
 return vec4(clamp(o,0.,1.),1.);`,
  'PSP Cylinder - Horizontal / Vertical (image wrapped on a cylinder: source = asin(x) blend, negative = inverse sin compression), Pentagon (rectangle mapped radially into a point-up regular pentagon, negative = inverse), Curtain (vertical folds: sinusoidal compression + fold shading, deeper toward the hem), Spiky Halo (spiky radial boundary beyond which the image is radially smeared and brightened); edge modes as in PSP; approx.', 1);

f('psp_reflect','PaintShop Pro Reflection (Feedback, Rotating Mirror)',[S('Effect',['Feedback','Feedback (elliptical)','Rotating Mirror']),P('Horizontal offset',-100,100,0,1),P('Vertical offset',-100,100,0,1),P('Intensity / rotation (x3.6 deg)',0,100,50,1)],
  `int m=int(u_p0+.5);vec2 c0=vec2(.5)+vec2(u_p1,u_p2)/200.;vec3 o;
 if(m<=1){vec2 d=uv-c0;vec2 hw=vec2(d.x<0.?c0.x:1.-c0.x,d.y<0.?c0.y:1.-c0.y);vec2 nq=d/max(hw,1e-3);
  float rr=m==0?max(abs(nq.x),abs(nq.y)):length(nq);float sc=mix(.85,.35,u_p3/100.);
  float lv=rr<1.?min(floor(log(max(rr,1e-5))/log(sc)),24.):0.;o=O(clamp(c0+d/pow(sc,lv),0.,1.)).rgb;}
 else{float an=radians(u_p3*3.6);vec2 nr=vec2(cos(an),sin(an));vec2 d=(uv-c0)*vec2(asp(),1.);float dd=dot(d,nr);if(dd<0.)d-=2.*dd*nr;
  vec2 su=c0+d/vec2(asp(),1.);o=O(1.-abs(mod(su,2.)-1.)).rgb;}
 return vec4(o,1.);`,
  'PSP Reflection: Feedback = the image repeated inward toward the (offset) centre like facing mirrors, each copy scaled by a ratio set by Intensity (rectangular or elliptical nesting); Rotating Mirror = one half reflected across a line through the offset centre at the given angle (out-of-frame samples mirrored back)');

f = add('Render');
f('psp_bubbles','PaintShop Pro Balls and Bubbles',[S('Mode',['Single ball','Single bubble','Balls (fill)','Bubbles (fill)']),P('Size',5,100,40,1,'%'),P('Coverage',0,1,.6,.01),P('Shininess',0,1,.7,.01)],
  `int m=int(u_p0+.5);vec2 pa=uv*vec2(asp(),1.);vec3 o=c.rgb;vec2 ctr=vec2(.5*asp(),.5);float rad=.5*u_p1/100.;bool hit=m<=1;
 if(m>=2){float cs=max(u_p1/100.*.5,.04);vec2 ci=floor(pa/cs);if(hash(ci+.5)<u_p2){rad=cs*.5*(.45+.5*hash(ci+2.));ctr=(ci+.5)*cs+(hash2(ci+4.)-.5)*(cs-2.*rad);hit=true;}}
 if(hit){vec2 d=(pa-ctr)/rad;float rr=dot(d,d);if(rr<1.){float z=sqrt(1.-rr);vec3 n=vec3(d,z);vec3 Ld=normalize(vec3(-.5,.6,1.));vec3 H=normalize(Ld+vec3(0.,0.,1.));
  float sp=pow(max(dot(n,H),0.),20.+80.*u_p3)*(.3+.9*u_p3);float dif=max(dot(n,Ld),0.);vec3 col;
  if(m==0||m==2){vec2 su=(ctr+d*rad*mix(.3,1.,rr))/vec2(asp(),1.);col=O(clamp(su,0.,1.)).rgb*(.2+.9*dif)*(1.-.35*pow(rr,4.))+sp;}
  else{vec2 su=(pa-d*rad*.18*(1.-z))/vec2(asp(),1.);vec3 film=hsv2rgb(vec3(fract(rr*1.5+d.y*.5+.2),.6,1.));
   col=mix(O(clamp(su,0.,1.)).rgb,film,pow(rr,3.)*.45)+sp+.12*pow(rr,6.);}
  float aa=u_px.y*2./rad;o=mix(o,clamp(col,0.,1.),1.-smoothstep(1.-aa,1.,sqrt(rr)));}}
 return vec4(o,1.);`,
  'PSP Artistic Balls and Bubbles: single sphere at the centre or a field of non-overlapping spheres (one per cell, Coverage = probability); balls = the image mapped onto a lit glossy sphere (magnified centre, Lambert + Blinn highlight, dark rim), bubbles = transparent with slight refraction, thin-film colour at the rim and a specular glint; seeded; approx.', 1);

f = add('Frames');
f('psp_bevel3d','PaintShop Pro 3D Buttonize / Chisel',[S('Effect',['Buttonize (transparent edge)','Buttonize (solid edge)','Chisel (transparent)','Chisel (solid)']),P('Size',2,100,24,1,'px'),P('Opacity',0,1,.7,.01),S('Edge color',['Grey','Black','White','Brown'])],
  `int m=int(u_p0+.5);vec2 pp=PX(uv);vec2 sz=u_res/u_k;float w=u_p1;vec3 o=c.rgb;
 float dl=pp.x,dr=sz.x-pp.x,db=pp.y,dt=sz.y-pp.y;float dm=min(min(dl,dr),min(db,dt));
 if(dm<w){float side=(dm==dl||dm==db)?1.:-1.;float t=dm/w;int ec=int(u_p3+.5);vec3 ecol=ec==0?vec3(.6):ec==1?vec3(.12):ec==2?vec3(.95):vec3(.45,.3,.18);
  if(m>=2){side=-side;float rough=(fbm(pp*.15)-.5)*.3;ecol*=1.+rough;if(t<.5)side=-side*.6;}
  float f=u_p2*(.35+.65*(1.-t));
  if(m==0||m==2)o=side>0.?mix(o,vec3(1.),f*.75):mix(o,vec3(0.),f*.75);
  else{vec3 sc=ecol*(1.+.55*side*(.5+.5*(1.-t)));o=mix(o,clamp(sc,0.,1.),min(u_p2*1.4,1.));}}
 return vec4(clamp(o,0.,1.),1.);`,
  'PSP 3D Effects: Buttonize = bevelled button edge on the image border (light from upper left: top/left lightened, bottom/right darkened, mitred corners), transparent = shading over the image, solid = edge colour; Chisel = carved stone frame (inner half sunk, outer half raised, rough texture on solid); drawn inside the canvas; approx.');

f = add('Film');
f('psp_vintage','PaintShop Pro Aged Newspaper / Time Machine',[S('Effect',['Aged Newspaper','Time Machine: Daguerreotype 1839','Time Machine: Albumen 1855','Time Machine: Cyanotype 1880','Time Machine: Platinum 1880','Time Machine: Early Color 1910','Time Machine: Box Camera 1940','Time Machine: Cross Process 1960','Time Machine: 1970s']),P('Intensity / age',0,1,.8,.01),P('Border / vignette',0,1,.4,.01),P('Exposure',-1,1,0,.01)],
  `int m=int(u_p0+.5);vec3 x=clamp(c.rgb*exp2(u_p3),0.,1.);float l=luma(x);vec2 p=PX(uv);vec2 q=(uv-.5)*vec2(asp(),1.);float vg=length(q)/length(vec2(asp(),1.)*.5);float A=u_p1,B=u_p2;vec3 o;
 if(m==0){vec3 paper=mix(vec3(.93,.92,.88),vec3(.86,.76,.55),A);vec3 ink=mix(vec3(.1),vec3(.22,.19,.15),A*.6);o=mix(ink,paper,smoothstep(0.,1.,l));
  o*=1.+(fbm(p*.3)-.5)*.08;o=mix(o,o*vec3(.85,.72,.5),smoothstep(.5,1.,vg)*A*B*1.2);}
 else{vec3 t;
  if(m==1){l=smoothstep(.05,.95,l);t=mix(vec3(.1,.11,.13),vec3(.86,.87,.85),l);t=mix(t,t*vec3(.7,.75,.9),smoothstep(.4,.9,vg)*B);}
  else if(m==2){t=l<.5?mix(vec3(.2,.08,.1),vec3(.56,.4,.33),l*2.):mix(vec3(.56,.4,.33),vec3(.94,.87,.7),l*2.-1.);}
  else if(m==3){t=mix(vec3(.03,.13,.32),vec3(.9,.95,.98),pow(l,.9));}
  else if(m==4){t=l<.5?mix(vec3(.11,.1,.09),vec3(.5,.46,.41),l*2.):mix(vec3(.5,.46,.41),vec3(.95,.93,.88),l*2.-1.);}
  else if(m==5){vec3 hv=rgb2hsv(x);hv.y*=.45;hv.z=l*.9+.05;t=hsv2rgb(hv);t=mix(t,t*vec3(1.05,1.,.82),.6);t=.06+.86*t;}
  else if(m==6){float gg=dot(x,vec3(.25,.6,.15));t=mix(vec3(.08,.07,.06),vec3(.92,.89,.8),smoothstep(-.05,1.05,gg));}
  else if(m==7){t=vec3(smoothstep(.05,.85,x.r),pow(x.g,.85)*1.05-.02,x.b*.65+.18);t=mix(vec3(luma(t)),t,1.25);}
  else{t=.08+.84*x;t*=vec3(1.07,1.,.82);t=mix(vec3(luma(t)),t,.8);t+=vec3(.03,.02,0.);}
  o=mix(x,t,A);o*=1.-B*.6*smoothstep(.45,1.1,vg);}
 return vec4(clamp(o,0.,1.),1.);`,
  'PSP Artistic Aged Newspaper (grey image on yellowing newsprint, browned edges with age) and Photo Time Machine eras (daguerreotype silver with edge tarnish, albumen purple-brown, cyanotype Prussian blue, platinum neutral-warm, early colour faded pastel, box camera warm B&W, 1960s cross-process, 1970s faded warm print); Intensity = blend, Border = edge darkening; approx.');
