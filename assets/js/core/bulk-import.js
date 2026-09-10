(function () {
  "use strict";
  const App = window.LocalApp, m = App.inventoryModel, u = App.utils;
  const aliases = {
    raw: ["entry", "purchase", "purchase line", "smart complete", "raw"], name: ["object", "item", "item name", "name", "product", "description", "product description"],
    source: ["seller", "store", "source", "retailer", "merchant"], brand: ["brand", "manufacturer"], obtainedDate: ["date", "date obtained", "obtained date", "purchase date", "purchased on"],
    price: ["price", "cost", "amount", "paid", "obtaining price", "purchase price"], value: ["value", "current value", "estimated value"],
    categories: ["tags", "tag", "categories", "category"], zone: ["zone"], room: ["room", "location"], space: ["space"], color: ["color", "colour"],
    owner: ["owner", "belongs to", "ownership"], obtainedHow: ["method", "obtained", "obtained how", "how obtained"], quantity: ["quantity", "qty", "copies", "count"], description: ["notes", "note", "comments"]
  };
  const labels = { ignore: "Ignore", raw: "Smart Complete", name: "Object", source: "Seller", brand: "Brand", obtainedDate: "Date Obtained", price: "Price per Object", value: "Value per Object", categories: "Tags", zone: "Zone", room: "Room", space: "Space", color: "Color", owner: "Belongs to", obtainedHow: "Obtained", quantity: "Copies", description: "Notes", property: "Custom Property" };
  function heading(value) { return String(value).trim().toLowerCase().replace(/[_-]+/g, " "); }
  function mapping(row) { return row.map(function (cell) { return Object.keys(aliases).find(function (key) { return aliases[key].includes(heading(cell)); }) || "description"; }); }
  function hasHeaders(row) { return row.some(function (cell) { return Object.values(aliases).some(function (values) { return values.includes(heading(cell)); }); }); }
  function parseDelimited(text) {
    if (text.length > 4000000) throw new Error("Use a file or paste under 4 MB.");
    text = text.replace(/^\uFEFF/, "");
    // Count delimiters outside quotes on the first logical record.
    const counts = { "\t": 0, ",": 0, ";": 0 }; let quoted = false;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted; } else if (!quoted) { if (c === '\n' || c === '\r') break; if (c in counts) counts[c]++; } }
    const delimiter = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    const rows = []; let row = [], cell = ""; quoted = false;
    function finish() { row.push(cell); cell = ""; if (row.some(function (v) { return v.trim(); })) rows.push(row); row = []; if (rows.length > 501) throw new Error("Review up to 500 spreadsheet rows per batch."); }
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"' && (quoted || !cell)) { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
      else if (!quoted && c === delimiter) { row.push(cell); cell = ""; if (row.length >= 80) throw new Error("Use up to 80 columns."); }
      else if (!quoted && (c === '\r' || c === '\n')) { if (c === '\r' && text[i + 1] === '\n') i++; finish(); }
      else cell += c;
    }
    if (quoted) throw new Error("A quoted cell is unfinished. Check the spreadsheet export.");
    finish(); return rows;
  }
  function date(value) {
    const text = String(value).trim(), parts = text.split('/');
    const iso = parts.length === 3 ? (parts[2].length === 2 ? '20' + parts[2] : parts[2]) + '-' + parts[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0') : text;
    return m.dateOnly(iso);
  }
  function amount(value) {
    const text = String(value).trim().replace(/^\(\$?([\d,.]+)\)$/, '$1').replace(/^\$/, '').replace(/,/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error("Check the amount");
    return m.amount(text);
  }
  function infer(draft, locked) {
    const suggested = [], text = [draft.name, draft.brand, draft.description].join(' ').toLowerCase();
    function property(name, value) {
      if (!draft.properties.some(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })) { draft.properties.push({ name: name, value: value, unit: '' }); suggested.push(name + ': ' + value); }
    }
    const tags = [];
    App.config.inventory.tagGroups.forEach(function (group) { group.tags.forEach(function (tag) {
      const word = tag.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('\\b' + word + (word.endsWith('s') ? '?': 's?') + '\\b').test(text)) tags.push(tag);
    }); });
    App.config.inventory.bulkSuggestions.forEach(function (rule) {
      if (!new RegExp(rule.match, 'i').test(text)) return;
      tags.push.apply(tags, rule.tags || []);
      if (!locked.has('room') && !draft.room && rule.room) {
        draft.room = rule.room; suggested.push('Room: ' + rule.room);
        const location = App.config.inventory.locations.find(function (l) { return l.room === rule.room; });
        if (!locked.has('zone') && location) property('Zone', location.zone);
        if (!locked.has('space') && rule.space) property('Space', rule.space);
      }
    });
    if (draft.brand && App.config.inventory.tagGroups.find(function (g) { return g.name === 'Brands'; }).tags.some(function (tag) { return tag.toLowerCase() === draft.brand.toLowerCase(); })) tags.push(draft.brand);
    const added = m.tags(tags).filter(function (tag) { return !draft.categories.some(function (old) { return old.toLowerCase() === tag.toLowerCase(); }); });
    if (!locked.has('categories')) { draft.categories = m.tags(draft.categories.concat(added)); added.forEach(function (tag) { const group = App.config.inventory.tagGroups.find(function (g) { return g.tags.includes(tag); }); suggested.push(tag + (group ? ' (' + group.name + ')' : ' (Preset)')); }); }
    if (!locked.has('color')) {
      const color = App.config.inventory.commonProperties[0].values.find(function (v) { return new RegExp('\\b' + v.toLowerCase() + '\\b').test(text); });
      if (color) property('Color', color);
    }
    const size = /\bsize\s*[:=]?\s*(\d+(?:\.\d+)?|xs|s|m|l|xl|xxl)\b/i.exec(text);
    if (size) property('Size', size[1]);
    for (const spec of [{ name: 'Weight', pattern: /\b(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs)\b/i }, { name: 'Length', pattern: /\b(\d+(?:\.\d+)?)\s*(cm|mm|ft|feet|inches)\b/i }]) {
      const found = spec.pattern.exec(text);
      if (found && !draft.properties.some(function (p) { return p.name.toLowerCase() === spec.name.toLowerCase(); })) { draft.properties.push({ name: spec.name, value: found[1], unit: found[2] }); suggested.push(spec.name + ': ' + found[1] + ' ' + found[2]); }
    }
    return suggested;
  }
  function prepare(rows, headers, columns, items) {
    const output = [], names = headers ? rows[0] : [], records = headers ? rows.slice(1) : rows;
    const brands = App.config.inventory.brands.concat((items || []).flatMap(function (item) { return item.properties.filter(function (p) { return p.name.toLowerCase() === 'brand'; }).map(function (p) { return p.value; }); }));
    records.forEach(function (row, index) {
      if (!row.some(function (cell) { return String(cell).trim(); })) return;
      const source = row.map(String).join('\t'); if (source.length > 12000) throw new Error('Row ' + (index + 1) + ' is too long. Split it into smaller entries.');
      const mapped = {}, notes = [], properties = [], locked = new Set(), warnings = [];
      if (headers) row.forEach(function (value, column) {
        value = String(value).trim(); if (!value) return;
        const key = columns[column] || 'description';
        if (key === 'ignore') return;
        if (key === 'property') { properties.push({ name: u.cleanLine(names[column] || 'Property ' + (column + 1), 60), value: value, unit: '' }); return; }
        if (key === 'description') notes.push((names[column] ? names[column] + ': ' : '') + value);
        else { mapped[key] = mapped[key] ? mapped[key] + ' ' + value : value; locked.add(key); }
      });
      const parsed = App.smartEntry.parse(headers ? mapped.raw || mapped.name || '' : source, brands.concat(mapped.brand || [])).fields;
      const draft = { name: parsed.name || '', brand: parsed.brand || '', source: parsed.source || '', owner: parsed.owner || 'me', obtainedHow: parsed.obtainedHow || 'Purchased', obtainedDate: parsed.obtainedDate || '', price: parsed.price ?? '', value: parsed.value ?? '', room: parsed.room || '', categories: m.tags(parsed.categories || ''), properties: properties, description: [parsed.description, ...notes].filter(Boolean).join('\n') };
      if (parsed.categories) locked.add('categories');
      if (parsed.room) locked.add('room');
      ['zone','space'].forEach(function (key) { if (parsed[key] && !mapped[key]) properties.push({ name: key[0].toUpperCase() + key.slice(1), value: parsed[key], unit: '' }); });
      if (parsed.volume) properties.push({ name: 'Volume', value: parsed.volume, unit: parsed.volumeUnit || 'oz' });
      draft._smartEntry = source;
      Object.keys(mapped).forEach(function (key) {
        const value = mapped[key];
        try {
          if (['price', 'value'].includes(key)) draft[key] = amount(value);
          else if (key === 'obtainedDate') draft[key] = date(value);
          else if (key === 'categories') draft.categories = m.tags(value.replace(/;/g, ','));
          else if (['brand', 'source', 'room'].includes(key)) draft[key] = value;
          else if (key === 'name') draft.name = App.smartEntry.parse(value, brands.concat(mapped.brand || [])).fields.name || value;
          else if (['color', 'zone', 'space'].includes(key)) properties.push({ name: key[0].toUpperCase() + key.slice(1), value: value, unit: '' });
          else if (key === 'owner') { if (!/^(me|house|the house)$/i.test(value)) throw new Error(); draft.owner = /house/i.test(value) ? 'house' : 'me'; }
          else if (key === 'obtainedHow') { const method = m.methods.find(function (entry) { return entry.toLowerCase() === value.toLowerCase(); }); if (!method) throw new Error(); draft.obtainedHow = method; }
        } catch (_) { warnings.push('Check ' + labels[key] + ': ' + value); draft.description += '\n' + labels[key] + ': ' + value; }
      });
      if (draft.brand) properties.push({ name: 'Brand', value: draft.brand, unit: '' });
      const location = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === draft.room.toLowerCase(); });
      if (location && !properties.some(function (p) { return p.name === 'Zone'; })) properties.push({ name: 'Zone', value: location.zone, unit: '' });
      const suggestions = infer(draft, locked);
      App.config.inventory.categories.filter(function (category) { return draft.categories.some(function (tag) { return tag.toLowerCase() === category.name.toLowerCase(); }); }).forEach(function (category) {
        category.properties.forEach(function (property) { if (!properties.some(function (p) { return p.name.toLowerCase() === property.name.toLowerCase(); })) properties.push({ name: property.name, value: '', unit: property.unit || '' }); });
      });
      const seen = new Set(); draft.properties = properties.filter(function (p) { const key = p.name.toLowerCase(); if (seen.has(key)) { warnings.push('Repeated property: ' + p.name); draft.description += '\n' + p.name + ': ' + p.value; return false; } seen.add(key); return true; });
      if (draft.name.length > 160 || draft.source.length > 240 || draft.room.length > 80 || draft.description.length > 4000 || draft.properties.length > 40 || draft.properties.some(function (p) { return p.value.length > 300; })) throw new Error('Row ' + (index + 1) + ' exceeds item field limits. Shorten it before importing.');
      let quantity = mapped.quantity ? Number(mapped.quantity) : 1;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error('Row ' + (index + 1) + ': Copies must be an integer from 1 to 100.');
      if (output.length + quantity > 500) throw new Error('Review up to 500 objects per batch, including copies. Split this spreadsheet into smaller batches.');
      for (let copy = 0; copy < quantity; copy++) output.push({ id: u.uid('bulk'), row: index + (headers ? 2 : 1), source: source, copy: quantity > 1 ? (copy + 1) + ' of ' + quantity : '', draft: u.clone(draft), suggestions: suggestions.slice(), warnings: warnings.slice(), status: 'pending' });
    });
    if (!output.length) throw new Error('No object rows were found.'); return output;
  }
  App.bulkImport = { parseDelimited: parseDelimited, mapping: mapping, hasHeaders: hasHeaders, prepare: prepare, labels: labels };
})();
