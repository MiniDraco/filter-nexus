/* ================= Round 9C: film stocks, alternative processes, printmaking, paint media ================= */
f = add('Film');
f('altprocess','Alternative Photographic Process',[S('Process',['Van Dyke brown','Platinum / palladium','Salt print','Gum bichromate','Daguerreotype','Tintype (wet plate)','Lith print','Selenium toning','Split sepia toning']),P('Exposure',-1,1,0,.01),P('Contrast',.5,2,1,.01),P('Paper texture',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec3 c0=c.rgb;float l=m==5?c0.b*.7+c0.g*.3:luma(c0);l=clamp((l-.5)*u_p2+.5+u_p1*.4,0.,1.);vec2 p=PX(uv);float tx=(fbm(p*.04)-.5)*.6+(hash(p)-.5)*.4;float vg=length((uv-.5)*vec2(asp(),1.));
  vec3 s,md,h;if(m==0){s=vec3(.16,.08,.04);md=vec3(.52,.33,.19);h=vec3(.93,.88,.78);}else if(m==1){l=pow(l,.9);s=vec3(.11,.1,.09);md=vec3(.5,.46,.41);h=vec3(.95,.93,.88);}
  else if(m==2){l=.12+.76*l;s=vec3(.28,.15,.13);md=vec3(.6,.47,.42);h=vec3(.92,.86,.8);}else if(m==3){s=vec3(.32,.14,.08);md=vec3(.66,.42,.3);h=vec3(.94,.9,.82);l=clamp(l+tx*.25,0.,1.);}
  else if(m==4){l=smoothstep(.05,.95,l);s=vec3(.1,.12,.16);md=vec3(.48,.5,.52);h=vec3(.86,.87,.84);}else if(m==5){s=vec3(.07,.06,.05);md=vec3(.4,.36,.3);h=vec3(.8,.76,.66);}
  else if(m==6){l=l<.45?pow(l/.45,2.4)*.45:l;s=vec3(.09,.06,.05);md=vec3(.62,.45,.36);h=vec3(.96,.86,.76);}else if(m==7){s=vec3(.19,.11,.14);md=vec3(.5,.47,.47);h=vec3(.95,.94,.93);}else{s=vec3(.12,.12,.13);md=vec3(.55,.47,.38);h=vec3(.93,.82,.64);}
  vec3 o=l<.5?mix(s,md,l*2.):mix(md,h,(l-.5)*2.);o*=1.+tx*u_p3*.25;
  if(m==4)o=mix(o,o*vec3(.75,.7,.85),smoothstep(.45,.75,vg));if(m==5){o*=1.-smoothstep(.35,.8,vg+(fbm(p*.02)-.5)*.2)*.75;}
  return vec4(clamp(o,0.,1.),1.);`,'historic print processes (look approximations)');
f('filmstock','Film Stock Emulation',[S('Stock',['Ektachrome E100','Portra 400','Ektar 100','Provia 100F','Instax','Technicolor 3-strip','Hand-tinted B&W','Tri-X 400','Ilford HP5','Delta 3200']),P('Grain',0,1,.3,.01),P('Grain size',.5,3,1,.05,'px'),P('Exposure',-1,1,0,.01)],
  `int m=int(u_p0+.5);vec3 x=clamp(c.rgb*exp2(u_p3),0.,1.);float l=luma(x);vec3 o;float gs=u_p2,ga=u_p1;
  if(m==0){x=(x-.5)*1.15+.5;x*=vec3(.97,1.,1.05);x+=vec3(0.,.01,.02)*(1.-l);l=luma(x);o=mix(vec3(l),x,1.15);}
  else if(m==1){x=(x-.5)*.9+.5+.03;x*=vec3(1.04,1.,.94);x=1.-pow(1.-clamp(x,0.,1.),vec3(1.1));l=luma(x);o=mix(vec3(l),x,.9);}
  else if(m==2){x=(x-.5)*1.1+.5;x.r*=1.03;l=luma(x);o=mix(vec3(l),x,1.35);}
  else if(m==3){x=(x-.5)*1.08+.5;x+=vec3(-.01,.01,.01)*(1.-l);l=luma(x);o=mix(vec3(l),x,1.12);}
  else if(m==4){x=(x-.5)*.85+.5+.08;x+=vec3(-.02,.02,.03)*(1.-l)+vec3(.03,.01,-.03)*l;l=luma(x);o=mix(vec3(l),x,.9);}
  else if(m==5){vec3 d=vec3(x.r-(x.g+x.b)*.5,x.g-(x.r+x.b)*.5,x.b-(x.r+x.g)*.5);x=clamp(x+d*.45,0.,1.);l=luma(x);o=mix(vec3(l),x,1.2);}
  else if(m==6){vec3 hv=rgb2hsv(x);hv.y*=.35;hv.z=l;vec3 t=hsv2rgb(hv);o=mix(vec3(l),t,.7+(fbm(PX(uv)*.01)-.5)*.3);}
  else{vec3 w=m==7?vec3(.3,.55,.15):m==8?vec3(.32,.5,.18):vec3(.3,.5,.2);float k=m==7?1.2:m==8?1.05:1.1;l=clamp((dot(x,w)-.5)*k+.5,0.,1.);o=vec3(l);if(m==9){gs*=2.2;ga*=1.8;}}
  float gn=(vnoise(PX(uv)/max(R(gs),.3))-.5)*.7+(hash(floor(PX(uv)/max(R(gs),.3)))-.5)*.3;o+=gn*ga*.35*(.25+3.*l*(1.-l));return vec4(clamp(o,0.,1.),1.);`,'look approximations, not measured LUTs');
f('halation','Film Halation',[P('Threshold',.5,1,.8,.01),P('Radius',4,80,25,1,'px'),P('Amount',0,2,.8,.01),S('Tint',['Red-orange (CineStill)','Warm','Magenta'])],
  [`float l=luma(c.rgb);return vec4(vec3(max(l-u_p0,0.)/(1.-u_p0+1e-3)),1.);`,BH('u_p1'),BV('u_p1'),
   `vec3 o=O(uv).rgb;float hl=T(uv).r;int t=int(u_p3+.5);vec3 tint=t==0?vec3(1.,.25,.05):t==1?vec3(1.,.6,.3):vec3(1.,.2,.6);return vec4(clamp(o+hl*tint*u_p2,0.,1.),1.);`],'red glow around highlights (no anti-halation layer)');
f('filmburn','Film Burn',[S('Edge',['Left','Right','Top','Bottom','Corner']),P('Size',.05,1,.35,.01),P('Heat',0,1,.7,.01)],
  `int e=int(u_p0+.5);vec2 q=uv;float d=e==0?q.x:e==1?1.-q.x:e==2?1.-q.y:e==3?q.y:length(q-vec2(1.,1.))*.8;vec2 p=PX(uv);d+=(fbm(p*.006+u_seed)-.5)*.35;float mk=smoothstep(u_p1,0.,d);
  vec3 bc=mix(vec3(.8,.1,.02),mix(vec3(1.,.5,.05),vec3(1.,.97,.85),smoothstep(.6,1.,mk)),smoothstep(.2,.7,mk));vec3 o=1.-(1.-c.rgb)*(1.-bc*mk*u_p2*1.3);return vec4(clamp(o,0.,1.),1.);`,'light-struck film edge',1);
f('autochrome','Autochrome (Starch Grain Screen)',[P('Grain size',.5,4,2,.05,'px'),P('Black interstices',0,1,.3,.01),P('Exposure',-1,1,.1,.01)],
  `float gsz=max(R(u_p0),.5);vec2 gp=PX(uv)/gsz;vec3 acc=vec3(0.);float w=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cell=floor(gp)+vec2(float(i),float(j));vec2 ctr=cell+.5+(vec2(hash(cell),hash(cell+7.3))-.5)*.6;float d=length(gp-ctr);float k=exp(-d*d*1.1);
   float ty=hash(cell+19.1);vec3 gc=ty<.33?vec3(.9,.35,.15):ty<.66?vec3(.25,.65,.25):vec3(.35,.3,.85);vec3 sc=T(fromPX(ctr*gsz)).rgb*exp2(u_p2);acc+=k*gc*dot(sc,gc)/dot(gc,gc)*1.6;w+=k;}
  vec3 o=mix(acc/max(w,1e-4),c.rgb*exp2(u_p2),.3);o*=mix(1.,smoothstep(.15,.6,w),u_p1);return vec4(clamp(o,0.,1.),1.);`,'Lumière 1907: dyed potato-starch grains','');
f = add('Paint');
f('risograph','Risograph Print',[S('Inks',['Fluorescent pink + blue','Black + red','Teal + yellow','Green + orange']),P('Misregistration',0,10,2.5,.1,'px'),P('Grain',0,1,.5,.01),P('Ink density',.3,1.5,1,.01)],
  `int m=int(u_p0+.5);vec3 ia=m==0?vec3(1.,.28,.6):m==1?vec3(.12,.12,.13):m==2?vec3(0.,.5,.55):vec3(0.,.6,.35);vec3 ib=m==0?vec3(0.,.47,.75):m==1?vec3(.9,.2,.2):m==2?vec3(1.,.88,0.):vec3(1.,.45,.1);
  vec2 o1=vec2(R(u_p1),R(u_p1)*.4)*u_px,o2=-o1;float d1=1.-dot(T(uv+o1).rgb,vec3(.1,.5,.4)),d2=1.-dot(T(uv+o2).rgb,vec3(.6,.3,.1));vec2 p=PX(uv);
  float n1=hash(floor(p/max(u_k,1.)))*u_p2+(1.-u_p2)*.5,n2=hash(floor(p/max(u_k,1.))+3.7)*u_p2+(1.-u_p2)*.5;float a1=smoothstep(n1-.05,n1+.05,d1*u_p3),a2=smoothstep(n2-.05,n2+.05,d2*u_p3);
  vec3 o=vec3(.97,.95,.9)*mix(vec3(1.),ia,a1*.9)*mix(vec3(1.),ib,a2*.9);return vec4(o,1.);`,'2 spot inks, stochastic screen, misregistered',1);
f('screenprint','Screen Print (Spot Colors)',[P('Levels per ink',2,6,3,1),P('Misregistration',0,10,3,.1,'px'),P('Ink texture',0,1,.4,.01),S('Screen',['Solid','Halftone dots'])],
  `float n=floor(u_p0+.5)-1.;vec3 o=vec3(.96,.94,.9);vec2 p=PX(uv);for(int k=0;k<3;k++){vec2 off=vec2(cos(float(k)*2.1),sin(float(k)*2.1))*R(u_p1)*u_px;float v=1.-T(uv+off)[k];
   if(u_p3>.5){float a=radians(15.+float(k)*30.);vec2 q=mat2(cos(a),sin(a),-sin(a),cos(a))*p/R(6.);float dt=length(fract(q)-.5)*1.414;v=step(dt,sqrt(v));}else v=floor(v*n+.5)/n;
   float tex=1.-u_p2*.5*fbm(p*.08+float(k)*5.);vec3 ink=vec3(1.);ink[k]=1.-v*tex;o*=ink;}return vec4(o,1.);`,'per-channel spot layers (CMY), misregistered');
f('printmaking','Printmaking (Woodcut / Linocut / Intaglio)',[S('Style',['Woodcut','Linocut','Scratchboard','Drypoint','Aquatint','Lithograph crayon']),P('Line spacing',2,16,5,.5,'px'),P('Threshold',0,1,.5,.01)],
  `int m=int(u_p0+.5);float l=blurL(uv,R(1.));vec2 p=PX(uv);float ang=.785+(blurL(uv,R(14.))-.5)*2.2+(blurL(uv,R(5.))-.5)*.8;vec2 gd=vec2(cos(ang),sin(ang));
  float sp=R(u_p1)*(m==1?2.:1.);float s=dot(p,gd)/sp+(m==1?(fbm(p*.03)-.5)*1.5:0.);float pat=abs(fract(s)-.5)*2.;float th=u_p2;float ink;
  if(m==0||m==1)ink=l<th-.25?1.:l>th+.25?0.:(pat>(l-th+.25)*2.?1.:0.);else if(m==2)ink=pat<l*1.1?0.:1.;else if(m==3)ink=smoothstep(.15,.0,pat-(1.-l)*.5)*smoothstep(th+.3,th-.2,l);
  else if(m==4){float gr=vnoise(p/max(u_k,1.)*.7)*.6+hash(p)*.4;ink=step(gr,(1.-l)*1.05+(th-.5)*.4);}else{float tooth=fbm(p*.35)*.7+hash(p)*.3;ink=step(tooth,(1.-l)*1.1+(th-.5)*.4);}
  vec3 paper=m==2?vec3(.96):vec3(.95,.93,.87);vec3 ic=m==2?vec3(.04):vec3(.08,.07,.06);if(m==2)return vec4(mix(ic,paper,1.-ink),1.);return vec4(mix(paper,ic,ink),1.);`,'gouged / engraved lines follow the image structure');
f('paintmedia','Paint Media (Gouache / Crayon / Impasto / Stipple)',[S('Medium',['Gouache','Crayon','Impasto','Pen & ink stippling']),P('Detail',1,12,4,.5,'px'),P('Texture',0,1,.5,.01)],
  `int m=int(u_p0+.5);vec2 p=PX(uv);vec3 o;
  if(m==0){vec3 b=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)b+=T(uv+vec2(float(i),float(j))*R(u_p1)*.5*u_px).rgb;b/=9.;vec3 q=floor(b*6.+.5)/6.;o=mix(b,q,.6);o=mix(vec3(luma(o)),o,.85)*(1.-u_p2*.15*fbm(p*.05));}
  else if(m==1){float l=luma(c.rgb);float tooth=fbm(p*.4)*.6+vnoise(vec2(p.x+p.y,p.x-p.y)*vec2(.05,.8))*.4;float cov=smoothstep(tooth-.08,tooth+.08,(1.-l)*1.2+.15);vec3 hv=rgb2hsv(c.rgb);hv.y=min(hv.y*1.3,1.);o=mix(vec3(.97,.96,.93),hsv2rgb(hv),cov);}
  else if(m==2){float h0=blurL(uv,R(u_p1)*.3)+(vnoise(p*vec2(.08,.25))-.5)*u_p2*.3;float hx=blurL(uv+vec2(u_px.x*2.,0.),R(u_p1)*.3)-h0,hy=blurL(uv+vec2(0.,u_px.y*2.),R(u_p1)*.3)-h0;vec3 n=normalize(vec3(-hx*12.,-hy*12.,1.));float sh=dot(n,normalize(vec3(-.5,.6,.7)));vec3 b=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)b+=T(uv+vec2(float(i),float(j))*R(u_p1)*.5*u_px).rgb;o=b/9.*(.55+.6*sh);}
  else{float cs=max(R(u_p1),1.);vec2 cell=floor(p/cs);float d=1e9;float dens=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=cell+vec2(float(i),float(j));vec2 pt=(cc+vec2(hash(cc),hash(cc+5.1)))*cs;float dn=pow(1.-luma(T(fromPX(pt)).rgb),1.5);float r=sqrt(dn)*cs*.45;d=min(d,length(p-pt)-r);}o=vec3(smoothstep(-.6,.6,d))*vec3(.97,.96,.92);}
  return vec4(clamp(o,0.,1.),1.);`,'traditional media looks');
