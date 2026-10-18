/* ================= q56: round-20 DIPlib / Octave+JuliaImages / bruges / TopoToolbox ports ================= */
// separable mixed min/max pass: ops = 4 chars per channel (M max, m min, c carry centre); rad = 4 GLSL radius exprs (param px); src(q) = GLSL vec4 source at q
const Q56_MW = (dir, ops, rad, src, tail) => {
  const ch = 'xyzw'; let upd = '';
  for (let k = 0; k < 4; k++) { const o = ops[k]; if (o === 'c') continue; upd += `if(ao<=r${k})m.${ch[k]}=${o === 'M' ? 'max' : 'min'}(m.${ch[k]},v.${ch[k]});`; }
  return `float r0=R(${rad[0]}),r1=R(${rad[1]}),r2=R(${rad[2]}),r3=R(${rad[3]});float rm=max(max(r0,r1),max(r2,r3));float st=max(1.,rm/32.);vec4 m=${src('uv')};
 for(int i=-32;i<=32;i++){float o=float(i)*st;float ao=abs(o);if(ao>rm)continue;vec2 q=uv+${dir}*o*u_px;vec4 v=${src('q')};${upd}}${tail || 'return m;'}`;
};
const Q56_SL = q => `vec4(vec2(luma(O(${q}).rgb)),0.,1.)`;
const Q56_ST = q => `T(${q})`;
const Q56_H = 'vec2(1.,0.)', Q56_V = 'vec2(0.,1.)';

f = add('Blur');
f('q56_banana','Adaptive Banana Filter (DIPlib AdaptiveBanana)',[P('Sigma along',1,12,5,.1,'px'),P('Sigma across',.3,4,1,.05,'px'),P('Tensor scale',1,12,4,.5,'px'),P('Curvature gain',0,2,1,.05)],[
  `vec2 d=u_px;float gx=2.*(L(uv+vec2(d.x,0.))-L(uv-vec2(d.x,0.))),gy=2.*(L(uv+vec2(0.,d.y))-L(uv-vec2(0.,d.y)));gx=clamp(gx,-1.,1.);gy=clamp(gy,-1.,1.);return vec4(gx*gx,.5+.5*gx*gy,gy*gy,1.);`,
  BH('u_p2'), BV('u_p2'),
  `vec4 a=T(uv);float jxx=a.r,jxy=a.g*2.-1.,jyy=a.b;vec2 v=vec2(jxx-jyy,2.*jxy);float n=length(v);vec2 e=n>1e-6?v/n:vec2(1.,0.);return vec4(.5+.5*e,clamp(n/(jxx+jyy+1e-6),0.,1.),1.);`,
  `vec2 e=T(uv).xy*2.-1.;float phi=.5*atan(e.y,e.x);vec2 g=vec2(cos(phi),sin(phi));vec2 t=vec2(-g.y,g.x);float hh=2.;
 vec2 ep=T(uv+t*hh*u_px).xy*2.-1.,em=T(uv-t*hh*u_px).xy*2.-1.;float dth=.5*atan(em.x*ep.y-em.y*ep.x,dot(em,ep));
 float su=R(u_p0),sv=max(R(u_p1),.3);float kc=dth/(2.*hh)*u_p3;kc=clamp(kc,-1./(1.5*su),1./(1.5*su));vec3 acc=vec3(0.);float ws=0.;
 for(int i=-12;i<=12;i++){float u=float(i)/4.*su;for(int j=-2;j<=2;j++){float w_=float(j)*sv;vec2 p=t*u-g*(kc*u*u*.5)+g*w_;float wt=exp(-u*u/(2.*su*su)-w_*w_/(2.*sv*sv));acc+=O(uv+p*u_px).rgb*wt;ws+=wt;}}
 return vec4(acc/ws,1.);`],
  'DIPlib AdaptiveBanana: Gaussian (sigma along the contour, sigma across) whose axis follows the local orientation and bends with the local curvature (parabolic "banana" path). As in the DIPlib example, orientation comes from the structure tensor (central-difference gradients, Gaussian tensor scale); curvature = change of the doubled-angle orientation along the contour; 25 x 5 samples, linear interpolation');

