/* ================= q01: Boris FX Sapphire (round 12) — glows, glints, rays, edges, blurs, colour, laser ================= */
const Q01_SPEC = `
#define Q01SPEC(hh) clamp(abs(fract((hh)+vec3(1.,2./3.,1./3.))*6.-3.)-1.,0.,1.)
`;
f = add('Stylize');
f('q01_glows','Sapphire Glows (Orthicon / Rings / Rainbow / Noise)',[S('Mode',['Orthicon (dark glow)','Glow Rings','Glow Rainbow','Glow Noise']),P('Threshold',0,1,.6,.01),P('Width',2,120,30,1,'px'),P('Brightness or Darkness',0,4,1.5,.01)],
  [`vec3 b=max(c.rgb-u_p1,0.)/max(1.-u_p1,.05);return vec4(b,1.);`,
   `return blur1d(u_tex,uv,vec2(1.,0.),R(u_p2)*.08);`,
   `return blur1d(u_tex,uv,vec2(0.,1.),R(u_p2)*.08);`,
   Q01_SPEC + `int m=int(u_p0+.5);float W=max(R(u_p2),1.);vec3 acc=vec3(0.),ws=vec3(0.);float RM=m==1?W*1.5:W*2.2;
   for(int i=0;i<22;i++){float r=(float(i)+.5)/22.*RM;float x=r/W;vec3 w;
     if(m==1){vec3 rc=vec3(1.,.82,.64);vec3 dd=(x-rc)/.11;w=exp(-dd*dd);}else w=vec3(exp(-x*x*(m==2?.8:1.5)));
     vec3 col=m==2?Q01SPEC(x*.36)*1.7:vec3(1.);
     for(int j=0;j<16;j++){float an=(float(j)+.618*float(i))*PI/8.;vec3 v=T(uv+vec2(cos(an),sin(an))*r*u_px).rgb;
       if(m==2)acc+=luma(v)*col*w*r;else acc+=v*w*r;ws+=w*r;}}
   vec3 o=O(uv).rgb;vec3 g=acc/max(ws,vec3(1e-4));
   if(m==0){float pr=smoothstep(0.,.25,luma(T(uv).rgb));float dk=clamp(luma(g)*u_p3*4.,0.,.95)*(1.-pr);return vec4(o*(1.-dk),1.);}
   g=1.-exp(-g*(m==1?4.:m==2?3.:2.));
   if(m==3){vec2 p=PX(uv);float n=fbm(p*.2)*fbm(p*.06+9.);g*=clamp(n*7.-.7,0.,3.);}
   return vec4(screen(o,clamp(g*u_p3,0.,1.)),1.);`],
  'Boris FX Sapphire S_GlowOrthicon (darkens a wide area around brights, bright cores protected), S_GlowRings (ring-shaped kernel per channel at radii 1 / .82 / .64 x Width, so colour shifts with distance), S_GlowRainbow (glow coloured by a spectrum that cycles with distance from the bright edge), S_GlowNoise (gaussian glow modulated by a fizzing noise texture); polar gather of the thresholded image, screen combine', 1);
f('q01_glintrainbow','Glint Rainbow (Sapphire)',[P('Size',4,200,40,1,'px'),P('Threshold',0,1,.75,.01),P('Brightness',0,4,1.5,.01),P('Rainbow Spread',0,1,.7,.01)],
  [`vec3 b=max(c.rgb-u_p1,0.)/max(1.-u_p1,.05);return vec4(b,1.);`,
   Q01_SPEC + `float Lr=R(u_p0);vec3 acc=vec3(0.);
   for(int d=0;d<8;d++){float an=float(d)*PI/4.;vec2 dir=vec2(cos(an),sin(an));float bw=(d==1||d==3||d==5||d==7)?.55:1.;
     for(int i=1;i<=32;i++){float t=float(i)/32.;float v=luma(T(uv-dir*t*Lr*u_px).rgb);if(v<=0.)continue;
       vec3 col=mix(vec3(1.),Q01SPEC(t*.8)*1.6,u_p3*smoothstep(0.,.3,t));acc+=v*col*pow(1.-t,2.)*bw;}}
   vec3 g=acc*u_p2*.18+T(uv).rgb*u_p2*.5;return vec4(screen(O(uv).rgb,clamp(g,0.,1.)),1.);`],
  'Boris FX Sapphire S_GlintRainbow: 4-way star glints (X, Y and two weaker diagonals) from pixels above Threshold, each ray running white at the core into a spectrum toward its tip; screen combine', 0);
