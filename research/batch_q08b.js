/* ================= q08 (part 2): Fubax Perfect Perspective + luluco250 Flexible CA, Sharp Contrast / Filmic Anamorph Sharpen, DLAA Plus / CMAA2-style AA, Smart DeNoise / Noise Blur, GREYCstoration, PixInsight / Siril astro, depth effects (Daodan / NiceGuy / luluco250), Depth3D anaglyph to SBS ================= */
f = add('Distort');
f('q08_lensproj','Perfect Perspective / Flexible CA',[S('Mode',['Perfect Perspective (Fubax)','Flexible CA translate (luluco250)','Flexible CA scale (luluco250)']),P('Projection k / CA ratio',-1,1,.5,.01),P('FOV / CA amount',.1,1.9,1,.01),P('Zoom',.5,2,1,.01)],
  `int m=int(u_p0+.5);
  if(m==0){float A=asp();float k=u_p1;float om=radians(clamp(90.*u_p2,1.,170.))*.5;float ak=abs(k);float rf=k>.001?tan(ak*om)/A/ak:k<-.001?sin(ak*om)/A/ak:om/A;
   vec2 v=(uv-.5)*2.*vec2(A,1.)/u_p3;float r=length(v);float z=ak*r*rf;if(k<-.001&&z>=1.)return vec4(0.,0.,0.,1.);
   float th=k>.001?atan(z)/ak:k<-.001?asin(z)/ak:r*rf;if(th>=1.57)return vec4(0.,0.,0.,1.);float rs=tan(th)/(tan(om)/A);vec2 s=r>1e-6?v*rs/r:v;vec2 q=s/(2.*vec2(A,1.))+.5;q=1.-abs(1.-mod(q,2.));
   vec3 col=clamp(T(q).rgb,0.,1.);float vg=r>1e-5?sin(th)/r/rf:1.;vec3 l=${LIN('col')}*clamp(vg,0.,1.);return vec4(${SRGB('l')},1.);}
  vec2 ur,ug,ub;vec3 ra=vec3(-1.,0.,1.)*u_p1*2.;
  if(m==1){float mu=u_p2*1.5*u_k;ur=uv+u_px*ra.r*mu;ug=uv+u_px*ra.g*mu;ub=uv+u_px*ra.b*mu;}
  else{float s=1.+u_p2*4.*length(u_px);vec3 rr=mix(vec3(s),vec3(1./s),ra*.5+.5);ur=(uv-.5)*rr.r+.5;ug=(uv-.5)*rr.g+.5;ub=(uv-.5)*rr.b+.5;}
  return vec4(T(ur).r,T(ug).g,T(ub).b,1.);`,
  'Perfect Perspective (Fubax, arXiv:2003.10558 / 2010.04077): input taken as a rectilinear game frame of horizontal FOV 90 x Amount; each output radius is mapped through the azimuthal projection family k (1 rectilinear, 0.5 stereographic, 0 equidistant, -0.5 equisolid, -1 orthographic): theta = atan(k r f)/k (asin for k<0), source radius = tan(theta) / tan(half FOV), natural vignetting sin(theta)/(r f), mirrored edges; the cropping / aximorphic (separate horizontal/vertical k) options are replaced by a Zoom. Flexible CA (luluco250): per-channel translate (ratio -1/0/1 x 1.5 px x amount) or scale about the centre (1 + amount x 4 px-diagonal, lerped to its reciprocal by ratio)');

