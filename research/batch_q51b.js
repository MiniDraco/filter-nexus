/* ================= q51b: ISF shader library (Vidvox/ISF-Files .fs ports) + RawTherapee tools (rtengine ports) (round 18) ================= */
// iq value noise with Vidvox seed: hash = -1+2*fract(q.x*q.y*(q.x+q.y)), q = 50*fract(seed*K + p/pi + (.71,.113)); seed interpolated floor->ceil
const Q51_VN = (o, p, seed, K) => `{vec2 i_=floor(${p}),f_=fract(${p}),u_=f_*f_*(3.-2.*f_);float v_[2];
 for(int s_=0;s_<2;s_++){float sd_=s_==0?floor(${seed}):ceil(${seed});float h_[4];
  for(int k_=0;k_<4;k_++){vec2 q_=50.*fract(sd_*${K}+(i_+vec2(float(k_-(k_/2)*2),float(k_/2)))*.3183099+vec2(.71,.113));h_[k_]=-1.+2.*fract(q_.x*q_.y*(q_.x+q_.y));}
  v_[s_]=mix(mix(h_[0],h_[1],u_.x),mix(h_[2],h_[3],u_.x),u_.y);}${o}=mix(v_[0],v_[1],fract(${seed}));}`;
const Q51_FBM = (o, p, seed, K) => `{vec2 w_=${p};float a_=.5,r_=0.,nv_;for(int o_=0;o_<4;o_++){${Q51_VN('nv_', 'w_', seed, K)}r_+=a_*nv_;a_*=.5;w_=mat2(1.6,1.2,-1.2,1.6)*w_;}${o}=r_;}`;
const Q51_RND = 'fract(sin(dot(Q0,vec2(12.9898,78.233)))*43758.5453)';

