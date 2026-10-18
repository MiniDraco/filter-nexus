/* ================= aftereffects (3/3): After Effects stylize / generate effects (single-frame) ================= */
f = add('Stylize');
f('ae_roughedges','Roughen Edges (After Effects)',[S('Edge type',['Cut','Roughen','Roughen Color','Rusty','Rusty Color','Photocopy','Photocopy Color'],1),
  P('Border',2,60,16,1,'px'),P('Scale',5,200,50,1,'%'),S('Edges of',['Frame','Bright shapes','Dark shapes'])],
  [`int s=int(u_p3+.5);float l=luma(c.rgb);float m=s==1?smoothstep(.45,.55,l):s==2?smoothstep(.55,.45,l):1.;return vec4(vec3(m),1.);`,
   BH('u_p1'), BV('u_p1'),
   `int s=int(u_p3+.5);float b;if(s==0){vec2 pp=PX(uv),sz=PX(vec2(1.));float d=min(min(pp.x,sz.x-pp.x),min(pp.y,sz.y-pp.y));b=clamp(d/(1.2*u_p1),0.,1.);}else b=T(uv).r;
 int m=int(u_p0+.5);vec2 np=PX(uv)/(u_p2*.2+1.);float n=m==0?vnoise(np*.5):fbm(np);float n2=fbm(np*2.3+7.1);
 float bv=b+(n-.5)*.9;float a=smoothstep(.48,.52,bv);float band=a*(1.-smoothstep(.5,.68,bv));vec3 o=O(uv).rgb;vec3 r=o;
 if(m==2)r=mix(o,vec3(.42,.24,.1),band);else if(m==3)r=o*(1.-band*.7*smoothstep(.35,.65,n2));
 else if(m==4)r=mix(o,vec3(.6,.25,.07)*(.55+.7*n2),band);else if(m==5)r=mix(o,vec3(.04),band*step(.47,n2));else if(m==6)r=mix(o,vec3(.42,.24,.1),band*step(.47,n2));
 return vec4(r*a,1.);`],
  'AE Roughen Edges: the alpha edge (frame border, or a luminance-thresholded shape blurred by Border) is perturbed by fractal noise and cut; colour / rusty / photocopy types tint or blotch a band inside the new edge; transparent shown black',1);

f('ae_vegas','Vegas (After Effects)',[P('Threshold',0,1,.5,.01),P('Segments',1,64,16,1),P('Length',.05,1,.5,.01),P('Width',.5,8,2,.1,'px')],
  `vec2 e=u_px*max(u_k,1.);float l0=blurL(uv,1.);float lx=blurL(uv+vec2(e.x,0.),1.)-blurL(uv-vec2(e.x,0.),1.),ly=blurL(uv+vec2(0.,e.y),1.)-blurL(uv-vec2(0.,e.y),1.);
 float gm=length(vec2(lx,ly))*.5;float dist=abs(l0-u_p0)/max(gm,1e-4);float w=max(u_p3*u_k,.5);
 float line=(1.-smoothstep(w*.5,w*.5+1.,dist))*smoothstep(.003,.012,gm);float glow=(1.-smoothstep(0.,w*4.,dist))*smoothstep(.003,.012,gm);
 float ang=atan(uv.y-.5,(uv.x-.5)*asp())/(2.*PI)+.5;float dash=step(fract(ang*u_p1),u_p2);
 vec3 col=vec3(1.,.96,.85);return vec4(clamp(mix(c.rgb,col,line*dash)+col*glow*dash*.3,0.,1.),1.);`,
  'AE Vegas (image-contour mode): strokes along the luminance iso-contour at Threshold, width in px via |L−t|/|∇L|, split into Segments with a Length fraction (segment phase taken from the angle about the centre — approx.), composited on the original with a soft glow');

