/* ================= magick: textbook classics (Gonzalez & Woods / Szeliski / Russ ..., round 10) ================= */
f = add('Tone');
f('tb_slicing','Intensity Slicing & Pseudocolor (G&W)',[S('Mode',['Level slice: range white, rest black','Level slice: range white, rest unchanged','Pseudocolor: N intensity slices','Pseudocolor: range yellow, rest gray']),P('Range low A',0,1,.55,.01),P('Range high B',0,1,.8,.01),P('Slices N',2,16,8,1)],
  `int m=int(u_p0+.5);float l=luma(c.rgb);float A=min(u_p1,u_p2),B=max(u_p1,u_p2);bool inR=l>=A&&l<=B;
  if(m==0)return vec4(vec3(inR?1.:0.),1.);
  if(m==1)return vec4(vec3(inR?1.:l),1.);
  if(m==3)return vec4(inR?vec3(1.,1.,0.):vec3(l),1.);
  float N=floor(u_p3+.5);float k=min(floor(l*N),N-1.);return vec4(hsv2rgb(vec3(.7*(1.-k/(N-1.)),.85,.95)),1.);`,
  'Gonzalez & Woods §3.2.4 intensity-level slicing (binary or preserving the rest) and §6.3.1 intensity slicing pseudocolour (N equal slices of the gray scale coloured blue→red, or one slice highlighted in yellow on gray, as in the weld example); input reduced to Rec.709 luma');

f('tb_piecewise','Piecewise-Linear Contrast Stretch (G&W)',[P('r1',0,1,.3,.01),P('s1',0,1,.1,.01),P('r2',0,1,.7,.01),P('s2',0,1,.9,.01)],
  `vec3 x=c.rgb;float r1=u_p0,s1=u_p1,r2=max(u_p2,u_p0),s2=u_p3;
  vec3 a=s1*x/max(r1,1e-5);vec3 b=s1+(x-r1)*(s2-s1)/max(r2-r1,1e-5);vec3 d=s2+(x-r2)*(1.-s2)/max(1.-r2,1e-5);
  return vec4(mix(mix(a,b,step(r1,x)),d,step(r2+1e-6,x)),1.);`,
  'Gonzalez & Woods §3.2.4 contrast stretching through (0,0)-(r1,s1)-(r2,s2)-(1,1), per channel; r1 = r2, s1 = 0, s2 = 1 gives thresholding');

f = add('Color');
f('tb_colorslice','Color Slicing / chromahold',[S('Mode',['Color slice: cube (G&W)','Color slice: sphere (G&W)','chromahold (FFmpeg)']),P('Target hue',0,360,30,1,'°'),P('Width W / radius / similarity',.01,1,.3,.01),P('Blend (chromahold)',0,1,.1,.01)],
  `int m=int(u_p0+.5);float h=u_p1/360.;vec3 s=vec3(0.);float n=0.;
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=O((vec2(float(i),float(j))+.5)/16.).rgb;vec3 hv=rgb2hsv(q);if(abs(fract(hv.x-h+.5)-.5)<20./360.&&hv.y>.2&&hv.z>.1){s+=q;n+=1.;}}
  vec3 a=n>0.?s/n:hsv2rgb(vec3(h,.7,.8));vec3 x=c.rgb;float W=u_p2;
  if(m==0)return vec4(any(greaterThan(abs(x-a),vec3(W*.5)))?vec3(.5):x,1.);
  if(m==1)return vec4(distance(x,a)>W?vec3(.5):x,1.);
  float Y=dot(x,vec3(.299,.587,.114));vec2 uv2=vec2(dot(x,vec3(-.168736,-.331264,.5)),dot(x,vec3(.5,-.418688,-.081312)));vec2 ca=vec2(dot(a,vec3(-.168736,-.331264,.5)),dot(a,vec3(.5,-.418688,-.081312)));
  vec2 d=uv2-ca;float df=sqrt(dot(d,d)*.5);float k=u_p3>1e-4?1.-clamp((df-W)/u_p3,0.,1.):(df>W?0.:1.);uv2*=k;
  return vec4(Y+1.402*uv2.y,Y-.344136*uv2.x-.714136*uv2.y,Y+1.772*uv2.x,1.);`,
  'Gonzalez & Woods §6.5.2 colour slicing: pixels outside a cube of width W (or sphere of radius R0) around the prototype colour become neutral gray; FFmpeg chromahold: chroma (BT.601 Cb/Cr) is removed where sqrt((du²+dv²)/2) > similarity, with a linear blend band. Prototype colour = mean of the image pixels within ±20° of the target hue (16×16 sample grid), else a mid-saturated hue');

