/* ================= q52: round-19 Nukepedia gizmos, part 1 (built from the nukepedia.com tool pages; sources are login-gated, so most are approx.) ================= */
// Radial-kernel convolution over a golden-angle spiral: adds taps with radius in [r0,r1] (working px), radius = mix(r0,r1,u^E),
// weight = kernel(rr) x area Jacobian, into accumulators a (vec4) / ws. kst must set float kv from rr. smp reads position P_.
const Q52_RING = (n, smp, r0, r1, E, kst) => `{float r0_=${r0},r1_=${r1};for(int i=0;i<${n};i++){float u=(float(i)+.5)/${n}.;float rr=mix(r0_,r1_,pow(u,${E}));
 float th=float(i)*2.3999632;vec2 P_=uv+vec2(cos(th),sin(th))*rr*SC_*u_px;${kst}float w=kv*max(rr,.25)*(r1_-r0_)*${E}*pow(u,${E}-1.)/${n}.;a+=(${smp})*w;ws+=w;}}`;
// sRGB-linear -> log (Cineon or ACEScct) and back; m = mode float
const Q52_TOLOG = (o, x, m) => `vec3 ${o}=${m}<.5?(685.+300.*log(${x}*.9892+.0108)/2.302585)/1023.:mix(10.5402377*${x}+.0729055,(log2(max(${x},vec3(1e-7)))+9.72)/17.52,step(vec3(.0078125),${x}));`;
const Q52_FROMLOG = (o, v, m) => `vec3 ${o}=${m}<.5?(pow(vec3(10.),(1023.*${v}-685.)/300.)-.0108)/.9892:mix((${v}-.0729055)/10.5402377,exp2(${v}*17.52-9.72),step(vec3(.1552511),${v}));`;
const Q52_FIBS = l => l.map(s => `exp(-z*z*${(1 / (2 * s * s)).toPrecision(5)})*${(1 / (s * s)).toPrecision(5)}`).join('+');
const Q52_FIBK = `float z=rr/S1;float kv=u_p2<.5?(${Q52_FIBS([1, 2, 3, 5, 8, 13, 21, 34, 55])}):u_p2<1.5?(${Q52_FIBS([1, 4, 9, 16, 25, 36, 49, 64, 81])}):(${Q52_FIBS([1, 2, 4, 7, 13, 24, 44, 81, 149])});`;

f = add('Blur');
f('q52_blurcurve','Blur Curve Custom Falloff (Nukepedia BlurCurve)',[P('Blur size',1,80,16,1,'px'),P('Aspect W to H',.25,4,1,.01),S('Blur shape',['Gaussian','Linear cone','Disc','Exponential']),P('Profile power',.25,4,1,.01)],
  [BH('u_p0*.07'), BV('u_p0*.07'),
   `float RM=R(u_p0);vec2 SC_=vec2(sqrt(u_p1),1./sqrt(u_p1));vec4 a=vec4(0.);float ws=0.;
 ${Q52_RING(400, 'T(P_)', '0.', 'RM', '.5', `float q=rr/RM;float b0=u_p2<.5?exp(-4.5*q*q):u_p2<1.5?1.-q:u_p2<2.5?1.-smoothstep(.92,1.,q):exp(-5.*q);float kv=pow(max(b0,0.),u_p3);`)}
 return vec4(a.rgb/max(ws,1e-8),1.);`],
  'BlurCurve (Harvey Goodall): blur whose radial falloff is a profile curve, four preset shapes, independent width/height scaling; the hand-drawn profile curve is replaced by the preset shape raised to Profile power (approx.); convolution = 400-tap equal-area golden-angle spiral over a lightly prefiltered image');

f('q52_fractalblur','Fractal Blur Gradient Breakup (Nukepedia Fractal Blur)',[P('Blur size',1,60,14,1,'px'),P('Noise size',2,120,24,1,'px'),P('Contrast',0,1,.6,.01)],
  [`float n=fbm(PX(uv)/u_p1+u_seed*17.3);float m=clamp(1.+u_p2*2.2*(n-.5),0.,2.);return vec4(c.rgb*m,1.);`, BH('u_p0'), BV('u_p0')],
  'Fractal Blur (Rich Frazer): fractal noise (size, contrast) is multiplied into the image/matte before the blur, so the soft gradient of the blurred edge is broken up organically; mean-preserving fbm (approx., no texture input / no animation)',true);

