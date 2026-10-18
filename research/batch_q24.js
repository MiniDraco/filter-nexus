/* ================= q24: GPUImage ports, web / real-time FX library ports (glfx.js, three.js, pixi-filters, Babylon.js) ================= */
f = add('Insta');
f('q24_gpu_lookups','GPUImage Lookup Looks (Amatorka / Miss Etikate / Soft Elegance)',[S('Look',['Amatorka','Miss Etikate','Soft Elegance']),P('Strength',0,1,1,.01)],
  [`vec3 x=.03+.97*pow(c.rgb,vec3(.9,.92,.95));return vec4(x,1.);`, BH('(u_p0>1.5?20.:0.)'), BV('(u_p0>1.5?20.:0.)'),
  `vec3 o=O(uv).rgb;int m=int(u_p0+.5);vec3 x;
  if(m==0){float l=luma(o);x=mix(vec3(l),o,.82);x=x*x*(3.-2.*x)*.35+x*.65;x=vec3(.06,.045,.07)+x*vec3(.93,.9,.8);x.r+=.12*(1.-x.r)*x.r;}
  else if(m==1){float l=luma(o);x=mix(vec3(l),o,.88);x=pow(max(x,vec3(0.)),vec3(.88,.97,1.04));x=vec3(.09,.05,.08)+x*vec3(.9,.86,.82);}
  else{vec3 l1=.03+.97*pow(o,vec3(.9,.92,.95));vec3 m1=mix(l1,T(uv).rgb,.14);x=m1*m1*(3.-2.*m1)*.25+m1*.75;x=x*vec3(1.02,.99,.96)+vec3(.015,0.,.01);}
  return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`],
  'GPUImage GPUImageAmatorkaFilter / GPUImageMissEtikateFilter / GPUImageSoftEleganceFilter, approx.: the 512x512 lookup PNGs are not embedded, so each lookup is imitated by tone curves (Amatorka: warm faded, lifted blacks, -18% saturation; Miss Etikate: pink-warm fade); Soft Elegance keeps the GPUImage chain lookup 1 -> Gaussian blur (sigma 10) -> alpha blend 0.14 over the lookup-1 image -> lookup 2');
f = add('Tone');
f('q24_gpu_color','GPUImage Colour Ops (Luminance Range Reduction / Skin Tone / CGA)',[S('Operation',['Luminance Range Reduction','Skin Tone Adjust (pink-green)','Skin Tone Adjust (pink-orange)','CGA Colorspace']),P('Amount',-1,1,.6,.01),P('Skin hue',0,1,.05,.01),P('CGA columns',40,400,200,1)],
  `vec3 o=c.rgb;int m=int(u_p0+.5);
  if(m==0){float lu=dot(o,vec3(.2125,.7154,.0721));return vec4(clamp(o+(.5-lu)*u_p1,0.,1.),1.);}
  if(m<=2){vec3 h=rgb2hsv(o);float d=h.x-u_p2;if(d>.5)d-=1.;if(d<-.5)d+=1.;d=abs(d)/.5;float w=clamp(exp(-d*d*40.),0.,1.);
   if(m==1||u_p1<=0.)h.x+=u_p1*w*.25;else h.y=clamp(h.y+u_p1*w*.4,0.,1.);
   return vec4(hsv2rgb(vec3(fract(h.x),h.y,h.z)),1.);}
  vec2 n=vec2(u_p3,u_p3*1.6);vec3 col=T(floor(uv*n)/n+.25/n).rgb;
  vec3 C0=vec3(0.),C1=vec3(1.),C2=vec3(85./255.,1.,1.),C3=vec3(1.,85./255.,1.);
  float d0=distance(col,C0),d1=distance(col,C1),d2=distance(col,C2),d3=distance(col,C3);float dm=min(min(d0,d1),min(d2,d3));
  return vec4(dm==d0?C0:dm==d1?C1:dm==d2?C2:C3,1.);`,
  'GPUImage ports: GPUImageLuminanceRangeFilter (rgb + (0.5 - luminance) * rangeReduction, Rec.709 weights); GPUImageSkinToneFilter (hue distance to skinHue, weight exp(-dist^2 * 40), pink-green = hue shift up to 0.25, pink-orange = saturation +0.4 for positive amounts, hue shift for negative); GPUImageCGAColorspaceFilter (samples a 200 x 320 cell grid, nearest of black / white / cyan 85,255,255 / magenta 255,85,255)');