f = add('Sharpen');
f('tb_sharpen','Highboost & Cubic Unsharp Masking',[S('Method',['Highboost (Gaussian mask)','Highboost (Laplacian composite)','Cubic unsharp masking (Ramponi)']),P('Amount k',0,5,1.5,.05),P('Radius (Gaussian)',.5,10,2,.1,'px')],
  [BH('u_p2'),`int m=int(u_p0+.5);vec3 o=O(uv).rgb;float k=u_p1;vec2 e=vec2(u_k*u_px.x,0.),e2=vec2(0.,u_k*u_px.y);
  if(m==0){vec3 b=blur1d(u_tex,uv,vec2(0.,1.),R(u_p2)).rgb;return vec4(o+k*(o-b),1.);}
  if(m==1){vec3 lap=-8.*o;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;lap+=O(uv+float(i)*e+float(j)*e2).rgb;}return vec4(o-k*.5*lap,1.);}
  vec3 xl=O(uv-e).rgb,xr=O(uv+e).rgb,xu=O(uv+e2).rgb,xd=O(uv-e2).rgb;
  vec3 z=(xl-xr)*(xl-xr)*(2.*o-xl-xr)+(xu-xd)*(xu-xd)*(2.*o-xu-xd);return vec4(o+k*12.*z,1.);`],
  'Gonzalez & Woods §3.6: highboost g = f + k·(f − Gaussian blur) (k > 1) and the Laplacian composite g = f − (k/2)·∇²f (8-neighbour); Ramponi 1998 cubic unsharp masking: the Laplacian term in each direction is weighted by the squared local difference (x₋ − x₊)², so noise in flat areas is not amplified (λ = 12k for 0..1 data)');

