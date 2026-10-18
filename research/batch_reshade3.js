/* ================= reshade (part 3): retro looks II — bit depths, adaptive Atari ST / Amiga palettes, Mode 7, N64 filtering, LED / e-ink / GB Camera, printers & duplicators ================= */
/* C64 palette (c64-wiki, as in SweetFX Nostalgia) */
const RSH_C64 = `vec3 PL[16]=vec3[16](vec3(0.),vec3(1.),vec3(136.,0.,0.)/255.,vec3(170.,255.,238.)/255.,vec3(204.,68.,204.)/255.,vec3(0.,204.,85.)/255.,vec3(0.,0.,170.)/255.,vec3(238.,238.,119.)/255.,
 vec3(221.,136.,85.)/255.,vec3(102.,68.,0.)/255.,vec3(255.,119.,119.)/255.,vec3(51.)/255.,vec3(119.)/255.,vec3(170.,255.,102.)/255.,vec3(0.,136.,255.)/255.,vec3(187.)/255.);`;

f = add('Retro');
f('retro_bitdepth','Retro Bit Depth & Fixed Palettes',[S('System',['15-bit colour (RGB555)','PS1 15-bit + dither','Mega Drive 9-bit (VDP DAC)','Web-safe 216','BBC Micro Mode 2 (8 colours)','Nostalgia (SweetFX, C64 palette)']),S('Dither',['System default','Off','Bayer 4x4','Bayer 8x8']),P('Pixel size',1,8,1,1,'px'),P('Dither spread',0,2,1,.01)],
  `int sy=int(u_p0+.5);int dm=int(u_p1+.5);float ps=max(u_p2,1.);vec2 cell=sy==4?vec2(2.*ps,ps):vec2(ps);vec2 p=floor(PX(uv)/cell);vec3 s=clamp(T(fromPX((p+.5)*cell)).rgb,0.,1.);
 if(dm==0)dm=sy==1?4:(sy==3||sy==4)?2:sy==5?5:1;
 float b=0.;if(dm==2)b=bayer4(p)-.5+1./32.;else if(dm==3)b=bayer8(p)-.5+1./128.;b*=u_p3;vec3 r;
 if(sy==1&&dm==4){int ix=int(mod(p.x,4.)),iy=int(mod(-p.y-1.,4.));float M[16]=float[16](-4.,0.,-3.,1.,2.,-2.,3.,-1.,-3.,1.,-4.,0.,3.,-1.,2.,-2.);
  r=clamp(floor((s*255.+M[iy*4+ix]*u_p3)/8.),0.,31.)/31.;}
 else if(sy<=1)r=clamp(floor(s*31.+.5+b),0.,31.)/31.;
 else if(sy==2){float LV[8]=float[8](0.,52.,87.,116.,144.,172.,206.,255.);vec3 v=s*255.+b*36.;
  for(int ch=0;ch<3;ch++){float x=v[ch];float bv=0.,bd=1e9;for(int k=0;k<8;k++){float e=abs(x-LV[k]);if(e<bd){bd=e;bv=LV[k];}}r[ch]=bv/255.;}}
 else if(sy==3)r=clamp(floor(s*5.+.5+b),0.,5.)/5.;
 else if(sy==4)r=step(.5,s+b);
 else{${RSH_C64}vec3 x=pow(s,vec3(2.2));if(dm==5)x+=mod(p.x+p.y,2.)<.5?.0833*u_p3:-.0833*u_p3;else x+=b*.15;
  float bd=1e9;r=vec3(0.);for(int k=0;k<16;k++){vec3 dd=x-pow(PL[k],vec3(2.2));float e=dot(dd,dd);if(e<bd){bd=e;r=PL[k];}}
  if(dm==5)r=clamp(r*(mod(p.y,2.)<.5?.75:1.25),0.,1.);}
 return vec4(r,1.);`,
  'RGB555 (5 bits per channel, rounding), PS1 GPU 15-bit dithering (its 4x4 matrix -4..+3 added in 8-bit before the >>3 truncation), Mega Drive / Genesis VDP 3-bit DAC levels 0/52/87/116/144/172/206/255 (normal mode, no shadow/highlight), web-safe 6x6x6 cube, BBC Micro Mode 2 (1-bit RGB, 2:1 wide pixels, flashing colours unused), SweetFX Nostalgia 1.3 (C64 palette matched in linear light, checkerboard dither, type-1 scanlines)');

