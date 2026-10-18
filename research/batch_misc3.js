/* ================= misc3: dot diffusion, retro display sims, film looks, emoji mosaic, tone mapping (Kim-Kautz, iCAM06 simplified, Hable piecewise), CAM16-UCS ================= */
f = add('Retro');
const MISC_DDH = `int KN[64]=int[64](34,48,40,32,29,15,23,31,42,58,56,53,21,5,7,10,50,62,61,45,13,1,2,18,38,46,54,37,25,17,9,26,28,14,22,30,35,49,41,33,20,4,6,11,43,59,57,52,12,0,3,19,51,63,60,44,24,16,8,27,39,47,55,36);
  float cs=max(R(u_p1),1.);vec2 cp=floor(uv*u_res/cs);float nq=u_p0-1.;
  #define CL(p_) KN[int(mod((p_).y,8.))*8+int(mod((p_).x,8.))]
  #define CUV(p_) (((p_)+.5)*cs/u_res)
  #define QZ(v_) clamp(floor((v_)*nq+.5)/nq,0.,1.)
  `;
const MISC_DDV = `vec3 v0=O(CUV(cp)).rgb;vec2 ex=vec2(cs,0.)/u_res,ey=vec2(0.,cs)/u_res;v0+=u_p3*(4.*v0-O(CUV(cp)+ex).rgb-O(CUV(cp)-ex).rgb-O(CUV(cp)+ey).rgb-O(CUV(cp)-ey).rgb)*.5;if(u_p2<.5)v0=vec3(luma(v0));`;
f('dotdiffusion','Dot Diffusion (Knuth)',[P('Levels',2,8,2,1),P('Pixel size',1,8,1,1,'px'),S('Color',['Mono','Color']),P('Pre-sharpen',0,2,.5,.05)],
  [`${MISC_DDH}${MISC_DDV}return vec4(.25+clamp(v0,-.5,1.5)*.5,1.);`,
   ...Array(64).fill(0).map((_, k) => `${MISC_DDH}if(CL(cp)!=${k})return T(uv);${MISC_DDV}vec3 v=v0;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;vec2 d=vec2(float(i),float(j));vec2 np=cp+d;int cn=CL(np);if(cn>=${k})continue;
     vec3 vn=(T(CUV(np)).rgb-.25)*2.;vec3 en=vn-QZ(vn);float W=0.;for(int b=-1;b<=1;b++)for(int a=-1;a<=1;a++){if(a==0&&b==0)continue;if(CL(np+vec2(float(a),float(b)))>cn)W+=(a==0||b==0)?2.:1.;}
     v+=en*((i==0||j==0)?2.:1.)/max(W,1.);}
    return vec4(.25+clamp(v,-.5,1.5)*.5,1.);`),
   `${MISC_DDH}vec3 v=(T(CUV(cp)).rgb-.25)*2.;return vec4(QZ(v),1.);`],
  'Knuth 1987: 8×8 class matrix, pixels quantised class by class (64 passes), error spread to not-yet-processed neighbours (orthogonal weight 2, diagonal 1); optional pre-sharpening');
f('fieldblend','Interlaced Field Blend',[P('Motion X',-40,40,10,.5,'px'),P('Motion Y',-20,20,0,.5,'px'),S('Mode',['Field blend (deinterlaced)','Combing (raw interlaced frame)','Bob (one field, line-doubled)']),P('Line height',1,6,2,1,'px')],
  `float lh=max(R(u_p3),1.);float ly=uv.y*u_res.y/lh;vec2 m=vec2(u_p0,-u_p1)*u_k*u_px*.5;
  #define FLD(o_,s_) mix(T(vec2(uv.x,(2.*floor((ly-(o_))/2.)+(o_))*lh/u_res.y)+(s_)).rgb,T(vec2(uv.x,(2.*floor((ly-(o_))/2.)+(o_)+2.)*lh/u_res.y)+(s_)).rgb,fract((ly-(o_))/2.))
  int md=int(u_p2+.5);vec3 A=FLD(.5,-m),Bf=FLD(1.5,m);if(md==2)return vec4(A,1.);
  if(md==1){bool ev=mod(floor(ly),2.)<.5;return vec4(ev?T(uv-m).rgb:T(uv+m).rgb,1.);}return vec4((A+Bf)*.5,1.);`,'static simulation: two fields captured with a motion offset between them, then blend / weave / bob deinterlacing (no real video fields)');
