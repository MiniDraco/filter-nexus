/* ================= q42b: round 17 - lygia (mixSpectral, windmillTile, colorChecker, bracketing), libvips eye, OIIO push-pull, Plugin Galaxy ================= */
const Q42_SPA=`const vec4 Q42A[38]=vec4[38](vec4(1.0012,.97059,.99067,.021052),vec4(1.0012,.97059,.99067,.021056),vec4(1.0012,.97063,.99066,.021075),vec4(1.0012,.97079,.99062,.021165),vec4(1.0012,.97137,.99045,.021503),vec4(1.0011,.97316,.98987,.022674),vec4(1.0011,.97674,.98829,.025824),vec4(1.001,.98159,.98429,.033488),vec4(1.0009,.98628,.97393,.051907),vec4(1.0007,.98995,.94182,.10075),vec4(1.0005,.99249,.81739,.23913),vec4(1.0003,.99415,.43247,.5348),vec4(1.0001,.99518,.13845,.79781),vec4(.99995,.99576,.053735,.91145),vec4(.99982,.99591,.029217,.9538),vec4(.99974,.99561,.021314,.97124),vec4(.99971,.9946,.020135,.9793),vec4(.99973,.99222,.024132,.98338),vec4(.9998,.98624,.037224,.98546),vec4(.9999,.96794,.076051,.98644),vec4(1.,.89129,.20538,.98674),vec4(1.0001,.5362,.54127,.98662),vec4(1.0003,.15411,.81584,.98628),vec4(1.0004,.057458,.91282,.98586),vec4(1.0004,.031535,.94634,.98547),vec4(1.0005,.022263,.95993,.98518),vec4(1.0005,.018202,.96626,.98497),vec4(1.0005,.016299,.96933,.98485),vec4(1.0005,.015366,.97085,.98478),vec4(1.0005,.014911,.97161,.98474),vec4(1.0005,.014695,.97196,.98472),vec4(1.0005,.014596,.97213,.98471),vec4(1.0005,.014547,.97221,.98471),vec4(1.0005,.014523,.97225,.9847),vec4(1.0005,.014512,.97227,.9847),vec4(1.0005,.014507,.97228,.9847),vec4(1.0005,.014504,.97228,.9847),vec4(1.0005,.014504,.97228,.9847));`;
const Q42_SPB=`const vec3 Q42B[38]=vec3[38](vec3(.031561,.0095561,.9794),vec3(.031552,.0095582,.9794),vec3(.031515,.0095673,.97938),vec3(.031332,.0096129,.97929),vec3(.030673,.0097837,.97896),vec3(.028648,.010379,.97781),vec3(.024645,.012003,.97472),vec3(.019296,.016098,.9672),vec3(.014207,.026706,.94908),vec3(.010294,.059556,.90085),vec3(.0076191,.18604,.76315),vec3(.005898,.57058,.46592),vec3(.0048233,.86147,.20126),vec3(.0042299,.94588,.087752),vec3(.0040599,.97047,.045718),vec3(.0043534,.97841,.028471),vec3(.0053434,.97959,.020527),vec3(.0076917,.97553,.01653),vec3(.013597,.96229,.014514),vec3(.031698,.92312,.0136),vec3(.10786,.79343,.01336),vec3(.46381,.45927,.013549),vec3(.84706,.18557,.013959),vec3(.94319,.088177,.014443),vec3(.96886,.054363,.014885),vec3(.97803,.040629,.015225),vec3(.98204,.034222,.015459),vec3(.98392,.031119,.015602),vec3(.98485,.029571,.015682),vec3(.98529,.028811,.015725),vec3(.98551,.028449,.015746),vec3(.98561,.028282,.015756),vec3(.98565,.028199,.015761),vec3(.98568,.028158,.015763),vec3(.98569,.02814,.015764),vec3(.98569,.028131,.015765),vec3(.9857,.028127,.015765),vec3(.9857,.028126,.015765));`;
const Q42_SPC=`const vec3 Q42C[38]=vec3[38](vec3(.000065,.000002,.00030502),vec3(.00021941,.000006,.0010368),vec3(.0011206,.000031,.0053131),vec3(.0037666,.00010475,.017954),vec3(.011881,.00035364,.057078),vec3(.023286,.00095147,.11365),vec3(.034559,.0022823,.17336),vec3(.037224,.0042073,.19621),vec3(.032418,.0066888,.18608),vec3(.021233,.0098884,.13995),vec3(.010491,.015249,.089175),vec3(.0032958,.021418,.047896),vec3(.00050704,.033423,.028146),vec3(.00094867,.05131,.016138),vec3(.0062737,.070402,.0077591),vec3(.016865,.087839,.0042961),vec3(.02869,.094249,.0020055),vec3(.042675,.097957,.00086147),vec3(.056255,.094152,.00036904),vec3(.06947,.086781,.00019143),vec3(.083053,.078857,.00014956),vec3(.086126,.063527,.000092),vec3(.090466,.053741,.000068),vec3(.085004,.042646,.000029),vec3(.070907,.031617,.000016),vec3(.050629,.020885,.000004),vec3(.035474,.01386,.000002),vec3(.021468,.0081026,0.),vec3(.012516,.0046301,0.),vec3(.0068046,.0024914,0.),vec3(.0034646,.0012593,0.),vec3(.0014976,.00054165,0.),vec3(.0007697,.00027795,0.),vec3(.00040737,.00014711,0.),vec3(.00016901,.000061,0.),vec3(.000095,.000034,0.),vec3(.000049,.000018,0.),vec3(.000020,.000007,0.));`;
const Q42_PAL=`const vec3 Q42M[72]=vec3[72](vec3(.46,.331,.275),vec3(.769,.576,.506),vec3(.356,.472,.609),vec3(.357,.427,.247),vec3(.518,.506,.694),vec3(.384,.749,.675),vec3(.867,.487,.184),vec3(.29,.357,.671),vec3(.769,.333,.384),vec3(.365,.231,.42),vec3(.624,.745,.227),vec3(.894,.635,.16),vec3(.176,.247,.584),vec3(.239,.588,.29),vec3(.69,.224,.227),vec3(.925,.784,.094),vec3(.749,.309,.598),vec3(0.,.537,.659),vec3(.956,.956,.945),vec3(.789,.797,.797),vec3(.635,.643,.643),vec3(.475,.478,.478),vec3(.329,.333,.337),vec3(.2,.2,.204),vec3(.824,.475,.459),vec3(.847,.702,.353),vec3(.498,.686,.471),vec3(.259,.616,.702),vec3(.455,.576,.761),vec3(.745,.475,.604),vec3(.855,.796,.788),vec3(.796,.804,.769),vec3(.808,.796,.816),vec3(.259,.224,.227),vec3(.212,.239,.22),vec3(.247,.235,.271),vec3(.929,.808,.729),vec3(.827,.686,.522),vec3(.757,.584,.357),vec3(.545,.365,.239),vec3(.29,.216,.18),vec3(.224,.212,.22),vec3(.945,.914,.898),vec3(.898,.871,.863),vec3(.714,.698,.69),vec3(.545,.533,.529),vec3(.392,.388,.38),vec3(.247,.239,.243),vec3(.384,.733,.651),vec3(.494,.49,.682),vec3(.322,.423,.247),vec3(.341,.467,.603),vec3(.769,.557,.494),vec3(.439,.302,.247),vec3(.871,.463,.125),vec3(.227,.349,.627),vec3(.765,.31,.373),vec3(.325,.227,.416),vec3(.616,.737,.212),vec3(.933,.62,.098),vec3(0.,.498,.623),vec3(.753,.294,.569),vec3(.961,.804,0.),vec3(.729,.102,.2),vec3(.224,.573,.251),vec3(.098,.216,.529),vec3(.976,.949,.933),vec3(.792,.777,.765),vec3(.631,.616,.604),vec3(.478,.463,.455),vec3(.314,.314,.306),vec3(.169,.161,.169));`;

