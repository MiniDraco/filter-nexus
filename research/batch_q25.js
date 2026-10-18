/* ================= q25: G'MIC math renders (gmic-community: Penrose, Hitomezashi, Ellsworth Kelly board, Markus-Lyapunov, Henon, Chirikov, Thorn, harmonograph, pintograph, chryzodes, tangential circles, Pythagoras tree, cosmic nebula, Nebulous, Neon Carpet, Tupper) + textbook (Argyle / Macleod, Stentiford) ================= */
const Q25_MAC = `
#define Q25SEG(pp,aa,bb) length((pp)-(aa)-((bb)-(aa))*clamp(dot((pp)-(aa),(bb)-(aa))/max(dot((bb)-(aa),(bb)-(aa)),1e-9),0.,1.))
#define Q25CR(aa,bb) ((aa).x*(bb).y-(aa).y*(bb).x)
#define Q25TS(pp,aa,bb,cc) (min(min(Q25CR((bb)-(aa),(pp)-(aa))*sign(Q25CR((bb)-(aa),(cc)-(aa))),Q25CR((cc)-(bb),(pp)-(bb))*sign(Q25CR((bb)-(aa),(cc)-(aa)))),Q25CR((aa)-(cc),(pp)-(cc))*sign(Q25CR((bb)-(aa),(cc)-(aa)))))
`;
const Q25_TUPK = ['960939379918958884971672962127852754715004339660129306651505519271702802395266424689642842174350718121267153782770623355993237280874144307891325963941337723487857735749823926629715517173716995165232890538221612403238855866184013235585136048828693337902491454229288667081096184496091705183454067827731551705405381627380967602565625016981482083418783163849115590225610003652351370343874461848378737238198224849863465033159410054974700593138339226497249461751545728366702369745461014655997933798537483143786841806593422227898388722980000748404719',
 '395237837253173619377196292693949302406153931873024916260538490717335936871532361396117451541392229602948889604348128275446264586897474193776400465275167777832622157773372879463606146128022620285693891540788235229239672405060120203686774511468011972485984983535894919421543461759499096362152894616017344239642743391778941134500105852623176726707340602287941750635663845779675174278129608159631247023276032',
 '1162909606774227786762360554904656873467005634722346243123857684508335800080212296528535403972500597220234608121734983386023291518966099546891430040655179625172067449629161883859511896818291049959507502002794829515164438990867773160767189319641778161093019870270482668056135958042158788515967843798733586173623987894941361961956503217167249393827582112256509171868414221167242597679368110852891933106118102448936895420986905619254557683605421985950220457144259359231632456877367983992190446749365022925067669913265323579719756925062086656',
 '1843812769630219797102194898630589042838024531800431544407803208699762220759288686771851688175304525277287596637929619481851566234761209320517998687008822582390183399326187543197624279014134019615905245154166656477378450656137074612544163896000320136805982694616420881365676363963235184229519627621212049120298076086417612215067181351396556381877005473113076180736051591032787133962681831575450591579944470027127255325865144199772221608835705143631909500064802696725673323645838019575905814384115925441812137010043170716647424'];
const Q25_TUPA = (() => { const w = []; for (const s of Q25_TUPK) { let n = BigInt(s) / 17n; for (let i = 0; i < 57; i++) { w.push(Number(n & 0xffffffffn) + 'u'); n >>= 32n; } } return 'uint[' + w.length + '](' + w.join(',') + ')'; })();

