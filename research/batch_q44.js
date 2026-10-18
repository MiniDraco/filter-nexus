/* ================= q44: Logik Matchbook (Flame Matchbox) shaders, round 18 - image filters ================= */
// vector field from the (pre-blurred) previous pass: Sobel gradient of luma, unit direction with soft magnitude; u_p2 < .5 = along edges (rotated 90 deg)
const Q44_FIELD = `vec2 g=sobel(uv);float m=length(g);vec2 d=g/max(m,1e-6)*(m/(m+.08));if(u_p2<.5)d=vec2(-d.y,d.x);return vec4(.5+.5*d,0.,1.);`;
const Q44_EXP = (dir, tail) => `float a=R(${dir === 'x' ? 'u_p0' : 'u_p1'});vec3 b;if(a<.3)b=T(uv).rgb;else{float st=max(1.,a*6./48.);vec3 acc=vec3(0.);float w=0.;
 for(int i=-48;i<=48;i++){float x=float(i)*st;if(abs(x)>a*6.)continue;float k=exp(-abs(x)/a);acc+=T(uv+${dir === 'x' ? 'vec2(1.,0.)' : 'vec2(0.,1.)'}*x*u_px).rgb*k;w+=k;}b=acc/w;}${tail}`;

f = add('Distort');
f('q44_advect','Advect along Guide (Matchbox Ls_Advect)',[P('Length',0,200,30,1,'px'),P('Steps',1,32,12,1),S('Direction',['Along edges','Across edges (radial)']),P('Guide blur',0,10,2,.5,'px')],
  [BH('u_p3'), BV('u_p3'), Q44_FIELD,
   `vec2 p=uv;int n=int(u_p1+.5);float st=R(u_p0)/float(n);for(int i=0;i<32;i++){if(i>=n)break;vec2 v=T(p).rg*2.-1.;if(dot(v,v)<1e-6)break;p+=v*st*u_px;}return vec4(O(clamp(p,0.,1.)).rgb,1.);`],
  'Lewis Saunders Ls_Advect (lcrs/matchboxes): pass 1 turns a guide into vectors (3x3 Sobel of the guide, rotated 90 deg unless radial), pass 2 walks each pixel along the field and takes the colour at the end of the walk. Here the guide is the image itself (blurred luma) and the vectors are unit directions with soft magnitude (approx.; the Matchbox scales raw gradients by 32/ksize and averages an oversample grid)');

f = add('Blur');
f('q44_splineblur','Spline Blur along Contours (Matchbox Ls_Splineblur)',[P('Length',0,100,20,1,'px'),P('Samples',3,49,21,2),S('Direction',['Along contours','Across (radial)']),S('Path',['Follow streamline','Straight line'])],
  [BH('2.'), BV('2.'), Q44_FIELD,
   `int n=int(u_p1+.5);int hf=(n-1)/2;float st=R(u_p0)/max(float(n-1),1.);vec3 a=O(uv).rgb;float w=1.;
 if(u_p3>.5){vec2 d0=T(uv).rg*2.-1.;for(int i=1;i<=24;i++){if(i>hf)break;vec2 o=d0*st*float(i)*u_px;a+=O(uv+o).rgb+O(uv-o).rgb;w+=2.;}}
 else{vec2 p=uv,q=uv;for(int i=1;i<=24;i++){if(i>hf)break;p+=(T(p).rg*2.-1.)*st*u_px;q-=(T(q).rg*2.-1.)*st*u_px;a+=O(p).rgb+O(q).rgb;w+=2.;}}
 return vec4(a/w,1.);`],
  'Lewis Saunders Ls_Splineblur (lcrs/matchboxes): pass 1 = Sobel vector field of the guide (rotated 90 deg so it runs along contours, or radial), pass 2 averages Samples points spaced Length/(Samples-1) either traced forward and backward along the streamline (re-reading the field at each step) or on a straight segment along the centre vector. Guide = the image (pre-blurred luma); field directions normalised with soft magnitude so flat areas stay sharp (approx. magnitude scaling)');
