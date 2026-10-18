/* ================= q03b: G'MIC community round 13 - warps (PowerTwirl, Layer Cake, Rays, Torus, Moon2panorama, Pixel Push, Popcorn, Stitch, Auto-Gnarl, Spiral Matrix, Jpr warp from threshold), streaks, block glitches ================= */
f = add('Distort');
f('q03_polarwarp','Polar Warps (PowerTwirl / Layer Cake / Rays / Torus / Moon2panorama)',[S('Mode',['PowerTwirl (Joan Rake)','Layer Cake (Joan Rake)','Rays from Image (Joan Rake)','Rotate by Torus Map (Reptorian)','Moon to panorama (Souphead / Bonet)']),P('Amount',-4,4,1,.01),P('Shape',0,5,1,.01),P('Size',5,100,75,1,'%')],
  `
#define Q03MIR(p_) (1.-abs(1.-mod((p_),2.)))
  int m=int(u_p0+.5);vec2 W=u_res/u_k;vec2 P=PX(uv);vec2 C=W*.5;vec2 d=P-C;float r=length(d);float a=atan(d.y,d.x);vec2 src=P;
  if(m==0){float ang=2.*PI*u_p1*pow(r/(length(W)*.5),max(u_p2,.01));src=C+rot(d,ang);}
  else if(m==1){float n=max(1.,floor(u_p2*4.+.5));vec2 Rr=W*u_p3/200.;float rho=length(d/Rr);if(rho<=1.){float k=n-1.-min(floor(rho*n),n-1.);src=C+rot(d,radians(u_p1*360./n*(k+1.)));}}
  else if(m==2){float Rm=length(W*.5);float pw=u_p2*5.;float nr=(Rm-a)*pow(4.,pw-5.)*pw/5.;src=C+nr*vec2(cos(a),sin(a));}
  else if(m==3){float rmax=min(W.x,W.y)*.5,rmin=rmax*u_p3/100.*.67;float v=(r-rmin)/max(rmax-rmin,1.);if(v>=0.&&v<=1.){int pm=int(clamp(floor(u_p2+2.),0.,7.));float e=abs(v-.5)*2.;
    float pr=pm==0?(cos(v*2.*PI-PI)+1.)*.5:pm==1?abs(cos(v*PI+PI*.5)):pm==2?sqrt(max(1.-e*e,0.)):pm==3?pow(max(1.-e*e,0.),1./(2.+(1.-v))):pm==4?cos(v*PI):pm==5?-cos(v*PI):pm==6?1.-e:min(2.*(1.-e),1.);
    src=C+rot(d,radians(u_p1*-180.)*pr);}}
  else{float AR=W.x/W.y;float Wn=AR>1.?2.:2./AR;float X=AR>1.?2.*uv.x-1.:(2.*uv.x-1.)/AR,Y=AR>1.?(2.*uv.y-1.)/AR:2.*uv.y-1.;float mn=min(Wn*.5,(AR>1.?2./AR:2.)*.5);float span=abs(u_p1)*360.;
    float s=(X/Wn*span-(u_p2-1.)*20.)*PI/180.,si=(Y/Wn*span)*PI/180.;float zx=exp(si)*sin(s)*.8*u_p3/75.*mn,zy=exp(si)*cos(s)*.8*u_p3/75.*mn;
    vec2 q=AR>1.?vec2((zx+1.)*.5,(1.+AR*zy)*.5):vec2((AR*zx+1.)*.5,(1.+zy)*.5);if(any(lessThan(q,vec2(0.)))||any(greaterThan(q,vec2(1.))))return vec4(0.,0.,0.,1.);return vec4(O(q).rgb,1.);}
  return vec4(O(Q03MIR(src/W)).rgb,1.);`,
  "Joan Rake PowerTwirl (cartesian: angle = 2 pi (amplitude x (r / half-diagonal)^power)), Layer Cake (Paint.NET plugin: elliptical annuli of Size % of the frame, ring k of n = Shape x 4 rotated by angle x (k+1)/n, Amount x 360 deg), Rays from Image (transform_polar new_r = (R - a) x 4^(p-5) x p/5, p = Shape x 5), Reptorian rotate-by-torus (donut distortion: rotation profile soft / medium / hard / alt-hard / distroy / inverse / quad / hex chosen by Shape, Amount x -180 deg), Moon2panorama (Edgar Bonet MathMap: complex-exponential cylindrical-to-panorama map, span = |Amount| x 360, Shape shifts, Size zooms); mirror boundary, centred");