f = add('Noise');
f('tb_median','Median Variants & Adaptive Filters (G&W)',[S('Method',['Hybrid median (+ / x)','Truncated median (Davies)','Adaptive median (G&W)','Adaptive local noise reduction (G&W)']),P('Window radius',1,3,1,1,'px'),P('Max radius S_max (adaptive median)',1,3,3,1,'px'),P('Noise variance (0 = auto)',0,.03,0,.0005)],
  `
#define TBMED(arr,nn,res) {res=arr[0];for(int a_=0;a_<49;a_++){if(a_>=(nn))break;int lt_=0,eq_=0;for(int b_=0;b_<49;b_++){if(b_>=(nn))break;if(arr[b_]<arr[a_])lt_++;else if(arr[b_]==arr[a_])eq_++;}if(lt_<=(nn)/2&&(nn)/2<lt_+eq_){res=arr[a_];break;}}}
  int m=int(u_p0+.5);int r=int(u_p1+.5);vec2 e=u_k*u_px;vec3 res=c.rgb;
  if(m==3){float N=float((2*r+1)*(2*r+1));vec3 s=vec3(0.),q=vec3(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*e).rgb;s+=v;q+=v*v;}
   vec3 mL=s/N,vL=max(q/N-mL*mL,0.);float vn=u_p3;
   if(vn<=0.){float lv[100];for(int j=0;j<10;j++)for(int i=0;i<10;i++){vec2 g=(vec2(float(i),float(j))+.5)/10.;float a=0.,b=0.;for(int y2=-1;y2<=1;y2++)for(int x2=-1;x2<=1;x2++){float l=L(g+vec2(float(x2),float(y2))*e);a+=l;b+=l*l;}lv[j*10+i]=max(b/9.-a*a/81.,0.);}
    for(int a=0;a<100;a++){int lt=0;for(int b=0;b<100;b++)if(lv[b]<lv[a]||(lv[b]==lv[a]&&b<a))lt++;if(lt==10){vn=lv[a]*1.4;break;}}}
   vec3 rt=min(vec3(vn)/max(vL,1e-8),1.);return vec4(c.rgb-rt*(c.rgb-mL),1.);}
  for(int ch=0;ch<3;ch++){float z=c[ch];float v[49];float md=z;
   if(m==0){float pl[13],xs[13];int n=0;pl[0]=z;xs[0]=z;for(int i=1;i<=3;i++){if(i>r)break;float fi=float(i);
     pl[4*i-3]=T(uv+vec2(fi,0.)*e)[ch];pl[4*i-2]=T(uv-vec2(fi,0.)*e)[ch];pl[4*i-1]=T(uv+vec2(0.,fi)*e)[ch];pl[4*i]=T(uv-vec2(0.,fi)*e)[ch];
     xs[4*i-3]=T(uv+vec2(fi,fi)*e)[ch];xs[4*i-2]=T(uv-vec2(fi,fi)*e)[ch];xs[4*i-1]=T(uv+vec2(fi,-fi)*e)[ch];xs[4*i]=T(uv+vec2(-fi,fi)*e)[ch];}
    n=4*r+1;float m1,m2;TBMED(pl,n,m1)TBMED(xs,n,m2)md=max(min(m1,m2),min(max(m1,m2),z));}
   else if(m==1){int n=0;float mn=9.,mx=-9.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>r||abs(j)>r)continue;float q=T(uv+vec2(float(i),float(j))*e)[ch];v[n]=q;n++;mn=min(mn,q);mx=max(mx,q);}
    float me;TBMED(v,n,me)float w[49];int k=0;bool up=(mx-me)>(me-mn);float lim=up?me+(me-mn):me-(mx-me);
    for(int a=0;a<49;a++){if(a>=n)break;if(up?v[a]<=lim:v[a]>=lim){w[k]=v[a];k++;}}TBMED(w,k,md)}
   else{int sm=int(u_p2+.5);bool done=false;for(int rr=1;rr<=3;rr++){if(rr>sm)break;int n=0;float mn=9.,mx=-9.;
     for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;float q=T(uv+vec2(float(i),float(j))*e)[ch];v[n]=q;n++;mn=min(mn,q);mx=max(mx,q);}
     float me;TBMED(v,n,me)md=me;if(me>mn&&me<mx){md=(z>mn&&z<mx)?z:me;done=true;break;}}}
   res[ch]=md;}
  return vec4(res,1.);`,
  'Hybrid median (Nieminen 1987): median of {median of the + arms, median of the × arms, centre}; truncated median (Davies 1988): the distribution is cut on the far side of the median at the same distance as the near extreme, then the median of the rest (moves toward the mode); adaptive median (G&W §5.3, stages A/B, window grows to S_max); adaptive local noise reduction (G&W eq. 5.3-12) f = g − (σ²η/σ²L)(g − mL), ratio ≤ 1, σ²η auto = 10th-percentile 3×3 local variance of a 10×10 sample grid');