f('ae_radialshadow','Radial Shadow (After Effects)',[P('Light X',0,1,.25,.01),P('Light Y',0,1,.15,.01),P('Projection distance',0,1,.2,.01),S('Casting shape',['Dark subject','Bright subject'])],
  `vec2 Lp=vec2(u_p0,1.-u_p1);bool pol=u_p3>.5;float lo=luma(c.rgb);float self=pol?smoothstep(.55,.7,lo):smoothstep(.45,.3,lo);float sh=0.;
 for(int i=0;i<12;i++){float t=float(i)/11.;float sc=1.+u_p2*(1.-.35*t);vec2 q=Lp+(uv-Lp)/sc+(hash2(vec2(float(i),3.))-.5)*u_p2*.012;
  if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)continue;float l=luma(O(q).rgb);sh+=pol?smoothstep(.55,.7,l):smoothstep(.45,.3,l);}
 sh/=12.;return vec4(c.rgb*(1.-sh*.6*(1.-self)),1.);`,
  'AE Radial Shadow: a point light at (X, Y) projects the subject (luminance-keyed, since the layer has no alpha) outward by 1 + distance; softness grows with distance; shadow only falls on non-subject pixels',1);

f('ae_smoothie','CC Mr. Smoothie (After Effects)',[P('Smoothness',1,30,8,.5,'px'),P('Phase',0,360,0,1,'°'),P('Loops',.5,8,2,.5),S('Sample line',['Horizontal','Vertical','Diagonal'])],
  [BH('u_p0'), BV('u_p0'),
   `vec3 b=T(uv).rgb;float t=fract(luma(b)*u_p2+u_p1/360.);float t2=1.-abs(2.*t-1.);int m=int(u_p3+.5);
 vec2 A0=m==0?vec2(.08,.5):m==1?vec2(.5,.08):vec2(.08,.08),B0=m==0?vec2(.92,.5):m==1?vec2(.5,.92):vec2(.92,.92);
 return vec4(clamp(sat(T(mix(A0,B0,t2)).rgb,1.25),0.,1.),1.);`],
  'CC Mr. Smoothie: smoothed luminance (× loops + phase, ping-pong) indexes a colour palette sampled along a line between two points of the smoothed image itself (fixed sample points — approx.)');

f = add('Render');
f('ae_4colorgrad','4-Color Gradient (After Effects)',[S('Colors',['AE default (yellow / green / magenta / blue)','Warm','Cool','Pastel','Image corners']),
  P('Blend',1,6,2.5,.1),P('Jitter',0,1,0,.01),S('Blending mode',['None','Multiply','Screen','Overlay','Darken','Lighten','Soft Light'])],
  `vec2 P1=vec2(.1,.9),P2=vec2(.9,.9),P3=vec2(.1,.1),P4=vec2(.9,.1);int pm=int(u_p0+.5);vec3 c1,c2,c3,c4;
 if(pm==0){c1=vec3(1.,1.,0.);c2=vec3(0.,1.,0.);c3=vec3(1.,0.,1.);c4=vec3(0.,0.,1.);}
 else if(pm==1){c1=vec3(1.,.85,.3);c2=vec3(1.,.45,.1);c3=vec3(.85,.15,.25);c4=vec3(.35,.05,.2);}
 else if(pm==2){c1=vec3(.6,.95,1.);c2=vec3(.2,.6,.9);c3=vec3(.35,.25,.8);c4=vec3(.05,.15,.35);}
 else if(pm==3){c1=vec3(1.,.8,.85);c2=vec3(.8,.95,.8);c3=vec3(.8,.85,1.);c4=vec3(1.,.95,.75);}
 else{c1=blur5(P1,6.);c2=blur5(P2,6.);c3=blur5(P3,6.);c4=blur5(P4,6.);}
 vec2 a=vec2(asp(),1.);float w1=1./(pow(length((uv-P1)*a),u_p1)+1e-5),w2=1./(pow(length((uv-P2)*a),u_p1)+1e-5),w3=1./(pow(length((uv-P3)*a),u_p1)+1e-5),w4=1./(pow(length((uv-P4)*a),u_p1)+1e-5);
 vec3 g=(c1*w1+c2*w2+c3*w3+c4*w4)/(w1+w2+w3+w4);g=clamp(g+(hash(floor(PX(uv))+.5)-.5)*u_p2*.15,0.,1.);int bm=int(u_p3+.5);
 return vec4(bm==0?g:blendMode(bm,c.rgb,g),1.);`,
  'AE 4-Color Gradient: four coloured points near the corners blended by inverse-distance weighting (Blend = distance exponent), dithering jitter, optional blend with the layer; default palette approx.',1);

