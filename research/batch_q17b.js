/* ================= q17b: Filter Forge library "Creative" filters (look approximations from the filter names / categories; the user-made FF node graphs are not public) ================= */
const Q17_FFNOTE = 'Filter Forge library filter, look approximation from its name and category (the user-made node graph is not public)';
f = add('Stylize');
f('q17_ff_edgetones','Edge And Tones (Filter Forge)',[P('Tone levels',2,8,4,1),P('Edge strength',0,2,1,.01),P('Smoothing',0,6,2,.1,'px'),S('Colour',['Colour tones','Grey tones'])],
  [BH('2.*u_p2'), BV('2.*u_p2'),
  `vec3 b=T(uv).rgb;float y=luma(b);float n=u_p0;float yq=clamp((floor(y*n)+.5)/n,0.,1.);
 vec3 tone=u_p3<.5?clamp(b*(yq/max(y,.02)),0.,1.):vec3(yq);
 vec2 e=u_px*u_k;float gx=luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb);float gy=luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb);
 float ink=smoothstep(.06,.16,length(vec2(gx,gy))*u_p1);return vec4(tone*(1.-ink),1.);`],
  Q17_FFNOTE + ': smoothed image posterized into N luminance tones (hue kept), dark outline from the gradient of the smoothed luma');

f = add('Retro');
f('q17_ff_patdither','Patterned Dithering (Filter Forge)',[P('Cell size',3,32,8,1,'px'),S('Pattern',['Lines','Crosses','Diamonds','Circles','Bricks']),S('Colour',['Black and white','RGB channels','Ink over image colour']),P('Contrast',.5,2,1,.01)],
  `vec2 p=PX(uv)/u_p0;int pt=int(u_p1+.5);vec2 q=fract(p)-.5;float t;
 if(pt==0)t=abs(fract(p.x+p.y)-.5)*2.;
 else if(pt==1){float m=min(abs(q.x),abs(q.y))*2.;t=1.-(1.-m)*(1.-m);}
 else if(pt==2){float s=abs(q.x)+abs(q.y);t=s<=.5?2.*s*s:1.-2.*(1.-s)*(1.-s);}
 else if(pt==3){float r=length(q);t=r<=.5?3.14159265*r*r:min(1.,.785398+.214602*(r-.5)/.2071);}
 else{float row=floor(p.y);vec2 b=vec2(fract(p.x*.5+.5*row)-.5,fract(p.y)-.5);float s=max(abs(b.x),abs(b.y))*2.;t=s*s;}
 vec3 v=clamp((c.rgb-.5)*u_p3+.5,0.,1.);int m=int(u_p2+.5);
 if(m==0)return vec4(vec3(step(t,clamp((luma(c.rgb)-.5)*u_p3+.5,0.,1.))),1.);
 if(m==1)return vec4(step(vec3(t),v),1.);
 float on=step(t,clamp((luma(c.rgb)-.5)*u_p3+.5,0.,1.));return vec4(mix(c.rgb*.3,min(c.rgb*1.35+.1,1.),on),1.);`,
  Q17_FFNOTE + ': ordered dithering with a tiled shape threshold map (tone-correct: each pattern\'s threshold is its own area CDF, so coverage = tone)');

