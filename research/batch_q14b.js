/* ================= q14 (part b): Filter Forge library "Misc" effects (re-created from their published descriptions and controls) ================= */
const Q14_RELIEF = `
#define Q14H(q) blurL((q),1.5)
`;
f = add('Materials');
f('q14_ff_material','Filter Forge Material Looks (Rusterizer, Carve And Stain, 3D Engraved Painting, Foil Embosser, Erode Decal, Splotchy Concrete)',
  [S('Effect',['Rusterizer','Carve And Stain','3D engraved painting','Foil It Embosser','Erode Decal','Splotchy Concrete']),P('Amount',0,1,.6,.01),P('Scale',.25,4,1,.01),P('Light angle',0,360,135,1,'deg')],
  `${Q14_RELIEF}int ef=int(u_p0+.5);float am=u_p1,sc=u_p2;vec2 p=PX(uv)/sc+u_seed*37.;vec3 img=c.rgb;float h=Q14H(uv);
 float gx=Q14H(uv+vec2(u_px.x,0.))-Q14H(uv-vec2(u_px.x,0.)),gy=Q14H(uv+vec2(0.,u_px.y))-Q14H(uv-vec2(0.,u_px.y));
 float la=radians(u_p3);vec3 l=normalize(vec3(cos(la),sin(la),.9));float big=blurL(uv,6.);float cav=clamp((big-h)*4.,-1.,1.);
 if(ef==0){vec3 n=normalize(vec3(-gx*14.,-gy*14.,1.));float dif=max(dot(n,l),0.);float spc=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),30.);
  float rn=fbm(p*.035)+.45*cav+(am-.5)*.9+.25*(vnoise(p*.25)-.5);float rm=smoothstep(.45,.6,rn);
  vec3 rust=mix(vec3(.36,.13,.05),vec3(.72,.36,.12),fbm(p*.11+3.));rust*=.75+.5*vnoise(p*.6);
  vec3 iron=vec3(.42,.44,.47)*(.85+.3*vnoise(p*.4));vec3 o=mix(iron*(.25+.95*dif)+spc*.6*(1.-rm),rust*(.35+.8*dif),rm);
  return vec4(o*smoothstep(.02,.08,h),1.);}
 if(ef==1){vec2 off=vec2(cos(la),sin(la))*u_px*(1.+2.*am);float emb=(Q14H(uv-off)-Q14H(uv+off))*(4.+10.*am);
  vec3 stain=vec3(.62,.38,.16);float dep=clamp(cav*2.*am+.15,0.,1.);vec3 o=img*(1.+emb);o=mix(o,o*stain*1.5,dep);return vec4(clamp(o,0.,1.),1.);}
 if(ef==2){vec3 n=normalize(vec3(gx*(8.+30.*am),gy*(8.+30.*am),1.));float dif=dot(n,l)/l.z;float spc=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),40.)*.35;
  vec3 o=img*clamp(dif,.15,1.6)*(1.-clamp(-cav,0.,1.)*.4)+spc;return vec4(clamp(o,0.,1.),1.);}
 if(ef==3){vec2 cr=vec2(fbm(p*.08),fbm(p*.08+9.))-.5;vec3 n=normalize(vec3(-gx*(10.+30.*am)+cr.x*.6,-gy*(10.+30.*am)+cr.y*.6,1.));
  float e=n.x*.7+n.y*.7;float env=.5+.5*sin(e*7.+n.z*3.);vec3 gold=vec3(1.,.78,.34);
  float spc=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),20.);vec3 o=gold*(.25+.7*env)*(.6+.5*max(dot(n,l),0.))+spc*vec3(1.,.95,.8);return vec4(clamp(o,0.,1.),1.);}
 if(ef==4){vec2 q=p*.02;q+=vec2(fbm(q*3.),fbm(q*3.+5.))*.6;float er=fbm(q)+.25*(vnoise(p*.3)-.5);vec2 e2=min(uv,1.-uv);float edge=1.-smoothstep(0.,.25,min(e2.x,e2.y));
  float m=smoothstep(am*.55-.02,am*.55+.02,er-edge*am*.3);vec2 ck=floor(PX(uv)/8.);vec3 bg=mod(ck.x+ck.y,2.)<.5?vec3(.75):vec3(.9);return vec4(mix(bg,img,m),1.);}
 vec3 con=vec3(.6,.59,.56)*(.78+.3*fbm(p*.02)+.14*(fbm(p*.25)-.5))+.06*(hash(floor(PX(uv)))-.5);
 float spl=0.;vec2 cs=p/60.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=floor(cs)+vec2(float(i),float(j));vec2 h2=vec2(hash(cc),hash(cc+7.1));if(hash(cc+3.3)>am*.8+.05)continue;
  vec2 ctr=cc+.2+.6*h2;vec2 dv=cs-ctr;float rr=(.12+.3*hash(cc+1.7))*(1.+.35*(fbm(dv*6.+cc)-.5)*2.);spl=max(spl,1.-smoothstep(rr-.02,rr+.02,length(dv)));
  for(int k=0;k<5;k++){vec2 dp=ctr+(vec2(hash(cc+float(k)),hash(cc+float(k)+.5))-.5)*rr*4.;spl=max(spl,1.-smoothstep(.015,.03,length(cs-dp)));}}
 con=mix(con,con*vec3(.55,.53,.5),spl*.85);return vec4(con*mix(vec3(1.),img*1.25,.45),1.);`,
  'Filter Forge library effects re-created from their published descriptions and controls (the original node graphs are not public; approx.): Rusterizer (CorvusCroax: luminance as a height map rendered as rusty iron - lit iron with fbm rust patches that gather in cavities, black background cut out), Carve And Stain (Gene S Morgan: emboss carve along the light angle plus a stain colour cast that deepens the carved recesses), 3D engraved painting (uglyboys: the image engraved into its own inverted relief, lit), Chris\'s Foil It! Embosser (gold foil embossed by the image relief with crinkled-foil normals and metallic environment banding), Erode Decal (Thomas Gray: weathered decal - parts set transparent by distorted fbm erosion growing from the edges; transparency shown as a grey checkerboard), Splotchy Concrete (concrete grunge texture with dropped splotches, image multiplied in at 45 %)', true);

