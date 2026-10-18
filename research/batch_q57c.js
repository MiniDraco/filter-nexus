/* ================= q57c: round-20 Material Maker nodes (ported from the .mmg GLSL), PPSSPP / Dolphin post-process shaders, Icy plug-ins, Dehancer CMY head ================= */
// Material Maker works in a 0..1 square; here one MM texel of a 2^9 = 512 texture is 1/512 of the image width
f = add('Materials');
f('q57_mm_warpdilate','Warp Dilation (Material Maker)',[S('Mode',['Contour (cw)','Contour (ccw)','Slope']),P('Distance',0,.5,.1,.01),P('Attenuation',0,1,0,.01),P('Height smooth',0,20,4,.5,'px')],
  [BH('u_p3'),BV('u_p3'),`int md=int(u_p0+.5);vec2 hp=u_px;
 #define Q57HM(q_) luma(T(clamp(q_,vec2(0.),vec2(1.))).rgb)
 #define Q57SL(q_) (md==0?vec2(-(Q57HM((q_)+vec2(0.,hp.y))-Q57HM((q_)-vec2(0.,hp.y))),Q57HM((q_)+vec2(hp.x,0.))-Q57HM((q_)-vec2(hp.x,0.))):md==1?vec2(Q57HM((q_)+vec2(0.,hp.y))-Q57HM((q_)-vec2(0.,hp.y)),-(Q57HM((q_)+vec2(hp.x,0.))-Q57HM((q_)-vec2(hp.x,0.)))):vec2(Q57HM((q_)+vec2(hp.x,0.))-Q57HM((q_)-vec2(hp.x,0.)),Q57HM((q_)+vec2(0.,hp.y))-Q57HM((q_)-vec2(0.,hp.y))))
 float e=1./512.;float n=min(u_p1/e,256.);float st=max(1.,n/256.);float v=0.;vec2 p=uv;
 for(int i=0;i<=256;i++){float x=float(i)*e*st;if(x>u_p1)break;v=max(v,luma(O(clamp(p,vec2(0.),vec2(1.))).rgb)*(1.-x/max(u_p1,1e-4)*u_p2));vec2 s=Q57SL(p);float sl=length(s);if(sl<1e-7)break;p+=e*st*s/sl*vec2(1.,asp());}
 return vec4(vec3(v),1.);`],
  'Material Maker warp_dilation_nobuf.mmg: from each point walk Distance in steps of 1/512 along the normalised heightmap slope (Slope = gradient, Contour = gradient rotated -/+ 90 deg), output = max of input x (1 - travelled / distance x attenuation); input = luma, heightmap = luma smoothed by Height smooth; edges clamped instead of wrapped, slope from 1 px differences');
f('q57_mm_slope','Slope Dilation (Material Maker)',[P('Length',.01,1,.2,.01),P('Slope',0,1,1,.01),S('Display',['Height','Hillshade'])],
  [`float d=u_p0;float Lp=d*u_res.x;float st=max(1.,Lp/128.);float bh=-1e9,bx=0.,bs=-1e9;
 for(int i=-128;i<=128;i++){float x=float(i)*st;if(abs(x)>Lp)continue;vec2 q=uv+vec2(x*u_px.x,0.);if(q.x<0.||q.x>1.)continue;float h=luma(O(q).rgb);float sc=h-abs(x)/u_res.x/d;if(sc>bs){bs=sc;bh=h;bx=x/u_res.x;}}
 return vec4(bh,.5+.5*bx/d,0.,1.);`,
   `float d=u_p0;float Lp=d*u_res.x;float st=max(1.,Lp/128.);float best=-1e9;
 for(int j=-128;j<=128;j++){float y=float(j)*st;if(abs(y)>Lp*u_res.y/u_res.x+1.)continue;vec2 q=uv+vec2(0.,y*u_px.y);if(q.y<0.||q.y>1.)continue;vec4 t=T(q);float dx=(t.g-.5)*2.*d;float l=length(vec2(dx,y/u_res.x));if(l<d)best=max(best,t.r-l*u_p1/d);}
 float h=clamp(best,0.,1.);if(u_p2<.5)return vec4(vec3(h),1.);return vec4(vec3(h),1.);`,
   `float h=T(uv).r;if(u_p2<.5)return vec4(vec3(h),1.);vec2 g=vec2(T(uv+vec2(u_px.x,0.)).r-T(uv-vec2(u_px.x,0.)).r,T(uv+vec2(0.,u_px.y)).r-T(uv-vec2(0.,u_px.y)).r)*20.;return vec4(vec3(h)*(.35+.65*clamp(dot(normalize(vec3(-g,1.)),normalize(vec3(-.5,.5,.7))),0.,1.)),1.);`],
  'Material Maker slope.mmg (dilate passes): height cone dilation - pass 1 keeps, along each row, the source maximising h - |dx|/length and its offset; pass 2 takes, along each column, max of h - l*slope/length over l = sqrt(dx^2 + dy^2) < length, so slopes spread downhill from the high areas (lengths in image-width units); MM also runs the transposed pair (left out); input = luma');
