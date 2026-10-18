/* ================= q10: cartography / GIS relief styling (brightness = elevation, north = up) ================= */
f = add('Terrain');
f('q10_swiss_hillshade','Swiss Hillshading (Imhof)',[P('Sun azimuth',0,360,315,1,'deg'),P('Z factor',1,60,12,.5),P('Aerial perspective',0,1,.7,.01),S('Style',['Imhof colour','Gray'])],
  `vec2 g=sobelD(uv,max(u_k,1.))*.125*u_p1;float h=L(uv);vec3 n=normalize(vec3(-g,1.));float az=radians(u_p0);vec3 l=normalize(vec3(sin(az),cos(az),1.));
  float sh=dot(n,l)-.7071;float con=mix(1.,.3+.9*h,u_p2);float k=clamp(.62+sh*1.5*con+u_p2*.12*(.5-h),0.,1.);
  if(u_p3>.5)return vec4(vec3(k),1.);
  vec3 hy=h<.5?mix(vec3(.60,.68,.56),vec3(.80,.79,.64),h*2.):mix(vec3(.80,.79,.64),vec3(.97,.96,.92),h*2.-1.);
  hy=mix(hy,vec3(.86,.88,.86),u_p2*.35*(1.-h));
  vec3 shd=hy*vec3(.50,.50,.66);vec3 lit=mix(hy,vec3(1.,.97,.84),.55);
  vec3 col=k<.62?mix(shd*.55,hy,k/.62):mix(hy,lit,(k-.62)/.38);return vec4(col,1.);`,
  'Swiss-style shaded relief after Imhof (1965) / Jenny (2001): NW oblique light, aerial perspective (contrast falls and tone lightens toward low elevations), hypsometric base tint, warm yellow lights and blue-violet shadows (approx.; no manual generalisation)');
f('q10_mdow','Multi-directional Oblique Weighted (MDOW)',[P('Sun altitude',5,85,45,1,'deg'),P('Z factor',1,60,15,.5),S('Output',['Gray','Over image'])],
  `vec2 g=sobelD(uv,max(u_k,1.))*.125*u_p1;vec3 n=normalize(vec3(-g,1.));float al=radians(u_p0);float th=atan(-g.y,-g.x);float hs=0.;
  for(int k=0;k<4;k++){float a=radians(225.+45.*float(k));vec3 l=vec3(sin(a)*cos(al),cos(a)*cos(al),sin(al));float w=sin(th-a);hs+=w*w*max(dot(n,l),0.);}
  hs=clamp(hs*.5,0.,1.);return vec4(u_p2>.5?c.rgb*(.25+.95*hs):vec3(hs),1.);`,
  'Mark (1992, USGS OF 92-422) as in GDAL -multidirectional: hillshades from 225/270/315/360 deg weighted sin^2(aspect - azimuth) and averaged (weights sum to 2); Mark used 30 deg altitude');
f('q10_openness','Topographic Openness (Yokoyama)',[S('Type',['Positive','Negative']),P('Radius',4,120,40,1,'px'),P('Height scale',1,300,15,1),P('Stretch span',5,60,25,1,'deg')],
  `float h=L(uv)*u_p2;float acc=0.;for(int k=0;k<8;k++){vec2 d=vec2(cos(float(k)*.7854),sin(float(k)*.7854));float up=-1.5708,dn=1.5708;
  for(int s=1;s<=20;s++){float r=float(s)/20.*R(u_p1);float a=atan((L(uv+d*r*u_px)*u_p2-h)/(r/u_k));up=max(up,a);dn=min(dn,a);}
  acc+=u_p0<.5?1.5708-up:1.5708+dn;}float ph=degrees(acc/8.);return vec4(vec3(clamp((ph-(95.-u_p3))/u_p3,0.,1.)),1.);`,
  'Yokoyama, Shirasawa & Pike 2002: mean over 8 azimuths of the zenith angle to the horizon within radius L (positive = 90 - max elevation angle, negative = 90 + min elevation angle, i.e. openness of the inverted surface); shown as a linear stretch (95 - span .. 95 deg) like RVT');
