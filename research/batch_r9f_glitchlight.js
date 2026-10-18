/* ================= Round 9F: glitch suite, sorting, lighting & depth effects ================= */
f = add('Retro');
f('glitchsuite','Glitch Suite',[S('Mode',['Scanline displacement','Block shift (macroblock)','Bit crush','Byte corruption','Wave interference','Signal noise bars','Channel feedback smear']),P('Amount',0,1,.5,.01),P('Block size',2,64,16,1,'px'),P('Variation',0,1,.5,.01)],
  `int m=int(u_p0+.5);vec2 p=PX(uv);float a=u_p1;vec3 o=c.rgb;float sd=floor(u_p3*97.);
  if(m==0){float ln=floor(p.y/max(R(u_p2*.25),1.));float h=hash(vec2(ln,sd));float sh=h>1.-a*.6?(hash(vec2(ln,sd+3.))-.5)*.3*a:0.;o=T(vec2(fract(uv.x+sh),uv.y)).rgb;}
  else if(m==1){float B=max(R(u_p2),2.);vec2 b=floor(p/B);float h=hash(b+sd);if(h>1.-a*.5){vec2 src=b+floor((vec2(hash(b+sd+1.),hash(b+sd+2.))-.5)*6.);vec2 q=fromPX((src+fract(p/B))*B);o=floor(T(q).rgb*mix(16.,4.,a))/mix(16.,4.,a);}}
  else if(m==2){float bits=floor(mix(8.,1.,a));float lv=exp2(bits);ivec3 v=ivec3(c.rgb*255.);int msk=int(255.-(256./lv-1.));o=vec3(v&ivec3(msk))/255.;if(u_p3>.5)o=vec3((v^ivec3(int(hash(floor(p/8.))*255.)))&ivec3(msk))/255.;}
  else if(m==3){float W=u_res.x;float idx=floor(p.y)*W+floor(p.x);float run=floor(idx/max(R(u_p2)*8.,8.));float h=hash(vec2(run,sd));if(h>1.-a*.35){int k=int(hash(vec2(run,sd+5.))*4.);o=k==0?o.brg:k==1?1.-o:k==2?fract(o+.5):T(vec2(fract(uv.x+.05),uv.y)).rgb;}}
  else if(m==4){float w=sin(uv.y*u_res.y*.5*(.2+u_p3)+uv.x*30.);o=T(vec2(uv.x+w*.004*a,uv.y)).rgb+vec3(.1,-.05,.1)*w*a*.6;}
  else if(m==5){float bnd=floor(uv.y*mix(8.,40.,u_p3));float h=hash(vec2(bnd,sd));if(h>1.-a*.4){float n=hash(p+sd);o=mix(o,vec3(n),.7)+.15;o.rg*=.9;}}
  else{vec3 acc=vec3(0.),w=vec3(0.);for(int k=0;k<24;k++){float fk=float(k);vec3 dec=exp(-fk/vec3(R(u_p2)*.6,R(u_p2)*.35,R(u_p2)*.2)*vec3(1.));vec3 sv=T(uv-vec2(fk*u_px.x*(1.+a*3.),0.)).rgb;acc+=sv*dec;w+=dec;}o=mix(o,acc/w,a);}
  return vec4(clamp(o,0.,1.),1.);`,'deterministic per Variation (seed)');
f('slitscan','Slit-Scan',[S('Direction',['Horizontal','Vertical','Radial']),P('Slit position',0,1,.5,.01),P('Streak',0,1,.6,.01),P('Warp',0,1,.3,.01)],
  `int m=int(u_p0+.5);vec2 q=uv;if(m==0){float d=uv.x-u_p1;q.x=u_p1+d*(1.-u_p2)+sin(uv.y*12.)*u_p3*.03*sign(d);}else if(m==1){float d=uv.y-u_p1;q.y=u_p1+d*(1.-u_p2)+sin(uv.x*12.)*u_p3*.03*sign(d);}
  else{vec2 v=(uv-.5)*vec2(asp(),1.);float r=length(v),an=atan(v.y,v.x);float rr=mix(r,u_p1*.5,u_p2)+sin(an*6.)*u_p3*.03;q=vec2(cos(an),sin(an))*rr/vec2(asp(),1.)+.5;}return vec4(T(clamp(q,0.,1.)).rgb,1.);`,'single-image slit stretch');
