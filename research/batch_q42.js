/* ================= q42: round 17 - Apple Motion filters, LazPaint (ufilters.pas / ugraph.pas), Pixelitor ================= */
const Q42_SEG = `
#define Q42SEG(P0,A0,B0) length((P0)-(A0)-((B0)-(A0))*clamp(dot((P0)-(A0),(B0)-(A0))/max(dot((B0)-(A0),(B0)-(A0)),1e-6),0.,1.))
`;
const Q42_CTC = `if(u_p0<.5)return T(uv);vec2 e=vec2(u_px.x,0.);vec3 a=T(uv-e).rgb,b=T(uv).rgb,d=T(uv+e).rgb;vec3 o=b;
 float dr=a.r-b.r,db=a.b-b.b,rt=abs(dr)/max(abs(db),1e-6);if(dr*db<-1e-7&&rt>.2&&rt<5.){o.r=(a.r+b.r)*.5;o.b=(a.b+b.b)*.5;}
 dr=b.r-d.r;db=b.b-d.b;rt=abs(dr)/max(abs(db),1e-6);if(dr*db<-1e-7&&rt>.2&&rt<5.){o.r=(b.r+d.r)*.5;o.b=(b.b+d.b)*.5;}return vec4(o,1.);`;

f = add('Distort');
f('q42_motion_warps','Black Hole / Disc Warp / Fun House (Apple Motion)',[S('Effect',['Black Hole','Disc Warp','Fun House']),P('Amount',0,3000,600,10),P('Radius or width',.02,1,.25,.01),P('Angle',-180,180,0,1,'deg')],
  `int m=int(u_p0+.5);vec2 C=u_res/u_k*.5;vec2 d=PX(uv)-C;float r=length(d),hd=length(C);vec2 q;
 if(m==0){float h=u_p1/3000.*hd;q=C+d/max(r,1e-4)*sqrt(r*r+h*h);}
 else if(m==1){float Rr=u_p2*hd;if(r<Rr)return vec4(O(vec2(.5)).rgb,1.);q=C+d/r*(r-Rr);}
 else{vec2 n=vec2(cos(radians(u_p3)),sin(radians(u_p3))),w=vec2(-n.y,n.x);float u=dot(d,n),v=dot(d,w),W=u_p2*hd,A=u_p1/3000.;
  if(abs(u)<W)u-=A*W/PI*sin(PI*u/W)*(1.+.25*sin(v/W*2.3));q=C+u*n+v*w;}
 vec2 s=fromPX(q);if(s.x<0.||s.y<0.||s.x>1.||s.y>1.)return vec4(0.,0.,0.,1.);return vec4(T(s).rgb,1.);`,
  'approx. from the Motion User Guide descriptions: Black Hole = image pulled into the centre (source radius sqrt(r^2+h^2), the centre disc of radius h vanishes and the sides bow in, Amount 3000 = whole layer gone); Disc Warp = solid disc of the centre pixel colour of radius R with the image pushed outward around it; Fun House = imperfect-mirror magnification across a band of the given width along the Angle line');

f = add('Stylize');
f('q42_motion_tiles','Target / Circles / Random Tile (Apple Motion)',[S('Effect',['Target','Circles','Circles inverted','Random Tile']),P('Size',4,200,32,1,'px'),P('Falloff or feather',0,1,.2,.01),P('Angle',-180,180,30,1,'deg')],
  `int m=int(u_p0+.5);vec2 p=PX(uv),C=u_res/u_k*.5;float S0=u_p1,fo=max(u_p2,.02);vec3 img=c.rgb;
 if(m==0){vec2 d=p-C;float r=length(d)/S0;r=mix(floor(r)+.5,r,u_p2)*S0;vec2 dir=vec2(cos(radians(u_p3)),sin(radians(u_p3)));return vec4(O(clamp(fromPX(C+dir*r),0.,1.)).rgb,1.);}
 if(m<=2){vec2 cs=vec2(S0,S0*.72);vec2 q=rot(p-C,radians(u_p3))/cs;vec2 ce=floor(q)+.5;float dd=length((q-ce)*2.);vec3 cc=O(clamp(fromPX(C+rot(ce*cs,-radians(u_p3))),0.,1.)).rgb;
  float mk=1.-smoothstep(1.-fo,1.,dd);if(m==2)mk=1.-mk;return vec4(mix(img,cc,mk),1.);}
 float cell=S0*1.3;vec2 q=p/cell,iq=floor(q);float z1=-1.,z2=-1.;vec3 c1=img,c2=img;float a1=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=iq+vec2(float(i),float(j));vec2 ce=(id+.5+(hash2(id)-.5)*.8)*cell;float dd=length(p-ce)/S0;if(dd>1.)continue;
  float z=hash(id+5.3);vec2 src=ce+(hash2(id+9.1)-.5)*S0*3.;vec3 col=O(clamp(fromPX(p-ce+src),0.,1.)).rgb;float al=1.-smoothstep(1.-fo,1.,dd);
  if(z>z1){z2=z1;c2=mix(c2,c1,a1);z1=z;c1=col;a1=al;}else if(z>z2){c2=mix(c2,col,al);z2=z;}}
 return vec4(mix(c2,c1,a1),1.);`,
  'approx. from the Motion User Guide: Target = concentric bands whose colours are read along the Angle line from the centre (Falloff 1 = smooth); Circles = elliptical facets on a grid rotated by Angle, each filled with the colour sampled at its centre, gaps show the image, inverted = tiles with elliptical cut-outs; Random Tile = stacked feathered circular panels at seeded positions, each showing a displaced piece of the image',1);

