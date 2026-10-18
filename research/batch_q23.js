/* ================= q23: Substance Designer nodes (Histogram Select / Non-Uniform Histogram Scan, Safe / Non-Square / Trapezoid Transform, Height Map Frequencies Mapper, Splatter Circular / Shape Splatter, noises) + digiKam (Blur FX, Distortion FX, B&W film channel mixer / infrared films, Cold Tone) ================= */
f = add('Tone');
f('q23_sd_histselect','Histogram Select / Non-Uniform Histogram Scan (Substance)',[S('Node',['Histogram select','Non-uniform histogram scan (noise position map)']),P('Position',0,1,.5,.01),P('Range',0,1,.3,.01),P('Contrast',0,1,.5,.01)],
  `float l=luma(c.rgb);int m=int(u_p0+.5);float o;
 if(m==0){float hw=max(.5*u_p2,1e-4);float d=abs(l-u_p1);o=1.-clamp((d-hw*u_p3)/max(hw*(1.-u_p3),1e-4),0.,1.);}
 else{vec2 q=PX(uv)/110.+vec2(u_seed*13.1,u_seed*7.7);float pm=fbm(q);float pos=clamp(u_p1+(pm-.5)*4.*u_p2,0.,1.);float w=max(1.-u_p3,.001);float lo=mix(1.,-w,pos);o=clamp((l-lo)/w,0.,1.);}
 return vec4(vec3(o),1.);`,
  'Substance Designer Histogram Select: grey levels within Range/2 of Position are selected (white), fading out linearly; Contrast shrinks the fade (1 = hard cut). Non-Uniform Histogram Scan: Histogram Scan (levels window of width 1 - Contrast slid by Position) whose position is offset per pixel by a position map - here a seeded fbm noise (no second input) scaled by Range; input = luma',true);

f = add('Distort');
f('q23_sd_safetransform','Safe / Non-Square Transform (Substance)',[S('Node',['Safe transform','Safe transform (random offset)','Non-square transform']),P('Tile',1,16,2,1),P('Rotation',0,1,0,.01,'turns'),P('Offset',0,1,0,.01)],
  `int m=int(u_p0+.5);float n=floor(u_p1+.5);vec2 tl=vec2(n);if(m==2)tl=vec2(max(1.,floor(n*asp()+.5)),n);
 float ang=u_p2*2.*PI;float best=1e9;vec2 ab=vec2(1.,0.);
 for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 v=vec2(float(i),float(j));float L2=dot(v,v);if(L2<.5||L2>10.)continue;float da=abs(mod(atan(v.y,v.x)-ang+PI,2.*PI)-PI);float sc=da+.01*L2;if(sc<best){best=sc;ab=v;}}
 vec2 off=m==1?hash2(vec2(u_seed,3.7)):vec2(u_p3);off=floor(off*u_res)/u_res;
 vec2 q=uv*tl;q=vec2(ab.x*q.x-ab.y*q.y,ab.y*q.x+ab.x*q.y);return O(fract(q+off));`,
  'Substance Safe Transform: the input is tiled Tile x Tile times (integer, so tiling is never broken), rotated only by tile-safe angles (the rotation snaps to the nearest integer lattice direction (a,b), |a|,|b| <= 3, which also scales by sqrt(a^2+b^2) - 0, 90 deg, 45 deg, atan 1/2 ...) and offset by whole pixels (applied to X and Y); random offset mode draws the offset from the seed. Non-Square Transform: the tile count across is multiplied by the aspect ratio so tiles stay square on a non-square canvas. Symmetry and mipmap options not included',true);

f('q23_sd_trapezoid','Trapezoid Transform (Substance)',[P('Top stretch',-1,1,-.4,.01),P('Bottom stretch',-1,1,0,.01),S('Outside',['Background (black)','Tile horizontally','Clamp edge'])],
  `float wd=max(1.+mix(u_p1,u_p0,uv.y),.02);float sx=.5+(uv.x-.5)/wd;int m=int(u_p2+.5);
 if(sx<0.||sx>1.){if(m==0)return vec4(0.,0.,0.,1.);sx=m==1?fract(sx):clamp(sx,0.,1.);}
 return O(vec2(sx,uv.y));`,
  'Substance Trapezoid Transform (approx. of the node): each row is scaled horizontally about the centre, width factor 1 + stretch interpolated linearly from the bottom edge (Bottom stretch) to the top edge (Top stretch); negative = narrower, positive = wider; outside the trapezoid: background, horizontal tiling or edge clamp');