f('q52_zipblur','Zip Blur Directional Detail Removal (Nukepedia ZipBlur)',[P('Angle',-90,90,0,1,'deg'),P('Length',4,120,40,1,'px'),P('Detail size',1,20,4,.5,'px'),P('Amount',0,1,1,.01)],
  [BH('u_p2'), BV('u_p2'), `return vec4((O(uv).rgb-c.rgb)*.5+.5,1.);`,
   `float a=radians(u_p0);return blur1d(u_tex,uv,vec2(cos(a),sin(a)),R(u_p1));`,
   `vec3 s=c.rgb*2.-1.;return vec4(clamp(O(uv).rgb-s*u_p3,0.,1.),1.);`],
  'ZipBlur (Mads Hagbarth Damsbo) idea: removes detail oriented along the chosen angle - the high-pass detail layer is blurred along that direction (so only structure coherent along it survives) and subtracted, isotropic texture is kept (approx.; built from the tool description)');

f('q52_astig','Anamorphic Astigmatism (Nukepedia mt Anamorphic Astigmatism)',[P('Amount',0,30,10,.5,'px'),P('Astigmatism',-1,1,.6,.01),P('Squeeze',1,2,1.33,.01),P('Falloff',1,4,2,.1)],
  `vec2 p=(uv-.5)*vec2(asp(),1.);float rn=length(p)/length(vec2(asp(),1.)*.5);vec2 er=length(p)>1e-5?normalize(p):vec2(1.,0.);vec2 et=vec2(-er.y,er.x);
 float b=R(u_p0)*pow(rn,u_p3);float sr=b*(1.+u_p1)*.5+.01,st=b*(1.-u_p1)*.5+.01;vec3 acc=vec3(0.);float ws=0.;
 for(int i=0;i<96;i++){float u=(float(i)+.5)/96.;float rho=sqrt(u)*2.2;float th=float(i)*2.3999632;float w=exp(-.5*rho*rho);
  vec2 o=(er*cos(th)*sr+et*sin(th)*st)*rho;o.y*=u_p2;acc+=O(uv+o*u_px).rgb*w;ws+=w;}
 return vec4(acc/ws,1.);`,
  'mt Anamorphic Astigmatism (Miguel Torija) idea: off-axis blur that grows with field radius (Falloff power), split into sagittal (radial) and tangential sizes by Astigmatism (rays of different orientation focus at different planes), the blur ellipse stretched vertically by the anamorphic Squeeze; 96-tap Gaussian ellipse (approx., built from the description)');

f = add('Stylize');
f('q52_edgescatter','Edge Scatter Along Matte Edge (Nukepedia EdgeScatter)',[P('Key threshold',0,1,.5,.01),P('Inner amount',0,1,.7,.01),P('Outer amount',0,1,.7,.01),P('Blur size',1,60,8,1,'px')],
  [`float m=smoothstep(u_p0-.03,u_p0+.03,blurL(uv,u_k));return vec4(c.rgb,m);`, BH('u_p3'), BV('u_p3'),
   `vec3 o=O(uv).rgb;float m=smoothstep(u_p0-.03,u_p0+.03,blurL(uv,u_k));vec4 b=T(uv);float band=pow(clamp(4.*b.a*(1.-b.a),0.,1.),2.);
 float w=clamp(band*mix(u_p2,u_p1,m),0.,1.);return vec4(mix(o,b.rgb,w),1.);`],
  'EdgeScatter (J Bills): the comp is blurred and mixed back only in a band around the matte edge, with separate inner/outer amounts, to integrate layers photographically (light-wrap family); no matte input here, so the control matte is a soft luma key at Key threshold (approx.; no regrain / crop)');

