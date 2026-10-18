/* ================= q35: focus-measure operators of Pertuz et al. 2013 (Pattern Recognition 46:1415) as local focus maps ================= */
f = add('Analysis');
const Q35_TCH = (() => { const N = 7, P = []; for (let p = 0; p < 3; p++) { let v = [...Array(N)].map((_, x) => Math.pow(x - 3, p)); for (const u of P) { const d = u.reduce((a, b, i) => a + b * v[i], 0); v = v.map((a, i) => a - d * u[i]); } const n = Math.sqrt(v.reduce((a, b) => a + b * b, 0)); P.push(v.map(a => a / n)); } return P.flat().map(x => x.toFixed(7)).join(','); })();
const Q35_FMOUT = (ks) => `float kk[${ks.length}]=float[${ks.length}](${ks.map(k => k.toFixed(4)).join(',')});float r=1.-exp(-max(f,0.)*kk[m]*u_p2);
  int om=int(u_p3+.5);return vec4(om==2?vec3(r):om==1?mix(O(uv).rgb*.45,ramp(1,r),r):ramp(1,r),1.);`;
const Q35_FMP = [P('Window',3,40,15,1,'px'),P('Gain',.05,20,1,.01),S('Output',['Heat map','Over image','Grey value'])];
f('q35_fm_grad','Focus Measures: Gradient / Laplacian / Misc (Pertuz 2013)',[S('Measure',['GDER Gaussian derivative','GRAT thresholded abs gradient','GRAS squared gradient','SFRQ spatial frequency','TENV Tenengrad variance','CURV image curvature','CONT image contrast (Nanda)','LAPE energy of Laplacian','LAPD diagonal Laplacian','HELM Helmli-Scherer mean'])].concat(Q35_FMP),
 [`float sg=max(R(u_p1)/5.,.5);float hw=R(u_p1)*.5;float stp=max(1.,hw/16.);float a=0.,b=0.,sa=0.,sb=0.,bx=0.,nb=0.;
  for(int i=-16;i<=16;i++){float x=float(i)*stp;if(abs(x)>hw+.01)continue;float l=luma(O(uv+vec2(x,0.)*u_px).rgb);float g=exp(-x*x/(2.*sg*sg));float gd=-x*g/(sg*sg);a+=gd*l;sa+=abs(gd);b+=g*l;sb+=g;bx+=l;nb+=1.;}
  return vec4(.5+.5*a/max(sa,1e-6),b/sb,bx/nb,1.);`,
  `float sg=max(R(u_p1)/5.,.5);float hw=R(u_p1)*.5;float stp=max(1.,hw/16.);float rx=0.,ry=0.,sa=0.,sb=0.,bx=0.,nb=0.;
  for(int i=-16;i<=16;i++){float y=float(i)*stp;if(abs(y)>hw+.01)continue;vec4 t=T(uv+vec2(0.,y)*u_px);float g=exp(-y*y/(2.*sg*sg));float gd=-y*g/(sg*sg);rx+=g*(2.*t.r-1.);sb+=g;ry+=gd*t.g;sa+=abs(gd);bx+=t.b;nb+=1.;}
  rx/=sb;ry/=max(sa,1e-6);return vec4(rx*rx+ry*ry,bx/nb,0.,1.);`,
  `
#define Q35L(p) luma(O(p).rgb)
  int m=int(u_p0+.5);float st=max(R(u_p1)/7.,1.);vec2 e=u_px;float s1=0.,s2=0.,sx=0.,sy=0.,n=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*st*e;float v=0.;float c0=Q35L(q);
   if(m==0)v=T(q).r;
   else if(m<=3){float ix=Q35L(q+vec2(e.x,0.))-c0,iy=Q35L(q+vec2(0.,e.y))-c0;v=m==1?max(abs(ix),abs(iy)):ix*ix;sx+=ix*ix;sy+=iy*iy;}
   else if(m==9){float mu=T(q).g;v=mu>=c0?mu/max(c0,.004):c0/max(mu,.004);}
   else{float a[9];for(int k=0;k<9;k++)a[k]=Q35L(q+vec2(float(k%3-1),float(k/3-1))*e);
    if(m==4){float gx=(a[2]+2.*a[5]+a[8])-(a[0]+2.*a[3]+a[6]);float gy=(a[6]+2.*a[7]+a[8])-(a[0]+2.*a[1]+a[2]);v=sqrt(gx*gx+gy*gy);}
    else if(m==5){float cl=a[0]+a[3]+a[6],cr=a[2]+a[5]+a[8],rt=a[0]+a[1]+a[2],rb=a[6]+a[7]+a[8];float m2=(cl+cr)/5.,m2t=(rt+rb)/5.;
     v=abs((cr-cl)/6.)+abs((rb-rt)/6.)+abs(1.5*m2-m2t)+abs(1.5*m2t-m2);}
    else if(m==6){for(int k=0;k<9;k++)v+=abs(a[4]-a[k]);}
    else if(m==7){float lp=(a[0]+a[2]+a[6]+a[8])/6.+(a[1]+a[3]+a[5]+a[7])*2./3.-a[4]*10./3.;v=lp*lp;}
    else v=abs(2.*a[4]-a[3]-a[5])+abs(2.*a[4]-a[1]-a[7])+(abs(2.*a[4]-a[2]-a[6])+abs(2.*a[4]-a[0]-a[8]))*.70711;}
   s1+=v;s2+=v*v;n+=1.;}
  float f=s1/n;if(m==3)f=sqrt((sx+sy)/n);if(m==4)f=s2/n-f*f;if(m==9)f-=1.;
  ` + Q35_FMOUT([119, 31, 346, 19, 9, 2.5, 4.8, 140, 10, 2.4])],
 'Pertuz, Puig & Garcia 2013 operators (code names of fmeasure.m) evaluated in a WxW neighbourhood (7x7 samples at stride W/7, mean instead of sum): GDER = (I*Gx)^2+(I*Gy)^2 with sigma = W/5, kernels normalised by sum|G\'|; GRAT = max(|Ix|,|Iy|) (T = 0); GRAS = Ix^2; SFRQ = sqrt(sum Ix^2 + sum Iy^2); TENV = variance of the Sobel magnitude; CURV = |c0|+|c1|+|c2|+|c3| of the quadratic-surface fit (M1/6, M2/5 masks, c2 = 3/2 M2*I - M2t*I, c3 = 3/2 M2t*I - M2*I); CONT = sum over 3x3 of |I(x,y)-I(i,j)|; LAPE = squared fspecial Laplacian (alpha .2); LAPD = |Lx|+|Ly|+|Ld1|+|Ld2| (diagonals /sqrt2); HELM = mean ratio max(m/I, I/m) - 1 with m the WxW box mean. Display 1-exp(-gain x value)');
