/* ================= apps2 (part 1): Nuke (Glint, EdgeBlur, Log2Lin, Toe, HueCorrect), Blender compositor (Glare, Box Sharpen, SMAA/FXAA, Rh Simple), GIMP/GEGL (Alien Map, Color Enhance, Predator, c2g/STRESS, Color Assimilation Grid) ================= */
f = add('Render');
f('nk_glint','Glint (Nuke)',[P('Rays',2,16,5,1),P('Length',4,200,40,1,'px'),P('Tolerance',0,1,.75,.01),P('Rotation',0,360,0,1,'deg')],
  [`vec3 o=O(uv).rgb;return vec4(o*smoothstep(u_p2,min(u_p2+.12,1.001),luma(o)),1.);`,BH('u_p1/40.'),BV('u_p1/40.'),
   `vec3 acc=vec3(0.);float n=floor(u_p0+.5);float Ln=R(u_p1);
   for(int a=0;a<16;a++){if(float(a)>=n)break;float an=radians(u_p3)+6.28318*float(a)/n;vec2 d=vec2(cos(an),sin(an))*u_px;
    vec3 rm=vec3(0.);for(int i=1;i<=32;i++){float t=float(i)/32.;float w=1.-t;rm=max(rm,T(uv-d*t*Ln).rgb*w*w);}acc=max(acc,rm);}
   acc*=1.2;vec3 o=O(uv).rgb;return vec4(o+acc*(1.-.5*o),1.);`],
  'Nuke Glint: star-shaped rays (one-sided, evenly spaced from Rotation) grow out of every pixel brighter than Tolerance, fading quadratically over Length, added to the image (rays combined by maximum, not summed); gathered from a lightly blurred bright pass (approx. of the from/to colour ramp: rays keep the source colour)');

f = add('Blur');
f('nk_edgeblur','EdgeBlur (Nuke)',[P('Size',1,60,6,.5,'px'),P('Edge mult',.5,4,2,.05),S('Matte from',['Luma','Red','Green','Blue','Saturation']),P('Threshold',0,1,.5,.01)],
  [`vec3 o=O(uv).rgb;int s=int(u_p2+.5);float v=s==0?luma(o):s==1?o.r:s==2?o.g:s==3?o.b:rgb2hsv(o).y;return vec4(o,smoothstep(u_p3-.03,u_p3+.03,v));`,
   BH('u_p0'),BV('u_p0'),
   `vec4 b=T(uv);float z=clamp((1.-abs(2.*b.a-1.))*u_p1,0.,1.);return vec4(mix(O(uv).rgb,b.rgb,z),1.);`],
  'Nuke EdgeBlur: blurs the image only in a band around the matte edges (band = where the blurred matte is neither 0 nor 1, widened by Edge mult); the matte is made from a channel threshold because the images here have no alpha');

f = add('Tone');
f('nk_log2lin','Log2Lin (Nuke, Cineon)',[S('Operation',['Log to Lin','Lin to Log']),P('Black',0,1023,95,1),P('White',0,1023,685,1),P('Gamma',.1,2,.6,.01)],
  `float gm=max(u_p3,.01);float off=pow(10.,(u_p1-u_p2)*.002/gm);vec3 o=c.rgb;
  if(u_p0<.5){vec3 l=(pow(vec3(10.),(o*1023.-u_p2)*.002/gm)-off)/(1.-off);l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);}
  vec3 l=${LIN('o')};vec3 cd=(u_p2+log(max(l*(1.-off)+off,vec3(1e-6)))/log(10.)*gm/.002)/1023.;return vec4(clamp(cd,0.,1.),1.);`,
  'Nuke Log2Lin Cineon formula: lin = (10^((code - white) 0.002 / gamma) - offset) / (1 - offset), offset = 10^((black - white) 0.002 / gamma), code = value x 1023 (defaults 95 / 685 / 0.6); Log to Lin shows the linear result through an sRGB view transform, Lin to Log decodes sRGB to linear and writes raw log code values');
