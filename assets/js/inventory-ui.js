(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils, m = App.inventoryModel;
  const $ = function (selector, root) { return (root || document).querySelector(selector); };
  const $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  const esc = u.escapeHtml;
  let view = "have", editingId = "", originalItem = "", originalForm = "", archiveId = "", archiveOriginal = "", archiveForm = "", lastInventory = "", closing = false;
  let editingCopies = [];
  function inventory() { return App.storage.getState().inventory; }
  function icon(name) { return '<span aria-hidden="true">' + App.icons.markup(name) + '</span>'; }
  function money(value) { return value == null ? "Not valued" : new Intl.NumberFormat(undefined, { style: "currency", currency: inventory().currency, maximumFractionDigits: 2 }).format(value); }
  function dateLabel(value) { return value ? new Date(value + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not recorded"; }
  function duration(item) { const days = m.daysOwned(item); return days == null ? "Duration unknown" : days.toLocaleString() + (days === 1 ? " day owned" : " days owned"); }
  function options(values, empty) { return (empty == null ? "" : '<option value="">' + esc(empty) + '</option>') + values.map(function (value) { return '<option value="' + esc(value) + '">' + esc(value) + '</option>'; }).join(""); }
  function unique(values) { return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) { return a.localeCompare(b); }); }
  function field(id, title, attributes) { return '<label class="field"><span>' + title + '</span><input id="' + id + '" ' + (attributes || 'type="text"') + '></label>'; }
  function select(id, title, content) { return '<label class="field"><span>' + title + '</span><select id="' + id + '">' + content + '</select></label>'; }
  function segments(id, title, values) {
    return '<fieldset class="item-segments"><legend>' + title + '</legend><input type="hidden" id="' + id + '"><div class="segment-track">' + values.map(function (entry) { return '<label><input type="radio" name="' + id + 'Choice" value="' + esc(entry[0]) + '"><span>' + esc(entry[1]) + '</span></label>'; }).join("") + '</div></fieldset>';
  }
  function picker(id, title, placeholder) {
    return '<div class="field picker"><label for="' + id + '">' + title + '</label><input id="' + id + '" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + id + 'Options" autocomplete="off" maxlength="80" placeholder="' + placeholder + '"><div id="' + id + 'Options" class="picker-options" role="listbox" aria-label="' + title + ' Suggestions" hidden></div></div>';
  }
  function init() {
    $("#inventoryWorkspace").innerHTML = `
      <nav class="inventory-nav" aria-label="Your stuff">
        <button class="inventory-tab" type="button" data-inventory-view="have" aria-current="page">${icon("inventoryBox")}<span>Stuff I Have</span><small id="haveCount">0</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="want">${icon("inventoryWant")}<span>Stuff I Want</span><small>Later</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="research">${icon("inventoryResearch")}<span>Research</span><small>Later</small></button>
        <button class="inventory-tab" type="button" data-inventory-view="previous">${icon("inventoryArchive")}<span>Stuff I Had</span><small id="previousCount">0</small></button>
      </nav>
      <header class="inventory-heading"><div><span class="eyebrow">A Place for Everything</span><h1 id="inventoryTitle" tabindex="-1">Stuff I Have</h1><p id="inventorySubtitle">Know what you own, where it lives, and what it’s worth.</p></div><div id="inventoryStats" class="inventory-stats" aria-label="Ownership filters and totals"></div><button id="addItemButton" class="button primary" type="button">${icon("inventoryPlus")} Add an Item</button></header>
      <div id="inventoryComingSoon" class="inventory-empty" hidden></div>
      <div id="inventoryBody" class="inventory-body">
        <section class="inventory-collection" aria-label="Your items">
          <div class="inventory-filterbar">
            ${field("inventorySearch", "Find an Item", 'type="search" placeholder="Name, tag, source, or property…" maxlength="200"')}
            <input type="hidden" id="inventoryOwnerFilter" value="">
            ${select("inventoryRoomFilter", "Room", '<option value="">All Rooms</option>')}
            ${select("inventoryCategoryFilter", "Category", '<option value="">All Categories</option>')}
          </div>
          <div id="categoryCards" class="category-cards" aria-label="Quick category filters"></div>
          <div class="inventory-list-heading"><span id="inventoryResultCount" role="status" aria-live="polite"></span><button id="clearInventoryFilters" class="button small" type="button" hidden>Clear Filters</button></div>
          <div id="inventoryList"></div>
        </section>
        <aside id="roomOverview" class="room-overview" aria-labelledby="roomOverviewTitle"><div class="room-overview-heading">${icon("inventoryHome")}<h2 id="roomOverviewTitle">Around the House</h2></div><p>All current items, grouped by room and who they belong to.</p><div id="roomStats"></div><p class="inventory-footnote">Values are estimates. Items without a value are counted, but excluded from value totals.</p><p class="inventory-footnote">All values and prices are in USD.</p></aside>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog id="itemDialog" class="app-dialog inventory-dialog" aria-labelledby="itemDialogTitle" data-backdrop-close="false"><form id="itemForm" class="dialog-shell">
        <header class="dialog-header"><div><h2 id="itemDialogTitle">Add an Item</h2></div><button type="button" class="icon-button" data-inv-close="itemDialog" aria-label="Close item">${icon("close")}</button></header>
        <div class="dialog-body"><p id="itemFormError" class="inventory-error" role="alert" tabindex="-1" hidden></p>
          <section class="smart-entry" aria-label="Smart Complete">
            <div class="smart-heading"><label for="itemSmartEntry">Smart Complete</label><p id="smartHint">Highlights show what goes where. Edit any field below.</p><button type="button" id="smartExample" class="button small">Try Example</button></div>
            <textarea id="itemSmartEntry" rows="1" maxlength="12000" placeholder="Paste a purchase line, or type an item…" aria-describedby="smartHint"></textarea>
            <div id="smartPreview" class="smart-preview" hidden></div><div id="smartDestinations" class="smart-destinations" aria-live="polite"></div>
          </section>
          <div class="item-form-grid compact-item-grid">
            <div class="full item-identity-row">
              ${field("itemSource", "Seller", 'type="text" maxlength="240" placeholder="Seller"')}
              ${field("itemBrand", "Brand", 'type="text" maxlength="300" placeholder="Brand"')}
              <label class="field"><span>Object <small>(required)</small> <small id="objectWordHint">Right-click → Brand · Control-click → Delete <span class="visually-hidden">Or use Alt+ArrowUp to move the word at the caret, Alt+Delete to remove it, and Control+Z or Command+Z to undo.</span></small></span><input id="itemName" required maxlength="160" placeholder="Object" aria-describedby="objectWordHint" aria-keyshortcuts="Alt+ArrowUp Alt+Delete"><span id="objectWordStatus" class="visually-hidden" role="status" aria-live="polite"></span></label>
            </div>
            <div class="full item-purchase-row">
              ${field("itemPrice", 'Obtaining Price <span data-currency-label></span>', 'type="number" min="0" max="999999999.99" step="0.01" placeholder="Unknown"')}
              ${field("itemValue", 'Current Value <span data-currency-label></span>', 'type="number" min="0" max="999999999.99" step="0.01" placeholder="Unknown"')}
              ${field("itemObtainedDate", "Date Obtained", 'type="date"')}
              ${segments("itemOwner", "Belongs to", [["me", "Me"], ["house", "House"]])}
              ${segments("itemObtainedHow", "Obtained", m.methods.map(function (method) { return [method, method]; }).concat([["", "Unknown"]]))}
            </div>
            <div class="full item-location-row">
              ${picker("itemZone", "Zone", "Search zones…")}${picker("itemRoom", "Room", "Search rooms…")}${picker("itemSpace", "Space", "Search spaces…")}
              <div><input type="hidden" id="itemCategories">${picker("itemTagSearch", "Tags", "Search or add tags…")}<div id="selectedItemTags" class="selected-tags" aria-label="Selected Tags"></div></div>
            </div>
          </div>
          <div id="itemCopyLocations" class="copy-locations" hidden></div><datalist id="copyRoomOptions"></datalist>
          <details id="itemMoreDetails" class="item-more" open><summary>More Details <span id="itemMoreCount"></span></summary>
            <div class="item-more-content">
              <label class="field"><span>Notes / Description</span><textarea id="itemDescription" rows="2" maxlength="4000" placeholder="Details and unrecognized purchase text"></textarea></label>
              <fieldset class="item-fieldset"><legend>Custom Properties</legend>
                <div class="item-property-tools"><button id="addColorButton" class="button small" type="button">${icon("inventoryPlus")} Color</button><div id="categoryPresets" class="category-presets" aria-label="Category Presets">${App.config.inventory.categories.map(function (category, index) { return '<button class="button small" type="button" data-category-preset="' + index + '">' + icon("inventoryPlus") + ' ' + esc(category.name) + '</button>'; }).join("")}</div><button id="addPropertyButton" class="button small" type="button">${icon("inventoryPlus")} Add a Property</button></div>
                <div id="itemProperties"></div>
              </fieldset>
            </div>
          </details>
          <div id="itemArchiveSummary" class="item-archive-summary" hidden></div>
        </div>
        <footer class="dialog-footer inventory-editor-footer"><label id="itemCopiesField" class="copies-control">Total Copies <input id="itemCopies" type="number" min="1" max="100" step="1" value="1" required aria-describedby="itemCopiesHint"><small id="itemCopiesHint">Price &amp; value are per copy</small></label><button id="deleteItemButton" class="button danger" type="button" hidden>Delete Item…</button><button id="archiveItemButton" class="button" type="button">${icon("inventoryArchive")} Archive…</button><button id="restoreItemButton" class="button" type="button" hidden>Return to Stuff I Have</button><span class="inventory-footer-spacer"></span><button class="button" type="button" data-inv-close="itemDialog">Cancel</button><button id="saveItemButton" class="button primary" type="submit">Save Item</button></footer>
      </form></dialog>
      <dialog id="archiveDialog" class="app-dialog small-dialog" aria-labelledby="archiveTitle" data-backdrop-close="false"><form id="archiveForm" class="dialog-shell"><header class="dialog-header"><h2 id="archiveTitle">Move to Stuff I Had</h2><button class="icon-button" type="button" data-inv-close="archiveDialog" aria-label="Close archive">${icon("close")}</button></header><div class="dialog-body"><p id="archiveItemName"></p><p id="archiveError" class="inventory-error" role="alert" tabindex="-1" hidden></p><div class="item-form-grid">
        ${field("itemGoneDate", "Gone Date", 'type="date" required')}
        ${select("itemGoneReason", "What Happened?", '<option value="">Choose a reason</option>' + options(m.reasons))}
        <label class="field full"><span>Departure Notes</span><textarea id="itemGoneNotes" maxlength="2000" rows="3" placeholder="Anything you want to remember"></textarea></label>
      </div><p id="archiveDuration" class="item-duration"></p><p class="inventory-footnote">The item and its details stay in Stuff I Had. It will no longer count toward your current inventory totals. You can return it later.</p></div><footer class="dialog-footer"><button class="button" type="button" data-inv-close="archiveDialog">Cancel</button><button class="button primary" type="submit">Save Departure</button></footer></form></dialog>
`);
    initSmartControls();
    ["#itemPrice","#itemValue"].forEach(function (id) { $(id).addEventListener("blur", function () { setTimeout(fillMissingAmount,0); }); });
    initObjectWords();
    $("#itemGoneReason").required = true;
    $("#addItemButton").addEventListener("click", function () { openItem("", this); });
    $("#inventoryWorkspace").addEventListener("click", function (event) {
      const nav = event.target.closest("[data-inventory-view]"), item = event.target.closest("[data-edit-item]"), add = event.target.closest("[data-add-inventory]");
      if (nav) { view = nav.dataset.inventoryView; render(); $("#inventoryTitle").focus({ preventScroll: true }); }
      if (item) openItem(item.dataset.editItem, item);
      if (add) openItem("", add);
    });
    ["#inventorySearch", "#inventoryOwnerFilter", "#inventoryRoomFilter", "#inventoryCategoryFilter"].forEach(function (selector) { $(selector).addEventListener("input", renderList); });
    $('#inventoryStats').addEventListener('click', function (event) { const button = event.target.closest('[data-owner-filter]'); if (button) { $('#inventoryOwnerFilter').value = button.dataset.ownerFilter; renderList(); } });
    $('#categoryCards').addEventListener('click', function (event) { const button = event.target.closest('[data-category-filter]'); if (button) { const el = $('#inventoryCategoryFilter'); const selected = button.dataset.categoryFilter; el.value = el.value === selected ? '' : selected; renderList(); $$('#categoryCards [data-category-filter]').find(function (entry) { return entry.dataset.categoryFilter === selected; })?.focus({preventScroll:true}); } });
    $("#clearInventoryFilters").addEventListener("click", function () { ["#inventorySearch", "#inventoryOwnerFilter", "#inventoryRoomFilter", "#inventoryCategoryFilter"].forEach(function (selector) { $(selector).value = ""; }); renderList(); $("#inventorySearch").focus(); });
    $("#itemForm").addEventListener("submit", saveItem);
    $("#itemCopies").addEventListener("input", renderCopyLocations);
    $('#itemCopyLocations').addEventListener('input', function (event) {
      const row = event.target.closest('[data-copy-location]'); if (!row) return;
      const space = $('[data-copy-space]',row), room = $('[data-copy-room]',row).value.trim();
      if (event.target.matches('[data-copy-room]')) {
        space.value = '';
        $('#' + space.getAttribute('list')).innerHTML = options(unique(App.config.inventory.locations.filter(function (l) { return !room || l.room.toLowerCase() === room.toLowerCase(); }).flatMap(function (l) { return l.spaces; })));
      }
      if (editingId && row === $('[data-copy-location]')) {
        ['room','space','zone'].forEach(function (key) { smartManual.add(key); });
        $('#itemRoom').value = room; $('#itemSpace').value = space.value;
        $('#itemZone').value = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === room.toLowerCase(); })?.zone || '';
      }
    });
    $("#addColorButton").addEventListener("click", function () {
      const existing = $$('[data-property-name]').find(function (el) { return el.value.trim().toLowerCase() === "color"; });
      if (existing) { $("#itemMoreDetails").open = true; $('[data-property-value]', existing.closest('.item-property')).focus(); }
      else addProperty({ name: "Color", value: "", unit: "" }, true);
    });
    $("#deleteItemButton").addEventListener("click", async function () {
      try {
        const item = currentItemUnchanged(editingId, originalItem);
        if (!await App.components.confirm({ title: "Delete This Item?", message: 'Permanently delete “' + item.name + '” from this inventory? Other copies will stay. This cannot be undone.', confirmLabel: "Delete Item", danger: true, trigger: this })) return;
        currentItemUnchanged(editingId, originalItem);
        App.storage.mutate(function (state) { state.inventory.items = state.inventory.items.filter(function (entry) { return entry.id !== item.id; }); }, { reason: "inventory-delete" });
        const saved = App.storage.saveNow(); App.components.closeDialog("#itemDialog", "deleted");
        App.components.toast(saved ? "Item deleted." : "Deleted for this session only. Browser storage is unavailable.", { kind: saved ? "success" : "warning" });
        $('#inventoryTitle').focus();
      } catch (error) { formError("#itemFormError", error.message); }
    });
    $("#archiveForm").addEventListener("submit", saveArchive);
    $("#addPropertyButton").addEventListener("click", function () { addProperty({ name: "", value: "", unit: "" }, true); });
    $("#itemProperties").addEventListener("click", function (event) { const button = event.target.closest("[data-remove-property]"); if (button) { button.closest(".item-property").remove(); renderPresets(); $("#addPropertyButton").focus(); } });
    $("#categoryPresets").addEventListener("click", function (event) {
      const button = event.target.closest("[data-category-preset]"); if (!button) return;
      const preset = App.config.inventory.categories[Number(button.dataset.categoryPreset)];
      const active = button.getAttribute('aria-pressed') === 'true';
      smartManual.add('categories'); $('#itemCategories').removeAttribute('data-smart-field');
      if (active) {
        preset.properties.forEach(function (p) { smartManual.add(p.name.toLowerCase()); });
        const remaining = m.tags($('#itemCategories').value).filter(function (tag) { return tag.toLowerCase() !== preset.name.toLowerCase(); });
        const shared = App.config.inventory.categories.filter(function (c) { return remaining.some(function (tag) { return tag.toLowerCase() === c.name.toLowerCase(); }); }).flatMap(function (c) { return c.properties.map(function (p) { return p.name.toLowerCase(); }); });
        $$('.item-property').forEach(function (row) { const name = $('[data-property-name]',row).value.toLowerCase(); if (preset.properties.some(function (p) { return p.name.toLowerCase() === name; }) && !shared.includes(name)) row.remove(); });
        $('#itemCategories').value = remaining.join(', ');
      } else { $('#itemCategories').value = m.tags($('#itemCategories').value + ',' + preset.name).join(', '); suggestProperties(); }
      renderTags(); renderPresets();
    });

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
  const smartLabels = { name: "Object", brand: "Brand", source: "Seller", price: "Obtaining Price", value: "Value", owner: "Belongs to", obtainedHow: "Obtained", description: "Notes", obtainedDate: "Date Obtained", room: "Room", zone: "Zone", space: "Space", categories: "Tags", volume: "Volume" };
  let smartApplied = {}, smartManual = new Set(), objectWordHistory = [];
  function smartField(key) { if (key === "volume") { const row = $$('[data-property-name]').find(function (el) { return el.value.toLowerCase() === 'volume'; })?.closest('.item-property'); return row ? $('[data-property-value]', row) : null; } return $("#item" + key[0].toUpperCase() + key.slice(1)); }
  function resetSmart() {
    smartApplied = {}; smartManual = new Set(); objectWordHistory = [];
    $("#objectWordStatus").textContent = "";
    $("#itemSmartEntry").value = ""; $("#smartPreview").hidden = true; $("#smartPreview").textContent = ""; $("#smartDestinations").textContent = "";
    $$("[data-smart-field]").forEach(function (el) { el.removeAttribute("data-smart-field"); });
  }
  function syncSegments() {
    ["itemOwner", "itemObtainedHow"].forEach(function (id) { $$('input[name="' + id + 'Choice"]').forEach(function (el) { el.checked = el.value === $("#" + id).value; }); });
  }
  function completeSmart(previewOnly) {
    previewOnly = previewOnly === true;
    const text = $("#itemSmartEntry").value;
    const brands = App.config.inventory.brands.concat(inventory().items.flatMap(function (item) { return item.properties.filter(function (p) { return p.name.toLowerCase() === "brand"; }).map(function (p) { return p.value; }); }));
    const result = App.smartEntry.parse(text, brands);
    if (!previewOnly && result.fields.volume && !smartField('volume') && !smartManual.has('volume')) addProperty({ name: 'Volume', value: '', unit: result.fields.volumeUnit || 'oz' });
    Object.keys(smartLabels).forEach(function (key) {
      const el = smartField(key), next = result.fields[key];
      if (!el || previewOnly) return;
      if (!smartManual.has(key) && (!el.value || Object.hasOwn(smartApplied, key) || (!editingId && (key === "owner" || key === "obtainedHow")))) {
        if (next != null || Object.hasOwn(smartApplied, key)) {
          el.value = next ?? (key === "owner" ? "me" : key === "obtainedHow" ? "Purchased" : "");
          if (next != null) { smartApplied[key] = el.value; el.setAttribute("data-smart-field", key); }
          else { delete smartApplied[key]; el.removeAttribute("data-smart-field"); }
        }
      }
    });
    if (!previewOnly) {
      if (result.fields.volume && smartField('volume')?.hasAttribute('data-smart-field')) { const unit = $('[data-property-unit]', smartField('volume').closest('.item-property')); unit.value = result.fields.volumeUnit || 'oz'; unit.setAttribute('data-smart-field','volume'); }
      suggestProperties();
    }
    if (!previewOnly) fillMissingAmount(); syncSegments(); renderTags();
    let cursor = 0, html = "";
    result.spans.forEach(function (span) {
      html += esc(text.slice(cursor, span.start));
      html += '<mark data-smart-kind="' + esc(span.field || "description") + '" title="' + esc(smartLabels[span.field] || "Notes — Review") + '">' + esc(text.slice(span.start, span.end)) + '</mark>';
      cursor = span.end;
    });
    $("#smartPreview").innerHTML = html + esc(text.slice(cursor)); $("#smartPreview").hidden = !text;
    $("#smartDestinations").innerHTML = Object.keys(result.fields).filter(function (key) { return smartLabels[key] && smartField(key); }).map(function (key) {
      const manual = smartManual.has(key) || smartField(key).value !== String(result.fields[key]);
      return '<button type="button" data-smart-target="' + key + '" data-smart-kind="' + key + '" title="' + esc(result.fields[key]) + '"><strong>' + smartLabels[key] + '</strong>' + (manual ? ' · Keeping Your Edit' : '') + '</button>';
    }).join("");
    $("#itemMoreCount").textContent = $("#itemDescription").value ? "· Includes Notes" : "";
  }
  function objectWords(value) {
    return Array.from(value.matchAll(/\S+/gu), function (match) { return { text: match[0], start: match.index, end: match.index + match[0].length }; });
  }
  function objectWordAtPoint(event) {
    const input = $("#itemName"), bounds = input.getBoundingClientRect(), style = getComputedStyle(input);
    // A DOM mirror preserves the input's actual font shaping and horizontal scroll.
    const mirror = document.createElement("span");
    Object.assign(mirror.style, { position: "fixed", left: "0", top: "0", visibility: "hidden", whiteSpace: "pre", font: style.font, letterSpacing: style.letterSpacing, wordSpacing: style.wordSpacing, textTransform: style.textTransform });
    mirror.textContent = input.value; document.body.appendChild(mirror);
    try {
      const x = event.clientX - bounds.left - input.clientLeft - parseFloat(style.paddingLeft) + input.scrollLeft;
      if (event.clientX < bounds.left + input.clientLeft + parseFloat(style.paddingLeft) || event.clientX > bounds.right - parseFloat(style.paddingRight) - input.clientLeft) return null;
      const range = document.createRange();
      return objectWords(input.value).find(function (word) {
        range.setStart(mirror.firstChild, word.start); range.setEnd(mirror.firstChild, word.end);
        const rect = range.getBoundingClientRect();
        return x >= rect.left && x < rect.right;
      }) || null;
    } finally { mirror.remove(); }
  }
  function markObjectWordEdit() {
    ["name", "brand"].forEach(function (key) { smartManual.add(key); smartField(key).removeAttribute("data-smart-field"); });
    if ($("#itemSmartEntry").value) completeSmart(true);
  }
  function changeObjectWord(word, remove) {
    if (!word) return;
    const input = $("#itemName"), brand = $("#itemBrand"), before = { name: input.value, brand: brand.value };
    const nextBrand = [brand.value.trim(), word.text].filter(Boolean).join(" ");
    if (!remove && nextBrand.length > brand.maxLength) {
      $("#objectWordStatus").textContent = "Brand is full. Shorten it before moving this word.";
      return;
    }
    // Remove only the clicked occurrence, then close the gap between its neighbors.
    input.value = [before.name.slice(0, word.start).trimEnd(), before.name.slice(word.end).trimStart()].filter(Boolean).join(" ");
    if (!remove) brand.value = nextBrand;
    objectWordHistory.push({ before: before, after: { name: input.value, brand: brand.value } });
    if (objectWordHistory.length > 50) objectWordHistory.shift();
    markObjectWordEdit();
    input.focus(); input.setSelectionRange(Math.min(word.start, input.value.length), Math.min(word.start, input.value.length));
    $("#objectWordStatus").textContent = word.text + (remove ? " removed from Object." : " moved to Brand.") + " Control+Z or Command+Z to undo.";
  }
  function initObjectWords() {
    const input = $("#itemName"), brand = $("#itemBrand"); let pressed = null;
    input.addEventListener("pointerdown", function (event) {
      pressed = { word: objectWordAtPoint(event), value: input.value, button: event.button, x: event.clientX, y: event.clientY };
    });
    input.addEventListener("pointermove", function (event) { if (pressed && event.buttons && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 5) pressed.dragged = true; });
    input.addEventListener("pointercancel", function () { pressed = null; });
    input.addEventListener("click", function (event) {
      const down = pressed; pressed = null;
      if (!down || down.dragged || down.button !== 0 || !event.detail || event.altKey || !event.ctrlKey || event.metaKey || event.shiftKey || input.value !== down.value || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
      event.preventDefault(); changeObjectWord(down.word, true);
    });
    input.addEventListener("contextmenu", function (event) {
      const word = pressed && pressed.button === 2 && pressed.value === input.value ? pressed.word : objectWordAtPoint(event);
      pressed = null;
      if (!word) return;
      event.preventDefault(); changeObjectWord(word, event.ctrlKey);
    });
    [input, brand].forEach(function (el) { el.addEventListener("input", function () { objectWordHistory = []; }); });
    $("#itemForm").addEventListener("keydown", function (event) {
      if (event.target !== input && event.target !== brand) return;
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        const last = objectWordHistory[objectWordHistory.length - 1];
        if (!last || input.value !== last.after.name || brand.value !== last.after.brand) return;
        event.preventDefault(); objectWordHistory.pop(); input.value = last.before.name; brand.value = last.before.brand; markObjectWordEdit();
        $("#objectWordStatus").textContent = "Word action undone.";
      } else if (event.target === input && event.altKey && !event.ctrlKey && !event.metaKey && ["ArrowUp", "Delete"].includes(event.key)) {
        event.preventDefault();
        const caret = input.selectionStart, word = objectWords(input.value).find(function (part) { return caret >= part.start && caret < part.end; });
        changeObjectWord(word, event.key === "Delete");
      }
    });
  }
  function renderTags() {
    renderPresets();
    $("#selectedItemTags").toggleAttribute('data-smart-field', $("#itemCategories").hasAttribute('data-smart-field'));
    $("#selectedItemTags").innerHTML = m.tags($("#itemCategories").value).map(function (tag) { return '<button type="button" class="tag-chip" data-remove-tag="' + esc(tag) + '" aria-label="Remove ' + esc(tag) + '">' + esc(tag) + ' ' + icon("close") + '</button>'; }).join("");
  }
  function commitTags() {
    const value = $("#itemTagSearch").value.trim();
    if (!value) return;
    smartManual.add('categories'); $('#itemCategories').removeAttribute('data-smart-field');
    const combined = m.tags($("#itemCategories").value).concat(value.split(",").map(function (tag) { return tag.trim(); }).filter(Boolean));
    if (new Set(combined.map(function (tag) { return tag.toLowerCase(); })).size > 30) throw new Error("Use up to 30 tags per item.");
    if (combined.some(function (tag) { return tag.length > 60; })) throw new Error("Keep each tag within 60 characters.");
    $("#itemCategories").value = m.tags(combined).join(", "); $("#itemTagSearch").value = ""; renderTags(); suggestProperties();
  }
  function pickerValues(id) {
    const config = App.config.inventory, items = inventory().items;
    const propertyValues = function (name) { return items.flatMap(function (item) { return item.properties.filter(function (p) { return p.name.toLowerCase() === name; }).map(function (p) { return { value: p.value, detail: item.room }; }); }); };
    if (id === "itemTagSearch") {
      const selected = m.tags($("#itemCategories").value).map(function (tag) { return tag.toLowerCase(); });
      return config.tagGroups.flatMap(function (group) { return group.tags.map(function (tag) { return { value: tag, detail: group.name }; }); }).concat(config.categories.map(function (category) { return { value: category.name, detail: "Preset" }; }), items.flatMap(function (item) { return item.categories.map(function (tag) { return { value: tag, detail: "Your Tags" }; }); })).filter(function (option) { return !selected.includes(option.value.toLowerCase()); });
    }
    if (id === "itemZone") return unique(config.locations.map(function (l) { return l.zone; })).map(function (zone) { return { value: zone, detail: "Zone" }; }).concat(propertyValues("zone"));
    if (id === "itemRoom") return App.inventoryCatalog.data(items).locations.flatMap(function (zone) { return [{value:zone.name,kind:'zone',detail:'Zone',zone:zone.name}].concat(zone.rooms.flatMap(function (room) { return [{value:room.name,kind:'room',level:1,detail:zone.name,zone:zone.name}].concat(room.spaces.map(function (space) { return {value:space,kind:'space',level:2,detail:zone.name+' / '+room.name,room:room.name,zone:zone.name}; })); })); });
    return config.locations.flatMap(function (l) { return l.spaces.map(function (space) { return { value: space, detail: l.zone + " / " + l.room, room: l.room, zone: l.zone }; }); }).concat(propertyValues("space"));
  }
  function initPicker(id) {
    const input = $("#" + id), list = $("#" + id + "Options"); let choices = [], active = -1;
    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; }
    function choose(index) {
      const option = choices[index]; if (!option) return;
      input.value = option.value;
      ['zone','room','space','categories'].forEach(function (key) { smartManual.add(key); smartField(key).removeAttribute('data-smart-field'); });
      if (id === "itemZone") { ["room","space"].forEach(function (key) { smartManual.add(key); smartField(key).removeAttribute("data-smart-field"); }); $("#itemRoom").value = ""; $("#itemSpace").value = ""; }
      if (id === "itemRoom") { $('#itemZone').value = option.zone || ''; $('#itemSpace').value = option.kind === 'space' ? option.value : ''; input.value = option.kind === 'zone' ? '' : option.kind === 'space' ? option.room : option.value; }
      if (id === "itemSpace" && option.room) { $("#itemRoom").value = option.room; $("#itemZone").value = option.zone; }
      if (id === "itemTagSearch") { try { commitTags(); } catch (error) { formError("#itemFormError", error.message); } }
      if (['itemRoom','itemZone','itemSpace'].includes(id)) syncPrimaryCopy();
      close(); input.focus(); close();
    }
    function show() {
      const query = input.value.trim().toLowerCase(), seen = new Set();
      choices = pickerValues(id).filter(function (option) {
        const key = option.value.toLowerCase() + (["itemRoom","itemSpace"].includes(id) ? "|" + option.detail + "|" + (option.kind || "") : "");
        if (!option.value || seen.has(key)) return false; seen.add(key);
        return (option.value + " " + option.detail).toLowerCase().includes(query);
      });
      if (id === "itemSpace") choices.sort(function (a, b) { return Number(b.room === $("#itemRoom").value) - Number(a.room === $("#itemRoom").value); });
      if (query && !choices.some(function (option) { return option.value.toLowerCase() === query; })) choices.push({ value: input.value.trim(), detail: "Use Custom " + (id === "itemTagSearch" ? "Tag" : "Location") });
      list.innerHTML = choices.map(function (option, index) { return '<div role="option" aria-selected="false" id="' + id + 'Option' + index + '" data-option="' + index + '" style="padding-left:' + (.65 + (option.level || 0) * .9) + 'rem"><span>' + esc(option.value) + '</span><small>' + esc(option.detail) + '</small></div>'; }).join("") || '<p>No More Suggestions</p>';
      active = -1; input.removeAttribute("aria-activedescendant"); list.hidden = false; input.setAttribute("aria-expanded", "true");
    }
    input.addEventListener("focus", show);
    input.addEventListener("input", function () {
      if (id === "itemZone") { ["room","space"].forEach(function (key) { smartManual.add(key); smartField(key).removeAttribute("data-smart-field"); }); $("#itemRoom").value = ""; $("#itemSpace").value = ""; }
      if (id === "itemRoom") { ["zone","space"].forEach(function (key) { smartManual.add(key); smartField(key).removeAttribute("data-smart-field"); }); $("#itemSpace").value = ""; $("#itemZone").value = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === input.value.trim().toLowerCase(); })?.zone || ""; }
      if (['itemRoom','itemZone','itemSpace'].includes(id)) syncPrimaryCopy();
      show();
    });
    input.addEventListener("blur", close);
    list.addEventListener("pointerdown", function (event) { event.preventDefault(); });
    list.addEventListener("click", function (event) { const el = event.target.closest("[data-option]"); if (el) choose(Number(el.dataset.option)); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !list.hidden) { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); if (list.hidden) show(); if (!choices.length) return;
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length;
        $$('[role="option"]', list).forEach(function (el, index) { el.setAttribute("aria-selected", String(index === active)); });
        const el = $("#" + id + "Option" + active); input.setAttribute("aria-activedescendant", el.id); el.scrollIntoView({ block: "nearest" });
      }
      if (event.key === "Enter" || (id === "itemTagSearch" && event.key === ",")) {
        event.preventDefault();
        if (active >= 0 && event.key === "Enter") choose(active);
        else if (id === "itemTagSearch") { try { commitTags(); close(); } catch (error) { formError("#itemFormError", error.message); } }
        else close();
      }
    });
  }
  function initSmartControls() {
    ["itemZone", "itemRoom", "itemSpace", "itemTagSearch"].forEach(initPicker);
    $("#itemSmartEntry").addEventListener("input", completeSmart);
    $("#smartExample").addEventListener("click", function () { $("#itemSmartEntry").value = App.smartEntry.example; completeSmart(); });
    Object.keys(smartLabels).forEach(function (key) { smartField(key)?.addEventListener("input", function () { smartManual.add(key); this.removeAttribute("data-smart-field"); if ($("#itemSmartEntry").value) completeSmart(true); }); });
    $("#itemForm").addEventListener('input', function (event) {
      event.target.removeAttribute('data-smart-field');
      if (event.target.matches('[data-property-name]')) renderPresets();
      if (event.target.matches('[data-property-value], [data-property-unit]') && $('[data-property-name]', event.target.closest('.item-property')).value.toLowerCase() === 'volume') smartManual.add('volume');
    });
    $("#itemForm").addEventListener("change", function (event) {
      if (event.target.type !== "radio") return;
      const id = event.target.name.replace(/Choice$/, ""), el = $("#" + id); el.value = event.target.value; el.dispatchEvent(new Event("input"));
    });
    $("#smartDestinations").addEventListener("click", function (event) { const button = event.target.closest("[data-smart-target]"); if (button) { const el = smartField(button.dataset.smartTarget); if (el.closest("details")) el.closest("details").open = true; if (button.dataset.smartTarget === "categories") $("#itemTagSearch").focus(); else if (el.type === "hidden") $('input[name="' + el.id + 'Choice"]:checked').focus(); else el.focus(); } });
    $("#selectedItemTags").addEventListener("click", function (event) { const button = event.target.closest("[data-remove-tag]"); if (button) { smartManual.add("categories"); $("#itemCategories").removeAttribute("data-smart-field"); $("#itemCategories").value = m.tags($("#itemCategories").value).filter(function (tag) { return tag !== button.dataset.removeTag; }).join(", "); renderTags(); ($("#selectedItemTags button") || $("#itemTagSearch")).focus(); } });
  }
  function refreshOptions(selector, values, label) { const el = $(selector), value = el.value; el.innerHTML = options(values, label); el.value = values.includes(value) ? value : ""; }
  function render() {
    const data = inventory(), stats = m.stats(data.items);
    lastInventory = JSON.stringify(data);
    $("#haveCount").textContent = stats.all.count;
    $("#previousCount").textContent = data.items.length - stats.all.count;
    $$('[data-inventory-view]').forEach(function (button) { if (button.dataset.inventoryView === view) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
    const titles = { have: "Stuff I Have", previous: "Stuff I Had", want: "Stuff I Want", research: "Research" };
    $("#inventoryTitle").textContent = titles[view];
    $("#inventorySubtitle").textContent = view === "have" ? "Know what you own, where it lives, and what it’s worth." : view === "previous" ? "Gone, but not forgotten. The things that were part of your life." : "A little space for what comes next.";
    const active = view === "have" || view === "previous";
    $("#inventoryBody").hidden = !active; $("#inventoryComingSoon").hidden = active;
    if ($("#bulkEntryButton")) $("#bulkEntryButton").hidden = view !== "have";
    $("#addItemButton").hidden = view !== "have"; $("#inventoryStats").hidden = view !== "have";
    $("#roomOverview").hidden = view !== "have"; $("#inventoryBody").classList.toggle("previous-view", view === "previous");
    if (!active) $("#inventoryComingSoon").innerHTML = icon(view === "want" ? "inventoryWant" : "inventoryResearch") + '<h2>' + (view === "want" ? "Your Someday List, Coming Later" : "Good Decisions Start with a Little Research") + '</h2><p>We’re focusing on the stuff you have first. ' + (view === "want" ? "Wish-list tracking" : "Research and comparison tools") + ' will live here in a future update.</p>';
    $("#inventoryStats").innerHTML = [["all", "All", "inventoryBox"], ["house", "House", "ownerHouse"], ["me", "Me", "ownerMe"]].map(function (entry) {
      const total = stats[entry[0]];
      return '<button type="button" class="inventory-stat" data-owner-filter="' + (entry[0] === 'all' ? '' : entry[0]) + '" data-inventory-total="' + entry[0] + '"><span class="inventory-stat-label">' + icon(entry[2]) + '<strong>' + entry[1] + '</strong></span><span class="inventory-stat-count">' + total.count.toLocaleString() + '<span>objects</span></span><span class="inventory-stat-value">' + esc(money(total.valueCents / 100)) + '<small>known value' + (total.unknown ? ' · ' + total.unknown + ' not valued' : '') + '</small></span></button>';
    }).join("");
    $("#roomStats").innerHTML = stats.rooms.length ? '<table class="room-stats-table"><caption class="visually-hidden">Object counts and known values per room</caption><thead><tr><th scope="col">Room</th><th scope="col">House</th><th scope="col">Me</th></tr></thead><tbody>' + stats.rooms.map(function (room) { return '<tr><th scope="row">' + esc(room.name) + '</th>' + ["house", "me"].map(function (owner) { const total = room[owner]; return '<td><strong>' + total.count + '</strong><small>' + esc(money(total.valueCents / 100)) + '</small>' + (total.unknown ? '<small>' + total.unknown + ' not valued</small>' : '') + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table>' : '<p class="room-empty">Your rooms will appear as you add items. Both house and personal belongings can share the same room.</p>';
    renderLocationFilter();
    refreshOptions("#inventoryCategoryFilter", unique(App.config.inventory.tagGroups.flatMap(function (g) { return g.tags; }).concat(App.config.inventory.categories.map(function (c) { return c.name; }), data.items.flatMap(function (item) { return item.categories; })).map(function (tag) { return m.tags([tag])[0]; })), "All Categories");
    $("#copyRoomOptions").innerHTML = options(unique(App.config.inventory.locations.map(function (l) { return l.room; }).concat(App.config.inventory.rooms, data.items.map(function (item) { return item.room; }))));
    renderList();
    App.inventoryCatalog?.render();
  }
  function renderLocationFilter() {
    const el = $('#inventoryRoomFilter'), old = el.value;
    el.innerHTML = '<option value="">All Locations</option>' + App.inventoryCatalog.data(inventory().items).locations.map(function (zone) {
      return '<optgroup label="' + esc(zone.name) + '"><option value="' + esc('zone:' + zone.name) + '">' + esc(zone.name + ' — All') + '</option>' + zone.rooms.map(function (room) {
        return '<option value="' + esc(room.name === 'Unassigned Room' ? 'Unassigned' : room.name) + '">　' + esc(room.name) + '</option>' + room.spaces.map(function (space) { return '<option value="' + esc('space:' + JSON.stringify([room.name,space])) + '">　　' + esc(space) + '</option>'; }).join('');
      }).join('') + '</optgroup>';
    }).join('') + '<option value="Unassigned">Unassigned Room</option>';
    el.value = Array.from(el.options).some(function (o) { return o.value === old; }) ? old : '';
  }
  function matchesLocation(item, filter) {
    if (!filter) return true;
    const property = function (name) { return item.properties.find(function (p) { return p.name.toLowerCase() === name; })?.value || ''; };
    if (filter.startsWith('zone:')) return (property('zone') || App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === item.room.toLowerCase(); })?.zone || 'Unassigned Zone') === filter.slice(5);
    if (filter.startsWith('space:')) { const path = JSON.parse(filter.slice(6)); return (item.room || 'Unassigned Room') === path[0] && property('space') === path[1]; }
    return (item.room || 'Unassigned') === filter;
  }
  function renderCategoryCards(items) {
    const selected = $('#inventoryCategoryFilter').value, old = $('#categoryCards').scrollLeft;
    $('#categoryCards').innerHTML = Array.from($('#inventoryCategoryFilter').options).map(function (option) {
      const name = option.value, count = items.filter(function (item) { return !name || item.categories.includes(name); }).length;
      return '<button type="button" class="category-card" data-category-filter="' + esc(name) + '" aria-pressed="' + (selected === name) + '">' + icon(name === 'Water' ? 'categoryWater' : name === 'Cables' ? 'categoryCables' : 'inventoryBox') + '<span>' + esc(name || 'All Categories') + '</span><small>' + count + '</small></button>';
    }).join(''); $('#categoryCards').scrollLeft = old;
  }
  function fillMissingAmount() {
    const price = $('#itemPrice'), value = $('#itemValue');
    if (document.activeElement !== price && !price.value && value.value && value.validity.valid) price.value = value.value;
    if (document.activeElement !== value && !value.value && price.value && price.validity.valid) value.value = price.value;
  }
  function renderList() {
    const search = $("#inventorySearch").value.trim().toLowerCase(), owner = $("#inventoryOwnerFilter").value, room = $("#inventoryRoomFilter").value, category = $("#inventoryCategoryFilter").value;
    const all = inventory().items.filter(function (item) { return Boolean(item.archive) === (view === "previous"); });
    $$('[data-owner-filter]').forEach(function (button) { button.setAttribute('aria-pressed',String(button.dataset.ownerFilter === owner)); });
    renderCategoryCards(all);
    const items = all.filter(function (item) {
      return (!owner || item.owner === owner) && matchesLocation(item, room) && (!category || item.categories.includes(category)) && (!search || [item.name, item.description, item.source, item.room, item.categories.join(" "), item.properties.map(function (p) { return [p.name, p.value, p.unit].join(" "); }).join(" "), item.archive?.reason, item.archive?.notes].join(" ").toLowerCase().includes(search));
    }).sort(function (a, b) { return view === "previous" ? b.archive.date.localeCompare(a.archive.date) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name); });
    $("#inventoryResultCount").textContent = items.length + " of " + all.length + " " + (view === "previous" ? "previous" : "current") + " objects";
    $("#clearInventoryFilters").hidden = !(search || owner || room || category);
    if (!items.length) {
      $("#inventoryList").innerHTML = '<div class="inventory-empty">' + icon(view === "previous" ? "inventoryArchive" : "inventoryBox") + '<h2>' + (all.length ? "Nothing Matches Just Yet" : view === "previous" ? "A History, Without the Clutter" : "Start with Something You See") + '</h2><p>' + (all.length ? "Try another search or clear your filters." : view === "previous" ? "Archive an item when it’s lost, broken, sold, or otherwise gone. Its story stays here." : "Your favorite shoes. The kitchen table. That cable in the drawer. Add one object and build from there.") + '</p>' + (!all.length && view === "have" ? '<button class="button primary" type="button" data-add-inventory>' + icon("inventoryPlus") + ' Add Your First Item</button>' : '') + '</div>'; return;
    }
    $("#inventoryList").innerHTML = '<div class="inventory-table-wrap"><table class="inventory-table"><caption class="visually-hidden">' + (view === "previous" ? "Previous" : "Current") + ' items. Select an item to view or edit all details.</caption><thead><tr><th scope="col">Item</th><th scope="col">Room / Belongs to</th><th scope="col">Value</th><th scope="col">' + (view === "previous" ? "Departure" : "Obtained") + '</th></tr></thead><tbody>' + items.map(function (item) {
      return '<tr><td><button class="inventory-item-name" type="button" data-edit-item="' + esc(item.id) + '">' + esc(item.name) + '</button>' + (item.description ? '<p class="inventory-item-description">' + esc(item.description) + '</p>' : '') + '<div class="item-tags">' + item.categories.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join("") + '</div></td><td><span>' + esc(item.room || "Unassigned") + '</span><small>' + (item.owner === "house" ? "The house" : "Me") + '</small></td><td class="item-money">' + esc(money(item.value)) + '</td><td>' + (item.archive ? '<strong>' + esc(item.archive.reason) + '</strong><small>' + esc(dateLabel(item.archive.date)) + '</small><small>' + esc(duration(item)) + '</small>' : esc(dateLabel(item.obtainedDate)) + (item.obtainedHow ? '<small>' + esc(item.obtainedHow) + '</small>' : '')) + '</td></tr>';
    }).join("") + '</tbody></table></div>';
  }
  function formSignature(selector) { return JSON.stringify($$("input, textarea, select", $(selector)).map(function (el) { return el.type === "radio" ? [el.value, el.checked] : el.value; })); }
  function formError(selector, message) { const el = $(selector); el.textContent = message; el.hidden = false; el.focus(); }
  function addProperty(property, focus) {
    if ($$(".item-property").length >= 40) return formError("#itemFormError", "Use up to 40 properties per item.");
    const row = document.createElement("div"); row.className = "item-property";
    row.innerHTML = '<label class="field"><span>Property</span><input data-property-name list="inventoryPropertyNames" maxlength="60" required placeholder="e.g. Weight" value="' + esc(property.name) + '"></label><label class="field"><span>Value</span><input data-property-value maxlength="300" placeholder="e.g. 240" value="' + esc(property.value || "") + '"></label><label class="field"><span>Unit</span><input data-property-unit maxlength="30" placeholder="e.g. g" value="' + esc(property.unit) + '"></label><button class="icon-button" type="button" data-remove-property aria-label="Remove property">' + icon("close") + '</button>';
    function propertySuggestions() { const value = $('[data-property-value]', row); if ($('[data-property-name]', row).value.trim().toLowerCase() === "color") value.setAttribute("list", "inventoryColorValues"); else value.removeAttribute("list"); }
    $('[data-property-name]', row).addEventListener("input", propertySuggestions); propertySuggestions();
    $("#itemProperties").appendChild(row); renderPresets(); $("#itemMoreDetails").open = true; if (focus) $("input", row).focus();
  }
  function renderPresets() {
    const names = $$('[data-property-name]').map(function (el) { return el.value.trim().toLowerCase(); });
    $$('#categoryPresets [data-category-preset]').forEach(function (button) {
      const preset = App.config.inventory.categories[Number(button.dataset.categoryPreset)], active = m.tags($('#itemCategories').value).some(function (tag) { return tag.toLowerCase() === preset.name.toLowerCase(); }) && preset.properties.every(function (p) { return names.includes(p.name.toLowerCase()); });
      button.setAttribute('aria-pressed', String(active)); button.classList.toggle('preset-applied', active);
      button.innerHTML = icon(active ? 'close' : 'inventoryPlus') + ' ' + esc(preset.name);
      button.setAttribute('aria-label', (active ? 'Remove ' : 'Apply ') + preset.name + ' Property Set');
    });
  }
  function suggestProperties() {
    const tags = m.tags($("#itemCategories").value).map(function (tag) { return tag.toLowerCase(); });
    App.config.inventory.categories.filter(function (category) { return tags.includes(category.name.toLowerCase()); }).forEach(function (category) {
      category.properties.forEach(function (property) { if (!$$('[data-property-name]').some(function (el) { return el.value.trim().toLowerCase() === property.name.toLowerCase(); })) addProperty(property); });
    });
  }
  function syncPrimaryCopy() {
    const row = $('[data-copy-location]'); if (!editingId || !row) return;
    $('[data-copy-room]',row).value = $('#itemRoom').value;
    $('[data-copy-space]',row).value = $('#itemSpace').value;
  }
  function copyLocations() { return $$('[data-copy-location]').map(function (row) { return { room: $('[data-copy-room]',row).value, space: $('[data-copy-space]',row).value }; }); }
  function renderCopyLocations(saved) {
    const count = Number($('#itemCopies').value), root = $('#itemCopyLocations'), old = Array.isArray(saved) ? saved : copyLocations();
    root.hidden = Boolean(editingId && !editingCopies.length) || !Number.isInteger(count) || count < (editingId ? 1 : 2) || count > 100;
    if (root.hidden) { root.innerHTML = ''; return; }
    root.innerHTML = '<p>' + (editingId ? 'Edit each copy’s room and space. Blank fields clear an existing location; new copies use the location above.' : 'Each copy has its own location. Blank fields use the location above; a different room clears the inherited space.') + '</p><div class="copy-room-grid">' + Array.from({ length: count }, function (_, index) {
      const room = old[index]?.room ?? '', spaces = App.config.inventory.locations.filter(function (l) { return !room || l.room.toLowerCase() === room.toLowerCase(); }).flatMap(function (l) { return l.spaces; });
      return '<div data-copy-location><strong>Copy ' + (index + 1) + (editingCopies[index]?.id === editingId ? ' · This Item' : '') + '</strong><label class="field"><span>Room</span><input data-copy-room list="copyRoomOptions" maxlength="80" placeholder="Use location above" value="' + esc(room) + '"></label><label class="field"><span>Space</span><input data-copy-space list="copySpaceOptions' + index + '" maxlength="80" placeholder="Use room default" value="' + esc(old[index]?.space || '') + '"></label><datalist id="copySpaceOptions' + index + '">' + options(unique(spaces)) + '</datalist></div>';
    }).join('') + '</div>';
  }
  function openItem(id, trigger, copy, draft) {
    let item = inventory().items.find(function (entry) { return entry.id === id; });
    if (id && !item) return;
    if (copy) { item = Object.assign({}, item, { archive: null }); id = ""; }
    editingCopies = id && !item.archive ? inventory().items.filter(function (entry) {
      if (entry.archive) return false;
      if (item.copyGroup) return entry.copyGroup === item.copyGroup;
      if (entry.copyGroup) return false;
      const signature = function (value) { const record = Object.assign({}, value); delete record.id; delete record.room; record.properties = record.properties.filter(function (p) { return !['zone', 'space'].includes(p.name.toLowerCase()); }); return JSON.stringify(record); };
      return signature(entry) === signature(item);
    }).map(function (entry) { return JSON.parse(JSON.stringify(entry)); }) : [];
    editingCopies.sort(function (a, b) { return a.id === id ? -1 : b.id === id ? 1 : 0; });
    editingId = id; originalItem = item ? JSON.stringify(item) : "";
    $("#itemForm").reset(); $("#itemFormError").hidden = true;
    $("#itemDialogTitle").textContent = id ? "Item Details" : copy ? "Add a Copy" : "Add an Item";
    $("#itemCopiesField").hidden = Boolean(item?.archive); $("#itemCopies").disabled = Boolean(item?.archive);
    if ($("#bulkReviewInfo")) $("#bulkReviewInfo").hidden = !draft;
    if ($("#bulkSmartTools")) { $("#bulkSmartTools").open = true; $("#bulkSmartTools summary").hidden = true; }
    if ($("#skipBulkRow")) $("#skipBulkRow").hidden = !draft;
    $("#saveItemButton").textContent = draft ? "Save & Next" : "Save Item";
    $$('[data-inv-close="itemDialog"]').filter(function (el) { return !el.classList.contains("icon-button"); }).forEach(function (el) { el.textContent = draft ? "Pause" : "Cancel"; });
    $("#deleteItemButton").hidden = !id;
    $("#itemCopyLocations").innerHTML = ""; $("#itemCopies").value = draft?._copies || editingCopies.length || 1; renderCopyLocations(draft?._copyLocations || editingCopies.map(function (entry) { return {room:entry.room,space:entry.properties.find(function (p) { return p.name.toLowerCase() === "space"; })?.value || ""}; }));
    const values = draft || item || { owner: "me", obtainedHow: "Purchased", categories: [], properties: [] };
    ["name", "description", "owner", "room", "obtainedDate", "obtainedHow", "source", "value", "price"].forEach(function (key) { $("#item" + key[0].toUpperCase() + key.slice(1)).value = values[key] ?? ""; });
    $("#itemObtainedDate").max = m.today();
    $("#itemCategories").value = values.categories.join(", ");
    $("#itemProperties").innerHTML = "";
    ["Brand", "Zone", "Space"].forEach(function (key) { $("#item" + key).value = values.properties.find(function (property) { return property.name.toLowerCase() === key.toLowerCase(); })?.value || ""; });
    values.properties.filter(function (property) { return !["brand", "zone", "space"].includes(property.name.toLowerCase()); }).forEach(function (property) { addProperty(property); });
    $("#itemMoreDetails").open = true;
    $("#itemMoreCount").textContent = values.properties.length || values.description || values.obtainedDate ? (draft ? "· Review Details" : "· Saved Details") : "";
    resetSmart(); renderTags(); syncSegments();
    if (draft) {
      $("#itemTagSearch").value = draft._tagSearch || "";
      $("#itemSmartEntry").value = draft._smartEntry || "";
      smartManual = new Set((draft._smartManual || []).filter(function (key) { return Object.hasOwn(smartLabels, key); }));
      smartApplied = draft._smartApplied || {};
      Object.keys(smartLabels).forEach(function (key) {
        const el = smartField(key);
        if (el && el.value && !smartManual.has(key) && (!draft._reviewed || Object.hasOwn(smartApplied,key))) { smartApplied[key] = el.value; el.setAttribute('data-smart-field',key); }
      });
      $$('.item-property').forEach(function (row, index) { $$('input', row).forEach(function (el, column) { if (el.value && (!draft._reviewed || draft._autoProperties?.[index]?.[column])) el.setAttribute('data-smart-field','property'); }); });
      completeSmart(true);
    }
    $$(".picker-options").forEach(function (el) { el.hidden = true; });
    $$('[role="combobox"]').forEach(function (el) { el.setAttribute("aria-expanded", "false"); el.removeAttribute("aria-activedescendant"); });
    $$('[data-currency-label]').forEach(function (el) { el.textContent = "(" + inventory().currency + ")"; });
    $("#archiveItemButton").hidden = !id;
    $("#archiveItemButton").innerHTML = icon("inventoryArchive") + (item?.archive ? " Edit Departure…" : " Archive…");
    $("#restoreItemButton").hidden = !item?.archive;
    $("#itemArchiveSummary").hidden = !item?.archive;
    if (item?.archive) $("#itemArchiveSummary").textContent = item.archive.reason + " · " + dateLabel(item.archive.date) + " · " + duration(item) + (item.archive.notes ? "\n" + item.archive.notes : "");
    suggestProperties(); fillMissingAmount();
    originalForm = formSignature("#itemForm");
    App.components.openDialog("#itemDialog", { trigger: trigger, focus: id || draft ? "#itemName" : "#itemSmartEntry" });
  }
  function currentItemUnchanged(id, snapshot) { const item = inventory().items.find(function (entry) { return entry.id === id; }); if (!item || JSON.stringify(item) !== snapshot) throw new Error("This item changed while you were editing. Close and reopen it to use the latest copy."); return item; }
  async function saveItem(event) {
    event.preventDefault();
    try {
      const previous = editingId ? currentItemUnchanged(editingId, originalItem) : null;
      const count = previous?.archive ? 1 : Number($("#itemCopies").value);
      if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Choose between 1 and 100 copies.");
      if (!App.bulkEntry?.current() && inventory().items.length + count - (previous ? Math.max(1, editingCopies.length) : 0) > 5000) throw new Error("These copies would exceed the 5,000-item inventory limit.");
      const item = { id: editingId || u.uid("item"), archive: previous?.archive || null };
      ["name", "description", "owner", "room", "obtainedDate", "obtainedHow", "source", "value", "price"].forEach(function (key) { item[key] = $("#item" + key[0].toUpperCase() + key.slice(1)).value; });
      commitTags();
      item.categories = m.tags($("#itemCategories").value);
      item.properties = $$(".item-property").map(function (row) { return { name: $("[data-property-name]", row).value, value: $("[data-property-value]", row).value, unit: $("[data-property-unit]", row).value }; });
      ["Brand", "Zone", "Space"].forEach(function (key) {
        const value = $("#item" + key).value.trim(), old = previous?.properties.find(function (property) { return property.name.toLowerCase() === key.toLowerCase(); });
        if (value || old) item.properties.push({ name: old?.name || key, value: value, unit: old?.unit || "" });
      });
      const next = m.normalizeItem(item);
      if (App.bulkEntry?.current()) { App.bulkEntry.accept(next, count, copyLocations()); return; }
      let copies;
      if (previous && !previous.archive) {
        const verifyCopies = function () {
          editingCopies.forEach(function (entry) { currentItemUnchanged(entry.id, JSON.stringify(entry)); });
          if (previous.copyGroup && inventory().items.filter(function (entry) { return !entry.archive && entry.copyGroup === previous.copyGroup; }).length !== editingCopies.length) throw new Error("Copies changed while editing. Close and reopen this item.");
        };
        verifyCopies();
        const locations = copyLocations(), group = previous.copyGroup || u.uid('copies');
        const locationSignature = function (entry) { return JSON.stringify([entry.room, entry.properties.filter(function (p) { return ['zone','space'].includes(p.name.toLowerCase()); })]); };
        if (locationSignature(next) !== locationSignature(previous)) locations[0] = {room:next.room,space:next.properties.find(function (p) { return p.name.toLowerCase() === 'space'; })?.value || ''};
        copies = Array.from({length:count}, function (_, index) {
          const existing = editingCopies[index], base = index === 0 || !existing ? next : existing;
          const location = locations[index] || {}, clean = Object.assign({}, base, { copyGroup:group });
          // Explicitly clearing an existing location must not inherit the old one.
          if (index < editingCopies.length) { clean.room = location.room || ''; clean.properties = clean.properties.filter(function (p) { return p.name.toLowerCase() !== 'space' && (p.name.toLowerCase() !== 'zone' || clean.room === base.room); }); }
          const result = m.createCopies(clean, 1, [location])[0];
          if (existing) result.id = existing.id;
          const parent = App.config.inventory.locations.find(function (l) { return l.room.toLowerCase() === result.room.toLowerCase(); });
          if (parent && !result.properties.some(function (p) { return p.name.toLowerCase() === 'zone'; })) result.properties.push({name:'Zone',value:parent.zone,unit:''});
          return m.normalizeItem(result);
        });
        if (count < editingCopies.length) {
          const removed = editingCopies.slice(count).map(function (entry) { return entry.name + ' (' + (entry.room || 'Unassigned') + ')'; }).join(', ');
          if (!await App.components.confirm({title:'Delete Removed Copies?',message:'Permanently delete ' + (editingCopies.length-count) + ' copies: ' + removed + '. This cannot be undone.',confirmLabel:'Delete Copies',danger:true,trigger:$('#saveItemButton')})) return;
          verifyCopies();
        }
      } else copies = previous ? [next] : m.createCopies(next, count, copyLocations());
      const replaced = new Set(previous ? (editingCopies.length ? editingCopies : [previous]).map(function (entry) { return entry.id; }) : []);
      App.storage.mutate(function (state) { state.inventory.items = state.inventory.items.filter(function (entry) { return !replaced.has(entry.id); }).concat(copies); }, { reason: "inventory-save" });
      const saved = App.storage.saveNow(); App.components.closeDialog("#itemDialog", "saved");
      App.components.toast(saved ? (count > 1 ? count + " copies of " + next.name + " are in your inventory." : next.name + " is in your inventory.") : "Browser storage is unavailable. Export a backup before closing this tab.", { title: saved ? "Item saved" : "Saved for this session only", kind: saved ? "success" : "warning" });
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
      App.components.toast(next.name + " is in Stuff I Had. Its details are preserved.", { title: "Item Archived", kind: "success" });
      $('[data-inventory-view="previous"]').focus();
    } catch (error) { formError("#archiveError", error.message); }
  }
  async function restoreItem() {
    try {
      if (formSignature("#itemForm") !== originalForm) throw new Error("Save your edits before returning this item to your current inventory.");
      if (!await App.components.confirm({ title: "Return This Item to Stuff I Have?", message: "It will count toward your current inventory again. Its departure date and reason will be cleared; all other details stay.", confirmLabel: "Return Item", trigger: this })) return;
      currentItemUnchanged(editingId, originalItem);
      App.storage.mutate(function (state) { state.inventory.items.find(function (item) { return item.id === editingId; }).archive = null; }, { reason: "inventory-return" });
      App.storage.saveNow(); App.components.closeDialog("#itemDialog", "saved");
      App.components.toast("The item is back in your current inventory.", { title: "Welcome Back", kind: "success" });
      $('[data-inventory-view="have"]').focus();
    } catch (error) { formError("#itemFormError", error.message); }
  }
  async function dismiss(id) {
    if (closing) return;
    closing = true;
    try {
      if (id === "itemDialog" && App.bulkEntry?.current()) { try { App.bulkEntry.pause(); } catch (error) { formError("#itemFormError", error.message); } return; }
      const dirty = id === "itemDialog" ? formSignature("#itemForm") !== originalForm : formSignature("#archiveForm") !== archiveForm;
      if (dirty && !await App.components.confirm({ title: "Discard Unsaved Edits?", message: "These form changes have not been saved. Your existing item will stay unchanged.", confirmLabel: "Discard Edits", danger: true, trigger: document.activeElement })) return;
      App.components.closeDialog("#" + id);
      if (id === "archiveDialog") $("#archiveItemButton").focus();
    } finally { closing = false; }
  }
  function captureDraft() {
    const draft = {};
    ["name", "description", "owner", "room", "obtainedDate", "obtainedHow", "source", "value", "price"].forEach(function (key) { draft[key] = $("#item" + key[0].toUpperCase() + key.slice(1)).value; });
    draft.categories = m.tags($("#itemCategories").value);
    draft.properties = $$(".item-property").map(function (row) { return { name: $("[data-property-name]", row).value, value: $("[data-property-value]", row).value, unit: $("[data-property-unit]", row).value }; });
    ["Brand", "Zone", "Space"].forEach(function (key) { if ($("#item" + key).value) draft.properties.push({ name: key, value: $("#item" + key).value, unit: "" }); });
    draft._tagSearch = $("#itemTagSearch").value; draft._smartEntry = $("#itemSmartEntry").value;
    draft._smartManual = Array.from(smartManual); draft._smartApplied = smartApplied;
    draft._copies = Number($("#itemCopies").value); draft._copyLocations = copyLocations();
    if (App.bulkEntry?.current()?.draft.copyGroup) draft.copyGroup = App.bulkEntry.current().draft.copyGroup;
    draft._reviewed = true;
    draft._autoProperties = $$('.item-property').map(function (row) { return $$('input', row).map(function (el) { return el.hasAttribute('data-smart-field'); }); });
    return draft;
  }
  App.inventoryUI = { home: function () { view = "have"; ["#inventorySearch","#inventoryOwnerFilter","#inventoryRoomFilter","#inventoryCategoryFilter"].forEach(function (id) { $(id).value = ""; }); render(); $("#inventoryTitle").focus(); }, init: init, render: render, openItem: openItem, captureDraft: captureDraft, openDraft: function (draft, trigger) { openItem("", trigger, false, draft); } };
})();
