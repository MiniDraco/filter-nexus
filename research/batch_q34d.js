/* ================= q34d: broadcast test signals, test cards / resolution targets, safe-area and frame-line overlays ================= */
f = add('Render');
const Q34_BARS = `vec3 bars[8]=vec3[8](vec3(1.),vec3(1.,1.,0.),vec3(0.,1.,1.),vec3(0.,1.,0.),vec3(1.,0.,1.),vec3(1.,0.,0.),vec3(0.,0.,1.),vec3(0.));`;
f('q34_testsignals','Broadcast Test Signals (Bars / PLUGE / Multiburst / Staircase / Checkfield / Bowtie)',[S('Signal',['SMPTE colour bars (EG 1)','SMPTE RP 219 / ARIB STD-B28 bars','EBU colour bars 100/0/75/0','PLUGE (ITU-R BT.814)','Multiburst (NTSC)','Staircase 5 step','Staircase 10 step','SDI checkfield (pathological)','Bowtie (Y 500 kHz, Pb Pr 502 kHz)']),P('Opacity over image',0,1,1,.01),S('Levels',['Full range (black = 0)','Video range codes (black = 16)'])],
 Q34_BARS + `int m=int(u_p0+.5);float X=uv.x,V=1.-uv.y;vec3 o=vec3(0.);
 if(m==0){int b=int(min(floor(X*7.),6.));
  if(V<2./3.)o=bars[b]*.75;else if(V<.75){int rb[7]=int[7](6,7,4,7,2,7,0);o=bars[rb[b]]*.75;}
  else{float x28=X*28.;if(x28<5.)o=vec3(0.,.243,.408);else if(x28<10.)o=vec3(1.);else if(x28<15.)o=vec3(.247,0.,.468);
   else if(X>=5./7.&&X<6./7.){float k=floor((X-5./7.)*21.);o=vec3(k<.5?-.043:k<1.5?0.:.043);}}}
 else if(m==1){float d=.125,cw=.75/7.;float xi=(X-d)/cw;bool side=X<d||X>1.-d;
  if(V<7./12.)o=side?vec3(.4):bars[int(clamp(floor(xi),0.,6.))]*.75;
  else if(V<8./12.)o=X<d?vec3(0.,1.,1.):X>1.-d?vec3(0.,0.,1.):vec3(.75);
  else if(V<9./12.)o=X<d?vec3(1.,1.,0.):X>1.-d?vec3(1.,0.,0.):xi<1.?vec3(0.):vec3(clamp((xi-1.)/6.,0.,1.));
  else{if(side)o=vec3(.15);else if(xi<1.5)o=vec3(0.);else if(xi<3.5)o=vec3(1.);else{float k=floor((xi-3.5-5./6.)*3.);o=vec3(k<0.?0.:k<1.?-.02:k<2.?0.:k<3.?.02:k<4.?0.:k<5.?.04:0.);}}}
 else if(m==2){int b=int(min(floor(X*8.),7.));o=b==0?vec3(1.):bars[b]*.75;}
 else if(m==3){if(V>.15&&V<.85){if(X>=.25&&X<.4){float k=floor((X-.25)/.05);o=vec3(k<1.?-.02:k<2.?0.:.02);}
   else if(X>=.55&&X<.75){float k=floor((V-.15)/.7*4.);o=vec3(k<1.?1.:k<2.?.63:k<3.?.352:.151);}}}
 else if(m==4){float t=X*52.6;if(t<3.)o=vec3(1.);else if(t<6.)o=vec3(0.);else{float tp=t-7.;float k=floor(tp/7.2),u=tp-k*7.2;o=vec3(.5);
   if(tp>=0.&&k<6.&&u<6.){float fr=k<1.?.5:k<2.?1.:k<3.?2.:k<4.?3.:k<5.?3.579545:4.2;o=vec3(.5+.5*sin(6.2832*fr*u));}}}
 else if(m==5)o=vec3(min(floor(X*6.),5.)/5.);
 else if(m==6)o=vec3(min(floor(X*11.),10.)/10.);
 else if(m==7)o=V<.5?vec3(.8426,.2055,.923):vec3(.2374);
 else{float t=X*52.6;float Y=.5+.25*sin(6.2832*.5*t),pb=.25*sin(6.2832*.502*t),pr=pb;o=vec3(Y+1.5748*pr,Y-.1873*pb-.4681*pr,Y+1.8556*pb);}
 if(u_p2>.5)o=(16.+219.*o)/255.;
 return vec4(clamp(mix(c.rgb,o,u_p1),0.,1.),1.);`,
 'generators (optionally over the image): SMPTE EG 1 bars (75% bars, reverse-blue row, -I / 100% white / +Q, PLUGE -4 / 0 / +4 IRE; geometry as FFmpeg smptebars); RP 219 / ARIB STD-B28 (40% grey side panels, 75% bars, 100% cyan / blue with 75% white row, 100% yellow / red with Y ramp, 15% grey, white and PLUGE -2 / 0 / +2 / 0 / +4%; row-4 widths approx.); EBU 100/0/75/0; BT.814 PLUGE (-2 / 0 / +2% stripes and 100 / 63 / 35 / 15% patches, layout approx.); NTSC multiburst (white flag, packets 0.5, 1, 2, 3, 3.58, 4.2 MHz, 100 IRE p-p on 50 IRE, over a 52.6 us line - the highest packets alias at small sizes as on a real line sampled this coarsely); 5 / 10-step staircases; SDI checkfield per SMPTE RP 198 (top: Y 198h, Cb Cr 300h purple; bottom: Y 110h, Cb Cr 200h grey; BT.709 decode); Tektronix bowtie (Y 500 kHz 350 mV p-p, Pb / Pr 502 kHz +-175 mV, decoded to RGB; timing markers omitted). Full range draws black at 0 (sub-black clips); video range writes 8-bit studio codes (black 16) so PLUGE stays visible');

