/* ================= textures: Substance-Designer-style texture nodes (noises, materials, warps, normal blends, histogram nodes, masks) ================= */
// integer hash on rounded lattice coords (the float hash() seams on some GPUs), value noise, fbm, gradient (Perlin-style) noise with quintic fade + a rotating-gradient variant for flow noise (Perlin & Neyret 2001)
const TX_NZ = `
#define TXU(fv) uint(int(floor((fv)+.5))+65536)
#define TXIH(a,b) (1103515245u*(((a)>>1u)^(b)))
#define TXIHF(ux,uy) (float((1103515245u*((TXIH(ux,uy))^(TXIH(uy,ux)>>3u)))>>8u)/16777216.)
#define TXH(ci) TXIHF(TXU((ci).x)+uint(abs(u_seed)*977.),TXU((ci).y))
#define TXH2(ci) vec2(TXH(ci),TXH((ci)+vec2(9137.,5531.)))
#define TXS(q) ((q)*(q)*(3.-2.*(q)))
#define TXVN(q) mix(mix(TXH(floor(q)),TXH(floor(q)+vec2(1.,0.)),TXS(fract(q)).x),mix(TXH(floor(q)+vec2(0.,1.)),TXH(floor(q)+vec2(1.,1.)),TXS(fract(q)).x),TXS(fract(q)).y)
#define TXFBM(q) (.5*TXVN(q)+.25*TXVN((q)*2.03+vec2(17.,3.))+.125*TXVN((q)*4.12+vec2(5.,29.))+.0625*TXVN((q)*8.36+vec2(41.,11.))+.03125*TXVN((q)*16.97+vec2(7.,53.)))
#define TXQ(q) ((q)*(q)*(q)*((q)*((q)*6.-15.)+10.))
#define TXGR(ci,fq) dot(TXH2(ci)*2.-1.,fq)
#define TXGN(q) mix(mix(TXGR(floor(q),fract(q)),TXGR(floor(q)+vec2(1.,0.),fract(q)-vec2(1.,0.)),TXQ(fract(q)).x),mix(TXGR(floor(q)+vec2(0.,1.),fract(q)-vec2(0.,1.)),TXGR(floor(q)+vec2(1.,1.),fract(q)-vec2(1.,1.)),TXQ(fract(q)).x),TXQ(fract(q)).y)
#define TXFR(ci,fq,an) dot(rot(TXH2(ci)*2.-1.,(an)*(TXH((ci)+vec2(7.,3.))*2.-1.)),fq)
#define TXFN(q,an) mix(mix(TXFR(floor(q),fract(q),an),TXFR(floor(q)+vec2(1.,0.),fract(q)-vec2(1.,0.),an),TXQ(fract(q)).x),mix(TXFR(floor(q)+vec2(0.,1.),fract(q)-vec2(0.,1.),an),TXFR(floor(q)+vec2(1.,1.),fract(q)-vec2(1.,1.),an),TXQ(fract(q)).x),TXQ(fract(q)).y)
`;

