/* ================= misc2: ITK-style filters (Deriche recursive Gaussian, patch-based denoising, diffusion flows, confidence connected, level sets), distances & morphology ================= */
f = add('Blur');
f('derichegauss','Recursive Gaussian (Deriche)',[P('Sigma',.5,30,4,.1,'px'),S('Order',['Smoothing (order 0)','First derivative X','First derivative Y','Gradient magnitude','Second derivative (Laplacian)']),P('Derivative gain',.5,20,4,.1)],
  [`float sg=max(R(u_p0),.3);float st=max(1.,sg*4./48.);vec3 a=vec3(0.);float ws=0.;for(int k=-48;k<=48;k++){float x=float(k)*st;if(abs(x)>sg*4.+.5)continue;float t=abs(x)/sg;
    float h=(1.68*cos(.6318*t)+3.735*sin(.6318*t))*exp(-1.783*t)+(-.6803*cos(1.997*t)-.2598*sin(1.997*t))*exp(-1.723*t);a+=T(uv+vec2(x*u_px.x,0.)).rgb*h;ws+=h;}return vec4(a/ws,1.);`,
   `float sg=max(R(u_p0),.3);float st=max(1.,sg*4./48.);vec3 a=vec3(0.);float ws=0.;for(int k=-48;k<=48;k++){float x=float(k)*st;if(abs(x)>sg*4.+.5)continue;float t=abs(x)/sg;
    float h=(1.68*cos(.6318*t)+3.735*sin(.6318*t))*exp(-1.783*t)+(-.6803*cos(1.997*t)-.2598*sin(1.997*t))*exp(-1.723*t);a+=T(uv+vec2(0.,x*u_px.y)).rgb*h;ws+=h;}return vec4(a/ws,1.);`,
   `int m=int(u_p1+.5);vec3 s=T(uv).rgb;if(m==0)return vec4(s,1.);vec2 e=u_px;float sg=max(R(u_p0),.3);
    vec3 gx=(T(uv+vec2(e.x,0.)).rgb-T(uv-vec2(e.x,0.)).rgb)*.5*sg,gy=(T(uv+vec2(0.,e.y)).rgb-T(uv-vec2(0.,e.y)).rgb)*.5*sg;
    if(m==1)return vec4(.5+gx*u_p2*.25,1.);if(m==2)return vec4(.5+gy*u_p2*.25,1.);if(m==3)return vec4(vec3(clamp(length(vec2(luma(gx),luma(gy)))*u_p2*.5,0.,1.)),1.);
    vec3 lp=(T(uv+vec2(e.x,0.)).rgb+T(uv-vec2(e.x,0.)).rgb+T(uv+vec2(0.,e.y)).rgb+T(uv-vec2(0.,e.y)).rgb-4.*s)*sg*sg;return vec4(.5+lp*u_p2*.25,1.);`],
  'Deriche 1993 4th-order recursive-Gaussian impulse response (a0=1.68, a1=3.735, b0=1.783 …) applied as a separable truncated FIR (same response, GPU-parallel); derivatives by central differences of the smoothed image, σ-normalised');
