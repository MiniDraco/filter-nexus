/* ================= q12: photon-rs presets, VEGAS Pro FX, ImageMagick extras, Topaz Studio 2, Filter Forge distortions ================= */
const Q12_CON = `
#define Q12F(kk) (259.*((kk)+255.)/(255.*(259.-(kk))))
#define Q12CON(vv,kk) floor(clamp((vv)*Q12F(kk)+128.-128.*Q12F(kk),0.,255.))
`;
f = add('Insta');
f('q12_photon_presets','photon-rs Filter Presets',[S('Preset',['Oceanic','Islands','Marine','Seagreen','Flagblue','Diamante','Perfume','Serenity','Golden','Pastel Pink','Cali','Firenze','Cinematic','Radio','Twenties','Rosetint','Mauve','Bluechrome','Obsidian']),P('Strength',0,1,1,.01)],
  Q12_CON + `vec3 p=floor(c.rgb*255.+.5);int m=int(u_p0+.5);vec3 o=p;
  vec3 MC[8]=vec3[8](vec3(0.,89.,173.),vec3(0.,24.,95.),vec3(0.,14.,119.),vec3(0.,68.,62.),vec3(0.,0.,131.),vec3(30.,82.,87.),vec3(80.,40.,120.),vec3(10.,40.,90.));
  if(m<=7){float op=m==5?.1:.2;o=floor(MC[m]*op+p*(1.-op));}
  else if(m==8){o=floor(vec3(235.,145.,50.)*.2+p*.8);o=Q12CON(o,30.);}
  else if(m==9){o=clamp(p+vec3(80.,12.,20.),0.,255.);o=Q12CON(o,30.);}
  else if(m==10){o=floor(vec3(255.,45.,75.)*.1+p*.9);o=Q12CON(o,50.);}
  else if(m==11){o=floor(vec3(255.,47.,78.)*.1+p*.9);o=min(o+30.,255.);o=Q12CON(o,50.);}
  else if(m==12){o=Q12CON(p,35.);o=floor(vec3(255.,160.,20.)*.12+o*.88);
   float lu=dot(o,vec3(.299,.587,.114));float w=1.-abs(lu/255.-.5)*2.;vec2 q=floor(PX(uv));
   vec3 rn=vec3(hash(q),hash(q+vec2(311.,17.)),hash(q+vec2(29.,577.)));o=floor(clamp(o+(rn-.5)*2.*.15*127.5*w,0.,255.));
   vec2 h=floor(u_res/u_k*.5);vec2 d=q-h;o=floor(o*clamp(1.-dot(d,d)*.65/dot(h,h),0.,1.));}
  else if(m<=17){vec3 off=m==13?vec3(5.,40.,20.):m==14?vec3(18.,12.,20.):m==15?vec3(80.,20.,31.):m==16?vec3(90.,40.,80.):vec3(20.,30.,60.);
   float a=floor((p.r+p.g+p.b)/3.);o=min(a+off,255.);}
  else{float a=floor((p.r+p.g+p.b)/3.);o=Q12CON(vec3(a),25.);}
  return vec4(mix(c.rgb,o/255.,u_p1),1.);`,
  'photon-rs filters.rs ported on 8-bit values: mix_with_colour (out = colour*opacity + px*(1-opacity), truncated) for Oceanic/Islands/Marine/Seagreen/Flagblue (0.2), Diamante (0.1), Perfume, Serenity; Golden = mix(235,145,50,.2)+adjust_contrast 30; Pastel Pink = alter_channels(80,12,20)+contrast 30; Cali = mix(255,45,75,.1)+contrast 50; Firenze = mix(255,47,78,.1)+inc_brightness 30+contrast 50; Cinematic = contrast 35, amber mix .12, film_grain .15 (midtone-weighted, per channel; hash instead of XorShift32), vignette .65 (1 - d^2/dmax^2); Radio/Twenties/Rosetint/Mauve/Bluechrome = monochrome(avg + offsets 5,40,20 / 18,12,20 / 80,20,31 / 90,40,80 / 20,30,60); Obsidian = average grey + contrast 25. adjust_contrast factor = 259(c+255)/(255(259-c))', 1);
