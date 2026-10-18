/* ================= q35c: PDE / diffusion inpainting from the literature (single image, mask from the image like 'inpaint') ================= */
f = add('Repair');
const Q35_INP = s => `vec4 c0=T(uv);if(c0.a<.5)return c0;int m=int(u_p0+.5);float s=max(${s}.*u_k,1.);vec3 G[25];float L[25];
#define Q35UX(cc) (.5*(L[(cc)+1]-L[(cc)-1]))
#define Q35UY(cc) (.5*(L[(cc)+5]-L[(cc)-5]))
#define Q35K(cc) clamp(((L[(cc)+1]-2.*L[cc]+L[(cc)-1])*Q35UY(cc)*Q35UY(cc)-.5*Q35UX(cc)*Q35UY(cc)*(L[(cc)+6]-L[(cc)+4]-L[(cc)-4]+L[(cc)-6])+(L[(cc)+5]-2.*L[cc]+L[(cc)-5])*Q35UX(cc)*Q35UX(cc))/pow(Q35UX(cc)*Q35UX(cc)+Q35UY(cc)*Q35UY(cc)+1e-4,1.5),-2.,2.)
 for(int k=0;k<25;k++){G[k]=T(uv+vec2(float(k%5-2),float(k/5-2))*s*u_px).rgb;L[k]=luma(G[k]);}
 vec3 avg=.25*(G[11]+G[13]+G[7]+G[17]);vec3 res=avg;
 if(m==1)res=.073235*(G[6]+G[8]+G[16]+G[18])+.176765*(G[11]+G[13]+G[7]+G[17]);
 else if(m==2||m==3){float we=1./sqrt(pow(L[13]-L[12],2.)+pow(.25*(L[17]+L[18]-L[7]-L[8]),2.)+1e-4),ww=1./sqrt(pow(L[12]-L[11],2.)+pow(.25*(L[17]+L[16]-L[7]-L[6]),2.)+1e-4),
   wn=1./sqrt(pow(L[12]-L[7],2.)+pow(.25*(L[13]+L[8]-L[11]-L[6]),2.)+1e-4),wso=1./sqrt(pow(L[17]-L[12],2.)+pow(.25*(L[13]+L[18]-L[11]-L[16]),2.)+1e-4);
  if(m==3){float k0=Q35K(12);we*=abs(.5*(k0+Q35K(13)))+.05;ww*=abs(.5*(k0+Q35K(11)))+.05;wn*=abs(.5*(k0+Q35K(7)))+.05;wso*=abs(.5*(k0+Q35K(17)))+.05;}
  res=(we*G[13]+ww*G[11]+wn*G[7]+wso*G[17])/(we+ww+wn+wso);}
 else if(m==4){
  vec3 l13=G[14]+G[12]+G[8]+G[18]-4.*G[13],l11=G[12]+G[10]+G[6]+G[16]-4.*G[11],l7=G[8]+G[6]+G[2]+G[12]-4.*G[7],l17=G[18]+G[16]+G[12]+G[22]-4.*G[17];
  vec3 dlx=.5*(l13-l11),dly=.5*(l17-l7),ux=.5*(G[13]-G[11]),uy=.5*(G[17]-G[7]);vec3 nm=sqrt(ux*ux+uy*uy+1e-6);vec3 be=(dlx*(-uy)+dly*ux)/nm;
  vec3 xb=G[12]-G[11],xf=G[13]-G[12],yb=G[12]-G[7],yf=G[17]-G[12];
  vec3 gp=sqrt(pow(min(xb,0.),vec3(2.))+pow(max(xf,0.),vec3(2.))+pow(min(yb,0.),vec3(2.))+pow(max(yf,0.),vec3(2.)));
  vec3 gn=sqrt(pow(max(xb,0.),vec3(2.))+pow(min(xf,0.),vec3(2.))+pow(max(yb,0.),vec3(2.))+pow(min(yf,0.),vec3(2.)));
  vec3 gr=mix(gn,gp,step(0.,be));res=mix(G[12]+clamp(25.*be*gr,-.04,.04),avg,.2);}
 return vec4(clamp(res,0.,1.),1.);`;
