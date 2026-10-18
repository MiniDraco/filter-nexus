/* ================= render2c: map / image projections and frames II ================= */
const R2CFN = (lib, body) => `return c;}
#define F R2G
${lib}
vec4 R2G(vec2 uv){vec4 c=T(uv);${body}`;
const R2CL = `
vec2 r2h2(vec2 p){return vec2(hash(p),hash(p+vec2(17.17,3.31)));}
float r2vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float r2fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*r2vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
vec2 r2dims(){return u_res/u_k;}
vec2 r2mirror(vec2 q){return 1.-abs(1.-mod(q,2.));}
vec2 r2cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
vec2 r2cdiv(vec2 a,vec2 b){return vec2(a.x*b.x+a.y*b.y,a.y*b.x-a.x*b.y)/max(dot(b,b),1e-12);}
`;

f = add('Distort');
f('mobius','Mobius Transformation',[P('Pole X',-.95,.95,.35,.01),P('Pole Y',-.95,.95,.2,.01),P('Rotation',-180,180,0,1,'°'),P('Zoom',.25,4,1,.01)],
  R2CFN(R2CL,`vec2 w=(uv-.5)*vec2(asp(),1.)*2./u_p3;vec2 a=vec2(u_p0,u_p1);float t=radians(u_p2);w=r2cmul(w,vec2(cos(t),-sin(t)));
  vec2 z=r2cdiv(w+a,vec2(1.,0.)+r2cmul(vec2(a.x,-a.y),w));vec2 q=z/vec2(asp(),1.)*.5+.5;return T(r2mirror(q));`),
  'w = e^(i theta) (z - a) / (1 - conj(a) z), the Mobius map that is an automorphism of the unit disc (unit circle = image height), inverted per output pixel; a = pole (the point sent to the centre), zoom on the output; outside the frame the image is mirror-tiled');