f = add('Distort');
f('q24_gpu_distort','GPUImage Distortions (Polar Pixellate / Glass Sphere / Sphere Refraction / Stretch)',[S('Effect',['Polar Pixellate','Glass Sphere','Sphere Refraction','Stretch Distortion']),P('Pixel size (polar)',.01,.3,.05,.005),P('Sphere radius',.05,.5,.25,.01),P('Refractive index',.2,1.5,.71,.01)],
  `int m=int(u_p0+.5);
  if(m==0){vec2 nc=2.*uv-1.;float r=length(nc);float ph=atan(nc.y,nc.x);r=r-mod(r,u_p1)+.03;ph=ph-mod(ph,u_p1);return T(vec2(r*cos(ph),r*sin(ph))*.5+.5);}
  if(m==3){vec2 nc=2.*uv-1.;vec2 sg=sign(nc);nc=abs(nc);nc=.5*nc+.5*smoothstep(.25,.5,nc)*nc;nc*=sg;return T(nc*.5+.5);}
  float ar=1./asp();vec2 tc=vec2(uv.x,uv.y*ar+.5-.5*ar);float rad=u_p2;float d=distance(vec2(.5),tc);float inside=step(d,rad);d/=rad;
  float nd=rad*sqrt(max(1.-d*d,0.));vec3 nrm=normalize(vec3(tc-.5,nd));vec3 rf=refract(vec3(0.,0.,-1.),nrm,u_p3);
  if(m==2)return vec4(T((rf.xy+1.)*.5).rgb*inside,1.);
  rf*=2.;rf.xy=-rf.xy;vec3 col=T((rf.xy+1.)*.5).rgb;
  col+=2.5*(1.-pow(clamp(dot(vec3(0.,0.,1.),nrm),0.,1.),.25));
  col+=vec3(.8)*pow(clamp(dot(normalize(vec3(-.5,.5,1.)),nrm),0.,1.),15.);
  return vec4(clamp(col,0.,1.)*inside,1.);`,
  'GPUImage ports (centre 0.5,0.5): GPUImagePolarPixellateFilter (radius and angle both floored to pixelSize, +0.03 on the radius), GPUImageGlassSphereFilter (2 x refract through the sphere normal, xy flipped, grazing-angle ambient 2.5(1 - (N.z)^0.25) + specular pow 15 from (-0.5,0.5,1)), GPUImageSphereRefractionFilter (plain refract, black outside), GPUImageStretchDistortionFilter (0.5 n + 0.5 smoothstep(0.25,0.5,|n|) n)');
f('q24_vr_distort','VR Distortion Correction (Babylon.js)',[S('Layout',['Single lens','Side-by-side stereo']),P('K1',-.5,1,.22,.01),P('K2',-.5,1,.24,.01),P('Scale factor',1,3,1.7146,.01)],
  `int m=int(u_p0+.5);vec2 q=uv;float a=asp();float off=0.;
  if(m==1){bool rt=uv.x>=.5;q.x=rt?uv.x*2.-1.:uv.x*2.;a*=.5;off=rt?-.075988:.075988;}
  vec2 lc=vec2(.5+off,.5);vec2 si=vec2(2.,2./a);vec2 sc=vec2(.5/u_p3,.5/u_p3*a);
  vec2 th=(q-lc)*si;float r2=dot(th,th);vec2 tc=lc+sc*th*(1.+u_p1*r2+u_p2*r2*r2);
  if(tc.x<0.||tc.x>1.||tc.y<0.||tc.y>1.)return vec4(0.,0.,0.,1.);
  return vec4(T(tc).rgb,1.);`,
  'Babylon.js vrDistortionCorrection.fragment.fx HmdWarp: theta = (uv - LensCenter) * ScaleIn (2, 2/aspect), r^2 = |theta|^2, tc = LensCenter + Scale * theta * (K0 + K1 r^2 + K2 r^4) with K0 = 1, Scale = 0.5/postProcessScaleFactor (x aspect for y), black outside; stereo = each half is one eye (aspect halved, lens centre offset +-lensCenterOffset/2 = 0.076, default VRCameraMetrics values)');
