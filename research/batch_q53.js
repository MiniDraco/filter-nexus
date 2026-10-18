/* ================= q53: round-19 colour-science DCTLs / Nuke toolsets (Jed Smith open-display-transform + nuke-colortools, Paul Dore baldavenger DCTLs) ================= */
// shared: sRGB-encoded image -> linear Rec.709, and Rec.709 <-> XYZ (D65) as explicit row dot products
const Q53_XYZ = (v) => `vec3(dot(vec3(.4123909175,.3575843573,.1804807931),${v}),dot(vec3(.2126390785,.7151687145,.07219231129),${v}),dot(vec3(.01933082566,.1191947833,.9505321383),${v}))`;
const Q53_XYZ2RGB = (v) => `vec3(dot(vec3(3.240969,-1.537383,-.498611),${v}),dot(vec3(-.969244,1.875967,.041555),${v}),dot(vec3(.05563,-.203977,1.056972),${v}))`;

f = add('Color');
f('q53_huecontrast','Hue Contrast (Jed Smith HueContrast)',[P('Focus low',-1,1,.6,.01),P('Focus high',-1,1,.3,.01),S('Primaries',['All','Red','Green','Blue']),P('Strength',.05,1,.5,.01)],
  `vec3 iv=${LIN('c.rgb')};int pm=int(u_p2+.5);vec3 sl=pm==0?vec3(1.):pm==1?vec3(1.,0.,0.):pm==2?vec3(0.,1.,0.):vec3(0.,0.,1.);
 vec3 m0=1.-u_p0*sl,m1=1.-u_p1*sl;float mx=max(iv.r,max(iv.g,iv.b));mx=abs(mx)<1e-4?0.:mx;
 vec3 rg=mx==0.?vec3(0.):iv/mx;float mn=max(0.,min(rg.r,min(rg.g,rg.b)));rg-=mn;float w=.5;
 rg=clamp(vec3(rg.r-(rg.g+rg.b)*(1.-w),rg.g-(rg.r+rg.b)*(1.-w),rg.b-(rg.r+rg.g)*(1.-w)),0.,1.);rg=pow(rg,vec3(1./u_p3));
 float zr=mx;zr=(zr+.66)==0.?0.:zr/(zr+.66);vec3 fz=zr*(m1-m0)+m0;
 vec3 o=vec3(iv.r*fz.y*rg.y+iv.r*fz.z*rg.z+iv.r*(1.-(rg.y+rg.z)),iv.g*fz.x*rg.x+iv.g*fz.z*rg.z+iv.g*(1.-(rg.x+rg.z)),iv.b*fz.x*rg.x+iv.b*fz.y*rg.y+iv.b*(1.-(rg.x+rg.y)));
 o=max(o,0.);return vec4(${SRGB('o')},1.);`,
  'open-display-transform look-transforms/tools/resolve/HueContrast.dctl v0.0.3 (Jed Smith): RGB ratios minus achromatic, wide/narrow hue-angle mix (width 0.5), strength power, hyperbolic lerp factor x/(x+0.66) on max(RGB) (bias 0) mixing focus low -> high, 3-way lerp toward (focus<0) or away from the primary vectors; one focus pair applied to all or one primary; runs on linearised sRGB');

f = add('Tone');
f('q53_midcontrast','Midtone Contrast (Jed Smith MidtoneContrast)',[P('Contrast',-3,2,.4,.01),P('Pivot (stops)',-4,4,0,.05),P('Shoulder (stops)',0,4,1.5,.05),P('Toe',0,1,.2,.01)],
  `vec3 iv=${LIN('c.rgb')};float p=exp2(u_p0),t0=.18*exp2(u_p1),tux=t0*exp2(u_p2),tlx=max(u_p3*t0,1e-5);
 float s0=pow(t0*t0,-p);float m0=p*s0*pow(tlx,p-1.);float o=m0*tlx-s0*pow(tlx,p);float m1=p*s0*pow(tux,p-1.);float tuy=s0*pow(tux,p)+o;
 float y1=s0*pow(t0,p)+o;float s1=t0/y1;vec3 ov;
 for(int k=0;k<3;k++){float x=iv[k];ov[k]=s1*(x<tlx?m0*x:x<tux?s0*pow(max(x,0.),p)+o:m1*(x-tux)+tuy);}
 ov=max(ov,0.);return vec4(${SRGB('ov')},1.);`,
  'open-display-transform MidtoneContrast.dctl v0.0.1 (Jed Smith): power contrast 2^contrast pivoted at 0.18*2^pivot with a linear toe below toe*pivot and a linear shoulder above pivot*2^shoulder, rescaled to pass through the pivot; per channel (preserve-ratios 0), on linearised sRGB');

