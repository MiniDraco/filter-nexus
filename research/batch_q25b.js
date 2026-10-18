/* ================= q25b: Paint.NET plug-in packs (Ed Harvey, MadJik, Red ochre), FFmpeg 2 (hsvkey/hsvhold, lumakey, chromashift, swaprect, fillborders, deflate/inflate, datascope/pixscope), ON1 Effects (Tone Enhancer, HDR Look, Antique, Weather) ================= */
const Q25_FONT = ['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111','010101111101101','110101110101110','011100100100011','110101101101110','111100111100111','111100111100100'].map(r => parseInt(r, 2));
const Q25_YUV = `
#define Q25Y(cc) dot((cc),vec3(.299,.587,.114))
#define Q25U(cc) dot((cc),vec3(-.168736,-.331264,.5))
#define Q25V(cc) dot((cc),vec3(.5,-.418688,-.081312))
#define Q25RGB(yy,uu,vv) vec3((yy)+1.402*(vv),(yy)-.344136*(uu)-.714136*(vv),(yy)+1.772*(uu))
#define Q25CHK(pp) mix(vec3(.4),vec3(.6),mod(floor((pp).x/8.)+floor((pp).y/8.),2.))
`;

f = add('Distort');
f('q25_pdn_distort','Ed Harvey Distorts (Drop Ripple / InsideOut / Multiview Warp / Wobble) + Vibrato (MadJik)',[S('Effect',['Drop Ripple (Ed Harvey)','InsideOut (Ed Harvey)','Multiview Warp (Ed Harvey)','Wobble (Ed Harvey)','Vibrato (MadJik)']),P('Amount',0,100,50,1),P('Size',4,200,40,1,'px'),P('Highlight or phase',0,1,.3,.01)],
  `int m=int(u_p0+.5);vec2 S_=u_res/u_k;vec2 P=PX(uv);vec2 cpx=.5*S_;float am=u_p1/100.;float L=u_p2;float hl=u_p3;const float TP=6.2831853;
 if(m==0){vec2 d=P-cpx;float r=length(d);vec2 n=r>0.?d/r:vec2(0.);float dec=exp(-r/(.6*length(S_)));float ph=TP*r/L;
  float disp=am*L*.45*sin(ph)*dec;vec3 col=O(clamp(fromPX(P-n*disp),0.,1.)).rgb;float sl=cos(ph)*dec*min(am*2.,1.);col+=hl*.9*max(sl,0.)*max(sl,0.)-hl*.3*max(-sl,0.);return vec4(clamp(col,0.,1.),1.);}
 if(m==1){vec2 d=(uv-.5)*vec2(asp(),1.);float r=length(d);float rm=.5*length(vec2(asp(),1.));float g=.5+am;float rs=rm*pow(clamp(1.-r/rm,0.,1.),g);
  float a=atan(d.y,d.x)+hl*TP*(r/rm);vec2 q=rs*vec2(cos(a),sin(a))/vec2(asp(),1.)+.5;return vec4(O(clamp(q,0.,1.)).rgb,1.);}
 if(m==2){float nv=2.+floor(am*4.+.5);vec2 cu=fract(uv*nv)-.5;float rr=length(cu*2.);vec2 q=cu*mix(1.,.6+.4*rr*rr,hl*1.6+.2);float vg=1.-.35*smoothstep(.75,1.05,rr);
  return vec4(O(clamp(q+.5,0.,1.)).rgb*vg,1.);}
 if(m==3){float A=am*L*.35;float ph=hl*TP;vec2 dd=A*vec2(sin(TP*P.y/L+ph)+.5*sin(TP*P.y/(2.7*L)+2.*ph),sin(TP*P.x/L-ph)+.5*sin(TP*P.x/(2.3*L)+ph));
  return vec4(O(clamp(fromPX(P+dd),0.,1.)).rgb,1.);}
 vec3 c0=O(uv).rgb;vec3 o;float A=am*L*.5;
 for(int k=0;k<3;k++){float cv=k==0?c0.r:k==1?c0.g:c0.b;float sh=A*sin(TP*P.y/L+TP*cv*(1.+3.*hl)+float(k)*2.094);vec3 s=O(clamp(fromPX(P+vec2(sh,0.)),0.,1.)).rgb;if(k==0)o.r=s.r;else if(k==1)o.g=s.g;else o.b=s.b;}
 return vec4(o,1.);`,
  'Paint.NET plug-in packs, approx. from the forum descriptions (no published source): Ed Harvey Drop Ripple = water-drop rings from the centre, radial displacement sin(2 pi r / Size) with exponential decay, Highlight brightens the crests; InsideOut = radial inversion, the centre is pulled from the rim and the rim from the centre (r\' = R (1 - r/R)^(0.5 + Amount)), optional twist; Multiview Warp = the whole image repeated in an n x n grid of bulging lens views (n = 2..6 by Amount); Wobble = two-frequency sinusoidal x/y wobble (phase = Highlight); MadJik Vibrato = per-channel vibrato: each RGB channel resampled with a sinusoidal row delay whose phase is modulated by that channel\'s own value (sound-effect vibrato formula applied to the image)');