f = add('Blur');
f('q24_gpu_blur','GPUImage Blurs (iOS 7 Blur / Gaussian Selective Blur)',[S('Blur',['iOS 7 Blur','Gaussian Selective Blur']),P('Blur sigma',.5,30,4,.5,'px'),P('Clear radius',.02,.7,.1875,.005),P('Edge width',0,.4,.09375,.005)],
  [BH('(u_p0<.5?u_p1*8.:u_p1*2.)'), BV('(u_p0<.5?u_p1*8.:u_p1*2.)'),
  `vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;int m=int(u_p0+.5);vec3 W=vec3(.2125,.7154,.0721);
  if(m==0){float l=dot(b,W);b=mix(vec3(l),b,.8);l=dot(b,W);return vec4(clamp(b+(.5-l)*.6,0.,1.),1.);}
  vec2 d=(uv-.5)*vec2(1.,1./asp());return vec4(mix(o,b,smoothstep(u_p2-u_p3,u_p2,length(d))),1.);`],
  'GPUImage ports: GPUImageiOSBlurFilter (saturation 0.8 -> Gaussian blur sigma 12 at 4x downsampling, i.e. sigma 48 at the upstream defaults; default here sigma 4 x 4 = 16 so the image stays readable -> GPUImageLuminanceRangeFilter 0.6); GPUImageGaussianSelectiveBlurFilter (upstream blur sigma 5; default here 4, sharp circle radius 60/320 with 30/320 smoothstep edge, aspect corrected, centre 0.5,0.5)');
f = add('Stylize');
f('q24_gpu_edgefx','GPUImage Toon / Sketch / Colour LBP',[S('Effect',['Smooth Toon','Toon (no pre-blur)','Threshold Sketch','Color Local Binary Pattern']),P('Threshold',.02,1,.2,.01),P('Levels',2,20,10,1),P('Blur sigma',0,6,2,.1,'px')],
  [BH('(u_p0<.5?u_p3*2.:0.)'), BV('(u_p0<.5?u_p3*2.:0.)'),
  `int m=int(u_p0+.5);float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
  if(m==3){vec3 cc=O(uv).rgb;vec3 t=step(cc,O(uv+dx+dy).rgb)+2.*step(cc,O(uv+dy).rgb)+4.*step(cc,O(uv-dx+dy).rgb)+8.*step(cc,O(uv-dx).rgb)
   +16.*step(cc,O(uv-dx-dy).rgb)+32.*step(cc,O(uv-dy).rgb)+64.*step(cc,O(uv+dx-dy).rgb)+128.*step(cc,O(uv+dx).rgb);t/=255.;return vec4(t.r,t.b,t.g,1.);}
  float tl,tp,tr,lf,rt,bl,bt,br;
  if(m==2){tl=luma(O(uv-dx+dy).rgb);tp=luma(O(uv+dy).rgb);tr=luma(O(uv+dx+dy).rgb);lf=luma(O(uv-dx).rgb);rt=luma(O(uv+dx).rgb);bl=luma(O(uv-dx-dy).rgb);bt=luma(O(uv-dy).rgb);br=luma(O(uv+dx-dy).rgb);}
  else{tl=luma(T(uv-dx+dy).rgb);tp=luma(T(uv+dy).rgb);tr=luma(T(uv+dx+dy).rgb);lf=luma(T(uv-dx).rgb);rt=luma(T(uv+dx).rgb);bl=luma(T(uv-dx-dy).rgb);bt=luma(T(uv-dy).rgb);br=luma(T(uv+dx-dy).rgb);}
  float h=-tl-2.*tp-tr+bl+2.*bt+br;float v=-bl-2.*lf-tl+br+2.*rt+tr;float mag=length(vec2(h,v));
  if(m==2)return vec4(vec3(1.-step(u_p1,mag)),1.);
  vec3 pz=floor(T(uv).rgb*u_p2+.5)/u_p2;return vec4(pz*(1.-step(u_p1,mag)),1.);`],
  'GPUImage ports: GPUImageSmoothToonFilter (Gaussian blur sigma 2 -> GPUImageToonFilter: 3x3 Sobel magnitude, black where >= threshold 0.2, colours posterised to 10 levels; luminance used for the Sobel taps); GPUImageThresholdSketchFilter (luminance Sobel, 1 - step(threshold, magnitude); upstream default threshold 0.25); GPUImageColorLocalBinaryPatternFilter (per-channel 8-neighbour LBP byte, output written as R, B, G exactly as upstream)');
