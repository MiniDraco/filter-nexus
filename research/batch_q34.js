/* ================= q34: Tektronix gamut / log scopes and monitor checks ================= */
f = add('Analysis');
f('q34_tekscopes','Tektronix Scopes (Lightning / Diamond / Arrowhead / Spearhead / Stop)',[S('Display',['Lightning (Y vs Pb / Pr)','Diamond gamut (RGB)','Arrowhead (NTSC composite gamut)','Spearhead (lightness vs saturation)','Stop display (log2 scene light)']),P('Gain',.5,10,3,.1),P('Graticule',0,1,.5,.01),S('Stop curve (input transfer)',['sRGB','Rec.709 OETF','Gamma 2.4','Sony S-Log3','ARRI LogC3 (EI 800)'])],
 `int m=int(u_p0+.5);vec3 acc=vec3(0.);float gr=0.;vec2 p=(uv-.5)*vec2(asp(),1.)*2.;
 #define Q34_SPL(pt,col) acc+=(col)*exp(-dot((pt)-p,(pt)-p)*2500.)
 #define Q34_SEG(a_,b_,w_) gr=max(gr,1.-smoothstep(0.,(w_),length(p-(a_)-clamp(dot(p-(a_),(b_)-(a_))/dot((b_)-(a_),(b_)-(a_)),0.,1.)*((b_)-(a_)))))
 if(m==4){int cv=int(u_p3+.5);float yv=uv.y;
  for(int k=0;k<96;k++){vec3 v=clamp(O(vec2(uv.x,(float(k)+.5)/96.)).rgb,0.,1.);vec3 li;
   if(cv==0)li=mix(v/12.92,pow((v+.055)/1.055,vec3(2.4)),step(.04045,v));
   else if(cv==1)li=mix(v/4.5,pow((v+.099)/1.099,vec3(1./.45)),step(.081,v));
   else if(cv==2)li=pow(v,vec3(2.4));
   else if(cv==3)li=mix((v*1023.-95.)*.01125/(171.2102946929-95.),pow(vec3(10.),(v*1023.-420.)/261.5)*.19-.01,step(171.2102946929/1023.,v));
   else li=mix((v-.092809)/5.367655,(pow(vec3(10.),(v-.385537)/.24719)-.052272)/5.555556,step(.149658,v));
   float Yl=max(dot(li,vec3(.2126,.7152,.0722)),1e-6);float st=log2(Yl/.18);float yy=(st+10.)/19.;acc+=vec3(exp(-pow((yy-yv)*190.,2.)));}
  acc=acc/96.*u_p1*6.*vec3(.45,1.,.55);float sv=yv*19.-10.;gr=step(abs(fract(sv+.5)-.5),.035)*(abs(sv)<.5?1.:.45);
  return vec4(clamp(acc+gr*u_p2*vec3(.65,.6,.3),0.,1.),1.);}
 for(int j=0;j<36;j++)for(int i=0;i<36;i++){vec3 s=clamp(O((vec2(float(i),float(j))+.5)/36.).rgb,0.,1.);vec3 tc=mix(s,vec3(1.),.35);
  float Y=dot(s,vec3(.2126,.7152,.0722));
  if(m==0){float pb=(s.b-Y)/1.8556,pr=(s.r-Y)/1.5748;Q34_SPL(vec2(pb*1.7,Y*.95),tc);Q34_SPL(vec2(pr*1.7,-Y*.95),tc);}
  else if(m==1){Q34_SPL(vec2(s.b-s.g,s.b+s.g)*.47,tc);Q34_SPL(vec2(s.r-s.g,-(s.r+s.g))*.47,tc);}
  else if(m==2){float y6=dot(s,vec3(.299,.587,.114));float u=.492*(s.b-y6),v=.877*(s.r-y6);float ire=7.5+92.5*y6,ca=92.5*length(vec2(u,v));Q34_SPL(vec2(-1.2+ca/50.,(ire-50.)/100.),tc);}
  else{float mx=max(s.r,max(s.g,s.b)),mn=min(s.r,min(s.g,s.b));Q34_SPL(vec2(-.8+(mx-mn)*1.6,-.9+(mx+mn)*.9),tc);}}
 acc=acc/1296.*u_p1*30.;
 if(m==0){Q34_SEG(vec2(0.,-1.),vec2(0.,1.),.004);Q34_SEG(vec2(-.9,0.),vec2(.9,0.),.004);
  for(int k=0;k<6;k++){vec3 b=k==0?vec3(1.,1.,0.):k==1?vec3(0.,1.,1.):k==2?vec3(0.,1.,0.):k==3?vec3(1.,0.,1.):k==4?vec3(1.,0.,0.):vec3(0.,0.,1.);b*=.75;float Y=dot(b,vec3(.2126,.7152,.0722));
   vec2 t1=vec2((b.b-Y)/1.8556*1.7,Y*.95),t2=vec2((b.r-Y)/1.5748*1.7,-Y*.95);gr=max(gr,1.-smoothstep(.0,.006,abs(length(p-t1)-.03)));gr=max(gr,1.-smoothstep(0.,.006,abs(length(p-t2)-.03)));}}
 else if(m==1){vec2 a=vec2(0.,0.),l=vec2(-.47,.47),r=vec2(.47,.47),t=vec2(0.,.94);Q34_SEG(a,l,.004);Q34_SEG(a,r,.004);Q34_SEG(l,t,.004);Q34_SEG(r,t,.004);
  Q34_SEG(a,-l,.004);Q34_SEG(a,-r,.004);Q34_SEG(-l,-t,.004);Q34_SEG(-r,-t,.004);}
 else if(m==2){Q34_SEG(vec2(-1.2,-1.),vec2(-1.2,1.),.004);Q34_SEG(vec2(-1.2,-.5),vec2(1.2,-.5),.003);Q34_SEG(vec2(-1.2,.5),vec2(1.2,.5),.003);
  for(int k=0;k<2;k++){float lim=k==0?110.:120.;Q34_SEG(vec2(-1.2,(lim-50.)/100.),vec2(-1.2+(lim-7.5)/50.,(7.5-50.)/100.),k==0?.003:.005);}
  Q34_SEG(vec2(-1.2,(-20.-50.)/100.),vec2(-1.2+(7.5+20.)/50.,(7.5-50.)/100.),.005);}
 else{vec2 b0=vec2(-.8,-.9),w0=vec2(-.8,.9),s0=vec2(.8,0.);Q34_SEG(b0,w0,.004);Q34_SEG(b0,s0,.004);Q34_SEG(w0,s0,.004);
  for(int k=1;k<4;k++){float f_=float(k)*.25;Q34_SEG(mix(b0,s0,f_),mix(w0,s0,f_),.002);Q34_SEG(mix(b0,w0,f_),mix(s0,w0,f_),.002);}}
 return vec4(clamp(acc+gr*u_p2*vec3(.65,.6,.3),0.,1.),1.);`,
 'Tektronix gamut displays from a 36x36 sample grid of the image (read as R\'G\'B\' 0-100%): Lightning = luma up vs Pb in the upper half, inverted luma vs Pr in the lower half (BT.709), with 75% bar targets; Diamond (US 5307087) = B-G across vs B+G up (upper diamond) and R-G vs -(R+G) (lower), legal-gamut diamonds as graticule; Arrowhead = NTSC luma IRE (7.5 setup, BT.601 Y) up vs composite chroma amplitude 92.5 x |U,V| across, with 110 / 120 IRE luma+chroma limit lines and a -20 IRE lower line (approx. limits); Spearhead (US 7071965) = lightness (max+min)/2 up vs max-min across in the black-white-saturation triangle with iso-saturation / iso-value lines; Stop display = waveform of log2(scene luminance / 0.18) after inverting the chosen transfer curve (sRGB, BT.709, gamma 2.4, S-Log3, LogC3 EI 800), -10..+9 stops, 0 stop line bright');

