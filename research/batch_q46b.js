/* ================= q46b: round-18 Paint.NET Plugin Index — render generators ================= */
f = add('Render');
f('q46_graphpaper','Graph Paper (Paint.NET toe_head2001)',[S('Type',['Standard','Isometric']),P('Cell size',4,100,10,1,'px'),P('Group size',1,10,5,1),P('Cluster size',1,10,2,1)],
  `vec2 res=u_res/u_k;vec2 p=PX(uv);vec2 pd=vec2(p.x,res.y-p.y);float cs=u_p1,gs=floor(u_p2+.5),cl=floor(u_p3+.5)*gs;vec3 o=vec3(1.);float cx=.5*res.x,cy=.5*res.y;
 if(u_p0<.5){for(int set=0;set<3;set++){for(int ax=0;ax<2;ax++){float z=ax==0?pd.x-cx:pd.y-cy;float along=ax==0?pd.y:pd.x;float i=floor(z/cs+.5);float ai=abs(i);
   int cls=mod(ai,cl)<.5?2:mod(ai,gs)<.5?1:0;if(cls!=set)continue;float lw=set==2?2.:1.;float dist=abs(z-i*cs);float cov=clamp(lw*.5+.5-dist,0.,1.);
   int st=set==0?2:set==1?1:0;float ph=mod(along/lw,st==2?2.:4.);if(st==2&&ph>=1.)cov=0.;if(st==1&&ph>=3.)cov=0.;o=mix(o,vec3(0.),cov);}}}
 else{float sh=1.73205;float vs=.5*cs*sh;float z=pd.x-cx;float i=floor(z/vs+.5);float ai=abs(i);float dist=abs(z-i*vs);float lw=mod(ai,cl)<.5?2.:1.;float al=mod(ai,cl)<.5||mod(ai,gs)<.5?1.:85./255.;
  o=mix(o,vec3(.5),al*clamp(lw*.5+.5-dist,0.,1.));
  for(int set=0;set<3;set++)for(int sd=0;sd<2;sd++){float xx=sd==0?pd.x:res.x-pd.x;float u=xx/sh+pd.y;float j=floor(u/cs+.5);if(j<1.)continue;
   int cls=mod(j,cl)<.5?2:mod(j,gs)<.5?1:0;if(cls!=set)continue;float lw2=set==2?1.6:1.;float d2=abs(u-j*cs)*.5*sh;float cov=clamp(lw2*.5+.5-d2,0.,1.);
   float along=2.*xx/sh;int st=set==0?2:set==1?1:0;float ph=mod(along/lw2,st==2?2.:4.);if(st==2&&ph>=1.)cov=0.;if(st==1&&ph>=3.)cov=0.;o=mix(o,vec3(0.),cov);}}
 return vec4(o,1.);`,
  'toe_head2001 Graph Paper (GitHub pdn-graph-paper GraphPaper.cs, defaults): lines from the canvas centre every Cell size px; every Group size-th line is a group line, every Group x Cluster-th a 2 px cluster line; default styles cells dotted (1 on 1 off), groups dashed (3 on 1 off), clusters solid, black on white. Isometric: vertical lines every Cell size x sqrt(3)/2 (grey; non-group ones at 33% opacity) and 30-degree lines x/sqrt(3) + y = k Cell size from both top corners (cluster width 1.6)');

