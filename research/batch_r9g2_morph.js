/* ================= Round 9G2: segmentation & morphology II ================= */
// binary foreground from luminance: BIN(q) is 1 for object pixels (u_bthr threshold param name passed in, polarity param)
const BINF = (thr, pol) => `
  #define BIN(q) (((luma(O(q).rgb)>(${thr}))!=((${pol})>.5))?1.:0.)
  `;
f = add('Analysis');
f('fuzzycmeans','Fuzzy C-Means Segmentation',[P('Clusters',2,8,4,1),P('Fuzziness m',1.2,3,2,.05),S('Output',['Hard (cluster colour)','Soft (membership blend)','Uncertainty map'])],
  `int K=int(u_p0+.5);vec3 ctr[8];for(int k=0;k<8;k++){float q=(float(k)+.5)/float(K);ctr[k]=vec3(q);}float ex=2./(u_p1-1.);
  for(int it=0;it<6;it++){vec3 num[8];float den[8];for(int k=0;k<8;k++){num[k]=vec3(0.);den[k]=0.;}
   for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 x=O(vec2(float(i)+.5,float(j)+.5)/12.).rgb;float dk[8];float sinv=0.;for(int k=0;k<8;k++){if(k>=K)break;dk[k]=max(distance(x,ctr[k]),1e-3);sinv+=pow(1./dk[k],ex);}
    for(int k=0;k<8;k++){if(k>=K)break;float u=pow(1./dk[k],ex)/sinv;float um=pow(u,u_p1);num[k]+=um*x;den[k]+=um;}}
   for(int k=0;k<8;k++){if(k>=K)break;ctr[k]=num[k]/max(den[k],1e-6);}}
  vec3 x=c.rgb;float sinv=0.,mx=0.;int best=0;float uk[8];for(int k=0;k<8;k++){if(k>=K)break;uk[k]=pow(1./max(distance(x,ctr[k]),1e-3),ex);sinv+=uk[k];}vec3 soft=vec3(0.);
  for(int k=0;k<8;k++){if(k>=K)break;float u=uk[k]/sinv;soft+=u*ctr[k];if(u>mx){mx=u;best=k;}}int m=int(u_p2+.5);if(m==0)return vec4(ctr[best],1.);if(m==1)return vec4(soft,1.);return vec4(vec3(1.-mx)*float(K)/float(K-1),1.);`,'Bezdek 1981, centres from a 12×12 sample grid, 6 iterations');
f('entropythresh','Local Entropy Threshold',[P('Window',3,40,10,1,'px'),P('Threshold',0,1,.55,.01),S('Output',['Mask','Over image','Entropy'])],
  `float h[16];for(int k=0;k<16;k++)h[k]=0.;float st=R(u_p0)/3.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){int b=int(clamp(L(uv+vec2(float(i),float(j))*st*u_px)*16.,0.,15.));h[b]+=1.;}float e=0.;for(int k=0;k<16;k++){float p=h[k]/49.;if(p>0.)e-=p*log2(p);}e/=4.;
  int m=int(u_p2+.5);if(m==2)return vec4(vec3(e),1.);float on=step(u_p1,e);return vec4(m==0?vec3(on):mix(c.rgb*.4,vec3(1.,.85,.2),on*.7),1.);`,'textured regions = high local entropy');
f('hysteresis','Hysteresis Threshold',[P('Low',0,1,.35,.01),P('High',0,1,.6,.01),S('Polarity',['Bright objects','Dark objects'])],
  [`float l=u_p2>.5?1.-L(uv):L(uv);return vec4(l>u_p1?1.:l>u_p0?.5:0.,0.,0.,1.);`,
   ...Array(40).fill(`vec4 me=T(uv);if(me.r>.25&&me.r<.75){for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(T(uv+vec2(float(i),float(j))*u_px).r>.75)me.r=1.;}return me;`),
   `return vec4(vec3(step(.75,T(uv).r)),1.);`],'skimage apply_hysteresis_threshold: weak pixels kept only if connected to strong ones');
