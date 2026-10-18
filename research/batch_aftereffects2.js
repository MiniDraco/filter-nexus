/* ================= aftereffects (2/3): After Effects distort / tile / bump-shading / blur effects (single-frame) ================= */
/* channel blur pass: per-channel Gaussian (radii u_p0..u_p2) along dir, skipped when Blur Dimensions excludes it */
const AEB_CB = (dir, skip) => `if(int(u_p3+.5)==${skip})return T(uv);vec3 rr=vec3(R(u_p0),R(u_p1),R(u_p2));float mr=max(rr.r,max(rr.g,rr.b));
 if(mr<.5)return T(uv);float st=max(1.,mr/24.);vec3 sg=max(rr*.5,vec3(.01));vec3 acc=vec3(0.),w=vec3(0.);
 for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>mr)continue;vec3 g=exp(-vec3(x*x)/(2.*sg*sg))*step(vec3(abs(x)),rr+.001);
  acc+=T(uv+${dir}*x*u_px).rgb*g;w+=g;}
 return vec4(acc/max(w,vec3(1e-5)),1.);`;
/* fractal noise with fractional octave count (complexity) in variable oc */
const AEB_TF = `
#define AETF(res,pp) {float a_=.5,s_=0.,w_=0.;vec2 q_=(pp);for(int i_=0;i_<10;i_++){float k_=clamp(oc-float(i_),0.,1.);if(k_<=0.)break;s_+=a_*k_*vnoise(q_);w_+=a_*k_;q_=q_*2.03+vec2(1.7,9.2);a_*=.5;}res=s_/max(w_,1e-4);}
`;

f = add('Distort');
f('ae_turbdisplace','Turbulent Displace (After Effects)',[S('Displacement',['Turbulent','Bulge','Twist','Turbulent Smoother','Horizontal Displacement','Vertical Displacement','Cross Displacement']),
  P('Amount',0,150,50,1),P('Size',5,300,80,1,'px'),P('Complexity',1,6,1.5,.1)],
  `${AEB_TF}
 vec2 p=PX(uv)/u_p2;float oc=u_p3;int m=int(u_p0+.5);float amt=u_p1;float fx,fy;vec2 d;
 if(m==1||m==2){float h0,h1,h2;float e=.12;AETF(h0,p)AETF(h1,p+vec2(e,0.))AETF(h2,p+vec2(0.,e))vec2 g=vec2(h1-h0,h2-h0)/e;if(m==2)g=vec2(-g.y,g.x)*1.5;d=g*amt*.3;}
 else{if(m==3){oc=max(1.,oc*.5);p*=.7;}AETF(fx,p)AETF(fy,p+vec2(37.1,11.7))vec2 n=vec2(fx,fy)*2.-1.;
  d=m==4?vec2(n.x*1.4,0.):m==5?vec2(0.,n.y*1.4):m==6?vec2(n.x):n;d*=amt*.5;}
 return O(uv+fromPX(d));`,
  'AE Turbulent Displace: fractal value-noise displacement (complexity = fractional octave count); Bulge / Twist displace along / across the noise gradient; horizontal / vertical / cross variants',1);