f('lcdghost','Handheld LCD Ghosting',[P('Motion X',-30,30,3,.5,'px'),P('Motion Y',-30,30,0,.5,'px'),P('Persistence',0,.95,.65,.01),S('Response',['Symmetric','Slow dark→light rise','Slow light→dark fall'])],
  `vec2 m=vec2(u_p0,-u_p1)*u_k*u_px;vec3 cur=T(uv).rgb;int md=int(u_p3+.5);vec3 acc=vec3(0.),tw=vec3(0.);
  for(int k=0;k<24;k++){vec3 s=T(uv-m*float(k)).rgb;vec3 wv=vec3(k==0?1.:pow(u_p2,float(k)));if(k>0&&md==1)wv*=mix(vec3(.4),vec3(2.),step(s,cur));if(k>0&&md==2)wv*=mix(vec3(.4),vec3(2.),step(cur,s));acc+=s*wv;tw+=wv;}
  return vec4(acc/tw,1.);`,'static simulation of slow LCD pixel response: each pixel = exponentially weighted history of an assumed uniform pan (real ghosting needs previous frames)');
f = add('Film');
f('redscale','Redscale Film',[P('Exposure',-2,2,.3,.05,'EV'),P('Colour retention',0,1,.25,.01),P('Grain',0,1,.3,.01)],
  `vec3 x=pow(max(c.rgb,0.),vec3(2.2))*exp2(u_p0);float e=dot(x,vec3(.45,.42,.13));float d=1.-exp(-e*2.4);
  vec3 col=stops5(vec3(.05,.01,.0),vec3(.4,.05,.02),vec3(.76,.2,.04),vec3(.96,.52,.13),vec3(1.,.88,.6),clamp(d,0.,1.));
  col*=1.+(c.rgb-vec3(luma(c.rgb)))*u_p1*1.6;float gr=(hash(floor(PX(uv)*u_k))-.5)*u_p2*.16*(1.-abs(d-.5));return vec4(clamp(col+gr,0.,1.),1.);`,'film loaded backwards: exposure through the base reaches the red-sensitive layer first — red / orange / yellow monochrome with crushed blues',1);
f('gateweave','Film Gate Weave',[P('Weave',0,20,4,.1,'px'),P('Rotation',0,2,.3,.01,'°'),P('Softness',0,8,1.5,.1,'px'),S('Frame edge',['Black gate edge','Clamp edges'])],
  `vec2 off=(vec2(hash(vec2(1.7,3.3)),hash(vec2(5.1,.9)))-.5)*2.*R(u_p0);float an=(hash(vec2(2.2,7.7))-.5)*2.*radians(u_p1);
  vec2 p=(uv-.5)*vec2(asp(),1.);p=rot(p,an);vec2 q=p/vec2(asp(),1.)+.5-off*u_px;vec2 dir=length(off)>1e-4?normalize(off):vec2(0.,1.);
  vec3 acc=vec3(0.);float ws=0.;for(int k=-6;k<=6;k++){float t=float(k)/6.;float w=exp(-t*t*2.);vec2 s=q+dir*t*R(u_p2)*u_px;vec3 v=T(clamp(s,0.,1.)).rgb;if(u_p3<.5){vec2 b=min(s,1.-s)*u_res;v*=smoothstep(-1.,1.5,min(b.x,b.y));}acc+=v*w;ws+=w;}
  return vec4(acc/ws,1.);`,'one frame of projector / camera gate weave: random (seeded) sub-frame offset and tilt, directional softness, exposed gate edge — static frame only',1);
