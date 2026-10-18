/* ================= nik: Nik Color Efex (DxO Nik Collection) filters + Apple Photographic Styles ================= */
/* Controls follow the DxO Nik Collection user guide (Color Efex section); each Nik filter keeps its main controls,
   the generic Shadows / Highlights protection sliders are omitted. All are look approximations of proprietary filters. */
const NIK_LUM = 'float y=luma(o);vec3 hv=rgb2hsv(o);vec2 q=(uv-.5)*vec2(asp(),1.);';
/* hue-band weight: hue h (0..1) around centre cc with half-width ww (wraps) */
const NIK_HB = `
#define NIKHB(h,cc,ww) (1.-smoothstep(0.,(ww),min(abs((h)-(cc)),1.-abs((h)-(cc)))))
`;

/* ---------- 1. colour filters (single pass) ---------- */
f = add('Color');
f('nik_colorfilters','Nik Color Efex: Colour Filters (Bi-Color, Brilliance, Cross Balance, Foliage, Indian Summer, Skylight, Sunlight, Polarization, Reflector)',
  [S('Filter',['Bi-Color Filters','Brilliance / Warmth','Cross Balance','Foliage','Indian Summer','Skylight Filter','Sunlight','Polarization','Reflector Efex']),
   P('Strength',0,1,.8,.01),P('Method or colour set',1,6,1,1),P('Control (shift / warmth / rotate / direction)',-100,100,0,1)],
  `${NIK_HB}vec3 o=c.rgb;${NIK_LUM}int m=int(u_p0+.5);int v=int(u_p2+.5)-1;float ct=u_p3/100.;vec3 x=o;
 if(m==0){
  const vec3 BT[6]=vec3[](vec3(.25,.42,.85),vec3(.5,.3,.8),vec3(.38,.58,.35),vec3(.5,.4,.3),vec3(.2,.38,.8),vec3(.3,.6,.6));
  const vec3 BB[6]=vec3[](vec3(.9,.55,.25),vec3(.9,.42,.6),vec3(.72,.5,.28),vec3(.82,.66,.42),vec3(.98,.6,.15),vec3(.8,.48,.25));
  float t=smoothstep(-.3,.3,uv.y-.5+ct*.45);vec3 fc=mix(BB[v],BT[v],t);x=softLight(o,fc);x=mix(x,x*fc/luma(fc),.25);}
 else if(m==1){float s=hv.y;x=y+(o-y)*(1.+1.1*(1.-s)*(1.-s));x=clamp(x,0.,1.);x*=vec3(1.+.12*ct,1.+.015*ct,1.-.15*ct);}
 else if(m==2){
  const vec3 CG[6]=vec3[](vec3(.8,.92,1.25),vec3(.7,.87,1.4),vec3(.6,.82,1.55),vec3(1.2,1.,.76),vec3(1.32,1.02,.64),vec3(1.45,1.03,.52));
  vec3 l=${LIN('o')};vec3 l2=l*CG[v];l2*=luma(l)/max(luma(l2),1e-4);x=${SRGB('clamp(l2,0.,1.)')};}
 else if(m==3){float w=NIKHB(hv.x,.27,.13)*smoothstep(.06,.25,hv.y);int j=v-3*(v/3);vec3 h2=hv;
  if(j==0){h2.y=min(1.,hv.y*1.45);h2.z=min(1.,hv.z*1.06);}else if(j==1){h2.x=hv.x-.035;h2.y=min(1.,hv.y*1.35);h2.z=min(1.,hv.z*1.1);}else{h2.x=hv.x+.02;h2.y=min(1.,hv.y*1.3);h2.z=hv.z*.85;}
  x=mix(o,hsv2rgb(vec3(fract(h2.x),h2.yz)),w);}
 else if(m==4){const float IT[4]=float[](.1,.075,.045,.125);float w=NIKHB(hv.x,.25,.14)*smoothstep(.05,.2,hv.y);int j=v-4*(v/4);
  vec3 h2=vec3(mix(hv.x,IT[j],w*.9),min(1.,hv.y*(1.+.35*w)),hv.z*(1.+.05*w));x=hsv2rgb(h2);}
 else if(m==5){x=o*vec3(1.035,.985,.9)+vec3(.012,0.,.008);x=mix(vec3(luma(x)),x,1.05);}
 else if(m==6){float tt=.5+.5*ct;vec3 lc=mix(vec3(1.,.93,.84),vec3(1.,.7,.38),tt);vec3 l=${LIN('o')};
  l*=mix(vec3(1.),lc*1.35,smoothstep(0.,.8,y));x=${SRGB('clamp(l,0.,1.)')};x=x*x*(3.-2.*x)*.35+x*.65;x=mix(vec3(luma(x)),x,1.15);}
 else if(m==7){float a=ct*PI*.5;float mal=cos(a)*cos(a);float w=NIKHB(hv.x,.6,.12)*smoothstep(.08,.3,hv.y)*smoothstep(.15,.5,hv.z);
  vec3 h2=vec3(hv.x,min(1.,hv.y*(1.+.5*w*mal)),hv.z*(1.-.3*w*mal));x=hsv2rgb(h2);x=mix(vec3(luma(x)),x,1.+.15*mal);
  x=mix(x,x*x*(3.-2.*x),.25*mal);}
 else{const vec3 RC[3]=vec3[](vec3(1.,.72,.3),vec3(1.,.85,.6),vec3(.92,.96,1.));int j=v-3*(v/3);float a=ct*PI;vec2 d=vec2(-cos(a),sin(a));
  float g=clamp(.5+dot(q,d)*1.2,0.,1.);g*=g;float sh=(1.-y)*(1.-y);x=screen(o,RC[j]*.5*g*sh);}
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`,
  'DxO Nik Color Efex (user guide controls): Bi-Color = graduated two-colour glass filter, 6 colour sets (cool/warm, violet/pink, moss/brown, brown, blue/amber, green/brown), Control = vertical shift; Brilliance / Warmth = perceptual (vibrance-style) saturation + Control warmth; Cross Balance = daylight film under tungsten (methods 1-3, blue) or tungsten film in daylight (4-6, orange), channel gains in linear light with luma kept; Foliage = green-band saturation / yellow-green / deep green methods; Indian Summer = green-yellow hues rotated toward 4 autumn targets; Skylight = warming 1A-style filter cutting blue; Sunlight = warm light of Control temperature in the highlights + contrast + saturation; Polarization = blue-sky band darkened and saturated, Control = filter rotation (Malus cos^2 weighting); Reflector Efex = gold / soft gold / silver fill light added to the shadows from the Control direction; Strength = opacity; approx.');

