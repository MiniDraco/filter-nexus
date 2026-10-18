/* ================= q49: Fred Weinhaus ImageMagick scripts (round 18) ================= */
// global min/max over all channels (IM -auto-level, channels together) from a 12x12 grid of the input
const Q49_MM = `float lo=1.,hi=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 s_=O((vec2(float(i),float(j))+.5)/12.).rgb;lo=min(lo,min(s_.r,min(s_.g,s_.b)));hi=max(hi,max(s_.r,max(s_.g,s_.b)));}hi=max(hi,lo+.02);`;
// 2D Gaussian of the previous pass, sigma SG (working px) -> vec3 GB
const Q49_G2 = sg => `float sg_=max(${sg},.4);float st_=max(1.,sg_*3./8.);vec3 GB=vec3(0.);float gw_=0.;for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o_=vec2(float(i),float(j))*st_;float g_=exp(-dot(o_,o_)/(2.*sg_*sg_));GB+=T(uv+o_*u_px).rgb*g_;gw_+=g_;}GB/=gw_;`;
// Dave Hill stage A: brightness multiply + IM sigmoidal contrast (+ / - inverse), midpoint 50%
const Q49_DHA = `vec3 A=clamp(O(uv).rgb*u_p0,0.,1.);float bq=abs(u_p1);if(bq>.01){float a0=1./(1.+exp(bq*.5)),a1=1./(1.+exp(-bq*.5));
 if(u_p1>0.)A=(1./(1.+exp(bq*(.5-A)))-a0)/(a1-a0);else{vec3 yq=clamp(A*(a1-a0)+a0,1e-5,1.-1e-5);A=.5-log(1./yq-1.)/bq;}A=clamp(A,0.,1.);}`;

f = add('Tone');
f('q49_adaptivegamma','Locally Adaptive Gamma (Fred adaptivegamma)',[S('Method',['LCC','PNAE','Hybrid'],2),P('Sigma',1,60,20,1,'px'),P('Hybrid mix',0,100,50,1),S('Colour',['Gray','Keep colour'])],
  [`${Q49_MM}float mg=0.,m2=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){float g=(luma(O((vec2(float(i),float(j))+.5)/12.).rgb)-lo)/(hi-lo);mg+=g;m2+=g*g;}mg/=144.;float sd=sqrt(max(m2/144.-mg*mg,0.));
 float ng=step(.5,mg);float g=(luma(O(uv).rgb)-lo)/(hi-lo);g=mix(g,1.-g,ng);return vec4(g,mix(mg,1.-mg,ng),sd,ng);`,
   BH('u_p1*2.'), BV('u_p1*2.'),
   `${Q49_MM}vec4 t=T(uv);float M=clamp(t.r,0.,1.),mg=clamp(t.g,.02,.98),sd=max(t.b,1e-3);bool ng=t.a>.5;
 float lcc=pow(2.,2.*M-1.);float gn=clamp(log(.5)/log(mg)*(.25/min(.25,sd)),.1,3.);float pn=.1*(M-.01)/(1.-M+.01)+gn;
 int m=int(u_p0+.5);float ex=m==0?lcc:m==1?pn:mix(lcc,pn,u_p2/100.);ex=clamp(ex,.05,8.);
 vec3 a=clamp((O(uv).rgb-lo)/(hi-lo),0.,1.);if(ng)a=1.-a;vec3 r=u_p3<.5?vec3(pow(luma(a),ex)):pow(a,vec3(ex));if(ng)r=1.-r;return vec4(r,1.);`],
  'Fred Weinhaus adaptivegamma: auto-level (channels together), negate if the global mean is bright, local mean M = Gaussian blur (sigma), spatially varying power law out = in^exponent; LCC exponent = 2^(2M-1) (Moroney base 2), PNAE exponent = 0.1(M-0.01)/(1-M+0.01) + gain with gain = log(0.5)/log(global mean) x maxstd/min(maxstd, global std), Hybrid = mix; gray (default) or the same exponent per RGB channel; approx.: maxstd = 0.25, stats from a 12x12 grid');

