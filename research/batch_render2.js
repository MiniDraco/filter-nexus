/* ================= render2: procedural noise III, sensor pattern noise, Newson film grain, game-engine post-process ================= */
// R2FN: lets a pass define real GLSL helper functions (closes the stub F, re-points main's F() at R2G via #define)
const R2FN = (lib, body) => `return c;}
#define F R2G
${lib}
vec4 R2G(vec2 uv){vec4 c=T(uv);${body}`;
const R2L = `
vec2 r2h2(vec2 p){return vec2(hash(p),hash(p+vec2(17.17,3.31)));}
vec3 r2lin(vec3 v){v=max(v,0.);return mix(v/12.92,pow((v+.055)/1.055,vec3(2.4)),step(vec3(.04045),v));}
vec3 r2srgb(vec3 v){v=max(v,0.);return mix(v*12.92,1.055*pow(v,vec3(1./2.4))-.055,step(vec3(.0031308),v));}
float r2gauss(vec2 p){float u1=max(hash(p),1e-7),u2=hash(p+vec2(5.3,9.1));return sqrt(-2.*log(u1))*cos(6.2831853*u2);}
float r2vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
vec2 r2gr(vec2 i){float a=6.2831853*hash(i+vec2(101.,37.));return vec2(cos(a),sin(a));}
vec3 r2gnd(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);vec2 du=30.*f*f*(f*(f-2.)+1.);
 vec2 ga=r2gr(i),gb=r2gr(i+vec2(1.,0.)),gc=r2gr(i+vec2(0.,1.)),gd=r2gr(i+vec2(1.,1.));
 float va=dot(ga,f),vb=dot(gb,f-vec2(1.,0.)),vc=dot(gc,f-vec2(0.,1.)),vd=dot(gd,f-vec2(1.,1.));
 return vec3(va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*(va-vb-vc+vd),ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*(va-vb-vc+vd)+vec2(vb,vc)-va));}
`;