f = add('Retro');
f('q51_isf_brokenlcd','Broken LCD (ISF)',[S('Pattern style',['Random1','Random2','Random3','Nothing','Noise','Lines','Vertical','Horizontal','Stripes','Checkerboard']),P('Glitch thickness',0,4,3,.01),P('Glitch spread',0,1,.5,.01),P('Glitch size',0,100,4.1,.1)],
  `
#define Q51RN(Q0) ${Q51_RND}
 vec2 p=uv;vec4 res=O(uv);float ns=mod(5.0863+u_seed*1.37,10.),ps=2.3372086,rgs=.341,gs=u_p3,ar=asp();vec2 cr=PX(uv),RS=u_res/u_k;float d=distance(uv,vec2(.5));
 if(Q51RN(vec2(p.y+ps+.239,ns+.821))<.01){float rg=Q51RN(vec2(p.y+1.287*ps+2.239,6.12*ns+3.477));
  if(p.x<rg){vec4 cv=vec4(rg,1.28*rgs+p.y,rgs+floor(10.*p.x/rg),rgs);res=vec4(Q51RN(cv.rg),Q51RN(cv.gb),Q51RN(cv.ba),1.);}}
 float fv[3];for(int j=0;j<3;j++){vec2 q=p*vec2(ar,1.);float sc=j==2?4.:gs,sd=j==0?ns:j==1?ps:0.,bm=j==0?100.:50.,bq=j==0?25.:20.;
  if(j<2&&Q51RN(sd*(floor(q*(1.+sc*bm))/(1.+sc*bm)))>.5)q=floor(q*(1.+sc*bq))/(1.+sc*bq);float fb;${Q51_FBM('fb', 'q*sc', 'sd', '1.17921')}fv[j]=fb;}
 int pt=int(u_p0+.5);
 if(pt<=2){float f2=pow(max(fv[1],0.),.5);if(d>u_p2)f2+=d-u_p2;pt=pt==0?5+int(min(f2,1.)*3.99):pt==1?3+int(min(f2,1.)*3.99):4+int(f2*5.99);}
 vec4 bg=vec4(0.);float k1=1.+ps;
 if(pt==4){vec2 mc=RS*vec2(Q51RN(ps*cr),Q51RN(ps*cr.yx))*k1;float sm=mc.x+mc.y;bg=vec4(step(mod(sm,4.),1.99),step(mod(sm,5.),1.99),step(mod(sm,7.),1.99),1.);}
 else if(pt>=5&&pt<=7){vec2 mc=cr;if(pt==5)mc=(Q51RN(vec2(ps,cr.y))<.25?cr:cr.yx)*k1;else if(pt==6){mc.x*=k1;mc=mod(mc*k1,RS);}else{mc.y*=k1;mc=mod(mc,RS);}
  float lv=pt==7?mc.y:mc.x;bg=vec4(step(mod(lv,4.),.999),step(mod(lv,5.),.999),step(mod(lv,7.),.999),1.);}
 else if(pt==8)bg=mod(cr.x*k1,10.)<5.?vec4(1.):vec4(0.,0.,0.,1.);
 else if(pt==9){vec2 mc=mod(cr*k1,80.);bg=vec4(vec3((mc.x<40.&&mc.y<40.)||(mc.x>40.&&mc.y>40.)?.5:.9),1.);}
 float f=1.-pow(max(fv[0],0.),3.)*u_p1;if(d>u_p2)f+=d-u_p2;f=min(f,1.);f=f>.9?1.:0.;if(f<1.)res=mix(res,bg,1.-f);
 f=1.-pow(max(fv[2],0.),3.7393466)*4.;if(d>.2262074)f+=d-.2262074;f=min(f,1.);
 if(f<1.){vec3 tc=mix(vec3(.902,.251,.251),vec3(.251,.502,.902),f+Q51RN(vec2(0.,.231)));f=f>.9?1.:0.;res.rgb=mix(res.rgb,tc*res.rgb,1.-f);}
 return vec4(res.rgb,1.);`,
  'ISF Broken LCD (VIDVOX): 4-octave iq value-noise blotches (blocky where a random blockness > smoothness 0.5) beyond a radius pick dead-pixel patterns (RGB 4/5/7-px lines, vertical, horizontal, stripes, checkerboard, colour noise; Random1-3 choose by a second noise), a red/blue tint stain field and random row glitches; seeds from u_seed, flicker off (TIME 0); pow of negative noise treated as 0',true);

f = add('Distort');
f('q51_isf_edgeblowout','Edge Blowout (ISF)',[P('Left edge',0,1,.25,.01),P('Right edge',0,1,.75,.01),P('Bottom edge',0,1,.25,.01),P('Top edge',0,1,.75,.01)],
  `float L0=min(u_p0,u_p1),R0=max(u_p0,u_p1),B0=min(u_p2,u_p3),T0=max(u_p2,u_p3);vec2 s=uv;
 float rx=s.x<L0?0.:s.x>R0?2.:1.,ry=s.y<B0?0.:s.y>T0?2.:1.;
 if(rx==0.){R0=L0;L0=0.;}else if(rx==2.){L0=R0;R0=1.;}
 if(ry==0.){T0=B0;B0=0.;}else if(ry==2.){B0=T0;T0=1.;}
 float ld=s.x-L0,rd=R0-s.x,bd=s.y-B0,td=T0-s.y;
 vec4 o=(rd*O(vec2(L0,s.y))+ld*O(vec2(R0,s.y))+td*O(vec2(s.x,B0))+bd*O(vec2(s.x,T0)))/max(ld+rd+bd+td,1e-6);return vec4(o.rgb,1.);`,
  'ISF Edge Blowout (VIDVOX): inside the box and in each of the 8 outside regions, every pixel is the distance-weighted blend of the 4 region-edge pixels on its row and column (edges stretched into the region); Horizontal/Vertical/Inside/Outside bleed at their default on');