f = add('Blur');
f('q25_pdn_blur','True Blur / Simplify (Ed Harvey)',[S('Effect',['True Blur (Ed Harvey)','Simplify (Ed Harvey)']),P('Radius',1,40,6,.5,'px'),P('Tolerance',.02,1,.15,.01),S('Edges',['Clamp','Tileable (wrap)'])],
  [`int m=int(u_p0+.5);bool wr=u_p3>.5;float rr=R(u_p1);
  if(m==0){float sg=max(rr*.5,.5);float st=max(1.,3.*sg/40.);vec3 a=vec3(0.);float ws=0.;
   for(int i=-40;i<=40;i++){float x=float(i)*st;if(abs(x)>3.*sg+.5)continue;float w=exp(-.5*x*x/(sg*sg));vec2 q=uv+vec2(x*u_px.x,0.);q=wr?fract(q):clamp(q,0.,1.);vec3 v=O(q).rgb;a+=w*${LIN('v')};ws+=w;}
   return vec4(a/ws,1.);}
  vec3 c0=O(uv).rgb;vec3 a=vec3(0.);float ws=0.;
  for(int i=0;i<96;i++){float fi=float(i);float r=sqrt((fi+.5)/96.)*rr;float an=fi*2.39996;vec2 q=uv+vec2(cos(an),sin(an))*r*u_px;q=wr?fract(q):clamp(q,0.,1.);vec3 v=O(q).rgb;
   float w=step(length(v-c0),u_p2*1.2);a+=w*v;ws+=w;}
  return vec4(a/max(ws,1.),1.);`,
   `int m=int(u_p0+.5);bool wr=u_p3>.5;float rr=R(u_p1);
  if(m==0){float sg=max(rr*.5,.5);float st=max(1.,3.*sg/40.);vec3 a=vec3(0.);float ws=0.;
   for(int i=-40;i<=40;i++){float x=float(i)*st;if(abs(x)>3.*sg+.5)continue;float w=exp(-.5*x*x/(sg*sg));vec2 q=uv+vec2(0.,x*u_px.y);q=wr?fract(q):clamp(q,0.,1.);a+=w*T(q).rgb;ws+=w;}
   vec3 o=a/ws;return vec4(${SRGB('o')},1.);}
  vec3 c0=T(uv).rgb;vec3 a=vec3(0.);float ws=0.;
  for(int i=0;i<96;i++){float fi=float(i);float r=sqrt((fi+.5)/96.)*rr*.6;float an=fi*2.39996+1.;vec2 q=uv+vec2(cos(an),sin(an))*r*u_px;q=wr?fract(q):clamp(q,0.,1.);vec3 v=T(q).rgb;
   float w=step(length(v-c0),u_p2*.8);a+=w*v;ws+=w;}
  vec3 o=a/max(ws,1.);float lv=6.+(1.-u_p2)*18.;o=mix(o,floor(o*lv+.5)/lv,.35);return vec4(o,1.);`],
  'Ed Harvey pack, approx. (no published source): True Blur = Gaussian blur done in linear light (sRGB decoded, separable, sigma = Radius/2) so bright details keep their energy instead of greying, Tileable wraps the image edges (the tiling option of the plug-in); Simplify = colour-tolerance smoothing: two passes of a 96-sample disc average over only those neighbours within Tolerance of the centre colour (sigma filter), with slight level flattening, giving flat simplified regions with kept edges');

f = add('Distort');
f('q25_gravity','Gravity (MadJik)',[S('Background',['Auto (corner colour)','White','Black']),P('Tolerance',0,1,.18,.01),P('Fall',0,100,100,1,'%'),S('Direction',['Down','Up'])],
  `int bm=int(u_p0+.5);vec3 bg=bm==1?vec3(1.):bm==2?vec3(0.):(O(vec2(.01,.01)).rgb+O(vec2(.99,.01)).rgb+O(vec2(.01,.99)).rgb+O(vec2(.99,.99)).rgb)*.25;
 bool up=u_p3>.5;float H=u_res.y;float yo=floor(uv.y*H);if(up)yo=H-1.-yo;float stp=max(1.,ceil(H/1200.));float fl=u_p2/100.;float k=0.;
 for(int i=0;i<1200;i++){float s=float(i)*stp;if(s>=H)break;float sy=up?H-1.-s:s;vec3 v=O(vec2(uv.x,(sy+.5)/H)).rgb;
  if(length(v-bg)>u_p1){float t=s-fl*(s-k*stp);if(abs(t-yo)<=.5*stp)return vec4(v,1.);if(t>yo+stp)break;k+=1.;}}
 return vec4(bg,1.);`,
  'MadJik Gravity (Paint.NET, approx. from its description "objects pulled down by gravity"): pixels that differ from the background colour (Tolerance) fall down their column and pile up from the bottom in their original order; Fall < 100 % moves each pixel only part of the way (s\' = s - Fall (s - rank)); the plug-in uses transparency, here the background is keyed by colour (corner average, white or black)');

