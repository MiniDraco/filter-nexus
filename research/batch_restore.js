/* ================= restore: demosaicing (mosaic → demosaic round trip), iterative deconvolution, inpainting, repairs ================= */
// Bayer RGGB helpers (image orientation: row 0 = top). RSM mirrors out-of-range pixels keeping CFA parity.
const RS_BAY = `
#define RSM(q) ((u_res-1.)-abs((u_res-1.)-abs(q)))
#define RSW(q) (mod((q).x,2.)<.5?(mod(u_res.y-1.-(q).y,2.)<.5?vec3(1.,0.,0.):vec3(0.,1.,0.)):(mod(u_res.y-1.-(q).y,2.)<.5?vec3(0.,1.,0.):vec3(0.,0.,1.)))
#define RAW(q) dot(O((RSM(q)+.5)/u_res).rgb,RSW(q))
#define TP(q) T((RSM(q)+.5)/u_res)
#define RSX vec2(1.,0.)
#define RSY vec2(0.,1.)
`;
const RS_HEAD = RS_BAY + `vec2 p=floor(uv*u_res);int m=int(u_p0+.5);vec3 w=RSW(p);float c0=RAW(p);bool isG=w.g>.5;\n`;
// colour-difference bilinear R/B from a pass holding (raw, G, *)
const RS_CDB = `float G0=TP(p).g;vec3 res;
 if(isG){bool hR=RSW(p+RSX).r>.5;float ch=.5*((RAW(p+RSX)-TP(p+RSX).g)+(RAW(p-RSX)-TP(p-RSX).g));float cv=.5*((RAW(p+RSY)-TP(p+RSY).g)+(RAW(p-RSY)-TP(p-RSY).g));res=hR?vec3(G0+ch,G0,G0+cv):vec3(G0+cv,G0,G0+ch);}
 else{float cd=0.;for(int k=0;k<4;k++){vec2 o=vec2(k==0||k==3?1.:-1.,k<2?1.:-1.);cd+=RAW(p+o)-TP(p+o).g;}cd*=.25;res=w.r>.5?vec3(c0,G0,G0+cd):vec3(G0+cd,G0,c0);}
 return vec4(clamp(res,0.,1.),1.);`;
// gradient-weighted colour differences (AMaZE / RCD style R/B step)
const RS_CDW = `float G0=TP(p).g;vec3 res;
 if(isG){bool hR=RSW(p+RSX).r>.5;float cdA[2];for(int a=0;a<2;a++){vec2 ax=a==0?RSX:RSY;float e1=RAW(p+ax)-TP(p+ax).g,e2=RAW(p-ax)-TP(p-ax).g;
   float w1=1./(1e-3+abs(TP(p+ax).g-G0)+abs(TP(p+2.*ax).g-TP(p+ax).g)),w2=1./(1e-3+abs(TP(p-ax).g-G0)+abs(TP(p-2.*ax).g-TP(p-ax).g));cdA[a]=(w1*e1+w2*e2)/(w1+w2);}
   res=hR?vec3(G0+cdA[0],G0,G0+cdA[1]):vec3(G0+cdA[1],G0,G0+cdA[0]);}
 else{float e[4];float gq[4];for(int k=0;k<4;k++){vec2 o=vec2(k==0||k==3?1.:-1.,k<2?1.:-1.);gq[k]=TP(p+o).g;e[k]=RAW(p+o)-gq[k];}
   float sw=0.,sc=0.;for(int k=0;k<4;k++){int op=(k+2)%4;float wk=1./(1e-3+abs(gq[k]-G0)+abs(e[k]-e[op]));sw+=wk;sc+=wk*e[k];}float cd=sc/sw;res=w.r>.5?vec3(c0,G0,G0+cd):vec3(G0+cd,G0,c0);}
 return vec4(clamp(res,0.,1.),1.);`;
const RS_LABM = `
#define RSLABF(fv) vec3(116.*(fv).y-16.,500.*((fv).x-(fv).y),200.*((fv).y-(fv).z))
#define RSLAB(v) RSLABF(pow(max(mat3(.4124,.2126,.0193,.3576,.7152,.1192,.1805,.0722,.9505)*(v)/vec3(.9505,1.,1.089),vec3(1e-4)),vec3(1./3.)))
`;