f('q46_tattersall','Tattersall (Paint.NET toe_head2001)',[P('Line width',1,100,4,1,'px'),P('Line spacing',1,100,16,1,'px'),S('Line style',['Solid 33% opacity','Solid 66% opacity','Diagonal lines up','Diagonal lines down','50/50 dots']),S('Colours',['Red green navy on cream','Black white grey on white (defaults)','Brown green gold on ivory'])],
  `vec2 res=u_res/u_k;vec2 p=PX(uv);vec2 pd=floor(vec2(p.x,res.y-p.y));int cm=int(u_p3+.5);int st=int(u_p2+.5);
 vec3 c1=cm==1?vec3(0.):cm==2?vec3(.42,.24,.12):vec3(.75,.1,.12);vec3 c2=cm==1?vec3(1.):cm==2?vec3(.15,.4,.2):vec3(.12,.45,.2);vec3 c3=cm==1?vec3(.5):cm==2?vec3(.8,.62,.15):vec3(.1,.13,.38);vec3 bg=cm==1?vec3(1.):cm==2?vec3(.97,.95,.88):vec3(.96,.92,.8);
 float w=u_p0,hw=floor(w*.5),pitch=w+u_p1;vec3 o=bg;
 for(int ax=0;ax<2;ax++){float z=ax==0?pd.y:pd.x;float k=floor((z-hw)/pitch+.5);if(k<0.)k=0.;if(abs(z+.5-(hw+k*pitch))>w*.5)continue;float km=mod(k,3.);vec3 lc=km<.5?c1:km<1.5?c2:c3;
  if(st<2)o=mix(o,lc,st==0?85./255.:170./255.);else{float pat=st==2?step(mod(pd.x+pd.y,4.),1.5):st==3?step(mod(pd.x-pd.y,4.),1.5):step(mod(pd.x+pd.y,2.),.5);o=mix(bg,lc,pat);}}
 return vec4(o,1.);`,
  'toe_head2001 Tattersall (GitHub pdn-tattersall Tattersall.cs): three repeating line colours, lines of Line width every Line width + Line spacing px from the top-left, horizontal lines drawn first and vertical lines over them; styles = solid pens at 85/255 or 170/255 alpha, or GDI hatch brushes (dark upward / downward diagonal, 50 percent; hatch phase approx.) of line colour on the background; colour schemes stand in for the colour pickers');

f('q46_koch','Koch Snowflake (Paint.NET)',[P('Iterations',0,6,4,1),P('Size',.2,1,.85,.01),P('Brush width',.5,8,1.5,.1,'px'),S('Fill',['Outline','Filled','Filled with outline'])],
  `vec2 res=u_res/u_k;float sc=min(res.x,res.y)*u_p1*.62;vec2 q=(PX(uv)-.5*res)/sc;q.y+=.15;q.x=abs(q.x);
 float an=5./6.*PI;vec2 n=vec2(sin(an),cos(an));q.y+=tan(an)*.5;float d=dot(q-vec2(.5,0.),n);q-=max(0.,d)*n*2.;
 float s=1.;n=vec2(sin(2./3.*PI),cos(2./3.*PI));q.x+=.5;int it=int(u_p0+.5);
 for(int i=0;i<6;i++){if(i>=it)break;q*=3.;s*=3.;q.x-=1.5;q.x=abs(q.x);q.x-=.5;d=dot(q,n);q-=min(0.,d)*n*2.;}
 float dd=length(q-vec2(clamp(q.x,-1.,1.),0.))/s*sc;float sg=sign(q.y);int fm=int(u_p3+.5);
 float line=clamp(u_p2*.5+.5-dd,0.,1.);float fill=clamp(.5-dd*sg,0.,1.);vec3 o=vec3(1.);
 if(fm>=1)o=mix(o,vec3(.25,.45,.85),fill);if(fm!=1)o=mix(o,vec3(0.),line);return vec4(o,1.);`,
  'stuff_gnome Koch Snowflake Fractal (complexity, brush width), exact geometry: distance to the Koch snowflake by mirror folding (six-fold symmetry, then per iteration scale x3 and fold onto the 60-degree generator, after Martijn Steinrucken\'s shader), drawn as an antialiased outline of Brush width, optionally filled');