f('q10_waterlining','Waterlining',[P('Sea level',0,1,.35,.01),P('Line spacing',2,16,5,.5,'px'),P('Lines',1,8,5,1),S('Style',['Map (flat water)','Over image'])],
  `float sl=u_p0;if(luma(c.rgb)>=sl)return vec4(c.rgb,1.);float sp=u_p1;int nl=int(u_p2+.5);float reach=0.;for(int k=0;k<8;k++){if(k>=nl)break;reach+=sp*(1.+.3*float(k));}reach+=2.;
  float hit=-1.;for(int i=1;i<=40;i++){float r=2.*float(i);if(r>reach+2.)break;for(int a=0;a<24;a++){float an=float(a)*.2618;vec2 q=uv+vec2(cos(an),sin(an))*R(r)*u_px;if(luma(O(q).rgb)>=sl){hit=r;break;}}if(hit>0.)break;}
  vec3 wat=u_p3>.5?mix(c.rgb,vec3(.72,.85,.95),.6):vec3(.80,.89,.96);if(hit<0.)return vec4(wat,1.);
  float dist=hit;for(int j=0;j<8;j++){float r=hit-2.+.25*float(j);if(r<=0.)continue;bool f_=false;for(int a=0;a<24;a++){float an=float(a)*.2618;vec2 q=uv+vec2(cos(an),sin(an))*R(r)*u_px;if(luma(O(q).rgb)>=sl){f_=true;break;}}if(f_){dist=r;break;}}
  float ink=1.-smoothstep(.5,1.3,dist);float dk=0.;for(int k=0;k<8;k++){if(k>=nl)break;dk+=sp*(1.+.3*float(k));float fade=1.-.75*float(k)/max(float(nl-1),1.);ink=max(ink,(1.-smoothstep(.35,1.,abs(dist-dk)))*fade);}
  return vec4(mix(wat,vec3(.22,.45,.68),ink*.85),1.);`,
  'cartographic waterlining: concentric lines parallel to the shore inside water (luma < sea level), spacing growing outward and fading; shore distance from a 24-ray search (approx. Euclidean distance)');
f('q10_plan_oblique','Plan Oblique Relief',[P('Inclination',20,90,45,1,'deg'),P('Height scale',4,200,40,1,'px'),S('Output',['Image x hillshade','Image','Hillshade']),P('Shade Z factor',1,60,12,.5)],
  `float kk=cos(radians(u_p0))/sin(radians(u_p0));float H=R(u_p1)*kk*u_px.y;vec2 hitq=uv;bool wall=false;if(H>1e-5){float y0=uv.y-H;float prv=y0;bool fnd=false;
  for(int i=0;i<160;i++){float ys=mix(y0,uv.y,float(i)/159.);if(ys>=0.&&ys+L(vec2(uv.x,ys))*H>=uv.y){float lo=prv,hi=ys;for(int b=0;b<5;b++){float md=.5*(lo+hi);if(md>=0.&&md+L(vec2(uv.x,md))*H>=uv.y)hi=md;else lo=md;}hitq=vec2(uv.x,max(hi,0.));wall=prv<0.;fnd=true;break;}prv=ys;}
  if(!fnd)hitq=uv;}
  if(wall){float wv=clamp(uv.y/max(H,1e-5),0.,1.);return vec4(O(vec2(uv.x,0.)).rgb*(.25+.3*wv),1.);}
  vec2 g=sobelD(hitq,max(u_k,1.))*.125*u_p3;vec3 n=normalize(vec3(-g,1.));float hs=clamp(dot(n,normalize(vec3(-.7071,.7071,1.)))/.7071,0.,1.3);vec3 im=O(hitq).rgb;int m=int(u_p2+.5);
  return vec4(m==1?im:m==2?vec3(clamp(hs*.8,0.,1.)):clamp(im*(.3+.75*hs),0.,1.),1.);`,
  'Jenny & Patterson 2007 plan oblique relief: each point shifted north by elevation x cot(inclination), hidden parts removed by marching the column from the south (y-buffer equivalent); the south map edge shows as a dark wall; 90 deg = plain plan view');
