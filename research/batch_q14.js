/* ================= q14: camera ISP stages (CFA domain + colour matrices), OtisFX depth shaders, GShade PandaFX / SmartNoise / Pattern Shading, Corel Painter surface-control effects ================= */
/* CFA colour at integer sensor pixel q (RGGB): 0 = R, 1 = G, 2 = B */
const Q14_CFA = `
#define Q14CF(q) (mod((q).x,2.)<.5?(mod((q).y,2.)<.5?0:1):(mod((q).y,2.)<.5?1:2))
`;

f = add('Sensor');
f('q14_isp_cfa','Camera ISP Raw Stages (black level, DPC, green imbalance, binning, remosaic, HA demosaic, FCS)',
  [S('Stage',['Black level subtraction','Defective pixel correction','Green imbalance correction','Bayer binning 2x2','Quad Bayer remosaic','Hamilton-Adams demosaic','False color suppression']),
   S('Output',['Corrected','Uncorrected','Raw CFA (colour-coded)','Error vs input x4']),P('Impairment',0,1,.5,.01),S('Demosaic',['Bilinear','Hamilton-Adams'])],
  [/* 1: simulate the raw mosaic (linear light) with the impairment this stage corrects */
   `${Q14_CFA}int st=int(u_p0+.5);vec2 p=floor(uv*u_res);int ch=st==4?Q14CF(floor(p/2.)):Q14CF(p);vec3 lin=pow(clamp(c.rgb,0.,1.),vec3(2.2));
 float v=ch==0?lin.r:ch==1?lin.g:lin.b;float a=u_p2;
 if(st==0){float bl=a*.25;v=bl+v*(1.-bl);}
 else if(st==1){float h=hash(p*1.37+vec2(3.1,7.7));if(h<a*.01)v=1.;else if(h>1.-a*.005)v=0.;}
 else if(st==2){if(ch==1&&mod(p.y,2.)>.5)v*=1.+.16*a;}
 return vec4(v,0.,0.,1.);`,
   /* 2: the correction stage, in the CFA domain */
   `${Q14_CFA}
#define RW(q) T(((q)+.5)/u_res).r
 int st=int(u_p0+.5);int ou=int(u_p1+.5);vec2 p=floor(uv*u_res);float v=RW(p);float a=u_p2;
 if(ou==1||ou==2)return vec4(v,0.,0.,1.);
 if(st==0){float bl=a*.25;v=clamp((v-bl)/max(1.-bl,.01),0.,1.);}
 else if(st==1){float n[8];n[0]=RW(p+vec2(-2.,-2.));n[1]=RW(p+vec2(0.,-2.));n[2]=RW(p+vec2(2.,-2.));n[3]=RW(p+vec2(-2.,0.));
  n[4]=RW(p+vec2(2.,0.));n[5]=RW(p+vec2(-2.,2.));n[6]=RW(p+vec2(0.,2.));n[7]=RW(p+vec2(2.,2.));
  float nm=.125*(n[0]+n[1]+n[2]+n[3]+n[4]+n[5]+n[6]+n[7]);float thr=.015+.3*nm;bool hi=true,lo=true;for(int i=0;i<8;i++){if(v-n[i]<=thr)hi=false;if(n[i]-v<=thr)lo=false;}
  if(hi||lo){float dv=abs(n[1]-n[6]),dh=abs(n[3]-n[4]),dd1=abs(n[0]-n[7]),dd2=abs(n[2]-n[5]);float m=min(min(dv,dh),min(dd1,dd2));
   v=m==dv?.5*(n[1]+n[6]):m==dh?.5*(n[3]+n[4]):m==dd1?.5*(n[0]+n[7]):.5*(n[2]+n[5]);}}
 else if(st==2){if(Q14CF(p)==1){float md=.25*(RW(p+vec2(1.,1.))+RW(p+vec2(-1.,1.))+RW(p+vec2(1.,-1.))+RW(p+vec2(-1.,-1.)));
  if(abs(v-md)<.25*max(md,.02)+.01)v=.5*(v+md);}}
 else if(st==3){vec2 q=floor(p/2.);vec2 b=floor(q/2.)*4.+mod(q,2.);v=.25*(RW(b)+RW(b+vec2(2.,0.))+RW(b+vec2(0.,2.))+RW(b+vec2(2.,2.)));}
 else if(st==4){int tc=Q14CF(p);if(Q14CF(floor(p/2.))!=tc){float sw=0.,sv=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j));vec2 qq=p+o;if(Q14CF(floor(qq/2.))!=tc)continue;float w=exp(-dot(o,o)/3.);sw+=w;sv+=w*RW(qq);}
  v=sv/max(sw,1e-4);}}
 return vec4(v,0.,0.,1.);`,
   /* 3: green plane (bilinear or Hamilton-Adams), on a 2-px pitch after binning */
   `${Q14_CFA}int st=int(u_p0+.5);int ou=int(u_p1+.5);float pt=(st==3&&ou!=1&&ou!=2)?2.:1.;
#define RC(k) T(((k)+.5)*pt/u_res).r
 vec2 k=floor(uv*u_res/pt);float v=RC(k);int ch=Q14CF(k);bool ha=st==5?ou!=1:u_p3>.5;float G=v;
 if(ch!=1){float gl=RC(k+vec2(-1.,0.)),gr=RC(k+vec2(1.,0.)),gu=RC(k+vec2(0.,-1.)),gd=RC(k+vec2(0.,1.));
  if(!ha)G=.25*(gl+gr+gu+gd);
  else{float xl=RC(k+vec2(-2.,0.)),xr=RC(k+vec2(2.,0.)),xu=RC(k+vec2(0.,-2.)),xd=RC(k+vec2(0.,2.));
   float gh=.5*(gl+gr)+.25*(2.*v-xl-xr),gv=.5*(gu+gd)+.25*(2.*v-xu-xd);float dh=abs(gl-gr)+abs(2.*v-xl-xr),dv=abs(gu-gd)+abs(2.*v-xu-xd);
   G=dh<dv?gh:dv<dh?gv:.5*(gh+gv);}}
 return vec4(v,max(G,0.),0.,1.);`,
   /* 4: red / blue planes (colour differences for HA, plain averages for bilinear) */
   `${Q14_CFA}int st=int(u_p0+.5);int ou=int(u_p1+.5);
 if(ou==2){vec2 p=floor(uv*u_res);int ch=st==4?Q14CF(floor(p/2.)):Q14CF(p);float v=T(uv).r;return vec4(ch==0?v:0.,ch==1?v:0.,ch==2?v:0.,1.);}
 float pt=(st==3&&ou!=1)?2.:1.;
#define RV(k) T(((k)+.5)*pt/u_res)
 vec2 k=floor(uv*u_res/pt);vec4 s=RV(k);int ch=Q14CF(k);bool ha=st==5?ou!=1:u_p3>.5;float G=s.g;float rr=0.,bb=0.;
 vec4 L=RV(k+vec2(-1.,0.)),Rr=RV(k+vec2(1.,0.)),U=RV(k+vec2(0.,-1.)),Dn=RV(k+vec2(0.,1.));
 vec4 a1=RV(k+vec2(-1.,-1.)),a2=RV(k+vec2(1.,1.)),b1=RV(k+vec2(1.,-1.)),b2=RV(k+vec2(-1.,1.));
 float hx,vx,dx;
 if(ha){hx=G+.5*((L.r-L.g)+(Rr.r-Rr.g));vx=G+.5*((U.r-U.g)+(Dn.r-Dn.g));
  float e1=(a1.r+a2.r)*.5+(2.*G-a1.g-a2.g)*.5,e2=(b1.r+b2.r)*.5+(2.*G-b1.g-b2.g)*.5;float g1=abs(a1.r-a2.r)+abs(2.*G-a1.g-a2.g),g2=abs(b1.r-b2.r)+abs(2.*G-b1.g-b2.g);
  dx=g1<g2?e1:g2<g1?e2:.5*(e1+e2);}
 else{hx=.5*(L.r+Rr.r);vx=.5*(U.r+Dn.r);dx=.25*(a1.r+a2.r+b1.r+b2.r);}
 if(ch==0){rr=s.r;bb=dx;}else if(ch==2){bb=s.r;rr=dx;}
 else{bool rrow=mod(k.y,2.)<.5;rr=rrow?hx:vx;bb=rrow?vx:hx;}
 return vec4(max(vec3(rr,G,bb),0.),1.);`,
   /* 5: false colour suppression (openISP-style edge gain on chroma), back to display gamma */
   `int st=int(u_p0+.5);int ou=int(u_p1+.5);vec3 l=T(uv).rgb;
 if(st==6&&ou==0){float Y=luma(l);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=luma(T(uv+vec2(float(i),float(j))/u_res).rgb);
  float e=abs(Y-s/9.)*9./max(Y+.05,.05);float g=1.-smoothstep(.15+.35*(1.-u_p2),.6+.6*(1.-u_p2),e);l=vec3(Y)+(l-vec3(Y))*g;}
 vec3 o=pow(clamp(l,0.,1.),vec3(1./2.2));
 if(ou==3)o=clamp(abs(o-O(uv).rgb)*4.,0.,1.);
 return vec4(o,1.);`],
  'single-image ISP simulation: the input (taken as sRGB, linearised with gamma 2.2) is mosaicked into an RGGB raw (Quad Bayer: 2x2 same-colour blocks) carrying the impairment the stage fixes (Impairment = strength), the stage is applied in the CFA domain, then demosaiced. Black level: pedestal bl = 0.25 x Impairment added, then (raw - bl) / (white - bl). DPC: openISP-style detection (pixel differs from all 8 same-colour neighbours at distance 2 by > threshold, same sign) and replacement by the mean along the smallest-gradient direction (vertical, horizontal, two diagonals). Green imbalance: Gb gain mismatch; flat-area Gr/Gb equalisation with the 4 diagonal (other-type) greens. Binning: 2x2 same-colour average into a half-resolution Bayer (shown at full size). Quad Bayer remosaic: Gaussian-weighted same-colour interpolation into standard RGGB (vendor remosaic algorithms are proprietary - approx.); Uncorrected = the quad mosaic demosaiced as if Bayer. Hamilton-Adams 1997: green by the direction of the smaller gradient |dG| + |2X - X-2 - X+2| with Laplacian correction, R/B from colour differences (diagonal direction chosen the same way); Uncorrected = bilinear. False colour suppression: chroma scaled down by an edge gain from the luma high-pass (openISP FCS idea).');