/* ---------- 2. colour tools (single pass; White Neutralizer measures a 12x12 grid) ---------- */
f('nik_colortools','Nik Color Efex: Colour Tools (Remove Color Cast, White Neutralizer, Color Stylizer, Contrast Color Range, Photo Stylizer, Ink, Paper Toner)',
  [S('Filter',['Remove Color Cast','White Neutralizer','Color Stylizer','Contrast Color Range','Photo Stylizer','Ink','Paper Toner']),
   P('Strength',0,1,.8,.01),P('Colour (hue)',0,360,30,1,'deg'),P('Style or colour set',1,11,1,1)],
  `${NIK_HB}vec3 o=c.rgb;${NIK_LUM}int m=int(u_p0+.5);int v=int(u_p3+.5)-1;float hu=u_p2/360.;vec3 x=o;vec3 hc=hsv2rgb(vec3(hu,1.,1.));
 if(m==0){vec3 cd=hc/luma(hc);x=o/mix(vec3(1.),cd,.22);x*=y/max(luma(x),1e-4);}
 else if(m==1){vec3 a=vec3(0.);float ws=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s=O((vec2(float(i),float(j))+.5)/12.).rgb;float w=smoothstep(.45,.85,luma(s))*(1.-smoothstep(.97,1.,max(s.r,max(s.g,s.b))));a+=s*w;ws+=w;}
  a=ws>.01?a/ws:vec3(1.);vec3 g=luma(a)/max(a,vec3(.02));g=clamp(g,.6,1.6);float wt=v>=1?1.:smoothstep(.3,.85,y);x=o*mix(vec3(1.),g,wt);}
 else if(m==2){vec3 hl=rgb2hsl(o);vec3 t=hsl2rgb(vec3(hu,max(hl.y,.45),hl.z));x=t+(y-luma(t));x=mix(x,x*x*(3.-2.*x),.2);}
 else if(m==3){float w=cos(6.2832*(hv.x-hu));float s=smoothstep(.05,.5,hv.y);x=o*(1.+.4*w*s);}
 else if(m==4){const vec3 PS[10]=vec3[](vec3(.25,.12,.05),vec3(1.,.78,.55),vec3(.05,.15,.3),vec3(.82,.92,1.),vec3(.1,.06,.3),vec3(.95,.85,.9),vec3(.25,.15,.08),vec3(1.,.9,.72),vec3(.02,.2,.15),vec3(.9,1.,.85));
  int j=v-5*(v/5);float t=y;vec3 tn=mix(PS[2*j],PS[2*j+1],smoothstep(0.,1.,t));tn*=y/max(luma(tn),1e-3);x=mix(tn,o*tn/max(y,.02),.35);}
 else if(m==5){const vec3 IK[11]=vec3[](vec3(.1,.15,.35),vec3(.35,.1,.15),vec3(.1,.28,.2),vec3(.3,.18,.08),vec3(.25,.1,.35),vec3(.05,.25,.35),vec3(.4,.25,.05),vec3(.15,.15,.15),vec3(.35,.05,.1),vec3(.1,.2,.05),vec3(.2,.1,.25));
  const vec3 PP[11]=vec3[](vec3(1.,.96,.88),vec3(1.,.93,.85),vec3(.97,.97,.9),vec3(1.,.95,.82),vec3(.98,.95,.97),vec3(.95,.98,1.),vec3(1.,.97,.9),vec3(.97,.95,.9),vec3(1.,.92,.88),vec3(.97,1.,.9),vec3(.95,.93,1.));
  vec3 tn=mix(IK[v],PP[v],smoothstep(.02,.95,y));x=mix(tn,o,.3);x=mix(x,tn*(o/max(y,.03)),.15);}
 else{const vec3 PT[8]=vec3[](vec3(1.,.9,.72),vec3(.98,.82,.62),vec3(.88,.82,.9),vec3(.8,.88,1.),vec3(.85,.95,.82),vec3(1.,.85,.8),vec3(.95,.92,.85),vec3(.9,.78,.6));
  int j=v-8*(v/8);float g=y;float tex=(fbm(PX(uv)*vec2(.6,.15))-.5)*.05;vec3 tc=mix(PT[j]*PT[j],PT[j],g);x=min(g*tc/max(luma(tc),.05),PT[j])+tex;}
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`,
  'DxO Nik Color Efex (user guide controls): Remove Color Cast = divides out the cast of the chosen Colour (hue), luma kept; White Neutralizer = cast of the light (non-clipped) pixels measured on a 12x12 grid, gains applied to the whites (Style 1) or the whole image (Style 2+, "Adjust Whole Image"); Color Stylizer = the chosen colour laid over the image (Color-mode blend: hue of the colour, lightness of the image, saturation at least moderate) + slight contrast; Contrast Color Range = colour-contrast filter: the chosen hue brightened and its complement darkened, scaled by pixel saturation; Photo Stylizer = 5 split-tone styles (1 Copper, 2 Cool Ice, 3 indigo, 4 sepia, 5 emerald; only Copper and Cool Ice names are documented); Ink = 11 ink / paper colour sets with some original colour showing through; Paper Toner = 8 darkroom paper tones on a B&W rendering with faint paper texture; Strength = opacity; approx.');