f('regiongrow','Seeded Region Growing',[P('Seed X',0,1,.5,.01),P('Seed Y',0,1,.5,.01),P('Tolerance',.01,.5,.12,.005),S('Output',['Region over image','Mask'])],
  [`vec2 sd=vec2(u_p0,1.-u_p1);float on=length((uv-sd)*u_res)<3.?1.:0.;return vec4(on,0.,0.,1.);`,
   ...Array(64).fill(`vec4 me=T(uv);if(me.r>.5)return me;vec3 sv=O(vec2(u_p0,1.-u_p1)).rgb;if(distance(O(uv).rgb,sv)>u_p2*1.7)return me;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 d=vec2(float(i),float(j));if(T(uv+d*u_px).r>.5&&distance(O(uv+d*.5*u_px).rgb,sv)<=u_p2*1.7)me.r=1.;}return me;`),
   `float on=T(uv).r;if(u_p3>.5)return vec4(vec3(on),1.);vec3 o=O(uv).rgb;return vec4(mix(o*.45,mix(o,vec3(.2,1.,.4),.35),on),1.);`],'grows from a seed point while colour stays within tolerance (64 passes, ~128 px reach)');
f('acwe','Morphological Chan-Vese (ACWE)',[P('λ inside / outside',.2,5,1,.05),P('Smoothing',0,1,.5,.01),S('Output',['Contour over image','Mask'])],
  [`vec2 p=PX(uv)/R(10.);float on=mod(floor(p.x)+floor(p.y),2.);return vec4(on,0.,0.,1.);`,
   ...Array(36).fill(`float s1=0.,n1=0.,s0=0.,n0=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 q=(vec2(float(i),float(j))+.5)/12.;float l=luma(O(q).rgb);float u=T(q).r;s1+=u*l;n1+=u;s0+=(1.-u)*l;n0+=1.-u;}float c1=s1/max(n1,1.),c0=s0/max(n0,1.);
   float l=luma(O(uv).rgb);float me=T(uv).r;float d=u_p0*(l-c1)*(l-c1)-(l-c0)*(l-c0)/u_p0;float nb=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)nb+=T(uv+vec2(float(i),float(j))*u_px).r;
   float u=d<0.?1.:0.;float sm=(nb-me+u)/9.;u=step(.5,mix(u,sm,u_p1));return vec4(u,0.,0.,1.);`),
   `float u=T(uv).r;if(u_p2>.5)return vec4(vec3(u),1.);float ed=0.;for(int k=0;k<4;k++){vec2 d=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;ed=max(ed,abs(T(uv+d).r-u));}return vec4(mix(O(uv).rgb,vec3(1.,.2,.2),ed),1.);`],'Márquez-Neila 2014 style: region competition + morphological smoothing, checkerboard start, 36 iterations');
f = add('Edges');
// Guo-Hall thinning: P2..P9 clockwise from north; sub-iteration index baked into each pass
const GH = it => `float me=T(uv).r;if(me<.5)return vec4(0.,0.,0.,1.);vec2 e=u_px;
  float p2=step(.5,T(uv+vec2(0.,e.y)).r),p3=step(.5,T(uv+vec2(e.x,e.y)).r),p4=step(.5,T(uv+vec2(e.x,0.)).r),p5=step(.5,T(uv+vec2(e.x,-e.y)).r),p6=step(.5,T(uv-vec2(0.,e.y)).r),p7=step(.5,T(uv-e).r),p8=step(.5,T(uv-vec2(e.x,0.)).r),p9=step(.5,T(uv+vec2(-e.x,e.y)).r);
  float C=(1.-p2)*max(p3,p4)+(1.-p4)*max(p5,p6)+(1.-p6)*max(p7,p8)+(1.-p8)*max(p9,p2);float N1=max(p9,p2)+max(p3,p4)+max(p5,p6)+max(p7,p8),N2=max(p2,p3)+max(p4,p5)+max(p6,p7)+max(p8,p9);float N=min(N1,N2);
  float m=${it}==0?max(max(p6,p7),1.-p9)*p8:max(max(p2,p3),1.-p5)*p4;return vec4(C==1.&&N>=2.&&N<=3.&&m==0.?0.:1.,0.,0.,1.);`;
