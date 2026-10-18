/* ================= retroshaders (round 10) part 2: pixel-art scalers, dedithering, mpv/libplacebo scalers & sharpening ================= */
const RTS2_DOWN = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 w=floor(uv*u_res);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);
 vec3 a=vec3(0.);float a2=0.;for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 q=floor(w*Bw+(vec2(float(i),float(j))+.5)*Bw*.25)+.5;vec3 v=O(min(q,u_res-.5)/u_res).rgb;a+=v;a2+=luma(v)*luma(v);}return vec4(a/16.,a2/16.);`;
const RTS2_SRC = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 SF=u_res/Bw;vec2 wp=uv*u_res;vec2 sp=wp/Bw;
 #define SRC(q) T(clamp((q),vec2(.5),SS-.5)/u_res).rgb
 #define TXL(q) T((clamp(floor(q),vec2(0.),SS-1.)+.5)/u_res).rgb
 `;

f = add('Retro');
f('pixelscale2','Pixel-Art Scalers II (OmniScale / cleanEdge / DDT / AA 4.0 / shimmerless / bandlimit)',[S('Method',['OmniScale (Lior Halphon)','cleanEdge (torcado)','DDT (diagonal-directed triangle)','AA shader 4.0 (guest.r)','sharp-shimmerless (Woohyun Kang)','bandlimit-pixel (Themaister)']),
  P('Pixel size',1,16,6,1,'px'),P('Similarity (cleanEdge) / fallback (DDT)',0,1,.05,.01),P('Line width (cleanEdge) / smoothness (bandlimit)',0,2,1,.01)],
 [RTS2_DOWN('R(u_p1)'), `${RTS2_SRC('R(u_p1)')}int m=int(u_p0+.5);
 if(m==0){vec2 o=vec2(1.);vec2 p=fract(sp);vec2 bs=floor(sp)+.5;if(p.x>.5){o.x=-1.;p.x=1.-p.x;}if(p.y>.5){o.y=-1.;p.y=1.-p.y;}
  #define OW(i,j) TXL(bs+vec2(float(i)*o.x,float(j)*o.y))
  #define HQ(A_) vec3(.25*(A_).r+.25*(A_).g+.25*(A_).b,.25*(A_).r-.25*(A_).b,-.125*(A_).r+.25*(A_).g-.125*(A_).b)
  #define DIF(A_,B_) (abs(HQ(A_)-HQ(B_)).x>.125||abs(HQ(A_)-HQ(B_)).y>.027||abs(HQ(A_)-HQ(B_)).z>.031)
  #define PT(MK,RV) ((pat&(MK))==(RV))
  #define RET(v) return vec4((v),1.);
  vec3 w0=OW(-1,-1),w1=OW(0,-1),w2=OW(1,-1),w3=OW(-1,0),w4=OW(0,0),w5=OW(1,0),w6=OW(-1,1),w7=OW(0,1),w8=OW(1,1);int pat=0;
  if(DIF(w0,w4))pat|=1;if(DIF(w1,w4))pat|=2;if(DIF(w2,w4))pat|=4;if(DIF(w3,w4))pat|=8;if(DIF(w5,w4))pat|=16;if(DIF(w6,w4))pat|=32;if(DIF(w7,w4))pat|=64;if(DIF(w8,w4))pat|=128;
  float ps=1.41421356/Bw;vec3 rr;
  #define RDIAG (DIF(w0,w1)||DIF(w0,w3)?mix(w1,w3,p.y-p.x+.5):mix(mix(w1*.375+w0*.25+w3*.375,w3,p.y*2.),w1,p.x*2.))
  if((PT(0xbf,0x37)||PT(0xdb,0x13))&&DIF(w1,w5))RET(mix(w4,w3,.5-p.x))
  if((PT(0xdb,0x49)||PT(0xef,0x6d))&&DIF(w7,w3))RET(mix(w4,w1,.5-p.y))
  if((PT(0x0b,0x0b)||PT(0xfe,0x4a)||PT(0xfe,0x1a))&&DIF(w3,w1))RET(w4)
  if((PT(0x6f,0x2a)||PT(0x5b,0x0a)||PT(0xbf,0x3a)||PT(0xdf,0x5a)||PT(0x9f,0x8a)||PT(0xcf,0x8a)||PT(0xef,0x4e)||PT(0x3f,0x0e)||PT(0xfb,0x5a)||PT(0xbb,0x8a)||PT(0x7f,0x5a)||PT(0xaf,0x8a)||PT(0xeb,0x8a))&&DIF(w3,w1))RET(mix(w4,mix(w4,w0,.5-p.x),.5-p.y))
  if(PT(0x0b,0x08))RET(mix(mix(w0*.375+w1*.25+w4*.375,w4*.5+w1*.5,p.x*2.),w4,p.y*2.))
  if(PT(0x0b,0x02))RET(mix(mix(w0*.375+w3*.25+w4*.375,w4*.5+w3*.5,p.y*2.),w4,p.x*2.))
  if(PT(0x2f,0x2f)){float dd=length(p-vec2(.5));if(dd<.5-ps*.5)RET(w4)rr=RDIAG;if(dd>.5+ps*.5)RET(rr)RET(mix(w4,rr,(dd-.5+ps*.5)/ps))}
  float p5=ps*2.2360680;
  if(PT(0xbf,0x37)||PT(0xdb,0x13)){float dd=p.x-2.*p.y;if(dd>p5*.5)RET(w1)rr=mix(w3,w4,p.x+.5);if(dd<-p5*.5)RET(rr)RET(mix(rr,w1,(dd+p5*.5)/p5))}
  if(PT(0xdb,0x49)||PT(0xef,0x6d)){float dd=p.y-2.*p.x;if(dd>p5*.5)RET(w3)rr=mix(w1,w4,p.x+.5);if(dd<-p5*.5)RET(rr)RET(mix(rr,w3,(dd+p5*.5)/p5))}
  if(PT(0xbf,0x8f)||PT(0x7e,0x0e)){float dd=p.x+2.*p.y;if(dd>1.+p5*.5)RET(w4)rr=RDIAG;if(dd<1.-p5*.5)RET(rr)RET(mix(rr,w4,(dd+p5*.5-1.)/p5))}
  if(PT(0x7e,0x2a)||PT(0xef,0xab)){float dd=p.y+2.*p.x;if(dd>1.+p5*.5)RET(w4)rr=RDIAG;if(dd<1.-p5*.5)RET(rr)RET(mix(rr,w4,(dd+p5*.5-1.)/p5))}
  if(PT(0x1b,0x03)||PT(0x4f,0x43)||PT(0x8b,0x83)||PT(0x6b,0x43))RET(mix(w4,w3,.5-p.x))
  if(PT(0x4b,0x09)||PT(0x8b,0x89)||PT(0x1f,0x19)||PT(0x3b,0x19))RET(mix(w4,w1,.5-p.y))
  if(PT(0xfb,0x6a)||PT(0x6f,0x6e)||PT(0x3f,0x3e)||PT(0xfb,0xfa)||PT(0xdf,0xde)||PT(0xdf,0x1e))RET(mix(w4,w0,(1.-p.x-p.y)/2.))
  if(PT(0x4f,0x4b)||PT(0x9f,0x1b)||PT(0x2f,0x0b)||PT(0xbe,0x0a)||PT(0xee,0x0a)||PT(0x7e,0x0a)||PT(0xeb,0x4b)||PT(0x3b,0x1b)){float dd=p.x+p.y;if(dd>.5+ps*.5)RET(w4)rr=RDIAG;if(dd<.5-ps*.5)RET(rr)RET(mix(rr,w4,(dd+ps*.5-.5)/ps))}
  if(PT(0x0b,0x01))RET(mix(mix(w4,w3,.5-p.x),mix(w1,(w1+w3)/2.,.5-p.x),.5-p.y))
  if(PT(0x0b,0x00))RET(mix(mix(w4,w3,.5-p.x),mix(w1,w0,.5-p.x),.5-p.y))
  float dd=p.x+p.y;if(dd>.5+ps*.5)RET(w4)
  if(DIF(OW(-2,-2),w4))pat|=256;if(DIF(OW(-1,-2),w4))pat|=512;if(DIF(OW(0,-2),w4))pat|=1024;if(DIF(OW(1,-2),w4))pat|=2048;if(DIF(OW(-2,-1),w4))pat|=4096;if(DIF(OW(-2,0),w4))pat|=8192;if(DIF(OW(-2,1),w4))pat|=16384;
  int db=-7;for(int k=0;k<15;k++)db+=(pat>>k)&1;if(db<=0){rr=mix(w1,w3,p.y-p.x+.5);if(dd<.5-ps*.5)RET(rr)RET(mix(rr,w4,(dd+ps*.5-.5)/ps))}RET(w4)}
 if(m==1){float thr=u_p2;float lwd=clamp(u_p3,.44,1.142);vec2 loc=fract(sp);vec2 pxi=floor(sp)+.5;vec2 pd=floor(loc+.5)*2.-1.;
  #define CE(i,j) TXL(pxi+vec2(float(i),float(j))*pd)
  #define SIM(A_,B_) (distance((A_),(B_))<=thr)
  #define SIM3(A_,B_,C_) (SIM(A_,B_)&&SIM(B_,C_))
  #define SIM4(A_,B_,C_,D_) (SIM(A_,B_)&&SIM(B_,C_)&&SIM(C_,D_))
  #define HIG(A_,B_) (!SIM(A_,B_)&&distance((A_),vec3(1.))<distance((B_),vec3(1.)))
  #define CDD(A_,B_) distance((A_),(B_))
  #define DTL(TP,P1,P2,DR) ((dot(vec2(((P2)-(P1)).y,-((P2)-(P1)).x),(DR))>0.?1.:-1.)*dot(normalize(vec2(((P2)-(P1)).y,-((P2)-(P1)).x)),(P1)-(TP)))
  vec3 uub=CE(-1,-2),uu=CE(0,-2),uuf=CE(1,-2),ubb=CE(-2,-2),ub=CE(-1,-1),u=CE(0,-1),uf=CE(1,-1),uff=CE(2,-1),bb=CE(-2,0),b=CE(-1,0),cc=CE(0,0),fz=CE(1,0),ff=CE(2,0),dbb=CE(-2,1),db=CE(-1,1),d=CE(0,1),df=CE(1,1),dff=CE(2,1),ddb=CE(-1,2),dd=CE(0,2),ddf=CE(1,2);
  vec3 col=cc;vec2 ctr=vec2(.5);
  for(int k=0;k<3;k++){vec2 md=k==0?vec2(1.,1.):k==1?vec2(-1.,1.):vec2(1.,-1.);
   vec3 U=k==2?d:u,UF=k==0?uf:k==1?ub:df,UFF=k==0?uff:k==1?ubb:dff,Bq=k==1?fz:b,C=cc,F=k==1?b:fz,FF=k==1?bb:ff,DB=k==0?db:k==1?df:ub,D=k==2?u:d,DF=k==0?df:k==1?db:uf,DFF=k==0?dff:k==1?dbb:uff,DDB=k==0?ddb:k==1?ddf:uub,DD=k==2?uu:dd,DDF=k==0?ddf:k==1?ddb:uuf;
   vec2 pt=md*(loc-.5)+.5;vec3 res=vec3(-1.);
   float dA=4.*CDD(F,D)+CDD(UF,C)+CDD(C,DB)+CDD(FF,DF)+CDD(DF,DD),dT=4.*CDD(C,DF)+CDD(U,F)+CDD(F,DFF)+CDD(Bq,D)+CDD(D,DDF);
   bool sl=(dA<dT)||(dA<dT+.001)&&!HIG(C,F);if(SIM4(F,D,Bq,U)&&SIM3(UF,DF,DB)&&!SIM(C,F))sl=false;
   if(sl){float dist=1.;bool fl=false;
    if(SIM3(F,D,DB)&&!SIM3(F,D,Bq)&&!SIM(UF,DB)){if(!(SIM(C,DF)&&HIG(C,F))){if(HIG(C,F))fl=true;if(SIM(U,F)&&!SIM(C,DF)&&!HIG(C,U))fl=true;}
     if(fl)dist=lwd-DTL(pt,ctr+vec2(1.5,-1.)*pd,ctr+vec2(-.5,0.)*pd,-pd);else dist=DTL(pt,ctr+vec2(1.5,0.)*pd,ctr+vec2(-.5,1.)*pd,pd);
     if(!fl&&SIM(C,UF)&&!(SIM3(C,UF,UFF)&&!SIM3(C,UF,FF)&&!SIM(D,UFF)))dist=min(dist,DTL(pt,ctr+vec2(2.,-1.)*pd,ctr+vec2(0.,1.)*pd,pd));
     dist-=lwd*.5;if(dist<=0.)res=CDD(C,F)<=CDD(C,D)?F:D;}
    else if(SIM3(UF,F,D)&&!SIM3(U,F,D)&&!SIM(UF,DB)){if(!(SIM(C,DF)&&HIG(C,D))){if(HIG(C,D))fl=true;if(SIM(Bq,D)&&!SIM(C,DF)&&!HIG(C,D))fl=true;}
     if(fl)dist=lwd-DTL(pt,ctr+vec2(0.,-.5)*pd,ctr+vec2(-1.,1.5)*pd,-pd);else dist=DTL(pt,ctr+vec2(1.,-.5)*pd,ctr+vec2(0.,1.5)*pd,pd);
     if(!fl&&SIM(C,DB)&&!(SIM3(C,DB,DDB)&&!SIM3(C,DB,DD)&&!SIM(F,DDB)))dist=min(dist,DTL(pt,ctr+vec2(1.,0.)*pd,ctr+vec2(-1.,2.)*pd,pd));
     dist-=lwd*.5;if(dist<=0.)res=CDD(C,F)<=CDD(C,D)?F:D;}
    else if(SIM(F,D)){if(SIM(C,DF)&&HIG(C,F)){if(!SIM(C,DD)&&!SIM(C,FF))fl=true;}else{if(HIG(C,F))fl=true;if(!SIM(C,Bq)&&SIM4(Bq,F,D,U))fl=true;}
     if(((SIM(F,DB)&&SIM3(U,F,DF))||(SIM(UF,D)&&SIM3(Bq,D,DF)))&&!SIM(C,DF))fl=true;
     if(fl)dist=lwd-DTL(pt,ctr+vec2(1.,-1.)*pd,ctr+vec2(-1.,1.)*pd,-pd);else dist=DTL(pt,ctr+vec2(1.,0.)*pd,ctr+vec2(0.,1.)*pd,pd);
     if(!fl&&SIM3(C,UF,UFF)&&!SIM3(C,UF,FF)&&!SIM(D,UFF))dist=max(dist,DTL(pt,ctr+vec2(1.5,0.)*pd,ctr+vec2(-.5,1.)*pd,pd));
     if(!fl&&SIM3(DDB,DB,C)&&!SIM3(DD,DB,C)&&!SIM(DDB,F))dist=max(dist,DTL(pt,ctr+vec2(1.,-.5)*pd,ctr+vec2(0.,1.5)*pd,pd));
     dist-=lwd*.5;if(dist<=0.)res=CDD(C,F)<=CDD(C,D)?F:D;}
    else if(SIM3(FF,DF,D)&&!SIM3(FF,DF,C)&&!SIM(UFF,D)){if(!(SIM(F,DFF)&&HIG(F,FF))){if(HIG(F,FF))fl=true;if(SIM(UF,FF)&&!SIM(F,DFF)&&!HIG(F,UF))fl=true;}
     if(fl)dist=lwd-DTL(pt,ctr+vec2(2.5,-1.)*pd,ctr+vec2(.5,0.)*pd,-pd);else dist=DTL(pt,ctr+vec2(2.5,0.)*pd,ctr+vec2(.5,1.)*pd,pd);
     dist-=lwd*.5;if(dist<=0.)res=CDD(F,FF)<=CDD(F,DF)?FF:DF;}
    else if(SIM3(F,DF,DD)&&!SIM3(C,DF,DD)&&!SIM(F,DDB)){if(!(SIM(D,DDF)&&HIG(D,DD))){if(HIG(D,DD))fl=true;if(SIM(DB,DD)&&!SIM(D,DDF)&&!HIG(D,DD))fl=true;}
     if(fl)dist=lwd-DTL(pt,ctr+vec2(0.,.5)*pd,ctr+vec2(-1.,2.5)*pd,-pd);else dist=DTL(pt,ctr+vec2(1.,.5)*pd,ctr+vec2(0.,2.5)*pd,pd);
     dist-=lwd*.5;if(dist<=0.)res=CDD(D,DF)<=CDD(D,DD)?DF:DD;}}
   if(res.r>=0.)col=res;}
  return vec4(col,1.);}
 if(m==2){vec2 pos=fract(sp)-.5;vec2 dr=sign(pos);vec2 bs=floor(sp)+.5;vec3 A=TXL(bs),Bq=TXL(bs+vec2(dr.x,0.)),C=TXL(bs+vec2(0.,dr.y)),D=TXL(bs+dr);
  float a=luma(A),b=luma(Bq),cl=luma(C),d=luma(D);float p=abs(pos.x),q=abs(pos.y);float k=distance(pos,vec2(dr.x,0.)),l=distance(pos,vec2(0.,dr.y));float wd1=abs(a-d),wd2=abs(b-cl);
  #define BIL(A_,B_,C_,D_) ((1.-p)*(1.-q)*(A_)+p*(1.-q)*(B_)+(1.-p)*q*(C_)+p*q*(D_))
  vec3 o=BIL(A,Bq,C,D);if(wd1<wd2){if(k<l)C=A+D-Bq;else Bq=A+D-C;}else if(wd1>wd2)D=Bq+C-A;vec3 dt=BIL(A,Bq,C,D);return vec4(clamp(mix(o,dt,smoothstep(0.,max(u_p2*6.,.01),abs(wd2-wd1))),0.,1.),1.);}
 if(m==3){vec2 P4=sp*4.;vec2 fp=fract(P4);vec2 c4=floor(P4)*.25;
  #define T2D(q) {vec3 s00=SRC((q)+vec2(-.25,-.25)),s20=SRC((q)+vec2(.25,-.25)),s22=SRC((q)+vec2(.25,.25)),s02=SRC((q)+vec2(-.25,.25));float m1_=dot(abs(s00-s22),vec3(1.))+.001,m2_=dot(abs(s02-s20),vec3(1.))+.001;tt=.5*(m2_*(s00+s22)+m1_*(s02+s20))/(m1_+m2_);}
  vec3 Cq[9];vec3 tt;for(int j=0;j<3;j++)for(int i=0;i<3;i++){T2D(c4+vec2(float(i-1),float(j-1))*.25)Cq[j*3+i]=tt;}
  #define AAM(A_,B_,C_,D_,OUT) {float m1_=dot(abs((A_)-(B_)),vec3(1.))+.001,m2_=dot(abs((C_)-(D_)),vec3(1.))+.001;OUT=(m2_*((A_)+(B_))+m1_*((C_)+(D_)))/(m1_+m2_);}
  vec3 ul,ur,dl,dr;AAM(Cq[0],Cq[4],Cq[1],Cq[3],ul)AAM(Cq[1],Cq[5],Cq[2],Cq[4],ur)AAM(Cq[3],Cq[7],Cq[6],Cq[4],dl)AAM(Cq[4],Cq[8],Cq[5],Cq[7],dr)
  return vec4(clamp(.5*((dr*fp.x+dl*(1.-fp.x))*fp.y+(ur*fp.x+ul*(1.-fp.x))*(1.-fp.y)),0.,1.),1.);}
 if(m==4){vec4 pb=vec4(floor(wp),ceil(wp));vec4 tb=floor(pb/Bw);vec2 same=step(1e-4,abs(tb.xy-tb.zw));vec2 mt=tb.zw+.5-(Bw*tb.zw-pb.xy)*same;return vec4(SRC(mt),1.);}
 float ext=max((u_p3*.5+.5)/Bw,1./256.);vec2 pix=sp-.5;vec2 bp=floor(pix);vec2 ph=pix-bp;vec3 base=SRC(sp);base*=base;vec3 r=base;
 #define TS(v) sin(1.5707963*clamp((v),-1.,1.))
 if(ext<=.5){vec2 sh=.5+.5*TS((ph-.5)/ext);vec3 s=SRC(bp+.5+sh);r=s*s;}
 else if(ext<1.5){float l=clamp(1.-(ext-1.)/.5,0.,1.);vec4 sxv=TS((ph.x+vec4(1.5,.5,-.5,-1.5))/ext),syv=TS((ph.y+vec4(1.5,.5,-.5,-1.5))/ext);vec2 se=TS((ph-2.5)/ext);
  vec4 wx=.5*(sxv-vec4(sxv.yzw,se.x)),wy=.5*(syv-vec4(syv.yzw,se.y));
  #define UPW(WU,WV) vec3((WU).y/max((WU).x+(WU).y,.001),(WV).y/max((WV).x+(WV).y,.001),dot((WU).xyxy,(WV).xxyy))
  vec3 q0=UPW(wx.xy,wy.xy),q1=UPW(wx.zw,wy.xy),q2=UPW(wx.xy,wy.zw),q3=UPW(wx.zw,wy.zw);vec3 s0=SRC(bp-.5+q0.xy),s1=SRC(bp+vec2(1.5,-.5)+q1.xy),s2=SRC(bp+vec2(-.5,1.5)+q2.xy),s3=SRC(bp+1.5+q3.xy);
  vec3 bl=q0.z*s0*s0+q1.z*s1*s1+q2.z*s2*s2+q3.z*s3*s3;r=mix(base,bl,l);}
 return vec4(sqrt(clamp(r,0.,1.)),1.);`],
 'ports of the RetroArch slang scalers on an N×-enlarged source grid: OmniScale (pattern rules + diagonal solver), cleanEdge (2:1 / 1:2 / 45° slice rules, cleanup), DDT, AA shader 4.0 (4× internal grid), sharp-shimmerless, bandlimit-pixel (sin edge filter in linear light)');