f = add('Paint');
f('q25_pdn_lines','Seismograph (Ed Harvey) / Cobweb (Red ochre)',[S('Style',['Seismograph (Ed Harvey)','Cobweb (Red ochre)']),P('Spacing',3,40,8,.5,'px'),P('Amplitude',0,3,1,.01),P('Line width',.3,4,.9,.1,'px')],
  `int m=int(u_p0+.5);vec2 P=PX(uv);float sp=u_p1;float lw=u_p3*.5;
 if(m==0){float d=1e9;float j0=floor(P.y/sp);
  for(int k=-2;k<=2;k++){float j=j0+float(k);float y0=(j+.5)*sp;
   float dk0=1.-luma(O(clamp(fromPX(vec2(P.x,y0)),0.,1.)).rgb),dk1=1.-luma(O(clamp(fromPX(vec2(P.x+1.,y0)),0.,1.)).rgb);
   float f0=u_p2*sp*1.5*pow(dk0,1.5)*(.5*sin(P.x*.8+j*3.7)+.9*(vnoise(vec2(P.x*.22,j*7.3))-.5));
   float f1=u_p2*sp*1.5*pow(dk1,1.5)*(.5*sin((P.x+1.)*.8+j*3.7)+.9*(vnoise(vec2((P.x+1.)*.22,j*7.3))-.5));
   d=min(d,abs(P.y-y0-f0)/sqrt(1.+(f1-f0)*(f1-f0)));}
  float ln=1.-smoothstep(lw-.5,lw+.6,d);return vec4(mix(vec3(.97,.96,.92),vec3(.08,.08,.12),ln),1.);}
 float cs=sp*3.5;vec2 g=floor(P/cs);float d=1e9;float Ls=cs*1.6*max(u_p2,.05);
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 cc=g+vec2(float(i),float(j));vec2 s=(cc+vec2(hash(cc+.31),hash(cc+7.7)))*cs;vec2 su=clamp(fromPX(s),0.,1.);
  vec2 e=fromPX(vec2(3.));vec2 gr=vec2(luma(O(su+vec2(e.x,0.)).rgb)-luma(O(su-vec2(e.x,0.)).rgb),luma(O(su+vec2(0.,e.y)).rgb)-luma(O(su-vec2(0.,e.y)).rgb));
  vec2 dr=length(gr)>1e-4?normalize(gr):vec2(1.,0.);vec2 tg=vec2(-dr.y,dr.x);float l1=Ls*(.5+hash(cc+2.2)),l2=Ls*(.5+hash(cc+4.4));
  d=min(d,length(P-s-dr*clamp(dot(P-s,dr),-l1,l1)));d=min(d,length(P-s-tg*clamp(dot(P-s,tg),-l2,l2)));}
 float ln=1.-smoothstep(lw-.5,lw+.6,d);vec3 c0=O(uv).rgb;return vec4(mix(c0*.6,vec3(.95,.95,.92),ln*.7),1.);`,
  'approx. from the forum descriptions: Ed Harvey Seismograph = rows of seismograph traces every Spacing px whose jittery oscillation amplitude follows the darkness of the image under the line (curves drawn by distance to the trace); Red ochre Cobweb = "works out the direction of the tone gradient then randomly draws tangents and radiuses": random seed points each emit a segment along the luminance gradient (radius) and one across it (tangent), drawn as light threads over the darkened image', 0);

f = add('Color');
f('q25_pdn_color','Psychocolour (Red ochre) / Change Extreme Colors (MadJik)',[S('Effect',['Psychocolour (Red ochre)','Change Extreme Colors (MadJik)']),P('Amount',0,1,.5,.01),P('Range',.01,.5,.15,.01),S('Extremes',['Darkest','Brightest','Both'])],
  `int m=int(u_p0+.5);vec3 c0=c.rgb;
 if(m==0){float k=1.+u_p1*5.;vec3 ps=.5+.5*sin(6.2831853*(c0.gbr*k+vec3(0.,.333,.667))+luma(c0)*6.2831853*u_p1);return vec4(mix(c0,ps,clamp(u_p1*1.4,0.,1.)),1.);}
 int ex=int(u_p3+.5);vec3 lo=1.-smoothstep(u_p2*.7,u_p2,c0),hi=smoothstep(1.-u_p2,1.-u_p2*.7,c0);vec3 sel=ex==0?lo:ex==1?hi:max(lo,hi);
 vec3 tgt=ex==1?vec3(1.)-c0*vec3(.2,.9,.5):ex==0?vec3(1.)-c0-vec3(.1,.5,.0):1.-c0;tgt=clamp(mix(c0,tgt,u_p1*2.),0.,1.);
 return vec4(mix(c0,tgt,sel),1.);`,
  'approx. from the forum descriptions: Red ochre Psychocolour = single-slider psychedelic recolouring, each channel replaced by a sinusoid of a rotated channel and the luminance (cycle count grows with Amount); MadJik Change Extreme Colors = only the extreme channel values (darkest, brightest or both, within Range of 0 / 1 per channel, soft edge) are changed, pushed toward inverted / shifted colours by Amount');