/* --- colour matrices --- */
const Q14_MATS = `
#define Q14M(a,b,c2,d,e,f2,g,h,i) transpose(mat3(a,b,c2,d,e,f2,g,h,i))
`;
f('q14_isp_color','Camera Colour Matrices (CCM, DNG ColorMatrix, ForwardMatrix)',
  [S('Matrix stage',['CCM camera RGB to sRGB','Camera to XYZ (DNG ColorMatrix)','DNG forward matrix (to XYZ D50)','Uncorrected camera RGB (no CCM)']),
   S('Camera',['Canon EOS 5D Mark II','Nikon D700','Sony ILCE-7M3','Fujifilm X-T3']),S('Input is',['sRGB scene (simulate capture)','Camera RGB (apply to input)']),
   S('View',['Rendered sRGB','Intermediate values as RGB'])],
  `${Q14_MATS}int st=int(u_p0+.5);int cm=int(u_p1+.5);bool scene=u_p2<.5;bool inter=u_p3>.5;
 mat3 S2X=Q14M(.4124564,.3575761,.1804375,.2126729,.7151522,.0721750,.0193339,.1191920,.9503041);mat3 X2S=inverse(S2X);
 mat3 CM=cm==0?Q14M(.4716,.0603,-.0830,-.7798,1.5474,.2480,-.1496,.1937,.6651):cm==1?Q14M(.8139,-.2171,-.0663,-.8747,1.6541,.2295,-.1925,.2008,.8093)
  :cm==2?Q14M(.7374,-.2389,-.0551,-.5435,1.3162,.2519,-.1006,.1795,.6552):Q14M(1.3426,-.6334,-.1177,-.4244,1.2136,.2371,-.0580,.1303,.5980);
 mat3 BR=Q14M(1.0478112,.0228866,-.0501270,.0295424,.9904844,-.0170491,-.0092345,.0150436,.7521316);
 vec3 W65=vec3(.95047,1.,1.08883);vec3 n=CM*W65;
 vec3 lin=${LIN('clamp(c.rgb,0.,1.)')};vec3 cam=scene?(CM*(S2X*lin))/n:lin;
 mat3 C2X=inverse(CM)*mat3(n.x,0.,0.,0.,n.y,0.,0.,0.,n.z);vec3 o;
 if(st==3)o=cam;
 else if(st==0){mat3 ccm=X2S*C2X;o=inter?cam:ccm*cam;}
 else if(st==1){vec3 xyz=C2X*cam;o=inter?xyz/W65:X2S*xyz;}
 else{mat3 FM=BR*C2X;vec3 w50=FM*vec3(1.);FM=mat3(.9642/w50.x,0.,0.,0.,1./w50.y,0.,0.,0.,.8249/w50.z)*FM;
  vec3 xyz=FM*cam;o=inter?xyz/vec3(.9642,1.,.8249):X2S*(inverse(BR)*xyz);}
 o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`,
  'camera colour pipeline with real Adobe DNG ColorMatrix (XYZ D65 -> camera, from LibRaw colordata) for 4 cameras. sRGB scene input: linear sRGB -> XYZ -> camera RGB (ColorMatrix) and white-balanced by the camera neutral CM x D65 white; camera-RGB input: the image itself is taken as white-balanced camera RGB. CCM = XYZ->sRGB x ColorMatrix^-1 x diag(neutral) (white preserved); Camera to XYZ = ColorMatrix^-1 path (DNG spec); ForwardMatrix = Bradford D65->D50 x ColorMatrix^-1 x diag(neutral), rescaled so (1,1,1) maps to D50 white (a derived FM: real DNGs ship separately calibrated ones), then D50 -> D65 Bradford -> sRGB; Uncorrected = white-balanced camera RGB shown directly (the raw look without a CCM). Intermediate view shows camera RGB / XYZ / XYZ D50 (normalised to white) as RGB. A scene round trip through any rendered path reproduces the input (the matrices are exact inverses).');

