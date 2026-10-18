/* ================= q47b: round-18 Filter Forge photo overlays / looks, Fiji plugin ports, Red Giant Universe approx. ================= */
const Q47_SS = `
#define Q47NS(A_,B_,X_) (1.-smoothstep((B_),(A_),(X_)))
`;
/* ---------- Filter Forge photo overlays ---------- */
f = add('Stylize');
f('q47_ffoverlay','Filter Forge Photo Overlays',[S('Overlay',['Bullet Holes','MST3K Silhouettes','Rubiks Cube Panels','Tire Tracks']),P('Amount',0,1,.7,.01),P('Size',.25,4,1,.01,'x'),P('Variation',0,1,0,.01)],
  Q47_SS + `int m=int(u_p0+.5);float A=u_p1,S=u_p2;vec2 sd=vec2(u_p3*71.3,u_p3*13.7);vec3 o=O(uv).rgb;vec3 col=o;vec2 p=PX(uv);
if(m==0){float cs=75.*S;vec2 ci=floor(p/cs);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ci+vec2(float(i),float(j));if(hash(cc+sd)>A*.9+.05)continue;vec2 ce=(cc+.2+.6*hash2(cc+sd+3.))*cs;float rh=cs*.075*(.7+.6*hash(cc+sd+9.));vec2 dv=p-ce;float d=length(dv),dd=d/rh;
  if(dd<1.){col=vec3(.02+.06*dd);}
  else if(dd<7.){float rim=exp(-(dd-1.)*2.5);float shd=dot(dv/d,vec2(-.7071,.7071));col=col*(1.-.45*rim)+vec3(.55)*rim*max(shd,0.);col*=1.-.25*exp(-(dd-1.)*.8);
   float an=atan(dv.y,dv.x);float kk=5.+floor(hash(cc+sd+4.)*5.);float fa=fract(an*kk/6.2832+hash(cc+sd+5.)+.12*vnoise(vec2(d*.08,an*2.)));float ad=abs(fa-.5)*6.2832/kk*d;
   float ln=Q47NS(1.1,.2,ad)*Q47NS(7.,1.5,dd)*step(.3,vnoise(vec2(an*kk,d*.05)+cc));col*=1.-.75*ln;}}}
else if(m==1){float sil=step(uv.y,.05*S);vec2 v=vec2(uv.x*asp(),uv.y)/S;float sw=.16;float kx=mod(v.x,sw)-sw*.5;sil=max(sil,step(length(vec2(kx,max(v.y-.05,0.))),.07));
 v=vec2((uv.x-.5)*asp(),uv.y)/S;sil=max(sil,step(length((v-vec2(0.,.22))/vec2(.05,.065)),1.));sil=max(sil,step(length((v-vec2(0.,.08))/vec2(.13,.09)),1.));
 v=vec2((uv.x-.2)*asp(),uv.y)/S;sil=max(sil,step(length(v-vec2(0.,.2)),.075)*step(.19,v.y));sil=max(sil,step(length((v-vec2(0.,.19))/vec2(.1,.022)),1.));sil=max(sil,step(abs(v.x),.025)*step(v.y,.19));sil=max(sil,step(length((v-vec2(0.,.07))/vec2(.085,.07)),1.));
 v=vec2((uv.x-.8)*asp(),uv.y)/S;sil=max(sil,step(length((v-vec2(0.,.2))/vec2(.05,.058)),1.));sil=max(sil,step(length(v-vec2(-.022,.262)),.016));sil=max(sil,step(length(v-vec2(0.,.274)),.017));sil=max(sil,step(length(v-vec2(.022,.262)),.016));
 sil=max(sil,step(.03,v.x)*step(v.x,.12)*step(abs(v.y-.19),.032*(1.-(v.x-.03)/.09)));sil=max(sil,step(abs(v.x),.012)*step(v.y,.16));sil=max(sil,step(length((v-vec2(0.,.06))/vec2(.07,.07)),1.));
 col=mix(o,vec3(0.),sil*A);}
else if(m==2){float n=max(2.,floor(4./S+.5));vec2 g=vec2(uv.x*asp(),uv.y)*n;vec2 ci=floor(g),fr=fract(g);col=vec3(luma(o))*.95;
 if(hash(ci+sd+1.)<A*.45){vec2 off=floor((hash2(ci+sd+7.)-.5)*2.99+.5);vec2 su=(ci+off+fr)/n;su.x/=asp();vec3 pc=O(clamp(su,0.,1.)).rgb;float bd=min(min(fr.x,1.-fr.x),min(fr.y,1.-fr.y));col=mix(vec3(.04),pc,smoothstep(.0,.03,bd));}}
else{float tw=.13*S;int ty=int(min(u_p3*5.,4.99));vec2 w=vec2((uv.x-.5)*asp(),uv.y);
 for(int s=0;s<2;s++){float cx=s==0?-.2:.2;float ux=(w.x-cx)/tw;if(abs(ux)>.58)continue;float gg[2];
  for(int k=0;k<2;k++){float uy=w.y/tw+float(k)*.05;float g=0.;
   if(ty==0)g=step(.5,fract(uy*2.5+abs(ux)*1.4));else if(ty==1)g=step(.45,fract(uy*2.))*step(.3,abs(fract(ux*2.+.5*mod(floor(uy*2.),2.))-.5)*2.);
   else if(ty==2)g=step(.55,fract(uy*3.));else if(ty==3)g=step(.5,fract(uy*2.+abs(fract(ux*2.)-.5)));else g=step(length(fract(vec2(ux*3.,uy*3.))-.5),.3);gg[k]=g;}
  float inn=step(abs(ux),.5);float rdg=smoothstep(.44,.5,abs(ux))*Q47NS(.58,.5,abs(ux));float sn=.9+.2*vnoise(p*.2);
  col=col*mix(1.,(1.-.3*A)*(1.-.35*A*gg[0])*sn,inn)+A*.22*max(gg[1]-gg[0],0.)*inn+rdg*A*.12;}}
return vec4(clamp(col,0.,1.),1.);`,
  'approx. look re-creations of Filter Forge library filters from their descriptions / previews: Bullet Holes in Picture (Carl: random holes with dark cores, lit dented rims and radial fractures; Amount = density), Mystery Science Theater 3000 (Squideey: black theatre-seat row with Tom Servo, host and Crow silhouettes; Amount = opacity), Rubik\'s Cube (Revelation: desaturated image with full-colour square panels taken from neighbouring positions; Size = panel size), tire tracks (Totte: double tyre imprint with 5 tread types chosen by Variation, pressed into the image); Variation reseeds');