f = add('Render');
f('q25_penrose','Penrose Tiling (GMIC P3 rhombs / P2 kites and darts)',[S('Tiling',['P3 thick and thin rhombs','P2 kites and darts','P3 image mosaic','P2 image mosaic']),P('Tile edge',8,200,40,1,'px'),P('Outline',0,30,4,.5,'%'),P('Colour variation',0,1,.3,.01)],
  Q25_MAC + `const float PH=1.6180339887;const float PI_=3.14159265;
 int ty=int(u_p0+.5);bool p2=(ty==1||ty==3);vec2 S_=u_res/u_k;vec2 p=PX(uv)-.5*S_;
 float hd=.5*length(S_)/.95;float E=u_p1;int n=int(clamp(ceil(log(max(hd/E,1.01))/log(PH)),1.,18.));float Rs=E*pow(PH,float(n));
 int i=int(mod(floor((atan(p.y,p.x)+PI_/10.)/(PI_/5.)),10.));
 vec2 A=vec2(0.),B=Rs*vec2(cos(float(2*i-1)*PI_/10.),sin(float(2*i-1)*PI_/10.)),C=Rs*vec2(cos(float(2*i+1)*PI_/10.),sin(float(2*i+1)*PI_/10.));
 if(i==2*(i/2)){vec2 tt=B;B=C;C=tt;}
 int col=0;
 for(int k=0;k<18;k++){if(k>=n)break;
  vec2 a0,b0,c0,a1,b1,c1,a2,b2,c2;int k0,k1,k2;int m=2;
  if(!p2){
   if(col==0){vec2 P_=A+(B-A)/PH;k0=0;a0=C;b0=P_;c0=B;k1=1;a1=P_;b1=C;c1=A;k2=0;a2=a0;b2=b0;c2=c0;}
   else{vec2 Q_=B+(A-B)/PH,R_=B+(C-B)/PH;k0=1;a0=R_;b0=C;c0=A;k1=1;a1=Q_;b1=R_;c1=B;k2=0;a2=R_;b2=Q_;c2=A;m=3;}
  }else{
   if(col==0){vec2 P_=A+(C-A)/PH,R_=A+(B-A)/(PH*PH);k0=0;a0=B;b0=C;c0=P_;k1=0;a1=B;b1=R_;c1=P_;k2=1;a2=R_;b2=A;c2=P_;m=3;}
   else{vec2 Q_=B+(C-B)/PH;k0=0;a0=B;b0=Q_;c0=A;k1=1;a1=Q_;b1=C;c1=A;k2=0;a2=a0;b2=b0;c2=c0;}
  }
  float s0=Q25TS(p,a0,b0,c0),s1=Q25TS(p,a1,b1,c1),s2=m==3?Q25TS(p,a2,b2,c2):-1e30;
  if(s0>=s1&&s0>=s2){A=a0;B=b0;C=c0;col=k0;}else if(s1>=s2){A=a1;B=b1;C=c1;col=k1;}else{A=a2;B=b2;C=c2;col=k2;}
 }
 float d=min(Q25SEG(p,C,A),Q25SEG(p,A,B));vec2 key=(B+C)*.5;if(p2){d=col==0?min(Q25SEG(p,A,B),Q25SEG(p,B,C)):min(Q25SEG(p,B,C),Q25SEG(p,C,A));key=col==0?(C+A)*.5:(A+B)*.5;}
 bool tA=p2?(col==0):(col==1);
 vec3 fc=tA?vec3(110.,170.,240.)/255.:vec3(240.,150.,60.)/255.;
 if(ty>=2)fc=O(clamp(fromPX(key+.5*S_),0.,1.)).rgb;
 fc*=1.+u_p3*(hash(floor(key*.37+.5)+vec2(float(col)*7.1,3.3))-.5);
 float w=.5*u_p2/100.*E;float ln=1.-smoothstep(w-.6,w+.6,d);if(u_p2<=0.)ln=0.;
 return vec4(mix(clamp(fc,0.,1.),vec3(20./255.),ln),1.);`,
  'G\'MIC fx_penrose_tiling (Tschumperle): Robinson-triangle deflation from a sun of 10 golden triangles; per pixel the containing sub-triangle is followed through n deflations (n set so the tile edge is Tile edge px); P3 rules (thin / thick halves) as in Preshing; P2: half-kite (36 deg, legs phi) -> 2 half-kites + 1 half-dart, half-dart (108 deg) -> half-kite + half-dart (Robinson A-triangle deflation), each tile outlined without its axis; outline = the two drawn sides CA, AB; tile A (110,170,240) thick rhomb / kite, tile B (240,150,60), outline (20,20,20), random brightness variation per tile; mosaic modes fill each tile with the image colour at its centre');

