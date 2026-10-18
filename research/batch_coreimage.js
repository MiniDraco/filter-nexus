/* ================= coreimage: Apple Core Image CIFilters (distortions, tiles, stylize, height field, lights, photo effects, colour) ================= */
f = add('Distort');
f('ci_distort','Core Image Distortions',[S('Effect',['Hole','Light Tunnel','Circle Splash','Circular Wrap','Glass Lozenge','Torus Lens','Vortex','Bump (linear)'],0),
  P('Radius',.05,1,.3,.01),P('Refraction / scale',-1,2,.7,.01),P('Angle',-720,720,90,1,'°')],
  `vec2 a=vec2(asp(),1.);vec2 q=(uv-.5)*a;float d=max(length(q),1e-5);int m=int(u_p0+.5);float r=u_p1,am=u_p2,ang=radians(u_p3);vec2 s=q;
 if(m==0){if(d<r)return vec4(0.,0.,0.,1.);s=q/d*(d-r*r/d);}
 else if(m==1){if(d>r){float th=atan(q.y,q.x)+ang*(d-r)/r;s=r*vec2(cos(th),sin(th));}}
 else if(m==2){if(d>r)s=q/d*r;}
 else if(m==3){float th=atan(q.y,q.x)-ang;float yy=(d-r)*a.x/(6.2831853*r);if(d<r||yy>1.)return vec4(0.,0.,0.,1.);return vec4(O(vec2(fract(th/6.2831853+.5),yy)).rgb,1.);}
 else if(m==4||m==5){vec2 v;float w;
  if(m==4){vec2 dr=vec2(cos(ang),sin(ang));vec2 cp=dr*clamp(dot(q,dr),-.18,.18);v=q-cp;w=r;}
  else{w=r*.35;float rr=r+w*.3;v=q/d*(d-rr);}
  float sd=length(v);if(sd<w){float t=sd/w;vec3 n=normalize(vec3(v/w,sqrt(max(1.-t*t,0.))));vec3 rf=refract(vec3(0.,0.,-1.),n,1./(1.+max(am,0.)));
   s=q+rf.xy/max(-rf.z,.15)*w*1.4*sqrt(max(1.-t*t,0.));}}
 else if(m==6){if(d<r){float t=1.-d/r;s=rot(q,ang*t*t);}}
 else{vec2 dr=vec2(cos(ang),sin(ang));vec2 nn=vec2(-dr.y,dr.x);float sp=dot(q,nn);if(abs(sp)<r){float t=sp/r;float k=1.-am*(1.-t*t)*(1.-t*t);s=q-nn*sp+nn*sp*k;}}
 return vec4(O(clamp(s/a+.5,0.,1.)).rgb,1.);`,
  'CIHoleDistortion, CILightTunnel, CICircleSplashDistortion, CICircularWrap, CIGlassLozenge, CITorusLensDistortion, CIVortexDistortion, CIBumpDistortionLinear — centred at the image centre; Radius in image heights; lozenge/torus refract through a glass dome (refraction = ior−1); approx. of Apple\'s kernels (hole/wrap outside → black)');