f = add('Repair');
const TB_ES = k => `if(${k}.>=u_p3)return T(uv);int m=int(u_p0+.5);int r=int(u_p1+.5);vec2 e=u_k*u_px;vec3 me=T(uv).rgb;
  if(m<=1){vec3 w[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)w[(j+2)*5+i+2]=T(uv+vec2(float(i),float(j))*e).rgb;
   float bv=1e9;vec3 bm=me;int NR=m==0?9:5;
   for(int R_=0;R_<9;R_++){if(R_>=NR)break;vec3 s=vec3(0.),q=vec3(0.);float n=0.;
    for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){bool inR;
     if(m==1){vec2 cc=R_==0?vec2(0.):vec2(R_==1||R_==4?1.:-1.,R_<=2?1.:-1.);inR=abs(float(i)-cc.x)<=1.&&abs(float(j)-cc.y)<=1.;}
     else if(R_==0)inR=abs(i)<=1&&abs(j)<=1;
     else{int qq=(R_-1)/2;bool dg=R_-1-qq*2==1;ivec2 p=ivec2(i,j);for(int t_=0;t_<3;t_++){if(t_>=qq)break;p=ivec2(p.y,-p.x);}
      inR=(p.x==0&&p.y==0)||(dg?((p.x==1&&p.y==0)||(p.x==0&&p.y==1)||(p.x>=1&&p.y>=1)):(abs(p.x)<=1&&p.y>=1));}
     if(!inR)continue;vec3 v=w[(j+2)*5+i+2];s+=v;q+=v*v;n+=1.;}
    vec3 mu=s/n;vec3 va=q/n-mu*mu;float tv=va.r+va.g+va.b;if(tv<bv){bv=tv;bm=mu;}}
   return vec4(bm,1.);}
  if(m==2){vec3 sw=vec3(0.),sv=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;vec3 v=T(uv+vec2(float(i),float(j))*e).rgb;vec3 w=1./max(abs(v-me)*255.,.5);sw+=w;sv+=w*v;}return vec4(.5*me+.5*sv/sw,1.);}
  if(m==3){int rr=min(r,3);int n=(2*rr+1)*(2*rr+1);int K=1+int(u_p2*float(n-1)+.5);float lc=luma(me);float d[49];vec3 v[49];int k2=0;
   for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;vec3 q=T(uv+vec2(float(i),float(j))*e).rgb;v[k2]=q;d[k2]=abs(luma(q)-lc);k2++;}
   vec3 s=vec3(0.);for(int a=0;a<49;a++){if(a>=n)break;int rk=0;for(int b=0;b<49;b++){if(b>=n)break;if(d[b]<d[a]||(d[b]==d[a]&&b<a))rk++;}if(rk<K)s+=v[a];}return vec4(s/float(K),1.);}
  if(m==4){int rr=min(r,3);float ss=float(rr)*.6+.4;float sr=.02+u_p2*.16;float gc=0.;for(int y2=-1;y2<=1;y2++)for(int x2=-1;x2<=1;x2++)gc+=L(uv+vec2(float(x2),float(y2))*e);gc/=9.;
   vec3 acc=vec3(0.);float ws=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;vec2 q=uv+vec2(float(i),float(j))*e;float g=0.;
    for(int y2=-1;y2<=1;y2++)for(int x2=-1;x2<=1;x2++)g+=L(q+vec2(float(x2),float(y2))*e);g/=9.;float w=exp(-float(i*i+j*j)/(2.*ss*ss)-(g-gc)*(g-gc)/(2.*sr*sr));acc+=T(q).rgb*w;ws+=w;}
   return vec4(acc/ws,1.);}
  float N=float((2*r+1)*(2*r+1));vec3 s=vec3(0.),q=vec3(0.);for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){if(abs(i)>r||abs(j)>r)continue;vec3 v=T(uv+vec2(float(i),float(j))*e).rgb;s+=v;q+=v*v;}
  vec3 mu=s/N,va=max(q/N-mu*mu,0.);float sg=128.*pow(u_p2/.5,2.)/65025.;return vec4((sg*mu+va*me)/(va+sg),1.);`;
