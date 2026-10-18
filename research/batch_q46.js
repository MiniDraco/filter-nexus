/* ================= q46: round-18 Paint.NET Plugin Index — colour, stylize, distort ================= */
const Q46_MC = '127,178,56;247,233,163;199,199,199;255,0,0;160,160,255;167,167,167;0,124,0;255,255,255;164,168,184;151,109,77;112,112,112;64,64,255;143,119,72;255,252,245;216,127,51;178,76,216;102,153,216;229,229,51;127,204,25;242,127,165;76,76,76;153,153,153;76,127,153;127,63,178;51,76,178;102,76,51;102,127,51;153,51,51;25,25,25;250,238,77;92,219,213;74,128,255;0,217,58;129,86,49;112,2,0;209,177,161;159,82,36;149,87,108;112,108,138;186,133,36;103,117,53;160,77,78;57,41,35;135,107,98;87,92,92;122,73,88;76,62,92;76,50,35;76,82,42;142,60,46;37,22,16;189,48,49;148,63,97;92,25,29;22,126,134;58,142,140;86,44,62;20,180,133;100,100,100;216,175,147;127,167,150'
  .split(';').map(s => 'vec3(' + s.split(',').map(v => v + '.').join(',') + ')').join(',');

f = add('Stylize');
f('q46_bizarro','Bizarro-Negation (Paint.NET)',[S('Flip',['Both axes','Horizontal','Vertical']),P('Mix',0,1,1,.01)],
  `int m=int(u_p0+.5);vec2 q=vec2(m==2?uv.x:1.-uv.x,m==1?uv.y:1.-uv.y);vec3 b=T(q).rgb;vec3 n=1.-abs(1.-c.rgb-b);return vec4(mix(c.rgb,n,u_p1),1.);`,
  'Xhin Bizarro-Negation (Plugin Index description): the layer is duplicated, flipped horizontally and vertically, and composited with the Paint.NET Negation blend mode, result = 1 - |1 - A - B|; Flip offers one axis only, Mix = layer opacity');

f('q46_scintillate','Scintillate (Paint.NET)',[P('Scale',1,64,6,1,'px'),P('Tilt',0,90,12,1,'deg'),S('Pattern',['Checker','Stripes','Diamonds']),P('Mix',0,1,1,.01)],
  `int m=int(u_p2+.5);vec2 p=rot(PX(uv)-PX(vec2(.5)),radians(u_p1))/u_p0;if(m==2)p=rot(p,.785398)*1.41421;float k=m==1?mod(floor(p.x),2.):mod(floor(p.x)+floor(p.y),2.);
 return vec4(mix(c.rgb,mix(c.rgb,1.-c.rgb,k),u_p3),1.);`,
  'Red Ochre Scintillate, approx. from the Plugin Index description: the colours are inverted in alternate cells of a tiltable pattern (checker, stripes or 45-degree diamonds); small scales alias into a moire, larger ones read as a half-tone');

f('q46_overliner','Overliner (Paint.NET)',[P('Threshold',0,1,.06,.01),P('Distance',1,8,1,1,'px'),S('Direction',['Horizontal','Vertical','Both']),S('Lines',['Light and dark','Over grey'])],
  `int m=int(u_p2+.5);vec3 o=c.rgb;float l0=luma(o);float bd=0.;
 if(m!=1){float d=luma(T(uv+vec2(u_px.x*R(u_p1),0.)).rgb)-l0;if(abs(d)>abs(bd))bd=d;}
 if(m!=0){float d=luma(T(uv-vec2(0.,u_px.y*R(u_p1))).rgb)-l0;if(abs(d)>abs(bd))bd=d;}
 vec3 base=u_p3>.5?vec3(.5):o;if(abs(bd)<=u_p0)return vec4(base,1.);return vec4(bd>0.?vec3(1.):vec3(0.),1.);`,
  'MadJik Overliner, approx. from the Plugin Index description: each pixel is compared with its neighbour (right and / or below, at Distance); where the step exceeds Threshold the pixel is a colour break and is painted with the light colour (white) if the break goes from dark to light, otherwise with the dark colour (black); other pixels keep the image (or grey)');

