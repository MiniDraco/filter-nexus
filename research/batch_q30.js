/* ================= q30: Nikon Picture Controls, edge-preserving & robust filters (literature), scientific-imaging leftovers ================= */
f = add('Insta');
// Nikon look table: [name, sat, contrast, gamma, detail(+ sharpen / - soften), wb r,g,b, vignette, shadow tint r,g,b, lift, highlight tint r,g,b, highlight boost, mono, hue shift deg, hue centre]
const Q30_NIKON = [
  ['Dream', .92, .88, .84, -.55, 1.07, 1, .86, 0, .03, .015, -.02, .07, .02, .01, -.02, .04, 0, 0, .64],
  ['Morning', .95, .95, .9, 0, .93, .99, 1.08, 0, -.01, 0, .02, .05, -.01, 0, .02, 0, 0, 0, .64],
  ['Pop', 1.6, 1.12, .97, .1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .64],
  ['Sunday', 1.12, 1.3, .92, .1, 1.01, 1, .99, 0, 0, 0, 0, 0, 0, 0, 0, .2, 0, 0, .64],
  ['Somber', 1.3, 1.05, 1.4, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .64],
  ['Silence', .5, .82, .95, 0, 1, 1, 1, 0, 0, 0, 0, .03, 0, 0, 0, 0, 0, 0, .64],
  ['Bleached', .4, 1.3, 1, .5, .96, 1.04, .97, 0, 0, .01, 0, 0, 0, .01, 0, 0, 0, 0, .64],
  ['Melancholic', .62, .88, 1, -.35, 1.04, .93, 1.03, 0, .015, -.01, .02, .04, 0, 0, 0, 0, 0, 0, .64],
  ['Pure', .8, .82, .95, -.25, 1, 1, 1, 0, -.02, 0, .05, .05, -.03, -.005, .03, 0, 0, 0, .64],
  ['Denim', 1.25, 1.08, 1.08, 0, .88, .98, 1.15, 0, 0, 0, .01, 0, 0, 0, 0, 0, 0, -30, .64],
  ['Toy', 1.3, 1.12, 1.02, 0, 1, 1, 1, .55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, .64],
  ['Carbon', 0, 1.18, 1.5, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, .64],
  ['Flat Monochrome', 0, .72, .95, 0, 1, 1, 1, 0, 0, 0, 0, .02, 0, 0, 0, 0, 1, 0, .64],
  ['Deep Tone Monochrome', 0, 1.15, 1.55, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, .18, 1, 0, .64],
  ['Rich Tone Portrait', 1.18, 1, .98, 0, 1.02, 1, .99, 0, 0, 0, 0, 0, 0, 0, 0, -.12, 0, 0, .64],
];
const Q30_V4 = (k) => `const vec4 Q30${k}[${Q30_NIKON.length}]=vec4[${Q30_NIKON.length}](` +
  Q30_NIKON.map(r => `vec4(${[...r.slice(1 + 4 * k, 5 + 4 * k), 0, 0, 0, 0].slice(0, 4).map(v => (+v).toFixed(3)).join(',')})`).join(',') + ');';
