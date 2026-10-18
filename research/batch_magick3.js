/* ================= magick: FFmpeg / AviSynth single-frame filters (round 10) ================= */
const VF_YUV = `
#define VFY(q) vec3(dot((q),vec3(.299,.587,.114)),dot((q),vec3(-.168736,-.331264,.5)),dot((q),vec3(.5,-.418688,-.081312)))
#define VFRGB(q) vec3((q).x+1.402*(q).z,(q).x-.344136*(q).y-.714136*(q).z,(q).x+1.772*(q).y)
`;
f = add('Noise');
f('vf_chromanr','chromanr (FFmpeg Chroma Noise Reduction)',[P('Threshold',1,120,30,1),P('Size (radius)',1,10,5,1,'px'),P('Step',1,4,1,1),S('Distance',['Manhattan','Euclidean'])],
  VF_YUV + `vec3 cy=VFY(c.rgb);float thr=u_p0/255.;float sz=floor(u_p1+.5),st=floor(u_p2+.5);vec2 su=vec2(0.);float n=0.;
  for(int j=-10;j<=10;j++)for(int i=-10;i<=10;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>sz||abs(o.y)>sz)continue;vec3 q=VFY(T(uv+o*u_k*u_px).rgb);vec3 d=abs(q-cy);
   float dd=u_p3>.5?length(d):d.x+d.y+d.z;if(dd<thr){su+=q.yz;n+=1.;}}
  return vec4(VFRGB(vec3(cy.x,su/max(n,1.))),1.);`,
  'FFmpeg chromanr: the chroma (BT.601 Cb/Cr) of each pixel is replaced by the mean chroma of the window samples (radius Size, every Step-th pixel) whose |ΔY|+|ΔU|+|ΔV| (or Euclidean) distance is below Threshold (8-bit units); luma untouched');

f = add('Repair');
f('vf_pp7','pp7 Deblock (FFmpeg, 7-point DCT)',[P('QP',1,64,8,1),S('Mode',['Hard','Soft','Medium'],2)],
  VF_YUV + `float T1=u_p0*1.2/255.;int md=int(u_p1+.5);vec3 v[49];for(int j=0;j<7;j++)for(int i=0;i<7;i++)v[j*7+i]=VFY(T(uv+vec2(float(i-3),float(3-j))*u_k*u_px).rgb);
  float bs[28];for(int u=0;u<4;u++)for(int n=0;n<7;n++)bs[u*7+n]=(u==0?sqrt(1./7.):sqrt(2./7.))*cos(PI*float(2*n+1)*float(2*u)/14.);
  vec3 res=vec3(0.);
  for(int a=0;a<4;a++)for(int b=0;b<4;b++){vec3 cf=vec3(0.);for(int j=0;j<7;j++){float wj=bs[a*7+j];for(int i=0;i<7;i++)cf+=v[j*7+i]*wj*bs[b*7+i];}
   if(a+b>0){vec3 ac=abs(cf);if(md==0)cf*=step(T1,ac);else if(md==1)cf=sign(cf)*max(ac-T1,0.);else cf=sign(cf)*mix(vec3(0.),mix(2.*(ac-T1),ac,step(2.*T1,ac)),step(T1,ac));}
   res+=cf*bs[a*7+3]*bs[b*7+3];}
  return vec4(VFRGB(res),1.);`,
  'FFmpeg pp7 (approx.): for every pixel an orthonormal 7×7 DCT of its neighbourhood in Y/Cb/Cr, AC coefficients hard / soft / medium-thresholded (medium: |c| ≤ T → 0, T..2T → 2(|c|−T), above kept, as pp7), and only the centre sample is reconstructed (odd basis functions vanish there, so 16 coefficients suffice); threshold T = 1.2·QP/255 replaces pp7\'s integer DCT factors');