const Q03_SPI = `int Wi=int(u_res.x),Hi=int(u_res.y);`;
f('q03_fieldwarp','Field Warps (Pixel Push / Popcorn / Stitch / Auto-Gnarl / Spiral Matrix / Jpr Warp from Threshold)',[S('Mode',['Pixel Push (Reptorian)','Popcorn fractal warp (Reptorian)','Stitch Distort (Reptorian)','Auto-Gnarl (Joan Rake)','Spiral Matrix transform (Joan Rake)','Spiral Matrix inverse (Joan Rake)','Jpr Warp from Threshold (grid pattern)']),P('Amount',-1,1,.5,.01),P('Scale',0,1,.5,.01),P('Count / detail',1,10,2,1)],
  [`if(int(u_p0+.5)!=6)return vec4(.5,.5,0.,1.);float thr=.45+u_p1*.4;float b0=step(thr,blurL(uv,max(u_k,1.)));float bx=step(thr,blurL(uv+vec2(u_px.x,0.),max(u_k,1.))),by=step(thr,blurL(uv+vec2(0.,u_px.y),max(u_k,1.)));
    float e=(b0!=bx||b0!=by)?1.:0.;vec2 g=sobel(uv);vec2 n=length(g)>1e-5?normalize(g):vec2(0.);return vec4(.5+.5*n*e,e,1.);`,
   BH('2.*sqrt(max(u_p3*5.,1.))'),BV('2.*sqrt(max(u_p3*5.,1.))'),
   `
#define Q03MIR(p_) (1.-abs(1.-mod((p_),2.)))
   int m=int(u_p0+.5);vec2 W=u_res/u_k;vec2 P=PX(uv);vec2 src=P;
   if(m==0){float cx=(u_p1+1.)*.5,cy=u_p2;vec2 sp=uv;float nx=1.-((cx*(1.-sp.x))*sp.x+(1.-sp.x)*(cx*sp.x+(1.-sp.x)));float ny=1.-((cy*(1.-sp.y))*sp.y+(1.-sp.y)*(cy*sp.y+(1.-sp.y)));return vec4(O(vec2(nx,ny)).rgb,1.);}
   if(m==1){float z=2.+u_p2*10.;vec2 p=(uv-.5)*vec2(asp(),1.)*z;float h=u_p1*.1;float K=3.;for(int i=0;i<10;i++){if(float(i)>=u_p3)break;vec2 o=p;p.x=o.x-h*sin(o.y+clamp(tan(K*o.y),-12.,12.));p.y=o.y-h*sin(o.x+clamp(tan(K*o.x),-12.,12.));}
     return vec4(O(Q03MIR(p/(vec2(asp(),1.)*z)+.5)).rgb,1.);}
   if(m==2){float D=length(W)*.5;float off=u_p1*.1*D;float th=max(1.,(.2+u_p2*1.6)*.01*D);int n=int(u_p3+.5);for(int k=0;k<10;k++){if(k>=n)break;float an=radians(45.+float(k)*180./float(n));vec2 nr=vec2(cos(an),sin(an)),tg=vec2(-nr.y,nr.x);
     float sid=floor(dot(src,nr)/th);src+=tg*(hash(vec2(sid,float(k)*7.3+1.))*2.-1.)*off;}return vec4(O(Q03MIR(src/W)).rgb,1.);}
   if(m==3){float ee=3.*u_k;vec2 g=vec2(luma(O(uv+vec2(ee,0.)*u_px).rgb)-luma(O(uv-vec2(ee,0.)*u_px).rgb),luma(O(uv+vec2(0.,ee)*u_px).rgb)-luma(O(uv-vec2(0.,ee)*u_px).rgb));float gn=pow(clamp(length(g)*1.5,0.,1.),.45);float e=clamp((gn-.4)/.2+.5*(u_p3-2.)/8.,0.,1.);float sm=1.+u_p2*6.;
     vec2 v=vec2(vnoise(P/sm),vnoise(P/sm+vec2(37.1,11.7)))*2.-1.;v=clamp(v*2.2,-1.,1.);v=floor(v/.0625+.5)*.0625;float am=u_p1*4.;src=P+v*e*am*am*abs(am);return vec4(O(Q03MIR(src/W)).rgb,1.);}
   if(m==4||m==5){${Q03_SPI}int x=int(uv.x*u_res.x),y=int((1.-uv.y)*u_res.y);int sx,sy;
     if(m==4){int k=min(min(x,y),min(Wi-1-x,Hi-1-y));int w2=Wi-2*k,h2=Hi-2*k;int t;if(y==k)t=x-k;else if(x==Wi-1-k)t=(w2-1)+(y-k);else if(y==Hi-1-k)t=(w2-1)+(h2-1)+(Wi-1-k-x);else t=2*(w2-1)+(h2-1)+(Hi-1-k-y);
       int s=2*k*(Wi+Hi)-4*k*k+t;sx=s-(s/Wi)*Wi;sy=s/Wi;}
     else{int nn=y*Wi+x;float S=float(Wi+Hi);int k=int(floor((S-sqrt(max(S*S-4.*float(nn),0.)))*.25));k=clamp(k,0,min(Wi,Hi)/2);
       if(2*(k+1)*(Wi+Hi)-4*(k+1)*(k+1)<=nn&&k+1<=min(Wi,Hi)/2)k++;if(2*k*(Wi+Hi)-4*k*k>nn&&k>0)k--;int t=nn-(2*k*(Wi+Hi)-4*k*k);int w2=Wi-2*k,h2=Hi-2*k;
       if(t<w2){sx=k+t;sy=k;}else if(t<w2+h2-1){sx=Wi-1-k;sy=k+t-(w2-1);}else if(t<2*w2+h2-2){sx=Wi-1-k-(t-(w2-1)-(h2-1));sy=Hi-1-k;}else{sx=k;sy=Hi-1-k-(t-2*(w2-1)-(h2-1));}}
     return vec4(O((vec2(float(sx),float(Hi-1-sy))+.5)/u_res).rgb,1.);}
   float mnx=1.,mxx=0.,mny=1.,mxy=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 s=T((vec2(float(i),float(j))+.5)/12.).rg;mnx=min(mnx,s.x);mxx=max(mxx,s.x);mny=min(mny,s.y);mxy=max(mxy,s.y);}
   vec2 fv=(T(uv).rg-vec2(mnx,mny))/max(vec2(mxx-mnx,mxy-mny),vec2(1e-4))*100.;float lx=max(0.,1.-abs(fv.x-8.*floor(fv.x/8.+.5))),ly=max(0.,1.-abs(fv.y-8.*floor(fv.y/8.+.5)));
   return vec4(lx,lx,max(lx,ly),1.);`],
  "Reptorian Pixel Push (TR's Paint.NET plugin, Bezier push toward point (Amount, Scale)), Popcorn fractal warp (Pickover popcorn map x' = x - h sin(y + tan 3y), y' likewise, h = Amount/10, Count iterations, Scale = zoom - an image-warp use of the popcorn iteration, approx.), Stitch Distort (strips of thickness Scale across Count symmetric angles from 45 deg, each strip shifted along itself by a random offset up to Amount x 10 % of the half diagonal); Joan Rake Auto-Gnarl (smooth random vector field rounded to 1/16, scaled by the 40-60 % band of the smoothed gradient norm^0.45, amplitude^3 px), Spiral Matrix transform / inverse (pixels re-ordered along the rectangular clockwise spiral from the outside, exact index arithmetic); jpr_warpfromthreshold (unit gradient normals on the boundary of the thresholded image, diffused by Gaussian blur (Count x 5 loops), normalised to 0..100 and used as coordinates into the 100x100 grid of 1-px lines every 8 px - the blur/renormalise loop approximated by one blur)", true);