f('guohall','Thinning (Guo-Hall)',[P('Threshold',0,1,.5,.01),S('Lines are',['Dark on light','Light on dark']),S('Display',['Black on white','White on black','Over image'])],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}return vec4(BIN(uv),0.,0.,1.);`,...Array(20).fill(0).flatMap(() => [GH(0), GH(1)]),
   `float s=T(uv).r;int d=int(u_p2+.5);if(d==2)return vec4(mix(O(uv).rgb,vec3(1.,.15,.1),s),1.);return vec4(vec3(d==0?1.-s:s),1.);`],'Guo & Hall 1989 parallel thinning, 20 iterations');
const PRUNE = k => `if(${k}.>=u_p2)return T(uv);float me=T(uv).r;if(me<.5)return T(uv);float n=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;n+=step(.5,T(uv+vec2(float(i),float(j))*u_px).r);}return vec4(n<=1.?0.:1.,T(uv).g,0.,1.);`;
const REGROW = k => `if(${k}.>=u_p2)return T(uv);vec4 me=T(uv);if(me.g>.5||BIN(uv)<.5)return me;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(T(uv+vec2(float(i),float(j))*u_px).g>.5){me.g=1.;}return me;`;
f('skelprune','Skeleton Pruning',[P('Threshold',0,1,.5,.01),S('Lines are',['Dark on light','Light on dark']),P('Spur length',1,12,6,1,'px')],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}return vec4(BIN(uv),0.,0.,1.);`,...Array(12).fill(0).map((_, k) => PRUNE(k)),
   `float me=T(uv).r;if(me<.5)return vec4(0.,0.,0.,1.);float n=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;n+=step(.5,T(uv+vec2(float(i),float(j))*u_px).r);}return vec4(1.,n<=1.?1.:0.,0.,1.);`,
   ...Array(12).fill(0).map((_, k) => `${BINF('u_p0','u_p1<.5?1.:0.')}${REGROW(k)}`),
   `vec4 me=T(uv);return vec4(vec3(1.-max(me.r,me.g)),1.);`],'remove spurs ≤ N px, regrow main branches from their end points');
f('hitmiss','Hit-or-Miss Transform',[P('Threshold',0,1,.5,.01),S('Objects are',['Dark on light','Light on dark']),S('Pattern',['End points','Junctions (branch points)','Isolated points','Corners (any)'])],
  `${BINF('u_p0','u_p1<.5?1.:0.')}float me=BIN(uv);vec3 o=c.rgb*.4+vec3(me)*.35;if(me<.5)return vec4(o,1.);float r[8];vec2 e=u_px;vec2 off[8]=vec2[8](vec2(-1.,1.),vec2(0.,1.),vec2(1.,1.),vec2(1.,0.),vec2(1.,-1.),vec2(0.,-1.),vec2(-1.,-1.),vec2(-1.,0.));
  float n=0.,tr=0.;for(int k=0;k<8;k++){r[k]=BIN(uv+off[k]*e);n+=r[k];}for(int k=0;k<8;k++)tr+=step(.5,r[(k+1)-((k+1)/8)*8]-r[k]);int m=int(u_p2+.5);
  bool hit=m==0?(n>=1.&&tr==1.&&n<=2.):m==1?tr>=3.:m==2?n==0.:(r[1]+r[3]+r[5]+r[7]==2.&&((r[1]*r[3]>0.)||(r[3]*r[5]>0.)||(r[5]*r[7]>0.)||(r[7]*r[1]>0.))&&n<=4.);return vec4(hit?vec3(1.,.2,.2):o,1.);`,'binary pattern matching (3×3 structuring patterns)');
