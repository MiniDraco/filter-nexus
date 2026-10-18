/* ================= q43: HALCON operators + Mehdi plug-ins (round 17) ================= */
// bisection rank selection over a vec3 array (per channel, exact after the snap step); k = 0-based rank
const Q43_SEL = (a, n, N, k, o) => `vec3 ${o};{vec3 lo=vec3(-.001),hi=vec3(1.001);for(int it=0;it<12;it++){vec3 md=(lo+hi)*.5;vec3 cn=vec3(0.);for(int q=0;q<${N};q++){if(q>=(${n}))break;cn+=step(${a}[q],md);}vec3 ok=step(float(${k})+.5,cn);hi=mix(hi,md,ok);lo=mix(md,lo,ok);}
 vec3 sn=vec3(-1.);for(int q=0;q<${N};q++){if(q>=(${n}))break;sn=max(sn,mix(vec3(-1.),${a}[q],step(${a}[q],hi)));}${o}=sn;}`;
const Q43_RANK = (src, pct) => `int rr=int(clamp(floor(R(u_p1)+.5),1.,6.));float r2=(float(rr)+.5)*(float(rr)+.5);vec3 a[169];int n=0;
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){if(abs(i)>rr||abs(j)>rr)continue;if(u_p0<.5&&float(i*i+j*j)>r2)continue;a[n]=clamp(${src}(uv+vec2(float(i),float(j))*u_px).rgb,0.,1.);n++;}
 int kk=int(floor((${pct})/100.*float(n-1)+.5));${Q43_SEL('a', 'n', 169, 'kk', 'res')}return vec4(res,1.);`;

f = add('Noise');
f('q43_elimminmax','Extremum-only Smoothing (HALCON eliminate_min_max)',[P('Mask width',3,9,3,2,'px'),P('Mask height',3,9,3,2,'px'),P('Gap (levels)',0,50,1,.5),S('Mode',['1 next extremum','2 neighbourhood mean','3 neighbourhood median'],2)],
  `int hw=int(clamp(floor(R(u_p0)*.5+.01),1.,4.)),hh=int(clamp(floor(R(u_p1)*.5+.01),1.,4.));float gp=u_p2/255.;vec3 x=O(uv).rgb;vec3 mn=vec3(9.),mx=vec3(-9.),sm=vec3(0.);vec3 a[81];int n=0;
 for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(abs(i)>hw||abs(j)>hh)continue;vec3 v=clamp(O(uv+vec2(float(i),float(j))*u_px).rgb,0.,1.);a[n]=v;n++;sm+=v;if(i!=0||j!=0){mn=min(mn,v);mx=max(mx,v);}}
 vec3 isx=step(mx+gp+1e-5,x),isn=step(x,mn-gp-1e-5);vec3 rep;int m=int(u_p3+.5);
 if(m==0)rep=isx*mx+isn*mn;else if(m==1)rep=sm/float(n);else{${Q43_SEL('a', 'n', 81, 'n/2', 'medv')}rep=medv;}
 return vec4(mix(x,rep,max(isx,isn)),1.);`,
  'HALCON eliminate_min_max: a pixel is replaced only when it exceeds (or falls below) every neighbour of the MaskWidth x MaskHeight window by more than Gap; replacement 1 = next extremum (largest/smallest neighbour), 2 = window mean, 3 = window median (exact per-channel rank selection)');
f('q43_dualrank','Dual Rank Filter (HALCON dual_rank)',[S('Mask type',['Circle','Square']),P('Radius',1,6,1,1,'px'),P('Mode percent',0,100,10,1)],
  [Q43_RANK('T', 'u_p2'), Q43_RANK('T', '100.-u_p2')],
  'HALCON dual_rank: rank filter at ModePercent followed by a rank filter at 100-ModePercent on the result (0 = grey opening, 50 = median twice, 100 = grey closing); circle or square mask, exact per-channel rank selection');
