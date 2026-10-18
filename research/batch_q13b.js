/* ================= q13b: game-engine post (Unity colour curves, Unreal blue correction / expand gamut, SAO / MSVO / SSIL, Unity screen-space lens flare), ImageMagick morphology kernels, Pratt edge operators ================= */
f = add('Color');
f('q13_colorcurves','Color Curves: Hue vs Hue / Hue vs Sat / Sat vs Sat / Lum vs Sat (Unity)',
  [S('Curve',['Hue vs Hue','Hue vs Sat','Sat vs Sat','Lum vs Sat']),P('Key position',0,1,.08,.005),P('Width',.02,1,.12,.005),P('Amount',-1,1,.15,.01)],
  `int m=int(u_p0+.5);vec3 lin=mix(c.rgb/12.92,pow((c.rgb+.055)/1.055,vec3(2.4)),step(.04045,c.rgb));vec3 hsv=rgb2hsv(lin);float l=dot(lin,vec3(.2126,.7152,.0722));
  float key=m<=1?hsv.x:m==2?hsv.y:l;float d=key-u_p1;if(m<=1)d-=floor(d+.5);float cv=.5+.5*u_p3*exp(-.5*(d/u_p2)*(d/u_p2));
  if(m==0)lin=hsv2rgb(vec3(fract(hsv.x+cv-.5),hsv.yz));else lin=l+cv*2.*(lin-l);lin=max(lin,vec3(0.));
  return vec4(clamp(mix(12.92*lin,1.055*pow(lin,vec3(1./2.4))-.055,step(.0031308,lin)),0.,1.),1.);`,
  'Unity URP / HDRP Color Curves (ColorGradingLut): Hue vs Hue adds curve(hue) - 0.5 to the hue; Hue vs Sat, Sat vs Sat and Lum vs Sat multiply saturation by 2 x curve(key) (Saturation() = lerp(Rec.709 luminance, colour, s)), all on linear colour. The hand-drawn curve is stood in for by a flat 0.5 curve plus one Gaussian bump (key position, width, amount; circular for hue)');
f('q13_ue_gamut','Blue Correction / Expand Gamut (Unreal tonemapper)',[P('Blue Correction',0,1,.6,.01),P('Expand Gamut',0,1,1,.01),P('Scene exposure',-2,4,0,.1,'EV'),S('Output',['Corrected','Difference x4'])],
  `vec3 l=mix(c.rgb/12.92,pow((c.rgb+.055)/1.055,vec3(2.4)),step(.04045,c.rgb))*exp2(u_p2);
  vec3 a=vec3(dot(l,vec3(.6131915,.3395121,.0473663)),dot(l,vec3(.0702069,.9163358,.01345)),dot(l,vec3(.0206189,.1095673,.8696067)));
  float Y=dot(a,vec3(.2722287,.6740818,.0536895));vec3 ch=a/max(Y,1e-6);float cd=dot(ch-1.,ch-1.);float ea=(1.-exp2(-4.*cd))*(1.-exp2(-4.*u_p1*Y*Y));
  vec3 ex=vec3(dot(a,vec3(1.3701991,-.3292051,-.0636683)),dot(a,vec3(-.0834471,1.0971185,-.0108619)),dot(a,vec3(-.0257998,-.0986568,1.2039829)));a=mix(a,ex,ea);
  vec3 bc=vec3(dot(a,vec3(.9386394,0.,.0613606)),dot(a,vec3(0.,.8307941,.1692059)),a.z);a=mix(a,bc,u_p0);
  vec3 o=vec3(dot(a,vec3(1.7047909,-.6216897,-.0832422)),dot(a,vec3(-.1302636,1.1408284,-.0105497)),dot(a,vec3(-.0240088,-.1289996,1.153248)))*exp2(-u_p2);o=max(o,vec3(0.));
  o=clamp(mix(12.92*o,1.055*pow(o,vec3(1./2.4))-.055,step(.0031308,o)),0.,1.);return vec4(u_p3>.5?clamp(.5+(o-c.rgb)*4.,0.,1.):o,1.);`,
  'Unreal Engine film tonemapper colour stage (PostProcessCombineLUTs): in ACEScg (AP1, sRGB D65 -> D60 Bradford) bright saturated colours are pushed outward, ExpandAmount = (1 - 2^(-4 |chroma - 1|^2)) (1 - 2^(-4 ExpandGamut Y^2)), with the Wide_2_XYZ -> AP1 x AP1_2_sRGB matrix; then BlueCorrection lerps toward the ACES Academy blue-light-artifact LMT matrix (AP0, here pre-converted to AP1). UE re-applies the inverse blue matrix after its film curve; with no film curve here only the forward correction is shown. Scene exposure scales the linear input before and undoes it after (expansion depends on brightness); defaults are UE\'s 0.6 / 1.0');