f = add('Repair');
f('patchdenoise','Patch-Based Denoising (ITK-style)',[P('Strength',.3,3,1.6,.05),P('Iterations',1,4,2,1),P('Search radius',3,12,7,1,'px')],
  [...[0,1,2,3].map(k => `vec4 me=T(uv);if(${k}.>=u_p1)return me;float sn=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec2 q=(vec2(float(i),float(j))+.5)/8.;vec2 e=u_px;
     float v=4.*luma(O(q).rgb)-2.*(luma(O(q+vec2(e.x,0.)).rgb)+luma(O(q-vec2(e.x,0.)).rgb)+luma(O(q+vec2(0.,e.y)).rgb)+luma(O(q-vec2(0.,e.y)).rgb))+luma(O(q+e).rgb)+luma(O(q-e).rgb)+luma(O(q+vec2(e.x,-e.y)).rgb)+luma(O(q+vec2(-e.x,e.y)).rgb);sn+=abs(v);}
    sn=max(sn/64.*1.2533/6.,.004);float h2=2.*(sn*u_p0*1.5)*(sn*u_p0*1.5)+1e-6;vec3 acc=vec3(0.);float ws=0.;float SR=R(u_p2);
    for(int n=0;n<25;n++){float fn=float(n);vec2 o=n==0?vec2(0.):vec2(cos(fn*2.39996),sin(fn*2.39996))*SR*sqrt(fn/24.);vec2 qo=uv+o*u_px;float d=0.;
     for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 pq=vec2(float(i),float(j));vec3 df=T(uv+pq*u_px).rgb-T(qo+pq*u_px).rgb;d+=dot(df,df)*exp(-dot(pq,pq)*.18);}
     d/=39.8;float w=n==0?1.:exp(-max(d-2.*sn*sn,0.)/h2);acc+=T(qo).rgb*w;ws+=w;}
    return vec4(acc/ws,1.);`)],
  'ITK PatchBasedDenoisingImageFilter-style: iterated patch-similarity weighted averaging (5×5 Gaussian-weighted patches, 25 candidates on a golden-angle spiral), bandwidth from an Immerkær noise estimate (approx.: no entropy-based bandwidth optimisation)');
const MISC_DIFF = k => `vec4 me=T(uv);if(${k}.>=u_p1)return me;int m=int(u_p0+.5);vec2 e=u_px;vec3 c0=me.rgb;
  vec3 n=T(uv+vec2(0.,e.y)).rgb,s=T(uv-vec2(0.,e.y)).rgb,ea=T(uv+vec2(e.x,0.)).rgb,w=T(uv-vec2(e.x,0.)).rgb;float K=u_p2,dt=u_p3;
  if(m==0){vec3 dN=n-c0,dS=s-c0,dE=ea-c0,dW=w-c0;
   float gN=exp(-dot(dN,dN)/(3.*K*K)),gS=exp(-dot(dS,dS)/(3.*K*K)),gE=exp(-dot(dE,dE)/(3.*K*K)),gW=exp(-dot(dW,dW)/(3.*K*K));
   return vec4(c0+dt*(gN*dN+gS*dS+gE*dE+gW*dW),1.);}
  vec3 ne=T(uv+e).rgb,nw=T(uv+vec2(-e.x,e.y)).rgb,se=T(uv+vec2(e.x,-e.y)).rgb,sw=T(uv-e).rgb;
  vec3 Ix=(ea-w)*.5,Iy=(n-s)*.5,Ixx=ea+w-2.*c0,Iyy=n+s-2.*c0,Ixy=(ne+sw-nw-se)*.25;vec3 g2=Ix*Ix+Iy*Iy;
  if(m==1){
   vec3 hx=ea-c0,hy=(n+ne-s-se)*.25;vec3 gm=sqrt(hx*hx+hy*hy)+1e-5;vec3 fE=exp(-gm*gm/(K*K))*hx/gm;
   hx=c0-w;hy=(n+nw-s-sw)*.25;gm=sqrt(hx*hx+hy*hy)+1e-5;vec3 fW=exp(-gm*gm/(K*K))*hx/gm;
   vec3 vy=n-c0,vx=(ea+ne-w-nw)*.25;gm=sqrt(vx*vx+vy*vy)+1e-5;vec3 fN=exp(-gm*gm/(K*K))*vy/gm;
   vy=c0-s;vx=(ea+se-w-sw)*.25;gm=sqrt(vx*vx+vy*vy)+1e-5;vec3 fS=exp(-gm*gm/(K*K))*vy/gm;
   return vec4(c0+dt*sqrt(g2)*(fE-fW+fN-fS),1.);}
  vec3 kg=(Ixx*Iy*Iy-2.*Ix*Iy*Ixy+Iyy*Ix*Ix)/(g2+1e-6);
  if(m==2)return vec4(c0+dt*kg,1.);
  vec2 gl=vec2(luma(Ix),luma(Iy));vec2 tn=length(gl)>1e-5?normalize(vec2(-gl.y,gl.x)):vec2(1.,0.);float rr=2.*max(u_k,1.);
  vec3 thr=(T(uv+tn*rr*u_px).rgb+T(uv-tn*rr*u_px).rgb)*.5;vec3 av=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(i*i+j*j>5)continue;av+=T(uv+vec2(float(i),float(j))*u_k*u_px).rgb;}av/=21.;
  vec3 F=mix(min(kg,0.),max(kg,0.),step(av,thr));return vec4(c0+dt*F,1.);`;