f('q25_stitch','Hitomezashi Stitches / Ellsworth Kelly Board (GMIC Reptorian)',[S('Pattern',['Hitomezashi stitches','Hitomezashi two-colour','Hitomezashi mirrored strings','Ellsworth Kelly board']),P('Cell size',4,80,14,1,'px'),P('Density',5,95,50,1,'%'),P('Line or border width',0,45,14,1,'%')],
  `int md=int(u_p0+.5);vec2 P=PX(uv);float cs=u_p1;vec2 g=floor(P/cs);vec2 fq=P/cs-g;float dn=u_p2/100.;float lw=max(u_p3/100.,.02)*cs*.5;
 if(md==3){
  vec3 pal[12]=vec3[12](vec3(.80,.12,.15),vec3(.94,.47,.12),vec3(.98,.82,.16),vec3(.16,.55,.27),vec3(.12,.27,.63),vec3(.39,.67,.86),vec3(.08,.08,.08),vec3(.94,.94,.92),vec3(.90,.55,.63),vec3(.43,.24,.55),vec3(.47,.27,.16),vec3(.59,.75,.24));
  float bd=u_p3/100.*cs;vec2 lp=fq*cs;float inner=step(bd,min(min(lp.x,cs-lp.x),min(lp.y,cs-lp.y)));
  float hv=hash(g+vec2(17.3+u_seed,4.1));vec3 un=vec3(110.,105.,130.)/255.;
  if(hv>dn)return vec4(un,1.);int ci=int(floor(hash(g*1.37+vec2(2.9,u_seed))*12.));ci=min(ci,11);
  return vec4(mix(vec3(.25),pal[ci],inner),1.);}
 float ix=g.x,iy=g.y;
 #define Q25RB(j) (hash(vec2((j),31.7+u_seed))<dn?1.:0.)
 #define Q25CB(i) (hash(vec2(57.1+u_seed,(i)))<dn?1.:0.)
 float jx=md==2?abs(ix-floor(.5*u_res.x/u_k/cs)):ix,jy=md==2?abs(iy-floor(.5*u_res.y/u_k/cs)):iy;
 float jx1=md==2?abs(ix+1.-floor(.5*u_res.x/u_k/cs)):ix+1.,jy1=md==2?abs(iy+1.-floor(.5*u_res.y/u_k/cs)):iy+1.;
 float hb=mod(ix+Q25RB(jy),2.)<.5?1.:0.;float ht=mod(ix+Q25RB(jy1),2.)<.5?1.:0.;
 float vl=mod(iy+Q25CB(jx),2.)<.5?1.:0.;float vr=mod(iy+Q25CB(jx1),2.)<.5?1.:0.;
 float d=1e9;if(hb>.5)d=min(d,fq.y*cs);if(ht>.5)d=min(d,(1.-fq.y)*cs);if(vl>.5)d=min(d,fq.x*cs);if(vr>.5)d=min(d,(1.-fq.x)*cs);
 float ln=1.-smoothstep(lw-.6,lw+.6,d);
 if(md==0)return vec4(mix(vec3(.96,.94,.9),vec3(.12,.12,.2),ln),1.);
 float par=0.;
 for(int i=1;i<512;i++){if(float(i)>ix)break;float jj=md==2?abs(float(i)-floor(.5*u_res.x/u_k/cs)):float(i);par+=Q25CB(jj)<.5?1.:0.;}
 for(int j=1;j<512;j++){if(float(j)>iy)break;float jj=md==2?abs(float(j)-floor(.5*u_res.y/u_k/cs)):float(j);par+=mod(ix+Q25RB(jj),2.)<.5?1.:0.;}
 vec3 fc=mod(par,2.)<.5?vec3(241.,255.,85.)/255.:vec3(159.,26.,157.)/255.;
 return vec4(mix(fc,vec3(.1),ln*.85),1.);`,
  'Hitomezashi (sashiko) stitching: each grid row / column has a random bit (Density = probability of 1); a row with bit a has horizontal stitches on the segments x with (x + a) even, columns likewise; two-colour mode fills the regions by parity of the stitches crossed from the corner (the pattern is always 2-colourable; G\'MIC duotone A (241,255,85) / B (159,26,157)); mirrored strings = bits symmetric about the centre. Ellsworth Kelly Board (rep_ekb): square grid, each square painted with probability Density in a random colour of a 12-colour Kelly-like spectrum palette, inset by the border width (border value 25 % grey), unfilled squares (110,105,130)', 1);