f = add('Color');
f('q42_mixspectral','Spectral Colour Mixing (lygia mixSpectral / spectral.js)',[P('Pigment hue',0,360,220,1,'deg'),P('Pigment saturation',0,1,.9,.01),P('Concentration',0,1,.4,.01),S('Mode',['Spectral (Kubelka-Munk)','Plain RGB mix for comparison'])],
  `vec3 pg=hsv2rgb(vec3(u_p0/360.,u_p1,.92));vec3 s=c.rgb;if(u_p3>.5)return vec4(mix(s,pg,u_p2),1.);${Q42_SPA}${Q42_SPB}${Q42_SPC}
 vec3 A=${LIN('s')},B=${LIN('pg')};float R1[38],R2[38];
 for(int k=0;k<2;k++){vec3 l=k==0?A:B;float w=min(l.r,min(l.g,l.b));l-=w;float cc=min(l.g,l.b),mm=min(l.r,l.b),yy=min(l.r,l.g),rr=min(max(0.,l.r-l.b),max(0.,l.r-l.g)),gg=min(max(0.,l.g-l.b),max(0.,l.g-l.r)),bb=min(max(0.,l.b-l.g),max(0.,l.b-l.r));
  for(int i=0;i<38;i++){float v=max(1e-4,dot(Q42A[i],vec4(w,cc,mm,yy))+dot(Q42B[i],vec3(rr,gg,bb)));if(k==0)R1[i]=v;else R2[i]=v;}}
 vec3 x1=vec3(0.),x2=vec3(0.);for(int i=0;i<38;i++){x1+=R1[i]*Q42C[i];x2+=R2[i]*Q42C[i];}float t=u_p2;float c1=x1.y*(1.-t)*(1.-t),c2=x2.y*t*t;
 vec3 X=vec3(0.);for(int i=0;i<38;i++){float k1=(1.-R1[i])*(1.-R1[i])/(2.*R1[i]),k2=(1.-R2[i])*(1.-R2[i])/(2.*R2[i]);float ks=(k1*c1+k2*c2)/max(c1+c2,1e-12);X+=(1.+ks-sqrt(ks*ks+2.*ks))*Q42C[i];}
 vec3 o=clamp(mat3(3.24097,-.969244,.0556301,-1.53738,1.87597,-.203977,-.498611,.0415551,1.05697)*X,0.,1.);return vec4(${SRGB('o')},1.);`,
  'lygia color/mixSpectral (Ronald van Wijnen spectral.js, MIT): linear RGB -> 38-band reflectance from white/cyan/magenta/yellow/red/green/blue basis curves, concentrations (sqrt(Y) t)^2, Kubelka-Munk K/S mixing R = 1 + KS - sqrt(KS^2 + 2KS), back to XYZ (CIE 1931 weights) and linear sRGB; the image is mixed with a pigment colour (blue + yellow give green)');