f('q44_exponblur','Exponential Blur (Matchbox crok_expon_blur)',[P('Amount X',0,100,5,.5,'px'),P('Amount Y',0,100,5,.5,'px'),P('Blend',0,1,1,.01)],
  [Q44_EXP('x', `return vec4(b,1.);`), Q44_EXP('y', `return vec4(mix(O(uv).rgb,b,u_p2),1.);`)],
  'crok_expon_blur (Ivar Beer, code by Miles and Lewis): blur with an exponential falloff exp(-|d|/Amount), independent X and Y amounts, applied separably (so the 2-D kernel is exp(-(|dx|/ax+|dy|/ay))), Blend mixes with the original; kernel out to 6 x Amount (approx.: erode for negative amounts, gamma and half-res options omitted)');

f = add('Stylize');
f('q44_airglow','Airglow (Matchbox Ls_Airglow)',[P('Size',4,300,60,1,'px'),P('Falloff',.3,1.5,1.1,.01),P('Intensity',0,3,1,.01),S('Output',['Add to image','Glow only'])],
  [BH('u_p0/16.'), BV('u_p0/16.'),
   `float sz=max(R(u_p0),2.);float rmin=max(sz/128.,1.),rmax=3.*sz;float lr=log(rmax/rmin);vec3 A[8];float N[8];vec3 c0=pow(max(T(uv).rgb,0.),vec3(2.2));
 for(int k=0;k<8;k++){float sk=max(sz*exp2(float(k)-7.),.5);float g=PI*rmin*rmin/(sk*sk);A[k]=c0*g;N[k]=g;}
 for(int j=0;j<16;j++){float r=rmin*exp(lr*(float(j)+.5)/16.);float ar=r*r*lr/16.*(2.*PI/12.);
  for(int a=0;a<12;a++){float an=(float(a)+.5*float(j))*2.*PI/12.;vec3 s=pow(max(T(uv+vec2(cos(an),sin(an))*r*u_px).rgb,0.),vec3(2.2));
   for(int k=0;k<8;k++){float sk=max(sz*exp2(float(k)-7.),.5);float g=exp(-r*r/(2.*sk*sk))*ar/(sk*sk);A[k]+=s*g;N[k]+=g;}}}
 vec3 gl=vec3(0.);float ws=0.;for(int k=0;k<8;k++){float w=pow(u_p1,float(k));gl+=w*A[k]/max(N[k],1e-9);ws+=w;}gl=gl/ws*u_p2;
 vec3 f0=pow(max(O(uv).rgb,0.),vec3(2.2));vec3 o=u_p3>.5?gl:f0+gl;return vec4(pow(o,vec3(1./2.2)),1.);`],
  'Lewis Saunders Ls_Airglow (lcrs/matchboxes): air-scatter glow = weighted sum of 8 Gaussian blurs whose size doubles per level (largest sigma = Size), computed in linear light and added back onto the image; level weights follow Falloff^k from the smallest blur (the Matchbox draws them from a UI curve; >1 favours the wide blurs). Levels evaluated here on one prefiltered pass with log-spaced polar taps (approx. of its mipmapped blur chain)');

f = add('Color');
f('q44_relax','Relax toward Haze Colour (Matchbox Ls_Relax)',[P('Haze hue',0,360,210,1,'deg'),P('Haze amount',0,1,.35,.01),P('Shadow restore',0,1,.6,.01),P('Highlight restore',0,1,.3,.01)],
  `vec3 f0=O(uv).rgb;vec3 hz=hsv2rgb(vec3(u_p0/360.,.35,.6));vec3 m=mix(f0,hz,u_p1);float l=luma(f0);float sh=1.-smoothstep(0.,.5,l),hl=smoothstep(.5,1.,l);
 vec3 r=mix(m,f0,u_p2*sh);r=mix(r,f0,u_p3*hl);return vec4(r,1.);`,
  'Lewis Saunders Ls_Relax (lcrs/matchboxes): mix every pixel toward a master (haze) colour by 1 - contrast, then restore the original in the shadows and highlights by their range weights; per-range tints left at their default 0. Haze colour = HSV(hue, .35, .6); shadow/highlight weights are smoothsteps around luma .5 (approx. of the adsk_shadows / adsk_highlights library calls)');