/* ---------- Procedural noise III ---------- */
const R2NZ = R2L + `
float r2noise(int t,vec2 p,float v){
 if(t==0){int no=1+int(v*4.);float s=0.,a=1.,tot=0.;vec2 q=p;for(int o=0;o<5;o++){if(o>=no)break;s+=a*r2vn(q);tot+=a;q=q*2.+vec2(5.3,1.7);a*=.5;}return s/tot;}
 if(t==1){float beta=2.*v;float s=0.,tot=0.;vec2 px=p*u_p1;for(int k=0;k<10;k++){float cs=exp2(float(k));if(cs>u_p1*1.01)break;float a=pow(cs,-(2.-beta)*.5);s+=a*(r2vn(px/cs+vec2(float(k)*7.13,float(k)*3.71))-.5);tot+=a*a;}return .5+1.25*s/sqrt(tot);}
 if(t==2){vec2 ip=floor(p);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));for(int k=0;k<6;k++){vec2 kc=cc+vec2(float(k)*.31,float(k)*.17);vec2 sp=cc+r2h2(kc);float an=6.2831853*r2vn(sp*.18+vec2(3.,7.));vec2 d=rot(p-sp,-an);float sa=.3,sb=.3*(1.-.9*v);float e=exp(-d.x*d.x/(2.*sa*sa)-d.y*d.y/(2.*sb*sb));s+=(hash(kc+vec2(9.,4.))*2.-1.)*e;}}return .5+.36*s;}
 if(t==3){vec2 ip=floor(p);float m=1.+6.*v;float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));float up=hash(cc+vec2(.5,8.));float pk=exp(-m),cdf=pk;int n=0;for(int k=0;k<16;k++){if(up<=cdf)break;n++;pk*=m/float(n);cdf+=pk;}
   for(int k=0;k<16;k++){if(k>=n)break;vec2 kc=cc+vec2(float(k)*.37,float(k)*.11);vec2 d=p-cc-r2h2(kc);float r2=dot(d,d);if(r2<1.){float w=1.-r2;s+=(hash(kc+vec2(4.,2.))*2.-1.)*w*w;}}}
  return .5+.2*s/sqrt(m*.209);}
 if(t==4){vec2 ip=floor(p);vec2 z=vec2(0.);float fr=3.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 cc=ip+vec2(float(i),float(j));for(int k=0;k<5;k++){vec2 kc=cc+vec2(float(k)*.29,float(k)*.13);vec2 d=p-cc-r2h2(kc);float an=.6+(hash(kc+vec2(2.,9.))-.5)*6.2831853*v;float g=exp(-4.5*dot(d,d));float ph=6.2831853*fr*dot(d,vec2(cos(an),sin(an)));z+=g*vec2(cos(ph),sin(ph));}}return .5+.5*sin(atan(z.y,z.x));}
 if(t==5){float uu=clamp(v*2.,0.,1.),vv=clamp(v*2.-1.,0.,1.);float k=1.+63.*pow(1.-vv,6.);vec2 ip=floor(p),fp=fract(p);float lw[25];vec3 oo[25];float mx=-1e9;
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){int id=(j+2)*5+i+2;vec2 g=vec2(float(i),float(j));vec3 o=vec3(r2h2(ip+g)*uu,hash(ip+g+vec2(31.,77.)));oo[id]=o;vec2 d=g-fp+o.xy;lw[id]=k*log(max(1.-smoothstep(0.,1.414,length(d)),1e-12));mx=max(mx,lw[id]);}
  vec2 a=vec2(0.);for(int id=0;id<25;id++){float w=exp(lw[id]-mx);a+=vec2(oo[id].z*w,w);}return a.x/a.y;}
 if(t==6){int no=1+int(v*3.);float s=0.,a=1.,tot=0.;vec2 q=p;for(int o=0;o<4;o++){if(o>=no)break;vec2 ip=floor(q);float m1=0.,m2=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));float d=length(q-cc-r2h2(cc+vec2(float(o)*19.,0.)));float val=hash(cc+vec2(float(o)*19.,5.))*(1.-smoothstep(0.,1.,d));if(val>m1){m2=m1;m1=val;}else if(val>m2)m2=val;}s+=a*(m1-m2);tot+=a;q=q*2.+vec2(3.1,7.7);a*=.5;}return clamp(s/tot*1.7,0.,1.);}
 if(t==7){float sum=0.,fq=1.,amp=1.;vec2 ds=vec2(0.);float warp=.3*v;for(int o=0;o<7;o++){vec3 n=r2gnd((p+warp*ds)*fq+vec2(float(o)*11.3,float(o)*5.9))*1.4;sum+=amp*(1.-abs(n.x));ds+=amp*n.yz*-n.x;fq*=2.;amp*=.5*clamp(sum,0.,1.);}return clamp(sum*.62-.05,0.,1.);}
 float H=.5*v+.05;float res=(r2gnd(p).x*1.4+.7);float w=res;vec2 q=p*2.;for(int o=1;o<8;o++){w=min(w,1.);float sg=(r2gnd(q+vec2(float(o)*7.7,float(o)*3.3)).x*1.4+.7)*pow(2.,-float(o)*H);res+=w*sg;w*=sg;q*=2.;}return clamp(res*.38-.02,0.,1.);}
`;
f = add('Noise');
f('procnoise3','Procedural Noise III',[S('Type',['Value noise','Pink (1/f) noise','Spot noise (van Wijk)','Sparse convolution (Lewis)','Phasor noise','Voronoise (Quilez)','Alligator noise','Swiss turbulence','Hybrid multifractal']),
  P('Scale',4,400,64,1,'px'),P('Variation',0,1,.5,.01),S('Output',['Grayscale','Overlay on image','Multiply image','Displace image'])],
  R2FN(R2NZ,`int t=int(u_p0+.5);vec2 p=PX(uv)/u_p1;float n=r2noise(t,p,u_p2);
  int om=int(u_p3+.5);if(om==0)return vec4(vec3(n),1.);if(om==1)return vec4(overlay(c.rgb,vec3(n)),1.);if(om==2)return vec4(c.rgb*(.3+n),1.);float n2=r2noise(t,p+vec2(37.1,11.7),u_p2);return T(uv+(vec2(n,n2)-.5)*R(40.)*u_px);`),
  'value noise (quintic lattice, octaves by Variation); pink = octave sum of interpolated white noise with per-octave variance scaled for a 1/f^beta spectrum (beta = 2 x Variation, 1 = pink; approx. band split); spot noise (van Wijk 1991: random-sign oriented Gaussian spots, orientation from a smooth field, Variation = anisotropy); sparse convolution (Lewis 1989: Poisson impulses, quartic kernel, Variation = density); phasor noise (Tricard et al. 2019: phase of a sum of complex Gabor kernels, Variation = orientation spread); Voronoise (Quilez 2014: Variation walks cell noise -> Voronoi -> smooth noise); alligator (Houdini-style max1 - max2 of random-height cones, approx.); Swiss turbulence (de Carpentier 2010, derivative-warped ridged fbm, warp = 0.3 x Variation); hybrid multifractal (Musgrave, offset 0.7, H = 0.05 + 0.5 x Variation)',1);

