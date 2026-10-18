/* ================= q16: RetroArch slang CRT shaders, round 12 (CRT 3) ================= */
/* Same-size engine as crtshaders2: the input is treated as N x N enlarged source pixels ('Source pixel size').  Pass 0
   box-averages every N x N block into a compact low-res copy in the bottom-left corner (1 texel per source pixel); pass 1
   runs the shader against it.  SRC(q): bilinear source sample at source-texel coords q (centres at +.5) · TXL(q): nearest
   source texel · op: integer output-pixel coords (masks are laid at output-pixel pitch like on a real display). */
const Q16_DOWN = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 w=floor(uv*u_res);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);
 vec3 a=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 q=floor(w*Bw+(vec2(float(i),float(j))+.5)*Bw*.25)+.5;a+=O(min(q,u_res-.5)/u_res).rgb;}return vec4(a/16.,1.);`;
const Q16_SRC = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 SF=u_res/Bw;vec2 op=floor(uv*u_res);
 #define SRC(q) T(clamp((q),vec2(.5),SS-.5)/u_res).rgb
 #define TXL(q) T((clamp(floor(q),vec2(0.),SS-1.)+.5)/u_res).rgb
 #define RL(v) pow(max((v),vec3(0.)),vec3(2.4))
 int m=int(u_p0+.5);float ms=u_p2,cv=u_p3;float mm=min(ms,1.);vec3 o=vec3(0.);
 `;
const Q16_PARAMS = names => [S('Shader', names), P('Source pixel size',1,8,3,1,'px'), P('Mask and scanline strength',0,1.5,1,.01), P('Curvature',0,2,1,.01)];

