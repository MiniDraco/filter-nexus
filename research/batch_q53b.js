/* ================= q53b: round-19 GIMP Plugin Registry scripts, vvvv TextureFX, ArcGIS Pro raster functions, Siril scripts ================= */
// GIMP 2.6 colour balance (cyan-red +20 on midtones and highlights, preserve luminosity) as used by elsamuko Movie 300
const Q53_CB = (src, out) => `{vec3 s_=${src};float r_=s_.r*255.;r_=clamp(r_+20.*.667*(1.-pow((r_-127.)/127.,2.)),0.,255.);
 r_=clamp(r_+20.*(1.075-1./((255.-r_)/16.+1.)),0.,255.);vec3 h_=rgb2hsl(vec3(r_/255.,s_.g,s_.b));
 h_.z=(max(s_.r,max(s_.g,s_.b))+min(s_.r,min(s_.g,s_.b)))*.5;${out}=clamp(hsl2rgb(h_),0.,1.);}`;
// GIMP 2.6 unsharp-mask radius -> Gaussian std dev ((r+1)/sqrt(2 ln 255)), as blur1d radius (= 2 sigma)
const Q53_USMR = (r) => `2.*((${r})+1.)/3.3302`;

f = add('Color');
f('q53_movie300','Movie 300 Look (GIMP registry elsamuko)',[P('Desaturation',-100,0,-60,1),P('Overlay opacity',0,100,60,1),P('Red tint opacity',0,100,80,1),S('Edge amplification',['Off','On'],1)],
  [`vec3 cb;${Q53_CB('c.rgb', 'cb')}return vec4(cb,1.);`,
   `vec2 p=u_px*max(u_k,1.);vec3 tl=T(uv+vec2(-p.x,p.y)).rgb,tc=T(uv+vec2(0.,p.y)).rgb,tr=T(uv+p).rgb,ml=T(uv-vec2(p.x,0.)).rgb,mr=T(uv+vec2(p.x,0.)).rgb,bl=T(uv-p).rgb,bc=T(uv-vec2(0.,p.y)).rgb,br=T(uv+vec2(p.x,-p.y)).rgb;
 vec3 gx=(tr+2.*mr+br)-(tl+2.*ml+bl),gy=(tl+2.*tc+tr)-(bl+2.*bc+br);return vec4(sqrt(gx*gx+gy*gy)/5.66,1.);`,
   `vec3 o=O(uv).rgb;vec3 cb;${Q53_CB('o', 'cb')}vec3 hs=rgb2hsl(o);hs.y*=1.+u_p0/100.;vec3 dz=hsl2rgb(hs);
 vec3 col=dz;col=mix(col,col*dz,.5);float yv=dot(o,vec3(.21,.72,.07));float lv=pow(clamp((yv*255.-70.)/80.,0.,1.),.5);
 for(int k=0;k<2;k++)col=mix(col,col*(col+2.*lv*(1.-col)),u_p1/100.);
 col=mix(col,col*vec3(241.,229.,31.)/255.,.1);col=mix(col,clamp(col+vec3(160.,141.,105.)/255.-128./255.,0.,1.),.5);
 vec3 inv=1.-clamp(o-cb+128./255.,0.,1.);col=mix(col,clamp(col+inv-128./255.,0.,1.),u_p2/100.);
 if(u_p3>.5){vec3 mn=vec3(1.),mx=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 e=T((vec2(float(i),float(j))+.5)/16.).rgb;mn=min(mn,e);mx=max(mx,e);}
  vec3 e=clamp((T(uv).rgb-mn)/max(mx-mn,vec3(1e-3)),0.,1.);float ed=1.-dot(e,vec3(.21,.72,.07));col=mix(col,col*ed,.5);}
 return vec4(col,1.);`],
  'elsamuko-movie-300.scm (GIMP registry, 2010): layer stack re-done in one shader - HSL saturation -60 layer, its multiply at 50 %, two legacy-overlay layers of luminosity levels 70..150 gamma 2 (overlay opacity), yellow (241,229,31) multiply 10 %, sepia (160,141,105) grain merge 50 %, red-tint layer = inverted grain-extract of a colour-balanced copy (cyan-red +20 midtones and highlights, preserve luminosity) grain-merged at 80 %, Sobel edge layer (stretched, desaturated, inverted) multiply 50 %; extra-darkening and grain layers off (grain is hue scatter on grey); approx.: auto-stretch from a 16x16 grid');