f = add('Stylize');
f('q17_ff_pixelhalftone','Pixel Halftone (Filter Forge)',[P('Cell size',4,40,12,1,'px'),P('Dot resolution',3,16,8,1),S('Dot shape',['Round','Square','Diamond']),S('Colour',['Black ink on white','Cell colour on black','Cell colour on white'])],
  `vec2 p=PX(uv)/u_p0;vec2 ci=floor(p);vec3 col=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++)col+=O(fromPX((ci+(vec2(float(i),float(j))+.5)/4.)*u_p0)).rgb;col/=16.;
 float rs=floor(u_p1+.5);vec2 sp=(floor(fract(p)*rs)+.5)/rs-.5;int m=int(u_p3+.5);float y=luma(col);float a=m==1?y:1.-y;int sh=int(u_p2+.5);float inside;
 if(sh==0)inside=step(length(sp),sqrt(a/3.14159265));else if(sh==1)inside=step(max(abs(sp.x),abs(sp.y)),.5*sqrt(a));else inside=step(abs(sp.x)+abs(sp.y),sqrt(a*.5));
 if(m==0)return vec4(vec3(1.-inside),1.);
 vec3 dc=clamp(col/max(sqrt(max(a,.05)),.3),0.,1.);
 if(m==1)return vec4(dc*inside,1.);
 return vec4(mix(vec3(1.),clamp(col*.8,0.,1.),inside),1.);`,
  Q17_FFNOTE + ': per-cell average colour drawn as a halftone dot rasterised on a coarse sub-pixel grid (blocky "pixel" dots), dot area = ink coverage');

f('q17_ff_adaptivedots','Adaptive Dots (Filter Forge)',[P('Max cell size',8,64,32,1,'px'),P('Detail threshold',.01,.3,.06,.005),S('Style',['Black dots on white','Colour dots on black','Colour dots on white']),P('Dot gain',.5,1.5,1,.01)],
  `vec2 P0=PX(uv);float cs=u_p0;vec2 ci;vec3 col;
 for(int l=0;l<4;l++){ci=floor(P0/cs);vec3 s1=vec3(0.);float s2=0.;
  for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec3 v=O(fromPX((ci+(vec2(float(i),float(j))+.5)/4.)*cs)).rgb;s1+=v;float y=luma(v);s2+=y*y;}
  col=s1/16.;float my=luma(col);float sd=sqrt(max(s2/16.-my*my,0.));if(sd<u_p1||l==3||cs<4.)break;cs*=.5;}
 vec2 q=P0/cs-ci-.5;int m=int(u_p2+.5);float y=luma(col);float a=clamp((m==1?y:1.-y)*u_p3,0.,1.);
 float r=sqrt(a/3.14159265);float d=length(q);float aa=1.5/cs;float inside=1.-smoothstep(r-aa,r+aa,d);
 if(m==0)return vec4(vec3(1.-inside),1.);
 vec3 dc=clamp(col/max(sqrt(max(a,.05)),.3),0.,1.);
 if(m==1)return vec4(dc*inside,1.);
 return vec4(mix(vec3(1.),clamp(col*.8,0.,1.),inside),1.);`,
  Q17_FFNOTE + ': quadtree halftone, cells split (up to 3 times) while the luma standard deviation inside the cell exceeds the detail threshold, one round dot per cell with area = ink coverage');

f('q17_ff_cimoc','Cimoc (Filter Forge)',[P('Colour levels',2,8,4,1),P('Ink lines',0,2,1,.01),P('Dot size',3,16,6,1,'px'),P('Shading dots',0,1,.6,.01)],
  [BH('3.'), BV('3.'),
  `vec3 b=T(uv).rgb;vec3 hv=rgb2hsv(b);float n=u_p0;hv.z=clamp((floor(hv.z*n)+.7)/n,0.,1.);hv.y=clamp(floor(hv.y*n+.5)/n*1.15,0.,1.);vec3 fc=hsv2rgb(hv);
 vec2 e=u_px*u_k;float gx=luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb);float gy=luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb);
 float ink=smoothstep(.07,.15,length(vec2(gx,gy))*u_p1);
 vec2 p=PX(uv)/u_p2;p=mat2(.7071,.7071,-.7071,.7071)*p;float d=length(fract(p)-.5);float dark=1.-luma(b);float rr=.5*sqrt(clamp((dark-.35)*1.6,0.,1.));
 float bd=1.-smoothstep(rr-.06,rr+.06,d);fc*=1.-.55*u_p3*bd;
 return vec4(fc*(1.-ink),1.);`],
  Q17_FFNOTE + ' ("comic" reversed): HSV-posterized flat colours from a smoothed image, black ink outlines from the luma gradient, 45-degree Ben-Day dot shading in the darker tones');

