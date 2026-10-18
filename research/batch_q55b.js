/* ================= q55b: round-19 purzOS OFX analog/glitch plugins (ported from purzbeats/purzos-ofx sources) and RetroArch slang-shaders (xsoft, xsal, 3dfx, powervr2, pal-r57shell, MMJ cel, advcartoon) ================= */
// purzfx.hpp hashes: hashu = HEADER hh_ (same constants); hash2(a,b) = uf(a*0x9e3779b1 ^ hashu(b*0x85ebca6b+1)); hash3 = chained hashu; uf = (h>>8)/2^24
const Q55_HDEF = `
#define Q55H2(a_,b_) (float((uint(a_)*0x9e3779b1u^hh_(uint(b_)*0x85ebca6bu+1u))>>8u)*(1./16777216.))
#define Q55H3(a_,b_,c_) (float(hh_(hh_(hh_(uint(a_)*0x9e3779b1u)^(uint(b_)*0x85ebca6bu))^(uint(c_)*0xc2b2ae35u))>>8u)*(1./16777216.))
`;
const Q55_ROW = `float W=u_res.x,H=u_res.y;float tx=floor(uv.x*W),ty=floor((1.-uv.y)*H);int sd=int(u_seed*10.);`;
const Q55_YIQ = `vec3 m3=vec3(.299,.587,.114),i3=vec3(.596,-.274,-.322),q3=vec3(.211,-.523,.312);`;
const Q55_RGB = (Y, I, Q) => `clamp(vec3((${Y})+.956*(${I})+.621*(${Q}),(${Y})-.272*(${I})-.647*(${Q}),(${Y})-1.106*(${I})+1.703*(${Q})),0.,1.)`;

f = add('Retro');
f('q55_purz_lumaring','Luma Ring (purzOS)',[P('Softness',0,1,.35,.01),P('Ring',0,3,.8,.01),P('Ghost',-1,1,.25,.01),P('Ghost distance',2,256,28,1,'px')],
  [`float W=u_res.x;float x=floor(uv.x*W);float r=max(1.,floor(2.*u_k+.5));float s=0.,n=0.;
 for(int i=-24;i<=24;i++){float fi=float(i);if(abs(fi)>r)continue;float xx=x+fi;if(xx<0.||xx>W-1.)continue;s+=dot(O(vec2((xx+.5)/W,uv.y)).rgb,vec3(.299,.587,.114));n+=1.;}
 float Y=dot(O(uv).rgb,vec3(.299,.587,.114));return vec4(Y+(s/n-Y)*u_p0,0.,0.,1.);`,
   `${Q55_YIQ}float W=u_res.x;float x=floor(uv.x*W);float r=max(1.,floor(2.*u_k+.5));float r2=2.*r+1.;float D=max(1.,floor(u_p3*u_k+.5));vec2 Lv=vec2(0.);
 for(int k=0;k<2;k++){float xc=k==0?x:max(0.,x-D);float s=0.,n=0.;for(int i=-50;i<=50;i++){float fi=float(i);if(abs(fi)>r2)continue;float xx=xc+fi;if(xx<0.||xx>W-1.)continue;s+=T(vec2((xx+.5)/W,uv.y)).r;n+=1.;}
  float S0=T(vec2((xc+.5)/W,uv.y)).r;Lv[k]=S0+(S0-s/n)*u_p1;}
 float G=Lv.x+u_p2*.5*(Lv.y-.5);vec3 o=O(uv).rgb;float I=dot(o,i3),Q=dot(o,q3);return vec4(${Q55_RGB('G','I','Q')},1.);`],
  'purzOS OFX lumaring.cpp: per scanline YIQ, luma box blur r = round(2*scale), S = Y + (blur - Y)*softness, ring L = S + (S - box(S, 2r+1))*ring, ghost G = L + ghost*0.5*(L[x - distance] - 0.5), back to RGB with the original I/Q');