f('q49_davehill','Dave Hill Effect (Fred davehilleffect)',[P('Brightness',0,2,1,.01),P('Contrast',-10,10,0,.1),P('Gain',0,100,40,1)],
  [`${Q49_DHA}return vec4(A,1.);`, BH('8.'), BV('8.'),
   `${Q49_DHA}vec3 hp=clamp(A-T(uv).rgb+.5,0.,1.);vec3 B=mix(1.-(1.-A)/max(2.*hp,1e-4),A/max(2.*(1.-hp),1e-4),step(.5,hp));return vec4(clamp(B,0.,1.),1.);`,
   `vec3 B=T(uv).rgb;${Q49_G2('R(6.9)')}vec3 hp=clamp(B-GB+.5,0.,1.);vec3 hl=mix(2.*B*hp,1.-2.*(1.-B)*(1.-hp),step(.5,hp));return vec4(mix(B,hl,u_p2/100.),1.);`],
  'Fred Weinhaus davehilleffect: -evaluate multiply brightness, +/-sigmoidal-contrast at 50%, high pass DoG:0,0,4 with 50% bias composited vividlight, second high pass DoG:0,0,6.9 (50% bias) applied with hardlight through a gray(gain) mask; approx.: the page is ambiguous about the last compose (hardlight used)');

f('q49_lucisart','LucisArt-like Effect (Fred lucisarteffect)',[P('Gain',0,3,.3,.05),P('Saturation',0,200,60,1)],
  [`vec4 a=blur1d(u_tex,uv,vec2(1.,0.),R(4.));float g=luma(blur1d(u_tex,uv,vec2(1.,0.),R(12.)).rgb);return vec4(a.rgb,g);`,
   `vec4 a=blur1d(u_tex,uv,vec2(0.,1.),R(4.));float g=blur1d(u_tex,uv,vec2(0.,1.),R(12.)).a;return vec4(a.rgb,g);`,
   `vec3 x=O(uv).rgb;vec4 t=T(uv);vec3 s=screen(x,clamp(x-t.rgb,0.,1.));vec3 n=vec3(1.-t.a);return vec4(mix(2.*s*n,1.-2.*(1.-s)*(1.-n),step(.5,s)),1.);`,
   `vec3 X=T(uv).rgb;${Q49_G2('R(9.)')}vec3 r=clamp(X+u_p0*(X-GB),0.,1.);return vec4(clamp(sat(r,u_p1/100.),0.,1.),1.);`],
  'Fred Weinhaus lucisarteffect: DoG:0,0,2 (image minus Gaussian sigma 2, unbiased) screened onto the image, desaturated negated copy blurred (sigma 6) overlay-composited, -unsharp 0x9+gain+0, saturation modulate; approx.: HCL chroma scaling replaced by luma-preserving saturation');

f('q49_uwcorrect','Underwater Red Correction (Fred uwcorrect)',[P('Brightness',-100,100,0,1),P('Contrast',-100,100,0,1),P('Saturation',-100,100,0,1),P('Hue',-100,100,0,1)],
  `${Q49_MM}
 #define Q49UW(V0,W0) {vec3 a_=clamp(((V0)-lo)/(hi-lo),0.,1.);float g_=luma(a_);float k_=1.-4.*(g_-.5)*(g_-.5);vec3 tn_=clamp(g_+vec3(.201,-.299,-.299)*k_,0.,1.);W0=screen(a_,tn_);}
 float l2=1.,h2=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 w;Q49UW(O((vec2(float(i),float(j))+.5)/12.).rgb,w)l2=min(l2,min(w.r,min(w.g,w.b)));h2=max(h2,max(w.r,max(w.g,w.b)));}h2=max(h2,l2+.02);
 vec3 r;Q49UW(c.rgb,r)r=clamp((r-l2)/(h2-l2),0.,1.);float sl=max(tan(PI*(u_p1/100.+1.)/4.),0.);float ic=u_p0/100.+(100.-u_p0)/200.*(1.-sl);r=clamp(sl*r+ic,0.,1.);
 vec3 h=rgb2hsl(r);h.y=clamp(h.y*(100.+u_p2)/100.,0.,1.);h.x=fract(h.x+u_p3/200.+1.);return vec4(hsl2rgb(h),1.);`,
  'Fred Weinhaus uwcorrect (method 1): -auto-level, grayscale copy -fill red -tint 50 (IM tint: v = 0.5*fill - intensity(fill), weighted by 1-4(g-0.5)^2), screen composite, -auto-level, -brightness-contrast (IM slope tan(pi(c/100+1)/4)), -modulate 100,100+sat,100+hue in HSL; sharpening omitted');

