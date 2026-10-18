/* ================= Round 9E: CRT & retro display simulation ================= */
f = add('Retro');
f('crtsuite','CRT Shader Suite',[S('Preset',['Royale-style (strong mask)','Geom-style (curved)','Lottes-style (bloom)','Easymode (flat, sharp)','Guest-style (slot mask, glow)']),S('Mask',['Preset default','Aperture grille','Slot mask','Shadow mask (triad)','None']),P('Lines',120,600,240,1),P('Curvature',0,2,1,.01)],
  `int pr=int(u_p0+.5);int mk=int(u_p1+.5);if(mk==0)mk=pr==0?1:pr==1?1:pr==2?3:pr==3?1:2;float cv=(pr==1?.18:pr==3?0.:.08)*u_p3;float msk=pr==0?.55:pr==1?.35:pr==2?.45:pr==3?.25:.45;float glow=pr==2?.35:pr==4?.3:pr==0?.2:.1;float bw=pr==3?.35:.5;
  vec2 q=uv-.5;q*=1.+cv*dot(q,q)*vec2(1.,1.2);vec2 u=q+.5;if(u.x<0.||u.y<0.||u.x>1.||u.y>1.)return vec4(0.,0.,0.,1.);
  vec2 rc=abs(q)*2.;float corner=1.-smoothstep(.0,.04,length(max(rc-vec2(1.-.06*u_p3-.02),0.))-.04*u_p3);
  float NL=min(u_p2,u_res.y/3.);float ln=u.y*NL-.5;float l0=floor(ln);vec3 acc=vec3(0.);for(int k=0;k<2;k++){float li=l0+float(k);vec2 su=vec2(u.x,(li+.5)/NL);vec3 s=(T(su-vec2(u_px.x,0.)).rgb+2.*T(su).rgb+T(su+vec2(u_px.x,0.)).rgb)*.25;float lm=max(s.r,max(s.g,s.b));float w=bw*mix(.65,1.25,lm);float dy=(ln-li)/w;acc+=s*exp(-dy*dy*2.2)*(1.15+.25*lm);}
  vec2 pp=PX(uv)/max(u_k,1.);vec3 m=vec3(1.);if(mk==1){int ph=int(mod(pp.x,3.));m=ph==0?vec3(1.,1.-msk,1.-msk):ph==1?vec3(1.-msk,1.,1.-msk):vec3(1.-msk,1.-msk,1.);}
  else if(mk==2){float col=floor(pp.x/3.);int ph=int(mod(pp.x,3.));m=ph==0?vec3(1.,1.-msk,1.-msk):ph==1?vec3(1.-msk,1.,1.-msk):vec3(1.-msk,1.-msk,1.);if(mod(pp.y+mod(col,2.)*2.,4.)<1.)m*=1.-msk;}
  else if(mk==3){vec2 hp=vec2(pp.x,pp.y*1.1547+mod(floor(pp.x/3.),2.)*1.5);int ph=int(mod(floor(pp.x),3.));m=ph==0?vec3(1.,1.-msk,1.-msk):ph==1?vec3(1.-msk,1.,1.-msk):vec3(1.-msk,1.-msk,1.);m*=mix(1.,.6+.4*smoothstep(.5,.2,abs(fract(hp.y/3.)-.5)),msk);}
  vec3 o=acc*m*(1.+msk*.6);vec3 hb=vec3(0.);for(int k=0;k<8;k++){float a=float(k)*.785;hb+=T(u+vec2(cos(a),sin(a))*R(10.)*u_px).rgb;}o+=hb/8.*glow;return vec4(clamp(o*corner,0.,1.),1.);`,'beam profile widens with brightness; masks at device-pixel pitch (RetroArch crt-* family)');