f = add('Distort');
f('q42_windmill','Windmill Tile (lygia)',[P('Tiles',1,32,6,1),S('Content',['Cell of the image','Whole image in every tile']),P('Turn',0,720,360,1,'deg')],
  `vec2 v=uv*vec2(asp(),1.)*floor(u_p0+.5);vec4 t=vec4(fract(v),floor(v));float a=(abs(mod(t.z,2.)-mod(t.w,2.))+mod(t.w,2.)*2.)*.25*radians(u_p2);
 float cs=cos(a),sn=sin(a);vec2 xy=mat2(cs,-sn,sn,cs)*(t.xy-.5)+.5;
 vec2 q=u_p1<.5?(t.zw+xy)/floor(u_p0+.5)/vec2(asp(),1.):fract(xy);return vec4(T(clamp(q,0.,1.)).rgb,1.);`,
  'lygia space/windmillTile: square tiles (sqTile = fract/floor), each rotated about its centre by (|x mod 2 - y mod 2| + 2 (y mod 2)) / 4 of a full turn (0, 90, 180, 270 deg pattern), lygia rotate2d; content = the tile\'s own piece of the image or the whole image per tile');

f = add('Render');
f('q42_colorchecker','Colour Checker Chart (lygia)',[S('Chart',['Macbeth ColorChecker','SpyderCheckr 48 side A','SpyderCheckr 48 side B']),S('Background',['Black','Over image'])],
  `${Q42_PAL}
#define Q42RS(P0,S0) max(abs((P0).x*2.-1.)/(S0).x,abs((P0).y*2.-1.)/(S0).y)
 int m=int(u_p0+.5);vec2 q=(uv-.5)*vec2(asp(),1.)+.5;vec2 tu=m==1?q:vec2(q.x,1.-q.y);vec2 st=((tu-.5)*vec2(1.,1.5)+.5)*vec2(6.,4.);vec2 fr=fract(st),fl=floor(st);
 vec3 col=vec3(0.);if(fl.x>=0.&&fl.x<6.&&fl.y>=0.&&fl.y<4.){int idx=6*int(fl.y)+int(fl.x)+(m==0?0:m==1?24:48);col=Q42M[idx]*(1.-step(1.,Q42RS(fr,vec2(.8))));}
 col+=1.-step(.015,min(Q42RS(q,vec2(.25,2.)),Q42RS(q,vec2(2.,.25))));float rs=Q42RS(q,vec2(1.015,.68));
 col+=clamp(step(1.,rs+.005)-step(1.,rs-.005)-(1.-step(1.,Q42RS(q,vec2(.966,1.))))-(1.-step(1.,Q42RS(q,vec2(1.1,.63)))),0.,1.);
 float al=1.-step(1.,Q42RS(q,vec2(1.03,.69)));vec3 bg=u_p1>.5?c.rgb:vec3(0.);return vec4(mix(bg,clamp(col,0.,1.),al),1.);`,
  'lygia draw/colorChecker: 6x4 patches at 80% of each cell (scale 1 x 1.5 about the centre), centre cross and corner brackets, colours from lygia color/palette/macbeth (24 sRGB patches) and palette/spyder (SpyderCheckr 48, sides A and B); drawn in a centred square');