f('q10_texture_shading','Texture Shading (Leland Brown)',[P('Detail (alpha)',0,2,.8,.05),P('Largest scale',8,128,40,1,'px'),P('Contrast',.2,3,1,.05),S('Output',['Gray','Over image'])],
  [`float s3=R(u_p1),s2=s3*.25,s1=s3*.0625;vec3 acc=vec3(0.),ws=vec3(0.);for(int j=-12;j<=12;j++){float fj=float(j)*.25;vec3 w=exp(-.5*vec3(fj*fj));
   acc+=w*vec3(luma(O(uv+vec2(fj*s1*u_px.x,0.)).rgb),luma(O(uv+vec2(fj*s2*u_px.x,0.)).rgb),luma(O(uv+vec2(fj*s3*u_px.x,0.)).rgb));ws+=w;}return vec4(acc/ws,luma(c.rgb));`,
   `float s3=R(u_p1),s2=s3*.25,s1=s3*.0625;vec3 acc=vec3(0.),ws=vec3(0.);for(int j=-12;j<=12;j++){float fj=float(j)*.25;vec3 w=exp(-.5*vec3(fj*fj));
   acc+=w*vec3(T(uv+vec2(0.,fj*s1*u_px.y)).r,T(uv+vec2(0.,fj*s2*u_px.y)).g,T(uv+vec2(0.,fj*s3*u_px.y)).b);ws+=w;}return vec4(acc/ws,T(uv).a);`,
   `\n#define Q10TS(q) dot(vec3(luma(O(q).rgb)-T(q).r,T(q).r-T(q).g,T(q).g-T(q).b),vec3(1.,pow(4.,-u_p0),pow(16.,-u_p0)))
\nfloat v=Q10TS(uv);float ss=0.;for(int i=0;i<12;i++)for(int j=0;j<12;j++){float tv=Q10TS((vec2(float(i),float(j))+.5)/12.);ss+=tv*tv;}float rms=sqrt(ss/144.)+1e-4;
   float o=clamp(.5+v/rms*.18*u_p2,0.,1.);return vec4(u_p3>.5?clamp(O(uv).rgb*(.35+1.3*o),0.,1.):vec3(o),1.);`],
  'Brown 2010/2014 texture shading = fractional Laplacian |k|^alpha of the DEM; approx.: three Gaussian band-pass layers (ratio 4) weighted 4^(-alpha k) instead of the FFT filter, normalised by RMS (Brown stretches by percentiles)');
f('q10_cliff_shading','Cliff Shading',[P('Cliff slope',10,80,25,1,'deg'),P('Sun azimuth',0,360,315,1,'deg'),P('Z factor',1,60,15,.5),S('Style',['Hachures','Tonal'])],
  `vec2 g=sobelD(uv,2.*max(u_k,1.))*.0625*u_p2;float sd=degrees(atan(length(g)));vec3 n=normalize(vec3(-g,1.));float az=radians(u_p1);vec3 l=normalize(vec3(sin(az),cos(az),1.));float hs=dot(n,l);
  float m=smoothstep(u_p0-4.,u_p0+4.,sd);float base=clamp(.9+.35*(hs-.7071),0.,1.);float tc=clamp(.55+1.6*(hs-.45),0.,1.);
  float v=tc;if(u_p3<.5){vec2 fl=length(g)>1e-5?normalize(g):vec2(1.,0.);float sc=dot(PX(uv),vec2(-fl.y,fl.x));float st=.5+.5*sin(6.2832*sc/4.);float cov=1.-tc;v=1.-smoothstep(cov-.18,cov+.18,1.-st)*.92;v=mix(v,1.,.06);}
  return vec4(vec3(mix(base,v,m)),1.);`,
  'Swiss-style cliff / rock depiction (approx.): areas steeper than the cliff slope drawn as oblique-lit hachures along the fall line (density = shadow tone) or high-contrast tone, gentle terrain as a light low-contrast hillshade');

/* ================= q10: demoscene effects as single-image renderings driven by the image ================= */
f = add('Retro');
f('q10_rotozoomer','Rotozoomer',[P('Angle',-180,180,25,1,'deg'),P('Zoom',.1,4,.45,.01),P('Shift',0,1,0,.01),S('Wrap',['Repeat','Mirror repeat'])],
  `float a=radians(u_p0);vec2 p=(uv-.5)*vec2(asp(),1.);p=mat2(cos(a),sin(a),-sin(a),cos(a))*p/u_p1;vec2 q=p/vec2(asp(),1.)+.5+u_p2;
  q=u_p3>.5?1.-abs(mod(q,2.)-1.):fract(q);return vec4(O(q).rgb,1.);`,
  'classic rotozoomer: the image used as an infinitely tiled texture, rotated and scaled about the screen centre (one frame)');