f('q42_motion_glow','Aura / Overdrive Glow (Apple Motion)',[S('Effect',['Aura','Overdrive']),P('Radius or size',2,100,18,1,'px'),P('Brightness or intensity',0,3,1,.01),P('Inner radius or rotation',0,360,4,1)],
  [`if(u_p0>.5)return T(uv);${BH('u_p1')}`,`if(u_p0>.5)return T(uv);${BV('u_p1')}`,
  `vec3 o=O(uv).rgb;if(u_p0<.5){vec3 g=T(uv).rgb;vec3 ib=vec3(0.);for(int i=0;i<32;i++){float fi=float(i);float rr=sqrt((fi+.5)/32.)*R(u_p3);ib+=O(uv+vec2(cos(fi*2.39996),sin(fi*2.39996))*rr*u_px).rgb;}ib/=32.;
  vec3 s=o+max(g*1.5-ib*.5,0.)*u_p2*.6;s=1.-abs(1.-s);s=mix(s,1.-abs(1.-(s+(o-ib)*2.)),.35);return vec4(clamp(s,0.,1.),1.);}
 vec3 acc=vec3(0.);float ro=radians(u_p3);for(int i=0;i<48;i++){float fi=float(i),t=sqrt((fi+.5)/48.);vec2 of=vec2(cos(fi*2.39996+ro),sin(fi*2.39996+ro))*t*R(u_p1);vec3 s=O(uv+of*u_px).rgb;
  acc+=s*s*mix(vec3(1.,.88,.5),vec3(.95,.3,.12),t);}acc/=48.;vec3 r=screen(o*.55,clamp(acc*u_p2*1.6,0.,1.));return vec4(clamp(r,0.,1.),1.);`],
  'approx. from the Motion User Guide: Aura = blurred halo (outer radius) minus a small inner blur, added and folded back (solarized) so outlines of the image show through the glow; Overdrive = 48 tinted duplicates on a rotated golden-angle spiral (inner glow warm, outer glow orange-red) emphasising highlights, screened over a darkened copy');

f = add('Retro');
f('q42_wavyscreen','Wavy Screen (Apple Motion)',[P('Amplitude',0,40,6,.5,'px'),P('Wavelength',4,200,24,1,'px'),P('Scale',2,40,6,.5,'px'),P('Contrast',0,4,1.6,.05)],
  `vec2 p=PX(uv);float l=clamp((luma(O(uv).rgb)-.5)*u_p3+.5,0.,1.);float z=u_p0*(abs(fract(p.x/u_p1)-.5)*4.-1.);float v=(p.y+z)/u_p2;float dd=abs(fract(v)-.5)*2.;
 float th=1.-l;float aa=1.2/u_p2+.02;float ink=1.-smoothstep(th-aa,th+aa,dd);return vec4(vec3(1.-ink),1.);`,
  'approx. from the Motion User Guide: high-contrast greyscale screened by zigzag lines (triangle wave of the given Amplitude and Wavelength, line pitch = Scale) whose thickness carries the tone');