f = add('Stylize');
f('emojimosaic','Emoji Mosaic (procedural glyphs)',[P('Cell size',8,64,20,1,'px'),S('Background',['White','Black','Cell colour']),P('Tint to cell colour',0,1,.2,.01)],
  `float S=R(u_p0);vec2 gp=uv*u_res/S;vec2 cp=floor(gp);vec2 lp=fract(gp)*2.-1.;float aa=2./S*1.5;
  vec3 av=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++)av+=T((cp+(vec2(float(i),float(j))+.5)/4.)*S/u_res).rgb;av/=16.;vec3 hv=rgb2hsv(av);float h=hv.x*360.,s=hv.y,v=hv.z;
  int bgm=int(u_p1+.5);vec3 bg=bgm==0?vec3(1.):bgm==1?vec3(0.):av*.55;vec3 col=bg;
  #define PUT(sd_,c_) col=mix(col,(c_),1.-smoothstep(-aa,aa,(sd_)))
  float disc=length(lp)-.82;vec2 hl=lp-vec2(-.3,.35);float shade=1.08-.22*length(hl);
  if(v<.2){PUT(disc,vec3(.13,.13,.15)*shade+.12*smoothstep(.35,0.,length(hl)));}
  else if(s<.18){if(v>.62){float cl=min(min(length(lp-vec2(-.42,-.12))-.38,length(lp-vec2(.08,.12))-.5),min(length(lp-vec2(.5,-.16))-.34,max(abs(lp.x)-.8,abs(lp.y+.32)-.2)));PUT(cl+.02,vec3(.55,.62,.72));PUT(cl+.07,vec3(.97,.98,1.)*shade);}
   else{float mo=max(disc,-(length(lp-vec2(.38,.22))-.66));PUT(mo,vec3(.93,.84,.45)*shade);}}
  else if(h<20.||h>=330.||(h>=260.&&h<330.)){vec2 q=lp*1.25;q.y+=.12;float hf=pow(q.x*q.x+q.y*q.y-1.,3.)-q.x*q.x*q.y*q.y*q.y;vec3 hc=h>=260.&&h<330.?vec3(.62,.32,.86):vec3(.93,.12,.2);PUT(clamp(hf*2.,-1.,1.)*.2,hc*shade);}
  else if(h<45.){if(v<.55){PUT(disc,vec3(.76,.5,.26)*shade);for(int k=0;k<5;k++){vec2 dp=vec2(cos(float(k)*2.4+.5),sin(float(k)*2.4+.5))*(.2+.1*float(k-2*(k/2)))*1.5;PUT(length(lp-dp*.9)-.1,vec3(.33,.18,.08));}}
   else{PUT(disc,vec3(1.,.55,.1)*shade);PUT(length((lp-vec2(.18,.82))*vec2(1.,2.2))-.22,vec3(.3,.65,.2));}}
  else if(h<70.){PUT(disc,vec3(1.,.8,.18)*shade);PUT(length((lp-vec2(-.3,.22))*vec2(1.6,1.))-.16,vec3(.35,.2,.08));PUT(length((lp-vec2(.3,.22))*vec2(1.6,1.))-.16,vec3(.35,.2,.08));
   PUT(max(abs(length(lp-vec2(0.,.12))-.5)-.06,lp.y+.1),vec3(.35,.2,.08));}
  else if(h<170.){PUT(max(abs(lp.x)-.12,abs(lp.y+.55)-.35),vec3(.5,.3,.15));PUT(min(length(lp-vec2(0.,.22))-.58,length(lp-vec2(-.35,-.05))-.38),vec3(.25,.68,.25)*shade);PUT(length(lp-vec2(.35,-.05))-.38,vec3(.2,.6,.22)*shade);}
  else{float yy=lp.y+.28;float wd=yy>0.?.56*(1.-yy/1.12):-1.;float dr=yy>0.?abs(lp.x)-wd:length(lp-vec2(0.,-.28))-.56;PUT(dr,vec3(.3,.64,1.)*shade);PUT(length((lp-vec2(-.2,-.32))*vec2(1.,1.6))-.1,vec3(.85,.94,1.));}
  vec3 o=mix(col,col*av/max(luma(av),.05)*luma(col),u_p2);return vec4(clamp(o,0.,1.),1.);`,'cells replaced by procedurally drawn emoji-like glyphs picked by cell colour (smiley, heart, tree, droplet, cloud, cookie, orange, moon, black circle) — no emoji font');
f = add('Tone');
const MISC_LIN = v => `pow(max(${v},vec3(0.)),vec3(2.2))`;
f('kimkautz','Kim-Kautz Consistent Tone Mapping',[P('Exposure',-4,4,0,.05,'EV'),P('Contrast (c2)',.2,1.5,.9,.01),P('Gaussian width (c1)',1,6,3,.1),P('Saturation',.3,1.2,.8,.01)],
  `float mu=0.,mn=1e9,mx=-1e9;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float x=log(luma(${MISC_LIN('O((vec2(float(i),float(j))+.5)/16.).rgb')})*exp2(u_p0)+1e-4);mu+=x;mn=min(mn,x);mx=max(mx,x);}mu/=256.;
  float dr=max(mx-mn,1e-3);float k1=(log(300.)-log(.3))/dr;float sg=dr/u_p2;vec3 rgb=${MISC_LIN('c.rgb')}*exp2(u_p0);float Lw=luma(rgb)+1e-4;float xl=log(Lw);
  float w=exp(-(xl-mu)*(xl-mu)/(2.*sg*sg));float k2=(1.-k1)*w+k1;float Ld=.18*exp(u_p1*k2*(xl-mu));vec3 o=pow(rgb/Lw,vec3(u_p3))*Ld;
  return vec4(pow(clamp(o,0.,1.),vec3(1./2.2)),1.);`,'Kim & Kautz 2008: log-luminance scaled by k(x) = (1 − k1)·G(x − μ) + k1, k1 = display / scene log range (0.3–300 cd/m²), σ = range / c1; mean anchored at 18 % grey; stats from a 16×16 sample grid');