f = add('Noise');
const VF_HQG = `float gL=log(.25)/log(1.-min(u_p0,252.)/255.-.00001),gC=log(.25)/log(1.-min(u_p1,252.)/255.-.00001);vec3 gm=vec3(gL,gC,gC);vec3 o5=vec3(0.,.5,.5);`;
f('vf_hqdn3d','hqdn3d Spatial Denoise (FFmpeg)',[P('Luma spatial',0,30,4,.5),P('Chroma spatial',0,30,3,.5)],
  [VF_YUV + VF_HQG + `vec3 pv=VFY(T(uv-vec2(32.,0.)*u_px).rgb)+o5;for(int k=31;k>=0;k--){vec3 cu=VFY(T(uv-vec2(float(k),0.)*u_px).rgb)+o5;vec3 d=pv-cu;pv=cu+d*pow(max(1.-abs(d),0.),gm);}return vec4(pv,1.);`,
   VF_YUV + VF_HQG + `vec3 pv=T(uv+vec2(0.,32.)*u_px).rgb;for(int k=31;k>=0;k--){vec3 cu=T(uv+vec2(0.,float(k))*u_px).rgb;vec3 d=pv-cu;pv=cu+d*pow(max(1.-abs(d),0.),gm);}return vec4(VFRGB(pv-o5),1.);`],
  'FFmpeg hqdn3d spatial part: causal recursive low-pass along each row (left→right) and then down each column on the row result, new = cur + (prev − cur)·(1 − |Δ|/255)^γ with γ = ln 0.25 / ln(1 − strength/255), in Y/Cb/Cr; recursion truncated to 32 px (approx.); the temporal part needs previous frames and is not included');

f = add('Repair');
const VF_RG = k => `if(${k}.>=u_p1)return T(uv);int m=int(u_p0+.5);vec2 e=u_px;vec3 cc=T(uv).rgb;
  vec3 a1=T(uv+vec2(-e.x,e.y)).rgb,a2=T(uv+vec2(0.,e.y)).rgb,a3=T(uv+e).rgb,a4=T(uv-vec2(e.x,0.)).rgb,a5=T(uv+vec2(e.x,0.)).rgb,a6=T(uv-e).rgb,a7=T(uv-vec2(0.,e.y)).rgb,a8=T(uv+vec2(e.x,-e.y)).rgb;
  vec3 pa[4]=vec3[4](a1,a2,a3,a4),pb[4]=vec3[4](a8,a7,a6,a5);vec3 r=cc;
  if(m<=3){vec3 s0=a1,s1=a2,s2=a3,s3=a4,s4=a5,s5=a6,s6=a7,s7=a8;
   SW(s0,s1)SW(s2,s3)SW(s4,s5)SW(s6,s7)SW(s0,s2)SW(s1,s3)SW(s4,s6)SW(s5,s7)SW(s1,s2)SW(s5,s6)SW(s0,s4)SW(s3,s7)SW(s1,s5)SW(s2,s6)SW(s1,s4)SW(s3,s6)SW(s2,s4)SW(s3,s5)SW(s3,s4)
   r=m==0?clamp(cc,s0,s7):m==1?clamp(cc,s1,s6):m==2?clamp(cc,s2,s5):clamp(cc,s3,s4);}
  else if(m<=8||m==12){vec3 bd=vec3(1e9);for(int i=0;i<4;i++){vec3 mal=max(pa[i],pb[i]),mil=min(pa[i],pb[i]);vec3 cl=clamp(cc,mil,mal);vec3 dc=abs(cc-cl),rg=mal-mil;
    vec3 d=m==4?dc:m==5?2.*dc+rg:m==6?dc+rg:m==7?dc+2.*rg:m==8?rg:max(abs(cc-pa[i]),abs(cc-pb[i]));vec3 lt=vec3(lessThan(d,bd));r=mix(r,cl,lt);bd=mix(bd,d,lt);}}
  else if(m==9){vec3 bd=vec3(1e9);for(int i=0;i<4;i++){vec3 d=abs(cc-pa[i]),lt=vec3(lessThan(d,bd));r=mix(r,pa[i],lt);bd=mix(bd,d,lt);d=abs(cc-pb[i]);lt=vec3(lessThan(d,bd));r=mix(r,pb[i],lt);bd=mix(bd,d,lt);}}
  else if(m==10)r=(4.*cc+2.*(a2+a4+a5+a7)+a1+a3+a6+a8)/16.;
  else if(m==11){vec3 lo=vec3(-9.),hi=vec3(9.);for(int i=0;i<4;i++){lo=max(lo,min(pa[i],pb[i]));hi=min(hi,max(pa[i],pb[i]));}r=clamp(cc,min(lo,hi),max(lo,hi));}
  else if(m==13)r=(a1+a2+a3+a4+a5+a6+a7+a8)/8.;
  else if(m==14)r=(cc+a1+a2+a3+a4+a5+a6+a7+a8)/9.;
  else if(m==15){vec3 lo=vec3(9.),hi=vec3(-9.);for(int i=0;i<4;i++){vec3 av=(pa[i]+pb[i])*127.5;lo=min(lo,floor(av));hi=max(hi,ceil(av));}r=clamp(cc,lo/255.,hi/255.);}
  else{vec3 um=vec3(0.),dm=vec3(0.);for(int i=0;i<4;i++){vec3 mal=max(pa[i],pb[i]),mil=min(pa[i],pb[i]),ld=mal-mil;
    if(m==16){um=max(um,max(min(cc-mal,ld),0.));dm=max(dm,max(min(mil-cc,ld),0.));}
    else{vec3 t1=cc-mal,t2=mil-cc;um=max(um,max(min(t1,ld-t1),0.));dm=max(dm,max(min(t2,ld-t2),0.));}}
   r=cc-um+dm;}
  return vec4(r,1.);`;
