/* ================= magick: ImageMagick operators (round 10) ================= */
f = add('Noise');
f('mg_statistic','ImageMagick Statistic (Nonpeak / RMS / ...)',[S('Statistic',['Nonpeak','Root mean square','Gradient (max - min)','Maximum','Mean','Median','Minimum','Mode','Standard deviation','Contrast']),P('Width',1,9,3,1,'px'),P('Height',1,9,3,1,'px')],
  `int st=int(u_p0+.5);int W=int(u_p1+.5),H=int(u_p2+.5);int n=W*H;int md=n/2;vec3 res=vec3(0.);
  for(int ch=0;ch<3;ch++){float v[81];int k=0;float sm=0.,sq=0.,mn=9.,mx=-9.;
   for(int j=0;j<9;j++){if(j>=H)break;for(int i=0;i<9;i++){if(i>=W)break;
    float x=floor(T(uv+vec2(float(i-W/2),float(H/2-j))*u_k*u_px)[ch]*255.+.5)/255.;v[k]=x;k++;sm+=x;sq+=x*x;mn=min(mn,x);mx=max(mx,x);}}
   float fn=float(n);float o=0.;
   if(st==1)o=sqrt(sq/fn);else if(st==2)o=mx-mn;else if(st==3)o=mx;else if(st==4)o=sm/fn;else if(st==6)o=mn;
   else if(st==8)o=sqrt(max(sq/fn-(sm/fn)*(sm/fn),0.));else if(st==9)o=abs(mx-mn)/max(mx+mn,1e-6);
   else if(st==7){int bc=-1;o=v[0];for(int a=0;a<81;a++){if(a>=n)break;int eq=0;for(int b=0;b<81;b++){if(b>=n)break;if(abs(v[b]-v[a])<1e-4)eq++;}if(eq>bc||(eq==bc&&v[a]<o)){bc=eq;o=v[a];}}}
   else{float med=v[0];for(int a=0;a<81;a++){if(a>=n)break;int lt=0,eq=0;for(int b=0;b<81;b++){if(b>=n)break;if(v[b]<v[a]-1e-4)lt++;else if(abs(v[b]-v[a])<1e-4)eq++;}if(lt<=md&&md<lt+eq){med=v[a];break;}}
    o=med;if(st==0&&mx>mn+1e-4){if(med<=mn+1e-4){float nx=9.;for(int a=0;a<81;a++){if(a>=n)break;if(v[a]>med+1e-4)nx=min(nx,v[a]);}o=nx;}
     else if(med>=mx-1e-4){float pv=-9.;for(int a=0;a<81;a++){if(a>=n)break;if(v[a]<med-1e-4)pv=max(pv,v[a]);}o=pv;}}}
   res[ch]=o;}
  return vec4(res,1.);`,
  'ImageMagick -statistic type WxH, per channel on a W×H window (8-bit quantised values). Nonpeak = the median, except when the median is the window minimum (then the next higher distinct value) or the maximum (next lower) — as in IM GetNonpeakPixelList; RMS = sqrt(mean of squares); Contrast = |max-min|/(max+min)');

f = add('Edges');
const MG_THICK = k => `int op=int(u_p0+.5);if(op<2||${k}.>=u_p3)return T(uv);if(T(uv).r>.5)return T(uv);
  int K1[9]=int[9](1,1,-1,1,0,-1,1,-1,0);
  for(int kk=0;kk<8;kk++){bool ok=true;int rt=kk-(kk/4)*4;
   for(int i=0;i<9;i++){int rr=i/3,cc=i-rr*3;int kv=kk<4?K1[i]:K1[cc*3+rr];if(kv<0)continue;
    vec2 o=vec2(float(cc-1),float(1-rr));for(int q=0;q<3;q++){if(q>=rt)break;o=vec2(-o.y,o.x);}
    float s=step(.5,T(uv+o*u_px).r);if(abs(s-float(kv))>.5){ok=false;break;}}
   if(ok)return vec4(1.);}
  return T(uv);`;
