/* ================= misc: pixel-art scalers II (SaI family, hqx, xBRZ, MMPX, SABR, EASU, Super-xBR / NEDI / ICBI lattice) ================= */
// block grid: input = N×-enlarged pixel art; TD(i,j) = block colour at offset (i,j), +j = DOWN; fr = position inside block (y down)
const MISC_G = `float BS=max(R(u_p0),1.);vec2 gp=PX(uv)/BS;vec2 g=floor(gp),fr=gp-g;fr.y=1.-fr.y;
  #define TD(i_,j_) T(fromPX((g+vec2(float(i_),-float(j_))+.5)*BS)).rgb
  `;
f = add('Retro');
f('saiscale','2xSaI / Super 2xSaI / Super Eagle',[P('Pixel size',1,16,4,1,'px'),S('Method',['2xSaI (Kreed)','Super 2xSaI','Super Eagle']),P('Color tolerance',0,.3,.03,.005)],
  `${MISC_G}float thr=u_p2+1e-4;
  #define EQ(a_,b_) (dot(abs((a_)-(b_)),vec3(1.))<=thr)
  #define I2(a_,b_) (((a_)+(b_))*.5)
  #define Q4(a_,b_,c_,d_) (((a_)+(b_)+(c_)+(d_))*.25)
  #define GR(a_,b_,c_,d_) ((float(EQ(a_,c_))+float(EQ(a_,d_))<=1.?1.:0.)-(float(!EQ(a_,c_)&&EQ(b_,c_))+float(!EQ(a_,d_)&&EQ(b_,d_))<=1.?1.:0.))
  vec3 nI=TD(-1,-1),nE=TD(0,-1),nF=TD(1,-1),nJ=TD(2,-1),nG=TD(-1,0),nA=TD(0,0),nB=TD(1,0),nK=TD(2,0),nH=TD(-1,1),nC=TD(0,1),nD=TD(1,1),nL=TD(2,1),nM=TD(-1,2),nN=TD(0,2),nO=TD(1,2);
  int m=int(u_p1+.5);bool rx=fr.x>=.5,dn=fr.y>=.5;vec3 o=nA;
  if(m==0){vec3 p1,p2,p3;
   if(EQ(nA,nD)&&!EQ(nB,nC)){
    p1=((EQ(nA,nE)&&EQ(nB,nL))||(EQ(nA,nC)&&EQ(nA,nF)&&!EQ(nB,nE)&&EQ(nB,nJ)))?nA:I2(nA,nB);
    p2=((EQ(nA,nG)&&EQ(nC,nO))||(EQ(nA,nB)&&EQ(nA,nH)&&!EQ(nG,nC)&&EQ(nC,nM)))?nA:I2(nA,nC);p3=nA;}
   else if(EQ(nB,nC)&&!EQ(nA,nD)){
    p1=((EQ(nB,nF)&&EQ(nA,nH))||(EQ(nB,nE)&&EQ(nB,nD)&&!EQ(nA,nF)&&EQ(nA,nI)))?nB:I2(nA,nB);
    p2=((EQ(nC,nH)&&EQ(nA,nF))||(EQ(nC,nG)&&EQ(nC,nD)&&!EQ(nA,nH)&&EQ(nA,nI)))?nC:I2(nA,nC);p3=nB;}
   else if(EQ(nA,nD)&&EQ(nB,nC)){
    if(EQ(nA,nB)){p1=nA;p2=nA;p3=nA;}
    else{p1=I2(nA,nB);p2=I2(nA,nC);float r=GR(nA,nB,nG,nE)-GR(nB,nA,nK,nF)-GR(nB,nA,nH,nN)+GR(nA,nB,nL,nO);p3=r>0.?nA:r<0.?nB:Q4(nA,nB,nC,nD);}}
   else{p3=Q4(nA,nB,nC,nD);
    p1=(EQ(nA,nC)&&EQ(nA,nF)&&!EQ(nB,nE)&&EQ(nB,nJ))?nA:(EQ(nB,nE)&&EQ(nB,nD)&&!EQ(nA,nF)&&EQ(nA,nI))?nB:I2(nA,nB);
    p2=(EQ(nA,nB)&&EQ(nA,nH)&&!EQ(nG,nC)&&EQ(nC,nM))?nA:(EQ(nC,nG)&&EQ(nC,nD)&&!EQ(nA,nH)&&EQ(nA,nI))?nC:I2(nA,nC);}
   o=rx?(dn?p3:p1):(dn?p2:nA);}
  else{vec3 nP=TD(2,2);vec3 a1,b1,a2,b2;float r=GR(nB,nA,nH,nN)+GR(nB,nA,nG,nE)+GR(nB,nA,nO,nL)+GR(nB,nA,nF,nK);
   if(m==1){
    if(EQ(nC,nB)&&!EQ(nA,nD)){b2=nC;b1=nC;}
    else if(EQ(nA,nD)&&!EQ(nC,nB)){b2=nA;b1=nA;}
    else if(EQ(nA,nD)&&EQ(nC,nB)){b2=r>0.?nB:r<0.?nA:I2(nA,nB);b1=b2;}
    else{b2=(EQ(nB,nD)&&EQ(nD,nN)&&!EQ(nC,nO)&&!EQ(nD,nM))?Q4(nD,nD,nD,nC):(EQ(nA,nC)&&EQ(nC,nO)&&!EQ(nN,nD)&&!EQ(nC,nP))?Q4(nC,nC,nC,nD):I2(nC,nD);
     b1=(EQ(nB,nD)&&EQ(nB,nE)&&!EQ(nA,nF)&&!EQ(nB,nI))?Q4(nB,nB,nB,nA):(EQ(nA,nC)&&EQ(nA,nF)&&!EQ(nE,nB)&&!EQ(nA,nJ))?Q4(nB,nA,nA,nA):I2(nA,nB);}
    a2=((EQ(nA,nD)&&!EQ(nC,nB)&&EQ(nG,nA)&&!EQ(nA,nO))||(EQ(nA,nH)&&EQ(nB,nA)&&!EQ(nG,nC)&&!EQ(nA,nM)))?I2(nC,nA):nC;
    a1=((EQ(nC,nB)&&!EQ(nA,nD)&&EQ(nH,nC)&&!EQ(nC,nF))||(EQ(nG,nC)&&EQ(nD,nC)&&!EQ(nH,nA)&&!EQ(nC,nI)))?I2(nC,nA):nA;}
   else{
    if(EQ(nC,nB)&&!EQ(nA,nD)){b1=nC;a2=nC;a1=(EQ(nH,nC)||EQ(nB,nF))?mix(nA,nC,.75):I2(nA,nB);b2=(EQ(nB,nK)||EQ(nC,nN))?mix(nD,nC,.75):I2(nC,nD);}
    else if(EQ(nA,nD)&&!EQ(nC,nB)){b2=nA;a1=nA;b1=(EQ(nE,nA)||EQ(nD,nL))?mix(nB,nA,.75):I2(nA,nB);a2=(EQ(nD,nO)||EQ(nG,nA))?mix(nC,nA,.75):I2(nC,nD);}
    else if(EQ(nA,nD)&&EQ(nC,nB)){if(r>0.){b1=nC;a2=nC;a1=I2(nA,nB);b2=a1;}else if(r<0.){b2=nA;a1=nA;b1=I2(nA,nB);a2=b1;}else{b2=nA;a1=nA;b1=nC;a2=nC;}}
    else{b2=Q4(nD,nD,nD,I2(nC,nB));a1=Q4(nA,nA,nA,I2(nC,nB));a2=Q4(nC,nC,nC,I2(nA,nD));b1=Q4(nB,nB,nB,I2(nA,nD));}}
   o=rx?(dn?b2:b1):(dn?a2:a1);}
  return vec4(o,1.);`,'Kreed 2xSaI / Super 2xSaI / Super Eagle rules (snes9x), 2×2 sub-blocks per source pixel');