f('q35_inpaint_pde','PDE Inpainting (Harmonic / Oliveira / TV / CDD / Bertalmio)',[S('Method',['Harmonic (Laplace)','Oliveira 2001 fast diffusion','TV (Chan-Shen)','CDD curvature-driven diffusion','Bertalmio 2000 transport']),S('Mask',['White pixels','Black pixels','Pure red (#FF0000)','Scratch / dust detector']),P('Mask tolerance',0,.5,.04,.005),S('Output',['Inpainted','Mask'])],
 [RS_MK('uv','mk') + `return vec4(mk,0.,0.,1.);`,
  `if(c.r<.5)return vec4(O(uv).rgb,0.);vec3 acc=vec3(0.);float ws=0.;int mm=int(u_p1+.5);int nr=mm==3?8:16;float mxd=mm==3?24.:160.;
  for(int k=0;k<16;k++){if(k>=nr)break;float a=6.2832*(float(k)+.5)/float(nr);vec2 d=vec2(cos(a),sin(a));float t=1.;for(int n=0;n<40;n++){vec2 q=uv+d*R(t)*u_px;if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)break;if(T(q).r<.5){float wd=1./(t*t);acc+=wd*O(q).rgb;ws+=wd;break;}t+=max(1.,t*.12);if(t>mxd)break;}}
  return vec4(ws>0.?acc/ws:vec3(.5),1.);`]
  .concat([16, 12, 8, 8, 6, 4, 4, 4, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(s => Q35_INP(s)))
  .concat([`vec4 t=T(uv);return int(u_p3+.5)==1?vec4(vec3(t.a),1.):vec4(t.rgb,1.);`]),
 'Iterative PDE inpainting inside the mask (boundary values fixed, lambda = 0 in the hole): Harmonic = Jacobi relaxation of the Laplace equation; Oliveira, Bowen, McKenna & Chang 2001 = repeated convolution with their diffusion kernel (diagonal a = .073235, axial b = .176765, centre 0); TV (Chan & Shen 2001) = lagged-diffusivity solve of div(grad u/|grad u|) = 0 (eps .01); CDD (Chan & Shen 2001) = div(g(|kappa|) grad u/|grad u|) with g(s) = s (+ .05 floor so flat starts diffuse), kappa = div(grad u/|grad u|); Bertalmio, Sapiro, Caselles & Ballester 2000 = transport u_t = grad(Lap u) . N with the slope-limited |grad u| of the paper, interleaved with diffusion. All start from an inverse-distance radial fill and run 24 sweeps on a coarse-to-fine stride schedule (16..1 px) instead of thousands of single-pixel iterations (approx.)');

/* ================= q35d: camera & lens projection models (perspective <-> model remapping) ================= */
f = add('Distort');
const Q35_CAM = (unproj, proj, fovIdx, scl, zoom, dirIdx) => `float A=asp();vec2 p=(uv-.5)*2.*vec2(A,1.);float fi=A/tan(radians(u_p${fovIdx})*.5);float fm=fi*${scl};float zm=${zoom};vec2 q;bool ok=true;
  if(u_p${dirIdx}<.5){vec2 mm=p/(fm*zm);vec3 X;${unproj}if(!ok||X.z<=1e-5)return vec4(0.,0.,0.,1.);q=fi*X.xy/X.z;}
  else{vec3 X=vec3(p/(fi*zm),1.);vec2 mm;${proj}if(!ok)return vec4(0.,0.,0.,1.);q=fm*mm;}
  vec2 s2=q/(2.*vec2(A,1.))+.5;if(s2.x<0.||s2.y<0.||s2.x>1.||s2.y>1.)return vec4(0.,0.,0.,1.);return T(s2);`;
f('q35_cam_kb','Kannala-Brandt Fisheye Model (2006)',[P('k1',-.5,.5,0,.005),P('k2',-.2,.2,0,.002),P('Input FOV',20,170,100,1,'deg'),S('Direction',['Pinhole to fisheye','Fisheye to pinhole'])],
  Q35_CAM(`float ru=length(mm);float th=ru;for(int i=0;i<12;i++){float t2=th*th;float d=th*(1.+u_p0*t2+u_p1*t2*t2);float dd=1.+3.*u_p0*t2+5.*u_p1*t2*t2;th-=(d-ru)/(abs(dd)>1e-4?dd:1e-4);}
   if(th>3.1)ok=false;X=vec3(ru>1e-6?sin(th)*mm/ru:vec2(0.),cos(th));`,
   `float r=length(X.xy);float th=atan(r,X.z);float t2=th*th;float d=th*(1.+u_p0*t2+u_p1*t2*t2);mm=r>1e-6?d*X.xy/r:vec2(0.);`, 2, '1.', '1.', 3),
 'Kannala & Brandt 2006 generic fisheye model (as in Usenko et al. 2018): theta = atan2(r, z), d(theta) = theta + k1 theta^3 + k2 theta^5 (k3 = k4 = 0), pi(x) = f d(theta) x/r; unprojection by Newton on d(theta) = r_u. Pinhole to fisheye renders the image (taken as a pinhole view with the given horizontal FOV) through the model with the same focal length; fisheye to pinhole undistorts an image taken with the model (k1 = k2 = 0 is the equidistant lens)');
f('q35_cam_ucm','Unified Camera Model (Mei 2007)',[P('xi',0,2,1,.01),P('Input FOV',20,170,100,1,'deg'),P('Zoom',.2,3,1,.01),S('Direction',['Pinhole to UCM','UCM to pinhole'])],
  Q35_CAM(`float r2=dot(mm,mm);if(u_p0>1.&&r2>1./(u_p0*u_p0-1.))ok=false;else{float fa=(u_p0+sqrt(max(1.+(1.-u_p0*u_p0)*r2,0.)))/(1.+r2);X=fa*vec3(mm,1.)-vec3(0.,0.,u_p0);}`,
   `float d=length(X);float w=u_p0<=1.?u_p0:1./u_p0;if(X.z<=-w*d)ok=false;else mm=X.xy/(u_p0*d+X.z);`, 1, '(1.+u_p0)', 'u_p2', 3),
 'Unified camera model (Geyer-Daniilidis / Mei & Rives 2007) in the form of Usenko et al. 2018: pi(x) = f (x, y)/(xi d + z), d = |x|; unprojection ((xi + sqrt(1 + (1 - xi^2) r^2))/(1 + r^2)) (mx, my, 1) - (0, 0, xi), valid for r^2 <= 1/(xi^2 - 1) when xi > 1 and z > -w d; focal = pinhole focal x (1 + xi) x zoom so the image centre keeps its scale; xi = 0 is the pinhole, xi = 1 the parabolic catadioptric');
f('q35_cam_ds','Double Sphere Camera Model (Usenko 2018)',[P('xi',-1,1,-.2,.01),P('alpha',0,1,.6,.01),P('Input FOV',20,170,100,1,'deg'),S('Direction',['Pinhole to double sphere','Double sphere to pinhole'])],
  Q35_CAM(`float r2=dot(mm,mm);float al=u_p1,xi=u_p0;if(al>.5&&r2>1./(2.*al-1.))ok=false;else{float mz=(1.-al*al*r2)/(al*sqrt(max(1.-(2.*al-1.)*r2,0.))+1.-al);
   float fa=(mz*xi+sqrt(max(mz*mz+(1.-xi*xi)*r2,0.)))/(mz*mz+r2);X=fa*vec3(mm,mz)-vec3(0.,0.,xi);}`,
   `float al=u_p1,xi=u_p0;float d1=length(X);float d2=length(vec3(X.xy,xi*d1+X.z));float w1=al<=.5?al/(1.-al):(1.-al)/al;float w2=(w1+xi)/sqrt(2.*w1*xi+xi*xi+1.);
   if(X.z<=-w2*d1)ok=false;else mm=X.xy/(al*d2+(1.-al)*(xi*d1+X.z));`, 2, '(1.+u_p0)', '1.', 3),
 'Double sphere model of Usenko, Demmel & Cremers 2018: d1 = |x|, d2 = |(x, y, xi d1 + z)|, pi(x) = f (x, y)/(alpha d2 + (1 - alpha)(xi d1 + z)); closed-form unprojection m_z = (1 - alpha^2 r^2)/(alpha sqrt(1 - (2 alpha - 1) r^2) + 1 - alpha), x = ((m_z xi + sqrt(m_z^2 + (1 - xi^2) r^2))/(m_z^2 + r^2)) (mx, my, m_z) - (0, 0, xi), with the paper\'s validity regions; model focal = pinhole focal x (1 + xi) so the image centre keeps its scale');
f('q35_cam_fov','Field-of-View Lens Model (Devernay-Faugeras 2001)',[P('omega',1,179,90,1,'deg'),P('Input FOV',20,170,100,1,'deg'),P('Zoom',.2,3,1,.01),S('Direction',['Pinhole to FOV lens','FOV lens to pinhole'])],
  Q35_CAM(`float w=radians(u_p0);float rd=length(mm);X=rd>1e-6?vec3(mm*sin(rd*w)/(2.*rd*tan(w*.5)),cos(rd*w)):vec3(0.,0.,1.);`,
   `float w=radians(u_p0);float ru=length(X.xy);float rd=atan(2.*ru*tan(w*.5),X.z)/w;mm=ru>1e-6?rd*X.xy/ru:vec2(0.);`, 1, '2.*tan(radians(u_p0)*.5)/radians(u_p0)', 'u_p2', 3),
 'Devernay & Faugeras 2001 FOV distortion model (as in Usenko et al. 2018): r_d = atan2(2 r_u tan(omega/2), z)/omega, unprojection (m sin(r_d omega)/(2 r_d tan(omega/2)), cos(r_d omega)); omega is the field of view of the ideal fisheye lens; focal scaled by 2 tan(omega/2)/omega x zoom so the image centre keeps its scale');
f('q35_cam_division','Division Model Lens Distortion (Fitzgibbon 2001)',[P('lambda',-1,1,-.25,.005),P('Zoom',.3,3,1,.01),S('Direction',['Undistort (remove)','Distort (apply)'])],
  `float A=asp();float nd=sqrt(A*A+1.);vec2 p=(uv-.5)*2.*vec2(A,1.)/nd/u_p1;float l=u_p0;vec2 q;float r=length(p);
  if(u_p2<.5){if(abs(l)<1e-5||r<1e-6)q=p;else{float disc=1.-4.*l*r*r;if(disc<0.)return vec4(0.,0.,0.,1.);q=p*((1.-sqrt(disc))/(2.*l*r))/r;}}
  else{float dn=1.+l*r*r;if(dn<=1e-4)return vec4(0.,0.,0.,1.);q=p/dn;}
  vec2 s2=q*nd/(2.*vec2(A,1.))+.5;if(s2.x<0.||s2.y<0.||s2.x>1.||s2.y>1.)return vec4(0.,0.,0.,1.);return T(s2);`,
 'Fitzgibbon 2001 one-parameter division model x_u = x_d/(1 + lambda r_d^2) (coordinates normalised to the half-diagonal): Undistort samples the distorted input at r_d = (1 - sqrt(1 - 4 lambda r_u^2))/(2 lambda r_u) (closed-form inverse); Distort renders x_d from the undistorted input. Negative lambda = barrel');