f('q55_purz_rainbow','Rainbow Phase (purzOS)',[P('Hue drift',0,45,10,.5,'deg'),P('Cross colour',0,1,.4,.01),P('Dot crawl',0,1,.35,.01),P('Time',0,10,0,.01)],
  `${Q55_YIQ}float W=u_res.x,H=u_res.y;float lx=floor(uv.x*W),ly=floor((1.-uv.y)*H);float t=u_p3;
 float hr=u_p0*PI/180.*(sin(ly*.71+t*1.13)+.5*sin(ly*2.31-t*.67));float ch=cos(hr),sh=sin(hr);float lp=mod(ly,2.)*PI+t*PI;float om=6.2831853/(3.*u_k);float ph=lx*om+lp;
 vec2 e=vec2(1./W,0.);vec3 a=O(uv-e).rgb,b=O(uv).rgb,d=O(uv+e).rgb;float Y=dot(b,m3),I=dot(b,i3),Q=dot(b,q3);
 float I2=I*ch-Q*sh,Q2=I*sh+Q*ch;float hp=Y-(dot(a,m3)+Y+dot(d,m3))/3.;I2+=u_p1*hp*2.2*cos(ph);Q2+=u_p1*hp*2.2*sin(ph);
 float ca=abs(dot(a,i3))+abs(dot(a,q3)),cb=abs(I)+abs(Q),cd=abs(dot(d,i3))+abs(dot(d,q3));Y+=u_p2*(cb-(ca+cb+cd)/3.)*.8*cos(ph);
 return vec4(${Q55_RGB('Y','I2','Q2')},1.);`,
  'purzOS OFX rainbowphase.cpp: per-line hue error hue*(sin(.71 y + 1.13 t) + .5 sin(2.31 y - .67 t)) rotates I/Q; cross colour adds 2.2*cross*highpass(Y) on a 3-px subcarrier (phase flips per line); dot crawl adds .8*crawl*highpass(|I|+|Q|) to luma; Time = time*speed');
f('q55_purz_tapewow','Tape Wow (purzOS)',[P('Wow',0,64,6,.5,'px'),P('Flutter',0,32,3,.5,'px'),P('Head skew',0,128,24,1,'px'),P('Time',0,10,0,.01)],
  `${Q55_ROW}float t=u_p3;float wo=R(u_p0),fl=R(u_p1),bo=R(2.),sk=R(u_p2);float hs=floor(8.*u_k+.5);
 float dx=sin(t*.71)*wo+sin(t*.233+1.7)*wo*.5+sin(ty*.013+t*2.9)*fl+sin(ty*.037+t*5.3)*fl*.4;
 uint sdh=hh_(uint(sd)*0x9E3779B9u+6u);uint fs=hh_(sdh*0x9E3779B9u^hh_(uint(int(floor(t+.5)))));
 if(hs>0.&&ty>=H-hs){float k=(ty-(H-hs))/hs;float hv=float(hh_(fs*0x9E3779B9u^hh_(uint(int(ty))))>>8u)/16777216.;dx+=sk*k*k+(hv*2.-1.)*sk*.3*k;}
 float vy=sign(sin(t*1.31))*floor(abs(sin(t*1.31)*bo)+.5);float ix=sign(dx)*floor(abs(dx)+.5);float sx=mod(tx-ix,W);float sy=clamp(ty-vy,0.,H-1.);
 return vec4(O(vec2((sx+.5)/W,1.-(sy+.5)/H)).rgb,1.);`,
  'purzOS OFX tapewow.cpp: per-row horizontal offset = wow (sin .71t + .5 sin(.233t+1.7)) + flutter (sin(.013y+2.9t) + .4 sin(.037y+5.3t)), bottom head-switch band (8 px, bounce 2 px fixed) skewed by skew*k^2 + hashed tear, horizontal wrap; Time = time*speed, seed = hash seed', true);