const R2PJ = R2CL + `
#define R2PI 3.14159265
float r2mercY(float ph){return log(tan(R2PI*.25+ph*.5));}
float r2eeP(float t){float t2=t*t,t6=t2*t2*t2;return t*(1.340264-.081106*t2+.000893*t6+.003796*t6*t2);}
float r2eeD(float t){float t2=t*t,t6=t2*t2*t2;return 1.340264-3.*.081106*t2+7.*.000893*t6+9.*.003796*t6*t2;}
vec2 r2bbox(int pj,float ml){if(pj==0)return vec2(R2PI,r2mercY(radians(ml)));if(pj==1||pj==4)return vec2(2.*sqrt(2.),sqrt(2.));if(pj==2)return vec2(R2PI,1.);if(pj==3)return vec2(R2PI,R2PI*.5);if(pj==5)return vec2(1.);return vec2(2.*sqrt(3.)*R2PI/(3.*1.340264),r2eeP(R2PI/3.));}
// projected (x,y) -> (lon,lat); returns false outside the map
bool r2inv(int pj,vec2 p,float ml,out vec2 ll){float x=p.x,y=p.y;ll=vec2(0.);
 if(pj==0){if(abs(y)>r2mercY(radians(ml))||abs(x)>R2PI)return false;ll=vec2(x,2.*atan(exp(y))-R2PI*.5);return true;}
 if(pj==1){if(abs(y)>sqrt(2.))return false;float th=asin(y/sqrt(2.));float lon=R2PI*x/(2.*sqrt(2.)*cos(th));if(abs(lon)>R2PI)return false;ll=vec2(lon,asin(clamp((2.*th+sin(2.*th))/R2PI,-1.,1.)));return true;}
 if(pj==2){if(abs(y)>1.||abs(x)>R2PI)return false;ll=vec2(x,asin(y));return true;}
 if(pj==3){if(abs(y)>R2PI*.5)return false;float lon=x/max(cos(y),1e-6);if(abs(lon)>R2PI)return false;ll=vec2(lon,y);return true;}
 if(pj==4){if(x*x/8.+y*y/2.>1.)return false;float z=sqrt(max(1.-x*x/16.-y*y/4.,0.));ll=vec2(2.*atan(z*x,2.*(2.*z*z-1.)),asin(clamp(z*y,-1.,1.)));return true;}
 if(pj==5){float rh=length(p);if(rh>1.)return false;float cc=asin(rh);float p0=radians(ml);if(rh<1e-6){ll=vec2(0.,p0);return true;}
  ll=vec2(atan(x*sin(cc),rh*cos(cc)*cos(p0)-y*sin(cc)*sin(p0)),asin(clamp(cos(cc)*sin(p0)+y*sin(cc)*cos(p0)/rh,-1.,1.)));return true;}
 float M=sqrt(3.)*.5;float th=y/1.340264;for(int i=0;i<12;i++)th-=(r2eeP(th)-y)/r2eeD(th);if(abs(th)>R2PI/3.+1e-4)return false;float lon=3.*x*r2eeD(th)/(2.*sqrt(3.)*cos(th));if(abs(lon)>R2PI)return false;ll=vec2(lon,asin(clamp(sin(th)/M,-1.,1.)));return true;}
// (lon,lat) -> projected (x,y); returns false where the projection does not show the point
bool r2fwd(int pj,vec2 ll,float ml,out vec2 p){float l=ll.x,ph=ll.y;p=vec2(0.);
 if(pj==0){if(abs(ph)>radians(ml))return false;p=vec2(l,r2mercY(ph));return true;}
 if(pj==1){float th=ph;for(int i=0;i<12;i++){float fth=2.*th+sin(2.*th)-R2PI*sin(ph);th-=fth/max(2.+2.*cos(2.*th),1e-5);}p=vec2(2.*sqrt(2.)/R2PI*l*cos(th),sqrt(2.)*sin(th));return true;}
 if(pj==2){p=vec2(l,sin(ph));return true;}
 if(pj==3){p=vec2(l*cos(ph),ph);return true;}
 if(pj==4){float dn=sqrt(1.+cos(ph)*cos(l*.5));p=vec2(2.*sqrt(2.)*cos(ph)*sin(l*.5)/dn,sqrt(2.)*sin(ph)/dn);return true;}
 if(pj==5){float p0=radians(ml);float cc=sin(p0)*sin(ph)+cos(p0)*cos(ph)*cos(l);if(cc<0.)return false;p=vec2(cos(ph)*sin(l),cos(p0)*sin(ph)-sin(p0)*cos(ph)*cos(l));return true;}
 float th=asin(sqrt(3.)*.5*sin(ph));p=vec2(2.*sqrt(3.)*l*cos(th)/(3.*r2eeD(th)),r2eeP(th));return true;}
`;
f('mapproj','Map Projections (Mercator / Mollweide / ...)',[S('Projection',['Mercator','Mollweide','Lambert cylindrical equal-area','Sinusoidal','Hammer','Orthographic (globe)','Equal Earth']),S('Direction',['Equirectangular to projection','Projection to equirectangular']),P('Central meridian',-180,180,0,1,'°'),P('Max latitude / globe tilt',0,89,80,1,'°')],
  R2CFN(R2PJ,`int pj=int(u_p0+.5);float ml=pj==0?max(u_p3,1.):u_p3;vec2 dm=r2dims();float l0=radians(u_p2);
  if(u_p1<.5){vec2 bb=r2bbox(pj,ml);float s=min(dm.x/(2.*bb.x),dm.y/(2.*bb.y));vec2 p=(PX(uv)-dm*.5)/s;vec2 ll;if(!r2inv(pj,p,ml,ll))return vec4(0.,0.,0.,1.);
   ll.x+=l0;vec2 q=vec2(fract(ll.x/(2.*R2PI)+.5),clamp(ll.y/R2PI+.5,0.,1.));return T(q);}
  vec2 ll=vec2((uv.x-.5)*2.*R2PI,(uv.y-.5)*R2PI);ll.x=mod(ll.x-l0+R2PI,2.*R2PI)-R2PI;vec2 p;if(!r2fwd(pj,ll,ml,p))return vec4(0.,0.,0.,1.);vec2 bb=r2bbox(pj,ml);
  vec2 q=p/(2.*bb)+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`),
  'exact map projections with the image taken as an equirectangular (plate carree) world map, or (reverse) as a full-frame map in the chosen projection: Mercator y = ln tan(pi/4 + phi/2) cut at the max latitude; Mollweide (auxiliary angle by Newton); Lambert cylindrical equal-area; sinusoidal; Hammer-Aitoff; orthographic globe tilted by the latitude parameter; Equal Earth (Savric, Patterson & Jenny 2018 polynomial); central meridian shifts longitudes, the forward map is fitted uniformly into the frame');