f('itkdiffusion','Diffusion Flows (ITK)',[S('Flow',['Gradient anisotropic diffusion (Perona-Malik)','Curvature anisotropic diffusion (MCDE)','Curvature flow','Min-max curvature flow']),P('Iterations',1,30,10,1),P('Conductance',.01,.5,.08,.005),P('Time step',.02,.25,.15,.005)],
  Array(30).fill(0).map((_, k) => MISC_DIFF(k)),
  'explicit iterations of the ITK PDEs: Perona-Malik with vector conductance, Whitaker MCDE |∇I|·div(c·∇I/|∇I|), level-set curvature flow κ|∇I|, Malladi-Sethian min/max switch (stencil radius 2)');
f = add('Analysis');
const MISC_CC_GROW = s => `vec4 me=T(uv);if(me.r>.5)return me;float lo=me.g-me.b,hi=me.g+me.b;float l=luma(O(uv).rgb);if(l<lo||l>hi)return me;
  for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));if(T(uv+dir*${s}.*u_px).r<.5)continue;bool ok=true;
   for(int t=1;t<${s};t++){float lt=luma(O(uv+dir*float(t)*u_px).rgb);if(lt<lo||lt>hi){ok=false;break;}}if(ok){me.r=1.;break;}}return me;`;
const MISC_CC_JUMPS = [32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,4,2,1,2,1];
f('confconnected','Confidence Connected (iterative)',[P('Seed X',0,1,.5,.01),P('Seed Y',0,1,.5,.01),P('Multiplier',.5,5,2.5,.05),P('Iterations',0,3,2,1)],
  [`vec2 sd=vec2(u_p0,1.-u_p1);float m=0.,q=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float l=luma(O(sd+vec2(float(i),float(j))*u_k*u_px).rgb);m+=l;q+=l*l;}m/=25.;float sdv=sqrt(max(q/25.-m*m,0.));
    float hw=max(u_p2*sdv,.02);return vec4(length((uv-sd)*u_res)<2.5*max(u_k,1.)?1.:0.,m,hw,1.);`,
   ...MISC_CC_JUMPS.map(s => MISC_CC_GROW(s)),
   ...[0,1,2].flatMap(it => [`vec4 me=T(uv);if(${it}.>=u_p3)return me;float n=0.,m=0.,q=0.;for(int j=0;j<24;j++)for(int i=0;i<24;i++){vec2 p=(vec2(float(i),float(j))+.5)/24.;if(T(p).r>.5){float l=luma(O(p).rgb);n+=1.;m+=l;q+=l*l;}}
     vec2 sd=vec2(u_p0,1.-u_p1);float seed=length((uv-sd)*u_res)<2.5*max(u_k,1.)?1.:0.;if(n<6.)return vec4(seed,me.gb,1.);m/=n;float hw=max(u_p2*sqrt(max(q/n-m*m,0.)),.02);return vec4(seed,m,hw,1.);`,
     ...MISC_CC_JUMPS.map(s => `if(${it}.>=u_p3)return T(uv);` + MISC_CC_GROW(s))]),
   `float on=T(uv).r;vec3 o=O(uv).rgb;float ed=0.;for(int k=0;k<4;k++){vec2 d=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;ed=max(ed,abs(T(uv+d).r-on));}
    vec2 sd=vec2(u_p0,1.-u_p1);float mk=step(length((uv-sd)*u_res),4.*max(u_k,1.))*step(2.*max(u_k,1.),length((uv-sd)*u_res));
    return vec4(mix(mix(o*.45,mix(o,vec3(.2,1.,.4),.3),on),vec3(1.,.9,.1),max(ed,mk)),1.);`],
  'ITK ConfidenceConnected: seed-neighbourhood mean ± k·σ, connected growth (wall-checked jumps), then re-estimate mean/σ over the region (24×24 sample grid) and regrow from the seed, N iterations');
