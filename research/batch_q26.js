/* ================= q26: mpv / libplacebo shaders 2 (windowed sinc, EWA anti-ringing, NIS, SGSR, Anime4K helpers, hdeband), PhotoDemon tools, Affinity Photo 2, OpenCV jointBilateralFilter ================= */
const Q26_KERN = `
#define Q26_SINC(XQ,OUT) {float zs_=3.14159265*(XQ);OUT=abs(zs_)<1e-5?1.:sin(zs_)/zs_;}
#define Q26_I0(XQ,OUT) {float s_=1.,t_=1.,y_=(XQ)*(XQ)*.25;for(int k_=1;k_<14;k_++){t_*=y_/float(k_*k_);s_+=t_;}OUT=s_;}
#define Q26_WS(XQ,MD,OUT) {float ax_=abs(XQ);if(ax_>=3.)OUT=0.;else{float sk_;Q26_SINC(ax_,sk_) float u_=ax_/3.;float wn_;if((MD)==0){float z_=3.14159265*u_*1.4302966531;wn_=z_<1e-4?1.:3.*(sin(z_)-z_*cos(z_))/(z_*z_*z_);}else if((MD)==1){float ia_,ib_;Q26_I0(2.*sqrt(max(1.-u_*u_,0.)),ia_) Q26_I0(2.,ib_) wn_=ia_/ib_;}else{wn_=.42+.5*cos(3.14159265*u_)+.08*cos(6.2831853*u_);}OUT=sk_*wn_;}}
#define Q26_L3(XQ,OUT) {float ax_=abs(XQ);if(ax_>=3.)OUT=0.;else{float sa_,sb_;Q26_SINC(ax_,sa_) Q26_SINC(ax_/3.,sb_) OUT=sa_*sb_;}}
#define Q26_BJ1(XQ,OUT) {float ax_=abs(XQ);if(ax_<8.){float y_=(XQ)*(XQ);float n_=(XQ)*(72362614232.+y_*(-7895059235.+y_*(242396853.1+y_*(-2972611.439+y_*(15704.4826+y_*(-30.16036606))))));float d_=144725228442.+y_*(2300535178.+y_*(18583304.74+y_*(99447.43394+y_*(376.9991397+y_))));OUT=n_/d_;}else{float z_=8./ax_;float y_=z_*z_;float xx_=ax_-2.356194491;float a1_=1.+y_*(.00183105+y_*(-.00003516396496+y_*(.000002457520174+y_*(-.000000240337019))));float a2_=.04687499995+y_*(-.0002002690873+y_*(.000008449199096+y_*(-.00000088228987+y_*.000000105787412)));OUT=sqrt(.636619772/ax_)*(cos(xx_)*a1_-z_*sin(xx_)*a2_);if((XQ)<0.)OUT=-OUT;}}
#define Q26_JINC(XQ,OUT) {if(abs(XQ)<1e-4)OUT=1.;else{float j_;Q26_BJ1(3.14159265*(XQ),j_) OUT=2.*j_/(3.14159265*(XQ));}}
`;
f = add('Sharpen');
f('q26_mpvscale','mpv / libplacebo Upscalers III (Sphinx / Kaiser / Blackman sinc, EWA anti-ringing, NIS, SGSR)',
 [P('Source pixel size',1,8,2,.5,'px'),S('Method',['Sinc - Sphinx window','Sinc - Kaiser window','Sinc - Blackman window','EWA Lanczos (polar anti-ringing)','NVIDIA Image Scaling (NIS)','Snapdragon GSR (SGSR)']),P('Anti-ringing',0,1,.8,.01),P('Sharpness (NIS and SGSR)',0,1,.5,.01)],
 [RTS2_DOWN('R(u_p0)'), Q26_KERN + `${RTS2_SRC('R(u_p0)')}int m=int(u_p1+.5);vec2 p=sp-.5;vec2 i0=floor(p),fr=p-i0;vec3 o;float ar=u_p2;
 if(m<=2){float wx[6],wy[6];float sx=0.,sy=0.;for(int t=0;t<6;t++){float a,b;Q26_WS(float(t-2)-fr.x,m,a) Q26_WS(float(t-2)-fr.y,m,b) wx[t]=a;wy[t]=b;sx+=a;sy+=b;}
  vec3 acc=vec3(0.),lo=vec3(1e3),hi=vec3(-1e3);for(int j=0;j<6;j++)for(int i=0;i<6;i++){vec3 v=TXL(i0+vec2(float(i-2),float(j-2))+.5);acc+=wx[i]*wy[j]*v;if(i>=2&&i<=3&&j>=2&&j<=3){lo=min(lo,v);hi=max(hi,v);}}
  o=acc/(sx*sy);o=mix(o,clamp(o,lo,hi),ar);}
 else if(m==3){vec3 acc=vec3(0.);float ws=0.;vec3 lw=vec3(0.),hw=vec3(0.),la=vec3(0.),ha=vec3(0.);
  for(int j=-3;j<=4;j++)for(int i=-3;i<=4;i++){vec2 d=vec2(float(i),float(j))-fr;float r=length(d);if(r>=3.2383154)continue;float k1,k2;Q26_JINC(r,k1) Q26_JINC(r*.37662954,k2) float w=k1*k2;vec3 v=TXL(i0+vec2(float(i),float(j))+.5);acc+=w*v;ws+=w;
   if(r<=1.2196699){vec3 cl=pow(1.1-v,vec3(32.))*w,ch=pow(v+.1,vec3(32.))*w;la+=cl*(1.-v);lw+=cl;ha+=ch*v;hw+=ch;}}
  o=acc/ws;vec3 lo=1.-la/max(lw,vec3(1e-36)),hi=ha/max(hw,vec3(1e-36));vec3 cw=clamp(o,lo,hi);cw=mix(cw,(lo+hi)*.5,vec3(greaterThan(lo,hi)));o=mix(o,cw,ar);}
 else if(m==4){float s=clamp(u_p3,0.,1.)-.5;float ms=s>=0.?1.25:1.,xs=s>=0.?1.25:1.75;
  float sMin=max(0.,.4+s*ms*1.2),sMax=1.6+s*xs*1.8,lMin=max(.1,.14+s*ms*.32),lMax=.5+s*ms*.6;
  float wx[6],wy[6];float sx=0.,sy=0.;for(int t=0;t<6;t++){float a,b;Q26_L3(float(t-2)-fr.x,a) Q26_L3(float(t-2)-fr.y,b) wx[t]=a;wy[t]=b;sx+=a;sy+=b;}
  float yy[36];vec3 acc=vec3(0.);for(int j=0;j<6;j++)for(int i=0;i<6;i++){vec3 v=TXL(i0+vec2(float(i-2),float(j-2))+.5);acc+=wx[i]*wy[j]*v;yy[j*6+i]=luma(v);}
  acc/=sx*sy;float rowY[6],colY[6];for(int k=0;k<6;k++){float a=0.,b=0.;for(int t=0;t<6;t++){a+=wx[t]*yy[k*6+t];b+=wy[t]*yy[t*6+k];}rowY[k]=a/sx;colY[k]=b/sy;}
  float iy=0.;for(int k=0;k<6;k++)iy+=wy[k]*rowY[k];iy/=sy;
  float xm=0.,xp=0.,ym=0.,yp=0.,wa=0.,wb=0.;for(int t=1;t<6;t++){xm+=wx[t]*colY[t-1];ym+=wy[t]*rowY[t-1];wa+=wx[t];wb+=wy[t];}xm/=wa;ym/=wb;
  wa=0.;wb=0.;for(int t=0;t<5;t++){xp+=wx[t]*colY[t+1];yp+=wy[t]*rowY[t+1];wa+=wx[t];wb+=wy[t];}xp/=wa;yp/=wb;
  float t0=yy[7],t1=yy[8],t2=yy[9],m0=yy[13],m2=yy[15],b0=yy[19],b1=yy[20],b2=yy[21];
  float gH=abs(t0+t1+t2-b0-b1-b2),gV=abs(t0+m0+b0-t2-m2-b2),g45=abs(t0+t1+m0-m2-b1-b2),g135=abs(t1+t2+m2-m0-b0-b1);
  float aM=max(gH,gV),aN=min(gH,gV),dM=max(g45,g135),dN=min(g45,g135);float w0=0.,w90=0.;
  if(aM+dM>0.){const float KR=2.2011719,KT=.0625;float e0=min(aM/(aM+dM),1.);bool ca=aM>aN*KR&&aM>KT&&aM>dN;bool cd=dM>dN*KR&&dM>KT&&dM>aN;float wa2=ca?(cd?e0:1.):0.;if(gH>=gV)w0=wa2;else w90=wa2;}
  float opY=iy*(1.-w0-w90)+w0*mix(rowY[2],rowY[3],fr.y)+w90*mix(colY[2],colY[3],fr.x);
  float usm=1.2002*iy-.30005*(xm+xp+ym+yp);float ysc=1.-clamp((iy-.45)/.45,0.,1.);usm*=ysc*(sMax-sMin)+sMin;float lim=(ysc*(lMax-lMin)+lMin)*iy;usm=clamp(usm,-lim,lim);
  o=acc+(opY+usm-iy);}
 else{vec3 col=SRC(sp);float g[12];vec2 ofs[12]=vec2[12](vec2(0.,0.),vec2(1.,0.),vec2(0.,1.),vec2(1.,1.),vec2(0.,-1.),vec2(1.,-1.),vec2(-1.,0.),vec2(2.,0.),vec2(-1.,1.),vec2(2.,1.),vec2(0.,2.),vec2(1.,2.));
  for(int k=0;k<12;k++)g[k]=TXL(i0+ofs[k]+.5).g;
  float ev=abs(g[0]-g[2])+abs(col.g-g[2])+abs(col.g-g[0]);
  if(ev>8./255.){float mean=(g[0]+g[1]+g[2]+g[3])*.25;float sm=0.;for(int k=0;k<12;k++){g[k]-=mean;sm+=abs(g[k]);}float sd=10.14185/max(sm,1e-5);sd*=sd;
   float aw=0.,ay=0.;for(int k=0;k<12;k++){vec2 dd=fr-ofs[k];float x=dot(dd,dd)*.55+clamp(abs(g[k])*sd,0.,1.);float wA=x-4.;float w=(x-1.)*wA*wA*wA;aw+=w;ay+=w*g[k];}
   float fy=ay/aw;float mx=max(max(g[0],g[1]),max(g[2],g[3])),mn=min(min(g[0],g[1]),min(g[2],g[3]));
   float dl=clamp((1.+2.*u_p3)*fy,mn,mx)-(col.g-mean);dl=clamp(dl,-23./255.,23./255.);col=clamp(col+dl,0.,1.);}
  o=col;}
 return vec4(clamp(o,0.,1.),1.);`],
 'simulates an N-pixel source (box-averaged blocks) and upscales it back. libplacebo filters.c: separable radius-3 sinc windowed by sphinx (first zero 1.4303), kaiser (alpha 2, Bessel I0) or blackman (a = .16), anti-ringing clamps to the two centre taps per axis (pl_shader_sample_ortho2); EWA Lanczos (jinc x jinc window, radius 3.2383) with libplacebo polar anti-ringing (weighted power-32 means of c and 1-c over taps inside the first zero); NIS (NVIDIA Image Scaling): Lanczos-3 isotropic scaler (≈ coef_scaler), GetEdgeMap 4-direction detector (kDetectRatio 2x1127/1024, kDetectThres 64/1024) blending 0/90 degree directional filters, luma-ramped USM 1.2002/-0.6001 with NVScalerUpdateConfig sharpness limits (approx.: diagonal filters folded into the isotropic one, no LTI); SGSR v1 (Qualcomm): 12-tap fastLanczos2 edge-adaptive weights on G, EdgeThreshold 8/255, EdgeSharpness 1+2xSharpness, ±23/255 clamp');