f('vf_removegrain','RemoveGrain Modes (AviSynth)',[S('Mode',['1: clip to min/max','2: clip to 2nd extremes','3: clip to 3rd extremes','4: median','5: line-sensitive, min change','6: line-sensitive 2:1','7: line-sensitive 1:1','8: line-sensitive 1:2','9: line-sensitive, min range','10: nearest neighbour value','11/12: 3x3 binomial blur','17: clip to pair extremes','18: line-sensitive, max distance','19: mean of 8 neighbours','20: mean of 9','21: clip to pair averages','23: small edge / halo removal','24: halo removal (soft)'],3),P('Repeat',1,4,1,1)],
  [0,1,2,3].map(VF_RG),
  'AviSynth RemoveGrain (Kassandro) per RGB channel on the 3×3 neighbourhood: rank clipping (1-4), line-sensitive clipping over the 4 opposite-neighbour pairs (5-9, 18), nearest value (10), binomial blur (11/12), pair-extreme clip (17), means (19, 20), pair-average clip (21) and the halo/edge removers 23/24; field-interpolation modes 13-16 and 25-28 omitted; repeatable');

f('vf_delogo','Delogo (FFmpeg)',[P('X',0,1,.62,.005),P('Y (from top)',0,1,.06,.005),P('Width',.01,1,.3,.005),P('Height',.01,1,.18,.005)],
  `
#define VFS(px,py) T(vec2((px)+.5,u_res.y-(py)-.5)/u_res).rgb
  vec2 p=floor(vec2(uv.x,1.-uv.y)*u_res);float x0=floor(u_p0*u_res.x),y0=floor(u_p1*u_res.y);float x1=min(x0+max(floor(u_p2*u_res.x),3.)-1.,u_res.x-1.),y1=min(y0+max(floor(u_p3*u_res.y),3.)-1.,u_res.y-1.);
  if(p.x<=x0||p.x>=x1||p.y<=y0||p.y>=y1)return c;
  vec3 lf=VFS(x0,p.y-1.)+VFS(x0,p.y)+VFS(x0,p.y+1.),rt=VFS(x1,p.y-1.)+VFS(x1,p.y)+VFS(x1,p.y+1.),tp=VFS(p.x-1.,y0)+VFS(p.x,y0)+VFS(p.x+1.,y0),bt=VFS(p.x-1.,y1)+VFS(p.x,y1)+VFS(p.x+1.,y1);
  float dl=p.x-x0,dr=x1-p.x,dt=p.y-y0,db=y1-p.y;float wl=dr*dt*db,wr=dl*dt*db,wt=dl*dr*db,wb=dl*dr*dt;
  return vec4((lf*wl+rt*wr+tp*wt+bt*wb)/(3.*(wl+wr+wt+wb)),1.);`,
  'FFmpeg delogo: every pixel inside the rectangle is rebuilt from the rectangle\'s border — 3-tap averages of the left, right, top and bottom border pixels in its row/column, each weighted by the product of the distances to the other three sides');