f = add('Tone');
f('q42_exrtonemap','OpenEXR Tone Map (exposure / defog / knee)',[P('Exposure',-10,10,0,.05,'stops'),P('Defog',0,.1,0,.001),P('Knee low',-3,3,0,.05,'stops'),P('Knee high',3.6,7.5,5,.05,'stops')],
  `vec3 fog=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s=O((vec2(float(i),float(j))+.5)/12.).rgb;fog+=${LIN('s')};}fog/=144.;
 vec3 s=c.rgb;vec3 x=max(${LIN('s')}-u_p1*fog,0.)*exp2(u_p0+2.47393);float kl=exp2(u_p2),X=exp2(u_p3)-kl,Y=exp2(3.5)-kl;
 float f0=0.,f1=1.;for(int i=0;i<40;i++){if(log(X*f1+1.)/f1<=Y)break;f0=f1;f1*=2.;}for(int i=0;i<30;i++){float f2=(f0+f1)*.5;if(log(X*f2+1.)/f2<Y)f1=f2;else f0=f2;}float kf=(f0+f1)*.5;
 x=mix(x,kl+log(max(x-kl,0.)*kf+1.)/kf,step(kl,x));x=pow(x,vec3(1./2.2))*exp2(-3.5/2.2);return vec4(clamp(x,0.,1.),1.);`,
  'OpenEXR exrdisplay Gamma(): x = max(0, h - defog*fog) * 2^(exposure+2.47393) (fog = image mean), knee above 2^kneeLow: kl + ln((x-kl)f+1)/f with f bisected so 2^kneeHigh maps to 2^3.5, then x^(1/2.2) * 2^(-3.5/2.2) (middle grey 3.5 stops below white); the sRGB input is linearised and treated as scene-linear - the filter Apple Motion wraps');

f = add('Insta');
f('q42_motion_looks','California / Nevada Looks (Apple Motion)',[S('Look',['California (warm golden beach)','Nevada (sun-bleached desert)']),P('Mix',0,1,1,.01)],
  `vec3 o=c.rgb,r;if(u_p0<.5){r=o*vec3(1.07,1.,.86)+vec3(.02,.015,0.);r=sat(r,1.22);r=r+(r-r*r)*(r-.5)*.6;float h=smoothstep(.45,1.,luma(r));r=mix(r,r*vec3(1.05,.93,.7)+vec3(.04,.03,0.),h*.35);r=mix(r,r*vec3(.92,1.,1.06),(1.-smoothstep(0.,.35,luma(o)))*.4);}
 else{r=o*1.12+.05;r=sat(r,.55)*vec3(1.06,1.,.86);r=.1+r*.86;r=mix(r,vec3(1.,.97,.9),smoothstep(.7,1.,luma(r))*.35);}
 return vec4(mix(o,clamp(r,0.,1.),u_p1),1.);`,
  'approx. looks from the one-line Motion User Guide descriptions: California = warm golden white balance, extra saturation, gentle S-curve, golden highlights and slightly cool shadows; Nevada = brighter, desaturated, warm-tinted, faded (lifted blacks) with bleached highlights');

f = add('Sharpen');
f('q42_cleartype','ClearType / Inverse ClearType (LazPaint)',[S('Mode',['ClearType','Inverse ClearType']),P('Subpixel shift',0,2,1,.05,'x 1/3 px')],
  [`float sh=u_p1/3.*(u_p0<.5?-1.:1.);vec3 o3=vec3(0.,c.g,0.);for(int ch=0;ch<3;ch+=2){float s0=ch==0?sh:-sh;float xx=uv.x*u_res.x-.5+s0;float fi=floor(xx),t=xx-fi;
  float w0=((-.5*t+1.)*t-.5)*t,w1=(1.5*t-2.5)*t*t+1.,w2=((-1.5*t+2.)*t+.5)*t,w3=(.5*t-.5)*t*t;float y=uv.y;
  o3[ch]=w0*O(vec2((fi-.5)/u_res.x,y))[ch]+w1*O(vec2((fi+.5)/u_res.x,y))[ch]+w2*O(vec2((fi+1.5)/u_res.x,y))[ch]+w3*O(vec2((fi+2.5)/u_res.x,y))[ch];}return vec4(clamp(o3,0.,1.),1.);`,
  Q42_CTC,
  `if(u_p0<.5)return T(uv);vec2 e=vec2(u_px.x,0.);vec3 a=T(uv-e).rgb,b=T(uv).rgb,d=T(uv+e).rgb;float d1=length(O(uv-e).rgb-O(uv).rgb)*147.,d2=length(O(uv+e).rgb-O(uv).rgb)*147.;
 vec3 o=b;if(d1>20.&&d2>20.&&d1+d2>100.){o.r=b.r-((d.r-b.r)+(a.r-b.r))*.3;o.b=b.b-((d.b-b.b)+(a.b-b.b))*.3;}return vec4(clamp(o,0.,1.),1.);`,
  Q42_CTC],
  'LazPaint ugraph.pas ClearTypeFilter: the layer is spline-resampled to 3x width and R/G/B are read at x-1/3, x, x+1/3 px (Catmull-Rom here); ClearTypeInverseFilter reads R at x+1/3 and B at x-1/3, then ClearTypeRemoveContradiction (neighbours whose R and B steps disagree with ratio 0.2..5 are averaged), ClearTypeSharpenFilter (R/B pushed away from neighbours by 3/10 where the source differs on both sides) and RemoveContradiction again');

