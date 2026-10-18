/* ================= q51: Logik Matchbook shaders (round 18), ported from the .glsl inside each logik-matchbook.org/shader/<name>.tgz ================= */
// 3D value noise of the crok shaders: hash(n)=fract(sin(n)*K), n = p.x + p.y*57 + p.z*Z ; smooth = smoothstep-weighted or linear
const Q51_N3 = (o, x, K, Z, sm) => `{vec3 p_=floor(${x}),f_=fract(${x});${sm}float n_=p_.x+p_.y*57.+${Z}*p_.z;
 ${o}=mix(mix(mix(fract(sin(n_)*${K}),fract(sin(n_+1.)*${K}),f_.x),mix(fract(sin(n_+57.)*${K}),fract(sin(n_+58.)*${K}),f_.x),f_.y),
 mix(mix(fract(sin(n_+${Z})*${K}),fract(sin(n_+${Z}+1.)*${K}),f_.x),mix(fract(sin(n_+${Z}+57.)*${K}),fract(sin(n_+${Z}+58.)*${K}),f_.x),f_.y),f_.z);}`;

f = add('Render');
f('q51_mb_explosion','Volumetric Explosion (Matchbox crok_explosion_CFX)',[P('Detail',1,12,8,1),P('Volume steps',16,120,86,1),P('Time',0,20,0,.05),S('Background',['Black','Over image'])],
  `float tm=15.+u_p2;vec2 p=(uv-.5)*vec2(asp(),1.);vec3 ro=vec3(0.,0.,-6.),rd=normalize(vec3(p,1.));vec3 bg=u_p3>.5?c.rgb:vec3(0.);
 float bb=dot(ro,rd),ds=bb*bb-dot(ro,ro)+6.25;if(ds<=0.)return vec4(bg,1.);float mn=-bb-sqrt(ds),mx=-bb+sqrt(ds);
 float ld=0.,td=0.,w=0.,t=mn;vec4 col=vec4(bg,1.),sum=vec4(bg,0.);int ns=int(u_p1+.5),dt=int(u_p0+.5);
 for(int i=0;i<120;i++){if(i>=ns||td>.9||t>8.3333||sum.a>.99||t>mx)break;
  vec3 q=(ro+t*rd)*2.;float fb=0.,nv;
  for(int k=0;k<4;k++){float sc=k==0?3.0625:k==1?6.25:k==2?12.5:20.;vec3 x=q*sc;${Q51_N3('nv', 'x', '43758.5453', '113.', 'f_=f_*f_*(3.-2.*f_);')}fb+=nv*(k==0?.5:k==1?.25:k==2?.125:.2);}
  vec3 sp=q.zxy*.4132+333.;float sn=-mod(tm*.2,-2.),it=2.;
  for(int k=0;k<12;k++){if(k>=dt)break;sn-=abs(sin(sp.y*it)+cos(sp.x*it))/it;sp.xy+=vec2(sp.y,-sp.x)*4.;sp.xy*=.24253563;sp.xz+=vec2(sp.z,-sp.x)*4.;sp.xz*=.24253563;it*=1.733733;}
  float d=(length(q)-4.+fb+sn*6.)*.5;d=max(abs(d)+.07,.03);
  float lD=max(length(ro+t*rd),.001);sum.rgb+=vec3(.9,.55,.4)/exp(lD*lD*lD*.08)/30.;
  if(d<.1){ld=.1-d;w=(1.-td)*ld;td+=w+.005;vec3 cr=mix(vec3(1.,.9,.8),vec3(.4,.15,.1),td)*mix(vec3(5.6,7.,7.),vec3(.72,.795,.75),min((lD+.05)/.9,1.15));
   col+=vec4(cr,td);sum+=sum.a*vec4(sum.rgb,0.)*.2/lD;col.a*=.2;col.rgb*=col.a;sum+=col*(1.-sum.a);}
  td+=1./70.;t+=max(d*.08*max(min(lD,d),2.),.01);}
 sum*=exp(-ld*.2)*.8;sum=clamp(sum,0.,1.);sum.rgb=sum.rgb*sum.rgb*(3.-2.*sum.rgb);return vec4(mix(bg,sum.rgb,smoothstep(0.,5.,mx-mn)),1.);`,
  'crok_explosion_CFX (Ivar Beer after Duke\'s "Volumetric explosion"): ray-marched density = sphere + 4-octave value fbm + otaviogood spiral noise (Detail iterations), additive bloom, front-to-back accumulation with the Matchbox carry-over of the front colour; explosion centred, camera at z=-6 (Action camera / Z-depth input replaced by a fixed screen-space camera, approx.)');