f('mg_morph','ImageMagick Morphology: EdgeIn / EdgeOut / Thicken',[S('Method',['EdgeIn (internal gradient)','EdgeOut (external gradient)','Thicken: ConvexHull (light objects)','Thicken: ConvexHull (dark objects)']),S('Kernel',['Diamond','Square','Disk','Plus'],2),P('Radius',1,6,2,1,'px'),P('Iterations (thicken)',1,40,20,1)],
  [`int op=int(u_p0+.5);if(op>=2)return vec4(vec3(op==3?step(luma(c.rgb),.5):step(.5,luma(c.rgb))),1.);
   int ks=int(u_p1+.5);int r=int(u_p2+.5);float fr=float(r)+.5;vec3 mn=vec3(9.),mx=vec3(-9.);
   for(int j=-6;j<=6;j++){if(abs(j)>r)continue;for(int i=-6;i<=6;i++){if(abs(i)>r)continue;
    bool inK=ks==0?abs(i)+abs(j)<=r:ks==1?true:ks==2?float(i*i+j*j)<=fr*fr:(i==0||j==0);if(!inK)continue;
    vec3 s=T(uv+vec2(float(i),float(j))*u_k*u_px).rgb;mn=min(mn,s);mx=max(mx,s);}}
   return vec4(op==0?c.rgb-mn:mx-c.rgb,1.);`, ...Array.from({length:40},(_,k)=>MG_THICK(k)), `return u_p0>2.5?vec4(1.-T(uv).rgb,1.):T(uv);`],
  'ImageMagick -morphology: EdgeIn = image − erode, EdgeOut = dilate − image (per channel, flat Diamond/Square/Disk/Plus kernel); Thicken ConvexHull = hit-and-miss thickening of the binarised image (foreground = light or dark pixels, threshold 0.5) with IM\'s ConvexHull kernel "1,1,-;1,0,-;1,-,0" plus its transpose, 4 rotations each — the 8 kernels are applied together each iteration (IM applies them in sequence), up to 40 iterations');

f = add('Blur');
f('mg_blurkernels','ImageMagick Blur Kernels (Comet / Binomial / Adaptive)',[S('Kernel',['Comet (half Gaussian)','Binomial','Adaptive blur']),P('Width / radius',1,60,20,1,'px'),P('Sigma',.3,20,6,.1,'px'),P('Angle (comet)',0,360,0,1,'°')],
  `int m=int(u_p0+.5);
  if(m==0){float W=max(R(u_p1),1.);float sg=max(R(u_p2),.3);float a=radians(u_p3);vec2 d=vec2(cos(a),-sin(a));vec3 acc=vec3(0.);float ws=0.;float st=max(1.,W/64.);
   for(int i=0;i<64;i++){float x=float(i)*st;if(x>=W)break;float w=exp(-x*x/(2.*sg*sg));acc+=T(uv-d*x*u_px).rgb*w;ws+=w;}return vec4(acc/ws,1.);}
  if(m==1){int r=int(clamp(u_p1,1.,7.)+.5);float cf[15];cf[0]=1.;for(int k=1;k<15;k++)cf[k]=k<=2*r?cf[k-1]*float(2*r-k+1)/float(k):0.;
   vec3 acc=vec3(0.);float ws=0.;for(int j=0;j<15;j++){if(j>2*r)break;for(int i=0;i<15;i++){if(i>2*r)break;float w=cf[i]*cf[j];acc+=T(uv+vec2(float(i-r),float(j-r))*u_k*u_px).rgb*w;ws+=w;}}return vec4(acc/ws,1.);}
  float gm=0.;for(int j=0;j<10;j++)for(int i=0;i<10;i++)gm+=length(sobel((vec2(float(i),float(j))+.5)/10.));gm/=100.;
  float e=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)e+=length(sobel(uv+vec2(float(i),float(j))*2.*u_px));e=clamp(e/9./max(4.*gm,1e-4),0.,1.);
  float sg=max(R(u_p2)*(1.-e),.01);if(sg<.3)return c;float rad=min(2.*sg,R(u_p1));float st=max(1.,rad/12.);vec3 acc=vec3(0.);float ws=0.;
  for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){vec2 o=vec2(float(i),float(j))*st;if(length(o)>rad)continue;float w=exp(-dot(o,o)/(2.*sg*sg));acc+=T(uv+o*u_px).rgb*w;ws+=w;}
  return vec4(acc/ws,1.);`,
  'ImageMagick kernels: Comet:{width}x{sigma}+{angle} = one-sided 1-D Gaussian (the -motion-blur kernel), Binomial:{radius} = outer product of Pascal-triangle rows (radius ≤ 7), -adaptive-blur = Gaussian whose sigma shrinks toward 0 near edges (edge strength = local Sobel normalised by 4× the image mean; approx. of IM\'s edge-image kernel selection)');

