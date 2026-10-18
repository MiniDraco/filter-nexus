/* ================= q17c: GenArts Monsters GT effects (look approximations from the effect names / descriptions) ================= */
f = add('Retro');
f('q17_cctv','CCTV Camera (GenArts M_CCTV)',[S('Tint',['Grey','Green','Washed colour']),P('Noise',0,1,.4,.01),P('Distortion',0,1,.4,.01),P('Resolution',80,720,240,1,'lines')],
  `vec2 q=uv-.5;float r2=dot(q*vec2(asp(),1.),q*vec2(asp(),1.));vec2 d=.5+q*(1.+u_p2*.25*r2);
 float ln=u_p3;float row=floor(d.y*ln);float jit=(hash(vec2(row,floor(u_seed*97.)))-.5)*u_p1*.006;
 vec2 s=vec2(d.x+jit,(row+.5)/ln);float hx=1.6/ln;vec3 col=.25*O(s-vec2(hx,0.)).rgb+.5*O(s).rgb+.25*O(s+vec2(hx,0.)).rgb;
 float y=luma(col);int tm=int(u_p0+.5);
 vec3 o=tm==0?vec3(y):tm==1?vec3(.55,1.,.6)*y:mix(vec3(y),col,.45)*vec3(.95,1.02,1.05);
 o=clamp((o-.08)*1.35,0.,1.);
 float bar=fract(u_seed*.37+uv.y*.6);o*=.9+.12*smoothstep(.85,1.,bar);
 o*=.82+.18*step(.5,fract(PX(uv).y*.5));
 o+=(hash(PX(uv)+u_seed*13.)-.5)*.35*u_p1;
 o*=1.-.55*smoothstep(.25,.75,r2*1.3);
 if(d.x<0.||d.x>1.||d.y<0.||d.y>1.)o=vec3(0.);
 return vec4(clamp(o,0.,1.),1.);`,
  'look approximation of a security-camera feed: barrel lens, low vertical resolution with soft horizontal bandwidth, per-line sync jitter, monochrome / green-phosphor / washed colour, crushed contrast, interlace lines, slow rolling brightness bar, snow noise, heavy vignette (no timestamp text)', 1);

f = add('Film');
f('q17_edgeleak','Edge Leak (GenArts M_EdgeLeak)',[P('Size',.02,.6,.2,.01),P('Intensity',0,2,1,.01),P('Irregularity',0,1,.5,.01),S('Blend',['Screen','Add'])],
  `vec3 acc=vec3(0.);vec2 pp=PX(uv);
 for(int k=0;k<4;k++){float dd=k==0?uv.x:k==1?1.-uv.x:k==2?uv.y:1.-uv.y;float t=k<2?uv.y:uv.x;
  vec3 e=vec3(0.);for(int i=-2;i<=2;i++){float tt=clamp(t+float(i)*.03,0.,1.);vec2 b=k==0?vec2(.003,tt):k==1?vec2(.997,tt):k==2?vec2(tt,.003):vec2(tt,.997);vec3 v=O(b).rgb;e+=v*v*1.4;}
  e/=5.;float n=fbm(vec2(t*6.,float(k)*3.1)+u_seed);float sz=u_p0*(1.-u_p2*.8+u_p2*1.6*n);float w=exp(-dd/max(sz,.005)*2.);
  acc+=e*w;}
 acc*=u_p1*2.5;vec3 o=u_p3<.5?1.-(1.-c.rgb)*(1.-clamp(acc,0.,1.)):c.rgb+acc;return vec4(clamp(o,0.,1.),1.);`,
  'look approximation: light leaking in from the four frame edges, coloured by the (brightness-weighted) pixels along each edge, exponential falloff with noise-varying reach', 1);