f('ae_bend','Bend It / Bender / Bezier Warp / Slant / Split / Cylinder (After Effects)',[S('Effect',['CC Bend It','CC Bender','Bezier Warp (bowed edges)','CC Slant','CC Split','CC Cylinder']),
  P('Amount',-1,1,.4,.01),P('Position',0,1,.5,.01),S('Axis',['Vertical','Horizontal'])],
  `float A=asp();bool hz=u_p3>.5;vec2 p=hz?vec2(uv.y,uv.x*A):vec2(uv.x*A,uv.y);float W=hz?1.:A,H=hz?A:1.;
 int m=int(u_p0+.5);float am=u_p1,pos=u_p2;vec2 s=p;bool blank=false;float shade=1.;
 if(m==0){float ang=am*PI;vec2 S0=vec2(W*pos,0.);
  if(abs(ang)>1e-3){float rho=H/ang;vec2 C=S0+vec2(rho,0.);float k=sign(rho);vec2 v=p-C;float th=atan(k*v.y,-k*v.x);float mm=k*length(v);float sl=rho*th;
   vec2 E=C+rho*vec2(-cos(ang),sin(ang));vec2 Tg=vec2(sin(ang),cos(ang)),Nm=vec2(cos(ang),-sin(ang));
   if(sl>=0.&&sl<=H)s=vec2(S0.x+rho-mm,sl);else if(dot(p-E,Tg)>0.)s=vec2(S0.x+dot(p-E,Nm),H+dot(p-E,Tg));else blank=true;}}
 else if(m==1){float t=max(0.,(p.y-pos*H)/(H*(1.-pos)+1e-3));s.x=p.x-am*.5*W*t*t;}
 else if(m==2){float pp=clamp(pos,.05,.95);float ty=clamp(p.y/H,0.,1.),tx=clamp(p.x/W,0.,1.);
  float ky=ty<pp?.5*ty/pp:.5+.5*(ty-pp)/(1.-pp),kx=tx<pp?.5*tx/pp:.5+.5*(tx-pp)/(1.-pp);
  float bx=am*.12*W*4.*ky*(1.-ky),by=am*.12*H*4.*kx*(1.-kx);s=vec2((p.x+bx)/(W+2.*bx)*W,(p.y+by)/(H+2.*by)*H);}
 else if(m==3){s.x=p.x-am*(p.y-pos*H);}
 else if(m==4){float x0=W*pos;float w=abs(am)*.25*W*sin(PI*clamp(p.y/H,0.,1.));float dx=p.x-x0;if(abs(dx)<w)blank=true;else s.x=x0+sign(dx)*(abs(dx)-w);}
 else{float hw=W*.5*mix(.6,1.,pos);float xn=(p.x-W*.5)/hw;if(abs(xn)>1.)blank=true;else{float a=asin(xn);s.x=fract(a/PI+.5+am*.5)*W;
  shade=.3+.75*max(cos(a+.5),0.)+.35*pow(max(cos(a+.25),0.),30.);}}
 vec2 q=hz?vec2(s.y/A,s.x):vec2(s.x/A,s.y);
 if(blank||q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);
 return vec4(O(q).rgb*shade,1.);`,
  'AE CC Bend It (strip bent into a circular arc of the given angle above the start point, straight beyond the end), CC Bender (quadratic top bend), Bezier Warp with symmetric bowed edges (single-control approx.), CC Slant (shear about the floor), CC Split (lens-shaped opening pushing both sides apart), CC Cylinder (wrapped on a lit cylinder, rotation = amount); outside = black');

f('ae_pointwarp','CC Smear / CC Flo Motion / CC Ripple Pulse (After Effects)',[S('Effect',['CC Smear','CC Flo Motion','CC Ripple Pulse']),
  P('Center X',0,1,.4,.01),P('Center Y',0,1,.45,.01),P('Amount',-1,1,.5,.01)],
  `float A=asp();vec2 ct=vec2(u_p1,1.-u_p2);vec2 P=(uv-ct)*vec2(A,1.);int m=int(u_p0+.5);vec2 sp=P;vec3 add=vec3(0.);
 if(m==0){vec2 Dv=vec2(.35,-.12)*u_p3;float t=clamp(dot(P,Dv)/(dot(Dv,Dv)+1e-6),0.,1.);vec2 pr=Dv*t;float d=length(P-pr);float w=1.-smoothstep(.03,.12,d);sp=mix(P,P-pr,w);}
 else if(m==1){vec2 Q=uv*vec2(A,1.);vec2 k1=ct*vec2(A,1.),k2=(vec2(1.)-ct)*vec2(A,1.);vec2 v1=Q-k1,v2=Q-k2;float r1=length(v1),r2=length(v2);
  vec2 s1=k1+v1*pow(max(r1/.5,1e-4),u_p3*.8),s2=k2+v2*pow(max(r2/.5,1e-4),u_p3*.8);float w1=1./(r1*r1+.01),w2=1./(r2*r2+.01);
  vec2 Sq=(s1*w1+s2*w2)/(w1+w2);return vec4(O(fract(Sq/vec2(A,1.))).rgb,1.);}
 else{float r=length(P);float x=(r-.28)/.05;float dsp=u_p3*.04*sin(x*PI*1.5)*exp(-x*x/4.);sp=P-(r>1e-5?P/r:vec2(0.))*dsp;add=vec3(cos(x*PI*1.5)*exp(-x*x/4.)*u_p3*.15);}
 return vec4(O(ct+sp/vec2(A,1.)).rgb+add,1.);`,
  'CC Smear (content at the centre dragged along a stroke), CC Flo Motion (two knots — centre and its mirror — pulling the image with a power-law radial warp, tiled edges), CC Ripple Pulse (single damped ripple ring with highlight); approx.');