f('nk_toe','Toe (Nuke)',[P('Lift',0,.5,.08,.005),P('Rolloff',1,6,2,.1)],
  `vec3 l=${LIN('c.rgb')};l=l+u_p0*pow(max(1.-l,vec3(0.)),vec3(u_p1));return vec4(${SRGB('l')},1.);`,
  'Nuke Toe: lifts black (0 -> Lift) with a rolloff so whites stay put; approx.: out = in + lift (1 - in)^rolloff in linear light (Nuke does not publish its curve)');

f = add('Color');
f('nk_huecorrect','HueCorrect (Nuke)',[S('Curve',['Saturation','Luminance','Red','Green','Blue','Red suppress','Green suppress','Blue suppress'],0),P('Hue',0,360,210,1,'deg'),P('Width',10,180,60,1,'deg'),P('Curve value',0,2,1.6,.01)],
  `vec3 o=c.rgb;vec3 h=rgb2hsv(o);float d=abs(fract(h.x-u_p1/360.+.5)-.5)*360.;float wt=d<u_p2?.5+.5*cos(3.14159*d/u_p2):0.;wt*=smoothstep(0.,.08,h.y);
  float v=mix(1.,u_p3,wt);int m=int(u_p0+.5);vec3 r=o;
  if(m==0)r=mix(vec3(luma(o)),o,v);else if(m==1)r=o*v;else if(m==2)r.r*=v;else if(m==3)r.g*=v;else if(m==4)r.b*=v;
  else{float k=clamp(1.-v,0.,1.);if(m==5)r.r=mix(o.r,min(o.r,max(o.g,o.b)),k);else if(m==6)r.g=mix(o.g,min(o.g,max(o.r,o.b)),k);else r.b=mix(o.b,min(o.b,max(o.r,o.g)),k);}
  return vec4(clamp(r,0.,1.),1.);`,
  'Nuke HueCorrect with one curve point: a raised-cosine bump (Hue, Width) on the chosen curve (1 = identity); sat / lum / r / g / b multiply, the suppress curves limit that channel toward max of the other two (despill) as the value drops below 1; weighted down for near-grey pixels');