/* ================= OtisFX depth shaders (Frans Bouma) ================= */
f = add('Depth');
f('q14_otis_depth','OtisFX Directional Depth Blur / Depth Darkness / Magic Border',
  [S('Effect',['Directional Depth Blur','Depth Darkness','Magic Border']),P('Focus plane or frame depth',0,1,.35,.01),
   P('Blur length or range or inset',0,1,.5,.01),P('Blur angle or picture opacity',0,1,1,.01)],
  `int ef=int(u_p0+.5);float d=1.-D(uv);float fp=u_p1;
 if(ef==1){float rg=max(u_p2*.3,.002);float e=fp+rg;vec3 o=d<fp?c.rgb:mix(c.rgb,vec3(0.),clamp(1.-(e-d)/rg,0.,1.));return vec4(o,1.);}
 if(ef==2){float ins=u_p2*.2;bool inside=all(greaterThan(uv,vec2(ins)))&&all(lessThan(uv,vec2(1.-ins)));
  vec4 fc=inside?vec4(.7,.7,.7,u_p3):vec4(1.);return vec4(d>fp?mix(c.rgb,fc.rgb,fc.a):c.rgb,1.);}
 float rg=.03;if(d<=fp||u_p2<=0.)return c;
 float ang=6.28318530718*u_p3;vec2 dl=vec2(cos(ang),sin(ang))*length(u_px);float bl=length(u_res)*u_p2*.2;float stp=max(2.,bl/96.);
 vec3 col=c.rgb;vec4 av=vec4(col,1.);
#define Q14AW(x) ((x)/(1.5-clamp((x),0.,1.49)))
 vec3 ag=Q14AW(col);vec3 LW=vec3(.3,.59,.11);float ml=dot(ag,LW);
 for(int i=0;i<200;i++){float ti=float(i)*stp;if(ti>=bl)break;vec2 tc=clamp(uv+dl*ti,0.,1.);vec3 tcol=T(tc).rgb;float td=1.-D(tc);
  float w=td<=fp?0.:1.-ti/max(bl,1e-4);av+=vec4(tcol*w,w);vec3 gt=Q14AW(tcol);ag+=gt*w;if(w>0.)ml=max(ml,clamp(dot(gt,LW),0.,1.));}
 vec3 fr=av.rgb/max(av.a,1e-4);vec3 agn=ag/max(av.a,1e-4);agn=(agn*1.5)/(1.+agn);float nl=dot(fr,LW);agn*=1.+clamp(clamp(ml,0.,1.)-nl,0.,1.);
 fr=(1.-.5)*fr+.5*agn;float bf=fp+rg<d?1.:smoothstep(0.,1.,1.-((fp+rg-d)/rg));
 return vec4(mix(c.rgb,fr,bf),1.);`,
  'OtisFX ports (ReShade linearised depth = 1 - depth map): Directional Depth Blur = one-sided streak blur along Blur angle x 2 pi, length = Blur length x 0.2 x screen diagonal, taps every 2 px with linear falloff, taps nearer than the focus plane get weight 0, highlight gain 0.5 via the AccentuateWhites (x / (1.5 - x)) and max-luma boost, blended in past the focus plane (Parallel Strokes mode; focus-point mode omitted); Depth Darkness = black blended in beyond the focus plane over the soft range (range = 0.3 x slider); Magic Border = white border and grey (0.7) picture area drawn wherever the scene is farther than the frame depth, so near objects pop out of the frame (rectangular frame inset by 0.2 x slider; equal corner depths)');

