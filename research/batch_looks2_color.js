/* ================= looks2: colour science extras (colour spaces III, chroma subsampling, darktable colour contrast / rgb primaries / base curve) ================= */
/* Oklab (L,a,b) -> linear sRGB, as statements (Ottosson 2020) */
const LOOKS2_OKLIN = (L, a, b, o) => `{vec3 q_=vec3((${L})+.3963377774*(${a})+.2158037573*(${b}),(${L})-.1055613458*(${a})-.0638541728*(${b}),(${L})-.0894841775*(${a})-1.291485548*(${b}));q_=q_*q_*q_;
 ${o}=vec3(4.0767416621*q_.x-3.3077115913*q_.y+.2309699292*q_.z,-1.2684380046*q_.x+2.6097574011*q_.y-.3413193965*q_.z,-.0041960863*q_.x-.7034186147*q_.y+1.707614701*q_.z);}`;
/* Ottosson compute_max_saturation + find_cusp for a normalised hue (a,b) -> floats cuL, cuC */
const LOOKS2_CUSP = (a, b) => `float cS;{float k0,k1,k2,k3,k4;vec3 w_;
 if(-1.88170328*${a}-.80936493*${b}>1.){k0=1.19086277;k1=1.76576728;k2=.59662641;k3=.75515197;k4=.56771245;w_=vec3(4.0767416621,-3.3077115913,.2309699292);}
 else if(1.81444104*${a}-1.19445276*${b}>1.){k0=.73956515;k1=-.45954404;k2=.08285427;k3=.1254107;k4=.14503204;w_=vec3(-1.2684380046,2.6097574011,-.3413193965);}
 else{k0=1.35733652;k1=-.00915799;k2=-1.1513021;k3=-.50559606;k4=.00692167;w_=vec3(-.0041960863,-.7034186147,1.707614701);}
 cS=k0+k1*${a}+k2*${b}+k3*${a}*${a}+k4*${a}*${b};
 vec3 kk=vec3(.3963377774*${a}+.2158037573*${b},-.1055613458*${a}-.0638541728*${b},-.0894841775*${a}-1.291485548*${b});
 vec3 q1=1.+cS*kk;float f0=dot(w_,q1*q1*q1),f1=dot(w_,3.*kk*q1*q1),f2=dot(w_,6.*kk*kk*q1);cS-=f0*f1/(f1*f1-.5*f0*f2);}
 vec3 cR;${LOOKS2_OKLIN('1.', `cS*${a}`, `cS*${b}`, 'cR')}
 float cuL=pow(1./max(max(cR.r,cR.g),max(cR.b,1e-6)),1./3.);float cuC=cuL*cS;`;
const LOOKS2_K3 = '1.1708737864'; /* (1+.206)/(1+.03) */
const LOOKS2_TOE = v => `(.5*(${LOOKS2_K3}*(${v})-.206+sqrt((${LOOKS2_K3}*(${v})-.206)*(${LOOKS2_K3}*(${v})-.206)+.12*${LOOKS2_K3}*(${v}))))`;
const LOOKS2_TOEI = v => `(((${v})*(${v})+.206*(${v}))/(${LOOKS2_K3}*((${v})+.03)))`;

