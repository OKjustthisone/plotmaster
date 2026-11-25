const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const cssSource = fs.readFileSync(path.join(projectRoot, 'style.css'), 'utf8');
const context = vm.createContext({
  console,
  window: {},
  setTimeout: () => 0,
  clearInterval: () => {},
  setInterval: () => 0,
});
vm.runInContext(appSource, context, { filename: 'app.js' });

const evaluate = expression => vm.runInContext(expression, context);

// Detection folder scans must accept every supported spreadsheet format.
for (const name of ['a.xlsx', 'b.xls', 'c.xlsm', 'd.xlsb', 'e.ods', 'f.csv', 'g.tsv', 'UPPER.XLSX']) {
  assert.equal(evaluate(`isSpreadsheetFileName(${JSON.stringify(name)})`), true, `Should detect ${name}`);
}
for (const name of ['notes.txt', 'image.png', 'archive.xlsx.tmp', 'noextension', 'data.json', 'prism.prism', '~$report.xlsx']) {
  assert.equal(evaluate(`isSpreadsheetFileName(${JSON.stringify(name)})`), false, `Should ignore ${name}`);
}

assert.equal(evaluate(`getFileExtension('REPORT.XLSM')`), 'xlsm');
assert.equal(evaluate(`getFileExtension('no-dot')`), '');

// Files must be ordered by modified date, newest first, with a stable name tie-break.
const sortedNames = JSON.parse(evaluate(`JSON.stringify(sortWatchFiles([
  { name: 'older.xlsx', lastModified: 100 },
  { name: 'newest.csv', lastModified: 300 },
  { name: 'b-tie.xlsx', lastModified: 200 },
  { name: 'a-tie.xlsx', lastModified: 200 }
]).map(file => file.name))`));
assert.deepEqual(sortedNames, ['newest.csv', 'a-tie.xlsx', 'b-tie.xlsx', 'older.xlsx']);

const signature = evaluate(`getWatchFileSignature([
  { name: 'a.xlsx', lastModified: 10, size: 5 },
  { name: 'b.csv', lastModified: 20, size: 7 }
])`);
assert.equal(signature, 'a.xlsx:10:5|b.csv:20:7');

assert.match(evaluate(`formatWatchFileTimestamp(0)`), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
assert.equal(evaluate(`formatWatchFileTimestamp(NaN)`), '');

// Data source UI contract.
assert.match(htmlSource, /<span>1\. Data Source<\/span>/);
assert.match(htmlSource, /Default Detection Folder/);
assert.doesNotMatch(htmlSource, /1\. Data Import/);
for (const id of [
  'data-source-section', 'watch-folder-row', 'watch-folder-path',
  'watch-file-select', 'watch-folder-hint', 'btn-pick-folder',
  'btn-scan-folder', 'btn-remove-folder', 'upload-zone'
]) {
  assert.match(htmlSource, new RegExp(`id=["']${id}["']`), `Missing HTML control: ${id}`);
}
assert.match(htmlSource, /class="upload-zone upload-zone-compact"/);
assert.match(cssSource, /\.data-source-grid\s*\{/);
assert.match(cssSource, /\.upload-zone-compact\s*\{/);

(async () => {
  // Simulate scanning a directory handle: spreadsheets only, newest first.
  evaluate(`
    globalThis.fakeWatchFolder = {
      name: 'LabData',
      values() {
        const entries = [
          { kind: 'file', name: 'old.xlsx', getFile: async () => ({ lastModified: 100, size: 10 }) },
          { kind: 'file', name: 'notes.txt', getFile: async () => ({ lastModified: 999, size: 1 }) },
          { kind: 'file', name: 'new.CSV', getFile: async () => ({ lastModified: 300, size: 30 }) },
          { kind: 'directory', name: 'nested' },
          { kind: 'file', name: 'mid.xlsm', getFile: async () => ({ lastModified: 200, size: 20 }) }
        ];
        return entries[Symbol.iterator]();
      }
    };
    appState.watchFolderHandle = fakeWatchFolder;
    appState.watchPermission = 'granted';
    appState.watchFiles = [];
    appState.watchFileHandles = new Map();
    appState.watchSignature = '';
  `);

  await evaluate(`scanWatchFolder()`);

  const detected = JSON.parse(evaluate(`JSON.stringify(appState.watchFiles.map(file => file.name))`));
  assert.deepEqual(detected, ['new.CSV', 'mid.xlsm', 'old.xlsx']);
  assert.equal(evaluate(`appState.watchFiles.length`), 3);
  assert.equal(evaluate(`appState.watchPermission`), 'granted');
  assert.equal(evaluate(`appState.watchFileHandles.size`), 3);

  console.log('Data source watch folder tests passed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