f = add('Frames');
f('q49_bordereffects','Border Dispersion (Fred bordereffects)',[P('Size',1,40,5,1,'px'),P('Density',1,20,5,.5),P('Curviness',0,20,5,.5),S('Background',['White','Black'])],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);float v;if(u_p2<.25)v=hash(floor(p));else{v=vnoise(p/(u_p2*1.2)+vec2(7.3,1.9));v=clamp((v-.5)*1.5+.5,0.,1.);}
 float an=u_p1*v*6.2832;vec2 q=p+u_p0*vec2(sin(an),cos(an));float b=u_p0+2.;float m=step(b,q.x)*step(q.x,W.x-b)*step(b,q.y)*step(q.y,W.y-b);
 return vec4(mix(vec3(u_p3<.5?1.:0.),c.rgb,m),1.);`,
  'Fred Weinhaus bordereffects: white rectangle with a black border of size+pad (pad 2) displaced by a random map v: sample at (x + size sin(2 pi density v), y + size cos(2 pi density v)), image shown where the displaced mask is white, background colour elsewhere; v = per-pixel random noise (curviness 0) or blurred, contrast-stretched noise (approx. value noise of matching scale)', true);

f('q49_perforations','Film Perforations Border (Fred perforations)',[P('Number',2,30,8,1),P('Size',1,15,6,.5),S('Position',['Long sides','Top and bottom','Left and right']),P('Hole aspect',.3,3,.7,.05)],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);int m=int(u_p2+.5);bool tb=m==1||(m==0&&W.x>=W.y);vec2 q=tb?p:p.yx;vec2 Wq=tb?W:W.yx;
 float md=min(W.x,W.y);float ht=max(floor(md*u_p1/100.+.5),2.);float wd=max(floor(u_p3*ht+.5),1.);float rd=.15*(wd+ht);float n=floor(u_p0);float cw=floor(Wq.x/n),ch=floor(2.*ht);
 float yy=min(q.y,Wq.y-q.y);if(yy>=ch)return c;if(q.x>=cw*n)return vec4(0.,0.,0.,1.);
 vec2 e=abs(vec2(mod(q.x,cw)-cw*.5,yy-ch*.5))-vec2(wd,ht)*.5+rd;float sd=length(max(e,0.))+min(max(e.x,e.y),0.)-rd;return vec4(vec3(1.-smoothstep(-.5,.5,sd)),1.);`,
  'Fred Weinhaus perforations (black border): hole height = size% of the smaller dimension, width = ratio x height, rounded rectangle centred in cells of floor(W/number) x 2 height, tiled along the two long sides (or chosen pair), black band with white holes; approx.: ratio (Hole aspect) and corner factor 0.15 are not stated on the page, aged/faded borders omitted');

f = add('Stylize');
f('q49_colorcells','Random Colour Cells (Fred colorcells)',[P('Cells across',2,32,8,1),P('Percent',0,100,50,1),P('Grid thickness',0,10,0,1,'px'),P('Ellipse diameter',0,100,70,1)],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);float n=floor(u_p0);vec2 cs=floor(W/n);vec2 ci=min(floor(p/cs),vec2(n-1.));
 float rr=hash(ci+vec2(1.,7.));float fac=rr>(100.-u_p1)/100.?rr:0.;
 if(u_p3>0.){vec2 cn=W*.5,ax=W*u_p3/200.;vec2 np=clamp(cn,ci*cs,ci*cs+cs);vec2 dd=(np-cn)/ax;if(dot(dd,dd)>1.)fac=0.;}
 vec3 h=rgb2hsl(c.rgb);h.x=fract(h.x+fac*hash(ci+vec2(13.,3.)));vec3 col=hsl2rgb(h);
 if(u_p2>0.){float t=2.*ceil(u_p2*.5);vec2 fq=p-ci*cs;vec2 e=min(fq,cs-fq);if(min(e.x,e.y)<t*.5)col=vec3(1.);}return vec4(col,1.);`,
  'Fred Weinhaus colorcells: image split into numx x numy cells; per cell rr = random, factor = rr if rr > (100-percent)/100 else 0, -modulate 100,100,(100 + factor x random x 200) (HSL hue shift up to 360 deg); cells touching the elliptical mask (diameters % of image) only; optional white grid lines', true);

f('q49_hexagons','Hexagons of Rotated Input (Fred hexagons)',[P('Cell size',5,100,33,1),P('Edge thickness',0,10,0,.5,'px'),S('Edge colour',['Black','White'])],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);float md=min(W.x,W.y);float cs=max(u_p0/100.*md,8.);float Rh=cs*.5;vec2 L2=vec2(3.*Rh,1.7320508*Rh);
 vec2 a=mod(p,L2)-L2*.5;vec2 b=mod(p-L2*.5,L2)-L2*.5;vec2 d=dot(a,a)<dot(b,b)?a:b;vec2 cn=p-d;float an=hash(floor(cn/(Rh*.5)+.5))*6.2832;
 vec2 q=rot(d,an)/(cs*1.4142);vec3 col=O(fromPX(W*.5+q*md)).rgb;
 float hd=max(abs(d.y),abs(d.x)*.8660254+abs(d.y)*.5);if(u_p1>0.&&hd>Rh*.8660254-R(u_p1)*.5/u_k)col=vec3(u_p2<.5?0.:1.);return vec4(col,1.);`,
  'Fred Weinhaus hexagons: centre-cropped square of the input scaled to ~sqrt(2) x cell size, rotated by a random angle per cell and masked into a hexagonal tiling, optional coloured hexagon edges; approx.: flat-top hexagon orientation assumed', true);