f('ae_tiles','Motion Tile / Griddler / HexTile / Ball Action / Card Dance (After Effects)',[S('Effect',['Motion Tile','Motion Tile (mirror edges)','CC Griddler','CC HexTile','CC Ball Action','Card Dance']),
  P('Tile size',5,60,25,.5,'%'),P('Amount (phase / rotation / scatter / dance)',-1,1,.3,.01),P('Scale / smear / twist',0,1,.5,.01)],
  `float A=asp();vec2 Q=uv*vec2(A,1.);float ts=u_p1/100.*A;int m=int(u_p0+.5);vec2 ctr=vec2(A*.5,.5);vec3 r=vec3(0.);
 if(m<=1){vec2 l=(Q-ctr)/vec2(ts,ts/A)+.5;float cy=floor(l.y);l.x+=u_p2*.5*cy;vec2 cl=floor(l),fr=fract(l);
  if(m==1){if(mod(cl.x,2.)>.5)fr.x=1.-fr.x;if(mod(cl.y,2.)>.5)fr.y=1.-fr.y;}r=O(fr).rgb;}
 else if(m==2){vec2 id=floor(Q/ts),l=fract(Q/ts)-.5;vec2 l2=rot(l,-u_p2*PI*.25)/mix(1.,.55,u_p3);
  if(max(abs(l2.x),abs(l2.y))<.5){vec2 q=(id+.5+l2)*ts/vec2(A,1.);r=O(clamp(q,0.,1.)).rgb;}}
 else if(m==3){float rd=ts*.5;vec2 sz=vec2(1.,1.7320508);vec2 pp=Q/rd;vec2 a=mod(pp,sz)-sz*.5,b=mod(pp-sz*.5,sz)-sz*.5;vec2 gv=dot(a,a)<dot(b,b)?a:b;
  vec2 cc=(pp-gv)*rd;vec2 sq=mix(ctr,cc,u_p3)+rot(gv*rd,u_p2*PI);vec2 q=sq/vec2(A,1.);q=1.-abs(1.-mod(q,2.));r=O(q).rgb;}
 else if(m==4){float g=ts*.4;vec2 Qt=ctr+rot(Q-ctr,u_p3*2.*length(Q-ctr));vec2 id=floor(Qt/g);float best=1e9;vec3 L=normalize(vec3(-.5,.6,.7));
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 cc=(cid+.5)*g+(hash2(cid)-.5)*abs(u_p2)*g;vec2 d=Qt-cc;float br=g*.45;
   if(length(d)<br&&length(d)<best){best=length(d);vec2 dn=d/br;vec3 n=vec3(dn,sqrt(max(1.-dot(dn,dn),0.)));vec3 col=O(clamp(cc/vec2(A,1.),0.,1.)).rgb;
    r=col*(.2+.9*max(dot(n,L),0.))+vec3(.45)*pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),30.);}}}
 else{float g=ts*.5;vec2 id=floor(Q/g);float bz=-1e9;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));vec2 cc=(cid+.5)*g;float lu=luma(O(clamp(cc/vec2(A,1.),0.,1.)).rgb);
   float z=(lu-.5)*u_p2*2.5;vec2 l=rot(Q-cc,-z*.8)/(1.+z*.5);
   if(max(abs(l.x),abs(l.y))<g*.46&&z>bz){bz=z;r=O(clamp((cc+l)/vec2(A,1.),0.,1.)).rgb*clamp(.8+.5*z+z*l.y/g*1.2,0.,1.6);}}}
 return vec4(r,1.);`,
  'AE Motion Tile (image shrunk to the tile size and repeated, row phase, optional mirror edges), CC Griddler (tiles rotated / scaled about their own centres), CC HexTile (hexagonal cells each showing a rotated copy, smear = cell→centre mix), CC Ball Action (grid of shaded spheres coloured by the image, scatter + twist), Card Dance (cards rotated / scaled / lit by their own luminance — 2-D approx.)',1);

f = add('Materials');
f('ae_bumpshade','CC Glass / CC Plastic / CC Blobbylize / CC Environment (After Effects)',[S('Effect',['CC Glass','CC Plastic','CC Blobbylize','CC Environment']),
  P('Softness',1,20,4,.5,'px'),P('Height',0,100,40,1),P('Light direction',0,360,135,1,'°')],
  [`return vec4(vec3(luma(c.rgb)),1.);`, BH('u_p1'), BV('u_p1'),
  `float e=R(1.5);vec2 dx=vec2(e,0.)*u_px,dy=vec2(0.,e)*u_px;int m=int(u_p0+.5);float h=T(uv).r;
 float hx=T(uv+dx).r-T(uv-dx).r,hy=T(uv+dy).r-T(uv-dy).r;float k=u_p2*.25;float b0=1.;
 if(m==2){b0=smoothstep(.42,.58,h);hx=smoothstep(.42,.58,T(uv+dx).r)-smoothstep(.42,.58,T(uv-dx).r);hy=smoothstep(.42,.58,T(uv+dy).r)-smoothstep(.42,.58,T(uv-dy).r);k=u_p2*.04;}
 vec3 n=normalize(vec3(-hx*k,-hy*k,1.));float a=radians(u_p3);vec3 ld=normalize(vec3(cos(a),sin(a),.8));float df=max(dot(n,ld),0.);vec3 hv=normalize(ld+vec3(0.,0.,1.));
 vec3 o=O(uv).rgb;vec3 r;
 if(m==0){vec2 sq=uv+n.xy*R(u_p2*.35)*u_px;r=O(sq).rgb*(.75+.4*df)+vec3(.7)*pow(max(dot(n,hv),0.),40.);}
 else if(m==1){r=o*(.3+.8*df)+vec3(.85)*pow(max(dot(n,hv),0.),22.);}
 else if(m==2){vec2 sq=uv+n.xy*R(u_p2*.3)*u_px;r=(O(sq).rgb*(.3+.8*df)+vec3(.8)*pow(max(dot(n,hv),0.),30.))*b0;}
 else{vec3 rf=reflect(vec3(0.,0.,-1.),n);vec2 eq=clamp(vec2(.5)+(uv-.5)*.35+rf.xy*.9,0.,1.);float fr=.35+.65*pow(1.-n.z,.6);
  r=mix(o,O(eq).rgb,clamp(fr,0.,1.))*(.55+.55*df)+vec3(.5)*pow(max(dot(n,hv),0.),40.);}
 return vec4(r,1.);`],
  'CC Glass / Plastic / Blobbylize / Environment with the layer itself as bump (luminance blurred by Softness): normals → diffuse + Blinn specular; glass and blobs refract by the normal, blobs cut where the blurred luminance < ½, environment reflects the image itself (approx.)');