f('q51_mb_skylapse','Sky Timelapse Generator (Matchbox JB_skyLapse)',[P('Aperture',.2,3,1,.01),P('Complexity',.5,6,2,.01),P('Horizon level',-5,8,2,.05),P('Time',0,500,0,1)],
  `vec2 pos=uv;pos.y+=u_p2/10.;vec2 co=vec2((pos.x-.5)/pos.y,1./(pos.y+.2))+u_p3*.01;vec3 x0=vec3(co,0.)*.5;float a=0.;
 for(int j=0;j<2;j++){vec3 x=x0;float fs=0.,nv;
  for(int k=0;k<5;k++){${Q51_N3('nv', 'x', '758.5453', '800.', '')}fs+=nv*(k==0?.5:k==1?-.25:k==2?.125:k==3?.0625:-.03125);x*=k==0?2.02:k==1?2.03:k==2?2.01:2.04;}
  fs/=.984375;if(j==0)x0=(vec3(co,.222)-fs*2.25)*u_p1;else{a=max(-(fs*2.2-1.1),0.);a*=a;}}
 vec3 cl=vec3(.2,.7,.8)+a*vec3(.2,.4,.1);vec2 fc=uv*u_res;cl+=fract(sin(fc.x+fc.y*9.9)*758.5453)*.01;cl*=.6-length(uv-.5)*.01;
 float w=length(cl)*u_p0;cl=mix(cl*vec3(1.,1.,1.6),vec3(w)*vec3(1.4,1.2,1.),w*1.1-.2);return vec4(cl,1.);`,
  'JB_skyLapse: perspective cloud plane (x/(y), 1/(y+0.2)) with domain-warped 5-octave value fbm (linear interpolation, alternating signs), sky colour + cloud density, aperture exposure mix toward warm white; Time scrolls the clouds');

f = add('Frames');
const Q51_ELL = (o, p, r) => `{vec2 e_=${p},r_=${r};float k1_=length(e_/r_),k2_=length(e_/(r_*r_));${o}=k1_<1e-5?-min(r_.x,r_.y):k1_*(k1_-1.)/max(k2_,1e-6);}`;
f('q51_mb_phonematte','Phone Camera Mockup Matte (Matchbox MM_PhoneMatte)',[P('Width',.1,2,.5,.01),P('Height',.1,2,1,.01),P('Corner radius',0,.5,.06,.005),S('Camera hole',['Off','Lozenge','Waterdrop','Phone notch'])],
  `
#define Q51RB(P0,HS,RA) (length(max(abs(P0)-(HS)+(RA),0.))+min(max(abs(P0).x-(HS).x+(RA),abs(P0).y-(HS).y+(RA)),0.)-(RA))
 vec2 a=(uv-.5)*vec2(asp(),1.);vec2 hs=vec2(u_p0,u_p1)*.5;float cr=clamp(u_p2,0.,min(hs.x,hs.y)),soft=.0015;
 float body=1.-smoothstep(0.,soft,Q51RB(a,hs,cr));int st=int(u_p3+.5);vec2 hp=a-vec2(0.,.42),hh=vec2(.0175);float dh=1e3;
 if(st==1)dh=Q51RB(hp,hh,min(hh.x,hh.y));
 else if(st==2){float r=hh.x,cy=-hh.y+r,ty=cy+r,ay=ty+min(max(hh.y-ty,0.),r*.4),by=cy+r*.65;vec2 A=vec2(0.,ay),B=vec2(r*.5,by),C=vec2(-r*.5,by);
  vec2 e0=B-A,e1=C-B,e2=A-C,v0=hp-A,v1=hp-B,v2=hp-C;vec2 q0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.),q1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.),q2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
  float sg=sign(e0.x*e2.y-e0.y*e2.x);vec2 dd=min(min(vec2(dot(q0,q0),sg*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(q1,q1),sg*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(q2,q2),sg*(v2.x*e2.y-v2.y*e2.x)));
  dh=min(length(hp-vec2(0.,cy))-r,-sqrt(dd.x)*sign(dd.y));}
 else if(st==3){float hw=hh.x,h=hh.y*2.,nw=hw*.3665,fy=h*.5626,cry=h*.3255,cs=max(h-cry,fy);float xq=hp.x,yq=hh.y-hp.y;float eL,eR,eC;
  ${Q51_ELL('eL', 'vec2(xq,yq)-vec2(-hw,fy)', 'vec2(hw*.6335,fy)')}${Q51_ELL('eR', 'vec2(xq,yq)-vec2(hw,fy)', 'vec2(hw*.6335,fy)')}${Q51_ELL('eC', 'vec2(xq,yq)-vec2(0.,cs)', 'vec2(nw,cry)')}
  float dT=max(Q51RB(vec2(xq,yq-fy*.5),vec2(hw,fy*.5),0.),max(-eL,-eR));float nh=max((cs-fy)*.5,1e-5);dh=min(dT,min(Q51RB(vec2(xq,yq-fy-nh),vec2(nw,nh),0.),eC));}
 float hole=st>0?1.-smoothstep(0.,soft,dh):0.;return vec4(c.rgb*body*(1.-hole),1.);`,
  'MM_PhoneMatte: rounded-rectangle phone body SDF (frame-height units, aspect-corrected) minus a camera cut-out (lozenge, waterdrop = circle + segment-SDF triangle, or traced notch = rect with two subtracted fillet ellipses + capsule), Edge Softness 0.0015, hole at (0, 0.42) size 0.035; the matte multiplies the image (source outputs it as alpha)');