/* ================= GShade: PandaFX, SmartNoise, PatternShading ================= */
const Q14_PFX = `
#define Q14SG(v,a) ((v)<.5?pow((v),(a))*pow(2.,(a))*.5:1.-pow(1.-(v),(a))*pow(2.,(a))*.5)
#define Q14PRE(cc,A) {A=clamp(cc,0.,1.);A.b=pow(A.b,.99);A=vec3(Q14SG(A.r,.9),Q14SG(A.g,.8),Q14SG(A.b,.8));A.g=A.g*.8+A.b*.2;float rd_=clamp(A.r-A.g-A.b,0.,1.),gn_=clamp(A.g-A.r-A.b,0.,1.),bl_=clamp(A.b-A.r-A.g,0.,1.);A*=(1.-rd_*.6)*(1.-gn_*.8)*(1.-bl_*.3);}
#define Q14SC(x) (-(2.*(x)-1.)*abs(2.*(x)-1.)*.5+(2.*(x)-1.)+.5)
`;
f = add('Film');
f('q14_pandafx','PandaFX (OtisFX / GShade)',[P('Blend Amount',0,1,.5,.01),P('Bleach Bypass Amount',0,1,.5,.01),P('Diffusion',0,2,1,.01),S('Static dither',['On','Off'])],
  [`${Q14_PFX}vec4 s=vec4(0.);float w1=0.,w2=0.;float sp1=2.*u_res.x/1920.,sp2=.0045*u_res.x;
 for(int i=-10;i<=10;i++){float x=float(i);vec3 A;
  if(abs(x)<=8.){vec2 q=clamp(uv+vec2(x*sp1/u_res.x,0.),0.,1.);Q14PRE(O(q).rgb,A);float w=Q14SC(1.-abs(x)/8.);s.rgb+=A*w;w1+=w;}
  vec2 q2=clamp(uv+vec2(x*sp2/u_res.x,0.),0.,1.);Q14PRE(O(q2).rgb,A);float w=Q14SC(1.-abs(x)/10.5);s.a+=dot(A,vec3(.3333))*w;w2+=w;}
 return vec4(s.rgb/w1,s.a/w2);`,
   `${Q14_PFX}vec4 s=vec4(0.);float w1=0.,w2=0.;float sp1=2.*u_res.x/1920.,sp2=.0045*u_res.x;
 for(int i=-10;i<=10;i++){float x=float(i);
  if(abs(x)<=8.){float w=Q14SC(1.-abs(x)/8.);s.rgb+=T(clamp(uv+vec2(0.,x*sp1/u_res.y),0.,1.)).rgb*w;w1+=w;}
  float w=Q14SC(1.-abs(x)/10.5);s.a+=T(clamp(uv+vec2(0.,x*sp2/u_res.y),0.,1.)).a*w;w2+=w;}
 return vec4(s.rgb/w1,s.a/w2);`,
   `${Q14_PFX}vec3 A;Q14PRE(O(uv).rgb,A);vec4 t=T(uv);vec3 l1=t.rgb;float g3=0.,w3=0.;
 for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j))*.011*vec2(1.,u_res.x/u_res.y);float w=Q14SC(1.-length(vec2(float(i),float(j)))/4.6);if(w<=0.)continue;g3+=T(clamp(uv+o,0.,1.)).a*w;w3+=w;}
 g3/=w3;vec3 l2=mix(l1,vec3(t.a),.75);vec3 l3=mix(l1,vec3(g3),.75);
 float dk=u_p2;l1=pow(clamp(l1*.3*dk,0.,1.),vec3(.7));l2=pow(clamp(l2*.2*dk,0.,1.),vec3(.5));l3=pow(clamp(l3*1.*dk,0.,1.),vec3(5.));
 if(u_p3<.5){vec3 hn=1.-vec3(hash(PX(uv)),hash(PX(uv)+17.3),hash(PX(uv)+41.9))*.01;l1=1.-hn*(1.-l1);l2=1.-hn*(1.-l2);l3=1.-hn*(1.-l3);}
 A=screen(clamp(l1,0.,1.),A);A=screen(clamp(l2,0.,1.),A);A=screen(clamp(l3,0.,1.),A);
 float Ag=dot(vec3(.3333),A);vec3 C=Ag>.5?1.-2.*(1.-Ag)*(1.-A):2.*Ag*A;C=pow(max(C,0.),vec3(.6));A=mix(A,C,u_p1);
 return vec4(mix(O(uv).rgb,A,u_p0),1.);`],
  'PandaFX (Jukka Korhonen, in OtisFX / GShade) port: prepass gamma (1,1,0.99) + adjustable sigmoid contrast (0.9,0.8,0.8) + film colour weights (G = 0.8 G + 0.2 B, pure red/green/blue darkened 0.6/0.8/0.3); lens diffusion = three sigmoid-weighted blur layers (amount 0.3/0.2/1.0 x Diffusion, gamma 0.7/0.5/5) screen-blended, layers 2-3 75 % desaturated; static 1 % dither; bleach bypass = hard-light of the image with its own mean then gamma 0.6; Blend Amount mixes with the original. The 1/16 and 1/64-resolution blur layers are emulated with wide full-resolution blurs and the colour of layers 2-3 is taken from layer 1 (approx.)');

