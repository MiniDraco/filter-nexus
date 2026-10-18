/* ================= q50: round-18 Augraphy document augmentations (ported from sparkfish/augraphy augmentations/*.py, seeded) ================= */
// Coordinates: PX(uv) = full-resolution pixels; Q50YD = row index counted from the top. Random draws of the Python code
// become hash() draws keyed by line/stripe/section index (seeded), so each seed gives one fixed realisation.
const Q50_SZ = `vec2 SZ=u_res/u_k;vec2 P_=PX(uv);vec2 Q=vec2(P_.x,SZ.y-P_.y);`;  // Q = (x, y-down) in full-res px
// DirtyDrum: stripes laid out exactly like create_dirty_mask (sequential walk), Gaussian blob noise inside, 3x3 blur, darken
const Q50_DD = (tag, A, B, LB) => `float m${tag}=0.;{float aC=floor(${A}),bC=floor(${B});float st0=-9.,sw0=0.,id0=0.,st1=-9.,sw1=0.,id1=0.;float x=0.;
 for(int i=0;i<1500;i++){if(x>aC+1.)break;float fi=float(i)+${tag}.*977.;float cw=max(1.,floor(1.+u_p0*hash(vec2(fi,1.))))*floor(1.+5.*hash(vec2(fi,2.)));
  if(hash(vec2(fi,3.))>1.-u_p1){st0=st1;sw0=sw1;id0=id1;st1=x;sw1=2.*cw;id1=fi;}x+=cw*floor(1.+3.*hash(vec2(fi,4.)));}
 float ws=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float aa=aC+float(i),bb=bC+float(j);float w=(i==0?2.:1.)*(j==0?2.:1.);float mv=1.;
  for(int k=0;k<2;k++){float st=k==0?st0:st1,sw=k==0?sw0:sw1,sid=k==0?id0:id1;if(aa<st||aa>=st+sw)continue;
   float ncl=max(1.,sw*${LB}*u_p3/150.);float cl=${LB}/ncl;float ns=sw*${LB}*u_p3/70.;float sg=clamp(sw*.5,1.,cl*.7);float dn=0.;float ci=floor(bb/cl);
   for(int c=-1;c<=1;c++){float cc=ci+float(c);float cy=(cc+hash(vec2(sid,cc+.5)))*cl;float dx=aa+.5-st-sw*.5,dy=bb+.5-cy;dn+=ns*exp(-(dx*dx+dy*dy)/(2.*sg*sg))/(6.2832*sg*sg);}
   if(hash(vec2(aa,bb)+sid*7.31)<1.-exp(-dn))mv=min(mv,floor(hash(vec2(sid,9.))*31.)/255.);}
  m${tag}+=w*mv;ws+=w;}m${tag}/=ws;}`;
// DirtyRollers create_scanline_mask: one row of tiled gradient bars (6 variants, levels drawn once per mask), value in percent
const Q50_SC = (nm, X, W, salt) => `float ${nm}=90.;{float hi=86.+floor(hash(vec2(${salt},1.))*14.),lo=70.+floor(hash(vec2(${salt},2.))*16.);float x=0.;
 for(int i=0;i<800;i++){float fi=float(i)+${salt}*131.;float v=floor(hash(vec2(fi,3.))*6.);float pl=1.+floor(hash(vec2(fi,4.))*6.);float L_=${W};
  float l2=v>=3.?lo-5.-floor(hash(vec2(fi,5.))*4.):lo;float pt=mod(v,3.);float bw=2.*L_+(pt>0.?pl:0.);
  if(${X}<x+bw){float t=${X}-x;float r;if(pt==1.){r=t<L_?t/L_:t<L_+pl?1.:1.-(t-L_-pl)/L_;}else if(pt==2.){r=t<pl?0.:t<pl+L_?(t-pl)/L_:1.-(t-pl-L_)/L_;}else r=t<L_?t/L_:1.-(t-L_)/L_;
   ${nm}=mix(hi,l2,clamp(r,0.,1.));break;}x+=bw;}}`;