f = add('Color');
f('colorspace3','Color Space Channel III',[S('Space',['CIE xyY','CIECAM02 (J C h)','HSLuv (H S L)','Okhsv (h s v)','Okhsl (h s l)','TSL (Terrillon T S L)','YDbDr (SECAM)','Kodak Photo YCC','HWB (H W B)','HCY (Chilliant H C Y)']),
  S('Channel',['Channel 1','Channel 2','Channel 3','All three as RGB'])],
  `int m=int(u_p0+.5);vec3 s=clamp(c.rgb,0.,1.);vec3 l=${LIN('s')};
 vec3 X=vec3(dot(vec3(.4124564,.3575761,.1804375),l),dot(vec3(.2126729,.7151522,.072175),l),dot(vec3(.0193339,.119192,.9503041),l));vec3 v=vec3(0.);
 if(m==0){float sm=X.x+X.y+X.z;vec2 xy=sm>1e-6?X.xy/sm:vec2(.3127,.329);v=vec3(xy.x/.75,xy.y/.85,X.y);}
 else if(m==1){float LA=64./3.14159265/5.,n=.2,cc=.69,Nc=1.;float D=clamp(1.-(1./3.6)*exp((-LA-42.)/92.),0.,1.);
  float k=1./(5.*LA+1.),k4=k*k*k*k;float FL=.2*k4*5.*LA+.1*(1.-k4)*(1.-k4)*pow(5.*LA,1./3.);float Nbb=.725*pow(1./n,.2),z=1.48+sqrt(n);
  vec3 Ra[2];vec3 W=vec3(95.047,100.,108.883);vec3 Rw=vec3(dot(vec3(.7328,.4296,-.1624),W),dot(vec3(-.7036,1.6975,.0061),W),dot(vec3(.003,.0136,.9834),W));
  for(int i=0;i<2;i++){vec3 A3=i==0?W:X*100.;vec3 R3=vec3(dot(vec3(.7328,.4296,-.1624),A3),dot(vec3(-.7036,1.6975,.0061),A3),dot(vec3(.003,.0136,.9834),A3));
   R3*=100.*D/Rw+1.-D;vec3 Xc=vec3(dot(vec3(1.096124,-.278869,.182745),R3),dot(vec3(.454369,.473533,.072098),R3),dot(vec3(-.009628,-.005698,1.015326),R3));
   vec3 Rp=vec3(dot(vec3(.38971,.68898,-.07868),Xc),dot(vec3(-.22981,1.1834,.04641),Xc),Xc.z);vec3 pp=pow(FL*abs(Rp)/100.,vec3(.42));Ra[i]=sign(Rp)*400.*pp/(27.13+pp)+.1;}
  vec3 q=Ra[1];float a=q.x-12.*q.y/11.+q.z/11.,b=(q.x+q.y-2.*q.z)/9.;float h=atan(b,a);float et=.25*(cos(h+2.)+3.8);
  float A=(2.*q.x+q.y+.05*q.z-.305)*Nbb,Aw=(2.*Ra[0].x+Ra[0].y+.05*Ra[0].z-.305)*Nbb;float J=100.*pow(max(A/Aw,0.),cc*z);
  float t=(50000./13.*Nc*Nbb*et*length(vec2(a,b)))/max(q.x+q.y+1.05*q.z,1e-6);float C=pow(t,.9)*sqrt(J/100.)*pow(1.64-pow(.29,n),.73);
  v=vec3(J/100.,C/100.,fract(h/6.2831853));}
 else if(m==2){float L_=X.y<=.0088564516?X.y*903.2962963:116.*pow(X.y,1./3.)-16.;float dn=X.x+15.*X.y+3.*X.z;
  float U=dn>1e-9?13.*L_*(4.*X.x/dn-.19783000664283):0.,V=dn>1e-9?13.*L_*(9.*X.y/dn-.46831999493879):0.;float C=length(vec2(U,V));float H=fract(atan(V,U)/6.2831853+1.);float S_=0.;
  if(L_<99.99999&&L_>1e-6&&C>1e-6){float s1=pow(L_+16.,3.)/1560896.;float s2=s1>.0088564516?s1:L_/903.2962963;float hr=H*6.2831853;float mc=1e9;
   for(int ci=0;ci<3;ci++){vec3 mr=ci==0?vec3(3.240969941904521,-1.537383177570093,-.498610760293):ci==1?vec3(-.96924363628087,1.87596750150772,.041555057407175):vec3(.055630079696993,-.20397695888897,1.056971514242878);
    for(int tt=0;tt<2;tt++){float tq=float(tt);float bot=(632260.*mr.z-126452.*mr.y)*s2+126452.*tq;float sl=(284517.*mr.x-94839.*mr.z)*s2/bot;
     float ic=((838422.*mr.z+769860.*mr.y+731718.*mr.x)*L_*s2-769860.*tq*L_)/bot;float ln=ic/(sin(hr)-sl*cos(hr));if(ln>=0.)mc=min(mc,ln);}}
   S_=C/mc;}
  v=vec3(H,S_,L_/100.);}
 else if(m==3||m==4){vec3 lms=vec3(dot(vec3(.4122214708,.5363325363,.0514459929),l),dot(vec3(.2119034982,.6806995451,.1073969566),l),dot(vec3(.0883024619,.2817188376,.6299787005),l));lms=pow(max(lms,vec3(0.)),vec3(1./3.));
  vec3 lab=vec3(dot(vec3(.2104542553,.793617785,-.0040720468),lms),dot(vec3(1.9779984951,-2.428592205,.4505937099),lms),dot(vec3(.0259040371,.7827717662,-.808675766),lms));
  float C=length(lab.yz);float a_=C>1e-7?lab.y/C:1.,b_=C>1e-7?lab.z/C:0.;float L=lab.x;float h=.5+.5*atan(-lab.z,-lab.y)/3.14159265;
  ${LOOKS2_CUSP('a_', 'b_')}
  float Smax=cuC/cuL,Tmax=cuC/(1.-cuL);
  if(m==3){if(L<1e-6)v=vec3(h,0.,0.);else{float S0=.5;float kq=1.-S0/Smax;float tq=Tmax/(C+L*Tmax);float Lv=tq*L,Cv=tq*C;float Lvt=${LOOKS2_TOEI('Lv')};float Cvt=Cv*Lvt/Lv;
   vec3 rs;${LOOKS2_OKLIN('Lvt', 'a_*Cvt', 'b_*Cvt', 'rs')}float scL=pow(1./max(max(rs.r,rs.g),max(rs.b,1e-6)),1./3.);
   float Lq=L/scL;C=C/scL;float tl=${LOOKS2_TOE('Lq')};C=C*tl/max(Lq,1e-7);v=vec3(h,(S0+Tmax)*Cv/((Tmax*S0)+Tmax*kq*Cv),tl/Lv);}}
  else{float ss=0.;
   if(L>1e-5&&L<.99999&&C>1e-7){float tg;
    if(-(cuL-L)<=0.){tg=cuC*L/(cuL);}
    else{tg=cuC*(L-1.)/(cuL-1.);vec3 kk=vec3(.3963377774*a_+.2158037573*b_,-.1055613458*a_-.0638541728*b_,-.0894841775*a_-1.291485548*b_);
     vec3 q_=L+tg*kk;vec3 q3=q_*q_*q_,qd=3.*kk*q_*q_,qd2=6.*kk*kk*q_;float best=1e9;
     for(int i=0;i<3;i++){vec3 W0=i==0?vec3(4.0767416621,-3.3077115913,.2309699292):i==1?vec3(-1.2684380046,2.6097574011,-.3413193965):vec3(-.0041960863,-.7034186147,1.707614701);
      float r0=dot(W0,q3)-1.,r1=dot(W0,qd),r2=dot(W0,qd2);float ur=r1/(r1*r1-.5*r0*r2);if(ur>=0.)best=min(best,-r0*ur);}
     if(best<1e8)tg+=best;}
    float Cmax=tg;float kc=Cmax/min(L*Smax,(1.-L)*Tmax);
    float Sm=.11516993+1./(7.4477897+4.1590124*b_+a_*(-2.19557347+1.75198401*b_+a_*(-2.13704948-10.02301043*b_+a_*(-4.24894561+5.38770819*b_+4.69891013*a_))));
    float Tm=.11239642+1./(1.6132032-.68124379*b_+a_*(.40370612+.90148123*b_+a_*(-.27087943+.6122399*b_+a_*(.00299215-.45399568*b_-.14661872*a_))));
    float Ca=L*Sm,Cb=(1.-L)*Tm;float Cmid=.9*kc*sqrt(sqrt(1./(1./(Ca*Ca*Ca*Ca)+1./(Cb*Cb*Cb*Cb))));
    Ca=L*.4;Cb=(1.-L)*.8;float C0=sqrt(1./(1./(Ca*Ca)+1./(Cb*Cb)));
    if(C<Cmid){float k1=.8*C0;float k2=1.-k1/Cmid;ss=C/(k1+k2*C)*.8;}
    else{float k1=.2*Cmid*Cmid*1.5625/C0;float k2=1.-k1/(Cmax-Cmid);ss=.8+.2*(C-Cmid)/(k1+k2*(C-Cmid));}}
   v=vec3(h,ss,${LOOKS2_TOE('L')});}}
 else if(m==5){float sm=s.r+s.g+s.b;if(sm>1e-5){float rr=s.r/sm-1./3.,gg=s.g/sm-1./3.;float T_=gg>0.?atan(rr/gg)/6.2831853+.25:(gg<0.?atan(rr/gg)/6.2831853+.75:0.);v=vec3(T_,sqrt(1.8*(rr*rr+gg*gg)),dot(s,vec3(.299,.587,.114)));}}
 else if(m==6){float Y=dot(s,vec3(.299,.587,.114));v=vec3(Y,.5+dot(s,vec3(-.45,-.883,1.333))/2.666,.5+dot(s,vec3(-1.333,1.116,.217))/2.666);}
 else if(m==7){vec3 e=mix(4.5*l,1.099*pow(l,vec3(.45))-.099,step(vec3(.018),l));float Y=dot(e,vec3(.299,.587,.114));v=vec3(255./1.402*Y,111.4*(e.b-Y)+156.,135.64*(e.r-Y)+137.)/255.;}
 else if(m==8){v=vec3(rgb2hsv(s).x,min(s.r,min(s.g,s.b)),1.-max(s.r,max(s.g,s.b)));}
 else{float H=rgb2hsv(s).x;float C=max(s.r,max(s.g,s.b))-min(s.r,min(s.g,s.b));vec3 wts=vec3(.299,.587,.114);float Y=dot(s,wts);
  vec3 hr=clamp(vec3(abs(H*6.-3.)-1.,2.-abs(H*6.-2.),2.-abs(H*6.-4.)),0.,1.);float Z=dot(hr,wts);C*=Y<Z?Z/(1e-10+Y):(1.-Z)/(1e-10+1.-Y);v=vec3(H,C,Y);}
 int ch=int(u_p1+.5);if(ch==3)return vec4(clamp(v,0.,1.),1.);float g=ch==0?v.x:(ch==1?v.y:v.z);return vec4(vec3(clamp(g,0.,1.)),1.);`,
  'display-normalised channels: xyY (x/.75, y/.85, Y linear); CIECAM02 (CIE 159:2004, sRGB D65 white, L_A = 64/pi/5 cd/m2, Y_b = 20, average surround; J/100, C/100, h/360); HSLuv (Boronine, Luv chroma over the max chroma of the sRGB gamut at that L and H); Okhsv / Okhsl (Ottosson 2021 reference code, incl. its small saturation seam near blue where the Oklab hue line bends); TSL (Terrillon 2000); YDbDr (SECAM, D ranges / 2.666); Kodak PhotoYCC (Rec.709 OETF, 8-bit Y = 255/1.402 Y, C1 = 111.40 (B-Y) + 156, C2 = 135.64 (R-Y) + 137, / 255); HWB (Smith & Lyons 1996); HCY (Chilliant: Rec.601 luma, chroma normalised by the hue luma)');

