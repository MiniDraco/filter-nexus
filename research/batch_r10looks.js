/* ================= r10looks: blend modes (2 filters), film stocks II (colour neg / slide+instant+Lomo / B&W), Fujifilm simulations ================= */
/* ---- shared: second layer for the blend-mode filters (u_p1 = layer, u_p3 = layer setting; pass 3 reads the blurred copy from T) ---- */
const R10L_LAYERS = ['Blurred copy', 'Copy', 'Inverted copy', 'Desaturated copy', 'Solid colour', 'Offset copy', 'Noise', 'Gradient'];
const R10L_LAYER = `vec3 b=O(uv).rgb;int ly=int(u_p1+.5);float st=u_p3;vec3 s;
 if(ly==0)s=T(uv).rgb;else if(ly==1)s=b;else if(ly==2)s=1.-b;else if(ly==3)s=vec3(luma(b));
 else if(ly==4)s=hsv2rgb(vec3(st/100.,.7,.85));else if(ly==5)s=O(uv-vec2(R(st),-R(st))*.7071*u_px).rgb;
 else if(ly==6){vec2 p=PX(uv)/max(st*.25,.5);s=vec3(clamp((fbm(p)-.48)*1.6+.5+(hash(floor(p))-.5)*.25,0.,1.));}
 else{float a=radians(st*3.6);vec2 q=(uv-.5)*vec2(asp(),1.);vec2 dd=vec2(cos(a),sin(a));s=vec3(clamp(dot(q,dd)/(abs(dd.x)*asp()+abs(dd.y))+.5,0.,1.));}
 b=clamp(b,0.,1.);s=clamp(s,0.,1.);`;
const R10L_PC = M => `vec3(${M}(b.r,s.r),${M}(b.g,s.g),${M}(b.b,s.b))`;
const R10L_BLUR = '(u_p1<.5?u_p3*.5:0.)';
/* sRGB <-> CIE Lab (D65) as inline code: v = input vec3 name, o = output vec3 name (L,a,b) */
const R10L_LAB = (v, o) => `{vec3 l_=mix(${v}/12.92,pow((${v}+.055)/1.055,vec3(2.4)),step(.04045,${v}));
 vec3 x_=vec3(dot(l_,vec3(.4124,.3576,.1805))/.95047,dot(l_,vec3(.2126,.7152,.0722)),dot(l_,vec3(.0193,.1192,.9505))/1.08883);
 vec3 f_=mix(7.787*x_+16./116.,pow(max(x_,0.),vec3(1./3.)),step(.008856,x_));${o}=vec3(116.*f_.y-16.,500.*(f_.x-f_.y),200.*(f_.y-f_.z));}`;
const R10L_RGB = (v, o) => `{float fy_=(${v}.x+16.)/116.;vec3 f_=vec3(fy_+${v}.y/500.,fy_,fy_-${v}.z/200.);vec3 x_=mix((f_-16./116.)/7.787,f_*f_*f_,step(.2069,f_))*vec3(.95047,1.,1.08883);
 vec3 l_=vec3(dot(x_,vec3(3.2406,-1.5372,-.4986)),dot(x_,vec3(-.9689,1.8758,.0415)),dot(x_,vec3(.0557,-.204,1.057)));l_=clamp(l_,0.,1.);
 ${o}=mix(l_*12.92,1.055*pow(l_,vec3(1./2.4))-.055,step(.0031308,l_));}`;

