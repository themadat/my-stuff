(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils;
  const reasons = ["Trashed", "Lost", "Broken", "Sold", "Donated", "Given away", "Other"];
  const methods = ["Purchased", "Gift", "Inherited", "Made", "Found", "Other"];
  function today() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }
  function dateOnly(value) {
    if (!value) return "";
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value + "T00:00:00Z")) || new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value) throw new Error("Enter a valid calendar date.");
    return value;
  }
  function amount(value) {
    if (value === "" || value == null) return null;
    if (!["number", "string"].includes(typeof value) || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 999999999.99) throw new Error("Prices and values must be between 0 and 999,999,999.99.");
    return Math.round(Number(value) * 100) / 100;
  }
  function tags(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(",");
    const seen = new Set();
    return list.map(function (tag) { return u.cleanLine(tag, 60); }).filter(function (tag) {
      if (!tag || seen.has(tag.toLowerCase())) return false;
      seen.add(tag.toLowerCase()); return true;
    }).slice(0, 30);
  }
  function normalizeItem(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("An inventory item is invalid.");
    const id = u.cleanLine(input.id, 100), name = u.cleanLine(input.name, 160);
    if (!id || !name) throw new Error("Every item needs an ID and a name.");
    if (!["house", "me"].includes(input.owner)) throw new Error("Choose whether the item belongs to the house or to you.");
    const obtainedDate = dateOnly(input.obtainedDate);
    let archive = null;
    if (input.archive != null) {
      const date = dateOnly(input.archive.date);
      if (!date || !reasons.includes(input.archive.reason)) throw new Error("An archived item needs a gone date and reason.");
      if (obtainedDate && date < obtainedDate) throw new Error("The gone date cannot be before the obtained date.");
      archive = { date: date, reason: input.archive.reason, notes: u.cleanText(input.archive.notes, 2000) };
    }
    if (input.properties != null && (!Array.isArray(input.properties) || input.properties.length > 40)) throw new Error("Use up to 40 properties per item.");
    const properties = (input.properties || []).map(function (property) {
      if (!property || typeof property !== "object") throw new Error("An item property is invalid.");
      const name = u.cleanLine(property.name, 60);
      if (!name) throw new Error("Give every property a name, or remove its row.");
      return { name: name, value: u.cleanLine(property.value, 300), unit: u.cleanLine(property.unit, 30) };
    });
    const propertyNames = properties.map(function (property) { return property.name.toLowerCase(); });
    if (new Set(propertyNames).size !== propertyNames.length) throw new Error("Property names must be unique within an item.");
    return {
      id: id, name: name, description: u.cleanText(input.description, 4000), owner: input.owner,
      room: u.cleanLine(input.room, 80), categories: tags(input.categories), obtainedDate: obtainedDate,
      obtainedHow: methods.includes(input.obtainedHow) ? input.obtainedHow : "",
      source: u.cleanLine(input.source, 240), value: amount(input.value), price: amount(input.price),
      properties: properties, archive: archive
    };
  }
  function normalize(input) {
    if (input === undefined) return { currency: App.config.inventory.defaultCurrency, items: [] };
    if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input.items) || input.items.length > 5000) throw new Error("Inventory must contain a list of up to 5,000 items.");
    if (!App.config.inventory.currencies.includes(input.currency)) throw new Error("The inventory currency is not supported.");
    const items = input.items.map(normalizeItem);
    if (new Set(items.map(function (item) { return item.id; })).size !== items.length) throw new Error("Inventory contains duplicate item IDs.");
    return { currency: input.currency, items: items };
  }
  function daysOwned(item, end) {
    if (!item.obtainedDate) return null;
    return Math.max(0, Math.round((Date.parse((end || item.archive?.date || today()) + "T00:00:00Z") - Date.parse(item.obtainedDate + "T00:00:00Z")) / 86400000));
  }
  function emptyTotal() { return { count: 0, valueCents: 0, unknown: 0 }; }
  function add(total, item) {
    total.count += 1;
    if (item.value === null) total.unknown += 1;
    else total.valueCents += Math.round(item.value * 100);
  }
  function stats(items) {
    const totals = { all: emptyTotal(), house: emptyTotal(), me: emptyTotal(), rooms: [] }, rooms = new Map();
    items.filter(function (item) { return !item.archive; }).forEach(function (item) {
      add(totals.all, item); add(totals[item.owner], item);
      const room = item.room || "Unassigned", key = room.toLowerCase();
      if (!rooms.has(key)) rooms.set(key, { name: room, all: emptyTotal(), house: emptyTotal(), me: emptyTotal() });
      add(rooms.get(key).all, item); add(rooms.get(key)[item.owner], item);
    });
    totals.rooms = Array.from(rooms.values()).sort(function (a, b) { return a.name.localeCompare(b.name); });
    return totals;
  }
  function merge(local, remote) {
    if (local.currency !== remote.currency) throw new Error("Inventory currencies differ. Choose which copy to keep.");
    const items = new Map(local.items.map(function (item) { return [item.id, item]; }));
    remote.items.forEach(function (item) {
      if (items.has(item.id) && JSON.stringify(items.get(item.id)) !== JSON.stringify(item)) throw new Error("An inventory item differs between copies. Choose which copy to keep.");
      items.set(item.id, item);
    });
    return normalize({ currency: local.currency, items: Array.from(items.values()) });
  }
  App.inventoryModel = { normalize: normalize, normalizeItem: normalizeItem, tags: tags, amount: amount, dateOnly: dateOnly, today: today, daysOwned: daysOwned, stats: stats, merge: merge, reasons: reasons, methods: methods };
})();