f('q46_lattice','Lattice (Paint.NET Ed Harvey)',[P('Cell size',3,40,8,1,'px'),P('Contrast',.5,3,1,.01),S('Style',['Cross stitch','Diagonal lattice','Square weave']),S('Colours',['Black on white','Navy on cream','White on black'])],
  `float B=u_p0;vec2 p=PX(uv);vec2 cc=floor(p/B);vec2 q=p/B-cc-.5;float l=0.;for(int j=0;j<2;j++)for(int i=0;i<2;i++)l+=luma(T(fromPX((cc+vec2(.25+.5*float(i),.25+.5*float(j)))*B)).rgb);
 l=clamp((l*.25-.5)*u_p1+.5,0.,1.);float w=(1.-l)*.3;int m=int(u_p2+.5);float d;
 if(m==0)d=min(abs(q.x-q.y),abs(q.x+q.y))*.7071;else if(m==1){vec2 g=p/B;d=min(abs(fract(g.x+g.y)-.5),abs(fract(g.x-g.y)-.5))*.7071;}else d=min(abs(q.x),abs(q.y));
 float k=clamp((w-d)*B+.5,0.,1.);int s=int(u_p3+.5);vec3 ink=s==1?vec3(.1,.13,.3):s==2?vec3(1.):vec3(0.);vec3 bg=s==1?vec3(.96,.92,.82):s==2?vec3(0.):vec3(1.);return vec4(mix(bg,ink,k),1.);`,
  'Ed Harvey Lattice, approx. from the Plugin Index description ("duotone lattice, not unlike an embroidery pattern"): per cell the mean tone sets the thickness of a two-colour stitch (cross stitch X, continuous diagonal lattice or square weave), dark tones = thick stitches');

f('q46_cuboids','Cuboids (Paint.NET)',[P('Cell size',4,64,20,1,'px'),P('Perspective',0,.6,.4,.01),S('Height',['Luminance','Inverse luminance','Random']),P('Side shading',0,1,.6,.01)],
  `float B=u_p0;vec2 p=PX(uv);vec2 vp=PX(vec2(.5));vec2 dp=p-vp;vec2 c0=floor(p/B);float bs=0.;vec3 col=vec3(1.);int hm=int(u_p2+.5);
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 cc=c0+vec2(float(i),float(j));vec3 cs=O(fromPX((cc+.5)*B)).rgb;float h=hm==0?luma(cs):hm==1?1.-luma(cs):hash(cc);float s1=1.+u_p1*h;
  vec2 lo=cc*B-vp,hi=lo+B;float t0=1./s1,t1=1.;
  if(abs(dp.x)<1e-4){if(lo.x>0.||hi.x<0.)continue;}else{float a=lo.x/dp.x,b=hi.x/dp.x;t0=max(t0,min(a,b));t1=min(t1,max(a,b));}
  if(abs(dp.y)<1e-4){if(lo.y>0.||hi.y<0.)continue;}else{float a=lo.y/dp.y,b=hi.y/dp.y;t0=max(t0,min(a,b));t1=min(t1,max(a,b));}
  if(t0>t1)continue;float s=1./t0;if(s>bs){bs=s;float top=step(s1-1e-4,s);float sh=s1>1.0001?(s-1.)/(s1-1.):1.;col=cs*mix(1.-u_p3*(1.-.6*sh),1.,top);}}
 return vec4(col,1.);`,
  'Red Ochre Cuboids, approx. from the Plugin Index description: the image is cut into square cells, each extruded as a block toward a one-point-perspective viewer above the centre (top face scaled by 1 + Perspective x height about the vanishing point, analytic ray / frustum test over the neighbouring cells, nearest top wins); Perspective 0 = plain pixelation, larger values = tower blocks; sides darkened toward their base');

