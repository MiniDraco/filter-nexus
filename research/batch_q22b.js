/* ================= q22b: NewBlue FX (paint, light, shear, detail), CellProfiler (dark holes, DIC, Morph ops, OpenLines), gThumb (Arctic / Cherry / Mango / Desert curves, Blurred Edges), SAGA (Multi-direction Lee, Majority / Minority) ================= */
f = add('Paint');
f('q22_nb_paint','NewBlue Imagine / Excite Paint (Mural / Paper Collage / Pencil Rubbing / Hand Drawn / Color Melt)',[S('Style',['Mural','Paper Collage','Pencil Rubbing','Hand Drawn','Color Melt']),P('Size',1,20,6,.5,'px'),P('Color levels',2,12,5,1),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);float r=R(u_p1);float lv=floor(u_p2+.5);vec2 P0=PX(uv);
 vec3 bl=c.rgb;float wsum=1.;for(int i=0;i<8;i++){float an=float(i)*.7854;vec2 d=vec2(cos(an),sin(an))*u_px;bl+=T(uv+d*r).rgb+T(uv+d*r*.5).rgb;wsum+=2.;}bl/=wsum;
 float ed=length(sobel(uv));vec3 o;
 if(m==0){float d2=max(r*.3,1.);vec2 g=vec2(blurL(uv+vec2(d2,0.)*u_px,d2)-blurL(uv-vec2(d2,0.)*u_px,d2),blurL(uv+vec2(0.,d2)*u_px,d2)-blurL(uv-vec2(0.,d2)*u_px,d2));
  vec3 hv=rgb2hsv(bl);hv.y=min(hv.y*1.35,1.);hv.z=floor(hv.z*lv+.5)/lv;hv.x=floor(hv.x*12.+.5)/12.;o=hsv2rgb(hv)*(1.+dot(g,vec2(-1.,1.))*3.)*(1.-smoothstep(.3,.8,ed)*.45)*(.94+.12*fbm(P0*.15));}
 else if(m==1){float d2=max(r*.35,1.);float lq=floor(clamp(blurL(uv,d2),0.,.999)*lv);float shd=0.;
  for(int k=1;k<=4;k++){float l2=floor(clamp(blurL(uv+vec2(-1.,1.)*float(k)*d2*.8*u_px,d2),0.,.999)*lv);shd+=l2>lq?.13:0.;}
  vec3 hv=rgb2hsv(bl);vec3 pc=hsv2rgb(vec3(floor(hv.x*8.+.5)/8.,.35+.6*hv.y,.3+.7*(lq+.5)/lv));o=pc*(.9+.1*fbm(P0*.4))*(1.-shd);}
 else if(m==2){float tone=pow(1.-luma(bl),1.4)*.85;float gr=fbm(P0*vec2(.5,.35));float hh=abs(fract((P0.x+P0.y)/(2.5+r*.4)+vnoise(P0*.04)*1.5)-.5);
  float dk=smoothstep(.9-tone,1.15-tone,gr*.55+(.5-hh)*.9);dk=max(dk,smoothstep(.12,.5,ed)*(.6+.4*gr));o=vec3(.97,.96,.93)*(1.-.85*dk);}
 else if(m==3){vec3 hv=rgb2hsv(bl);hv.y=min(hv.y*1.6+.08,1.);hv.z=mix(hv.z,floor(hv.z*lv+.5)/lv,.6);vec3 pc=hsv2rgb(hv);
  float dg=blurL(uv,1.)-blurL(uv,max(r*.45,2.));float ln=smoothstep(.008,.045,-dg+(vnoise(P0*.3)-.5)*.02);o=pc*(1.-.88*ln);}
 else{vec3 acc=vec3(0.);float ws=0.;for(int i=0;i<40;i++){float fi=float(i);float rr=sqrt((fi+.5)/40.)*r*2.;float an=fi*2.39996;vec3 v=T(uv+vec2(cos(an),sin(an))*rr*u_px).rgb;float sv=rgb2hsv(v).y;float w=.05+sv*sv*(.5+luma(v));acc+=v*w;ws+=w;}
  vec3 hv=rgb2hsv(acc/ws);hv.y=min(hv.y*1.5,1.);hv.z=min(hv.z*1.15+.05,1.);o=hsv2rgb(hv);}
 return vec4(clamp(mix(c.rgb,o,u_p3),0.,1.),1.);`,
  'NewBlue Stylizers looks (approx., from the product descriptions): Mural = smoothed, hue / value-posterised colour with directional shading and soft edge darkening on a wall texture; Paper Collage = luma split into coloured paper strata (Color levels) with drop shadows cast by the higher layers; Pencil Rubbing = pencil hatching whose density follows darkness, revealed through paper grain, plus edge strokes; Hand Drawn = dark DoG lines over vibrant, partly posterised colours; Color Melt = colours expanded and softened by a saturation-weighted wide gather, then brightened (lava-lamp look)');

f = add('Render');
f('q22_nb_light','NewBlue Illuminate (Halovision Plus / Light Bender / Spinning Light / Starlight)',[S('Effect',['Halovision Plus','Light Bender','Spinning Light','Starlight']),P('Threshold',0,.98,.7,.01),P('Size',5,200,40,1,'px'),P('Intensity',0,3,1,.01)],
  `int m=int(u_p0+.5);float th=u_p1;float S=R(u_p2);vec3 add=vec3(0.);
 #define Q22HL(q) (max(luma(T(q).rgb)-th,0.)/(1.-th)*mix(vec3(1.),T(q).rgb/max(luma(T(q).rgb),.05),.35))
 if(m==0){for(int i=0;i<64;i++){float fi=float(i);float rr=sqrt((fi+.5)/64.);float an=fi*2.39996;vec3 h=Q22HL(uv+vec2(cos(an),sin(an))*rr*S*u_px);add+=h*(.3+1.4*smoothstep(.75,1.,rr));}add*=u_p3*4./64.;}
 else if(m==1){float b0=.5;for(int s2=0;s2<4;s2++){float sg=s2<2?1.:-1.;float dr=s2==0||s2==2?1.:-1.;for(int i=1;i<=20;i++){float tt=float(i)/20.;float an=tt*1.3;vec2 d=S*1.4*vec2(sin(an)*dr,sg*(1.-cos(an)));d=rot(d,b0);add+=Q22HL(uv-d*u_px)*pow(1.-tt,1.5);}}add*=u_p3*.09*vec3(1.,.9,.75);}
 else if(m==2){vec2 cp=(uv-.5)*vec2(asp(),1.);float rr=length(cp);float an=atan(cp.y,cp.x);float sz=max(S/u_res.y*2.,.03);
  float rays=pow(.5+.5*cos(12.*(an+rr*3.)),6.)*.6+pow(.5+.5*cos(7.*(an-rr*2.)+1.),8.)*.4;float fall=exp(-rr/sz);vec3 gs=vec3(0.);
  for(int i=1;i<=16;i++){float k=float(i)/16.;vec2 q=rot(cp*(1.-.35*k),.5*k);gs+=Q22HL(.5+q/vec2(asp(),1.))*(1.-k);}
  add=(vec3(1.,.93,.8)*fall*(.45+.75*rays)+gs*.12)*u_p3;}
 else{float a0=vnoise(PX(uv)/(u_p2*3.+1.)+u_seed)*3.14159;
  #define Q22SP(q) (Q22HL(q)*step(.93,hash(floor(PX(q)/3.)+floor(u_seed))))
  for(int k=0;k<4;k++){float an=a0+float(k)*.7854;vec2 d=vec2(cos(an),sin(an));float len=k==0||k==2?1.:.5;for(int i=0;i<=14;i++){float tt=float(i)/14.;float o=tt*S*len;float w=pow(1.-tt,2.);add+=(Q22SP(uv+d*o*u_px)+Q22SP(uv-d*o*u_px))*w;}}
  add*=u_p3*.9;}
 return vec4(clamp(c.rgb+add,0.,1.),1.);`,
  'NewBlue Stylizers Illuminate light effects (approx., from the product descriptions): Halovision Plus = bokeh-like halo rings gathered from highlights above Threshold (disc of radius Size, rim-weighted); Light Bender = curved flares, highlights smeared along circular arcs in four bent directions; Spinning Light = swirling radial rays of light from the image centre plus a swirl-zoom gather of nearby highlights; Starlight = sparse highlight specks turned into 8-point stars whose arm angle drifts across the frame (rotating specks); seeded', true);

f = add('Blur');
f('q22_nb_shear','Shear Energy (NewBlue)',[P('Angle',-90,90,20,1,'deg'),P('Length',0,120,20,1,'px'),P('Second axis angle',-90,90,-70,1,'deg'),P('Blend',0,1,.6,.01)],
  `float a1=radians(u_p0),a2=radians(u_p2);float Ln=R(u_p1);vec3 b1=vec3(0.),b2=vec3(0.);vec2 d1=vec2(cos(a1),sin(a1))*u_px,d2=vec2(cos(a2),sin(a2))*u_px;
 for(int i=0;i<32;i++){float tt=float(i)/31.-.25;b1+=T(uv+d1*tt*Ln).rgb;b2+=T(uv+d2*tt*Ln).rgb;}b1/=32.;b2/=32.;vec3 e=.5*(b1+b2);
 return vec4(clamp(mix(c.rgb,e,u_p3)+max(max(b1,b2)-c.rgb,0.)*u_p3*.5,0.,1.),1.);`,
  'NewBlue Shear Energy (approx., from "a shear, blended motion effect by blurring the image on two axes"): two off-centre motion blurs along two axes averaged, blended with the image and with their lighter-than-image energy added on top');

f = add('Sharpen');
f('q22_nb_detail','NewBlue Detail by Chroma / Detail by Luma / Dual Booster',[S('Mode',['Detail by Chroma','Detail by Luma','Dual Booster']),P('Amount',0,3,1,.01),P('Radius',1,30,5,.5,'px'),P('Target hue',0,360,30,1,'deg')],
  [BH('u_p2'),BV('u_p2'),
  `int m=int(u_p0+.5);float A=u_p1;vec3 x=O(uv).rgb;vec3 bl=T(uv).rgb;vec3 dt=x-bl;vec3 o;
 if(m==0){vec3 hv=rgb2hsv(bl);float dh=abs(fract(hv.x-u_p3/360.+.5)-.5)*360.;float w=exp(-dh*dh/1250.)*smoothstep(.06,.25,hv.y);o=x+dt*A*2.*w;o=(o-bl)*(1.+.25*A*w)+bl;o=(o-.5)*(1.+.25*A*w)+.5;}
 else if(m==1){float Lb=luma(bl);float wh=smoothstep(.25,.75,Lb),ws=1.-wh;vec3 cor=sign(dt)*max(abs(dt)-.03*(1.-Lb),0.);o=x+dt*A*1.6*wh+cor*A*1.2*ws;}
 else{float Lx=luma(x);float hw=smoothstep(.5,.95,Lx),sw=1.-smoothstep(.05,.5,Lx);o=mix(x,x*x,clamp(sw*A*.35,0.,1.));o=mix(o,1.-(1.-o)*(1.-o),clamp(hw*A*.25,0.,1.));o=sat(o,1.+A*.3*(hw+sw));o+=dt*A*.6*(hw+sw);}
 return vec4(clamp(o,0.,1.),1.);`],
  'NewBlue Video Essentials detail tools (approx., from the product descriptions): Detail by Chroma = unsharp detail and contrast boosted only inside a hue region (Gaussian hue window ~25 deg around Target hue, saturation-gated); Detail by Luma = separate detail gain for the high and the low regions, shadow detail cored to compensate for the noise increase; Dual Booster = lightest and darkest regions adjusted separately (shadows deepened, highlights lifted, vibrance + detail boosted in both)');

/* ---- CellProfiler ---- */
f = add('Analysis');
const Q22_DH = (dir, src, op, last) => `float A=R(u_p0),B=R(max(u_p1,u_p0)+1.);vec2 m=vec2(${op=='min'?'9.':'-9.'});float sa=max(1.,A/16.),sb=max(1.,B/32.);
 for(int i=-16;i<=16;i++){float xo=float(i)*sa;if(abs(xo)>A)continue;vec2 q=uv+${dir}*xo*u_px;m.x=${op}(m.x,(${src}).x);}
 for(int i=-32;i<=32;i++){float xo=float(i)*sb;if(abs(xo)>B)continue;vec2 q=uv+${dir}*xo*u_px;m.y=${op}(m.y,(${src}).y);}
 ${last ? `float v=clamp((m.x-m.y)*u_p2,0.,1.);if(u_p3<.5)return vec4(vec3(v),1.);return vec4(mix(O(uv).rgb,vec3(1.,.1,.1),v),1.);` : `return vec4(m,0.,1.);`}`;
f('q22_cp_darkholes','Enhance Dark Holes (CellProfiler)',[P('Min radius',1,20,1,1,'px'),P('Max radius',1,40,10,1,'px'),P('Gain',.5,10,2,.1),S('Output',['Enhanced holes','Overlay on image'])],
  [Q22_DH('vec2(1.,0.)','vec2(1.-luma(O(q).rgb))','min'),Q22_DH('vec2(0.,1.)','T(q).rg','min'),Q22_DH('vec2(1.,0.)','T(q).rg','max'),Q22_DH('vec2(0.,1.)','T(q).rg','max',true)],
  'CellProfiler EnhanceOrSuppressFeatures > Enhance > Dark holes (centrosome enhance_dark_holes): image inverted so holes are peaks; holes with radius in [min, max] = difference between the openings of the inverted image at radius min and at radius max + 1 (CellProfiler sums the successive differences of openings by reconstruction with a cross element, keeping the per-step maximum; approx.: plain openings with a square element)');

f('q22_cp_dic','Enhance DIC (CellProfiler)',[P('Shear angle',-180,180,0,1,'deg'),P('Decay',.1,.99,.95,.01),P('Smoothing',0,10,2,.1,'px'),P('Gain',.1,5,1,.05)],
  [`float a=radians(u_p0);vec2 dP=vec2(cos(a),-sin(a));return blur1d(u_tex,uv,dP,R(u_p2)*2.);`,
  `float a=radians(u_p0);vec2 dI=vec2(sin(a),cos(a))*u_px;float dd=pow(u_p1,1./max(u_k,1e-3));float acc=0.,w=1.;
 for(int k=1;k<=160;k++){w*=dd;if(w<.003)break;acc+=w*(L(uv+dI*float(k))-L(uv-dI*float(k)));}acc*=.5/max(u_k,1e-3);
 return vec4(vec3(clamp(.5+acc*u_p3*.06,0.,1.)),1.);`],
  'CellProfiler EnhanceOrSuppressFeatures > Enhance > DIC (centrosome line_integration, Kam 1998 style): Gaussian smoothing (sigma = Smoothing) perpendicular to the shear direction, then integration along the shear axis with exponential decay, (forward sum - reverse sum) / 2 = sum_k decay^k (s[i-k] - s[i+k]) / 2 (truncated at weight 0.003, max 160 px); output as 0.5 + gain x result');

f = add('Edges');
const Q22_MORPH = k => `int op=int(u_p0+.5);bool inv=u_p2>.5;
 #define Q22B(dd) (${k==0?'((luma(O(uv+(dd)*u_px).rgb)>u_p1)!=inv)':'(T(uv+(dd)*u_px).r>.5)'})
 bool cc=Q22B(vec2(0.));bool doit=${k}==0||((op==1||op==2||op==3)&&${k}<int(u_p3+.5));bool o=cc;
 if(doit){vec2 off[8]=vec2[8](vec2(0.,1.),vec2(1.,1.),vec2(1.,0.),vec2(1.,-1.),vec2(0.,-1.),vec2(-1.,-1.),vec2(-1.,0.),vec2(-1.,1.));
  bool nb[8];int n=0;for(int i=0;i<8;i++){nb[i]=Q22B(off[i]);n+=nb[i]?1:0;}
  if(op==0){int tr=0;for(int i=0;i<8;i++)tr+=(!nb[i]&&nb[(i+1)%8])?1:0;o=cc&&tr>=3;}
  else if(op==1)o=cc&&n>0;
  else if(op==2){if(!cc)o=(nb[0]&&nb[2]&&!nb[1])||(nb[2]&&nb[4]&&!nb[3])||(nb[4]&&nb[6]&&!nb[5])||(nb[6]&&nb[0]&&!nb[7]);}
  else if(op==3)o=cc&&n!=1;
  else if(cc&&!nb[0]&&!nb[4]&&nb[1]&&nb[2]&&nb[3]&&nb[5]&&nb[6]&&nb[7])o=false;}
 ${k==7?'return vec4(vec3(o!=inv?1.:0.),1.);':'return vec4(o?1.:0.,0.,0.,1.);'}`;
f('q22_cp_morph','Morph Operations (CellProfiler: branchpoints / clean / diag / spur / vbreak)',[S('Operation',['branchpoints','clean','diag','spur','vbreak']),P('Threshold',0,1,.5,.01),S('Objects are',['Light on dark','Dark on light']),P('Repeat count',1,8,1,1)],
  [0,1,2,3,4,5,6,7].map(Q22_MORPH),
  'CellProfiler Morph binary operations on the thresholded image (1 working pixel grid): branchpoints = keep only skeleton pixels with 3 or more branches (0-to-1 transitions around the 8-neighbour ring; run after Skeletonize); clean = remove isolated pixels; diag = fill a background pixel whose two 4-neighbours meet diagonally across a background corner (removes 8-connectivity of the background); spur = remove pixels with exactly one 8-neighbour (line end points); vbreak = remove the centre of a horizontal bridge between vertical lines (1 0 1 / 1 1 1 / 1 0 1); clean, diag and spur repeat up to Repeat count (CellProfiler Once / Custom), the others run once as in CellProfiler');

f('q22_cp_openlines','OpenLines (CellProfiler Morph)',[P('Line length',2,60,10,1,'px'),S('Image is',['Grayscale','Binary']),P('Threshold',0,1,.5,.01),S('Output',['Opened lines','Removed (residue)'])],
  [`bool bn=u_p1>.5;float Lh=R(u_p0)*.5;float st=max(1.,Lh/30.);vec4 m=vec4(9.);
 #define Q22V(q) (bn?step(u_p2,luma(O(q).rgb)):luma(O(q).rgb))
 for(int i=-30;i<=30;i++){float xo=float(i)*st;if(abs(xo)>Lh)continue;vec2 o=xo*u_px;
  m=min(m,vec4(Q22V(uv+o*vec2(1.,0.)),Q22V(uv+o*vec2(.7071,.7071)),Q22V(uv+o*vec2(0.,1.)),Q22V(uv+o*vec2(-.7071,.7071))));}return m;`,
  `float Lh=R(u_p0)*.5;float st=max(1.,Lh/30.);vec4 m=vec4(-9.);
 for(int i=-30;i<=30;i++){float xo=float(i)*st;if(abs(xo)>Lh)continue;vec2 o=xo*u_px;
  m=max(m,vec4(T(uv+o*vec2(1.,0.)).r,T(uv+o*vec2(.7071,.7071)).g,T(uv+o*vec2(0.,1.)).b,T(uv+o*vec2(-.7071,.7071)).a));}
 float v=max(max(m.x,m.y),max(m.z,m.w));bool bn=u_p1>.5;float s0=bn?step(u_p2,luma(O(uv).rgb)):luma(O(uv).rgb);
 return vec4(vec3(u_p3<.5?v:clamp(s0-v,0.,1.)),1.);`],
  'CellProfiler Morph openlines: union of openings (erosion then dilation) with linear structuring elements of the given length, keeping structures that contain a line of that many pixels in some direction and suppressing dots of the same size; 4 orientations (0 / 45 / 90 / 135 deg; CellProfiler rotates the line in finer steps) - approx.');

/* ---- gThumb ---- */
const Q22_GTP = {
  Arctic: [null, [[0,0],[133,122],[255,255]], [[0,0],[64,57],[176,186],[255,255]], [[0,0],[180,207],[255,255]]],
  Cherry: [null, [[0,12],[74,79],[134,156],[188,209],[239,255]], [[12,0],[78,67],[138,140],[189,189],[252,233]], [[0,8],[77,100],[139,140],[202,186],[255,244]]],
  Mango: [null, [[0,0],[75,67],[135,155],[171,193],[252,255]], [[0,0],[84,65],[162,167],[255,255]], [[0,0],[84,74],[160,150],[255,255]]],
  Desert: [[[0,0],[115,145],[255,255]], [[0,0],[71,66],[208,204],[255,255]], [[0,0],[71,55],[200,206],[255,255]], [[0,0],[232,185],[255,248]]],
};
const Q22_BZ = (P, v) => {
  if (!P) return v;
  const n = P.length, F = x => (+x).toFixed(4), seg = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i > 0 ? P[i-1] : null, p1 = P[i], p2 = P[i+1], b = i < n - 2 ? P[i+2] : null, dx = p2[0] - p1[0];
    let c1, c2;
    if (a && b) { c1 = p1[1] + (p2[1] - a[1]) / (p2[0] - a[0]) * dx / 3; c2 = p2[1] - (b[1] - p1[1]) / (b[0] - p1[0]) * dx / 3; }
    else if (b) { c2 = p2[1] - (b[1] - p1[1]) / (b[0] - p1[0]) * dx / 3; c1 = p1[1] + (c2 - p1[1]) / 2; }
    else if (a) { c1 = p1[1] + (p2[1] - a[1]) / (p2[0] - a[0]) * dx / 3; c2 = p2[1] + (c1 - p2[1]) / 2; }
    else { c1 = p1[1] + (p2[1] - p1[1]) / 3; c2 = p1[1] + (p2[1] - p1[1]) * 2 / 3; }
    seg.push(`Q22CB(${F(p1[1])},${F(c1)},${F(c2)},${F(p2[1])},clamp((${v}-${F(p1[0])})/${F(dx)},0.,1.))`);
  }
  let e = seg[n - 2];
  for (let i = n - 3; i >= 0; i--) e = `(${v}<${F(P[i+1][0])}?${seg[i]}:${e})`;
  return e;
};
const Q22_GTLOOK = L => `{vec3 y=floor(clamp(vec3(${Q22_BZ(L[1],'x.r')},${Q22_BZ(L[2],'x.g')},${Q22_BZ(L[3],'x.b')}),0.,255.)+.5);` +
  (L[0] ? `y=floor(clamp(vec3(${Q22_BZ(L[0],'y.r')},${Q22_BZ(L[0],'y.g')},${Q22_BZ(L[0],'y.b')}),0.,255.)+.5);` : '') + `o=y/255.;}`;
f = add('Insta');
f('q22_gthumb_looks','gThumb Special Effects (Arctic / Cherry / Mango / Desert)',[S('Look',['Arctic','Cherry','Mango','Desert']),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 x=floor(clamp(c.rgb,0.,1.)*255.+.5);vec3 o;
 #define Q22CB(a0,a1,a2,a3,tt) ((1.-(tt))*(1.-(tt))*(1.-(tt))*(a0)+3.*(1.-(tt))*(1.-(tt))*(tt)*(a1)+3.*(1.-(tt))*(tt)*(tt)*(a2)+(tt)*(tt)*(tt)*(a3))
 if(m==0)${Q22_GTLOOK(Q22_GTP.Arctic)}else if(m==1)${Q22_GTLOOK(Q22_GTP.Cherry)}else if(m==2)${Q22_GTLOOK(Q22_GTP.Mango)}else ${Q22_GTLOOK(Q22_GTP.Desert)}
 return vec4(mix(c.rgb,o,u_p1),1.);`,
  'gThumb (src/Ext/Editor/SpecialEffects/*.vala) curve presets, exact control points: per-channel R / G / B curves then the Value curve (Desert) through the value map; gth_bezier curves = cubic Bezier per interval with control-point x at 1/3 and 2/3 and y from the neighbour slopes (GIMP 2.8 style), rounded to 8 bits; outside the first / last point the end value is held');

