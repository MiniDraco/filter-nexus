/* ================= Round 9A: pixel-art scalers, resampling kernels, AMD/FSR sharpeners, Anime4K ================= */
// pixel-art grid: input is treated as blocks of `Pixel size` px; TX(i,j) = block colour at offset (i,j), +j = up
const PXGRID = `float B=max(R(u_p0),1.);vec2 gp=PX(uv)/B;vec2 g=floor(gp),fr=gp-g;
  #define TX(i,j) T(fromPX((g+vec2(float(i),float(j))+.5)*B)).rgb
  `;
f = add('Retro');
f('pixelscale','Pixel-Art Scaler (EPX / Scale3x / Eagle)',[P('Pixel size',1,16,4,1,'px'),S('Method',['Scale2x (EPX)','Scale3x (AdvMAME3x)','Eagle']),P('Color tolerance',0,.5,.04,.01)],
  `${PXGRID}float thr=u_p2;
  #define EQ(a,b) (dot(abs((a)-(b)),vec3(1.))<=thr)
  vec3 A=TX(-1,1),Bu=TX(0,1),C=TX(1,1),D=TX(-1,0),E=TX(0,0),F=TX(1,0),G=TX(-1,-1),H=TX(0,-1),I=TX(1,-1);vec3 o=E;int m=int(u_p1+.5);
  if(m==0){bool top=fr.y>=.5,lef=fr.x<.5;if(top&&lef){if(EQ(D,Bu)&&!EQ(D,H)&&!EQ(Bu,F))o=Bu;}else if(top){if(EQ(Bu,F)&&!EQ(Bu,D)&&!EQ(F,H))o=F;}else if(lef){if(EQ(H,D)&&!EQ(H,F)&&!EQ(D,Bu))o=D;}else{if(EQ(F,H)&&!EQ(F,Bu)&&!EQ(H,D))o=H;}}
  else if(m==1){int cx=int(min(fr.x*3.,2.)),ry=int(min((1.-fr.y)*3.,2.));int k=ry*3+cx;bool db=EQ(D,Bu)&&!EQ(D,H)&&!EQ(Bu,F),bf=EQ(Bu,F)&&!EQ(Bu,D)&&!EQ(F,H),dh=EQ(D,H)&&!EQ(D,Bu)&&!EQ(H,F),hf=EQ(H,F)&&!EQ(H,D)&&!EQ(F,Bu);
   if(k==0&&db)o=D;else if(k==1&&((db&&!EQ(E,C))||(bf&&!EQ(E,A))))o=Bu;else if(k==2&&bf)o=F;else if(k==3&&((db&&!EQ(E,G))||(dh&&!EQ(E,A))))o=D;else if(k==5&&((bf&&!EQ(E,I))||(hf&&!EQ(E,C))))o=F;
   else if(k==6&&dh)o=D;else if(k==7&&((dh&&!EQ(E,I))||(hf&&!EQ(E,G))))o=H;else if(k==8&&hf)o=F;}
  else{bool top=fr.y>=.5,lef=fr.x<.5;if(top&&lef){if(EQ(A,Bu)&&EQ(Bu,D))o=A;}else if(top){if(EQ(C,Bu)&&EQ(Bu,F))o=C;}else if(lef){if(EQ(G,D)&&EQ(D,H))o=G;}else{if(EQ(I,F)&&EQ(F,H))o=I;}}
  return vec4(o,1.);`,'re-renders N×-enlarged pixel art (Johnston EPX, AdvMAME, Eagle)');
