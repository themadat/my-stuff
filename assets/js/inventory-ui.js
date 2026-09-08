(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils, m = App.inventoryModel;
  const $ = function (selector, root) { return (root || document).querySelector(selector); };
  const $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  const esc = u.escapeHtml;
  let view = "have", editingId = "", originalItem = "", originalForm = "", archiveId = "", archiveOriginal = "", archiveForm = "", lastInventory = "", closing = false;
  function inventory() { return App.storage.getState().inventory; }
  function icon(name) { return '<span aria-hidden="true">' + App.icons.markup(name) + '</span>'; }
  function money(value) { return value == null ? "Not valued" : new Intl.NumberFormat(undefined, { style: "currency", currency: inventory().currency, maximumFractionDigits: 2 }).format(value); }
  function dateLabel(value) { return value ? new Date(value + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not recorded"; }
  function duration(item) { const days = m.daysOwned(item); return days == null ? "Duration unknown" : days.toLocaleString() + (days === 1 ? " day owned" : " days owned"); }
  function options(values, empty) { return (empty == null ? "" : '<option value="">' + esc(empty) + '</option>') + values.map(function (value) { return '<option value="' + esc(value) + '">' + esc(value) + '</option>'; }).join(""); }
  function unique(values) { return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) { return a.localeCompare(b); }); }
  function field(id, title, attributes) { return '<label class="field"><span>' + title + '</span><input id="' + id + '" ' + (attributes || 'type="text"') + '></label>'; }
  function select(id, title, content) { return '<label class="field"><span>' + title + '</span><select id="' + id + '">' + content + '</select></label>'; }
  function init() {
    $("#inventoryWorkspace").innerHTML = `
      <nav class="inventory-nav" aria-label="Your stuff">
        <button class="inventory-tab" type="button" data-inventory-view="have" aria-current="page">${icon("inventoryBox")}<span>Stuff I have</span><small id="haveCount">0</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="want">${icon("inventoryWant")}<span>Stuff I want</span><small>Later</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="research">${icon("search")}<span>Research</span><small>Later</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="previous">${icon("inventoryArchive")}<span>Previous stuff</span><small id="previousCount">0</small></button>
      </nav>
      <header class="inventory-heading"><div><span class="eyebrow">A place for everything</span><h1 id="inventoryTitle" tabindex="-1">Stuff I have</h1><p id="inventorySubtitle">Know what you own, where it lives, and what it’s worth.</p></div><button id="addItemButton" class="button primary" type="button">${icon("inventoryPlus")} Add an item</button></header>
      <div id="inventoryStats" class="inventory-stats" aria-label="All current inventory totals"></div>
      <div id="inventoryComingSoon" class="inventory-empty" hidden></div>
      <div id="inventoryBody" class="inventory-body">
        <section class="inventory-collection" aria-label="Your items">
          <div class="inventory-filterbar">
            ${field("inventorySearch", "Find an item", 'type="search" placeholder="Name, tag, source, or property…" maxlength="200"')}
            ${select("inventoryOwnerFilter", "Belongs to", '<option value="">Everyone</option><option value="house">The house</option><option value="me">Me</option>')}
            ${select("inventoryRoomFilter", "Room", '<option value="">All rooms</option>')}
            ${select("inventoryCategoryFilter", "Category", '<option value="">All categories</option>')}
          </div>
          <div class="inventory-list-heading"><span id="inventoryResultCount" role="status" aria-live="polite"></span><button id="clearInventoryFilters" class="button small" type="button" hidden>Clear filters</button></div>
          <div id="inventoryList"></div>
        </section>
        <aside id="roomOverview" class="room-overview" aria-labelledby="roomOverviewTitle"><div class="room-overview-heading">${icon("inventoryHome")}<h2 id="roomOverviewTitle">Around the house</h2></div><p>All current items, grouped by room and who they belong to.</p><div id="roomStats"></div><p class="inventory-footnote">Values are estimates. Items without a value are counted, but excluded from value totals.</p>${select("inventoryCurrency", "Values & prices in", options(App.config.inventory.currencies))}<p class="inventory-footnote">One currency for this inventory. Changing it relabels amounts; it does not convert them.</p></aside>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog id="itemDialog" class="app-dialog inventory-dialog" aria-labelledby="itemDialogTitle" data-backdrop-close="false"><form id="itemForm" class="dialog-shell">
        <header class="dialog-header"><div><span class="eyebrow">One object, all its details</span><h2 id="itemDialogTitle">Add an item</h2></div><button type="button" class="icon-button" data-inv-close="itemDialog" aria-label="Close item">${icon("close")}</button></header>
        <div class="dialog-body"><p id="itemFormError" class="inventory-error" role="alert" tabindex="-1" hidden></p>
          <div class="item-form-grid">
            <label class="field full"><span>Item name <small>(required)</small></span><input id="itemName" required maxlength="160" placeholder="e.g. Everyday trail shoes"></label>
            <label class="field full"><span>What is it?</span><textarea id="itemDescription" rows="2" maxlength="4000" placeholder="Brand, model, or a description that makes it yours"></textarea></label>
            ${select("itemOwner", "Belongs to", '<option value="me">Me</option><option value="house">The house</option>')}
            ${field("itemRoom", "Current room", 'type="text" list="inventoryRooms" maxlength="80" placeholder="Choose or type a room"')}
            <label class="field full"><span>Category tags</span><input id="itemCategories" maxlength="1800" placeholder="Shoes, Hiking, Clothing" list="inventoryCategories"><small>Separate tags with commas. Use a preset below, or create your own.</small></label>
          </div>
          <div id="categoryPresets" class="category-presets" aria-label="Category presets">${App.config.inventory.categories.map(function (category, index) { return '<button class="button small" type="button" data-category-preset="' + index + '">' + icon("inventoryPlus") + ' ' + esc(category.name) + '</button>'; }).join("")}</div>
          <fieldset class="item-fieldset"><legend>Getting it</legend><div class="item-form-grid">
            ${field("itemObtainedDate", "Date obtained", 'type="date"')}
            ${select("itemObtainedHow", "How it was obtained", options(m.methods, "Not recorded"))}
            <label class="field full"><span>Store, person, or source</span><input id="itemSource" maxlength="240" placeholder="Where did it come from?"></label>
            ${field("itemValue", 'Current value <span data-currency-label></span>', 'type="number" min="0" max="999999999.99" step="0.01" placeholder="Unknown"')}
            ${field("itemPrice", 'Obtaining price <span data-currency-label></span>', 'type="number" min="0" max="999999999.99" step="0.01" placeholder="Unknown"')}
          </div><p class="inventory-footnote">Leave unknown amounts blank. Use 0 for free items or items with no value.</p></fieldset>
          <fieldset class="item-fieldset"><legend>Properties</legend><p class="inventory-footnote">Suggested by category, customizable for each item. Changing tags never removes saved properties.</p><div id="itemProperties"></div><button id="addPropertyButton" class="button small" type="button">${icon("inventoryPlus")} Add a property</button></fieldset>
          <div id="itemArchiveSummary" class="item-archive-summary" hidden></div>
        </div>
        <footer class="dialog-footer inventory-editor-footer"><button id="archiveItemButton" class="button" type="button">${icon("inventoryArchive")} Archive…</button><button id="restoreItemButton" class="button" type="button" hidden>Return to stuff I have</button><span class="inventory-footer-spacer"></span><button class="button" type="button" data-inv-close="itemDialog">Cancel</button><button id="saveItemButton" class="button primary" type="submit">Save item</button></footer>
      </form></dialog>
      <dialog id="archiveDialog" class="app-dialog small-dialog" aria-labelledby="archiveTitle" data-backdrop-close="false"><form id="archiveForm" class="dialog-shell"><header class="dialog-header"><h2 id="archiveTitle">Move to previous stuff</h2><button class="icon-button" type="button" data-inv-close="archiveDialog" aria-label="Close archive">${icon("close")}</button></header><div class="dialog-body"><p id="archiveItemName"></p><p id="archiveError" class="inventory-error" role="alert" tabindex="-1" hidden></p><div class="item-form-grid">
        ${field("itemGoneDate", "Gone date", 'type="date" required')}
        ${select("itemGoneReason", "What happened?", '<option value="">Choose a reason</option>' + options(m.reasons))}
        <label class="field full"><span>Departure notes</span><textarea id="itemGoneNotes" maxlength="2000" rows="3" placeholder="Anything you want to remember"></textarea></label>
      </div><p id="archiveDuration" class="item-duration"></p><p class="inventory-footnote">The item and its details stay in Previous stuff. It will no longer count toward your current inventory totals. You can return it later.</p></div><footer class="dialog-footer"><button class="button" type="button" data-inv-close="archiveDialog">Cancel</button><button class="button primary" type="submit">Save departure</button></footer></form></dialog>
      <datalist id="inventoryRooms"></datalist><datalist id="inventoryCategories"></datalist>`);
    $("#itemGoneReason").required = true;
    $("#addItemButton").addEventListener("click", function () { openItem("", this); });
    $("#inventoryWorkspace").addEventListener("click", function (event) {
      const nav = event.target.closest("[data-inventory-view]"), item = event.target.closest("[data-edit-item]"), add = event.target.closest("[data-add-inventory]");
      if (nav) { view = nav.dataset.inventoryView; render(); $("#inventoryTitle").focus({ preventScroll: true }); }
      if (item) openItem(item.dataset.editItem, item);
      if (add) openItem("", add);
    });
    ["#inventorySearch", "#inventoryOwnerFilter", "#inventoryRoomFilter", "#inventoryCategoryFilter"].forEach(function (selector) { $(selector).addEventListener("input", renderList); });
    $("#clearInventoryFilters").addEventListener("click", function () { ["#inventorySearch", "#inventoryOwnerFilter", "#inventoryRoomFilter", "#inventoryCategoryFilter"].forEach(function (selector) { $(selector).value = ""; }); renderList(); $("#inventorySearch").focus(); });
    $("#inventoryCurrency").addEventListener("change", async function () {
      const currency = this.value;
      if (inventory().items.some(function (item) { return item.value != null || item.price != null; }) && !await App.components.confirm({ title: "Relabel all monetary amounts?", message: "This changes the inventory currency to " + currency + ", including previous items. Existing amounts will not be converted.", confirmLabel: "Change currency", trigger: this })) { this.value = inventory().currency; return; }
      App.storage.mutate(function (state) { state.inventory.currency = currency; }, { reason: "inventory-currency" });
    });
    $("#itemForm").addEventListener("submit", saveItem);
    $("#archiveForm").addEventListener("submit", saveArchive);
    $("#addPropertyButton").addEventListener("click", function () { addProperty({ name: "", value: "", unit: "" }, true); });
    $("#itemProperties").addEventListener("click", function (event) { const button = event.target.closest("[data-remove-property]"); if (button) { button.closest(".item-property").remove(); $("#addPropertyButton").focus(); } });
    $("#categoryPresets").addEventListener("click", function (event) {
      const button = event.target.closest("[data-category-preset]"); if (!button) return;
      const preset = App.config.inventory.categories[Number(button.dataset.categoryPreset)];
      $("#itemCategories").value = m.tags($("#itemCategories").value + "," + preset.name).join(", "); suggestProperties();
    });
    $("#itemCategories").addEventListener("change", suggestProperties);
    $("#archiveItemButton").addEventListener("click", function () {
      if (formSignature("#itemForm") !== originalForm) return formError("#itemFormError", "Save your item edits before recording its departure.");
      try { openArchive(editingId); } catch (error) { formError("#itemFormError", error.message); }
    });
    $("#restoreItemButton").addEventListener("click", restoreItem);
    ["#itemGoneDate", "#itemGoneReason"].forEach(function (selector) { $(selector).addEventListener("input", renderArchiveDuration); });
    $$('[data-inv-close]').forEach(function (button) { button.addEventListener("click", function () { dismiss(this.dataset.invClose); }); });
    ["itemDialog", "archiveDialog"].forEach(function (id) { $("#" + id).addEventListener("cancel", function (event) { event.preventDefault(); dismiss(id); }); });
    window.addEventListener("app:statechange", function () {
      const json = JSON.stringify(inventory());
      if (json !== lastInventory) render();
    });
    render();
  }
  function refreshOptions(selector, values, label) { const el = $(selector), value = el.value; el.innerHTML = options(values, label); el.value = values.includes(value) ? value : ""; }
  function render() {
    const data = inventory(), stats = m.stats(data.items);
    lastInventory = JSON.stringify(data);
    $("#haveCount").textContent = stats.all.count;
    $("#previousCount").textContent = data.items.length - stats.all.count;
    $$('[data-inventory-view]').forEach(function (button) { if (button.dataset.inventoryView === view) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
    const titles = { have: "Stuff I have", previous: "Previous stuff", want: "Stuff I want", research: "Research & compare" };
    $("#inventoryTitle").textContent = titles[view];
    $("#inventorySubtitle").textContent = view === "have" ? "Know what you own, where it lives, and what it’s worth." : view === "previous" ? "Gone, but not forgotten. The things that were part of your life." : "A little space for what comes next.";
    const active = view === "have" || view === "previous";
    $("#inventoryBody").hidden = !active; $("#inventoryComingSoon").hidden = active;
    $("#addItemButton").hidden = view !== "have"; $("#inventoryStats").hidden = view !== "have";
    $("#roomOverview").hidden = view !== "have"; $("#inventoryBody").classList.toggle("previous-view", view === "previous");
    if (!active) $("#inventoryComingSoon").innerHTML = icon(view === "want" ? "inventoryWant" : "search") + '<h2>' + (view === "want" ? "Your someday list, coming later." : "Good decisions start with a little research.") + '</h2><p>We’re focusing on the stuff you have first. ' + (view === "want" ? "Wish-list tracking" : "Research and comparison tools") + ' will live here in a future update.</p>';
    $("#inventoryStats").innerHTML = [["all", "Everything I have", "inventoryBox"], ["house", "Belongs to the house", "inventoryHome"], ["me", "Belongs to me", "inventoryPerson"]].map(function (entry) {
      const total = stats[entry[0]];
      return '<section class="inventory-stat" data-inventory-total="' + entry[0] + '"><div class="inventory-stat-label">' + icon(entry[2]) + '<h2>' + entry[1] + '</h2></div><div class="inventory-stat-count">' + total.count.toLocaleString() + '<span>objects</span></div><div class="inventory-stat-value">' + esc(money(total.valueCents / 100)) + '<small>known value' + (total.unknown ? ' · ' + total.unknown + ' not valued' : '') + '</small></div></section>';
    }).join("");
    $("#roomStats").innerHTML = stats.rooms.length ? '<table class="room-stats-table"><caption class="visually-hidden">Object counts and known values per room</caption><thead><tr><th scope="col">Room</th><th scope="col">House</th><th scope="col">Me</th></tr></thead><tbody>' + stats.rooms.map(function (room) { return '<tr><th scope="row">' + esc(room.name) + '</th>' + ["house", "me"].map(function (owner) { const total = room[owner]; return '<td><strong>' + total.count + '</strong><small>' + esc(money(total.valueCents / 100)) + '</small>' + (total.unknown ? '<small>' + total.unknown + ' not valued</small>' : '') + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table>' : '<p class="room-empty">Your rooms will appear as you add items. Both house and personal belongings can share the same room.</p>';
    $("#inventoryCurrency").value = data.currency;
    refreshOptions("#inventoryRoomFilter", unique(data.items.map(function (item) { return item.room || "Unassigned"; })), "All rooms");
    refreshOptions("#inventoryCategoryFilter", unique(data.items.flatMap(function (item) { return item.categories; })), "All categories");
    $("#inventoryRooms").innerHTML = options(unique(App.config.inventory.rooms.concat(data.items.map(function (item) { return item.room; }))));
    $("#inventoryCategories").innerHTML = options(unique(App.config.inventory.categories.map(function (category) { return category.name; }).concat(data.items.flatMap(function (item) { return item.categories; }))));
    renderList();
  }
  function renderList() {
    const search = $("#inventorySearch").value.trim().toLowerCase(), owner = $("#inventoryOwnerFilter").value, room = $("#inventoryRoomFilter").value, category = $("#inventoryCategoryFilter").value;
    const all = inventory().items.filter(function (item) { return Boolean(item.archive) === (view === "previous"); });
    const items = all.filter(function (item) {
      return (!owner || item.owner === owner) && (!room || (item.room || "Unassigned") === room) && (!category || item.categories.includes(category)) && (!search || [item.name, item.description, item.source, item.room, item.categories.join(" "), item.properties.map(function (p) { return [p.name, p.value, p.unit].join(" "); }).join(" "), item.archive?.reason, item.archive?.notes].join(" ").toLowerCase().includes(search));
    }).sort(function (a, b) { return view === "previous" ? b.archive.date.localeCompare(a.archive.date) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name); });
    $("#inventoryResultCount").textContent = items.length + " of " + all.length + " " + (view === "previous" ? "previous" : "current") + " objects";
    $("#clearInventoryFilters").hidden = !(search || owner || room || category);
    if (!items.length) {
      $("#inventoryList").innerHTML = '<div class="inventory-empty">' + icon(view === "previous" ? "inventoryArchive" : "inventoryBox") + '<h2>' + (all.length ? "Nothing matches just yet." : view === "previous" ? "A history, without the clutter." : "Start with something you see.") + '</h2><p>' + (all.length ? "Try another search or clear your filters." : view === "previous" ? "Archive an item when it’s lost, broken, sold, or otherwise gone. Its story stays here." : "Your favorite shoes. The kitchen table. That cable in the drawer. Add one object and build from there.") + '</p>' + (!all.length && view === "have" ? '<button class="button primary" type="button" data-add-inventory>' + icon("inventoryPlus") + ' Add your first item</button>' : '') + '</div>'; return;
    }
    $("#inventoryList").innerHTML = '<div class="inventory-table-wrap"><table class="inventory-table"><caption class="visually-hidden">' + (view === "previous" ? "Previous" : "Current") + ' items. Select an item to view or edit all details.</caption><thead><tr><th scope="col">Item</th><th scope="col">Room / belongs to</th><th scope="col">Value</th><th scope="col">' + (view === "previous" ? "Departure" : "Obtained") + '</th></tr></thead><tbody>' + items.map(function (item) {
      return '<tr><td><button class="inventory-item-name" type="button" data-edit-item="' + esc(item.id) + '">' + esc(item.name) + '</button>' + (item.description ? '<p class="inventory-item-description">' + esc(item.description) + '</p>' : '') + '<div class="item-tags">' + item.categories.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join("") + '</div></td><td><span>' + esc(item.room || "Unassigned") + '</span><small>' + (item.owner === "house" ? "The house" : "Me") + '</small></td><td class="item-money">' + esc(money(item.value)) + '</td><td>' + (item.archive ? '<strong>' + esc(item.archive.reason) + '</strong><small>' + esc(dateLabel(item.archive.date)) + '</small><small>' + esc(duration(item)) + '</small>' : esc(dateLabel(item.obtainedDate)) + (item.obtainedHow ? '<small>' + esc(item.obtainedHow) + '</small>' : '')) + '</td></tr>';
    }).join("") + '</tbody></table></div>';
  }
  function formSignature(selector) { return JSON.stringify($$("input, textarea, select", $(selector)).map(function (el) { return el.value; })); }
  function formError(selector, message) { const el = $(selector); el.textContent = message; el.hidden = false; el.focus(); }
  function addProperty(property, focus) {
    if ($$(".item-property").length >= 40) return formError("#itemFormError", "Use up to 40 properties per item.");
    const row = document.createElement("div"); row.className = "item-property";
    row.innerHTML = '<label class="field"><span>Property</span><input data-property-name maxlength="60" required placeholder="e.g. Weight" value="' + esc(property.name) + '"></label><label class="field"><span>Value</span><input data-property-value maxlength="300" placeholder="e.g. 240" value="' + esc(property.value || "") + '"></label><label class="field"><span>Unit</span><input data-property-unit maxlength="30" placeholder="e.g. g" value="' + esc(property.unit) + '"></label><button class="icon-button" type="button" data-remove-property aria-label="Remove property">' + icon("close") + '</button>';
    $("#itemProperties").appendChild(row); if (focus) $("input", row).focus();
  }
  function suggestProperties() {
    const tags = m.tags($("#itemCategories").value).map(function (tag) { return tag.toLowerCase(); });
    App.config.inventory.categories.filter(function (category) { return tags.includes(category.name.toLowerCase()); }).forEach(function (category) {
      category.properties.forEach(function (property) { if (!$$('[data-property-name]').some(function (el) { return el.value.trim().toLowerCase() === property.name.toLowerCase(); })) addProperty(property); });
    });
  }
  function openItem(id, trigger) {
    const item = inventory().items.find(function (entry) { return entry.id === id; });
    if (id && !item) return;
    editingId = id; originalItem = item ? JSON.stringify(item) : "";
    $("#itemForm").reset(); $("#itemFormError").hidden = true;
    $("#itemDialogTitle").textContent = id ? "Item details" : "Add an item";
    const values = item || { owner: "me", categories: [], properties: [] };
    ["name", "description", "owner", "room", "obtainedDate", "obtainedHow", "source", "value", "price"].forEach(function (key) { $("#item" + key[0].toUpperCase() + key.slice(1)).value = values[key] ?? ""; });
    $("#itemObtainedDate").max = m.today();
    $("#itemCategories").value = values.categories.join(", ");
    $("#itemProperties").innerHTML = ""; values.properties.forEach(function (property) { addProperty(property); });
    $$('[data-currency-label]').forEach(function (el) { el.textContent = "(" + inventory().currency + ")"; });
    $("#archiveItemButton").hidden = !id;
    $("#archiveItemButton").innerHTML = icon("inventoryArchive") + (item?.archive ? " Edit departure…" : " Archive…");
    $("#restoreItemButton").hidden = !item?.archive;
    $("#itemArchiveSummary").hidden = !item?.archive;
    if (item?.archive) $("#itemArchiveSummary").textContent = item.archive.reason + " · " + dateLabel(item.archive.date) + " · " + duration(item) + (item.archive.notes ? "\n" + item.archive.notes : "");
    originalForm = formSignature("#itemForm");
    App.components.openDialog("#itemDialog", { trigger: trigger, focus: "#itemName" });
  }
  function currentItemUnchanged(id, snapshot) { const item = inventory().items.find(function (entry) { return entry.id === id; }); if (!item || JSON.stringify(item) !== snapshot) throw new Error("This item changed while you were editing. Close and reopen it to use the latest copy."); return item; }
  function saveItem(event) {
    event.preventDefault();
    try {
      const previous = editingId ? currentItemUnchanged(editingId, originalItem) : null;
      if (!previous && inventory().items.length >= 5000) throw new Error("This inventory has reached its 5,000-item limit.");
      const item = { id: editingId || u.uid("item"), archive: previous?.archive || null };
      ["name", "description", "owner", "room", "obtainedDate", "obtainedHow", "source", "value", "price"].forEach(function (key) { item[key] = $("#item" + key[0].toUpperCase() + key.slice(1)).value; });
      item.categories = m.tags($("#itemCategories").value);
      item.properties = $$(".item-property").map(function (row) { return { name: $("[data-property-name]", row).value, value: $("[data-property-value]", row).value, unit: $("[data-property-unit]", row).value }; });
      const next = m.normalizeItem(item);
      App.storage.mutate(function (state) { if (previous) state.inventory.items = state.inventory.items.map(function (entry) { return entry.id === next.id ? next : entry; }); else state.inventory.items.push(next); }, { reason: "inventory-save" });
      const saved = App.storage.saveNow(); App.components.closeDialog("#itemDialog", "saved");
      App.components.toast(saved ? next.name + " is in your inventory." : "Browser storage is unavailable. Export a backup before closing this tab.", { title: saved ? "Item saved" : "Saved for this session only", kind: saved ? "success" : "warning" });
      $(view === "have" ? "#addItemButton" : "#inventoryTitle").focus();
    } catch (error) { formError("#itemFormError", error.message); }
  }
  function openArchive(id) {
    const item = currentItemUnchanged(id, originalItem);
    archiveId = id; archiveOriginal = JSON.stringify(item);
    $("#archiveForm").reset(); $("#archiveError").hidden = true;
    $("#archiveItemName").textContent = item.name;
    $("#itemGoneDate").value = item.archive?.date || m.today(); $("#itemGoneDate").min = item.obtainedDate; $("#itemGoneDate").max = m.today();
    $("#itemGoneReason").value = item.archive?.reason || ""; $("#itemGoneNotes").value = item.archive?.notes || "";
    archiveForm = formSignature("#archiveForm"); renderArchiveDuration();
    App.components.openDialog("#archiveDialog", { trigger: $("#archiveItemButton"), focus: "#itemGoneReason" });
  }
  function renderArchiveDuration() { const item = inventory().items.find(function (entry) { return entry.id === archiveId; }); if (item) $("#archiveDuration").textContent = item.obtainedDate && $("#itemGoneDate").value ? m.daysOwned(item, $("#itemGoneDate").value).toLocaleString() + " days owned" : "Add an obtained date to track how long you owned it."; }
  function saveArchive(event) {
    event.preventDefault();
    try {
      const item = currentItemUnchanged(archiveId, archiveOriginal);
      const next = m.normalizeItem(Object.assign({}, item, { archive: { date: $("#itemGoneDate").value, reason: $("#itemGoneReason").value, notes: $("#itemGoneNotes").value } }));
      App.storage.mutate(function (state) { state.inventory.items = state.inventory.items.map(function (entry) { return entry.id === next.id ? next : entry; }); }, { reason: "inventory-archive" });
      App.storage.saveNow(); App.components.closeDialog("#archiveDialog", "saved"); App.components.closeDialog("#itemDialog", "saved");
      App.components.toast(next.name + " is in Previous stuff. Its details are preserved.", { title: "Item archived", kind: "success" });
      $('[data-inventory-view="previous"]').focus();
    } catch (error) { formError("#archiveError", error.message); }
  }
  async function restoreItem() {
    try {
      if (formSignature("#itemForm") !== originalForm) throw new Error("Save your edits before returning this item to your current inventory.");
      if (!await App.components.confirm({ title: "Return this item to stuff I have?", message: "It will count toward your current inventory again. Its departure date and reason will be cleared; all other details stay.", confirmLabel: "Return item", trigger: this })) return;
      currentItemUnchanged(editingId, originalItem);
      App.storage.mutate(function (state) { state.inventory.items.find(function (item) { return item.id === editingId; }).archive = null; }, { reason: "inventory-return" });
      App.storage.saveNow(); App.components.closeDialog("#itemDialog", "saved");
      App.components.toast("The item is back in your current inventory.", { title: "Welcome back", kind: "success" });
      $('[data-inventory-view="have"]').focus();
    } catch (error) { formError("#itemFormError", error.message); }
  }
  async function dismiss(id) {
    if (closing) return;
    closing = true;
    try {
      const dirty = id === "itemDialog" ? formSignature("#itemForm") !== originalForm : formSignature("#archiveForm") !== archiveForm;
      if (dirty && !await App.components.confirm({ title: "Discard unsaved edits?", message: "These form changes have not been saved. Your existing item will stay unchanged.", confirmLabel: "Discard edits", danger: true, trigger: document.activeElement })) return;
      App.components.closeDialog("#" + id);
      if (id === "archiveDialog") $("#archiveItemButton").focus();
    } finally { closing = false; }
  }
  App.inventoryUI = { init: init, render: render, openItem: openItem };
})();