f('q12_photon_channels','photon-rs Channel Effects (Neue / Lix / Ryo / Primary)',[S('Effect',['Neue (invert blue)','Lix (invert red and green)','Ryo (invert red and blue)','Primary (threshold at 128)','Primary (upstream quirk)']),P('Strength',0,1,1,.01)],
  `vec3 p=floor(c.rgb*255.+.5);int m=int(u_p0+.5);vec3 o=p;
  if(m==0)o.b=p.b<255.?255.-p.b:255.;
  else if(m==1)o.rg=255.-p.rg;
  else if(m==2)o.rb=255.-p.rb;
  else if(m==3)o=vec3(greaterThan(p,vec3(128.)))*255.;
  else{o.r=p.r>128.?255.:0.;o.g=p.g>128.?255.:0.;if(p.b>128.){o.g=255.;o.b=p.b;}else o.b=0.;}
  return vec4(mix(c.rgb,o/255.,u_p1),1.);`,
  'photon-rs filters.rs / effects.rs: neue = 255 - blue where blue < 255; lix = invert red and green; ryo = invert red and blue; primary = each channel > 128 -> 255 else 0. Upstream primary() reads pixel 0 for every pixel (whole image becomes one colour) and its blue branch sets green to 255 while leaving blue unchanged; "upstream quirk" keeps the blue/green quirk but evaluates per pixel');
f('q12_photon_strips','photon-rs Horizontal / Vertical Strips',[P('Strips',2,20,5,1),S('Direction',['Horizontal','Vertical']),S('Colour',['White','Black','Red','Blue','Green']),S('Layout',['Alternating','Upstream code (one block)'])],
  `float n=floor(u_p0+.5);bool vt=u_p1>.5;vec2 sz=floor(u_res/u_k);vec2 q=floor(PX(vec2(uv.x,1.-uv.y)));float L0=vt?sz.x:sz.y;float pos=vt?q.x:q.y;
  float tot=2.*n-1.;float hs=floor(L0/tot);float k=floor(pos/max(hs,1.));
  bool on=u_p3<.5?(mod(k,2.)>.5&&k<tot):(pos>=hs&&pos<n*hs);int ci=int(u_p2+.5);
  vec3 col=ci==0?vec3(1.):ci==1?vec3(0.):ci==2?vec3(1.,0.,0.):ci==3?vec3(0.,0.,1.):vec3(0.,1.,0.);
  return vec4(on?col:c.rgb,1.);`,
  'photon-rs effects.rs horizontal_strips / color_horizontal_strips (and the vertical twins): the frame is cut into 2n-1 slots of floor(H/(2n-1)) px and the strips are painted in the strip colour. Alternating = every second slot (the documented "series of equal-width strips"); upstream code = what draw_horizontal_strips actually paints, slots 1..n-1 at i*height_strip, i.e. one contiguous block');

/* ---- VEGAS Pro FX ---- */
f = add('Tone');
f('q12_vegas_light','VEGAS Black Restore / Fill Light / Soft Contrast',[S('Effect',['Black Restore','Fill Light','Soft Contrast']),P('Amount (threshold / level / contrast)',0,1,.5,.01),P('Balance (deviation / trim)',-1,1,0,.01),P('Softness (diffusion)',0,1,.35,.01)],
  [BH('(2.+u_p3*30.)'),BV('(2.+u_p3*30.)'),
  `vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;float l0=dot(o,vec3(.299,.587,.114)),lb=luma(bl);int m=int(u_p0+.5);vec3 r=o;
  if(m==0){float thr=u_p1*.25;r=l0<thr?vec3(0.):o;}
  else if(m==1){float w=pow(clamp(1.-lb,0.,1.),exp2(-u_p2*1.5)*1.5);r=1.-pow(max(1.-o,0.),vec3(1.+u_p1*2.5*w));}
  else{vec3 s=clamp(o/max(.6,1.-.25*u_p1),0.,1.);s=s+u_p1*(s*s*(3.-2.*s)-s)*1.5;
   float lo=max(-u_p2,0.),hi=max(u_p2,0.);s=s+lo*.35*(1.-s)*pow(1.-s,vec3(2.))*u_p1*2.;s=s-hi*.35*s*s*s*u_p1*2.;
   vec3 bh=bl*bl;s=1.-(1.-s)*(1.-bh*u_p3*.6);r=clamp(s,0.,1.);}
  return vec4(clamp(r,0.,1.),1.);`],
  'VEGAS Pro plug-ins (manual): Black Restore = any colour whose weighted RGB average (BT.601) is below Threshold (Amount x 0.25) is set to black (exact rule); Fill Light = shadow fill weighted by a blurred luminance mask (Softness = diffusion radius, Balance = deviation, negative lights darker regions more), applied as 1-(1-x)^(1+k) so whites never clip (approx.; tint hue not exposed); Soft Contrast = stretch range + S-curve contrast with low/high trim (Balance <0 lifts darks, >0 holds highlights) and diffusion of the blurred highlights (approx.; the vignette tab is not included)');
