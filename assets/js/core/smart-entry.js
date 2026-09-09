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
    // Purchase exports use US month/day/year dates; two-digit years mean 20xx.
    let match = /^\s*(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2})|\d{4}-\d{2}-\d{2})(?=\s|$)/.exec(text);
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
    match = /\b(Amazon(?:\s+(?:Mktplace|Marketplace))?|Target|Walmart|Costco|IKEA|eBay)\s*[-–—:]?\s*/i.exec(remaining);
    if (match && !fields.source) take(match.index, match[0].length, "source", /^amazon/i.test(match[1]) ? "Amazon" : match[1]);
    remaining = rest.join("");
    const start = remaining.search(/\S/);
    if (start >= 0 && !fields.brand) {
      const brand = Array.from(new Set((knownBrands || App.config.inventory.brands).filter(Boolean))).sort(function (a, b) { return b.length - a.length; }).find(function (value) { return remaining.slice(start, start + value.length).toLowerCase() === value.toLowerCase() && /\s|$/.test(remaining[start + value.length] || ""); });
      if (brand) take(start, brand.length, "brand", brand);
    }
    remaining = rest.join("");
    const name = remaining.replace(/\s+/g, " ").trim();
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
