/* ================= q13: G'MIC community (testing) filters — Iain Fergusson, Joan Rake, PhotoComiX, Prawnsushi, Reptorian, Martin Souphead ================= */
// separable two-sigma Gaussian: rgb blurred with sigma A, alpha = luma blurred with sigma B (mode-dependent sigmas)
const Q13_SB = (dir, first) => `int m=int(u_p0+.5);float big=max(u_res.x,u_res.y);
  float sA=m==1?.1*u_p1*big:m==2?R(30.*u_p1):m==3?R(2.*u_p1):0.;float sB=m==1?.4*u_p1*big:m==4?R(8.*u_p1):0.;
  vec3 a=vec3(0.);float wa=0.,b=0.,wb=0.;for(int i=-24;i<=24;i++){float t=float(i)/8.;float g=exp(-.5*t*t);vec2 qa=uv+${dir}*t*sA*u_px,qb=uv+${dir}*t*sB*u_px;
  a+=${first ? 'O(qa).rgb' : 'T(qa).rgb'}*g;wa+=g;b+=${first ? 'luma(O(qb).rgb)' : 'T(qb).a'}*g;wb+=g;}return vec4(a/wa,b/wb);`;
f = add('Stylize');
f('q13_gmic_stylize','G\'MIC Community Stylize (Turbulent Halftone / Charred Plastic / Whirling Lines / Color Stamp / Metallic Stencils)',
  [S('Filter',['Turbulent Halftone (Iain Fergusson)','Charred Plastic (Joan Rake)','Whirling Lines (Joan Rake)','Color Stamp (PhotoComiX)','Metallic Stencils (PhotoComiX)']),
   P('Scale',.25,4,1,.01),P('Strength',0,2,1,.01),S('Variant',['Variant 1','Variant 2','Variant 3'])],
  [Q13_SB('vec2(1.,0.)', true), Q13_SB('vec2(0.,1.)', false),
   `int m=int(u_p0+.5);int vr=int(u_p3+.5);vec3 o=O(uv).rgb;vec2 p=uv*u_res;
   if(m==0){vec4 acc=vec4(0.);float nn=0.;float cs=max(R(1.),1.);
    cs=max(R(1.2*u_p1),.6);for(int d=0;d<2;d++){vec2 q=p;float sg=d==0?1.:-1.;for(int s=0;s<12;s++){float th=fbm(q/R(22.*u_p1)+3.7)*12.566;vec2 cl=q/cs;acc+=vec4(vnoise(cl),vnoise(cl+71.3),vnoise(cl+139.7),vnoise(cl+211.1));nn+=1.;q+=sg*vec2(cos(th),sin(th))*R(1.*u_p1);}}
    vec4 z=(acc/nn-.5)/.07;vec4 scr=1./(1.+exp(-1.702*z));vec3 ht;
    if(vr==1){float k=1.-max(o.r,max(o.g,o.b));vec3 cmy=(1.-o-k)/max(1.-k,1e-4);vec3 cb=step(1.-scr.rgb,cmy);float kb=step(1.-scr.a,k);ht=(1.-cb)*(1.-kb);}
    else if(vr==2)ht=vec3(step(1.-scr.r,luma(o)));else ht=step(1.-scr.rgb,o);
    return vec4(mix(o,ht,clamp(u_p2,0.,1.)),1.);}
   if(m==1){
#define Q13_CH(QQ) clamp(O(QQ).rgb+u_p2*(T(QQ).rgb-T(QQ).a),0.,1.)
    vec3 im=Q13_CH(uv);float r1=max(hash(p+.31),1e-6),r2=hash(p+5.17);float gm=sqrt(-2.*log(r1));
    im=clamp(im+vec3(gm*cos(6.2832*r2),gm*sin(6.2832*r2),(hash(p+9.7)+hash(p+2.3)+hash(p+4.4)-1.5)*2.)*10./255.,0.,1.);
    float sg=R(20.);float av=0.,wt=0.;for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 d=vec2(float(i),float(j))*.75;float g=exp(-.5*dot(d,d));av+=luma(Q13_CH(uv+d*sg*u_px))*g;wt+=g;}av/=wt;
    float Y=luma(im);return vec4(clamp(im+(av+3.*(Y-av)-Y),0.,1.),1.);}
   if(m==2){float qs=max(6.*u_p2,.5)/255.;
#define Q13_Q(QQ) (floor(T(QQ).rgb/qs+.5)*qs)
    float sm=0.,wsum=0.;float vmax=pow(sqrt(6.)*qs*127.5,.45);
    for(int k=0;k<5;k++){vec2 off=k==0?vec2(0.):k==1?vec2(.5,0.):k==2?vec2(-.5,0.):k==3?vec2(0.,.5):vec2(0.,-.5);vec2 c0=uv+off*u_px;vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);float g;
     if(vr==1){vec3 lp=(Q13_Q(c0+ex)+Q13_Q(c0-ex)+Q13_Q(c0+ey)+Q13_Q(c0-ey)-4.*Q13_Q(c0))*127.5;g=length(lp);}
     else{vec3 gx=(Q13_Q(c0+ex)-Q13_Q(c0-ex))*127.5,gy=(Q13_Q(c0+ey)-Q13_Q(c0-ey))*127.5;g=sqrt(dot(gx,gx)+dot(gy,gy));}
     float v=clamp((pow(g,.45)/vmax-.4)/.2,0.,1.);float w=k==0?2.:1.;sm+=v*w;wsum+=w;}
    float l=sm/wsum;if(vr==2)l=1.-l;return vec4(vec3(l),1.);}
   if(m==3){float h[32];for(int k=0;k<32;k++)h[k]=0.;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float nv=length(O((vec2(float(i),float(j))+.5)/16.).rgb)/1.7321;h[int(clamp(nv*32.,0.,31.))]+=1.;}
    float sa=0.;for(int k=0;k<32;k++)sa+=float(k)*h[k];float wb=0.,sb=0.,best=-1.,th=.5;
    for(int k=0;k<31;k++){wb+=h[k];sb+=float(k)*h[k];float wf=256.-wb;if(wb<1.||wf<1.)continue;float mb=sb/wb,mf=(sa-sb)/wf;float bt=wb*wf*(mb-mf)*(mb-mf);if(bt>best){best=bt;th=(float(k)+1.)/32.;}}
    float st=step(th*u_p2,length(o)/1.7321);float lv=1.+floor(u_p1*2.+.5);vec3 qc=floor(T(uv).rgb*lv+.5)/lv;
    return vec4(vr==1?vec3(st):min(vec3(st),qc),1.);}
   if(m==4){
#define Q13_YN(QQ) (luma(O(QQ).rgb)+(hash(floor((QQ)*u_res))-.5)*.3*u_p2)
    vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);float gx=Q13_YN(uv+ex)-Q13_YN(uv-ex),gy=Q13_YN(uv+ey)-Q13_YN(uv-ey);
    float Yn=(atan(gy,gx)+3.14159)/6.28318;vec3 met=clamp(o+(Yn-luma(o)),0.,1.);float stn=step(T(uv).a-.04,luma(o));
    vec3 r=vr==1?max(met,vec3(stn)):vr==2?mix(2.*met*stn,1.-2.*(1.-met)*(1.-stn),step(.5,met)):min(met,vec3(stn));return vec4(r,1.);}
   return vec4(o,1.);`],
  'G\'MIC community filters. Turbulent Halftone (iain_turbulent_halftone): per channel (RGB / CMYK / luminance by Variant) the value is averaged 50/50 with an equalised turbulence screen and thresholded at 0.5; screen approx. = line-integral of white noise along a smooth random orientation field (stands in for fx_seamless_turbulence), equalised via a logistic CDF. Charred Plastic (fx_charred_plastic): image + Strength x DoG (sigmas 10% and 40% of the image size x Scale; wide blur on luma, approx.), Gaussian noise sigma 10/255, then normalize_local on luminance with amplitude 2 (= avg + 3 (Y - avg), avg = Gaussian sigma 20 px). Whirling Lines (fx_whirling_lines): blur sigma 30 px, round to steps of 6 (x Strength), gradient norm (Variant 2: Laplacian; Variant 3: negative), ^0.45, cut 40-60% of the range and normalise, light antialias. Color Stamp (fx_colorstamp): Otsu threshold (x Strength) of the RGB norm from a 16x16 sample grid, darken-composited with the colour-quantised (posterised, approx. of k-means quantize 20) blurred image; Variant 2 = B/W only. Metallic Stencils (fx_metallicstencils): Couleurs_Metalliques = noise sigma 22 then luminance replaced by the local gradient orientation angle, composited Darken / Lighten / Overlay (Variant) with a stencil; the lylejk stencil source is no longer published, so the stencil is approx. as luminance above its local mean (sigma 8 px)');