f = add('Repair');
f('q14_smartnoise','SmartNoise anti-banding (GShade)',[P('Amount of noise',0,4,1,.01)],
  `vec3 col=c.rgb;float amount=u_p0*.08;float lu=dot(col,vec3(.2126,.7152,.0722));
 amount*=lu<.5?lu/.5:(1.-lu)/.5;float rd=col.r-(col.g+col.b)/2.;if(rd>0.)amount*=1.-rd*.5;float sb=.5*amount;
 if(lu-sb<0.){float k=lu/max(sb,1e-6);amount*=k;sb*=k;}else if(lu+sb>1.){float k=lu>sb?sb/lu:lu/max(sb,1e-6);amount*=k;sb*=k;}
 const float PHI=1.61803398874989*.00001,PI_=3.14159265358979*.00001,SQ2=1.41421356237309*10000.;
 vec2 tc=vec2(uv.x,1.-uv.y);float sd=((lu*u_res.y)+(u_res.x*tc.y)+tc.x)*.0001;
 float gn=fract(tan(distance(tc*u_res.y*2.*(sd+PHI),vec2(PHI,PI_)))*SQ2);
 return vec4(col+(gn*amount-sb),1.);`,
  'SmartNoise (Bapho) port: golden-ratio noise fract(tan(distance(p (seed + phi), (phi, pi))) x 1.414e4) seeded by position and luminance (static on still images, changes only where colour changes), amount = noise x 0.08 shaped by a midtone tent, reduced on reddish pixels and clipped so the noise never leaves 0..1; the depth term of the seed is dropped (no depth input)');