f = add('Sharpen');
f('q08_sharpcontrast','Sharp Contrast / Filmic Anamorph Sharpen',[S('Method',['Sharp Contrast (Insane)','Filmic Anamorph Sharpen (Fubax)']),P('Strength',0,3,1,.01),P('Offset / edge bias',.1,3,1,.01),P('Clamp',.5,1,.65,.01)],
  `int m=int(u_p0+.5);vec3 x=clamp(c.rgb,0.,1.);
  if(m==0){float SM=max(1023.*pow(2.*u_p2/3.+.333333,4.),1e-10);float sm[6];float sq[6];float sn[6];for(int k=0;k<6;k++){sm[k]=0.;sq[k]=0.;sn[k]=0.;}float mx=0.,mn=SM,ctr=0.;
   for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec3 s=T(uv+vec2(float(i),float(j))*u_k*u_px).rgb;float l=dot(s,vec3(.299,.587,.114));l*=l;
    if(i==0&&j==0){ctr=l;l*=SM;mx=max(mx,l);mn=min(mn,l);for(int k=0;k<6;k++){sm[k]+=l;sq[k]+=l*l;sn[k]+=1.;}}
    else{l*=SM;float an=atan(float(j),float(i))+PI;int se=int(mod(floor(an*6./(2.*PI)),6.));float dd=length(vec2(float(i),float(j)));mx=max(mx,l/dd);mn=min(mn,l*dd);sm[se]+=l;sq[se]+=l*l;sn[se]+=1.;}}
   float em=max(1.-(mx-mn)/max(mx,1e-6),1e-5);float wsm=0.,wt=0.;for(int k=0;k<6;k++){float me=sm[k]/sn[k];float va=(sq[k]-sm[k]*sm[k]/sn[k])/sn[k];float w=min(max(va,1e-5),1e9);w*=w;w*=w;w=1./(1.+w);wsm+=me*w;wt+=w;}
   float kw=wt>1e-30?wsm/wt/SM:ctr;float y=ctr+(ctr-kw)*.667*u_p1*em*1.5;y=sqrt(max(y,0.));
   float cb=dot(x,vec3(-.168736,-.331264,.5)),cr=dot(x,vec3(.5,-.418688,-.081312));return vec4(clamp(vec3(y+1.402*cr,y-.344135*cb-.714136*cr,y+1.772*cb),0.,1.),1.);}
  vec3 src=pow(x,vec3(2.2));float o=.1*u_p2*u_k;vec2 pp=u_px*max(o,1.);float fa=min(o,1.);
  float hp=luma(pow(clamp(T(uv+vec2(0.,pp.y)).rgb,0.,1.),vec3(2.2)))+luma(pow(clamp(T(uv-vec2(0.,pp.y)).rgb,0.,1.),vec3(2.2)))+luma(pow(clamp(T(uv+vec2(pp.x,0.)).rgb,0.,1.),vec3(2.2)))+luma(pow(clamp(T(uv-vec2(pp.x,0.)).rgb,0.,1.),vec3(2.2)));
  hp=.5-.5*(hp*.25-luma(src))*fa;hp=mix(.5,hp,60.*u_p1);hp=clamp(hp,1.-u_p3,u_p3);
  vec3 mA=min(src,vec3(.5)),MA=max(src,vec3(.5));float mB=min(hp,.5),MB=max(hp,.5);vec3 sh=2.*(mA*mB+MA+MB-MA*MB)-1.5;return vec4(pow(clamp(sh,0.,1.),vec3(1./2.2)),1.);`,
  'Sharp Contrast (Insane-Shaders): gamma-squared luma, 7x7 generalised Kuwahara over 6 angular sectors (sector weight 1/(1+var^4) in its x1023 edge-bias scale), edge multiplier 1-(max-min)/max with distance-weighted extremes, y = c + (c - kuwahara) x 0.667 x strength x edge x 1.5, sqrt, recombined with the original Cb/Cr. Filmic Anamorph Sharpen (Fubax): linear-light high pass from 4 neighbours at its 0.1 px offset (bilinear, so the offset scales the response), x60 strength around 0.5, clamped to [1-clamp, clamp] (0.65), overlay-blended per channel');