f('q55_purz_syncdrift','Sync Drift (purzOS)',[P('Shear',-3,3,.15,.01),P('Flagging',0,64,12,.5,'px'),P('Flag height',4,256,48,1,'px'),P('Roll',0,1,0,.01)],
  `${Q55_ROW}float ro=floor(u_p3*H+.5);float sy=mod(ty+ro,H);bool bar=ro!=0.&&sy>=H-max(2.,floor(H/24.));float dx=u_p0*ty;float fh=max(1.,floor(u_p2*u_k+.5));
 if(ty<fh){float k=1.-ty/fh;dx+=R(u_p1)*k*k*.75;}float ix=sign(dx)*floor(abs(dx)+.5);float sc=mod(tx-ix,W);vec3 o=O(vec2((sc+.5)/W,1.-(sy+.5)/H)).rgb;if(bar)o/=6.;return vec4(o,1.);`,
  'purzOS OFX syncdrift.cpp: h-hold shear dx = shear*row, top-of-frame flagging flag*k^2*(.75 + .25 sin 1.7t) over flagH rows (t = 0 here), vertical roll by Roll*height with wrap and a blanking bar (height/24, RGB/6) when rolling, horizontal wrap');
f('q55_purz_phosphor','Phosphor Melt (purzOS)',[P('Decay',.5,.999,.96,.001),P('Threshold',0,1,.55,.01),P('Strength',0,1,.9,.01),S('Direction',['Down','Up','Right','Left'])],
  `int dr=int(u_p3+.5);vec2 st=dr==0?vec2(0.,1.):dr==1?vec2(0.,-1.):dr==2?vec2(-1.,0.):vec2(1.,0.);float dp=clamp(1.-(1.-u_p0)/max(.01,u_k),0.,.999);
 float N=min(log(.003)/log(dp),dr<2?u_res.y:u_res.x);float sp=max(1.,N/400.);vec3 acc=vec3(0.);
 for(int i=0;i<400;i++){float k=float(i)*sp;if(k>N)break;vec2 q=uv+st*k*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;vec3 v=O(q).rgb;
  if(dot(v,vec3(.299,.587,.114))>=u_p1)acc=max(acc,v*pow(dp,k));}
 return vec4(max(c.rgb,acc*u_p2),1.);`,
  'purzOS OFX phosphormelt.cpp: seed = pixel colour where luma >= threshold, directional recurrence trail = max(seed, trail*decay) along each line (evaluated here as max over upstream pixels of seed*decay^k, decay rescaled 1-(1-decay)/scale, up to 400 taps), out = max(src, trail*strength)');
f('q55_purz_stutter','Line Stutter (purzOS)',[P('Amount',0,1,.4,.01),P('Bands',2,64,16,1),P('Freeze',0,1,.3,.01),P('State',0,50,1,1)],
  `${Q55_HDEF}${Q55_ROW}float nb=max(2.,floor(u_p1+.5));int band=int(floor(ty*nb/H));int stt=Q55H2(band,sd)<u_p2?0:int(u_p3+.5);float h=Q55H2(band,stt+sd);
 float sh=floor((h-.5)*u_p0*W+.5);float sx=mod(tx+sh,W);return vec4(T(vec2((sx+.5)/W,uv.y)).rgb,1.);`,
  'purzOS OFX linestutter.cpp with the purzfx.hpp hashes: band = row*bands/H, frozen bands (hash2(band,seed) < freeze) keep state 0, shift = round((hash2(band, state+seed) - .5)*amount*width), horizontal wrap; State = frame/hold', true);
f('q55_purz_headswitch','Head Switch (purzOS)',[P('Height',4,60,18,.5,'px'),P('Skew',0,120,40,1,'px'),P('Noise',0,1,.4,.01),P('Frame',0,100,0,1)],
  `${Q55_HDEF}${Q55_ROW}float fr=floor(u_p3+.5);float bH=R(u_p0);float bh=max(1.,bH+.3*bH*sin(fr*.3));float top=H-1.-bh;vec3 o=c.rgb;
 if(ty>=top){float t=clamp((ty-top)/bh,0.,1.);float xv=ty*.7+fr*3.;float xi=floor(xv),xf=xv-xi,u=xf*xf*(3.-2.*xf);float jit=.6+.4*mix(Q55H2(int(xi),sd),Q55H2(int(xi)+1,sd),u);
  float sx=mod(tx+floor(R(u_p1)*t*jit+.5),W);vec3 sm=T(vec2((sx+.5)/W,uv.y)).rgb;float sn=Q55H3(int(tx),int(ty),int(fr)*13+sd);o=mix(sm,vec3(sn),clamp(u_p2*t,0.,1.));}
 return vec4(o,1.);`,
  'purzOS OFX headswitch.cpp with the purzfx.hpp hashes: bottom band height*(1 + .3 sin(.3 frame)) (drift .3), tear = skew*t*(.6 + .4 vnoise1(.7 row + 3 frame)), wrapped sample blended toward hash3 static by noise*t', true);