f('q49_polyring','Polygon Ring (Fred polyring)',[P('Copies',3,12,6,1),S('Background',['White','Black'])],
  `vec2 W=u_res/u_k;float N=floor(u_p0);float ang=6.2832/N;float w=W.x,h=W.y;float rad=h*.5+w/(2.*tan(ang*.5));float ext=length(vec2(rad+h*.5,w*.5))*1.03;
 vec2 P0=(PX(uv)-W*.5)*2.*ext/min(w,h);P0.y=-P0.y;vec3 col=vec3(u_p1<.5?1.:0.);
 for(int i=1;i<=12;i++){if(float(i)>N)break;float r1=float(i)*ang;vec2 dq=P0-rad*vec2(cos(r1),sin(r1));float r2=r1+1.5707963;float cr=cos(r2),sr=sin(r2);
  vec2 sp=vec2(cr*dq.x+sr*dq.y,-sr*dq.x+cr*dq.y)+vec2(w,h)*.5;if(sp.x>=0.&&sp.x<w&&sp.y>=0.&&sp.y<h)col=O(vec2(sp.x/w,1.-sp.y/h)).rgb;}
 return vec4(col,1.);`,
  'Fred Weinhaus polyring (polygon format): N copies, angle step 360/N, ring radius = h/2 + w/(2 tan(angle/2)), copy i placed at radius x (cos, sin)(i x angle) and rotated by i x angle + 90 deg (-distort SRT) so the bottoms meet, merged over the background and fitted to the frame; ring format omitted');

f('q49_rgbdots','Primary RGB Dots (Fred rgbdots)',[P('Threshold',0,100,50,1),P('Dot size',1,12,2,1,'px'),S('Fill colour',['White','Black'])],
  `float ds=max(floor(u_p1),1.);vec2 cl=floor(PX(uv)/ds);float tx=mod(cl.x,4.),ty=mod(cl.y,3.);vec3 fc=vec3(u_p2<.5?1.:0.);
 vec3 m=tx<.5?(ty<.5?vec3(1.,0.,0.):ty<1.5?vec3(0.,1.,0.):vec3(0.,0.,1.)):(ty<.5?fc:vec3(1.));
 uvec3 xb=uvec3(clamp(O(fromPX((cl+.5)*ds)).rgb,0.,1.)*65535.+.5)&uvec3(m*65535.+.5);vec3 v=vec3(xb)/65535.;return vec4(step(u_p0/100.+1e-6,v),1.);`,
  'Fred Weinhaus rgbdots: 4x3 tile = 1x3 column of red/green1/blue pixels appended to a 3x1 strip of the fill colour on white, tiled over the image, -evaluate-sequence And (bitwise, 16-bit), then per-channel -threshold; Dot size scales the tile pixels');

f('q49_toonizarro','Toonizarro Cartoon (Fred toonizarro)',[P('Filter',1,8,3,1,'px'),P('Sigma',.5,6,2,.1,'px'),P('Gain',0,8,4,.1),P('Edge thickness',0,5,0,1,'px')],
  [`return vec4(kuwa(uv,u_p0),1.);`,
   `vec3 K=T(uv).rgb;${Q49_G2('R(u_p1)')}return vec4(clamp(K+u_p2*(K-GB),0.,1.),1.);`,
   `vec4 t=T(uv);if(u_p3<.5)return vec4(t.rgb,0.);float ds=max(1.,R(u_p3)*.6);vec2 g=sobelD(uv,ds)/4.;float gm=length(g);vec2 dn=gm>1e-5?g/gm:vec2(1.,0.);
 float g1=length(sobelD(uv+dn*ds*u_px,ds))/4.,g2=length(sobelD(uv-dn*ds*u_px,ds))/4.;float mx=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)mx=max(mx,length(sobelD(uv+vec2(float(i),float(j))*ds*u_px,ds))/4.);
 float e=(gm>=g1&&gm>=g2&&gm>=.2&&mx>=.4)?1.:0.;return vec4(t.rgb,e);`,
   `vec4 t=T(uv);if(u_p3<.5)return vec4(t.rgb,1.);int k=int(u_p3+.5)-1;float e=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(abs(i)+abs(j)>k)continue;e=max(e,T(uv+vec2(float(i),float(j))*max(u_k,1.)*u_px).a);}return vec4(t.rgb*(1.-e),1.);`],
  'Fred Weinhaus toonizarro: -kuwahara filter, -unsharp 0xsigma+gain+0, optional black Canny edges (low 20%, high 40%) dilated with a diamond of thickness-1; approx.: Canny = Sobel at thickness scale + non-maximum suppression + one-step hysteresis');