f('localthickness','Local Thickness (Granulometry Map)',[P('Threshold',0,1,.5,.01),S('Objects are',['Dark on light','Light on dark']),P('Max radius',4,40,20,1,'px')],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}if(BIN(uv)<.5)return vec4(0.,0.,0.,1.);float R_=R(u_p2);float d=R_;for(int k=0;k<96;k++){float fk=float(k);float a=fk*2.39996;float r=sqrt((fk+.5)/96.)*R_;if(r>=d)continue;if(BIN(uv+vec2(cos(a),sin(a))*r*u_px)<.5)d=r;}return vec4(d/R_,1.,0.,1.);`,
   `if(T(uv).g<.5)return vec4(0.,0.,0.,1.);float R_=R(u_p2);float th=T(uv).r;for(int k=0;k<128;k++){float fk=float(k);float a=fk*2.39996;float r=sqrt((fk+.5)/128.)*R_;vec4 q=T(uv+vec2(cos(a),sin(a))*r*u_px);if(q.g>.5&&r<=q.r*R_)th=max(th,q.r);}return vec4(th,1.,0.,1.);`,
   `vec4 t=T(uv);return vec4(t.g<.5?vec3(0.):ramp(2,t.r),1.);`],'largest inscribed disc covering each pixel (ImageJ Local Thickness, Hildebrand & Rüegsegger 1997)');
f('morph2','Morphology II',[S('Operation',['Rank filter (percentile)','Toggle contrast mapping','Morphological Laplacian','Shock filter step (Kramer-Bruckner)','Path opening (8 lines)','Path closing (8 lines)']),P('Radius / length',1,12,3,1,'px'),P('Rank',0,100,50,1,'%')],
  `int m=int(u_p0+.5);float r=R(u_p1);vec3 mn=vec3(1.),mx=vec3(0.);float ls[49];int n=0;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))/3.;if(dot(d,d)>1.)continue;vec3 v=T(uv+d*r*u_px).rgb;mn=min(mn,v);mx=max(mx,v);ls[n]=luma(v);n++;}
  vec3 C=c.rgb;if(m==0){int tg=int(u_p2/100.*float(n-1)+.5);float val=luma(C);for(int k=0;k<49;k++){if(k>=n)break;int rk=0;for(int q=0;q<49;q++){if(q>=n)break;rk+=(ls[q]<ls[k]||(ls[q]==ls[k]&&q<k))?1:0;}if(rk==tg)val=ls[k];}return vec4(C*val/max(luma(C),1e-3),1.);}
  if(m==1)return vec4(mix(mn,mx,step(mx-C,C-mn)),1.);if(m==2)return vec4(clamp(.5+(mx+mn-2.*C)*2.,0.,1.),1.);
  if(m==3){float lap=L(uv+vec2(u_px.x,0.))+L(uv-vec2(u_px.x,0.))+L(uv+vec2(0.,u_px.y))+L(uv-vec2(0.,u_px.y))-4.*luma(C);return vec4(lap<0.?mx:mn,1.);}
  float best=m==4?0.:1.;for(int k=0;k<8;k++){float an=float(k)*.3927;vec2 dir=vec2(cos(an),sin(an))*u_px*r/3.;float op=m==4?0.:1.;for(int t=-6;t<=0;t++){float ex=m==4?1.:0.;for(int q=0;q<=6;q++){float v=L(uv+dir*float(t+q));ex=m==4?min(ex,v):max(ex,v);}op=m==4?max(op,ex):min(op,ex);}best=m==4?max(best,op):min(best,op);}
  return vec4(C*best/max(luma(C),1e-3),1.);`,'rank, toggle, Laplacian, shock and line-path operators');
f('reconstruct2','Reconstruction II (Top-hat / H-extrema / Grind)',[S('Operation',['Top-hat by reconstruction','H-convex','H-concave','Grind peak (ITK)','Area closing (approx.)','Valued regional maxima']),P('Radius',1,8,3,1,'px'),P('h',0,.5,.1,.005)],
  [`int m=int(u_p0+.5);float I=luma(O(uv).rgb);float J=m==2||m==4?1.-I:I;float mk;if(m==0||m==4){float mn=1.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))/3.;if(dot(d,d)>1.)continue;float v=L(uv+d*R(u_p1)*u_px);mn=min(mn,m==4?1.-v:v);}mk=mn;}
   else if(m==3){vec2 b=min(uv,1.-uv);mk=min(b.x,b.y)<2.*max(u_px.x,u_px.y)?J:0.;}else if(m==5)mk=J-.004;else mk=max(J-u_p2,0.);return vec4(mk,0.,0.,1.);`,
   ...[32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,4,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map(s => `int m=int(u_p0+.5);float I=luma(O(uv).rgb);float J=m==2||m==4?1.-I:I;float mk=T(uv).r;for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));float cand=T(uv+dir*${s}.*u_px).r;for(int t=1;t<${s};t++){float It=luma(O(uv+dir*float(t)*u_px).rgb);cand=min(cand,m==2||m==4?1.-It:It);}mk=max(mk,cand);}return vec4(min(mk,J),0.,0.,1.);`),
   `int m=int(u_p0+.5);float I=luma(O(uv).rgb);float J=m==2||m==4?1.-I:I;float r=T(uv).r;float o=m==0||m==1||m==2?J-r:m==3?r:m==4?1.-r:(J-r>.002?I:0.);return vec4(vec3(clamp(m<=2?o*3.:o,0.,1.)),1.);`],'geodesic dilation with path-checked jumps (whole-image reach)');
f('fillholes','Fill Holes / Clear Border',[P('Threshold',0,1,.5,.01),S('Objects are',['Dark on light','Light on dark']),S('Operation',['Fill holes','Clear border objects'])],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}float fg=BIN(uv);float tgt=u_p2<.5?1.-fg:fg;vec2 b=min(uv,1.-uv);float edge=min(b.x,b.y)<1.5*max(u_px.x,u_px.y)?1.:0.;return vec4(tgt*edge,fg,0.,1.);`,
   ...[32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,4,2,1].map(s => `${BINF('u_p0','u_p1<.5?1.:0.')}vec4 me=T(uv);if(me.r>.5)return me;float fg=me.g;float tgt=u_p2<.5?1.-fg:fg;if(tgt<.5)return me;
   for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));if(T(uv+dir*${s}.*u_px).r<.5)continue;bool ok=true;for(int t=1;t<${s};t++){float f2=BIN(uv+dir*float(t)*u_px);if((u_p2<.5?1.-f2:f2)<.5){ok=false;break;}}if(ok){me.r=1.;break;}}return me;`),
   `vec4 me=T(uv);float fg=me.g;float o=u_p2<.5?max(fg,1.-me.r):fg*(1.-me.r);return vec4(vec3(u_p1<.5?1.-o:o),1.);`],'border-seeded flood with wall-checked jumps');