f('q55_purz_trackbar','Tracking Bar (purzOS)',[P('Position',0,1,.85,.01),P('Height',.02,.4,.12,.01),P('Tear',0,150,60,1,'px'),P('Noise',0,1,.6,.01)],
  `${Q55_HDEF}${Q55_ROW}float d=abs(ty/H-u_p0);d=min(d,1.-d);float hh=max(1e-4,u_p1*.5);float t=d<hh?1.-d/hh:0.;vec3 o=c.rgb;
 if(t>0.){float disp=R(u_p2)*(Q55H2(int(ty),sd)*2.-1.)*(.5+.5*t);float sx=mod(tx+floor(disp+.5),W);vec3 sm=T(vec2((sx+.5)/W,uv.y)).rgb;
  vec3 rg=mix(sm,vec3(dot(sm,vec3(.299,.587,.114))),.7*t);o=mix(rg,vec3(Q55H3(int(tx),int(ty),sd)),clamp(u_p3*t,0.,1.));}
 return vec4(o,1.);`,
  'purzOS OFX trackingbar.cpp with the purzfx.hpp hashes (frame 0, so the band sits at Position): triangular band weight t, per-line tear tear*sh2(row,seed)*(.5+.5t), desaturate by .7t, blend toward hash3 static by noise*t', true);
f('q55_purz_colorunder','Color Under (purzOS)',[P('Amount',0,1,.5,.01),P('Saturation',0,1,.6,.01),P('Scale',1,40,8,.5,'px'),P('Shadow bias',0,2,1,.01)],
  `${Q55_HDEF}${Q55_YIQ}${Q55_ROW}vec2 f2=vec2(tx,ty)/max(1e-3,R(u_p2));vec2 nz=vec2(0.);vec2 fi=floor(f2),ff=f2-fi,u=ff*ff*(3.-2.*ff);int xi=int(fi.x),yi=int(fi.y);
 for(int k=0;k<2;k++){int s2=sd+55*k;float a=Q55H3(xi,yi,s2),b=Q55H3(xi+1,yi,s2),c2=Q55H3(xi,yi+1,s2),d=Q55H3(xi+1,yi+1,s2);nz[k]=mix(mix(a,b,u.x),mix(c2,d,u.x),u.y)-.5;}
 float Y=dot(c.rgb,m3),I=dot(c.rgb,i3),Q=dot(c.rgb,q3);float w=pow(clamp(1.-Y,0.,1.),u_p3);float k=u_p0*u_p1*w;I+=nz.x*k;Q+=nz.y*k;
 return vec4(${Q55_RGB('Y','I','Q')},1.);`,
  'purzOS OFX colorunder.cpp with the purzfx.hpp value noise: I/Q += (vnoise(x/scale, y/scale, seed / seed+55) - .5)*amount*sat*(1-luma)^shadowBias, luma kept (frame 0)', true);
f('q55_purz_dropout','Dropout / Bad Signal (purzOS)',[S('Plugin',['Dropout','Bad Signal']),P('Density',0,1,.05,.01),P('Dash brightness',0,1,.9,.01),P('Static and snow',0,1,.2,.01)],
  `${Q55_HDEF}${Q55_ROW}vec3 o=c.rgb;if(u_p0<.5){float u=tx/max(1e-3,R(24.));float ce=floor(u);if(Q55H3(int(ce),int(ty),sd)<u_p1)o=vec3(u-ce<.12?0.:u_p2);}
 else{if(Q55H2(int(ty),sd)<u_p3*.5)o=vec3(Q55H3(int(tx),int(ty),sd));else{float cx=floor(tx/max(1.,R(8.)));if(Q55H3(int(cx),int(ty),sd)<u_p1)o=mix(o,vec3(Q55H2(int(cx),int(ty)+7)<.5?0.:1.),.9);
  o=clamp(o+(Q55H3(int(tx),int(ty),sd+1)-.5)*u_p3,0.,1.);}}
 return vec4(o,1.);`,
  'purzOS OFX dropout.cpp (24-px dash cells, hash3 < density -> black head 12% then bright grey) and badsignal.cpp (rows with hash2 < burst become snow, 8-px dash cells black/white at 90%, additive static (hash3-.5)*noise); Static and snow sets noise and burst = half of it; state/frame folded into the seed', true);

