/* ================= q33b: block-DCT deblocking from the literature (round 16): pointwise SA-DCT (Foi et al.), POCS ================= */
const Q33_YUV = `
#define Q33YUV(cc) (mat3(.299,-.168736,.5,.587,-.331264,-.418688,.114,.5,-.081312)*(cc))
#define Q33RGB(cc) vec3((cc).x+1.402*(cc).z,(cc).x-.344136*(cc).y-.714136*(cc).z,(cc).x+1.772*(cc).y)
`;
const Q33_QS = `float Qj=clamp(floor(u_p0+.5),1.,100.);float Sj=Qj<50.?5000./Qj:200.-2.*Qj;`;
f = add('Repair');
f('q33_sadct','Pointwise SA-DCT Deblocking (Foi, Katkovnik, Egiazarian)',
  [P('JPEG quality',1,100,25,1),P('ICI threshold Gamma',.5,2.5,1.05,.01),P('Hard threshold factor',.2,2,.77,.01),S('Output',['Deblocked','Adaptive shape size','Difference x4'])],
  Q33_YUV + `
#define Q33Z(dd) Q33YUV(texture(u_orig,(clamp(px+(dd),vec2(0.),u_res-1.)+.5)/u_res).rgb)
 vec2 px=floor(uv*u_res);` + Q33_QS + `
 const float QY[9]=float[9](16.,11.,10.,12.,12.,14.,14.,13.,16.);const float QC[9]=float[9](17.,18.,24.,18.,21.,26.,24.,26.,56.);
 float my=0.,mc=0.;for(int i=0;i<9;i++){my+=clamp(floor((QY[i]*Sj+50.)/100.),1.,255.);mc+=clamp(floor((QC[i]*Sj+50.)/100.),1.,255.);}
 vec3 sg=vec3(sqrt(.69*pow(my/9.,1.3)),vec2(sqrt(2.*.69*pow(mc/9.,1.3))))/255.;
 const ivec2 DIR[8]=ivec2[8](ivec2(1,0),ivec2(1,1),ivec2(0,1),ivec2(-1,1),ivec2(-1,0),ivec2(-1,-1),ivec2(0,-1),ivec2(1,-1));
 float z0=Q33Z(vec2(0.)).x;float hd[8];
 for(int k=0;k<8;k++){vec2 dv=vec2(DIR[k]);float acc=z0,lo=-1e9,hi=1e9,hs=1.;
  for(int h=1;h<=5;h++){acc+=Q33Z(dv*float(h)).x;if(h==4)continue;float est=acc/float(h+1);float sdv=sg.x/sqrt(float(h+1));
   lo=max(lo,est-u_p1*sdv);hi=min(hi,est+u_p1*sdv);if(lo>hi)break;hs=float(h);}
  hd[k]=hs;}
 vec3 A_[121];vec3 B_[121];int cl[11];float N=0.;vec3 mu=vec3(0.);int pc=0;
 for(int j=0;j<11;j++){int n=0;for(int i=0;i<11;i++){vec2 d=vec2(float(j-5),float(i-5));bool inS=i==5&&j==5;
   if(!inS){float a=atan(d.y,d.x);if(a<0.)a+=2.*PI;int k=int(floor(a/(PI*.25)+1e-4));k=k>7?0:k;int k2=k==7?0:k+1;
    vec2 P1=vec2(DIR[k])*hd[k],P2=vec2(DIR[k2])*hd[k2];float det=P1.x*P2.y-P1.y*P2.x;float al=(d.x*P2.y-d.y*P2.x)/det,be=(P1.x*d.y-P1.y*d.x)/det;
    inS=al>=-1e-3&&be>=-1e-3&&al+be<=1.001;}
   if(inS){if(j==5&&i<5)pc++;vec3 v=Q33Z(d);A_[n*11+j]=v;mu+=v;N+=1.;n++;}}
  cl[j]=n;}
 mu/=N;
 for(int j=0;j<11;j++){int Lc=cl[j];float Lf=float(Lc);
  for(int k=0;k<11;k++){if(k>=Lc)break;vec3 s_=vec3(0.);for(int n=0;n<11;n++){if(n>=Lc)break;s_+=(A_[n*11+j]-mu)*cos(PI*(2.*float(n)+1.)*float(k)/(2.*Lf));}
   B_[k*11+j]=s_*(k==0?sqrt(1./Lf):sqrt(2./Lf));}}
 int rl[11];int mcol[11];vec3 rw[11];
 for(int i=0;i<11;i++){int mm=0;mcol[i]=0;
  for(int j=0;j<11;j++){if(cl[j]>i){if(j==5)mcol[i]=mm;rw[mm]=B_[i*11+j];mm++;}}
  rl[i]=mm;float Rf=float(mm);
  for(int u=0;u<11;u++){if(u>=mm)break;vec3 s_=vec3(0.);for(int n=0;n<11;n++){if(n>=mm)break;s_+=rw[n]*cos(PI*(2.*float(n)+1.)*float(u)/(2.*Rf));}
   A_[i*11+u]=s_*(u==0?sqrt(1./Rf):sqrt(2./Rf));}}
 vec3 thr=u_p2*sqrt(2.*log(N+1.))*sg;int L5=cl[5];float L5f=float(L5);vec3 est=vec3(0.);
 for(int k=0;k<11;k++){if(k>=L5)break;int RL=rl[k];float RLf=float(RL);vec3 v=vec3(0.);float mm=float(mcol[k]);
  for(int u=0;u<11;u++){if(u>=RL)break;vec3 cf=A_[k*11+u];if(k>0||u>0)cf*=step(thr,abs(cf));v+=cf*(u==0?sqrt(1./RLf):sqrt(2./RLf))*cos(PI*(2.*mm+1.)*float(u)/(2.*RLf));}
  est+=v*(k==0?sqrt(1./L5f):sqrt(2./L5f))*cos(PI*(2.*float(pc)+1.)*float(k)/(2.*L5f));}
 vec3 o=Q33RGB(est+mu);int om=int(u_p3+.5);
 if(om==1)return vec4(vec3(N/121.),1.);
 if(om==2)return vec4(clamp(.5+(o-c.rgb)*4.,0.,1.),1.);
 return vec4(clamp(o,0.,1.),1.);`,
  'Foi, Katkovnik & Egiazarian, "Pointwise shape-adaptive DCT for high-quality deblocking of compressed color images" (EUSIPCO 2006 / TIP 2007): sigma^2 = 0.69 * (mean of the 9 lowest-frequency IJG quantization-table entries at the given quality)^1.3 (chroma variance x2 for 4:2:0); anisotropic LPA-ICI on Y (8 directions, line kernels, scales 1,2,3,5) gives a star-shaped adaptive support (polygonal hull) that is shared by Y, Cb and Cr; SA-DCT (column then row varying-length DCT, DC separation) with hard threshold K*sigma*sqrt(2 ln(N+1)). Simplified: own-shape pointwise estimate only (no overlapping-shape aggregation, no Wiener stage), max scale 5; run on native pixels (no downscaling)');

