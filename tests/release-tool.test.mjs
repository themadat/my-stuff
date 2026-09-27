import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {prepareRelease} from '../scripts/release.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const readConfig=source=>{const c=vm.createContext({window:{LocalApp:{}}});vm.runInContext(source,c);return c.window.LocalApp.config;};
const current=readConfig(readFileSync(join(root,'assets/js/config.js'),'utf8'));
const parts=current.identity.version.split('.').map(Number);parts[3]++;
const entry={version:parts.join('.'),date:'2026-09-26T23:59:00.000Z',title:'Test release',summary:'Fixture only',features:[],improvements:[],fixes:['Example'],knownIssues:[]};

test('release preparation aligns all surfaces and preserves history without writing',()=>{
 const before=readFileSync(join(root,'assets/js/config.js'),'utf8');
 const changes=prepareRelease(root,entry);assert.equal(changes.size,6);
 const next=readConfig(changes.get('assets/js/config.js'));
 assert.equal(next.identity.version,entry.version);assert.equal(next.identity.buildId,entry.version);
 assert.equal(next.releases[0].title,entry.title);
 assert.equal(JSON.stringify(next.releases.slice(1)),JSON.stringify(current.releases));
 for(const [file,text] of changes) if(file!=='assets/js/config.js') {
  assert.ok(text.includes(entry.version));assert.ok(!text.includes(current.identity.version));
 }
 assert.equal(readFileSync(join(root,'assets/js/config.js'),'utf8'),before);
});

test('release preparation rejects invalid metadata and mismatched surfaces before writes',()=>{
 assert.throws(()=>prepareRelease(root,{...entry,version:current.identity.version}),/Expected next build/);
 assert.throws(()=>prepareRelease(root,{...entry,fixes:'bad'}),/string array/);
 const temp=mkdtempSync(join(tmpdir(),'release-test-'));
 try {
  for(const file of ['assets/js/config.js','index.html']) {
   mkdirSync(dirname(join(temp,file)),{recursive:true});writeFileSync(join(temp,file),readFileSync(join(root,file)));
  }
  writeFileSync(join(temp,'index.html'),'Wrong v99.0.0.1');
  assert.throws(()=>prepareRelease(temp,entry),/mismatched version/);
  assert.equal(readFileSync(join(temp,'index.html'),'utf8'),'Wrong v99.0.0.1');
 } finally {rmSync(temp,{recursive:true,force:true});}
});

test('release CLI previews without writes and applies only the validated release',()=>{
 const temp=mkdtempSync(join(tmpdir(),'release-cli-'));
 try {
  const files=['assets/js/config.js','index.html','sw.js','manifest.webmanifest','manifest-dark.webmanifest','.github/workflows/deploy-pages.yml'];
  for(const file of files) {mkdirSync(dirname(join(temp,file)),{recursive:true});writeFileSync(join(temp,file),readFileSync(join(root,file)));}
  writeFileSync(join(temp,'release.json'),JSON.stringify(entry));
  const run=(...args)=>spawnSync(process.execPath,[join(root,'scripts/release.mjs'),'release.json',...args],{cwd:temp,encoding:'utf8'});
  const dry=run();assert.equal(dry.status,0,dry.stderr);assert.match(dry.stdout,/Dry run/);
  assert.equal(readConfig(readFileSync(join(temp,'assets/js/config.js'),'utf8')).identity.version,current.identity.version);
  const applied=run('--write');assert.equal(applied.status,0,applied.stderr);
  assert.equal(readConfig(readFileSync(join(temp,'assets/js/config.js'),'utf8')).identity.version,entry.version);
  const repeated=run('--write');assert.notEqual(repeated.status,0);assert.match(repeated.stderr,/Expected next build/);
 } finally {rmSync(temp,{recursive:true,force:true});}
});