f = add('Sharpen');
f('q49_furrowed','Furrowed Wrinkle Grit (Fred furrowed)',[P('Amount',.5,8,2,.1,'px'),P('Smoothing',0,4,0,.1,'px'),P('Gain',0,20,10,.5),P('Saturation',0,200,30,1)],
  `${Q49_MM}float s2=max(R(u_p0),.5),s1=R(min(u_p1,u_p0*.95));float st=max(1.,s2*3./8.);vec3 a2=vec3(0.),a1=vec3(0.);float w2=0.,w1=0.;
 for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){vec2 o=vec2(float(i),float(j))*st;vec3 v=O(uv+o*u_px).rgb;float dq=dot(o,o);float g2=exp(-dq/(2.*s2*s2));a2+=v*g2;w2+=g2;if(s1>.3){float g1=exp(-dq/(2.*s1*s1));a1+=v*g1;w1+=g1;}}
 vec3 x=O(uv).rgb;vec3 b1=s1>.3?a1/w1:x;vec3 A=clamp((x-lo)/(hi-lo),0.,1.);vec3 hp=clamp(.5+u_p2*(b1-a2/w2)/(hi-lo),0.,1.);float gr=luma(A);
 vec3 ov=mix(2.*A*hp,1.-2.*(1.-A)*(1.-hp),step(.5,A));vec3 r=clamp(mix(A,ov,gr),0.,1.);vec3 h=rgb2hsl(r);h.y=clamp(h.y*u_p3/100.,0.,1.);return vec4(hsl2rgb(h),1.);`,
  'Fred Weinhaus furrowed: -auto-level, high pass = 50% bias + gain x DoG:0,smoothing,amount, overlay composite of the high pass onto the image using the grayscale copy as mask, -modulate 100,saturation; approx.: three-image composite order inferred');

f = add('Distort');
f('q49_mottle','Mottle Displace (Fred mottle)',[P('Amount',0,30,5,.5,'px'),P('Granularity',1,30,5,.5,'px')],
  `vec2 p=PX(uv);float v=vnoise(p/(u_p1*2.)+vec2(3.7,1.3));v=clamp((v-.5)*1.6+.5,0.,1.);return vec4(O(fromPX(p+vec2(u_p0*(2.*v-1.)))).rgb,1.);`,
  'Fred Weinhaus mottle (type displace): random noise blurred with sigma = granularity, contrast-stretched, green channel used as a -displace map of amount x amount px (offset = amount (2v-1) in x and y); approx.: blurred noise = value noise of matching scale; modulate/blend types not documented', true);