f = add('Retro');
f('q14_patternshade','Pattern Shading (GShade)',[P('Brightness',0,1,.1,.01),S('Amount of Shades',['2','3','4','5'],3)],
  `
#define Q14FM(a) ((a)-2.*trunc((a)/2.))
 vec2 ps=vec2(floor(uv.x*u_res.x),floor((1.-uv.y)*u_res.y))+.5;float lu=dot(c.rgb,vec3(1./3.));float th=u_p0;int sp=int(u_p1+.5);
 float pa=(Q14FM(ps.x)<=1.&&Q14FM(ps.y)<=1.)?0.:1.;float p1=(Q14FM(ps.x+1.)<=1.&&Q14FM(ps.y-1.)<=1.)?1.:0.;
 float p2=(Q14FM(ps.x)<=1.&&Q14FM(ps.y-1.)<=1.)?1.:0.;float p3=((Q14FM(ps.x)<=1.&&Q14FM(ps.y)<=1.)||(Q14FM(ps.x+1.)<=1.&&Q14FM(ps.y+1.)<=1.))?0.:1.;
 if(sp==0)pa=lu>th?1.:0.;
 else if(sp==1){if(lu<=th)pa=0.;else if(lu<=th*2.)pa=p3;else pa=1.;}
 else if(sp==2){if(lu<=th)pa=0.;else if(lu<=th*2.)pa=p1;else if(lu>th*3.)pa=1.;}
 else{if(lu<=th)pa=0.;else if(lu<=th*2.)pa=p2;else if(lu<=th*3.)pa=p3;else if(lu>th*4.)pa=1.;}
 return vec4(vec3(pa),1.);`,
  'PatternShading (EDCVBNM, in GShade) port: 1-bit output, luminance = RGB mean banded at multiples of Brightness into black, 2x2 dot patterns (1/4, 1/2 checker) and white; quirks of the original kept (with 4 shades the band 2-3 x Brightness keeps the base 3/4 pattern, with 5 shades the band 3-4 x Brightness does too)');

