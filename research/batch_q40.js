/* ================= q40: round-17 Inkscape filter presets (share/filters/filters.svg chains ported primitive by primitive) ================= */
// SVG filter algebra on premultiplied RGBA (Filter Effects 1.0): composite in/out/over/atop/arithmetic, feBlend modes, colour-matrix on
// unpremultiplied colour, Perlin feTurbulence (fractalNoise / turbulence, 4 independent channels), distant-light lighting with the SVG
// Sobel surface normal (factor 1/4). E coords = SVG user px (y down) / Scale. Transparent results are shown over white (Inkscape page).
const Q40_H = TX_NZ + `
#define Q40U(V_) ((V_).a>1e-4?vec4((V_).rgb/(V_).a,(V_).a):vec4(0.))
#define Q40P(V_) vec4((V_).rgb*(V_).a,(V_).a)
#define Q40CL(V_) vec4(min(clamp((V_).rgb,0.,1.),vec3(clamp((V_).a,0.,1.))),clamp((V_).a,0.,1.))
#define Q40AR(A_,B_,k1,k2,k3,k4) Q40CL((k1)*(A_)*(B_)+(k2)*(A_)+(k3)*(B_)+vec4(k4))
#define Q40OV(A_,B_) ((A_)+(B_)*(1.-(A_).a))
#define Q40AT(A_,B_) vec4((A_).rgb*(B_).a+(B_).rgb*(1.-(A_).a),(B_).a)
#define Q40BA(A_,B_) (1.-(1.-(A_).a)*(1.-(B_).a))
#define Q40MUL(A_,B_) vec4((1.-(A_).a)*(B_).rgb+(1.-(B_).a)*(A_).rgb+(A_).rgb*(B_).rgb,Q40BA(A_,B_))
#define Q40SCR(A_,B_) vec4((A_).rgb+(B_).rgb-(A_).rgb*(B_).rgb,Q40BA(A_,B_))
#define Q40W(V_) vec4(clamp((V_).rgb+1.-(V_).a,0.,1.),1.)
#define Q40LM(C_) dot((C_),vec3(.2125,.7154,.0721))
#define Q40DQ(C_,n_,st_) min(floor(clamp((C_),0.,.99999)*(n_))*(st_),1.)
#define Q40LV(az,el) vec3(cos(radians(az))*cos(radians(el)),sin(radians(az))*cos(radians(el)),sin(radians(el)))
#define Q40N(G_,ss) normalize(vec3(-(ss)*(G_),1.))
#define Q40DF(N_,az,el,kd) ((kd)*max(dot(N_,Q40LV(az,el)),0.))
#define Q40SP(N_,az,el,ks,ex) ((ks)*pow(max(dot(N_,normalize(Q40LV(az,el)+vec3(0.,0.,1.))),0.),(ex)))
#define Q40GA(ci,k) (6.2831853*TXH((ci)+vec2(37.,17.)*(k)))
#define Q40GD(ci,fq,k) dot(vec2(cos(Q40GA(ci,k)),sin(Q40GA(ci,k))),(fq))
#define Q40PN(Q_,k) mix(mix(Q40GD(floor(Q_),fract(Q_),k),Q40GD(floor(Q_)+vec2(1.,0.),fract(Q_)-vec2(1.,0.),k),TXS(fract(Q_)).x),mix(Q40GD(floor(Q_)+vec2(0.,1.),fract(Q_)-vec2(0.,1.),k),Q40GD(floor(Q_)+vec2(1.,1.),fract(Q_)-vec2(1.,1.),k),TXS(fract(Q_)).x),TXS(fract(Q_)).y)
#define Q40X(uv_) (vec2(PX(uv_).x,u_res.y/u_k-PX(uv_).y)/SC)
#define Q40D(px) (vec2((px).x,-(px).y)*u_px*u_k*SC)
`;
// feTurbulence: nm = vec4 result (unpremultiplied), pos in E units, ch = channels to evaluate
const Q40_TN = (nm, pos, fq, oct, fr, ch = 'rgba') => {
  let s = `vec4 ${nm}=vec4(0.);{vec2 q_=(${pos})*(${fq});float am_=1.;for(int o_=0;o_<${oct};o_++){`;
  for (const k of ch) { const i = 'rgba'.indexOf(k); s += fr ? `${nm}.${k}+=Q40PN(q_,${i}.)*am_;` : `${nm}.${k}+=abs(Q40PN(q_,${i}.))*am_;`; }
  return s + `am_*=.5;q_=q_*2.+vec2(13.,5.);}}${nm}=clamp(${fr ? nm + '*.5+.5' : nm},0.,1.);`;
};
// 2D Gaussian (2n+1)^2 taps, strided; val(q) = vec3 expression
const Q40_G2 = (nm, sig, ctr, val, n = 3) => `vec3 ${nm}=vec3(0.);{float sw_=max(${sig},.05);float st_=sw_*${(2.4 / n).toFixed(3)};float ws_=0.;for(int j_=-${n};j_<=${n};j_++)for(int i_=-${n};i_<=${n};i_++){vec2 o_=vec2(float(i_),float(j_))*st_;float w_=exp(-dot(o_,o_)/(2.*sw_*sw_));vec2 q${nm}=(${ctr})+o_*u_px;${nm}+=w_*(${val('q' + nm)});ws_+=w_;}${nm}/=ws_;}`;
// SVG lighting surface gradient (Sobel /4) of a height given by statements hc(q) setting float hv; GR5 = after a 3x3 Gaussian (sigma sb)
const Q40_SOB = `.25*u_k*SC*vec2(h_[2]+2.*h_[5]+h_[8]-h_[0]-2.*h_[3]-h_[6],h_[6]+2.*h_[7]+h_[8]-h_[0]-2.*h_[1]-h_[2])`;
const Q40_GR = hc => `vec2 GR;{float h_[9];for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec2 q=uv+vec2(float(i-1),float(1-j))*u_px;float hv=0.;${hc('q')}h_[j*3+i]=hv;}GR=${Q40_SOB};}`;
const Q40_GR5 = (hc, sb) => `vec2 GR;{float g5_[25];for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec2 q=uv+vec2(float(i-2),float(2-j))*u_px;float hv=0.;${hc('q')}g5_[j*5+i]=hv;}
 float sw_=max((${sb})*u_k*SC,.05);float w1_=exp(-.5/(sw_*sw_));float wn_=1./(1.+2.*w1_);float wk_[3]=float[3](w1_*wn_,wn_,w1_*wn_);float h_[9];
 for(int j=0;j<3;j++)for(int i=0;i<3;i++){float sm_=0.;for(int b_=0;b_<3;b_++)for(int a_=0;a_<3;a_++)sm_+=wk_[a_]*wk_[b_]*g5_[(j+b_)*5+i+a_];h_[j*3+i]=sm_;}GR=${Q40_SOB};}`;
