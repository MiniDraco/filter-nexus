/* ================= reshade: ReShade shaders (SweetFX, prod80, AstrayFX, Ganossa, Glamarye, SSDO, Cinematic DOF) ================= */
/* NFAA edge difference: max channel difference signed by the luma difference (AstrayFX NFAA LinearDifference, colour mode) */
const RSH_NFLD = `
#define NFLD(A,B) (max(max(abs((A)-(B)).r,abs((A)-(B)).g),abs((A)-(B)).b)*(dot((A)-(B),vec3(.2126,.7152,.0722))<0.?-1.:1.))
`;

f = add('Sharpen');
f('lumasharpen','LumaSharpen (SweetFX)',[P('Strength',.1,3,.65,.01),P('Clamp',0,1,.035,.005),S('Pattern',['Fast (2 taps)','Normal (4 taps)','Wider (17-tap approx.)','Pyramid']),P('Offset bias',0,6,1,.05)],
  `vec3 ori=c.rgb;vec2 px=u_px*max(u_k,1.);float ob=u_p3;int pt=int(u_p2+.5);vec3 bl;float k=1.;
 if(pt==0){bl=(T(uv+px/3.*ob).rgb+T(uv-px/3.*ob).rgb)*.5;k=1.5;}
 else if(pt==1){bl=(T(uv+vec2(px.x,-px.y)*.5*ob).rgb+T(uv-px*.5*ob).rgb+T(uv+px*.5*ob).rgb+T(uv-vec2(px.x,-px.y)*.5*ob).rgb)*.25;}
 else if(pt==2){bl=(T(uv+px*vec2(.4,-1.2)*ob).rgb+T(uv-px*vec2(1.2,.4)*ob).rgb+T(uv+px*vec2(1.2,.4)*ob).rgb+T(uv-px*vec2(.4,-1.2)*ob).rgb)*.25;k=.51;}
 else{bl=(T(uv+vec2(.5*px.x,-px.y*ob)).rgb+T(uv+vec2(-ob*px.x,-.5*px.y)).rgb+T(uv+vec2(ob*px.x,.5*px.y)).rgb+T(uv+vec2(-.5*px.x,px.y*ob)).rgb)*.25;k=.666;}
 float cl=max(u_p1,1e-4);float sl=clamp(dot(ori-bl,vec3(.2126,.7152,.0722)*u_p0*k)*(.5/cl)+.5,0.,1.);sl=cl*2.*sl-cl;
 return vec4(clamp(ori+sl,0.,1.),1.);`,
  'CeeJay SweetFX LumaSharpen 1.5: blur by one of 4 bilinear sampling patterns, sharp = original - blur, luma (Rec.709) x strength, clamped to +-Clamp and added to all channels');