f = add('Blur');
const Q22_PB = dir => `float mr=floor(u_p0*20.+.5);vec2 W=u_res/u_k;float mind=floor(floor(min(W.x,W.y)/2.)/4.);float maxd=mind+100.;
 vec2 pc=floor(PX(uv))-floor(W/2.);float dist=floor(length(pc)+.5);dist=min(max(dist,mind)-mind,maxd);float rad=floor(mr*dist/maxd+.5);
 if(rad<=1.)return T(uv);float sg=(rad*2.+1.)/6.;float rw=R(rad);float st=max(1.,rw/24.);vec4 acc=vec4(0.);float ws=0.;
 for(int i=-24;i<=24;i++){float xo=float(i)*st;if(abs(xo)>rw)continue;float xd=xo/u_k;float w=exp(-xd*xd/(2.*sg*sg));acc+=T(uv+${dir}*xo*u_px)*w;ws+=w;}return vec4((acc/ws).rgb,1.);`;
f('q22_gthumb_blurrededges','Blurred Edges (gThumb)',[P('Amount',0,1,.5,.01)],[Q22_PB('vec2(1.,0.)'),Q22_PB('vec2(0.,1.)')],
  'gThumb gth_image_progressive_blur: separable Gaussian (horizontal then vertical) whose radius grows with the distance d from the image centre: radius = round(20 x Amount x clamp(d - m, 0, m + 100) / (m + 100)) with m = min(w, h) / 2 / 4, sigma = (2 radius + 1) / 6, no blur where radius <= 1 (weights renormalised)');

