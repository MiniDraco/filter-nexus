/* ================= q36: round-16 literature: RGB soil/vegetation indices III, medical & microscopy restoration, inverse tone mapping, LCIS, Spacek / Pb edges ================= */
f = add('Sensor');
f('q36_rgbindex3','RGB Spectral Indices III (soil & vegetation)',[S('Index',['GLAI (green leaf area)','SAT (overall saturation)','HUE (overall hue)','BI (soil brightness)','HI (soil hue index)','CI (coloration index)','TCVI (true colour veg.)','GRRI (green-red ratio)','RBRI (red-blue ratio)','NRBDI']),S('Output',['Diverging ramp','Viridis','Gray','Mask over image']),P('Gain',.2,5,1.5,.01),P('Mask threshold',-1,1,.15,.01)],
  `vec3 q=max(c.rgb,vec3(0.))+.004;int m=int(u_p0+.5);float vv[2];
  for(int k=0;k<2;k++){vec3 p=k==0?q:vec3((q.r+q.g+q.b)/3.);float R_=p.r,G_=p.g,B_=p.b;float v,dn;
   if(m==0){dn=G_+R_-B_;dn=abs(dn)<.02?(dn<0.?-.02:.02):dn;v=25.*(G_-R_)/dn+1.25;}
   else if(m==1){float mx=max(R_,max(G_,B_));v=(mx-min(R_,min(G_,B_)))/mx;}
   else if(m==2){dn=30.5*(G_-B_);dn=abs(dn)<.02?(dn<0.?-.02:.02):dn;v=atan(2.*(R_-G_-B_)/dn);}
   else if(m==3)v=sqrt((R_*R_+G_*G_+B_*B_)/3.);
   else if(m==4){dn=G_-B_;dn=abs(dn)<.02?(dn<0.?-.02:.02):dn;v=atan((2.*R_-G_-B_)/dn)/1.5708;}
   else if(m==5)v=(R_-B_)/R_;
   else if(m==6){dn=2.*R_-G_-2.*B_+.4;dn=abs(dn)<.02?(dn<0.?-.02:.02):dn;v=1.4*(2.*R_-2.*B_)/dn;}
   else if(m==7)v=log(G_/R_);else if(m==8)v=log(R_/B_);else v=(R_-B_)/(R_+G_+B_);vv[k]=v;}
  float t,d;if(m==1||m==3){t=clamp(vv[0]*u_p2/1.5,0.,1.);d=t*2.-1.;}
  else{if(m==2||m==4)vv[1]=0.;float sc=m==0?.06:m==2?.6366:m==4?.6:m==5?.7:m==6?.4:m==7?1.2:m==8?.5:1.;d=clamp((vv[0]-vv[1])*sc,-1.,1.);t=clamp(.5+d*u_p2*.5,0.,1.);d=(t-.5)*2.;}
  int pal=(m==0||m==7)?0:(m==1||m==3)?2:1;int o=int(u_p1+.5);vec3 hi=pal==0?vec3(.1,.9,.2):pal==1?vec3(1.,.25,.1):vec3(.15,.45,1.);
  if(o==0){vec3 col=pal==0?stops5(vec3(.65,0.,.15),vec3(.96,.43,.26),vec3(1.,1.,.75),vec3(.4,.74,.39),vec3(0.,.41,.22),t):pal==1?stops5(vec3(0.,.35,.4),vec3(.4,.7,.7),vec3(1.,1.,.85),vec3(.95,.55,.3),vec3(.6,.1,.05),t):stops5(vec3(.05,.05,.1),vec3(.3,.25,.4),vec3(.6,.5,.45),vec3(.9,.75,.45),vec3(1.,.97,.85),t);return vec4(col,1.);}
  if(o==1)return vec4(ramp(2,t),1.);if(o==2)return vec4(vec3(t),1.);return vec4(d>u_p3?mix(c.rgb,hi,.55):c.rgb*.45,1.);`,
  'published RGB formulas (uavRst rgb_indices / rgbIndices tables; Escadafal soil colour indices): GLAI = 25 (G-R)/(G+R-B) + 1.25; SAT = (max-min)/max; HUE = atan(2(R-G-B) / (30.5 (G-B))); BI = sqrt((R^2+G^2+B^2)/3); HI = (2R-G-B)/(G-B) (shown as atan); CI = (R-B)/R; TCVI = 1.4 (2R-2B)/(2R-G-2B+255*0.4) (0..255 scale); GRRI = G/R, RBRI = R/B (shown as log); NRBDI = (R-B)/(R+G+B). Display = index minus its value for neutral grey of the same brightness (SAT, BI, HUE, HI shown raw), times Gain');

