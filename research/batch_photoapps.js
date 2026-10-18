/* ================= photoapps: round 9 photo-app tools (Luminar / DxO / darktable / GIMP / G'MIC) and stylised looks ================= */
const photoappsGA = '1033774,509487,34350,575023,492607,492607,951854,1033777,135310,270620,103729,33825,710513,708145,575022,509487,575022,509487,459838,135327,575025,575025,706097,141873,141873,139807,0,0,4096,458752,1020032,31744,480384,571392,139891,70950,464836,476718,359754,718382';
const photoappsGB = '17969,15921,14881,15921,31777,1057,31281,17969,14468,6440,17701,31777,17969,17977,14897,1057,22837,17701,15888,4228,14897,4433,10933,17962,4228,31778,0,4096,128,0,132,31,149,14897,26402,22837,4596,14897,10591,30781';
// 5x7 bitmap glyphs: 0..25 = A..Z, 26..39 = density ramp " .:-+=*o%&$8#@" (sorted by ink coverage)
const photoappsGLYPH = `const int GA[40]=int[40](${photoappsGA});const int GB[40]=int[40](${photoappsGB});
#define PAGB(gi,cx,cy) (((cx)<0||(cx)>4||(cy)<0||(cy)>6)?0:(((((cy)<4)?GA[(gi)]:GB[(gi)])>>((((cy)<4)?(cy):((cy)-4))*5+(cx)))&1))
`;
const photoappsQ = `
#define PAQ(cc) (floor(clamp((cc),0.,1.)*(qn-.001))/max(qn-1.,1.))
`;
// one explicit inverse-diffusion step  u <- u - a*Laplacian(u), clamped to the 4-neighbour range (+margin)
const photoappsID = src => `vec3 u=${src}(uv).rgb;vec2 dd=max(R(u_p2),1.)*u_px;vec3 a=${src}(uv+vec2(dd.x,0.)).rgb,b=${src}(uv-vec2(dd.x,0.)).rgb,e=${src}(uv+vec2(0.,dd.y)).rgb,f2=${src}(uv-vec2(0.,dd.y)).rgb;
  vec3 lap=a+b+e+f2-4.*u;vec3 mn=min(min(a,b),min(e,f2)),mx=max(max(a,b),max(e,f2));vec3 r=u-lap*u_p1*.12;r=clamp(r,mn-.08,mx+.08);return vec4(clamp(r,0.,1.),1.);`;

/* ---------- Luminar / DxO tone tools ---------- */
f = add('Tone');
f('skyenhancer','Sky Enhancer',[P('Amount',0,1,.7,.01),P('Sky sensitivity',0,1,.5,.01),P('Deepen sky',0,1,.5,.01),P('Cloud detail',0,1,.5,.01)],
  [`vec3 o=O(uv).rgb;vec3 h=rgb2hsv(o);float blue=(1.-smoothstep(.07,.14,abs(h.x-.6)))*smoothstep(.06,.2,h.y)*smoothstep(.25,.5,h.z);
   float over=(1.-smoothstep(.06,.18,h.y))*smoothstep(.62,.85,h.z);float smo=1.-smoothstep(.15,.6,length(sobel(uv)));float pri=smoothstep(.15,.7,uv.y);
   float m=max(blue,over*.7)*mix(1.,pri,.75)*mix(1.,smo,.5);m=clamp(m*(.5+1.5*u_p1),0.,1.);return vec4(m,luma(o),0.,1.);`,BH('12.'),BV('12.'),
   `vec4 t=T(uv);float m=smoothstep(.15,.6,t.r);vec3 o=O(uv).rgb;float l=luma(o);vec3 r=o+(l-t.g)*u_p3*3.;
   vec3 h=rgb2hsv(clamp(r,0.,1.));float bl=1.-smoothstep(.07,.16,abs(h.x-.6));h.y=clamp(h.y*(1.+u_p2*.9*bl),0.,1.);h.z*=1.-u_p2*.35*bl*h.y;
   r=hsv2rgb(h);return vec4(clamp(mix(o,r,u_p0*m),0.,1.),1.);`],
  'Luminar Sky Enhancer: sky mask (blue or bright-overcast hue, smooth, upper frame) → deepen blue + cloud local contrast (approx.)');
f('autolocaltone','Accent / Smart Lighting (Auto Local Tone)',[S('Mode',['Accent AI (auto)','Smart Lighting: uniform','Smart Lighting: spot (centre)']),P('Amount',0,1,.6,.01),P('Radius',4,120,30,1,'px'),P('Vibrance',-1,1,.15,.01)],
  [`vec3 l=${LIN('c.rgb')};return vec4((log2(max(luma(l),1e-4))+14.)/14.,0.,0.,1.);`,BH('u_p2'),BV('u_p2'),
   `int md=int(u_p0+.5);float base=T(uv).r*14.-14.;vec3 o=O(uv).rgb;vec3 li=${LIN('o')};float lg=log2(max(luma(li),1e-4));
   float mean=0.,ws=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec2 q=(vec2(float(i),float(j))+.5)/12.;vec2 dq=(q-.5)*vec2(asp(),1.);float w=md==2?exp(-dot(dq,dq)/.05):1.;vec3 s=O(q).rgb;vec3 sl=${LIN('s')};mean+=w*log2(max(luma(sl),1e-4));ws+=w;}mean/=ws;
   float key=-2.47;float g;
   if(md==0){float d=key-base;g=(d>0.?d*.4:d*.15)+(key-mean)*.2;g=clamp(g,-1.,2.)+(lg-base)*.5;}
   else if(md==1)g=clamp((mean-base)*.6+(key-mean)*.45,-1.5,2.5);
   else g=clamp((key-mean)*.75+(mean-base)*.3,-1.5,2.5);
   vec3 y=li*exp2(g*u_p1);y=y/(1.+y*.25)*1.25;y=clamp(y,0.,1.);vec3 r=${SRGB('y')};
   float sa=max(r.r,max(r.g,r.b))-min(r.r,min(r.g,r.b));r=mix(vec3(luma(r)),r,1.+u_p3*(1.-sa));return vec4(clamp(r,0.,1.),1.);`],
  'Luminar Accent AI / DxO Smart Lighting: local exposure compensation from a smoothed log-luminance map toward middle grey, global key from a 12×12 sample (approx.)');