f = add('Tone');
f('q53_rainy','Rainy Landscape (GIMP registry elsamuko)',[P('Yellow hues',0,50,20,1),P('Red hues',0,50,30,1),P('Blue cast opacity',0,100,40,1)],
  `vec3 o=c.rgb;vec3 hs=rgb2hsl(o);float hd=hs.x*360.;float sc=mod(floor((hd+30.)/60.),6.);if(hs.y>0.){hd+=sc==0.?u_p1:sc==1.?u_p0:0.;}hs.x=fract(hd/360.);vec3 hv=hsl2rgb(hs);
 float mono=clamp(-.466*o.r+.133*o.g+1.333*o.b,0.,1.);vec3 col=mix(hv,hv*vec3(0.,0.,1.),u_p2/100.*(1.-mono));
 vec3 al=vec3(1.-o.r,1.-o.g,o.b);float aa=max(al.r,max(al.g,al.b));vec3 ex=aa>1e-4?(o-vec3(1.,1.,0.))/aa+vec3(1.,1.,0.):o;
 vec3 vis=mix(o,clamp(o-ex+.5,0.,1.),aa);vec3 pv=vis*(1.-90./127.);float pw=1./(1.-90./127.);
 for(int k=0;k<3;k++){float v=pv[k];float nv=max(v>.5?1.-v:v,0.);nv=.5*pow(2.*nv,pw);pv[k]=v>.5?1.-nv:nv;}
 col=mix(col,pv,clamp(luma(pv),0.,1.));return vec4(col,1.);`,
  'elsamuko-rainy-landscape.scm (GIMP registry): hue-saturation yellow hues +20 deg and red hues +30 deg (GIMP 2.6 60-degree sectors, no overlap), blue (0,0,255) multiply at 40 % masked by the inverted channel-mixer monochrome (-0.466 R + 0.133 G + 1.333 B), and the "Preserve Y" layer (yellow colour-to-alpha copy grain-extracted, legacy brightness -90 / contrast 90, self-masked) on top; approx.: GIMP 2.6 legacy hue sectors and brightness-contrast LUT re-derived');

f = add('Distort');
f('q53_flipcells','FlipCells (GIMP registry flipcells)',[P('Cell size',2,64,8,1,'px')],
  `float cs=u_p0;vec2 W=u_res/u_k;vec2 p=PX(uv);p.y=W.y-p.y;vec2 cl=floor(p/cs)*cs;vec2 q2=cl+cs-(p-cl);q2.y=W.y-q2.y;return T(fromPX(q2));`,
  'flipcells_0806241812.py (Nitrofurano 2008, GIMP registry): every 8x8 cell from the top-left is rotated 180 degrees (pixel (x,y) swapped with (7-x,7-y)); cell size exposed (source fixed 8)');