f = add('Stylize');
f('q25_objedge','Object Edge (Red ochre)',[S('Mode',['Outline','Bevel','Edge and middle colours']),P('Width',1,40,8,1,'px'),P('Tolerance',0,1,.15,.01),S('Background',['Auto (corner colour)','White','Black'])],
  `int bm=int(u_p3+.5);vec3 bg=bm==1?vec3(1.):bm==2?vec3(0.):(O(vec2(.01,.01)).rgb+O(vec2(.99,.01)).rgb+O(vec2(.01,.99)).rgb+O(vec2(.99,.99)).rgb)*.25;
 vec3 c0=O(uv).rgb;if(length(c0-bg)<=u_p2)return vec4(c0,1.);float W=u_p1;float dmin=W;vec2 dir=vec2(0.);
 for(int a=0;a<16;a++){float an=float(a)*.392699;vec2 v=vec2(cos(an),sin(an));for(int k=1;k<=12;k++){float r=W*float(k)/12.;if(r>=dmin)break;vec2 q=uv+fromPX(v*r);
  bool out_=q.x<0.||q.y<0.||q.x>1.||q.y>1.||length(O(clamp(q,0.,1.)).rgb-bg)<=u_p2;if(out_){dmin=r;dir=v;break;}}}
 float t=clamp(dmin/W,0.,1.);int m=int(u_p0+.5);
 if(m==0)return vec4(mix(vec3(0.),c0,smoothstep(.45,.6,t)),1.);
 if(m==1){float sh=dot(-dir,normalize(vec2(-1.,1.)))*(1.-t);return vec4(clamp(c0+sh*.55,0.,1.),1.);}
 return vec4(mix(c0*.25,mix(c0,vec3(1.),.6),t),1.);`,
  'Red ochre Object Edge (approx.: the plug-in works on the layer alpha): the object = pixels farther than Tolerance from the background colour; the distance to the nearest background pixel (16 directions x 12 steps up to Width) colours the edge band (Outline: black band), shades it like a bevel lit from the upper left, or grades from a dark edge colour to a light middle colour');

f = add('Color');
f('q25_hsvkey','HSV Hold / HSV Key (FFmpeg hsvhold / hsvkey)',[S('Mode',['hsvhold','hsvkey over checker','hsvkey alpha matte']),P('Hue',-360,360,30,1,'deg'),P('Saturation',-1,1,.35,.01),P('Similarity',.001,1,.08,.001)],
  Q25_YUV + `vec3 c0=O(uv).rgb;float uf=Q25U(c0),vf=Q25V(c0);float hk=(u_p1>0.?1.:-1.)*3.14159265*mod(526.-abs(u_p1),360.)/180.;float sk=u_p2,vk=-.5;
 float hue=hk<0.?-hk:atan(uf,vf)+3.14159265;float sat=sk<0.?-sk:sqrt((uf*uf+vf*vf)/(.25*2.));float val=-vk;
 hk=abs(hk);sk=abs(sk);vk=abs(vk);
 float df=sqrt(max(sat*sat*val*val+sk*sk*vk*vk-2.*sat*val*sk*vk*cos(hk-hue)+(val-vk)*(val-vk),0.));float tk=df<u_p3?0.:1.;
 int m=int(u_p0+.5);if(m==0){float Y=Q25Y(c0);float fc=1.-tk;return vec4(clamp(Q25RGB(Y,uf*fc,vf*fc),0.,1.),1.);}
 if(m==2)return vec4(vec3(tk),1.);return vec4(mix(Q25CHK(PX(uv)),c0,tk),1.);`,
  'FFmpeg vf_hsvkey.c: pixel hue = atan2(U, V) + pi, sat = |UV| / (half sqrt 2), key hue = sign(h) pi mod(526 - |h|, 360) / 180 (a non-positive Hue disables the hue test), diff = sqrt(s^2 v^2 + sk^2 vk^2 - 2 s v sk vk cos(hk - h) + (v - vk)^2), keyed when diff < similarity (blend 0); hsvhold keeps colour only for matching pixels (chroma of the rest set to 0), hsvkey makes matching pixels transparent (shown over a checkerboard or as the alpha matte); val fixed at -0.5 (brightness ignored), BT.601 YUV');