/* ---- SAGA ---- */
f = add('Noise');
f('q22_saga_mdlee','Multi Direction Lee Filter (SAGA)',[S('Method',['Noise relative to mean std dev','Noise absolute (grey levels)']),P('Estimated noise',0,40,1,.05),S('Weighted',['Yes','No']),S('Output',['Filtered','Minimum std dev','Direction of minimum std dev'])],
  [`bool wg=u_p2<.5;float bs=1e9;int bk=0;
 for(int k=0;k<16;k++){float th=float(k)*PI/16.;vec2 d=vec2(cos(th),sin(th));d/=max(abs(d.x),abs(d.y));vec2 np=abs(d.x)>=abs(d.y)?vec2(0.,1.):vec2(1.,0.);float sw=0.,s1=0.,s2=0.;
  for(int i=-4;i<=4;i++){vec2 q0=floor(float(i)*d+.5);for(int a=-1;a<=1;a++){float w=a==0?1.:(wg?.5:1.);float v=L(uv+(q0+float(a)*np)*u_px);sw+=w;s1+=w*v;s2+=w*v*v;}}
  float mu=s1/sw;float sd=sqrt(max(s2/sw-mu*mu,0.));if(sd<bs){bs=sd;bk=k;}}
 float th=float(bk)*PI/16.;vec2 d=vec2(cos(th),sin(th));d/=max(abs(d.x),abs(d.y));vec2 np=abs(d.x)>=abs(d.y)?vec2(0.,1.):vec2(1.,0.);vec3 mc=vec3(0.);float sw=0.;
 for(int i=-4;i<=4;i++){vec2 q0=floor(float(i)*d+.5);for(int a=-1;a<=1;a++){float w=a==0?1.:(wg?.5:1.);mc+=w*T(uv+(q0+float(a)*np)*u_px).rgb;sw+=w;}}
 return vec4(mc/sw,u_p3>1.5?float(bk)/16.:bs);`,
  `vec4 st=T(uv);int om=int(u_p3+.5);if(om==1)return vec4(vec3(clamp(st.a*5.,0.,1.)),1.);if(om==2)return vec4(hsv2rgb(vec3(st.a,.6,.9)),1.);
 float ms=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++)ms+=T((vec2(float(i),float(j))+.5)/16.).a/256.;
 float n=u_p0<.5?u_p1*ms:u_p1/255.;float sg=st.a;vec3 x=O(uv).rgb;vec3 o;
 if(sg<=n)o=sg>0.?st.rgb:x;else{float b=(sg*sg-n*n)/(sg*sg);o=x*b+(1.-b)*st.rgb;}return vec4(o,1.);`],
  'SAGA grid_filter Multi Direction Lee Filter (Lee 1980; Selige, Bohner & Ringeler 2006): 16 directional 9x9 line masks (weight 1 on the line, 0.5 on the adjacent cells when Weighted); the direction with minimum (weighted) standard deviation of luma gives mean m and sigma; Lee gain b = (sigma^2 - n^2) / sigma^2, out = x b + (1 - b) m (mean when sigma <= n); noise n absolute or relative to the image mean of the minimum std dev (single pass; the Ringeler variant with its correction table is not included); colour: per-channel means along the chosen direction with the luma gain');