f = add('Blur');
const Q51_SMF = `float f;{vec2 q=uv*vec2(asp(),1.)*u_p0;float sd=fract(.4938+u_seed*.13),fb=0.,a=.5,nv;
 for(int o_=0;o_<4;o_++){vec2 i_=floor(q),f_=fract(q),u_=f_*f_*(3.-2.*f_);float h_[4];for(int k_=0;k_<4;k_++){vec2 q_=50.*fract(sd+(i_+vec2(float(k_-(k_/2)*2),float(k_/2)))*.3183099+vec2(.71,.113));h_[k_]=-1.+2.*fract(q_.x*q_.y*(q_.x+q_.y));}
  fb+=a*mix(mix(h_[0],h_[1],u_.x),mix(h_[2],h_[3],u_.x),u_.y);a*=.5;q=mat2(1.6,1.2,-1.2,1.6)*q;}
 f=1.-max(fb,0.)*u_p1;float dd=distance(uv,vec2(.5));if(dd>u_p2)f+=dd-u_p2;f=min(f,1.);}
 vec3 col=O(uv).rgb,av=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)av+=O(uv+vec2(float(i),float(j))*u_px).rgb;av/=9.;
 vec3 res=mix(col,(av+3.75*T(uv).rgb)/4.75,(1.-f)*u_p3);return vec4(res,1.);`;
f('q51_isf_smudgedlens','Smudged Lens (ISF)',[P('Dirt size',0,100,6,.1),P('Dirt thickness',0,4,4,.01),P('Dirt spread',0,1,.5,.01),P('Blur level',0,.5,.5,.01)],
  [`return blur1d(u_tex,uv,vec2(1.,0.),u_res.x/max(floor(u_res.x*.02),1.));`,`return blur1d(u_tex,uv,vec2(0.,1.),u_res.y/max(floor(u_res.y*.02),1.));`,Q51_SMF,
   `return blur1d(u_tex,uv,vec2(1.,0.),u_res.x/max(floor(u_res.x*.25),1.));`,`return blur1d(u_tex,uv,vec2(0.,1.),u_res.y/max(floor(u_res.y*.25),1.));`,Q51_SMF],
  'ISF Smudged Lens (iq noise, @colin_movecraft / VIDVOX): 4-octave value-noise dirt mask (Dirt Shape 4 -> linear, thickness, radial spread) mixes a 3x3 average with a 2%-resolution then 25%-resolution pass ((avg + 3.75*low)/4.75, blur level 0.5); the downsampled ISF render targets are emulated by Gaussian blurs one target-texel wide; seeded dirt',true);

f = add('Render');
f('q51_isf_smokescreen','Smoke Screen Overlay (ISF)',[P('Smoke intensity',0,10,1,.01),P('Smoke density',0,1,.75,.01),P('Smoke brightness',0,1,.75,.01),P('Drift',0,20,0,.01)],
  `vec2 nuv=(uv-vec2(0.,.25)*u_p3/3.)*6.;float n=0.,sc=1.;
 for(int k=0;k<5;k++){vec2 q=nuv*sc;vec2 it=smoothstep(0.,1.,fract(q)),fl=floor(q),ce=ceil(q);
  #define Q51SN(P0) fract(sin(dot(vec2((P0).x+(P0).y*10000.,(P0).y+(P0).x*10000.),vec2(12.9898,78.233)))*43758.5453)
  n+=mix(mix(Q51SN(fl),Q51SN(vec2(ce.x,fl.y)),it.x),mix(Q51SN(vec2(fl.x,ce.y)),Q51SN(ce),it.x),it.y)/sc;sc*=2.;}
 n/=1.9375;vec3 res=mix(n*vec3(u_p2),c.rgb,pow(abs(uv.y),pow(u_p1*u_p0*n,2.)));return vec4(res,1.);`,
  'ISF Smoke Screen (jackdavenport 4t2SRz): 5-octave smooth value noise x = fractalNoise(6uv), out = mix(x*smokeColour, image, uv.y^((alpha*intensity*x)^2)) so smoke thickens toward the bottom; Drift = TIME along the default direction (0,0.25)');