const Q40_BL = (dir, sig) => `return blur1d(u_tex,uv,${dir === 'h' ? 'vec2(1.,0.)' : 'vec2(0.,1.)'},R(2.*(${sig})));`;
const Q40_SCP = P('Scale', .25, 4, 1, .01, 'x'), Q40_MIX = P('Mix', 0, 1, 1, .01);

/* ---------- single-pass colour presets ---------- */
f = add('Color');
f('q40_colorset','Inkscape Color Presets',[S('Preset',['Blend Opposites','Hue to White','Paint Channels','Simulate CMY','Posterized Light Eraser','Monochrome Transparency']),Q40_MIX],
  `${Q40_H}vec3 s_=O(uv).rgb;int m=int(u_p0+.5);vec4 r_=vec4(s_,1.);
  if(m==0){vec3 fb=clamp(vec3(dot(s_,vec3(-.574,1.43,.144)),dot(s_,vec3(.426,.43,.144)),dot(s_,vec3(.426,1.43,-.856))),0.,1.);float al=1.-Q40LM(s_);vec4 r3=vec4(s_*al,al);vec4 r4=Q40AR(r3,r3,.5,.5,.5,0.);r_=Q40OV(r4,vec4(fb,1.));}
  else if(m==1){float mx=max(s_.r,max(s_.g,s_.b)),mn=min(s_.r,min(s_.g,s_.b));vec3 d_=vec3(mx-mn);r_=vec4(s_+d_-s_*d_,1.);}
  else if(m==2){r_=vec4(vec3(dot(s_,vec3(.213,.715,.072))),1.);vec3 W_[3]=vec3[3](vec3(1.,-.5,-.5),vec3(-.5,1.,-.5),vec3(-.5,-.5,1.));vec3 F_[3]=vec3[3](vec3(68.,0.,134.),vec3(254.,63.,0.),vec3(255.,204.,0.));
   for(int k=0;k<3;k++){float a_=clamp(dot(s_,W_[k]),0.,1.);vec4 l_=Q40CL(vec4(F_[k]/255.*a_,.5*a_));r_=Q40OV(l_,r_);}}
  else if(m==3){vec4 cy=vec4(vec3(0.,1.,1.)*(1.-s_.r),1.-s_.r),mg=vec4(vec3(1.,0.,1.)*(1.-s_.g),1.-s_.g),ye=vec4(vec3(1.,1.,0.)*(1.-s_.b),1.-s_.b);r_=Q40MUL(ye,Q40MUL(mg,cy));}
  else if(m==4){vec3 p_=Q40DQ(s_,7.,.2);float al=clamp(1.-dot(p_,vec3(.21,.72,.07)),0.,1.);r_=vec4(p_*al,al);}
  else{float al=1.-Q40LM(s_);r_=vec4(vec3(134.,39.,24.)/255.*al,al);}
  return vec4(mix(s_,Q40W(r_).rgb,u_p1),1.);`,
  'Inkscape filters.svg presets, exact primitive chains: Blend Opposites (hueRotate 180 under the image with alpha 1-luminance, arithmetic .5,.5,.5), Hue to White (screen of chroma max-min built from per-channel colour matrices + darken/lighten), Paint Channels (gray base + purple/orange/yellow floods with alpha R-(G+B)/2 etc., arithmetic k3=-.5), Simulate CMY (cyan/magenta/yellow layers with alpha 1-R/1-G/1-B multiplied), Posterized Light Eraser (7-step discrete transfer, alpha 1-luminance), Monochrome Transparency (rgb(134,39,24) with alpha 1-luminance); transparency shown over white');

