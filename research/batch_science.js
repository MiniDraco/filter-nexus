/* ================= Science imaging: microscopy, astronomy, remote sensing, documents ================= */
// separable square min/max (erosion when `erode` is true); radius param `r` in working px, <=65 taps
const MM1 = (dir, r, erode) => `vec3 m=T(uv).rgb;float r=R(${r});float st=max(1.,r/32.);for(int i=-32;i<=32;i++){float o=float(i)*st;if(abs(o)>r)continue;vec3 v=T(uv+${dir}*o*u_px).rgb;m=(${erode})?min(m,v):max(m,v);}return vec4(m,1.);`;
const MMX = 'vec2(1.,0.)', MMY = 'vec2(0.,1.)';
f = add('Repair');
f('rollingball','Subtract Background (Rolling Ball)',[P('Radius',4,120,40,1,'px'),S('Background',['Dark','Light']),S('Output',['Subtracted','Background only']),P('Offset',0,.5,0,.01)],
  [MM1(MMX,'u_p0','u_p1<.5'),MM1(MMY,'u_p0','u_p1<.5'),MM1(MMX,'u_p0','u_p1>.5'),MM1(MMY,'u_p0','u_p1>.5'),BH('u_p0*.25'),BV('u_p0*.25'),
   `vec3 bg=T(uv).rgb,o=O(uv).rgb;if(u_p2>.5)return vec4(bg,1.);return vec4(clamp(u_p1<.5?o-bg+u_p3:1.-(bg-o)-u_p3,0.,1.),1.);`],'ImageJ Subtract Background; square-element opening approx.');
f('whiteboard','Document / Whiteboard Clean',[P('Background radius',4,80,20,1,'px'),P('Ink darkness',0,.7,.25,.01),P('Color',0,2,1.3,.01)],
  [MM1(MMX,'u_p0','false'),MM1(MMY,'u_p0','false'),BH('u_p0*.5'),BV('u_p0*.5'),
   `vec3 bg=max(T(uv).rgb,vec3(.03));vec3 n=clamp(O(uv).rgb/bg,0.,1.);n=clamp((n-u_p1)/(1.-u_p1),0.,1.);return vec4(clamp(mix(vec3(luma(n)),n,u_p2),0.,1.),1.);`],'divide by paper background, then levels');
f = add('Tone');
f('flatfield','Flat-Field / Shading Correction',[P('Radius',8,200,60,1,'px'),S('Method',['Divide (flat-field)','Subtract','Homomorphic']),P('Target level',.2,1,.65,.01),P('Detail gain',1,3,1.6,.01)],
  [BH('u_p0'),BV('u_p0'),
   `vec3 o=O(uv).rgb,bg=max(T(uv).rgb,vec3(.004));int m=int(u_p1+.5);vec3 r;if(m==0)r=o/vec3(max(luma(bg),.004))*u_p2;else if(m==1)r=o-bg+u_p2;else{vec3 lb=log(bg);r=exp(u_p3*(log(max(o,vec3(.004)))-lb)+.5*lb+.5*log(u_p2));}
   return vec4(clamp(r,0.,1.),1.);`],'pseudo flat-field (ImageJ), homomorphic filtering');
f('astrostretch','Astro Stretch (Arcsinh / MTF)',[S('Curve',['Arcsinh (Lupton)','Midtones transfer (STF)','Log']),P('Stretch',0,1,.6,.01),P('Black point',0,.3,.02,.001),S('Color',['Preserve hue','Per channel'])],
  `float bp=u_p2;int m=int(u_p0+.5);vec3 x=clamp((c.rgb-bp)/(1.-bp),0.,1.);float beta=exp(u_p1*7.);float mt=mix(.5,.002,u_p1);
  vec3 v=u_p3>.5?x:vec3(max(x.r,max(x.g,x.b)));vec3 y;if(m==0)y=asinh(v*beta)/asinh(beta);else if(m==1)y=(mt-1.)*v/((2.*mt-1.)*v-mt);else y=log(1.+v*beta)/log(1.+beta);
  if(u_p3>.5)return vec4(clamp(y,0.,1.),1.);return vec4(clamp(x*y/max(v,vec3(1e-5)),0.,1.),1.);`,'Lupton 2004, PixInsight STF');
f = add('Color');
f('scnr','SCNR (Green Noise Removal)',[S('Method',['Average neutral','Maximum neutral','Maximum mask','Additive mask']),P('Amount',0,1,1,.01),S('Target',['Green','Magenta'])],
  `vec3 p=u_p2>.5?vec3(1.)-c.rgb:c.rgb;int m=int(u_p0+.5);float g=p.g;float gn;if(m==0)gn=min(g,(p.r+p.b)*.5);else if(m==1)gn=min(g,max(p.r,p.b));else{float mk=m==2?max(p.r,p.b):min(1.,p.r+p.b);gn=g*(1.-u_p1)*(1.-mk)+mk*g;gn=min(gn,g);}
  if(m<2)gn=mix(g,gn,u_p1);p.g=gn;return vec4(u_p2>.5?vec3(1.)-p:p,1.);`,'PixInsight Subtractive Chromatic Noise Reduction');