f('dedither','De-dither / Deposterize (sgenpt / Hyllian / PS1)',[S('Method',['sgenpt-mix (Genesis pseudo-transparency)','Checkerboard dedither (Hyllian)','PS1 undither (anti-Bayer)','Deposterize (Hyllian)']),
  P('Pixel size',1,8,1,1,'px'),P('Strength',0,1,1,.01),S('sgenpt blend',['Vertical lines + checkerboard','Vertical lines only','Checkerboard only'])],
 [`int m=int(u_p0+.5);float Bw=max(R(u_p1),1.);vec2 wp=uv*u_res;vec2 bi=floor(wp/Bw);
  #define NB(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).rgb
  if(m==0){float lv=.85*u_p2;int opt=int(u_p3+.5)+1;vec3 C=pow(NB(0,0),vec3(2.)),L=pow(NB(-1,0),vec3(2.)),R_=pow(NB(1,0),vec3(2.));vec3 Yw=vec3(.299,.587,.114);
   vec3 mn=min(C,min(L,R_)),mx=max(C,max(L,R_));float ct=dot(mx-mn,Yw);ct=smoothstep(0.,1.,(1.-lv)*ct);
   if(opt==2){vec3 UL=pow(NB(-1,1),vec3(2.)),UR=pow(NB(1,1),vec3(2.)),DL=pow(NB(-1,-1),vec3(2.)),DR=pow(NB(1,-1),vec3(2.));mn=max(mn,max(min(C,min(DL,DR)),min(C,min(UL,UR))));mx=min(mx,min(max(C,max(DL,DR)),max(C,max(UL,UR))));}
   else if(opt==3){vec3 U=pow(NB(0,1),vec3(2.)),D=pow(NB(0,-1),vec3(2.));mn=max(mn,min(C,min(U,D)));mx=min(mx,max(C,max(U,D)));}
   vec3 cL=.5*(C+L+ct*(C-L)),cR=.5*(C+R_+ct*(C-R_));vec3 o=dot(abs(C-cR),Yw)<dot(abs(C-cL),Yw)?cR:cL;o=clamp(o,mn,mx);return vec4(sqrt(max(o,0.)),1.);}
  if(m==1)return vec4(pow(NB(0,0),vec3(2.)),1.);
  if(m==2){float ix=mod(bi.x,4.),iy=mod(floor((u_res.y-wp.y)/Bw),4.);float LUT[16]=float[16](-4.,0.,-3.,1.,2.,-2.,3.,-1.,-3.,1.,-4.,0.,3.,-1.,2.,-2.);float pt=LUT[int(ix+iy*4.)];return vec4(clamp(NB(0,0)-u_p2*(pt+floor(pt*.25+.5)*2.)/255.,0.,1.),1.);}
  float EQ=.01,DF=.06*max(u_p2,.01);vec3 D=NB(-1,0),E=NB(0,0),F=NB(1,0);
  bool cnd=!any(lessThanEqual(abs(D-F),vec3(EQ)))&&((all(lessThanEqual(abs(E-F),vec3(DF)))&&all(lessThanEqual(abs(D-E),vec3(EQ))))||(all(lessThanEqual(abs(D-E),vec3(DF)))&&all(lessThanEqual(abs(E-F),vec3(EQ)))));
  return vec4(cnd?.5*(D+F):E,1.);`,
  `int m=int(u_p0+.5);if(m==0||m==2)return T(uv);float Bw=max(R(u_p1),1.);vec2 wp=uv*u_res;vec2 bi=floor(wp/Bw);
  #define NB(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).rgb
  if(m==1){float lv=u_p2;vec3 Yw=vec3(.299,.587,.114);vec3 C=NB(0,0),L=NB(-1,0),R_=NB(1,0),U=NB(0,1),D=NB(0,-1);float df=dot(max(C,max(L,R_))-min(C,min(L,R_)),Yw)*(1.-lv);
   vec3 mn=max(min(C,min(L,R_)),min(C,min(U,D))),mx=min(max(C,max(L,R_)),max(C,max(U,D)));vec3 o=clamp(.5*(1.+df)*C+.125*(1.-df)*(L+R_+U+D),mn,mx);return vec4(o,abs(dot(C,Yw)-dot(o,Yw)));}
  float EQ=.01,DF=.06*max(u_p2,.01);vec3 D=NB(0,1),E=NB(0,0),F=NB(0,-1);
  bool cnd=!any(lessThanEqual(abs(D-F),vec3(EQ)))&&((all(lessThanEqual(abs(E-F),vec3(DF)))&&all(lessThanEqual(abs(D-E),vec3(EQ))))||(all(lessThanEqual(abs(D-E),vec3(DF)))&&all(lessThanEqual(abs(E-F),vec3(EQ)))));
  return vec4(cnd?.5*(D+F):E,1.);`,
  `int m=int(u_p0+.5);if(m==0||m==2)return T(uv);float Bw=max(R(u_p1),1.);vec2 wp=uv*u_res;vec2 bi=floor(wp/Bw);
  #define NA(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).a
  #define NO(i,j) pow(O(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).rgb,vec3(2.))
  if(m==1){float df=1.-u_p2;vec3 Yw=vec3(.299,.587,.114);
   #define PTN(A_) step(1e-9,(A_))
   float L=NA(-1,0),R_=NA(1,0),U=NA(0,1),D=NA(0,-1),UL=NA(-1,1),UR=NA(1,1),DL=NA(-1,-1),DR=NA(1,-1),L2=NA(-2,0),R2=NA(2,0),U2=NA(0,2),D2=NA(0,-2),UL2=NA(-2,1),UR2=NA(2,1),DL2=NA(-2,-1),DR2=NA(2,-1),LU2=NA(-1,2),RU2=NA(1,2),LD2=NA(-1,-2),RD2=NA(1,-2);
   float c1=PTN(L*D*R_)+PTN(L*U*R_)+PTN(L*UL*R_*UR+L*DL*R_*DR)+PTN(U*D2*(UL*LD2+UR*RD2)+U2*D*(LU2*DL+RU2*DR));
   float c2=PTN(U*L*D)+PTN(U*R_*D)+PTN(U*UR*D*DR+D*DL*U*UL)+PTN(L*R2*(DL*DR2+UL*UR2)+L2*R_*(DL2*DR+UL2*UR));
   vec3 oC=NO(0,0),oL=NO(-1,0),oR=NO(1,0),oU=NO(0,1),oD=NO(0,-1);vec3 o=oC;
   if(c1*c2>0.&&c1==c2)o=.5*(1.+df)*oC+.125*(1.-df)*(oL+oR+oU+oD);else if(c1>0.&&c1>c2)o=.5*(1.+df)*oC+.25*(1.-df)*(oL+oR);else if(c2>0.&&c2>c1)o=.5*(1.+df)*oC+.25*(1.-df)*(oU+oD);
   return vec4(o,abs(dot(oC,Yw)-dot(o,Yw)));}
  #define NB(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).rgb
  float EQ=.01,DF=.06*max(u_p2,.01);vec3 D=NB(-1,0),E=NB(0,0),F=NB(1,0);
  bool cnd=!any(lessThanEqual(abs(D-F),vec3(EQ)))&&((all(lessThanEqual(abs(E-F),vec3(DF)))&&all(lessThanEqual(abs(D-E),vec3(EQ))))||(all(lessThanEqual(abs(D-E),vec3(DF)))&&all(lessThanEqual(abs(E-F),vec3(EQ)))));
  return vec4(cnd?.5*(D+F):E,1.);`,
  `int m=int(u_p0+.5);if(m==0||m==2)return vec4(T(uv).rgb,1.);float Bw=max(R(u_p1),1.);vec2 wp=uv*u_res;vec2 bi=floor(wp/Bw);
  #define NA(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).a
  if(m==1){
   #define PTN(A_) step(1e-9,(A_))
   float L=NA(-1,0),R_=NA(1,0),U=NA(0,1),D=NA(0,-1),UL=NA(-1,1),UR=NA(1,1),DL=NA(-1,-1),DR=NA(1,-1),L2=NA(-2,0),R2=NA(2,0),U2=NA(0,2),D2=NA(0,-2),L3=NA(-3,0),R3=NA(3,0),U3=NA(0,3),D3=NA(0,-3);
   float cnt=PTN(L)+PTN(R_)+PTN(U)+PTN(D)+PTN(UL*UR*DL*DR);float cn2=PTN(L*UL*U+U*UR*R_+R_*DR*D+D*DL*L);
   vec3 o=T(((bi+.5)*Bw)/u_res).rgb;if(cnt<1.&&cn2<1.)o=pow(O(((bi+.5)*Bw)/u_res).rgb,vec3(2.));return vec4(sqrt(max(o,0.)),1.);}
  #define NB(i,j) T(((bi+vec2(float(i),float(j))+.5)*Bw)/u_res).rgb
  float EQ=.01,DF=.06*max(u_p2,.01);vec3 D=NB(0,1),E=NB(0,0),F=NB(0,-1);
  bool cnd=!any(lessThanEqual(abs(D-F),vec3(EQ)))&&((all(lessThanEqual(abs(E-F),vec3(DF)))&&all(lessThanEqual(abs(D-E),vec3(EQ))))||(all(lessThanEqual(abs(D-E),vec3(DF)))&&all(lessThanEqual(abs(E-F),vec3(EQ)))));
  return vec4(cnd?.5*(D+F):E,1.);`],
 'sgenpt-mix v10 and checkerboard-dedither (Hyllian, 3 passes in gamma-2 light, alpha = luma change), PS1-Undither-AntiBayer (subtracts the PS1 4×4 dither table), Hyllian deposterize (horizontal + vertical step averaging, run twice); per N×N source pixel');

