/* ================= retroshaders (round 10) part 3: libplacebo HDR tone / gamut mapping, codec film-grain synthesis ================= */
const RTS3_PQ = `
 #define PQE(nits) pow((.8359375+18.8515625*pow(max((nits)/10000.,0.),.1593017578125))/(1.+18.6875*pow(max((nits)/10000.,0.),.1593017578125)),78.84375)
 #define PQD(e) (10000.*pow(max(pow(max((e),0.),1./78.84375)-.8359375,0.)/(18.8515625-18.6875*pow(max((e),0.),1./78.84375)),1./.1593017578125))
 `;

f = add('Tone');
f('tonemaphdr','HDR Tone Mapping (libplacebo / ITU / SMPTE)',[S('Curve',['BT.2390 EETF (PQ hermite knee)','BT.2446 method A','Spline (libplacebo, single pivot)','ST 2094-40 Annex B (Bezier)','Mobius']),
  P('Exposure into HDR',-2,4,1,.1,'EV'),P('Source peak (nits)',300,10000,1000,10),P('Contrast recovery',0,1,.3,.01)],
 [BH('R(3.5)'), BV('R(3.5)'), `${RTS3_PQ}int m=int(u_p0+.5);vec3 lin=${LIN('O(uv).rgb')};float ex=exp2(u_p1);float Ps=u_p2;float Pt=203.;
  vec3 nt=min(lin*ex*203.,vec3(Ps));float mx=max(nt.r,max(nt.g,nt.b));float smx=max(mx,1e-4);
  float pqmax=PQE(Ps),pqt=PQE(Pt);float x=mx,y=0.;
  #define SMS(e0,e1,v) clamp(((v)-(e0))/((e1)-(e0)),0.,1.)*clamp(((v)-(e0))/((e1)-(e0)),0.,1.)*(3.-2.*clamp(((v)-(e0))/((e1)-(e0)),0.,1.))
  float sav=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){vec3 q=${LIN('O((vec2(float(i),float(j))+.5)/12.).rgb')};sav+=PQE(min(luma(q)*ex*203.,Ps));}sav/=144.;
  float sk=clamp(sav,mix(0.,pqmax,.1),mix(0.,pqmax,.8));float tg=sk/pqmax;float adp=mix(0.,pqt,tg);float tun=1.-SMS(.8,.4,tg)*SMS(.1,.4,tg);float ad=mix(.4,1.,tun);ad=mix(1.,ad,SMS(0.,mix(0.,pqt,.1),sk));
  float dk=clamp(mix(sk,adp,ad),mix(0.,pqt,.1),mix(0.,pqt,.8));
  if(m==0){float e=PQE(x)/pqmax;float ml=pqt/pqmax;float ks=2.*ml-1.;if(ks<1.&&e>ks){float tb=(e-ks)/(1.-ks);float t2=tb*tb,t3=t2*tb;e=(2.*t3-3.*t2+1.)*ks+(t3-2.*t2+tb)*(1.-ks)+(-2.*t3+3.*t2)*ml;}y=PQD(e*pqmax);}
  else if(m==1){float ph=1.+32.*pow(Ps/10000.,1./2.4),ps=1.+32.*pow(Pt/10000.,1./2.4);float v=pow(x/Ps,1./2.4);v=log(1.+(ph-1.)*v)/log(ph);
   v=v<=.7399?1.077*v:v<.9909?(-1.151*v+2.7811)*v-.6302:.5*v+.5;v=(pow(ps,v)-1.)/(ps-1.);y=Pt*pow(clamp(v,0.,1.),2.4);}
  else if(m==2){float sl=dk/max(sk,1e-5);float rt=clamp(1.5*(pqmax/pqt-1.),.2,1.2);sl=pow(sl,.5*rt);float imn=-sk,imx=pqmax-sk,omn=-dk,omx=pqt-dk;
   float Pk=(sl*imn-omn)/(omn*imn),Qk=(sl*imx-omx)/(omx*imx);float v=PQE(x)-sk;v=sl*v/(1.+(v>0.?Qk:Pk)*v);y=PQD(clamp(v+dk,0.,pqt));}
  else if(m==3){float Kx=PQD(sk)/Ps,Ky=PQD(dk)/Pt;float sl=Ky/Kx*(1.-Kx)/(1.-Ky);int N=int(clamp(ceil(sl),2.,16.));float P1=min(sl/float(N),1.);if(Kx<=0.||Ky>=1.)P1=1./float(N);
   float v=x/Ps;if(v<=Kx)v*=Ky/Kx;else{float t=(v-Kx)/(1.-Kx);float bz=0.,bn=1.;for(int p=0;p<=16;p++){if(p>N)break;if(p>0)bn*=float(N-p+1)/float(p);float Pp=p==0?0.:p==1?P1:1.;bz+=bn*(p==0?1.:pow(t,float(p)))*(p==N?1.:pow(max(1.-t,0.),float(N-p)))*Pp;}v=Ky+(1.-Ky)*bz;}y=v*Pt;}
  else{float pk=Ps/Pt;float jk=.3;float a=-jk*jk*(pk-1.)/(jk*jk-2.*jk+pk),b=(jk*jk-2.*jk*pk+pk)/max(1e-6,pk-1.);float sc=(b*b+2.*b*jk+jk*jk)/(b-a);float v=x/Pt;v=v<=jk?v:sc*(v+a)/(v+b);y=v*Pt;}
  float ylo=min(luma(${LIN('T(uv).rgb')})*ex*203.,Ps);float hf=PQE(min(luma(nt),Ps))-PQE(ylo);float yt=PQD(clamp(PQE(y)+u_p3*hf*(PQE(y)/max(PQE(x),1e-4)),0.,pqt));
  vec3 o=nt*(yt/smx)/Pt;o=clamp(o,0.,1.);return vec4(${SRGB('o')},1.);`],
 'the SDR image is lifted into HDR (linear × 2^EV, 1.0 = 203 nit) and mapped back to a 203-nit SDR target on max(RGB) (hue-preserving): libplacebo bt2390 (knee offset 1), bt2446a, spline (st2094 knee pick from the scene-average PQ of a 12×12 sample, slope tuning 1.5 / offset .2 / contrast .5), st2094-40 (no dynamic metadata: knee-derived Bezier anchors), mobius (knee .3); contrast recovery re-adds the PQ high-frequency band lost by the curve (approx.)');