f('q46_gradblocks','Gradient Blocks (Paint.NET)',[P('Block size',4,128,16,1,'px'),S('Gradient',['Four-corner bilinear','Horizontal','Vertical','Diagonal'])],
  `float B=u_p0;vec2 p=PX(uv);vec2 cc=floor(p/B);vec2 lq=p/B-cc;vec3 m[4];
 for(int k=0;k<4;k++){vec2 qo=vec2(float(k-(k/2)*2),float(k/2))*.5;vec3 s=vec3(0.);for(int j=0;j<3;j++)for(int i=0;i<3;i++)s+=T(fromPX((cc+qo+(vec2(float(i),float(j))+.5)/6.)*B)).rgb;m[k]=s/9.;}
 vec2 fq=clamp((lq-.25)*2.,0.,1.);int g=int(u_p1+.5);vec3 o;
 if(g==1)o=mix((m[0]+m[2])*.5,(m[1]+m[3])*.5,fq.x);else if(g==2)o=mix((m[0]+m[1])*.5,(m[2]+m[3])*.5,fq.y);else if(g==3)o=mix(m[0],m[3],clamp(.5*(fq.x+fq.y),0.,1.));else o=mix(mix(m[0],m[1],fq.x),mix(m[2],m[3],fq.x),fq.y);
 return vec4(o,1.);`,
  'pyrochild Gradient Blocks, approx. from the Plugin Index description ("pixelated version with gradient filled blocks"): each block is filled with a gradient between the means of its four quarters (bilinear between the quarter centres, or horizontal / vertical / diagonal two-colour gradients)');

f = add('Color');
f('q46_mcmap','Minecraft Map Colour Palette (Paint.NET)',[S('Shades',['All 4 (map item)','3 (staircase buildable)','Flat terrain only']),P('Dither',0,1,0,.01)],
  `int m=int(u_p0+.5);vec3 pal[61]=vec3[61](${Q46_MC});vec3 x=c.rgb+(bayer8(PX(uv))-.5)*u_p1*.12;float bd=1e9;vec3 bc=vec3(0.);
 for(int i=0;i<61;i++)for(int k=0;k<4;k++){if(m==1&&k==3)continue;if(m==2&&k!=1)continue;float mul=k==0?180.:k==1?220.:k==2?255.:135.;vec3 q=floor(pal[i]*mul/255.)/255.;vec3 d=x-q;float e=dot(d,d);if(e<bd){bd=e;bc=q;}}
 return vec4(bc,1.);`,
  'chrisb Convert to Minecraft Map Color Palette: the 61 base map colours of Java Edition (minecraft.wiki Map item format, ids 1-61) times the four shade multipliers 180 / 220 / 255 / 135 over 255, rounded down (244 colours); 3 shades drops the 135 shade that blocks cannot produce, Flat keeps the x220 shade of level terrain; nearest colour by Euclidean sRGB distance (the plugin metric is not published, approx.), optional ordered (Bayer 8x8) dither');

f('q46_hsvpost','Posterize in HSV Space (Paint.NET)',[P('Hue levels',1,36,24,1),P('Saturation levels',1,16,4,1),P('Value levels',1,16,5,1)],
  `vec3 h=rgb2hsv(c.rgb);h.x=floor(h.x*u_p0)/u_p0;h.y=u_p1<1.5?h.y:min(floor(h.y*u_p1),u_p1-1.)/(u_p1-1.);h.z=u_p2<1.5?h.z:min(floor(h.z*u_p2),u_p2-1.)/(u_p2-1.);return vec4(hsv2rgb(h),1.);`,
  'MJW Posterize in HSV Space (Plugin Index description): the colour is converted to HSV, each component is truncated to its number of levels (hue on the circle, saturation and value with both ends kept, 1 level = unchanged) and converted back to RGB');