// Augraphy ink_to_paper overlay with a gray foreground g (white transparent): out = base*g + g*(1-g)
const Q50_ITP = (b, g) => `(${b})*(${g})+(${g})*(1.-(${g}))`;

f = add('Augment');
f('q50_colorpaper','Coloured Paper (Augraphy ColorPaper)',[P('Hue',0,360,72,1,'deg'),P('Saturation',0,1,.1,.01),P('Jitter',0,20,5,1)],
  `vec3 v=O(uv).rgb;float V=max(v.r,max(v.g,v.b));vec2 ip=floor(PX(uv));float J=floor(u_p2+.5);
  float h=u_p0/360.+(floor(hash(ip)*2.*J)-J)/180.;float s=clamp(u_p1+(floor(hash(ip+7.1)*2.*J)-J)/255.,0.,1.);return vec4(hsv2rgb(vec3(fract(h),s,V)),1.);`,
  'Augraphy ColorPaper: HSV hue and saturation replaced by one paper hue/saturation (source draws hue 28-45 and saturation 10-40 in OpenCV units, i.e. 56-90 deg and 0.04-0.16) with per-pixel jitter of -J..J-1 OpenCV units; V (lightness) kept', 1);

f('q50_dirtydrum','Dirty Drum Streaks (Augraphy DirtyDrum)',[P('Line width',1,8,4,1,'px'),P('Concentration',0,1,.15,.01),S('Direction',['Random','Vertical','Horizontal','Both']),P('Noise intensity',0,1,.5,.01)],
  `${Q50_SZ}int dm=int(u_p2+.5);if(dm==0)dm=1+int(hash(vec2(5.,5.))*3.);float m=1.;
  if(dm!=2){${Q50_DD(1, 'Q.x', 'Q.y', 'SZ.y')}m=min(m,m1);}
  if(dm!=1){${Q50_DD(2, 'Q.y', 'Q.x', 'SZ.x')}m=min(m,m2);}
  return vec4(min(O(uv).rgb,vec3(m)),1.);`,
  'Augraphy DirtyDrum: stripes walked across the page as in create_dirty_mask (width = rand(1..W) x rand(1..5), drawn with probability = concentration, 2x width, step x rand(1..3)); inside each stripe Gaussian clusters of dark points (count ~ area x intensity/150, points ~ area x intensity/70, value 0-30), 3x3 Gaussian blur, darken (min) blend; Both = min of vertical and horizontal masks', 1);

f('q50_dirtyrollers','Dirty Rollers (Augraphy DirtyRollers)',[P('Line width',4,40,10,1,'px'),S('Direction',['Random','Vertical','Horizontal']),S('Scanline type',['White background','Dark background'])],
  `${Q50_SZ}int dm=int(u_p1+.5);if(dm==0)dm=1+int(hash(vec2(3.,8.))*2.);float X=floor(dm==1?Q.x:Q.y);float lw=floor(u_p0);
  float mw=lw*(10.+floor(hash(vec2(4.,4.))*16.));${Q50_SC('sv', 'X', 'lw', '1.')}${Q50_SC('mv', 'X', 'mw', '2.')}
  vec3 col=O(uv).rgb;if(u_p2<.5){float a=min(99.,sv+sv*(1.-mv/100.));col=max(col*a/100.,0.);}else{float a=sv*mv/100.;col=min(col+col*(1.-a/100.),1.);}
  return vec4(col,1.);`,
  'Augraphy DirtyRollers: tiled gradient bars (high 86-99 %, low 70-85 %, six variants with 1-6 px dark/light plateaus or a 5-8 % lower floor) for the line mask and a 10-25x wider meta mask; white background (scanline_type 0): a = min(99, s + s(1 - m/100)), out = c a/100; dark background: out = c + c(1 - s m/10^4)', 1);