f = add('Repair');
f('q08_aa','DLAA Plus / CMAA 2 (approx.)',[S('Method',['DLAA Plus (AstrayFX)','CMAA 2 style (approx.)']),P('Short edge / threshold',0,1,.5,.01),P('Long edge mask',0,1,.5,.01),P('Text / black preservation',0,1,.5,.01)],
  [`int m=int(u_p0+.5);vec4 C=T(uv);
  if(m==0){vec3 e=4.*abs(T(uv-vec2(u_px.x,0.)).rgb+T(uv+vec2(u_px.x,0.)).rgb+T(uv+vec2(0.,u_px.y)).rgb+T(uv-vec2(0.,u_px.y)).rgb-4.*C.rgb);return vec4(C.rgb,max(e.r,max(e.g,e.b)));}
  float l=L(uv),lr=L(uv+vec2(u_px.x,0.)),ll=L(uv-vec2(u_px.x,0.)),lt=L(uv+vec2(0.,u_px.y)),lb=L(uv-vec2(0.,u_px.y));float lrr=L(uv+vec2(2.*u_px.x,0.)),ltt=L(uv+vec2(0.,2.*u_px.y));
  float eR=abs(l-lr),eT=abs(l-lt),eL=abs(l-ll),eB=abs(l-lb);float lrt=L(uv+u_px),lrb=L(uv+vec2(u_px.x,-u_px.y)),llt=L(uv+vec2(-u_px.x,u_px.y));
  float thr=.14*u_p1;float lcR=max(max(eT,eB),max(eL,abs(lr-lrr)));lcR=max(lcR,max(abs(lr-lrt),abs(lr-lrb)));float lcT=max(max(eL,eR),max(eB,abs(lt-ltt)));lcT=max(lcT,max(abs(lt-llt),abs(lt-lrt)));
  float fR=step(thr,eR)*step(lcR*.5,eR),fT=step(thr,eT)*step(lcT*.5,eT);return vec4(fR,fT,0.,1.);`,
  `int m=int(u_p0+.5);
  if(m==0){vec4 C=T(uv),Lf=T(uv-vec2(u_px.x,0.)),Rt=T(uv+vec2(u_px.x,0.)),Up=T(uv+vec2(0.,u_px.y)),Dn=T(uv-vec2(0.,u_px.y));float lam=5.*u_p1,hv=2.5*u_p2;
   vec4 cH=2.*(Up+Dn),cV=2.*(Lf+Rt);vec4 dH=abs(cH-4.*C)/4.,dV=abs(cV-4.*C)/4.;vec4 bH=(cH+2.*C)/6.,bV=(cV+2.*C)/6.;
   float LH=max(dH.r,max(dH.g,dH.b)),LV=max(dV.r,max(dV.g,dV.b)),LHB=max(bH.r,max(bH.g,bH.b)),LVB=max(bV.r,max(bV.g,bV.b));
   float sH=step(.5,clamp((lam*LH-.1)/max(LVB,1e-5),0.,1.)),sV=step(.5,clamp((lam*LV-.1)/max(LHB,1e-5),0.,1.));
   vec4 Dl=mix(C,bH,sV);Dl=mix(Dl,bV,sH);float mxc=max(C.r,max(C.g,C.b));float txt=step(.994,mxc)*u_p3,blk=u_p3*.5*(1.-mxc);Dl=mix(Dl,C,txt);Dl=mix(Dl,C,blk);
   vec4 aH=vec4(0.),aV=vec4(0.);for(int i=0;i<4;i++){float o=1.5+2.*float(i);aH+=T(uv+vec2(o*u_px.x,0.))+T(uv-vec2(o*u_px.x,0.));aV+=T(uv+vec2(0.,o*u_px.y))+T(uv-vec2(0.,o*u_px.y));}aH/=8.;aV/=8.;
   float EAH=clamp(aH.a*hv-1.,0.,1.),EAV=clamp(aV.a*hv-1.,0.,1.);
   if(abs(EAH-EAV)>.25){float cl=max(C.r,max(C.g,C.b)),ul=max(Up.r,max(Up.g,Up.b)),dl=max(Dn.r,max(Dn.g,Dn.b)),lfl=max(Lf.r,max(Lf.g,Lf.b)),rl=max(Rt.r,max(Rt.g,Rt.b));
    float LBH=max(aH.r,max(aH.g,aH.b)),LBV=max(aV.r,max(aV.g,aV.b));
    #define Q8SD(v) (abs(v)<1e-4?1e-4:(v))
    vec4 U4=vec4(clamp((LBV-lfl)/Q8SD(cl-lfl),0.,1.),clamp(1.+(LBV-cl)/Q8SD(cl-rl),0.,1.),clamp((LBH-ul)/Q8SD(cl-ul),0.,1.),clamp(1.+(LBH-cl)/Q8SD(cl-dl),0.,1.));
    U4=mix(U4,vec4(1.),vec4(equal(U4,vec4(0.))));vec4 V=mix(Lf,C,U4.x);V=mix(Rt,V,U4.y);vec4 H=mix(Up,C,U4.z);H=mix(Dn,H,U4.w);vec4 sd=Dl;Dl=mix(Dl,V,EAV);Dl=mix(Dl,H,EAH);Dl=mix(Dl,sd,txt);Dl=mix(Dl,sd,blk);}
   return vec4(Dl.rgb,1.);}
  #define Q8EF(o,dd) ((((dd).x+(dd).y)>0.)?(((dd).x!=0.)?T(uv+(o)*u_px).r:T(uv+(o)*u_px).g):(((dd).x!=0.)?T(uv+((o)+(dd))*u_px).r:T(uv+((o)+(dd))*u_px).g))
  vec3 P0=O(uv).rgb;vec3 ad=vec3(0.);float wsu=0.;vec2 NN[4]=vec2[4](vec2(1.,0.),vec2(-1.,0.),vec2(0.,1.),vec2(0.,-1.));
  for(int e=0;e<4;e++){vec2 n=NN[e];vec2 tg=vec2(abs(n.y),abs(n.x));if(Q8EF(vec2(0.),n)<.5)continue;float dl=0.,dr=0.;
   for(int k=1;k<=8;k++){if(Q8EF(-tg*float(k),n)<.5)break;dl+=1.;}for(int k=1;k<=8;k++){if(Q8EF(tg*float(k),n)<.5)break;dr+=1.;}
   vec2 el=-tg*dl,er=tg*dr;float fl=Q8EF(el+n,-tg),nl=Q8EF(el,-tg),fr=Q8EF(er+n,tg),nr=Q8EF(er,tg);
   float cL=fl>.5&&nl<.5?1.:(nl>.5&&fl<.5?-1.:0.),cR=fr>.5&&nr<.5?1.:(nr>.5&&fr<.5?-1.:0.);float Ln=dl+dr+1.,xc=dl+.5,h=0.;
   if(cL!=0.&&cR!=0.){h=cL!=cR?mix(cL,cR,xc/Ln)*.5:cL*.5*abs(1.-2.*xc/Ln);}else if(cL!=0.)h=cL*.5*(1.-xc/Ln);else if(cR!=0.)h=cR*.5*xc/Ln;
   float w=max(-h,0.);ad+=O(uv+n*u_px).rgb*w;wsu+=w;}
  if(wsu>1.){ad/=wsu;wsu=1.;}return vec4(P0*(1.-wsu)+ad,1.);`],
  'DLAA Plus (AstrayFX, after Andreev DLAA GDC 2011): prefilter stores the 4-neighbour edge strength, short-edge pass blends to the 3-tap H/V blur where lambda x contrast exceeds the opposite blur luma (lambda = 5 x short-edge mask), long-edge pass compares 8-tap half-pixel H/V averages of the edge map and slides the pixel toward its neighbours along long edges; text (max channel > 0.994) and dark pixels are preserved. CMAA 2 (approx.): CMAA2-style luma edge detection (threshold 0.07 x 2 x setting, local-contrast adaptation against neighbouring edges), then MLAA-like shape blending: edge runs traced up to 8 px each way, Z / U / L shapes from the crossing edges at both ends, coverage of the reconstructed line at the pixel centre blended with the neighbour across the edge (not the exact Intel shape-handling / deferred-blend compute pipeline)');

