/* ================= q09: VSCO preset collections (round 13) + image-quality maps (MSCN / S3 / JNB) ================= */
/* VSCO look model = the looks2 model (16 numbers, see LOOKS2_SHADER) plus 5 more:
   16 infrared amount (foliage -> bright / tinted, blue sky -> dark, rest -> monochrome IR luminance)
   17 duotone amount (luma -> black..colour..light)   18-20 colour used by IR foliage tint and duotone */
const Q09_ROW = v => v.map(n => (Number.isInteger(n) ? n + '.' : String(n))).join(',');
const Q09_SHADER = rows => `const float LT[${rows.length * 21}]=float[](${rows.map(r => Q09_ROW(r[1])).join(',\n ')});
 int k=int(u_p0+.5)*21;vec3 o=c.rgb;
 vec3 l=${LIN('o')};l*=exp2(LT[k]);vec3 x=${SRGB('l')};x=clamp(x,0.,1.);
 float ir=LT[k+16];vec3 tc=vec3(LT[k+18],LT[k+19],LT[k+20]);
 if(ir>0.){float fol=smoothstep(.03,.22,(o.g-.5*(o.r+o.b))/max(o.g,.04))*smoothstep(.02,.12,o.g);float sky=smoothstep(.02,.15,o.b-max(o.r,o.g));
  float yi=clamp(luma(x)+.75*fol*(1.-luma(x))+.15*fol,0.,1.);yi*=1.-.55*sky;
  vec3 iv=mix(vec3(yi),clamp(tc*(.35+.75*yi),0.,1.),fol);x=mix(x,iv,ir);}
 x*=vec3(1.+.12*LT[k+5],1.-.07*LT[k+6],1.-.12*LT[k+5]);x.rb*=1.+.035*LT[k+6];x=clamp(x,0.,1.);
 x=pow(x,vec3(exp(-LT[k+14])));
 float ct=LT[k+1];vec3 sc=x*x*(3.-2.*x);x=ct>=0.?mix(x,sc,ct):mix(x,vec3(.5)+(x-.5)*.6,-ct);
 float y=luma(x);float red=clamp((o.r-max(o.g,o.b))*3.,0.,1.);float sa=mix(LT[k+2],max(LT[k+2],1.),red*LT[k+15]);x=y+(x-y)*sa;
 float du=LT[k+17];if(du>0.){float yd=clamp(luma(x),0.,1.);vec3 dv=yd<.6?tc*smoothstep(.08,.6,yd)*smoothstep(.08,.6,yd):mix(tc,mix(tc,vec3(1.),.5),(yd-.6)/.4);x=mix(x,dv,du);}
 y=clamp(luma(x),0.,1.);x+=vec3(LT[k+7],LT[k+8],LT[k+9])*(1.-y)*(1.-y)*2.+vec3(LT[k+10],LT[k+11],LT[k+12])*y*y*2.;
 x=clamp(x,0.,1.);x=LT[k+3]+x*(1.-LT[k+3]-LT[k+4]);
 vec2 q=(uv-.5)*vec2(asp(),1.)/sqrt(asp()*asp()+1.)*2.;x*=1.-LT[k+13]*u_p2*smoothstep(.35,1.05,length(q));
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`;
const Q09_NOTE = 'look approximation (unofficial description) from the most consistent public descriptions of each collection (one representative preset per collection); data-driven look model: exposure in linear light, temperature/tint gains, midtone gamma, S-curve contrast, saturation with red protect, quadratic shadow/highlight toning, fade / white cap, vignette, plus infrared foliage remap and duotone';
const Q09_P = rows => [S('Look', rows.map(r => r[0])), P('Strength', 0, 1, 1, .01), P('Vignette', 0, 2, 1, .05)];
/*                                exp  con   sat  fade cap  temp tint  shR  shG  shB  hiR  hiG  hiB  vig  gam  red   ir  duo  cR   cG   cB */
const Q09_SERIES = [
 ['01 (Legacy)',               [.05,-.1,  .85, .06, .02, .15,  0,  .02, .01,  0,  .02, .01,-.01,  0, .05,  0,   0,  0,   0,  0,   0]],
 ['A1 (Analog Archetype)',     [ .1,-.05, .9,  .05, .02, .12, .05, .02, .01,  0,  .03, .01,  0,   0, .05, .2,   0,  0,   0,  0,   0]],
 ['A4 (Analog Aesthetic)',     [.05,-.15, .8,  .08, .03,-.05,-.05,  0,  .02, .02, .02, .01,  0,   0, .05,  0,   0,  0,   0,  0,   0]],
 ['C4 (Chromatic)',            [ .1, .25,1.25, .02,  0,  .1,   0,   0,  .01, .02, .03, .01,-.01, .05,  0,  0,   0,  0,   0,  0,   0]],
 ['D1 (Distortia)',            [-.05,.3,  .75, .03,  0,  .05,-.15,  0,  .02, .03, .03, .03,-.03, .15,-.05, 0,   0,  0,   0,  0,   0]],
 ['E1 (Essence)',              [.15,-.05, .95, .04, .02, .1,  .03, .01, .01,  0,  .02, .01,  0,   0, .1,   0,   0,  0,   0,  0,   0]],
 ['G4 (Portrait)',             [.15,-.1,  .9,  .03, .01, .08, .08, .01,  0,   0,  .02, .01, .01,  0, .1,  .3,   0,  0,   0,  0,   0]],
 ['H1 (Polychrome)',           [.05,-.1,  .8,  .07, .02,-.15,  0,   0,  .01, .03, .01, .01, .02,  0, .05,  0,   0,  0,   0,  0,   0]],
 ['K1 (Analog Classic)',       [  0, .15, 1.1, .04,  0,  .2, -.05,  0,  .02,  0,  .03, .02,-.02, .05,  0, .3,   0,  0,   0,  0,   0]],
 ['L1 (Landscape)',            [  0, .25, 1.2,  0,   0, -.05,-.05,  0,   0,  .02, .01, .01,  0,  .1,  0,  0,   0,  0,   0,  0,   0]],
 ['M1 (Mood Underexposed)',    [-.35,-.05,.75, .06, .02, .05,  0,  .02, .02, .02, .02, .01,  0,  .1, -.1,  0,   0,  0,   0,  0,   0]],
 ['N1 (New Modern)',           [.05, .1,  .85, .02,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0, .05,  0,   0,  0,   0,  0,   0]],
 ['P1 (Instant Warm)',         [ .1,-.15, .85, .08, .05, .3,  .05, .03, .02,  0,  .04, .03,-.03, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['P4 (Instant Cool)',         [.05,-.15, .8,  .08, .05,-.3, -.05,  0,  .02, .04,  0,  .02, .03, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['P7 (Instant Classic)',      [.05,-.2,  .75, .1,  .05, .1, -.15,  0,  .03, .02, .03, .03,  0,  .15,  0,  0,   0,  0,   0,  0,   0]],
 ['Q1 (Alchemy)',              [  0, .1, 1.05, .03,  0,  .35, .05, .03, .01,-.01, .05, .03,-.03, .1,   0,  0,   0,  0,   0,  0,   0]],
 ['S1 (Bright and Clean)',     [ .3,-.05, .95, .02,  0,   0,   0,   0,   0,  .01,  0,   0,   0,   0, .15,  0,   0,  0,   0,  0,   0]],
 ['S4 (Bright and Warm)',      [ .3,-.05, 1.,  .02,  0,  .2,  .03, .01,  0,   0,  .03, .02,-.01,  0, .15,  0,   0,  0,   0,  0,   0]],
 ['U1 (Urban)',                [  0, .25, .65, .02,  0, -.15,  0, -.01,  0,  .02, .01, .01, .02, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['V1 (Low-Contrast)',         [.05,-.35, .85, .1,  .06, .05,  0,  .01, .01, .01, .01, .01, .01,  0, .05,  0,   0,  0,   0,  0,   0]]];
const Q09_SPECIAL = [
 ['IR1 (Infrared Landscape)',  [  0, .2,  .9,  .02,  0,   0,   0,   0,   0,   0,   0,   0,   0,  .1,   0,  0, .85,  0,   1, .8,  .87]],
 ['IR3 (Infrared B and W)',    [  0, .25,  0,  .02,  0,   0,   0,   0,   0,   0,   0,   0,   0,  .1,   0,  0,   1,  0,   1,  1,   1]],
 ['IR6 (Infrared cool foliage)',[ 0, .15, .9,  .03,  0, -.1,   0,   0,   0,   0,   0,   0,   0,  .1,   0,  0, .85,  0,  .62, .88,  1]],
 ['X1 (B and W Fade)',         [  0,-.1,   0,  .12, .05,  0,   0,   0,   0,   0,   0,   0,   0,   0, .05,  0,   0,  0,   0,  0,   0]],
 ['TECH (black-red duotone)',  [  0, .3,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  .1,   0,  0,   0,  1, .8,  .04, .08]],
 ['IND1 (Indigo)',             [  0, .05, .8,  .05, .02,-.5,  .25,  0,   0,  .06, .02,  0,  .05, .1,   0,  0,   0,  0,   0,  0,   0]],
 ['INF (Infatuation)',         [ .1,-.1,  .9,  .05, .02, .05, .25, .03,  0,  .02, .04, .01, .02,  0, .05, .3,   0,  0,   0,  0,   0]],
 ['AGA1 (Agave)',              [  0, .05, .9,  .04,  0,  .2, -.15, .02, .02,  0,  .03, .03,-.02, .1,   0,  0,   0,  0,   0,  0,   0]],
 ['SUM1 (Sumac)',              [  0, .15,1.05, .03,  0,  .25, .1,  .04,  0,   0,  .04, .01,-.01, .15,  0, .6,   0,  0,   0,  0,   0]]];
const Q09_COLLABS = [
 ['DOG1 (Isle of Dogs)',       [  0,   0, .7,  .06, .03, .2, -.05,-.01,  0,  .02, .04, .03,-.02, .1,   0,  0,   0,  0,   0,  0,   0]],
 ['JM1 (Jimmy Marble)',        [ .2,-.15,1.15, .06, .02, .05, .15, .02,  0,  .03, .03, .01, .02,  0, .1,   0,   0,  0,   0,  0,   0]],
 ['LV2 (Levis B and W)',       [  0, .35,  0,  .03,  0,   0,   0,   0,   0,   0,  .02, .01,-.01, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['NC (Neocha)',               [  0, .15, .8,  .04,  0, -.35,-.15,-.03, .03, .06, .02, .01,  0,  .1,   0,  0,   0,  0,   0,  0,   0]],
 ['OAK1 (Oakley PRIZM)',       [.05, .3,  1.3,  0,   0,  .05,  0,   0,   0,  .01, .01, .01,  0,  .1,   0,  0,   0,  0,   0,  0,   0]],
 ['OC (Opening Ceremony)',     [.05, .25,1.25, .02,  0,  .15, .1,  .02,  0,  .01, .02, .01,  0,  .1,   0,  0,   0,  0,   0,  0,   0]],
 ['SE1 (Street Etiquette)',    [-.1, .2,  .9,  .03,  0,  .15,  0,  .01,  0,   0,  .03, .02,-.01, .2,  -.1, .3,   0,  0,   0,  0,   0]],
 ['SS1 (Street Style)',        [  0, .3,  .8,  .02,  0, -.1,   0, -.01,  0,  .02,  0,   0,  .01, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['TK (Ta-Ku)',                [-.05,.05, .75, .07, .03, .05,  0, -.02, .02, .04, .04, .02,-.02, .15,  0,  0,   0,  0,   0,  0,   0]],
 ['WE1 (We The Creators)',     [.15, .15,1.15, .02,  0,  .05,  0,   0,   0,  .01, .01, .01,  0,   0, .05,  0,   0,  0,   0,  0,   0]],
 ['MTV',                       [.05, .25, 1.3,  0,   0,   0,  .2,  .02,-.01, .03, .03,  0,  .02, .1,   0,  0,   0,  0,   0,  0,   0]],
 ['ACG (NikeLab)',             [  0, .25, .7,  .03,  0,  .05,-.1,   0,  .01,  0,  .02, .02,  0,  .2, -.05,  0,   0,  0,   0,  0,   0]],
 ['BBMA',                      [  0, .3,  1.15, .02,  0, -.1,  .25, .03,-.01, .05, .03,  0,  .03, .15,  0,  0,   0,  0,   0,  0,   0]]];

f = add('Insta');
f('q09_vsco_series','VSCO Collections (01 A1 A4 C4 D1 E1 G4 H1 K1 L1 M1 N1 P1 P4 P7 Q1 S1 S4 U1 V1)',Q09_P(Q09_SERIES),Q09_SHADER(Q09_SERIES),
  'VSCO numbered collections: Legacy 01 warm muted fade, Analog Archetype/Aesthetic, Chromatic C4 vivid, Distortia D1 moody cross-tone, Essence, Portrait G4 soft skin, Polychrome H1 faded cool, Analog Classic K1 Kodak-warm, Landscape L1, Mood M1 underexposed, New Modern N1 neutral, Instant P1 warm / P4 cool / P7 classic (Polaroid-like fades), Alchemy Q1 golden, Bright S1 / S4, Urban U1, Low-Contrast V1; ' + Q09_NOTE);
f('q09_vsco_special','VSCO Collections II (IR1 IR3 IR6 X1 TECH IND1 INF AGA1 SUM1)',Q09_P(Q09_SPECIAL),Q09_SHADER(Q09_SPECIAL),
  'VSCO infrared collection (IR1 landscape: foliage white-pink and dark sky, IR3 infrared B&W, IR6 cool cyan foliage; foliage = green-dominant pixels, an RGB stand-in for real near-IR), X1 B&W fade, TECH black-red duotone, Indigo, Infatuation pink, Agave earthy warm, Sumac deep reds; ' + Q09_NOTE);
f('q09_vsco_collabs','VSCO Collaborations (DOG1 JM1 LV2 NC OAK1 OC SE1 SS1 TK WE1 MTV ACG BBMA)',Q09_P(Q09_COLLABS),Q09_SHADER(Q09_COLLABS),
  'VSCO partner collections: Isle of Dogs muted ochre, Jimmy Marble pastel pop, Levis contrasty B&W, Neocha cool teal, Oakley PRIZM vivid contrast, Opening Ceremony bold warm, Street Etiquette rich darks, Street Style cool contrast, Ta-Ku moody teal / warm, We The Creators vibrant, MTV magenta pop, NikeLab ACG rugged earthy, BBMA magenta-purple; ' + Q09_NOTE);

/* ---------- image-quality maps ---------- */
f = add('Analysis');
f('q09_mscn','MSCN Coefficients Map (BRISQUE)',[S('Map',['MSCN','Pair product H','Pair product V','Pair product D1','Pair product D2','Local mean','Local sigma']),P('Gain',.25,4,2,.05),S('Display',['Gray signed','Diverging','Magnitude'],1)],[
 `float d=max(1.,u_k);float s=0.,s2=0.,w=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 e=vec2(float(i),float(j));float g=exp(-dot(e,e)/(2.*1.36111));float v=luma(O(uv+e*d*u_px).rgb);s+=g*v;s2+=g*v*v;w+=g;}s/=w;s2/=w;return vec4(s,sqrt(abs(s2-s*s)),0.,1.);`,
 `float Cc=1./255.;float d=max(1.,u_k);int m=int(u_p0+.5);
#define MS(QQ) ((luma(O(QQ).rgb)-T(QQ).r)/(T(QQ).g+Cc))
 float a=MS(uv);float v=a;
 if(m==1)v=a*MS(uv+vec2(d,0.)*u_px);else if(m==2)v=a*MS(uv+vec2(0.,d)*u_px);else if(m==3)v=a*MS(uv+vec2(d,-d)*u_px);else if(m==4)v=a*MS(uv+vec2(d,d)*u_px);
 if(m==5)return vec4(vec3(T(uv).r),1.);
 if(m==6)return vec4(ramp(1,clamp(T(uv).g*4.*u_p1,0.,1.)),1.);
 float sc=m==0?3.:2.;int dm=int(u_p2+.5);float tt=clamp(v*u_p1/sc,-1.,1.);
 if(dm==0)return vec4(vec3(.5+.5*tt),1.);
 if(dm==1)return vec4(tt<0.?mix(vec3(.97),vec3(.13,.35,.85),-tt):mix(vec3(.97),vec3(.85,.15,.12),tt),1.);
 return vec4(ramp(1,abs(tt)),1.);`],
 'BRISQUE (Mittal, Moorthy & Bovik 2012) mean-subtracted contrast-normalised coefficients: I^ = (I - mu) / (sigma + C), mu and sigma from a 7x7 Gaussian window (sigma 7/6), C = 1/255 on 0..1 luma; pairwise products with the H, V, D1, D2 neighbour (the features whose AGGD fits BRISQUE uses); also the local mean / local sigma maps. Display scales MSCN by 1/3, products by 1/2');

f('q09_s3_sharpness','S3 Local Sharpness Map',[S('Map',['S3 (combined)','S1 spectral','S2 spatial (total variation)']),P('Gain',.25,4,1.5,.05),S('Colormap',['Gray','Inferno','Viridis','Thermal'],1)],[
 `float d=max(1.,u_k);vec4 a=vec4(0.),w=vec4(0.);vec4 s2=2.*vec4(1.,4.,16.,64.);for(int i=-24;i<=24;i++){float x=float(i);vec4 g=exp(-x*x/s2);float v=luma(O(uv+vec2(x*d,0.)*u_px).rgb);a+=g*v;w+=g;}return a/w;`,
 `float d=max(1.,u_k);vec4 a=vec4(0.),w=vec4(0.);vec4 s2=2.*vec4(1.,4.,16.,64.);for(int i=-24;i<=24;i++){float x=float(i);vec4 g=exp(-x*x/s2);a+=g*T(uv+vec2(0.,x*d)*u_px);w+=g;}return a/w;`,
 `float L0=luma(O(uv).rgb);vec4 G=T(uv);return min(abs(vec4(L0-G.x,G.x-G.y,G.y-G.z,G.z-G.w))*4.,vec4(1.));`,
 BH('16.'), BV('16.'),
 `vec4 A=T(uv)*.25+1e-5;vec4 la=log2(A);float sl=dot(vec4(-1.5,-.5,.5,1.5),la)/5.;float al=1.+sl;
 float S1=1.-1./(1.+exp(-3.*(al-2.)));S1*=smoothstep(.0015,.006,A.x+A.y+A.z+A.w);
 float d=max(1.,u_k);float mv=0.;
 for(int j=0;j<7;j++)for(int i=0;i<7;i++){vec2 b=vec2(float(i)-3.5,float(j)-3.5);
  float p0=luma(O(uv+b*d*u_px).rgb),p1=luma(O(uv+(b+vec2(1.,0.))*d*u_px).rgb),p2=luma(O(uv+(b+vec2(0.,1.))*d*u_px).rgb),p3=luma(O(uv+(b+vec2(1.))*d*u_px).rgb);
  mv=max(mv,(abs(p0-p1)+abs(p0-p2)+abs(p0-p3)+abs(p1-p2)+abs(p1-p3)+abs(p2-p3))*.25);}
 float S2=mv*.25;int m=int(u_p0+.5);float v=m==1?S1:m==2?S2*4.:sqrt(S1*S2)*2.;v=clamp(v*u_p1,0.,1.);
 int cm=int(u_p2+.5);return vec4(cm==0?vec3(v):ramp(cm==1?1:cm==2?2:0,v),1.);`],
 'S3 (Vu, Phan & Chandler 2012): S2 = 1/4 of the max 2x2 total variation v = (1/4) sum |xi - xj| inside each 8x8 window (exact); S1 = 1 - 1/(1 + exp(-3 (alpha - 2))) from the amplitude-spectrum slope alpha, approx.: alpha is fitted from local amplitudes of four octave DoG bands (Gaussian sigma 1/2/4/8, averaged over a sigma-8 window) instead of a 32x32 block DFT; low-contrast areas get S1 = 0; S3 = sqrt(S1 S2). Display normalised: S2 x4, S3 x2');

f('q09_jnb','JNB Blur Metric Map',[S('Map',['Edge blur probability','Edge width','Block blur probability']),P('Edge threshold',.02,.5,.12,.01),P('Block size',16,128,64,8,'px')],[
 `float d=max(1.,u_k);
#define LU(QQ) luma(O(QQ).rgb)
#define GR(QQ) vec2(LU((QQ)+vec2(d,d)*u_px)+2.*LU((QQ)+vec2(d,0.)*u_px)+LU((QQ)+vec2(d,-d)*u_px)-LU((QQ)+vec2(-d,d)*u_px)-2.*LU((QQ)+vec2(-d,0.)*u_px)-LU((QQ)+vec2(-d,-d)*u_px),LU((QQ)+vec2(d,d)*u_px)+2.*LU((QQ)+vec2(0.,d)*u_px)+LU((QQ)+vec2(-d,d)*u_px)-LU((QQ)+vec2(d,-d)*u_px)-2.*LU((QQ)+vec2(0.,-d)*u_px)-LU((QQ)+vec2(-d,-d)*u_px))*.25
 vec2 g=GR(uv);float mg=length(g);if(mg<u_p1)return vec4(0.);
 vec2 n=g/mg;if(length(GR(uv+n*d*u_px))>mg||length(GR(uv-n*d*u_px))>=mg)return vec4(0.);
 vec2 ax=abs(g.x)>=abs(g.y)?vec2(sign(g.x),0.):vec2(0.,sign(g.y));
 float L0=LU(uv);float pv=L0;float wu=0.;for(int i=1;i<=24;i++){float v=LU(uv+ax*float(i)*d*u_px);if(v<=pv+.002)break;pv=v;wu+=1.;}
 pv=L0;float wd=0.;for(int i=1;i<=24;i++){float v=LU(uv-ax*float(i)*d*u_px);if(v>=pv-.002)break;pv=v;wd+=1.;}
 float wid=max(wu+wd,1.);
 float B=R(u_p2);vec2 p=PX(uv);vec2 b0=floor(p/B)*B;float mn=1.,mx=0.;
 for(int j=0;j<16;j++)for(int i=0;i<16;i++){vec2 qp=b0+(vec2(float(i),float(j))+.5)*B/16.;float v=LU(fromPX(min(qp,u_res-.5)));mn=min(mn,v);mx=max(mx,v);}
 float wj=(mx-mn)*255.<=50.?5.:3.;float pb=1.-exp(-pow(wid/wj,3.6));
 return vec4(1.,pb,wid/32.,pb);`,
 `float B=R(u_p2);vec2 p=PX(uv);float b0=floor(p.x/B)*B;vec2 se=vec2(0.);float nn=0.;
 for(int i=0;i<128;i++){if(float(i)>=B)break;float x=b0+float(i)+.5;if(x>u_res.x)break;vec4 v=T(fromPX(vec2(x,p.y)));se+=v.xy;nn+=1.;}
 vec4 c0=T(uv);return vec4(se/max(nn,1.),c0.b,c0.a);`,
 `float B=R(u_p2);vec2 p=PX(uv);float b0=floor(p.y/B)*B;vec2 se=vec2(0.);float nn=0.;
 for(int i=0;i<128;i++){if(float(i)>=B)break;float y=b0+float(i)+.5;if(y>u_res.y)break;vec4 v=T(fromPX(vec2(p.x,y)));se+=v.xy;nn+=1.;}
 vec4 c0=T(uv);return vec4(se/max(nn,1.),c0.b,c0.a);`,
 `vec4 t=T(uv);float g=luma(O(uv).rgb);vec3 base=vec3(g*.35);int m=int(u_p0+.5);bool ed=t.b>0.;
 if(m==0)return vec4(ed?mix(vec3(.1,.9,.2),vec3(1.,.15,.1),t.a):base,1.);
 if(m==1)return vec4(ed?ramp(1,clamp(t.b*32./12.,0.,1.)):base,1.);
 if(t.r<=.002)return vec4(base,1.);float pb=t.g/t.r;return vec4(mix(ramp(1,pb),vec3(g),.25),1.);`],
 'JNB (Ferzli & Karam 2009 just-noticeable-blur): Sobel edges (normalised magnitude > threshold, non-maximum suppressed), edge width per Marziliano = distance between the intensity extrema along the dominant gradient axis, w_JNB = 5 px if block contrast <= 50 (of 255) else 3, P(blur) = 1 - exp(-(w / w_JNB)^3.6); blocks (64 px) count as edge blocks above 0.2 % edge pixels; block map = mean edge P(blur). Gives the per-edge / per-block maps, not the pooled scalar L/D');
