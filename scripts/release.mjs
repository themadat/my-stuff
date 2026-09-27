// Usage: node scripts/release.mjs /path/to/release.json [--write]
// Dry-run by default. No commits, pushes, or runtime dependencies.
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';

export function prepareRelease(root, release) {
  const read = file => readFileSync(resolve(root, file), 'utf8');
  const source = read('assets/js/config.js');
  const context = vm.createContext({window:{LocalApp:{}}});
  vm.runInContext(source, context);
  const config = context.window.LocalApp.config, current = config.identity.version;
  if (config.identity.buildId !== current || config.releases[0].version !== current) throw new Error('Current config versions are not aligned.');
  const parts = current.split('.').map(Number); parts[3]++;
  const next = parts.join('.');
  if (release.version !== next) throw new Error('Expected next build '+next);
  for (const key of ['title','summary','date']) if (typeof release[key] !== 'string' || !release[key].trim()) throw new Error('Missing '+key);
  if (!Number.isFinite(Date.parse(release.date))) throw new Error('Invalid release date');
  for (const key of ['features','improvements','fixes','knownIssues']) if (!Array.isArray(release[key]) || release[key].some(value=>typeof value !== 'string')) throw new Error('Expected string array: '+key);
  const entry = Object.fromEntries(['version','date','title','summary','features','improvements','fixes','knownIssues'].map(key=>[key,release[key]]));
  let updated = source;
  for (const key of ['version','buildId']) {
    const token = `${key}: "${current}"`;
    if (!updated.includes(token)) throw new Error('Missing identity '+key);
    updated = updated.replace(token, `${key}: "${next}"`);
  }
  const marker = 'releases: [';
  if (!updated.includes(marker)) throw new Error('Missing release list');
  updated = updated.replace(marker, marker+JSON.stringify(entry, null, 2)+', ');
  const changes = new Map([['assets/js/config.js',updated]]);
  for (const file of ['index.html','sw.js','manifest.webmanifest','manifest-dark.webmanifest','.github/workflows/deploy-pages.yml']) {
    const text = read(file), versions = text.match(/\d+\.\d+\.\d+\.\d+/g) || [];
    if (!versions.length || versions.some(version=>version!==current)) throw new Error('Missing or mismatched version in '+file);
    changes.set(file,text.replaceAll(current,next));
  }
  return changes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [input, flag, ...extra] = process.argv.slice(2);
    if (!input || (flag && flag!=='--write') || extra.length) throw new Error('Usage: node scripts/release.mjs release.json [--write]');
    const release = JSON.parse(readFileSync(resolve(input),'utf8'));
    const changes = prepareRelease(process.cwd(),release);
    if (flag==='--write') for (const [file,text] of changes) writeFileSync(file,text);
    console.log(`${flag==='--write'?'Updated':'Dry run:'} ${release.version}; ${changes.size} aligned files. Run verification before publishing.`);
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