f = add('Depth');
f('q13_ssao3','Screen-Space AO II (SAO / MSVO / SSIL)',[S('Method',['SAO (McGuire 2012)','MSVO (multi-scale volumetric)','SSIL (indirect light)']),P('Radius',4,80,24,1,'px'),P('Intensity',0,4,1,.01),S('Output',['Composite','Effect only'])],
  [`int m=int(u_p0+.5);
#define Q13_P(QQ) vec3(((QQ)-.5)*vec2(asp(),1.),D(QQ)*.5)
#define Q13_N(QQ) normalize(cross(Q13_P((QQ)+vec2(2.*u_px.x,0.))-Q13_P((QQ)-vec2(2.*u_px.x,0.)),Q13_P((QQ)+vec2(0.,2.*u_px.y))-Q13_P((QQ)-vec2(0.,2.*u_px.y))))
   vec3 C=Q13_P(uv);vec3 n=Q13_N(uv);float r=R(u_p1);float rw=r*u_px.y;float phi=hash(floor(uv*u_res))*6.2832;
   if(m==0){float sum=0.;for(int i=0;i<24;i++){float a=(float(i)+.5)/24.;float th=6.2832*a*7.+phi;vec2 q2=uv+vec2(cos(th),sin(th))*a*r*u_px;vec3 v=Q13_P(q2)-C;float vv=dot(v,v),vn=dot(v,n);float f2=max(rw*rw-vv,0.);sum+=f2*f2*f2*max((vn-.006-.05*rw)/(vv+.01*rw*rw),0.);}
    float ao=max(0.,1.-sum*u_p2/pow(rw,6.)*5./24.);return vec4(vec3(ao),1.);}
   if(m==1){float ao=1.;for(int s=0;s<4;s++){float rs=rw/pow(2.,float(s));float rp=r/pow(2.,float(s));if(rp<1.)break;float num=0.,den=0.;
     for(int i=0;i<12;i++){float a=(float(i)+.5)/12.;float th=6.2832*a*2.618+phi;float rad=sqrt(a)*.95;vec2 o2=vec2(cos(th),sin(th))*rad;float h=sqrt(1.-rad*rad)*rs;float dz=(D(uv+o2*rp*u_px)-D(uv))*.5;num+=clamp((dz+h)/(2.*h),0.,1.)*h;den+=h;}
     float occ=clamp((num/den-.5)*2.*u_p2,0.,1.);ao=min(ao,1.-occ);}return vec4(vec3(ao),1.);}
   vec3 ind=vec3(0.);for(int i=0;i<16;i++){float a=(float(i)+.5)/16.;float th=6.2832*a*5.+phi;vec2 q2=uv+vec2(cos(th),sin(th))*a*r*u_px;vec3 v=Q13_P(q2)-C;float vv=dot(v,v);vec3 vd=v/sqrt(vv+1e-9);
    float g=max(dot(n,vd),0.)*max(dot(Q13_N(q2),-vd),0.)/(1.+vv/(rw*rw));ind+=O(q2).rgb*g;}return vec4(ind/16.*10.,1.);`,
   `int m=int(u_p0+.5);float d0=D(uv);vec3 acc=vec3(0.);float w=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q2=uv+vec2(float(i),float(j))*u_px*max(1.,u_k);float g=exp(-abs(D(q2)-d0)*60.)*exp(-float(i*i+j*j)/8.);acc+=T(q2).rgb*g;w+=g;}acc/=w;
   vec3 o=O(uv).rgb;if(m<2)return vec4(u_p3>.5?acc:o*acc,1.);return vec4(u_p3>.5?clamp(acc*u_p2,0.,1.):clamp(o+acc*u_p2*.6,0.,1.),1.);`],
  'from the depth map (D: 1 = near; view position = (screen xy, 0.5 D)). SAO: McGuire, Mara & Luebke 2012 reference estimator, 24 spiral taps (7 turns, per-pixel rotation), A = max(0, 1 - intensity / r^6 x 5 / N x sum (r^2 - v.v)^3 max((v.n - bias) / (v.v + eps), 0)). MSVO: Unity PPv2 multi-scale volumetric obscurance, approx.: Loos & Sloan 2010 volumetric obscurance (occupied fraction of a sphere column) at radii r, r/2, r/4, r/8, combined with min. SSIL: Godot 4 screen-space indirect lighting, approx.: one-bounce gather of nearby colours weighted by both cosines and distance, image used as albedo. Depth-aware 5x5 bilateral blur');