f = add('Analysis');
f('q36_medxform','Ultrasound Log Compression / Optical Density',[S('Transform',['Ultrasound log compression','Optical density (Beer-Lambert)']),P('Dynamic range',10,90,30,1,'dB'),P('OD at white',.3,3,1.2,.01),P('Blank intensity I0',.2,1,1,.01)],
  `int m=int(u_p0+.5);vec3 x=max(c.rgb,vec3(1e-5));
  if(m==0){float db=20.*log(max(luma(x),1e-5))/log(10.);return vec4(vec3(clamp(1.+db/u_p1,0.,1.)),1.);}
  vec3 od=-log(clamp(x/u_p3,1e-4,1.))/log(10.);return vec4(clamp(od/u_p2,0.,1.),1.);`,
  'B-mode ultrasound log compression: pixel value read as envelope amplitude A (max 1), shown as 20 log10(A) dB over the chosen dynamic range (0 dB white, -DR black). Optical density (Beer-Lambert / Ruifrok colour deconvolution convention): OD = -log10(I / I0) per RGB channel, displayed OD / OD-at-white');

f = add('Repair');
f('q36_curtain','FIB-SEM Curtaining / Stripe Removal',[S('Stripe direction',['Vertical','Horizontal']),P('Stripe length',10,200,60,1,'px'),P('Stripe width',1,30,6,.5,'px'),P('Strength',0,1,1,.01)],
  [`return blur1d(u_tex,uv,u_p0<.5?vec2(0.,1.):vec2(1.,0.),R(u_p1));`,
   `vec2 d=u_p0<.5?vec2(1.,0.):vec2(0.,1.);vec3 a=T(uv).rgb,b=blur1d(u_tex,uv,d,R(u_p2)).rgb;return vec4(O(uv).rgb-(a-b)*u_p3,1.);`],
  'approx. spatial analogue of wavelet-FFT destriping (Muench et al. 2009) used for FIB-SEM curtaining: stripe estimate = image smoothed along the stripe direction (Gaussian, Stripe length) minus that result smoothed across it (Stripe width), subtracted from the image; long straight structures parallel to the stripes are attenuated too');
f('q36_ringart','CT Ring Artifact Removal',[P('Centre X',0,1,.5,.001),P('Centre Y',0,1,.5,.001),P('Ring width',1,12,3,.5,'px'),P('Strength',0,1,1,.01)],
  `vec2 C=vec2(u_p0,u_p1)*u_res/u_k;vec2 pp=PX(uv);float r=length(pp-C);float w=max(u_p2,1.);vec3 rv[13];
  for(int k=0;k<13;k++){float rr=abs(r+float(k-6)*w*.5);vec3 s=vec3(0.);float n=0.;
   for(int a=0;a<48;a++){float th=(float(a)+.5)*.1309;vec2 q=fromPX(C+rr*vec2(cos(th),sin(th)));if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;s+=O(q).rgb;n+=1.;}
   rv[k]=s/max(n,1.);}
  vec3 md=rv[6];for(int ch=0;ch<3;ch++)for(int i=0;i<13;i++){float vi=rv[i][ch];int cn=0;for(int j=0;j<13;j++){float vj=rv[j][ch];if(vj<vi||(vj==vi&&j<i))cn++;}if(cn==6)md[ch]=vi;}
  vec3 ring=(rv[6]-md)*smoothstep(w,w*4.,r);return vec4(c.rgb-ring*u_p3,1.);`,
  'approx. polar-domain ring removal (after Sijbers & Postnov 2004): ring profile = mean over 48 angles on the circle through the pixel around the rotation centre, sampled at 13 radii (step Ring width / 2); ring artifact = profile minus its radial median (keeps concentric object edges), subtracted');