f = add('Distort');
f('q51_isf_trianglewarp','Triangle Warp (ISF)',[P('Peak X',.01,.99,.5,.01),P('Peak Y',0,1,1,.01),P('Distort X',0,1,0,.01)],
  `vec2 pt=uv;float v;if(pt.x<u_p0){pt.x=pt.x*.5/u_p0;v=2.*pt.x*u_p1;}else{pt.x=.5+.5*(pt.x-u_p0)/(1.-u_p0);v=(2.-2.*pt.x)*u_p1;}
 if(pt.y>v||v<=0.)return vec4(0.,0.,0.,1.);pt.x=mix(uv.x,pt.x,u_p2);pt.y/=v;return vec4(O(pt).rgb,1.);`,
  'ISF Triangle Warp (VIDVOX): each column is squeezed to the height of a triangle with apex Peak (height fit), Distort X also remaps x linearly per side; outside the triangle is black');

f = add('Stylize');
f('q51_isf_videobricks','Video Bricks (ISF)',[P('Brick size',0,1,.25,.005),P('Border size',0,1,.05,.005),S('Crop image',['Off','On']),P('Brick offset X',0,1,0,.01)],
  `float bc=u_p0<=0.?max(u_res.x,u_res.y):1./u_p0;vec2 st=(uv+vec2(u_p3,0.))*bc;st.x+=step(1.,mod(st.y,2.))*.5;st=fract(st);
 vec2 sz=vec2(.5)-vec2(1.-u_p1)*.5;vec2 bx=smoothstep(sz,sz+1e-4,st)*smoothstep(sz,sz+1e-4,1.-st);
 if(bx.x*bx.y<=0.)return vec4(0.,0.,0.,1.);if(u_p2<.5&&u_p1<1.)st=(st-.5)/(1.-u_p1)+.5;return vec4(O(st).rgb,1.);`,
  'ISF Video Bricks (patriciogv bricks / VIDVOX): running-bond brick tiling (odd rows shifted half a brick), every brick shows the whole frame (zoomed past the mortar unless Crop), black border');

f = add('Distort');
f('q51_isf_powerwarp','Power Warp (ISF)',[P('Power X',.25,4,2,.01),P('Power Y',.25,4,2,.01),P('Shift X',0,1,0,.01),S('Style',['Style 1','Style 2'],1)],
  `vec2 pw=vec2(u_p0,u_p1),q=uv;if(u_p3<.5)q=pow(q,pw);else{q=mix(.5-pow(max(1.-2.*q,0.),pw)*.5,.5+pow(max(2.*(q-.5),0.),pw)*.5,step(.5,q));}
 q=mod(q+vec2(u_p2,0.),1.);return vec4(O(q).rgb,1.);`,
  'ISF Power Warp (VIDVOX): x and y raised to a power (Style 1) or mirrored about the centre (Style 2: 0.5 +- (2|p-0.5|)^power/2), then shifted and wrapped; Shift Y fixed 0; defaults 2 (ISF default 1 = identity)');

/* ---------- RawTherapee (rtengine) ---------- */
const Q51_TOLAB = (o, cc) => `vec3 ${o};{vec3 l_=clamp(${cc},0.,1.);l_=mix(l_/12.92,pow((l_+.055)/1.055,vec3(2.4)),step(.04045,l_));
 vec3 x_=mat3(.4124564,.2126729,.0193339,.3575761,.7151522,.119192,.1804375,.072175,.9503041)*l_/vec3(.95047,1.,1.08883);
 vec3 f_=mix(7.787*x_+16./116.,pow(max(x_,1e-9),vec3(1./3.)),step(.008856,x_));${o}=vec3(116.*f_.y-16.,500.*(f_.x-f_.y),200.*(f_.y-f_.z));}`;