f('q49_splice','Jagged Cut and Splice (Fred splice)',[P('Top',5,60,30,1),P('Bottom',5,60,30,1),P('Max offset',0,60,15,1,'px'),P('Shadow opacity',0,100,100,1)],
  `vec2 W=u_res/u_k;float tH=W.y*u_p0/100.,bH=W.y*u_p1/100.,gp=10.,mo=u_p2,sb=4.,dd=4.;float Yt=tH+gp+bH;float sgw=W.x/9.;
 vec2 pm=PX(uv);pm.y=W.y-pm.y-(W.y-Yt)*.5;
 float sh=0.,sw=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j))*sb*.7;float g=exp(-dot(o,o)/(2.*sb*sb));vec2 q=pm-vec2(dd)-o;
  float kq=floor(q.x/sgw);float fq=fract(q.x/sgw);float h0=(kq<.5||kq>8.5)?0.:(hash(vec2(kq,3.1))-.5)*2.*mo;float k1=kq+1.;float h1=(k1<.5||k1>8.5)?0.:(hash(vec2(k1,3.1))-.5)*2.*mo;float of=mix(h0,h1,fq);
  float cv=(q.x>=0.&&q.x<W.x&&q.y>=0.&&q.y<Yt&&(q.y<tH+of||q.y>=tH+gp+of))?1.:0.;sh+=cv*g;sw+=g;}
 float kq=floor(pm.x/sgw);float fq=fract(pm.x/sgw);float h0=(kq<.5||kq>8.5)?0.:(hash(vec2(kq,3.1))-.5)*2.*mo;float k1=kq+1.;float h1=(k1<.5||k1>8.5)?0.:(hash(vec2(k1,3.1))-.5)*2.*mo;float of=mix(h0,h1,fq);
 vec3 col=vec3(1.-u_p3/100.*sh/sw);bool ins=pm.x>=0.&&pm.x<W.x&&pm.y>=0.&&pm.y<Yt;
 if(ins&&pm.y<tH+of)col=O(fromPX(vec2(pm.x,W.y-pm.y))).rgb;else if(ins&&pm.y>=tH+gp+of){float ys=pm.y-tH-gp+W.y-bH;col=O(fromPX(vec2(pm.x,W.y-ys))).rgb;}
 return vec4(col,1.);`,
  'Fred Weinhaus splice: top and bottom sections (percent of height) cut along a shared zigzag with 8 interior vertices of random vertical offset up to maxoffset, bottom piece placed a 10 px gap below the top, shadow (blur 4, offset 4, opacity) merged over white, centred in the frame; approx.: offsets symmetric +/- maxoffset', true);

f('q49_weave','Irregular Weave Distortion (Fred weave)',[P('Distortion',0,20,7,.5,'px'),P('Blur',0,10,4,.5,'px'),P('Tile size',4,30,9,1,'px'),P('Opacity',0,100,100,1)],
  [`vec2 q=rot(PX(uv),.7853982)/u_p2;vec2 fq=fract(q);float o=2./9.;float pt=step(o,fq.x)*step(fq.x,1.-o)*step(o,fq.y)*step(fq.y,1.-o);vec3 x=O(uv).rgb;return vec4(mix(x,softLight(x,vec3(pt)),u_p3/100.),1.);`,
   BH('u_p1*2.'), BV('u_p1*2.'),
   `float v=luma(T(uv).rgb);vec2 p=PX(uv)+vec2(u_p0*(2.*v-1.));vec2 q=rot(p,.7853982)/u_p2;vec2 fq=fract(q);float o=2./9.;float pt=step(o,fq.x)*step(fq.x,1.-o)*step(o,fq.y)*step(fq.y,1.-o);vec3 x=O(fromPX(p)).rgb;return vec4(mix(x,softLight(x,vec3(pt)),u_p3/100.),1.);`],
  'Fred Weinhaus weave (kind image): tile (outer 9x9 with inner rectangle offset 2) tiled, rotated 45 deg, composited softlight with opacity onto the image, grayscale copy blurred (sigma) used as a -displace map of distortion px; approx.: the tile content (white inner rectangle on black) is inferred from the option text');

f('q49_xpand','Non-uniform Outward Stretch (Fred xpand)',[P('Stretch factor',1,2.5,1.33,.01),S('Direction',['Horizontal','Vertical'])],
  `vec2 W=u_res/u_k;bool hz=u_p1<.5;vec2 Ws=hz?W:W.yx;vec2 Os=vec2(Ws.x*u_p0,Ws.y);vec2 p=PX(uv)-W*.5;p=hz?p:p.yx;vec2 Wf=hz?W:W.yx;float s=min(Wf.x/Os.x,Wf.y/Os.y);vec2 op=p/s+Os*.5;
 if(op.x<0.||op.x>Os.x||op.y<0.||op.y>Os.y)return vec4(0.,0.,0.,1.);float wc=(Ws.x-1.)*.5,oc=(Os.x-1.)*.5;float d=op.x-oc;float sx=wc+d+sign(d)*d*d*(wc-oc)/(oc*oc);
 vec2 sp=vec2(sx,op.y);sp=hz?sp:sp.yx;return vec4(O(fromPX(sp)).rgb,1.);`,
  'Fred Weinhaus xpand: output dimension D = factor x input along the stretch axis, source x = wc + d + sign(d) d^2 (wc-oc)/oc^2 with d = i - oc (wc, oc input/output centres), centre unchanged and edges stretched most; result letterboxed into the frame; protect region not implemented');