const Q36_GIBBS = (d, skip) => `if(int(u_p1+.5)==${skip})return T(uv);vec3 s[21];for(int i=0;i<21;i++)s[i]=T(uv+${d}*float(i-10)*u_px).rgb;
  float best=1e9,bs=0.;vec3 y0=s[9],y1=s[10],y2=s[11];
  for(int j=0;j<17;j++){float sh=j==0?0.:j<=8?float(j)/16.:-float(j-8)/16.;float wk[13];float ws=0.;
   for(int k=0;k<13;k++){float x=float(k-6)-sh;float w_=abs(x)<1e-4?1.:6.*sin(3.14159*x)*sin(.5236*x)/(9.8696*x*x);wk[k]=w_;ws+=w_;}
   vec3 y[9];for(int o=0;o<9;o++){vec3 a=vec3(0.);for(int k=0;k<13;k++)a+=s[o+k]*wk[k];y[o]=a/ws;}
   float tv1=0.,tv2=0.;for(int t=1;t<=3;t++){vec3 a=abs(y[4-t]-y[3-t]);tv1+=a.r+a.g+a.b;vec3 b_=abs(y[4+t]-y[5+t]);tv2+=b_.r+b_.g+b_.b;}
   float tv=min(tv1,tv2);if(tv<best-1e-6){best=tv;bs=sh;y0=y[3];y1=y[4];y2=y[5];}}
  vec3 r_=bs>0.?y1*(1.-bs)+y0*bs:y1*(1.+bs)-y2*bs;return vec4(mix(s[10],r_,u_p0),1.);`;
f('q36_gibbs','Gibbs Ringing Removal (Kellner local sub-pixel shifts)',[P('Strength',0,1,1,.01),S('Axes',['X then Y','X only','Y only'])],
  [Q36_GIBBS('vec2(1.,0.)',2), Q36_GIBBS('vec2(0.,1.)',1)],
  'Kellner, Dhital, Kiselev & Reisert 2016 (MRtrix mrdegibbs): per pixel, 17 sub-pixel shifts (+-0.5 px), choose the shift with the least total variation over offsets 1..3 on the left or right side, then interpolate back linearly to the original grid; approx.: shifts by Lanczos-6 windowed sinc instead of FFT phase ramps, and the k-space x/y weighting is replaced by an x pass followed by a y pass');
const Q36_SPMASK = `float a=1.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*R(1.5)*u_px;vec3 s=O(q).rgb;float mx=max(s.r,max(s.g,s.b)),mn=min(s.r,min(s.g,s.b));float st_=mx>0.?(mx-mn)/mx:0.;float l=luma(s);float lb=0.;for(int b=-2;b<=2;b++)for(int e=-2;e<=2;e++)lb+=luma(O(q+vec2(float(e),float(b))*R(4.)*u_px).rgb);lb/=25.;
  if(st_<u_p1&&(l>u_p0||(l>u_p0*.7&&l>lb*(1.+2.*(1.-u_p0)))))a=0.;}`;
f('q36_specendo','Specular Reflection Removal (endoscopy)',[P('Brightness threshold',.5,1,.94,.01),P('Saturation threshold',0,.7,.3,.01),P('Fill radius',3,40,10,.5,'px'),S('Output',['Inpainted','Mask overlay'])],
  [`${Q36_SPMASK}return vec4(O(uv).rgb*a,a);`, BH('u_p2'), BV('u_p2'),
   `${Q36_SPMASK}vec3 o=O(uv).rgb;vec4 b=T(uv);if(u_p3>.5)return vec4(mix(o,vec3(0.,1.,.35),(1.-a)*.75),1.);
  vec3 fill=b.a>.01?b.rgb/b.a:o;float k=max(1.-a,clamp((.6-b.a)*3.,0.,1.));return vec4(mix(o,fill,k),1.);`],
  'after Arnold, Ghosh, Ameling & Lacey 2010 (approx.): highlights = bright, low-saturation pixels by an absolute threshold plus a relative one against the local mean brightness, dilated 3x3; filled by normalised Gaussian convolution of the non-specular pixels and blended with a softened mask');