f = add('Color');
f('mg_pointops','ImageMagick Point Ops (Blue Shift / Random Threshold / Modulus / Cycle)',[S('Operator',['-blue-shift','-random-threshold','-evaluate AddModulus','-evaluate SubtractModulus (wrap)','-cycle (colour cycling)']),P('Blue-shift factor',0,3,1.5,.01),P('Amount (threshold range / value / cycle)',0,1,.6,.01),P('Palette colours (cycle)',2,64,16,1)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;
  if(m==0){float lo=min(x.r,min(x.g,x.b)),hi=max(x.r,max(x.g,x.b));vec3 p=.5*(x+u_p1*lo);p=.5*(p+u_p1*hi);return vec4(p,1.);}
  if(m==1){float lo=.5-u_p2*.5,hi=.5+u_p2*.5;vec2 Q=floor(uv*u_res);vec3 th=lo+(hi-lo)*vec3(hash(Q),hash(Q+vec2(.37,0.)),hash(Q+vec2(0.,.71)));return vec4(vec3(greaterThan(x,th)),1.);}
  if(m==2)return vec4(mod(x+u_p2,1.),1.);
  if(m==3)return vec4(mod(x-u_p2+1.,1.),1.);
  float N=floor(u_p3+.5);float k=min(floor(luma(x)*N),N-1.);float kt=mod(k+floor(u_p2*N+.5),N);vec3 s=vec3(0.);float cn=0.;
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=O((vec2(float(i),float(j))+.5)/16.).rgb;if(min(floor(luma(q)*N),N-1.)==kt){s+=q;cn+=1.;}}
  return vec4(cn>0.?s/cn:vec3((kt+.5)/N),1.);`,
  'ImageMagick: -blue-shift factor (exact BlueShiftImage: each channel averaged with factor×min(RGB), then with factor×max(RGB) — a dim, desaturated moonlight look); -random-threshold low,high per channel (low/high = 0.5 ∓ Amount/2); -evaluate AddModulus/SubtractModulus value (wraps around); -cycle shifts a colour map by Amount×N entries — for true-colour input the map is N luminance bins whose colours are the bin means of a 16×16 sample grid (interpretation)', 1);

f = add('Frames');
f('mg_raise','ImageMagick Raise (3D Button Edge)',[P('Width',1,80,12,1,'px'),P('Height',1,80,12,1,'px'),S('Style',['Raised (-raise)','Sunken (+raise)'])],
  `vec2 p=vec2(uv.x,1.-uv.y)*u_res;float W=u_res.x,H=u_res.y;float rw=R(u_p0),rh=R(u_p1);
  float fg=u_p2<.5?1.:0.,bg=1.-fg;float HL=190./255.,AC=135./255.,SH=190./255.,TR=135./255.;float F=-1.,tg=0.;
  if(p.y<rh){if(p.x<p.y){F=HL;tg=fg;}else if(p.x<W-p.y){F=AC;tg=fg;}else{F=SH;tg=bg;}}
  else if(p.y<H-rh){if(p.x<rw){F=HL;tg=fg;}else if(p.x>=W-rw){F=SH;tg=bg;}}
  else{float yy=H-p.y;if(p.x<yy){F=HL;tg=fg;}else if(p.x<W-yy){F=TR;tg=bg;}else{F=SH;tg=bg;}}
  if(F<0.)return c;return vec4(c.rgb*F+tg*(1.-F),1.);`,
  'ImageMagick RaiseImage: top band blended toward white with the accentuate factor 135/255, left band with highlight 190/255, right band toward black with shadow 190/255, bottom band with trough 135/255; 45° mitred corners; +raise swaps light and dark');

f = add('Distort');
f('mg_arccylinder','ImageMagick Arc / Cylinder Distortions',[S('Distortion',['Arc','Cylinder2Plane','Plane2Cylinder']),P('Arc angle / FOV',1,360,120,1,'°'),P('Rotate (arc)',0,360,0,1,'°'),P('Inner radius (arc, 0 = auto)',0,.95,0,.01)],
  `int m=int(u_p0+.5);vec2 P=(uv-.5)*u_res;float W=u_res.x,H=u_res.y;
  if(m==0){float a=radians(max(u_p1,1.));float Ro=W/a+H*.5;float Ri=u_p3>0.?u_p3*Ro:Ro-H;Ri=clamp(Ri,0.,Ro-1.);float rt=radians(u_p2);
   vec2 bn=vec2(1e9),bx=vec2(-1e9);for(int i=0;i<=48;i++){float t=-a*.5+a*float(i)/48.+rt;vec2 d=vec2(sin(t),cos(t));bn=min(bn,min(d*Ro,d*Ri));bx=max(bx,max(d*Ro,d*Ri));}
   vec2 ex=bx-bn;float sc=max(ex.x/W,ex.y/H)*1.04;vec2 q=P*sc+(bn+bx)*.5;float r=length(q);float t=atan(q.x,q.y)-rt;t=mod(t+PI,2.*PI)-PI;
   float sx=.5+t/a,sy=(Ro-r)/(Ro-Ri);if(sx<0.||sx>1.||sy<0.||sy>1.)return vec4(0.,0.,0.,1.);return T(vec2(sx,1.-sy));}
  float fv=radians(clamp(u_p1,1.,179.));vec2 s;
  if(m==1){float r=W/fv;float sc=r*tan(fv*.5)/(W*.5);vec2 q=P*sc;float th=atan(q.x/r);s=vec2(r*th,q.y*r/sqrt(r*r+q.x*q.x));}
  else{float r=W/(2.*tan(fv*.5));float sc=r*fv*.5/(W*.5);vec2 q=P*sc;float th=q.x/r;s=vec2(r*tan(th),q.y/cos(th));}
  s=s/u_res+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.)return vec4(0.,0.,0.,1.);return T(s);`,
  'ImageMagick -distort Arc angle,rotate,top_radius,bottom_radius (top row on the outer radius, default radii top = W/angle + H/2, bottom = top − H; result fitted to the frame) and Cylinder2Plane / Plane2Cylinder fov (r = W/fov; plane x = r·tan θ, y scaled by 1/cos θ); IM enlarges the canvas, here the result is scaled to fit');

f('mg_controlwarp','ImageMagick Shepards / Polynomial Distortion',[S('Method',['Shepards','Polynomial order 1 (affine)','Polynomial order 1.5 (bilinear)','Polynomial order 2','Polynomial order 3']),P('Control point jitter',0,.2,.06,.005),P('Shepards power',.5,6,2,.1),S('Control grid',['3x3','4x4','5x5'],1)],
  `