f('q44_rndmgrade','Random Grade (Matchbox Ls_RndmGrade)',[P('Seed',0,999,7,1),P('Curve strength',0,1,.6,.01),P('Colourfulness',0,1,.6,.01),P('Channel bleed',0,1,.4,.01)],
  `float sd=floor(u_p0+.5);vec3 x=clamp(O(uv).rgb,0.,1.);float sa=max(x.r,max(x.g,x.b))-min(x.r,min(x.g,x.b));
 vec3 o1=(vec3(hash(vec2(sd,1.)),hash(vec2(sd,2.)),hash(vec2(sd,3.)))-.5)*u_p3,o2=(vec3(hash(vec2(sd,4.)),hash(vec2(sd,5.)),hash(vec2(sd,6.)))-.5)*u_p3;
 vec3 mx=vec3(x.r*(1.-o1.x-o2.x)+x.g*o1.x+x.b*o2.x,x.g*(1.-o1.y-o2.y)+x.b*o1.y+x.r*o2.y,x.b*(1.-o1.z-o2.z)+x.r*o1.z+x.g*o2.z);vec3 y=mix(x,mx,sa);
 vec3 cv;for(int ch=0;ch<3;ch++){float P7[7];for(int i=0;i<5;i++){float fi=float(i);P7[i+1]=fi*.25+((i==0||i==4)?0.:(hash(vec2(sd,10.+float(ch)*5.+fi))-.5)*.5*u_p1);}
  P7[0]=2.*P7[1]-P7[2];P7[6]=2.*P7[5]-P7[4];float tt=clamp(y[ch],0.,1.)*4.;int sg=int(min(floor(tt),3.));float fr=tt-float(sg);
  float p0=P7[sg],p1=P7[sg+1],p2=P7[sg+2],p3=P7[sg+3];cv[ch]=.5*((2.*p1)+(-p0+p2)*fr+(2.*p0-5.*p1+4.*p2-p3)*fr*fr+(-p0+3.*p1-3.*p2+p3)*fr*fr*fr);}
 vec3 nt=y+(cv.r+cv.g+cv.b-y.r-y.g-y.b)/3.;return vec4(clamp(mix(nt,cv,u_p2),0.,1.),1.);`,
  'Lewis Saunders Ls_RndmGrade (lcrs/matchboxes): seeded random grade = random cross-channel bleed matrix weighted by saturation (greys untouched), then a random spline curve per channel with ends locked to 0 and 1; Colourfulness blends between the per-channel curves and their common average shift (less colour cast). Catmull-Rom through 5 random points (approx. of its curve builder; overlays omitted)');

f = add('Repair');
f('q44_shadowplate','Shadowplate Sun Removal (Matchbox Ls_Shadowplate)',[P('Gain',0,1,.5,.01),P('Protect shadows',0,1,.1,.01),P('Protect highlights',0,2,.7,.01),P('Chroma blur',0,40,4,.5,'px')],
  [BH('u_p3'), BV('u_p3'),
   `vec3 c0=max(O(uv).rgb,0.);vec3 hv=rgb2hsv(c0);float km=u_p1,kx=max(u_p2,u_p1+.01),ks=.3;float V=hv.z;
 for(int i=0;i<10;i++){float k=clamp((luma(hsv2rgb(vec3(hv.xy,V)))-km)/(kx-km),0.,1.);float z=k<.5?k:k-.5;float sv=k<.5?ks:-ks;float e=.5*(2.*z*(sv-1.))/(4.*sv*z-sv-1.)+(k<.5?0.:.5);V*=mix(1.,u_p0,e);}
 vec3 bh=rgb2hsv(max(T(uv).rgb,0.));return vec4(hsv2rgb(vec3(bh.xy,V)),1.);`],
  'Lewis Saunders Ls_Shadowplate (lcrs/matchboxes) with its defaults: HSV working space, luma key between Protect shadows and Protect highlights shaped by its smoothishstep S-curve (smoothness .3), value multiplied by Gain weighted by the key and repeated 10 times (so sunlit areas sink to shadow level), then hue and saturation replaced from a blurred copy of the original. Key read from the graded RGB luma (approx.)');

f = add('Analysis');
f('q44_skinoverlay','Skin Line Overlay (Matchbox ak_skinoverlay)',[P('Skin hue',0,360,22,1,'deg'),P('Tolerance',.5,15,3,.1,'%'),P('Overlay strength',0,1,.65,.01),S('Boundary band',['Off','On'],1)],
  `vec3 px=O(uv).rgb;vec3 hv=rgb2hsv(max(px,0.));if(hv.y<.05||hv.z<.05)return vec4(px,1.);float sk=u_p0/360.;float dh=hv.x-sk;dh-=floor(dh+.5);float off=abs(dh);float tl=u_p1/100.;vec3 ov;
 if(off<tl)ov=vec3(1.,.537,.537);else if(u_p3>.5&&off<3.*tl)ov=dh<0.?vec3(.403,.403,1.):vec3(1.,1.,.403);else return vec4(px,1.);return vec4(mix(px,ov,u_p2),1.);`,
  'allklier ak_skinoverlay (MX-Skin-Overlay): pixels whose HSV hue lies within Tolerance of the skin-line hue are painted pink, the band out to 3 x Tolerance blue (hue below the skin line) or yellow (above) so skin can be graded onto the line; pixels with S or V below .05 pass through. Overlay colours of its Rec.709 mode; mixed in display space (approx.)');

