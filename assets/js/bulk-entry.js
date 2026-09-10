(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils, esc = u.escapeHtml, key = App.config.storage.bulkDraftKey;
  const $ = function (selector) { return document.querySelector(selector); };
  let queue = null, lastJson = null, reviewing = false, sheets = [], prepared = [], loadToken = 0, draftTimer, loadError = '';
  function error(message) { const el = reviewing ? $('#itemFormError') : $('#bulkError'); el.textContent = message; el.hidden = false; }
  function persist(next) {
    const current = localStorage.getItem(key);
    if (current !== lastJson) throw new Error('The bulk queue changed in another tab. Pause here and reload before continuing.');
    const json = JSON.stringify(next); if (json.length > 4500000) throw new Error('This review queue is too large to keep on this device. Use a smaller batch.');
    try { localStorage.setItem(key, json); } catch (_) { throw new Error('The review queue could not be saved on this device. Free some browser storage before continuing.'); }
    lastJson = json; queue = next; loadError = '';
  }
  function load() {
    try {
      lastJson = localStorage.getItem(key); if (!lastJson) return;
      if (lastJson.length > 4500000) throw new Error();
      const data = JSON.parse(lastJson);
      if (typeof data.name !== 'string' || data.version !== 1 || !Array.isArray(data.rows) || data.rows.length > 500 || data.rows.some(function (r) { return !r || !Number.isInteger(r.row) || typeof r.source !== 'string' || typeof r.id !== 'string' || !r.id.startsWith('bulk-') || !r.draft || typeof r.draft.name !== 'string' || !Array.isArray(r.draft.properties) || r.draft.properties.some(function (p) { return !p || typeof p.name !== 'string' || typeof p.value !== 'string'; }) || !Array.isArray(r.draft.categories) || r.draft.categories.some(function (tag) { return typeof tag !== 'string'; }) || (r.draft._smartManual && !Array.isArray(r.draft._smartManual)) || !Array.isArray(r.suggestions) || !Array.isArray(r.warnings) || !['pending', 'saved', 'skipped'].includes(r.status); })) throw new Error();
      queue = data;
    } catch (_) { loadError = 'The saved review queue could not be read. Your inventory is unchanged. Load the source spreadsheet to start a new batch.'; error(loadError); }
  }
  function row() { return reviewing ? queue?.rows.find(function (r) { return r.status === 'pending'; }) : null; }
  function reconcile() {
    if (!queue) return;
    const ids = new Set(App.storage.getState().inventory.items.map(function (item) { return item.id; }));
    if (queue.rows.some(function (r) { return r.status !== 'saved' && ids.has(r.id); })) {
      if (!App.storage.saveNow()) throw new Error('A reviewed object has not reached browser storage yet. Keep this page open and try again after freeing storage.');
      const next = u.clone(queue); next.rows.forEach(function (r) { if (ids.has(r.id)) r.status = 'saved'; }); persist(next);
    }
  }
  function renderStatus() {
    const pending = queue?.rows.filter(function (r) { return r.status === 'pending'; }).length || 0;
    const saved = queue?.rows.filter(function (r) { return r.status === 'saved'; }).length || 0;
    const skipped = queue?.rows.filter(function (r) { return r.status === 'skipped'; }).length || 0;
    $('#bulkQueueStatus').textContent = queue ? queue.name + ' · ' + saved + ' saved · ' + pending + ' awaiting review · ' + skipped + ' skipped' : 'Load a spreadsheet or paste cells. Nothing enters your inventory until you save each object.';
    $('#resumeBulkButton').hidden = !pending; $('#reviewSkippedButton').hidden = !skipped;
    $('#bulkEntryButton').textContent = pending ? 'Bulk Entry (' + pending + ')' : 'Bulk Entry';
  }
  function show() {
    reviewing = false; $('#bulkError').hidden = true; if (loadError) error(loadError);
    try { reconcile(); } catch (e) { error(e.message); }
    renderStatus(); App.components.openDialog('#bulkDialog', { trigger: $('#bulkEntryButton'), focus: queue?.rows.some(function (r) { return r.status === 'pending'; }) ? '#resumeBulkButton' : '#bulkFile' });
  }
  function renderReview() {
    const current = row(); if (!current) return;
    const index = queue.rows.indexOf(current), count = queue.rows.length;
    const matches = App.storage.getState().inventory.items.filter(function (item) { return item.id !== current.id && item.name.toLowerCase() === current.draft.name.toLowerCase(); }).length;
    $('#bulkReviewInfo').innerHTML = '<strong>Review ' + (index + 1) + ' of ' + count + ' · Spreadsheet Row ' + esc(current.row) + (current.copy ? ' · Copy ' + esc(current.copy) : '') + '</strong>' +
      (current.suggestions.length ? '<p>Suggestions to check: ' + esc(current.suggestions.join(' · ')) + '</p>' : '<p>Check the imported details before saving.</p>') +
      (current.warnings.length ? '<p class="inventory-error">' + esc(current.warnings.join(' · ')) + '</p>' : '') +
      (matches ? '<p>' + matches + ' matching object name' + (matches === 1 ? ' is' : 's are') + ' already in your inventory. Check whether this is another copy.</p>' : '') +
      '<details><summary>Original Row</summary><pre>' + esc(current.source) + '</pre></details>';
  }
  function advance() {
    clearTimeout(draftTimer); reconcile();
    reviewing = true;
    if (!row()) { reviewing = false; App.components.closeDialog('#itemDialog', 'saved'); show(); return; }
    App.components.closeDialog('#bulkDialog');
    if (!row().draft._smartEntry && !row().draft._reviewed) row().draft._smartEntry = row().source;
    App.inventoryUI.openDraft(row().draft, $('#bulkEntryButton'));
    renderReview(); renderStatus();
  }
  function saveDraft() {
    clearTimeout(draftTimer); const current = row(); if (!current) return;
    const next = u.clone(queue); next.rows.find(function (r) { return r.id === current.id; }).draft = App.inventoryUI.captureDraft(); persist(next);
  }
  function pause() { saveDraft(); reviewing = false; App.components.closeDialog('#itemDialog', 'paused'); renderStatus(); }
  function skip() {
    try { saveDraft(); const current = row(), next = u.clone(queue); next.rows.find(function (r) { return r.id === current.id; }).status = 'skipped'; persist(next); advance(); } catch (e) { error(e.message); }
  }
  function accept(item) {
    saveDraft(); const current = row(); if (!current) throw new Error('No bulk row is being reviewed.');
    const nextItem = App.inventoryModel.normalizeItem(Object.assign({}, item, { id: current.id, archive: null }));
    const existing = App.storage.getState().inventory.items.find(function (i) { return i.id === current.id; });
    if (existing && JSON.stringify(existing) !== JSON.stringify(nextItem)) throw new Error('This queued object has already been saved. Pause and resume to continue, then edit it from your inventory if needed.');
    if (!existing) {
      if (App.storage.getState().inventory.items.length >= 5000) throw new Error('The inventory has reached its 5,000-item limit.');
      App.storage.mutate(function (state) { state.inventory.items.push(nextItem); }, { reason: 'inventory-save' });
    }
    if (!App.storage.saveNow()) throw new Error('This object is only in memory because browser storage failed. Keep this page open and try saving again.');
    const next = u.clone(queue); next.rows.find(function (r) { return r.id === current.id; }).status = 'saved'; persist(next); advance();
  }
  function sheet() { return sheets[Number($('#bulkSheet').value)] || sheets[0]; }
  function preview() {
    $('#bulkError').hidden = true; prepared = [];
    try {
      const source = sheet(); if (!source) return;
      const columns = Array.from(document.querySelectorAll('[data-bulk-column]')).map(function (el) { return el.value; });
      prepared = App.bulkImport.prepare(source.rows, $('#bulkHeaders').checked, columns, App.storage.getState().inventory.items);
      $('#bulkPreview').innerHTML = '<p>' + prepared.length + (prepared.length === 1 ? ' object ready' : ' objects ready') + ' for individual review. Tags, location, and property suggestions remain editable.</p><ol>' + prepared.slice(0, 5).map(function (r) { return '<li>' + esc(r.draft.name || '(Needs an object name)') + '<small>' + esc(r.suggestions.join(' · ')) + '</small></li>'; }).join('') + '</ol>';
    } catch (e) { error(e.message); $('#bulkPreview').textContent = ''; }
    $('#startBulkReview').disabled = !prepared.length;
  }
  function columns() {
    const source = sheet(); if (!source) return;
    const headers = $('#bulkHeaders').checked;
    const values = App.bulkImport.mapping(source.rows[0] || []);
    $('#bulkColumns').hidden = !headers;
    $('#bulkColumns').innerHTML = headers ? '<summary>Column Mapping</summary><div class="bulk-column-grid">' + (source.rows[0] || []).map(function (name, index) {
      return '<label class="field"><span>' + esc(name || 'Column ' + (index + 1)) + '</span><select data-bulk-column>' + Object.keys(App.bulkImport.labels).map(function (key) { return '<option value="' + key + '"' + (key === values[index] ? ' selected' : '') + '>' + App.bulkImport.labels[key] + '</option>'; }).join('') + '</select></label>';
    }).join('') + '</div>' : '';
    preview();
  }
  function chooseSheet() { $('#bulkHeaders').checked = App.bulkImport.hasHeaders(sheet()?.rows[0] || []); columns(); }
  function loaded(result) {
    sheets = result.filter(function (s) { return s.rows.length; }); if (!sheets.length) throw new Error('The spreadsheet has no object rows.');
    $('#bulkSheet').innerHTML = sheets.map(function (s, i) { return '<option value="' + i + '">' + esc(s.name) + '</option>'; }).join('');
    $('#bulkSourceOptions').hidden = false; chooseSheet();
  }
  async function start() {
    try {
      preview(); if (!prepared.length) return;
      if (queue?.rows.some(function (r) { return r.status !== 'saved'; }) && !await App.components.confirm({ title: 'Replace the Pending Review Queue?', message: 'The new batch contains ' + prepared.length + ' objects. Existing pending and skipped rows will be replaced; saved inventory stays unchanged.', confirmLabel: 'Start New Batch', trigger: $('#startBulkReview') })) return;
      persist({ version: 1, name: sheet().name, rows: u.clone(prepared) }); advance();
    } catch (e) { error(e.message); }
  }
  function init() {
    $('#addItemButton').insertAdjacentHTML('beforebegin', '<button id="bulkEntryButton" class="button" type="button">Bulk Entry</button>');
    document.body.insertAdjacentHTML('beforeend', `<dialog id="bulkDialog" class="app-dialog" aria-labelledby="bulkTitle"><div class="dialog-shell"><header class="dialog-header"><h2 id="bulkTitle">Bulk Entry</h2><button type="button" class="icon-button" data-close-dialog="bulkDialog" aria-label="Close Bulk Entry">${App.icons.markup('close')}</button></header><div class="dialog-body">
      <p id="bulkQueueStatus" role="status"></p><div class="button-row"><button id="resumeBulkButton" class="button primary" type="button" hidden>Resume Review</button><button id="reviewSkippedButton" class="button" type="button" hidden>Review Skipped</button></div>
      <p id="bulkError" class="inventory-error" role="alert" hidden></p>
      <label class="field"><span>Spreadsheet</span><input id="bulkFile" type="file" accept=".xlsx,.csv,.tsv,.txt"><small>XLSX, CSV, or TSV · Up to 500 objects per batch. Prices and values are per object. Pending reviews stay on this device.</small></label>
      <label class="field bulk-paste"><span>Or Paste Cells</span><textarea id="bulkPaste" rows="4" maxlength="4000000" placeholder="Paste rows copied from your spreadsheet"></textarea></label><button id="readBulkPaste" type="button" class="button small">Read Pasted Rows</button>
      <div id="bulkSourceOptions" hidden><label class="field"><span>Worksheet</span><select id="bulkSheet"></select></label><label class="bulk-header-choice"><input id="bulkHeaders" type="checkbox"> First Row Contains Headings</label><details id="bulkColumns"></details><div id="bulkPreview"></div></div>
      </div><footer class="dialog-footer"><button type="button" class="button" data-close-dialog="bulkDialog">Close</button><button id="startBulkReview" type="button" class="button primary" disabled>Start Review</button></footer></div></dialog>`);
    const smart = $('#itemForm .smart-entry'), smartTools = document.createElement('details');
    smartTools.id = 'bulkSmartTools'; smartTools.open = true;
    smartTools.innerHTML = '<summary hidden>Smart Complete (Optional)</summary>';
    smart.before(smartTools); smartTools.appendChild(smart);
    $('#itemForm .dialog-body').insertAdjacentHTML('afterbegin', '<section id="bulkReviewInfo" class="bulk-review-info" hidden></section>');
    $('#saveItemButton').insertAdjacentHTML('beforebegin', '<button id="skipBulkRow" type="button" class="button" hidden>Skip</button>');
    $('#bulkEntryButton').addEventListener('click', show); $('#resumeBulkButton').addEventListener('click', function () { try { advance(); } catch (e) { error(e.message); } });
    $('#reviewSkippedButton').addEventListener('click', function () { try { const next = u.clone(queue); next.rows.forEach(function (r) { if (r.status === 'skipped') r.status = 'pending'; }); persist(next); advance(); } catch (e) { error(e.message); } });
    $('#skipBulkRow').addEventListener('click', skip); $('#startBulkReview').addEventListener('click', start);
    $('#bulkFile').addEventListener('change', async function () { const token = ++loadToken, file = this.files[0]; if (!file) return; $('#startBulkReview').disabled = true; $('#bulkError').hidden = true; try { const result = await App.spreadsheetRead.read(file); if (token === loadToken) loaded(result); } catch (e) { if (token === loadToken) { sheets = []; prepared = []; $('#bulkSourceOptions').hidden = true; error(e.message); } } });
    $('#readBulkPaste').addEventListener('click', function () { loadToken++; try { loaded([{ name: 'Pasted Rows', rows: App.bulkImport.parseDelimited($('#bulkPaste').value) }]); } catch (e) { sheets = []; prepared = []; $('#bulkSourceOptions').hidden = true; $('#startBulkReview').disabled = true; error(e.message); } });
    $('#bulkSheet').addEventListener('change', chooseSheet); $('#bulkHeaders').addEventListener('change', columns); $('#bulkColumns').addEventListener('change', preview);
    $('#itemForm').addEventListener('input', function () { if (!reviewing) return; clearTimeout(draftTimer); draftTimer = setTimeout(function () { try { saveDraft(); } catch (e) { error(e.message); } }, 180); });
    window.addEventListener('beforeunload', function () { if (reviewing) { try { saveDraft(); } catch (_) { /* The explicit save/pause actions report failures. */ } } });
    window.addEventListener('app:statechange', function (event) { if (event.detail.reason === 'erase-all') { queue = null; lastJson = null; reviewing = false; renderStatus(); } });
    load(); renderStatus();
  }
  App.bulkEntry = { init: init, current: row, accept: accept, pause: pause, show: show };
})();