f('q56_selection','Selection Filter (DIPlib SelectionFilter)',[S('Control',['Luma','Laplacian','Saturation'],1),S('Mode',['Minimum','Maximum']),P('Size',1,7,2,.5,'px'),P('Threshold',0,.2,0,.005)],[
  `int cm=int(u_p0+.5);float l=luma(c.rgb);float ctl;
 if(cm==0)ctl=l;else if(cm==1){vec2 d=u_px*max(1.,u_k);float lp=L(uv+vec2(d.x,0.))+L(uv-vec2(d.x,0.))+L(uv+vec2(0.,d.y))+L(uv-vec2(0.,d.y))-4.*l;ctl=clamp(.5+lp,0.,1.);}
 else{float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));ctl=mx>0.?(mx-mn)/mx:0.;}
 return vec4(c.rgb,ctl);`,
  `bool mx=u_p1>.5;float r=R(u_p2);float st=max(1.,r/7.);vec4 ce=T(uv);float best=ce.a,bd=0.;vec3 sel=ce.rgb;
 for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 o=vec2(float(i),float(j))*st;float d=length(o);if(d>r+.01)continue;vec4 v=T(uv+o*u_px);
  float s_=mx?-v.a:v.a,b_=mx?-best:best;if(s_<b_-1e-5||(abs(s_-b_)<=1e-5&&d<bd)){best=v.a;bd=d;sel=v.rgb;}}
 if(u_p3>0.&&(mx?best-ce.a:ce.a-best)<u_p3)sel=ce.rgb;return vec4(sel,1.);`],
  'DIPlib SelectionFilter: for each pixel, the input value taken where the control image is minimal (or maximal) inside the disc window; ties go to the pixel closest to the centre; with threshold > 0 the extreme must differ from the centre control value by at least threshold, else the centre is kept. Control derived from the image (luma, 4-neighbour Laplacian - the edge-sharpening use - or HSV saturation)');

f = add('Analysis');
f('q56_morphcomp','Morphological Gist / Threshold / Range / Lee (DIPlib)',[S('Operator',['Gist','Threshold smoothing','Range','Lee edge (unsigned)','Lee edge (signed)']),S('Edge type',['Texture','Object','Both']),P('Size',1,15,3,1,'px'),P('Gain',1,12,2.5,.1)],[
  Q56_MW(Q56_H,'Mmcc',['u_p2','u_p2','0.','0.'],Q56_SL),
  Q56_MW(Q56_V,'Mmcc',['u_p2','u_p2','0.','0.'],Q56_ST,'return vec4(m.x,m.y,m.x,m.y);'),
  Q56_MW(Q56_H,'mMcc',['u_p2','u_p2','0.','0.'],Q56_ST),
  Q56_MW(Q56_V,'mMcc',['u_p2','u_p2','0.','0.'],Q56_ST),
  `vec4 a=T(uv);float C=a.x,Op=a.y,D=a.z,E=a.w;float I=luma(O(uv).rgb);int op=int(u_p0+.5),et=int(u_p1+.5);
 float A=et==2?D:C,B=et==2?E:Op;float v;
 if(op==0)v=et==1?(C-D-E+Op)*.5:I-(A+B)*.5;
 else if(op==1)v=et==1?(D-C+E-Op)*.5+I:(A+B)*.5;
 else if(op==2)v=et==1?(D-C)-E+Op:A-B;
 else{float p1=et==1?D-C:A-I,p2=et==1?Op-E:I-B;v=op==3?min(p1,p2):(p1<=p2?p1:-p2);}
 vec3 o3;if(op==1)o3=O(uv).rgb+(v-I);else if(op==2||op==3)o3=vec3(clamp(v*u_p3*(op==2?.4:1.),0.,1.));else o3=vec3(clamp(.5+v*u_p3,0.,1.));return vec4(o3,1.);`],
  'DIPlib morphology/filters.cpp on luma, square SE of half-size Size (separable): Texture uses closing C / opening O, Both uses dilation D / erosion E, Object the composed forms from the source. Gist = I-(A+B)/2 (Object: (C-D-E+O)/2); MorphologicalThreshold = (A+B)/2 (Object: (D-C+E-O)/2+I), applied to colour as a luma offset; Range = A-B (Object: D-C-E+O); Lee = min(A-I, I-B) (Object: min(D-C, O-E)), signed variant returns -second term when it is the smaller (SignedInfimum assumed). Signed outputs shown around mid-grey');

