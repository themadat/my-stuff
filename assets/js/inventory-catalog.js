(function () {
  "use strict";
  const App = window.LocalApp, esc = App.utils.escapeHtml;
  const unique = function (values) { const seen = new Set(); return values.filter(function (value) { const key = value.toLowerCase(); if (!value || seen.has(key)) return false; seen.add(key); return true; }).sort(function (a, b) { return a.localeCompare(b); }); };
  function isFavorite(name) { return (App.storage.getState().preferences.favoriteBrands || []).some(function (brand) { return brand.toLowerCase() === name.toLowerCase(); }); }
  function sortBrands(values) { return unique(values).sort(function (a,b) { return Number(isFavorite(b))-Number(isFavorite(a)) || a.localeCompare(b); }); }
  function brands(items) { return sortBrands(App.config.inventory.brands.concat(App.config.inventory.tagGroups.find(function (g) { return g.name === 'Brands'; })?.tags || [], items.flatMap(function (item) { return item.properties.filter(function (p) { return p.name.toLowerCase() === 'brand'; }).map(function (p) { return p.value; }); }),App.storage.getState().preferences.favoriteBrands || [])); }
  function data(items) {
    const config = App.config.inventory, zones = new Map();
    function location(zone, room, spaces) {
      zone = zone || "";
      if (!zones.has(zone.toLowerCase())) zones.set(zone.toLowerCase(), { name: zone, rooms: new Map() });
      const rooms = zones.get(zone.toLowerCase()).rooms;
      if (!room && !spaces.length) return;
      room = room || "";
      if (!rooms.has(room.toLowerCase())) rooms.set(room.toLowerCase(), { name: room, spaces: [] });
      const row = rooms.get(room.toLowerCase()); row.spaces = unique(row.spaces.concat(spaces));
    }
    config.locations.forEach(function (l) { location(l.zone, l.room, l.spaces); });
    const tagGroups = config.tagGroups.map(function (g) { return { name: g.name, tags: g.tags.slice() }; });
    tagGroups.push({ name: "Category Presets", tags: config.categories.map(function (c) { return c.name; }) });
    const knownTags = tagGroups.flatMap(function (g) { return g.tags.map(function (tag) { return tag.toLowerCase(); }); });
    const customTags = unique(items.flatMap(function (item) { return item.categories; }).filter(function (tag) { return !knownTags.includes(tag.toLowerCase()); }));
    if (customTags.length) tagGroups.push({ name: "Custom Tags", tags: customTags });
    const properties = new Map();
    function addProperty(p) {
      const key = p.name.toLowerCase();
      if (!properties.has(key)) properties.set(key, { name: p.name, units: [], values: [] });
      const entry = properties.get(key); entry.units = unique(entry.units.concat(p.unit || [])); entry.values = unique(entry.values.concat(p.values || [], p.value || []));
    }
    const propertyGroups = [{ name: "Common Properties", properties: config.commonProperties }, { name: "Identity and Location", properties: [{ name: "Brand", values: config.brands }, { name: "Zone" }, { name: "Space" }] }].concat(config.categories.map(function (c) { return { name: c.name, properties: c.properties }; }));
    propertyGroups.forEach(function (g) { g.properties.forEach(addProperty); });
    const knownProperties = Array.from(properties.keys());
    items.forEach(function (item) { item.properties.forEach(addProperty); });
    const customProperties = Array.from(properties.values()).filter(function (p) { return !knownProperties.includes(p.name.toLowerCase()); });
    if (customProperties.length) propertyGroups.push({ name: "Custom Properties", properties: customProperties });
    return {
      locations: Array.from(zones.values()).map(function (zone) { return { name: zone.name, rooms: Array.from(zone.rooms.values()).sort(function (a, b) { return a.name.localeCompare(b.name); }) }; }),
      tagGroups: tagGroups,
      propertyGroups: propertyGroups.map(function (group) { return { name: group.name, properties: group.properties.map(function (p) { return properties.get(p.name.toLowerCase()); }) }; }),
      properties: Array.from(properties.values())
    };
  }
  function matches(item, filter) {
    const property = function (name) { return item.properties.find(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })?.value || ''; };
    const zone = property('Zone') || App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === item.room.toLowerCase(); })?.zone || '';
    if (filter.kind === 'zone') return zone === filter.value;
    if (filter.kind === 'room') return (item.room || '') === filter.value && (!filter.zone || zone === filter.zone);
    if (filter.kind === 'space') return property('Space') === filter.value && (item.room || '') === filter.room && zone === filter.zone;
    if (filter.kind === 'tag') return item.categories.includes(filter.value);
    if (filter.kind === 'tags') return filter.values.some(function (tag) { return item.categories.includes(tag) || (filter.brands && property('Brand').toLowerCase() === tag.toLowerCase()); });
    if (filter.kind === 'properties') return item.properties.some(function (p) { return filter.values.includes(p.name.toLowerCase()); });
    if (filter.kind === 'property') return item.properties.some(function (p) { return p.name.toLowerCase() === filter.name.toLowerCase() && (filter.value === undefined || p.value === filter.value); });
    return false;
  }
  function filterButton(label, filter) { if (!label) return ''; return '<button type="button" class="catalog-filter" data-catalog-filter="' + esc(JSON.stringify(Object.assign({label:label},filter))) + '">' + esc(label) + '</button>'; }
  function render() {
    const root = document.querySelector("#inventoryCatalog"); if (!root) return;
    const catalog = data(App.storage.getState().inventory.items), query = document.querySelector("#inventoryCatalogSearch").value.trim().toLowerCase();
    const matchesQuery = function (parts) { return parts.join(" ").toLowerCase().includes(query); };
    const chips = function (values, makeFilter, brandList) { return '<div class="catalog-chips">' + (brandList ? sortBrands(values) : values).map(function (value) {
      return '<span class="catalog-chip">' + filterButton(value,makeFilter(value)) + (brandList ? '<button type="button" class="favorite-brand" data-favorite-brand="' + esc(value) + '" aria-pressed="' + isFavorite(value) + '" aria-label="' + (isFavorite(value) ? 'Unfavorite ' : 'Favorite ') + esc(value) + '">' + App.icons.markup('favoriteBrand') + '</button>' : '') + '</span>';
    }).join('') + '</div>'; };
    const locations = catalog.locations.map(function (zone) {
      const rooms = zone.rooms.filter(function (room) { return matchesQuery([zone.name,room.name].concat(room.spaces)); });
      if (!rooms.length && !matchesQuery([zone.name])) return '';
      return '<section class="catalog-group">' + (zone.name ? '<h4>' + filterButton(zone.name,{kind:'zone',value:zone.name}) + '</h4>' : '') + '<ul class="catalog-rooms">' + rooms.map(function (room) {
        return '<li><strong>' + filterButton(room.name,{kind:'room',value:room.name,zone:zone.name}) + '</strong>' + chips(room.spaces,function (value) { return {kind:'space',value:value,room:room.name,zone:zone.name}; }) + '</li>';
      }).join('') + '</ul></section>';
    }).join('');
    const tags = catalog.tagGroups.map(function (g) {
      const all = g.name === 'Brands' ? brands(App.storage.getState().inventory.items) : g.tags, values = all.filter(function (tag) { return matchesQuery([g.name,tag]); });
      return values.length ? '<section class="catalog-group"><h4>' + filterButton(g.name,{kind:'tags',values:all,brands:g.name==='Brands'}) + '</h4>' + chips(values,function (value) { return g.name === 'Brands' ? {kind:'tags',values:[value],brands:true} : {kind:'tag',value:value}; },g.name==='Brands') + '</section>' : '';
    }).join('');
    const groups = catalog.propertyGroups.map(function (g) {
      const values = g.properties.filter(function (p) { return matchesQuery([g.name,p.name].concat(p.units,p.values)); });
      return values.length ? '<section class="catalog-group"><h4>' + filterButton(g.name,{kind:'properties',values:g.properties.map(function (p) { return p.name.toLowerCase(); })}) + '</h4>' + values.map(function (p) {
        return '<div class="catalog-property"><strong>' + filterButton(p.name,{kind:'property',name:p.name}) + '</strong>' + (p.units.length ? ' <small>' + esc(p.units.join(' / ')) + '</small>' : '') + chips(p.values,function (value) { return {kind:'property',name:p.name,value:value}; },p.name.toLowerCase()==='brand') + '</div>';
      }).join('') + '</section>' : '';
    }).join('');
    root.innerHTML = [ ["Zones, Rooms & Spaces", locations], ["Tag Groups", tags], ["Property Groups & Values", groups] ].map(function (entry) { return '<section class="catalog-section"><h3>' + entry[0] + '</h3><div class="catalog-grid">' + (entry[1] || '<p>No Matching Options</p>') + '</div></section>'; }).join("");
    const names = document.querySelector("#inventoryPropertyNames"), colors = document.querySelector("#inventoryColorValues");
    if (names) names.innerHTML = unique(catalog.properties.map(function (p) { return p.name; })).map(function (name) { return '<option value="' + esc(name) + '"></option>'; }).join("");
    if (colors) colors.innerHTML = (catalog.properties.find(function (p) { return p.name.toLowerCase() === "color"; })?.values || []).map(function (value) { return '<option value="' + esc(value) + '"></option>'; }).join("");
  }
  function init() {
    document.body.insertAdjacentHTML("beforeend", '<datalist id="inventoryPropertyNames"></datalist><datalist id="inventoryColorValues"></datalist>');
    document.querySelector('#inventoryCatalog').addEventListener('click', function (event) {
      const filter = event.target.closest('[data-catalog-filter]'); if (filter) { App.components.closeDialog('#supportDialog'); App.inventoryUI.fromCatalog(JSON.parse(filter.dataset.catalogFilter)); return; }
      const button = event.target.closest('[data-favorite-brand]'); if (!button) return;
      const name = button.dataset.favoriteBrand, active = isFavorite(name);
      App.storage.mutate(function (state) { const values = state.preferences.favoriteBrands || []; state.preferences.favoriteBrands = active ? values.filter(function (value) { return value.toLowerCase() !== name.toLowerCase(); }) : values.concat(name); }, {reason:'favorite-brand'});
      App.storage.saveNow(); render();
      Array.from(document.querySelectorAll('[data-favorite-brand]')).find(function (entry) { return entry.dataset.favoriteBrand === name; })?.focus();
    });
    document.querySelector("#inventoryCatalogSearch").addEventListener("input", render); render();
  }
  App.inventoryCatalog = { matches: matches, brands: brands, isFavorite: isFavorite, init: init, render: render, data: data };
})();