f('chromasub','Chroma Subsampling (4:2:0 etc.)',[S('Scheme',['4:4:4','4:2:2','4:2:0','4:1:1','4:1:0','4:4:0'],2),S('Matrix',['BT.601','BT.709','BT.2020']),
  S('Upsampling',['Nearest (replicate)','Bilinear (centred)']),S('View',['Result','Chroma error x4','Chroma only (Y = 0.5)'])],
  `int sc=int(u_p0+.5);vec2 bs=sc==0?vec2(1.):sc==1?vec2(2.,1.):sc==2?vec2(2.):sc==3?vec2(4.,1.):sc==4?vec2(4.,2.):vec2(1.,2.);
 int mx=int(u_p1+.5);float kr=mx==0?.299:(mx==1?.2126:.2627),kb=mx==0?.114:(mx==1?.0722:.0593);vec3 K3=vec3(kr,1.-kr-kb,kb);
 vec2 p=floor(PX(uv));vec2 bmax=floor((u_res-1.)/bs);bool bil=u_p2>.5;vec2 f0=(p+.5)/bs-.5;vec2 b0=floor(f0);vec2 fr=f0-b0;
 vec2 ac[4];for(int k=0;k<4;k++){ac[k]=vec2(0.);if(!bil&&k>0)break;
  vec2 bi=bil?clamp(b0+vec2(float(k-2*(k/2)),float(k/2)),vec2(0.),bmax):floor(p/bs);vec2 a=vec2(0.);float n=0.;
  for(int j=0;j<2;j++)for(int i=0;i<4;i++){if(float(i)>=bs.x||float(j)>=bs.y)continue;vec2 q=bi*bs+vec2(float(i),float(j));if(q.x>=u_res.x||q.y>=u_res.y)continue;
   vec3 cc=clamp(O(fromPX(q+.5)).rgb,0.,1.);float yy=dot(cc,K3);a+=vec2((cc.b-yy)/(2.*(1.-kb)),(cc.r-yy)/(2.*(1.-kr)));n+=1.;}
  ac[k]=a/max(n,1.);}
 vec2 cb=bil?mix(mix(ac[0],ac[1],fr.x),mix(ac[2],ac[3],fr.x),fr.y):ac[0];
 vec3 o=clamp(c.rgb,0.,1.);int vw=int(u_p3+.5);float Y=vw==2?.5:dot(o,K3);
 float R=Y+2.*(1.-kr)*cb.y,B=Y+2.*(1.-kb)*cb.x;vec3 r=clamp(vec3(R,(Y-kr*R-kb*B)/(1.-kr-kb),B),0.,1.);
 if(vw==1)r=clamp(abs(r-o)*4.,0.,1.);return vec4(r,1.);`,
  'YCbCr from gamma-encoded RGB with the chosen Kr/Kb, chroma box-averaged over each J x 2 block (4:2:2 = 2x1, 4:2:0 = 2x2, 4:1:1 = 4x1, 4:1:0 = 4x2, 4:4:0 = 1x2) in working pixels, full-resolution luma; reconstruction by replication or bilinear interpolation between block centres (centre-sited, not MPEG-2 co-sited)');

