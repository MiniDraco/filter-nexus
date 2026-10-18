/* ================= q01b: Boris FX Sapphire (round 12) — distorts, paint, textures, grain, damage ================= */
const Q01B_SPEC = `
#define Q01SPEC(hh) clamp(abs(fract((hh)+vec3(1.,2./3.,1./3.))*6.-3.)-1.,0.,1.)
`;
const Q01_RF = `float rf=max(1.,floor(R(u_p1)+.5));vec2 px=floor(uv*u_res/rf);`;
f = add('Distort');
f('q01_flyseyehex','Flys Eye Hex (Sapphire)',[P('Tile Frequency',3,60,9,1),P('Inside Z Dist',.1,6,2.5,.01),P('Overall Z Dist',0,2,.5,.01),P('Edge Softness',0,1,.15,.01)],
  `vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;float cell=asp()/u_p0;vec2 q=p/cell;vec2 sv=vec2(1.,1.7320508);vec2 h2=sv*.5;
  vec2 a=mod(q,sv)-h2,b=mod(q-h2,sv)-h2;vec2 gv=dot(a,a)<dot(b,b)?a:b;vec2 id=q-gv;
  float hd=max(abs(gv.x),dot(abs(gv),vec2(.5,.8660254)));
  vec2 ps=id*cell*u_p2+gv*cell*u_p1;vec2 s=ps/A+.5;s=1.-abs(1.-mod(s,2.));
  float v=1.-smoothstep(.5-.45*u_p3-.01,.5,hd)*.6;return vec4(O(s).rgb*v,1.);`,
  'Boris FX Sapphire S_FlysEyeHex: hexagonal tiles (Tile Frequency across the width); each tile shows the image zoomed about the tile (Inside Z Dist, >1 zooms out) taken from the tile position scaled toward the centre (Overall Z Dist; 0 = every tile shows the same image); reflect wrap; Edge Softness darkens the seams (approx.)', 0);
f('q01_kaleidodiamonds','Kaleido Diamonds (Sapphire)',[P('Rel Height',.3,3,1.4,.01),P('Rotate',-180,180,0,1,'deg'),P('Diamond Size',.05,1,.3,.01),P('Kaleido Amount',0,1,1,.01)],
  `vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;vec2 q=rot(p,radians(u_p1));q.y/=u_p0;float sz=u_p2*1.41421;
  vec2 dm=vec2(q.x+q.y,q.x-q.y)/sz;vec2 fd=abs(mod(dm+1.,2.)-1.);vec2 qb=vec2(fd.x+fd.y,fd.x-fd.y)*.5*sz;qb.y*=u_p0;vec2 pb=rot(qb,-radians(u_p1));
  vec2 s=mix(p,pb,u_p3)/A+.5;s=1.-abs(1.-mod(s,2.));return vec4(O(s).rgb,1.);`,
  'Boris FX Sapphire S_Kaleido:Diamonds: space folded by mirrors along a rotated diamond (rhombus) lattice, each diamond a reflected copy of the area at the centre; Rel Height stretches the diamonds (affine, approx. for non-square diamonds), Kaleido Amount blends from the source (0) to the full kaleidoscope (1)', 0);
f('q01_warpripples','Warp Puddle / Warp Drops (Sapphire)',[S('Mode',['Puddle','Drops (bright centres)']),P('Amplitude',0,40,8,.5,'px'),P('Frequency',1,40,10,.5),P('Outer Radius or Threshold',0,1,.6,.01)],
  [BH('12.'),BV('12.'),
   `int m=int(u_p0+.5);vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;vec2 disp=vec2(0.);float au=fromPX(vec2(0.,u_p1)).y;
   if(m==0){float r=length(p);float win=smoothstep(.0,.06,r)*(1.-smoothstep(u_p3*.8,u_p3,r));disp=(r>1e-4?p/r:vec2(0.))*sin(2.*PI*u_p2*r)*win*au;}
   else{float tot=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 cu=(vec2(float(i),float(j))+.5)/12.;float w=max(luma(T(cu).rgb)-u_p3,0.)/max(1.-u_p3,.05);if(w<=0.)continue;
     vec2 d=p-(cu-.5)*A;float r=length(d);float win=1.-smoothstep(.12,.35,r);disp+=(r>1e-4?d/r:vec2(0.))*sin(2.*PI*u_p2*r)*w*win;tot+=w*win;}
     disp*=au/max(1.,tot*.5);}
   vec2 s=(p+disp)/A+.5;s=1.-abs(1.-mod(s,2.));return vec4(O(s).rgb,1.);`],
  'Boris FX Sapphire S_WarpPuddle (concentric sine waves from the centre displacing the image radially, faded in near the centre and out at Outer Radius) and S_WarpDrops (each bright region above Threshold, found on a 12x12 grid of the blurred image, is a wave centre weighted by its brightness; ripples summed, approx.); single frame (no phase animation), reflect wrap', 0);