f('q43_sepmedian','Separable Median (HALCON median_separate)',[P('Mask width',1,25,5,2,'px'),P('Mask height',1,25,5,2,'px')],
  [`int hw=int(clamp(floor(R(u_p0)*.5+.01),0.,12.));vec3 a[25];int n=0;for(int i=-12;i<=12;i++){if(abs(i)>hw)continue;a[n]=clamp(O(uv+vec2(float(i),0.)*u_px).rgb,0.,1.);n++;}${Q43_SEL('a', 'n', 25, 'n/2', 'r')}return vec4(r,1.);`,
   `int hw=int(clamp(floor(R(u_p0)*.5+.01),0.,12.)),hh=int(clamp(floor(R(u_p1)*.5+.01),0.,12.));vec3 a[25];int n=0;
 for(int j=-12;j<=12;j++){if(abs(j)>hh)continue;a[n]=T(uv+vec2(0.,float(j))*u_px).rgb;n++;}${Q43_SEL('a', 'n', 25, 'n/2', 'A')}
 vec3 b[25];int nb=0;for(int i=-12;i<=12;i++){if(abs(i)>hw)continue;n=0;for(int j=-12;j<=12;j++){if(abs(j)>hh)continue;a[n]=clamp(O(uv+vec2(float(i),float(j))*u_px).rgb,0.,1.);n++;}${Q43_SEL('a', 'n', 25, 'n/2', 'cm')}b[nb]=cm;nb++;}
 ${Q43_SEL('b', 'nb', 25, 'nb/2', 'B')}return vec4((A+B)*.5,1.);`],
  'HALCON median_separate: (horizontal 1 x W median then vertical H x 1 median) and (vertical then horizontal) computed separately and averaged; exact per-channel medians, masks up to 25 px');

f = add('Analysis');
f('q43_topo','Topographic Primal Sketch (HALCON topographic_sketch)',[P('Scale (sigma)',.7,4,1.2,.05,'px'),P('Gradient tolerance',0,.2,.02,.002),P('Curvature tolerance',0,.1,.006,.001),S('Output',['Class colours','Label image (class/11)','Ridges and ravines over image'])],
  `float sg=max(R(u_p0),.5);float rr=min(ceil(3.*sg),8.);float st=max(1.,ceil(3.*sg)/8.);float hxx=0.,hyy=0.,hxy=0.,gx=0.,gy=0.,gw=0.,sv=0.,mxx=0.,myy=0.;
 for(int j=-8;j<=8;j++)for(int i=-8;i<=8;i++){if(abs(float(i))>rr||abs(float(j))>rr)continue;vec2 d=vec2(float(i),float(j))*st;float w=exp(-dot(d,d)/(2.*sg*sg));float v=L(uv+d*u_px);hxx+=v*w*d.x*d.x/(sg*sg);hyy+=v*w*d.y*d.y/(sg*sg);mxx+=w*d.x*d.x/(sg*sg);myy+=w*d.y*d.y/(sg*sg);hxy+=v*w*d.x*d.y/(sg*sg);gx+=v*w*d.x/sg;gy+=v*w*d.y/sg;gw+=w;sv+=v*w;}
 hxx=(hxx-sv*mxx/gw)/gw;hyy=(hyy-sv*myy/gw)/gw;hxy/=gw;gx/=gw;gy/=gw;float g=length(vec2(gx,gy));float ta=u_p1,tc=u_p2;
 float tmp2=sqrt((hxx-hyy)*(hxx-hyy)+4.*hxy*hxy);float la=.5*(hxx+hyy+tmp2),lb=.5*(hxx+hyy-tmp2);
 vec2 wa=normalize(abs(hxy)>1e-7?vec2(hxy,la-hxx):(hxx>=hyy?vec2(1.,0.):vec2(0.,1.))),wb=vec2(-wa.y,wa.x);
 int cl=6;bool za=abs(la)<=tc,zb=abs(lb)<=tc;
 if(g<=ta){if(la<-tc&&lb<-tc)cl=1;else if(la>tc&&lb>tc)cl=2;else if(za&&lb<-tc)cl=3;else if(la>tc&&zb)cl=4;else if(la>tc&&lb<-tc)cl=5;else cl=6;}
 else{float rb=abs(dot(vec2(gx,gy),wb))/max(abs(lb),1e-7),ra=abs(dot(vec2(gx,gy),wa))/max(abs(la),1e-7);float half_=.5/max(sg,.5);
  if(lb<-tc&&rb<=half_)cl=3;else if(la>tc&&ra<=half_)cl=4;else{vec2 gn=vec2(gx,gy)/g;float d2=hxx*gn.x*gn.x+2.*hxy*gn.x*gn.y+hyy*gn.y*gn.y;
   if(za&&zb)cl=7;else if(abs(d2)<=tc*.25)cl=11;else if(la<=tc&&lb<-tc)cl=8;else if(lb>=-tc&&la>tc)cl=9;else cl=10;}}
 int m=int(u_p3+.5);if(m==1)return vec4(vec3(float(cl)/11.),1.);
 vec3 pal[12];pal[0]=vec3(0.);pal[1]=vec3(1.,.15,.1);pal[2]=vec3(.1,.3,1.);pal[3]=vec3(1.,.9,.1);pal[4]=vec3(.1,.85,1.);pal[5]=vec3(.9,.2,.9);pal[6]=vec3(.12);pal[7]=vec3(.5);pal[8]=vec3(.95,.6,.35);pal[9]=vec3(.35,.6,.95);pal[10]=vec3(.6,.4,.7);pal[11]=vec3(.4,.8,.4);
 vec3 col=pal[0];for(int k=1;k<12;k++)if(k==cl)col=pal[k];
 if(m==2){vec3 b=O(uv).rgb*.45;return vec4(cl==3?vec3(1.,.9,.1):cl==4?vec3(.1,.85,1.):b,1.);}
 return vec4(col,1.);`,
  'HALCON topographic_sketch (Haralick-Watson-Laffey 1983 primal sketch): Gaussian-facet gradient and Hessian, 11 classes 1 peak 2 pit 3 ridge 4 ravine 5 saddle 6 flat 7 hillside slope 8 convex 9 concave 10 saddle hill 11 inflection; ridges/ravines use the facet zero-crossing test (|grad.w/lambda| within half a pixel); approx.: Gaussian derivatives replace the bicubic facet fit, inflection = vanishing 2nd derivative along the gradient');
