/* ================= q03: G'MIC community round 13 (colour: space swap, sawtoother, hue lighten/darken, saturation EQ, dark sky, rainbowify, colour illusion; detail: constrained sharpen / local variance normalization / YAG; TIAToolbox stain augmentation) ================= */
const Q03_SP = ['RGB','sRGB (linear <-> gamma)','CMY','Ohta8','YES8','Lab8','LCH8','YIQ8','YUV8','YCbCr','XYZ8','HSV8','HSL8','HSI8'];
const Q03_M = 'mat3(.488718,.1762044,0.,.3106803,.8129847,.0102048,.2006017,.0108109,.9897952)';
const Q03_YIQ = 'transpose(mat3(.299,.587,.114,.595716,-.274453,-.321263,.211456,-.522591,.311135))';
const Q03_YUV = 'transpose(mat3(.299,.587,.114,-.14713,-.28886,.436,.615,-.51498,-.10001))';
const Q03_YES = 'transpose(mat3(.253,.684,.063,.5,-.5,0.,.25,.25,-.5))';
const Q03_YCC = 'transpose(mat3(66.,129.,25.,-38.,-74.,112.,112.,-94.,-18.))';
// RGB -> space (G'MIC rgb2<space>, 8-bit variants scaled to 0..1); operates on vec3 v, int expression m
const Q03_FWD = m => `{int M_=${m};vec3 q_=v;
  if(M_==1)q_=${SRGB('clamp(v,0.,1.)')};
  else if(M_==2)q_=1.-v;
  else if(M_==3)q_=vec3((v.r+v.g+v.b)/3.,(v.r-v.b)*.5+.5,(2.*v.g-v.r-v.b)*.25+.5);
  else if(M_==4)q_=${Q03_YES}*v+vec3(0.,.5,.5);
  else if(M_==5||M_==6){vec3 X_=${Q03_M}*${LIN('clamp(v,0.,1.)')};vec3 f_=mix(pow(max(X_,vec3(1e-6)),vec3(1./3.)),X_*7.787+16./116.,step(X_,vec3(.008856)));
   float Ls=116.*f_.y-16.,A_=500.*(f_.x-f_.y),B_=200.*(f_.y-f_.z);q_=M_==5?vec3(Ls/100.,(A_+127.)*.85/255.,(B_+149.)*.836/255.):vec3(Ls/100.,length(vec2(A_,B_))*1.1086/255.,(atan(B_,A_)+PI)/(2.*PI));}
  else if(M_==7){vec3 y_=${Q03_YIQ}*v;q_=vec3(y_.x,(y_.y*255.+151.908)*.8393238/255.,(y_.z*255.+133.261)*.956769/255.);}
  else if(M_==8){vec3 y_=${Q03_YUV}*v;q_=vec3(y_.x,(y_.y+.44)*289.773/255.,(y_.z+.62)*205.645/255.);}
  else if(M_==9){q_=(${Q03_YCC}*(v*255.)+128.)/256./255.+vec3(16.,128.,128.)/255.;}
  else if(M_==10)q_=(${Q03_M}*${LIN('clamp(v,0.,1.)')})*vec3(1.,1.,231.8182/255.);
  else if(M_==11)q_=rgb2hsv(clamp(v,0.,1.));
  else if(M_==12)q_=rgb2hsl(clamp(v,0.,1.));
  else if(M_==13){vec3 h_=rgb2hsv(clamp(v,0.,1.));float I_=(v.r+v.g+v.b)/3.;q_=vec3(h_.x,I_>1e-5?1.-min(v.r,min(v.g,v.b))/I_:0.,I_);}
  v=q_;}`;
