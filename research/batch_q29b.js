/* ================= q29b: Premiere Pro VR (immersive, equirectangular 360) effects, FidelityFX CACAO, screen-space contact shadows ================= */
const Q29_DIR = `
#define EQDIR(UU) vec3(cos(((UU).y-.5)*PI)*sin(((UU).x-.5)*2.*PI),sin(((UU).y-.5)*PI),cos(((UU).y-.5)*PI)*cos(((UU).x-.5)*2.*PI))
#define DIRUV(DD) vec2(atan((DD).x,(DD).z)/(2.*PI)+.5,asin(clamp((DD).y,-1.,1.))/PI+.5)
#define YPDIR(YW,PT) vec3(cos(PT)*sin(YW),sin(PT),cos(PT)*cos(YW))
`;
f = add('Blur');
f('q29_vrfx','VR Blur / Glow / Sharpen / De-Noise (360, Premiere)',[S('Effect',['VR Blur','VR Glow','VR Sharpen','VR De-Noise']),P('Radius',1,60,8,.5,'px'),P('Amount',0,2,1,.01),P('Threshold or tolerance',0,1,.6,.01)],
  [`int m=int(u_p0+.5);float lat=(uv.y-.5)*PI;float rx=min(R(u_p1)/max(cos(lat),.02),u_res.x*.5);float st=max(1.,rx/24.),sg=max(rx*.5,.5);vec3 c0=O(uv).rgb;float tl=.02+.2*u_p3;vec3 acc=vec3(0.);float ws=0.;
 for(int i=-24;i<=24;i++){float dx=float(i)*st;if(abs(dx)>rx)continue;vec3 v=O(vec2(fract(uv.x+dx*u_px.x),uv.y)).rgb;float w=exp(-.5*dx*dx/(sg*sg));if(m==3)w*=exp(-.5*dot(v-c0,v-c0)/(tl*tl));if(m==1)v=max(v-u_p3,0.)/max(1.-u_p3,.05);acc+=v*w;ws+=w;}
 return vec4(acc/ws,1.);`,
  `int m=int(u_p0+.5);float ry=R(u_p1),st=max(1.,ry/24.),sg=max(ry*.5,.5);vec3 c0=T(uv).rgb;float tl=.02+.2*u_p3;vec3 acc=vec3(0.);float ws=0.;
 for(int i=-24;i<=24;i++){float dy=float(i)*st;if(abs(dy)>ry)continue;vec2 q=vec2(uv.x,uv.y+dy*u_px.y);if(q.y>1.)q=vec2(fract(q.x+.5),2.-q.y);if(q.y<0.)q=vec2(fract(q.x+.5),-q.y);
  vec3 v=T(q).rgb;float w=exp(-.5*dy*dy/(sg*sg));if(m==3)w*=exp(-.5*dot(v-c0,v-c0)/(tl*tl));acc+=v*w;ws+=w;}
 return vec4(acc/ws,1.);`,
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb,b=T(uv).rgb;vec3 x=m==1?screen(o,clamp(b*u_p2*1.5,0.,1.)):m==2?o+(o-b)*u_p2:mix(o,b,min(u_p2,1.));return vec4(clamp(x,0.,1.),1.);`],
  'Premiere Pro Immersive VR Blur / Glow / Sharpen / De-Noise, single frame, approx.: the image is treated as equirectangular 360: separable Gaussian whose horizontal radius grows as 1 / cos(latitude) (constant angular size on the sphere), wrapping across the left/right seam and over the poles (row mirrored, longitude + 180 deg); Glow = thresholded bright parts blurred and screened; Sharpen = unsharp mask; De-Noise = the same kernel made colour-edge-preserving (separable bilateral, tolerance)');

f = add('Render');
f('q29_vrnoise','VR Fractal Noise (360, Premiere)',[P('Scale',1,30,6,.1),P('Complexity',1,8,6,1),P('Contrast',.2,4,1.6,.01),P('Opacity',0,1,1,.01)],
  Q29_DIR+`
#define H3(QQ) fract(sin(dot((QQ),vec3(127.1,311.7,74.7))+u_seed*7.13)*43758.5453)
vec3 p=EQDIR(uv)*u_p0+vec3(3.1,7.7,1.3);float am=.5,acc=0.,nn=0.;int oc=int(u_p1+.5);
 for(int k=0;k<8;k++){if(k>=oc)break;vec3 i=floor(p),fq=fract(p);fq=fq*fq*(3.-2.*fq);
  float v=mix(mix(mix(H3(i),H3(i+vec3(1.,0.,0.)),fq.x),mix(H3(i+vec3(0.,1.,0.)),H3(i+vec3(1.,1.,0.)),fq.x),fq.y),mix(mix(H3(i+vec3(0.,0.,1.)),H3(i+vec3(1.,0.,1.)),fq.x),mix(H3(i+vec3(0.,1.,1.)),H3(i+vec3(1.,1.,1.)),fq.x),fq.y),fq.z);
  acc+=am*v;nn+=am;p=p*2.03+vec3(1.7,4.1,2.3);am*=.5;}
 float n=clamp((acc/nn-.5)*u_p2+.5,0.,1.);return vec4(mix(c.rgb,vec3(n),u_p3),1.);`,
  'Premiere Pro VR Fractal Noise, approx.: fractal (fBm) value noise evaluated in 3-D on the unit sphere direction of each equirectangular pixel, so it is seamless at the 360 seam and undistorted at the poles; scale = noise frequency on the sphere, complexity = octaves', true);

f('q29_vrgradient','VR Color Gradients (360, Premiere)',[S('Points',['Sky dome (4)','Four hues around (4)','Two poles (2)']),P('Falloff',.5,6,2,.05),P('Rotation',-180,180,0,1,'deg'),P('Opacity',0,1,.7,.01)],
  Q29_DIR+`int m=int(u_p0+.5);vec3 d=EQDIR(uv);float r0=radians(u_p2);vec3 pd[4];vec3 pc[4];
 if(m==0){pd[0]=YPDIR(r0,1.5707);pc[0]=vec3(.1,.25,.7);pd[1]=YPDIR(r0,0.);pc[1]=vec3(1.,.68,.42);pd[2]=YPDIR(r0+3.1416,0.);pc[2]=vec3(.55,.75,.95);pd[3]=YPDIR(r0,-1.5707);pc[3]=vec3(.16,.2,.1);}
 else if(m==1){for(int k=0;k<4;k++){pd[k]=YPDIR(r0+float(k)*1.5708,0.);}pc[0]=vec3(1.,.15,.2);pc[1]=vec3(1.,.85,.1);pc[2]=vec3(.1,.8,.4);pc[3]=vec3(.2,.3,1.);}
 else{pd[0]=YPDIR(r0,1.5707);pd[1]=pd[0];pd[2]=YPDIR(r0,-1.5707);pd[3]=pd[2];pc[0]=vec3(1.,.55,.2);pc[1]=pc[0];pc[2]=vec3(.25,.1,.55);pc[3]=pc[2];}
 vec3 acc=vec3(0.);float ws=0.;for(int k=0;k<4;k++){float an=acos(clamp(dot(d,pd[k]),-1.,1.));float w=pow(max(an,1e-3),-u_p1);acc+=pc[k]*w;ws+=w;}
 return vec4(mix(c.rgb,acc/ws,u_p3),1.);`,
  'Premiere Pro VR Color Gradients, approx.: colour points placed on the sphere, blended by inverse great-circle-angle weighting (angle^-falloff), so the gradient is seamless at the 360 seam and correct at the poles; preset point sets instead of free points');

f = add('Retro');
f('q29_vrglitch','VR Digital Glitch (360, Premiere)',[P('Amplitude',0,1,.5,.01),P('Block size',2,40,10,1,'px'),P('Color distortion',0,5,1.2,.05),P('Scan lines',0,1,.4,.01)],
  `vec2 p=PX(uv);float row=floor(p.y/u_p1);float am=u_p0;float sh=step(1.-am*.45,hash(vec2(row,3.)))*(hash(vec2(row,9.))-.5)*am*.35;
 float blk=floor(fract(uv.x)*u_res.x/u_k/(u_p1*4.));vec2 bk=vec2(blk,row);sh+=step(1.-am*.15,hash(bk+11.))*(hash(bk+5.)-.5)*.15;
 float x0=fract(uv.x+sh);float cs=u_p2*.004*(1.+3.*step(.001,abs(sh)));
 vec3 col=vec3(O(vec2(fract(x0+cs),uv.y)).r,O(vec2(x0,uv.y)).g,O(vec2(fract(x0-cs),uv.y)).b);
 col*=1.-u_p3*.35*step(.5,fract(p.y/2.));return vec4(col,1.);`,
  'Premiere Pro VR Digital Glitch, approx.: random row and block displacements plus RGB channel split, all wrapped horizontally so content crossing the 360 seam re-enters on the other side; scan lines', true);

f = add('Distort');
f('q29_vrchroma','VR Chromatic Aberrations (360, Premiere)',[P('Amount',0,6,1.5,.05,'%'),P('Center yaw',-180,180,0,1,'deg'),P('Center pitch',-90,90,0,1,'deg'),P('Falloff',0,3,1,.05)],
  Q29_DIR+`vec3 d=EQDIR(uv);vec3 cc=YPDIR(radians(u_p1),radians(u_p2));float ca=clamp(dot(d,cc),-1.,1.);float th=acos(ca);vec3 u=d-cc*ca;float ul=length(u);u=ul>1e-5?u/ul:vec3(0.);
 float k=u_p0*.01*pow(th/PI,u_p3);vec3 col;
 vec3 dr=cos(th*(1.+k))*cc+sin(th*(1.+k))*u,db=cos(th*(1.-k))*cc+sin(th*(1.-k))*u;
 col=vec3(O(DIRUV(dr)).r,c.g,O(DIRUV(db)).b);return vec4(col,1.);`,
  'Premiere Pro VR Chromatic Aberrations, approx.: red and blue are sampled along the great circle through a chosen centre direction at angles scaled by 1 +/- amount (x (angle/180)^falloff), so the fringing is radial on the sphere and seamless across the 360 seam');

f('q29_vrplane','VR Plane to Sphere (Premiere)',[P('Pan',-180,180,0,1,'deg'),P('Tilt',-90,90,0,1,'deg'),P('Roll',-180,180,0,1,'deg'),P('Scale (FOV)',10,170,100,1,'deg')],
  Q29_DIR+`vec3 d=EQDIR(uv);float a=radians(u_p0),el=radians(u_p1);
 d=vec3(d.x*cos(a)-d.z*sin(a),d.y,d.x*sin(a)+d.z*cos(a));d=vec3(d.x,d.y*cos(el)-d.z*sin(el),d.y*sin(el)+d.z*cos(el));d.xy=rot(d.xy,radians(u_p2));
 if(d.z<=.01)return vec4(0.,0.,0.,1.);float w=tan(radians(u_p3)*.5);vec2 q=d.xy/d.z;vec2 iq=vec2(q.x/w,q.y/w*asp())*.5+.5;
 if(iq.x<0.||iq.y<0.||iq.x>1.||iq.y>1.)return vec4(0.,0.,0.,1.);return vec4(O(iq).rgb,1.);`,
  'Premiere Pro VR Plane to Sphere: the flat image is placed as a rectilinear (gnomonic) plane on the sphere at pan / tilt / roll with the given horizontal field of view, and the output is the equirectangular 360 frame (same pixel size as the input; empty sphere = black)');

f = add('Depth');
f('q29_cacao','FidelityFX CACAO (Adaptive Compute AO)',[P('Radius',4,80,22,1,'px'),P('Shadow multiplier',0,4,1.2,.01),P('Depth scale',.05,2,.4,.01),S('Output',['AO over image','AO only'])],
  [`
#define PP(QQ) vec3((QQ)*vec2(asp(),1.),D(QQ)*u_p2)
vec3 p0=PP(uv);vec2 e=2.*u_px*max(u_k,1.);vec3 dx=PP(uv+vec2(e.x,0.))-PP(uv-vec2(e.x,0.)),dy=PP(uv+vec2(0.,e.y))-PP(uv-vec2(0.,e.y));vec3 n=normalize(cross(dx,dy));if(n.z<0.)n=-n;
 float rad=R(u_p0)*u_px.y;float a0=bayer4(PX(uv))*6.2832;float occ=0.;
 for(int i=0;i<16;i++){float fi=float(i);float rr=sqrt((fi+.5)/16.);float an=a0+fi*2.39996;vec2 q=uv+vec2(cos(an)/asp(),sin(an))*rr*rad;
  vec3 dv=PP(q)-p0;float dl=length(dv);float nd=dot(n,dv)/max(dl,1e-5);float fo=clamp(1.-dl*dl/(rad*rad*2.),0.,1.);occ+=clamp(nd-.06,0.,1.)*fo;}
 float ao=pow(clamp(1.-u_p1*occ/16.*1.5,0.,1.),1.5);return vec4(ao,D(uv),0.,1.);`,
  `vec2 e=u_px*max(u_k,1.);float z=T(uv).g;float s0=0.,w0=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec4 v=T(uv+vec2(float(i),float(j))*e);float w=exp(-abs(v.g-z)*60.)*exp(-float(i*i+j*j)/4.);s0+=v.r*w;w0+=w;}
 float ao=s0/w0;return vec4(u_p3>.5?vec3(ao):O(uv).rgb*ao,1.);`],
  'AMD FidelityFX CACAO (derived from Intel ASSAO), approx. port of its core: view-space positions from depth, normals from depth differences, 16 spiral taps rotated by a 4x4 pattern, obscurance = saturate(dot(N, delta)/|delta| - 0.06 horizon threshold) x quadratic distance falloff, occlusion = (1 - shadow multiplier x obscurance)^1.5 (ASSAO default shadow power), then a depth-edge-aware 5x5 blur; single resolution, no deinterleaving / importance map / adaptive quality');

f('q29_contactshadow','Screen-Space Contact Shadows',[P('Light azimuth',0,360,135,1,'deg'),P('Light elevation',3,80,30,1,'deg'),P('Length',4,80,24,1,'px'),P('Thickness',.005,.5,.25,.005)],
  `float az=radians(u_p0);vec2 dir=vec2(cos(az),sin(az));float z=D(uv);float tl=tan(radians(u_p1));float sh=0.;
 for(int k=1;k<=24;k++){float t=(float(k)-bayer4(PX(uv)))/24.;float r=t*R(u_p2);vec2 q=uv+dir*r*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;float zr=z+r/u_res.y*tl*2.;float dz=D(q)-zr;if(dz>.01&&dz<u_p3)sh=max(sh,1.-t*t);}
 return vec4(c.rgb*(1.-.7*sh),1.);`,
  'contact shadows (as in UE / Bend Studio screen-space shadows): a short ray marched from each pixel toward the light through the depth buffer; a sample occludes only if it lies in front of the ray by less than the thickness (so thin foreground objects do not cast infinite shadows), fading with distance along the ray');