f = add('Retro');
f('q51_mb_parallax','Amiga Parallax Texture Scroller (Matchbox crok_parallax)',[P('Intensity',.5,3,1.15,.01),P('Spacing',1,20,5,.1),P('Layers',2,30,10,1),S('Output',['Layers','Depth matte'])],
  `vec2 q=uv;float cs=cos(-.15),sn=sin(-.15);q*=mat2(cs,sn,-sn,cs);float col=0.,mt=1.;
 for(int i=1;i<30;i++){float fi=float(i);if(fi>=u_p2)break;float s=O(fract(q*(u_p1/fi)+vec2(fi,fi/2.3))).r;col=mix(col,1.,smoothstep(.9,1.,s*u_p0));mt=mix(mt,1./fi,smoothstep(.9,.91,s*u_p0));}
 return vec4(vec3(u_p3<.5?col:mt),1.);`,
  'crok_parallax: layers i = 1..Layers sample the texture input (here the image, repeat-wrapped) at zoom Spacing/i with per-layer offsets, threshold smoothstep(0.9,1,s*Intensity) paints white, the matte keeps 1/i of the last layer hit (depth); rotation -15 (x0.01 rad), time 0; layer 0 (1/0 zoom) skipped');

f = add('Render');
f('q51_mb_client','Hypnotic Spiral (Matchbox crok_client)',[P('Frequency',20,400,200,1),P('Arm twist',0,.2,.02,.001),P('Time',0,20,0,.01)],
  `vec2 q=uv-.5;q.x*=asp();float r=length(q),a=atan(q.y,q.x);return vec4(vec3(clamp(sin(u_p0*(sqrt(r)-u_p1*a-.5*u_p2*.05)),0.,1.)),1.);`,
  'crok_client (after FabriceNeyret2 ldBGDc): v = clamp(sin(200*(sqrt(r) - 0.02*angle - 0.5*t)),0,1)');

f('q51_mb_beer','Beer Foam Structure (Matchbox crok_beer)',[P('Iterations',1,30,11,1),P('Flow noise',0,100,50,.5),P('Distortion',.05,3,1,.01),P('Zoom',.25,4,1,.01)],
  `vec2 R2=u_res;vec2 q=.15*u_p3*(2.*uv*R2-R2)/(.5*(R2.x+R2.y));vec3 dir=vec3(q,1.);dir.x*=R2.x/R2.y;float v=0.;int itn=int(u_p0+.5);
 for(int ri=10;ri<16;ri++){vec3 p=vec3(0.,0.,-1.93)+float(ri)*dir*.07;float d=max(0.,u_p2-max(0.,length(p)-1.))/u_p2;float x=max(.2,p.x*2.);
  p.y*=1.+max(0.,-p.x-.25)*1.5;p-=d*normalize(p)*u_p1;p=abs(fract((p+vec3(20.54,142.,-1.55))*.1)-.5);
  for(int k=0;k<30;k++){if(k>=itn)break;p=abs(p)/dot(p,p)-.7;}
  v+=min(50.,length(p)*(1.2+d*1.5*x)+d*1.5*x)*.3;}
 v=v/16.*.8;vec3 col=v*vec3(1.,.65,.35);col*=.75-length(sqrt(3.*q*q));col*=length(col)*50.;return vec4(col,1.);`,
  'crok_beer (Redexe glslsandbox 15616): 6 ray samples of the "wind" kaliset field abs(p)/dot(p,p)-0.7 around a perturbed sphere, glow 1.5, brightness 0.8, tint (1,.65,.35), radial falloff and length(col)*50 contrast; noise-texture dither input = white');