f = add('Render');
f('procnoise2','Procedural Noise II',[S('Type',['Anisotropic noise','Gaussian spots','Worley F1','Worley F2 − F1','Billow noise','Gabor noise','Wavelet noise','Domain warping','Curl noise','Flow noise','Crystal noise','Voronoi fractal','Ridged multifractal']),
  P('Scale',8,400,80,1,'px'),P('Variation',0,1,.5,.01),S('Output',['Grayscale','Overlay on image','Multiply image','Displace image'])],
  TX_NZ + `int t=int(u_p0+.5);vec2 p=PX(uv)/u_p1;float v=u_p2;float n=.5;
  if(t==0){float s=0.,a=.5,tot=0.;vec2 q=p*vec2(mix(.5,.06,v),mix(1.2,4.,v));for(int o=0;o<4;o++){s+=a*TXVN(q+float(o)*7.31);tot+=a;q=q*2.+vec2(1.7,3.9);a*=.55;}n=clamp((s/tot-.5)*1.8+.5,0.,1.);}
  else if(t==1){vec2 ip=floor(p);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));for(int k=0;k<4;k++){float fk=float(k);vec2 d=p-cc-TXH2(cc+fk*13.1);float rr=mix(.08,.26,TXH(cc+fk*5.7+.3));float on=step(TXH(cc+fk*3.1+9.),.15+.6*v);s+=on*exp(-dot(d,d)/(2.*rr*rr))*(.4+.6*TXH(cc+fk*1.9+4.));}}n=1.-exp(-s*1.3);}
  else if(t==2||t==3||t==10||t==11){float acc=0.,amp=1.,tot=0.;vec2 q=p;int no=t==11?5:t==10?3:1;
   for(int o=0;o<5;o++){if(o>=no)break;vec2 ip=floor(q);float d1=9.,d2=9.;vec2 bs=vec2(0.),bc=vec2(0.);float jit=(t==2||t==3)?.5+.5*v:1.;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 s=cc+.5+(TXH2(cc)-.5)*jit;float d=length(q-s);if(d<d1){d2=d1;d1=d;bs=s;bc=cc;}else if(d<d2)d2=d;}
    float e=t==3||t==11?clamp((d2-d1)*1.8,0.,1.):t==10?clamp(.5+(TXH(bc+3.7)-.5)*.8+dot(q-bs,TXH2(bc+9.1)*2.-1.)*.9,0.,1.):clamp(d1*1.25,0.,1.);
    acc+=e*amp;tot+=amp;amp*=t==11?mix(.25,.6,v):mix(.3,.65,v);q=q*2.03+vec2(11.7,5.3);}n=acc/tot;}
  else if(t==4){float s=0.,a=.5,tot=0.;vec2 q=p;for(int o=0;o<6;o++){s+=a*abs(TXGN(q))*1.6;tot+=a;q=rot(q,.5)*2.+3.1;a*=mix(.35,.7,v);}n=clamp(s/tot*2.2,0.,1.);}
  else if(t==5){vec2 ip=floor(p);float s=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));for(int k=0;k<6;k++){float fk=float(k);vec2 d=p-cc-TXH2(cc+fk*7.7);float om=(TXH(cc+fk*2.3+1.)-.5)*v*PI;vec2 w=vec2(cos(om),sin(om));float wt=TXH(cc+fk*4.1+2.)<.5?-1.:1.;s+=wt*exp(-8.*dot(d,d))*cos(2.*PI*3.*dot(d,w));}}n=clamp(.5+s*.32,0.,1.);}
  else if(t==6){float s=0.,a=1.,tot=0.;vec2 q=p*2.;for(int o=0;o<4;o++){float fo=float(o)*17.;vec2 mid=ceil(q-.5);vec2 tt=mid-(q-.5);vec2 w0=tt*tt*.5,w2=(1.-tt)*(1.-tt)*.5,w1=1.-w0-w2;float acc=0.;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=mid+vec2(float(i),float(j));float sm=0.;for(int b=-1;b<=1;b++)for(int e=-1;e<=1;e++)sm+=TXH(cc+vec2(float(e),float(b))+fo)*(2.-abs(float(e)))*(2.-abs(float(b)));
     float co=TXH(cc+fo)-sm/16.;float wx=i==-1?w0.x:i==0?w1.x:w2.x;float wy=j==-1?w0.y:j==0?w1.y:w2.y;acc+=co*wx*wy;}
    s+=acc*a;tot+=a*a;a*=mix(.4,.85,v);q=q*2.+vec2(5.3,1.9);}n=clamp(.5+s/sqrt(tot)*2.6,0.,1.);}
  else if(t==7){float st=4.*v;vec2 q1=vec2(TXFBM(p),TXFBM(p+vec2(5.2,1.3)));vec2 r1=vec2(TXFBM(p+st*q1+vec2(1.7,9.2)),TXFBM(p+st*q1+vec2(8.3,2.8)));n=clamp((TXFBM(p+st*r1)-.42)*2.+.5,0.,1.);}
  else if(t==8){float L0=mix(.05,.6,v);float acc=0.;for(int dr=0;dr<2;dr++){vec2 q=p;float sg=dr==0?1.:-1.;for(int k=0;k<12;k++){float e=.01;float ax=TXGN(q+vec2(e,0.))-TXGN(q-vec2(e,0.))+.5*(TXGN(q*2.+vec2(2.*e,0.))-TXGN(q*2.-vec2(2.*e,0.)));float ay=TXGN(q+vec2(0.,e))-TXGN(q-vec2(0.,e))+.5*(TXGN(q*2.+vec2(0.,2.*e))-TXGN(q*2.-vec2(0.,2.*e)));vec2 cu=vec2(ay,-ax);q+=sg*cu/max(length(cu),1e-6)*L0/12.;acc+=TXVN(q*30.);}}n=clamp((acc/24.-.5)*3.+.5,0.,1.);}
  else if(t==9){float s=0.,a=.5,fr=1.;vec2 adv=vec2(0.);for(int o=0;o<5;o++){float an=v*6.2832*sqrt(fr)*1.5;vec2 qq=p*fr+adv+float(o)*vec2(3.1,7.7);float nv=TXFN(qq,an);float e=.02;vec2 g=vec2(TXFN(qq+vec2(e,0.),an)-nv,TXFN(qq+vec2(0.,e),an)-nv)/e;adv-=g*a*.6;s+=nv*a;fr*=2.;a*=.5;}n=clamp(.5+s*1.5,0.,1.);}
  else{float sig=1.-abs(TXGN(p)*2.2);sig*=sig;float res=sig,wsum=1.;vec2 q=p;float fr=1.;float gain=mix(1.5,3.5,v);for(int o=1;o<7;o++){q=rot(q,.6)*2.+vec2(1.3,4.7);fr*=.5;float wgt=clamp(sig*gain,0.,1.);sig=1.-abs(TXGN(q)*2.2);sig*=sig*wgt;res+=sig*fr;wsum+=fr;}n=clamp(res/wsum*1.05,0.,1.);}
  int om=int(u_p3+.5);if(om==0)return vec4(vec3(n),1.);if(om==1)return vec4(overlay(c.rgb,vec3(n)),1.);if(om==2)return vec4(c.rgb*(.3+n),1.);return T(uv+vec2(.7071)*(n-.5)*R(40.)*u_px);`,
  'Lagae 2009 Gabor (sparse convolution), Cook & DeRose 2005 wavelet (approx.: 3×3 binomial refinement filter), Worley 1996, Musgrave ridged multifractal, Quilez domain warping, Bridson curl (LIC view), Perlin & Neyret flow noise',1);