// space -> RGB (G'MIC <space>2rgb)
const Q03_INV = m => `{int M_=${m};vec3 q_=v;
  if(M_==1)q_=${LIN('clamp(v,0.,1.)')};
  else if(M_==2)q_=1.-v;
  else if(M_==3){float a_=v.x,b_=v.y-.5,c_=v.z-.5;q_=vec3(a_+b_-2.*c_/3.,a_+4.*c_/3.,a_-b_-2.*c_/3.);}
  else if(M_==4)q_=inverse(${Q03_YES})*(v-vec3(0.,.5,.5));
  else if(M_==5||M_==6){float Ls=v.x*100.,A_,B_;if(M_==5){A_=v.y*255./.85-127.;B_=v.z*255./.836-149.;}else{float C_=v.y*255./1.1086,h_=v.z*2.*PI-PI;A_=C_*cos(h_);B_=C_*sin(h_);}
   float fy=(Ls+16.)/116.;vec3 f_=vec3(fy+A_/500.,fy,fy-B_/200.);vec3 X_=mix(f_*f_*f_,(f_-16./116.)/7.787,step(f_*f_*f_,vec3(.008856)));vec3 l_=max(inverse(${Q03_M})*X_,vec3(0.));q_=${SRGB('l_')};}
  else if(M_==7){vec3 y_=vec3(v.x,(v.y*255./.8393238-151.908)/255.,(v.z*255./.956769-133.261)/255.);q_=inverse(${Q03_YIQ})*y_;}
  else if(M_==8){vec3 y_=vec3(v.x,v.y*255./289.773-.44,v.z*255./205.645-.62);q_=inverse(${Q03_YUV})*y_;}
  else if(M_==9){vec3 y_=(v-vec3(16.,128.,128.)/255.)*255.*256.-128.;q_=inverse(${Q03_YCC})*y_/255.;}
  else if(M_==10){vec3 l_=max(inverse(${Q03_M})*(v/vec3(1.,1.,231.8182/255.)),vec3(0.));q_=${SRGB('l_')};}
  else if(M_==11)q_=hsv2rgb(vec3(fract(v.x),clamp(v.yz,0.,1.)));
  else if(M_==12)q_=hsl2rgb(vec3(fract(v.x),clamp(v.yz,0.,1.)));
  else if(M_==13){float H_=fract(v.x)*360.,S_=clamp(v.y,0.,1.),I_=v.z;float hh=mod(H_,120.)*PI/180.;float a_=I_*(1.-S_),b_=I_*(1.+S_*cos(hh)/cos(PI/3.-hh)),c_=3.*I_-a_-b_;
   q_=H_<120.?vec3(b_,c_,a_):H_<240.?vec3(a_,b_,c_):vec3(c_,a_,b_);}
  v=q_;}`;
f = add('Color');
f('q03_csswap','Colour Space Swap (Joan Rake)',[S('To RGB from',Q03_SP,0),S('From RGB to',Q03_SP,7)],
  `vec3 v=O(uv).rgb;${Q03_INV('int(u_p0+.5)')}${Q03_FWD('int(u_p1+.5)')}return vec4(clamp(v,0.,1.),1.);`,
  "G'MIC csswap: the pixels are read as if they were in colour space A and converted A->RGB, then converted RGB->B and shown as RGB (G'MIC 8-bit scalings for Lab8/LCH8/YIQ8/YUV8/XYZ8/HSx8, illuminant E for XYZ/Lab); the non-8-bit variants and Kodak/Jzazbz/Oklab/HCY/RYB spaces are not included");
f('q03_sawtooth','Sawtoother (Joan Rake)',[S('Colour space',Q03_SP,0),P('Factor',1,20,3,.1),P('Phase shift',-1,1,0,.01),P('Multiplier',0,3,1,.01)],
  `vec3 v=O(uv).rgb;int m=int(u_p0+.5);${Q03_FWD('m')}v=clamp(v,0.,1.);float F=max(u_p1,1.);v=clamp(mod(v+u_p2,1./F)*F*u_p3,0.,1.);${Q03_INV('m')}return vec4(clamp(v,0.,1.),1.);`,
  "G'MIC Sawtoother [RGB/CMY/HSX/LCH8/YIQ8/XYZ8/YUV8/YCbCr/sRGB/Lab8]: image converted to the space, every channel mapped to a sawtooth wave ((v + phase) mod (256/factor)) x factor x multiplier, clipped, converted back; one set of controls for all channels; per-channel smoothness / shift and tone-range mixing omitted");