f = add('Sharpen');
f('q44_texturecontrol','Texture Control 4-band (Matchbox ak_texturecontrol)',[P('Tiny detail',-1,1,.5,.01),P('Small detail',-1,1,.4,.01),P('Medium detail',-1,1,.2,.01),P('Large detail',-1,1,0,.01)],
  [BH('4.'), BV('4.'),
   `
#define Q44TENT(RAD,OUTV) {vec3 a_=vec3(0.);float w_=0.;float sp_=R(RAD)/4.5;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){float k_=(1.-abs(float(i))/4.5)*(1.-abs(float(j))/4.5);a_+=T(uv+vec2(float(i),float(j))*sp_*u_px).rgb*k_;w_+=k_;}OUTV=a_/w_;}
vec3 S0=O(uv).rgb;vec3 B1=vec3(0.);float w1=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){float k=(1.-abs(float(i))/2.5)*(1.-abs(float(j))/2.5);B1+=O(uv+vec2(float(i),float(j))*u_k*u_px).rgb*k;w1+=k;}B1/=w1;
 vec3 B2,B3,B4;Q44TENT(5.,B2)Q44TENT(15.,B3)Q44TENT(30.,B4)
 vec3 r=S0+u_p0*(S0-B1)+u_p1*(B1-B2)+u_p2*(B2-B3)+u_p3*(B3-B4);return vec4(r,1.);`],
  'allklier ak_texturecontrol (MX-Texture-Control): frequency separation by tent blurs of radius 2 / 5 / 15 / 30 px, each band (source - tiny, tiny - small, small - medium, medium - large) added back times its detail gain (-1 softens, +1 doubles). Four of its five bands (the 60 px X-Large band and the shadow/mid/highlight weights, all 1 by default, omitted); the larger tents are sampled on 9x9 grids of a 2 px pre-blur (approx.)');

f = add('Color');
f('q44_trigrade','Trigrade Colour-Vector Grade (Matchbox nob_trigrade)',[P('Source hue',0,360,30,1,'deg'),P('Target hue',0,360,60,1,'deg'),P('Vector chroma',.05,1,.4,.01),S('Luminance normalise',['On','Off'])],
  `vec3 x=pow(max(O(uv).rgb,0.),vec3(2.2));vec3 s=pow(hsv2rgb(vec3(u_p0/360.,u_p2,.8)),vec3(2.2)),t=pow(hsv2rgb(vec3(u_p1/360.,u_p2,.8)),vec3(2.2));
 if(u_p3<.5)t*=luma(s)/max(luma(t),1e-4);x+=(t-s)*dot(s,x)/dot(s,s);return vec4(pow(max(x,0.),vec3(1./2.2)),1.);`,
  'nob_trigrade (nobbl211, MIT) with one active Colour-mode vector: the linear colour matrix M = I + (t - s) s^T / (s.s) maps the source colour s exactly to the target t and leaves the colour space orthogonal to s unchanged; target luminance normalised to the source (on by default, Rec.709 luma here instead of ACEScg). Source and target are given by hue at the chosen chroma (V .8); applied in linear light. Two- and three-vector solves and the Oklab mode omitted');

f = add('Tone');
f('q44_reversegrade','Reverse Grade (Matchbox AFX_ReverseGrade)',[P('Blackpoint',-.2,.5,.06,.005),P('Whitepoint',.5,1.5,.92,.005),P('Lift',-.2,.5,0,.005),P('Gain',.5,1.5,1,.005)],
  `float A=(u_p3-u_p2)/max(u_p1-u_p0,1e-4);if(abs(A)<1e-4)A=1e-4;float B=u_p2-A*u_p0;return vec4((O(uv).rgb-B)/A,1.);`,
  'AFX_ReverseGrade (John Ashby) = the reverse mode of the Nuke Grade node: forward grade y = A x + B with A = (gain - lift)/(whitepoint - blackpoint), B = lift - A blackpoint (multiply 1, offset 0, gamma 1); reverse x = (y - B)/A maps lift back to blackpoint and gain back to whitepoint, used to match one plate to another. Applied to the pixel values as stored');