f('q26_anime4k_ops','Anime4K Helpers (Thin / Darken / Deblur DoG / Clamp Highlights)',
 [S('Mode',['Thin (line thinning warp)','Darken (DoG line darkening)','Deblur DoG','Thin + Darken + Deblur']),P('Strength',0,4,1,.05),P('Line scale (sigma at 1080p)',.5,6,2,.1,'px'),S('Clamp highlights (de-ring)',['Off','On'],1)],
 [`
#define Q26_Y(q) dot(O(q).rgb,vec3(.299,.587,.114))
 vec2 e=u_px;float a00=Q26_Y(uv-e),a10=Q26_Y(uv+vec2(0.,-e.y)),a20=Q26_Y(uv+vec2(e.x,-e.y)),a01=Q26_Y(uv+vec2(-e.x,0.)),a21=Q26_Y(uv+vec2(e.x,0.)),a02=Q26_Y(uv+vec2(-e.x,e.y)),a12=Q26_Y(uv+vec2(0.,e.y)),a22=Q26_Y(uv+e);
 float gx=((a20-a00)+2.*(a21-a01)+(a22-a02))/8.,gy=((a02+2.*a12+a22)-(a00+2.*a10+a20))/8.;return vec4(pow(sqrt(gx*gx+gy*gy),.7),Q26_Y(uv),0.,1.);`,
 `float sT=max(R(u_p2),.3),sD=max(R(u_p2)*.5,.3);float kt=max(ceil(sT*2.),1.),kd=max(ceil(sD*2.),1.);float at=0.,wt=0.,ad=0.,wd=0.;
 for(int i=-12;i<=12;i++){float x=float(i);vec4 v=T(uv+vec2(x*u_px.x,0.));if(abs(x)<=kt){float g=exp(-.5*x*x/(sT*sT));at+=v.r*g;wt+=g;}if(abs(x)<=kd){float g=exp(-.5*x*x/(sD*sD));ad+=v.g*g;wd+=g;}}
 float l=T(uv-vec2(u_px.x,0.)).g,c0=T(uv).g,r=T(uv+vec2(u_px.x,0.)).g;return vec4(at/wt,ad/wd,min(min(l,c0),r),max(max(l,c0),r));`,
 `float sT=max(R(u_p2),.3),sD=max(R(u_p2)*.5,.3);float kt=max(ceil(sT*2.),1.),kd=max(ceil(sD*2.),1.);float at=0.,wt=0.,ad=0.,wd=0.;
 for(int i=-12;i<=12;i++){float x=float(i);vec4 v=T(uv+vec2(0.,x*u_px.y));if(abs(x)<=kt){float g=exp(-.5*x*x/(sT*sT));at+=v.r*g;wt+=g;}if(abs(x)<=kd){float g=exp(-.5*x*x/(sD*sD));ad+=v.g*g;wd+=g;}}
 vec4 a=T(uv-vec2(0.,u_px.y)),b=T(uv),c2=T(uv+vec2(0.,u_px.y));return vec4(at/wt,ad/wd,min(min(a.b,b.b),c2.b),max(max(a.a,b.a),c2.a));`,
 `
#define Q26_Y(q) dot(O(q).rgb,vec3(.299,.587,.114))
 vec4 s=T(uv);float L0=Q26_Y(uv);float c1=(L0-s.g)*.6*u_p1;const float BT=.1,NT=.001;float tr=BT-NT;float ct=abs(c1);
 if(ct>NT){ct=(ct-NT)/tr;ct=pow(ct,.6);ct=ct*tr+NT;ct*=sign(c1);}else ct=c1;float cc=clamp(ct+L0,s.b,s.a)-L0;
 float sD=max(R(u_p2)*.5,.3);float kd=max(ceil(sD*2.),1.);float ad=0.,wd=0.;
 for(int i=-12;i<=12;i++){float x=float(i);if(abs(x)>kd)continue;vec2 q=uv+vec2(x*u_px.x,0.);float g=exp(-.5*x*x/(sD*sD));ad+=-min(Q26_Y(q)-T(q).g,0.)*g;wd+=g;}
 return vec4(s.r,ad/wd,.5+cc,1.);`,
 `float sD=max(R(u_p2)*.5,.3);float kd=max(ceil(sD*2.),1.);float ad=0.,wd=0.;
 for(int i=-12;i<=12;i++){float x=float(i);if(abs(x)>kd)continue;float g=exp(-.5*x*x/(sD*sD));ad+=T(uv+vec2(0.,x*u_px.y)).g*g;wd+=g;}vec4 s=T(uv);return vec4(s.r,ad/wd,s.b,1.);`,
 `
#define Q26_Y(q) dot(O(q).rgb,vec3(.299,.587,.114))
 int m=int(u_p0+.5);vec4 s=T(uv);vec3 col=O(uv).rgb;
 if(m==0||m==3){vec2 e=u_px;float a00=T(uv-e).r,a10=T(uv+vec2(0.,-e.y)).r,a20=T(uv+vec2(e.x,-e.y)).r,a01=T(uv+vec2(-e.x,0.)).r,a21=T(uv+vec2(e.x,0.)).r,a02=T(uv+vec2(-e.x,e.y)).r,a12=T(uv+vec2(0.,e.y)).r,a22=T(uv+e).r;
  vec2 dn=vec2(((a20-a00)+2.*(a21-a01)+(a22-a02))/8.,((a02+2.*a12+a22)-(a00+2.*a10+a20))/8.);float rel=u_p1*.6*R(u_p2)*.5;col=O(uv-dn/(length(dn)+.01)*u_px*rel).rgb;}
 if(m==1||m==3)col-=s.g*1.5*u_p1;
 if(m==2||m==3)col+=s.b-.5;
 if(u_p3>.5){float mx=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)mx=max(mx,Q26_Y(uv+vec2(float(i),float(j))*u_px));float cl=dot(col,vec3(.299,.587,.114));col-=max(cl-mx,0.);}
 return vec4(clamp(col,0.,1.),1.);`],
 'ports of bloc97 Anime4K GLSL (MIT): Thin_HQ (Sobel of luma, |grad|^0.7, Gaussian sigma 2 at 1080p, Sobel again, one warp step 0.6 px x Strength along the normalised gradient), Darken_HQ (min(L - G(L), 0) blurred again, added x1.5 Strength), Deblur_DoG (7-tap Gaussian DoG x0.6, power curve 0.6 between noise .001 and blur .1 thresholds, clamped to the 3x3 min/max), Clamp_Highlights (luma clamped to the 5x5 max of the original luma, here applied after the chosen mode); sigma scales with Line scale');

