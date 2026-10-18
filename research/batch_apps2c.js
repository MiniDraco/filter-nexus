/* ================= apps2 (part 3): darktable / RawTherapee (colour reconstruction, profiled denoise, inpaint-opposed highlights, log encoding, line noise, IGV / HPHD demosaic + green equilibration) and NPR literature (anisotropic Kuwahara, TAM hatching, notebook drawings, Gooch / Oren-Nayar / Cook-Torrance, artistic screening, Kubelka-Munk) ================= */
f = add('Repair');
f('dt_colorrecon','Color Reconstruction (darktable)',[P('Lightness threshold',50,100,95,.5),P('Spatial extent',10,1000,400,1,'px'),P('Range extent',1,50,10,.5),S('Precedence',['None','Saturated colors'])],
  `vec3 lab;${R10L_LAB('c.rgb','lab')}float th=u_p0;if(lab.x<th-1.)return c;float ss=R(u_p1)*.5;vec2 acc=vec2(0.);float ws=0.;
  for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 o=vec2(float(i),float(j))/7.*ss;vec2 q=uv+o*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;vec3 v=O(q).rgb;vec3 lq;${R10L_LAB('v','lq')}
   if(lq.x>=th)continue;float w=exp(-dot(o,o)/(2.*ss*ss*.25))*exp(-(lq.x-lab.x)*(lq.x-lab.x)/(2.*u_p2*u_p2));if(u_p3>.5)w*=length(lq.yz)/50.;acc+=w*lq.yz;ws+=w;}
  if(ws<1e-6)return c;vec3 nl=vec3(lab.x,acc/ws);vec3 o2;${R10L_RGB('nl','o2')}return vec4(mix(c.rgb,o2,clamp(lab.x-th+1.,0.,1.)),1.);`,
  'darktable color reconstruction: pixels with L above the threshold (clipped highlights) take the a / b chroma of nearby unclipped pixels, weighted by a spatial Gaussian (extent) and a lightness-similarity Gaussian (range), optionally weighted toward saturated colours; darktable uses a bilateral grid, here a 15x15 sparse gather');
f('dt_profiled','Profiled Denoise (darktable)',[S('Noise profile',['ISO 200','ISO 1600','ISO 6400','ISO 25600'],1),P('Strength',0,3,1,.05),P('Patch spacing',1,4,1,1,'px'),P('Search radius',2,5,4,1,'px')],
  `int pi=int(u_p0+.5);float a=pi==0?1.5e-4:pi==1?6e-4:pi==2?2.4e-3:9.6e-3;float bb=pi==0?2e-6:pi==1?1e-5:pi==2?4e-5:1.6e-4;
#define A2GAT(q) (2./a*sqrt(max(a*${LIN('O(q).rgb')}+.375*a*a+bb,vec3(0.))))
  float ps=u_p2*max(u_k,1.);int sr=int(u_p3+.5);vec3 P0[9];for(int k=0;k<9;k++){vec2 o=vec2(float(k-k/3*3-1),float(k/3-1))*ps;P0[k]=A2GAT(uv+o*u_px);}
  vec3 acc=vec3(0.),ws=vec3(0.);float h2=max(u_p1*u_p1,.01)*2.;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>sr||abs(j)>sr)continue;vec2 sh=vec2(float(i),float(j))*max(u_k,1.);vec3 d2=vec3(0.);vec3 cen;
   for(int k=0;k<9;k++){vec2 o=vec2(float(k-k/3*3-1),float(k/3-1))*ps;vec3 v=A2GAT(uv+(sh+o)*u_px);vec3 e=v-P0[k];d2+=e*e;if(k==4)cen=v;}
   d2/=9.;vec3 w=exp(-max(d2-2.,0.)/h2);acc+=w*cen;ws+=w;}
  vec3 z=acc/ws;vec3 x=((a*z*.5)*(a*z*.5)-.375*a*a-bb)/a;x=clamp(x,0.,1.);return vec4(${SRGB('x')},1.);`,
  'darktable profiled denoise (non-local means mode): Poisson-Gaussian noise profile var = a x + b (here 4 generic presets instead of per-camera profiles), generalised Anscombe transform to unit variance, NLM with 3x3 patches at Patch spacing over the search window (weights exp(-max(d^2 - 2, 0)/(2 strength^2))), algebraic inverse transform; linear RGB; wavelet mode not included');