f('clearview','ClearView Dehaze',[P('Amount',0,1,.5,.01),P('Radius',4,60,20,1,'px'),P('Local contrast',0,1,.4,.01)],
  [`float rr=R(u_p1)*.35;float dc=1.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec3 s=O(uv+vec2(float(i),float(j))*rr/3.*u_px).rgb;dc=min(dc,min(s.r,min(s.g,s.b)));}return vec4(dc,luma(O(uv).rgb),0.,1.);`,BH('u_p1'),BV('u_p1'),
   `vec3 o=O(uv).rgb;vec4 t=T(uv);vec3 A=vec3(0.);float best=-1.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s=O((vec2(float(i),float(j))+.5)/12.).rgb;float d=min(s.r,min(s.g,s.b))+luma(s)*.2;if(d>best){best=d;A=s;}}
   A=max(A,vec3(.55));float dc=mix(t.r,min(t.r,min(o.r,min(o.g,o.b))),.5);float tr=max(1.-.9*u_p0*dc/min(A.r,min(A.g,A.b)),.25);
   vec3 J=(o-A)/tr+A;J+=(luma(o)-t.g)*u_p2*2.;J*=1.+.12*u_p0;return vec4(clamp(J,0.,1.),1.);`],
  'DxO ClearView: dark-channel haze removal on a smoothed transmission map + local contrast (approx.)');
f('luminarlooks','Luminar Looks',[S('Look',['Mystical','Golden hour','Dramatic','Matte look']),P('Amount',0,1,.7,.01),P('Radius',4,80,20,1,'px'),P('Saturation',-1,1,0,.01)],
  [BH('u_p2'),BV('u_p2'),
   `int lk=int(u_p0+.5);vec3 o=O(uv).rgb,b=T(uv).rgb;float l=luma(o);vec3 r;
   if(lk==0){float lb=luma(b);float lo=overlay(vec3(l),vec3(lb)).x;r=o*lo/max(l,.01);r=mix(r,screen(r,b*b*.8),.3);r=sat(r,1.15);}
   else if(lk==1){float w=smoothstep(.1,.8,l);r=o*mix(vec3(1.03,.97,.9),vec3(1.2,1.,.68),w);r=screen(r,b*b*vec3(1.,.7,.32)*.5);r=sat(r,1.1);}
   else if(lk==2){r=o+(o-b)*1.8;r=mix(vec3(luma(r)),r,.6);r=pow(max(r,0.),vec3(1.12));}
   else{r=o*.86+.1;float lr=luma(r);r=mix(vec3(lr),r,.82);r+=vec3(0.,.012,.03)*(1.-lr)-vec3(0.,0.,.03)*lr;r=mix(r,r*r*(3.-2.*r),.3);}
   r=sat(r,1.+u_p3);return vec4(clamp(mix(o,r,u_p1),0.,1.),1.);`],
  'Luminar Mystical (glow-overlay + saturation), Golden Hour (warm highlights + warm glow), Dramatic (large-radius local contrast + desaturation), Matte Look (faded blacks, tinted shadows) (approx.)');

f = add('Sharpen');
f('microcontrast','Microcontrast',[P('Amount',-1,2,.8,.01),P('Radius',1,6,2,.5,'px'),P('Noise threshold',0,.05,.008,.001),P('Midtone weighting',0,1,.5,.01)],
  [BH('u_p1'),BV('u_p1'),
   `vec3 o=O(uv).rgb;float l=luma(o),lb=luma(T(uv).rgb);float d=l-lb;d=sign(d)*max(abs(d)-u_p2,0.);float w=mix(1.,4.*l*(1.-l),u_p3);return vec4(clamp(o+d*u_p0*3.*w,0.,1.),1.);`],
  'DxO Microcontrast: small-radius luminance local contrast with a noise threshold and midtone weighting');
f('sharpenvariants','Octave / Inverse-Diffusion / Texture Sharpening',[S('Method',['Octave sharpening','Inverse diffusion','Texture sharpening']),P('Amount',0,2,.7,.01),P('Radius',.5,6,1.5,.1,'px'),P('Octaves / steps',1,4,3,1)],
  [`int m=int(u_p0+.5);vec3 o=O(uv).rgb;float rad=R(u_p2);
   if(m==0){vec3 prev=o,det=vec3(0.);float sc=max(rad*.5,.5);for(int k=0;k<4;k++){if(float(k)>=u_p3)break;vec3 bs=vec3(0.);float ws=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 d=vec2(float(i),float(j));float w=exp(-dot(d,d)/4.5);bs+=O(uv+d*sc*u_px).rgb*w;ws+=w;}vec3 bl=bs/ws;det+=(prev-bl)/(1.+float(k)*.5);prev=bl;sc*=2.;}return vec4(clamp(o+det*u_p1,0.,1.),1.);}
   if(m==2){vec3 acc=vec3(0.);float ws=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));vec3 s=O(uv+d*max(rad,.7)*u_px).rgb;vec3 e=s-o;float w=exp(-dot(d,d)/6.-dot(e,e)*60.);acc+=s*w;ws+=w;}return vec4(clamp(o+(o-acc/ws)*u_p1*1.5,0.,1.),1.);}
   ${photoappsID('O')}`,
   `if(int(u_p0+.5)!=1||u_p3<1.5)return T(uv);${photoappsID('T')}`,
   `if(int(u_p0+.5)!=1||u_p3<2.5)return T(uv);${photoappsID('T')}`,
   `if(int(u_p0+.5)!=1||u_p3<3.5)return T(uv);${photoappsID('T')}`],
  "G'MIC sharpen family: octave = sum of difference-of-Gaussian bands at doubling scales; inverse diffusion = explicit backward heat steps u−a·Δu (overshoot-clamped); texture = boost the residual of an edge-preserving (bilateral) structure layer");