f = add('Sensor');
f('demosaic','Demosaic (Bayer round trip)',[S('Algorithm',['Bilinear','Malvar-He-Cutler','PPG','VNG','Menon (DDFAPD)','AHD','DCB','AMaZE','LMMSE','RCD']),S('Output',['Demosaiced','Error ×N','CFA mosaic','Signed error ×N']),P('Error gain',1,64,8,1)],
 [RS_HEAD + RS_LABM + `
#define Q(i,j) r5[((j)+2)*5+(i)+2]
 if(m==4){float iH=.5*(RAW(p+RSX)+RAW(p-RSX))+.25*(2.*c0-RAW(p+2.*RSX)-RAW(p-2.*RSX));float iV=.5*(RAW(p+RSY)+RAW(p-RSY))+.25*(2.*c0-RAW(p+2.*RSY)-RAW(p-2.*RSY));
   float cH=isG?iH-c0:c0-iH,cV=isG?iV-c0:c0-iV;return vec4(c0,.5+.5*cH,.5+.5*cV,1.);}
 if(m==5){float rr[81];for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++)rr[(j+4)*9+i+4]=RAW(p+vec2(float(i),float(j)));
   float gh[25],gv[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){int c_=(j+4)*9+i+4;float v0=rr[c_];int k=(j+2)*5+i+2;
    if(RSW(p+vec2(float(i),float(j))).g>.5){gh[k]=v0;gv[k]=v0;}else{float a1=rr[c_-1],a2=rr[c_+1];gh[k]=clamp(.5*(a1+a2)+.25*(2.*v0-rr[c_-2]-rr[c_+2]),min(a1,a2),max(a1,a2));
    float b1=rr[c_-9],b2=rr[c_+9];gv[k]=clamp(.5*(b1+b2)+.25*(2.*v0-rr[c_-18]-rr[c_+18]),min(b1,b2),max(b1,b2));}}
   vec3 lab[10];for(int d=0;d<2;d++)for(int t=0;t<5;t++){vec2 s_=t==0?vec2(0.):t==1?RSX:t==2?-RSX:t==3?RSY:-RSY;int si=int(s_.x),sj=int(s_.y);int k=(sj+2)*5+si+2;float g=d==0?gh[k]:gv[k];vec3 ws=RSW(p+s_);float v0=rr[(sj+4)*9+si+4];vec3 o3;
    if(ws.g>.5){float ch=0.,cv=0.;for(int e=-1;e<=1;e+=2){int kh=k+e,kv=k+5*e;ch+=rr[(sj+4)*9+si+e+4]-(d==0?gh[kh]:gv[kh]);cv+=rr[(sj+e+4)*9+si+4]-(d==0?gh[kv]:gv[kv]);}ch*=.5;cv*=.5;
     o3=RSW(p+s_+RSX).r>.5?vec3(g+ch,g,g+cv):vec3(g+cv,g,g+ch);}
    else{float cd=0.;for(int e=0;e<4;e++){int di=e==0||e==3?1:-1,dj=e<2?1:-1;int kk=(sj+dj+2)*5+si+di+2;cd+=rr[(sj+dj+4)*9+si+di+4]-(d==0?gh[kk]:gv[kk]);}cd*=.25;o3=ws.r>.5?vec3(v0,g,g+cd):vec3(g+cd,g,v0);}
    lab[d*5+t]=RSLAB(clamp(o3,0.,1.));}
   float eL=min(max(abs(lab[0].x-lab[1].x),abs(lab[0].x-lab[2].x)),max(abs(lab[5].x-lab[8].x),abs(lab[5].x-lab[9].x)));
   float eC=min(max(length(lab[0].yz-lab[1].yz),length(lab[0].yz-lab[2].yz)),max(length(lab[5].yz-lab[8].yz),length(lab[5].yz-lab[9].yz)));
   float hH=0.,hV=0.;for(int t=1;t<5;t++){hH+=(abs(lab[0].x-lab[t].x)<=eL&&length(lab[0].yz-lab[t].yz)<=eC)?1.:0.;hV+=(abs(lab[5].x-lab[5+t].x)<=eL&&length(lab[5].yz-lab[5+t].yz)<=eC)?1.:0.;}
   return vec4(hH*.25,hV*.25,0.,1.);}
 float r5[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)r5[(j+2)*5+i+2]=RAW(p+vec2(float(i),float(j)));
 float N=Q(0,1),S_=Q(0,-1),E=Q(1,0),W=Q(-1,0),N2=Q(0,2),S2=Q(0,-2),E2=Q(2,0),W2=Q(-2,0),dg=Q(1,1)+Q(-1,1)+Q(1,-1)+Q(-1,-1);
 bool hR=RSW(p+RSX).r>.5;
 if(m==0){vec3 r;if(isG){float h=.5*(E+W),v=.5*(N+S_);r=hR?vec3(h,c0,v):vec3(v,c0,h);}else{float g=.25*(N+S_+E+W),o=.25*dg;r=w.r>.5?vec3(c0,g,o):vec3(o,g,c0);}return vec4(r,1.);}
 if(m==1){vec3 r;if(isG){float rw=(5.*c0+4.*(E+W)-(E2+W2)-dg+.5*(N2+S2))/8.,cl=(5.*c0+4.*(N+S_)-(N2+S2)-dg+.5*(E2+W2))/8.;r=hR?vec3(rw,c0,cl):vec3(cl,c0,rw);}
   else{float g=(4.*c0+2.*(N+S_+E+W)-(N2+S2+E2+W2))/8.,o=(6.*c0+2.*dg-1.5*(N2+S2+E2+W2))/8.;r=w.r>.5?vec3(c0,g,o):vec3(o,g,c0);}return vec4(clamp(r,0.,1.),1.);}
 if(m==3){vec3 sm=vec3(0.);float n=0.;float gr[8];float gmn=1e9,gmx=0.;
   vec2 aA[6]=vec2[6](vec2(1.,0.),vec2(2.,0.),vec2(1.,-1.),vec2(1.,1.),vec2(2.,-1.),vec2(2.,1.));vec2 aB[6]=vec2[6](vec2(-1.,0.),vec2(0.),vec2(-1.,-1.),vec2(-1.,1.),vec2(0.,-1.),vec2(0.,1.));
   vec2 dA[6]=vec2[6](vec2(1.,1.),vec2(2.,2.),vec2(0.,1.),vec2(1.,0.),vec2(1.,2.),vec2(2.,1.));vec2 dB[6]=vec2[6](vec2(-1.,-1.),vec2(0.),vec2(-1.,0.),vec2(0.,-1.),vec2(0.,1.),vec2(1.,0.));
   for(int k=0;k<8;k++){int rot_=k/2;bool dia=(k%2)==1;float g=0.;for(int t=0;t<6;t++){vec2 a=dia?dA[t]:aA[t],b=dia?dB[t]:aB[t];for(int q=0;q<3;q++){if(q>=rot_)break;a=vec2(-a.y,a.x);b=vec2(-b.y,b.x);}
     g+=(t<2?1.:.5)*abs(Q(int(a.x),int(a.y))-Q(int(b.x),int(b.y)));}gr[k]=g;gmn=min(gmn,g);gmx=max(gmx,g);}
   float th=1.5*gmn+.5*(gmx-gmn);
   for(int k=0;k<8;k++){if(gr[k]>th)continue;int rot_=k/2;vec2 ce=(k%2)==1?vec2(1.,1.):vec2(1.,0.);for(int q=0;q<3;q++){if(q>=rot_)break;ce=vec2(-ce.y,ce.x);}
     vec3 cs=vec3(0.),cn=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=ce+vec2(float(i),float(j));if(abs(o.x)>2.||abs(o.y)>2.)continue;vec3 wo=RSW(p+o);cs+=wo*Q(int(o.x),int(o.y));cn+=wo;}
     sm+=cs/max(cn,vec3(1.));n+=1.;}
   float own=dot(sm,w);vec3 r=w*c0+(1.-w)*(c0+(sm-own)/max(n,1.));return vec4(clamp(r,0.,1.),1.);}
 if(m==2){float dN=abs(c0-N2)*2.+abs(N-S_),dS=abs(c0-S2)*2.+abs(S_-N),dE=abs(c0-E2)*2.+abs(E-W),dW=abs(c0-W2)*2.+abs(W-E);float g=c0;
   if(!isG){float mn=min(min(dN,dS),min(dE,dW));if(mn==dN)g=clamp((N*3.+S_+c0-N2)*.25,min(N,S_),max(N,S_));else if(mn==dE)g=clamp((E*3.+W+c0-E2)*.25,min(E,W),max(E,W));
    else if(mn==dW)g=clamp((W*3.+E+c0-W2)*.25,min(E,W),max(E,W));else g=clamp((S_*3.+N+c0-S2)*.25,min(N,S_),max(N,S_));}return vec4(c0,g,0.,1.);}
 if(isG)return vec4(c0,c0,0.,1.);
 if(m==6){float gH=.5*(E+W)+.25*(2.*c0-E2-W2),gV=.5*(N+S_)+.25*(2.*c0-N2-S2);float aH=0.,aV=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=p+vec2(float(i),float(j));aH+=abs(RAW(o+RSX)-RAW(o-RSX));aV+=abs(RAW(o+RSY)-RAW(o-RSY));}
   float g=aH<aV*.8?gH:aV<aH*.8?gV:.5*(gH+gV);return vec4(c0,clamp(g,0.,1.),0.,1.);}
 if(m==7){float eN=(N*3.+S_+c0-N2)*.25,eS=(S_*3.+N+c0-S2)*.25,eE=(E*3.+W+c0-E2)*.25,eW=(W*3.+E+c0-W2)*.25;
   float gN=1e-4+abs(N-S_)+abs(c0-N2)+.5*abs(RAW(p+3.*RSY)-N),gS=1e-4+abs(N-S_)+abs(c0-S2)+.5*abs(RAW(p-3.*RSY)-S_),gE=1e-4+abs(E-W)+abs(c0-E2)+.5*abs(RAW(p+3.*RSX)-E),gW=1e-4+abs(E-W)+abs(c0-W2)+.5*abs(RAW(p-3.*RSX)-W);
   float wN=1./(gN*gN),wS=1./(gS*gS),wE=1./(gE*gE),wW=1./(gW*gW);float g=(wN*eN+wS*eS+wE*eE+wW*eW)/(wN+wS+wE+wW);return vec4(c0,clamp(g,min(min(N,S_),min(E,W)),max(max(N,S_),max(E,W))),0.,1.);}
 if(m==8){float est[2],err[2];for(int a=0;a<2;a++){vec2 ax=a==0?RSX:RSY;float rw[21];for(int i=0;i<21;i++)rw[i]=RAW(p+ax*float(i-10));
   float dl[17];for(int i=0;i<17;i++){int c_=i+2;float ip=.5*(rw[c_-1]+rw[c_+1])+.25*(2.*rw[c_]-rw[c_-2]-rw[c_+2]);dl[i]=((i%2)==0)?ip-rw[c_]:rw[c_]-ip;}
   float sm[9];for(int i=0;i<9;i++){float s=0.,ws=0.;for(int j=-4;j<=4;j++){float gw=exp(-float(j*j)/8.);s+=gw*dl[i+4+j];ws+=gw;}sm[i]=s/ws;}
   float mu=0.;for(int i=0;i<9;i++)mu+=sm[i];mu/=9.;float vx=0.,vn=0.;for(int i=0;i<9;i++){vx+=(sm[i]-mu)*(sm[i]-mu);vn+=(dl[i+4]-sm[i])*(dl[i+4]-sm[i]);}vx=vx/9.+1e-7;vn=vn/9.+1e-7;
   est[a]=mu+vx/(vx+vn)*(dl[8]-mu);err[a]=vx-vx*vx/(vx+vn)+1e-8;}
   float d=(err[1]*est[0]+err[0]*est[1])/(err[0]+err[1]);return vec4(c0,clamp(c0+d,0.,1.),0.,1.);}
 // m==9 RCD (ratio-corrected estimates + V/H discrimination)
 float lp0=0.;float lpN=0.,lpS=0.,lpE=0.,lpW=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float wk=(i==0?1.:.5)*(j==0?1.:.5);vec2 o=vec2(float(i),float(j));lp0+=wk*RAW(p+o);lpN+=wk*RAW(p+o+2.*RSY);lpS+=wk*RAW(p+o-2.*RSY);lpE+=wk*RAW(p+o+2.*RSX);lpW+=wk*RAW(p+o-2.*RSX);}
 float nE=N*2.*lp0/(1e-5+lp0+lpN),sE=S_*2.*lp0/(1e-5+lp0+lpS),eE=E*2.*lp0/(1e-5+lp0+lpE),wE=W*2.*lp0/(1e-5+lp0+lpW);
 float nG=1e-5+abs(N-S_)+abs(c0-N2)+abs(N-RAW(p+3.*RSY))+abs(N2-RAW(p+4.*RSY)),sG=1e-5+abs(N-S_)+abs(c0-S2)+abs(S_-RAW(p-3.*RSY))+abs(S2-RAW(p-4.*RSY));
 float eG=1e-5+abs(E-W)+abs(c0-E2)+abs(E-RAW(p+3.*RSX))+abs(E2-RAW(p+4.*RSX)),wG=1e-5+abs(E-W)+abs(c0-W2)+abs(W-RAW(p-3.*RSX))+abs(W2-RAW(p-4.*RSX));
 float vE=(sG*nE+nG*sE)/(nG+sG),hE=(wG*eE+eG*wE)/(eG+wG);
 float vhc=0.,vhn=0.;for(int k=0;k<5;k++){vec2 o=k==0?vec2(0.):vec2(k==1||k==4?1.:-1.,k<3?1.:-1.);float vs=1e-7,hs=1e-7;
   for(int t=-1;t<=1;t++){vec2 qv=p+o+RSY*float(t),qh=p+o+RSX*float(t);float a2=RAW(qv-2.*RSY)-2.*RAW(qv)+RAW(qv+2.*RSY),a1=RAW(qv-RSY)-RAW(qv+RSY);vs+=a2*a2+a1*a1;
    float b2=RAW(qh-2.*RSX)-2.*RAW(qh)+RAW(qh+2.*RSX),b1=RAW(qh-RSX)-RAW(qh+RSX);hs+=b2*b2+b1*b1;}float vh=vs/(vs+hs);if(k==0)vhc=vh;else vhn+=vh*.25;}
 float vhd=abs(.5-vhc)<abs(.5-vhn)?vhn:vhc;return vec4(c0,clamp(vhd*hE+(1.-vhd)*vE,0.,1.),0.,1.);`,
  // pass B
  RS_HEAD + RS_LABM + `if(m==0||m==1||m==3)return c;
 if(m==2){vec2 g2=TP(p).rg;float G0=g2.y;if(isG){bool hR=RSW(p+RSX).r>.5;float h=.5*(RAW(p+RSX)+RAW(p-RSX)+2.*G0-TP(p+RSX).g-TP(p-RSX).g),v=.5*(RAW(p+RSY)+RAW(p-RSY)+2.*G0-TP(p+RSY).g-TP(p-RSY).g);return vec4(clamp(hR?vec3(h,G0,v):vec3(v,G0,h),0.,1.),1.);}
   float df[2],gs[2];for(int i=0;i<2;i++){vec2 d=i==0?vec2(1.,1.):vec2(-1.,1.);float a=RAW(p-d),b=RAW(p+d),ga=TP(p-d).g,gb=TP(p+d).g;df[i]=abs(a-b)+abs(ga-G0)+abs(gb-G0);gs[i]=a+b+2.*G0-ga-gb;}
   float o=df[0]!=df[1]?(df[0]>df[1]?gs[1]:gs[0])*.5:(gs[0]+gs[1])*.25;return vec4(clamp(w.r>.5?vec3(c0,G0,o):vec3(o,G0,c0),0.,1.),1.);}
 if(m==4){float dH=0.,dV=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=p+vec2(float(i),float(j));dH+=abs(TP(q).g-TP(q+2.*RSX).g);dV+=abs(TP(q).b-TP(q+2.*RSY).b);}
   vec3 a=TP(p).rgb;float cd=(dH<dV?a.g:dV<dH?a.b:.5*(a.g+a.b))*2.-1.;return vec4(c0,isG?c0:clamp(c0-cd,0.,1.),0.,1.);}
 if(m==5){float sH=0.,sV=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 h=TP(p+vec2(float(i),float(j))).rg;sH+=h.x;sV+=h.y;}float wH=sH>sV?1.:sH<sV?0.:.5;
   vec3 o2[2];for(int d=0;d<2;d++){float gg[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=p+vec2(float(i),float(j));float v0=RAW(q);vec2 ax=d==0?RSX:RSY;float a1=RAW(q-ax),a2=RAW(q+ax);
     gg[(j+1)*3+i+1]=RSW(q).g>.5?v0:clamp(.5*(a1+a2)+.25*(2.*v0-RAW(q-2.*ax)-RAW(q+2.*ax)),min(a1,a2),max(a1,a2));}
    float g=gg[4];if(isG){float ch=.5*(RAW(p+RSX)-gg[5]+RAW(p-RSX)-gg[3]),cv=.5*(RAW(p+RSY)-gg[7]+RAW(p-RSY)-gg[1]);o2[d]=RSW(p+RSX).r>.5?vec3(g+ch,g,g+cv):vec3(g+cv,g,g+ch);}
    else{float cd=.25*(RAW(p+vec2(1.,1.))-gg[8]+RAW(p+vec2(-1.,1.))-gg[6]+RAW(p+vec2(1.,-1.))-gg[2]+RAW(p+vec2(-1.,-1.))-gg[0]);o2[d]=w.r>.5?vec3(c0,g,g+cd):vec3(g+cd,g,c0);}}
   return vec4(clamp(mix(o2[1],o2[0],wH),0.,1.),1.);}
 if(m==7||m==9){` + RS_CDW + `}
 ` + RS_CDB,
  // pass C
  RS_HEAD + `if(m!=4&&m!=6)return c;
 if(m==4){` + RS_CDB + `}
 vec3 c3=TP(p).rgb;float cc=dot(c3,w);
 if(!isG){float gH=0.,gV=0.;for(int e=-1;e<=1;e+=2){vec3 a=TP(p+RSX*float(e)).rgb,b=TP(p+RSY*float(e)).rgb;gH+=a.g-dot(a,w);gV+=b.g-dot(b,w);}
   float aH=abs(TP(p+RSX).g-TP(p-RSX).g),aV=abs(TP(p+RSY).g-TP(p-RSY).g);float g=c0+(aH<aV?gH:aV<aH?gV:.5*(gH+gV))*.5;
   float o=0.;for(int k=0;k<4;k++){vec2 d=vec2(k==0||k==3?1.:-1.,k<2?1.:-1.);vec3 a=TP(p+d).rgb;o+=dot(a,vec3(1.)-w-vec3(0.,1.,0.))-a.g;}o=g+o*.25;
   return vec4(clamp(w.r>.5?vec3(c0,g,o):vec3(o,g,c0),0.,1.),1.);}
 vec3 sR=vec3(0.);for(int k=0;k<4;k++){vec2 d=k==0?RSX:k==1?-RSX:k==2?RSY:-RSY;vec3 a=TP(p+d).rgb;sR+=a-a.g;}sR*=.25;return vec4(clamp(vec3(c0+sR.r,c0,c0+sR.b),0.,1.),1.);`,
  // output
  RS_BAY + `vec2 p=floor(uv*u_res);vec3 r=clamp(c.rgb,0.,1.);vec3 o=O(uv).rgb;int md=int(u_p1+.5);
 if(md==1)return vec4(clamp(abs(r-o)*u_p2,0.,1.),1.);if(md==2)return vec4(RSW(p)*RAW(p),1.);if(md==3)return vec4(clamp(.5+(r-o)*u_p2,0.,1.),1.);return vec4(r,1.);`],
 'mosaics the input with an RGGB CFA, then demosaics: bilinear, Malvar-He-Cutler 5×5, PPG (Lin), VNG (Chang 1999, generic 5×5 form), Menon 2007 (no refinement step) and AHD (Hirakawa-Parks, CIELab homogeneity) as published; DCB, AMaZE, LMMSE (Zhang-Wu) and RCD are approx. GPU simplifications');