const Q51_ICEW = 'float[32](.5,.25,.125,.0625,0.,0.,0.,0., .625,.5,.25,.125,.0625,0.,0.,0., .55,.45,.35,.25,.125,.0625,0.,0., .75,.625,.5,.375,.25,.125,.0625,.0315)';
f('q51_mb_ice','Ice Structures (Matchbox crok_ice)',[P('Volume steps',16,160,128,1),S('Noise mode',['fbm 1','fbm 2','fbm 3','fbm 4']),P('Offset',-2,4,1.5,.01),P('Detail',0,3,1,.01)],
  `mat3 M=mat3(0.,.8,.6,-.8,.36,-.48,-.6,-.48,.64);float W[32]=${Q51_ICEW};float SC[32]=float[32](2.02,2.03,2.01,1.,1.,1.,1.,1., 2.03,2.02,2.03,2.01,1.,1.,1.,1., 2.03,2.02,2.03,2.03,2.01,1.,1.,1., 2.01,2.04,2.02,2.015,2.03,2.01,2.003,1.);
 int md=int(u_p1+.5),no=md==0?4:md==1?5:md==2?6:8;vec2 p2=(uv-.5)*vec2(asp(),1.);vec3 ro=vec3(fract(u_seed*.731)*40.,fract(u_seed*.377)*40.,0.),rd=normalize(vec3(p2*1.2,1.));
 vec3 pos=ro;float ins=0.;int ns=int(u_p0+.5);
 for(int i=0;i<160;i++){if(i>=ns)break;vec3 x=pos;float fs=0.,nv;
  for(int k=0;k<8;k++){if(k>=no)break;${Q51_N3('nv', 'x', '43758.5453', '113.', 'f_=f_*f_*((u_p3+1.)-u_p3*f_);')}fs+=W[md*8+k]*(nv*2.-1.);x=(md==3||(k==0&&md>0))?M*x*SC[md*8+k]:x*(M*SC[md*8+k]);}
  float d=fs*.8+.2*u_p2;d=max(abs(d),.0005)*sign(d);if(d<0.)ins-=d;pos+=abs(d)*rd;}
 vec3 col=clamp(exp(-ins*ins*vec3(2.4,.6,.3)),0.,1.);col=mix(vec3(dot(col,vec3(.2125,.7154,.0721))),col,.3);return vec4(col,1.);`,
  'crok_ice (after simesgreen Msf3Dj "sphere tracing transparent stuff"): sphere-trace through d = fbm*0.8 + 0.2*Offset (4 fbm variants exactly as the Matchbox, Detail = smoothstep exponent), sum the distance travelled inside, colour = exp(-dist^2*(2.4,0.6,0.3)), saturation 0.3; Lightbox camera replaced by a screen-space perspective ray from a seeded origin (approx.)',true);