#define MGB(tt,x0,y0) ((tt)==0?1.:(tt)==1?(x0):(tt)==2?(y0):(tt)==3?(x0)*(y0):(tt)==4?(x0)*(x0):(tt)==5?(y0)*(y0):(tt)==6?(x0)*(x0)*(x0):(tt)==7?(x0)*(x0)*(y0):(tt)==8?(x0)*(y0)*(y0):(y0)*(y0)*(y0))
  int m=int(u_p0+.5);int G=int(u_p3+.5)+3;if(m==4)G=max(G,4);vec2 sp[25],dp[25];int n=0;
  for(int j=0;j<5;j++)for(int i=0;i<5;i++){if(i>=G||j>=G)continue;vec2 g=vec2(float(i),float(j))/float(G-1);vec2 d=(vec2(hash(vec2(float(i),float(j))+.5),hash(vec2(float(j),float(i))+19.5))-.5)*2.*u_p1;sp[n]=g;dp[n]=g+d;n++;}
  vec2 s;
  if(m==0){vec2 sum=vec2(0.);float ws=0.;bool hit=false;for(int k=0;k<25;k++){if(k>=n)break;vec2 dd=(uv-dp[k])*u_res;float d2=dot(dd,dd);if(d2<1e-6){s=uv+sp[k]-dp[k];hit=true;break;}float w=pow(d2,-u_p2*.5);sum+=w*(sp[k]-dp[k]);ws+=w;}if(!hit)s=uv+sum/ws;}
  else{int nt=m==1?3:m==2?4:m==3?6:10;float A[100];float bx[10],by[10];for(int a=0;a<100;a++)A[a]=0.;for(int a=0;a<10;a++){bx[a]=0.;by[a]=0.;}
   for(int k=0;k<25;k++){if(k>=n)break;vec2 q=dp[k]-.5;for(int a=0;a<10;a++){if(a>=nt)break;float fa=MGB(a,q.x,q.y);bx[a]+=fa*sp[k].x;by[a]+=fa*sp[k].y;for(int b=0;b<10;b++){if(b>=nt)break;A[a*10+b]+=fa*MGB(b,q.x,q.y);}}}
   for(int p=0;p<10;p++){if(p>=nt)break;float pv=A[p*10+p]+1e-7;for(int r2=0;r2<10;r2++){if(r2>=nt)break;if(r2==p)continue;float fm=A[r2*10+p]/pv;for(int c2=0;c2<10;c2++){if(c2>=nt)break;A[r2*10+c2]-=fm*A[p*10+c2];}bx[r2]-=fm*bx[p];by[r2]-=fm*by[p];}}
   vec2 q=uv-.5;s=vec2(0.);for(int a=0;a<10;a++){if(a>=nt)break;float fa=MGB(a,q.x,q.y)/(A[a*10+a]+1e-7);s+=vec2(bx[a],by[a])*fa;}}
  if(s.x<0.||s.x>1.||s.y<0.||s.y>1.)return vec4(0.,0.,0.,1.);return T(s);`,
  'ImageMagick -distort Shepards / Polynomial with control points = a G×G grid moved by seeded random jitter (press New random seed). Shepards: each output pixel takes the inverse-distance^power weighted mean of the control displacements (-define shepards:power); Polynomial: least-squares fit of the destination→source mapping with IM\'s term order (1, x, y, xy, x², y², x³, x²y, xy², y³)', 1);

f = add('Render');
f('mg_sparsecolor','ImageMagick Sparse Color',[S('Method',['Shepards','Inverse','Voronoi','Manhattan','Barycentric']),P('Points',3,64,16,1),P('Shepards power',.5,6,2,.1),S('Show points',['No','Yes'])],
  `int m=int(u_p0+.5);int N=int(u_p1+.5);vec2 pts[64];vec3 col[64];
  for(int k=0;k<64;k++){if(k>=N)break;vec2 q=.03+.94*vec2(hash(vec2(float(k),3.1)),hash(vec2(7.7,float(k))));pts[k]=q;col[k]=O(q).rgb;}
  vec3 o=vec3(0.);float mk=0.;
  if(m==4){float A[9];vec3 b[3];for(int a=0;a<9;a++)A[a]=0.;for(int a=0;a<3;a++)b[a]=vec3(0.);
   for(int k=0;k<64;k++){if(k>=N)break;vec3 ph=vec3(1.,pts[k]-.5);for(int a=0;a<3;a++){b[a]+=ph[a]*col[k];for(int bb=0;bb<3;bb++)A[a*3+bb]+=ph[a]*ph[bb];}}
   for(int p=0;p<3;p++){float pv=A[p*3+p]+1e-7;for(int r2=0;r2<3;r2++){if(r2==p)continue;float fm=A[r2*3+p]/pv;for(int c2=0;c2<3;c2++)A[r2*3+c2]-=fm*A[p*3+c2];b[r2]-=fm*b[p];}}
   vec3 ph=vec3(1.,uv-.5);for(int a=0;a<3;a++)o+=b[a]/(A[a*3+a]+1e-7)*ph[a];}
  else{float ws=0.,bd=1e9;for(int k=0;k<64;k++){if(k>=N)break;vec2 dd=(uv-pts[k])*u_res;
    if(m<=1){float d2=max(dot(dd,dd),1e-6);float w=pow(d2,-(m==0?u_p2:1.)*.5);o+=w*col[k];ws+=w;}
    else{float d=m==2?length(dd):abs(dd.x)+abs(dd.y);if(d<bd){bd=d;o=col[k];}}}
   if(m<=1)o/=ws;}
  if(u_p3>.5)for(int k=0;k<64;k++){if(k>=N)break;float d=length((uv-pts[k])*u_res)/u_k;mk=max(mk,1.-smoothstep(1.,2.,abs(d-4.)));}
  return vec4(mix(clamp(o,0.,1.),vec3(1.)-step(.5,luma(o)),mk),1.);`,
  'ImageMagick -sparse-color with N seeded points whose colours are sampled from the image: Shepards (inverse distance^power, -define shepards:power), Inverse (power 1), Voronoi (nearest, Euclidean), Manhattan (nearest, L1), Barycentric (least-squares affine colour gradient through all points)', 1);

f = add('Noise');
f('mg_noise','ImageMagick +noise (incl. Laplacian)',[S('Type',['Uniform','Gaussian','Multiplicative','Impulse','Laplacian','Poisson','Random']),P('Attenuate',0,10,1,.05),S('Channels',['Independent per channel','Same for all (luma noise)'])],
  `int m=int(u_p0+.5);float at=u_p1;vec2 Q=floor(uv*u_res);vec3 o=vec3(0.);
  for(int ch=0;ch<3;ch++){vec2 sd=Q+vec2(u_p2>.5?0.:float(ch)*.1234,0.);float a=hash(sd),b=hash(sd+vec2(.5,.25));float p=c[ch];float nz=p;
   if(m==0)nz=p+at/64.*(a-.5);
   else if(m==1){float g=sqrt(-2.*log(max(a,1e-7)));nz=p+sqrt(max(p,0.))/256.*at/64.*g*cos(6.2832*b)+at*5./64.*g*sin(6.2832*b);}
   else if(m==2){float g=sqrt(-2.*log(max(a,1e-7)));nz=p+p*at*.5*g*cos(6.2832*b)*.5;}
   else if(m==3)nz=a<at*.05?0.:(a>=1.-at*.05?1.:p);
   else if(m==4)nz=a<=.5?(a<1e-7?0.:p+at*5./128.*log(2.*a)):(1.-a<1e-7?1.:p-at*5./128.*log(2.*(1.-a)));
   else if(m==5){float sp=12.5*at;float lim=exp(-sp*p);float al=a;float i=0.;for(int k=0;k<300;k++){if(al<=lim)break;al*=hash(sd+vec2(float(k)*.37+1.,.9));i+=1.;}nz=i/max(sp,1e-4);}
   else nz=at*a;
   o[ch]=nz;}
  return vec4(o,1.);`,
  'ImageMagick GenerateDifferentialNoise with its constants (× attenuate): uniform 1/64, Gaussian σ 1/64·√p + τ 5/64, multiplicative ½, impulse 1/10, Laplacian 5/128 (p + σ·ln 2α, mirrored), Poisson 12.5 (Knuth product method), random 1 (replaces the pixel)', 1);