f('q43_dots','Dot Enhancement (HALCON dots_image)',[P('Diameter',3,23,5,2,'px'),S('Filter type',['Light','Dark','All']),P('Pixel shift',-1,2,0,1)],
  `float d=max(R(u_p0),2.);float ri=d*.5,ro=d;float st=max(1.,ro/10.);float si=0.,so=0.,ni=0.,no=0.;
 for(int j=-10;j<=10;j++)for(int i=-10;i<=10;i++){vec2 o=vec2(float(i),float(j))*st;float rq=length(o);if(rq>ro)continue;float v=L(uv+o*u_px);if(rq<=ri){si+=v;ni+=1.;}else{so+=v;no+=1.;}}
 float r=si/max(ni,1.)-so/max(no,1.);int m=int(u_p1+.5);float o=m==0?max(r,0.):m==1?max(-r,0.):abs(r);
 return vec4(vec3(clamp(o*2.*pow(2.,u_p2),0.,1.)),1.);`,
  'HALCON dots_image: matched filter tuned to the dot diameter (light, dark or all dots), PixelShift scales the response by 2^shift; approx.: zero-mean disc (diameter D) minus surrounding ring (to 2D) kernel since the published mask coefficients are not given');

f = add('Edges');
f('q43_sojka','Sojka Corner Detector (HALCON points_sojka)',[P('Min gradient',5,60,30,1),P('Min apparentness',10,1500,90,5),P('Min angle (rad)',0,3.1,.5,.05),S('Output',['Corners over image','Apparentness map'])],
  [`float mg=u_p0/255.;vec2 e=u_px;
 #define Q43G(Q0) (vec2(L((Q0)+vec2(e.x,0.))-L((Q0)-vec2(e.x,0.)),L((Q0)+vec2(0.,e.y))-L((Q0)-vec2(0.,e.y)))*.5)
 vec2 gc=Q43G(uv);if(length(gc)<mg)return vec4(0.,0.,0.,1.);float sw=2.5,sd=.75;vec2 mvec=vec2(0.);float W=0.;vec2 ns[81];float ws[81];int n=0;
 for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){vec2 dd=vec2(float(i),float(j));vec2 g=Q43G(uv+dd*u_px);float gm=length(g);if(gm<mg)continue;vec2 nq=g/gm;float dist=abs(dot(dd,nq));
  float w=exp(-dot(dd,dd)/(2.*sw*sw))*exp(-dist*dist/(2.*sd*sd))*gm*255.;ns[n]=nq;ws[n]=w;n++;mvec+=w*nq;W+=w;}
 if(W<=0.)return vec4(0.,0.,0.,1.);vec2 mh=normalize(mvec+1e-9);float ap=0.;for(int q=0;q<81;q++){if(q>=n)break;float an=atan(ns[q].x*mh.y-ns[q].y*mh.x,dot(ns[q],mh));ap+=ws[q]*an*an;}
 float ang=2.*sqrt(ap/W);float ok=step(u_p1,ap)*step(u_p2,ang);return vec4(ok*ap/1500.,ap/1500.,0.,1.);`,
   `float v=T(uv).r;bool mx=v>0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(i==0&&j==0)continue;float q=T(uv+vec2(float(i),float(j))*u_px).r;if(q>v||(q==v&&(j>0||(j==0&&i>0))))mx=false;}
 if(u_p3>.5)return vec4(ramp(1,clamp(T(uv).g*6.,0.,1.)),1.);vec3 b=O(uv).rgb*.6;
 float hit=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;float a=T(q).r;if(a<=0.)continue;bool lm=true;for(int jj=-2;jj<=2;jj++)for(int ii=-2;ii<=2;ii++){if(ii==0&&jj==0)continue;float w=T(q+vec2(float(ii),float(jj))*u_px).r;if(w>a||(w==a&&(jj>0||(jj==0&&ii>0))))lm=false;}if(lm&&(abs(i)==2||abs(j)==2))hit=1.;if(lm&&i==0&&j==0)hit=1.;}
 return vec4(mix(b,vec3(1.,.15,.1),hit),1.);`],
  'HALCON points_sojka (Sojka 2002): candidates with |grad| >= MinGrad; within a 9x9 mask the edge points are weighted by a Gaussian of distance to the candidate (SigmaW 2.5) and of the candidate distance to each point\'s edge line (SigmaD 0.75); apparentness = weighted gradient x squared direction deviation, accepted when >= MinApparentness and the direction spread >= MinAngle; 5x5 non-maximum suppression, corners drawn as red squares; approx. (exact Sojka weighting formulas not published in the reference)');