f('q49_warplog','Logarithmic Warp Resize (Fred warplog)',[P('Width factor',.5,3,1,.05),P('Height factor',.5,3,1,.05),S('Warp',['Horizontal','Vertical','Both'])],
  `vec2 W=u_res/u_k;int m=int(u_p2+.5);bool wx=m!=1,wy=m!=0;vec2 Os=vec2(wx?W.x*u_p0:W.x,wy?W.y*u_p1:W.y);float s=min(W.x/Os.x,W.y/Os.y);vec2 op=(PX(uv)-W*.5)/s+Os*.5;
 if(op.x<0.||op.x>Os.x||op.y<0.||op.y>Os.y)return vec4(0.,0.,0.,1.);op.y=Os.y-op.y;vec2 sp=op*W/Os;
 if(wx)sp.x=exp(log(W.x)*op.x/max(Os.x-1.,1.))-1.;if(wy)sp.y=exp(log(W.y)*op.y/max(Os.y-1.,1.))-1.;
 if(sp.x<0.||sp.x>W.x||sp.y<0.||sp.y>W.y)return vec4(0.,0.,0.,1.);return vec4(O(fromPX(vec2(sp.x,W.y-sp.y))).rgb,1.);`,
  'Fred Weinhaus warplog: -fx v.p{exp(ln(v.w) i/(w-1))-1, j} - output column i samples source x = W_in^(i/(W_out-1)) - 1 (and likewise rows), virtual pixels black; output size = factor x input, letterboxed into the frame');

f('q49_fisheye2pano','Fisheye to Strip Panorama (Fred fisheye2pano)',[P('Horizontal centre',0,360,0,1,'deg'),P('Horizontal range',30,360,360,1,'deg'),S('Format',['Angle','Perspective']),S('Circle centre',['Nadir (looking down)','Zenith (looking up)'])],
  `vec2 W=u_res/u_k;float asp_=2.*u_p1/360.;vec2 Os=vec2(asp_,1.);float s=min(W.x/Os.x,W.y/Os.y);vec2 op=(PX(uv)-W*.5)/s+Os*.5;
 if(op.x<0.||op.x>Os.x||op.y<0.||op.y>1.)return vec4(0.,0.,0.,1.);float vt=1.-op.y;if(u_p2>.5){float vr=1.5707963;vt=.5+atan(tan(vr*.5)*(2.*vt-1.))/vr;}
 float Rr=min(W.x,W.y)*.5;float rr=u_p3<.5?Rr*(1.-vt):Rr*vt;float th=radians(u_p1*op.x/Os.x+u_p0-u_p1*.5-90.);vec2 sp=W*.5+rr*vec2(cos(th),sin(th));
 return vec4(O(fromPX(vec2(sp.x,W.y-sp.y))).rgb,1.);`,
  'Fred Weinhaus fisheye2pano: linear (equidistant) 180 deg circular fisheye, r = f phi; output column -> theta = range x i/(w-1) + (hcen - range/2 - 90), row -> elevation, sample (r cos theta, r sin theta) about the circle centre (radius = half the smaller side); aspect 2 x range/360, letterboxed; Perspective rows follow the depolar workflow ys = h/2 + atan(tan(vrange/2)(2y-1))/vrange; approx.: tilt/level variants merged');

f = add('Blur');
f('q49_striations','Radial / Circular Striations (Fred striations)',[S('Type',['Radial','Circular']),P('Radius',0,100,50,1),P('Center X',0,100,50,1),P('Center Y',0,100,50,1)],
  `vec2 W=u_res/u_k;vec2 p=PX(uv);vec2 cc=W*vec2(u_p2,u_p3)/100.;vec2 d=p-cc;float r=length(d);float rad=u_p1/100.*.5*min(W.x,W.y);if(r<=rad)return c;
 vec2 q=u_p0<.5?cc+d/max(r,1e-4)*rad:cc+vec2(0.,r);return vec4(O(fromPX(q)).rgb,1.);`,
  'Fred Weinhaus striations: -distort depolar about the centre, polar rows beyond the radius replaced by the row at the radius, -distort polar back (radial: every pixel outside the radius takes the colour at the radius along its ray); circular: polar column 0 replicated (rings) outside the radius (approx.: circular case not fully documented)');

