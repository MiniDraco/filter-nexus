/* ================= q34e: demosaicing from the literature (Bayer RGGB round trip, same CFA helpers as 'demosaic') ================= */
f = add('Sensor');
// Kimmel 1999 edge weight for neighbour offset o: e = (1 + D_d(p)^2 + D_d(p+o)^2)^-1/2, D_d = directional derivative of the raw mosaic
const Q34_KIM = `
#define Q34_DD(q,o) ((o).y==0.?.5*(RAW((q)+RSX)-RAW((q)-RSX)):(o).x==0.?.5*(RAW((q)+RSY)-RAW((q)-RSY)):(o).x==(o).y?.35355*(RAW((q)+vec2(1.,1.))-RAW((q)-vec2(1.,1.))):.35355*(RAW((q)+vec2(-1.,1.))-RAW((q)+vec2(1.,-1.))))
#define Q34_KE(o) (1./sqrt(1.+pow(Q34_DD(p,o),2.)+pow(Q34_DD(p+(o),o),2.)))
#define Q34_K8(k) vec2(k==0?1.:k==1?-1.:k==2||k==3?0.:k==4||k==6?1.:-1.,k<2?0.:k==2?1.:k==3?-1.:k==4||k==5?1.:-1.)
`;
// directional residual interpolation (RI / MLRI) along axis ax: returns G - C estimate at p
const Q34_RIDIR = (ax, out) => `{float v[25];for(int k=0;k<25;k++)v[k]=RAW(p+${ax}*float(k-12));
  float pg[25],pc[25];for(int k=1;k<24;k++){bool gk=((k%2)==0)==isG;float it=.5*(v[k-1]+v[k+1]);pg[k]=gk?v[k]:it;pc[k]=gk?it:v[k];}
  float est[2];
  for(int tg=0;tg<2;tg++){float aa[25],bb[25];
   for(int y=2;y<=22;y++){if(y<11-hw||y>13+hw)continue;float sm=0.,si=0.,sp=0.,sip=0.,sii=0.,ll=0.,lg=0.;
    for(int k=-5;k<=5;k++){if(k<-hw||k>hw)continue;int z=y+k;bool gk=((z%2)==0)==isG;bool msk=tg==0?gk:!gk;if(!msk)continue;float I=tg==0?pc[z]:pg[z],P_=v[z];
     sm+=1.;si+=I;sp+=P_;sip+=I*P_;sii+=I*I;if(ml&&z>=3&&z<=21){float lI=2.*I-(tg==0?pc[z-2]+pc[z+2]:pg[z-2]+pg[z+2]),lP=2.*P_-v[z-2]-v[z+2];ll+=lI*lP;lg+=lI*lI;}}
    float mi=si/max(sm,1.),mp=sp/max(sm,1.);float a=ml?ll/(lg+1e-4):(sip/max(sm,1.)-mi*mp)/(sii/max(sm,1.)-mi*mi+1e-4);aa[y]=a;bb[y]=mp-a*mi;}
   float tv[3];for(int u=-1;u<=1;u++){float ma=0.,mb=0.,n=0.;for(int k=-5;k<=5;k++){if(k<-hw||k>hw)continue;int y=12+u+k;ma+=aa[y];mb+=bb[y];n+=1.;}int z=12+u;tv[u+1]=(ma*(tg==0?pc[z]:pg[z])+mb)/n;}
   bool cs=tg==0?isG:!isG;est[tg]=cs?v[12]:tv[1]+.5*((v[11]-tv[0])+(v[13]-tv[2]));}
  ${out}=est[0]-est[1];}`;