f('q43_lepetit','Lepetit Keypoints (HALCON points_lepetit)',[P('Radius',3,10,3,1,'px'),P('Check neighbours',0,5,1,1),P('Min neighbour diff',5,80,15,1),P('Min score',5,60,30,1)],
  [`float v[9];for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)v[(j+1)*3+i+1]=L(uv+vec2(float(i),float(j))*u_px);
 for(int a=0;a<9;a++)for(int b=0;b<8;b++){if(b>=8-a)break;if(v[b]>v[b+1]){float t2=v[b];v[b]=v[b+1];v[b+1]=t2;}}return vec4(vec3(v[4]),1.);`,
   `float rad=R(u_p0);int N=int(clamp(floor(6.2832*rad+.5),8.,32.));N=N/2*2;int hn=N/2;int ck=int(u_p1+.5);float t=u_p2/255.;float m0=T(uv).r;float dd[32];float sc=0.;
 for(int i=0;i<32;i++){if(i>=N)break;float an=6.2832*float(i)/float(N);float d=abs(T(uv+vec2(cos(an),sin(an))*rad*u_px).r-m0);dd[i]=d;sc+=d;}sc/=float(N);
 bool kp=sc*255.>=u_p3;for(int i=0;i<16;i++){if(i>=hn||!kp)break;if(dd[i]>t)continue;for(int j=-5;j<=5;j++){if(abs(j)>ck)continue;int k=i+hn+j;k=k<0?k+N:(k>=N?k-N:k);if(dd[k]<=t){kp=false;break;}}}
 return vec4(kp?sc:0.,0.,0.,1.);`,
   `float a=T(uv).r;bool lm=a>0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;float w=T(uv+vec2(float(i),float(j))*u_px).r;if(w>a||(w==a&&(j>0||(j==0&&i>0))))lm=false;}
 vec3 b=O(uv).rgb*.6;float hit=0.;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)<2&&abs(j)<2)continue;vec2 q=uv+vec2(float(i),float(j))*u_px;float c2=T(q).r;if(c2<=0.)continue;bool l2=true;for(int jj=-1;jj<=1;jj++)for(int ii=-1;ii<=1;ii++){if(ii==0&&jj==0)continue;float w=T(q+vec2(float(ii),float(jj))*u_px).r;if(w>c2||(w==c2&&(jj>0||(jj==0&&ii>0))))l2=false;}if(l2)hit=1.;}
 return vec4(mix(b,vec3(.1,1.,.3),hit),1.);`],
  'HALCON points_lepetit (Lepetit-Fua 2006): 3x3 median, then gray values on a circle of radius R (about 2 pi R points); a point is rejected if any diametrically opposed pair (and CheckNeighbor neighbours of the opposite point) are both within MinCheckNeighborDiff of the centre; mean absolute circle difference must exceed MinScore; 3x3 non-maximum suppression, keypoints drawn as green squares');