f('q25_dynmaps','Dynamical-System Maps (Markus-Lyapunov / Henon / Chirikov / Thorn)',[S('Map',['Markus-Lyapunov AB','Markus-Lyapunov AABAB','Markus-Lyapunov BBBBBBAAAAAA','Henon phase diagram','Chirikov-Taylor standard map','Thorn fractal (Secant Sea)','Thorn inverted','Thorn arctangent']),P('Parameter',0,1,.5,.01),P('Zoom',.25,8,1,.01),P('Iterations',20,400,150,1)],
  `int m=int(u_p0+.5);int N=int(u_p3+.5);float zm=u_p2;vec2 A=vec2(asp(),1.);vec2 q=(uv-.5)*A;
 if(m<=2){float a=3.+(uv.x-.5)*2./zm,b=3.+(uv.y-.5)*2./zm;float x=clamp(u_p1,.02,.98);float lam=0.;
  for(int k=0;k<420;k++){if(k>=N+20)break;bool useb=m==0?(k-2*(k/2)==1):m==1?((k-5*(k/5))==2||(k-5*(k/5))==4):((k-12*(k/12))<6);float rr=useb?b:a;
   x=rr*x*(1.-x);if(k>=20)lam+=log(max(abs(rr*(1.-2.*x)),1e-12));}
  lam/=float(N);vec3 col;
  if(lam<0.){float t=clamp(-lam/1.5,0.,1.);col=mix(vec3(.12,.08,0.),vec3(1.,.9,.25),pow(t,.45));}
  else col=mix(vec3(.15,.25,1.),vec3(0.),clamp(lam*1.6,0.,1.));
  return vec4(col,1.);}
 if(m==3||m==4){const float TP=6.2831853;float sw=0.,acc=0.,a1=0.,w1=0.,a2=0.,w2=0.;bool esc=false;
  if(m==3){float al=2.569+(u_p1-.5)*2.;float ca=cos(al),sa=sin(al);vec2 z=q*2.4/zm;
   for(int k=0;k<400;k++){if(k>=N)break;float yy=z.y-z.x*z.x;vec2 z2=vec2(z.x*ca-yy*sa,z.x*sa+yy*ca);
    float dl=atan(z.x*z2.y-z.y*z2.x,dot(z,z2))/TP;z=z2;if(dot(z,z)>9.){esc=true;break;}
    float t=(float(k)+.5)/float(N);float w=exp(-1./max(t*(1.-t),1e-4));acc+=w*dl;sw+=w;float hN=float(N)*.5;
    if(float(k)<hN){float t1=(float(k)+.5)/hN;float ww=exp(-1./max(t1*(1.-t1),1e-4));a1+=ww*dl;w1+=ww;}else{float t2=(float(k)-hN+.5)/hN;float ww=exp(-1./max(t2*(1.-t2),1e-4));a2+=ww*dl;w2+=ww;}}
  }else{float K=.971635+(u_p1-.5)*4.;float th=3.14159265+(uv.x-.5)*TP/zm,pp=(uv.y-.5)*TP/zm;
   for(int k=0;k<400;k++){if(k>=N)break;pp+=K*sin(th);pp-=TP*floor((pp+3.14159265)/TP);th+=pp;float dl=pp/TP;
    float t=(float(k)+.5)/float(N);float w=exp(-1./max(t*(1.-t),1e-4));acc+=w*dl;sw+=w;float hN=float(N)*.5;
    if(float(k)<hN){float t1=(float(k)+.5)/hN;float ww=exp(-1./max(t1*(1.-t1),1e-4));a1+=ww*dl;w1+=ww;}else{float t2=(float(k)-hN+.5)/hN;float ww=exp(-1./max(t2*(1.-t2),1e-4));a2+=ww*dl;w2+=ww;}}}
  if(esc)return vec4(0.,0.,0.,1.);
  float om=acc/max(sw,1e-9);float ch=abs(a1/max(w1,1e-9)-a2/max(w2,1e-9));float reg=exp(-ch*800.);
  vec3 col=hsv2rgb(vec3(fract(om*(m==3?3.:1.)+.5),.75,.3+.7*reg));return vec4(col,1.);}
 float dx=(u_p1-.5)*2.,dy=(u_p1-.5)*2.;vec2 z=q*2.*3.14159265/zm;if(z.x==0.||z.y==0.)return vec4(0.,0.,0.,1.);
 float v=0.;for(int k=0;k<400;k++){if(k>=N)break;float a=z.x,b=z.y;
  if(m==5)z=vec2(a/cos(b),b/sin(a));else if(m==6)z=vec2(a/sin(b),b/cos(a));else z=vec2(a/atan(b),b/atan(a));
  z+=vec2(dx,dy);v=float(k+1);if(!(dot(z,z)<=10000.))break;}
 float g=v/float(N);return vec4(vec3(pow(g,.6)),1.);`,
  'Markus-Lyapunov (rep_mlfrac): logistic map x -> r x (1-x) with r taken from (a, b) by the A/B string, a horizontal and b vertical over [2,4]^2, exponent = mean log|r (1 - 2x)| after 20 warm-up steps (Parameter = x0); negative = yellow, chaotic = blue -> black. Henon area-preserving quadratic map x\' = x cos a - (y - x^2) sin a, y\' = x sin a + (y - x^2) cos a (a = 2.569 at Parameter .5) and Chirikov-Taylor standard map p\' = p + K sin th, th\' = th + p\' (K = 0.9716 critical at .5): G\'MIC plots many orbits as points; here each pixel is an initial condition coloured by its weighted Birkhoff-average rotation number (hue: constant along each invariant curve, so the KAM curves and island chains of the phase diagram appear as bands) and darkened where the two half-orbit averages disagree (chaotic sea), escaping orbits black (approx. visualisation of the same phase portrait). Thorn fractal / Secant Sea (rep_thorn_fractal, Bourke): a\' = a / cos b + dx, b\' = b / sin a + dy (inverted: a / sin b, b / cos a; arctangent: a / atan b, b / atan a) from the pixel, PI-based scaling, grey = escape iteration (|z|^2 > 10000)');