f = add('Retro');
f('q16_crtshaders3','CRT Shaders III (RetroArch: CreativeForce / Cyclon / beans / blurPi / gdv-mini / pocket / potato / torridgristle / yah)',
 Q16_PARAMS(['crt-CreativeForce-Arcade','crt-Cyclon','crt-beans','crt-blurPi','crt-gdv-mini','crt-pocket','crt-potato','crt-torridgristle','crt-yah']),
 [Q16_DOWN('R(u_p1)'), `${Q16_SRC('R(u_p1)')}
 if(m==0){/* crt-CreativeForce-Arcade (djayjp): EWA-cubic prescale (bilinear here), source gamma 2.2 -> linear, integer vertical black-line mask (V_BLACKS_PER 2, capped at half the source pixel so the period fits, auto-phase lit-first), out gamma 2.2 */
  vec3 c=pow(SRC(uv*SF),vec3(2.2));int vb=int(min(2.,floor(Bw*.5)));
  if(vb>0){int per=vb+1;int idx=int(op.x)+1;int j=idx-(idx/per)*per;if(j<vb)c*=1.-mm;}
  o=pow(c,vec3(1./2.2));}
 else if(m==1){/* crt-Cyclon (DariusG; preset linearises first, gamma 2.4): warp .02/.01, 4f^3 vertical shaping, 0.2 x-snap, colour-dependent scanline weight, RGB mask with brightness-dependent CGWG .3..75, slot mask, inv_gamma */
  vec2 pos=uv*2.-1.;pos*=vec2(1.+pos.y*pos.y*.02*cv,1.+pos.x*pos.x*.01*cv);pos=pos*.5+.5;
  if(pos.x<0.||pos.x>1.||pos.y<0.||pos.y>1.)return vec4(0.,0.,0.,1.);
  vec2 g=pos*SF;vec2 ic=floor(g)+.5;float fy=g.y-ic.y;vec3 res=RL(SRC(vec2(mix(g.x,ic.x,.2),ic.y+4.*fy*fy*fy)));
  float vx=uv.x-.5;vx*=vx;float l=dot(vec3(.2),res);float s=fract(g.y-.5);
  float wid=.3+.15*dot(res,vec3(.25-.8*vx));float w1=s/wid,w2=(1.-s)/wid;float wt=.4*exp(-w1*w1)/wid+.4*exp(-w2*w2)/wid;
  res*=mix(1.,wt,mm);float CG=mix(.3,.75,l);vec3 mk=vec3(CG);float mf=fract(op.x/3.);if(mf<.3333)mk.b=1.;else if(mf<.6666)mk.g=1.;else mk.r=1.;
  res*=mix(vec3(1.),mk,mm);vec2 sp=op*.5;float sl=((fract(sp.y)<.5)==(fract(sp.x/3.)<.5))?.5:1.5;res*=mix(1.,mix(sl,1.,CG),mm);
  vec3 pw=vec3(1./((1.-.3)*(1.-.8*CG))-1.2);vec3 ci=res-1.;ci*=ci;o=mix(sqrt(max(res,0.)),sqrt(max(1.-ci,0.)),pw);}
 else if(m==2){/* crt-beans (fast): spot-size scanlines (max .9, min .4 of max, FWHM in line units, cubic spot), 4% glow sigma .05 screen height, 3-px subpixel aperture grille + blend_mask (no brightness cost), gamma 2.2 */
  vec2 p=uv*SF;float yy=p.y-.5;float up=floor(yy);float dU=yy-up;
  vec3 sU=RL(SRC(vec2(p.x,up+.5))),sL=RL(SRC(vec2(p.x,up+1.5)));float MX=mix(1.,.9,mm);float mn=.4*MX;
  vec3 wU=1./(mn-sqrt(sU)*(mn-MX)),wL=1./(mn-sqrt(sL)*(mn-MX));vec3 yU=clamp(dU*wU,0.,1.),yL=clamp((1.-dU)*wL,0.,1.);
  vec3 v=MX*(sU*wU*(yU*yU*(2.*yU-3.)+1.)+sL*wL*(yL*yL*(2.*yL-3.)+1.));
  float sg=.05*SF.y;vec3 gs=vec3(0.);float gw=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 dd=vec2(float(i),float(j))*.8;float ww=exp(-.5*dot(dd,dd));gs+=RL(SRC(p+dd*sg))*ww;gw+=ww;}
  v=mix(v,gs/gw,.04);float mi=mod(op.x,3.);vec3 mk=mi<1.?vec3(0.,0.,1.):mi<2.?vec3(0.,1.,0.):vec3(1.,0.,0.);
  vec3 ba=clamp((v-1.)/(-2.),vec3(0.),v),bb=clamp((1.-3.*v)/(-2.),vec3(0.),v);v=mix(v,3.*ba*mk+bb,mm);o=pow(clamp(v,0.,1.),vec3(1./2.2));}
 else if(m==3){/* crt-blurPi (armadillu): centre gain (1-.75 blurGain)(1+rgbExtraGain) + 3 taps at 1.5 texels, every other output row darkened by scanlineGain .3 */
  vec2 p=uv*SF;vec3 bl=(1.-.75*.15)*1.1*SRC(p)+.25*.15*(SRC(p-vec2(1.5,0.))+SRC(p+vec2(1.5,0.))+SRC(p+vec2(0.,1.5)));
  float sc=mod(op.y,2.);o=mix(1.,sc*sc,.3*ms)*bl;}
 else if(m==4){/* crt-gdv-mini (DariusG): h_sharp 2 power interpolation, squared (gamma 2) input, exp2 beam (scanline 8, beam 1.35..1.05), CGWG mask .3, gamma_out .5 */
  vec2 pos=uv*2.-1.;pos*=vec2(1.+pos.y*pos.y*.03*cv,1.+pos.x*pos.x*.04*cv);pos=pos*.5+.5;
  vec2 g=pos*SF;vec2 fp=fract(g);vec2 c4=floor(g)+.5;float fy=fp.y;
  vec3 ul=TXL(c4),ur=TXL(c4-vec2(1.,0.)),dl=TXL(c4+vec2(0.,1.)),dr=TXL(c4+vec2(-1.,1.));float lx=fp.x*fp.x,rx=(1.-fp.x)*(1.-fp.x);
  vec3 c1=(ur*rx+ul*lx)/(lx+rx),c2=(dr*rx+dl*lx)/(lx+rx);c1*=c1;c2*=c2;float l1=dot(c1,vec3(.3,.6,.1)),l2=dot(c2,vec3(.3,.6,.1));
  #define Q16GSW(yv,lv) exp2(-mix(6.,8.,(yv))*pow((yv)*mix(1.35,1.05,(lv)),2.))
  vec3 col=mix(mix(c1,c2,fy),c1*Q16GSW(fy,l1)+c2*Q16GSW(1.-fy,l2),mm);
  vec3 mk=fract(op.x*.5)<.5?vec3(1.1,.7,1.1):vec3(.7,1.1,.7);col*=mix(vec3(1.),mk,mm);o=pow(max(col,0.),vec3(.5));
  if(pos.x<0.||pos.x>1.||pos.y<0.||pos.y>1.)o=vec3(0.);}
 else if(m==5){/* crt-pocket (DariusG; preset linearises with gamma 2.4 first): Lanczos 5x3 (anti-ringing clamp), NTSC primaries matrix, 5x5 glow .15, 6500 K, exp2 beams 6..8 / 1.35..1.05, Lottes shadow mask 1 (BGR) mixed .9..6 by brightness, boost 1.45..1.25, gamma 2.2, vignette, corners */
  vec2 pos=uv*2.-1.;pos*=vec2(1.+pos.y*pos.y*.03*cv,1.+pos.x*pos.x*.05*cv);pos=pos*.5+.5;
  vec2 g=pos*SF;vec2 ctr=floor(g)+.5;vec2 ofs=fract(g)-.5;vec3 col=vec3(0.),lmin=vec3(1e5),lmax=vec3(-1e5);float wsum=0.;
  for(int j=-1;j<=1;j++)for(int i=-2;i<=2;i++){vec3 smp=RL(TXL(ctr+vec2(float(i),float(j))));lmin=min(lmin,smp);lmax=max(lmax,smp);
   float xx=float(i)-ofs.x,yv=float(j)-ofs.y;float wx=abs(xx)<1e-4?1.:abs(xx)<2.?2.*sin(xx*3.14159265)*sin(xx*1.57079633)/(xx*xx*9.8696044):0.;
   float wy=abs(yv)<1e-4?1.:abs(yv)<1.?sin(yv*3.14159265)*sin(yv*3.14159265)/(yv*yv*9.8696044):0.;col+=smp*wx*wy;wsum+=wx*wy;}
  vec3 res=clamp(col/wsum,lmin,lmax);float ls=dot(vec3(.3,.6,.1),res);
  res=clamp(mat3(1.0143,-.0165,.0307,.0723,.9125,.0173,.0175,-.0419,1.1101)*res,0.,1.);
  vec3 gl=vec3(0.);float gsum=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float ww=exp(-.15*float(i*i))+exp(-.4*float(j*j));gl+=ww*RL(SRC(g+vec2(float(i),float(j))));gsum+=ww;}
  gl/=gsum;res+=gl*gl*.15;res*=vec3(1.,.9965,.9804);float lsc=max(res.r,max(res.g,res.b));float fy=fract(.5+g.y);
  #define Q16PSW(yv,lv) exp2(-mix(6.,8.,(yv))*pow((yv)*mix(1.35,1.05,(lv)),2.))
  res=mix(res,res*Q16PSW(fy,lsc)+res*Q16PSW(abs(1.-fy),lsc),mm);
  float line=1.5;float odd=fract(op.x/6.)<.5?1.:0.;if(fract((op.y+odd)/2.)<.5)line=.5;float mx=fract(op.x/3.);vec3 mk=vec3(.5);if(mx<.333)mk.b=1.5;else if(mx<.666)mk.g=1.5;else mk.r=1.5;mk*=line;
  res*=mix(vec3(1.),mk,mix(.9,.6,lsc)*mm);res*=mix(1.45,1.25,ls);res=pow(max(res,0.),vec3(1./2.2));
  vec2 vp=uv*(1.-uv);res*=min(pow(max(vp.x*vp.y*50.,0.),.1),1.);vec2 cn=min(pos,1.-pos);float cx=.0001/cn.x;if(cn.y<=cx||cn.x<.0001)res=vec3(0.);o=res;}
 else if(m==6){/* crt-potato (Brad Parker): nearest source x 2 x (1 source line) mask texture crt-potato-thin.png (2x5 texels, values copied) */
  vec3 c=TXL(uv*SF);vec3 PM[10]=vec3[10](vec3(146.,129.,229.),vec3(124.,152.,195.),vec3(228.,199.,255.),vec3(194.,234.,255.),vec3(255.,240.,255.),vec3(235.,255.,255.),vec3(237.,206.,255.),vec3(201.,242.,255.),vec3(152.,134.,235.),vec3(130.,158.,200.));
  int mx=int(mod(op.x,2.));int my=int(min(floor(fract((op.y+.5)/Bw)*5.),4.));o=c*mix(vec3(1.),PM[(4-my)*2+mx]/255.,mm);}
 else if(m==7){/* crt-torridgristle preset: Scanline-Interpolation (hard rows), ScanlineSimple (3 px per line, HSB/YIQ hybrid, YIQ .35), overlay 4x4 shadow mask .5, Brighten (2, .1), Candy-Bloom (glow 1, tightness .8); bloom blur taken from the source (approx.) */
  vec2 p=uv*SF;vec3 Pc=SRC(vec2(p.x,floor(p.y)+.5));float HS=max(Pc.r,max(Pc.g,Pc.b));float YL=dot(Pc,vec3(.299,.587,.114));float hy=max(mix(HS,YL,HS),1e-3);
  float sl=fract(p.y);sl=1.-abs(sl-.5)*2.;sl=1.-pow(1.-sl,2.);sl=clamp(sqrt(sl)-(1.-hy),0.,1.)/hy;
  mat3 RY=mat3(.299,.595716,.211456,.587,-.274453,-.522591,.114,-.321263,.311135);mat3 YR=mat3(1.,1.,1.,.9563,-.2721,-1.107,.621,-.6474,1.7046);
  vec3 yq=Pc*RY;yq.x*=sl;yq=yq*YR;vec3 Sc=mix(Pc,mix(Pc*sl,yq*mix(sl,1.,.75),.35),mm);
  int sx=int(mod(op.x,4.));int sy=int(mod(op.y,4.));int si=sx+(sy>=2?2:0);si=si-(si/4)*4;
  vec3 SM=si==0?vec3(249.,17.,18.):si==1?vec3(224.,237.,18.):si==2?vec3(18.,237.,224.):vec3(18.,17.,249.);SM/=255.;
  vec3 ov=mix(2.*Sc*SM,1.-2.*(1.-Sc)*(1.-SM),step(.5,Sc));Sc=mix(Sc,clamp(ov,0.,1.),.5*mm);
  vec3 cand=mix(Sc,1.-pow(1.-clamp(Sc,0.,1.),vec3(2.)),.1);
  vec3 bl=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float ww=(i==0?2.:1.)*(j==0?2.:1.);bl+=SRC(p+vec2(float(i),float(j))*1.5)*ww;}bl/=16.;
  float mR=max(bl.r,max(bl.g,bl.b));float Yb=dot(bl,vec3(.299,.587,.114));vec3 pic=clamp(bl/max(mR,1e-4),0.,1.);
  o=mix(cand,pic,mix(1.-pow(1.-Yb,2.),Yb*Yb,.8));}
 else {/* crt-yah (Jezze, Yet Another Hyllian), approx.: cubic lens distortion, Catmull-Rom beam filter biased blocky (-.25), per-channel beam width .25..1.25 (burn 1), exp(-10 strength f^2), aperture-grille mask blend .5, light halation, vignette, round corners */
  vec2 tc=uv-.5;float cc=dot(tc,tc);float am=.25*cv;tc*=(1.+cc*am*sqrt(cc))/(1.+am*.125);tc+=.5;if(tc.x<0.||tc.x>1.||tc.y<0.||tc.y>1.)return vec4(0.,0.,0.,1.);
  vec2 pc=tc*SF-.5;vec2 lr=floor(pc),fp=pc-lr;float xq=mix(fp.x,smoothstep(.25,.75,fp.x),.25);
  vec4 wx=vec4(((-.5*xq+1.)*xq-.5)*xq,(1.5*xq-2.5)*xq*xq+1.,((-1.5*xq+2.)*xq+.5)*xq,(.5*xq-.5)*xq*xq);
  vec3 a0=RL(TXL(lr+vec2(-1.,0.))),a1=RL(TXL(lr)),a2=RL(TXL(lr+vec2(1.,0.))),a3=RL(TXL(lr+vec2(2.,0.)));
  vec3 b0=RL(TXL(lr+vec2(-1.,1.))),b1=RL(TXL(lr+vec2(0.,1.))),b2=RL(TXL(lr+vec2(1.,1.))),b3=RL(TXL(lr+vec2(2.,1.)));
  vec3 c0=clamp(a0*wx.x+a1*wx.y+a2*wx.z+a3*wx.w,min(a1,a2),max(a1,a2)),c1=clamp(b0*wx.x+b1*wx.y+b2*wx.z+b3*wx.w,min(b1,b2),max(b1,b2));
  vec3 w0=mix(vec3(.25),vec3(1.25),c0),w1=mix(vec3(.25),vec3(1.25),c1);vec3 f0=fp.y/(w0+1e-4),f1=(1.-fp.y)/(w1+1e-4);
  vec3 col=mix(mix(c0,c1,fp.y),c0*exp(-5.*f0*f0)+c1*exp(-5.*f1*f1),mm);
  float lu=dot(col,vec3(.2126,.7152,.0722));float mi=mod(op.x,3.);vec3 mk=mi<1.?vec3(1.,0.,0.):mi<2.?vec3(0.,1.,0.):vec3(0.,0.,1.);
  mk=mix(mk,mk+lu*.5,.5);vec3 ma=clamp(mk+.25,0.,1.)+.25;col=mix(col,col*mix(mk,ma,.5),.5*mm);
  vec3 hl=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)hl+=RL(SRC(tc*SF+vec2(float(i),float(j))*1.5));col+=.06*hl/25.;
  float vd=length(tc-.5);col*=smoothstep(.9375,.53125,vd);vec2 qd=abs(tc-.5)*u_res-(u_res*.5-8.);col*=clamp(8.-length(max(qd,0.))+.5,0.,1.);
  o=pow(clamp(col,0.,1.),vec3(1./2.2));}
 return vec4(clamp(o,0.,1.),1.);`],
 'ports of RetroArch slang-shaders crt/ (single frame, defaults of each shader; masks at output-pixel pitch on an N x enlarged source grid): CreativeForce-Arcade vertical line mask; Cyclon (bezel texture and colour-space options omitted); crt-beans fast path (subpixel aperture grille, glow folded in as a 7x7 gaussian); blurPi; gdv-mini (CGWG mask); pocket (flicker omitted); potato (thin mask texture values); torridgristle preset chain (bloom blur from the source, approx.); crt-yah (approx. of the Hyllian-based beam / mask / halation stages)');