/* ---------- colour tools ---------- */
f = add('Color');
f('skinuniform','Skin Tone Uniformity',[P('Amount',0,1,.7,.01),P('Skin hue',0,60,22,1,'°'),P('Hue range',5,40,18,1,'°'),P('Radius',4,60,16,1,'px')],
  [`vec3 o=O(uv).rgb;vec3 h=rgb2hsv(o);float a=h.x*6.28318;float dh=abs(fract(h.x-u_p1/360.+.5)-.5)*360.;
   float w=(1.-smoothstep(u_p2*.6,u_p2,dh))*smoothstep(.08,.18,h.y)*(1.-smoothstep(.8,.95,h.y))*smoothstep(.12,.3,h.z);
   return vec4(.5+.5*w*cos(a),.5+.5*w*sin(a),w*h.y,w);`,BH('u_p3'),BV('u_p3'),
   `vec4 t=T(uv);vec3 o=O(uv).rgb;vec3 h=rgb2hsv(o);float hc=u_p1/360.;float dh=abs(fract(h.x-hc+.5)-.5)*360.;
   float w=(1.-smoothstep(u_p2*.6,u_p2,dh))*smoothstep(.08,.18,h.y)*(1.-smoothstep(.8,.95,h.y))*smoothstep(.12,.3,h.z);
   if(t.a<.02||w<=0.)return vec4(o,1.);vec2 cs=(t.rg-.5)*2.;float ma=atan(cs.y,cs.x)/6.28318;float ms=t.b/t.a;float k=u_p0*w;
   h.x=fract(h.x+(fract(ma-h.x+.5)-.5)*k);h.x=fract(h.x+(fract(hc-h.x+.5)-.5)*k*.3);h.y=mix(h.y,ms,k*.8);return vec4(hsv2rgb(h),1.);`],
  'DxO / Luminar skin tone uniformity: inside a skin-hue window, pull hue and saturation toward their local (mask-weighted) average');
f('colorzones','Color Zones / Color Editor (Hue Range)',[P('Hue',0,360,30,1,'°'),P('Range',10,120,45,1,'°'),S('Adjust',['Lightness','Saturation','Hue']),P('Amount',-1,1,.5,.01)],
  `vec3 h=rgb2hsl(c.rgb);float dh=abs(fract(h.x-u_p0/360.+.5)-.5)*360.;float w=.5+.5*cos(PI*clamp(dh/u_p1,0.,1.));w*=smoothstep(.03,.15,h.y)*smoothstep(.02,.1,h.z)*(1.-smoothstep(.9,.98,h.z));
   int m=int(u_p2+.5);float a=u_p3*w;
   if(m==0)h.z=a>0.?h.z+a*(1.-h.z)*.6:h.z*(1.+a*.6);else if(m==1)h.y=a>0.?h.y+a*(1.-h.y)*.8:h.y*(1.+a);else h.x=fract(h.x+a/6.);
   return vec4(hsl2rgb(h),1.);`,
  'darktable color zones / DxO-Capture One color editor: smooth (raised-cosine) hue-range selection, grey-protected, adjusts lightness, saturation or hue (±60°)');
f('rotatecolors','Rotate Colors (Range Map)',[P('From start',0,360,0,1,'°'),P('From end',0,360,60,1,'°'),P('To start',0,360,180,1,'°'),P('To end',0,360,240,1,'°')],
  `vec3 h=rgb2hsv(c.rgb);float span=mod(u_p1-u_p0+360.,360.);if(span<.5)span=360.;float d=mod(h.x*360.-u_p0+360.,360.);
   if(d<=span&&h.y>.02){float ts=mod(u_p3-u_p2+360.,360.);if(ts<.5)ts=360.;h.x=fract((u_p2+d/span*ts)/360.);}return vec4(hsv2rgb(h),1.);`,
  'GIMP Rotate Colors: maps the hue arc From start→end linearly onto To start→end (counter-clockwise arcs)');
f('colorexchange','Color Exchange',[P('Pick X',0,1,.2,.01),P('Pick Y',0,1,.6,.01),P('To hue',0,360,200,1,'°'),P('Threshold',.02,1,.22,.01)],
  `vec2 pq=vec2(u_p0,1.-u_p1);vec3 fr=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)fr+=O(pq+vec2(float(i),float(j))*3.*u_k*u_px).rgb;fr/=9.;
   vec3 fh=rgb2hsv(fr);vec3 to=hsv2rgb(vec3(u_p2/360.,fh.y,fh.z));vec3 o=c.rgb;vec3 df=abs(o-fr);float md=max(df.r,max(df.g,df.b));float w=1.-smoothstep(u_p3*.75,u_p3,md);
   return vec4(mix(o,clamp(to+(o-fr),0.,1.),w),1.);`,
  'GIMP Color Exchange: pixels within an RGB (per-channel) threshold of the picked colour are moved to the target colour, keeping their offset from it');

