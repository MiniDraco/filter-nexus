/* ================= restore (part 2): frequency / multiscale views — block transforms, Haar, pyramids, steerable, contourlet-style, Riesz, wavelet denoise ================= */
// Gaussian of the filter input at pos (σ in working px; σ≈0 → the pixel itself); n = half-width in taps, spacing 3σ/n
const RS_GS = (sig, pos, out, n = 4, fn = 'O') => `vec3 ${out}=vec3(0.);{float sg_=${sig};if(sg_<.05)${out}=${fn}(${pos}).rgb;else{float st_=sg_*3./${n}.;float ws_=0.;for(int j_=-${n};j_<=${n};j_++)for(int i_=-${n};i_<=${n};i_++){vec2 o_=vec2(float(i_),float(j_))*st_;float g_=exp(-dot(o_,o_)/(2.*sg_*sg_));${out}+=g_*${fn}(${pos}+o_*u_px).rgb;ws_+=g_;}${out}/=ws_;}}`;
// σ of the equivalent Gaussian of pyramid level l (iterated 5-tap binomial REDUCE / B3 à trous): σ² = (4^l − 1)/3
const RS_SIGL = l => `sqrt((exp2(2.*(${l}))-1.)/3.)`;
const RS_IP = `vec2 p=floor(uv*u_res);vec2 ip=vec2(p.x,u_res.y-1.-p.y);
#define RSIP(q) O((vec2((q).x,u_res.y-1.-(q).y)+.5)/u_res)
`;

f = add('Analysis');
f('blocktransform','Block Transform View (DCT / Walsh-Hadamard / Haar 8×8)',[S('Transform',['DCT-II','Walsh-Hadamard (sequency order)','Haar']),S('Layout',['In place (per block)','Subband mosaic']),S('Display',['log |c| (inferno)','Signed (grey = 0)']),P('Gain',.1,10,1,.1)],
 RS_IP + `vec2 nb=floor(u_res/8.);int tr=int(u_p0+.5);vec2 b,uvk;
 if(u_p1<.5){b=floor(ip/8.);uvk=mod(ip,8.);}else{uvk=floor(ip/nb);b=mod(ip,nb);}
 if(b.x>=nb.x||b.y>=nb.y||uvk.x>7.||uvk.y>7.)return vec4(vec3(.1),1.);
 float bas[16];for(int a=0;a<2;a++){int k=int(a==0?uvk.x:uvk.y);for(int n=0;n<8;n++){float v;
  if(tr==0)v=(k==0?sqrt(.125):.5)*cos((2.*float(n)+1.)*float(k)*PI/16.);
  else if(tr==1){int g=k^(k>>1);int nat=((g&1)<<2)|(g&2)|((g>>2)&1);int x_=nat&n;int pc=(x_&1)+((x_>>1)&1)+((x_>>2)&1);v=((pc&1)==1?-1.:1.)*sqrt(.125);}
  else{if(k==0)v=sqrt(.125);else if(k==1)v=(n<4?1.:-1.)*sqrt(.125);else if(k<4)v=(n/4==k-2)?((n%4)<2?.5:-.5):0.;else v=(n/2==k-4)?((n%2)==0?.70710678:-.70710678):0.;}
  bas[a*8+n]=v;}}
 float cf=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++)cf+=luma(RSIP(b*8.+vec2(float(i),float(j))).rgb)*bas[i]*bas[8+j];
 bool dc=uvk.x<.5&&uvk.y<.5;
 if(u_p2<.5)return vec4(ramp(1,clamp(log(1.+abs(cf)*255.*u_p3)/log(1.+2040.),0.,1.)),1.);
 return vec4(vec3(dc?cf/8.:clamp(.5+cf*u_p3,0.,1.)),1.);`,
 'exact per 8×8 block (each pixel computes its coefficient from the 64 block pixels, luma, top-left grid): orthonormal DCT-II (JPEG), Walsh-Hadamard in sequency order, or the 8-point Haar basis; in place or rearranged into 64 subband images');

const RS_DQ_ROW = `vec2 p=floor(uv*u_res);vec2 ip=vec2(p.x,u_res.y-1.-p.y);float b0=floor(ip.x/8.)*8.;float k=mod(ip.x,8.);vec3 s=vec3(0.);
 for(int n=0;n<8;n++){vec3 v=T((vec2(b0+float(n),p.y)+.5)/u_res).rgb-.5;s+=v*cos((2.*float(n)+1.)*k*PI/16.);}s*=k<.5?sqrt(.125):.5;return vec4(.5+s/6.,1.);`;