f('q46_fibfill','Fibonacci Fill (Paint.NET)',[P('Unit size',1,40,4,1,'px'),S('Colours',['Rainbow','Pastel','Image average','Greys']),P('Outline',0,4,1,.1,'px'),S('Spiral',['None','Quarter arcs'])],
  `vec2 p=PX(uv)-PX(vec2(.5));float U=u_p0;vec2 q=vec2(p.x,-p.y)/U+.5;vec4 rc=vec4(0.,0.,1.,1.);int idx=-1;vec4 sq=rc;vec2 ac=vec2(-9999.);
 if(q.x>=0.&&q.y>=0.&&q.x<=1.&&q.y<=1.)idx=0;
 for(int n=1;n<26;n++){if(idx>=0)break;int dr=n-(n/4)*4;float w=rc.z-rc.x,h=rc.w-rc.y;vec4 s2;vec2 cc;
  if(dr==1){s2=vec4(rc.z,rc.y,rc.z+h,rc.w);cc=rc.zw;rc.z+=h;}else if(dr==2){s2=vec4(rc.x,rc.w,rc.z,rc.w+w);cc=rc.xw;rc.w+=w;}else if(dr==3){s2=vec4(rc.x-h,rc.y,rc.x,rc.w);cc=rc.xy;rc.x-=h;}else{s2=vec4(rc.x,rc.y-w,rc.z,rc.y);cc=rc.zy;rc.y-=w;}
  if(q.x>=s2.x&&q.y>=s2.y&&q.x<=s2.z&&q.y<=s2.w){idx=n;sq=s2;ac=cc;}}
 if(idx<0)return vec4(1.);float t=float(idx);int cm=int(u_p1+.5);vec3 col;
 if(cm==0)col=hsv2rgb(vec3(fract(t*.13),.75,.95));else if(cm==1)col=hsv2rgb(vec3(fract(t*.17+.05),.35,1.));else if(cm==3)col=vec3(.25+.6*fract(t*.37));else{vec2 cpx=(sq.xy+sq.zw)*.5-.5;col=O(fromPX(vec2(cpx.x,-cpx.y)*U+PX(vec2(.5)))).rgb;}
 float e=min(min(q.x-sq.x,sq.z-q.x),min(q.y-sq.y,sq.w-q.y))*U;col=mix(col,vec3(0.),clamp(u_p2+.5-e,0.,1.)*step(.05,u_p2));
 if(u_p3>.5&&idx>0){float sd=sq.z-sq.x;float ad=abs(length(q-ac)-sd)*U;col=mix(col,vec3(0.),clamp(1.5-ad,0.,1.));}
 return vec4(col,1.);`,
  'Ego Eram Reputo & Red Ochre Fibonacci Fill, approx. from the Plugin Index description: coloured squares spiralling outwards from the centre, each side equal to the sum of the previous two (1, 1, 2, 3, 5, 8 ... units, attached right / below / left / above in turn); colours by square index or the image mean under the square, optional outlines and the quarter-circle golden spiral');

f('q46_curvedraw','Iterative Line Curves (Paint.NET Rosaces / Helix / Slinky / Callicolour / Volutes)',[S('Curve',['Rosaces','Helix','Slinky','Callicolour ribbons','Volutes']),P('Count',2,40,7,1),P('Size',.3,1,.9,.01),P('Shape',0,1,.4,.01)],
  `int m=int(u_p0+.5);float N=floor(u_p1+.5);vec2 res=u_res/u_k;float sz=.5*min(res.x,res.y)*u_p2;vec2 p=(PX(uv)-.5*res)/sz;float v=u_p3;float best=1e9,bt=0.;
 if(m==2){for(int i=0;i<60;i++){float fi=float(i);if(fi>=N*1.5)break;float s=(fi+.5)/(N*1.5);vec2 cc=vec2(-.75+1.5*s,.35*sin(6.28318*s*(.5+v)));vec2 tg=normalize(vec2(1.5,.35*6.28318*(.5+v)*cos(6.28318*s*(.5+v))));
   vec2 l=p-cc;l=vec2(dot(l,tg),dot(l,vec2(-tg.y,tg.x)));vec2 ab=vec2(.08+.12*v,.3);float d=abs(length(l/ab)-1.)*min(ab.x,ab.y);if(d<best){best=d;bt=s;}}}
 else{int strands=m==0?2:m==3?int(clamp(N,2.,32.)):1;int per=m==0?600:m==1?int(min(40.*N,1200.)):m==3?40:900;vec2 cp[4];
  for(int k=0;k<4;k++)cp[k]=vec2(-.85+.55*float(k)+.3*hash(vec2(float(k),u_seed+1.)),hash(vec2(float(k)+7.,u_seed+3.))*1.6-.8);
  vec2 pr=vec2(0.);for(int i=0;i<1300;i++){int sj=i/(per+1);if(sj>=strands)break;int ii=i-sj*(per+1);float t=float(ii)/float(per);float fs=float(sj);vec2 q;
   if(m==0){float dd=1.+floor(v*3.99);float th=t*6.28318*dd;float r=cos(N*th/dd)*(fs<.5?1.:.55);float rr=fs<.5?0.:3.14159/N;q=r*vec2(cos(th+rr),sin(th+rr));}
   else if(m==1){float om=6.28318*N*t;float b=.45*mix(1.,t,v);q=vec2(-.85+1.7*t+.5*b*cos(om),b*sin(om));}
   else if(m==3){float o=(fs/max(float(strands)-1.,1.)-.5)*(.4+.8*v);vec2 a0=cp[0]+vec2(0.,o),a1=cp[1]+vec2(o,0.),a2=cp[2]-vec2(o,0.),a3=cp[3]+vec2(0.,-o);float u=1.-t;q=u*u*u*a0+3.*u*u*t*a1+3.*u*t*t*a2+t*t*t*a3;}
   else{q=vec2(0.);float sa=0.;for(int k=0;k<5;k++){float fk=float(k);float ak=1./(1.+fk*(.5+v));float wk=(1.+floor(hash(vec2(fk,u_seed+5.))*N))*(hash(vec2(fk,u_seed+9.))<.5?-1.:1.);float ph=6.28318*hash(vec2(fk,u_seed+11.));q+=ak*vec2(cos(wk*6.28318*t+ph),sin(wk*6.28318*t+ph));sa+=ak;}q/=sa;}
   if(ii>0){vec2 e=q-pr;vec2 w=p-pr;float h=clamp(dot(w,e)/max(dot(e,e),1e-9),0.,1.);float d=length(w-e*h);if(d<best){best=d;bt=m==3?fs/max(float(strands)-1.,1.):t;}}pr=q;}}
 float cov=clamp(1.3-best*sz,0.,1.);vec3 col=ramp(3,bt);return vec4(mix(vec3(1.),col,cov),1.);`,
  'Paint.NET iterative-line generators, approx. from their Plugin Index descriptions (rainbow lines on white): MadJik Rosaces = rose curves r = cos(n theta / d) (Count petals, Shape picks d = 1-4) with a smaller rotated inner rose; Red Ochre Helix = a coil seen from the side, Shape tapers it into a spiral cone; Red Ochre Slinky / SlinkyPlus = ellipses strung along a sine curve, Shape sets their width and the curve bend; Red Ochre Callicolour = Count Bezier strands through four seeded control points with opposite offsets at the inner points, giving twisted coloured ribbons; MadJik Volutes = a seeded random closed curve (sum of five random epicycles, normalised to fit)', true);