f = add('Stylize');
f('q42_bracketing','Bracketing Flow-Aligned Texture (lygia / Bowles)',[P('Texture scale',2,40,7,.5,'px'),P('Bracket angle',2,45,9,1,'deg'),S('Pattern',['Hatch lines','Brush noise strokes','Tinted brush strokes']),P('Mix',0,1,1,.01)],
  `vec2 e=u_px*max(u_k,1.)*3.;float jxx=0.,jxy=0.,jyy=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=uv+vec2(float(i),float(j))*e;float gx=luma(O(q+vec2(e.x,0.)).rgb)-luma(O(q-vec2(e.x,0.)).rgb),gy=luma(O(q+vec2(0.,e.y)).rgb)-luma(O(q-vec2(0.,e.y)).rgb);jxx+=gx*gx;jxy+=gx*gy;jyy+=gy*gy;}
 float coh=sqrt((jxx-jyy)*(jxx-jyy)+4.*jxy*jxy);float ang=mix(.7853982,.5*atan(2.*jxy,jxx-jyy+1e-9)+1.5707963,smoothstep(.0005,.004,coh))+6.2831853;float dl=radians(u_p1);float fr=mod(ang,dl);float a0=ang-fr;float al=fr/dl;vec2 p=PX(uv)/u_p0;int tx=int(u_p2+.5);float l=luma(O(uv).rgb);float tv[2];
 for(int k=0;k<2;k++){float ak=a0+float(k)*dl;vec2 ax=vec2(cos(ak),sin(ak));vec2 uvk=vec2(dot(p,vec2(-ax.y,ax.x)),dot(p,ax));
  if(tx==0)tv[k]=.5+.5*sin(uvk.x*3.1415927+(vnoise(vec2(uvk.x*.5,uvk.y*.08))-.5)*2.5);else tv[k]=vnoise(vec2(uvk.x*1.3,uvk.y*.09))*.65+vnoise(vec2(uvk.x*3.1,uvk.y*.2))*.35;}
 float tex=mix(tv[0],tv[1],al);vec3 o=O(uv).rgb;vec3 r;if(tx==0)r=vec3(mix(.08,1.,smoothstep(-.18,.18,l-tex*.85+.05)));else if(tx==1)r=vec3(clamp(l+(tex-.5)*.9,0.,1.));else r=clamp(o*(.55+tex*.9),0.,1.);
 return vec4(mix(o,r,u_p3),1.);`,
  'lygia space/bracketing (Huw Bowles 2022): the flow direction (here the smoothed structure-tensor tangent of the image) is snapped to multiples of the bracket angle, the texture is sampled in the two bracketing UV frames and blended by the fractional angle, avoiding the swirl artefacts of per-pixel rotation; the hatch / brush textures are procedural');