f = add('Tone');
f('invertvariants','Value / Linear Invert',[S('Mode',['Value invert (HSV)','Linear-light invert','Lightness invert (HSL)','Luma invert (keep chroma)']),P('Amount',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 o=c.rgb;vec3 r;if(m==0){vec3 h=rgb2hsv(o);h.z=1.-h.z;r=hsv2rgb(h);}else if(m==1){vec3 l=${LIN('o')};vec3 il=1.-l;r=${SRGB('il')};}
   else if(m==2){vec3 h=rgb2hsl(o);h.z=1.-h.z;r=hsl2rgb(h);}else r=o+(1.-2.*luma(o));return vec4(clamp(mix(o,r,u_p1),0.,1.),1.);`,
  'GIMP Value Invert (HSV value only, hue & saturation kept) and Linear Invert (1 − x in linear light), plus HSL / luma variants');
f('monomixer','Mono Mixer',[P('Red',-2,2,.333,.001),P('Green',-2,2,.333,.001),P('Blue',-2,2,.333,.001),S('Options',['Plain','Preserve luminosity','Linear light','Linear + preserve luminosity'])],
  `int m=int(u_p3+.5);vec3 w=vec3(u_p0,u_p1,u_p2);if(m==1||m==3){float s=w.r+w.g+w.b;if(abs(s)>1e-3)w/=s;}vec3 v=c.rgb;if(m>=2)v=${LIN('c.rgb')};
   vec3 gg=vec3(clamp(dot(v,w),0.,1.));if(m>=2)gg=${SRGB('gg')};return vec4(gg,1.);`,
  'GIMP Mono Mixer: weighted R/G/B sum to grey; preserve luminosity normalises the weights to sum 1; optional linear light');
f('stretchhsv','Stretch Contrast HSV',[P('Amount',0,1,1,.01),S('Channels',['Saturation + value','Value only'])],
  `float smin=1.,smax=0.,vmin=1.,vmax=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=rgb2hsv(O((vec2(float(i),float(j))+.5)/16.).rgb);smin=min(smin,q.y);smax=max(smax,q.y);vmin=min(vmin,q.z);vmax=max(vmax,q.z);}
   vec3 h=rgb2hsv(c.rgb);if(u_p1<.5)h.y=clamp((h.y-smin)/max(smax-smin,1e-3),0.,1.);h.z=clamp((h.z-vmin)/max(vmax-vmin,1e-3),0.,1.);return vec4(mix(c.rgb,hsv2rgb(h),u_p0),1.);`,
  'GIMP Stretch Contrast HSV: stretches S and V independently to the full range, hue untouched (min/max from a 16×16 sample grid, approx.)');

/* ---------- GIMP / G'MIC items ---------- */
f = add('Retro');
f('eraserows','Erase Every Other Row',[S('Erase',['Rows','Columns']),S('Which',['Even','Odd']),S('Fill',['Background (white)','Black']),P('Line width',1,16,1,1,'px')],
  `vec2 p=PX(uv);float v=u_p0<.5?(u_res.y/u_k-p.y):p.x;float idx=floor(v/u_p3);if(abs(mod(idx,2.)-u_p1)<.5)return vec4(vec3(u_p2<.5?1.:0.),1.);return c;`,
  'GIMP Erase Every Other Row: blank alternate rows or columns (even / odd) with the background colour');
f = add('Paint');
f('dreamsmooth','Dream Smoothing',[P('Radius',2,8,5,1,'px'),P('Opacity',0,1,.85,.01),P('Glow',0,1,.35,.01)],
  [`return vec4(kuwa(uv,u_p0),1.);`,`return vec4(kuwa(uv,max(u_p0*.6,1.)),1.);`,
   `vec3 o=O(uv).rgb,s=T(uv).rgb;vec3 g=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)g+=T(uv+vec2(float(i),float(j))*R(4.)*u_px).rgb;g/=25.;
   vec3 r=mix(s,screen(s,g*g),u_p2);r=mix(r,r*r*(3.-2.*r),.25);return vec4(clamp(mix(o,r,u_p1),0.,1.),1.);`],
  "G'MIC Dream Smoothing: iterated edge-preserving (Kuwahara) smoothing + soft glow and mild equalisation (approx.)");
f('graphicnovel','Graphic Novel',[P('Edges',0,1,.6,.01),P('Contrast',0,1,.5,.01),S('Color',['Desaturated','Color']),P('Smoothness',1,6,3,.5,'px')],
  [`vec3 o=O(uv).rgb;vec3 acc=vec3(0.);float ws=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));vec3 s=O(uv+d*R(u_p3)*.5*u_px).rgb;vec3 e=s-o;float w=exp(-dot(d,d)/8.-dot(e,e)*40.);acc+=s*w;ws+=w;}return vec4(acc/ws,1.);`,
   `vec3 s=T(uv).rgb;float l=luma(s);float e=smoothstep(.15,.5,length(sobel(uv))*(1.+2.*u_p0))*u_p0;float t=clamp((l-.45)*(1.+1.4*u_p1)+.5,0.,1.);t=mix(t,smoothstep(.1,.9,t),u_p1*.7);
   vec3 col=u_p2>.5?clamp(sat(s,1.3)*(t/max(l,.02)),0.,1.):vec3(t);return vec4(col*(1.-e),1.);`],
  "G'MIC Graphic Novel: bilateral smoothing, steep tone curve and inked Sobel edges (approx.)");
f = add('Render');
f('spiralpattern','Spiral Pattern',[S('Type',['Linear (Archimedean)','Logarithmic']),P('Period',6,120,24,1,'px'),P('Balance',.05,.95,.5,.01),S('Output',['Black & white','Multiply image','Image / inverted image'])],
  `vec2 p=PX(uv)-u_res/u_k*.5;float r=length(p);float a=atan(p.y,p.x)/(2.*PI);float ph=u_p0<.5?r/u_p1-a:log(max(r,1.))*(72./u_p1)-a;
   float s=fract(ph);float aa=max(fwidth(ph),1e-3);float v=smoothstep(u_p2-aa,u_p2+aa,s)*(1.-smoothstep(1.-aa,1.,s));int m=int(u_p3+.5);vec3 o=c.rgb;
   return vec4(m==0?vec3(v):m==1?o*v:mix(1.-o,o,v),1.);`,
  'GIMP Render › Spiral: linear or logarithmic spiral bands with balance (centred)');
f('plaid','Plaid Texture',[P('Sett size',30,300,96,1,'px'),P('Colors',2,6,4,1),P('Thread width',1,8,2,.5,'px'),S('Source',['Colours from image','Image woven'])],
  `vec2 p=PX(uv);float nc=floor(u_p1+.5);float wd[6]=float[6](.30,.12,.18,.06,.22,.12);float id[2];
   for(int ax=0;ax<2;ax++){float v=fract((ax==0?p.x:p.y)/u_p0);v=v<.5?v*2.:(1.-v)*2.;float acc=0.;id[ax]=5.;for(int k=0;k<6;k++){acc+=wd[k];if(v<acc){id[ax]=float(k);break;}}}
   vec3 cw,cf;vec3 pal[6];for(int k=0;k<6;k++){float fk=mod(float(k),nc);vec2 q=vec2(.2+.6*fract(fk*.618+.1),.25+.5*fract(fk*.382+.3));vec3 s=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)s+=O(q+vec2(float(i),float(j))*.02).rgb;pal[k]=clamp(sat(s/9.,1.4),0.,1.);}
   cw=pal[int(id[0])];cf=pal[int(id[1])];if(u_p3>.5){vec3 o=O(uv).rgb;cw=o*1.05;cf=o*.85;}
   float th=u_p2;vec2 ti=floor(p/th);bool warp=mod(ti.x+ti.y,4.)<2.;float pw=.7+.3*sin(PI*fract(p.x/th)),pf=.7+.3*sin(PI*fract(p.y/th));
   return vec4(clamp(warp?cw*pw:cf*pf,0.,1.),1.);`,
  "Tartan (G'MIC-style plaid texture): mirrored sett of stripes, 2/2 twill weave, thread colours sampled from the image (or the image itself woven)");
f('seamlessdeco','Seamless Deco',[P('Tile size',40,400,160,1,'px'),P('Source zoom',.1,1,.45,.01),S('Symmetry',['Mirror (pmm)','Kaleidoscope (p4m)','Diamond mirror (cmm)']),P('Source X',0,1,.5,.01)],
  `vec2 p=PX(uv);int sy=int(u_p2+.5);if(sy==2)p=rot(p,PI*.25);vec2 q=abs(fract(p/u_p0)*2.-1.);if(sy==1&&q.y>q.x)q=q.yx;
   vec2 src=vec2(u_p3,.5)+(q-.5)*vec2(u_p1/asp(),u_p1);return O(clamp(src,0.,1.));`,
  "G'MIC Seamless Deco-style: folds a window of the image into a seamless mirror / kaleidoscope wallpaper tile (approx.)");

/* ---------- light & material looks ---------- */
f = add('Stylize');
f('sunrays','Sunrays',[P('Sun X',0,1,.72,.01),P('Sun Y',0,1,.22,.01),P('Amount',0,1,.7,.01),P('Rays',4,60,22,1)],
  [`vec3 o=O(uv).rgb;float l=luma(o);vec2 d=(uv-vec2(u_p0,1.-u_p1))*vec2(asp(),1.);float sun=exp(-dot(d,d)/.0025);float sky=smoothstep(.55,.85,l)*(1.-smoothstep(.35,.6,rgb2hsv(o).y));return vec4(max(sun,sky*.45),0.,0.,1.);`,
   `vec3 o=O(uv).rgb;vec2 sp=vec2(u_p0,1.-u_p1);vec2 dv=sp-uv;float acc=0.,dec=1.;for(int i=0;i<64;i++){acc+=T(uv+dv*(float(i)/64.)*.85).r*dec;dec*=.965;}acc/=9.;
   vec2 dd=(uv-sp)*vec2(asp(),1.);float ang=atan(dd.y,dd.x);float n=vnoise(vec2(cos(ang),sin(ang))*u_p3*.16+u_seed*.37);float streak=.15+.85*smoothstep(.3,.75,n);float dist=length(dd);
   vec3 col=vec3(1.,.82,.55);vec3 add2=col*clamp(acc*streak*u_p2,0.,1.5)*.9+col*exp(-dist*dist/.01)*.5*u_p2;vec3 r=screen(o,add2);r=mix(r,r*vec3(1.04,1.,.92),u_p2*.5);return vec4(clamp(r,0.,1.),1.);`],
  'Luminar Sunrays: a placed sun plus bright sky emit; light is marched toward the sun (dark objects occlude), broken into rays by angular noise, warm screen blend',1);
f = add('Materials');
f('metallicfoil','Liquid Chrome / Holographic Foil / Iridescence',[S('Look',['Liquid chrome','Holographic foil','Iridescence (thin film)']),P('Amount',0,1,1,.01),P('Smoothness',1,40,14,1,'px'),P('Bands',.3,4,1.2,.05)],
  [`return vec4(vec3(luma(O(uv).rgb)),1.);`,BH('u_p2'),BV('u_p2'),
   `int m=int(u_p0+.5);vec3 o=O(uv).rgb;float h=T(uv).r;vec2 e=u_px*max(u_k*1.5,1.);float dx=T(uv+vec2(e.x,0.)).r-T(uv-vec2(e.x,0.)).r,dy=T(uv+vec2(0.,e.y)).r-T(uv-vec2(0.,e.y)).r;
   vec3 n=normalize(vec3(-dx*30.,-dy*30.,1.));vec3 col;
   if(m==0){vec3 rf=reflect(vec3(0.,0.,-1.),n);float t=rf.y*1.4+rf.x*.4+h*u_p3*2.;float v=pow(.5+.5*cos(t*6.28318),1.3);col=mix(vec3(.04,.045,.06),vec3(.97,.98,1.),v);col=mix(col,col*vec3(.85,.92,1.08),smoothstep(0.,.6,rf.y));float sp=pow(max(dot(n,normalize(vec3(-.4,.5,1.))),0.),40.);col+=sp*.6;}
   else if(m==1){float t=dot(n.xy,vec2(.8,.6))*2.5+h*u_p3+dot(uv,vec2(.35,.2));vec3 rb=hsv2rgb(vec3(fract(t),.55,1.));float grat=.92+.08*sin(dot(PX(uv),vec2(.7,.7))*2.2);float sp=step(.985,hash(floor(PX(uv)/2.)))*(.5+.5*sin(t*20.));col=rb*(.35+.8*luma(o))*grat+sp*.6;}
   else{float d=(h*u_p3+.15)*1.2;vec3 lam=vec3(.65,.532,.45);vec3 ir=.5+.5*cos(2.*PI*2.*1.33*d*n.z/lam);col=o*.45+ir*(.25+.6*luma(o));}
   return vec4(clamp(mix(o,col,u_p1),0.,1.),1.);`],
  'height = smoothed luminance → normals; liquid chrome = banded sky/ground environment reflection; holographic foil = angle-dependent rainbow + grating + glitter; iridescence = thin-film interference (2nd·d·cosθ / λ for R,G,B) (approx.)',1);

f = add('Paint');
f('inkprint','Blueprint / Ink Bleed',[S('Look',['Blueprint','Ink bleed']),P('Line strength',0,1,.6,.01),P('Bleed / glow',1,12,3,.5,'px'),P('Grid / paper texture',0,1,.5,.01)],
  [`float l=luma(O(uv).rgb);return vec4(length(sobel(uv)),1.-l,0.,1.);`,BH('u_p2'),BV('u_p2'),
   `int m=int(u_p0+.5);vec2 p=PX(uv);vec3 o=O(uv).rgb;vec4 t=T(uv);vec2 dd=u_px*max(u_k,1.);
   float lx=luma(O(uv+vec2(dd.x,0.)).rgb)-luma(O(uv-vec2(dd.x,0.)).rgb),ly=luma(O(uv+vec2(0.,dd.y)).rgb)-luma(O(uv-vec2(0.,dd.y)).rgb);float ec=length(vec2(lx,ly));
   if(m==0){vec3 bg=vec3(.07,.24,.55)*(.9+.2*fbm(p*.01));vec2 g1=abs(fract(p/24.+.5)-.5)*24.;float gl=1.-smoothstep(.4,1.2,min(g1.x,g1.y));vec2 g2=abs(fract(p/120.+.5)-.5)*120.;float gb=1.-smoothstep(.6,1.6,min(g2.x,g2.y));
     float line=smoothstep(.06,.25,ec*(.5+u_p1*1.5));float glow=clamp(t.r*3.*u_p1,0.,1.);vec3 r=bg+vec3(.8,.9,1.)*(gl*.12+gb*.22)*u_p3+vec3(.85,.93,1.)*max(line,glow*.35)+(luma(o)-.5)*.08;return vec4(clamp(r,0.,1.),1.);}
   vec3 paper=vec3(.96,.94,.88)*(.95+.05*fbm(p*.15))*(1.-.05*u_p3*fbm(p*vec2(.04,.6)));float nz=(fbm(p*.08)-.5)*.35;float ink=t.g*.6+t.r*2.*u_p1+nz;
   float a=smoothstep(.5,.66,ink);float core=smoothstep(.5,.7,(1.-luma(o))*.7+ec*2.*u_p1);float rim=smoothstep(.4,.5,ink)-smoothstep(.5,.62,ink);
   return vec4(mix(paper,vec3(.1,.09,.16),clamp(a*.75+core*.9+rim*.25,0.,1.)),1.);`],
  'blueprint = white edge lines (crisp + glow) on cyanotype blue with drafting grid; ink bleed = dark tones and edges as ink feathering into fibrous paper with darker drying rim',1);

f('textile','Embroidery / Cross-stitch / Knitting',[S('Stitch',['Embroidery (satin)','Cross-stitch','Knitting']),P('Stitch size',4,40,10,1,'px'),P('Colors',2,24,8,1),P('Thread relief',0,1,.7,.01)],
  [BH('u_p1*.4'),BV('u_p1*.4'),
   `${photoappsQ}int m=int(u_p0+.5);vec2 p=PX(uv);float s=u_p1;float qn=u_p2;float rel=u_p3;vec3 col;
   if(m==1){vec2 ci=floor(p/s);vec2 q=fract(p/s)-.5;vec3 C=PAQ(T(fromPX((ci+.5)*s)).rgb);
     vec3 fab=vec3(.93,.91,.85)*(.94+.06*sin(p.x*PI*4./s)*sin(p.y*PI*4./s));float hole=1.-smoothstep(.05,.11,length(abs(q)-.5));fab*=1.-.45*hole;col=fab;
     if(luma(C)<.92){float w=.24;float d1=abs(q.x-q.y)*.7071,d2=abs(q.x+q.y)*.7071;float al1=(q.x+q.y)*.7071,al2=(q.x-q.y)*.7071;
       float pr2=sqrt(max(1.-d2*d2/(w*w),0.)),pr1=sqrt(max(1.-d1*d1/(w*w),0.));
       float sh2=mix(1.,(.55+.45*pr2)*(.88+.12*sin(al2*40.+d2*30.)),rel)*(1.-.3*rel*(1.-smoothstep(w,w+.08,d1)));float sh1=mix(1.,(.6+.5*pr1)*(.88+.12*sin(al1*40.+d1*30.)),rel);
       col=mix(col,C*sh2,1.-smoothstep(w-.04,w,d2));col=mix(col,C*sh1,1.-smoothstep(w-.04,w,d1));}}
   else if(m==2){vec2 cs=vec2(s,s*1.15);vec2 ci=floor(p/cs);vec2 q=fract(p/cs)-.5;vec3 C=PAQ(T(fromPX((ci+.5)*cs)).rgb);
     vec2 dl=normalize(vec2(-.38,1.));float best=0.,alb=0.,plb=0.;for(int k=0;k<2;k++){vec2 dk=k==0?dl:vec2(-dl.x,dl.y);vec2 ql=q-vec2(k==0?-.18:.18,.02);float al=dot(ql,dk),pl=dot(ql,vec2(dk.y,-dk.x));float el=1.-(al*al/.3+pl*pl/.04);if(el>best){best=el;alb=al;plb=pl;}}
     float sh=sqrt(max(best,0.));col=C*mix(1.,mix(.3,1.05,sh)*(.9+.1*sin(alb*60.+plb*25.)),rel);if(best<=0.)col=C*mix(1.,.3,rel);}
   else{float big=s*2.;vec2 ci=floor(p/big);vec2 cc=(ci+.5)*big;float gx=L(fromPX(cc+vec2(big*.5,0.)))-L(fromPX(cc-vec2(big*.5,0.))),gy=L(fromPX(cc+vec2(0.,big*.5)))-L(fromPX(cc-vec2(0.,big*.5)));
     float ang=length(vec2(gx,gy))<.06?PI*.25+(hash(ci)-.5)*.5:atan(gy,gx)+PI*.5;vec2 dir=vec2(cos(ang),sin(ang)),nn=vec2(-dir.y,dir.x);float th=max(s*.28,1.5);
     float acr=dot(p,nn)/th;float ti=floor(acr),fa=fract(acr);float hs=hash(vec2(ti,ci.x+ci.y*91.));float alo=dot(p,dir)/(big*.9)+hs;float fl=fract(alo);
     vec2 sc=nn*(ti+.5)*th+dir*((floor(alo)+.5-hs)*big*.9);vec3 C=PAQ(T(fromPX(sc)).rgb);float pr=sqrt(max(1.-pow(fa*2.-1.,2.),0.));float gap=smoothstep(0.,.05,fl)*smoothstep(1.,.95,fl);
     col=C*mix(1.,(.5+.6*pr)*(.35+.65*gap),rel)+pow(pr,8.)*.22*rel*(.6+.4*dir.x);}
   return vec4(clamp(col,0.,1.),1.);`],
  'cross-stitch = posterised X stitches per cell on Aida cloth; knitting = V-shaped stitch pairs per cell; embroidery = satin-stitch fill, threads per block along the local edge direction',1);

f = add('Stylize');
f('blockbuild','LEGO Mosaic / Isometric Pixel / Voxelize',[S('Style',['LEGO mosaic','Isometric pixel cubes','Voxelize (extruded)']),P('Size',4,48,14,1,'px'),P('Colors',2,16,6,1),P('Relief / height',0,1,.6,.01)],
  [BH('u_p1*.35'),BV('u_p1*.35'),
   `${photoappsQ}int m=int(u_p0+.5);vec2 p=PX(uv);float s=u_p1;float qn=u_p2;vec3 col;
   if(m==0){vec2 ci=floor(p/s);vec2 q=fract(p/s)-.5;vec3 C=PAQ(sat(T(fromPX((ci+.5)*s)).rgb,1.15));vec2 Ld=vec2(-.7071,.7071);float edge=max(abs(q.x),abs(q.y));
     col=C*(1.+smoothstep(.42,.5,edge)*(dot(q,Ld)>0.?.25:-.35)*u_p3);float r=length(q);float sr=.3;
     if(r>sr&&length(q-vec2(.06,-.06))<sr)col*=1.-.35*u_p3;
     if(r<sr){float rim=smoothstep(sr-.06,sr,r);col=C*(1.06+rim*dot(q/max(r,1e-4),Ld)*.45*u_p3)+vec3(.2)*u_p3*(1.-smoothstep(0.,.12,length(q-vec2(-.12,.12))));}
     col*=1.-.6*smoothstep(.47,.5,edge);}
   else if(m==1){float sc=s*.6;vec2 pp=p/sc;vec2 rr=vec2(1.7320508,3.);vec2 hh=rr*.5;vec2 a=mod(pp,rr)-hh;vec2 b=mod(pp-hh,rr)-hh;vec2 g=dot(a,a)<dot(b,b)?a:b;
     vec3 C=PAQ(T(fromPX((pp-g)*sc)).rgb);bool top=g.y>abs(g.x)*.57735;col=C*(top?mix(1.,1.12,u_p3):g.x<0.?mix(1.,.8,u_p3):mix(1.,.58,u_p3));
     float hexd=max(abs(g.x),abs(g.x)*.5+abs(g.y)*.866);float inner=top?1.:abs(g.x);float tl=abs(g.y-abs(g.x)*.57735)*.866;float ln=min(.866-hexd,min(inner,tl+(g.y<-.01?1.:0.)));col*=mix(1.,.6,(1.-smoothstep(0.,.07,ln))*u_p3);}
   else{float H=u_p3*s*4.;float i=floor(p.x/s);float j0=floor(p.y/s);col=vec3(0.);
     for(int k=6;k>=0;k--){float j=j0-float(k);vec3 C=PAQ(T(fromPX((vec2(i,j)+.5)*s)).rgb);float hh=luma(C)*H;float y0=j*s;
       if(p.y>=y0&&p.y<y0+s+hh){float fx=fract(p.x/s);float ex=min(fx,1.-fx)*s;if(p.y<y0+hh){col=C*(.5+.15*(p.y-y0)/max(hh,1.));col*=ex<1.?.7:1.;}else{float fy=(p.y-y0-hh)/s;float ey=min(fy,1.-fy)*s;col=C*1.05;col*=min(ex,ey)<1.?.75:1.;}break;}}}
   return vec4(clamp(col,0.,1.),1.);`],
  'LEGO = posterised 1×1 plates with shaded studs and cast shadows; isometric = hex-lattice cubes (lit top, mid left, dark right faces); voxelize = per-cell columns extruded by brightness, front faces occluding rows behind');
f('papercutout','Paper Cutout (Layers)',[P('Layers',2,10,5,1),P('Smoothness',1,20,6,1,'px'),P('Shadow',0,1,.6,.01),S('Colors',['From image','Pastel paper','Monochrome card'])],
  [BH('u_p1'),BV('u_p1'),
   `
