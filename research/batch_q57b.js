/* ================= q57b: round-20 solar / astronomical display functions (sunkit-image, astropy, ImPPG) and VIGRA tensor / symmetry / corner operators ================= */
// MGN: per scale i (sigma 1.25 * 2^i px) four passes; R = local mean / variance work channel, G = local mean, A = arctan accumulator (.5 + sum / 6pi)
const Q57_MGB = (i, dir, src) => `float s=R(1.25*${1 << i}.);float rd=3.*s,st=max(1.,rd/32.);float m=0.,w=0.;for(int k=-32;k<=32;k++){float x=float(k)*st;if(abs(x)>rd)continue;float g=exp(-x*x/(2.*s*s));m+=${src}*g;w+=g;}m/=w;`;
const Q57_MG = i => [
  `float a=${i === 0 ? '.5' : 'T(uv).a'};if(${i}.>u_p3-.5)return vec4(T(uv).rgb,a);${Q57_MGB(i, 'x', 'luma(O(uv+vec2(x*u_px.x,0.)).rgb)')}return vec4(m,0.,0.,a);`,
  `vec4 c0=T(uv);if(${i}.>u_p3-.5)return c0;${Q57_MGB(i, 'y', 'T(uv+vec2(0.,x*u_px.y)).r')}float d=luma(O(uv).rgb)-m;return vec4(d*d,m,0.,c0.a);`,
  `vec4 c0=T(uv);if(${i}.>u_p3-.5)return c0;${Q57_MGB(i, 'x', 'T(uv+vec2(x*u_px.x,0.)).r')}return vec4(m,c0.g,0.,c0.a);`,
  `vec4 c0=T(uv);if(${i}.>u_p3-.5)return c0;${Q57_MGB(i, 'y', 'T(uv+vec2(0.,x*u_px.y)).r')}float sw=sqrt(max(m,0.));sw=sw<=0.?1.:sw;float C=(luma(O(uv).rgb)-c0.g)/sw;return vec4(0.,c0.g,0.,c0.a+atan(u_p0*C)/18.849556);`];
const Q57_DV2 = `
#define Q57DW(t_) ((t_)<.5?mix(vec3(.13,.3,.75),vec3(.96),(t_)*2.):mix(vec3(.96),vec3(.8,.15,.1),(t_)*2.-1.))
`;
// central-difference gradient of the previous (blurred) pass, scale-normalised, stored .5 + .5 * clamp(4 g)
const Q57_GRAD = `float s=max(R(u_p0),.5);vec2 e=u_px;float gx=(luma(T(uv+vec2(e.x,0.)).rgb)-luma(T(uv-vec2(e.x,0.)).rgb))*.5*s,gy=(luma(T(uv+vec2(0.,e.y)).rgb)-luma(T(uv-vec2(0.,e.y)).rgb))*.5*s;`;

f = add('Tone');
f('q57_mgn','Multi-scale Gaussian Normalization (sunkit-image mgn)',[P('k',.1,3,.7,.01),P('Gamma',1,6,3.2,.05),P('h (global weight)',0,1,.7,.01),P('Scales',1,6,6,1)],
  [...Q57_MG(0),...Q57_MG(1),...Q57_MG(2),...Q57_MG(3),...Q57_MG(4),...Q57_MG(5),
   `float mn=1e9,mx=-1e9;for(int j=0;j<14;j++)for(int i=0;i<14;i++){float v=luma(O((vec2(float(i),float(j))+.5)/14.).rgb);mn=min(mn,v);mx=max(mx,v);}
 float x=luma(O(uv).rgb);float cg=pow(clamp((x-mn)/max(mx-mn,1e-6),0.,1.),1./u_p1);float lc=(T(uv).a-.5)*18.849556/floor(u_p3+.5);
 return vec4(vec3(clamp(u_p2*cg+(1.-u_p2)*lc,0.,1.)),1.);`],
  'sunkit-image enhance.mgn (Morgan & Druckmueller 2014): for sigma = 1.25, 2.5, 5, 10, 20, 40 px: C = (B - G_s*B) / sqrt(G_s*(B - G_s*B)^2) (Gaussian truncated at 3 sigma), arctan(k C) averaged over the scales (divided by their count, weights 1); global term ((B - min)/(max - min))^(1/gamma) (min / max from a 14x14 sample grid); out = h * global + (1 - h) * local, clipped 0..1 for display; on luma');