f('dt_inpaintopposed','Highlight Reconstruction (inpaint opposed)',[P('Simulated overexposure',0,4,1.5,.05,'EV'),P('Clipping threshold',.5,1,1,.005),S('Output',['Reconstructed','Clipped (no reconstruction)','Clip mask'])],
  [`float ex=exp2(u_p0);float cv=.987*u_p1;vec3 v=min(${LIN('c.rgb')}*ex,vec3(u_p1));bool clp=any(greaterThanEqual(v,vec3(cv)));float nb=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 q=O(uv+vec2(float(i),float(j))*u_px).rgb;vec3 lq=${LIN('q')};if(any(greaterThanEqual(min(lq*ex,vec3(u_p1)),vec3(cv))))nb=1.;}
   float bd=(!clp&&nb>.5)?1.:0.;vec3 m=pow(max(v,vec3(0.)),vec3(1./3.));vec3 rf=pow(.5*vec3(m.g+m.b,m.r+m.b,m.r+m.g),vec3(3.));return vec4(.5+.5*clamp((v-rf)*bd,-1.,1.),bd);`,
   `vec2 cs=1./vec2(24.);vec3 s=vec3(0.);float n=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec4 t=T(uv+(vec2(float(i),float(j))-5.5)/12.*cs);s+=t.rgb;n+=t.a;}return vec4(s/144.,n/144.);`,
   `float ex=exp2(u_p0);float cv=.987*u_p1;vec3 cs=vec3(0.);float ca=0.;for(int j=0;j<24;j++)for(int i=0;i<24;i++){vec4 t=T((vec2(float(i),float(j))+.5)/24.);cs+=(t.rgb-.5)*2.;ca+=t.a;}
   vec3 chr=ca>1e-4?cs/ca:vec3(0.);vec3 o=O(uv).rgb;vec3 v=min(${LIN('o')}*ex,vec3(u_p1));bvec3 cl=greaterThanEqual(v,vec3(cv));int mo=int(u_p2+.5);
   if(mo==2)return vec4(vec3(cl.r?1.:0.,cl.g?1.:0.,cl.b?1.:0.),1.);vec3 r=v;
   if(mo==0){vec3 m=pow(max(v,vec3(0.)),vec3(1./3.));vec3 rf=pow(.5*vec3(m.g+m.b,m.r+m.b,m.r+m.g),vec3(3.));vec3 rc=max(v,rf+chr);r=vec3(cl.r?rc.r:v.r,cl.g?rc.g:v.g,cl.b?rc.b:v.b);}
   r=clamp(r/ex,0.,1.);return vec4(${SRGB('r')},1.);`],
  'darktable highlight reconstruction "inpaint opposed" (on demosaiced RGB here): the image is pushed up by the simulated EV and clipped per channel; for every clipped channel the value becomes max(value, opposed reference + chrominance correction), reference = cube of the mean cube roots of the other two channels, correction = mean (value - reference) over unclipped pixels bordering clipped areas (whole image, block-reduced); shown scaled back down by the same EV');

f = add('Tone');
f('rt_logencode','Log Encoding (RawTherapee)',[P('Gray point',1,50,18,.5,'%'),P('Black Ev',-16,-1,-7,.1),P('White Ev',1,16,3,.1),P('Target gray',.05,.8,.46,.01)],
  `vec3 l=${LIN('c.rgb')};float gp=u_p0/100.;vec3 v=clamp((log2(max(l,vec3(1e-7))/gp)-u_p1)/(u_p2-u_p1),0.,1.);float vg=-u_p1/(u_p2-u_p1);float g=log(u_p3)/log(clamp(vg,.01,.99));
  return vec4(pow(v,vec3(g)),1.);`,
  'RawTherapee Log Encoding (after the ACES / ARRI log idea): v = (log2(x / gray) - black Ev) / (white Ev - black Ev) per channel on linear RGB, then a power so the gray point lands on the Target gray (display value); source analysis (auto Ev) and the CAM viewing conditions left out');

