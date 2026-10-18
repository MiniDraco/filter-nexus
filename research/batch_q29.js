/* ================= q29: in-camera looks (Canon / Fujifilm / Samsung / Casio / Sigma / Leica), Microsoft Office artistic effects, AMD FidelityFX LPM ================= */
const Q29_HB = `
#define HB(HH,CC,WW) exp(-pow(min(abs((HH)-(CC)),1.-abs((HH)-(CC)))/(WW),2.))
`;
f = add('Film');
f('q29_grainybw','Grainy B/W (Canon Creative Filter)',[S('Contrast',['Low','Standard','High'],1),P('Grain',0,1,.45,.01),P('Grain size',1,4,1.6,.05,'px')],
  `int k=int(u_p0+.5);float y=luma(c.rgb);float con=k==0?.8:k==1?1.3:1.85;y=clamp((y-.5)*con+.5,0.,1.);y=mix(y,y*y*(3.-2.*y),.4);
 vec2 p=PX(uv)/u_p2;float g=(vnoise(p)-.5)*.65+(hash(floor(p*1.7))-.5)*.55+(hash(floor(PX(uv)))-.5)*.25;
 float w=.35+2.6*y*(1.-y);return vec4(vec3(clamp(y+g*u_p1*.45*w,0.,1.)),1.);`,
  'Canon Creative Filter "Grainy B/W" (manual: grainy black-and-white, contrast Low / Standard / High), approx.: luma, contrast stretch + S-curve, coarse clumped grain weighted to the midtones', true);