f = add('Edges');
f('q24_gpu_corner','GPUImage Noble Corner Detection / XY Derivative',[S('Output',['Corner response','Corner points','Corners over image (crosshairs)','XY derivative (raw)']),P('Sensitivity',.5,30,5,.5),P('Threshold',0,1,.2,.01),P('Blur sigma',.5,6,2,.1,'px')],
  [`float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
  float tl=luma(O(uv-dx+dy).rgb),tp=luma(O(uv+dy).rgb),tr=luma(O(uv+dx+dy).rgb),lf=luma(O(uv-dx).rgb),rt=luma(O(uv+dx).rgb),bl=luma(O(uv-dx-dy).rgb),bt=luma(O(uv-dy).rgb),br=luma(O(uv+dx-dy).rgb);
  float v=-tl-tp-tr+bl+bt+br;float h=-bl-lf-tl+br+rt+tr;return vec4(h*h/9.,v*v/9.,.5+.5*h*v/9.,1.);`,
  BH('u_p3*2.'), BV('u_p3*2.'),
  `vec3 d=T(uv).rgb;float X=d.x*9.,Y=d.y*9.,Z=(d.z*2.-1.)*9.;float cr=(X*Y-Z*Z)/(X+Y+1e-5)*u_p1;return vec4(clamp(cr,0.,1.),0.,0.,1.);`,
  `float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);float cc=T(uv).r;
  float mu=(1.-step(cc,T(uv+dy).r))*(1.-step(cc,T(uv-dx+dy).r))*(1.-step(cc,T(uv-dx).r))*(1.-step(cc,T(uv-dx-dy).r));
  float mx=max(max(cc,T(uv-dy).r),max(max(T(uv+dx-dy).r,T(uv+dx).r),T(uv+dx+dy).r));
  float fin=step(u_p2,cc*step(mx,cc)*mu);return vec4(fin,cc,0.,1.);`,
  `int m=int(u_p0+.5);float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
  if(m==0)return vec4(vec3(T(uv).g),1.);
  if(m==1)return vec4(vec3(T(uv).r),1.);
  if(m==3){float tl=luma(O(uv-dx+dy).rgb),tp=luma(O(uv+dy).rgb),tr=luma(O(uv+dx+dy).rgb),lf=luma(O(uv-dx).rgb),rt=luma(O(uv+dx).rgb),bl=luma(O(uv-dx-dy).rgb),bt=luma(O(uv-dy).rgb),br=luma(O(uv+dx-dy).rgb);
   float v=-tl-tp-tr+bl+bt+br;float h=-bl-lf-tl+br+rt+tr;return vec4(clamp(vec3(h*h,v*v,(h*v+1.)*.5),0.,1.),1.);}
  float hit=0.;for(int i=-6;i<=6;i++){float fi=float(i);hit=max(hit,max(T(uv+dx*fi).r,T(uv+dy*fi).r));}
  return vec4(mix(O(uv).rgb*.75,vec3(0.,1.,0.),hit),1.);`],
  'GPUImage GPUImageNobleCornerDetectionFilter chain: luminance -> GPUImageXYDerivativeFilter (3x3 Prewitt-style h, v; stores h^2, v^2, (hv+1)/2) -> Gaussian blur sigma 2 -> cornerness (Ix2 Iy2 - Ixy^2) / (Ix2 + Iy2) x sensitivity 5 -> GPUImageThresholdedNonMaximumSuppressionFilter (threshold 0.2); crosshair view like GPUImageCrosshairGenerator; XY derivative output shows the raw derivative image');