f('q13_gmic_mosaic','G\'MIC Community Mosaic (Psychedelic Glasswork Tiler / Little Boxy Things / Smoothelate)',
  [S('Filter',['Psychedelic Glasswork Tiler (PhotoComiX)','Little Boxy Things (Prawnsushi)','Smoothelate (Prawnsushi)']),P('Size',1,40,5,.5,'px'),P('Amount A',0,4,1,.01),P('Amount B',0,4,1,.01)],
  [`int m=int(u_p0+.5);vec2 ip=vec2(uv.x,1.-uv.y)*u_res;
    if(m==0){vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);vec3 gx=(O(uv+ex).rgb-O(uv-ex).rgb)*.5,gy=(O(uv+ey).rgb-O(uv-ey).rgb)*.5;float g=sqrt(dot(gx,gx)+dot(gy,gy));
     return vec4(g>=u_p1*4./255.?uv:vec2(-1.),0.,1.);}
    if(m==1){float gs=max(R(u_p1),1.);float hw=max(R(40.*u_p2)*.5,.5),hh=max(R(60.*u_p3)*.5,.5);vec2 k0=ceil((ip-vec2(hw,hh))/gs),k1=floor((ip+vec2(hw,hh)-.001)/gs);
     vec2 stp=max(vec2(1.),ceil((k1-k0+1.)/24.));vec3 mx=vec3(0.);
     for(int j=0;j<24;j++){float ky=k0.y+float(j)*stp.y;if(ky>k1.y)break;for(int i=0;i<24;i++){float kx=k0.x+float(i)*stp.x;if(kx>k1.x)break;vec2 gp=vec2(kx,ky)*gs+.5;mx=max(mx,O(vec2(gp.x,u_res.y-gp.y)/u_res).rgb);}}
     return vec4(mx,1.);}
    float bs=max(R(8.*u_p1),1.);vec2 cc=(floor(ip/bs)+.5)*bs;return vec4(O(vec2(cc.x,u_res.y-cc.y)/u_res).rgb,1.);`,
   ...[256,128,64,32,16,8,4,2,1,1].map((s, k) => {
     const sub = k % 3 === 0
       ? `vec3 v=T(uv).rgb;vec3 lp=T(uv+vec2(u_px.x,0.)).rgb+T(uv-vec2(u_px.x,0.)).rgb+T(uv+vec2(0.,u_px.y)).rgb+T(uv-vec2(0.,u_px.y)).rgb-4.*v;return vec4(clamp(v-1.96*u_p2*lp*.5,0.,1.),1.);`
       : k % 3 === 1
       ? `vec3 a=vec3(0.);float w=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float g=exp(-float(i*i+j*j)/(2.*.49));a+=T(uv+vec2(float(i),float(j))*u_px).rgb*g;w+=g;}return vec4(a/w,1.);`
       : `vec2 ex=vec2(u_px.x,0.),ey=vec2(0.,u_px.y);vec2 gr=vec2(luma(T(uv+ex).rgb-T(uv-ex).rgb),luma(T(uv+ey).rgb-T(uv-ey).rgb));vec2 tg=length(gr)>1e-5?normalize(vec2(-gr.y,gr.x)):vec2(1.,0.);vec3 a=vec3(0.);float w=0.;float L_=R(12.*u_p3);for(int i=-6;i<=6;i++){float t=float(i)/6.;float g=exp(-2.*t*t);a+=T(uv+tg*t*L_*u_px).rgb*g;w+=g;}return vec4(a/w,1.);`;
     return `int m=int(u_p0+.5);if(m==0){vec4 me=T(uv);vec2 best=me.rg;float bd=best.x<0.?1e9:length((best-uv)*u_res);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 q2=uv+vec2(float(i),float(j))*${s}.*u_px;vec2 sd=T(q2).rg;if(sd.x<0.)continue;float d=length((sd-uv)*u_res);if(d<bd){bd=d;best=sd;}}return vec4(best,me.ba);}
     ${k === 0 ? `if(m==1){
#define Q13_SV(QQ) mix(mix(T(QQ).rgb,vec3(1.),step(1e-4,-(T((QQ)+vec2(u_px.x,0.)).rgb+T((QQ)-vec2(u_px.x,0.)).rgb+T((QQ)+vec2(0.,u_px.y)).rgb+T((QQ)-vec2(0.,u_px.y)).rgb-4.*T(QQ).rgb))),vec3(0.),step(1e-4,T((QQ)+vec2(u_px.x,0.)).rgb+T((QQ)-vec2(u_px.x,0.)).rgb+T((QQ)+vec2(0.,u_px.y)).rgb+T((QQ)-vec2(0.,u_px.y)).rgb-4.*T(QQ).rgb))
       vec3 r=Q13_SV(uv);if(R(2.)>1.2){r=min(r,Q13_SV(uv-vec2(u_px.x,0.)));r=min(r,Q13_SV(uv+vec2(0.,u_px.y)));r=min(r,Q13_SV(uv+vec2(-u_px.x,u_px.y)));}return vec4(r,1.);}` : ''}
     if(m==2&&${k}<9){${sub}}return T(uv);`;
   }),
   `int m=int(u_p0+.5);if(m!=0)return vec4(T(uv).rgb,1.);vec2 ip=vec2(uv.x,1.-uv.y);int it=int(u_p2+.5);for(int k=0;k<4;k++){if(k>=it)break;ip*=2.;ip=vec2(ip.x>1.?2.-ip.x:ip.x,ip.y>1.?2.-ip.y:ip.y);}
    vec2 qq=clamp(vec2(ip.x,1.-ip.y),u_px*.5,1.-u_px*.5);vec2 sd=T(qq).rg;vec3 col=sd.x<0.?O(qq).rgb:O(sd).rgb;float jmp=0.;
    for(int k=0;k<4;k++){vec2 dd=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*u_px;vec2 s2=T(qq+dd).rg;if(s2.x<0.||sd.x<0.)continue;jmp=max(jmp,length((s2-sd)*u_res));}
    col*=1.-smoothstep(2.,4.,jmp);vec3 lo=vec3(1.),hi=vec3(0.);for(int j=0;j<8;j++)for(int i=0;i<8;i++){vec3 v=O((vec2(float(i),float(j))+.5)/8.).rgb;lo=min(lo,v);hi=max(hi,v);}
    col=clamp((col-lo)/max(hi-lo,vec3(.05)),0.,1.);return vec4(clamp(mix(col,2.*col-.5,clamp(u_p3,0.,1.)*.5),0.,1.),1.);`],
  'G\'MIC community. Psychedelic Glasswork Tiler (fx_psyglass): stained_glass = gradient-norm edges (threshold Size x 4 / 255) whose colours flood the regions (nearest-edge colour via jump flooding, approx. of the watershed) with dark leading on the influence-zone borders, equalised (min/max stretch, approx.) and grain-merged with itself (opacity Amount B), then array_mirror (Amount A iterations of a 2x2 mirrored array). Little Boxy Things (pr_lilboxy): grid decimation (one sample every Size px), rectangular dilation 40 x A by 60 x B px, sharpen 100000 (inverse diffusion: every non-flat pixel saturates to the channel min or max), erode 2x2. Smoothelate (pr_smoothelate): pixelation (block 8 x Size px), then 3 x [inverse-diffusion sharpen (amount A), Gaussian 0.7, anisotropic smoothing along isophotes (length 12 x B px, approx. of smooth)]. Jump flooding needs float render targets');