f = add('Analysis');
f('vf_ciescope','CIE Chromaticity Scope (FFmpeg ciescope)',[S('Diagram',["CIE 1931 xy","CIE 1976 u'v'"]),S('Gamut',['sRGB / Rec.709','DCI-P3','Rec.2020','None']),P('Gain',.5,30,6,.5),S('Background',['Colour horseshoe','Dark'])],
  `
#define VFUV(p2) (vec2(4.*(p2).x,9.*(p2).y)/(-2.*(p2).x+12.*(p2).y+3.))
  int dm=int(u_p0+.5),gm=int(u_p1+.5);float side=min(u_res.x,u_res.y);vec2 pp=(uv*u_res-.5*(u_res-side))/side;if(pp.x<0.||pp.y<0.||pp.x>1.||pp.y>1.)return vec4(0.,0.,0.,1.);
  float sc=dm==0?.9:.66;vec2 off=dm==0?vec2(-.03,-.02):vec2(-.01,-.01);vec2 co=pp*sc+off;
  vec2 xy=dm==0?co:vec2(9.*co.x,4.*co.y)/(6.*co.x-16.*co.y+12.);
  vec2 lc[29]=vec2[29](vec2(.1741,.005),vec2(.1733,.0048),vec2(.1714,.0051),vec2(.1644,.0109),vec2(.1566,.0177),vec2(.144,.0297),vec2(.1241,.0578),vec2(.1096,.0868),vec2(.0913,.1327),vec2(.0687,.2007),vec2(.0454,.295),vec2(.0235,.4127),vec2(.0082,.5384),vec2(.0039,.6548),vec2(.0139,.7502),vec2(.0389,.812),vec2(.0743,.8338),vec2(.1142,.8262),vec2(.1547,.8059),vec2(.2296,.7543),vec2(.3016,.6923),vec2(.3731,.6245),vec2(.4441,.5547),vec2(.5125,.4866),vec2(.5752,.4242),vec2(.627,.3725),vec2(.6915,.3083),vec2(.719,.2809),vec2(.7347,.2653));
  bool ins=false;float ld=1e9;float pxs=sc/side;
  for(int i=0;i<29;i++){vec2 a=lc[i],b=lc[i==28?0:i+1];if(((a.y>xy.y)!=(b.y>xy.y))&&(xy.x<(b.x-a.x)*(xy.y-a.y)/(b.y-a.y)+a.x))ins=!ins;
   vec2 da=dm==0?a:VFUV(a),db=dm==0?b:VFUV(b);vec2 ab=db-da;float t=clamp(dot(co-da,ab)/dot(ab,ab),0.,1.);ld=min(ld,length(co-da-ab*t)/pxs);}
  vec3 col=vec3(0.);
  if(ins){if(u_p3<.5){vec3 X=vec3(xy.x/xy.y,1.,(1.-xy.x-xy.y)/xy.y);vec3 rl=max(vec3(dot(X,vec3(3.2406,-1.5372,-.4986)),dot(X,vec3(-.9689,1.8758,.0415)),dot(X,vec3(.0557,-.204,1.057))),0.);rl/=max(rl.r,max(rl.g,rl.b));col=pow(rl,vec3(1./2.2))*.42;}else col=vec3(.1);}
  col=mix(col,vec3(.75),1.-smoothstep(.6,1.4,ld/u_k));
  if(gm<3){vec2 pr[3];if(gm==0){pr[0]=vec2(.64,.33);pr[1]=vec2(.3,.6);pr[2]=vec2(.15,.06);}else if(gm==1){pr[0]=vec2(.68,.32);pr[1]=vec2(.265,.69);pr[2]=vec2(.15,.06);}else{pr[0]=vec2(.708,.292);pr[1]=vec2(.17,.797);pr[2]=vec2(.131,.046);}
   float gd=1e9;for(int i=0;i<3;i++){vec2 a=pr[i],b=pr[i==2?0:i+1];if(dm==1){a=VFUV(a);b=VFUV(b);}vec2 ab=b-a;float t=clamp(dot(co-a,ab)/dot(ab,ab),0.,1.);gd=min(gd,length(co-a-ab*t)/pxs);}
   col=mix(col,vec3(1.,1.,.6),.8*(1.-smoothstep(.5,1.3,gd/u_k)));}
  vec2 wp=dm==0?vec2(.3127,.329):VFUV(vec2(.3127,.329));vec2 dw=abs(co-wp)/pxs/u_k;if(min(dw.x,dw.y)<.7&&max(dw.x,dw.y)<5.)col=vec3(1.,.3,.3);
  float acc=0.;for(int j=0;j<36;j++)for(int i=0;i<36;i++){vec3 q=pow(O((vec2(float(i),float(j))+.5)/36.).rgb,vec3(2.2));vec3 X=vec3(dot(q,vec3(.4124,.3576,.1805)),dot(q,vec3(.2126,.7152,.0722)),dot(q,vec3(.0193,.1192,.9505)));float s=X.x+X.y+X.z;if(s<1e-4)continue;
   vec2 sp=X.xy/s;if(dm==1)sp=VFUV(sp);vec2 dd=(sp-co)/pxs/u_k;acc+=exp(-.5*dot(dd,dd));}
  return vec4(mix(col,vec3(1.),1.-exp(-acc*u_p2*.05)),1.);`,
  'FFmpeg ciescope-style chromaticity plot: image colours (36×36 sample grid, sRGB → XYZ) splatted into the CIE 1931 xy or 1976 u′v′ diagram over the spectral-locus horseshoe (380-700 nm, 29 tabulated points) with a gamut triangle and the D65 white point');