/* ---------- 3. contrast & detail (blur at Effect radius, then combine) ---------- */
f = add('Tone');
f('nik_contrast','Nik Color Efex: Contrast (Detail Extractor, Dark Contrasts, Pro Contrast, High Key, Low Key)',
  [S('Filter',['Detail Extractor','Dark Contrasts','Pro Contrast','High Key','Low Key']),P('Strength',0,1,.6,.01),P('Effect radius',2,60,14,1,'px'),P('Saturation',-1,1,0,.01)],
  [BH('u_p2'),BV('u_p2'),`vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;float y=luma(o),by=luma(bl);int m=int(u_p0+.5);float k=u_p1;
 float gn=1.+(m==0?2.5:m==1?2.:m==2?1.2:.8)*k;float d=(y-by)*gn/(1.+abs(y-by)*(gn-1.)*3.);float ny=y;vec3 x=o;
 if(m==0){ny=by+d;ny-=(by-.5)*.5*k;}
 else if(m==1){ny=pow(clamp(by+d,0.,1.),1.+.6*k);x=mix(vec3(y),o,1.-.3*k);}
 else if(m==2){vec3 a=vec3(0.);float lo=1.,hi=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s=O((vec2(float(i),float(j))+.5)/12.).rgb;a+=s;float ls=luma(s);lo=min(lo,ls);hi=max(hi,ls);}
  a/=144.;vec3 g=clamp(luma(a)/max(a,vec3(.02)),.8,1.25);x=o*mix(vec3(1.),g,.7*k);float y2=luma(x);
  float ex=d-(y-by);float st=(y2-lo*.8)/max(hi-lo*.8,.3);y=y2;ny=mix(y2,st,.5*k)+ex;}
 else if(m==3){ny=1.-pow(1.-y,1.+1.4*k);ny=mix(ny,.55+(ny-.55)*.75,k)+(d-(y-by));}
 else{ny=pow(y,1.+1.2*k)+(d-(y-by))*y;}
 ny=clamp(ny,0.,1.);x=ny<y?x*ny/max(y,1e-4):x+(ny-y);
 if(m==3)x=screen(x,bl*.4*k*smoothstep(.3,1.,by));if(m==4)x+=bl*smoothstep(.55,1.,by)*.35*k;
 x=clamp(x,0.,1.);float yx=luma(x);x=clamp(yx+(x-yx)*(1.+u_p3),0.,1.);return vec4(x,1.);`],
  'DxO Nik Color Efex (user guide controls; Effect radius = size of the local-contrast surround): detail = luma minus Gaussian surround, amplified with a soft limit (strong edges compressed so fine detail gains most); Detail Extractor = detail amplified and the large-scale tone pulled toward middle grey (local tone balancing); Dark Contrasts = detail boost with denser (darkened, gamma) tones and slightly muted colour; Pro Contrast = automatic colour-cast correction (grey-world on a 12x12 grid) + automatic contrast stretch (grid min / max) + dynamic local contrast; High Key = brightened, flattened tones with soft glow of the light areas; Low Key = darkened tones with glowing highlights; Saturation applied last; approx.');

