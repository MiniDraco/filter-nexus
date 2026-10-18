/* ================= Round 9D: tone-mapping operators II, colour spaces II, colour utilities ================= */
f = add('Tone');
// operators needing an adaptation luminance use a heavily blurred log-luminance (local adaptation, not a global average)
f('tonemap2','Tone Mapping Operators II',[S('Operator',['Logarithmic','Schlick rational','Tumblin-Rushmeier','Reinhard-Devlin photoreceptor','Ashikhmin','Ferwerda visibility','Pattanaik / Naka-Rushton','Khronos PBR Neutral','Unreal filmic']),P('Exposure',-4,4,0,.05,'EV'),P('Adaptation radius',10,300,80,1,'px'),P('Operator parameter',0,1,.5,.01)],
  [`vec3 l=${LIN('O(uv).rgb')}*exp2(u_p1);return vec4(vec3(log(max(luma(l),1e-4))),1.);`,BH('u_p2'),BV('u_p2'),
   `int m=int(u_p0+.5);vec3 x=${LIN('O(uv).rgb')}*exp2(u_p1);float L=max(luma(x),1e-5);float La=exp(T(uv).r);float k=u_p3;vec3 y;float Ld;
   if(m==0){float Lmax=4.;Ld=log(1.+L*(1.+k*20.))/log(1.+Lmax*(1.+k*20.));y=x*Ld/L;}
   else if(m==1){float p=1.+k*80.;float Lmax=4.;Ld=p*L/(p*L-L+Lmax);y=x*Ld/L;}
   else if(m==2){float Lw=L*100.,Lwa=La*100.,Lda=50.;float gw=Lwa>100.?2.655:1.855+.4*log(Lwa+2.3e-5)/log(10.);float gd=1.855+.4*log(Lda)/log(10.);float mm=pow(10.,(gw/gd-1.));Ld=clamp(mm*Lda*pow(Lw/Lwa,gw/gd)/100.,0.,4.);y=x*Ld/L;}
   else if(m==3){float f_=exp(-(k-.5)*4.);float mr=.6;vec3 Ia=mix(x,vec3(La),.5);y=x/(x+pow(f_*Ia,vec3(mr)));}
   else if(m==4){
    #define CA(Q) ((Q)<.0034?(Q)/.0014:(Q)<1.?2.4483+log((Q)/.0034)/log(10.)/.4027:(Q)<7.2444?16.563+((Q)-1.)/.4027:32.0693+log((Q)/7.2444)/log(10.)/.0556)
    float sc=10.+k*90.;float a=CA(La*sc),lo=CA(.01),hi=CA(4.*sc);Ld=clamp((a-lo)/(hi-lo),0.,1.)*(L/La);y=x*Ld/L;}
   else if(m==5){float Lwa=La*(1.+k*200.);float lg=log(Lwa)/log(10.);float tp=lg<=-2.6?-.72:lg>=1.9?lg-1.255:pow(.249*lg+.65,2.7)-.72;float ts=lg<=-3.94?-2.86:lg>=-1.44?lg-.395:pow(.405*lg+1.6,2.18)-2.86;
    float lda=log(50.)/log(10.);float tpd=lda>=1.9?lda-1.255:pow(.249*lda+.65,2.7)-.72;float tsd=lda>=-1.44?lda-.395:pow(.405*lda+1.6,2.18)-2.86;float mp=pow(10.,tpd-tp),ms=pow(10.,tsd-ts);
    float Ls=dot(x,vec3(.062,.608,.33))*(1.+k*200.);y=clamp((mp*x*(1.+k*200.)+ms*Ls*vec3(.85,.9,1.1))/50.*.5,0.,1.);}
   else if(m==6){float n=.73;float sg=pow(La,.69)*(.5+k);y=pow(x,vec3(n))/(pow(x,vec3(n))+vec3(pow(sg,n)));y*=1.15;}
   else if(m==7){vec3 cl=x;float mn=min(cl.r,min(cl.g,cl.b));float off=mn<.08?mn-6.25*mn*mn:.04;cl-=off;float pk=max(cl.r,max(cl.g,cl.b));float sc=.76;
    if(pk<sc)y=cl;else{float d=1.-sc;float np=1.-d*d/(pk+d-sc);cl*=np/pk;float g=1.-1./(.15*(pk-np)+1.);y=mix(cl,vec3(np),g);}}
   else{float sl=.88,toe=.55,sh=.26,bc=0.,wc=.04;float ts=1.+bc-toe,ss=1.+wc-sh;float bt=(.18+bc)/ts-1.;float tm=log(.18)/log(10.)-.5*log((1.+bt)/(1.-bt))*(ts/sl);float sm=(1.-toe)/sl-tm;float shm=sh/sl-sm;
    vec3 lc=log(max(x,vec3(1e-6)))/log(10.);vec3 st=sl*(lc+sm);vec3 tc=-bc+(2.*ts)/(1.+exp((-2.*sl/ts)*(lc-tm)));vec3 sc2=(1.+wc)-(2.*ss)/(1.+exp((2.*sl/ss)*(lc-shm)));
    tc=mix(st,tc,step(lc,vec3(tm)));sc2=mix(st,sc2,step(vec3(shm),lc));vec3 t=clamp((lc-tm)/(shm-tm),0.,1.);t=(3.-2.*t)*t*t;y=mix(tc,sc2,t);}
   y=clamp(y,0.,1.);return vec4(${SRGB('y')},1.);`],'Drago-style log, Schlick 1994, Tumblin-Rushmeier 1999, Reinhard-Devlin 2005, Ashikhmin 2002, Ferwerda 1996, Naka-Rushton, Khronos PBR Neutral, UE4 filmic');