f('q16_crtshaders4','CRT Shaders IV (RetroArch: yo6 Trinitron / crtglow / fakelottes / gizmo / gtu-v050 / lottesRVM / mame_hlsl / moire-resolve / monoCRT)',
 Q16_PARAMS(['crt-yo6 (Trinitron KV)','crtglow','fakelottes','gizmo-crt','gtu-v050','lottesRVM','mame_hlsl','moire-resolve','monoCRT']),
 [Q16_DOWN('R(u_p1)'), `${Q16_SRC('R(u_p1)')}
 if(m==0){/* crt-yo6 flat Trinitron TV (approx.): yo6's zoom table (pattern height = output px per line, width ~2/3, channel shift z), 2 phosphor columns per line pitch, per-channel source value ^1.8 drives a stripe whose spot grows with brightness (the KV-M1420B LUT texture is replaced by an energy-normalised gaussian stripe) */
  float h=max(floor(Bw+.5),2.);float pw=max(floor(h*2./3.+.4),2.);float z=h<4.?0.:h<9.?1.:h<13.?2.:3.;float ncol=floor(u_res.x/pw);
  float row=floor(op.y/h)+.5;float ly=mod(op.y,h)+.5-h*.5;vec3 dst=vec3(0.);
  for(int ch=0;ch<3;ch++){float xc=op.x+float(1-ch)*z;float cl=floor(xc/pw)+.5;vec3 sv=SRC(vec2(cl/ncol*SF.x,row));float v=pow(sv[ch],1.8);
   float lx=mod(xc,pw)+.5-pw*.5;float sxp=pw*(.16+.10*sqrt(v)),syp=h*(.14+.22*sqrt(v));float avg=6.2831853*sxp*syp/(pw*h);
   float sp=exp(-.5*(lx*lx/(sxp*sxp)+ly*ly/(syp*syp)));dst[ch]=v*mix(1.,sp/avg,mm);}
  o=pow(clamp(dst,0.,1.),vec3(1./2.2));}
 else if(m==1){/* crtglow (Themaister glow): 5-tap horizontal gaussian (width .5), crt-geom beam 2+2c^4 in linear light, boost .8696, threshold (1.15c)^3, 9x9 gaussian bloom (falloff .35), resolve 1.15 crt + .45 bloom, gamma 2.2 */
  vec2 p=uv*SF;float ty=floor(p.y-.5);float ph=p.y-.5-ty;vec3 top=vec3(0.),bot=vec3(0.);
  for(int i=-2;i<=2;i++){float pq=fract(p.x)-.5-float(i);float gg=.38*exp(-.5*pq*pq/.25)/.5;float tx=floor(p.x)+float(i)+.5;top+=RL(TXL(vec2(tx,ty+.5)))*gg;bot+=RL(TXL(vec2(tx,ty+1.5)))*gg;}
  #define Q16BM(cc,dd) (2.*(cc)*exp(-pow(abs(dd)*3.333333*inversesqrt(.5*(2.+2.*pow((cc),vec3(4.)))),2.+2.*pow((cc),vec3(4.))))/(.6+.2*(2.+2.*pow((cc),vec3(4.)))))
  vec3 crt=mix(mix(top,bot,ph),.869565*(Q16BM(top,ph)+Q16BM(bot,1.-ph)),mm);
  vec3 bl=vec3(0.);float bw=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){float k=exp(-.35*float(i*i))*exp(-.35*float(j*j));bl+=k*pow(clamp(1.15*RL(SRC(p+vec2(float(i),float(j))*1.5)),0.,1.),vec3(3.));bw+=k;}
  o=pow(clamp(1.15*crt+.45*bl/bw,0.,1.),vec3(1./2.2));}
 else if(m==2){/* fakelottes: warp .031/.041, crt gamma 2.5 -> monitor 2.2, Lottes shadow mask 1 (dark .5 light 1.5), sine scanlines base .95 + .40 sin(2 pi y) offset a quarter line */
  vec2 pos=uv*2.-1.;pos*=vec2(1.+pos.y*pos.y*.031*cv,1.+pos.x*pos.x*.041*cv);pos=pos*.5+.5;vec3 res=pow(SRC(pos*SF),vec3(2.5));
  float line=1.5;float odd=fract(op.x/6.)<.5?1.:0.;if(fract((op.y+odd)*.5)<.5)line=.5;float mx=fract(op.x/3.);vec3 mk=vec3(.5);if(mx<.333)mk.r=1.5;else if(mx<.666)mk.g=1.5;else mk.b=1.5;mk*=line;
  res*=mix(vec3(1.),mk,mm);float sc=.95+.40*mm*sin((pos.y*SF.y-.25)*6.2831853);o=pow(max(res*sc,0.),vec3(1./2.2));
  if(pos.x<0.||pos.x>1.||pos.y<0.||pos.y>1.)o=vec3(0.);}
 else if(m==3){/* gizmo-crt: barrel (.10,.15), sharp 'magnify' sampling, per-channel subpixel x offsets 0/.333/.666, gold-noise colour variation, dark-widening scanlines (smootherstep phase) */
  vec2 tc=uv-.5;vec2 CD=vec2(.10,.15)*cv;float rsq=dot(tc,tc);tc+=tc*CD*rsq;tc*=1.-.23*CD;if(abs(tc.x)>=.5||abs(tc.y)>=.5)return vec4(0.,0.,0.,1.);tc+=.5;
  vec2 fc=tc*u_res;vec2 fac=SF/u_res;vec3 xC=(vec3(fc.x)+vec3(0.,.333,.666))*fac.x;float yC=fc.y*fac.y;
  #define Q16MG(q) SRC(floor(q)+clamp(fract(q)*Bw,0.,1.)-.5)
  vec3 col=vec3(Q16MG(vec2(xC.r,tc.y*SF.y)).r,Q16MG(vec2(xC.g,yC)).g,Q16MG(vec2(xC.b,yC)).b);
  float gn=fract(tan(distance(fc*1.618034,fc)*sin(.025))*fc.x);col=clamp(col+gn/32.-1./64.,0.,1.);
  float fu=fract(tc.y*SF.y+.5);fu=abs(fu*fu*fu*(fu*(fu*6.-15.)+10.)-.5);col-=.1*Bw*.5*ms*abs(1.5*(1.-col)*abs(fu-.5));o=col;}
 else if(m==4){/* gtu-v050 (aliaspider): horizontal band-limit by the integrated raised-cosine STU kernel (signal resolution 256), vertical gaussian beams integrated over each output pixel (TV vertical resolution 250, both taken relative to a 256-wide / 240-line source so the beam keeps its shape at any 'Source pixel size'), black level .07, contrast 1 */
  vec2 pp=uv*SF;vec2 ofs=fract(pp-.5);float bh=min(256./SF.x,1.),bv=250./240.;float rH=ceil(.5+1./bh),rV=ceil(.5+1./bv);
  #define Q16D(xx,bb) (3.14159265*(bb)*min(abs(xx)+.5,1./(bb)))
  #define Q16E(xx,bb) (3.14159265*(bb)*min(max(abs(xx)-.5,-1./(bb)),1./(bb)))
  #define Q16STU(xx,bb) ((Q16D(xx,bb)+sin(Q16D(xx,bb))-Q16E(xx,bb)-sin(Q16E(xx,bb)))/6.2831853)
  #define Q16TT(q) (1./(1.+.33267*abs(q)))
  #define Q16NGI(q) ((.5-exp(-(q)*(q)*.5)/2.5066283*(Q16TT(q)*(.4361836+Q16TT(q)*(-.1201676+.937298*Q16TT(q)))))*sign(q))
  vec3 acc=vec3(0.);float tmp=2.5066283*bv;float rrr=.5/Bw;
  for(int j=-4;j<=5;j++){float fj=float(j);if(fj<-rV||fj>=rV+2.)continue;float Yj=ofs.y-fj;vec3 rw=vec3(0.);
   for(int i=-4;i<=5;i++){float fi=float(i);if(fi<-rH||fi>=rH+2.)continue;float X=ofs.x-fi;rw+=SRC(vec2(pp.x-X,pp.y-Yj))*Q16STU(X,bh);}
   rw=clamp(rw,0.,1.);vec3 scl=rw*(Q16NGI((Yj+rrr)*tmp)-Q16NGI((Yj-rrr)*tmp))*Bw;acc+=mix(rw*Q16STU(Yj,bv),scl,mm);}
  o=(acc-.07)/(1.-.07);}
 else if(m==5){/* lottesRVM (Timothy Lottes 'energy conservation' scanlines + mask, 240p mode): 4-tap (1-x^2)^2 horizontal kernel with input blur .75, cosine scanline pair sized by sqrt(max channel) (scan max .53, gap 3), energy normalisation, slot mask (dark .875), warp 1/256, 1/24, sRGB in/out */
  vec2 ip=uv*u_res;vec2 pos=ip*2./u_res-1.;pos*=1.+pos.yx*pos.yx*vec2(1./256.,1./24.)*cv;vec2 vi2=clamp(pos*pos,0.,1.);float vin=(1.-vi2.x)*vi2.y+vi2.x;vin=clamp((1.-vin)*SF.y,0.,1.);pos=pos*SF*.5+SF*.5;
  vec2 G=floor(pos+vec2(-1.5,-.5))+1.;float gy=G.y-.5;float ob=pos.x-G.x;float bu=.75;
  #define Q16PL(q) (clamp(1.-(q)*(q),0.,1.)*clamp(1.-(q)*(q),0.,1.))
  #define Q16SR(v) mix((v)/12.92,pow(((v)+.055)/1.055,vec3(2.4)),step(vec3(.04045),(v)))
  #define Q16RT(ix,iy) Q16SR(TXL(vec2((ix)+.5,(iy)+.5)))
  float h0=Q16PL(ob*bu+.5*bu),h1=Q16PL(ob*bu-.5*bu),h2=Q16PL(ob*bu-1.5*bu),h3=Q16PL(ob*bu-2.5*bu);float hd=vin/(h0+h1+h2+h3);
  vec3 U=(Q16RT(G.x-2.,G.y-1.)*h0+Q16RT(G.x-1.,G.y-1.)*h1+Q16RT(G.x,G.y-1.)*h2+Q16RT(G.x+1.,G.y-1.)*h3)*hd;
  vec3 Dn=(Q16RT(G.x-2.,G.y)*h0+Q16RT(G.x-1.,G.y)*h1+Q16RT(G.x,G.y)*h2+Q16RT(G.x+1.,G.y)*h3)*hd;
  float mU=sqrt(max(U.r,max(U.g,U.b))),mD=sqrt(max(Dn.r,max(Dn.g,Dn.b)));float SMX=.53,SMN=3.*.53;float oy=pos.y-gy;
  float sU=min(.5,oy*(mU*(SMX-SMN)+SMN)),sD=min(.5,(1.-oy)*(mD*(SMX-SMN)+SMN));sU=(cos(sU*6.2831853)*.5+.5)*((1.-mU)*(SMN/SMX-1.)+1.);sD=(cos(sD*6.2831853)*.5+.5)*((1.-mD)*(SMN/SMX-1.)+1.);
  vec3 col=mix(mix(U,Dn,oy),U*sU+Dn*sD,mm);
  float DK=.875;float lim=1./(.25+.75*DK);vec2 mp=op;if(fract(mp.x/6.)>.5)mp.y+=2.;float fyq=fract(mp.y/4.);vec3 cD=col*col*DK;vec3 amp=1./(vec3(lim*.25)+lim*.75*col);
  float fxq=fract(mp.x/3.);vec3 cA=col*amp;cD*=amp;if(fyq>.25){if(fxq<1./3.)cD.r=cA.r;else if(fxq<2./3.)cD.g=cA.g;else cD.b=cA.b;}col=mix(col,cD,mm);
  col=clamp(col,0.,1.);o=mix(col*12.92,1.055*pow(col,vec3(.41666))-.055,step(vec3(.0031308),col));}
 else if(m==6){/* mame_hlsl (MAME HLSL chain, approx.): saturation 1.2, sine-power scanlines (alpha .35, height 1, variation 1, bright scale 2 / offset 1.5), shadow-mask.png (RRGGBB 6x4 tile, row pairs offset 3 px) at alpha .5, barrel distortion + vignetting + round corners; NTSC, defocus, convergence and phosphor persistence at their off defaults */
  vec2 tc=uv-.5;float r2=dot(tc,tc);tc*=(1.+r2*.25*cv)/(1.+.125*cv);tc+=.5;if(tc.x<0.||tc.x>1.||tc.y<0.||tc.y>1.)return vec4(0.,0.,0.,1.);
  vec3 c=SRC(tc*SF);float lu0=dot(c,vec3(.299,.587,.114));c=max(mix(vec3(lu0),c,1.2),0.);float lu=dot(c,vec3(.299,.587,.114));
  float al=.35*mm;float bo=1.5*al,bs=2.*al+(1.-al);float ss=sin((1.-tc.y)*SF.y*3.1415927);float sw=1.+(1.-lu);float sb=pow(ss*ss,sw)*bs+bo*bs;c*=mix(1.,sb,al);
  float sxm=mod(op.x+(mod(floor(op.y*.5),2.)>.5?3.:0.),6.);vec3 SMk=sxm<2.?vec3(1.,0.,0.):sxm<4.?vec3(0.,1.,0.):vec3(0.,0.,1.);c*=mix(vec3(1.),SMk,.5*mm);
  vec2 cq=tc-.5;float vg=clamp(1.-dot(cq,cq)*.6*cv,0.,1.);vec2 rq=abs(cq)*u_res-(u_res*.5-10.*cv);float rc=clamp(10.*cv-length(max(rq,0.))+.5,0.,1.);o=c*vg*(cv>0.?rc:1.);}
 else if(m==7){/* moire-resolve (hunterk / Lottes jittered gaussian resolve): 21-tap jittered-quad resolve of the coordinate + filtered hash noise (mitigation 4), warp .031/.041, shadow mask 3 in linear 2.2, border clip; still frame (iTime 0) */
  vec2 pp=uv;vec2 sC=vec2(0.),sW=vec2(0.);
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)==2&&abs(j)==2)continue;vec2 qq=pp+vec2(float(i),float(j));int qi=(int(qq.x)&1)+((int(qq.y)&1)<<1);
   vec2 jq=qq+(qi==0?vec2(.25,-.25):qi==1?vec2(.25,.25):qi==2?vec2(-.25,-.25):vec2(-.25,.25));
   vec3 p3=fract(jq.xyx*10.1031);p3+=dot(p3,p3.yzx+19.19);float nn=(fract((p3.x+p3.y)*p3.z)*2.-1.)/128.;float mq=sqrt(nn*.5+.5)/4.;
   jq+=vec2(.707*.5*mq*cos(nn*3.14159),.707*.5*mq*sin(nn*3.14159));vec2 vv=pp-jq;float ww=exp2(-dot(vv,vv));sC+=jq*ww;sW+=vec2(ww);}
  vec2 cc=sC/sW;float n2=0.;for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){float wo=(a==0&&b==0)?-2.:(a==0||b==0)?2.:1.;float n1=0.;
   for(int d=-1;d<=1;d++)for(int c=-1;c<=1;c++){float wi=(c==0&&d==0)?-12.:(c==0||d==0)?2.:1.;vec2 qn=pp+vec2(float(a+c),float(b+d));vec3 p3=fract(qn.xyx*10.1031);p3+=dot(p3,p3.yzx+19.19);n1+=wi*(fract((p3.x+p3.y)*p3.z)*2.-1.)/128.;}
   n2+=wo*n1/12.;}
  n2/=12.;vec2 gq=vec2(n2*2.);float blk=.5*pow(1./255.,2.2),wht=2.-pow(254./255.,2.2);cc=clamp(cc+gq*min(cc+blk,min(wht-cc,vec2(1./32.))),0.,1.);cc+=vec2(.0105,.015)*cv;
  vec2 ww2=cc*2.-1.;ww2*=vec2(1.+ww2.y*ww2.y*.031*cv,1.+ww2.x*ww2.x*.041*cv);cc=ww2*.5+.5;vec3 col=pow(SRC(cc*SF),vec3(2.2));
  vec2 mp=op;mp.x+=mp.y*3.;float mx=fract(mp.x/6.);vec3 mk=vec3(.5);if(mx<.333)mk.r=1.5;else if(mx<.666)mk.g=1.5;else mk.b=1.5;col*=mix(vec3(1.),mk,mm);
  o=pow(max(col,0.),vec3(1./2.2));if(!(cc.x>.0106*cv&&cc.x<.9999&&cc.y>.016*cv&&cc.y<.9999))o=vec3(0.);}
 else {/* monoCRT (hunterk): per-line mono RMS envelope over (3 N - 1)/2 output-pixel taps (centred), gamma 2.2 in/out, beam height = envelope x .6 x scanMax 2.2 / rows, smoothstep edge (30 - brightBoost)/10000, white phosphor */
  float rows=SF.y;float row=floor(uv.y*rows);float rUV=(row+.5)/rows;int N=int(max((floor(Bw)*3.-1.)/2.,1.));vec3 sm=vec3(0.);
  for(int k=0;k<16;k++){if(k>=N)break;float off=(float(k)-float(N-1)*.5)/u_res.x;vec3 s=pow(SRC(vec2((uv.x+off)*SF.x,row+.5)),vec3(2.2));sm+=vec3(dot(s,vec3(.299,.587,.114)));}
  vec3 env=pow(sm/float(N),vec3(1./2.2))*2.2;vec3 hh=env*.6/rows;float yd=abs(uv.y-rUV);float ed=29./10000.;
  vec3 col=vec3(smoothstep(hh.r*.5,hh.r*.5-ed,yd),smoothstep(hh.g*.5,hh.g*.5-ed,yd),smoothstep(hh.b*.5,hh.b*.5-ed,yd));
  o=mix(env/2.2,col,mm);}
 return vec4(clamp(o,0.,1.),1.);`],
 'ports of RetroArch slang-shaders crt/ (single frame, defaults; masks at output-pixel pitch on an N x enlarged source grid): crt-yo6 flat Trinitron (its phosphor LUT texture approximated by energy-normalised gaussian stripes, approx.); crtglow multi-pass chain folded into one pass (bloom from the thresholded source); fakelottes; gizmo-crt; gtu-v050 (RGB, no composite); lottesRVM 240p energy-conservation scanlines + slot mask; mame_hlsl (approx.: scanline / shadow-mask / distortion stages only); moire-resolve; monoCRT (envelope window centred)');