f = add('Paint');
f('q17_ff_multicolor','Multicolor Printing (Filter Forge)',[S('Ink set',['Process CMY plus K','Warm spot (red yellow blue)','Riso (pink teal yellow)']),P('Misregistration',0,8,2,.1,'px'),P('Ink texture',0,1,.5,.01),P('Ink levels',1,4,3,1)],
  `int st=int(u_p0+.5);vec3 K[4];
 if(st==0){K[0]=vec3(0.,.63,.89);K[1]=vec3(.9,0.,.55);K[2]=vec3(1.,.93,0.);}
 else if(st==1){K[0]=vec3(.85,.12,.12);K[1]=vec3(1.,.85,.1);K[2]=vec3(.1,.25,.65);}
 else{K[0]=vec3(1.,.28,.65);K[1]=vec3(0.,.55,.6);K[2]=vec3(1.,.9,0.);}
 K[3]=vec3(.1,.1,.12);vec3 o=vec3(.97,.95,.9);float lv=floor(u_p3+.5);
 for(int k=0;k<4;k++){float an=float(k)*2.1+.5;vec2 off=vec2(cos(an),sin(an))*R(u_p1)*(k==3?.4:1.);vec2 q=uv+off*u_px;vec3 s=O(q).rgb;
  float a;vec3 ab=vec3(1.)-K[k];float kk=1.-max(s.r,max(s.g,s.b));vec3 sn=s/max(1.-kk,.01);
  if(k==3)a=kk;
  else if(st==0){vec3 cmy=1.-sn;a=k==0?cmy.r:k==1?cmy.g:cmy.b;}
  else a=clamp(dot(1.-sn,ab)/dot(ab,ab),0.,1.);
  vec2 pp=PX(q);float tx=fbm(pp*.35+float(k)*17.)-.5;a=clamp(a+tx*.6*u_p2,0.,1.);a=floor(a*lv+.5)/lv;
  o*=mix(vec3(1.),K[k],a*.92);}
 return vec4(o,1.);`,
  Q17_FFNOTE + ': image separated into 3 flat spot / process inks plus black, each plate posterized to a few ink levels, given a grainy ink texture and its own registration offset, overprinted multiplicatively on off-white paper');

f('q17_ff_bleed','Dynamic Bleed / Color Leak (Filter Forge)',[S('Style',['Dynamic Bleed','Color leak']),P('Length',2,60,30,1,'px'),P('Angle',-180,180,-90,1,'deg'),P('Amount',0,1,.9,.01)],
  `int m=int(u_p0+.5);float ln=R(u_p1);vec2 P0=PX(uv);float an=radians(u_p2);
 if(m==0){vec3 o=c.rgb;vec2 q=uv;float st=ln/12.;
  for(int i=1;i<=24;i++){vec2 pq=PX(q);float fa=an+(fbm(pq*.015+u_seed)-.5)*4.;vec2 dir=vec2(cos(fa),sin(fa));q-=dir*st*u_px;
   float lf=ln*(.4+1.2*fbm(pq*.03+3.+u_seed));float w=exp(-float(i)*st/max(lf,1.))*u_p3;vec3 s=O(q).rgb;o=min(o,mix(c.rgb,s,w));}
  return vec4(o,1.);}
 vec2 dir=vec2(cos(an),sin(an));float y=luma(c.rgb);vec3 ch=c.rgb-y;float best=length(ch);
 for(int i=1;i<=24;i++){float d=float(i)*ln/12.;vec3 s=O(uv-dir*d*u_px).rgb;vec3 sc=s-luma(s);float w=exp(-d/ln);if(length(sc)*w>best){best=length(sc)*w;ch=mix(ch,sc*w/max(w,1e-3),u_p3);}}
 return vec4(clamp(y+ch,0.,1.),1.);`,
  Q17_FFNOTE + ': Dynamic Bleed = darker / saturated colours bleed downstream along a noise-bent flow with noise-varying reach (min-blend, like ink spreading); Color leak = chroma of strong colours leaks in one direction with exponential decay while each pixel keeps its own luminance', 1);