f('q52_fibglow','Fibonacci Glow Stack (Nukepedia eFibonacciGlow)',[P('Glow size',.2,4,1,.05),P('Luminance tolerance',0,1,.6,.01),S('Falloff',['Fibonacci','Quadratic','Tribonacci']),S('Output',['Glow over image','Glow only'])],
  [`return vec4(c.rgb*smoothstep(u_p1,u_p1+.15,L(uv)),1.);`, BH('u_p0*6.'), BV('u_p0*6.'),
   `float S1=R(u_p0);vec2 SC_=vec2(1.);float SM=u_p2<.5?55.:u_p2<1.5?81.:149.;vec4 a=vec4(0.);float ws=0.;
 ${Q52_RING(120, 'vec4(O(P_).rgb*smoothstep(u_p1,u_p1+.15,luma(O(P_).rgb)),0.)', '0.', 'S1*8.', '1.', Q52_FIBK)}
 ${Q52_RING(400, 'T(P_)', 'S1*8.', 'S1*SM*2.5', '1.5', Q52_FIBK)}
 vec3 g=a.rgb/max(ws,1e-8)*2.5;vec3 o=O(uv).rgb;return vec4(u_p3>.5?g:1.-(1.-o)*(1.-g),1.);`],
  'eFibonacciGlow (Ermes Vincenti): exponential-looking glow = equal-energy sum of Gaussian glows whose sizes follow the Fibonacci sequence 1,2,3,5..55 x Glow size (v4 options: quadratic 1,4,9..81 / Tribonacci 1,2,4,7..149), luminance tolerance key, screen over the image or glow only; summed as one radial kernel (dense near taps on the keyed image, far taps on a prefiltered copy)');

f('q52_physxglow','Inverse-Square Physical Glow (Nukepedia PhysX Glow)',[P('Intensity',0,4,1,.01),P('Reach',20,600,200,1,'px'),P('Core size',.5,10,2,.1,'px'),P('Threshold',0,1,.5,.01)],
  [`vec3 x=${LIN('c.rgb')};return vec4(${SRGB('x*smoothstep(u_p3,u_p3+.15,L(uv))')},1.);`, BH('u_p1*.025+1.'), BV('u_p1*.025+1.'),
   `float RC=R(u_p2),RM=R(u_p1);vec2 SC_=vec2(1.);float RN=min(RC*10.,RM*.5);vec4 a=vec4(0.);float ws=0.;
 ${Q52_RING(120, 'vec4(O(P_).rgb*smoothstep(u_p3,u_p3+.15,luma(O(P_).rgb)),0.)', '0.', 'RN', '1.', 'float kv=1./(1.+rr*rr/(RC*RC));')}
 ${Q52_RING(400, 'T(P_)', 'RN', 'RM', '1.5', 'float kv=1./(1.+rr*rr/(RC*RC));')}
 vec3 gs=a.rgb/max(ws,1e-8);vec3 g=${LIN('gs')};vec3 o=O(uv).rgb;vec3 ol=${LIN('o')};vec3 r=ol+g*u_p0*3.;return vec4(${SRGB('r')},1.);`],
  'PhysX Glow (Pierre Levin): a single convolution whose kernel follows the inverse-square law of the distance to the kernel centre, 1/(1+(d/core)^2), instead of stacked Gaussians; thresholded highlights convolved in linear light and added (kernel normalised to unit energy, Intensity scales it; approx. of the falloff, the exact gizmo kernel is not published)');

f('q52_paperoutline','Paper Cut-Out Outlines (Nukepedia BAB_PaperOutlines)',[P('Outline width',1,12,3,.5,'px'),P('Paper texture',0,1,.5,.01),P('Sharpness',0,1,.6,.01),S('Output',['Outlined image','Paper only'])],
  `float l0=L(uv);float e=0.;for(int i=0;i<16;i++){float th=float(i)*.3926991;float rr=R(u_p0)*(i<8?.5:1.);e=max(e,abs(L(uv+vec2(cos(th),sin(th))*rr*u_px)-l0));}
 float sf=(1.-u_p2)*.08+.004;float ol=smoothstep(.2-sf,.2+sf,e);vec2 pp=PX(uv);float fib=fbm(pp*vec2(.08,.5))*.6+fbm(pp*.25)*.4;
 vec3 paper=vec3(.97,.95,.9)*(1.-u_p1*.22*(fib-.45));vec3 img=c.rgb*mix(1.,.85+.3*fib,u_p1*.5);
 return vec4(u_p3>.5?paper*ol:mix(img,paper,ol),1.);`,
  'BAB_PaperOutlines idea: automatic stylised outlines drawn as textured paper (fibre fbm) around detected contours - the contour band is everywhere the luma changes within Outline width (8 directions, 2 radii), Sharpness hardens the paper edge, paper-only output for compositing (approx., built from the tool description)');