f = add('Color');
f('q53_nayatani_hk','Helmholtz-Kohlrausch Compensation (Jed Smith Nayatani_HK)',[S('Method',['VCC','VAC']),P('Adapting luminance',1,200,63.61,.01),S('Direction',['Compensate','Invert'])],
  `vec3 lv=${LIN('c.rgb')};vec3 xz=max(${Q53_XYZ('lv')},0.);float dd=xz.x+15.*xz.y+3.*xz.z;vec2 up=dd==0.?vec2(0.):vec2(4.*xz.x,9.*xz.y)/dd;
 vec2 wp=vec2(4.*.3127,9.*.329)/(-2.*.3127+12.*.329+3.);vec2 dv=up-wp;float h=atan(dv.y,dv.x);
 float lp=pow(u_p1,.4495);float kbr=.2717*(6.469+6.362*lp)/(6.469+lp);
 float q=-.01585-.03017*cos(h)-.04556*cos(2.*h)-.02667*cos(3.*h)-.00295*cos(4.*h)+.14592*sin(h)+.05084*sin(2.*h)-.019*sin(3.*h)-.00764*sin(4.*h);
 float suv=13.*length(dv);float m=u_p0<.5?-.134:-.866;float s=1.+(m*q+.0872*kbr)*suv;s=s==0.?1.:1./s;
 vec3 o=u_p2<.5?lv*s:lv/s;o=max(o,0.);return vec4(${SRGB('o')},1.);`,
  'open-display-transform Nayatani_HK.dctl (Jed Smith) after Nayatani 1997 (Color Res. Appl. 22:385): CIE u\'v\' hue angle h and S_uv = 13*|uv - uv_white| (D65), q(h) 4-harmonic Fourier series, K_Br from adapting luminance La, RGB scaled by 1/(1 + (m*q + 0.0872*K_Br)*S_uv) with m = -0.134 (VCC) or -0.866 (VAC); Rec.709 linear input');

f('q53_purity','Purity (Jed Smith Purity)',[P('Purity',-1,1,.5,.01),P('Strength',0,4,2,.01),P('Red weight',.05,1,.25,.01),P('Blue weight',.05,1,.1,.01)],
  `vec3 lv=${LIN('c.rgb')};float mx=max(lv.r,max(lv.g,lv.b));vec3 ra=abs(mx)<1e-3?vec3(0.):lv/mx;vec3 rc=1.-ra;
 float rw=u_p2,bw=u_p3,gw=1.-(rw+bw);float w=dot(rc,vec3(rw,gw,bw));float ch=max(rc.r,max(rc.g,rc.b));float lm=1.-w;w=abs(ch)<1e-3?0.:w/ch;
 float mm=1.-abs(u_p0),pp=u_p1,a0=pp*(mm-1.),b0=(1.-mm)*(pp+1.);float pv[2];
 for(int k=0;k<2;k++){float x=k==0?ch:1.-ch;pv[k]=x<=0.?mm*x:x>1.?x:x*(pow(x,pp)*(a0*x+b0)+mm);}
 float f0=abs(ch)<1e-3?0.:pv[0]/ch,f1=abs(ch)<1e-3?0.:(1.-pv[1])/ch;float fk=u_p0>0.?w*f1+(1.-w):(1.-w)*f0+w;fk=max(0.,fk);
 ra=lm*(1.-fk)+ra*fk;vec3 o=max(ra*mx,0.);return vec4(${SRGB('o')},1.);`,
  'open-display-transform Purity.dctl v0.0.1 (Jed Smith): RGB ratios to max, complement ratios, weighted-sum "luminance" (red/blue weights, green = 1 - r - b), chroma = max complement; pivoted power cubic on chroma sets a lerp factor (luminance weights for purity > 0, chrominance weights for < 0) between the ratios and the weighted achromatic; linearised sRGB');

// Jzazbz helpers (open-display-transform libDRT.h): XYZ -> JzLMS, PQ (m2*1.7, 10000 nits), Iz/Az/Bz, Jz, and inverses
const Q53_JZFWD = (xyz, out) => `{vec3 x_=${xyz};vec3 p_=vec3(1.15*x_.x-.15*x_.z,.66*x_.y+.34*x_.x,x_.z);
 vec3 l_=vec3(dot(vec3(.41479,.579999,.014648),p_),dot(vec3(-.20151,1.12065,.0531008),p_),dot(vec3(-.0166008,.2648,.66848),p_));
 l_=l_/10000.;l_=sign(l_)*pow(abs(l_),vec3(.1593017578125));l_=sign(l_)*pow((.8359375+18.8515625*abs(l_))/(1.+18.6875*abs(l_)),vec3(134.034375));
 vec3 i_=vec3(dot(vec3(.5,.5,0.),l_),dot(vec3(3.524,-4.06671,.542708),l_),dot(vec3(.199076,1.0968,-1.29588),l_));
 ${out}=vec3(i_.x*.44/(1.-.56*i_.x)-1.6295499532821565e-11,length(i_.yz),atan(i_.z,i_.y));}`;