// guided-filter R/B with guide G (RI: masked covariance / variance; MLRI: Laplacian energy), 5x5 windows, bilinear residual
const Q34_RIRB = `float gv[225],rv[225];for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){int id=(j+7)*15+i+7;vec2 o=vec2(float(i),float(j));gv[id]=TP(p+o).g;rv[id]=RAW(p+o);}
 vec3 res=vec3(0.,TP(p).g,0.);
 for(int ch=0;ch<2;ch++){float aa[49],bb[49];
  for(int yj=-3;yj<=3;yj++)for(int yi=-3;yi<=3;yi++){float sm=0.,si=0.,sp=0.,sip=0.,sii=0.,ll=0.,lg=0.;
   for(int kj=-2;kj<=2;kj++)for(int ki=-2;ki<=2;ki++){int zi=yi+ki,zj=yj+kj;vec3 wz=RSW(p+vec2(float(zi),float(zj)));if((ch==0?wz.r:wz.b)<.5)continue;int id=(zj+7)*15+zi+7;float I=gv[id],P_=rv[id];
    sm+=1.;si+=I;sp+=P_;sip+=I*P_;sii+=I*I;if(ml){float lI=4.*I-gv[id-2]-gv[id+2]-gv[id-30]-gv[id+30],lP=4.*P_-rv[id-2]-rv[id+2]-rv[id-30]-rv[id+30];ll+=lI*lP;lg+=lI*lI;}}
   float mi=si/max(sm,1.),mp=sp/max(sm,1.);float a=ml?ll/(lg+1e-4):(sip/max(sm,1.)-mi*mp)/(sii/max(sm,1.)-mi*mi+1e-4);int q=(yj+3)*7+yi+3;aa[q]=a;bb[q]=mp-a*mi;}
  float tot=0.,cen=0.;
  for(int uj=-1;uj<=1;uj++)for(int ui=-1;ui<=1;ui++){float ma=0.,mb=0.;for(int kj=-2;kj<=2;kj++)for(int ki=-2;ki<=2;ki++){int q=(uj+kj+3)*7+ui+ki+3;ma+=aa[q];mb+=bb[q];}
   int id=(uj+7)*15+ui+7;float tv=(ma*gv[id]+mb)/25.;if(ui==0&&uj==0)cen=tv;vec3 wz=RSW(p+vec2(float(ui),float(uj)));if((ch==0?wz.r:wz.b)>.5)tot+=(ui==0?1.:.5)*(uj==0?1.:.5)*(rv[id]-tv);}
  float o=cen+tot;if(ch==0)res.r=o;else res.b=o;}
 res=mix(res,vec3(c0),w);return vec4(clamp(res,0.,1.),1.);`;