f = add('Materials');
f('q23_sd_heightfreq','Height Map Frequencies Mapper (Substance)',[P('Relief',0,32,8,.5,'px'),S('Output',['Displacement (large scale)','Relief (small scale)','Relief as normal map (OpenGL)'])],
  [`return vec4(vec3(luma(c.rgb)),1.);`,BH('max(u_p0,.01)'),BV('max(u_p0,.01)'),
   `float lo=c.r;float h=luma(O(uv).rgb);int m=int(u_p1+.5);if(m==0)return vec4(vec3(lo),1.);if(m==1)return vec4(vec3(clamp(.5+(h-lo)*2.,0.,1.)),1.);
 vec2 e=u_px;float dl=luma(O(uv-vec2(e.x,0.)).rgb)-T(uv-vec2(e.x,0.)).r,dr=luma(O(uv+vec2(e.x,0.)).rgb)-T(uv+vec2(e.x,0.)).r,dd=luma(O(uv-vec2(0.,e.y)).rgb)-T(uv-vec2(0.,e.y)).r,du=luma(O(uv+vec2(0.,e.y)).rgb)-T(uv+vec2(0.,e.y)).r;
 vec3 nn=normalize(vec3(-(dr-dl)*6./u_k,-(du-dd)*6./u_k,1.));return vec4(.5+.5*nn,1.);`],
  'Substance Height Map Frequencies Mapper: the height (luma) is split into a large-scale Displacement map (Gaussian low-pass, sigma = Relief px) and a small-scale Relief map (height - displacement, centred at 0.5, x2); third output = the relief converted to a tangent-space normal map');

f = add('Render');
f('q23_sd_splatter','Splatter Circular / Shape Splatter (Substance)',[S('Node',['Splatter circular','Shape splatter']),P('Pattern amount',3,64,16,1),P('Rings or variation',1,8,4,1),P('Pattern size',.1,2,1,.01)],
  `int m=int(u_p0+.5);vec2 A=vec2(asp(),1.);vec2 p=(uv-.5)*A;vec3 col=vec3(0.);float best=0.;
 if(m==0){float RN=floor(u_p2+.5);float N=floor(u_p1+.5);float r=length(p);float th=atan(p.y,p.x);
  for(int k=1;k<=8;k++){if(float(k)>RN)break;float rk=.46*float(k)/RN;float j=floor(th/(2.*PI)*N+.5);
   for(int dj=-1;dj<=1;dj++){float a=(j+float(dj))*2.*PI/N;vec2 ce=rk*vec2(cos(a),sin(a));float sz=.5*u_p3*min(2.*PI*rk/N,.46/RN);
    vec2 d=rot(p-ce,-a)/sz;d.x*=.8;float v=max(0.,1.-dot(d,d));if(v>best){best=v;col=O(ce/A+.5).rgb;}}}}
 else{float N=floor(u_p1+.5);float var=(u_p2-1.)/7.;vec2 g=p*N;vec2 ig=floor(g);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ig+vec2(float(i),float(j));vec2 hs=cc+u_seed*vec2(7.1,3.3);vec2 ce=cc+.5+(hash2(hs)-.5)*var*.9;
   float sc=.42*u_p3*(1.+(hash(hs+5.)-.5)*var);float an=hash(hs+9.)*2.*PI*var;vec2 d=rot(g-ce,-an)/max(sc,.01);int ty=int(hash(hs+13.)*3.);
   float sd=ty==0?length(d):ty==1?max(abs(d.x),abs(d.y)):max(abs(d.x)*.866+d.y*.5,-d.y);float v=1.-smoothstep(.85,1.,sd);v*=.75+.25*(1.-sd);
   if(v>best){best=v;col=O(ce/N/A+.5).rgb;}}}
 return vec4(col*best,1.);`,
  'Substance pattern splatters (approx. re-creations, built-in patterns, coloured by the image at each pattern centre): Splatter Circular = Ring amount concentric rings, Pattern amount paraboloid patterns per ring, each rotated to follow its angle; Shape Splatter = one shape (disc / square / triangle) per cell of a Pattern-amount grid with seeded position, scale and rotation jitter scaled by the variation',true);

