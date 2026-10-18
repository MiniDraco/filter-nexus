/* ================= libs2: round-10 library functions I (scikit-image, ImageJ/Fiji, MorphoLibJ, ITK, MATLAB IPT) ================= */
/* Separable Hessian helpers. mode 'sk' = scikit-image (Gaussian truncated at 4 sigma, then np.gradient twice),
   'fiji' = Fiji ComputeCurvatures (Gaussian truncated at 3 sigma, [1,-2,1] and 4-corner differences),
   'gd' = Gaussian-derivative kernels (ITK recursive-Gaussian Hessian), truncated at 4 sigma.
   Pass 1 (rows) stores smoothed / 1st / 2nd difference / [1,2,1]-smoothed rows as signed floats (needs float targets).
   Pass 2 (columns) defines G (smoothed), ex, ey (Sobel of G, 'sk' only), hxx, hyy, hxy, l1 >= l2, s_ (sigma in working px). */
const LB2_HW = mode => [mode === 'fiji' ? '3.' : '4.', mode === 'gd'
  ? 'float w1=fi/(s_*s_)*g0,w2=(fi*fi/(s_*s_)-1.)/(s_*s_)*g0,w3=g0;'
  : mode === 'fiji'
  ? 'float gm=LB2G(fi-1.),gp=LB2G(fi+1.);float w1=(gm-gp)*.5,w2=gm-2.*g0+gp,w3=(gm+2.*g0+gp)*.25;'
  : 'float gm=LB2G(fi-1.),gp=LB2G(fi+1.);float w1=(gm-gp)*.5,w2=(LB2G(fi-2.)-2.*g0+LB2G(fi+2.))*.25,w3=(gm+2.*g0+gp)*.25;'];
const LB2_HHEAD = (sig, tr) => `
#define LB2G(QQ) (abs(QQ)<=n_?exp(-(QQ)*(QQ)/(2.*s_*s_)):0.)
float s_=max((${sig})*u_k,.3);float n_=max(min(floor(${tr}*s_+.5),34.),1.);float W_=0.;`;
const LB2_H1 = (sig, mode) => { const [tr, w] = LB2_HW(mode); return LB2_HHEAD(sig, tr) +
  `vec4 A_=vec4(0.);for(int i=-36;i<=36;i++){float fi=float(i);if(abs(fi)>n_+2.)continue;float v_=L(uv+vec2(fi,0.)*u_px);float g0=LB2G(fi);${w}W_+=g0;A_+=vec4(g0,w1,w2,w3)*v_;}
  return A_/W_;`; };
const LB2_H2 = (sig, mode) => { const [tr, w] = LB2_HW(mode); return LB2_HHEAD(sig, tr) +
  `float G=0.,ex=0.,ey=0.,hxx=0.,hyy=0.,hxy=0.;for(int i=-36;i<=36;i++){float fi=float(i);if(abs(fi)>n_+2.)continue;vec4 v_=T(uv-vec2(0.,fi)*u_px);float g0=LB2G(fi);${w}W_+=g0;
   G+=g0*v_.x;hxx+=g0*v_.z;hyy+=w2*v_.x;hxy+=w1*v_.y;ex+=w3*2.*v_.y;ey+=w1*2.*v_.w;}
  G/=W_;hxx/=W_;hyy/=W_;hxy/=W_;ex/=W_;ey/=W_;float tq_=sqrt(.25*(hxx-hyy)*(hxx-hyy)+hxy*hxy);float l1=.5*(hxx+hyy)+tq_,l2=.5*(hxx+hyy)-tq_;`; };

/* two-pass global reduction: RED1 = per-block (s×s, s = ceil(max side/32)) max / min+max / mean of an expression of q_ (sub-sampled when s > 16),
   RED2 = combine the ≤ 32×32 block values read from T().g (max) or T().gb (mean, mean of squares). Result in r_ (and r2_ for means). */
