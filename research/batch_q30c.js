/* ================= q30: EffecTV ports (Fukuchi Kentaro et al., single-frame behaviour) ================= */
f = add('Stylize');
f('q30_agingtv','AgingTV (EffecTV)',[P('Fade c',0,24,18,1),P('Scratches',0,7,4,1),P('Dust and pits',0,3,1,.1),P('Noise',0,1,1,.05)],
  `vec2 gp=floor(PX(uv));vec3 o=O(uv).rgb;float cc=floor(u_p0+.5)/255.;
 vec3 x=o-floor(o*63.75)/255.+cc;vec3 nb=vec3(step(.5,hash(gp+vec2(.11,0.))),step(.5,hash(gp+vec2(.37,0.))),step(.5,hash(gp+vec2(.73,0.))));x+=nb*16./255.*u_p1;
 vec2 W=u_res/u_k;for(int i=0;i<7;i++){if(float(i)>=u_p1)break;float fi=float(i)+.5;float sx=floor(hash(vec2(fi,1.3))*W.x);if(gp.x!=sx)continue;
  float y1=floor(hash(vec2(fi,2.7))*(W.y-1.))+1.;bool full=hash(vec2(fi,4.1))<.6;float y2=full?W.y:floor(hash(vec2(fi,5.9))*W.y);float yy=W.y-1.-gp.y;
  if(yy>=(hash(vec2(fi,6.6))<.5?0.:y1)&&yy<y2)x=min(x+32./255.,1.);}
 float cs=16.,as_=max(floor(W.x*W.y/64./480.),1.);vec2 cell=floor(gp/cs);float pd=clamp((as_*4.+16.)/(W.x*W.y/(cs*cs))*u_p2,0.,1.),pp=clamp(as_*3./(W.x*W.y/(cs*cs))*u_p2,0.,1.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cl=cell+vec2(float(i),float(j));
  if(hash(cl+.31)<pd){vec2 q=floor(cl*cs+vec2(hash(cl+.52),hash(cl+.77))*cs);float d=floor(hash(cl+.93)*8.);float ln=floor(hash(cl+.17)*as_)+5.;
   for(int k=0;k<15;k++){if(float(k)>=ln)break;if(q==gp)x=vec3(16./255.);float a=d*.785398;q+=vec2(sign(floor(cos(a)+.5)),sign(floor(sin(a)+.5)));d=mod(d+floor(hash(cl+float(k)*1.37+.2)*3.)-1.+8.,8.);}}
  if(hash(cl+.63)<pp){vec2 q=floor(cl*cs+vec2(hash(cl+.44),hash(cl+.88))*cs);float sz=floor(hash(cl+.29)*16.);
   for(int k=0;k<15;k++){if(float(k)>=sz)break;q+=floor(vec2(hash(cl+float(k)*2.11+.5),hash(cl+float(k)*3.07+.9))*3.)-1.;if(q==gp)x=vec3(192./255.);}}}
 return vec4(clamp(x,0.,1.),1.);`,
  'EffecTV AgingTV (Fukuchi): coloraging (pixel - pixel/4 + fade level c, plus a random 16/255 bit per channel), vertical scratches brightened by 32/255 (up to 7 lines, full or partial height), dust = dark (0x10) 8-direction random-walk strokes of length 5..area_scale + 4, pits = light grey (0xc0) random-walk specks; one frame of the animated effect (per-frame random state replaced by seeded hashes, dust and pits placed per 16 px cell)', 1);

f('q30_revtv','RevTV (EffecTV, Rutt-Etra scan lines)',[P('Line spacing',1,20,6,1,'px'),P('Vscale',4,100,50,1),S('Colour',['White','Source colour']),S('Draw',['Dots (original)','Connected lines'])],
  `vec2 gp=floor(PX(uv));vec2 W=floor(u_res/u_k);float ls=floor(u_p0+.5);float Y=W.y-1.-gp.y;float hit=0.;vec3 col=vec3(1.);
 float y0=ceil(Y/ls)*ls;for(int k=0;k<64;k++){float ys=y0+float(k)*ls;if(ys>=W.y)break;if(ys-Y>1785./u_p1+1.)break;
  vec3 v=floor(O(fromPX(vec2(gp.x,W.y-1.-ys)+.5)).rgb*255.+.5);float yv=ys-floor((2.*v.r+4.*v.g+v.b)/u_p1);
  float lo=yv,hi=yv;if(u_p3>.5){vec3 v2=floor(O(fromPX(vec2(gp.x-1.,W.y-1.-ys)+.5)).rgb*255.+.5);float y2=ys-floor((2.*v2.r+4.*v2.g+v2.b)/u_p1);lo=min(lo,y2+1.);hi=max(hi,y2-1.);lo=min(lo,yv);hi=max(hi,yv);}
  if(Y>=lo&&Y<=hi){hit=1.;col=u_p2>.5?v/255.:vec3(1.);break;}}
 return vec4(col*hit,1.);`,
  'EffecTV RevTV (Rutt-Etra / Vasulka scan processor): every Line spacing-th row is redrawn on black with each pixel lifted by (2R + 4G + B) / vscale rows (8-bit values), white by default; Connected lines also fills the vertical gap to the previous column (added option)');