f('q30_nikon_pc','Nikon Picture Controls (Creative + Flat / Deep Tone Mono, Rich Tone Portrait)',[S('Picture Control',Q30_NIKON.map(r => r[0])),P('Effect level',0,100,100,10),P('Contrast',-3,3,0,.5),P('Brightness',-1,1,0,.05,'EV')],
  [BH('2.5'), BV('2.5'), `int m=int(u_p0+.5);${[0, 1, 2, 3, 4].map(Q30_V4).join('')}
 vec4 A=Q300[m],B=Q301[m],C=Q302[m],H=Q303[m],E=Q304[m];float ev=exp2(u_p3);
 vec3 o=clamp(O(uv).rgb*ev,0.,1.),bl=clamp(T(uv).rgb*ev,0.,1.);vec3 x=clamp(o+(o-bl)*A.w,0.,1.);x=clamp(x*B.rgb,0.,1.);
 if(E.x>.5)x=vec3(dot(x,vec3(.3,.59,.11)));
 vec3 hv=rgb2hsv(x);float dh=abs(hv.x-E.z);dh=min(dh,1.-dh);hv.x=fract(hv.x+1.+E.y/360.*max(1.-dh/.12,0.)*smoothstep(.04,.25,hv.y));x=hsv2rgb(hv);
 float l=luma(x);x=max(vec3(l)+(x-l)*A.x,0.);x=pow(clamp(x,1e-4,1.),vec3(A.z));
 float cc=A.y*(1.+.15*u_p2);x=clamp(x,1e-4,.9999);vec3 xg=pow(x,vec3(cc));x=xg/(xg+pow(1.-x,vec3(cc)));
 x=C.w+(1.-C.w)*x;l=luma(x);x+=C.rgb*(1.-l)*(1.-l)*1.6+H.rgb*l*l*1.6;x+=H.w*smoothstep(.35,1.,x)*(1.-x)*2.;
 vec2 q=(uv-.5)*vec2(asp(),1.)/max(asp(),1.);x*=1.-B.w*dot(q,q)*1.8;
 return vec4(mix(o,clamp(x,0.,1.),u_p1/100.),1.);`],
  'look approximations of Nikon Picture Controls from Nikon\'s own descriptions (Z-series manuals / Digitutor): Dream amber cast + lifted shadows + softened outlines; Morning blue cast, lifted shadows; Pop highest saturation; Sunday contrast + bright highlights; Somber saturation up, brightness down; Silence low saturation; Bleached desaturated green-cast metallic; Melancholic magenta cast, less saturation and sharpness; Pure blue cast in shadows and highlights, veiled; Denim strong blue, saturation up, blues toward cyan; Toy saturation up, blues toward indigo (+ mild vignette, assumed); Carbon dense black-based mono; Flat Monochrome soft mono; Deep Tone Monochrome dark shadows / mids rising sharply into highlights; Rich Tone Portrait more vivid than Portrait with protected highlights - approx., not measured');

/* ---- robust / edge-preserving filters (literature) ---- */
f = add('Blur');
f('q30_robust_vector','Robust Vector Filters (VMF / BVDF / Olympic / Peer Group)',[S('Method',['Vector median (Astola 1990)','Basic vector directional (Trahanias 1993)','Olympic (trimmed extremes)','Peer group (Deng-Kenney)']),S('Window',['3x3','5x5']),P('Peer impulse size',1,4,1,1),P('Peer spatial sigma',.5,4,1.5,.1)],
  `int r=int(u_p1+.5)+1;int m=int(u_p0+.5);vec3 s[25];float w[25];int n=0;float e=max(u_k,1.);
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>r||abs(j)>r)continue;s[n]=T(uv+vec2(float(i),float(j))*u_px*e).rgb;w[n]=exp(-float(i*i+j*j)/(2.*u_p3*u_p3));n++;}
 if(m==2){vec3 mx=vec3(0.),mn=vec3(1.),sm=vec3(0.);for(int k=0;k<25;k++){if(k>=n)break;sm+=s[k];mx=max(mx,s[k]);mn=min(mn,s[k]);}return vec4((sm-mx-mn)/float(n-2),1.);}
 if(m<2){int bi=0;float bd=1e9;for(int k=0;k<25;k++){if(k>=n)break;float d=0.;for(int q=0;q<25;q++){if(q>=n)break;
   d+=m==0?length(s[k]-s[q]):acos(clamp(dot(s[k],s[q])/max(length(s[k])*length(s[q]),1e-6),-1.,1.));}if(d<bd){bd=d;bi=k;}}return vec4(s[bi],1.);}
 int ci=n/2;vec3 c0=s[ci];float dd[25];vec3 ss[25];float ww[25];
 for(int k=0;k<25;k++){if(k>=n)break;float d=length(s[k]-c0);int p=k;for(int q=24;q>0;q--){if(q>k)continue;if(dd[q-1]<=d){p=q;break;}dd[q]=dd[q-1];ss[q]=ss[q-1];ww[q]=ww[q-1];p=q-1;}dd[p]=d;ss[p]=s[k];ww[p]=w[k];}
 float tot=0.,tq=0.;for(int k=0;k<25;k++){if(k>=n)break;tot+=dd[k];tq+=dd[k]*dd[k];}
 float a1=0.,q1=0.,bj=-1.;int pm=n;for(int i=1;i<25;i++){if(i>=n)break;a1+=dd[i-1];q1+=dd[i-1]*dd[i-1];float n1=float(i),n2=float(n-i);
   float m1=a1/n1,m2=(tot-a1)/n2;float v1=q1-n1*m1*m1,v2=(tq-q1)-n2*m2*m2;float J=(m1-m2)*(m1-m2)/max(v1+v2,1e-6);if(J>bj){bj=J;pm=i;}}
 if(float(pm)<=u_p2){int bi=0;float bd=1e9;for(int k=0;k<25;k++){if(k>=n)break;float d=0.;for(int q=0;q<25;q++){if(q>=n)break;d+=length(s[k]-s[q]);}if(d<bd){bd=d;bi=k;}}return vec4(s[bi],1.);}
 vec3 acc=vec3(0.);float ws=0.;for(int k=0;k<25;k++){if(k>=pm)break;acc+=ss[k]*ww[k];ws+=ww[k];}return vec4(acc/ws,1.);`,
  'Astola, Haavisto & Neuvo 1990 vector median (window sample with least summed L2 distance); Trahanias & Venetsanopoulos 1993 basic vector directional filter (least summed vector angle); Olympic filter = per-channel mean with the minimum and maximum removed; Deng & Kenney peer group filtering: neighbours sorted by colour distance to the centre, peer group size by the Fisher discriminant split of the sorted distances, output = Gaussian-weighted peer-group mean; a centre whose peer group is no larger than Peer impulse size is treated as an impulse and replaced by the vector median (simplified impulse test)');