/* ---------- Filter Forge photo looks ---------- */
f('q47_fflook','Filter Forge Photo Looks',[S('Look',['Cave Paintings','Electron Microscope','TV Circuit Bending']),P('Amount',0,1,.8,.01),P('Scale',.25,4,1,.01,'x'),P('Variation',0,1,.55,.01)],
  Q47_SS + `int m=int(u_p0+.5);float A=u_p1,S=u_p2,V=u_p3;vec2 p=PX(uv);vec3 o=O(uv).rgb;float l=luma(o);vec3 col=o;
if(m==0){float rr[3];for(int k=0;k<3;k++){vec2 q=p+(k==1?vec2(1.5,0.):k==2?vec2(0.,1.5):vec2(0.));rr[k]=fbm(q*.012/S)+.5*fbm(q*.05/S);}
 vec3 n=normalize(vec3((rr[0]-rr[1])*30.,(rr[0]-rr[2])*30.,1.));float sh=clamp(dot(n,normalize(vec3(-.5,.6,.7)))*1.25,0.,1.4);vec3 rock=vec3(.66,.47,.3)*(.4+.7*sh)*(.75+.35*rr[0]);
 float lb=blurL(uv,u_k*2.);float ed=smoothstep(.2,.6,length(sobelD(uv,2.*u_k)));vec3 pg=lb<.28?vec3(.13,.09,.07):(o.r>o.b*1.1?vec3(.55,.15,.07):vec3(.72,.44,.15));
 float pa=A*Q47NS(.72,.5,lb)*(.55+.45*fbm(p*.08/S));col=mix(rock,pg*(.55+.55*sh),pa);col*=1.-.55*ed*A;}
else if(m==1){float lb=blurL(uv,u_k*(1.+2.*(1.-A)));vec2 gg=sobelD(uv,1.5*u_k);float gm=length(gg);float dr=dot(gg,vec2(-.7071,.7071));
 float v=.12+.55*lb+.85*gm*A+.35*dr*A;float nz=(hash(floor(p*.8/S))-.5)*.14*V+(hash(vec2(0.,floor(p.y*.8/S)))-.5)*.07*V;col=vec3(clamp(v+nz,0.,1.));}
else{float cs=26.*S;vec2 g=p/cs;vec2 ci=floor(g),fr=fract(g);float hv=hash(ci+11.);float tr=0.;
 if(hv<.4)tr=Q47NS(.1,.05,abs(fr.y-.5));else if(hv<.8)tr=Q47NS(.1,.05,abs(fr.x-.5));float pad=Q47NS(.22,.16,length(fr-.5))*step(.8,hash(ci+3.));
 vec3 board=vec3(.04,.2,.11)*(.7+.4*vnoise(p*.05))+vec3(.78,.66,.35)*max(tr*.8,pad);
 float ds=fbm(p*.007/S+V*10.);float dm=smoothstep(.5,.6,ds+.3*A-.15+.15*(1.-l));
 vec2 bk=floor(p/(vec2(60.,8.)*S));float gl=step(.86,hash(bk+V));vec2 sh=vec2((hash(bk+2.)-.5)*.08,0.)*gl;vec3 gi=vec3(O(uv+sh).r,o.g,O(uv-sh).b);
 float en=pow(1.-abs(2.*fbm(p*.01/S+3.)-1.),10.)+.6*pow(1.-abs(2.*fbm(p*.02/S+8.)-1.),14.);vec3 ec=hsv2rgb(vec3(V,.45,1.));
 col=mix(gi,board,dm);col=screen(col,ec*clamp(en*A*1.4,0.,1.));}
return vec4(clamp(col,0.,1.),1.);`,
  'approx. look re-creations of Filter Forge library filters: Cave Paintings (Betis: dark / reddish / ochre pigments posterised from the image painted onto lit fbm rock, light areas left bare, carved outlines), Electron Microscope (selmo: grey SEM look - edges glow bright (edge effect), directional topographic shading, softness and scan noise via Variation), TV Circuit Bending (Tepearley: image dissolving into a circuit board with glitch-shifted blocks and glowing energy veins, Variation = energy hue)');