/* ================= Corel Painter surface-control effects ================= */
const Q14_PAPER = `
#define Q14PAP(p,sc) (.5*vnoise((p)/(2.2*(sc)))+.3*vnoise((p)/(1.1*(sc))+vec2(17.,3.))+.2*hash(floor((p)/max((sc)*.6,1.))))
`;
f = add('Paint');
f('q14_painter_surface','Corel Painter Surface Control (Surface Texture, Express Texture, Dye Concentration, Distress, Apply Screen, Serigraphy)',
  [S('Effect',['Apply Surface Texture','Express Texture','Dye Concentration','Distress','Apply Screen','Serigraphy']),S('Using',['Paper','Image Luminance']),
   P('Amount',0,1,.6,.01),P('Threshold',0,1,.5,.01)],
  [/* 1: palette for Serigraphy (k-means on a 16x16 grid, 6 inks) in row 0 */
   `int ef=int(u_p0+.5);vec2 ip=floor(uv*u_res);if(ef!=5||ip.y>.5||ip.x>=6.)return c;int me=int(ip.x);vec3 C[6];
 for(int k=0;k<6;k++){float t=(float(k)+.5)/6.;C[k]=O(vec2(fract(t*3.7+.13),fract(t*1.9+.31))).rgb;C[k]=mix(C[k],vec3(t),.35);}
 for(int it=0;it<6;it++){vec3 S_[6];float N_[6];for(int k=0;k<6;k++){S_[k]=vec3(0.);N_[k]=0.;}
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 x=O((vec2(float(i),float(j))+.5)/16.).rgb;float bd=1e9;int bi=0;for(int k=0;k<6;k++){vec3 dd=x-C[k];float e=dot(dd,dd);if(e<bd){bd=e;bi=k;}}S_[bi]+=x;N_[bi]+=1.;}
  for(int k=0;k<6;k++)if(N_[k]>0.)C[k]=S_[k]/N_[k];}
 return vec4(C[me],1.);`,
   `${Q14_PAPER}int ef=int(u_p0+.5);bool pap=u_p1<.5;vec3 col=O(uv).rgb;float g=luma(col);vec2 p=PX(uv);float sc=1.4;
 float pa=Q14PAP(p,sc);float tex=pap?pa:g;float am=u_p2,th=u_p3;
 if(ef==0){
  float hx,hy;if(pap){hx=Q14PAP(p+vec2(1.,0.),sc)-Q14PAP(p-vec2(1.,0.),sc);hy=Q14PAP(p+vec2(0.,1.),sc)-Q14PAP(p-vec2(0.,1.),sc);}
  else{hx=blurL(uv+vec2(u_px.x,0.),1.)-blurL(uv-vec2(u_px.x,0.),1.);hy=blurL(uv+vec2(0.,u_px.y),1.)-blurL(uv-vec2(0.,u_px.y),1.);}
  vec3 n=normalize(vec3(-hx*am*(pap?1.6:6.),-hy*am*(pap?1.6:6.),1.));vec3 l=normalize(vec3(-.6,.6,.75));float sh=dot(n,l)/l.z;vec3 h=normalize(l+vec3(0.,0.,1.));
  float spc=pow(max(dot(n,h),0.),24.)*.4*am;return vec4(clamp(col*sh+spc,0.,1.),1.);}
 if(ef==1){float gr=pap?(pa-.5):(blurL(uv,1.)-g);float v=(g-th*.7)+am*gr*1.2;return vec4(vec3(clamp(.5+v*10.,0.,1.)),1.);}
 if(ef==2){float mx=.2+am*3.8,mn=th*mx;float fct=pap?mix(mn,mx,pa):mix(mn,mx,g);
  return vec4(pow(clamp(col,0.002,1.),vec3(fct)),1.);}
 if(ef==3){float bl=blurL(uv,2.);float en=g+(g-bl)*3.*am;float va=pap?(pa-.5)*am*.8:0.;float s=.04;
  float v=smoothstep(th*.7-s,th*.7+s,en+va);return vec4(vec3(v),1.);}
 if(ef==4){float v=g+(pap?(pa-.5)*am:0.);float t1=th*.7,t2=th*.7+.35;vec3 c1=vec3(.97,.94,.84),c2=vec3(.86,.33,.26),c3=vec3(.12,.12,.3);
  float s=.02;vec3 o=mix(c3,c2,smoothstep(t1-s,t1+s,v));o=mix(o,c1,smoothstep(t2-s,t2+s,v));return vec4(o,1.);}
 vec3 sm=vec3(0.);float sw=0.;float rr=1.+am*3.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j));float w=exp(-dot(o,o)/4.);sm+=O(uv+o*u_px*rr*.6).rgb*w;sw+=w;}sm/=sw;
 vec3 hs=rgb2hsv(sm);float bd=1e9;vec3 bc=vec3(1.);for(int k=0;k<6;k++){vec3 pc=T(vec2((float(k)+.5)/u_res.x,.5/u_res.y)).rgb;vec3 ph=rgb2hsv(pc);
  float dh=abs(hs.x-ph.x);dh=min(dh,1.-dh)*min(hs.y,ph.y)*2.;float e=dh*dh+(hs.y-ph.y)*(hs.y-ph.y)*.5+(hs.z-ph.z)*(hs.z-ph.z);if(e<bd){bd=e;bc=pc;}}
 return vec4(bd<.02+th*th*.5?bc:vec3(.98,.97,.94),1.);`],
  'Corel Painter Effects > Surface Control, from the Painter help: Apply Surface Texture (relief from paper grain or image luminance, light from upper left, shine 40 %), Express Texture (high-contrast grey screen: luminance vs Gray Threshold with the texture penetrating by Grain = Amount), Dye Concentration (optical density scaled between Minimum = Threshold x Maximum and Maximum = 20..400 % by the paper or luminance model), Distress (edge-enhanced luminance (Edge Amount = Amount) plus paper-grain variance, thresholded black / white with smoothing), Apply Screen (three-colour screen from luminance + paper with Threshold 1 / 2; colour chips fixed to cream / vermilion / navy), Serigraphy (6 inks found by k-means, each pixel of the smoothed image (Smoothing = Amount) printed in the nearest ink by hue / saturation / luminance-weighted distance, unprinted paper beyond the Threshold tolerance). Paper = procedural Painter-like grain (Corel ships scanned papers); approx.');