f = add('Stylize');
f('q14_ff_graphic','Filter Forge Graphic Looks (Film Noir Comic, Hardline Cut, Negative Passing, Sketch Cleaner, Urban Artistry, Old Computer Graphics, Banded Grayscale, Flatten Lightness)',
  [S('Effect',['Film Noir Comic','Hardline Cut','Negative passing','Sketch Cleaner','Urban Artistry','Old computer graphics','Banded Grayscale Portrait Distortion','Flatten Lightness']),
   P('Amount',0,1,.5,.01),P('Size',1,8,2,.1,'px'),P('Color hue',0,360,0,1,'deg')],
  `int ef=int(u_p0+.5);float am=u_p1,sz=R(u_p2);vec3 img=c.rgb;float g=luma(img);vec3 hc=hsv2rgb(vec3(u_p3/360.,1.,1.));
 if(ef==0){float t=clamp((g-.5)*1.8+.5+(am-.5)*.3,0.,1.);float pz=floor(t*4.)/3.;pz=mix(pz,t,.15);vec2 sg=sobel(uv);float ed=smoothstep(.15,.45,length(sg)*(.5+am));
  vec3 o=vec3(pz*(1.-ed));vec3 hs=rgb2hsv(img);float dh=abs(hs.x-u_p3/360.);dh=min(dh,1.-dh);float keep=smoothstep(.08,.03,dh)*smoothstep(.3,.5,hs.y)*smoothstep(.15,.3,hs.z);
  return vec4(mix(o,img*vec3(1.15,.95,.95),keep),1.);}
 if(ef==1){float hp=g-blurL(uv,sz);float v=(g-.5)*1.3+.5+hp*(4.+20.*am);return vec4(vec3(smoothstep(.47,.53,v)),1.);}
 if(ef==2){float bi=blurL(uv,sz);float dg=clamp(g/max(bi,.02),0.,1.);float ln=clamp((1.-dg)*(3.+12.*am),0.,1.);return vec4(mix(vec3(1.),hc*.75,ln),1.);}
 if(ef==3){float gs=blurL(uv,.5);float bg=max(blurL(uv,sz*3.),.05);float rt=gs/bg;float th=.95-.35*am;float ink=1.-smoothstep(th-.04,th+.04,rt);
  return vec4(mix(vec3(1.),hc*0.,ink),1.);}
 if(ef==4){vec3 bl=vec3(0.);for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++)bl+=O(uv+vec2(float(i),float(j))*u_px*sz*3.).rgb;bl/=25.;
  vec3 q=img/max(bl*(.6+.8*am),vec3(.03));vec3 o=clamp((q-.35)/.9,0.,1.);o=pow(o,vec3(.9));o=clamp(o+(img-bl)*1.2,0.,1.);return vec4(o,1.);}
 if(ef==5){float ps=max(u_p2,1.);vec2 pc=floor(PX(uv)/ps);vec3 s=clamp(T(fromPX((pc+.5)*ps)).rgb,0.,1.);float b=bayer4(pc)-.5;
  vec3 lv=am<.25?vec3(1.):am<.5?vec3(3.):am<.75?vec3(7.,7.,3.):vec3(31.);vec3 o=floor(s*lv+.5+b)/lv;return vec4(clamp(o,0.,1.),1.);}
 if(ef==6){float bh=sz*6.;float yb=floor(PX(uv).y/bh);float sh=(hash(vec2(yb,u_seed))-.5)*am*.12+sin(yb*1.3)*am*.03;vec2 q=vec2(uv.x+sh,uv.y);
  float gg=luma(T(clamp(q,0.,1.)).rgb);float od=mod(yb,2.);gg=od<.5?gg:clamp((gg-.5)*1.6+.5,0.,1.);gg=mix(gg,floor(gg*6.)/5.,.5*od);return vec4(vec3(gg),1.);}
 float m=0.,w=0.;for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){float ww=exp(-float(i*i+j*j)/8.);m+=luma(O(uv+vec2(float(i),float(j))*.025*vec2(1.,u_res.x/u_res.y)).rgb)*ww;w+=ww;}m/=w;
 float L2=clamp(g-am*(m-.5)*1.4,0.,1.);vec3 o=img*(L2/max(g,.01));o=mix(o,vec3(luma(o)),smoothstep(.75,1.,L2)*am);return vec4(clamp(o,0.,1.),1.);`,
  'Filter Forge library effects re-created from their published descriptions and controls (approx.): Film Noir Comic (Sin City look: contrasty 4-step grey + Sobel ink edges, colours near the chosen hue kept), Hardline Cut (Sean M Puckett: black / white threshold masked by the image\'s own high frequencies - Size = coarseness, Amount = texture), Negative passing (vicblue: photo drawn as lines in a colour of your choice - colour-dodge line extraction), Sketch Cleaner (Zephos: lines kept where darker than the local paper level, paper forced pure white; Amount = sensitivity), Urban Artistry (davyface: image divided by its blur (Divisor), levels and sharpen - psychedelic colour shift), Old computer graphics (Orteil: 1985-1995 slider = 1, 2, 3-3-2 and 5 bits per channel with 4x4 ordered dither; Size = pixel size), Banded Grayscale Portrait Distortion (DJI: grey bands displaced sideways, alternate bands contrast-stretched / posterised), Flatten Lightness (brightens shadows and darkens highlights by removing the large-scale lightness, chroma kept, highlights neutralised)', true);

