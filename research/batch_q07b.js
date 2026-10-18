/* ================= q07b: RetroArch slang interpolation / pixel-art / AA & sharpen shaders (same-size engine: N x N blocks = one source pixel) ================= */
f = add('Sharpen');
f('q07_resample3','Resampling Kernels III (jinc2-sharper / hann-5-taps / spline100 / g-sharp)',[P('Source pixel size',1,16,4,.5,'px'),S('Kernel',['jinc2-sharper (Hyllian)','hann-5-taps (Hyllian)','spline100 (Hyllian)','g-sharp resampler (guest.r)']),P('Anti-ringing',0,1,.8,.01)],
 [RTS2_DOWN('R(u_p0)'), `${RTS2_SRC('R(u_p0)')}int m=int(u_p1+.5);float ar=u_p2;
  if(m==0){float wa=.42*3.14159265,wb=.92*3.14159265;vec2 tc=floor(sp-.5)+.5;vec3 acc=vec3(0.);float ws=0.;vec3 mn=vec3(1e3),mx=vec3(-1e3);
   for(int j=-1;j<=2;j++)for(int i=-1;i<=2;i++){vec2 q=tc+vec2(float(i),float(j));float dd=distance(sp,q);float w=dd<1e-4?wa*wb:sin(dd*wa)*sin(dd*wb)/(dd*dd);vec3 v=SRC(q);acc+=w*v;ws+=w;
    if(i>=0&&i<=1&&j>=0&&j<=1){mn=min(mn,v);mx=max(mx,v);}}
   vec3 o=acc/ws;return vec4(mix(o,clamp(o,mn,mx),ar),1.);}
  if(m==1){vec2 tc=floor(sp-.5)+.5;vec2 fq=sp-tc;
   #define Q07HN(x_) (sin(3.14159265*max(abs(x_),vec2(1e-5)))/(3.14159265*max(abs(x_),vec2(1e-5)))*(.5*(1.-cos(.5*3.14159265*(max(abs(x_),vec2(1e-5))+2.)))))
   vec2 w0=Q07HN(fq+1.),w1=Q07HN(fq),w2=Q07HN(1.-fq);vec2 w3=1.-w0-w1-w2;vec2 W1=w1+w2;
   vec2 s0=tc-1.,s1=tc+w2/W1,s2=tc+2.;
   vec3 CT=SRC(vec2(s1.x,s0.y)),CL=SRC(vec2(s0.x,s1.y)),CC=SRC(s1),CR=SRC(vec2(s2.x,s1.y)),CB=SRC(vec2(s1.x,s2.y));
   float a0=W1.x*w0.y,a1=w0.x*W1.y,a2=W1.x*W1.y,a3=w3.x*W1.y,a4=W1.x*w3.y;vec3 o=(CT*a0+CL*a1+CC*a2+CR*a3+CB*a4)/(a0+a1+a2+a3+a4);
   vec3 mn=min(min(min(CC,CT),CL),min(CR,CB)),mx=max(max(max(CC,CT),CL),max(CR,CB));
   return vec4(mix(o,clamp(o,mn,mx),ar*step(0.,(CL-CC)*(CC-CR)+(CB-CC)*(CC-CT))),1.);}
  if(m==2){vec2 p=sp-.5;vec2 i0=floor(p),fp=p-i0;float wx[10],wy[10];float sx=0.,sy=0.;
   #define Q07SP(XX,OUT) {float x_=abs(XX);OUT=x_<1.?((61./51.*x_-9893./4505.)*x_-1./13515.)*x_+1.:x_<2.?((-10./17.*x_+2844./901.)*x_-4822./901.)*x_+2508./901.:x_<3.?((8./51.*x_-5912./4505.)*x_+9680./2703.)*x_-14272./4505.:x_<4.?((-2./51.*x_+2008./4505.)*x_-22558./13515.)*x_+9256./4505.:x_<5.?((1./153.*x_-423./4505.)*x_+18098./40545.)*x_-632./901.:0.;}
   for(int k=0;k<10;k++){Q07SP(fp.x-float(k-4),wx[k])Q07SP(fp.y-float(k-4),wy[k])sx+=wx[k];sy+=wy[k];}
   vec3 rows[10];
   for(int j=0;j<10;j++){vec3 a=vec3(0.);vec3 r3,r4,r5,r6;for(int k=0;k<10;k++){vec3 v=TXL(i0+vec2(float(k-4),float(j-4))+.5);a+=wx[k]*v;if(k==3)r3=v;if(k==4)r4=v;if(k==5)r5=v;if(k==6)r6=v;}
    a/=sx;rows[j]=mix(a,clamp(a,min(min(r3,r4),min(r5,r6)),max(max(r3,r4),max(r5,r6))),ar*step(0.,(r3-r4)*(r5-r6)));}
   vec3 o=vec3(0.);for(int j=0;j<10;j++)o+=wy[j]*rows[j];o/=sy;
   o=mix(o,clamp(o,min(min(rows[3],rows[4]),min(rows[5],rows[6])),max(max(rows[3],rows[4]),max(rows[5],rows[6]))),ar*step(0.,(rows[3]-rows[4])*(rows[5]-rows[6])));
   return vec4(o,1.);}
  float FPR=1.2,sg=.75,SH=.5;float inv=1./(2.*sg*sg);vec2 tex=floor(sp)+.5;vec2 fq=.5-fract(sp);float shp=exp(-FPR*FPR*inv);
  vec3 col=vec3(0.);float wsum=0.;vec3 cmx=vec3(0.),cmn=vec3(1.);
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j));vec3 pix=TXL(tex+o);vec2 d=o+fq;float w=exp(-dot(d,d)*inv)-shp;float fpx=(length(d)-FPR)/FPR;
   if(dot(o,o)<1.25*FPR){cmx=max(cmx,pix);cmn=min(cmn,pix);}if(w<0.)w=max(w,min(mix(-.07,0.,pow(abs(fpx),SH)),0.));col+=w*pix;wsum+=w;}
  vec3 o=col/wsum;return vec4(mix(clamp(o,0.,1.),clamp(o,cmn,cmx),ar),1.);`],
 'jinc2.slang with the jinc2-sharper preset (window 0.42, sinc 0.92, 4x4 taps, 2x2 anti-ringing), hann-5-taps.slang (Hann-windowed sinc folded into 5 bilinear taps), spline100 (Hyllian 10-tap spline, separable, per-axis anti-ringing), g-sharp_resampler.slang (Gaussian minus its value at the filter range, clamped negative lobe, anti-ringing); source = the N x N block grid');