const LB2_RED1 = (expr, op) => `float s_r=ceil(max(u_res.x,u_res.y)/32.);float st_r=max(1.,s_r/16.);vec2 b_r=floor(floor(uv*u_res)/s_r)*s_r;float r_=${op==='mean'?'0.':'-1e9'},r2_=${op==='minmax'?'1e9':'0.'},n_r=0.;
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 o_r=vec2(float(i),float(j))*st_r;if(o_r.x>=s_r||o_r.y>=s_r)continue;vec2 pq=b_r+o_r;if(pq.x>=u_res.x||pq.y>=u_res.y)continue;vec2 q_=(pq+.5)/u_res;float e_=${expr};${op==='max'?'r_=max(r_,e_);':op==='minmax'?'r_=max(r_,e_);r2_=min(r2_,e_);':'r_+=e_;r2_+=e_*e_;'}n_r+=1.;}${op==='mean'?'r_/=n_r;r2_/=n_r;':''}`;
const LB2_RED2 = op => `float s_r=ceil(max(u_res.x,u_res.y)/32.);float r_=${op==='mean'?'0.':'-1e9'},r2_=${op==='minmax'?'1e9':'0.'},w_r=0.;
  for(int j=0;j<32;j++)for(int i=0;i<32;i++){vec2 pq=vec2(float(i),float(j))*s_r;if(pq.x>=u_res.x||pq.y>=u_res.y)continue;vec2 sz=min(vec2(s_r),u_res-pq);vec4 t_=T((pq+.5)/u_res);${op==='max'?'r_=max(r_,t_.g);':op==='minmax'?'r_=max(r_,t_.g);r2_=min(r2_,t_.b);':'float a_=sz.x*sz.y;r_+=t_.g*a_;r2_+=t_.b*a_;w_r+=a_;'}}${op==='mean'?'r_/=w_r;r2_/=w_r;':''}`;
f = add('Edges');
f('sk_farid','Farid Derivative Filter (scikit-image)',[S('Output',['Magnitude (farid)','Horizontal edges (farid_h)','Vertical edges (farid_v)','Direction (hue)']),P('Gain',.5,20,4,.1)],
  `const float FS[5]=float[5](0.0376593171958126,0.249153396177344,0.426374573253687,0.249153396177344,0.0376593171958126);
  const float FE[5]=float[5](0.109603762960254,0.276690988455557,0.,-0.276690988455557,-0.109603762960254);
  float h=0.,v=0.;for(int j=0;j<5;j++)for(int i=0;i<5;i++){float l=L(uv+vec2(float(i-2),-float(j-2))*u_px*max(u_k,1.));h-=FE[j]*FS[i]*l;v-=FS[j]*FE[i]*l;}
  int m=int(u_p0+.5);float mg=sqrt(.5*(h*h+v*v));
  if(m==0)return vec4(vec3(clamp(mg*u_p1,0.,1.)),1.);if(m==1)return vec4(vec3(.5+.5*h*u_p1),1.);if(m==2)return vec4(vec3(.5+.5*v*u_p1),1.);
  return vec4(hsv2rgb(vec3(atan(h,v)/6.28318+.5,.85,clamp(mg*u_p1,0.,1.))),1.);`,
  'skimage.filters.farid / farid_h / farid_v: Farid & Simoncelli 2004 5-tap optimal derivative ⊗ 5-tap smoothing kernels (exact coefficients); magnitude = sqrt((h² + v²)/2); signed outputs shown as 0.5 + 0.5·gain·value');
f('sk_invgaussgrad','Inverse Gaussian Gradient (scikit-image)',[P('Alpha',1,1000,100,1),P('Sigma',.5,8,2,.1,'px'),S('Output',['Inverse gradient 1/sqrt(1+alpha|grad|)','Gradient magnitude x 10'])],
  [`float s_=max(u_p1*u_k,.3);float n_=min(floor(4.*s_+.5),40.);float W=0.,a=0.,d=0.;for(int i=-40;i<=40;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));float v=L(uv+vec2(fi,0.)*u_px);W+=g;a+=g*v;d+=fi/(s_*s_)*g*v;}return vec4(a/W,d/W,0.,1.);`,
   `float s_=max(u_p1*u_k,.3);float n_=min(floor(4.*s_+.5),40.);float W=0.,gx=0.,gy=0.;for(int i=-40;i<=40;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));vec4 v=T(uv+vec2(0.,fi)*u_px);W+=g;gx+=g*v.y;gy+=fi/(s_*s_)*g*v.x;}
   float m=sqrt(gx*gx+gy*gy)/W;return vec4(vec3(u_p2>.5?clamp(m*10.,0.,1.):1./sqrt(1.+u_p0*m)),1.);`],
  'skimage.segmentation.inverse_gaussian_gradient: 1/sqrt(1 + alpha·|∇(G_sigma * I)|) with scipy gaussian_gradient_magnitude (Gaussian-derivative kernels truncated at 4 sigma, nearest border) — the edge-stopping map for morphological geodesic active contours');