f = add('Blur');
f('q12_vegas_chromablur','VEGAS Chroma Blur',[P('Horizontal pixels',0,40,6,1,'px'),P('Vertical pixels',0,40,6,1,'px')],
  [`return box1d(u_tex,uv,vec2(1.,0.),R(u_p0));`,`return box1d(u_tex,uv,vec2(0.,1.),R(u_p1));`,
  `vec3 o=O(uv).rgb,b=T(uv).rgb;vec3 w=vec3(.299,.587,.114);return vec4(clamp(b+(dot(o,w)-dot(b,w)),0.,1.),1.);`],
  'VEGAS Chroma Blur: chromaticity (BT.601 Cb/Cr) box-blurred over Horizontal x Vertical pixels while luma stays sharp; implemented as box-blurred RGB with the original Y put back (identical, since YCbCr is linear)');
f('q12_vegas_minmax','VEGAS Min and Max',[S('Operation',['Min','Max']),P('Horizontal range',0,12,3,1,'px'),P('Vertical range',0,12,3,1,'px'),S('Area',['Square around each pixel','Circular around each pixel','Fixed blocks (pixelate)'])],
  `int op=int(u_p0+.5);float hr=floor(u_p1+.5),vr=floor(u_p2+.5);int ar=int(u_p3+.5);vec2 cu=uv;
  if(ar==2){vec2 bs=vec2(2.*hr+1.,2.*vr+1.);vec2 q=PX(uv);cu=fromPX((floor(q/bs)+.5)*bs);}
  vec3 best=T(cu).rgb;float bl=dot(best,vec3(.299,.587,.114));vec2 rr=max(vec2(hr,vr),vec2(.5));
  for(int j=-12;j<=12;j++){if(abs(float(j))>vr)continue;for(int i=-12;i<=12;i++){if(abs(float(i))>hr)continue;vec2 o2=vec2(float(i),float(j));
   if(ar==1&&dot(o2/rr,o2/rr)>1.)continue;vec3 s=T(cu+o2*u_k*u_px).rgb;float l=dot(s,vec3(.299,.587,.114));if(op==0?l<bl:l>bl){bl=l;best=s;}}}
  return vec4(best,1.);`,
  'VEGAS Min and Max: every pixel takes the darkest (Min) or brightest (Max) pixel, chosen by BT.601 brightness, of the Horizontal x Vertical range around it (square or circular area); Fixed blocks applies the same choice once per block, the pixelate reading of the manual');
f = add('Distort');
f('q12_vegas_radialpix','VEGAS Radial Pixelate',[S('Type',['Radial','Circular']),P('Level',0,1,.5,.01),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01)],
  `vec2 ce=vec2(u_p2,u_p3);vec2 ar=vec2(asp(),1.);vec2 d=(uv-ce)*ar;float r=length(d),a=atan(d.y,d.x);
  if(u_p0<.5){float n=floor(mix(360.,10.,pow(u_p1,.6)));float a2=(floor(a/(2.*PI)*n)+.5)*2.*PI/n;d=r*vec2(cos(a2),sin(a2));}
  else{float st=mix(.003,.12,u_p1*u_p1);float r2=(floor(r/st)+.5)*st;d=r2*vec2(cos(a),sin(a));}
  return vec4(T(ce+d/ar).rgb,1.);`,
  'VEGAS Radial Pixelate: pixelation in polar coordinates about Center (0,0 = lower left): Radial = the angle is quantised into sectors so colours streak outward from the centre in straight lines, Circular = the radius is quantised into concentric rings; Level = cell size (approx. of the plug-in scale)');