f('q34_testcards','Test Cards & Resolution Targets (PM5544 / FuBK / Card F / Indian Head / Siemens / USAF / ISO 12233)',[S('Card',['Philips PM5544 (layout)','Telefunken FuBK (layout)','BBC Test Card F (layout, image as centre picture)','RCA Indian-head (layout, image as portrait)','Siemens star','USAF 1951 target','ISO 12233-style chart (approx.)']),P('Opacity over image',0,1,1,.01),P('Star spokes',8,144,36,2)],
 Q34_BARS + `int m=int(u_p0+.5);float A=asp();vec2 q=vec2((uv.x-.5)*2.*A,(.5-uv.y)*2.);float pw=2./u_res.y;float r=length(q);float th=atan(q.y,q.x);vec3 o=vec3(.5);
 #define Q34_GRAT(fr,xx) (.5+.5*sin(6.2832*(fr)*((xx)+A)/(2.*A)*52.))
 if(m<=1){float cell=2./(m==0?14.:15.);vec2 g=abs(fract(q/cell+.5)-.5)*cell;o=vec3(m==0?.4:.25);if(min(g.x,g.y)<pw*.9)o=vec3(1.);
  vec2 gi=floor(q/cell+.5);if(abs(q.y)>1.-cell*.9||abs(q.x)>A-cell*.9)o=vec3(mod(gi.x+gi.y,2.));
  float rc=m==0?.86:.8;if(r<rc){float yy=q.y/rc,xw=(q.x+rc)/(2.*rc);
   if(m==0){if(yy<-.72)o=vec3(step(.5,fract(q.x/(2.*cell))))*.75;else if(yy<-.36)o=bars[1+int(min(floor(xw*6.),5.))]*.75;else if(yy<-.12)o=vec3(q.x<0.?1.:0.);
    else if(yy<.12){o=vec3(.5);if(abs(q.y)<pw||abs(q.x)<pw)o=vec3(1.);}
    else if(yy<.42){float k=min(floor(xw*5.),4.);o=vec3(Q34_GRAT(.8+k,q.x));}else if(yy<.72)o=vec3(min(floor(xw*6.),5.)/5.);else o=q.x<0.?vec3(1.,1.,0.):vec3(1.,0.,0.);}
   else{if(yy<-.3)o=bars[int(min(floor(xw*8.),7.))]*.75;else if(yy<.1){o=vec3(0.);if(abs(q.y+.08)<pw*1.5||abs(q.x)<pw*1.5)o=vec3(1.);if(xw>.72&&xw<.88&&yy>-.2&&yy<0.)o=vec3(1.);}
    else if(yy<.5){float k=min(floor(xw*4.),3.);o=vec3(Q34_GRAT(k<3.?k+1.:4.43,q.x));}else o=vec3(min(floor(xw*5.),4.)/4.);}}}
 else if(m==2){o=vec3(.5);vec2 aq=abs(q);if(aq.x<.55&&aq.y<.55)o=c.rgb;
  else if(aq.x<.55&&q.y>-.78&&q.y<-.6){vec3 b=bars[int(min(floor((q.x+.55)/1.1*8.),7.))];o=mix(vec3(dot(b,vec3(.299,.587,.114))),b,.95);}
  else if(q.x<-.62&&q.x>-1.05&&aq.y<.55){float k=min(floor((q.y+.55)/1.1*6.),5.);float fr=k<1.?1.5:k<2.?2.5:k<3.?3.5:k<4.?4.:k<5.?4.5:5.25;o=vec3(Q34_GRAT(fr,q.x));}
  else if(q.x>.62&&q.x<1.05&&aq.y<.55)o=vec3(min(floor((q.y+.55)/1.1*6.),5.)/5.);
  if(aq.y>.9)o=vec3(step(.5,fract(q.x*4.)));
  vec2 tq=vec2(aq.x,aq.y);if((tq.y>.82&&aq.x<(tq.y-.82)*1.2&&aq.x<.1)||(aq.x>A-.18&&aq.y<(aq.x-(A-.18))*1.2))o=vec3(0.);}
 else if(m==3){o=vec3(.55);float ar=abs(th);float sec=abs(fract(th/1.5708+.5)-.5);
  if(r>.45&&r<.95&&sec<.07)o=vec3(step(.5,fract(th*160./6.2832)));
  float dg=abs(fract((th-.7854)/3.1416+.5)-.5);if(r>.42&&r<.95&&dg<.035)o=vec3(.15+.2*floor((r-.42)/.53*4.));
  for(int k=0;k<4;k++){float rr_=.45+.15*float(k);if(abs(r-rr_)<pw*.8)o=vec3(0.);}
  for(int k=0;k<4;k++){vec2 cc=vec2(k%2==0?-1.:1.,k<2?-1.:1.)*vec2(A-.3,.7);vec2 d=q-cc;float rd=length(d);if(rd<.22){o=vec3(.55);if(rd>.05)o=vec3(step(.5,fract(atan(d.y,d.x)*24./6.2832)));if(abs(rd-.22)<pw)o=vec3(0.);}}
  if(r<.38)o=c.rgb;if(abs(r-.38)<pw)o=vec3(0.);}
 else if(m==4){o=vec3(1.);float n=floor(u_p2+.5);if(r<.95)o=vec3(step(.5,fract(th*n/6.2832)));if(abs(r-.95)<pw)o=vec3(0.);}
 else if(m==5){o=vec3(1.);vec2 P=vec2(uv.x,1.-uv.y)*u_res;float bw0=u_res.y/34.;float gx=u_res.x*.04;
  for(int g=0;g<4;g++){float gs=exp2(-float(g));float gy=u_res.y*.04;
   for(int e=0;e<6;e++){float bw=bw0*gs*exp2(-float(e)/6.);vec2 h=P-vec2(gx,gy);
    if(h.y>=0.&&h.y<5.*bw){if(h.x>=0.&&h.x<5.*bw&&mod(floor(h.y/bw),2.)<.5)o=vec3(0.);float hx=h.x-6.*bw;if(hx>=0.&&hx<5.*bw&&mod(floor(hx/bw),2.)<.5)o=vec3(0.);}
    gy+=7.*bw;}
   gx+=13.*bw0*gs;}}
 else{o=vec3(1.);vec2 aq=abs(q);if(aq.x>A-.04||aq.y>.96)o=vec3(0.);float Hh=u_res.y*.5;
  if(r<.3)o=vec3(.5+.5*cos(.2*Hh*3.1416/.3*r*r));
  if(aq.x>.42&&aq.x<A-.15&&aq.y<.55){float fr=(6.+(q.y+.55)/1.1*60.)*(q.x<0.?1.:1.5);o=vec3(step(0.,sin(6.2832*fr*(aq.x-.42))));}
  if(aq.y>.62&&aq.y<.9&&aq.x<.9){float fr=(6.+(q.x+.9)/1.8*60.);o=vec3(step(0.,sin(6.2832*fr*(aq.y-.62))));}
  for(int k=0;k<4;k++){vec2 cc=vec2(k%2==0?-1.:1.,k<2?-1.:1.)*vec2(A-.17,.76);vec2 d=rot(q-cc,.0873);if(abs(d.x)<.1&&abs(d.y)<.1)o=vec3(0.);}}
 return vec4(clamp(mix(c.rgb,o,u_p1),0.,1.),1.);`,
 'generators, approx. layouts: PM5544 (19 x 14 white grid on grey, castellated border, circle with 75% square wave, 75% Y C G M R B bars, white / black step, centre cross, 0.8-4.8 MHz gratings, 6-step grey scale, yellow / red step); FuBK (grid on 25% grey, circle with 75% EBU bars, black band with 2T cross and reflection block, 1 / 2 / 3 / 4.43 MHz gratings, 5 grey steps); Test Card F layout (95%-saturation bars, 1.5-5.25 MHz gratings, grey scale, castellations, overscan triangles) with the input image as the centre picture; Indian-head layout (converging resolution wedges, grey bands, circles, corner stars) with the input as the portrait; Siemens star (spokes = black / white cycles); USAF 1951 (3-bar elements 5:1, width 2^-(group + (element-1)/6), groups 0-3 in columns rather than the spiral layout); ISO 12233-style chart (zone plate, hyperbolic wedges, 5-degree slanted squares)');