f('q50_dirtyscreen','Dirty Screen (Augraphy DirtyScreen)',[P('Density',0,3,1,.01),P('Points per cluster',2,20,11,1),P('Spread',1,5,3,.1,'px'),P('Value min',0,250,150,1)],
  `${Q50_SZ}float M=max(SZ.x,SZ.y);float cs=M/sqrt(750.*max(u_p0,.01));vec2 ip=floor(Q);vec2 g=floor((ip+.5)/cs);float v=1.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=g+vec2(float(i),float(j));vec2 ce=(cc+hash2(cc))*cs;
   float sg=u_p2*(.4+1.2*hash(cc+5.5));float n=max(2.,floor(u_p1*(.3+1.4*hash(cc+6.6))));vec2 d=ip+.5-ce;float pd=n*exp(-dot(d,d)/(2.*sg*sg))/(6.2832*sg*sg);
   if(hash(ip+cc*.013)<1.-exp(-pd))v*=min(u_p3+floor(hash(ip+cc*.07+3.)*100.),255.)/255.;}
  vec3 b=O(uv).rgb;return vec4(v<1.?${Q50_ITP('b', 'v')}:b,1.);`,
  'Augraphy DirtyScreen: ~750 Gaussian point clusters (10 passes x 50-100 clusters, 2-20 points, std 1-5 px) scattered over the page, each point a random gray in [Value min, +100] (source 150-250), overlapping passes multiplied, composited with OverlayBuilder ink_to_paper (gray foreground, white transparent: out = base g + g(1-g)); clusters on a jittered grid (Density scales the count) - approx. of make_blobs placement', 1);

f('q50_inkmottling','Ink Mottling (Augraphy InkMottling)',[P('Alpha',0,1,.25,.01),P('Noise scale',1,8,2,1),P('Blur kernel',1,9,3,2)],
  `vec3 th=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)th+=O((vec2(float(i),float(j))+.5)/12.).rgb;th/=144.;
  for(int it=0;it<3;it++){vec3 lo=vec3(0.),hi=vec3(0.),nl=vec3(0.),nh=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 v=O((vec2(float(i),float(j))+.5)/12.).rgb;vec3 m=step(th,v);hi+=v*m;nh+=m;lo+=v*(1.-m);nl+=1.-m;}
   th=.5*(lo/max(nl,1.)+hi/max(nh,1.));}
  vec3 col=O(uv).rgb;if(any(greaterThanEqual(col,th)))return vec4(col,1.);
  float kk=floor(u_p2);if(mod(kk,2.)==0.)kk+=1.;float sg=.3*((kk-1.)*.5-1.)+.8;int rr=int((kk-1.)*.5);vec2 gp=PX(uv)/u_p0-.5;vec2 g0=floor(gp),fq=fract(gp);float nv[4];
  for(int c=0;c<4;c++){vec2 nd=g0+vec2(float(c-(c/2)*2),float(c/2));float a=0.,w=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(abs(i)>rr||abs(j)>rr)continue;float ww=exp(-float(i*i+j*j)/(2.*sg*sg));a+=ww*hash(nd+vec2(float(i),float(j)));w+=ww;}nv[c]=a/w;}
  float n=mix(mix(nv[0],nv[1],fq.x),mix(nv[2],nv[3],fq.x),fq.y);return vec4(col*(1.-u_p0)+n*u_p0,1.);`,
  'Augraphy InkMottling: ink = pixels below the per-channel threshold in all three channels (source: Otsu per channel; here 3 ISODATA iterations on a 12x12 sample grid, approx.), uniform 0-255 noise on a 1/scale grid, Gaussian-blurred (odd kernel, OpenCV sigma rule), bilinearly upscaled, blended into ink only: c(1-a) + noise a', 1);

