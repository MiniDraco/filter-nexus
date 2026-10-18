/* ================= q20b: game art-style emulations, Godot Shaders ports, darktable color equalizer / spektrafilm ================= */
f = add('Retro');
f('q20_game_mono','Game Looks: Obra Dinn / Pip-Boy / MadWorld / Limbo / Kurosawa Mode',
  [S('Look',['Obra Dinn 1-bit dither','Pip-Boy green terminal','MadWorld B and W with red','Limbo monochrome grain','Kurosawa mode (Ghost of Tsushima)']),P('Contrast',.3,2.5,1,.01),P('Pixel / grain size',1,6,2,1,'px'),P('Grain',0,1,.5,.01)],
  `int m=int(u_p0+.5);float Ct=u_p1,Sc=u_p2,Gn=u_p3;vec2 Pp=PX(uv);vec3 col;vec2 sd=vec2(u_seed*1.37,u_seed*.71);vec2 vq=(uv-.5)*vec2(asp(),1.);float vr=length(vq);
  if(m==0){vec2 cel=floor(Pp/Sc);vec3 s=O(fromPX((cel+.5)*Sc)).rgb;float l=luma(s);float mean=blurL(uv,6.*u_k);l=clamp((l-mean)*Ct*.9+l*.35+mean*.55+.06,0.,1.);
    float th=mix(bayer8(cel),hash(cel+sd),.3);float bit=step(th,l);vec2 g=sobelD(fromPX((cel+.5)*Sc),max(Sc*u_k,1.));float ed=step(.8,length(g));if(ed>.5)bit=l>.5?0.:1.;
    col=mix(vec3(.20,.20,.16),vec3(.90,.89,.80),bit);}
  else if(m==1){vec2 cel=floor(Pp/Sc);float l=luma(O(fromPX((cel+.5)*Sc)).rgb);l=mix(l,blurL(uv,2.5*u_k),.35);l=clamp((l-.45)*Ct*1.2+.5,0.,1.);
    float scan=.72+.28*pow(sin(Pp.y*3.1416/(Sc*1.5)),2.);float vig=1.-.55*pow(vr*1.25,2.6);float nz=(hash(Pp+sd)-.5)*.08*Gn;
    col=mix(vec3(0.,.035,.015),vec3(.10,1.,.50),l)*scan*vig+vec3(.6,1.,.8)*pow(l,6.)*.25+nz*vec3(.1,1.,.5);}
  else if(m==2){vec3 o=O(uv).rgb;float l=luma(o);vec3 hv=rgb2hsv(o);float hd=min(hv.x,1.-hv.x);float red=smoothstep(.45,.65,hv.y)*(1.-smoothstep(.02,.05,hd))*smoothstep(.12,.3,hv.z);
    float th=mix(.42,blurL(uv,5.*u_k),.6);float w=.06/Ct;float bw=smoothstep(th-w,th+w,l);float e=length(sobel(uv));bw*=1.-smoothstep(.3,.6,e);
    col=mix(vec3(bw),vec3(.78,0.,0.)*(.45+.75*hv.z),red);}
  else if(m==3){float l=luma(O(uv).rgb);float hz=blurL(uv,5.*u_k);l=mix(l,hz,.35);l=smoothstep(0.,1.,clamp((l-.5)*Ct*1.3+.5,0.,1.));l=pow(l,1.25)*.82+.07;
    float vig=clamp(1.-.85*pow(vr*1.35,2.4),0.,1.);vec2 gc=floor(Pp/Sc);float gr=(hash(gc+sd)+hash(gc+sd+3.1)-1.)*Gn*.16;col=vec3(clamp(l*vig+gr,0.,1.));}
  else{vec3 o=O(uv).rgb;float l=dot(o,vec3(.30,.59,.11));l=mix(l,blurL(uv,1.5*u_k),.2);l=clamp((l-.48)*Ct*1.35+.5,0.,1.);l=l*l*(3.-2.*l);
    vec2 gc=floor(Pp/max(Sc*.6,1.));float gr=(hash(gc+sd)+hash(gc+sd+7.7)-1.)*Gn*.13*(.4+.6*(1.-abs(2.*l-1.)));float vig=1.-.35*pow(vr*1.3,2.2);
    float scr=0.;for(int i=0;i<4;i++){float x=hash(vec2(float(i),3.)+sd);scr+=(1.-smoothstep(.0,.0012,abs(uv.x-x)))*step(.5,hash(vec2(float(i),9.)+sd))*(.5+.5*vnoise(vec2(x*50.,uv.y*8.)));}
    col=vec3(clamp(l*vig+gr+scr*.12*Gn,0.,1.))*vec3(1.,.99,.97);}
  return vec4(clamp(col,0.,1.),1.);`,
  'game look approximations (honest stand-ins, not the games\' renderers): Obra Dinn (Lucas Pope) = luminance at a coarse pixel grid, local-contrast boost, threshold against a Bayer 8x8 mixed with noise (Pope blended Bayer and blue noise), edge lines inverted, 2-colour palette (dark olive / pale cream; the game offers several monitor palettes); Pip-Boy = Fallout green phosphor monochrome (#1AFF80-like), soft bloom, scanlines, vignette, noise; MadWorld = hard black and white against the local mean with ink outlines, only reds kept as saturated blood red; Limbo = greyscale with fog haze, crushed S-curve, heavy vignette and coarse film grain; Kurosawa mode = black and white film (0.30 / 0.59 / 0.11), S-curve, tone-dependent grain, mild vignette and faint vertical scratches', true);