f = add('Stylize');
f('q29_camart','In-Camera Art HDR (Canon Art Bold / Art Embossed, Casio Art HDR, Fujifilm Dynamic Tone)',[S('Mode',['Art Bold (Canon)','Art Embossed (Canon)','Art HDR (Casio)','Dynamic Tone (Fujifilm)']),P('Radius',3,40,12,1,'px'),P('Detail',0,2,1,.01),P('Strength',0,1,1,.01)],
  [BH('u_p1'), BV('u_p1'),
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb,b=T(uv).rgb;vec3 d=(o-b)*u_p2;vec2 e=u_px*max(u_k,1.);
 float gx=luma(O(uv+vec2(e.x,0.)).rgb)-luma(O(uv-vec2(e.x,0.)).rgb),gy=luma(O(uv+vec2(0.,e.y)).rgb)-luma(O(uv-vec2(0.,e.y)).rgb);float g=length(vec2(gx,gy));vec3 x;
 if(m==0){x=.5+(b-.5)*.6+d*2.6;x=sat(x,1.7);x*=1.-.45*smoothstep(.06,.3,g);}
 else if(m==1){x=.5+(b-.5)*.5+d*3.;x=sat(x,.4);x+=(gx-gy)*.9;x*=1.-.6*smoothstep(.05,.25,g);x=mix(vec3(.13,.11,.09),vec3(.9,.88,.84),clamp(x,0.,1.));}
 else if(m==2){x=.5+(b-.5)*.65+d*2.;x=sat(x,1.35);}
 else{x=.5+(b-.5)*.45+d*1.8;x=sat(x,1.25);x=mix(x,x*x*(3.-2.*x),.25);}
 return vec4(mix(o,clamp(x,0.,1.),u_p3),1.);`],
  'approx. look re-creations from the manuals: local tone compression (Gaussian base flattened, detail = image - base boosted). Art Bold: most saturated, oil-painting-like with dark outlines; Art Embossed: saturation, brightness and contrast lowered (flat, faded, old) with heavily emphasised outlines and relief; Casio Art HDR: strong local contrast + colour; Fujifilm Dynamic Tone: "dynamic tone expression for a fantasy effect" (strong tone compression)');

f = add('Color');
f('q29_colorchrome','Color Chrome Effect / FX Blue (Fujifilm)',[S('Color Chrome Effect',['Off','Weak','Strong'],2),S('Color Chrome FX Blue',['Off','Weak','Strong'],2),P('Strength',0,1,1,.01)],
  Q29_HB+`vec3 h=rgb2hsv(c.rgb);float ch=h.y*h.z;float wb=HB(h.x,.61,.08);
 float w=u_p0*.5*smoothstep(.2,.75,ch)+u_p1*.5*wb*smoothstep(.08,.45,ch);h.z=pow(h.z,1.+.9*w);h.y=min(1.,h.y*(1.+.12*w));
 return vec4(mix(c.rgb,hsv2rgb(h),u_p2),1.);`,
  'approx.: Fujifilm describes Color Chrome Effect as adding depth and gradation to highly saturated colours (reds, yellows, greens) and FX Blue as the same for blues; here value is darkened by a power curve weighted by chroma (and by a blue-hue band for FX Blue), saturation slightly raised');

f('q29_camstyle','Camera Picture Styles (Canon Faithful / Fine Detail, Samsung Forest / Calm, Casio Vivid Landscape)',[S('Style',['Faithful (Canon)','Fine Detail (Canon)','Forest (Samsung)','Calm (Samsung)','Vivid Landscape (Casio)']),P('Strength',0,1,1,.01)],
  Q29_HB+`int m=int(u_p0+.5);vec3 x=c.rgb;vec3 h=rgb2hsv(x);
 if(m==0){x=sat(x,.84);x=mix(x,x*x*(3.-2.*x),-.18);}
 else if(m==1){vec2 e=u_px*max(u_k,1.);vec3 bl=(O(uv+vec2(e.x,0.))+O(uv-vec2(e.x,0.))+O(uv+vec2(0.,e.y))+O(uv-vec2(0.,e.y))).rgb*.25;x=sat(x+(x-bl)*1.3,1.06);}
 else if(m==2){float w=HB(h.x,.33,.12)+.6*HB(h.x,.5,.1);h.x=fract(h.x+.03*HB(h.x,.22,.06));h.y=min(1.,h.y*(1.+.5*w));h.z*=1.-.1*w;x=hsv2rgb(h)*vec3(.97,1.,1.02);}
 else if(m==3){x=sat(x,.35);x=mix(vec3(.07),vec3(.95),x)*vec3(.98,1.,1.02);}
 else{float w=HB(h.x,.6,.1)+HB(h.x,.33,.12);h.y=min(1.,h.y*(1.25+.3*w));x=hsv2rgb(h);x=mix(x,x*x*(3.-2.*x),.25);}
 return vec4(mix(c.rgb,clamp(x,0.,1.),u_p1),1.);`,
  'approx. from the manufacturers\' descriptions: Canon Faithful = colorimetric, low saturation / soft contrast, no sharpening; Canon Fine Detail = fine 1-px sharpening; Samsung Forest = emphasised greens; Samsung Calm = strongly desaturated, soft; Casio Vivid Landscape = vivid sky blues and greens');

f('q29_sigmamode','Sigma Color Modes',[S('Mode',['FOV Classic Blue','FOV Classic Yellow','Cinema','Warm Gold','Sunset Red','Forest Green','Powder Blue']),P('Strength',0,1,1,.01)],
  Q29_HB+`int m=int(u_p0+.5);vec3 x=c.rgb;vec3 h=rgb2hsv(x);
 if(m==0){float w=HB(h.x,.6,.08);h.x=mix(h.x,.63,.3*w);h.y=min(1.,h.y*(1.+.6*w));h.z*=1.-.22*w*h.y;x=hsv2rgb(h);x=mix(x,x*x*(3.-2.*x),.12);}
 else if(m==1){float wy=HB(h.x,.14,.08),wb=HB(h.x,.6,.1);h.x=fract(h.x-.05*wb);h.y=min(1.,h.y*(1.+.35*wy));x=hsv2rgb(h)*vec3(1.04,1.02,.9);}
 else if(m==2){x=sat(x,.6);x=pow(x,vec3(1.15))*vec3(1.04,1.01,.85);x=mix(vec3(.01),vec3(.95),x);}
 else if(m==3){x=sat(x,.8);x=mix(x,x*x*(3.-2.*x),-.2)*vec3(1.07,1.,.86);}
 else if(m==4){float w=HB(h.x,0.,.08)+HB(h.x,.07,.05)+HB(h.x,.9,.07);h.y=min(1.,h.y*(1.+.4*w));x=hsv2rgb(h)*vec3(1.08,.97,.95);}
 else if(m==5){x=sat(x,1.25);x=mix(x,x*x*(3.-2.*x),.35);h=rgb2hsv(clamp(x,0.,1.));float w=HB(h.x,.3,.1);h.y=min(1.,h.y*(1.+.3*w));h.z=min(1.,h.z*(1.+.06*w));x=hsv2rgb(h);}
 else{x=pow(x,vec3(.8));x=sat(x,.85)*vec3(.95,1.,1.07)+vec3(0.,.01,.03);}
 return vec4(mix(c.rgb,clamp(x,0.,1.),u_p1),1.);`,
  'approx. from the SIGMA Color Mode Library descriptions: FOV Classic Blue = deep SD9-style blue skies; FOV Classic Yellow = warm yellows, blues leaning cyan; Cinema = yellow cast, muted saturation, deeper shadows; Warm Gold = mellow, subdued, warm; Sunset Red = reddish tint, reddish-purple to orange gradation; Forest Green = slide-film punch, fresh greens; Powder Blue = lifted midtones, crisp blue tint');

f('q29_leicalook','Leica Looks',[S('Look',['Leica Classic','Leica Contemporary','Leica Eternal','Leica Chrome']),P('Strength',0,1,1,.01)],
  `int m=int(u_p0+.5);vec3 x=c.rgb;
 if(m==0){x=sat(x,.78);x=mix(x,x*x*(3.-2.*x),.45);x=mix(vec3(.05,.04,.035),vec3(.97,.95,.9),x)*vec3(1.04,1.,.92);}
 else if(m==1){x=x+.5*x*(1.-x)*(1.-x);x=sat(x,.97)*vec3(1.04,.99,.98);}
 else if(m==2){x=sat(x,1.3);x=mix(x,x*x*(3.-2.*x),.5)*vec3(1.03,.95,1.03);}
 else{x=sat(x,.66);x=mix(x,x*x*(3.-2.*x),.15)*vec3(.99,1.,1.01);}
 return vec4(mix(c.rgb,clamp(x,0.,1.),u_p1),1.);`,
  'approx. from Leica\'s Leica Looks descriptions: Classic = high contrast, soft saturation, warm slightly washed-out cinema colours; Contemporary = bright shadows, natural colours, slight reddish tint; Eternal = strong contrast, bold saturation, magenta tint; Chrome = muted palette, subtle contrasts');

f = add('Paint');
f('q29_office_sketch','Office Artistic Effects: Sketch (Cement / Chalk Sketch / Crisscross Etching / Light Screen / Line Drawing / Pencil Grayscale)',[S('Effect',['Cement','Chalk Sketch','Crisscross Etching','Light Screen','Line Drawing','Pencil Grayscale']),P('Transparency',0,1,0,.01),P('Pressure or size',0,1,.5,.01)],
  `
#define LO(q) luma(O(q).rgb)
int m=int(u_p0+.5);vec3 o=c.rgb;float y=luma(o);vec2 p=PX(uv);float pr=u_p2;vec2 e=u_px*max(u_k,1.)*(1.+pr*2.);
 float gx=LO(uv+vec2(e.x,0.))-LO(uv-vec2(e.x,0.)),gy=LO(uv+vec2(0.,e.y))-LO(uv-vec2(0.,e.y));float g=length(vec2(gx,gy));
 float st=vnoise(vec2((p.x+p.y)*.06,(p.y-p.x)*.8))*.6+vnoise(vec2((p.x+p.y)*.15,(p.y-p.x)*1.9))*.4;vec3 x;
 if(m==0){float n=fbm(p*.07)*.7+hash(floor(p))*.3;x=mix(vec3(.6,.59,.55),sat(o,.3),.55)*(.78+.4*n)+(gx-gy)*(.35+.9*pr)+.06*(1.-step(.12,n*hash(floor(p/2.))));}
 else if(m==1){float cov=smoothstep(.2,.85,(1.-y)*.7+.3+(st-.5)*1.1);x=mix(vec3(.94,.93,.9),clamp(sat(o,1.25)*1.12,0.,1.),cov);x*=1.-.5*smoothstep(.1,.4,g*(1.+pr));}
 else if(m==2){float dk=1.-y,sp=5.+pr*8.;vec3 ink=o*.4;vec3 pap=mix(vec3(.96,.94,.89),o,.3);
  float l1=step(.25,dk)*step(abs(fract((p.x+p.y)/sp)-.5)*2.,.1+.3*dk),l2=step(.5,dk)*step(abs(fract((p.x-p.y)/sp)-.5)*2.,.08+.25*dk),l3=step(.85,dk)*step(abs(fract(p.y/sp)-.5)*2.,.2);
  x=mix(pap,ink,max(l1,max(l2,l3)));}
 else if(m==3){float gs=4.+pr*16.;vec2 f=abs(fract(p/gs)-.5)*2.;float gl=smoothstep(.75,.95,max(f.x,f.y));x=mix(o*.88+.09,vec3(.96),gl*.45);}
 else if(m==4){float ed=smoothstep(.04,.3,g*(1.+pr*1.5));x=vec3(.97-.72*ed)+(hash(floor(p))-.5)*.03;}
 else{float dk=1.-y;float sh=dk*(.55+.45*st);x=vec3(clamp(.96-sh*.85-.6*smoothstep(.08,.35,g*(1.+pr)),0.,1.))+(hash(floor(p))-.5)*.04;}
 return vec4(mix(clamp(x,0.,1.),o,u_p1),1.);`,
  'Microsoft Office picture artistic effects (approx. look re-creations of the documented effects; Transparency as in Office): Cement = image moulded in rough concrete; Chalk Sketch = colour chalk strokes; Crisscross Etching = cross-hatched etching in image colours; Light Screen = soft light grid screen (size); Line Drawing = pencil line art (pencil size); Pencil Grayscale = grey pencil shading strokes', false);

f('q29_office_paint','Office Artistic Effects: Paint (Mosaic Bubbles / Paint Strokes / Pastels Smooth / Watercolor Sponge / Paint Brush)',[S('Effect',['Mosaic Bubbles','Paint Strokes','Pastels Smooth','Watercolor Sponge','Paint Brush']),P('Transparency',0,1,0,.01),P('Size',2,20,8,.5,'px'),P('Pressure',0,1,.5,.01)],
  `
#define LO(q) luma(O(q).rgb)
int m=int(u_p0+.5);vec3 o=c.rgb;vec2 p=PX(uv);float sz=u_p2,pr=u_p3;vec3 x;
 if(m==0){vec2 cp=p/sz,ic=floor(cp);float bd=9.;vec2 bc=vec2(0.),bo=vec2(0.);float br=1.;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ic+vec2(float(i),float(j));vec2 ct=cc+.2+.6*hash2(cc);float rr=.55+.3*hash(cc+7.);float dd=length(cp-ct)/rr;if(dd<bd){bd=dd;bc=ct;br=rr;bo=(cp-ct)/rr;}}
  x=O(fromPX(bc*sz)).rgb;x=x*(1.05-.3*pr*bd*bd)+.35*pr*smoothstep(.75,1.,bd)*smoothstep(1.15,.95,bd)+.25*smoothstep(.22,0.,length(bo-vec2(-.35,.35)));x*=mix(1.,.55,smoothstep(1.,1.12,bd));}
 else if(m==1||m==4){vec2 e=u_px*max(u_k,1.)*sz*.5;vec2 gr=vec2(LO(uv+vec2(e.x,0.))-LO(uv-vec2(e.x,0.)),LO(uv+vec2(0.,e.y))-LO(uv-vec2(0.,e.y)));
  vec2 cel=floor(vec2(p.x+p.y,p.y-p.x)*.7071/vec2(sz*2.2,sz*.8));float an=atan(gr.x,-gr.y)+(hash(cel)-.5)*(m==1?1.2:.5);if(length(gr)<.02)an=.8+(hash(cel)-.5)*.8;vec2 dr=vec2(cos(an),sin(an));
  vec3 acc=vec3(0.);for(int k=-5;k<=5;k++){acc+=O(uv+dr*float(k)*sz*.25*u_px*u_k+(hash2(cel)-.5)*sz*u_px*u_k*.3).rgb;}x=acc/11.;
  float br=vnoise(vec2(dot(p,vec2(-dr.y,dr.x))*(m==1?.9:.6),dot(p,dr)*.05));x*=1.+(br-.5)*.25*pr;if(m==4)x=mix(x,O(uv+(vec2(vnoise(p*.2),vnoise(p*.2+9.))-.5)*sz*u_px*u_k).rgb,.3);}
 else if(m==2){x=kuwa(uv,min(sz*.6,8.));x=mix(sat(x,.85),vec3(1.),.14)+(fbm(p*.25)-.5)*.06*(1.+pr);}
 else{x=kuwa(uv,min(sz*.5,8.));x=sat(x,1.15);float sp=fbm(p*.12+3.);x=mix(x,vec3(.97),.35*smoothstep(.55,.75,sp)*pr*1.4);vec2 e=u_px*max(u_k,1.)*1.5;float ed=length(vec2(LO(uv+vec2(e.x,0.))-LO(uv-vec2(e.x,0.)),LO(uv+vec2(0.,e.y))-LO(uv-vec2(0.,e.y))));x*=1.-.35*smoothstep(.05,.3,ed);}
 return vec4(mix(clamp(x,0.,1.),o,u_p1),1.);`,
  'Microsoft Office picture artistic effects (approx. look re-creations; Transparency as in Office): Mosaic Bubbles = jittered round bubble cells with rim + highlight; Paint Strokes = short strokes smeared along the edge flow, per-cell jitter; Pastels Smooth = Kuwahara-smoothed, lightened soft pastel; Watercolor Sponge = smoothed colour with sponge blotches and darkened edges; Paint Brush = longer flow-aligned brush smears with bristle texture and fuzzy edges');

f = add('Tone');
f('q29_lpm','FidelityFX LPM (Luma Preserving Mapper)',[P('Input peak (HDR max)',1,64,8,.5),P('Exposure',-2,6,1,.05,'EV'),P('Contrast',-.5,1,.25,.01),P('Saturation',-1,1,0,.01)],
  `vec3 lin=${LIN('c.rgb')};vec3 col=lin*u_p0;float hm=u_p0,con=u_p2+1.,cs=con;float mi=hm*.18*exp2(-u_p1),mo=.18;
 float z0=-pow(mi,con),z1=pow(hm,cs)*pow(mi,con),z2=pow(hm,con)*pow(mi,cs)*mo,z3=pow(hm,cs)*mo,z4=pow(mi,cs)*mo;
 float A=-((z0+(mo*(z1-z2))/(z3-z4))/z4),B=(z1-z2)/(z3-z4);vec3 lw=vec3(.2126,.7152,.0722);
 float mx=max(max(col.r,col.g),col.b);vec3 ra=pow(col/max(mx,1e-6),vec3(max(u_p3+con,.05)));
 float l=pow(max(dot(col,lw),1e-6),con);l=l/(l*A+B);
 vec3 x=clamp(ra*clamp(l/max(dot(ra,lw),1e-6),0.,1.),0.,1.);vec3 cap=vec3(1.,.5,1./32.)*(1.-x);
 float la=clamp(l-dot(x,lw),0.,1.);x=clamp(x+cap*la/max(dot(cap,lw),1e-6),0.,1.);la=clamp(l-dot(x,lw),0.,1.);x=clamp(x+la,0.,1.);
 return vec4(${SRGB('x')},1.);`,
  'AMD FidelityFX LPM port (ffx_lpm.h, MIT): sRGB image lifted to linear HDR (x HDR max); LpmSetup tone curve f(L) = L^c / (A L^c + B) with midIn = hdrMax 0.18 2^-exposure -> 0.18 and hdrMax -> 1, c = contrast + 1; colour ratios (rgb / max) raised to saturation + c; target-luma scaling, crosstalk {1, 1/2, 1/32} over-exposure hue shaping; Rec.709 luma, non-soft path, no gamut conversion; final residual luma added equally to channels (approx.)');