/* ---------- Sensor pattern noise ---------- */
f('sensorpattern','Sensor Pattern Noise (FPN / Banding / Amp Glow)',[S('Type',['Fixed-pattern noise','Row / column banding','Amp glow']),P('Amount',0,1,.5,.01),P('Scale',1,16,1,1,'px'),P('Variation',0,1,.25,.01)],
  R2FN(R2L,`int t=int(u_p0+.5);float A=u_p1,sc=u_p2,v=u_p3;vec2 p=floor(PX(uv)/sc);vec3 lin=r2lin(c.rgb);
  if(t==0){float col=r2gauss(vec2(p.x,7.))*.5;vec3 dsnu=vec3(r2gauss(p),r2gauss(p+vec2(.5,1.25)),r2gauss(p+vec2(2.5,.75)))+col;
   vec3 prnu=vec3(r2gauss(p+vec2(.25,3.5)),r2gauss(p+vec2(4.5,.5)),r2gauss(p+vec2(1.5,5.5)));lin=lin*(1.+prnu*A*.06)+dsnu*A*.012;
   float hp=hash(p+vec2(9.5,2.5));if(hp<v*.002){vec3 hc=vec3(hash(p+vec2(1.5,.5)),hash(p+vec2(2.5,.5)),hash(p+vec2(3.5,.5)));lin+=(.2+.8*hash(p+vec2(.5,6.5)))*mix(vec3(1.),hc,.6)*(.3+A);}}
  else if(t==1){float wr=clamp(2.-2.*v,0.,1.),wc=clamp(2.*v,0.,1.);float br=r2gauss(vec2(5.5,p.y))*.6+(r2vn(vec2(3.,p.y/24.))-.5)*2.;float bc=r2gauss(vec2(p.x,8.5))*.6+(r2vn(vec2(p.x/24.,9.))-.5)*2.;
   lin+=(wr*br+wc*bc)*A*.012*vec3(1.,.92,1.08);}
  else{float a=v*4.;vec2 e=a<1.?vec2(a,0.):a<2.?vec2(1.,a-1.):a<3.?vec2(3.-a,1.):vec2(0.,4.-a);vec2 d=(uv-e)*vec2(asp(),1.);float dist=length(d)/length(vec2(asp(),1.));float spr=.08+.04*sc;
   float g=exp(-dist/spr)+.25*exp(-dist/(spr*3.));lin+=A*.5*g*vec3(1.,.5,.85);}
  return vec4(r2srgb(lin),1.);`),
  'added in linear light (so it shows in the shadows like raw-domain noise): fixed-pattern = per-pixel DSNU offsets + column offsets + PRNU gain + sparse hot pixels (density = Variation); banding = random per-row / per-column offsets plus slow band drift (Variation 0 = rows, 0.5 = both, 1 = columns); amp glow = amplifier-heat glow decaying from a point on the frame edge (Variation walks the perimeter, Scale widens it)',1);

