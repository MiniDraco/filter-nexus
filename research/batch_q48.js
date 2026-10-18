/* ================= q48: AugLy image augmentations + OBS FiniteSingularity plug-ins (round 18) ================= */
// 5x7 bitmap font (no TrueType in shaders): ' ' A-Z 0-9 . ' - :   -> GLSL const arrays FA (rows 0-3) / FB (rows 4-6)
const Q48_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.'-:";
const Q48_GLY = ('00000000000000000000000000000000000,01110100011000111111100011000110001,11110100011000111110100011000111110,01110100011000010000100001000101110,11110100011000110001100011000111110,'
 + '11111100001000011110100001000011111,11111100001000011110100001000010000,01110100011000010111100011000101111,10001100011000111111100011000110001,01110001000010000100001000010001110,'
 + '00111000100001000010000101001001100,10001100101010011000101001001010001,10000100001000010000100001000011111,10001110111010110101100011000110001,10001100011100110101100111000110001,'
 + '01110100011000110001100011000101110,11110100011000111110100001000010000,01110100011000110001101011001001101,11110100011000111110101001001010001,01111100001000001110000010000111110,'
 + '11111001000010000100001000010000100,10001100011000110001100011000101110,10001100011000110001100010101000100,10001100011000110101101011010101010,10001100010101000100010101000110001,'
 + '10001100011000101010001000010000100,11111000010001000100010001000011111,01110100011001110101110011000101110,00100011000010000100001000010001110,01110100010000100010001000100011111,'
 + '11111000100010000010000011000101110,00010001100101010010111110001000010,11111100001111000001000011000101110,00110010001000011110100011000101110,11111000010001000100010000100001000,'
 + '01110100011000101110100011000101110,01110100011000101111000010001001100,00000000000000000000000000110001100,01100001000100000000000000000000000,00000000000000011111000000000000000,'
 + '00000011000110000000011000110000000').split(',');
const Q48_FONT = (() => { const A = [], B = []; for (const g of Q48_GLY) { A.push(parseInt(g.slice(0, 20), 2)); B.push(parseInt(g.slice(20), 2)); }
  return `const int FA[${A.length}]=int[${A.length}](${A.join(',')}),FB[${B.length}]=int[${B.length}](${B.join(',')});`; })();
const Q48_CODES = s => [...s].map(ch => Math.max(0, Q48_CHARS.indexOf(ch)));
// string table: SA[] holds all strings back to back, LS[k]/LN[k] = start / length of string k
const Q48_TABLE = strs => { const all = [], st = [], ln = []; for (const s of strs) { st.push(all.length); ln.push(s.length); all.push(...Q48_CODES(s)); }
  return `const int SA[${all.length}]=int[${all.length}](${all.join(',')}),LS[${st.length}]=int[${st.length}](${st.join(',')}),LN[${ln.length}]=int[${ln.length}](${ln.join(',')});`; };
// distance (glyph-pixel units) from q (glyph units, y down, text top-left = 0) to the nearest ink cell of string SA[st..st+n)
const Q48_DIST = `float d=9.;{ivec2 G=ivec2(floor(q));for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){int cx=G.x+i,cy=G.y+j;if(cx<0||cy<0||cy>6)continue;int chi=cx/6,co=cx-chi*6;if(chi>=n||co>4)continue;int gg=SA[st+chi];
 int bt=cy<4?(FA[gg]>>(5*(3-cy)+4-co))&1:(FB[gg]>>(5*(6-cy)+4-co))&1;if(bt==1){vec2 dq=max(abs(q-vec2(float(cx),float(cy))-.5)-.5,0.);d=min(d,length(dq));}}}`;
const Q48_CLICK = ['BREAKING: THIS CHANGES EVERYTHING', "YOU WON'T BELIEVE WHAT HAPPENED NEXT", 'SHARE IF YOU AGREE', 'THIS WILL SHOCK YOU', 'WAIT FOR IT...', 'THIS SAYS IT ALL'];
const Q48_SPLIT = s => { const w = s.split(' '); let best = 1, bd = 1e9; for (let k = 1; k < w.length; k++) { const a = w.slice(0, k).join(' ').length, b = w.slice(k).join(' ').length; if (Math.max(a, b) < bd) { bd = Math.max(a, b); best = k; } } return [w.slice(0, best).join(' '), w.slice(best).join(' ')]; };