f = add('Blur');
f('q42_coronablur','Corona Blur (LazPaint / BGRABitmap)',[P('Radius X',1,60,10,.5,'px'),P('Radius Y',1,60,10,.5,'px')],
  `vec3 a=vec3(0.);for(int i=0;i<256;i++){float t=float(i)*.0245437;a+=T(uv+vec2(cos(t)*R(u_p0),sin(t)*R(u_p1))*u_px).rgb;}return vec4(a/256.,1.);`,
  'BGRABitmap FilterBlurCorona (rbCorona): the blur mask is a 1 px antialiased ellipse outline of radii X, Y (EllipseAntialias), not a filled disc - sampled at 256 points around the ellipse');

f = add('Materials');
f('q42_lptexture','LazPaint Textures (Plastik / Metal Floor / Snow Print / Round Stone)',[S('Texture',['Plastik','Metal Floor','Snow Print','Round Stone']),P('Scale',.25,4,1,.05),P('Relief',0,3,1,.05)],
  [`int m=int(u_p0+.5);vec2 p=PX(uv)/u_p1;float ex=m>=2?1.2:1.;float n=0.,A=0.;for(int i=0;i<6;i++){float cs=32./exp2(float(i));float a=pow(exp2(-float(i)),ex);n+=a*vnoise(p/cs+float(i)*17.3);A+=a;}
 float h=clamp(.5+(n/A-.5)*1.58,0.,1.);
 if(m==0){float v=h*255.;v=v<32.?v*2.:v<224.?(v-32.)*.5+64.:(v-224.)*2.+96.;h=v/160.;}
 else if(m==1){vec2 t=mod(p,vec2(100.,50.));float e=0.;vec4 E[4]=vec4[4](vec4(15.,25.,5.,16.67),vec4(35.,25.,5.,16.67),vec4(75.,15.,16.67,5.),vec4(75.,35.,16.67,5.));
  for(int k=0;k<4;k++){float q=length((t-E[k].xy)/E[k].zw);e=max(e,smoothstep(-1.5,1.5,(1.-q)*5.));}h=clamp(e*.94+h*.137,0.,1.);}
 else if(m==2){float v=h*255.;if(v>80.)v=(v-80.)/10.+80.;if(v<50.)v=50.-(50.-v)/10.;h=v/255.;}
 return vec4(h,h,h,1.);`,
  `if(u_p0>.5)return T(uv);vec4 a=vec4(0.);for(int i=0;i<64;i++)a+=T(uv+vec2(0.,(float(i)/63.-.5)/6.));return a/64.;`,
  `int m=int(u_p0+.5);float br=(m==0||m==3)?2.:1.;float hs[4];vec2 o4[4]=vec2[4](vec2(1.,0.),vec2(-1.,0.),vec2(0.,1.),vec2(0.,-1.));
 for(int k=0;k<4;k++){vec2 q=uv+o4[k]*u_px*u_k;float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=T(q+vec2(float(i),float(j))*u_px*u_k*br*.67).r;hs[k]=s/9.;}
 vec4 P1[4]=vec4[4](vec4(300.,10.,0.,.6),vec4(100.,80.,0.,.5),vec4(100.,100.,.3,.3),vec4(70.,100.,0.,.5));vec3 P2[4]=vec3[4](vec3(25.,10.,10.),vec3(10.,.6,10.),vec3(10.,.6,30.),vec3(10.,.6,30.));
 vec3 CO[4]=vec3[4](vec3(58.,206.,113.)/255.,vec3(116./255.),vec3(1.),vec3(170./255.));vec3 lc=m==3?vec3(1.,1.,192./255.):vec3(1.);vec3 cl=CO[m];
 float alt=P2[m].z*u_p2;vec3 N=normalize(vec3(-(hs[0]-hs[1])*alt,-(hs[2]-hs[3])*alt,1.));vec3 Lv=normalize(vec3(-100.,100.,P1[m].y));vec3 Hv=normalize(Lv+vec3(0.,0.,1.));
 float df=P1[m].x/150.,ld=dot(N,Lv);float dif=ld>0.?df*.9*ld:df*P1[m].z*ld;float nh=dot(Hv,N);float Iw=nh>0.?min(df*P2[m].y*pow(nh,P2[m].x),1.):0.;float Ic=clamp(P1[m].w+dif,0.,1.)*(1.-Iw);
 vec3 o=${LIN('cl')}*Ic+${LIN('lc')}*Iw;return vec4(${SRGB('o')},1.);`],
  'LazPaint ugraph.pas CreatePlastikTexture / CreateMetalFloorTexture / CreateSnowPrintTexture / CreateRoundStoneTexture: 6-octave cyclic Perlin map (32..1 px cells, exponent 1 or 1.2), the per-texture height remap (Plastik 3-segment curve + vertical motion blur of 1/6 image height + blur 2; Metal Floor = 100x50 tile of four ellipses + 14% noise; Snow Print = levels squeezed outside 50..80; Round Stone = blur 2) and BGRABitmap TPhongShading with each texture\'s light settings and colour; the value noise and normalisation are approx. (generates, ignores the image)',1);