/* ---------- Newson realistic film grain ---------- */
f('newsongrain','Realistic Film Grain (Newson)',[P('Grain radius',.08,1,.12,.01,'px'),P('Radius spread',0,.6,.25,.01),P('Filter sigma',.3,1.2,.6,.05,'px'),S('Colour',['Per channel (colour)','Monochrome'])],
  R2FN(R2L+`
float r2grain(vec2 x,int ch,float r0,float sg,float sf){vec2 cell=floor(x);float er2=r0*r0*exp(2.*sg*sg);float fc=float(ch)*61.;float acc=0.;float ig=1./(2.*sf*sf);
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 cc=cell+vec2(float(i),float(j));vec3 o=O(fromPX(cc+.5)).rgb;float u=ch==0?o.r:ch==1?o.g:ch==2?o.b:luma(o);u=clamp(u,0.,.995);
  float m=log(1./(1.-u))/(3.14159265*er2);float n;if(m<12.){float up=hash(cc+vec2(fc+.5,.25));float pk=exp(-m),cdf=pk;n=0.;for(int k=0;k<40;k++){if(up<=cdf)break;n+=1.;pk*=m/n;cdf+=pk;}}
  else n=max(0.,floor(m+sqrt(m)*r2gauss(cc+vec2(fc+.5,.75))+.5));
  float nu=min(n,48.);float sc=n/max(nu,1.);
  for(int k=0;k<48;k++){if(float(k)>=nu)break;vec2 kc=cc+vec2(float(k)*.0173+fc,float(k)*.0291+.5);vec2 d=x-cc-r2h2(kc);float rr=r0*exp(sg*r2gauss(kc+vec2(.25,.125)));acc+=sc*rr*rr*exp(-dot(d,d)*ig);}}
 return 1.-exp(-acc*ig);}`,`float r0=u_p0,sg=u_p1,sf=u_p2;vec2 x=PX(uv);bool mono=u_p3>.5;
  if(mono){float g=r2grain(x,3,r0,sg,sf);return vec4(clamp(c.rgb+g-luma(c.rgb),0.,1.),1.);}
  return vec4(r2grain(x,0,r0,sg,sf),r2grain(x,1,r0,sg,sf),r2grain(x,2,r0,sg,sf),1.);`),
  'after Newson, Delon & Galerne 2017 (realistic film grain rendering): Boolean model of silver-halide grains - Poisson-distributed discs with intensity lambda = log(1/(1-u)) / (pi E[r^2]) from the input value, log-normal radii - seen through a Gaussian filter; approx.: the filtered union coverage is evaluated in closed form as 1 - exp(-sum of grain area x Gaussian weight) instead of by Monte-Carlo sampling; monochrome mode renders the luminance and adds the difference');

/* ---------- Game-engine post-process ---------- */
f = add('Distort');
f('panini','Panini Projection (Unity / Unreal)',[P('Vertical FOV',30,160,100,1,'°'),P('Distance',0,1,1,.01),P('Crop to fit',0,1,1,.01)],
  `float ey=tan(.5*radians(u_p0));vec2 ext=vec2(ey*asp(),ey);float d=u_p1;float vd=1.+d;
  float ph=sqrt(ext.x*ext.x+1.);float cdm=1./ph;float cd=cdm+d;vec2 crop=ext*cdm*(vd/cd);vec2 sc=crop/ext;float s=mix(1.,clamp(min(sc.x,sc.y),0.,1.),u_p2);
  vec2 vp=(2.*uv-1.)*ext*s;float vhs=vp.x*vp.x+vd*vd;float iD=vp.x*d;float cdmd=(-iD*vp.x+vd*sqrt(max(vhs-iD*iD,0.)))/vhs;float cyld=cdmd+d;vec2 pp=vp*(cyld/vd)/(cyld-d);
  vec2 q=pp/ext*.5+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`,
  'Unity PaniniProjection: the image is a rectilinear view with the given vertical FOV; Panini_Generic(view_pos, d) with distance d (0 = rectilinear, 1 = cylindrical stereographic), crop-to-fit scale from CalcCropExtents');

f = add('Color');
f('smhwheels','Shadows / Midtones / Highlights (Unity)',[P('Shadows hue',0,360,195,1,'°'),P('Highlights hue',0,360,35,1,'°'),P('Strength',0,1,.35,.01),P('Midtones weight',-1,1,0,.01)],
  R2FN(R2L+`
vec3 r2wheel(float h,float s,float w){vec3 t=r2lin(hsv2rgb(vec3(h/360.,s,1.)));t/=max(luma(t),1e-4);return max(t+w*(w<0.?1.:4.)*.25,0.);}`,
  `vec3 lin=r2lin(c.rgb);float l=luma(lin);float sF=1.-smoothstep(0.,.3,l),hF=smoothstep(.55,1.,l),mF=1.-sF-hF;
  vec3 S=r2wheel(u_p0,u_p2,0.),H=r2wheel(u_p1,u_p2,0.),M=r2wheel(0.,0.,u_p3);lin=lin*S*sF+lin*M*mF+lin*H*hF;return vec4(r2srgb(lin),1.);`),
  'Unity URP/HDRP ShadowsMidtonesHighlights: linear-light luminance weights (shadows 1 - smoothstep(0, 0.3), highlights smoothstep(0.55, 1), midtones the rest) multiply the colour by each wheel; wheel colour = hue at Strength saturation normalised to unit luminance, weight offset x4 when positive (PrepareShadowsMidtonesHighlights)');