f('ipm','Inverse Perspective Mapping (Bird\'s-Eye)',[P('Camera pitch',5,89,30,1,'°'),P('Vertical FOV',20,120,60,1,'°'),P('View range',1,40,8,.1),P('Lateral shift',-1,1,0,.01)],
  `float th=radians(u_p0);float ty=tan(radians(u_p1)*.5);float a=asp();float zmin=th+radians(u_p1)*.5<1.5707?1./tan(th+radians(u_p1)*.5):0.;
  float Z=zmin+uv.y*u_p2;float X=(uv.x-.5)*u_p2*a+u_p3*u_p2*a*.5;vec3 P=vec3(X,-1.,Z);vec3 fw=vec3(0.,-sin(th),cos(th)),up=vec3(0.,cos(th),sin(th));
  float zc=dot(P,fw);if(zc<=1e-4)return vec4(0.,0.,0.,1.);vec2 q=vec2(X/(zc*ty*a),dot(P,up)/(zc*ty))*.5+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`,
  'IPM: the image is a pinhole view (given vertical FOV) of a flat ground plane from a camera at height 1 pitched down by the given angle; each output pixel is a ground point (X, Z), Z from the nearest visible ground to View range further, projected back into the image (homography); parts not seen by the camera are black');
f('logpolar','Log-Polar Transform',[S('Direction',['Cartesian to log-polar','Log-polar to Cartesian']),P('Centre X',0,1,.5,.01),P('Centre Y',0,1,.5,.01)],
  `vec2 dm=u_res/u_k;vec2 cp=vec2(u_p1,u_p2)*dm;vec2 cr=max(cp,dm-cp);float mr=length(cr);float Km=dm.x/log(mr);
  if(u_p0<.5){vec2 p=PX(uv);float rho=p.x;float ph=(1.-uv.y)*6.2831853;float r=exp(rho/Km);vec2 s=cp+r*vec2(cos(ph),-sin(ph));vec2 q=s/dm;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);}
  vec2 d=PX(uv)-cp;float r=length(d);float ph=atan(-d.y,d.x);if(ph<0.)ph+=6.2831853;float u=Km*log(max(r,1.))/dm.x;if(u>1.)return vec4(0.,0.,0.,1.);return T(vec2(u,1.-ph/6.2831853));`,
  'OpenCV warpPolar with WARP_POLAR_LOG: radius along x as rho = Kmag ln r, Kmag = width / ln(maxRadius) (maxRadius = farthest corner), angle 0..360 deg down the rows; reverse = WARP_INVERSE_MAP');
f('mustache','Mustache Distortion (Brown-Conrady)',[P('k1',-1,1,-.35,.01),P('k2',-1,1,.3,.01),P('Scale',.5,1.5,1,.01)],
  `vec2 d=(uv-.5)*vec2(asp(),1.);float hd=length(vec2(asp(),1.)*.5);float rd=length(d)/hd*u_p2;float ru=rd;
  for(int i=0;i<8;i++){float r2=ru*ru;float fr=ru*(1.+u_p0*r2+u_p1*r2*r2)-rd;float df=1.+3.*u_p0*r2+5.*u_p1*r2*r2;ru-=fr/(abs(df)<1e-3?1e-3:df);}
  vec2 s=length(d)>1e-6?normalize(d)*ru*hd:vec2(0.);vec2 q=s/vec2(asp(),1.)+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.,0.,0.,1.);return T(q);`,
  'Brown-Conrady radial lens model r_d = r_u (1 + k1 r_u^2 + k2 r_u^4) (r = 1 at the corner): the image is the undistorted scene, each output pixel inverts the model by Newton iteration; k1 < 0 with k2 > 0 = mustache (barrel in the centre, pincushion toward the edges); Scale zooms the output');