f('q01_stretchedges','Stretch Frame Edges (Sapphire)',[P('Center Squeeze',.5,2,1.33,.01),P('Center Width',0,.99,.4,.01),P('Smooth',0,1,.5,.01),P('Shift X',-1,1,0,.01)],
  `float x=uv.x*2.-1.;float sg=x<0.?-1.:1.;float ax=abs(x);float sq=u_p0;float cw=min(u_p1,.98/max(sq,1e-3));float L=(1.-cw*sq)/max(1.-cw,1e-4);float xs;
  if(ax<cw)xs=ax*sq;else{float t=(ax-cw)/max(1.-cw,1e-4);float p0=cw*sq;float m0=mix(L,sq,u_p2)*(1.-cw);float m1=max(2.*(1.-p0)-m0,0.);float t2=t*t,t3=t2*t;
    xs=(2.*t3-3.*t2+1.)*p0+(t3-2.*t2+t)*m0+(-2.*t3+3.*t2)+(t3-t2)*m1;}
  float sx=(sg*xs+1.)*.5+u_p3*.5;sx=1.-abs(1.-mod(sx,2.));return vec4(O(vec2(sx,uv.y)).rgb,1.);`,
  'Boris FX Sapphire S_StretchFrameEdges: the centre (Center Width of the frame) is squeezed horizontally by Center Squeeze (4:3 material stretched to 16:9 looks right again) while the sides are stretched to fill the frame; Smooth blends the two zones (cubic, slope-continuous at 1); Shift X with reflect wrap', 0);
f('q01_hyperpush','Hyper Push (Sapphire transition frame)',[P('Progress',0,1,.45,.01),P('Distortion',0,1,.5,.01),P('Glow',0,2,1,.01),P('Warp Chroma',0,1,.5,.01)],
  [Q01B_SPEC + `vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;float t=u_p0;float e=t*t*(3.-2.*t);vec3 acc=vec3(0.),ws=vec3(0.);
   for(int i=0;i<24;i++){float s=float(i)/23.;float tt=e*(1.-.3*s);float zd=mix(1.,.3,tt);float r2=dot(p,p);vec2 q=p*zd/(1.+u_p1*tt*2.*r2);
     vec2 su=q/A+.5;su=1.-abs(1.-mod(su,2.));vec3 w=mix(vec3(1.),Q01SPEC(.67*s)*1.5,u_p3);acc+=O(su).rgb*w;ws+=w;}
   return vec4(acc/ws,1.);`,
   `float t=u_p0;vec3 g=vec3(0.);float W=R(25.);for(int i=0;i<10;i++){float r=(float(i)+.5)/10.*W;for(int j=0;j<12;j++){float an=(float(j)+.5*float(i))*PI/6.;vec3 v=T(uv+vec2(cos(an),sin(an))*r*u_px).rgb;g+=max(v-.6,0.)*exp(-r*r/(W*W*.3))*r/W;}}
   g*=u_p2*.12*(.3+sin(PI*t));float fade=1.-smoothstep(.55,1.,t);return vec4(screen(c.rgb,clamp(g,0.,1.))*fade,1.);`],
  'Boris FX Sapphire S_HyperPush as a single transition frame with no second clip (dissolves to black): image pushed toward the camera (zoom) with a fisheye bulge (Distortion), motion-blurred along the push and split into a spectrum (Warp Chroma), bright areas glowing; Progress = transition position (approx.)', 0);