f = add('Augment');
f('q48_augly_meme','Meme Format Caption Bar (AugLy meme_format)',[S('Text',['LOL','OMG','WTF','MEME']),S('Position',['Top','Bottom']),P('Caption height',20,600,250,1,'px'),S('Fit',['Letterbox (keep aspect)','Stretch to frame'])],
  `${Q48_FONT}${Q48_TABLE(['LOL', 'OMG', 'WTF', 'MEME'])}vec2 Wd=PX(vec2(1.));float chh=u_p2;vec2 cv=vec2(Wd.x,Wd.y+chh);vec2 p=PX(uv);p.y=Wd.y-p.y;vec2 cp;
 if(u_p3<.5){float k=min(Wd.x/cv.x,Wd.y/cv.y);vec2 off=(Wd-cv*k)*.5;cp=(p-off)/k;if(cp.x<0.||cp.y<0.||cp.x>cv.x||cp.y>cv.y)return vec4(0.,0.,0.,1.);}else cp=p*cv/Wd;
 bool top=u_p1<.5;float iy0=top?chh:0.;vec3 col=vec3(1.);if(cp.y>=iy0&&cp.y<iy0+Wd.y)col=O(vec2(cp.x/Wd.x,1.-(cp.y-iy0)/Wd.y)).rgb;
 int k2=int(u_p0+.5),st=LS[k2],n=LN[k2];float fs=chh-10.,s=1.,tw=0.,th=0.;
 for(int it=0;it<200;it++){s=fs*.71/7.;tw=(float(n)*6.-1.)*s;th=fs*.9;if((tw<=Wd.x-10.&&th<=chh-10.)||fs<=6.)break;fs-=5.;}
 float x0=floor((Wd.x-tw)*.5+.5),y0=floor((chh-th)*.5+.5);y0=top?y0-40.:Wd.y+y0-40.;vec2 q=(cp-vec2(x0,y0+fs*.23))/s;
 ${Q48_DIST}float ink=clamp((.2-d)*s+.5,0.,1.);return vec4(mix(col,vec3(0.),ink),1.);`,
  'AugLy meme_format (augly/image/functional.py): canvas W x (H + caption_height) filled white, image pasted below (top) or above (bottom) the bar unscaled; font size starts at caption_height-10 and drops by 5 until the text box fits W-10 x caption_height-10; text centred, y = round((caption_height-text_h)/2) - 40 (bottom: + H), colour (0,0,0); the taller output canvas is letterboxed (or stretched) into the frame; approx.: 5x7 bitmap capitals with Raleway ExtraBold metrics (cap .71, box .9 of font size) replace the TrueType font; opacity omitted (Pillow ignores the alpha of the fill on the RGB canvas)');
f('q48_augly_shufflepx','Shuffle Pixels (AugLy shuffle_pixels)',[P('Factor',0,1,.3,.01)],
  `if(u_p0<=0.)return c;vec2 Wd=floor(PX(vec2(1.))+.5);vec2 p=floor(PX(uv));float sd=fract(u_seed*.1731+.37)*97.;if(hash(p*.991+sd)>=u_p0)return c;
 for(int k=0;k<32;k++){float fk=float(k);vec2 q=floor(vec2(hash(p+vec2(fk*7.31+sd,3.7)),hash(p.yx+vec2(sd*1.3,fk*5.17)))*Wd);if(hash(q*.991+sd)<u_p0)return vec4(O(fromPX(q+.5)).rgb,1.);}return c;`,
  'AugLy shuffle_pixels (AugLy default factor 1.0, seed 10): int(factor*N) pixels chosen at random and their colours permuted among themselves; approx.: each chosen pixel takes the colour of a random other chosen pixel (rejection-sampled), a random draw from the chosen set rather than an exact permutation', true);
f('q48_augly_emoji','Overlay Emoji (AugLy overlay_emoji)',[P('Emoji size',.01,1,.15,.01),P('X pos',0,1,.4,.01),P('Y pos',0,1,.8,.01),P('Opacity',0,1,1,.01)],
  `vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);p.y=Wd.y-p.y;float sz=max(1.,floor(Wd.y*u_p0));vec2 e=(p-floor(vec2(Wd.x*u_p1,Wd.y*u_p2)))/sz;
 if(e.x<0.||e.y<0.||e.x>1.||e.y>1.)return c;float aa=1.5/sz;vec2 v=e-.5;float face=clamp((.48-length(v))/aa+.5,0.,1.);vec3 col=vec3(1.,.8,.302);
 vec2 mv=(e-vec2(.5,.56))/vec2(.3,.26);float mo=step(0.,e.y-.56)*clamp((1.-length(mv))*.26/aa+.5,0.,1.);col=mix(col,vec3(.4,.27,0.),mo);col=mix(col,vec3(1.),mo*step(e.y,.63));
 for(int i=0;i<2;i++){vec2 h=(e-vec2(i==0?.29:.71,.36))/.17;h=vec2(h.x*1.1,-h.y*1.1+.3);float hh=h.x*h.x+h.y*h.y-1.;if(hh*hh*hh-h.x*h.x*h.y*h.y*h.y<0.)col=vec3(.867,.18,.267);}
 return vec4(mix(c.rgb,col,face*u_p3),1.);`,
  'AugLy overlay_emoji -> overlay_image: default emoji twemoji smiling_face_with_heart_eyes, height = int(H*emoji_size) keeping aspect, top-left corner at (int(W*x_pos), int(H*y_pos)), alpha mask scaled by opacity; approx.: the twemoji PNG is redrawn procedurally (yellow face, red heart eyes, open smile with teeth)');
