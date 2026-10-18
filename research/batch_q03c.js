/* ================= q03c: G'MIC community round 13 - painting / sketch / etching (Osgood finger paint, hair locks, hedcut; PhotoComiX crayon graffiti, steampunk pencil; Kelday etches; Huotari paintings, squiggly; samj isophote watercolour; illustration look) ================= */
f = add('Paint');
// minor-eigenvector (edge tangent) of the smoothed structure tensor stored as (Jxx, Jyy, .5+.5 Jxy)
const Q03_TAN = (q, out) => `{vec4 tt_=T(${q});float a_=tt_.r,c_=tt_.g,b_=(tt_.b-.5)*2.;float l2_=.5*(a_+c_-sqrt((a_-c_)*(a_-c_)+4.*b_*b_));vec2 v_=vec2(b_,l2_-a_);if(dot(v_,v_)<1e-14)v_=a_>=c_?vec2(0.,1.):vec2(1.,0.);${out}=normalize(v_);}`;
f('q03_flowpaint','Flow Painting (Finger Paint / Hair Locks / Crayon Graffiti / Steampunk Pencil)',[S('Style',['Finger Paint (Garry Osgood)','Hair Locks (Garry Osgood)','Black Crayon Graffiti (PhotoComiX)','B&W Steampunk Pencil (PhotoComiX)']),P('Stroke length',4,60,24,1,'px'),P('Detail',0,1,.5,.01),P('Light angle',0,360,45,1,'deg')],
  [`float d=max(u_k,1.)*(1.+2.*(1.-u_p2));float gx=(blurL(uv+vec2(d,0.)*u_px,d*.5)-blurL(uv-vec2(d,0.)*u_px,d*.5))*2.,gy=(blurL(uv+vec2(0.,d)*u_px,d*.5)-blurL(uv-vec2(0.,d)*u_px,d*.5))*2.;
    return vec4(min(gx*gx,1.),min(gy*gy,1.),.5+.5*clamp(gx*gy,-1.,1.),1.);`,
   BH('2.+u_p1*.2'),BV('2.+u_p1*.2'),
   `int m=int(u_p0+.5);vec2 t0;${Q03_TAN('uv','t0')}float st=max(R(u_p1),2.)/20.;float dens=.025+.05*u_p2;vec3 acc=vec3(0.);float ws=0.,aw=0.;
    for(int sg=0;sg<2;sg++){vec2 p=uv;vec2 dp=sg==0?t0:-t0;for(int i=0;i<20;i++){if(sg==1&&i==0){vec2 tq0;${Q03_TAN('p','tq0')}p+=dp*st*u_px;continue;}vec2 tq;${Q03_TAN('p','tq')}if(dot(tq,dp)<0.)tq=-tq;dp=tq;
      float w=exp(-float(i*i)/98.);vec2 cell=floor(PX(p));
      if(m==0)acc+=w*O(p).rgb;else if(m==1){float im=step(1.-dens,hash(cell));vec3 cc=O((cell+.5)*u_k/u_res).rgb;cc=hsv2rgb(rgb2hsv(cc)+vec3((hash(cell+3.7)-.5)*.08,0.,(hash(cell+9.1)-.3)*.4));acc+=w*im*cc;aw+=w*im;}
      else acc+=vec3(w*hash(cell));ws+=w;p+=tq*st*u_px;}}
    return vec4(acc/ws,m==1?aw/ws:1.);`,
   `int m=int(u_p0+.5);vec4 me=T(uv);vec3 c0=O(uv).rgb;float an=radians(u_p3);vec3 Ld=normalize(vec3(cos(an),sin(an),1.));float e=1.5*max(u_k,1.);
    vec3 ob=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)ob+=O(uv+vec2(float(i),float(j))*2.*u_k*u_px).rgb;ob/=9.;
    if(m==0){float hx=luma(T(uv+vec2(e,0.)*u_px).rgb)-luma(T(uv-vec2(e,0.)*u_px).rgb),hy=luma(T(uv+vec2(0.,e)*u_px).rgb)-luma(T(uv-vec2(0.,e)*u_px).rgb);vec3 n=normalize(vec3(-hx*9.,-hy*9.,1.));
     float sh=dot(n,Ld)-Ld.z;float sp=pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),24.);vec3 o=me.rgb*(1.+1.4*sh)+.35*sp;vec3 hs=rgb2hsl(clamp(o,0.,1.));hs.y=clamp(hs.y*1.15,0.,1.);return vec4(pow(hsl2rgb(hs),vec3(1./1.15)),1.);}
    if(m==1){float dens=.025+.05*u_p2;float s=clamp((me.a/dens-.6)*1.1,0.,1.);vec3 hc=me.rgb/max(me.a,1e-4);
     float ax=T(uv+vec2(e,0.)*u_px).a-T(uv-vec2(e,0.)*u_px).a,ay=T(uv+vec2(0.,e)*u_px).a-T(uv-vec2(0.,e)*u_px).a;float emb=clamp(dot(vec2(ax,ay),Ld.xy)/dens*1.5,-1.,1.);
     vec3 o=mix(c0*.28,hc*(.75+.5*emb)+.3*max(emb,0.)*max(emb,0.),s);return vec4(clamp(o,0.,1.),1.);}
    float v=(me.r-.5)*7.+.5;float l=luma(c0);float gx=luma(O(uv+vec2(e,0.)*u_px).rgb)-luma(O(uv-vec2(e,0.)*u_px).rgb),gy=luma(O(uv+vec2(0.,e)*u_px).rgb)-luma(O(uv-vec2(0.,e)*u_px).rgb);float ed=clamp(length(vec2(gx,gy))*4.,0.,1.);
    if(m==2){float tgt=clamp((1.-l)*.75+ed*.9-.25+.2*u_p2,0.,1.);float ink=smoothstep(tgt+.08,tgt-.08,v);float stroke=ink*.85+ed*.25;vec3 col=ob*1.55;return vec4(clamp(col*stroke,0.,1.),1.);}
    float sk=clamp(l/max(luma(ob)+.06,1e-3),0.,1.);sk=pow(sk,3.);float tgt=clamp((1.-l)*.9-.15,0.,1.);float hatch=smoothstep(tgt+.1,tgt-.1,v);float o=sk*(1.-.55*hatch);o=clamp((o-.08)/.86,0.,1.);return vec4(vec3(o),1.);`],
  "Osgood gtutor_fpaint (finger strokes = paint smeared along the structure-tensor flow, then relief-lit from the light angle: shadow, highlight, specular, saturation curve, gamma 1.4), gtutor_hairlock (random impulses of the image colour with hue / lightness variance smeared into strands along the flow, thickened, highlit; drawn over the darkened image instead of a transparent layer), PhotoComiX Black Crayon Graffiti (hardsketchbw-like dark strokes along the flow where the image is dark or edged, negated and colour-doped with the smoothed image), B&W Steampunk Pencil (pencil dodge sketch + flow hatching, contrast-stretched; Kuwahara / painter's touch omitted); flow = line integral convolution (2 x 20 steps) along the minor eigenvector of the smoothed structure tensor (approx. of G'MIC smooth / diffusiontensors)", true);