f = add('Blur');
f('q01_freelens','Free Lens (Sapphire)',[P('Lens Shift',-1,1,.35,.01),P('Defocus Width',0,40,12,.5,'px'),P('Leak Intensity',0,1,.5,.01),P('Chroma Distort',0,1,.35,.01)],
  `vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;float fx=u_p0*.4*asp();float bl=R(u_p1)*clamp(abs(p.x-fx)*1.6+.1*length(p),0.,1.6);
  vec2 pd=p*(1.+.06*dot(p,p))-vec2(u_p0*.05,0.);vec2 bs=pd/A+.5;vec3 acc=vec3(0.);vec3 sc=1.+vec3(.6,0.,-.6)*u_p3;vec2 ca=p*u_p3*.012;
  for(int i=0;i<48;i++){float fi=float(i)+.5;float rr=sqrt(fi/48.);float an=fi*2.39996;vec2 o=vec2(cos(an),sin(an))*rr*bl*u_px;
    acc.r+=pow(O(bs+o*sc.r+ca).r,2.2);acc.g+=pow(O(bs+o).g,2.2);acc.b+=pow(O(bs+o*sc.b-ca).b,2.2);}
  vec3 col=pow(acc/48.,vec3(1./2.2));vec2 lc=vec2((u_p0<0.?-1.:1.)*asp()*.55,.15);float ld=length((p-lc)*vec2(.8,1.));float lk=exp(-ld*ld*3.)*u_p2*1.6;
  vec3 leak=mix(vec3(1.,.85,.4),vec3(1.,.25,.05),smoothstep(0.,.6,ld));col=screen(col,clamp(leak*lk*1.3,0.,1.));col*=1.-.3*smoothstep(.5,1.2,length(p/A*2.));
  return vec4(clamp(col,0.,1.),1.);`,
  'Boris FX Sapphire S_FreeLens (freelensing, single frame): detached-lens look: focus band displaced and tilted with Lens Shift so blur grows away from it (48-tap disc in linear light), slight barrel distortion, chromatic fringing growing with blur, warm light leak on the shifted side, mild vignette (approx.)', 0);

f = add('Stylize');
f('q01_halftonerings','Halftone Rings (Sapphire)',[P('Tile Size',4,60,14,.5,'px'),P('Ring Number',1,8,3,1),P('Angle',0,90,30,1,'deg'),S('Center',['Black (dark rings on white)','White (bright rings on dark)'])],
  [BH('u_p0*.3'),BV('u_p0*.3'),
   `vec2 p=rot(PX(uv),radians(u_p2));float S=u_p0;vec2 l=(fract(p/S)-.5)*S;float r=length(l)/(S*.7071);float v=luma(c.rgb);int m=int(u_p3+.5);
   float ink=clamp(m==0?1.-v:v,0.,1.);float rc=fract(r*u_p1);float d=abs(rc-.5);float aa=u_p1/(S*.7071)/u_k;float on=smoothstep(ink*.5+aa,ink*.5-aa,d);
   return vec4(m==0?vec3(1.-on):vec3(on),1.);`],
  'Boris FX Sapphire S_HalfToneRings: duotone halftone whose cells hold concentric rings (Ring Number per cell) instead of dots; ring width = ink coverage from the (slightly smoothed) source luma; Center Black = dark rings on white, White = bright rings on black', 0);
f('q01_embossglass','Emboss Glass (Sapphire)',[P('Light Dir',0,360,135,1,'deg'),P('Bumps Smooth',.5,20,4,.1,'px'),P('Distort Amount',-60,60,20,.5,'px'),P('Hilight Brightness',0,2,.8,.01)],
  [BH('u_p1'),BV('u_p1'),
   Q01B_SPEC + `float st=max(1.,R(u_p1)*.5);vec2 e=u_px*st;float K=40.*u_k/st;vec2 g=vec2(L(uv+vec2(e.x,0.))-L(uv-vec2(e.x,0.)),L(uv+vec2(0.,e.y))-L(uv-vec2(0.,e.y)))*.5*K;
   vec3 n=normalize(vec3(-g,1.));float a=radians(u_p0);vec3 ld=normalize(vec3(cos(a),sin(a),1.));float lam=max(dot(n,ld),0.);float sp=pow(max(dot(n,normalize(ld+vec3(0.,0.,1.))),0.),40.)*u_p3;
   vec2 off=g*fromPX(vec2(u_p2));vec3 acc=vec3(0.),ws=vec3(0.);for(int k=0;k<7;k++){float s=float(k)/6.;vec3 w=Q01SPEC(.67*s);acc+=O(uv-off*mix(1.25,.75,s)).rgb*w;ws+=w;}
   return vec4(clamp(acc/ws*(.55+.6*lam)+sp,0.,1.),1.);`],
  'Boris FX Sapphire S_EmbossGlass with the image itself as the Bumps input: smoothed luminance is a relief lit from Light Dir (Lambert + Blinn specular) and a lens that refracts the image by its slope, the refraction split into 7 spectral steps (red warped most) for a prismatic edge', 0);