f('q01_edgerays','Edge Rays (Sapphire)',[P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01),P('Rays Length',-1,1,.35,.01),P('Brightness',0,4,1.5,.01)],
  [`vec2 g=sobel(uv);float e=clamp(length(g)*1.5,0.,1.);return vec4(c.rgb*e+e*.1,1.);`,
   `vec2 C=vec2(u_p0,u_p1);vec3 acc=vec3(0.);
   for(int i=0;i<64;i++){float s=(float(i)+.5)/64.;vec3 k=s*u_p2*vec3(1.07,1.,.93);float w=1.-s;
     acc+=vec3(T(uv+(C-uv)*k.r).r,T(uv+(C-uv)*k.g).g,T(uv+(C-uv)*k.b).b)*w;}
   acc/=32.;return vec4(O(uv).rgb+acc*u_p3*.9,1.);`],
  'Boris FX Sapphire S_EdgeRays: Sobel edges (coloured by the source) emit light beams radiating away from Center (negative length beams inward), red/green/blue lengths slightly different for fringing; added to the source', 0);

f = add('Depth');
f('q01_zglow','Z Glow (depth-varying glow, Sapphire)',[P('Width Near',1,80,6,1,'px'),P('Width Far',1,80,36,1,'px'),P('Threshold',0,1,.55,.01),P('Brightness',0,4,1.5,.01)],
  [`vec3 b=max(c.rgb-u_p2,0.)/max(1.-u_p2,.05);return vec4(b,1.);`,
   `float Wm=R(max(u_p0,u_p1))*2.5;vec3 acc=vec3(0.);
   for(int i=0;i<24;i++){float r=(float(i)+.5)/24.*Wm;
     for(int j=0;j<16;j++){float an=(float(j)+.618*float(i))*PI/8.;vec2 q=uv+vec2(cos(an),sin(an))*r*u_px;
       float sg=max(R(mix(u_p1,u_p0,D(q))),.7);vec3 s3=sg*vec3(1.15,1.,.87);acc+=T(q).rgb*exp(-r*r/(2.*s3*s3))*r/(s3*s3);}}
   acc*=Wm/24./16.;return vec4(screen(O(uv).rgb,clamp(acc*u_p3,0.,1.)),1.);`],
  'Boris FX Sapphire S_ZGlow: glow width interpolated from Width Near to Width Far by the depth of the glowing pixel (scatter-as-gather: each source sample spreads with its own depth-dependent gaussian), red wider than blue so glow colour shifts with distance; screen combine', 0);