f = add('Color');
f('sweetfx_color','SweetFX / prod80 Colour Effects',[S('Effect',['FakeHDR (SweetFX)','DPX / Cineon (Loadus)','Colourfulness (Fubax)','Saturation Limiter (prod80)','Explosion (SweetFX)']),P('Strength (x default)',0,3,1,.01),P('Setting (radius / contrast / luma limit / sat limit / scatter)',0,1,.5,.01)],
  `int m=int(u_p0+.5);vec3 col=c.rgb;float k=max(u_k,1.);
 if(m==0){float r2=u_p2*1.74,r1=r2*.9115;vec3 s1=vec3(0.),s2=vec3(0.);vec2 o[8]=vec2[8](vec2(1.5,-1.5),vec2(-1.5,-1.5),vec2(1.5,1.5),vec2(-1.5,1.5),vec2(0.,-2.5),vec2(0.,2.5),vec2(-2.5,0.),vec2(2.5,0.));
  for(int i=0;i<8;i++){s1+=T(uv+o[i]*r1*k*u_px).rgb;s2+=T(uv+o[i]*r2*k*u_px).rgb;}s1*=.005;s2*=.01;
  vec3 hdr=(col+(s2-s1))*(r2-r1);vec3 bl=hdr+col;return vec4(clamp(pow(abs(bl),vec3(1.+.3*u_p1))+hdr,0.,1.),1.);}
 if(m==1){float ct=u_p2*.2;vec3 B=col*(1.-ct)+.5*ct;vec3 RC=vec3(8.),Cc=vec3(.36,.36,.34);vec3 bt=1./(1.+exp(RC/2.));
  B=(1./(1.+exp(-RC*(B-Cc))))/(-2.*bt+1.)+(-bt/(-2.*bt+1.));float v=max(max(B.r,B.g),B.b);vec3 cl=B/max(v,1e-5);cl=pow(abs(cl),vec3(1./2.5));vec3 c0=cl*v;
  c0=vec3(dot(c0,vec3(.5003033835,.3380975732,.1645897795)),dot(c0,vec3(.2579688943,.6761952591,.0658358460)),dot(c0,vec3(.0234517889,.1126992737,.8668396731)));
  float lu=dot(c0,vec3(.3,.59,.11));c0=-2.*lu+3.*c0;
  c0=vec3(dot(c0,vec3(2.6714711727,-1.2672360579,-.4109956022)),dot(c0,vec3(-1.0251070293,1.9840911624,.0439502494)),dot(c0,vec3(.0610009456,-.2236707508,1.1590210417)));
  return vec4(clamp(mix(col,c0,clamp(.2*u_p1,0.,1.)),0.,1.),1.);}
 if(m==2){vec3 c0=clamp(col,0.,1.);float lu=sqrt(dot(c0*c0,vec3(.2558,.6511,.0931)));float cf=.4*u_p1;float ll=min(.3+.8*u_p2,1.);
  vec3 dl=c0-lu;vec3 cd=dl*cf;
  if(cf>0.){vec3 rl=clamp(cd*1.2+c0,-.0001,1.0001)-c0;float pl=(1.0002-lu)/(abs(max(dl.r,max(dl.g,dl.b)))+.0001);float nl=(lu+.0002)/(abs(min(dl.r,min(dl.g,dl.b)))+.0001);
   vec3 dm=dl*min(min(pl,nl),32.)-dl;vec3 sl=max(pow(ll*sqrt(abs(dm))+(1.-ll)*sqrt(abs(rl)),vec3(2.)),vec3(1e-7));cd=cd*sl/sqrt(sl*sl+cd*cd);}
  return vec4(clamp(c0+cd,0.,1.),1.);}
 if(m==3){vec3 h=rgb2hsl(col);h.y=min(h.y,u_p2);return vec4(mix(col,hsl2rgb(h),clamp(u_p1,0.,1.)),1.);}
 vec2 n=hash2(floor(uv*u_res)+.5);float r=R(u_p2*4.*u_p1);return vec4(T(uv+(n*2.-1.)*r*u_px).rgb,1.);`,
  'exact ports: SweetFX FakeHDR (two 8-tap rings, radius1/radius2 = .793/.87 at Setting .5, power 1.3 at strength 1), SweetFX DPX (Loadus; sigmoid RGB curve, colorfulness 2.5, XYZ saturation 3, strength .2 x Strength, contrast .1 x Setting/.5), Fubax Colourfulness (2018-11-12, soft-limited saturation, colourfulness .4 x Strength), prod80 Saturation Limit (HSL S clamped to Setting), SweetFX Explosion (each pixel taken from a random spot within +-radius; radius 2 px at defaults as in SweetFX)', 1);