f('q10_raster_bars','Raster Bars (copper bars)',[P('Bars',1,12,7,1),P('Bar height',4,60,22,1,'px'),P('Phase',0,360,40,1,'deg'),S('Mode',['Over image','Behind dark areas','Bars only'])],
  `float yl=floor(PX(uv).y);float yp=fromPX(vec2(0.,yl+.5)).y;int nb=int(u_p0+.5);float best=-9.;vec3 col=vec3(0.);float ph=radians(u_p2);
  for(int i=0;i<12;i++){if(i>=nb)break;float a=ph+float(i)*.55;float cy=.5+.36*sin(a);float z=cos(a);float hb=R(u_p1)*.5*u_px.y;float d=abs(yp-cy)/hb;if(d<1.&&z>best){best=z;
   vec3 bc=vec3(0.);for(int k=0;k<8;k++)bc+=O(vec2((float(k)+.5)/8.,cy)).rgb;bc/=8.;vec3 hv=rgb2hsv(bc);hv.y=max(hv.y,.55);hv.z=1.;bc=hsv2rgb(hv);
   float sh=1.-d;col=bc*(.15+.95*sh)+vec3(pow(sh,6.))*.6;}}
  int m=int(u_p3+.5);if(best<-8.)return vec4(m==2?vec3(0.):c.rgb,1.);if(m==1&&luma(c.rgb)>.3)return vec4(c.rgb,1.);return vec4(clamp(col,0.,1.),1.);`,
  'Amiga copper raster bars: horizontal bars on sine paths (nearer bars in front), one colour per scanline with a bright core; each bar takes its hue from the image row it crosses');
f('q10_kefrens_bars','Kefrens Bars',[P('Bar width',4,80,24,1,'px'),P('Amplitude',0,.5,.4,.01),P('Frequency',.005,.2,.07,.001),S('Background',['Black','Dim image'])],
  `float rh=R(2.);float H=u_res.y/rh;float j0=floor((1.-uv.y)*H);float xp=uv.x;float hw=R(u_p0)*.5*u_px.x;vec3 col=vec3(0.);bool hit=false;
  for(int k=0;k<700;k++){float j=j0-float(k);if(j<0.)break;float xc=.5+u_p1*(.65*sin(j*u_p2)+.35*sin(j*u_p2*2.3+1.3));float d=(xp-xc)/hw;if(abs(d)<1.){
   vec3 bc=O(vec2(xc,1.-(j+.5)/H)).rgb;vec3 hv=rgb2hsv(bc);hv.y=max(hv.y,.4);hv.z=max(hv.z,.75);bc=hsv2rgb(hv);float sh=floor(cos(d*1.5708)*7.+.5)/7.;col=bc*(.2+.85*sh)+vec3(step(.85,sh)*step(-.45,d)*step(d,-.15))*.5;hit=true;break;}}
  if(!hit)col=u_p3>.5?c.rgb*.3:vec3(0.);return vec4(clamp(col,0.,1.),1.);`,
  'Kefrens bars (Kefrens 1990): per scanline one shaded vertical bar is drawn into a line buffer that is never cleared, so each line shows every earlier bar - rendered by finding the latest scanline whose bar covers the pixel; bar colours sampled from the image');