f = add('Color');
f('colorspace2','Color Space Channel II',[S('Space',['Oklab','Oklch','CIELUV','Hunter Lab','YIQ','YCoCg','IPT','ICtCp','Jzazbz','HSI','rg chromaticity','c1c2c3 (Gevers)','l1l2l3 (Gevers)','Opponent (O1 O2 O3)','CMYK']),S('Channel',['Channel 1','Channel 2','Channel 3','Channel 4 (K)','All three as RGB'])],
  `int m=int(u_p0+.5);vec3 s=c.rgb;vec3 l=${LIN('s')};vec3 X=vec3(dot(vec3(.4124564,.3575761,.1804375),l),dot(vec3(.2126729,.7151522,.072175),l),dot(vec3(.0193339,.119192,.9503041),l));vec3 v;float k4=0.;
  if(m<=1){vec3 lms=vec3(dot(vec3(.4122214708,.5363325363,.0514459929),l),dot(vec3(.2119034982,.6806995451,.1073969566),l),dot(vec3(.0883024619,.2817188376,.6299787005),l));lms=pow(max(lms,vec3(0.)),vec3(1./3.));
   vec3 lab=vec3(dot(vec3(.2104542553,.793617785,-.0040720468),lms),dot(vec3(1.9779984951,-2.428592205,.4505937099),lms),dot(vec3(.0259040371,.7827717662,-.808675766),lms));
   v=m==0?vec3(lab.x,.5+lab.y*1.25,.5+lab.z*1.25):vec3(lab.x,length(lab.yz)/.37,atan(lab.z,lab.y)/6.2832+.5);}
  else if(m==2){float dn=X.x+15.*X.y+3.*X.z+1e-6;float up=4.*X.x/dn,vp=9.*X.y/dn;float Ls=X.y>.008856?116.*pow(X.y,1./3.)-16.:903.3*X.y;v=vec3(Ls/100.,.5+13.*Ls*(up-.1978)/200.,.5+13.*Ls*(vp-.4683)/200.);}
  else if(m==3){float sy=sqrt(max(X.y,1e-6));v=vec3(sy,.5+172.3*(X.x/.95047-X.y)/sy/200.,.5+67.2*(X.y-X.z/1.08883)/sy/200.);}
  else if(m==4)v=vec3(dot(s,vec3(.299,.587,.114)),.5+dot(s,vec3(.596,-.274,-.322))*.84,.5+dot(s,vec3(.211,-.523,.312))*.95);
  else if(m==5)v=vec3(dot(s,vec3(.25,.5,.25)),.5+(s.r-s.b)*.5,.5+dot(s,vec3(-.25,.5,-.25)));
  else if(m==6){vec3 lm=vec3(dot(vec3(.4002,.7075,-.0807),X),dot(vec3(-.228,1.15,.0612),X),.9184*X.z);lm=sign(lm)*pow(abs(lm),vec3(.43));v=vec3(dot(vec3(.4,.4,.2),lm),.5+dot(vec3(4.455,-4.851,.396),lm)*.6,.5+dot(vec3(.8056,.3572,-1.1628),lm)*.6);}
  else if(m==7){vec3 r2=vec3(dot(vec3(.6274,.3293,.0433),l),dot(vec3(.0691,.9195,.0114),l),dot(vec3(.0164,.088,.8956),l));vec3 lm=vec3(dot(vec3(1688.,2146.,262.),r2),dot(vec3(683.,2951.,462.),r2),dot(vec3(99.,309.,3688.),r2))/4096.*.01;
   vec3 pm=pow(max(lm,vec3(0.)),vec3(.1593017578125));lm=pow((.8359375+18.8515625*pm)/(1.+18.6875*pm),vec3(78.84375));v=vec3(dot(vec3(.5,.5,0.),lm)/.6,.5+dot(vec3(6610.,-13613.,7003.),lm)/4096.*2.,.5+dot(vec3(17933.,-17390.,-543.),lm)/4096.*2.);}
  else if(m==8){vec3 A=X*100.;vec3 xp=vec3(1.15*A.x-.15*A.z,.66*A.y+.34*A.x,A.z);vec3 lm=vec3(dot(vec3(.41478972,.579999,.014648),xp),dot(vec3(-.20151,1.120649,.0531008),xp),dot(vec3(-.0166008,.2648,.6684799),xp))/10000.;
   vec3 pm=pow(max(lm,vec3(0.)),vec3(.1593017578125));lm=pow((.8359375+18.8515625*pm)/(1.+18.6875*pm),vec3(134.034375));vec3 iab=vec3(dot(vec3(.5,.5,0.),lm),dot(vec3(3.524,-4.066708,.542708),lm),dot(vec3(.199076,1.096799,-1.295875),lm));
   float Jz=(.44*iab.x)/(1.-.56*iab.x)-1.6295499532821566e-11;v=vec3(Jz/.2,.5+iab.y*4.,.5+iab.z*4.);}
  else if(m==9){float I=(s.r+s.g+s.b)/3.;float S_=1.-min(s.r,min(s.g,s.b))/max(I,1e-5);float th=acos(clamp(.5*((s.r-s.g)+(s.r-s.b))/max(sqrt((s.r-s.g)*(s.r-s.g)+(s.r-s.b)*(s.g-s.b)),1e-5),-1.,1.));v=vec3(s.b>s.g?1.-th/6.2832:th/6.2832,S_,I);}
  else if(m==10){float sm=s.r+s.g+s.b+1e-5;v=s/sm;}
  else if(m==11)v=vec3(atan(s.r,max(s.g,s.b)),atan(s.g,max(s.r,s.b)),atan(s.b,max(s.r,s.g)))/1.5708;
  else if(m==12){vec3 d=vec3((s.r-s.g)*(s.r-s.g),(s.r-s.b)*(s.r-s.b),(s.g-s.b)*(s.g-s.b));v=d/max(d.x+d.y+d.z,1e-5);}
  else if(m==13)v=vec3(.5+(s.r-s.g)/1.4142*.7,.5+(s.r+s.g-2.*s.b)/2.4495*.5,(s.r+s.g+s.b)/3.);
  else{float K=1.-max(s.r,max(s.g,s.b));v=(1.-s-K)/max(1.-K,1e-5);k4=K;}
  int ch=int(u_p1+.5);if(ch==4)return vec4(clamp(v,0.,1.),1.);if(ch==3)return vec4(vec3(m==14?k4:0.),1.);return vec4(vec3(clamp(v[ch],0.,1.)),1.);`,'normalised to 0–1 for display; ICtCp/Jzazbz assume 100 nit white');