f = add('Repair');
f('q26_hdeband','hdeband (run-following deband, mpv shader)',[P('Radius (steps)',1,8,8,1),P('Sparsity',0,4,2,.5),P('Tolerance',0,6,1,.5,'/255'),P('Intensity sigma (SI)',5,200,50,1)],
 `vec3 poi=c.rgb;vec3 sum=poi*4.,tw=vec3(4.);float tol=u_p2/255.+1e-4;int nr=int(u_p0+.5);
 for(int d=0;d<8;d++){float an=float(d)*.78539816;vec2 dir=vec2(cos(an),sin(an));dir/=max(abs(dir.x),abs(dir.y));vec3 prev=poi,pr=vec3(1.),nd=vec3(1.);
  for(int i=1;i<=8;i++){if(i>nr)break;float st=float(i)+floor(float(i)*u_p1);vec3 px=T(uv+dir*R(st)*u_px).rgb;vec3 ir=step(abs(px-prev),vec3(tol));nd*=clamp(pr+ir,0.,1.);
   vec3 dv=abs(poi-px)*u_p3;vec3 w=ir*nd*exp(-dv*dv);sum+=w*px;tw+=w;prev=px;pr=ir;}}
 return vec4(sum/tw,1.);`,
 'AN3223 hdeband.glsl (LGPL, mpv user shader) idea: from each pixel walk 8 directions with sparse steps i+floor(i x Sparsity) (3,6..24 px at defaults), averaging only samples inside runs of (near-)equal values; a direction stops after two consecutive non-run samples; weights exp(-(|poi-px| x SI)^2), start weight 4 (SW), no distance falloff (S = 0); Tolerance > 0 because 8-bit inputs are already quantized (approx. port written from the algorithm description)');

