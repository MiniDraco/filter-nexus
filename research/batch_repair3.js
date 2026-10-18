/* ================= Round 7: astro/photo repair, matched filters, VST ================= */
f = add('Repair');
f('cosmicray','Cosmic Ray / Impulse Removal',[P('Sigma clip',2,12,5,.1),P('Object limit',1,10,3,.1),S('Output',['Cleaned','Detection mask'])],
  `float e=max(u_k,1.);float s[25];vec3 cs[25];for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec3 v=T(uv+vec2(float(i),float(j))*u_px*e).rgb;cs[(j+2)*5+i+2]=v;s[(j+2)*5+i+2]=luma(v);}
  float med5=0.;vec3 medc=c.rgb;for(int k=0;k<25;k++){int rk=0;for(int q=0;q<25;q++)rk+=(s[q]<s[k]||(s[q]==s[k]&&q<k))?1:0;if(rk==12){med5=s[k];medc=cs[k];}}
  float dv[25];for(int k=0;k<25;k++)dv[k]=abs(s[k]-med5);float mad=0.;for(int k=0;k<25;k++){int rk=0;for(int q=0;q<25;q++)rk+=(dv[q]<dv[k]||(dv[q]==dv[k]&&q<k))?1:0;if(rk==12)mad=dv[k];}
  float m3[9];int n=0;for(int j=1;j<=3;j++)for(int i=1;i<=3;i++){m3[n]=s[j*5+i];n++;}float med3=0.;for(int k=0;k<9;k++){int rk=0;for(int q=0;q<9;q++)rk+=(m3[q]<m3[k]||(m3[q]==m3[k]&&q<k))?1:0;if(rk==4)med3=m3[k];}
  float l=s[12];float lap=l-(s[7]+s[11]+s[13]+s[17])*.25;float sig=max(1.4826*mad,.004);float fine=max(med3-med5,sig*.5);
  bool cr=lap>u_p0*sig&&lap/fine>u_p1;if(u_p2>.5)return vec4(vec3(cr?1.:0.),1.);return vec4(cr?medc:c.rgb,1.);`,'L.A.Cosmic-style (van Dokkum 2001), single scale');
f('deband','Deband',[P('Radius',2,40,12,1,'px'),P('Threshold',.002,.05,.012,.001),P('Grain',0,.03,.006,.001),P('Iterations',1,4,2,1)],
  `vec3 acc=c.rgb;float w=1.;vec2 p=PX(uv);for(int it=0;it<4;it++){if(float(it)>=u_p3)break;float rr=R(u_p0)*(1.-float(it)*.2)*hash(p+float(it)*7.1);float a=6.2832*hash(p+float(it)*3.3+.5);vec2 d=vec2(cos(a),sin(a))*rr*u_px;
   vec3 s1=T(uv+d).rgb,s2=T(uv-d).rgb,s3=T(uv+vec2(-d.y,d.x)).rgb,s4=T(uv-vec2(-d.y,d.x)).rgb;vec3 av=(s1+s2+s3+s4)*.25;vec3 df=max(max(abs(s1-c.rgb),abs(s2-c.rgb)),max(abs(s3-c.rgb),abs(s4-c.rgb)));
   if(max(df.r,max(df.g,df.b))<u_p1){acc+=av;w+=1.;}}return vec4(acc/w+(hash(p*1.37)-.5)*u_p2,1.);`,'f3kdb / ffmpeg deband style');
f('defringe','Purple Fringe Removal',[P('Radius',1,20,5,.5,'px'),P('Highlight level',.5,1,.8,.01),P('Hue width',.02,.25,.12,.01),P('Amount',0,1,1,.01)],
  `float mx=0.;for(int k=0;k<16;k++){float a=float(k)*.3927;mx=max(mx,L(uv+vec2(cos(a),sin(a))*R(u_p0)*u_px));}vec3 h=rgb2hsv(c.rgb);float d=abs(h.x-.78);d=min(d,1.-d);
  float pur=smoothstep(u_p2,u_p2*.5,d)*smoothstep(.1,.3,h.y)*smoothstep(u_p1-.15,u_p1,mx);vec3 g=vec3(luma(c.rgb));vec3 fix=vec3(min(c.r,c.g*1.05),c.g,min(c.b,c.g*1.05));return vec4(mix(c.rgb,mix(fix,g,.5),pur*u_p3),1.);`,'desaturate purple/blue near bright edges');
f('cacorrect','Lateral Chromatic Aberration Correction',[P('Red scale',-8,8,0,.05,'‰'),P('Blue scale',-8,8,0,.05,'‰'),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01)],
  `vec2 cc=vec2(u_p2,1.-u_p3);vec2 d=uv-cc;float r=T(cc+d*(1.+u_p0*.001)).r,b=T(cc+d*(1.+u_p1*.001)).b;return vec4(r,c.g,b,1.);`,'set each to that channel’s magnification in ‰ (Lightroom, RawTherapee, darktable)');
f = add('Edges');
f('matchedfilter','Matched Filter (Vessels / Point Sources)',[S('Template',['Vessel (Chaudhuri; 12 angles)','Point source (Gaussian PSF)']),P('Sigma',.5,6,1.5,.1,'px'),P('Length',3,20,9,1,'px'),P('Gain',1,100,20,1)],
  `float sg=R(u_p1);float ln=R(u_p2);int m=int(u_p0+.5);float best=-1e9;if(m==1){float acc=0.,ws=0.,mu=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*sg*.5;float r2=dot(o,o);if(r2>9.*sg*sg)continue;float g=exp(-r2/(2.*sg*sg));float v=L(uv+o*u_px);acc+=g*v;ws+=g;mu+=v;}
   float n=0.;for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*sg*.5;if(dot(o,o)<=9.*sg*sg)n+=1.;}return vec4(ramp(1,clamp((acc/ws-mu/n)*u_p3,0.,1.)),1.);}
  for(int k=0;k<12;k++){float a=float(k)*.2618;vec2 t=vec2(cos(a),sin(a)),nn=vec2(-t.y,t.x);float s=0.,sk=0.,n=0.;for(int j=-4;j<=4;j++)for(int i=-6;i<=6;i++){float x=float(i)*sg*.5;if(abs(x)>3.*sg)continue;float y=float(j)/4.*ln*.5;float kv=-exp(-x*x/(2.*sg*sg));float v=L(uv+(nn*x+t*y)*u_px);s+=kv*v;sk+=kv;n+=1.;}
   float mk=sk/n;float r=0.;for(int j=-4;j<=4;j++)for(int i=-6;i<=6;i++){float x=float(i)*sg*.5;if(abs(x)>3.*sg)continue;float y=float(j)/4.*ln*.5;float kv=-exp(-x*x/(2.*sg*sg))-mk;r+=kv*L(uv+(nn*x+t*y)*u_px);}best=max(best,r/n);}
  return vec4(vec3(clamp(best*u_p3,0.,1.)),1.);`,'Chaudhuri 1989 retinal vessels; PSF correlation for stars');
f = add('Analysis');
f('anscombe','Anscombe Transform (VST)',[S('Direction',['Forward','Inverse']),P('Photon scale',1,255,64,1)],
  `vec3 x=c.rgb*u_p1;float top=2.*sqrt(u_p1+.375);if(u_p0<.5)return vec4(2.*sqrt(x+.375)/top,1.);vec3 y=c.rgb*top;return vec4(clamp((y*y*.25-.375)/u_p1,0.,1.),1.);`,'Poisson → ~Gaussian noise; wrap a denoiser between forward and inverse');