const Q33_QT = `const float QL[64]=float[64](16.,11.,10.,16.,24.,40.,51.,61.,12.,12.,14.,19.,26.,58.,60.,55.,14.,13.,16.,24.,40.,57.,69.,56.,14.,17.,22.,29.,51.,87.,80.,62.,18.,22.,37.,56.,68.,109.,103.,77.,24.,35.,55.,64.,81.,104.,113.,92.,49.,64.,78.,87.,103.,121.,120.,101.,72.,92.,95.,98.,112.,100.,103.,99.);
 const float QCh[64]=float[64](17.,18.,24.,47.,99.,99.,99.,99.,18.,21.,26.,66.,99.,99.,99.,99.,24.,26.,56.,99.,99.,99.,99.,99.,47.,66.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.,99.);`;
const Q33_LP = k => `if(${k}.>u_p1+.01)return c;vec2 px=floor(uv*u_res);vec2 lc=mod(vec2(px.x,u_res.y-1.-px.y),8.);float bw=(lc.x<.5||lc.x>6.5||lc.y<.5||lc.y>6.5)?1.:.5;
 vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?2.:1.)*(j==0?2.:1.);s+=w*T(uv+vec2(float(i),float(j))*u_px).rgb;}return vec4(mix(c.rgb,s/16.,u_p2*bw),1.);`;