f = add('Terrain');
f('q14_ff_maps','Filter Forge Map Looks (Satellite Image, Cartography)',
  [S('Effect',['Satellite Image','Cartography']),P('Sea level',0,1,.42,.01),P('Noise in landmass',0,1,.3,.01),P('Scale',.25,4,1,.01)],
  `int ef=int(u_p0+.5);float sea=u_p1;vec2 p=PX(uv)/u_p3+u_seed*53.;float hi=blurL(uv,2.);float H=mix(hi,fbm(p*.008),u_p2)+.07*(fbm(p*.05)-.5);
 float ex=.004*u_p3;float hx=blurL(uv+vec2(u_px.x*3.,0.),2.)-blurL(uv-vec2(u_px.x*3.,0.),2.),hy=blurL(uv+vec2(0.,u_px.y*3.),2.)-blurL(uv-vec2(0.,u_px.y*3.),2.);
 hx=mix(hx,0.,u_p2*.5);hy=mix(hy,0.,u_p2*.5);float shade=clamp(1.+(-hx+hy)*4.,.55,1.4);
 if(ef==0){vec3 o;float d=sea-H;
  if(d>0.)o=mix(vec3(.13,.45,.52),vec3(.02,.07,.2),smoothstep(0.,.18,d));
  else{float e=(H-sea)/max(1.-sea,.05);float mo=fbm(p*.02+11.);vec3 veg=mix(vec3(.24,.36,.13),vec3(.09,.2,.07),smoothstep(.45,.65,fbm(p*.06+4.)));
   vec3 lo=mix(vec3(.62,.52,.34),veg,smoothstep(.35,.5,mo));o=mix(vec3(.78,.72,.52),lo,smoothstep(.0,.04,e));
   o=mix(o,vec3(.42,.38,.33)*(.8+.3*vnoise(p*.2)),smoothstep(.45,.65,e));o=mix(o,vec3(.95,.96,.98),smoothstep(.78,.86,e));o*=shade;}
  o=mix(o,vec3(1.),.35*smoothstep(.55,.75,fbm(p*.01+31.)));return vec4(clamp(o,0.,1.),1.);}
 vec3 paper=vec3(.93,.86,.68)*(.9+.12*fbm(p*.015))-.05*smoothstep(.6,.8,fbm(p*.03+8.));float d=H-sea;
 vec3 o=d>0.?paper*vec3(.98,.93,.82):mix(paper*vec3(.72,.86,.86),paper,smoothstep(0.,.25,-d));
 float gl=max(length(vec2(hx,hy))/6.,.004);float coast=1.-smoothstep(.6,1.6,abs(d)/gl);
 float rip=(d<0.&&-d<.12)?(1.-smoothstep(.15,.35,abs(fract(-d/.03)-.5)*2.))*(1.-smoothstep(.0,.12,-d))*.5:0.;
 vec2 a=uv*vec2(u_res.x/u_res.y,1.);vec2 gm=abs(fract(a*5.)-.5);float mer=(1.-smoothstep(.0,.004,min(gm.x,gm.y)*.2))*.45;
 vec2 e2=min(uv,1.-uv);float md=min(e2.x,e2.y);float bord=max(1.-smoothstep(.0,.004,abs(md-.03)),1.-smoothstep(.0,.0025,abs(md-.042)));
 vec3 ink=vec3(.26,.16,.09);o=mix(o,ink,max(max(coast,rip),max(mer,bord)));if(md<.03)o=paper*.92;o=mix(o,ink,bord);
 return vec4(o,1.);`,
  'Filter Forge library effects re-created from their published descriptions and controls (approx.): Satellite Image (Aurum: landmass from image luminance mixed with fbm, water depth from shallow turquoise to deep blue, sand shore, desert / grass / forest by moisture noise, rock and snow by elevation, hill-shading, thin clouds), Cartography (Crapadilla: hand-inked map on parchment - land / sea split at Sea level from luminance, ink coastline, shore ripple lines, meridian grid and double border)', true);