/* ---------- 4. selective tones (Viveza) ---------- */
f('nik_selectivetones','Nik Viveza: Selective Tones',[P('Highlights',-100,100,-20,1),P('Midtones',-100,100,10,1),P('Shadows',-100,100,30,1),P('Blacks',-100,100,-20,1)],
  `vec3 o=c.rgb;float y=luma(o);float wb=1.-smoothstep(0.,.22,y);float ws=exp(-pow((y-.25)/.14,2.));float wm=exp(-pow((y-.5)/.17,2.));float wh=smoothstep(.55,.95,y);
 float e=(u_p3*wb*.9+u_p2*ws+u_p1*wm*.8+u_p0*wh*.9)/100.;vec3 l=${LIN('o')};l*=exp2(e*1.4);vec3 x=${SRGB('l')};
 float hl=max(x.r,max(x.g,x.b));if(hl>1.)x=mix(x/hl,vec3(1.),clamp(hl-1.,0.,1.)*.5);return vec4(clamp(x,0.,1.),1.);`,
  'DxO Nik Viveza Selective Tones: Highlights / Midtones / Shadows / Blacks each an exposure change (linear light, +/-1.4 EV at 100) weighted by a smooth luma band (blacks <0.22, shadows ~0.25, mids ~0.5, highlights >0.55), colour ratios kept, overflow rolled toward white; approx.');

/* ---------- 5. moods: Midnight / Monday Morning / Duplex (blur + grain) ---------- */
f = add('Stylize');
f('nik_moods','Nik Color Efex: Midnight / Monday Morning / Duplex',
  [S('Filter',['Midnight','Monday Morning','Duplex']),P('Strength',0,1,.85,.01),P('Colour set',1,5,1,1),P('Blur / smear / diffusion',0,40,6,1,'px')],
  [BH('u_p3'),BV('u_p3'),`vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;int m=int(u_p0+.5);int v=int(u_p2+.5)-1;vec3 x=o;
 if(m==0){const vec3 MC[5]=vec3[](vec3(.55,.75,1.25),vec3(.65,1.1,.85),vec3(.9,.7,1.2),vec3(.95,.97,1.05),vec3(1.15,.9,.7));
  vec3 s=mix(o,bl,.55);float yy=luma(s);yy=pow(yy,1.35)*.85;yy=mix(yy,yy*yy*(3.-2.*yy),.5);x=mix(vec3(yy),s*yy/max(luma(s),.01),.3)*MC[v];}
 else if(m==1){const vec3 MM[5]=vec3[](vec3(1.,.98,.95),vec3(1.08,.97,.82),vec3(.92,1.04,.9),vec3(1.02,.92,1.06),vec3(.9,.97,1.08));
  vec3 s=mix(o,bl,.7);vec2 p=PX(uv);float gr=(vnoise(p*.9)+vnoise(p*.45+7.)-1.)*.16;s+=gr*(.4+.6*luma(s));float yy=luma(s);
  x=mix(vec3(yy),s,.5)*MM[v];x=x*.88+.1;x=mix(x,x*x*(3.-2.*x),.15);}
 else{const vec3 DC[5]=vec3[](vec3(.75,.55,.35),vec3(.35,.5,.75),vec3(.45,.65,.45),vec3(.7,.45,.6),vec3(.8,.7,.45));
  float yy=luma(mix(o,bl,.6));vec3 tn=yy<.5?2.*yy*DC[v]:1.-2.*(1.-yy)*(1.-DC[v]);x=mix(o,tn,.55);float yx=luma(x);x=yx+(x-yx)*.85;x=mix(x,x*x*(3.-2.*x),.3);}
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`],
  'DxO Nik Color Efex (user guide controls): Midnight = night-time cinematic look: soft-blurred, darkened, contrasty, mostly desaturated and tinted by the colour set (1 blue, 2 green, 3 violet, 4 neutral, 5 brown); Monday Morning = diffused restful look: heavy smear (blur), soft clumpy grain, half desaturated, lifted blacks, colour sets 1 neutral, 2 warm, 3 green, 4 violet, 5 blue; Duplex = a diffused (blurred) duotone of the chosen colour (1 brown, 2 blue, 3 green, 4 rose, 5 gold) blended over the colour image, slightly desaturated and contrasty; Strength = opacity; approx.', true);