f('dctquant','DCT Coefficient Quantization (8×8)',[S('Quantizer',['JPEG luma table × quality','Uniform step','Zonal (keep low u+v)','Hard threshold']),P('Quality',1,100,30,1),S('Output',['Reconstructed','Error ×8','Kept coefficients'])],
 [RS_DQ_ROW,
  JPEG_Q + `vec2 p=floor(uv*u_res);float iy=u_res.y-1.-p.y;float b0=floor(iy/8.)*8.;float k=mod(iy,8.);vec3 s=vec3(0.);
  for(int n=0;n<8;n++){vec3 v=(T((vec2(p.x,u_res.y-1.-(b0+float(n)))+.5)/u_res).rgb-.5)*6.;s+=v*cos((2.*float(n)+1.)*k*PI/16.);}s*=k<.5?sqrt(.125):.5;
  float u=mod(p.x,8.);int md=int(u_p0+.5);float Q=u_p1;vec3 r=s;float kept=1.;
  if(md==0){float q=Q<50.?5000./Q:200.-2.*Q;float st=max(floor((QL[int(k)*8+int(u)]*q+50.)/100.),1.)/255.;r=floor(s/st+.5)*st;}
  else if(md==1){float st=(101.-Q)/100.*.25;r=floor(s/st+.5)*st;}
  else if(md==2){kept=step(u+k,floor(Q/100.*14.));r=s*kept;}
  else{vec3 kp=step((100.-Q)/100.*.2,abs(s));kept=dot(kp,vec3(1./3.));r=s*kp;if(u+k<.5){r=s;kept=1.;}}
  if(int(u_p2+.5)==2)return vec4(vec3(md<2?(dot(abs(r),vec3(1.))>0.?1.:0.):kept),1.);return vec4(.5+r/16.,1.);`,
  `vec2 p=floor(uv*u_res);if(int(u_p2+.5)==2)return c;float iy=u_res.y-1.-p.y;float b0=floor(iy/8.)*8.;float n=mod(iy,8.);vec3 s=vec3(0.);
  for(int k=0;k<8;k++){vec3 v=(T((vec2(p.x,u_res.y-1.-(b0+float(k)))+.5)/u_res).rgb-.5)*16.;s+=v*(k==0?sqrt(.125):.5)*cos((2.*n+1.)*float(k)*PI/16.);}return vec4(.5+s/6.,1.);`,
  `vec2 p=floor(uv*u_res);int o=int(u_p2+.5);if(o==2)return c;float b0=floor(p.x/8.)*8.;float n=mod(p.x,8.);vec3 s=vec3(0.);
  for(int k=0;k<8;k++){vec3 v=(T((vec2(b0+float(k),p.y)+.5)/u_res).rgb-.5)*6.;s+=v*(k==0?sqrt(.125):.5)*cos((2.*n+1.)*float(k)*PI/16.);}vec3 r=s+.5;
  return o==1?vec4(clamp(abs(r-O(uv).rgb)*8.,0.,1.),1.):vec4(r,1.);`],
 'exact separable 8×8 DCT per RGB channel (4 passes, top-left grid): quantize with the JPEG luminance table scaled by quality, a uniform step, zonal low-pass (keep u+v < N) or a hard threshold, then inverse DCT; error view and kept-coefficient map');

f('haarwavelet','Haar Wavelet Decomposition',[P('Levels',1,5,3,1),P('Detail gain',1,20,4,.5),S('Display',['Signed (grey = 0)','Magnitude']),S('Colour',['Luma','RGB'])],
 RS_IP + `int L=int(u_p0+.5);vec2 hw;int lev=0;int band=0;vec2 ci;
 for(int l=1;l<=5;l++){if(l>L)break;hw=floor(u_res/exp2(float(l)));vec2 full=hw*2.;if(l==1&&(ip.x>=full.x||ip.y>=full.y))return vec4(vec3(.1),1.);
  if(ip.x<full.x&&ip.y<full.y&&(ip.x>=hw.x||ip.y>=hw.y)){lev=l;band=(ip.x>=hw.x?1:0)+(ip.y>=hw.y?2:0);ci=ip-vec2(ip.x>=hw.x?hw.x:0.,ip.y>=hw.y?hw.y:0.);break;}}
 if(lev==0){lev=L;band=0;ci=ip;}
 float bs=exp2(float(lev));vec2 o0=ci*bs;vec3 q[4];for(int t=0;t<4;t++)q[t]=vec3(0.);
 if(lev==1){q[0]=RSIP(o0).rgb;q[1]=RSIP(o0+vec2(1.,0.)).rgb;q[2]=RSIP(o0+vec2(0.,1.)).rgb;q[3]=RSIP(o0+vec2(1.,1.)).rgb;}
 else{float n2=bs*.5;float hf=n2*.5;for(int j=0;j<16;j++)for(int i=0;i<16;i++){if(float(i)>=n2||float(j)>=n2)continue;vec2 e=o0+vec2(2.*float(i)+1.,2.*float(j)+1.);
   vec3 v=O(vec2(e.x,u_res.y-e.y)/u_res).rgb;int t=(float(i)>=hf?1:0)+(float(j)>=hf?2:0);q[t]+=v;}for(int t=0;t<4;t++)q[t]/=hf*hf;}
 vec3 cf=band==0?(q[0]+q[1]+q[2]+q[3])*.25:band==1?(q[0]+q[2]-q[1]-q[3])*.25:band==2?(q[0]+q[1]-q[2]-q[3])*.25:(q[0]+q[3]-q[1]-q[2])*.25;
 if(u_p3<.5)cf=vec3(luma(cf));if(band==0)return vec4(cf,1.);
 return u_p2<.5?vec4(clamp(.5+cf*u_p1,0.,1.),1.):vec4(clamp(abs(cf)*u_p1*2.,0.,1.),1.);`,
 'exact multi-level 2D Haar (Mallat layout, top-left: LL, then HL / LH / HH quadrants per level); each coefficient computed from its 2^l × 2^l block (2×2 cells read by one bilinear tap); details shown as mean differences × gain');

