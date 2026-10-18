/* ================= q31b: frei0r / MLT / FFmpeg / GStreamer ports (single-frame) + LDP / BSIF texture codes ================= */
const Q31_D90 = '7.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,9.,9.,8.,9.,9.,9.,9.,9.,8.,9.,9.,7.';
const Q31_BSIF = '.41,-.27,-.75,-.13,.68,.62,.10,-.45,-.19,.29,.26,.25,.01,-.23,-.31,-.58,.04,.48,.09,-.41,-1.,-.03,.78,.48,-.13,.63,-.63,-.43,.43,-.08,.81,-.84,-.49,.60,-.08,1.,-.85,-.51,.66,-.07,.83,-.90,-.43,.66,-.11,.50,-.68,-.23,.44,-.22,.15,-.11,-.54,-.51,-.19,.81,.97,.90,1.,.91,-.09,-.07,.01,.14,.14,-.91,-.97,-.92,-.97,-.84,.19,.56,.52,.05,-.23,-.01,.42,-.45,-.85,.74,-.06,.63,-.48,-.98,.94,-.24,.71,-.35,-.96,.98,-.17,.73,-.39,-1.,.87,-.02,.45,-.52,-.78,.78,.72,.84,.98,1.,.90,-.36,-.65,-.78,-.74,-.44,-.33,-.45,-.53,-.60,-.46,.20,.45,.52,.31,.06,-.19,-.13,-.05,-.09,-.21,.81,.83,.25,-.64,-1.,.17,.15,-.03,-.26,-.29,-.54,-.47,-.06,.36,.49,-.45,-.30,.03,.38,.52,.05,-.02,-.11,-.02,.15,-.54,-.23,.30,.35,-.05,.10,.36,.47,.00,-.49,.55,.39,-.09,-.52,-.57,.19,-.31,-.54,-.20,.22,-.30,-.52,-.17,.60,1.,-.10,-.05,-.09,-.13,-.14,.06,.23,.34,.38,.27,-.45,-.56,-.48,-.31,-.20,-.47,-.61,-.60,-.55,-.38,.79,1.,.94,.66,.44';
/* uv of working pixel (X, Yd) with Yd counted from the top */
const Q31_PXUV = `
#define Q31UV(p) vec2(((p).x+.5)/u_res.x,1.-((p).y+.5)/u_res.y)
`;
f = add('Repair');
f('q31_f0r_d90','D90 Stair-Stepping Fix (frei0r)',[],
`const float SL[82]=float[82](${Q31_D90});float i=(1.-uv.y)*720.-.5;float q=((2.*i+1.)*(801./720.)-1.)*.5;float k0=floor(q),fr=q-k0;
float v0=719.,v1=719.,pos=0.,row=0.;bool d0=false,d1=false;
for(int j=0;j<82;j++){float sz=SL[j];if(!d0&&k0<pos+sz){v0=row+k0-pos;d0=true;}if(!d1&&k0+1.<pos+sz){v1=row+k0+1.-pos;d1=true;}pos+=sz;row+=sz;
 if(j<81){if(!d0&&k0<pos+1.){v0=row-.5;d0=true;}if(!d1&&k0+1.<pos+1.){v1=row-.5;d1=true;}pos+=1.;}}
float p=clamp(mix(v0,v1,fr),0.,719.);return O(vec2(uv.x,1.-(p+.5)/720.));`,
'frei0r d90stairsteppingfix (Simon A. Eugster): the 82 row slices of Nikon D90 720p video get a virtual half-row inserted between them (801 rows), which are linearly resampled back to 720 rows; applied to any image in normalised height (the original only acts on 720-line frames)');
f = add('Distort');
f('q31_f0r_elastic','Elastic Scale (frei0r)',[P('Center',0,1,.5,.01),P('Linear width',0,1,0,.01),P('Linear scale factor',0,1,.7,.01),P('Non-linear scale factor',0,1,.7125,.0125)],
`float cc=u_p0,a=u_p1,k=u_p2,n=u_p3*.4-.2;float Ls=clamp(cc-a*.5,0.,1.),Rs=clamp(cc+a*.5,0.,1.),Ld=clamp(cc-a*k*.5,0.,1.),Rd=clamp(cc+a*k*.5,0.,1.);float x=uv.x,s;
if(x<=Ld){float r=x/max(Ld,1e-4);s=max(sin(PI*r-PI)*n+r,0.)*Ls;}
else if(x<=Rd){float r=(x-Ld)/max(Rd-Ld,1e-4);s=Ls+r*(Rs-Ls);}
else{float r=(x-Rd)/max(1.-Rd,1e-4);s=Rs+max(sin(PI*r)*n+r,0.)*(1.-Rs);}
return O(vec2(s,uv.y));`,
'frei0r elastic_scale (Matthias Schnoell): nonlinear widescreen stretch; a linear centre band (Linear width, scaled by Linear scale factor) and sine-warped sides t = r + n sin(pi r) with n = 0.4 p - 0.2; exact source mapping in normalised x');
f = add('Analysis');
f('q31_f0r_colordist','Color Distance (frei0r)',[P('Red',0,1,.5,.01),P('Green',0,1,.5,.01),P('Blue',0,1,.5,.01)],
`return vec4(vec3(clamp(length(c.rgb-vec3(u_p0,u_p1,u_p2))*.705724361914764,0.,1.)),1.);`,
'frei0r colordistance (Brendan Hack): grey = Euclidean RGB distance to the chosen colour times 0.7057 (the constant used in the source; distances above ~0.82 saturate to white)');
f('q31_f0r_select0r','Select0r (frei0r colour-range selection)',[P('Key hue',0,360,30,1,'deg'),P('Delta',.02,1,.3,.01),S('Subspace and shape',['RGB box','RGB ellipsoid','RGB octahedron','ABI box','ABI ellipsoid','ABI octahedron','HCI box','HCI ellipsoid','HCI octahedron']),S('Edge',['Hard','Fat','Normal','Skinny'])],
`
#define Q31ABI(v) vec3((v).r-.5*(v).g-.5*(v).b,.8660254*((v).g-(v).b),((v).r+(v).g+(v).b)*.3333)
vec3 kc=hsv2rgb(vec3(u_p0/360.,1.,.8));vec3 pc=floor(c.rgb*255.)/256.;kc=floor(kc*255.)/256.;int sh=int(u_p2+.5);int sp=sh/3;int fm=sh-sp*3;
vec3 a1=pc,a2=kc;if(sp>0){a1=Q31ABI(pc);a2=Q31ABI(kc);if(sp==2){a1=vec3(atan(a1.y,a1.x)*.15915494,length(a1.xy),a1.z);a2=vec3(atan(a2.y,a2.x)*.15915494,length(a2.xy),a2.z);}}
vec3 dd=abs(a1-a2);if(sp==2)dd.x=.5-abs(dd.x-.5);dd/=u_p1;
float e=fm==0?pow(max(dd.x,max(dd.y,dd.z)),2.):fm==1?dot(dd,dd):pow(dd.x+dd.y+dd.z,2.);int ed=int(u_p3+.5);
float al=ed==0?(e<1.?1.:0.):ed==1?max(1.-e*e*e*e,0.):ed==2?max(1.-e*e,0.):max(1.-e,0.);return vec4(vec3(al),1.);`,
'frei0r select0r (Marko Cebokli): alpha from the distance to a key colour in RGB, ABI (a = r - (g+b)/2, b = sqrt3/2 (g-b), i = mean) or HCI (hue wraps) space, box / ellipsoid / octahedron subspace scaled by Delta on all three axes, hard / fat (1-d^4) / normal (1-d^2) / skinny (1-d) edge; key = hue at S 1, V 0.8 (hue 120 = the plugin default green; default here 30 so photos show a selection); shown as the mask (write-on-clear, not inverted)');
f('q31_f0r_pr0file','Pr0file (frei0r line-profile scope)',[P('Y',0,1,.5,.01),P('Tilt',-90,90,0,1,'deg'),P('Length',0,1,.7,.01),S('Channels',['R G B','R G B and Y','Y only','Y Pr Pb'])],
`vec2 Pd=vec2(uv.x*u_res.x,(1.-uv.y)*u_res.y);float w=u_res.x,h=u_res.y;float th=radians(u_p1);float Dg=length(u_res);float Lm=min(20.,Dg*.5);float Ln=Lm+u_p2*(Dg-Lm);
vec2 ctr=vec2(.5*w,u_p0*h);vec2 dr=vec2(cos(th),sin(th));vec2 nr=vec2(-dr.y,dr.x);vec2 z0=ctr-dr*Ln*.5;
vec3 col=c.rgb;vec2 rl=Pd-ctr;float al=dot(rl,dr),pe=dot(rl,nr);
if(abs(al)<=Ln*.5&&abs(abs(pe)-1.415)<.6)col=vec3(1.);if(abs(abs(al)-Ln*.5)<.6&&abs(pe)<10.)col=vec3(1.);
float vx=w*15./16.,vy=h*6./16.,x0=h/20.;float y0=u_p0*h>h*.5+20.?h/20.:h-h/20.-vy;
if(Pd.x>=x0&&Pd.x<x0+vx&&Pd.y>=y0&&Pd.y<y0+vy){col*=.4;float px0=x0+50.,py0=y0+5.,PW=vx-55.,PH=vy-40.;
 if(Pd.x>=px0&&Pd.x<=px0+PW&&Pd.y>=py0&&Pd.y<=py0+PH){vec2 g=vec2((Pd.x-px0)/PW*10.,(Pd.y-py0)/PH*4.);vec2 gd=abs(g-floor(g+.5))*vec2(PW/10.,PH/4.);if(min(gd.x,gd.y)<.5)col=vec3(.3);
  if(Pd.x<px0+.8||Pd.x>px0+PW-.8||Pd.y<py0+.8||Pd.y>py0+PH-.8)col=vec3(.5);
  int md=int(u_p3+.5);float t1=(Pd.x-px0)/PW,t0=(Pd.x-1.-px0)/PW;vec2 q1=z0+dr*Ln*t1,q0=z0+dr*Ln*max(t0,0.);
  vec3 s1=O(vec2(q1.x/w,1.-q1.y/h)).rgb,s0=O(vec2(q0.x/w,1.-q0.y/h)).rgb;float y1=luma(s1),y0_=luma(s0);
  for(int k=0;k<6;k++){float p1,p0,of=0.;vec3 kc;
   if(k<3){if(md>1)continue;p1=s1[k];p0=s0[k];kc=k==0?vec3(1.,0.,0.):k==1?vec3(0.,.7,0.):vec3(.3,.3,1.);}
   else if(k==3){if(md==0)continue;p1=y1;p0=y0_;kc=vec3(.7);}
   else{if(md<3)continue;of=.5;p1=k==4?(s1.r-y1)/1.5748:(s1.b-y1)/1.8556;p0=k==4?(s0.r-y0_)/1.5748:(s0.b-y0_)/1.8556;p1+=.5;p0+=.5;of=0.;kc=k==4?vec3(.8,0.,.8):vec3(0.,.7,.8);}
   float ya=py0+(PH-1.)*(1.-p1)+1.,yb=py0+(PH-1.)*(1.-p0)+1.;if(Pd.y>=min(ya,yb)-.7&&Pd.y<=max(ya,yb)+.7)col=kc;}}}
return vec4(col,1.);`,
'frei0r measure pr0file (Marko Cebokli): a profile line (centre x = W/2, Y, Tilt, Length) drawn as a double line with end caps, and a darkened scope window (15/16 W x 6/16 H, bottom unless the line is in the lower part) plotting the samples along the line: R red, G dark green, B light blue, Y grey, Pr / Pb magenta / cyan centred; 10 x 4 grid; the numeric readout and markers are not drawn');
f = add('Retro');
f('q31_f0r_nosync','Nosync0r (frei0r lost vertical sync)',[P('Hsync',0,1,.3,.005),P('Vsync',0,1,0,.005)],
`float yd=fract(1.-uv.y+u_p0);float x=fract(uv.x-u_p1);return O(vec2(x,1.-yd));`,
'frei0r nosync0r (Martin Bayer): cyclic roll of the rows by Hsync x height (lost vertical hold) and of the columns by Vsync x width, exact');
f = add('Color');
f('q31_f0r_3point','Three Point Balance (frei0r)',[P('Black',0,.5,.04,.01),P('Gray',.15,.85,.5,.01),P('White',.5,1,.95,.01),P('Gray warm / cool',-1,1,.25,.01)],
`vec3 b=vec3(u_p0),w=vec3(u_p2),g=clamp(vec3(u_p1)*vec3(1.+.12*u_p3,1.,1.-.12*u_p3),b+.02,w-.02);vec3 x=c.rgb;
vec3 y=.5*(x-b)*(x-w)/((g-b)*(g-w))+(x-b)*(x-g)/((w-b)*(w-g));return vec4(clamp(y,0.,1.),1.);`,
'frei0r three_point_balance (Maksim Golovkin): per channel the parabola through (black, 0), (gray, 0.5), (white, 1); black / white picked as neutral levels, the gray pick tinted warm (+) or cool (-), so a warm gray pick cools the image; split preview off');
f('q31_f0r_primaries','Primaries (frei0r)',[P('Factor',0,40,1,1)],
`float f=floor(u_p0+1.);vec3 v=floor(c.rgb*255.+.5);float f127=(f*f-3.)*127.,tot=f*f;if(f127<0.){f127=0.;tot=3.;}
float mn=f>32.?127.:floor((v.r+v.g+v.b+f127)/tot);return vec4(vec3(greaterThan(v,vec3(mn))),1.);`,
'frei0r primaries (Hedde Bosman): each channel becomes 0 or 255 by comparing it with the mean (R+G+B+(f^2-3)127)/f^2, f = Factor+1 (f = 1 plain mean; f > 32 fixed 127), exact');
f = add('Frames');
f('q31_mlt_pillarecho','Pillar Echo (MLT)',[P('Width',1,100,31.6,.1,'%'),P('Height',1,100,100,.1,'%'),P('Center X',0,100,50,.1,'%'),P('Blur',0,20,4,.1,'%')],
[`float rw=u_p0/100.,rh=u_p1/100.,rx=clamp(u_p2/100.-rw*.5,0.,1.-rw),ry=.5-rh*.5;float da=asp(),sa=rw/rh*asp();
if(sa>da){float nw=rw*da/sa;rx+=(rw-nw)*.5;rw=nw;}else{float nh=rh*sa/da;ry+=(rh-nh)*.5;rh=nh;}
return O(vec2(rx+uv.x*rw,1.-(ry+(1.-uv.y)*rh)));`,
`return box1d(u_tex,uv,vec2(1.,0.),u_p3*u_res.x/100.);`,`return box1d(u_tex,uv,vec2(0.,1.),u_p3*u_res.x/100.);`,
`float rw=u_p0/100.,rh=u_p1/100.,rx=clamp(u_p2/100.-rw*.5,0.,1.-rw),ry=.5-rh*.5;float yd=1.-uv.y;
return (uv.x>=rx&&uv.x<=rx+rw&&yd>=ry&&yd<=ry+rh)?O(uv):T(uv);`],
'MLT filter_pillar_echo: the area of interest (centred vertically) is cropped to the frame aspect, stretched to fill the frame, box-blurred by Blur % of the width, and the original area is pasted back on top (blurred pillar / letterbox fill)');
f = add('Repair');
f('q31_spp','fspp / uspp Deblock (FFmpeg, approx.)',[S('Mode',['fspp (hard threshold)','uspp (re-quantise)']),P('QP',1,30,8,1)],
[Q31_PXUV+`vec2 ip=vec2(floor(uv.x*u_res.x),floor((1.-uv.y)*u_res.y));float qs=2.*u_p1/255.;vec4 res=vec4(.5);
for(int s=0;s<4;s++){vec2 sh=vec2(s==1||s==3?4.:0.,s>=2?4.:0.);vec2 org=floor((ip-sh)/8.)*8.+sh;vec2 kv=ip-org;float acc=0.;
 for(int j=0;j<8;j++){float wy=(kv.y<.5?.35355339:.5)*cos((2.*float(j)+1.)*kv.y*PI/16.);for(int i=0;i<8;i++){
  acc+=luma(O(Q31UV(org+vec2(float(i),float(j)))).rgb)*wy*(kv.x<.5?.35355339:.5)*cos((2.*float(i)+1.)*kv.x*PI/16.);}}
 if(kv.x+kv.y>.5){if(u_p0<.5)acc=abs(acc)<qs?0.:acc;else acc=floor(acc/qs+.5)*qs;}
 float v=.5+acc/16.;if(s==0)res.r=v;else if(s==1)res.g=v;else if(s==2)res.b=v;else res.a=v;}
return res;`,
Q31_PXUV+`vec2 ip=vec2(floor(uv.x*u_res.x),floor((1.-uv.y)*u_res.y));float yn=0.;
for(int s=0;s<4;s++){vec2 sh=vec2(s==1||s==3?4.:0.,s>=2?4.:0.);vec2 org=floor((ip-sh)/8.)*8.+sh;vec2 kv=ip-org;float acc=0.;
 for(int j=0;j<8;j++){float wy=(j==0?.35355339:.5)*cos((2.*kv.y+1.)*float(j)*PI/16.);for(int i=0;i<8;i++){
  vec4 cf=T(Q31UV(org+vec2(float(i),float(j))));float cv=s==0?cf.r:s==1?cf.g:s==2?cf.b:cf.a;
  acc+=(cv-.5)*16.*wy*(i==0?.35355339:.5)*cos((2.*kv.x+1.)*float(i)*PI/16.);}}
 yn+=acc*.25;}
vec3 o=O(uv).rgb;return vec4(clamp(o+(yn-luma(o)),0.,1.),1.);`],
'FFmpeg fspp / uspp idea (approx.): luma 8x8 orthonormal DCT at 4 grid shifts (0/4 px in x and y), AC coefficients hard-thresholded (fspp) or re-quantised with step 2 QP / 255 (uspp stand-in for its re-encode at that QP), inverse DCT and average of the 4 shifts; chroma kept; blocks aligned to the working image top-left');
f = add('Color');
f('q31_gst_chromium','Chromium (GStreamer Gaudi effects)',[P('Edge A',0,256,200,1),P('Edge B',0,256,1,1)],
`vec3 v=floor(c.rgb*255.+.5);vec3 ix=v+floor(u_p0+.5)+floor(v*floor(u_p1+.5)/2.);vec3 o=min(abs(floor(cos(ix*3.141582/512.)*512.)),vec3(255.));return vec4(o/255.,1.);`,
'GStreamer gaudieffects chromium (after Pete Warden FreeFrame Chromium): per channel |cos table[(c + edgeA + c edgeB / 2) & 1023]| with the 512-scaled 1024-entry cosine table, clamped to 255; exact');
/* ---- q31: texture codes from the literature ---- */
f = add('Analysis');
f('q31_ldp','Local Derivative Pattern (Zhang 2010)',[S('Direction',['0 deg','45 deg','90 deg','135 deg','All four (transition density)']),P('Distance',1,3,1,1,'px')],
`
#define Q31I(q) luma(O(uv+(q)*st).rgb)
int m=int(u_p0+.5);vec2 st=u_px*R(u_p1);
vec2 nb[8]=vec2[8](vec2(-1.,1.),vec2(0.,1.),vec2(1.,1.),vec2(1.,0.),vec2(1.,-1.),vec2(0.,-1.),vec2(-1.,-1.),vec2(-1.,0.));
vec2 dv[4]=vec2[4](vec2(1.,0.),vec2(1.,1.),vec2(0.,1.),vec2(-1.,1.));float ov=0.;
for(int a=0;a<4;a++){if(m<4&&a!=m)continue;vec2 d=dv[a];float d0=Q31I(vec2(0.))-Q31I(d);float code=0.,cnt=0.;
 for(int i=0;i<8;i++){float di=Q31I(nb[i])-Q31I(nb[i]+d);float bt=d0*di<=0.?1.:0.;code+=bt*exp2(float(7-i));cnt+=bt;}
 ov+=m<4?code/255.:cnt/32.;}
return vec4(vec3(ov),1.);`,
'Zhang, Gao, Zhao & Liu 2010 (IEEE TIP) second-order Local Derivative Pattern: first-order derivatives I(Z) - I(Z + d) along 0/45/90/135 deg; bit i = 1 when the derivative at the centre and at neighbour Z_i (clockwise from top-left, MSB first) do not share sign (product <= 0); code / 255, or the fraction of sign transitions over all four directions');
f('q31_bsif','BSIF Binarized Statistical Image Features',[P('Bits (filters)',1,8,8,1),P('Scale',1,3,1,.5,'px'),S('Display',['Code (grey)','Code (viridis)'])],
`const float W[200]=float[200](${Q31_BSIF});vec2 st=u_px*R(u_p1);float v[25];
for(int j=0;j<5;j++)for(int i=0;i<5;i++)v[j*5+i]=luma(O(uv+vec2(float(i)-2.,2.-float(j))*st).rgb);
int nb=int(u_p0+.5);float code=0.;for(int k=0;k<8;k++){if(k>=nb)break;float s=0.;for(int t=0;t<25;t++)s+=W[k*25+t]*v[t];code+=(s>0.?1.:0.)*exp2(float(k));}
float tt=code/(exp2(float(nb))-1.);return vec4(u_p2>.5?ramp(2,tt):vec3(tt),1.);`,
'Kannala & Rahtu 2012 (ICPR) BSIF: the 5x5 patch is projected onto n ICA filters and each response binarised at 0 into an n-bit code; the 8 filters here were learned with the paper recipe (50k mean-removed natural-image patches, PCA whitening to 8 dims dropping DC, symmetric FastICA tanh) on the scikit-image sample photos, not the authors .mat set');