// streak noise: smooth 1-D value noise along the direction (period ~ len), independent 1-px rows across it, binarised at the density
const Q03_LN = (out, dir, len, dens, salt) => `{vec2 dr_=${dir};float al_=dot(P,dr_)/max((${len})*.5,1.),ac_=floor(dot(P,vec2(-dr_.y,dr_.x)));float v_=vnoise(vec2(al_,ac_*7.31+(${salt})*13.));${out}=step(1.-(${dens})*.8,v_*1.08-.04);}`;
f('q03_etch','Etching (Threshold Etch / Multi-Layer Etch / Hedcut)',[S('Style',['Threshold Etch (Andy Kelday)','Multi-Layer Etch (Andy Kelday)','Hedcut faux intaglio (Garry Osgood)']),P('Line length',2,40,15,1,'px'),P('Density',0,1,.5,.01),P('Gamma',.2,2,.6,.01)],
  [`float e=max(u_k,1.)*1.5;float gx=blurL(uv+vec2(e,0.)*u_px,e)-blurL(uv-vec2(e,0.)*u_px,e),gy=blurL(uv+vec2(0.,e)*u_px,e)-blurL(uv-vec2(0.,e)*u_px,e);return vec4(step(.07+.1*(1.-u_p2),length(vec2(gx,gy))),0.,0.,1.);`,
   `float Rw=40.*u_k;float st=max(1.,Rw/40.);float h=Rw;for(int i=-40;i<=40;i++){float x=float(i)*st;if(T(uv+vec2(x,0.)*u_px).r>.5)h=min(h,abs(x));}return vec4(h/Rw,0.,0.,1.);`,
   `float Rw=40.*u_k;float st=max(1.,Rw/40.);float d2=Rw*Rw;for(int j=-40;j<=40;j++){float y=float(j)*st;float hx=T(uv+vec2(0.,y)*u_px).r*Rw;d2=min(d2,y*y+hx*hx);}return vec4(sqrt(d2)/Rw,0.,0.,1.);`,
   `int m=int(u_p0+.5);vec2 P=PX(uv);float l=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)l+=luma(O(uv+vec2(float(i),float(j))*u_k*u_px).rgb);l/=9.;float n=1.-l;float sc=u_p1/15.;float dm=u_p2*2.;
    if(m==0){float m1=clamp(n*255./70.,0.,1.),m2=(clamp(n,84./255.,128./255.)-84./255.)/(44./255.),m3=(clamp(n,102./255.,192./255.)-102./255.)/(90./255.),m4=(clamp(n,130./255.,1.)-130./255.)/(125./255.);
     float L1,L2,L3,L4;${Q03_LN('L1', 'vec2(1.,0.)', '22.*sc', 'clamp(.5*dm,.02,.98)', '1.3')}${Q03_LN('L2', 'vec2(.7071,.7071)', '30.*sc', 'clamp(.8*dm,.02,.98)', '7.1')}${Q03_LN('L3', 'vec2(0.,1.)', '18.*sc', 'clamp(.5*dm,.02,.98)', '3.7')}${Q03_LN('L4', 'vec2(0.,1.)', '30.*sc', 'clamp(.1*dm,.02,.98)', '5.9')}
     float s=m1*L4+m2*L3+m3*L2+m4*L1;float o=1.-clamp(s/2.2,0.,1.);return vec4(vec3(pow(o,1./u_p3)),1.);}
    if(m==1){float ml=11.,wl=4.,nwl=7.;float t=floor(clamp(l,0.,.999)*ml);float s=0.;for(int k=4;k<11;k++){float pc=(float(k)+1.)/ml;float dn=(1.-pc)*dm*1.3;if(dn<.01)continue;if(t>float(k))continue;
      float a=float(k)/nwl*6.28318;vec2 dr=vec2(cos(a),sin(a));float ln_=mix(8.5,5.,pc)*.01*max(u_res.x,u_res.y)/u_k*sc*.6;float v=vnoise(vec2(dot(P,dr)/max(ln_*.5,1.),floor(dot(P,vec2(-dr.y,dr.x)))*7.31+float(k)*5.));
      s+=floor(clamp((v-(1.-dn))/max(dn,.05),0.,1.)*14.)/14.;}
     float o=1.-clamp(s/1.6,0.,1.);return vec4(vec3(pow(o,1./u_p3)),1.);}
    float dd=T(uv).r*40.;float sp=max(2.,u_p1*.4);float ph=dd/sp+.35*vnoise(P/9.)*(1.-u_p2)+(dd>39.?P.y/sp:0.);float ln=1.-abs(fract(ph)-.5)*2.;float dk=pow(clamp(n*1.15,0.,1.),u_p3)*(.5+u_p2);
    float ink=smoothstep(1.-dk-.12,1.-dk+.12,ln);return vec4(vec3(1.-ink),1.);`],
  "Kelday (Garagecoder) Threshold Etch: blurred negative split into 4 tone ranges (thresholds 125/153/171/185), each multiplied by a layer of noise lines (sparse binary noise smeared along horizontal / diagonal cross-hatch / two vertical directions, quantised to 2 levels), summed, negated, gamma; Multi-Layer Etch: 11 tone layers, the darkest 7 each add soft noise streaks at spread angles (density falls with the layer), summed, negated, gamma; Osgood hedcut (faux intaglio): engraved lines run parallel to the image edges (contours of the distance to the thresholded gradient, separable Euclidean distance up to 40 px; plateaus fall back to straight lines), line width set by tone, noise turbulence - approx. (no bandpass orientation field)", true);