f = add('Stylize');
f('q20_game_ink','Game Looks: Borderlands / Moebius (Sable) / Spider-Verse / Cuphead',
  [S('Look',['Borderlands ink cel','Moebius line (Sable)','Spider-Verse misregistration','Cuphead 1930s cartoon']),P('Line weight',.5,4,1.5,.1,'px'),P('Strength',0,1,.7,.01),P('Offset / grain',0,10,3,.1,'px')],
  [`vec3 s=vec3(0.);float w=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j));vec3 q=O(uv+o*u_px*u_k*1.5).rgb;vec3 dq=q-c.rgb;float wt=exp(-dot(dq,dq)*30.-dot(o,o)/8.);s+=q*wt;w+=wt;}return vec4(s/w,1.);`,
  `int m=int(u_p0+.5);float Lw=u_p1,St=u_p2,Of=u_p3;vec2 Pp=PX(uv);vec3 b=T(uv).rgb;vec3 col;vec2 sd=vec2(u_seed*1.37,u_seed*.71);
  float e=length(sobelD(uv,max(Lw*u_k,1.)));float ink=smoothstep(.22,.5,e);vec3 hv=rgb2hsv(b);float v=hv.z;
  if(m==0){float q=floor(v*4.)/3.;hv.z=mix(v,.12+.88*q,St);hv.y=min(hv.y*(1.+.4*St),1.);col=hsv2rgb(hv);float hh=abs(fract((Pp.x+Pp.y)/(3.+Lw*1.5))-.5);
    col*=1.-.8*(1.-smoothstep(.08,.18,hh))*St*(1.-smoothstep(.15,.4,v));ink=smoothstep(.18,.4,length(sobelD(uv,max(Lw*1.6*u_k,1.))));col=mix(col,vec3(.02),ink);}
  else if(m==1){float q=floor(v*3.)/2.;hv.z=mix(v,.42+.55*q,St);hv.y*=.7;col=hsv2rgb(hv);col=mix(col,col*vec3(1.02,1.,.94)+.04,.5*St);
    float hh=abs(fract(Pp.y/(2.+Lw))-.5);col*=1.-.55*(1.-smoothstep(.1,.2,hh))*St*(1.-smoothstep(.25,.38,v));ink=smoothstep(.15,.35,length(sobelD(uv,max(Lw*.7*u_k,1.))));col=mix(col,vec3(.08,.06,.05),ink*.95);}
  else if(m==2){vec2 o1=fromPX(vec2(Of,0.)),o2=fromPX(vec2(-Of*.6,-Of*.45));col=vec3(T(uv+o1).r,b.g,T(uv+o2).b);col=sat(col,1.+.5*St);
    float cs=4.+Lw*1.5;vec2 r_=rot(Pp,.785)/cs;vec2 dc=fract(r_)-.5;float dk=1.-luma(b);float rad=sqrt(clamp(dk-.25,0.,1.))*.62;float dot_=1.-smoothstep(rad-.06,rad+.06,length(dc));
    col*=1.-.45*dot_*St;float hh=abs(fract((Pp.x-Pp.y)/(3.+Lw))-.5);col*=1.-.7*(1.-smoothstep(.06,.14,hh))*St*(1.-smoothstep(.12,.25,v));col=mix(col,vec3(.03,.02,.06),ink);}
  else{col=sat(b,.6)*vec3(1.06,.97,.78)+vec3(.05,.035,0.);col=mix(col,smoothstep(0.,1.,col),.5);col=mix(col,vec3(.13,.08,.05),ink*.85);
    float vig=1.-.6*St*pow(length((uv-.5)*vec2(asp(),1.))*1.35,2.4);vec2 gc=floor(Pp/max(Of*.5,1.));float gr=(hash(gc+sd)+hash(gc+sd+4.4)-1.)*.12*St;
    vec2 dcel=floor(Pp/18.);float dust=step(.985,hash(dcel+sd))*(1.-smoothstep(.5,1.6,length(Pp-(dcel+hash2(dcel+sd+2.))*18.)));col=col*vig+gr;col=mix(col,hash(dcel+sd+5.)<.5?vec3(.1,.07,.04):vec3(.95,.9,.8),dust*St);}
  return vec4(clamp(col,0.,1.),1.);`],
  'game look approximations: Borderlands = colour-preserving 4-band cel shading of a bilateral-smoothed image, thick black outlines, diagonal ink hatching in the darks; Moebius line as in Sable = flattened pastel 3-band colour, thin uniform dark line, fine parallel hatching in the shadows; Spider-Verse = red and blue plates misregistered by Offset, 45 deg halftone dots in the midtones, Kirby-style hatching in the deep shadows, dark ink lines; Cuphead = 1930s Fleischer-style cartoon print: desaturated warm palette, soft brown ink lines, film grain, dust specks and heavy vignette (single frame, no flicker)', true);