f = add('Blur');
f('q24_web_blurs','Web FX Blurs (glfx Triangle Blur / three.js Hash Blur / three.js Focus)',[S('Blur',['Triangle Blur (glfx.js)','Hash Blur (three.js TSL)','Focus Shader (three.js)']),P('Radius (triangle)',0,100,20,1,'px'),P('Amount (hash)',0,.2,.04,.005),P('Sample distance (focus)',0,8,.94,.01)],
  [`float rr=u_p0<.5?R(u_p1):0.;if(rr<.5)return T(uv);float off=hash(floor(uv*u_res));vec4 acc=vec4(0.);float tw=0.;
  for(int i=-30;i<=30;i++){float pc=(float(i)+off-.5)/30.;float w=1.-abs(pc);acc+=T(uv+vec2(rr*pc*u_px.x,0.))*w;tw+=w;}return acc/tw;`,
  `float rr=u_p0<.5?R(u_p1):0.;if(rr<.5)return T(uv);float off=hash(floor(uv*u_res)+vec2(7.,3.));vec4 acc=vec4(0.);float tw=0.;
  for(int i=-30;i<=30;i++){float pc=(float(i)+off-.5)/30.;float w=1.-abs(pc);acc+=T(uv+vec2(0.,rr*pc*u_px.y))*w;tw+=w;}return acc/tw;`,
  `int m=int(u_p0+.5);if(m==0)return vec4(T(uv).rgb,1.);
  if(m==1){vec3 acc=vec3(0.);for(int i=0;i<45;i++){float fi=float(i);float an=fi/45.*6.2831853;float rn=fract(sin(dot(vec2(fi,uv.x+uv.y),vec2(12.9898,78.233)))*43758.5453);
   vec2 q=vec2(cos(an),sin(an))*(rn+u_p2);acc+=O(uv+q*u_p2).rgb;}return vec4(acc/45.,1.);}
  vec4 col=O(uv),add=col,tmp;vec2 vin=(uv-.5)*1.4;float sd=dot(vin,vin)*2.;float ff=(.00125*100.+sd)*u_p3*4.;vec2 ss=vec2(1./1024.)*ff;
  vec2 OF[7]=vec2[7](vec2(.111964,.993712),vec2(.846724,.532032),vec2(.943883,-.330279),vec2(.330279,-.943883),vec2(-.532032,-.846724),vec2(-.993712,-.111964),vec2(-.707107,.707107));
  for(int i=0;i<7;i++){tmp=O(uv+OF[i]*ss);add+=tmp;if(tmp.b<col.b)col=tmp;}
  col=col*2.-add/8.;col=col+(add/8.-col)*(1.-sd*.5);return vec4(clamp(col.rgb*col.rgb*.95+col.rgb,0.,1.),1.);`],
  'ports: glfx.js triangleBlur (two 61-tap passes, triangle weights 1 - |t|, jittered offset per pixel); three.js TSL hashBlur (45 taps on a circle, radius (rand + amount) * amount in UV, rand = fract(sin(dot(vec2(i, u+v), (12.9898,78.233))) * 43758.5453)); three.js FocusShader (7 taps at radius (waveFactor*100 + r^2) * sampleDistance * 4 / 1024, min-blue pick, sharpen towards centre, out = c^2 * 0.95 + c)');