f('hqx','hqx (hq2x / hq3x / hq4x, approx.)',[P('Pixel size',1,16,4,1,'px'),S('Scale',['hq2x','hq3x','hq4x']),P('Luma threshold',.05,.4,.188,.005)],
  `${MISC_G}float N=2.+floor(u_p1+.5);vec2 q=(floor(fr*N)+.5)/N-.5;
  #define YUV(c_) vec3(dot(c_,vec3(.299,.587,.114)),dot(c_,vec3(-.169,-.331,.5)),dot(c_,vec3(.5,-.419,-.081)))
  #define DF(a_,b_) (abs(YUV((a_)-(b_)).x)>u_p2||abs(YUV((a_)-(b_)).y)>.0275||abs(YUV((a_)-(b_)).z)>.0235)
  vec3 E=TD(0,0);vec3 o=E;
  for(int k=0;k<4;k++){vec2 sg=vec2(k==0||k==3?1.:-1.,k<2?1.:-1.);vec2 w=q*sg*2.;if(w.x<0.||w.y<0.)continue;
   vec3 Hn=TD(sg.x,0.),Vn=TD(0.,sg.y),Dn=TD(sg.x,sg.y);float cov=clamp(.5+(w.x+w.y-1.)*N*.5,0.,1.);
   bool dH=DF(E,Hn),dV=DF(E,Vn),dD=DF(E,Dn),dHV=DF(Hn,Vn);
   if(dH&&dV&&!dHV)o=mix(o,(Hn+Vn)*.5,dD?cov:0.);else if(!dH&&!dV&&dD)o=mix(o,Dn,.25*cov);else if(!dH&&!dV)o=mix(o,(Hn+Vn)*.5,.5*cov);}
  return vec4(o,1.);`,'approx.: hqx YUV-threshold neighbour tests (Y 48, U 7, V 6 /255) with generic corner-blend rules instead of the 256-case lookup table');