f('q53_froggyoffset','Offset Alternate Rows / Columns (GIMP registry Offset by froGgy)',[P('Tile width',2,512,32,1,'px'),P('Tile height',2,512,16,1,'px'),S('Mode',['Rows even','Rows odd','Columns even','Columns odd']),P('Offset (0 auto)',-256,256,0,1,'px')],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);float yt=W.y-p.y;int md=int(u_p2+.5);bool rw=md<2;float od=(md==0||md==2)?1.:0.;
 float tw=u_p0,th=u_p1;float off=u_p3==0.?(rw?tw*.5:th*.5):u_p3;
 if(rw){float bd=floor(yt/th);if(mod(bd,2.)==od)p.x=mod(p.x-off,W.x);}else{float bd=floor(p.x/tw);if(mod(bd,2.)==od){yt=mod(yt-off,W.y);p.y=W.y-yt;}}
 return T(fromPX(p));`,
  '00-Offset-by-froGgy_v1.0.scm (froGgy factory, GIMP registry node 25090): every other band of tile height (rows) or tile width (columns) is shifted with wrap-around by the offset (0 = half a tile); Even starts at the second band, Odd at the first');

f = add('Stylize');
f('q53_shadowglow','Shadow Glow (GIMP registry sf-will-glow)',[P('Threshold',-255,255,0,1),P('Hue offset',-180,180,100,1)],
  `float b=u_p0;vec2 p0=vec2(max(b,0.),255.),p1=vec2(b<0.?255.+b:255.,0.);vec3 t=clamp((c.rgb*255.-p0.x)/max(p1.x-p0.x,1.),0.,1.);
 vec3 g=mix(vec3(p0.y),vec3(p1.y),t)/255.;vec3 hs=rgb2hsl(g);hs.x=fract(hs.x+u_p1/360.);g=hsl2rgb(hs);return vec4(max(c.rgb,g),1.);`,
  'sf-will-glow_0.scm (Will Morrison 2010, GIMP registry): duplicate layer, two-point inverting curve (threshold moves the black or white end), hue-saturation hue +100 (exposed), layer mode 10 = lighten only over the original');

f = add('Sharpen');
f('q53_librodo','Manny Librodo Sharpening (GIMP registry)',[P('Radius',0,50,40,.5,'px'),P('Amount',0,5,1.5,.05),P('Threshold',0,50,0,1),P('Opacity',0,100,50,1)],
  [BH(Q53_USMR('u_p0')), BV(Q53_USMR('u_p0')),
   `vec3 o=O(uv).rgb;vec3 df=o-T(uv).rgb;df*=step(vec3(u_p2),abs(2.*df*255.));return vec4(clamp(o+u_p1*df,0.,1.),1.);`,
   `float sg=1.3/3.3302*max(u_k,1.);float w1=exp(-1./(2.*sg*sg)),w2=exp(-1./(sg*sg));vec2 p=u_px;vec3 cc=T(uv).rgb;
 vec3 bl=(cc+w1*(T(uv+vec2(p.x,0.)).rgb+T(uv-vec2(p.x,0.)).rgb+T(uv+vec2(0.,p.y)).rgb+T(uv-vec2(0.,p.y)).rgb)+w2*(T(uv+p).rgb+T(uv-p).rgb+T(uv+vec2(p.x,-p.y)).rgb+T(uv+vec2(-p.x,p.y)).rgb))/(1.+4.*w1+4.*w2);
 vec3 df=cc-bl;df*=step(vec3(u_p2),abs(2.*df*255.));return vec4(clamp(cc+u_p1*df,0.,1.),1.);`,
   `float sg=1.3/3.3302*max(u_k,1.);float w1=exp(-1./(2.*sg*sg)),w2=exp(-1./(sg*sg));vec2 p=u_px;vec3 cc=T(uv).rgb;
 vec3 bl=(cc+w1*(T(uv+vec2(p.x,0.)).rgb+T(uv-vec2(p.x,0.)).rgb+T(uv+vec2(0.,p.y)).rgb+T(uv-vec2(0.,p.y)).rgb)+w2*(T(uv+p).rgb+T(uv-p).rgb+T(uv+vec2(p.x,-p.y)).rgb+T(uv+vec2(-p.x,p.y)).rgb))/(1.+4.*w1+4.*w2);
 vec3 df=cc-bl;df*=step(vec3(u_p2),abs(2.*df*255.));return vec4(mix(O(uv).rgb,clamp(cc+u_p1*df,0.,1.),u_p3/100.),1.);`],
  'sharpen-librodo.scm (GIMP registry "Sharp (Manny Librodo)"): unsharp mask radius 40 with Amount2 1.5 (the script passes amount2 to the first pass too), then two unsharp masks radius 0.3 amount 1.5 (the darken-only / lighten-only merges of identical duplicates are no-ops), layer at 50 % opacity over the original; GIMP 2.6 USM std dev (r+1)/sqrt(2 ln 255), threshold on |2*diff| in 0..255');

f('q53_splitsharp','Split Sharpening (GIMP registry)',[S('Lighten mode',['Off','Mode 1 (x1 t5)','Mode 2 (x4 t15)'],1),S('Darken mode',['Off','Mode 1 (x1 t5)','Mode 2 (x4 t15)'],1)],
  [BH(Q53_USMR('5.')), BV(Q53_USMR('5.')),
   `vec3 o=O(uv).rgb;vec3 df=o-T(uv).rgb;int lm=int(u_p0+.5),dm=int(u_p1+.5);
 vec3 sl=lm==0?o:clamp(o+(lm==1?1.:4.)*df*step(vec3(lm==1?5.:15.),abs(2.*df*255.)),0.,1.);
 vec3 sd=dm==0?o:clamp(o+(dm==1?1.:4.)*df*step(vec3(dm==1?5.:15.),abs(2.*df*255.)),0.,1.);
 vec3 c1=mix(o,min(o,sd),.5);return vec4(mix(c1,max(c1,sl),.5),1.);`],
  'split-sharpening.scm (Andreas Schoenfelder 2009, GIMP registry): two copies at 50 %, a darken-only one and a lighten-only one above it, each unsharp-masked radius 5 with amount 1 / threshold 5 (mode 1) or amount 4 / threshold 15 (mode 2; unreachable from the script menu, which only yields 0 or 1); GIMP 2.6 USM std dev (r+1)/sqrt(2 ln 255)');

f = add('Analysis');
f('q53_trackingdots','Reveal Yellow Tracking Dots (GIMP registry)',[S('Contrast stretch',['Auto (grid estimate)','Off'])],
  [`vec3 o=c.rgb;float v=o.b;v=mix(v,min(v+1.-o.r,1.),.5);v=mix(v,min(v+1.-o.g,1.),.5);return vec4(vec3(v),1.);`,
   `float v=T(uv).r;if(u_p0<.5){float mn=1.,mx=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float e=T((vec2(float(i),float(j))+.5)/16.).r;mn=min(mn,e);mx=max(mx,e);}v=clamp((v-mn)/max(mx-mn,1e-3),0.,1.);}return vec4(vec3(v),1.);`],
  'showyellowtrackingdots.scm (Hatto von Hatzfeld 2008, GIMP registry): decompose RGB, blue at the bottom, inverted red and inverted green as addition layers at 50 %, merged, auto contrast stretch (here min/max from a 16x16 sample grid, approx.)');

f = add('Materials');
f('q53_uvdilate','UV Dilate (vvvv UVDilate)',[P('Max steps',1,32,10,1,'px'),P('Black threshold',0,.1,0,.001)],
  `float th=u_p1;if(max(c.r,max(c.g,c.b))>th)return c;vec2 dv[8]=vec2[8](vec2(-1.,0.),vec2(1.,0.),vec2(0.,1.),vec2(0.,-1.),vec2(-1.,1.),vec2(1.,1.),vec2(1.,-1.),vec2(-1.,-1.));
 vec3 res=c.rgb;float md=1e7;int ms=int(u_p0+.5);vec2 tx=u_px*max(u_k,1.);
 for(int i=1;i<=32;i++){if(i>ms)break;for(int j=0;j<8;j++){vec2 cu=uv+dv[j]*tx*float(i);vec3 sm=T(cu).rgb;
  if(max(sm.r,max(sm.g,sm.b))>th){float cd=length(dv[j])*float(i);if(cd<md){md=cd;vec3 pj=T(cu+dv[j]*tx*float(i)*.25).rgb;res=max(pj.r,max(pj.g,pj.b))>th?sm+(sm-pj)*4.:sm;}}}}
 return vec4(clamp(res,0.,1.),1.);`,
  'VL.Stride.TextureFX Filters/Morphology/UVDilate_TextureFX.sdsl (vvvv): only black texels are filled; 8 directions x MaxSteps rings, the nearest non-black hit wins and is extrapolated 4x against a sample a quarter step further out (for position / normal maps)');

f = add('Render');
f('q53_liquish','Liquish (vvvv TextureFX)',[P('Scale',.5,20,5,.1),P('Time',0,50,0,.05)],
  `