f('q34_monitorchk','Monitor Checks (Blue Only / Superwhite / Illegal Levels)',[S('Check',['Blue only (blue gun, mono)','Superwhite / sub-black highlight (luma)','RGB gamut highlight (EBU R 103)']),P('Upper limit %',90,110,100,.5),P('Lower limit %',-10,5,0,.5),P('Dim image',0,1,.5,.01)],
 `int m=int(u_p0+.5);vec3 v=c.rgb;if(m==0)return vec4(vec3(v.b),1.);
 vec3 pc=(v*255.-16.)/219.*100.;float Y=(dot(v,vec3(.2126,.7152,.0722))*255.-16.)/219.*100.;vec3 base=mix(v,vec3(luma(v)),.6)*(1.-u_p3);
 vec2 q=PX(uv);float zb=step(.5,fract((q.x+q.y)/8.));
 float hi=0.,lo=0.;if(m==1){hi=Y>u_p1?1.:0.;lo=Y<u_p2?1.:0.;}
 else{float up=u_p1+5.,dn=u_p2-5.;hi=max(pc.r,max(pc.g,pc.b))>up?1.:0.;lo=min(pc.r,min(pc.g,pc.b))<dn?1.:0.;}
 vec3 o=base;o=mix(o,mix(vec3(1.,.1,.1),vec3(1.),zb*.6),hi);o=mix(o,mix(vec3(.1,.3,1.),vec3(0.),zb*.6),lo*(1.-hi));return vec4(o,1.);`,
 'monitor line-up checks. Blue only: only the blue gun shown (as grey), used with SMPTE / RP 219 bars to set chroma and hue until the blue-containing bars match the reverse-blue row below. The level checks read the pixel values as 8-bit video-range codes (16 = 0 %, 235 = 100 %): superwhite / sub-black flags luma above the upper or below the lower limit (striped red / blue); RGB gamut flags any R\'G\'B\' component outside the EBU R 103 tolerance band (limits widened by 5 %, i.e. -5 % / 105 % at the defaults)');