f('gravlens','Gravitational Lensing',[P('Einstein radius',.02,.5,.15,.005),P('Lens X',0,1,.5,.01),P('Lens Y',0,1,.5,.01),S('Lens model',['Point mass','Singular isothermal sphere'])],
  R2CFN(R2CL,`vec2 a=vec2(asp(),1.);vec2 th=(uv-vec2(u_p1,u_p2))*a;float r=length(th);float te=u_p0;vec2 b;
  if(u_p3<.5)b=th-te*te*th/max(r*r,1e-8);else b=th-te*th/max(r,1e-6);vec2 q=b/a+vec2(u_p1,u_p2);return T(r2mirror(q));`),
  'thin-lens equation beta = theta - alpha(theta): point mass alpha = theta_E^2 theta / |theta|^2 (Einstein ring at theta_E, two images per source), singular isothermal sphere alpha = theta_E theta / |theta|; the image is the background source plane (mirror-tiled outside the frame)');
f('flutedglass','Fluted (Reeded) Glass',[P('Rib width',4,120,28,1,'px'),P('Refraction',0,2,.6,.01),P('Angle',0,180,0,1,'°'),P('Frost',0,1,.2,.01)],
  R2CFN(R2CL,`float an=radians(u_p2);vec2 ax=vec2(cos(an),sin(an));vec2 p=PX(uv);float w=u_p0;float t=dot(p,ax)/w;float fr=fract(t)*2.-1.;
  float sl=fr/sqrt(max(1.-.9*fr*fr,.05));float off=-u_p1*w*.45*sl;vec2 q=p+ax*off;vec3 acc=vec3(0.);
  for(int k=0;k<8;k++){float fk=float(k);vec2 j=(r2h2(floor(p)+vec2(fk*7.,fk*3.))-.5)*u_p3*w*.25;acc+=T(fromPX(q+j*vec2(1.,3.))).rgb;}acc/=8.;
  float shade=1.+.08*u_p1*fr-.18*u_p1*smoothstep(.85,1.,abs(fr));float hl=.12*u_p1*exp(-pow((fr+.45)*7.,2.));return vec4(acc*shade+hl,1.);`),
  'reeded / fluted glass panel: parallel convex cylindrical ribs, each refracting by the slope of its circular profile (each rib shows a compressed, edge-reversed slice of the scene), frost = random scatter; with soft shading, a specular streak per rib and dark seams (approx.)',1);