const MISC_M = `const mat3 XYZm=mat3(.4124,.3576,.1805,.2126,.7152,.0722,.0193,.1192,.9505);const mat3 RGBm=mat3(3.2406,-1.5372,-.4986,-.9689,1.8758,.0415,.0557,-.204,1.057);`;
f('icam06','iCAM06 (simplified)',[P('Exposure',-4,4,0,.05,'EV'),P('Adaptation radius',10,200,60,1,'px'),P('Contrast (p)',.55,.95,.75,.01),P('Chromatic adaptation',0,1,.3,.01)],
  [BH('u_p1'), BV('u_p1'),
   `${MISC_M}const mat3 CAT=mat3(.7328,.4296,-.1624,-.7036,1.6975,.0061,.003,.0136,.9834);const mat3 CATi=mat3(1.0961,-.2789,.1827,.4544,.4735,.0721,-.0096,-.0057,1.0153);
    const mat3 HPE=mat3(.38971,.68898,-.07868,-.22981,1.1834,.04641,0.,0.,1.);const mat3 HPEi=mat3(1.9102,-1.1121,.2019,.371,.6291,0.,0.,0.,1.);
    float ex=exp2(u_p0);vec3 rgb=${MISC_LIN('O(uv).rgb')}*ex+1e-5;float Y=luma(rgb);float l0=log(Y);float bs=0.,ws=0.;
    for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 o=vec2(float(i),float(j));float lq=log(luma(${MISC_LIN('O(uv+o*2.*u_k*u_px).rgb')})*ex+1e-5);float w=exp(-dot(o,o)/6.)*exp(-(lq-l0)*(lq-l0)/(2.*.35*.35));bs+=w*lq;ws+=w;}
    float bY=exp(bs/ws);float det=Y/bY;vec3 base=rgb/det;vec3 X=(base*100.)*XYZm;vec3 Wx=((${MISC_LIN('T(uv).rgb')}*ex+1e-4)*100.)*XYZm;
    float LA=.2*Wx.y;float D=clamp(u_p3*(1.-exp((-LA-42.)/92.)/3.6),0.,1.);vec3 Rw=Wx*CAT;vec3 Rc=(X*CAT)*(D*Wx.y/Rw+1.-D);X=Rc*CATi;
    float k=1./(5.*LA+1.),k4=k*k*k*k;float FL=.2*k4*5.*LA+.1*(1.-k4)*(1.-k4)*pow(5.*LA,1./3.);
    vec3 lms=X*HPE;vec3 q=pow(FL*abs(lms)/Wx.y,vec3(u_p2));vec3 la=400.*sign(lms)*q/(27.13+q)+.1;float qw=pow(FL*2.5,u_p2);float wa=400.*qw/(27.13+qw)+.1;
    vec3 Xo=(la/wa)*HPEi;vec3 o=Xo*RGBm;o*=pow(det,pow(FL+.8,.25));return vec4(pow(clamp(o,0.,1.),vec3(1./2.2)),1.);`],
  'simplified iCAM06 (Kuang, Johnson & Fairchild 2007): bilateral base/detail split, local CAT02 adaptation to a blurred white, Hunt-Pointer-Estevez cone compression with F_L from the local adapting luminance, detail boost (F_L+0.8)^0.25; no rod term, IPT colourfulness or surround stages; white normalised to 2.5× the local adapting white instead of a 99th-percentile clip');