f('q30_shagadelictv','ShagadelicTV (EffecTV)',[P('Phase',0,255,0,1),S('Mask',['All channels','No blue (key 1)','No green (key 2)','No red (key 3)']),P('Ring scale',.25,4,1,.05)],
  `vec2 gp=floor(PX(uv));vec2 W=floor(u_res/u_k);float x=gp.x,y=W.y-1.-gp.y;float ph=floor(u_p0+.5);
 vec2 rc=floor(vec2(hash(vec2(1.7,3.1)),hash(vec2(5.3,2.9)))*W),bc=floor(vec2(hash(vec2(8.3,1.1)),hash(vec2(2.2,7.7)))*W);
 vec2 a=vec2(x+rc.x,y+rc.y)/W.x-1.;float rr=mod(floor(length(a)*3000.*u_p2),256.);
 vec2 b=vec2(x+bc.x,y+bc.y)/W.x-1.;float rb=mod(floor(length(b)*3000.*u_p2),256.);
 float xx=x/W.x-.5,yy=(y-floor(W.y*.5))/W.x;float sp=mod(floor(atan(xx,yy)/PI*256.*9.+length(vec2(xx,yy))*1800.*u_p2),256.);
 vec3 pat=vec3(step(128.,mod(rr+ph*2.,256.)),step(128.,mod(sp+ph*3.,256.)),step(128.,mod(rb-ph+256.,256.)));
 vec3 v=floor(O(uv).rgb*255.+.5);vec3 th=step(vec3(112.,112.,96.),v);int mk=int(u_p1+.5);vec3 msk=vec3(mk==3?0.:1.,mk==2?0.:1.,mk==1?0.:1.);
 return vec4(th*pat*msk,1.);`,
  'EffecTV ShagadelicTV (Fukuchi): channel thresholds (R, G >= 0x70, B >= 0x60) ANDed with psychedelic bit patterns - red / blue = concentric ripple tables (|p| x 3000 mod 256) centred at seeded positions, green = spiral (atan x 256 x 9 / pi + r x 1800); Phase is the animation phase (red +2, green +3, blue -1 per step); one frame', 1);

const Q30_SIMC = [['q','000080'],['a','0000e0'],['z','0000ff'],['w','008000'],['s','00e000'],['x','00ff00'],['e','008080'],['d','00e0e0'],['c','00ffff'],
  ['r','800000'],['f','e00000'],['v','ff0000'],['t','800080'],['g','e000e0'],['b','ff00ff'],['y','808000'],['h','e0e000'],['n','ffff00'],
  ['u','808080'],['j','e0e0e0'],['m','ffffff'],['i','76ca0a'],['k','3cafaa'],['o','60a848'],['l','504858'],['p','89ba43']];
f('q30_simuratv','SimuraTV (EffecTV colour mirror)',[S('Mirror',['None','Left half (2)','Right half (3)','Bottom half (4)','Bottom-left quarter (5)','Bottom-right quarter (6)','Top half (7)','Top-left quarter (8)','Top-right quarter (9)']),
  S('XOR colour',['None (space)'].concat(Q30_SIMC.map(k => `Key ${k[0]} #${k[1]}`)),0)],
  `const uvec3 KC[27]=uvec3[27](uvec3(0u),${Q30_SIMC.map(k => `uvec3(${parseInt(k[1].slice(0, 2), 16)}u,${parseInt(k[1].slice(2, 4), 16)}u,${parseInt(k[1].slice(4, 6), 16)}u)`).join(',')});
 vec2 W=floor(u_res);vec2 p=floor(uv*u_res);p.y=W.y-1.-p.y;vec2 hw=floor(W*.5);int m=int(u_p0+.5);
 bool mx=m==1||m==4||m==7,Mx=m==2||m==5||m==8,my=m==6||m==7||m==8,My=m==3||m==4||m==5;
 if(mx&&p.x>=hw.x)p.x=W.x-1.-p.x;if(Mx&&p.x<W.x-hw.x)p.x=W.x-1.-p.x;if(my&&p.y>=hw.y)p.y=W.y-1.-p.y;if(My&&p.y<W.y-hw.y)p.y=W.y-1.-p.y;
 p.y=W.y-1.-p.y;uvec3 v=uvec3(floor(O((p+.5)/u_res).rgb*255.+.5));v^=KC[int(u_p1+.5)];return vec4(vec3(v)/255.,1.);`,
  'EffecTV SimuraTV (Fukuchi): mirror modes of the number keys (one half / quarter copied to the others) and the pixel XOR-ed with the colour bound to letter keys a-z (EffecTV colour table)');