/* ---------- Cowify ---------- */
f('q47_cowify','Cowify (Filter Forge)',[S('Color to cowify',['White','Black','Red','Green','Blue','Yellow']),P('Tolerance',0,1,.35,.01),P('Spot size',.25,4,1,.01,'x'),S('Spot color',['Black','Brown','Green','Red'])],
  `int t=int(u_p0+.5),sc=int(u_p3+.5);vec3 tg=t==0?vec3(1.):t==1?vec3(0.):t==2?vec3(1.,0.,0.):t==3?vec3(0.,1.,0.):t==4?vec3(0.,0.,1.):vec3(1.,1.,0.);
vec3 o=O(uv).rgb;vec2 p=PX(uv)/u_p2;float d=length(o-tg)/1.732;float msk=1.-smoothstep(u_p1*.6,u_p1+.001,d);
vec2 wp=p*.022+.7*vec2(fbm(p*.018),fbm(p*.018+5.));float sp=smoothstep(.47,.51,fbm(wp+7.));
vec3 cc=sc==0?vec3(.05):sc==1?vec3(.33,.16,.07):sc==2?vec3(.2,.5,.2):vec3(.45,.05,.05);
return vec4(mix(o,cc*(.75+.35*luma(o)),sp*msk),1.);`,
  'approx. re-creation of Filter Forge Cowify (Malkyne): colours within Tolerance of the chosen colour get warped-noise cow spots of the Spot color (feathered tolerance)');