f = add('Depth');
f('q20_depth_game','Doom COLORMAP Light Diminishing / Sci-Fi Scanner Pulse (Godot)',
  [S('Effect',['Doom COLORMAP light diminishing','Sci-Fi Scanner Pulse (Godot)']),P('Sector light / radius',0,1,.65,.01),P('Distance range / width',0,1,.5,.01),P('Palette / strength',0,1,.7,.01)],
  `int m=int(u_p0+.5);float d=D(uv);vec3 col;
  if(m==0){float ln=floor(u_p1*15.+.5);float sm=(15.-ln)*4.;float z=1.+(1.-d)*(1.+u_p2*30.);float j=min(47.,floor(47./z));float idx=clamp(sm-floor(j*.5),0.,31.);
    float lv=mix(48.,5.,u_p3);vec2 Pp=PX(uv);vec2 cel=floor(Pp*u_k/max(u_res.y/200.,1.));vec3 o=O(fromPX((cel+.5)*max(u_res.y/200.,1.)/u_k)).rgb;
    vec3 dk=o*(1.-idx/32.);col=floor(dk*lv+.5)/lv;}
  else{float z=1.+(1.-d)*9.;vec3 wp=vec3((uv-.5)*vec2(asp(),1.)*z*.8,z);float dist=length(wp)-(1.+u_p1*6.);float pw=.1+u_p2*2.;
    float chk=(dist<0.&&dist>-pw)?1.:0.;float mr=clamp(chk-abs(dist)/pw,0.,1.);col=mix(c.rgb,vec3(1.),mr*u_p3);}
  return vec4(clamp(col,0.,1.),1.);`,
  'Doom (1993) wall lighting from the released source (r_main.c): lightnum = sector light / 16, startmap = (15 - lightnum) x 4, colormap index = clamp(startmap - scale / 2, 0, 31) with the wall scale index j = 0..47 falling as 1 / distance (distance from the depth map, range by param), output = colour x (1 - index / 32) at 320 x 200-like pixel size; PLAYPAL re-quantisation approximated by per-channel quantisation (Palette). Godot Shaders Sci-Fi Scanner Pulse (Michael Watt, CC0): world position from depth, sphere SDF around the origin, mix ratio = inside-band check - |dist| / pulse_width, mixed toward the pulse colour (white, the shader default); world scale from depth is approx.');