f('q56_msmg','Multi-Scale Morphological Gradient (DIPlib)',[P('Lower size',1,8,3,1,'px'),P('Upper size',1,15,9,1,'px'),P('Gain',1,30,10,.1),S('Display',['Grey','Inferno'])],[
  Q56_MW(Q56_H,'MmMm',['u_p0','u_p0','floor((u_p0+max(u_p1,u_p0))*.5+.5)','floor((u_p0+max(u_p1,u_p0))*.5+.5)'],Q56_SL),
  Q56_MW(Q56_V,'MmMm',['u_p0','u_p0','floor((u_p0+max(u_p1,u_p0))*.5+.5)','floor((u_p0+max(u_p1,u_p0))*.5+.5)'],Q56_ST,'return vec4(m.x-m.y,m.z-m.w,0.,1.);'),
  Q56_MW(Q56_H,'mmcc',['u_p0-1.','floor((u_p0+max(u_p1,u_p0))*.5+.5)-1.','0.','0.'],Q56_ST),
  Q56_MW(Q56_V,'mmcc',['u_p0-1.','floor((u_p0+max(u_p1,u_p0))*.5+.5)-1.','0.','0.'],Q56_ST,'return vec4(0.,0.,0.,(m.x+m.y)*.5);'),
  Q56_MW(Q56_H,'Mmcc',['max(u_p1,u_p0)','max(u_p1,u_p0)','0.','0.'],q => `vec4(vec2(luma(O(${q}).rgb)),0.,T(${q}).w)`),
  Q56_MW(Q56_V,'Mmcc',['max(u_p1,u_p0)','max(u_p1,u_p0)','0.','0.'],Q56_ST,'return vec4(m.x-m.y,0.,0.,m.w);'),
  Q56_MW(Q56_H,'mccc',['max(u_p1,u_p0)-1.','0.','0.','0.'],Q56_ST),
  Q56_MW(Q56_V,'mccc',['max(u_p1,u_p0)-1.','0.','0.','0.'],Q56_ST,'float gg=clamp((2.*m.w+m.x)/3.*u_p2,0.,1.);return vec4(u_p3>.5?ramp(1,gg):vec3(gg),1.);')],
  'DIPlib MultiScaleMorphologicalGradient on luma: at scale s the gradient dilation - erosion with a (2s+1) SE is eroded with a (2s-1) SE, then averaged over scales; approx.: square SEs (separable) and 3 sampled scales (lower, middle, upper) instead of every integer size');

f = add('Repair');
f('q56_rankminclose','Rank-Min Closing / Rank-Max Opening (DIPlib, Soille)',[S('Operation',['Rank-min closing','Rank-max opening']),P('Size',1,6,2,1,'px'),P('Rank',0,4,2,1),S('Shape',['Square','Disc'])],[
  `int op=int(u_p0+.5);int rk=int(u_p2+.5);float r=R(u_p1);float st=max(1.,r/6.);bool sq=u_p3<.5;vec3 m0=vec3(-1.),m1=m0,m2=m0,m3=m0,m4=m0;
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*st;if(sq?max(abs(o.x),abs(o.y))>r+.01:length(o)>r+.01)continue;vec3 v=O(uv+o*u_px).rgb;if(op==1)v=1.-v;
  vec3 tq=min(m0,v);m0=max(m0,v);v=tq;tq=min(m1,v);m1=max(m1,v);v=tq;tq=min(m2,v);m2=max(m2,v);v=tq;tq=min(m3,v);m3=max(m3,v);v=tq;m4=max(m4,v);}
 vec3 k=rk==0?m0:rk==1?m1:rk==2?m2:rk==3?m3:m4;k=mix(k,m0,step(k,vec3(-.5)));return vec4(k,1.);`,
  `int op=int(u_p0+.5);float r=R(u_p1);float st=max(1.,r/6.);bool sq=u_p3<.5;vec3 mn=vec3(2.);
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*st;if(sq?max(abs(o.x),abs(o.y))>r+.01:length(o)>r+.01)continue;mn=min(mn,T(uv+o*u_px).rgb);}
 vec3 v0=O(uv).rgb;if(op==1)v0=1.-v0;vec3 res=max(mn,v0);if(op==1)res=1.-res;return vec4(res,1.);`],
  'DIPlib RankMinClosing (Soille, Morphological Image Analysis 4.4.3): rank filter taking the (rank+1)-th largest value in the SE instead of the dilation, then erosion with the mirrored SE, then supremum with the input (noise-robust closing); RankMaxOpening is the dual. Per RGB channel');

