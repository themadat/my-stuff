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
      zone = zone || "Unassigned Zone";
      if (!zones.has(zone.toLowerCase())) zones.set(zone.toLowerCase(), { name: zone, rooms: new Map() });
      const rooms = zones.get(zone.toLowerCase()).rooms;
      if (!room && !spaces.length) return;
      room = room || "Unassigned Room";
      if (!rooms.has(room.toLowerCase())) rooms.set(room.toLowerCase(), { name: room, spaces: [] });
      const row = rooms.get(room.toLowerCase()); row.spaces = unique(row.spaces.concat(spaces));
    }
    config.locations.forEach(function (l) { location(l.zone, l.room, l.spaces); });
    config.rooms.filter(function (room) { return !config.locations.some(function (l) { return l.room.toLowerCase() === room.toLowerCase(); }); }).forEach(function (room) { location("", room, []); });
    items.forEach(function (item) {
      const property = function (key) { return item.properties.find(function (p) { return p.name.toLowerCase() === key; })?.value || ""; };
      const zone = property("zone") || config.locations.find(function (l) { return l.room.toLowerCase() === item.room.toLowerCase(); })?.zone;
      if (zone || item.room || property("space")) location(zone, item.room, property("space") ? [property("space")] : []);
    });
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
  function render() {
    const root = document.querySelector("#inventoryCatalog"); if (!root) return;
    const catalog = data(App.storage.getState().inventory.items), query = document.querySelector("#inventoryCatalogSearch").value.trim().toLowerCase();
    const matches = function (parts) { return parts.join(" ").toLowerCase().includes(query); };
    const chips = function (values, brandList) { return '<div class="catalog-chips">' + (brandList ? sortBrands(values) : values).map(function (value) { return brandList ? '<button type="button" data-favorite-brand="' + esc(value) + '" aria-pressed="' + isFavorite(value) + '" aria-label="' + (isFavorite(value) ? 'Unfavorite ' : 'Favorite ') + esc(value) + '">' + App.icons.markup('favoriteBrand') + ' ' + esc(value) + '</button>' : '<span>' + esc(value) + '</span>'; }).join('') + '</div>'; };
    const locations = catalog.locations.map(function (zone) {
      const rooms = zone.rooms.filter(function (room) { return matches([zone.name, room.name].concat(room.spaces)); });
      if (!rooms.length && !matches([zone.name])) return "";
      return '<section class="catalog-group"><h4>' + esc(zone.name) + '</h4>' + (rooms.length ? '<ul class="catalog-rooms">' + rooms.map(function (room) { return '<li><strong>' + esc(room.name) + '</strong>' + (room.spaces.length ? chips(room.spaces) : '<small>No Spaces</small>') + '</li>'; }).join("") + '</ul>' : '<p>No Rooms</p>') + '</section>';
    }).join("");
    const tags = catalog.tagGroups.map(function (g) { const values = (g.name === 'Brands' ? brands(App.storage.getState().inventory.items) : g.tags).filter(function (tag) { return matches([g.name, tag]); }); return values.length ? '<section class="catalog-group"><h4>' + esc(g.name) + '</h4>' + chips(values,g.name === 'Brands') + '</section>' : ''; }).join("");
    const groups = catalog.propertyGroups.map(function (g) {
      const values = g.properties.filter(function (p) { return matches([g.name, p.name].concat(p.units, p.values)); });
      return values.length ? '<section class="catalog-group"><h4>' + esc(g.name) + '</h4>' + values.map(function (p) { return '<div class="catalog-property"><strong>' + esc(p.name) + '</strong>' + (p.units.length ? ' <small>' + esc(p.units.join(" / ")) + '</small>' : '') + (p.values.length ? chips(p.values,p.name.toLowerCase() === 'brand') : '') + '</div>'; }).join("") + '</section>' : '';
    }).join("");
    root.innerHTML = [ ["Zones, Rooms & Spaces", locations], ["Tag Groups", tags], ["Property Groups & Values", groups] ].map(function (entry) { return '<section class="catalog-section"><h3>' + entry[0] + '</h3><div class="catalog-grid">' + (entry[1] || '<p>No Matching Options</p>') + '</div></section>'; }).join("");
    const names = document.querySelector("#inventoryPropertyNames"), colors = document.querySelector("#inventoryColorValues");
    if (names) names.innerHTML = unique(catalog.properties.map(function (p) { return p.name; })).map(function (name) { return '<option value="' + esc(name) + '"></option>'; }).join("");
    if (colors) colors.innerHTML = (catalog.properties.find(function (p) { return p.name.toLowerCase() === "color"; })?.values || []).map(function (value) { return '<option value="' + esc(value) + '"></option>'; }).join("");
  }
  function init() {
    document.body.insertAdjacentHTML("beforeend", '<datalist id="inventoryPropertyNames"></datalist><datalist id="inventoryColorValues"></datalist>');
    document.querySelector('#inventoryCatalog').addEventListener('click', function (event) {
      const button = event.target.closest('[data-favorite-brand]'); if (!button) return;
      const name = button.dataset.favoriteBrand, active = isFavorite(name);
      App.storage.mutate(function (state) { const values = state.preferences.favoriteBrands || []; state.preferences.favoriteBrands = active ? values.filter(function (value) { return value.toLowerCase() !== name.toLowerCase(); }) : values.concat(name); }, {reason:'favorite-brand'});
      App.storage.saveNow(); render();
      Array.from(document.querySelectorAll('[data-favorite-brand]')).find(function (entry) { return entry.dataset.favoriteBrand === name; })?.focus();
    });
    document.querySelector("#inventoryCatalogSearch").addEventListener("input", render); render();
  }
  App.inventoryCatalog = { brands: brands, isFavorite: isFavorite, init: init, render: render, data: data };
})();