f('q42_eye','Eye Spatial-Frequency Test Pattern (libvips eye)',[P('Factor',0,1,.5,.01),S('Output',['Pattern','Multiply image'])],
  `float mx=max(u_res.x-1.,1.),my=max(u_res.y-1.,1.);float x=floor(uv.x*u_res.x),y=floor((1.-uv.y)*u_res.y);float v=y*y*cos(u_p0*3.1415927/(2.*mx)*x*x)/(my*my);
 return vec4(u_p1<.5?vec3(.5+.5*v):clamp(c.rgb*(1.+v),0.,1.),1.);`,
  'libvips vips_eye: v = y^2 cos(factor pi x^2 / (2 (width-1))) / (height-1)^2 - spatial frequency rising along x up to factor x Nyquist, amplitude rising down y; shown as 0.5 + 0.5 v (working-resolution pixels)');

f = add('Repair');
f('q42_pushpull','Push-Pull Hole Filling (OpenImageIO fillholes_pushpull)',[S('Holes',['Dark pixels below threshold','Bright pixels above threshold','Transparent pixels (alpha)','Green key colour']),P('Threshold',0,1,.1,.005),P('Levels',2,10,9,1)],
  [`int m=int(u_p0+.5);vec4 o=O(uv);float l=luma(o.rgb);float a=m==0?step(u_p1,l):m==1?step(l,1.-u_p1):m==2?o.a:step(u_p1*1.5,length(o.rgb-vec3(0.,1.,0.)));return vec4(o.rgb*a,a);`,
  `vec3 col=vec3(0.);float L=floor(u_p2+.5);for(int k=10;k>=1;k--){float fk=float(k);if(fk>L)continue;float s=exp2(fk);vec4 a=vec4(0.);for(int j=0;j<8;j++)for(int i=0;i<8;i++)a+=T(uv+(vec2(float(i),float(j))-3.5)/8.*s*u_px);
  if(a.a>1e-5){vec3 ck=a.rgb/a.a;col=fk==L?ck:mix(col,ck,clamp(a.a/64.*12.,0.,1.));}}
 vec4 t=T(uv);return vec4(t.rgb+(1.-t.a)*col,1.);`],
  'OpenImageIO fillholes_pushpull: pull = successively halved, alpha-weighted (premultiplied) levels un-premultiplied wherever they have any coverage; push = each finer level composited over the upsampled coarser one, so holes take the colour of the nearest covered region at the finest scale that reaches them; here the 2^k levels are 8x8-tap windows evaluated per pixel (approx. of the decimated pyramid) and holes are taken from alpha, dark, bright or green-key pixels of an opaque image');