f('xbr','xBR (level 1)',[P('Pixel size',1,16,4,1,'px'),P('Edge softness',0,.25,.06,.01)],
  `${PXGRID}
  #define TD(i,j) TX(i,-(j))
  #define YD(a,b) dot(abs(vec3(dot((a)-(b),vec3(.299,.587,.114)),dot((a)-(b),vec3(-.169,-.331,.5)),dot((a)-(b),vec3(.5,-.419,-.081)))),vec3(48.,7.,6.))
  vec2 fd=vec2(fr.x,1.-fr.y);vec3 E=TD(0,0);vec3 o=E;
  for(int k=0;k<4;k++){mat2 rm=k==0?mat2(1.,0.,0.,1.):k==1?mat2(0.,1.,-1.,0.):k==2?mat2(-1.,0.,0.,-1.):mat2(0.,-1.,1.,0.);
  #define RT(PA,PB) TD(int(floor((rm*vec2(PA,PB)).x+.5)),int(floor((rm*vec2(PA,PB)).y+.5)))
   vec3 F=RT(1.,0.),H=RT(0.,1.),I=RT(1.,1.),Bq=RT(0.,-1.),D=RT(-1.,0.),C=RT(1.,-1.),G=RT(-1.,1.),F4=RT(2.,0.),H5=RT(0.,2.),I4=RT(2.,1.),I5=RT(1.,2.);
   float ed=YD(E,C)+YD(E,G)+YD(I,F4)+YD(I,H5)+4.*YD(H,F),id=YD(H,D)+YD(H,I5)+YD(F,I4)+YD(F,Bq)+4.*YD(E,I);
   if(ed<id&&YD(E,F)>.5&&YD(E,H)>.5){vec3 px=YD(E,F)<=YD(E,H)?F:H;vec2 q=transpose(rm)*(fd-.5);o=mix(o,px,smoothstep(.5-u_p1,.5+u_p1,q.x+q.y));}}
  return vec4(o,1.);`,'Hyllian xBR-lv1 rules, YUV weights');
f('sharppixels','Pixel-Art Antialias (Sharp Bilinear)',[P('Pixel size',1,16,4,1,'px'),P('Edge width',.2,4,1,.05,'px')],
  `float B=max(R(u_p0),1.);vec2 p=PX(uv)/B-.5;vec2 i=floor(p),f=p-i;f=clamp((f-.5)*B/max(R(u_p1),.01)+.5,0.,1.);
  #define TB(a,b) T(fromPX((i+vec2(a,b)+.5)*B)).rgb
  return vec4(mix(mix(TB(0.,0.),TB(1.,0.),f.x),mix(TB(0.,1.),TB(1.,1.),f.x),f.y),1.);`,'crisp texels, antialiased boundaries (sharp-bilinear shader)');
f = add('Sharpen');
f('resamplekernel','Resampling Kernels (from N× grid)',[P('Source pixel size',1,16,4,.5,'px'),S('Kernel',['Bilinear','B-spline (B=1 C=0)','Mitchell-Netravali (B=C=⅓)','Catmull-Rom (C=½)','Lanczos-2','Lanczos-3','Radial Lanczos-3 (Jinc approx.)']),P('Anti-ringing',0,1,0,.01)],
  `float B=max(R(u_p0),1.);vec2 p=PX(uv)/B-.5;vec2 i0=floor(p),f=p-i0;int m=int(u_p1+.5);float bb=m==1?1.:m==2?.3333:0.,cc=m==1?0.:m==2?.3333:.5;
  vec3 acc=vec3(0.);float ws=0.;vec3 mn=vec3(1.),mx=vec3(0.);
  for(int j=-2;j<=3;j++)for(int i=-2;i<=3;i++){vec2 d=vec2(float(i),float(j))-f;float wv[2];
   for(int t=0;t<2;t++){float x=abs(t==0?d.x:d.y);if(m==6)x=t==0?length(d):0.;float k;
    if(m==0)k=max(0.,1.-x);else if(m<=3)k=x<1.?((12.-9.*bb-6.*cc)*x*x*x+(-18.+12.*bb+6.*cc)*x*x+(6.-2.*bb))/6.:x<2.?((-bb-6.*cc)*x*x*x+(6.*bb+30.*cc)*x*x+(-12.*bb-48.*cc)*x+(8.*bb+24.*cc))/6.:0.;
    else{float a=m==4?2.:3.;k=x<1e-4?1.:x<a?a*sin(3.14159*x)*sin(3.14159*x/a)/(9.8696*x*x):0.;}wv[t]=k;}
   float w=m==6?wv[0]:wv[0]*wv[1];vec3 v=T(fromPX((i0+vec2(float(i),float(j))+.5)*B)).rgb;acc+=w*v;ws+=w;if(i>=0&&i<=1&&j>=0&&j<=1){mn=min(mn,v);mx=max(mx,v);}}
  vec3 o=acc/ws;o=mix(o,clamp(o,mn,mx),u_p2);return vec4(clamp(o,0.,1.),1.);`,'Mitchell & Netravali 1988; Lanczos windowed sinc');