f = add('Distort');
f('q57_mm_multiwarp','Multi Warp (Material Maker)',[P('Intensity',0,16,4,.01),P('Quality',1,50,15,1),S('Mode',['Min','Blur','Max']),P('Height smooth',0,20,3,.5,'px')],
  [BH('u_p3'),BV('u_p3'),`float dx=1./512.;vec2 dv=vec2(dx,dx*asp());int it=max(1,int(ceil(u_p0*u_p1)));int md=int(u_p2+.5);vec2 p=uv;vec3 pv=O(uv).rgb,rv=vec3(0.);
 for(int i=0;i<800;i++){if(i>=it)break;float v=luma(T(clamp(p,vec2(0.),vec2(1.))).rgb);vec2 sl=vec2(luma(T(clamp(p+vec2(dv.x,0.),vec2(0.),vec2(1.))).rgb)-v,luma(T(clamp(p+vec2(0.,dv.y),vec2(0.),vec2(1.))).rgb)-v)*2.;
  p+=sl*vec2(1.,asp())*u_p0*u_p0/float(it);vec3 s=O(clamp(p,vec2(0.),vec2(1.))).rgb;rv+=md==0?min(s,pv):md==1?s:max(s,pv);}
 return vec4(rv/float(it),1.);`],
  'Material Maker multi_warp.mmg: ceil(intensity x quality) iterations; each re-reads the heightmap derivative at the current point, slope = (h(x+dx) - h, h(y+dx) - h) * 2 with dx = 1/512, steps by slope x intensity^2 / iterations and accumulates min(in, start) / in / max(in, start); average of the samples; heightmap = luma smoothed by Height smooth; edges clamped');
f = add('Tone');
f('q57_mm_tonesstep','Tones Step (Material Maker)',[P('Value',0,1,.5,.01),P('Width',0,1,.1,.01),S('Invert',['Off','On'])],
  `vec3 v=clamp((c.rgb-vec3(u_p0))/max(.0001,u_p1)+vec3(.5),0.,1.);return vec4(u_p2>.5?1.-v:v,1.);`,
  'Material Maker tones_step.mmg: clamp((in - value)/max(0.0001, width) + 0.5, 0, 1) per channel, optional 1 - x');

/* ---- emulator post-process shaders ---- */
f = add('Distort');
f('q57_ppsspp_fakerefl','Fake Reflections (PPSSPP)',[P('Amount',0,1,.6,.01),P('Power',0,1,.5,.01)],
  `float tx=uv.x,ty=1.-uv.y;vec3 col=c.rgb;float gr=(col.r+col.g+col.b)/3.;float sa=(abs(col.r-gr)+abs(col.g-gr)+abs(col.b-gr))/3.;
 float rx=mod(tx+gr,.03)+mod(ty+sa,.05),ry=mod(ty+sa,.03)+mod(tx+gr,.05);float sp=(max(gr,sa)+.1)*ty;vec2 of=vec2(rx,ry-min(ty,.25))*sp;
 vec3 rf=T(vec2(tx+of.x,1.-(ty+of.y))).rgb;rf*=4.*(1.-gr)*u_p0;rf=rf*rf*sp*u_p1;return vec4(clamp(col+rf,0.,1.),1.);`,
  'PPSSPP assets/shaders/fakereflections.fsh (defaultshaders.ini Amount 0.6, Power 0.5): grey = RGB mean, saturation = mean |c - grey|, pseudo-random offsets mod(t + grey / sat, 0.03 / 0.05), step = (max(grey, sat) + 0.1) * y (grows toward the bottom), reflection sample at uv + (rndx, rndy - min(y, 0.25)) * step, scaled 4 (1 - grey) Amount, squared, x step x Power, added');
f = add('Retro');
f('q57_dolphin_pp','Dolphin Firewater / Acid Metal',[S('Shader',['Firewater','Acid metal'])],
  `if(u_p0<.5){vec4 c1=T(uv+vec2(u_px.x,-u_px.y)),c2=T(uv+vec2(-u_px.x,u_px.y));return vec4(clamp(vec3(c.r-c1.b,0.,c.b-c2.r+(c.g-c.r)),0.,1.),1.);}
 float rb=(c.r>.15&&c.b>.15)?.5:0.;return vec4(rb,clamp(max(c.r+c.b,c.g),0.,1.),rb,1.);`,
  'Dolphin Data/Sys/Shaders: firewater.glsl red = c.r - c(+1,+1).b, green 0, blue = c.b - c(-1,-1).r + (c.g - c.r) (texel offsets in Dolphin y-down order); acidmetal.glsl red = blue = 0.5 where r and b > 0.15 else 0, green = max(r + b, g)');