f = add('Render');
f('q42_hypocycloid','Hypocycloid (LazPaint)',[P('Cusps',3,20,6,1),P('Pen width',1,20,3,.5,'px'),S('Background',['Over image','Black','White'])],
  `${Q42_SEG}vec2 W=u_res/u_k;vec2 p=PX(uv);p.y=W.y-p.y;vec2 C=W*.5;float nR=min(W.x,W.y)*.4;float k=floor(u_p0+.5);float r=nR/k;int M=int(k)*24;float dm=1e9;vec2 pr=C+vec2(nR,0.);
 for(int i=1;i<=480;i++){if(i>M)break;float t=float(i)/float(M)*6.2831853;vec2 q=C+(nR-r)*vec2(cos(t),sin(t))+r*vec2(cos((nR-r)/r*t),-sin((nR-r)/r*t));dm=min(dm,Q42SEG(p,pr,q));pr=q;}
 vec3 bg=u_p2<.5?c.rgb:u_p2<1.5?vec3(0.):vec3(1.);float a=1.-smoothstep(u_p1*.5-.6,u_p1*.5+.6,dm);return vec4(mix(bg,vec3(1.,0.,0.),a),1.);`,
  'LazPaint uhypocycloid.pas MakeHypocycloid: big circle R = 0.4 x min(width, height) centred, small circle r = R/cusps, point = (R-r)(cos t, sin t) + r(cos((R-r)t/r), -sin((R-r)t/r)), drawn as a closed red (CSS red) curve, pen width 3');

f = add('Distort');
f('q42_polarwaves','Angular Waves / Radial Waves (Pixelitor)',[S('Type',['Angular waves','Radial waves']),S('Wave',['Sine','Sawtooth','Triangle']),P('Amount',0,100,20,1),P('Wavelength or divisions',1,100,20,1)],
  `vec2 C=u_res/u_k*.5;vec2 d=PX(uv)-C;float r=length(d),an=atan(d.y,d.x);int w=int(u_p1+.5);float wi;
 if(u_p0<.5)wi=r/u_p3;else wi=an*floor(u_p3+.5);
 float wv=w==0?sin(wi):w==1?2.*fract(wi/6.2831853)-1.:2.*(2.*(fract(wi/6.2831853)<.5?fract(wi/6.2831853):1.-fract(wi/6.2831853)))-1.;
 if(u_p0<.5)an+=wv*u_p2/100.;else r+=wv*u_p2/100.*r;return vec4(T(fromPX(C+r*vec2(cos(an),sin(an)))).rgb,1.);`,
  'Pixelitor AngularWavesFilter / RadialWavesFilter (CenteredTransformFilter, centre, zoom 100%, circle metric): Angular = angle += wave(dist / wavelength) x amount/100 rad; Radial = r += wave(angle x divisions) x amount/100 x r; wave types sine, sin-like sawtooth 2 mod(x/2pi,1)-1, sin-like triangle');