f = add('Render');
f('q13_gmic_sketch','G\'MIC Community Line Drawing (Sketchy Ellipses / Line Spam)',
  [S('Pattern',['Sketchy Ellipses (Prawnsushi)','Line Spam (Prawnsushi)']),P('Amount',.1,2,1,.01),P('Size',.1,4,1,.01),P('Opacity',0,2,1,.01)],
  `int m=int(u_p0+.5);vec3 o=O(uv).rgb;vec2 ip=vec2(uv.x,1.-uv.y)*u_res;float W=u_res.x,H=u_res.y;
  if(m==0){int N=int(2000.*u_p1);vec3 col=o;float x0=35.,y0=35.,xb=35.,yb=35.,Sz=0.;
   for(int i=0;i<4000;i++){if(i>=N)break;float fi=float(i);float op=hash(vec2(fi,3.7+u_seed))*.3*u_p3;float an=radians(fi),bn=radians(float(N-1-i));float Rx=Sz*.01*W,Ry=Sz*2.*.01*H;float rm=max(Rx,Ry)+2.;
    for(int k=0;k<8;k++){int kk=k-(k/4)*4;bool B=k>=4;float a_=B?xb:x0,b_=B?yb:y0;vec2 cc=kk==0?vec2(a_,b_):kk==1?vec2(a_,a_):kk==2?vec2(b_,a_):vec2(b_,b_);
     vec2 d=ip-cc*.01*vec2(W,H);if(dot(d,d)>rm*rm)continue;float th=B?bn:an;float cs=cos(th),sn=sin(th);vec2 e=vec2(cs*d.x+sn*d.y,-sn*d.x+cs*d.y);
     vec2 rr=vec2(max(Rx,.3),max(Ry,.3));float fv=length(e/rr);vec2 gr=e/(rr*rr)/max(fv,1e-4);float dist=abs(fv-1.)/max(length(gr),1e-4);
     col=mix(col,B?vec3(1.):vec3(0.),op*clamp(1.-dist,0.,1.));}
    x0+=.007;y0+=.004;xb+=.004;yb+=.004;Sz+=hash(vec2(fi,9.1+u_seed))*.04*u_p2;}
   return vec4(col,1.);}
  int N=int(30.*u_p1+.5);vec4 Lr=vec4(0.);vec3 cl=vec3(1.,85./255.,0.);float op=clamp(.8*u_p3,0.,1.);
  for(int k=0;k<4;k++){vec2 fp=ip;float fw=W,fh=H;for(int r=0;r<4;r++){if(r>=k)break;fp=vec2(fh-1.-fp.y,fp.x);float t_=fw;fw=fh;fh=t_;}
   float th=3.*u_p2*u_k;for(int i=0;i<200;i++){if(i>=N)break;float A=float(i),B=float(N-1-i);vec2 p0=vec2(.02*fw,A*.1*fh),p1=vec2((B+101.)*.01*fw,(100.-A*B)*.01*fh);
    vec2 pa=fp-p0,ba=p1-p0;float hh=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.,1.);float d=length(pa-ba*hh);float cov=clamp(th*.5-d+.5,0.,1.)*op;Lr=Lr*(1.-cov)+vec4(cl,1.)*cov;th*=1.02;}}
  return vec4(Lr.rgb*Lr.a+o*(1.-Lr.a),1.);`,
  'G\'MIC community, per-pixel replay of the drawing loops. Sketchy Ellipses (pr_sketchy_ellipses): 2000 x Amount iterations; each draws 4 + 4 one-pixel ellipse outlines (centres (x,y),(x,x),(y,x),(y,y) in % starting at 35 and drifting by 0.007/0.004 % per step; radius S % of the width, S x 2 % of the height, S grows by uniform(0, 0.04 x Size); angle = i degrees, set B reversed) in black (set A) and white (set B) at random opacity up to 0.3 x Opacity. Line Spam (pr_linespam, style A): 30 x Amount thick lines per quarter turn (4 rotations of the canvas) from (2%, 10i%) to ((N-1-i+101)%, (100-i(N-1-i))%), thickness 3 x Size px growing x1.02, orange (255,85,0) at opacity 0.8 x Opacity on a transparent layer, then alpha-blended over the image');