f = add('Materials');
f('matgen','Material Generators',[S('Type',['Wood grain','Brick','Tile','Weave','Scratches','Leather','Fabric weave (twill)','Hexagon pattern']),
  P('Scale',16,400,64,1,'px'),P('Variation',0,1,.5,.01),S('Output',['Colour (albedo)','Height','Normal map (OpenGL)','Overlay on image','Image-tinted material'])],
  TX_NZ + `int t=int(u_p0+.5);int om=int(u_p3+.5);float v=u_p2;float hh[3]=float[3](0.,0.,0.);vec3 alb=vec3(.5);
  for(int si=0;si<3;si++){vec2 p=(PX(uv)+(si==1?vec2(1.,0.):si==2?vec2(0.,1.):vec2(0.)))/u_p1;float h=.5;vec3 col=vec3(.5);
   if(t==0){float pl=floor(p.x/1.6);vec2 q=p+vec2(0.,TXH(vec2(pl,2.))*40.);float wp=TXFBM(vec2(q.x*.7,q.y*.06)+pl*3.1)*(1.+v*3.);float rg=fract((q.x*1.2+wp*1.6+sin(q.y*.05+pl)*.5)*2.2);float late=smoothstep(.55,.95,rg)*smoothstep(1.,.95,rg);float gr=TXVN(vec2(q.x*55.,q.y*1.2));float seam=smoothstep(0.,.025,min(fract(p.x/1.6),1.-fract(p.x/1.6)));
    col=mix(vec3(.74,.5,.29),vec3(.42,.23,.11),late*.85+gr*.15)*(.9+.2*TXH(vec2(pl,5.)))*mix(.35,1.,seam);h=(.85-.25*late-.08*gr)*mix(.2,1.,seam);}
   else if(t==1){vec2 bq=vec2(p.x+mod(floor(p.y/.5),2.)*.5,p.y/.5);vec2 id=floor(bq);vec2 fq=fract(bq);vec2 dd=min(fq,1.-fq)*vec2(1.,.5);float e=min(dd.x,dd.y)+(TXVN(p*14.)-.5)*.012;float mw=.012+.045*v;float bev=smoothstep(mw,mw+.035,e);float gn=TXFBM(p*7.+id*3.);
    col=mix(vec3(.72,.7,.64)*(.85+.2*TXVN(p*30.)),mix(vec3(.5,.2,.13),vec3(.74,.4,.25),TXH(id))*(.8+.35*gn),bev);h=mix(.15+.1*TXVN(p*25.),.75+.2*gn+.05*TXH(id+3.),bev);}
   else if(t==2){vec2 id=floor(p);vec2 fq=fract(p);vec2 dd=min(fq,1.-fq);float e=min(dd.x,dd.y);float gw=.015+.06*v;float bev=smoothstep(gw,gw+.05,e);vec2 tl=(TXH2(id+4.)-.5)*.15;float tint=TXH(id);
    col=mix(vec3(.62,.6,.56)*(.85+.2*TXVN(p*30.)),mix(vec3(.82,.84,.86),vec3(.55,.68,.74),tint*v+tint*.3)*(.93+.1*TXFBM(p*5.)),bev);h=mix(.1,.8+dot(fq-.5,tl)+.04*TXFBM(p*9.),bev);}
   else if(t==3||t==6){bool tw=t==6;vec2 g=p*(tw?8.:4.);vec2 ci=floor(g),fq=fract(g);bool hz=tw?mod(ci.x-ci.y,4.)<2.:mod(ci.x+ci.y,2.)<1.;float gap=tw?.04+.2*v:.08+.35*v;
    float acr=hz?fq.y:fq.x;float alg=hz?fq.x:fq.y;float acr2=hz?fq.x:fq.y;float fib=TXVN(vec2((hz?g.x:g.y)*1.5,(hz?g.y:g.x)*14.));
    float pr=sqrt(max(0.,1.-pow((acr-.5)*2./(1.-gap),2.)));float pr2=sqrt(max(0.,1.-pow((acr2-.5)*2./(1.-gap),2.)));float arc=tw?sin(((hz?mod(ci.x-ci.y,4.):mod(ci.x-ci.y,4.)-2.)+alg)*.5*PI):sin(alg*PI);
    bool top=pr>0.;float hv=top?pr*(.55+.45*arc):pr2*.4;bool isH=top?hz:!hz;
    vec3 ca=tw?vec3(.13,.2,.38):vec3(.78,.7,.55),cb=tw?vec3(.78,.77,.72):vec3(.6,.5,.38);col=(isH?ca:cb)*(.35+.75*hv)*(.85+.3*fib);h=hv*(.9+.1*fib);}
   else if(t==4){float sc=0.;vec2 ip=floor(p);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));for(int k=0;k<4;k++){float fk=float(k);if(TXH(cc+fk*7.3)>.15+.75*v)continue;vec2 a=cc+TXH2(cc+fk*3.1);float an=.5+(TXH(cc+fk*5.3)-.5)*1.4+(TXH(cc+fk*9.7)<.25?1.57:0.);vec2 dv=vec2(cos(an),sin(an));float ln=.25+.7*TXH(cc+fk*2.9);vec2 d=p-a;float tp=clamp(dot(d,dv),-ln,ln);float dist=length(d-dv*tp);float wd=(.004+.01*TXH(cc+fk*6.1))*(1.-abs(tp)/ln*.7);sc=max(sc,(.35+.65*TXH(cc+fk*8.3))*(1.-abs(tp)/ln*.6)*smoothstep(wd,wd*.2,dist));}}
    float bm=TXVN(vec2(p.x*80.,p.y*2.))*.06;col=vec3(.52,.53,.55)*(.9+bm)+sc*.4;h=.8-sc*.6+bm*.3;}
   else if(t==5){vec2 q=p*3.+vec2(TXFBM(p*1.3),TXFBM(p*1.3+7.))*.8;vec2 ip=floor(q);float d1=9.,d2=9.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 s=cc+TXH2(cc);float d=length(q-s);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
    float cr=smoothstep(.0,.08+.15*v,d2-d1);float pore=smoothstep(.72,.8,TXVN(p*48.));float dome=1.-d1*d1*.5;h=(.25+.6*cr*dome)-pore*.12+.05*TXVN(p*20.);col=vec3(.36,.2,.11)*(.55+.7*h)+vec3(.04,.02,.0)*TXFBM(p*4.);}
   else{vec2 rr=vec2(1.,1.7320508);vec2 hq=p*1.5;vec2 a=mod(hq,rr)-rr*.5;vec2 b=mod(hq-rr*.5,rr)-rr*.5;vec2 gv=dot(a,a)<dot(b,b)?a:b;vec2 hid=floor((hq-gv)*2.+.5);float hd=max(dot(abs(gv),vec2(.5,.8660254)),abs(gv.x));float gw=.02+.1*v;float bev=smoothstep(.5-gw,.5-gw-.07,hd);
    col=mix(vec3(.12),mix(vec3(.85,.62,.2),vec3(.95,.8,.35),TXH(hid))*(.9+.15*TXVN(p*12.)),bev);h=bev*(.8+.15*TXH(hid+2.));}
   hh[si]=h;if(si==0)alb=col;if(om!=2)break;}
  if(om==0)return vec4(alb,1.);if(om==1)return vec4(vec3(hh[0]),1.);
  if(om==2){float k=u_p1*.06;return vec4(normalize(vec3(-(hh[1]-hh[0])*k,-(hh[2]-hh[0])*k,1.))*.5+.5,1.);}
  if(om==3)return vec4(overlay(c.rgb,vec3(.2+.6*hh[0])),1.);return vec4(c.rgb*luma(alb)*2.,1.);`,
  'Substance-style generators: running-bond brick, beveled tiles, plain & 2/2 twill weave, segment scratches, Voronoi-crease leather, hex tiles; normal = finite-difference of the height',1);