const MISC_RM = `mat2 rm=r==0?mat2(1.,0.,0.,1.):r==1?mat2(0.,1.,-1.,0.):r==2?mat2(-1.,0.,0.,-1.):mat2(0.,-1.,1.,0.);`;
f('xbrz','xBRZ (free scale)',[P('Pixel size',1,16,4,1,'px'),P('Color tolerance',.02,.3,.118,.005),P('Dominant direction ratio',1.5,6,3.6,.1),P('Steep direction ratio',1.2,4,2.2,.05)],
  `${MISC_G}vec3 P5[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)P5[(j+2)*5+i+2]=TD(i,j);
  #define DST(a_,b_) length(vec3(dot((a_)-(b_),vec3(.2627,.678,.0593)),dot((a_)-(b_),vec3(-.13963,-.36038,.5)),dot((a_)-(b_),vec3(.5,-.45979,-.04021))))
  #define EQZ(a_,b_) (DST(a_,b_)<u_p1)
  #define NE(a_,b_) (DST(a_,b_)>.004)
  #define K5(i_,j_) P5[int((rm*vec2(i_,j_)).y+2.5)*5+int((rm*vec2(i_,j_)).x+2.5)]
  float bl[4];
  for(int r=0;r<4;r++){${MISC_RM}
   vec3 kB=K5(0.,-1.),kC=K5(1.,-1.),kE=K5(-1.,0.),kF=K5(0.,0.),kG=K5(1.,0.),kH=K5(2.,0.),kI=K5(-1.,1.),kJ=K5(0.,1.),kK=K5(1.,1.),kL=K5(2.,1.),kN=K5(0.,2.),kO=K5(1.,2.);float bv=0.;
   if(!((!NE(kF,kG)&&!NE(kJ,kK))||(!NE(kF,kJ)&&!NE(kG,kK)))){
    float jg=DST(kI,kF)+DST(kF,kC)+DST(kN,kK)+DST(kK,kH)+4.*DST(kJ,kG),fk=DST(kE,kJ)+DST(kJ,kO)+DST(kB,kG)+DST(kG,kL)+4.*DST(kF,kK);
    if(jg<fk&&NE(kF,kG)&&NE(kF,kJ))bv=u_p2*jg<fk?2.:1.;}
   bl[r]=bv;}
  vec2 q=fr-.5;float w=1./BS;vec3 o=P5[12];
  for(int r=0;r<4;r++){if(bl[r]<.5)continue;${MISC_RM}vec2 lq=transpose(rm)*q;
   vec3 b=K5(0.,-1.),cc=K5(1.,-1.),d=K5(-1.,0.),e=K5(0.,0.),ff=K5(1.,0.),gg=K5(-1.,1.),h=K5(0.,1.),ii=K5(1.,1.);
   bool ln=bl[r]>1.5;if(!ln){ln=true;if(bl[(r+3)%4]>.5&&!EQZ(e,gg))ln=false;if(bl[(r+1)%4]>.5&&!EQZ(e,cc))ln=false;if(!EQZ(e,ii)&&EQZ(gg,h)&&EQZ(h,ii)&&EQZ(ii,ff)&&EQZ(ff,cc))ln=false;}
   vec3 px=DST(e,ff)<=DST(e,h)?ff:h;float cov;
   if(ln){float fg=DST(ff,gg),hc=DST(h,cc);bool sh=u_p3*fg<=hc&&NE(e,gg)&&NE(d,gg),st=u_p3*hc<=fg&&NE(e,cc)&&NE(b,cc);
    float cS=clamp(.5+dot(lq-vec2(.5,0.),vec2(.4472,.8944))/w,0.,1.),cT=clamp(.5+dot(lq-vec2(0.,.5),vec2(.8944,.4472))/w,0.,1.),cD=clamp(.5+(lq.x+lq.y-.5)*.7071/w,0.,1.);
    cov=sh&&st?max(cS,cT):sh?cS:st?cT:cD;}
   else cov=clamp(.5+(lq.x+lq.y-.676)*.7071/w,0.,1.);
   o=mix(o,px,cov);}
  return vec4(o,1.);`,'Zenju xBRZ: 4×4 corner pre-pass (dominant gradient), line / shallow / steep / corner blends; coverage rendered at any pixel size (freescale-style)');
