/* ================= q41: Inkscape filter presets (filters.svg chains), VapourSynth / FFmpeg / Wolfram / OBS leftovers (round 17) ================= */
// SVG filter-primitive toolkit (premultiplied RGBA like the SVG spec). sh = uniform holding the Shape option, sc = uniform holding Scale.
const Q41_HDR = (sh, sc) => `
#define Q41SC (${sc})
#define Q41SH (${sh})
#define Q41A(C) (Q41SH<.5?1.:Q41SH<1.5?clamp(1.-luma(C),0.,1.):clamp(luma(C),0.,1.))
#define Q41PM(V) vec4((V).rgb*(V).a,(V).a)
#define Q41UN(V) vec4((V).a>1e-5?(V).rgb/(V).a:vec3(0.),(V).a)
#define Q41SRC(Q) Q41PM(vec4(O(Q).rgb,Q41A(O(Q).rgb)))
#define Q41OVER(A,B) ((A)+(B)*(1.-(A).a))
#define Q41IN(A,B) ((A)*(B).a)
#define Q41OUT(A,B) ((A)*(1.-(B).a))
#define Q41ATOP(A,B) ((A)*(B).a+(B)*(1.-(A).a))
#define Q41XOR(A,B) ((A)*(1.-(B).a)+(B)*(1.-(A).a))
#define Q41CL(V) vec4(min((V).rgb,vec3((V).a)),(V).a)
#define Q41ARI(A,B,K1,K2,K3,K4) Q41CL(clamp((K1)*(A)*(B)+(K2)*(A)+(K3)*(B)+(K4),0.,1.))
#define Q41MUL(A,B) vec4((1.-(A).a)*(B).rgb+(1.-(B).a)*(A).rgb+(A).rgb*(B).rgb,1.-(1.-(A).a)*(1.-(B).a))
#define Q41SCR(A,B) vec4((A).rgb+(B).rgb-(A).rgb*(B).rgb,1.-(1.-(A).a)*(1.-(B).a))
#define Q41DRK(A,B) vec4(min((1.-(A).a)*(B).rgb+(A).rgb,(1.-(B).a)*(A).rgb+(B).rgb),1.-(1.-(A).a)*(1.-(B).a))
#define Q41NRM(A,B) vec4((1.-(A).a)*(B).rgb+(A).rgb,1.-(1.-(A).a)*(1.-(B).a))
#define Q41AM(V,M,K) Q41PM(vec4(Q41UN(V).rgb,clamp((M)*(V).a+(K),0.,1.)))
#define Q41FIN(V) vec4(clamp((V).rgb+1.-(V).a,0.,1.),1.)
#define Q41U(Q) (PX(Q)/Q41SC)
#define Q41D(V) ((V)*u_k*Q41SC*u_px)
#define Q41DSP(Q,SCL,MX,MY) ((Q)+Q41D((SCL)*vec2((MX)-.5,.5-(MY))))
#define Q41H(I,F_,K) dot(vec2(cos(6.2832*hash((I)+(K))),sin(6.2832*hash((I)+(K)))),(F_))
#define Q41GN(P,K,OUT) {vec2 i_=floor(P),f_=fract(P),w_=f_*f_*(3.-2.*f_);OUT=mix(mix(Q41H(i_,f_,K),Q41H(i_+vec2(1.,0.),f_-vec2(1.,0.),K),w_.x),mix(Q41H(i_+vec2(0.,1.),f_-vec2(0.,1.),K),Q41H(i_+vec2(1.),f_-vec2(1.),K),w_.x),w_.y);}
#define Q41TB(P,FR,OCT,TY,SD,C0,OUT) {OUT=vec4(0.);float am_=1.;vec2 pp_=(P)*(FR);for(int o_=0;o_<9;o_++){if(o_>=(OCT))break;for(int c_=0;c_<4;c_++){if(c_<(C0))continue;float n_;Q41GN(pp_,vec2(float(c_)*71.37+float(SD)*13.71,float(o_)*37.13+float(SD)*5.37),n_);OUT[c_]+=((TY)>0?abs(n_):n_)*am_;}pp_*=2.;am_*=.5;}if((TY)==0)OUT=OUT*.5+.5;OUT=clamp(OUT,0.,1.);}
#define Q41NRM9(C,SS,N) {vec2 d_=Q41D(vec2(1.));float t_[9];for(int j_=0;j_<9;j_++){vec2 q_=(C)+vec2(float(j_%3-1),float(1-j_/3))*d_;float a_;Q41AF(q_,a_);t_[j_]=a_;}N=normalize(vec3(-(SS)*.25*((t_[2]+2.*t_[5]+t_[8])-(t_[0]+2.*t_[3]+t_[6])),-(SS)*.25*((t_[6]+2.*t_[7]+t_[8])-(t_[0]+2.*t_[1]+t_[2])),1.));}
#define Q41LD(AZ,EL) vec3(cos(radians(AZ))*cos(radians(EL)),sin(radians(AZ))*cos(radians(EL)),sin(radians(EL)))
#define Q41DIF(N,L,KD,COL) vec4((KD)*max(dot(N,L),0.)*(COL),1.)
#define Q41SPC(N,L,KS,EX,COL,OUT) {vec3 s_=(KS)*pow(max(dot(N,normalize((L)+vec3(0.,0.,1.))),0.),EX)*(COL);s_=clamp(s_,0.,1.);OUT=vec4(s_,max(s_.r,max(s_.g,s_.b)));}
`;
// separable Gaussian with a different sigma (user px) per channel; sw = swizzle of T read (lets one channel feed two blurs)
const Q41_B3 = (dir, sig, sw) => `vec3 sg=max(vec3(${sig})*u_k*u_p1,vec3(.05));float st=max(1.,max(sg.x,max(sg.y,sg.z))*3./24.);vec3 a=vec3(0.),w=vec3(0.);for(int i=-24;i<=24;i++){float x=float(i)*st;vec3 g=exp(-x*x/(2.*sg*sg));a+=T(uv+${dir}*x*u_px).${sw}*g;w+=g;}return vec4(a/w,1.);`;
const Q41_SHAPE = (d) => S('Shape (alpha)', ['Whole image', 'Dark lines (1 - luma)', 'Bright areas (luma)'], d);
const Q41_NOTE = 'port of the Inkscape share/filters/filters.svg primitive chain (premultiplied SVG compositing in sRGB); feTurbulence is emulated by Perlin-style gradient noise with the same baseFrequency / numOctaves / type (not the SVG reference lattice, so patterns differ in detail); a photo has no shape alpha, so Shape picks the alpha the chain sees (whole image, dark lines or bright areas) and the result is shown over white paper; Scale multiplies all lengths';