/* ---------- posters / contour lighting (blur -> discrete transfer families) ---------- */
const Q40_PS = `float sg_[7]=float[7](4.,4.,1.5,2.,1.5,2.,4.);float sg=sg_[int(u_p0+.5)]*u_p1;`;
const Q40_OPC = `vec3 r1=vec3(0.);for(int k=0;k<5;k++){vec2 o_=k==0?vec2(0.):k==1?vec2(1.,0.):k==2?vec2(-1.,0.):k==3?vec2(0.,1.):vec2(0.,-1.);vec3 v_=O(uv+o_*u_px).rgb;v_=min(.9*v_+vec3(.1,.08,0.),v_);r1+=v_*(k==0?5.05:-1.);}r1=clamp(r1,0.,1.);`;
f = add('Stylize');
f('q40_poster','Inkscape Poster Presets',[S('Preset',['Poster Draw','Cross Noise Poster','Poster Color Fun','Poster Rough','Light Contour','Old Postcard','Plasticine']),Q40_SCP,Q40_MIX],
  [`${Q40_H}float SC=u_p1;int m=int(u_p0+.5);
   if(m==3){${Q40_TN('n', 'Q40X(uv)', '.05', 5, true, 'rg')}return vec4(O(uv+Q40D(25.*(n.rg-.5))).rgb,1.);}
   if(m==5){${Q40_OPC}return vec4(r1,1.);}return vec4(O(uv).rgb,1.);`,
   Q40_PS + Q40_BL('h', 'sg'), Q40_PS + Q40_BL('v', 'sg'),
   `float SC=u_p1;int m=int(u_p0+.5);if(m!=0)return T(uv);
   ${Q40_G2('b15', '1.5*u_k*SC', 'uv', q => `O(${q}).rgb`)}
   vec3 k_=min(floor(clamp(max(T(uv).rgb,b15),0.,1.)*10.),9.);float tb[10]=float[10](0.,.125,.25,.275,.5,.625,.75,.875,1.,1.);return vec4(tb[int(k_.r)],tb[int(k_.g)],tb[int(k_.b)],1.);`,
   `int m=int(u_p0+.5);vec4 t_=T(uv);if(m!=0)return t_;
#define Q40GY(o) dot(T(uv+(o)*u_px).rgb,vec3(.213,.715,.072))
   float v_=250.*(Q40GY(vec2(-1.,-1.))+Q40GY(vec2(1.,-1.))+Q40GY(vec2(-1.,1.))+Q40GY(vec2(1.,1.)))-1005.*Q40GY(vec2(0.));return vec4(t_.rgb,clamp(v_,0.,1.));`,
   `float SC=u_p1;int m=int(u_p0+.5);vec4 t_=T(uv);if(m!=0)return t_;float sw=max(.7*u_k*SC,.05);float w1=exp(-.5/(sw*sw));float b_=0.,ws=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?1.:w1)*(j==0?1.:w1);b_+=w*T(uv+vec2(float(i),float(j))*u_px).a;ws+=w;}return vec4(t_.rgb,clamp(10.*b_/ws-4.,0.,1.));`,
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec3 s_=O(uv).rgb;vec4 t_=T(uv);vec3 r_=s_;
   if(m==0){float sw=max(.5*u_k*SC,.05);float w1=exp(-.5/(sw*sw));float b_=0.,ws=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?1.:w1)*(j==0?1.:w1);b_+=w*T(uv+vec2(float(i),float(j))*u_px).a;ws+=w;}
    float mk=clamp(15.*b_/ws-1.5,0.,1.);vec4 r16=Q40SCR(vec4(vec3(124.,0.,60.)/255.*.8,.8),vec4(t_.rgb,1.));r_=r16.rgb*(1.-mk);}
   else if(m==1){${Q40_G2('b1', 'u_k*SC', 'uv', q => `O(${q}).rgb`)}vec3 r1=Q40DQ(min(b1,t_.rgb),7.,.2);vec4 cv=vec4(0.);
    for(int k=0;k<5;k++){vec2 o_=k==0?vec2(0.):vec2(k==1||k==3?-1.:1.,k<3?-1.:1.);${Q40_TN('n', 'Q40X(uv+o_*u_px)', '1.', 7, true)}cv+=Q40P(n)*(k==0?10.:2.);}
    cv=Q40CL(cv/18.);float gy=dot(Q40U(cv).rgb,vec3(.213,.715,.072));r_=Q40W(Q40AR(vec4(r1,1.),vec4(vec3(gy*cv.a),cv.a),1.5,.5,.5,0.)).rgb;}
   else if(m==2){vec3 km=mod(min(floor(clamp(t_.rgb,0.,1.)*8.),7.),4.);r_=.5-.5*cos(km*1.5707963);}
   else if(m==3){${Q40_G2('b05', '.5*u_k*SC', 'uv', q => `O(${q}).rgb`, 1)}r_=Q40DQ(min(t_.rgb,b05),7.,.2);}
   else if(m==4){${Q40_GR(q => `hv=Q40LM(Q40DQ(T(${q}).rgb,11.,.1));`)}float sp=Q40SP(Q40N(GR,5.),180.,90.,1.,20.);vec3 r1=Q40DQ(t_.rgb,11.,.1);vec4 r3=Q40AR(vec4(sp),vec4(r1,1.),.4,0.,.7,0.);r_=Q40OV(r3,vec4(r1,1.)).rgb;}
   else if(m==5){${Q40_OPC}vec3 tt=clamp(t_.rgb,0.,1.)*12.;vec3 k_=min(floor(tt),11.);vec3 a0=min(floor(k_/2.)*.2,1.),a1=min(floor((k_+1.)/2.)*.2,1.);r_=min(mix(a0,a1,tt-k_),r1);}
   else{vec3 r6c=vec3(0.);float h_[9];for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec2 qq=uv+vec2(float(i-1),float(1-j))*u_px;vec3 r1=Q40DQ(T(qq).rgb,11.,.1);
     ${Q40_G2('r5', '2.*u_k*SC', 'qq', q => `Q40DQ(T(${q}).rgb,11.,.1)`, 2)}vec3 r6=max(r5,r1);if(i==1&&j==1)r6c=r6;h_[j*3+i]=Q40LM(r6);}
    vec2 GR=${Q40_SOB};float df=Q40DF(Q40N(GR,-15.),225.,20.,.7);r_=Q40AR(vec4(vec3(df),1.),vec4(r6c,1.),.4,.9,.9,0.).rgb;}
   return vec4(mix(s_,clamp(r_,0.,1.),u_p2),1.);`],
  'Inkscape filters.svg presets ported primitive by primitive: Poster Draw (lighten of blurs 4 / 1.5, 10-step discrete table incl. its .275 step, 250/-1005 diagonal edge kernel -> luminanceToAlpha -> blur .7 / x10-4 -> blur .5 / x15-1.5 ink lines over a rgb(124,0,60) screen), Cross Noise Poster (darken of blurs 4 / 1, 7-step discrete, 7-octave fractal noise through the -2/-10 kernel, arithmetic 1.5,.5,.5), Poster Color Fun (blur 1.5, 0/.5/1/.5 cyclic discrete table), Poster Rough (turbulence-displaced blur 2 darkened with blur .5, 7-step discrete), Light Contour (blur 1.5, 11-step discrete, specular from luminance, arithmetic .4/.7), Old Postcard (yellow darken tint, 5.05 sharpen, blur 2 staircase table, darken), Plasticine (blur 4, 11-step discrete, lighten with its blur 2, diffuse relief surface -15, arithmetic .4,.9,.9). Scale multiplies all SVG lengths; approx.: wide blurs inside the last pass use a strided 2D Gaussian, noise seeds differ, 0.01-0.2 px blurs omitted');

/* ---------- liquid drawing (displaced noise -> Laplacian) ---------- */
f('q40_liquid','Inkscape Liquid Drawing',[S('Preset',['Alpha Draw Liquid','Liquid Drawing']),Q40_SCP,Q40_MIX],
  [Q40_BL('h', '2.*u_p1'), Q40_BL('v', '2.*u_p1'),
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec3 s_=O(uv).rgb;vec4 r_;
   if(m==0){vec4 g5[25];for(int j=0;j<5;j++)for(int i=0;i<5;i++){vec2 q=uv+vec2(float(i-2),float(2-j))*u_px;vec3 mp=T(q).rgb;vec2 e=Q40X(q);
     ${Q40_TN('n0', 'e', '.03', 1, true, 'a')}${Q40_TN('n1', 'e+200.*(vec2(mp.r,mp.b)-.5)', '.03', 1, true)}g5[j*5+i]=Q40P(n1)*n0.a;}
    float sw=max(.5*u_k*SC,.05);float w1=exp(-.5/(sw*sw));float wk[3]=float[3](w1,1.,w1);vec4 g3[9];
    for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec4 a_=vec4(0.);float ws=0.;for(int b_=0;b_<3;b_++)for(int c_=0;c_<3;c_++){float w=wk[b_]*wk[c_];a_+=w*g5[(j+b_)*5+i+c_];ws+=w;}g3[j*3+i]=a_/ws;}
    vec3 lp=-9.*Q40U(g3[4]).rgb;for(int k=0;k<9;k++)lp+=Q40U(g3[k]).rgb;lp=clamp(lp,0.,1.);float a9=clamp(5.*clamp(5.*Q40LM(lp),0.,1.)-.5,0.,1.);r_=vec4(vec3(157.,87.,40.)/255.*a9,a9);}
   else{vec4 g3[9];for(int j=0;j<3;j++)for(int i=0;i<3;i++){vec2 q=uv+vec2(float(i-1),float(1-j))*u_px;vec3 mp=T(q).rgb;${Q40_TN('n1', 'Q40X(q)+100.*(vec2(mp.g,mp.r)-.5)', '.08', 1, true)}g3[j*3+i]=Q40P(n1);}
    vec3 lp=-9.*Q40U(g3[4]).rgb;for(int k=0;k<9;k++)lp+=Q40U(g3[k]).rgb;lp=clamp(lp,0.,1.);float al=g3[4].a;float v_=clamp(1.-6.*lp.g,0.,1.);vec4 fb=vec4(vec3(v_)*al,al);
    ${Q40_G2('r8', '.5*u_k*SC', 'uv', q => `O(${q}).rgb`, 1)}vec4 r12=Q40MUL(fb,vec4(r8,1.));r_=Q40SCR(r12,r12);}
   return vec4(mix(s_,Q40W(r_).rgb,u_p2),1.);`],
  'Inkscape filters.svg Alpha Draw Liquid (fractal noise .03 displaced by the blur-2 image (scale 200, R/B), in noise, blur .5, Laplacian 8-neighbour kernel, luminanceToAlpha x5, alpha 5a-.5 -> rgb(157,87,40) ink) and Liquid Drawing (noise .08 displaced by blur 2 (scale 100, G/R), Laplacian, 1-6G matrix, multiply with blur .5, self-screen); transparency over white; approx.: noise seeds differ, .01/.2 px blurs omitted');