f = add('Frames');
f('q34_safeframes','Safe Areas & Camera Frame Lines',[S('Overlay',['Action / title safe (SMPTE ST 2046-1: 93% / 90%)','Action / title safe (legacy RP 13 / RP 8: 90% / 80%)','Camera frame lines']),S('Frame aspect',['2.39:1','1.85:1','16:9','4:3','1:1','9:16 vertical','2:1']),P('Outside shading',0,1,.5,.01),P('Line opacity',0,1,1,.01)],
 `int m=int(u_p0+.5);vec2 P=(uv-.5)*u_res;float lw=max(1.,R(1.5));vec3 o=c.rgb;
 #define Q34_BOX(hs) (abs(max(abs(P.x)-(hs).x,abs(P.y)-(hs).y))<lw)
 #define Q34_IN(hs) (abs(P.x)<(hs).x&&abs(P.y)<(hs).y)
 vec2 hr=u_res*.5;vec2 ha,ht;
 if(m<2){ha=hr*(m==0?.93:.90);ht=hr*(m==0?.90:.80);if(!Q34_IN(ha))o*=1.-u_p2;
  if(Q34_BOX(ha))o=mix(o,vec3(1.),u_p3);if(Q34_BOX(ht))o=mix(o,vec3(1.,.85,.2),u_p3);}
 else{int a=int(u_p1+.5);float ar=a==0?2.39:a==1?1.85:a==2?16./9.:a==3?4./3.:a==4?1.:a==5?9./16.:2.;
  ha=ar>u_res.x/u_res.y?vec2(hr.x,hr.x/ar):vec2(hr.y*ar,hr.y);if(!Q34_IN(ha))o*=1.-u_p2;
  if(Q34_BOX(ha))o=mix(o,vec3(1.),u_p3);vec2 ap=abs(P);vec2 cl=ha*.08;
  if(Q34_IN(ha)&&((ap.x>ha.x-cl.x&&abs(ap.y-(ha.y-lw*3.))<lw)||(ap.y>ha.y-cl.y&&abs(ap.x-(ha.x-lw*3.))<lw)))o=mix(o,vec3(1.,.85,.2),u_p3);}
 vec2 ap=abs(P);if((ap.x<lw*.7&&ap.y<u_res.y*.03)||(ap.y<lw*.7&&ap.x<u_res.y*.03))o=mix(o,vec3(1.),u_p3);
 return vec4(o,1.);`,
 'monitoring overlays: SMPTE ST 2046-1 safe areas for 16:9 HD (action safe 93%, title safe 90% of width and height, centred) or the legacy SMPTE RP 13 / RP 8 values (action 90%, title 80%); camera frame lines = the largest centred frame of the chosen aspect inside the image with inner corner brackets; outside area darkened; centre cross');
