(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils;
  const reasons = ["Trashed", "Lost", "Broken", "Sold", "Donated", "Given away", "Other"];
  const methods = ["Purchased", "Gift", "Inherited", "Made", "Found", "Other"];
  function cableEnd(value) {
    const text = String(value || '').trim();
    const key = function (name) { return name.toLowerCase().replace(/[\s_-]+/g, ''); };
    const aliases = { usbtypec: 'USB-C', usbtypea: 'USB-A', usbtypeb: 'USB-B', usbmicrob: 'Micro-USB', microusb: 'Micro-USB', usbminib: 'Mini-USB', miniusb: 'Mini-USB', rj45: 'Ethernet (RJ45)', ethernet: 'Ethernet (RJ45)', toslink: 'Optical (TOSLINK)' };
    return aliases[key(text)] || App.config.inventory.cableEnds.find(function (name) { return key(name) === key(text); }) || text;
  }
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
    return list.map(function (tag) { const clean = u.cleanLine(tag, 60); return App.config.inventory.tagAliases?.[clean.toLowerCase()] || App.config.inventory.categories.find(function (category) { return category.name.toLowerCase() === clean.toLowerCase(); })?.name || (/^cables?$/i.test(clean) ? "Cables" : clean); }).filter(function (tag) {
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
    const hierarchy = App.config.inventory.locations;
    const rawRoom = u.cleanLine(input.room, 80);
    const property = function (name) { return properties.find(function (p) { return p.name.toLowerCase() === name; })?.value || ''; };
    let room = hierarchy.find(function (l) { return l.room.toLowerCase() === rawRoom.toLowerCase(); });
    let space = property('space');
    // Resolve known alternate location fields only when the parent is unambiguous.
    const alternate = property('location') || property('area');
    if (!room && alternate) room = hierarchy.find(function (l) { return l.room.toLowerCase() === alternate.toLowerCase(); });
    if (!space && alternate && !room) space = alternate;
    if (!room && space) {
      const parents = hierarchy.filter(function (l) { return l.spaces.some(function (v) { return v.toLowerCase() === space.toLowerCase(); }); });
      if (parents.length === 1) room = parents[0];
    }
    const zone = room?.zone || hierarchy.find(function (l) { return l.zone.toLowerCase() === property('zone').toLowerCase(); })?.zone || '';
    const knownSpace = room?.spaces.find(function (value) { return value.toLowerCase() === space.toLowerCase(); }) || '';
    const cleanProperties = properties.filter(function (p) { return !['zone','room','space','area','location'].includes(p.name.toLowerCase()); });
    if (zone) cleanProperties.push({name:'Zone',value:zone,unit:''});
    if (knownSpace) cleanProperties.push({name:'Space',value:knownSpace,unit:''});
    if (tags(input.categories).some(function (tag) { return tag.toLowerCase() === 'bags'; })) {
      const capacity = cleanProperties.find(function (p) { return p.name.toLowerCase() === 'capacity'; });
      if (capacity && !cleanProperties.some(function (p) { return p.name.toLowerCase() === 'volume'; })) capacity.name = 'Volume';
    }
    cleanProperties.forEach(function (p) { if (p.name.toLowerCase() === "size") p.unit = ""; });
    return {
      id: id, name: name, description: u.cleanText(input.description, 4000), owner: input.owner,
      room: room?.room || '', categories: tags(tags(input.categories).concat(knownSpace === "Floating" ? ["Float"] : [])), obtainedDate: obtainedDate,
      obtainedHow: methods.includes(input.obtainedHow) ? input.obtainedHow : "",
      source: u.cleanLine(input.source, 240), value: amount(input.value) ?? amount(input.price), price: amount(input.price) ?? amount(input.value),
      properties: cleanProperties, archive: archive,
      ...(u.cleanLine(input.copyGroup, 100) ? { copyGroup: u.cleanLine(input.copyGroup, 100) } : {})
    };
  }
  function createCopies(input, count, rooms) {
    if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Choose between 1 and 100 copies.");
    const template = normalizeItem(input);
    template.copyGroup = template.copyGroup || u.uid("copies");
    return Array.from({ length: count }, function (_, index) {
      const item = normalizeItem(Object.assign({}, template, { id: u.uid("item"), archive: null }));
      const override = rooms?.[index], requestedRoom = typeof override === 'object' ? override?.room : override;
      const zone = u.cleanLine(typeof override === 'object' ? override?.zone : '',80);
      if (zone && !requestedRoom && !(typeof override === 'object' && override?.space)) { item.room = ''; item.properties = item.properties.filter(function (p) { return !['zone','space'].includes(p.name.toLowerCase()); }); item.properties.push({name:'Zone',value:zone,unit:''}); }
      const space = u.cleanLine(typeof override === 'object' ? override?.space : '', 80);
      let room = u.cleanLine(requestedRoom, 80);
      if (space && !room) {
        const matches = App.config.inventory.locations.filter(function (l) { return l.spaces.some(function (s) { return s.toLowerCase() === space.toLowerCase(); }); });
        if (matches.length === 1) room = matches[0].room;
      }
      if (room && room.toLowerCase() !== item.room.toLowerCase()) {
        item.room = room;
        item.properties = item.properties.filter(function (p) { return !["zone", "space"].includes(p.name.toLowerCase()); });
        const location = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === room.toLowerCase(); });
        if (location) item.properties.push({ name: "Zone", value: location.zone, unit: "" });
      }
      if (space) {
        const known = App.config.inventory.locations.filter(function (l) { return l.spaces.some(function (s) { return s.toLowerCase() === space.toLowerCase(); }); });
        if (known.length && !known.some(function (l) { return l.room.toLowerCase() === item.room.toLowerCase(); })) throw new Error('Choose the matching room for space ' + space + '.');
        item.properties = item.properties.filter(function (p) { return p.name.toLowerCase() !== 'space'; });
        item.properties.push({ name: 'Space', value: space, unit: '' });
      }
      if (room || zone) {
        const parent = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === item.room.toLowerCase(); });
        const resolvedZone = parent?.zone || zone;
        if (resolvedZone) { item.properties = item.properties.filter(function (p) { return p.name.toLowerCase() !== 'zone'; }); item.properties.push({name:'Zone',value:resolvedZone,unit:''}); }
      }
      if (typeof override?.color === 'string') {
        item.properties = item.properties.filter(function (p) { return p.name.toLowerCase() !== 'color'; });
        const color = u.cleanLine(override.color,300);
        if (color) item.properties.push({name:'Color',value:color,unit:''});
      }
      if (typeof override?.size === 'string') {
        item.properties = item.properties.filter(function (p) { return p.name.toLowerCase() !== 'size'; });
        const size = u.cleanLine(override.size,300);
        if (size) item.properties.push({name:'Size',value:size,unit:''});
      }
      if (typeof override?.notes === 'string') item.description = override.notes;
      return normalizeItem(item);
    });
  }
  function normalize(input) {
    if (input === undefined) return { currency: App.config.inventory.defaultCurrency, items: [] };
    if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input.items) || input.items.length > 5000) throw new Error("Inventory must contain a list of up to 5,000 items.");
    if (!["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "JPY", "CHF"].includes(input.currency)) throw new Error("The inventory currency is not supported.");
    const items = input.items.map(normalizeItem);
    if (new Set(items.map(function (item) { return item.id; })).size !== items.length) throw new Error("Inventory contains duplicate item IDs.");
    // Earlier copies offered other labels without converting amounts. Keep amounts intact.
    return { currency: App.config.inventory.defaultCurrency, items: items };
  }
  function daysOwned(item, end) {
    if (!item.obtainedDate) return null;
    return Math.max(0, Math.round((Date.parse((end || item.archive?.date || today()) + "T00:00:00Z") - Date.parse(item.obtainedDate + "T00:00:00Z")) / 86400000));
  }
  function objectKey(item) {
    const brand = item.properties.find(function (p) { return p.name.toLowerCase() === 'brand'; })?.value || '';
    return JSON.stringify([item.name.trim().toLowerCase(),brand.trim().toLowerCase(),item.owner]);
  }
  function sameObject(a,b) { return objectKey(a) === objectKey(b); }
  function itemLocation(item) {
    const prop = function (key) { return item.properties.find(function (p) { return p.name.toLowerCase() === key; })?.value || ''; };
    return [prop('zone'), item.room || '', prop('space')];
  }
  function compareBrand(a,b) {
    const brand = function (item) { return item.properties.find(function (p) { return p.name.toLowerCase()==='brand'; })?.value || '\uffff'; };
    return brand(a).localeCompare(brand(b),undefined,{sensitivity:'base',numeric:true}) || a.name.localeCompare(b.name,undefined,{sensitivity:'base',numeric:true});
  }
  function locationSections(items) {
    const sections = new Map();
    items.forEach(function (item) {
      const path = itemLocation(item), key = JSON.stringify(path);
      if (!sections.has(key)) sections.set(key,{path:path,items:[]});
      sections.get(key).items.push(item);
    });
    return Array.from(sections.values()).sort(function (a,b) {
      const known = Number(a.path.some(Boolean)) - Number(b.path.some(Boolean));
      if (known) return known;
      for (let i=0;i<3;i++) { const order = (a.path[i] || '\uffff').localeCompare(b.path[i] || '\uffff'); if (order) return order; }
      return 0;
    });
  }
  function groupRows(items) {
    const groups = new Map();
    items.forEach(function (item) {
      const key = JSON.stringify([objectKey(item),itemLocation(item).map(function (value) { return value.toLowerCase(); }),item.archive ? item.id : null]);
      if (!groups.has(key)) groups.set(key,[]); groups.get(key).push(item);
    });
    return Array.from(groups.values());
  }
  function ownershipAge(item, end) {
    const finish = dateOnly(end || item.archive?.date || today());
    if (!item.obtainedDate || !finish || finish < item.obtainedDate) return null;
    const start = new Date(item.obtainedDate + 'T00:00:00Z'), stop = new Date(finish + 'T00:00:00Z');
    function anniversary(months) {
      const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 1));
      const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
      first.setUTCDate(Math.min(start.getUTCDate(), last)); return first;
    }
    let months = (stop.getUTCFullYear()-start.getUTCFullYear())*12 + stop.getUTCMonth()-start.getUTCMonth();
    if (anniversary(months) > stop) months--;
    const years = Math.floor(months/12), days = Math.round((stop-anniversary(months))/86400000);
    const elapsedYears = years + (stop-anniversary(years*12))/(anniversary((years+1)*12)-anniversary(years*12));
    const basis = item.price ?? item.value;
    return {years:years,months:months%12,days:days,totalDays:Math.round((stop-start)/86400000),annualValue:elapsedYears > 0 && basis !== null ? basis/elapsedYears : null};
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
  App.inventoryModel = { compareBrand:compareBrand, itemLocation:itemLocation, locationSections:locationSections, cableEnd: cableEnd, sameObject: sameObject, groupRows: groupRows, ownershipAge: ownershipAge, createCopies: createCopies, normalize: normalize, normalizeItem: normalizeItem, tags: tags, amount: amount, dateOnly: dateOnly, today: today, daysOwned: daysOwned, stats: stats, merge: merge, reasons: reasons, methods: methods };
})();