f = add('Materials');
f('q41_ink_tex_a','Inkscape Textures I (Rough Paper / Silk Carpet / Oil Slick / Garden of Delights / Tartan / Blue Cheese)',
  [S('Preset',['Rough Paper','Silk Carpet','Oil Slick','Garden of Delights','Tartan','Blue Cheese']),Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  `${Q41_HDR('u_p1','u_p2')}int m=int(u_p0+.5);vec4 S0=Q41SRC(uv);vec4 res=S0;
 if(m==0){vec4 t4;Q41TB(Q41U(uv),vec2(.04),5,0,0,0,t4);vec4 r3=Q41SRC(Q41DSP(uv,10.,t4.r,t4.g));
#define Q41AF(Q,OUT) {vec4 v_;Q41TB(Q41U(Q),vec2(.04),5,0,0,3,v_);OUT=v_.a;}
  vec3 N;Q41NRM9(uv,2.,N);vec4 r1=Q41DIF(N,Q41LD(235.,40.),1.,vec3(233.,230.,215.)/255.);vec4 r2=Q41IN(r3,r1);vec4 r5=Q41ARI(r2,r1,1.7,0.,0.,0.);res=Q41NRM(r5,r3);}
 else if(m==1){vec4 t7;Q41TB(Q41U(uv),vec2(.08,.05),3,0,7,0,t7);vec2 q=Q41DSP(uv,3.,t7.r,t7.g);vec4 r3=vec4(0.);
  for(int j=0;j<9;j++){vec2 qq=q+Q41D(1.3*vec2(float(j%3-1),float(j/3-1)));vec4 tt;Q41TB(Q41U(qq),vec2(.01,.11),2,1,10,3,tt);r3=max(r3,Q41OUT(Q41SRC(qq),vec4(min(tt.a*1.3,1.))));}
  vec4 r2=Q41ARI(r3,r3,1.,1.,0.,0.);res=Q41NRM(r2,r3);}
 else if(m==2){vec4 t91;Q41TB(Q41U(uv),vec2(.121),2,1,0,0,t91);vec2 q=Q41DSP(uv,18.5,t91.r,t91.a);vec4 r3=vec4(0.);
  for(int j=0;j<25;j++){vec2 qq=q+Q41D(1.35*vec2(float(j%5-2),float(j/5-2)));vec4 tt;Q41TB(Q41U(qq),vec2(.143),5,0,0,0,tt);r3=max(r3,Q41AM(Q41PM(tt),5.,-3.));}
  res=Q41ATOP(r3,S0);}
 else if(m==3){
#define Q41G3(Q,OUT) {vec4 v_;Q41TB(Q41U(Q),vec2(.005,.01),8,0,20,3,v_);OUT=vec4(clamp(1.2*v_.a-.4,0.,1.));}
#define Q41FB(Q,OUT) {vec4 e1_,e2_,e3_;vec2 dd_=Q41D(vec2(1.,-1.));Q41G3((Q)+dd_,e1_);Q41G3(Q,e2_);Q41G3((Q)-dd_,e3_);OUT=Q41ATOP(Q41CL(clamp(1.5*e1_+e2_-.5*e3_,0.,1.)),Q41SRC(Q));}
  vec4 t5;Q41TB(Q41U(uv),vec2(.027,.025),7,1,20,0,t5);vec4 r5=Q41UN(Q41AM(Q41PM(t5),4.7,-2.));vec2 q=Q41DSP(uv,48.,r5.r,r5.a);
  vec4 fq;Q41FB(q,fq);vec4 tq;Q41TB(Q41U(q),vec2(.027,.025),7,1,20,3,tq);vec4 r4=fq*clamp(4.7*tq.a-2.,0.,1.);
  vec4 r2=vec4(vec3(222.,217.,217.)/255.,1.)*r4.a;vec4 fb;Q41FB(uv,fb);vec4 r91=Q41ATOP(r2,fb);res=Q41DRK(r91,r91);}
 else if(m==4){vec4 t0,t3;Q41TB(Q41U(uv),vec2(0.,.184),1,1,5,0,t0);Q41TB(Q41U(uv),vec2(.285,0.),1,1,57,0,t3);
  vec4 r0=Q41PM(t0),r3=Q41PM(t3);vec4 r1=Q41OVER(r3,r0);vec4 r2=Q41OVER(r0,r1);res=Q41IN(S0,r2);}
 else{vec4 r1=vec4(0.);float wt=0.;for(int j=0;j<9;j++){vec2 o=vec2(float(j%3-1),float(j/3-1));float w=exp(-dot(o,o)*.5);vec4 tt;Q41TB(Q41U(uv+Q41D(o)),vec2(.063),2,1,0,3,tt);float a=clamp(1.-10.*tt.a,0.,1.);r1+=vec4(0.,.5*a,.5*a,a)*w;wt+=w;}r1/=wt;
  vec4 t0;Q41TB(Q41U(uv),vec2(.031),3,0,0,3,t0);res=Q41ATOP(r1*clamp(2.*t0.a-.5,0.,1.),S0);}
 return Q41FIN(res);`,
  'Inkscape Textures presets: ' + Q41_NOTE + '. Rough Paper f071 (fractal noise .04 x5 displaces the image by 10, diffuse light az 235 el 40 tinted (233,230,215), arithmetic k1 1.7); Silk Carpet f053 (turbulence .01/.11 alpha x1.3 cuts the image (out), dilate 1.3, displaced by fractal noise .08/.05 scale 3, k1 = k2 = 1 self-arithmetic; the 0.5 px blur of the displacement noise is omitted); Oil Slick f013 (fractal noise .143 alpha 5a-3, dilate 2.7, displaced R/A by turbulence .121 x18.5, atop the image); Garden of Delights f097 (white fractal blobs 1.2a-.4 sharpened by the 3x3 kernel 3/2/-1 diagonal / 2, atop the image, displaced 48 by turbulence .027/.025 alpha 4.7a-2, grey flood (222,217,217) atop, darken); Tartan f078 (two 1-octave turbulences, horizontal .184 and vertical .285, merged and used as the image alpha); Blue Cheese f029 (turbulence .063 spots (0,.5,.5) where alpha < .1, blur 1, masked by fractal noise .031, atop the image)',1);

f = add('Render');
f('q41_ink_tex_b','Inkscape Textures II (Carnaval / Growing Cells / People / Scotland / Dots and Canvas Transparency)',
  [S('Preset',['Carnaval','Growing Cells','People','Scotland','Dots Transparency','Canvas Transparency']),Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  `${Q41_HDR('u_p1','u_p2')}int m=int(u_p0+.5);vec4 S0=Q41SRC(uv);vec4 res=S0;
 if(m==0){vec4 t7;Q41TB(Q41U(uv),vec2(.025,.028),5,1,3,0,t7);vec4 r6=Q41UN(Q41IN(S0,Q41PM(t7)));vec2 q=Q41DSP(uv,40.,r6.r,r6.a);
  vec4 tq;Q41TB(Q41U(q),vec2(.025,.028),5,1,3,3,tq);vec4 r2=vec4(clamp(6.*tq.a-2.4,0.,1.));vec4 r11=Q41NRM(r2*S0.a,S0);res=Q41MUL(r11,r11);}
 else if(m==1){vec4 r5=vec4(0.);float wt=0.;
  for(int j=0;j<25;j++){vec2 o=2.*vec2(float(j%5-2),float(j/5-2));float w=exp(-dot(o,o)/8.);vec4 tt;Q41TB(Q41U(uv+Q41D(o)),vec2(.1),3,0,0,0,tt);float a=clamp(20.*tt.a-12.,0.,1.);r5+=vec4(vec3(dot(tt.rgb,vec3(.213,.715,.072))*a),a)*w;wt+=w;}r5/=wt;
  vec4 r3=Q41ARI(Q41AM(r5,10.,-.1),S0,.8,1.,0.,0.);vec4 t7;Q41TB(Q41U(uv),vec2(.1),3,0,0,0,t7);vec4 r8=vec4(vec3(dot(t7.rgb,vec3(.213,.715,.072))*t7.a),t7.a);
  vec4 r9=Q41NRM(Q41ATOP(r3,r8),S0);res=Q41ATOP(r9,S0);}
 else if(m==2){vec4 t7;Q41TB(Q41U(uv),vec2(.2,.09),3,0,0,0,t7);vec4 r6=Q41UN(Q41IN(S0,Q41PM(t7)));vec2 q=Q41DSP(uv,9.,r6.r,r6.a);
  vec4 tq;Q41TB(Q41U(q),vec2(.2,.09),3,0,0,0,tq);vec4 r4=Q41AM(Q41PM(tq),5.5,-2.);vec4 r91=Q41IN(Q41IN(S0,r4),S0);res=Q41MUL(r91,r91);}
 else if(m==3){vec4 t;Q41TB(Q41U(uv),vec2(.03,.1),5,0,0,0,t);vec2 q2=Q41DSP(uv,4.,t.r,t.a);vec4 t2;Q41TB(Q41U(q2),vec2(.03,.1),5,0,0,0,t2);
  vec2 q1=Q41DSP(q2,5.,t2.a,t2.a);vec4 t1;Q41TB(Q41U(q1),vec2(.03,.1),5,0,0,0,t1);vec4 r6=Q41IN(Q41SRC(q2),Q41AM(Q41PM(t1),3.,-1.));
  vec4 r2=Q41IN(r6,r6);vec4 r93=Q41OVER(r2,r2);res=Q41MUL(r93,r93);}
 else if(m==4){vec4 t1;Q41TB(Q41U(uv),vec2(1.),3,0,50,3,t1);float a2=.7*dot(O(uv).rgb,vec3(.2125,.7154,.0721));float a3=t1.a+a2*(1.-t1.a);res=Q41OUT(S0,vec4(clamp(5.*a3-3.2,0.,1.)));}
 else{res=vec4(0.);float wt=0.;for(int j=0;j<9;j++){vec2 o=vec2(float(j%3-1),float(j/3-1));float w=exp(-dot(o,o)/.98);vec2 qq=uv+Q41D(o);vec4 tt;Q41TB(Q41U(qq),vec2(.3),9,1,0,3,tt);
  float a2=.4*dot(O(qq).rgb,vec3(.2125,.7154,.0721));float a91=clamp(10.*(a2+tt.a*(1.-a2))-4.,0.,1.);res+=Q41OUT(Q41SRC(qq),vec4(a91))*w;wt+=w;}res/=wt;}
 return Q41FIN(res);`,
  'Inkscape presets: ' + Q41_NOTE + '. Carnaval f140 (turbulence .025/.028 x5 alpha 6a-2.4 displaced 40 by the image red / masked alpha, white splotches over the image, multiplied with itself); Growing Cells f169 (fractal noise .1 desaturated, alpha 20a-12, blur 2, alpha 10a-.1, arithmetic k1 .8 k2 1 with the image, atop the grey noise, over and atop the image); People f095 (fractal noise .2/.09 alpha 5.5a-2 displaced 9 by the masked image, in the image, self-multiply); Scotland f096 (fractal noise .03/.1 self-displaced 5, alpha 3a-1, image in it, displaced 4, self-multiply); Dots Transparency f134 (fractal noise freq 1 over luminance-to-alpha x.7, alpha 5a-3.2, image out of it); Canvas Transparency f135 (turbulence .3 (9 of the 10 octaves; the 10th is below a pixel) under luminance x.4, alpha 10a-4, image out of it, blur .7)',1);

f = add('Materials');
f('q41_ink_wax','Inkscape Wax Print',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}vec4 t;Q41TB(Q41U(uv),vec2(.05),5,0,0,0,t);return Q41AM(Q41PM(t),10.,0.);`, BH('10.*u_p1'), BV('10.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}vec4 r4=T(uv);vec4 t0;Q41TB(Q41U(uv),vec2(.05),5,0,0,0,t0);vec2 q=Q41DSP(uv,10.,t0.r,t0.g);
 vec4 r2=vec4(0.);float wt=0.;for(int j=0;j<49;j++){vec2 o=1.2*vec2(float(j%7-3),float(j/7-3));float w=exp(-dot(o,o)/8.);r2+=Q41SRC(q+Q41D(o))*w;wt+=w;}r2/=wt;
 vec4 r5=Q41MUL(r2,Q41AM(Q41PM(t0),10.,0.));vec4 r6=Q41ARI(r4,r5,.5,.15,1.5,0.);return Q41FIN(Q41IN(r6,r4));`],
  'Inkscape Wax Print (f102, Textures): ' + Q41_NOTE + '; chain: image blurred 2 and displaced 10 by fractal noise .05 x5, multiplied with the noise (alpha x10), arithmetic k1 .5 k2 .15 k3 1.5 against the noise blurred 5, clipped to it',1);