f = add('Render');
f('q13_sslensflare','Screen Space Lens Flare (Unity)',[P('Intensity',0,4,1,.01),P('Threshold',0,1,.5,.01),P('Streaks',0,4,1,.01),P('Chromatic aberration',0,2,.5,.01)],
  [`vec3 c3=O(uv).rgb;float br=max(c3.r,max(c3.g,c3.b));return vec4(c3*max(br-u_p1,0.)/max(br,1e-4),1.);`, BH('8.'), BV('8.'),
   `vec3 o=O(uv).rgb;vec2 co=2.*uv-1.;vec2 dif=-co*dot(co,co)*u_p3*.25;
#define Q13_FL(UU) vec3(T(UU).r,T((UU)+dif/3.).g,T((UU)+dif*2./3.).b)
   float sc=pow(1.25,1.5);vec2 u1=(uv-.5)/sc+.5;vec2 u2=1.-u1;
   vec2 pw=vec2(2./sc*(uv.x-.5),2./sc*(uv.y-.5));float px1=clamp(length(pw)/1.41421,0.,1.);float py1=1.-(atan(pw.x,pw.y)+3.14159)/6.28318;vec2 u3=vec2(py1,1.-px1);
   float vx=clamp(pow(abs(2.*uv.x-1.),2.),0.,1.),vy=clamp(pow(abs(2.*uv.y-1.),2.),0.,1.);float vr=clamp(pow(vx+vy,2.),0.,1.);
   vec3 reg=(Q13_FL(u1)+Q13_FL(u2))*.1*vr+Q13_FL(u3)*.1*vx;
   vec3 stk=vec3(0.);float wt=0.;for(int i=-32;i<=32;i++){float t=float(i)/32.;float g=exp(-3.*abs(t));vec3 s3=O(uv+vec2(t*.3,0.)).rgb;float b=max(s3.r,max(s3.g,s3.b));stk+=s3*max(b-u_p1-.25*(1.-u_p1),0.)/max(b,1e-4)*g;wt+=g;}
   stk=stk/wt*6.*u_p2;return vec4(clamp(o+(reg*8.+stk)*u_p0,0.,1.),1.);`],
  'Unity SRP LensFlareScreenSpaceCommon.hlsl (URP defaults): bright pass of the image (Threshold) blurred as the bloom mip; regular flare = mip scaled about the centre by 1.25^1.5, reversed flare = the same mirrored, warped flare = polar-remapped mirror (scale 1/1.4), each x 0.1 and with URP\'s 3-tap chromatic aberration (diff = -uv x |uv|^2 x CA); regular + reversed masked by the ((2u-1)^2 + (2v-1)^2)^2 vignette, warped by the x vignette; streaks = horizontal anamorphic blur of the mip above 0.25 (stands in for the down/up-sample chain); added to the image (gains x8 flares / x6 streaks for display-referred input; streaks taken from the full-resolution bright pass)');