// Fujifilm X-Trans 6×6 CFA (row 0 = top): GGRGGB / GGBGGR / BRGRBG / GGBGGR / GGRGGB / RBGBRG
const RS_XT = `const int XT[36]=int[36](1,1,0,1,1,2,1,1,2,1,1,0,2,0,1,0,2,1,1,1,2,1,1,0,1,1,0,1,1,2,0,2,1,2,0,1);
#define XC(q) XT[int(mod(u_res.y-1.-(q).y,6.))*6+int(mod((q).x,6.))]
#define XW(q) vec3(equal(ivec3(XC(q)),ivec3(0,1,2)))
#define XR(q) dot(O((clamp(q,vec2(0.),u_res-1.)+.5)/u_res).rgb,XW(q))
#define XTP(q) T((clamp(q,vec2(0.),u_res-1.)+.5)/u_res)
vec2 p=floor(uv*u_res);int cc=XC(p);float c0=XR(p);`;
f('demosaic_xtrans','Demosaic (X-Trans round trip)',[S('Output',['Demosaiced','Error ×N','CFA mosaic','Signed error ×N']),P('Error gain',1,64,8,1),P('Edge sensitivity',.005,.2,.03,.005)],
 [RS_XT + `if(cc==1)return vec4(c0,c0,0.,1.);float sw=0.,sg=0.;
 for(int d=0;d<4;d++){vec2 dv=d==0?vec2(1.,0.):d==1?vec2(0.,1.):d==2?vec2(1.,1.):vec2(1.,-1.);float gp=0.,gm=0.,kp=0.,km=0.,gp2=0.,gm2=0.;
  for(int k=1;k<=4;k++){vec2 q=p+dv*float(k),q2=p-dv*float(k);if(XC(q)==1){if(kp<.5){gp=XR(q);kp=float(k);}else if(gp2==0.)gp2=XR(q);}if(XC(q2)==1){if(km<.5){gm=XR(q2);km=float(k);}else if(gm2==0.)gm2=XR(q2);}}
  if(kp<.5||km<.5)continue;float g=(gp*km+gm*kp)/(kp+km);float sc=abs(gp-gm)/(kp+km)+.25*(abs(gp2-gp)+abs(gm2-gm));float wt=1./pow(u_p2*.1+sc,2.);sg+=wt*g;sw+=wt;}
 return vec4(c0,sw>0.?sg/sw:c0,0.,1.);`,
  RS_XT + `float G0=XTP(p).g;vec3 acc=vec3(0.),wt=vec3(0.);
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=p+vec2(float(i),float(j));if(XC(q)==1)continue;float gq=XTP(q).g;float wq=exp(-float(i*i+j*j)/3.)/(u_p2+abs(gq-G0));vec3 m3=XW(q);acc+=m3*(XR(q)-gq)*wq;wt+=m3*wq;}
 vec3 r=G0+acc/max(wt,vec3(1e-6));r=mix(r,vec3(c0),XW(p));return vec4(clamp(r,0.,1.),1.);`,
  RS_XT + `vec3 r=clamp(c.rgb,0.,1.);vec3 o=O(uv).rgb;int md=int(u_p0+.5);
 if(md==1)return vec4(clamp(abs(r-o)*u_p1,0.,1.),1.);if(md==2)return vec4(XW(p)*c0,1.);if(md==3)return vec4(clamp(.5+(r-o)*u_p1,0.,1.),1.);return vec4(r,1.);`],
 'mosaics with the Fujifilm X-Trans 6×6 CFA, then demosaics Markesteijn-style: green from 4 directions (H, V, 2 diagonals) weighted by gradient, R/B from edge-weighted colour differences in 5×5 — approx. (no CIELab homogeneity pass)');