f = add('Stylize');
f('q42_radialmosaic','Radial Mosaic (Pixelitor)',[P('Tile size',10,200,40,1,'px'),S('Arrangement',['Aligned','Offset']),P('Randomness',0,100,0,1),P('Edge width',0,10,1,.5,'px')],
  `vec2 C=u_res/u_k*.5;vec2 p=PX(uv);vec2 d=p-C;float s=u_p0,rn=u_p2/100.;float rr=length(d)/s,th=atan(d.y,d.x);float d1=1e9,d2=1e9;vec2 b1=C,b2=C;
 for(int kk=-2;kk<=1;kk++){float k=floor(rr)-1.+float(kk);if(k<-1.)continue;vec2 sd;
  if(k<-.5){sd=C+(hash2(vec2(-7.,3.))*2.-1.)*s*.4*rn;float e=length(p-sd);if(e<d1){d2=d1;b2=b1;d1=e;b1=sd;}else if(e<d2){d2=e;b2=sd;}continue;}
  float n=6.*(k+1.);float off=(u_p1>.5&&mod(k,2.)>.5)?3.1415927/n:0.;float ic=floor((th-off)*n/6.2831853+.5);
  for(int jj=-2;jj<=2;jj++){float ii=mod(ic+float(jj),n);float a=6.2831853*ii/n+off;sd=C+(k+1.)*s*vec2(cos(a),sin(a))+(hash2(vec2(k,ii))*2.-1.)*s*.4*rn;
   float e=length(p-sd);if(e<d1){d2=d1;b2=b1;d1=e;b1=sd;}else if(e<d2){d2=e;b2=sd;}}}
 vec3 col=O(clamp(fromPX(b1),0.,1.)).rgb;float eb=(d2*d2-d1*d1)/(2.*max(length(b2-b1),1e-4));float ed=u_p3>0.?1.-smoothstep(u_p3*.5-.5,u_p3*.5+.5,eb):0.;return vec4(mix(col,vec3(0.),ed),1.);`,
  'Pixelitor RadialMosaic: Voronoi of concentric seeds (centre + ring k at radius (k+1) x tile size with 6(k+1) points, odd rings rotated by pi/n when Offset, jitter up to 0.4 x spacing x randomness), each cell filled with the source colour at its seed, black cell edges of the given width (pinch/twist left at 0)',1);

f = add('Render');
f('q42_circleweave','Circle Weave (Pixelitor)',[S('Type',['Circle grid','Maurer rose','Modular times table','Mystic rose']),P('Number of points',3,200,18,1),P('Inner radius pct',0,100,100,1),P('Tuning',-100,100,0,1)],
  `${Q42_SEG}vec2 W=u_res/u_k;vec2 p=PX(uv);p.y=W.y-p.y;vec2 C=W*.5;float Ro=min(W.x,W.y)*.45,ir=u_p2/100.,tu=floor(u_p3+.5);int ty=int(u_p0+.5);float N=floor(u_p1+.5);float dm=1e9;float mu=1.+abs(tu);
 if(ty==0){for(int i=0;i<50;i++){float fi=float(i);if(fi>=N)break;float a=6.2831853*fi/N-1.5707963;vec2 v=C+Ro*vec2(cos(a),sin(a));vec2 ce=mix(v,C,ir*.5);float rd=Ro*ir*.5*(1.+tu/100.*sin(6.2831853*fi/N));dm=min(dm,abs(length(p-ce)-rd));}}
 else if(ty==1){vec2 pr=C;for(int t=1;t<=361;t++){vec2 q=C;if(t<=360){float kk=float(t)*mu*.017453293;float rr=(t-(t/2)*2==0?Ro:Ro*ir)*sin(N*kk);q=C+rr*vec2(cos(kk),sin(kk));}dm=min(dm,Q42SEG(p,pr,q));pr=q;}}
 else if(ty==2){for(int i=0;i<200;i++){float fi=float(i);if(fi>=N)break;float j=mod(mu*fi,N);float a=6.2831853*fi/N-1.5707963,b=6.2831853*j/N-1.5707963;vec2 A0=C+Ro*vec2(cos(a),sin(a));vec2 B0=C+Ro*(mod(fi,2.)<.5?1.:ir)*vec2(cos(b),sin(b));dm=min(dm,Q42SEG(p,A0,B0));}}
 else{float n2=min(N,18.);for(int i=0;i<18;i++){float fi=float(i);if(fi>=n2)break;float a=6.2831853*fi/n2-1.5707963;vec2 A0=C+Ro*vec2(cos(a),sin(a));for(int j=0;j<18;j++){float fj=float(j);if(fj>=n2)break;if(ir>=1.&&fj<=fi)continue;float b=6.2831853*fj/n2-1.5707963;dm=min(dm,Q42SEG(p,A0,C+Ro*ir*vec2(cos(b),sin(b))));}}}
 float a=1.-smoothstep(.4,1.6,dm);return vec4(vec3(a),1.);`,
  'Pixelitor CircleWeave (CurveFilter, white 2 px stroke on black, outer radius 0.45 x min side): Circle grid = circles centred between the N vertices and the centre (t = inner/2, radius x (1 + tuning sin)), Maurer rose r = R or inner R x sin(n k) at k = t (1+|tuning|) deg, Modular times table i -> (1+|tuning|) i mod N, Mystic rose = all chords (max 18 points; tuning curvature not drawn - straight chords)');

