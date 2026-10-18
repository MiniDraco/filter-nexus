/* ================= q15: RetroArch handheld LCD shaders + NTSC shaders (round 12, ports of libretro/slang-shaders) ================= */
const Q15_HASH = `
 #define Q15H(pp) fract((fract(vec3((pp).xyx)*.1031).x+fract(vec3((pp).xyx)*.1031).y+2.*dot(fract(vec3((pp).xyx)*.1031),fract(vec3((pp).xyx)*.1031).yzx+33.33))*(fract(vec3((pp).xyx)*.1031).z+dot(fract(vec3((pp).xyx)*.1031),fract(vec3((pp).xyx)*.1031).yzx+33.33)))
 `;

f = add('Retro');
f('q15_handheldlcd','Handheld LCD Shaders II (agb001 / ags001 / authentic_gbc / sameboy / simpletex / lcd1x_psp / retro-v3 / mega-blocks)',
 [S('Shader',['agb001 (GBA LCD, mGBA)','ags001 (GBA SP frontlight, mGBA)','authentic_gbc (GBC subpixels)','sameboy-lcd','simpletex_lcd (textured paper)','lcd1x_psp','retro-v3','mega-blocks-brick','mega-blocks-dome']),
  P('Source pixel size',2,16,6,1,'px'),P('Amount',0,1,1,.01)],
 [RTS_DOWN('R(u_p1)'), `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);vec2 sp=uv*SF;vec3 base=TXL(sp);vec3 o=base;
  vec2 cf=vec2(fract(sp.x),1.-fract(sp.y));
  if(m<=1){
   #define Q15_AG(QQ,OUT) {vec2 qq_=(QQ);vec3 cc_=TXL((qq_+.5)*.25);float mx_=mod(qq_.x,4.);float my_=mod(SF.y*4.-1.-qq_.y,4.);vec3 ax_=mx_<.5?vec3(1.,.2,.2):mx_<1.5?vec3(.2,1.,.2):mx_<2.5?vec3(.2,.2,1.):vec3(.4);float ay_=my_>2.5?(m==0?.8:.9):1.;cc_=m==0?pow(cc_*.8,vec3(1.8))+.16:pow(cc_,vec3(1.6));OUT=cc_*ax_*ay_;}
   #define Q15_AGB(PP,OUT) {vec2 q4_=(PP)*4.-.5;vec2 i4_=floor(q4_),f4_=q4_-i4_;vec3 a_,b_,c_,d_;Q15_AG(i4_,a_)Q15_AG(i4_+vec2(1.,0.),b_)Q15_AG(i4_+vec2(0.,1.),c_)Q15_AG(i4_+vec2(1.,1.),d_)OUT=mix(mix(a_,b_,f4_.x),mix(c_,d_,f4_.x),f4_.y);}
   Q15_AGB(sp,o)
   if(m==1){vec2 rv=vec2(uv.x,1.-uv.y);float s_=(2.-.5)/(2.+.5);vec2 rad=(rv-.5)*vec2(2.5*s_);rad=pow(abs(rad),vec2(4.));vec3 bleed=vec3(.12,.14,.19)+(dot(rad,rad)+vec3(.02,.03,.05))*vec3(.14,.18,.2);
    vec3 rf;Q15_AGB(sp+vec2(0.,.025*SF.y),rf)o+=bleed+rf*.07;}}
  else if(m==2){float Bx=Bw;vec2 ssz=Bx*mix(vec2(.296,.910),vec2(.75,.93),.6);vec2 nsz=Bx*mix(vec2(.115,.166),vec2(.29,.17),.6);vec4 r1=vec4(0.,0.,ssz.x,ssz.y-nsz.y),r2=vec4(nsz.x,ssz.y-nsz.y,ssz.x,ssz.y);vec2 offs=(vec2(Bx)-ssz)*.5;float bl=.3*Bx*.5;
   #define Q15_IBR(PX,RC,OUT) {vec4 rg_=((RC).zw-(RC).xy).xyxy;vec4 ln_=clamp((PX)-(RC).xyxy,vec4(0.),rg_);vec4 ce_=(.5*((RC).xy+(RC).zw)).xyxy;vec4 dc_=abs((PX)-ce_);vec4 bv_=vec4(bl);vec4 xn_=max(.5*(max(rg_,bv_)+bv_)-dc_,vec4(0.))/bv_;vec4 po_=((-.3635*xn_+.727)*xn_+.1365)*xn_*xn_*min(rg_,bv_);vec4 tr_=mix(po_,rg_-po_,step(ce_,(PX)));vec4 rs_=mix(ln_,tr_,step(.5*(rg_-bv_),dc_));OUT=(rs_.z-rs_.x)*(rs_.w-rs_.y);}
   #define Q15_COV(OR,OUT) {float c1_,c2_;vec4 o4_=(OR).xyxy;Q15_IBR(vec4(-.5,-.5,.5,.5),o4_+r1,c1_)Q15_IBR(vec4(-.5,-.5,.5,.5),o4_+r2,c2_)OUT=c1_+c2_;}
   vec2 txc=vec2(sp.x,SF.y-sp.y);vec2 ti=floor(txc),tf=txc-ti;vec2 tof=step(vec2(.5),tf)*2.-1.;vec3 res=vec3(0.);
   for(int k=0;k<4;k++){vec2 dd=k==0?vec2(0.):k==1?vec2(tof.x,0.):k==2?vec2(0.,tof.y):tof;vec3 smp=pow(TXL(vec2(ti.x+dd.x+.5,SF.y-(ti.y+dd.y+.5))),vec3(2.2));vec2 tor=(dd-tf)*Bx;
    float cr,cg,cb;Q15_COV(tor+vec2(offs.x-Bx/3.,offs.y),cr)Q15_COV(tor+offs,cg)Q15_COV(tor+vec2(offs.x+Bx/3.,offs.y),cb)res+=vec3(cr,cg,cb)*smp;}
   o=pow(max(res,0.),vec3(1./2.2));}
  else if(m==3){vec2 pos=cf;vec2 sub=fract(vec2(sp.x,SF.y-sp.y)*6.);float LO=.8,HI=1.,SD=.1;vec3 ce=base,le=TXL(sp-vec2(1.,0.)),ri=TXL(sp+vec2(1.,0.));
   if(pos.y<1./6.){float t_=.5-sub.y/2.;ce=mix(ce,TXL(sp+vec2(0.,1.)),t_);le=mix(le,TXL(sp+vec2(-1.,1.)),t_);ri=mix(ri,TXL(sp+vec2(1.,1.)),t_);float k_=sub.y*SD+(1.-SD);ce*=k_;le*=k_;ri*=k_;}
   else if(pos.y>5./6.){float t_=sub.y/2.;ce=mix(ce,TXL(sp-vec2(0.,1.)),t_);le=mix(le,TXL(sp+vec2(-1.,-1.)),t_);ri=mix(ri,TXL(sp+vec2(1.,-1.)),t_);float k_=(1.-sub.y)*SD+(1.-SD);ce*=k_;le*=k_;ri*=k_;}
   vec3 ml=mix(le,ce,.5),mr=mix(ri,ce,.5);float sx=sub.x;
   if(pos.x<1./6.)o=mix(vec3(HI*ce.r,LO*ce.g,HI*le.b),vec3(HI*ce.r,LO*ce.g,LO*le.b),sx);
   else if(pos.x<2./6.)o=mix(vec3(HI*ce.r,LO*ce.g,LO*le.b),vec3(HI*ce.r,HI*ce.g,LO*ml.b),sx);
   else if(pos.x<3./6.)o=mix(vec3(HI*ce.r,HI*ce.g,LO*ml.b),vec3(LO*mr.r,HI*ce.g,LO*ce.b),sx);
   else if(pos.x<4./6.)o=mix(vec3(LO*mr.r,HI*ce.g,LO*ce.b),vec3(LO*ri.r,HI*ce.g,HI*ce.b),sx);
   else if(pos.x<5./6.)o=mix(vec3(LO*ri.r,HI*ce.g,HI*ce.b),vec3(LO*ri.r,LO*mr.g,HI*ce.b),sx);
   else o=mix(vec3(LO*ri.r,LO*mr.g,HI*ce.b),vec3(HI*ri.r,LO*ri.g,HI*ce.b),sx);}
  else if(m==4){vec3 col=pow(base,vec3(1.05));vec2 dfc=abs(floor(sp)+.5-sp);float xs=max(dfc.x,dfc.y);xs*=xs;float xq=xs*xs;float lw=48.*(xq-(8./3.)*xq*xs);lw=lw*(lw+(1.-lw)*.65)*.65;float lu=dot(col,vec3(.2126,.7152,.0722));lw*=lu+(1.-lu)*(1.-.6);
   col=mix(col,vec3(1.),lw);vec2 bp=floor(uv*u_res/u_k);float fib=.55*vnoise(bp*vec2(.9,.12))+.45*vnoise(bp*vec2(.12,.9));vec3 pap=vec3(.95,.93,.88)*(.86+.1*fbm(bp*.03)+.06*fib)+.03*(hash(bp)-.5);vec3 bgt=pap*col;lu=dot(col,vec3(.2126,.7152,.0722));o=mix(col,bgt,lu);}
  else if(m==5){vec2 an=6.2831853*(vec2(sp.x,SF.y-sp.y)-.25);float yf=(16.+sin(an.y))/17.,xf=(4.+sin(an.x))/5.;vec3 cl=pow(base,vec3(2.21));cl=mat3(.98,.04,.01,.20,.795,.01,-.18,.165,.98)*cl;cl=clamp(pow(max(cl,0.),vec3(1./2.2)),0.,1.);o=yf*xf*cl;}
  else if(m==6){vec2 p=vec2(sp.x,SF.y-sp.y)+.5;vec2 i=floor(p),f_=p-i;f_=f_*f_*f_*(f_*(f_*6.-15.)+10.);vec2 np=i+f_-.5;vec3 E=pow(SRC(vec2(np.x,SF.y-np.y)),vec3(2.2));vec2 fp=fract(np);float ps=1./Bw;vec2 fr=clamp(clamp(fp+.5*ps,0.,1.)-.5,vec2(0.),vec2(ps))/ps;float mc=max(fr.x,fr.y);vec3 rs=mix(E*(1.04+fp.x*fp.y),E*.36,mc);o=clamp(pow(1.36*rs,vec3(1./2.2)),0.,1.);}
  else if(m==7){vec2 bw=max(floor(Bw*.145898+.5),1.)/vec2(Bw);vec2 sl=clamp(min(cf,1.-cf)/bw,0.,1.);float ie=1.-min(sl.x,sl.y);float gr=-dot(cf-.5,vec2(.70710678))*2.;float hl=max(gr,0.)*.9,sh=min(gr,0.);vec2 sd=min(uv,1.-uv);sh*=smoothstep(0.,1./max(SF.x,SF.y),min(sd.x,sd.y));o=clamp(base+base*(hl+sh)*ie*.27,0.,1.);}
  else{vec2 cu=mix(cf,vec2(0.),step(vec2(.9999),cf));vec2 ps2=floor(cu*Bw)/max(Bw-1.,1.);float fld=.70710678-length(ps2);float shd=min(fld,0.)+max(fld,0.)*.9;o=clamp(base+base*shd*.27,0.,1.);}
  return vec4(clamp(mix(base,o,u_p2),0.,1.),1.);`],
 'ports of RetroArch handheld/ shaders at their preset defaults, applied to a virtual low-res source (Source pixel size = one console pixel): agb001 / ags001 (endrift, mGBA): 4x subpixel stripes RGB+grey with darker 4th row, AGB gamma .8^1.8 +.16 lift, bilinear stock upscale; ags001-light frontlight bleed + reflection .07 at 0.025; authentic_gbc v2.2 (linearised, analytic blurred-rectangle coverage of notched subpixels, brightness .6, smoothing .3); sameboy-lcd (6-step subpixel ramp, colour low .8, scanline depth .1); simpletex_lcd (zfast line weighting, grid .65/.65/bias .6, darken .05; the paper PNG replaced by procedural paper - approx.); lcd1x_psp (sine LCD 4 / scanline 16 at one cycle per source pixel + PSP colour matrix, gamma 2.21); retro-v3 (quintic pixel interpolation, pixel size .5, boost 1.36); mega-blocks brick (bevel .27, highlight .9, light from top-left) / dome (radial stud field)');