/* ---------- noise displacement presets ---------- */
f = add('Distort');
f('q40_displace','Inkscape Noise Displace Presets',[S('Preset',['Chalk and Sponge','Lapping','Rough and Dilate','Blotting Paper']),Q40_SCP,Q40_MIX],
  [`${Q40_H}float SC=u_p1;int m=int(u_p0+.5);
   if(m==1){${Q40_TN('n', 'Q40X(uv)', '.1', 5, true)}return Q40P(n);}
   if(m==2){float rr=R(7.*SC);float st=max(1.,rr/32.);vec3 mx=T(uv).rgb;for(int i=-32;i<=32;i++){float o_=float(i)*st;if(abs(o_)>rr)continue;mx=max(mx,T(uv+vec2(o_,0.)*u_px).rgb);}return vec4(mx,1.);}
   if(m==3)return vec4(blur1d(u_tex,uv,vec2(1.,0.),R(6.*SC)).rgb,1.);return vec4(T(uv).rgb,1.);`,
   `float SC=u_p1;int m=int(u_p0+.5);
   if(m==1)return blur1d(u_tex,uv,vec2(1.,0.),R(4.*SC));
   if(m==2){float rr=R(7.*SC);float st=max(1.,rr/32.);vec3 mx=T(uv).rgb;for(int i=-32;i<=32;i++){float o_=float(i)*st;if(abs(o_)>rr)continue;mx=max(mx,T(uv+vec2(0.,o_)*u_px).rgb);}return vec4(mx,1.);}
   if(m==3)return vec4(blur1d(u_tex,uv,vec2(0.,1.),R(6.*SC)).rgb,1.);return T(uv);`,
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);
   if(m==1)return blur1d(u_tex,uv,vec2(0.,1.),R(4.*SC));
   if(m==3){${Q40_TN('n', 'Q40X(uv)', '.05', 5, false, 'rg')}return vec4(T(uv+Q40D(3.*(n.rg-.5))).rgb,1.);}return T(uv);`,
   `int m=int(u_p0+.5);if(m==3)return vec4(blur1d(u_tex,uv,vec2(1.,0.),R(10.*u_p1)).rgb,1.);return T(uv);`,
   `int m=int(u_p0+.5);if(m==3)return vec4(blur1d(u_tex,uv,vec2(0.,1.),R(10.*u_p1)).rgb,1.);return T(uv);`,
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec3 s_=O(uv).rgb;vec4 r_=vec4(s_,1.);vec4 t_=T(uv);
#define Q40OB(Q_) vec4(O(clamp(Q_,vec2(0.),vec2(1.))).rgb,1.)
   if(m==0){${Q40_TN('n', 'Q40X(uv)', '.4', 5, true, 'rg')}r_=Q40OB(uv+Q40D(30.*(n.rg-.5)));}
   else if(m==1){vec4 mp=Q40U(t_);r_=Q40OB(uv+Q40D(50.*(vec2(mp.r,mp.b)-.5)));}
   else if(m==2){${Q40_TN('n', 'Q40X(uv)', '.07', 3, true, 'ra')}vec2 qd=uv+Q40D(10.*(vec2(n.r,n.a)-.5));vec3 r12=.5*O(qd).rgb*T(qd).rgb+.5*T(qd).rgb;r_=Q40AR(vec4(s_,1.),vec4(r12,1.),.25,.25,.75,0.);}
   else{${Q40_TN('n', 'Q40X(uv)', '.05', 5, false, 'rg')}vec2 qd=uv+Q40D(3.*(n.rg-.5));${Q40_G2('r2', '3.*u_k*SC', 'qd', q => `O(${q}).rgb`, 3)}r_=Q40AR(t_,vec4(r2*r2,1.),1.,.25,1.,0.);}
   return vec4(mix(s_,Q40W(r_).rgb,u_p2),1.);`],
  'Inkscape filters.svg Chalk and Sponge (fractal noise .4 x5 octaves displacing the image by 30 px, R/G), Lapping (noise .1 blurred 2, displacement 50 R/B), Rough and Dilate (dilate radius 7, arithmetic .5/.5, noise .07 displacement 10 R/A, arithmetic .25,.25,.75), Blotting Paper (blur 3 displaced by turbulence .05 (scale 3), self-multiply, blur 5, arithmetic 1,.25,1); off-image samples clamp to the edge (Inkscape: transparent); approx.: noise seeds differ, Blotting Paper rebuilds its blur-3 tap with a strided 2D Gaussian');