f('q25_lumakey','Luma Key (FFmpeg lumakey)',[P('Threshold',0,1,.9,.01),P('Tolerance',0,1,.12,.005),P('Softness',0,1,.08,.01),S('Show',['Over checker','Alpha matte'])],
  Q25_YUV + `vec3 c0=O(uv).rgb;float Y=Q25Y(c0);float b=u_p0-u_p1,w=u_p0+u_p1,so=u_p2;float a=1.;
 if(Y>=b&&Y<=w)a=0.;else if(so>0.&&Y>b-so&&Y<w+so)a=Y<b?1.-(Y-b+so)/so:(Y-w)/so;
 if(u_p3>.5)return vec4(vec3(a),1.);return vec4(mix(Q25CHK(PX(uv)),c0,a),1.);`,
  'FFmpeg vf_lumakey.c: black = threshold - tolerance, white = threshold + tolerance; luma inside [black, white] -> alpha 0, within softness outside -> linear ramp, else opaque (BT.601 luma); shown over a checkerboard or as the matte');

f('q25_chromashift','Chroma Shift (FFmpeg chromashift)',[P('Cb horizontal',-60,60,6,1,'px'),P('Cb vertical',-60,60,0,1,'px'),P('Cr horizontal',-60,60,-6,1,'px'),P('Cr vertical',-60,60,0,1,'px')],
  Q25_YUV + `vec3 c0=O(uv).rgb;vec2 qb=clamp(uv-fromPX(vec2(u_p0,-u_p1)),0.,1.),qr=clamp(uv-fromPX(vec2(u_p2,-u_p3)),0.,1.);
 float Y=Q25Y(c0),U=Q25U(O(qb).rgb),V=Q25V(O(qr).rgb);return vec4(clamp(Q25RGB(Y,U,V),0.,1.),1.);`,
  'FFmpeg vf_chromashift.c (edge = smear): out Cb(x, y) = in Cb(clip(x - cbh), clip(y - cbv)), Cr likewise with crh / crv, luma untouched (positive = right / down); BT.601 YCbCr');

f('q25_swaprect','Swap Rectangles (FFmpeg swaprect)',[P('Width',1,50,25,1,'%'),P('Height',1,50,30,1,'%'),P('Rect A X',0,100,10,1,'%'),P('Rect A Y',0,100,12,1,'%')],
  `vec2 p=vec2(uv.x,1.-uv.y);vec2 wh=vec2(u_p0,u_p1)/100.;vec2 a=vec2(u_p2,u_p3)/100.;a=min(a,1.-wh);vec2 b=1.-a-wh;
 bool inA=all(greaterThanEqual(p,a))&&all(lessThan(p,a+wh)),inB=all(greaterThanEqual(p,b))&&all(lessThan(p,b+wh));
 vec2 s=p;if(inB)s=p-b+a;else if(inA)s=p-a+b;return vec4(O(vec2(s.x,1.-s.y)).rgb,1.);`,
  'FFmpeg vf_swaprect.c: rectangle A (w x h at x1, y1, top-left origin) and rectangle B are swapped (A copied to B, B to A; on overlap B wins as in the copy order); here B is placed point-symmetric to A (x2 = W - x1 - w, y2 = H - y1 - h) to fit 4 parameters');