f = add('Tone');
f('localexposure','Local Exposure (Unreal)',[P('Highlight contrast',0,1,.6,.01),P('Shadow contrast',0,1,.6,.01),P('Detail strength',0,2,1,.01),P('Blurred luminance blend',0,1,.3,.01)],
  [R2FN(R2L,`float l=log2(max(luma(r2lin(c.rgb)),1e-4));return vec4((l+14.)/16.,0.,0.,1.);`),
   `vec4 a=blur1d(u_tex,uv,vec2(1.,0.),.12*u_res.y);return vec4(T(uv).r,a.r,0.,1.);`,
   `vec4 a=blur1d(u_tex,uv,vec2(0.,1.),.12*u_res.y);return vec4(T(uv).r,a.g,0.,1.);`,
   `float cl=c.r;float sp=max(1.,.012*u_res.y);float s=0.,w=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j));float v=T(uv+o*sp*u_px).r;float dv=(v-cl)*16.;float wt=exp(-dot(o,o)/18.-dv*dv*.5);s+=v*wt;w+=wt;}return vec4(cl,c.g,s/w,1.);`,
   R2FN(R2L,`float cl=c.r*16.-14.,bl=c.g*16.-14.,bi=c.b*16.-14.;float MG=log2(.18);float base=mix(bi,bl,u_p3);float lb=base-MG;float cs=lb>0.?u_p0:u_p1;
   float ll=lb*cs+MG+(cl-base)*u_p2;vec3 lin=r2lin(O(uv).rgb)*exp2(ll-cl);return vec4(r2srgb(lin),1.);`)],
  'UE5 Local Exposure: log-luminance base = blend of an edge-aware (bilateral, 1 stop range sigma) and a wide Gaussian-blurred log luminance; base contrast around middle grey (0.18) scaled by the highlight / shadow contrast scales, detail (log lum - base) scaled by detail strength; applied as a per-pixel exposure in linear light (bilateral grid replaced by a sampled bilateral filter)');