f('q48_augly_clickbait','Clickbait Text Box (AugLy overlay_random_text_with_background)',[S('Phrase',Q48_CLICK.map(s => s.replace(/[=,]/g, ''))),S('Colour scheme',['Gold on black','White on black','Yellow on black','Amber on black','Black on white']),S('Placement',['Bottom','Top','Center']),P('Scale factor',0,1,.5,.01)],
  `${Q48_FONT}${Q48_TABLE(Q48_CLICK.flatMap(Q48_SPLIT))}vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);p.y=Wd.y-p.y;int ph=int(u_p0+.5),cs=int(u_p1+.5),pl=int(u_p2+.5);
 vec3 tc[5]=vec3[5](vec3(1.,.875,0.),vec3(1.),vec3(1.,1.,0.),vec3(1.,.784,0.),vec3(0.));vec3 bc=cs==4?vec3(1.):vec3(0.);vec3 tcol=tc[0];for(int i=1;i<5;i++)if(i==cs)tcol=tc[i];
 float fs=floor(40.*(.7+u_p3*1.3)),pad=15.,hp=pad+15.;int n0=LN[ph*2],n1=LN[ph*2+1];float mw=max(float(n0),float(n1))*6.-1.;
 fs=min(fs,.75*Wd.x/(mw*.72/7.));float lh=fs*.95,spc=floor(lh*.15),txh=2.*lh+spc;fs=min(fs,fs*(.5*Wd.y-2.*pad)/txh);lh=fs*.95;spc=floor(lh*.15);txh=2.*lh+spc;
 float s=fs*.72/7.,tw=mw*s,bh=txh+2.*pad;float ty=pl==0?Wd.y-bh:pl==1?pad:floor((Wd.y-bh)*.5)+pad;
 float x0=floor((Wd.x-tw-2.*hp)*.5),x1=x0+tw+2.*hp,y0=ty-pad,y1=pl==0?Wd.y:ty+txh+pad;vec3 col=c.rgb;
 if(p.x>=x0&&p.x<x1&&p.y>=y0&&p.y<y1)col=mix(col,bc,.9);
 int ln=p.y<ty+lh+spc*.5?0:1;int st=LS[ph*2+ln],n=LN[ph*2+ln];float lw=(float(n)*6.-1.)*s;vec2 q=(p-vec2(floor((Wd.x-lw)*.5),ty+float(ln)*(lh+spc)+fs*.2))/s;
 ${Q48_DIST}float ink=clamp((.25-d)*s+.5,0.,1.);return vec4(mix(col,tcol,ink),1.);`,
  'AugLy overlay_random_text_with_background (defaults: font_size 40, scale_factor .5 -> int(40*(.7+1.3*sf)), box_opacity .9, padding 15, solid box, placement bottom, one overlay): phrase from utils.CLICKBAIT_PHRASES, text/box colour schemes as in AugLy (gold, white, yellow, amber on black; black on white), max width .75 W, max height .5 H, line spacing .15 line height, box = text + horizontal padding pad+randint(10,20), reaching the bottom edge for a single bottom overlay; approx.: fixed 2-line wrap, horizontal padding 30, square corners, no rotation, 5x7 bitmap capitals instead of the random social-media font');
