(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils;
  const reasons = ["Trashed", "Lost", "Broken", "Sold", "Donated", "Given away", "Replaced", "Other"];
  const methods = ["Purchased", "Gift", "Inherited", "Made", "Found", "Conveyed", "Other"];
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
    return list.map(function (tag) { const clean = u.cleanLine(tag, Infinity); return App.config.inventory.tagAliases?.[clean.toLowerCase()] || App.config.inventory.categories.find(function (category) { return category.name.toLowerCase() === clean.toLowerCase(); })?.name || (/^cables?$/i.test(clean) ? "Cables" : clean); }).filter(function (tag) {
      if (!tag || App.config.inventory.removedTags?.some(function (name) { return name.toLowerCase() === tag.toLowerCase(); }) || seen.has(tag.toLowerCase())) return false;
      seen.add(tag.toLowerCase()); return true;
    }).slice(0, 30);
  }
  function orderTags(value, extraBrands) {
    const brands=new Set(App.config.inventory.brands.concat(extraBrands || []).map(function (name) { return name.toLowerCase(); }));
    const rank=function (tag) { return tag.toLowerCase()==='float' ? 2 : brands.has(tag.toLowerCase()) ? 0 : 1; };
    return tags(value).sort(function (a,b) { return rank(a)-rank(b); });
  }
  function favoriteTag(item, favorites) {
    const brand=item.properties.find(function (p) { return p.name.toLowerCase()==='brand'; })?.value || '';
    const favorite=(favorites || []).find(function (name) { return name.toLowerCase()===brand.toLowerCase(); });
    const current=tags(item.categories);
    if (favorite && !current.some(function (tag) { return tag.toLowerCase()===favorite.toLowerCase(); }) && current.length<30) current.push(favorite);
    return Object.assign({},item,{categories:orderTags(current,[brand].concat(favorites || []))});
  }
  function normalizeItem(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("An inventory item is invalid.");
    const id = u.cleanLine(input.id, 100), name = u.cleanLine(input.name, Infinity);
    if (!id || !name) throw new Error("Every item needs an ID and a name.");
    if (!["house", "me"].includes(input.owner)) throw new Error("Choose whether the item belongs to the house or to you.");
    const obtainedDate = dateOnly(input.obtainedDate);
    let archive = null;
    if (input.archive != null) {
      const date = dateOnly(input.archive.date);
      if (!reasons.includes(input.archive.reason)) throw new Error("An archived item needs a reason.");
      if (date && obtainedDate && date < obtainedDate) throw new Error("The gone date cannot be before the obtained date.");
      archive = { date: date, reason: input.archive.reason, notes: u.cleanText(input.archive.notes, Infinity) };
    }
    if (input.properties != null && (!Array.isArray(input.properties) || input.properties.length > 40)) throw new Error("Use up to 40 properties per item.");
    const properties = (input.properties || []).map(function (property) {
      if (!property || typeof property !== "object") throw new Error("An item property is invalid.");
      const name = u.cleanLine(property.name, Infinity);
      if (!name) throw new Error("Give every property a name, or remove its row.");
      return { name: name, value: u.cleanLine(property.value, Infinity), unit: u.cleanLine(property.unit, Infinity) };
    });
    const propertyNames = properties.map(function (property) { return property.name.toLowerCase(); });
    if (new Set(propertyNames).size !== propertyNames.length) throw new Error("Property names must be unique within an item.");
    const hierarchy = App.config.inventory.locations;
    const originalRoom = u.cleanLine(input.room, Infinity), rawRoom = App.config.inventory.roomAliases?.[originalRoom.toLowerCase()] || originalRoom;
    const property = function (name) { return properties.find(function (p) { return p.name.toLowerCase() === name; })?.value || ''; };
    let room = hierarchy.find(function (l) { return l.room.toLowerCase() === rawRoom.toLowerCase(); });
    let space = property('space');
    if (room?.room==='Nook' && space.toLowerCase()==='sling bag') space='Sling';
    // Resolve known alternate location fields only when the parent is unambiguous.
    const alternate = property('location') || property('area');
    if (!room && alternate) room = hierarchy.find(function (l) { return l.room.toLowerCase() === (App.config.inventory.roomAliases?.[alternate.toLowerCase()] || alternate).toLowerCase(); });
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
      id: id, name: name, description: u.cleanText(input.description, Infinity), owner: input.owner,
      room: room?.room || '', categories: orderTags(tags(input.categories).concat(knownSpace === "Floating" ? ["Float"] : []),properties.filter(function (p) { return p.name.toLowerCase()==="brand"; }).map(function (p) { return p.value; })), obtainedDate: obtainedDate,
      obtainedHow: methods.includes(input.obtainedHow) ? input.obtainedHow : "",
      source: u.cleanLine(input.source, Infinity), value: amount(input.value) ?? amount(input.price), price: amount(input.price) ?? amount(input.value),
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
      const zone = u.cleanLine(typeof override === 'object' ? override?.zone : '',Infinity);
      if (zone && !requestedRoom && !(typeof override === 'object' && override?.space)) { item.room = ''; item.properties = item.properties.filter(function (p) { return !['zone','space'].includes(p.name.toLowerCase()); }); item.properties.push({name:'Zone',value:zone,unit:''}); }
      const space = u.cleanLine(typeof override === 'object' ? override?.space : '', Infinity);
      let room = u.cleanLine(requestedRoom, Infinity);
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
        const color = u.cleanLine(override.color,Infinity);
        if (color) item.properties.push({name:'Color',value:color,unit:''});
      }
      if (typeof override?.size === 'string') {
        item.properties = item.properties.filter(function (p) { return p.name.toLowerCase() !== 'size'; });
        const size = u.cleanLine(override.size,Infinity);
        if (size) item.properties.push({name:'Size',value:size,unit:''});
      }
      if (typeof override?.notes === 'string') item.description = override.notes;
      if (typeof override?.obtainedDate === 'string') item.obtainedDate = dateOnly(override.obtainedDate);
      if (typeof override?.piece === 'string') { item.properties=item.properties.filter(function (p) { return p.name.toLowerCase()!=='set piece'; }); if (override.piece.trim()) item.properties.push({name:'Set Piece',value:override.piece.trim(),unit:''}); }
      ['price','value'].forEach(function (key) { if (Object.hasOwn(override || {},key)) item[key]=amount(override[key]); });
      return normalizeItem(item);
    });
  }
  function locationReviews(value) {
    const result={};
    if (!value || typeof value!=='object' || Array.isArray(value)) return result;
    Object.keys(value).sort().slice(0,1000).forEach(function (key) {
      try {
        const path=JSON.parse(key), record=value[key];
        if (!Array.isArray(path) || !path.length || path.length>3 || path.some(function (part) { return typeof part!=='string' || !part.trim() || part.length>80; }) || !record || typeof record!=='object') return;
        const stamp=typeof record.updatedAt==='string' && Number.isFinite(Date.parse(record.updatedAt)) ? new Date(record.updatedAt).toISOString() : '1970-01-01T00:00:00.000Z';
        if (path[1]) path[1]=App.config.inventory.roomAliases?.[path[1].toLowerCase()] || path[1];
        if (path[0]==='Main Level' && path[1]==='Nook' && path[2]==='Sling Bag') path[2]='Sling';
        const target=JSON.stringify(path), next={date:dateOnly(record.date),updatedAt:stamp};
        if (!result[target] || next.updatedAt>result[target].updatedAt || (next.updatedAt===result[target].updatedAt && next.date>result[target].date)) result[target]=next;
      } catch (_) { /* Ignore malformed location keys in imports. */ }
    });
    return result;
  }
  // Checklist membership refers to stable inventory IDs; text entries have their own IDs.
  function normalizeChecklists(input, items) {
    if (input == null) return null;
    if (typeof input !== 'object' || Array.isArray(input)) throw new Error('Checklists must be an object.');
    const ids = new Set(items.map(function (item) { return item.id; }));
    const result = {};
    ['volleyball', 'golf', 'swim', 'travel', 'roadtrip'].forEach(function (key) {
      const list = input[key] || {objects:[], entries:[], checked:[]};
      if (!Array.isArray(list.objects) || !Array.isArray(list.entries) || !Array.isArray(list.checked) || list.entries.length > 1000) throw new Error('Invalid checklist contents.');
      const objects = Array.from(new Set(list.objects.filter(function (id) { return typeof id === 'string' && ids.has(id); })));
      const entries = list.entries.map(function (entry) {
        if (!entry || typeof entry.id !== 'string' || !entry.id || entry.id.length > 200 || typeof entry.text !== 'string' || !entry.text.trim() || entry.text.length > 500) throw new Error('Invalid checklist text item.');
        return {id:entry.id, text:entry.text.trim()};
      });
      if (new Set(entries.map(function (entry) { return entry.id; })).size !== entries.length) throw new Error('Duplicate checklist text item IDs.');
      const keys = new Set(objects.map(function (id) { return 'object:'+id; }).concat(entries.map(function (entry) { return 'text:'+entry.id; })));
      result[key] = {objects:objects, entries:entries, checked:Array.from(new Set(list.checked.filter(function (id) { return keys.has(id); })))};
    });
    return result;
  }
  function normalize(input, favorites) {
    if (input === undefined) return { currency: App.config.inventory.defaultCurrency, items: [] };
    if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input.items) || input.items.length > 5000) throw new Error("Inventory must contain a list of up to 5,000 items.");
    if (!["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "JPY", "CHF"].includes(input.currency)) throw new Error("The inventory currency is not supported.");
    const items = input.items.map(function (item) { return favoriteTag(normalizeItem(item),favorites); });
    if (new Set(items.map(function (item) { return item.id; })).size !== items.length) throw new Error("Inventory contains duplicate item IDs.");
    // Earlier copies offered other labels without converting amounts. Keep amounts intact.
    const reviews=locationReviews(input.locationReviews), checklists=normalizeChecklists(input.checklists,items);
    return { currency: App.config.inventory.defaultCurrency, items: items, ...(checklists ? {checklists:checklists} : {}), ...(Object.keys(reviews).length ? {locationReviews:reviews} : {}) };
  }
  function daysOwned(item, end) {
    if (!item.obtainedDate || (item.archive && !item.archive.date && !end)) return null;
    return Math.max(0, Math.round((Date.parse((end || item.archive?.date || today()) + "T00:00:00Z") - Date.parse(item.obtainedDate + "T00:00:00Z")) / 86400000));
  }
  function objectKey(item) {
    const brand = item.properties.find(function (p) { return p.name.toLowerCase() === 'brand'; })?.value || '';
    if (item.copyGroup && item.properties.some(function (p) { return p.name.toLowerCase()==='set piece'; })) return JSON.stringify(['set',item.copyGroup]);
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
  function locationSections(items, ordered) {
    const sections = new Map();
    items.forEach(function (item) {
      const path = itemLocation(item), key = JSON.stringify(path);
      if (!sections.has(key)) sections.set(key,{path:path,items:[]});
      sections.get(key).items.push(item);
    });
    return Array.from(sections.values()).sort(function (a,b) {
      const order=App.config.inventory.zoneOrder || [];
      const rank=function (zone) { const i=order.indexOf(zone); return i<0?order.length:i; };
      const known = Number(a.path.some(Boolean)) - Number(b.path.some(Boolean));
      if (known) return known;
      const zoneDifference=rank(a.path[0])-rank(b.path[0]); if (ordered && zoneDifference) return zoneDifference;
      for (let i=0;i<3;i++) {
        if ((i===2 || (ordered && i===1)) && Boolean(a.path[i])!==Boolean(b.path[i])) return a.path[i] ? 1 : -1;
        const order = (a.path[i] || '\uffff').localeCompare(b.path[i] || '\uffff'); if (order) return order;
      }
      return 0;
    });
  }
  function groupRows(items) {
    const groups = new Map();
    items.forEach(function (item) {
      const key = JSON.stringify([objectKey(item),item.properties.find(function (p) { return p.name.toLowerCase()==='set piece'; })?.value || '',itemLocation(item).map(function (value) { return value.toLowerCase(); }),item.archive ? item.id : null]);
      if (!groups.has(key)) groups.set(key,[]); groups.get(key).push(item);
    });
    return Array.from(groups.values());
  }
  function specialView(selections) {
    if (!selections.length) return '';
    if (selections.every(function (tag) { return tag==='Backpacking'; })) return 'backpacking';
    if (selections.every(function (tag) { return tag==='Footwear'; })) return 'footwear';
    if (selections.every(function (tag) { return tag==='Network'; })) return 'network';
    const smart=App.config.inventory.tagGroups.find(function (group) { return group.name==='Smart'; }).tags;
    if (selections.every(function (tag) { return tag==='group:Smart' || tag==='Smart' || smart.includes(tag); })) return 'smart';
    return '';
  }
  const packCategories = [['Consumable',null],['Wear',null],['Equipment',6],['Emergency',1],['Food/Water',1],['Clothing',2],['Other',1],['Luxury',null]];
  const packLevels = ['Ultralight','Middleweight','Heavy','Cold'];
  function packCategory(item) {
    const value=item.properties.find(function (p) { return p.name.toLowerCase()==='backpacking category'; })?.value || '';
    return packCategories.some(function (entry) { return entry[0]===value; }) ? value : 'Uncategorized';
  }
  function weightOunces(item) {
    const property=item.properties.find(function (p) { return p.name.toLowerCase()==='weight'; });
    if (!property || !property.value.trim()) return null;
    const parsed=measurement(property), factor={oz:1,lb:16,g:1/28.349523125,kg:1000/28.349523125}[parsed.unit || 'oz'], value=Number(parsed.value);
    return factor && Number.isFinite(value) && value>=0 ? value*factor : null;
  }
  function packTotal(items) {
    return items.reduce(function (total,item) { const weight=weightOunces(item); if (weight===null) total.unknown++; else total.ounces+=weight; return total; },{ounces:0,unknown:0});
  }
  function connectionTypes(value) {
    const values=Array.from(new Set(String(value || '').split('|').map(function (v) { return v.trim(); }).filter(Boolean)));
    const order=App.config.inventory.connectionTypes;
    return values.sort(function (a,b) { const ai=order.indexOf(a),bi=order.indexOf(b); return (ai<0?order.length:ai)-(bi<0?order.length:bi) || a.localeCompare(b); });
  }
  function connectionLabel(value) {
    const brands={'RF (433 MHz)':'TempPro','RF (434 MHz)':'Lutron','RF (915 MHz)':'Tempest'};
    return value+(brands[value]?' ['+brands[value]+']':'');
  }
  function specialSections(items, kind) {
    const groups=new Map(), smart=App.config.inventory.tagGroups.find(function (group) { return group.name==='Smart'; }).tags;
    items.forEach(function (item) {
      let name=kind==='smart' ? item.categories.find(function (tag) { return smart.includes(tag); }) || 'Unspecified Tag Type' : item.properties.find(function (p) { return p.name.toLowerCase()===(kind==='network'?'connection type':'type'); })?.value.trim() || (kind==='network'?'Unknown Connection Type':'Unspecified Type');
      if (kind==='network' && name!=='Unknown Connection Type') name=connectionTypes(name).map(connectionLabel).join(' + ');
      if (!groups.has(name)) groups.set(name,[]); groups.get(name).push(item);
    });
    return Array.from(groups,function (entry) { return {path:[entry[0]],items:entry[1]}; }).sort(function (a,b) { return a.path[0].localeCompare(b.path[0],undefined,{numeric:true,sensitivity:'base'}); });
  }
  function propertyLabel(property) {
    if (property.name.toLowerCase()==='connection type') return connectionTypes(property.value).map(connectionLabel).join(' + ');
    const parsed=measurement(property), value=parsed.value.trim();
    if (property.name.toLowerCase()==='weight' && value && Number.isFinite(Number(value))) return Number(value).toFixed(2)+(parsed.unit?' '+parsed.unit:'');
    return property.value+(property.unit?' '+property.unit:'');
  }
  function compareRows(a,b,key,direction) {
    function value(members) {
      if (key==='age') return ownershipSummary(members)?.totalDays ?? null;
      if (key==='count') return members.length;
      if (key==='value') return members.every(function (item) { return item.value==null; }) ? null : members.reduce(function (sum,item) { return sum+(item.value || 0); },0);
      const values=members.map(function (item) {
        if (key==='name') return item.name;
        if (key==='tags') return item.categories.join(', ');
        if (key==='date') return item.archive ? item.archive.date || null : item.obtainedDate || null;
        if (key==='age') return ownershipAge(item)?.totalDays ?? null;
        const property=item.properties.find(function (p) { return p.name.toLowerCase()===key; });
        if (!property?.value.trim()) return null;
        if (key==='stack height' || key==='drop') {
          const parsed=measurement(property), factor={mm:1,cm:10,in:25.4}[parsed.unit || 'mm'], raw=key==='stack height'?parsed.value.split('→')[0]:parsed.value;
          return factor && Number.isFinite(Number(raw)) ? Number(raw)*factor : null;
        }
        if (key==='weight') {
          const parsed=measurement(property), factor={oz:28.349523125,lb:453.59237,g:1,kg:1000}[parsed.unit || 'oz'];
          return Number.isFinite(Number(parsed.value)) && factor ? Number(parsed.value)*factor : null;
        }
        return property.value;
      }).filter(function (entry) { return entry!==null && entry!==''; });
      return values.sort(function (x,y) { return typeof x==='number' ? x-y : x.localeCompare(y,undefined,{numeric:true,sensitivity:'base'}); })[0] ?? null;
    }
    const x=value(a), y=value(b);
    if (x===null || y===null) return x===y ? compareBrand(a[0],b[0]) : x===null ? 1 : -1;
    return (typeof x==='number' ? x-y : x.localeCompare(y,undefined,{numeric:true,sensitivity:'base'}))*(direction==='descending'?-1:1) || compareBrand(a[0],b[0]);
  }
  function mileage(value) {
    let entries;
    try { entries = value ? JSON.parse(value) : []; } catch (_) { throw new Error('Mileage needs a list of months and miles.'); }
    if (!Array.isArray(entries)) throw new Error('Mileage needs a list of months and miles.');
    const months = new Set();
    entries.forEach(function (entry) {
      if (!entry || !/^\d{4}-(0[1-9]|1[0-2])$/.test(entry.month) || typeof entry.miles !== 'number' || !Number.isFinite(entry.miles) || entry.miles < 0) throw new Error('Enter a valid month and non-negative miles for every mileage entry.');
      if (months.has(entry.month)) throw new Error('Use one mileage entry per month.');
      months.add(entry.month);
    });
    const total = entries.reduce(function (sum, entry) { return sum + entry.miles; }, 0);
    if (!Number.isFinite(total)) throw new Error('Mileage total is too large.');
    return {entries:entries,total:total,tone:total >= 500 ? 'red' : total >= 400 ? 'orange' : total >= 300 ? 'yellow' : 'green'};
  }
  function ownershipSummary(items, end) {
    if (!items.length || items.some(function (item) { return !item.obtainedDate || (item.archive && !item.archive.date); })) return null;
    const obtainedDate=items.map(function (item) { return item.obtainedDate; }).sort()[0];
    const finish=end || (items.every(function (item) { return item.archive; }) ? items.map(function (item) { return item.archive.date; }).sort().at(-1) : today());
    const costs=items.map(function (item) { return item.price ?? item.value; });
    const total=costs.some(function (cost) { return cost==null; }) ? null : costs.reduce(function (sum,cost) { return sum+Math.round(cost*100); },0)/100;
    const values=items.map(function (item) { return item.value; });
    const currentValue=values.some(function (value) { return value==null; }) ? null : values.reduce(function (sum,value) { return sum+Math.round(value*100); },0)/100;
    return ownershipAge({obtainedDate:obtainedDate,price:total,value:currentValue},finish);
  }
  function ownershipAge(item, end) {
    const finish = dateOnly(end || (item.archive ? item.archive.date : today()));
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
    return {years:years,months:months%12,days:days,totalDays:Math.round((stop-start)/86400000),annualValue:years < 1 ? item.value ?? null : basis != null ? basis/elapsedYears : null,monthlyValue:months < 1 ? item.value ?? null : basis != null ? basis/(elapsedYears*12) : null};
  }
  function emptyTotal() { return { count: 0, valueCents: 0, unknown: 0 }; }
  function add(total, item) {
    total.count += 1;
    if (item.value === null) total.unknown += 1;
    else total.valueCents += Math.round(item.value * 100);
  }
  function stats(items) {
    const totals = { all: emptyTotal(), house: emptyTotal(), me: emptyTotal(), houseConveyed: emptyTotal(), houseNew: emptyTotal(), rooms: [] }, rooms = new Map();
    items.filter(function (item) { return !item.archive; }).forEach(function (item) {
      add(totals.all, item); add(totals[item.owner], item);
      if (item.owner === 'house') add(totals[item.obtainedHow === 'Conveyed' ? 'houseConveyed' : 'houseNew'], item);
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
    const reviews=locationReviews(local.locationReviews);
    Object.entries(locationReviews(remote.locationReviews)).forEach(function (entry) { const key=entry[0], incoming=entry[1], current=reviews[key]; if (!current || incoming.updatedAt>current.updatedAt || (incoming.updatedAt===current.updatedAt && incoming.date>current.date)) reviews[key]=incoming; });
    if (local.checklists && remote.checklists && JSON.stringify(local.checklists) !== JSON.stringify(remote.checklists)) throw new Error('Checklists differ between copies. Choose which copy to keep.');
    return normalize({ currency: local.currency, items: Array.from(items.values()), locationReviews:reviews, checklists:local.checklists || remote.checklists });
  }
  // Recognized suffixes only: free text and unitless properties remain untouched.
  const measurementUnits = [
    ['mm','millimeter millimeters millimetre millimetres',1/25.4,'in'], ['cm','centimeter centimeters centimetre centimetres',1/2.54,'in'],
    ['m','meter meters metre metres',3.280839895,'ft'], ['km','kilometer kilometers kilometre kilometres',0.621371192,'mi'],
    ['mg','milligram milligrams',1/28349.523125,'oz'], ['g','gram grams',1/28.349523125,'oz'], ['kg','kilogram kilograms',2.204622622,'lb'],
    ['mL','ml milliliter milliliters millilitre millilitres',1/29.5735295625,'US fl oz'], ['L','l liter liters litre litres',33.814022702,'US fl oz'],
    ['°C','c celsius',1.8,'°F',32], ['°F','f fahrenheit'], ['in','inch inches "'], ['ft',"foot feet '"], ['yd','yard yards'], ['mi','mile miles'],
    ['oz','ounce ounces'], ['lb','lbs pound pounds'], ['fl oz','floz'], ['gal','gallon gallons'],
    ['mAh','mah'], ['Ah','ah'], ['W','w watt watts'], ['kW','kw kilowatt kilowatts'], ['Wh','wh'], ['V','v volt volts'], ['A','a amp amps'], ['Hz','hz'], ['MHz','mhz'], ['GHz','ghz']
  ];
  function measurement(property) {
    const result = {value:String(property.value ?? ''), unit:String(property.unit ?? ''), imperial:''};
    if (String(property.name).trim().toLowerCase()==='stack height') {
      const stack=result.value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:->|→)\s*(\d+(?:\.\d+)?)\s*(mm|cm|in)?$/i);
      if (stack) { result.value=stack[1]+'→'+stack[2]; result.unit=(stack[3] || result.unit || 'mm').toLowerCase(); }
      return result;
    }
    if (['type','mileage','connection type','color','dimensions','size','end a','end b','output ports','brand','zone','space'].includes(String(property.name).trim().toLowerCase())) return result;
    const match = result.value.trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s+\d+\/\d+|\/\d+)?)\s*(.*?)$/);
    if (!match) return result;
    const suffix = (match[2] || result.unit).trim().toLowerCase();
    const unit = measurementUnits.find(function (entry) { return entry[0].toLowerCase() === suffix || entry[1].split(' ').includes(suffix) || (entry[0]==='fl oz' && ['fluid ounce','fluid ounces','fl. oz.'].includes(suffix)); });
    if (!unit) return result;
    const parts=match[1].split(/\s+/), fraction=parts.at(-1).split('/');
    const value=fraction.length===2 ? (parts.length===2 ? Number(parts[0]) : 0) + (match[1].startsWith('-') && parts.length===2 ? -1 : 1)*Number(fraction[0])/Number(fraction[1]) : Number(match[1]);
    if (!Number.isFinite(value)) return result;
    result.value=String(value); result.unit=unit[0];
    if (unit[2]) result.imperial='≈ '+Number((value*unit[2]+(unit[4] || 0)).toPrecision(4)).toLocaleString('en-US',{maximumSignificantDigits:4})+' '+unit[3];
    return result;
  }
  App.inventoryModel = { packCategories:packCategories, packLevels:packLevels, packCategory:packCategory, weightOunces:weightOunces, packTotal:packTotal, connectionTypes:connectionTypes, connectionLabel:connectionLabel, specialView:specialView, specialSections:specialSections, ownershipSummary:ownershipSummary, propertyLabel:propertyLabel, compareRows:compareRows, mileage:mileage, measurement:measurement, orderTags:orderTags, favoriteTag:favoriteTag, compareBrand:compareBrand, itemLocation:itemLocation, locationSections:locationSections, cableEnd: cableEnd, sameObject: sameObject, groupRows: groupRows, ownershipAge: ownershipAge, createCopies: createCopies, normalize: normalize, normalizeItem: normalizeItem, tags: tags, amount: amount, dateOnly: dateOnly, today: today, daysOwned: daysOwned, stats: stats, merge: merge, reasons: reasons, methods: methods };
})();