f = add('Retro');
f('q12_vegas_tvsim','VEGAS TV Simulator',[P('Aperture grill',0,1,.5,.01),P('Interlacing',0,1,.5,.01),P('Static',0,1,.15,.01),S('Disturbance',['None','Line sync','Vertical sync','Scan phasing','Phosphorescence'])],
  `vec2 q=uv;int dm=int(u_p3+.5);vec2 px=PX(uv);
  if(dm==1){float ln=floor(px.y/2.);q.x+=((hash(vec2(ln,3.))-.5)*.012+.012*sin(px.y*.045))*(.4+.6*step(.6,hash(vec2(floor(px.y/24.),9.))));}
  if(dm==2)q.y=fract(q.y+.37);
  vec3 col=T(q).rgb;
  if(dm==2){float e=fract(uv.y+.37);col*=smoothstep(0.,.035,e)*smoothstep(0.,.035,1.-e);}
  float k=mod(floor(px.x),3.);vec3 gm=k<.5?vec3(1.,.3,.3):k<1.5?vec3(.3,1.,.3):vec3(.3,.3,1.);col=mix(col,col*gm*1.75,u_p0*.8);
  col*=1.-u_p1*.55*mod(floor(px.y/2.),2.);
  if(dm==3)col*=1.+.45*pow(.5+.5*sin(uv.y*6.2832*2.5+u_seed*6.),6.);
  if(dm==4)col+=vec3(.08,.22,.55)*blurL(q,3.)*.6;
  float n=hash(floor(px));col=mix(col,vec3(n),u_p2*.65);
  return vec4(clamp(col,0.,1.),1.);`,
  'VEGAS TV Simulator (manual controls, approx.): aperture grill = vertical RGB phosphor stripes, interlacing = alternate 2-line bands darkened, static = per-pixel random snow; Disturbance picks one of line sync (row jitter + waving), vertical sync (rolled frame with a black blanking bar), scan phasing (rolling light band) and phosphorescence (blue phosphor glow); detail zoom fixed at 1; seeded', 1);
f = add('Frames');
f('q12_vegas_cookie','VEGAS Cookie Cutter',[S('Shape',['Circle','Oval','Square','Diamond','Triangle up','Triangle down','Triangle left','Triangle right']),P('Size',.05,1.5,.75,.01),P('Feather',0,1,.1,.01),S('Then',['Cut everything apart from section','Same with border','Cut section','Cut section with border'])],
  `vec2 p=(uv-.5)*vec2(asp(),1.)/(u_p1*.5);int s=int(u_p0+.5);float d;
  if(s==0)d=length(p)-1.;else if(s==1)d=(length(p*vec2(.6,1.))-1.)*.8;else if(s==2)d=max(abs(p.x),abs(p.y))-1.;
  else if(s==3)d=(abs(p.x)+abs(p.y)-1.)*.7071;
  else{vec2 t=s==4?p:s==5?vec2(p.x,-p.y):s==6?vec2(p.y,-p.x):vec2(p.y,p.x);float kk=1.7320508;t.x=abs(t.x)-1.;t.y=t.y+1./kk;
   if(t.x+kk*t.y>0.)t=vec2(t.x-kk*t.y,-kk*t.x-t.y)/2.;t.x-=clamp(t.x,-2.,0.);d=-length(t)*sign(t.y);}
  float fe=u_p2*.5+.004;int th=int(u_p3+.5);bool inv=th>=2;bool brd=th==1||th==3;
  float keep=1.-smoothstep(-fe,fe,d);if(inv)keep=1.-keep;vec3 col=O(uv).rgb*keep;
  if(brd){float bw=.08;float b=inv?smoothstep(-bw-fe,-bw+fe,d)*(1.-smoothstep(-fe,fe,d)):smoothstep(-fe,fe,d)*(1.-smoothstep(bw-fe,bw+fe,d));col=mix(col,vec3(1.),b);}
  return vec4(col,1.);`,
  'VEGAS Cookie Cutter: a centred shape (circle, oval, square, diamond, triangles - signed-distance shapes) with feathered edge; "cut everything apart from section" keeps the video inside the shape, "cut section" removes it; optional white border band; the cut-away area is black here (transparent in VEGAS); repeat X/Y and centre not exposed');