f('q03_paintabs','Painting Abstractions (Colour Abstraction / Morphology Painting / Squiggly / Isophote Watercolour / Illustration Look)',[S('Mode',['Colour Abstraction Paint (Arto Huotari)','Morphology Painting (Arto Huotari)','Make Squiggly (Arto Huotari)',"Isophotes to watercolour (samj)","Illustration Look (G'MIC)"]),P('Abstraction',1,10,4,1),P('Detail / strength',0,1,.5,.01),P('Opacity',0,1,1,.01)],
  [`int m=int(u_p0+.5);vec2 q=uv;if(m==2)q+=(hash2(floor(PX(uv)))-.5)*2.*(1.+u_p1*.5)*u_k*u_px;float r=m==4?3.:clamp(u_p1*.9+1.,1.,8.);return vec4(kuwa(q,r),1.);`,
   `int m=int(u_p0+.5);vec3 c0=O(uv).rgb;vec3 B=T(uv).rgb;float A=u_p1;vec3 o=c0;
    if(m==0){vec3 E=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)E+=O(uv+vec2(float(i)*1.6,float(j)*.6)*A*u_k*u_px).rgb;E/=25.;vec3 h0=rgb2hsv(c0);h0.z=rgb2hsv(E).z;vec3 a=hsv2rgb(h0);
     a=mix(a,a*B*1.7,.5);float lv=3.+(10.-A)*.6;vec3 ca=floor(B*lv+.5)/lv;vec3 hs=rgb2hsl(ca);hs.y=min(hs.y*1.2,1.);ca=hsl2rgb(hs);o=a+(ca-B)*(.5+.8*u_p2);}
    else if(m==1){float rad=(4.+A*3.)*u_k;vec3 M=vec3(0.);for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 dd=vec2(float(i),float(j))/4.;if(dot(dd,dd)>1.)continue;vec2 jt=(hash2(floor(PX(uv))+vec2(float(i),float(j)))-.5)*1.6*u_k;M=max(M,O(uv+(dd*rad+jt)*u_px).rgb);}
     vec3 Mc=mix(25./255.+M*(100.-25.)/50.,mix(100./255.+(M-50./255.)*(130./150.),230./255.+(M-200./255.)*(25./55.),step(200./255.,M)),step(50./255.,M));vec3 sg=floor(Mc*6.+.5)/6.;o=(Mc+sg+B)/3.;o=(o-.08)/.88;}
    else if(m==2){float lv=3.+u_p2*5.;vec3 s0=floor(B*lv)/lv;float gn=0.;for(int k=0;k<4;k++){vec2 dd=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px*max(u_k,1.);gn+=length(floor(T(uv+dd).rgb*lv)/lv-s0);}
     gn=pow(clamp(gn*1.2,0.,1.),.5);vec3 sq=s0*gn+gn*.15;float Ls=luma(sq);o=clamp(sq+(1.-2.*Ls),0.,1.);}
    else if(m==3){vec3 paper=vec3(251.,237.,206.)/255.*(.93+.07*fbm(PX(uv)/6.));float lv=4.+u_p2*8.;float iso=0.;
     for(int s=0;s<2;s++){float dd=s==0?1.:2.5+A*.4;float l0=floor(luma(s==0?B:O(uv).rgb)*lv);for(int k=0;k<4;k++){vec2 dv=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*dd*u_k*u_px;float l1=floor(luma(s==0?T(uv+dv).rgb:O(uv+dv).rgb)*lv);if(l1!=l0)iso=max(iso,s==0?1.:.6);}}
     vec3 wash=mix(paper,B,.42+.2*fbm(PX(uv)/23.+3.));o=mix(wash,B*.75,iso*.85);}
    else{vec3 det=c0-B;vec3 lb=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)lb+=O(uv+vec2(float(i),float(j))*6.*u_k*u_px).rgb;lb/=25.;vec3 base=clamp(B+(B-lb)*.6,0.,1.);
     float gl=luma(base);float lq=floor(gl*5.+.5)/5.;float ed=length(vec2(luma(T(uv+vec2(u_px.x,0.)*max(u_k,1.)).rgb)-luma(T(uv-vec2(u_px.x,0.)*max(u_k,1.)).rgb),luma(T(uv+vec2(0.,u_px.y)*max(u_k,1.)).rgb)-luma(T(uv-vec2(0.,u_px.y)*max(u_k,1.)).rgb)));
     vec3 gn=base*(lq/max(gl,1e-3))*(1.-smoothstep(.05,.2,ed)*.8);vec3 pnt=mix(base,gn,.5);o=clamp(pnt+det*(.6+.8*u_p2),0.,1.);}
    return vec4(mix(c0,clamp(o,0.,1.),u_p3),1.);`],
  "approx. compositions after the G'MIC sources (segmentation / painting / ellipsionism stand-ins: Kuwahara painting, colour quantisation): Huotari Colour Abstraction Paint = value from an elongated blur (ellipsionism) x painting (multiply) + grain-merged quantised colour abstraction; Morphology Painting = disc dilation with spread jitter, the black-point / shadow / highlight curve (25 / 100 at 50 / 230 at 200), quantised 'segments' and the painting averaged and normalised; Make Squiggly = spread noise, segmentation, gradient norm of the segments times their colour, luminance inverted (white ground); samj Isophotes vers Aquarelle = iso-contours of quantised luminance at two scales over a watercolour wash on a cream (251,237,206) textured paper; Illustration Look (Guyader / Tschumperle) = edge-preserving base with local contrast, 50 % graphic-novel layer (posterised tone + inked edges), detail grain-merged back", true);