f('tb_edgesmooth','Edge-Preserving Smoothing (Nagao / Tomita-Tsuji / GIW / KNN / sab / yaepblur)',[S('Method',['Nagao-Matsuyama (9 regions)','Tomita-Tsuji (5 squares)','Gradient inverse weighted (Wang)','K-nearest-neighbour (Davis-Rosenfeld)','Shape-adaptive blur (sab, approx.)','yaepblur (FFmpeg)']),P('Radius (KNN / sab / yaep)',1,6,3,1,'px'),P('K fraction / strength',0,1,.5,.01),P('Iterations',1,4,2,1)],
  [0,1,2,3].map(TB_ES),
  'Nagao & Matsuyama 1979 (centre 3×3 + 4 pentagonal + 4 hexagonal 7-pixel regions in 5×5: mean of the least-variance region); Tomita & Tsuji 1977 (five 3×3 squares); Wang, Vagnucci & Li 1981 gradient inverse weighting (weights 1/|Δ| in 8-bit units, centre 1/2); Davis & Rosenfeld 1978 K-nearest-neighbour mean (K = 1 + fraction·(n−1), by luma); FFmpeg sab ≈ joint bilateral with a 3×3-prefiltered luma guide (approx.); FFmpeg yaepblur: (σ·mean + var·x)/(var + σ), σ = 128·(2·strength)² in 8-bit² units; all iterable');

const TB_EAW = k => `if(${k}.>=u_p0)return T(uv);float st=${1 << k}.*u_k;float sc=u_p1*pow(2.,-${k}.);vec3 me=T(uv).rgb;float hk[5]=float[5](.0625,.25,.375,.25,.0625);vec3 acc=vec3(0.);float ws=0.;
  for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec3 q=T(uv+vec2(float(i-2),float(j-2))*st*u_px).rgb;vec3 d=q-me;float w=hk[i]*hk[j]*exp(-dot(d,d)/(sc*sc));acc+=q*w;ws+=w;}return vec4(acc/ws,1.);`;
f('tb_eaw','Edge-Avoiding A-Trous Wavelets (Dammertz)',[P('Iterations',1,5,4,1),P('Color sigma',.01,1,.15,.01),S('Output',['Smoothed','Detail (x4)','Detail enhanced'])],
  [...[0,1,2,3,4].map(TB_EAW),`vec3 o=O(uv).rgb,s=T(uv).rgb;int m=int(u_p2+.5);return vec4(m==0?s:m==1?.5+(o-s)*4.:o+(o-s)*1.5,1.);`],
  'Dammertz et al. 2010: à-trous B3 5×5 kernel with hole spacing 1, 2, 4, 8, 16 px, each tap weighted by exp(−|Δcolour|²/σ²) with σ halved per level (colour edge-stopping only, no normal/position buffers for a single image)');