f('huesort','Windowed Pixel Sort (by Hue / Luma / Saturation)',[S('Key',['Hue','Luminance','Saturation']),P('Window',4,32,16,1,'px'),S('Direction',['Horizontal','Vertical']),P('Threshold (skip dark)',0,.5,.05,.01)],
  `int m=int(u_p0+.5);float N=floor(u_p1);bool hz=u_p2<.5;float pos=hz?PX(uv).x:PX(uv).y;float w0=floor(pos/N)*N;int idx=int(pos-w0);vec3 sv[32];float ky[32];
  for(int k=0;k<32;k++){if(float(k)>=N)break;vec2 pp=hz?vec2(w0+float(k)+.5,PX(uv).y):vec2(PX(uv).x,w0+float(k)+.5);vec3 v=T(fromPX(pp)).rgb;sv[k]=v;vec3 hv=rgb2hsv(v);ky[k]=luma(v)<u_p3?-1.+luma(v):m==0?hv.x:m==1?luma(v):hv.y;}
  for(int k=0;k<32;k++){if(float(k)>=N)break;int rk=0;for(int q=0;q<32;q++){if(float(q)>=N)break;rk+=(ky[q]<ky[k]||(ky[q]==ky[k]&&q<k))?1:0;}if(rk==idx)return vec4(sv[k],1.);}return c;`,'exact sort inside fixed windows (GPU-friendly pixel sorting)');
f = add('Distort');
f('mirrortiles','Mirror Tiles',[P('Columns',1,12,3,1),P('Rows',1,12,3,1),P('Source zoom',.2,1,.5,.01),S('Flip',['Alternate (mirror)','Rotate 180°','None'])],
  `vec2 g=vec2(u_p0,u_p1);vec2 t=floor(uv*g),f_=fract(uv*g);int m=int(u_p3+.5);if(m==0){if(mod(t.x,2.)>.5)f_.x=1.-f_.x;if(mod(t.y,2.)>.5)f_.y=1.-f_.y;}else if(m==1&&mod(t.x+t.y,2.)>.5)f_=1.-f_;
  return vec4(T(.5+(f_-.5)*u_p2).rgb,1.);`,'tiled, mirrored crop of the centre');
f('refraction','Refraction (Normal-Based) / Dispersion',[P('Strength',0,60,6,.5,'px'),P('Dispersion',0,1,.3,.01),P('Bump scale',1,20,4,.5,'px'),S('Normal source',['Luminance','Inverted luminance'])],
  `float e=R(u_p2);float s=u_p3>.5?-1.:1.;vec2 g=vec2(L(uv+vec2(e*u_px.x,0.))-L(uv-vec2(e*u_px.x,0.)),L(uv+vec2(0.,e*u_px.y))-L(uv-vec2(0.,e*u_px.y)))*s;vec2 d=g*R(u_p0)*u_px*4.;
  return vec4(T(uv+d*(1.-u_p1*.5)).r,T(uv+d).g,T(uv+d*(1.+u_p1*.5)).b,1.);`,'glass-like refraction from a height field; per-channel IOR = dispersion');
f('heathaze','Heat Haze / Mirage / Underwater',[S('Mode',['Heat haze','Mirage','Underwater wobble']),P('Strength',0,1,.5,.01),P('Scale',.2,4,1,.01),P('Horizon',0,1,.35,.01)],
  `int m=int(u_p0+.5);vec2 p=PX(uv)/R(40.)/u_p2;vec2 o=vec2(0.);vec3 col;if(m==0){float k=smoothstep(.8,0.,uv.y);o=(vec2(fbm(p+vec2(0.,uv.y*8.)),fbm(p*1.3+5.))-.5)*.02*u_p1*k;col=T(uv+o).rgb;}
  else if(m==1){if(uv.y<u_p3){float d=u_p3-uv.y;vec2 r=vec2(uv.x+(fbm(p*2.)-.5)*.02*u_p1,u_p3+d*1.5);col=mix(T(uv).rgb,T(clamp(r,0.,1.)).rgb,smoothstep(0.,.08,d)*u_p1*smoothstep(.35,0.,d));}else col=T(uv+vec2((fbm(p)-.5)*.004*u_p1,0.)).rgb;}
  else{o=vec2(sin(uv.y*25./u_p2+uv.x*4.),cos(uv.x*22./u_p2))*.006*u_p1;col=T(uv+o).rgb;float cs=pow(abs(sin(p.x*3.+fbm(p)*6.)*sin(p.y*3.)),6.);col=col*vec3(.7,.95,1.05)+vec3(0.,.04,.06)+cs*.15*u_p1;}
  return vec4(clamp(col,0.,1.),1.);`,'refractive shimmer and reflections');