f = add('Color');
f('q41_ink_rainbow','Inkscape Melted / Warped Rainbow and Chewing Gum',[S('Preset',['Melted Rainbow','Warped Rainbow','Chewing Gum']),Q41_SHAPE(1),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p1','u_p2')}return Q41SRC(uv);`, BH('(u_p0>1.5?30.:10.)*u_p2'), BV('(u_p0>1.5?30.:10.)*u_p2'),
   `${Q41_HDR('u_p1','u_p2')}int m=int(u_p0+.5);vec4 S0=Q41SRC(uv);vec4 r8=T(uv);vec4 res;
 if(m==0){vec4 t7;Q41TB(Q41U(uv),vec2(.015),2,0,20,0,t7);vec4 r6=Q41IN(S0,r8);vec4 r2=Q41ARI(r6,Q41PM(t7),0.,0.,1.,0.);vec4 fb=Q41IN(r2,r6);res=Q41ARI(fb,fb,0.,2.5,0.,0.);}
 else if(m==1){float a8=r8.a;vec2 q=Q41DSP(uv,100.,a8,a8);vec4 t7;Q41TB(Q41U(q),vec2(.015),2,0,20,0,t7);vec4 r10=Q41PM(t7);vec4 r2=Q41ATOP(r10,r8);res=Q41ARI(r10,r2,2.5,0.,.5,0.);}
 else{float a3=clamp(4.*r8.a-2.,0.,1.);float a2=clamp(10.*a3-3.,0.,1.);res=Q41NRM(vec4(vec3(253.,112.,174.)/255.,1.)*a2,S0);}
 return Q41FIN(res);`],
  'Inkscape Melted Rainbow (f111), Warped Rainbow (f130) and Chewing Gum (f127, Protrusions): ' + Q41_NOTE + '. Melted: image blurred 5, fractal noise .015 x2 (seed 20) taken inside the blurred shape, k2 2.5; Warped: the same noise displaced 100 by the blurred alpha, atop the blurred image, arithmetic k1 2.5 k3 .5; Chewing Gum: alpha blurred 15, 4a-2 then 10a-3, pink flood (253,112,174) over the image',1);