f = add('Retro');
f('q07_pixinterp','Pixel-Art Interpolators (SmuberStep / smootheststep / ControlledSharpness / AANN / edge1pixel / edgeNpixels / uniform-nearest / soft-pixel-art)',[S('Method',['SmuberStep','smootheststep (Quilez)','ControlledSharpness','AANN (gamma-correct AA nearest)','edge1pixel','edgeNpixels','uniform-nearest (subpixel)','soft-pixel-art (Hyllian / guest.r)']),
  P('Pixel size',1,16,6,1,'px'),P('Shape (sharpness / edge px / contrast)',0,1,.4,.01)],
 [RTS2_DOWN('R(u_p1)'), `${RTS2_SRC('R(u_p1)')}int m=int(u_p0+.5);float v=u_p2;
  if(m<=2){vec2 S2=sp+.5;vec2 I=floor(S2),fq=S2-I;vec2 g;
   if(m==0)g=924.*pow(fq,vec2(13.))-6006.*pow(fq,vec2(12.))+16380.*pow(fq,vec2(11.))-24024.*pow(fq,vec2(10.))+20020.*pow(fq,vec2(9.))-9009.*pow(fq,vec2(8.))+1716.*pow(fq,vec2(7.));
   else if(m==1)g=fq*fq*fq*fq*(fq*(fq*(-20.*fq+70.)-84.)+35.);
   else{float sh=mix(.001,.95,v);float cc=2./(1.-sh)-1.;vec2 f0=pow(fq,vec2(cc))/pow(.5,cc-1.);vec2 f2=1.-pow(1.-fq,vec2(cc))/pow(.5,cc-1.);g=mix(f0,f2,step(.5,fq));}
   return vec4(SRC(I+g-.5),1.);}
  if(m==3){vec2 mnf=sp-.5/Bw,mxf=sp+.5/Bw;vec2 rl=floor(mxf);vec2 kp=vec2(1.);vec2 p1=rl+.5,p2=rl+.5;
   if(mnf.x<=rl.x){kp.x=(mxf.x-rl.x)*Bw;p1.x=rl.x-.5;}if(mnf.y<=rl.y){kp.y=(mxf.y-rl.y)*Bw;p1.y=rl.y-.5;}
   vec3 a=TXL(p1),b=TXL(vec2(p2.x,p1.y)),c2=TXL(vec2(p1.x,p2.y)),d=TXL(p2);
   if(v>.5)return vec4(mix(mix(a,b,kp.x),mix(c2,d,kp.x),kp.y),1.);
   #define Q07LIN(c_) mix(pow((c_)*0.947867298578199+0.052132701421801,vec3(2.4)),(c_)*0.0773993808049536,step((c_),vec3(0.0404482362771082)))
   #define Q07VRY(c_,OUT) {vec3 l_=Q07LIN(c_);OUT=vec3(pow(max(dot(l_,vec3(.2126,.7152,.0722)),0.),1./3.),l_.r-l_.g,(l_.r+l_.g)*.5-l_.b);}
   #define Q07VI(A_,B_,K_,OUT) {float nl=(A_).x*(1.-(K_))+(B_).x*(K_);float sn=pow((B_).x,3.)-pow((A_).x,3.);if(sn==0.)sn=1.;float lf=(pow(nl,3.)-pow((A_).x,3.))/sn;OUT=vec3(nl,mix((A_).yz,(B_).yz,lf));}
   vec3 va,vb,vc,vd,x1,x2,rs;Q07VRY(a,va)Q07VRY(b,vb)Q07VRY(c2,vc)Q07VRY(d,vd)Q07VI(va,vb,kp.x,x1)Q07VI(vc,vd,kp.x,x2)Q07VI(x1,x2,kp.y,rs)
   float t3=pow(rs.x,3.);vec3 lin=clamp(vec3(t3+rs.y*(.7152+.0722*.5)+rs.z*.0722,t3-rs.y*(.2126+.0722*.5)+rs.z*.0722,t3+rs.y*(.7152*.5-.2126*.5)-rs.z*(.2126+.7152)),0.,1.);
   return vec4(mix(pow(lin,vec3(1./2.4))*1.055-.055,lin*12.92,step(lin,vec3(.00313066844250063))),1.);}
  if(m==4){vec2 ish=vec2(.5/Bw);vec2 fq=fract(sp)+1e-3;vec2 ins=step(ish,fq)-step(1.-ish,fq);return vec4(SRC(ins*(floor(sp)+.5)+(1.-ins)*floor(sp+.5)),1.);}
  if(m==5){float PC=floor(1.+v*7.+.5);vec2 rh=vec2(PC*.5/Bw);float spr=1./(PC+1.);vec2 cb=floor(sp+.5);vec2 oo=sp-cb+1e-3;vec2 ni=step(abs(oo),rh);vec2 si=floor((oo+rh)*Bw);
   return vec4(SRC((1.-ni)*(floor(sp)+.5)+ni*(cb+spr*(si+1.)-.5)),1.);}
  if(m==6){vec2 wpx=floor(wp)+.5;vec3 xo=v>.5?vec3(.666,.333,0.):vec3(0.,.333,.666);vec3 o;
   for(int k=0;k<3;k++){vec2 x=vec2((wpx.x+xo[k])/Bw,wpx.y/Bw);vec2 q=clamp(fract(x)*Bw,0.,1.)+floor(x)-.5;vec3 sv=SRC(q);o[k]=sv[k];}return vec4(o,1.);}
  float dx=.5,sx=.25;vec3 dt=vec3(1.),dtt=vec3(.001);
  vec3 c11=SRC(sp),c00=SRC(sp+vec2(-dx,0.)),c20=SRC(sp+vec2(0.,-dx)),c22=SRC(sp+vec2(dx,0.)),c02=SRC(sp+vec2(0.,dx));
  vec3 s00=SRC(sp+vec2(-sx,0.)),s20=SRC(sp+vec2(0.,-sx)),s22=SRC(sp+vec2(sx,0.)),s02=SRC(sp+vec2(0.,sx));
  vec3 c01=SRC(sp+vec2(-sx,sx)),c21=SRC(sp+vec2(sx,-sx)),c10=SRC(sp+vec2(-sx,-sx)),c12=SRC(sp+vec2(sx,sx));
  float d1=dot(abs(c00-c22),dt)+.0001,d2=dot(abs(c20-c02),dt)+.0001,hl=dot(abs(c01-c21),dt)+.0001,vl=dot(abs(c10-c12),dt)+.0001,m1=dot(abs(s00-s22),dt)+.0001,m2=dot(abs(s02-s20),dt)+.0001;
  vec3 mn1=min(min(min(c00,c01),c02),min(min(min(c10,c11),c12),min(min(c20,c21),c22))),mx1=max(max(max(c00,c01),c02),max(max(max(c10,c11),c12),max(max(c20,c21),c22)));
  vec3 t1=(hl*(c10+c12)+vl*(c01+c21)+(hl+vl)*c11)/(3.*(hl+vl)),t2=(d1*(c20+c02)+d2*(c00+c22)+(d1+d2)*c11)/(3.*(d1+d2));
  c11=.25*(t1+t2+(m2*(s00+s22)+m1*(s02+s20))/(m1+m2));vec3 df1=abs(c11-mn1)+dtt,df2=abs(c11-mx1)+dtt;float fpm=clamp(10.*v*max(length(df1),length(df2)),1.,2.25);
  df1=pow(df1,vec3(fpm));df2=pow(df2,vec3(fpm));return vec4((df1*mx1+df2*mn1)/(df1+df2),1.);`],
 'SmuberStep / smootheststep / ControlledSharpness (UV remapping inside each source texel before bilinear fetch), aann.slang (area-weighted nearest interpolated in the perceptual VRY space; shape > 0.5 = sRGB), edge1pixel / edgeNpixels (blend only the last 1 or N output pixels at texel edges), uniform-nearest (AA nearest with RGB subpixel offsets; shape > 0.5 = BGR), soft-pixel-art (xSoft diamond kernel with contrast-driven min/max pull; shape x 10 = contrast)');

