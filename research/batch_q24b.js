/* ================= q24b: Filter Forge photo filters, GEGL ops, Kornia pooling / whitening ================= */
f = add('Sharpen');
f('q24_ff_sharpen','Filter Forge Sharpeners (Noise Tolerant / Light Controlled / Contrastic)',[S('Sharpener',['Noise Tolerant Photo Sharpen','Light controled Sharpen','Contrastic Sharpener']),P('Amount',0,3,1,.01),P('Radius',.5,20,2,.1,'px'),P('Balance or denoise',0,1,.5,.01)],
  [BH('u_p2'), BV('u_p2'),
  `vec3 o=O(uv).rgb,b=T(uv).rgb;int m=int(u_p0+.5);float lo=luma(o),lb=luma(b);vec3 r;
  float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
  if(m==0){vec2 g=vec2(luma(T(uv+dx).rgb)-luma(T(uv-dx).rgb),luma(T(uv+dy).rgb)-luma(T(uv-dy).rgb));float e=smoothstep(.01,.06,length(g));
   float L=lo+u_p1*1.5*(lo-lb)*e;vec3 ch=mix(o-lo,b-lb,u_p3);r=L+ch;}
  else if(m==1){float w=2.*mix(1.-lo,lo,u_p3);r=o+u_p1*w*(o-b);}
  else{vec3 hp=clamp(o-b+.5,0.,1.);vec3 sl=(1.-2.*hp)*o*o+2.*hp*o;r=o+u_p1*1.5*(sl-o);float lr=luma(r);r=mix(vec3(lr),r,.5+u_p3);}
  return vec4(clamp(r,0.,1.),1.);`],
  'Filter Forge photo sharpeners, approx. (FF pages give only the controls): Noise Tolerant Photo Sharpen (Hendrik) = unsharp mask on luminance gated by an edge-selection mask from the blurred gradient, chroma denoised towards the blurred chroma by the denoise amount; Light controled Sharpen (Kutianski) = unsharp mask weighted by darkness (balance 0) or lightness (balance 1); Contrastic Sharpener (jffe) = soft-light blend of the high-pass detail (contrast-based sharpening) with saturation control');
f = add('Retro');
f('q24_ff_retro','Filter Forge Scanline Master 3000 / LOMO Indicator',[S('Effect',['Scanlines horizontal','Scanlines vertical','Scanlines + interference','LOMO Indicator']),P('Amount',0,1,.6,.01),P('Number of lines',20,600,160,1),P('Desaturate or corners',0,1,.3,.01)],
  `int m=int(u_p0+.5);vec3 o=c.rgb;
  if(m<3){vec3 bs=mix(o,vec3(luma(o)),u_p3);vec2 q=uv;
   if(m==2){float row=floor(uv.y*u_p2);float n1=hash(vec2(row,floor(u_seed*97.)));q.x+=(n1-.5)*.012*u_p1;bs=mix(o,vec3(luma(o)),u_p3*.5);bs=T(q).rgb;bs=mix(bs,vec3(luma(bs)),u_p3);bs+=(hash(floor(PX(uv))+u_seed)-.5)*.12*u_p1;}
   float ph=(m==1?uv.x*u_res.x/u_res.y:uv.y)*u_p2;float dd=abs(fract(ph)-.5)*2.;float dark=1.-smoothstep(.35,.75,dd);
   return vec4(clamp(bs*(1.-u_p1*dark)*(1.+.35*u_p1),0.,1.),1.);}
  vec2 d=(uv-.5)*vec2(asp(),1.)/(.5*sqrt(asp()*asp()+1.));float r2=dot(d,d);
  vec3 x=mix(vec3(luma(o)),o,1.+.6*u_p1);x=clamp(x,0.,1.);x=mix(x,x*x*(3.-2.*x),u_p1);
  x*=mix(vec3(1.06,1.02,.9),vec3(.85,.95,1.1),smoothstep(.2,1.,r2)*u_p3*2.);
  x*=1.-u_p1*.85*smoothstep(.25,1.05,r2);return vec4(clamp(x,0.,1.),1.);`,
  'Filter Forge photo filters, approx. (FF pages give only the controls): Scanline Master 3000 (temporalvistasquash) = horizontal / vertical scanline overlay with line count, opacity, desaturation and an interference mode (row jitter + noise); LOMO Indicator (LM.SK) = saturation + S-curve contrast, warm centre / cool corners shift and strong corner vignette', 1);