f = add('Distort');
f('q26_pd_distort','PhotoDemon Distorts (Figured Glass / Donut / Poke / Squish)',
 [S('Effect',['Figured Glass','Donut','Poke','Squish']),P('Amount',-1,1,.5,.01),P('Amount 2',-1,1,.5,.01),P('Angle',-180,180,0,1,'deg')],
 `int m=int(u_p0+.5);vec2 Wd=u_res/u_k;vec2 p=PX(uv);vec2 s=p;int em=0;
 if(m==0){em=1;float S=abs(u_p1)*20.*.01*min(Wd.x,Wd.y);if(S>.5){vec2 q=rot(p/S,radians(u_p3))+vec2(hash(vec2(u_seed,1.))*1e3,hash(vec2(u_seed,2.))*1e3);vec2 iq=floor(q),fq=fract(q);vec2 uu=fq*fq*(3.-2.*fq);float nn[4];
  for(int k=0;k<4;k++){vec2 oo=vec2(float(k-2*(k/2)),float(k/2));float an=6.2831853*hash(iq+oo);nn[k]=dot(vec2(cos(an),sin(an)),fq-oo);}
  float n=mix(mix(nn[0],nn[1],uu.x),mix(nn[2],nn[3],uu.x),uu.y)*1.4;float tb=abs(u_p2);float a=6.2831853*tb*n;s=p+vec2(sin(a)*S,cos(a)*S*tb);}}
 else if(m==1){em=3;float a0=radians(u_p3);float mn=min(Wd.x,Wd.y);float rIn=max(u_p2,0.)*.4*mn,h=max(abs(u_p1)*mn,1e-3);vec2 n=p-Wd*.5;float th=mod(atan(-n.y,-n.x)+a0,6.2831853);s=vec2(th*(Wd.x-1.)/6.2831853,(Wd.y-1.)*(1.-(length(n)-rIn)/h));}
 else if(m==2){float sx=clamp(exp2(-2.*u_p1),.01,3.);vec2 n=rot(2.*p/Wd-1.,radians(u_p3));float rr=pow(max(length(n),1e-6),sx);float th=atan(n.y,n.x)-radians(u_p3);s=Wd*(rr*vec2(cos(th),sin(th))+1.)*.5;}
 else{em=2;float xr=u_p1,yr=u_p2;vec2 mid=Wd*.5;float lx=xr>=0.?(Wd.y-p.y)/Wd.y*mid.x*xr:p.y/Wd.y*mid.x*(-xr);float ty=yr>=0.?(Wd.x-p.x)/Wd.x*mid.y*yr:p.x/Wd.x*mid.y*(-yr);
  s=vec2((p.x-lx)/max(Wd.x-2.*lx,1e-3)*Wd.x,(p.y-ty)/max(Wd.y-2.*ty,1e-3)*Wd.y);}
 vec2 t=s/Wd;if(em==3&&(t.x<0.||t.x>1.||t.y<0.||t.y>1.))return vec4(0.,0.,0.,1.);
 t=em==1?1.-abs(1.-mod(t,2.)):em==2?fract(t):clamp(t,0.,1.);return vec4(O(t).rgb,1.);`,
 'PhotoDemon (Tanner Helland) mappings: Figured Glass = displacement sin/cos(2pi x turbulence x noise) x scale (scale = |Amount| x 20% of the short side, turbulence = |Amount 2|, gradient noise stands in for OpenSimplex, reflect edges, seed = noise offset, Angle rotates the noise); Donut = polar unwrap (angle to x, distance from the interior radius to y; height = |Amount|, interior = Amount 2 x 40%, spread 360, erase edges); Poke = centre-relative radius raised to s = 2^(-2 Amount) (clamped .01..3, clamp edges); Squish = keystone squeeze, x by Amount and y by Amount 2 (wrap edges); single sample (quality 2)', true);