f('pyramidview','Gaussian / Laplacian Pyramid View',[S('Pyramid',['Gaussian','Laplacian']),S('Layout',['Mosaic (all levels)','Single level (full size)']),P('Level',0,6,2,1),P('Detail gain',1,10,3,.5)],
 [`if(u_p1<.5)return c;float sl=${RS_SIGL('u_p2')};return blur1d(u_tex,uv,vec2(1.,0.),R(1.4*sl));`,
  `if(u_p1<.5)return c;float sl=${RS_SIGL('u_p2')};return blur1d(u_tex,uv,vec2(0.,1.),R(1.4*sl));`,
  RS_IP + `int lev=int(u_p2+.5);bool lap=u_p0>.5;
 if(u_p1>.5){float sl=${RS_SIGL('float(lev)')};float sr=R(.714*sl),s2=R(${RS_SIGL('float(lev+1)')});float s2r=sqrt(max(s2*s2-R(.7*sl)*R(.7*sl),0.));` + RS_GS('sr','uv','g1',4,'T') + `if(!lap)return vec4(g1,1.);` + RS_GS('s2r','uv','g2',4,'T') + `return vec4(clamp(.5+(g1-g2)*u_p3,0.,1.),1.);}
 vec2 src;vec2 cv=ip*1.5;if(cv.x<u_res.x){lev=0;}else{lev=-1;for(int l=1;l<=7;l++){float y0=u_res.y*(1.-exp2(1.-float(l)));vec2 sz=u_res/exp2(float(l));if(cv.y>=y0&&cv.y<y0+sz.y&&cv.x<u_res.x+sz.x){lev=l;break;}}}
  if(lev<0||cv.y>=u_res.y)return vec4(vec3(.12),1.);float y0=lev==0?0.:u_res.y*(1.-exp2(1.-float(lev)));vec2 loc=cv-vec2(lev==0?0.:u_res.x,y0);vec2 ctr=(floor(loc)+.5)*exp2(float(lev));src=vec2(ctr.x,u_res.y-ctr.y)/u_res;
 float s1=R(${RS_SIGL('float(lev)')}),s2=R(${RS_SIGL('float(lev+1)')});` + RS_GS('s1','src','g1') + `
 if(!lap||lev>=6)return vec4(g1,1.);` + RS_GS('s2','src','g2') + `return vec4(clamp(.5+(g1-g2)*u_p3,0.,1.),1.);`],
 'Burt-Adelson pyramids; levels via the equivalent Gaussian σ = √((4^l − 1)/3) of the iterated 5-tap REDUCE (sampled 9×9 — approx.); mosaic shows the true decimated levels side by side (level 0 left, then ½, ¼ …), single level shows one level full size; Laplacian = G_l − G_l+1');