f = add('Stylize');
f('q24_ff_artistic','Filter Forge Art Looks (Scrimshaw / Ink And Paper / Loose Painting / Cell Shading)',[S('Style',['Scrimshaw Etching (Foxxee)','Ink And Paper Artist (Foxxee)','KRM Loose Painting','Japanese Style Cell Shading']),P('Soften',0,8,1.5,.1,'px'),P('Steps or detail',2,8,4,1),P('Color amount',0,1,.3,.01)],
  [BH('u_p1'), BV('u_p1'),
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb,b=T(uv).rgb;float st=max(1.,u_k);vec2 dx=vec2(u_px.x*st,0.),dy=vec2(0.,u_px.y*st);
  float l=luma(b),lo=luma(o);float gx=luma(T(uv+dx).rgb)-luma(T(uv-dx).rgb),gy=luma(T(uv+dy).rgb)-luma(T(uv-dy).rgb);float gm=length(vec2(gx,gy));vec2 p=PX(uv);
  if(m==0){vec3 iv=vec3(.93,.88,.76),ink=vec3(.13,.1,.08);float d=1.-l;float sp=3.;
   float h1=abs(fract(dot(p,vec2(.707,.707))/sp)-.5)*2.,h2=abs(fract(dot(p,vec2(.707,-.707))/sp)-.5)*2.;
   float ic=1.-smoothstep(d*.9-.2,d*.9+.02,h1);if(d>.55)ic=max(ic,1.-smoothstep((d-.55)*1.8-.2,(d-.55)*1.8+.02,h2));
   ic=max(ic,clamp(gm*u_p2*1.5,0.,1.));vec3 r=mix(iv,ink,ic);vec3 cl=mix(iv,o,.7)*(1.-ic*.85);return vec4(mix(r,cl,u_p3),1.);}
  if(m==1){vec3 pap=mix(vec3(.96,.93,.86),vec3(.86,.82,.74),fbm(p*vec2(.05,.4))*.6);
   float ic=clamp(smoothstep(.01,.06,(l-lo)*u_p2*.25)+smoothstep(.3,.1,lo),0.,1.);ic*=.85+.3*hash(floor(p));
   float bl=smoothstep(.5,.15,l)*u_p3;vec3 r=mix(pap,vec3(.55,.42,.32),bl*.5);r=mix(r,vec3(.08,.08,.12),ic);return vec4(r,1.);}
  if(m==2){vec2 dir=vec2(-gy,gx);dir=length(dir)>1e-4?normalize(dir):vec2(1.,0.);vec2 jt=(hash2(floor(p/6.))-.5)*3.;
   vec3 acc=vec3(0.);float L=2.*u_p1+4.;for(int i=-5;i<=5;i++){float fi=float(i)/5.;acc+=O(fromPX(p+jt+dir*fi*L)).rgb;}acc/=11.;
   float lv=u_p2*2.;acc=mix(acc,floor(acc*lv+.5)/lv,.35);acc=mix(vec3(luma(acc)),acc,1.+u_p3*.6);return vec4(clamp(acc,0.,1.),1.);}
  float lq=(floor(l*u_p2)+.6)/u_p2;vec3 col=b*(lq/max(l,.02));col=mix(vec3(luma(col)),col,1.+u_p3);float ed=smoothstep(.08,.2,gm);
  return vec4(clamp(mix(col,vec3(.05),ed*.9),0.,1.),1.);`],
  'Filter Forge photo filters, approx. (FF pages give only the controls): Scrimshaw Etching = ivory ground, ink hatching whose width follows darkness, cross-hatch in shadows, edge lines, optional colour; Ink And Paper Artist = ink from difference-of-Gaussian lines and dark fills on fibrous paper with grain and warm ink bleeding; KRM Loose Painting = jittered stroke smear along the edge direction with slight posterisation; Japanese Style Cell Shading = smoothed colours with luminance quantised to steps and dark Sobel outlines');
f = add('Blur');
f('q24_ff_lightfx','Filter Forge Faux Bokeh / Wax Blur / Ambient Dust Overlay',[S('Effect',['Faux bokeh','Wax Blur (subsurface scatter)','Ambient Dust Overlay']),P('Amount',0,1,.7,.01),P('Radius',1,40,12,.5,'px'),P('Threshold',0,1,.6,.01)],
  [BH('u_p2'), BV('u_p2'),
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb,b=T(uv).rgb;vec2 p=PX(uv);
  if(m==0){float cs=u_p2*2.5;vec2 cid=floor(p/cs);vec3 acc=vec3(0.);
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=cid+vec2(float(i),float(j));vec2 ctr=(cc+hash2(cc+u_seed*7.))*cs;float rad=cs*(.35+.5*hash(cc+31.7+u_seed));
    vec3 col=T(fromPX(ctr)).rgb;float br=smoothstep(u_p3-.25,u_p3+.15,luma(col));float d=length(p-ctr)/rad;float disc=(1.-smoothstep(.85,1.,d))*(.6+.4*smoothstep(.5,.95,d));acc=max(acc,col*disc*br*1.3);}
   vec3 bs=mix(o,b,.5*u_p1)*(1.-.25*u_p1);return vec4(1.-(1.-bs)*(1.-clamp(acc*u_p1,0.,1.)),1.);}
  if(m==1){vec3 sc=mix(vec3(luma(b)),b,1.6);vec3 wx=o+max(sc-o,0.)*.8+(b-o)*.35;wx=mix(wx,o,smoothstep(u_p3,1.,luma(o))*.6);return vec4(clamp(mix(o,wx,u_p1),0.,1.),1.);}
  float hl=smoothstep(u_p3-.2,u_p3+.2,luma(b));float du=0.;
  for(int k=0;k<3;k++){float cs=k==0?6.:k==1?14.:30.;vec2 cid=floor(p/cs);float ex=step(hash(cid+float(k)*13.1+u_seed),.45);vec2 ctr=(cid+.25+.5*hash2(cid+float(k)*5.3+u_seed))*cs;
   float rad=cs*(.06+.17*hash(cid+9.7+u_seed));float d=length(p-ctr)/rad;du+=ex*(1.-smoothstep(.2,1.,d))*(.35+.65*hash(cid+2.2))*(k==2?.5:1.);}
  return vec4(clamp(o+du*hl*u_p1*vec3(1.,.95,.85),0.,1.),1.);`],
  'Filter Forge photo filters, approx. (FF pages give only the controls): Faux bokeh (truman, bomber-based) = randomly bombed soft discs with bright rims coloured from the blurred image, only where it is brighter than the threshold, screened over a softened image; Wax Blur (inujima, SSS-like light diffusion) = saturated blurred scatter bleeding into darker areas with highlight detail kept; Ambient Dust Overlay (Bischoff) = three sizes of random soft dust specks added only in highlighted areas', 1);