/* ---- tiles: CI tile family on a lattice of Width px centred on the image, Angle rotates the lattice ---- */
f('ci_tiles','Core Image Tiles',[S('Tile',['Op Tile','Parallelogram','Perspective','Eightfold Reflected','Fourfold Rotated','Fourfold Translated','Glide Reflected','Sixfold Rotated','Twelvefold Reflected','Triangle Kaleidoscope','Triangle Tile','Affine Clamp'],3),
  P('Width',10,400,110,1,'px'),P('Angle',-180,180,0,1,'°'),P('Shape (acute angle / perspective / scale)',0,1,.5,.01)],
  `
#define CIM_TRI(v) (1.-abs(mod((v),2.)-1.))
vec2 P0=PX(vec2(.5));vec2 p0=PX(uv)-P0;float w=u_p1,an=radians(u_p2),ex=u_p3;int m=int(u_p0+.5);vec2 p=rot(p0,-an);vec2 l=p;
 if(m==0){vec2 cl=floor(p0/w);vec2 cc=(cl+.5)*w;vec2 sr=cc+rot(p0-cc,an+.7853982*mod(cl.x+cl.y,2.))*mix(.5,3.,ex);return vec4(O(clamp(fromPX(sr+P0),0.,1.)).rgb,1.);}
 else if(m==1||m==5){float ac=radians(mix(25.,90.,ex));vec2 a1=vec2(1.,0.),a2=vec2(cos(ac),sin(ac));float vv=p.y/w/a2.y,uu=p.x/w-vv*a2.x;
  vec2 f2=m==1?vec2(CIM_TRI(uu),CIM_TRI(vv)):fract(vec2(uu,vv));l=(f2.x*a1+f2.y*a2-(a1+a2)*.5)*w;}
 else if(m==2){float H=u_res.y/u_k;float yy=clamp(p0.y/H+.5,0.,1.);vec2 pp=p*(1.+3.*ex*yy);l=(fract(pp/w)-.5)*w;}
 else if(m==3){vec2 g=vec2(CIM_TRI(p.x/w),CIM_TRI(p.y/w));if(g.y>g.x)g=g.yx;l=(g-.5)*w;}
 else if(m==4){vec2 g=p/w;vec2 gc=g-floor(g*.5)*2.-1.;vec2 k=gc;if(gc.x<0.&&gc.y>=0.)k=vec2(gc.y,-gc.x);else if(gc.x<0.&&gc.y<0.)k=-gc;else if(gc.x>=0.&&gc.y<0.)k=vec2(-gc.y,gc.x);l=(k-.5)*w;}
 else if(m==6){vec2 g=p/w;float row=floor(g.y);float odd=mod(row,2.);float fx=fract(g.x+.5*odd);if(odd>.5)fx=1.-fx;l=(vec2(fx,fract(g.y))-.5)*w;}
 else if(m==7||m==8){float hj=p.y/(w*.8660254),hi=p.x/w-hj*.5;vec2 bc=vec2(0.);float bd=1e9;
  for(int j=0;j<2;j++)for(int i=0;i<2;i++){vec2 ij=floor(vec2(hi,hj))+vec2(float(i),float(j));vec2 cc=vec2(ij.x+ij.y*.5,ij.y*.8660254)*w;float dd=length(p-cc);if(dd<bd){bd=dd;bc=cc;}}
  vec2 rv=p-bc;float th=atan(rv.y,rv.x);float sg=1.0471976;float aa=mod(th,sg);if(m==8&&aa>sg*.5)aa=sg-aa;l=length(rv)*vec2(cos(aa),sin(aa));}
 else if(m==9||m==10){vec2 o0=vec2(0.,-1.),o1=vec2(.8660254,.5),o2=vec2(-.8660254,.5);float ir=w/3.4641016;float nf=0.;
  for(int i=0;i<64;i++){bool ch=false;float dd=dot(l,o0)-ir;if(dd>0.){l-=2.*dd*o0;nf+=1.;ch=true;}dd=dot(l,o1)-ir;if(dd>0.){l-=2.*dd*o1;nf+=1.;ch=true;}dd=dot(l,o2)-ir;if(dd>0.){l-=2.*dd*o2;nf+=1.;ch=true;}if(!ch)break;}
  if(m==10&&mod(nf,2.)>.5)l.x=-l.x;}
 else{l=p/mix(.3,1.,ex);}
 return vec4(O(clamp(fromPX(rot(l,an)+P0),0.,1.)).rgb,1.);`,
  'CIOpTile, CIParallelogramTile, CIPerspectiveTile, CIEightfoldReflectedTile (p4m), CIFourfoldRotatedTile (p4), CIFourfoldTranslatedTile, CIGlideReflectedTile (pg), CISixfoldRotatedTile (p6), CITwelvefoldReflectedTile (p6m), CITriangleKaleidoscope (mirror walk into an equilateral triangle), CITriangleTile (orientation-preserving copies), CIAffineClamp (scaled/rotated with clamped edges); source tile = the region of Width around the image centre; approx.');