/* ---------- Playing card ---------- */
f = add('Frames');
f('q47_playingcard','Playing Card (Filter Forge)',[P('Overlap width',0,.5,.12,.01),S('Suit',['Spades','Hearts','Diamonds','Clubs']),P('Side margin',0,.25,.1,.01),P('Corner radius',0,.2,.06,.01)],
  `vec2 hs=vec2(asp(),1.)*.5;vec2 w=(uv-.5)*vec2(asp(),1.);float cr=u_p3;vec2 qd=abs(w)-(hs-cr);float rd=length(max(qd,0.))+min(max(qd.x,qd.y),0.)-cr;vec3 col=vec3(.6);
if(rd<0.){col=vec3(.97);float mg=u_p2;vec2 rh=hs-vec2(mg,mg*.75);vec2 fr=(w+rh)/(2.*rh);float dr=max(abs(w.x)-rh.x,abs(w.y)-rh.y);
 if(dr<0.){vec3 a1=O(fr).rgb,a2=O(1.-fr).rgb;float t=smoothstep(.5-u_p0*.5-.001,.5+u_p0*.5+.001,fr.y);col=mix(a2,a1,t);}
 col=mix(col,vec3(.05),step(abs(dr),.004));int st=int(u_p1+.5);vec3 pc=(st==1||st==2)?vec3(.8,.05,.08):vec3(.04);float ps=max(mg*.3,.012);
 for(int k=0;k<2;k++){float sg=k==0?1.:-1.;vec2 v=(w*sg-vec2(-hs.x+mg*.5,hs.y-mg*.75-ps*1.6))/ps;float ins=0.;
  if(st==2)ins=step(abs(v.x)/.7+abs(v.y),1.);
  else if(st==1){vec2 a=v*1.25+vec2(0.,.2);float q_=a.x*a.x+a.y*a.y-1.;ins=step(q_*q_*q_-a.x*a.x*a.y*a.y*a.y,0.);}
  else if(st==0){vec2 a=vec2(v.x,-(v.y-.15))*1.35;float q_=a.x*a.x+a.y*a.y-1.;ins=step(q_*q_*q_-a.x*a.x*a.y*a.y*a.y,0.);ins=max(ins,step(v.y,-.3)*step(-.95,v.y)*step(abs(v.x),.08+(-.3-v.y)*.45));}
  else{ins=max(max(step(length(v-vec2(0.,.38)),.3),step(length(v-vec2(-.34,-.08)),.3)),step(length(v-vec2(.34,-.08)),.3));ins=max(ins,step(v.y,-.1)*step(-.95,v.y)*step(abs(v.x),.07+(-.1-v.y)*.35));}
  col=mix(col,pc,ins);}}
return vec4(col,1.);`,
  'approx. re-creation of Filter Forge Playing Card (Chris Goldthorpe): the image is merged with its 180-degree rotated copy (top half upright, bottom half upside down, blended over Overlap width) inside a black-framed panel on a white rounded card, with the suit pip in two opposite corners; rank letters and the shift / scale controls are not reproduced');