f = add('Blur');
f('tb_bilateralgrid','Bilateral Grid (Chen-Paris-Durand)',[P('Cell size (spatial)',4,32,16,1,'px'),P('Range bins',2,16,8,1),S('Output',['Filtered (sliced)','Grid view'])],
  [`float cs=max(floor(R(u_p0)+.5),4.);float Z=floor(u_p1+.5);vec2 Gd=floor(u_res/cs)+2.;Z=max(min(Z,floor(u_res.x/Gd.x)),2.);
   vec2 t=floor(uv*u_res);float k=floor(t.x/Gd.x);float i=t.x-k*Gd.x,j=t.y;if(k>=Z||j>=Gd.y)return vec4(0.);
   vec3 s=vec3(0.);float n=0.,tot=0.;float st=max(1.,floor(cs/16.));
   for(int b=0;b<32;b++)for(int a=0;a<32;a++){vec2 o=vec2(float(a),float(b))*st;if(o.x>=cs||o.y>=cs)continue;vec2 p=vec2(i,j)*cs-floor(cs*.5)+o+.5;
    if(p.x<0.||p.y<0.||p.x>u_res.x||p.y>u_res.y)continue;tot+=1.;vec3 q=O(p/u_res).rgb;if(floor(luma(q)*(Z-1.)+.5)==k){s+=q;n+=1.;}}
   return vec4(s/max(tot,1.),n/max(tot,1.));`,
   `float cs=max(floor(R(u_p0)+.5),4.);float Z=floor(u_p1+.5);vec2 Gd=floor(u_res/cs)+2.;Z=max(min(Z,floor(u_res.x/Gd.x)),2.);
   vec2 t=floor(uv*u_res);float k=floor(t.x/Gd.x);float i=t.x-k*Gd.x,j=t.y;if(k>=Z||j>=Gd.y)return vec4(0.);vec4 acc=vec4(0.);
   for(int dz=-1;dz<=1;dz++)for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){float ni=i+float(dx),nj=j+float(dy),nk=k+float(dz);if(ni<0.||nj<0.||nk<0.||ni>=Gd.x||nj>=Gd.y||nk>=Z)continue;
    float w=float((2-abs(dx))*(2-abs(dy))*(2-abs(dz)));acc+=texelFetch(u_tex,ivec2(int(nk*Gd.x+ni),int(nj)),0)*w;}
   return acc/64.;`,
   `float cs=max(floor(R(u_p0)+.5),4.);float Z=floor(u_p1+.5);vec2 Gd=floor(u_res/cs)+2.;Z=max(min(Z,floor(u_res.x/Gd.x)),2.);vec3 o=O(uv).rgb;
   if(u_p2>.5){vec4 g=texelFetch(u_tex,ivec2(uv*vec2(Gd.x*Z,Gd.y)),0);return vec4(g.a>1e-4?g.rgb/g.a:vec3(0.),1.);}
   vec2 g=uv*u_res/cs;vec2 g0=floor(g),fg=g-g0;float gz=luma(o)*(Z-1.);float z0=min(floor(gz),Z-2.);float fz=gz-z0;vec4 acc=vec4(0.);
   for(int c2=0;c2<8;c2++){float ox=float(c2-(c2/2)*2),oy=float((c2/2)-(c2/4)*2),oz=float(c2/4);float w=(ox>.5?fg.x:1.-fg.x)*(oy>.5?fg.y:1.-fg.y)*(oz>.5?fz:1.-fz);
    float ni=min(g0.x+ox,Gd.x-1.),nj=min(g0.y+oy,Gd.y-1.);acc+=texelFetch(u_tex,ivec2(int((z0+oz)*Gd.x+ni),int(nj)),0)*w;}
   return vec4(acc.a>1e-5?acc.rgb/acc.a:o,1.);`],
  'Chen, Paris & Durand 2007: splat colour + weight into a 3-D grid (cell × cell pixels × luma bin, nearest-bin), blur the grid with [1 2 1]³, slice with trilinear interpolation at (x, y, luma) and divide by the weight; spatial sigma ≈ cell size, range sigma ≈ 1/bins');