f('colorcontrast','Color Contrast (Lab a/b steepness)',[P('Green-magenta contrast',0,5,1.4,.05),P('Blue-yellow contrast',0,5,1.4,.05),P('Green-magenta offset',-30,30,0,.5),P('Blue-yellow offset',-30,30,0,.5)],
  `vec3 s=c.rgb;vec3 l=${LIN('s')};vec3 X=vec3(dot(l,vec3(.4124,.3576,.1805))/.95047,dot(l,vec3(.2126,.7152,.0722)),dot(l,vec3(.0193,.1192,.9505))/1.08883);
 vec3 fq=mix(7.787*X+16./116.,pow(max(X,0.),vec3(1./3.)),step(.008856,X));vec3 lab=vec3(116.*fq.y-16.,500.*(fq.x-fq.y),200.*(fq.y-fq.z));
 lab.y=clamp(lab.y*u_p0+u_p2,-128.,128.);lab.z=clamp(lab.z*u_p1+u_p3,-128.,128.);
 float fy=(lab.x+16.)/116.;vec3 f3=vec3(fy+lab.y/500.,fy,fy-lab.z/200.);X=mix((f3-16./116.)/7.787,f3*f3*f3,step(.2069,f3))*vec3(.95047,1.,1.08883);
 l=vec3(dot(X,vec3(3.2406,-1.5372,-.4986)),dot(X,vec3(-.9689,1.8758,.0415)),dot(X,vec3(.0557,-.204,1.057)));l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);`,
  'darktable color contrast: a_out = a x a-steepness + a-offset, b_out = b x b-steepness + b-offset in CIELab (D65 here; darktable uses D50), L unchanged, a/b bounded to +-128');

