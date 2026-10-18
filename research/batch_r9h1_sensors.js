/* ================= Round 9H1: scopes, focus/contrast measures, saliency II, LBP variants, descriptor fields, overlays, windowing ================= */
f = add('Analysis');
f('scopes','Video Scopes (Waveform / Parade / Vectorscope)',[S('Scope',['Luma waveform','RGB parade','Vectorscope']),P('Gain',.5,10,3,.1),P('Graticule',0,1,.4,.01)],
  `int m=int(u_p0+.5);vec3 acc=vec3(0.);float gr=0.;
  if(m<2){float x=uv.x;int ch=0;if(m==1){ch=int(min(floor(x*3.),2.));x=fract(x*3.);}float yv=uv.y;for(int k=0;k<96;k++){vec3 s=O(vec2(x,(float(k)+.5)/96.)).rgb;float v=m==0?luma(s):s[ch];acc+=vec3(exp(-pow((v-yv)*180.,2.)));}
   acc=acc/96.*u_p1*6.;vec3 tint=m==0?vec3(.4,1.,.5):ch==0?vec3(1.,.3,.3):ch==1?vec3(.3,1.,.3):vec3(.4,.5,1.);acc*=tint;gr=step(abs(fract(yv*10.+.5)-.5),.004*10.)*.5;if(m==1)gr=max(gr,step(abs(fract(uv.x*3.+.5)-.5),.006)*1.);}
  else{vec2 p=(uv-.5)*vec2(asp(),1.)*2.2;for(int j=0;j<32;j++)for(int i=0;i<32;i++){vec3 s=O((vec2(float(i),float(j))+.5)/32.).rgb;vec2 cbcr=vec2(dot(s,vec3(-.1687,-.3313,.5)),dot(s,vec3(.5,-.4187,-.0813)))*2.;acc+=s*exp(-dot(cbcr-p,cbcr-p)*900.);}
   acc=acc/1024.*u_p1*40.;float r=length(p);gr=step(abs(r-1.),.006)+step(abs(r-.75*1.),.004)*.5+step(min(abs(p.x),abs(p.y)),.003)*.4;}
  return vec4(clamp(acc+gr*u_p2*vec3(.6,.55,.3),0.,1.),1.);`,'broadcast scopes rendered from a sample grid of the image');
f('focusmeasure','Focus / Sharpness Measures',[S('Measure',['Tenengrad','Laplacian variance','Brenner gradient','Vollath F4','Edge density']),P('Window',3,40,10,1,'px'),P('Gain',1,200,6,1),S('Output',['Heat map','Over image'])],
  `int m=int(u_p0+.5);float st=R(u_p1)/3.;float a=0.,a2=0.,n=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*st*u_px;vec2 e=u_px;float v;
   if(m==0){vec2 g=sobel(q);v=dot(g,g);}else if(m==1){v=L(q+vec2(e.x,0.))+L(q-vec2(e.x,0.))+L(q+vec2(0.,e.y))+L(q-vec2(0.,e.y))-4.*L(q);}else if(m==2){float d=L(q+vec2(2.*e.x,0.))-L(q);v=d*d;}
   else if(m==3){v=L(q)*L(q+vec2(e.x,0.))-L(q)*L(q+vec2(2.*e.x,0.));}else v=step(.15,length(sobel(q)));a+=v;a2+=v*v;n+=1.;}
  float r=m==1?(a2/n-(a/n)*(a/n))*40.:m==4?a/n*.03:a/n;r=clamp(r*u_p2,0.,1.);return vec4(u_p3>.5?mix(c.rgb*.45,ramp(1,r),r):ramp(1,r),1.);`,'autofocus metrics (Krotkov, Pech-Pacheco, Brenner, Vollath)');