f('q15_handheldlight','Handheld LCD Lighting (pixel_transparency / sunlight_shimmer / frontlit-reflective)',
 [S('Shader',['pixel_transparency (reflective GBC backing, shadows)','sunlight_shimmer (pixel_transparency + glare + rainbow film)','frontlit-reflective (front-lit reflective LCD, point light)']),
  P('Source pixel size',1,12,4,1,'px'),P('Light shift X',-1,1,0,.01),P('Light shift Y',-1,1,0,.01)],
 [RTS_DOWN('R(u_p1)'), `${RTS_SRC('R(u_p1)')}${Q15_HASH}int m=int(u_p0+.5);vec2 sp=uv*SF;vec3 org=TXL(sp);vec2 rv=vec2(uv.x,1.-uv.y);float asp_=u_res.x/u_res.y;vec3 oc=org;
  if(m<=1){float PAL=m==0?1.:3.,POL=m==0?0.:1.,HIL=m==0?0.:.05;
   #define Q15_BR(cc) dot((cc),vec3(.2126,.7152,.0722))
   #define Q15_SC(qq) ((any(lessThan((qq),vec2(0.)))||any(greaterThanEqual((qq),vec2(1.))))?1.:1.-Q15_BR(TXL(vec2((qq).x,1.-(qq).y)*SF)))
   vec3 lcd=org;float br=Q15_BR(org);bool wh=br>.9&&min(org.r,min(org.g,org.b))>.81;float pa=clamp((.2*br)*2.665,0.,1.);
   vec2 pn=rv*.25*512.;float gn=0.,am=.5,fq=1.;for(int i=0;i<3;i++){gn+=Q15H(pn*fq)*am;am*=.5;fq*=2.;}vec3 bg=vec3(.48+(gn-.4375)*.065);
   float ssf=sqrt(u_res.x/640.*u_res.y/480.);vec2 tx=1./u_res;vec2 so=-vec2(3.,3.)*ssf*tx;vec2 bd=1.*ssf*tx;float bsh=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w_=(i==0&&j==0)?4.:(i==0||j==0)?2.:1.;bsh+=Q15_SC(rv+so+vec2(float(i),float(j))*bd)*w_;}
   float shs=bsh/16.*.5;float dz=(1.-.9)*.5;shs=smoothstep(0.,dz,shs)*shs;bg=mix(bg,bg*.2,shs);
   vec3 pc=PAL<1.5?vec3(.651,.675,.518):vec3(.766,.73,.763);pc*=.675/max(pc.r,max(pc.g,pc.b));bg=clamp(pc+mix(vec3(-1.),vec3(1.),bg),0.,1.);
   oc=mix(lcd,bg,pa);if(POL>.5)oc*=vec3(.94,1.,.865);if(HIL>.001){float l_=Q15_BR(oc);oc=clamp(oc*(1.+HIL*l_),0.,1.);}
   if(m==1){vec2 lp=vec2(.5,.5)+vec2(u_p2,-u_p3)*.5;vec2 tl=(rv-lp)*vec2(asp_,1.);float d2=dot(tl,tl);float dxy=length(tl);float ai=clamp(dxy*1.8,0.,1.4);float st_=sin(ai)/1.5;float ge=275.*sqrt(1.-st_*st_);
    vec2 np=vec2(rv.x*asp_,rv.y)*.6*8.;float fn=0.;am=.5;fq=1.;for(int i=0;i<3;i++){vec2 pp=np*fq;vec2 ii=floor(pp),ff=fract(pp);ff=ff*ff*(3.-2.*ff);fn+=mix(mix(Q15H(ii),Q15H(ii+vec2(1.,0.)),ff.x),mix(Q15H(ii+vec2(0.,1.)),Q15H(ii+vec2(1.,1.)),ff.x),ff.y)*am;am*=.5;fq*=2.;}
    ge*=1.+(fn-.4375)*.5;vec3 S0[7]=vec3[7](vec3(0.,0.,.026075),vec3(.141223,0.,.368894),vec3(0.,.480861,.473477),vec3(.081095,.812848,.339825),vec3(.783356,.793891,.134941),vec3(.972432,.423991,.215476),vec3(.648322,.11443,0.));
    float K0[7]=float[7](.031415927,.028399638,.025874228,.023809524,.021991149,.020462441,.01913857);vec3 tn=vec3(0.);for(int i=0;i<7;i++){float c_=cos(K0[i]*ge);tn+=S0[i]*c_*c_;}tn/=max(max(tn.r,max(tn.g,tn.b)),.001);
    float ts=.18*mix(.03,1.,Q15_BR(org));tn*=org*org;vec3 tt=oc*mix(vec3(1.),tn,ts);float l0=Q15_BR(oc),l1=Q15_BR(tt);if(l1>.001)tt*=l0/l1;oc=tt;
    float gs=exp(-d2/(2.*.25*.25))*.15;oc=mix(oc,vec3(1.),clamp(gs,0.,.85));}}
  else{vec2 lc=vec2(.72*.5+.5,-.89*.5+.5)+vec2(u_p2,-u_p3)*.5;float amb=.15,pb=.65,fo=.8;
   #define Q15_ILL(FF) clamp(amb+pb*exp(-dot((rv-lc)*vec2(asp_,1.),(rv-lc)*vec2(asp_,1.))/(2.*(1.-(FF))*(1.-(FF)))),0.,1.)
   vec3 cl=pow(org,vec3(2.2));vec3 inv=1.-cl;float Li=Q15_ILL(fo);cl=max(cl,vec3(.35*pow(Li,1.5)));cl=pow(cl,vec3(max(1.-.6*pow(Li,1.2),.4)));cl=clamp(cl,0.,1.);float bs=1.*5.*pow(Li,1.5);cl*=mix(vec3(1.),vec3(1.-.05*Li,1.,1.-.08*Li),bs);
   cl=pow(max(cl,0.),vec3(1./2.2));float lu=dot(cl,vec3(.299,.587,.114));vec3 blk=pow(cl,vec3(1./amb));cl=mix(blk,cl,(amb+pb)/2.);float fl=Q15_ILL(fo),il=Q15_ILL(fo/1.25);cl=mix(blk,mix(inv*lu,cl,fl),il);
   vec2 dp=rv*vec2(asp_,1.)*3.;float da=smoothstep(.45,.8,fbm(dp+3.1))*.8+.2*smoothstep(.6,.9,vnoise(dp*9.));vec3 dg=vec3(.62,.6,.56)*(.8+.2*fbm(dp*4.));cl=mix(cl,dg,da*.3*clamp(amb+fl,0.,1.));oc=cl;}
  return vec4(clamp(oc,0.,1.),1.);`],
 'ports of RetroArch handheld/shaders/pixel_transparency v2.3 (Mr. Hylian-style reflective backing: bright pixels let a grainy warm/neutral backing show through (base alpha .2), dark pixels cast a blurred drop shadow offset 3,3 px at 640x480 reference scale, palette tint, smooth 9-tap shadow blur), sunlight_shimmer (adds glare .15 / spread .25 and the quarter-wave-plate rainbow film tint: 7 wavelengths, retardation 275 nm, splotchy film noise .5) and frontlit-reflective (ambient .15 + Gaussian point light .65 at (.72,.89), black lift / gamma shift, green bias, negative-image falloff; the dirt LUT texture is replaced by procedural fbm smudges - approx.); Light shift moves the glare / point light; no accelerometer / animation');