f('ci_stretchcrop','Stretch Crop (Core Image)',[P('Target aspect (x current)',.4,2.5,1.6,.01),P('Crop amount',0,1,.3,.01),P('Center stretch amount',0,1,.25,.01)],
  `
#define CIM_G(x_,a_) ((a_)*(x_)+(1.-(a_))*(x_)*(x_)*(x_))
float A=asp(),k=u_p0,At=A*k;vec2 q=(uv-.5)*vec2(A,1.);vec2 fr=At>A?vec2(A,A/At):vec2(At,1.);
 if(abs(q.x)>fr.x*.5||abs(q.y)>fr.y*.5)return vec4(0.,0.,0.,1.);vec2 f2=q/(fr*.5);float kc=pow(k,u_p1),ks=k/kc;vec2 sN;
 if(k>=1.){float aa=clamp(mix(1./ks,1.,u_p2),.34,1.5);sN=vec2(CIM_G(f2.x,aa),f2.y/kc);}
 else{float aa=clamp(mix(ks,1.,u_p2),.34,1.5);sN=vec2(f2.x*kc,CIM_G(f2.y,aa));}
 return vec4(O(clamp(sN*.5+.5,0.,1.)).rgb,1.);`,
  'CIStretchCrop: fits the image to a new aspect (shown letterboxed in the frame) by cropping a share of the change and stretching the rest; center stretch 0 keeps the centre at native scale and stretches the sides (cubic map); approx.');

f = add('Stylize');
f('ci_stylize','Gloom / Edge Work / Circular Screen',[S('Effect',['Gloom','Edge Work (woodblock)','Circular Screen'],0),P('Radius / width',1,60,10,.5,'px'),P('Intensity / sharpness',0,1,.6,.01)],
  [BH('u_p1'),BV('u_p1'),`{vec3 c=O(uv).rgb,b=T(uv).rgb;int m=int(u_p0+.5);float l=luma(c);
 if(m==0){vec3 g=mix(c,b,.4)*b*1.1;return vec4(mix(c,g,u_p2),1.);}
 if(m==1){float t=.004+(1.-u_p2)*.03;float v=smoothstep(-t-.01,-t+.01,l-luma(b));return vec4(vec3(v),1.);}
 float d=length(PX(uv)-PX(vec2(.5)));float pat=.5+.5*cos(6.2831853*d/max(u_p1,1.));float sw=(1.-u_p2)*.45+.02;return vec4(vec3(smoothstep(pat-sw,pat+sw,l)),1.);}return c;`],
  'CIGloom (dulls highlights: image × its Gaussian blur, the inverse of a screen bloom, darken-only), CIEdgeWork (black where darker than the local Gaussian mean → woodblock cut), CICircularScreen (concentric-ring halftone around the centre, sharpness = edge hardness); approx.');

f = add('Materials');
f('ci_heightfield','Height Field from Mask / Shaded Material',[S('Output',['Height field','Shaded: chrome','Shaded: plastic','Shaded: image as shading map'],1),P('Mask threshold',0,1,.5,.01),P('Radius',2,60,12,1,'px'),P('Height scale',.2,3,1,.05)],
  [`float m=smoothstep(u_p1-.03,u_p1+.03,luma(O(uv).rgb));return vec4(vec3(m),1.);`,BH('u_p2'),BV('u_p2'),`
#define CIM_HF(q_) (smoothstep(u_p1-.03,u_p1+.03,luma(O(q_).rgb))*sqrt(max(0.,1.-pow(1.-clamp(2.*T(q_).r-1.,0.,1.),2.))))
int m=int(u_p0+.5);float h=CIM_HF(uv);if(m==0)return vec4(vec3(h),1.);vec2 e=u_px*1.5;
 float hx=CIM_HF(uv+vec2(e.x,0.))-CIM_HF(uv-vec2(e.x,0.)),hy=CIM_HF(uv+vec2(0.,e.y))-CIM_HF(uv-vec2(0.,e.y));float K=R(u_p2)/3.*u_p3;
 vec3 n=normalize(vec3(-hx*K,-hy*K,1.));vec3 col;
 if(m==1){vec3 rf=reflect(vec3(0.,0.,-1.),n);float y=rf.y;col=mix(vec3(.18,.16,.15),vec3(.95,.97,1.),smoothstep(-.15,.05,y));col=mix(col,vec3(.55,.6,.7),smoothstep(.1,.9,y));col+=vec3(1.)*pow(max(dot(rf,normalize(vec3(-.4,.6,.7))),0.),40.);}
 else if(m==2){vec3 ld=normalize(vec3(-.5,.6,.65));float df=max(dot(n,ld),0.);float sp=pow(max(dot(reflect(-ld,n),vec3(0.,0.,1.)),0.),30.);col=vec3(.75,.2,.15)*(.18+.8*df)+vec3(.9)*sp;}
 else col=O(n.xy*.5+.5).rgb;
 float msk=smoothstep(u_p1-.03,u_p1+.03,luma(O(uv).rgb));return vec4(col*msk,1.);`],
  'CIHeightFieldFromMask (mask = luma > threshold; height rises smoothly from 0 at the mask edge, quarter-circle profile over a Gaussian-blurred mask, approx. of Apple\'s rounded field) and CIShadedMaterial (normals of that height field look up a shading sphere: procedural chrome / plastic, or the image itself as the shading image)');