f('q52_twitch','Twitch Random Jolts (Nukepedia VC Twitch)',[P('Time',0,100,0,1),P('Amount',0,1,.6,.01),P('Probability',0,1,1,.01),S('Twitch type',['All','Position','Colour','Blur','Light'])],
  `float fr=floor(u_p0);float sd=u_seed*13.17;float on=step(hash(vec2(fr,sd)),u_p2)*u_p1;int ty=int(u_p3+.5);
 float pP=(ty==0||ty==1)?1.:0.,pC=(ty==0||ty==2)?1.:0.,pB=(ty==0||ty==3)?1.:0.,pL=(ty==0||ty==4)?1.:0.;
 vec2 sh=(vec2(hash(vec2(fr,sd+1.7)),hash(vec2(fr,sd+2.9)))-.5)*.16*on*pP;vec2 bd=normalize(vec2(hash(vec2(fr,sd+3.3)),hash(vec2(fr,sd+4.1)))-.5+1e-4)*R(30.)*on*pB*u_px;
 float cs=.02*on*pC;vec2 cd=vec2(1.,.3)*cs;vec3 acc=vec3(0.);
 for(int i=0;i<16;i++){float t=float(i)/15.-.5;vec2 q=uv-sh+bd*t;acc+=vec3(O(q+cd).r,O(q).g,O(q-cd).b);}acc/=16.;
 vec3 tint=mix(vec3(1.),.6+.8*vec3(hash(vec2(fr,sd+5.)),hash(vec2(fr,sd+6.)),hash(vec2(fr,sd+7.))),on*pC*.6);
 float lt=1.+on*pL*(hash(vec2(fr,sd+8.))*1.4-.3);return vec4(clamp(acc*tint*lt,0.,1.),1.);`,
  'Video Copilot Twitch (as ported to Nuke by INEED MONEY): per frame (Time) a seeded random jolt fires with Probability - position slide, colour (RGB split + random tint), directional blur, light flash - All or one type at a time; Amount scales the jolts (approx., one frame per Time step, no slide/scale sub-modes)',true);

f = add('Sharpen');
f('q52_logsharpen','Log Space Sharpen (Nukepedia Log_Sharpen)',[P('Amount',0,3,1,.01),P('Radius',.5,10,1.5,.1,'px'),S('Log space',['Cineon','ACEScct'])],
  [`vec3 x=max(${LIN('c.rgb')},vec3(0.));${Q52_TOLOG('lg', 'x', 'u_p2')}return vec4(lg,1.);`, BH('u_p1'), BV('u_p1'),
   `vec3 o=O(uv).rgb;vec3 x=max(${LIN('o')},vec3(0.));${Q52_TOLOG('lg', 'x', 'u_p2')}vec3 v=lg+u_p0*(lg-T(uv).rgb);${Q52_FROMLOG('y', 'v', 'u_p2')}
 y=max(y,vec3(0.));return vec4(${SRGB('y')},1.);`],
  'Log_Sharpen (Tejas Kantharia, after Adrian Sutherland VES article on sharpening in log): linear -> Cineon (685/300 log10, 0.0108 black offset) or ACEScct, unsharp mask (Gaussian radius) applied in log, back to linear, so halos are proportional (multiplicative) instead of additive');

f = add('Film');
f('q52_alexagrain','ARRI Alexa Sensor Grain (Nukepedia Grain_ARRI_Alexa)',[P('ISO',160,3200,800,10),P('Grain size',.5,3,1,.05),P('Intensity',0,3,1,.01)],
  `vec2 p=PX(uv)/u_p1+u_seed*37.1;float sh=vnoise(p)+vnoise(p*1.7+11.3)-1.;vec3 nc=vec3(vnoise(p+71.3),vnoise(p+143.9),vnoise(p+219.7))*2.-1.;
 vec3 n=.55*sh+.8*nc;vec3 x=c.rgb;vec3 pr=sqrt(max(x,vec3(.02)))*(1.15-x);vec3 A=vec3(.8,.65,1.25)*.07*sqrt(u_p0/800.)*u_p2;
 return vec4(clamp(x+n*A*pr,0.,1.),1.);`,
  'Grain_ARRI_Alexa (Huseyin Cay) idea: fine sensor noise with an ISO/EI control - amplitude ~ sqrt(EI/800), strongest in the blue and red channels, partly luma-correlated, peaking in shadows/mids (photon shot-noise profile); fine 1-px grain, Grain size scales it (approx.; the gizmo values are not published)',true);