/* ---------- noise relief lighting: Plastify / Tinfoil / Jelly Bump ---------- */
f = add('Materials');
f('q40_foil','Inkscape Plastify / Tinfoil / Jelly Bump',[S('Preset',['Plastify','Tinfoil','Jelly Bump']),Q40_SCP,Q40_MIX],
  [`${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec4 s_=vec4(O(uv).rgb,1.);if(m!=2)return s_;${Q40_TN('n', 'Q40X(uv)', '.015', 2, true)}return Q40AR(Q40P(n),s_,0.,.5,1.,0.);`,
   `float sg_[3]=float[3](1.,.5,1.5);float sg=sg_[int(u_p0+.5)]*u_p1;` + Q40_BL('h', 'sg'),
   `float sg_[3]=float[3](1.,.5,1.5);float sg=sg_[int(u_p0+.5)]*u_p1;` + Q40_BL('v', 'sg'),
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec4 mp=Q40U(T(uv));
   if(m<2){${Q40_TN('n', 'Q40X(uv)+100.*(vec2(mp.r,mp.b)-.5)', 'vec2(.004,.008)', 1, true)}return Q40P(n);}
   ${Q40_TN('n', 'Q40X(uv)+62.*(vec2(mp.a,mp.g)-.5)', '.015', 2, true, 'a')}return vec4(0.,0.,0.,n.a);`,
   `${Q40_H}float SC=u_p1;int m=int(u_p0+.5);vec3 s_=O(uv).rgb;vec4 r_;
   if(m==0){${Q40_GR(q => `hv=T(${q}).a;`)}float sp=clamp(Q40SP(Q40N(GR,-10.),225.,80.,1.,50.),0.,1.);vec4 r9=Q40SCR(vec4(sp),vec4(s_,1.));r_=Q40AT(r9,vec4(s_,1.));}
   else if(m==1){${Q40_GR5(q => `hv=T(${q}).a;`, '.5')}vec3 c2=clamp(Q40SP(Q40N(GR,12.),225.,70.,1.,40.)*vec3(254.,218.,71.)/255.,0.,1.);vec4 r2=vec4(c2,max(c2.r,max(c2.g,c2.b)));
    vec3 d_=clamp(Q40DF(Q40N(GR,50.),225.,55.,.5)*vec3(116.,245.,254.)/255.,0.,1.);vec4 r9=Q40SCR(vec4(d_,1.),vec4(s_,1.));vec4 r11=Q40AR(r2,r9,0.,1.,1.,0.);r_=Q40MUL(r11,r11);}
   else{${Q40_GR(q => `hv=T(${q}).a;`)}vec3 c2=clamp(Q40SP(Q40N(GR,15.),225.,35.,1.,5.)*vec3(245.,230.,195.)/255.,0.,1.);vec4 r12=vec4(c2,max(c2.r,max(c2.g,c2.b)));r_=Q40OV(r12,vec4(vec3(193.,255.,255.)/255.*.5,.5));}
   return vec4(mix(s_,Q40W(r_).rgb,u_p2),1.);`],
  'Inkscape filters.svg Plastify (low-frequency fractal noise .004/.008 displaced by the blurred image (scale 100, R/B) as the bump surface, white specular -10/exp 50 screened on and atop the image), Tinfoil (same noise surface blurred .5: gold specular 12/exp 40 + cyan diffuse 50 screened, summed, self-multiplied), Jelly Bump (noise+image blur 1.5 displaces noise (scale 62, A/G); cream specular 15/exp 5 merged over a 50% cyan flood: the source colour is replaced, as in Inkscape); approx.: noise seeds differ');

/* ---------- Thick Acrylic / Wrinkled Varnish ---------- */
f('q40_varnish','Inkscape Thick Acrylic / Wrinkled Varnish',[S('Preset',['Thick Acrylic','Wrinkled Varnish']),Q40_SCP,Q40_MIX],
  [`return vec4(blur1d(u_tex,uv,vec2(1.,0.),R(2.*u_p1)).rgb,1.);`, `return vec4(blur1d(u_tex,uv,vec2(0.,1.),R(2.*u_p1)).rgb,1.);`,
   `${Q40_H}float SC=u_p1;float fq=u_p0<.5?.02:.015;${Q40_TN('n', 'Q40X(uv)', 'fq', 5, true, 'a')}float al=1.-n.a;return vec4(T(uv).rgb*al,al);`,
   `float sg=(u_p0<.5?.5:2.)*u_p1;` + Q40_BL('h', 'sg'), `float sg=(u_p0<.5?.5:2.)*u_p1;` + Q40_BL('v', 'sg'),
   `${Q40_H}float SC=u_p1;float fq=u_p0<.5?.02:.015;vec4 mp=Q40U(T(uv));${Q40_TN('n', 'Q40X(uv)+100.*(vec2(mp.a,mp.g)-.5)', 'fq', 5, true, 'a')}
   ${Q40_G2('r9', 'u_k*SC', 'uv', q => `O(${q}).rgb`, 3)}vec4 fb=vec4(r9*n.a,n.a);return Q40MUL(fb,fb);`,
   `${Q40_H}float SC=u_p1;vec3 s_=O(uv).rgb;vec4 fb=T(uv);vec4 r_;
   if(u_p0<.5){${Q40_GR(q => `hv=T(${q}).a;`)}float df=clamp(Q40DF(Q40N(GR,10.),235.,25.,.7),0.,1.);r_=Q40AR(fb,vec4(vec3(df),1.)*fb.a,0.,1.,1.,0.);}
   else{${Q40_GR5(q => `hv=T(${q}).a;`, '.5')}float sp=clamp(Q40SP(Q40N(GR,15.),225.,35.,1.,5.),0.,1.);r_=Q40AR(fb,vec4(sp)*fb.a,0.,1.,1.,0.);}
   return vec4(mix(s_,Q40W(r_).rgb,u_p2),1.);`],
  'Inkscape filters.svg Thick Acrylic / Wrinkled Varnish: blur-1 image "out" fractal noise (.02 / .015, 5 oct.), blurred (.5 / 2) and used as map (A/G, scale 100) to displace the noise, image "in" the displaced noise alpha, self-multiply, then diffuse 10 (az 235 el 25) or specular 15 exp 5 (az 225 el 35) masked to it and added (arithmetic 0,1,1); transparency over white; approx.: noise seeds differ, final .2/.5 px blurs of the light layer omitted');

/* ---------- Riddled ---------- */
f('q40_riddled','Inkscape Riddled',[Q40_SCP,Q40_MIX],
  [`${Q40_H}float SC=u_p0;${Q40_TN('n', 'Q40X(uv)', '.04', 10, true)}return Q40P(n);`, Q40_BL('h', 'u_p0'), Q40_BL('v', 'u_p0'),
   `${Q40_H}float SC=u_p0;${Q40_TN('n', 'Q40X(uv)', '.04', 10, true, 'rb')}vec2 qd=uv+Q40D(20.*(vec2(n.r,n.b)-.5));${Q40_G2('r2', '.5*u_k*SC', 'qd', q => `O(${q}).rgb`, 1)}
   vec4 R2=vec4(r2,1.);return Q40AR(R2,R2*T(uv).a,2.,.15,0.,0.);`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;vec4 fb=T(uv);
#define Q40RA(V_) clamp(-.8*Q40U(V_).r-Q40U(V_).g+3.7*(V_).a-2.6,0.,1.)
   ${Q40_GR5(q => `hv=Q40RA(T(${q}));`, '.5')}float sp=clamp(Q40SP(Q40N(GR,10.),235.,55.,.7,3.),0.,1.);float df=clamp(Q40DF(Q40N(GR,50.),235.,10.,.4),0.,1.);
   vec4 r10=Q40SCR(vec4(vec3(df),1.),vec4(sp));vec4 r_=Q40AR(r10*fb.a,fb,0.,1.,.9,0.);return vec4(mix(s_,Q40W(r_).rgb,u_p1),1.);`],
  'Inkscape filters.svg Riddled: 10-octave fractal noise .04 displaces the blur-.5 image (scale 20, R/B), masked by the blur-1 noise alpha, arithmetic 2,.15 -> holes; alpha matrix (-.8,-1,0,3.7,-2.6) blurred .5 as the surface for specular (10, exp 3) + diffuse (50) lights (az 235), screened, masked and added (0,1,.9); transparency over white; approx.: noise seeds differ');