f('q08_denoise','Smart DeNoise / Noise Blur',[S('Method',['Smart DeNoise (GShade)','Noise Blur (CShade)']),P('Sigma / radius',.3,5,1.25,.01),P('Threshold',.01,.5,.05,.005),P('Edge falloff',0,1,.6,.01)],
  `int m=int(u_p0+.5);
  if(m==0){float sg=max(u_p1,.3)*u_k;float rad=min(floor(1.5*sg+.5),8.);float th=u_p2;float z=0.;vec3 a=vec3(0.);
   for(int dx=-8;dx<=8;dx++){float fx=float(dx);if(abs(fx)>rad)continue;float pt=sqrt(max(rad*rad-fx*fx,0.));for(int dy=-8;dy<=8;dy++){float fy=float(dy);if(abs(fy)>pt)continue;
    vec2 d=vec2(fx,fy);vec3 w=T(uv+d*u_px).rgb;vec3 dc=w-c.rgb;float fq=exp(-dot(dc,dc)/(2.*th*th))*exp(-dot(d,d)/(2.*sg*sg));z+=fq;a+=fq*w;}}
   return vec4(a/max(z,1e-8),1.);}
  vec2 p=uv*2.-1.;float fall=clamp(length(p)*u_p3*1.2,0.,1.);vec2 hp=floor(uv*u_res)+.5;float nz=6.2831853*fract(52.9829189*fract(dot(hp,vec2(.06711056,.00583715))));
  float cs=cos(nz),sn=sin(nz);vec3 acc=vec3(0.);for(int i=0;i<4;i++)for(int j=0;j<4;j++){vec2 sh=vec2(float(i),float(j))/3.*2.-1.;vec2 dk=vec2(0.);
   if(abs(sh.x)>1e-5||abs(sh.y)>1e-5){float rr,ph;if(abs(sh.x)>abs(sh.y)){rr=sh.x;ph=.785398*(sh.y/sh.x);}else{rr=sh.y;ph=1.570796-.785398*(sh.x/sh.y);}dk=rr*vec2(cos(ph),sin(ph));}
   dk*=fall*u_p1*.4;dk.x*=u_res.y/u_res.x;dk=vec2(dk.x*cs-dk.y*sn,dk.x*sn+dk.y*cs)*3.;acc+=T(uv+dk*.01).rgb;}
  return vec4(acc/16.,1.);`,
  'Smart DeNoise (Michele Morrone, GShade port): circular Gaussian (sigma, radius 1.5 sigma) x Gaussian colour-distance weight (threshold), normalised. Noise Blur (CShade): 4x4 concentric-disk taps rotated per pixel by interleaved gradient noise, radius 0.5 x 3 % of the frame, scaled by a radial falloff that leaves the centre sharp (its vignette mask approximated by a linear radial ramp)');