const Q53_JZINV = (jz, out) => `{vec3 j_=${jz};float d0_=1.6295499532821565e-11;float ii_=(j_.x+d0_)/(.44+.56*(j_.x+d0_));vec3 i_=vec3(ii_,j_.y*cos(j_.z),j_.y*sin(j_.z));
 vec3 l_=vec3(dot(vec3(1.0000005,.138605,.0580471),i_),dot(vec3(.9999995,-.138605,-.0580471),i_),dot(vec3(.9999966,-.0960189,-.8118886),i_));
 l_=pow(abs(l_),vec3(1./134.034375));l_=pow(max(l_-.8359375,0.)/(18.8515625-18.6875*l_),vec3(1./.1593017578125))*10000.;
 vec3 p_=vec3(dot(vec3(1.9242258,-1.004791,.0376513),l_),dot(vec3(.3503163,.7264808,-.0653844),l_),dot(vec3(-.0909826,-.312728,1.5227663),l_));
 float X_=(p_.x+.15*p_.z)/1.15;${out}=vec3(X_,(p_.y-.34*X_)/.66,p_.z);}`;

f = add('Tone');
f('q53_jzdt','JzDT Display Transform (Jed Smith)',[P('Exposure (stops)',-4,4,0,.05),P('Peak nits',100,4000,100,10,'nits'),P('Dechroma',0,1,.5,.01),P('Saturation',.5,1.5,1.2,.01)],
  `vec3 lv=${LIN('c.rgb')}*exp2(u_p0);vec3 xz=${Q53_XYZ('lv')};
 vec3 pz=vec3(1.15*xz.x-.15*xz.z,.66*xz.y+.34*xz.x,xz.z);
 vec3 lms=vec3(dot(vec3(.41479,.579999,.014648),pz),dot(vec3(-.20151,1.12065,.0531008),pz),dot(vec3(-.0166008,.2648,.66848),pz));
 float lw=u_p1;float cc=12.*pow(lw,-.86)+1.17;float p=cc*.95;float fl=1./lw;float sx=.016*pow(lw,.87)-.17;float sy=1.036+.00005*lw;
 float n=max(1e-12,max(lms.x,max(lms.y,lms.z)));float ns=sy*pow(n/(n+sx),p);float nt=ns*ns/(ns+fl);float ccf=pow(sx/(n+sx),u_p2)*u_p3;
 vec3 dl=lms*nt/n;dl=nt*(1.-ccf)+dl*ccf;
 vec3 qx=vec3(dot(vec3(1.9242258,-1.004791,.0376513),dl),dot(vec3(.3503163,.7264808,-.0653844),dl),dot(vec3(-.0909826,-.312728,1.5227663),dl));
 float X1=(qx.x+.15*qx.z)/1.15;vec3 xt=vec3(X1,(qx.y-.34*X1)/.66,qx.z);
 vec3 jt,jn;${Q53_JZFWD('xt', 'jt')}${Q53_JZFWD('xz', 'jn')}
 float s_=(.03-.015)/sqrt(.05-.03);float ox=.015-s_*s_/4.,oy=.015-s_*sqrt(s_*s_/4.);jt.y=jt.y<.015?jt.y:s_*sqrt(jt.y-ox)+oy;jt.z=jn.z;
 vec3 xo;${Q53_JZINV('jt', 'xo')}
 vec3 o=clamp(${Q53_XYZ2RGB('xo')},0.,1.);return vec4(pow(o,vec3(1./2.4)),1.);`,
  'open-display-transform display-transforms/jzdrt/JzDT.dctl (Jed Smith): Michaelis-Menten tonescale on max(JzLMS) (Lw-derived contrast, flare 1/Lw, dim surround 0.95), chroma-compression lerp toward achromatic by (sx/(n+sx))^dechroma * saturation, then perceptual dechroma in JzAzBz (hue restored from the untoned input, parabolic chroma compression 0.015/0.05/0.03); Rec.709 linear in (linearised sRGB, exposure added), Rec.709 out, 2.4 power (Rec.1886) encoding');