f('q13_gmic_texture','G\'MIC Community Textures (Reptorian / Martin Souphead generators)',
  [S('Texture',['Three-Coupled Oscillators','Construction Material Texture (approx.)','Color Modulo Texture','Binary Alternating Quaddro Texture','Random Rectangle Division','Spiral RGB','Prime Surface (Ulam spiral)']),
   P('Scale',.25,8,1,.01),P('Variation',-1,1,0,.01),P('Seed / option',0,20,0,1)],
  `int m=int(u_p0+.5);vec2 fp=vec2(PX(uv).x,(1.-uv.y)*u_res.y/u_k);vec2 FR=u_res/u_k;
  if(m==0){float tau=6.28318,tc=.7/tau;float ka=tau*(.5+.5*u_p2),kb=-tau*.5;float sd=max(u_res.x,u_res.y)/min(u_res.x,u_res.y);vec2 sxy=u_res.x>u_res.y?vec2(sd,1.):vec2(1.,sd);
   float lo=1e9,hi=-1e9,val=0.;for(int s=0;s<37;s++){vec2 u2=s<36?(vec2(float(s-(s/6)*6),float(s/6))+.5)/6.:uv;float xp=(2.*u2.x-1.)*sxy.x*u_p1,yp=(1.-2.*u2.y)*sxy.y*u_p1;
    for(int i=0;i<50;i++){float tx=xp;xp=xp+ka-tc*sin(tau*yp);yp=yp+kb-tc*sin(tau*tx);}float nv=length(vec2(xp,yp));if(s<36){lo=min(lo,nv);hi=max(hi,nv);}else val=nv;}
   return vec4(vec3(clamp((val-lo)/max(hi-lo,1e-5),0.,1.)),1.);}
  if(m==1){float vv[3];for(int s=0;s<3;s++){vec2 q=fp+vec2(float(s-1)*5.,0.);vec2 nq=q/(88.*u_p1)+u_p3*13.1;float n=0.,am=1.,tot=0.;for(int o=0;o<8;o++){n+=am*vnoise(nq);tot+=am;am/=2.5;nq=nq*2.+.37;}n/=tot;
    vec2 wq=(q+(n-.5)*vec2(.19,.52)*(1.+u_p2)*120.)/(88.*u_p1)+u_p3*13.1+5.3;float n2=0.;am=1.;for(int o=0;o<8;o++){n2+=am*vnoise(wq);am/=2.5;wq=wq*2.+.37;}n2/=tot;
    vv[s]=clamp(.5+(n2-.5)*1.3+(hash(floor(q))-.5)*.14,0.,1.)*188./255.;}
   float e=(vv[2]-vv[0])*1.5;return vec4(vec3(clamp(vv[1]+e,0.,1.)),1.);}
  if(m==2){vec2 c=(fp-FR*.5)/u_p1;float an=radians(u_p2*180.);float ca=cos(an),sa=sin(an);float xx=c.x*ca-c.y*sa,yy=c.x*sa+c.y*ca;vec3 s3=vec3(yy,xx,abs(abs(xx)-abs(yy)));
   int md=int(mod(3.+u_p3,4.));vec3 r=md==0||md==2?mod(s3,255.):255.-abs(255.-mod(s3,510.));return vec4(r/255.,1.);}
  if(m==3){
#define Q13M(AA,MM) ((AA)-(MM)*int(floor(float(AA)/float(MM))))
   int X=int(floor(fp.x+.5))+1,Y=int(floor(fp.y+.5))+1;int v1=int(8.*u_p1+.5),v2=v1;int sd_=int(u_p3+.5);int op=(2+sd_)-((2+sd_)/3)*3;int st=(sd_/3)-((sd_/3)/3)*3;bool vpos=u_p2>=0.;int md=256;int r;
   if(st==2)r=Q13M((X^v1)+(Y^v2),md);else{bool cnd=op!=2?vpos:!vpos;int XS=cnd?X:-X;int YS=st==1?(cnd?-Y:Y):(cnd?Y:-Y);
    r=op==1?(md-1)-Q13M((XS|v1)+(YS|v2),md):op==2?Q13M((XS^v1)+(YS^v2),md):Q13M((XS&v1)+(YS&v2),md);}
   return vec4(vec3(float(Q13M(r,256))/255.),1.);}
  if(m==4){vec2 lo=vec2(0.),hi=FR;float id=u_p3*7.31+1.;
   for(int lv=0;lv<5;lv++){vec2 sz=hi-lo;if(min(sz.x,sz.y)<12.)break;if(lv>0&&hash(vec2(id,float(lv)+.5))>.95)break;bool vx=hash(vec2(id,2.7))<sz.x/(sz.x+sz.y);int n=2+int(hash(vec2(id,5.3))*9.);
    float tot=0.;for(int k=0;k<10;k++){if(k>=n)break;tot+=.4+hash(vec2(id,float(k)+11.));}float at=vx?(fp.x-lo.x)/sz.x:(fp.y-lo.y)/sz.y;float cum=0.;int ck=n-1;float c0=0.,c1=1.;
    for(int k=0;k<10;k++){if(k>=n)break;float wk=(.4+hash(vec2(id,float(k)+11.)))/tot;if(at<cum+wk||k==n-1){ck=k;c0=cum;c1=cum+wk;break;}cum+=wk;}
    if(vx){float a0=lo.x+c0*sz.x;hi.x=lo.x+c1*sz.x;lo.x=a0;}else{float a0=lo.y+c0*sz.y;hi.y=lo.y+c1*sz.y;lo.y=a0;}id=floor(hash(vec2(id,float(ck)+.13))*9973.)+float(lv);}
   vec2 dd=min(fp-lo,hi-fp);float gap=max(1.,round(5.*u_p1*.35));if(min(dd.x,dd.y)<gap*.5)return vec4(0.,0.,0.,1.);float gv=hash(vec2(id,1.9));
   return vec4(u_p2>.33?hsv2rgb(vec3(gv,.65,.92)):vec3(gv),1.);}
  if(m==5){vec2 XY=uv*2.-1.;float a=atan(XY.y,XY.x);if(a<0.)a+=6.28318;float rr=length(XY);float dr=u_p2<0.?-1.:1.;vec3 rot=vec3(1.,3.,5.)*u_p1;return vec4(sin(rr*rot*6.28318+a*dr+6.28318)*.5+.5,1.);}
  float cs=max(u_p1,.25);vec2 g=floor(fp/cs);vec2 D=floor(FR/cs);if(u_p2<-.5)g.x=D.x-1.-g.x;float al=min(min(g.x,g.y),min(D.x-1.-g.x,D.y-1.-g.y));
  float t0=al*2.*(D.x+D.y)-4.*al*al;float X=g.x-al,Y=g.y-al,Wd=D.x-2.*al,Hd=D.y-2.*al;float t=t0+(Y==0.?X:X==Wd-1.?Wd-1.+Y:Y==Hd-1.?2.*Wd+Hd-3.-X:2.*(Wd+Hd-2.)-Y);
  if(u_p2>.5)t=D.x*D.y-1.-t;int n=int(t+.5);bool pr=n>=2;if(n>3){if(n-(n/2)*2==0)pr=false;else for(int d=3;d<9000;d+=2){if(d*d>n)break;if(n-(n/d)*d==0){pr=false;break;}}}
  return vec4(vec3(pr?1.:0.),1.);`,
  'G\'MIC community generators (input image ignored). Three-Coupled Oscillators (fx_rep_tco): 50 iterations of x += kA - (0.7/2pi) sin(2pi y), y += kB - (0.7/2pi) sin(2pi x_old) from the axis-scaled centred plane (kA = 2pi(0.5 + Variation/2), kB = -pi), |(x,y)| normalised over a 6x6 sample grid, grayscale. Construction Material (_cons_turb, approx.): 8-octave fractal noise (radius 88 x Scale px, damping 2.5) warped by its own intensity (0.19, 0.52), grain noise, range 0-188, emboss relief grain-merged. Color Modulo (rep_color_modulo_texture): channels = y, x and ||x|-|y|| of the centred, rotated (Variation x 180 deg) plane / Scale through modulo 255 (Seed selects regular / continuous / divisive / continuous divisive; default continuous divisive). Binary Alternating Quaddro (rep_binaltquad, 8-bit): bitwise (X op v)+(Y op v) mod 256 with v = 8 x Scale; Seed picks operand (XOR, AND, OR) and style (cracking / glasses / simple); Variation sign = sign of variable 3 (the expression\'s own int(frac) reduces the comparison to 0 < V). Random Rectangle Division (rep_rrd, own RNG): up to 5 levels of 2-10 uneven splits with 95% continuation, 2 px black borders, gray (or colour when Variation > 0.33) cells; Seed = seed. Spiral RGB (spiral_RGB): channel = sin(2pi r n + angle) with n = (1,3,5) x Scale, Variation < 0 = counter-clockwise. Prime Surface (rep_prime_surface): spiralbw rectangular spiral index (from the top-left corner inward, cells of Scale px) set to 1 where prime; Variation > 0.5 negates the numbering, < -0.5 mirrors x');