f('contrastmap','Contrast / Colourfulness / Complexity Maps',[S('Map',['RMS contrast','Michelson contrast','Colourfulness (Hasler-Süsstrunk)','Gradient-entropy complexity','Lacunarity','Hurst exponent','Haar wavelet energy']),P('Window',3,60,14,1,'px'),P('Gain',.2,10,1,.05)],
  `int m=int(u_p0+.5);float st=R(u_p1)/3.;float s=0.,s2=0.,mn=1.,mx=0.;vec2 rgm=vec2(0.),rg2=vec2(0.);float hb[8];for(int k=0;k<8;k++)hb[k]=0.;float n=0.;
  for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=uv+vec2(float(i),float(j))*st*u_px;vec3 c3=T(q).rgb;float l=luma(c3);s+=l;s2+=l*l;mn=min(mn,l);mx=max(mx,l);vec2 o=vec2(c3.r-c3.g,.5*(c3.r+c3.g)-c3.b);rgm+=o;rg2+=o*o;vec2 g=sobel(q);if(length(g)>.05){int b=int(mod(floor((atan(g.y,g.x)+3.14159)/6.2832*8.),8.));hb[b]+=1.;}n+=1.;}
  float mu=s/n,va=max(s2/n-mu*mu,0.);float o;
  if(m==0)o=sqrt(va)*u_p2*3.;else if(m==1)o=(mx-mn)/max(mx+mn,.02)*u_p2*.6;else if(m==2){vec2 mm=rgm/n,sd=sqrt(max(rg2/n-mm*mm,0.));o=(length(sd)+.3*length(mm))*u_p2*1.2;}
  else if(m==3){float tot=0.;for(int k=0;k<8;k++)tot+=hb[k];float e=0.;for(int k=0;k<8;k++){float p=hb[k]/max(tot,1.);if(p>0.)e-=p*log2(p);}o=e/3.*min(tot/12.,1.)*u_p2*.6;}
  else if(m==4)o=(va/max(mu*mu,1e-4))*u_p2*2.;
  else if(m==5){float d1=0.,d2=0.;for(int k=0;k<12;k++){float a=float(k)*.5236;vec2 dv=vec2(cos(a),sin(a))*u_px;d1+=abs(L(uv+dv*st)-L(uv));d2+=abs(L(uv+dv*st*4.)-L(uv));}o=clamp(log(max(d2,1e-4)/max(d1,1e-4))/log(4.),0.,1.)*u_p2*.6;}
  else{float a=L(uv),b=L(uv+vec2(st*u_px.x,0.)),cc=L(uv+vec2(0.,st*u_px.y)),d=L(uv+st*u_px);o=(abs(a-b+cc-d)+abs(a+b-cc-d)+abs(a-b-cc+d))*u_p2;}
  return vec4(ramp(2,clamp(o,0.,1.)),1.);`,'7×7 sampled window statistics');
f('saliency2','Saliency II',[S('Model',['Frequency-tuned (Achanta)','Itti-Koch (centre-surround)','Fine-grained (Montabone)','Spectral-free residual (local)']),P('Scale',2,40,10,.5,'px'),P('Gain',.5,10,2,.05),S('Output',['Map','Over image'])],
  `int m=int(u_p0+.5);vec3 l=c.rgb;
  #define LAB(x) vec3(luma(x),(x).r-(x).g,.5*((x).r+(x).g)-(x).b)
  float o=0.;if(m==0){vec3 mu=vec3(0.);for(int j=0;j<10;j++)for(int i=0;i<10;i++)mu+=LAB(O((vec2(float(i),float(j))+.5)/10.).rgb);mu/=100.;vec3 b=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)b+=LAB(T(uv+vec2(float(i),float(j))*u_px).rgb);b/=9.;o=length(b-mu)*u_p2;}
  else{for(int sc=0;sc<3;sc++){float cs=R(u_p1)*pow(2.,float(sc));vec3 cen=vec3(0.),sur=vec3(0.);for(int k=0;k<12;k++){float a=float(k)*.5236;cen+=LAB(T(uv+vec2(cos(a),sin(a))*cs*.3*u_px).rgb);sur+=LAB(T(uv+vec2(cos(a),sin(a))*cs*1.5*u_px).rgb);}cen/=12.;sur/=12.;vec3 d=cen-sur;
   if(m==1){float ori=0.;for(int k=0;k<4;k++){float a=float(k)*.785;vec2 dv=vec2(cos(a),sin(a))*cs*.5*u_px;ori+=abs(L(uv+dv)+L(uv-dv)-2.*L(uv));}o+=abs(d.x)+.6*(abs(d.y)+abs(d.z))+ori*.3;}
   else if(m==2)o+=max(d.x,0.)+max(-d.x,0.)*.8;else o+=length(d)/(1.+length(sur)*.5);}o*=u_p2*.5;}
  o=clamp(o,0.,1.);return vec4(u_p3>.5?mix(c.rgb*.35,c.rgb,o)+vec3(o*.15,0.,0.):vec3(o),1.);`,'Achanta 2009, Itti-Koch-Niebur 1998, Montabone & Soto 2010');