f = add('Sharpen');
f('resamplekernel2','Resampling Kernels II (Spline / Hermite / EWA)',[P('Source pixel size',1,16,4,.5,'px'),S('Kernel',['Hermite (B=0 C=0)','Spline36','Spline64','EWA Robidoux','EWA Ginseng (jinc x sinc window)','Haasnsoft (blurred jinc x hann)']),P('Anti-ringing',0,1,0,.01)],
 [RTS2_DOWN('R(u_p0)'), `${RTS2_SRC('R(u_p0)')}int m=int(u_p1+.5);vec2 p=sp-.5;vec2 i0=floor(p),fr=p-i0;vec3 acc=vec3(0.);float ws=0.;vec3 mn=vec3(1e3),mx=vec3(-1e3);
  #define BJ1(XQ,OUT) {float ax_=abs(XQ);if(ax_<8.){float y_=(XQ)*(XQ);float n_=(XQ)*(72362614232.+y_*(-7895059235.+y_*(242396853.1+y_*(-2972611.439+y_*(15704.4826+y_*(-30.16036606))))));float d_=144725228442.+y_*(2300535178.+y_*(18583304.74+y_*(99447.43394+y_*(376.9991397+y_))));OUT=n_/d_;}else{float z_=8./ax_;float y_=z_*z_;float xx_=ax_-2.356194491;float a1_=1.+y_*(.00183105+y_*(-.00003516396496+y_*(.000002457520174+y_*(-.000000240337019))));float a2_=.04687499995+y_*(-.0002002690873+y_*(.000008449199096+y_*(-.00000088228987+y_*.000000105787412)));OUT=sqrt(.636619772/ax_)*(cos(xx_)*a1_-z_*sin(xx_)*a2_);if((XQ)<0.)OUT=-OUT;}}
  #define JINC(XQ,OUT) {if(abs(XQ)<1e-4)OUT=1.;else{float j_;BJ1(3.14159265*(XQ),j_)OUT=2.*j_/(3.14159265*(XQ));}}
  for(int j=-3;j<=4;j++)for(int i=-3;i<=4;i++){vec2 d=vec2(float(i),float(j))-fr;float w=0.;
   if(m<=2){float kx[2];for(int t=0;t<2;t++){float x=abs(t==0?d.x:d.y);float k=0.;
     if(m==0)k=x<1.?(2.*x-3.)*x*x+1.:0.;
     else if(m==1){if(x<1.)k=((13./11.*x-453./209.)*x-3./209.)*x+1.;else if(x<2.){float q=x-1.;k=((-6./11.*q+270./209.)*q-156./209.)*q;}else if(x<3.){float q=x-2.;k=((1./11.*q-45./209.)*q+26./209.)*q;}}
     else{if(x<1.)k=((49./41.*x-6387./2911.)*x-3./2911.)*x+1.;else if(x<2.){float q=x-1.;k=((-24./41.*q+4032./2911.)*q-2328./2911.)*q;}else if(x<3.){float q=x-2.;k=((6./41.*q-1008./2911.)*q+582./2911.)*q;}else if(x<4.){float q=x-3.;k=((-1./41.*q+168./2911.)*q-97./2911.)*q;}}
     kx[t]=k;}w=kx[0]*kx[1];}
   else{float r=length(d);if(m==3){float bb=.37821575509399867,cc=.31089212245300067;w=r<1.?((12.-9.*bb-6.*cc)*r*r*r+(-18.+12.*bb+6.*cc)*r*r+(6.-2.*bb))/6.:r<2.?((-bb-6.*cc)*r*r*r+(6.*bb+30.*cc)*r*r+(-12.*bb-48.*cc)*r+(8.*bb+24.*cc))/6.:0.;}
    else{float R0=3.2383;float rb=m==5?r/1.11:r;if(r<R0){float jk;JINC(rb,jk)float wn;if(m==4){float z=3.14159265*r/R0;wn=z<1e-4?1.:sin(z)/z;}else wn=.5+.5*cos(3.14159265*r/R0);w=jk*wn;}}}
   vec3 v=TXL(i0+vec2(float(i),float(j))+.5);acc+=w*v;ws+=w;if(i>=0&&i<=1&&j>=0&&j<=1){mn=min(mn,v);mx=max(mx,v);}}
  vec3 o=acc/ws;o=mix(o,clamp(o,mn,mx),u_p2);return vec4(clamp(o,0.,1.),1.);`],
 'mpv/libplacebo filters: Hermite (B=C=0), Spline36 / Spline64 (Panorama Tools splines), EWA (polar) Robidoux (Keys B=.3782 C=.3109, radius 2), Ginseng (jinc × sinc window, radius 3.2383), Haasnsoft (jinc blur 1.11 × hann window); anti-ringing clamps to the nearest 2×2 texels');