f('q03_hueld','Hue Lighten/Darken (Iain Fergusson)',[P('Hue',0,360,30,1,'deg'),P('Amount',-1,1,.35,.01),P('Band width',10,120,40,1,'deg'),S('Model',['HSV','HSL','HSV, B&W output','HSL, B&W output'])],
  `vec3 c0=O(uv).rgb;int m=int(u_p3+.5);bool hsl=m==1||m==3;vec3 h=hsl?rgb2hsl(c0):rgb2hsv(c0);float d=abs(fract(h.x-u_p0/360.+.5)-.5)*360.;float w=u_p2;
  float bump=d<w?(1.-d/w):0.;bump=bump*bump*(3.-2.*bump);vec3 h2=h;h2.z=clamp(h.z+u_p1*bump*.6,0.,1.);vec3 c1=hsl?hsl2rgb(h2):hsv2rgb(h2);
  vec3 hv=rgb2hsv(c0);float ms=clamp((hv.y-100./255.)/(1.-100./255.),0.,1.)*hv.z;vec3 o=mix(c0,c1,ms);if(m>=2)o=vec3(luma(o));return vec4(o,1.);`,
  "Fergusson: per-hue offset of HSV value (or HSL lightness) through an 18-knot hue curve, blended back through a mask from saturation (bottom 100, top 255) x value; here one band of the curve (centre + width, smooth bump) instead of 18 sliders; optional B&W output");
f('q03_sateq','Saturation EQ (Iain Fergusson)',[S('Band by',['Lightness','Hue']),P('Band (0 = black or 0 deg ... 8 = white or 360 deg)',0,8,4,1),P('Amount',-128,128,64,1),P('Rotate hue bands',-45,45,0,1,'deg')],
  `vec3 c0=O(uv).rgb;vec3 h=rgb2hsl(c0);float x=u_p0<.5?h.z:fract(h.x-u_p3/360.);int bd=int(u_p1+.5);
  float kv[9];for(int i=0;i<9;i++)kv[i]=(i==bd||(u_p0>.5&&((bd==0&&i==8)||(bd==8&&i==0))))?u_p2:0.;
  float xs=x*8.;int i1=int(min(floor(xs),7.));float t=xs-float(i1);float p0=kv[max(i1-1,0)],p1=kv[i1],p2=kv[i1+1],p3=kv[min(i1+2,8)];
  if(u_p0>.5){p0=i1==0?kv[7]:p0;p3=i1==7?kv[1]:p3;}
  float cr=.5*((2.*p1)+(-p0+p2)*t+(2.*p0-5.*p1+4.*p2-p3)*t*t+(-p0+3.*p1-3.*p2+p3)*t*t*t);
  h.y=clamp(h.y+cr*2./255.,0.,1.);return vec4(hsl2rgb(h),1.);`,
  "Fergusson Saturation EQ: HSL8 saturation offset by two 9-knot curves (lightness bands 0..255, hue bands every 45 deg, Rotate shifts the hue bands), offset x2 added to S; one band at a time here (Catmull-Rom spline through the knots)");
f = add('Tone');
f('q03_darksky','Dark Sky (afre)',[S('Blend',['Softlight','Overlay']),P('Contrast',-100,100,0,1),P('Smooth radius',0,3,1,1,'px'),P('Strength',0,1,1,.01)],
  `vec3 c0=O(uv).rgb;float r=R(u_p2);float m=0.;float wn=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec3 s=O(uv+vec2(float(i),float(j))*r*.5*u_px).rgb;float w=exp(-float(i*i+j*j)*.35);m+=w*min(s.g-s.b,0.);wn+=w;}m/=wn;
  float k=u_p1/100.;m=m+127./255.;m=clamp((m-.5)*(1.+k)/(1.-min(k,.9))+.5,0.,1.);
  float Y=max(luma(c0),1e-4);float Yb=u_p0<.5?((m<.5)?Y-(1.-2.*m)*Y*(1.-Y):Y+(2.*m-1.)*(sqrt(Y)-Y)):(Y<.5?2.*Y*m:1.-2.*(1.-Y)*(1.-m));
  vec3 o=c0*Yb/Y;return vec4(clamp(mix(c0,o,u_p3),0.,1.),1.);`,
  'afre darksky: mask = min(G - B, 0) + 127 (blue-dominant pixels below mid-grey), smoothed and contrast-adjusted, soft-light / overlay blended onto the luminance, image recoloured by the new / old luminance ratio (approx.: box-free Gaussian smoothing instead of median, no final range renormalisation)');