f('q46_hsvscramble','HSV Scrambler (Paint.NET)',[S('Hue from',['Hue','Saturation','Value'],2),S('Saturation from',['Hue','Saturation','Value'],1),S('Value from',['Hue','Saturation','Value'],2),P('Hue shift',0,360,0,1,'deg')],
  `vec3 h=rgb2hsv(c.rgb);int a=int(u_p0+.5),b=int(u_p1+.5),d=int(u_p2+.5);float H=a==0?h.x:a==1?h.y:h.z,Sa=b==0?h.x:b==1?h.y:h.z,V=d==0?h.x:d==1?h.y:h.z;
 return vec4(hsv2rgb(vec3(fract(H+u_p3/360.),Sa,V)),1.);`,
  'MJW HSV Scrambler, approx. (Plugin Index description: any HSV component may be derived from a scaled and offset version of any other): each output component is taken from the chosen source component; the per-component scale / offset controls are reduced to one hue offset');

f('q46_invlum','Invert Luminance keeping hue (Paint.NET)',[P('Inversion',0,1,1,.01),P('Green weight',.2,.8,.6,.01),P('Brightness',-.5,.5,0,.01)],
  `vec3 o=c.rgb;float wr=(1.-u_p1)*.5;vec3 w=vec3(wr,u_p1,wr);float Y=dot(o,w);float Yt=clamp(mix(Y,1.-Y,u_p0)+u_p2,0.,1.);vec3 d=o-Y;float k=1.;
 for(int i=0;i<3;i++){float di=d[i];if(di>1e-5)k=min(k,(1.-Yt)/di);else if(di<-1e-5)k=min(k,Yt/(-di));}
 return vec4(clamp(Yt+d*k,0.,1.),1.);`,
  'Intrepidis Invert Luminance, approx. from the Plugin Index description: luminance Y = weighted RGB with a configurable green weight (red and blue share the rest) is inverted (or only shifted by Brightness) while the chroma offset RGB - Y is kept, scaled down only as far as needed to stay in gamut, so hues are unchanged');

f('q46_bitplane','Bit-Plane Shuffler (Paint.NET)',[P('Shuffle index',0,40319,9876,1),S('Direction',['Forward','Backward'])],
  `int ix=int(u_p0+.5);int fac[8]=int[8](5040,720,120,24,6,2,1,1);int pm[8];int used=0;
 for(int i=0;i<8;i++){int d=ix/fac[i];ix-=d*fac[i];for(int j=0;j<8;j++){if(((used>>j)&1)==0){if(d==0){pm[i]=j;used|=1<<j;break;}d--;}}}
 bool bw=u_p1>.5;vec3 o;for(int ch=0;ch<3;ch++){int v=int(clamp(c[ch],0.,1.)*255.+.5);int r=0;for(int i=0;i<8;i++){if(bw)r|=((v>>pm[i])&1)<<i;else r|=((v>>i)&1)<<pm[i];}o[ch]=float(r)/255.;}
 return vec4(o,1.);`,
  'Reptillian (Reptorian) Bit-Plane Shuffler, from the G\'MIC rep_bitplane_shuffle source: every 8-bit channel value is rebuilt with bit k moved to plane order[k] (Backward = inverse permutation); the 8! = 40320 orders are numbered here by the factorial number system (lexicographic, 0 = identity), which may not match the plugin\'s own index numbering');

f('q46_greentint','Green Tint Reduction (Paint.NET)',[P('Tint reduction',0,1,.5,.01),P('Red tolerance',0,1,0,.01)],
  `vec3 o=c.rgb;float m=.5*(o.r+o.b);float fl=min(o.r,o.b)*(1.-u_p1);float g=o.g-u_p0*max(0.,o.g-m);return vec4(o.r,max(g,min(o.g,fl)),o.b,1.);`,
  'toe_head2001 Green Tint Reduction, approx. from the forum description: green is pulled toward the red / blue mean by Tint reduction only where it exceeds that mean, and never below min(R, B) (lowered by Red tolerance), so neutral, warm and magenta-range pixels are not pushed toward magenta');