f = add('Sharpen');
f('q07_aasharp','RetroArch AA / Sharpen / Smooth (advanced-aa, reverse-aa, sharpsmoother, cheap-sharpen, deblur-luma, super-res-ex, fast-bilateral-3d, smart-morph)',[S('Shader',['advanced-aa (guest.r)','reverse-aa (Hyllian, needs pixel size 2+)','sharpsmoother (guest.r)','cheap-sharpen (Hyllian)','deblur-luma (Hyllian)','super-res-ex (Shiandow)','fast-bilateral-3d','smart-morph (Sp00kyFox)']),P('Strength (1 is shader default)',0,2,1,.01),P('Source pixel size',1,8,1,1,'px')],
 [`float Bw=max(R(u_p2),1.);vec2 SS=ceil(u_res/Bw);vec2 w=floor(uv*u_res);if(w.x>=SS.x||w.y>=SS.y)return vec4(.5,.5,.5,0.);
  #define Q07SB(i_,j_) O(clamp((w+vec2(float(i_),float(j_))+.5)*Bw,vec2(.5),u_res-.5)/u_res).rgb
  vec3 s0=Q07SB(0,0);vec3 k=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)k+=(i==0?.75:.125)*(j==0?.75:.125)*Q07SB(i,j);
  return vec4(clamp(.5+.5*(k-s0),0.,1.),luma(k));`,
  `int m=int(u_p0+.5);float s=u_p1;float Bw=max(R(u_p2),1.);vec2 e=Bw/u_res;vec3 E0=O(uv).rgb;vec3 dt=vec3(1.);
  #define Q07N(i_,j_) O(uv+vec2(float(i_),float(j_))*e).rgb
  if(m==0){vec2 h=.5*e;vec3 c00=O(uv-h).rgb,c10=O(uv+vec2(0.,-h.y)).rgb,c20=O(uv+vec2(h.x,-h.y)).rgb,c01=O(uv+vec2(-h.x,0.)).rgb,c21=O(uv+vec2(h.x,0.)).rgb,c02=O(uv+vec2(-h.x,h.y)).rgb,c12=O(uv+vec2(0.,h.y)).rgb,c22=O(uv+h).rgb;
   float d1=dot(abs(c00-c22),dt)+.0001,d2=dot(abs(c20-c02),dt)+.0001,hl=dot(abs(c01-c21),dt)+.0001,vl=dot(abs(c10-c12),dt)+.0001;float k1=.5*(hl+vl),k2=.5*(d1+d2);
   vec3 t1=(hl*(c10+c12)+vl*(c01+c21)+k1*E0)/(2.5*(hl+vl)),t2=(d1*(c20+c02)+d2*(c00+c22)+k2*E0)/(2.5*(d1+d2));k1=dot(abs(t1-E0),dt)+.0001;k2=dot(abs(t2-E0),dt)+.0001;
   return vec4(clamp(mix(E0,(k1*t2+k2*t1)/(k1+k2),s),0.,1.),1.);}
  if(m==1){vec2 sp=uv*u_res/Bw;vec2 ps=fract(sp)-.5;vec2 cn=floor(sp)+.5;
   #define Q07P(i_,j_) O(clamp((cn+vec2(float(i_),float(j_)))*Bw,vec2(.5),u_res-.5)/u_res).rgb
   #define Q07RA(A2,A1,PX_,B1,B2,OUT) {vec3 d0=(A1)-(A2),d1=(PX_)-(A1),d2=(B1)-(PX_),d3=(B2)-(B1);vec3 mm=2.*s*min(.5-abs((PX_)-.5),min(abs(d1),abs(d2)));OUT=clamp((7.*(d1+d2)-3.*(d0+d3))/16.,-mm,mm);}
   vec3 E=Q07P(0,0),tx,ty;Q07RA(Q07P(-2,0),Q07P(-1,0),E,Q07P(1,0),Q07P(2,0),tx)Q07RA(Q07P(0,-2),Q07P(0,-1),E,Q07P(0,1),Q07P(0,2),ty)
   return vec4(clamp(E+2.*(tx*ps.x+ty*ps.y),0.,1.),1.);}
  if(m==2){float sm=.55*s;
   #define Q07WT(A_,B_) clamp(sm-((6.3)/pow(3.,.7))*pow(dot(pow(abs((A_)-(B_)),vec3(1./.7)),dt),.7)/(dot((A_)+(B_),dt)+.3),-.07,.1)
   vec3 c00=Q07N(-1,-1),c10=Q07N(0,-1),c20=Q07N(1,-1),c01=Q07N(-1,0),c21=Q07N(1,0),c02=Q07N(-1,1),c12=Q07N(0,1),c22=Q07N(1,1);
   float w10=Q07WT(E0,c10),w21=Q07WT(E0,c21),w12=Q07WT(E0,c12),w01=Q07WT(E0,c01),w00=Q07WT(E0,c00)*.75,w22=Q07WT(E0,c22)*.75,w20=Q07WT(E0,c20)*.75,w02=Q07WT(E0,c02)*.75;
   return vec4(clamp(w10*c10+w21*c21+w12*c12+w01*c01+w00*c00+w22*c22+w20*c20+w02*c02+(1.-w10-w21-w12-w01-w00-w22-w20-w02)*E0,0.,1.),1.);}
  if(m==3){float cs=.4*s;vec3 B=Q07N(0,-1),D=Q07N(-1,0),F=Q07N(1,0),H=Q07N(0,1);vec3 o=(1.+cs)*E0-.25*cs*(B+D+F+H);
   vec3 mn=min(min(E0,min(D,F)),min(B,H)),mx=max(max(E0,max(D,F)),max(B,H));return vec4(clamp(mix(o,clamp(o,mn,mx),step(-.00001,(E0-D)*(F-E0)+(E0-B)*(H-E0))),0.,1.),1.);}
  if(m==4){vec3 lw=vec3(.299,.587,.114);vec3 c00=Q07N(-2,-2),c10=Q07N(0,-2),c20=Q07N(2,-2),c01=Q07N(-2,0),c21=Q07N(2,0),c02=Q07N(-2,2),c12=Q07N(0,2),c22=Q07N(2,2);
   mat4x3 chv=mat4x3(c10,c01,c21,c12),cdi=mat4x3(c00,c02,c20,c22);vec4 CHV=lw*chv,CDI=lw*cdi;float C11=dot(E0,lw);
   vec4 a4=min(CHV,CDI);float mn1=min(min(a4.x,a4.y),min(a4.z,a4.w));vec4 b4=max(CHV,CDI);float mx1=max(max(b4.x,b4.y),max(b4.z,b4.w));
   vec2 mnmx=vec2(min(C11,mn1),max(C11,mx1));vec2 dif=pow(abs(vec2(C11)-mnmx)+.0001,vec2(4.5));float D11=dot(dif,mnmx.yx)/(dif.x+dif.y);
   float k11=1./(abs(C11-D11)+.0001);vec4 khv=1./(abs(CHV-vec4(D11))+.0001),kdi=1./(abs(CDI-vec4(D11))+.0001);float avg=(dot(khv+kdi,vec4(1.))+k11)/10.;
   khv=max(khv-avg,0.);kdi=max(kdi-avg,0.);k11=max(k11-avg,0.);vec3 d11=(chv*khv+cdi*kdi+(k11+.0001)*E0)/(dot(khv+kdi,vec4(1.))+k11+.0001);
   float ct=mnmx.y-mnmx.x;vec3 o=mix(E0,d11,clamp(1.75*ct-.125,0.,1.));return vec4(mix(d11,o,clamp(1.-.5*s,0.,1.)),1.);}
  if(m==5){vec2 wp=uv*u_res;vec2 SS=ceil(u_res/Bw);
   #define Q07SC(q_) O(clamp((clamp(floor(q_),vec2(0.),SS-1.)+.5)*Bw,vec2(.5),u_res-.5)/u_res).rgb
   #define Q07REF(w_,OUT) {vec2 p_=(w_)/Bw-.5;vec2 i_=floor(p_),f_=p_-i_;OUT=mix(mix(Q07SC(i_),Q07SC(i_+vec2(1.,0.)),f_.x),mix(Q07SC(i_+vec2(0.,1.)),Q07SC(i_+1.),f_.x),f_.y);}
   vec3 c0;Q07REF(wp,c0)float c0y=dot(c0,vec3(.2126,.7152,.0722));float W=0.;vec3 df=vec3(0.),stb=vec3(0.);
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec4 dd=T(clamp((wp+o)/Bw,vec2(.5),SS-.5)/u_res);vec3 gt;Q07REF(wp+o,gt)
    float dI2=pow(100.*(c0y-dd.a),2.);float wt=exp(-dot(o,o)/2.)*pow(1.+dI2/2.,-2.);df+=wt*(dd.rgb*2.-1.);stb+=wt*(c0-gt);W+=wt;}
   df/=W;stb/=W;return vec4(clamp(c0-.8*s*mix(df,stb,.3),0.,1.),1.);}
  if(m==6){float sr=.016*max(s,.01);vec3 col=vec3(0.),ws=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec3 v=O(uv+vec2(float(i),float(j))*2.*e).rgb;vec3 wt=exp(-float(i*i+j*j)/18.)*exp(-(v-E0)*(v-E0)/(2.*sr*sr));col+=wt*v;ws+=wt;}
   return vec4(col/ws,1.);}
  vec3 lw=vec3(.299,.587,.114);vec3 B=Q07N(0,-1),D=Q07N(-1,0),F=Q07N(1,0),H=Q07N(0,1);vec4 b=vec4(dot(B,lw),dot(D,lw),dot(H,lw),dot(F,lw));float ey=dot(E0,lw);
  float di=max(max(b.x,b.y),max(b.z,max(b.w,ey)));vec3 rs=di==b.x?B:di==b.y?D:di==b.z?H:F;di=abs(ey-di);float st=smoothstep(0.,1.,pow(di,.5))*clamp(s,0.,1.);
  return vec4(di==0.?E0:mix(E0,rs,st),1.);`],
 'advanced-aa.slang (guest.r, half-texel 9-tap edge-directed average), reverse-aa.slang (Hyllian/Jararaca local gradient extrapolation inside each source texel), sharpsmoother.slang, cheap-sharpen.slang (anti-ringing cross sharpen), deblur-luma.slang (luma min/max pull, offset 2), super-res-ex (Shiandow super-res over a bilinear N x upscale; downscale residual approximated by a [1/8 3/4 1/8] kernel - approx.), fast-bilateral-3d (5x5, spacing 2), smart-morph (dilation toward the brightest cross neighbour); pixel size 1 = run at image resolution');
