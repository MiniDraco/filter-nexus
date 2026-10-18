/* ================= Round 5: edge-aware solvers, color science, transforms ================= */
const LIN = v => `mix(${v}/12.92,pow((${v}+.055)/1.055,vec3(2.4)),step(vec3(.04045),${v}))`;
const SRGB = v => `mix(${v}*12.92,1.055*pow(max(${v},vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),${v}))`;
// Domain transform, normalized-convolution variant (Gastal & Oliveira 2011): box filter in the transformed domain
const DTNC = (dir, e) => `vec3 c0=T(uv).rgb;float rad=R(u_p0)*1.732*${e}/7.937*1.732;float st=max(1.,rad/24.);float ratio=R(u_p0)/u_p1;vec3 acc=c0;float w=1.;
  for(int sd=-1;sd<=1;sd+=2){float d=0.;vec3 pv=c0;for(int k=1;k<=24;k++){vec3 v=T(uv+${dir}*float(sd*k)*st*u_px).rgb;d+=st+ratio*dot(abs(v-pv),vec3(1.))/3.;if(d>rad)break;acc+=v;w+=1.;pv=v;}}return vec4(acc/w,1.);`;
// WLS (Farbman 2008) by strided Jacobi sweeps: u = (g + Σ w u_n) / (1 + Σ w), w = λ / (|Δ log L|^α + ε)
const WLSJ = s => `vec3 g=O(uv).rgb;float lg=log(luma(g)+.01);vec3 sm=g;float ws=0.;for(int k=0;k<4;k++){vec2 o=(k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):vec2(0.,-1.))*${s}.*max(u_k,1.)*u_px;float ln=log(luma(O(uv+o).rgb)+.01);float w=u_p0/(pow(abs(ln-lg),u_p1)+.02)/${s}.;sm+=w*T(uv+o).rgb;ws+=w;}return vec4(sm/(1.+ws),1.);`;
f = add('Blur');
f('domaintransform','Domain Transform (edge-aware)',[P('Spatial sigma',2,120,12,1,'px'),P('Range sigma',.02,1,.12,.01)],
  [DTNC('vec2(1.,0.)','4.'),DTNC('vec2(0.,1.)','4.'),DTNC('vec2(1.,0.)','2.'),DTNC('vec2(0.,1.)','2.'),DTNC('vec2(1.,0.)','1.'),DTNC('vec2(0.,1.)','1.')],'Gastal & Oliveira 2011, NC, 3 iterations');
f('wls','WLS Edge-Preserving Smoothing',[P('Lambda',.05,10,1.5,.05),P('Alpha',.8,2,1.2,.01)],
  [`return O(uv);`,...[8,4,2,1,8,4,2,1,4,2,1,2,1,1].map(WLSJ)],'Farbman 2008, strided Jacobi approx.');
f('freqsep','Frequency Separation',[P('Radius',1,60,8,.5,'px'),S('Output',['High (detail on 50% gray)','Low (color & tone)','Recombine']),P('Detail gain',0,3,1,.01),P('Low smoothing',0,1,0,.01)],
  [BH('u_p0'),BV('u_p0'),`vec3 lo=T(uv).rgb,o=O(uv).rgb,hi=o-lo;int m=int(u_p1+.5);if(m==0)return vec4(clamp(hi*u_p2+.5,0.,1.),1.);if(m==1)return vec4(lo,1.);return vec4(clamp(mix(o-hi,lo,u_p3)+hi*u_p2,0.,1.),1.);`],'retouching split');
f = add('Color');
f('cvd','Color Blindness Simulation / Daltonize',[S('Type',['Protanopia','Deuteranopia','Tritanopia','Achromatopsia']),P('Severity',0,1,1,.01),S('Mode',['Simulate','Daltonize (correct)'])],
  `vec3 l=${LIN('c.rgb')};int t=int(u_p0+.5);vec3 s;if(t==0)s=vec3(dot(vec3(.152286,1.052583,-.204868),l),dot(vec3(.114503,.786281,.099216),l),dot(vec3(-.003882,-.048116,1.051998),l));
  else if(t==1)s=vec3(dot(vec3(.367322,.860646,-.227968),l),dot(vec3(.280085,.672501,.047413),l),dot(vec3(-.01182,.04294,.968881),l));else if(t==2)s=vec3(dot(vec3(1.255528,-.076749,-.178779),l),dot(vec3(-.078411,.930809,.147602),l),dot(vec3(.004733,.691367,.3039),l));else s=vec3(dot(l,vec3(.2126,.7152,.0722)));
  s=mix(l,s,u_p1);vec3 o=s;if(u_p2>.5){vec3 e=l-s;o=l+vec3(0.,.7*e.r+e.g,.7*e.r+e.b);}o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`,'Machado 2009 matrices, Fidaner daltonize');