f('ssimscale','SSIM Super-Res / Downscaler (mpv, Shiandow / igv)',[S('Mode',['SSimSuperRes (upscale refinement)','SSimDownscaler (perceptual downscale)']),P('Scale factor (source pixel size)',2,8,3,1,'px'),P('Strength',0,1,1,.01)],
 [RTS2_DOWN('R(u_p1)'),
  `int m=int(u_p0+.5);${RTS2_SRC('R(u_p1)')}
  if(m==0){vec2 p=sp-.5;vec2 i0=floor(p),fr=p-i0;vec3 acc=vec3(0.);float ws=0.;for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec2 d=abs(vec2(float(i),float(j))-fr);vec2 k;
    for(int t=0;t<2;t++){float x=t==0?d.x:d.y;float kk=x<1.?(1.5*x-2.5)*x*x+1.:x<2.?((-.5*x+2.5)*x-4.)*x+2.:0.;if(t==0)k.x=kk;else k.y=kk;}float w=k.x*k.y;acc+=w*TXL(i0+vec2(float(i),float(j))+.5);ws+=w;}
   return vec4(clamp(acc/ws,0.,1.),1.);}
  vec2 kc=floor(sp);vec3 L=TXL(kc+.5);vec3 mL=vec3(0.);float mL2=0.,mH2=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 t=T((clamp(kc+vec2(float(i),float(j)),vec2(0.),SS-1.)+.5)/u_res);mL+=t.rgb;mL2+=luma(t.rgb)*luma(t.rgb);mH2+=t.a;}
  mL/=9.;mL2/=9.;mH2/=9.;float ml=luma(mL);float sl=max(mL2-ml*ml,1e-6),sh=max(mH2-ml*ml,1e-6);float Rr=clamp(sqrt(sh/sl),0.,4.);vec3 d=mL+Rr*(L-mL);return vec4(clamp(mix(L,d,u_p2),0.,1.),1.);`,
  `int m=int(u_p0+.5);if(m==1)return T(uv);float Bw=max(R(u_p1),1.);vec2 SS=ceil(u_res/Bw);vec2 sp=uv*u_res/Bw;vec2 p=sp-.5;vec2 i0=floor(p),fr=p-i0;vec3 corr=vec3(0.);
  for(int j=0;j<=1;j++)for(int i=0;i<=1;i++){vec2 kc=clamp(i0+vec2(float(i),float(j)),vec2(0.),SS-1.);vec3 Lk=vec3(0.),Dk=vec3(0.);
   for(int b=0;b<4;b++)for(int a=0;a<4;a++){vec2 q=min(floor(kc*Bw+(vec2(float(a),float(b))+.5)*Bw*.25)+.5,u_res-.5)/u_res;Lk+=O(q).rgb;Dk+=T(q).rgb;}
   float w=(i==0?1.-fr.x:fr.x)*(j==0?1.-fr.y:fr.y);corr+=w*(Lk-Dk)/16.;}
  return vec4(clamp(T(uv).rgb+u_p2*corr,0.,1.),1.);`],
 'SSimSuperRes: Catmull-Rom upscale of the N×N-block source, then one back-projection step (the upscale is box-downscaled, compared with the source and the bilinear-upsampled residual added) (approx.); SSimDownscaler: Öztireli & Gross 2015 perceptual downscale d = m + (s_hi/s_lo)(l − m) over 3×3 low-res patches (luma statistics; approx.)');

