/* ================= q43b: VanDerLee UnPlugged-X, OpenToonz FX, cables.gl, G'MIC, Natron (round 17) ================= */
const Q43_GCD = (a, b, o) => `float ${o};{float ga=${a},gb=${b};for(int it=0;it<64;it++){if(gb<.5)break;float tt=mod(ga,gb);ga=gb;gb=floor(tt+.5);}${o}=ga;}`;

/* ---------------- VanDerLee UnPlugged-X ---------------- */
f = add('Distort');
f('q43_acidwaterfall','Acid Waterfall (UnPlugged-X)',[P('Red pattern row',0,1,.3,.005),P('Green pattern row',0,1,.5,.005),P('Blue pattern row',0,1,.7,.005),P('Brightness (neg inverts)',-2,2,1,.01)],
  `bool inv=u_p3<0.;float br=abs(u_p3);vec3 rows=vec3(u_p0,u_p1,u_p2);vec3 o;
 for(int k=0;k<3;k++){float ry=k==0?rows.x:k==1?rows.y:rows.z;vec3 pc=O(vec2(uv.x,1.-ry)).rgb;if(inv)pc=1.-pc;float xi=k==0?pc.r:k==1?pc.g:pc.b;vec3 s=O(vec2(clamp(xi,.001,.999),uv.y)).rgb;if(inv)s=1.-s;float v=k==0?s.r:k==1?s.g:s.b;if(k==0)o.r=v;else if(k==1)o.g=v;else o.b=v;}
 return vec4(clamp(o*br,0.,1.),1.);`,
  'VanDerLee UnPlugged-X Acid Waterfall: the vertical lines (columns) are remixed per colour channel by the intensity of a chosen horizontal pattern line (column x takes the column whose position equals that channel\'s intensity on the pattern row), Brightness scales, negative brightness inverts the base image; approx. from the manual description');
f('q43_tandeform','Tangent Deform Tile Wall (UnPlugged-X)',[P('Tiles X',1,20,5,1),P('Tiles Y',1,20,4,1),P('Strength',0,1,.5,.01),P('Shift',0,100,0,1,'%')],
  `vec2 n=vec2(u_p0,u_p1);vec2 g=uv*n+vec2(u_p3/100.);vec2 s=fract(g)*2.-1.;float K=.05+u_p2*6.;vec2 q=.5+.5*vec2(atan(s.x*K),atan(s.y*K))/atan(K);return vec4(O(q).rgb,1.);`,
  'VanDerLee UnPlugged-X Tangent Deform: the image is divided into small rectangles each holding a deformed copy of the entire image, bent toward the rectangle edges (glass-cube wall / glass office facade); Strength enlarges the edges (arctangent remap), Shift moves the rectangles by a percentage; approx. (X/Y strength and X/Y angle merged)');

f = add('Tone');
f('q43_contrastsplit','Contrast-Split (UnPlugged-X)',[P('Light',0,1,.5,.01),P('Dark',0,1,.5,.01),P('Split point',.1,.9,.5,.01),S('Apply to',['Luma','RGB'])],
  `vec3 x=clamp(c.rgb,0.,1.);float sp=u_p2;
 #define Q43CS(V0) ((V0)>=sp?sp+(1.-sp)*pow(((V0)-sp)/(1.-sp),1.+u_p0*3.)/(pow(((V0)-sp)/(1.-sp),1.+u_p0*3.)+pow(1.-((V0)-sp)/(1.-sp),1.+u_p0*3.)):sp*pow((V0)/sp,1.+u_p1*3.)/(pow((V0)/sp,1.+u_p1*3.)+pow(1.-(V0)/sp,1.+u_p1*3.)))
 vec3 o;if(u_p3<.5){float l=luma(x);float lm=Q43CS(l);o=x+(lm-l);}else o=vec3(Q43CS(x.r),Q43CS(x.g),Q43CS(x.b));return vec4(clamp(o,0.,1.),1.);`,
  'VanDerLee UnPlugged-X Contrast-Split: independent contrast increase of the light and dark parts of the image; approx.: separate S-curves (t^a/(t^a+(1-t)^a)) on the ranges above and below the split point, endpoints fixed');