f('q48_augly_ranking','Ranking Numbers (AugLy ranking_numbers)',[P('Entries',1,5,3,1),P('Font size',.02,.4,.15,.01),P('Left dist',0,400,50,1,'px'),P('Stroke width',0,10,3,.5,'px')],
  `${Q48_FONT}${Q48_TABLE(['1. FIRST PLACE', '2. SECOND PLACE', '3. THIRD PLACE', '4. FOURTH PLACE', '5. FIFTH PLACE'])}vec2 Wd=PX(vec2(1.));vec2 p=PX(uv);p.y=Wd.y-p.y;
 int ne=int(clamp(u_p0+.5,1.,5.));float fs=floor(min(Wd.x,Wd.y)*u_p1),s=max(fs*.71/7.,.5),sp=floor(Wd.y/float(ne+1));
 int ei=int(clamp(floor((p.y-.23*fs-3.5*s)/sp+.5)-1.,0.,float(ne-1)));int st=LS[ei],n=LN[ei];vec2 q=(p-vec2(u_p2,sp*float(ei+1)+.23*fs))/s;
 ${Q48_DIST}float ink=clamp((.22-d)*s+.5,0.,1.),stk=u_p3>0.?clamp((.22+u_p3/s-d)*s+.5,0.,1.):0.;vec3 tcol=q.x<11.5?vec3(1.):vec3(1.,1.,0.);
 return vec4(mix(mix(c.rgb,vec3(0.),stk),tcol,ink),1.);`,
  'AugLy ranking_numbers with the docstring example ranking_dict {1: First place, 2: Second place, 3: Third place} (extendable to 5): font size = int(min(W,H)*font_size), entry i at (left_dist, (H//(n+1))*(i+1)), "k." in number_color white then " text" in ranking_color yellow, both with a black stroke of stroke_width px; approx.: 5x7 bitmap capitals (Raleway ExtraBold metrics) replace the TrueType font, so the text is upper-case');

f = add('Retro');
f('q48_obs_cathodeboot','Cathode Boot CRT Collapse (OBS Retro Effects)',[P('Progress',0,100,60,.5,'%'),P('Horizontal thickness',1,50,1,1,'px'),P('Vertical thickness',1,50,1,1,'px'),P('Glow size',0,40,2,.5,'px')],
  `vec2 Wd=PX(vec2(1.));float pr=u_p0/100.;vec2 pn=vec2(clamp((pr-.5)/.4,0.,1.),clamp(pr/.7,0.,1.));float fd=clamp((pr-.9)/.1,0.,1.);
 vec2 thk=vec2(u_p1,u_p2)/Wd;vec2 sc=pn*(thk-1.)+1.;vec2 ps=floor(sc*Wd);sc=max(ps/Wd,1e-6);vec2 d=uv-.5;vec2 pc=floor(d*Wd);d/=sc;
 vec2 qq=abs(2.*pc)-ps;float sdf=min(max(qq.x,qq.y),0.)+length(max(qq,0.));vec3 col;
 if(sdf<=0.)col=mix(O(clamp(.5+d,0.,1.)).rgb,vec3(1.),max(pn.x,pn.y));else col=vec3(clamp(1.-sdf/max(u_p3,1e-3),0.,1.));
 return vec4(mix(col,vec3(0.),fd),1.);`,
  'port of obs-retro-effects cathode-boot.effect (FiniteSingularity): vertical collapse over progress 0-70 %, horizontal 50-90 %, fade to background 90-100 % (plug-in default ranges, linear clamps); per-axis scale = pn*(thickness-1)+1 snapped to whole pixels, image squeezed into the snapped rectangle and tinted toward the glow colour (white) by max(pn); outside, glow = lerp(background black, white, 1 - sdf/glow_size) on the doubled-pixel rectangle SDF; default progress 60 % here (plug-in default 0 % = untouched frame)');