/* ---------- Fiji: Adelson's squares ---------- */
f = add('Render');
f('q47_adelson',"Adelson's Checker-Shadow Squares (Fiji)",[S('Markers',['Diamonds','None']),P('Zoom',.5,2,1,.01,'x')],
  `float S_=max(600.,700./asp())/u_p1;vec2 P_=vec2(350.+(uv.x-.5)*asp()*S_,300.-(uv.y-.5)*S_);float X=P_.x,Y=P_.y;
float fi=(60.*X+46.6667*(Y-420.))/6720.,fj=(24.*X-93.3333*(Y-420.))/6720.;float v=255.;
if(fi>=0.&&fi<5.&&fj>=0.&&fj<5.){float ii=floor(fi),jj=floor(fj);
 if(mod(ii+jj,2.)>.5)v=125.;if(ii==jj&&ii>=1.&&ii<=3.)v=125.;if((ii==0.||ii==4.)&&mod(jj,2.)<.5)v=200.;if((jj==0.||jj==4.)&&mod(ii,2.)<.5)v=200.;if(ii==4.&&jj==4.)v=227.;
 for(int k=0;k<10;k++){vec2 tc=k==0?vec2(0.,2.):k==1?vec2(1.,3.):k==2?vec2(0.,1.):k==3?vec2(1.,2.):k==4?vec2(2.,3.):k==5?vec2(2.,0.):k==6?vec2(3.,1.):k==7?vec2(1.,0.):k==8?vec2(2.,1.):vec2(3.,2.);
  vec2 of=k==0?vec2(0.,-1.):k==1?vec2(1.,0.):k==5?vec2(-1.,0.):k==6?vec2(0.,1.):(k==2||k==7)?vec2(-1.,-1.):(k==3||k==8)?vec2(0.):vec2(1.,1.);
  if(ii==tc.x&&jj==tc.y){vec2 A_=k<5?vec2(186.6667,180.):vec2(373.3333,516.);vec2 B_=vec2(280.,348.);vec2 Q_=P_-vec2(93.3333*of.x+46.6667*of.y,24.*of.x-60.*of.y);
   v=200.-150.*clamp(dot(Q_-A_,B_-A_)/dot(B_-A_,B_-A_),0.,1.);}}
 if(u_p0<.5){vec2 dl=vec2(fi,fj)-floor(vec2(fi,fj))-.5;if(((ii==1.&&jj==4.)||(ii==2.&&jj==2.))&&abs(dl.x)*6.+abs(dl.y)*4.<1.)v=50.;}}
else if(fj<=0.&&fj>=-.83333&&X>=0.&&X<466.6667){v=mod(floor(X/93.3333),2.)<.5?125.:50.;}
else if(fi>=5.&&fi<=5.41667&&X>=466.6667&&X<700.){v=mod(floor((X-466.6667)/46.6667),2.)<.5?248.:200.;}
float cx1=443.3333,cx2=630.,cy1=246.,cy2=336.,ry=45.,cxm=(cx1+cx2)*.5,rx=(cx2-cx1)*.5;
if((X>=cx1&&X<cx2&&Y>=91.&&Y<291.)||length(vec2((X-cxm)/rx,(Y-291.)/ry))<1.)v=50.+205.*clamp((X-cx1)/(cx2-cx1),0.,1.);
if(length(vec2((X-cxm)/rx,(Y-91.)/ry))<1.)v=125.;
return vec4(vec3(floor(v)/255.),1.);`,
  'Fiji File > Open Samples > Adelson\'s Squares (Adelsons_Squares.ijm) ported shape by shape on its 700 x 600 canvas (fit to the output, white surround): 5 x 5 checkerboard in oblique projection (grey 50 / 125 / 200 / 227), front and side faces, the four linear-gradient shadow diagonals (copied square patches of a 200 -> 50 gradient) and the horizontally shaded cylinder; the two diamond-marked squares are both grey 125');