f = add('Color');
f('q44_multiband','Multiband Colour Corrector (Matchbox AA_Multiband_ColorCorrect)',[S('Band',['Master','Low','Low mid','Mid','High mid','High'],1),P('Wheel hue',0,360,210,1,'deg'),P('Wheel gain',0,1,.6,.01),P('Exposure',-2,2,0,.01,'stops')],
  `vec3 c0=O(uv).rgb;float l=clamp(luma(c0),0.,1.);int b=int(u_p0+.5);float w=1.;
 if(b>0){float ws=0.,wb=0.;for(int i=0;i<5;i++){float e=(l-float(i)*.25)/.14;float g=exp(-.5*e*e);ws+=g;if(i==b-1)wb=g;}w=wb/ws;}
 vec3 wc=hsv2rgb(vec3(u_p1/360.,1.,1.));wc-=luma(wc);vec3 r=c0*exp2(u_p3)+wc*u_p2*.4;return vec4(mix(c0,r,w),1.);`,
  'AA_Multiband_ColorCorrect (Anthony Augusta): Master plus five fixed luminance bands (Low, Low Mid, Mid, High Mid, High), each with its own colour wheel (hue + gain) and exposure; one band at a time here. Band weights = normalised Gaussians centred at luma 0, .25, .5, .75, 1 (approx.: the Matchbox band limits are not published; gamma/gain/offset/contrast/saturation and the picker omitted)');

f = add('Distort');
f('q44_reframe','Focal-Length Reframe (Matchbox nob_reframe)',[P('Source FOV',20,140,70,1,'deg'),P('Focal factor',.5,3,1.3,.01),P('Pan',-45,45,10,.5,'deg'),P('Tilt',-45,45,0,.5,'deg')],
  `float tx=tan(radians(u_p0)*.5);vec2 q=(uv-.5)*2.;q.y/=asp();vec3 d=vec3(q*tx/u_p1,1.);float tl=radians(u_p3),pn=radians(u_p2);
 d=vec3(d.x,d.y*cos(tl)+d.z*sin(tl),-d.y*sin(tl)+d.z*cos(tl));d=vec3(d.x*cos(pn)+d.z*sin(pn),d.y,-d.x*sin(pn)+d.z*cos(pn));
 if(d.z<=1e-4)return vec4(0.,0.,0.,1.);vec2 sp=d.xy/d.z/tx;vec2 su=.5+.5*vec2(sp.x,sp.y*asp());if(su.x<0.||su.y<0.||su.x>1.||su.y>1.)return vec4(0.,0.,0.,1.);return vec4(O(su).rgb,1.);`,
  'nob_reframe (nobbl211, MIT): re-shoot a rectilinear frame from the same camera position with a different focal length and orientation: each output ray (horizontal FOV of the source / Focal factor) is rotated by tilt and pan and projected back into the source pinhole image (exact homography; its lens rectify/re-distort modules, output format and supersampled filtering omitted)');

f = add('Tone');
f('q44_shadowdensity','Shadow Density (Matchbox BB_ShadowDensity)',[P('Shadow lift',-1,0,-.08,.005),P('Shadow pivot',.01,1,.35,.01),P('Extra desat',0,1,.3,.01),S('Colour space',['Rec.709','Scene linear'])],
  `vec3 c0=O(uv).rgb;bool lin=u_p3>.5;vec3 w=lin?sign(c0)*pow(abs(c0),vec3(1./2.4)):c0;vec3 k=vec3(.2126,.7152,.0722);float m=1.-smoothstep(0.,max(u_p1,.001),dot(w,k));
 vec3 lf=w+u_p0*m;vec3 r=mix(lf,vec3(dot(lf,k)),m*u_p2);if(lin)r=sign(r)*pow(abs(r),vec3(2.4));else r=clamp(r,0.,1.);return vec4(r,1.);`,
  'BB_ShadowDensity (BayleyBY, CC BY-SA 4.0) port: mask = 1 - smoothstep(0, pivot, luma) in the perceptual working space (scene-linear goes through a sign-safe 1/2.4 power), shadows pushed down by lift x mask, then desaturated toward the post-lift luma by mask x desat; Rec.709 result clamped. Defaults set to a visible density (source defaults lift 0, desat 0)');

