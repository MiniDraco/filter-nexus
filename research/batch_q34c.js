/* ================= q34c: morphology from the literature (amoebas, fuzzy, soft) + demoscene scrollers ================= */
f = add('Edges');
// morphological amoebas: star-shaped approximation (16 rays) of the amoeba ball {y : d_lambda(x,y) <= r}
const Q34_AMO = (src, isFirst) => `int m=int(u_p0+.5);${isFirst ? '' : 'if(m<4)return c;'}int op=${isFirst ? 'm==4?0:m==5?1:m' : 'm==4?1:0'};
 float rr=R(u_p1),lam=u_p2*255./255.,ps=R(u_p3);
 #define Q34_PL(q) (ps<.3?luma(O(q).rgb):(.4*luma(O(q).rgb)+.15*(luma(O((q)+vec2(ps,0.)*u_px).rgb)+luma(O((q)-vec2(ps,0.)*u_px).rgb)+luma(O((q)+vec2(0.,ps)*u_px).rgb)+luma(O((q)-vec2(0.,ps)*u_px).rgb))))
 #define Q34_SV(q) ${src}((q)).rgb
 vec3 c0=Q34_SV(uv);vec3 mn=c0,mx=c0,sm=c0;float cnt=1.;vec3 vals[145];float lv[145];vals[0]=c0;lv[0]=luma(c0);int nv=1;
 int ns=int(min(ceil(rr),12.));
 for(int k=0;k<12;k++){float a=float(k)*.5236+.2618;vec2 dir=vec2(cos(a),sin(a))*u_px;float cost=0.;float pl=Q34_PL(uv);
  for(int s=1;s<=12;s++){if(s>ns)break;vec2 q=uv+dir*float(s);float np=Q34_PL(q);cost+=1.+lam*abs(np-pl)*${'255./16.'};pl=np;if(cost>rr)break;
   vec3 v=Q34_SV(q);mn=min(mn,v);mx=max(mx,v);sm+=v;cnt+=1.;if(nv<145){vals[nv]=v;lv[nv]=luma(v);nv++;}}}
 if(op==0)return vec4(mn,1.);if(op==1)return vec4(mx,1.);if(op==3)return vec4(sm/cnt,1.);
 vec3 best=c0;for(int i=0;i<145;i++){if(i>=nv)break;float lo=0.,eq=0.;for(int j=0;j<145;j++){if(j>=nv)break;lo+=step(lv[j],lv[i]-1e-6);eq+=step(abs(lv[j]-lv[i]),1e-6);}
  if(lo<=float(nv/2)&&lo+eq>float(nv/2)){best=vals[i];break;}}
 return vec4(best,1.);`;
f('q34_amoeba','Morphological Amoebas (Lerallut)',[S('Operation',['Erosion','Dilation','Median (luma order)','Mean','Opening','Closing']),P('Radius r',1,12,6,1,'px'),P('Lambda',0,20,4,.1),P('Pilot smoothing',0,3,1,.1,'px')],
 [Q34_AMO('O', true), Q34_AMO('T', false)],
 'Lerallut, Decenciere & Meyer 2005 morphological amoebas: adaptive structuring element = pixels whose amoeba distance (path length, each step 1 + lambda x |pilot difference| with the difference in units of 16/255) from the centre is <= r; pilot = lightly smoothed luminance of the input (used for both passes of opening / closing). Approx.: star-shaped amoeba, the cost accumulated along 12 straight rays instead of the geodesic minimum over all paths; median = the pixel of median luma');