const Q08_SW = (q, th) => `{vec4 tq=T(${q});float ta=tq.r*4.*65025.,tb=(tq.g-.5)*8.*65025.,td=tq.b*4.*65025.;float tr=ta+td,dq=sqrt((ta-td)*(ta-td)+4.*tb*tb);float l1=.5*(tr+dq),l2=.5*(tr-dq);
   vec2 v1=abs(tb)>1e-6?normalize(vec2(tb,l1-ta)):(ta>=td?vec2(1.,0.):vec2(0.,1.));vec2 v2=vec2(-v1.y,v1.x);float bb=1.+max(l1,0.)+max(l2,0.);float n1=pow(bb,-p1),n2=pow(bb,-p2);sw=n1*v2*dot(v2,${th})+n2*v1*dot(v1,${th});}`;
f('q08_greyc','GREYCstoration (anisotropic LIC smoothing)',[P('Amplitude',0,200,60,1),P('Sharpness',0,2,.7,.01),P('Anisotropy',0,1,.3,.01),P('Alpha (gradient smoothing)',.3,3,.6,.01)],
  [`float sg=max(u_p3,.4)*u_k;vec3 gx=vec3(0.),gy=vec3(0.);float nx=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 o=vec2(float(i),float(j));float w=exp(-dot(o,o)/(2.*sg*sg));vec3 s=O(uv+o*u_px).rgb;gx+=s*o.x*w;gy+=s*o.y*w;nx+=o.x*o.x*w;}
   gx/=nx;gy/=nx;return vec4(dot(gx,gx)/4.,.5+dot(gx,gy)/8.,dot(gy,gy)/4.,1.);`,
   `return blur1d(u_tex,uv,vec2(1.,0.),R(2.2));`,`return blur1d(u_tex,uv,vec2(0.,1.),R(2.2));`,
   `float p1=.5*u_p1,p2=p1/(1e-7+1.-u_p2);float s2a=sqrt(2.*u_p0)*u_k;vec3 acc=O(uv).rgb*1e-3;float wt=1e-3;
   for(int a=0;a<6;a++){float an=float(a)*PI/6.;vec2 th=vec2(cos(an),sin(an));vec2 sw;${Q08_SW('uv','th')}float fs=length(sw)*s2a;if(fs<.25){acc+=O(uv).rgb;wt+=1.;continue;}
    float lmax=2.*fs;float dl=max(.8*u_k,lmax/12.);acc+=O(uv).rgb;wt+=1.;
    for(int sd=-1;sd<=1;sd+=2){vec2 pos=uv;vec2 pd=normalize(sw)*float(sd);float ln=0.;
     for(int k=0;k<12;k++){vec2 wv;{vec2 th2=pd;${Q08_SW('pos','th2').replace('sw=','wv=')}}float wl=length(wv);if(wl<1e-6)break;wv/=wl;if(dot(wv,pd)<0.)wv=-wv;pos+=wv*dl*u_px;pd=wv;ln+=dl;if(ln>lmax)break;
      float g=exp(-ln*ln/(2.*fs*fs));acc+=O(pos).rgb*g;wt+=g;}}}
   return vec4(acc/wt,1.);`],
  'GREYCstoration (Tschumperle, as in PixInsight / CImg blur_anisotropic): colour structure tensor from derivative-of-Gaussian gradients (alpha), tensor smoothed (sigma 1.1), smoothing tensor n1 v2v2 + n2 v1v1 with n = (1+l1+l2)^-p, p1 = sharpness/2 along edges, p2 = p1/(1-anisotropy) across, then line-integral convolution along the tensor field for 6 directions (da = 30 deg, both ways), Gaussian along the streamline with sigma = |T theta| sqrt(2 amplitude), step 0.8 px (one iteration; gradient values in 0..255 units)');