f = add('Distort');
f('q13_gmic_warp','G\'MIC Community Warps (Strange Bulger / Logarithmic Distortion / Tiled Zoom / Grouped Pixel Shift)',
  [S('Warp',['Strange Bulger (X axis)','Strange Bulger (Y axis)','Logarithmic Distortion','Tiled Zoom','Grouped Pixel Shift (horizontal)','Grouped Pixel Shift (vertical)']),
   P('Amount',0,10,1,.01),P('Angle or position',-180,180,0,1,'deg'),P('Tile size or threshold',0,100,10,.5,'%')],
  `int m=int(u_p0+.5);float W=u_res.x,H=u_res.y;vec2 ip=vec2(uv.x,1.-uv.y)*u_res;
#define Q13_UV(VV) vec2((VV).x/W,1.-(VV).y/H)
  if(m<=1){float cX=W*.5,cY=H*.5,ba=radians(u_p2);float vx=m==1?ip.x:cX-ip.x,vy=m==1?cY-ip.y:ip.y;vx=vx*vx/cX;vy=vy*vy/cY;
   vec2 w2=vec2(ip.x+(ip.x-vx)*cos(ba)+(ip.y-vy)*sin(ba),ip.y+(ip.x-vx)*sin(ba)+(ip.y-vy)*cos(ba));return vec4(O(fract(Q13_UV(mix(ip,w2,u_p1)))).rgb,1.);}
  if(m==2){float sd=W/H;float an=radians(u_p2);float ca=cos(an),sa=sin(an);float ix=(ip.x/W-.5)/(H>W?1./sd:1.),iy=(ip.y/H-.5)/(W>H?sd:1.);
   float IX=ix*ca-iy*sa,IY=ix*sa+iy*ca;ix=abs(IX)*512.;iy=abs(IY)*512.;float lx=(ix==0.||iy==0.)?0.:log(ix*iy)*u_p1;ix+=lx;iy+=lx;
   return vec4(O(fract(Q13_UV(vec2(ix*W/512.,iy*H/512.)))).rgb,1.);}
  if(m==3){vec2 fp=ip/u_k;vec2 FR=u_res/u_k;float hd=length(FR)*.5;float sw=max(floor(u_p3*.01*hd+.5),1.);float sdv=1.+u_p1;vec2 cnt=ceil(FR/sw);vec2 off=floor((sw*cnt-FR)*.5);
   vec2 fx=floor(fp);vec2 kk=mod(fx+off,vec2(sw));vec2 cen=vec2((sw-1.)*.5);vec2 s2=fx+(kk-cen)*(sdv-1.);if(any(lessThan(s2,vec2(0.)))||any(greaterThanEqual(s2,FR)))return vec4(0.,0.,0.,1.);
   return vec4(O(Q13_UV((s2+.5)*u_k)).rgb,1.);}
  bool hz=m==4;float thr=u_p3*.01;float infl=clamp(u_p1,0.,1.);float pos=clamp((u_p2+180.)/360.,0.,1.);float N=hz?W:H;float st=max(1.,ceil(N/700.));int M=int(ceil(N/st));float me=floor((hz?ip.x:ip.y)/st);
  int found=0;for(int j=0;j<700;j++){if(j>=M)break;float cj=(float(j)+.5)*st;vec2 sp=hz?vec2(cj,ip.y):vec2(ip.x,cj);if(luma(O(Q13_UV(sp)).rgb)>=thr)found++;}
  if(found==M)return vec4(O(uv).rgb,1.);float rf=floor(float(M-found)*pos+.5);int k=0;vec3 col=vec3(0.);
  for(int j=0;j<700;j++){if(j>=M)break;float cj=(float(j)+.5)*st;vec2 sp=hz?vec2(cj,ip.y):vec2(ip.x,cj);vec3 v=O(Q13_UV(sp)).rgb;if(luma(v)>=thr){float tg=floor(mix(float(j),rf+float(k),infl)+.5);if(tg==me)col=v;k++;}}
  return vec4(col,1.);`,
  'Reptorian (G\'MIC community), exact formulas. Strange Bulger (rep_strange_bulger, from Asmageddon\'s PDN pack): vx = (cX - x)^2 / cX, vy = y^2 / cY (axis X; Y axis swaps roles), source = (x + (x - vx) cos a + (y - vy) sin a, y + (x - vx) sin a + (y - vy) cos a), periodic; Amount scales the displacement. Logarithmic Distortion (rep_logarithmic_pinching_distortion, GUI defaults): centred rotated coords |.| x 512, both axes shifted by Amount x log(ix iy), periodic. Tiled Zoom (rep_tiled_zoom): square tiles of Size % of the half diagonal, each showing its neighbourhood minified by 1 + Amount, outside = black (boundary None). Grouped Pixel Axis-Based Shift (rep_shift_pixel_to_boundary_with_group_pixels, MadJik Gravity): per row / column the pixels with luminance >= threshold (stands in for alpha) are packed toward the position (angle -180..180 = start..end) with influence Amount (0..1); others become black; rows longer than 700 px are sampled');