f('fiji_tubeness','Tubeness (Fiji)',[P('Sigma',.5,8,2,.1,'px'),S('Tubes',['Bright (Fiji)','Dark']),P('Gain',.5,50,8,.5)],
  [LB2_H1('u_p0','fiji'), LB2_H2('u_p0','fiji') + `float lb=abs(l1)>abs(l2)?l1:l2;if(u_p1>.5)lb=-lb;float t=lb>=0.?0.:-lb*s_*s_;return vec4(vec3(clamp(t*u_p2,0.,1.)),1.);`],
  'Fiji Tubeness (Sato et al. 1998, TubenessProcessor 2-D): Hessian of the Gaussian-smoothed image (kernel 2·int(3σ+.5)+1, [1,−2,1] and 4-corner differences, scaled by σ² as in ComputeCurvatures); tubeness = |λ| of the larger-magnitude eigenvalue when it is negative, else 0. Values in 0..1 image units (Fiji 8-bit = ×255)');
f('itk_objectness','Objectness Measure (ITK, Antiga)',[S('Object',['Bright lines (M=1)','Dark lines (M=1)','Bright blobs (M=0)','Dark blobs (M=0)']),P('Sigma',.5,8,2,.1,'px'),P('Gamma (x 1/255)',.5,60,5,.5),P('Gain',1,500,60,1)],
  [LB2_H1('u_p1','gd'), LB2_H2('u_p1','gd') + `int m=int(u_p0+.5);bool br=(m==0||m==2);int M=m<2?1:0;
   bool sw=abs(l1)>abs(l2);float e0=sw?l2:l1,e1=sw?l1:l2;bool ok=br?(e1<=0.&&(M==1||e0<=0.)):(e1>=0.&&(M==1||e0>=0.));if(!ok)return vec4(vec3(0.),1.);
   float a0=abs(e0),a1=abs(e1);float o=1.;if(a1>0.){float rr=a0/a1;o*=M==0?1.-exp(-.5*rr*rr/.25):exp(-.5*rr*rr/.25);}else o=0.;
   float gm=u_p2/255.;o*=1.-exp(-.5*(a0*a0+a1*a1)/(gm*gm));o*=a1;return vec4(vec3(clamp(o*s_*s_*u_p3,0.,1.)),1.);`],
  'ITK HessianToObjectnessMeasureImageFilter (Antiga 2007) on a Gaussian-derivative Hessian at sigma: eigenvalues sorted by magnitude, sign constraint for bright/dark, R_A (blobs) or R_B (lines) term with alpha = beta = 0.5, structureness 1−exp(−S²/2γ²), ScaleObjectnessMeasure on (× largest |λ|); display = value × σ² × gain; γ in 8-bit units');
f('mlj_directional','Directional Filtering (MorphoLibJ)',[S('Operation',['Opening','Closing','Erosion','Dilation','Mean','Median']),S('Combine',['Max','Min']),P('Line length',3,21,20,1,'px'),P('Directions',2,32,32,1)],
  `int op=int(u_p0+.5);bool cmax=u_p1<.5;float Ln=min(u_p2*u_k,21.);int nd=int(u_p3+.5);float best=cmax?-1.:2.;
  for(int d=0;d<32+int(u_p0*0.);d++){if(d>=nd)break;float th=float(d)*3.14159265/float(nd);float dx=cos(th),dy=sin(th);float dm=max(abs(dx),abs(dy));int n2=int(floor((Ln*dm-1.)*.5+.5));n2=min(n2,10);
   float v[41];for(int t=-20;t<=20+int(u_p0*0.);t++){if(abs(t)>2*n2)continue;float ft=float(t);vec2 sh=abs(dx)>=abs(dy)?vec2(ft,floor(ft*dy/dx+.5)):vec2(floor(ft*dx/dy+.5),ft);v[t+20]=L(uv+vec2(sh.x,-sh.y)*u_px);}
   float r;
   if(op<=1){float o=op==0?-1.:2.;for(int k=-10;k<=10+int(u_p0*0.);k++){if(abs(k)>n2)continue;float e=op==0?2.:-1.;for(int t=-20;t<=20+int(u_p0*0.);t++){if(t<k-n2||t>k+n2)continue;e=op==0?min(e,v[t+20]):max(e,v[t+20]);}o=op==0?max(o,e):min(o,e);}r=o;}
   else if(op<=3){r=op==2?2.:-1.;for(int t=-10;t<=10+int(u_p0*0.);t++){if(abs(t)>n2)continue;r=op==2?min(r,v[t+20]):max(r,v[t+20]);}}
   else if(op==4){r=0.;for(int t=-10;t<=10+int(u_p0*0.);t++){if(abs(t)>n2)continue;r+=v[t+20];}r/=float(2*n2+1);}
   else{int n=2*n2+1;r=0.;for(int t=-10;t<=10+int(u_p0*0.);t++){if(abs(t)>n2)continue;float x=v[t+20];int lt=0,le=0;for(int u=-10;u<=10+int(u_p0*0.);u++){if(abs(u)>n2)continue;lt+=v[u+20]<x?1:0;le+=v[u+20]<=x?1:0;}if(lt<=n/2&&n/2<le)r=x;}}
   best=cmax?max(best,r):min(best,r);}
  return vec4(vec3(best),1.);`,
  'MorphoLibJ Directional Filtering (Heneghan 2002 style): the operation along an oriented line structuring element (MorphoLibJ OrientedLineStrel pixel shifts: major-axis steps, rounded minor offsets, half-length round((L·max(|cos|,|sin|)−1)/2)) at nDirections angles i·180°/n, combined by max or min; on luma. Opening/closing use one sampled line of 4·half+1 pixels with sliding-window min/max (approx. — exact for axis-aligned and diagonal lines, ±1 px rounding otherwise)');