const MISC_LS0 = `vec2 e=u_px;float gx=blurL(uv+vec2(e.x,0.),1.)-blurL(uv-vec2(e.x,0.),1.),gy=blurL(uv+vec2(0.,e.y),1.)-blurL(uv-vec2(0.,e.y),1.);float gm=length(vec2(gx,gy))*.5/max(u_k,1.);
  float gp=1./(1.+gm*gm/(.035*.035));vec2 p=(uv-.5)*u_res;float rad=u_p1*min(u_res.x,u_res.y);float ph=clamp(length(p)-rad,-16.,16.);return vec4(.5+ph/32.,gp,0.,1.);`;
const MISC_LS = `vec4 me=T(uv);vec2 e=u_px;
  #define PH(o_) ((T(uv+(o_)*e).r-.5)*32.)
  float c0=(me.r-.5)*32.,pn=PH(vec2(0.,1.)),ps=PH(vec2(0.,-1.)),pe=PH(vec2(1.,0.)),pw=PH(vec2(-1.,0.)),pne=PH(vec2(1.,1.)),pnw=PH(vec2(-1.,1.)),pse=PH(vec2(1.,-1.)),psw=PH(vec2(-1.,-1.));
  float px_=(pe-pw)*.5,py_=(pn-ps)*.5,pxx=pe+pw-2.*c0,pyy=pn+ps-2.*c0,pxy=(pne+psw-pnw-pse)*.25;float gm=sqrt(px_*px_+py_*py_)+1e-4;
  float kap=clamp((pxx*py_*py_-2.*px_*py_*pxy+pyy*px_*px_)/(gm*gm*gm),-1.,1.);float g=me.g;vec2 gg=vec2(T(uv+vec2(e.x,0.)).g-T(uv-vec2(e.x,0.)).g,T(uv+vec2(0.,e.y)).g-T(uv-vec2(0.,e.y)).g)*.5;
  float adv=u_p0<.5?dot(gg,vec2(px_,py_))*2.:0.;float upd=g*(u_p2+u_p3*kap)*gm+adv;float reinit=sign(c0)*(1.-gm)*.3;
  return vec4(.5+clamp(c0+.7*upd+reinit,-16.,16.)/32.,g,0.,1.);`;
f('levelsetseg','Level-Set Segmentation (Geodesic Active Contour / Shape Detection)',[S('Method',['Geodesic active contour (Caselles)','Shape detection (Malladi)']),P('Initial radius',.1,.5,.45,.01),P('Propagation',-1,1,.7,.01),P('Curvature',0,1.5,.4,.01)],
  [MISC_LS0, ...Array(200).fill(MISC_LS), `float ph=T(uv).r-.5;vec3 o=O(uv).rgb;float ed=0.;for(int k=0;k<4;k++){vec2 d=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;ed=max(ed,step(0.,ph*(T(uv+d).r-.5)*-1.));}
    return vec4(mix(ph<0.?o:o*.4,vec3(1.,.15,.1),ed),1.);`],
  'level-set evolution φ_t = g(c + εκ)|∇φ| (+ ∇g·∇φ advection for GAC), g = 1/(1+|∇Gσ*I|²/K²), shrinking from a centred circle; 200 fixed iterations, clamped ±16 px band with Sussman-style reinitialisation');
const MISC_MET = `
  #define MET(v_) (u_p1<.5?length(v_):u_p1<1.5?abs((v_).x)+abs((v_).y):u_p1<2.5?max(abs((v_).x),abs((v_).y)):u_p1<3.5?max(abs((v_).x),abs((v_).y))+min(abs((v_).x),abs((v_).y))/3.:(max(abs((v_).x),abs((v_).y))>=2.*min(abs((v_).x),abs((v_).y))?(5.*max(abs((v_).x),abs((v_).y))+min(abs((v_).x),abs((v_).y)))/5.:(4.*max(abs((v_).x),abs((v_).y))+3.*min(abs((v_).x),abs((v_).y)))/5.))
  `;