const Q33_PRJ = k => Q33_YUV + `if(${k}.>u_p1+.01)return c;` + Q33_QS + Q33_QT + `
 vec2 px=floor(uv*u_res);float ty=u_res.y-1.-px.y;vec2 b0=vec2(floor(px.x/8.)*8.,floor(ty/8.)*8.);vec2 lc=vec2(px.x,ty)-b0;
 vec3 FR[64];vec3 GR[64];vec3 lv=vec3(128.,0.,0.);
 for(int r=0;r<8;r++){vec3 a[8];vec3 g[8];
  for(int i=0;i<8;i++){vec2 qq=clamp(vec2(b0.x+float(i),b0.y+float(r)),vec2(0.),u_res-1.);vec2 tu=(vec2(qq.x,u_res.y-1.-qq.y)+.5)/u_res;a[i]=Q33YUV(T(tu).rgb)*255.-lv;g[i]=Q33YUV(O(tu).rgb)*255.-lv;}
  for(int v=0;v<8;v++){vec3 sa=vec3(0.),sb=vec3(0.);for(int i=0;i<8;i++){float cw=cos(PI*(2.*float(i)+1.)*float(v)/16.);sa+=a[i]*cw;sb+=g[i]*cw;}float wv=v==0?.35355339:.5;FR[r*8+v]=sa*wv;GR[r*8+v]=sb*wv;}}
 vec3 ov=vec3(0.);
 for(int u=0;u<8;u++){float wu=u==0?.35355339:.5;for(int v=0;v<8;v++){vec3 cf=vec3(0.),co=vec3(0.);
  for(int r=0;r<8;r++){float cw=cos(PI*(2.*float(r)+1.)*float(u)/16.);cf+=FR[r*8+v]*cw;co+=GR[r*8+v]*cw;}cf*=wu;co*=wu;
  float ql=clamp(floor((QL[u*8+v]*Sj+50.)/100.),1.,255.),qc=clamp(floor((QCh[u*8+v]*Sj+50.)/100.),1.,255.);vec3 qv=vec3(ql,qc,qc);
  vec3 cq=floor(co/qv+.5)*qv;cf=clamp(cf,cq-.5*qv,cq+.5*qv);
  ov+=cf*wu*(v==0?.35355339:.5)*cos(PI*(2.*lc.y+1.)*float(u)/16.)*cos(PI*(2.*lc.x+1.)*float(v)/16.);}}
 return vec4(clamp(Q33RGB((ov+lv)/255.),0.,1.),1.);`;
f('q33_pocs','POCS Deblocking (projection onto convex sets)',
  [P('JPEG quality',1,100,25,1),P('Iterations',1,4,4,1),P('Smoothing',0,1,.9,.01),S('Output',['Deblocked','Difference x4'])],
  [Q33_LP(1), Q33_PRJ(1), Q33_LP(2), Q33_PRJ(2), Q33_LP(3), Q33_PRJ(3), Q33_LP(4), Q33_PRJ(4),
   `int om=int(u_p3+.5);return om==1?vec4(clamp(.5+(c.rgb-O(uv).rgb)*4.,0.,1.),1.):c;`],
  'POCS deblocking (Zakhor 1992; Yang, Galatsanos & Katsaggelos 1993): alternate projection onto a smoothness set (3x3 low-pass, full strength on 8x8 block-boundary pixels, half inside) and onto the quantization constraint set (each 8x8 DCT coefficient of the estimate is clipped to the quantization interval of the observed coefficient; IJG Annex-K tables scaled to the given quality). Y and Cb/Cr processed with luma / chroma tables on a top-left 8x8 grid (assumes 4:4:4 blocks); run on native pixels (no downscaling)');