f = add('Color');
f('blendmodes','Blend Modes (Photoshop / W3C)',[S('Mode',['Dissolve','Darken','Multiply','Color Burn','Linear Burn','Darker Color','Lighten','Screen','Color Dodge','Linear Dodge (Add)','Lighter Color','Overlay','Soft Light','Hard Light','Vivid Light','Linear Light','Pin Light','Hard Mix','Difference','Exclusion','Subtract','Divide','Hue','Saturation','Color','Luminosity'],11),
  S('Blend layer',R10L_LAYERS),P('Opacity',0,1,1,.01),P('Layer setting (blur / hue / offset / noise / angle)',0,100,24,1)],
  [BH(R10L_BLUR), BV(R10L_BLUR), `
#define R10CB(bb,ss) ((bb)>=1.?1.:((ss)<=0.?0.:1.-min(1.,(1.-(bb))/(ss))))
#define R10CD(bb,ss) ((bb)<=0.?0.:((ss)>=1.?1.:min(1.,(bb)/(1.-(ss)))))
#define R10VL(bb,ss) ((ss)<=.5?R10CB((bb),2.*(ss)):R10CD((bb),2.*(ss)-1.))
#define R10LUM(q) dot((q),vec3(.3,.59,.11))
${R10L_LAYER}
 int m=int(u_p0+.5);vec3 r=b;
 if(m==0){return vec4(hash(floor(uv*u_res)+.5)<u_p2?s:b,1.);}
 else if(m==1)r=min(b,s);else if(m==2)r=b*s;else if(m==3)r=${R10L_PC('R10CB')};else if(m==4)r=max(b+s-1.,0.);
 else if(m==5)r=dot(s,vec3(1.))<dot(b,vec3(1.))?s:b;else if(m==6)r=max(b,s);else if(m==7)r=screen(b,s);else if(m==8)r=${R10L_PC('R10CD')};
 else if(m==9)r=min(b+s,1.);else if(m==10)r=dot(s,vec3(1.))>dot(b,vec3(1.))?s:b;else if(m==11)r=overlay(b,s);else if(m==12)r=softLight(b,s);
 else if(m==13)r=mix(2.*b*s,screen(b,2.*s-1.),step(.5,s));else if(m==14)r=${R10L_PC('R10VL')};else if(m==15)r=b+2.*s-1.;
 else if(m==16)r=mix(min(b,2.*s),max(b,2.*s-1.),step(.5,s));else if(m==17)r=step(1.-1e-5,b+s);else if(m==18)r=abs(b-s);
 else if(m==19)r=b+s-2.*b*s;else if(m==20)r=max(b-s,0.);else if(m==21)r=b/max(s,1e-5);
 else{vec3 cc;float tl;
  if(m<=23){vec3 src=m==22?s:b,sv=m==22?b:s;float sa=max(sv.r,max(sv.g,sv.b))-min(sv.r,min(sv.g,sv.b));float mx=max(src.r,max(src.g,src.b)),mn=min(src.r,min(src.g,src.b));
   cc=mx>mn?(src-mn)*sa/(mx-mn):vec3(0.);tl=R10LUM(b);}
  else if(m==24){cc=s;tl=R10LUM(b);}else{cc=b;tl=R10LUM(s);}
  cc+=tl-R10LUM(cc);float l=R10LUM(cc),n=min(cc.r,min(cc.g,cc.b)),x=max(cc.r,max(cc.g,cc.b));
  if(n<0.)cc=l+(cc-l)*l/max(l-n,1e-6);if(x>1.)cc=l+(cc-l)*(1.-l)/max(x-l,1e-6);r=cc;}
 return vec4(mix(b,clamp(r,0.,1.),u_p2),1.);`],
  'standard formulas: W3C Compositing L1 (separable + non-separable Hue/Saturation/Color/Luminosity with Lum .3/.59/.11, ClipColor, SetSat), Photoshop for Dissolve / Linear Burn-Dodge / Vivid / Linear / Pin Light / Hard Mix / Darker-Lighter Color (channel sum) / Subtract / Divide; image = base, chosen layer = blend', 1);
