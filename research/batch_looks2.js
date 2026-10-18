/* ================= looks2: Instagram II (Gotham, Apollo, story city filters), VSCO presets, Google Photos filters ================= */
/* Shared data-driven look model. Each look = 16 numbers:
   0 exposure EV (linear light) | 1 contrast (-1..1, S-curve / flatten) | 2 saturation x | 3 fade (black lift) | 4 white cap
   5 temperature (+warm) | 6 tint (+magenta / -green) | 7-9 shadow RGB offset | 10-12 highlight RGB offset | 13 vignette
   14 midtone gamma (+brighter) | 15 red protect (keeps reds saturated when saturation < 1)
   The table becomes a GLSL const array indexed by the Look option. */
const LOOKS2_ROW = v => v.map(n => (Number.isInteger(n) ? n + '.' : String(n))).join(',');
const LOOKS2_SHADER = rows => `const float LT[${rows.length * 16}]=float[](${rows.map(r => LOOKS2_ROW(r[1])).join(',\n ')});
 int k=int(u_p0+.5)*16;vec3 o=c.rgb;
 vec3 l=${LIN('o')};l*=exp2(LT[k]);vec3 x=${SRGB('l')};x=clamp(x,0.,1.);
 x*=vec3(1.+.12*LT[k+5],1.-.07*LT[k+6],1.-.12*LT[k+5]);x.rb*=1.+.035*LT[k+6];x=clamp(x,0.,1.);
 x=pow(x,vec3(exp(-LT[k+14])));
 float ct=LT[k+1];vec3 sc=x*x*(3.-2.*x);x=ct>=0.?mix(x,sc,ct):mix(x,vec3(.5)+(x-.5)*.6,-ct);
 float y=luma(x);float red=clamp((o.r-max(o.g,o.b))*3.,0.,1.);float sa=mix(LT[k+2],max(LT[k+2],1.),red*LT[k+15]);x=y+(x-y)*sa;
 y=clamp(luma(x),0.,1.);x+=vec3(LT[k+7],LT[k+8],LT[k+9])*(1.-y)*(1.-y)*2.+vec3(LT[k+10],LT[k+11],LT[k+12])*y*y*2.;
 x=clamp(x,0.,1.);x=LT[k+3]+x*(1.-LT[k+3]-LT[k+4]);
 vec2 q=(uv-.5)*vec2(asp(),1.)/sqrt(asp()*asp()+1.)*2.;x*=1.-LT[k+13]*u_p2*smoothstep(.35,1.05,length(q));
 return vec4(mix(o,clamp(x,0.,1.),u_p1),1.);`;
const LOOKS2_NOTE = 'look approximation (unofficial description); one data-driven look model: exposure in linear light, temperature/tint gains, midtone gamma, S-curve contrast, saturation with red protect, quadratic shadow/highlight toning, fade / white cap, vignette';
/*                    exp  con   sat  fade cap  temp tint  shR  shG  shB  hiR  hiG  hiB  vig  gam  red */
const LOOKS2_IG = [
 ['Gotham',        [-.1, .6,   0,   0,   0,   0,   0, -.02,  0,  .05,  0,   0,  .02, .3, -.1,  0]],
 ['Apollo',        [ .1,-.15, .8,  .1,  .03, .1, -.3,   0,  .05, .04, .04, .03,  0,  .2, .05,  0]],
 ['Oslo',          [ .1,-.1,  .75, .06, .02,-.1,   0,   0,  .01, .03, .01, .01,  0,   0, .1,   0]],
 ['Lagos',         [.05, .1, 1.15, .04,  0,  .25, .1,  .03, .01,-.02, .03, .02,  0,  .1,  0,   0]],
 ['Melbourne',     [ .1, .15,1.05, .03,  0,  .15,  0,  .02, .01,  0,  .02, .01,-.01,  0, .2,   0]],
 ['Jakarta',       [ .2,-.1,  1.,  .03,  0,  .12, .03,  0,   0,   0,  .02, .01,  0,   0, .1,   0]],
 ['Abu Dhabi',     [ .1, .15, 1.1,  0,   0,  .25, .12, .02,  0, -.02, .04, .02,-.02, .1, .05,  0]],
 ['Buenos Aires',  [.15,-.15, .9,  .07, .02, .1,  .25, .04,  0,  .03, .03, .01, .01,  0, .1,   0]],
 ['Jaipur',        [.05, .1, 1.2,   0,   0,  .15, .35, .03,-.01, .02, .04,  0,  .02, .1,  0,   0]],
 ['New York',      [  0, .25, .6,  .02,  0, -.2,   0, -.01,  0,  .03,  0,   0,  .01, .2,  0,   0]],
 ['Cairo',         [.05,  0,  .95, .05, .02, .4,  .05, .04, .02,-.02, .05, .03,-.03, .15,  0,  0]],
 ['Tokyo',         [ .1, .45,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  .1, .1,   0]],
 ['Rio de Janeiro',[ .1, .1, 1.15, .03,  0,  .15, .3,  .03,-.01, .05, .05, .02,  0,  .1,  0,   0]],
 ['Paris',         [ .1,-.15, .95, .04,  0,  .08, .12, .02,  0,  .01, .02, .01, .01,  0, .05,  0]]];
