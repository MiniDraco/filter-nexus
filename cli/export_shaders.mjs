// Export every filter's GLSL from index.html to nexus_shaders.json so nexus.py can run them headless.
// index.html stays the single source of truth; rerun this after adding filters:  node cli/export_shaders.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(process.argv[2] || join(here, '..', 'index.html'), 'utf8');  // optional: node export_shaders.mjs <index.html> <out.json>

const between = (start, end) => {
  const a = html.indexOf(start); if (a < 0) throw new Error('marker not found: ' + start);
  const b = html.indexOf(end, a); if (b < 0) throw new Error('marker not found: ' + end);
  return html.slice(a, b);
};
// filter library: pure JS (no DOM / GL) from the param helpers up to BY_ID
const lib = between('const P = (label', 'const BY_ID');
const {FILTERS, CATS, CAT_LABEL} = new Function(lib + '\nreturn {FILTERS, CATS, CAT_LABEL};')();

const tpl = name => { const m = html.match(new RegExp('const ' + name + ' = `([\\s\\S]*?)`;')); if (!m) throw new Error('missing ' + name); return m[1]; };
const aliasesSrc = html.match(/const ALIASES = (\{[\s\S]*?\});\r?\nconst NAMES_COVERED/);

const out = {
  generator: 'Filter Nexus', exported: new Date().toISOString(),
  vs: tpl('VS'), header: tpl('HEADER'), main: tpl('MAIN'),
  categories: CATS.map(c => ({id: c, label: CAT_LABEL[c]})),
  aliases: aliasesSrc ? JSON.parse(aliasesSrc[1]) : {},
  filters: FILTERS.map(f => ({id: f.id, name: f.name, family: CAT_LABEL[f.cat], cat: f.cat, note: f.note, seeded: f.seed,
    params: f.params, passes: f.passes})),
};
writeFileSync(process.argv[3] || join(here, 'nexus_shaders.json'), JSON.stringify(out));
console.log(`exported ${out.filters.length} filters, ${out.filters.reduce((s, f) => s + f.passes.length, 0)} passes`);
