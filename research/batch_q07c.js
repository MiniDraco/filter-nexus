/* ================= q07c: G'MIC community - skin mask (detect_skin), Denim Texture (samj), ABN Filigrees (Garry Osgood) ================= */
/* ABN filigree spinner chains: [radius, angle (rad), cumulative rotation rate] per wheel (G'MIC _pvt_mkspectral sums the rates and angles) */
const Q07_ABN = [
  [[.2, 0, 1], [.2, 0, 5]],
  [[.5, 0, 1], [.25, 0, -6], [.12, 0, 13]],
  [[.45, 0, 1], [.3, 0, 8], [.15, .3, -13], [.08, 0, 29]],
  [[.6, 0, 1], [.3, 0, -7]],
  [[.4, 0, 2], [.35, 0, -9], [.12, 0, 33]],
  [[.55, 0, 1], [.18, 0, 12], [.18, 0, -11]]];
const Q07_ABN_GLSL = Q07_ABN.map((ch, k) => {
  const sum = ch.reduce((a, w) => a + w[0], 0), sc = .9 / sum, ws = [0, 1, 2, 3].map(i => ch[i] || [0, 0, 0]);
  return `if(ds==${k}){${ws.map((w, i) => `rr[${i}]=${(w[0] * sc).toFixed(5)};an[${i}]=${w[1].toFixed(4)};fq[${i}]=${w[2].toFixed(1)};`).join('')}}`;
}).join('');

f = add('Sensor');
f('q07_skinmask','Skin Mask (G\'MIC Detect Skin)',[P('Tolerance',0,1,.5,.01),P('Threshold (gain)',0,10,1,.05),S('Pre-normalize image',['On (gamma balance)','Off']),S('Output',['Probability map','Skin highlighted on image','Skin only'])],
 `vec3 gm=vec3(1.);if(u_p2<.5){vec3 mu=vec3(0.);for(int j=0;j<16;j++)for(int i=0;i<16;i++)mu+=clamp(O((vec2(float(i),float(j))+.5)/16.).rgb,.004,.996);mu/=256.;gm=log(vec3(128./255.))/log(mu);}
  #define Q07SK(c_,OUT) {vec3 sr_=pow(clamp(c_,0.,1.),gm);vec3 l_=mix(pow((sr_+.055)/1.055,vec3(2.4)),sr_/12.92,step(sr_,vec3(.04045)))*255.;vec2 d_=vec2((-38.*l_.r-74.*l_.g+112.*l_.b+128.)/256.+128.-120.9292108800069,(112.*l_.r-94.*l_.g-18.*l_.b+128.)/256.+128.-142.5745272918084);OUT=exp((d_.x*(.09749985486268997*d_.x+.06388871371746063*d_.y)+d_.y*(.06388871371746063*d_.x+.05250053107738495*d_.y))*(u_p0-1.));}
  float mx=1e-6;for(int j=0;j<16;j++)for(int i=0;i<16;i++){float pq;Q07SK(O((vec2(float(i),float(j))+.5)/16.).rgb,pq)mx=max(mx,pq);}
  vec3 sr=clamp(O(uv).rgb,0.,1.);float pm;Q07SK(sr,pm)pm=clamp(pm/mx*u_p1,0.,1.);int m=int(u_p3+.5);
  if(m==0)return vec4(vec3(pm),1.);if(m==1)return vec4(mix(sr*.3,sr,pm),1.);return vec4(sr*pm,1.);`,
 'G\'MIC fx_detect_skin / detect_skin (automatic mode): optional balance_gamma pre-normalisation (per-channel gamma to mean 128), sRGB -> linear -> YCbCr, Gaussian CbCr skin model (mean 120.93 / 142.57, inverse covariance A B C), probability exp((tolerance-1) * Mahalanobis), normalised by the image maximum (16x16 sample grid) x threshold gain; the 0.5% mask blur is omitted');