f('q25_fillborders','Fill Borders (FFmpeg fillborders)',[S('Mode',['smear','mirror','fixed (black)','reflect','wrap','fade','margins']),P('Left and right',0,200,40,1,'px'),P('Top and bottom',0,200,40,1,'px')],
  `int m=int(u_p0+.5);vec2 Wd=u_res;float Lx=floor(R(u_p1)),Ty=floor(R(u_p2));Lx=min(Lx,floor(Wd.x*.45));Ty=min(Ty,floor(Wd.y*.45));
 vec2 q=floor(vec2(uv.x,1.-uv.y)*Wd);
 #define Q25AT(pp) O(vec2(((pp).x+.5)/Wd.x,1.-((pp).y+.5)/Wd.y)).rgb
 vec3 o=Q25AT(q);bool bx=q.x<Lx||q.x>=Wd.x-Lx,by=q.y<Ty||q.y>=Wd.y-Ty;if(!bx&&!by)return vec4(o,1.);
 if(m==2)return vec4(0.,0.,0.,1.);
 if(m==5){float f=0.;if(q.y<Ty)f=max(f,(Ty-q.y)/Ty);if(q.y>=Wd.y-Ty)f=max(f,(q.y-(Wd.y-Ty))/Ty);float fx=0.;if(q.x<Lx)fx=(Lx-q.x)/Lx;if(q.x>=Wd.x-Lx)fx=(q.x-(Wd.x-Lx))/Lx;
  o=mix(o,vec3(0.),f);o=mix(o,vec3(0.),fx);return vec4(o,1.);}
 vec2 s=q;
 if(m==0||m==6){s=clamp(q,vec2(Lx,Ty),Wd-vec2(Lx,Ty)-1.);}
 else if(m==1){if(q.x<Lx)s.x=2.*Lx-1.-q.x;if(q.x>=Wd.x-Lx)s.x=2.*(Wd.x-Lx)-1.-q.x;if(q.y<Ty)s.y=2.*Ty-1.-q.y;if(q.y>=Wd.y-Ty)s.y=2.*(Wd.y-Ty)-1.-q.y;}
 else if(m==3){if(q.x<Lx)s.x=2.*Lx-q.x;if(q.x>=Wd.x-Lx)s.x=2.*(Wd.x-Lx)-2.-q.x;if(q.y<Ty)s.y=2.*Ty-q.y;if(q.y>=Wd.y-Ty)s.y=2.*(Wd.y-Ty)-2.-q.y;}
 else if(m==4){if(q.x<Lx)s.x=q.x+Wd.x-2.*Lx;if(q.x>=Wd.x-Lx)s.x=q.x-(Wd.x-2.*Lx);if(q.y<Ty)s.y=q.y+Wd.y-2.*Ty;if(q.y>=Wd.y-Ty)s.y=q.y-(Wd.y-2.*Ty);}
 s=clamp(s,vec2(0.),Wd-1.);
 if(m==6&&by){float k=q.y<Ty?Ty-q.y:q.y-(Wd.y-Ty-1.);float sg=sqrt(.75*k);float st=max(1.,3.*sg/24.);vec3 a=vec3(0.);float ws=0.;
  for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>3.*sg+.5)continue;float w=exp(-.5*x*x/max(sg*sg,.01));vec2 ss=vec2(clamp(s.x+x,Lx,Wd.x-Lx-1.),s.y);a+=w*Q25AT(ss);ws+=w;}
  return vec4(a/ws,1.);}
 return vec4(Q25AT(s),1.);`,
  'FFmpeg vf_fillborders.c, same sizes left/right and top/bottom: smear (edge pixel repeated), mirror (2L - 1 - x), fixed (black), reflect (2L - x), wrap (opposite side), fade (lerp toward black with the distance into the border, rows then columns), margins (rows smeared from the edge pixel; top/bottom rows = the edge row blurred by the (3,2,3)/8 kernel once per row of distance, approx. as a Gaussian of variance 0.75 k)');

const Q25_DF = k => `if(${k}.>=u_p1)return T(uv);vec3 p=T(uv).rgb;vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;s+=T(uv+vec2(float(i),float(j))*u_px).rgb;}s/=8.;
 vec3 o=u_p0<.5?max(min(s,p),p-u_p2):min(max(s,p),p+u_p2);return vec4(o,1.);`;
f = add('Noise');
f('q25_deflate','Deflate / Inflate (FFmpeg)',[S('Operation',['Deflate','Inflate']),P('Iterations',1,8,2,1),P('Threshold',0,1,1,.01)],
  Array(8).fill(0).map((_, k) => Q25_DF(k)),
  'FFmpeg vf_neighbor.c deflate / inflate per channel: avg = mean of the 8 neighbours; deflate out = max(min(avg, p), p - threshold) (only darker neighbours count), inflate out = min(max(avg, p), p + threshold); repeated Iterations times');