f('q50_lowink','Low-Ink Lines (Augraphy LowInkRandomLines / LowInkPeriodicLines)',[S('Mode',['Random lines','Periodic lines','Random lines (variable)','Periodic lines (variable)']),P('Count',1,30,5,1),P('Period',2,60,20,1),P('Noise probability',0,1,.1,.01)],
  `vec2 wp=floor(uv*u_res);float Hh=u_res.y;float y=Hh-1.-wp.y;int md=int(u_p0+.5);bool vr=md>=2;bool per=md==1||md==3;vec3 col=O(uv).rgb;float N=floor(u_p1);
  #define Q50LN(Y_,A_,id_) {float dy_=y-(Y_);if(dy_==0.)col=max(col,vec3(vr?hash(vec2(wp.x,(id_)+.5)):(A_)));else if(abs(dy_)==1.){float h_=hash(vec2(wp.x,(id_)+dy_*.25));if(h_<u_p3)col=max(col,vec3(vr?hash(vec2(wp.x,(id_)+.75)):(A_)));}}
  if(!per){for(int i=0;i<30;i++){if(float(i)>=N)break;float fi=float(i);float Y=floor(1.+hash(vec2(fi,11.))*(Hh-1.));float A=floor(16.+hash(vec2(fi,12.))*209.)/255.;Q50LN(Y,A,fi)}}
  else{float sp=max(1.,floor(Hh/floor(u_p2)));float NR=min(N,6.);for(int r=0;r<6;r++){if(float(r)>=NR)break;for(int s=0;s<7;s++){if(float(s)>NR)break;float id=float(r*7+s)+100.;
    float off=s==0?floor(hash(vec2(id,1.))*6.):floor(hash(vec2(id,1.))*(sp+1.));float A=s==0?floor(96.+hash(vec2(id,2.))*160.)/255.:floor(16.+hash(vec2(id,2.))*81.)/255.;
    float Y=off+floor((y-off)/sp+.5)*sp;Q50LN(Y,A,id)}}}
  return vec4(col,1.);`,
  'Augraphy LowInkLine.add_transparency_line: a 1-px row raised to max(pixel, alpha) (consistent: one alpha 16-224 per line; variable: random 0-255 per pixel), rows above/below hit with the noise probability; Random = Count rows uniform over the page (source 5-10); Periodic = Count runs (source 2-5, max 6), spacing = height/Period, each run one strong set (offset 0-5, alpha 96-255) + Count faint sets (random offset, alpha 16-96); rows in working pixels', 1);

f('q50_noisylines','Noisy Lines (Augraphy NoisyLines)',[S('Direction',['Random','Horizontal','Vertical','Both']),P('Lines',1,40,12,1),P('Thickness',1,6,2,1,'px'),P('Gap interval',0,200,50,1,'px')],
  `vec2 wp=floor(uv*u_res);int dm=int(u_p0+.5);if(dm==0)dm=1+int(hash(vec2(7.,7.))*3.);float sg=max(4.*u_k,.5);float acc=0.,ws=0.;
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=wp+vec2(float(i),float(j));float m=1.;
   for(int dd=0;dd<2;dd++){if((dd==0&&dm==2)||(dd==1&&dm==1))continue;float a=dd==0?u_res.y-1.-q.y:q.x,b=dd==0?q.x:q.y,La=dd==0?u_res.y:u_res.x;
    for(int k=0;k<40;k++){if(float(k)>=u_p1)break;vec2 kk=vec2(float(k),float(dd)*50.+3.);float Y=floor(hash(kk)*(La-1.));float t=1.+floor(hash(kk+1.)*u_p2);
     if(abs(a-Y)>max(t*u_k,1.)*.5)continue;float I=floor(hash(kk+2.)*(u_p3+1.))*u_k;float sx=floor(hash(kk+3.)*(I+1.));
     if(t>1.&&I>0.&&b>=sx&&mod(b-sx,2.*I)>=I)continue;m=0.;}}
   if(hash(q+.37)<.01+.09*hash(vec2(9.,9.)))m=1.;float w=exp(-float(i*i+j*j)/(2.*sg*sg));acc+=w*m;ws+=w;}
  float g=acc/ws;vec3 b=O(uv).rgb;return vec4(${Q50_ITP('b', 'g')},1.);`,
  'Augraphy NoisyLines: Lines full-length black lines at random rows (thickness 1..T px), dashed when thickness > 1 (gap I = rand 0..interval, erased segments [start + 2kI + I, start + 2kI + 2I)), 1-10 % white specks, 5x5 Gaussian blur (sigma 4: the source passes BORDER_DEFAULT as sigmaX), ink_to_paper overlay; Both = horizontal and vertical lines on one mask', 1);