f('mmpx','MMPX (McGuire & Gagiu 2021)',[P('Pixel size',1,16,4,1,'px'),P('Color tolerance',0,.3,.02,.005)],
  `${MISC_G}float thr=u_p1+1e-4;
  #define QE(a_,b_) (dot(abs((a_)-(b_)),vec3(1.))<=thr)
  vec3 mA=TD(-1,-1),mB=TD(0,-1),mC=TD(1,-1),mD=TD(-1,0),mE=TD(0,0),mF=TD(1,0),mG=TD(-1,1),mH=TD(0,1),mI=TD(1,1),mP=TD(0,-2),mQ=TD(-2,0),mR=TD(2,0),mS=TD(0,2);
  vec3 oJ=mE,oK=mE,oL=mE,oM=mE;float Bl=dot(mB,vec3(1.)),Dl=dot(mD,vec3(1.)),El=dot(mE,vec3(1.)),Fl=dot(mF,vec3(1.)),Hl=dot(mH,vec3(1.));
  if((QE(mD,mB)&&!QE(mD,mH)&&!QE(mD,mF))&&(El>=Dl||QE(mE,mA))&&(QE(mE,mA)||QE(mE,mC)||QE(mE,mG))&&((El<Dl)||!QE(mA,mD)||!QE(mE,mP)||!QE(mE,mQ)))oJ=mD;
  if((QE(mB,mF)&&!QE(mB,mD)&&!QE(mB,mH))&&(El>=Bl||QE(mE,mC))&&(QE(mE,mA)||QE(mE,mC)||QE(mE,mI))&&((El<Bl)||!QE(mC,mB)||!QE(mE,mP)||!QE(mE,mR)))oK=mB;
  if((QE(mH,mD)&&!QE(mH,mF)&&!QE(mH,mB))&&(El>=Hl||QE(mE,mG))&&(QE(mE,mA)||QE(mE,mG)||QE(mE,mI))&&((El<Hl)||!QE(mG,mH)||!QE(mE,mS)||!QE(mE,mQ)))oL=mH;
  if((QE(mF,mH)&&!QE(mF,mB)&&!QE(mF,mD))&&(El>=Fl||QE(mE,mI))&&(QE(mE,mC)||QE(mE,mG)||QE(mE,mI))&&((El<Fl)||!QE(mI,mH)||!QE(mE,mR)||!QE(mE,mS)))oM=mF;
  if(!QE(mE,mF)&&QE(mE,mC)&&QE(mE,mI)&&QE(mE,mD)&&QE(mE,mQ)&&QE(mF,mB)&&QE(mF,mH)&&!QE(mF,TD(3,0))){oK=mF;oM=mF;}
  if(!QE(mE,mD)&&QE(mE,mA)&&QE(mE,mG)&&QE(mE,mF)&&QE(mE,mR)&&QE(mD,mB)&&QE(mD,mH)&&!QE(mD,TD(-3,0))){oJ=mD;oL=mD;}
  if(!QE(mE,mH)&&QE(mE,mG)&&QE(mE,mI)&&QE(mE,mB)&&QE(mE,mP)&&QE(mH,mD)&&QE(mH,mF)&&!QE(mH,TD(0,3))){oL=mH;oM=mH;}
  if(!QE(mE,mB)&&QE(mE,mA)&&QE(mE,mC)&&QE(mE,mH)&&QE(mE,mS)&&QE(mB,mD)&&QE(mB,mF)&&!QE(mB,TD(0,-3))){oJ=mB;oK=mB;}
  if(Bl<El&&QE(mE,mG)&&QE(mE,mH)&&QE(mE,mI)&&QE(mE,mS)&&!QE(mE,mA)&&!QE(mE,mD)&&!QE(mE,mC)&&!QE(mE,mF)){oJ=mB;oK=mB;}
  if(Hl<El&&QE(mE,mA)&&QE(mE,mB)&&QE(mE,mC)&&QE(mE,mP)&&!QE(mE,mD)&&!QE(mE,mG)&&!QE(mE,mI)&&!QE(mE,mF)){oL=mH;oM=mH;}
  if(Fl<El&&QE(mE,mA)&&QE(mE,mD)&&QE(mE,mG)&&QE(mE,mQ)&&!QE(mE,mB)&&!QE(mE,mC)&&!QE(mE,mI)&&!QE(mE,mH)){oK=mF;oM=mF;}
  if(Dl<El&&QE(mE,mC)&&QE(mE,mF)&&QE(mE,mI)&&QE(mE,mR)&&!QE(mE,mB)&&!QE(mE,mA)&&!QE(mE,mG)&&!QE(mE,mH)){oJ=mD;oL=mD;}
  if(!QE(mH,mB)){
   if(!QE(mH,mA)&&!QE(mH,mE)&&!QE(mH,mC)){if(QE(mH,mG)&&QE(mH,mF)&&QE(mH,mR)&&!QE(mH,mD)&&!QE(mH,TD(2,-1)))oL=oM;if(QE(mH,mI)&&QE(mH,mD)&&QE(mH,mQ)&&!QE(mH,mF)&&!QE(mH,TD(-2,-1)))oM=oL;}
   if(!QE(mB,mI)&&!QE(mB,mG)&&!QE(mB,mE)){if(QE(mB,mA)&&QE(mB,mF)&&QE(mB,mR)&&!QE(mB,mD)&&!QE(mB,TD(2,1)))oJ=oK;if(QE(mB,mC)&&QE(mB,mD)&&QE(mB,mQ)&&!QE(mB,mF)&&!QE(mB,TD(-2,1)))oK=oJ;}}
  if(!QE(mF,mD)){
   if(!QE(mD,mI)&&!QE(mD,mE)&&!QE(mD,mC)){if(QE(mD,mA)&&QE(mD,mH)&&QE(mD,mS)&&!QE(mD,mB)&&!QE(mD,TD(1,2)))oJ=oL;if(QE(mD,mG)&&QE(mD,mB)&&QE(mD,mP)&&!QE(mD,mH)&&!QE(mD,TD(1,-2)))oL=oJ;}
   if(!QE(mF,mE)&&!QE(mF,mA)&&!QE(mF,mG)){if(QE(mF,mC)&&QE(mF,mH)&&QE(mF,mS)&&!QE(mF,mB)&&!QE(mF,TD(-1,2)))oK=oM;if(QE(mF,mI)&&QE(mF,mB)&&QE(mF,mP)&&!QE(mF,mH)&&!QE(mF,TD(-1,-2)))oM=oK;}}
  bool rx=fr.x>=.5,dn=fr.y>=.5;return vec4(dn?(rx?oM:oL):(rx?oK:oJ),1.);`,'MMPX 2× rules: 1:1 slopes, intersections, triangle tips, 2:1 slopes (palette-preserving, no blending)');