f = add('Paint');
f('q41_ink_inkpaint','Inkscape Ink Paint',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}vec4 t0;Q41TB(Q41U(uv),vec2(.07),4,0,0,0,t0);return Q41SRC(Q41DSP(uv,10.,t0.r,t0.g));`, BH('20.*u_p1'), BV('20.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}vec4 t0;Q41TB(Q41U(uv),vec2(.07),4,0,0,0,t0);vec4 r2=Q41SRC(Q41DSP(uv,10.,t0.r,t0.g));vec4 r5=Q41MUL(r2,r2);
 vec4 r6=Q41ARI(Q41PM(t0),T(uv),2.,0.,.5,0.);return Q41FIN(Q41IN(r6,r5));`],
  'Inkscape Ink Paint (f109, Textures): ' + Q41_NOTE + '; chain: image displaced 10 by fractal noise .07 x4, self-multiplied, the noise combined (k1 2, k3 .5) with the displaced image blurred 10, clipped to the multiplied copy',1);

f = add('Materials');
f('q41_ink_tiger','Inkscape Tiger Fur',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}vec4 t0;Q41TB(Q41U(uv),vec2(.1,.015),2,1,57,0,t0);vec4 r1=Q41OVER(Q41PM(t0),Q41PM(t0));return Q41ARI(Q41SRC(uv),r1,1.,0.,0.,0.);`, BH('20.*u_p1'), BV('20.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}vec4 r8=T(uv);float a6=Q41XOR(r8,r8).a;vec2 q=Q41DSP(uv,100.,a6,a6);vec4 t0;Q41TB(Q41U(q),vec2(.1,.015),2,1,57,0,t0);
 vec4 r4=Q41OVER(Q41PM(t0),Q41PM(t0));vec4 S0=Q41SRC(uv);vec4 r2=Q41ARI(S0,r4,1.,0.,0.,0.);return Q41FIN(Q41OUT(S0,r2));`],
  'Inkscape Tiger Fur (f117, Materials): ' + Q41_NOTE + '; chain: turbulence .1/.015 x2 (seed 57) doubled (over itself), multiplied with the image, blurred 10, xor with itself, which displaces the turbulence by 100 (alpha/alpha); the image is cut out (out) by image x displaced turbulence',1);

f('q41_ink_leopard','Inkscape Leopard Fur',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}float mx=0.;for(int j=0;j<25;j++){vec2 qq=uv+Q41D(.9*vec2(float(j%5-2),float(j/5-2)));vec4 tt;Q41TB(Q41U(qq),vec2(.143),5,0,0,3,tt);mx=max(mx,min(6.*clamp(5.*tt.a-3.45,0.,1.)*Q41A(O(qq).rgb),1.));}
 return vec4(mx,Q41A(O(uv).rgb),0.,1.);`, Q41_B3('vec2(1.,0.)', '1.,2.88,7.2', 'rrg'), Q41_B3('vec2(0.,1.)', '1.,2.88,7.2', 'rgb'),
   `${Q41_HDR('u_p0','u_p1')}vec4 t92;Q41TB(Q41U(uv),vec2(.106),3,1,0,0,t92);vec2 q=Q41DSP(uv,4.5,t92.r,t92.g);vec4 b=T(q);
 float a3pp=clamp(6.*b.g*(1.-b.r),0.,1.);float as=Q41A(O(q).rgb);vec4 r3x=Q41ATOP(vec4(0.,0.,0.,a3pp),vec4(vec3(209.,151.,45.)/255.*as,as));
#define Q41AF(Q,OUT) {OUT=T(Q).b;}
 vec3 N;Q41NRM9(q,10.6,N);vec4 D=Q41DIF(N,Q41LD(225.,48.),1.92,vec3(1.));return Q41FIN(Q41MUL(D,r3x)*as);`],
  'Inkscape Leopard Fur (f015, Materials): ' + Q41_NOTE + '; chain: fractal noise .143 x5 alpha 5a-3.45 inside the shape, x6, dilate 1.8, blur 1, ring = (blur 2.7) out (blur 1), x6 = black rosettes atop an orange (209,151,45) flood in the image shape, multiplied by diffuse light (shape alpha blurred 7.2, surface 10.6, kd 1.92, az 225 el 48), displaced 4.5 by turbulence .106 x3',1);

f('q41_ink_pearl','Inkscape 3D Mother of Pearl',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}float as=Q41A(O(uv).rgb);return vec4(as,1.-(1.-as)*(1.-as),0.,1.);`, Q41_B3('vec2(1.,0.)', '3.,5.,0.', 'rgb'), Q41_B3('vec2(0.,1.)', '3.,5.,0.', 'rgb'),
   `${Q41_HDR('u_p0','u_p1')}
#define Q41R4(Q,OUT) {vec4 a7_;Q41TB(Q41U(Q),vec2(.03),8,0,77,3,a7_);float a6_=a7_.a*T(Q).r;vec4 b_;Q41TB(Q41U(Q41DSP(Q,60.,a6_,a6_)),vec2(.03),8,0,77,0,b_);OUT=Q41AM(Q41PM(b_),1.6,-.6);}
 vec4 e0,e1,e2;Q41R4(uv,e0);Q41R4(uv+Q41D(vec2(-1.,1.)),e1);Q41R4(uv+Q41D(vec2(-2.,2.)),e2);vec4 r9=Q41CL(clamp(e0+2.*e1-e2,0.,1.));
 vec4 r10=Q41ATOP(r9,Q41SRC(uv));vec4 fb=Q41DRK(r10,r10);
#define Q41AF(Q,OUT) {OUT=T(Q).g;}
 vec3 N;Q41NRM9(uv,5.,N);vec4 sp;Q41SPC(N,Q41LD(235.,60.),1.,25.,vec3(242.,215.,108.)/255.,sp);return Q41FIN(Q41ARI(fb,Q41IN(sp,fb),0.,1.,1.,0.));`],
  'Inkscape 3D Mother of Pearl (f116, Materials): ' + Q41_NOTE + '; chain: fractal noise .03 x8 (seed 77) alpha 1.6a-.6 displaced 60 by the noise inside the image blurred 3, 3x3 convolution (2, 4, -2 on the diagonal, target 2,2, divisor 2), atop the image, self-darken, plus a gold (242,215,108) specular highlight (blur 5 of the alpha, surface 5, exponent 25, az 235 el 60)',1);