f = add('Noise');
f('q23_sd_noises','Substance Noises (BnW Spots / Fractal Sum Base / Moisture / Microscope / Creased / Liquid)',[S('Type',['BnW Spots 1','BnW Spots 3','Fractal Sum Base','Moisture Noise','Microscope View','Creased','Liquid']),P('Scale',1,8,2,1),P('Disorder',0,1,0,.01),P('Roughness or warp',0,2,1,.01)],
  `int m=int(u_p0+.5);vec2 q=uv*vec2(asp(),1.)*u_p1;vec2 so=vec2(u_seed*17.31+u_p2*1.7,u_seed*9.13+u_p2*.9);float o=.5;float ro=u_p3;
 if(m<=2){float base=m==0?4.:m==1?3.:2.;int oc=m==0?7:m==1?4:9;float gn=m==0?.3+.32*ro:m==1?.42:.25+.35*ro;float a=1.,s=0.,tt=0.,fq=base;
  for(int i=0;i<9;i++){if(i>=oc)break;float nv=vnoise(q*fq+so+float(i)*7.31);if(m<2)nv=nv*nv*(3.-2.*nv);s+=a*nv;tt+=a;a*=gn;fq*=2.;}
  o=.5+(s/tt-.5)*(m==0?1.9:m==1?1.6:1.8);}
 else if(m==3){vec2 w=vec2(fbm(q*2.+so),fbm(q*2.+so+5.2))-.5;float v=fbm(q*3.+w*2.5+so);float bl=smoothstep(.42,.6,v);float rim=1.-smoothstep(0.,.025,abs(v-.5));
  vec2 dq=q*(18.+20.*ro);float dt=vnoise(dq+so)*vnoise(dq*1.63+so+4.);o=clamp(.85-.45*bl-.35*rim*(.5+bl)-.4*smoothstep(.35,.6,dt)*bl,0.,1.);}
 else if(m==4){vec2 w=vec2(fbm(q*2.+so),fbm(q*2.+so+3.7))-.5;vec2 g=q*5.+w*4.*ro;vec2 ig=floor(g);float f1=9.,f2=9.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ig+vec2(float(i),float(j));vec2 pp=cc+hash2(cc+so);float d=length(g-pp);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
  float wall=1.-smoothstep(.02,.12,f2-f1);float nuc=1.-smoothstep(.05,.22,f1);o=clamp(.25+.6*wall+.45*nuc*vnoise(g*3.)+.1*vnoise(q*40.+so),0.,1.);}
 else if(m==5){vec2 w=vec2(fbm(q*1.5+so),fbm(q*1.5+so+8.1))-.5;vec2 g=q*vec2(2.,7.)+w*3.*ro;float a=1.,s=0.,tt=0.;
  for(int i=0;i<5;i++){float r=1.-abs(2.*vnoise(g+so+float(i)*3.1)-1.);s+=a*r*r;tt+=a;a*=.5;g=g*2.1+vec2(1.3,.7);}o=s/tt;}
 else{float n1=fbm(q*3.+so);float n2=fbm(q*3.+so+4.4);vec2 g=q*3.+ro*2.5*vec2(n1-.5,n2-.5)*2.;float v=fbm(g+so+1.9);o=smoothstep(.3,.7,v);}
 return vec4(vec3(clamp(o,0.,1.)),1.);`,
  'Substance noise generators - approx. re-creations from the node descriptions (the atomic graphs are not public): BnW Spots 1 = 7-octave smoothed spot noise, Roughness = octave gain; BnW Spots 3 = 4 octaves, lower contrast; Fractal Sum Base = 9-octave value-noise fractal sum down to pixel level, Roughness = gain; Moisture = domain-warped stains with dark rims and mould specks (last slider = speck pattern size); Microscope View = fbm-warped cells (walls + nuclei), last slider = warp; Creased = ridged anisotropic warped noise (cloth folds); Liquid = noise warped by itself (Gaussian-noise variant). Scale = cells per image height; Disorder shifts the phase',true);