f = add('Analysis');
f('sk_shapeindex','Shape Index / Curvedness (Koenderink)',[P('Sigma',.5,8,2,.1,'px'),S('Output',['Shape index (grey)','Shape index colour, value = curvedness','Curvedness']),P('Curvedness gain',1,200,30,1)],
  [LB2_H1('u_p0','sk'), LB2_H2('u_p0','sk') + `float si=(l1==l2&&l1+l2==0.)?0.:.6366198*atan(-(l1+l2),l1-l2);float cv=sqrt(.5*(l1*l1+l2*l2));float cg=clamp(cv*s_*s_*u_p2,0.,1.);int m=int(u_p1+.5);
   if(m==0)return vec4(vec3(.5+.5*si),1.);if(m==1)return vec4(hsv2rgb(vec3((si+1.)*.375,.85,cg)),1.);return vec4(ramp(1,cg),1.);`],
  'skimage.feature.shape_index (Koenderink & van Doorn 1992): s = (2/π)·arctan((λ2+λ1)/(λ2−λ1)) from the Hessian of the Gaussian-smoothed image (truncate 4σ, np.gradient twice); curvedness C = sqrt((λ1²+λ2²)/2) (shown × σ² × gain). Grey: −1 black (cup) … +1 white (cap); flat (NaN in skimage) = 0.5');
f('sk_msfeatures','Multiscale Basic Features (scikit-image)',[S('Feature',['Intensity','Edges (Sobel)','Texture eigenvalue 1 (larger)','Texture eigenvalue 2 (smaller)']),P('Sigma',.5,8,2,.1,'px'),P('Gain',.5,100,10,.5)],
  [LB2_H1('u_p1','sk'), LB2_H2('u_p1','sk') + `int m=int(u_p0+.5);if(m==0)return vec4(vec3(G),1.);if(m==1)return vec4(vec3(clamp(sqrt(.5*(ex*ex+ey*ey))*u_p2,0.,1.)),1.);
   return vec4(vec3(clamp(.5+(m==2?l1:l2)*s_*s_*u_p2,0.,1.)),1.);`],
  'one channel of skimage.feature.multiscale_basic_features at one sigma (sigma_min 0.5 … here up to 8): intensity = gaussian(img, sigma), edges = filters.sobel of it (sqrt((h²+v²)/2), [1,2,1]/4 ⊗ [1,0,−1]), texture = Hessian eigenvalues from np.gradient twice; eigenvalues shown as 0.5 + value × σ² × gain; on luma');