f('q46_earths','Earths and Greys (Paint.NET Red Ochre)',[P('Levels',2,8,5,1),S('Palette',['Earths','Greys','Earths and greys','Blue greys and ochres']),P('Smoothing',0,12,2,.5,'px')],
  [BH('u_p2'),BV('u_p2'),
  `float t=luma(T(uv).rgb);float n=u_p0;float k=min(floor(t*n),n-1.)/(n-1.);int m=int(u_p1+.5);
 vec3 e[6]=vec3[6](vec3(.17,.11,.08),vec3(.36,.21,.12),vec3(.55,.28,.15),vec3(.68,.45,.22),vec3(.83,.66,.33),vec3(.95,.9,.76));
 vec3 g[6]=vec3[6](vec3(.1),vec3(.27),vec3(.43),vec3(.6),vec3(.78),vec3(.95));
 vec3 b[6]=vec3[6](vec3(.12,.14,.2),vec3(.28,.32,.4),vec3(.62,.45,.2),vec3(.55,.6,.66),vec3(.85,.7,.4),vec3(.94,.93,.88));
 int i=int(k*5.+.5);vec3 o=m==1?g[i]:m==3?b[i]:e[i];if(m==2&&(i-(i/2)*2)==1)o=vec3(luma(o));return vec4(o,1.);`],
  'Red Ochre Earths and Greys, approx. from the Plugin Index description: the (optionally smoothed) image is divided by tone into Levels bands, each recoloured from a preset palette ordered dark to light (earth pigments umber / sienna / ochre / cream, greys, alternating earth and grey, blue greys and ochres)');

f('q46_selenh','Selective Enhancement (Paint.NET)',[P('Target hue',0,360,25,1,'deg'),P('Target saturation',0,1,.4,.01),P('Range',.05,1,.3,.01),P('Amount',-1,1,.6,.01)],
  `vec3 h=rgb2hsv(c.rgb);vec2 q=h.y*vec2(cos(6.28318*h.x),sin(6.28318*h.x));vec2 t=u_p1*vec2(cos(radians(u_p0)),sin(radians(u_p0)));vec2 d=q-t;float r=length(d);
 if(r<u_p2&&r>1e-5){float x=r/u_p2;q=t+d/r*u_p2*pow(x,exp(-1.5*u_p3));h.x=fract(atan(q.y,q.x)/6.28318+1.);h.y=clamp(length(q),0.,1.);}
 return vec4(hsv2rgb(h),1.);`,
  'HiPhiSch Selective Enhancement, approx. from the Plugin Index description ("spread out or push together colours close to the selected one"): in the hue-saturation disc, colours within Range of the target are moved radially from it with distance x -> x^exp(-1.5 Amount) (Amount > 0 spreads them apart, < 0 pulls them together), value kept');

f('q46_eyeshine','Eyeshine Animal Eye-Glow Removal (Paint.NET)',[P('Threshold',0,1,.55,.01),P('Strength',0,1,1,.01),P('Catchlight',.8,1,.97,.005),P('Softness',.01,.3,.08,.01)],
  `vec3 o=c.rgb;vec3 h=rgb2hsv(o);float mk=smoothstep(u_p0-u_p3,u_p0+u_p3,h.z);float cl=smoothstep(u_p2-.02,u_p2,h.z)*(1.-smoothstep(.05,.2,h.y));mk*=1.-cl;
 vec3 pupil=vec3(.05,.05,.06)+.1*h.z*vec3(.9,.95,1.);return vec4(mix(o,pupil,mk*u_p1),1.);`,
  'Tanel Eyeshine (animal red-eye) removal, approx. from the Plugin Index description: bright pixels (HSV value above Threshold, soft edge) - the green / yellow / blue / white tapetum glow - are replaced by a near-black neutral pupil that keeps a trace of the original shading, while small near-white low-saturation catchlights above Catchlight are kept; meant for a selection around the eyes (applied to the whole frame here)');