f('q57_astrostretch','Astro Display Stretches (sunkit-image / astropy)',[S('Stretch',['Upsilon (double-sided gamma)','Power distribution (a^x - 1)/(a - 1)','Sinh','Contrast / bias']),P('Shape A',.01,1,.5,.01),P('Shape B',0,1,.5,.01),S('Channels',['Per channel','Luminance (keep colour)'])],
  `int m=int(u_p0+.5);vec3 mean=vec3(0.);if(m==0){for(int j=0;j<12;j++)for(int i=0;i<12;i++)mean+=O((vec2(float(i),float(j))+.5)/12.).rgb;mean/=144.;}
 vec3 x=u_p3<.5?c.rgb:vec3(luma(c.rgb));if(u_p3>.5)mean=vec3(luma(mean));vec3 y;
 if(m==0){float al=u_p1*2.,ah=u_p2*2.;y=mix(pow(2.*x,vec3(al))*.5,1.-pow(max(2.-2.*x,0.),vec3(ah))*.5,step(mean,x));}
 else if(m==1){float a=pow(10.,6.*u_p1);y=(pow(vec3(a),x)-1.)/(a-1.);}
 else if(m==2){float a=u_p1*2./3.;y=(exp(x/a)-exp(-x/a))/(exp(1./a)-exp(-1./a));}
 else y=(x-u_p2)*(2.*u_p1)+.5;
 y=clamp(y,0.,1.);if(u_p3>.5)y=c.rgb*(y.x/max(x.x,1e-4));return vec4(clamp(y,0.,1.),1.);`,
  'sunkit-image utils.apply_upsilon: below the image mean (2x)^alpha / 2, above 1 - (2 - 2x)^alpha_high / 2 (alpha = 2A, alpha_high = 2B; default 0.5, 0.5); astropy.visualization PowerDistStretch (a^x - 1)/(a - 1) with a = 10^(6A) (default 1000), SinhStretch sinh(x/a)/sinh(1/a) with a = 2A/3 (default 1/3), ContrastBiasStretch (x - bias) * contrast + 0.5 with contrast = 2A, bias = B; clipped 0..1 (astropy clip=True), input = display values 0..1');
f = add('Sharpen');
f('q57_imppg_usm','Brightness-Adaptive Unsharp Mask (ImPPG)',[P('Sigma',.5,20,2,.1,'px'),P('Amount min',0,10,1,.05),P('Amount max',0,10,3,.05),P('Threshold',0,1,.35,.01)],
  [BH('u_p0*2.'),BV('u_p0*2.'),`vec3 o=O(uv).rgb;float a=mix(u_p1,u_p2,smoothstep(u_p3-.1,u_p3+.1,luma(o)));return vec4(clamp(a*o+(1.-a)*T(uv).rgb,0.,1.),1.);`],
  'ImPPG unsharp masking, adaptive mode (README 4.3): out = amount * image + (1 - amount) * Gaussian(sigma) (amount 1 = none, < 1 blurs, > 1 sharpens), amount = amount min where the unprocessed image is darker than threshold - transition width, amount max above threshold + width, smooth in between; approx.: transition width fixed at 0.1 and the smooth step shape assumed');