f('sk_peaklocalmax','Peak Local Max (scikit-image)',[P('Min distance',1,10,3,1,'px'),P('Threshold rel',0,1,.2,.01),P('Pre-blur sigma (0 = none)',0,6,2,.1,'px'),S('Output',['Peak mask','Peaks over image'])],
  [`float s_=u_p2*u_k;if(s_<.3)return vec4(vec3(L(uv)),1.);float n_=min(floor(4.*s_+.5),30.);float W=0.,a=0.;for(int i=-30;i<=30;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));W+=g;a+=g*L(uv+vec2(fi,0.)*u_px);}return vec4(vec3(a/W),1.);`,
   `float s_=u_p2*u_k;if(s_<.3)return c;float n_=min(floor(4.*s_+.5),30.);float W=0.,a=0.;for(int i=-30;i<=30;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));W+=g;a+=g*T(uv+vec2(0.,fi)*u_px).r;}return vec4(vec3(a/W),1.);`,
   LB2_RED1('T(q_).r','minmax') + `return vec4(c.r,r_,r2_,1.);`, LB2_RED2('minmax') + `return vec4(c.r,r_,r2_,1.);`,
   `
   #define LB2PV(QQ) (u_p2*u_k<.3?luma(O(QQ).rgb):T(QQ).r)
   float md=max(floor(u_p0*u_k+.5),1.);int mi=int(md);float gmx=c.g,gmn=c.b;
   float thr=max(gmn,u_p1*gmx);bool over=u_p3>.5;int mk=over&&mi<=5?1:0;bool hit=false;
   for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){if(hit||abs(a)>mk||abs(b)>mk)continue;vec2 q=uv+vec2(float(a),float(b))*u_px;vec2 pp=floor(q*u_res);
    if(pp.x<md||pp.y<md||pp.x>u_res.x-1.-md||pp.y>u_res.y-1.-md)continue;float v=LB2PV(q);if(v<=thr)continue;bool pk=true;
    for(int j=-10;j<=10;j++){if(!pk||abs(j)>mi)continue;for(int i=-10;i<=10;i++){if(abs(i)>mi||(i==0&&j==0))continue;vec2 q2=q+vec2(float(i),float(j))*u_px;float w=LB2PV(q2);if(w>v){pk=false;break;}if(w==v&&(j>0||(j==0&&i<0))){vec2 p2=floor(q2*u_res);if(p2.x<md||p2.y<md||p2.x>u_res.x-1.-md||p2.y>u_res.y-1.-md)continue;bool c2=true;for(int jj=-10;jj<=10;jj++){if(!c2||abs(jj)>mi)continue;for(int ii=-10;ii<=10;ii++){if(abs(ii)>mi)continue;if(LB2PV(q2+vec2(float(ii),float(jj))*u_px)>v){c2=false;break;}}}if(c2){pk=false;break;}}}}
    hit=pk;}
   if(!over)return vec4(vec3(hit?1.:0.),1.);vec3 o=O(uv).rgb*.75;return vec4(hit?vec3(1.,.1,.1):o,1.);`],
  'skimage.feature.peak_local_max as a mask: pixel == maximum_filter(size 2·min_distance+1) and > max(image min, threshold_rel × image max), exclude_border = min_distance; a peak is dropped when an equal-valued candidate earlier in row-major order lies within min_distance (approx. of the greedy ensure_spacing); global min/max by a two-pass block reduction; optional Gaussian pre-blur (0 = exact on luma)');

f = add('Repair');
f('fiji_removeoutliers','Remove Outliers (ImageJ)',[P('Radius',.5,6,2,.5,'px'),P('Threshold (levels)',0,255,50,1),S('Which outliers',['Bright','Dark'])],
  `float rad=u_p0*u_k;if(rad>=1.5&&rad<1.75)rad=1.75;else if(rad>=2.5&&rad<2.85)rad=2.85;float r2=floor(rad*rad)+1.;float kr=min(floor(sqrt(r2+1e-10)),6.);
  vec3 sm[169];int n=0;vec3 mn=vec3(9.),mx=vec3(-9.);
  for(int j=-6;j<=6;j++){float fj=float(j);if(abs(fj)>kr)continue;float dxm=floor(sqrt(r2-fj*fj+1e-10));for(int i=-6;i<=6;i++){if(abs(float(i))>dxm)continue;vec3 s=T(uv+vec2(float(i),fj)*u_px).rgb;sm[n]=s;n++;mn=min(mn,s);mx=max(mx,s);}}
  int k=n/2;vec3 med;for(int ch=0;ch<3;ch++){float lo=mn[ch]-1e-6,hi=mx[ch];for(int it=0;it<22;it++){float mid=.5*(lo+hi);int cn=0;for(int q=0;q<169;q++){if(q>=n)break;cn+=sm[q][ch]<=mid?1:0;}if(cn>=k+1)hi=mid;else lo=mid;}
   float m=9.;for(int q=0;q<169;q++){if(q>=n)break;float s=sm[q][ch];if(s>lo)m=min(m,s);}med[ch]=m;}
  float th=u_p1/255.;vec3 o=c.rgb;bvec3 rep=u_p2<.5?greaterThan(o,med+th+1e-5):lessThan(o,med-th-1e-5);return vec4(mix(o,med,vec3(rep)),1.);`,
  'ImageJ Process › Noise › Remove Outliers (RankFilters OUTLIERS): circular kernel exactly as ImageJ (r² → int(r²)+1, radius 1.5→1.75 and 2.5→2.85 quirks), exact median per RGB channel (bisection + snap), a pixel is replaced by the median when it is brighter (or darker) than median ± threshold; threshold in 8-bit levels');