/* ---- ImageMagick extras ---- */
f = add('Tone');
f('q12_mg_function','ImageMagick -function Arcsin / Arctan',[S('Function',['Arcsin','Arctan']),P('Width (arcsin) or slope (arctan)',.05,4,1,.01),P('Center',0,1,.5,.01),P('Range',0,2,1,.01)],
  `vec3 x=c.rgb;vec3 r;
  if(u_p0<.5){vec3 t=2./u_p1*(x-u_p2);r=u_p3/PI*asin(clamp(t,-1.,1.))+.5;}
  else r=u_p3/PI*atan(PI*u_p1*(x-u_p2))+.5;
  return vec4(clamp(r,0.,1.),1.);`,
  'ImageMagick ApplyFunction (statistic.c), per channel, bias 0.5: Arcsin width,center,range: t = 2/width*(v-center), out = range/pi*asin(t)+bias, pegged at bias +- range/2 outside |t|<1; Arctan slope,center,range: out = range/pi*atan(pi*slope*(v-center))+bias');
f('q12_mg_rangethresh','ImageMagick -range-threshold',[P('Low black',0,1,.2,.01),P('Low white',0,1,.4,.01),P('High white',0,1,.6,.01),P('High black',0,1,.8,.01)],
  `float v=luma(c.rgb);float r;
  if(v<u_p0)r=0.;else if(v<u_p1)r=(v-u_p0)/max(u_p1-u_p0,1e-5);else if(v<=u_p2)r=1.;else if(v<=u_p3)r=(u_p3-v)/max(u_p3-u_p2,1e-5);else r=0.;
  return vec4(vec3(clamp(r,0.,1.)),1.);`,
  'ImageMagick RangeThresholdImage (threshold.c): on the pixel intensity (Rec.709 luma, IM default) - 0 below low-black, linear ramp up to low-white, 1 up to high-white, linear ramp down to 0 at high-black, 0 above (a soft band-pass threshold)');
f('q12_mg_threshops','ImageMagick -white-threshold / -color-threshold',[S('Operator',['White-threshold (intensity)','White-threshold (per channel)','Color-threshold']),P('Threshold (white)',0,1,.6,.01),S('Colour box (color)',['Reds','Greens','Blues','Skin tones','Sky','Shadows','Highlights','Foliage']),P('Widen box (color)',-.2,.3,0,.01)],
  `int m=int(u_p0+.5);vec3 o=c.rgb;
  if(m==0){if(luma(o)>u_p1)o=vec3(1.);}
  else if(m==1){o=mix(o,vec3(1.),vec3(greaterThan(o,vec3(u_p1))));}
  else{int b=int(u_p2+.5);vec3 lo,hi;
   if(b==0){lo=vec3(.5,0.,0.);hi=vec3(1.,.45,.45);}else if(b==1){lo=vec3(0.,.35,0.);hi=vec3(.55,1.,.55);}
   else if(b==2){lo=vec3(0.,0.,.35);hi=vec3(.55,.65,1.);}else if(b==3){lo=vec3(.45,.25,.15);hi=vec3(1.,.85,.75);}
   else if(b==4){lo=vec3(.3,.5,.7);hi=vec3(.85,.92,1.);}else if(b==5){lo=vec3(0.);hi=vec3(.25);}
   else if(b==6){lo=vec3(.75);hi=vec3(1.);}else{lo=vec3(0.,.1,0.);hi=vec3(.4,.5,.3);}
   lo-=u_p3;hi+=u_p3;o=vec3(all(greaterThanEqual(o,lo))&&all(lessThanEqual(o,hi))?1.:0.);}
  return vec4(o,1.);`,
  'ImageMagick threshold.c: WhiteThresholdImage - pixels whose intensity (Rec.709 luma) exceeds the threshold become white, others unchanged (per channel when a channel mask is set); ColorThresholdImage start-stop - pixels with every channel inside the [start,stop] RGB box become white, all others black. The box is given here by a named preset (start/stop sRGB colours) that Widen grows or shrinks');