const MISC_JFA = [512,256,128,64,32,16,8,4,2,1,1].map(s => `${MISC_MET}vec4 me=T(uv);vec2 bf=me.rg;float df=bf.x<0.?1e9:MET((bf-uv)*u_res);
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 q=T(uv+vec2(float(i),float(j))*${s}.*u_px);if(q.x>=0.){float d=MET((q.rg-uv)*u_res);if(d<df){df=d;bf=q.rg;}}}return vec4(bf,me.b,1.);`);
f('distxform','Distance Transform (Chamfer / Signed Maurer)',[S('Objects are',['Dark on light','Light on dark']),S('Metric',['Euclidean (Maurer)','City-block (D4)','Chessboard (D8)','Chamfer 3-4','Chamfer 5-7-11']),S('Display',['Distance outside (to objects)','Distance inside (to background)','Signed (− inside, + outside)','Iso-distance contours']),P('Display range',5,200,40,1,'px')],
  [`${BINF('.5','u_p0<.5?1.:0.')}float fg=BIN(uv);return vec4(fg>.5?uv:vec2(-1.),0.,1.);`,
   ...MISC_JFA,
   `${MISC_MET}${BINF('.5','u_p0<.5?1.:0.')}vec4 me=T(uv);float d=me.x<0.?4000.:MET((me.rg-uv)*u_res);return vec4(BIN(uv)<.5?uv:vec2(-1.),d/4096.,1.);`,
   ...MISC_JFA,
   `${MISC_MET}${BINF('.5','u_p0<.5?1.:0.')}vec4 me=T(uv);float sc=1./max(u_k,1.);bool fg=BIN(uv)>.5;float dOut=fg?0.:me.b*4096.*sc,dIn=(!fg||me.r<0.)?0.:MET((me.rg-uv)*u_res)*sc;int m=int(u_p2+.5);float rg=u_p3;
    if(m==0)return vec4(fg?vec3(0.):ramp(1,clamp(dOut/rg,0.,1.)),1.);if(m==1)return vec4(fg?ramp(2,clamp(dIn/rg,0.,1.)):vec3(0.),1.);
    float sd=fg?-dIn:dOut;if(m==2){float t=clamp(sd/rg,-1.,1.);vec3 col=t<0.?mix(vec3(.97),vec3(.1,.3,.9),-t):mix(vec3(.97),vec3(.85,.15,.1),t);return vec4(col*(.93+.07*step(.5,fract(sd/4.))),1.);}
    float iso=1.-smoothstep(0.,1.2*sc,abs(fract(sd/(rg*.25)+.5)-.5)*rg*.25);return vec4(mix(fg?vec3(.25):vec3(.92),vec3(.85,.15,.1),iso),1.);`],
  'jump-flooding nearest-feature transform for both phases, scored with the chosen metric (closed-form chamfer distances); signed output = Maurer convention, negative inside');
f = add('Edges');
f('labelcontour','Label Contours',[P('Label levels',2,16,4,1),S('Connectivity',['Face (4)','Full (8)']),S('Output',['Contours on black','Contours over image','Flat labels + contours'])],
  `float n=u_p0-1.;
  #define LB(q_) floor(clamp(T(q_).rgb,0.,1.)*n+.5)
  vec3 me=LB(uv);bool ed=false;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;if(u_p1<.5&&i!=0&&j!=0)continue;if(any(notEqual(LB(uv+vec2(float(i),float(j))*u_px),me)))ed=true;}
  vec3 col=me/n;int m=int(u_p2+.5);if(m==0)return vec4(ed?col:vec3(0.),1.);if(m==1)return vec4(ed?col:c.rgb*.5,1.);return vec4(ed?vec3(0.):col,1.);`,'ITK LabelContourImageFilter on colour-quantised labels: pixels with a differently labelled face / full neighbour');