f = add('Paint');
f('q01_cartoonpaint','Cartoon Paint (Sapphire)',[P('Edge Strength',0,2,1,.01),P('Stroke Length',0,30,10,.5,'px'),P('Posterize',0,1,.5,.01),P('Smooth Colors',0,10,2,.1,'px')],
  [BH('u_p3'),BV('u_p3'),
   `float stp=R(u_p1)/10.;vec2 g0=vec2(L(uv+vec2(u_px.x,0.))-L(uv-vec2(u_px.x,0.)),L(uv+vec2(0.,u_px.y))-L(uv-vec2(0.,u_px.y)));
   vec2 t0=length(g0)>1e-4?normalize(vec2(-g0.y,g0.x)):vec2(.7071);vec3 acc=c.rgb;float nz=hash(floor(PX(uv)/2.5));float ws=1.;
   for(int sd=0;sd<2;sd++){vec2 q=uv;vec2 pd=sd==0?t0:-t0;
     for(int i=0;i<10;i++){vec2 g=vec2(L(q+vec2(u_px.x,0.))-L(q-vec2(u_px.x,0.)),L(q+vec2(0.,u_px.y))-L(q-vec2(0.,u_px.y)));
       vec2 td=length(g)>1e-4?normalize(vec2(-g.y,g.x)):pd;if(dot(td,pd)<0.)td=-td;pd=normalize(mix(pd,td,.6));q+=pd*stp*u_px;
       acc+=T(q).rgb;nz+=hash(floor(PX(q)/2.5));ws+=1.;}}
   return vec4(acc/ws,nz/ws);`,
   `vec3 col=c.rgb*(.92+(c.a-.5)*1.1);float lv=mix(24.,3.,u_p2);col=floor(col*lv+.5)/lv;vec2 e=u_px*1.5;
   float gx=luma(O(uv+vec2(e.x,0.)).rgb)-luma(O(uv-vec2(e.x,0.)).rgb),gy=luma(O(uv+vec2(0.,e.y)).rgb)-luma(O(uv-vec2(0.,e.y)).rgb);
   float ed=smoothstep(.12,.35,length(vec2(gx,gy))*u_p0);return vec4(clamp(col*(1.-ed),0.,1.),1.);`],
  'Boris FX Sapphire S_CartoonPaint (approx.): smoothed colours painted with streamline brush strokes that follow the edge direction (line-integral convolution of the colour and of a stroke-noise texture, Stroke Length), posterized, with black outlines from the source gradient', 0);