f = add('Repair');
f('q24_ff_docrepair','Filter Forge Rejuvenate Documents / Stamp Remover',[S('Mode',['Rejuvenate (remove yellowing)','Rejuvenate to B and W','Stamp remover (by hue)']),P('Strength',0,1,1,.01),P('Stamp hue',0,1,0,.01),P('Tolerance',.02,.5,.12,.01)],
  [BH('24.'), BV('24.'),
  `vec3 o=O(uv).rgb;int m=int(u_p0+.5);vec3 pw=vec3(0.);
  for(int j=0;j<12;j++)for(int i=0;i<12;i++)pw=max(pw,T((vec2(float(i),float(j))+.5)/12.).rgb);
  if(m<2){vec3 r=clamp(o/max(pw,vec3(.2)),0.,1.);r=clamp((r-.04)/.96,0.,1.);if(m==1)r=vec3(smoothstep(.05,.95,luma(r)));return vec4(mix(o,r,u_p1),1.);}
  vec3 h=rgb2hsv(o);float dh=abs(h.x-u_p2);dh=min(dh,1.-dh);float mk=(1.-smoothstep(u_p3*.6,u_p3,dh))*smoothstep(.15,.35,h.y);
  float mx=max(o.r,max(o.g,o.b));vec3 fl=pw*mx/max(max(pw.r,max(pw.g,pw.b)),.01);return vec4(mix(o,fl,mk*u_p1),1.);`],
  'Filter Forge photo filters, approx. (FF pages give only the controls): Rejuvenate Newspapers & Documents (AlienConception) = paper white estimated as the max of a 12x12 grid of the heavily blurred page, the yellow tint removed by white-balancing to it, optional B&W finish; Stamp Remoover (Mironov) = pixels selected by hue / saturation range are replaced by the paper colour at the pixel max-channel value, so coloured stamp ink vanishes while dark text under it stays');