f = add('Depth');
const R2VP = `
float r2z(float d){return 1.+(1.-clamp(d,0.,1.))*9.;}
vec3 r2pos(vec2 q){float z=r2z(D(q));float ty=tan(radians(30.));return vec3((q*2.-1.)*vec2(asp(),1.)*ty*z,z);}
vec2 r2proj(vec3 P){float ty=tan(radians(30.));return P.xy/(P.z*ty*vec2(asp(),1.))*.5+.5;}
vec3 r2nrm(vec2 q){vec2 e=u_px*max(3.,u_k*3.);vec3 px=r2pos(q+vec2(e.x,0.))-r2pos(q-vec2(e.x,0.)),py=r2pos(q+vec2(0.,e.y))-r2pos(q-vec2(0.,e.y));return normalize(cross(px,py))*-1.;}
`;
f('ssr','Screen-Space Reflections',[P('Intensity',0,1,.6,.01),P('Max distance',.5,10,4,.1),P('Thickness',.05,2,.4,.01),P('Roughness',0,1,.15,.01)],
  R2FN(R2L+R2VP,`if(D(uv)<.02)return c;vec3 P=r2pos(uv);vec3 N=r2nrm(uv);if(dot(N,P)>0.)N=-N;vec3 V=normalize(P);vec3 Rd=reflect(V,N);
  float st=u_p1/40.;vec3 Q=P+N*.02;bool hit=false;vec2 hq=uv;float j=hash(floor(PX(uv)));Q+=Rd*st*j;
  for(int i=0;i<40;i++){Q+=Rd*st;vec2 q=r2proj(Q);if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||Q.z<.5)break;float sz=r2z(D(q));if(D(q)>.02&&Q.z>sz&&Q.z-sz<u_p2&&length(q-uv)*u_res.y>3.*u_k&&dot(r2nrm(q),Rd)<.1){
    vec3 a=Q-Rd*st,b=Q;for(int k=0;k<6;k++){vec3 m=(a+b)*.5;vec2 mq=r2proj(m);if(m.z>r2z(D(mq)))b=m;else a=m;}hq=r2proj(b);hit=true;break;}}
  if(!hit)return c;vec2 ed=min(hq,1.-hq);float fade=smoothstep(0.,.08,min(ed.x,ed.y))*(1.-smoothstep(.6,1.,length(Q-P)/u_p1));
  float fr=.04+.96*pow(1.-max(dot(-V,N),0.),5.);float rr=u_p3*R(12.)*length(hq-uv)*4.;vec3 col=vec3(0.);
  for(int k=0;k<9;k++){float a=float(k)*2.39996;vec2 o=vec2(cos(a),sin(a))*sqrt(float(k)/9.)*rr;col+=r2lin(O(hq+o*u_px).rgb);}col/=9.;
  vec3 lin=r2lin(c.rgb);float w=u_p0*fade*mix(.35,1.,fr);return vec4(r2srgb(mix(lin,lin*.5+col*.8,w)),1.);`),
  'approx. (single image + depth): view-space positions from the depth map (pinhole, 60 deg vertical FOV, depth 1..10 units), normals from depth differences, the reflected view ray is ray-marched (40 steps + 6 binary refinements) against the depth buffer with a thickness test; hit colour (cone-blurred by Roughness) blended with Schlick Fresnel and screen-edge / distance fades');
f('ssgi','Screen-Space Global Illumination',[P('Intensity',0,3,1.2,.01),P('Radius',.2,4,1.5,.05),P('Thickness',.05,2,.5,.01)],
  R2FN(R2L+R2VP,`if(D(uv)<.02)return c;vec3 P=r2pos(uv);vec3 N=r2nrm(uv);if(dot(N,P)>0.)N=-N;vec3 tg=normalize(abs(N.y)<.9?cross(N,vec3(0.,1.,0.)):cross(N,vec3(1.,0.,0.)));vec3 bt=cross(N,tg);
  vec2 ip=floor(PX(uv));float j0=hash(ip),j1=hash(ip+vec2(.5,.25));vec3 gi=vec3(0.);float occ=0.;
  for(int s=0;s<12;s++){float u1=fract(float(s)/12.+j0),u2=fract(float(s)*.618034+j1);float sr=sqrt(u1);float ph=6.2831853*u2;vec3 dir=normalize(tg*sr*cos(ph)+bt*sr*sin(ph)+N*sqrt(1.-u1));
   float st=u_p1/10.;vec3 Q=P+N*.02;for(int i=0;i<10;i++){Q+=dir*st*(1.+.15*float(i));vec2 q=r2proj(Q);if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)break;float sz=r2z(D(q));if(D(q)>.02&&Q.z>sz&&Q.z-sz<u_p2){
     vec3 hn=r2nrm(q);float facing=clamp(dot(hn,-dir)*.5+.5,0.,1.);gi+=r2lin(O(q).rgb)*facing;occ+=1.;break;}}}
  gi/=12.;occ/=12.;vec3 lin=r2lin(c.rgb);vec3 alb=lin/max(max(lin.r,max(lin.g,lin.b)),.05);
  return vec4(r2srgb(lin*(1.-.35*occ*min(u_p0,1.))+u_p0*alb*gi*.8),1.);`),
  'approx. (single image + depth, the image taken as outgoing radiance): 12 cosine-weighted hemisphere rays per pixel ray-marched against the depth buffer; hit colours (weighted by the hit surface facing the ray) give one bounce of indirect light multiplied by the pixel albedo (chromaticity), misses add nothing and hits also occlude (soft AO term)',1);