f = add('Tone');
f('q36_fundus','Fundus Luminosity & Contrast Normalisation',[P('Window radius',8,150,40,1,'px'),P('Background distance t',.3,3,1,.05),S('Channel',['Green','Luma','Colour (green-driven gain)']),P('Output contrast',.05,.5,.16,.005)],
  [`float w=R(u_p0)/5.;int ch=int(u_p2+.5);float s1=0.,s2=0.;for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec3 s=O(uv+vec2(float(i),float(j))*w*u_px).rgb;float v=ch==1?luma(s):s.g;s1+=v;s2+=v*v;}s1/=121.;return vec4(s1,sqrt(max(s2/121.-s1*s1,1e-6)),0.,1.);`,
   `float w=R(u_p0)/5.;int ch=int(u_p2+.5);vec3 o=O(uv).rgb;float I=ch==1?luma(o):o.g;float s0=0.,s1=0.,s2=0.;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec2 q=uv+vec2(float(i),float(j))*w*u_px;vec3 s=O(q).rgb;float v=ch==1?luma(s):s.g;vec2 ms=T(q).rg;if(abs(v-ms.x)<u_p1*ms.y){s0+=1.;s1+=v;s2+=v*v;}}
  vec2 ms=T(uv).rg;float Lb=s0>3.?s1/s0:ms.x;float Cb=max(s0>3.?sqrt(max(s2/s0-Lb*Lb,1e-6)):ms.y,.004);float y=clamp(.5+(I-Lb)/Cb*u_p3,0.,1.);
  if(ch==2)return vec4(clamp(o*(y/max(I,.02)),0.,1.),1.);return vec4(vec3(y),1.);`],
  'after Foracchia, Grisan & Ruggeri 2005 (approx.): local mean and std in a window; background pixels = within t std of their local mean (Mahalanobis distance); luminosity drift L and contrast drift C = mean and std of the background pixels around each pixel; output (I - L)/C. Windows sampled on an 11x11 grid');