f('q25_curves','Harmonograph / Pintograph / Chryzodes / Tangential Circles (GMIC)',[S('Curve',['Harmonograph','Pintograph','Chryzode','Tangential circles']),P('Variant',0,8,0,1),P('Size',10,100,90,1,'%'),P('Line width',.5,6,1.3,.1,'px')],
  Q25_MAC + `int m=int(u_p0+.5);int vr=int(u_p1+.5);vec2 S_=u_res/u_k;vec2 p=PX(uv)-.5*S_;float sz=u_p2/100.;float lw=u_p3*.5;float d=1e9;vec3 bg=O(uv).rgb,pen=vec3(192.,128.,64.)/255.;
 if(m<=1){vec4 fr,ph,dm;float fv=float(vr);
  if(m==0){fr=vr==0?vec4(4.,6.,2.,2.):vec4(1.+mod(fv,3.),2.+mod(fv*2.,5.),1.+mod(fv+1.,4.),1.+mod(fv*3.,4.))+vec4(0.,.02,0.,.01);ph=vec4(15.,270.,75.,60.)+fv*vec4(.7,1.3,.4,2.1);dm=vec4(.04,.04,.05,.06);}
  else{fr=vec4(4.,4.05,4.16,4.32)+fv*vec4(0.,.01,.02,-.015);ph=vec4(75.,150.,75.,60.)+fv*vec4(.5,1.1,.3,.9);dm=vec4(0.);}
  float sc=sz*.5*min(S_.x,S_.y)/350.;vec4 am=vec4(150.,200.,200.,100.)*sc;
  vec2 prev=vec2(0.);for(int k=0;k<1200;k++){float t=float(k)*.04;vec4 e=exp(-dm*t);vec4 sv=sin(fr*t+ph)*e*am;vec2 pt=vec2(sv.x+sv.y,-(sv.z+sv.w));
   if(k>0)d=min(d,Q25SEG(p,prev,pt));prev=pt;}
  float ln=1.-smoothstep(lw-.6,lw+.6,d);return vec4(mix(bg,pen,ln),1.);}
 if(m==2){int NP[9]=int[9](79,431,353,619,691,613,358,118,699);int MU[9]=int[9](3,7,3,4,12,20,13,20,6);int np=NP[vr],mu=MU[vr];
  float R=sz*.5*min(S_.x,S_.y);const float TP=6.2831853;
  for(int k=1;k<700;k++){if(k>=np)break;int j=(k*mu)-np*((k*mu)/np);if(j==k)continue;
   vec2 a=R*vec2(cos(TP*float(k)/float(np)),sin(TP*float(k)/float(np))),b=R*vec2(cos(TP*float(j)/float(np)),sin(TP*float(j)/float(np)));d=min(d,Q25SEG(p,a,b));}
  float ln=1.-smoothstep(lw-.6,lw+.6,d);return vec4(mix(vec3(0.),vec3(240.,128.,64.)/255.,ln*.9),1.);}
 float nb=5.+float(vr);float R=sz*.5*min(S_.x,S_.y)*.95;vec2 q=p;d=abs(length(q)-R);
 float an=3.14159265/nb;float sn=sin(an);
 for(int L=0;L<3;L++){float ra=R/(1.+1./sn),ry=R/(1.+sn);float j=floor(atan(q.y,q.x)/(2.*an)+.5);vec2 cc=ry*vec2(cos(2.*an*j),sin(2.*an*j));
  d=min(d,abs(length(q-cc)-ra));q-=cc;R=ra;}
 float ln=1.-smoothstep(lw-.6,lw+.6,d);return vec4(vec3(1.-ln),1.);`,
  'G\'MIC samj Harmonograph: x = A1 sin(f1 t + p1) e^(-d1 t) + A2 sin(f2 t + p2) e^(-d2 t), y likewise with A3, A4 (defaults 150/200/200/100 px, f 4/6/2/2, phases 15/270/75/60 used as radians as in the source, damping .04/.04/.05/.06, dt .04, pen (192,128,64) drawn over the image; Variant > 0 = other frequency sets); Pintograph (samj): the same undamped with near-equal frequencies 4 / 4.05 / 4.16 / 4.32 (beat patterns); Chryzodes (chryzode.org, samj examples): N points on a circle, chord from k to k*m mod N (79/3, 431/7, 353/3, 619/4, 691/12, 613/20, 358/13, 118/20, 699/6), orange on black; Tangential Circles (Claude Lion): ring of n circles tangent to the big circle and each other (r = R/(1 + 1/sin(pi/n)) at distance R/(1 + sin(pi/n))), recursed 3 levels (n = 5 + Variant), black stroke on white; lines drawn as exact distance-to-segment (1200 segments)');

f('q25_pythtree','Pythagoras Tree (GMIC samj / Rosetta Code)',[P('Depth',1,14,10,1),P('Angle',20,70,45,1,'deg'),P('Trunk width',3,30,16,.5,'%'),S('Colours',['Brown to green','Red (GMIC default)','Rainbow by depth','Image in squares'])],
  `float a=radians(u_p1);float ca=cos(a),sa=sin(a);int D=int(u_p0+.5);vec2 S_=u_res/u_k;float s0=S_.x*u_p2/100.;vec2 P=PX(uv);
 vec2 q0=(P-vec2(.5*S_.x-.5*s0,.05*S_.y))/s0;float cm=max(ca,sa);float Rb=1.5/(1.-cm)+.3;vec2 apex=vec2(ca*ca,1.+ca*sa);
 vec2 stq[24];int sd[24];stq[0]=q0;sd[0]=0;int sp=1;int hit=-1;vec2 hq=vec2(0.);
 for(int it=0;it<3000;it++){if(sp<=0)break;sp--;vec2 q=stq[sp];int dd=sd[sp];
  if(length(q-vec2(.5))>Rb)continue;
  if(q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.&&dd>hit){hit=dd;hq=q;}
  if(dd<D&&sp<22){vec2 v=q-vec2(0.,1.);stq[sp]=vec2(ca*v.x+sa*v.y,-sa*v.x+ca*v.y)/ca;sd[sp]=dd+1;sp++;
   vec2 w=q-apex;stq[sp]=vec2(sa*w.x-ca*w.y,ca*w.x+sa*w.y)/sa;sd[sp]=dd+1;sp++;}}
 vec3 bg=O(uv).rgb;if(hit<0)return vec4(bg,1.);
 float t=float(hit)/max(float(D),1.);int cm_=int(u_p3+.5);vec3 col;
 if(cm_==0)col=mix(vec3(.42,.26,.13),vec3(.35,.75,.25),t*t);
 else if(cm_==1)col=clamp(vec3(1.,0.,0.)+(hash(vec2(float(hit),floor(hq.x*0.)+3.))-.5)*40./255.,0.,1.)*(.75+.25*t);
 else if(cm_==2)col=hsv2rgb(vec3(t*.8,.8,.95));else col=bg;
 float e=min(min(hq.x,1.-hq.x),min(hq.y,1.-hq.y));col*=mix(.55,1.,smoothstep(0.,.06,e));
 return vec4(col,1.);`,
  'Pythagoras tree (G\'MIC samj_Arbre_Pythagore after Rosetta Code): on the top side of each square a right triangle with angle Angle at its left end carries two child squares (sides cos a and sin a); evaluated per pixel by depth-first descent through the inverse child transforms with a self-similar bounding-disc cull (deepest square containing the pixel wins), drawn over the image, trunk at 50 % / 95 % (from top), side = Trunk width % of the image width');