f('q43_linesfacet','Facet-Model Line Extraction (HALCON lines_facet)',[P('Mask size',3,11,5,2,'px'),P('Low',0,10,3,.5),P('High',0,25,8,.5),S('Lines',['Light','Dark'])],
  [`int h=int(clamp(floor(R(u_p0)*.5+.01),1.,5.));float fh=float(h),nn=(2.*fh+1.)*(2.*fh+1.);float s2=0.;for(int i=-5;i<=5;i++){if(abs(i)>h)continue;s2+=float(i*i);}float m2=s2/(2.*fh+1.);
 float sx=0.,sy=0.,sxx=0.,syy=0.,sxy=0.,dx2=0.,dq=0.,dxy=0.;
 for(int j=-5;j<=5;j++)for(int i=-5;i<=5;i++){if(abs(i)>h||abs(j)>h)continue;float x=float(i),yv=float(j);float v=L(uv+vec2(x,yv)*u_px)*255.;sx+=x*v;sy+=yv*v;sxx+=(x*x-m2)*v;syy+=(yv*yv-m2)*v;sxy+=x*yv*v;dq+=(x*x-m2)*(x*x-m2);dxy+=x*x*yv*yv;dx2+=x*x;}
 float gx=sx/dx2,gy=sy/dx2,fxx=2.*sxx/dq,fyy=2.*syy/dq,fxy=sxy/dxy;float tm=sqrt((fxx-fyy)*(fxx-fyy)+4.*fxy*fxy);float l1=.5*(fxx+fyy+tm),l2=.5*(fxx+fyy-tm);
 float lam=u_p3<.5?l2:l1;float rsp=u_p3<.5?max(-lam,0.):max(lam,0.);vec2 nv=abs(fxy)>1e-6?normalize(vec2(fxy,lam-fxx)):((u_p3<.5?fxx<fyy:fxx>fyy)?vec2(1.,0.):vec2(0.,1.));
 float rho=-dot(vec2(gx,gy),nv)/(abs(lam)>1e-6?lam:1e-6);float pt=abs(rho)<=.5?1.:0.;return vec4(rsp/40.,.5+.5*nv.x,.5+.5*nv.y,pt);`,
   `vec4 a=T(uv);vec2 nv=normalize(a.gb*2.-1.+1e-6);float r=a.r;float r1=T(uv+nv*u_px).r,r2=T(uv-nv*u_px).r;float lp=(a.a>.5||(r>=r1&&r>=r2))?1.:0.;float v=r*40.;
 float code=lp*(v>=u_p2?1.:(v>=u_p1?.5:0.));return vec4(code,0.,0.,1.);`,
   `float a=T(uv).r;float k=a>.75?1.:0.;if(a>.25&&a<.75){for(int j=-4;j<=4;j++)for(int i=-4;i<=4;i++){if(T(uv+vec2(float(i),float(j))*u_px).r>.75)k=1.;}}
 return vec4(mix(O(uv).rgb*.3,vec3(1.,.95,.3),k),1.);`],
  'HALCON lines_facet: least-squares quadratic facet fit over MaskSize x MaskSize (orthogonal polynomial basis), line direction from the Hessian, response = second directional derivative across the line (grey levels per px^2), line points where the first derivative zero crossing lies within the pixel or the response is a local maximum across the line; High/Low hysteresis approx. (weak points kept within 4 px of a strong point), drawn over the dimmed image');