const LOOKS2_VSCO = [
 ['A6 (analog fade)',      [  0,-.15, .8,  .09, .03, .1,  .05, .02, .01,  0,  .02, .02,  0,   0, .05,  0]],
 ['C1 (chroma)',           [.25, .3, 1.2,  .02,  0,   0,  .05,-.03, .02, .04, .04,  0,  .02,  0, .05,  0]],
 ['F2 (mellow fade)',      [.15,-.1,  .8,  .07, .04,-.15,  0,   0,  .01, .03,  0,  .01, .02,  0, .05,  0]],
 ['HB1 (high beam)',       [ .2,  0,  .7,  .05, .02,-.25,-.05,-.01, .01, .04,  0,  .01, .02,  0, .1,  .8]],
 ['M5 (mood)',             [.05,-.15, .75, .08, .03, .2,  .05, .03, .02,  0,  .03, .02,-.01,  0, .05,  0]],
 ['KK1 (Kodak warm)',      [  0, .15,1.05, .04,  0,  .2, -.1,   0,  .02,  0,  .03, .02,-.02, .1,  0,  .3]],
 ['AL3 (artificial light)',[.05,-.05, .85, .04,  0, -.3,  .05,  0,  .01, .03,  0,   0,  .01,  0,  0,   0]],
 ['B1 (black and white)',  [  0, .2,   0,  .04,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  0,   0]],
 ['T1 (tribute fade)',     [.05,-.25, .7,  .14, .05, .15, .05, .03, .02, .01, .02, .02,  0,   0,  0,   0]],
 ['J2',                    [  0, .15, .9,  .05,  0,  .15,  0, -.01, .01, .03, .04, .02,-.01, .1,  0,   0]]];
const LOOKS2_GP = [
 ['Playa',  [.15, .1, 1.2,   0,   0, -.15,-.05,-.01, .02, .04, .02, .02,  0,   0,  0,   0]],
 ['Honey',  [ .1,  0,  1.,  .03,  0,  .35, .05, .03, .02,  0,  .04, .03,-.02,  0, .05,  0]],
 ['Isla',   [ .1,-.15, .85, .08, .03, .1,  .1,  .02, .01, .03, .03, .02,  0,   0,  0,   0]],
 ['Desert', [.05, .05, .85, .05,  0,  .4,  .05, .04, .02,-.01, .04, .02,-.03, .1,  0,   0]],
 ['Clay',   [  0,-.05, .55, .06,  0,  .15,  0,  .02, .01,  0,  .02, .01,  0,   0,  0,   0]],
 ['Palma',  [.05, .25, 1.2,   0,   0,  .2,  .05,  0,   0,  .01, .03, .02,-.01, .1,  0,   0]],
 ['Metro',  [  0, .2,  .7,   0,   0, -.2,   0, -.01,  0,  .03,  0,   0,   0,  .15,  0,  0]],
 ['Eiffel', [  0,-.1,   0,  .06, .03,  0,   0,   0,   0,   0,   0,   0,   0,   0, .05,  0]],
 ['Modena', [  0, .05, .9,  .04,  0,  .12,  0,   0,  .01, .02, .03, .02,  0,  .15,  0,  0]],
 ['Vogue',  [  0, .45,  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  .15,  0,  0]],
 ['Ollie',  [.05,-.1,  .8,  .07,  0, -.05,-.12,  0,  .02, .02, .02, .02,  0,   0,  0,   0]],
 ['Vista',  [ .1, .1,   0,   0,   0,   0,   0,   0,   0,   0,  .02, .01,-.01,  0, .05,  0]]];
const LOOKS2_P = rows => [S('Look', rows.map(r => r[0])), P('Strength', 0, 1, 1, .01), P('Vignette', 0, 2, 1, .05)];

f = add('Insta');
f('ig_stories','Instagram II (Gotham, Apollo, story filters)',LOOKS2_P(LOOKS2_IG),LOOKS2_SHADER(LOOKS2_IG),
  'Gotham (retired: cool high-contrast B&W), Apollo (retired: faded green-cyan vintage) and the city story filters; ' + LOOKS2_NOTE);
f('vsco_presets','VSCO Presets (A6, C1, F2, HB1, M5, KK1, AL3, B1, T1, J2)',LOOKS2_P(LOOKS2_VSCO),LOOKS2_SHADER(LOOKS2_VSCO),
  'VSCO presets from public descriptions (A6 faded analog, C1 bright with pink highlights / blue-green shadows, F2 mellow cool fade, HB1 cool desaturated keeping reds, B1 clean B&W with slight fade, T1 heavy fade); ' + LOOKS2_NOTE);
f('gphotos_filters','Google Photos Filters',LOOKS2_P(LOOKS2_GP),LOOKS2_SHADER(LOOKS2_GP),
  'Google Photos editor filters (Eiffel, Vogue, Vista = monochrome); ' + LOOKS2_NOTE);