f('q55_xsoft','4xSoft / 2xSaL Scalers (guest.r slang)',[S('Scaler',['4xSoft','2xSaL']),P('Source pixel size',1,16,2,.5,'px'),P('Contrast (4xSoft)',.5,10,3,.1)],
  [RTS2_DOWN('R(u_p1)'), `${RTS2_SRC('R(u_p1)')}vec3 dt=vec3(1.);if(u_p0>.5){float q=.25;vec3 c00=SRC(sp+vec2(-q,-q)),c20=SRC(sp+vec2(q,-q)),c02=SRC(sp+vec2(-q,q)),c22=SRC(sp+vec2(q,q));
  float m1=dot(abs(c00-c22),dt)+.001,m2=dot(abs(c02-c20),dt)+.001;return vec4((m1*(c02+c20)+m2*(c22+c00))/(2.*(m1+m2)),1.);}
 vec3 c11=SRC(sp),c00=SRC(sp+vec2(-1.,-1.)),c20=SRC(sp+vec2(1.,-1.)),c22=SRC(sp+vec2(1.,1.)),c02=SRC(sp+vec2(-1.,1.)),s00=SRC(sp+vec2(-.5,-.5)),s20=SRC(sp+vec2(.5,-.5)),s22=SRC(sp+vec2(.5,.5)),s02=SRC(sp+vec2(-.5,.5));
 vec3 c01=SRC(sp+vec2(-1.,0.)),c21=SRC(sp+vec2(1.,0.)),c10=SRC(sp+vec2(0.,-1.)),c12=SRC(sp+vec2(0.,1.));
 float d1=dot(abs(c00-c22),dt)+.0001,d2=dot(abs(c20-c02),dt)+.0001,hl=dot(abs(c01-c21),dt)+.0001,vl=dot(abs(c10-c12),dt)+.0001,m1=dot(abs(s00-s22),dt)+.001,m2=dot(abs(s02-s20),dt)+.001;
 vec3 t1=(hl*(c10+c12)+vl*(c01+c21)+(hl+vl)*c11)/(u_p2*(hl+vl)),t2=(d1*(c20+c02)+d2*(c00+c22)+(d1+d2)*c11)/(u_p2*(d1+d2));
 return vec4(.25*(t1+t2+(m2*(s00+s22)+m1*(s02+s20))/(m1+m2)),1.);`],
  'slang edge-smoothing/xsoft 4xsoft.slang and xsal 2xsal.slang (guest.r 2007): 4xSoft = edge-weighted blend of axial (weights by hl/vl) and diagonal (d1/d2) 3x3 neighbourhoods / CONTRAST plus a half-texel diagonal term, x0.25; 2xSaL = quarter-texel diagonal pairs weighted by the opposite diagonal difference; source = box-downsampled pixel grid, bilinear source fetches');