f = add('Blur');
f('ae_channelblur','Channel Blur (After Effects)',[P('Red blurriness',0,40,0,.5,'px'),P('Green blurriness',0,40,4,.5,'px'),P('Blue blurriness',0,40,12,.5,'px'),
  S('Blur dimensions',['Horizontal and vertical','Horizontal','Vertical'])],
  [AEB_CB('vec2(1.,0.)', 2), AEB_CB('vec2(0.,1.)', 1)],
  'AE Channel Blur: separate Gaussian radius for R, G and B (separable, per-channel weights), optionally one direction only');
f('ae_crossblur','CC Cross Blur (After Effects)',[P('Radius X',0,60,20,.5,'px'),P('Radius Y',0,60,20,.5,'px'),
  S('Transfer mode',['None','Add','Screen','Lighten','Darken','Multiply','Overlay'])],
  [`return blur1d(u_orig,uv,vec2(1.,0.),R(u_p0));`,
   `vec3 h=T(uv).rgb;vec3 v=blur1d(u_orig,uv,vec2(0.,1.),R(u_p1)).rgb;vec3 b=(h+v)*.5;vec3 o=O(uv).rgb;int m=int(u_p2+.5);
 vec3 r=m==0?b:m==1?o+b:m==2?screen(o,b):m==3?max(o,b):m==4?min(o,b):m==5?o*b:overlay(o,b);return vec4(clamp(r,0.,1.),1.);`],
  'CC Cross Blur: horizontal and vertical blurs computed separately and averaged (cross-shaped kernel), composited on the original with a transfer mode');
f('ae_vectorblur','CC Vector Blur (After Effects)',[S('Type',['Natural','Constant length','Perpendicular','Direction center','Direction fading']),
  P('Amount',0,60,15,.5,'px'),P('Angle offset',0,360,0,1,'°'),P('Ridge smoothness',0,20,4,.5,'px')],
  [`return vec4(vec3(luma(c.rgb)),1.);`, BH('u_p3'), BV('u_p3'),
   `float e=R(1.5);vec2 dx=vec2(e,0.)*u_px,dy=vec2(0.,e)*u_px;vec2 g=vec2(T(uv+dx).r-T(uv-dx).r,T(uv+dy).r-T(uv-dy).r)/(2.*max(e,1e-3));
 float mag=clamp(length(g)*30.,0.,1.);vec2 dir=length(g)>1e-7?normalize(g):vec2(1.,0.);dir=rot(dir,radians(u_p2));int m=int(u_p0+.5);if(m==2)dir=vec2(-dir.y,dir.x);
 float len=R(u_p1)*(m==1||m==3?1.:mag);vec3 acc=vec3(0.);float w=0.;
 for(int i=0;i<=24;i++){float t=float(i)/24.;float off,wt;if(m==4){off=t*len;wt=1.-t*.9;}else if(m==3){off=(2.*t-1.)*len;wt=1.;}else{off=(2.*t-1.)*len;wt=exp(-(2.*t-1.)*(2.*t-1.)*2.);}
  acc+=O(uv+dir*off*u_px).rgb*wt;w+=wt;}
 return vec4(acc/w,1.);`],
  'CC Vector Blur: blur along the gradient field of the smoothed luminance (natural = length ∝ gradient, constant, perpendicular = along isophotes, centred box, one-sided fading); type semantics approx.');