f('q25_nebula','Cosmic Nebula (GMIC) / Nebulous (MadJik)',[S('Texture',['Cosmic Nebula (GMIC)','Nebulous (MadJik / Reptorian)']),P('Scale',.5,5,1.5,.01),P('Stars or disturbance',0,5,1,.01),P('Angle',0,90,45,1,'deg')],
  `int m=int(u_p0+.5);vec2 S_=u_res/u_k;
 if(m==1){float sd=u_res.x/u_res.y;float sx=sd>1.?1.:1./sd,sy=sd>1.?sd:1.;float f1=u_p1*6.6667;float iml=15.*f1;float ang=-radians(u_p3);
  vec2 xy=vec2(uv.x,1.-uv.y);float ix=((xy.x-.5)*iml)/sx,iy=((xy.y-.5)*iml)/sy;float IX=(ix*cos(ang)-iy*sin(ang))*40.,IY=(ix*sin(ang)+iy*cos(ang))*40.;
  float dl=u_p2*500.*f1;if(dl>0.){float dist=3.14159265/(dl/100.);float dix=(xy.x-.5)*2./sx,diy=(xy.y-.5)*2./sy;float da=-radians(15.);
   float DX=dix*cos(da)-diy*sin(da),DY=dix*sin(da)+diy*cos(da);float fs=sin(((DX+DY)*.5)/dist),fc=cos(((DY-DX)*.5)/dist);IX+=100.*(fs-fc);IY-=100.*(fs+fc);}
  float t=atan(IY,IX);float r=length(vec2(IX,IY))/100.;float ti=sin(t)*cos(r)*3.14159265+r+ang;
  return vec4(.5+.5*vec3(sin(3.14159265+ti),sin(1.5707963+ti),sin(ti)),1.);}
 vec2 XY=(uv-.5)*2.;vec2 q=uv*vec2(asp(),1.)*1.6/u_p1*1.5+u_seed*7.31;
 float dust=pow(clamp(fbm(q*1.1+vec2(3.1,7.7))*1.25-.1,0.,1.),1.5);
 vec3 g1=clamp(fbm(q+vec2(11.,2.))*1.6-.35,0.,1.)*vec3(25.,128.,204.)/255.,g2=clamp(fbm(q*1.2+vec2(-5.,9.))*1.6-.35,0.,1.)*vec3(204.,51.,128.)/255.;
 vec3 core=clamp(fbm(q*.9+vec2(1.7))*1.6-.3,0.,1.)*vec3(255.,230.,178.)/255.*exp(-8.*dot(XY,XY));
 vec3 neb=(g1+g2+core)*dust*exp(-2.5*dot(XY,XY))*1.6;
 vec2 P=PX(uv);float dens=max(u_p2,1e-3);
 float u0=hash(floor(P)+u_seed);float vb=350.*pow(u0,300./dens)/255.;vec3 st=vb>5./255.?vec3(vb)*(.6+.6*vec3(hash(floor(P)+1.3),hash(floor(P)+2.7),hash(floor(P)+4.1)*1.2))*dust:vec3(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cp=floor(P)+vec2(float(i),float(j));float u1=hash(cp*1.17+9.+u_seed);float v1=1000.*pow(u1,2000./dens);if(v1>100.){float dd=dot(P-cp-.5,P-cp-.5);st+=v1/255.*.25*exp(-dd/(2.*1.5*1.5))*vec3(hash(cp+5.),hash(cp+6.),hash(cp+7.))*.4+.0;}}
 float spa=radians(u_p3);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=floor(P/64.)+vec2(float(i),float(j));float hh=hash(cc+u_seed*3.3+.7);if(hh>.18*dens)continue;
  vec2 sp=(cc+.15+.7*vec2(hash(cc+1.9),hash(cc+8.3)))*64.;vec2 dv=P-sp;float br=.6+.9*hash(cc+4.4);float sl=18.+30.*hash(cc+2.2);
  float v=exp(-dot(dv,dv)/(2.*1.6*1.6))*2.+exp(-length(dv)/4.)*.35;
  for(int k=0;k<2;k++){float aa=spa+float(k)*1.5707963;float tt=dot(dv,vec2(cos(aa),sin(aa))),dd=dot(dv,vec2(-sin(aa),cos(aa)));v+=exp(-dd*dd/.5)*max(0.,1.-abs(tt)/sl)*.9;}
  st+=v*br*vec3(.85+.3*hash(cc+.3),.85+.3*hash(cc+.6),.9+.4*hash(cc+.9));}
 vec3 col=neb+st;col+=max(col-.6,0.)*.4;return vec4(clamp(col,0.,1.),1.);`,
  'Cosmic Nebula (G\'MIC fx_cosmic_nebula, Tschumperle, approx.): plasma-like fbm dust map (pow 1.5) masking two gas layers (25,128,204) / (204,51,128) and a core (255,230,178) x exp(-8 r^2), global fade exp(-2.5 r^2), background stars 350 u^(300/density) under the dust, small foreground stars 1000 u^(2000/density) blurred 1.5, giant stars with 2-orientation diffraction spikes exp(-d^2/.5) max(0, 1 - |t|/size) at Angle, highlight bloom; fbm replaces the plasma fractal, star cells replace the per-pixel random draw. Nebulous (rep_nebulous, after MadJik\'s Paint.NET plugin): exact formula, rotated scaled polar coordinates t, r, ti = sin t cos r k + r + angle, RGB = sin(pi + ti), sin(pi/2 + ti), sin(ti) (x/y factor 10 at Scale 1.5, disturbance 500 x Stars, distortion angle 15)', 1);