f = add('Tone');
f('q46_dragan','Dragan Effect (Paint.NET)',[P('Detail radius',2,60,12,1,'px'),P('Hue',-20,20,0,1,'deg'),P('Desaturation',0,1,.45,.01),P('Strength',0,1,1,.01)],
  [BH('u_p0'),BV('u_p0'),
  `vec3 o=O(uv).rgb;vec3 hp=clamp(o-T(uv).rgb+.5,0.,1.);vec3 g=mix(o,vec3(luma(o)),u_p2);vec3 r=overlay(g,hp);r=overlay(r,hp);
 r=clamp((r-.5)*1.2+.46,0.,1.);r=mix(r,r*r*(3.-2.*r),.6);vec3 h=rgb2hsv(r);h.x=fract(h.x+u_p1/360.+1.);r=hsv2rgb(h);return vec4(mix(o,r,u_p3),1.);`],
  'ReMake Dragan Effect, approx. after his forum tutorial (high pass + Overlay, sharpening, levels / curves) and the CodeLab version (sharpness and hue controls): the image is partly desaturated, its high-pass detail (radius Detail) is overlaid twice, then contrast is raised with an S-curve and the hue shifted slightly - the gritty, contrasty Andrzej Dragan portrait look');

f = add('Blur');
f('q46_splinter','Splinter (Paint.NET Ed Harvey)',[P('Splinters',2,16,4,1),P('Length',1,100,12,1,'px'),P('Rotation',0,360,45,1,'deg'),S('Mode',['Average','Lighten'])],
  `int n=int(u_p0+.5);float Ln=R(u_p1);float a0=radians(u_p2);vec3 s=c.rgb,mx=c.rgb;float w=1.;
 for(int i=0;i<16;i++){if(i>=n)break;float a=a0+6.28318*float(i)/float(n);vec2 d=vec2(cos(a),sin(a))*u_px;for(int j=1;j<=16;j++){vec3 v=T(uv+d*Ln*float(j)/16.).rgb;s+=v;mx=max(mx,v);w+=1.;}}
 return vec4(u_p3>.5?mx:s/w,1.);`,
  'Ed Harvey Splinter, approx. from the Plugin Index description ("a number of rays radiating outwards from the pixel"): each output pixel gathers 16 samples along each of N evenly spaced rays of the given Length and Rotation (mean, or maximum for Lighten), which spreads every pixel into an N-pointed splinter star');

f = add('Distort');
f('q46_radext','Radial Extruder (Paint.NET TR\'s)',[S('Mode',['Repeat one slice','Whole image per slice','Extrude slice centre line']),P('Slices',2,48,8,1),P('Rotation',0,360,0,1,'deg'),P('Zoom',.25,4,1,.01)],
  `int m=int(u_p0+.5);vec2 C=PX(vec2(.5));vec2 p=PX(uv)-C;float r=length(p)/u_p3;float a=atan(p.y,p.x);float w=6.28318/u_p1;float a0=radians(u_p2);float al=mod(a-a0,w);vec2 q;
 if(m==1){float rm=length(C);q=vec2(al/w,1.-r/rm);return vec4(T(clamp(q,0.,1.)).rgb,1.);}
 float sa=m==2?a0+.5*w:a0+al;q=C+r*vec2(cos(sa),sin(sa));return vec4(T(clamp(fromPX(q),0.,1.)).rgb,1.);`,
  'TechnoRobbo Radial Extruder, approx. from the Plugin Index description ("repeats the base image in radial slices from a common centre, like a cake sliced many times"): the circle is cut into N slices; each repeats the image wedge at Rotation, or holds a whole squeezed copy of the image (angle across, radius down), or extrudes the wedge centre line into arcs');

f('q46_polsing','Polar Singularity (Paint.NET)',[P('Intensity',.2,4,1.5,.01),P('Complexity',1,16,3,1),P('Source zoom',.2,3,1,.01)],
  `vec2 p=(PX(uv)-PX(vec2(.5)))/(.5*min(u_res.x,u_res.y)/u_k);float r=length(p);float a=atan(p.x,-p.y);float w=6.28318/u_p1;float al=abs(mod(a+.5*w,w)/w*2.-1.);
 vec2 q=vec2(.5+(al-.5)*u_p2*r,1.-pow(r,1./u_p0)*u_p2);q=1.-abs(1.-mod(q,2.));return vec4(T(q).rgb,1.);`,
  'Xhin Polar Singularity, approx. from the Plugin Index / forum description (Intensity, Complexity = number of sides, Source zoom): the image is mirrored into Complexity mirrored angular sectors whose width shrinks with the radius, so everything converges in acorn-like lobes onto a vanishing centre point; radius warped by r^(1/Intensity); mirror-tiled outside the source');