// Tesseract helpers: compress quadratic lift (CQL) and the tonescale
const Q53_CQL = (x, t0, x0) => `{float s0_=sqrt(max(1e-6,${x0}))/(-(${t0}));float o0_=1./(4.*s0_*s0_)+${t0};float o1_=${t0}-sqrt(o0_-(${t0}))/s0_;${x}=${x}>${t0}?${x}:o1_+sqrt(max(o0_-${x},0.))/s0_;}`;
f('q53_tesseract','Tesseract View Transform (Jed Smith)',[P('Exposure (stops)',-4,4,0,.05),P('Contrast',1,2,1.6,.01),P('Purity boost',0,1,.6,.01),P('Grey nits',4,20,10,.1,'nits')],
  `vec3 rgb=${LIN('c.rgb')}*exp2(u_p0);float off=.005;rgb+=off;float mx=max(rgb.r,max(rgb.g,rgb.b));rgb=mx==0.?vec3(0.):rgb/mx;rgb=clamp(rgb,-2.,2.);
 vec3 pc=rgb;${Q53_CQL('pc.x', '.2', '.3')}${Q53_CQL('pc.y', '.2', '.3')}${Q53_CQL('pc.z', '.2', '.03')}
 float pmn=min(pc.x,min(pc.y,pc.z));pc-=pmn;pmn*=mx;float pf=.03*pc.x+.16*pc.y+.06*pc.z;float mn=max(0.,pmn*(1.-pf)+mx*pf);
 float lp=100.,pw=u_p1;float y0=(u_p3/lp)*(1.+.12*log2(lp/100.));float x0=.18+off;float s0=y0*pow(x0,-pw);float o0=s0*pow(x0,pw);float m0=pw*o0/x0;
 float w0=256.*log(lp)/log(100.)-128.;float tm=(m0*w0-y0)/(m0*w0-1.);float ts=tm-y0;float tv[2];
 for(int k=0;k<2;k++){float x=k==0?mn:mx;x=x<x0?s0*pow(max(x,0.),pw):m0*(x-x0)+o0;tv[k]=tm*x/(x+ts);}mn=tv[0];mx=tv[1];
 float pb0=1.+u_p2,pb1=2.-pb0,pbf=mx*(pb1-pb0)+pb0;float rmn=max(0.,min(rgb.r,min(rgb.g,rgb.b)));rgb=(rgb*pbf+1.-pbf)*rmn+rgb*(1.-rmn);
 rgb=rgb*(1.-mn)+mn;vec3 ha=rgb-min(rgb.r,min(rgb.g,rgb.b));ha=clamp(vec3(ha.x-(ha.y+ha.z),ha.y-(ha.x+ha.z),ha.z-(ha.x+ha.y)),0.,1.);
 vec3 h2=ha*ha;vec3 hl=vec3(.3,.2,.2);vec3 fz=mn*2.*hl+(1.-hl);
 rgb=vec3(rgb.x*fz.y*h2.y+rgb.x*fz.z*h2.z+rgb.x*(1.-(h2.y+h2.z)),rgb.y*fz.x*h2.x+rgb.y*fz.z*h2.z+rgb.y*(1.-(h2.x+h2.z)),rgb.z*fz.x*h2.x+rgb.z*fz.y*h2.y+rgb.z*(1.-(h2.x+h2.y)));
 vec3 hh=vec3(.5,0.,-.5);vec3 sh=vec3(ha.z*hh.z-ha.y*hh.y,ha.x*hh.x-ha.z*hh.z,ha.y*hh.y-ha.x*hh.x);rgb=rgb*(1.-mn)+(rgb+sh)*mn;
 ${Q53_CQL('rgb.x', '.06', '.02')}${Q53_CQL('rgb.y', '.06', '.06')}${Q53_CQL('rgb.z', '.06', '.02')}
 rgb=clamp(rgb*mx,0.,1.);return vec4(pow(rgb,vec3(1./2.4)),1.);`,
  'open-display-transform display-transforms/tesseract/Tesseract.dctl (Jed Smith): offset 0.005, RGB ratios with quadratic-lift purity compression, purity-weighted achromatic norm, spliced power / Michaelis-Menten tonescale (Lp 100, grey nits, contrast), purity boost, achromatic lerp toward peak, hue contrast (0.3/0.2/0.2) and hue shift (R +0.5, B -0.5) weighted by the toned norm, low-end compress; Rec.709 linear in (linearised sRGB) and out, 2.4 power encoding');

f('q53_chromagnon','Chromagnon View Transform (Jed Smith)',[P('Exposure (stops)',-4,4,0,.05),P('Contrast',1,3,1.8,.01),P('Purity compress',0,1,.5,.01),P('Grey nits',4,20,10,.1,'nits')],
  `float off=.005;vec3 cv=${LIN('c.rgb')}*exp2(u_p0)+off;float pcp=u_p2,pt0=.1,px0=.1;
 if(pcp<.01)cv=max(cv,0.);else{float pm0=pow((pt0+px0)/pt0,1./pcp)-1.;float pmm=pow(pm0,-pcp)*(pt0*pow(pm0,pcp)-pt0-px0);
  float mx=max(cv.r,max(cv.g,cv.b));vec3 nv=mx==0.?vec3(0.):cv/mx;
  for(int k=0;k<3;k++){float x=nv[k];nv[k]=x>pt0?x:(x-pt0)*pow(1.+pow((pt0-x)/(pt0-pmm),1./pcp),-pcp)+pt0;}cv=nv*mx;}
 cv=vec3(dot(vec3(.96,.03,.01),cv),dot(vec3(.02,.94,.04),cv),dot(vec3(0.,.03,.97),cv));cv=max(cv,0.);
 float xs=1./log(2049.),xo=1.-xs*log(128.0625);cv=xs*log(cv+.0625)+xo;
 cv=vec3(dot(vec3(.86,.12,.02),cv),dot(vec3(.03,.95,.02),cv),dot(vec3(.03,.12,.85),cv));cv=exp((cv-xo)/xs)-.0625;
 float con=u_p1,x0=.18+off,y0=u_p3/100.;float s0=y0*pow(x0,-con);float o0=s0*pow(x0,con);float m0=con*o0/x0;
 float m1=(m0*128.-y0)/(m0*128.-1.);float sv=m1-y0;
 for(int k=0;k<3;k++){float x=cv[k];x=x<x0?s0*pow(max(x,0.),con):m0*(x-x0)+o0;cv[k]=m1*x/(x+sv);}
 cv=clamp(cv,0.,1.);return vec4(pow(cv,vec3(1./2.4)),1.);`,
  'open-display-transform display-transforms/chromagnon/ChromagnonView.dctl v0.0.7 (Jed Smith): offset, per-channel power-p-toe purity compression of RGB ratios (pc_t0 0.1, pc_x0 0.1), default rendering matrix (scrot 0.01/0.03/0.025, rot 0.01/0/0.015), look matrix in an xlog space (0.03/0.12/0.02), pivoted power contrast then Michaelis-Menten tonescale (Lp 100, high clip 128) per channel; Rec.709 linear in (linearised sRGB) and out, 2.4 power');