f = add('Materials');
f('q03_relief','Relief & Highlights (Gilding / Specular Bumps / NCEE emboss)',[S('Mode',['Gilding / Dorure (samj)','Jpr Specular Bumps (highlights only)','Jpr Specular Bumps (dodge onto image)','Non-Convolution Edge Extraction (Reptorian)']),P('Angle',0,360,270,1,'deg'),P('Depth',0,1,.5,.01),P('Size',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec3 c0=O(uv).rgb;float an=radians(u_p1);
  if(m==3){float of=max(.5,u_p2*4.)*u_k;vec2 q=fract(uv+vec2(cos(an),sin(an))*of*u_px);vec3 o=.5+u_p3*2.5*(c0-O(q).rgb);return vec4(clamp(o,0.,1.),1.);}
  float e=max(u_k,1.);
  if(m==0){float lb=0.,lx0=0.,lx1=0.,ly0=0.,ly1=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o_=vec2(float(i),float(j))*e*u_px;lb+=luma(O(uv+o_).rgb);lx0+=luma(O(uv+o_-vec2(2.*e,0.)*u_px).rgb);lx1+=luma(O(uv+o_+vec2(2.*e,0.)*u_px).rgb);ly0+=luma(O(uv+o_-vec2(0.,2.*e)*u_px).rgb);ly1+=luma(O(uv+o_+vec2(0.,2.*e)*u_px).rgb);}
   lb/=9.;float sh=clamp(luma(c0)+(luma(c0)-lb),0.,1.);float t=floor((1.-sh)*31.+.5)/31.;vec3 gold=mix(vec3(255.,208.,170.)/255.,vec3(220.,92.,1.)/255.,floor(t*17.+.5)/17.);
   vec3 n=normalize(vec3(-(lx1-lx0)/9.*6.*u_p2,-(ly1-ly0)/9.*6.*u_p2,1.));vec3 Ld=normalize(vec3(cos(an),sin(an),.8));float df=max(dot(n,Ld),0.);float sp=pow(max(dot(reflect(-Ld,n),vec3(0.,0.,1.)),0.),4.+40.*u_p3);
   return vec4(clamp(gold*(.4+.75*df)+.2*sp*vec3(1.,.95,.8)*2.,0.,1.),1.);}
  vec2 g=vec2(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o_=vec2(float(i),float(j))*e*u_px;float w=(i==0?2.:1.)*(j==0?2.:1.);g.x+=w*(length(O(uv+o_+vec2(e,0.)*u_px).rgb)-length(O(uv+o_-vec2(e,0.)*u_px).rgb));g.y+=w*(length(O(uv+o_+vec2(0.,e)*u_px).rgb)-length(O(uv+o_-vec2(0.,e)*u_px).rgb));}
  g*=.5/16.*255./sqrt(3.);float ca=cos(an),sa=sin(an);vec2 v=clamp(vec2(ca*g.x+sa*g.y,-sa*g.x+ca*g.y)/(3.+27.*(1.-u_p2)),0.,1.);float w=.1/(.1+length(v));vec3 nn=normalize(vec3(v,w));
  vec3 Lt=vec3(cos(radians(45.))*sin(radians(80.)),sin(radians(45.))*sin(radians(80.)),cos(radians(80.)));float dd=length(nn-Lt);float hs=u_p3*.25;float hl=1.-clamp((dd-hs)/.1,0.,1.);
  if(m==1)return vec4(vec3(hl),1.);return vec4(clamp(c0/max(1.-hl*.85,.05),0.,1.),1.);`,
  "samj Dorure (gilding): negated, sharpened image indexed into a 32-level gold gradient (255,208,170 -> 220,92,1) and lit as a relief (ambient 0.4, specular, light from the angle, Depth = z-scale); jpr_specularbumps: gradient of the colour norm rotated to the illumination angle, divided by the gradient range (Depth), clipped, normal (v, 0.1/(0.1+|v|)) compared with a light 80 deg off-axis, highlight where |N - L| < size (Size), roughness 0.1, output B&W or colour-dodged; Reptorian Non-Convolution Edge Extraction: image averaged with an inverted copy shifted (wrap-around) by the offset (Depth) along the angle, contrast (Size x 250 %) around mid-grey - a Photoshop-style emboss without convolution");
f = add('Edges');
f('q03_othin','Jpr Oriented Thinning (James Prichard)',[P('Propagate direction',3,50,15,1,'px'),S('Distance metric',['Chebyshev','Manhattan','Euclidean']),P('Background threshold',0,.5,.08,.005),S('Output',['Skeleton over image','Skeleton','Orientation map','Distance'])],
  [BH('5.'),BV('5.'),
   `float e=max(u_k,1.);float gx=L(uv+vec2(e,0.)*u_px)-L(uv-vec2(e,0.)*u_px),gy=L(uv+vec2(0.,e)*u_px)-L(uv-vec2(0.,e)*u_px);return vec4(.5+.5*clamp((gx*gx-gy*gy)*40.,-1.,1.),0.,0.,1.);`,
   BH('u_p0'),BV('u_p0'),
   `float or_=T(uv).r<=.5?1.:0.;float Rw=48.*u_k;float st=max(1.,Rw/48.);float h=Rw;for(int i=-48;i<=48;i++){float x=float(i)*st;if(luma(O(uv+vec2(x,0.)*u_px).rgb)<=u_p2)h=min(h,abs(x));}return vec4(h/Rw,or_,0.,1.);`,
   `float Rw=48.*u_k;float st=max(1.,Rw/48.);int mt=int(u_p1+.5);float d=Rw;for(int j=-48;j<=48;j++){float y=abs(float(j)*st);float hx=T(uv+vec2(0.,float(j)*st)*u_px).r*Rw;float c=mt==0?max(y,hx):mt==1?y+hx:sqrt(y*y+hx*hx);d=min(d,c);}return vec4(d/Rw,T(uv).g,0.,1.);`,
   `int o=int(u_p3+.5);vec4 me=T(uv);if(o==2)return vec4(vec3(me.g),1.);if(o==3)return vec4(ramp(1,clamp(me.r,0.,1.)),1.);float Rw=48.*u_k;float th=1.;
    vec2 dv=(me.g>.5?vec2(0.,1.1):vec2(1.1,0.))*max(u_k,1.)*u_px;float D=max(me.r*Rw,th),Da=max(T(uv+dv).r*Rw,th),Db=max(T(uv-dv).r*Rw,th);float sk=(D>max(Da,Db)&&me.r<.999&&D>th+.01)?1.:0.;
    if(o==1)return vec4(vec3(sk),1.);return vec4(mix(O(uv).rgb*.6,vec3(1.,.15,.1),sk),1.);`],
  "jpr_orientedthinning: shape against a dark background (luminance <= threshold); distance from the background (Chebyshev / Manhattan / Euclidean, exact separable search up to 48 px); local direction from the sign of the propagated (blurred) structure-tensor difference Jxx - Jyy of the 5 px pre-smoothed image; ridge pixels = distance strictly greater than both neighbours 1.1 px away along that axis (threshold width 1), which skips the micro-ridges a plain skeleton picks up from a noisy boundary");
f = add('Stylize');
const Q03_CB = s => `vec4 me=T(uv);if(me.b<.5)return me;vec2 best=me.rg;for(int k=0;k<8;k++){vec2 dir=vec2(float(k==1||k==2||k==3?1:k==5||k==6||k==7?-1:0),float(k==0||k==1||k==7?1:k==3||k==4||k==5?-1:0));
  vec2 q=uv+dir*${s}.*u_px;if(any(lessThan(q,vec2(0.)))||any(greaterThan(q,vec2(1.))))continue;vec4 nb=T(q);if(nb.b<.5)continue;bool ok=true;for(int t=1;t<${s};t++){if(T(uv+dir*float(t)*u_px).b<.5){ok=false;break;}}if(!ok)continue;
  if(nb.g<best.g||(nb.g==best.g&&nb.r<best.r))best=nb.rg;}return vec4(best,me.b,1.);`;
f('q03_coloringbook','Autofill Coloring Book (Reptorian)',[P('Line threshold',.02,.98,.7,.01),S('Line mode',['Soft','Hard']),S('Lines',['Keep','Dilate 1 px','Erode 1 px'])],
  [`float l=luma(O(uv).rgb);int lm=int(u_p2+.5);if(lm>0){for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float v=luma(O(uv+vec2(float(i),float(j))*u_px).rgb);l=lm==1?min(l,v):max(l,v);}}float reg=l>=u_p0?1.:0.;return vec4(uv,reg,1.);`,
   ...[64,32,16,8,4,2,1,64,32,16,8,4,2,1,64,32,16,8,4,2,1,32,16,8,4,2,1,16,8,4,2,1,8,4,2,1,1].map(Q03_CB),
   `vec4 me=T(uv);vec3 c0=O(uv).rgb;vec2 lb=floor(me.rg*u_res);vec3 col=vec3(hash(lb+.37),hash(lb+11.1),hash(lb+23.9));if(me.b<.5)col=u_p1>.5?vec3(0.):c0;else if(u_p1<.5)col*=clamp(luma(c0)/max(u_p0,.05),0.,1.);return vec4(col,1.);`],
  "Reptorian rep_autofill_coloring_book: luminance >= threshold = fillable area, optional dilate / erode of the lines, connected regions labelled (here: minimum-coordinate label propagated with wall-checked jumps, 37 passes - very long thin regions may keep split labels) and each region filled with its own random colour (seeded); hard lines = black, soft = the original line tone over the colour", true);