/* ---------- Fiji: quiver plot ---------- */
f = add('Analysis');
f('q47_quiver','Quiver Plot (Fiji)',[S('Vector source',['Luma gradient','R angle G magnitude','Hue angle Value magnitude']),P('Grid cells',8,80,32,1),P('Length',.2,2,1,.01,'x'),S('Background',['White','Dimmed image'])],
  `
#define Q47V(Q_) (md==0?vec2(luma(O((Q_)+vec2(hc.x,0.)).rgb)-luma(O((Q_)-vec2(hc.x,0.)).rgb),luma(O((Q_)+vec2(0.,hc.y)).rgb)-luma(O((Q_)-vec2(0.,hc.y)).rgb)):md==1?O(Q_).g*vec2(cos(O(Q_).r*6.2832),sin(O(Q_).r*6.2832)):rgb2hsv(O(Q_).rgb).z*vec2(cos(rgb2hsv(O(Q_).rgb).x*6.2832),sin(rgb2hsv(O(Q_).rgb).x*6.2832)))
int md=int(u_p0+.5);vec2 rp=u_res/u_k;float cs=min(rp.x,rp.y)/floor(u_p1);vec2 hc=.5*cs/rp;float mx=1e-6;
for(int j=0;j<10;j++)for(int i=0;i<10;i++){vec2 qq=(vec2(float(i),float(j))+.5)/10.;mx=max(mx,length(Q47V(qq)));}
vec2 p=PX(uv);vec2 ci=floor(p/cs);float dmin=1e9;float hw=max(.55,cs*.03);
for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 c0=(ci+vec2(float(i),float(j))+.5)*cs;vec2 cu=c0/rp;if(cu.x>1.||cu.y>1.||cu.x<0.||cu.y<0.)continue;vec2 vv=Q47V(cu)/mx*cs*u_p2;float ln=length(vv);if(ln<.5)continue;
 vec2 e0=c0+vv;vec2 pa=p-c0;float h_=clamp(dot(pa,vv)/(ln*ln),0.,1.);dmin=min(dmin,length(pa-vv*h_));vec2 dn=vv/ln;float al=min(ln*.3,cs*.35);
 for(int s=0;s<2;s++){vec2 bd=rot(-dn,s==0?.45:-.45)*al;vec2 pb=p-e0;float hb=clamp(dot(pb,bd)/dot(bd,bd),0.,1.);dmin=min(dmin,length(pb-bd*hb));}}
vec3 bg=u_p3<.5?vec3(1.):mix(O(uv).rgb,vec3(1.),.6);return vec4(mix(vec3(0.),bg,smoothstep(hw-.5,hw+.5,dmin)),1.);`,
  'Fiji Quiver Plot (llamero, UCB Vision Sciences): every grid cell becomes a vector arrow from its centre, x = m cos(angle), y = m sin(angle) (plot y up), with m scaled by the largest magnitude so the longest arrow spans one cell (x Length); the plugin reads an angle image (degrees) and a magnitude image, here taken from one image: the luma gradient, R = angle (0..1 = 0..360 deg) with G = magnitude, or hue = angle with value = magnitude; max taken on a 10 x 10 sample grid');

/* ---------- Fiji: replace red with magenta ---------- */
f = add('Color');
f('q47_redmagenta','Replace Red with Magenta (Fiji)',[P('Mix',0,1,1,.01)],
  `vec3 o=O(uv).rgb;return vec4(mix(o,vec3(o.r,o.g,o.r),u_p0),1.);`,
  'Fiji Convert_Red_To_Magenta (dscho): blue := red for every pixel (blue is discarded), turning a red/green merge into magenta/green for red-green colour-blind viewers');

/* ---------- Fiji: Shepp-Logan phantom ---------- */
f = add('Render');
f('q47_shepplogan','Shepp-Logan Phantom (Fiji BIG-EPFL)',[S('Typo correction',['Off (default)','On']),S('Display range',['0 to 2 (full)','1.0 to 1.04 (soft tissue)']),P('Zoom',.5,2,1,.01,'x')],
  `vec2 w=(uv-.5)*vec2(asp(),1.)/min(asp(),1.)*2./u_p2;
float E[60]=float[60](0.,0.,.69,.92,0.,2.,0.,-.0184,.6624,.874,0.,-.98,.22,0.,.11,.31,-18.,-.02,-.22,0.,.16,.41,18.,-.02,0.,.35,.21,.25,0.,.01,0.,.1,.046,.046,0.,.01,0.,-.1,.046,.046,0.,.01,-.08,-.605,.046,.023,0.,.01,0.,-.605,.023,.023,0.,.01,.06,-.605,.023,.046,0.,.01);
float v=0.;for(int i=0;i<10;i++){float xc=E[i*6],yc=E[i*6+1],A=E[i*6+2],B=E[i*6+3],t=radians(E[i*6+4]),g=E[i*6+5];if(i==6&&u_p0>.5)g=.02;
 float cs=cos(t),sn=sin(t);float uu=w.x-xc,vv=w.y-yc;float e11=A*A*sn*sn+B*B*cs*cs,e12=(B*B-A*A)*sin(2.*t),e22=A*A*cs*cs+B*B*sn*sn;
 if(e11*uu*uu+e12*uu*vv+e22*vv*vv<A*A*B*B)v+=g;}
return vec4(vec3(clamp(u_p1<.5?v/2.:(v-1.)/.04,0.,1.)),1.);`,
  'Fiji BIG-EPFL SheppLogan_ (Thevenaz; Shepp & Logan 1974): the 10 ellipses of the original table summed per pixel with the plugin\'s quadratic-form test (centres, semi-axes, angles, grey levels 2, -0.98, -0.02, 0.01 ...), image square fit to the shorter side; "Do correct for typo" sets ellipse 7 to 0.02; float result shown windowed 0..2 or 1.0..1.04');