f('q56_normconv','Normalized Convolution (Knutsson-Westin, DIPlib)',[S('Missing data',['Dark pixels','Bright pixels','Random dropout'],2),P('Amount',0,.98,.8,.01),P('Radius',1,40,6,.5,'px'),S('Output',['Normalized convolution','Fill missing only','Show masked input'])],[
  `int md=int(u_p0+.5);float l=luma(c.rgb);float m=md==0?step(u_p1,l):md==1?step(l,1.-u_p1):step(u_p1,hash(floor(PX(uv))+u_seed*7.31));return vec4(c.rgb*m,m);`,
  BH('u_p2'), BV('u_p2'),
  `vec4 a=T(uv);vec3 nc=a.rgb/max(a.a,1e-4);vec4 s=O(uv);int md=int(u_p0+.5);float l=luma(s.rgb);float m=md==0?step(u_p1,l):md==1?step(l,1.-u_p1):step(u_p1,hash(floor(PX(uv))+u_seed*7.31));
 int om=int(u_p3+.5);vec3 o3=om==0?(a.a<1e-3?vec3(0.):nc):om==1?(m>.5?s.rgb:nc):s.rgb*m;return vec4(o3,1.);`],
  'DIPlib NormalizedConvolution: Gauss(in*mask)/Gauss(mask), mask = confidence (0 = missing). Without a second input the mask is derived: pixels darker / brighter than the threshold, or a random dropout of Amount of the pixels (seeded); Gaussian sigma = Radius/2',1);

f = add('Color');
f('q56_mixstains','Mix Stains (DIPlib MixStains)',[S('Stains',['Hematoxylin + Eosin','Hematoxylin + DAB','H + E + DAB','Methyl green + Orange-G + Alcian blue']),S('Densities from',['Inverted RGB','RGB']),P('Density scale',0,3,1,.01)],
  `int st=int(u_p0+.5);vec3 d=(u_p1<.5?1.-c.rgb:c.rgb)*u_p2;vec3 s1=vec3(.644,.717,.267),s2=vec3(.093,.954,.283),s3=vec3(0.);
 if(st==1)s2=vec3(.268,.570,.776);else if(st==2)s3=vec3(.268,.570,.776);else if(st==3){s1=vec3(.980,.144,.133);s2=vec3(.107,.368,.923);s3=vec3(.875,.458,.158);}
 vec3 A=s1*d.x+s2*d.y+s3*d.z;return vec4(pow(vec3(10.),-A),1.);`,
  'DIPlib MixStains: absorbance A = S d per pixel (S columns = stain vectors from the DIPlib microscopy table: hematoxylin .644/.717/.267, eosin .093/.954/.283, DAB .268/.570/.776, methyl green, Orange-G, Alcian blue), shown as brightfield transmittance 10^-A; the R, G, B channels (or their inverses) are read as stain densities 1..3');