f('sabr','SABR (Street)',[P('Pixel size',1,16,4,1,'px'),P('Luma threshold',.05,.8,.32,.01)],
  `${MISC_G}vec3 s1=TD(-1,-2),s2=TD(0,-2),s3=TD(1,-2),s5=TD(-2,-1),s6=TD(-1,-1),s7=TD(0,-1),s8=TD(1,-1),s9=TD(2,-1),s10=TD(-2,0),s11=TD(-1,0),s12=TD(0,0),s13=TD(1,0),s14=TD(2,0),
   s15=TD(-2,1),s16=TD(-1,1),s17=TD(0,1),s18=TD(1,1),s19=TD(2,1),s21=TD(-1,2),s22=TD(0,2),s23=TD(1,2);vec3 lw=vec3(.21,.72,.07);
  #define L4(a_,b_,c_,d_) vec4(dot(a_,lw),dot(b_,lw),dot(c_,lw),dot(d_,lw))
  #define NQ(a_,b_) step(vec4(.004),abs((a_)-(b_)))
  #define LQ(a_,b_) step(abs((a_)-(b_)),vec4(u_p1))
  #define WD(a_,b_,c_,d_,e_,f_,g_,h_) (abs((a_)-(b_))+abs((a_)-(c_))+abs((d_)-(e_))+abs((d_)-(f_))+4.*abs((g_)-(h_)))
  vec4 p7=L4(s7,s11,s17,s13),p8=L4(s8,s6,s16,s18),p11=p7.yzwx,p12=vec4(dot(s12,lw)),p13=p7.wxyz,p14=L4(s14,s2,s10,s22),p16=p8.zwxy,p17=p7.zwxy,p18=p8.wxyz,p19=L4(s19,s3,s5,s21),p22=p14.wxyz,p23=L4(s23,s9,s1,s15);
  vec2 fp=fr;vec4 Ai=vec4(1.,-1.,-1.,1.),B45=vec4(1.,1.,-1.,-1.),C45=vec4(1.5,.5,-.5,.5),B30=vec4(.5,2.,-.5,-2.),C30=vec4(1.,1.,-.5,0.),B60=vec4(2.,.5,-2.,-.5),C60=vec4(2.,0.,-1.,.5),M45=vec4(.4),M30=vec4(.2,.4,.2,.4),M60=M30.yxwz,Msh=vec4(.2);
  vec4 ma45=smoothstep(C45-M45,C45+M45,Ai*fp.y+B45*fp.x),ma30=smoothstep(C30-M30,C30+M30,Ai*fp.y+B30*fp.x),ma60=smoothstep(C60-M60,C60+M60,Ai*fp.y+B60*fp.x),marn=smoothstep(C45-M45+Msh,C45+M45+Msh,Ai*fp.y+B45*fp.x);
  vec4 e45=WD(p12,p8,p16,p18,p22,p14,p17,p13),econt=WD(p17,p11,p23,p13,p7,p19,p12,p18),e30=abs(p13-p16),e60=abs(p8-p17);
  vec4 r45=NQ(p12,p13)*NQ(p12,p17)*max(max(max((1.-LQ(p13,p7))*(1.-LQ(p13,p8)),(1.-LQ(p17,p11))*(1.-LQ(p17,p16))),LQ(p12,p18)*max((1.-LQ(p13,p14))*(1.-LQ(p13,p19)),(1.-LQ(p17,p22))*(1.-LQ(p17,p23)))),max(LQ(p12,p16),LQ(p12,p8)));
  vec4 r30=NQ(p12,p16)*NQ(p11,p16),r60=NQ(p12,p8)*NQ(p7,p8);
  vec4 edr45=(1.-step(econt,e45))*r45,edrrn=step(e45,econt),edr30=step(2.*e30,e60)*r30,edr60=step(2.*e60,e30)*r60;
  vec4 mac=edr60*edr30*edr45*max(ma30,ma60)+edr45*(1.-edr60)*edr30*ma30+edr45*(1.-edr30)*edr60*ma60+(1.-edr30)*(1.-edr60)*edr45*ma45+(1.-edr45)*edrrn*marn;
  vec4 px=step(abs(p12-p17),abs(p12-p13));
  vec3 r1=s12;r1=mix(r1,mix(s13,s17,px.x),mac.x);r1=mix(r1,mix(s7,s13,px.y),mac.y);r1=mix(r1,mix(s11,s7,px.z),mac.z);r1=mix(r1,mix(s17,s11,px.w),mac.w);
  vec3 r2=s12;r2=mix(r2,mix(s17,s11,px.w),mac.w);r2=mix(r2,mix(s11,s7,px.z),mac.z);r2=mix(r2,mix(s7,s13,px.y),mac.y);r2=mix(r2,mix(s13,s17,px.x),mac.x);
  return vec4(mix(r1,r2,step(length(s12-r1),length(s12-r2))),1.);`,'SABR v3.0 (Joshua Street): xBR-style edge rules with 30° / 45° / 60° smoothstep corner blends');