/* ---------------- Mehdi plug-ins ---------------- */
f = add('Color');
f('q43_absolutecolor','Absolute Colors (Mehdi)',[S('Sector',['Red-Yellow','Yellow-Green','Green-Cyan','Cyan-Blue','Blue-Magenta','Magenta-Red']),S('Preserve lum',['On','Off']),S('Invert hue',['Off','On']),P('Mix',0,1,1,.01)],
  `vec3 x=c.rgb;float mx=max(x.r,max(x.g,x.b)),mn=min(x.r,min(x.g,x.b)),md=x.r+x.g+x.b-mx-mn;if(u_p2>.5)md=mx+mn-md;int s=int(u_p0+.5);vec3 o;
 if(s==0)o=vec3(mx,md,mn);else if(s==1)o=vec3(md,mx,mn);else if(s==2)o=vec3(mn,mx,md);else if(s==3)o=vec3(mn,md,mx);else if(s==4)o=vec3(md,mn,mx);else o=vec3(mx,mn,md);
 if(u_p1<.5){float d=luma(x)-luma(o);o+=d;float lo=min(o.r,min(o.g,o.b)),hi=max(o.r,max(o.g,o.b));float l=luma(o);if(hi>1.)o=l+(o-l)*(1.-l)/max(hi-l,1e-5);if(lo<0.)o=l+(o-l)*l/max(l-lo,1e-5);}
 return vec4(mix(x,clamp(o,0.,1.),u_p3),1.);`,
  'Mehdi Absolute Colors 1.2: the r,g,b values of each pixel are sorted into the order of the chosen 60-degree hue sector (e.g. Red-Yellow = R>=G>=B); Invert Hue mirrors the hue inside the sector (mid = max+min-mid); Preserve Lum restores the original luminance (gamut-clipped toward grey)');
f('q43_megamix','Color MegaMix 8-Colour Remap (Mehdi)',[S('Targets',['Hue rotated','Complementary','Pastel','Earth tones','Neon']),P('Hue rotate',-180,180,60,1,'deg'),P('Target saturation',0,2,1,.01),P('Amount',0,1,1,.01)],
  `vec3 tg[8];tg[0]=vec3(0.);tg[1]=vec3(1.,0.,0.);tg[2]=vec3(0.,1.,0.);tg[3]=vec3(1.,1.,0.);tg[4]=vec3(0.,0.,1.);tg[5]=vec3(1.,0.,1.);tg[6]=vec3(0.,1.,1.);tg[7]=vec3(1.);int m=int(u_p0+.5);
 if(m==1){for(int k=1;k<7;k++)tg[k]=vec3(1.)-tg[k];}
 else if(m==2){for(int k=1;k<7;k++)tg[k]=mix(tg[k],vec3(1.),.5);}
 else if(m==3){tg[0]=vec3(.06,.04,.03);tg[1]=vec3(.6,.3,.15);tg[2]=vec3(.4,.45,.2);tg[3]=vec3(.85,.7,.4);tg[4]=vec3(.2,.25,.35);tg[5]=vec3(.5,.3,.35);tg[6]=vec3(.4,.55,.5);tg[7]=vec3(.97,.93,.85);}
 else if(m==4){tg[0]=vec3(.05,0.,.1);tg[1]=vec3(1.,0.,.5);tg[2]=vec3(0.,1.,.6);tg[3]=vec3(.8,1.,0.);tg[4]=vec3(.2,0.,1.);tg[5]=vec3(1.,0.,1.);tg[6]=vec3(0.,1.,1.);}
 for(int k=0;k<8;k++){vec3 h=rgb2hsv(tg[k]);h.x=fract(h.x+u_p1/360.);h.y=clamp(h.y*u_p2,0.,1.);tg[k]=hsv2rgb(h);}
 vec3 x=clamp(c.rgb,0.,1.);vec3 o=vec3(0.);for(int k=0;k<8;k++){vec3 b=vec3(float(k-(k/2)*2),float((k/2)-(k/4)*2),float(k/4));vec3 w=mix(1.-x,x,b);o+=w.x*w.y*w.z*tg[k];}
 return vec4(mix(x,clamp(o,0.,1.),u_p3),1.);`,
  'Mehdi Color MegaMix: 8 source colours mapped to 8 target colours and the whole colour space rebuilt from them; approx.: sources fixed at the RGB-cube corners (black, R, G, B, C, M, Y, white) and the space rebuilt by trilinear interpolation, target rows from presets with hue rotation / saturation (the plug-in eyedropper sources and equation solve are not reproducible)');