f = add('Noise');
f('q01_textures','Sapphire Textures and Clouds',[S('Pattern',['Chroma Spiral','Flux','Folded','Loops','Micro','Neurons','Noise Emboss','Clouds Psyko','Clouds Vortex']),P('Scale',10,400,90,1,'px'),P('Detail',0,1,.5,.01),S('Combine',['Texture Only','Mult','Add','Screen','Overlay'])],
  Q01B_SPEC + `int m=int(u_p0+.5);vec2 pc=PX(uv)-PX(vec2(.5));vec2 p=pc/u_p1;float D=u_p2;vec3 col;vec3 c0=vec3(.02,.03,.08),c1=vec3(1.,.92,.75);
  if(m==0){vec3 acc=vec3(0.),ws=vec3(0.);for(int i=0;i<16;i++){float s=float(i)/15.;vec2 q=rot(p,s*(.6+D*2.4))*mix(1.,.4,s);vec3 w=Q01SPEC(.67*s);acc+=fbm(q+3.)*w;ws+=w;}col=clamp((acc/ws-.3)*2.2,0.,1.);}
  else if(m==1){vec2 w=vec2(fbm(p+1.7),fbm(p+9.2));vec2 q=p+(w-.5)*(2.+D*6.);float v=.5+.5*sin(fbm(q)*(10.+D*14.));col=mix(c0,c1,smoothstep(.1,.9,v));}
  else if(m==2){vec2 q=p;for(int k=0;k<3;k++){q+=vec2(abs(fbm(q*1.3+float(k)*4.1)-.5),abs(fbm(q*1.3+float(k)*7.7+2.)-.5))*(1.+D*4.);}float v=1.-abs(2.*fbm(q)-1.);col=mix(c0,c1,smoothstep(.2,.95,v));}
  else if(m==3){col=vec3(0.);for(int k=0;k<3;k++){float fk=float(k);vec3 lc=k==0?vec3(1.,.5,.1):k==1?vec3(.1,.7,1.):vec3(.9,.2,.8);vec2 q=p*(1.+fk*.7)+fk*13.;vec2 ip=floor(q);float best=0.;
     for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 ctr=cc+hash2(cc+fk*31.);float r=length(q-ctr);float ring=abs(fract(r*(3.+D*5.)+hash(cc+fk*7.))-.5);
       best=max(best,smoothstep(.1,0.,ring-.04)*smoothstep(1.2,.6,r));}col+=lc*best*.8;}}
  else if(m==4){float a=.5,s=0.,fq=1.;for(int k=0;k<8;k++){float amp=k<3?a:a*(.4+D*1.6);s+=amp*vnoise(p*fq+float(k)*3.1);fq*=2.03;a*=.5;}col=mix(c0,vec3(.85,.9,1.),clamp((s-.35)/.45,0.,1.));}
  else if(m==5){vec2 ip=floor(p);float best=0.,gl=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 ctr=cc+.2+.6*hash2(cc);vec2 d=p-ctr;float r=length(d);
     float an=atan(d.y,d.x)+(fbm(p*2.+cc)-.5)*(1.+D*3.)*r+hash(cc+5.)*6.2832;float arc=abs(fract(an*5./6.2832+.5)-.5)*6.2832/5.*r;float th=.025+.02*D;float fl=exp(-r*1.6);
     best=max(best,exp(-pow(arc/th,2.))*fl);gl=max(gl,exp(-arc/(th*5.))*fl);}col=vec3(.9,.95,1.)*best+vec3(.2,.45,1.)*gl*.6;}
  else if(m==6){float e=.02;float h0=fbm(p),hx=fbm(p+vec2(e,0.)),hy=fbm(p+vec2(0.,e));float k=.3+D;vec3 n=normalize(vec3(-(hx-h0)/e*k,-(hy-h0)/e*k,1.));vec3 ld=normalize(vec3(-.6,.6,.8));
     float lam=max(dot(n,ld),0.);float sp=pow(max(dot(n,normalize(ld+vec3(0.,0.,1.))),0.),30.);col=vec3(.55,.5,.45)*lam+sp*.8;}
  else if(m==7){float v=fbm(p);col=.5+.5*cos(6.2832*((2.+D*6.)*v*vec3(1.,1.15,1.3)+vec3(0.,.33,.67)));}
  else{float r=length(pc)/length(PX(vec2(.5)));vec2 q=rot(pc,(1.+D*5.)*r)/u_p1;float v=fbm(q);col=mix(vec3(.05,.1,.3),vec3(1.,.97,.9),smoothstep(.25,.75,v));}
  int cb=int(u_p3+.5);vec3 o=c.rgb;vec3 r3=cb==0?col:cb==1?o*col:cb==2?o+col:cb==3?screen(o,col):overlay(o,col);return vec4(clamp(r3,0.,1.),1.);`,
  'Boris FX Sapphire procedural textures (approx. re-creations from the manual descriptions, single frame): TextureChromaSpiral (fractal noise averaged under a spiral zoom, each step tinted along the spectrum), TextureFlux (domain-warped noise cut into liquid / bubble contours), TextureFolded (noise repeatedly folded by its own ridges), TextureLoops (three sets of concentric loops around random centres), TextureMicro (8-octave noise with extra fine detail, thresholded), TextureNeurons (5-armed wiggling tendrils from random centres with glow), TextureNoiseEmboss (fractal noise lit as a bump map), CloudsPsyko (fractal clouds through per-channel cosine colour cycles), CloudsVortex (clouds twisted about the centre); Combine with the image like Sapphire', 1);