f('blendmodes2','Blend Modes II (GIMP / Krita extras)',[S('Mode',['Grain Extract','Grain Merge','LCh Chroma','LCh Lightness','Negation','Reflect','Glow','Freeze','Heat','Geometric Mean','Interpolation','Parallel','Allanon','Pegtop Soft Light','Gamma Dark','Gamma Light','Penumbra','Arcus Tangent','Equivalence','Additive-Subtractive','Hard Overlay','Super Light'],13),
  S('Blend layer',R10L_LAYERS),P('Opacity',0,1,1,.01),P('Layer setting (blur / hue / offset / noise / angle)',0,100,24,1)],
  [BH(R10L_BLUR), BV(R10L_BLUR), `
${R10L_LAYER}
 int m=int(u_p0+.5);vec3 r=b;
 if(m==0)r=b-s+.5;else if(m==1)r=b+s-.5;
 else if(m<=3){vec3 lb,ls;${R10L_LAB('b','lb')}${R10L_LAB('s','ls')}vec3 q;
  if(m==2){float cb=length(lb.yz),cs=length(ls.yz);q=vec3(lb.x,cb>1e-4?lb.yz*cs/cb:vec2(0.));}else q=vec3(ls.x,lb.yz);${R10L_RGB('q','r')}}
 else if(m==4)r=1.-abs(1.-b-s);
 else if(m==5)r=mix(min(b*b/max(1.-s,1e-5),1.),vec3(1.),step(1.,s));
 else if(m==6)r=mix(min(s*s/max(1.-b,1e-5),1.),vec3(1.),step(1.,b));
 else if(m==7)r=mix(mix(1.-min((1.-b)*(1.-b)/max(s,1e-5),1.),vec3(0.),step(s,vec3(0.))),vec3(1.),step(1.,b));
 else if(m==8)r=mix(mix(1.-min((1.-s)*(1.-s)/max(b,1e-5),1.),vec3(0.),step(b,vec3(0.))),vec3(1.),step(1.,s));
 else if(m==9)r=sqrt(b*s);else if(m==10)r=.5-.25*cos(PI*s)-.25*cos(PI*b);else if(m==11)r=2.*b*s/max(b+s,1e-5);else if(m==12)r=(b+s)*.5;
 else if(m==13)r=(1.-2.*s)*b*b+2.*s*b;
 else if(m==14)r=mix(pow(b,1./max(s,1e-3)),vec3(0.),step(s,vec3(0.)));else if(m==15)r=pow(b,s);
 else if(m==16){vec3 lo=min(b/max(1.-s,1e-5),1.)*.5,hi=1.-min((1.-b)/max(s,1e-5),1.)*.5;r=mix(hi,lo,step(b+s,vec3(1.-1e-5)));r=mix(r,vec3(1.),step(1.,b));}
 else if(m==17){r=atan(s,max(b,1e-6))*2./PI;r=mix(r,step(1e-6,s),step(b,vec3(0.)));}
 else if(m==18)r=1.-abs(b-s);else if(m==19)r=abs(sqrt(b)-sqrt(s));
 else if(m==20)r=mix(2.*s*b,min(b/max(2.-2.*s,1e-5),1.),step(.5001,s));
 else{float p=2.875;r=mix(1.-pow(pow(1.-b,vec3(p))+pow(max(1.-2.*s,0.),vec3(p)),vec3(1./p)),pow(pow(b,vec3(p))+pow(max(2.*s-1.,0.),vec3(p)),vec3(1./p)),step(.5,s));}
 return vec4(mix(b,clamp(r,0.,1.),u_p2),1.);`],
  'GIMP: Grain Extract/Merge, LCh Chroma/Lightness (CIE LCh(ab), D65); Krita KoCompositeOpFunctions: Negation, Reflect, Glow, Freeze, Heat, Geometric Mean, Interpolation, Parallel (harmonic), Allanon, Pegtop soft light, Gamma Dark/Light, Penumbra (Krita Penumbra B), Arcus Tangent, Additive-Subtractive, Hard Overlay, Super Light (p=2.875); Equivalence = 1-|b-s|', 1);