f('steerpyr','Steerable Pyramid (4 orientations)',[P('Level',1,5,2,1),S('Band',['0°','45°','90°','135°','2×2 mosaic of the 4 bands','Orientation energy (hue)']),P('Gain',1,40,8,.5)],
 RS_IP + `int bd=int(u_p1+.5);vec2 src=uv;if(bd==4){vec2 hs=floor(u_res*.5);vec2 cell=floor(ip/hs);vec2 loc=mod(ip,hs)*2.;src=(vec2(loc.x,u_res.y-1.-loc.y)+.5)/u_res;bd=int(min(cell.x,1.)+2.*min(cell.y,1.));}
 float sg=R(exp2(u_p0-1.));float r[4];for(int k=0;k<4;k++)r[k]=0.;float nrm=0.;
 for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){vec2 o=vec2(float(i),float(j))*.6*sg;float g=exp(-dot(o,o)/(2.*sg*sg));float l=luma(O(src+o*u_px).rgb);
  for(int k=0;k<4;k++){float a=float(k)*PI*.25;float t=dot(o,vec2(cos(a),sin(a)))/sg;float w=(t*t*t-3.*t)*g;r[k]+=w*l;if(k==0)nrm+=abs(w);}}
 for(int k=0;k<4;k++)r[k]/=nrm;
 if(bd<4)return vec4(vec3(clamp(.5+r[bd]*u_p2,0.,1.)),1.);
 float cx=0.,sx=0.,en=0.;for(int k=0;k<4;k++){float a=float(k)*PI*.25;float e2=r[k]*r[k];cx+=e2*cos(2.*a);sx+=e2*sin(2.*a);en+=e2;}
 float th=atan(sx,cx)*.5;return vec4(hsv2rgb(vec3(fract(th/PI),.85,clamp(sqrt(en)*u_p2*1.5,0.,1.))),1.);`,
 'spatial-domain approx. of the Simoncelli steerable pyramid: octave scale σ = 2^(l−1), oriented 3rd-derivative-of-Gaussian bands at 0/45/90/135° (a steerable basis for order 3); bands, a 2×2 mosaic, or energy-weighted orientation as hue — not the FFT-designed filters');

f('contourlet','Contourlet-style Directional Bands',[P('Level',1,4,1,1),S('Display',['Dominant direction (hue)','8 bands (3×3 mosaic)','Single band']),P('Band',0,7,0,1),P('Gain',1,40,10,.5)],
 RS_IP + `int md=int(u_p1+.5);int bd=int(u_p2+.5);vec2 src=uv;bool ctr=false;
 if(md==1){vec2 cs=floor(u_res/3.);vec2 cell=min(floor(ip/cs),vec2(2.));vec2 loc=mod(ip,cs)*3.;src=(vec2(loc.x,u_res.y-1.-loc.y)+.5)/u_res;int ci=int(cell.y)*3+int(cell.x);if(ci==4)ctr=true;else bd=ci<4?ci:ci-1;}
 float s=R(exp2(u_p0-1.));float r[8];for(int k=0;k<8;k++)r[k]=0.;float lp=0.,lw=0.;float nrm=0.;
 for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 o=vec2(float(i),float(j))*.9*s;float l=luma(O(src+o*u_px).rgb);float r2=dot(o,o)/(s*s);float gl=exp(-r2*.5);lp+=(gl-.25*exp(-r2*.125))*l;
  for(int k=0;k<8;k++){float a=float(k)*PI/8.;vec2 dir=vec2(cos(a),sin(a));float al=dot(o,dir)/s,ac=dot(o,vec2(-dir.y,dir.x))/s;float w=(1.-ac*ac)*exp(-ac*ac*.5-al*al/8.);r[k]+=w*l;if(k==0)nrm+=abs(w);}}
 for(int k=0;k<8;k++)r[k]/=nrm;
 if(ctr)return vec4(vec3(clamp(.5+lp/nrm*u_p3*2.,0.,1.)),1.);
 if(md>0)return vec4(vec3(clamp(.5+r[bd]*u_p3,0.,1.)),1.);
 float mx=0.;int kb=0;float sm=0.;for(int k=0;k<8;k++){float e=abs(r[k]);sm+=e;if(e>mx){mx=e;kb=k;}}float sel=(mx-sm/8.)*u_p3*1.5;
 return vec4(hsv2rgb(vec3(float(kb)/8.,.85,clamp(sel,0.,1.))),1.);`,
 'Do & Vetterli contourlet idea, spatial approx.: octave band-pass followed by 8 directional filters (elongated 2nd-derivative-across, Gaussian-along kernels at 22.5° steps); dominant direction as hue, the 8 bands around the band-pass in a 3×3 mosaic, or one band — no critically sampled DFB');