const Q51_FROMLAB = (o, lb) => `vec3 ${o};{vec3 lb_=${lb};float fy_=(lb_.x+16.)/116.;vec3 f_=vec3(fy_+lb_.y/500.,fy_,fy_-lb_.z/200.);
 vec3 x_=mix((f_-16./116.)/7.787,f_*f_*f_,step(.206893,f_))*vec3(.95047,1.,1.08883);
 vec3 l_=mat3(3.2404542,-.969266,.0556434,-1.5371385,1.8760108,-.2040259,-.4985314,.041556,1.0572252)*x_;${o}=mix(12.92*l_,1.055*pow(max(l_,0.),vec3(1./2.4))-.055,step(.0031308,l_));}`;

f = add('Sharpen');
const Q51_CBDL = k => `vec4 cc=T(uv);float ce=cc.r,nu=0.,de=0.;float sp=R(${1 << k}.);
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float v=T(uv+vec2(float(i),float(j))*sp*u_px).r;float dm=${k > 1 ? '(abs(i)==2||abs(j)==2)?1.:2.' : '1.'};float w=dm/(abs(v-ce)*32768.+1000.);nu+=w*v;de+=w;}
 float nx=nu/de,h=ce-nx,m=${k < 2 ? 'u_p0' : k < 4 ? 'u_p1' : 'u_p2'};float mb=${k === 4 ? 'm>1.?1.+.65*(m-1.):m' : k === 5 ? 'm>1.?1.+.45*(m-1.):m' : 'm'};
 float nh=1.33*2000.*u_p3/${Math.pow(3, k)}./32768.,nl=.66*2000.*u_p3/${Math.pow(3, k)}./32768.,ah=abs(h);
 float g=ah<nl?1.:ah>nh?mb:1.+(mb-1.)*(ah-nl)/max(nh-nl,1e-6);return vec4(nx,cc.g+g*h,0.,1.);`;
f('q51_rt_cbdl','Contrast by Detail Levels (RawTherapee)',[P('Fine detail',0,4,1.5,.01),P('Medium detail',0,4,1.3,.01),P('Coarse detail',0,4,1.1,.01),P('Threshold',0,1,.2,.01)],
  [`${Q51_TOLAB('lb', 'c.rgb')}return vec4(lb.x/100.,.5,0.,1.);`, ...[0, 1, 2, 3, 4, 5].map(Q51_CBDL),
   `vec4 t=T(uv);${Q51_TOLAB('lb', 'O(uv).rgb')}lb.x=clamp((t.r+t.g-.5)*100.,0.,100.);${Q51_FROMLAB('rgb', 'lb')}return vec4(rgb,1.);`],
  'RawTherapee dirpyr_equalizer on Lab L: 6-level edge-aware pyramid (5x5 taps at spacing 1..32 px, range weight 1/(|dL|*32768+1000), 2:1 inner/outer domain weights from level 2), each band = level - next level re-added with gain irangefn: 1 below noise_lo, multiplier above noise_hi (0.66/1.33 x 2000 x threshold / 3^level), linear between; levels 4-5 multipliers softened 0.65/0.45 as in RT; sliders pair levels 0-1 / 2-3 / 4-5; skin protection off');

f = add('Color');
f('q51_rt_labgrid','L*a*b* Colour Correction Grid (RawTherapee Color Toning)',[P('Shadows a',-1,1,-.2,.01),P('Shadows b',-1,1,-.5,.01),P('Highlights a',-1,1,.15,.01),P('Highlights b',-1,1,.5,.01)],
  `${Q51_TOLAB('lb', 'c.rgb')}vec2 lo=vec2(u_p0,u_p1)*12000.,hi=vec2(u_p2,u_p3)*12000.;vec2 sh=(lb.x*327.68*(hi-lo)/36000./3.+lo/3.)/327.68;lb.yz+=sh;${Q51_FROMLAB('rgb', 'lb')}return vec4(rgb,1.);`,
  'RawTherapee colorToningLabGrid: a += L*(aHigh-aLow)/(3*12000)/3 + aLow/3 and the same for b (internal L 0..32768, Lab x 327.68), grid nodes in -1..1 = +-LABGRID_CORR_MAX 12000; a linear a/b shift ramp from the shadow node to the highlight node');