/* ---- Blender compositor ---- */
f = add('Render');
f('bl_glare','Glare (Blender: Streaks / Fog Glow / Ghosts)',[S('Type',['Streaks (4)','Streaks (6)','Streaks (8)','Fog Glow','Ghosts']),P('Threshold',0,1,.8,.01),P('Size',8,256,64,1,'px'),P('Strength',0,8,2,.05)],
  [`vec3 l=${LIN('c.rgb')};float th=u_p1;float tl=th<=.04045?th/12.92:pow((th+.055)/1.055,2.4);vec3 b=luma(l)>=tl?max(l-tl,0.)/max(1.-tl,.02):vec3(0.);return vec4(b*u_p3,1.);`,
   BH('(u_p0<2.5?1.:u_p0<3.5?u_p2/24.:u_p2/12.)'),BV('(u_p0<2.5?1.:u_p0<3.5?u_p2/24.:u_p2/12.)'),
   `int m=int(u_p0+.5);vec3 g=vec3(0.);float S=R(u_p2);
   if(m<3){float n=m==0?4.:m==1?6.:8.;float ws=0.;for(int i=0;i<40;i++){ws+=exp(-6.2*float(i)/40.);}
    for(int a=0;a<8;a++){if(float(a)>=n)break;float an=6.28318*float(a)/n;vec2 d=vec2(cos(an),sin(an))*u_px;
     for(int i=0;i<40;i++){float t=float(i)/40.;vec3 cm=vec3(1.,1.-.25*t,1.-.5*t);g+=T(uv-d*t*S).rgb*exp(-6.2*t)*cm;}}
    g/=ws*n*.5;}
   else if(m==3){float wsum=0.;for(int i=0;i<16;i++){float rh=(float(i)+.5)/16.;rh*=rh;float dr=2.*(float(i)+.5)/256.;
     float w=exp(-9.*pow(.25*S*2.,.125)*pow(rh,.25))*rh*dr;for(int k=0;k<12;k++){float an=6.28318*(float(k)+.5*float(i))/12.;vec2 uvv=vec2(cos(an),sin(an))*rh;
      float win=(.5+.5*cos(uvv.x*3.14159))*(.5+.5*cos(uvv.y*3.14159));g+=T(uv+uvv*S*u_px).rgb*w*win;wsum+=w*win;}}
    g=g/max(wsum,1e-6)*3.;}
   else{vec2 cc=uv-.5;float sc[8]=float[8](-1.,-.5,-.25,.35,.6,-1.6,1.25,-.75);vec3 tn[8]=vec3[8](vec3(1.,.6,.3),vec3(.4,.7,1.),vec3(.6,1.,.5),vec3(1.,.4,.8),vec3(.5,.5,1.),vec3(1.,.9,.4),vec3(.4,1.,.9),vec3(1.,.5,.4));
    for(int k=0;k<8;k++){vec2 q=.5+cc*sc[k];vec2 e=min(q,1.-q);float msk=smoothstep(0.,.08,min(e.x,e.y));g+=T(q).rgb*tn[k]*msk*.35;}}
   vec3 o=${LIN('O(uv).rgb')}+g;return vec4(${SRGB('clamp(o,0.,1.)')},1.);`],
  'Blender Glare node (mix 0 = image + glare, in linear light): threshold keeps luminance >= Threshold, minus threshold (normalised here and scaled by Strength since 8-bit images never exceed 1); Streaks = n directions, each a one-sided exponential tail (Blender iterates taps at 4^k spacing with weight fade^d: the same kernel, gathered here) with colour modulation; Fog Glow = Blender kernel exp(-9 (scale r^2)^(1/8)) x raised-cosine window over 2 x Size, polar-sampled; Ghosts = blurred highlights mirrored / scaled through the centre with tints (approx. scale set)');

f = add('Sharpen');
f('bl_boxsharpen','Box Sharpen / Mean Removal',[P('Factor',0,1,.5,.01)],
  `vec2 p=u_px;vec3 s=c.rgb*9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;s-=T(uv+vec2(float(i),float(j))*p).rgb;}return vec4(clamp(mix(c.rgb,s,u_p0),0.,1.),1.);`,
  'Blender Filter node Box Sharpen = Krita Mean Removal: 3x3 kernel (-1 x 8, centre 9), Factor mixes with the input (Diamond Sharpen = the 5-point kernel of Sharpen)');