const TX_DRV = TX_NZ + `if(u_p3<.5)return vec4(L(uv),c.r,c.g,1.);vec2 p=PX(uv)/120.;return vec4(TXFBM(p),TXFBM(p+vec2(5.2,1.3)),TXFBM(p+vec2(8.3,2.8)),1.);`;
f = add('Distort');
f('texwarp','Texture Warps',[S('Type',['Directional warp','Vector warp','Multi-directional warp (4 dirs, average)','Slope blur','Non-uniform blur']),P('Intensity',0,120,24,1,'px'),P('Angle',0,360,0,1,'°'),S('Driver',['Image (luma / RG as vector map)','Noise (fbm, seeded)'])],
  [TX_DRV, BH('2.'), BV('2.'),
  `int t=int(u_p0+.5);float I=R(u_p1);float an=radians(u_p2);vec2 dv=vec2(cos(an),sin(an));vec4 d=T(uv);
  if(t==0)return O(uv+dv*d.r*I*u_px);
  if(t==1)return O(uv+(d.gb*2.-1.)*I*u_px);
  if(t==2){vec4 a=vec4(0.);for(int k=0;k<4;k++)a+=O(uv+rot(dv,float(k)*PI*.5)*d.r*I*u_px);return a*.25;}
  if(t==3){vec2 q=uv;vec4 a=vec4(0.);vec2 e=u_px*R(2.);for(int k=0;k<16;k++){vec2 g=vec2(T(q+vec2(e.x,0.)).r-T(q-vec2(e.x,0.)).r,T(q+vec2(0.,e.y)).r-T(q-vec2(0.,e.y)).r);q-=g/max(length(g),1e-5)*I/16.*u_px*smoothstep(0.,.02,length(g));a+=O(q);}return a/16.;}
  float rr=d.r*I;vec3 a=vec3(0.);for(int i=0;i<48;i++){float fi=float(i);float r2=sqrt((fi+.5)/48.)*rr;float ag=fi*2.39996;a+=O(uv+vec2(cos(ag),sin(ag))*r2*u_px).rgb;}return vec4(a/48.,1.);`],
  'Substance Directional / Vector / Multi-directional Warp, Slope Blur (blur mode, 16 steps down the driver gradient), Non-uniform Blur (radius = driver × intensity; Angle used by the directional types)',1);