/* ---------- Frames II ---------- */
f = add('Frames');
f('frames2','Frames II (Negative Carrier / Deckle / Mat / Stamp)',[S('Style',['Negative carrier (filed)','Deckle edge','Passe-partout mat','Postage stamp']),P('Border',.02,.3,.08,.005),P('Roughness',0,1,.5,.01),P('Tone',0,1,.9,.01)],
  R2CFN(R2CL,`int st=int(u_p0+.5);vec2 dm=r2dims();vec2 p=PX(uv);float sh=min(dm.x,dm.y);float b=u_p1*sh;float R=u_p2;
  vec2 e=min(p,dm-p);float de=min(e.x,e.y);bool hor=e.y<e.x;float along=hor?p.x:p.y;
  float inset=st==0?b*1.1:st==1?b*1.25:st==2?b:b*1.15;vec2 ic=dm-2.*inset;float sc=max(ic.x/dm.x,ic.y/dm.y);vec2 sp=(p-dm*.5)/sc+dm*.5;vec3 img=T(fromPX(clamp(sp,vec2(0.),dm))).rgb;
  float din=min(min(p.x-inset,dm.x-inset-p.x),min(p.y-inset,dm.y-inset-p.y));
  if(st==0){float n1=(r2fbm(vec2(along*.06,de<b?1.:7.))-.5)*R*b*.6+(r2vn(vec2(along*.45,3.))-.5)*R*b*.15;float n2=(r2fbm(vec2(along*.05,13.))-.5)*R*b*.4;
   float paper=b*.25+n2;vec3 col=img;if(din<n1)col=vec3(.03);if(din<n1&&din>n1-b*.06)col=mix(col,vec3(.2),.5*R);if(de<paper)col=vec3(.96,.95,.93);return vec4(col,1.);}
  if(st==1){float gap=b*.45;float dk=(r2fbm(vec2(along*.09,5.))-.5)*R*b*.5+(hash(vec2(floor(along*.7),2.))-.5)*R*b*.12;vec3 bg=vec3(mix(.08,.3,1.-u_p3));
   vec3 paper=vec3(.95,.93,.88)*(.97+.03*r2vn(p*.3));float fib=smoothstep(0.,b*.08,de-gap-dk);vec3 col=din>0.?img:paper;col=mix(bg*(1.-.4*smoothstep(b*.3,0.,gap+dk-de)),col,fib);return vec4(col,1.);}
  if(st==2){float bev=max(b*.09,2.);vec3 mat=mix(vec3(.12,.11,.1),vec3(.95,.93,.88),u_p3)*(.97+.03*r2vn(p*.5));vec3 col=img;
   if(din<0.){col=mat;if(din>-bev){vec2 cc=p-dm*.5;bool tl=(abs(cc.x)/ic.x>abs(cc.y)/ic.y)?cc.x<0.:cc.y>0.;col=vec3(.97,.96,.93)*(tl?1.:.78);}}
   else col*=1.-.35*exp(-din/(bev*.8))*smoothstep(-1.,1.,(p.x-dm.x*.5)/dm.x*0.+1.)*(din<bev*3.?1.:0.);return vec4(col,1.);}
  float hs=max(b*.42,4.);float hr=hs*.32;vec3 bg=vec3(mix(.1,.35,1.-u_p3));vec3 paper=vec3(.97,.96,.93);float t=mod(along,hs)-hs*.5;float hole=length(vec2(t,de-hr*.4))-hr;
  vec3 col=din>0.?img:paper;if(din>0.&&din<1.5)col=mix(col,vec3(.4),.5);if(hole<0.||de<hr*.4)col=bg;
  vec2 cn=min(p,dm-p);if(length(cn-vec2(hs*.5))<hr&&cn.x<hs*.5&&cn.y<hs*.5)col=bg;return vec4(col,1.);`),
  'negative carrier = filed-out carrier print: film rebate prints as a black band with rough, irregular inner and outer edges on white paper; deckle edge = torn / deckled paper with a white margin on a dark ground (Tone = ground lightness); passe-partout = mat board (Tone = board lightness) with a 45-degree bevelled window showing the white core lit from the top-left and a soft shadow on the picture; postage stamp = white stamp margin with a frame line and perforation holes on a dark ground; the picture is scaled (cropped) to fit inside',1);
f('letterbox','Letterbox / Pillarbox Bars',[S('Aspect',['2.39:1 (scope)','2.00:1 (Univisium)','1.85:1 (flat)','16:9','4:3','1:1']),P('Bar grey',0,1,0,.01),P('Bar opacity',0,1,1,.01)],
  `int a=int(u_p0+.5);float ta=a==0?2.39:a==1?2.:a==2?1.85:a==3?16./9.:a==4?4./3.:1.;float ia=asp();vec2 box=ta>ia?vec2(1.,ia/ta):vec2(ta/ia,1.);vec2 d=abs(uv-.5)*2.;
  if(d.x>box.x||d.y>box.y)return vec4(mix(c.rgb,vec3(u_p1),u_p2),1.);return c;`,
  'cinema aspect masking: bars (grey level and opacity adjustable, default opaque black) cover the image outside the target aspect ratio - letterbox when the target is wider than the image, pillarbox when narrower');