f('q41_ink_lava','Inkscape Cracked Lava',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}
#define Q41AF(Q,OUT) {vec4 v_;Q41TB(Q41U(Q),vec2(.042),7,1,488,3,v_);OUT=v_.a*Q41A(O(Q).rgb);}
#define Q41LAVA(FB,FA) {vec4 t1_;Q41TB(Q41U(uv),vec2(.042),7,1,488,0,t1_);vec4 r2_=Q41SRC(uv)*t1_.a;vec3 N_;Q41NRM9(uv,2.,N_);vec4 r4_;Q41SPC(N_,Q41LD(225.,62.),2.,65.,vec3(1.,230./255.,136./255.),r4_);vec4 r91_=Q41ARI(r4_,r2_,2.5,-.5,1.,0.);FB=Q41MUL(r91_,r91_);vec4 u_=Q41UN(FB);FA=Q41PM(clamp(vec4(u_.r-u_.a,u_.r+u_.b-u_.a,u_.r-u_.a,-2.*u_.r-.5*u_.g+5.*u_.a-2.),0.,1.));}
 vec4 fb,fa;Q41LAVA(fb,fa);return fa;`, BH('16.*u_p1'), BV('16.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}
#define Q41AF(Q,OUT) {vec4 v_;Q41TB(Q41U(Q),vec2(.042),7,1,488,3,v_);OUT=v_.a*Q41A(O(Q).rgb);}
#define Q41LAVA(FB,FA) {vec4 t1_;Q41TB(Q41U(uv),vec2(.042),7,1,488,0,t1_);vec4 r2_=Q41SRC(uv)*t1_.a;vec3 N_;Q41NRM9(uv,2.,N_);vec4 r4_;Q41SPC(N_,Q41LD(225.,62.),2.,65.,vec3(1.,230./255.,136./255.),r4_);vec4 r91_=Q41ARI(r4_,r2_,2.5,-.5,1.,0.);FB=Q41MUL(r91_,r91_);vec4 u_=Q41UN(FB);FA=Q41PM(clamp(vec4(u_.r-u_.a,u_.r+u_.b-u_.a,u_.r-u_.a,-2.*u_.r-.5*u_.g+5.*u_.a-2.),0.,1.));}
 vec4 fb,fa;Q41LAVA(fb,fa);
#undef Q41AF
#define Q41AF(Q,OUT) {OUT=T(Q).a;}
 vec3 N;Q41NRM9(uv,4.,N);vec4 sp;Q41SPC(N,normalize(vec3(-.218,-.436,.873)),.8,15.,vec3(1.),sp);vec4 x2=sp*fa.a;vec4 r4=clamp(2.*fb+2.*x2,0.,1.);float r4a=r4.a;r4.rgb=min(r4.rgb,vec3(r4a));vec3 dk=r4.rgb*(2.-r4a);float da=1.-(1.-r4a)*(1.-r4a);return vec4(clamp(dk+1.-da,0.,1.),1.);`],
  'Inkscape Cracked Lava (f049, Materials): ' + Q41_NOTE + '; chain: image in turbulence .042 x7 (seed 488), specular (surface 2, ks 2, exp 65, (255,230,136), az 225 el 62), arithmetic 2.5/-.5/1, self-multiply, colour matrix to a crack alpha, blurred 8, white specular from a far point light (-5000,-10000,20000) treated as distant, arithmetic k2 2 k3 2, self-darken; the 0.5 px pre-blur is omitted',1);

f('q41_ink_beeswax','Inkscape Iridescent Beeswax',[Q41_SHAPE(0),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}return Q41SRC(uv);`, BH('6.*u_p1'), BV('6.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}
#define Q41AF(Q,OUT) {vec4 v_;Q41TB(Q41U(Q),vec2(.05),5,1,200,3,v_);OUT=T(Q).a*v_.a;}
 vec4 t1;Q41TB(Q41U(uv),vec2(.05),5,1,200,0,t1);vec4 r2=Q41IN(T(uv),Q41PM(t1));vec3 N;Q41NRM9(uv,4.,N);vec4 r4;Q41SPC(N,Q41LD(225.,62.),8.,3.,vec3(1.),r4);
 vec4 r91=Q41ARI(r4,r2,1.8,-.4,.8,0.);vec4 fb=Q41SCR(r91,r91);vec4 fb2=Q41ARI(fb,Q41IN(Q41PM(t1),fb),0.,2.,5.,0.);
 vec4 tb;Q41TB(Q41U(uv),vec2(.04),5,0,35,0,tb);return Q41ARI(fb2,Q41PM(tb),.9,.3,0.,-.1);`,
   `${Q41_HDR('u_p0','u_p1')}
#define Q41AF(Q,OUT) {OUT=T(Q).a;}
 vec3 N;Q41NRM9(uv,3.,N);vec4 sp;Q41SPC(N,Q41LD(225.,62.),1.,30.,vec3(1.),sp);vec4 r92=Q41ATOP(sp,T(uv));return Q41FIN(Q41SCR(r92,r92));`],
  'Inkscape Iridescent Beeswax (f047, Materials): ' + Q41_NOTE + '; chain: image blurred 3 inside turbulence .05 x5 (seed 200), specular (surface 4, ks 8, exp 3, az 225 el 62), arithmetic 1.8/-.4/.8, self-screen, k2 2 k3 5 with the turbulence, arithmetic with fractal noise .04 (seed 35) k1 .9 k2 .3 k4 -.1, second specular (surface 3, exp 30) atop, self-screen',1);

f = add('Stylize');
f('q41_ink_microscopy','Inkscape Electronic Microscopy',[Q41_SHAPE(1),P('Scale',.25,4,1,.05)],
  [`${Q41_HDR('u_p0','u_p1')}vec4 s=Q41SRC(uv);return Q41MUL(s,Q41IN(s,s));`, BH('14.*u_p1'), BV('14.*u_p1'),
   `${Q41_HDR('u_p0','u_p1')}vec4 s=Q41SRC(uv);vec4 r2=Q41MUL(s,Q41IN(s,s));vec4 r3=T(uv);return Q41IN(r3,Q41OVER(r3,r2));`,
   `${Q41_HDR('u_p0','u_p1')}
#define Q41AF(Q,OUT) {OUT=T(Q).a;}
 vec3 N;Q41NRM9(uv,2.,N);vec4 sp;Q41SPC(N,normalize(vec3(-.24,-.24,.94)),1.5,100.,vec3(1.),sp);vec4 r93=Q41ARI(sp,T(uv),1.,0.,0.,0.);vec4 r94=Q41ARI(r93,r93,.5,.1,1.,0.);return Q41FIN(Q41MUL(r94,r94));`],
  'Inkscape Electronic Microscopy (f077, Bevels): ' + Q41_NOTE + '; chain: image multiplied with its own alpha-squared copy, blurred 7, clipped (in) to itself over the sharp copy, sharp white specular (surface 2, ks 1.5, exp 100, far point light (-5000,-5000,20000) treated as distant) multiplied in, arithmetic .5/.1/1, self-multiply; the sub-pixel blurs (0.5, 1, 0.8) are omitted',1);

/* ---------------- VapourSynth plugins ---------------- */
f = add('Repair');
f('q41_ssiq','SSIQ Spatial Derainbow (VapourSynth)',[P('Diameter',3,11,11,2,'px'),P('Strength',1,300,200,1)],
  `vec3 c0=O(uv).rgb*255.;float Y=dot(c0,vec3(.299,.587,.114));vec2 uv0=vec2((c0.b-Y)*.564+128.,(c0.r-Y)*.713+128.);
 float Tt=floor((u_p1+2.)/3.);float tol=floor(sqrt(floor(Tt*Tt/3.)));int rr=int((u_p0-1.)*.5+.01);vec2 sm=vec2(0.),n=vec2(0.);
 for(int j=-5;j<=5;j++){if(abs(j)>rr)continue;for(int i=-5;i<=5;i++){if(abs(i)>rr)continue;vec3 q=O(uv+vec2(float(i),float(j))*u_k*u_px).rgb*255.;float y=dot(q,vec3(.299,.587,.114));
  vec2 w=vec2((q.b-y)*.564+128.,(q.r-y)*.713+128.);vec2 inn=step(abs(w-uv0),vec2(tol+.5));sm+=w*inn;n+=inn;}}
 vec2 cc=floor(sm/n+.5)-128.;vec3 o=vec3(Y+1.403*cc.y,Y-.344*cc.x-.714*cc.y,Y+1.773*cc.x);return vec4(clamp(o/255.,0.,1.),1.);`,
  'dubhater vapoursynth-ssiq (port of the SSIQ AviSynth / VirtualDub plugin, after Graft\'s Smart Smoother): luma untouched, each chroma plane (BT.601 U, V) replaced by the rounded mean of the Diameter x Diameter neighbours within tolerance sqrt(floor(T^2/3)) of the centre, T = floor((Strength + 2) / 3) (8-bit units); computed at full resolution here instead of the plugin\'s 4:2:0 2x2 replication; interlaced option omitted');