f('q10_starfield','Starfield Overlay',[P('Density',.2,3,1,.05),P('Speed (streaks)',0,1,.15,.01),P('Brightness',0,2,1,.05),S('Mode',['Screen over image','Only in dark areas','Stars only'])],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float acc=0.;for(int l=0;l<8;l++){float z=.15+.85*fract(float(l)*.125+hash(vec2(u_seed,3.))*.13);float sc=26.*u_p0*z;vec2 q=p*sc;vec2 ci=floor(q);
   for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){vec2 cc=ci+vec2(float(i),float(j));vec2 rr=vec2(hash(cc+float(l)*17.31+u_seed),hash(cc.yx+float(l)*5.7+u_seed*1.3));if(rr.x>.55)continue;
    vec2 sp=(cc+.15+.7*rr)/sc;vec2 se=sp*(1.+u_p1*.05/(z*z));vec2 ab=se-sp;float t=clamp(dot(p-sp,ab)/max(dot(ab,ab),1e-9),0.,1.);float d=length(p-sp-ab*t)*u_res.y/u_k;
    float rad=.7+1.1*(1.-z);float b=(1.15-z*.75)*(.6+.8*rr.y)*(1.-smoothstep(rad*.4,rad*1.5,d));b/=1.+length(ab)*u_res.y/u_k*.04;acc=max(acc,b);}}
  float s=clamp(acc*u_p2,0.,1.);int m=int(u_p3+.5);vec3 st=vec3(s)*vec3(.95,.97,1.);if(m==2)return vec4(st,1.);if(m==1)st*=1.-smoothstep(.15,.4,luma(c.rgb));return vec4(1.-(1.-c.rgb)*(1.-st),1.);`,
  'demoscene 3D starfield: 8 depth layers of hashed stars in perspective, motion streaks along the radial flight direction (longer and brighter when near), screen-blended over the image', true);
f('q10_metaballs','Metaballs',[P('Grid',3,10,6,1),P('Ball size',.3,2,1,.01),P('Threshold',.1,.9,.35,.01),S('Background',['Dark','Image'])],
  `vec2 ar=vec2(asp(),1.);float n=floor(u_p0+.5);float nx=max(1.,floor(n*asp()+.5));vec2 cs=1./vec2(nx,n);vec2 p=uv*ar;float F=0.;vec2 G=vec2(0.);vec3 cw=vec3(0.);float ww=0.;
  for(int i=0;i<16;i++){if(float(i)>=nx)break;for(int j=0;j<10;j++){if(float(j)>=n)break;vec2 id=vec2(float(i),float(j));vec2 cc=(id+.5)*cs;vec3 bc=O(cc).rgb;
   vec2 jt=vec2(hash(id+u_seed),hash(id.yx+7.1+u_seed))-.5;vec2 ce=(cc+jt*cs*.7)*ar;float Rr=min(cs.x*ar.x,cs.y)*(.55+1.1*luma(bc))*u_p1;vec2 dv=p-ce;float u=dot(dv,dv)/(Rr*Rr);
   if(u<1.){float o=1.-u;float fv=o*o*o;F+=fv;G+=-6.*o*o*dv/(Rr*Rr);cw+=bc*fv;ww+=fv;}}}
  vec3 bg=u_p3>.5?c.rgb*.35:vec3(.02,.02,.05);float e=fwidth(F)+1e-4;float a=smoothstep(u_p2-e,u_p2+e,F);if(a<=0.)return vec4(bg,1.);
  vec3 nrm=normalize(vec3(-G*.03,1.));vec3 ld=normalize(vec3(-.5,.6,.8));float df=max(dot(nrm,ld),0.);float sp=pow(max(dot(reflect(-ld,nrm),vec3(0.,0.,1.)),0.),30.);
  vec3 bc=cw/max(ww,1e-6);vec3 hv=rgb2hsv(bc);hv.y=min(1.,hv.y*1.3+.1);hv.z=max(hv.z,.5);bc=hsv2rgb(hv);return vec4(mix(bg,clamp(bc*(.25+.85*df)+sp*.6,0.,1.),a),1.);`,
  'demoscene metaballs: one ball per grid cell (jittered), radius and colour from the image cell, Wyvill (1-d^2/R^2)^3 field summed and cut at the threshold, shaded from the field gradient', true);
f('q10_voxel_space','Voxel Space Terrain (Comanche)',[P('Heading',0,360,0,1,'deg'),P('Camera height',.05,1,.38,.01),P('Height scale',.02,1,.3,.01),P('Horizon',.3,.9,.62,.01)],
  `float hd=radians(u_p0);vec2 fw=vec2(sin(hd),cos(hd));vec2 rt=vec2(fw.y,-fw.x);vec2 cam=vec2(.5,.02);float sx=(uv.x-.5)*2.;float z=.004,dz=.0012;vec3 sky=mix(vec3(.85,.62,.45),vec3(.25,.42,.78),smoothstep(u_p3,1.,uv.y));
  for(int i=0;i<300;i++){vec2 mp=fract(cam+fw*z+rt*sx*z*asp()*.6);float hm=L(mp)*u_p2;float ys=u_p3+(hm-u_p1)/z*.35;if(ys>=uv.y){vec3 col=O(mp).rgb;
   float hn=L(fract(mp+rt*.004))*u_p2;col*=clamp(.85+(hm-hn)*60.,.55,1.25);float fg=smoothstep(1.2,4.,z);return vec4(clamp(mix(col,sky,fg),0.,1.),1.);}z+=dz;dz*=1.014;}
  return vec4(sky,1.);`,
  'Comanche (NovaLogic 1992) Voxel Space: image = colour map, brightness = height map (tiled); per screen column a front-to-back march of the view frustum projects each height to the screen and the first sample reaching the pixel row wins (the y-buffer rule), fog toward the far plane');
