// Run targeted test files or all non-browser tests; retain full output in a temp log.
import {readdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const requested=process.argv.slice(2);
const files=requested.length?requested:readdirSync('tests').filter(file=>file.endsWith('.test.mjs') && file!=='browser.test.mjs').map(file=>'tests/'+file);
if (files.some(file=>!file.endsWith('.test.mjs') || file.startsWith('-'))) {
  console.error('Usage: node scripts/verify.mjs [tests/name.test.mjs ...]'); process.exit(1);
}
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...files.map(file=>resolve(file))],{encoding:'utf8',maxBuffer:32*1024*1024});
const log=join(mkdtempSync(join(tmpdir(),'my-stuff-check-')),'results.log');
const output=(result.stdout||'')+(result.stderr||'')+(result.error?String(result.error):'');
writeFileSync(log,output);
console.log(output.split('\n').filter(line=>/^# (tests|pass|fail|skipped|duration_ms) /.test(line)).join('\n'));
console.log('Full log: '+log);
if (result.status!==0) {
  const failures=output.match(/^not ok[^\n]*\n(?:[ \t]+[^\n]*\n)*/gm);
  console.error(failures?failures.join('\n').slice(0,8000):output.slice(-3000)); process.exitCode=1;
}