f = add('Materials');
f('q07_denim','Denim Texture (G\'MIC samj)',[P('Pattern size',2,30,5,1,'px'),P('Pattern dilation',0,5,2,1,'px'),P('Deformation',0,200,40,1),P('Denim noise',0,100,25,1)],
 `vec2 p=PX(uv);vec2 wq=p/max(6.,u_p0*2.);float e=.05;
  vec2 gr=vec2(fbm(wq+vec2(e,0.))-fbm(wq-vec2(e,0.)),fbm(wq+vec2(0.,e))-fbm(wq-vec2(0.,e)))/(2.*e);vec2 pw=p+gr*u_p2*.06;
  float D=u_p0;float dd=abs(mod(pw.x+pw.y,D)-D*.5);dd=(D*.5-dd)/1.41421356;float hw=(1.+u_p1)*.5/1.41421356;float ln=1.-smoothstep(hw-.5,hw+.5,dd);
  vec2 ip=floor(pw);float gn=(hash(ip)+hash(ip+31.7)+hash(ip+67.3)-1.5)*.2*(u_p3/25.)*.4;
  vec3 base=vec3(43.,108.,126.)/255.;base=clamp(base+gn*vec3(1.,1.,1.),0.,1.);
  vec3 o=mix(base,vec3(0.),ln*.85);float wn=(hash(floor(p)+5.1)+hash(floor(p)+9.3)-1.)*.18;o=clamp(o*(1.+wn),0.,1.);return vec4(o,1.);`,
 'samj Denim_samj (G\'MIC community): denim-blue layer with YCbCr luminance noise, anti-diagonal 1-px line tile of the pattern size, circular dilation, alpha-blended black, water deformation (smoothed-noise gradient warp), intensity "wear" noise; replaces the image like the original - approx. noise statistics', true);

f = add('Render');
f('q07_filigree','ABN Filigrees (G\'MIC Garry Osgood)',[S('Design',['Red rose (CLI example)','Three-wheel rosette','Banknote guilloche (4 wheels)','Star (hypotrochoid)','Lace (twice-traced)','Spiro bloom']),P('Relative width',1,100,6,.5),P('Shape (flat to full)',0,100,40,1),P('Tilt',0,90,0,1,'°')],
 `vec3 im=O(uv).rgb;float S_=min(u_res.x,u_res.y)*.5;vec2 pp=(uv*u_res-u_res*.5)/S_;int ds=int(u_p0+.5);
  float rr[4],an[4],fq[4];for(int i=0;i<4;i++){rr[i]=0.;an[i]=0.;fq[i]=0.;}
  ${Q07_ABN_GLSL}
  if(length(pp)>.95)return vec4(im,1.);
  float hw=max(u_p1*min(u_res.x,u_res.y)/1000.,.6)/S_;float hb=max(hw*u_p2/100.,.6/S_);float ph=radians(u_p3+90.);vec2 e1=vec2(cos(ph),sin(ph)),e2=vec2(-e1.y,e1.x);
  vec2 q=vec2(dot(pp,e1)/hw,dot(pp,e2)/hb);float best=1e9;vec2 prv;
  const int NS=1200;
  for(int k=0;k<=NS;k++){float t=6.2831853*float(k)/float(NS);vec2 z=vec2(0.);for(int i=0;i<4;i++){float a=an[i]+fq[i]*t;z+=rr[i]*vec2(cos(a),sin(a));}
   vec2 zq=vec2(dot(z,e1)/hw,dot(z,e2)/hb);if(k>0){vec2 ab=zq-prv;float h=clamp(dot(q-prv,ab)/max(dot(ab,ab),1e-12),0.,1.);best=min(best,length(q-prv-ab*h));}prv=zq;}
  float aa=.8/(hb*S_);float cov=1.-smoothstep(1.-aa,1.+aa,best);return vec4(mix(im,vec3(1.),cov),1.);`,
 'gtutor_abn (G\'MIC community, Garry R. Osgood, American Bank Note filigree machine): chained spinners summed as a Fourier series z(t) = sum r e^(i(theta + f t)) (cumulative rates and angles, as _pvt_mkspectral), traced with an elliptical calligraphic pen (relative width, flat-full shape, tilt) in white over the image; 6 preset chains, plot centred instead of top-left');