f = add('Analysis');
const MISC_ENC = `
  #define DENC(d_) vec2(floor(clamp((d_)/4096.,0.,.999)*256.)/256.,fract(clamp((d_)/4096.,0.,.999)*256.))
  #define DDEC(v_) (((v_).x+(v_).y/256.)*4096.)
  `;
f('geodesicdist','Geodesic Distance (gray-weighted)',[P('Seed X',0,1,.5,.01),P('Seed Y',0,1,.5,.01),P('Edge weight',0,200,40,1),P('Display range',20,1000,250,5,'px')],
  [`${MISC_ENC}vec2 sd=vec2(u_p0,1.-u_p1);vec2 e=u_px;float gm=length(vec2(blurL(uv+vec2(e.x,0.),.7)-blurL(uv-vec2(e.x,0.),.7),blurL(uv+vec2(0.,e.y),.7)-blurL(uv-vec2(0.,e.y),.7)))*.5/max(u_k,1.);
    float cost=1.+u_p2*gm;float d=length((uv-sd)*u_res)<1.5?0.:4000.;return vec4(DENC(d),cost/64.,1.);`,
   ...[64,32,16,8,4,2,1,64,32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,4,2,1,2,1,1,1].map(s => `${MISC_ENC}vec4 me=T(uv);float d=DDEC(me.rg);float myc=me.b*64.;
    for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));vec4 q=T(uv+dir*${s}.*u_px);float dq=DDEC(q.rg);if(dq>3990.)continue;
     float pc=(myc+q.b*64.)*.5;int ns=min(${s},12);for(int t=1;t<12;t++){if(t>=ns)break;pc+=T(uv+dir*(float(t)*${s}./float(ns))*u_px).b*64.;}pc/=float(ns);float cand=dq+pc*length(dir)*${s}.;d=min(d,cand);}
    return vec4(DENC(d),me.b,1.);`),
   `${MISC_ENC}float d=DDEC(T(uv).rg)/max(u_k,1.);if(d*max(u_k,1.)>3990.)return vec4(0.,0.,0.,1.);float t=d/u_p3;vec3 col=ramp(1,clamp(t,0.,1.));float iso=1.-smoothstep(.0,.06,abs(fract(t*10.+.5)-.5));
    vec2 sd=vec2(u_p0,1.-u_p1);float mk=step(length((uv-sd)*u_res),3.*max(u_k,1.));return vec4(mix(mix(col,col*.55,iso*.6),vec3(0.,1.,.6),mk),1.);`],
  'distance from a seed point with local cost 1 + w·|∇I| (gray-weighted geodesic), min-plus propagation with path-integrated jumps (64 … 1 px, repeated)');
const MISC_LEV = s => `vec3 f0=O(uv).rgb;vec3 gv=T(uv).rgb;vec3 up=gv,dn=gv;
  for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));vec3 cd=T(uv+dir*${s}.*u_px).rgb;vec3 pmn=cd,pmx=cd;
   for(int t=1;t<${s};t++){vec3 ft=O(uv+dir*float(t)*u_px).rgb;pmn=min(pmn,ft);pmx=max(pmx,ft);}pmn=min(pmn,f0);pmx=max(pmx,f0);up=max(up,pmn);dn=min(dn,pmx);}
  vec3 lo=min(f0,up),hi=max(f0,dn);return vec4(mix(mix(gv,lo,step(gv,f0-1e-4)),hi,step(f0+1e-4,gv)),1.);`;
f('leveling','Leveling (Meyer)',[P('Marker blur',1,30,8,.5,'px'),S('Marker',['Gaussian blur','Opening (flat disc)']),S('Output',['Leveled image','Residue (image − leveling)','Marker'])],
  [`if(u_p1<.5)return vec4(blur5(uv,R(u_p0)*.5),1.);vec3 mn=vec3(1.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))/3.;if(dot(d,d)>1.)continue;mn=min(mn,T(uv+d*R(u_p0)*u_px).rgb);}return vec4(mn,1.);`,
   `if(u_p1<.5)return T(uv);vec3 mx=vec3(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j))/3.;if(dot(d,d)>1.)continue;mx=max(mx,T(uv+d*R(u_p0)*u_px).rgb);}return vec4(mx,1.);`,
   ...[32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,4,2,1,2,1,1,1].map(MISC_LEV),
   `vec3 l=T(uv).rgb;int m=int(u_p2+.5);if(m==0)return vec4(l,1.);if(m==1)return vec4(clamp(.5+(O(uv).rgb-l)*2.,0.,1.),1.);return vec4(l,1.);`],
  'Meyer leveling λ(f, g): lower part by geodesic dilation of the marker under f, upper part by geodesic erosion above f (path-checked jumps, per channel); marker = Gaussian blur or flat-disc opening');