f('ml_edgetaper','edgetaper (MATLAB)',[P('PSF sigma',1,30,8,.5,'px'),S('Output',['Tapered image','Weight alpha','Circular blur'])],
  [`float s_=u_p0*u_k;float n_=min(ceil(3.*s_),90.);vec3 a=vec3(0.);float W=0.;for(int i=-90;i<=90;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));a+=g*T(vec2(fract(uv.x+fi*u_px.x),uv.y)).rgb;W+=g;}return vec4(a/W,1.);`,
   `float s_=u_p0*u_k;float n_=min(ceil(3.*s_),90.);vec3 a=vec3(0.);float W=0.,zx=0.,zy=0.,z0=0.;vec2 ip=floor(uv*u_res);vec2 dd=min(ip,u_res-1.-ip);
   for(int i=-90;i<=90;i++){float fi=float(i);if(abs(fi)>n_)continue;float g=exp(-fi*fi/(2.*s_*s_));a+=g*T(vec2(uv.x,fract(uv.y+fi*u_px.y))).rgb;W+=g;z0+=g*g;
    float kx=fi+dd.x,ky=fi+dd.y;zx+=abs(kx)<=n_?g*exp(-kx*kx/(2.*s_*s_)):0.;zy+=abs(ky)<=n_?g*exp(-ky*ky/(2.*s_*s_)):0.;}
   vec3 b=a/W;float al=(1.-zx/z0)*(1.-zy/z0);int m=int(u_p1+.5);if(m==1)return vec4(vec3(al),1.);if(m==2)return vec4(b,1.);return vec4(al*O(uv).rgb+(1.-al)*b,1.);`],
  'MATLAB edgetaper(I, PSF) with a Gaussian PSF (size 2·ceil(3σ)+1): J = α·I + (1−α)·(I ⊛ PSF) with circular (wrap-around) convolution, α = (1 − z_x)(1 − z_y), z = normalised autocorrelation of the PSF projection at the circular distance to the frame edge — prepares an image for FFT deconvolution; the final clip to [min I, max I] is a no-op for this convex blend');

f = add('Edges');
f('ml_bwmorph2','bwmorph hbreak / bridge (MATLAB)',[S('Operation',['hbreak','bridge']),P('Threshold',0,1,.5,.01),S('Objects are',['Light on dark','Dark on light']),S('Output',['Binary result','Changes highlighted'])],
  `int op=int(u_p0+.5);bool inv=u_p2>.5;
  #define LB2BW(o) ((luma(T(uv+(o)*u_px*max(1.,floor(u_k+.5))).rgb)>u_p1)!=inv)
  vec2 off[8]=vec2[8](vec2(-1.,1.),vec2(0.,1.),vec2(1.,1.),vec2(1.,0.),vec2(1.,-1.),vec2(0.,-1.),vec2(-1.,-1.),vec2(-1.,0.));
  bool cc=LB2BW(vec2(0.));bool nb[8];for(int k=0;k<8;k++)nb[k]=LB2BW(off[k]);bool o=cc;
  if(op==0){if(cc&&nb[0]&&nb[2]&&nb[4]&&nb[6]&&((nb[1]&&nb[5]&&!nb[3]&&!nb[7])||(nb[3]&&nb[7]&&!nb[1]&&!nb[5])))o=false;}
  else if(!cc){int lb[8];for(int k=0;k<8;k++)lb[k]=nb[k]?k:99;
   for(int it=0;it<8;it++)for(int k=0;k<8;k++){if(!nb[k])continue;int a=(k+1)%8,b=(k+7)%8;int m=min(lb[k],min(nb[a]?lb[a]:99,nb[b]?lb[b]:99));if(k%2==1){int a2=(k+2)%8,b2=(k+6)%8;m=min(m,min(nb[a2]?lb[a2]:99,nb[b2]?lb[b2]:99));}lb[k]=m;}
   int ncomp=0;for(int k=0;k<8;k++)ncomp+=(nb[k]&&lb[k]==k)?1:0;if(ncomp>=2)o=true;}
  vec3 bw=vec3(o!=inv?1.:0.);if(u_p3<.5)return vec4(bw,1.);return vec4(o==cc?vec3(o?.8:.15):o?vec3(1.,.15,.1):vec3(.1,.4,1.),1.);`,
  'MATLAB bwmorph(BW, "hbreak") — removes the centre of H-connected 3×3 patterns (both orientations) — and bwmorph(BW, "bridge") — sets a 0 pixel to 1 when its 8 neighbours form two or more unconnected 8-connected groups; one iteration (n = 1); highlighted: added red, removed blue');