f = add('Edges');
f('q12_mg_peaks','ImageMagick Peaks Kernel (Hit-and-Miss)',[P('Inner radius',0,7,2.65,.05,'px'),P('Outer radius',1,8,3.32,.05,'px'),P('Gain',1,16,6,.1),S('Polarity',['Peaks (bright)','Valleys (dark)'])],
  `float l1=floor(min(u_p0,u_p1)*min(u_p0,u_p1)),l2=floor(max(u_p0,u_p1)*max(u_p0,u_p1));bool vy=u_p3>.5;
  vec3 ce=c.rgb;if(vy)ce=1.-ce;vec3 mx=vec3(0.);
  for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){float rr=float(i*i+j*j);if(rr<=l1||rr>l2)continue;vec3 s=T(uv+vec2(float(i),float(j))*u_k*u_px).rgb;if(vy)s=1.-s;mx=max(mx,s);}
  return vec4(clamp(max(ce-mx,0.)*u_p2,0.,1.),1.);`,
  'ImageMagick -morphology HitAndMiss Peaks:r1,r2 (morphology.c): kernel = centre pixel foreground, ring of pixels with r1^2 < u^2+v^2 <= r2^2 background (default ring 7 < d^2 <= 11); grey hit-and-miss = min(foreground) - max(background), never negative, per channel; Gain scales the (usually faint) response, Valleys runs it on the negated image');

/* ---- Topaz Studio 2 ---- */
const Q12_MSB = (a,b,cc) => [
  `float s1=R(${a}),s2=R(${b}),s3=R(${cc});vec3 sg=vec3(s1,s2,s3);vec3 st=max(vec3(1.),3.*sg/24.);vec3 acc=vec3(0.),w=vec3(0.);
  for(int i=-24;i<=24;i++){vec3 x=float(i)*st;vec3 g=exp(-x*x/(2.*sg*sg));acc+=g*vec3(L(uv+vec2(x.x,0.)*u_px),L(uv+vec2(x.y,0.)*u_px),L(uv+vec2(x.z,0.)*u_px));w+=g;}
  return vec4(L(uv),acc/w);`,
  `float s1=R(${a}),s2=R(${b}),s3=R(${cc});vec3 sg=vec3(s1,s2,s3);vec3 st=max(vec3(1.),3.*sg/24.);vec3 acc=vec3(0.),w=vec3(0.);
  for(int i=-24;i<=24;i++){vec3 x=float(i)*st;vec3 g=exp(-x*x/(2.*sg*sg));acc+=g*vec3(T(uv+vec2(0.,x.x)*u_px).g,T(uv+vec2(0.,x.y)*u_px).b,T(uv+vec2(0.,x.z)*u_px).a);w+=g;}
  return vec4(T(uv).r,acc/w);`];
f = add('Tone');
f('q12_tz_precisioncontrast','Topaz Precision Contrast',[P('Micro contrast',-1,1,.4,.01),P('Small contrast',-1,1,.3,.01),P('Medium contrast',-1,1,.2,.01),P('High contrast',-1,1,0,.01)],
  [...Q12_MSB('1.5','5.','16.'),
  `
#define Q12K(dv,aa) ((dv)*(1.+((aa)>0.?(aa)*3./(1.+abs(dv)*10.):(aa)*.8)))
  vec3 o=O(uv).rgb;float l0=luma(o);vec4 t=T(uv);float d0=l0-t.g,d1=t.g-t.b,d2=t.b-t.a;
  float base=t.a+u_p3*(.5*(t.a-.5)-.6*(t.a-.5)*abs(t.a-.5)*2.)*1.4;
  float nl=base+Q12K(d2,u_p2)+Q12K(d1,u_p1)+Q12K(d0,u_p0);
  return vec4(clamp(o+(nl-l0),0.,1.),1.);`],
  'Topaz Studio 2 Precision Contrast (approx.): luminance split into a Gaussian band stack (sigma 1.5 / 5 / 16 px): micro, small and medium bands are amplified with a magnitude-dependent gain d*(1+3a/(1+10|d|)) so strong edges get little extra (no halos), negative values flatten a band; High contrast is a soft S-curve on the base layer; the luminance change is added to RGB');
f = add('Sharpen');
f('q12_tz_precisiondetail','Topaz Precision Detail',[P('Small details',-1,1,.5,.01),P('Medium details',-1,1,.3,.01),P('Large details',-1,1,.15,.01),S('Mode',['Detail','Boost (weak detail)'])],
  [...Q12_MSB('.8','2.5','7.'),
  `vec3 o=O(uv).rgb;float l0=luma(o);vec4 t=T(uv);float d0=l0-t.g,d1=t.g-t.b,d2=t.b-t.a;bool bo=u_p3>.5;
  vec3 a=vec3(u_p0,u_p1,u_p2);vec3 dd=vec3(d0,d1,d2);
  vec3 gpos=bo?a*4./(1.+abs(dd)*40.):a*2./(1.+abs(dd)*4.);vec3 gn=mix(gpos,a,vec3(lessThan(a,vec3(0.))));
  float nl=t.a+dot(dd,vec3(1.)+gn);
  return vec4(clamp(o+(nl-l0),0.,1.),1.);`],
  'Topaz Studio 2 Precision Detail (approx. of Topaz Detail): luminance band stack (sigma 0.8 / 2.5 / 7 px) with small, medium and large detail sliders; Detail mode = gain softly limited on strong edges, Boost = gain concentrated on low-amplitude detail (weak texture lifted, strong edges left alone); negative values soften that band');