f = add('Repair');
f('bl_aa','Anti-Aliasing (SMAA / FXAA)',[S('Method',['SMAA (Blender Anti-Aliasing)','FXAA 3.11']),P('Threshold',.01,.5,.1,.005),P('Contrast limit',1,10,2,.1),S('Output',['Anti-aliased','Edges','Blend weights'])],
  [`int m=int(u_p0+.5);vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);float lC=L(uv);
   if(m==1){float lN=L(uv+ey),lS=L(uv-ey),lE=L(uv+ex),lW=L(uv-ex);float mx=max(max(max(lN,lS),max(lE,lW)),lC),mn=min(min(min(lN,lS),min(lE,lW)),lC);float rng=mx-mn;
    if(rng<max(.0312,mx*u_p1))return vec4(u_p3>.5?vec3(0.):c.rgb,1.);if(u_p3>.5)return vec4(1.,1.,1.,1.);
    float lNW=L(uv-ex+ey),lNE=L(uv+ex+ey),lSW=L(uv-ex-ey),lSE=L(uv+ex-ey);
    float eH=abs(lNW+lNE-2.*lN)+2.*abs(lW+lE-2.*lC)+abs(lSW+lSE-2.*lS),eV=abs(lNW+lSW-2.*lW)+2.*abs(lN+lS-2.*lC)+abs(lNE+lSE-2.*lE);bool hor=eH>=eV;
    float l1=hor?lS:lW,l2=hor?lN:lE;float g1=abs(l1-lC),g2=abs(l2-lC);bool st1=g1>=g2;float gs=.25*max(g1,g2);float sl=hor?u_px.y:u_px.x;float la;
    if(st1){sl=-sl;la=.5*(l1+lC);}else la=.5*(l2+lC);vec2 cu=uv;if(hor)cu.y+=sl*.5;else cu.x+=sl*.5;vec2 of=hor?ex:ey;
    vec2 u1=cu-of,u2=cu+of;float e1=L(u1)-la,e2=L(u2)-la;bool r1=abs(e1)>=gs,r2=abs(e2)>=gs;float QS[12]=float[12](1.,1.,1.,1.,1.,1.5,2.,2.,2.,2.,4.,8.);
    for(int i=0;i<12;i++){if(r1&&r2)break;if(!r1){u1-=of*QS[i];e1=L(u1)-la;r1=abs(e1)>=gs;}if(!r2){u2+=of*QS[i];e2=L(u2)-la;r2=abs(e2)>=gs;}}
    float d1=hor?uv.x-u1.x:uv.y-u1.y,d2=hor?u2.x-uv.x:u2.y-uv.y;bool dr1=d1<d2;float dm=min(d1,d2);float po=-dm/(d1+d2)+.5;bool sm=(lC-la)<0.;float fo=(((dr1?e1:e2)<0.)!=sm)?po:0.;
    float lav=(2.*(lN+lS+lE+lW)+lNW+lNE+lSW+lSE)/12.;float so1=clamp(abs(lav-lC)/rng,0.,1.);float so2=(-2.*so1+3.)*so1*so1;fo=max(fo,so2*so2*.75);
    vec2 fu=uv;if(hor)fu.y+=fo*sl;else fu.x+=fo*sl;return vec4(T(fu).rgb,1.);}
   float lLf=L(uv-ex),lTp=L(uv+ey);vec2 dl=vec2(abs(lC-lLf),abs(lC-lTp));vec2 e=step(vec2(u_p1),dl);if(e.x+e.y==0.)return vec4(0.,0.,0.,1.);
   float dR=abs(lC-L(uv+ex)),dB=abs(lC-L(uv-ey)),dLL=abs(lLf-L(uv-2.*ex)),dTT=abs(lTp-L(uv+2.*ey));vec2 mxd=max(dl,vec2(dR,dB));float fm=max(max(mxd.x,mxd.y),max(dLL,dTT));
   e*=step(vec2(fm),u_p2*dl);return vec4(e,0.,1.);`,
   `if(u_p0>.5)return c;vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);vec4 res=vec4(0.);vec4 E=T(uv);
#define A2AR(d1,d2,o1,o2,OUT) {float xl_=-(d1),xr_=(d2)+1.;float s_=0.;for(int k_=0;k_<4;k_++){float x_=(float(k_)+.5)/4.;float y_;if((o1)==(o2)&&(o1)!=0.){float xm_=.5*(xl_+xr_);y_=x_<xm_?(o1)*(xm_-x_)/(xm_-xl_):(o2)*(x_-xm_)/(xr_-xm_);}else{y_=(o1)+((o2)-(o1))*(x_-xl_)/(xr_-xl_);}s_+=y_;}OUT=clamp(s_/4.,-.5,.5);}
   if(E.g>.5){float d1=0.,d2=0.;for(int i=1;i<=16;i++){if(T(uv-ex*float(i)).g<.5)break;d1=float(i);}for(int i=1;i<=16;i++){if(T(uv+ex*float(i)).g<.5)break;d2=float(i);}
    vec2 ql=uv-ex*d1;float cB=T(ql).r,cT=T(ql+ey).r;float o1=(cT>.5&&cB<.5)?.5:(cB>.5&&cT<.5)?-.5:0.;
    vec2 qr=uv+ex*(d2+1.);float rB=T(qr).r,rT=T(qr+ey).r;float o2=(rT>.5&&rB<.5)?.5:(rB>.5&&rT<.5)?-.5:0.;
    float a;A2AR(d1,d2,o1,o2,a);res.r=max(-a,0.);res.g=max(a,0.);}
   if(E.r>.5){float d1=0.,d2=0.;for(int i=1;i<=16;i++){if(T(uv-ey*float(i)).r<.5)break;d1=float(i);}for(int i=1;i<=16;i++){if(T(uv+ey*float(i)).r<.5)break;d2=float(i);}
    vec2 qb=uv-ey*(d1+1.);float cR=T(qb).g,cL=T(qb-ex).g;float o1=(cL>.5&&cR<.5)?.5:(cR>.5&&cL<.5)?-.5:0.;
    vec2 qt=uv+ey*d2;float tR=T(qt).g,tL=T(qt-ex).g;float o2=(tL>.5&&tR<.5)?.5:(tR>.5&&tL<.5)?-.5:0.;
    float a;A2AR(d1,d2,o1,o2,a);res.b=max(-a,0.);res.a=max(a,0.);}
   if(u_p3>1.5)return vec4(res.r+res.g,res.b+res.a,0.,1.);return res;`,
   `if(u_p0>.5)return c;vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);if(u_p3>.5&&u_p3<1.5){float lc=luma(O(uv).rgb);vec2 e=step(vec2(u_p1),vec2(abs(lc-luma(O(uv-ex).rgb)),abs(lc-luma(O(uv+ey).rgb))));return vec4(mix(O(uv).rgb*.4,vec3(1.,.2,.1),max(e.x,e.y)),1.);}
   if(u_p3>1.5)return vec4(c.rgb*2.,1.);
   vec4 w=T(uv);float wU=w.r,wL=w.b,wD=T(uv-ey).g,wR=T(uv+ex).a;vec3 o=O(uv).rgb;float s=wU+wL+wD+wR;if(s<1e-4)return vec4(o,1.);
   vec3 acc=O(uv+ey).rgb*wU+O(uv-ex).rgb*wL+O(uv-ey).rgb*wD+O(uv+ex).rgb*wR;return vec4(mix(o,acc/s,min(s,1.)),1.);`],
  'SMAA 1x as in Blender\'s Anti-Aliasing node, approx.: luma edge detection with local contrast adaptation (exact SMAA rule: edge kept if contrast limit x delta >= max neighbouring delta), edge-end search (16 px each way) and crossing-edge classification, but the pattern areas are integrated analytically (line through the crossing-edge midpoints, U shapes split at the middle) instead of the precomputed area texture, no diagonal / corner-rounding passes; FXAA 3.11 quality preset (12-step search, subpixel 0.75, threshold = edge threshold)');