f = add('Noise');
f('q51_mb_oceannoise','Ocean Noise Pattern (Matchbox crok_ocean_noise)',[P('Zoom',.1,4,1,.01),P('Saturation',0,2,0,.01),P('Brightness',0,2,.8,.01),P('Contrast',0,3,1.2,.01)],
  `vec3 v;for(int ch=0;ch<3;ch++){float zm=(ch==0?.5:ch==1?2.5:15.)*u_p0,of=ch==0?1.:ch==1?8.:3.;vec2 p0=2.*(uv-.5)*zm;vec2 off=vec2(0.);float res=0.;
  for(int j=0;j<3;j++){vec2 p=j==0?p0:j==1?p0+10.:p0+off;float tot=0.,sc=1.;
   for(int k=0;k<8;k++){vec2 q=p*sc+of;vec2 it=smoothstep(0.,1.,fract(q)),fl=floor(q),ce=ceil(q);
    float sw=fract(sin(fl.x+fl.y*10000.)*10000.),se=fract(sin(ce.x+fl.y*10000.)*10000.),nw=fract(sin(fl.x+ce.y*10000.)*10000.),ne=fract(sin(ce.x+ce.y*10000.)*10000.);
    tot+=mix(mix(sw,se,it.x),mix(nw,ne,it.x),it.y)/sc;sc*=2.;}
   tot/=1.9921875;if(j==0)off.x=tot;else if(j==1)off.y=tot;else res=tot;}
  v[ch]=res;}
 vec3 col=mix(vec3(dot(v,vec3(.2125,.7154,.0721))),v,u_p1);col=mix(vec3(.5),col,u_p3)-1.+u_p2;return vec4(col,1.);`,
  'crok_ocean_noise (pixelshaders.com noise): per channel nested moving noise n(p+(n(p),n(p+10))), 8-octave smooth value noise, channel zooms 0.5/2.5/15 x Zoom and offsets 1/8/3, then saturation, contrast about 0.5 and brightness offset as in the Matchbox (time 0, tint off)');

f = add('Render');
f('q51_mb_folding','Folding Reflection-Map Texture (Matchbox crok_folding)',[P('Noise',0,6,3,.01),P('Detail',0,5,1.5,.01),P('Iterations',1,12,3,1),P('Offset',-10,10,0,.01)],
  `vec2 z=2.*(uv-.5);z.x*=asp();float col=0.,tm=u_p3;
 for(int i=0;i<12;i++){float fi=float(i);if(fi>=u_p2)break;z.x+=sin(u_p0*sin(length(z.y+5.)));
  col+=sin(.6*u_p1*sin(length(uv)+z.x+fi*z.y+sin(fi+z.x+tm)))+sin(u_p0*cos(sin(z.y+z.x)*.5));col=sin(col*1.5);z.y+=col*1.5;z.x-=sin(z.y-cos(dot(z,vec2(col,sin(col*2.)))));}
 return vec4(abs(col)*vec3(.9,.95,1.),1.);`,
  'crok_folding: iterated sine folding of the zoomed coordinate (Noise, Detail, Iterations), output abs(colour) x (0.9,0.95,1.0); Offset = the time phase');

f = add('Edges');
const Q51_DIL = (src, ax, sz, last) => `float sx=${sz};int km=int(u_p2+.5),cm=int(u_p3+.5);vec3 sc=cm==1?vec3(.05,.2,.05):cm==2?vec3(.05,.05,.2):cm==3?vec3(0.):vec3(1.);
 bool uc=cm>0;float sg=sign(sx),ax=abs(sx);vec3 best=${src}(uv).rgb+(uc?0.:sg);float bd=distance(best,sc);int sup=int(ax*3.);
 for(int i=1;i<=60;i++){if(i>sup)break;float x=float(i)/ax;if(uc&&x>1.)break;
  float wg=km==0?step(x,.9999):km==1?(x<1.?1.:x<1.+1./ax?1.-(x-1.)*ax:0.):km==2?1.-clamp(x,0.,1.):km==3?sqrt(1.-pow(clamp(x,0.,1.),2.)):exp(-.5*x*x);
  vec3 a=${src}(uv-${ax}*float(i)*u_px).rgb,b=${src}(uv+${ax}*float(i)*u_px).rgb;
  if(uc){float da=distance(a,sc),db=distance(b,sc);if(sx>0.){if(da<bd){best=a;bd=da;}if(db<bd){best=b;bd=db;}}else{if(da>bd){best=a;bd=da;}if(db>bd){best=b;bd=db;}}}
  else{a+=sg*wg;b+=sg*wg;best=sx>0.?max(best,max(a,b)):min(best,min(a,b));}}
 if(!uc)best-=sg;return vec4(${last ? 'clamp(best,0.,1.)' : 'best'},1.);`;