f = add('Distort');
f('q17_water3d','Pool3D / Puddle3D (GenArts Monsters)',[S('Type',['Pool3D (through water)','Puddle3D (reflection)']),P('Wave scale',10,200,60,1,'px'),P('Wave height',0,1,.5,.01),P('Caustics or horizon',0,1,.5,.01)],
  `vec2 P0=PX(uv);float sc=u_p1;int m=int(u_p0+.5);
 if(m==0){vec2 p=P0/sc;float e=.2;
  vec3 hh;for(int k=0;k<3;k++){vec2 o=k==0?vec2(0.):k==1?vec2(e,0.):vec2(0.,e);vec2 z=p+o;
   float h=.5*sin(dot(z,vec2(1.,.35))*2.+u_seed)+.35*sin(dot(z,vec2(-.6,1.))*2.7+u_seed*1.7)+.6*fbm(z*1.3+u_seed);hh[k]=h;}
  vec2 g=vec2(hh.y-hh.x,hh.z-hh.x)/e;vec2 s=uv+g*u_p2*2.5*u_px*u_k;
  float lap=0.;{vec2 z=p;float h0=hh.x;vec2 z1=p-vec2(e,0.),z2=p-vec2(0.,e);
   float a1=.5*sin(dot(z1,vec2(1.,.35))*2.+u_seed)+.35*sin(dot(z1,vec2(-.6,1.))*2.7+u_seed*1.7)+.6*fbm(z1*1.3+u_seed);
   float a2=.5*sin(dot(z2,vec2(1.,.35))*2.+u_seed)+.35*sin(dot(z2,vec2(-.6,1.))*2.7+u_seed*1.7)+.6*fbm(z2*1.3+u_seed);
   lap=(hh.y+a1+hh.z+a2-4.*h0)/(e*e);}
  vec3 col=O(clamp(s,0.,1.)).rgb*vec3(.9,1.,1.03);float jac=1.+.35*(.3+u_p2)*lap;col+=vec3(.9,1.,1.)*u_p3*.12*clamp(1./max(abs(jac),.15)-1.,0.,3.);
  return vec4(clamp(col,0.,1.),1.);}
 float hz=mix(.25,.75,u_p3);if(uv.y<hz)return c;
 float dz=max(uv.y-hz,.002);vec2 gp=vec2((uv.x-.5)/dz,1./dz)*sc*.004;
 float mask=smoothstep(.55,.6,fbm(gp*.6+u_seed));
 float rp=0.;for(int k=0;k<5;k++){vec2 ctr=vec2(hash(vec2(float(k),u_seed))-.5,0.)*2.+vec2(0.,hash(vec2(u_seed,float(k)+.5)));vec2 cp=vec2((ctr.x)/max(.05,ctr.y*.5+.1),2./(ctr.y*.5+.1))*sc*.004;
  float dd=length(gp-cp);rp+=sin(dd*25.-float(k)*1.7)*exp(-dd*1.5);}
 float ry=2.*hz-uv.y+rp*u_p2*.012;float rx=uv.x+rp*u_p2*.006;
 vec3 rf=ry>0.?O(vec2(rx,ry)).rgb:O(vec2(rx,0.)).rgb;rf=rf*.75+.05;
 return vec4(mix(c.rgb*.92,rf,mask),1.);`,
  'look approximations: Pool3D = image seen through a moving water surface (directional swell + fbm height field; refraction offset = surface gradient, caustics = inverse area ratio 1/|1 + d * laplacian| of the refracted light (bright lines where rays focus), slight cyan); Puddle3D = puddles (noise patches on a perspective ground plane below the horizon) reflecting the image above the horizon, disturbed by concentric ripple rings', 1);

f = add('Render');
f('q17_cliptex','ClipTex / PatchTex (GenArts Monsters)',[S('Type',['ClipTex','PatchTex']),P('Scale',4,200,40,1,'px'),P('Amount',0,1,1,.01),P('Detail',0,1,.5,.01)],
  `vec2 P0=PX(uv)/u_p1;int m=int(u_p0+.5);
 if(m==0){float n=fbm(P0*.5+u_seed);float lv=2.+floor(u_p3*8.);float b=floor(n*lv*1.6)/lv;float edge=fract(n*lv*1.6);
  vec3 col=hsv2rgb(vec3(fract(b*.37+.1+u_seed*.13),.55,.35+.65*fract(b*1.7)));col*=.85+.15*smoothstep(0.,.15,edge);
  return vec4(mix(c.rgb,col*(.4+.9*luma(c.rgb)),u_p2),1.);}
 vec2 cell=floor(P0);vec2 lc=fract(P0);vec2 id=cell;vec2 lq=lc;
 if(hash(cell+3.1+u_seed)<u_p3){vec2 sb=step(vec2(.5),lc);id=cell*2.+sb+1000.;lq=fract(lc*2.);}
 vec2 off=(vec2(hash(id+1.3+u_seed),hash(id+7.9+u_seed))-.5)*.6;vec3 col=O(clamp(uv+off,0.,1.)).rgb;
 float seam=smoothstep(0.,.06,min(min(lq.x,lq.y),min(1.-lq.x,1.-lq.y)));col*=.7+.3*seam;
 return vec4(mix(c.rgb,col,u_p2),1.);`,
  'look approximations: ClipTex = fbm noise hard-clipped into flat bands (texture layers with sharp clip edges) tinted and modulated by the image; PatchTex = patchwork of square patches (randomly subdivided) each filled with the image content from a random offset, with darkened seams', 1);

f('q17_cumulo','Cumulus Clouds (GenArts M_Cumulo)',[P('Coverage',0,1,.5,.01),P('Scale',30,600,180,1,'px'),P('Sun angle',-180,180,-60,1,'deg'),P('Opacity',0,1,1,.01)],
  `vec2 P0=PX(uv)/u_p1;float an=radians(u_p2);vec2 sd=vec2(cos(an),sin(an));
 float th=mix(.78,.3,u_p0);
 #define Q17D(zz) (smoothstep(th-.08,th+.18,fbm(vec2((zz).x,(zz).y*1.6)+.6*vec2(fbm((zz)*.7+u_seed),fbm((zz)*.7+4.3+u_seed))+u_seed)))
 float dn=Q17D(P0);if(dn<.002)return c;
 float acc=0.;for(int i=1;i<=6;i++){acc+=Q17D(P0+sd*float(i)*.07);}
 float sh=exp(-acc*.3);float edge=1.-smoothstep(.0,.35,dn);
 vec3 cl=mix(vec3(.6,.65,.74),vec3(1.,.98,.95),sh)+vec3(1.,.95,.85)*edge*sh*.35;
 return vec4(mix(c.rgb,clamp(cl,0.,1.),dn*u_p3),1.);`,
  'look approximation of rendered cumulus: domain-warped fbm density with coverage threshold, self-shadowing by a 6-step march toward the sun (Beer-Lambert), grey-blue shadowed bases and bright silver-lined edges, composited over the image by density', 1);