f = add('Tone');
f('bl_rhsimple','Rh Simple Tone Map (Blender)',[P('Key',0,1,.18,.005),P('Offset',.001,10,1,.01),P('Gamma',.1,5,1,.01)],
  `float ls=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=O((vec2(float(i),float(j))+.5)/16.).rgb;vec3 lq=${LIN('q')};ls+=log(luma(lq)+1e-5);}
  float al=u_p0/exp(ls/256.);vec3 l=${LIN('c.rgb')}*al;l/=l+u_p1;l=pow(max(l,vec3(0.)),vec3(1./max(u_p2,.01)));return vec4(${SRGB('clamp(l,0.,1.)')},1.);`,
  'Blender Tonemap node, Rh Simple (Reinhard): al = key / exp(mean log luminance) (16x16 sample grid), p = c al, p / (p + offset), then ^(1/gamma); computed on the linearised image');

/* ---- GIMP / GEGL ---- */
f = add('Color');
f('gegl_alienmap','Alien Map (GEGL)',[S('Color model',['RGB','HSL']),P('Frequency',0,20,1,.05),P('Phase shift',0,360,0,1,'deg'),P('Phase step per channel',0,360,0,1,'deg')],
  `vec3 x=u_p0<.5?c.rgb:rgb2hsl(c.rgb);vec3 ph=radians(vec3(u_p2,u_p2+u_p3,u_p2+2.*u_p3));vec3 y=.5*(1.+sin((2.*x-1.)*u_p1*PI+ph));
  if(u_p0>.5)y=hsl2rgb(vec3(fract(y.x),y.y,y.z));return vec4(clamp(y,0.,1.),1.);`,
  'GEGL alien-map: out = 0.5 (1 + sin((2 in - 1) freq pi + phase)) per channel on non-linear RGB or on H, S, L; one frequency for all channels, phases = shift + k x step');