f = add('Edges');
// ImageMagick hit-and-miss kernel sets, 3x3 codes 0 = background, 1 = foreground, 2 = don't care (rows top to bottom)
const Q13_HMK = (() => {
  const flop = k => [0,1,2].flatMap(r => [2,1,0].map(cc => k[r*3+cc]));
  const flip = k => [2,1,0].flatMap(r => [0,1,2].map(cc => k[r*3+cc]));
  const mirror = k => [k, flop(k), flip(flop(k)), flip(k)];
  const A = [0,0,0, 0,2,1, 1,1,2], B = [0,0,1, 0,2,1, 0,1,2];
  return [...mirror(A), ...mirror(B)].flat().join(',');
})();
f('q13_mg_hmt','ImageMagick Hit-and-Miss Kernels (Peaks / Ridges / Diagonals)',[S('Kernel',['Peaks','Ridges','Diagonals']),P('Peaks inner radius',0,8,0,.05,'px'),P('Peaks outer radius',0,9,0,.05,'px'),S('Output',['Result x4','Result','Over image'])],
  `int m=int(u_p0+.5);vec3 res=vec3(0.);vec3 cc=c.rgb;vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);
  if(m==0){float r1=u_p1,r2=u_p2;float l1,l2;if(r2<=0.&&r1<=0.){l1=7.;l2=11.;}else{l1=min(r1,r2);l2=max(r1,r2);l1=floor(l1*l1);l2=floor(l2*l2);}
   vec3 bg=vec3(0.);float ext=ceil(sqrt(l2));for(int j=-9;j<=9;j++)for(int i=-9;i<=9;i++){if(abs(float(i))>ext||abs(float(j))>ext)continue;float rr=float(i*i+j*j);if(rr>l1&&rr<=l2)bg=max(bg,T(uv+vec2(float(i),float(j))*u_px).rgb);}
   res=max(cc-bg,0.);}
  else if(m==1){res=max(max(cc-max(T(uv-ex).rgb,T(uv+ex).rgb),cc-max(T(uv-ey).rgb,T(uv+ey).rgb)),0.);}
  else{int K[72]=int[72](${Q13_HMK});vec3 nb[9];for(int r=0;r<3;r++)for(int q2=0;q2<3;q2++)nb[r*3+q2]=T(uv+vec2(float(q2-1),float(1-r))*u_px).rgb;
   for(int k=0;k<8;k++){vec3 fg=vec3(1.),bg=vec3(0.);for(int i=0;i<9;i++){int code=K[k*9+i];if(code==1)fg=min(fg,nb[i]);else if(code==0)bg=max(bg,nb[i]);}res=max(res,max(fg-bg,0.));}}
  int ou=int(u_p3+.5);if(ou==2)return vec4(mix(cc*.5,vec3(1.,.25,.15),clamp(luma(res)*4.,0.,1.)),1.);return vec4(clamp(res*(ou==0?4.:1.),0.,1.),1.);`,
  'ImageMagick -morphology HitAndMiss on grey levels, per channel: min of the foreground neighbours minus max of the background neighbours, clipped at 0, union (Lighten) over the kernel set. Peaks (default 0,0 = 7x7 ring 7 < r^2 <= 11; or inner,outer radii): centre foreground, ring background. Ridges (Ridges:1): "3x1: 0,1,0" and its 90 degree rotation. Diagonals: "3: 0,0,0 0,-,1 1,1,-" and "3: 0,0,1 0,-,1 0,1,-" with mirror expansion (8 kernels)');