f('chromaupscale','Chroma Upscaling (KrigBilateral / CfL)',[S('Method',['Nearest (raw subsampled chroma)','Bilinear','KrigBilateral (luma-guided, approx.)','CfL (chroma from luma regression)']),P('Chroma subsampling',2,4,2,1,'x'),S('Show',['Result','Chroma error x4'])],
 [`float Bw=max(R(u_p1),1.);vec2 SS=ceil(u_res/Bw);vec2 w=floor(uv*u_res);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);
  vec3 a=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 q=floor(w*Bw+(vec2(float(i),float(j))+.5)*Bw*.25)+.5;vec3 v=O(min(q,u_res-.5)/u_res).rgb;a+=vec3(dot(v,vec3(.299,.587,.114)),dot(v,vec3(-.168736,-.331264,.5)),dot(v,vec3(.5,-.418688,-.081312)));}
  a/=16.;return vec4(a.x,a.yz+.5,1.);`,
  `int m=int(u_p0+.5);${RTS2_SRC('R(u_p1)')}vec3 org=O(uv).rgb;float Y=dot(org,vec3(.299,.587,.114));vec2 ch;
  if(m==0)ch=TXL(sp).gb;else if(m==1)ch=SRC(sp).gb;
  else{vec2 p=sp-.5;vec2 i0=floor(p),fr=p-i0;
   if(m==2){vec2 acc=vec2(0.);float ws=0.;for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec3 s=TXL(i0+vec2(float(i),float(j))+.5);vec2 d=vec2(float(i),float(j))-fr;float dy=Y-s.r;float wsp=exp(-dot(d,d)/1.2);float wr=exp(-dy*dy/(2.*.004));float w=wsp*(wr+.002);acc+=w*s.gb;ws+=w;}ch=acc/ws;}
   else{float sy=0.,syy=0.,n=0.;vec2 sc=vec2(0.),syc=vec2(0.);vec2 mnc=vec2(1.),mxc=vec2(0.);for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec3 s=TXL(i0+vec2(float(i),float(j))+.5);vec2 d=vec2(float(i),float(j))-fr;float wq=exp(-dot(d,d)/4.);
     sy+=wq*s.r;syy+=wq*s.r*s.r;sc+=wq*s.gb;syc+=wq*s.r*s.gb;n+=wq;if(i>=0&&i<=1&&j>=0&&j<=1){mnc=min(mnc,s.gb);mxc=max(mxc,s.gb);}}
    float my=sy/n;vec2 mc=sc/n;float vy=syy/n-my*my;vec2 cv=syc/n-my*mc;vec2 al=cv/max(vy,1e-5);vec2 cfl=mc+al*(Y-my);vec2 bl=SRC(sp).gb;
    float rw=clamp(vy*400.,0.,1.);ch=mix(bl,clamp(cfl,mnc-.02,mxc+.02),rw);}}
  ch-=.5;vec3 o=vec3(Y+1.402*ch.y,Y-.344136*ch.x-.714136*ch.y,Y+1.772*ch.x);if(u_p2>.5)return vec4(clamp(.5+(o-org)*4.,0.,1.),1.);return vec4(clamp(o,0.,1.),1.);`],
 'simulates N:1 chroma subsampling (BT.601 YCbCr, box-averaged chroma) and reconstructs it with full-res luma: KrigBilateral (igv) approximated as luma-range × spatial weighted 4×4 kriging; CfL (Artoriuz) = local weighted linear regression chroma = α·luma + β, blended by luma variance and clamped to the nearest chroma');