f('q53_hilllangmuir','Hill-Langmuir Tonemap (nuke-colortools)',[P('Exposure (stops)',-4,4,0,.05),P('Grey out',.01,.2,.1,.001),P('White in',10,100,30,.5),P('Power',.5,4,1.2,.01)],
  `vec3 lv=${LIN('c.rgb')}*exp2(u_p0);float g0=.2,g1=u_p1,m0=u_p2,n=u_p3;float g0n=pow(g0,n),m0n=pow(m0,n);
 float s1=g1*(g0n-m0n)/(g0n-g1*m0n);float s0=g0n*(s1-g1)/g1;float mx=max(lv.r,max(lv.g,lv.b));
 float s=mx<=0.?0.:(s1*pow(mx,n)/(pow(mx,n)+s0))/mx;vec3 o=max(lv*s,0.);return vec4(${SRGB('o')},1.);`,
  'nuke-colortools toolsets/transfer_function/Tonemap_HillLangmuir.nk (Jed Smith): Hill-Langmuir y = s1*x^n/(x^n + s0) with s0, s1 solved so grey in 0.2 -> grey out and white in -> 1, applied to max(RGB) as a ratio-preserving scale; linearised sRGB in, display-linear out sRGB-encoded');

f('q53_powerp','PowerP Sigmoid Tonemap (nuke-colortools)',[P('Pivot in',.2,.8,.5,.005),P('Slope',1,8,1.5,.01),P('Shoulder power',1,8,2,.05),P('Toe power',1,8,3.5,.05)],
  `float m=u_p1,px=u_p0,py=.5,lns=.09,lnt=0.,kq=sqrt(m*m+1.);vec2 tt=vec2(-lnt/kq+px,-m*lnt/kq+py),ts=vec2(lns/kq+px,m*lns/kq+py);
 float o=tt.y-m*tt.x,ps=u_p2,pt=u_p3,lt=.02,lsh=1.1;float as_=m*(lsh-ts.x);float ss=pow(pow(as_,-ps)*max(pow(as_/(1.-ts.y),ps)-1.,1e-6),-1./ps);
 vec2 it=1.-tt;float at_=m*(1.-lt-it.x);float st=pow(pow(at_,-pt)*max(pow(at_/(1.-it.y),pt)-1.,1e-6),-1./pt);vec3 ov;
 for(int k=0;k<3;k++){float x=c[k];float y;
  if(x>ts.x){float u=m*(x-ts.x)/ss;y=ss*(u/pow(1.+pow(u,ps),1./ps))+ts.y;}
  else if(x<tt.x){float u=m*(x-tt.x)/(-st);y=-st*(u/pow(1.+pow(u,pt),1./pt))+tt.y;}else y=m*x+o;ov[k]=y;}
 return vec4(ov,1.);`,
  'nuke-colortools toolsets/transfer_function/Tonemap_PowerP_Sigmoid.nk (Jed Smith, desmos ls8q01jcnb): linear section of slope m through the pivot, power-p shoulder (limit 1.1, linear length 0.09) and power-p toe (limit 0.02) compressions solved to reach 1 and 0; applied per channel to the encoded image values (the .nk names no input domain; source pivot x 0.6795, here 0.5 for display-referred input, slope default 1.5 vs 2.36)');