const NB = `vec2 e=u_px;vec3 b=T(uv+vec2(0.,e.y)).rgb,d=T(uv-vec2(e.x,0.)).rgb,f_=T(uv+vec2(e.x,0.)).rgb,h=T(uv-vec2(0.,e.y)).rgb,E=c.rgb;`;
f('cas','AMD CAS (Contrast Adaptive Sharpening)',[P('Sharpness',0,1,.5,.01)],
  `${NB}vec3 a=T(uv+vec2(-e.x,e.y)).rgb,cq=T(uv+e).rgb,gq=T(uv-e).rgb,iq=T(uv+vec2(e.x,-e.y)).rgb;
  vec3 mn=min(min(min(d,E),min(f_,b)),h);mn+=min(mn,min(min(a,cq),min(gq,iq)));vec3 mx=max(max(max(d,E),max(f_,b)),h);mx+=max(mx,max(max(a,cq),max(gq,iq)));
  vec3 amp=sqrt(clamp(min(mn,2.-mx)/max(mx,vec3(1e-4)),0.,1.));vec3 w=amp*(-1./mix(8.,5.,u_p0));return vec4(clamp(((b+d+f_+h)*w+E)/(1.+4.*w),0.,1.),1.);`,'FidelityFX CAS, no upscale');
f('rcas','FSR RCAS Sharpening',[P('Sharpness (stops, 0 = max)',0,2,.2,.01)],
  `${NB}vec3 mn4=min(min(b,d),min(f_,h)),mx4=max(max(b,d),max(f_,h));vec3 hitMin=min(mn4,E)/(4.*max(mx4,vec3(1e-4)));vec3 hitMax=(1.-max(mx4,E))/min(4.*mn4-4.,vec3(-1e-4));vec3 lo=max(-hitMin,hitMax);
  float lobe=max(-.1875,min(max(lo.r,max(lo.g,lo.b)),0.))*exp2(-u_p0);return vec4(clamp((lobe*(b+d+f_+h)+E)/(4.*lobe+1.),0.,1.),1.);`,'AMD FSR 1 robust contrast-adaptive sharpening');
const A4K = (st, lighter) => `vec4 cc=T(uv);vec2 e=u_px;vec3 o=cc.rgb;float lc=CH(cc);
  for(int k=0;k<8;k++){int rk=k-(k/4)*4;bool dg=k>=4;mat2 rm=rk==0?mat2(1.,0.,0.,1.):rk==1?mat2(0.,1.,-1.,0.):rk==2?mat2(-1.,0.,0.,-1.):mat2(0.,-1.,1.,0.);
   vec2 L0=dg?vec2(-1.,0.):vec2(-1.,1.),L1=dg?vec2(-1.,1.):vec2(0.,1.),L2=dg?vec2(0.,1.):vec2(1.,1.);
   vec4 l0=T(uv+rm*L0*e),l1=T(uv+rm*L1*e),l2=T(uv+rm*L2*e),d0=T(uv-rm*L0*e),d1=T(uv-rm*L1*e),d2=T(uv-rm*L2*e);
   float mnL=min(min(CH(l0),CH(l1)),CH(l2)),mxD=max(max(CH(d0),CH(d1)),CH(d2));
   if(mnL>mxD&&mnL>lc){vec3 cand=mix(cc.rgb,(l0.rgb+l1.rgb+l2.rgb)/3.,${st});if(${lighter}||luma(cand)>luma(o))o=cand;}}`;
f('anime4k','Anime4K (push color / gradient)',[P('Line thinning',0,1,.3,.01),P('Edge push',0,1,.8,.01)],
  [`
  #define CH(x) luma((x).rgb)
  ${A4K('u_p0','false')}return vec4(o,1.);`,
   `vec2 e=u_px;float g=length(sobel(uv));return vec4(T(uv).rgb,1.-clamp(g,0.,1.));`,
   `
  #define CH(x) (x).a
  ${A4K('u_p1','true')}return vec4(o,1.);`],'bloc97 Anime4K v0.9 algorithm (same-size refinement)');