f = add('Render');
f('lensfx','Lens Optics (Star / Spikes / Anamorphic / Dirt)',[S('Effect',['Star filter (cross-screen)','Diffraction spikes','Anamorphic streak','Lens dirt']),P('Threshold',.5,1,.8,.01),P('Length',10,300,90,1,'px'),P('Intensity',0,3,1,.01)],
  `int m=int(u_p0+.5);vec3 acc=vec3(0.);float L_=R(u_p2);
  if(m==3){vec3 b=vec3(0.);for(int k=0;k<16;k++){float a=float(k)*.3927;b+=T(uv+vec2(cos(a),sin(a))*L_*.5*u_px).rgb;}b/=16.;vec2 p=PX(uv)/R(30.);float dirt=smoothstep(.55,.85,fbm(p))*.8+smoothstep(.9,.97,hash(floor(p*3.)))*.6;return vec4(clamp(c.rgb+max(b-u_p1*.6,0.)*dirt*u_p3*2.,0.,1.),1.);}
  int nd=m==0?4:m==1?2:1;for(int d=0;d<4;d++){if(d>=nd)break;float a=m==2?0.:m==1?float(d)*1.5708+.785:float(d)*.785;vec2 dir=vec2(cos(a),sin(a));
   for(int k=1;k<=24;k++){float t=float(k)/24.;for(int sg=-1;sg<=1;sg+=2){vec3 s=T(uv+dir*float(sg)*t*L_*u_px).rgb;vec3 br=max(s-u_p1,0.)/(1.-u_p1+1e-3);float w=exp(-t*(m==1?2.:3.5));vec3 tint=m==2?vec3(.3,.55,1.):m==1?mix(vec3(1.),vec3(.8+.2*sin(t*20.),.9,1.-.2*sin(t*20.)),.6):vec3(1.);acc+=br*w*tint;}}}
  return vec4(clamp(c.rgb+acc/24.*u_p3*(m==2?2.5:1.2),0.,1.),1.);`,'gathered streaks from bright pixels');
f('caustics','Caustics',[P('Scale',5,200,60,1,'px'),P('Intensity',0,2,.7,.01),P('Sharpness',1,8,4,.1),P('Phase',0,6.28,0,.01)],
  `vec2 p=PX(uv)/R(u_p0);float v=0.;vec2 q=p;for(int i=0;i<4;i++){float t=u_p3+float(i)*1.7;q+=vec2(sin(q.y*1.3+t),cos(q.x*1.1-t))*.6;v+=abs(sin(q.x+q.y)*cos(q.x-q.y));}v=pow(clamp(1.-v/4.,0.,1.),u_p2);
  return vec4(clamp(c.rgb*(1.+v*u_p1*1.5)+v*u_p1*.15*vec3(.8,.95,1.),0.,1.),1.);`,'procedural light caustics over the image');
f('sss','Subsurface Scattering (approx.)',[P('Radius',1,30,8,.5,'px'),P('Amount',0,1,.5,.01),P('Red spread',1,4,2.5,.05)],
  `vec3 acc=vec3(0.),ws=vec3(0.);for(int k=0;k<24;k++){float fk=float(k);float a=fk*2.39996;float r=sqrt((fk+.5)/24.);vec2 o=vec2(cos(a),sin(a))*r;vec3 rad=R(u_p0)*vec3(u_p2,1.,.6);
   vec3 s=vec3(T(uv+o*rad.r*u_px).r,T(uv+o*rad.g*u_px).g,T(uv+o*rad.b*u_px).b);vec3 w=exp(-r*r*vec3(1.5,3.,5.));acc+=s*w;ws+=w;}vec3 diff=acc/ws;return vec4(mix(c.rgb,max(c.rgb,diff*vec3(1.05,1.,.98)),u_p1),1.);`,'per-channel diffusion profile (red travels furthest)');
f = add('Tone');
f('eyeadapt','Local Eye Adaptation',[P('Radius',10,300,90,1,'px'),P('Strength',0,1,.6,.01),P('Key',.05,.5,.18,.01)],
  [`return vec4(vec3(log(max(luma(${LIN('O(uv).rgb')}),1e-4))),1.);`,BH('u_p0'),BV('u_p0'),
   `vec3 l=${LIN('O(uv).rgb')};float La=exp(T(uv).r);vec3 y=clamp(l*pow(u_p2/La,u_p1),0.,1.);return vec4(${SRGB('y')},1.);`],'exposure normalised to local adapted luminance');
f = add('Depth');
f('ssao2','Screen-Space AO (HBAO / GTAO)',[S('Method',['HBAO (horizon angles)','GTAO (cosine-weighted)']),P('Radius',4,80,24,1,'px'),P('Depth scale',.1,4,1,.01),S('Output',['AO over image','AO only'])],
  `float z=D(uv)*u_p2;float ao=0.;for(int d=0;d<8;d++){float a=float(d)*.785+.39;vec2 dir=vec2(cos(a),sin(a));float mh=-1.;for(int s=1;s<=8;s++){float r=float(s)/8.*R(u_p1);float dz=D(uv+dir*r*u_px)*u_p2-z;float h=dz/(r/u_res.y*8.+1e-4);mh=max(mh,h/sqrt(1.+h*h));}
   float sh=max(mh,0.);ao+=u_p0<.5?sh:sh*sh*1.4;}ao=clamp(1.-ao/8.,0.,1.);return vec4(u_p3>.5?vec3(ao):c.rgb*ao,1.);`,'from the depth map (D: 1 = near)');