f('q36_itmo','Inverse Tone Mapping (Akyuz / Masia / Huo / Rempel / Kovaleski-Oliveira)',[S('Operator',['Akyuz 2007 linear-gamma','Masia 2009 key gamma','Huo 2014 retina response','Rempel 2007 brightness enhancement','Kovaleski-Oliveira 2009 bilateral']),P('Operator parameter',0,1,.5,.01),P('Exposure',-4,4,0,.1,'EV'),S('Display',['Reinhard view','Exposure clip','Expansion ratio map'])],
  [`float m=step(.9,max(c.r,max(c.g,c.b)));return vec4(m,m,m,1.);`, BH('u_res.x/u_k*.05'), BV('u_res.x/u_k*.05'),
   `float W=u_res.x/u_k;vec2 pp=PX(uv);vec3 Y=vec3(.2126,.7152,.0722);float L0=dot(pow(max(O(uv).rgb,0.),vec3(2.2)),Y);
  float sk=W/40.,ks=0.,kw=0.;for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec2 o=vec2(float(i),float(j))*sk*.4;vec3 s=O(fromPX(pp+o)).rgb;float m=step(.9,max(s.r,max(s.g,s.b)));float l=dot(pow(max(s,0.),vec3(2.2)),Y);float w=exp(-dot(o,o)/(2.*sk*sk)-(l-L0)*(l-L0)/.02);ks+=w*m;kw+=w;}
  float hs=0.,hw=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 o=vec2(float(i),float(j))*8.;float l=dot(pow(max(O(fromPX(pp+o)).rgb,0.),vec3(2.2)),Y);float w=exp(-dot(o,o)/512.-(l-L0)*(l-L0)/.08);hs+=w*l;hw+=w;}
  return vec4(T(uv).r,ks/kw,hs/hw,1.);`,
   `int m=int(u_p0+.5);float p=u_p1;vec4 st=T(uv);vec3 Y=vec3(.2126,.7152,.0722);vec3 c0=pow(max(O(uv).rgb,0.),vec3(2.2));float L=max(dot(c0,Y),1e-5);
  float mn=1e9,mx=0.,la=0.,g1=1e-3,g2=1e-3;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.5)/16.;float l=dot(pow(max(O(q).rgb,0.),vec3(2.2)),Y);mn=min(mn,l);mx=max(mx,l);la+=log(l+1e-4);vec4 t_=T(q);g1=max(g1,t_.r);g2=max(g2,t_.g);}
  la=exp(la/256.);mx=max(mx,1e-3);float Le;
  if(m==0)Le=pow(clamp((L-mn)/max(mx-mn,1e-4),0.,1.),exp2((p-.5)*3.));
  else if(m==1){float lm=max(mn,5e-4);float k=(log(la)-log(lm))/max(log(mx)-log(lm),1e-3);Le=pow(L,max(10.44*k-6.282,.2));}
  else if(m==2){float n=.86*exp2((p-.5)*1.4);Le=L/mx*pow(pow(max(st.b,1e-5),n)+pow(la,n),1./n);}
  else if(m==3){float a=exp2(p*4.);Le=L*(1.+(a-1.)*clamp(st.r/g1,0.,1.))/a;}
  else Le=L*(3.*clamp(st.g/g2,0.,1.)+1.)/4.;
  int dm=int(u_p3+.5);if(dm==2)return vec4(ramp(1,clamp(.5+log2((Le+1e-4)/(L+1e-4))/8.,0.,1.)),1.);
  float ev=exp2(u_p2);vec3 hc=c0*(Le/L)*ev;if(dm==0){float lv=dot(hc,Y);float lw=ev*(m==2?1.6:1.);float ld=lv*(1.+lv/(lw*lw))/(1.+lv);hc*=ld/max(lv,1e-6);}
  return vec4(pow(clamp(hc,0.,1.),vec3(1./2.2)),1.);`],
  'expansion operators as in Banterle HDR Toolbox (input linearised with gamma 2.2, luminance scaled, colour ratios kept): Akyuz: L = ((L-Lmin)/(Lmax-Lmin))^gamma (parameter -> gamma 0.35..2.8, 0.5 = 1); Masia: gamma = 10.44 k - 6.282, k = image key (log-average) (clamped >= 0.2); Huo: L/Lmax * (Ls^n + sigma^n)^(1/n), Ls = bilateral local adaptation (single pass approx. of the two-pass filter), sigma = log-average, n = 0.86 at 0.5; Rempel: brightness enhancement = Gaussian blur (sigma = width/40) of the >0.9 mask scaled to 1..alpha (parameter -> alpha 1..16, 0.5 = 4; edge-stopping flood fill omitted, approx.); Kovaleski-Oliveira: cross-bilateral of that mask guided by luminance, e = (3b+1)/4. Output normalised to peak 1, viewed through extended Reinhard (white = exposure), exposure clip, or log2 expansion ratio');