f = add('Color');
f('q53_cspaces','Colour Spaces: darktable UCS / IgPgTg / IHLS / RLAB / T-Lab (nuke-colortools)',[S('Space',['darktable UCS 22','IgPgTg','Improved HLS','RLAB','FilmLight T-Lab']),S('Channel',['Lightness','Opponent 1','Opponent 2','Chroma','Hue','All three as RGB']),P('Gain',.1,10,1,.05)],
  `vec3 lv=${LIN('c.rgb')};vec3 xz=${Q53_XYZ('lv')};int sp=int(u_p0+.5);float lj,oa,ob,sc;
 if(sp==0){float dn=xz.x+xz.y+xz.z;vec2 xy=dn==0.?vec2(.3127,.329):xz.xy/dn;float de=.318707282433486*xy.x+2.16743692732158*xy.y+.291320554395942;
  float uu=(-.783941002840055*xy.x+.277512987809202*xy.y+.153836578598858)/de,vv=(.745273540913283*xy.x-.205375866083878*xy.y-.165478376301988)/de;
  float us=1.39656225667*uu/(abs(uu)+1.49217352929),vs=1.4513954287*vv/(abs(vv)+1.52488637914);
  float ar=-1.124983854323892*us-.980483721769325*vs,ag=1.86323315098672*us+1.971853092390862*vs;
  float yp=pow(max(xz.y,0.),.631651345306265);float ls=2.098883786377*yp/(yp+1.12426773749357);float lwh=2.098883786377/2.12426773749357;
  lj=pow(ls/lwh,.85385602);float ch=15.932993652962535*pow(ls,.6523997524738018)*pow(ar*ar+ag*ag,.6007557017508491)/lwh;float hh=atan(ag,ar);oa=ch*cos(hh);ob=ch*sin(hh);sc=.25;}
 else if(sp==1){vec3 lm=vec3(dot(vec3(2.968,2.741,-.649),xz),dot(vec3(1.237,5.969,-.173),xz),dot(vec3(-.318,.387,2.311),xz));
  lm=sign(lm)*pow(abs(lm/vec3(18.36,21.46,19435.)),vec3(.427));lj=dot(vec3(.117,1.464,.13),lm);oa=dot(vec3(8.285,-8.361,21.4),lm);ob=dot(vec3(-1.208,2.412,-36.53),lm);sc=.45;}
 else if(sp==2){vec3 e=c.rgb;float c1=e.r-e.g*.5-e.b*.5,c2=.8660254*(e.b-e.g);float cr=sqrt(c1*c1+c2*c2);
  float hh=cr==0.?0.:c2<=0.?acos(clamp(c1/cr,-1.,1.)):6.2831853-acos(clamp(c1/cr,-1.,1.));lj=luma(e);
  float sa=2.*cr*sin(2.0943951-mod(hh,1.0471976))/1.7320508;oa=sa*cos(hh);ob=sa*sin(hh);sc=1.;}
 else if(sp==3){vec3 lm=vec3(dot(vec3(.3897,.689,-.0787),xz),dot(vec3(-.2298,1.1834,.0464),xz),xz.z);
  vec3 ln=vec3(.973684,1.015518,1.089058);vec3 le=3.*ln/(ln.x+ln.y+ln.z);float yn=pow(100.,1./3.);vec3 pp=(1.+yn+le)/(1.+yn+1./le);
  lm*=(pp+.5*(1.-pp))/ln;vec3 rf=vec3(dot(vec3(1.9569,-1.1882,.2313),lm),dot(vec3(.3612,.6388,0.),lm),lm.z);rf=pow(max(rf,0.),vec3(1./2.3));
  lj=rf.y;oa=4.3*(rf.x-rf.y);ob=1.7*(rf.y-rf.z);sc=1.05;}
 else{vec3 tl=vec3(dot(vec3(.257085,.859943,-.031061),xz),dot(vec3(-.394427,1.1758,.106423),xz),dot(vec3(.064856,-.07625,.559067),xz));
  float sm=tl.x+tl.y+tl.z;sm=sm==0.?1.:sm;float yy=.68990272*tl.x+.34832189*tl.y;float rr=(1.0671*tl.x-.6873*tl.y)/sm-.198396,gg=(1.7182*tl.y-.0362*tl.x)/sm-.595198;
  float fy=yy>.008856?pow(yy,1./3.):7.787*yy+.1379;lj=(116.*fy-16.)/100.;oa=lj*(rr-gg)/.25;ob=lj*(rr+gg)/.206406;sc=1.45;}
 int chn=int(u_p1+.5);float g=u_p2/sc;float ch=length(vec2(oa,ob));float hu=ch<1e-4*sc?0.:fract(atan(ob,oa)/6.2831853+1.);
 vec3 o=chn==0?vec3(lj):chn==1?vec3(.5+.5*g*oa):chn==2?vec3(.5+.5*g*ob):chn==3?vec3(g*ch):chn==4?vec3(hu):vec3(lj,.5+.5*g*oa,.5+.5*g*ob);
 return vec4(clamp(o,0.,1.),1.);`,
  'nuke-colortools toolsets/color_model (Jed Smith): darktable UCS 22 (Aurelien Pierre 2022: xy -> UV -> U*V* -> Ar Ag, L*/L_white^(0.59*(1+sqrt 0.2)), chroma; shown as C cos h / C sin h), IgPgTg (Hellwig & Fairchild: XYZ->LMS, /(18.36, 21.46, 19435)^0.427, Ig Pg Tg), Improved HLS (Hanbury & Serra; on the encoded RGB, Rec.709 luma, saturation 2c sin(120 - h mod 60)/sqrt 3), RLAB (Fairchild 1996: HPE LMS, D = 0.5, Yn = 100, average surround exponent 1/2.3 as published - the .nk applies pow(x, 2.3) - L/100, a/100, b/100), FilmLight T-Lab (tLMS -> Yrg with D65 white offset -> L a b); channel viewer, opponent channels mapped 0.5 +/- gain*value/space range; Rec.709 linear (linearised sRGB) input');