f('q41_edgefixer','EdgeFixer Border Line Repair (VapourSynth ContinuityFixer)',[P('Left and right lines',0,4,2,1),P('Top and bottom lines',0,4,2,1),P('Radius',0,64,0,1,'px')],
  [3, 2, 1, 0].map(d => `float W=u_res.x;float xi=floor(uv.x*W);if(${d}.>=floor(u_p0+.5))return c;bool Lf=xi==${d}.;if(!Lf&&xi!=W-1.-${d}.)return c;
 float rf=uv.x+(Lf?u_px.x:-u_px.x);float rad=floor(u_p2+.5);vec3 sx=vec3(0.),sy=vec3(0.),sxy=vec3(0.),sxx=vec3(0.);float n=0.;
 for(int i=-64;i<=64;i++){float qy=rad<.5?(float(i)+64.5)/129.:uv.y+float(i)*u_px.y;if(rad>=.5&&abs(float(i))>rad)continue;if(qy<0.||qy>1.)continue;vec3 x=T(vec2(uv.x,qy)).rgb,y=T(vec2(rf,qy)).rgb;sx+=x;sy+=y;sxy+=x*y;sxx+=x*x;n+=1.;}
 vec3 a=(n*sxy-sx*sy)/(n*sxx-sx*sx+1.5e-8);vec3 b=(sy-a*sx)/n;return vec4(clamp(a*c.rgb+b,0.,1.),1.);`).concat(
  [3, 2, 1, 0].map(d => `float H=u_res.y;float yi=floor(uv.y*H);if(${d}.>=floor(u_p1+.5))return c;bool Bt=yi==${d}.;if(!Bt&&yi!=H-1.-${d}.)return c;
 float rf=uv.y+(Bt?u_px.y:-u_px.y);float rad=floor(u_p2+.5);vec3 sx=vec3(0.),sy=vec3(0.),sxy=vec3(0.),sxx=vec3(0.);float n=0.;
 for(int i=-64;i<=64;i++){float qx=rad<.5?(float(i)+64.5)/129.:uv.x+float(i)*u_px.x;if(rad>=.5&&abs(float(i))>rad)continue;if(qx<0.||qx>1.)continue;vec3 x=T(vec2(qx,uv.y)).rgb,y=T(vec2(qx,rf)).rgb;sx+=x;sy+=y;sxy+=x*y;sxx+=x*x;n+=1.;}
 vec3 a=(n*sxy-sx*sy)/(n*sxx-sx*sx+1.5e-8);vec3 b=(sy-a*sx)/n;return vec4(clamp(a*c.rgb+b,0.,1.),1.);`)),
  'sekrit-twc EdgeFixer ContinuityFixer: each of the outer N columns / rows (working-resolution pixels) is replaced by a*x + b, the least-squares fit (a = (n Sxy - Sx Sy) / (n Sxx - Sx^2 + eps), b = (Sy - a Sx) / n) of the line x against its inner neighbour y, per channel, over a window of +-Radius along the line (Radius 0 = whole line, 129 samples); lines repaired innermost first so each uses the already fixed neighbour (assumed order), left/right then top/bottom; one count per pair of opposite edges');

f('q41_lghost','LGhost Ghost / Ringing Reduction (VapourSynth)',[S('Mode',['Edge (ringing)','Luminance','Rising edge','Falling edge']),P('Shift',-32,32,4,1,'px'),P('Intensity',-128,127,-40,1)],
  `int m=int(u_p0+.5);float s=R(floor(u_p1+.5));vec2 d=vec2(u_px.x,0.);vec3 c0=O(uv).rgb;
 float a=dot(O(uv-d*s).rgb,vec3(.299,.587,.114))*255.,b=dot(O(uv-d*(s-R(1.))).rgb,vec3(.299,.587,.114))*255.;float e=b-a;
 float t=m==0?e:m==1?a:m==2?max(e,0.):min(e,0.);float dy=floor(t*floor(u_p2+.5))/128.;return vec4(clamp(c0+dy/255.,0.,1.),1.);`,
  'HomeOfVapourSynthEvolution LGhost (one ghost term on luma, as the plugin processes only luma by default): Y += term x Intensity / 128 (arithmetic shift), term = Y[x-shift+1] - Y[x-shift] (edge), Y[x-shift] (luminance), or only the positive (rising) / negative (falling) part of that difference; horizontal shift in pixels; the luma change is added to R, G and B');

f = add('Noise');
const Q41_DCT1 = (fwd, horiz, src, enc, dec, scale) => `vec2 p=floor(uv*u_res);float pc=${horiz ? 'p.x' : 'p.y'};float b0=floor(pc/8.)*8.;float u=pc-b0;vec3 acc=vec3(0.);
 for(int k=0;k<8;k++){float kk=float(k);vec2 q=${horiz ? 'vec2(b0+kk,p.y)' : 'vec2(p.x,b0+kk)'};vec3 v=${src}((min(q,u_res-1.)+.5)/u_res).rgb${dec};
  ${fwd ? 'float ck=u<.5?.35355:.5;acc+=v*ck*cos((2.*kk+1.)*u*3.14159265/16.);' : 'float ck=kk<.5?.35355:.5;acc+=v*ck*cos((2.*u+1.)*kk*3.14159265/16.);'}}
 ${scale}return vec4(acc${enc},1.);`;
const Q41_FAC = `float Q41f[8]=float[8](1.,u_p0,u_p0,u_p1,u_p1,u_p2,u_p2,u_p3);`;
f('q41_dctfilter','DCTFilter 8x8 DCT Frequency Suppressor (VapourSynth)',[P('Factor 1-2',0,1,1,.05),P('Factor 3-4',0,1,.8,.05),P('Factor 5-6',0,1,.5,.05),P('Factor 7',0,1,.2,.05)],
  [Q41_DCT1(true, true, 'O', '/8.+.5', '', ''),
   Q41_DCT1(true, false, 'T', '/16.+.5', '*8.-4.', `${Q41_FAC}vec2 uvb=mod(p,8.);acc*=Q41f[int(uvb.x+.5)]*Q41f[int(uvb.y+.5)];`),
   Q41_DCT1(false, false, 'T', '/8.+.5', '*16.-8.', ''),
   Q41_DCT1(false, true, 'T', '', '*8.-4.', 'acc=clamp(acc,0.,1.);')],
  'HomeOfVapourSynthEvolution DCTFilter: per 8x8 block (working-resolution grid) orthonormal DCT, coefficient (u, v) multiplied by factor[u] x factor[v], inverse DCT; the 8 factors are grouped as 1 (DC, fixed), f1 f1, f2 f2, f3 f3, f4 to fit 4 controls; separable 4-pass DCT, coefficients carried in float textures (8-bit fallback GPUs lose precision)');