f = add('Analysis');
f('q25_datascope','Data Scope / Pixel Scope (FFmpeg datascope / pixscope)',[S('Scope',['datascope color2 (hex)','datascope mono (hex)','datascope color2 (decimal)','pixscope']),P('X',0,100,50,1,'%'),P('Y',0,100,45,1,'%'),P('Zoom',1,4,2,1)],
  `const int FN[16]=int[16](${Q25_FONT.join(',')});int md=int(u_p0+.5);float z=u_p3;vec2 S_=u_res/u_k;vec2 P=vec2(PX(uv).x,S_.y-PX(uv).y);
 #define Q25PX(pp) O(vec2(((pp).x+.5)/u_res.x,1.-((pp).y+.5)/u_res.y)).rgb
 #define Q25GL(dg,gx,gy) (((FN[(dg)]>>((4-(gy))*3+(2-(gx))))&1)==1)
 if(md<=2){float nch=md==2?3.:2.;float cw=(nch*4.+2.)*z,chh=20.*z;vec2 ci=floor(P/vec2(cw,chh));vec2 base=floor(vec2(u_p1,u_p2)/100.*u_res);vec2 spx=base+ci;
  if(spx.x>=u_res.x||spx.y>=u_res.y)return vec4(0.,0.,0.,1.);vec3 pc=Q25PX(spx);vec2 lq=P-ci*vec2(cw,chh)-z;
  float row=floor(lq.y/(6.*z)),chn=floor(lq.x/(4.*z));vec2 g=floor((lq-vec2(chn*4.*z,row*6.*z))/z);bool on=false;
  if(lq.x>=0.&&lq.y>=0.&&row<3.&&chn<nch&&g.x<3.&&g.y<5.){int iv=int(floor((row<.5?pc.r:row<1.5?pc.g:pc.b)*255.+.5));int dg;
   if(md!=2)dg=chn<.5?iv/16:iv-16*(iv/16);else dg=chn<.5?iv/100:chn<1.5?iv/10-10*(iv/100):iv-10*(iv/10);on=Q25GL(dg,int(g.x),int(g.y));}
  vec3 bgc=md==1?vec3(0.):pc,fgc=md==1?vec3(1.):(luma(pc)>.5?vec3(0.):vec3(1.));return vec4(on?fgc:bgc,1.);}
 vec2 pt=floor(vec2(u_p1,u_p2)/100.*(u_res-1.));float cs=10.*z;float bw=7.*cs,bh=7.*cs+22.*z;
 vec2 o=vec2(pt.x/u_res.x<.5?S_.x-bw-8.:8.,pt.y/u_res.y<.5?S_.y-bh-8.:8.);vec2 lq=P-o;vec3 img=O(uv).rgb;
 if(lq.x>=0.&&lq.y>=0.&&lq.x<bw&&lq.y<bh){
  if(lq.y<7.*cs){vec2 cl=floor(lq/cs);vec3 v=Q25PX(clamp(pt+cl-3.,vec2(0.),u_res-1.));vec2 fq=lq-cl*cs;float gl=step(min(fq.x,fq.y),.8);
   if(cl.x==3.&&cl.y==3.&&min(min(fq.x,fq.y),min(cs-fq.x,cs-fq.y))<1.5*z)return vec4(1.,1.,1.,1.);return vec4(mix(v,vec3(.15),gl),1.);}
  vec2 tq=lq-vec2(z,7.*cs+2.*z);float row=floor(tq.y/(6.*z)),chn=floor(tq.x/(4.*z));vec2 g=floor((tq-vec2(chn*4.*z,row*6.*z))/z);
  vec3 bgx=mix(img,vec3(0.),.5);if(tq.x<0.||tq.y<0.||row>2.||chn>10.||g.x>2.||g.y>4.||chn==3.||chn==7.)return vec4(bgx,1.);
  vec3 mn=vec3(1.),mx=vec3(0.),av=vec3(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec3 v=Q25PX(clamp(pt+vec2(float(i),float(j)),vec2(0.),u_res-1.));mn=min(mn,v);mx=max(mx,v);av+=v/49.;}
  vec3 sel=chn<3.?av:chn<7.?mn:mx;float ch_=row<.5?sel.r:row<1.5?sel.g:sel.b;int iv=int(floor(ch_*255.+.5));float pos=mod(chn,4.);
  int dg=pos<.5?iv/100:pos<1.5?iv/10-10*(iv/100):iv-10*(iv/10);vec3 tc=row<.5?vec3(1.,.45,.45):row<1.5?vec3(.45,1.,.45):vec3(.55,.65,1.);
  return vec4(Q25GL(dg,int(g.x),int(g.y))?tc:bgx,1.);}
 vec2 qa=vec2(uv.x*u_res.x,(1.-uv.y)*u_res.y);vec2 dd=abs(qa-(pt+.5))-3.5;float e=abs(max(dd.x,dd.y));if(max(dd.x,dd.y)<1.5&&e<1.5*u_k)return vec4(vec3(1.)-img,1.);
 return vec4(img,1.);`,
  'FFmpeg vf_datascope.c datascope: a grid of cells, one per source pixel starting at X/Y (top-left), each showing the R, G, B values as hex (or decimal) digits (color2: cell filled with the pixel colour, contrasting text; mono: white on black); pixscope: a 7 x 7 window around X/Y shown magnified in a box on the opposite side (centre pixel outlined) with average / min / max per channel below and the sampled window outlined on the image; 3x5 digit font');