f('q53_rrtsweet','ACES RRT Sweeteners (nuke-colortools Blink)',[S('Module',['All three','Glow module','Red modifier','Global desaturation']),P('Glow gain',0,.5,.05,.005),P('Red scale',0,1,.82,.01),P('Saturation factor',0,1.5,.96,.01)],
  `vec3 lv=${LIN('c.rgb')};vec3 a=vec3(dot(vec3(.439701,.382978,.177335),lv),dot(vec3(.0897923,.813423,.0967616),lv),dot(vec3(.017544,.111544,.870704),lv));int md=int(u_p0+.5);
 if(md==0||md==1){float mx=max(a.r,max(a.g,a.b)),mn=min(a.r,min(a.g,a.b));float sa=(max(mx,1e-10)-max(mn,1e-10))/max(mx,1e-2);
  float x=(sa-.4)/.2;float t=max(1.-abs(x/2.),0.);float sg=(1.+sign(x)*(1.-t*t))/2.;
  float yc=(a.r+a.g+a.b+1.75*sqrt(max(a.b*(a.b-a.g)+a.g*(a.g-a.r)+a.r*(a.r-a.b),0.)))/3.;float ge=u_p1*sg,mid=.08;
  float gl=yc<=2./3.*mid?ge:yc>=2.*mid?0.:ge*(mid/yc-.5);a*=1.+gl;}
 if(md==0||md==2){float mx=max(a.r,max(a.g,a.b)),mn=min(a.r,min(a.g,a.b));float sa=(max(mx,1e-10)-max(mn,1e-10))/max(mx,1e-2);
  float hue=(a.r==a.g&&a.g==a.b)?0.:degrees(atan(1.7320508*(a.g-a.b),2.*a.r-a.g-a.b));hue=hue<0.?hue+360.:hue;float ch=hue;ch=ch<-180.?ch+360.:ch>180.?ch-360.:ch;
  float wd=135.,hw=0.;if(ch>-wd/2.&&ch<wd/2.){float kc=(ch+wd/2.)*4./wd;int j=int(kc);float t=kc-float(j);vec4 mt=vec4(t*t*t,t*t,t,1.);
   vec4 cl=j==3?vec4(-1.,3.,-3.,1.)/6.:j==2?vec4(3.,-6.,0.,4.)/6.:j==1?vec4(-3.,3.,3.,1.)/6.:vec4(1.,0.,0.,0.)/6.;hw=dot(mt,cl)*1.5;}
  a.r=a.r+hw*sa*(.03-a.r)*(1.-u_p2);}
 if(md==0||md==3){a=mix(vec3(dot(vec3(.2722287,.6740818,.0536895),a)),a,u_p3);}
 vec3 o=vec3(dot(vec3(2.5213,-1.133948,-.387493),a),dot(vec3(-.276492,1.372749,-.096241),a),dot(vec3(-.015381,-.153012,1.168633),a));
 o=max(o,0.);return vec4(${SRGB('o')},1.);`,
  'nuke-colortools blink/rrt_sweetener_glow_module, _red_modifier, _global_desat (ACES 1.x RRT sweeteners): glow gain 0.05 / mid 0.08 by yc and a sigmoid of saturation, red modifier (hue 0, width 135 cubic B-spline window, pivot 0.03, scale 0.82), global desaturation with AP1 luminance weights (0.96); applied in ACES2065-1 (linear sRGB -> AP0, Bradford) and back');