f('retro_adaptpal','Adaptive Retro Palettes (Atari ST / Amiga)',[S('System',['Atari ST (16 of 512)','Atari STE (16 of 4096)','Amiga OCS (32 of 4096)','Amiga EHB (32 + 32 half-brite)']),S('Dither',['Off','Bayer 4x4','Bayer 8x8']),P('Pixel size',1,8,2,1,'px'),P('Dither spread',0,1,.5,.01)],
  [`int sy=int(u_p0+.5);int K=sy>=2?32:16;bool ehb=sy==3;float lv=sy==0?7.:15.;vec2 ip=floor(uv*u_res);if(ip.y>.5||ip.x>=float(K))return c;int me=int(ip.x);
 vec3 C[32];int st=256/K;for(int k=0;k<32;k++){if(k>=K)break;float id=float(k*st+st/2);C[k]=O((vec2(mod(id,16.),floor(id/16.))+.5)/16.).rgb;}
 for(int it=0;it<7;it++){vec3 S_[32];float N_[32];for(int k=0;k<32;k++){S_[k]=vec3(0.);N_[k]=0.;}
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec3 x=O((vec2(float(i),float(j))+.5)/16.).rgb;float bd=1e9;int bi=0;float bh=1.;
   for(int k=0;k<32;k++){if(k>=K)break;vec3 dd=x-C[k];float e=dot(dd,dd);if(e<bd){bd=e;bi=k;bh=1.;}if(ehb){dd=x-C[k]*.5;e=dot(dd,dd);if(e<bd){bd=e;bi=k;bh=2.;}}}
   S_[bi]+=min(x*bh,vec3(1.));N_[bi]+=1.;}
  for(int k=0;k<32;k++){if(k>=K)break;if(N_[k]>0.)C[k]=S_[k]/N_[k];}}
 return vec4(floor(clamp(C[me],0.,1.)*lv+.5)/lv,1.);`,
   `int sy=int(u_p0+.5);int K=sy>=2?32:16;bool ehb=sy==3;float ps=max(u_p2,1.);vec2 p=floor(PX(uv)/ps);vec3 s=O(fromPX((p+.5)*ps)).rgb;
 float b=0.;if(u_p1>1.5)b=bayer8(p)-.5;else if(u_p1>.5)b=bayer4(p)-.5;s+=b*u_p3*.25;vec3 best=vec3(0.);float bd=1e9;
 for(int k=0;k<32;k++){if(k>=K)break;vec3 pc=T(vec2((float(k)+.5)/u_res.x,.5/u_res.y)).rgb;vec3 dd=s-pc;float e=dot(dd,dd);if(e<bd){bd=e;best=pc;}
  if(ehb){vec3 hc=floor(pc*7.5+.01)/15.;dd=s-hc;e=dot(dd,dd);if(e<bd){bd=e;best=hc;}}}
 return vec4(best,1.);`],
  'per-image palette like a converter would pick: 7 k-means (Lloyd) iterations over a 16x16 sample grid seeded from the grid (EHB clusters accept pixels matching their half-brite copy), entries rounded to the hardware DAC (Atari ST 3 bits, STE / Amiga 4 bits per channel; EHB halves are the 4-bit value >> 1), then nearest-entry mapping with optional ordered dither. Palette is stored in the first row of a scratch pass (needs width >= 32); no per-scanline palette changes (approx.)');