f = add('Color');
f('gamutmap','Gamut Mapping (libplacebo perceptual / highlight)',[S('Mapping',['Perceptual (libplacebo)','Clip (colorimetric)','Desaturate (IPT chroma)','Highlight out-of-gamut']),S('Source gamut (input interpreted as)',['Display P3','BT.2020','Adobe RGB (1998)']),P('Perceptual strength',0,1,.8,.01),P('Saturation boost',0,1,0,.01)],
 `${RTS3_PQ}int m=int(u_p0+.5),gi=int(u_p1+.5);vec3 rs=${LIN('c.rgb')};vec3 gm=vec3(luma(rs));rs=max(gm+(rs-gm)*(1.+u_p3),0.);
  mat3 Ms=gi==0?transpose(mat3(.4866,.2657,.1982,.229,.6917,.0793,0.,.0451,1.0439)):gi==1?transpose(mat3(.637,.1446,.1689,.2627,.678,.0593,0.,.0281,1.061)):transpose(mat3(.5767,.1856,.1882,.2973,.6274,.0753,.027,.0707,.9911));
  mat3 Md=transpose(mat3(.4124,.3576,.1805,.2126,.7152,.0722,.0193,.1192,.9505));mat3 Mdi=inverse(Md);
  mat3 LM=transpose(mat3(.4002,.7075,-.0807,-.228,1.15,.0612,0.,0.,.9184));mat3 IP=transpose(mat3(.4,.4,.2,4.455,-4.851,.396,.8056,.3572,-1.1628));mat3 IPi=inverse(IP),LMi=inverse(LM);
  #define TOIPT(X3) (IP*vec3(PQE(max((LM*(X3)).x,0.)*203.),PQE(max((LM*(X3)).y,0.)*203.),PQE(max((LM*(X3)).z,0.)*203.)))
  #define FRIPT(I3) (LMi*vec3(PQD((IPi*(I3)).x),PQD((IPi*(I3)).y),PQD((IPi*(I3)).z))/203.)
  vec3 xyz=Ms*rs;vec3 rd=Mdi*xyz;vec3 o=rd;bool ing=all(greaterThanEqual(rd,vec3(-1e-4)))&&all(lessThanEqual(rd,vec3(1.0001)));
  if(m==1)o=clamp(rd,0.,1.);
  else if(m==3){if(!ing){vec3 ip=TOIPT(xyz);ip.x=min(ip.x+.1,1.);ip.yz=clamp(-1.2*ip.yz,-.5,.5);o=Mdi*FRIPT(ip);}o=clamp(o,0.,1.);}
  else if(m==2){if(!ing){vec3 ip=TOIPT(xyz);float lo=0.,hi=1.;for(int k=0;k<12;k++){float md=(lo+hi)*.5;vec3 tq=Mdi*FRIPT(vec3(ip.x,ip.yz*md));if(all(greaterThanEqual(tq,vec3(-1e-4)))&&all(lessThanEqual(tq,vec3(1.0001))))lo=md;else hi=md;}o=Mdi*FRIPT(vec3(ip.x,ip.yz*lo));}o=clamp(o,0.,1.);}
  else{vec3 ip=TOIPT(xyz);float C=length(ip.yz);vec3 sm=rs;float a0=min(sm.r,min(sm.g,sm.b)),a1=max(sm.r,max(sm.g,sm.b));vec3 scusp=a1>a0?(sm-a0)/(a1-a0):vec3(1.);
   float a2=min(rd.r,min(rd.g,rd.b)),a3=max(rd.r,max(rd.g,rd.b));vec3 dcusp=a3>a2?(rd-a2)/(a3-a2):vec3(1.);float sC=length(TOIPT(Ms*scusp).yz),dC=length(TOIPT(Md*dcusp).yz);float mC=max(max(sC,dC),1e-5);
   float k=smoothstep(.3,1.,C/mC)*u_p2;vec3 mp=TOIPT(Md*rs);ip=mix(ip,mp,k);vec3 r=Mdi*FRIPT(ip);vec3 spk=Mdi*(Ms*scusp);
   float mx=max(r.r,max(r.g,r.b)),mn=min(r.r,min(r.g,r.b));float sat_=1.-max(mn,0.)/max(mx,1e-6);float ext=max(max(spk.r,max(spk.g,spk.b)),mx);
   float pk=ext;float jj=.7;vec3 sc=r;if(pk>1.){float a=-jj*jj*(pk-1.)/(jj*jj-2.*jj+pk),b=(jj*jj-2.*jj*pk+pk)/max(1e-6,pk-1.);float scl=(b*b+2.*b*jj+jj*jj)/(b-a);
    for(int ch=0;ch<3;ch++){float xv=min(r[ch],pk);if(xv>jj)sc[ch]=scl*(xv+a)/(xv+b);}}
   o=clamp(mix(r,sc,sat_),0.,1.);}
  return vec4(${SRGB('o')},1.);`,
 'wide-gamut content shown on sRGB: the input values are read as P3 / BT.2020 / Adobe RGB (sRGB transfer) and converted; libplacebo perceptual = IPT(PQ) blend toward the saturation-mapped colour near the hue cusp (deadzone .3) + Mobius softclip (knee .7) of saturated channels; highlight = out-of-gamut pixels get I+0.1 and inverted P/T; IPT uses Hunt LMS + Dolby PQ-IPT matrix, cusps approximated per pixel (approx.)');