f('q55_leifx','LeiFX 3dfx Voodoo Filter (slang 3dfx_4x1)',[P('Source pixel size',1,8,1,.5,'px'),P('Scanline lines',0,1,.05,.01),P('Gamma',.5,2,1.3,.01)],
  [RTS2_DOWN('R(u_p0)'),
   `vec2 w=floor(uv*u_res);float Bw=max(R(u_p0),1.);vec2 SS=ceil(u_res/Bw);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);
 int ix=int(mod(w.x,4.)),iy=int(mod(w.y,4.));float tb[16]=float[16](16.,4.,13.,1.,8.,12.,5.,9.,14.,2.,15.,3.,6.,10.,7.,11.);float Dd=(18.-tb[ix*4+iy])*.5-1.;
 vec3 col=(c.rgb*255.+vec3(Dd,Dd*.5,Dd))/255.;col=floor(col*vec3(32.,64.,32.))/vec3(32.,64.,32.);if(mod(w.y,2.)>=1.)col.rb+=u_p1/10.;return vec4(col,1.);`,
   `vec2 e=vec2(u_px.x,0.);vec3 oc=c.rgb,cp=vec3(.04,.02,.04);return vec4(oc+clamp(T(uv-e).rgb-oc,-cp,cp)/4.+clamp(T(uv+e).rgb-oc,-cp,cp)/16.,1.);`,
   `vec2 e=vec2(u_px.x,0.);vec3 oc=c.rgb,cp=vec3(.04,.02,.04);return vec4(oc+clamp(T(uv-e).rgb-oc,-cp,cp)/4.+clamp(T(uv+e).rgb-oc,-cp,cp)/16.,1.);`,
   `vec2 e=vec2(u_px.x,0.);vec3 oc=c.rgb,cp=vec3(.04,.02,.04);return vec4(oc+clamp(T(uv-e).rgb-oc,-cp,cp)/4.+clamp(T(uv+e).rgb-oc,-cp,cp)/16.,1.);`,
   `vec2 e=vec2(u_px.x,0.);vec3 oc=c.rgb,cp=vec3(.04,.02,.04);return vec4(oc+clamp(T(uv-e).rgb-oc,-cp,cp)/4.+clamp(T(uv+e).rgb-oc,-cp,cp)/16.,1.);`,
   `${RTS2_SRC('R(u_p0)')}return vec4(pow(max(TXL(sp),0.),vec3(1./u_p2)),1.);`],
  'slang gpu/3dfx_4x1 (LeiFX): pass 0 = 4x4 error table dither ((18-T)/2 - 1 in 8-bit, half on green) + RGB565 truncation + LEIFX_LINES/10 on alternate rows (R,B); passes 1-4 = horizontal reduction filter (left diff/4 + right diff/16, clamped .04 R/B, .02 G); pass 5 = gamma 1/1.3; on the box-downsampled source grid');
f('q55_powervr2','PowerVR2 Frame-Buffer Dither (slang powervr2)',[P('Source pixel size',1,8,1,.5,'px'),S('Interlace smoothing',['On','Off']),S('VGA signal loss',['Off','On'])],
  [RTS2_DOWN('R(u_p0)'),
   `vec2 w=floor(uv*u_res);float Bw=max(R(u_p0),1.);vec2 SS=ceil(u_res/Bw);if(w.x>=SS.x||w.y>=SS.y)return vec4(0.,0.,0.,1.);vec2 sc=SS/u_res;vec2 lo=.5/u_res,hi=(SS-.5)/u_res;
 vec3 col=c.rgb;bool il=u_p1<.5;vec3 ble=vec3(0.);if(il){float yy=(2./3.)/480.;for(int i=0;i<3;i++){yy+=(2./3.)/480.;ble+=T(clamp(uv-vec2(0.,yy*sc.y),lo,hi)).rgb/3.;}col=ble;}
 int ix=int(mod(w.x,4.)),iy=int(mod(w.y,4.));float tb[16]=float[16](16.,4.,13.,1.,8.,12.,5.,9.,14.,2.,15.,3.,6.,10.,7.,11.);col-=(tb[ix*4+iy]-1.)*.1/128.;
 vec3 rd=vec3(32.,64.,32.);col=floor(col*rd)/rd;if(!il){vec3 kk=col*rd;if(mod(kk.r+.5,2.)>1.)col.r-=.023;if(mod(kk.g+.5,2.)>1.)col.g-=.01;if(mod(kk.b+.5,2.)>1.)col.b-=.023;}
 col=floor(col*rd+.5)/rd;if(u_p2>.5){vec3 b2=ble;float xx=2./640.;for(int bl=0;bl<32;bl++){xx-=.375/640.;float ew=bl<3?1.:.35;b2+=T(clamp(uv+vec2(xx*sc.x,0.),lo,hi)).rgb*ew/float(32/(bl+1));}col+=b2*.015;col.g+=9./255.;}
 return vec4(col,1.);`,
   `${RTS2_SRC('R(u_p0)')}return vec4(TXL(sp),1.);`],
  'slang gpu/powervr2.slang: optional 3-tap vertical interlace blend (steps of (2/3)/480), 4x4 table dither (T-1)*.1/128, RGB565 truncation, odd-code nudge when not interlaced, re-round, optional VGA signal loss (32-tap leftward bleed *.015 plus green +9/255; the accumulator keeps the interlace sum as in the source); on the box-downsampled source grid');