f = add('Retro');
f('q20_godot_screen','Godot Shaders: Damage Hurt Edge / Line Pattern Cell Shading / Analog Monochrome Monitor',
  [S('Shader',['Damage Hurt (blood-red screen edge)','Line pattern cell shading','Analog Monochrome Monitor']),P('Size / depth / pixel size',0,1,.45,.01),P('Softness / thickness / opacity',0,1,.6,.01),P('Pulse phase / contrast',0,1,.5,.01)],
  `
#define Q20_RND(co) fract(sin(dot((co),vec2(12.9898,78.233)))*43758.5453)
  int m=int(u_p0+.5);vec2 Pp=PX(uv);vec3 col;
  if(m==0){vec2 UV=vec2(uv.x,1.-uv.y);vec2 ed=min(UV,1.-UV);float edge=min(ed.x,ed.y);float size=u_p1*.5;float soft=u_p2;
    vec2 pq=UV*6.;vec2 ip=floor(pq),fp=fract(pq);vec2 uu=smoothstep(0.,1.,fp);float n=mix(mix(Q20_RND(ip),Q20_RND(ip+vec2(1.,0.)),uu.x),mix(Q20_RND(ip+vec2(0.,1.)),Q20_RND(ip+vec2(1.,1.)),uu.x),uu.y);
    edge+=(n-.5)*.35*size;float ss=size*(1.-soft);float vig=clamp(1.-smoothstep(ss,size,edge),0.,1.);float pulse=.5+.5*(sin(u_p3*6.2832)*.5+.5);
    vec3 mc=vec3(.55,0.,0.)*(.85+.3*n);col=mix(c.rgb,mc,vig*pulse*.85);}
  else if(m==1){float gv=dot(c.rgb,vec3(.299,.587,.114));float th=floor(1.+u_p2*15.);if(mod(floor(Pp.x+Pp.y),2.*th)<th)gv-=u_p1*.1;
    float k=floor(clamp(gv,0.,.999)*4.);col=k<.5?vec3(.11,.09,.20):k<1.5?vec3(.36,.20,.42):k<2.5?vec3(.85,.45,.35):vec3(.98,.90,.72);}
  else{float ps=.002+u_p1*.02;vec2 pu=floor(uv/ps)*ps;vec3 c1=O(pu).rgb;float gv=.21*c1.r+.72*c1.g+.07*c1.b;gv=(gv-.5)*max(u_p3*4.,0.)+.5;
    vec2 tc=fract(uv/ps)-.5;float tl=1.-smoothstep(.1,.5,length(tc));float hm=gv+tl>=1.?1.:0.;float fv=mix(gv,hm,u_p2);col=mix(vec3(0.),vec3(.25,1.,.35),clamp(fv,0.,1.));}
  return vec4(clamp(col,0.,1.),1.);`,
  'ports of godotshaders.com post-process shaders (CC0) for a still image: Damage Hurt - Pulsing Blood-Red Screen Edge (edge distance + value noise x6 roughness 0.35, smoothstep from size x (1 - softness) to size, pulse 1 - a + a(sin(2 pi phase) / 2 + 1/2) with a = 0.5, blood (0.55, 0, 0) mottled, max alpha 0.85; TIME replaced by Pulse phase); Line pattern cell shading (Jtad: Rec.601 grey lowered by depth on alternate diagonal bands of line_thickness px, then a gradient lookup; the user gradient texture is replaced by a fixed 4-step constant toon ramp); Analog Monochrome Monitor (cyanone, TextureLabs port: pixelation in screen-UV units, luminosity grey 0.21 / 0.72 / 0.07, contrast, hard-mix with a tiled soft-pixel texture (generated here as a radial blob), mixed by opacity; pixel colour set to phosphor green instead of white, background black)');

f = add('Color');
f('q20_dt_colorequal','Color Equalizer (darktable)',
  [S('Node',['red','orange','yellow','green','cyan','blue','lavender','magenta'],1),P('Hue',-180,180,0,1,'deg'),P('Saturation',-100,100,30,1,'%'),P('Brightness',-100,100,0,1,'%')],
  `vec3 li=${LIN('c.rgb')};float l_=pow(max(.4122214708*li.r+.5363325363*li.g+.0514459929*li.b,0.),1./3.),m_=pow(max(.2119034982*li.r+.6806995451*li.g+.1073969566*li.b,0.),1./3.),s_=pow(max(.0883024619*li.r+.2817188376*li.g+.6299787005*li.b,0.),1./3.);
  float Lk=.2104542553*l_+.7936177850*m_-.0040720468*s_,ak=1.9779984951*l_-2.4285922050*m_+.4505937099*s_,bk=.0259040371*l_+.7827717662*m_-.8086757660*s_;
  float C=length(vec2(ak,bk));float h=degrees(atan(bk,ak));float nh=u_p0*45.+20.;float dh=mod(h-nh+540.,360.)-180.;float w=abs(dh)<45.?.5+.5*cos(3.14159*dh/45.):0.;
  float Sat=clamp(C/max(Lk,.05)*.25,0.,.3);float sw=1./(1.+exp(-30.*(C/max(Lk,.05)*.25-.06)));
  h+=w*u_p1;C=max(0.,C*(1.+2.*w*u_p2/100.*sw));Lk=max(0.,Lk*(1.+8.*Sat*w*u_p3/100.));
  float hr=radians(h);ak=C*cos(hr);bk=C*sin(hr);float l2=Lk+.3963377774*ak+.2158037573*bk,m2=Lk-.1055613458*ak-.0638541728*bk,s2=Lk-.0894841775*ak-1.2914855480*bk;l2=l2*l2*l2;m2=m2*m2*m2;s2=s2*s2*s2;
  vec3 ro=clamp(vec3(4.0767416621*l2-3.3077115913*m2+.2309699292*s2,-1.2684380046*l2+2.6097574011*m2-.3413193965*s2,-.0041960863*l2-.7034186147*m2+1.7076147010*s2),0.,1.);
  return vec4(${SRGB('ro')},1.);`,
  'darktable color equalizer (colorequal.c) for one node: 8 nodes 45 deg apart with the 20 deg red offset (red, orange, yellow, green, cyan, blue, lavender, magenta), adjustment spread to the neighbouring nodes by a raised cosine (darktable solves a periodic RBF), hue offset added, chroma x (1 + 2 x saturation x weight) gated by the logistic saturation weight (threshold 0.06, slope 30), brightness x (1 + 8 x pixel saturation x brightness); Oklab LCh stands in for darktable UCS 22 and the guided filter is omitted (approx.)');