/* ---------- digiKam ---------- */
const Q23_FARK = dir => `float D=floor(R(u_p1)+.5);if(D<1.)return c;float st=max(1.,D/60.);vec3 s=vec3(0.);float n=0.;
 for(int i=-60;i<=60;i++){float o=float(i)*st;if(abs(o)>D)continue;s+=T(uv+${dir}*o*u_px).rgb*st;n+=st;}
 s+=T(uv-${dir}*D*u_px).rgb+2.*T(uv).rgb+2.*T(uv+${dir}*D*u_px).rgb;n+=5.;return vec4(s/n,1.);`;
f = add('Blur');
f('q23_dk_blurfx','digiKam Blur FX (Far / Softener / Shake)',[S('Effect',['Far blur','Softener blur','Shake blur']),P('Distance',0,100,10,1,'px')],
  [`int m=int(u_p0+.5);
 if(m==1){float g=(c.r+c.g+c.b)/3.;int rr=g>.5?3:1;vec3 s=vec3(0.);float n=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){if(abs(i)>rr||abs(j)>rr)continue;s+=T(uv+vec2(float(i),float(j))*u_k*u_px).rgb;n+=1.;}return vec4(s/n,1.);}
 if(m==2){float d=R(u_p1);return vec4((T(uv+vec2(0.,d)*u_px).rgb+T(uv-vec2(0.,d)*u_px).rgb+T(uv+vec2(d,0.)*u_px).rgb+T(uv-vec2(d,0.)*u_px).rgb)*.25,1.);}
 ${Q23_FARK('vec2(1.,0.)')}`,
   `if(int(u_p0+.5)!=0)return c;${Q23_FARK('vec2(0.,1.)')}`],
  'digiKam blurfxfilter.cpp: Far Blur = separable convolution with a (2*Distance+1) box kernel whose first tap weighs 2 and centre and last taps weigh 3 (normalised by the weight sum; above 60 px the box is strided); Softener Blur = 7x7 mean where the RGB average is above mid-grey, 3x3 mean below; Shake Blur = average of four copies shifted Distance px up, down, left and right (edge-clamped)');

f = add('Distort');
f('q23_dk_distortfx','digiKam Distortion FX (Caricature / Multiple Corners / Waves)',[S('Effect',['Caricature','Multiple corners','Block waves 1','Block waves 2','Circular waves 1','Circular waves 2']),P('Level',0,200,25,1),P('Iteration',0,200,10,1),P('Corners',1,10,4,1)],
  `int m=int(u_p0+.5);vec2 WH=u_res/u_k;vec2 p=PX(uv);p.y=WH.y-p.y;vec2 h=floor(WH*.5);vec2 s=p;const float AR=.017453292519943295;
 if(m==0){float Rm=max(WH.x,WH.y)*.5;vec2 d=p-h;float r=length(d);float st=u_p1/5000.;if(r<Rm&&st>0.&&r>0.){float co=Rm/log(st*Rm+1.);s=h+d/r*co*log(1.+st*r);}}
 else if(m==1){float Rm=length(WH)*.5;vec2 n=h-p;float r=length(n);float a=atan(n.y,n.x)*floor(u_p3+.5);float nr=r*r/Rm;s=h-vec2(cos(a),sin(a))*nr;}
 else if(m<=3){vec2 n=m==3?h-p:p;s=floor(p+u_p1*vec2(sin(u_p2*n.x*AR),cos(u_p2*n.y*AR)))+.5;}
 else{vec2 n=h-p;float r=length(n);float amp=u_p1;if(m==5)amp*=r/length(WH);float a=u_p2*AR*r+(m==5?25.*AR:0.);s=p+amp*vec2(sin(a),cos(a));}
 s=clamp(s,vec2(.5),WH-.5);s.y=WH.y-s.y;return O(fromPX(s));`,
  'digiKam distortionfxfilter.cpp formulas in image pixels (origin top-left, centre W/2,H/2): Caricature = fisheye with coeff -Level/5 (r -> c ln(1 + k r), k = Level/5000, c = Rmax/ln(k Rmax + 1), Rmax = max(W,H)/2); Multiple Corners = angle x Corners, radius r^2/Rmax (Rmax = half diagonal); Block Waves = x + Level sin(Iteration x deg), y + Level cos(Iteration y deg) (type 2 measured from the centre, integer-truncated); Circular Waves = shift Level (type 2: x r/diagonal, phase 25 deg) along (sin, cos)(Iteration deg x r). digiKam defaults: Caricature 50, Multiple Corners 4, waves Level 25 Iteration 10');