f = add('Analysis');
f('vegindex','RGB Vegetation Index',[S('Index',['VARI','ExG (excess green)','ExGR','GLI','NGRDI','MGRVI','TGI (simplified)','CIVE']),S('Output',['Red→green ramp','Viridis','Gray','Mask over image']),P('Gain',.2,5,1.5,.01),P('Mask threshold',-1,1,.1,.01)],
  `vec3 q=c.rgb+1e-4;float R_=q.r,G_=q.g,B_=q.b;float sm=R_+G_+B_;float r=R_/sm,g=G_/sm,b=B_/sm;int m=int(u_p0+.5);float v;
  if(m==0)v=(G_-R_)/(abs(G_+R_-B_)<.02?.02:G_+R_-B_);else if(m==1)v=2.*g-r-b;else if(m==2)v=(2.*g-r-b)-(1.4*r-g);else if(m==3)v=(2.*G_-R_-B_)/(2.*G_+R_+B_);else if(m==4)v=(G_-R_)/(G_+R_);else if(m==5)v=(G_*G_-R_*R_)/(G_*G_+R_*R_);else if(m==6)v=(G_-.39*R_-.61*B_)*2.;else v=-(.441*R_-.811*G_+.385*B_+18.78745/255.)*4.;
  v=clamp(v,-1.,1.);float t=clamp(.5+v*u_p2*.5,0.,1.);int o=int(u_p1+.5);if(o==0)return vec4(stops5(vec3(.65,0.,.15),vec3(.96,.43,.26),vec3(1.,1.,.75),vec3(.4,.74,.39),vec3(0.,.41,.22),t),1.);if(o==1)return vec4(ramp(2,t),1.);if(o==2)return vec4(vec3(t),1.);
  return vec4(v>u_p3?mix(c.rgb,vec3(.1,.95,.2),.55):c.rgb*.45,1.);`,'Gitelson VARI, Woebbecke ExG, Louhaichi GLI, Hunt TGI, Kataoka CIVE');
f('stainsep','Color Deconvolution (Stain Separation)',[S('Stains',['H&E','H&E 2','H DAB','FastRed FastBlue DAB','Methyl Green DAB']),S('Channel',['Stain 1','Stain 2','Stain 3 / residual']),S('Display',['Stain color','Gray (transmittance)','Amount map']),P('Gain',.2,4,1,.01)],
  `int s=int(u_p0+.5);vec3 a,b,d;if(s==0){a=vec3(.644211,.716556,.266844);b=vec3(.092789,.954111,.283111);}else if(s==1){a=vec3(.490157,.768971,.410402);b=vec3(.046153,.842068,.537393);}else if(s==2){a=vec3(.65,.704,.286);b=vec3(.268,.57,.776);}else if(s==3){a=vec3(.213939,.851127,.47794);b=vec3(.748903,.606242,.267311);}else{a=vec3(.98003,.144316,.133146);b=vec3(.268,.57,.776);}
  a=normalize(a);b=normalize(b);d=s==3?normalize(vec3(.268,.57,.776)):normalize(cross(a,b));if(s!=3&&d.x<0.)d=-d;
  vec3 od=-log(max(c.rgb,vec3(1./255.)))/log(10.);vec3 k=inverse(mat3(a,b,d))*od;int ch=int(u_p1+.5);float cc=max(ch==0?k.x:ch==1?k.y:k.z,0.)*u_p3;vec3 st=ch==0?a:ch==1?b:d;int dm=int(u_p2+.5);
  if(dm==0)return vec4(pow(vec3(10.),-st*cc),1.);if(dm==1)return vec4(vec3(pow(10.,-cc)),1.);return vec4(ramp(1,clamp(cc/1.5,0.,1.)),1.);`,'Ruifrok & Johnston 2001 (Fiji Colour Deconvolution)');
f('starmask','Star Mask / Star Reduction',[P('Star size',1,20,4,.5,'px'),P('Threshold',0,.5,.06,.005),S('Output',['Star mask','Star reduction','Starless (approx.)']),P('Amount',0,1,.7,.01)],
  [MM1(MMX,'u_p0','true'),MM1(MMY,'u_p0','true'),MM1(MMX,'u_p0','false'),MM1(MMY,'u_p0','false'),
   `vec3 o=O(uv).rgb,op=T(uv).rgb;float th=luma(o)-luma(op);float mk=smoothstep(u_p1,u_p1+.04,th);int m=int(u_p2+.5);if(m==0)return vec4(vec3(mk),1.);if(m==1)return vec4(mix(o,op+(o-op)*(1.-u_p3),mk),1.);return vec4(mix(o,op,max(mk,smoothstep(u_p1*.5,u_p1,th))),1.);`],'white top-hat on luminance');
f('larsonsekanina','Larson-Sekanina (Rotational Gradient)',[P('Angle',1,40,10,.5,'°'),P('Radial shift',0,10,0,.1,'px'),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01)],
  `vec2 p=PX(uv),cp=PX(vec2(u_p2,1.-u_p3));vec2 dv=p-cp;float r=length(dv),th=atan(dv.y,dv.x),da=radians(u_p0),rs=max(r-R(u_p1),0.);
  float a1=L(fromPX(cp+rs*vec2(cos(th+da),sin(th+da)))),a2=L(fromPX(cp+rs*vec2(cos(th-da),sin(th-da))));return vec4(vec3(clamp(.5+(2.*luma(c.rgb)-a1-a2)*2.,0.,1.)),1.);`,'comet / jet structure enhancement');