f('adaptivesharpen','AdaptiveSharpen (bacondither)',[P('Strength (curve height)',0,2,1,.01),P('Overshoot limit',0,1,.3,.01)],
 [`vec2 e=u_px;vec3 cc=T(uv).rgb;vec3 n[9];int k=0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){n[k]=T(uv+vec2(float(i),float(j))*e).rgb;k++;}
  vec3 bl=(2.*(n[1]+n[3]+n[5]+n[7])+(n[0]+n[2]+n[6]+n[8])+4.*n[4])/16.;vec3 s=vec3(0.);for(int i=0;i<9;i++)s+=abs(bl-n[i]);float edge=length(s)*1.2;return vec4(cc,clamp(edge,0.,1.));`,
  `vec2 e=u_px;vec4 c0=T(uv);float ed=c0.a;vec3 sum=vec3(0.);float ws=0.;vec3 mn=c0.rgb,mx=c0.rgb;
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){int ad=(i<0?-i:i)+(j<0?-j:j);if(ad==0||ad>2)continue;vec4 t=T(uv+vec2(float(i),float(j))*e);float w=(ad==1?1.:.5)/(1.+abs(t.a-ed)*12.);sum+=t.rgb*w;ws+=w;if(ad==1){mn=min(mn,t.rgb);mx=max(mx,t.rgb);}}
  vec3 bl=sum/ws;vec3 sd=c0.rgb-bl;float amt=u_p0*mix(.3,1.,smoothstep(.02,.25,ed));float ld=luma(sd)*amt*2.;vec3 o=c0.rgb+ld;
  float lim=u_p1*.25;vec3 hi=mx+lim*(mx-mn)+.002,lo=mn-lim*(mx-mn)-.002;o=mix(o,min(o,hi)+.25*max(o-hi,0.),step(hi,o));o=mix(o,max(o,lo)-.25*max(lo-o,0.),step(o,lo));return vec4(clamp(o,0.,1.),1.);`],
 'mpv AdaptiveSharpen idea: edge map from the 3×3 blur residual (pass 1), luma sharpening against an edge-similarity weighted 12-tap diamond blur, stronger on edges than flat areas, with soft-compressed overshoot beyond the local min/max (approx., not the exact tuned curves)');