f('q08_astro','Repaired HSV Separation / Siril grey_flat',[S('Mode',['Repaired HSV recombined (PixInsight)','Repaired HSV H channel','Repaired HSV S channel','Repaired HSV V channel','grey_flat CFA equalize RGGB (Siril)','grey_flat BGGR','grey_flat GRBG','grey_flat GBRG']),P('Repair level (V)',.5,1,.9,.005),P('Search radius',2,40,12,1,'px')],
  `int m=int(u_p0+.5);vec3 x=clamp(O(uv).rgb,0.,1.);
  if(m<4){vec3 hv=rgb2hsv(x);float H=hv.x,Sv=hv.y;if(hv.z>=u_p1){vec2 hs=vec2(0.);float ss=0.,ws=0.;for(int r=1;r<=10;r++){float rad=R(u_p2)*float(r)/10.;for(int a=0;a<16;a++){float an=float(a)*.3927+float(r)*.2;vec3 s=clamp(O(uv+vec2(cos(an),sin(an))*rad*u_px).rgb,0.,1.);vec3 sh=rgb2hsv(s);
      if(sh.z<u_p1&&sh.z>.02){float w=sh.y+1e-3;hs+=vec2(cos(sh.x*6.2831853),sin(sh.x*6.2831853))*w;ss+=sh.y*w;ws+=w;}}if(ws>.05)break;}
     if(ws>0.){H=fract(atan(hs.y,hs.x)/6.2831853+1.);Sv=ss/ws;}}
   if(m==1)return vec4(vec3(H),1.);if(m==2)return vec4(vec3(Sv),1.);if(m==3)return vec4(vec3(hv.z),1.);return vec4(hsv2rgb(vec3(H,Sv,hv.z)),1.);}
  int pt=m-4;int CF[16]=int[16](0,1,1,2, 2,1,1,0, 1,0,2,1, 1,2,0,1);vec3 mu=vec3(0.),nn=vec3(0.);
  for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 b=floor((vec2(float(i),float(j))+.5)/16.*u_res*.5)*2.;for(int k=0;k<4;k++){vec2 q=b+vec2(float(k-2*(k/2)),float(k/2));float v=luma(O(vec2((q.x+.5)/u_res.x,1.-(q.y+.5)/u_res.y)).rgb);int ch=CF[pt*4+k];
    if(ch==0){mu.r+=v;nn.r+=1.;}else if(ch==1){mu.g+=v;nn.g+=1.;}else{mu.b+=v;nn.b+=1.;}}}
  mu/=max(nn,vec3(1.));vec2 P=floor(vec2(uv.x,1.-uv.y)*u_res);int k=int(mod(P.y,2.))*2+int(mod(P.x,2.));int ch=CF[pt*4+k];float v=luma(x);float cm=ch==0?mu.r:ch==1?mu.g:mu.b;
  return vec4(vec3(clamp(v*mu.g/max(cm,1e-5),0.,1.)),1.);`,
  'RepairedHSVSeparation (PixInsight script, approx.): HSV split where pixels at or above the repair level (saturated star cores) get hue and saturation rebuilt from the nearest ring of unsaturated pixels (saturation-weighted circular hue mean), V kept; outputs the recombined RGB or a single channel. Siril grey_flat: on a mono CFA (flat) image the mean of the R, G (both greens) and B photosites is measured (16x16 grid of 2x2 cells) and R / B sites are scaled to the green mean, equalizing the CFA channels as Siril does for flats with "equalize CFA"');