/* ---- VIGRA ---- */
f = add('Edges');
f('q57_vigra_boundary','Boundary Tensor (VIGRA, Koethe)',[P('Scale',.7,6,1.5,.05,'px'),S('Output',['Boundary strength (trace)','Edge energy','Junction energy','Edges red + junctions green','Edge orientation colour']),S('Variant',['boundaryTensor','boundaryTensor1 (no blob response)']),P('Gain',1,40,10,.5)],
  [BH('u_p0*2.'),BV('u_p0*2.'),`vec2 e=u_px;float s=max(R(u_p0),.5);
 #define Q57B(i_,j_) luma(T(uv+vec2(i_,j_)*e).rgb)
 float c0=Q57B(0.,0.),xp=Q57B(1.,0.),xm=Q57B(-1.,0.),yp=Q57B(0.,1.),ym=Q57B(0.,-1.),pp=Q57B(1.,1.),pm=Q57B(1.,-1.),mp=Q57B(-1.,1.),mm=Q57B(-1.,-1.);
 float lxp=Q57B(2.,0.)+c0+pp+pm-4.*xp,lxm=c0+Q57B(-2.,0.)+mp+mm-4.*xm,lyp=pp+mp+Q57B(0.,2.)+c0-4.*yp,lym=pm+mm+c0+Q57B(0.,-2.)-4.*ym;
 float e0=(xp+xm-2.*c0)*s*s,e1=(pp-pm-mp+mm)*.25*s*s,e2=(yp+ym-2.*c0)*s*s,d0=(lxp-lxm)*.5*s*s*s,d1=(lyp-lym)*.5*s*s*s;
 float t11,t12,t22;if(u_p2<.5){t11=e0*e0+e1*e1;t12=e1*(e0+e2);t22=e1*e1+e2*e2;}else{float v=.5*(e0-e2)*(e0-e2)+2.*e1*e1;t11=v;t12=0.;t22=v;}
 t11+=d0*d0;t12+=d0*d1;t22+=d1*d1;float tr=t11+t22,ds=sqrt((t11-t22)*(t11-t22)+4.*t12*t12);float l1=.5*(tr+ds),l2=.5*(tr-ds);
 int o=int(u_p1+.5);float G=u_p3;float ed=sqrt(max(l1-l2,0.))*G,jn=sqrt(max(2.*l2,0.))*G*2.;
 if(o==0)return vec4(vec3(clamp(sqrt(tr)*G,0.,1.)),1.);if(o==1)return vec4(vec3(clamp(ed,0.,1.)),1.);if(o==2)return vec4(vec3(clamp(jn,0.,1.)),1.);
 if(o==3)return vec4(clamp(vec3(ed,jn,0.),0.,1.),1.);float an=.5*atan(2.*t12,t11-t22);return vec4(hsv2rgb(vec3(an/3.14159265+.5,.85,clamp(ed,0.,1.))),1.);`],
  'VIGRA boundaryTensor / boundaryTensor1 (Koethe 2003, boundarytensor.hxx): even part from the 2nd-order Riesz transform of the LoG (= scale-normalised Gaussian 2nd derivatives e0 e1 e2): [e0^2 + e1^2, e1(e0 + e2); ., e1^2 + e2^2] (boundaryTensor1: 0.5(e0 - e2)^2 + 2 e1^2 on the diagonal, no blob term), plus the odd part d d^T; edge energy = l1 - l2, junction energy = 2 l2 (shown as square roots x Gain); approx.: the odd 1st-order Riesz pair of the LoG is replaced by the gradient of the LoG (VIGRA fits polynomial-Gaussian kernels), derivatives by finite differences of the Gaussian-smoothed image');
f = add('Analysis');
f('q57_vigra_hourglass','Hourglass Tensor Filter (VIGRA, Koethe)',[P('Inner scale',.5,4,1,.05,'px'),P('Sigma',.7,4,1.4,.05,'px'),P('Rho',.1,1.5,.4,.01),S('Output',['Edgeness','Cornerness','Orientation colour','Edges red + corners green'])],
  [BH('u_p0*2.'),BV('u_p0*2.'),`${Q57_GRAD}return vec4(.5+.5*clamp(4.*vec2(gx,gy),-1.,1.),0.,1.);`,
   `float sg=max(R(u_p1),.5),rho=u_p2;float rr=min(ceil(3.*sg),12.);vec3 tt=vec3(0.);
 for(int j=-12;j<=12;j++)for(int i=-12;i<=12;i++){vec2 o=vec2(float(i),float(j));if(abs(o.x)>rr||abs(o.y)>rr)continue;vec2 q=uv-o*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;
  vec2 g=(T(q).rg-.5)*.5;float g2=dot(g,g);if(g2<1e-8)continue;vec2 gd=g/sqrt(g2),ed=vec2(-gd.y,gd.x);float pe=dot(o,ed),qg=dot(o,gd);float r2=dot(o,o);
  float k=pe==0.?(qg==0.?1.:0.):exp(-r2/(2.*sg*sg)-qg*qg/(2.*rho*rho*pe*pe));tt+=k*vec3(g.x*g.x,g.x*g.y,g.y*g.y);}
 tt/=6.2831853*sg*sg;float tr=tt.x+tt.z,ds=sqrt((tt.x-tt.z)*(tt.x-tt.z)+4.*tt.y*tt.y);float l1=.5*(tr+ds),l2=.5*(tr-ds);float ed2=sqrt(max(l1-l2,0.))*10.,cn=sqrt(max(l2,0.))*20.;
 int m=int(u_p3+.5);if(m==0)return vec4(vec3(clamp(ed2,0.,1.)),1.);if(m==1)return vec4(vec3(clamp(cn,0.,1.)),1.);if(m==3)return vec4(clamp(vec3(ed2,cn,0.),0.,1.),1.);
 float an=.5*atan(2.*tt.y,tt.x-tt.z);return vec4(hsv2rgb(vec3(an/3.14159265+.5,.85,clamp(ed2,0.,1.))),1.);`],
  'VIGRA hourGlassFilter (Koethe 2003, orientedtensorfilters.hxx): every gradient tensor g g^T (Gaussian gradient at the inner scale) is spread with its own hourglass kernel exp(-r^2/2sigma^2 - q^2/(2 rho^2 p^2)) / (2 pi sigma^2), p along its edge direction, q along the gradient (radius 3 sigma, unnormalised as in VIGRA), computed here as the equivalent gather; then the tensor eigen representation: edgeness l1 - l2, cornerness l2 (square roots, fixed gain)');