/* ---- iterative deconvolution with a Gaussian PSF (one iteration per pass; HᵀH = Gaussian of σ√2) ---- */
const RS_G2 = (tex, sig, out) => `vec3 ${out}=vec3(0.);{float sg_=max(${sig},.3);float rr_=ceil(3.*sg_);float st_=max(1.,rr_/6.);float ws_=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o_=vec2(float(i),float(j))*st_;if(dot(o_,o_)>rr_*rr_+.01)continue;float g_=exp(-dot(o_,o_)/(2.*sg_*sg_));${out}+=g_*texture(${tex},uv+o_*u_px).rgb;ws_+=g_;}${out}/=ws_;}`;
const RS_DECONV = i => `if(${i}.>=u_p2)return c;int m=int(u_p0+.5);float sg=R(u_p1);vec3 f0=c.rgb;vec3 upd;
 if(m==0){` + RS_G2('u_tex','sg','hf') + `upd=O(uv).rgb-hf;}
 else{` + RS_G2('u_orig','sg','hg') + RS_G2('u_tex','sg*1.41421','hhf') + `upd=(hg-hhf)*1.9;
  if(m==2){vec3 lap=T(uv+vec2(u_px.x,0.)).rgb+T(uv-vec2(u_px.x,0.)).rgb+T(uv+vec2(0.,u_px.y)).rgb+T(uv-vec2(0.,u_px.y)).rgb-4.*f0;upd+=u_p3*10.*lap;}
  if(m==3){vec3 gm0=sqrt(pow((T(uv+vec2(u_px.x,0.)).rgb-T(uv-vec2(u_px.x,0.)).rgb)*.5,vec3(2.))+pow((T(uv+vec2(0.,u_px.y)).rgb-T(uv-vec2(0.,u_px.y)).rgb)*.5,vec3(2.))+.0025);
   vec3 dv=vec3(0.);for(int k=0;k<4;k++){vec2 d=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;vec2 q=uv+d;vec3 fn=T(q).rgb;
    vec3 gmn=sqrt(pow((T(q+vec2(u_px.x,0.)).rgb-T(q-vec2(u_px.x,0.)).rgb)*.5,vec3(2.))+pow((T(q+vec2(0.,u_px.y)).rgb-T(q-vec2(0.,u_px.y)).rgb)*.5,vec3(2.))+.0025);
    dv+=(fn-f0)*min(u_p3*.5*(1./gm0+1./gmn),vec3(.2));}upd+=dv;}}
 return vec4(clamp(f0+upd,0.,1.),1.);`;