f = add('Sharpen');
f('fsreasu','FSR 1 EASU Upscale (from N× grid)',[P('Source pixel size',1,16,4,.5,'px')],
  `float BS=max(R(u_p0),1.);vec2 pp=PX(uv)/BS-.5;vec2 fp=floor(pp);pp-=fp;
  #define TS(i_,j_) T(fromPX((fp+vec2(i_,j_)+.5)*BS)).rgb
  vec3 cb=TS(0.,-1.),cc_=TS(1.,-1.),ce=TS(-1.,0.),cf=TS(0.,0.),cg=TS(1.,0.),ch=TS(2.,0.),ci=TS(-1.,1.),cj=TS(0.,1.),ck=TS(1.,1.),cl=TS(2.,1.),cn=TS(0.,2.),co=TS(1.,2.);
  #define LZ(v_) ((v_).b*.5+((v_).r*.5+(v_).g))
  float bL=LZ(cb),cL=LZ(cc_),eL=LZ(ce),fL=LZ(cf),gL=LZ(cg),hL=LZ(ch),iL=LZ(ci),jL=LZ(cj),kL=LZ(ck),lL=LZ(cl),nL=LZ(cn),oL=LZ(co);
  vec2 dir=vec2(0.);float len=0.;
  #define ESET(w_,lA,lB,lC,lD,lE) {float dc=lD-lC,cb2=lC-lB,lx=max(abs(dc),abs(cb2));lx=lx>0.?1./lx:0.;float ddx=lD-lB;dir.x+=ddx*(w_);lx=clamp(abs(ddx)*lx,0.,1.);lx*=lx;len+=lx*(w_);float ec=lE-lC,ca=lC-lA,ly=max(abs(ec),abs(ca));ly=ly>0.?1./ly:0.;float ddy=lE-lA;dir.y+=ddy*(w_);ly=clamp(abs(ddy)*ly,0.,1.);ly*=ly;len+=ly*(w_);}
  ESET((1.-pp.x)*(1.-pp.y),bL,eL,fL,gL,jL)
  ESET(pp.x*(1.-pp.y),cL,fL,gL,hL,kL)
  ESET((1.-pp.x)*pp.y,fL,iL,jL,kL,nL)
  ESET(pp.x*pp.y,gL,jL,kL,lL,oL)
  vec2 d2=dir*dir;float dR=d2.x+d2.y;bool zro=dR<1./32768.;dR=zro?1.:inversesqrt(dR);if(zro)dir.x=1.;dir*=dR;
  len=len*.5;len*=len;float stretch=dot(dir,dir)/max(abs(dir.x),abs(dir.y));vec2 len2=vec2(1.+(stretch-1.)*len,1.-.5*len);float lob=.5+((1./4.-.04)-.5)*len;float clp=1./lob;
  vec3 aC=vec3(0.);float aW=0.;
  #define ETAP(ox_,oy_,col_) {vec2 off=vec2(ox_,oy_)-pp;vec2 v=vec2(off.x*dir.x+off.y*dir.y,off.x*(-dir.y)+off.y*dir.x)*len2;float dd=min(dot(v,v),clp);float wB=.4*dd-1.,wA=lob*dd-1.;wB*=wB;wA*=wA;wB=1.5625*wB-.5625;float ww=wB*wA;aC+=(col_)*ww;aW+=ww;}
  ETAP(0.,-1.,cb) ETAP(1.,-1.,cc_) ETAP(-1.,1.,ci) ETAP(0.,1.,cj) ETAP(0.,0.,cf) ETAP(-1.,0.,ce) ETAP(1.,1.,ck) ETAP(2.,1.,cl) ETAP(2.,0.,ch) ETAP(1.,0.,cg) ETAP(1.,2.,co) ETAP(0.,2.,cn)
  vec3 mn4=min(min(cf,cg),min(cj,ck)),mx4=max(max(cf,cg),max(cj,ck));return vec4(min(mx4,max(mn4,aC/aW)),1.);`,'AMD FidelityFX Super Resolution 1 EASU: 12-tap direction-adaptive Lanczos-like kernel, de-ringing clamp');
f('bicubicsharp','Bicubic Sharpener (from N× grid, approx.)',[P('Source pixel size',1,16,4,.5,'px'),P('Sharpen',0,2,.8,.01),P('Edge boost',0,1,.5,.01)],
  `float BS=max(R(u_p0),1.);vec2 pp=PX(uv)/BS-.5;vec2 fp=floor(pp),t=pp-fp;
  vec4 wx=vec4(((-.5*t.x+1.)*t.x-.5)*t.x,(1.5*t.x-2.5)*t.x*t.x+1.,((-1.5*t.x+2.)*t.x+.5)*t.x,(.5*t.x-.5)*t.x*t.x),wy=vec4(((-.5*t.y+1.)*t.y-.5)*t.y,(1.5*t.y-2.5)*t.y*t.y+1.,((-1.5*t.y+2.)*t.y+.5)*t.y,(.5*t.y-.5)*t.y*t.y);
  vec3 cub=vec3(0.),bil=vec3(0.),mn=vec3(1.),mx=vec3(0.);float gs=0.;
  for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec3 v=T(fromPX((fp+vec2(float(i)-1.,float(j)-1.)+.5)*BS)).rgb;cub+=v*wx[i]*wy[j];
   if(i>=1&&i<=2&&j>=1&&j<=2){float bw=(i==1?1.-t.x:t.x)*(j==1?1.-t.y:t.y);bil+=v*bw;mn=min(mn,v);mx=max(mx,v);}}
  float ed=clamp(length(mx-mn)*2.,0.,1.);vec3 o=cub+(cub-bil)*u_p1*(1.+u_p2*2.*ed);return vec4(clamp(o,mn,mx),1.);`,'approx. (no CNN): Catmull-Rom upsampling + edge-weighted detail boost with anti-ringing clamp, imitating FSRCNN-style crisp edges');