f = add('Stylize');
f('q14_ff_overlay','Filter Forge Jack Frost / Blood Spatter Analyst',
  [S('Effect',['Jack Frost','Blood Spatter Analyst']),P('Amount',0,1,.5,.01),P('Size',.3,3,1,.01),S('Drips',['On','Off'])],
  `int ef=int(u_p0+.5);float am=u_p1;vec2 p=PX(uv)/u_p2+u_seed*41.;vec3 img=c.rgb;
 if(ef==0){float rf=0.,a=.5;vec2 q=p*.02;for(int i=0;i<5;i++){float nn=vnoise(q);rf+=a*(1.-abs(2.*nn-1.));q=mat2(1.6,1.2,-1.2,1.6)*q;a*=.5;}
  vec2 e2=min(uv,1.-uv);float edge=1.-smoothstep(0.,.45,min(e2.x,e2.y)*1.6);float fm=smoothstep(.35,.75,rf*.9+edge*.7+(am-.5)*1.1-.15+.15*(fbm(p*.01)-.5));
  float cr=pow(rf,3.)*1.4;vec3 cold=mix(vec3(luma(img)),img,.55)*vec3(.88,.95,1.06)+.05;float sn=smoothstep(.55,.8,luma(img)+am*.3)*.35*am;
  vec3 o=mix(cold,vec3(.9,.95,1.),max(fm*(.55+.45*cr),sn));o+=vec3(.25,.3,.35)*cr*fm*.4;return vec4(clamp(o,0.,1.),1.);}
 float dk=1.-blurL(uv,3.);float pool=smoothstep(.6,.68,dk*.9+.3*fbm(p*.03)-.15+(am-.5)*.5);
 float drip=0.;if(u_p3<.5){float col=floor(PX(uv).x/(3.*u_p2));float ch=hash(vec2(col,7.)+u_seed);if(ch<.35*am+.1){float len=(.05+.25*hash(vec2(col,3.)))*(.5+am);float wv=.5+.5*sin(PX(uv).x*.4);
  for(int k=1;k<=16;k++){float dy=float(k)/16.*len;vec2 q=vec2(uv.x,uv.y+dy);if(q.y>1.)break;float dk2=1.-blurL(q,3.);float pq=smoothstep(.6,.68,dk2*.9+.3*fbm((PX(q)/u_p2+u_seed*41.)*.03)-.15+(am-.5)*.5);
   if(pq>.5){drip=max(drip,(1.-float(k)/17.)>.0?1.-smoothstep(.85,1.,dy/len):0.);}}}}
 float spl=0.;vec2 cs=p/45.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 cc=floor(cs)+vec2(float(i),float(j));if(hash(cc+2.2)>am*.5)continue;vec2 ctr=cc+.5+(vec2(hash(cc),hash(cc+1.))-.5)*.5;
  for(int k=0;k<8;k++){float an=hash(cc+float(k)*1.3)*6.283;float rr=hash(cc+float(k)*2.1)*.45;vec2 dp=ctr+vec2(cos(an),sin(an))*rr;float sz2=.02+.05*(1.-rr/.45)*hash(cc+float(k)*.7);spl=max(spl,1.-smoothstep(sz2*.8,sz2,length(cs-dp)));}}
 float m=max(max(pool,drip),spl);vec3 bc=vec3(.42,.01,.03);
 vec3 o=mix(img,bc*(.75+.35*vnoise(p*.2)),m*.92);o+=vec3(.5,.35,.35)*max(0.,dFdx(m)-dFdy(m))*m;return vec4(clamp(o,0.,1.),1.);`,
  'Filter Forge library effects re-created from their published descriptions and controls (approx.): Jack Frost (ThreeDee: ridged-noise ice crystals creeping in from the edges, Frost level = Amount, cold desaturated image, snow on the light areas), Blood Spatter Analyst (tinkerpixel: blood pooling in the dark areas of the image, drips running down from the pools (per-column, seeded) and spray splatter, glossy edge)', true);