f('rgbprimaries','RGB Primaries (darktable)',[S('Adjust',['Red primary','Green primary','Blue primary','Achromatic tint']),P('Hue shift',-180,180,0,1,'deg'),
  P('Purity (tint: amount above 1)',0,2,1.25,.01),S('Working space',['Rec.709 / sRGB','Rec.2020'])],
  `int sel=int(u_p0+.5);int ws=int(u_p3+.5);vec3 s=c.rgb;vec3 l=${LIN('s')};
 if(ws==1)l=vec3(dot(vec3(.6274,.3293,.0433),l),dot(vec3(.0691,.9195,.0114),l),dot(vec3(.0164,.088,.8956),l));
 vec2 pr[3];pr[0]=ws==0?vec2(.64,.33):vec2(.708,.292);pr[1]=ws==0?vec2(.3,.6):vec2(.17,.797);pr[2]=ws==0?vec2(.15,.06):vec2(.131,.046);vec2 wp=vec2(.3127,.329);
 vec2 np[3];np[0]=pr[0];np[1]=pr[1];np[2]=pr[2];vec2 nw=wp;
 int idx=sel<3?sel:0;vec2 dd=pr[idx]-wp;float ang=atan(dd.y,dd.x)+radians(u_p1);vec2 dir=vec2(cos(ang),sin(ang));float de=1e9;
 for(int e=0;e<3;e++){vec2 p3=pr[e],p4=pr[e==2?0:e+1];float den=(-dir.x)*(p3.y-p4.y)-(p3.x-p4.x)*(-dir.y);if(den==0.)continue;
  float tq=((wp.x-p3.x)*(p3.y-p4.y)-(p3.x-p4.x)*(wp.y-p3.y))/den;if(tq>=0.)de=min(de,tq);}
 float sc=sel<3?u_p2:clamp(u_p2-1.,0.,.99);vec2 nx=wp+sc*de*dir;
 if(sel==0)np[0]=nx;else if(sel==1)np[1]=nx;else if(sel==2)np[2]=nx;else nw=nx;
 mat3 Po=mat3(vec3(pr[0]/pr[0].y,(1.-pr[0].x-pr[0].y)/pr[0].y).xzy,vec3(pr[1]/pr[1].y,(1.-pr[1].x-pr[1].y)/pr[1].y).xzy,vec3(pr[2]/pr[2].y,(1.-pr[2].x-pr[2].y)/pr[2].y).xzy);
 mat3 Pn=mat3(vec3(np[0]/np[0].y,(1.-np[0].x-np[0].y)/np[0].y).xzy,vec3(np[1]/np[1].y,(1.-np[1].x-np[1].y)/np[1].y).xzy,vec3(np[2]/np[2].y,(1.-np[2].x-np[2].y)/np[2].y).xzy);
 vec3 Wo=vec3(wp.x/wp.y,1.,(1.-wp.x-wp.y)/wp.y),Wn=vec3(nw.x/nw.y,1.,(1.-nw.x-nw.y)/nw.y);
 vec3 so=inverse(Po)*Wo,sn=inverse(Pn)*Wn;mat3 Mo=mat3(Po[0]*so.x,Po[1]*so.y,Po[2]*so.z),Mn=mat3(Pn[0]*sn.x,Pn[1]*sn.y,Pn[2]*sn.z);
 l=inverse(Mo)*(Mn*l);
 if(ws==1)l=vec3(dot(vec3(1.6605,-.5876,-.0728),l),dot(vec3(-.1246,1.1329,-.0083),l),dot(vec3(-.0182,-.1006,1.1187),l));
 l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);`,
  'darktable rgb primaries (dt_rotate_and_scale_primary): the chosen primary (or the white point, for tint) is rotated about the white point in CIE xy and its distance scaled relative to the gamut-triangle edge in the new direction; out = XYZ->RGB(working) x RGB->XYZ(new primaries, new white) x rgb; tint hue 0 points at the red primary; D65 white for both working spaces (darktable uses its pipeline profile)');