f = add('Stylize');
f('q43_inkrubber','Ink Rubber Smear (UnPlugged-X)',[P('X shift',-30,30,6,.5,'%'),P('Y shift',-30,30,-3,.5,'%'),P('Wetness',0,1,.7,.01)],
  `vec2 sh=vec2(u_p0,u_p1)/100.;vec3 o=c.rgb;for(int i=1;i<=24;i++){float k=float(i)/24.;vec3 s=O(uv-sh*k).rgb;o=mix(o,min(o,s),(1.-k)*u_p2*.5);}return vec4(o,1.);`,
  'VanDerLee UnPlugged-X Ink Rubber: a copy of the image is shifted (X/Y shift in % of the size) so it looks like a finger rubbed over the wet ink; approx.: the shifted copies are darken-blended along the rub path with fading opacity (Wetness)');
f('q43_uscomic','U.S. Comic Interlace Shading (UnPlugged-X)',[P('Even bias',0,1,.35,.01),P('Odd bias',0,1,.6,.01),P('Stripe size',1,8,2,1,'px'),P('Color amount',0,1,.6,.01)],
  `float row=floor(PX(uv).y/max(R(u_p2),1.));bool ev=mod(row,2.)<.5;float l=luma(c.rgb);float b=ev?u_p0:u_p1;vec3 pc=floor(clamp(c.rgb,0.,1.)*3.99)/3.;pc=pc/max(max(pc.r,max(pc.g,pc.b)),.34);
 return vec4(l>b?mix(vec3(1.),clamp(pc,0.,1.),u_p3):vec3(0.),1.);`,
  'VanDerLee UnPlugged-X U.S. Comic: American hero-comic shading by an interlace-like effect plus posterization; even and odd raster lines (Stripe size high) are bright where the intensity exceeds their own bias, else black; Color amount = posterized colour of the bright parts (0 = pure black and white); approx. (Darkness merged into the biases, max colour = white)');

f = add('Paint');
f('q43_renaissance','Renaissance Cracked Masterpiece (UnPlugged-X)',[P('Contrast',0,1,.6,.01),P('Cracks',0,1,.6,.01),P('Crack size',4,60,18,1,'px'),P('Varnish',0,1,.5,.01)],
  `vec3 x=clamp(c.rgb,0.,1.);float l=luma(x);vec3 s=mix(vec3(l),x,1.+u_p0*.6);float k=1.+u_p0*4.;vec3 t=s;t=pow(t,vec3(1.));vec3 sc=t*t*(3.-2.*t);s=mix(s,sc,u_p0);s=mix(s,s*s*(3.-2.*s),u_p0*.5);
 float e=length(sobel(uv));s*=1.-clamp(e*.8*u_p0,0.,.6);
 vec2 p=PX(uv)/max(R(u_p2),1.);vec2 ip=floor(p),fp=fract(p);float d1=8.,d2=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 h=vec2(hash(ip+o+u_seed),hash(ip+o+37.1+u_seed));vec2 r=o+h-fp;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
 float cr=1.-smoothstep(0.,.08,sqrt(d2)-sqrt(d1));float cr2=(1.-smoothstep(0.,.05,abs(fbm(p*1.7+u_seed)-.5)))*.6;float crk=clamp(max(cr,cr2*step(.45,hash(floor(p*.5)+3.))),0.,1.)*u_p1;
 s=mix(s,s*vec3(.25,.2,.15),crk*.85);s+=crk*.06*vec3(1.,.9,.7)*step(.5,hash(PX(uv)));
 vec3 vn=mix(vec3(1.),vec3(1.05,.92,.68),u_p3);s*=vn;vec2 cv=uv-.5;s*=1.-u_p3*.45*dot(cv,cv)*2.;return vec4(clamp(s,0.,1.),1.);`,
  'VanDerLee UnPlugged-X Renaissance (no controls in the original): turns an image into a renaissance masterpiece by dramatically increasing contrast and detecting edges - realistic cracks, full vivid shadows and colours; approx.: S-curve contrast + saturation, Sobel edge darkening, Voronoi/fbm craquelure, amber varnish and darkened corners (the four controls are additions)', true);