f('q48_obs_rpza','Retro Codec RPZA (OBS Retro Effects)',[P('Quality',0,1,.85,.01),P('Colors per channel',2,64,32,1)],
  `float N=floor(u_p1+.5),Ts=.2*(1.-u_p0),Tg=1.-u_p0;vec2 sp=floor(PX(uv));vec2 org=floor(sp/4.)*4.;
 const int BY[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);vec3 a[16];vec3 sm=vec3(0.),mn=vec3(1.),mx=vec3(0.);vec3 own=vec3(0.);
 for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec2 pp=org+vec2(float(i),float(j));int bi=int(mod(pp.y,4.))*4+int(mod(pp.x,4.));
  vec3 v=floor(clamp(O(fromPX(pp+.5)).rgb,0.,1.)*N+float(BY[bi])/16.)/N;a[j*4+i]=v;sm+=v;mn=min(mn,v);mx=max(mx,v);if(pp==sp)own=v;}
 vec3 mean=sm/16.;vec3 rg=mx-mn;int k=rg.x>=rg.y&&rg.x>=rg.z?0:(rg.y>=rg.z?1:2);float sx=0.,sxx=0.;vec3 sxc=vec3(0.);
 for(int i=0;i<16;i++){float xv=k==0?a[i].x:k==1?a[i].y:a[i].z;sx+=xv;sxx+=xv*xv;sxc+=xv*a[i];}
 float dd=16.*sxx-sx*sx;vec3 g0=mean,g1=mean;if(abs(dd)>=1e-5){vec3 m=(16.*sxc-sx*sm)/dd;vec3 b=(sm-m*sx)/16.;float lo=k==0?mn.x:k==1?mn.y:mn.z,hi=k==0?mx.x:k==1?mx.y:mx.z;g0=m*lo+b;g1=m*hi+b;}
 g0=clamp(g0,0.,1.);g1=clamp(g1,0.,1.);vec3 gc[4];for(int i=0;i<4;i++)gc[i]=floor(mix(g0,g1,float(i)/3.)*N)/N;
 float e1=0.,e4=0.;for(int i=0;i<16;i++){vec3 dv=clamp(abs(a[i]-mean),0.,1.);e1+=dot(dv,dv);float be=1e9;for(int t=0;t<4;t++){vec3 dg=clamp(abs(a[i]-gc[t]),0.,1.);be=min(be,dot(dg,dg));}e4+=be;}
 if(e1<Ts*Ts)return vec4(floor(mean*N)/N,1.);
 if(e4<Tg*Tg){vec3 o=gc[0];float be=1e9;for(int t=0;t<4;t++){vec3 dg=clamp(abs(own-gc[t]),0.,1.);float ee=dot(dg,dg);if(ee<be){be=ee;o=gc[t];}}return vec4(o,1.);}
 return vec4(own,1.);`,
  'port of obs-retro-effects codec.effect RPZA mode (FiniteSingularity, Apple Video 1995): 4x4 Bayer-dithered quantisation floor(c*N + bayer/16)/N, then per 4x4 block: solid mean colour if the summed squared error < (0.2(1-quality))^2, else 4-colour gradient (per-channel least-squares line against the widest-range channel between its min and max, colours at 0, 1/3, 2/3, 1) if its error < (1-quality)^2, else the 16 dithered colours; single frame = keyframe, so the previous-frame skip mode never fires; the plug-in shader also rotates the cross-product sums by channel (probably unintended) - the clean regression is used here');

f = add('Stylize');
f('q48_obs_triakis','Triakis Pixelate (OBS Composite Blur)',[P('Pixel size',2,120,20,1,'px'),P('Rotation',-180,180,0,1,'deg'),P('Origin X',0,100,50,1,'%'),P('Origin Y',0,100,50,1,'%')],
  `vec2 Wd=PX(vec2(1.));vec2 co=PX(uv);co.y=Wd.y-co.y;vec2 org=vec2(u_p2,u_p3)/100.*Wd;float an=radians(u_p1),cs=cos(an),sn=sin(an);vec2 p=co-org;p=vec2(cs*p.x-sn*p.y,sn*p.x+cs*p.y);
 float w=max(u_p0,1.),Hh=w*1.5,X=w*.866025403784,T3=.57735026919;float v=floor(p.y/Hh),u=floor(p.x/X);bool ve=mod(v,2.)<.5,ue=mod(u,2.)<.5;vec2 l=vec2(p.x-u*X,p.y-v*Hh);vec2 ct;
 if(ve==ue){float yp=l.y-l.x*T3;if(yp<0.)ct=vec2((u+1.)*X,v*Hh+.25*w);else if(yp>w)ct=vec2(u*X,(v+1.)*Hh-.25*w);else if(yp>=1.13*l.x)ct=vec2(u*X+.25*w,v*Hh+.75*w+.25*w*T3);else ct=vec2(u*X+.75*w,v*Hh+.25*w+.75*w*T3);}
 else{float yp=l.y-(X-l.x)*T3;if(yp<0.)ct=vec2(u*X,v*Hh+.25*w);else if(yp>w)ct=vec2((u+1.)*X,(v+1.)*Hh-.25*w);else if(yp>=w-1.13*l.x)ct=vec2(u*X+.75*w,v*Hh+.75*w+.75*w*T3);else ct=vec2(u*X+.25*w,v*Hh+.25*w+.25*w*T3);}
 ct=vec2(cs*ct.x+sn*ct.y,-sn*ct.x+cs*ct.y)+org;ct.y=Wd.y-ct.y;return vec4(O(clamp(fromPX(ct),0.,1.)).rgb,1.);`,
  'port of obs-composite-blur pixelate_triakis.effect (FiniteSingularity): rows 1.5w, columns w*cos30, cell split by the tan30 diagonal (direction by row/column parity) into outer and inner triangles (inner split by the 1.13 slope test), each triangle filled with the colour sampled at the centre the shader assigns it; rotation and tessellation origin as in the plug-in; the optional Kawase pre-smoothing is left out');