f = add('Distort');
f('vf_v360','v360 Equirectangular / Cubemap / Flat (FFmpeg)',[S('Conversion',['Equirect -> cubemap 3x2','Cubemap 3x2 -> equirect','Equirect -> flat (rectilinear)']),P('Yaw',-180,180,0,1,'°'),P('Pitch',-90,90,0,1,'°'),P('FOV (flat)',20,160,90,1,'°')],
  `int m=int(u_p0+.5);vec2 tu=vec2(uv.x,1.-uv.y);vec3 dir;
  if(m==0){vec2 f2=tu*vec2(3.,2.);vec2 fi=min(floor(f2),vec2(2.,1.));vec2 ab=(f2-fi)*2.-1.;int fc=int(fi.y)*3+int(fi.x);float a=ab.x,b=ab.y;
   dir=fc==0?vec3(1.,-b,-a):fc==1?vec3(-1.,-b,a):fc==2?vec3(a,1.,b):fc==3?vec3(a,-1.,-b):fc==4?vec3(a,-b,1.):vec3(-a,-b,-1.);}
  else if(m==2){float t=tan(radians(u_p3)*.5);dir=vec3((tu.x*2.-1.)*t,-(tu.y*2.-1.)*t/asp(),1.);}
  else{float lo=(tu.x-.5)*2.*PI,la=(.5-tu.y)*PI;dir=vec3(cos(la)*sin(lo),sin(la),cos(la)*cos(lo));}
  dir=normalize(dir);float p=radians(u_p2),y2=radians(u_p1);dir=vec3(dir.x,dir.y*cos(p)+dir.z*sin(p),-dir.y*sin(p)+dir.z*cos(p));dir=vec3(dir.x*cos(y2)+dir.z*sin(y2),dir.y,-dir.x*sin(y2)+dir.z*cos(y2));
  vec2 st;
  if(m==1){vec3 ad=abs(dir);int fc;vec2 ab;
   if(ad.x>=ad.y&&ad.x>=ad.z){if(dir.x>0.){fc=0;ab=vec2(-dir.z,-dir.y)/ad.x;}else{fc=1;ab=vec2(dir.z,-dir.y)/ad.x;}}
   else if(ad.y>=ad.z){if(dir.y>0.){fc=2;ab=vec2(dir.x,dir.z)/ad.y;}else{fc=3;ab=vec2(dir.x,-dir.z)/ad.y;}}
   else{if(dir.z>0.){fc=4;ab=vec2(dir.x,-dir.y)/ad.z;}else{fc=5;ab=vec2(-dir.x,-dir.y)/ad.z;}}
   vec2 fs=u_res/vec2(3.,2.);vec2 lc=clamp(ab*.5+.5,.5/fs,1.-.5/fs);st=(vec2(float(fc-(fc/3)*3),float(fc/3))+lc)/vec2(3.,2.);}
  else st=vec2(atan(dir.x,dir.z)/(2.*PI)+.5,.5-asin(clamp(dir.y,-1.,1.))/PI);
  return T(vec2(st.x,1.-st.y));`,
  'FFmpeg v360 conversions (bilinear): equirectangular → 3×2 cubemap (face order r l u / d f b as v360 c3x2 "rludfb"), the inverse, and equirectangular → rectilinear view, with yaw / pitch rotation; face orientation conventions are this filter\'s own (round-trip consistent)');