const Q23_BWG = [[.24,.68,.08],[.18,.41,.41],[.25,.39,.36],[.21,.40,.39],[.20,.41,.39],[.21,.42,.37],[.22,.42,.36],[.31,.36,.33],[.28,.41,.31],[.23,.37,.40],[.33,.36,.31],[.21,.42,.37],[.24,.37,.39],[.27,.36,.37],[.25,.35,.40]];
const Q23_BWMIX = src => `const vec3 GW[15]=vec3[](${Q23_BWG.map(g=>`vec3(${g.map(v=>v.toFixed(2)).join(',')})`).join(',')});int k=int(u_p0+.5);vec3 g;
 if(k<15)g=GW[k];else{float iso=k==15?200.:k==16?400.:k==17?800.:100.;g=k==18?vec3(1.,1.-iso/2000.,-1.):vec3(.4,2.1-iso/2000.,-.8);}
 float v=clamp(dot(${src},g)/abs(g.x+g.y+g.z),0.,1.);`;
const Q23_BWRAD = '(u_p0<14.5?.01:u_p0<15.5?2.:u_p0<16.5?3.:u_p0<17.5?5.:1.)';
f = add('Film');
f('q23_dk_bwfilm','digiKam B&W Film (channel mixer / infrared films / Cold Tone)',[S('Film',['Generic','Agfa 200X','Agfapan 25','Agfapan 100','Agfapan 400','Ilford Delta 100','Ilford Delta 400','Ilford Delta 400 Pro 3200','Ilford FP4 Plus','Ilford HP5 Plus','Ilford Pan F Plus','Ilford XP2 Super','Kodak T-Max 100','Kodak T-Max 400','Kodak Tri-X','Ilford SFX 200','Ilford SFX 400','Ilford SFX 800','Kodak HIE']),S('Tone',['None','Cold tone']),P('Strength',0,1,1,.01)],
  [`${Q23_BWMIX('c.rgb')}return vec4(vec3(v),1.);`,BH(Q23_BWRAD),BV(Q23_BWRAD),
   `${Q23_BWMIX('O(uv).rgb')}if(k>=15){float bl=c.r;v=clamp(v*(v+2.*bl*(1.-v)),0.,1.);}
 vec3 o=vec3(v);if(u_p1>.5){vec3 mk=rgb2hsl(vec3(102.,109.,128.)/255.);o=clamp(hsl2rgb(vec3(mk.x,mk.y,v)),0.,1.);}
 return vec4(mix(O(uv).rgb,o,u_p2),1.);`],
  'digiKam bwsepiafilter.cpp film presets: monochrome channel mixer with the film R/G/B gains (preserve luminosity: divided by the gain sum), e.g. Agfa 200X .18/.41/.41, Agfapan 25 .25/.39/.36, Agfapan 400 .20/.41/.39, Delta 400 Pro 3200 .31/.36/.33; Ilford SFX 200/400/800 and Kodak HIE use infraredfilter.cpp: gains .4 / 2.1 - ISO/2000 / -.8 (HIE 1/1/-1), the grey image is blurred (radius ISO/200 + 1 px, Gaussian sigma = radius here) and combined as bw (bw + 2 blur (1 - bw)); Cold Tone = TonalityFilter: hue and saturation of the mask colour (102,109,128) with the pixel lightness');