f = add('Edges');
f('q01_edges','Sapphire Edge Effects (Colorize / Double / In Direction)',[S('Mode',['Edge Colorize','Edge Detect Double','Edges In Direction']),P('Edge Smooth',0,10,1.5,.1,'px'),P('Brightness',0,4,1.5,.01),P('Angle',0,360,0,1,'deg')],
  [BH('u_p1'),BV('u_p1'),
   `int m=int(u_p0+.5);float st=max(1.,R(u_p1)*.75);vec2 e=u_px*st;float G=3.*u_p2*sqrt(st);
   vec3 gx=(T(uv+vec2(e.x,0.)).rgb-T(uv-vec2(e.x,0.)).rgb)*.5,gy=(T(uv+vec2(0.,e.y)).rgb-T(uv-vec2(0.,e.y)).rgb)*.5;
   if(m==0){vec2 gl=vec2(luma(gx),luma(gy));float mag=clamp(length(gl)*G*2.,0.,1.5);float an=atan(gl.y,gl.x)+radians(u_p3);
     vec3 col=max(sin(an),0.)*vec3(1.,.85,.15)+max(cos(an),0.)*vec3(.15,.75,1.)+max(-sin(an),0.)*vec3(1.,.2,.6)+max(-cos(an),0.)*vec3(.3,1.,.3);
     return vec4(col*mag,1.);}
   if(m==1)return vec4(sqrt(gx*gx+gy*gy)*G,1.);
   vec2 dv=vec2(cos(radians(u_p3)),sin(radians(u_p3)));return vec4(max((gx*dv.x+gy*dv.y)*G*2.,0.),1.);`,
   `if(int(u_p0+.5)!=1)return c;vec3 gx=(T(uv+vec2(u_px.x,0.)).rgb-T(uv-vec2(u_px.x,0.)).rgb)*.5,gy=(T(uv+vec2(0.,u_px.y)).rgb-T(uv-vec2(0.,u_px.y)).rgb)*.5;
   return vec4(clamp(sqrt(gx*gx+gy*gy)*2.5,0.,1.),1.);`],
  'Boris FX Sapphire S_EdgeColorize (edges coloured by the direction they face: top yellow, right cyan, bottom pink, left green; Angle rotates the colours), S_EdgeDetectDouble (edge detect run twice: the edges of the edge image, giving double-stranded lines), S_EdgesInDirection (only edges whose gradient points along Angle); Edge Smooth = gaussian pre-blur that thickens the edges', 0);

f = add('Blur');
f('q01_blurchroma','Blur Chroma (Sapphire)',[P('Blur Chroma',0,60,12,.5,'px'),P('Blur Luminance',0,30,0,.5,'px'),P('Scale Chroma',0,3,1,.01),P('Mix With Source',0,1,0,.01)],
  [`float rc=R(u_p0),rl=R(u_p1);float rm=max(max(rc,rl),.5);float st=max(1.,rm/24.);float sc=max(rc*.5,.01),sl=max(rl*.5,.01);vec2 acc=vec2(0.);float wc=0.,ay=0.,wl=0.;
   for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>rm)continue;vec3 v=O(uv+vec2(x,0.)*u_px).rgb;float yy=luma(v);vec2 cc=vec2((v.b-yy)/1.8556,(v.r-yy)/1.5748);
     float gc=abs(x)<=rc?exp(-x*x/(2.*sc*sc)):0.;float gl=abs(x)<=rl?exp(-x*x/(2.*sl*sl)):0.;acc+=cc*gc;wc+=gc;ay+=yy*gl;wl+=gl;}
   return vec4(ay/wl,acc/wc+.5,1.);`,
   `float rc=R(u_p0),rl=R(u_p1);float rm=max(max(rc,rl),.5);float st=max(1.,rm/24.);float sc=max(rc*.5,.01),sl=max(rl*.5,.01);vec2 acc=vec2(0.);float wc=0.,ay=0.,wl=0.;
   for(int i=-24;i<=24;i++){float x=float(i)*st;if(abs(x)>rm)continue;vec3 v=T(uv+vec2(0.,x)*u_px).rgb;
     float gc=abs(x)<=rc?exp(-x*x/(2.*sc*sc)):0.;float gl=abs(x)<=rl?exp(-x*x/(2.*sl*sl)):0.;acc+=(v.yz-.5)*gc;wc+=gc;ay+=v.x*gl;wl+=gl;}
   return vec4(ay/wl,acc/wc+.5,1.);`,
   `vec3 v=c.rgb;float yy=v.x;vec2 cc=(v.yz-.5)*u_p2;float rr=yy+1.5748*cc.y,bb=yy+1.8556*cc.x,gg=(yy-.2126*rr-.0722*bb)/.7152;
   return vec4(mix(clamp(vec3(rr,gg,bb),0.,1.),O(uv).rgb,u_p3),1.);`],
  'Boris FX Sapphire S_BlurChroma: image split into Rec.709 luma and chroma (Cb, Cr), each gaussian-blurred by its own amount, chroma scaled, recombined; Mix With Source blends back the original', 0);