f('q43_contrastbalance','Contrast Balance (Mehdi)',[S('Opposition',['White-Black','Red-Cyan','Green-Magenta','Blue-Yellow']),P('Constant',-100,100,20,1),P('Contrast',-100,100,13,1)],
  `vec3 x=c.rgb;int m=int(u_p0+.5);float sl=u_p2>=0.?1./max(1.-u_p2/100.5,.005):1.+u_p2/100.;vec3 msk=m==0?vec3(1.):m==1?vec3(1.,0.,0.):m==2?vec3(0.,1.,0.):vec3(0.,0.,1.);
 vec3 y=mix(x,(x-.5)*sl+.5+u_p1/200.,msk);if(m>0)y+=luma(x)-luma(y);float l=luma(y);float lo=min(y.r,min(y.g,y.b)),hi=max(y.r,max(y.g,y.b));
 if(m>0){if(hi>1.)y=l+(y-l)*(1.-l)/max(hi-l,1e-5);if(lo<0.)y=l+(y-l)*l/max(l-lo,1e-5);}return vec4(clamp(y,0.,1.),1.);`,
  'Mehdi Contrast Balance: brightness/contrast decomposed into constant + contrast balances on four oppositions (white-black, red-cyan, green-magenta, blue-yellow); approx.: a colour opposition applies constant/contrast to its channel and restores luminance (gamut-clipped toward grey), one opposition per instance');

f = add('Tone');
f('q43_finethreshold','Fine Threshold (Mehdi)',[P('Threshold',1,254,128,1),P('Edge width',.3,3,1,.05,'px'),P('Pre-blur',0,4,0,.1,'px')],
  [BH('u_p2'), BV('u_p2'), `float l=L(uv);vec2 g=vec2(L(uv+vec2(u_px.x,0.))-L(uv-vec2(u_px.x,0.)),L(uv+vec2(0.,u_px.y))-L(uv-vec2(0.,u_px.y)))*.5;float gm=length(g)*max(R(u_p1),.3);
 float v=gm>1e-5?clamp((l-u_p0/255.)/gm+.5,0.,1.):step(u_p0/255.,l);return vec4(vec3(v),1.);`],
  'Mehdi Fine Threshold: anti-aliased sharp threshold (shapes keep sub-pixel smooth edges unlike a hard threshold); approx.: the threshold crossing is located with the local gradient and rendered as a 1-px (Edge width) linear ramp, optional Gaussian pre-blur');