/* ---------- 6. Film Efex (Faded / Nostalgic / Vintage / Modern) ---------- */
/* row (14): 0 exposure EV | 1 contrast | 2 saturation | 3 fade (black lift) | 4 haze (veil toward highlight colour) | 5 temperature | 6 tint |
   7-9 shadow RGB offset | 10-12 highlight RGB offset | 13 vignette ; glow and grain size come from the style */
const NIK_FILM = [
 /* Faded: aged prints */
 [.05,-.35,.65,.1,.15,.25,.05, .02,.01,-.02, .04,.02,-.04, .3],
 [.05,-.3,.6,.08,.12,.05,.35, .04,0,.02, .04,0,.02, .3],
 [0,-.3,.6,.1,.12,-.25,-.05, -.02,.02,.04, 0,.03,.04, .3],
 [0,-.25,.45,.09,.1,.35,.08, .04,.02,-.01, .05,.03,-.02, .35],
 [.05,-.35,.6,.1,.12,.1,-.25, .0,.03,.01, .03,.04,0, .3],
 [.1,-.4,.35,.12,.18,.08,0, .02,.02,.02, .03,.03,.02, .25],
 /* Nostalgic: toy camera, glow */
 [.05,.25,1.25,.04,0,.3,0, .02,0,-.03, .05,.02,-.04, .55],
 [0,.3,1.15,.03,0,.05,-.35, -.02,.03,.04, .05,.05,-.05, .5],
 [0,.2,1.2,.04,0,.05,.35, .04,-.01,.04, .05,0,.02, .5],
 [0,.25,1.1,.04,0,-.35,0, -.02,.01,.05, .01,.03,.04, .5],
 [.05,.2,1.15,.05,0,.45,.05, .03,.01,-.04, .06,.04,-.03, .55],
 [0,.3,1.2,.03,0,0,0, -.03,.02,.05, .06,.03,-.04, .5],
 /* Vintage: early colour film */
 [-.05,.3,1.2,.02,0,.2,0, .01,-.01,-.03, .03,.02,-.03, .35],
 [0,.2,1.05,.03,0,-.3,.05, -.01,0,.04, 0,.02,.03, .3],
 [0,.15,.9,.04,0,.1,-.2, -.02,.03,.02, .03,.03,-.02, .35],
 [.1,-.15,.7,.07,.08,.15,.1, .03,.02,.03, .04,.03,.01, .3],
 [0,.35,1.35,.02,0,.1,.05, .02,-.02,0, .03,.01,-.03, .3],
 [0,.1,.85,.05,.04,.35,.05, .04,.02,-.02, .05,.03,-.03, .35],
 /* Modern: generic film emulations */
 [0,.05,.95,.02,0,.05,0, 0,0,.01, .01,.01,0, 0],
 [.05,0,.9,.03,0,.18,.04, .02,.01,0, .03,.015,-.01, 0],
 [0,.3,1.3,0,0,.02,0, 0,0,.02, .01,.01,0, .1],
 [0,.25,1.15,0,0,-.2,-.03, -.02,0,.03, 0,.01,.02, .1],
 [-.05,.45,1.05,0,0,0,0, 0,0,0, 0,0,0, .1],
 [0,-.1,.7,.04,0,-.05,0, -.01,.02,.02, .03,.02,-.01, .05]];