f('convexhull','Convex Hull (iterative)',[S('Objects are',['Dark on light','Light on dark']),P('Range',10,400,40,1,'px'),S('Display',['Hull + objects','Hull mask','Over image'])],
  [`${BINF('.5','u_p0<.5?1.:0.')}float b=BIN(uv);return vec4(b,b,0.,1.);`,
   ...[0,1,2].map(() => `vec4 me=T(uv);if(me.r>.5)return me;float Rr=R(u_p1);float st=max(1.,Rr/32.);
    for(int k=0;k<12;k++){float a=float(k)*.2618;vec2 dir=vec2(cos(a),sin(a));bool f1=false,f2=false;for(int t=1;t<=32;t++){if(!f1&&T(uv+dir*float(t)*st*u_px).r>.5)f1=true;if(!f2&&T(uv-dir*float(t)*st*u_px).r>.5)f2=true;if(f1&&f2)break;}
     if(f1&&f2){me.r=1.;break;}}return me;`),
   `vec4 me=T(uv);int m=int(u_p2+.5);if(m==1)return vec4(vec3(me.r),1.);if(m==2)return vec4(mix(O(uv).rgb*.5,mix(O(uv).rgb,vec3(.2,.6,1.),.4),me.r),1.);return vec4(vec3(me.g>.5?0.:me.r>.5?.62:1.),1.);`],
  'approx.: iterated segment closure — a pixel joins when object pixels lie on both sides of it along one of 12 line directions within the range (3 iterations ≈ Carathéodory closure); nearby objects within range merge');
f('howe','Howe Binarization (approx.)',[S('Ink is',['Dark','Light']),P('Laplacian gain',5,200,60,1),P('Smoothness',0,3,1.2,.05),P('Edge threshold',.02,.5,.12,.01)],
  [`vec2 e=u_px;float pol=u_p0<.5?1.:-1.;float l0=blurL(uv,.6);float lp=(blurL(uv+vec2(e.x,0.),.6)+blurL(uv-vec2(e.x,0.),.6)+blurL(uv+vec2(0.,e.y),.6)+blurL(uv-vec2(0.,e.y),.6)-4.*l0)*pol;
    float mn=blurL(uv,R(6.));float un=u_p1*lp+12.*(mn-l0)*pol-1.5;vec2 g=vec2(blurL(uv+vec2(e.x,0.),.6)-blurL(uv-vec2(e.x,0.),.6),blurL(uv+vec2(0.,e.y),.6)-blurL(uv-vec2(0.,e.y),.6))*.5;
    float ed=step(u_p3*.25,length(g));return vec4(1./(1.+exp(-un)),.5+clamp(un,-20.,20.)/40.,ed,1.);`,
   ...Array(24).fill(`vec4 me=T(uv);float un=(me.g-.5)*40.;float acc=0.;for(int k=0;k<8;k++){vec2 d=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));vec4 q=T(uv+d*u_px);float w=(1.-max(me.b,q.b))*(k==0||k==2||k==4||k==6?1.:.7);acc+=w*(2.*q.r-1.);}
    return vec4(1./(1.+exp(-(un+u_p2*2.*acc))),me.gb,1.);`),
   `return vec4(vec3(T(uv).r>.5?0.:1.),1.);`],
  'approx. of Howe 2013: Laplacian data term (+ local-mean term) with edge-cut pairwise smoothness, solved by mean-field iterations instead of graph cut; no automatic parameter tuning');