f = add('Stylize');
f('q01_psyko','Psyko Blobs / Psyko Stripes (Sapphire)',[S('Mode',['Psyko Blobs','Psyko Stripes']),P('Pattern Scale',.1,4,1,.01),P('Color Freq',.2,4,1,.01),P('Phase',0,1,0,.01)],
  `int m=int(u_p0+.5);float v=luma(c.rgb);vec2 A=vec2(asp(),1.);float pat=m==0?fbm(PX(uv)/60.*u_p1)*2.:dot((uv-.5)*A,vec2(.7071))*u_p1*2.;v+=pat;
  vec3 col=.5+.5*cos(6.2832*(u_p2*v*vec3(1.,1.1,1.25)+u_p3+vec3(0.,.15,.3)));return vec4(col,1.);`,
  'Boris FX Sapphire S_PsykoBlobs / S_PsykoStripes: fractal-noise blobs or 45-degree stripes are added to the source luminance and the sum is colourized by per-channel cosine cycles (Color Freq, Phase)', 1);

f = add('Noise');
f('q01_ultragrain','Ultra Grain (Sapphire)',[P('Grain Amp',0,2,.6,.01),P('Grain Size',.5,4,1.2,.05,'px'),P('Grain Blur',0,1,.35,.01),S('Grain',['Color','Mono'])],
  `vec2 p=PX(uv)/u_p1;vec3 g;bool mono=u_p3>.5;
  for(int k=0;k<3;k++){float fk=mono?0.:float(k);float v=mix(hash(floor(p)+fk*41.),vnoise(p+fk*17.3),u_p2);g[k]=(v-.5)*mix(3.46,4.5,u_p2);}
  float l=luma(c.rgb);float w=l<.5?mix(.7,1.,l*2.):mix(1.,.45,(l-.5)*2.);vec3 amp=mono?vec3(1.):vec3(.85,.75,1.25);
  return vec4(clamp(c.rgb+g*amp*w*u_p0*.06,0.,1.),1.);`,
  'Boris FX Sapphire S_UltraGrain: digital-camera style grain: per-channel (or mono) noise at Grain Size, Grain Blur blends white noise toward smooth value noise, blue channel noisiest, amplitude weighted darks .7 / mids 1 / brights .45', 1);

f = add('Retro');
f('q01_digitaldamage','Digital Damage (Sapphire)',[P('Intensity',0,1,.4,.01),P('Damage Size',4,128,24,1,'px'),P('Size Rel X',.25,8,3,.05),P('Blocks Chroma',0,1,.5,.01)],
  `vec2 p=PX(uv);vec2 bs=vec2(u_p1*u_p2,u_p1);vec2 b=floor(p/bs);float h=hash(b);float hr=hash(vec2(b.y,77.));vec3 o=c.rgb;
  if(h<u_p0*.45||hr<u_p0*.15){float ty=hash(b+3.1);
    if(ty<.25){vec2 off=floor((hash2(b+9.)-.5)*6.)*bs;o=T(fromPX(p+off)).rgb;}
    else if(ty<.45){float pz=max(4.,u_p1*.3);o=T(fromPX((floor(p/pz)+.5)*pz)).rgb;}
    else if(ty<.7){vec2 sb=floor(p/4.);float n=hash(sb+b);vec3 nc=vec3(hash(sb+1.),hash(sb+2.),hash(sb+3.));o=mix(T(fromPX((b+.5)*bs)).rgb,mix(vec3(n),nc,u_p3),.6);}
    else if(ty<.85){o=(1.-o).gbr*.85;}
    else if(luma(o)>.5){o+=step(.5,fract(p.y/3.+h*.5))*.35*hash(vec2(floor(p.y/2.),b.x));}}
  return vec4(clamp(o,0.,1.),1.);`,
  'Boris FX Sapphire S_DigitalDamage, spatial damage types only (single frame: Freeze and Flow need previous frames): block shifting, pixelation, satellite-style block noise (Blocks Chroma), inverted / recoloured bands and bright-area line noise, on blocks of Damage Size x Size Rel X with row-coherent clustering', 1);