f('q25_neoncarpet','Neon Carpet (GMIC Claude Lion)',[P('Sequence number',0,200,0,1),P('Item number',0,100,0,1),S('Invert',['No','Yes']),P('Pixel scale',1,4,1,1)],
  `vec2 S_=floor(u_res/u_k/u_p3);vec2 P=floor(PX(uv)/u_p3);int X=int(P.x),Y=int(S_.y-1.-P.y);int f2=11+2*int(u_p1+.5),f1=f2+int(u_p0+.5);int tg=(f2-1)/2;
 vec3 o=vec3(0.);
 for(int c=0;c<3;c++){float best=13.;
  for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){float dd=length(vec2(float(i),float(j)));if(dd>=best)continue;int xx=X+i,yy=Y+j;
   int v=xx*xx+yy*yy+128*c;v=v-512*(v/512);v=v-f1*(v/f1);v=v-f2*(v/f2);if(v==tg)best=dd;}
  float vv=clamp(mod(best,32.)/31.*255./100.,0.,1.);if(c==0)o.r=vv;else if(c==1)o.g=vv;else o.b=vv;}
 if(u_p2>.5)o=1.-o;return vec4(o,1.);`,
  'Claude Lion cl_neonCarpet: per channel c the integer field ((x^2 + y^2 + 128c) mod 512 mod (f2 + Sequence) mod f2), f2 = 11 + 2 x Item; normalised to 0..256, Euclidean distance to the pixels equal to 128 (the middle value), mod 32, normalised and cut at 100/255; distance searched within 12 px (approx.: the bilateral smoothing and despeckle steps are omitted)');

f('q25_tupper','Tupper Self-Referential Formula (GMIC Reptorian)',[S('K value',['Tupper self-referential formula','Euler identity','Pac-Man','Sick App Bro (Daves)']),S('Style',['Black on white','White on black','Image through the bits']),P('Margin',0,30,6,1,'%'),S('Grid',['Off','On'])],
  `const uint TB[228]=${Q25_TUPA};int ki=int(u_p0+.5);vec2 S_=u_res/u_k;vec2 P=PX(uv);float mg=u_p2/100.;
 float cs=min(S_.x*(1.-2.*mg)/106.,S_.y*(1.-2.*mg)/17.);vec2 o=.5*(S_-cs*vec2(106.,17.));vec2 q=(P-o)/cs;int st=int(u_p1+.5);
 vec3 bg=st==1?vec3(0.):vec3(1.),fg=st==1?vec3(1.):vec3(0.);if(st==2){bg=O(uv).rgb*.2;fg=O(uv).rgb;}
 if(q.x<0.||q.y<0.||q.x>=106.||q.y>=17.)return vec4(bg,1.);
 int xd=int(floor(q.x)),yy=int(floor(q.y));int bi=17*xd+yy;uint wv=TB[ki*57+bi/32];float on=float((wv>>uint(bi-32*(bi/32)))&1u);
 vec3 col=mix(bg,fg,on);if(u_p3>.5){vec2 fq=fract(q);float gl=step(min(min(fq.x,1.-fq.x),min(fq.y,1.-fq.y))*cs,.5);col=mix(col,vec3(.5),gl*.5);}
 return vec4(col,1.);`,
  'Tupper 2001: 1/2 < floor(mod(floor(y/17) 2^(-17 floor(x) - mod(floor(y), 17)), 2)) plotted for 0 <= x < 106, k <= y < k + 17: the bits of k/17 (exact, from the 543-digit k via BigInt) drawn as the 106 x 17 bitmap; k values from the G\'MIC filter (Tupper, Euler identity, Pac-Man, Daves)');