/* ---------- Bubbly Bumps ---------- */
f('q40_bubbly','Inkscape Bubbly Bumps',[Q40_SCP,Q40_MIX],
  [`float SC=u_p0;${Q40_G2('b', '.5*u_k*SC', 'uv', q => `O(${q}).rgb`, 1)}return vec4(b,1.);`,
   `${Q40_H}float SC=u_p0;vec4 r8=vec4(0.);float ws=0.;float sw=max(.5*u_k*SC,.05);float w1=exp(-.5/(sw*sw));
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?1.:w1)*(j==0?1.:w1);${Q40_TN('n', 'Q40X(uv+vec2(float(i),float(j))*u_px)', '.2', 10, true, 'ra')}r8+=w*vec4(n.r*n.a,0.,0.,n.a);ws+=w;}r8/=ws;
   vec4 mp=Q40U(r8);vec4 r7=vec4(T(uv+Q40D(5.*(vec2(mp.r,mp.a)-.5))).rgb,1.);${Q40_TN('n1', 'Q40X(uv)', '.2', 10, true, 'a')}vec4 r2=r7*n1.a;vec4 x_=Q40AR(T(uv),r2,0.,0.,3.,0.);return Q40MUL(x_,r2);`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;vec4 fb=T(uv);
#define Q40BB(V_) clamp(-1.8*Q40U(V_).r-.5*Q40U(V_).g+5.7*(V_).a-3.5,0.,1.)
   ${Q40_GR5(q => `hv=Q40BB(T(${q}));`, '.5')}float sp=clamp(Q40SP(Q40N(GR,5.),225.,10.,1.,3.),0.,1.);vec4 r21=vec4(sp)*Q40BB(fb);vec4 r_=Q40AR(fb,r21,0.,.8,.7,0.);return vec4(mix(s_,Q40W(r_).rgb,u_p1),1.);`],
  'Inkscape filters.svg Bubbly Bumps: 10-octave fractal noise .2 (blurred .5) displaces the blur-.5 image (scale 5, R/A), masked by the noise alpha, x3 and multiplied -> bubbles; alpha matrix (-1.8,-.5,0,5.7,-3.5) blurred .5 drives a specular light (5, exp 3, az 225 el 10) added .8/.7; transparency over white; approx.: noise seeds differ, .2 px blur omitted');

/* ---------- Cracked Glass ---------- */
f('q40_crackedglass','Inkscape Cracked Glass',[Q40_SCP,Q40_MIX],
  [`${Q40_H}float SC=u_p0;${Q40_TN('n', 'Q40X(uv)', '.1', 5, true)}return Q40P(n);`, Q40_BL('h', '4.*u_p0'), Q40_BL('v', '4.*u_p0'),
   `${Q40_H}float SC=u_p0;vec4 mp=Q40U(T(uv));vec3 r5=O(uv+Q40D(20.*(vec2(mp.g,mp.a)-.5))).rgb;${Q40_TN('n', 'Q40X(uv)', '.1', 5, true, 'a')}return vec4(r5*n.a,n.a);`,
   `vec4 t_=T(uv);return vec4(t_.rgb,blur1d(u_tex,uv,vec2(1.,0.),R(2.*u_p0)).a);`,
   `vec4 t_=T(uv);return vec4(t_.rgb,blur1d(u_tex,uv,vec2(0.,1.),R(2.*u_p0)).a);`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;${Q40_GR(q => `hv=T(${q}).a;`)}float sp=clamp(Q40SP(Q40N(GR,-3.),225.,45.,3.5,35.),0.,1.);${Q40_TN('n', 'Q40X(uv)', '.1', 5, true, 'a')}
   vec4 r2=vec4(T(uv).rgb,n.a);vec4 r91=Q40AR(vec4(sp),r2,1.7,0.,.7,0.);vec4 fb=Q40MUL(r91,r91);vec4 r4=Q40CL(2.*fb);vec4 r_=Q40SCR(r4,r4);return vec4(mix(s_,Q40W(r_).rgb,u_p1),1.);`],
  'Inkscape filters.svg Cracked Glass: fractal noise .1 (5 oct.) blurred 4 displaces the image (scale 20, G/A), masked by the noise alpha, blur 1 surface for a specular light (-3, Ks 3.5, exp 35, az 225 el 45), arithmetic 1.7/.7, self-multiply, x2, self-screen; transparency over white; approx.: noise seeds differ');

