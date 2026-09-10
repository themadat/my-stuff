(function () {
  "use strict";
  const App = window.LocalApp, decoder = new TextDecoder();
  const MAX_BYTES = 8 * 1024 * 1024, MAX_XML = 16 * 1024 * 1024;
  function xml(text) {
    if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('Unsupported XML in workbook. Export it as CSV.');
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('The workbook XML is damaged. Export it as CSV.'); return doc;
  }
  const nodes = function (root, name) { return Array.from(root.getElementsByTagNameNS('*', name)); };
  async function unzip(buffer) {
    const bytes = new Uint8Array(buffer), view = new DataView(buffer), files = new Map();
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) { if (view.getUint32(i, true) === 0x06054b50) { end = i; break; } }
    if (end < 0) throw new Error('This is not a supported XLSX workbook. Use XLSX, CSV, or TSV.');
    const count = view.getUint16(end + 10, true); let cursor = view.getUint32(end + 16, true), total = 0;
    if (count > 1000) throw new Error('This workbook has too many internal files. Export the desired sheet as CSV.');
    for (let i = 0; i < count; i++) {
      if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Workbook directory is damaged.');
      const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true), compressed = view.getUint32(cursor + 20, true), size = view.getUint32(cursor + 24, true), nameSize = view.getUint16(cursor + 28, true), extra = view.getUint16(cursor + 30, true), comment = view.getUint16(cursor + 32, true), offset = view.getUint32(cursor + 42, true);
      const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameSize)); cursor += 46 + nameSize + extra + comment;
      if (flags & 1) throw new Error('Password-protected workbooks are unsupported. Export an unprotected CSV.');
      if (!/^xl\/(?:workbook.xml|_rels\/workbook.xml.rels|sharedStrings.xml|styles.xml|worksheets\/[^/]+.xml)$/.test(name)) continue;
      total += size; if (size > MAX_XML || total > 40 * 1024 * 1024) throw new Error('The expanded workbook is too large. Export a smaller sheet as CSV.');
      if (offset + 30 > bytes.length || view.getUint32(offset, true) !== 0x04034b50) throw new Error('Workbook entry is damaged.');
      const start = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true);
      if (start + compressed > bytes.length) throw new Error('Workbook entry is incomplete.');
      let output;
      if (method === 0) output = bytes.slice(start, start + compressed);
      else if (method === 8) {
        if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot read XLSX files. Export the sheet as CSV or paste its cells.');
        const reader = new Blob([bytes.subarray(start, start + compressed)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
        const chunks = []; let length = 0;
        while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > size || length > MAX_XML) { await reader.cancel(); throw new Error('Workbook exceeds its declared size.'); } chunks.push(part.value); }
        output = new Uint8Array(length); let pos = 0; chunks.forEach(function (chunk) { output.set(chunk, pos); pos += chunk.length; });
      } else throw new Error('Unsupported workbook compression. Export it as CSV.');
      if (output.length !== size) throw new Error('Workbook entry size does not match.');
      files.set(name, decoder.decode(output));
    }
    return files;
  }
  async function readXlsx(buffer) {
    const files = await unzip(buffer);
    if (!files.has('xl/workbook.xml') || !files.has('xl/_rels/workbook.xml.rels')) throw new Error('Missing workbook information.');
    const workbook = xml(files.get('xl/workbook.xml')), relations = xml(files.get('xl/_rels/workbook.xml.rels'));
    const shared = files.has('xl/sharedStrings.xml') ? nodes(xml(files.get('xl/sharedStrings.xml')), 'si').map(function (si) { return nodes(si, 't').map(function (t) { return t.textContent; }).join(''); }) : [];
    let dateStyles = [];
    if (files.has('xl/styles.xml')) {
      const styles = xml(files.get('xl/styles.xml')), formats = new Map(nodes(styles, 'numFmt').map(function (node) { return [Number(node.getAttribute('numFmtId')), node.getAttribute('formatCode')]; }));
      const xfs = nodes(styles, 'cellXfs')[0];
      dateStyles = xfs ? nodes(xfs, 'xf').map(function (node) { const id = Number(node.getAttribute('numFmtId')); return (id >= 14 && id <= 22) || /[dy]/i.test((formats.get(id) || '').replace(/"[^"]*"|\[[^\]]*\]|\\./g, '')); }) : [];
    }
    const uses1904 = ['1', 'true'].includes(nodes(workbook, 'workbookPr')[0]?.getAttribute('date1904'));
    const sheets = nodes(workbook, 'sheet'); if (sheets.length > 50) throw new Error('Use a workbook with at most 50 sheets.');
    return sheets.map(function (sheet) {
      const id = sheet.getAttribute('r:id') || sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      const relation = nodes(relations, 'Relationship').find(function (r) { return r.getAttribute('Id') === id; });
      if (!relation || relation.getAttribute('TargetMode') === 'External') throw new Error('External workbook sheets cannot be imported.');
      const path = new URL(relation.getAttribute('Target'), 'https://workbook.invalid/xl/workbook.xml').pathname.slice(1);
      if (!path.startsWith('xl/worksheets/') || !files.has(path)) throw new Error('Missing worksheet.');
      const doc = xml(files.get(path)), rows = [];
      for (const row of nodes(doc, 'row')) {
        const cells = []; for (const cell of nodes(row, 'c')) {
          const ref = cell.getAttribute('r') || '', letters = /^[A-Z]+/.exec(ref)?.[0];
          let column = letters ? 0 : cells.length + 1; if (letters) for (const c of letters) column = column * 26 + c.charCodeAt(0) - 64;
          const raw = nodes(cell, 'v')[0]?.textContent || '', type = cell.getAttribute('t');
          let value = type === 's' ? shared[Number(raw)] || '' : type === 'inlineStr' ? nodes(cell, 't').map(function (t) { return t.textContent; }).join('') : raw;
          if (type === 'd' && /^\d{4}-\d{2}-\d{2}T/.test(value)) value = value.slice(0, 10);
          if (!value && nodes(cell, 'f').length) value = '[Formula has no cached value]';
          if (value && type !== 's' && type !== 'inlineStr' && dateStyles[Number(cell.getAttribute('s'))] && Number.isFinite(Number(value))) {
            const serial = Math.floor(Number(value));
            if (!uses1904 && serial === 60) value = 'Invalid Excel date (1900-02-29)';
            else { const epoch = uses1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31); const milliseconds = epoch + (serial - (!uses1904 && serial > 60 ? 1 : 0)) * 86400000; const d = new Date(milliseconds); value = Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : value; }
          }
          if (column > 80 && value.trim()) throw new Error('Use up to 80 columns per sheet.');
          if (column <= 80) cells[column - 1] = value;
        }
        if (cells.some(function (value) { return value?.trim(); })) { rows.push(Array.from({ length: cells.length }, function (_, i) { return cells[i] || ''; })); if (rows.length > 501) throw new Error('Review up to 500 rows per sheet. Split the spreadsheet into smaller batches.'); }
      }
      return { name: sheet.getAttribute('name') || 'Sheet', rows: rows };
    }).filter(function (sheet) { return sheet.rows.length; });
  }
  async function read(file) {
    if (file.size > MAX_BYTES) throw new Error('Use a spreadsheet under 8 MB.');
    if (/\.xlsx$/i.test(file.name)) return readXlsx(await file.arrayBuffer());
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) throw new Error('Choose XLSX, CSV, or TSV. Export older XLS files first.');
    return [{ name: file.name, rows: App.bulkImport.parseDelimited(await file.text()) }];
  }
  App.spreadsheetRead = { read: read, readXlsx: readXlsx };
})();