const Q36_LCIS = s => `float s_=${s}.*max(u_k,1.);vec2 ex=vec2(u_px.x,0.)*s_,ey=vec2(0.,u_px.y)*s_;float P=T(uv).r;float dv=0.;float k2=max(u_p0*u_p0*${s*s*s*s}.,1e-8);
  for(int l=0;l<4;l++){vec2 a=(l==1||l==3)?ey:ex;vec2 b=(l==1||l==3)?ex:ey;vec2 q=l<2?uv:uv-a;float sg=l<2?-1.:1.;
   float p0=T(q).r,e1=T(q+a).r,e2=T(q+2.*a).r,w1=T(q-a).r,n1=T(q+b).r,s1=T(q-b).r,ne=T(q+a+b).r,se=T(q+a-b).r;
   float pxx=e1+w1-2.*p0,pyy=n1+s1-2.*p0,exx=e2+p0-2.*e1,eyy=ne+se-2.*e1,nxy=(ne-e1)-(n1-p0),sxy=(e1-se)-(p0-s1);
   float m2=.25*(pxx*pxx+pyy*pyy+exx*exx+eyy*eyy)+.5*(nxy*nxy+sxy*sxy);
   dv+=sg*((e2-w1)+3.*(p0-e1)+(ne-n1)+(se-s1)+2.*(p0-e1))/(1.+m2/k2);}
  return vec4(P+dv*.03,0.,0.,1.);`;
f('q36_lcis','LCIS Tone Mapping (Tumblin-Turk low-curvature image simplifier)',[P('K (curvature threshold)',.01,1,.15,.01),P('Base compression',.1,1,.45,.01),P('Detail',0,3,1.2,.01),P('Saturation',0,1.5,.7,.01)],
  [`vec3 li=pow(max(c.rgb,0.),vec3(2.2));return vec4(log(dot(li,vec3(.2126,.7152,.0722))+1e-3),0.,0.,1.);`]
   .concat(Array(10).fill(Q36_LCIS(4)), Array(10).fill(Q36_LCIS(2)), Array(14).fill(Q36_LCIS(1)),
   [`float base=T(uv).r;vec3 li=pow(max(O(uv).rgb,0.),vec3(2.2));float l=max(dot(li,vec3(.2126,.7152,.0722)),1e-4);float lg=log(l+1e-3);
  float bmx=-20.;for(int j=0;j<12;j++)for(int i=0;i<12;i++)bmx=max(bmx,T((vec2(float(i),float(j))+.5)/12.).r);
  float Lo=exp(u_p1*(base-bmx)+u_p2*(lg-base));vec3 col=pow(li/l,vec3(u_p3))*Lo;return vec4(pow(clamp(col,0.,1.),vec3(1./2.2)),1.);`]),
  'Tumblin & Turk 1999 LCIS on log luminance, discretised as in the authors\' example code: link curvature magnitude^2 from second differences, conductance 1/(1+|curv|^2/K^2), flux = conductance x change of curvature across the link (third differences), conservative update, timestep 0.03; approx.: 34 iterations on a coarse-to-fine lattice (spacing 4, 2, 1 px) instead of hundreds, leak-fix gains omitted. Tone mapping: log L = compression x (base - max) + detail x (log L - base), colour ratios ^ saturation');

f = add('Edges');
const Q36_SPK = d => `float w=max(R(u_p0),1.);float st=max(1.,w/24.);vec4 a=vec4(0.);float ws=0.;for(int i=-24;i<=24;i++){float x=float(i)*st;float u=abs(x)/w;if(u>=1.)continue;float h=1.-6.*u*u+8.*u*u*u-3.*u*u*u*u;a+=T(uv+${d}*x*u_px)*h;ws+=h;}return a/ws;`;
f('q36_spacek','Spacek Optimal Edge Detector (1986)',[P('Half-width w',1,20,4,.5,'px'),P('Gain',.2,6,1.5,.01),S('Output',['Thinned edges','Gradient magnitude','Smoothed image']),P('Threshold',0,.5,.05,.005)],
  [Q36_SPK('vec2(1.,0.)'), Q36_SPK('vec2(0.,1.)'),
   `vec2 e=u_px*max(u_k,1.);int om=int(u_p2+.5);if(om==2)return T(uv);
#define Q36G(q) vec2(luma(T((q)+vec2(e.x,0.)).rgb)-luma(T((q)-vec2(e.x,0.)).rgb),luma(T((q)+vec2(0.,e.y)).rgb)-luma(T((q)-vec2(0.,e.y)).rgb))
  vec2 g=Q36G(uv);float m=length(g);vec2 dn=m>1e-6?g/m:vec2(1.,0.);float m1=length(Q36G(uv+dn*e)),m2=length(Q36G(uv-dn*e));
  float v=clamp(m*u_p1*R(u_p0)*.5,0.,1.);if(om==1)return vec4(vec3(v),1.);return vec4(vec3((m>=m1&&m>=m2&&v>u_p3)?v:0.),1.);`],
  'Spacek 1986: Canny-type optimal antisymmetric filter, integrated (as Spacek proposed) into a symmetric smoothing operator applied separably, edges = maxima of a central difference; approx.: Spacek\'s cubic-spline first approximation of the filter, g(x) = x^3+2x^2+x on [-w,0], whose integral h(u) = 1-6u^2+8u^3-3u^4 (u = |x|/w) is the smoothing kernel (performance 0.1823 vs 0.1824 for the full filter, Petrou & Kittler 1988)');