f('gegl_colorenhance','Color Enhance (GEGL)',[P('Mix',0,1,1,.01)],
  `vec3 lab;${R10L_LAB('c.rgb','lab')}float C=length(lab.yz);float mn=1e9,mx=0.;
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 q=O((vec2(float(i),float(j))+.5)/16.).rgb;vec3 lq;${R10L_LAB('q','lq')}float cq=length(lq.yz);mn=min(mn,cq);mx=max(mx,cq);}
  if(mx-mn<1e-3)return c;float C2=max((C-mn)/(mx-mn)*100.,0.);vec2 ab=C>1e-4?lab.yz/C*C2:vec2(0.);vec3 nl=vec3(lab.x,ab);vec3 o;${R10L_RGB('nl','o')}return vec4(mix(c.rgb,o,u_p0),1.);`,
  'GEGL color-enhance: in CIE LCh(ab) the chroma is stretched so the image\'s minimum maps to 0 and maximum to 100 (lightness and hue kept); min / max from a 16x16 sample grid, D65 Lab');

f = add('Stylize');
f('gegl_predator','Predator (GIMP)',[P('Edge amount',.5,10,2,.1),S('Pixelize',['Off','On']),P('Pixel size',1,32,3,1,'px')],
  [`vec2 p=u_px;vec3 tl=T(uv+vec2(-p.x,p.y)).rgb,t=T(uv+vec2(0.,p.y)).rgb,tr=T(uv+p).rgb,l=T(uv-vec2(p.x,0.)).rgb,r=T(uv+vec2(p.x,0.)).rgb,bl=T(uv-p).rgb,b=T(uv-vec2(0.,p.y)).rgb,br=T(uv+vec2(p.x,-p.y)).rgb;
   vec3 gx=(tr+2.*r+br)-(tl+2.*l+bl),gy=(tl+2.*t+tr)-(bl+2.*b+br);return vec4(clamp(sqrt(gx*gx+gy*gy)*u_p0*.25,0.,1.),1.);`,
   `vec3 v=c.rgb;if(u_p1>.5){float cs=max(R(u_p2),1.);vec2 p=PX(uv)*u_k;vec2 c0=floor(p/cs)*cs;vec3 s=vec3(0.);for(int j=0;j<6;j++)for(int i=0;i<6;i++){s+=T((c0+(vec2(float(i),float(j))+.5)/6.*cs)/u_res).rgb;}v=s/36.;}
   float m=max(v.r,max(v.g,v.b));return vec4(v*step(m-1e-5,v),1.);`,
   `vec2 p=u_px;vec3 tl=T(uv+vec2(-p.x,p.y)).rgb,t=T(uv+vec2(0.,p.y)).rgb,tr=T(uv+p).rgb,l=T(uv-vec2(p.x,0.)).rgb,r=T(uv+vec2(p.x,0.)).rgb,bl=T(uv-p).rgb,b=T(uv-vec2(0.,p.y)).rgb,br=T(uv+vec2(p.x,-p.y)).rgb;
   vec3 gx=(tr+2.*r+br)-(tl+2.*l+bl),gy=(tl+2.*t+tr)-(bl+2.*b+br);return vec4(clamp(sqrt(gx*gx+gy*gy)*u_p0*.25,0.,1.),1.);`],
  'GIMP Script-Fu Predator: Sobel edge detect (per channel, x amount) -> optional pixelize -> Maximum RGB (only the largest channel kept) -> edge detect again');