f = add('Materials');
f('normblend2','Normal Map Tools II (Blends)',[S('Method',['RNM (reoriented)','UDN','Whiteout','Linear (reference)']),S('Detail',['Procedural bumps','Image detail (high-pass)','Tile bevels']),P('Detail strength',0,3,1,.01),P('Detail scale',2,80,14,1,'px')],
  TX_NZ + `vec3 mn=vec3(0.);for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn+=O((vec2(float(i),float(j))+.5)/8.).rgb;mn/=64.;bool isN=mn.b>.7&&abs(mn.r-.5)<.12&&abs(mn.g-.5)<.12;
  vec3 n1;if(isN)n1=normalize(c.rgb*2.-1.)*.5+.5;else{vec2 g=sobelD(uv,R(2.));n1=normalize(vec3(-g*1.2,1.))*.5+.5;}
  int dm=int(u_p1+.5);vec2 dg;if(dm==0){vec2 q=PX(uv)/u_p3;float e=.05;float h0=TXGN(q)+.5*TXGN(q*2.1+3.);float hx=TXGN(q+vec2(e,0.))+.5*TXGN((q+vec2(e,0.))*2.1+3.);float hy=TXGN(q+vec2(0.,e))+.5*TXGN((q+vec2(0.,e))*2.1+3.);dg=vec2(hx-h0,hy-h0)/e*.6;}
  else if(dm==1){dg=sobelD(uv,R(1.))*1.5;}else{vec2 q=PX(uv)/(u_p3*4.);vec2 fq=fract(q)-.5;vec2 a=abs(fq);float bw=.08;dg=vec2(a.x>a.y&&a.x>.5-bw?sign(fq.x):0.,a.y>=a.x&&a.y>.5-bw?sign(fq.y):0.)*-2.5;}
  vec3 n2=normalize(vec3(-dg*u_p2,1.))*.5+.5;int m=int(u_p0+.5);vec3 r;vec3 a1=n1*2.-1.,b2=n2*2.-1.;
  if(m==0){vec3 tt=n1*vec3(2.,2.,2.)+vec3(-1.,-1.,0.);vec3 uu=n2*vec3(-2.,-2.,2.)+vec3(1.,1.,-1.);r=tt*dot(tt,uu)/tt.z-uu;}
  else if(m==1)r=vec3(a1.xy+b2.xy,a1.z);else if(m==2)r=vec3(a1.xy+b2.xy,a1.z*b2.z);else r=a1+b2;
  return vec4(normalize(r)*.5+.5,1.);`,
  'Barré-Brisebois & Hill 2012 (RNM / UDN / Whiteout). Base = input when it is a normal map (auto-detected, mean ≈ (.5,.5,1)), else normals from its luma',1);