/* darktable basecurve presets (src/iop/basecurve.c), monotone Hermite through 6 nodes */
const LOOKS2_BC = [
 ['Neutral',[0,.005,.15,.4,.75,1],[0,.0025,.3,.7,.95,1]],
 ['Canon EOS like',[0,.028226,.120968,.459677,.858871,1],[0,.029677,.232258,.747581,.967742,1]],
 ['Canon EOS like alternate',[0,.02621,.108871,.350806,.669355,1],[0,.029677,.232258,.747581,.967742,1]],
 ['Nikon like',[0,.03629,.120968,.459677,.858871,1],[0,.036532,.228226,.759678,.983468,1]],
 ['Nikon like alternate',[0,.012097,.072581,.310484,.611321,1],[0,.007322,.130742,.729291,.951613,1]],
 ['Sony Alpha like',[0,.031949,.105431,.434505,.855738,1],[0,.036532,.228226,.759678,.983468,1]],
 ['Pentax like',[0,.032258,.120968,.205645,.604839,1],[0,.024596,.166419,.328527,.790171,1]],
 ['Ricoh like',[0,.032259,.120968,.205645,.604839,1],[0,.024596,.166419,.328527,.790171,1]],
 ['Olympus like',[0,.033962,.249057,.501887,.750943,1],[0,.028226,.439516,.798387,.955645,1]],
 ['Olympus like alternate',[0,.012097,.072581,.310484,.645161,1],[0,.010322,.167742,.711291,.956855,1]],
 ['Panasonic like',[0,.03629,.120968,.205645,.604839,1],[0,.024596,.166419,.328527,.790171,1]],
 ['Leica like',[0,.036291,.120968,.205645,.604839,1],[0,.024596,.166419,.328527,.790171,1]],
 ['Kodak EasyShare like',[0,.044355,.133065,.209677,.572581,1],[0,.020967,.154322,.300301,.753477,1]],
 ['Konica Minolta like',[0,.020161,.112903,.5,.899194,1],[0,.010322,.167742,.711291,.956855,1]],
 ['Samsung like',[0,.040323,.133065,.447581,.842742,1],[0,.029677,.232258,.747581,.967742,1]],
 ['Fujifilm like',[0,.028226,.104839,.387097,.754032,1],[0,.029677,.232258,.747581,.967742,1]],
 ['Nokia like',[0,.041825,.117871,.319392,.638783,1],[0,.020161,.153226,.5,.842742,1]]];