f('q46_wavylines','Varicose / Turbulent Circles (Paint.NET)',[S('Pattern',['Varicose wibbly lines','Turbulent circles']),P('Spacing',6,80,20,1,'px'),P('Turbulence',0,2,.8,.01),P('Line width',.5,12,3,.1,'px')],
  `vec2 res=u_res/u_k;vec2 p=PX(uv);float Sp=u_p1;float sd=u_seed*13.1;vec3 o=vec3(1.);float cov=0.;float ci=0.;
 if(u_p0<.5){float i0=floor(p.y/Sp);for(int k=-2;k<=2;k++){float i=i0+float(k);float yc=(i+.5)*Sp+u_p2*Sp*(fbm(vec2(p.x/(3.*Sp),i*7.13+sd))-.5)*2.5;float th=u_p3*(.35+1.3*vnoise(vec2(p.x/(1.5*Sp),i*3.71+sd+50.)));float cv=clamp(th*.5+.5-abs(p.y-yc),0.,1.);if(cv>cov){cov=cv;ci=i;}}
  return vec4(mix(o,hsv2rgb(vec3(fract(ci*.11),.7,.55)),cov),1.);}
 vec2 d=p-.5*res;float r=length(d)+u_p2*Sp*(fbm(d/(2.5*Sp)+sd)-.5)*3.;float i=floor(r/Sp+.5);float dd=abs(r-i*Sp);cov=clamp(u_p3*.5+.5-dd,0.,1.);
 return vec4(mix(o,mix(vec3(.15,.12,.25),vec3(.55,.5,.7),fract(i*.37)),cov),1.);`,
  'jchunn / MadJik Varicose (wibbly lines) and Midora Turbulent Circles, approx. from the Plugin Index descriptions: Varicose = horizontal lines every Spacing px displaced by seeded fbm and swelling / thinning along their length; Turbulent Circles = concentric circles whose radius is perturbed by fbm turbulence (smooth rings at 0, smoke rings / lava / petals as Turbulence grows)', true);