f = add('Tone');
f('gegl_envelope','Color to Gray (c2g) / STRESS (GEGL)',[S('Mode',['Color to Gray (c2g)','c2g, enhance shadows','STRESS','STRESS, enhance shadows']),P('Radius',10,1000,300,1,'px'),P('Samples',2,17,4,1),P('Iterations',1,30,10,1)],
  `int m=int(u_p0+.5);vec3 px=${LIN('c.rgb')};float rad=R(u_p1);int ns=int(u_p2+.5),ni=int(u_p3+.5);vec3 rbs=vec3(0.),rgs=vec3(0.);float st=floor(hash(uv*u_res)*95273.);
  for(int it=0;it<30;it++){if(it>=ni)break;vec3 mn=px,mx=px;
   for(int s=0;s<17;s++){if(s>=ns)break;float k=st+float(it*17+s);float an=mod(k,95273.)*2.39996323;float rr=hash(uv*u_res+vec2(float(it)*7.13,float(s)*3.71+1.));rr=rr*rr*rad;
    vec2 q=uv+vec2(cos(an),sin(an))*rr*u_px;q=clamp(q,u_px*.5,1.-u_px*.5);vec3 v0=O(q).rgb;vec3 v=${LIN('v0')};mn=min(mn,v);mx=max(mx,v);}
   vec3 rg=mx-mn;rbs+=mix(vec3(.5),(px-mn)/max(rg,vec3(1e-6)),step(vec3(1e-6),rg));rgs+=rg;}
  rbs/=float(ni);rgs/=float(ni);vec3 emax=px+(1.-rbs)*rgs,emin=px-rbs*rgs;vec3 o;
  if(m<2){float nn=length(m==1?px-emin:px),dd=length(px-emax);o=vec3(nn+dd>0.?nn/(nn+dd):.5);}
  else{vec3 lo=m==3?emin:vec3(0.);vec3 dl=emax-lo;o=mix(vec3(.5),(px-lo)/max(dl,vec3(1e-6)),step(vec3(1e-6),dl));}
  o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`,
  'GEGL envelopes (Kolas, Rizzi & Farup): per iteration a spray of samples (golden-angle angles, radius = rand^2 x Radius) gives min / max; relative brightness and range are averaged -> min / max envelopes. c2g: gray = |p| / (|p| + |p - max|) (enhance shadows: |p - min| in the numerator); STRESS: p / max, or (p - min)/(max - min); linear RGB; per-pixel random sprays, so the result is grainy as in GEGL',1);

f = add('Stylize');
f('gegl_assimgrid','Color Assimilation Grid (GEGL)',[P('Grid size',2,80,23,.5,'px'),P('Saturation',0,10,2.5,.05),P('Angle',-180,180,45,1,'deg'),P('Line thickness',0,1,.4,.01)],
  `vec3 lab;${R10L_LAB('c.rgb','lab')}vec3 gl=vec3(lab.x,0.,0.),sl=vec3(lab.x,lab.yz*u_p1);vec3 gr,sr;${R10L_RGB('gl','gr')}${R10L_RGB('sl','sr')}
  float per=max(R(u_p0),1.);vec2 p=rot(uv*u_res,radians(u_p2))/per;vec2 fr=abs(fract(p)-.5);float hw=(1.-sqrt(1.-clamp(u_p3,0.,1.)))*.5;
  float aa=.7/per;float ln=max(smoothstep(.5-hw-aa,.5-hw+aa,fr.x),smoothstep(.5-hw-aa,.5-hw+aa,fr.y));if(u_p3<=0.)ln=0.;return vec4(mix(gr,sr,ln),1.);`,
  'GEGL color-assimilation-grid: greyscale image (CIE L only) with a grid of lines carrying the over-saturated colour (chroma x Saturation); grid period, angle and line coverage (Line thickness = fraction of area) as in the op; through colour assimilation the grey cells look coloured');