f('q35_fm_stat','Focus Measures: Statistics / DCT / Moments (Pertuz 2013)',[S('Measure',['ACMO absolute central moment','GLVN normalised grey-level variance','HISE histogram entropy','HISR histogram range','DCTE DCT energy ratio','DCTR DCT reduced energy ratio','CHEB Chebyshev moments','EIGV eigenvalues'])].concat(Q35_FMP),
 [`float sI=0.,sI2=0.,F01=0.,F10=0.,F11=0.,F02=0.,F20=0.;
  for(int y=0;y<8;y++)for(int x=0;x<8;x++){float l=luma(O(uv+vec2(float(x)-4.,float(y)-4.)*R(1.)*u_px).rgb);float ax=3.14159265*(2.*float(x)+1.)/16.,ay=3.14159265*(2.*float(y)+1.)/16.;
   float cx1=cos(ax),cy1=cos(ay),cx2=cos(2.*ax),cy2=cos(2.*ay);sI+=l;sI2+=l*l;F01+=l*cx1;F10+=l*cy1;F11+=l*cx1*cy1;F02+=l*cx2;F20+=l*cy2;}
  float F00=sI/8.;float d2=F00*F00+1e-4;float k1=.5/sqrt(8.);F01*=k1;F10*=k1;F02*=k1;F20*=k1;F11*=.25;
  float de=max(sI2-F00*F00,0.)/d2,dr=(F01*F01+F10*F10+F11*F11+F02*F02+F20*F20)/d2;return vec4(de/(1.+de),dr/(1.+dr),0.,1.);`,
  `int m=int(u_p0+.5);float st=max(R(u_p1)/7.,1.);float w[49];float s=0.,s2=0.,mn=1e9,mx=-1e9,ds=0.;
  for(int k=0;k<49;k++){vec2 q=uv+vec2(float(k%7-3),float(k/7-3))*st*u_px;float l=luma(O(q).rgb);w[k]=l;s+=l;s2+=l*l;mn=min(mn,l);mx=max(mx,l);
   if(m==4||m==5){float t=min(m==4?T(q).r:T(q).g,.999);ds+=t/(1.-t);}}
  float mu=s/49.;float f=0.;
  if(m==0){for(int k=0;k<49;k++)f+=abs(w[k]-mu);f/=49.;}
  else if(m==1)f=max(s2/49.-mu*mu,0.)/max(mu,.004);
  else if(m==2){for(int k=0;k<49;k++){float bk=floor(w[k]*255.+.5);float cn=0.;for(int j=0;j<49;j++)cn+=abs(floor(w[j]*255.+.5)-bk)<.5?1.:0.;f-=log2(cn/49.)/49.;}}
  else if(m==3)f=mx-mn;
  else if(m<=5)f=ds/49.;
  else{float nr=sqrt(max(s2,1e-8));for(int k=0;k<49;k++)w[k]/=nr;
   if(m==6){float tc[21]=float[21](${Q35_TCH});float lo=0.;for(int p=0;p<3;p++)for(int r=0;r<3;r++){if(p+r>2)continue;float tm=0.;for(int k=0;k<49;k++)tm+=tc[p*7+k%7]*tc[r*7+k/7]*w[k];lo+=tm*tm;}f=(1.-lo)/max(lo,1e-6);}
   else{float wm=0.;for(int k=0;k<49;k++)wm+=w[k];wm/=49.;for(int k=0;k<49;k++)w[k]-=wm;float A[49];
    for(int a=0;a<7;a++)for(int b=0;b<7;b++){float acc=0.;for(int c3=0;c3<7;c3++)acc+=w[a*7+c3]*w[b*7+c3];A[a*7+b]=acc/48.;}
    for(int sw=0;sw<6;sw++)for(int pp=0;pp<6;pp++)for(int qq=1;qq<7;qq++){if(qq<=pp)continue;float apq=A[pp*7+qq];if(abs(apq)<1e-14)continue;
     float th=(A[qq*7+qq]-A[pp*7+pp])/(2.*apq);float t=(th>=0.?1.:-1.)/(abs(th)+sqrt(th*th+1.));float cs=1./sqrt(t*t+1.),sn=t*cs;
     for(int k=0;k<7;k++){float akp=A[k*7+pp],akq=A[k*7+qq];A[k*7+pp]=cs*akp-sn*akq;A[k*7+qq]=sn*akp+cs*akq;}
     for(int k=0;k<7;k++){float apk=A[pp*7+k],aqk=A[qq*7+k];A[pp*7+k]=cs*apk-sn*aqk;A[qq*7+k]=sn*apk+cs*aqk;}}
    float tr=0.,e1=1e9,e2=1e9;for(int k=0;k<7;k++){float ev=A[k*8];tr+=ev;if(ev<e1){e2=e1;e1=ev;}else if(ev<e2)e2=ev;}f=tr-e1-e2;}}
  ` + Q35_FMOUT([12, 24, .25, 3.5, 7.7, 9.7, 23, 150])],
 'Pertuz 2013 statistics / DCT / moment operators over a WxW neighbourhood (7x7 samples at stride W/7): ACMO = sum_k |k-mu| P_k (= mean absolute deviation); GLVN = variance / mean; HISE = -sum P_k log2 P_k of the 256-level histogram of the window samples; HISR = max - min; DCTE = AC/DC energy (sum F^2 - F00^2)/F00^2 and DCTR = (F01^2+F10^2+F20^2+F11^2+F02^2)/F00^2 of the 8x8 orthonormal DCT of the sliding block at every pixel, averaged over the window; CHEB = ||high||/||low|| moment energy of the window normalised by sqrt(sum I^2) with orthonormal Tchebichef polynomials on 7 points, low = total order <= p = 2 (approx. of the order split); EIGV = sum of the k = 5 largest eigenvalues of S = J J^T/(MN-1), J = normalised mean-removed 7x7 window (cyclic Jacobi). Display 1-exp(-gain x value)');