f = add('Tone');
f('q24_gegl_rgbclip','RGB Clip (GEGL)',[S('Clip low',['On','Off']),P('Low limit',-.5,1,0,.01),S('Clip high',['On','Off']),P('High limit',0,2,1,.01)],
  `vec3 l=${LIN('c.rgb')};if(u_p0<.5)l=max(l,vec3(u_p1));if(u_p2<.5)l=min(l,vec3(u_p3));return vec4(${SRGB('l')},1.);`,
  'gegl:rgb-clip: clamps linear-light RGB to [low limit, high limit] (clip_low / clip_high flags, defaults 0 and 1)');
f = add('Blur');
f('q24_gegl_waveletblur','Wavelet Blur (GEGL)',[P('Radius',0,64,4,.5,'px')],
  [`float r=R(u_p0);vec2 o=vec2(r*u_px.x,0.);return .25*T(uv-o)+.5*T(uv)+.25*T(uv+o);`,
   `float r=R(u_p0);vec2 o=vec2(0.,r*u_px.y);return .25*T(uv-o)+.5*T(uv)+.25*T(uv+o);`],
  'gegl:wavelet-blur: separable HAT (1/4, 1/2, 1/4) kernel with taps spaced by radius (linear interpolation for fractional radii), horizontal then vertical, as used by GEGL wavelet decompose (upstream default radius 1)');
f = add('Film');
f('q24_gegl_negdarkroom','Negative Darkroom (GEGL)',[S('Paper',['Color RA-4 paper (Endura-like)','B and W paper grade 2','B and W paper grade 4']),P('Exposure',-4,4,0,.05,'EV'),P('Contrast',.5,2,1,.01),P('Density boost',.5,3,1,.01)],
  `vec3 li=${LIN('c.rgb')};int m=int(u_p0+.5);
  vec3 X=mat3(.4124,.2126,.0193,.3576,.7152,.1192,.1805,.0722,.9505)*li;
  vec3 pp=vec3(.41847*X.x-.15866*X.y-.082835*X.z,-.091169*X.x+.25243*X.y+.015708*X.z,.0009209*X.x-.0025498*X.y+.1786*X.z);
  pp*=.25*exp2(u_p1);vec3 e=log(max(pp,vec3(1e-5))*5000.)/log(10.);if(m>0)e=vec3(e.g);
  float k=m==0?3.5:m==1?3.:5.5;float dmx=m==0?2.4:2.1;float dmn=.08;float e0=1.65;
  e=(e-e0)*u_p2+e0;vec3 D=dmn+(dmx-dmn)/(1.+exp(-k*(e-e0)));D*=u_p3;D-=dmn*u_p3;
  vec3 o=pow(vec3(10.),-max(D,vec3(0.)));return vec4(${SRGB('o')},1.);`,
  'gegl:negative-darkroom, approx.: scan (as transmittance) -> CIE XYZ -> the op matrix to CIE RGB primaries, C/M/Y filters 60 (x 2^-2) and 2^exposure, log10(x 5000), contrast about the mid density, paper H&D curve, density boost, base + fog clipped, print transmittance 10^-D; the measured paper curves (Kodak Endura, Ilford, Foma) and the sensitivity / dye-density matrices are replaced by logistic curves (Dmax 2.4 colour, 2.1 B&W; slope by grade) and identity matrices');