f('q50_pageborder','Page Border Stack (Augraphy PageBorder)',[P('Border size',.5,10,3,.1,'%'),P('Pages',1,12,4,1),S('Corner',['Top left','Top right','Bottom left','Bottom right']),P('Max rotation',0,5,1.5,.1,'deg')],
  `${Q50_SZ}int cn=int(u_p2+.5);bool fx=cn==1||cn==3,fy=cn>=2;vec2 q=vec2(fx?SZ.x-Q.x:Q.x,fy?SZ.y-Q.y:Q.y);vec2 bd=SZ*u_p0/100.;float N=floor(u_p1);
  float a0=(hash(vec2(2.,2.))*2.-1.)*u_p3;float lw=max(1.,1./u_k);vec3 col=vec3(0.);
  for(int j=0;j<12;j++){if(float(j)>=N)break;float t=N>1.?float(j)/(N-1.):0.;vec2 org=bd*(1.-t);vec2 sz=SZ-bd;vec2 ce=org+sz*.5;
   float an=radians(a0*t);vec2 l=rot(q-ce,-an)+sz*.5;if(l.x<0.||l.y<0.||l.x>sz.x||l.y>sz.y)continue;
   if(min(min(l.x,l.y),min(sz.x-l.x,sz.y-l.y))<lw){col=vec3(0.);break;}
   vec2 s=l+bd;s=vec2(fx?SZ.x-s.x:s.x,fy?SZ.y-s.y:s.y);col=O(clamp(fromPX(vec2(s.x,SZ.y-s.y)),0.,1.)).rgb;break;}
  return vec4(col,1.);`,
  'Augraphy PageBorder (same_page_border): the page cropped by the border and a stack of copies offset linearly out to the border (np.linspace(border, 0, pages)), each rotated in order (0 for the top page, up to Max rotation for the bottom one), 1-px edge lines in border colour (black) on a black background; random curls and the final 3x3 blur left out (approx.)', 1);

f('q50_sectionshift','Section Shift (Augraphy SectionShift)',[P('Sections',1,10,4,1),P('Max shift',0,60,10,1,'px'),P('Max size',5,50,20,1,'%'),S('Fill',['None (keep)','Random colour','White','Black'])],
  `${Q50_SZ}vec2 q=floor(Q);float N=floor(u_p0);int fm=int(u_p3+.5);vec3 fillc=vec3(-1.);
  for(int k=9;k>=0;k--){if(float(k)>=N)continue;float fk=float(k);vec2 sh=floor((hash2(vec2(fk,1.))*2.-1.)*(u_p1+.999));
   vec2 lo=floor(SZ/20.),hi=max(lo,floor(SZ*u_p2/100.));vec2 wh=floor(lo+hash2(vec2(fk,2.))*(hi-lo+1.));
   vec2 s0=max(-sh,0.),s1=max(s0,SZ-wh-max(sh,0.)-1.);vec2 st=floor(s0+hash2(vec2(fk,3.))*(s1-s0+1.));
   if(all(greaterThanEqual(q,st+sh))&&all(lessThan(q,st+sh+wh))){q-=sh;continue;}
   if(fm>0&&all(greaterThanEqual(q,st))&&all(lessThan(q,st+wh))){fillc=fm==1?vec3(hash(vec2(fk,4.)),hash(vec2(fk,5.)),hash(vec2(fk,6.))):fm==2?vec3(1.):vec3(0.);break;}}
  if(fillc.x>=0.)return vec4(fillc,1.);return vec4(O(clamp(fromPX(vec2(q.x,SZ.y-q.y-1.)+.5),0.,1.)).rgb,1.);`,
  'Augraphy SectionShift: N rectangles (sides 5 %..Max size of the page, placed so the shifted copy fits) copied and pasted at an offset of up to +-Max shift px, in order (later sections read the already-shifted page; resolved backwards per pixel); the vacated area keeps its pixels (source default fill -1) or takes a fill colour', 1);