f('q35_fm_wav','Focus Measures: Wavelet WAVS / WAVV / WAVR (Pertuz 2013)',[S('Measure',['WAVS sum of wavelet coefficients','WAVV variance of wavelet coefficients','WAVR ratio of wavelet coefficients'])].concat(Q35_FMP),
 [`float h[12]=float[12](.11154074,.49462389,.75113391,.31525035,-.22626469,-.12976687,.09750161,.02752287,-.03158204,.00055384,.00477726,-.00107730);
  float lo=0.,hi=0.;for(int k=0;k<12;k++){float l=luma(O(uv+vec2(float(k-6)*u_k,0.)*u_px).rgb);lo+=h[k]*l;hi+=(k%2==0?1.:-1.)*h[11-k]*l;}return vec4(lo*.5,.5+.25*hi,0.,1.);`,
  `float h[12]=float[12](.11154074,.49462389,.75113391,.31525035,-.22626469,-.12976687,.09750161,.02752287,-.03158204,.00055384,.00477726,-.00107730);
  float ll=0.,lh=0.,hl=0.,hh=0.;for(int k=0;k<12;k++){vec4 t=T(uv+vec2(0.,float(k-6)*u_k)*u_px);float lo=2.*t.r,hi=4.*(t.g-.5);float g=(k%2==0?1.:-1.)*h[11-k];ll+=h[k]*lo;lh+=g*lo;hl+=h[k]*hi;hh+=g*hi;}
  return vec4(.5+.25*lh,.5+.25*hl,.5+.25*hh,ll*.5);`]
  .concat([[2, 'vec2(1.,0.)'], [2, 'vec2(0.,1.)'], [4, 'vec2(1.,0.)'], [4, 'vec2(0.,1.)']].map(([d, dir]) => `float h[12]=float[12](.11154074,.49462389,.75113391,.31525035,-.22626469,-.12976687,.09750161,.02752287,-.03158204,.00055384,.00477726,-.00107730);
  float a=0.;for(int k=0;k<12;k++)a+=h[k]*T(uv+${dir}*float(k-6)*${d}.*u_k*u_px).a;return vec4(T(uv).rgb,a*.70710678);`))
  .concat([`int m=int(u_p0+.5);float st=max(R(u_p1)/7.,1.);vec3 s1=vec3(0.),s2=vec3(0.);float sa=0.,sl=0.,n=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec4 t=T(uv+vec2(float(i),float(j))*st*u_px);vec3 d=(t.rgb-.5)*4.;s1+=m==0?abs(d):d;s2+=d*d;float l3=8.*t.a;sl+=l3*l3;n+=1.;}
  float f=m==0?(s1.x+s1.y+s1.z)/n:m==1?dot(s2/n-(s1/n)*(s1/n),vec3(1.)):(s2.x+s2.y+s2.z)/max(sl,1e-6);
  ` + Q35_FMOUT([34, 544, 2190])]),
 'Pertuz 2013 wavelet operators on the over-complete (undecimated) Daubechies-6 transform as in the paper: WAVS = sum |W_LH1|+|W_HL1|+|W_HH1|, WAVV = sum of the three level-1 sub-band variances, WAVR = sum(W_LH1^2+W_HL1^2+W_HH1^2) / sum W_LL3^2 (level-3 approximation via a trous filters at dilations 1, 2, 4), all over a WxW neighbourhood (7x7 samples at stride W/7). Display 1-exp(-gain x value)');