f = add('Sharpen');
const VF_SH = `
#define VFSH(dd,Sz,Sp,Sl,Sh,str) (pow(abs(dd)/(Sz),vec3(1./(Sp)))*(Sz)*(str)*sign(dd)*((dd)*(dd)*((Sz)*(Sz)+(Sl)))/(((dd)*(dd)+(Sl))*(Sz)*(Sz))*((1.+pow((Sz)/(Sh),4.))/(1.+pow(abs(dd)/(Sh),vec3(4.)))))
`;
f('vf_avssharp','AviSynth Sharpeners (LSFmod / SeeSaw / FineSharp / ContraSharpening)',[S('Script',['LSFmod (Smode 3, limited)','SeeSaw (on internal denoise)','FineSharp (mode 1)','ContraSharpening (on internal denoise)']),P('Strength',0,3,1,.05),P('Denoise sigma (SeeSaw / Contra)',.5,4,1.2,.1,'px'),P('Limit (8-bit levels)',0,20,2,.5)],
  [`int m=int(u_p0+.5);vec2 e=u_k*u_px;if(m==0)return c;
   if(m==2){vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=T(uv+vec2(float(i),float(j))*e).rgb*float((2-abs(i))*(2-abs(j)));return vec4(s/16.,1.);}
   float sg=R(u_p2);float rd=2.*sg;float st=max(1.,rd/8.);vec3 s=vec3(0.);float ws=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j))*st;if(length(o)>rd)continue;float w=exp(-dot(o,o)/(2.*sg*sg));s+=T(uv+o*u_px).rgb*w;ws+=w;}return vec4(s/ws,1.);`,
   `if(int(u_p0+.5)==2)return vec4(med9(uv,u_k),1.);return c;`,
   VF_SH + `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec2 e=u_k*u_px;float str=u_p1;
   if(m==0){vec3 bl=vec3(0.),mn=vec3(9.),mx=vec3(-9.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 q=O(uv+vec2(float(i),float(j))*e).rgb;bl+=q*float((2-abs(i))*(2-abs(j)));mn=min(mn,q);mx=max(mx,q);}bl/=16.;
    vec3 d=(o-bl)*255.;vec3 r=o+VFSH(d,16.,4.,4.,48.,str)/255.;float ov=u_p3*.5/255.;return vec4(clamp(r,mn-ov,mx+ov),1.);}
   if(m==1){float nl=2./255.;vec3 tc=clamp(T(uv).rgb,o-nl,o+nl);vec3 bl=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*e;vec3 oq=O(q).rgb;bl+=clamp(T(q).rgb,oq-nl,oq+nl)*float((2-abs(i))*(2-abs(j)));}bl/=16.;
    vec3 d=(tc-bl)*255.;vec3 r=tc+VFSH(d,16.,4.,5.,24.,1.5*str)/255.;float sl=u_p3*2./255.;return vec4(clamp(r,tc-sl,tc+sl),1.);}
   if(m==2){float ss=2.*str;vec3 D[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=uv+vec2(float(i),float(j))*e;vec3 d=(O(q).rgb-T(q).rgb)*255.;D[(j+2)*5+i+2]=sign(d)*pow(abs(d)/1.49,vec3(1./1.272))*ss*d*d/(d*d+ss+.1);}
    vec3 S[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 b=vec3(0.);for(int y2=-1;y2<=1;y2++)for(int x2=-1;x2<=1;x2++)b+=D[(j+y2+2)*5+i+x2+2];vec3 dc=D[(j+2)*5+i+2];S[(j+1)*3+i+1]=O(uv+vec2(float(i),float(j))*e).rgb+mix(dc,b/9.,.9*.5)/255.;}
    vec3 sb=vec3(0.),mn=vec3(9.),mx=vec3(-9.);for(int k=0;k<9;k++){sb+=S[k];mn=min(mn,S[k]);mx=max(mx,S[k]);}vec3 s=S[4];return vec4(clamp(s+.19*9.9*.5*(s-sb/9.),mn,mx),1.);}
   vec3 Dn[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)Dn[(j+2)*5+i+2]=T(uv+vec2(float(i),float(j))*e).rgb;
   vec3 Sm[9];vec3 amn=vec3(9.),amx=vec3(-9.);
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec3 v0=Dn[(j+1)*5+i+1],v1=Dn[(j+1)*5+i+2],v2=Dn[(j+1)*5+i+3],v3=Dn[(j+2)*5+i+1],v4=Dn[(j+2)*5+i+2],v5=Dn[(j+2)*5+i+3],v6=Dn[(j+3)*5+i+1],v7=Dn[(j+3)*5+i+2],v8=Dn[(j+3)*5+i+3];
    vec3 bl=(4.*v4+2.*(v1+v3+v5+v7)+v0+v2+v6+v8)/16.;vec3 x=v4;
    SW(v1,v2)SW(v4,v5)SW(v7,v8)SW(v0,v1)SW(v3,v4)SW(v6,v7)SW(v1,v2)SW(v4,v5)SW(v7,v8)SW(v0,v3)SW(v5,v8)SW(v4,v7)SW(v3,v6)SW(v1,v4)SW(v2,v5)SW(v4,v7)SW(v4,v2)SW(v6,v4)SW(v4,v2)
    vec3 ext=vec3(lessThan((x-bl)*(x-v4),vec3(0.)));vec3 pick=mix(v4,bl,vec3(lessThan(abs(x-bl),abs(x-v4))));Sm[(j+1)*3+i+1]=mix(pick,x,ext);
    vec3 ad=O(uv+vec2(float(i),float(j))*e).rgb-x;amn=min(amn,ad);amx=max(amx,ad);}
   vec3 sb=(4.*Sm[4]+2.*(Sm[1]+Sm[3]+Sm[5]+Sm[7])+Sm[0]+Sm[2]+Sm[6]+Sm[8])/16.;vec3 sD=Sm[4]-sb;vec3 sDD=clamp(sD,amn,amx);sDD=mix(sD,sDD,vec3(lessThan(abs(sDD),abs(sD))));
   return vec4(Dn[12]+sDD*str,1.);`],
  'AviSynth sharpening scripts, single-frame: LSFmod Smode 3 (nonlinear ((|d|/16)^¼·16) with low/high damping 4/48 on a 3×3 binomial blur, limited to the 3×3 min/max ± overshoot); SeeSaw (Didée: denoised frame "tamed" to ±2 of the source, sharpen2 with Sstr 1.5, Szp 16, Spower 4, damping 5/24, limited to ±Slimit); FineSharp mode 1 (RemoveGrain 11 → 4 base, lstr 1.49, pstr 1.272, equalisation and XSharpen 0.19, approx.); ContraSharpening (Didée: minblur(denoised) minus its blur, clamped to the 3×3 range of what the denoiser removed). The denoised input is an internal Gaussian of the given sigma; temporal soothing omitted');