const Q30_SM = [...Array(12)].map((_, i) => `if(${i}.>=u_p0)return T(uv);vec2 e=u_px*max(u_k,1.);float k2=2.*u_p1*u_p1;vec3 acc=vec3(0.);float ws=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*e;float gx=(L(q+vec2(e.x,0.))-L(q-vec2(e.x,0.)))*.5,gy=(L(q+vec2(0.,e.y))-L(q-vec2(0.,e.y)))*.5;
 float w=exp(-(gx*gx+gy*gy)/k2);acc+=T(q).rgb*w;ws+=w;}return vec4(acc/ws,1.);`);
f('q30_saintmarc','Adaptive Smoothing (Saint-Marc, Chen & Medioni 1991)',[P('Iterations',1,12,6,1),P('k (edge scale)',.005,.2,.03,.005)],Q30_SM,
  'Saint-Marc, Chen & Medioni 1991 adaptive smoothing: iterated 3x3 average weighted by w = exp(-|grad I|^2 / (2 k^2)) at each neighbour (central-difference luma gradient), so smoothing stops at edges');

const Q30_SW = [...Array(10)].map((_, i) => `if(${i}.>=u_p1)return T(uv);int r=int(u_p0+.5);vec2 e=u_px*max(u_k,1.);vec3 c0=T(uv).rgb;
 vec3 qa=vec3(0.),qb=vec3(0.),qc=vec3(0.),qd=vec3(0.),aw=vec3(0.),ae=vec3(0.),an=vec3(0.),as_=vec3(0.);
 for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(i)>r||abs(j)>r||(i==0&&j==0))continue;vec3 v=T(uv+vec2(float(i),float(j))*e).rgb;
  if(j==0){if(i<0)aw+=v;else ae+=v;}else if(i==0){if(j<0)as_+=v;else an+=v;}else if(i<0){if(j<0)qc+=v;else qa+=v;}else{if(j<0)qd+=v;else qb+=v;}}
 float R1=float(r),h=(R1+1.)*(2.*R1+1.),qn=(R1+1.)*(R1+1.);
 vec3 m[8];m[0]=(qa+qc+aw+an+as_+c0)/h;m[1]=(qb+qd+ae+an+as_+c0)/h;m[2]=(qa+qb+an+aw+ae+c0)/h;m[3]=(qc+qd+as_+aw+ae+c0)/h;
 m[4]=(qa+aw+an+c0)/qn;m[5]=(qb+ae+an+c0)/qn;m[6]=(qc+aw+as_+c0)/qn;m[7]=(qd+ae+as_+c0)/qn;
 vec3 best=m[0];for(int k=1;k<8;k++){best=mix(best,m[k],vec3(lessThan(abs(m[k]-c0),abs(best-c0))));}return vec4(best,1.);`);