const LOOKS2_ARR = a => a.map(n => (Number.isInteger(n) ? n + '.' : String(n))).join(',');
const LOOKS2_BCE = (vi, vo) => `{float v_=max(${vi},0.);if(v_>1.){${vo}=pow(v_,ms[5]);}else{int j_=0;for(int i=0;i<4;i++){if(v_>=xs[i+1])j_=i+1;}
 float h_=xs[j_+1]-xs[j_];float t_=(v_-xs[j_])/h_;float t2=t_*t_,t3=t2*t_;${vo}=(2.*t3-3.*t2+1.)*ys[j_]+(t3-2.*t2+t_)*h_*ms[j_]+(-2.*t3+3.*t2)*ys[j_+1]+(t3-t2)*h_*ms[j_+1];}}`;
f = add('Tone');
f('basecurve','Base Curve (camera tone emulation)',[S('Camera preset',LOOKS2_BC.map(r => r[0]),1),P('Exposure (raw headroom)',-3,2,-1,.1,'EV'),
  S('Preserve colors',['None (per channel)','Luminance','Max RGB','Average RGB','Sum RGB','Norm (euclidean)','Basic power'],1)],
  `const float BX[${LOOKS2_BC.length * 6}]=float[](${LOOKS2_BC.map(r => LOOKS2_ARR(r[1])).join(',')});
 const float BY[${LOOKS2_BC.length * 6}]=float[](${LOOKS2_BC.map(r => LOOKS2_ARR(r[2])).join(',')});
 int k=int(u_p0+.5)*6;float xs[6],ys[6],ms[6],dl[5];for(int i=0;i<6;i++){xs[i]=BX[k+i];ys[i]=BY[k+i];}
 for(int i=0;i<5;i++)dl[i]=(ys[i+1]-ys[i])/(xs[i+1]-xs[i]);ms[0]=dl[0];ms[5]=dl[4];
 for(int i=1;i<5;i++)ms[i]=dl[i-1]*dl[i]<=0.?0.:(dl[i-1]+dl[i])*.5;
 for(int i=0;i<5;i++){if(dl[i]==0.){ms[i]=0.;ms[i+1]=0.;}else{float al=ms[i]/dl[i],be=ms[i+1]/dl[i];float h2=al*al+be*be;if(h2>9.){float tau=3./sqrt(h2);ms[i]=tau*al*dl[i];ms[i+1]=tau*be*dl[i];}}}
 vec3 s=clamp(c.rgb,0.,1.);vec3 l=${LIN('s')}*exp2(u_p1);int pm=int(u_p2+.5);vec3 r;
 if(pm==0){${LOOKS2_BCE('l.r', 'r.r')}${LOOKS2_BCE('l.g', 'r.g')}${LOOKS2_BCE('l.b', 'r.b')}}
 else{float nm=pm==1?dot(l,vec3(.2126,.7152,.0722)):pm==2?max(l.r,max(l.g,l.b)):pm==3?(l.r+l.g+l.b)/3.:pm==4?l.r+l.g+l.b:pm==5?length(l):dot(l,l*l)/max(dot(l,l),1e-9);
  float cv;${LOOKS2_BCE('nm', 'cv')}r=nm>1e-7?l*cv/nm:vec3(cv);}
 r=clamp(r,0.,1.);return vec4(${SRGB('r')},1.);`,
  'darktable base curve presets (node tables copied from src/iop/basecurve.c), Fritsch-Carlson monotone Hermite, applied to linear RGB after an exposure shift that stands in for raw headroom (input is an sRGB image, not raw); preserve colors = darktable rgb norms (curve on the norm, ratio applied to RGB); above 1 the curve is extended as x^slope (approx. of the darktable fitted exponential); no exposure-fusion mode');