f('gamutcompress','Gamut Compression (ACES RGC)',[P('Pre-saturation',1,3,1.6,.01),S('Show',['Compressed','Uncompressed (clipped)','Out-of-gamut mask'])],
  `vec3 l=${LIN('c.rgb')};float yl=luma(l);l=yl+(l-yl)*u_p0;float ach=max(l.r,max(l.g,l.b));vec3 d=ach>0.?(ach-l)/abs(ach):vec3(0.);vec3 th=vec3(.815,.803,.88),lim=vec3(1.147,1.264,1.312);float pw=1.2;
  vec3 sc=(lim-th)/pow(pow((1.-th)/(lim-th),vec3(-pw))-1.,vec3(1./pw));vec3 cd=mix(d,th+(d-th)/pow(1.+pow(max(d-th,vec3(0.))/sc,vec3(pw)),vec3(1./pw)),step(th,d));vec3 o=ach-cd*abs(ach);int m=int(u_p1+.5);
  if(m==2)return vec4(vec3(step(.001,-min(l.r,min(l.g,l.b)))),1.);vec3 r=m==1?clamp(l,0.,1.):clamp(o,0.,1.);return vec4(${SRGB('r')},1.);`,'ACES 1.3 reference gamut compression');
f('softproof','Soft Proof (Paper & Ink)',[P('Paper white',.7,1,.93,.005),P('Ink black',0,.3,.1,.005),P('Gamut (saturation limit)',.3,1,.75,.01),S('Paper tint',['Neutral','Warm (uncoated)','Newsprint'])],
  `int t=int(u_p3+.5);vec3 pw=vec3(u_p0)*(t==0?vec3(1.):t==1?vec3(1.,.98,.93):vec3(.96,.94,.86));vec3 hv=rgb2hsv(c.rgb);hv.y=min(hv.y,u_p2)*mix(1.,.85,float(t==2));vec3 x=hsv2rgb(hv);return vec4(mix(vec3(u_p1),pw,x),1.);`,'print preview: paper white, ink density, smaller gamut');