/* ---------- Red Giant Universe: Prism Displacement ---------- */
f = add('Distort');
f('q47_prismdisp','Prism Displacement (Red Giant Universe)',[P('Glass refraction',0,10,3,.1),P('Colour split',0,1,.35,.01),P('Soften map',0,30,6,.5,'px'),P('Lighting',0,1,.3,.01)],
  [BH('u_p2'),BV('u_p2'),`float d=2.;vec2 e=u_px*R(d);float m=luma(T(uv).rgb);vec2 g=vec2(luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb),luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb))/(2.*d);
 vec2 of=u_p0*(g*60.+(m-.5)*vec2(2.,-2.))*u_k*u_px;vec3 col=vec3(O(uv+of*(1.-.7*u_p1)).r,O(uv+of).g,O(uv+of*(1.+.7*u_p1)).b);
 vec3 n=normalize(vec3(-g*40.,1.));vec3 L_=normalize(vec3(-.5,.5,.7));col+=u_p3*(dot(n,L_)-L_.z)*1.8+u_p3*.6*pow(max(dot(n,normalize(L_+vec3(0.,0.,1.))),0.),40.)*step(.02,length(g*40.));return vec4(clamp(col,0.,1.),1.);`],
  'approx. after the Maxon help page for Universe Prism Displacement with Displacement Source = None (the layer\'s own luminance map, softened, 50 % grey neutral): pixels are refracted along the map slope (glass refraction) plus a small luminance shift, red / green / blue displaced by different amounts (colour split) for the prismatic oily look, and lit from the map normal');

/* ---------- Red Giant Universe: Quantum ---------- */
f = add('Render');
f('q47_quantum','Quantum Light Trails (Red Giant Universe)',[P('Threshold',0,1,.55,.01),P('Streak length',-1,1,.6,.01),P('Shimmer',0,1,.5,.01),P('Boost light',0,4,1.5,.01)],
  [`vec3 o=O(uv).rgb;float m=smoothstep(u_p0-.1,u_p0+.1,luma(o));return vec4(o*m,m);`,
   `vec2 P_=vec2(.5);float acc=0.;vec2 d=(P_-uv)*u_p1;for(int i=0;i<48;i++){float t=float(i)/47.;acc+=T(uv+d*t).a*(1.-t*.7);}acc/=48.*.65;
   vec2 rv=(uv-P_)*vec2(asp(),1.);float an=atan(rv.y,rv.x);float shm=fbm(vec2(cos(an),sin(an))*5.+vec2(length(rv)*.6,3.));
   float I=acc*u_p3*mix(1.,shm*2.,u_p2);vec3 cm=stops5(vec3(0.),vec3(.18,.05,.55),vec3(.55,.2,.95),vec3(.6,.75,1.),vec3(1.),clamp(I,0.,1.));
   vec3 o=O(uv).rgb;return vec4(screen(o,cm*min(I*1.5,1.)),1.);`],
  'approx. single-frame version of Universe Quantum (Maxon help): pixels above Threshold (luminance input channel, soft) cast streaks toward the centre Position (negative Streak length = away from it), an angular fractal shimmer breaks the streaks into rays, intensity is coloured through a shadows / midtones / highlights violet-blue map and screened over the source; animation, mask and post-glow sections omitted');