f('lbp2','LBP Variants & Local Patterns',[S('Pattern',['Rotation-invariant uniform LBP (riu2)','LBP variance (LBPV)','Completed LBP (S/M/C as RGB)','Local ternary pattern (upper/lower)','Local directional pattern (Kirsch k=3)','Local gradient pattern','Weber local descriptor','Local phase quantization']),P('Radius',1,4,1,.5,'px'),P('Tolerance / gain',.005,.2,.03,.005)],
  `int m=int(u_p0+.5);float r=R(u_p1);float C=L(uv);float s[8];for(int k=0;k<8;k++){float a=float(k)*.785;s[k]=L(uv+vec2(cos(a),sin(a))*r*u_px);}float b[8];int ones=0,tr=0;for(int k=0;k<8;k++){b[k]=s[k]>=C?1.:0.;ones+=int(b[k]);}for(int k=0;k<8;k++)tr+=int(abs(b[k]-b[(k+1)-((k+1)/8)*8]));
  if(m==0)return vec4(vec3(float(tr<=2?ones:9)/9.),1.);
  float mu=0.;for(int k=0;k<8;k++)mu+=s[k];mu/=8.;float va=0.;for(int k=0;k<8;k++)va+=(s[k]-mu)*(s[k]-mu);va/=8.;
  if(m==1)return vec4(hsv2rgb(vec3(float(tr<=2?ones:9)/10.,.8,clamp(sqrt(va)*8./u_p2*.03,0.,1.))),1.);
  if(m==2){float md=0.;for(int k=0;k<8;k++)md+=abs(s[k]-C);md/=8.;float mm=0.;int cm=0;for(int k=0;k<8;k++)cm+=abs(s[k]-C)>=md?1:0;return vec4(float(ones)/8.,float(cm)/8.,C>=.5?1.:0.,1.);}
  if(m==3){int up=0,lo=0;for(int k=0;k<8;k++){up+=(s[k]>C+u_p2?1:0)<<k;lo+=(s[k]<C-u_p2?1:0)<<k;}return vec4(float(up)/255.,float(lo)/255.,0.,1.);}
  if(m==4){float kr[8];float mk[8]=float[8](5.,5.,5.,-3.,-3.,-3.,-3.,-3.);for(int d=0;d<8;d++){float acc=0.;for(int k=0;k<8;k++){int idx=k-d;if(idx<0)idx+=8;acc+=mk[idx]*s[k];}kr[d]=abs(acc);}int code=0;for(int d=0;d<8;d++){int rk=0;for(int q=0;q<8;q++)rk+=(kr[q]>kr[d]||(kr[q]==kr[d]&&q<d))?1:0;if(rk<3)code+=1<<d;}return vec4(vec3(float(code)/255.),1.);}
  if(m==5){float g[8];float gm=0.;for(int k=0;k<8;k++){g[k]=abs(s[k]-C);gm+=g[k];}gm/=8.;int code=0;for(int k=0;k<8;k++)code+=(g[k]>=gm?1:0)<<k;return vec4(vec3(float(code)/255.),1.);}
  if(m==6){float xi=atan((mu*8.-8.*C)/max(C,.02))/1.5708;float th=atan(s[6]-s[2],s[4]-s[0]);return vec4(hsv2rgb(vec3(th/6.2832+.5,.8,clamp(abs(xi)*u_p2*20.,0.,1.))),1.);}
  float fr=1./7.;vec4 re=vec4(0.),im=vec4(0.);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 d=vec2(float(i),float(j));float v=L(uv+d*r*u_px);vec4 ph=6.2832*fr*vec4(d.x,d.y,d.x+d.y,d.x-d.y);re+=v*cos(ph);im-=v*sin(ph);}
  int code=0;for(int k=0;k<4;k++){code+=(re[k]>0.?1:0)<<(2*k);code+=(im[k]>0.?1:0)<<(2*k+1);}return vec4(vec3(float(code)/255.),1.);`,'Ojala 2002, Guo 2010 (LBPV, CLBP), Tan & Triggs 2010 (LTP), Jabid 2010 (LDP), Chen 2010 (WLD), Ojansivu 2008 (LPQ)');
f('descfield','Dense Descriptor Field (SIFT / DAISY)',[S('Descriptor',['Dense SIFT (4×4 cells)','DAISY (rings)']),P('Cell size',2,16,4,.5,'px'),P('Gain',.5,10,2,.05)],
  `int m=int(u_p0+.5);float cs=R(u_p1);float h[8];for(int k=0;k<8;k++)h[k]=0.;
  for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 d=vec2(float(i),float(j));float w;if(m==0)w=max(abs(d.x),abs(d.y))<=6.?exp(-dot(d,d)/72.):0.;else{float r=length(d);w=exp(-pow(mod(r,3.)-1.5,2.))*step(r,6.5);}if(w==0.)continue;vec2 g=sobel(uv+d*cs*.5*u_px);float mg=length(g);float an=(atan(g.y,g.x)+3.14159)/6.2832*8.;int b=int(mod(floor(an),8.));h[b]+=mg*w;}
  float tot=0.;int bk=0;for(int k=0;k<8;k++){tot+=h[k];if(h[k]>h[bk])bk=k;}float dom=h[bk]/max(tot,1e-4);return vec4(hsv2rgb(vec3(float(bk)/8.,clamp(dom*2.,0.,1.),clamp(tot*.01*u_p2,0.,1.))),1.);`,'colour = dominant gradient orientation, saturation = peakedness, value = energy (Lowe 2004, Tola 2010)');