f('q55_palr57','PAL Composite (r57shell slang pal-r57shell)',[P('Source width',64,1024,256,1,'px'),P('Saturation',0,2,1,.01),P('Hue shift',-6,6,-2.5,.05),P('Hue rotation',-5,5,2,.05)],
  `float SX=floor(u_p0),SY=max(1.,floor(SX*u_res.y/u_res.x+.5));vec2 p=vec2(uv.x,1.-uv.y);float ux=p.x*(1.+1.5/SX);float uy=(floor(p.y*SY)+.5)/SY;
 float al=2.*floor(10.*SX*ux)+4.*floor(SY*uy);float ss=2.;if(mod(uy*SY,2.)>1.){al=12012.-al;ss=-2.;}float hs=(u_p2+2.5)*2.;float k12=PI/12.;
 mat3 toY=mat3(.299,-.147108,.614777,.587,-.288804,-.514799,.114,.435912,-.099978);vec3 sm=vec3(0.);
 for(int i=0;i<24;i++){vec3 A=toY*O(vec2(ux,1.-uy)).rgb,B=toY*O(vec2(ux+1.4/SX,1.-(uy-1./SY))).rgb;
  float a1=al+hs-A.x*ss*u_p3,a2=hs+12012.-al+A.x*ss*u_p3;float sg=A.x+A.y*sign(sin(a1*k12))+A.z*sign(cos(a1*k12));float sg1=B.x+B.y*sign(sin(a2*k12))+B.z*sign(cos(a2*k12));
  if(i<12)sm.x+=sg;if(i<23){sm.y+=(sg+sg1)*sin(al*k12);sm.z+=(sg-sg1)*cos(al*k12);}al-=ss;ux-=1./(10.*SX);}
 float Y=sm.x/12.,U=sm.y*u_p1/23.,V=sm.z*u_p1/23.;vec3 rgb=vec3(Y+1.14025*V,Y-.39474*U-.58081*V,Y+2.03252*U);rgb=pow(clamp(rgb,0.,1.),vec3(2.5));
 vec3 X=vec3(dot(rgb,vec3(.430619,.3415419,.1783091)),dot(rgb,vec3(.2220379,.7066384,.0713236)),dot(rgb,vec3(.0201853,.1295504,.9390944)));
 vec3 lr=clamp(vec3(dot(X,vec3(3.2406,-1.5372,-.4986)),dot(X,vec3(-.9689,1.8758,.0415)),dot(X,vec3(.0557,-.204,1.057))),0.,1.);
 return vec4(mix(12.92*lr,1.055*pow(lr,vec3(1./2.4))-.055,step(.0031308,lr)),1.);`,
  'slang pal/pal-r57shell.slang (r57shell), RGB input path with the delay line: YUV (U .492, V .877) square-wave-gated onto a 24-step subcarrier (10 samples per source pixel, line phase 2*Phase_Y, PAL line flip 12012 - alpha), 24-tap demodulation (Y over 12 taps, U/V over 23 with the previous line comb), hue rotation by luma, decode, gamma 2.5 colorimetry (PAL primaries XYZ -> sRGB); source grid = Source width with the image aspect');