f('q01_defocusprism','Defocus Prism (Sapphire)',[P('Defocus Width',1,60,14,.5,'px'),S('Shape',['Circle','Triangle','Square','Pentagon','Hexagon','Octagon']),P('Chroma Sep',0,1,.4,.01),P('Boost Highlights',0,4,1.5,.01)],
  `
#define Q01LB(v) (pow(max(v,vec3(0.)),vec3(2.2))*(1.+u_p3*3.*smoothstep(.7,1.,luma(v))))
  int sh=int(u_p1+.5);float n=sh==1?3.:sh==2?4.:sh==3?5.:sh==4?6.:8.;float W=R(u_p0);vec3 acc=vec3(0.);vec3 sc=1.+vec3(.5,0.,-.5)*u_p2;
  for(int i=0;i<100;i++){float fi=float(i)+.5;float rr=sqrt(fi/100.);float an=fi*2.39996;float pr=1.;
    if(sh>0){float seg=2.*PI/n;float aa=mod(an+PI*.5,seg)-seg*.5;pr=cos(seg*.5)/cos(aa);}
    vec2 o=vec2(cos(an),sin(an))*rr*pr*W*u_px;
    acc.r+=Q01LB(O(uv+o*sc.r).rgb).r;acc.g+=Q01LB(O(uv+o*sc.g).rgb).g;acc.b+=Q01LB(O(uv+o*sc.b).rgb).b;}
  return vec4(clamp(pow(acc/100.,vec3(1./2.2)),0.,1.),1.);`,
  'Boris FX Sapphire S_DefocusPrism: lens defocus with a circular or polygonal iris (100-tap disc gather in linear light), the red / green / blue discs of different widths (Chroma Sep) so bokeh and edges split into colour rings, highlights above ~0.7 boosted before the blur', 0);

f = add('Distort');
f('q01_warprepeat','Warp Repeat / Mo Curves Blur / Warp Chroma (Sapphire)',[S('Mode',['Warp Repeat','Mo Curves Blur','Warp Chroma']),P('Z Dist',.3,2,.8,.01),P('Rotate',-180,180,10,.5,'deg'),P('Shift X',-300,300,0,1,'px')],
  Q01_SPEC + `int m=int(u_p0+.5);vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;vec3 acc=vec3(0.),ws=vec3(0.);float t0=m==1?.5:0.;float shx=fromPX(vec2(u_p3,0.)).x*asp();
  for(int i=0;i<40;i++){float t=t0+(1.-t0)*(float(i)+.5)/40.;float zd=mix(1.,u_p1,t);float a=radians(u_p2)*t;
    vec2 q=rot(p-vec2(shx*t,0.),-a)*zd/A+.5;vec3 v=(q.x<0.||q.x>1.||q.y<0.||q.y>1.)?vec3(0.):O(q).rgb;
    vec3 w=m==2?Q01SPEC(.67*(1.-t)):vec3(m==1?t:1.);acc+=v*w;ws+=w;}
  return vec4(acc/ws,1.);`,
  'Boris FX Sapphire S_WarpRepeat (average of the image under 40 transforms interpolated from identity to the From transform: Z Dist zoom, Rotate and Shift X about the centre), S_BlurMoCurves (Transform and Blur: image moved to the transform and motion-blurred over the last half of its path, exposure ramped toward the end; a still has no animation curves, so the transform stands for one frame of motion), S_WarpChroma (each step tinted by a spectrum, red at From to blue at To, per-channel normalised so unwarped areas stay neutral)', 0);