f('mode7','Mode 7 Floor (SNES)',[P('Horizon (from top)',0,.9,.4,.01),P('Camera height',.05,2,.5,.01),P('Rotation',0,360,0,1,'deg'),S('Outside the image',['Tile (repeat)','Clamp (black)'])],
  `float yh=1.-u_p0;float y=uv.y;
 if(y>=yh){float t=floor((y-yh)/max(1.-yh,1e-3)*16.)/16.;return vec4(mix(vec3(.6,.8,1.),vec3(.1,.22,.62),t),1.);}
 float z=u_p1/max(yh-y,1e-4);vec2 w=rot(vec2((uv.x-.5)*asp()*z,z),radians(u_p2));vec2 tu=vec2(.5,.5)+vec2(w.x/asp(),w.y)*.5;
 if(u_p3>.5&&(any(lessThan(tu,vec2(0.)))||any(greaterThan(tu,vec2(1.)))))return vec4(0.,0.,0.,1.);
 tu=fract(tu);vec2 tx=(floor(tu*u_res)+.5)/u_res;return vec4(T(tx).rgb,1.);`,
  'SNES Mode 7 floor: per-scanline affine map of the image as a ground plane seen in perspective (distance = height / rows below the horizon), rotated about the camera at the image centre, nearest-texel sampling, 16-band gradient backdrop above the horizon');

f('retro_texfilter','Retro 3D Texture Filtering (N64 3-point / bilinear / point)',[S('Filter',['N64 3-point','Bilinear (4-point)','Nearest (PS1 point sampling)']),P('Texel size',1,16,6,.5,'px'),S('Colour depth',['24-bit','N64 16-bit RGBA5551 + dither'])],
  [`float ts=R(u_p1);vec2 j=floor(uv*u_res/ts);vec3 a=vec3(0.);for(int y_=0;y_<4;y_++)for(int x_=0;x_<4;x_++)a+=O((j+(vec2(float(x_),float(y_))+.5)/4.)*ts/u_res).rgb;return vec4(a/16.,1.);`,
   `int fm=int(u_p0+.5);float ts=R(u_p1);vec2 tp=uv*u_res/ts-.5;vec2 i=floor(tp),fr=tp-i;
 vec3 c00=T((i+.5)*ts/u_res).rgb,c10=T((i+vec2(1.,0.)+.5)*ts/u_res).rgb,c01=T((i+vec2(0.,1.)+.5)*ts/u_res).rgb,c11=T((i+1.5)*ts/u_res).rgb;vec3 r;
 if(fm==0)r=fr.x+fr.y<=1.?c00+fr.x*(c10-c00)+fr.y*(c01-c00):c11+(1.-fr.x)*(c01-c11)+(1.-fr.y)*(c10-c11);
 else if(fm==1)r=mix(mix(c00,c10,fr.x),mix(c01,c11,fr.x),fr.y);else r=T((floor(uv*u_res/ts)+.5)*ts/u_res).rgb;
 if(u_p2>.5){vec2 q=floor(uv*u_res);int ix=int(mod(q.x,4.)),iy=int(mod(q.y,4.));float M[16]=float[16](0.,6.,1.,7.,4.,2.,5.,3.,1.,7.,0.,6.,5.,3.,4.,2.);r=clamp(floor(r*31.+M[iy*4+ix]/8.),0.,31.)/31.;}
 return vec4(r,1.);`],
  'image box-averaged into texels, then magnified: N64 RDP 3-point filter (texel quad split along the diagonal, barycentric blend of 3 texels: the characteristic triangular / blocky-smooth look), standard bilinear, or PS1-style point sampling; optional 16-bit framebuffer with the RDP magic-square dither');