f = add('Analysis');
f('ml_piqe','PIQE Quality Map (MATLAB)',[S('Output',['Masks (R artifacts, G noise, B activity)','Block distortion score','Masks over image']),P('Activity threshold',.01,1,.1,.01),P('Impaired threshold',.01,1,.1,.01)],
  [`float gy=floor(255.*dot(c.rgb,vec3(.2989,.587,.114))+.5);` + LB2_RED1('floor(255.*dot(O(q_).rgb,vec3(.2989,.587,.114))+.5)','max') + `return vec4(gy,r_,0.,1.);`,
   LB2_RED2('max') + `return vec4(T(uv).r,r_,0.,1.);`,
   `float gmx=max(T(uv).g,1.);float m=0.,m2=0.,ws=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float g=exp(-float(i*i+j*j)/(2.*49./36.));float v=floor(255.*T(uv+vec2(float(i),float(j))*u_px).r/gmx+.5);m+=g*v;m2+=g*v*v;ws+=g;}
   m/=ws;m2/=ws;float v0=floor(255.*T(uv).r/gmx+.5);return vec4((v0-m)/(sqrt(abs(m2-m*m))+1.),0.,0.,1.);`,
   `vec2 ip=vec2(floor(uv.x*u_res.x),u_res.y-1.-floor(uv.y*u_res.y));vec2 b0=floor(ip/16.)*16.;
   #define LB2PQ(rr,cc) T(vec2((((cc)>=u_res.x?2.*u_res.x-1.-(cc):(cc))+.5)/u_res.x,(u_res.y-1.-((rr)>=u_res.y?2.*u_res.y-1.-(rr):(rr))+.5)/u_res.y)).r
   float B[256];float s=0.;for(int r=0;r<16;r++)for(int q=0;q<16;q++){float v=LB2PQ(b0.y+float(r),b0.x+float(q));B[r*16+q]=v;s+=v;}float mu=s/256.;float va=0.;for(int k=0;k<256;k++)va+=(B[k]-mu)*(B[k]-mu);va/=255.;
   float act=va>u_p1?1.:0.,art=0.,noi=0.,sc=0.;
   if(act>0.){for(int e=0;e<4;e++)for(int sg=0;sg<11;sg++){float a=0.,a2=0.;for(int k=0;k<6;k++){int p=sg+k;int idx=e==0?p:e==1?p*16+15:e==2?240+p:p*16;a+=B[idx];a2+=B[idx]*B[idx];}float sd=sqrt(max((a2-a*a/6.)/5.,0.));if(sd<u_p2)art=1.;}
    float ca=0.,ca2=0.,sa=0.,sa2=0.;for(int r=0;r<16;r++)for(int q=0;q<16;q++){float v=B[r*16+q];if(q==7||q==8){ca+=v;ca2+=v*v;}else{sa+=v;sa2+=v*v;}}
    float csd=sqrt(max((ca2-ca*ca/32.)/31.,0.))/max(sqrt(max((sa2-sa*sa/224.)/223.,0.)),1e-9);float bs=sqrt(va);float beta=abs(bs-csd)/max(max(bs,csd),1e-9);noi=bs>2.*beta?1.:0.;
    sc=art*(1.-va)+noi*va;}
   int m=int(u_p0+.5);if(m==0)return vec4(art,noi,act*.6,1.);if(m==1)return vec4(act>0.?ramp(1,clamp(sc,0.,1.)):vec3(0.),1.);
   vec3 o=O(uv).rgb;return vec4(mix(o,vec3(1.,.2,.1),art*.45)*(1.-noi*.3)+vec3(0.,noi*.35,0.)+vec3(0.,0.,act*.08),1.);`],
  'MATLAB piqe (Venkatanath et al. 2015) block masks: grey = 8-bit rgb2gray rescaled to 0..255 by the image max (two-pass block reduction; exact up to 512 px, sub-sampled above), MSCN with a 7×7 Gaussian (σ 7/6, C = 1); 16×16 blocks (symmetric padding): active if MSCN variance > 0.1; noticeable artifact if any 6-pixel edge segment has std < 0.1; noise if block σ > 2β (centre columns 8–9 vs surround std ratio); block score = artifact·(1−var) + noise·var');