f('ntscsignal','NTSC Composite Signal',[S('Signal',['Composite','S-Video','RF (antenna)','Bandwidth-limited (GTU-style)']),P('Horizontal resolution',160,720,320,1,'px'),P('Artifact strength',0,2,1,.01),P('Noise',0,1,.25,.01)],
  `int m=int(u_p0+.5);float H=u_p1;float x0=floor(uv.x*H);float line=floor(uv.y*240.);float ph0=line*3.14159;vec3 s=vec3(0.);float ys=0.,is_=0.,qs=0.,wy=0.,wc=0.;
  for(int k=-4;k<=4;k++){float xs=x0+float(k);vec3 c0=T(vec2((xs+.5)/H,uv.y)).rgb;float Y=dot(c0,vec3(.299,.587,.114)),I=dot(c0,vec3(.596,-.274,-.322)),Q=dot(c0,vec3(.211,-.523,.312));float ph=xs*1.5708+ph0;
   float sig=m==1||m==3?Y:Y+(I*cos(ph)+Q*sin(ph))*u_p2;float gy=exp(-float(k*k)/(m==3?6.:m==1?1.5:2.5));float gc=exp(-float(k*k)/(m==1?4.:12.));
   ys+=gy*(m==1||m==3?Y:sig);wy+=gy;is_+=gc*(m==1||m==3?I:sig*cos(ph)*2.);qs+=gc*(m==1||m==3?Q:sig*sin(ph)*2.);wc+=gc;}
  float Y=ys/wy,I=is_/wc,Q=qs/wc;if(m!=1&&m!=3){float ph=x0*1.5708+ph0;Y=mix(Y,Y-(I*cos(ph)+Q*sin(ph))*.5*u_p2,.5);}
  vec2 p=PX(uv);float nz=(hash(p+u_seed)-.5)*u_p3*(m==2?.35:.12);if(m==2){Y+=.08*u_p3*sin(uv.y*40.+uv.x*6.)*step(.7,hash(vec2(line,3.)));Y=mix(Y,dot(T(uv-vec2(.03,0.)).rgb,vec3(.3,.59,.11)),.15*u_p3);}
  vec3 o=vec3(Y+.956*I+.621*Q,Y-.272*I-.647*Q,Y-1.106*I+1.703*Q)+nz;return vec4(clamp(o,0.,1.),1.);`,'YIQ encoded on a 3.58 MHz subcarrier and decoded: dot crawl, chroma bleed, rainbowing',1);
f('lcdgrid','Handheld LCD',[S('Device',['Game Boy DMG (green)','Game Boy Pocket','Game Boy Color / Advance','Generic dot matrix']),P('Pixel size',2,10,4,1,'px'),P('Grid strength',0,1,.6,.01),P('Response blur',0,1,.3,.01)],
  `int m=int(u_p0+.5);float B=max(R(u_p1),1.);vec2 cp=floor(PX(uv)/B),fp=fract(PX(uv)/B);vec3 s=T(fromPX((cp+.5)*B)).rgb;vec3 s2=T(fromPX((cp+vec2(-1.,1.)+.5)*B)).rgb;s=mix(s,max(s,s2),u_p3*.35);float l=luma(s);vec3 o;
  if(m==0){float q=floor(l*3.99)/3.;o=mix(vec3(.06,.22,.06),vec3(.61,.74,.06),q);}else if(m==1){float q=floor(l*3.99)/3.;o=mix(vec3(.12,.12,.11),vec3(.77,.79,.71),q);}
  else if(m==2){vec3 g=pow(s,vec3(1.35));o=vec3(dot(g,vec3(.82,.24,-.06)),dot(g,vec3(.1,.66,.24)),dot(g,vec3(.17,.1,.73)))*.95+.04;}else{o=mix(vec3(.18,.2,.14),vec3(.78,.8,.68),step(.5,l));}
  vec2 e=smoothstep(vec2(0.),vec2(.12),fp)*smoothstep(vec2(1.),vec2(.88),fp);vec3 bg=m==0?vec3(.55,.66,.06):m==1?vec3(.7,.72,.64):m==2?vec3(.85,.87,.84):vec3(.7,.72,.6);return vec4(mix(bg*.92,o,mix(1.,e.x*e.y,u_p2)),1.);`,'DMG/Pocket shades, GBC/GBA colour correction (approx.), pixel grid');
f('vectordisplay','Vector Display (Vectrex Glow)',[P('Line threshold',.02,.5,.12,.01),P('Glow',0,2,.8,.01),S('Phosphor',['White (Vectrex)','Green (Asteroids-era)','Amber'])],
  `float e=length(sobel(uv));float ln=smoothstep(u_p0,u_p0*1.8,e);float g=0.;for(int k=0;k<12;k++){float a=float(k)*.5236;for(int r=1;r<=3;r++){vec2 o=vec2(cos(a),sin(a))*R(float(r*r)*1.5)*u_px;g+=smoothstep(u_p0,u_p0*1.8,length(sobel(uv+o)))/float(r*r);}}
  int m=int(u_p2+.5);vec3 ph=m==0?vec3(.85,.9,1.):m==1?vec3(.3,1.,.45):vec3(1.,.7,.25);return vec4(clamp(ph*(ln+g/12.*u_p1),0.,1.),1.);`,'edges drawn as glowing beam lines on black');