f('q30_sidewindow','Side Window Box Filter (Yin, Gong & Qiu 2019)',[P('Radius',1,8,3,1,'px'),P('Iterations',1,10,4,1)],Q30_SW,
  'Yin, Gong & Qiu, CVPR 2019 side window filtering (box kernel): per channel the mean of each of the 8 side windows (left / right / up / down half windows and the 4 quarter windows, all containing the pixel) is computed and the one closest to the current value is taken; iterated');

const Q30_CF = [...Array(32)].map((_, i) => `if(${Math.floor(i / 4)}.>=u_p1)return T(uv);
#define Q30PK(d,e) mix((d),(e),vec3(lessThan(abs(e),abs(d))))
vec2 pp=floor(uv*u_res);if(mod(pp.x,2.)!=${i % 2}.||mod(pp.y,2.)!=${Math.floor(i / 2) % 2}.)return T(uv);vec2 e=u_px;
 vec3 U=T(uv).rgb,u=T(uv+vec2(0.,e.y)).rgb,dn=T(uv-vec2(0.,e.y)).rgb,lf=T(uv-vec2(e.x,0.)).rgb,rt=T(uv+vec2(e.x,0.)).rgb,
 ul=T(uv+vec2(-e.x,e.y)).rgb,ur=T(uv+e).rgb,dl=T(uv-e).rgb,dr=T(uv+vec2(e.x,-e.y)).rgb;int m=int(u_p0+.5);vec3 d;
 if(m==0){d=(u+dn)*.5-U;d=Q30PK(d,(lf+rt)*.5-U);d=Q30PK(d,(ul+dr)*.5-U);d=Q30PK(d,(ur+dl)*.5-U);d=Q30PK(d,(u+lf+ul)/3.-U);d=Q30PK(d,(u+rt+ur)/3.-U);d=Q30PK(d,(lf+dn+dl)/3.-U);d=Q30PK(d,(rt+dn+dr)/3.-U);}
 else if(m==1){d=(2.5*(u+dn)+5.*rt-ur-dr-8.*U)/8.;d=Q30PK(d,(2.5*(lf+rt)+5.*u-ul-ur-8.*U)/8.);d=Q30PK(d,(2.5*(u+dn)+5.*lf-ul-dl-8.*U)/8.);d=Q30PK(d,(2.5*(lf+rt)+5.*dn-dl-dr-8.*U)/8.);}
 else{d=(u+dn+rt+ur+dr)/5.-U;d=Q30PK(d,(lf+rt+u+ul+ur)/5.-U);d=Q30PK(d,(u+dn+lf+ul+dl)/5.-U);d=Q30PK(d,(lf+rt+dn+dl+dr)/5.-U);
  d=Q30PK(d,(ur+rt+dr+dn+dl)/5.-U);d=Q30PK(d,(ul+u+ur+rt+dr)/5.-U);d=Q30PK(d,(dl+lf+ul+u+ur)/5.-U);d=Q30PK(d,(ul+lf+dl+dn+dr)/5.-U);}
 return vec4(U+d,1.);`);
f('q30_curvature_filter','Curvature Filters (Gong & Sbalzarini 2017: GC / MC / TV)',[S('Filter',['Gaussian curvature (GC)','Mean curvature (MC)','Total variation (TV)']),P('Iterations',1,8,4,1)],Q30_CF,
  'Gong & Sbalzarini 2017 (IEEE TIP) curvature filters: each pixel moves by the smallest of the half-window projection distances (GC: 8 tangent-plane projections; MC: 4 half-window kernels with weights 2.5 / 5 / -1, /8; TV: 8 five-pixel half / corner windows, /5) - per RGB channel, on the 4-set checkerboard domain decomposition (4 passes per iteration), on working pixels');