f = add('Tone');
f('q12_tz_edgeexposure','Topaz Edge Exposure',[P('Exposure',-3,3,-1,.05,'EV'),P('Edge size',0,1,.35,.01),P('Transition',0,1,.6,.01),S('Edges',['All four','Top and bottom','Left and right','Top','Bottom','Elliptical'])],
  `vec2 d=abs(uv-.5)*2.;int m=int(u_p3+.5);float e=m==0?max(d.x,d.y):m==1?d.y:m==2?d.x:m==3?uv.y:m==4?1.-uv.y:length((uv-.5)*vec2(asp(),1.))/length(vec2(asp(),1.)*.5);
  float s0=1.-u_p1;float w=smoothstep(s0,s0+max(u_p2,.02)*u_p1+1e-4,e);
  vec3 lin=pow(c.rgb,vec3(2.2))*exp2(u_p0*w);
  return vec4(clamp(pow(lin,vec3(1./2.2)),0.,1.),1.);`,
  'Topaz Studio 2 Edge Exposure (approx.): exposure change in EV applied in linear light along the frame edges - all four, top and bottom, left and right, top, bottom or an elliptical vignette - with Edge size = band width and Transition = softness of the ramp; negative darkens (drama), positive brightens (light leak)');
f = add('Stylize');
f('q12_tz_radiance','Topaz Radiance',[S('Type',['Light','Dark']),P('Strength',0,1,.6,.01),P('Diffusion',1,40,8,1,'px'),P('Contour sensitivity',.5,8,4,.1)],
  [`float e=clamp(length(sobel(uv))*u_p3*.5,0.,1.);e=e*e*(3.-2.*e);vec3 col=T(uv).rgb;vec3 s=clamp(mix(vec3(luma(col)),col,1.6),0.,1.);
   return vec4(u_p0<.5?(s*.6+.4)*e:vec3(e),1.);`,
   BH('u_p2'),BV('u_p2'),
  `vec3 o=O(uv).rgb;vec3 g=T(uv).rgb;vec3 r;
  if(u_p0<.5)r=1.-(1.-o)*(1.-clamp(g*u_p1*3.,0.,1.));
  else r=o*(1.-clamp(luma(g)*u_p1*2.,0.,.92));
  return vec4(clamp(r,0.,1.),1.);`],
  'Topaz Studio 2 Radiance (approx. from the product description): image contours (Sobel magnitude x sensitivity, smoothstep) coloured by the saturated image, diffused by a Gaussian of Diffusion px and screened over the photo (Light: glowing, neon-like contours) or multiplied in as shadow (Dark: somber fibre webs)');

/* ---- Filter Forge distortions ---- */
f = add('Distort');
f('q12_ff_uberooze','uberOOZE (Filter Forge)',[P('Distortion',0,1,.5,.01),P('Intricacy',0,1,.4,.01),P('Smoothness',0,1,.6,.01),P('Shading',0,1,.5,.01)],
  `vec2 ar=vec2(asp(),1.);vec2 p0=uv*ar*mix(2.,5.,u_p1);float pers=mix(.65,.3,u_p2);int oc=2+int(u_p1*4.+.5);
  float h[3];vec2 ofs[3]=vec2[3](vec2(0.),vec2(.01,0.),vec2(0.,.01));
  for(int k=0;k<3;k++){vec2 p=p0+ofs[k];vec2 wq=vec2(vnoise(p*.7+11.3),vnoise(p*.7+47.1))-.5;p+=wq*2.5;float a=1.,s=0.,nn=0.;
   for(int o=0;o<6;o++){if(o>=oc)break;s+=a*vnoise(p);nn+=a;p=p*2.02+vec2(5.2,1.3);a*=pers;}h[k]=s/nn;}
  vec2 gr=vec2(h[1]-h[0],h[2]-h[0])/.01;
  vec2 q=uv+gr/ar*u_p0*.06;vec3 col=T(clamp(q,0.,1.)).rgb;
  vec3 n=normalize(vec3(-gr*.25,1.));float df=dot(n,normalize(vec3(-.5,.6,.7)));float sp=pow(max(dot(reflect(vec3(0.,0.,-1.),n),normalize(vec3(-.4,.5,.8))),0.),24.);
  col=col*mix(1.,.55+.6*df,u_p3)+sp*u_p3*.8;
  return vec4(clamp(col,0.,1.),1.);`,
  'Filter Forge uberOOZE by uberzev (approx. from its controls Distortion, Intricacy, Smoothness, Shading): a domain-warped multi-octave noise height field (Intricacy = scale and octaves, Smoothness = lower persistence) whose gradient refracts the image like a layer of runny goo, lit with diffuse + specular shading from the same field; seeded', 1);