f('ae_light','CC Light Sweep / CC Spotlight / Beam (After Effects)',[S('Effect',['CC Light Sweep','CC Spotlight','Beam']),
  P('X',0,1,.5,.01),P('Y',0,1,.5,.01),P('Angle',0,360,35,1,'°')],
  `float A=asp();vec2 ct=vec2(u_p1,1.-u_p2);vec2 P=(uv-ct)*vec2(A,1.);float a=radians(u_p3);vec2 dr=vec2(cos(a),sin(a)),pr=vec2(-dr.y,dr.x);vec3 o=c.rgb;int m=int(u_p0+.5);
 if(m==0){float d=abs(dot(P,pr));float I=pow(1.-smoothstep(0.,.13,d),2.);return vec4(clamp(o+I*.5*(.45+o)*vec3(1.,.97,.9),0.,1.),1.);}
 if(m==1){vec2 lc=vec2(dot(P,dr)/1.6,dot(P,pr));float rr=length(lc);float I=1.-smoothstep(.16,.3,rr);return vec4(clamp(o*(.12+I*1.3*vec3(1.,.96,.88)),0.,1.),1.);}
 vec2 pp=PX(uv),S0=PX(ct),E0=PX(ct+dr*.7/vec2(A,1.));vec2 se=E0-S0;float t=clamp(dot(pp-S0,se)/dot(se,se),0.,1.);float d=length(pp-S0-se*t);
 float th=mix(3.,14.,t);float core=1.-smoothstep(th*.2,th*.45,d);float gl=exp(-d*d/(th*th*1.2));
 return vec4(clamp(o+core+gl*.8*vec3(.35,.65,1.),0.,1.),1.);`,
  'CC Light Sweep (soft light band through X,Y at Angle, added to the image), CC Spotlight (elliptical cone footprint lighting the image, darkness outside), Beam (laser from X,Y along Angle with perspective thickness, white core + blue glow); fixed widths / colours approx.');

f('ae_radiowaves','Radio Waves (After Effects)',[S('Shape',['Circle','Triangle','Square','Pentagon','Hexagon','Star']),P('Frequency',1,40,10,.5),P('Stroke width',.5,20,4,.5,'px'),P('Fade',0,1,.5,.01)],
  `vec2 pp=PX(uv)-PX(vec2(.5));float r=length(pp);float th=atan(pp.y,pp.x);int m=int(u_p0+.5);float rp=r;
 if(m>=1&&m<=4){float N=float(m)+2.;float sec=2.*PI/N;float aa=mod(th-PI/2.+sec*.5,sec)-sec*.5;rp=r*cos(aa)/cos(PI/N);}
 else if(m==5)rp=r*(1.-.35*cos(5.*(th-PI/2.)));
 float maxr=length(PX(vec2(1.)))*.5;float sp=maxr/u_p1;float dd=abs(fract(rp/sp+.5)-.5)*sp;float w=u_p2;float line=1.-smoothstep(w*.5,w*.5+1.2,dd);
 float fade=clamp(1.-rp/maxr*u_p3*1.4,0.,1.);return vec4(mix(c.rgb,vec3(.8,.93,1.),line*fade),1.);`,
  'AE Radio Waves (single frame): concentric wave strokes from the centre with polygon / star shape, frequency, stroke width and radial fade, over the layer');

f('ae_starburst','CC Star Burst (After Effects)',[P('Scatter',0,1,.4,.01),P('Grid spacing',3,40,9,.5,'px'),P('Size',.2,3,1,.05),P('Speed (depth)',0,1,.5,.01)],
  `vec2 p=PX(uv),c0=PX(vec2(.5));float g=u_p1;vec3 r=vec3(0.);
 for(int k=0;k<5;k++){float z=float(k)/4.;float sc=1.+z*u_p3*2.5;vec2 q=c0+(p-c0)/sc;vec2 id=floor(q/g);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cid=id+vec2(float(i),float(j));if(floor(hash(cid+vec2(5.1,9.3))*5.)!=float(k))continue;
   vec2 sp=(cid+.5+(hash2(cid+3.7)-.5)*u_p0)*g;float d=length(q-sp)*sc;float rad=u_p2*2.*(1.+z*1.5);float a=1.-smoothstep(rad*.5,rad,d);
   vec3 col=O(clamp(fromPX(c0+(sp-c0)*sc),0.,1.)).rgb;r=max(r,clamp(col*1.6+.08,0.,1.)*a*(.6+.4*z));}}
 return vec4(r,1.);`,
  'CC Star Burst (single frame): a jittered grid of stars on 5 depth layers, perspective-scaled away from the centre, each coloured by the layer under it, on black',1);