f('q50_reflectedlight','Reflected Light Glare (Augraphy ReflectedLight)',[P('Size',.1,.8,.45,.01),P('Core',0,.3,.1,.01),P('Brightness',.5,1,.85,.01),P('Blur kernel',5,311,151,2,'px')],
  `${Q50_SZ}float mn=min(SZ.x,SZ.y);vec2 ce=hash2(vec2(1.,1.))*SZ;float an=hash(vec2(2.,2.))*6.2832;float ra=.9+.1*hash(vec2(3.,3.));
  vec2 d=rot(Q-ce,-an);float r=length(vec2(d.x,d.y/ra));float Ri=u_p1*mn,Re=u_p0*mn,Rt=Ri+Re;float sg=max(.3*((u_p3-1.)*.5-1.)+.8,.5);
  float bi=.9+.1*hash(vec2(4.,4.));float stp=floor((Rt-r)/10.);float al=clamp(u_p2-1.+stp*10./Rt,0.,1.);float ac=clamp(u_p2-1.+(Rt-r)/Rt,0.,1.);al=mix(al,ac,smoothstep(2.,10.,sg));
  float sp=step(hash(floor(Q)),al);float I=mix(sp,al,min(1.,sg*.35));I=mix(I,bi,smoothstep(Ri+sg,Ri-sg,r));I*=smoothstep(Rt+sg,Rt-sg,r);
  return vec4(clamp(O(uv).rgb+vec3(I),0.,1.),1.);`,
  'Augraphy ReflectedLight: elliptical glare (random centre, angle, minor/major 0.9-1): core of radius Core x short side at internal brightness 0.9-1, rings of 10 px (smoothness 0.8) whose speckle-keep probability rises linearly from Brightness-1 at the rim to Brightness at the centre, Gaussian blur (OpenCV kernel->sigma rule; here the blurred expectation plus residual speckle, approx.), added to the image (cv2.addWeighted 1,1)', 1);

f('q50_lcdpattern','LCD Screen Pattern (Augraphy LCDScreenPattern)',[S('Pattern',['Vertical','Horizontal','Forward diagonal','Back diagonal','Cross']),P('Value',0,64,8,1),P('Skip distance',2,12,4,1,'px'),P('Opacity',0,1,1,.01)],
  `${Q50_SZ}vec2 q=floor(Q);int m=int(u_p0+.5);float k=floor(u_p2);bool on;
  if(m==0)on=mod(q.x,k)==0.;else if(m==1)on=mod(q.y,k)==0.;else if(m==2)on=mod(q.x+q.y,max(k,3.))==0.;else if(m==3)on=mod(q.x-q.y+1e4*max(k,3.),max(k,3.))==0.;else on=mod(q.x+q.y,2.)==0.;
  vec3 b=O(uv).rgb;vec3 o=on?min(b,vec3(floor(u_p1)/255.)):b;return vec4(mix(b,o,u_p3),1.);`,
  'Augraphy LCDScreenPattern: white canvas with every k-th column / row / (x+y) / (x-y) diagonal (k >= 3) or a 2-px checker cross set to Value (0-16 by default), darken overlay; OverlayBuilder applies its 0.3 alpha only for 4-channel inputs, so 3-channel images get the plain min (Opacity 1)');

