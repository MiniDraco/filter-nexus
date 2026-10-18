"""Generate batch_r9b_palettes.js (palette tables are long, so they're generated). Run from filter-nexus/."""
import math


def hx(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


NES = ("7C7C7C 0000FC 0000BC 4428BC 940084 A80020 A81000 881400 503000 007800 006800 005800 004058 000000 "
       "BCBCBC 0078F8 0058F8 6844FC D800CC E40058 F83800 E45C10 AC7C00 00B800 00A800 00A844 008888 "
       "F8F8F8 3CBCFC 6888FC 9878F8 F878F8 F85898 F87858 FCA044 F8B800 B8F818 58D854 58F898 00E8D8 787878 "
       "FCFCFC A4E4FC B8B8F8 D8B8F8 F8B8F8 F8A4C0 F0D0B0 FCE0A8 F8D878 D8F878 B8F8B8 B8F8D8 00FCFC F8D8F8").split()
C64 = "000000 FFFFFF 68372B 70A4B2 6F3D86 588D43 352879 B8C76F 6F4F25 433900 9A6759 444444 6C6C6C 9AD284 6C5EB5 959595".split()
MSX = "000000 21C842 5EDC78 5455ED 7D76FC D4524D 42EBF5 FC5554 FF7978 D4C154 E6CE80 21B03B C95BBA CCCCCC FFFFFF".split()
EGA16 = "000000 0000AA 00AA00 00AAAA AA0000 AA00AA AA5500 AAAAAA 555555 5555FF 55FF55 55FFFF FF5555 FF55FF FFFF55 FFFFFF".split()
ZX = [tuple(v * k for v in rgb) for k in (215 / 255, 1.0)
      for rgb in [(0, 0, 0), (0, 0, 1), (1, 0, 0), (1, 0, 1), (0, 1, 0), (0, 1, 1), (1, 1, 0), (1, 1, 1)]][1:]
VB = "000000 550000 A40000 EF0000".split()
lv = lambda n: [i / (n - 1) for i in range(n)]
EGA64 = [(r, g, b) for r in lv(4) for g in lv(4) for b in lv(4)]
CPC = [(r, g, b) for r in (0, .5, 1) for g in (0, .5, 1) for b in (0, .5, 1)]
ATARI = []
for h in range(16):
    for l in range(8):
        y = .08 + l * .125
        if h == 0:
            ATARI.append((y, y, y)); continue
        a = math.radians(180 - (h - 1) * 25.7); i, q = .22 * math.cos(a), .22 * math.sin(a)
        ATARI.append(tuple(max(0, min(1, v)) for v in (y + .956 * i + .621 * q, y - .272 * i - .647 * q, y - 1.106 * i + 1.703 * q)))
PALS = [("NES (2C02)", [hx(h) for h in NES]), ("Commodore 64 (Pepto)", [hx(h) for h in C64]), ("ZX Spectrum", ZX),
        ("EGA 16 / CGA 16", [hx(h) for h in EGA16]), ("EGA 64 / Master System", EGA64), ("Amstrad CPC (27)", CPC),
        ("MSX (TMS9918)", [hx(h) for h in MSX]), ("Atari 2600 NTSC (approx.)", ATARI), ("Virtual Boy", [hx(h) for h in VB])]


def f3(t): return "vec3(%s)" % ",".join(("%.3f" % v).rstrip("0").rstrip(".") or "0" for v in t)


fill = "vec3 PL[128];int NP=0;int pal=int(u_p0+.5);\n"
for k, (name, cols) in enumerate(PALS):
    fill += ("  if" if k == 0 else "  else if") + f"(pal=={k}){{" + "".join(f"PL[{i}]={f3(c)};" for i, c in enumerate(cols)) + f"NP={len(cols)};}}\n"
names = ",".join(f"'{n}'" for n, _ in PALS)
NEAR = ("#define NEAREST(Q,OUT) {float bd_=1e9;for(int ii=0;ii<128;ii++){if(ii>=NP)break;vec3 dd=PL[ii]-(Q);"
        "float ee=dot(dd,dd*vec3(.3,.59,.11));if(ee<bd_){bd_=ee;OUT=PL[ii];}}}")
BAYER = ("float bay=0.;{ivec2 q=ivec2(mod(floor(PX(uv)/max(u_p2,1.)),8.));int v=0;"
         "for(int b=2;b>=0;b--){int bx=(q.x>>b)&1,by=(q.y>>b)&1;v=(v<<2)|(((bx^by)<<1)|by);}bay=(float(v)+.5)/64.;}")
JS = r"""/* ================= Round 9B: retro palettes & screen dithering ================= */
f = add('Retro');
f('palettedither','Palette Dither (Retro Systems)',[S('Palette',[@NAMES@]),S('Dither',['Nearest color','Bayer 8×8','Yliluoma (2-color mix)','Knoll pattern','Interleaved gradient noise','Blue-noise approx. (R2 sequence)']),P('Pixel size',1,8,1,1,'px'),P('Dither spread',0,1,.5,.01)],
  `vec2 pp=floor(PX(uv)/max(u_p2,1.))*max(u_p2,1.)+.5*max(u_p2,1.);vec3 src=T(fromPX(pp)).rgb;@FILL@
  @NEAR@
  @BAYER@int dm=int(u_p1+.5);vec3 o=src;
  if(dm==4)bay=fract(52.9829189*fract(dot(floor(PX(uv)/max(u_p2,1.)),vec2(.06711056,.00583715))));
  if(dm==5){vec2 q=floor(PX(uv)/max(u_p2,1.));bay=fract(q.x*.7548776662+q.y*.5698402910);}
  if(dm==0){NEAREST(src,o)}
  else if(dm==1||dm==4||dm==5){vec3 q=src+(bay-.5)*u_p3*.5;NEAREST(q,o)}
  else if(dm==2){vec3 a=src;NEAREST(src,a)vec3 bb=a;float be=1e9,br=0.;for(int ii=0;ii<128;ii++){if(ii>=NP)break;vec3 cnd=PL[ii];vec3 dv=cnd-a;float l2=dot(dv,dv);if(l2<1e-6)continue;float r=clamp(dot(src-a,dv)/l2,0.,1.);vec3 dd=mix(a,cnd,r)-src;float e=dot(dd,dd)+l2*.02*(1.-u_p3);if(e<be){be=e;bb=cnd;br=r;}}o=bay<br?bb:a;}
  else{vec3 cand[16];vec3 err=vec3(0.);for(int k=0;k<16;k++){vec3 at=src+err*u_p3*1.5;vec3 ch=src;NEAREST(at,ch)cand[k]=ch;err+=src-ch;}
   int idx=int(bay*16.);for(int k=0;k<16;k++){int rk=0;for(int q=0;q<16;q++){float lq=luma(cand[q]),lk=luma(cand[k]);rk+=(lq<lk||(lq==lk&&q<k))?1:0;}if(rk==idx)o=cand[k];}}
  return vec4(o,1.);`,'NES, C64, ZX, EGA, SMS, CPC, MSX, Atari, Virtual Boy; Yliluoma and Knoll pattern dithering');
f('zxspectrum','ZX Spectrum (Attribute Clash)',[S('Dither',['None','Bayer 4×4']),P('Contrast',.5,2,1.1,.01)],
  `float kk=max(u_k,1.);vec2 cell=floor(PX(uv)/(8.*kk));vec3 ZXP[15];{int i=0;for(int br=0;br<2;br++)for(int k=0;k<8;k++){if(br==1&&k==0)continue;float s=br==0?.843:1.;ZXP[i]=vec3(float((k>>1)&1),float((k>>2)&1),float(k&1))*s;i++;}}
  float lo=1e9,hi=-1e9;vec3 dk=vec3(0.),lt=vec3(1.);for(int j=0;j<4;j++)for(int i=0;i<4;i++){vec3 v=clamp((T(fromPX((cell*8.+vec2(float(i),float(j))*2.+1.)*kk)).rgb-.5)*u_p1+.5,0.,1.);float l=luma(v);if(l<lo){lo=l;dk=v;}if(l>hi){hi=l;lt=v;}}
  vec3 ink=ZXP[0],pap=ZXP[0];float bi=1e9,bp=1e9;for(int k=0;k<15;k++){vec3 a=ZXP[k]-dk,b=ZXP[k]-lt;float ea=dot(a,a),eb=dot(b,b);if(ea<bi){bi=ea;ink=ZXP[k];}if(eb<bp){bp=eb;pap=ZXP[k];}}
  vec3 v=clamp((c.rgb-.5)*u_p1+.5,0.,1.);float t=dot(v-ink,pap-ink)/max(dot(pap-ink,pap-ink),1e-4);float th=.5;if(u_p0>.5){ivec2 q=ivec2(mod(floor(PX(uv)/kk),4.));int m4[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);th=(float(m4[q.y*4+q.x])+.5)/16.;}
  return vec4(t>th?pap:ink,1.);`,'2 colours per 8×8 cell (ink + paper)');
f('apple2','Apple II Hi-Res Artifact Color',[P('Pixel size',1,6,2,1,'px'),P('Contrast',.5,2,1.1,.01)],
  `float B=max(R(u_p0),1.);vec2 cp=floor(PX(uv)/B);float gx=floor(cp.x/7.);vec3 sA[4]=vec3[4](vec3(0.),vec3(1.),vec3(.08,.79,0.),vec3(.73,.22,.93));vec3 sB[4]=vec3[4](vec3(0.),vec3(1.),vec3(.95,.45,0.),vec3(0.,.55,1.));
  float eA=0.,eB=0.;for(int i=0;i<7;i++){vec3 v=clamp((T(fromPX((vec2(gx*7.+float(i),cp.y)+.5)*B)).rgb-.5)*u_p1+.5,0.,1.);float ba=1e9,bb2=1e9;for(int k=0;k<4;k++){vec3 a=sA[k]-v,b=sB[k]-v;ba=min(ba,dot(a,a));bb2=min(bb2,dot(b,b));}eA+=ba;eB+=bb2;}
  vec3 v=clamp((T(fromPX((cp+.5)*B)).rgb-.5)*u_p1+.5,0.,1.);vec3 o=vec3(0.);float bd=1e9;for(int k=0;k<4;k++){vec3 cnd=eA<=eB?sA[k]:sB[k];vec3 d=cnd-v;float e=dot(d,d);if(e<bd){bd=e;o=cnd;}}return vec4(o,1.);`,'6 colours, one palette (green/violet or orange/blue) per 7-pixel group');
f('linescreen','Line / Crosshatch / Clustered-Dot Screen',[S('Screen',['Line screen','Crosshatch','Clustered dot']),P('Period',2,24,6,.5,'px'),P('Angle',0,180,45,1,'°'),P('Levels',2,8,2,1)],
  `float a=radians(u_p2);mat2 rm=mat2(cos(a),sin(a),-sin(a),cos(a));vec2 p=rm*PX(uv)/R(u_p1);int m=int(u_p0+.5);float th;
  if(m==0)th=.5+.5*cos(6.2832*p.y);else if(m==1)th=min(.5+.5*cos(6.2832*p.y),.5+.5*cos(6.2832*p.x));else th=.5+.25*(cos(6.2832*p.x)+cos(6.2832*p.y));
  th=1.-th;float n=floor(u_p3+.5)-1.;vec3 v=c.rgb*n;vec3 q=floor(v)+step(vec3(th),fract(v));return vec4(clamp(q/n,0.,1.),1.);`,'AM screens: line, crosshatch, clustered dot (per channel)');
"""
out = JS.replace("@NAMES@", names).replace("@FILL@", fill).replace("@NEAR@", NEAR).replace("@BAYER@", BAYER)
open("research/batch_r9b_palettes.js", "w", encoding="utf-8").write(out)
print("ok", sum(len(c) for _, c in PALS), "palette colours")