f = add('Sharpen');
f('deconv_iter','Iterative Deconvolution (Gaussian PSF)',[S('Method',['Van Cittert','Landweber','Tikhonov (iterative)','Total variation']),P('PSF σ',.5,3,1.2,.05,'px'),P('Iterations',1,30,10,1),P('Regularization λ',0,.05,.006,.001)],
 Array.from({length: 30}, (_, i) => RS_DECONV(i)),
 'one iteration per pass, f ← f + β·update: Van Cittert (g − h∗f), Landweber (hᵀg − hᵀh∗f, β 1.9), Tikhonov (+ λΔf), TV (+ λ div(∇f/|∇f|), explicit, flux-limited); clamped to [0,1]. Richardson-Lucy / Gold-Meinel are in Deconvolution Sharpen');

/* ---- inpainting of a mask derived from the image ---- */
const RS_MK = (pos, out, dil = true) => `float ${out}=0.;{int mm=int(u_p1+.5);for(int dj=-1;dj<=1;dj++)for(int di=-1;di<=1;di++){if((mm<3||${dil ? 'false' : 'true'})&&(di!=0||dj!=0))continue;vec2 qm_=${pos}+vec2(float(di),float(dj))*u_px;vec3 vm_=O(qm_).rgb;float hit=0.;
 if(mm==0)hit=step(1.-u_p2,min(vm_.r,min(vm_.g,vm_.b)));else if(mm==1)hit=step(max(vm_.r,max(vm_.g,vm_.b)),u_p2);else if(mm==2)hit=step(max(abs(vm_.r-1.),max(vm_.g,vm_.b)),u_p2);
 else{float l0=luma(vm_);float nb=0.,nd=0.;for(int k=0;k<8;k++){float a=float(k)*.7854;vec2 o=vec2(cos(a),sin(a))*(k%2==0?3.:2.5);float l=luma(O(qm_+R(1.)*o*u_px).rgb);nb+=step(u_p2,l0-l);nd+=step(u_p2,l-l0);}hit=step(5.5,max(nb,nd));}
 ${out}=max(${out},hit);}}`;
const RS_INP = s => `${RS_MK('uv','mk')}if(mk<.5)return O(uv);int m=int(u_p0+.5);float s=max(${s}.*u_k,1.);
 if(m==0){vec3 acc=vec3(0.),mn=vec3(1e9),mx=vec3(-1e9);float ws=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;vec2 d=vec2(float(i),float(j));vec2 q=uv+d*s*u_px;
   ${RS_MK('q','mq',false)}vec3 v=T(q).rgb;vec3 gx=(T(q+vec2(u_px.x,0.)).rgb-T(q-vec2(u_px.x,0.)).rgb)*.5,gy=(T(q+vec2(0.,u_px.y)).rgb-T(q-vec2(0.,u_px.y)).rgb)*.5;
   vec3 e=v-(gx*d.x+gy*d.y)*s*.5;float wd=(mq>.5?.15:1.)/dot(d,d);acc+=wd*e;ws+=wd;if(mq<.5){mn=min(mn,v);mx=max(mx,v);}}
  vec3 r=acc/ws;if(mx.x>=mn.x)r=clamp(r,mn,mx);return vec4(clamp(r,0.,1.),1.);}
 vec3 v[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)v[(j+2)*5+i+2]=T(uv+vec2(float(i),float(j))*s*u_px).rgb;
 vec3 Lc[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){int k=(j+2)*5+i+2;Lc[(j+1)*3+i+1]=v[k+1]+v[k-1]+v[k+5]+v[k-5]-4.*v[k];}
 vec3 gLx=(Lc[5]-Lc[3])*.5,gLy=(Lc[7]-Lc[1])*.5,ix=(v[13]-v[11])*.5,iy=(v[17]-v[7])*.5;vec3 gm=sqrt(ix*ix+iy*iy);
 vec3 beta=(gLx*(-iy)+gLy*ix)/max(gm,vec3(.02));vec3 r=v[12]+clamp(.25*beta,-.02,.02)+.22*Lc[4];
 return vec4(clamp(r,0.,1.),1.);`;
