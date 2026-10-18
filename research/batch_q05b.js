/* ================= q05b: Filter Forge distortions II — swirls, fractal warps, bloat / offset, echoes, wind & streaks ================= */
f = add('Distort');
f('q05_swirls','Swirl Fields (Swirling Dervish / Twisterizer / Uzumaki / Circle Nudger)',[S('Mode',['Swirling dervish','Twisterizer','Ultramaki Uzumaki','Image circle nudger']),P('Amount',-1,1,.6,.01),P('Size',10,400,110,1,'px'),P('Sides / count',3,12,6,1)],
  `int m=int(u_p0+.5);float A=u_p1,Sz=u_p2,Nn=u_p3;vec2 Pp=PX(uv);vec2 W=u_res/u_k;vec2 C=W*.5;vec3 col;
  if(m==0){vec2 q=Pp/Sz;vec2 ip=floor(q);float bd=9.;vec2 bc=vec2(0.);float br=1.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 ct=cc+hash2(cc);float rr=.55+.45*hash(cc+2.);float d=length(q-ct)/rr;if(d<bd){bd=d;bc=ct;br=rr;}}
    vec2 sp=Pp;if(bd<1.){float t=1.-bd;vec2 dv=Pp-bc*Sz;float sg=hash(bc)<.5?1.:-1.;dv=rot(dv,A*sg*7.*t*t);float rp=sin(bd*Nn*PI)*t*A*Sz*.06;sp=bc*Sz+dv+normalize(dv+1e-4)*rp;}
    col=T(fromPX(sp)).rgb;if(bd<1.){float hl=pow(max(0.,sin(bd*Nn*PI)),8.)*(1.-bd)*abs(A);col+=hl*.25;}}
  else if(m==1){vec2 dv=Pp-C;float r=length(dv);float Rm=length(C);float a=atan(dv.y,dv.x);float t=max(0.,1.-r/Rm);
    float rough=fbm(vec2(r/Sz*1.5,a*Nn/PI))-.5;float ang=A*2.*PI*t*t*(1.+rough*2.);vec2 sp=C+rot(dv,ang);col=T(fromPX(sp)).rgb;col*=1.+rough*.25*abs(A);}
  else if(m==2){vec2 rr=vec2(1.,1.7320508);vec2 q=Pp/Sz;vec2 h=rr*.5;vec2 qa=mod(q,rr)-h,qb=mod(q-h,rr)-h;vec2 g=dot(qa,qa)<dot(qb,qb)?qa:qb;vec2 cc=q-g;
    float a=atan(g.y,g.x)+hash(floor(cc*2.))*6.28;float seg=2.*PI/Nn;float pd=length(g)*cos(PI/Nn)/cos(mod(a,seg)-seg*.5)/.62;float t=max(0.,1.-pd);
    vec2 sg=rot(g,A*9.*t*t);vec3 s=T(fromPX((cc+sg)*Sz)).rgb;float stp=abs(fract(pd*Nn*.5-A*t*2.)-.5);float line=smoothstep(.08,.0,stp)*t;
    float cl=abs(fract(luma(s)*5.)-.5);float ink=smoothstep(.06,.0,cl);s=sat(s,1.5);s=floor(s*5.+.5)/5.;col=mix(s,vec3(0.),max(line*abs(A),ink*.7));}
  else{vec2 dv=(Pp-C)/min(C.x,C.y)/.96;float r=length(dv);if(r>1.)return vec4(0.,0.,0.,1.);float rs=asin(r)/(PI*.5);float k=floor(rs*Nn);float a=atan(dv.y,dv.x);
    float nud=(hash(vec2(k,3.))-.5)*2.*PI*A;float rr=mix(rs,fract(rs*Nn),abs(A)*.85);float ar=a+nud;vec2 sp=vec2(cos(ar),sin(ar))*rr;col=T(clamp(fromPX(C+sp*min(C.x,C.y)),0.,1.)).rgb;
    float rim=smoothstep(.0,.08,fract(rs*Nn))*smoothstep(1.,.92,fract(rs*Nn));col*=.75+.25*rim;col*=.85+.15*sqrt(max(1.-r*r,0.));}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Swirling Dervish (bombed random vortices with ring ripples + glints), Twisterizer (centre twirl whose angle is roughened by polar fbm, tearing the swirl arms), Ultramaki Uzumaki (polygonal N-sided swirls in a hex array blended with spiral lines, posterised and inked), Image Circle Nudger (image spherized in a disc, cut into rings, each ring rotated by a seeded nudge and radially re-tiled); approx.',1);

f('q05_fractalwarp','Fractal Warps (Dragon Distort / Chaos Ripples)',[S('Mode',['Dragon distort (Julia trace)','Chaos ripples']),P('Shape modifier I',-1,1,0,.01),P('Shape modifier II',-1,1,0,.01),P('Iterations',1,16,8,1)],
  `int m=int(u_p0+.5);vec2 p=(uv-.5)*vec2(asp(),1.);int n=int(u_p3+.5);vec2 z;
  if(m==0){z=p*3.;vec2 cc=vec2(-.8+.35*u_p1,.156+.35*u_p2);for(int i=0;i<16;i++){if(i>=n)break;vec2 zn=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+cc;if(dot(zn,zn)>16.)break;z=zn;}z=z*.25;}
  else{z=p*4.;for(int i=0;i<16;i++){if(i>=n)break;z=abs(z);z+=.55*vec2(sin(z.y*1.7+u_p1*3.),sin(z.x*1.7+u_p2*3.+1.));z=rot(z,.35);}z*=.18;}
  vec2 q=z/vec2(asp(),1.)+.5;q=1.-abs(1.-mod(q,2.));return vec4(T(q).rgb,1.);`,
  'Filter Forge Dragon Distort: escape-time Julia iteration z <- z^2 + c (c near the dragon Julia -0.8+0.156i, moved by the two shape modifiers, escape radius 4) and the image looked up at the final z with mirrored repeat (fractal trace); Chaos Ripples: iterated folding sine warp (abs fold + sin cross-coupling + small rotation) giving mirrored trippy refraction; approx.');

f('q05_bloat','Bloat & Offset (Luminance Bloat / Color Bloat / Offset Madness)',[S('Mode',['Luminance bloat','Color bloat (hue-weighted)','Offset madness: contour','Offset madness: hue','Offset madness: saturation','Offset madness: brightness']),P('Strength',-1,1,.5,.01),P('Radius',2,80,16,1,'px'),P('Angle / hue',0,360,0,1,'deg')],
  [`int m=int(u_p0+.5);vec3 o=c.rgb;float fld;vec3 hv=rgb2hsv(o);
  if(m==0)fld=luma(o);else if(m==1){vec3 w=.5+.5*cos(radians(u_p3)-vec3(0.,2.0944,4.1888));fld=dot(o,w)/max(w.x+w.y+w.z,1e-3);}
  else if(m==2){fld=clamp(length(sobel(uv))*1.5,0.,1.);}else if(m==3)fld=hv.x;else if(m==4)fld=hv.y;else fld=hv.z;
  return vec4(fld,.5+.5*cos(hv.x*6.2832),.5+.5*sin(hv.x*6.2832),1.);`,BH('u_p2'),BV('u_p2'),
  `int m=int(u_p0+.5);vec2 Pp=PX(uv);float rd=u_p2;vec2 sp;
  if(m<=1){vec2 e=fromPX(vec2(rd*.5));float gx=T(uv+vec2(e.x,0.)).r-T(uv-vec2(e.x,0.)).r,gy=T(uv+vec2(0.,e.y)).r-T(uv-vec2(0.,e.y)).r;sp=Pp+vec2(gx,gy)*u_p1*rd*10.;}
  else{vec4 b=T(uv);float a;if(m==3)a=atan(b.b-.5,b.g-.5)*2.;else a=b.r*2.*PI*2.;a+=radians(u_p3);sp=Pp+vec2(cos(a),sin(a))*u_p1*rd*2.5;}
  return vec4(O(fromPX(sp)).rgb,1.);`],
  'Filter Forge Luminance Bloat / Color Bloat / Offset Madness: a scalar map (luminance; RGB weighted by a hue angle; contour = Sobel magnitude; hue; saturation; brightness) is Gaussian-smoothed at Radius; bloat moves every pixel up the map gradient (light areas swell, dark shrink; negative = invert), offset madness pushes pixels in the direction angle = map value x 4 pi (+ Angle); approx.');

f('q05_echo','Echo (Edge Echo / Distorted Echo Mask)',[S('Mode',['Edge echo (radial)','Distorted echo (colour-rotated)']),P('Echoes',1,10,5,1),P('Echo size',.02,.5,.1,.01),P('Distortion / color',0,1,.35,.01)],
  `int m=int(u_p0+.5);int n=int(u_p1+.5);vec3 bg=vec3(0.);for(int i=0;i<16;i++){float t=(float(i)+.5)/16.;bg+=O(vec2(t,.01)).rgb+O(vec2(t,.99)).rgb+O(vec2(.01,t)).rgb+O(vec2(.99,t)).rgb;}bg/=64.;float dv=0.;for(int i=0;i<16;i++){float t=(float(i)+.5)/16.;dv+=length(O(vec2(t,.01)).rgb-bg)+length(O(vec2(t,.99)).rgb-bg)+length(O(vec2(.01,t)).rgb-bg)+length(O(vec2(.99,t)).rgb-bg);}dv/=64.;float t0=dv*1.6+.05;
  #define Q05_MK(QQ) smoothstep(t0,t0+.14,length(O(QQ).rgb-bg))
  vec2 cn=vec2(.5);vec3 col=bg;float dd=u_p3;
  for(int k=10;k>=1;k--){if(k>n)continue;float fk=float(k);float s=1.+fk*u_p2;vec2 q=cn+(uv-cn)/s;
    if(m==1)q+=(vec2(vnoise(q*7.+fk*3.1),vnoise(q*7.+fk*5.7+11.))-.5)*dd*.05*fk;
    q=clamp(q,0.,1.);float mk=Q05_MK(q);vec3 e=O(q).rgb;
    if(m==1){vec3 hv=rgb2hsv(e);hv.x=fract(hv.x+fk*dd*.09);hv.y=clamp(hv.y*(1.+dd*.3),0.,1.);hv.z=clamp(hv.z*(1.+.04*fk*dd),0.,1.);e=hsv2rgb(hv);}
    float shd=Q05_MK(clamp(q+vec2(.012,-.012)/s,0.,1.));col*=1.-.35*shd*(1.-mk);e*=1.-.04*fk*(1.-dd*.5);col=mix(col,e,mk);}
  float m0=Q05_MK(uv);float sh0=Q05_MK(clamp(uv+vec2(.012,-.012),0.,1.));col*=1.-.4*sh0*(1.-m0);col=mix(col,O(uv).rgb,m0);
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Edge Echo / Distorted Echo Mask: the subject (pixels differing from the estimated border/background colour, standing in for FF\'s alpha mask) is repeated as N progressively enlarged echoes around the centre, painted back to front with soft drop shadows and the original on top; distorted mode adds growing noise warp and per-echo hue rotation / saturation / lightness change; approx.');

f('q05_windstreak','Wind & Streaks (RGB Wind Separator / The Streaker / Wispy Squimsh)',[S('Mode',['RGB wind separator','The Streaker','Wispy squimsh']),P('Length',5,300,60,1,'px'),P('Angle',0,360,0,1,'deg'),P('Density / blend',0,1,.6,.01)],
  `int m=int(u_p0+.5);float Lg=u_p1;float an=radians(u_p2);vec2 dir=vec2(cos(an),sin(an)),pe=vec2(-dir.y,dir.x);vec2 Pp=PX(uv);float D=u_p3;vec3 col;
  if(m==0){float row=floor(dot(Pp,pe)/2.);vec3 Lc=Lg*vec3(.35+.65*vnoise(vec2(row*.15,1.)),.35+.65*vnoise(vec2(row*.15,9.)),.35+.65*vnoise(vec2(row*.15,17.)));
    float act=step(1.-D,vnoise(vec2(row*.3,4.)));Lc*=.25+.75*act;vec3 o=c.rgb;vec3 tr=o;
    for(int i=1;i<=32;i++){float d=float(i)/32.*Lg;vec3 s=T(fromPX(Pp-dir*d)).rgb;vec3 fd=clamp(1.-d/max(Lc,vec3(1.)),0.,1.);tr=max(tr,s*fd);}
    vec3 sh=vec3(0.,.04,.08)*Lg;col=vec3(T(fromPX(Pp-dir*sh.x)).r,T(fromPX(Pp-dir*sh.y)).g,T(fromPX(Pp-dir*sh.z)).b);col=max(col,tr);col=mix(o,col,.5+.5*D);}
  else if(m==1){vec3 a=vec3(0.);float w=0.;for(int i=-24;i<=24;i++){float t=float(i)/24.;float g=exp(-t*t*2.);a+=T(fromPX(Pp+dir*t*Lg)).rgb*g;w+=g;}a/=w;
    col=mix(a,overlay(a,sat(c.rgb,1.6)),D);col=sat(col,1.25);}
  else{vec2 p=Pp;float v=step(.5,luma(c.rgb));float best=v;
    for(int i=1;i<=32;i++){float t=float(i)/32.;vec2 dd=rot(dir,(fbm(p/(Lg*.6))-.5)*3.);p-=dd*Lg/32.;float s=step(D,luma(T(fromPX(p)).rgb));best=min(best,mix(s,1.,pow(t,.7)));}
    float g=fbm(rot(Pp,an)/vec2(Lg*.8,2.))*.15;col=vec3(clamp(best+g-.07,0.,1.));}
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge Fast RGB Wind Separator (Photoshop-style wind trails, decaying max along the wind direction, with per-row noise lengths that differ per R/G/B channel plus channel shift = rainbow wind), The Streaker (long Gaussian streak blur along Angle, double-blended back over the saturated image), Wispy Squimsh (thresholded B&W image smeared along noise-curled wisps); approx.',1);