f = add('Stylize');
const Q03_SS = i => `int m=int(u_p0+.5);
  ${i === 0 ? `if(m<3){vec2 dir=vec2(cos(radians(u_p2)),sin(radians(u_p2)));float ex=1.+u_p3*5.;vec3 C=vec3(0.);float Tr=1.;float st=max(1.,length(u_res)/240.);vec2 dd=(uv-.5)*u_res;float rr=max(length(dd),1.);
    for(int i=0;i<240;i++){vec2 q;if(m==0)q=uv-dir*float(i)*st*u_px;else{float f_=1.+(m==1?1.:-1.)*float(i)*st/rr;if(f_<0.)break;q=.5+dd*f_/u_res;}
     if(any(lessThan(q,vec2(0.)))||any(greaterThan(q,vec2(1.))))break;vec3 s=O(q).rgb;float a=pow(smoothstep(u_p1-.04,u_p1+.04,luma(s)),ex);C+=Tr*a*s;Tr*=1.-a;if(Tr<.004)break;}
    return vec4(C,1.);}` : `if(m<3)return T(uv);`}
  #define SRC(q_) ${i === 0 ? 'O' : 'T'}(fract(q_))
  vec4 rc=vec4(hash(vec2(${i}.,1.3)),hash(vec2(${i}.,2.7)),hash(vec2(${i}.,3.1)),hash(vec2(${i}.,4.9)));float tol=u_p1;
  #define SEL(q_) (length(SRC(q_).rgb-rc.rgb)<tol)
  vec4 me=SRC(uv);if(!SEL(uv))return vec4(me.rgb,1.);float an=hash(vec2(${i}.,5.5))*6.28318;float stp=max(1.,mix(u_p3*.2,u_p3*.6,hash(vec2(${i}.,6.6)))*min(u_res.x,u_res.y));vec2 dv=vec2(cos(an),sin(an))*stp*u_px;
  vec2 qf=uv;float lf=0.;for(int k=0;k<48;k++){if(!SEL(qf))break;qf-=dv;lf+=1.;}vec2 qb=uv;float lb=0.;for(int k=0;k<48;k++){if(!SEL(qb))break;qb+=dv;lb+=1.;}
  vec3 cf=SRC(qf).rgb,cb=SRC(qb).rgb;vec3 o=m==3?(lb*lb*cf+lf*lf*cb)/max(lb*lb+lf*lf,1.):(lf<lb?cf:cb);return vec4(o,1.);`;