f('bezel','Arcade Bezel Reflection',[P('Screen size',.6,.95,.8,.01),P('Reflection',0,1,.5,.01),P('Bezel tone',0,.4,.08,.01)],
  `vec2 q=(uv-.5)/u_p0+.5;bool inS=q.x>=0.&&q.y>=0.&&q.x<=1.&&q.y<=1.;if(inS)return vec4(T(q).rgb,1.);vec2 cq=clamp(q,0.,1.);vec2 d=q-cq;float dist=length(d*vec2(asp(),1.));vec2 m=cq-d*1.2;
  vec3 r=vec3(0.);for(int k=0;k<9;k++){vec2 o=vec2(float(k-(k/3)*3-1),float(k/3-1))*R(6.)*u_px*(1.+dist*20.);r+=T(clamp(m+o,0.,1.)).rgb;}r/=9.;vec3 bz=vec3(u_p2)*(1.-dist*1.5);return vec4(bz+r*u_p1*exp(-dist*12.),1.);`,'screen inset in a glossy bezel that mirrors its edges');
f('teletext','Teletext Mosaic',[P('Columns',20,80,40,1),S('Colors',['8 colours, per-cell fg/bg','8 colours, free'])],
  `vec2 cs=vec2(1./u_p0,1./25.);vec2 cell=floor(uv/cs);vec2 sub=floor(fract(uv/cs)*vec2(2.,3.));vec3 pal[8]=vec3[8](vec3(0.),vec3(1.,0.,0.),vec3(0.,1.,0.),vec3(1.,1.,0.),vec3(0.,0.,1.),vec3(1.,0.,1.),vec3(0.,1.,1.),vec3(1.));
  vec3 sm[6];float lo=1e9,hi=-1e9;vec3 dk=vec3(0.),lt=vec3(1.);for(int j=0;j<3;j++)for(int i=0;i<2;i++){vec3 v=T((cell+(vec2(float(i),float(j))+.5)/vec2(2.,3.))*cs).rgb;sm[j*2+i]=v;float l=luma(v);if(l<lo){lo=l;dk=v;}if(l>hi){hi=l;lt=v;}}
  vec3 me=sm[int(sub.y)*2+int(sub.x)];vec3 fg=pal[0],bg=pal[0];float bf=1e9,bb=1e9;for(int k=0;k<8;k++){vec3 a=pal[k]-lt,b=pal[k]-dk;if(dot(a,a)<bf){bf=dot(a,a);fg=pal[k];}if(dot(b,b)<bb){bb=dot(b,b);bg=pal[k];}}
  if(u_p1>.5){vec3 o=pal[0];float bd=1e9;for(int k=0;k<8;k++){vec3 d=pal[k]-me;if(dot(d,d)<bd){bd=dot(d,d);o=pal[k];}}return vec4(o,1.);}
  vec3 dfg=me-fg,dbg=me-bg;return vec4(dot(dfg,dfg)<dot(dbg,dbg)?fg:bg,1.);`,'2×3 sextant blocks, 40×25 cells (Ceefax/Videotex)');