const Q30_GBOX = (dir, sw) => `float r=R(u_p1);float st=max(1.,r/24.);vec2 e=${dir}*u_px;vec4 acc=vec4(0.);float n=0.;for(int i=-24;i<=24;i++){float x_=float(i)*st;if(abs(x_)>r)continue;vec4 v=T(uv+e*x_);acc+=${sw};n+=1.;}`;
f('q30_edge_guided','Edge-Aware Guided Filters (WGIF Li 2015 / GDGF Kou 2015)',[S('Method',['Weighted guided (WGIF)','Gradient domain guided (GDGF)']),P('Radius',1,24,6,1,'px'),P('Lambda',.001,.3,.05,.001),P('Detail boost',0,4,0,.1)],
  [`float y0=luma(O(uv).rgb);vec2 e1=u_px*max(u_k,1.);float s1=0.,s2=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float v=luma(O(uv+vec2(float(i),float(j))*e1).rgb);s1+=v;s2+=v*v;}
 float v3=max(s2/9.-s1*s1/81.,0.);${Q30_GBOX('vec2(1.,0.)', 'vec4(luma(v.rgb),luma(v.rgb)*luma(v.rgb),0.,0.)')}return vec4(acc.xy/n,v3,1.);`,
   `vec4 b=box1d(u_tex,uv,vec2(0.,1.),R(u_p1));return vec4(b.xy,T(uv).z,1.);`,
   `vec4 t0=T(uv);float mu=t0.x,va=max(t0.y-mu*mu,0.),ep=1e-6;int m=int(u_p0+.5);float si=0.,cs=0.,cm=0.,cn=1e9;
 for(int j=0;j<10;j++)for(int i=0;i<10;i++){vec4 g=T((vec2(float(i),float(j))+.5)/10.);float chi=sqrt(max(g.z,0.))*sqrt(max(g.y-g.x*g.x,0.));
  si+=1./(g.z+ep);cs+=1./(chi+ep);cm+=chi;cn=min(cn,chi);}si/=100.;cs/=100.;cm/=100.;float a;
 if(m==0){float G=(t0.z+ep)*si;a=va/(va+u_p2*u_p2/G);}
 else{float chi=sqrt(max(t0.z,0.))*sqrt(va);float G=(chi+ep)*cs;float eta=4./max(cm-cn,1e-5);float ga=1.-1./(1.+exp(eta*(chi-cm)));float lg=u_p2*u_p2/G;a=(va+lg*ga)/(va+lg);}
 a=clamp(a,0.,1.);return vec4(a,mu*(1.-a),0.,1.);`,
   `vec4 b=box1d(u_tex,uv,vec2(1.,0.),R(u_p1));return vec4(b.xy,0.,1.);`,
   `vec2 ab=box1d(u_tex,uv,vec2(0.,1.),R(u_p1)).xy;vec3 o=O(uv).rgb;float y=luma(o);float q=ab.x*y+ab.y;return vec4(clamp(o+(q-y)+(y-q)*u_p3,0.,1.),1.);`],
  'self-guided on luma, colour restored by adding the luma change: WGIF (Li, Zheng, Zhu, Yao & Wu 2015) a = var / (var + lambda / Gamma), Gamma(p) = (sigma3x3^2(p) + eps) x mean over the image of 1 / (sigma3x3^2 + eps); GDGF (Kou, Chen, Wen & Li 2015) a = (var + gamma lambda / Gamma) / (var + lambda / Gamma) with chi = sigma3x3 sigma_r, gamma = 1 - 1 / (1 + exp(eta (chi - mean chi))), eta = 4 / (mean chi - min chi); b = mean (1 - a); a, b box-averaged. Lambda is given as a standard deviation (squared internally); image means from a 10x10 sample grid; Detail boost adds back (1 + boost) x the removed detail');