f = add('Repair');
f('rt_linenoise','Line Noise / PDAF Banding Filter (RawTherapee)',[S('Direction',['Horizontal lines','Vertical lines','Both']),P('Threshold',.002,.2,.03,.001),P('Strength',0,1,1,.01),S('Output',['Corrected','Removed pattern x8'])],
  [`vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);float l=luma(c.rgb);float hr=l-.25*(L(uv+ey)+L(uv-ey)+L(uv+2.*ey)+L(uv-2.*ey));float hc=l-.25*(L(uv+ex)+L(uv-ex)+L(uv+2.*ex)+L(uv-2.*ex));return vec4(.5+hr,.5+hc,0.,1.);`,
   `float sr=0.,nr=0.,sc=0.,nc=0.;for(int i=0;i<96;i++){float t=(float(i)+.5)/96.;float a=T(vec2(t,uv.y)).r-.5;float b=T(vec2(uv.x,t)).g-.5;if(abs(a)<u_p1){sr+=a;nr+=1.;}if(abs(b)<u_p1){sc+=b;nc+=1.;}}
   return vec4(.5+sr/max(nr,1.),.5+sc/max(nc,1.),0.,1.);`,
   `int d=int(u_p0+.5);vec2 t=T(uv).rg-.5;float off=(d!=1?t.x:0.)+(d!=0?t.y:0.);if(u_p3>.5)return vec4(vec3(.5+off*8.),1.);return vec4(clamp(O(uv).rgb-off*u_p2,0.,1.),1.);`],
  'RawTherapee line noise / PDAF lines filter idea (on RGB, approx.): each row\'s offset = robust mean across the row of the luminance minus its neighbour rows (+-1, +-2), samples whose deviation exceeds Threshold (real edges) excluded; columns likewise; the offset is subtracted');

