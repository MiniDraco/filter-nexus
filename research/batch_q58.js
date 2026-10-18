/* ================= q58: round-21 Netpbm, Veejay, Warp-FX, Cinelerra, Vuo, Gem, vkdt, Harbeth, Douyin, Acid Cam, StreamFX, ScummVM, Mednafen ================= */
// Ported from the program docs / sources named in research/candidates21.py. Time-driven originals take their clock as a parameter.
const Q58_MIR = `
#define Q58MR(q_) (1.-abs(1.-mod((q_),2.)))
`;
// full-range BT.601 YCbCr in 0..1 (chroma centred on 128/255), as Veejay's YUV planes
const Q58_YUV = `
#define Q58Y(v_) vec3(dot((v_),vec3(.299,.587,.114)),dot((v_),vec3(-.168736,-.331264,.5))+.50196,dot((v_),vec3(.5,-.418688,-.081312))+.50196)
#define Q58RGB(q_) vec3((q_).x+1.402*((q_).z-.50196),(q_).x-.344136*((q_).y-.50196)-.714136*((q_).z-.50196),(q_).x+1.772*((q_).y-.50196))
`;

f = add('Distort');
f('q58_splicedradials','Spliced Radials (Warp-FX)',[P('Radius',0,1,.5,.01),P('Angle',-720,720,180,1,'deg'),P('Splices',1,50,10,1),P('Tension',0,1,1,.01)],
  `${Q58_MIR}vec2 p=vec2(uv.x*asp(),1.-uv.y),ce=vec2(.5*asp(),.5);float d=distance(p,ce),dr=u_p0-d,tr=mix(u_p0-d,u_p0,u_p3);
  float sw=fract(tr/u_p2);float cs=floor(max(dr,0.)/max(sw,1e-5));float sa=u_p1/u_p2*cs;if(dr>tr)sa=u_p1;
  vec2 q=rot(p-ce,radians(sa))+ce;q=vec2(q.x/asp(),1.-q.y);return d<=u_p0?vec4(T(Q58MR(q)).rgb,1.):c;`,
  'Radegast Warp-FX SplicedRadials.fx: dist from centre (aspect-corrected), tension_radius = lerp(R-d, R, tension), splice_width = frac((tension_radius - inner)/n), splice = floor(max(R-d,0)/width), angle = (Angle/n)*splice; rotate about the centre inside Radius (inner radius 0, normal blend, mirror addressing)');
f('q58_drunk','Drunk (Warp-FX / StreamFX)',[P('Strength',0,100,25,.1),P('Time',0,60,3,.01,'s'),P('Bending Angle',-1800,1800,180,1,'deg'),P('Bending Speed',0,10,1,.1)],
  `${Q58_MIR}float rt[36]=float[36](.2,.8,-.2,.452,-.2832,.8,-.28,-1.,-.42,-.89,.72,-.29,.75,.25,.33,.67,.98,.01,-.28,.8,-.32,-.189,.11,.84,-.48,.1,-.2323,-.555,.421,.23,-.28,.3,-1.3333,1.333,4.,1.);
  vec2 tc=vec2(uv.x,1.-uv.y);float an=u_p1*1000.;float th=radians(u_p2)*sin(an*.0005*u_p3);
  vec2 fd=fract(tc*5.);fd=(sin((fd-.5)*PI)+1.)*.5;ivec2 lo=ivec2(floor(tc*5.)),hi=ivec2(ceil(tc*5.));vec2 pt[4];
  for(int k=0;k<4;k++){int ix=(k==0||k==2)?lo.x:hi.x;int iy=k<2?lo.y:hi.y;vec2 off=vec2(0.);
   if(ix<5&&iy<5){float a=an/1000.*2.+rt[ix*6+iy];off=vec2(cos(a),sin(a));}
   off*=u_p0/100.*tc*.5*vec2(ix%2==0?-1.:1.,iy%2==0?-1.:1.);off=rot(off,th);pt[k]=(vec2(float(ix),float(iy))+off)/5.;}
  vec2 q=mix(mix(pt[0],pt[1],fd.x),mix(pt[2],pt[3],fd.x),fd.y);return vec4(T(Q58MR(vec2(q.x,1.-q.y))).rgb,1.);`,
  'Warp-FX Drunk.fx (Xaymar StreamFX Drunk port): 5x5 control grid, each point circles by (cos,sin)(t*speed + table phase) * strength/100 * uv * 0.5 with alternating sign, rotated by BendAngle*sin(t*0.0005*BendSpeed); positions blended across each cell with a sine fade; speed 2, edge points fixed');
f('q58_fibdown','Fibonacci Downscaler (Veejay)',[S('Mode',['Down','Rectangle']),P('Fib',1,8,3,1)],
  `ivec2 p=ivec2(floor(uv*u_res));int W=int(u_res.x+.5),H=int(u_res.y+.5);int N=W*H,hN=N/2;int i=(H-1-p.y)*W+p.x;int n=int(u_p1+.5);
  for(int k=0;k<8;k++){if(k>=n)break;if(u_p0<.5){int j=i>=hN?i-hN:i;i=j<2?j:2*j;}else if(i>=2&&i<hN)i=2*i-3;}
  i=clamp(i,0,N-1);int sx=i%W,sy=H-1-i/W;return vec4(T((vec2(float(sx),float(sy))+.5)/u_res).rgb,1.);`,
  'Veejay fibdownscale.c on the raster as one linear array (planes 4:4:4): Down = for i<len/2 p[i]=p[2i] then the first half copied over the second half; Rectangle = p[i]=p[2i-3] for 2<=i<len/2; repeated Fib times (evaluated as the composed index map)');
f('q58_widthmirror','Width Mirror (Veejay)',[P('Frequency',2,64,4,1),P('Phase',0,1000,0,1),P('Edge Width',0,64,8,1,'px'),P('Edge Glow',0,255,24,1)],
  `${Q58_YUV}float W=u_res.x;float x=floor(uv.x*W);float bw=W/u_p0;float u=mod(x+u_p1*W*.001,W);float b=floor(u/bw);float lo=u-b*bw;
  float sx=mod(b,2.)<.5?b*bw+lo:b*bw+bw-lo;sx=clamp(floor(sx+.5),0.,W-1.);vec3 s=T(vec2((sx+.5)/W,uv.y)).rgb;
  float ew=R(u_p2);float q=ew>.1?1.-clamp(min(lo,bw-lo)/ew,0.,1.):0.;vec3 y=Q58Y(s);y.x=min(y.x+q*u_p3/255.,1.);return vec4(clamp(Q58RGB(y),0.,1.),1.);`,
  'Veejay widthmirror.c: band width = W/freq, u = x + phase*W/1000 (wrapped), even bands read forward, odd bands mirrored; luma += glow*(1 - min(dist to band edge / edge width, 1)), chroma kept; the per-frame drift is folded into Phase');
f('q58_rumbler','Rumbler (Cinelerra-GG)',[P('Rumble',0,2,1,.01),P('Space',0,50,10,.5,'%'),P('Time',0,20,0,.01)],
  `float t0=floor(u_p2),ft=u_p2-t0;ft=ft*ft*(3.-2.*ft);vec2 cr[4];
  for(int k=0;k<4;k++){vec2 a=hash2(vec2(float(k)*7.31,t0))-.5,b=hash2(vec2(float(k)*7.31,t0+1.))-.5;cr[k]=mix(a,b,ft)*u_p0*u_p1/100.;}
  vec2 p0=cr[0],p1=vec2(1.,0.)+cr[1],p2=vec2(1.)+cr[2],p3=vec2(0.,1.)+cr[3];
  float sx=p0.x-p1.x+p2.x-p3.x,sy=p0.y-p1.y+p2.y-p3.y,dx1=p1.x-p2.x,dx2=p3.x-p2.x,dy1=p1.y-p2.y,dy2=p3.y-p2.y,den=dx1*dy2-dx2*dy1;
  float g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den;
  mat3 M=mat3(p1.x-p0.x+g*p1.x,p1.y-p0.y+g*p1.y,g,p3.x-p0.x+h*p3.x,p3.y-p0.y+h*p3.y,h,p0.x,p0.y,1.);
  vec3 s=inverse(M)*vec3(uv,1.);vec2 q=s.xy/s.z;return (q.x<0.||q.y<0.||q.x>1.||q.y>1.)?vec4(0.,0.,0.,1.):vec4(T(q).rgb,1.);`,
  'Cinelerra-GG Rumbler: each corner moved by Rumble * random(-0.5..0.5) * Space % of the frame, values interpolated between rumble points (Time = position between points, smooth), then a perspective warp to the moved corners; the per-second rate becomes the Time axis. approx. (random generator and interpolation shape not documented)', true);