f('q30_linear_kuwahara','Linear Kuwahara (Fiji)',[P('Number of angles',2,30,30,1),P('Line length',3,21,11,2,'px'),S('Criterion',['Variance','Variance / Mean','Variance / Mean^2'])],
  `int na=int(u_p0+.5);int h=int(u_p1+.5)/2;float stp=floor(180./float(na));float best=1e9;vec3 res=c.rgb;vec2 p0=PX(uv);int cr=int(u_p2+.5);float Lf=float(2*h+1);
 for(int a=0;a<30;a++){if(a>=na)break;float th=radians(stp*float(a));vec2 dd=vec2(cos(th),sin(th));vec3 pc[42];float pl[42],pq[42];pc[0]=vec3(0.);pl[0]=0.;pq[0]=0.;
  for(int u=-20;u<=20;u++){if(abs(u)>2*h)continue;int k=u+2*h+1;vec3 v=O(fromPX(floor(p0+dd*float(u))+.5)).rgb;float l=luma(v);pc[k]=pc[k-1]+v;pl[k]=pl[k-1]+l;pq[k]=pq[k-1]+l*l;}
  for(int s=-10;s<=10;s++){if(abs(s)>h)continue;int k0=s+h,k1=s+3*h+1;float ml=(pl[k1]-pl[k0])/Lf;float vv=max((pq[k1]-pq[k0])/Lf-ml*ml,0.);
   float cv=cr==0?vv:cr==1?vv/(ml+1e-6):vv/(ml*ml+1e-6);if(cv<best){best=cv;res=(pc[k1]-pc[k0])/Lf;}}}
 return vec4(res,1.);`,
  'Fiji Linear Kuwahara (Kuwahara_LinearStructure_Filter_v3): straight line kernels of the given length at angles k x floor(180 / N) deg; for every angle the line is also shifted along itself over the pixel, and the shifted line with the smallest criterion (variance, variance / mean, variance / mean^2) over all angles gives the output mean; criterion on luma, mean in RGB; lines rasterised by nearest pixel (approx. of ImageJ\'s rotated kernel images)');

f = add('Sharpen');
f('q30_erdas_crisp','Crisp (ERDAS IMAGINE)',[P('Amount',0,2,1,.05),P('Scale',1,4,1,.5,'px')],
  `vec3 mu=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)mu+=O((vec2(float(i),float(j))+.5)/12.).rgb;mu/=144.;mat3 C=mat3(0.);
 for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 d=O((vec2(float(i),float(j))+.5)/12.).rgb-mu;C+=outerProduct(d,d);}
 vec3 e1=normalize(vec3(.577,.577,.577)+1e-3);for(int k=0;k<16;k++)e1=normalize(C*e1+1e-7);
 vec2 e=u_px*R(u_p1);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;s+=dot(O(uv+vec2(float(i),float(j))*e).rgb-mu,e1);}
 vec3 o=O(uv).rgb;float p=dot(o-mu,e1);float ps=(16.*p-s)/8.;return vec4(clamp(o+e1*(ps-p)*u_p0,0.,1.),1.);`,
  'ERDAS IMAGINE Crisp: principal components of the bands (here from a 12x12 sample grid, PC1 by power iteration), PC1 sharpened with a 3x3 summary kernel (-1 surround, 16 centre, /8), then the inverse transform - only the PC1 axis changes, so inter-band variance is kept (kernel assumed from the ERDAS summary filter; approx.)');