f('q57_vigra_frst','Fast Radial Symmetry Transform (VIGRA, Loy-Zelinsky)',[P('Radius',2,16,6,1,'px'),S('Output',['Signed (bright red, dark blue)','Bright blobs','Dark blobs','Overlay on image']),P('Gain',.5,60,14,.1)],
  [BH('u_p0*2.'),BV('u_p0*2.'),`${Q57_GRAD}return vec4(.5+.5*clamp(4.*vec2(gx,gy),-1.,1.),0.,1.);`,
   `float N=floor(R(u_p0)+.5);float Oc=0.,Mc=0.;for(int j=-17;j<=17;j++)for(int i=-17;i<=17;i++){vec2 o=vec2(float(i),float(j));if(abs(length(o)-N)>1.5)continue;vec2 q=uv-o*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)continue;
  vec2 g=(T(q).rg-.5)*.5;float m=length(g);if(m<1e-3)continue;vec2 v=floor(N*g/m+.5);if(v==o){Oc+=1.;Mc+=m;}else if(-v==o){Oc-=1.;Mc-=m;}}
 float on=clamp(Oc,-9.9,9.9)/9.9;return vec4(.5+.5*clamp(on*on*Mc/9.9*4.,-1.,1.),0.,0.,1.);`,
   BH('u_p0*.5'),BV('u_p0*.5'),
   `${Q57_DV2}float F=(T(uv).r-.5)*2.*u_p2;int m=int(u_p1+.5);if(m==0)return vec4(Q57DW(clamp(.5+.5*F,0.,1.)),1.);if(m==1)return vec4(vec3(clamp(F,0.,1.)),1.);if(m==2)return vec4(vec3(clamp(-F,0.,1.)),1.);
 vec3 b=O(uv).rgb*.6;return vec4(clamp(b+vec3(max(F,0.),0.,0.)+vec3(0.,.3,1.)*max(-F,0.),0.,1.),1.);`],
  'VIGRA radialSymmetryTransform (Loy & Zelinsky 2003, symmetry.hxx): Gaussian gradient at sigma = radius; each pixel votes +1 / +|g| at p + round(n g/|g|) and -1 / -|g| at p - round(n g/|g|) into the orientation and magnitude accumulators (gathered here over the ring at the radius); F = (O/kn)^2 * M/kn, then Gaussian smoothing at 0.25 n; bright blobs positive, dark negative; approx.: normalised by the paper constant kn = 9.9 (clipped) instead of VIGRA\'s image maxima');
f = add('Edges');
f('q57_vigra_rohr','Rohr Corner Detector (VIGRA cornernessRohr)',[P('Scale',.7,5,1.5,.05,'px'),P('Gain',1,1000,250,1),S('Output',['Cornerness map','Corners on image']),P('Threshold',0,1,.7,.01)],
  [BH('u_p0*2.'),BV('u_p0*2.'),`${Q57_GRAD}return vec4(gx*gx*4.,.5+2.*gx*gy,gy*gy*4.,1.);`,BH('u_p0*2.'),BV('u_p0*2.'),
   `
#define Q57RD(q_) (T(q_).r*T(q_).b/16.-(T(q_).g-.5)*(T(q_).g-.5)*.25)
 float d=Q57RD(uv);float v=sqrt(max(d,0.))*u_p1;if(u_p2<.5)return vec4(vec3(clamp(v,0.,1.)),1.);bool mx=v>u_p3;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){if(i==0&&j==0)continue;if(Q57RD(uv+vec2(float(i),float(j))*u_px)>d)mx=false;}
 vec3 b=O(uv).rgb*.7;if(mx)b=vec3(1.,.15,.1);else{for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 q=uv+vec2(float(i),float(j))*u_px;float dq=Q57RD(q);if(sqrt(max(dq,0.))*u_p1<=u_p3)continue;bool m2=true;
  for(int b2=-1;b2<=1;b2++)for(int a2=-1;a2<=1;a2++){if(a2==0&&b2==0)continue;if(Q57RD(q+vec2(float(a2),float(b2))*u_px)>dq)m2=false;}if(m2&&abs(i)+abs(j)<=2)b=vec3(1.,.15,.1);}}
 return vec4(b,1.);`],
  'VIGRA rohrCornerDetector / cornernessRohr (Rohr 1987): determinant Txx Tyy - Txy^2 of the structure tensor (Gaussian gradient and tensor smoothing both at Scale), shown as sqrt x Gain; corners = 3x3 local maxima above the threshold drawn as red diamonds');