f = add('Render');
f('ci_lights','Spot Light / Halo / Star Shine / Hot Spot',[S('Light',['Spot light','Lenticular halo','Star shine','Hot spot (Fusion)'],0),P('Position X',0,1,.45,.01),P('Position Y',0,1,.55,.01),P('Size',.2,3,1,.05)],
  `{vec3 c=O(uv).rgb;int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 L=vec2(u_p1,u_p2);vec2 q=(uv-L)*a;float d=length(q);float S=u_p3;vec3 o;
 if(m==0){vec3 sp=vec3(q,0.);vec3 lp=vec3(-.25,.3,.7)*S;vec3 Ld=normalize(lp-sp);vec3 sd=normalize(-lp);float cone=pow(max(dot(-Ld,sd),0.),14./S);o=c*vec3(1.,.95,.85)*2.4*cone*Ld.z;}
 else if(m==1){float hr=.2*S,hw=.09*S;vec3 rr=hr+vec3(-1.,0.,1.)*hw*.28;vec3 ring=exp(-pow((d-rr)/(hw*.45),vec3(2.)));
  float st=vnoise(q/max(d,1e-4)*14.+3.)*.6+vnoise(q/max(d,1e-4)*41.)*.4;o=c+ring*(.55+.9*st)*.55*vec3(1.,.95,.9);}
 else if(m==2){float r0=.035*S;float core=exp(-pow(d/r0,2.))*1.2+.35*r0/(d+r0);vec2 a1=vec2(cos(.6),sin(.6)),a2=vec2(-a1.y,a1.x);float len=.45*S,wd=.0035*S;
  float cr=exp(-abs(dot(q,a2))/wd)*exp(-abs(dot(q,a1))/len*3.)+exp(-abs(dot(q,a1))/wd)*exp(-abs(dot(q,a2))/len*3.);o=c+(core+cr*.9)*vec3(1.,.93,.8);}
 else{vec2 cq=(vec2(.5)-L)*a;float r0=.08*S;vec3 g=vec3(1.,.85,.6)*(smoothstep(r0,r0*.2,d)*.9+exp(-d/(.15*S))*.6);
  for(int i=0;i<4;i++){float t=i==0?.6:i==1?1.25:i==2?1.7:2.3;float rs=(i==1?.05:i==2?.11:i==3?.03:.07)*S;vec2 gp=cq*t;float dg=length(q-gp);
   vec3 tint=i==0?vec3(.3,.8,.4):i==1?vec3(.8,.3,.7):i==2?vec3(.3,.5,.9):vec3(1.,.7,.3);g+=tint*(smoothstep(rs,rs*.7,dg)*.3+exp(-abs(dg-rs)/(.006*S))*.2);}
  o=c+g;}
 return vec4(clamp(o,0.,1.),1.);}return c;`,
  'CISpotLight (cone light above the image plane aimed at Position, Lambert × cone falloff, no ambient), CILenticularHaloGenerator (RGB-offset halo ring with noisy striations), CIStarShineGenerator (core + 4-point cross rays at 0.6 rad), Fusion Hot Spot (hot-spot glow + secondary reflections along the axis through the centre), composited additively; approx.');

f('rs_lensreflect','Lens Reflections (from highlights)',[P('Threshold',.4,1,.8,.01),P('Reflections',1,8,5,1),P('Dispersion',0,1,.4,.01),P('Intensity',0,3,.8,.05)],
  [`{vec3 c=O(uv).rgb;float l=max(c.r,max(c.g,c.b));return vec4(c*smoothstep(u_p0,min(u_p0+.15,1.),l),1.);}return c;`,BH('5.'),BV('5.'),
  `{vec3 c=O(uv).rgb;vec2 b=uv-.5;vec3 acc=vec3(0.);int n=int(u_p1+.5);float dp=u_p2*.08;
 for(int i=0;i<8;i++){if(i>=n)break;float fi=float(i);float sc=-.45-fi*.42+(mod(fi,2.)>.5?1.1:0.);vec2 g0=.5+b*sc;
  vec3 gs=vec3(T(.5+b*sc*(1.-dp)).r,T(g0).g,T(.5+b*sc*(1.+dp)).b);float wg=pow(1.-clamp(length(b*sc)/.72,0.,1.),2.);
  gs*=step(abs(g0.x-.5),.5)*step(abs(g0.y-.5),.5);acc+=gs*wg*(.55+.45*cos(6.2831853*(fi*.19+vec3(0.,.33,.67))));}
 vec2 hp=uv+normalize(vec2(.5)-uv+1e-5)*.36;float hw=pow(max(0.,1.-length(hp-.5)/.7071),5.);vec3 halo=vec3(T(hp-vec2(dp*.3)).r,T(hp).g,T(hp+vec2(dp*.3)).b)*hw;
 return vec4(clamp(c+(acc*.8+halo*.7)*u_p3,0.,1.),1.);}return c;`],
  'Resolve Lens Reflections: highlights (above Threshold) are mirrored through the optical centre at several scales as tinted ghosts with RGB dispersion, plus a halo ring (screen-space pseudo lens flare, Chapman 2013 style); approx.');