f('q30_warptv','WarpTV (EffecTV)',[P('Time',0,511,0,1),P('Amount',0,3,1,.05),P('Ripple',0,3,1,.05)],
  `float tv=floor(u_p0+.5);float xw=floor(sin((tv+100.)*PI/128.)*30.)+floor(sin((tv-10.)*PI/512.)*40.);float yw=floor(sin(tv*PI/256.)*-35.)+floor(sin((tv+30.)*PI/512.)*40.);
 float cw=floor(sin((tv-70.)*PI/64.)*50.*u_p2);vec2 W=floor(u_res/u_k);vec2 gp=floor(PX(uv));vec2 hw=floor(W*.5);float mm=length(hw);
 int k=int(length(gp-hw)*511.9999/mm);int ci=((k*int(cw))>>3)&1022;float an=float(ci)*PI/512.;
 vec2 d=floor(vec2(cos(an)*xw,sin(an)*yw)*u_p1);vec2 q=clamp(gp+vec2(d.x,-d.y),vec2(0.),W-2.);return O(fromPX(q+.5));`,
  'EffecTV WarpTV (from Tom Rokicki / Pigeon warp): radial-distance-indexed sine table, offset dx = cos(theta) xw, dy = sin(theta) yw with theta = ((ring index x cw) >> 3) x pi / 512 and xw, yw, cw driven by the frame counter (Time); Amount scales xw / yw, Ripple scales cw (added); one frame');

f('q30_displaywalltv','DisplayWallTV (EffecTV video wall)',[P('Scale',1,9,3,1),P('Scroll X',0,1,0,.01),P('Scroll Y',0,1,0,.01)],
  `vec2 W=floor(u_res/u_k);vec2 gp=floor(PX(uv));float x=gp.x,y=W.y-1.-gp.y;float sc=floor(u_p0+.5);vec2 C=floor(W*.5);
 float vx=(x-C.x)/W.x,vy=(y-C.y)/W.x;vx*=1.-vx*vx*.4;vy*=1.-vx*vx*.8;vx*=1.-y/W.y*.15;vec2 bp=sc<1.5?C:floor(vec2(u_p1,u_p2)*W);
 vec2 q=bp+floor(vec2(vx,vy)*W.x)*sc;q=mod(q,W);q.y=W.y-1.-q.y;return O(fromPX(q+.5));`,
  'EffecTV DisplayWallTV (Fukuchi): the frame repeated Scale x Scale times on a gently curved wall (vx *= 1 - 0.4 vx^2, vy *= 1 - 0.8 vx^2, vx *= 1 - 0.15 y / h), wrapped; Scroll X / Y set the scroll position the arrow keys move');

f('q30_puzzletv','PuzzleTV (EffecTV sliding blocks)',[P('Block size',16,200,80,1,'px'),S('Space block',['Black (as EffecTV)','Show picture'])],
  `vec2 W=floor(u_res/u_k);float bs=floor(u_p0+.5);vec2 gp=floor(PX(uv));gp.y=W.y-1.-gp.y;vec2 nb=floor(W/bs);float N=nb.x*nb.y;
 vec2 bi=floor(gp/bs);if(bi.x>=nb.x||bi.y>=nb.y||N<3.)return O(uv);float id=bi.y*nb.x+bi.x;if(id==N-1.&&u_p1<.5)return vec4(0.,0.,0.,1.);
 float sw=20.*nb.x;float sv=id;if(id<N-1.){for(int k=1600;k>=0;k--){if(float(k)>=sw)continue;float a=floor(hash(vec2(float(k),.5))*(N-1.)),b=floor(hash(vec2(float(k),1.5))*(N-1.));
  if(a==b)b=mod(b+1.,N-1.);if(sv==a)sv=b;else if(sv==b)sv=a;}}
 vec2 sb=vec2(mod(sv,nb.x),floor(sv/nb.x));vec2 q=sb*bs+(gp-bi*bs);q.y=W.y-1.-q.y;return O(fromPX(q+.5));`,
  'EffecTV PuzzleTV (Fukuchi): picture cut into Block size squares (80 px at 640 wide), the first N-1 blocks shuffled by 20 x columns random swaps (seeded), last block is the black space, margins copied; the sliding animation / auto-solve needs frames and is left out', 1);