f = add('Film');
f('q53_filmmatrix','ARRI Film Matrix Add / Remove (baldavenger Film_Matrix_Add)',[S('Direction',['Add','Remove']),P('Mix',0,1,1,.01)],
  `vec3 lv=${LIN('c.rgb')};vec3 aw=vec3(dot(vec3(.631321,.270801,.097878),lv),dot(vec3(.03682,.793037,.170143),lv),dot(vec3(.01737,.148789,.833841),lv));vec3 lg;
 for(int k=0;k<3;k++){float t=aw[k];lg[k]=t>.010591?.24719*log(5.555556*t+.052272)/log(10.)+.385537:5.367655*t+.092809;}
 vec3 fm=u_p0<.5?vec3(dot(vec3(1.271103,-.284279,.013176),lg),dot(vec3(-.127165,1.436429,-.309264),lg),dot(vec3(-.129927,-.510286,1.640214),lg))
  :vec3(dot(vec3(.806165,.168534,.025301),lg),dot(vec3(.091228,.765221,.14355),lg),dot(vec3(.092241,.251418,.656341),lg));
 lg=mix(lg,fm,u_p1);for(int k=0;k<3;k++){float x=lg[k];aw[k]=x>.149658?(pow(10.,(x-.385537)/.24719)-.052272)/5.555556:(x-.092809)/5.367655;}
 vec3 o=vec3(dot(vec3(1.617523,-.537286,-.080237),aw),dot(vec3(-.070573,1.334613,-.26404),aw),dot(vec3(-.021102,-.226954,1.248056),aw));
 o=max(o,0.);return vec4(${SRGB('o')},1.);`,
  'baldavenger DCTLs Technical Transforms/Film_Matrix_Add.dctl (Paul Dore): the ARRI film matrix (rows 1.271103 -0.284279 0.013176 / -0.127165 1.436429 -0.309264 / -0.129927 -0.510286 1.640214) applied to LogC AWG values; Remove = its inverse (Film_Matrix_Remove); here linear sRGB -> ARRI Wide Gamut -> LogC3 EI800, matrix, and back');

f = add('Repair');
f('q53_huemedian','Hue Median (baldavenger HueMedian)',[P('Radius',0,3,2,1,'px'),S('Display hue',['Off','On'])],
  `int rr=int(u_p0+.5);vec3 hc=rgb2hsv(c.rgb);float hv[49];int n=0;vec2 st=u_px*max(u_k,1.);
 for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;vec3 s=T(uv+vec2(float(i),float(j))*st).rgb;float mx=max(s.r,max(s.g,s.b)),mn=min(s.r,min(s.g,s.b));hv[n]=mx-mn==0.?0.:rgb2hsv(s).x;n++;}
 int kk=(n-1)/2;float hm=hc.x;
 for(int a=0;a<49;a++){if(a>=n)break;int lo=0,eq=0;for(int b=0;b<49;b++){if(b>=n)break;lo+=hv[b]<hv[a]?1:0;eq+=hv[b]==hv[a]?1:0;}if(lo<=kk&&lo+eq>kk){hm=hv[a];break;}}
 return u_p1>.5?vec4(vec3(hm),1.):vec4(hsv2rgb(vec3(hm,hc.y,hc.z)),1.);`,
  'baldavenger DCTLs DCTL_OFX/HueMedian_OFX.dctl (Paul Dore): HSV hue median over a (2r+1)^2 window (r 0..3; linear, not circular, hue order so red wraps are not handled, as in the source), saturation and value from the centre pixel, optional hue display');

f('q53_medianlab','Median on Lab a/b (baldavenger Median_LAB)',[S('Window',['3x3','5x5','7x7'],1)],
  `int rr=int(u_p0+.5)+1;float av[49],bv[49];int n=0;vec2 st=u_px*max(u_k,1.);float lc=0.;
 for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;vec3 s=T(uv+vec2(float(i),float(j))*st).rgb;vec3 ls=${LIN('s')};
  vec3 xz=${Q53_XYZ('ls')}/vec3(.950456,1.,1.089058);vec3 fz=mix(xz*7.787037+16./116.,pow(max(xz,0.),vec3(1./3.)),step(vec3(.008856),xz));
  if(i==0&&j==0)lc=116.*fz.y-16.;av[n]=500.*(fz.x-fz.y);bv[n]=200.*(fz.y-fz.z);n++;}
 int kk=(n-1)/2;float am=0.,bm=0.;
 for(int a=0;a<49;a++){if(a>=n)break;int lo=0,eq=0;for(int b=0;b<49;b++){if(b>=n)break;lo+=av[b]<av[a]?1:0;eq+=av[b]==av[a]?1:0;}if(lo<=kk&&lo+eq>kk){am=av[a];break;}}
 for(int a=0;a<49;a++){if(a>=n)break;int lo=0,eq=0;for(int b=0;b<49;b++){if(b>=n)break;lo+=bv[b]<bv[a]?1:0;eq+=bv[b]==bv[a]?1:0;}if(lo<=kk&&lo+eq>kk){bm=bv[a];break;}}
 float fy=(lc+16.)/116.;vec3 fz=vec3(fy+am/500.,fy,fy-bm/200.);vec3 xz=mix((fz-16./116.)/7.787037,fz*fz*fz,step(vec3(.206893),fz))*vec3(.950456,1.,1.089058);
 vec3 o=max(${Q53_XYZ2RGB('xz')},0.);return vec4(${SRGB('o')},1.);`,
  'baldavenger DCTLs Convolution/Median_LAB.dctl (Paul Dore): L passed through, a and b each replaced by the median of a square window (source length 5); the DCTL expects Lab input, here sRGB -> CIE L*a*b* (D65) and back is done around it');