f('depthshadow','Screen-Space Shadows (from Depth)',[P('Light azimuth',0,360,135,1,'°'),P('Light elevation',3,80,25,1,'°'),P('Length',10,300,90,1,'px'),P('Darkness',0,1,.55,.01)],
  `float az=radians(u_p0);vec2 dir=vec2(cos(az),sin(az));float z=D(uv);float tl=tan(radians(u_p1));float sh=0.;for(int s=1;s<=32;s++){float t=float(s)/32.;float r=t*R(u_p2);vec2 q=uv+dir*r*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;float rise=r/u_res.y*tl*4.;if(D(q)>z+rise+.01){sh=max(sh,1.-t*.6);}}
  return vec4(c.rgb*(1.-sh*u_p3),1.);`,'rays marched toward the light through the depth field');
f('volumelight','Volumetric Light (Depth-Aware)',[P('Light X',0,1,.5,.01),P('Light Y',0,1,.8,.01),P('Density',0,1,.6,.01),P('Far threshold',0,1,.85,.01)],
  `vec2 lp=vec2(u_p0,u_p1);vec2 d=(uv-lp)/48.;vec2 q=uv;float il=1.;vec3 acc=vec3(0.);for(int k=0;k<48;k++){q-=d;float far=1.-D(q);float em=smoothstep(u_p3,u_p3+.1,far);acc+=T(q).rgb*em*il;il*=.965;}
  return vec4(clamp(c.rgb+acc/48.*u_p2*2.5,0.,1.),1.);`,'god rays: only far (sky) pixels emit, near pixels occlude');
f('rimlight','Rim / Fresnel Light (from Depth)',[S('Mode',['Rim light','Fresnel glow']),P('Width',.5,8,3,.05),P('Intensity',0,2,.8,.01),P('Hue',0,360,200,1,'°')],
  `float e=1.5;vec2 g=vec2(D(uv+vec2(e*u_px.x,0.))-D(uv-vec2(e*u_px.x,0.)),D(uv+vec2(0.,e*u_px.y))-D(uv-vec2(0.,e*u_px.y)))*40.;vec3 n=normalize(vec3(-g,1.));float fr=pow(1.-n.z,8./u_p1);
  vec3 col=hsv2rgb(vec3(u_p3/360.,u_p0>.5?.6:.15,1.));float near=smoothstep(.1,.4,D(uv));return vec4(clamp(c.rgb+col*fr*u_p2*(u_p0>.5?1.:near),0.,1.),1.);`,'edge light from depth normals');
f('depthfx','Depth Effects',[S('Effect',['Depth edges','Depth contour lines','Depth-based saturation','Depth curvature','Tilt-shift from depth']),P('Amount',0,1,.6,.01),P('Focus depth',0,1,.6,.01),P('Spacing / radius',2,40,12,.5)],
  `int m=int(u_p0+.5);float z=D(uv);vec2 e=u_px*1.5;float zx=D(uv+vec2(e.x,0.))-D(uv-vec2(e.x,0.)),zy=D(uv+vec2(0.,e.y))-D(uv-vec2(0.,e.y));
  if(m==0){float ed=smoothstep(.035,.09,length(vec2(zx,zy))*(.5+u_p1*4.));return vec4(mix(c.rgb,vec3(0.),ed),1.);}
  if(m==1){float bands=u_p3;float v=fract(z*bands);float ln=smoothstep(.06,0.,min(v,1.-v)/max(length(vec2(zx,zy))*bands*8.,.02));return vec4(mix(c.rgb,vec3(1.,.9,.2),ln*u_p1),1.);}
  if(m==2){vec3 hv=rgb2hsv(c.rgb);hv.y*=mix(1.-u_p1,1.+u_p1,smoothstep(u_p2-.3,u_p2+.3,z));return vec4(hsv2rgb(clamp(hv,0.,1.)),1.);}
  if(m==3){float lap=D(uv+vec2(e.x,0.))+D(uv-vec2(e.x,0.))+D(uv+vec2(0.,e.y))+D(uv-vec2(0.,e.y))-4.*z;return vec4(vec3(clamp(.5+lap*40.*u_p1,0.,1.)),1.);}
  float rad=abs(z-u_p2)*R(u_p3)*2.*u_p1;vec3 acc=vec3(0.);for(int k=0;k<24;k++){float fk=float(k);float a=fk*2.39996;float r=sqrt((fk+.5)/24.)*rad;acc+=T(uv+vec2(cos(a),sin(a))*r*u_px).rgb;}return vec4(acc/24.,1.);`,'utilities driven by the depth map');