f = add('Film');
f('nik_filmefex','Nik Color Efex: Film Efex (Faded / Nostalgic / Vintage / Modern)',
  [S('Style',['Faded','Nostalgic','Vintage','Modern']),P('Film type',1,6,1,1),P('Film strength',0,1,1,.01),P('Grain per pixel',0,1,.3,.01)],
  [BH('10.'),BV('10.'),`const float FT[${NIK_FILM.length * 14}]=float[](${NIK_FILM.map(r => r.map(n => (Number.isInteger(n) ? n + '.' : String(n))).join(',')).join(',\n ')});
 int st=int(u_p0+.5);int k=(st*6+int(clamp(u_p1,1.,6.)+.5)-1)*14;vec3 o=O(uv).rgb;vec3 bl=T(uv).rgb;
 vec3 x=o;if(st==1)x=screen(x,bl*smoothstep(.35,1.,luma(bl))*.55);
 vec3 l=${LIN('x')}*exp2(FT[k]);x=clamp(${SRGB('l')},0.,1.);
 x*=vec3(1.+.12*FT[k+5],1.-.06*FT[k+6],1.-.12*FT[k+5]);x.rb*=1.+.035*FT[k+6];x=clamp(x,0.,1.);
 float ct=FT[k+1];vec3 sc=x*x*(3.-2.*x);x=ct>=0.?mix(x,sc,ct):mix(x,.5+(x-.5)*.6,-ct);
 float y=luma(x);x=clamp(y+(x-y)*FT[k+2],0.,1.);y=luma(x);
 x+=vec3(FT[k+7],FT[k+8],FT[k+9])*(1.-y)*(1.-y)*2.+vec3(FT[k+10],FT[k+11],FT[k+12])*y*y*2.;
 x=clamp(x,0.,1.);x=FT[k+3]+x*(1.-FT[k+3]);x=mix(x,vec3(.95,.92,.86),FT[k+4]*(.4+.6*y));
 vec2 q=(uv-.5)*vec2(asp(),1.)/sqrt(asp()*asp()+1.)*2.;x*=1.-FT[k+13]*smoothstep(.3,1.1,length(q));
 x=mix(o,clamp(x,0.,1.),u_p2);
 float gs=st==3?.8:st==1?1.8:1.3;vec2 p=PX(uv)/gs;float gn=(vnoise(p)+vnoise(p*1.9+3.1)-1.)*.75+(hash(floor(PX(uv)))-.5)*.25;
 x+=gn*u_p3*.2*(.35+.65*sqrt(max(luma(x)*(1.-luma(x))*4.,0.)));return vec4(clamp(x,0.,1.),1.);`],
  'DxO Nik Color Efex Film Efex (user guide controls: Film Type, Film Strength 0 % = original colours, Grain per pixel): Faded = aged prints (low contrast, haze veil, black lift, colour fades 1 yellow, 2 magenta, 3 cyan, 4 brown, 5 green, 6 washed-out); Nostalgic = imaginary toy-camera films with glow of the light areas, perceptual saturation and vignette (1 warm, 2 green cross, 3 magenta, 4 cool, 5 golden, 6 teal / orange); Vintage = early colour film looks (1 warm saturated reversal, 2 cool reversal, 3 green-shadow, 4 pastel, 5 rich dye-transfer-like, 6 warm); Modern = generic modern negative / slide emulations (1 neutral neg, 2 warm portrait neg, 3 vivid slide, 4 cool slide, 5 high contrast, 6 low-saturation cine) - not the branded Nik profiles; luma-weighted seeded grain; one data-driven look model; approx.', true);

/* ---------- 7. Darken / Lighten Center ---------- */
f = add('Tone');
f('nik_darkenlighten','Nik Color Efex: Darken / Lighten Center',[S('Shape',['Oval','Circle']),P('Center luminosity',-100,100,25,1),P('Border luminosity',-100,100,-40,1),P('Center size',0,100,40,1)],
  `vec3 o=c.rgb;vec2 q=uv-.5;if(u_p0>.5){q.x*=asp();q/=max(asp(),1.);}float d=length(q)*2.;float r0=u_p3/100.*.9;float w=smoothstep(r0,r0+.55+.3*(1.-r0),d);
 float e=mix(u_p1,u_p2,w)/100.*1.3;vec3 l=${LIN('o')}*exp2(e);vec3 x=${SRGB('l')};float hl=max(x.r,max(x.g,x.b));if(hl>1.)x/=hl;return vec4(clamp(x,0.,1.),1.);`,
  'DxO Nik Color Efex Darken / Lighten Center: Center and Border luminosity as exposure (+/-1.3 EV at 100, linear light) with a smooth radial transition outside the Center size; Shape oval (follows the frame) or circle; centre fixed at the middle (no Place Center); approx.');

/* ---------- 8. Vignette: Blur ---------- */
f = add('Blur');
f('nik_vignetteblur','Nik Color Efex: Vignette Blur',[S('Shape',['Oval','Circle','Rectangle']),P('Blur',1,40,12,1,'px'),P('Size',0,100,45,1),P('Transition',1,100,50,1)],
  [BH('u_p1'),BV('u_p1'),`vec3 o=O(uv).rgb;vec2 q=uv-.5;int sh=int(u_p0+.5);float d;if(sh==1){q.x*=asp();q/=max(asp(),1.);d=length(q)*2.;}else if(sh==2){vec2 a=abs(q)*2.;d=max(a.x,a.y);}else d=length(q)*2.;
 float r0=u_p2/100.;float w=smoothstep(r0,r0+.05+u_p3/100.*.9,d);vec3 b=T(uv).rgb;return vec4(mix(o,b,w),1.);`],
  'DxO Nik Color Efex Vignette: Blur: Gaussian blur faded in outside the Size area over the Transition width, Shape oval / circle / rectangle; one blur type, centre fixed; approx.');