f = add('Tone');
f('q25_on1_tone','ON1 Tone Enhancer / HDR Look / Antique',[S('Filter',['Tone Enhancer (ON1)','HDR Look (ON1)','Antique (ON1)']),P('Amount',0,1,.6,.01),P('Detail',0,1,.5,.01),P('Radius',2,60,18,1,'px')],
  [BH('u_p3'), BV('u_p3'),
   `vec3 c0=O(uv).rgb;vec3 b=T(uv).rgb;float L=luma(c0),Lb=luma(b);int m=int(u_p0+.5);float A=u_p1,Dt=u_p2;
 if(m==0){float sh=A*.28*(1.-smoothstep(0.,.55,Lb)),hi=-A*.22*smoothstep(.5,1.,Lb);float st=Dt*1.6*(L-Lb)*(1.-abs(2.*L-1.)*.6);
  float Ln=L+sh*(1.-L)+hi*L+st;Ln=mix(Ln,Ln*Ln*(3.-2.*Ln),A*.35);vec3 o=c0*(Ln/max(L,1e-3));o=mix(vec3(luma(o)),o,1.+A*.15);return vec4(clamp(o,0.,1.),1.);}
 if(m==1){float comp=Lb*A*.65;float Ln=L-comp+.33*A+Dt*3.*(L-Lb);Ln=Ln/(1.+max(Ln-1.,0.));float g=clamp(Ln,0.,1.2)/max(L,1e-3);vec3 o=c0*g;
  float s=max(o.r,max(o.g,o.b))-min(o.r,min(o.g,o.b));o=mix(vec3(luma(o)),o,1.+A*.45*(1.-s));o=o/(1.+max(max(o.r,max(o.g,o.b))-1.,0.));return vec4(clamp(o,0.,1.),1.);}
 vec3 s=mix(c0,b,Dt*.5);float Ls=luma(s);vec3 tone=mix(vec3(.17,.10,.05),vec3(1.,.92,.74),Ls);vec3 o=mix(s,tone*mix(.85,1.08,Ls),A*.85);
 o=mix(vec3(.09,.07,.05),vec3(.93,.89,.80),o);vec2 d=(uv-.5)*vec2(asp(),1.);o*=1.-Dt*.55*smoothstep(.3,.95,length(d));return vec4(clamp(o,0.,1.),1.);`],
  'ON1 Effects filter looks (approx.: ON1 publishes no formulas): Tone Enhancer = shadow lift / highlight recovery from a Radius-blurred luminance + midtone structure (Detail) + contrast and slight saturation; HDR Look = local tone compression (luminance minus a share of its blur) + strong detail boost + vibrance + soft highlight roll-off (the HDR halo comes from the blur Radius); Antique = softened (Detail), brown-sepia toned with Amount, faded blacks / dulled whites, vignette');

f = add('Stylize');
f('q25_on1_weather','ON1 Weather (rain / snow / fog)',[S('Weather',['Rain','Snow','Fog','Rain and fog','Snow and fog']),P('Amount',0,1,.5,.01),P('Fog height',0,1,.6,.01),P('Angle',-45,45,12,1,'deg')],
  `int m=int(u_p0+.5);vec3 c0=O(uv).rgb;vec2 P=PX(uv);float A=u_p1;vec3 o=c0;bool rain=m==0||m==3,snow=m==1||m==4,fog=m>=2;
 if(rain||snow){o=mix(o,vec3(luma(o))*vec3(.92,.95,1.),.25*A);o*=1.-.12*A;}
 if(fog){float y=uv.y;float n=fbm(vec2(P.x*.006,P.y*.012)+u_seed*3.1);float fd=A*(1.-smoothstep(0.,max(u_p2,.05),y-(n-.5)*.18))*(.65+.5*n);o=mix(o,vec3(.86,.88,.9),clamp(fd,0.,.95));}
 float an=radians(u_p3);mat2 rt=mat2(cos(an),sin(an),-sin(an),cos(an));
 if(rain){float acc=0.;for(int l=0;l<3;l++){float sc=3.+float(l)*2.5;vec2 q=rt*P;vec2 cell=vec2(sc,sc*9.);vec2 g=floor(q/cell);vec2 f=q-g*cell;float h=hash(g+float(l)*17.3+u_seed);
   if(h<A*.85){vec2 c=vec2(hash(g+3.1)*cell.x,hash(g+5.7)*cell.y);float ln=cell.y*(.35+.4*hash(g+9.));vec2 d=f-c;float t=clamp(d.y,-ln*.5,ln*.5);float dist=length(d-vec2(0.,t));
    acc+=(1.-smoothstep(.3,.9+float(l)*.3,dist))*(.35+.25*float(l))*(1.-abs(t)/(ln*.5)*.6);}}
  o=mix(o,vec3(.88,.9,.95),clamp(acc,0.,1.)*.7);}
 if(snow){float acc=0.;for(int l=0;l<3;l++){float sc=14.+float(l)*12.;vec2 q=rt*P+vec2(0.,float(l)*37.);vec2 g=floor(q/sc);vec2 f=q-g*sc;float h=hash(g+float(l)*11.1+u_seed);
   if(h<A*.9){vec2 c=vec2(hash(g+1.3),hash(g+4.9))*sc;float rr=(.8+float(l)*1.1)*(.6+.6*hash(g+8.));float d=length(f-c);acc+=1.-smoothstep(rr*.4,rr,d);}}
  o=mix(o,vec3(.97,.98,1.),clamp(acc,0.,1.)*.9);}
 return vec4(clamp(o,0.,1.),1.);`,
  'ON1 Weather filter (approx.: "overlay precipitation textures, place fog, fine-tune with sliders"): procedural rain streaks (3 depth layers, slanted by Angle) or snow flakes (3 sizes) over a slightly darkened, cooled scene, and/or a ground fog rising to Fog height with fbm density; Amount sets the precipitation density and fog opacity', 1);