f = add('Tone');
f('sk_rank','Rank Filters: Autolevel / Contrast / Bilateral Mean (scikit-image)',[S('Filter',['Local autolevel','Morphological contrast enhancement','Bilateral mean']),P('Radius (disk)',1,10,4,1,'px'),P('Bilateral s0 = s1 (levels)',1,80,10,1),S('Channels',['RGB','Luma (grey)'])],
  `int m=int(u_p0+.5);bool gr=u_p3>.5;float rr=min(floor(u_p1*u_k+.5),10.);float sb=u_p2/255.;vec3 g=gr?vec3(L(uv)):c.rgb;vec3 mn=vec3(9.),mx=vec3(-9.),sm=vec3(0.),cn=vec3(0.);
  for(int j=-10;j<=10;j++)for(int i=-10;i<=10;i++){if(float(i*i+j*j)>rr*rr)continue;vec2 q=uv+vec2(float(i),float(j))*u_px;vec3 v=gr?vec3(L(q)):T(q).rgb;mn=min(mn,v);mx=max(mx,v);vec3 w=step(g-sb+1e-5,v)*step(v,g+sb-1e-5);sm+=v*w;cn+=w;}
  vec3 o;if(m==0)o=mix(vec3(0.),(g-mn)/max(mx-mn,1e-6),step(1e-6,mx-mn));else if(m==1)o=mix(mn,mx,vec3(lessThan(mx-g,g-mn-1e-5)));else o=sm/max(cn,1.);
  return vec4(o,1.);`,
  'skimage.filters.rank on a disk(r) footprint: autolevel = (g − local min)/(local max − local min); enhance_contrast = local max if the pixel is closer to the max than to the min, else local min; mean_bilateral = mean of the footprint values strictly within (g − s0, g + s1) (s in 8-bit levels); skimage works on 8-bit grey — here float, per RGB channel or on luma');
f('itk_boundedrecip','Bounded Reciprocal (ITK)',[P('Input scale',.1,255,1,.1),S('Output',['Raw 1/(1+x)','Stretched to 0..1'])],
  `vec3 y=1./(1.+max(c.rgb,0.)*u_p0);if(u_p1>.5){float lo=1./(1.+u_p0);y=(y-lo)/(1.-lo);}return vec4(y,1.);`,
  'ITK BoundedReciprocalImageFilter: out = 1/(1 + x) per channel (x = value × input scale; scale 255 treats the image as 8-bit); optional stretch of the [1/(1+scale), 1] output range to 0..1');

f = add('Repair');
f('itk_votingholefill','Voting Binary Hole Filling (ITK)',[P('Radius',1,5,1,1,'px'),P('Majority threshold',0,10,1,1),P('Threshold',0,1,.5,.01),S('Objects are',['Light on dark','Dark on light'])],
  `bool inv=u_p3>.5;int r=int(u_p0+.5);bool cc=(L(uv)>u_p2)!=inv;if(cc)return vec4(vec3(inv?0.:1.),1.);int n=0;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>r||abs(j)>r||(i==0&&j==0))continue;n+=((L(uv+vec2(float(i),float(j))*u_px)>u_p2)!=inv)?1:0;}
  int N=(2*r+1)*(2*r+1);bool o=n>=(N-1)/2+int(u_p1+.5);return vec4(vec3(o!=inv?1.:0.),1.);`,
  'ITK VotingBinaryHoleFillingImageFilter (one iteration): a background pixel becomes foreground when at least (N−1)/2 + majority of the N−1 neighbours in the (2r+1)² box are foreground; foreground pixels are kept; input binarised at the threshold');