f('q50_inkshifter','Ink Shifter (Augraphy InkShifter)',[P('Scale',5,60,22,1,'px'),P('Factor',0,10,2.5,.1,'px'),P('Amplitude',0,1,.6,.01)],
  `vec2 p=PX(uv);vec2 g=p/u_p0;vec2 n=vec2(0.);float w=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j))*.35;float ww=i==0&&j==0?2.:1.;n+=ww*vec2(vnoise(g+o),vnoise(g+o+71.3));w+=ww;}
  n=(n/w)*2.-1.;vec2 dsp=vec2(-u_p2*u_p1*n.x,u_p1*n.y);vec2 s=fromPX(p+dsp*vec2(1.,-1.));
  if(s.x<0.||s.y<0.||s.x>1.||s.y>1.)return vec4(1.);return vec4(O(s).rgb,1.);`,
  'Augraphy InkShifter: two smooth noise maps of resolution = Scale (source: Perlin, Gaussian-blurred; here value noise with a 3x3 blur, approx.), displacement x = -amp x factor x nx, y = factor x ny (the source draws amp in [0,1) and applies it to x only), remap with white border', 1);

f('q50_shadowcast','Shadow Cast (Augraphy ShadowCast)',[S('Side',['Random','Left','Right','Top','Bottom']),P('Opacity',0,1,.55,.01),P('Blur kernel',11,301,201,2,'px'),P('Vertices',1,20,8,1)],
  `${Q50_SZ}int sd=int(u_p0+.5);if(sd==0)sd=1+int(hash(vec2(6.,1.))*4.);vec2 nq=Q/SZ;vec2 f;
  if(sd==3)f=nq;else if(sd==4)f=1.-nq;else if(sd==1)f=vec2(1.-nq.y,nq.x);else f=vec2(nq.y,1.-nq.x);
  float sgp=(.3*((u_p2-1.)*.5-1.)+.8)*2.5;float sg=sgp/(sd>=3?SZ.y:SZ.x);float sgu=sgp/(sd>=3?SZ.x:SZ.y);float npt=2.+floor(u_p3);float mk=1.;float its=1.+floor(hash(vec2(6.,2.))*2.);
  for(int it=0;it<2;it++){if(float(it)>=its)break;float fi=float(it)*19.+1.;float w=.3+.5*hash(vec2(fi,1.)),h=.3+.5*hash(vec2(fi,2.));float xs=hash(vec2(fi,3.))*(1.-w);
   float t=clamp((f.x-xs)/w,0.,1.)*(npt-1.);float i0=floor(t);float y0=(i0<.5||i0>npt-1.5)?0.:hash(vec2(fi,10.+i0))*h,y1=(i0+1.<.5||i0+1.>npt-1.5)?0.:hash(vec2(fi,11.+i0))*h;
   float fy=mix(y0,y1,smoothstep(0.,1.,fract(t)));float cv=smoothstep(-1.2,1.2,(fy-f.y)/sg)*smoothstep(-1.2,1.2,min(f.x-xs,xs+w-f.x)/sgu);
   float op=mix(.2,.9,hash(vec2(fi,4.)))*u_p1/.55;mk*=1.-clamp(op,0.,1.)*cv;}
  return vec4(O(uv).rgb*mk,1.);`,
  'Augraphy ShadowCast: 1-2 shadows hanging from one page side, each a polygon over a random 30-80 % span whose depth (30-80 %) follows Vertices random points (zero at both ends, smoothed), blurred with a large Gaussian at 1/2-1/3 scale (here a soft edge of that width, approx.), blended toward white by opacity (source 0.2-0.9, scaled by Opacity/0.55) and multiplied onto the image', 1);