f = add('Depth');
f('q52_distantbloom','Distant Bloom by Depth (Nukepedia Distant Bloom)',[P('Filter size',1,8,2,.5,'px'),P('Threshold',0,.5,.04,.005),P('Gain',0,8,3,.05),P('Blur size',1,40,10,1,'px')],
  [`float d=R(u_p0);vec3 lp=4.*c.rgb-T(uv+vec2(d,0.)*u_px).rgb-T(uv-vec2(d,0.)*u_px).rgb-T(uv+vec2(0.,d)*u_px).rgb-T(uv-vec2(0.,d)*u_px).rgb;
 float e=max(abs(luma(lp))-u_p1,0.);float hi=smoothstep(.7,1.,L(uv));float fm=pow(clamp(1.-D(uv),0.,1.),1.5);return vec4(c.rgb*min(e*12.+hi,2.)*u_p2*fm*.6,1.);`,
   BH('u_p3'), BV('u_p3'),
   `vec3 o=O(uv).rgb;vec3 g=clamp(T(uv).rgb,0.,1.);return vec4(1.-(1.-o)*(1.-g),1.);`],
  'Distant Bloom (Horea Pop): Laplacian edge detect (Filter size, Threshold) plus highlights, graded (Gain), blurred and masked by a depth pass so only far CG edges/highlights bloom, screened over the image (far mask = (1-depth)^1.5; no convolve/defocus split, approx.)');

f = add('Color');
f('q52_biassat','Biased Saturation Toward a Colour (Nukepedia biasedSaturation)',[P('Saturation',0,3,.4,.01),P('Bias hue',0,360,30,1,'deg'),P('Bias strength',0,1,.6,.01)],
  `vec3 pc=hsv2rgb(vec3(u_p1/360.,u_p2,1.));pc/=max(luma(pc),1e-3);vec3 g=luma(c.rgb)*pc;return vec4(clamp(g+(c.rgb-g)*u_p0,0.,1.),1.);`,
  'biasedSaturation (Paul Raeburn): saturation whose neutral axis is a picked colour instead of grey - desaturating heads toward luma x picked colour (normalised to unit luma), oversaturating pushes away from it (approx., built from the one-line description)');

f('q52_crankit','CrankIt Colour Boost for Keying (Nukepedia CrankIt)',[S('Filter',['Magnitude','Power','Max','Inverse Min','Max Range','Inverse Max Range','Min Range'],2),P('Amount',0,1,1,.01),P('Gain',.1,2,.7,.01)],
  `vec3 x=max(c.rgb,vec3(0.));float mx=max(x.r,max(x.g,x.b)),mn=min(x.r,min(x.g,x.b));int m=int(u_p0+.5);vec3 d=x;float q;
 if(m==0)q=length(x)/1.7320508;else if(m==1)q=pow(x.r*x.g*x.b+1e-6,1./3.);else if(m==2)q=mx;else if(m==3){q=1.-mn;d=x-mn;}
 else if(m==4){q=mx-mn;d=x-mn;}else if(m==5)q=1.-(mx-mn);else q=mn;
 vec3 o=clamp(d/max(q,.03)*u_p2,0.,1.);return vec4(mix(c.rgb,o,u_p1),1.);`,
  'CrankIt (Cameron Carson, after Ben Pierre CrankItUp): pumps plate colours for keying by dividing RGB by a per-pixel normaliser chosen by the filter (Magnitude, Power = geometric mean, Max, Inverse Min, Max Range, Inverse Max Range, Min Range; range modes also subtract the min) - the gizmo expressions are not published, approx.');