f = add('Color');
f('q17_ff_tricolor','Tri-Color (Filter Forge)',[S('Palette',['Red black cream','Navy red cream','Teal orange cream','Purple pink yellow','Green black ivory','Blue grey white']),P('Shadow threshold',0,1,.33,.01),P('Highlight threshold',0,1,.66,.01),P('Softness',0,.2,.02,.005)],
  `const float PL[54]=float[](.08,.06,.07, .78,.13,.13, .96,.92,.82,  .07,.12,.3, .84,.16,.18, .97,.93,.84,  .03,.3,.33, .95,.5,.15, .98,.94,.84,  .3,.08,.4, .95,.4,.6, 1.,.9,.35,  .06,.1,.06, .2,.45,.25, .97,.96,.88,  .1,.15,.35, .5,.55,.6, .97,.98,1.);
 int k=int(u_p0+.5)*9;vec3 c0=vec3(PL[k],PL[k+1],PL[k+2]),c1=vec3(PL[k+3],PL[k+4],PL[k+5]),c2=vec3(PL[k+6],PL[k+7],PL[k+8]);
 float y=luma(c.rgb);float s=max(u_p3,.001);float a=smoothstep(u_p1-s,u_p1+s,y),b=smoothstep(u_p2-s,u_p2+s,y);
 return vec4(mix(mix(c0,c1,a),c2,b),1.);`,
  Q17_FFNOTE + ': luminance split by two thresholds into three flat poster colours (shadow / mid / highlight) with adjustable edge softness');

f = add('Stylize');
f('q17_ff_moods','Gothic FX / Romantic Grunge (Filter Forge)',[S('Look',['Gothic FX','Romantic Grunge']),P('Strength',0,1,1,.01),P('Texture',0,1,.5,.01),P('Vignette',0,1,.6,.01)],
  [BH('14.'), BV('14.'),
  `vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;int m=int(u_p0+.5);vec2 pp=PX(uv);float y=luma(o);vec3 x;
 float tex=fbm(pp*.02)*.6+fbm(pp*.11+5.)*.4;float scr=smoothstep(.7,.95,vnoise(vec2(pp.x*.6,pp.y*.012)+9.));
 vec2 q=(uv-.5)*vec2(asp(),1.)/sqrt(asp()*asp()+1.)*2.;float vg=smoothstep(.3,1.1,length(q));
 if(m==0){x=mix(vec3(y),o,.18);x=mix(x*vec3(.82,.88,1.02),x,smoothstep(.2,.8,y));x=clamp((x-.5)*1.45+.45,0.,1.);x=x*x*(3.-2.*x);
  x=1.-(1.-x)*(1.-.35*smoothstep(.55,1.,luma(bl))*vec3(.85,.9,1.));
  x*=1.-u_p2*(.45*smoothstep(.45,.75,tex)+.3*scr);x*=1.-u_p3*.85*vg;x=mix(x,x*vec3(.92,.85,1.),.4);}
 else{x=mix(vec3(y),o,.6)*vec3(1.08,.97,.86);x=1.-(1.-x)*(1.-.45*bl*vec3(1.,.85,.8));x=.1+x*.86;
  vec3 stain=mix(vec3(1.),vec3(.78,.62,.45),smoothstep(.4,.8,tex));x*=mix(vec3(1.),stain,u_p2);x*=1.-u_p2*.25*scr;
  x*=mix(vec3(1.),vec3(.55,.38,.3),u_p3*vg);}
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`],
  Q17_FFNOTE + ': Gothic FX = mostly desaturated, cold-shadowed, hard S-curve contrast with a cool highlight glow, dark grunge stains and scratches, heavy vignette; Romantic Grunge = warm faded colour, strong soft glow, lifted blacks, brown paper stains and scratches, warm vignette');