f = add('Blur');
f('ambientlight','AmbientLight / Glamarye Fake GI',[S('Mode',['AmbientLight (Ganossa, ReShade)','Glamarye Fast Effects (fake GI + sharpen)']),P('Intensity',0,2,.5,.01),P('Threshold (AmbientLight) or extra sharpen (Glamarye)',0,1,.05,.01),P('Radius',10,200,40,1,'px')],
  [`vec3 x=c.rgb;if(u_p0<.5){x*=pow(max(x.r,max(x.g,x.b)),2.);float b=(x.r+x.g+x.b)/3.;float nR=x.r*2.-b,nG=x.g*2.-b,nB=x.b*2.-b;
  if(nR<0.){nG+=nR/2.;nB+=nR/2.;nR=0.;}
  if(nG<0.){nB+=nG/2.;if(nR>-nG/2.)nR+=nG/2.;else nR=0.;nG=0.;}
  if(nB<0.){if(nR>-nB/2.)nR+=nB/2.;else nR=0.;if(nG>-nB/2.)nG+=nB/2.;else nG=0.;nB=0.;}
  if(nR>1.){nG+=(nR-1.)/2.;nB+=(nR-1.)/2.;nR=1.;}
  if(nG>1.){nB+=(nG-1.)/2.;if(nR+(nG-1.)<1.)nR+=(nG-1.)/2.;else nR=1.;nG=1.;}
  if(nB>1.){if(nR+(nB-1.)<1.)nR+=(nB-1.)/2.;else nR=1.;if(nG+(nB-1.)<1.)nG+=(nB-1.)/2.;else nG=1.;nB=1.;}
  x=max(vec3(nR,nG,nB)-u_p2,0.);}return vec4(x,1.);`,
   BH('u_p3*.5'), BV('u_p3*.5'), BH('u_p3'), BV('u_p3'),
   `vec3 base=O(uv).rgb;vec3 g=T(uv).rgb;
 if(u_p0<.5){vec3 mn=vec3(0.);for(int j=0;j<12;j++)for(int i=0;i<12;i++)mn+=O((vec2(float(i),float(j))+.5)/12.).rgb;mn/=144.*4.215;
  float low=sqrt(.241*mn.r*mn.r+.691*mn.g*mn.g+.068*mn.b*mn.b);low=pow(low*1.25,2.);float ai=10.15*u_p1;float ad=low*(low+1.)*.7*ai*5.;
  vec3 hi=min(vec3(.0325),g)*1.15;hi+=hi*hi;
  vec3 b=base*max(0.,1.-ad*.75*pow(1.-(base.r+base.g+base.b)/3.,2.));vec3 hs=1.-(1.-b)*(1.-hi);
  return vec4(clamp(mix(b,hs,max(0.,ai-ad)),0.,1.),1.);}
 float lg=luma(g)+.02,lc=luma(base);vec3 tint=clamp(g/lg,0.,3.);
 vec3 r=base*mix(vec3(1.),tint,.5*u_p1);r*=pow((lc+.04)/(lg+.04),.35*u_p1);
 vec2 e=u_px*max(u_k,1.);vec3 nb=(O(uv+vec2(e.x,0.)).rgb+O(uv-vec2(e.x,0.)).rgb+O(uv+vec2(0.,e.y)).rgb+O(uv-vec2(0.,e.y)).rgb)*.25;
 r+=(base-nb)*.8*u_p1*(1.+4.*u_p2);r+=g*(1.-lc)*.15*u_p1;
 return vec4(clamp(r,0.,1.),1.);`],
  'AmbientLight (Ganossa 2015) port: DetectHigh colour boost x max^2, threshold, wide blur, high = min(.0325, blur) x 1.15 + dirt term, scene adaptation from the mean brightness, screen-mixed at alInt 10.15 x Intensity (no dirt/lens textures). Glamarye Fast Effects (R. Jessop) fake global illumination approx.: ambient colour from a wide blur tints the image, big-scale local contrast against it and a 4-tap sharpen; no FXAA / DOF / depth AO');

f = add('Repair');
f('nfaa','NFAA (Normal Filter Anti-Aliasing)',[P('Edge threshold',.01,.5,.1,.005),P('Blur strength',0,2,1,.01),P('Blur size',.5,4,2,.05),S('Output',['Anti-aliased','Edge mask','Normal map'])],
  `${RSH_NFLD}
 vec2 o=.70710678*u_px*max(u_k,1.);vec3 a=T(uv+vec2(-1.,-1.)*o).rgb,b=T(uv+vec2(1.,-1.)*o).rgb,cc=T(uv+vec2(-1.,1.)*o).rgb,d=T(uv+o).rgb;
 vec2 nrm=vec2(NFLD(b+d,a+cc),NFLD(cc+d,a+b));float e=length(nrm);float em=1.,cm=1.;vec3 col=c.rgb;
 if(e>u_p0){em=clamp(log2(e/u_p0)*(-1.)+1.,0.,1.);
  vec4 cr=vec4(NFLD(a+b+cc,3.*d),NFLD(a+b+d,3.*cc),NFLD(a+cc+d,3.*b),NFLD(cc+d+b,3.*a));cm=clamp(em+dot(abs(cr),vec4(.25)),0.,1.);
  float m=nrm.y!=0.?nrm.x/nrm.y:1024.;float dd=.5*u_p2;vec4 of;of.x=sqrt(dd*dd/(1.+m*m));of.y=m*of.x;m=nrm.x!=0.?-nrm.y/nrm.x:1024.;dd=.5;of.z=sqrt(dd*dd/(1.+m*m));of.w=m*of.z;
  vec2 ps=u_px*max(u_k,1.);vec3 e1=T(uv+(of.xy+of.zw)*ps).rgb,f1=T(uv+(of.xy-of.zw)*ps).rgb,g1=T(uv+(-of.xy-of.zw)*ps).rgb,h1=T(uv+(-of.xy+of.zw)*ps).rgb;
  col=mix(col,(e1+f1+g1+h1)*.25,u_p1*.5*(1.-cm));}
 int out_=int(u_p3+.5);if(out_==1)col=vec3(em);
 else if(out_==2){vec2 nm=clamp(vec2(-nrm.x,nrm.y)*u_p2*u_p1*.25+.5,0.,1.);col=vec3(mix(vec2(.5),nm,1.-em),1.);}
 return vec4(col,1.);`,
  'AstrayFX NFAA port: 4 diagonal taps give an edge normal (colour max-difference), edge confidence log2(|n|/threshold), corner mask, and 4 taps along the edge tangent (blur size 2 x 1) mixed by blur strength x (1 - corner mask)');

