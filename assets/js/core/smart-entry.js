(function () {
  "use strict";
  const App = window.LocalApp;
  const example = "08/03/26\t($62.77)\tChase Prime: 125.54\tAmazon Mktplace - Final Touch Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand [65] [O]";
  // Match only known brands or explicit labels. Unrecognized metadata remains in notes.
  function parse(text, knownBrands) {
    const fields = {}, spans = []; let rest = text.split("");
    function take(start, length, field, value) {
      if (spans.some(function (span) { return start < span.end && start + length > span.start; })) return;
      spans.push({ start: start, end: start + length, field: field });
      rest.fill(" ", start, start + length); if (field) fields[field] = value;
    }
    // Spreadsheet cells retain offsets so extracted values stay highlighted in their original columns.
    const cells = Array.from(text.matchAll(/[^\t\n]+/g));
    const vocabulary = App.config.inventory.tagGroups.flatMap(function (group) { return group.tags; }).concat(App.config.inventory.categories.map(function (c) { return c.name; }));
    const locations = App.config.inventory.locations;
    const first = cells[0];
    if (first) {
      const raw = first[0].trim();
      const candidates = locations.flatMap(function (l) { return [{ value: l.room, room: l.room, zone: l.zone }].concat(l.spaces.map(function (space) { return { value: space, room: l.room, zone: l.zone, space: space }; })); });
      const matches = candidates.filter(function (l) { return l.value.toLowerCase() === raw.toLowerCase(); });
      if (matches.length === 1 && cells.length > 1) {
        const place = matches[0]; fields.room = place.room; fields.zone = place.zone;
        take(first.index + first[0].indexOf(raw), raw.length, place.space ? 'space' : 'room', place.space || place.room);
      } else if (!text.includes('\t')) {
        const prefix = candidates.filter(function (l) { return !l.space && text.toLowerCase().startsWith(l.value.toLowerCase() + ' '); }).sort(function (a,b) { return b.value.length - a.value.length; });
        if (prefix.length && candidates.filter(function (l) { return l.value === prefix[0].value; }).length === 1) {
          const place = prefix[0]; fields.room = place.room; fields.zone = place.zone; take(0, place.value.length, place.space ? 'space' : 'room', place.space || place.room);
        }
      }
    }
    if (text.includes('\t')) cells.forEach(function (cell) {
      const raw = cell[0].trim(), start = cell.index + cell[0].indexOf(raw);
      if (/^(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2})|\d{4}-\d{2}-\d{2})$/.test(raw)) {
        const parts = raw.split('/'), date = parts.length === 3 ? (parts[2].length === 2 ? '20' + parts[2] : parts[2]) + '-' + parts[0].padStart(2,'0') + '-' + parts[1].padStart(2,'0') : raw;
        try { App.inventoryModel.dateOnly(date); take(start,raw.length,'obtainedDate',date); } catch (_) { take(start,raw.length,null); }
      } else if (/^\(?\$[\d,]+(?:\.\d{1,2})?\)?$/.test(raw) && !fields.price) take(start,raw.length,'price',raw.replace(/[$(),]/g,''));
      else {
        const tags = raw.split(/[,;]/).map(function (tag) { return vocabulary.find(function (v) { return v.toLowerCase() === App.inventoryModel.tags(tag.trim())[0]?.toLowerCase(); }); });
        if (tags.length && tags.every(Boolean) && cells.length > 1) take(start,raw.length,'categories',App.inventoryModel.tags((fields.categories || '') + ',' + tags.join(',')).join(', '));
      }
    });
    const tail = /\[\$?[\d,.]+\]\s*,\s*([^\t\n]+)$/.exec(text);
    if (tail) {
      let offset = tail.index + tail[0].indexOf(',') + 1;
      tail[1].split(',').forEach(function (part) {
        const start = text.indexOf(part.trim(), offset), raw = part.trim();
        const tag = vocabulary.find(function (value) { return value.toLowerCase() === raw.toLowerCase(); });
        if (raw) take(start,raw.length,tag ? 'categories' : null,tag ? App.inventoryModel.tags((fields.categories || '') + ',' + tag).join(', ') : undefined);
        offset = start + raw.length + 1;
      });
    }
    if (/\bwater\b/i.test(fields.categories || '') || /\b(?:bottle|anti-bottle)\b/i.test(text)) {
      const volume = /\b(\d+(?:\.\d+)?)\s*(fl\.?\s*oz|fluid ounces?|ounces?|oz|ml|milliliters?|liters?|litres?|l)\b/i.exec(text);
      if (volume) { take(volume.index,volume[0].length,'volume',volume[1]); fields.volumeUnit = /^(?:ml|milliliter)/i.test(volume[2]) ? 'mL' : /^(?:l|liters?|litres?)$/i.test(volume[2]) ? 'L' : 'oz'; }
    }
    // Purchase exports use US month/day/year dates; two-digit years mean 20xx.
    let match = /^\s*(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2})|\d{4}-\d{2}-\d{2})(?=\s|$)/.exec(rest.join(""));
    if (match) {
      const raw = match[1], parts = raw.split("/");
      const date = parts.length === 3 ? (parts[2].length === 2 ? "20" + parts[2] : parts[2]) + "-" + parts[0].padStart(2, "0") + "-" + parts[1].padStart(2, "0") : raw;
      let valid = true;
      try { App.inventoryModel.dateOnly(date); } catch (_) { valid = false; }
      take(match[0].length - raw.length, raw.length, valid ? "obtainedDate" : null, date);
    }
    match = /^\s*(\(?\$([\d,]+(?:\.\d{1,2})?)\)?)/.exec(rest.join(""));
    if (match) take(match[0].length - match[1].length, match[1].length, "price", match[2].replace(/,/g, ""));
    match = /\[\$?([\d,]+(?:\.\d{1,2})?)\]/.exec(text);
    if (match) take(match.index, match[0].length, "value", match[1].replace(/,/g, ""));
    // Explicit annotations work regardless of order; semicolons separate text fields.
    const labels = /\b(brand|seller|source|owner|belongs to|obtained|method|price|value)\s*:\s*([^;\n\t\[\]]+);?/gi;
    for (const found of text.matchAll(labels)) {
      const key = { seller: "source", source: "source", brand: "brand", owner: "owner", "belongs to": "owner", obtained: "obtainedHow", method: "obtainedHow", price: "price", value: "value" }[found[1].toLowerCase()];
      let value = found[2].trim();
      if (key === "owner") { if (!/^(me|house|the house)$/i.test(value)) continue; value = /house/i.test(value) ? "house" : "me"; }
      if (key === "obtainedHow") { value = App.inventoryModel.methods.find(function (method) { return method.toLowerCase() === value.toLowerCase(); }); if (!value) continue; }
      if (key === "price" || key === "value") { if (!/^\$?[\d,]+(?:\.\d{1,2})?$/.test(value)) continue; value = value.replace(/[$,]/g, ""); }
      take(found.index, found[0].length, key, value);
    }
    // Payment/account columns are notes, never the obtaining price.
    match = /\b[^\t\n;]*?:\s*\$?[\d,]+\.\d{2}(?=\s*(?:\t|;|\n|$))/.exec(rest.join(""));
    if (match) { const lead = match[0].length - match[0].trimStart().length; take(match.index + lead, match[0].length - lead, null); }
    for (const found of rest.join("").matchAll(/\[[^\]]*\]/g)) take(found.index, found[0].length, null);
    let remaining = rest.join("");
    const config = App.config.inventory;
    const brands = Array.from(new Set([...(knownBrands || config.brands), ...Object.keys(config.brandCompanies || {}), ...Object.values(config.brandCompanies || {})].filter(Boolean))).sort(function (a,b) { return b.length-a.length; });
    function canonicalSeller(value) {
      const alias = Object.keys(config.sellerAliases).find(function (name) { return name.toLowerCase() === value.toLowerCase(); });
      return alias ? config.sellerAliases[alias] : config.retailers.find(function (name) { return name.toLowerCase() === value.toLowerCase(); }) || brands.find(function (name) { return name.toLowerCase() === value.toLowerCase(); }) || value;
    }
    // A spaced dash separates the seller from the product; hyphenated product words do not.
    match = /^\s*([^\t\n;]+?)\s+[-–—]\s*/.exec(remaining);
    if (match) {
      const prefix = match[1].trim(), start = match[0].indexOf(prefix);
      take(start,match[0].length-start,'source',fields.source || canonicalSeller(prefix));
    } else {
      const start = remaining.search(/\S/), stores = config.retailers.concat(Object.keys(config.sellerAliases)).sort(function (a,b) { return b.length-a.length; });
      const seller = start < 0 ? null : stores.find(function (name) { return remaining.slice(start,start+name.length).toLowerCase()===name.toLowerCase() && /[\s:–—-]|$/.test(remaining[start+name.length] || ''); });
      if (seller) {
        const suffix = /^[\s:–—-]*/.exec(remaining.slice(start+seller.length))[0];
        take(start,seller.length+suffix.length,'source',fields.source || canonicalSeller(seller));
      }
    }
    remaining = rest.join("");
    const start = remaining.search(/\S/);
    const productBrand = start < 0 ? null : brands.find(function (value) { return remaining.slice(start,start+value.length).toLowerCase()===value.toLowerCase() && /\s|$/.test(remaining[start+value.length] || ''); });
    if (productBrand && (!fields.brand || fields.brand.toLowerCase()===productBrand.toLowerCase())) take(start,productBrand.length,'brand',fields.brand || productBrand);
    if (!fields.brand && fields.source && !config.retailers.some(function (store) { return store.toLowerCase()===canonicalSeller(fields.source).toLowerCase(); })) {
      const sellerBrand = brands.find(function (brand) { return brand.toLowerCase()===fields.source.toLowerCase(); });
      if (sellerBrand) fields.brand = sellerBrand;
    }
    remaining = rest.join("");
    const name = remaining.replace(/\s+/g, " ").replace(/,\s*,/g, ",").replace(/^[,;\s]+|[,;\s]+$/g, "").trim();
    if (name) {
      let cursor = 0;
      const boundaries = spans.slice().sort(function (a, b) { return a.start - b.start; }).concat([{ start: text.length, end: text.length }]);
      boundaries.forEach(function (span) {
        const chunk = remaining.slice(cursor, span.start), lead = chunk.length - chunk.trimStart().length;
        if (chunk.trim()) spans.push({ start: cursor + lead, end: cursor + chunk.trimEnd().length, field: "name" });
        cursor = span.end;
      });
      fields.name = name;
    }
    const notes = spans.filter(function (span) { return !span.field; }).map(function (span) { return text.slice(span.start, span.end).trim(); }).filter(Boolean).join(" · ");
    if (notes) fields.description = notes;
    return { fields: fields, spans: spans.sort(function (a, b) { return a.start - b.start; }) };
  }
  App.smartEntry = { parse: parse, example: example };
})();