f = add('Noise');
f('q43_flatmedian','Flat Median (Mehdi)',[P('Radius',1,8,3,.5,'px'),P('Flatten',-100,100,80,1),P('Dry',0,100,0,1),S('Direction',['Both','Horizontal','Vertical'])],
  `float r=max(R(u_p0),1.);float st=max(1.,r/6.);int dm=int(u_p3+.5);vec3 a[169];float gw[169];int n=0;vec3 m=vec3(0.);float ws=0.;
 for(int j=-6;j<=6;j++)for(int i=-6;i<=6;i++){vec2 o=vec2(float(i),float(j))*st;if(dot(o,o)>r*r+.01)continue;if(dm==1&&j!=0)continue;if(dm==2&&i!=0)continue;float g=exp(-dot(o,o)/(r*r))*((i==0&&j==0)?1.+u_p2*.2:1.);a[n]=O(uv+o*u_px).rgb;gw[n]=g;m+=g*a[n];ws+=g;n++;}
 m/=ws;float p=u_p1/100.;for(int it=0;it<4;it++){vec3 acc=vec3(0.),wa=vec3(0.);for(int q=0;q<169;q++){if(q>=n)break;vec3 w=gw[q]/pow(abs(a[q]-m)+.02,vec3(p));acc+=w*a[q];wa+=w;}m=acc/wa;}
 return vec4(m,1.);`,
  'Mehdi Flat Median: isotropic median-like estimate without sorting; Flatten moves from a Gaussian blur (0, negative = blurrier) through an L1 median (100) toward the local mode (flat, contrasty), Dry adds centre weight, horizontal/vertical-only option; approx.: iteratively reweighted (Weiszfeld) mean with weights |x-m|^-Flatten/100');
f('q43_grainnatural','Grain Natural (Mehdi)',[P('Size',1,8,2,.5,'px'),P('Strength',0,1,.6,.01),P('Ratio',.25,4,1,.05),S('Basic grain',['Off','On'])],
  `vec2 cs=u_p3>.5?vec2(1.):max(R(u_p0),1.)*vec2(sqrt(u_p2),1./sqrt(u_p2));vec2 p=PX(uv)/cs;vec2 ip=floor(p);float bd=9.;vec2 cid=ip;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=ip+vec2(float(i),float(j));vec2 fp=cc+vec2(hash(cc+u_seed*3.7),hash(cc+vec2(5.1,9.3)+u_seed*3.7));float dd=distance(fp,p);if(dd<bd){bd=dd;cid=cc;}}if(u_p3>.5)cid=floor(PX(uv));
 vec2 rv=vec2(hash(cid+u_seed*13.1),hash(cid+vec2(71.3,19.7)+u_seed*7.7))-.5;
 vec2 off=rv*2.*cs*(u_p3>.5?2.:1.);vec3 sm=O(uv+off*u_px).rgb;vec3 hv=rgb2hsv(clamp(c.rgb,0.,1.));float neu=1.-hv.y*hv.z;
 return vec4(mix(c.rgb,sm,u_p1*neu),1.);`,
  'Mehdi Grain Natural 2: grains of adjustable size and aspect ratio made from colours already present in the image (each grain takes a nearby pixel colour), colours far from neutral grey are least affected; Basic Grain = per-pixel; approx.', true);

f = add('Render');
f('q43_blots','Blots Seamless Texture (Mehdi)',[P('Size',.02,.5,.12,.005),P('Ratio',.25,4,1,.05),P('Hardness',0,1,.6,.01),P('Repartition',0,1,.5,.01)],
  `
  #define Q43F(P0) (fract(P0)*fract(P0)*(3.-2.*fract(P0)))
  #define Q43VN(P0,PR) mix(mix(hash(mod(floor(P0),PR)+u_seed*17.),hash(mod(floor(P0)+vec2(1.,0.),PR)+u_seed*17.),Q43F(P0).x),mix(hash(mod(floor(P0)+vec2(0.,1.),PR)+u_seed*17.),hash(mod(floor(P0)+vec2(1.,1.),PR)+u_seed*17.),Q43F(P0).x),Q43F(P0).y)
  vec2 cells=max(floor(vec2(asp()*sqrt(1./u_p1),sqrt(u_p1))/u_p0+.5),vec2(1.));float v=0.,am=.5,tot=0.;vec2 pr=cells;for(int o=0;o<5;o++){vec2 q=uv*pr;v+=am*Q43VN(q,pr);tot+=am;am*=.5;pr*=2.;}v/=tot;
  float w=(1.-u_p2)*.12+.004;float b=smoothstep(u_p3-w,u_p3+w,v*1.25-.125);return vec4(vec3(1.-b),1.);`,
  'Mehdi Blots 2.2 normal mode: seamless (period = frame) blot texture of foreground (black) on background (white); Size, Ratio (width/height), Hardness of the blot edge, Repartition = share of foreground blots; approx. (periodic value-noise fbm thresholded)', true);