f = add('Tone');
f('histnodes','Histogram Nodes (Scan / Range / Shift)',[S('Node',['Histogram scan','Histogram range','Histogram shift']),P('Position',0,1,.5,.01),P('Contrast / Range',0,1,.4,.01),S('Channels',['Luminance → grayscale','Per RGB channel','Luminance, keep colour'])],
  `int m=int(u_p0+.5);int ch=int(u_p3+.5);float w=max(1.-u_p2,.001);float lo=mix(1.,-w,u_p1);
  #define TXH(xv) (m==0?clamp(((xv)-lo)/w,0.,1.):m==1?(xv)*u_p2+u_p1*(1.-u_p2):fract((xv)+u_p1))
  if(ch==1)return vec4(TXH(c.r),TXH(c.g),TXH(c.b),1.);float l=luma(c.rgb);float o=TXH(l);if(ch==0)return vec4(vec3(o),1.);return vec4(c.rgb*o/max(l,.004),1.);`,
  'Substance definitions: Scan = levels window of width 1−contrast slid by position; Range = compress toward position; Shift = wrap-around offset');

f = add('Materials');
f('matmasks','Material Masks (Dirt / Rust / Moss / Height Blend)',[S('Type',['Dirt mask','Rust mask','Moss mask','Height blend (sand layer)']),P('Coverage',0,1,.5,.01),P('Grunge scale',10,300,60,1,'px'),S('Output',['Over image','Mask'])],
  TX_NZ + `int t=int(u_p0+.5);float h=L(uv);float m1=blurL(uv,R(2.5)),m2=blurL(uv,R(7.));float cav=clamp((m1-h)*7.+(m2-h)*3.,0.,1.);float edg=clamp((h-m1)*9.+(h-m2)*2.,0.,1.);vec2 sg=sobelD(uv,R(3.));float up=clamp(-sg.y*1.5,0.,1.);
  vec2 p=PX(uv)/u_p2;vec2 wq=p+vec2(TXFBM(p*.7),TXFBM(p*.7+4.1))*1.5;float gr=TXFBM(wq);float fine=TXFBM(p*6.);float cv=u_p1;float msk;vec3 col;
  if(t==0){float sc=cav*.9+gr*.6+fine*.15+(1.-uv.y)*.15;msk=smoothstep(1.05-cv*.9,1.25-cv*.9,sc);col=c.rgb*mix(vec3(1.),vec3(.42,.35,.27),msk*.9);}
  else if(t==1){float spl=smoothstep(.45,.65,gr);float sc=spl*.75+edg*.45+cav*.35+fine*.2;msk=smoothstep(1.-cv*.8,1.12-cv*.8,sc);vec3 rc=mix(vec3(.38,.13,.05),vec3(.75,.38,.13),smoothstep(.3,.7,TXFBM(p*9.)))*(.75+.4*luma(c.rgb));col=mix(c.rgb,rc*(1.-.3*step(.8,TXVN(p*40.))),msk);}
  else if(t==2){float cl=smoothstep(.4,.7,gr);float sc=cav*.55+up*.5+cl*.6+fine*.15;msk=smoothstep(1.-cv*.85,1.15-cv*.85,sc);vec3 mc=mix(vec3(.14,.24,.06),vec3(.4,.52,.14),TXFBM(p*10.))*(.8+.4*TXVN(p*35.));col=mix(c.rgb,mc,msk);}
  else{float ht=gr*.7+fine*.3;msk=clamp((ht+(cv-.6)*1.2-h)*8.+.5,0.,1.);col=mix(c.rgb,vec3(.78,.69,.52)*(.7+.5*ht)*(.92+.15*TXVN(p*50.)),msk);}
  return u_p3>.5?vec4(vec3(msk),1.):vec4(col,1.);`,
  'luma = height: cavity (blur − height), convex edges, up-facing slope + seeded warped-fbm grunge; Height Blend = Substance height-offset blend of a procedural layer',1);