// fuzzy morphology (Bloch & Maitre 1995): D(x) = sup_y t[mu(y), nu(y-x)], E(x) = inf_y T[mu(y), 1 - nu(y-x)]
const Q34_FZ = isFirst => `int m=int(u_p0+.5);${isFirst ? '' : 'if(m<2)return c;'}int op=${isFirst ? 'm==2?0:m==3?1:m' : 'm==2?1:0'};int tn=int(u_p1+.5);int el=int(u_p3+.5);
 float rr=R(u_p2);float st=max(1.,rr/10.);vec3 acc=op==0?vec3(1.):vec3(0.);
 for(int j=-10;j<=10;j++)for(int i=-10;i<=10;i++){vec2 o=vec2(float(i),float(j))*st;float d=length(o)/max(rr,.5);if(d>1.)continue;
  float nu=el==0?1.-d:el==1?exp(-4.5*d*d):1.;vec3 mu=${isFirst ? 'O' : 'T'}(uv+o*u_px).rgb;
  if(op==1){vec3 t=tn==0?min(mu,vec3(nu)):tn==1?mu*nu:max(vec3(0.),mu+nu-1.);acc=max(acc,t);}
  else{float cn=1.-nu;vec3 t=tn==0?max(mu,vec3(cn)):tn==1?mu+cn-mu*cn:min(vec3(1.),mu+cn);acc=min(acc,t);}}
 return vec4(clamp(acc,0.,1.),1.);`;
f('q34_fuzzymorph','Fuzzy Morphology (Bloch-Maitre)',[S('Operation',['Fuzzy erosion','Fuzzy dilation','Fuzzy opening','Fuzzy closing']),S('T-norm / T-conorm',['Min / max (Zadeh)','Product / probabilistic sum','Lukasiewicz (bounded)']),P('Radius',1,10,4,.5,'px'),S('Fuzzy element',['Cone','Gaussian','Flat disc (crisp)'])],
 [Q34_FZ(true), Q34_FZ(false)],
 'Bloch & Maitre 1995 (Pattern Recognition 28:9) t-norm morphology, each channel taken as a membership function mu: dilation D(x) = sup_y t[mu(y), nu(y-x)], erosion E(x) = inf_y T[mu(y), c(nu(y-x))] with c = 1 - v; pairs min/max (their definition 2), product / probabilistic sum (def. 3), Lukasiewicz max(0,a+b-1) / min(1,a+b) (def. 4); fuzzy structuring element nu = cone, Gaussian or crisp disc of the radius (sampled on a <= 21x21 grid)');

// soft morphology (Koskinen, Astola & Neuvo 1991): k-th smallest / largest of the multiset {k x f(a), a in A} + {f(b), b in B\\A}
const Q34_SOFT = isFirst => `int m=int(u_p0+.5);${isFirst ? '' : 'if(m<2)return c;'}int op=${isFirst ? 'm==2?0:m==3?1:m' : 'm==2?1:0'};
 float rr=u_p1;float kk=floor(u_p2+.5);bool a3=u_p3>.5;vec3 v[81];float w[81];int n=0;
 for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 o=vec2(float(i),float(j));if(length(o)>rr+.01)continue;bool core=a3?(abs(o.x)<=1.&&abs(o.y)<=1.):(i==0&&j==0);
  v[n]=${isFirst ? 'O' : 'T'}(uv+o*R(1.)*u_px).rgb;w[n]=core?kk:1.;n++;}
 vec3 best=op==0?vec3(2.):vec3(-1.);
 for(int i=0;i<81;i++){if(i>=n)break;vec3 cv=v[i];vec3 cn=vec3(0.);
  for(int j=0;j<81;j++){if(j>=n)break;cn+=w[j]*(op==0?step(v[j],cv):step(cv,v[j]));}
  vec3 ok=step(vec3(kk),cn);best=op==0?mix(best,min(best,cv),ok):mix(best,max(best,cv),ok);}
 return vec4(clamp(best,0.,1.),1.);`;