f('cctmap','Color Temperature Map',[P('Min',1500,6000,2500,50,'K'),P('Max',5000,15000,10000,50,'K'),P('Saturation threshold',0,.3,.04,.005)],
  `vec3 l=${LIN('c.rgb')};vec3 X=vec3(dot(vec3(.4124564,.3575761,.1804375),l),dot(vec3(.2126729,.7151522,.072175),l),dot(vec3(.0193339,.119192,.9503041),l));float sm=X.x+X.y+X.z+1e-6;float x=X.x/sm,y=X.y/sm;float n=(x-.332)/(.1858-y);
  float cct=449.*n*n*n+3525.*n*n+6823.3*n+5520.33;float t=clamp((cct-u_p0)/(u_p1-u_p0),0.,1.);vec3 col=stops5(vec3(1.,.35,.05),vec3(1.,.7,.35),vec3(1.,1.,1.),vec3(.6,.75,1.),vec3(.3,.45,1.),t);vec3 hv=rgb2hsv(c.rgb);
  return vec4(hv.y<u_p2?vec3(luma(c.rgb))*.5:col*(.35+.65*hv.z),1.);`,'McCamy 1992 CCT from chromaticity');
f('harmonize','Color Harmonization (Templates)',[S('Template',['i (single)','V (analogous)','L','I (complementary)','T (half wheel)','Y','X (double complementary)']),P('Rotation',0,360,30,1,'°'),P('Strength',0,1,.8,.01)],
  `vec3 hv=rgb2hsv(c.rgb);int m=int(u_p0+.5);float a=hv.x*360.;float r=u_p1;float c1=r,w1=m==0?18.:m==1?93.6:m==2?18.:m==3?18.:m==4?180.:m==5?93.6:93.6;float c2=m==2?r+90.:m==3||m==5||m==6?r+180.:-1.;float w2=m==2?79.2:m==5?18.:m==6?93.6:18.;
  float best=1e9,tgt=a;for(int k=0;k<2;k++){float cc=k==0?c1:c2;float ww=k==0?w1:w2;if(cc<0.)continue;float d=mod(a-cc+540.,360.)-180.;float ad=abs(d);if(ad<=ww*.5){best=0.;tgt=a;}else{float e=ad-ww*.5;if(e<best){best=e;tgt=cc+sign(d)*ww*.45;}}}
  if(best>0.){float d2=mod(tgt-a+540.,360.)-180.;hv.x=fract((a+d2*u_p2)/360.);}return vec4(hsv2rgb(hv),1.);`,'Cohen-Or 2006 hue templates (Matsuda)');
f('hueshiftluma','Hue Shift by Luminance',[P('Shadow hue shift',-180,180,-30,1,'°'),P('Highlight hue shift',-180,180,20,1,'°'),P('Midpoint',.1,.9,.5,.01),P('Saturation boost',0,1,.1,.01)],
  `vec3 hv=rgb2hsv(c.rgb);float l=luma(c.rgb);float sh=mix(u_p0,u_p1,smoothstep(u_p2-.3,u_p2+.3,l));hv.x=fract(hv.x+sh/360.);hv.y=clamp(hv.y*(1.+u_p3),0.,1.);return vec4(hsv2rgb(hv),1.);`,'pixel-art / painterly hue shifting');