f('q36_pb','Pb Probability of Boundary (brightness + colour gradients)',[P('Disc radius',3,20,7,.5,'px'),P('Colour weight',0,2,1,.01),S('Output',['Pb thinned','Oriented gradient (raw)','Over image']),P('Gain',.2,6,2,.01)],
  [`float rad=R(u_p0);float best=0.,bo=0.;
  for(int o=0;o<4;o++){float th=float(o)*.7854;vec2 n=vec2(-sin(th),cos(th));float h[48];for(int k=0;k<48;k++)h[k]=0.;float c0=0.,c1=0.;
   for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 off=vec2(float(i),float(j))*.25;if(dot(off,off)>1.)continue;float sd=dot(off,n);if(abs(sd)<.05)continue;
    vec3 li=pow(max(O(uv+off*rad*u_px).rgb,0.),vec3(2.2));vec3 xyz=mat3(.4124,.2126,.0193,.3576,.7152,.1192,.1805,.0722,.9505)*li/vec3(.9505,1.,1.089);
    vec3 fx=mix(xyz*7.787+.1379,pow(max(xyz,vec3(1e-6)),vec3(1./3.)),step(.008856,xyz));vec3 lab=clamp(vec3(1.16*fx.y-.16,(5.*(fx.x-fx.y)+.8)/1.6,(2.*(fx.y-fx.z)+.8)/1.6),0.,.999)*7.;
    int hb=sd>0.?0:24;if(sd>0.)c0+=1.;else c1+=1.;
    for(int ch=0;ch<3;ch++){float v=lab[ch];int b0=int(v);float fr=v-float(b0);h[hb+ch*8+b0]+=1.-fr;h[hb+ch*8+min(b0+1,7)]+=fr;}}
   float x2[3];for(int ch=0;ch<3;ch++){float a=0.;for(int k=0;k<8;k++){float g_=h[ch*8+k]/c0,q_=h[24+ch*8+k]/c1;a+=(g_-q_)*(g_-q_)/(g_+q_+1e-6);}x2[ch]=.5*a;}
   float pbo=x2[0]+u_p1*.5*(x2[1]+x2[2]);if(pbo>best){best=pbo;bo=float(o);}}
  return vec4(best,bo/4.,0.,1.);`,
   `vec4 a=T(uv);float th=a.g*3.14159;vec2 n=vec2(-sin(th),cos(th))*u_px*max(u_k,1.);float v=a.r,p1=T(uv+n).r,p2=T(uv-n).r;int om=int(u_p2+.5);
  float ov=om==1?v:((v>=p1&&v>=p2)?v:0.);ov=1.-exp(-ov*u_p3);if(om==2)return vec4(mix(O(uv).rgb*.6,vec3(1.,.2,.1),ov),1.);return vec4(vec3(ov),1.);`],
  'after Martin, Fowlkes & Malik 2004 (approx.): oriented half-disc histogram gradients, chi^2 distance between the two halves (8 soft bins) of CIELAB L* (brightness gradient) and a*, b* (colour gradient), 4 orientations, max over orientations, non-maximum suppression across the boundary; texture gradient (textons) and the trained logistic weights are omitted');