f = add('Blur');
const R2KAW = [0,1,2,2,3,4,4,5,6,7].map((k, i) => `if(${i}.>u_p0-.5)return c;vec2 o=vec2(${k}.5)*u_p1*u_k*u_px;return (T(uv+o)+T(uv-o)+T(uv+vec2(o.x,-o.y))+T(uv+vec2(-o.x,o.y)))*.25;`);
f('kawaseblur','Kawase Blur',[P('Iterations',1,10,5,1),P('Spread',1,4,1,.1)],R2KAW,
  'Kawase 2003 (GDC "Frame buffer postprocessing effects in DOUBLE-S.T.E.A.L"): each pass averages 4 bilinear taps at diagonal offsets (k + 0.5) px, kernel sequence 0-1-2-2-3-4-4-5-6-7; Spread scales the offsets (as if run at a lower resolution)');
const R2DK = [];
for (let k = 1; k <= 5; k++) R2DK.push(`if(${k}.>u_p0+.5)return c;vec2 h=vec2(${0.5 * 2 ** (k - 1)})*u_p1*u_k*u_px;return (T(uv)*4.+T(uv+h)+T(uv-h)+T(uv+vec2(h.x,-h.y))+T(uv+vec2(-h.x,h.y)))/8.;`);
for (let k = 5; k >= 1; k--) R2DK.push(`if(${k}.>u_p0+.5)return c;vec2 h=vec2(${0.5 * 2 ** (k - 1)})*u_p1*u_k*u_px;vec4 s=T(uv+vec2(-h.x*2.,0.))+T(uv+vec2(h.x*2.,0.))+T(uv+vec2(0.,h.y*2.))+T(uv+vec2(0.,-h.y*2.));s+=(T(uv+h)+T(uv-h)+T(uv+vec2(h.x,-h.y))+T(uv+vec2(-h.x,h.y)))*2.;return s/12.;`);
f('dualkawase','Dual Kawase Blur',[P('Iterations',1,5,3,1),P('Offset',.5,4,1,.1)],R2DK,
  'Bjorge 2015 (ARM, SIGGRAPH "Bandwidth-efficient rendering") dual filter: downsample = 4 x centre + 4 diagonal half-pixel taps / 8, upsample = 4 axis taps at 2 half-pixels + 4 diagonal taps x 2 / 12; approx.: the half-resolution pyramid is emulated at full resolution with the tap offsets doubled per level');

f = add('Depth');
const R2CK = `
#define R2A .862325
#define R2B 1.624835
#define R2WA .767583
#define R2WB 1.862321
vec2 r2ck(float x){float e=exp(-R2A*x*x);return e*vec2(cos(R2B*x*x),sin(R2B*x*x));}
vec2 r2cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
float r2nrm1(){float n=0.;for(int i=-24;i<=24;i++){float x=float(i)/24.*1.2;n+=exp(-R2A*x*x);}return n;}
float r2W(){vec2 S=vec2(0.);for(int i=-24;i<=24;i++)S+=r2ck(float(i)/24.*1.2);float n=r2nrm1();vec2 S2=r2cm(S,S)/(n*n);return R2WA*S2.x+R2WB*S2.y;}
vec3 r2bk(vec3 c){vec3 l=r2lin(c);return l*(1.+u_p3*smoothstep(.92,1.,max(c.r,max(c.g,c.b))));}
`;
const R2CSTEP = 'float st=R(u_p0)/24.;';
f('circulardof','Circular Separable DOF (Garcia)',[P('Radius',1,30,10,.5,'px'),P('Focus depth',0,1,.6,.01),S('Focus',['Whole image','Depth (focus plane)']),P('Highlight boost',0,4,1,.05)],
  [R2FN(R2L+R2CK,R2CSTEP+`vec4 a=vec4(0.);for(int i=-24;i<=24;i++){vec2 k=r2ck(float(i)/24.*1.2);vec3 s=r2bk(O(uv+vec2(float(i)*st,0.)*u_px).rgb);a+=vec4(k*s.r,k*s.g);}a/=r2nrm1();return .5+.25*a;`),
   R2FN(R2L+R2CK,R2CSTEP+`vec2 zr=vec2(0.),zg=vec2(0.);for(int i=-24;i<=24;i++){vec2 k=r2ck(float(i)/24.*1.2);vec4 h=(T(uv+vec2(0.,float(i)*st)*u_px)-.5)*4.;zr+=r2cm(k,h.xy);zg+=r2cm(k,h.zw);}float n=r2nrm1()*r2W();return vec4((R2WA*zr.x+R2WB*zr.y)/n,(R2WA*zg.x+R2WB*zg.y)/n,0.,1.);`),
   R2FN(R2L+R2CK,R2CSTEP+`vec2 a=vec2(0.);for(int i=-24;i<=24;i++){vec2 k=r2ck(float(i)/24.*1.2);a+=k*r2bk(O(uv+vec2(float(i)*st,0.)*u_px).rgb).b;}a/=r2nrm1();return vec4(c.rg,.5+.25*a);`),
   R2FN(R2L+R2CK,R2CSTEP+`vec2 zb=vec2(0.);for(int i=-24;i<=24;i++){vec2 k=r2ck(float(i)/24.*1.2);vec2 h=(T(uv+vec2(0.,float(i)*st)*u_px).ba-.5)*4.;zb+=r2cm(k,h);}float n=r2nrm1()*r2W();
   vec3 bl=max(vec3(c.r,c.g,(R2WA*zb.x+R2WB*zb.y)/n),0.);float coc=u_p2>.5?smoothstep(.03,.3,abs(D(uv)-u_p1)):1.;vec3 sh=r2lin(O(uv).rgb);bl=mix(bl,.8+.2*tanh((bl-.8)/.2),step(.8,bl));return vec4(r2srgb(mix(sh,bl,coc)),1.);`)],
  'Garcia 2017 (EA, "Circular separable convolution depth of field"), 1-component complex Gaussian kernel exp(-a x^2) e^(i b x^2), a = 0.862325, b = 1.624835, weights A = 0.767583, B = 1.862321 (Niemitalo), filter radius 1.2: horizontal complex pass + vertical complex pass per channel (R,G then B), Re/Im recombined into a disc; linear light with highlight boost; depth mode blends sharp/blurred by |depth - focus| (single-radius layer, approx.)');