f = add('Sensor');
f('demosaic_igv','Demosaic II (IGV / HPHD, green equilibration)',[S('Algorithm',['IGV','HPHD']),S('Green equilibration',['Off','On'],1),P('Gr/Gb imbalance',0,10,2,.1,'%'),S('Output',['Demosaiced','Error x8','CFA mosaic'])],
  [RS_BAY + `vec2 p=floor(uv*u_res);vec3 w=RSW(p);
#define A2RW(q) (RAW(q)*(1.+((RSW(q).g>.5&&mod(u_res.y-1.-(q).y,2.)>.5)?u_p2/100.:0.)))
   float v=A2RW(p);if(w.g>.5&&u_p1>.5){float o1=A2RW(p+2.*RSX),o2=A2RW(p-2.*RSX),o3=A2RW(p+2.*RSY),o4=A2RW(p-2.*RSY);float own=.25*(o1+o2+o3+o4);
    float oth=.25*(A2RW(p+vec2(1.,1.))+A2RW(p+vec2(-1.,1.))+A2RW(p+vec2(1.,-1.))+A2RW(p+vec2(-1.,-1.)));float gr=(abs(o1-o2)+abs(o3-o4))/(own+.01);
    v+=.5*(oth-own)*(1.-smoothstep(.04,.15,gr));}return vec4(v,0.,0.,1.);`,
   RS_BAY + `vec2 p=floor(uv*u_res);vec3 w=RSW(p);float c0=TP(p).r;if(w.g>.5)return vec4(c0,c0,0.,1.);
#define A2R(q) TP(q).r
#define A2GH(q) (.5*(A2R((q)+RSX)+A2R((q)-RSX))+.25*(2.*A2R(q)-A2R((q)+2.*RSX)-A2R((q)-2.*RSX)))
#define A2GV(q) (.5*(A2R((q)+RSY)+A2R((q)-RSY))+.25*(2.*A2R(q)-A2R((q)+2.*RSY)-A2R((q)-2.*RSY)))
   float gH=A2GH(p),gV=A2GV(p);float g;float N=A2R(p+RSY),S_=A2R(p-RSY),E=A2R(p+RSX),W=A2R(p-RSX);
   if(u_p0<.5){float dh=c0-gH,dhl=A2R(p-2.*RSX)-A2GH(p-2.*RSX),dhr=A2R(p+2.*RSX)-A2GH(p+2.*RSX);float dv=c0-gV,dvd=A2R(p-2.*RSY)-A2GV(p-2.*RSY),dvu=A2R(p+2.*RSY)-A2GV(p+2.*RSY);
    float vh=(dh-dhl)*(dh-dhl)+(dh-dhr)*(dh-dhr)+(E-W)*(E-W),vv=(dv-dvd)*(dv-dvd)+(dv-dvu)*(dv-dvu)+(N-S_)*(N-S_);float wh=1./(1e-6+vh),wv=1./(1e-6+vv);g=(wh*gH+wv*gV)/(wh+wv);}
   else{float K[9]=float[9](1.,-8.,27.,-48.,56.,-48.,27.,-8.,1.);float hh=0.,hv=0.;for(int j=-4;j<=4;j++){float fx=0.,fy=0.;for(int i=-4;i<=4;i++){fx+=K[i+4]*A2R(p+RSX*float(i+j));fy+=K[i+4]*A2R(p+RSY*float(i+j));}hh+=abs(fx);hv+=abs(fy);}
    g=hv<.8*hh?gV:hh<.8*hv?gH:.5*(gH+gV);}
   return vec4(c0,clamp(g,min(min(N,S_),min(E,W)),max(max(N,S_),max(E,W))),0.,1.);`,
   RS_BAY + `vec2 p=floor(uv*u_res);vec3 w=RSW(p);bool isG=w.g>.5;float c0=TP(p).r;
#define A2R(q) TP(q).r
   ` + RS_CDB.replace(/RAW\(/g,'A2R('),
   RS_BAY + `int mo=int(u_p3+.5);vec2 p=floor(uv*u_res);if(mo==2)return vec4(O(uv).rgb*RSW(p),1.);if(mo==1)return vec4(clamp(abs(c.rgb-O(uv).rgb)*8.,0.,1.),1.);return c;`],
  'RGGB round trip with a simulated Gr/Gb sensitivity mismatch (maze pattern). Green equilibration (dcraw / RawTherapee idea): in flat areas each green moves halfway to the mean of the other green type. IGV (approx.): Hamilton-Adams H / V green estimates weighted by the inverse variance of their colour differences and gradients; HPHD (heterogeneity-projection hard decision, approx.): 9-tap zero-sum projection energy along rows vs columns, the smoother direction wins (0.8 ratio), else the average; R / B by bilinear colour differences');

f = add('Paint');
f('akuwahara','Anisotropic Kuwahara (Kyprianidis)',[P('Radius',2,8,6,.5,'px'),P('Sharpness q',1,16,8,.5),P('Anisotropy alpha',.5,4,1,.05),P('Tensor smoothing',.5,5,2,.1,'px')],
  [`vec2 p=u_px;vec3 tl=T(uv+vec2(-p.x,p.y)).rgb,t=T(uv+vec2(0.,p.y)).rgb,tr=T(uv+p).rgb,l=T(uv-vec2(p.x,0.)).rgb,r=T(uv+vec2(p.x,0.)).rgb,bl=T(uv-p).rgb,b=T(uv-vec2(0.,p.y)).rgb,br=T(uv+vec2(p.x,-p.y)).rgb;
   vec3 gx=((tr+2.*r+br)-(tl+2.*l+bl))*.25,gy=((tl+2.*t+tr)-(bl+2.*b+br))*.25;return vec4(dot(gx,gx)/3.,.5+dot(gx,gy)/6.,dot(gy,gy)/3.,1.);`,
   BH('u_p3*2.'),BV('u_p3*2.'),
   `float E=c.r*3.,F=(c.g-.5)*6.,G=c.b*3.;float dd=sqrt(max((E-G)*(E-G)+4.*F*F,0.));float l1=.5*(E+G+dd),l2=.5*(E+G-dd);vec2 v=vec2(l1-E,-F);vec2 t=length(v)>0.?normalize(v):vec2(0.,1.);
   float phi=-atan(t.y,t.x);float A=l1+l2>0.?(l1-l2)/(l1+l2):0.;return vec4(.5+.5*phi/PI,A,0.,1.);`,
   `float phi=(c.r-.5)*2.*PI;float A=c.g;float rad=R(u_p0);float al=u_p2;float a=rad*clamp((al+A)/al,.1,2.),b=rad*clamp(al/(al+A),.1,2.);float cp=cos(phi),sp=sin(phi);
   mat2 SR=mat2(.5/a,0.,0.,.5/b)*mat2(cp,-sp,sp,cp);float mx=sqrt(a*a*cp*cp+b*b*sp*sp),my=sqrt(a*a*sp*sp+b*b*cp*cp);float st=max(1.,max(mx,my)/16.);
   float zeta=2./rad;float zc=3.14159/8.*3.;float eta=(zeta+cos(zc))/(sin(zc)*sin(zc));vec4 m[8];vec3 s[8];for(int k=0;k<8;k++){m[k]=vec4(0.);s[k]=vec3(0.);}
   for(int j=-16;j<=16;j++)for(int i=-16;i<=16;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>mx+st||abs(o.y)>my+st)continue;vec2 vv=SR*o;if(dot(vv,vv)>.25)continue;vec3 cc=O(uv+o*u_px).rgb;
    float w[8];float sum=0.;float vxx=zeta-eta*vv.x*vv.x,vyy=zeta-eta*vv.y*vv.y;float z;
    z=max(0.,vv.y+vxx);w[0]=z*z;z=max(0.,-vv.x+vyy);w[2]=z*z;z=max(0.,-vv.y+vxx);w[4]=z*z;z=max(0.,vv.x+vyy);w[6]=z*z;
    vec2 v2=.70710678*vec2(vv.x-vv.y,vv.x+vv.y);vxx=zeta-eta*v2.x*v2.x;vyy=zeta-eta*v2.y*v2.y;
    z=max(0.,v2.y+vxx);w[1]=z*z;z=max(0.,-v2.x+vyy);w[3]=z*z;z=max(0.,-v2.y+vxx);w[5]=z*z;z=max(0.,v2.x+vyy);w[7]=z*z;
    for(int k=0;k<8;k++)sum+=w[k];float g=exp(-3.125*dot(vv,vv))/max(sum,1e-6);for(int k=0;k<8;k++){float wk=w[k]*g;m[k]+=vec4(cc*wk,wk);s[k]+=cc*cc*wk;}}
   vec4 o=vec4(0.);for(int k=0;k<8;k++){if(m[k].w<=0.)continue;vec3 mu=m[k].rgb/m[k].w;vec3 sv=abs(s[k]/m[k].w-mu*mu);float s2=sv.r+sv.g+sv.b;float wk=1./(1.+pow(255.*s2,.5*u_p1));o+=vec4(mu*wk,wk);}
   return vec4(o.w>0.?o.rgb/o.w:O(uv).rgb,1.);`],
  'Kyprianidis, Kang & Doellner 2009 / 2011: smoothed structure tensor -> orientation and anisotropy A; elliptical kernel (a = r (alpha + A)/alpha, b = r alpha/(alpha + A)) split into 8 sectors with the polynomial weighting functions, Gaussian falloff, output = sector means weighted by 1/(1 + (255 sigma^2)^(q/2)); sampling stride grows above 16 px half-axes');

f('tam_hatch','Tonal Art Map Hatching (Praun)',[P('Stroke spacing',3,16,6,.5,'px'),P('Stroke weight',.5,3,1,.05,'px'),P('Angle',0,180,35,1,'deg'),S('Paper',['Ink on paper','Ink over colour'])],
  `float tone=clamp((1.-blurL(uv,u_k))*6.6-.3,0.,6.);float ink=0.;float sp=u_p0;float hw=u_p1*.5;
  for(int d=0;d<2;d++){vec2 q=rot(PX(uv),radians(u_p2+float(d)*90.));float k0=floor(q.y/sp);
   for(int dk=-1;dk<=1;dk++){float k=k0+float(dk);float yc=(k+.5)*sp+(hash(vec2(k,float(d)+.5))-.5)*.3*sp;float Ls=sp*7.;float sh=hash(vec2(k,float(d)+3.))*Ls;float m0=floor((q.x+sh)/Ls);
    for(int dm=-1;dm<=1;dm++){float m=m0+float(dm);vec2 id=vec2(k*1.7+float(d)*91.,m);float lv=1.+floor(hash(id)*3.)+float(d)*3.;float pr=clamp(tone-lv+1.,0.,1.);if(pr<=0.)continue;
     float x0=m*Ls-sh+hash(id+.3)*.25*Ls,x1=(m+1.)*Ls-sh-hash(id+.7)*.25*Ls;float yy=yc+sin(q.x*.05+hash(id+.9)*6.)*.4;float tx=clamp((q.x-x0)/max(x1-x0,1.),0.,1.);
     float dx=max(max(x0-q.x,q.x-x1),0.);float dist=length(vec2(dx,q.y-yy));float wv=hw*(.6+.4*sin(tx*3.14159));ink=max(ink,pr*(1.-smoothstep(wv-.5,wv+.5,dist)));}}}
  vec3 base=u_p3<.5?vec3(1.,.99,.96):c.rgb;return vec4(base*(1.-.9*ink),1.);`,
  'after Praun, Hoppe, Webb & Finkelstein 2001 (real-time hatching with tonal art maps), 2D: 6 tones of nested stroke sets (each stroke belongs to one tone level and appears in every darker tone, so tones blend coherently), levels 4-6 add the cross direction; tone from local luminance, adjacent tones blended (stroke fade-in) instead of the 6-way texture blend');

f('notebook_draw','Notebook Drawings (flockaroo)',[P('Stroke length',.5,3,1,.05),P('Angles',2,5,3,1),S('Paper',['Checkered','Lined','Plain']),P('Colour',0,1,1,.01)],
  `vec2 pos=uv*u_res;float sc=u_res.y/400.;float e=.4*sc;int an=int(u_p1+.5);float col=0.;vec3 col2=vec3(0.);float sum=0.;
#define A2GV(pp) luma(O((pp)/u_res).rgb)
  for(int i=0;i<5;i++){if(i>=an)break;float ang=6.28318/float(an)*(float(i)+.8);vec2 v=vec2(cos(ang),sin(ang));vec2 vp=v.yx*vec2(1.,-1.);
   for(int j=0;j<16;j++){vec2 dpos=vp*float(j)*sc*u_p0;vec2 dpos2=v*float(j*j)/16.*.5*sc*u_p0;
    for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 p2=pos+sg*dpos+dpos2;vec2 p3=pos+(sg*dpos+dpos2).yx*vec2(1.,-1.)*2.;
     vec2 g=vec2(A2GV(p2+vec2(e,0.))-A2GV(p2-vec2(e,0.)),A2GV(p2+vec2(0.,e))-A2GV(p2-vec2(0.,e)))/e/2.;
     float fact=dot(g,v)-.5*abs(dot(g,vp));float fact2=abs(dot(normalize(g+vec2(.0001)),vp));fact=clamp(fact,0.,.05)*(1.-float(j)/16.);
     vec3 ht=smoothstep(.95,1.05,O(p3/u_res).rgb*.8+.2+hash(floor(p3*.7)));col+=fact;col2+=fact2*ht;sum+=fact2;}}}
  col*=sqrt(u_res.y)/(float(16*an)*.75);col2/=max(sum,1e-4);col*=.6+.8*hash(floor(pos*.7)+.5);col=1.-col;col=clamp(col,0.,1.);col=col*col*col;
  vec2 s=sin(pos*.1/sqrt(sc));int pm=int(u_p2+.5);vec3 karo=vec3(1.);if(pm==0)karo-=.5*vec3(.25,.1,.1)*dot(exp(-s*s*80.),vec2(1.));else if(pm==1)karo-=.5*vec3(.25,.1,.1)*exp(-s.y*s.y*80.);
  float r=length(pos-u_res*.5)/u_res.x;float vg=1.-r*r*r;return vec4(col*mix(vec3(1.),col2,u_p3)*karo*vg,1.);`,
  'port of the structure of flockaroo\'s Shadertoy "notebook drawings": for each of N directions, 16 curved sample offsets on both sides; gradient components along / across the direction give the pencil darkness (clamped, faded with distance), a halftoned colour sample weighted by the gradient alignment gives the colour; noise-modulated, cubed, on checkered / lined paper with vignette (no animation wobble); approx. reconstruction, not the verbatim shader');

f = add('Render');
f('shade_npr','Gooch / Oren-Nayar / Cook-Torrance Shading',[S('Model',['Gooch cool-to-warm','Oren-Nayar diffuse','Cook-Torrance specular']),S('Normals',['From luma (soft)','From luma (strong)','Image is a normal map']),P('Roughness',0,1,.4,.01),P('Light azimuth',0,360,135,1,'deg')],
  `int mo=int(u_p0+.5);int ns=int(u_p1+.5);vec3 alb=c.rgb;vec3 n;
  if(ns==2){n=normalize(c.rgb*2.-1.+vec3(0.,0.,1e-4));alb=vec3(.8);}else{vec2 g=sobelD(uv,(ns==0?2.:1.)*u_k);n=normalize(vec3(-g*(ns==0?1.5:4.),1.));}
  float az=radians(u_p3);vec3 l=normalize(vec3(cos(az),sin(az),mo==0?.6:1.));vec3 v=vec3(0.,0.,1.);vec3 h=normalize(l+v);float NL=dot(n,l),NV=max(dot(n,v),1e-3),NH=max(dot(n,h),1e-3),VH=max(dot(v,h),1e-3);vec3 o;
  if(mo==0){float t=.5+.5*NL;vec3 kc=vec3(0.,0.,.3)+.25*alb,kw=vec3(.25,.25,0.)+.6*alb;o=t*kw+(1.-t)*kc;o+=.5*pow(NH,mix(80.,6.,u_p2))*step(0.,NL);}
  else if(mo==1){float sg=u_p2*1.2;float s2=sg*sg;float A=1.-.5*s2/(s2+.33),B=.45*s2/(s2+.09);float ci=max(NL,0.);float ti=acos(clamp(NL,-1.,1.)),tr=acos(clamp(NV,-1.,1.));
   vec3 lp=l-n*NL,vp=v-n*NV;float cphi=(length(lp)>1e-4&&length(vp)>1e-4)?max(0.,dot(normalize(lp),normalize(vp))):0.;float al=max(ti,tr),be=min(ti,tr);
   o=alb*(.12+1.25*ci*(A+B*cphi*sin(al)*tan(be)));}
  else{float m=max(u_p2,.03);float m2=m*m,nh2=NH*NH;float D=exp((nh2-1.)/(m2*nh2))/(PI*m2*nh2*nh2);float F=.04+.96*pow(1.-VH,5.);float G=min(1.,min(2.*NH*NV/VH,2.*NH*max(NL,0.)/VH));
   float sp=NL>0.?D*F*G/(4.*max(NL,1e-3)*NV):0.;o=alb*(.15+.95*max(NL,0.))+vec3(sp*max(NL,0.)*1.5);}
  return vec4(clamp(o,0.,1.),1.);`,
  'per-pixel shading of normals taken from luminance relief (or the image as a tangent-space normal map), light from the azimuth at 45 deg elevation, orthographic view: Gooch et al. 1998 cool-to-warm (k_cool = blue 0.3 + 0.25 kd, k_warm = yellow 0.25 + 0.6 kd, light at 31 deg elevation, plus a Phong highlight whose tightness falls with roughness), Oren-Nayar 1994 qualitative model (sigma = 1.2 roughness), Cook-Torrance 1982 (Beckmann D with m = roughness, Schlick Fresnel F0 0.04, V-cavity G) over a Lambert base; image = albedo');

f = add('Retro');
f('ostro_screen','Artistic Screening (Ostromoukhov-Hersch)',[S('Motif',['Star to disc','Spiral','Flower','Waves']),P('Cell size',4,40,12,.5,'px'),P('Angle',0,90,30,1,'deg'),S('Color',['Black and white','CMY per channel'])],
  `int mo=int(u_p0+.5);bool cmy=u_p3>.5;vec3 res=vec3(1.);
  for(int ch=0;ch<3;ch++){if(!cmy&&ch>0)break;float D=cmy?1.-c.rgb[ch]:1.-luma(c.rgb);float ang=radians(u_p2+(cmy?float(ch)*30.:0.));vec2 q=rot(PX(uv),ang)/u_p1;vec2 fq=fract(q)-.5;float r=length(fq)*2.;float th=atan(fq.y,fq.x);float e;
   if(mo==0)e=1.13*sqrt(D)-r*(1.+.45*cos(5.*th)*(1.-D));
   else if(mo==1)e=D-fract(th/6.28318-r*1.2+.5*hash(floor(q)));
   else if(mo==2)e=1.13*sqrt(D)-r/(1.+.3*cos(6.*th+r*3.)*(1.-.5*D));
   else e=D-abs(fract(fq.y+.5+.15*sin(fq.x*6.28318+floor(q.y)))-.5)*2.;
   float ink=clamp(e/max(fwidth(e),1e-4)+.5,0.,1.);if(D<.01)ink=0.;if(D>.99)ink=1.;if(cmy)res[ch]=1.-ink;else res=vec3(1.-ink);}
  return vec4(res,1.);`,
  'after Ostromoukhov & Hersch 1995 (artistic screening): the screen element is a motif whose contour evolves with the tone (star growing into a disc, spiral arm thickening, rotating flower, waves) defined as an implicit dither function per cell; CMY mode uses three rotated screens; procedural motifs, not the paper\'s contour-interpolation editor');

f = add('Paint');
f('km_mix','Kubelka-Munk Pigment Mixing',[S('Mode',['Mix with pigment','Glaze layer of pigment','Wet mix with blurred self']),P('Pigment hue',0,360,220,1,'deg'),P('Concentration',0,1,.12,.01),P('Pigment chroma',0,1,.85,.01)],
  [BH('(u_p0>1.5?10.:0.)'),BV('(u_p0>1.5?10.:0.)'),
   `int mo=int(u_p0+.5);vec3 o0=O(uv).rgb;vec3 o=${LIN('o0')};vec3 pg0=mo==2?T(uv).rgb:hsv2rgb(vec3(u_p1/360.,u_p3,.85));vec3 pg=${LIN('pg0')};
#define A2KS(RR) ((1.-(RR))*(1.-(RR))/(2.*(RR)))
   vec3 Ro=clamp(o,.002,.998),Rp=clamp(pg,.002,.998);vec3 Rr;
   if(mo!=1){vec3 ks=mix(A2KS(Ro),A2KS(Rp),u_p2);Rr=1.+ks-sqrt(ks*ks+2.*ks);}
   else{vec3 kp=A2KS(Rp);vec3 a=1.+kp;vec3 b=sqrt(a*a-1.);vec3 bx=max(b*u_p2*1.5,vec3(1e-4));vec3 ch=(exp(bx)+exp(-bx))/(exp(bx)-exp(-bx));Rr=(1.-Ro*(a-b*ch))/(a-Ro+b*ch);}
   Rr=clamp(Rr,0.,1.);return vec4(${SRGB('Rr')},1.);`],
  'Kubelka-Munk single-constant model on linear RGB reflectances: K/S = (1 - R)^2 / 2R, mixtures add K/S by concentration, R = 1 + K/S - sqrt((K/S)^2 + 2 K/S) (so blue + yellow give green, unlike RGB averaging); glaze = KM layer over the image as substrate, R = (1 - Rg (a - b coth bSX)) / (a - Rg + b coth bSX), a = 1 + K/S, S X = 1.5 x concentration; wet mix = pigment from a blurred copy of the image');