/* ---------- 9. Dynamic Skin Softener (three luma detail bands, skin-hue mask) ---------- */
f = add('Repair');
f('nik_skinsoftener','Nik Color Efex: Dynamic Skin Softener',[P('Color reach',0,100,40,1),P('Small details',0,100,70,1),P('Medium details',0,100,45,1),P('Large details',0,100,20,1)],
  [`vec3 rr=vec3(R(1.5),R(5.),R(14.));vec3 sg=rr*.5;float st=max(1.,rr.z/24.);vec3 acc=vec3(0.),w=vec3(0.);
 for(int i=-24;i<=24;i++){float xx=float(i)*st;if(abs(xx)>rr.z)continue;float v=luma(O(uv+vec2(xx,0.)*u_px).rgb);vec3 g=exp(-xx*xx/(2.*sg*sg));acc+=v*g;w+=g;}
 return vec4(acc/max(w,vec3(1e-6)),1.);`,
   `vec3 rr=vec3(R(1.5),R(5.),R(14.));vec3 sg=rr*.5;float st=max(1.,rr.z/24.);vec3 acc=vec3(0.),w=vec3(0.);
 for(int i=-24;i<=24;i++){float xx=float(i)*st;if(abs(xx)>rr.z)continue;vec3 v=T(uv+vec2(0.,xx)*u_px).rgb;vec3 g=exp(-xx*xx/(2.*sg*sg));acc+=v*g;w+=g;}
 return vec4(acc/max(w,vec3(1e-6)),1.);`,
   `${NIK_HB}vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float y=luma(o);vec3 hv=rgb2hsv(o);float rc=u_p0/100.;
 float mk=NIKHB(hv.x,.055,.035+.09*rc)*smoothstep(.06,.15+.0*rc,hv.y)*(1.-smoothstep(.55+.3*rc,.85+.15*rc,hv.y))*smoothstep(.12,.3,hv.z);
 float d1=y-b.x,d2=b.x-b.y,d3=b.y-b.z;float ny=y-mk*(u_p1/100.*d1+u_p2/100.*d2+u_p3/100.*d3*.8);return vec4(clamp(o+(ny-y),0.,1.),1.);`],
  'DxO Nik Color Efex Dynamic Skin Softener: luma split into fine / medium / large detail bands (differences of Gaussians at 1.5, 5 and 14 px) and each band reduced by its slider inside a skin-colour mask (hue around orange, moderate saturation; Color reach widens the hue / saturation window); skin colour fixed instead of eyedropper-picked; approx.');

/* ---------- 10. Multi-Lens (Analog Efex) ---------- */
f = add('Frames');
f('nik_multilens','Nik Analog Efex: Multi-Lens',[S('Layout',['2 side by side','3 triptych','4 quad grid','4 strip','2 stacked']),P('Zoom',1,3,1.4,.05),P('Pan spread',0,1,.6,.01),P('Divider',0,20,4,1,'px')],
  `int ly=int(u_p0+.5);vec2 n=ly==0?vec2(2.,1.):ly==1?vec2(3.,1.):ly==2?vec2(2.,2.):ly==3?vec2(4.,1.):vec2(1.,2.);
 vec2 cell=floor(uv*n);cell=min(cell,n-1.);vec2 lp=uv*n-cell;
 vec2 pr=vec2(u_res.x/n.x,u_res.y/n.y);float fit=min(u_res.x/pr.x,u_res.y/pr.y);vec2 cs=pr*fit/u_res/u_p1;
 vec2 pc=(cell+.5)/n;vec2 cc=mix(vec2(.5),pc,u_p2);cc=clamp(cc,cs*.5,1.-cs*.5);vec2 su=cc+(lp-.5)*cs;
 vec3 x=O(su).rgb;vec2 ep=min(lp,1.-lp)*pr;float e=min(ep.x,ep.y);float dv=R(u_p3)*.5;x*=step(dv,e);
 if(u_p3>0.){vec2 ed=min(uv,1.-uv)*u_res;if(min(ed.x,ed.y)<dv)x=vec3(0.);}
 return vec4(x,1.);`,
  'DxO Nik Analog Efex Multi-Lens: one image shown in 2-4 panels (diptych, triptych, quad grid, strip, stacked), each panel a crop of the same image at the panel aspect; Zoom crops tighter, Pan spread moves each crop toward its own part of the frame (0 = same view repeated, 1 with Zoom 1 = the frame cut into panels); black dividers; panels are not separately movable; approx.');

/* ---------- 11. Apple Photographic Styles ---------- */
/* row (12): 0 exposure EV | 1 contrast | 2 saturation | 3 temperature | 4 tint (+magenta) | 5 fade | 6 highlight roll-off | 7 mono |
   8-10 undertone RGB offset (midtones, doubled on skin hues) | 11 vibrance */