f = add('Depth');
const Q08_ATR = (k0, k1, first) => `int m=int(u_p0+.5);${first ? '' : 'if(m!=3)return c;'}
  ${first ? `if(m!=3){vec3 x=c.rgb;float ld=1.-D(uv);
    if(m==0){vec4 pe=vec4(1.-D(uv+vec2(0.,-u_px.y)),1.-D(uv+vec2(0.,u_px.y)),1.-D(uv+vec2(u_px.x,0.)),1.-D(uv-vec2(u_px.x,0.)));vec4 po=vec4(1.-D(uv+vec2(u_px.x,-u_px.y)),1.-D(uv+vec2(-u_px.x,u_px.y)),1.-D(uv+u_px),1.-D(uv-u_px));
     float mnd=min(min(min(pe.x,pe.y),min(pe.z,pe.w)),min(min(po.x,po.y),min(po.z,po.w))),mxd=max(max(max(pe.x,pe.y),max(pe.z,pe.w)),max(max(po.x,po.y),max(po.z,po.w)));float sp=max(mxd-mnd,.05);
     float cc=ld/sp;pe/=sp;po/=sp;vec4 de=abs(pe-cc),dO=abs(po-cc);float lw=max(max(abs(de.x-de.y),abs(de.z-de.w)),max(abs(dO.x-dO.y),abs(dO.z-dO.w)));
     vec3 bg=mix(x,vec3(1.),clamp(u_p3*2.,0.,1.));return vec4(mix(bg,vec3(0.),clamp(lw*u_p1,0.,1.)),1.);}
    if(m==1){float Tt=u_p2*.2;vec2 o4[4]=vec2[4](vec2(0.,1.),vec2(-1.,0.),vec2(1.,0.),vec2(0.,-1.));vec3 C=T(uv+vec2(u_px.x,0.)).rgb;float wg=0.;
     for(int i=0;i<4;i++){vec2 q=uv+o4[i]*u_px;if(ld>1.-D(q)+Tt){wg+=1.;C+=T(q).rgb;}}float W=wg<=1.?0.:wg;return vec4(mix(x,C/(wg+1.),W/4.),1.);}
    float dd=distance(vec2((uv.x-.5)*ld*2.+.5,ld),vec2(.5,u_p3-.5));float fg=smoothstep(0.,max(u_p2*2.,.01),dd)*u_p1;fg=floor(fg*255.+.5)/255.;
    vec2 ip=floor(vec2(uv.x,1.-uv.y)*u_res);float lim=bayer8(ip)+1./64.;fg=fg<lim?0.:1.;vec3 fc=vec3(0.);for(int i=0;i<3;i++)for(int j=0;j<3;j++){if(i==1&&j==1)continue;fc+=O(vec2(float(i),float(j))*.5).rgb;}return vec4(mix(x,fc/8.,fg),1.);}` : ''}
  float ld=1.-D(uv);float RK=${k0}.*clamp(u_p2*${k1}.,0.,1.);vec2 pp=u_px*RK*ld*8.*u_res.y/1080.;vec4 acc=vec4(0.);float det=ld-.1;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q=uv+vec2(float(i),float(j))*pp;if(1.-D(q)>det)acc+=vec4(T(q).rgb,1.);}return vec4(acc.rgb/max(acc.a,1.),1.);`;