/* ---- Icy plug-ins ---- */
f = add('Analysis');
f('q57_icy_middlebury','Middlebury Flow Colour Code (Icy)',[S('Flow source',['R / G channels (0.5 = zero)','Luma gradient','Luma isophote (gradient rotated 90)'],1),S('Normalise',['Max over image','Fixed (1 = full)']),P('Smoothing',0,10,2,.1,'px')],
  [BH('u_p2'),BV('u_p2'),`
#define Q57MW(k_) ((k_)<15.?vec3(1.,(k_)/15.,0.):(k_)<21.?vec3(1.-((k_)-15.)/6.,1.,0.):(k_)<25.?vec3(0.,1.,((k_)-21.)/4.):(k_)<36.?vec3(0.,1.-((k_)-25.)/11.,1.):(k_)<49.?vec3(((k_)-36.)/13.,0.,1.):vec3(1.,0.,1.-((k_)-49.)/6.))
#define Q57FL(q_) (src==0?vec2(O(q_).r-.5,-(O(q_).g-.5))*2.:vec2(luma(T((q_)+vec2(u_px.x,0.)).rgb)-luma(T((q_)-vec2(u_px.x,0.)).rgb),luma(T((q_)+vec2(0.,u_px.y)).rgb)-luma(T((q_)-vec2(0.,u_px.y)).rgb))*.5*max(R(u_p2),1.))
 int src=int(u_p0+.5);vec2 fl=Q57FL(uv);if(src==2)fl=vec2(-fl.y,fl.x);float mx=1.;
 if(u_p1<.5){mx=1e-6;for(int j=0;j<14;j++)for(int i=0;i<14;i++){vec2 q=(vec2(float(i),float(j))+.5)/14.;vec2 f2=Q57FL(q);mx=max(mx,length(f2));}}
 float u=fl.x/mx,v=-fl.y/mx;float rad=length(vec2(u,v));float a=atan(-v,-u)/3.14159265;float fk=(a+1.)*.5*54.;float k0=floor(fk),k1=k0+1.>54.5?0.:k0+1.;float fr=fk-k0;
 vec3 cc=mix(Q57MW(k0),Q57MW(k1),fr);cc=rad<=1.?1.-rad*(1.-cc):cc*.75;return vec4(cc,1.);`],
  'Icy Middlebury Color Coder: Baker et al. Middlebury flow colour code (computeColor: 55-colour wheel RY 15, YG 6, GC 4, CB 11, BM 13, MR 6; hue = atan2(-v, -u), saturation = flow radius / max radius, beyond 1 dimmed x0.75); the flow is R / G (0.5 = zero, G = image-down v) or the luma gradient / isophote direction of the smoothed image, normalised by the maximum over a 14x14 sample grid');
f = add('Sharpen');
const Q57_B3 = (j, dir) => `if(${j}.>u_p0+.5)return T(uv);float hd=${1 << (j - 1)}.*max(u_k,1.);vec2 dd=${dir}*hd*u_px;return (T(uv-2.*dd)+T(uv+2.*dd)+4.*(T(uv-dd)+T(uv+dd))+6.*T(uv))/16.;`;
f('q57_icy_udwt','UDWT Wavelet Residual Remover (Icy)',[P('Scale',1,5,3,1),S('Output',['Detail (grey offset)','Detail added to image']),P('Gain',.5,10,2,.1)],
  [1, 2, 3, 4, 5].flatMap(j => [Q57_B3(j, 'vec2(1.,0.)'), Q57_B3(j, 'vec2(0.,1.)')]).concat([`vec3 d=O(uv).rgb-T(uv).rgb;return vec4(clamp(u_p1<.5?.5+d*u_p2:O(uv).rgb+d*u_p2,0.,1.),1.);`]),
  'Icy UDWT Wavelet Residual Remover (de Chaumont; plug-in text: reconstruct up to a scale without adding the residual): undecimated a trous B3-spline wavelet (1 4 6 4 1)/16 with 2^(j-1) holes, as used by Icy Spot Detector; sum of the detail planes 1..Scale = image - smooth plane at Scale, shown on grey or added back (sharpening); wavelet choice assumed from Icy\'s UDWT');

/* ---- Dehancer ---- */
f = add('Film');
f('q57_dehancer_cmy','CMY Enlarger Colour Head (Dehancer)',[P('Yellow-Blue',-50,50,10,.5),P('Magenta-Green',-50,50,0,.5),P('Cyan-Red',-50,50,0,.5),P('Preserve exposure',0,100,100,1,'%')],
  `vec3 a=c.rgb;vec3 x=${LIN('a')};vec3 Dn=vec3(u_p2+.12*u_p1,u_p1+.1*u_p0+.06*u_p2,u_p0+.15*u_p1)*.01;vec3 g=pow(vec3(10.),Dn*1.5);
 float ex=dot(g,vec3(.2126,.7152,.0722));g/=pow(ex,u_p3*.01);vec3 y=clamp(x*g,0.,1.);return vec4(${SRGB('y')},1.);`,
  'approx. of Dehancer CMY Color Head (article: subtractive Y / M / C filters in the enlarger light path; more yellow filtration = bluer print, each filter touches two channels, equal moves still shift colour, Preserve Exposure 100 keeps brightness, 0 lets added filtration lighten the print): filter units = 0.01 density with side absorptions (yellow 0.1 into green, magenta 0.12 into red / 0.15 into blue, cyan 0.06 into green), print gain 10^(1.5 D) per channel in linear light, divided by the luminance gain x preserve; print toning not included');