f('q24_kornia_blurpool','Blur Pool / Max Blur Pool / Edge-Aware Blur Pool (kornia)',[S('Operation',['Max blur pool','Edge-aware blur pool','Blur pool']),P('Kernel size',3,9,3,2),P('Stride',1,4,2,1),P('Edge threshold',1.05,3,1.25,.01)],
  `int m=int(u_p0+.5);int k=int(u_p1+.5);float ps=max(1.,u_k);vec2 P=uv*u_res/ps;int s=m==1?1:int(u_p2+.5);
  vec2 base=floor(P/float(s))*float(s);int hk=(k-1)/2;float wv[9];float cb=1.;
  for(int i=0;i<9;i++){wv[i]=0.;if(i<k){wv[i]=cb;cb=cb*float(k-1-i)/float(i+1);}}
  float ws=exp2(float(k-1));vec3 acc=vec3(0.);vec2 e=vec2(ps)/u_res;
  for(int j=0;j<9;j++){if(j>=k)break;for(int i=0;i<9;i++){if(i>=k)break;vec2 qq=(base+vec2(float(i-hk),float(j-hk))+.5)*ps/u_res;vec3 v=O(qq).rgb;
   if(m==0)v=max(max(v,O(qq+vec2(e.x,0.)).rgb),max(O(qq+vec2(0.,e.y)).rgb,O(qq+e).rgb));acc+=v*wv[i]*wv[j];}}
  acc/=ws*ws;if(m!=1)return vec4(acc,1.);
  float lt=log2(u_p3);float mk=0.;vec2 ctr=(floor(P)+.5)*ps/u_res;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=ctr+vec2(float(i),float(j))*e;
   vec3 ax=log2(O(q+vec2(2.*e.x,0.)).rgb+1e-6)-log2(O(q-vec2(2.*e.x,0.)).rgb+1e-6);vec3 ay=log2(O(q+vec2(0.,2.*e.y)).rgb+1e-6)-log2(O(q-vec2(0.,2.*e.y)).rgb+1e-6);
   float ex=(ax.r+ax.g+ax.b)/3.,ey=(ay.r+ay.g+ay.b)/3.;if(abs(ex)>lt||abs(ey)>lt)mk=1.;}
  return vec4(mix(acc,O(uv).rgb,mk),1.);`,
  'kornia.filters: max_blur_pool2d (max_pool 2x2 stride 1, then normalised Pascal (binomial) kernel conv with stride, shown upsampled as blocks); blur_pool2d (Pascal kernel + stride); edge_aware_blur_pool2d (stride 1 Pascal blur except where the channel-mean log2 difference over +-2 px exceeds log2(edge_threshold) in x or y, mask dilated 3x3, original kept there)');
f = add('Color');
f('q24_kornia_zca','ZCA Whitening (kornia)',[P('Gain',.05,.5,.18,.01),P('Epsilon',0,.01,.0001,.0001)],
  `vec3 sm=vec3(0.);mat3 s2=mat3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 v=O((vec2(float(i),float(j))+.5)/16.).rgb;sm+=v;s2+=outerProduct(v,v);}
  vec3 mu=sm/256.;mat3 C=(s2-256.*outerProduct(mu,mu))/255.+mat3(u_p1+1e-6);
  float nf=sqrt(dot(C[0],C[0])+dot(C[1],C[1])+dot(C[2],C[2]));mat3 Y=C/nf;mat3 Z=mat3(1.);
  for(int i=0;i<40;i++){mat3 Tm=.5*(mat3(3.)-Z*Y);Y=Y*Tm;Z=Tm*Z;}
  vec3 w=(Z/sqrt(nf))*(c.rgb-mu);return vec4(clamp(.5+w*u_p0,0.,1.),1.);`,
  'kornia.enhance.zca_whiten applied to the pixels RGB vectors as samples: mean and unbiased covariance from a 16x16 grid, W = C^-1/2 (U diag(1/sqrt(S + eps)) U^T, computed by coupled Newton-Schulz iteration), out = 0.5 + gain * W (x - mean)');