f = add('Tone');
f('drt','Display Rendering Transform (OpenDRT / TCAMv2)',[S('Transform',['OpenDRT (Jed Smith)','TCAMv2 (FilmLight)']),P('Exposure',-3,3,1,.05,'EV'),P('Contrast',1,2,1.35,.01),P('Highlight desaturation',0,1,.5,.01)],
  R2FN(R2L+`
float r2ts(float x,float p){float g=.1,fl=.01;float g0=(g+sqrt(g*g+4.*g*fl))*.5;float s0=.18/pow(g0,1./p)-.18;float t=pow(max(x,0.)/(max(x,0.)+s0),p);return t*t/(t+fl);}`,
  `int m=int(u_p0+.5);vec3 lin=r2lin(c.rgb)*exp2(u_p1);float p=u_p2;
  if(m==0){float nrm=max(length(lin)/1.7320508,1e-6);vec3 rat=max(lin/nrm,0.);float ts=r2ts(nrm,p);float pw=mix(.6,4.,1.-u_p3);rat=mix(rat,vec3(1.),pow(ts,pw));vec3 o=ts*rat;return vec4(r2srgb(min(o,1.)),1.);}
  float Y=max(luma(lin),1e-6);vec3 rat=lin/Y;float ts=r2ts(Y,p*1.05);float sat=1./(1.+u_p3*3.*ts*ts);vec3 ch=(rat-1.)*sat;float mx=max(ch.r,max(ch.g,ch.b));float lim=max(1./max(ts,1e-4)-1.,0.);ch*=mx>lim?lim/mx:1.;
  vec3 o=ts*(1.+ch);float mn=min(o.r,min(o.g,o.b));if(mn<0.)o=mix(vec3(ts),o,ts/(ts-mn));return vec4(r2srgb(clamp(o,0.,1.)),1.);`),
  'approx.: the sRGB image is linearised and exposed as scene-linear, then a Daniele-Siragusano Michaelis-Menten tonescale (grey 0.18 -> 0.1 display, flare 0.01, Contrast = power) is applied. OpenDRT: on the RGB euclidean norm with RGB ratios kept and a path to white that grows with the tonescale; TCAMv2: on luminance with hue-preserving chroma scaled down in the highlights and limited to the display gamut (look approximation of FilmLight\'s DRT)');