f('retro_devices','LED Matrix / E-ink / Game Boy Camera',[S('Device',['LED matrix (RGB)','LED matrix (amber)','E-ink (16 grey + ghosting)','Game Boy Camera (DMG screen)','Game Boy Camera (printer grey)']),P('Cell or pixel size',2,24,8,1,'px'),P('Glow / ghosting / edge boost',0,1,.5,.01),P('Contrast',0,2,1,.01)],
  [BH('u_p1*.35'), BV('u_p1*.35'), `int dv=int(u_p0+.5);float cs=R(u_p1);vec2 wp=uv*u_res;vec2 ci=floor(wp/cs);vec2 fr=wp/cs-ci;
 if(dv<=1){vec3 acc=vec3(0.);vec3 core=vec3(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec3 lc=T((ci+o+.5)*cs/u_res).rgb;if(dv==1)lc=vec3(1.,.62,.12)*luma(lc);
   lc=floor(clamp((lc-.5)*u_p3+.5,0.,1.)*15.+.5)/15.;vec2 dd=fr-.5-o;float d2=dot(dd,dd);acc+=lc*exp(-d2*7.);if(i==0&&j==0)core=lc;}
  float disc=smoothstep(.42,.32,length(fr-.5));return vec4(clamp(core*disc+vec3(.035)*disc+acc*u_p2*.3,0.,1.),1.);}
 if(dv==2){vec2 pp=floor(PX(uv));float l=luma(O(uv).rgb);float gl=luma(O(uv+vec2(.035,.06)).rgb);l=mix(l,1.-gl,u_p2*.12)+(gl-l)*u_p2*.08;l=clamp((l-.5)*u_p3*1.15+.5,0.,1.);
  float q=clamp(floor(l*15.+bayer4(pp)),0.,15.)/15.;float pn=vnoise(PX(uv)*.35)*.5+vnoise(PX(uv)*1.3)*.5;
  vec3 wht=vec3(.86,.85,.81)*(1.-.04*pn),blk=vec3(.17,.17,.18);return vec4(mix(blk,wht,q),1.);}
 float l=luma(T((ci+.5)*cs/u_res).rgb);float nb=luma(T((ci+vec2(1.,0.)+.5)*cs/u_res).rgb)+luma(T((ci-vec2(1.,0.)+.5)*cs/u_res).rgb)+luma(T((ci+vec2(0.,1.)+.5)*cs/u_res).rgb)+luma(T((ci-vec2(0.,1.)+.5)*cs/u_res).rgb);
 l+=u_p2*1.2*(l-nb*.25);l=clamp((l-.5)*u_p3*1.2+.5,0.,1.);int q=int(clamp(floor(l*3.+bayer4(ci)),0.,3.));
 vec3 gd[4]=vec3[4](vec3(.06,.22,.06),vec3(.19,.38,.19),vec3(.55,.67,.06),vec3(.61,.74,.06));vec3 gp[4]=vec3[4](vec3(.08),vec3(.38),vec3(.68),vec3(.95,.95,.93));
 vec3 r=dv==3?gd[q]:gp[q];if(dv==3){vec2 e=min(fr,1.-fr);r*=.88+.12*smoothstep(0.,.12,min(e.x,e.y));}return vec4(r,1.);`],
  'LED matrix: one round LED per cell (cell-averaged colour, 4-bit PWM levels, dark unlit LEDs, Gaussian bloom from the 3x3 neighbouring LEDs); E-ink: 16 grey levels with ordered dither on a grey paper (white ~ 0.86, black ~ 0.17) and a faint offset / inverted residue standing in for the previous page ghost (approx.); Game Boy Camera: M64282FP-style edge enhancement (centre minus 4-neighbour mean), contrast, 4 shades by 4x4 ordered dither, DMG green with pixel grid or printer greys');