f = add('Distort');
f('q44_rift','Rift Side-by-Side Barrel Warp (Matchbox crok_rift)',[P('Distortion',0,1.5,.5,.01),P('Scale',.8,3,1.6,.01),P('Lens offset',-.2,.2,.05,.005),S('Input',['Side-by-side stereo','Mono (duplicate)'])],
  `float eye=step(.5,uv.x);vec2 lu=vec2(min(fract(uv.x*2.),1.),uv.y);float ea=(u_res.x*.5)/u_res.y;vec2 lc=vec2(.5+(eye>.5?-1.:1.)*u_p2,.5);
 vec2 th=(lu-lc)*vec2(2.,2./ea);float rs=dot(th,th);float k1=.44*u_p0,k2=.48*u_p0;vec2 t1=th*(1.+k1*rs+k2*rs*rs);vec2 tc=lc+t1*vec2(.5,.5*ea)/u_p1;
 if(tc.x<0.||tc.x>1.||tc.y<0.||tc.y>1.)return vec4(0.,0.,0.,1.);vec2 su=u_p3<.5?vec2((eye+tc.x)*.5,tc.y):tc;return vec4(O(su).rgb,1.);`,
  'crok_rift (Lewis Saunders and Ivar Beer, after Lubosz 2013 GStreamer Oculus viewer): each half of a side-by-side frame is warped about its lens centre with the Oculus SDK distortion r * (k0 + k1 r^2 + k2 r^4), k = (1, .22, .24) at Distortion .5, ScaleIn (2, 2/aspect), output scale 1/Scale; Mono duplicates one image into both eyes. Lens offset moves the centres toward the nose (approx. of the SDK lens separation)');

f = add('Materials');
f('q44_hextile','Hex-Tiling Repetition-Free Texture (Matchbox crok_tile)',[P('Tiles',.5,12,1.2,.1),P('Blend',.05,1,.35,.01),S('Rotation',['Random','None']),P('Seed',0,100,1,1)],
  `
#define Q44HX(VV,WW) {vec2 cp_=vec2((VV).x+(VV).y*.5,(VV).y*.8660254);float an_=u_p2<.5?hash((VV)+sd)*6.2832:0.;vec2 lc_=rot(p-cp_,an_)*.5+hash2((VV)+sd+3.1)*2.;lc_=1.-abs(1.-mod(lc_,2.));acc+=O(lc_).rgb*(WW);}
vec2 p=uv*vec2(asp(),1.)*u_p0*2.;float sd=floor(u_p3+.5)*13.1;vec2 q=vec2(p.x-p.y*.5773503,p.y*1.1547005);vec2 b=floor(q),fq=fract(q);vec2 v0,v1,v2;vec3 w;
 if(fq.x+fq.y<1.){v0=b;v1=b+vec2(1.,0.);v2=b+vec2(0.,1.);w=vec3(1.-fq.x-fq.y,fq.x,fq.y);}else{v0=b+vec2(1.);v1=b+vec2(0.,1.);v2=b+vec2(1.,0.);w=vec3(fq.x+fq.y-1.,1.-fq.x,1.-fq.y);}
 w=pow(max(w,0.),vec3(1./max(u_p1,.05)));w/=dot(w,vec3(1.));vec3 acc=vec3(0.);Q44HX(v0,w.x)Q44HX(v1,w.y)Q44HX(v2,w.z)return vec4(acc,1.);`,
  'crok_tile (Ivar Beer, after Suslik shadertoy tsVGRd, hex tiling by Shane): the image is used as a texture and re-tiled without visible repetition: every vertex of a triangular lattice (= hex-cell centre) gets a random offset and rotation, each pixel blends the three surrounding cells with barycentric weights sharpened by 1/Blend. Mirrored wrap keeps non-seamless sources continuous (approx.: no histogram-preserving blend)');