f('q22_saga_majmin','Majority / Minority Filter (SAGA)',[S('Type',['Minority','Majority']),P('Levels per channel',2,32,6,1),P('Radius',1,3,2,1,'px'),P('Threshold',0,100,0,1,'%')],
  `int tp=int(u_p0+.5);float Lv=floor(u_p1+.5);int rad=int(u_p2+.5);vec2 sp=u_px*max(1.,floor(u_k+.5));
 float key[49];vec3 col[49];int n=0;
 for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(i*i+j*j>rad*rad)continue;vec3 v=T(uv+vec2(float(i),float(j))*sp).rgb;vec3 qv=floor(clamp(v,0.,.9999)*Lv);key[n]=qv.r+qv.g*Lv+qv.b*Lv*Lv;col[n]=v;n++;}
 int best=0;int bc=tp==1?0:999;
 for(int a=0;a<49;a++){if(a>=n)break;int cnt=0;for(int b=0;b<49;b++){if(b>=n)break;cnt+=key[b]==key[a]?1:0;}if(tp==1?cnt>bc:cnt<bc){bc=cnt;best=a;}}
 float tf=u_p3/100.;int thr=int(floor((tp==1?tf:1.-tf)*float(n)+.5));bool rep=tp==1?bc>thr:bc<thr;
 return vec4(rep?col[best]:c.rgb,1.);`,
  'SAGA grid_filter Majority/Minority Filter (Conrad 2010), circle kernel: the most (Majority) or least (Minority) frequent value in the window replaces the cell when its count is > threshold x kernel size (Majority) or < (1 - threshold) x kernel size (Minority), threshold in percent (default 0); for colour images the classes are colours quantised to Levels per channel and the replacement is the first window pixel of that class; ties = first in scan order');