f = add('Repair');
f('inpaint','Inpainting (Telea / Navier-Stokes)',[S('Method',['Telea (iterative)','Navier-Stokes (iterative)']),S('Mask',['White pixels','Black pixels','Pure red (#FF0000)','Scratch / dust detector']),P('Mask tolerance',0,.5,.04,.005),S('Output',['Inpainted','Mask'])],
 [RS_MK('uv','mk') + `return vec4(mk,0.,0.,1.);`,
  `if(c.r<.5)return O(uv);vec3 acc=vec3(0.);float ws=0.;int mm=int(u_p1+.5);int nr=mm==3?8:16;float mxd=mm==3?24.:160.;
  for(int k=0;k<16;k++){if(k>=nr)break;float a=6.2832*(float(k)+.5)/float(nr);vec2 d=vec2(cos(a),sin(a));float t=1.;for(int n=0;n<40;n++){vec2 q=uv+d*R(t)*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;if(T(q).r<.5){float wd=1./(t*t);acc+=wd*O(q).rgb;ws+=wd;break;}t+=max(1.,t*.12);if(t>mxd)break;}}
  return vec4(ws>0.?acc/ws:vec3(.5),1.);`]
  .concat([6, 4, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(s => RS_INP(s)))
  .concat([RS_MK('uv','mk') + `return int(u_p3+.5)==1?vec4(vec3(mk),1.):c;`]),
 'mask from the image (white / black / pure red / scratch-dust outlier detector), ray-cast inverse-distance initial fill, then 16 coarse-to-fine passes: Telea-style first-order extrapolation weighted toward known pixels (no fast-marching order), or Bertalmio 2001 Navier-Stokes transport of ∇(ΔI) along isophotes + diffusion — approx.');

/* ---- repairs ---- */
f = add('Repair');
f('dehalo','Halo Removal (DeHalo)',[P('Halo width',1,8,2,.5,'px'),P('Bright halo strength',0,1,1,.01),P('Dark halo strength',0,1,.5,.01),S('Output',['Dehaloed','Removed halo ×4'])],
 [BH('u_p0*2.'), BV('u_p0*2.'),
  `vec3 lt[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;float amn=1.,amx=0.,umn=1.,umx=0.;
   for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){vec2 s=q+vec2(float(a),float(b))*u_px;float lo=luma(O(s).rgb),lb=L(s);amn=min(amn,lo);amx=max(amx,lo);umn=min(umn,lb);umx=max(umx,lb);}
   float are=amx-amn,ugly=umx-umn;float so=clamp(((are-ugly)/(are+.004)-.2)*1.25,0.,1.);lt[(j+1)*3+i+1]=mix(T(q).rgb,O(q).rgb,so);}
  vec3 mn=lt[0],mx=lt[0];for(int k=1;k<9;k++){mn=min(mn,lt[k]);mx=max(mx,lt[k]);}vec3 o=O(uv).rgb;vec3 rm=clamp(o,mn,mx);
  vec3 r=mix(o,rm,mix(vec3(u_p2),vec3(u_p1),step(rm,o)));return int(u_p3+.5)==1?vec4(clamp(.5+(o-r)*4.,0.,1.),1.):vec4(r,1.);`],
 'DeHalo_alpha-style (AviSynth): blurred copy replaces the original where the blur widens the local range (halo zone), then the original is clamped to the 3×3 min/max of that mix; separate bright/dark strengths');
const RS_AIR = `vec3 A=vec3(0.);float best=-1.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 s=O((vec2(float(i),float(j))+.5)/16.).rgb;float dc=min(s.r,min(s.g,s.b))+.02*luma(s);if(dc>best){best=dc;A=s;}}A=max(A,vec3(.1));`;
f('hazeline','Haze-Line Dehaze (Berman)',[P('Amount',0,1,.9,.01),P('Haze-line cone',1,10,3,.1,'°'),P('Min transmission',.05,.5,.15,.01),P('Smoothing radius',2,30,10,1,'px')],
 [RS_AIR + `vec3 I=c.rgb;vec3 d=I-A;float r=length(d);vec3 dir=d/max(r,1e-4);float ct=cos(radians(u_p1));float rmax=r;
  for(int j=0;j<24;j++)for(int i=0;i<24;i++){vec3 s=O((vec2(float(i),float(j))+.5)/24.).rgb-A;float rs=length(s);float cs=dot(s,dir)/max(rs,1e-4);rmax=max(rmax,rs*smoothstep(ct-.004,ct+.002,cs));}
  float t=r/max(rmax,1e-3);vec3 lb=1.-I/A;t=max(t,max(lb.r,max(lb.g,lb.b)));return vec4(clamp(t,u_p2,1.),luma(I),0.,1.);`,
  `float g0=c.g;float st=max(1.,R(u_p3)/4.);float acc=0.,ws=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 o=vec2(float(i),float(j))*st;vec2 v2=T(uv+o*u_px).rg;
   float wgt=exp(-dot(o,o)/(2.*R(u_p3)*R(u_p3)*.25)-pow((v2.y-g0)/.06,2.));acc+=wgt*v2.x;ws+=wgt;}return vec4(acc/ws,g0,0.,1.);`,
  RS_AIR + `float t=max(c.r,u_p2);vec3 I=O(uv).rgb;vec3 J=(I-A)/t+A;return vec4(mix(I,clamp(J,0.,1.),u_p0),1.);`],
 'Berman, Treibitz & Avidan 2016 simplified: airlight from the brightest dark-channel sample; each pixel’s haze line = pixels within a cone around its direction from A (24×24 global sample); t = r / r_max, lower-bounded, then edge-aware smoothing instead of WLS — approx.');
f('moirefix','Moiré Removal (Colour)',[P('Amount',0,1,1,.01),P('Radius',2,30,8,.5,'px'),P('Texture sensitivity',.005,.2,.03,.005),S('Output',['Result','Texture mask'])],
 [BH('u_p1'), BV('u_p1'),
  `float e=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*2.*u_px;e+=abs(luma(O(q).rgb)-L(q))+.5*length(O(q).rgb-luma(O(q).rgb)-(T(q).rgb-L(q)));}e/=9.;
  float mk=smoothstep(u_p2*.5,u_p2,e);if(int(u_p3+.5)==1)return vec4(vec3(mk),1.);vec3 o=O(uv).rgb;vec3 b=c.rgb;vec3 r=o-(o-luma(o)-(b-luma(b)))*mk*u_p0;return vec4(r,1.);`],
 'texture-gated chroma low-pass (raw-converter moiré brush style): keeps luminance, replaces chroma with a Gaussian-smoothed chroma where fine texture is detected; luminance moiré needs FFT notch filtering (not done)');
const RS_DBK = ax => { const A = ax, E = ax === 'x' ? 'vec2(1.,0.)' : 'vec2(0.,1.)', MK = ax === 'x' ? 'vec2(a_,ip.y)' : 'vec2(ip.x,a_)';
 return `vec2 px=floor(uv*u_res);int gm=int(u_p2+.5);vec2 ip=gm==1?px:vec2(px.x,u_res.y-1.-px.y);float ph=0.;
#define RSTX(qi) T((clamp(gm==1?(qi):vec2((qi).x,u_res.y-1.-(qi).y),vec2(0.),u_res-1.)+.5)/u_res)
#define RSOX(qi) O((clamp(vec2((qi).x,u_res.y-1.-(qi).y),vec2(0.),u_res-1.)+.5)/u_res)
 if(gm==2){float bs=-1.;for(int k=0;k<8;k++){float sc=0.;for(int j=0;j<6;j++)for(int i=0;i<6;i++){vec2 g=floor((vec2(float(i),float(j))+.5)/6.*u_res);g.${A}=floor(g.${A}/8.)*8.+float(k);
   sc+=abs(luma(RSOX(g).rgb)-luma(RSOX(g-${E}).rgb));}if(sc>bs){bs=sc;ph=float(k);}}}
 float i=mod(ip.${A}-ph,8.);bool left=i<3.5;float k=left?i:7.-i;float base=ip.${A}-i+(left?-4.:4.);
 vec3 pv[8];for(int n=0;n<8;n++){float a_=base+float(n);pv[n]=RSTX(${MK}).rgb;}
 float p0=luma(pv[3]),q0=luma(pv[4]);float d=q0-p0;float act=abs(luma(pv[2])-p0)+abs(luma(pv[1])-luma(pv[2]))+abs(luma(pv[5])-q0)+abs(luma(pv[6])-luma(pv[5]));
 float g=smoothstep(u_p0,u_p0*.5,abs(d))*smoothstep(u_p1,u_p1*.5,act);vec3 dl=pv[4]-pv[3];float wk=(3.5-k)/8.;return vec4(c.rgb+(left?-1.:1.)*dl*wk*g,1.);`; };
f('deblock','JPEG Deblocking',[P('Strength (step threshold)',0,.3,.1,.005),P('Detail protection',.01,.5,.12,.005),S('Block grid',['Top-left (real JPEG)','Bottom-left (Nexus JPEG Artifacts)','Auto-detect phase'])],
 [RS_DBK('x'), RS_DBK('y')],
 'H.264-style boundary filter on the 8×8 grid: where the step across a block edge is small (blocking, not a real edge) and the inner-block activity is low, the step is spread into a linear ramp over 8 px; vertical then horizontal edges; runs on native pixels');
f('dering','Deringing',[P('Strength',0,1,1,.01),P('Ring reach',2,12,4,.5,'px'),P('Edge threshold',.05,1.5,.35,.01),P('Range σ',.01,.2,.05,.005)],
 `float g0=length(sobel(uv));float ne=g0;for(int k=0;k<16;k++){float a=float(k)*.3927;for(int s=1;s<=2;s++){ne=max(ne,length(sobel(uv+vec2(cos(a),sin(a))*R(u_p1)*float(s)*.5*u_px)));}}
  float zone=smoothstep(u_p2*.6,u_p2,ne)*(1.-smoothstep(u_p2*.3,u_p2*.7,g0));vec3 o=O(uv).rgb;vec3 acc=vec3(0.);float ws=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));vec3 v=T(uv+d*u_px*max(u_k,1.)).rgb;float wgt=exp(-dot(d,d)/8.-dot(v-o,v-o)/(2.*u_p3*u_p3));acc+=wgt*v;ws+=wgt;}
  return vec4(mix(o,acc/ws,zone*u_p0),1.);`,
 'edge-masked bilateral (HQDering-style): smooths only the band within reach of strong edges, never the edge itself, so Gibbs / JPEG mosquito ringing is flattened while edges stay sharp');
const RS_BDB = i => `if(${i}.>=u_p1)return c;float sg=R(u_p0);` + RS_G2('u_tex','sg','hf') + `
 float ct=0.;for(int k=0;k<8;k++){float a=float(k)*.7854;ct=max(ct,abs(luma(O(uv+vec2(cos(a),sin(a))*1.5*u_px).rgb)-luma(O(uv-vec2(cos(a),sin(a))*1.5*u_px).rgb)));}
 float gate=smoothstep(u_p2,u_p2*3.,ct);vec3 f0=c.rgb;return vec4(clamp(f0+gate*(O(uv).rgb-hf),0.,1.),1.);`;
f = add('Sharpen');
f('deblur_banding','Banding-Aware Deblur',[P('PSF σ',.5,3,1.2,.05,'px'),P('Iterations',1,10,6,1),P('Flat threshold',.002,.05,.01,.001),P('Dither',0,2,1,.05,'LSB')],
 Array.from({length: 10}, (_, i) => RS_BDB(i)).concat([`float ct=0.;for(int k=0;k<8;k++){float a=float(k)*.7854;ct=max(ct,abs(luma(O(uv+vec2(cos(a),sin(a))*1.5*u_px).rgb)-luma(O(uv-vec2(cos(a),sin(a))*1.5*u_px).rgb)));}
  vec2 p=PX(uv);float tri=hash(p)+hash(p+31.7)-1.;return vec4(c.rgb+tri*u_p3/255.*(1.-smoothstep(u_p2,u_p2*3.,ct)),1.);`]),
 'Van Cittert deconvolution (Gaussian PSF) gated by local contrast: smooth gradients — where 8-bit banding lives — are left undeconvolved so steps are not amplified, plus triangular ±LSB dither there', 1);
f = add('Depth');
f('seathru','Underwater Colour Restoration (Sea-thru)',[P('Backscatter',0,1,.8,.01),P('Colour restoration',0,1,1,.01),P('Depth tolerance',.02,.5,.1,.01),P('Exposure lift',0,1,.3,.01)],
 `vec3 Bn=vec3(0.),Bd=vec3(0.),En=vec3(0.);float ew=0.;float d0=D(uv);
  for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec2 q=(vec2(float(i),float(j))+.5)/8.;vec3 v=O(q).rgb;float wq=exp(-pow((D(q)-d0)/u_p2,2.));vec3 e=wq*exp(-v/.04);Bn+=e*v;Bd+=e;}
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.25)/16.;vec3 v=O(q).rgb;float wq=exp(-pow((D(q)-d0)/u_p2,2.));vec3 e=wq*exp(-v/.04);Bn+=e*v;Bd+=e;}
  vec3 Bs=Bn/max(Bd,vec3(1e-30));
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 q=(vec2(float(i),float(j))+.75)/16.;float wq=exp(-pow((D(q)-d0)/u_p2,2.));En+=wq*max(O(q).rgb-Bs*u_p0,vec3(0.));ew+=wq;}
  vec3 E=max(En/max(ew,1e-6),vec3(.01));float le=luma(E);vec3 Dc=max(c.rgb-Bs*u_p0,vec3(0.));vec3 J=Dc*mix(vec3(1.),le/E,u_p1);J*=mix(1.,clamp(.4/max(le,.02),1.,3.),u_p3);return vec4(J,1.);`,
 'Akkaynak & Treibitz 2019 approx.: backscatter = soft-minimum colour of global samples at similar depth (the paper’s darkest-pixels-per-depth idea; depth map 1 = near, flat depth → global), subtracted; then the wideband attenuation is undone per channel with a depth-binned grey-world illuminant E(z) (D / E) instead of the fitted β_D(z)');
f = add('Repair');
f('specular_remove','Specular Highlight Removal',[P('Strength',0,1,1,.01),P('Range σ',.01,.5,.05,.01),P('Spatial radius',1,10,3,.5,'px'),S('Output',['Diffuse','Specular ×2'])],
 [`vec3 v=c.rgb;float sm=v.r+v.g+v.b+1e-4;vec3 ch=v/sm;float smx=max(ch.r,max(ch.g,ch.b)),smn=min(ch.r,min(ch.g,ch.b));float lm=(smx-smn)/max(1.-3.*smn,1e-3);return vec4(smx,clamp(lm,0.,1.),0.,1.);`]
 .concat(Array.from({length: 5}, () => `float s0=c.r,g0=c.g;float st=max(1.,R(u_p2)/2.);float acc=0.,ws=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j))*st;vec2 v=T(uv+o*u_px).rg;
   float wgt=exp(-dot(o,o)/(2.*R(u_p2)*R(u_p2))-pow((v.y-g0)/u_p1,2.));acc+=wgt*v.x;ws+=wgt;}return vec4(max(s0,acc/ws),g0,0.,1.);`))
 .concat([`vec3 I=O(uv).rgb;float sd=clamp(c.r,.34,1.);float sm=I.r+I.g+I.b;float mx=max(I.r,max(I.g,I.b));float Sp=clamp((mx-sd*sm)/(1.-3.*sd),0.,min(I.r,min(I.g,I.b)))*smoothstep(.05,.15,sm);Sp*=smoothstep(.34,.38,sd);
   vec3 Dd=I-Sp*u_p0;return int(u_p3+.5)==1?vec4(vec3(Sp*2.),1.):vec4(Dd,1.);`]),
 'Yang, Wang & Ahuja 2010 (real-time, dichromatic model): diffuse max-chromaticity estimated by iterated joint-bilateral filtering guided by λ_max, specular S = (max I − σ·ΣI)/(1 − 3σ) removed; assumes a white illuminant (white-balance first)');
f('rs_correct','Rolling Shutter Correction (Skew)',[S('Skew source',['Manual','Auto (straighten verticals)']),P('Skew',-1,1,.3,.01),P('Vertical scale',.8,1.2,1,.005)],
 `float s=u_p1*.2;if(u_p0>.5){float sxy=0.,sxx=0.;for(int j=0;j<24;j++)for(int i=0;i<24;i++){vec2 q=(vec2(float(i),float(j))+.5)/24.;vec2 e=u_px*1.5;
   float gx=luma(O(q+vec2(e.x,0.)).rgb)-luma(O(q-vec2(e.x,0.)).rgb),gy=luma(O(q+vec2(0.,e.y)).rgb)-luma(O(q-vec2(0.,e.y)).rgb);gx/=e.x*u_res.x;gy/=e.y*u_res.y;
   float w=step(2.*abs(gy),abs(gx))*gx*gx;sxy+=w*gy/(gx+sign(gx)*1e-6)*1.;sxx+=w;}s=-(sxy/max(sxx,1e-6))*u_res.y/u_res.x;}
  float t=1.-uv.y;vec2 q=vec2(uv.x-t*s,(uv.y-.5)/u_p2+.5);if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`,
 'undoes a global rolling-shutter shear (the same Skew value undoes Rolling Shutter); Auto estimates the slant of near-vertical edges from a 24×24 gradient sample; Vertical scale corrects row compression from vertical motion');
f('vignette_correct','Lens Vignetting Correction',[S('Model',['Polynomial (lensfun pa)','Natural cos⁴ (focal length)']),P('k1',-1,1,-.3,.01),P('k2',-1,1,0,.01),P('Focal length',8,135,28,1,'mm')],
 `if(u_p0>.5){vec2 p=(uv-.5)*vec2(36.,36./asp());float v=pow(cos(atan(length(p)/u_p3)),4.);return vec4(c.rgb/max(v,.05),1.);}
  vec2 d=(uv-.5)*vec2(asp(),1.);float r2=dot(d,d)/(.25*(asp()*asp()+1.));float v=max(1.+u_p1*r2+u_p2*r2*r2,.05);vec3 l=${LIN('c.rgb')}/v;return vec4(${SRGB('l')},1.);`,
 'divides out the falloff: lensfun “pa” polynomial 1 + k1·r² + k2·r⁴ (r = 1 at the corner, linear light; negative k = darkened corners), or the exact inverse of the cos⁴ natural vignetting filter');
f('lens_undistort','Lens Distortion Correction (Brown-Conrady)',[P('k1 (radial)',-.5,.5,-.1,.005),P('k2 (radial)',-.3,.3,0,.005),P('p1 (tangential)',-.05,.05,0,.001),P('p2 (tangential)',-.05,.05,0,.001)],
 `float a=asp();float nd=sqrt(a*a+1.);vec2 xy=vec2((uv.x-.5)*2.*a,(.5-uv.y)*2.)/nd;float r2=dot(xy,xy);float rad=1.+u_p0*r2+u_p1*r2*r2;
  vec2 xd=xy*rad+vec2(2.*u_p2*xy.x*xy.y+u_p3*(r2+2.*xy.x*xy.x),u_p2*(r2+2.*xy.y*xy.y)+2.*u_p3*xy.x*xy.y);vec2 q=vec2(xd.x*nd/(2.*a)+.5,.5-xd.y*nd/2.);
  if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`,
 'OpenCV-style undistort map: each output (undistorted) pixel samples the input at x_d = x(1 + k1r² + k2r⁴) + tangential p1/p2 terms; coordinates normalised to the half-diagonal; negative k1 corrects barrel distortion');