f('q15_ntsc','NTSC Shaders II (mame-ntsc / blastem / tiny_ntsc / ntsc-xot / artifact-colors / ntsc-adaptive / patchy / analog_overshoot)',
 [S('Shader',['mame-ntsc (MAME HLSL NTSC + postproc)','ntsc-blastem (BlastEm Genesis)','tiny_ntsc (DariusG)','ntsc-xot (xot composite decoder)','artifact-colors (Apple II / CGA style)','ntsc-adaptive (guest, 3-phase)','patchy-snes (approx.)','patchy-blastem (approx.)','analog_overshoot (Hermite ringing)']),
  P('Source pixel size',2,8,2,1,'px'),P('Saturation',0,2,1,.01),P('Artifacts / comb',0,2,1,.01)],
 [RTS_DOWN('R(u_p1)'),
  `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);vec2 sp=uv*SF;float line=floor(SF.y-sp.y);float sat_=u_p2,art=u_p3;vec3 o=SRC(sp);const float PI_=3.14159265;
  #define Q15_YIQ(cc) vec3(dot((cc),vec3(.2989,.587,.114)),dot((cc),vec3(.5959,-.2744,-.3216)),dot((cc),vec3(.2115,-.5229,.3114)))
  #define Q15_RGB(qq) vec3(dot((qq),vec3(1.,.956,.621)),dot((qq),vec3(1.,-.272,-.6474)),dot((qq),vec3(1.,-1.106,1.7046)))
  #define Q15_SNC(aa) (abs(aa)<1e-6?1.:sin(aa)/(aa))
  if(m==0){float NX=320.;float tps=52.6/(NX*4.);float y1_=(3.59754545-2.)*tps,y2_=(3.59754545+2.)*tps,y3_=6.*tps,fi=1.2*tps,fq=.6*tps;float cyc=52.6*3.59754545;float ux=sp.x/SF.x;
   float lph=fract(fract(cyc)*(floor(SF.y-sp.y)+1.));vec3 acc=vec3(0.);
   for(int k=-31;k<=32;k++){float fk=float(k);float xx=sp.x+fk*.25;vec3 q=Q15_YIQ(SRC(vec2(xx,sp.y)));float wt=6.2831853*(fract(cyc*(xx/NX)+lph));float Cc=q.x+q.y*cos(wt)+q.z*sin(wt);
    float cw=.54+.46*cos(6.2831853/63.*fk);float iy=2.*y1_*Q15_SNC(6.2831853*y1_*fk)-2.*y2_*Q15_SNC(6.2831853*y2_*fk)+2.*y3_*Q15_SNC(6.2831853*y3_*fk);
    acc+=vec3(Cc*cw*iy,Cc*cos(wt)*cw*2.*fi*Q15_SNC(6.2831853*fi*fk),Cc*sin(wt)*cw*2.*fq*Q15_SNC(6.2831853*fq*fk));}
   acc.yz*=2.*sat_;o=Q15_RGB(acc);}
  else if(m==1){float ph[7],ry[7],riq[7];float cs=.8*art;float ya=(1.-sp.y/SF.y);ya=ya-ya/SF.y;
   for(int n=0;n<7;n++){float xp=sp.x-float(n)*.46875;ph[n]=xp*3.1415926/.9375;vec3 c1=SRC(vec2(xp,sp.y)),c2=SRC(vec2(xp,(1.-ya)*SF.y));
    #define Q15_BQ(cc) vec3(dot((cc),vec3(.3,.59,.11)),dot((cc),vec3(.599,-.2773,-.3217)),dot((cc),vec3(.213,-.5251,.3121)))
    vec3 a1=Q15_BQ(c1),a2=Q15_BQ(c2);float r1=a1.x+a1.y*sin(ph[n])+a1.z*cos(ph[n]),r2=a2.x+a2.y*sin(ph[n]+3.1415926)+a2.z*cos(ph[n]+3.1415926);ry[n]=(r1+r2)*.5;riq[n]=r1-(r1+r2)*(cs*.5);}
   float W7[7]=float[7](.125,.25,.375,.5,.375,.25,.125);float ym=(ry[0]+ry[1]+ry[2]+ry[3])*.25,im=0.,qm=0.;for(int n=0;n<7;n++){im+=W7[n]*riq[n]*sin(ph[n]);qm+=W7[n]*riq[n]*cos(ph[n]);}
   im*=sat_;qm*=sat_;o=vec3(ym+im*.9469+qm*.6236,ym-im*.2748-qm*.6357,ym-im*1.1+qm*1.7);}
  else if(m==2){float cy=PI_/1.5;vec2 op2=vec2(sp.x,SF.y-sp.y);float phy=mod(floor(op2.y),3.)*cy*2.;vec3 fin=vec3(0.);float sm=0.,sY=0.;float cmb=.4*art;
   #define Q15_YU(cc) vec3(dot((cc),vec3(.299,.587,.114)),dot((cc),vec3(-.299,-.587,.886)),dot((cc),vec3(.701,-.587,-.114)))
   for(int i=-4;i<=4;i++){float n=float(i);float w=exp(-.15*n*n);float wY=(.5-.25)-.5*cos(6.2831853*(n+4.)/8.)+.25*cos(2.*6.2831853*(n+4.)/8.);float phs=(floor(op2.x)+n)*cy+phy;vec3 car=vec3(1.,cos(phs),sin(phs)),cup=vec3(1.,-car.y,-car.z);
    float ln=dot(Q15_YU(SRC(sp+vec2(n*.5,0.)))*car,vec3(1.)),lc=dot(Q15_YU(SRC(sp+vec2(n,0.)))*car,vec3(1.)),lu=dot(Q15_YU(SRC(sp+vec2(n*.5,.5)))*cup,vec3(1.)),luc=dot(Q15_YU(SRC(sp+vec2(n,.5)))*cup,vec3(1.));
    float lum=(ln+lu)*.5,lumc=(lc+luc)*.5;float chr=lc-lumc*cmb;if(i>-2&&i<3){fin.r+=lum*wY;sY+=wY;}fin.gb+=vec2(chr)*vec2(.8*sat_*1.5,.8*sat_*2.)*car.yz*w;sm+=w;}
   fin.r/=sY;fin.gb/=sm;o=vec3(fin.r+1.13983*fin.b,fin.r-.39465*fin.g-.5806*fin.b,fin.r+2.03211*fin.g);}
  else if(m==3){float sx=sp.x*2.;float n0=floor(sx);vec3 tp[21];float kk[21];float sk=0.;for(int i=0;i<21;i++){float j_=float(i)-10.;float sn=abs(j_)<.5?1.:sin(PI_*.25*j_)/(PI_*.25*j_);kk[i]=sn*(.42-.5*cos(2.*PI_*float(i)/20.)+.08*cos(4.*PI_*float(i)/20.));sk+=kk[i];}
   for(int i=0;i<21;i++){kk[i]/=sk;float xs=n0+float(i)-10.;tp[i]=(xs<0.||xs>=SF.x*2.)?vec3(0.):TXL(vec2((xs+.5)*.5,sp.y));}
   vec3 Y_=vec3(0.),I_=vec3(0.),Q_=vec3(0.);for(int i=0;i<21;i++)Y_+=tp[i]*kk[i];
   for(int j=0;j<21;j++){vec3 ch=vec3(0.);for(int i=0;i<21;i++){int ix=i+j-10;if(ix<0||ix>20)continue;float w=-kk[i]+(i==10?1.:0.);ch+=tp[ix]*w;}float sc_=6.2831853*.25*(sx+float(j)+10.);I_+=cos(sc_)*ch*kk[j];Q_+=sin(sc_)*ch*kk[j];}
   float H=1.;I_*=sat_*art;Q_*=sat_*art;vec3 Ia=I_*cos(H)-Q_*sin(H),Qa=I_*sin(H)+Q_*cos(H);o=vec3(Y_.r+.956*Ia.r+.621*Qa.r,Y_.g-.272*Ia.g-.647*Qa.g,Y_.b-1.106*Ia.b+1.703*Qa.b);}
  else if(m==4){vec2 w_=floor(uv*u_res);if(w_.x>=SF.x*2.||w_.y>=SS.y)return vec4(.5,.5,.5,1.);float n=w_.x;float lpY=0.,iq=0.;float fcbw=1./50.;
   #define Q15_BLK(ii,NN) (.42-.5*cos(2.*PI_*float(ii)/float((NN)-1))+.08*cos(4.*PI_*float(ii)/float((NN)-1)))
   #define Q15_SC(xx) (abs(xx)<1e-6?1.:sin((xx)*PI_)/((xx)*PI_))
   for(int i=0;i<29;i++){int tp_=28-i;float bwn=Q15_BLK(tp_,29);float lp=2.*.16667*bwn*Q15_SC(2.*.16667*float(tp_-14));float wa=.25-fcbw,wb=.25+fcbw;float bp=2.*(wb-wa)*bwn*(Q15_SC(2.*wb*float(tp_-14))-Q15_SC(2.*wa*float(tp_-14)));
    float ns=n+14.-float(i);vec3 cc=(ns<0.||ns>=SF.x*2.)?vec3(0.):TXL(vec2((ns+.5)*.5,w_.y+.5));vec3 yq=vec3(dot(cc,vec3(.299,.587,.114)),dot(cc,vec3(.596,-.274,-.322)),dot(cc,vec3(.211,-.523,.312)));float ph=6.2831853*.25*ns;float sg=yq.x+cos(ph)*yq.y+sin(ph)*yq.z;lpY+=sg*lp;iq+=sg*bp;}
   float ph0=6.2831853*.25*n;vec2 iqm=vec2(iq*cos(ph0),iq*sin(ph0));return vec4(lpY,.5+.5*clamp(iqm*8.,-1.,1.),1.);}
  else if(m==5){float LF[33]=float[33](-.000174844,-.000205844,-.000149453,-.000051693,0.,-.000066171,-.000245058,-.000432928,-.000472644,-.000252236,.000198929,.000687058,.000944112,.000803467,.000363199,.000013422,.000253402,.001339461,.002932972,.003983485,.003026683,-.001102056,-.008373026,-.0168977,-.02291448,-.021642347,-.028863273,.027271957,.05492192,.098342579,.139044281,.168055832,.178571429);
   float L3[33]=float[33](0.,0.,0.,0.,0.,0.,0.,0.,-.00001202,-.000022146,-.000013155,-.00001202,-.000049979,-.00011394,-.00012215,-.000005612,.000170516,.000237199,.00016964,.000285688,.000984574,.002018683,.002002275,-.005909882,-.012049081,-.01822286,-.022606931,.00246086,.035868225,.084016453,.1355635,.175261268,.220176552);
   float C3[33]=float[33](0.,0.,0.,0.,0.,0.,0.,0.,-.000118847,-.000271306,-.000502642,-.000930833,-.001451013,-.002064744,-.002700432,-.003241276,-.003524948,-.003350284,-.002491729,-.000721149,.002164659,.006313635,.011789103,.01854566,.026414396,.035100710,.044196567,.053207202,.061590275,.068803602,.074356193,.077856564,.079052396);
   float X0=floor(sp.x*4.);float cmf=PI_/3.;float A_=art,F_=art;vec3 sig=vec3(0.),ws=vec3(0.);
   #define Q15_P1(XX,OUT) {vec3 y0_=Q15_YIQ(TXL(vec2(((XX)+.5)*.25,sp.y)));vec3 acc_=vec3(0.);for(int f_=0;f_<2;f_++){float cp_=.6667*PI_*(mod(line,3.)+float(f_));float mp_=cp_+((XX)+.5)*cmf;vec3 q_=y0_;q_.yz*=vec2(cos(mp_),sin(mp_));q_=vec3(q_.x+F_*(q_.y+q_.z),A_*q_.x+2.*sat_*q_.y,A_*q_.x+2.*sat_*q_.z);q_.yz*=vec2(cos(mp_),sin(mp_));acc_+=q_;}OUT=acc_*.5;}
   for(int i=8;i<32;i++){float off=float(i-8)-24.;vec3 a_,b_;Q15_P1(X0+off,a_)Q15_P1(X0-off,b_)vec3 tw=vec3(L3[i],C3[i],C3[i]);ws+=tw;sig+=(a_+b_)*tw;}
   vec3 cc;Q15_P1(X0,cc)vec3 tw=vec3(L3[32],C3[32],C3[32]);ws=ws+ws+tw;sig+=cc*tw;sig/=ws;sig.x=clamp(sig.x,0.,1.);
   float la=dot(TXL(sp-vec2(2.,0.)),vec3(.2989,.587,.114)),lb=dot(TXL(sp-vec2(1.,0.)),vec3(.2989,.587,.114)),lc_=dot(TXL(sp+vec2(2.,0.)),vec3(.2989,.587,.114)),ld=dot(TXL(sp+vec2(1.,0.)),vec3(.2989,.587,.114)),le=dot(TXL(sp),vec3(.2989,.587,.114));
   sig.x=mix(sig.x,clamp(sig.x,min(min(min(la,lb),min(lc_,ld)),le),max(max(max(la,lb),max(lc_,ld)),le)),.5);o=Q15_RGB(sig);}
  else if(m==6||m==7){bool gen=m==7;float S_=gen?8.:4.;float NX=gen?320.:256.;float cpp=3.5795454*47.7/NX;float tps=47.7/(NX*S_);float s0=floor(sp.x*S_);float io=gen?.7:0.,lo=gen?0.:1./3.;
   #define Q15_CS(jj,OUT) {float j_=(jj);float px_=(j_+.5)/S_;vec3 cc_=${'gen'}?TXL(vec2(px_,sp.y)):.5*(SRC(vec2(px_-.5,sp.y))+SRC(vec2(px_+.5,sp.y)));float y_=dot(cc_,vec3(.299,.587,.114));float ph_=6.2831853*(io+lo*line+j_*cpp/S_);OUT=y_+art*(.492*(cc_.b-y_)*sin(ph_)+.877*(cc_.r-y_)*cos(ph_));}
   float hw=min(10.,floor(S_/cpp+.5));float fl=2.15*tps;float yy=0.,yw=0.;for(int i=-10;i<=10;i++){float fi=float(i);if(abs(fi)>hw)continue;float bw_=.42-.5*cos(PI_*(fi+hw)/hw)+.08*cos(2.*PI_*(fi+hw)/hw);float w_=bw_*2.*fl*Q15_SNC(PI_*2.*fl*fi);float cs_;Q15_CS(s0+fi,cs_)yy+=w_*cs_;yw+=w_;}yy/=yw;
   float wl=floor(S_/cpp+.5);float st_=floor(-wl/2.+.5);float fLo=3.55*tps,fHi=3.6*tps;float br=6.2831853*cpp/S_;float ms=0.;for(int i=-10;i<=10;i++){float fi=float(i);if(abs(fi)>hw)continue;float bw_=.42-.5*cos(PI_*(fi+hw)/hw)+.08*cos(2.*PI_*(fi+hw)/hw);ms+=bw_*(2.*fHi*Q15_SNC(PI_*2.*fHi*fi)-2.*fLo*Q15_SNC(PI_*2.*fLo*fi))*cos(br*fi);}
   float U_=0.,V_=0.;for(int k=0;k<16;k++){if(float(k)>=wl)break;float sk_=s0+st_+float(k);float bp=0.;for(int i=-10;i<=10;i++){float fi=float(i);if(abs(fi)>hw)continue;float bw_=.42-.5*cos(PI_*(fi+hw)/hw)+.08*cos(2.*PI_*(fi+hw)/hw);float cs_;Q15_CS(sk_+fi,cs_)bp+=bw_*(2.*fHi*Q15_SNC(PI_*2.*fHi*fi)-2.*fLo*Q15_SNC(PI_*2.*fLo*fi))*cs_;}bp/=ms;
    float ph=6.2831853*(io+lo*line+sk_*cpp/S_);U_+=2.*bp*sin(ph);V_+=2.*bp*cos(ph);}U_/=wl*max(art,.01)*.492;V_/=wl*max(art,.01)*.877;U_*=sat_;V_*=sat_;
   o=vec3(yy+1.13983*V_*.877,yy-.39465*U_*.492-.5806*V_*.877,yy+2.03211*U_*.492);o=pow(clamp(o,0.,1.),vec3(2.4/2.2));}
  else{float y0=0.;vec3 a0=SRC(sp-vec2(1.,0.)),a1=SRC(sp),a2=SRC(sp+vec2(1.,0.)),a3=SRC(sp+vec2(2.,0.));float mm=.25,te=.75,bi=37.5;float m2=mm*mm,m3=m2*mm;
   vec3 m0=(a1-a0)*(1.+bi)*(1.-te)/2.+(a2-a1)*(1.-bi)*(1.-te)/2.;vec3 m1=(a2-a1)*(1.+bi)*(1.-te)/2.+(a3-a2)*(1.-bi)*(1.-te)/2.;
   vec3 hf=(2.*m3-3.*m2+1.)*a1+(m3-2.*m2+mm)*m0+(m3-m2)*m1+(-2.*m3+3.*m2)*a2;o=mix(a1,hf,min(art,1.));o=mix(vec3(luma(o)),o,sat_);}
  return vec4(clamp(o,0.,1.),1.);`,
  `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);vec2 sp=uv*SF;float sat_=u_p2;
  if(m==0){vec2 ru=vec2(uv.x,1.-uv.y);vec3 R_=T(uv+vec2(-.4,0.)*Bw*u_px).rgb,G_=T(uv+vec2(0.,.4)*Bw*u_px).rgb,B_=T(uv+vec2(.2,-.2)*Bw*u_px).rgb;
   #define Q15_CC(cc) (((cc)*.95-dot((cc)*.95,vec3(.3,.59,.11)))*1.4+dot((cc)*.95,vec3(.3,.59,.11)))
   vec3 it=vec3(Q15_CC(R_).r,Q15_CC(G_).g,Q15_CC(B_).b);vec2 pu=ru*2.-1.;float r2=dot(pu,pu);vec2 sc=ru*(1.-.015*.2)+.015*.1+pu*.015*r2;float sbm=sin(sc.y*SF.y*3.1415926535);float sb=mix(1.,(sbm*sbm+1.)*.5,.175);
   vec3 o=vec3(.05)+(1.-.05)*it*sb;o*=1.-fract(ru.y)*.1;return vec4(clamp(o,0.,1.),1.);}
  if(m==4){float s=sp.x*2.;float line=floor(sp.y);float lu=T((vec2(floor(s),line)+.5)/u_res).r;vec2 ch=vec2(0.);
   for(int i=0;i<29;i++){int tp_=28-i;float bwn=.42-.5*cos(2.*3.14159265*float(tp_)/28.)+.08*cos(4.*3.14159265*float(tp_)/28.);float xx=2.*.16667*float(tp_-14);float lp=2.*.16667*bwn*(abs(xx)<1e-6?1.:sin(xx*3.14159265)/(xx*3.14159265));
    float ns=floor(s)-float(i)+14.5;vec2 iq=(T(vec2(clamp(ns,.5,SF.x*2.-.5),line+.5)/u_res).gb-.5)*2./8.;ch+=iq*lp;}
   vec3 o=vec3(lu+.956*ch.x*30.*sat_+.621*ch.y*30.*sat_,lu-.272*ch.x*30.*sat_-.647*ch.y*30.*sat_,lu-1.106*ch.x*30.*sat_+1.703*ch.y*30.*sat_);return vec4(clamp(o,0.,1.),1.);}
  return vec4(T(uv).rgb,1.);`],
 'ports of RetroArch ntsc/ shaders on a virtual console source (Source pixel size = one console pixel; console line width assumed 320 px for mame-ntsc / blastem, 256 px (3-line phase) for tiny_ntsc / ntsc-adaptive, 640 samples per 320 px for ntsc-xot / artifact-colors): mame-ntsc = MAME HLSL encode (Y + I cos + Q sin, 52.6 us line, 3.5975 MHz) and 64-tap windowed-sinc notch / I 1.2 / Q 0.6 MHz decode, postproc deconvergence (-.4/.4/.2), saturation 1.4, scanlines .175, 60 Hz roll bar frame 0; ntsc-blastem 7-tap comb decoder (comb .8 x Artifacts; its y_above line offset kept as written); tiny_ntsc (NINTENDO mode, comb .4, blackman luma / gaussian chroma); ntsc-xot (21-tap blackman sinc per RGB channel, quarter-rate subcarrier, hue 1 rad as shipped; out-of-range taps = 0); artifact-colors (Fs/4 carrier, 29-tap luma LP .16667 + bandpass BW 1/50, chroma LP, saturation 30); ntsc-adaptive (guest advanced NTSC: 3-phase + merged fields, modified Maister luma filters, anti-ringing .5); patchy-snes / patchy-blastem = approx. of patchy-ntsc presets (composite at 4 / 8 samples per pixel, 47.7 us line, SNES 1/3 line phase + RGB blur, Genesis .7 initial phase; sinc luma 2.15 MHz, 3.55-3.6 MHz bandpass, full-phase demod; jungle-chip axes, RF noise, jailbars and phosphor LUT omitted); analog_overshoot with decode-separately off (its shipped default 1 is a pass-through), Hermite taps 1 source pixel apart, tension .25 / bias .75');