const Q20_SPK = (le) => `int s=int(u_p0+.5);vec3 GM=s==0?vec3(.60,.62,.65):s==1?vec3(.72,.74,.76):s==2?vec3(.66,.67,.62):s==3?vec3(.55,.55,.57):vec3(.60,.63,.60);
  vec3 CA=s==0?vec3(1.03,1.,.96):s==1?vec3(1.):s==2?vec3(1.06,1.01,.9):s==3?vec3(.94,1.,1.08):s==4?vec3(.97,1.03,1.):vec3(.98,1.,1.03);float SK=s==0?.85:s==1?1.12:s==2?1.0:s==3?.9:s==4?.88:1.1;
  vec3 E=${LIN('O(uv).rgb')}*exp2(u_p1)*CA;E=mix(E,vec3(dot(E,vec3(.3,.5,.2))),.1);`;
const Q20_SPK_D = `vec3 le=log(max(E,1e-5))/2.302585+.7447;vec3 Dn=s==5?.1+3.4/(1.+exp(1.9*(le+.763))):.2+2.4/(1.+exp(-le*(4.*GM/2.4)));`;
f = add('Film');
f('q20_dt_spektrafilm','spektrafilm Film Simulation (darktable, approx.)',
  [S('Film stock',['Kodak Portra 400','Kodak Ektar 100','Kodak Gold 200','Kodak Vision3 500T','Fujifilm Pro 400H','Kodak Ektachrome E100 (slide)']),P('Film exposure',-3,3,0,.1,'EV'),P('DIR couplers',0,1,.6,.01),P('Halation',0,1,.35,.01)],
  [`${Q20_SPK()}${Q20_SPK_D}return vec4(Dn/4.,clamp(dot(E,vec3(.3,.6,.1))-.55,0.,1.));`,BH('10.'),BV('10.'),
  `${Q20_SPK()}float ha=T(uv).a*u_p3;E+=vec3(1.3,.28,0.)*ha;${Q20_SPK_D}vec3 Db=T(uv).rgb*4.;
  Dn+=u_p2*.6*(Dn-Db);float Dm=dot(Dn,vec3(1./3.));Dn=Dm+(Dn-Dm)*SK*(1.+.3*u_p2);vec3 Rf;
  if(s==5){Rf=pow(vec3(10.),-Dn)/pow(10.,-.1);}
  else{vec3 pe=1.4-Dn;vec3 Pd=.06+2.14/(1.+exp(-(pe-.236)*3.2));Rf=pow(vec3(10.),-Pd)/pow(10.,-.06);}
  Rf=clamp(Rf,0.,1.);return vec4(${SRGB('Rf')},1.);`],
  'spektrafilm (Andrea Volpato; darktable module) idea without its measured spectral data pack: input treated as scene-linear light, slight layer crosstalk, per-layer negative characteristic curves (logistic in log10 exposure, per-stock gammas and colour balance; look approximations of the named stocks), halation added as red-dominant exposure from blurred highlights, DIR couplers as same-layer inhibition (density unsharp against a 10 px spread) plus interlayer inhibition (density saturation), printed onto a colour paper curve with auto print exposure (18 % grey stays neutral), paper white normalised; the slide stock skips the print and uses a reversal curve; no grain, no spectral upsampling');