f('q51_rt_labregions','Colour Correction Region with H/C/L Mask (RawTherapee Color Toning)',[P('Mask hue',0,360,45,1,'deg'),P('Mask width',10,180,50,1,'deg'),P('Saturation',-100,100,50,1),P('Slope',.25,4,1,.01)],
  `${Q51_TOLAB('lb', 'c.rgb')}float hu=degrees(atan(lb.z,lb.y));float dh=abs(mod(hu-u_p0+540.,360.)-180.);float m=clamp(1.-dh/u_p1,0.,1.);m=m*m*(3.-2.*m);
 vec3 l=clamp(c.rgb,0.,1.);l=mix(l/12.92,pow((l+.055)/1.055,vec3(2.4)),step(.04045,l));l=pow(max(l*u_p3,0.),vec3(1.));
 float Y=dot(l,vec3(.2126,.7152,.0722)),rs=1.+u_p2/(u_p2>0.?50.:100.);l=max(Y+rs*(l-Y),0.);
 vec3 sg=mix(12.92*l,1.055*pow(l,vec3(1./2.4))-.055,step(.0031308,l));${Q51_TOLAB('nb', 'sg')}${Q51_FROMLAB('rgb', 'mix(lb,nb,m)')}return vec4(rgb,1.);`,
  'RawTherapee labColorCorrectionRegions, one region: hue mask (Lab hue, smooth window of Mask width) blends the region result back in Lab; region ops = ASC-CDL slope (offset 0, power 1) then saturation rs = 1 + sat/50 (or /100 if negative) about luminance Y in linear RGB (sRGB primaries instead of the working profile); a/b shift 0, chroma/lightness masks flat, guided-filter mask smoothing omitted (approx.)');

f('q51_rt_sat2col','Saturation 2 Colours Toning (RawTherapee Color Toning)',[P('Highlights hue',0,360,80,1,'deg'),P('Shadows hue',0,360,208,1,'deg'),P('Strength',0,100,50,1),P('Balance',-100,100,0,1)],
  `vec3 x=clamp(c.rgb,0.,1.);float lb=dot(x,vec3(.299,.587,.114)),v=max(x.r,max(x.g,x.b)),sp=u_p2/100.*.8,il=.35,ih=.65;
 vec3 cl=hsv2rgb(vec3(u_p1/360.,1.,1.)),ch=hsv2rgb(vec3(u_p0/360.,1.,1.));cl/=cl.r+cl.g+cl.b;ch/=ch.r+ch.g+ch.b;
 float kl=v<=il?.7*(1.-pow(1.-v/il,2.)):.7*(1.-pow((v-il)/(1.-il),2.));float fs=.30518*.8*kl*sp*(1.+u_p3/100.);
 if(cl.r>0.){x.g-=fs*cl.r;x.b-=fs*cl.r;}if(cl.g>0.){x.r-=fs*cl.g;x.b-=fs*cl.g;}if(cl.b>0.){x.r-=fs*cl.b;x.g-=fs*cl.b;}
 float kh=v>ih?(1.-v)/(1.-ih):2.*v/ih-pow(v/ih,2.);float fh=.30518*.6*kh*2.2*sp*(1.-u_p3/100.);x+=fh*max(ch,0.);
 x=max(x,0.);float la=dot(x,vec3(.299,.587,.114));x*=lb/max(la,1e-5);return vec4(clamp(x,0.,1.),1.);`,
  'RawTherapee toning2col ("Saturation 2 colours"): the shadow colour (full-saturation hue, normalised weights) is pushed in by subtracting factor*k from the other channels, the highlight colour added, factor = 20000/65535 x saturation(80 / 60) x luminance-shaped weight x protection, Balance shifts shadows vs highlights, luminance preserved; weight curves and the protection scale (Strength) are approx. (secondeg_* coefficients and ctColorCurve low/high not taken from source)');