f = add('Stylize');
f('q42_crypt','Image Encryption with Key (Plugin Galaxy Cryptology)',[P('Key part 1',0,2097151,123456,1),P('Key part 2',0,2097151,654321,1),P('Key part 3',0,2097151,424242,1),S('Layers',['Colour XOR + pixel scramble','Colour XOR only','Pixel scramble only'])],
  `ivec2 ip=ivec2(floor(uv*u_res));ivec2 sz=ivec2(u_res);uint k1=uint(u_p0),k2=uint(u_p1),k3=uint(u_p2);int m=int(u_p3+.5);
 ivec2 bl=ip/64;uint hb=hh_(uint(bl.x)*0x9e3779b1u^uint(bl.y)*0x85ebca6bu^hh_(k1^hh_(k2^hh_(k3))));ivec2 q=ip;
 if(m!=1){ivec2 qq=ivec2(int(hb&63u),int((hb>>6)&63u));qq=ivec2(ip.x^qq.x,ip.y^qq.y);if(qq.x<sz.x&&qq.y<sz.y)q=qq;}
 vec3 s=texture(u_orig,(vec2(q)+.5)/u_res).rgb;if(m==2)return vec4(s,1.);
 ivec2 lo=ivec2(min(ip.x,q.x),min(ip.y,q.y)),hi=ivec2(max(ip.x,q.x),max(ip.y,q.y));uint h=hh_(uint(lo.x)*0x27d4eb2du^uint(lo.y)*0x165667b1u^uint(hi.x+hi.y*8191)*0x9e3779b9u^hh_(k1*3u^k2*7u^k3*11u));
 uvec3 b=uvec3(floor(clamp(s,0.,1.)*255.+.5));b^=uvec3(h&255u,(h>>8)&255u,(h>>16)&255u);return vec4(vec3(b)/255.,1.);`,
  'approx. of the vendor description only (encrypt / decrypt an image with a 64-bit key): a self-inverse keyed cipher - pixels are swapped inside 64x64 blocks by XOR-ing their coordinates with a key-and-block hash, and each 8-bit channel is XOR-ed with a hash of the swapped pixel pair and the 63-bit key (3 x 21 bits); applying the same key again decrypts exactly at full resolution with 8-bit output');

f = add('Render');
f('q42_vidsynth','Video-Synthesizer Patterns (Plugin Galaxy Synthesizer)',[S('Pattern',['Oscillator bars','Moire rings','Lissajous plasma','Luma-keyed colouriser']),P('Frequency',1,60,10,.5),P('Modulation',0,2,.6,.01),P('Colour cycles',0,6,1.5,.05)],
  `int m=int(u_p0+.5);vec2 q=(uv-.5)*vec2(asp(),1.);float f=u_p1,l=luma(c.rgb),v;
 if(m==0)v=sin(6.2831853*f*q.x+u_p2*3.*sin(6.2831853*f*.33*q.y))*sign(sin(6.2831853*f*.5*q.y+l*u_p2*4.));
 else if(m==1){float r=length(q),a=atan(q.y,q.x);v=sin(6.2831853*f*r+u_p2*2.*sin(a*6.)+l*u_p2*6.)*sin(6.2831853*f*length(q-vec2(.18,.07))*1.03);}
 else if(m==2)v=(sin(6.2831853*f*q.x+3.*sin(6.2831853*f*.21*q.y))+sin(6.2831853*f*.73*q.y+2.*sin(6.2831853*f*.17*q.x))+sin(6.2831853*f*.5*(q.x+q.y)+l*u_p2*6.))/3.;
 else v=sin(6.2831853*(l*u_p3*2.+sin(6.2831853*f*q.y)*u_p2*.15));
 float t=.5+.5*v;t=floor(t*6.+.5)/6.;vec3 col=hsv2rgb(vec3(fract(t*u_p3+.1*float(m)),.85,.25+.75*t));return vec4(col,1.);`,
  'approx. of the vendor description only (synthetic patterns like old video synthesizers): Sandin/Paik-style horizontal and vertical sine/square oscillators with cross- and luma-modulation (bars, moire rings, Lissajous plasma, luma-keyed colouriser), quantised to 7 levels and colourised by hue cycling');