f('hablepiecewise','Hable Piecewise Power Curves',[P('Exposure',-4,4,.7,.05,'EV'),P('Toe strength',0,1,.5,.01),P('Toe length',0,1,.5,.01),P('Shoulder strength',0,6,2,.05)],
  `float tS=u_p1,tL=pow(max(u_p2,.01),2.2),sS=u_p3,sL=.5;float x0=tL*.5,y0=(1.-tS)*x0;float rY=1.-y0;float iW=x0+rY;float y1o=(1.-sL)*rY;float x1=x0+y1o,y1=y0+y1o;float W=iW+exp2(sS)-1.;
  x0/=W;x1/=W;x0=max(x0,1e-4);float m=(x1-x0)<1e-6?1.:(y1-y0)/(x1-x0);float b=y0-x0*m;y0=max(y0,1e-5);y1=max(y1,1e-5);
  float tB=m*x0/y0,tA=log(y0)-tB*log(x0);float sx0=1.-x1,sy0=1.-y1;float sB=m*sx0/max(sy0,1e-5),sA=log(max(sy0,1e-5))-sB*log(max(sx0,1e-5));float inv=1.;
  vec3 xn=${MISC_LIN('c.rgb')}*exp2(u_p0)/W;vec3 o;
  for(int i=0;i<3;i++){float x=xn[i];float y;if(x<x0)y=x>0.?exp(tA+tB*log(x)):0.;else if(x<x1)y=m*x+b;else{float xx=1.-x;y=1.-(xx>0.?exp(sA+sB*log(xx)):0.);}o[i]=y;}
  return vec4(pow(clamp(o,0.,1.),vec3(1./2.2)),1.);`,'John Hable 2017 “Filmic Tonemapping with Piecewise Power Curves”: toe power segment, linear mid, shoulder power segment from toe/shoulder strength & length (white point = 2^shoulder strength), per channel');
f = add('Color');
f('cam16ucs','CAM16-UCS (J′ a′ b′)',[S('Output',['J′a′b′ as RGB','J′ lightness','a′b′ hue / colourfulness map','M′ colourfulness','Hue angle h']),P('Adapting luminance L_A',1,500,64,1,'cd/m²'),S('Surround',['Average','Dim','Dark'])],
  `${MISC_M}const mat3 M16=mat3(.401288,.650173,-.051461,-.250268,1.204414,.045854,-.002079,.048952,.953127);
  vec3 X=(${MISC_LIN('c.rgb')}*100.)*XYZm;vec3 Xw=vec3(95.047,100.,108.883);float LA=u_p1;int sr=int(u_p2+.5);float F=sr==0?1.:sr==1?.9:.8,cc=sr==0?.69:sr==1?.59:.525,Nc=F;
  float D=clamp(F*(1.-exp((-LA-42.)/92.)/3.6),0.,1.);vec3 Rw=Xw*M16;vec3 Dv=D*100./Rw+1.-D;float k=1./(5.*LA+1.),k4=k*k*k*k;float FL=.2*k4*5.*LA+.1*(1.-k4)*(1.-k4)*pow(5.*LA,1./3.);
  float n=.2,z=1.48+sqrt(n),Nbb=.725*pow(1./n,.2);
  #define PA(v_) (400.*sign(v_)*pow(FL*abs(v_)/100.,vec3(.42))/(pow(FL*abs(v_)/100.,vec3(.42))+27.13)+.1)
  vec3 wa=PA(Dv*Rw),ra=PA(Dv*(X*M16));float Aw=(2.*wa.x+wa.y+.05*wa.z-.305)*Nbb;
  float a=ra.x-12.*ra.y/11.+ra.z/11.,b=(ra.x+ra.y-2.*ra.z)/9.;float hr=atan(b,a);float et=.25*(cos(hr+2.)+3.8);float A=(2.*ra.x+ra.y+.05*ra.z-.305)*Nbb;float J=100.*pow(max(A/Aw,0.),cc*z);
  float t=(50000./13.*Nc*Nbb*et*sqrt(a*a+b*b))/(ra.x+ra.y+1.05*ra.z);float C=pow(t,.9)*sqrt(J/100.)*pow(1.64-pow(.29,n),.73);float M=C*pow(FL,.25);
  float Jp=1.7*J/(1.+.007*J),Mp=log(1.+.0228*M)/.0228;float ap=Mp*cos(hr),bp=Mp*sin(hr);int m=int(u_p0+.5);
  if(m==0)return vec4(Jp/100.,.5+ap/80.,.5+bp/80.,1.);if(m==1)return vec4(vec3(Jp/100.),1.);if(m==2)return vec4(hsv2rgb(vec3(fract(hr/6.2832),clamp(Mp/50.,0.,1.),.85)),1.);
  if(m==3)return vec4(vec3(clamp(Mp/45.,0.,1.)),1.);return vec4(hsv2rgb(vec3(fract(hr/6.2832),.8,.9))*step(.5,Mp),1.);`,'Li et al. 2017 CAM16 forward model (M16 adaptation, D from L_A and surround, Y_b = 20, D65 white) → CAM16-UCS J′ = 1.7J/(1+0.007J), M′ = ln(1+0.0228M)/0.0228, a′b′ = M′(cos h, sin h)');