const NIK_APPLE = [
 ['Standard',      [0,0,1,0,0,0,0,0, 0,0,0, 0]],
 ['Amber',         [0,.05,1.,.2,.05,0,0,0, .035,.012,-.03, 0]],
 ['Gold',          [.05,.05,1.05,.25,-.08,0,0,0, .035,.028,-.045, 0]],
 ['Rose Gold',     [.05,0,1.,.12,.22,0,0,0, .04,-.005,.005, 0]],
 ['Neutral',       [0,0,.95,-.15,0,0,0,0, -.015,0,.018, 0]],
 ['Cool Rose',     [0,0,1.,-.22,.2,0,0,0, .012,-.02,.03, 0]],
 ['Vibrant',       [.05,.1,1.25,.03,0,0,0,0, 0,0,0, .35]],
 ['Natural',       [0,-.05,.92,0,0,.02,.05,0, 0,0,0, .05]],
 ['Luminous',      [.25,-.15,1.05,.05,.03,.03,.25,0, .01,.005,0, .15]],
 ['Dramatic',      [-.15,.4,.85,-.08,0,0,0,0, -.01,0,.012, 0]],
 ['Quiet',         [.08,-.3,.7,.03,0,.08,.15,0, .01,.005,0, 0]],
 ['Cozy',          [-.08,.12,.95,.35,.05,0,0,0, .02,.01,-.02, 0]],
 ['Ethereal',      [.15,-.25,.75,-.05,.18,.07,.2,0, .01,0,.02, 0]],
 ['Muted B&W',     [0,-.2,0,0,0,.07,.1,1, 0,0,0, 0]],
 ['Stark B&W',     [-.05,.6,0,0,0,0,0,1, 0,0,0, 0]],
 ['Rich Contrast', [-.1,.35,1.1,0,0,0,0,0, 0,0,0, .1]],
 ['Warm',          [0,0,1.,.3,.04,0,0,0, .02,.008,-.02, 0]],
 ['Cool',          [0,0,1.,-.3,0,0,0,0, -.01,0,.02, 0]]];
f = add('Insta');
f('apple_photostyles','Apple Photographic Styles (iPhone)',
  [S('Style',NIK_APPLE.map(r => r[0]),15),P('Tone',-100,100,0,1),P('Color',-100,100,0,1),P('Palette',0,100,100,1)],
  `${NIK_HB}const float AT[${NIK_APPLE.length * 12}]=float[](${NIK_APPLE.map(r => r[1].map(n => (Number.isInteger(n) ? n + '.' : String(n))).join(',')).join(',\n ')});
 int k=int(u_p0+.5)*12;vec3 o=c.rgb;float tn=u_p1/100.,cl=u_p2/100.;vec3 hv=rgb2hsv(o);
 vec3 l=${LIN('o')}*exp2(AT[k]);vec3 x=clamp(${SRGB('l')},0.,1.);
 x*=vec3(1.+.1*AT[k+3],1.-.06*AT[k+4],1.-.11*AT[k+3]);x.rb*=1.+.03*AT[k+4];x=clamp(x,0.,1.);
 float y=luma(x);float skin=NIKHB(hv.x,.06,.07)*smoothstep(.1,.25,hv.y)*(1.-smoothstep(.65,.9,hv.y));
 x+=vec3(AT[k+8],AT[k+9],AT[k+10])*2.6*y*(1.-y)*(1.+.6*skin);
 if(AT[k+7]>.5)x=vec3(dot(clamp(x,0.,1.),vec3(.3,.6,.1)));
 float ct=AT[k+1]+.5*tn;x=clamp(x,0.,1.);vec3 sc=x*x*(3.-2.*x);x=ct>=0.?mix(x,sc,min(ct,1.)):mix(x,.5+(x-.5)*.6,min(-ct,1.));
 x=pow(clamp(x,0.,1.),vec3(exp(.35*tn)));
 y=luma(x);float s=max(x.r,max(x.g,x.b))-min(x.r,min(x.g,x.b));float sf=AT[k+2]*(1.+AT[k+11]*(1.-s)*(1.-skin*.7))*(1.+cl*(1.-.3*skin));x=y+(x-y)*sf;
 x=clamp(x,0.,1.);x=AT[k+5]+x*(1.-AT[k+5]);float yy=luma(x);x-=AT[k+6]*smoothstep(.6,1.,yy)*(yy-.6)*.8;
 return vec4(mix(o,clamp(x,0.,1.),u_p3/100.),1.);`,
  'Apple Photographic Styles (iPhone 13-15 Rich Contrast / Vibrant / Warm / Cool; iPhone 16 undertone styles Standard, Amber, Gold, Rose Gold, Neutral, Cool Rose and mood styles Vibrant, Natural, Luminous, Dramatic, Quiet, Cozy, Ethereal, Muted B&W, Stark B&W): one data-driven look (exposure, temperature / tint, midtone undertone offset, stronger on skin hues, S-curve contrast, saturation + vibrance, fade, highlight roll-off, monochrome); Tone = contrast and shadow depth (+ deeper, - lighter / flatter), Color = saturation, Palette = style intensity; Apple renders them scene- and skin-aware in the camera pipeline, these are look approximations from the published intent');