f = add('Depth');
f('depthfx_reshade','ReShade Depth Effects (Emphasize / Depth Cues / Depth Slicer / Smart Sharp)',[S('Effect',['Emphasize (focus depth pops)','Depth Cues (AstrayFX)','Depth Slicer (prod80)','Depth-aware Smart Sharp (AstrayFX)']),P('Amount',0,1,.8,.01),P('Focus depth / cutoff',0,1,.6,.01),P('Range',0,1,.3,.01)],
  [BH('10.'), BV('10.'), `
 int m=int(u_p0+.5);vec3 col=O(uv).rgb;float d=D(uv);float a=u_p1,fz=u_p2,rg=u_p3;
 if(m==0){float al=smoothstep(rg*.5,rg*.5+.12,abs(d-fz));vec3 de=vec3(luma(col))*.72;return vec4(mix(col,de,al*a),1.);}
 if(m==1){float bl=luma(T(uv).rgb);float sh=clamp(mix(1.,luma(col)/max(bl,1e-3),a*3.),0.,1.);float fade=clamp((1.-d)/max(rg*2.,.02),0.,1.);return vec4(col*mix(sh,1.,fade),1.);}
 if(m==2){float dn=smoothstep(fz-rg*.5-.02,fz-rg*.5,d),df=1.-smoothstep(fz+rg*.5,fz+rg*.5+.02,d);return vec4(mix(col,vec3(0.),(1.-dn*df)*a),1.);}
 vec2 e=u_px*max(u_k,1.);vec3 cs=vec3(0.);float ws=0.,mn=1.,mx=0.;
 for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec3 s=O(uv+vec2(float(i),float(j))*e).rgb;vec3 df=s-col;float w=exp(-.5*float(i*i+j*j)/225.)*exp(-.5*dot(df,df)/.0625);cs+=s*w;ws+=w;
  if(abs(i)<=1&&abs(j)<=1){float l=luma(s);mn=min(mn,l);mx=max(mx,l);}}
 cs/=ws;float amp=sqrt(clamp(min(mn,1.-mx)/max(mx,1e-3),0.,1.));float fade=smoothstep(fz-rg*.5-.01,fz+rg*.5,d);
 return vec4(clamp(col+(col-cs)*a*3.*amp*fade,0.,1.),1.);`],
  'Emphasize (ReShade, Otis): pixels away from the focus depth desaturated / dimmed; AstrayFX Depth Cues: luma / blurred luma ratio (darkening only) faded out with distance; prod80 Depth Slicer: everything outside the depth slice blended to black; AstrayFX Smart Sharp: bilateral 5x5 (sigma 15 / 0.25) detail with CAS-style contrast masking, applied only nearer than the cutoff. Depth map 1 = near');