f = add('Distort');
f('q41_binoculars','Binoculars View (VapourSynth vfx)',[P('Radius',.03,.25,.125,.005),P('Center X',0,1,.5,.01),P('Center Y',0,1,.5,.01),P('Magnification',.25,8,2,.05)],
  `float md=min(u_res.x,u_res.y);vec2 p=uv*u_res;vec2 cn=vec2(u_p1,1.-u_p2)*u_res;float rad=u_p0*md;
 vec2 dl=p-(cn-vec2(rad,0.)),dr=p-(cn+vec2(rad,0.));vec2 d=dot(dl,dl)<=rad*rad?dl:dot(dr,dr)<=rad*rad?dr:vec2(1e9);
 if(d.x>1e8)return O(uv);return vec4(O(clamp((cn+d/u_p3)/u_res,0.,1.)).rgb,1.);`,
  'V.C. Mohan vfx Binoculars (single frame of the start state): the disc of radius Radius x min(w, h) around the centre is magnified (offsets / mag) and drawn twice, as two touching discs centred at centre +- radius on the same row; everything else unchanged, no rim; bilinear instead of the plugin\'s 4-tap cubic');

f('q41_linemag','Line Magnifier (VapourSynth vfx)',[S('Mode',['Vertical strip','Horizontal strip','Vertical drop','Horizontal drop']),P('Strip width',.02,.125,.0625,.005),P('Position',0,1,.5,.01),P('Magnification',1.5,8,4,.1)],
  `int m=int(u_p0+.5);bool vt=m==0||m==2;bool dr=m>=2;vec2 p=uv*u_res;float dim=vt?u_res.x:u_res.y;float lw=floor(u_p1*dim);float c0=floor(u_p2*dim);float x=vt?p.x:(u_res.y-p.y);
 float o=x-c0;if(o<0.||o>=lw)return O(uv);float uu=o/lw;float lm=dr?u_p3*(.5+.5*(2.*uu-1.)*(2.*uu-1.)):u_p3;float sx=c0+o/lm;
 vec2 q=vt?vec2(sx,p.y):vec2(p.x,u_res.y-sx);return vec4(O(q/u_res).rgb,1.);`,
  'V.C. Mohan vfx LineMagnifier (single frame): a strip Strip width x frame size wide starting at Position (from the left / top) shows the image magnified about its leading edge (offset / mag); drop mode uses a parabolic factor, mag / 2 at the strip centre and mag at its edges (profile reconstructed, approx.); bilinear instead of 4-tap cubic');

/* ---------------- Wolfram / FFmpeg / OBS ---------------- */
f = add('Color');
const Q41_TONES = [['Black Blue Red Green (doc example)', ['0,0,0', '0,0,1', '1,0,0', '0,.5,0']], ['Black Red Yellow White', ['0,0,0', '1,0,0', '1,1,0', '1,1,1']], ['Blue Magenta Orange', ['0,0,1', '1,0,1', '1,.5,0', '1,.5,0']], ['Sepia (Black Brown Cream)', ['0,0,0', '.6,.4,.2', '.85,.7,.5', '1,.97,.88']], ['Teal Orange', ['0,.5,.5', '.4,.6,.6', '1,.7,.4', '1,.5,0']]];
f('q41_colortones','ColorTones Effect (Wolfram ImageEffect)',[S('Colors',Q41_TONES.map(r => r[0])),P('Chroma',0,2,1,.05)],
  `
#define Q41LAB(C,OUT) {vec3 l_=${LIN('(C)')};vec3 x_=mat3(.4124,.2126,.0193,.3576,.7152,.1192,.1805,.0722,.9505)*l_/vec3(.9505,1.,1.089);x_=mix(x_*7.787+16./116.,pow(max(x_,vec3(1e-6)),vec3(1./3.)),step(vec3(.008856),x_));OUT=vec3(116.*x_.y-16.,500.*(x_.x-x_.y),200.*(x_.y-x_.z));}
 vec3 P[20]=vec3[20](${Q41_TONES.map(r => r[1].map(v => `vec3(${v})`).join(',')).join(',')});int m=int(u_p0+.5);
 vec3 lab;Q41LAB(O(uv).rgb,lab);float t=clamp(lab.x/100.,0.,1.)*3.;int i0=int(min(floor(t),2.));vec3 a0,a1;Q41LAB(P[m*4+i0],a0);Q41LAB(P[m*4+i0+1],a1);
 vec2 ab=mix(a0.yz,a1.yz,t-float(i0))*u_p1;float fy=(lab.x+16.)/116.;vec3 f3=vec3(fy+ab.x/500.,fy,fy-ab.y/200.);vec3 xyz=mix((f3-16./116.)/7.787,f3*f3*f3,step(vec3(.2069),f3))*vec3(.9505,1.,1.089);
 vec3 l=mat3(3.2406,-.9689,.0557,-1.5372,1.8758,-.204,-.4986,.0415,1.057)*xyz;l=clamp(l,0.,1.);return vec4(${SRGB('l')},1.);`,
  'Wolfram ImageEffect {"ColorTones", {col1, col2, ...}}: chromaticities of the colours mapped to increasing intensity - here each pixel keeps its CIE L* and takes the a*b* of the colour list interpolated at L* (colour space not stated in the docs, approx.); the first list is the documentation example, the others are sample lists; Chroma scales a*b*');

f = add('Sensor');
f('q41_wl_fir','Hilbert / Differentiator Filter (Wolfram HilbertFilter, DifferentiatorFilter)',[S('Filter',['Hilbert (both axes)','Hilbert horizontal','Hilbert vertical','Differentiator (both axes)','Differentiator horizontal','Differentiator vertical']),P('Cutoff (x pi)',.05,1,1,.05),P('Kernel length',3,63,21,2),P('Gain',.25,8,2,.25)],
  [0, 1].map(ax => `int m=int(u_p0+.5);int dm=m%3;bool hb=m<3;${ax === 0 ? 'if(dm==2)return vec4(O(uv).rgb*.25+.5,1.);' : 'if(dm==1)return vec4(clamp(.5+u_p3*(T(uv).rgb-.5)*4.,0.,1.),1.);'}
 float wc=u_p1*3.14159265;int hn=int((u_p2-1.)*.5+.01);vec3 acc=vec3(0.);vec2 dir=${ax === 0 ? 'vec2(u_px.x,0.)' : 'vec2(0.,-u_px.y)'};
 for(int k=-31;k<=31;k++){if(abs(k)>hn||k==0)continue;float kk=float(k);float h=hb?(1.-cos(wc*kk))/(3.14159265*kk):(wc*kk*cos(wc*kk)-sin(wc*kk))/(3.14159265*kk*kk);
  float wn=.54+.46*cos(3.14159265*kk/(float(hn)+1.));vec3 v=${ax === 0 ? 'O(uv-dir*kk*u_k).rgb' : '(T(uv-dir*kk*u_k).rgb-.5)*4.'};acc+=h*wn*v;}
 ${ax === 0 ? 'return vec4(acc*.25+.5,1.);' : 'return vec4(clamp(.5+u_p3*acc,0.,1.),1.);'}`),
  'Wolfram HilbertFilter / DifferentiatorFilter: FIR least-squares kernels with cutoff wc, h[k] = (1 - cos(wc k)) / (pi k) (Hilbert, 90 degree phase shift) and h[k] = (wc k cos(wc k) - sin(wc k)) / (pi k^2) (differentiator), h[0] = 0, odd length n, times a Hamming window (the docs only say a "suitable" default window, approx.), convolved with Fixed (clamped) padding; on an image Wolfram filters each dimension in turn (both axes), or one axis here; signed result shown as 0.5 + Gain x value, per channel');