f('q42_flowerlife','Flower of Life (Pixelitor)',[P('Radius',5,200,50,1,'px'),P('Iterations',1,10,3,1),S('Grid',['Triangular','Square','Square 2']),P('Line width',1,10,2,.5,'px')],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);vec2 C=W*.5;float r=u_p0;int g=int(u_p2+.5);float it=floor(u_p1+.5)-1.;float dm=1e9;
 for(int j=-9;j<=9;j++)for(int i=-9;i<=9;i++){float a=float(i),b=float(j);vec2 ce;bool ok;
  if(g==0){ok=(abs(a)+abs(b)+abs(a+b))*.5<=it;ce=C+a*vec2(r,0.)+b*vec2(r*.5,r*.8660254);}
  else if(g==1){ok=abs(a)+abs(b)<=it;ce=C+vec2(a,b)*r*1.4142136;}
  else{ok=mod(a+b,2.)<.5&&max(abs(a),abs(b))<=it;ce=C+vec2(a,b)*r*1.4142136;}
  if(ok)dm=min(dm,abs(length(p-ce)-r));}
 float al=1.-smoothstep(u_p3*.5-.6,u_p3*.5+.6,dm);return vec4(vec3(al),1.);`,
  'Pixelitor FlowerOfLife: overlapping circles of the given radius grown from the centre for N iterations on a triangular lattice (6 neighbours at distance r), square (4 neighbours at r sqrt2) or square-2 (diagonal neighbours); white strokes on black');

f = add('Materials');
f('q42_brushedmetal','Brushed Metal (JH Labs / Pixelitor)',[P('Length',0,200,40,1,'px'),P('Angle',-180,180,0,1,'deg'),P('Amount',0,100,50,1,'pct'),P('Shine',0,100,10,1,'pct')],
  `vec2 W=u_res/u_k;vec2 q=rot(PX(uv)-W*.5,-radians(u_p1));float an=radians(u_p1);float Wr=W.x*abs(cos(an))+W.y*abs(sin(an));float row=floor(q.y),u0=floor(q.x);
 float base=128./255.+u_p3/100.*sin(3.1415927*clamp(q.x/Wr+.5,0.,1.));float L=floor(u_p0);float st=max(1.,ceil((2.*L+1.)/160.));float s=0.,n=0.;
 for(int i=0;i<160;i++){float x=-L+float(i)*st;if(x>L)break;s+=clamp(base+(2.*hash(vec2(u0+x,row))-1.)*u_p2/100.,0.,1.);n+=1.;}return vec4(vec3(s/n),1.);`,
  'JH Labs BrushedMetalFilter as used by Pixelitor: per-row uniform noise of +-amount around grey 128 plus shine x sin(pi x / width), clamped, then a horizontal box blur of radius Length along the rotated brush direction (more than 160 taps are strided)',1);