f('ssdo','SSDO (Screen-Space Directional Occlusion)',[P('Radius',4,80,24,1,'px'),P('Strength',0,3,1,.01),P('Colour bounce',0,2,.8,.01),S('Output',['Composite','Occlusion only','Bounce only'])],
  [`float zs=.6*u_res.y/u_k;float d0=D(uv);float e=3.*max(u_k,1.);vec2 ex=vec2(u_px.x*e,0.),ey=vec2(0.,u_px.y*e);float st=2.*e/u_k;
 vec3 n=normalize(vec3(-(D(uv+ex)-D(uv-ex))*zs/st,-(D(uv+ey)-D(uv-ey))*zs/st,1.));
 float rad=u_p0;float ang=hash(floor(uv*u_res)+.5)*6.2831853;float occ=0.;vec3 ind=vec3(0.);
 for(int i=0;i<24;i++){float t=(float(i)+.5)/24.;float r=rad*sqrt(t);float a=ang+float(i)*2.39996;vec2 off=vec2(cos(a),sin(a))*r;vec2 q=uv+fromPX(off);
  vec3 v=vec3(off,(D(q)-d0)*zs);float l=length(v)+1e-3;float nd=dot(n,v/l);float fall=1./(1.+2.*(l/rad)*(l/rad));
  if(nd>.05){occ+=nd*fall;ind+=O(q).rgb*nd*fall;}}
 return vec4(clamp(ind/5.,0.,1.),clamp(1.-occ/6.*u_p1,0.,1.));`,
   `vec4 s=vec4(0.);float ws=0.;float d0=D(uv);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=uv+vec2(float(i),float(j))*1.5*u_px*max(u_k,1.);float w=exp(-abs(D(q)-d0)*60.);s+=T(q)*w;ws+=w;}s/=ws;
 vec3 col=O(uv).rgb;int o=int(u_p3+.5);vec3 r=col*s.a+col*s.rgb*u_p2;if(o==1)r=vec3(s.a);else if(o==2)r=s.rgb*u_p2;return vec4(clamp(r,0.,1.),1.);`],
  'Ritschel, Grosch & Seidel 2009 SSDO, single-image approx.: 24 spiral samples in a screen disc around the depth-derived normal; samples above the tangent plane occlude (cosine x distance falloff) and reflect their own colour as one-bounce indirect light; white environment assumed for the direct term; depth-aware 5x5 smoothing', 1);
f('cinematicdof','Cinematic DOF (thin-lens CoC, highlight boost)',[P('Focus depth (0 is autofocus centre)',0,1,0,.01),P('Max blur',2,30,12,.5,'px'),P('Highlight boost',0,1,.4,.01),S('Bokeh shape',['Disc','Hexagon'])],
  [`float fd=u_p0;if(fd<.001){fd=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)fd+=D(vec2(.5)+vec2(float(i),float(j))*.03);fd/=9.;}
 float d=D(uv);float s=clamp(1.-d/max(fd,.02),-2.,1.);vec3 col=c.rgb;float lu=luma(col);
 col*=1.+u_p2*6.*pow(smoothstep(.55,1.,lu),2.)*min(abs(s)*2.,1.);return vec4(col,(s+2.)/3.);`,
   `vec4 c0=T(uv);float sc=c0.a*3.-2.;float maxr=R(u_p1);float cc=abs(sc)*maxr;float dc=D(uv);vec3 acc=c0.rgb;float wa=1.;bool hx=u_p3>.5;
 for(int k=1;k<=6;k++){float rr=float(k)/6.*maxr;int n=k*6;for(int i=0;i<36;i++){if(i>=n)break;float a=(float(i)+.5*float(k-2*(k/2)))/float(n)*6.2831853;
  float hf=hx?.8660254/cos(mod(a,1.0471976)-.5235988):1.;vec2 o=vec2(cos(a),sin(a))*rr*hf;vec2 q=uv+o*u_px;vec4 sm=T(q);float cj=abs(sm.a*3.-2.)*maxr;
  float ef=D(q)<dc-.01?min(cj,cc):cj;float w=smoothstep(rr*hf-1.5,rr*hf+.5,ef);acc+=sm.rgb*w;wa+=w;}}
 return vec4(clamp(acc/wa,0.,1.),1.);`],
  'after Cinematic DOF (ReShade): thin-lens circle of confusion with distance ~ 1/depth (CoC = 1 - depth/focus, near side up to 2x), autofocus on the centre, highlights boosted before blurring (out-of-focus only), 126-tap scatter-as-gather disc / hexagon with foreground bleeding over the background and no background bleeding over sharp foreground (approx.)');