f = add('Sharpen');
f('q03_detail','Constrained Sharpen / Local Variance Normalization / YAG',[S('Method',['Constrained Sharpen (Fergusson)','Local Variance Normalization (Boulanger)','YAG Effect (Huotari)']),P('Radius',.5,10,1,.05,'px'),P('Amount',0,10,2,.05),P('Constraint / threshold',0,10,5,.1)],
  `int m=int(u_p0+.5);vec3 c0=O(uv).rgb;float sg=R(u_p1);float st=max(sg*3./5.,.6);vec3 mu=vec3(0.),m2=vec3(0.);float wn=0.;
  for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec2 o=vec2(float(i),float(j))*st;float w=exp(-dot(o,o)/(2.*sg*sg));vec3 s=O(uv+o*u_px).rgb;mu+=w*s;m2+=w*s*s;wn+=w;}mu/=wn;m2/=wn;
  if(m==0){vec3 d=c0-mu;vec3 sh=c0+u_p2*d*step(vec3(1./255.),abs(d));float cr=floor(u_p3+.5)*u_k;vec3 mn=c0,mx=c0;int ci=int(cr);
   for(int j=-10;j<=10;j++){if(abs(j)>ci)continue;for(int i=-10;i<=10;i++){if(abs(i)>ci||abs(i)+abs(j)>int(cr*1.42))continue;vec3 s=O(uv+vec2(float(i),float(j))*u_px).rgb;mn=min(mn,s);mx=max(mx,s);}}
   return vec4(clamp(sh,mn,mx),1.);}
  if(m==1){vec3 sd=max(sqrt(max(m2-mu*mu,0.)),vec3(u_p3/255.));return vec4(clamp(mu+u_p2*25./255.*(c0-mu)/sd,0.,1.),1.);}
  vec3 hs=rgb2hsl(c0);vec3 sv=hsl2rgb(vec3(hs.x,min(hs.y*1.2,1.),.5*hs.z+.25));
  vec3 hl=mix(2.*c0*sv,1.-2.*(1.-c0)*(1.-sv),step(.5,sv));
  vec3 sl=mix(c0-(1.-2.*sv)*c0*(1.-c0),c0+(2.*sv-1.)*(sqrt(c0)-c0),step(.5,sv));vec3 a=mix(c0,c0*sl,u_p2/10.);hl=mix(2.*a*sv,1.-2.*(1.-a)*(1.-sv),step(.5,sv));
  float sof=u_p1*10.;vec3 lap=(c0-mu)*(1.-sof/100.);return vec4(clamp(hl+lap,0.,1.),1.);`,
  "Fergusson Constrained Sharpen: unsharp mask (radius, amount, threshold 1/255) clamped to the local min / max over an octagon of the constraint radius (overshoot 0); Boulanger normalize_local_variance: x = mean + amplitude (Amount x 25) x (x - mean) / max(local std, threshold), Gaussian window of the radius; Huotari YAG: soft-vivid copy (L/2 + 25 %, sat x1.2) hard-light composited, optional soft-light darkening (Amount x 10 %), detail layer grain-extracted back (blurred by Radius x 10 = soften) - YAG lab mix approx.");
f = add('Color');
f('q03_rainbowify','Rainbowify (Reptorian)',[P('Hue shift',-180,180,0,1,'deg'),P('Gradient angle',-180,180,0,1,'deg'),P('Gradient scale',50,200,100,1,'%'),P('Keep luminance',0,1,0,.01)],
  `vec3 c0=O(uv).rgb;vec2 p=(uv-.5)*2.;vec2 sd=u_res.x>u_res.y?vec2(u_res.x/u_res.y,1.):vec2(1.,u_res.y/u_res.x);p*=sd;float an=radians(u_p1);
  float pos=(p.x*sin(an)+p.y*cos(an))*180.*u_p2/100.;float v=(c0.r+c0.g+c0.b)/3.*360.;float hu=mod(v+pos+u_p0+180.,360.)/360.;vec3 rb=hsv2rgb(vec3(hu,1.,1.));
  vec3 kl=rb*luma(c0)/max(luma(rb),1e-3);return vec4(clamp(mix(rb,kl,u_p3),0.,1.),1.);`,
  "Reptorian rep_rainbowify (after J. Frech): hue = channel mean x 360/255 + position along a rotated gradient x 180 x scale + shift + 180, rendered fully saturated (Keep luminance re-applies the image luminance, an addition)");
