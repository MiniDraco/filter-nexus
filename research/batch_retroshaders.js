/* ================= retroshaders (round 10): RetroArch slang CRT / NTSC / LCD / handheld-colour shaders ================= */
/* Same-size engine: the input is treated as N×-enlarged source pixels ('Source pixel size').  Pass 0 box-averages every
   N×N block into a compact low-res copy in the bottom-left corner of the texture (1 texel per source pixel), so later
   passes get hardware-bilinear sampling of the source grid exactly like the shaders' `texture(Source, ...)`.
   SRC(q): bilinear source sample at source-texel coords q (centres at +.5) · TXL(q): nearest source texel containing q. */
const RTS_DOWN = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 w=floor(uv*u_res);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);
 vec3 a=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 q=floor(w*Bw+(vec2(float(i),float(j))+.5)*Bw*.25)+.5;a+=O(min(q,u_res-.5)/u_res).rgb;}return vec4(a/16.,1.);`;
const RTS_SRC = b => `float Bw=max(${b},1.);vec2 SS=ceil(u_res/Bw);vec2 SF=u_res/Bw;vec2 op=floor(uv*u_res);
 #define SRC(q) T(clamp((q),vec2(.5),SS-.5)/u_res).rgb
 #define TXL(q) T((clamp(floor(q),vec2(0.),SS-1.)+.5)/u_res).rgb
 #define RL(v) pow(max((v),vec3(0.)),vec3(2.4))
 `;

f = add('Retro');
f('crtshaders2','CRT Shaders II (RetroArch classics)',[S('Shader',['crt-hyllian','crt-pi','crt-aperture','crt-mattias','zfast-crt','crt-sines','crt-nobody','crt-frutbunn','crt-caligari','crt-cgwg-fast','crt-yeetron','crt-1tap','crt-consumer','newpixie-crt']),
  P('Source pixel size',1,8,3,1,'px'),P('Mask & scanline strength',0,1.5,1,.01),P('Curvature',0,2,1,.01)],
 [RTS_DOWN('R(u_p1)'), `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);float ms=u_p2,cv=u_p3;vec3 o=vec3(0.);
 float MW[9]=float[9](.15018,.09524,.02564,.09524,.05861,.01465,.02564,.01465,.00366);
 #define MBL(TC,OF,OUT) {OUT=vec3(0.);for(int j_=-2;j_<=2;j_++)for(int i_=-2;i_<=2;i_++){OUT+=pow(SRC(((TC)+vec2(float(i_),float(j_))*(OF)/u_res)*SF),vec3(2.2))*MW[abs(i_)*3+abs(j_)];}}
 #define WGT3(q) pow(1.-clamp((q),-1.,1.)*clamp((q),-1.,1.),3.)
 #define CMASK(mk,cc) ((mk)+(1.-2.*(mk))*pow(abs((mk)-(cc)),(mk)*ms*1.4+1.))
 if(m==0){/* crt-hyllian: Catmull-Rom rows, anti-ringing, beam width by colour, gaussian scanlines, aperture mask (mask gamma 2.4) */
  vec2 pc=uv*SF-.5;vec2 lr=floor(pc),fp=pc-lr;float x=fp.x;vec4 wx=vec4(((-.5*x+1.)*x-.5)*x,(1.5*x-2.5)*x*x+1.,((-1.5*x+2.)*x+.5)*x,(.5*x-.5)*x*x);
  vec3 a0=RL(TXL(lr+vec2(-1.,0.))),a1=RL(TXL(lr)),a2=RL(TXL(lr+vec2(1.,0.))),a3=RL(TXL(lr+vec2(2.,0.)));
  vec3 b0=RL(TXL(lr+vec2(-1.,1.))),b1=RL(TXL(lr+vec2(0.,1.))),b2=RL(TXL(lr+vec2(1.,1.))),b3=RL(TXL(lr+vec2(2.,1.)));
  vec3 c0=clamp(a0*wx.x+a1*wx.y+a2*wx.z+a3*wx.w,min(a1,a2),max(a1,a2)),c1=clamp(b0*wx.x+b1*wx.y+b2*wx.z+b3*wx.w,min(b1,b2),max(b1,b2));
  vec3 l0=mix(vec3(.72),vec3(1.),c0),l1=mix(vec3(.72),vec3(1.),c1);float sst=.72*ms;vec3 d0=sst*fp.y/(l0*l0),d1=sst*(1.-fp.y)/(l1*l1);
  o=clamp(c0*exp(-16.*d0*d0)+c1*exp(-16.*d1*d1),0.,1.);vec3 mk=mod(op.x,2.)<1.?vec3(1.,0.,1.):vec3(0.,1.,0.);o=CMASK(mk,o);o=pow(clamp(o,0.,1.),vec3(1./2.2));}
 else if(m==1){/* crt-pi (davej): barrel distortion, multisampled scanline weight, cubic-shaped vertical sampling, trinitron mask */
  vec2 cd=vec2(.10,.15)*cv;vec2 q=uv-.5;float rsq=dot(q,q);q+=q*cd*rsq;q*=1.-.23*cd;if(abs(q.x)>=.5||abs(q.y)>=.5)return vec4(0.,0.,0.,1.);
  vec2 tp=(q+.5)*SF;float tc=floor(tp.y)+.5;float dl=tp.y-tc;float fw=1./(3.*Bw);
  #define PIW(dd) max(1.-(dd)*(dd)*6.,.12)
  float sw=(PIW(dl)+PIW(dl-fw)+PIW(dl+fw))/3.;sw=mix(1.,sw,min(ms,1.))*1.5;float ty=tc+sign(dl)*.5*pow(abs(dl)*2.,3.);
  o=SRC(vec2(tp.x,ty))*sw;float wm=fract((op.x+.5)/3.);vec3 mk=vec3(1.-.3*ms);if(wm<.3333)mk.r=1.;else if(wm<.6667)mk.g=1.;else mk.b=1.;o*=mk;}
 else if(m==2){/* crt-aperture (EasyMode): sharp x soft Lanczos, beam-size scanlines, glow halation + diffusion, 2-colour aperture mask */
  vec2 pc=uv*SF;vec2 tcx=floor(pc)+.5;vec2 dd=-(fract(pc)-.5);vec3 gl=vec3(0.);float gw=0.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float wx_=(dd.x+float(i))/.5,wy_=(dd.y+float(j))/.5;float ww=exp2(-wx_*wx_)*exp2(-wy_*wy_);gl+=RL(TXL(tcx+vec2(float(i),float(j))))*ww;gw+=ww;}gl/=gw;
  float rowc=floor(pc.y)+.5;vec3 cs[2];for(int k=0;k<2;k++){float sh=k==0?1.:3.;float sx=pc.x*sh-.5;float fx=floor(sx),dx=fract(sx);vec4 cf=3.14159265*vec4(dx+1.,dx,dx-1.,dx-2.);cf=max(abs(cf),vec4(1e-4));cf=2.*sin(cf)*sin(cf*.5)/(cf*cf);cf/=dot(cf,vec4(1.));
   cs[k]=RL(SRC(vec2((fx+.5)/sh,rowc)))*(cf.x+cf.y)+RL(SRC(vec2((fx+1.5)/sh,rowc)))*(cf.z+cf.w);}
  vec3 soft=max(cs[0],0.),sharp=max(cs[1],0.);o=sqrt(sharp*soft);vec3 bm=mix(vec3(.5),vec3(1.5),pow(soft,vec3(1./2.5)));vec3 xm=2./bm;vec3 xo=xm*.5;
  vec3 sw=smoothstep(0.,1.,1.-abs(fract(pc.y)*xm-xo))*xo;o*=mix(vec3(1.),sw,min(ms,1.));gl=clamp(gl-o,0.,1.);o+=gl*gl*.1;
  vec3 mk=mod(op.x,2.)<1.?vec3(1.,0.,1.):vec3(0.,1.,0.);o=mix(o,o*mk*2.,.3*ms);o+=gl*.05;o=pow(max(o*1.5,0.),vec3(1./2.4));}
 else if(m==3){/* crt-mattias: curved tube, per-channel offset 5x5 blurs + ghost blurs, vignette, 1.5/px scanlines, vertical lines, noise */
  vec2 cq=(uv-.5)*2.2;cq.x*=1.+pow(abs(cq.y)/5.,2.);cq.y*=1.+pow(abs(cq.x)/4.,2.);cq=cq*.5+.5;cq=cq*.92+.04;vec2 u=mix(uv,cq,.5*cv);
  vec3 br,bg,bb;MBL(u+vec2(.0009,.0009),1.2,br)MBL(u+vec2(0.,-.0015),1.2,bg)MBL(u+vec2(-.0015,0.),1.2,bb)o=vec3(br.r,bg.g,bb.b)+.005;
  MBL(u+vec2(.0009,.0009),2.25,br)MBL(u+vec2(0.,-.0015),1.75,bg)MBL(u+vec2(-.0015,0.),1.25,bb)o+=.2*vec3(br.r,bg.g,bb.b)-.005;
  MBL(.75*vec2(.01,-.027)+u+vec2(.001,.001),7.,br)MBL(.75*vec2(-.022,-.02)+u+vec2(0.,-.002),5.,bg)MBL(.75*vec2(-.02,0.)+u+vec2(-.002,0.),3.,bb)o+=.05*vec3(.701*br.r,.413*bg.g,.886*bb.b);
  o=clamp(o*.4+.6*o*o,0.,1.);float vg=pow(max(16.*u.x*u.y*(1.-u.x)*(1.-u.y),0.),.3);o*=vg*vec3(.95,1.05,.95);o=mix(o,o*o,.3)*3.8;
  float sc=pow(clamp(.35+.15*sin(u.y*u_res.y*1.5),0.,1.),.9);o*=mix(.39,sc,min(ms,1.));float oo=2.*mod(op.y,2.)/u_res.x;o*=1.-.15*ms*clamp((mod(op.x+oo,2.)-1.)*2.,0.,1.);
  o*=1.-.25*vec3(hash(op),hash(op+.3),hash(op+.5));o=pow(max(o,0.),vec3(.45));if(u.x<0.||u.x>1.||u.y<0.||u.y>1.)o=vec3(0.);}
 else if(m==4){/* zfast-crt (SoltanGris42): 4f^3 vertical shaping, x blur 0.3, luminance-dependent scanline weights, fading 3-px mask */
  vec2 p=uv*SF;vec2 ic=floor(p)+.5;vec2 fr=p-ic;vec2 pt=ic+4.*fr*fr*fr;pt.x=mix(pt.x,p.x,.3);float Y=fr.y*fr.y,YY=Y*Y;
  float mk=1.-float(fract((op.x)*-.3333)<=.33333)*.25*ms;vec3 cl=SRC(pt);float s1=1.25-6.*ms*(Y-2.05*YY),s2=1.-8.*ms*(YY-2.8*YY*Y);o=cl*mix(s1*mk,s2,dot(cl,vec3(.2667)));}
 else if(m==5){/* crt-sines (DariusG): sine-shaped beam, colour-dependent beam width, CRT colour matrix, glass reflection, glow, vignette */
  vec2 pp=uv*2.-1.;vec2 q0=pp;pp.x+=q0.y*q0.y*q0.x*.01*cv;pp.y+=q0.x*q0.x*q0.y*.04*cv;vec2 u=pp*.5+.5;vec2 p=u*SF;vec2 ic=floor(p)+.5;float y=p.y-ic.y;float x=fract(p.x);
  vec3 cl=RL(SRC(vec2(ic.x+x*x*(2.-x),ic.y+16.*y*y*y*y*y)));cl*=.95;cl=clamp(cl*mat3(1.05,.1,-.1,-.05,.9,0.,.05,0.,1.1),0.,1.);
  cl+=vec3(pow(max(1.-distance(u,vec2(.5)),0.),6.)*.015);float l=max(cl.r,max(cl.g,cl.b));cl*=exp(-mix(8.,6.,l)*y*y*mix(1.3,1.,l)*ms);
  vec3 mk=mod(op.x,2.)<1.?vec3(mix(1.,.4,min(ms,1.))):vec3(1.);cl*=mix(mk,vec3(1.2),l*.5);cl*=mix(vec3(1.5),vec3(1.),l);o=sqrt(max(cl,0.));
  vec3 gg=vec3(0.);float KS[5]=float[5](.0625,.25,.375,.25,.0625);for(int j=-1;j<=1;j++)for(int i=-2;i<=2;i++)gg+=RL(SRC(p+vec2(float(i),float(j)*1.25)))*(KS[i+2]+KS[j+2]);o+=gg/1.875*.06;
  float dist=distance(u,vec2(.5));o*=1.-.25*dist;if(dist>.7)o=vec3(0.);}
 else if(m==6){/* crt-nobody (Hyllian): spherical warp, 2x2 wgt() kernel, beam width by max channel, aperture mask with mask gamma */
  vec2 q=uv*2.-1.;float rr=6./max(cv,.05);vec2 u=q*(rr/sqrt(rr*rr+1.-dot(q,q)))/(rr/sqrt(rr*rr+1.))*.5+.5;if(cv<.01)u=uv;
  vec2 dq=abs(2.*u-1.)-(1.-.04);float bl=length(max(dq,0.))+min(max(dq.x,dq.y),0.)-.04;float cval=cv<.01?1.:smoothstep(.005,-.005,bl);
  vec2 pc=u*SF;vec2 tq=floor(pc);vec2 pos=fract(pc)-.5;vec2 dr=sign(pos);pos=abs(pos);
  vec3 A=RL(TXL(tq)),Bq=RL(TXL(tq+vec2(dr.x,0.))),C=RL(TXL(tq+vec2(0.,dr.y))),D=RL(TXL(tq+dr));
  float wx0=WGT3(pos.x/1.111111),wx1=WGT3((1.-pos.x)/1.111111);vec3 c0=A*wx0+Bq*wx1,c1=C*wx0+D*wx1;
  float l0=mix(.8,1.,max(c0.r,max(c0.g,c0.b))),l1=mix(.8,1.,max(c1.r,max(c1.g,c1.b)));float sz=mix(1.6,.86,min(ms,1.));
  o=clamp(c0*WGT3(pos.y/(sz*l0))+c1*WGT3((1.-pos.y)/(sz*l1)),0.,1.);vec2 mc=op*(cv<.01?1.:.5);vec3 mk=mod(floor(mc.x),2.)<1.?vec3(1.,0.,1.):vec3(0.,1.,0.);
  o=CMASK(mk,o);o=pow(clamp(o,0.,1.),vec3(1./2.2))*cval;}
 else if(m==7){/* crt-frutbunn: quadratic curvature, 3x3 gaussian, vignetting, cosine scanlines along curved rows */
  vec2 st=uv-.5;float d=length(st*.5*st*.5);vec2 u=cv>.01?st*d*cv+st*mix(1.,.935,min(cv,1.)):st;float b=1./asp();vec3 cl=vec3(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float ww=(i==0?(j==0?.195346:.123317):(j==0?.123317:.077847));cl+=SRC((u+.5)*SF+vec2(float(i),float(j))*b*.5)*ww;}
  cl*=1.-min(1.,d*9.);float s=2.5+Bw;float jj=cos(u.y*SF.y*s)*.25*ms;cl-=cl*jj;if(cv>.01){float mm=max(0.,1.-2.*max(abs(u.x),abs(u.y)));cl*=min(mm*200.,1.);}o=cl;}
 else if(m==8){/* crt-caligari: elliptical spot (w 0.9, h 0.65) weights over the 2x2 nearest texels, gamma 2.4 -> 2.2, colour boost 1.45 */
  vec2 cd=uv*SF;vec2 pc=floor(cd)+.5;float spw=.9,sph=mix(1.25,.65,min(ms,1.));
  #define CWT(q) (1.-min((q),1.)*min((q),1.))*(1.-min((q),1.)*min((q),1.))
  float dx=cd.x-pc.x;float h0=CWT(abs(dx)/spw);vec2 ox=vec2(dx>0.?1.:-1.,0.);float dx1=1.-abs(dx);float h1=CWT(dx1/spw);
  float dy=cd.y-pc.y;float v0=CWT(abs(dy)/sph);vec2 oy=vec2(0.,dy>0.?1.:-1.);float dy1=1.-abs(dy);float v1=CWT(dy1/sph);
  vec3 cl=(RL(TXL(pc))*h0+RL(TXL(pc+ox))*h1)*v0;cl+=RL(TXL(pc+oy))*v1*h0+RL(TXL(pc+ox+oy))*v1*h1;o=clamp(pow(max(cl*1.45,0.),vec3(1./2.2)),0.,1.);}
 else if(m==9){/* crt-cgwg-fast: 4-tap Lanczos-2 rows, gaussian beams whose width grows with brightness (gamma 2.7), magenta/green dot mask */
  vec2 rs=uv*SF-.5;vec2 lr=floor(rs),ur=rs-lr;vec4 cf=vec4(1.+ur.x,ur.x,1.-ur.x,2.-ur.x)+.005;cf=sin(3.14159265*cf)*sin(1.5707963*cf)/(cf*cf);cf/=dot(cf,vec4(1.));
  vec3 cA=clamp(TXL(lr+vec2(-1.,0.))*cf.x+TXL(lr)*cf.y+TXL(lr+vec2(1.,0.))*cf.z+TXL(lr+vec2(2.,0.))*cf.w,0.,1.);
  vec3 cB=clamp(TXL(lr+vec2(-1.,1.))*cf.x+TXL(lr+vec2(0.,1.))*cf.y+TXL(lr+vec2(1.,1.))*cf.z+TXL(lr+vec2(2.,1.))*cf.w,0.,1.);
  vec3 wd1=2.*pow(cA,vec3(4.))+2.,wd2=2.*pow(cB,vec3(4.))+2.;cA=pow(cA,vec3(2.7));cB=pow(cB,vec3(2.7));float sk=3.33*mix(.45,1.,min(ms,1.));
  vec3 w1=vec3(sk*ur.y),w2=vec3(-sk*ur.y+sk);w1=exp(-pow(w1*inversesqrt(.5*wd1),wd1))/(.132*wd1+.392);w2=exp(-pow(w2*inversesqrt(.5*wd2),wd2))/(.132*wd2+.392);
  vec3 mc=mix(vec3(1.,1.-.3*ms,1.),vec3(1.-.3*ms,1.,1.-.3*ms),floor(mod(op.x,2.)));o=pow(max(mc*(cA*w1+cB*w2),0.),vec3(.454545));}
 else if(m==10){/* crt-yeetron (Retro Engine): RGB dimming triads, |sin| scanlines, shaped texel lookup, per-channel colour modulation */
  vec2 vp=op+.5;float ip=fract((vp.y*3.+vp.x)*.166667);vec3 inten=mix(vec3(1.),vec3(1.2,.9,.9),min(ms,1.));vec3 si=ip<.333?inten:ip<.666?inten.zxy:inten.yzx;
  vec2 pp=uv*SF;vec2 rp=floor(pp);float sa=mix(1.,clamp(abs(sin(pp.y*3.14159))+.25,.5,1.),min(ms,1.));pp=fract(pp)-.5;vec2 inv=-pp;
  vec2 nt=vec2(clamp(-abs(inv.x*.5)+1.5,.8,1.25),clamp(-abs(inv.y*2.)+1.25,.5,1.));vec2 cm=vec2(nt.x*nt.y,nt.x*((sa+nt.y)*.5));sa*=nt.x;
  vec3 tx=SRC((pp-clamp(pp,-.25,.25))*2.+rp+.5);o=si*vec3(sa*tx.r,cm*tx.gb);}
 else if(m==11){/* crt-1tap v1.4 (fishku): one shaped bilinear tap, beam coverage integrated analytically over the pixel footprint */
  vec2 sc=uv*SF-vec2(.5,.31);float xi=floor(sc.x),xf=sc.x-xi;float hs=mix(6.,1.,.8);float xx=2.*xf-1.;float so=.5+.5*hs*xx*inversesqrt(1.+(hs*hs-1.)*xx*xx);
  vec3 sg=SRC(vec2(xi+so+.5,floor(sc.y)+.5));vec3 wd=min(mix(vec3(mix(1.,.1,min(ms,1.))),vec3(mix(1.,.95,min(ms,1.))),pow(clamp(sg,0.,1.),vec3(.45))),vec3(1.));float fh=1./Bw;
  #define BPF(yy) (floor(yy)*wd+clamp(vec3((yy)-floor(yy)-.5)+.5*wd,vec3(0.),wd))
  vec3 ar=BPF(sc.y+.5*fh)-BPF(sc.y-.5*fh);o=sqrt(max(sg*sg*ar/fh,0.));}
 else if(m==12){/* crt-consumer (DariusG): warp, pre-scale sharpening, convergence offsets, exp2 scanlines, magenta/green mask, glow, rounded corners */
  vec2 pw=uv*2.-1.;pw*=vec2(1.+pw.y*pw.y*.03*cv,1.+pw.x*pw.x*.04*cv);vec2 u=pw*.5+.5;vec2 tx=u*SF;vec2 fp=fract(tx);vec2 cdst=fp-.5;
  vec2 fpp=(cdst-clamp(cdst,-.3333,.3333))*1.5+.5;vec2 cc=floor(tx)+fpp;vec3 s1=SRC(cc+vec2(.25,.1)),s2=SRC(cc),s3=SRC(cc-vec2(.25,.1));
  vec3 cl=vec3(s1.r*.5+s2.r*.5,s1.g*.25+s2.g*.5+s3.g*.25,s2.b*.5+s3.b*.5);cl=2.*pow(cl,vec3(2.8))-pow(cl,vec3(3.6));float lum=dot(cl,vec3(.3,.6,.1));float ff=fract(fp.y-.5);
  #define CSW(yy) exp2(-mix(6.,8.,(yy))*ms*pow((yy)*mix(1.45,1.05,lum),2.))
  cl=cl*CSW(ff)+cl*CSW(1.-ff);float lum1=dot(cl,vec3(.3,.6,.1));float md=mix(1.,.2,min(ms,1.));vec3 mk=fract(op.x*.4999)<.4999?vec3(1.,md,1.):vec3(md,1.,md);
  cl*=mix(mk,vec3(1.),lum1*.98);cl*=mix(1.25,1.,max(cl.r,max(cl.g,cl.b)));cl=pow(max(cl,0.),vec3(1./2.25));vec3 gg=vec3(0.);
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)gg+=RL(SRC(tx+vec2(float(i),float(j))))*exp(-.25*float(i*i+j*j));cl+=.3*gg/12.6;
  vec2 cq=abs(u-.5)*2.;vec2 c2=max(cq-(1.-.03*2.),0.);float corner=cv<.01?1.:clamp((1.-length(c2)/.06)*20.,0.,1.);if(u.x<0.||u.y<0.||u.x>1.||u.y>1.)corner=0.;o=cl*corner;}
 else{/* newpixie-crt (Mattias Gustavsson): curved tube, RGB bleed offsets, blurred ghosting, level curve, vignette, scanlines, mask, Hejl filmic */
  vec2 cq=(uv-.5)*vec2(.925,1.095)*2.;cq.x*=1.+pow(abs(cq.y)/4.,2.);cq.y*=1.+pow(abs(cq.x)/3.,2.);cq=cq/2.+.5;cq=cq*.92+.04;vec2 cuv=mix(uv,cq,.6*min(cv,1.6));
  vec2 su=cuv*1.101-.0505+vec2(.003,-.001);float xw=sin(op.y*1.5)/u_res.x*.25;
  #define NPS(tc) (pow(max(SRC(((tc)*vec2(1.025,.92)+vec2(-.0125,.04))*SF),0.),vec3(2.2))*1.25)
  #define NPB(tc,OUT) {OUT=vec3(0.);for(int j_=-2;j_<=2;j_++)for(int i_=-2;i_<=2;i_++)OUT+=pow(max(SRC(((tc)*vec2(1.025,.92)+vec2(-.0125,.04))*SF+vec2(float(i_),float(j_))*2.),0.),vec3(2.2))*exp(-.3*float(i_*i_+j_*j_));OUT*=1.25/8.73;}
  o.r=NPS(vec2(xw+su.x+.0009,su.y+.0009)).r+.02;o.g=NPS(vec2(xw+su.x,su.y-.0011)).g+.02;o.b=NPS(vec2(xw+su.x-.0015,su.y)).b+.02;
  float ii=clamp(dot(o,vec3(.299,.587,.114)),0.,1.);ii=ii*ii*.85+.15;vec3 gr,gg,gb;NPB(vec2(xw-.014,-.027)*.85+su+vec2(.001,.001),gr)NPB(vec2(xw-.019,-.02)*.85+su+vec2(0.,-.002),gg)NPB(vec2(xw-.017,-.003)*.85+su+vec2(-.002,0.),gb)
  vec3 gs=gr*vec3(.5,.25,.25),gq=gg*vec3(.25,.5,.25),gu=gb*vec3(.25,.25,.5);float gh=.15;o+=gh*(.701*pow(clamp(3.*gs,0.,1.),vec3(2.))+.413*pow(clamp(3.*gq,0.,1.),vec3(2.))+.886*pow(clamp(3.*gu,0.,1.),vec3(2.)))*ii;
  o*=vec3(.95,1.05,.95);o=clamp(o*1.3+.75*o*o+1.25*o*o*o*o*o,0.,10.);float vg=.01+16.*cuv.x*cuv.y*(1.-cuv.x)*(1.-cuv.y);o*=1.3*sqrt(max(vg,0.));
  float sc=pow(clamp(.35+.18*sin(-cuv.y*u_res.y*1.5),0.,1.),.9);o*=mix(.4,sc,min(ms,1.))/.4*.4;o*=1.-.23*ms*clamp(mod(op.x,3.)/2.,0.,1.);
  vec3 xx=max(o-.004,0.);o=(xx*(6.2*xx+.5))/(xx*(6.2*xx+1.7)+.06);o-=.015*pow(vec3(hash(op),hash(op+1.3),hash(op+2.7)),vec3(1.5));}
 return vec4(clamp(o,0.,1.),1.);`],
 'ports of the RetroArch slang shaders (Hyllian, davej, EasyMode, Mattias, SoltanGris42, DariusG, frutbunn, caligari, cgwg, yeetron, fishku, Gustavsson) on an N×-enlarged source grid; single frame (no animation), multi-pass presets folded into one pass (newpixie ghost blur approx.)', 1);

f('crtpresent','CRT Presentation (Mega Bezel / koko-aio style)',[S('Style',['Mega Bezel (tube in reflective bezel)','koko-aio (ambient light + halo)']),P('Source pixel size',1,8,3,1,'px'),P('Screen size',.6,.98,.84,.01),P('Reflection / ambient light',0,1,.6,.01)],
 [RTS_DOWN('R(u_p1)'),
  `${RTS_SRC('R(u_p1)')}vec2 pc=uv*SF-.5;vec2 lr=floor(pc),fp=pc-lr;vec3 r0=RL(SRC(vec2(pc.x+.5,lr.y+.5))),r1=RL(SRC(vec2(pc.x+.5,lr.y+1.5)));
  vec3 w0=mix(vec3(.55),vec3(.9),sqrt(r0)),w1=mix(vec3(.55),vec3(.9),sqrt(r1));vec3 o=r0*exp(-pow(fp.y/w0,vec3(2.))*2.2)+r1*exp(-pow((1.-fp.y)/w1,vec3(2.))*2.2);
  vec3 h=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)h+=RL(SRC(uv*SF+vec2(float(i),float(j))*1.5))*exp(-.35*float(i*i+j*j));o=o*1.25+h/7.6*.18;
  return vec4(pow(clamp(o,0.,1.),vec3(1./2.2)),1.);`,
  `int m=int(u_p0+.5);float sz=u_p2,rf=u_p3;vec2 op=floor(uv*u_res);float a=asp();vec2 q=(uv-.5)/sz;vec2 qq=q*2.;
  float cw=m==0?.05:.025;vec2 cq=qq*(1.+vec2(.035,.05)*dot(qq,qq)*(m==0?1.:.6));vec2 su=cq*.5+.5;
  vec2 dq=abs(cq)-(1.-cw);float sd=length(max(dq,0.))+min(max(dq.x,dq.y),0.)-cw;float inS=smoothstep(.006,-.006,sd);vec3 o=vec3(0.);
  if(inS>0.){vec3 sc=T(clamp(su,0.,1.)).rgb;vec3 mk=vec3(.72);float ph=mod(op.x,3.);if(ph<1.)mk.r=1.;else if(ph<2.)mk.g=1.;else mk.b=1.;if(m==0&&mod(op.y+(mod(floor(op.x/3.),2.)*2.),4.)<1.)mk*=.75;
   sc=sc*mk*1.22;float vg=pow(max(16.*su.x*su.y*(1.-su.x)*(1.-su.y),0.),.12);o=sc*vg;if(m==0)o+=vec3(.06)*pow(max(1.-length(cq-vec2(-.45,.55)),0.),4.);}
  vec2 cl=clamp(su,0.,1.);vec3 rflx=vec3(0.);float tw=0.;vec2 ms=cl-(su-cl)*1.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 off=vec2(float(i),float(j))*(.012+.25*max(sd,0.));float ww=exp(-.15*float(i*i+j*j));rflx+=T(clamp(ms+off,0.,1.)).rgb*ww;tw+=ww;}rflx/=tw;
  vec3 bg;if(m==0){float d=max(sd,0.);float bev=smoothstep(.0,.03,d)*(1.-smoothstep(.16,.2,d));vec3 plast=vec3(.07,.068,.066)*(1.-.4*smoothstep(.0,.35,d))+vec3(.05)*(1.-smoothstep(.0,.02,d));
   float edgeFade=exp(-d*14.);bg=plast+rflx*rf*.85*edgeFade*(.6+.4*bev);float outer=smoothstep(.34,.36,d);bg=mix(bg,vec3(.02)+rflx*rf*.06,outer);}
  else{vec3 amb=vec3(0.);float aw=0.;for(int k=0;k<24;k++){float an=float(k)*.2618;vec2 dir=vec2(cos(an),sin(an));vec2 sp_=clamp(su+dir*.35,0.02,.98);amb+=T(sp_).rgb;aw+=1.;}amb/=aw;
   float d=max(sd,0.);float bez=1.-smoothstep(.035,.045,d);vec3 halo=rflx*exp(-d*9.);bg=mix(amb*rf*1.1*(1.-.55*smoothstep(.0,.9,d))+halo*rf*.6,vec3(.03)+halo*rf*.3,bez);}
  return vec4(clamp(mix(bg,o,inS),0.,1.),1.);`],
 'look approximations of the big RetroArch presentation presets: Mega Bezel (HyperspaceMadness) = curved tube with slot mask inside a plastic bezel that reflects the blurred screen; koko-aio (kokoko3k) = ambient "ambilight" from the screen colours, thin bezel, halo glow; scanlines+glow pass then composite pass (approx.)');

f('ntscretro','NTSC Shaders (Maister / MD rainbows / TV-out)',[S('Shader',['Maister NTSC 2-phase composite','Maister NTSC 2-phase S-Video','Maister NTSC 3-phase composite','Maister NTSC 3-phase S-Video','ntsc-md-rainbows (Mega Drive, MAME NTSC)','tvout-tweaks (composite, bandwidth-limited YIQ)']),
  P('Source pixel size',1,8,2,1,'px'),P('Artifacts / fringing',0,2,1,.01),P('Saturation',0,2,1,.01)],
 [RTS_DOWN('R(u_p1)'), `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);float art=u_p2,sat_=u_p3;vec2 sp=uv*SF;float line=floor(sp.y);vec3 sig=vec3(0.);
  #define YIQ(c) vec3(dot((c),vec3(.2989,.587,.114)),dot((c),vec3(.5959,-.2744,-.3216)),dot((c),vec3(.2115,-.5229,.3114)))
  #define RGBQ(q) vec3(dot((q),vec3(1.,.956,.621)),dot((q),vec3(1.,-.272,-.6474)),dot((q),vec3(1.,-1.106,1.7046)))
  if(m<=3){bool two=m<=1;bool comp=m==0||m==2;float fr=comp?art:0.,ar=comp?art:0.;float cmf=two?4.*3.14159265/15.:3.14159265/3.;
   float cph=two?3.14159265*mod(line,2.):.6667*3.14159265*mod(line,3.);float X0=floor(sp.x*4.);
   float LF2[33]=float[33](-.000174844,-.000205844,-.000149453,-.000051693,0.,-.000066171,-.000245058,-.000432928,-.000472644,-.000252236,.000198929,.000687058,.000944112,.000803467,.000363199,.000013422,.000253402,.001339461,.002932972,.003983485,.003026683,-.001102056,-.008373026,-.0168977,-.02291448,-.021642347,-.008863273,.017271957,.05492192,.098342579,.139044281,.168055832,.178571429);
   float CF2[33]=float[33](.001384762,.001678312,.002021715,.002420562,.00288046,.003406879,.004004985,.004679445,.005434218,.006272332,.007195654,.008204665,.009298238,.01047345,.011725413,.013047155,.014429548,.015861306,.017329037,.018817382,.02030922,.021785952,.023227857,.0246145,.025925203,.027139546,.028237893,.02920191,.030015081,.03066317,.03113464,.031420995,.031517031);
   float LF3[25]=float[25](-.00001202,-.000022146,-.000013155,-.00001202,-.000049979,-.00011394,-.00012215,-.000005612,.000170516,.000237199,.00016964,.000285688,.000984574,.002018683,.002002275,-.000909882,-.007049081,-.01322286,-.012606931,.00246086,.035868225,.084016453,.1355635,.175261268,.190176552);
   float CF3[25]=float[25](-.000118847,-.000271306,-.000502642,-.000930833,-.001451013,-.002064744,-.002700432,-.003241276,-.003524948,-.003350284,-.002491729,-.000721149,.002164659,.006313635,.011789103,.01854566,.026414396,.03510071,.044196567,.053207202,.061590275,.068803602,.074356193,.077856564,.079052396);
   int TP=two?32:24;for(int k=-32;k<=32;k++){int ak=k<0?-k:k;if(ak>TP)continue;float X=X0+float(k);vec3 c0=TXL(vec2((X+.5)*.25,line+.5));vec3 y=YIQ(c0);float mp=cph+X*cmf;float im=cos(mp),qm=sin(mp);
    y.yz*=vec2(im,qm);y=vec3(y.x+fr*(y.y+y.z),ar*y.x+2.*sat_*y.y,ar*y.x+2.*sat_*y.z);y.yz*=vec2(im,qm);int ix=TP-ak;float lw=two?LF2[ix]:LF3[ix];float cw=two?CF2[ix]:CF3[ix];sig+=y*vec3(lw,cw,cw);}
   return vec4(clamp(RGBQ(sig),0.,1.),1.);}
  if(m==4){float dtp=47.9/320.;float fsc=3.579545;float ys=0.,is_=0.,qs=0.,wy=0.,wi=0.,wq=0.;float fcy=fsc-1.725,fci=1.75*.5,fcq=1.45*.5;
   for(int k=-28;k<=28;k++){float xs=sp.x+float(k)*.25;float t=xs*dtp;vec3 q=YIQ(SRC(vec2(xs,line+.5)));float ph=6.2831853*fsc*t;float cs=q.x+(q.y*cos(ph)+q.z*sin(ph))*min(art,1.2);
    float tau=float(k)*.25*dtp;float hn=.5+.5*cos(3.14159265*float(k)/29.);
    #define SNC(fc) (abs(tau)<1e-5?2.*(fc):sin(6.2831853*(fc)*tau)/(3.14159265*tau))
    float hy=SNC(fcy)*hn,hi=SNC(fci)*hn,hq=SNC(fcq)*hn;ys+=cs*hy;wy+=hy;is_+=2.*cs*cos(ph)*hi;wi+=hi;qs+=2.*cs*sin(ph)*hq;wq+=hq;}
   vec3 q=vec3(ys/wy,is_/wi*sat_,qs/wq*sat_);return vec4(clamp(RGBQ(q),0.,1.),1.);}
  float off=fract(sp.x-.5);vec3 rs=vec3(256.,83.2,25.6)/max(art,.05);vec3 acc=vec3(0.);
  #define STD(xx,bb) (3.14159265*(bb)*min(abs(xx)+.5,1./(bb)))
  #define STE(xx,bb) (3.14159265*(bb)*min(max(abs(xx)-.5,-1./(bb)),1./(bb)))
  #define STU(xx,bb) ((STD(xx,bb)+sin(STD(xx,bb))-STE(xx,bb)-sin(STE(xx,bb)))/(2.*3.14159265))
  for(int k=-1;k<=2;k++){float X=off-float(k);vec3 c0=YIQ(TXL(vec2(sp.x-X,sp.y)));vec3 bb=rs/SF.x;acc+=vec3(c0.x*STU(X,bb.x),c0.y*STU(X,bb.y),c0.z*STU(X,bb.z));}
  acc.yz*=sat_;return vec4(clamp(RGBQ(acc),0.,1.),1.);`],
 'Maister NTSC: YIQ modulated at the 2-/3-phase chroma frequency (4x horizontal subsamples), luma/chroma crosstalk, demodulated, decoded with the original 65/49-tap FIR filters; md-rainbows: MAME NTSC encode/decode (47.9 µs line assumed to hold 320 source pixels = Mega Drive H40, 3.58 MHz, notch 3.45, I 1.75 / Q 1.45 MHz) with windowed-sinc decode filters (approx.); tvout-tweaks: 4-tap raised-cosine bandlimit of Y/I/Q at 256/83.2/25.6 lines (frame 0, no crawl)');

f('lcdshaders','LCD Shaders (lcd-cgwg / lcd3x / zfast-lcd / Harlequin GB)',[S('Shader',['lcd-cgwg (lcd-grid-v2, RGB subpixels)','lcd3x (sine subpixels + scanlines)','zfast-lcd (dark cell borders)','Harlequin Game Boy (palette, ghost layer, shadow)']),
  P('Source pixel size',2,12,4,1,'px'),P('Grid strength',0,1.5,1,.01),S('Harlequin palette',['DMG green','Pocket grey','Backlit (Light)','Super Game Boy'])],
 [RTS_DOWN('R(u_p1)'), `${RTS_SRC('R(u_p1)')}int m=int(u_p0+.5);float gs=u_p2;vec2 sp=uv*SF;vec3 o;
  if(m==0){float CXA[7]=float[7](1.,-2./3.,-1./5.,4./7.,-1./9.,-2./11.,1./13.),CYA[7]=float[7](1.,0.,-4./5.,2./7.,4./9.,-4./11.,1./13.);
   #define ISM(XX,DX,DD,CY,OUT) {float zl_=clamp(((XX)-(DX)*.5)/(DD),-1.,1.),zh_=clamp(((XX)+(DX)*.5)/(DD),-1.,1.);float fl_=0.,fh_=0.,pl_=zl_,ph_=zh_;for(int k_=0;k_<7;k_++){float cf_=(CY)?CYA[k_]:CXA[k_];fl_+=pl_*cf_;fh_+=ph_*cf_;pl_*=zl_*zl_;ph_*=zh_*zh_;}OUT=(DD)*(fh_-fl_)/(DX);}
   vec2 tli=floor(sp-.4999);float sub=(sp.x-.4999-tli.x)*3.;float rsub=3./Bw;vec3 lc,rc;
   ISM(sub+1.,rsub,1.5,false,lc.r)ISM(sub,rsub,1.5,false,lc.g)ISM(sub-1.,rsub,1.5,false,lc.b)ISM(sub-2.,rsub,1.5,false,rc.r)ISM(sub-3.,rsub,1.5,false,rc.g)ISM(sub-4.,rsub,1.5,false,rc.b)
   float sy=sp.y-.4999-tli.y;float rsy=1./Bw;float tcl,bcl;ISM(sy,rsy,.63,true,tcl)ISM(sy-1.,rsy,.63,true,bcl)
   #define LFT(i,j) (pow(TXL(tli+vec2(i,j)+.5)+.05,vec3(3.)))
   vec3 av=LFT(0.,0.)*lc*tcl+LFT(1.,1.)*rc*bcl+LFT(0.,1.)*lc*bcl+LFT(1.,0.)*rc*tcl;o=pow(max(av,0.),vec3(1./2.2));o=mix(TXL(sp),o,min(gs,1.));}
  else if(m==1){vec3 rs=TXL(sp);vec2 an=sp*6.2831853;float bs=16./max(gs,.05),bl=4./max(gs,.05);float yf=(bs+sin(an.y))/(bs+1.);vec3 xf=(bl+sin(an.x+3.14159265*vec3(.5,.5-2./3.,.5-4./3.)))/(bl+1.);o=yf*xf*rs;}
  else if(m==2){vec2 cc=floor(sp)+.5;vec2 dfc=abs(cc-sp);float Y=max(dfc.x,dfc.y);Y=Y*Y;float YY=Y*Y,YYY=YY*Y;float lw=1.-14.*gs*(YY-2.7*YYY);o=TXL(sp)*lw;o*=.6+.4*o;}
  else{int pl=int(u_p3+.5);vec3 P0,P1,P2,P3,BG;
   if(pl==0){P0=vec3(.06,.22,.06);P1=vec3(.19,.38,.19);P2=vec3(.55,.67,.06);BG=vec3(.61,.74,.06);}else if(pl==1){P0=vec3(.11,.12,.1);P1=vec3(.33,.35,.3);P2=vec3(.56,.58,.52);BG=vec3(.77,.79,.71);}
   else if(pl==2){P0=vec3(0.,.23,.2);P1=vec3(0.,.42,.36);P2=vec3(.0,.62,.53);BG=vec3(.0,.8,.7);}else{P0=vec3(.2,.11,.18);P1=vec3(.55,.25,.24);P2=vec3(.85,.6,.34);BG=vec3(.97,.91,.76);}
   #define HSH(q) (3.-floor(clamp(luma(TXL(q)),0.,.999)*4.))
   float k=HSH(sp);float al=k/3.;vec3 pc=k>2.5?P0:k>1.5?P1:P2;vec2 fp=fract(sp);float g=gs*max(1./Bw,.08);vec2 e=smoothstep(vec2(g*.5),vec2(g),fp);float pm=mix(1.,mix(.35,1.,e.x*e.y),min(gs,1.));
   float ksh=HSH(sp-vec2(.3,-.3));vec2 fs=fract(sp-vec2(.3,-.3));vec2 es=smoothstep(vec2(g*.5),vec2(g),fs);
   vec3 bg=BG*(1.-.03*vnoise(uv*u_res*.5))*(.97+.03*hash(op));bg*=1.-.28*(ksh/3.)*es.x*es.y;o=mix(bg,pc,al*pm*.95);}
  return vec4(clamp(o,0.,1.),1.);`],
 'lcd-grid-v2 (cgwg): integrated polynomial subpixel/row apertures, LCD gamma 3, black level .05; lcd3x (Gigaherz): sin RGB stripes + sin scanlines; zfast-lcd (SoltanGris42): squared distance cell border + GBA gamma hack; Harlequin GB: 4-shade palette pixels over an LCD background with drop shadow and grid (approx.)');

f = add('Color');
f('handheldcolor','Handheld Screen Colour (NDS / PSP / GBA)',[S('Device',['Nintendo DS (nds-color)','PSP (psp-color)','GBA / GBC (gba-color)']),P('Strength',0,1,1,.01)],
 `int m=int(u_p0+.5);vec3 s=pow(clamp(c.rgb,0.,1.),vec3(2.2));vec3 o;
  if(m==0)o=mat3(.835,.10,.105,.27,.6375,.175,-.105,.2625,.72)*s*.905;
  else if(m==1)o=mat3(.965,.0425,.0175,.185,.79,.01,-.15,.1675,.9725)*clamp(s*.87,0.,1.);
  else o=mat3(.905,.10,.1575,.195,.65,.1425,-.10,.25,.70)*s*.91;
  o=pow(clamp(o,0.,1.),vec3(1./2.2));return vec4(mix(c.rgb,o,u_p1),1.);`,
 'RetroArch handheld/shaders/color sRGB profiles (Pokefan531 / hunterk): linearise (2.2), screen colour matrix x luminance, re-encode');