f('jfa','Distance & Voronoi (Jump Flooding)',[P('Threshold',0,1,.5,.01),S('Objects are',['Dark on light','Light on dark']),S('Output',['Distance to objects','Nearest object colour (feature transform)','SKIZ (influence-zone borders)','Medial axis']),P('Display range',10,300,60,1,'px')],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}float fg=BIN(uv);bool seed=int(u_p2+.5)==3?fg<.5:fg>.5;return vec4(seed?uv:vec2(-1.),fg,1.);`,
   ...[512,256,128,64,32,16,8,4,2,1,1].map(s => `vec4 me=T(uv);vec2 best=me.rg;float bd=best.x<0.?1e9:length((best-uv)*u_res);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*${s}.*u_px;vec2 sd=T(q).rg;if(sd.x<0.)continue;float d=length((sd-uv)*u_res);if(d<bd){bd=d;best=sd;}}return vec4(best,me.b,1.);`),
   `vec4 me=T(uv);vec2 sd=me.rg;float d=length((sd-uv)*u_res)/max(u_k,1.);int m=int(u_p2+.5);if(m==0)return vec4(ramp(1,clamp(d/u_p3,0.,1.)),1.);if(m==1)return vec4(O(sd).rgb,1.);
   float jump=0.;for(int k=0;k<4;k++){vec2 o=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;jump=max(jump,length((T(uv+o).rg-sd)*u_res));}
   if(m==2)return vec4(vec3(me.b>.5?.35:(jump>6.?1.:0.)),1.);vec2 v0=normalize(sd-uv+1e-7);float sp=0.;for(int k=0;k<4;k++){vec2 o=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;vec2 vn=normalize(T(uv+o).rg-(uv+o)+1e-7);sp=max(sp,(1.-dot(v0,vn))*.5);}return vec4(vec3(me.b>.5?(sp>.35&&d>1.5?1.:.25):0.),1.);`],'Rong & Tan 2006 JFA (needs float targets for large images)');