f = add('Render');
f('q03_colorillusion','Jpr Colour Illusion (James Prichard)',[P('Arms',2,10,2,1),P('Scale',10,50,25,.5,'px')],
  `vec2 p=PX(uv)-PX(vec2(.5));float arm=u_p0*1.5-1.;float A=10.+atan(p.x,p.y)*arm/PI;float Rr=length(p)/u_p1+A;int k=(int(A+Rr/arm)+int(mod(floor(Rr*6.-A/arm),2.)))-3*((int(A+Rr/arm)+int(mod(floor(Rr*6.-A/arm),2.)))/3);
  vec3 col=k==0?vec3(250.,200.,0.):k==1?vec3(20.,200.,190.):vec3(160.,100.,150.);return vec4(col/255.,1.);`,
  'jpr_colourillusion (from the Fiji Spirals macro): three-colour spiral pattern A = 10 + atan2 x arm / pi, R = r / scale + A, colour index (int(A + R/arm) + int(6R - A/arm) mod 2) mod 3 - the two arms that look green and blue share one colour; generated, ignores the image content');
f = add('Augment');
f('q03_stainaug','Stain Augmentation (TIAToolbox, Macenko)',[P('Sigma1 (scale)',0,1,.4,.01),P('Sigma2 (shift)',0,1,.2,.01),S('Background',['Keep (tissue only)','Augment too']),S('Stain matrix',['Macenko estimate (sampled)','Fixed Ruifrok H&E'])],
  `vec3 od[256];int nv=0;vec3 mu=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=O((vec2(float(i),float(j))+.5)/16.).rgb;vec3 d=-log((s*255.+1.)/255.);od[j*16+i]=d;if(min(d.r,min(d.g,d.b))>.15){mu+=d;nv++;}}
  vec3 hv=vec3(.65,.70,.29),ev=vec3(.07,.99,.11);hv=normalize(hv);ev=normalize(ev);
  if(u_p3<.5&&nv>12){mu/=float(nv);mat3 C=mat3(0.);for(int k=0;k<256;k++){vec3 d=od[k];if(min(d.r,min(d.g,d.b))<=.15)continue;vec3 e=d-mu;C+=mat3(e*e.x,e*e.y,e*e.z);}
   vec3 v1=normalize(vec3(.6,.6,.5));for(int it=0;it<24;it++)v1=normalize(C*v1+1e-9);float l1=dot(v1,C*v1);mat3 C2=C-l1*mat3(v1*v1.x,v1*v1.y,v1*v1.z);vec3 v2=normalize(cross(v1,vec3(.3,.1,.9))+1e-6);for(int it=0;it<24;it++)v2=normalize(C2*v2+1e-9);
   if(v1.x<0.)v1=-v1;if(v2.x<0.)v2=-v2;float sa=0.,sb=0.;float n=0.;for(int k=0;k<256;k++){vec3 d=od[k];if(min(d.r,min(d.g,d.b))<=.15)continue;float ph=atan(dot(d,v2),dot(d,v1));sa+=ph;sb+=ph*ph;n+=1.;}
   float pm=sa/n,ps=sqrt(max(sb/n-pm*pm,0.));float pmin=pm-2.33*ps,pmax=pm+2.33*ps;vec3 a1=normalize(v1*cos(pmin)+v2*sin(pmin)),a2=normalize(v1*cos(pmax)+v2*sin(pmax));
   if(a1.x>a2.x){hv=a1;ev=a2;}else{hv=a2;ev=a1;}}
  vec3 d=-log((O(uv).rgb*255.+1.)/255.);mat2 G=mat2(dot(hv,hv),dot(hv,ev),dot(hv,ev),dot(ev,ev));vec2 cc=inverse(G)*vec2(dot(hv,d),dot(ev,d));
  vec2 al=1.+u_p0*(vec2(hash(vec2(3.1,7.7)),hash(vec2(5.3,1.9)))*2.-1.),be=u_p1*(vec2(hash(vec2(8.2,4.4)),hash(vec2(2.6,9.1)))*2.-1.);
  float tis=u_p2>.5?1.:smoothstep(.85,.75,luma(O(uv).rgb));vec2 c2=cc*al+be;vec3 o=exp(-(c2.x*hv+c2.y*ev))-1./255.;
  return vec4(clamp(mix(O(uv).rgb,o,tis),0.,1.),1.);`,
  'TIAToolbox StainAugmentor (Tellez et al. 2018): OD = -log((I+1)/255), stain matrix by Macenko 2009 (OD > 0.15 pixels from a 16x16 sample grid, top-2 eigenplane by power iteration, extreme angles at mean +- 2.33 sd as the 1/99 percentiles - approx.) or fixed Ruifrok H&E, concentrations by least squares, C_i x alpha_i + beta_i with alpha ~ U(1 - sigma1, 1 + sigma1), beta ~ U(-sigma2, sigma2) per stain (seeded), background (L > 0.8) kept unless asked', true);