f('vf_avslines','aWarpSharp2 / FastLineDarkenMOD (AviSynth)',[S('Script',['aWarpSharp2','FastLineDarkenMOD']),P('Strength (x default)',0,4,1,.05),P('aWarp threshold',1,255,128,1),P('FLD threshold',0,64,4,1)],
  [`int m=int(u_p0+.5);if(m==0)return vec4(vec3(min(length(sobel(uv))*1.5,u_p2/255.)),1.);float mx=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)mx=max(mx,L(uv+vec2(float(i),float(j))*u_k*u_px));return vec4(vec3(mx),1.);`,
   `if(u_p0>.5){float mn=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)mn=min(mn,T(uv+vec2(float(i),float(j))*u_k*u_px).r);return vec4(vec3(mn),1.);}return blur1d(u_tex,uv,vec2(1.,0.),R(3.));`,
   `if(u_p0>.5)return c;return blur1d(u_tex,uv,vec2(0.,1.),R(3.));`,
   `if(u_p0>.5)return c;return blur1d(u_tex,uv,vec2(1.,0.),R(3.));`,
   `if(u_p0>.5)return c;return blur1d(u_tex,uv,vec2(0.,1.),R(3.));`,
   `vec3 o=O(uv).rgb;if(u_p0<.5){vec2 e=u_k*u_px;vec2 g=vec2(T(uv-vec2(e.x,0.)).r-T(uv+vec2(e.x,0.)).r,T(uv-vec2(0.,e.y)).r-T(uv+vec2(0.,e.y)).r);float dp=16.*u_p1;return O(uv+g*dp*.5*u_k*u_px);}
   float x=luma(o);float ye=min(T(uv).r,191./255.);float d=ye>x+u_p3/255.?x-ye:0.;return vec4(o+d*48./128.*u_p1,1.);`],
  'aWarpSharp2 (approx.): Sobel edge mask capped at the threshold, blurred twice, then each pixel is resampled from p − depth·∇mask (depth 16 × strength), which pulls edges together and thins lines; FastLineDarkenMOD: luma closing (3×3 max then min) capped at 191; where it exceeds the pixel by more than the threshold the pixel is darkened by (strength 48/128)·difference (thinning omitted)');