f = add('Edges');
f('q56_laplacedgg','Laplace +/- Dgg (DIPlib LaplacePlusDgg / LaplaceMinusDgg)',[S('Operator',['Laplace + Dgg','Laplace - Dgg','Dgg','Laplace']),P('Scale (sigma)',.5,6,1.5,.05,'px'),S('Display',['Signed','Zero crossings','Zero crossings on image']),P('Gain',1,40,10,.5)],[
  `${HESS2('u_p1')}float g2=gx*gx+gy*gy;float dgg=(gx*gx*hxx+2.*gx*gy*hxy+gy*gy*hyy)/max(g2,1e-8);float lap=hxx+hyy;int op=int(u_p0+.5);
 float v=op==0?lap+dgg:op==1?lap-dgg:op==2?dgg:lap;return vec4(.5+.5*clamp(v*u_p3,-1.,1.),clamp(sqrt(g2)*4.,0.,1.),0.,1.);`,
  `vec4 a=T(uv);int dm=int(u_p2+.5);if(dm==0)return vec4(vec3(a.x),1.);float v=a.x-.5;vec2 d=u_px;bool z=false;
 for(int i=0;i<4;i++){vec2 o=i==0?vec2(d.x,0.):i==1?vec2(-d.x,0.):i==2?vec2(0.,d.y):vec2(0.,-d.y);float vn=T(uv+o).x-.5;if(v*vn<0.&&abs(v)<=abs(vn))z=true;}
 float e=z&&a.y>.04?1.:0.;return vec4(dm==1?vec3(e):mix(O(uv).rgb*.7,vec3(1.,.15,.1),e),1.);`],
  'DIPlib LaplacePlusDgg / LaplaceMinusDgg (van Vliet 1993, Verbeek & van Vliet 1994): Laplace = fxx+fyy, Dgg = second derivative in the gradient direction g^T H g / g^T g, Gaussian derivatives at scale sigma; Laplace+Dgg zero crossings = edges with better localisation, Laplace-Dgg = second derivative along the isophote (2D). Zero crossings thinned to the smaller-|v| side, gradient-gated');

f = add('Repair');
f('q56_robustad','Robust Anisotropic Diffusion (Black-Sapiro Tukey, DIPlib)',[P('Iterations',1,20,8,1),P('Sigma (0-255)',1,80,20,1),P('Lambda',.02,.25,.25,.01)],
  Array.from({length: 20}, (_, k) => `if(${k}.>=u_p0)return c;vec2 d=u_px*max(1.,u_k);float sg=u_p1/255.;vec3 acc=vec3(0.);
 for(int i=0;i<4;i++){vec2 o=i==0?vec2(d.x,0.):i==1?vec2(-d.x,0.):i==2?vec2(0.,d.y):vec2(0.,-d.y);vec3 x=T(uv+o).rgb-c.rgb;vec3 q=1.-x*x/(sg*sg);acc+=x*q*q*step(abs(x),vec3(sg));}
 return vec4(c.rgb+u_p2*acc,1.);`),
  'DIPlib RobustAnisotropicDiffusion (Black, Sapiro, Marimont & Heeger 1998): I += lambda * sum over 4 neighbours of psi(grad), Tukey biweight psi(x) = x(1-x^2/sigma^2)^2 for |x| < sigma else 0; sigma on the 0-255 scale (DIPlib default 10, lambda .25, 5 iterations); per RGB channel');