f('q51_mb_lsdilate','Colour-Proximity Dilate / Erode (Matchbox Ls_Dilate)',[P('Size',-10,10,2,.1,'px'),P('Stretch',0,1,.5,.01),S('Kernel',['Box','Box AA','Triangle','Ball','Gaussian'],1),S('Weight by colour',['Off','Green screen','Blue screen','Black','White'])],
  [Q51_DIL('O', 'vec2(1.,0.)', '(1.-u_p1)*2.*u_p0*u_k', false), Q51_DIL('T', 'vec2(0.,1.)', 'u_p1*2.*u_p0*u_k', true)],
  'Ls_Dilate (lewis saunders): separable H then V morphological dilate (Size>0) / erode (Size<0) with non-flat structuring element (box, AA box, triangle, ball, gaussian weights added before max/min, support 3x size); Weight by colour = pick the neighbour closest to (dilate) or farthest from (erode) the screen colour within the box; Stretch splits size between axes; strength map = 1; vertical pass uses its own size sign');

// fizzer's fr-025 tribute: one inline copy of sceneDist (evaluated 15x marching + 4x normal) and of room() (2 calls) inside loops
const Q51_CAP = (o, P0, A, Dv, h0, h1, r0, r1) => `{vec3 dn_=normalize(${Dv});float tt_=clamp(dot((${P0})-(${A}),dn_),${h0},${h1});${o}=distance((${A})+tt_*dn_,${P0})-mix(${r0},${r1},tt_);}`;
const Q51_SD = `{vec3 p=sp+vec3(0.,1.05,0.);p=vec3(p.z,p.y,-p.x);p.z+=cos(p.y*2.+tm)*.1;float tq=fract(tm-.1);p.x-=(smoothstep(0.,.3,tq)-smoothstep(.4,1.,tq))*smoothstep(.5,2.,p.y)*.2+scroll;
 float d=1e3,d0,d1;vec3 o;
 o=p+vec3(0.,0.,.2);${Q51_CAP('d0', 'o', 'vec3(lg0[0],0.)', 'vec3(lg0[1]-lg0[0],0.)', '0.', '.92', '.1', '.1')}${Q51_CAP('d1', 'o', 'vec3(lg0[1],0.)', 'vec3(lg0[2]-lg0[1],0.)', '.08', '1.', '.1', '.2')}d=min(d,Q51SM(d0,d1,15.));
 o=p+vec3(0.,0.,-.2);${Q51_CAP('d0', 'o', 'vec3(lg1[0],0.)', 'vec3(lg1[1]-lg1[0],0.)', '0.', '.92', '.1', '.1')}${Q51_CAP('d1', 'o', 'vec3(lg1[1],0.)', 'vec3(lg1[2]-lg1[1],0.)', '.08', '1.', '.1', '.2')}d=min(d,Q51SM(d0,d1,15.));
 p.y-=bob;
 o=p+vec3(0.,0.,.4);${Q51_CAP('d0', 'o', 'vec3(am0[0],0.)', 'm0*vec3(am0[1]-am0[0],0.)', '0.', '.62', '.03', '.03')}${Q51_CAP('d1', 'o', 'vec3(am0[0],0.)+m0*vec3(am0[1]-am0[0],0.)', 'm0*vec3(am0[2]-am0[1],0.)', '.08', '.7', '.03', '.06')}d=min(d,Q51SM(d0,d1,15.));
 o=p+vec3(0.,0.,-.4);${Q51_CAP('d0', 'o', 'vec3(am1[0],0.)', 'm1*vec3(am1[1]-am1[0],0.)', '0.', '.62', '.03', '.03')}${Q51_CAP('d1', 'o', 'vec3(am1[0],0.)+m1*vec3(am1[1]-am1[0],0.)', 'm1*vec3(am1[2]-am1[1],0.)', '.08', '.7', '.03', '.06')}d=min(d,Q51SM(d0,d1,15.));
 d=Q51SM(d,length(max(vec3(0.),abs(p+vec3(0.,-.7,0.))-vec3(.05,.7,.15)))-.1,15.);d=Q51SM(d,length(max(vec3(0.),abs(p+vec3(-.1,-1.1,0.))-vec3(.005,.02,.015)))-.1,5.);
 sd=Q51SM(d,distance(p,vec3(0.,1.825,0.))-.2,15.);}`;