f = add('Retro');
f('q41_latticepal','FCC Lattice Palette Quantisation (FFmpeg latticepal)',[P('Density',1,20,6,1),S('Dither',['None','Bayer 8x8 ordered'])],
  `float N=floor(u_p0+.5);vec3 c0=O(uv).rgb;if(u_p1>.5){vec2 p=floor(uv*u_res);p.y=u_res.y-1.-p.y;
  vec3 b=vec3(bayer8(p),bayer8(p+vec2(1.,0.)),bayer8(vec2(p.x,7.-mod(p.y,8.))));c0+=(b-.5+1./128.)*2./N;}
 vec3 u=clamp(c0*N,0.,N);vec3 fi=floor(u+.5);vec3 d=u-fi;if(mod(fi.x+fi.y+fi.z,2.)>.5){int k=abs(d.x)>=abs(d.y)&&abs(d.x)>=abs(d.z)?0:abs(d.y)>=abs(d.z)?1:2;
  float dir=d[k]>=0.?1.:-1.;float nv=fi[k]+dir;if(nv<0.||nv>N)nv=fi[k]-dir;fi[k]=nv;}
 return vec4(floor(fi*255./N+.5)/255.,1.);`,
  'FFmpeg vf_latticepal (Niedermayer 2026): each RGB pixel scaled to Density lattice steps per axis and snapped to the nearest point of the FCC (D3 checkerboard: integer coordinates with even sum) lattice by the Conway-Sloane rule (round, and if the sum is odd re-round the coordinate with the largest error the other way, kept inside 0..N), output idx * 255 / N; ordered dither = 8x8 Bayer offsets of amplitude 2 / N with green shifted one column and blue rows flipped (approx. of the swscale 73-level matrix); the palette reduction to max_colors (whole-frame heap merging) and Floyd-Steinberg / blue-noise dithers are not included, so the output is exact only while the used lattice colours fit 256 (Density <= 7)');

f = add('Repair');
f('q41_estdif','Edge Slope Tracing Deinterlacer (FFmpeg estdif)',[P('Slope search radius',1,8,1,1),P('Edge match radius',0,6,2,1),S('Interpolation',['2-point','4-point','6-point'],1),S('Field',['Keep even rows (rebuild odd)','Keep odd rows (rebuild even)'])],
  `vec2 p=floor(uv*u_res);p.y=u_res.y-1.-p.y;if(mod(p.y,2.)!=(u_p3>.5?0.:1.))return O(uv);
#define Q41E(DY,DX) (O((vec2(p.x+(DX),u_res.y-1.-clamp(p.y+(DY),0.,u_res.y-1.))+.5)/u_res))
#define Q41EL(DY,DX) dot(Q41E(DY,DX).rgb,vec3(.299,.587,.114))
 int rs=int(u_p0+.5),re=int(u_p1+.5);float best=1e9;int bk=0;float pv=Q41EL(-1.,0.),nv=Q41EL(1.,0.);
 for(int i=-8;i<=8;i++){if(abs(i)>rs)continue;float fi=float(i);float sm=0.;
  for(int j=-6;j<=6;j++){if(abs(j)>re)continue;float xx=fi+float(j),yy=-fi+float(j);sm+=abs(Q41EL(-1.,xx)-Q41EL(1.,yy))+abs(Q41EL(-3.,xx)-Q41EL(-1.,yy))+abs(Q41EL(1.,xx)-Q41EL(3.,yy));}
  float mid=(Q41EL(-1.,fi)+Q41EL(1.,-fi))*.5;float cst=2.*sm+abs(pv-mid)+abs(nv-mid)+abs(fi)/255.;if(cst<best){best=cst;bk=i;}}
 float k=float(bk);int it=int(u_p2+.5);vec3 a1=Q41E(-1.,k).rgb+Q41E(1.,-k).rgb;vec3 o=a1*.5;
 if(it==1)o=(9.*a1-(Q41E(-3.,3.*k).rgb+Q41E(3.,-3.*k).rgb))/16.;
 if(it==2)o=(20.*a1-5.*(Q41E(-3.,3.*k).rgb+Q41E(3.,-3.*k).rgb)+Q41E(-5.,5.*k).rgb+Q41E(5.,-5.*k).rgb)/32.;
 return vec4(clamp(o,0.,1.),1.);`,
  'FFmpeg vf_estdif (Paul B Mahol), one field of a still frame: every other row is rebuilt; for each candidate slope i in +-rslope the cost ecost x sum over +-redge of |prev[x+i+j] - next[x-i+j]| + |prev2[..] - prev[..]| + |next[..] - next2[..]| + mcost x (|p - m| + |n - m|) + dcost x |i| (ecost 2, mcost 1, dcost 1 defaults) picks the edge slope k, then 2-point (prev[x+k] + next[x-k]) / 2, 4-point (9, -1)/16 or 6-point (20, -5, 1)/32 interpolation along it; slope chosen on luma for all channels and searched around zero for every pixel (FFmpeg carries k along the row - sequential, approx.)');

f = add('Color');
f('q41_tetra','Tetrahedral Colour Mixer (OBS shaderfilter tetra)',[S('Corner colour',['Red','Yellow','Green','Cyan','Blue','Magenta'],1),P('Red out',-1,2,1,.01),P('Green out',-1,2,.55,.01),P('Blue out',-1,2,0,.01)],
  `vec3 C[6]=vec3[6](vec3(1.,0.,0.),vec3(1.,1.,0.),vec3(0.,1.,0.),vec3(0.,1.,1.),vec3(0.,0.,1.),vec3(1.,0.,1.));C[int(u_p0+.5)]=vec3(u_p1,u_p2,u_p3);
 vec3 c0=O(uv).rgb;float r=c0.r,g=c0.g,b=c0.b;vec3 o;vec3 W=vec3(1.);
 if(r>g){if(g>b)o=C[0]*(r-g)+C[1]*(g-b)+W*b;else if(r>b)o=C[0]*(r-b)+C[5]*(b-g)+W*g;else o=C[5]*(r-g)+C[4]*(b-r)+W*g;}
 else{if(b>g)o=C[3]*(g-r)+C[4]*(b-g)+W*r;else if(b>r)o=C[3]*(b-r)+C[2]*(g-b)+W*r;else o=C[1]*(r-b)+C[2]*(g-r)+W*b;}
 return vec4(clamp(o,0.,1.),1.);`,
  'obs-shaderfilter examples/tetra.shader: tetrahedral interpolation of the RGB cube - the input is located in one of the six tetrahedra by sorting r, g, b and output as the weighted sum of its corners (black fixed at 0, white fixed at 1, the six primary / secondary corners user colours); the shader has 18 sliders (3 per corner), here one corner is edited at a time and the others stay at their identity colours');