/* ---- AV1 film grain synthesis: Gaussian template (82x73), auto-regressive filter solved by Jacobi iterations, 32x32 blocks at random template offsets ---- */
const RTS3_GN = `vec3 n=vec3(0.);for(int k=0;k<3;k++){float u1=max(hash(w+vec2(.17+float(k)*7.3,.31)),1e-6),u2=hash(w+vec2(3.7+float(k)*7.3,9.1));n[k]=sqrt(-2.*log(u1))*cos(6.2831853*u2);}`;
const RTS3_AR = `vec2 w=floor(uv*u_res);if(w.x>=82.||w.y>=73.)return vec4(.5,.5,.5,1.);int m=int(u_p0+.5);${RTS3_GN}
  vec2 OF[12]=vec2[12](vec2(-2.,-2.),vec2(-1.,-2.),vec2(0.,-2.),vec2(1.,-2.),vec2(2.,-2.),vec2(-2.,-1.),vec2(-1.,-1.),vec2(0.,-1.),vec2(1.,-1.),vec2(2.,-1.),vec2(-2.,0.),vec2(-1.,0.));
  float CF[60]=float[60](0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,
   0.,0.,0.,0.,0.,0.,.05,.2,.05,0.,0.,.2,
   0.,.02,.04,.02,0.,.02,.08,.24,.08,.02,.04,.24,
   0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,.15,.6,
   0.,0.,.15,0.,0.,0.,0.,.6,0.,0.,0.,0.);
  vec3 g=n;if(m>0){for(int k=0;k<12;k++){float a=CF[m*12+k];if(a==0.)continue;vec2 q=w+OF[k];if(q.x<0.||q.y<0.||q.x>=82.)continue;g+=a*(T((q+.5)/u_res).rgb-.5)*16.;}}
  return vec4(.5+g/16.,1.);`;