f('q08_depthfx','ReShade Depth FX (Mesh Edges / Hole Filler / Retro Fog / Volumetric Fog)',[S('Effect',['Mesh Edges (Daodan)','Hole Filler (NiceGuy)','Retro Fog (luluco250)','Volumetric Fog V2 (NiceGuy)']),P('Strength',0,2,1,.01),P('Radius / threshold / end',0,1,.5,.01),P('Background / start / boost',0,1,.5,.01)],
  [Q08_ATR(81,1,true), Q08_ATR(27,3,false), Q08_ATR(9,9,false), Q08_ATR(3,27,false), Q08_ATR(1,81,false),
   `int m=int(u_p0+.5);if(m!=3)return c;float ld=clamp(1.-D(uv),0.,1.);vec3 col=clamp(T(uv).rgb,0.,1.);float bo=max(u_p3*2.,.05);col=col/((1.+1./bo)-col);
   return vec4(clamp(mix(O(uv).rgb,col,pow(ld,1.-clamp(.5*u_p1,0.,1.))),0.,1.),1.);`],
  'Linear depth = 1 - D (0 near). Mesh Edges (Daodan): 8-neighbour depth normalised by the local span, line weight = max asymmetry of opposite depth differences (catches creases and silhouettes), black lines over white (Background = image / white mix). Hole Filler (NiceGuy): pixels deeper than >= 2 of their 4 neighbours by T (0.1) get those neighbours averaged in. Retro Fog (luluco250): curved distance fog (x spread by depth), quantized to 255 and 1-bit Bayer 8x8 dithered, its auto fog colour (mean of the 8 border points); Start is offset so the default centre sits at the camera (shader start 0.45), depth span floored at 0.05 against 8-bit depth steps. Volumetric Fog V2 (NiceGuy): 5 a-trous 3x3 passes (radii 81/27/9/3/1 x radius x depth x 8 px at 1080p) taking only samples not nearer than depth-0.1, boosted c/(1+1/boost-c), mixed in by depth^(1-power)');

f = add('Analysis');
f('q08_anaglyph2sbs','Anaglyph to Side-by-Side / Top-Bottom (Depth3D)',[S('Glasses',['Red / Cyan','Red / Green','Red / Blue','Green / Magenta','Amber / Blue','Magenta / Cyan']),S('Layout',['Side-by-side L R','Side-by-side R L','Top-bottom L over R','Top-bottom R over L']),S('Output',['Lens colour','Mono']),P('Separation',-.2,.2,0,.001)],
  `int sc=int(u_p0+.5);int ly=int(u_p1+.5);vec2 rs=vec2(uv.x,1.-uv.y);vec2 lu=rs;int ey=0;
  if(ly<2){float x2=rs.x*2.;int pn=x2>=1.?1:0;lu.x=x2-float(pn);ey=ly==1?1-pn:pn;}else{float y2=rs.y*2.;int pn=y2>=1.?1:0;lu.y=y2-float(pn);ey=ly==3?1-pn:pn;}
  vec2 q=lu+(ey==0?vec2(-u_p3*.5,0.):vec2(u_p3*.5,0.));if(q.x<=0.||q.y<=0.||q.x>=1.||q.y>=1.)return vec4(0.,0.,0.,1.);vec3 s=O(vec2(q.x,1.-q.y)).rgb;
  vec3 lv;float mo;
  if(sc==0){lv=ey==0?vec3(s.r,0.,0.):vec3(0.,s.g,s.b);mo=ey==0?s.r:(s.g+s.b)*.5;}else if(sc==1){lv=ey==0?vec3(s.r,0.,0.):vec3(0.,s.g,0.);mo=ey==0?s.r:s.g;}
  else if(sc==2){lv=ey==0?vec3(s.r,0.,0.):vec3(0.,0.,s.b);mo=ey==0?s.r:s.b;}else if(sc==3){lv=ey==0?vec3(0.,s.g,0.):vec3(s.r,0.,s.b);mo=ey==0?s.g:(s.r+s.b)*.5;}
  else if(sc==4){lv=ey==0?vec3(s.r,s.g,0.):vec3(0.,0.,s.b);mo=ey==0?(s.r+s.g)*.5:s.b;}else{lv=ey==0?vec3(s.r,0.,s.b):vec3(0.,s.g,s.b);mo=ey==0?(s.r+s.b)*.5:(s.g+s.b)*.5;}
  return vec4(u_p2>.5?vec3(mo):lv,1.);`,
  'Depth3D Anaglyph_to_SBS_or_TAB: splits an anaglyph into its two eye views by the glasses filter pair (lens-filtered colour or the scheme mono intensity), packed side-by-side or top-and-bottom (optionally swapped), each eye shifted by half the horizontal separation; zoom / stretch / custom luma weights omitted');