f('composition','Composition Overlays & Maps',[S('Overlay',['Rule of thirds','Golden ratio grid + spiral','Symmetry map (left/right)','Horizon tilt map','Sky mask']),P('Line opacity',0,1,.7,.01),P('Window',4,60,16,1,'px')],
  `int m=int(u_p0+.5);vec3 o=c.rgb;float lw=1.5*max(u_k,1.);vec2 p=uv*u_res;
  if(m==0){vec2 t=abs(fract(uv*3.+.5)-.5)*u_res/3.;float ln=step(min(t.x,t.y),lw);return vec4(mix(o,vec3(1.),ln*u_p1),1.);}
  if(m==1){float g=.618034;vec2 q=uv;float ln=step(min(min(abs(q.x-g),abs(q.x-1.+g))*u_res.x,min(abs(q.y-g),abs(q.y-1.+g))*u_res.y),lw);vec2 cp=vec2(g,1.-g)*u_res;vec2 v=p-cp;float r=length(v),a=atan(v.y,v.x);float sp=abs(fract((log(max(r,1.))/log(1.618034)*1.5708-a)/6.2832)-.5);ln=max(ln,step(sp*r*6.2832,lw*1.5));return vec4(mix(o,vec3(1.,.85,.3),ln*u_p1),1.);}
  if(m==2){vec2 q=vec2(1.-uv.x,uv.y);float d=0.;float st=R(u_p2)/3.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 e=vec2(float(i),float(j))*st*u_px;d+=abs(L(uv+e)-L(q+vec2(-e.x,e.y)));}return vec4(ramp(2,1.-clamp(d/25.*4.,0.,1.)),1.);}
  if(m==3){float a=0.,b=0.,cc=0.;float st=R(u_p2);for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 g=sobel(uv+vec2(float(i),float(j))*st*u_px);a+=g.x*g.x;b+=g.x*g.y;cc+=g.y*g.y;}float th=.5*atan(2.*b,a-cc)+1.5708;float coh=sqrt((a-cc)*(a-cc)+4.*b*b)/max(a+cc,1e-5);float tilt=degrees(atan(sin(th),cos(th)));tilt=mod(tilt+90.,180.)-90.;return vec4(mix(o*.4,hsv2rgb(vec3(clamp(.5+tilt/60.,0.,1.)*.66,.9,1.)),coh*u_p1),1.);}
  vec3 hv=rgb2hsv(o);float blue=smoothstep(.45,.6,hv.x)*smoothstep(.75,.6,hv.x)*smoothstep(.15,.35,hv.y);float bright=smoothstep(.55,.85,hv.z)*(1.-hv.y);float sky=max(blue,bright*.9)*smoothstep(.2,.7,uv.y)*(1.-smoothstep(.05,.2,length(sobel(uv))));return vec4(u_p1>.99?vec3(sky):mix(o*.5,vec3(.4,.7,1.),sky*u_p1),1.);`,'framing guides and simple scene-structure maps');
f('windowlevel','Window / Level & Intensity Transforms',[S('Transform',['Window / level (medical)','Intensity windowing (ITK)','Sigmoid intensity (ITK)','Shift-scale (ITK)']),P('Center / β / shift',0,1,.5,.005),P('Width / α / scale',.01,2,.4,.005),S('Colour',['Grayscale','Keep colour'])],
  `int m=int(u_p0+.5);vec3 x=c.rgb;float l=luma(x);float y;if(m==0||m==1){float lo=u_p1-u_p2*.5;y=clamp((l-lo)/u_p2,0.,1.);}else if(m==2){y=1./(1.+exp(-(l-u_p1)/max(u_p2*.15,.002)));}else y=clamp((l+(u_p1-.5))*u_p2*2.5,0.,1.);
  return vec4(u_p3>.5?x*y/max(l,1e-3):vec3(y),1.);`,'CT/MR display windowing; ITK IntensityWindowing, Sigmoid, ShiftScale');