f('q52_yxygrade','CIE Yxy Grade (Nukepedia SR_YxyGrade)',[P('Exposure',-3,3,0,.05,'stops'),P('Contrast',.5,2,1,.01),P('Saturation',0,3,1,.01),P('Hue rotate',-180,180,0,1,'deg')],
  `vec3 l=max(${LIN('c.rgb')},vec3(0.));float X=dot(l,vec3(.4124,.3576,.1805)),Y=dot(l,vec3(.2126,.7152,.0722)),Z=dot(l,vec3(.0193,.1192,.9505));
 float sm=max(X+Y+Z,1e-6);vec2 xy=Y>1e-6?vec2(X,Y)/sm:vec2(.3127,.329);vec2 wp=vec2(.3127,.329);vec2 dv=xy-wp;float ha=radians(u_p3);
 dv=vec2(cos(ha)*dv.x-sin(ha)*dv.y,sin(ha)*dv.x+cos(ha)*dv.y)*u_p2;xy=wp+dv;xy.y=max(xy.y,1e-4);
 float Yn=.18*pow(Y/.18,u_p1)*exp2(u_p0);float X2=xy.x*Yn/xy.y,Z2=(1.-xy.x-xy.y)*Yn/xy.y;
 vec3 r=vec3(3.2406*X2-1.5372*Yn-.4986*Z2,-.9689*X2+1.8758*Yn+.0415*Z2,.0557*X2-.204*Yn+1.057*Z2);r=max(r,vec3(0.));return vec4(${SRGB('r')},1.);`,
  'SR_YxyGrade: grade in CIE Yxy - linear sRGB -> XYZ -> luminance Y + chromaticity xy; Exposure/Contrast (pivot 0.18) act on Y only, Saturation scales and Hue rotate turns the chromaticity around the D65 white point, then back to RGB (no BG edge-blend input; approx. of the knob set)');

f = add('Tone');
f('q52_day2night','Day to Night (Nukepedia Day2Night)',[P('Darkness',0,1,.7,.01),P('Blue tint',0,1,.6,.01),P('Glow',0,2,.6,.01),P('Glow size',2,40,12,1,'px')],
  [`return vec4(c.rgb*smoothstep(.78,1.,L(uv)),1.);`, BH('u_p3'), BV('u_p3'),
   `vec3 o=O(uv).rgb;vec3 x=${LIN('o')};float y=dot(x,vec3(.2126,.7152,.0722));vec3 n=mix(x,vec3(y),.7);n=mix(n,n*vec3(.5,.8,1.45),u_p1);
 n=pow(max(n*mix(1.,.12,u_p0),vec3(0.)),vec3(1.+.35*u_p0));vec3 tg=T(uv).rgb;vec3 gl=${LIN('tg')}*vec3(1.,.82,.6)*u_p2;
 n+=x*smoothstep(.55,.9,y)*u_p2*.6+gl;n=clamp(n,0.,1.);return vec4(${SRGB('n')},1.);`],
  'Day2Night (INEED MONEY) - "very simple" day-for-night: desaturate, blue cast, exposure drop with a gamma crush, keep the brightest areas as lights and add a warm glow (glow colour) around them, clamped (approx.; the gizmo presets are not published)');

f = add('Repair');
f('q52_chroma422','4:2:2 Chroma Jaggy Fix (Nukepedia HS_422Chromafix)',[P('Radius',1,6,2,.5,'px'),P('Luma guide',0,40,12,.5),S('Output',['Fixed','Chroma only'])],
  `vec3 kY=vec3(.2126,.7152,.0722);float y0=dot(c.rgb,kY);vec2 cc=vec2(0.);float ws=0.;
 for(int i=-8;i<=8;i++){float t=float(i)/8.;vec3 s=T(uv+vec2(t*R(u_p0),0.)*u_px).rgb;float ys=dot(s,kY);float dy=ys-y0;
  float w=(1.-abs(t)*.9)*exp(-u_p1*u_p1*dy*dy);cc+=vec2((s.b-ys)/1.8556,(s.r-ys)/1.5748)*w;ws+=w;}
 cc/=ws;if(u_p2>.5)y0=.5;float r=y0+1.5748*cc.y,b=y0+1.8556*cc.x;float g=(y0-.2126*r-.0722*b)/.7152;return vec4(clamp(vec3(r,g,b),0.,1.),1.);`,
  'HS_422Chromafix (Hiroshi Saito) idea: 4:2:2 chroma is horizontally half-res, giving stair-step colour edges on keys; Rec.709 Cb/Cr are re-interpolated horizontally with a tent filter whose taps are weighted by luma similarity (joint-bilateral, luma kept at full res), so chroma edges snap to the luma edges (approx.)');