#define Q53RND(z_) fract(sin(dot((z_),vec2(12.9898,78.233)))*43758.5453)
vec2 cc=vec2(uv.x,1.-uv.y)*u_p0;float tm=u_p1;float fv[5];vec2 qv=vec2(0.),rv=vec2(0.);
 for(int s=0;s<5;s++){vec2 pp=s==0?cc+0.*tm:s==1?cc+vec2(1.):s==2?cc+qv+vec2(1.7,9.2)+.15*tm:s==3?cc+qv+vec2(8.3,2.8)+.126*tm:cc+rv;
  float fs=0.,w=1.;for(int o=0;o<4;o++){vec2 ip=floor(pp),u=fract(pp);u=u*u*(3.-2.*u);
   float rs=mix(mix(Q53RND(ip),Q53RND(ip+vec2(1.,0.)),u.x),mix(Q53RND(ip+vec2(0.,1.)),Q53RND(ip+vec2(1.,1.)),u.x),u.y);fs+=w*rs*rs;pp*=2.;w*=.5;}
  fv[s]=fs;if(s==1)qv=vec2(fv[0],fv[1]);if(s==3)rv=vec2(fv[2],fv[3]);}
 float fz=fv[4];vec3 ca=vec3(0.),cb=vec3(1.),cc2=vec3(.5,0.,.15);vec3 col=mix(ca,cb,clamp(4.*fz*fz,0.,1.));col=mix(col,cb,clamp(length(qv),0.,1.));col=mix(col,cc2,clamp(abs(rv.x),0.,1.));
 return vec4(clamp((.2*fz*fz*fz+.6*fz*fz+.5*fz)*atan(col),0.,1.),1.);`,
  'VL.Stride.TextureFX Sources/Liquish_TextureFX.sdsl (vvvv, from mrvux dx11 girlpower): domain-warped fbm f = fbm(p + r), r = fbm(p + q + offsets + time), q = fbm(p) (4-octave squared value noise, sin hash), colours black / white / (0.5,0,0.15) mixed by 4f^2, |q| and |r.x|, output (0.2f^3+0.6f^2+0.5f)*atan(col); TexCoord scaled by Scale');

f = add('Blur');
f('q53_blurperfector','BlurPerfector (vvvv TextureFX)',[P('Radius',0,2,.4,.01),P('Threshold',.01,1,.2,.01)],
  `vec4 cc=c;vec2 w=(u_p0/28.)*u_res/max(u_res.x,u_res.y);vec4 col=cc;float kk=1.;
 for(int k=0;k<16;k++){float i=float(k)/16.;float r=sqrt(i+.05);vec2 of=vec2(r*sin(6.2831853*3.5*i),r*sin(6.2831853*(3.5*i+.25)));
  vec4 nc=T(uv+of*w);float d=distance(nc.rgb,cc.rgb);float t=clamp((d-u_p1)/(0.-u_p1),0.,1.);float kq=sqrt(t*t*(3.-2.*t));col+=nc*kq;kk+=kq;}
 col/=kk;if(kk<2.)col=cc;return vec4(col.rgb,1.);`,
  'VL.Stride.TextureFX Filters/Blur/BlurPerfector_TextureFX.sdsl (vvvv): 16-tap sqrt spiral (3.5 turns) at Radius/28 of the frame, each tap weighted sqrt(smoothstep(Threshold, 0, |rgb - centre|)), centre weight 1, falls back to the centre when the neighbour weights sum below 1');

f = add('Terrain');
const Q53_ASCOL = `vec3 cl[24]=vec3[24](vec3(152.,181.,129.),vec3(114.,168.,144.),vec3(124.,142.,173.),vec3(140.,117.,160.),vec3(180.,123.,161.),vec3(203.,139.,143.),vec3(197.,165.,138.),vec3(189.,191.,137.),
 vec3(141.,196.,88.),vec3(61.,171.,113.),vec3(80.,120.,182.),vec3(119.,71.,157.),vec3(192.,77.,156.),vec3(231.,111.,122.),vec3(226.,166.,108.),vec3(214.,219.,94.),
 vec3(132.,214.,0.),vec3(0.,171.,68.),vec3(0.,104.,192.),vec3(108.,0.,163.),vec3(202.,0.,156.),vec3(255.,85.,104.),vec3(255.,171.,71.),vec3(244.,250.,0.));`;
f('q53_aspectslope','Aspect-Slope Map (ArcGIS Aspect-Slope)',[P('Z factor',1,200,30,1)],
  `vec2 s=u_px*u_k;float z=u_p0;float ta=L(uv+vec2(-s.x,s.y)),tb=L(uv+vec2(0.,s.y)),tc=L(uv+s),md=L(uv-vec2(s.x,0.)),mf=L(uv+vec2(s.x,0.)),bg=L(uv-s),bh=L(uv-vec2(0.,s.y)),bi=L(uv+vec2(s.x,-s.y));
 float dx=((tc+2.*mf+bi)-(ta+2.*md+bg))/8.*z,dy=((bg+2.*bh+bi)-(ta+2.*tb+tc))/8.*z;float sp=100.*sqrt(dx*dx+dy*dy);
 float as_=degrees(atan(dy,-dx));float cm=as_<0.?90.-as_:as_>90.?360.-as_+90.:90.-as_;
 int ac=(cm>337.||cm<=22.)?0:cm<=67.?1:cm<=112.?2:cm<=157.?3:cm<=202.?4:cm<=247.?5:cm<=292.?6:7;int sc=sp<=5.?-1:sp<=20.?0:sp<=40.?1:2;
 ${Q53_ASCOL}return vec4(sc<0?vec3(161./255.):cl[sc*8+ac]/255.,1.);`,
  'ArcGIS Pro Aspect-Slope raster function: Esri 3x3 (Horn) slope and compass aspect on luma x Z factor (1 px cells), 8 aspect classes (N 337.5-22.5 ...) x slope classes 5-20 / 20-40 / >40 percent, < 5 % flat grey 161; Brewer & Marlow 1993 (Auto-Carto 11) colours, RGB table as in the landserf Brewer script (codes 11..83, 0 = grey)');

f = add('Analysis');
f('q53_expandshrink','Expand / Shrink Zones (ArcGIS Expand, Shrink)',[S('Mode',['Expand','Shrink']),P('Cells',1,10,3,1,'px'),P('Levels',2,8,4,1),P('Selected zone',0,7,3,1)],
  `int K=int(u_p2+.5);int zs=min(int(u_p3+.5),K-1);int N=int(u_p1+.5);vec2 st=u_px*max(u_k,1.);
 int z0=int(min(floor(L(uv)*float(K)),float(K-1)));
 if(u_p0<.5){if(z0!=zs){bool hit=false;for(int j=-10;j<=10;j++){if(abs(j)>N||hit)continue;for(int i=-10;i<=10;i++){if(abs(i)>N)continue;
   int zq=int(min(floor(L(uv+vec2(float(i),float(j))*st)*float(K)),float(K-1)));if(zq==zs){hit=true;break;}}}if(hit)z0=zs;}}
 else if(z0==zs){int cn[8]=int[8](0,0,0,0,0,0,0,0);for(int j=-10;j<=10;j++){if(abs(j)>N)continue;for(int i=-10;i<=10;i++){if(abs(i)>N)continue;
   int zq=int(min(floor(L(uv+vec2(float(i),float(j))*st)*float(K)),float(K-1)));if(zq!=zs)cn[zq]++;}}
  int bm=0,bz=-1;for(int k=0;k<8;k++){if(cn[k]>bm){bm=cn[k];bz=k;}}if(bz>=0)z0=bz;}
 return vec4(vec3(float(z0)/float(K-1)),1.);`,
  'ArcGIS Pro Expand / Shrink (Spatial Analyst): luma quantised into integer zones; Expand grows the selected zone into all other zones within N cells (8-connected, chessboard distance, = N morphological 3x3 steps); Shrink replaces selected-zone cells within N cells of another zone by the majority of the surrounding non-selected values (approx.: one window majority instead of iterated per-cell majority)');

f = add('Color');
f('q53_spectralconv','Spectral Conversion: CIR to Natural Colour (ArcGIS)',[P('Mix',0,1,1,.01)],
  `vec3 o=vec3(dot(vec3(.1,.9,0.),c.rgb),dot(vec3(.3,0.,.7),c.rgb),dot(vec3(.1,.1,.8),c.rgb));return vec4(mix(c.rgb,o,u_p0),1.);`,
  'ArcGIS Pro Spectral Conversion raster function with the documented example matrix (rows 0.1 0.9 0 / 0.3 0 0.7 / 0.1 0.1 0.8): a colour-infrared composite (R = NIR, G = red, B = green) to pseudo natural colour; each row sums to 1');

f('q53_hubblematic','HubbleMatic Faux Hubble Palette (Siril DSA script)',[P('Saturation amount',0,2,1,.01)],
  `vec3 o=c.rgb;float g1=min(o.g,(o.r+o.b)*.5);vec3 cm=vec3(o.r,o.r,g1);vec3 cl=${LIN('cm')};float yc=luma(cl);float yt=${LIN('vec3(o.r)')}.x;
 cl=yc>1e-6?cl*yt/yc:vec3(yt);cm=${SRGB('clamp(cl,0.,1.)')};cm.g=min(cm.g,(cm.r+cm.b)*.5);vec3 hs=rgb2hsl(cm);hs.y=clamp(hs.y*(1.+u_p0),0.,1.);
 return vec4(hsl2rgb(hs),1.);`,
  'DSA-HubbleMatic.ssf (Siril scripts): rmgreen (average-neutral SCNR), split, rgbcomp -lum=R with R R G as red green blue, rmgreen again, satu 1; background extraction and autostretch (whole-image steps) left out - input assumed already stretched; approx.: LRGB luminance replacement as linear-luminance scaling and satu as an HSL saturation gain');

f = add('Stylize');
f('q53_aster','Aster Star Glow (Siril script)',[P('Min star diameter',1,60,15,.5,'px'),P('Glow radius',.5,40,10,.5,'px'),P('Glow strength',0,2,.5,.01),P('Glow gamma',.1,3,.7,.01)],
  [`vec3 o=c.rgb;float lm=luma(o);float gv[64];for(int j=0;j<8;j++)for(int i=0;i<8;i++)gv[j*8+i]=luma(T((vec2(float(i),float(j))+.5)/8.).rgb);
 float bk=0.;for(int a=0;a<64;a++){int lo=0,eq=0;for(int b=0;b<64;b++){lo+=gv[b]<gv[a]?1:0;eq+=gv[b]==gv[a]?1:0;}if(lo<=31&&lo+eq>31){bk=gv[a];break;}}
 float wg=0.;if((lm-.2)/.7>.05){float rs=0.;for(int d=0;d<8;d++){float an=float(d)*.7853982;vec2 dr=vec2(cos(an),sin(an))*u_px*u_k;float rr=0.;
   for(int s=1;s<=30;s++){if((luma(T(uv+dr*float(s)).rgb)-.2)/.7<=.05)break;rr=float(s);}rs+=rr+.5;}
  float dm=2.*rs/8.;float lo=max(u_p0-10.,0.),hi=u_p0+10.;float t=clamp((dm-lo)/(hi-lo),0.,1.);wg=t*t*(3.-2.*t);}
 float mk=clamp((lm-bk)/max(1.-bk,1e-3),0.,1.)*wg;return vec4(o*mk,mk);`,
   BH('2.*u_p1'), BV('2.*u_p1'),
   `vec4 bl=T(uv);float pk=1e-3;for(int j=0;j<16;j++)for(int i=0;i<16;i++)pk=max(pk,T((vec2(float(i),float(j))+.5)/16.).a);
 float ga=clamp(pow(clamp(bl.a/pk,0.,1.),max(u_p3,.05))*u_p2,0.,1.);float sm=bl.r+bl.g+bl.b;vec3 cl=sm>1e-6?bl.rgb/sm*3.:vec3(1.);
 vec3 g=clamp(cl*ga,0.,1.);vec3 base=O(uv).rgb;return vec4(1.-(1.-base)*(1.-g),1.);`],
  'Aster.py (Siril scripts) non-linear glow: detection (luma - 0.2)/(0.9 - 0.2) > 0.05, star mask (luma - median)/(1 - median) x smoothstep diameter weight (min diameter +/- feather 20/2), blurred mask peak-normalised, ^gamma x strength, star-colour chromaticity from the blurred mask-weighted RGB, screen blend; approx.: Gaussian blur instead of the default Moffat, median from an 8x8 grid, peak from a 16x16 grid, star diameter from radial extents in 8 directions instead of connected components');