// ---- 2× lattice scalers (Super-xBR / NEDI / ICBI): lattice point (X,Y) stored at sub-block centre; X even,Y even = original pixel
const MISC_LAT = (stage) => `float BS=max(R(u_p0),2.);vec2 LC=floor(PX(uv)/BS*2.);vec2 par=mod(LC,2.);
  #define LAT(v_) T(fromPX((floor((v_)*.5)+mod((v_),2.)*.5+.25)*BS)).rgb
  ${stage === 0 ? `
  #define SM(x_,y_) LAT(LC+2.*vec2(x_,y_))
  if(par.x+par.y<1.5)return T(uv);` : `
  #define SM(x_,y_) LAT(LC+vec2((x_)-(y_),(x_)+(y_)))
  if(abs(par.x+par.y-1.)>.5)return T(uv);`}
  `;
const MISC_LATOUT = `float BS=max(R(u_p0),2.);
  #define LAT(v_) T(fromPX((floor((v_)*.5)+mod((v_),2.)*.5+.25)*BS)).rgb
  vec2 X=PX(uv)/BS*2.-1.;if(u_p1>.5)return vec4(LAT(floor(X+.5)),1.);vec2 X0=floor(X),fx=X-X0;
  return vec4(mix(mix(LAT(X0),LAT(X0+vec2(1.,0.)),fx.x),mix(LAT(X0+vec2(0.,1.)),LAT(X0+1.),fx.x),fx.y),1.);`;
const MISC_G16 = `vec3 cl[16];float lu[16];for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec3 v=SM(float(i)-1.5,float(j)-1.5);cl[j*4+i]=v;lu[j*4+i]=dot(v,vec3(.2126,.7152,.0722));}
  vec3 mn=min(min(cl[5],cl[6]),min(cl[9],cl[10])),mx=max(max(cl[5],cl[6]),max(cl[9],cl[10]));`;
const MISC_SXBR = s => `${MISC_LAT(s)}${MISC_G16}
  #define AD(i_,j_) abs(lu[i_]-lu[j_])
  #define DWD(b0,b1,c0,c1,c2,d0,d1,d2,d3,e1,e2,e3,f2,f3) (2.*(AD(c1,c2)+AD(c1,c0)+AD(e2,e1)+AD(e2,e3))+4.*AD(d1,d2)+AD(d0,d3)-(AD(c0,c2)+AD(e1,e3))+AD(b0,b1)+AD(f2,f3))
  float wA=DWD(4,1,8,5,2,12,9,6,3,13,10,7,14,11),wD=DWD(7,2,11,6,1,15,10,5,0,14,9,4,13,8);
  float hv=4.*(AD(6,10)+AD(5,9))+2.*(AD(6,2)+AD(10,14)+AD(5,1)+AD(9,13))-(AD(6,14)+AD(5,13)+AD(2,10)+AD(1,9));
  float hh=4.*(AD(5,6)+AD(9,10))+2.*(AD(5,4)+AD(6,7)+AD(9,8)+AD(10,11))-(AD(5,7)+AD(9,11)+AD(4,6)+AD(8,10));
  float w1=.129633,w2=.087534;vec4 k1=vec4(-w1,w1+.5,w1+.5,-w1),k2=vec4(-w2,w2+.25,w2+.25,-w2);
  vec3 c1=k1.x*cl[12]+k1.y*cl[9]+k1.z*cl[6]+k1.w*cl[3],c2=k1.x*cl[0]+k1.y*cl[5]+k1.z*cl[10]+k1.w*cl[15];
  vec3 c3=k2.x*(cl[4]+cl[8])+k2.y*(cl[5]+cl[9])+k2.z*(cl[6]+cl[10])+k2.w*(cl[7]+cl[11]),c4=k2.x*(cl[1]+cl[2])+k2.y*(cl[5]+cl[6])+k2.z*(cl[9]+cl[10])+k2.w*(cl[13]+cl[14]);
  float es=smoothstep(0.,u_p2+1e-6,abs(wA-wD));vec3 o=mix(wA<=wD?c1:c2,hv>=hh?c3:c4,1.-es);return vec4(clamp(o,mn,mx),1.);`;
f = add('Retro');
f('superxbr','Super-xBR (2× lattice, approx. weights)',[P('Pixel size',2,16,6,1,'px'),S('Output',['Smooth (bilinear from 2× lattice)','2× lattice (nearest)']),P('Edge strength',.05,2,.6,.01)],
  [MISC_SXBR(0), MISC_SXBR(1), MISC_LATOUT],'Hyllian Super-xBR scheme: diagonal pass then orthogonal pass on the 45°-rotated grid, 4-tap directional filters, edge-strength blend, anti-ringing clamp; then bilinear to the block grid');