f = add('Distort');
f('q14_ff_geometry','Filter Forge Geometry (Circular Agamograph, Polygonal Mandalas, ReMondrian Lite)',
  [S('Effect',['Circular Agamograph','Polygonal Mandalas','ReMondrian Lite']),P('Count',2,24,8,1),P('Shadow or frame',0,1,.5,.01),P('Rotation',0,360,0,1,'deg')],
  `int ef=int(u_p0+.5);float ar=u_res.x/u_res.y;vec2 q=(uv-.5)*vec2(ar,1.);float r=length(q);float th=atan(q.y,q.x)+radians(u_p3);
 if(ef==0){float N=floor(u_p1+.5)+4.;float w=6.2831853/N;float k=floor(th/w);float t=th/w-k;float sk=.5;bool fa=t<sk;float tl=fa?t/sk:(t-sk)/(1.-sk);
  float sa=(k+(fa?tl:1.-tl))*w-radians(u_p3);vec2 sp=vec2(cos(sa),sin(sa))*r/vec2(ar,1.)+.5;vec3 o=T(clamp(sp,0.,1.)).rgb;
  float sh=fa?1.-.15*u_p2*(1.-tl):1.-.6*u_p2*(.4+.6*tl);float fl=1.-smoothstep(.0,.025,min(t,abs(t-sk)))*1.;o*=sh*(1.-.35*u_p2*fl);return vec4(o,1.);}
 if(ef==1){float lst[5]=float[5](3.,5.,6.,8.,9.);int ix=int(clamp(floor((u_p1-2.)/22.*5.),0.,4.));float n=lst[ix];float w=3.14159265/n;
  float a=mod(th,2.*w);a=a>w?2.*w-a:a;float rr=r*1.9;vec2 sp=vec2(cos(a),sin(a))*rr*.5/vec2(ar,1.)+.5;vec3 o=T(clamp(sp,0.,1.)).rgb;
  float dp=r*cos(mod(th,2.*w)-w);float R0=.44;float fw=.035*u_p2+.004;
  if(dp>R0)return vec4(vec3(.06),1.);
  if(dp>R0-fw){float sa=floor(th/(2.*w))*2.*w+w;float lt=.65+.45*cos(sa-2.356);o=mix(o,vec3(.75,.68,.55)*lt,.85);}
  else o*=1.-.25*smoothstep(R0-fw-.03,R0-fw,dp)*u_p2;return vec4(o,1.);}
 vec4 rc=vec4(0.,0.,1.,1.);float id=7.+u_seed*13.+u_p3;int lv=int(clamp(u_p1*.5,1.,7.));
 for(int i=0;i<7;i++){if(i>=lv)break;vec2 sz=rc.zw-rc.xy;float hs=hash(vec2(id,float(i)*3.1));float pos=.28+.44*hash(vec2(id+1.7,float(i)));if(min(sz.x*ar,sz.y)<.12)break;
  bool vert=sz.x*ar>sz.y*(.7+.6*hs);if(vert){float sx=rc.x+sz.x*pos;if(uv.x<sx){rc.z=sx;id=id*2.+1.;}else{rc.x=sx;id=id*2.+2.;}}
  else{float sy=rc.y+sz.y*pos;if(uv.y<sy){rc.w=sy;id=id*2.+3.;}else{rc.y=sy;id=id*2.+4.;}}}
 vec3 av=vec3(0.);for(int j=0;j<4;j++)for(int i=0;i<4;i++)av+=O(mix(rc.xy,rc.zw,(vec2(float(i),float(j))+.5)/4.)).rgb;av/=16.;
 vec3 hs=rgb2hsv(av);vec3 o;
 float ch=hash(vec2(id,5.3));
 if(hs.y*hs.z<.28||ch<.3)o=hs.z<.16?vec3(.06):hs.z<.4?vec3(.82,.82,.8):vec3(.95,.94,.9);
 else{float hh=hs.x;o=(hh<.05||hh>.85)?vec3(.85,.12,.1):hh<.25?vec3(.97,.8,.12):vec3(.1,.22,.6);}
 float lw=(.004+.01*u_p2);vec2 dd=min(uv-rc.xy,rc.zw-uv)*vec2(ar,1.);float ed=min(dd.x,dd.y);o=mix(vec3(.04),o,smoothstep(lw*.8,lw,ed));
 return vec4(o,1.);`,
  'Filter Forge library effects re-created from their published descriptions and controls (approx.): Circular Agamograph (Rachel Duim: one image cut into Count + 4 pie slices and folded accordion style - each slice shown compressed on the lit face and mirrored on the shaded face, fold lines darkened; Shadow = fold shading), Polygonal Mandalas (jhantares: the image folded into 3/5/6/8/9-sided mirror symmetry inside a polygon with a lit bevelled 3D frame; Count picks the polygon), ReMondrian Lite (Ramlyn: seeded recursive rectangle splits (Count sets the depth), each rectangle filled with the nearest Mondrian colour (red / yellow / blue / black / white / grey) of its average image colour, black grid lines)', true);