f = add('Blur');
f('q13_blur_cs','Gaussian Blur by Color Space (Reptorian)',[S('Color space',['RGB','sRGB (re-encoded)','CMYK','HSI','HSL','HSV','Lab','LCh']),P('XY sigma',0,60,3,.1,'px'),P('Extra X sigma',0,20,0,.1,'px'),P('Extra Y sigma',0,20,0,.1,'px')],
  [`int m=int(u_p0+.5);vec3 c3=O(uv).rgb;
   if(m==1)return vec4(mix(12.92*c3,1.055*pow(c3,vec3(1./2.4))-.055,step(.0031308,c3)),1.);
   if(m==2){float k=1.-max(c3.r,max(c3.g,c3.b));return vec4((1.-c3-k)/max(1.-k,1e-5),k);}
   if(m==3){float I=(c3.r+c3.g+c3.b)/3.;float Sa=I>1e-5?1.-min(c3.r,min(c3.g,c3.b))/I:0.;float nm=.5*((c3.r-c3.g)+(c3.r-c3.b)),dn=sqrt((c3.r-c3.g)*(c3.r-c3.g)+(c3.r-c3.b)*(c3.g-c3.b));
    float th=acos(clamp(nm/max(dn,1e-6),-1.,1.));return vec4((c3.b>c3.g?6.28318-th:th)/6.28318,Sa,I,1.);}
   if(m==4)return vec4(rgb2hsl(c3),1.);if(m==5)return vec4(rgb2hsv(c3),1.);
   if(m>=6){vec3 l=mix(c3/12.92,pow((c3+.055)/1.055,vec3(2.4)),step(.04045,c3));vec3 X=vec3(dot(l,vec3(.4124564,.3575761,.1804375))/.95047,dot(l,vec3(.2126729,.7151522,.072175)),dot(l,vec3(.0193339,.119192,.9503041))/1.08883);
    vec3 fx=mix(X/(3.*.0428099)+4./29.,pow(max(X,vec3(0.)),vec3(1./3.)),step(.008856,X));float L_=116.*fx.y-16.,a=500.*(fx.x-fx.y),b=200.*(fx.y-fx.z);
    if(m==6)return vec4(L_/100.,(a+128.)/255.,(b+128.)/255.,1.);return vec4(L_/100.,sqrt(a*a+b*b)/134.,fract(atan(b,a)/6.28318),1.);}
   return vec4(c3,1.);`,
   BH('2.*sqrt(u_p1*u_p1+u_p2*u_p2)'), BV('2.*sqrt(u_p1*u_p1+u_p3*u_p3)'),
   `int m=int(u_p0+.5);vec4 v=T(uv);vec3 c3=v.rgb;
   if(m==1)c3=mix(c3/12.92,pow((c3+.055)/1.055,vec3(2.4)),step(.04045,c3));
   else if(m==2)c3=(1.-c3)*(1.-v.a);
   else if(m==3){float h=c3.x*6.28318,Sa=c3.y,I=c3.z;float t3=2.0944;vec3 r;
    if(h<t3){float b=I*(1.-Sa),r0=I*(1.+Sa*cos(h)/cos(1.0472-h));r=vec3(r0,3.*I-r0-b,b);}
    else if(h<2.*t3){h-=t3;float r0=I*(1.-Sa),g=I*(1.+Sa*cos(h)/cos(1.0472-h));r=vec3(r0,g,3.*I-r0-g);}
    else{h-=2.*t3;float g=I*(1.-Sa),b=I*(1.+Sa*cos(h)/cos(1.0472-h));r=vec3(3.*I-g-b,g,b);}c3=r;}
   else if(m==4)c3=hsl2rgb(c3);else if(m==5)c3=hsv2rgb(vec3(fract(c3.x),c3.yz));
   else if(m>=6){float L_=c3.x*100.,a,b;if(m==6){a=c3.y*255.-128.;b=c3.z*255.-128.;}else{float C=c3.y*134.,h=c3.z*6.28318;a=C*cos(h);b=C*sin(h);}
    float fy=(L_+16.)/116.;vec3 fv=vec3(fy+a/500.,fy,fy-b/200.);vec3 X=mix(3.*.0428099*(fv-4./29.),fv*fv*fv,step(.206897,fv))*vec3(.95047,1.,1.08883);
    vec3 l=vec3(dot(X,vec3(3.2404542,-1.5371385,-.4985314)),dot(X,vec3(-.969266,1.8760108,.041556)),dot(X,vec3(.0556434,-.2040259,1.0572252)));l=max(l,vec3(0.));
    c3=mix(12.92*l,1.055*pow(l,vec3(1./2.4))-.055,step(.0031308,l));}
   return vec4(clamp(c3,0.,1.),1.);`],
  'fx_rep_blur_cs: convert to the colour space (values normalised to 0-1: Lab a,b +128 / 255, LCh C / 134, hues as 0-1 and blurred as plain numbers like G\'MIC, so hue wrap-around artefacts are part of the look), Gaussian blur sigma XY then extra X / Y sigma (combined in quadrature), convert back. sRGB = the image re-encoded with the sRGB curve before blurring (G\'MIC rgb2srgb); CMYK keeps K in alpha');
