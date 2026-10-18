/* ================= q31: Pentax / Ricoh / Lumix in-camera looks, Capture One / Lightroom controls, Aurora HDR tools ================= */
f = add('Film');
f('q31_pentax_ci','Pentax Custom Image (Muted / Reversal Film / Radiant / Flat)',[S('Image',['Muted','Reversal Film','Radiant','Flat']),P('Saturation',-1,1,0,.05),P('Contrast',-1,1,0,.05),P('Key',-1,1,0,.05)],
`int m=int(u_p0+.5);vec3 o=c.rgb;float sa=1.,con=1.;vec3 wb=vec3(1.);
if(m==0){sa=.55;con=.88;wb=vec3(1.01,1.,.98);}else if(m==1){sa=1.22;con=1.45;wb=vec3(.98,1.,1.03);}else if(m==2){sa=1.5;con=1.25;wb=vec3(1.03,1.,.96);}else{sa=.68;con=.62;}
sa*=1.+.6*u_p1;con*=1.+.4*u_p2;vec3 hs=rgb2hsv(o);if(sa>1.)sa=1.+(sa-1.)*(1.-.75*hs.y);vec3 col=clamp(sat(o*wb*exp2(.6*u_p3),sa),0.,1.);
col=con>1.?mix(col,col*col*(3.-2.*col),min((con-1.)*2.2,1.)):mix(vec3(.46),col,con);
if(m==1)col=max(col-.03*(1.-col),0.);return vec4(clamp(col,0.,1.),1.);`,
'Pentax Custom Image looks (approx. from the K-series manuals): Muted = low saturation and contrast; Reversal Film = slide-film contrast, deep blacks, slightly cool; Radiant = vivid saturated high-contrast warm; Flat = very low contrast and saturation for grading; Saturation / Contrast / Key = the in-camera fine-tune sliders');
f('q31_pentax_df','Pentax Digital Filter (Tone Expansion / Unicolor Bold / Bold Monochrome)',[S('Filter',['Tone Expansion','Unicolor Bold','Bold Monochrome']),P('Strength',0,1,.7,.01),P('Kept hue (Unicolor)',0,360,0,1,'deg'),P('Hue range (Unicolor)',.02,.3,.04,.01)],
[BH('24.'),BV('24.'),`vec3 o=O(uv).rgb;float bl=luma(T(uv).rgb),l=luma(o);int m=int(u_p0+.5);float a=u_p1;vec3 col;
float rr=length((uv-.5)*vec2(asp(),1.))/(.5*length(vec2(asp(),1.)));
if(m==0){float nl=clamp(mix(bl,.5,.55*a)+(l-bl)*(1.+1.6*a),0.,1.);col=sat(mix(o+(nl-l),o*clamp(nl/max(l,.04),0.,3.),.5),1.+.3*a);}
else if(m==1){vec3 h=rgb2hsv(o);float dh=abs(fract(h.x-u_p2/360.+.5)-.5);float k=(1.-smoothstep(u_p3,u_p3+.05,dh))*smoothstep(.1,.3,h.y);
 float g=clamp((l-.5)*(1.+1.4*a)+.5,0.,1.);g=g*g*(3.-2.*g);col=mix(vec3(g),sat(o,1.2+.4*a),k);}
else{float g=clamp(l+(l-bl)*1.5*a,0.,1.);g=clamp((g-.5)*(1.+1.6*a)+.5,0.,1.);g=g*g*(3.-2.*g);col=vec3(g)*(1.-.75*a*smoothstep(.35,1.1,rr));}
return vec4(clamp(col,0.,1.),1.);`],
'Pentax Digital Filters (approx. from the manual descriptions): Tone Expansion = HDR-like compressed global tone with expanded local detail (24 px base); Unicolor Bold = one hue kept and boosted, everything else high-contrast B&W; Bold Monochrome = hard high-contrast B&W with local contrast and a strong vignette');
f = add('Distort');
f('q31_pentax_slim','Slim (Pentax Digital Filter)',[P('Slim',-1,1,.5,.0625)],
`float k=1.+.2*abs(u_p0);vec2 q=uv-.5;if(u_p0>0.)q.y/=k;else q.x/=k;return O(q+.5);`,
'Pentax Slim digital filter (16 steps): changes the horizontal / vertical ratio at the same output size; + stretches vertically (subjects look slimmer, top and bottom cropped), - stretches horizontally; up to 20% (approx. range)');
f = add('Film');
f('q31_ricoh_ic','Ricoh Image Control (HDR Tone / Positive / Negative Film / Monotones / Hi-contrast B&W)',[S('Image',['HDR Tone','Positive Film','Negative Film','Soft Monotone','Hard Monotone','Hi-contrast B&W']),P('Contrast',-1,1,0,.05),P('Toning (mono)',-1,1,0,.05),P('Grain',0,1,0,.01)],
[BH('20.'),BV('20.'),`vec3 o=O(uv).rgb;float bl=luma(T(uv).rgb),l=luma(o);int m=int(u_p0+.5);float ca=u_p1;vec3 col;
float rr=length((uv-.5)*vec2(asp(),1.))/(.5*length(vec2(asp(),1.)));float gn=hash(floor(uv*u_res))-.5;float gr=u_p3;
if(m==0){float nl=clamp(mix(bl,.5,.6)+(l-bl)*(2.2+ca),0.,1.);col=sat(mix(o+(nl-l),o*clamp(nl/max(l,.04),0.,3.),.5),1.25);}
else if(m==1){col=sat(o,1.35);col=clamp(col*vec3(.99,1.,1.02),0.,1.);col=mix(col,col*col*(3.-2.*col),clamp(.65+.35*ca,0.,1.));}
else if(m==2){col=sat(o,.7);col=mix(vec3(.05,.075,.085),vec3(.98,.955,.9),col);col=mix(col,col*col*(3.-2.*col),.2+.2*ca);}
else{float g=l;if(m==3)g=.5+(l-.5)*(.72+.25*ca)+.04;else if(m==4){g=clamp(.5+(l-.5)*(1.45+.4*ca),0.,1.);g=g*g*(3.-2.*g);}
 else{g=clamp(l+(l-bl)*.9,0.,1.);g=smoothstep(.22-.08*ca,.72+.08*ca,g);g*=1.-.55*smoothstep(.4,1.1,rr);gr+=.35;}
 vec3 tn=u_p2>0.?vec3(1.1,1.,.82):vec3(.86,.97,1.12);col=vec3(g)*mix(vec3(1.),tn,abs(u_p2)*(.4+2.4*g*(1.-g)));}
col+=gn*gr*.22*(1.-abs(2.*luma(col)-1.)*.5);return vec4(clamp(col,0.,1.),1.);`],
'Ricoh GR Image Control looks (approx. from the GR manuals): HDR Tone = local tone compression with boosted detail (20 px base); Positive Film = vivid high-contrast slide; Negative Film = soft, desaturated, lifted cyan-black / warm-white print; Soft / Hard Monotone = low / high contrast B&W; Hi-contrast B&W = extreme push-processed contrast, grain and vignette; Toning = sepia (+) / cool (-) for the monochromes');
f('q31_lumix_cc','Lumix Creative Control',[S('Effect',['Expressive','Retro','Old Days','Toy Pop','Fantasy','High Dynamic','Impressive Art','Dynamic Monochrome','Silky Monochrome','Rough Monochrome']),P('Adjust',-1,1,0,.05)],
[BH('16.'),BV('16.'),`vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float bl=luma(b),l=luma(o);int m=int(u_p0+.5);float ad=u_p1;vec3 col;
float rr=length((uv-.5)*vec2(asp(),1.))/(.5*length(vec2(asp(),1.)));float vg=smoothstep(.35,1.15,rr);
if(m<7){float k=1.+.5*ad;
 if(m==0){col=sat(o,1.65);col=mix(col,col*col*(3.-2.*col),.25);}
 else if(m==1){col=sat(o,.68);col=mix(vec3(.09,.06,.03),vec3(1.,.94,.76),col);col=mix(col,b,.12);}
 else if(m==2){col=sat(o,.45);col=.13+.83*col;col*=vec3(1.04,1.,.9);col*=1.-.38*vg;}
 else if(m==3){col=sat(o*1.12,1.55);col=mix(col,col*col*(3.-2.*col),.2);col*=1.-.5*vg;}
 else if(m==4){col=sat(o,.55)*.78+.22;col*=vec3(.9,1.,1.13);col=screen(col,b*vec3(.2,.22,.26));}
 else if(m==5){float nl=clamp(mix(bl,.5,.65)+(l-bl)*1.5,0.,1.);col=sat(mix(o+(nl-l),o*clamp(nl/max(l,.04),0.,3.),.5),1.1);}
 else{float nl=clamp(mix(bl,.5,.7)+(l-bl)*3.,0.,1.);col=sat(mix(o+(nl-l),o*clamp(nl/max(l,.04),0.,3.),.5),1.6);col=mix(col,col*col*(3.-2.*col),.3);}
 col=mix(o,col,k);}
else{float g;
 if(m==7){g=clamp(l+(l-bl)*.8,0.,1.);g=mix(g,g*g*(3.-2.*g),.8);g=mix(g,smoothstep(0.,1.,g),.6);}
 else if(m==8){g=mix(l,bl,.45);g=1.-(1.-g)*(1.-.3*bl);g=.04+.92*g;}
 else{g=smoothstep(.04,.96,l);float gn=hash(floor(uv*u_res))+hash(floor(uv*u_res*.5)+7.3)-1.;g+=gn*.2*(1.-abs(2.*g-1.)*.4);g*=1.-.25*vg;}
 vec3 tn=ad>0.?vec3(1.08,1.,.8):vec3(.86,.97,1.14);col=vec3(g)*mix(vec3(1.),tn,abs(ad)*(.3+2.8*g*(1.-g)));}
return vec4(clamp(col,0.,1.),1.);`],
'Panasonic Lumix Creative Control (approx. from the Lumix manuals): Expressive = pop saturated colour; Retro = faded yellowed print; Old Days = bright, desaturated, warm, vignetted; Toy Pop = bright vivid with darkened corners; Fantasy = pale airy blue with a soft glow; High Dynamic = shadows-to-highlights tone compression; Impressive Art = dramatic surreal local contrast; Dynamic / Silky / Rough Monochrome = punchy / soft-focus / grainy B&W; Adjust = effect strength (colour) or yellow (+) / blue (-) toning (mono)');
f = add('Sharpen');
f('q31_c1clarity','Clarity & Structure (Capture One methods)',[S('Method',['Natural','Punch','Neutral','Classic']),P('Clarity',-100,100,30,1),P('Structure',-100,100,0,1)],
[BH('25.'),BV('25.'),`vec3 o=O(uv).rgb;float bl=luma(T(uv).rgb),l=luma(o);int m=int(u_p0+.5);float a=u_p1/100.,s=u_p2/100.;
float sb=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)sb+=luma(O(uv+vec2(float(i),float(j))*u_px*max(u_k,1.)).rgb)*(i==0&&j==0?.25:(i==0||j==0?.125:.0625));
float dl=l-bl,ds=l-sb,mid=4.*l*(1.-l);vec3 col;
if(m==0){col=o+dl*a*1.3*mid/(1.+5.*abs(dl));}
else if(m==1){float nl=max(l+dl*a*2.2*mid/(1.+3.*abs(dl)),0.);col=sat(mix(o+(nl-l),o*clamp(nl/max(l,.04),0.,3.),.5),1.+.4*a);}
else if(m==2){col=o+dl*a*2.2*mid/(1.+3.*abs(dl));}
else{col=o+dl*a*1.5;col=sat(col,1.+.12*a);}
col+=ds*s*3.*(1.-.6*abs(2.*l-1.));return vec4(clamp(col,0.,1.),1.);`],
'Capture One Clarity methods (approx. from the Capture One manual): Natural = light midtone local contrast, colour untouched; Punch = stronger local contrast plus saturation; Neutral = Punch strength without saturation change; Classic = the original, less tone-protected method (more halo); local contrast vs a 25 px Gaussian base; Structure = fine-detail contrast vs a 3x3 binomial blur');
f = add('Film');
f('q31_lr_vignette','Post-Crop Vignette (Lightroom styles)',[S('Style',['Highlight Priority','Color Priority','Paint Overlay']),P('Amount',-100,100,-40,1),P('Midpoint',0,100,50,1),P('Feather',0,100,50,1)],
`vec3 o=c.rgb;int m=int(u_p0+.5);float a=u_p1/100.;float rn=length((uv-.5)*2.)/1.4142;float m0=.15+.7*u_p2/100.;
float fo=smoothstep(m0-.25*u_p3/100.,m0+.03+(1.1-m0)*(.1+.9*u_p3/100.),rn);vec3 col;
if(m==2){col=mix(o,a<0.?vec3(0.):vec3(1.),abs(a)*fo);}
else{vec3 li=${LIN('o')};vec3 r;float k=a*fo;
 if(m==1)r=k<0.?li*(1.+k):li+(1.-max(li.r,max(li.g,li.b)))*li*k*2.;
 else{r=k<0.?li*mix(vec3(1.+k),vec3(1.),smoothstep(.45,1.,li)):1.-(1.-li)*(1.-k);}
 r=clamp(r,0.,1.);col=${SRGB('r')};}
return vec4(clamp(col,0.,1.),1.);`,
'Lightroom post-crop vignette styles (approx. from the Adobe help): Highlight Priority = exposure-like darkening with per-channel highlight recovery (bright areas keep their level, may shift colour); Color Priority = uniform linear-light scaling, hue preserved, no highlight recovery; Paint Overlay = flat blend with black or white; elliptical falloff following the frame (roundness 0)');
/* ---- q31: Aurora HDR tools (single image) ---- */
f = add('Sharpen');
f('q31_aurora_structure','HDR Smart Structure (Aurora HDR)',[P('Amount',-100,100,45,1),P('Scale',2,30,8,.5,'px'),P('Softness',0,1,.35,.01)],
[BH('u_p1'),BV('u_p1'),`vec3 o=O(uv).rgb;float bl=luma(T(uv).rgb),l=luma(o);float d=l-bl;float t=.004+.03*u_p2;
float g=d*d/(d*d+t*t);float dd=d*g*(u_p0/100.)*3./(1.+abs(d)*(6.+18.*u_p2));vec3 col=o+dd*(1.-.5*abs(2.*l-1.));
return vec4(clamp(col,0.,1.),1.);`],
'Aurora HDR Smart Structure (approx. from the product description, "details without noise or halos"): detail = luma minus a Gaussian base at Scale; small differences cored (noise kept down), large ones soft-clipped (no halos); Softness widens both');
f = add('Tone');
f('q31_aurora_tbl','Top & Bottom Lighting (Aurora HDR)',[P('Top',-100,100,-35,1),P('Bottom',-100,100,25,1),P('Horizon',0,100,50,1),P('Blend',5,100,40,1)],
`vec3 li=${LIN('c.rgb')};float y=uv.y,hz=u_p2/100.,bw=u_p3/200.;float wt=smoothstep(hz-bw,hz+bw,y);
float ev=mix(u_p1,u_p0,wt)/100.*1.5;vec3 r=li*exp2(ev);vec3 e=max(r-.8,0.);r=min(r,vec3(.8))+.2*(1.-exp(-e/.2));
return vec4(${SRGB('clamp(r,0.,1.)')},1.);`,
'Aurora HDR Top & Bottom Lighting (approx.): separate exposure for the upper and lower part of the frame (a graduated split at Horizon with a soft Blend band), applied in linear light with a soft highlight shoulder above 0.8');
f = add('Stylize');
f('q31_aurora_radiance','Image Radiance (Aurora HDR)',[P('Amount',0,100,50,1),P('Smoothness',0,100,50,1),P('Brightness',-100,100,0,1),P('Warmth',-100,100,0,1)],
[BH('(4.+u_p1*.3)'),BV('(4.+u_p1*.3)'),`vec3 o=O(uv).rgb;vec3 b=T(uv).rgb;float a=u_p0/100.;
vec3 gl=screen(o,b*b*.9);vec3 col=mix(o,softLight(gl,b),.55);col=sat(col,1.+.35*a);col*=exp2(u_p2/100.*.6);
col*=vec3(1.+.08*u_p3/100.,1.,1.-.1*u_p3/100.);col=mix(o,col,a*1.6);return vec4(clamp(col,0.,1.),1.);`],
'Aurora HDR Image Radiance (approx. from the product description): a dreamy glow = screen of a Gaussian-blurred copy (Smoothness = radius) soft-lit back in, with a saturation lift, plus Brightness and Warmth');
f = add('Noise');
f('q31_aurora_denoise','HDR Denoise (Aurora HDR)',[P('Luminance',0,100,50,1),P('Color',0,100,60,1),P('Radius',1,4,2,.5,'px')],
`vec3 o=c.rgb;float l=luma(o);float sr=.01+.12*u_p0/100.;vec2 st=u_px*R(u_p2)/1.5;float wl=0.,lv=0.;vec2 cs=vec2(0.);float wc=0.;
for(int j=-3;j<=3;j++)for(int i=-3;i<=3;i++){vec2 q=vec2(float(i),float(j));vec3 s=T(uv+q*st).rgb;float ls=luma(s);float gs=exp(-dot(q,q)/8.);
 float w=gs*exp(-(ls-l)*(ls-l)/(2.*sr*sr));lv+=ls*w;wl+=w;float wc_=gs*exp(-(ls-l)*(ls-l)/.02);cs+=vec2(s.b-ls,s.r-ls)*wc_;wc+=wc_;}
float nl=mix(l,lv/wl,min(u_p0/50.,1.));vec2 ch=mix(vec2(o.b-l,o.r-l),cs/wc,u_p1/100.);
vec3 col=vec3(ch.y+nl,0.,ch.x+nl);col.g=(nl-.2126*col.r-.0722*col.b)/.7152;return vec4(clamp(col,0.,1.),1.);`,
'Aurora HDR Denoise (approx.): luminance = 7x7 bilateral on luma (range sigma grows with Luminance); colour = range-gated Gaussian average of the B-Y / R-Y differences (Color = mix)');