f('colortomask','Color to Mask',[P('Pick X',0,1,.5,.01),P('Pick Y',0,1,.5,.01),P('Range',0,1,.15,.01),P('Softness',0,1,.1,.01)],
  `vec3 k=O(vec2(u_p0,1.-u_p1)).rgb;float d=length(c.rgb-k)/1.7320508;return vec4(vec3(1.-smoothstep(u_p2,u_p2+u_p3+.001,d)),1.);`,
  'Substance Color to Mask; key colour sampled at (Pick X, Pick Y from top), RGB distance');
f('embossgloss','Emboss with Gloss',[P('Intensity',0,20,6,.1),P('Light angle',0,360,135,1,'°'),P('Gloss',0,1,.5,.01),S('Output',['Over image','Gray relief'])],
  `vec2 g=sobelD(uv,R(1.5));vec3 n=normalize(vec3(-g*u_p0*.25,1.));float an=radians(u_p1);vec3 Ld=normalize(vec3(cos(an),sin(an),.9));float e=dot(n,Ld)-Ld.z;vec3 H=normalize(Ld+vec3(0.,0.,1.));float k=mix(6.,90.,u_p2);float sp=max(pow(max(dot(n,H),0.),k)-pow(H.z,k),0.)*u_p2*2.5;
  if(u_p3>.5)return vec4(vec3(.5+e*.6+sp),1.);return vec4(c.rgb*(1.+e*1.3)+sp*vec3(1.,.97,.9),1.);`,
  'Substance Emboss with Gloss: relief from luma-height normals (Lambert offset from flat) + Blinn-Phong gloss highlight');

f = add('Stylize');
f('shapeglow','Shape Glow',[P('Size',2,80,18,1,'px'),P('Intensity',0,3,.8,.01),S('Mode',['Outer','Inner','Both']),S('Output',['Grayscale (shape + glow)','Glow on image'])],
  [`vec3 mn_=vec3(0.);for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn_+=O((vec2(float(i),float(j))+.5)/8.).rgb;bool inv_=luma(mn_/64.)>.5;float m=step(.5,L(uv));return vec4(vec3(inv_?1.-m:m),1.);`, BH('u_p0'), BV('u_p0'),
  `vec3 mn_=vec3(0.);for(int j=0;j<8;j++)for(int i=0;i<8;i++)mn_+=O((vec2(float(i),float(j))+.5)/8.).rgb;bool inv_=luma(mn_/64.)>.5;float b=T(uv).r;float m=step(.5,luma(O(uv).rgb));if(inv_)m=1.-m;int md=int(u_p2+.5);float go=clamp(b*2.*u_p1,0.,1.)*(1.-m);float gi=clamp((1.-b)*2.*u_p1,0.,1.)*m;float g=md==0?go:md==1?gi:max(go,gi);
  if(u_p3<.5)return vec4(vec3(md==1?gi:max(m*(md==0?1.:1.-gi*.6),g)),1.);return vec4(screen(O(uv).rgb,vec3(1.,.82,.5)*g),1.);`],
  'Substance Shape Glow, soft mode (Gaussian falloff of the shape = luma>0.5, or the dark side when the image is mostly bright); precise distance mode approx. by the same falloff');