f = add('Edges');
const Q25_AM = dir => `float s=R(u_p1),tt=R(u_p2);bool mc=u_p0>.5;vec2 dv=${dir}*u_px*max(1.,3.*max(s,tt)/24.);float a=0.,b=0.,na=0.,nb=0.;
 for(int i=-24;i<=24;i++){float x=float(i)*max(1.,3.*max(s,tt)/24.);float g=exp(-.5*x*x/(s*s));float k1=mc?exp(-.5*(x+s)*(x+s)/(s*s))-exp(-.5*(x-s)*(x-s)/(s*s)):(x>0.?-g:(x<0.?g:0.));float k2=exp(-.5*x*x/(tt*tt));`;
f('q25_argyle','Argyle / Macleod Edge Operators (Pratt)',[S('Operator',['Argyle','Macleod']),P('Spread s (along gradient)',.5,6,1.5,.1,'px'),P('Spread t (across)',.5,6,1.5,.1,'px'),P('Gain',.5,20,4,.1)],
  [Q25_AM('vec2(1.,0.)') + `float l=luma(O(uv+dv*float(i)).rgb);a+=k1*l;na+=abs(k1);b+=k2*l;nb+=k2;}return vec4(.5+.5*a/max(na,1e-6),b/max(nb,1e-6),0.,1.);`,
   Q25_AM('vec2(0.,1.)') + `vec4 v=T(uv+dv*float(i));a+=k2*(v.r*2.-1.);na+=k2;b+=k1*v.g;nb+=abs(k1);}float gx=a/max(na,1e-6),gy=b/max(nb,1e-6);float mg=sqrt(gx*gx+gy*gy)*u_p3;return vec4(vec3(clamp(mg,0.,1.)),1.);`],
  'Pratt, Digital Image Processing sec. 15.2: large-neighbourhood Gaussian-weighted gradient operators, row impulse responses Argyle H(x,y) = -2 g(x,s) g(y,t) for x >= 0, +2 g(x,s) g(y,t) for x < 0; Macleod H(x,y) = [g(x+s,s) - g(x-s,s)] g(y,t); column responses transposed; separable (2 passes, kernels normalised), magnitude sqrt(Gx^2 + Gy^2) x Gain');

const Q25_ST = it => `float me=T(uv).r;if(me<.5)return vec4(0.,0.,0.,1.);vec2 e=u_px;
 float x1=step(.5,T(uv+vec2(e.x,0.)).r),x2=step(.5,T(uv+e).r),x3=step(.5,T(uv+vec2(0.,e.y)).r),x4=step(.5,T(uv+vec2(-e.x,e.y)).r),x5=step(.5,T(uv-vec2(e.x,0.)).r),x6=step(.5,T(uv-e).r),x7=step(.5,T(uv-vec2(0.,e.y)).r),x8=step(.5,T(uv+vec2(e.x,-e.y)).r);
 bool tm=${it}==0?(x3<.5&&x7>.5):${it}==1?(x5>.5&&x1<.5):${it}==2?(x3>.5&&x7<.5):(x5<.5&&x1>.5);
 float n1=1.-x1,n2=1.-x2,n3=1.-x3,n4=1.-x4,n5=1.-x5,n6=1.-x6,n7=1.-x7,n8=1.-x8;
 float C=(n1-n1*n2*n3)+(n3-n3*n4*n5)+(n5-n5*n6*n7)+(n7-n7*n8*n1);float nb=x1+x2+x3+x4+x5+x6+x7+x8;
 return vec4(tm&&C==1.&&nb!=1.?0.:1.,0.,0.,1.);`;
f('q25_stentiford','Thinning (Stentiford)',[P('Threshold',0,1,.5,.01),S('Lines are',['Dark on light','Light on dark']),S('Display',['Black on white','White on black','Over image'])],
  [`${BINF('u_p0','u_p1<.5?1.:0.')}return vec4(BIN(uv),0.,0.,1.);`,...Array(20).fill(0).flatMap(() => [Q25_ST(0), Q25_ST(1), Q25_ST(2), Q25_ST(3)]),
   `float s=T(uv).r;int d=int(u_p2+.5);if(d==2)return vec4(mix(O(uv).rgb,vec3(1.,.15,.1),s),1.);return vec4(vec3(d==0?1.-s:s),1.);`],
  'Stentiford & Mortimer 1983 (as in Parker, Algorithms for Image Processing): four 3x3 templates (N white / S black, W black / E white, N black / S white, W white / E black) applied in turn; a matching pixel is deleted when its Yokoi 8-connectivity number is 1 and it is not an end point (exactly one neighbour); 20 iterations of the 4 sub-passes');