const Q51_IK = (o, a, b, l, sd) => `{vec2 pp_=(${b})-(${a});vec2 q_=pp_*.5;float s_=${l}*${l}/dot(q_,q_)-1.;${o}=(${a})+(s_<0.?vec2(-100.):q_+q_.yx*vec2(-1.,1.)*${sd}*sqrt(max(s_,0.)));}`;
f('q51_mb_populardemo','fr-025 the.popular.demo Tribute (Matchbox the_popular_demo)',[P('Time',0,60,10,.05)],
  `
#define Q51SM(A0,B0,K0) (-log(exp(-(K0)*(A0))+exp(-(K0)*(B0)))/(K0))
#define Q51PY(X0) min(fract(X0)*2.,(1.-fract(X0))*2.)
#define Q51RX(A0) mat3(1.,0.,0.,0.,cos(A0),-sin(A0),0.,sin(A0),cos(A0))
#define Q51RY(A0) mat3(cos(A0),0.,-sin(A0),0.,1.,0.,sin(A0),0.,cos(A0))
 float time=u_p0,bob=cos(time*12.)*.05,scroll=-15.+mod(time*.5,15.)*2.,tm=time,lt=mod(time*.5,15.)/15.;
 vec2 p=uv*2.-1.;p.x*=asp();mat3 cam=Q51RX(cos(time*.2)*.1)*Q51RY(time*.5);vec3 ro=cam*vec3(0.,-.15+lt*.15,.15+lt*.2)+vec3(0.,0.,scroll/15.),rd=normalize(cam*vec3(p,-1.));
 vec2 lg0[3],lg1[3],am0[3],am1[3];float tw=time*.5;
 lg0[0]=vec2(0.,bob);lg0[2]=vec2(Q51PY(tw)-.3,-1.8+.3*sqrt(1.-pow(fract(tw*2.)*2.-1.,2.))*step(fract(tw),.5));${Q51_IK('lg0[1]', 'lg0[0]', 'lg0[2]', '1.', '1.')}
 am1[0]=vec2(0.,1.4);am1[2]=vec2(Q51PY(tw)-.3,.1+pow(Q51PY(tw),2.)*.7);${Q51_IK('am1[1]', 'am1[0]', 'am1[2]', '.7', '-1.')}
 tw+=.5;lg1[0]=vec2(0.,bob);lg1[2]=vec2(Q51PY(tw)-.3,-1.8+.3*sqrt(1.-pow(fract(tw*2.)*2.-1.,2.))*step(fract(tw),.5));${Q51_IK('lg1[1]', 'lg1[0]', 'lg1[2]', '1.', '1.')}
 am0[0]=vec2(0.,1.4);am0[2]=vec2(Q51PY(tw)-.3,.1+pow(Q51PY(tw),2.)*.7);${Q51_IK('am0[1]', 'am0[0]', 'am0[2]', '.7', '-1.')}
 mat3 m0=Q51RX(-.3)*Q51RY((cos((time*.5+.5)*6.2831853)-.6)*.5),m1=Q51RX(.3)*Q51RY(-(cos(time*.5*6.2831853)-.6)*.5);
 vec3 c0=vec3(0.),cc=vec3(0.),rp0=vec3(0.),n0=vec3(0.),r0=ro,r1=rd;bool hit=false;
 for(int k=0;k<2;k++){vec3 RO=r0,RD=r1;vec2 bs=vec2(1.,5.375),cp=vec2(0.),ct=vec2(1e3);
  for(int i=0;i<8;i++){vec2 tcp=vec2(.3125*(i<4?-1.:1.),float(i-(i/4)*4)-2.+.0625);vec2 o2=(RO.xz-tcp)/.03,d2=RD.xz/.03;float qa=dot(d2,d2),qb=2.*dot(d2,o2),ds=qb*qb-4.*qa*(dot(o2,o2)-1.);
   vec2 tct=ds<0.?vec2(1e3):(-qb-sqrt(max(ds,0.))*vec2(-1.,1.))/(2.*qa);if(tct.y>0.&&tct.y<ct.y){ct=tct;cp=tcp;}}
  ct.y=max(0.,ct.y);vec3 ci=RO+RD*ct.y;vec2 cu=vec2(atan(ci.z-cp.y,ci.x-cp.x)/6.2831853,(ci.y+.0625)*4.);
  vec2 s0=(vec2(1.)-RO.xy*bs)/(RD.xy*bs),s1=(vec2(-1.)-RO.xy*bs)/(RD.xy*bs),mxs=max(s0,s1);float wt=max(0.,min(mxs.x,mxs.y));float t=min(ct.y,wt);
  vec3 rp=RO+RD*(t-1e-4),n=vec3(0.);if(abs(rp.x*bs.x)>abs(rp.y*bs.y))n.xy=vec2(rp.x/abs(rp.x),0.);else n.xy=vec2(0.,rp.y/abs(rp.y));if(ct.y<wt){n.y=0.;n.xz=normalize(rp.xz-ci.xz);}
  float l=1.-smoothstep(0.,3.,abs(rp.z-RO.z));vec3 tx[3];
  for(int j=0;j<3;j++){vec2 q=j==0?rp.zy+vec2(0.,.0625):j==1?rp.xz:cu;float bd=j==0?.5:j==1?.44:.45;vec2 ip=floor(q*8.)/8.,fp=fract(q*8.);
   float mm=1.-max(smoothstep(bd-.02,bd,abs(fp.x-.5)),smoothstep(bd-.02,bd,abs(fp.y-.5)))+1.-smoothstep(0.,.56,distance(fp,vec2(.5)));
   vec2 sq=ip+vec2(time*.2);vec3 orn=vec3(2.,.8,.2),pur=vec3(.8,.16,.4);float ll=pow(.5+.5*cos(sq.x*7.+cos(sq.y)*8.)*sin(sq.y*2.),4.)*2.;
   vec3 sc=pow(ll*(mix(orn,pur,.5+.5*cos(sq.x*40.+sin(sq.y*10.)*3.))+mix(orn,pur,.5+.5*cos(sq.x*20.+sin(sq.y*3.)*3.))),vec3(1.2))*.7;
   sc+=vec3(1.,.8,.4)*pow(.5+.5*cos(sq.x*20.)*sin(sq.y*12.),20.)*2.;sc+=vec3(.1,.5+.5*cos(sq*20.))*vec3(.4,.1,.05)*.7;tx[j]=mm*sc;}
  vec3 wc=mix(tx[0],tx[1],step(.999/bs.y,abs(rp.y))),cl=tx[2]+.8*vec3(smoothstep(.166,.172,abs(rp.y)));vec3 rc=l*mix(cl,wc,step(wt,t));
  if(k==0){c0=rc;rp0=rp;n0=n;
   vec3 sro=RO*15.,srd=RD*15.;float tr=0.,rt=1e4;vec3 hp=vec3(0.),nn=vec3(0.);float c4=0.;
   for(int i=0;i<19;i++){vec3 sp;if(i<15)sp=sro+srd*tr;else{if(i==15)hp=(RO+RD*rt)*15.;sp=hp+(i==16?vec3(1e-3,0.,0.):i==17?vec3(0.,1e-3,0.):i==18?vec3(0.,0.,1e-3):vec3(0.));}
    float sd;${Q51_SD}
    if(i<15){if(sd<1e-2)rt=tr;tr+=sd/15.;}else if(i==15)c4=sd;else nn[i-16]=sd-c4;}
   if(rt<distance(RO,rp)){hit=true;rp0=RO+RD*rt;n0=normalize(nn);}
   r0=rp0;r1=reflect(RD,n0);}
  else cc=rc;}
 vec3 col=hit?vec3(.5+.5*n0.y)*.5*vec3(1.,.8,.5)+cc*.5:c0+cc*c0*.4;
 col+=vec3(1.-(smoothstep(0.,.07,lt)-smoothstep(.93,1.,lt)))+.6*((sin(p.y)*cos(p.x+time*2.)*.5+.5)*pow(mix(vec3(1.,.7,.1),vec3(1.,.2,.6),.5+.5*cos(p.x+sin(time*3.+p.y*2.))),vec3(2.)));
 col*=1.3;col*=.5+.5*pow(16.*uv.x*uv.y*(1.-uv.x)*(1.-uv.y),.1);return vec4(col,1.);`,
  'the_popular_demo (fizzer, after Farbrausch fr-025): ray-cast disco corridor (pillar circles + unit-square slab walls with 8x8 square-pattern texture, one reflection bounce) and a 15-step sphere-traced walking robot (2-bone IK legs/arms from capsules, soft-min joins, box torso, sphere head); Time = demo time (scene fades in from white during the first ~2 s of each 30 s loop)');