f = add('Color');
f('q24_pixi_colorreplace','Multi Color Replace (pixi-filters)',[S('Replacement set',['Sky blue to sunset orange','Greens to autumn','Reds to blue','Primaries cycle (R to G to B)'],1),P('Tolerance',.01,.8,.18,.01),S('Shading',['pixi (target + original - pixel)','Preserve shading (target + pixel - original)'])],
  `int m=int(u_p0+.5);
  vec3 OC[12]=vec3[12](vec3(.45,.65,.9),vec3(.3,.5,.8),vec3(.7,.8,.95),vec3(.3,.5,.2),vec3(.5,.65,.3),vec3(.15,.3,.1),vec3(.8,.2,.2),vec3(.55,.1,.1),vec3(-1.),vec3(1.,0.,0.),vec3(0.,1.,0.),vec3(0.,0.,1.));
  vec3 TC[12]=vec3[12](vec3(.95,.55,.25),vec3(.85,.4,.2),vec3(1.,.8,.55),vec3(.75,.4,.1),vec3(.9,.6,.15),vec3(.45,.2,.05),vec3(.2,.3,.85),vec3(.1,.15,.55),vec3(0.),vec3(0.,1.,0.),vec3(0.,0.,1.),vec3(1.,0.,0.));
  for(int i=0;i<3;i++){vec3 oc=OC[m*3+i];if(oc.r<0.)break;vec3 df=oc-c.rgb;if(length(df)<u_p1)return vec4(clamp(TC[m*3+i]+(u_p2<.5?df:-df),0.,1.),1.);}
  return vec4(c.rgb,1.);`,
  'pixi-filters MultiColorReplaceFilter: first original colour within tolerance (Euclidean RGB distance) is replaced by target + (original - pixel) as in the upstream shader; preset replacement lists stand in for the colour arrays (upstream default epsilon 0.05); optional sign flip keeps the pixel shading');
f = add('Depth');
f('q24_bjs_curvature','Screen-Space Curvature (Babylon.js / Blender cavity)',[S('Normals from',['Depth map','Luminance as height']),P('Ridge',0,2,1,.01),P('Valley',0,2,1,.01),P('Height scale',1,200,40,1)],
  `int m=int(u_p0+.5);float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
\n#define Q24H(pp) (m==0?D(pp):luma(O(pp).rgb))
\n#define Q24N(pp) normalize(vec3((Q24H((pp)-dx)-Q24H((pp)+dx))*u_p3,(Q24H((pp)-dy)-Q24H((pp)+dy))*u_p3,1.))
\n  float nd=(Q24N(uv+dy).y-Q24N(uv-dy).y)+(Q24N(uv+dx).x-Q24N(uv-dx).x);float cv;
  if(nd<0.){float q=-nd;float ct=.7/max(u_p2*u_p2,1e-4);cv=-2.*(q<.5/ct?q*(1.-q*ct):.25/ct);}
  else{float q=nd;float ct=.5/max(u_p1*u_p1,1e-4);cv=2.*(q<.5/ct?q*(1.-q*ct):.25/ct);}
  return vec4(clamp(c.rgb*(cv+1.),0.,1.),1.);`,
  'Babylon.js screenSpaceCurvature.fragment.fx (from Blender workbench cavity): normal_diff = (N_up.y - N_down.y) + (N_right.x - N_left.x) over a 1 px offset, soft clamp c(1 - c k) below 0.5/k, ridge k = 0.5/ridge^2, valley k = 0.7/valley^2, colour *= curvature + 1; view normals are derived here from the depth map (or luminance) gradient x height scale since there is no G-buffer');