f('q34_softmorph','Soft Morphological Filters (Koskinen)',[S('Operation',['Soft erosion','Soft dilation','Soft opening','Soft closing']),P('Radius of B',1,4,2,.5,'px'),P('Repetition k',1,9,3,1),S('Hard centre A',['Centre pixel','3x3 square'])],
 [Q34_SOFT(true), Q34_SOFT(false)],
 'Koskinen, Astola & Neuvo 1991 soft grey-scale morphology with a flat structuring system [B, A, k]: B = disc of the radius, hard centre A = centre pixel or 3x3; soft erosion = k-th smallest and soft dilation = k-th largest of the multiset where core values are repeated k times and soft-boundary values once (k = 1 gives plain erosion / dilation); soft opening / closing chain the two per channel');

f = add('Retro');
// 5x7 font for the scroller text (rows top to bottom, bit 4 = left column)
const Q34_GL = {F:[31,16,16,30,16,16,16],I:[14,4,4,4,4,4,14],L:[16,16,16,16,16,16,31],T:[31,4,4,4,4,4,4],E:[31,16,16,30,16,16,31],R:[30,17,17,30,20,18,17],
  N:[17,25,21,19,17,17,17],X:[17,17,10,4,10,17,17],U:[17,17,17,17,17,17,14],S:[15,16,16,14,1,1,30],D:[30,17,17,17,17,17,30],M:[17,27,21,21,17,17,17],
  O:[14,17,17,17,17,17,14],G:[14,17,16,23,17,17,15],A:[14,17,17,31,17,17,17],C:[14,17,16,16,16,17,14],' ':[0,0,0,0,0,0,0]};
const Q34_TXT = 'FILTER NEXUS GREETS ALL DEMOSCENERS   ';
const Q34_GK = Object.keys(Q34_GL);
const Q34_FONT = `const int Q34F[${Q34_GK.length * 7}]=int[${Q34_GK.length * 7}](${Q34_GK.map(k => Q34_GL[k].join(',')).join(',')});
const int Q34T[${Q34_TXT.length}]=int[${Q34_TXT.length}](${[...Q34_TXT].map(ch => Q34_GK.indexOf(ch)).join(',')});
#define Q34_ON(XX,YY) (((YY)>=0.&&(YY)<7.&&mod((XX),6.)<5.)?((Q34F[Q34T[int(mod(floor((XX)/6.),${Q34_TXT.length}.))]*7+int(YY)]>>(4-int(mod((XX),6.))))&1)==1:false)
`;
f('q34_scroller','Sine Scroller / DYCP (demoscene)',[S('Mode',['Sine scroller (per pixel column)','DYCP (per character)']),P('Amplitude',0,.4,.15,.01),P('Wavelength (x width)',.1,2,.6,.01),P('Scroll position',0,1,0,.01)],
 Q34_FONT + `int m=int(u_p0+.5);vec2 px=floor(uv*u_res);float H=u_res.y;float gp=max(floor(H*.11/8.),1.);float v=H-1.-px.y;
 float tw=${Q34_TXT.length}.*6.*gp;float off=u_p3*tw;
 #define Q34_DY(xs) (u_p1*H*sin(6.2832*(xs)/(u_p2*u_res.x)))
 vec3 bg=c.rgb*.45;vec3 col=bg;
 for(int sh=1;sh>=0;sh--){float d=float(sh)*max(gp*.5,1.);float X=(px.x-d+off)/gp;float ci=floor(X/6.);
  float xc=m==1?(ci*6.+3.)*gp-off:px.x-d;float Y=(v-d-(H*.5-3.5*gp)-Q34_DY(xc))/gp;
  if(Q34_ON(floor(X),floor(Y))){col=sh==1?bg*.25:mix(ramp(3,fract(Y/7.*.5+X/240.)),vec3(1.),.25*step(fract(Y),.3));}}
 return vec4(col,1.);`,
 'classic 8-bit / Amiga demo text effects over the dimmed image: sine scroller = a scrolling bitmap-font banner whose every pixel column is displaced vertically by a sine of its screen x; DYCP (different Y character position, C64) = each whole character moved up / down by the sine of its own screen position (character shape kept); 5x7 font, rainbow raster colours, drop shadow; single frame at the Scroll position');