f = add('Edges');
f('tb_dizenzo','Di Zenzo Color Gradient',[S('Output',['Magnitude','Direction (hue) x magnitude','Colour-only edges (vs luma gradient)']),P('Gain',.5,10,2,.1),P('Tensor smoothing',0,3,0,1,'px')],
  `int m=int(u_p0+.5);int rs=int(u_p2+.5);vec2 e=u_k*u_px;float gxx=0.,gyy=0.,gxy=0.,ll=0.,nn=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rs||abs(j)>rs)continue;vec2 q=uv+vec2(float(i),float(j))*e;
   vec3 a=T(q+vec2(-e.x,e.y)).rgb,b=T(q+vec2(0.,e.y)).rgb,cc=T(q+e).rgb,d=T(q-vec2(e.x,0.)).rgb,f2=T(q+vec2(e.x,0.)).rgb,g=T(q-e).rgb,h=T(q-vec2(0.,e.y)).rgb,k=T(q+vec2(e.x,-e.y)).rgb;
   vec3 gx=(cc+2.*f2+k-a-2.*d-g)*.25,gy=(a+2.*b+cc-g-2.*h-k)*.25;gxx+=dot(gx,gx);gyy+=dot(gy,gy);gxy+=dot(gx,gy);vec2 lg=vec2(luma(gx),luma(gy));ll+=dot(lg,lg);nn+=1.;}
  gxx/=nn;gyy/=nn;gxy/=nn;ll/=nn;float lam=.5*(gxx+gyy+sqrt((gxx-gyy)*(gxx-gyy)+4.*gxy*gxy));float mg=sqrt(lam)*u_p1;
  if(m==0)return vec4(vec3(clamp(mg,0.,1.)),1.);
  if(m==1){float th=.5*atan(2.*gxy,gxx-gyy);return vec4(hsv2rgb(vec3(th/PI+.5,.9,clamp(mg,0.,1.))),1.);}
  return vec4(vec3(clamp((sqrt(lam)-sqrt(3.*ll))*u_p1*2.,0.,1.)),1.);`,
  'Di Zenzo 1986: 2×2 colour structure tensor from per-channel Sobel derivatives, gradient magnitude = √λmax, direction = ½·atan2(2gxy, gxx − gyy) (optionally box-smoothed tensor); third output shows where the colour gradient exceeds the gradient of luma alone (isoluminant edges)');

f = add('Analysis');
f('tb_gist','GIST Descriptor (Oliva-Torralba, glyphs)',[S('Grid',['4x4','8x8']),P('Gain',1,60,12,.5),S('Output',['Glyphs','Glyphs over image'])],
  `float G=u_p0<.5?4.:8.;vec2 cell=floor(uv*G);vec2 lc=fract(uv*G)-.5;vec2 cuv=(cell+.5)/G;vec2 q=lc*2.;float rho=length(q);vec3 bgc=u_p2>.5?O(uv).rgb*.35:vec3(.04);
  float bd=max(abs(lc.x),abs(lc.y));if(bd>.485)return vec4(vec3(.25),1.);if(rho>.98)return vec4(bgc,1.);
  float ang=atan(q.y,q.x);float ob=floor(mod(ang,PI)/(PI/8.));float s=min(floor((1.-rho)*4.),3.);float lam=4.*pow(2.,s)*u_k;float th=(ob+.5)*PI/8.;vec2 kd=vec2(cos(th),sin(th)),kp=vec2(-kd.y,kd.x);float sg=.5*lam;
  float E=0.;for(int sy=0;sy<6;sy++)for(int sx=0;sx<6;sx++){vec2 pos=cuv+((vec2(float(sx),float(sy))+.5)/6.-.5)/G;float re=0.,im=0.,ws=0.,wc=0.,wl=0.;
   for(int a=-3;a<=3;a++)for(int b=-1;b<=1;b++){vec2 off=kd*float(a)*lam*.25+kp*float(b)*sg*.6;float w=exp(-dot(off,off)/(2.*sg*sg));float l=L(pos+off*u_px);float ph=1.5708*float(a);re+=w*l*cos(ph);im+=w*l*sin(ph);ws+=w;wc+=w*cos(ph);wl+=w*l;}
   re-=wc*wl/ws;E+=sqrt(re*re+im*im)/ws;}
  E/=36.;vec3 col=ramp(1,clamp(E*u_p1,0.,1.));return vec4(mix(bgc,col,smoothstep(0.,.05,E*u_p1)),1.);`,
  'Oliva & Torralba 2001 GIST, approx.: Gabor energy at 4 scales (wavelength 4-32 px, σ = λ/2) × 8 orientations averaged over each cell of a 4×4 (or 8×8) grid; each cell drawn as a polar glyph in the frequency plane (outer ring = finest scale, angle = wave-vector orientation). Spatial Gabor taps on the unfiltered image (no pre-whitening, coarse scales may alias)');