f = add('Edges');
// Octave edge.m "lindeberg": compound Prewitt kernels Px=[-1 0 1]x3 rows, Py=[1;0;-1]x3 cols, conv2 'same'
const Q56_LK = (() => {
  const cv = (a, b) => { const o = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] += x * y; })); return o; };
  const pad7 = v => { const p = (7 - v.length) / 2; return [...new Array(p).fill(0), ...v, ...new Array(p).fill(0)]; };
  const prof = (fs) => fs.reduce((acc, f) => cv(acc, f), [1]);
  const D = [-1, 0, 1], S1 = [1, 1, 1], DY = [1, 0, -1];
  const ord = [[1,0],[0,1],[2,0],[0,2],[1,1],[3,0],[0,3],[2,1],[1,2]];
  const KX = [], KY = [];
  // kernel matrix element (row i, col j) = prof_y[i]*prof_x[j]; conv2 flips: sample at row -dr, col -dc -> uv offset (-dc, +dr)
  ord.forEach(([a, b]) => { const px = pad7(prof([...Array(a).fill(D), ...Array(b).fill(S1)])); const py = pad7(prof([...Array(a).fill(S1), ...Array(b).fill(DY)])); KX.push(...px); KY.push(...py); });
  const fl = v => v.map(x => x.toFixed(1)).join(',');
  return `const float KX[63]=float[63](${fl(KX)});const float KY[63]=float[63](${fl(KY)});`;
})();
f('q56_lindeberg','Lindeberg Edge Detector (Octave edge "Lindeberg")',[P('Sigma',.5,8,2,.1,'px'),P('Min strength',0,.1,.01,.001),S('Display',['Edges','Edges on image','Lvv sign'])],[
  BH('2.*u_p0'), BV('2.*u_p0'),
  `${Q56_LK}float dv[9];for(int k=0;k<9;k++)dv[k]=0.;vec2 sp=u_px*max(1.,u_k);
 for(int j=0;j<7;j++)for(int i=0;i<7;i++){float l=luma(T(uv+vec2(float(3-i),float(j-3))*sp).rgb);for(int k=0;k<9;k++)dv[k]+=l*KX[k*7+i]*KY[k*7+j];}
 float Lx=dv[0],Ly=dv[1],Lxx=dv[2],Lyy=dv[3],Lxy=dv[4],Lxxx=dv[5],Lyyy=dv[6],Lxxy=dv[7],Lxyy=dv[8];
 float g2=Lx*Lx+Ly*Ly;float Lvv=Lx*Lx*Lxx+2.*Lx*Ly*Lxy+Ly*Ly*Lyy;
 float Lvvv=Lx*Lx*Lx*Lxxx+3.*Lx*Lx*Ly*Lxxy+3.*Lx*Ly*Ly*Lxyy+3.*Ly*Ly*Ly*Lyyy;
 float vn=Lvv/(g2+1e-7);return vec4(.5+.5*vn/(abs(vn)+.05),Lvvv<0.?1.:0.,clamp(sqrt(g2)/6.*4.,0.,1.),1.);`,
  `vec4 a=T(uv);int dm=int(u_p2+.5);float v=a.x-.5;if(dm==2)return vec4(vec3(a.x),1.);vec2 d=u_px;bool z=false;
 for(int i=0;i<4;i++){vec2 o=i==0?vec2(d.x,0.):i==1?vec2(-d.x,0.):i==2?vec2(0.,d.y):vec2(0.,-d.y);float vn=T(uv+o).x-.5;if(v*vn<0.&&abs(v)<=abs(vn))z=true;}
 float e=(z&&a.y>.5&&a.z>u_p1*4.)?1.:0.;return vec4(dm==0?vec3(e):mix(O(uv).rgb*.7,vec3(1.,.15,.1),e),1.);`],
  'Octave image edge.m method "lindeberg" (Lindeberg 1998 differential-geometric single-scale edges): Gaussian smoothing sigma, derivatives with compound Prewitt kernels (Px, Py convolved up to 3rd order, conv2 "same"), Lvv = Lx^2 Lxx + 2LxLyLxy + Ly^2 Lyy, Lvvv as in the Octave source (incl. its 3*Ly^3*Lyyy term); edges = zero crossings of Lvv where Lvvv < 0. Octave has no threshold (Min strength 0); a gradient gate is added for noisy photos');