/* ---------- Jam Spread ---------- */
f('q40_jamspread','Inkscape Jam Spread',[Q40_SCP,Q40_MIX],
  [`return vec4(blur1d(u_tex,uv,vec2(1.,0.),R(2.*u_p0)).rgb,1.);`, `return vec4(blur1d(u_tex,uv,vec2(0.,1.),R(2.*u_p0)).rgb,1.);`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;${Q40_GR5(q => `${Q40_TN('n', 'Q40X(' + q + ')', '.017', 7, false, 'a')}hv=1.-n.a;`, '.5')}
   float sp=clamp(Q40SP(Q40N(GR,1.5),225.,62.,4.,100.),0.,1.);${Q40_TN('n0', 'Q40X(uv)', '.017', 7, false, 'a')}float al=1.-n0.a;vec4 r2=vec4(T(uv).rgb*al,al);
   vec4 r91=Q40AT(vec4(sp),r2);vec4 r_=Q40MUL(r91,r91);return vec4(mix(s_,Q40W(r_).rgb,u_p1),1.);`],
  'Inkscape filters.svg Jam Spread: blur-1 image "out" 7-octave turbulence (.017), blurred .5 alpha as the surface of a sharp specular glint (1.5, Ks 4, exp 100, az 225 el 62) composited atop and self-multiplied; transparency over white; approx.: noise seed differs');

/* ---------- Relief Print / Bump Engraving / Velvet Bumps ---------- */
f = add('Paint');
f('q40_reliefprint','Inkscape Relief Print',[Q40_SCP,Q40_MIX],
  [`${Q40_H}vec4 s_=vec4(O(uv).rgb,1.);vec4 r2=Q40AR(s_,vec4(75.,101.,154.,255.)/255.,.5,.3,.3,0.);vec4 u=Q40U(r2);return vec4(0.,0.,0.,clamp(-.8*u.r-u.g+3.9*u.a-2.7,0.,1.));`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;${Q40_GR5(q => `hv=T(${q}).a;`, '.5')}float df=clamp(Q40DF(Q40N(GR,50.),225.,20.,.7),0.,1.);float sp=clamp(Q40SP(Q40N(GR,10.),225.,45.,.7,20.),0.,1.);
   vec4 r5=Q40SCR(vec4(vec3(df),1.),vec4(s_,1.));return Q40AR(vec4(sp),r5,0.,1.,1.,0.);`,
   `float SC=u_p0;${Q40_G2('b', '.5*u_k*SC', 'uv', q => `T(${q}).rgb`, 1)}return vec4(mix(O(uv).rgb,b,u_p1),1.);`],
  'Inkscape filters.svg Relief Print: image arithmetic-mixed with rgb(75,101,154) (.5,.3,.3), alpha matrix (-.8,-1,0,3.9,-2.7) blurred .5 as relief surface; diffuse 50 (el 20) screened over the image plus specular 10 (exp 20, el 45), blur .5');