f = add('Repair');
f('q30_replace_bad_lines','Replace Bad Lines (ERDAS IMAGINE)',[S('Direction',['Rows','Columns']),P('Threshold',.01,.5,.08,.01),S('Replace with',['Average of adjacent lines','Line above / left','Line below / right']),S('Show',['Result','Detected lines'])],
  `bool col=u_p0>.5;vec2 ax=col?vec2(u_px.x,0.):vec2(0.,u_px.y);float m0=0.,a1=0.,b1=0.,a2=0.,b2=0.;
 for(int i=0;i<64;i++){float tt=(float(i)+.5)/64.;vec2 q=col?vec2(uv.x,tt):vec2(tt,uv.y);m0+=luma(O(q).rgb);a1+=luma(O(q+ax).rgb);b1+=luma(O(q-ax).rgb);a2+=luma(O(q+2.*ax).rgb);b2+=luma(O(q-2.*ax).rgb);}
 m0/=64.;a1/=64.;b1/=64.;a2/=64.;b2/=64.;float th=u_p1;bool s1=abs(m0-.5*(a1+b1))>th&&abs(a1-b1)<th;
 float rA=.5*(a2+b1),rB=.5*(a1+b2);bool dA=abs(a2-b1)<th&&abs(m0-rA)>th&&(a1-rA)*sign(m0-rA)>th*.5,dB=abs(a1-b2)<th&&abs(m0-rB)>th&&(b1-rB)*sign(m0-rB)>th*.5;bool bad=s1||dA||dB;
 if(u_p3>.5)return vec4(bad?vec3(1.,0.,0.):O(uv).rgb*.5,1.);if(!bad)return O(uv);int m=int(u_p2+.5);
 vec3 a=O(uv+(dA?2.:1.)*ax).rgb,b=O(uv-(dB?2.:1.)*ax).rgb;return vec4(m==0?(a+b)*.5:m==1?(col?b:a):(col?a:b),1.);`,
  'ERDAS IMAGINE Replace Bad Lines (radiometric utility): bad scan lines are replaced by the average of the adjacent lines, or by the previous / next line; here the bad rows / columns are found automatically (line mean differs from the mean of its two neighbours by more than Threshold while the neighbours agree; pairs of adjacent bad lines are bridged from the next good lines) instead of a typed line list - approx.');

f = add('Render');
f('q30_vtk_texture','VTK Boolean / Triangular Texture',[S('Texture',['Boolean (vtkBooleanTexture)','Triangular: opaque at vertices','Triangular: opaque at centroid']),P('Cell size',8,200,48,1,'px'),P('Thickness / Scale factor',0,4,1,.05),P('Boolean case',0,15,6,1)],
  `int m=int(u_p0+.5);vec2 p=PX(uv)/u_p1;vec3 o=O(uv).rgb;vec2 ta;
 if(m==0){float X=12.,th=floor(u_p2+.5);vec2 ij=floor(fract(p)*X);float lo=floor((X-1.)*.5-th*.5),hi=floor((X-1.)*.5+th*.5);
  int cs=int(u_p3+.5);vec2 io=vec2(ij.x<lo?0.:ij.x>hi?2.:1.,ij.y<lo?0.:ij.y>hi?2.:1.);
  if(io.x==1.||io.y==1.)ta=vec2(0.,1.);else{int bit=int(io.x*.5)+2*int(io.y*.5);ta=((cs>>bit)&1)==1?vec2(1.,1.):vec2(1.,0.);}}
 else{vec2 sk=vec2(p.x-p.y*.57735,p.y*1.1547);vec2 b=fract(sk);vec2 tc=b.x+b.y<1.?b:1.-b.yx;
  vec2 pt=tc.x*vec2(1.,0.)+tc.y*vec2(.5,.866);float X=64.;pt=floor(pt*X)/(X+1.);
  float d=min(length(pt),min(length(pt-vec2(1.,0.)),length(pt-vec2(.5,.866))));float op=d*u_p2>.5?1.:0.;if(m==1)op=1.-op;ta=vec2(1.,op);}
 return vec4(mix(vec3(1.),o*ta.x,ta.y),1.);`,
  'VTK texture sources ported: vtkBooleanTexture (12x12 texels, regions in/on/out of two implicit functions, Thickness = on-band width in texels; Boolean case bits pick which in/out quadrants are solid (intensity 255, alpha 255) or clear (alpha 0), on-bands are edge (intensity 0, alpha 255), as in the VTK clipping-texture examples) tiled per cell; vtkTriangularTexture (64x64 texels, opacity from the distance to the nearest triangle vertex x Scale factor, thresholded at 0.5) mapped onto an equilateral-triangle mesh; texture modulates the image, transparent texels show white');