f('q56_andobickley','Ando / Bickley Gradient Kernels (JuliaImages)',[S('Kernel',['Ando 3x3','Ando 4x4','Ando 5x5','Bickley 3x3']),S('Output',['Magnitude','Direction colour','X derivative','Y derivative']),P('Gain',1,20,5,.1)],
  `int k=int(u_p0+.5);float f1[5]=float[5](.225474,.549052,.225474,0.,0.);float f2[5]=float[5](-.5,0.,.5,0.,0.);int n=3;int o0=-1;
 if(k==1){f1=float[5](.0919833,.408017,.408017,.0919833,0.);f2=float[5](-.134484,-.596546,.596546,.134484,0.);n=4;o0=-2;}
 else if(k==2){f1=float[5](.0357338,.248861,.43081,.248861,.0357338);f2=float[5](-.107797,-.284410,0.,.284410,.107797);n=5;o0=-2;}
 else if(k==3){f1=float[5](.1666667,.6666667,.1666667,0.,0.);}
 float gx=0.,gy=0.;vec2 sp=u_px*max(1.,u_k);
 for(int j=0;j<5;j++){if(j>=n)break;for(int i=0;i<5;i++){if(i>=n)break;float l=L(uv+vec2(float(i+o0),-float(j+o0))*sp);gx+=f2[i]*f1[j]*l;gy+=f1[i]*f2[j]*l;}}
 int om=int(u_p1+.5);float mg=sqrt(gx*gx+gy*gy)*u_p2;vec3 o3;
 if(om==0)o3=vec3(mg);else if(om==1)o3=hsv2rgb(vec3(atan(gy,gx)/6.2831853+.5,1.,clamp(mg,0.,1.)));else o3=vec3(.5+(om==2?gx:gy)*u_p2);
 return vec4(clamp(o3,0.,1.),1.);`,
  'ImageFiltering.jl KernelFactors: Ando (2000) consistent-gradient filters ando3 (2*[.112737 .274526 .112737] x [-1 0 1]/2), ando4 (separable approx., derivative factor scaled 1.46205884, half-pixel offset), ando5 (scaled .784406) and Bickley ([1/12 1/3 1/12]*2 x [-1 0 1]/2) applied as correlations; x = columns, y = rows (downward)');

f = add('Analysis');
f('q56_colorangle','Colour Angle Map (Octave colorangle)',[P('Reference hue',0,360,25,1),P('Reference saturation',0,1,.55,.01),P('Max angle',1,90,25,.5),S('Output',['Angle grey','Angle inferno','Keep colours within max angle'])],
  `vec3 rf=hsv2rgb(vec3(u_p0/360.,u_p1,1.));float cs=dot(c.rgb,rf)/max(length(c.rgb)*length(rf),1e-6);float ang=degrees(acos(clamp(cs,-1.,1.)));float t=clamp(ang/u_p2,0.,1.);int m=int(u_p3+.5);
 if(m==0)return vec4(vec3(t),1.);if(m==1)return vec4(ramp(1,t),1.);float kk=1.-smoothstep(.8,1.,t);return vec4(mix(vec3(luma(c.rgb)),c.rgb,kk),1.);`,
  'Octave image package colorangle(rgb1, rgb2): angle in degrees between two RGB vectors, acos(dot / (|rgb1| |rgb2|)), here between every pixel and a reference colour (HSV hue / saturation, value 1); shown scaled by Max angle, or used as a colour key');

f = add('Edges');
f('q56_coherence','Seismic Coherence: Eigenstructure / Semblance (bruges)',[S('Method',['Eigenstructure (Gersztenkorn-Marfurt)','Semblance (Marfurt)']),P('Step-out',1,2,1,1),P('Window samples',3,15,9,1),P('Max dip',0,3,1,.1,'px/trace')],[
  `return vec4(vec3(luma(c.rgb)),1.);`, BH('6.'), BV('6.'),
  `int md=int(u_p0+.5);int so=int(u_p1+.5);int nt=2*so+1;int hw=int(u_p2*.5);float pmax=u_p3;vec2 d=u_px*max(1.,u_k);float best=0.;
 for(int di=-3;di<=3;di++){if(pmax<=0.&&di!=0)continue;float p=pmax*float(di)/3.;float xs[75];
  for(int a=0;a<5;a++){if(a>=nt)break;for(int t=0;t<15;t++){if(t>2*hw)break;vec2 q=uv+vec2(float(a-so),-(float(t-hw)+float(a-so)*p))*d;xs[a*15+t]=luma(O(q).rgb)-T(q).r;}}
  float coh;
  if(md==1){float ss=0.,sq=0.;for(int t=0;t<15;t++){if(t>2*hw)break;float s_=0.;for(int a=0;a<5;a++){if(a>=nt)break;float v=xs[a*15+t];s_+=v;sq+=v*v;}ss+=s_*s_;}coh=ss/(sq+1e-12)/float(nt);}
  else{float C[25];for(int a=0;a<5;a++)for(int b=0;b<5;b++){float s_=0.;if(a<nt&&b<nt){for(int t=0;t<15;t++){if(t>2*hw)break;s_+=xs[a*15+t]*xs[b*15+t];}}C[a*5+b]=s_;}
   float tr=0.;for(int a=0;a<5;a++)tr+=C[a*5+a];float ev[5];for(int a=0;a<5;a++)ev[a]=a<nt?1.:0.;float lam=0.;
   for(int it=0;it<12;it++){float w_[5];float nn=0.;for(int a=0;a<5;a++){float s_=0.;for(int b=0;b<5;b++)s_+=C[a*5+b]*ev[b];w_[a]=s_;nn+=s_*s_;}nn=sqrt(nn)+1e-20;lam=nn;for(int a=0;a<5;a++)ev[a]=w_[a]/nn;}
   coh=lam/(tr+1e-12);}
  best=max(best,coh);}
 float lo=md==1?.2:1./float(nt);float dsc=clamp((1.-best)/(1.-lo),0.,1.);return vec4(vec3(1.-pow(dsc,.8)),1.);`],
  'bruges.attribute discontinuity: image columns = traces, window = 2*step_out+1 traces x Window samples; gersztenkorn = largest eigenvalue / trace of the uncentred trace covariance (power iteration), marfurt = sum_t (sum traces)^2 / sum sum traces^2 / ntraces. Structural dip: the window is sheared by p samples per trace and the best of 7 dips in [-Max dip, Max dip] kept (Marfurt 1998 dip search; Max dip 0 = bruges as written). Luma is high-passed (minus a sigma-3 local mean) to act as a zero-mean trace; output = coherence (dark = discontinuity)');