f('q03_streak','Streaks (Axis / Perspective / Superstreak)',[S('Mode',['Axis Streak (Reptorian)','Perspective Streak toward centre (Reptorian)','Perspective Streak away from centre (Reptorian)','Superstreak smooth (Joan Rake)','Superstreak sharp (Joan Rake)']),P('Key / tolerance',0,1,.35,.01),P('Angle',0,360,0,1,'deg'),P('Exponent / step',0,1,.3,.01)],
  [0,1,2,3,4,5,6,7,8,9].map(Q03_SS),
  "Reptorian axis / perspective streak: transparent pixels take the running colour of the scan, opaque ones blend in by alpha (front-to-back march, up to 240 steps); our images are opaque, so alpha = luminance key (Key threshold), raised to 1 + 5 x Exponent; perspective = the same along rays through the centre; Joan Rake Superstreak: 10 iterations, each picks a random colour and selects pixels within the tolerance (RGB distance; the random alpha of the G'MIC colour is dropped since our images are opaque), selected pixels march along a random angle in random steps (Exponent / step = max step as a fraction of the short side) until they leave the selection and take the colour found there (smooth: distance-weighted mix of both ends, sharp: nearest end); seeded", true);
f = add('Retro');
f('q03_ecb','Pseudo-ECB Glitch (Reptorian / Joan Rake)',[P('Key length',2,32,6,1,'px'),P('Levels',2,32,6,1),P('Key angle',0,180,0,1,'deg'),P('Mix with image',0,1,.15,.01)],
  `vec2 P=PX(uv);float L=u_p0;float an=radians(u_p2);int g1=int(mod(P.x*cos(an)+P.y*sin(an),L)/L*255.),g2=int(mod(-P.x*sin(an)+P.y*cos(an),L)/L*255.);int key=((g1^g2)*16)/256;
  vec3 c0=O(uv).rgb;float lv=u_p1;vec3 pl=floor(c0*lv*.999);float lq=floor(luma(c0)*lv*.999);vec3 pc=vec3(hash(vec2(lq,1.7)),hash(vec2(lq,2.9)),hash(vec2(lq,4.3)));
  vec3 ci=vec3(hash(vec2(pl.r*31.+float(key),11.1)),hash(vec2(pl.g*31.+float(key),12.2)),hash(vec2(pl.b*31.+float(key),13.3)));vec3 o=floor(mix(ci,pc,.35)*lv)/max(lv-1.,1.);
  return vec4(mix(clamp(o,0.,1.),c0,u_p3),1.);`,
  "approx. of G'MIC pseudo_ecb (inspired by the Paint.NET PolyGlitch ECB): the colour-quantised image is 'encrypted' block-code style - each quantised plaintext value and a periodic key (XOR of two saw gradients of Key length at the key angle and +90 deg, 16 levels) map through a seeded random code book (stands in for the bomb-blend transfer meshes), pseudo-coloured by luminance level; identical plaintext gives an identical repeating pattern, so flat areas tile and shapes stay readable", true);