f = add('Frames');
f('q44_safezones','Social Safe Zones (Matchbox BB_SocialSafeZones)',[S('Destination',['Instagram Reels 9x16','Meta Feed 1x1','Meta Feed 4x5','Meta Stories 9x16','TikTok 9x16','YouTube DemandGen 16x9','YouTube Shorts 9x16'],4),P('Fill opacity',0,1,.35,.01),S('Cutouts',['Off','On'],1),P('Border width',0,12,3,.5,'px')],
  `int m=int(u_p0+.5);vec4 M=m==0?vec4(14.,35.,6.,6.):m==1?vec4(12.5,12.5,2.5,2.5):m==2?vec4(10.,10.,2.5,2.5):m==3?vec4(14.,20.,6.,6.):m==4?vec4(13.,21.,5.6,5.6):m==5?vec4(3.5,35.8,2.,8.4):vec4(15.,35.,4.4,17.8);M/=100.;
 vec2 W=u_res/u_k;vec2 p=PX(uv);vec2 lo=vec2(M.z*W.x,M.y*W.y),hi=vec2((1.-M.w)*W.x,(1.-M.x)*W.y);vec2 ce=(lo+hi)*.5,hb=(hi-lo)*.5;float rc=min(20.,min(hb.x,hb.y));
 vec2 qq=abs(p-ce)-hb+rc;float sdv=length(max(qq,0.))+min(max(qq.x,qq.y),0.)-rc;float un=step(0.,sdv);
 if(u_p2>.5){if(m==0&&uv.x>.79&&uv.y<.6)un=1.;if(m==4&&uv.x>.852&&uv.y<.448)un=1.;if(m==5&&((uv.x<.2583&&uv.y>.8306)||(uv.x>.7526&&uv.y>.8769)))un=1.;}
 vec3 o=mix(O(uv).rgb,vec3(1.,.1,.1),un*u_p1);if(u_p3>0.)o=mix(o,vec3(1.),1.-smoothstep(u_p3*.5-.5,u_p3*.5+.5,abs(sdv)));return vec4(o,1.);`,
  'BB_SocialSafeZones (BayleyBY, CC BY-SA 4.0): unsafe margins (top/bottom/left/right % of frame) from its README table - Reels 14/35/6/6, Meta Feed 1:1 12.5/12.5/2.5/2.5, 4:5 10/10/2.5/2.5, Stories 14/20/6/6, TikTok 13/21/5.6/5.6, YouTube DemandGen 3.5/35.8/2/8.4, Shorts 15/35/4.4/17.8 - filled red outside a 20 px rounded safe box, with border; cutouts: Reels right 21% x lower 60%, TikTok right 14.8% x lower 44.8%, DemandGen top corners 496x183 / 475x133 of 1920x1080. Render at the delivery aspect');

f = add('Render');
f('q44_perspectivelines','Vanishing-Point Line Fan (Matchbox BB_PerspectiveLines)',[P('VP X',0,1,.5,.005),P('VP Y',0,1,.55,.005),P('Fan lines',4,64,24,1),P('Stroke width',.5,6,1.5,.1,'px')],
  `vec2 W=u_res/u_k;vec2 p=PX(uv),vp=vec2(u_p0,u_p1)*W;vec2 d=p-vp;float r=length(d);float n=floor(u_p2+.5);float dA=6.28318/n;float a=atan(d.y,d.x);float k=floor(a/dA+.5);float dl=r*abs(sin(a-k*dA));
 float hw=u_p3*.5;float ln=smoothstep(hw+.5,hw-.5,dl)*mix(1.,smoothstep(0.,.35,r/length(W)),.6);float hz=smoothstep(hw+.5,hw-.5,abs(p.y-vp.y));float vs=12.;
 float wd=clamp(step(abs(r-vs),1.)+step(r,2.5)+step(abs(d.y),1.)*step(abs(d.x),vs*1.6)+step(abs(d.x),1.)*step(abs(d.y),vs*1.6),0.,1.);
 vec3 o=O(uv).rgb;o=mix(o,vec3(.2,.9,1.),ln*.85);o=mix(o,vec3(1.,.8,.2),hz*.8);o=mix(o,vec3(1.,.3,.3),wd);return vec4(o,1.);`,
  'BB_PerspectiveLines (BayleyBY, CC BY-SA 4.0): perspective guide overlay - lines converging on a vanishing point with anti-aliased strokes and its falloff toward the VP (mix of smoothstep(0, .35, distance/diagonal)), the VP widget (ring, centre dot, cross arms 1.6 x size) and a horizon through the VP. The Matchbox builds the fan from two guide lines and in-between lines; here the VP is set directly and the fan is evenly spaced in angle (approx.)');