f('rieszpyr','Riesz Pyramid (amplitude / phase / orientation)',[P('Level',1,5,2,1),S('Output',['Local amplitude','Local phase','Local orientation (hue)','Phase as hue, amplitude as value']),P('Gain',1,40,8,.5)],
 `float l=u_p0;float s1=R(${RS_SIGL('l-1.')}),s2=R(${RS_SIGL('l')});float d=R(exp2(l-1.));float b[5];
 for(int t=0;t<5;t++){vec2 q=uv+(t==1?vec2(d,0.):t==2?vec2(-d,0.):t==3?vec2(0.,d):t==4?vec2(0.,-d):vec2(0.))*u_px;` + RS_GS('s1','q','ga',3) + RS_GS('s2','q','gb',3) + `b[t]=luma(ga-gb);}
 float r1=.5*(b[2]-b[1]),r2=.5*(b[4]-b[3]);float A=sqrt(b[0]*b[0]+r1*r1+r2*r2);float ph=atan(sqrt(r1*r1+r2*r2),b[0]);float th=atan(r2,r1);int o=int(u_p1+.5);
 if(o==0)return vec4(ramp(1,clamp(A*u_p2,0.,1.)),1.);if(o==1)return vec4(vec3(ph/PI),1.);
 if(o==2)return vec4(hsv2rgb(vec3(fract(th/PI),.85,clamp(A*u_p2*1.5,0.,1.))),1.);return vec4(hsv2rgb(vec3(ph/PI*.8,.85,clamp(A*u_p2*1.5,0.,1.))),1.);`,
 'Wadhwa et al. 2014: Laplacian-pyramid band (G_l−1 − G_l, Gaussian approx.) plus the 3-tap Riesz approximation [½, 0, −½] at the level spacing → monogenic amplitude, phase and orientation');

const RS_WD = k => `if(${k}.>u_p0)return c;vec3 sn=vec3(u_p2);
 if(u_p2<=0.){vec3 dv[64];for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec2 q=(floor((vec2(float(i),float(j))+.5)/8.*u_res)+.5)/u_res;vec3 cl=vec3(0.),sm=vec3(0.);for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){float w=(a==0?2.:1.)*(b==0?2.:1.);vec3 v=O(q+vec2(float(a),float(b))*u_px).rgb;sm+=w*v;if(a==0&&b==0)cl=v;}dv[j*8+i]=abs(cl-sm/16.);}
  vec3 lo=vec3(0.),hi=vec3(.25);for(int it=0;it<14;it++){vec3 md=(lo+hi)*.5;vec3 n=vec3(0.);for(int t=0;t<64;t++)n+=step(dv[t],md);vec3 lt=step(n,vec3(31.5));lo=mix(lo,md,lt);hi=mix(md,hi,lt);}sn=(lo+hi)*.5/.6745/.8004;}
 float s1=R(${k === 1 ? '0.' : RS_SIGL(k - 1 + '.')}),s2=R(${RS_SIGL(k + '.')});float a1=s1<.05?1.:1./(12.566*s1*s1),a2=1./(12.566*s2*s2),b12=1./(6.2832*(s1*s1+s2*s2));float vk=max(a1+a2-2.*b12,1e-4);vec3 sk=sn*sqrt(vk);
 vec3 d0=vec3(0.),vy=vec3(0.);float sp=R(exp2(${k - 1}.));
 ` + RS_GS('s1','uv','gc1') + RS_GS('s2','uv','gc2') + `d0=gc1-gc2;vy=d0*d0;for(int t=1;t<5;t++){vec2 q=uv+(t==1?vec2(sp,0.):t==2?vec2(-sp,0.):t==3?vec2(0.,sp):vec2(0.,-sp))*u_px;` + RS_GS('s1','q','ga',3) + RS_GS('s2','q','gb',3) + `vec3 dd=ga-gb;vy+=dd*dd;}vy/=5.;
 vec3 sx=sqrt(max(vy-sk*sk,vec3(1e-8)));vec3 T_=min(sk*sk/sx,vec3(1.))*u_p1;vec3 sh=sign(d0)*max(abs(d0)-T_,0.);return vec4(c.rgb-(d0-sh),1.);`;
f = add('Noise');
f('waveletdenoise','Wavelet Denoise (BayesShrink, à trous)',[P('Levels',1,5,4,1),P('Strength',0,3,1.3,.05),P('Noise σ (0 = auto)',0,.2,0,.002),S('Output',['Denoised','Removed noise ×4'])],
 [1, 2, 3, 4, 5].map(RS_WD).concat([`return int(u_p3+.5)==1?vec4(clamp(.5+(O(uv).rgb-c.rgb)*4.,0.,1.),1.):c;`]),
 'undecimated (à trous) detail levels as differences of the equivalent Gaussians of the B3 cascade (approx.), noise σ from the MAD of the finest level (64 samples, or set it), spatially adaptive BayesShrink soft threshold T = σ_n² / σ_x per level (σ_x from 5 local detail samples), subtracted level by level');