f('q12_ff_spheretown','sphere town (Filter Forge)',[P('Repeat',1,8,3,.1),P('Curve',0,1,.7,.01),P('Sectors',0,12,0,1),S('Invert',['No','Yes'])],
  `vec2 ar=vec2(asp(),1.);vec2 d=(uv-.5)*ar/(.5*min(asp(),1.));float r=length(d);vec3 bg=T(uv).rgb*.55+.2;
  if(r>=1.)return vec4(bg,1.);
  float z=sqrt(1.-r*r);float rs=mix(r,asin(r)/(PI*.5),u_p1);if(u_p3>.5)rs=1.-rs;
  float t=rs*u_p0;float fr=fract(t);if(mod(floor(t),2.)>.5)fr=1.-fr;
  float a=atan(d.y,d.x);float ns=floor(u_p2+.5);if(ns>.5){float w=2.*PI/ns;a=mod(a,w);a=min(a,w-a);}
  vec2 src=.5+vec2(cos(a),sin(a))*fr*.5/ar*min(asp(),1.);vec3 col=T(src).rgb;
  float sp=pow(max(dot(normalize(vec3(d,z)),normalize(vec3(-.4,.5,.8))),0.),30.);
  col=col*mix(1.,.45+.55*z,u_p1)+sp*.5*u_p1;float edge=smoothstep(1.,.985,r);
  return vec4(mix(bg,clamp(col,0.,1.),edge),1.);`,
  'Filter Forge sphere town by voldemort ("spherical deform of your photo without a height map", controls Repeat / Curve Sector / Invert; approx.): inside a centred disc the radius is mapped through a sphere profile (asin, Curve = amount), repeated Repeat times with mirrored rings and optionally folded into angular sectors, then shaded as a glossy ball over a dimmed background');
f('q12_ff_marbled','Marbled Papers (Filter Forge)',[P('Pull',0,1,.35,.01),P('Rake 1 tines',2,40,10,1),P('Rake 2 tines',2,40,4,1),P('Rake 3 waves',0,12,3,.5)],
  `vec2 ar=vec2(asp(),1.);vec2 q=uv*ar;float A=u_p0*.5;
  q.x-=A*.25*sin(6.2832*q.y*u_p3);
  float sp2=1./u_p2;float d2=abs(fract(q.y/sp2+.5)-.5)*sp2;float lm2=sp2*.12;q.x-=A*.6*lm2/(d2+lm2);
  float sp1=ar.x/u_p1;float d1=abs(fract(q.x/sp1+.5)-.5)*sp1;float lm1=sp1*.1;float sg=mod(floor(q.x/sp1+.5),2.)>.5?-1.:1.;q.y+=sg*A*lm1/(d1+lm1);
  vec2 s=q/ar;s=abs(fract(s*.5+.5)*2.-1.);
  return vec4(T(s).rgb,1.);`,
  'Filter Forge Marbled Papers by ThreeDee (approx.): the image is combed like ink on a marbling bath with three rakes, inverted in reverse order - Rake 1 vertical tines alternately pulling up/down, Rake 2 horizontal tines pulling sideways, Rake 3 a wavy (sinusoidal) stroke; each tine uses the Jaffer-Lu tine-line displacement A*lambda/(d+lambda), which keeps distance to the line so the inverse is exact; mirrored edges');