f = add('Color');
f('q01_dogvision','Dog Vision (Sapphire)',[S('Channels',['Yellow-Blue','Cyan-Red','Magenta-Green']),P('Blur',0,10,1.5,.1,'px'),P('Rotate Channels',-180,180,0,1,'deg'),P('Saturation',0,2,1,.01)],
  [BH('u_p1'),BV('u_p1'),
   `vec3 v=c.rgb;int m=int(u_p0+.5);vec3 o;
   if(m==0){float a=(v.r+v.g)*.5;o=vec3(a,a,v.b);}else if(m==1){float a=(v.g+v.b)*.5;o=vec3(v.r,a,a);}else{float a=(v.r+v.b)*.5;o=vec3(a,v.g,a);}
   if(abs(u_p2)>.01){vec3 h=rgb2hsv(o);h.x=fract(h.x+u_p2/360.);o=hsv2rgb(h);}
   return vec4(clamp(sat(o,u_p3),0.,1.),1.);`],
  'Boris FX Sapphire S_DogVision: two-channel (dichromat) vision: the two confused primaries are averaged into one complementary channel (Yellow-Blue = dog vision: (R+G)/2 shown as yellow, B as blue), slight acuity blur, optional hue rotation of the two channels', 0);
f('q01_clampchroma','Clamp Chroma (Sapphire)',[P('Clamp Chroma',0,1,.5,.01),P('Scale Chroma',0,3,1,.01),P('Clamp Luma',0,1,1,.01),P('Scale Luma',0,2,1,.01)],
  `float yy=luma(c.rgb);vec2 cc=vec2((c.b-yy)/1.8556,(c.r-yy)/1.5748)*u_p1;float ch=length(cc)*2.;if(ch>u_p0)cc*=u_p0/max(ch,1e-5);yy=min(yy*u_p3,u_p2);
  float rr=yy+1.5748*cc.y,bb=yy+1.8556*cc.x,gg=(yy-.2126*rr-.0722*bb)/.7152;return vec4(clamp(vec3(rr,gg,bb),0.,1.),1.);`,
  'Boris FX Sapphire S_ClampChroma: Rec.709 YCbCr; chroma magnitude (2 x |CbCr|, about 1 for a pure primary) scaled then limited to Clamp Chroma without changing hue (broadcast-safe style); luma scaled then limited to Clamp Luma', 0);

f = add('Render');
f('q01_laserbeam','Laser Beam (Sapphire)',[P('Angle',-180,180,20,1,'deg'),P('Position',0,1,.6,.01),P('Length',.02,1,.3,.01),P('Width',1,40,6,.5,'px')],
  `vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;vec2 dir=vec2(cos(radians(u_p0)),sin(radians(u_p0)));float hl=.5*min(asp()/max(abs(dir.x),1e-3),1./max(abs(dir.y),1e-3));
  float st0=-1.05*hl,st1=1.05*hl;float hd=mix(st0,st1,u_p1);float tl=hd-u_p2*(st1-st0);float s=dot(p,dir),d=dot(p,vec2(-dir.y,dir.x));
  float sc=clamp(s,tl,hd);float uu=(sc-tl)/max(hd-tl,1e-5);float w=fromPX(vec2(0.,u_p3)).y*sqrt(max(sin(PI*clamp(uu,0.,1.)),.05));float dd=length(vec2(s-sc,d));
  float core=exp(-pow(dd/(w*.35),2.)),body=exp(-pow(dd/w,2.)),halo=exp(-dd/(w*4.))*.35;float atm=.6+.8*fbm(PX(uv)/40.);
  vec3 col=vec3(1.,.15,.08)*(body*1.2+halo*atm)+vec3(1.,.95,.9)*core;return vec4(screen(c.rgb,clamp(col,0.,1.)),1.);`,
  'Boris FX Sapphire S_LaserBeam (single frame, Smooth shape): a beam segment travelling along a path through the frame centre at Angle (start and stop just outside the frame), Position = progress along the path, white core + red edge + dusty atmospheric halo, screen combine', 1);
