// scripts/make_zip_centroids.cjs
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');
const d3geo = require('d3-geo');

const candidates = [
  'public/data/boundaries/zctas_2020_simplified.topo.json',
  'data/boundaries/zctas_2020_simplified.topo.json'
];

const inPath = candidates.find(p => fs.existsSync(p));
if (!inPath) {
  console.error('❌ Could not find zctas_2020_simplified.topo.json in any of:');
  candidates.forEach(p => console.error('   - ' + path.resolve(p)));
  process.exit(1);
}

const outPath = 'public/data/zcta_centroids.csv';
console.log('✅ Using input:', path.resolve(inPath));

const topo = JSON.parse(fs.readFileSync(inPath, 'utf8'));

// Your layer + id field per your -info output
const obj = topo.objects.cb_2020_us_zcta520_500k || Object.values(topo.objects)[0];
const features = topojson.feature(topo, obj).features;

let rows = ['geoid,x,y'];
for (const f of features) {
  const z = String((f.properties && (f.properties.ZCTA5 || f.properties.GEOID || f.properties.GEOID10)) || f.id || '').padStart(5,'0');
  if (!z || z === '00000') continue;
  const [x, y] = d3geo.geoCentroid(f); // lon, lat
  if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
  rows.push(`${z},${x},${y}`);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, rows.join('\n'));
console.log(`✅ Wrote ${rows.length - 1} centroids → ${path.resolve(outPath)}`);