f('q34_demosaic2','Demosaic III (Kimmel / ACPI / GBTF / RI / MLRI / Cok / Laroche-Prescott / Freeman)',[S('Algorithm',['Kimmel 1999','ACPI (Hamilton-Adams 1997)','GBTF (Pekkucuksen 2010)','Residual interpolation RI (Kiku 2013)','MLRI (Kiku 2014)','Smooth hue transition (Cok 1987)','Laroche-Prescott 1994','Freeman median 1988']),S('Output',['Demosaiced','Error xN','CFA mosaic','Signed error xN']),P('Error gain',1,64,8,1)],
 [ // pass 1: green (or directional colour differences for GBTF / RI / MLRI)
  RS_HEAD + Q34_KIM + `float N=RAW(p+RSY),S_=RAW(p-RSY),E=RAW(p+RSX),W_=RAW(p-RSX);
 if(m==2){float qh=.5*(E+W_)+.25*(2.*c0-RAW(p+2.*RSX)-RAW(p-2.*RSX)),qv=.5*(N+S_)+.25*(2.*c0-RAW(p+2.*RSY)-RAW(p-2.*RSY));float s=isG?-1.:1.;return vec4(c0,.5+.5*s*(qh-c0),.5+.5*s*(qv-c0),1.);}
 if(m==3||m==4){bool ml=m==4;int hw=ml?4:5;float dh,dv;` + Q34_RIDIR('RSX', 'dh') + Q34_RIDIR('RSY', 'dv') + `return vec4(c0,.5+.5*clamp(dh,-1.,1.),.5+.5*clamp(dv,-1.,1.),1.);}
 if(isG)return vec4(c0,c0,0.,1.);
 if(m==0){float sw=0.,sg=0.;for(int k=0;k<4;k++){vec2 o=Q34_K8(k);float e=Q34_KE(o);sw+=e;sg+=e*RAW(p+o);}return vec4(c0,sg/sw,0.,1.);}
 if(m==1){float A3=RAW(p-2.*RSX),A7=RAW(p+2.*RSX),A1=RAW(p+2.*RSY),A9=RAW(p-2.*RSY);float dH=abs(W_-E)+abs(2.*c0-A3-A7),dV=abs(N-S_)+abs(2.*c0-A1-A9);
  float gH=.5*(W_+E)+.25*(2.*c0-A3-A7),gV=.5*(N+S_)+.25*(2.*c0-A1-A9),gA=.25*(N+S_+E+W_)+.125*(4.*c0-A1-A3-A7-A9);return vec4(c0,clamp(dH<dV?gH:dV<dH?gV:gA,0.,1.),0.,1.);}
 if(m==6){float hd=abs(.5*(RAW(p-2.*RSX)+RAW(p+2.*RSX))-c0),vd=abs(.5*(RAW(p-2.*RSY)+RAW(p+2.*RSY))-c0);return vec4(c0,hd<vd?.5*(E+W_):vd<hd?.5*(N+S_):.25*(N+S_+E+W_),0.,1.);}
 return vec4(c0,.25*(N+S_+E+W_),0.,1.);`,
  // pass 2: GBTF-style weighted combination of directional colour differences
  RS_HEAD + `if(m<2||m>4)return c;
 #define Q34_DH(q) (TP(q).g*2.-1.)
 #define Q34_DV(q) (TP(q).b*2.-1.)
 if(isG)return vec4(c0,c0,0.,1.);
 float sN=0.,sS=0.,sE=0.,sW=0.;
 for(int j=-4;j<=4;j++)for(int i=-2;i<=2;i++){vec2 qv=p+vec2(float(i),float(j)),qh=p+vec2(float(j),float(i));float dv=abs(Q34_DV(qv+RSY)-Q34_DV(qv-RSY)),dh=abs(Q34_DH(qh+RSX)-Q34_DH(qh-RSX));
  if(j>=0){sN+=dv;sE+=dh;}if(j<=0){sS+=dv;sW+=dh;}}
 float wN=1./(sN*sN+1e-10),wS=1./(sS*sS+1e-10),wE=1./(sE*sE+1e-10),wW=1./(sW*sW+1e-10);
 float fk[5]=float[5](.26,.24,.21,.17,.12);float dN=0.,dS=0.,dE=0.,dW=0.;
 for(int k=0;k<5;k++){float t=float(k);dN+=fk[k]*Q34_DV(p+t*RSY);dS+=fk[k]*Q34_DV(p-t*RSY);dE+=fk[k]*Q34_DH(p+t*RSX);dW+=fk[k]*Q34_DH(p-t*RSX);}
 float d=(wN*dN+wS*dS+wE*dE+wW*dW)/(wN+wS+wE+wW);return vec4(c0,clamp(c0+d,0.,1.),0.,1.);`,
  // pass 3: red / blue
  RS_HEAD + Q34_KIM + `float G0=TP(p).g;bool hR=RSW(p+RSX).r>.5;
 if(m==3||m==4){bool ml=m==4;` + Q34_RIRB + `}
 if(m==6){` + RS_CDB + `}
 if(m==2){if(isG)return vec4(0.,G0,0.,1.);float s=0.;
  for(int k=0;k<12;k++){vec2 o=k<4?vec2(k%2==0?-1.:1.,k<2?-3.:3.):vec2(float(((k-4)%4))*2.-3.,(k-4)<4?-1.:1.);float wt=k<4?-1.:(abs(o.x)>2.?-1.:10.);s+=wt*(TP(p+o).g-RAW(p+o));}
  float o=G0-s/32.;return vec4(clamp(w.r>.5?vec3(c0,G0,o):vec3(o,G0,c0),0.,1.),1.);}
 if(isG){vec3 r;
  if(m==0){float a=0.,ea=0.,b=0.,eb=0.;for(int k=0;k<4;k++){vec2 o=Q34_K8(k);float e=Q34_KE(o);float rt=(RAW(p+o)+.02)/(TP(p+o).g+.02);if(k<2){a+=e*rt;ea+=e;}else{b+=e*rt;eb+=e;}}
   float h=(G0+.02)*a/ea-.02,v=(G0+.02)*b/eb-.02;r=hR?vec3(h,G0,v):vec3(v,G0,h);}
  else if(m==5){float h=.5*((RAW(p+RSX)+.01)/(TP(p+RSX).g+.01)+(RAW(p-RSX)+.01)/(TP(p-RSX).g+.01)),v=.5*((RAW(p+RSY)+.01)/(TP(p+RSY).g+.01)+(RAW(p-RSY)+.01)/(TP(p-RSY).g+.01));
   h=(G0+.01)*h-.01;v=(G0+.01)*v-.01;r=hR?vec3(h,G0,v):vec3(v,G0,h);}
  else if(m==1){float h=.5*(RAW(p+RSX)+RAW(p-RSX))+.5*(2.*G0-TP(p+RSX).g-TP(p-RSX).g),v=.5*(RAW(p+RSY)+RAW(p-RSY))+.5*(2.*G0-TP(p+RSY).g-TP(p-RSY).g);r=hR?vec3(h,G0,v):vec3(v,G0,h);}
  else{float h=.5*(RAW(p+RSX)+RAW(p-RSX)),v=.5*(RAW(p+RSY)+RAW(p-RSY));r=hR?vec3(h,G0,v):vec3(v,G0,h);}
  return vec4(clamp(r,0.,1.),1.);}
 float o;
 if(m==0){float a=0.,ea=0.;for(int k=4;k<8;k++){vec2 d=Q34_K8(k);float e=Q34_KE(d);a+=e*(RAW(p+d)+.02)/(TP(p+d).g+.02);ea+=e;}o=(G0+.02)*a/ea-.02;}
 else if(m==5){float a=0.;for(int k=0;k<4;k++){vec2 d=vec2(k==0||k==3?1.:-1.,k<2?1.:-1.);a+=(RAW(p+d)+.01)/(TP(p+d).g+.01);}o=(G0+.01)*a*.25-.01;}
 else if(m==1){vec2 dn=vec2(-1.,1.),dp=vec2(1.,1.);float A1=RAW(p+dn),A9=RAW(p-dn),A3=RAW(p+dp),A7=RAW(p-dp);float G1=TP(p+dn).g,G9=TP(p-dn).g,G3=TP(p+dp).g,G7=TP(p-dp).g;
  float DN=abs(A1-A9)+abs(2.*G0-G1-G9),DP=abs(A3-A7)+abs(2.*G0-G3-G7);float oN=.5*(A1+A9)+.5*(2.*G0-G1-G9),oP=.5*(A3+A7)+.5*(2.*G0-G3-G7),oA=.25*(A1+A3+A7+A9)+.25*(4.*G0-G1-G3-G7-G9);o=DN<DP?oN:DP<DN?oP:oA;}
 else o=.25*(RAW(p+vec2(1.,1.))+RAW(p-vec2(1.,1.))+RAW(p+vec2(-1.,1.))+RAW(p+vec2(1.,-1.)));
 return vec4(clamp(w.r>.5?vec3(c0,G0,o):vec3(o,G0,c0),0.,1.),1.);`,
  // pass 4: GBTF R/B at green sites, Freeman colour-difference median, Kimmel green correction (1)
  ...[0, 1, 2, 3, 4, 5].map(it => RS_HEAD + Q34_KIM + `vec3 C=TP(p).rgb;` + (it === 0 ? `
 if(m==2){if(!isG)return vec4(C,1.);vec3 s=vec3(0.);for(int k=0;k<4;k++){vec2 o=Q34_K8(k);vec3 n=TP(p+o).rgb;s+=n.g-n;}s*=.25;return vec4(clamp(vec3(c0-s.r,c0,c0-s.b),0.,1.),1.);}
 if(m==7){float dr[9],db[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 n=TP(p+vec2(float(i),float(j))).rgb;dr[(j+1)*3+i+1]=n.r-n.g;db[(j+1)*3+i+1]=n.b-n.g;}
  float mr=9.,mb=9.;for(int i=0;i<9;i++){float lr=0.,lb=0.;for(int j=0;j<9;j++){lr+=step(dr[j],dr[i]);lb+=step(db[j],db[i]);}if(lr>=5.)mr=min(mr,dr[i]);if(lb>=5.)mb=min(mb,db[i]);}
  vec3 r=vec3(C.g+mr,C.g,C.g+mb);r=mix(r,vec3(c0),w);if(!isG)r.g=C.g;return vec4(clamp(r,0.,1.),1.);}` : '') + `
 if(m!=0)return vec4(C,1.);` + (it % 2 === 0 ? `
 if(isG)return vec4(C,1.);float gb=0.,gr=0.,ew=0.;for(int k=0;k<8;k++){vec2 o=Q34_K8(k);float e=Q34_KE(o);vec3 n=TP(p+o).rgb+.02;gb+=e*n.g/n.b;gr+=e*n.g/n.r;ew+=e;}
 vec3 C2=C+.02;float g=.5*(C2.b*gb/ew+C2.r*gr/ew)-.02;return vec4(C.r,clamp(g,0.,1.),C.b,1.);` : `
 float rb=0.,bb=0.,ew=0.;for(int k=0;k<8;k++){vec2 o=Q34_K8(k);float e=Q34_KE(o);vec3 n=TP(p+o).rgb+.02;rb+=e*n.r/n.g;bb+=e*n.b/n.g;ew+=e;}
 vec3 r=vec3((C.g+.02)*rb/ew-.02,C.g,(C.g+.02)*bb/ew-.02);r=mix(r,vec3(c0),w);r.g=C.g;return vec4(clamp(r,0.,1.),1.);`)),
  // output
  RS_BAY + `vec2 p=floor(uv*u_res);vec3 r=clamp(c.rgb,0.,1.);vec3 o=O(uv).rgb;int md=int(u_p1+.5);
 if(md==1)return vec4(clamp(abs(r-o)*u_p2,0.,1.),1.);if(md==2)return vec4(RSW(p)*RAW(p),1.);if(md==3)return vec4(clamp(.5+(r-o)*u_p2,0.,1.),1.);return vec4(r,1.);`],
 'RGGB mosaic of the input, then: Kimmel 1999 (edge weights e = (1 + D(p)^2 + D(n)^2)^-1/2 from the raw mosaic, weighted green, ratio R/B, 3 green / colour-ratio correction iterations over 8 neighbours; central differences everywhere, ratios offset by 0.02, no step-2 inverse diffusion); ACPI / Hamilton-Adams (US 5,629,734: Laplacian-corrected green with gradient + Laplacian classifiers, chroma with /2 green Laplacian and diagonal classifiers); GBTF (Pekkucuksen & Altunbasak 2010: Hamilton-Adams directional colour differences, N / S / E / W weights 1/(sum of 5x9 gradient window)^2, 1-D filter [.26 .24 .21 .17 .12], R/B with the 7x7 / 32 kernel then axial colour differences); RI and MLRI (Kiku et al. 2013 / 2014: directional guided-filter tentative G / R / B with linear-interpolation guides, 11-tap (RI) or 9-tap Laplacian-energy (MLRI) windows, residuals interpolated linearly, GBTF weighting; R/B guided by G with 5x5 windows (paper 11x11) and bilinear residuals, eps 1e-4 - approx.); Cok 1987 smooth hue (bilinear G, R/G and B/G ratios interpolated); Laroche-Prescott (US 5,373,322: green direction from chroma samples 2 px away, R/B by bilinear colour difference); Freeman 1988 (bilinear, then R = G + median3x3(R-G), B = G + median3x3(B-G) at unmeasured sites, Bayer form). Output demosaiced, error, mosaic or signed error');