f('q13_mg_morph2','ImageMagick Morphology: Smooth / ErodeIntensity / DilateIntensity',[S('Method',['Smooth (open then close)','ErodeIntensity','DilateIntensity']),S('Kernel',['Diamond','Square','Disk','Plus']),P('Radius',1,8,2,1,'px')],
  [0,1,2,3].map(k => `int m=int(u_p0+.5);int ks=int(u_p1+.5);float rr=max(floor(R(u_p2)+.5),1.);
#define Q13_IN(II,JJ) (ks==0?abs(II)+abs(JJ)<=rr:ks==1?true:ks==2?(II)*(II)+(JJ)*(JJ)<=(rr+.5)*(rr+.5):((II)==0.||(JJ)==0.))
   ${k === 0 ? `if(m>0){float best=m==1?2.:-1.;vec3 bc=O(uv).rgb;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){float fi=float(i),fj=float(j);if(abs(fi)>rr||abs(fj)>rr||!Q13_IN(fi,fj))continue;vec3 v=O(uv+vec2(fi,fj)*u_px).rgb;float l=luma(v);if(m==1?l<best:l>best){best=l;bc=v;}}return vec4(bc,1.);}` : `if(m>0)return T(uv);`}
   bool er=${k === 0 || k === 3 ? 'true' : 'false'};vec3 a=er?vec3(1.):vec3(0.);for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){float fi=float(i),fj=float(j);if(abs(fi)>rr||abs(fj)>rr||!Q13_IN(fi,fj))continue;vec3 v=${k === 0 ? 'O' : 'T'}(uv+vec2(fi,fj)*u_px).rgb;a=er?min(a,v):max(a,v);}return vec4(a,1.);`),
  'ImageMagick -morphology: Smooth = Open then Close (erode, dilate, dilate, erode; per channel, flat kernel); ErodeIntensity / DilateIntensity copy the whole pixel whose intensity (Rec.709 luma) is lowest / highest inside the kernel, so no new colours appear. Kernels Diamond (|x|+|y| <= r), Square, Disk (x^2+y^2 <= (r+0.5)^2), Plus');

f('q13_pratt_edges','Pratt Edge Operators (Pixel Difference / Separated / Boxcar / Truncated Pyramid)',[S('Operator',['Pixel difference','Separated pixel difference','Boxcar (N x N)','Truncated pyramid (N x N)']),P('Size N',3,15,7,2),P('Gain',.25,8,1,.05),S('Output',['Magnitude','Row gradient','Column gradient','Direction (hue)'])],
  `int m=int(u_p0+.5);vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);float gr=0.,gc=0.;
  if(m==0){float f0=L(uv);gr=f0-L(uv+ex);gc=f0-L(uv+ey);}
  else if(m==1){gr=L(uv-ex)-L(uv+ex);gc=L(uv+ey)-L(uv-ey);}
  else{float h=floor(u_p1*.5);float ps=0.;for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){float fi=float(i),fj=float(j);if(abs(fi)>h||abs(fj)>h||i==0)continue;float w=m==2?1.:min(h+1.-abs(fi),h+1.-abs(fj));float sg=fi<0.?1.:-1.;
    gr+=sg*w*L(uv+vec2(fi,-fj)*u_px);gc+=sg*w*L(uv+vec2(fj,-fi)*u_px);if(fi<0.)ps+=w;}gr/=ps;gc/=ps;}
  gr*=u_p2;gc*=u_p2;float mg=sqrt(gr*gr+gc*gc);int ou=int(u_p3+.5);if(ou==1)return vec4(vec3(clamp(.5+gr,0.,1.)),1.);if(ou==2)return vec4(vec3(clamp(.5+gc,0.,1.)),1.);
  if(ou==3)return vec4(hsv2rgb(vec3(fract(atan(gc,gr)/6.28318),1.,clamp(mg*2.,0.,1.))),1.);return vec4(vec3(clamp(mg,0.,1.)),1.);`,
  'Pratt, Digital Image Processing (ch. 15, first-order derivative edge detection): pixel difference row [0 1 -1] / column [-1 1]^T; separated pixel difference row [1 0 -1] / column [-1 0 1]^T; boxcar N x N (each row 1..1 0 -1..-1, scale 1/(N (N-1)/2), 1/21 for 7x7); truncated pyramid N x N with weight min(h+1-|col|, h+1-|row|) (the 7x7 mask normalised by 1/34); column gradient = transposed mask; magnitude = sqrt(G_R^2 + G_C^2) on luminance');