f = add('Terrain');
// TopoToolbox @GRIDobj/acv.m kernels (conv2 'valid'; conv2 flips the kernel -> sample at (-dc,+dr) in uv)
const Q56_ACV = (() => {
  const term = (M) => { const n = M.length, c = (n - 1) / 2; const t = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const w = M[i][j]; if (!w) continue; const dr = i - c, dc = j - c; t.push(`${w < 0 ? '-' : '+'}${Math.abs(w) === 1 ? '' : Math.abs(w) + '.*'}L(uv+vec2(${(-dc).toFixed(1)},${dr.toFixed(1)})*sp)`); } return `(${t.join('')})*hs`; };
  const k = [[1,0,1,0,1],[0,0,0,0,0],[1,0,0,0,-1],[0,0,0,0,0],[-1,0,-1,0,-1]];
  const F5 = [[[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,-1],[0,0,0,0,0],[0,0,0,0,0]],[[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,-1]],
    [[0,0,-1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,-1,0,0]],[[0,0,0,0,-1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,0]]];
  const F3 = [[[0,0,0],[1,0,-1],[0,0,0]],[[1,0,0],[0,0,0],[0,0,-1]],[[0,1,0],[0,0,0],[0,-1,0]],[[0,0,1],[0,0,0],[-1,0,0]]];
  return `float dz=${term(k)}/4.;float acv=0.;float tq;` + [...F5, ...F3].map(M => `tq=${term(M)}-dz;acv+=tq*tq;`).join('');
})();
f('q56_acv','Anisotropic Coefficient of Variation (TopoToolbox acv)',[P('Height scale',1,300,40,1),P('Spacing',1,8,1,1,'px'),P('Gain',.02,1,.2,.01),S('Display',['Grey','Viridis'])],
  `vec2 sp=u_px*R(u_p1);float hs=u_p0;${Q56_ACV}float C=log(1.+sqrt(acv/8.)/max(abs(dz),.001));float t=clamp(C*u_p2,0.,1.);return vec4(u_p3>.5?ramp(2,t):vec3(t),1.);`,
  'TopoToolbox GRIDobj/acv.m (Olaya 2009): dz_AVG = conv2(dem, k)/4 with the 5x5 directional-difference kernel, ACV = sum over the four 5x5 and four 3x3 difference kernels of (conv2(dem,F) - dz_AVG)^2, C = log(1 + sqrt(ACV/8) / max(|dz_AVG|, 0.001)); kernels ported verbatim (incl. conv2 flip). DEM = luma x Height scale; Spacing = cell size in pixels');