f('textart','Text Art (Braille / ANSI / PETSCII)',[S('Style',['Braille dots (2×4)','ANSI half blocks (16 colours)','PETSCII quadrant blocks (C64)']),P('Cell width',3,24,8,.5,'px'),P('Threshold',0,1,.5,.01)],
  `int m=int(u_p0+.5);float cw=max(R(u_p1),2.);vec2 csz=m==0?vec2(cw,cw*2.):m==1?vec2(cw,cw*2.):vec2(cw,cw);vec2 p=PX(uv);vec2 cell=floor(p/csz);vec2 fp=fract(p/csz);
  if(m==0){vec2 sub=floor(fp*vec2(2.,4.));vec2 sc=(cell*csz+(sub+.5)/vec2(2.,4.)*csz);float on=step(u_p2,luma(T(fromPX(sc)).rgb));vec2 dp=fract(fp*vec2(2.,4.))-.5;float dot_=1.-smoothstep(.28,.36,length(dp*vec2(1.,2.)*.5*2.));return vec4(vec3(on*dot_),1.);}
  vec3 an[16]=vec3[16](vec3(0.),vec3(.67,0.,0.),vec3(0.,.67,0.),vec3(.67,.33,0.),vec3(0.,0.,.67),vec3(.67,0.,.67),vec3(0.,.67,.67),vec3(.67),vec3(.33),vec3(1.,.33,.33),vec3(.33,1.,.33),vec3(1.,1.,.33),vec3(.33,.33,1.),vec3(1.,.33,1.),vec3(.33,1.,1.),vec3(1.));
  vec3 c64[16]=vec3[16](vec3(0.),vec3(1.),vec3(.41,.22,.17),vec3(.44,.64,.7),vec3(.44,.24,.53),vec3(.35,.55,.26),vec3(.21,.16,.47),vec3(.72,.78,.44),vec3(.44,.31,.15),vec3(.26,.22,0.),vec3(.6,.4,.35),vec3(.27),vec3(.42),vec3(.6,.82,.52),vec3(.42,.37,.71),vec3(.58));
  if(m==1){vec2 half_=vec2(.5,fp.y<.5?.25:.75);vec3 v=T(fromPX(cell*csz+half_*csz)).rgb;vec3 o=an[0];float bd=1e9;for(int k=0;k<16;k++){vec3 d=an[k]-v;if(dot(d,d)<bd){bd=dot(d,d);o=an[k];}}return vec4(o,1.);}
  vec3 q[4];float lo=1e9,hi=-1e9;vec3 dk=vec3(0.),lt=vec3(1.);for(int k=0;k<4;k++){vec2 o=vec2(float(k-(k/2)*2),float(k/2));q[k]=T(fromPX(cell*csz+(o+.5)*.5*csz)).rgb;float l=luma(q[k]);if(l<lo){lo=l;dk=q[k];}if(l>hi){hi=l;lt=q[k];}}
  vec3 fg=c64[0],bg=c64[0];float bf=1e9,bb=1e9;for(int k=0;k<16;k++){vec3 a=c64[k]-lt,b=c64[k]-dk;if(dot(a,a)<bf){bf=dot(a,a);fg=c64[k];}if(dot(b,b)<bb){bb=dot(b,b);bg=c64[k];}}
  int qi=int(fp.x>=.5)+2*int(fp.y>=.5);vec3 me=q[qi];return vec4(luma(me)>mix(lo,hi,u_p2)?fg:bg,1.);`,'character-cell renderings');
f('matrixrain','Matrix Rain',[P('Column width',4,24,9,.5,'px'),P('Image visibility',0,1,.7,.01),P('Trail length',2,40,14,1)],
  `float cw=max(R(u_p0),2.);vec2 p=PX(uv);vec2 cell=floor(vec2(p.x/cw,p.y/(cw*1.4)));vec2 fp=fract(vec2(p.x/cw,p.y/(cw*1.4)));float colr=hash(vec2(cell.x,9.1));float head=floor(colr*200.);float d=mod(head-cell.y,u_p2*3.);float trail=d<u_p2?1.-d/u_p2:0.;
  vec2 g=floor(fp*vec2(5.,7.));float glyph=step(.45,hash(g+cell*13.+floor(hash(cell)*7.)))*step(.08,fp.x)*step(fp.x,.92)*step(.06,fp.y)*step(fp.y,.94);float l=luma(T(fromPX((cell+.5)*vec2(cw,cw*1.4))).rgb);
  float b=glyph*max(trail,l*u_p1);vec3 col=d<1.?vec3(.8,1.,.85):vec3(.1,1.,.3);return vec4(col*b,1.);`,'falling glyph columns lit by image brightness',1);
f('ditherblend','Dither Blending (MDAPT)',[P('Tolerance',.01,.3,.08,.01),S('Pattern',['Checkerboard + vertical lines','Checkerboard only'])],
  `vec2 e=u_px;vec3 l=T(uv-vec2(e.x,0.)).rgb,r=T(uv+vec2(e.x,0.)).rgb,t=T(uv+vec2(0.,e.y)).rgb,b=T(uv-vec2(0.,e.y)).rgb;vec3 C=c.rgb;
  #define EQ(A,B) (dot(abs((A)-(B)),vec3(1.))<u_p0)
  bool vl=EQ(l,r)&&!EQ(C,l);bool cb=vl&&EQ(t,b)&&EQ(t,l);if(cb)return vec4((C*2.+l+r+t+b)/6.,1.);if(u_p1<.5&&vl&&EQ(T(uv-vec2(2.*e.x,0.)).rgb,C))return vec4((C+l)*.5,1.);return vec4(C,1.);`,'blends checkerboard / line dithering back into flat colour (Genesis/Saturn era)');