f = add('Film');
f('av1grain','AV1 Film Grain Synthesis',[S('AR grain model',['White (lag 0)','Fine film (lag 1)','Coarse film (lag 2)','Horizontal streaks','Vertical streaks'],2),P('Strength',0,1,.5,.01),P('Grain size',1,4,1,.1,'px'),P('Chroma grain',0,1,.3,.01)],
 [`vec2 w=floor(uv*u_res);if(w.x>=82.||w.y>=73.)return vec4(.5,.5,.5,1.);${RTS3_GN}return vec4(.5+n/16.,1.);`, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR, RTS3_AR,
  `vec3 org=O(uv).rgb;float cell=max(R(u_p2),1.);vec2 gp=uv*u_res/cell;vec2 bi=floor(gp/32.);vec2 lc=gp-bi*32.;float rv=floor(hash(bi+vec2(.5,71.3))*256.);vec2 of=vec2(floor(rv/16.),mod(rv,16.))*2.;
  vec2 tc=vec2(9.)+of+lc;vec3 g=(T(tc/u_res).rgb-.5)*16.;float s1=0.,s2=0.;for(int j=0;j<12;j++)for(int i=0;i<12;i++){float v=(T((vec2(9.,9.)+vec2(float(i),float(j))*5.+.5)/u_res).r-.5)*16.;s1+=v;s2+=v*v;}
  float sd=sqrt(max(s2/144.-(s1/144.)*(s1/144.),1e-4));g/=sd;
  float Y=dot(org,vec3(.2126,.7152,.0722));float Cb=(org.b-Y)/1.8556,Cr=(org.r-Y)/1.5748;float y8=Y*255.;
  float sc=y8<64.?mix(40.,80.,y8/64.):y8<128.?mix(80.,90.,(y8-64.)/64.):y8<192.?mix(90.,70.,(y8-128.)/64.):mix(70.,40.,(y8-192.)/63.);sc/=255.;
  Y+=u_p1*sc*g.r*.12;Cb+=u_p3*sc*g.g*.05;Cr+=u_p3*sc*g.b*.05;vec3 o=vec3(Y+1.5748*Cr,Y-.1873*Cb-.4681*Cr,Y+1.8556*Cb);return vec4(clamp(o,0.,1.),1.);`],
 'AV1 spec film grain model: Gaussian 82×73 grain templates (Y, Cb, Cr), lag-2 auto-regressive shaping (12 causal coefficients, solved by 10 Jacobi iterations instead of the sequential raster scan), 32×32 blocks read at random 2-px-aligned template offsets, piecewise-linear luma scaling function; no block-overlap blending (approx.)', 1);