f = add('Stylize');
f('q55_mmjcel','MMJ Cel Shader (slang MMJ_Cel_Shader)',[P('Shading levels',1,16,9,1),P('Saturation modifier',0,2,1.15,.01),P('Outline brightness',0,1,.2,.01),P('Shader strength',0,1,.5,.01)],
  `vec2 e=u_px*max(u_k,1.);vec3 nb[8];int q=0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;nb[q]=T(uv+vec2(float(i),float(j))*e).rgb;q++;}
 vec3 c4=c.rgb;vec3 c9=((nb[0]+nb[2]+nb[5]+nb[7])*.15+(nb[1]+nb[3]+nb[4]+nb[6])*.25+c4)/2.6;vec3 h=vec3(.05);float k=.005,kz=.007;vec3 cz=(c9+h)/(dot(vec3(1.),c9)+k);float ii=0.;
 for(int n=0;n<8;n++){vec3 hz=cz-(nb[n]+h)/(dot(vec3(1.),nb[n])+k);ii+=kz/(dot(hz,hz)+kz);}ii=max(pow(ii/8.,.75),u_p2);c9=min(c9,1.);
 vec3 hl=rgb2hsl(c9*ii);float cr=1./u_p0;float bm=mod(hl.z,cr);if(hl.z>.97)hl.yz=vec2(1.);else if(hl.z>.03){hl.y*=u_p1;hl.z+=hl.z*cr-bm;}else hl.yz=vec2(0.);
 vec3 ca=1.2*hsl2rgb(hl);return vec4(clamp(c4*ii*(1.-u_p3)+ca*u_p3,0.,1.),1.);`,
  'slang cel/MMJ_Cel_Shader.slang: 3x3 weighted blur c9, outline factor = mean of kz/(|cz - n|^2 + kz) over the 8 neighbours of brightness-normalised colours, ^0.75, floored at Outline brightness; colorAdjust in HSL (white cutoff .97, black cutoff .03, lightness L + (L/levels - mod(L, 1/levels)), saturation x modifier, x1.2); mixed with the outlined original by Shader strength');
f('q55_advcartoon','Advanced Cartoon (guest.r slang advcartoon)',[P('Border thickness',0,4,1,.5),S('Mute colours',['Off','On']),P('Source pixel size',1,16,8,.5,'px')],
  `vec2 e=u_px*R(u_p2)/8.*u_p0;vec3 c11=c.rgb,c00=T(uv+vec2(-e.x,-e.y)).rgb,c10=T(uv+vec2(0.,-e.y)).rgb,c20=T(uv+vec2(-e.x,e.y)).rgb,c01=T(uv+vec2(-e.x,0.)).rgb,c21=T(uv+vec2(e.x,0.)).rgb,c02=T(uv+vec2(e.x,-e.y)).rgb,c12=T(uv+vec2(0.,e.y)).rgb,c22=T(uv+e).rgb;
 vec3 o3=vec3(1.);float d=.5*(dot(abs(c00-c22),o3)+dot(abs(c20-c02),o3)+dot(abs(c01-c21),o3)+dot(abs(c10-c12),o3))/(dot(c11,o3)+.15);float ed=1.1-pow(d,1.5);
 float Ln=length(c11);vec3 nn=Ln>1e-5?4.*c11/Ln:vec3(0.);vec3 fv=fract(nn);fv*=fv;fv*=fv;vec3 rgb;
 if(u_p1<.5){float L4=4.*Ln;float fr=fract(L4);fr*=fr;fr*=fr;float lc=.25*(floor(L4)+fr)+.05;rgb=.25*lc*ed*(floor(nn)+.05+fv);}
 else{float L5=5.*Ln;float fr=fract(L5);fr*=fr;fr*=fr;float Lb=.2*(floor(L5)+fr);vec3 tt=(floor(nn)+fv)*.25*Lb;float Lp=.577*Lb;rgb=ed*(tt*(1.-Lp)+Lp);}
 return vec4(clamp(rgb,0.,1.),1.);`,
  'slang cel/advcartoon.slang (guest.r): sample offsets = texel/8*border, edge d = .5*(diagonal+axial differences)/(sum c + .15) darkens by 1.1 - d^1.5; colour posterised as 4*normalize(c) with floor + fract^4 steps scaled by a quantised length (mute mode: 5 levels mixed toward grey by .577*L); texel = Source pixel size');