f('q03_qam','Faux-QAM Glitch (Joan Rake)',[P('Amplitude',0,10,2,.1),P('Period',2,100,20,1,'px'),P('Angle',-180,180,0,1,'deg'),P('Scanline amplitude',0,1,.08,.01)],
  `vec2 P=PX(uv);vec2 W=u_res/u_k;vec2 d=P-W*.5;float th=radians(90.+u_p2);float As=u_p3*255.;float ln=0.,wn=0.;
  for(int k=-4;k<=4;k++){float o_=float(k)*.75;float pj=dot(d,vec2(-sin(th),cos(th)))+o_;float sq=mod(floor(pj/5.),2.)>.5?As:0.;float w=exp(-o_*o_/8.);ln+=w*sq;wn+=w;}
  ln=ln/wn*2.-As;float pj2=dot(d,vec2(cos(th),sin(th)));vec3 i=O(uv).rgb*255.;float A=u_p0;
  vec3 o=mod(i+((1.+ln*5.*.6/255.)*(A*i/255.+1.))*(i*sin(pj2/u_p1+(ln*u_p1*.05/10./255.*360.)*PI/180.))+(127.5*A-A*i/2.)-i/255.,255.);
  return vec4(clamp(o/255.,0.,1.),1.);`,
  "Joan Rake fx_qam_glitch (faulty quadrature amplitude modulator), RGB channels: v = (i + (1 + 5 AM line/255)(A i/255 + 1) i sin(proj/period + PM-shifted phase) + 127.5 A - A i/2 - i/255) mod 255, line = blurred square scanlines (bandwidth 5 px, Scanline amplitude, blur 2) across the modulation direction; AM 0.6, PM 0.05, amplitude offset 1, wave offset 127.5 fixed; colour-space option omitted");
f('q03_shredder','Shredder (Joan Rake)',[P('Max gap',1,100,100,1,'%'),P('X strength',0,1,.5,.01),P('Y strength',0,1,.5,.01),S('Channels',['Correlated','Independent RGB'])],
  `int Wi=int(u_res.x),Hi=int(u_res.y);float x=floor(uv.x*u_res.x),y=floor((1.-uv.y)*u_res.y);float n=y*u_res.x+x;float wh=u_res.x*u_res.y;float gm=u_p0/100.;vec3 o;
  for(int c=0;c<3;c++){float sl=u_p3>.5?float(c)*101.:0.;vec2 off;for(int ax=0;ax<2;ax++){float sa=sl+float(ax)*53.;float pos=0.;int kk=-1;
     for(int k=0;k<200;k++){float len=floor(pow(hash(vec2(float(k),sa+1.))*gm,3.)*wh)+1.;if(n<pos+len){kk=k;break;}pos+=len;}
     if(kk<0){float av=pow(gm,3.)*.25*wh+1.;kk=200+int((n-pos)/av);}
     float dim=ax==0?u_res.x:u_res.y;float h=hash(vec2(float(kk),sa+7.));float val=kk==0?h*dim*dim:h*dim;float s=ax==0?u_p1:u_p2;off[ax]=pow(s,4.)*val;}
   vec2 q=vec2(mod(x+off.x,u_res.x),mod(y+off.y,u_res.y));vec3 s3=O(vec2((q.x+.5)/u_res.x,1.-(q.y+.5)/u_res.y)).rgb;o[c]=s3[c];if(u_p3<.5){o=s3;break;}}
  return vec4(o,1.);`,
  "Joan Rake fx_shredder: the image is re-filled in raster order from itself at a relative offset (strength^4 x random column / row, periodic) that jumps to new random values after runs of random length (gap^3 x image area + 1 pixels; independent runs for x and y); same sequential process with a counter-based RNG (runs replayed per pixel, 200 explicit runs then average-length continuation, approx. for tiny gaps); colour-space choice reduced to correlated / independent RGB", true);