f = add('Render');
f('q43_radar','Radar Display (UnPlugged-X)',[P('Beam angle',0,360,60,1,'deg'),P('Beam width',5,360,90,1,'deg'),P('Signal brightness',0,3,1.2,.01),P('Line density',2,12,5,1)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float r=length(p)/.47;float th=atan(p.x,p.y);float ba=radians(u_p0);float ph=mod(ba-th,6.2832);float glow=exp(-ph/radians(u_p1)*3.);
 float sig=luma(O(uv).rgb);vec3 col=vec3(.25,1.,.35);float ring=1.-smoothstep(0.,.012*u_p3,abs(fract(r*u_p3+.5)-.5)/u_p3*u_p3);ring=max(ring,1.-smoothstep(0.,.0035,min(abs(p.x),abs(p.y))));
 ring=max(ring,1.-smoothstep(0.,.006,abs(r-1.)*.47));float beam=1.-smoothstep(0.,.02,ph);
 vec3 o=col*(sig*glow*u_p2*.9+ring*.35+beam*.6)+vec3(.0,.03,.01);o*=1.-smoothstep(1.,1.01,r);o+=vec3(.06)*step(1.,r)*(1.-smoothstep(1.,1.08,r))*.5;
 return vec4(clamp(o,0.,1.),1.);`,
  'VanDerLee UnPlugged-X Radar: life-like radar display (after Russian radar screens); the image is the signal, revealed by a rotating scan beam (Beam angle) with afterglow (Beam width), range rings (Line density) and cross lines in phosphor green; approx. (colour and line intensity fixed)');
f('q43_cdshader','CD Shader Refractive Disc (UnPlugged-X)',[P('Diameter',.2,1,.85,.01),P('Light spread',.05,1,.3,.01),P('Colour angle',0,180,30,1,'deg'),P('Black intensity',0,1,.6,.01)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float R0=u_p0*.5;float r=length(p)/R0;vec3 bg=O(uv).rgb;if(r>1.)return vec4(bg,1.);float th=atan(p.y,p.x);
 #define Q43AD(A0) abs(mod((A0)+1.5708,3.1416)-1.5708)
 float sp=u_p1*.8+.02;float ca=radians(u_p2);vec3 rf=vec3(exp(-pow(Q43AD(th-ca)/sp,2.)),exp(-pow(Q43AD(th-ca-.35)/sp,2.)),exp(-pow(Q43AD(th-ca-.7)/sp,2.)));
 float bk=exp(-pow(Q43AD(th-ca-1.5708)/(sp*1.5),2.))*u_p3;vec3 data=vec3(.72,.74,.78)*(1.-bk)+rf*.85*(.6+.4*r);data*=.92+.08*sin(r*400.);
 vec3 o=data;if(r<.125)o=bg;else if(r<.33)o=mix(bg,vec3(.85,.88,.9),.35+.15*sin(r*60.));else if(r<.39)o=vec3(.55,.57,.6)+rf*.3;else if(r>.975)o=vec3(.6,.62,.66);
 float edge=1.-smoothstep(.985,1.,r);o=mix(bg,o,edge);return vec4(clamp(o,0.,1.),1.);`,
  'VanDerLee UnPlugged-X CD Shader: draws a CD/DVD with centre hole, transparent clamping ring and data area with refractive shading - red/green/blue refraction lobes at increasing angles (Colour angle), Light spread = lobe width, black shade where the track direction faces the light; approx. (separate R/G/B/black angles and disc transparency merged)');
f('q43_blades','Blades Light Fan (UnPlugged-X)',[P('Amount',2,48,12,1),P('Rotation',0,360,0,1,'deg'),S('Direction',['Clockwise','Counter-clockwise']),P('Brightness',0,1,.25,.01)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float th=atan(p.y,p.x)-radians(u_p1);float t=fract(th/6.2832*u_p0);if(u_p2>.5)t=1.-t;return vec4(c.rgb*mix(u_p3,1.,t),1.);`,
  'VanDerLee UnPlugged-X Blades: a circular fan of light blades around the centre; each blade ramps from the dark side (Brightness) to the bright side (image colour), Amount = number of blades, Rotation, counter-clockwise option');

/* ---------------- OpenToonz FX ---------------- */
f = add('Distort');
f('q43_floorbump','Floor Bump Water Refraction (OpenToonz)',[P('Wave height',0,3,1,.01),P('Wave size',.05,2,.4,.01),P('Depth',0,2,.4,.01),P('Refractive index',1,3,1.333,.001)],
  `float hz=1.06;vec2 sc=vec2((uv.x-.5)*asp(),hz-uv.y);float Hc=1.;float z=Hc/sc.y;float xw=sc.x*z;vec2 w=vec2(xw,z)/u_p1+u_seed*3.;float dl=.02/u_p1;
 float h0=fbm(w),hx=fbm(w+vec2(dl,0.)),hz2=fbm(w+vec2(0.,dl));vec3 n=normalize(vec3(-(hx-h0)/dl*u_p0*.15,1.,-(hz2-h0)/dl*u_p0*.15));
 vec3 P=vec3(xw,0.,z);vec3 E=normalize(vec3(0.,Hc,0.)-P);vec3 rr=refract(-E,n,1./u_p3);if(rr.y>-1e-4)rr.y=-1e-4;float tl=u_p2/(-rr.y);vec3 B=P+rr*tl;
 vec2 s2=vec2(B.x*1./B.z,(Hc+u_p2)/B.z);vec2 q=vec2(s2.x/asp()+.5,hz-s2.y);return vec4(O(clamp(q,0.,1.)).rgb,1.);`,
  'OpenToonz Iwa_FloorBumpFx refraction mode: the texture is the floor without water; each screen ray hits the water plane in perspective, is refracted by the wave normal (Snell, refractive index) down to the bottom at Depth and projected back to the screen to fetch the floor colour; approx.: procedural fbm waves replace the Height reference image, camera fixed (horizon just above the frame)', true);

f = add('Render');
f('q43_pnpersp','PN Perspective Noise Plane (OpenToonz)',[S('Render mode',['Noise','Warp HV offset','Fresnel reflectivity']),P('Size',2,300,60,1,'px'),P('Eye level',-.5,.5,.3,.01),P('Octaves',1,5,3,1)],
  `float fy=540.;vec2 sp=(uv-.5)*vec2(asp(),1.)*1080.;float ey=u_p2*1080.;float fov=radians(15.);float D=fy/tan(fov);float A=sqrt(ey*ey+D*D);float thc=fov+asin(ey/A);float M=fy/sin(fov);vec3 cam=vec3(0.,-M*cos(thc),M*sin(thc));
 if(sp.y>=ey-.5)return vec4(vec3(.5),1.);int oc=int(u_p3+.5);float isum=0.,it=2.;for(int o=0;o<5;o++){if(o>=oc)break;isum+=it;it*=.5;}int m=int(u_p0+.5);
 #define Q43NP(S0) vec2(-(ey+fy)*(S0).x/((S0).y-ey),(fy+(S0).y)*A/(ey-(S0).y))
 #define Q43PN(N0,RES) {RES=.5;float cs=u_p1,ci=1.;for(int o=0;o<5;o++){if(o>=oc)break;vec2 cp=(N0)/cs+u_seed*31.+float(o)*17.3;RES+=ci*(vnoise(cp)*2.-1.)/isum;cs*=.5;ci*=.5;}}
 if(m==0){float acc=0.;for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec2 s2=sp+(vec2(float(i),float(j))-1.)/3.*1080.*u_px.y;float v;Q43PN(Q43NP(s2),v)acc+=v;}return vec4(vec3(clamp(acc/9.,0.,1.)),1.);}
 vec2 np=Q43NP(sp);float dl=.001*u_p1;float v0,v1,v2,v3;Q43PN(np-vec2(dl,0.),v0)Q43PN(np+vec2(dl,0.),v1)Q43PN(np-vec2(0.,dl),v2)Q43PN(np+vec2(0.,dl),v3)float wh=10.;
 vec3 vx=vec3(dl*2.,0.,(v1-v0)*2.*wh),vy=vec3(0.,dl*2.,(v3-v2)*2.*wh);vec3 nr=normalize(cross(vx,vy));vec3 cv=normalize(vec3(np.x-cam.x,np.y-cam.y,-cam.z));
 if(m==1){float al=dot(nr,cv);vec3 rc=2.*al*nr-cv;vec3 rm=vec3(cv.x,cv.y,-cv.z);float ah=atan(rc.x/rc.y)-atan(rm.x/rm.y),av=atan(rc.z/rc.y)-atan(rm.z/rm.y);return vec4(clamp(.5+ah/.5236,0.,1.),clamp(.5-av/.5236,0.,1.),0.,1.);}
 float ci=clamp(dot(nr,-cv),0.,1.);float si=sqrt(1.-ci*ci)/1.333;float ct=sqrt(max(1.-si*si,0.));float rs=(ci-1.333*ct)/(ci+1.333*ct),rp=(ct-1.333*ci)/(ct+1.333*ci);return vec4(vec3(clamp(.5*(rs*rs+rp*rp),0.,1.)),1.);`,
  'OpenToonz Iwa_PNPerspectiveFx: noise on a ground plane seen in perspective (fov 30, eye level), screen to plane mapping and camera position ported from the source; modes Noise (3x3 supersampled), Warp HV (reflected-vector angle offsets in R/G, +-30 deg) and Fresnel (reflectivity of the wave normal, n = 1.333, wave height 10); persistence 0.5 for size/intensity; approx.: value noise replaces Noise1234 Perlin, above the eye level = 0.5 grey', true);
f('q43_corridor','Corridor Gradient (OpenToonz)',[S('Shape and curve',['Quadrangle linear','Quadrangle ease in-out','Quadrangle ease in','Quadrangle ease out','Circle linear','Circle ease in-out']),P('Inner size',.02,.9,.15,.01),P('Centre X',-.5,.5,0,.01),P('Centre Y',-.5,.5,0,.01)],
  `vec2 p=uv*u_res;vec2 ctr=(vec2(.5)+vec2(u_p2,u_p3))*u_res;vec2 hs=u_res*.5*u_p1;vec2 ip[4],op[4];
 ip[0]=ctr+vec2(-hs.x,hs.y);ip[1]=ctr+hs;ip[2]=ctr-hs;ip[3]=ctr+vec2(hs.x,-hs.y);op[0]=vec2(0.,u_res.y);op[1]=u_res;op[2]=vec2(0.);op[3]=vec2(u_res.x,0.);
 int m=int(u_p0+.5);int cv=m==0||m==4?0:(m==1||m==5)?1:m==2?2:3;bool circ=m>=4;float tf=-1.;
 #define Q43W(V0,W0) ((V0).x*(W0).y-(V0).y*(W0).x)
 #define Q43INV(P0,B1,B2,B3) {vec2 qq=p-(P0);float Aq=Q43W(B2,B3),Bq=Q43W(B3,qq)-Q43W(B1,B2),Cq=Q43W(B1,qq);float tt=abs(Aq)<.001?-Cq/Bq:.5*(-Bq-sqrt(max(Bq*Bq-4.*Aq*Cq,0.)))/Aq;vec2 dd=(B1)+(B3)*tt;float uu=dot(qq-(B2)*tt,dd)/max(dot(dd,dd),1e-6);if(tt>=0.&&tt<=1.&&uu>=-1e-4&&uu<=1.0001&&tf<0.)tf=tt;}
 if(!circ){for(int e=0;e<4;e++){int c1=e==0?0:e==1?2:e==2?3:1;int c2=e==0?1:e==1?0:e==2?2:3;vec2 i1=ip[0],i2=ip[0],o1=op[0];for(int k=0;k<4;k++){if(k==c1){i1=ip[k];o1=op[k];}if(k==c2)i2=ip[k];}vec2 o2=op[0];for(int k=0;k<4;k++)if(k==c2)o2=op[k];
   Q43INV(i1,i2-i1,o1-i1,i1-i2-o1+o2)}
  if(tf<0.)tf=(abs(p.x-ctr.x)<=hs.x&&abs(p.y-ctr.y)<=hs.y)?0.:1.;}
 else{vec2 pin=vec2(0.),pout=vec2(0.);bool inside=true;
  for(int d=0;d<36;d++){float a1=6.2832*float(d)/36.,a2=6.2832*float(d+1)/36.;vec2 u1=.7071*vec2(cos(a1),sin(a1))+.5,u2=.7071*vec2(cos(a2),sin(a2))+.5;
   vec2 in1=mix(mix(ip[2],ip[3],u1.x),mix(ip[0],ip[1],u1.x),u1.y),in2=mix(mix(ip[2],ip[3],u2.x),mix(ip[0],ip[1],u2.x),u2.y);vec2 ou1=mix(mix(op[2],op[3],u1.x),mix(op[0],op[1],u1.x),u1.y),ou2=mix(mix(op[2],op[3],u2.x),mix(op[0],op[1],u2.x),u2.y);
   Q43INV(in2,in1-in2,ou2-in2,in2-in1-ou2+ou1)if(Q43W(in2-in1,p-in1)<0.)inside=false;}
  if(tf<0.)tf=inside?0.:1.;}
 float t=clamp(tf,0.,1.);float fa=cv==0?t:cv==1?(-2.*t+3.)*t*t:cv==2?t*t:1.-(1.-t)*(1.-t);return vec4(vec3(fa),1.);`,
  'OpenToonz Iwa_CorridorGradientFx: gradient between an inner and an outer quadrangle (4 trapezoid pieces) or circle (36 pieces), factor by inverse bilinear interpolation inside each piece, inner = 0, outside = 1, curves linear / ease in-out / ease in / ease out; port, with the outer shape fixed to the frame corners and the inner rectangle set by size and centre (black inner, white outer)');

f = add('Stylize');
f('q43_bodyhighlight','Body Highlight (OpenToonz)',[S('Mode',['Over','Add','Subtract','Multiply','Lighten','Darken'],1),P('Offset',-40,40,6,.5,'px'),P('Blur',0,20,3,.5,'px'),P('Matte threshold',0,1,.45,.01)],
  `
 #define Q43MT(Q0) smoothstep(u_p3-.06,u_p3+.06,L(Q0))
 vec2 off=vec2(R(u_p1));float b=floor(R(u_p2)+.5);float st=max(1.,b/8.);float s=0.,n=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>b-.5||abs(o.y)>b-.5){if(b>=1.)continue;if(i!=0||j!=0)continue;}s+=Q43MT(uv+(off+o)*u_px);n+=1.;}
 float bv=s/n;float tp=.5;float shm=(1.-bv)*tp;float k=1.-shm;vec3 x=c.rgb;vec3 col=vec3(1.);int m=int(u_p0+.5);vec3 op=m==0?col:m==1?min(x+col,1.):m==2?max(x-col,0.):m==3?x*col:m==4?max(x,col):min(x,col);
 return vec4(clamp(mix(x,x*k+(1.-k)*op,Q43MT(uv)),0.,1.),1.);`,
  'OpenToonz Body Highlight: the matte is box-blurred, shifted by the point offset and the uncovered rim of the body gets a white highlight (transparency 0.5) through the blend mode (over, add, subtract, multiply, lighten, darken), out = in*k + (1-k)*op(in,colour); port of the blending, approx.: a soft luma threshold of the image stands in for the alpha matte (opaque inputs), offset along the diagonal like the default point (10,10)');

/* ---------------- cables.gl ---------------- */
f = add('Noise');
f('q43_shardnoise','Shard Noise (cables.gl)',[P('Scale',1,40,10,.5),P('Sharpness',0,1,.22,.01),P('Harmonics',1,5,1,1),P('Amount',0,1,1,.01)],
  `
  #define Q43H3(P0) fract(sin(vec3(dot(P0,vec3(127.1,311.7,74.7)),dot(P0,vec3(269.5,183.3,246.1)),dot(P0,vec3(113.5,271.9,124.6))))*43758.5453123)
  vec2 tc=uv;tc.x*=asp();float shp=pow(u_p1*20.,2.);float f0=0.;int hm=int(u_p2+.5);
  for(int k=0;k<5;k++){if(k>=hm)break;float scl=u_p0*pow(2.,float(k));vec3 p=vec3((tc-.5)*scl,u_seed*7.);vec3 ip=floor(p),fp=fract(p);float v=0.,t=0.;
   for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 o=vec3(float(x),float(y),float(z));vec3 io=ip+o;vec3 h=Q43H3(io);vec3 r=fp-(o+h);float w=exp2(-6.2831853*dot(r,r));float s=shp*dot(r,Q43H3(io+vec3(11.,31.,47.))-.5);v+=w*s*inversesqrt(1.+s*s);t+=w;}
   float sn=(v/t)*.5+.5;if(hm==1)f0=sn;else f0+=k==0?sn*.8:sn*.5*pow(.5,float(k));}
  return vec4(mix(c.rgb,vec3(f0),u_p3),1.);`,
  'cables.gl Ops.Gl.ImageCompose.Noise.Shardnoise: shard noise (3x3x3 jittered cells, Gaussian-weighted soft-sign of a random gradient, sharpness^2*400), harmonics 1-5 at doubled scale (0.8 / 0.25 / 0.125 ... weights), normal blend with Amount; port (Z offset = seed, Round option omitted)', true);

f = add('Film');
f('q43_lensscratch','Lens Scratches (cables.gl)',[P('Scale',1,40,10,.5),P('Layers',1,20,4,1),P('Wavyness',0,1,.5,.01),P('Amount',0,1,.6,.01)],
  `vec2 uv0=uv-.5;uv0.y/=asp();float col=0.;vec2 pix=2.*u_px/2.;int nl=int(u_p1+.5);
 for(int a=0;a<4;a++){vec2 u=(uv0+vec2(floor(float(a)/2.),mod(float(a),2.))*pix)*u_p0;float fq=.5;float scs=0.;
  for(int i=0;i<20;i++){if(i>=nl)break;float fi=float(i);float an=fi*3145.;float sa=sin(an),ca=cos(an);vec2 q=u*mat2(ca,sa,-sa,ca);q=q*fq+vec2(fi);vec2 sd=floor(q);vec2 lu=fract(q);
   sd.x=floor(sin(sd.x*51024.)*3104.);sd.y=floor(sin(sd.y*1324.)*554.);lu=lu*2.-1.;float ra=sd.x+sd.y;float s2=sin(ra),c2=cos(ra);lu=lu*mat2(c2,s2,-s2,c2);lu+=sin(sd.x-sd.y);lu=clamp(lu*.5+.5,0.,1.);
   float w1=sin(sd.x+lu.y*3.1415)*u_p2,w2=sin(sd.y+lu.y*3.1415)*u_p2;float xs=sign(.01-abs(lu.x-.5+w2+w1));scs+=clamp(((1.-pow(lu.y,2.))*lu.y)*2.5*xs,0.,1.);fq+=.5;}
  col+=scs;}
 col/=4.;return vec4(clamp(c.rgb+vec3(col)*u_p3,0.,1.),1.);`,
  'cables.gl Ops.Gl.ImageCompose.LensScratches_v2 (shader by Daedelus / shadertoy 4syXRD): layers of randomly rotated, wavy scratch segments (frequency 0.5, step 0.5), 2x2 anti-aliasing; port, composited additively with Amount (the op default is a normal blend)');

/* ---------------- G'MIC ---------------- */
f = add('Tone');
f('q43_pseudogray','Pseudo-Grey Colormap (G\'MIC pseudogray)',[P('Max increment',0,5,5,1),P('JND threshold',0,10,2.3,.1),S('Output',['Map image to pseudogray','Show colormap','Map and amplify tint x20'])],
  `
  #define Q43L1(V0) ((V0)<=.04045?(V0)/12.92:pow(((V0)+.055)/1.055,2.4))
  #define Q43FL(V0) ((V0)>.008856?pow((V0),1./3.):7.787*(V0)+16./116.)
  int m=int(u_p2+.5);float tg=m==1?uv.x:clamp(luma(O(uv).rgb),0.,1.);float Lt=tg*100.;float Yt=Lt>8.?pow((Lt+16.)/116.,3.):Lt/903.3;float g0=floor((Yt<=.0031308?Yt*12.92:1.055*pow(Yt,1./2.4)-.055)*255.+.5);
  int I=int(u_p0+.5);vec3 best=vec3(g0/255.);float bd=1e9,bL=0.;
  for(int gi=0;gi<8;gi++){float g=g0-float(I)-1.+float(gi);if(g<0.||g>255.)continue;for(int dr=0;dr<6;dr++)for(int dg=0;dg<6;dg++)for(int db=0;db<6;db++){if(dr>I||dg>I||db>I)continue;if(dr>0&&dg>0&&db>0)continue;
   vec3 cc=vec3(g)+vec3(float(dr),float(dg),float(db));if(max(cc.r,max(cc.g,cc.b))>255.)continue;cc/=255.;vec3 li=vec3(Q43L1(cc.r),Q43L1(cc.g),Q43L1(cc.b));
   vec3 xyz=vec3(dot(li,vec3(.4124,.3576,.1805))/.95047,dot(li,vec3(.2126,.7152,.0722)),dot(li,vec3(.0193,.1192,.9505))/1.08883);vec3 fv=vec3(Q43FL(xyz.x),Q43FL(xyz.y),Q43FL(xyz.z));
   float Lc=116.*fv.y-16.;float ch=length(vec2(500.*(fv.x-fv.y),200.*(fv.y-fv.z)));if(u_p1>0.&&ch>u_p1)continue;float dd=abs(Lc-Lt);if(dd<bd){bd=dd;best=cc;bL=Lc;}}}
  if(m==2){float mn=min(best.r,min(best.g,best.b));return vec4(clamp(vec3(mn)*.5+(best-mn)*20.,0.,1.),1.);}
  return vec4(best,1.);`,
  'G\'MIC pseudogray (max_increment 5, JND 2.3, 8 bits): pseudo-grey colours = grey levels plus R/G/B increments up to max_increment (at least one zero increment, values <= 255) ordered by CIE Lab lightness, keeping only colours within the JND of a pure grey (Lab chroma); the image (or the strip) is mapped to the entry with the nearest lightness; approx.: G\'MIC\'s second (neighbour JND) pruning pass is not applied');

f = add('Distort');
f('q43_rotatetile','Rotate Tileable (G\'MIC rotate_tileable)',[P('Angle',0,360,16,.5,'deg'),S('View',['Fit tile to frame','Tile at 1:1'],1)],
  `float ang=mod(u_p0,360.);float bq=floor(ang/90.);float a=ang-bq*90.;bool sw=mod(bq,2.)>.5;float W=floor(u_res.x+.5),H=floor(u_res.y+.5);float Wr=sw?H:W,Hr=sw?W:H;
 vec2 fr[28];fr[0]=vec2(0.,1.);fr[1]=vec2(1.,8.);fr[2]=vec2(1.,7.);fr[3]=vec2(1.,6.);fr[4]=vec2(1.,5.);fr[5]=vec2(1.,4.);fr[6]=vec2(1.,5.);fr[7]=vec2(1.,3.);fr[8]=vec2(2.,5.);fr[9]=vec2(1.,2.);fr[10]=vec2(2.,5.);fr[11]=vec2(3.,5.);fr[12]=vec2(2.,3.);fr[13]=vec2(3.,4.);
 fr[14]=vec2(4.,5.);fr[15]=vec2(1.,1.);fr[16]=vec2(5.,4.);fr[17]=vec2(7.,5.);fr[18]=vec2(3.,2.);fr[19]=vec2(8.,5.);fr[20]=vec2(9.,5.);fr[21]=vec2(2.,1.);fr[22]=vec2(3.,1.);fr[23]=vec2(4.,1.);fr[24]=vec2(5.,1.);fr[25]=vec2(6.,1.);fr[26]=vec2(7.,1.);fr[27]=vec2(8.,1.);
 float bdv=1e9;vec2 pq=fr[0];for(int k=0;k<28;k++){float d=abs(degrees(atan(fr[k].x/fr[k].y))-a);if(d<bdv){bdv=d;pq=fr[k];}}
 float th=atan(pq.x,pq.y);float nw=Wr,nh=Hr;if(pq.x>.5){${Q43_GCD('Hr*pq.y', 'Wr*pq.x', 'g1')}float pw=Hr*pq.y/g1;nw=floor(pw*Wr/cos(th)+.5);${Q43_GCD('Hr*pq.x', 'Wr*pq.y', 'g2')}float qh=Wr*pq.y/g2;nh=floor(qh*Hr/cos(th)+.5);}
 vec2 xy=u_p1<.5?uv*vec2(nw,nh):mod(uv*u_res,vec2(nw,nh));vec2 d=xy-vec2(nw,nh)*.5;float tt=th+bq*1.5707963;float cs=cos(tt),sn=sin(tt);
 vec2 src=vec2(cs*d.x-sn*d.y,sn*d.x+cs*d.y)+vec2(W,H)*.5;return vec4(O(fract(src/vec2(W,H))).rgb,1.);`,
  'G\'MIC rotate_tileable: the angle is reduced by quarter turns and snapped to the nearest atan(p/q) of G\'MIC\'s fraction list, the tile size follows the gcd formulas (nw = round(pw*w/cos), nh = round(qh*h/cos)) and the periodic image is rotated about the centre so the result tiles seamlessly; port with the (usually larger) tile fitted to the frame or repeated at 1:1 (no max_size_factor limit; the tile size depends on the working resolution)');

/* ---------------- Natron ---------------- */
f = add('Color');
f('q43_blurhue','Hue Blur (Natron L_BlurHue)',[P('Size',0,40,5.2,.1,'px'),P('Mix',0,1,1,.01),S('Operations in log',['On','Off'])],
  [`vec3 x=max(c.rgb,0.);if(u_p2<.5)x=(685.+300.*log(x*(1.-.0108)+.0108)/log(10.))/1023.;float y=dot(x,vec3(.3,.59,.11));vec3 ch=x/max(y,1e-4);return vec4(clamp(ch/10.,0.,1.),1.);`,
   BH('u_p0/1.2'), BV('u_p0/1.2'),
   `vec3 x=max(O(uv).rgb,0.);if(u_p2<.5)x=(685.+300.*log(x*(1.-.0108)+.0108)/log(10.))/1023.;vec3 ch=T(uv).rgb*10.;float g=dot(x,vec3(.2126,.7152,.0722));vec3 o=mix(ch,ch*g,u_p1);
 if(u_p2<.5)o=(pow(vec3(10.),(o*1023.-685.)/300.)-.0108)/(1.-.0108);return vec4(clamp(o,0.,1.),1.);`],
  'Natron community PyPlug L_BlurHue: chroma ratios rgb/(0.3r+0.59g+0.11b) are Gaussian-blurred (CImg size, sigma = size/2.4) and multiplied back by the Rec.709 luminance (Saturation 0), Merge mix, optionally in Cineon log space (Lin2Log / Log2Lin, default on); port');