f('q01_jpegdamage','JPEG Damage (Sapphire)',[P('Quality',.01,1,.1,.01),P('Res Factor',1,8,1,1),P('Freq Scale',0,3,1,.01),P('Error Rate',0,1,.15,.01)],
  [Q01_RF + `float b0=floor(px.x/8.)*8.;float k=mod(px.x,8.);vec3 s=vec3(0.);for(int n=0;n<8;n++){vec3 v=T((vec2(b0+float(n),px.y)*rf+rf*.5)/u_res).rgb;vec3 y=vec3(dot(v,vec3(.299,.587,.114)),dot(v,vec3(-.1687,-.3313,.5))+.5,dot(v,vec3(.5,-.4187,-.0813))+.5)-.5;s+=y*cos((2.*float(n)+1.)*k*PI/16.);}s*=k<.5?sqrt(.125):.5;return vec4(s/3.+128./255.,1.);`,
   JPEG_Q + Q01_RF + `float b0=floor(px.y/8.)*8.;float k=mod(px.y,8.);vec3 s=vec3(0.);for(int n=0;n<8;n++){vec3 v=(T((vec2(px.x,b0+float(n))*rf+rf*.5)/u_res).rgb-128./255.)*3.;s+=v*cos((2.*float(n)+1.)*k*PI/16.);}s*=k<.5?sqrt(.125):.5;
   float Q=clamp(u_p0*100.,1.,100.);float q=Q<50.?5000./Q:200.-2.*Q;float kx=mod(px.x,8.);int idx=int(k)*8+int(kx);float ql=max(floor((QL[idx]*q+50.)/100.),1.)/255.,qc=max(floor((QC[idx]*q+50.)/100.),1.)/255.;
   s=vec3(floor(s.x/ql+.5)*ql,floor(s.y/qc+.5)*qc,floor(s.z/qc+.5)*qc);if(idx>0)s*=vec3(u_p2,mix(1.,u_p2,.5),mix(1.,u_p2,.5));
   vec2 bid=floor(px/8.);float er=step(hash(bid+.37),u_p3*.75)*step(hash(vec2(bid.y,floor(bid.x/4.))+.91),.35+.65*u_p3);
   if(er>0.){float fi=float(idx);s+=(vec3(hash(bid*1.7+fi),hash(bid*2.3+fi+5.),hash(bid*3.1+fi+9.))-.5)*(idx==0?3.:1.2/(1.+(k+kx)*.4));}
   return vec4(s/8.+128./255.,1.);`,
   Q01_RF + `float b0=floor(px.y/8.)*8.;float n=mod(px.y,8.);vec3 s=vec3(0.);for(int k=0;k<8;k++){vec3 v=(T((vec2(px.x,b0+float(k))*rf+rf*.5)/u_res).rgb-128./255.)*8.;s+=v*(k==0?sqrt(.125):.5)*cos((2.*n+1.)*float(k)*PI/16.);}return vec4(s/3.+128./255.,1.);`,
   Q01_RF + `float b0=floor(px.x/8.)*8.;float n=mod(px.x,8.);vec3 s=vec3(0.);for(int k=0;k<8;k++){vec3 v=(T((vec2(b0+float(k),px.y)*rf+rf*.5)/u_res).rgb-128./255.)*3.;s+=v*(k==0?sqrt(.125):.5)*cos((2.*n+1.)*float(k)*PI/16.);}vec3 y=s+.5;y.yz-=.5;
   return vec4(clamp(vec3(y.x+1.402*y.z,y.x-.34414*y.y-.71414*y.z,y.x+1.772*y.y),0.,1.),1.);`],
  'Boris FX Sapphire S_JpegDamage: real 8x8 DCT JPEG round trip (standard luma / chroma tables, Quality 0.1 = JPEG q10) on a grid down-resed by Res Factor (bigger blocks), AC coefficients scaled by Freq Scale (luma fully, chroma half), and random decompression errors (garbage coefficients in clustered blocks) at Error Rate', 1);