f('q40_bumpengrave','Inkscape Bump Engraving',[P('Relief scale', .25, 4, 1, .01, 'x'),Q40_MIX],
  [`vec3 v_=405.*O(uv).rgb-100.*(O(uv+vec2(u_px.x,0.)).rgb+O(uv-vec2(u_px.x,0.)).rgb+O(uv+vec2(0.,u_px.y)).rgb+O(uv-vec2(0.,u_px.y)).rgb);v_=clamp(v_/5.,0.,1.);return vec4(0.,0.,0.,clamp(1.-dot(v_,vec3(.21,.72,.07)),0.,1.));`,
   `${Q40_H}float SC=u_p0;vec3 s_=O(uv).rgb;${Q40_GR(q => `hv=T(${q}).a;`)}float df=clamp(Q40DF(Q40N(GR,15.),225.,10.,.5),0.,1.);vec3 r9=clamp(vec3(df)+.5*s_,0.,1.);float g=dot(r9,vec3(.213,.715,.072));return vec4(mix(s_,vec3(step(1./3.,g)),u_p1),1.);`],
  'Inkscape filters.svg Bump Engraving: 0/100/-405 cross kernel (divisor = kernel sum -5) -> alpha 1-luminance as a surface, diffuse 15 (Kd .5, az 225 el 10) + half the image, desaturated, discrete 0/1/1 -> black-and-white engraving');
f('q40_velvetbumps','Inkscape Velvet Bumps',[Q40_SCP,Q40_MIX],
  [Q40_BL('h', 'u_p0'), Q40_BL('v', 'u_p0'), `vec3 a_=O(uv).rgb,b_=T(uv).rgb;return vec4(a_+b_-a_*b_,1.);`, Q40_BL('h', 'u_p0'), Q40_BL('v', 'u_p0'),
   `float k_[9]=float[9](2.,0.,0.,1.,1.,-1.,0.,0.,-2.);vec3 cv=vec3(0.);for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++)cv+=k_[(1-dy)*3+(1-dx)]*T(uv+vec2(float(dx),-float(dy))*u_px).rgb;
   return vec4(mix(O(uv).rgb,min(T(uv).rgb,clamp(cv,0.,1.)),u_p1),1.);`],
  'Inkscape filters.svg Velvet Bumps: image screened with its blur 1, blurred 1 again, 3x3 kernel (2 0 0 / 1 1 -1 / 0 0 -2, applied flipped as SVG convolution) and darkened with the blur');

/* ---------- Soft Colors ---------- */
f = add('Color');
f('q40_softcolors','Inkscape Soft Colors',[Q40_SCP,Q40_MIX],
  [`${Q40_H}vec4 s_=vec4(O(uv).rgb,1.);return Q40AR(s_,s_,.3,.4,.3,0.);`, Q40_BL('h', '5.*u_p0'), Q40_BL('v', '5.*u_p0'),
   `${Q40_H}vec4 s_=vec4(O(uv).rgb,1.);vec4 r15=Q40AR(s_,s_,.3,.4,.3,0.);vec4 r6=Q40AR(r15,vec4(T(uv).rgb,1.),.3,.4,.3,0.);vec3 dk=min(r6.rgb,vec3(128.,172.,0.)/255.);
   return vec4(mix(s_.rgb,dk+r6.rgb-dk*r6.rgb,u_p1),1.);`],
  'Inkscape filters.svg Soft Colors: self arithmetic (.3,.4,.3), blur 5 glow mixed back the same way, darkened with rgb(128,172,0) and screened over itself');

/* ---------- contouring / posterized blur (blurred shape -> periodic transfer) ---------- */
const Q40_CB = dir => `int m=int(u_p0+.5);float sa=R((m==0?14.:17.)*u_p2),sc=R(10.*u_p2);float rr=2.*max(sa,sc);float st=max(1.,rr/32.);vec3 ac=vec3(0.);float aa=0.,wa=0.,wc=0.;
 for(int i=-32;i<=32;i++){float x_=float(i)*st;if(abs(x_)>rr)continue;vec2 q=uv+${dir}*x_*u_px;vec4 v=T(q);float ga=exp(-x_*x_/(2.*sa*sa)),gc=exp(-x_*x_/(2.*sc*sc));
  bool ins=all(greaterThanEqual(q,vec2(0.)))&&all(lessThanEqual(q,vec2(1.)));aa+=ga*(ins?v.a:0.);wa+=ga;ac+=gc*v.rgb;wc+=gc;}return vec4(ac/wc,aa/wa);`;
f = add('Stylize');
f('q40_contouring','Inkscape Contouring / Posterized Blur',[S('Preset',['Contouring Discrete','Contouring Table','Posterized Blur']),S('Shape',['Auto','Luma','Inverted luma','Image alpha (frame)']),P('Blur scale',.25,3,1,.01,'x'),Q40_MIX],
  [`int sh=int(u_p1+.5);if(sh==0)sh=u_p0>1.5?3:1;vec3 o_=O(uv).rgb;return vec4(o_,sh==1?luma(o_):sh==2?1.-luma(o_):1.);`, Q40_CB('vec2(1.,0.)'), Q40_CB('vec2(0.,1.)'),
   `int m=int(u_p0+.5);vec4 t_=T(uv);float b=clamp(t_.a,0.,1.);float v0=1.-b*b;vec3 s_=O(uv).rgb;vec3 r_;
   if(m==0){float k=min(floor(v0*19.),18.);float v_=k>17.5?1.:mod(k,2.);r_=vec3(.50196+.49804*v_);}
   else if(m==1){float tt=v0*18.;float k=min(floor(tt),17.);float a0=mod(k,2.),a1=k>16.5?1.:mod(k+1.,2.);r_=vec3(.50196+.49804*mix(a0,a1,tt-k));}
   else{float qv=min(min(floor(min(v0,.99999)*12.),11.)*.1,1.);float am=1.-qv;vec3 cc=min(floor(clamp(t_.rgb,0.,.99999)*12.)*.1,1.);r_=cc*am+1.-am;}
   return vec4(mix(s_,r_,u_p3),1.);`],
  'Inkscape filters.svg Contouring Discrete / Table (SourceAlpha blurred 14 / 17, "in" itself, over white, 19-entry 0/1 discrete or table transfer, alpha 1-luminance on 50% gray -> contour bands) and Posterized Blur (same shape blur 17 -> 12-step discrete alpha mask, image blurred 10 and posterized 12 steps "in" it). Inkscape reads the object alpha; for opaque photos Shape Auto uses luma for the contour presets and the literal image alpha (frame) for Posterized Blur');