f('q50_bindings','Bindings and Fasteners (Augraphy BindingsAndFasteners)',[S('Type',['Punch holes','Binding holes','Clips','Triangle clips']),S('Edge',['Left','Right','Top','Bottom']),P('Count',1,8,3,1),P('Edge offset',0,80,12,1,'px')],
  `${Q50_SZ}int ty=int(u_p0+.5),ed=int(u_p1+.5);float La=ed<2?SZ.y:SZ.x;vec2 l=ed==0?vec2(Q.y,Q.x):ed==1?vec2(Q.y,SZ.x-Q.x):ed==2?vec2(Q.x,Q.y):vec2(Q.x,SZ.y-Q.y);
  float ar=SZ.x*SZ.y/630000.;float base=ty==0?60.:ty==1?40.:ty==2?120.:80.;float sz=clamp(max(base/(ty==0?4.:2.),base*.5*ar),base*.25,base*2.);
  float N=floor(u_p2);float gp=max(0.,floor((La-N*sz)/(N+1.)));float k=clamp(floor((l.x-gp*.5)/(sz+gp)),0.,N-1.);float cx=gp+k*(sz+gp)+sz*.5;
  vec2 d=vec2(l.x-cx,l.y-u_p3-sz*.5);float aa=max(1.,1./u_k);float sh=1.;
  if(ty==0){float an=atan(d.y,d.x);float rr=sz*.5*(1.+.06*(vnoise(vec2(an*3.,k*7.))-.5));float dd=length(d)-rr;sh=mix(.06+.08*hash(floor(Q)),1.,smoothstep(-aa,aa,dd));sh=min(sh,mix(.55,1.,smoothstep(0.,aa*2.5,abs(dd+aa*1.5))));}
  else if(ty==1){vec2 b=abs(d)-vec2(sz*.5,sz*.25);float dd=length(max(b,0.))+min(max(b.x,b.y),0.)-sz*.05;sh=mix(.1,1.,smoothstep(-aa,aa,dd));sh=min(sh,mix(.5,1.,smoothstep(0.,aa*2.,abs(dd+sz*.07))));}
  else{float an=radians((hash(vec2(k,3.))*2.-1.)*30.);vec2 e=rot(vec2(d.x,d.y+sz*.5),-an);float sw=max(sz*.025,aa);float dd;
   if(ty==2){vec2 e2=vec2(e.x,e.y-sz*.5);vec2 c1=vec2(0.,clamp(e2.y,-sz*.35,sz*.35));float o1=abs(length(e2-c1)-sz*.15);vec2 c2=vec2(-sz*.03,clamp(e2.y+sz*.05,-sz*.25,sz*.25));float o2=abs(length(vec2(e2.x+sz*.03,e2.y+sz*.05)-c2)-sz*.09);dd=min(o1,o2)-sw;}
   else{vec2 e2=vec2(e.x,e.y-sz*.45);vec2 A=vec2(0.,-sz*.4),B=vec2(-sz*.35,sz*.3),C=vec2(sz*.35,sz*.3);
    #define Q50SG(P_,A_,B_) length((P_)-(A_)-((B_)-(A_))*clamp(dot((P_)-(A_),(B_)-(A_))/dot((B_)-(A_),(B_)-(A_)),0.,1.))
    dd=min(min(Q50SG(e2,A,B),Q50SG(e2,B,C)),Q50SG(e2,C,A));dd=min(dd,abs(length(e2-vec2(0.,sz*.05))-sz*.12));dd-=sw;}
   sh=mix(.25+.25*smoothstep(-sw,sw*.2,dd+sw*.6),1.,smoothstep(-aa,aa,dd));}
  return vec4(min(O(uv).rgb,vec3(sh)),1.);`,
  'Augraphy BindingsAndFasteners (procedural create_foreground, approx. shapes): Count templates evenly spaced along one edge (gap = (L - n size)/(n+1)) at Edge offset px, template size scaled with page area (punch 60, binding 40, clip 120, triangle clip 80 base): noisy dark punch holes with a gray rim, rectangular binding holes, paper clips (two joined loops, rotated +-30 deg), binder-style triangle clips; min overlay', 1);