/* ---- film stocks II: data tables -> GLSL constant arrays ---- */
const R10L_N = v => { const s = (+v).toFixed(4); return s === '-0.0000' ? '0.0000' : s; };
const R10L_A = (type, list) => `${type}[${list.length}](${list.join(',')})`;
const R10L_V = a => `vec3(${a.map(R10L_N).join(',')})`;
const R10L_T3 = v => Array.isArray(v) ? v : [v, v, v];
const R10L_MUL = (A, B) => A.map((row, i) => [0, 1, 2].map(j => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const R10L_MATRIX = st => {   // diag(wb) * crosstalk * saturation (Rec.709 luma axis), row-major; used as x*M in GLSL (= M x)
  const lw = [.2126, .7152, .0722], s = st.sat ?? 1, wb = st.wb ?? [1, 1, 1];
  const Sm = [0, 1, 2].map(i => [0, 1, 2].map(j => lw[j] * (1 - s) + (i === j ? s : 0)));
  const X = st.x ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const M = R10L_MUL(X, Sm).map((row, i) => row.map(v => v * wb[i]));
  return `mat3(${M.flat().map(R10L_N).join(',')})`;
};
/* colour pipeline: exposure -> matrix -> hue-band saturation/hue shifts -> midtone power + per-channel sigmoid contrast
   -> black/white points -> luminance-neutral shadow/highlight tints -> (halation) -> strength -> grain (luma + chroma) */
const R10L_COLOUR = (stocks, halo) => {
  const g = k => stocks.map(st => st[k]);
  const A3 = (k, d) => R10L_A('vec3', stocks.map(st => R10L_V(R10L_T3(st[k] ?? d))));
  const body = `int m=int(u_p0+.5);
 const mat3 MX[${stocks.length}]=${R10L_A('mat3', stocks.map(R10L_MATRIX))};
 const vec3 CON[${stocks.length}]=${A3('con', 1)};const vec3 BLK[${stocks.length}]=${A3('blk', 0)};const vec3 WHT[${stocks.length}]=${A3('wht', 1)};
 const vec3 SH[${stocks.length}]=${A3('sh', 0)};const vec3 HI[${stocks.length}]=${A3('hi', 0)};const vec3 SEL[${stocks.length}]=${A3('sel', 1)};const vec3 HSH[${stocks.length}]=${A3('hsh', 0)};
 const float GM[${stocks.length}]=${R10L_A('float', stocks.map(st => R10L_N(st.gm ?? 1)))};
 const vec4 GR[${stocks.length}]=${R10L_A('vec4', stocks.map(st => `vec4(${[st.gr ?? .15, st.gs ?? 1, st.cg ?? .3, st.hal ?? 0].map(R10L_N).join(',')})`))};
 vec3 o0=clamp(O(uv).rgb,0.,1.);vec3 x=clamp(o0*exp2(u_p3),0.,1.);x=clamp(x*MX[m],0.,1.);
 vec3 hv=rgb2hsv(x);float hh=hv.x;vec3 dh=abs(vec3(hh)-vec3(.02,.3,.6));dh=min(dh,1.-dh);vec3 bw=max(1.-dh/.14,0.);
 hv.y=clamp(hv.y*(1.+dot(bw,SEL[m]-1.)),0.,1.);hv.x=fract(hv.x+dot(bw,HSH[m])/360.+1.);x=hsv2rgb(hv);
 x=pow(clamp(x,1e-4,1.-1e-4),vec3(GM[m]));x=clamp(x,1e-4,1.-1e-4);vec3 xg=pow(x,CON[m]);x=xg/(xg+pow(1.-x,CON[m]));
 x=BLK[m]+(WHT[m]-BLK[m])*x;float l=luma(x);x+=(SH[m]-luma(SH[m]))*(1.-l)*(1.-l)*1.6+(HI[m]-luma(HI[m]))*l*l*1.6;
 ${halo ? 'float hl=T(uv).r;x=1.-(1.-clamp(x,0.,1.))*(1.-hl*GR[m].w*vec3(1.,.3,.1));' : ''}
 x=mix(o0,clamp(x,0.,1.),u_p1);l=luma(x);
 vec2 p=PX(uv)/max(GR[m].y,.3);float n=(vnoise(p)-.5)*.7+(hash(floor(p))-.5)*.3;
 vec3 nc=vec3(vnoise(p*1.1+vec2(31.7,7.1)),vnoise(p*1.1+vec2(5.3,47.9)),vnoise(p*1.1+vec2(71.3,23.3)))-.5;
 x+=(vec3(n)+(nc-dot(nc,vec3(.333)))*GR[m].z*1.4)*GR[m].x*u_p2*.35*(.25+3.*l*(1.-l));return vec4(clamp(x,0.,1.),1.);`;
  return halo ? [`float l=luma(O(uv).rgb);return vec4(vec3(pow(max(l-.7,0.)/.3,1.2)),1.);`, BH('18.'), BV('18.'), body] : body;
};
const R10L_BW = stocks => {
  const A = (type, fn) => R10L_A(type, stocks.map(fn));
  return `int m=int(u_p0+.5);
 const vec3 W[${stocks.length}]=${A('vec3', st => { const s = st.w[0] + st.w[1] + st.w[2]; return R10L_V(st.w.map(v => v / s)); })};
 const vec4 TP[${stocks.length}]=${A('vec4', st => `vec4(${[st.con ?? 1, st.gm ?? 1, st.blk ?? 0, st.wht ?? 1].map(R10L_N).join(',')})`)};
 const vec3 TN[${stocks.length}]=${A('vec3', st => R10L_V(st.tint ?? [1, 1, 1]))};
 const vec2 GR[${stocks.length}]=${A('vec2', st => `vec2(${R10L_N(st.gr ?? .15)},${R10L_N(st.gs ?? 1)})`)};
 vec3 o0=clamp(O(uv).rgb,0.,1.);vec3 x=clamp(o0*exp2(u_p3),0.,1.);float l=clamp(dot(x,W[m]),1e-4,1.-1e-4);
 l=clamp(pow(l,TP[m].y),1e-4,1.-1e-4);float lg=pow(l,TP[m].x);l=lg/(lg+pow(1.-l,TP[m].x));l=TP[m].z+(TP[m].w-TP[m].z)*l;
 vec3 o=mix(o0,clamp(l*TN[m],0.,1.),u_p1);l=luma(o);
 vec2 p=PX(uv)/max(GR[m].y,.3);float n=(vnoise(p)-.5)*.7+(hash(floor(p))-.5)*.3;
 o+=n*GR[m].x*u_p2*.4*(.25+3.*l*(1.-l));return vec4(clamp(o,0.,1.),1.);`;
};

/* published character -> parameters. sat = global saturation, wb = channel gains, sel/hsh = saturation multiplier / hue shift (deg)
   for the red-orange, green and blue hue bands, con = per-channel sigmoid contrast (1 = none), gm = midtone power (<1 brighter),
   blk/wht = black / white points, sh/hi = shadow / highlight tint (made luminance-neutral), gr/gs/cg = grain amount / size px / chroma share,
   hal = red halation (stocks without rem-jet anti-halation layer) */
const R10L_NEG = [
  {n: 'Kodak Portra 160', sat: .9, wb: [1.03, 1, .96], con: .88, gm: .95, blk: [.03, .03, .035], wht: [.98, .97, .95], sh: [-.005, 0, .01], hi: [.015, .005, -.02], sel: [.95, .8, .9], hsh: [3, -8, 0], gr: .12, gs: .8},
  {n: 'Kodak Portra 800', sat: 1.05, wb: [1.05, 1, .93], con: .98, gm: .97, blk: .035, sh: [0, .005, .01], hi: [.02, .008, -.025], sel: [1.05, .85, .95], hsh: [2, -6, 0], gr: .3, gs: 1.3},
  {n: 'Kodak Gold 200', sat: 1.12, wb: [1.06, 1.02, .88], con: 1.05, gm: .97, blk: [.03, .025, .02], sh: [.01, .005, -.01], hi: [.025, .015, -.04], sel: [1.1, .95, .9], hsh: [3, -10, 0], gr: .25, gs: 1.1},
  {n: 'Kodak ColorPlus 200', sat: .98, wb: [1.05, 1.01, .9], con: .95, blk: .04, sh: [.01, .005, -.005], hi: [.02, .01, -.03], sel: [1.05, .9, .85], hsh: [2, -6, 0], gr: .3, gs: 1.2},
  {n: 'Kodak UltraMax 400', sat: 1.18, wb: [1.04, 1, .93], con: 1.1, blk: .025, hi: [.015, .008, -.02], sel: [1.1, 1, 1.05], hsh: [2, -5, 0], gr: .3, gs: 1.2},
  {n: 'Fuji Pro 400H', sat: .88, wb: [.98, 1.01, 1.02], con: .85, gm: .9, blk: [.035, .04, .045], wht: [.97, .98, .98], sh: [-.01, .01, .01], hi: [0, .008, 0], sel: [.9, 1, 1], hsh: [0, 10, -4], gr: .22, gs: 1},
  {n: 'Fuji Superia X-tra 400', sat: 1.1, wb: [.98, 1.02, 1], con: 1.08, blk: .03, sh: [-.015, .015, .005], hi: [.005, .005, -.01], sel: [1, 1.1, 1], hsh: [0, 6, -3], gr: .3, gs: 1.2},
  {n: 'Fujicolor C200', sat: 1, wb: [.97, 1.02, 1], con: .95, blk: .035, sh: [-.01, .012, .005], hi: [0, .005, -.005], sel: [.95, 1.05, .95], hsh: [0, 5, 0], gr: .28, gs: 1.15},
  {n: 'Fuji Natura 1600', sat: .95, wb: [1.02, 1.01, .96], con: .9, blk: .045, sh: [-.005, .01, 0], hi: [.01, .005, -.01], gr: .45, gs: 1.6},
  {n: 'Agfa Vista 200', sat: 1.15, wb: [1.02, 1, 1], con: 1.05, blk: .025, sh: [-.005, 0, .01], hi: [.01, 0, -.005], sel: [1.2, 1, 1.05], gr: .25, gs: 1.1},
  {n: 'Agfa Ultra 100', sat: 1.35, wb: [1.01, 1, 1], con: 1.1, blk: .02, sel: [1.15, 1.05, 1.15], gr: .12, gs: .8},
  {n: 'Kodak Vision3 50D', sat: 1, con: .95, blk: .02, gr: .06, gs: .7, cg: .2},
  {n: 'Kodak Vision3 250D', sat: .98, wb: [1.01, 1, .98], con: .93, blk: .025, gr: .14, gs: .9},
  {n: 'Kodak Vision3 500T', sat: .95, wb: [.92, .99, 1.08], con: .9, blk: .03, sh: [-.015, .005, .015], hi: [.01, 0, -.01], gr: .3, gs: 1.2},
  {n: 'Kodak 2383 print film', sat: 1.08, con: 1.35, gm: 1.05, blk: [0, .005, .01], wht: [.97, .96, .92], sh: [-.02, .005, .02], hi: [.02, .01, -.02], sel: [1.1, .9, 1], hsh: [0, -4, -4], gr: .05, gs: .8, cg: .1},
  {n: 'Kodak 2393 print film', sat: 1.15, con: 1.45, blk: 0, wht: .97, sh: [-.012, 0, .012], hi: [.012, .006, -.012], sel: [1.1, 1, 1.05], gr: .05, gs: .8, cg: .1},
  {n: 'CineStill 50D', sat: 1.05, wb: [.99, 1, 1.02], con: 1, blk: .02, gr: .08, gs: .7, hal: 1},
  {n: 'CineStill 400D', sat: 1.05, wb: [1.02, 1, .97], con: .98, blk: .03, hi: [.01, .005, -.01], gr: .25, gs: 1.1, hal: 1.1},
  {n: 'Harman Phoenix 200', sat: 1.1, wb: [1.08, .98, .88], con: 1.25, blk: [.02, .015, .03], sh: [0, -.005, .015], hi: [.03, .01, -.03], sel: [1.2, .85, .8], gr: .42, gs: 1.4, cg: .45, hal: 1.2},
];
const R10L_SLIDE = [
  {n: 'Kodak Elite Chrome 100', sat: 1.2, wb: [1.02, 1, .98], con: 1.3, wht: [.99, .98, .97], hi: [.005, .003, -.008], gr: .08, gs: .7},
  {n: 'Fuji Astia 100F', sat: 1.05, wb: [1, 1, 1.01], con: 1.1, sel: [.95, 1.05, 1.05], gr: .07, gs: .7},
  {n: 'Fuji Sensia 100', sat: 1.15, wb: [.98, 1, 1.03], con: 1.22, sh: [-.005, .008, .005], gr: .08, gs: .75},
  {n: 'Agfa Precisa 100', sat: 1.15, wb: [.95, 1, 1.06], con: 1.25, sh: [-.01, 0, .02], sel: [1, 1, 1.2], hsh: [0, 0, -6], gr: .08, gs: .75},
  {n: 'Agfachrome RSX 200', sat: 1.08, wb: [1.03, 1, .97], con: 1.18, hi: [.008, .004, -.008], gr: .12, gs: .9},
  {n: 'Lomography X-Pro Slide 200', sat: 1.3, wb: [1, 1.05, .9], con: [1.5, 1.35, .85], blk: [0, .03, .18], wht: [1, 1, .82], sh: [-.03, .02, .04], hi: [.02, .04, -.06], gr: .25, gs: 1.1},
  {n: 'Fuji FP-100C', sat: 1.1, wb: [.97, 1, 1.04], con: 1.05, blk: [.04, .05, .07], wht: [.96, .97, .97], sh: [-.02, .01, .02], sel: [1, 1.1, 1.1], gr: .1, gs: .9},
  {n: 'Polaroid 669 peel-apart', sat: .8, con: .8, gm: .95, blk: [.07, .08, .08], wht: [.94, .92, .85], sh: [-.02, .015, .01], hi: [.03, .02, -.03], gr: .15, gs: 1},
  {n: 'Lomochrome Purple', sat: 1.15, x: [[.6, .6, -.1], [.2, .1, .7], [.2, .7, .1]], con: 1.08, blk: .02, gr: .3, gs: 1.2},
  {n: 'Lomochrome Metropolis', sat: .35, wb: [1, 1, .96], con: 1.25, sel: [1.6, .7, .7], sh: [-.005, .005, .005], hi: [.01, .008, -.01], gr: .3, gs: 1.2},
  {n: 'Lomochrome Turquoise', sat: 1.05, x: [[.1, .2, .8], [0, 1, 0], [.5, .5, 0]], con: 1.1, blk: .02, gr: .3, gs: 1.2},
];
const R10L_BWS = [
  {n: 'Kodak T-Max 100', w: [.27, .55, .18], con: 1.12, gr: .06, gs: .6},
  {n: 'Kodak T-Max 400', w: [.28, .54, .18], con: 1.1, gr: .14, gs: .8},
  {n: 'Kodak T-Max P3200', w: [.3, .52, .18], con: 1.15, blk: .03, gr: .5, gs: 1.6},
  {n: 'Kodak Plus-X 125', w: [.25, .58, .17], con: 1.05, gr: .12, gs: .8},
  {n: 'Kodak BW400CN', w: [.3, .55, .15], con: .88, blk: .03, tint: [1, .985, .96], gr: .08, gs: 1},
  {n: 'Fuji Neopan Acros 100', w: [.2, .6, .2], con: 1.12, gr: .05, gs: .6},
  {n: 'Agfa APX 100', w: [.32, .52, .16], con: 1.08, gr: .15, gs: .9},
  {n: 'Agfa Scala 200', w: [.3, .55, .15], con: 1.35, wht: .98, tint: [.98, .99, 1.02], gr: .1, gs: .8},
  {n: 'Ilford FP4 Plus', w: [.29, .54, .17], con: 1.05, gr: .1, gs: .75},
  {n: 'Ilford Delta 100', w: [.28, .55, .17], con: 1.1, gr: .05, gs: .6},
  {n: 'Ilford Pan F Plus 50', w: [.33, .52, .15], con: 1.25, gr: .03, gs: .5},
  {n: 'Ilford XP2 Super', w: [.3, .56, .14], con: .85, blk: .03, wht: .98, gr: .05, gs: .9},
  {n: 'Kentmere 400', w: [.3, .55, .15], con: 1, blk: .02, gr: .3, gs: 1.2},
  {n: 'Fomapan 100', w: [.24, .58, .18], con: 1.18, gm: 1.05, gr: .18, gs: .9},
  {n: 'Rollei Retro 80S', w: [.5, .4, .1], con: 1.3, gr: .08, gs: .7},
];
const R10L_FUJI = [
  {n: 'Classic Chrome', sat: .72, con: 1.15, gm: 1.06, sh: [-.008, 0, .006], hi: [.012, .006, -.01], sel: [.8, .75, .95], hsh: [3, -5, -8], gr: .2},
  {n: 'Classic Negative', sat: .85, con: 1.25, blk: .01, sh: [-.025, .01, .02], hi: [.02, -.005, -.015], sel: [1.05, .8, .85], hsh: [-4, 12, -6], gr: .2},
  {n: 'Nostalgic Neg.', sat: 1, con: .95, gm: .97, blk: [.02, .015, .01], sh: [.005, 0, -.005], hi: [.035, .015, -.035], sel: [1.05, .9, .9], hsh: [3, -6, 0], gr: .2},
  {n: 'Reala Ace', sat: 1.05, con: 1.15, gr: .2},
  {n: 'Eterna (cinema)', sat: .65, con: .78, blk: [.035, .04, .045], wht: .96, sh: [-.01, .006, .01], hi: [.005, .004, -.004], hsh: [0, 6, 0], gr: .2},
  {n: 'Pro Neg. Hi', sat: .9, wb: [1.01, 1, .99], con: 1.05, sel: [.95, .9, .95], hi: [.008, .004, -.006], gr: .2},
  {n: 'Pro Neg. Std', sat: .82, con: .85, blk: .02, sel: [.9, .85, .9], gr: .2},
  {n: 'Astia / Soft', sat: 1.05, wb: [1.01, 1, 1], con: .95, sel: [.95, 1.15, 1.15], gr: .2},
];

f = add('Film');
f('filmneg2','Film Stock Emulation II (colour negative & cine)',[S('Stock',R10L_NEG.map(s => s.n)),P('Strength',0,1,1,.01),P('Grain',0,2,1,.01),P('Exposure',-1,1,0,.01,'EV')],
  R10L_COLOUR(R10L_NEG, true),'look approximations from published character (contrast, saturation, shadow/highlight casts, hue-band shifts, grain; CineStill / Phoenix red halation) — not measured LUTs', 1);
f('filmslide2','Film Stock Emulation III (slide, instant, Lomochrome)',[S('Stock',R10L_SLIDE.map(s => s.n)),P('Strength',0,1,1,.01),P('Grain',0,2,1,.01),P('Exposure',-1,1,0,.01,'EV')],
  R10L_COLOUR(R10L_SLIDE, false),'look approximations: E-6 contrast/saturation, cross-processing (per-channel curves), peel-apart instant fade, Lomochrome colour-swap matrices — not measured LUTs', 1);
f('filmbw2','Film Stock Emulation IV (black & white)',[S('Stock',R10L_BWS.map(s => s.n)),P('Strength',0,1,1,.01),P('Grain',0,2,1,.01),P('Exposure',-1,1,0,.01,'EV')],
  R10L_BW(R10L_BWS),'look approximations: spectral response weights (ortho-pan Acros, extended-red Retro 80S), sigmoid contrast, chromogenic vs silver grain — not measured curves', 1);
f('fujisim','Fujifilm Film Simulations',[S('Simulation',R10L_FUJI.map(s => s.n)),P('Strength',0,1,1,.01),P('Grain effect',0,2,0,.01),P('Exposure',-1,1,0,.01,'EV')],
  R10L_COLOUR(R10L_FUJI, false),'look approximations of the in-camera simulations from Fujifilm\'s published descriptions (tonality, saturation, hue character); grain effect off by default', 1);