f('q46_isotiler','Isometric Tiler (Paint.NET)',[P('Tile size',8,128,32,1,'px'),S('Layout',['Sprite sheet','Whole image']),S('Background',['White','Black','Checker'])],
  `vec2 p=PX(uv);vec2 res=u_res/u_k;float N=u_p0;vec2 tu;bool ok;
 if(u_p1<.5){vec2 cs=vec2(2.*N,N);vec2 cc=floor(vec2(p.x,res.y-p.y)/cs);vec2 l=vec2(p.x,res.y-p.y)-cc*cs-vec2(N,.5*N);vec2 f2=.5+vec2(l.x/N+2.*l.y/N,-l.x/N+2.*l.y/N)*.5;
  float tx=floor(res.x/N),cx=floor(res.x/cs.x);float id=cc.y*cx+cc.x;vec2 tl=vec2(mod(id,tx),floor(id/tx));tu=(tl+f2)*N;ok=all(greaterThanEqual(f2,vec2(0.)))&&all(lessThanEqual(f2,vec2(1.)))&&tu.y<res.y;tu.y=res.y-tu.y;tu/=res;}
 else{float Nw=min(.5*res.x,res.y);vec2 l=p-.5*res;l.y=-l.y;vec2 f2=.5+vec2(l.x/Nw+2.*l.y/Nw,-l.x/Nw+2.*l.y/Nw)*.5;ok=all(greaterThanEqual(f2,vec2(0.)))&&all(lessThanEqual(f2,vec2(1.)));tu=vec2(f2.x,1.-f2.y);}
 int b=int(u_p2+.5);vec3 bg=b==1?vec3(0.):b==2?vec3(mix(.75,.95,mod(floor(p.x/8.)+floor(p.y/8.),2.))):vec3(1.);return vec4(ok?T(tu).rgb:bg,1.);`,
  'Mallaboro Isometric Tiler, approx. from the Plugin Index description: the image is cut into square Tile size tiles, each turned into a 2:1 isometric diamond (rotated 45 degrees and halved in height, the 64 -> 128 x 64 sprite convention) and packed row by row into a sprite sheet; Whole image maps the full frame onto one diamond');

f = add('Stylize');
f('q46_vibration','Vibration (Paint.NET)',[P('Blur radius',0,40,6,.5,'px'),P('Bands',1,20,3,.1),P('Mix',0,1,1,.01)],
  [BH('u_p0'),BV('u_p0'),
  `vec3 b=T(uv).rgb;vec3 band=.5+.5*cos(6.28318*b*u_p1+vec3(0.,2.1,4.2)*luma(b));return vec4(mix(O(uv).rgb,band,u_p2),1.);`],
  'AhmedElyamani Vibration, approx. from the Plugin Index description ("blurs then colour bands an image, somewhat like oil on water"): Gaussian blur, then each channel is folded through a cosine of Bands cycles (phase-offset per channel by the luma) to give iridescent contour bands');

f('q46_strobe','Strobe Motion (Paint.NET TR\'s)',[P('Copies',1,12,4,1),P('Spacing',2,200,24,1,'px'),P('Angle',0,360,0,1,'deg'),P('Fade',0,1,.7,.01)],
  `int n=int(u_p0+.5);float a=radians(u_p2);vec2 d=vec2(cos(a),sin(a))*R(u_p1)*u_px;vec3 o=c.rgb;
 for(int i=1;i<=12;i++){if(i>n)break;vec2 q=uv+d*float(i);if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;o=max(o,T(q).rgb*pow(u_p3,float(i)));}
 return vec4(o,1.);`,
  'TechnoRobbo Strobe Motion, approx. from the Plugin Index description ("continuous motion captured as a series of images lit by a strobe"): Copies of the image displaced back along the motion Angle at Spacing intervals, each Fade times dimmer than the previous, combined with the image by Lighten as on a multiple-exposure frame');