f('q52_pingle','Pingle Clipped Highlight Detail (Nukepedia pingle)',[P('Threshold',.8,1,.97,.005),P('Ping size',2,60,16,1,'px'),P('Gain',0,8,3,.05),S('Output',['Scaled preview','Superwhite boost','Ping map'])],
  `float th=u_p0;float d=0.;if(max(c.r,max(c.g,c.b))>=th){d=1.;for(int j=1;j<=16;j++){float rr=float(j)/16.*R(u_p1);bool hit=false;
  for(int k=0;k<12;k++){float a=float(k)*.5235988+float(j)*.3;vec3 s=O(uv+vec2(cos(a),sin(a))*rr*u_px).rgb;if(max(s.r,max(s.g,s.b))<th){hit=true;break;}}
  if(hit){d=(float(j)-1.)/16.;break;}}}
 float rp=smoothstep(0.,1.,d);vec3 v=c.rgb*(1.+u_p2*rp);int m=int(u_p3+.5);
 if(m==2)return vec4(vec3(rp),1.);if(m==1)return vec4(v,1.);return vec4((1.-exp(-v*1.5))/(1.-exp(-1.5*(1.+u_p2))),1.);`,
  'pingle: clipped highlights get a gradient by erosion - the depth of each clipped pixel inside its clipped region (distance to the region edge, up to Ping size) ramps a gain so blown lights peak in the centre ("pings") before a defocus, instead of flat multiplied whites; superwhite output, a soft-clip preview, or the ping map (approx.)');

f = add('Render');
f('q52_bokehbuilder','Bokeh Builder Grungy Kernel (Nukepedia Bokeh Builder)',[P('Blades',0,9,6,1),P('Ring edge',0,1,.5,.01),P('Grunge',0,1,.5,.01),P('Glass artifacts',0,1,.4,.01)],
  `vec2 p=(uv-.5)*vec2(asp(),1.)/.4;float rr=length(p);float a=atan(p.y,p.x)+u_seed*.7;float nb=floor(u_p0+.5);float dd=rr;
 if(nb>=3.){float sec=6.2831853/nb;float h=mod(a,sec)-.5*sec;dd=mix(rr*cos(h)/cos(.5*sec),rr,.12);}
 vec3 col=vec3(0.);for(int k=0;k<3;k++){float sc=1.+(float(k)-1.)*.012;float de=dd*sc;float m=1.-smoothstep(.975,1.,de);
  float ring=mix(1.,.3+1.5*pow(smoothstep(.45,1.,de),2.),u_p1);col[k]=m*ring;}
 vec2 q=p*3.+u_seed*9.1;float gr=fbm(q)+.5*fbm(q*4.);float on=.06*sin(rr*55.+fbm(q*2.)*3.);col*=mix(1.,.55+.6*gr+on,u_p2);
 vec2 cp=p*9.;vec2 ci=floor(cp);float dust=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=ci+vec2(float(i),float(j));vec2 cc=id+vec2(hash(id+u_seed),hash(id+u_seed+3.1));
  float rad=.12+.35*hash(id+7.7);dust=max(dust,step(hash(id+u_seed+5.3),.35)*(1.-smoothstep(rad*.6,rad,length(cp-cc))));}
 float scr=smoothstep(.985,1.,abs(sin(dot(p,vec2(.8,.6))*4.+fbm(p*2.+u_seed)*6.)))*.8;col*=1.-u_p3*clamp(dust*.6+scr,0.,.9);
 return vec4(clamp(col*vec3(1.,.96,.9),0.,1.),1.);`,
  'Bokeh Builder (Kyran Bishop) idea: builds an artistic bokeh kernel image from scratch - aperture polygon with curved blades (0 = round), compressed bright ring edge, grungy noise and onion-ring texture, glass artifacts (dust specks, scratches) and slight chromatic edge; output on black for use as a convolve/defocus filter (approx.)',true);