f('q16_crtterminal','CRT Presentation II (vt220 terminal / crt-maximus-royale TV box)',[S('Style',['vt220 (curved terminal with bezel reflections)','crt-maximus-royale (TV box with backlight, approx.)']),
  P('Source pixel size',1,8,2,1,'px'),P('Ambient light',0,1,.5,.01),P('Viewing distance',.5,1.5,.85,.01)],
 [Q16_DOWN('R(u_p1)'), `${Q16_SRC('R(u_p1)')}float dim=u_p2,zm=u_p3;
 if(m==0){/* vt220 (hunterk port of the Shadertoy VT220 terminal): curved content / screen / enclosure layers (curve radius 3), rounded-square bezel with noise-textured plastic, top shine, 5-tap blurred border reflections of the screen, ambient mix .5; content: corner mask, 2-px delta mask .5, gamma 2.5/2.2, sine scanlines .15 */
  float WD=.48,HT=.3*1.12,CR=3.,SMO=.004,SHN=.66,RBS=.04*3.;vec2 fc=uv*u_res;vec2 iR=u_res;
  #define Q16CS(q,rr) ((rr)*(q)/sqrt((rr)*(rr)-dot((q),(q))))
  #define Q16RS(q,bx,rr) (length(max(abs(q)-(bx),0.))-(rr))
  #define Q16STD(q,rr) Q16RS((q)-.5,vec2(WD,HT)+(rr),.05)
  #define Q16RND(q) fract(sin(dot((q),vec2(12.9898,78.233)))*43758.5453)
  vec2 uvC=(fc/iR-.5)/vec2(iR.y/iR.x,1.)*1.88*zm;uvC=Q16CS(uvC,CR);uvC*=.5/vec2(WD,HT);uvC*=vec2(.985,.95);uvC=uvC*.5+.5;
  vec2 uvS=(fc/iR-.5)/vec2(iR.y/iR.x,1.)*2.*zm;uvS=Q16CS(uvS,CR)*.5+.5;
  vec2 uvE=(fc/iR-.5)/vec2(iR.y/iR.x,1.)*2.*zm;uvE=Q16CS(uvE,CR*1.25)*.5+.5;
  vec2 uvSh=uvS;vec2 uvSh2=uvE;
  vec4 c1=vec4(0.),c2=vec4(0.);vec4 BZ=vec4(.8,.8,.6,0.);vec4 PH=vec4(.75,.75,.75,0.);float amb=.1;
  c1+=max(0.,SHN-distance(uvSh,vec2(.5,1.)))*smoothstep(SMO*.5,-SMO*.5,Q16STD(uvS+vec2(0.,.03),0.));
  c1+=max(0.,amb-.5*distance(uvS,vec2(.5)))*smoothstep(SMO,-SMO,Q16STD(uvS,0.));
  vec4 bz=vec4(0.);for(int i=0;i<12;i++)bz+=(clamp(BZ+Q16RND(uvSh2+float(i))*.05-.025,0.,1.)+Q16RND(uvE+1.+float(i))*.25*cos((uvSh2.x-.5)*3.1415*1.5))/12.;
  float HHW=.5*HT/WD;
  c1+=bz/3.*(1.+smoothstep(HHW-.025,HHW+.025,abs(atan(uvS.x-.5,uvS.y-.5))/3.1415)+smoothstep(HHW+.025,HHW-.025,abs(atan(uvS.x-.5,.5-uvS.y))/3.1415))*smoothstep(-SMO,SMO,Q16STD(uvS,0.))*smoothstep(SMO,-SMO,Q16STD(uvE,.05));
  c1+=(bz-.4)*smoothstep(-SMO*2.,SMO*2.,Q16RS(uvE-vec2(.5,.505),vec2(WD,HT)+.05,.05))*smoothstep(SMO*2.,-SMO*2.,Q16RS(uvE-vec2(.5,.495),vec2(WD,HT)+.05,.05));
  c1+=bz*smoothstep(-SMO,SMO,Q16RS(uvE-vec2(.5),vec2(WD,HT)+.05,.05))*smoothstep(SMO,-SMO,Q16RS(uvE-vec2(.5),vec2(WD,HT)+.15,.05));
  c1+=(bz-.4)*smoothstep(-SMO*2.,SMO*2.,Q16RS(uvE-vec2(.5,.495),vec2(WD,HT)+.15,.05))*smoothstep(SMO*2.,-SMO*2.,Q16RS(uvE-vec2(.5,.505),vec2(WD,HT)+.15,.05));
  c1+=max(0.,1.-2.*fc.y/iR.y)*vec4(1.,1.,1.,0.)*smoothstep(-.25,.25,Q16RS(uvC-vec2(.5,-.2),vec2(WD+.25,HT-.15),.1))*smoothstep(-SMO*2.,SMO*2.,Q16RS(uvE-vec2(.5),vec2(WD,HT)+.15,.05));
  amb=.2;c2+=max(0.,amb-.3*distance(uvS,vec2(.5)))*smoothstep(SMO,-SMO,Q16STD(uvS,0.));
  c2+=BZ*amb*.7*smoothstep(-SMO,SMO,Q16STD(uvS,0.))*smoothstep(SMO,-SMO,Q16STD(uvE,.05));
  c2-=BZ*smoothstep(-SMO*2.,SMO*10.,Q16STD(uvE,.05))*smoothstep(SMO*2.,-SMO*2.,Q16STD(uvE,.05));
  c2+=BZ*amb*smoothstep(-SMO,SMO,Q16STD(uvE,.05))*smoothstep(SMO,-SMO,Q16STD(uvE,.15));
  for(int i=0;i<5;i++){vec2 pq=uvC+(vec2(Q16RND(uvC+float(i)),Q16RND(uvC+float(i)+.1))-.5)*RBS;float eps=.0001;vec2 bq=vec2(1.05)*.5;float rq=.05/3.;pq-=.5;
   vec2 nrm=vec2(Q16RS(pq-vec2(eps,0.),bq,rq)-Q16RS(pq+vec2(eps,0.),bq,rq),Q16RS(pq-vec2(0.,eps),bq,rq)-Q16RS(pq+vec2(0.,eps),bq,rq))/eps;float dq=Q16RS(pq,bq,rq);pq+=.5;pq=vec2(1.-pq.x,pq.y);vec2 uvR=pq+dq*nrm;
   c2+=(PH-BZ*amb)*vec4(SRC(vec2(1.-uvR.x,uvR.y)*SF),1.)/5.*smoothstep(-SMO,SMO,Q16STD(uvS,0.))*smoothstep(SMO,-SMO,Q16STD(uvE,.05));}
  vec4 cc=mix(c2,c1,dim);
  if(uvC.x>0.&&uvC.x<1.&&uvC.y>0.&&uvC.y<1.){vec2 cq=min(uvC,1.-uvC)*vec2(1.,u_res.y/u_res.x);vec2 cd=vec2(.045);cq=cd-min(cq,cd);float cn=clamp((cd.x-length(cq))*800.,0.,1.);
   vec3 mk=mix(mix(vec3(1.,.5,1.),vec3(.5,1.,.5),mod(op.x,2.)),mix(vec3(.5,1.,.5),vec3(1.,.5,1.),mod(op.x,2.)),mod(op.y,2.));
   vec3 im=SRC(uvC*SF)*cn*mk;im=pow(im,vec3(2.5/2.2));im*=(1.-.15/3.)+.15*sin(uvC.y*6.2831853*SF.y);cc.rgb+=im;}
  o=cc.rgb;}
 else {/* crt-maximus-royale (DigiDwrf), approx.: crt-royale style tube (gaussian scanlines, aperture grille) inside a procedural TV box (the shader's PNG frame textures are not available), ambient backlight from the blurred screen edge colours */
  vec2 q=(uv-.5)/vec2(1.,1.)/zm*1.18;vec2 sq=q*vec2(1.,1.);vec2 cq=sq*2.;cq*=1.+.04*vec2(cq.y*cq.y,cq.x*cq.x);vec2 su=cq*.5+.5;
  float sbox=Q16RS(sq,vec2(.5),.035);
  vec3 bk=vec3(0.);float bw=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 bq=clamp(.5+sq*.92+vec2(float(i),float(j))*.06,0.,1.);float ww=exp(-.1*float(i*i+j*j));bk+=SRC(bq*SF)*ww;bw+=ww;}bk/=bw;
  float fb=Q16RS(sq,vec2(.5)+.07,.06);vec3 col=bk*1.2*exp(-max(fb,0.)*7.)*dim;
  if(fb<0.){float edge=smoothstep(-.012,0.,fb);vec3 plast=vec3(.11,.105,.1)*(1.+.25*(sq.y+.5))+.03*vnoise(op*.7);col=mix(plast,plast*.6,edge);
   float lip=smoothstep(.0,.01,-sbox)*smoothstep(.02,.0,-sbox);col+=lip*.04;}
  if(sbox<0.&&su.x>0.&&su.x<1.&&su.y>0.&&su.y<1.){vec2 p=su*SF;float yy=p.y-.5;float up=floor(yy);float dU=yy-up;vec3 a=RL(SRC(vec2(p.x,up+.5))),b=RL(SRC(vec2(p.x,up+1.5)));
   vec3 sa=mix(vec3(.28),vec3(.5),sqrt(a)),sb=mix(vec3(.28),vec3(.5),sqrt(b));vec3 t=a*exp(-.5*dU*dU/(sa*sa))/sa+b*exp(-.5*(1.-dU)*(1.-dU)/(sb*sb))/sb;t*=.42;
   float mi=mod(op.x,3.);vec3 mk=mi<1.?vec3(1.,.35,.35):mi<2.?vec3(.35,1.,.35):vec3(.35,.35,1.);t*=mk*1.45;
   vec2 vq=su-.5;t*=1.-dot(vq,vq)*.5;vec3 scr=pow(clamp(t,0.,1.),vec3(1./2.2));col=mix(col,scr,smoothstep(0.,-.006,sbox));
   col+=dim*.06*smoothstep(.45,0.,length(su-vec2(.32,.78)));}
  o=col;}
 return vec4(clamp(o,0.,1.),1.);`],
 'vt220: port of hunterk\'s RetroArch vt220 slang (Shadertoy VT220 terminal) with analytic bezel, shine and blurred border reflections; still frame. crt-maximus-royale: approx. (crt-royale-style tube in a procedural TV box with ambient backlight; the preset\'s 25 passes and frame/phosphor PNGs are not reproduced)');