f = add('Blur');
f('rs_prismblur','Prism Blur',[S('Direction',['Radial','Linear'],0),P('Separation',0,60,8,.5,'px'),P('Angle',0,180,0,1,'°'),P('Softness',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec2 dir;if(m==0)dir=(uv-.5)*u_res/(.5*u_res.y);else{float a=radians(u_p2);dir=vec2(cos(a),sin(a));}
 vec2 off=dir*R(u_p1)*u_px;float bw=mix(.55,1.6,u_p3);vec3 acc=vec3(0.),ws=vec3(0.);
 for(int i=0;i<=28;i++){float t=float(i)/14.-1.;vec3 w=clamp(1.-abs(vec3(t)-vec3(-.6,0.,.6))/bw,0.,1.);acc+=O(uv+off*t).rgb*w;ws+=w;}
 return vec4(acc/max(ws,vec3(1e-4)),1.);`,
  'Resolve Prism Blur: the image is smeared along a radial or linear direction and the smear is split into red→green→blue spectral bands (each band normalised, so neutrals stay neutral); Softness widens the bands');

f = add('Film');
f('ci_photoeffect','Core Image Photo Effects',[S('Effect',['Chrome','Fade','Instant','Process','Tonal','Transfer'],0),P('Amount',0,1,1,.01)],
  `{vec3 c=O(uv).rgb;float l=luma(c);int m=int(u_p0+.5);vec3 r=c;vec3 sc=c*c*(3.-2.*c);
 if(m==0){r=mix(c,sc,.65);r=sat(r,1.35);r*=vec3(.98,1.,1.04);}
 else if(m==1){r=sat(c,.6);r=.09+r*.84;r*=vec3(1.03,1.,.93);}
 else if(m==2){r=sat(c,.78);r=.07+r*.88;r=r*vec3(1.07,1.03,.84)+vec3(0.,.025,.07)*(1.-l);}
 else if(m==3){r=mix(c,sc,.55);r=vec3(r.r*.93+.02,r.g*.98+.03,r.b*.82+.13);r=sat(r,1.1);}
 else if(m==4){float v=.06+.88*pow(l,.92);r=vec3(v);}
 else{r=sat(c,1.12);r=r*vec3(1.08,1.,.8)+vec3(.04,.03,.02);r=mix(r,r*r*(3.-2.*r),.3);}
 return vec4(mix(c,clamp(r,0.,1.),u_p1),1.);}return c;`,
  'CIPhotoEffectChrome / Fade / Instant / Process / Tonal / Transfer (the Photos-app looks): Apple ships them as 3D LUTs, these are hand-matched approximations (contrast, saturation, black lift, tint)');

f = add('Color');
f('ci_colorpoly','Color Cross Polynomial',[P('Cross mix (−: more saturation)',-1,1,-.25,.01),P('Square terms',-1,1,.25,.01),P('Cross products',-2,2,.6,.01),P('Hue twist',-.5,.5,.06,.01)],
  `{vec3 c=O(uv).rgb;vec3 o=c;o+=u_p0*((c.gbr+c.brg)*.5-c);o+=u_p1*(c*c-c);float pm=(c.r*c.g+c.g*c.b+c.b*c.r)/3.;o+=u_p2*(c.gbr*c.brg-pm);o+=u_p3*(c.gbr-c.brg);
 return vec4(clamp(o,0.,1.),1.);}return c;`,
  'CIColorCrossPolynomial: out = linear + square (r², g², b²) + cross-product (rg, gb, br) terms per channel; the 30 coefficients are reduced to 4 symmetric controls that leave greys unchanged except Square terms (a tone curve)');

f('ci_srgbcurve','Linear ↔ sRGB Tone Curve',[S('Direction',['Linear → sRGB','sRGB → Linear'],0),P('Amount',0,1,1,.01)],
  `{vec3 c=clamp(O(uv).rgb,0.,1.);vec3 r=u_p0<.5?${SRGB('c')}:${LIN('c')};return vec4(mix(c,r,u_p1),1.);}return c;`,
  'CILinearToSRGBToneCurve / CISRGBToneCurveToLinear: exact IEC 61966-2-1 piecewise sRGB transfer function');

f('rs_lgg','Lift / Gamma / Gain',[S('Channel',['Master','Red','Green','Blue'],0),P('Lift',-.5,.5,.04,.005),P('Gamma',.2,3,1.15,.01),P('Gain',0,2,.97,.01)],
  `{vec3 c=O(uv).rgb;int m=int(u_p0+.5);vec3 k=m==0?vec3(1.):m==1?vec3(1.,0.,0.):m==2?vec3(0.,1.,0.):vec3(0.,0.,1.);
 vec3 y=clamp(u_p3*(c+u_p1*(1.-c)),0.,1.);y=pow(y,vec3(1./u_p2));return vec4(mix(c,y,k),1.);}return c;`,
  'Resolve / ASC-style primaries: out = (gain·(x + lift·(1−x)))^(1/gamma), master or one channel (lift pivots at white, gain at black)');

f('rs_printerlights','Printer Lights',[P('Red',-24,24,3,1,'pt'),P('Green',-24,24,1,1,'pt'),P('Blue',-24,24,-2,1,'pt'),P('Master',-24,24,0,1,'pt')],
  `{vec3 c=clamp(O(uv).rgb,0.,1.);vec3 li=${LIN('c')};li*=exp2((vec3(u_p0,u_p1,u_p2)+u_p3)/12.);li=clamp(li,0.,1.);return vec4(${SRGB('li')},1.);}return c;`,
  'Resolve printer-light offsets: each point = 0.025 log exposure ≈ 1/12 stop applied per channel in linear light (lab printer-point convention; Resolve lets the step be changed)');

f('rs_colortools','Color Density / Compressor / Gamut Limiter',[S('Tool',['Color density (subtractive saturation)','Color compressor','Gamut limiter'],0),P('Amount',0,1,.5,.01),P('Target hue',0,360,30,1,'°'),P('Range / softness',0,1,.35,.01)],
  `{vec3 c=O(uv).rgb;int m=int(u_p0+.5);float a=u_p1;vec3 r=c;float l=luma(c);
 if(m==0){vec3 s=mix(vec3(l),c,1.+a);float ch=max(s.r,max(s.g,s.b))-min(s.r,min(s.g,s.b));r=s*(1.-a*.55*clamp(ch,0.,1.));}
 else if(m==1){vec3 h=rgb2hsv(c);float dh=fract(h.x-u_p2/360.+.5)-.5;float hw=max(u_p3*.5,.01);float w=(1.-smoothstep(0.,hw,abs(dh)))*smoothstep(.03,.15,h.y);
  h.x=fract(h.x-dh*a*w);h.y=mix(h.y,mix(h.y,.45,.5),a*w*.5);r=hsv2rgb(h);}
 else{float cb=(c.b-l)/1.8556,cr=(c.r-l)/1.5748;float cl=length(vec2(cb,cr));float mx=.5*(1.-a*.75),kn=mx*(1.-u_p3*.8);
  float cn=cl>kn?kn+(mx-kn)*tanh((cl-kn)/max(mx-kn,1e-4)):cl;vec2 cc=vec2(cb,cr)*(cn/max(cl,1e-5));
  r.r=l+1.5748*cc.y;r.b=l+1.8556*cc.x;r.g=(l-.2126*r.r-.0722*r.b)/.7152;
  float n=min(r.r,min(r.g,r.b)),x=max(r.r,max(r.g,r.b));if(n<0.)r=l+(r-l)*l/max(l-n,1e-5);if(x>1.)r=l+(r-l)*(1.-l)/max(x-l,1e-5);}
 return vec4(clamp(r,0.,1.),1.);}return c;`,
  'Resolve Color Density / subtractive saturation (more saturation, saturated colours darken like dye density), Color Compressor (hues within Range of the target are pulled toward it, saturation evened), Gamut Limiter (BT.709 Y′CbCr chroma soft-limited with a knee, then out-of-gamut RGB desaturated toward luma); approx.');

f('fu_pseudocolor','Pseudo Color (Fusion)',[P('Wavelength',.1,2,1,.01),P('Phase',0,1,0,.01),P('Channel spread',0,1,.33,.01),P('Amplitude',0,.5,.5,.01)],
  `float l=luma(O(uv).rgb);vec3 k=vec3(0.,1.,2.)*u_p2;return vec4(clamp(.5+u_p3*sin(6.2831853*(l/u_p0+u_p1+k)),0.,1.),1.);`,
  'Fusion Pseudo Color: each output channel is a sine wave of the luminance (wavelength, phase, amplitude around a 0.5 mean), channels phase-shifted by Channel spread');

f = add('Distort');
f('rs_blankingfill','Blanking Fill',[S('Bars',['Pillarbox (left / right)','Letterbox (top / bottom)'],0),P('Bar size',0,.4,.14,.005),P('Blur',4,80,30,1,'px'),P('Brightness',0,1.2,.8,.01)],
  [`float z=1.-2.*u_p1;return vec4(O(.5+(uv-.5)*z).rgb,1.);`,BH('u_p2'),BV('u_p2'),
  `bool ins=u_p0<.5?abs(uv.x-.5)<.5-u_p1:abs(uv.y-.5)<.5-u_p1;return vec4(ins?O(uv).rgb:T(uv).rgb*u_p3,1.);`],
  'Resolve Blanking Fill: the blanking bars (given size) are filled with a blurred, dimmed, zoomed copy of the active picture so the frame has no black bars');

f('fu_drip','Drip (Fusion)',[S('Shape',['Circular','Square','Random','Horizontal','Vertical','Exponential','Star','Radial'],0),P('Amplitude',0,40,8,.5,'px'),P('Wavelength',5,200,40,1,'px'),P('Phase',0,360,0,1,'°')],
  `
#define CIM_PH(v_) (m==0?length(v_)/wl*6.2831853:m==1?max(abs((v_).x),abs((v_).y))/wl*6.2831853:m==2?(length(v_)+wl*1.5*(fbm((v_)/(wl*2.))-.5))/wl*6.2831853:m==3?abs((v_).y)/wl*6.2831853:m==4?abs((v_).x)/wl*6.2831853:m==5?pow(length(v_)/wl,1.5)*6.2831853:m==6?length(v_)*(1.+.22*cos(5.*atan((v_).y,(v_).x)))/wl*6.2831853:8.*atan((v_).y,(v_).x))
int m=int(u_p0+.5);float wl=u_p2;vec2 P0=PX(vec2(.5));vec2 p=PX(uv)-P0;float ph=CIM_PH(p);vec2 dr;
 if(m==7)dr=vec2(-p.y,p.x)/max(length(p),1e-3);else{vec2 e=vec2(.5,0.);vec2 g=vec2(CIM_PH(p+e.xy)-CIM_PH(p-e.xy),CIM_PH(p+e.yx)-CIM_PH(p-e.yx));dr=g/max(length(g),1e-5);}
 float H=u_res.y/u_k;float damp=1./(1.+length(p)/(.6*H));vec2 s=p+dr*u_p1*sin(ph-radians(u_p3))*damp;return vec4(O(clamp(fromPX(s+P0),0.,1.)).rgb,1.);`,
  'Fusion Drip: ripple displacement along the gradient of a shape field (circular, square, random-warped, horizontal, vertical, exponential spacing, star, radial/angular), damped with distance', 1);

f = add('Repair');
f('rs_patchreplacer','Patch Replacer',[S('Fill',['Clone','Adaptive blend'],1),P('Radius',10,200,45,1,'px'),P('Source offset X',-.5,.5,-.22,.005),P('Source offset Y',-.5,.5,0,.005)],
  `{int m=int(u_p0+.5);vec2 a=vec2(asp(),1.);vec2 q=(uv-.5)*a;float r=R(u_p1)*u_px.y;float d=length(q);vec3 c=O(uv).rgb;
 float w=1.-smoothstep(r*.75,r,d);if(w<=0.)return vec4(c,1.);vec2 off=vec2(u_p2,u_p3);vec3 s=O(uv+off).rgb;
 if(m==1){vec3 acc=vec3(0.);float ws=0.;for(int i=0;i<40;i++){float an=float(i)*6.2831853/40.;vec2 bq=vec2(cos(an),sin(an))*r;vec2 bu=bq/a+.5;vec2 tg=vec2(-sin(an),cos(an))/a*r*.06;
  vec3 dl=(O(bu).rgb+O(bu+tg).rgb+O(bu-tg).rgb-O(bu+off).rgb-O(bu+off+tg).rgb-O(bu+off-tg).rgb)/3.;float dd=length(q-bq);float wi=1./(dd*dd+r*r*.002);acc+=dl*wi;ws+=wi;}
  s+=acc/ws;}
 return vec4(mix(c,clamp(s,0.,1.),w),1.);}return c;`,
  'Resolve Patch Replacer: a circular patch at the image centre is replaced by the region at the source offset; Clone copies it, Adaptive blend adds the boundary colour difference interpolated inside the patch (Shepard / membrane approx. of Poisson blending); feathered edge');

f = add('Film');
f('rs_filmlook','Film Look Creator',[S('Look',['Print film (warm, contrasty)','Negative (soft pastel)','Bleach bypass','Faded vintage'],0),P('Strength',0,1,.8,.01),P('Halation & bloom',0,1.5,.6,.01),P('Grain',0,1,.35,.01)],
  [`{vec3 c=O(uv).rgb;return vec4(c*smoothstep(.55,1.,luma(c)),1.);}return c;`,BH('20.'),BV('20.'),
  `{vec3 c0=O(uv).rgb;vec3 g=T(uv).rgb;int m=int(u_p0+.5);vec3 c=c0+u_p2*(g*vec3(1.,.38,.14)*.7+g*.22);float l=luma(c);vec3 r=c;vec3 sc=c*c*(3.-2.*c);
 if(m==0){r=mix(c,sc,.7);r+=vec3(-.02,.0,.03)*(1.-l)*(1.-l)+vec3(.04,.01,-.04)*l*l;r=sat(r,.92);}
 else if(m==1){r=.04+c*.93;r=mix(r,sc,.15);r=sat(r,.82);r+=vec3(.015,.01,-.015);}
 else if(m==2){vec3 s=mix(c,sc,.85);r=mix(s,vec3(luma(s)),.55);r=r*1.05-.02;}
 else{r=sat(c,.72);r=.07+r*.85;r*=vec3(1.05,1.,.86);r+=vec3(0.,.02,.04)*(1.-l);}
 vec2 vq=(uv-.5)*vec2(asp(),1.);r*=1.-u_p1*.35*smoothstep(.3,.95,length(vq));r=mix(c,r,u_p1);
 float gn=hash(floor(PX(uv)/1.2))+hash(floor(PX(uv)/1.2)+31.7)-1.;float lr=luma(r);r+=gn*u_p3*.11*(.35+lr*(1.-lr)*2.6);
 return vec4(clamp(r,0.,1.),1.);}return c;`],
  'Resolve Film Look Creator (approx.): halation (red-orange glow of highlights) + bloom, a print-style tone curve and colour look, vignette and luminance-weighted film grain', 1);

f = add('Edges');
f('ci_gaborgrad','Gabor Gradients',[S('Show',['Gradient (R = x, G = y)','Magnitude','Direction (hue)'],0),P('Scale',1,6,1.5,.1,'px'),P('Gain',1,20,6,.1)],
  `float gx=0.,gy=0.,nk=0.;float st=R(u_p1);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j));float v=luma(O(uv+o*st*u_px).rgb);float w=exp(-dot(o,o)/4.5);
  gx+=v*w*sin(1.1*o.x);gy+=v*w*sin(1.1*o.y);nk+=w*sin(1.1*o.x)*o.x;}
 vec2 g=vec2(gx,gy)/nk*u_p2;int m=int(u_p0+.5);
 if(m==0)return vec4(clamp(.5+g*.5,0.,1.),.5,1.);float mg=length(g);if(m==1)return vec4(vec3(clamp(mg,0.,1.)),1.);
 return vec4(hsv2rgb(vec3(atan(g.y,g.x)/6.2831853+.5,1.,clamp(mg,0.,1.))),1.);`,
  'CIGaborGradients: 5×5 odd (sine-carrier) Gabor kernels give x / y gradients (R/G, stored signed as 0.5 + g/2), shown as signed pair, magnitude or direction hue');