const MISC_NEDI = s => `${MISC_LAT(s)}vec3 cl[36];float lu[36];for(int j=0;j<6;j++)for(int i=0;i<6;i++){vec3 v=SM(float(i)-2.5,float(j)-2.5);cl[j*6+i]=v;lu[j*6+i]=dot(v,vec3(.2126,.7152,.0722));}
  vec3 avg=(cl[14]+cl[15]+cl[20]+cl[21])*.25;vec3 mn=min(min(cl[14],cl[15]),min(cl[20],cl[21])),mx=max(max(cl[14],cl[15]),max(cl[20],cl[21]));
  mat4 Rm=mat4(0.);vec4 rv=vec4(0.);float vs=0.,ms=0.;
  for(int j=1;j<=4;j++)for(int i=1;i<=4;i++){vec4 cv=vec4(lu[(j-1)*6+i-1],lu[(j-1)*6+i+1],lu[(j+1)*6+i-1],lu[(j+1)*6+i+1]);float yv=lu[j*6+i];Rm+=outerProduct(cv,cv);rv+=cv*yv;ms+=yv;vs+=yv*yv;}
  ms/=16.;vs=vs/16.-ms*ms;if(vs<u_p2*u_p2)return vec4(avg,1.);
  float tr=Rm[0][0]+Rm[1][1]+Rm[2][2]+Rm[3][3];Rm+=mat4(tr*1e-3+1e-6);vec4 a=inverse(Rm)*rv;
  if(abs(a.x+a.y+a.z+a.w-1.)>.25||max(max(abs(a.x),abs(a.y)),max(abs(a.z),abs(a.w)))>1.5)return vec4(avg,1.);
  vec3 o=a.x*cl[14]+a.y*cl[15]+a.z*cl[20]+a.w*cl[21];return vec4(clamp(o,mn,mx),1.);`;
f('nedi','NEDI (New Edge-Directed Interpolation)',[P('Pixel size',2,16,6,1,'px'),S('Output',['Smooth (bilinear from 2× lattice)','2× lattice (nearest)']),P('Flat threshold',0,.1,.01,.001)],
  [MISC_NEDI(0), MISC_NEDI(1), MISC_LATOUT],'Li & Orchard 2001: 4 interpolation weights per new pixel from local covariance (least squares over a 4×4 training window), diagonal then rotated pass; bilinear fallback in flat / ill-conditioned windows');
const MISC_FCBI = s => `${MISC_LAT(s)}${MISC_G16}
  #define SD(i_,j_,k_) abs(lu[i_]+lu[j_]-2.*lu[k_])
  float d1=SD(0,10,5)+SD(5,15,10)+SD(4,14,9)+SD(1,11,6),d2=SD(3,9,6)+SD(6,12,9)+SD(2,8,5)+SD(7,13,10);
  vec3 o=abs(d1-d2)<u_p2?(cl[5]+cl[6]+cl[9]+cl[10])*.25:d1<d2?(cl[5]+cl[10])*.5:(cl[6]+cl[9])*.5;return vec4(o,1.);`;
const MISC_ICBI = s => `${MISC_LAT(s)}vec3 x=LAT(LC);vec3 a1=SM(-.5,-.5),b1=SM(.5,.5),a2=SM(.5,-.5),b2=SM(-.5,.5);vec3 A1=SM(-1.5,-1.5),B1=SM(1.5,1.5),A2=SM(1.5,-1.5),B2=SM(-1.5,1.5);
  vec3 t1=(4.*(a1+b1)-(A1+B1))/6.,t2=(4.*(a2+b2)-(A2+B2))/6.;vec3 lw=vec3(.2126,.7152,.0722);
  float e1=abs(dot(A1+x-2.*a1,lw))+abs(dot(B1+x-2.*b1,lw))+abs(dot(a1+b1-2.*x,lw)),e2=abs(dot(A2+x-2.*a2,lw))+abs(dot(B2+x-2.*b2,lw))+abs(dot(a2+b2-2.*x,lw));
  float q1=1./(e1*e1+1e-4),q2=1./(e2*e2+1e-4);vec3 tg=(t1*q1+t2*q2)/(q1+q2);vec3 mn=min(min(a1,b1),min(a2,b2)),mx=max(max(a1,b1),max(a2,b2));
  return vec4(clamp(mix(x,tg,.5),mn,mx),1.);`;
f('icbi','ICBI (Iterative Curvature-Based Interpolation, approx.)',[P('Pixel size',2,16,6,1,'px'),S('Output',['Smooth (bilinear from 2× lattice)','2× lattice (nearest)']),P('Direction threshold',0,.3,.03,.005)],
  [MISC_FCBI(0), MISC_ICBI(0), MISC_ICBI(0), MISC_ICBI(0), MISC_FCBI(1), MISC_ICBI(1), MISC_ICBI(1), MISC_ICBI(1), MISC_LATOUT],'Giachetti & Asuni 2011: FCBI second-derivative direction choice, then 3 refinement iterations per step (approx.: curvature-continuity target per direction weighted by local curvature energy, instead of the full energy with isolevel term)');