f('q26_equations','Equations (Affinity, preset expressions)',
 [S('Equation',['x = x + a w ; y = y + b h (offset)','x = x + a sin(y) ; y = y + a sin(x) (waves)','t = t + a pi (1 - r) (twirl)','r = r^(2^(1.5 a)) (polar power)','t = |mod(t, 2pi/n) - pi/n| (kaleidoscope)','r = r + a sin(r) (ripple)']),P('Parameter A',-1,1,.3,.01),P('Parameter B',-1,1,.3,.01),S('Extend mode',['Zero','Full','Repeat','Wrap','Mirror'],4)],
 `int m=int(u_p0+.5);float a=u_p1,b=u_p2;vec2 Wd=u_res/u_k;vec2 p=PX(uv);vec2 C=Wd*.5;vec2 d=p-C;float r=length(d),t=atan(d.y,d.x);float rm=length(C);vec2 s=p;
 if(m==0)s=p+vec2(a,b)*Wd;
 else if(m==1){float fq=6.2831853*(1.+abs(b)*8.);s=p+vec2(sin(p.y/Wd.y*fq),sin(p.x/Wd.x*fq))*a*.05*min(Wd.x,Wd.y);}
 else{if(m==2)t+=a*3.14159265*(1.-clamp(r/rm,0.,1.))*(1.+b);
  else if(m==3)r=rm*pow(r/rm,exp2(a*1.5));
  else if(m==4){float n=2.+floor(abs(b)*10.+.5);float sg=6.2831853/n;t=abs(mod(t+a*3.14159265,sg)-sg*.5);}
  else r+=a*.04*rm*sin(r/rm*6.2831853*(2.+abs(b)*12.));
  s=C+r*vec2(cos(t),sin(t));}
 vec2 q=s/Wd;int em=int(u_p3+.5);bool out_=q.x<0.||q.x>1.||q.y<0.||q.y>1.;
 if(out_&&em==0)return vec4(0.,0.,0.,1.);if(out_&&em==1)return vec4(1.);
 q=em==3?fract(q):em==4?1.-abs(1.-mod(q,2.)):clamp(q,0.,1.);return vec4(O(q).rgb,1.);`,
 'Affinity Photo Equations filter: the output pixel samples the source at x, y (Cartesian) or r, t (polar about the centre) given by an expression with sliders a, b; free-form expressions are not possible here, so six preset expressions are offered (w, h = size, r normalised to the half-diagonal); extend modes Zero / Full / Repeat / Wrap / Mirror as in Affinity');