f = add('Render');
f('q49_3dcover','3D Box Cover Wrap (Fred 3Dcover)',[P('Side size',5,50,20,1),P('Angle',-80,80,25,1,'deg'),P('Perspective',.1,3,1,.05),S('Background',['White','Black'])],
  `vec2 W=u_res/u_k;float Ws=W.x*u_p0/100.,Wf=W.x-Ws,H=W.y;float a=radians(abs(u_p1));float ca=cos(a),sa=sin(a);bool fl=u_p1<0.;float Dz=3.*max(W.x,H)/u_p2;vec3 pv=vec3(Wf*.5,0.,Ws*.5);
 vec2 bmn=vec2(1e9),bmx=vec2(-1e9);for(int k=0;k<6;k++){float kx=k<2?0.:k<4?Wf:0.;float kz=k<4?0.:Ws;float ky=mod(float(k),2.)<.5?-H*.5:H*.5;vec3 P0=vec3(kx,ky,kz)-pv;vec3 Q=vec3(P0.x*ca-P0.z*sa,P0.y,P0.x*sa+P0.z*ca);vec2 sp=Q.xy*Dz/(Q.z+Dz);bmn=min(bmn,sp);bmx=max(bmx,sp);}
 vec2 ext=(bmx-bmn)*1.08;float sc=max(ext.x/W.x,ext.y/W.y);vec2 s=(PX(uv)-W*.5)*sc+(bmn+bmx)*.5;if(fl)s.x=-s.x;
 vec3 ro=vec3(0.,0.,-Dz),rd=vec3(s,Dz);vec3 ob=vec3(ro.x*ca+ro.z*sa,ro.y,-ro.x*sa+ro.z*ca)+pv;vec3 db=vec3(rd.x*ca+rd.z*sa,rd.y,-rd.x*sa+rd.z*ca);
 float tb=1e9;float ix=-1.;float iy=0.;if(abs(db.z)>1e-6){float t=-ob.z/db.z;vec3 h=ob+db*t;if(t>0.&&h.x>=0.&&h.x<=Wf&&abs(h.y)<=H*.5){tb=t;ix=Ws+h.x;iy=h.y;}}
 if(abs(db.x)>1e-6){float t=-ob.x/db.x;vec3 h=ob+db*t;if(t>0.&&t<tb&&h.z>=0.&&h.z<=Ws&&abs(h.y)<=H*.5){tb=t;ix=Ws-h.z;iy=h.y;}}
 if(ix<0.)return vec4(vec3(u_p3<.5?1.:0.),1.);if(fl)ix=W.x-ix;return vec4(O(vec2(ix/W.x,(iy+H*.5)/H)).rgb,1.);`,
  'Fred Weinhaus 3Dcover: the left (or right, negative angle) side-size strip becomes the spine and the rest the front face of a box rotated about the vertical axis and viewed in perspective (exaggeration factor), fitted to the frame over the background; approx.: ray-cast box replaces the 3Drotate script, vignette/join line/shadow options omitted');

f = add('Materials');
f('q49_woodbrand','Wood Brand Burn (Fred woodbrand)',[P('Blur',0,20,5,.5,'px'),P('Motion blur',0,40,10,1,'px'),P('Brightness',0,100,35,1),S('Brand',['Dark areas','Light areas'])],
  [`float m=step(.5,luma(O(uv).rgb));m=u_p3<.5?1.-m:m;return vec4(vec3(m),1.);`, BH('u_p0*2.'), BV('u_p0*2.'),
   `float m=step(.5,luma(O(uv).rgb));m=u_p3<.5?1.-m:m;vec2 dr=vec2(-.7071,.7071);float sg=max(R(u_p1),.5);float acc=0.,ws=0.;
 for(int i=0;i<32;i++){float x=float(i)/31.*sg*3.;float g=exp(-x*x/(2.*sg*sg));acc+=clamp((T(uv+dr*x*u_px).r-.5)*2.,0.,1.)*g;ws+=g;}float sh=acc/ws*m;
 vec2 p=PX(uv);float t=p.x*.035+fbm(vec2(p.x*.01,p.y*.0015)+3.1)*5.;float gr=.5+.5*sin(t*6.2832);gr=pow(gr,3.);float fib=vnoise(vec2(p.x*.6,p.y*.02));
 vec3 wood=mix(vec3(.82,.62,.40),vec3(.62,.41,.24),gr*.8+fib*.25)*(.92+.16*fbm(p*.02));
 return vec4(mix(wood,wood*u_p2/100.*sh,m),1.);`],
  'Fred Weinhaus woodbrand: brand mask blurred, -auto-level, -level 50x100%, -motion-blur 0xM-135, multiplied by the mask, darkens the HSB-brightness-modulated wood inside the brand (darker toward the edges); approx.: single-image version - the brand is the thresholded input and the wood grain is procedural (the script takes a second wood image)', true);