#define PALAY(qq) min(floor(luma(T(qq).rgb)*N),N-1.)
   float N=floor(u_p0+.5);vec2 p=PX(uv);vec3 sm=T(uv).rgb;float k=PALAY(uv);vec2 ld=vec2(.7071,-.7071);float sh=0.;
   for(int i=1;i<=8;i++){float fi=float(i);float kk=PALAY(uv-ld*fi*R(1.5)*u_px);if(kk>k)sh=max(sh,(1.-fi/9.)*min(kk-k,2.)*.5+.25);}
   float lit=PALAY(uv+ld*R(1.2)*u_px)<k?1.:0.;float tl=(k+.5)/N;int cm=int(u_p3+.5);vec3 col;
   if(cm==0){vec3 hs=rgb2hsv(sm);col=hsv2rgb(vec3(hs.x,hs.y*.8,.25+.75*tl));}else if(cm==1)col=hsv2rgb(vec3(fract(.55+k*.13),.35,.55+.45*tl));else col=vec3(.25+.72*tl)*vec3(1.,.97,.92);
   col*=1.-clamp(sh,0.,1.)*.55*u_p2;col*=1.+.12*lit*u_p2;col*=.95+.05*fbm(p*.2);return vec4(clamp(col,0.,1.),1.);`],
  'smoothed luminance cut into N flat paper layers; brighter layers sit on top and cast offset shadows onto lower ones, lit rim + paper grain',1);

f = add('Retro');
f('glyphart','ASCII Color / Text Portrait',[S('Mode',['ASCII colour (density ramp)','Text portrait: colour on black','Text portrait: ink on paper']),P('Cell height',6,32,11,1,'px'),P('Contrast',0,1,.5,.01),P('Saturation',0,2,1.3,.01)],
  [BH('u_p1*.3'),BV('u_p1*.3'),
   `${photoappsGLYPH}int m=int(u_p0+.5);vec2 p=PX(uv);vec2 cs=vec2(u_p1*.75,u_p1);vec2 ci=floor(p/cs);vec2 fq=fract(p/cs);vec3 C=T(fromPX((ci+.5)*cs)).rgb;float l=luma(C);
   float lc=clamp((l-.5)*(1.+u_p2*2.)+.5,0.,1.);int gi;float wgt;
   if(m==0){gi=26+int(min(lc*14.,13.));wgt=.3;}
   else{const int PH[35]=int[35](19,7,4,16,20,8,2,10,1,17,14,22,13,5,14,23,9,20,12,15,18,14,21,4,17,19,7,4,11,0,25,24,3,14,6);gi=PH[int(mod(ci.x+ci.y*13.,35.))];wgt=mix(-.4,.55,m==1?lc:1.-lc);}
   vec2 gp=vec2(fq.x*6.-.5,(1.-fq.y)*8.-.5);ivec2 gc=ivec2(floor(gp));float d=9.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){int cx=gc.x+i,cy=gc.y+j;if(PAGB(gi,cx,cy)==1){vec2 dq=max(abs(gp-(vec2(float(cx),float(cy))+.5))-.5,0.);d=min(d,length(dq));}}
   float aa=6./max(cs.x,1.);float ink=clamp((wgt-d)/aa+.5,0.,1.);vec3 sc=clamp(sat(C,u_p3)*(m==2?.55:1.25),0.,1.);
   return vec4(m==2?mix(vec3(.97,.95,.9),sc,ink):sc*ink,1.);`],
  'procedural 5×7 bitmap glyphs (no fonts): ASCII = 14-glyph density ramp coloured by the image on black; text portrait = a repeating pangram whose stroke weight follows tone (light text on black, or ink on paper)');