f = add('Color');
f('q26_alphamath','Alpha Math (Multiply / Divide by Alpha, Remove White Matte)',
 [S('Operation',['Multiply by Alpha (premultiply)','Divide by Alpha (unpremultiply)','Remove White Matte']),S('Alpha from',['Image alpha','Luminance','Inverted luminance'],1)],
 `int m=int(u_p0+.5),as=int(u_p1+.5);vec4 o=O(uv);float a=as==0?o.a:as==1?luma(o.rgb):1.-luma(o.rgb);float ai=max(a,1./255.);vec3 r;
 if(m==0)r=o.rgb*a;else if(m==1)r=o.rgb/ai;else r=(o.rgb-(1.-a))/ai;return vec4(clamp(r,0.,1.),1.);`,
 'Affinity Photo 2 Filters > Colors: Multiply by Alpha = rgb x a (premultiply, shown over black); Divide by Alpha = rgb / a; Remove White Matte = (rgb - (1 - a)) / a (undo compositing over white); an opaque image has alpha 1 (identity), so luminance can stand in as alpha; the result is shown opaque');

f = add('Depth');
f('q26_jointbilateral','Joint Bilateral Filter (OpenCV ximgproc)',
 [S('Guide image',['Depth map','Image itself (plain bilateral)','Gaussian-smoothed image']),P('Sigma space',1,20,5,.5,'px'),P('Sigma color',.01,.5,.1,.005),P('Guide smoothing',0,20,4,.5,'px')],
 [`if(int(u_p0+.5)!=2)return T(uv);return blur1d(u_tex,uv,vec2(1.,0.),R(u_p3)*2.);`,
  `if(int(u_p0+.5)!=2)return T(uv);return blur1d(u_tex,uv,vec2(0.,1.),R(u_p3)*2.);`,
  `int g=int(u_p0+.5);float ss=max(R(u_p1),.5);float sc=u_p2;float rad=floor(ss*1.5+.5);float st=max(1.,rad/9.);
 vec3 J0=g==0?vec3(D(uv)):g==1?O(uv).rgb:T(uv).rgb;vec3 acc=vec3(0.);float ws=0.;
 for(int j=-9;j<=9;j++)for(int i=-9;i<=9;i++){vec2 o=vec2(float(i),float(j))*st;if(length(o)>rad+.01)continue;vec2 q=uv+o*u_px;
  vec3 J=g==0?vec3(D(q)):g==1?O(q).rgb:T(q).rgb;vec3 dj=abs(J-J0);float dc=g==0?dj.x:dj.x+dj.y+dj.z;
  float w=exp(-dot(o,o)/(2.*ss*ss)-dc*dc/(2.*sc*sc));acc+=w*O(q).rgb;ws+=w;}
 return vec4(acc/ws,1.);`],
 'cv::ximgproc::jointBilateralFilter(joint, src, d = -1 -> radius round(1.5 sigmaSpace), sigmaColor, sigmaSpace): spatial Gaussian x Gaussian of the L1 colour distance in the guide (joint) image, averaging the source; the second (joint) image is taken from the depth map, the image itself, or its Gaussian-smoothed copy (first rolling-guidance step); taps strided beyond radius 9');