f('retro_print','Thermal Receipt / Fax / Dot-Matrix / Mimeograph',[S('Output',['Thermal receipt printer','Fax (1-bit G3 standard)','Dot-matrix printer (9-pin)','Mimeograph (black stencil)','Spirit duplicator (purple ditto)']),P('Dot size',1,6,2,.5,'px'),P('Darkness',0,2,1,.01),P('Wear',0,1,.5,.01)],
  `int m=int(u_p0+.5);float ds=R(u_p1);vec2 wp=uv*u_res;vec2 pp=PX(uv);float dk=.35+.65*u_p2;float wr=u_p3;vec3 paper,ink;float cov;float lo_=1.,hi_=0.;for(int j=0;j<10;j++)for(int i=0;i<10;i++){float l_=luma(T((vec2(float(i),float(j))+.5)/10.).rgb);lo_=min(lo_,l_);hi_=max(hi_,l_);}
#define LV(q) clamp((luma(T(q).rgb)-lo_)/max(hi_-lo_,.05),0.,1.)

 if(m==0){vec2 ci=floor(wp/ds);float l=pow(LV((ci+.5)*ds/u_res),dk);float on=step(l,bayer8(ci)*.98+.01);float dot_=smoothstep(.62,.42,length(wp/ds-ci-.5));
  float fade=1.-wr*.55*smoothstep(.35,.8,vnoise(vec2(ci.x*.07,3.)))-wr*.25*fbm(pp*.004);paper=vec3(.98,.97,.94);ink=vec3(.16,.15,.17);cov=on*dot_*clamp(fade,0.,1.);}
 else if(m==1){vec2 cl=vec2(ds,2.*ds);vec2 ci=floor(wp/cl);float row=ci.y;float sh=hash(vec2(row,5.))<.015*wr?(hash(vec2(row,9.))-.5)*12.:0.;vec2 ci2=floor((wp+vec2(sh*ds,0.))/cl);
  float l=pow(LV((ci2+.5)*cl/u_res),dk)+(hash(ci)-.5)*.12*wr;float on=step(l,.5);if(hash(ci+.37)>1.-.004*wr)on=1.-on;if(hash(vec2(row,2.))<.006*wr)on=max(on,step(.3,hash(ci+1.7)));
  paper=vec3(.95,.95,.93);ink=vec3(.08,.08,.09);cov=on;}
 else if(m==2){vec2 ci=floor(wp/ds);float band=floor(ci.y/8.);float off=(hash(vec2(band,1.))-.5)*.6*wr;vec2 cj=floor((wp-vec2(off*ds,0.))/ds);
  float l=pow(LV((cj+.5)*ds/u_res),dk);float on=step(l,bayer4(cj)*.94+.03);float dot_=smoothstep(.7,.5,length((wp-vec2(off*ds,0.))/ds-cj-.5));
  float rib=1.-wr*(.35*hash(vec2(band,4.))+.25*fract(ci.y/8.)*hash(vec2(band,6.)));paper=mix(vec3(.96,.95,.9),vec3(.86,.94,.86),.6*step(.5,fract(uv.y*3.)));ink=vec3(.12,.12,.2);cov=on*dot_*rib;}
 else{float bl=pow(clamp((LV(uv)*.5+(blurL(uv,max(ds*.6,1.))-lo_)/max(hi_-lo_,.05)*.5),0.,1.),dk);float nz=fbm(pp*.02)*.6+fbm(pp*.11)*.4;float th=.5+(nz-.5)*.35*wr;
  cov=smoothstep(th+.06,th-.06,bl);float dens=1.-wr*.45*smoothstep(.45,.75,fbm(pp*.008+3.));if(m==4){dens*=.85;cov=max(cov,.18*smoothstep(th+.25,th,bl));}
  cov*=dens;float sm=smoothstep(.62,.5,pow(LV(uv+vec2(.004,-.003)),dk))*.12*wr;cov=max(cov,sm);
  paper=vec3(.95,.94,.9)*(1.-.04*vnoise(pp*.9));ink=m==3?vec3(.07,.07,.08):vec3(.42,.22,.62);}
 return vec4(mix(paper,ink,clamp(cov,0.,1.)),1.);`,
  'Thermal: 1-bit ordered dots on the head grid, weak columns / streaky fading along the feed (wear), grey-black print on cream paper. Fax: G3 standard resolution (cells 1 x 2, i.e. 204 x 98 dpi), hard 1-bit threshold (all outputs auto-levelled to the image black / white points like a scanner driver), scan-line slips, flipped bits and dropout lines. Dot-matrix: round overlapping dots on a 4x4 ordered dither, 8-row head passes with per-pass misregistration and ribbon wear, green-bar paper. Mimeograph / ditto: thresholded slightly spread ink with blotchy fbm density, offset smudge, purple spirit-duplicator variant (look approximations)', 1);