f('q58_streakradial','Streak Image Radially (Vuo)',[P('Radius',0,1,.4,.01),P('Twirl',-360,360,0,1,'deg'),P('Fade Out',0,1,.5,.01)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float r=length(p),R0=u_p0*.5;if(r<=R0)return c;float rm=.5*length(vec2(asp(),1.));float k=clamp((r-R0)/max(rm-R0,1e-3),0.,1.);
  float a=atan(p.y,p.x)+radians(u_p1)*k;vec2 q=R0*.995*vec2(cos(a),sin(a))/vec2(asp(),1.)+.5;return vec4(T(q).rgb*(1.-u_p2*k),1.);`,
  'Vuo Streak Image Radially: the circle of Radius (fraction of the height) is kept, every pixel outside takes the colour of the circle edge along its ray, rotated by Twirl growing with distance and faded toward black; approx. (Vuo source not available, twirl/fade profiles linear)');

f = add('Color');
f('q58_rainbowshift','Rainbow Shift (Veejay)',[P('Amplitude',0,255,32,1),P('Frequency',0,10,1,.1)],
  `${Q58_YUV}vec2 p=floor(uv*u_res);float N=u_res.x*u_res.y;float i=(u_res.y-1.-p.y)*u_res.x+p.x;
  float w=floor(u_p0*sin(6.2831853*u_p1*i/N));vec3 q=floor(Q58Y(c.rgb)*255.+.5);q+=vec3(w,w,-w);q=mod(q,256.);return vec4(clamp(Q58RGB(q/255.),0.,1.),1.);`,
  'Veejay rainbowshift.c: wave = amplitude*sin(2pi*frequency*i/len) over the linear pixel index i (frequency cycles per frame), Y += wave, Cb += wave, Cr -= wave, each wrapped modulo 256 (8-bit overflow)');
f('q58_cosmichue','Cosmic Hue (Veejay)',[P('Amplitude',0,200,40,.1),P('Frequency',0,200,12,.1),P('Opacity',0,1,.8,.01),P('Hue Shift',0,360,0,1,'deg')],
  `${Q58_YUV}vec3 q=floor(Q58Y(c.rgb)*255.+.5);float ph=u_p1*q.x/255.;float u=trunc(q.y-128.+u_p0*sin(ph)),v=trunc(q.z-128.+u_p0*cos(ph));
  float a=radians(u_p3),cs=cos(a),sn=sin(a);float ur=clamp(128.+trunc(u*cs-v*sn),0.,255.),vr=clamp(128.+trunc(u*sn+v*cs),0.,255.);
  float op=floor(u_p2*255.+.5);q.y=floor((op*ur+(255.-op)*q.y)/256.);q.z=floor((op*vr+(255.-op)*q.z)/256.);return vec4(clamp(Q58RGB(q/255.),0.,1.),1.);`,
  'Veejay cosmichue.c: (U,V)-128 offset by amplitude*(sin,cos)(frequency*Y/255), rotated by Hue Shift, re-centred and clamped, blended with the original chroma by opacity/256; luma untouched (Veejay defaults amplitude 10, frequency 10, opacity 100/255)');
f('q58_complexinvert','Complex Invert (Veejay)',[P('Key Hue',0,360,30,1,'deg'),P('Angle',1,90,30,.5,'deg'),P('Solidity',1,255,160,1),P('Spill Kill',0,255,200,1)],
  `${Q58_YUV}vec2 kd=Q58Y(hsv2rgb(vec3(u_p0/360.,1.,1.))).yz*255.-128.;float km=length(kd);kd/=max(km,1e-3);
  vec3 q=Q58Y(c.rgb)*255.;vec2 ch=q.yz-128.;float xx=dot(ch,kd),yy=kd.x*ch.y-kd.y*ch.x;float tg=max(tan(radians(u_p1)),1e-3);
  float al=clamp((xx-abs(yy)/tg)*255./max(u_p2,10.),0.,255.)/255.;if(xx>0.)ch-=kd*min(xx,km)*u_p3/255.*al;
  vec3 o=vec3(q.x,ch+128.),iv=vec3(255.-q.x,128.-ch);return vec4(clamp(Q58RGB(mix(o,iv,al)/255.),0.,1.),1.);`,
  'Veejay complexinvert.c: chroma-plane wedge key around the key colour direction (half-angle Angle, distance x - |y|/tan(angle)), matte = distance*255/Solidity (threshold 0), spill of the key chroma removed in proportion to Spill Kill, then Y -> 255-Y and chroma negated, blended by the matte; key given as a hue (full-saturation colour)');
f('q58_altsat','Alternative Saturation (Netpbm pamaltsat)',[S('Method',['Spectrum','Logarithmic']),P('Strength',0,4,1.8,.01),S('Input',['Gamma (Rec.709)','Linear'])],
  `vec3 w=vec3(.3333,.6061,.0606);vec3 a=clamp(c.rgb,0.,1.);vec3 l=u_p2<.5?mix(a/4.5,pow((a+.099)/1.099,vec3(1./.45)),step(vec3(.081),a)):a;
  float I=dot(l,w),mxv=max(l.r,max(l.g,l.b)),mnv=min(l.r,min(l.g,l.b));float st=u_p1;vec3 o=l;
  if(u_p0<.5){float k=1.;if(mxv>mnv){float km1=(1.-I)/max(mxv-I,1e-6),km2=I/max(I-mnv,1e-6);k=min(st,min(km1,km2));}o=l*k-I*(k-1.);}
  else if(st<1.||mxv<1.){vec3 ts=pow(max(l,1e-6),vec3(st));float rr=I/max(dot(ts,w),1e-9);
   if(max(ts.r,max(ts.g,ts.b))*rr>1.){float lo=1.,hi=st;for(int i=0;i<16;i++){float m=.5*(lo+hi);vec3 tm=pow(max(l,1e-6),vec3(m));float mm=max(tm.r,max(tm.g,tm.b))*I/max(dot(tm,w),1e-9);if(mm>1.-1e-5)hi=m;else lo=m;}
    ts=pow(max(l,1e-6),vec3(lo));rr=I/max(dot(ts,w),1e-9);}o=ts*rr;}
  o=clamp(o,0.,1.);return vec4(u_p2<.5?mix(o*4.5,1.099*pow(o,vec3(.45))-.099,step(vec3(.018),o)):o,1.);`,
  'Netpbm pamaltsat (colour-integrity method): intensity I = (.3333,.6061,.0606) on Rec.709-linearised values; Spectrum: out = x*k - I*(k-1) with k = min(strength, (1-I)/(max-I), I/(I-min)); Logarithmic: x^strength rescaled to the original intensity, strength binary-searched down when the brightest channel would exceed 1 (pixels with a channel at 1 untouched)');
f('q58_recolor','Luminance-Locked Recolour (Netpbm pamrecolor)',[S('Source',['Target colour','Random colours']),P('Target Hue',0,360,330,1,'deg'),P('Target Saturation',0,1,.59,.01),S('Weights',['NTSC','sRGB','SMPTE-C'])],
  `vec3 w=u_p3<.5?vec3(.2989164,.586599,.1144845):u_p3<1.5?vec3(.2126729,.7151522,.072175):vec3(.2124132,.7010437,.0865432);
  float tg=dot(c.rgb,w);vec2 pq=floor(uv*u_res);vec3 k=u_p0<.5?hsv2rgb(vec3(u_p1/360.,u_p2,1.)):vec3(hash(pq),hash(pq+17.17),hash(pq+31.73));
  float gg=dot(k,w);vec3 o;if(gg<=0.)o=vec3(tg);else{o=min(k*tg/gg,1.);
   for(int i=0;i<4;i++){float g2=dot(o,w);if(abs(g2-tg)<=1e-5)break;vec3 lt=vec3(lessThan(o,vec3(1.)));float n=lt.r+lt.g+lt.b;if(n<.5)break;o=min(o+lt*((tg-g2)/n)/w,1.);}}
  return vec4(o,1.);`,
  'Netpbm pamrecolor (Scott Pakin): every pixel replaced by the target colour (or a random colour per pixel) scaled to the original luminance; channels clipped at 1 and the remaining deficit spread over the unclipped channels (divided by their weights) until the luminance matches; NTSC weights by default, on code values as the program does; default target = hotpink', true);
f('q58_okgamutclip','Oklab Gamut Clipping (Ottosson / vkdt okgmtclp)',[S('Mode',['Plain RGB clip','Preserve chroma','Project to L0 0.5','Adaptive L0 0.5'],3),P('Alpha',0,1,.05,.01),P('Chroma Boost',1,3,1.8,.01),P('Exposure',-2,2,0,.05,'EV')],
  `mat3 M1=mat3(.4122214708,.2119034982,.0883024619,.5363325363,.6806995451,.2817188376,.0514459929,.1073969566,.6299787005);
  mat3 M2=mat3(.2104542553,1.9779984951,.0259040371,.793617785,-2.428592205,.7827717662,-.0040720468,.4505937099,-.808675766);
  mat3 M3=mat3(1.,1.,1.,.3963377774,-.1055613458,-.0894841775,.2158037573,-.0638541728,-1.291485548);
  mat3 M4=mat3(4.0767416621,-1.2684380046,-.0041960863,-3.3077115913,2.6097574011,-.7034186147,.2309699292,-.3413193965,1.707614701);
  vec3 a=clamp(c.rgb,0.,1.);vec3 l=${LIN('a')}*exp2(u_p3);vec3 lm=M1*l;lm=sign(lm)*pow(abs(lm),vec3(1./3.));vec3 lab=M2*lm;lab.yz*=u_p2;
  vec3 m3=M3*lab;m3=m3*m3*m3;vec3 rgb=M4*m3;int md=int(u_p0+.5);
  bool ok=all(greaterThanEqual(rgb,vec3(0.)))&&all(lessThanEqual(rgb,vec3(1.)));
  if(!ok){if(md==0)rgb=clamp(rgb,0.,1.);else{float Lv=lab.x,C=max(length(lab.yz),1e-5);vec2 ab=lab.yz/C;float L0=md==1?clamp(Lv,0.,1.):.5;
   if(md==3){float Ld=Lv-.5,e1=.5+abs(Ld)+u_p1*C;L0=.5*(1.+sign(Ld)*(e1-sqrt(max(e1*e1-2.*abs(Ld),0.))));}
   float lo=0.,hi=1.;for(int i=0;i<18;i++){float t=.5*(lo+hi);vec3 mq=M3*vec3(L0+t*(Lv-L0),t*C*ab);mq=mq*mq*mq;vec3 q=M4*mq;
    if(all(greaterThanEqual(q,vec3(-1e-5)))&&all(lessThanEqual(q,vec3(1.+1e-5))))lo=t;else hi=t;}
   vec3 mq=M3*vec3(L0+lo*(Lv-L0),lo*C*ab);mq=mq*mq*mq;rgb=clamp(M4*mq,0.,1.);}}
  return vec4(${SRGB('rgb')},1.);`,
  'Ottosson Oklab gamut clipping as in vkdt okgmtclp: out-of-gamut colours moved along the straight Oklab line toward (L0, 0) until inside sRGB; L0 = L (preserve chroma), 0.5, or adaptive 0.5 with alpha; the gamut boundary is found by bisection instead of the cusp polynomials; Chroma Boost / Exposure push the sRGB image out of gamut first (an sRGB image is already inside)');

f = add('Stylize');
f('q58_mechpixels','Mechanical Pixels (Veejay)',[P('Pixel Size',6,80,28,1,'px'),P('3D Depth',0,100,88,1),S('Palette',['Wood','Source Soft','Steel','Amber','Source Full','Neon'],4),P('Amount',0,1,1,.01)],
  `${Q58_YUV}float cs=max(floor(R(u_p0)),6.);vec2 pp=vec2(uv.x,1.-uv.y)*u_res;vec2 cell=floor(pp/cs);vec2 lp=floor((pp-cell*cs)/u_k);float cw=floor(cs/u_k);
  float ay=0.,au=0.,av=0.,mn=1.,mx=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec2 sp=(cell+(vec2(float(i),float(j))+.5)/8.)*cs;vec3 q=Q58Y(T(vec2(sp.x,u_res.y-sp.y)/u_res).rgb);ay+=q.x;au+=q.y;av+=q.z;mn=min(mn,q.x);mx=max(mx,q.x);}
  ay*=255./64.;au*=255./64.;av*=255./64.;float det=(mx-mn)*255.;float rnd=floor(hash(cell)*256.);
  float db=7.+46.*29./100.;float des=clamp(18.+floor(ay*44./256.)+floor(det/16.)+(det>db?(det-db)/4.:0.),0.,255.);float val=clamp(floor(des/21.+.5)*21.,0.,255.);
  float gap=cw>=12.?min(floor((cw+5.)/8.),5.):cw>=8.?1.:0.;float inn=cw-2.*gap;float ms=max(inn-max(3.,floor((inn*55.+50.)/100.)),1.);float ml=clamp(floor((ms*u_p1+50.)/100.),1.,ms);float sd=min(1.+floor(val*ml/256.),ml);
  float x1=cw-gap-sd,y1=x1;int pal=int(u_p2+.5);
  float fy=34.+floor(val*190./256.)+floor(det/32.);if(pal==4||pal==5)fy=floor((3.*fy+ay+(val-128.)/4.)/4.);if(pal==1)fy+=floor((ay-128.)/16.);
  vec2 fc;if(pal==0)fc=vec2(112.+mod(rnd,16.)-7.+(au-128.)*val/4096.,145.+floor(mod(rnd,32.)/4.)+(av-128.)*val/4096.);
  else if(pal==2)fc=vec2(134.+floor(val*14./256.)-floor(mod(rnd,16.)/4.),121.-floor(val*8./256.)+floor(mod(rnd,8.)/2.));
  else if(pal==3)fc=vec2(105.-floor(val*8./256.)+floor(mod(rnd,8.)/2.),153.+floor(val*22./256.)-floor(mod(rnd,16.)/8.));
  else{float st=pal==1?112.+val*80./256.:pal==4?204.+val*78./256.:218.+val*74./256.;fc=128.+(vec2(au,av)-128.)*st/256.;}
  fc=clamp(fc,16.,240.);vec3 o;
  if(lp.x<gap||lp.y<gap||lp.x>=cw-gap||lp.y>=cw-gap)o=vec3(2.,128.,128.);
  else if(lp.x<x1&&lp.y<y1){float fw=max(x1-gap,1.),fh=max(y1-gap,1.);vec2 rel=lp-gap-vec2(fw,fh)*.5+.5;float gr=rel.x*18./fw+rel.y*24./fh;
   float pil=max(34.-(abs(rel.x)*255./fw+abs(rel.y)*255./fh)/8.,-18.);float tq=pal==4?28.+det/8.:pal==1?16.+det/16.:pal==5?20.+det/16.:0.;
   float yv=fy-gr+pil+floor((det+16.)/32.)+(hash(lp+cell*97.)-.5)*6.+(Q58Y(c.rgb).x*255.-ay)*tq/256.;vec2 e=lp-gap;
   if(e.x<1.||e.y<1.||lp.x>=x1-1.||lp.y>=y1-1.)yv-=14.;if(e.x<2.||e.y<2.)yv+=20.;else if(lp.x>=x1-2.||lp.y>=y1-2.)yv-=23.;o=vec3(yv,fc);}
  else{vec2 sc=128.+(fc-128.)*13./16.;float dx=lp.x-x1,dy=lp.y-y1;
   if(dx>=0.&&lp.y>=gap+dx&&lp.y<y1+dx)o=vec3(fy-47.-7.*dx,sc);else if(dy>=0.&&lp.x>=gap+dy&&lp.x<x1+dy)o=vec3(fy-68.-8.*dy,sc);
   else o=vec3(5.+floor(mod(rnd,16.)/2.)+floor(det/32.)-4.-floor(sd/2.),128.+(fc-128.)*.3);}
  return vec4(mix(c.rgb,clamp(Q58RGB(clamp(o,0.,255.)/255.),0.,1.),u_p3),1.);`,
  'Veejay mechanicalpixels.c steady state for one frame (no motion, motor waves or impacts): per cell mean Y/U/V and detail (max-min Y), height = quantise_21(18 + Y*44/256 + detail/16 + detail impulse), lift = 1 + height*maxLift/256; face luma 34 + h*190/256 with tilt gradient, pillow, rims and bevel, right/bottom sides darker by 47+7d / 68+8d, cast shadow, palette chroma tables; approx.: side/shadow outlines simplified', true);
f('q58_life',"Conway's Life Generation (Netpbm pbmlife)",[P('Threshold',0,1,.5,.01),S('Alive',['White','Black'])],
  `float me=0.,n=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;float a=0.;
   if(q.x>0.&&q.y>0.&&q.x<1.&&q.y<1.){a=step(u_p0,L(q));if(u_p1>.5)a=1.-a;}if(i==0&&j==0)me=a;else n+=a;}
  float nx=(n==3.||(me>.5&&n==2.))?1.:0.;if(u_p1>.5)nx=1.-nx;return vec4(vec3(nx),1.);`,
  'Netpbm pbmlife: image thresholded to 1 bit, white = alive (pbmlife convention), one generation of B3/S23 Life over the 8-neighbourhood, outside the image dead');
f('q58_soulout','Soul Out (Harbeth C7SoulOut)',[P('Soul',0,1,.3,.01),P('Max Scale',1,3,1.8,.01),P('Max Alpha',0,1,.4,.01)],
  `float al=u_p2*(1.-u_p0),sc=1.+(u_p1-1.)*u_p0;vec2 q=clamp(.5+(uv-.5)/sc,0.,1.);return vec4(mix(c.rgb,T(q).rgb,al),1.);`,
  'Harbeth C7SoulOut.metal: alpha = maxAlpha*(1-soul), scale = 1+(maxScale-1)*soul, copy zoomed about the centre by scale and mixed over the frame with alpha (Douyin soul-out: maxScale 1.8, maxAlpha 0.4, soul = cycle progress)');
f('q58_dyshake','Douyin Shake',[P('Progress',0,1,.6,.01),P('Max Scale',1,1.5,1.1,.01),P('Offset',0,.1,.02,.001)],
  `vec2 oc=vec2(u_p2,-u_p2)*u_p0;float sc=1.+(u_p1-1.)*u_p0;vec2 q=.5+(uv-.5)/sc;return vec4(T(q+oc).r,T(q-oc).g,T(q).b,1.);`,
  'Douyin shake (juejin OpenGL ES case 13): progress = mod(t,0.7)/0.7, zoom 1 -> maxScale about the centre, R sampled at +offset*progress and G at -offset*progress along the diagonal, B centred');
f('q58_hallucinate','Douyin Hallucination',[P('Time',0,2,.7,.01,'s'),P('Scale',1,2,1.2,.01),P('Max Red',0,1,.5,.01),P('Max Green Blue',0,.3,.05,.005)],
  `float du=2.,tm=mod(u_p0,du),pd=.5*(1.-1./u_p1);vec2 tc=.5+(uv-.5)/u_p1;float hd=.9;vec3 mx=vec3(u_p2,u_p3,u_p3);
  #define Q58GM(t_) T(tc+pd*vec2(sin((t_)*PI*2./du),-cos((t_)*PI*2./du))).rgb
  vec3 al=vec3(1.),res=vec3(0.);for(int i=0;i<10;i++){float f0=float(i)*.2;float pg=min(mod(du+tm-f0,du),hd);vec3 ta=mx-mx*pg/hd;res+=Q58GM(f0)*ta;al-=ta;}
  res+=Q58GM(tm)*al;return vec4(clamp(res,0.,1.),1.);`,
  'Douyin hallucination (juejin case 13): frame zoomed 1.2, sampled on a circle of radius 0.5*(1-1/scale) at the current time plus 10 ghosts spawned every 0.2 s whose per-channel alpha falls linearly to 0 over 0.9 s (max alpha R 0.5, G/B 0.05), remaining alpha on the current sample - red trails');

f = add('Sharpen');
f('q58_pgmenhance','Jarvis Edge Enhancement (Netpbm pgmenhance)',[P('Level',1,9,5,1)],
  `float ph=floor(u_p0+.5)/10.;vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=T(uv+vec2(float(i),float(j))*u_px*u_k).rgb;
  return vec4(clamp((c.rgb-ph*s/9.)/(1.-ph),0.,1.),1.);`,
  'Netpbm pgmenhance (xim, Knuth 1987 sec. 6 / Jarvis et al. 1976): new = (p - phi*mean3x3)/(1-phi), phi = N/10, i.e. p + N/(10-N)*(p - mean); per channel here (program is greyscale, default level 9)');
f('q58_falloffsharp','Sharpness Falloff Correction (Harbeth)',[P('Amount',0,1,.8,.01),P('Start',0,1,.45,.01),P('End',0,1,.7,.01),P('Edge Threshold',0,1,.02,.005)],
  `vec2 rd=(uv-.5)*u_res/max(u_res.x,u_res.y);float r=length(rd);float ot=max(u_p2,u_p1+1e-4);float t=clamp((r-u_p1)/(ot-u_p1),0.,1.);float rw=t*t*(3.-2.*t)*u_p0;
  vec3 Lp=T(uv+vec2(0.,u_px.y)).rgb+T(uv-vec2(0.,u_px.y)).rgb+T(uv+vec2(u_px.x,0.)).rgb+T(uv-vec2(u_px.x,0.)).rgb-4.*c.rgb;
  float Sv=clamp(dot(abs(Lp),vec3(.299,.587,.114))/4.,0.,1.);float I=Sv>u_p3?rw*(Sv-u_p3)/max(1e-4,1.-u_p3):0.;return vec4(clamp(c.rgb-Lp*I*.25,0.,1.),1.);`,
  'Harbeth C7SharpnessFalloffCorrection.metal: radial weight = smoothstep over [start,end] of the aspect-corrected radius times amount; 4-neighbour Laplacian, edge strength = luma(|L|)/4 gated by the threshold and renormalised; out = c - L*0.25*weight*strength (Harbeth defaults amount 0, end 1, threshold 0.2)');

f = add('Blur');
f('q58_nlfilt','Hexagon NL Filter (Netpbm pnmnlfilt)',[S('Mode',['Alpha-trimmed mean','Optimal estimation','Edge enhancement']),P('Amount',0,1,.4,.01),P('Radius',.34,1,.8,.01)],
  `vec2 px=u_px*u_k;vec3 nb[9];for(int j=0;j<3;j++)for(int i=0;i<3;i++)nb[j*3+i]=T(uv+vec2(float(i-1),float(j-1))*px).rgb;
  float rr=u_p2;vec2 hc[7]=vec2[7](vec2(0.),vec2(rr,0.),vec2(-rr,0.),vec2(.5*rr,.866*rr),vec2(-.5*rr,.866*rr),vec2(.5*rr,-.866*rr),vec2(-.5*rr,-.866*rr));
  vec3 h[7];for(int k=0;k<7;k++){vec3 s=vec3(0.);for(int m=0;m<13;m++){vec2 o=hc[k];if(m>0){float a=float(m)*1.0471976+(m>6?.5236:0.);o+=(m>6?.45:.25)*rr*vec2(cos(a),sin(a));}
   ivec2 ii=clamp(ivec2(floor(o+.5)),-1,1);s+=nb[(ii.y+1)*3+ii.x+1];}h[k]=s/13.;}
  int md=int(u_p0+.5);vec3 mean=(h[0]+h[1]+h[2]+h[3]+h[4]+h[5]+h[6])/7.;vec3 o;
  if(md==0){vec3 v[7];for(int k=0;k<7;k++)v[k]=h[k];for(int i=0;i<6;i++)for(int j=0;j<6;j++){if(j>=6-i)break;vec3 a=min(v[j],v[j+1]),b=max(v[j],v[j+1]);v[j]=a;v[j+1]=b;}
   float t=(7.-((.5-.5*u_p1)*12.+1.))/2.;vec3 s=vec3(0.);float ws=0.;for(int i=0;i<7;i++){float wi=clamp(min(float(i+1),float(7-i))-t,0.,1.);s+=v[i]*wi;ws+=wi;}o=s/ws;}
  else if(md==1){float nv=u_p1*u_p1/8.;vec3 va=vec3(0.);for(int k=0;k<7;k++){vec3 d=h[k]-mean;va+=d*d/4.;}o=mean+va/(va+nv+1e-9)*(h[0]-mean);}
  else{float pa=.1+.8*u_p1;o=(h[0]-pa*mean)/(1.-pa);}
  return vec4(clamp(o,0.,1.),1.);`,
  'Netpbm pnmnlfilt (Graeme Gill): 7 hexagons of size Radius (centre + 6 at hex spacing) area-sampled from the 3x3 pixels (13 points per hexagon here); Alpha-trimmed mean (alpha = Amount/2: (0.5-alpha)*12+1 values averaged, fractional end pair, 0.5 = median), Optimal estimation (alpha = 1+Amount: mean + var/(var+noise)*(centre-mean), noise = (alpha-1)^2/8, var = sum d^2/4), Edge enhancement (alpha = -(0.1+0.8*Amount): (centre - p*mean)/(1-p))');

f = add('Repair');
f('q58_wipeout','Wipeout (Netpbm pamwipeout)',[S('Direction',['Top-bottom','Left-right'])],
  `vec2 h=.5/u_res;float t;vec3 a,b;if(u_p0<.5){a=T(vec2(uv.x,1.-h.y)).rgb;b=T(vec2(uv.x,h.y)).rgb;t=floor((1.-uv.y)*u_res.y)/u_res.y;}
  else{a=T(vec2(h.x,uv.y)).rgb;b=T(vec2(1.-h.x,uv.y)).rgb;t=floor(uv.x*u_res.x)/u_res.x;}return vec4(mix(a,b,t),1.);`,
  'Netpbm pamwipeout: -tb every column becomes ((h-y)/h)*top + (y/h)*bottom of its first and last row; -lr every row the same between its first and last pixel');
f('q58_pnmalias','Two-Colour Antialias (Netpbm pnmalias)',[S('Colours',['White on black','Black on white']),S('Smooth',['Where both meet','Plus background side','Plus foreground side','Both sides']),P('Weight',.01,.99,.333,.001),P('Tolerance',0,.5,.05,.01)],
  `vec3 fg=vec3(u_p0<.5?1.:0.),bg=1.-fg;vec2 px=u_px*u_k;
  vec3 N=T(uv+vec2(0.,px.y)).rgb,E=T(uv+vec2(px.x,0.)).rgb,So=T(uv-vec2(0.,px.y)).rgb,Wv=T(uv-vec2(px.x,0.)).rgb;
  #define Q58EQ(a_,b_) (length((a_)-(b_))<=u_p3)
  bool bgf=(Q58EQ(N,bg)&&Q58EQ(E,bg))||(Q58EQ(E,bg)&&Q58EQ(So,bg))||(Q58EQ(So,bg)&&Q58EQ(Wv,bg))||(Q58EQ(Wv,bg)&&Q58EQ(N,bg));
  bool fgf=(Q58EQ(N,fg)&&Q58EQ(E,fg))||(Q58EQ(E,fg)&&Q58EQ(So,fg))||(Q58EQ(So,fg)&&Q58EQ(Wv,fg))||(Q58EQ(Wv,fg)&&Q58EQ(N,fg));
  int md=int(u_p1+.5);bool go=(bgf&&fgf)||(bgf&&(md==1||md==3))||(fgf&&(md==2||md==3));if(!go)return c;
  vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(i!=0||j!=0)s+=T(uv+vec2(float(i),float(j))*px).rgb;return vec4(u_p2*c.rgb+(1.-u_p2)*s/8.,1.);`,
  'Netpbm pnmalias: a pixel is smoothed (centre weight w, each neighbour (1-w)/8, default w = 1/3) only where two side-adjacent neighbours (N/E, E/S, S/W, W/N) are both background and another pair both foreground; -balias / -falias also smooth background- / foreground-only boundaries; colour match with a tolerance');

f = add('Distort');
f('q58_globe','Globe Gores (Netpbm ppmglobe)',[P('Strips',1,64,12,1),S('Background',['Black','White','Grey'])],
  `vec3 bg=vec3(u_p1<.5?0.:u_p1<1.5?1.:.5);float W=u_res.x,H=u_res.y;float n=floor(u_p0+.5);float sw=floor(W/n);float x=floor(uv.x*W),row=floor((1.-uv.y)*H);
  if(x>=sw*n||sw<1.)return vec4(bg,1.);float fa=sin(PI*row/H);float bd=floor(sw*(1.-fa)/2.+.5);float pp=mod(x,sw);if(pp<bd||pp>=sw-bd)return vec4(bg,1.);
  float sx=min(x-pp+floor((pp-bd)/max(fa,1e-4)+.5),W-1.);return vec4(T(vec2((sx+.5)/W,uv.y)).rgb,1.);`,
  'Netpbm ppmglobe: strip width = W/stripcount (right remainder dropped), each row squeezed by sin(pi*row/H) inside its strip with background margins round(width*(1-factor)/2), source column = strip left + round((p - border)/factor)');

f = add('Tone');
f('q58_filmcurv','Weibull Film Curve (vkdt filmcurv)',[P('Light',.1,10,3,.01),P('Contrast',.2,3,1.2,.01),P('Bias',-.1,.1,0,.001),S('Colour',['Per channel','DNG hue hack','Luminance'],1)],
  `vec3 a=clamp(c.rgb,0.,1.);vec3 x=${LIN('a')}+u_p2;float il=max(.005,u_p0),k=max(1e-4,u_p1);
  #define Q58WB(v_) (1.-exp(-pow(max((v_)*il,0.),k)))
  int m=int(u_p3+.5);vec3 y;
  if(m==0)y=vec3(Q58WB(x.r),Q58WB(x.g),Q58WB(x.b));
  else if(m==2){float l0=max(dot(x,vec3(.2126,.7152,.0722)),1e-7);y=x*Q58WB(l0)/l0;}
  else{float mx0=max(x.r,max(x.g,x.b)),mn0=min(x.r,min(x.g,x.b));float mx1=Q58WB(mx0),mn1=Q58WB(mn0);y=mn1+(mx1-mn1)*(x-mn0)/max(mx0-mn0,1e-6);}
  y=clamp(y,0.,1.);return vec4(${SRGB('y')},1.);`,
  'vkdt filmcurv: scene-linear (bias added) through the Weibull CDF 1 - exp(-(x*light)^contrast) (light = 1/lambda, contrast = k per the module readme); colour per channel, DNG hue hack (curve on max/min, middle channel re-interpolated, vkdt adjust_colour_dng, default) or luminance scaling; on the linearised sRGB image');

f = add('Retro');
f('q58_dyburr','Douyin Burr Glitch',[P('Time',0,.6,.15,.005,'s'),P('Max Jitter',0,.2,.06,.001),P('Red Offset',-.05,.05,.01,.001),P('Blue Offset',-.05,.05,-.025,.001)],
  `float tm=mod(u_p0,.6);float am=max(sin(tm*PI/.3),0.);float ty=1.-uv.y;float j=fract(sin(ty)*43758.5453123)*2.-1.;bool no=abs(j)<u_p1*am;
  vec2 q=vec2(uv.x+(no?j:j*am*.006),uv.y);return vec4(T(q+vec2(u_p2*am,0.)).r,T(q).g,T(q+vec2(u_p3*am,0.)).b,1.);`,
  'Douyin burr / glitch (juejin case 13): amplitude = max(sin(t*pi/0.3),0) over a 0.6 s cycle, per-row jitter = rand(y) in -1..1; rows with |jitter| < maxJitter*amplitude torn sideways by the full jitter, others by jitter*amplitude*0.006; red / blue sampled at x + offset*amplitude');
f('q58_semiline','Semiline (StreamFX example)',[P('Vertical Edge',0,100,50,.1,'%'),P('Step Size',.5,128,16,.5,'px'),P('Bar Size',.5,128,1,.5,'px'),S('Transparent shown as',['Black','White','Checker'])],
  `float E=u_p0*.01,yt=1.-uv.y,H=u_res.y;float S0=R(u_p1),B=R(u_p2);
  if(yt<=E){float st=floor((E-yt)*H/S0);float yi=E-(st+.5)*S0/H;if(abs(yt-yi)<st*B/H){vec2 ck=floor(uv*u_res/R(8.));return vec4(vec3(u_p3<.5?0.:u_p3<1.5?1.:(mod(ck.x+ck.y,2.)<.5?.75:.45)),1.);}}return c;`,
  'StreamFX semiline.effect: above the edge line the distance is cut into steps of Step Size px; at each step centre a transparent bar of half-height step*BarSize px (widening step by step away from the edge)');
f('q58_edge2x','Edge2x / Edge3x (ScummVM, approx.)',[P('Pixel size',1,16,6,1,'px'),S('Scale',['Edge2x','Edge3x']),S('Fill',['Nearest (snap)','Interpolated'])],
  `float BS=max(R(u_p0),1.);vec2 gp=vec2(uv.x,1.-uv.y)*u_res/BS;vec2 g=floor(gp),fr=gp-g;vec3 n[9];
  for(int j=0;j<3;j++)for(int i=0;i<3;i++)n[j*3+i]=T(vec2((g.x+float(i-1)+.5)*BS/u_res.x,1.-(g.y+float(j-1)+.5)*BS/u_res.y)).rgb;vec3 E=n[4];
  vec3 G0=vec3(.299,.587,.114),G1=vec3(.5,0.,-.5),G2=vec3(-.25,.5,-.25);float s0=0.,s1=0.,s2=0.;
  for(int i=0;i<9;i++){vec3 d=n[i]-E;float a0=dot(d,G0),a1=dot(d,G1),a2=dot(d,G2);s0+=a0*a0;s1+=a1*a1;s2+=a2*a2;}
  vec3 G=(s1>=s0&&s1>=s2)?G1:(s0>=s2?G0:G2);float sm=max(s0,max(s1,s2));vec3 o=E;
  if(sm>1e-5){float d[9];float md=0.;for(int i=0;i<9;i++){d[i]=abs(dot(n[i]-E,G));md=max(md,d[i]);}
   float sw=0.;vec2 ce=vec2(0.);for(int i=0;i<9;i++){float w=d[i]/md;if(i==0||i==2||i==6||i==8)w*=.7071;vec2 p=vec2(float(i%3-1),float(i/3-1));ce+=w*p;sw+=w;}ce/=sw;
   float sxx=0.,syy=0.,sxy=0.;for(int i=0;i<9;i++){float w=d[i]/md;if(i==0||i==2||i==6||i==8)w*=.7071;vec2 p=vec2(float(i%3-1),float(i/3-1))-ce;sxx+=w*p.x*p.x;syy+=w*p.y*p.y;sxy+=w*p.x*p.y;}
   float aa=sxx-syy,bb=sqrt(4.*sxy*sxy+aa*aa);
   if(bb>.15*(sxx+syy)){float th=degrees(.5*atan(2.*sxy,aa));int cl=abs(th)<=22.5?0:abs(th)>=67.5?2:(th>0.?3:1);
    int sc=int(u_p1+.5)+2;vec2 sub=floor(fr*float(sc));bool L0=sub.x<.5,R0=sub.x>float(sc)-1.5,T0=sub.y<.5,B0=sub.y>float(sc)-1.5;
    int a1=-1,a2=-1,o1=-1,o2=-1;if(cl==1){if(L0&&T0){a1=1;a2=3;o1=5;o2=7;}else if(R0&&B0){a1=5;a2=7;o1=1;o2=3;}}else if(cl==3){if(R0&&T0){a1=1;a2=5;o1=3;o2=7;}else if(L0&&B0){a1=3;a2=7;o1=1;o2=5;}}
    if(a1>=0){vec3 p1=n[a1],p2=n[a2];if(abs(dot(p1-p2,G))<.5*md&&abs(dot(p1-E,G))>.5*md&&abs(dot(n[o1]-E,G))<.5*md&&abs(dot(n[o2]-E,G))<.5*md){
     if(u_p2>.5)o=(p1+p2)*.25+E*.5;else{vec3 cd=(p1+p2+E)/3.;float bd=1e9;for(int i=1;i<9;i+=2){vec3 e=n[i]-cd;float dd=2.*e.r*e.r+4.*e.g*e.g+e.b*e.b;if(dd<bd){bd=dd;o=n[i];}}vec3 e=E-cd;if(2.*e.r*e.r+4.*e.g*e.g+e.b*e.b<bd)o=E;}}}}}
  return vec4(o,1.);`,
  'ScummVM Edge2x/Edge3x (Eric Welsh) approx.: of three greyscale projections the one with the largest 3x3 variance is used, neighbour differences normalised by the maximum (diagonals x 1/sqrt2) give the inertia tensor whose principal axis is classed - / | \\; the two corner sub-pixels on the far side of a diagonal edge take the two matching edge neighbours (only when the opposite two neighbours match the centre (no thinning of 1-px lines); candidate (a+b+E)/3 snapped to the nearest of N/E/S/W/centre with 2:4:1 RGB weights, or blended 1:1 with the centre when interpolated); refineDirection, knight, arrow and zig-zag passes not ported');
f('q58_pm2x','2xPM (Pablo Medina, ScummVM)',[P('Pixel size',1,16,6,1,'px'),P('Color tolerance',0,.3,.03,.005)],
  `float BS=max(R(u_p0),1.);vec2 gp=vec2(uv.x,1.-uv.y)*u_res/BS;vec2 g=floor(gp),fr=gp-g;float thr=u_p1+1e-4;
  #define Q58N(i_,j_) T(vec2((g.x+float(i_)+.5)*BS/u_res.x,1.-(g.y+float(j_)+.5)*BS/u_res.y)).rgb
  #define EQ(a_,b_) (dot(abs((a_)-(b_)),vec3(1.))<=thr)
  vec3 pA=Q58N(-1,-1),pB=Q58N(0,-1),pC=Q58N(1,-1),pD=Q58N(-1,0),pE=Q58N(0,0),pF=Q58N(1,0),pG=Q58N(-1,1),pH=Q58N(0,1),pI=Q58N(1,1);
  vec3 e0=pE,e1=pE,e2=pE,e3=pE;bool dn=false;
  if(!EQ(pD,pF)){
   if(!EQ(pE,pD)&&EQ(pD,pH)&&EQ(pD,pI)&&!EQ(pE,pG)&&(!EQ(pD,pG)||!EQ(pE,pF)||!EQ(pA,pD))&&!(EQ(pD,pA)&&EQ(pD,pG)&&EQ(pE,pB)&&EQ(pE,pF))){e2=pH;e3=(e3+pH)*.5;dn=true;}
   else if(!EQ(pE,pF)&&EQ(pF,pH)&&EQ(pF,pG)&&!EQ(pE,pI)&&(!EQ(pF,pI)||!EQ(pE,pD)||!EQ(pC,pF))&&!(EQ(pF,pC)&&EQ(pF,pI)&&EQ(pE,pB)&&EQ(pE,pD))){e2=(e2+pH)*.5;e3=pH;dn=true;}}
  if(!dn&&!EQ(pB,pH)){
   if(!EQ(pE,pB)&&(!EQ(pA,pB)||!EQ(pB,pC)||!EQ(pE,pH))){
    if(EQ(pB,pD)&&EQ(pB,pG)&&!EQ(pE,pA)&&!(EQ(pD,pA)&&EQ(pD,pC)&&EQ(pE,pH)&&EQ(pE,pF))){e0=(3.*pB+e0)*.25;e2=(3.*e2+pB)*.25;dn=true;}
    else if(EQ(pB,pF)&&EQ(pB,pI)&&!EQ(pE,pC)&&!(EQ(pF,pC)&&EQ(pF,pA)&&EQ(pE,pH)&&EQ(pE,pD))){e1=(3.*pB+e1)*.25;e3=(3.*e3+pB)*.25;dn=true;}}
   if(!EQ(pE,pH)&&(!EQ(pG,pH)||!EQ(pE,pB)||!EQ(pH,pI))){
    if(EQ(pH,pD)&&EQ(pH,pA)&&!EQ(pE,pG)&&!(EQ(pD,pG)&&EQ(pD,pI)&&EQ(pE,pB)&&EQ(pE,pF))){e2=(3.*pH+e2)*.25;e0=(3.*e0+pH)*.25;dn=true;}
    else if(EQ(pH,pF)&&EQ(pH,pC)&&!EQ(pE,pI)&&!(EQ(pF,pI)&&EQ(pF,pG)&&EQ(pE,pB)&&EQ(pE,pD))){e3=(3.*pH+e3)*.25;e1=(3.*e1+pH)*.25;dn=true;}}}
  if(!dn){
   if(!EQ(pB,pH)&&!EQ(pD,pF)){
    if(EQ(pB,pD)&&!EQ(pE,pD)&&!(EQ(pE,pA)&&EQ(pB,pC)&&EQ(pE,pF))&&!(EQ(pB,pA)&&EQ(pB,pG))&&!(EQ(pD,pA)&&EQ(pD,pC)&&EQ(pE,pF)&&!EQ(pG,pD)&&!EQ(pG,pE)))e0=(e0+pB)*.5;
    if(EQ(pB,pF)&&!EQ(pE,pF)&&!(EQ(pE,pC)&&EQ(pB,pA)&&EQ(pE,pD))&&!(EQ(pB,pC)&&EQ(pB,pI))&&!(EQ(pF,pA)&&EQ(pF,pC)&&EQ(pE,pD)&&!EQ(pI,pF)&&!EQ(pI,pE)))e1=(e1+pB)*.5;
    if(EQ(pH,pD)&&(!EQ(pE,pG)||!EQ(pE,pD))&&!(EQ(pE,pG)&&EQ(pH,pI)&&EQ(pE,pF))&&!(EQ(pH,pG)&&EQ(pH,pA))&&!(EQ(pD,pG)&&EQ(pD,pI)&&EQ(pE,pF)&&!EQ(pA,pD)&&!EQ(pA,pE)))e2=(e2+pH)*.5;
    if(EQ(pH,pF)&&(!EQ(pE,pI)||!EQ(pE,pF))&&!(EQ(pE,pI)&&EQ(pH,pG)&&EQ(pE,pD))&&!(EQ(pH,pI)&&EQ(pH,pC))&&!(EQ(pF,pG)&&EQ(pF,pI)&&EQ(pE,pD)&&!EQ(pC,pF)&&!EQ(pI,pE)))e3=(e3+pH)*.5;}
   else if(EQ(pD,pB)&&EQ(pD,pF)&&EQ(pD,pH)&&!EQ(pD,pE)){
    if(EQ(pD,pG)||EQ(pD,pC)){e1=(e1+pD)*.5;e2=e1;}
    if(EQ(pD,pA)||EQ(pD,pI)){e0=(e0+pD)*.5;e3=e0;}}}
  bool rx=fr.x>=.5,dw=fr.y>=.5;return vec4(dw?(rx?e3:e2):(rx?e1:e0),1.);`,
  'ScummVM pm.cpp (2xPM by Pablo Medina): 3x3 neighbourhood A..I, diagonal slope rules (E2/E3 from H), then the 3:1 B/H blends, then the 1:1 corner blends and the cross case, in source order with the doNotReblit short-circuit; equality relaxed to a colour tolerance; each art pixel split into 2x2');
f('q58_aspect','Aspect Correction 200 to 240 lines (ScummVM)',[P('Line height',1,8,2,1,'px'),S('Mode',['Interpolated (7:1, 5:3)','Nearest line']),S('Fit',['Pillarbox','Fill width'])],
  `float h=max(R(u_p0),1.);float Hp=u_res.y,Wp=u_res.x;float No=floor(Hp/h);float Y=floor((1.-uv.y)*Hp/h);if(Y>=No)return vec4(0.,0.,0.,1.);float Ns=floor((No*5.+5.)/6.);
  float xs=uv.x;if(u_p2<.5){xs=(uv.x-.5)*1.2+.5;if(xs<0.||xs>1.)return vec4(0.,0.,0.,1.);}
  float s=floor((Y*5.+4.)/6.);float m=mod(Y,6.);float wv=(m<.5||m>4.5)?1.:m<1.5?.875:m<2.5?.625:m<3.5?.375:.125;if(u_p1>.5)wv=1.;
  float cx=(floor(xs*Wp/h)+.5)*h/Wp;vec3 a=T(vec2(cx,1.-(s+.5)/Ns)).rgb,b=T(vec2(cx,1.-(max(s-1.,0.)+.5)/Ns)).rgb;return vec4(mix(b,a,wv),1.);`,
  'ScummVM aspect.cpp (kVeryFastAndGoodAspectMode): output line y reads source line s = (5y+4)/6; in each group of 6 output lines rows 0 and 5 are copies, rows 1-4 blend L[s] with L[s-1] at 7:1, 5:3, 3:5, 1:7; the frame is treated as the 5/6-height source (Line height = one art line) and pillarboxed to keep proportions');
f('q58_goatcrt','Goat CRT (Mednafen goat shader)',[S('Pattern',['Goatron','Goatron prime','Borg','Slenderman']),P('Divergence',-2,2,.5,.01,'px'),P('Transparency',0,1,.5,.01),P('Texel size',1,8,3,1,'px')],
  `float ts=max(R(u_p3),1.);vec2 pp=vec2(uv.x,1.-uv.y)*u_res;vec2 dp=floor(pp/u_k);int pat=int(u_p0+.5);float dv=u_p1*u_k;
  #define Q58TX(ox_,oy_) T(vec2((floor((pp.x+(ox_))/ts)+.5)*ts/u_res.x,1.-(floor((pp.y+(oy_))/ts)+.5)*ts/u_res.y)).rgb
  vec3 col=vec3(Q58TX(-dv,-dv).r,Q58TX(0.,-.5*dv).g,Q58TX(dv,dv).b);col=pow(col,vec3(2.2));
  int mxi=int(dp.x),myi=int(dp.y);vec3 m=vec3(u_p2);bool blk=false;int ch=0;
  if(pat==0)ch=mxi%3;else if(pat==1){mxi=mxi%4;ch=mxi;blk=mxi==3;}
  else if(pat==2){mxi=mxi%8;myi=myi%4;ch=mxi%4;blk=(mxi&3)==3||myi==((4>>(mxi>=4?1:0))-1);}
  else{mxi=mxi%20;myi=9-myi%10;ch=mxi%4;blk=(mxi&3)==3||(myi+(mxi/4)*2)%5==4;}
  if(!blk){if(ch==0)m.r=1.;else if(ch==1)m.g=1.;else if(ch==2)m.b=1.;}
  float fy=fract(pp.y/ts+.5)-.5;float sl=min(abs(fy)*2.,1.)*.4+.6;col*=m*sl;return vec4(pow(col,vec3(1./2.2)),1.);`,
  'Mednafen goat shader (drivers/shader.cpp UpdateGoatMask): masks Goatron 3x1 RGB stripes, Goatron prime 4x1 with a black column, Borg 8x4 with black column and staggered black rows, Slenderman 20x10 with diagonal black bars; unlit mask cells = Transparency; R/B sampled -/+ Divergence output px (G at -half vertically); scanline gain min(|frac|*2,1)*0.4+0.6 per source texel; all in gamma 2.2 linear');

f = add('Distort');
f('q58_stealthcloak','Stealth Cloak (Acid Cam game_codex)',[P('Time',0,10,1,.01,'s'),P('Ripple',0,3,1,.01),P('Veil',0,1,.55,.01),P('Shimmer',0,2,1,.01)],
  `vec2 tc=vec2(uv.x,1.-uv.y);vec2 p=tc-.5;float t=u_p0;float w=sin(70.*p.y+5.*t)*sin(43.*p.x-3.*t);vec2 q=clamp(tc+u_p1*vec2(.012*w,.006*cos(55.*p.x+4.*t)),0.,1.);
  vec3 s=T(vec2(q.x,1.-q.y)).rgb;float lu=dot(s,vec3(.299,.587,.114));float e=clamp((dot(p,p)-.65)/(.05-.65),0.,1.);float ve=e*e*(3.-2.*e);
  s=mix(s,lu*vec3(.65,.9,1.),u_p2*ve);s+=vec3(.15,.5,.8)*abs(w)*ve*u_p3;return vec4(clamp(s,0.,1.),1.);`,
  'lostjared game_codex_stealth_cloak.glsl: w = sin(70y+5t)*sin(43x-3t), sample offset (0.012w, 0.006cos(55x+4t)), veil = smoothstep(0.65,0.05,r^2), mix toward luma*(0.65,0.9,1) by 0.55*veil, + (0.15,0.5,0.8)*|w|*veil; Ripple / Veil / Shimmer scale the original constants');
f('q58_portalrift','Portal Rift (Acid Cam game_codex)',[P('Time',0,10,1,.01,'s'),P('Swirl',0,10,4,.1),P('Ring Glow',0,3,1.2,.01),P('Ring Radius',.05,.5,.28,.01)],
  `vec2 tc=vec2(uv.x,1.-uv.y);vec2 p=tc-.5;p.x*=asp();float r=length(p),t=u_p0;float hh=clamp((r-.55)/(-.55),0.,1.);float sw=(.6-r)*u_p1*hh*hh*(3.-2.*hh);
  float a=sw+t*.8,cs=cos(a),sn=sin(a);vec2 q=vec2(cs*p.x+sn*p.y,-sn*p.x+cs*p.y);q=clamp(q/max(.35+r,.1)+.5,0.,1.);vec3 s=T(vec2(q.x,1.-q.y)).rgb;
  float e=clamp((abs(r-u_p3)-.035)/(-.035),0.,1.);float rg=e*e*(3.-2.*e);vec3 en=.55+.45*cos(vec3(0.,2.2,4.1)+atan(p.y,p.x)*3.+t*4.);return vec4(clamp(s+en*rg*u_p2,0.,1.),1.);`,
  'lostjared game_codex_portal_rift.glsl: swirl = (0.6-r)*4*smoothstep(0.55,0,r), rotate by swirl+0.8t, perspective remap q/(0.35+r)+0.5, thin ring smoothstep(0.035,0,|r-0.28|) adding cyan-magenta energy 0.55+0.45cos(offsets + 3*angle + 4t) * 1.2');
f('q58_freezecrystal','Freeze Crystal (Acid Cam game shader)',[P('Grid',4,60,18,1),P('Facet Offset',0,.05,.012,.001),P('Ice Mix',0,1,.55,.01),P('Sparkle Time',0,10,0,.01)],
  `vec2 tc=vec2(uv.x,1.-uv.y);vec2 g=floor(tc*u_p0),fr=fract(tc*u_p0);vec2 jt=(fract(sin(vec2(dot(g,vec2(127.1,311.7)),dot(g,vec2(269.5,183.3))))*43758.5453)-.5)*.3;
  vec2 q=tc+(fr-.5+jt)*u_p1;vec3 s=T(vec2(q.x,1.-q.y)).rgb;float lu=dot(s,vec3(.299,.587,.114));s=mix(s,mix(vec3(.55,.75,1.),vec3(.95,1.,1.05),lu),u_p2);
  float sp=step(.985,fract(sin(dot(g,vec2(12.9,78.2)))*43758.+u_p3));return vec4(clamp(s+sp,0.,1.),1.);`,
  'lostjared game_freeze_crystal.glsl: 18x18 facet grid, per-cell hash jitter*0.3, sample offset (f-0.5+jitter)*0.012, ice = mix((0.55,0.75,1),(0.95,1,1.05),luma) mixed in by 0.55, rare white cell sparkles step(0.985, hash + t)');

f = add('Render');
f('q58_shieldhit','Shield Hit (Acid Cam game_codex)',[P('Time',0,10,.4,.01,'s'),P('Hex Glow',0,1.5,.45,.01),P('Ring Glow',0,2,.9,.01)],
  `vec2 tc=vec2(uv.x,1.-uv.y);vec2 p=tc-.5;p.x*=asp();float r=length(p),t=u_p0;float hx=abs(sin(p.x*18.+p.y*10.+t*4.))*abs(sin(p.x*-18.+p.y*10.-t*3.2));
  float rg=exp(-pow((r-mod(t*.45,.9))*18.,2.));vec2 q=tc+normalize(p+1e-5)*rg*.025;vec3 s=T(vec2(q.x,1.-q.y)).rgb;return vec4(clamp(s+vec3(.2,.75,1.)*(pow(hx,10.)*u_p1+rg*u_p2),0.,1.),1.);`,
  'lostjared game_codex_shield_hit.glsl: hex shimmer |sin(18x+10y+4t)|*|sin(-18x+10y-3.2t)|, expanding ring exp(-((r - mod(0.45t,0.9))*18)^2) that refracts the frame outward by 0.025, adds (0.2,0.75,1)*(hex^10*0.45 + ring*0.9)');

f = add('Analysis');
f('q58_colorclassify','Colour Classify (Gem pix_colorclassify)',[S('Show',['Certain only','Plus good guesses','All guesses'])],
  `vec3 hv=rgb2hsv(c.rgb);float S=hv.y,V=hv.z,H=S<1e-5?-1.:hv.x*360.;int k=9,ce=2,cap=0;bool dn=false;
  if(V<.3){dn=true;if(S>.3&&V>.2){if(S>.6&&H>65.&&H<170.){k=3;ce=0;}else if(S>.8){k=9;ce=2;}else{k=0;ce=1;}}else{k=0;ce=0;}}
  if(!dn&&((V>.8&&S<.2)||(V>.7&&S<.1)||(V>.6&&S<.05))){dn=true;if(S>.1){k=9;ce=2;}else{k=1;ce=V<.7?1:0;}}
  if(!dn&&((V<.65&&S<.15)||(V<.7&&S<.1)||(V<.5&&S<.3&&H>10.&&H<40.))){if(V<.5){dn=true;k=0;ce=1;}else if(S<.08){dn=true;k=1;ce=1;}else cap=2;}
  if(!dn){if(H<30.||H>330.){if(H>10.&&H<=30.&&S<.4){if(H>20.){k=5;ce=1;}else{k=2;ce=2;}}else{k=2;ce=((S<.3&&V<.6)||(S<.4&&V<.35))?1:0;}}
   else if(H>80.&&H<170.){k=3;ce=S<.2?1:0;if(H>160.&&(S<.6||V>.6))ce=2;}
   else if(H>185.&&H<270.){if(S<.3){ce=1;k=V>.75?1:4;}else{k=4;ce=0;}}
   else{if(H<=80.){k=H>=70.?3:5;ce=0;}else if(H<=185.){k=H>=170.?4:3;ce=1;}else{k=H<280.?4:2;ce=1;}if(S<.5)ce=2;}
   ce=max(ce,cap);}
  vec3 pal[10]=vec3[10](vec3(0.),vec3(1.),vec3(1.,0.,0.),vec3(0.,1.,0.),vec3(0.,0.,1.),vec3(1.,1.,0.),vec3(.667,0.,1.),vec3(1.,0.,1.),vec3(.5),vec3(.604,.451,.337));
  return vec4(ce<=int(u_p0+.5)?pal[k]:pal[9],1.);`,
  'Gem pix_colorclassify (Ricardo Fabbri): HSV interval tree - dark (V<0.3) black / dark green, bright low-saturation white, mid-dark greys, then hue bands red <30 or >330 (orange-yellow split), green 80-170, blue 185-270, the rest by sub-bands - each with a certainty; Gem shows only certain results, the rest as the brown "not sure" colour (154,115,86); the other modes also show good / unreliable guesses');