f = add('Stylize');
f('q26_pd_light','PhotoDemon Light FX (Black Light / Atmosphere / Portrait Glow / Ignite)',
 [S('Effect',['Black Light','Atmosphere (global)','Atmosphere (local)','Portrait Glow classic (screen)','Portrait Glow modern (overlay)','Portrait Glow subtle (soft light)','Ignite']),P('Strength',0,2,1,.01),P('Radius or flame height',1,100,10,1),P('Intensity',0,3,1,.01)],
 [`int m=int(u_p0+.5);if(m!=6)return O(uv);vec3 mn=O(uv).rgb;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)mn=min(mn,O(uv+vec2(float(i),float(j))*u_px).rgb);return vec4(O(uv).rgb-mn,1.);`,
  `int m=int(u_p0+.5);if(m<3||m>5)return T(uv);return blur1d(u_tex,uv,vec2(1.,0.),R(u_p2));`,
  `int m=int(u_p0+.5);if(m<3||m>5)return T(uv);return blur1d(u_tex,uv,vec2(0.,1.),R(u_p2));`,
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb;
 if(m==0){float gy=(o.r+o.g+o.b)/3.;return vec4(min(vec3(1.),abs(o-gy)*2.*u_p3),1.);}
 if(m<=2){vec3 e;if(m==1)e=vec3(o.g+o.b,o.r+o.b,o.r+o.g)*.5;else{float Lh=(218.*o.r+732.*o.g+74.*o.b)/1024.;float nr=o.g+o.b-Lh;float ng=nr+o.b-Lh;float nb=nr+ng-Lh;e=clamp(vec3(nr,ng,nb),0.,1.);}
  return vec4(mix(o,overlay(o,e),clamp(.5*u_p1,0.,1.)),1.);}
 if(m<=5){vec3 bl=min(vec3(1.),T(uv).rgb*u_p3);vec3 bm=m==3?screen(o,bl):m==4?overlay(o,bl):(1.-2.*bl)*o*o+2.*bl*o;return vec4(mix(o,bm,clamp(u_p1,0.,1.)),1.);}
 float Rf=max(u_p2*.01*u_res.y,1.);float st=max(1.,Rf/64.);vec3 acc=T(uv).rgb;
 for(int k=1;k<=64;k++){float kk=float(k)*st;if(kk>Rf)break;vec3 e=T(uv+vec2(0.,kk*u_px.y)).rgb;float d=(e.r+e.g+e.b)/3.*Rf;if(d>=kk)acc=mix(acc,e,1.-kk/d);}
 float gy=(acc.r+acc.g+acc.b)/3.;float I=max(5.*u_p3,.01);vec3 fl=vec3(min(1.,gy*I),gy,gy/I);return vec4(mix(o,screen(o,fl),clamp(.5*u_p1,0.,1.)),1.);`],
 'PhotoDemon (Tanner Helland) ports: Black Light = |c - (r+g+b)/3| x intensity (default 2); Atmosphere = channel cross-mix (global: (g+b)/2, (r+b)/2, (r+g)/2; local: luma-referenced chain nR = g+b-L, nG = nR+b-L, nB = nR+nG-L) overlaid at 50%; Portrait Glow = Gaussian copy x exposure boost composited by screen / overlay / soft light at 100%; Ignite = contour map (c - 3x3 min) smeared upward by brightness x flame height (10% of image height default; PhotoDemon sequential in-place smear evaluated as an ordered gather), recoloured (gray x 5, gray, gray / 5) and screened at 50%; Strength and Intensity scale the PhotoDemon defaults');

f('q26_pd_art','PhotoDemon Modern Art / Gradient Flow',
 [S('Effect',['Modern Art','Gradient Flow (magnitude)','Gradient Flow (direction)']),P('Radius or tile size',1,40,6,1,'px'),P('Smoothing',0,30,0,.5,'px'),P('Boost',0,100,0,1)],
 [`if(int(u_p0+.5)==0)return T(uv);return blur1d(u_tex,uv,vec2(1.,0.),R(u_p2));`,
  `if(int(u_p0+.5)==0)return T(uv);return blur1d(u_tex,uv,vec2(0.,1.),R(u_p2));`,
  `vec2 e=u_px;float tl=L(uv-e),tc=L(uv+vec2(0.,-e.y)),tr=L(uv+vec2(e.x,-e.y)),ml=L(uv+vec2(-e.x,0.)),mr=L(uv+vec2(e.x,0.)),bl=L(uv+vec2(-e.x,e.y)),bc=L(uv+vec2(0.,e.y)),br=L(uv+e);
 float hx=(3.*tl+10.*ml+3.*bl)-(3.*tr+10.*mr+3.*br),vy=(3.*tl+10.*tc+3.*tr)-(3.*bl+10.*bc+3.*br);return vec4(.5+hx/32.,.5+vy/32.,0.,1.);`,
  `int m=int(u_p0+.5);float bm=u_p3/10.+1.;
 if(m==0){float rr=max(R(u_p1),1.);float st=max(1.,rr/7.);vec3 lo=vec3(1.),hi=vec3(0.);for(int j=-7;j<=7;j++)for(int i=-7;i<=7;i++){vec2 o=vec2(float(i),float(j))*st;if(abs(o.x)>rr+.01||abs(o.y)>rr+.01)continue;vec3 v=O(uv+o*u_px).rgb;lo=min(lo,v);hi=max(hi,v);}
  vec3 v=O(uv).rgb;return vec4(mix(hi,lo,vec3(greaterThan(v-lo,hi-v))),1.);}
 if(m==1){vec2 g0=(T(uv).xy-.5)*32.;return vec4(vec3(min(1.,min(1.,length(g0)/8.)*bm)),1.);}
 float Rs=max(u_p1,3.);vec2 p=PX(uv);vec2 ti=floor(p/Rs);float best=0.;vec3 pen=vec3(0.);float lw=1.6;
 for(int tj=-1;tj<=1;tj++)for(int tq=-1;tq<=1;tq++){vec2 tc=ti+vec2(float(tq),float(tj));vec2 c0=(tc+.5)*Rs;vec2 sv=vec2(0.);vec3 av=vec3(0.);
  for(int k=0;k<16;k++){vec2 q=(tc+(vec2(float(k-4*(k/4)),float(k/4))+.5)/4.)*Rs;vec2 qu=fromPX(q);vec2 gg=(T(qu).xy-.5)*32.;float gl=length(gg);if(gl>1e-4)sv+=min(1.,gl/8.)*gg/gl;av+=O(qu).rgb;}
  sv*=Rs*Rs/16.;av/=16.;float hr=sqrt(Rs)*bm;float Tl=min(length(sv)*hr,hr*bm);if(Tl<=.1)continue;vec2 v=min(1.41421356*Tl,Rs*1.4)*normalize(sv);
  vec2 pa=p-(c0-v),ba=2.*v;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);float dd=length(pa-ba*h);float cov=1.-smoothstep(lw*.5-.5,lw*.5+.5,dd);if(cov>best){best=cov;pen=av;}}
 return vec4(mix(vec3(1.),pen,best),1.);`],
 'PhotoDemon (Tanner Helland): Modern Art = per channel the 1st / 99th percentile of the window (min / max when the window has < 200 px, as here with strided taps beyond 7 px) replaced by whichever extreme is farther from the pixel; Gradient Flow = Scharr gradient (3,10,3) of the optionally blurred gray map, magnitude min(255, |g| / 8) x (1 + boost / 10), or per tile the magnitude-weighted gradient vector sum drawn as a 1.6 px line of the tile average colour on white (arrow caps omitted)');