f('chromadapt','Chromatic Adaptation (White Point)',[P('Source white',1700,12000,3200,50,'K'),P('Target white',1700,12000,6504,50,'K'),S('Method',['Bradford','CAT02','Von Kries','XYZ scaling'])],
  `vec3 W[2];for(int k=0;k<2;k++){float T_=clamp(k==0?u_p0:u_p1,1667.,25000.);float i=1e3/T_;float x=T_<4000.?-.2661239*i*i*i-.2343589*i*i+.8776956*i+.17991:-3.0258469*i*i*i+2.1070379*i*i+.2226347*i+.24039;
  float y=T_<2222.?-1.1063814*x*x*x-1.3481102*x*x+2.18555832*x-.20219683:T_<4000.?-.9549476*x*x*x-1.37418593*x*x+2.09137015*x-.16748867:3.081758*x*x*x-5.8733867*x*x+3.75112997*x-.37001483;W[k]=vec3(x/y,1.,(1.-x-y)/y);}
  int m=int(u_p2+.5);mat3 MA=m==0?transpose(mat3(.8951,.2664,-.1614,-.7502,1.7135,.0367,.0389,-.0685,1.0296)):m==1?transpose(mat3(.7328,.4296,-.1624,-.7036,1.6975,.0061,.003,.0136,.9834)):m==2?transpose(mat3(.40024,.7076,-.08081,-.2263,1.16532,.0457,0.,0.,.91822)):mat3(1.);
  mat3 MX=transpose(mat3(.4124564,.3575761,.1804375,.2126729,.7151522,.072175,.0193339,.119192,.9503041));vec3 sc=(MA*W[1])/(MA*W[0]);
  vec3 l=${LIN('c.rgb')};vec3 o=clamp(inverse(MX)*(inverse(MA)*((MA*(MX*l))*sc)),0.,1.);return vec4(${SRGB('o')},1.);`,'Kim 2002 CCT→xy, linear sRGB');
f = add('Analysis');
f('clipwarn','Clipping / Zebra Warning',[S('Show',['Clipping (red highs / blue lows)','Per-channel clipping','Zebra stripes']),P('Highlight threshold',.8,1,.98,.005),P('Shadow threshold',0,.2,.02,.005),P('Dim image',0,1,.3,.01)],
  `vec3 v=c.rgb;int m=int(u_p0+.5);vec3 base=c.rgb*(1.-u_p3);if(m==0){if(max(v.r,max(v.g,v.b))>=u_p1)return vec4(1.,0.,0.,1.);if(min(v.r,min(v.g,v.b))<=u_p2)return vec4(0.,.3,1.,1.);return vec4(base,1.);}
  if(m==1){vec3 h=step(vec3(u_p1),v),s=step(v,vec3(u_p2));if(dot(h,vec3(1.))>0.)return vec4(h,1.);if(dot(s,vec3(1.))>0.)return vec4((vec3(1.)-s)*.6,1.);return vec4(base,1.);}
  vec2 p=PX(uv);float z=step(.5,fract((p.x+p.y)/R(8.)));return vec4(luma(v)>=u_p1?mix(c.rgb,vec3(z),.85):c.rgb,1.);`,'camera / Lightroom exposure warnings');
f('census','Census / Rank Transform',[S('Window',['3×3','5×5']),S('Output',['Census code (gray)','Hashed color','Rank transform']),P('Noise margin',0,.1,.01,.001)],
  `float ce=luma(c.rgb);int r=u_p0>.5?2:1;float code=0.,rank=0.,n=0.;float e=max(u_k,1.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){if(abs(i)>r||abs(j)>r||(i==0&&j==0))continue;float v=L(uv+vec2(float(i),float(j))*u_px*e);float b=v<ce-u_p2?1.:0.;code=code*2.+b;rank+=b;n+=1.;}
  int m=int(u_p1+.5);if(m==0)return vec4(vec3(code/(exp2(n)-1.)),1.);if(m==1)return vec4(fract(sin(code*vec3(12.9898,78.233,37.719)+vec3(1.,2.,3.))*43758.5453),1.);return vec4(vec3(rank/n),1.);`,'Zabih & Woodfill 1994');
f('houghspace','Hough / Radon Transform',[S('Input',['Edges (Sobel)','Brightness']),P('Edge threshold',0,1,.15,.01),P('Gain',1,60,8,.5),S('Palette',['Inferno','Gray'])],
  [`float g=length(sobel(uv));return vec4(vec3(u_p0<.5?max(g-u_p1,0.):luma(c.rgb)),1.);`,
   `float a=asp();float th=uv.x*3.14159265;vec2 nn=vec2(cos(th),sin(th)),tt=vec2(-nn.y,nn.x);float D=.5*sqrt(a*a+1.);float rho=(uv.y*2.-1.)*D;float s=0.,cnt=0.;
   for(int k=0;k<192;k++){float t=(float(k)/191.*2.-1.)*D;vec2 p=nn*rho+tt*t;vec2 q=vec2(p.x/a+.5,p.y+.5);if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;s+=T(q).r;cnt+=1.;}
   float v=clamp(u_p0<.5?s/192.*u_p2:(s/max(cnt,1.)-.25)*u_p2*.25,0.,1.);return vec4(u_p3>.5?vec3(v):ramp(1,v),1.);`],'x = angle 0–180°, y = distance; bright spots = straight lines');