const RTS3_HV = `int m=int(u_p0+.5);float hh=m==0?12.:m==1?6.:m==2?0.:m==3?1.:10.,vv=m==0?12.:m==1?6.:m==2?0.:m==3?10.:1.;int fh=int((hh+3.)*4.-1.),fv=int((vv+3.)*4.-1.);`;
f('h274grain','H.274 Film Grain (frequency-filtering model)',[S('Pattern cutoffs',['Fine (h=v=12)','Medium (h=v=6)','Coarse (h=v=0)','Horizontal smear (h=1 v=10)','Vertical smear (h=10 v=1)'],1),P('Strength',0,1,.5,.01),P('Grain size',1,4,1,.1,'px'),P('Midtone weighting',0,1,.6,.01)],
 [`vec2 w=floor(uv*u_res);if(w.x>=64.||w.y>=64.)return vec4(.5,.5,.5,1.);${RTS3_HV}float l=w.y;if(l>float(fv))return vec4(.5,.5,.5,1.);float t=0.;
   for(int p=0;p<64;p++){if(p>fh)break;if(p==0&&l<.5)continue;float n=(hash(vec2(float(p)+.5,l+.5+float(m)*64.))-.5)*3.4641;t+=n*cos(3.14159265*(2.*w.x+1.)*float(p)/128.);}return vec4(.5+t/64.,.5,.5,1.);`,
  `vec2 w=floor(uv*u_res);if(w.x>=64.||w.y>=64.)return vec4(.5,.5,.5,1.);${RTS3_HV}float o=0.;for(int l=0;l<64;l++){if(l>fv)break;o+=(T((vec2(w.x,float(l))+.5)/u_res).r-.5)*64.*cos(3.14159265*(2.*w.y+1.)*float(l)/128.);}
   float DBF[13]=float[13](64.,71.,77.,84.,90.,96.,103.,109.,116.,122.,128.,128.,128.);float yr=mod(w.y,8.);if(yr<.5||yr>6.5)o*=DBF[int(vv)]/128.;return vec4(.5+o/256.,.5,.5,1.);`,
  `vec3 org=O(uv).rgb;float cell=max(R(u_p2),1.);vec2 gp=floor(uv*u_res/cell);
   #define HG(GP,OUT) {vec2 b16_=floor((GP)/16.);vec2 l16_=(GP)-b16_*16.;vec2 of_=vec2(4.*floor(hash(b16_+vec2(1.3,7.7))*13.),8.*floor(hash(b16_+vec2(9.1,2.3))*7.));float iv_=hash(b16_+vec2(5.5,3.1))<.5?-1.:1.;OUT=iv_*(T((of_+l16_+.5)/u_res).r-.5)*256.;}
   float r0,r1,l0,l1;HG(gp,r0)float lx=mod(gp.x,8.);
   if(gp.x>.5&&lx<.5){HG(gp+vec2(1.,0.),r1)HG(gp-vec2(1.,0.),l0)HG(gp-vec2(2.,0.),l1)r0=(l0+r0*2.+r1)*.25;}
   else if(lx>6.5){float rr0,rr1;HG(gp+vec2(1.,0.),rr0)HG(gp-vec2(1.,0.),l1)r0=(rr0+r0*2.+l1)*.25;}
   float s1=0.,s2=0.;for(int j=0;j<8;j++)for(int i=0;i<8;i++){float v=(T((vec2(float(i),float(j))*8.+3.5)/u_res).r-.5)*256.;s1+=v;s2+=v*v;}float sd=sqrt(max(s2/64.-(s1/64.)*(s1/64.),1e-3));
   float Y=luma(org);float wgt=mix(1.,clamp(4.*Y*(1.-Y)*1.1,.15,1.),u_p3);vec3 o=org+u_p1*.07*(r0/sd)*wgt;return vec4(clamp(o,0.,1.),1.);`],
 'ITU-T H.274 / SEI film grain, frequency-filtering model as in FFmpeg h274.c: 64×64 grain pattern = inverse DCT of random coefficients up to freq ((cutoff+3)·4−1) in each direction (DC removed), horizontal-edge attenuation every 8 rows, 16×16 blocks read at random offsets (x multiple of 4, y multiple of 8) with random sign, vertical block-edge deblocking, intensity (midtone) weight; single intensity interval, luma only (approx.)', 1);
