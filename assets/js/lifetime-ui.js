(function () {
  "use strict";
  const App = window.LocalApp, u = App.utils, esc = u.escapeHtml;
  const $ = function (selector) { return document.querySelector(selector); };
  const kinds = { object: "Object", consumable: "Consumable", service: "Service", other: "Other" };
  const money = function (amount) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount); };
  let selected = "", editing = null, signature = "";
  function categories() { return App.storage.getState().lifetime.categories; }
  function category() { return categories().find(function (entry) { return entry.id === selected; }); }
  function total(entries) { return entries.reduce(function (sum, entry) { return sum + Math.round(entry.amount * 100); }, 0) / 100; }
  function message(text) { $("#lifetimeMessage").textContent = text; }
  function change(fn) {
    try {
      const next = u.clone(App.storage.getState());
      fn(next.lifetime.categories);
      const validated = App.stateModel.normalize(next).lifetime;
      App.storage.mutate(function (state) { state.lifetime = validated; }, { reason: "lifetime" });
      return true;
    }
    catch (error) { message(error.message); return false; }
  }
  function reset() {
    editing = null;
    $("#lifetimePurchaseForm").reset();
    $("#lifetimeSave").textContent = "Add Purchase";
    $("#lifetimeCancel").hidden = true;
  }
  function render() {
    const list = categories(), nextSignature = JSON.stringify(list);
    if (signature === nextSignature) return;
    signature = nextSignature;
    if (!category()) selected = list[0]?.id || "";
    const current = category();
    $("#lifetimeCategory").innerHTML = list.map(function (entry) { return '<option value="' + esc(entry.id) + '">' + esc(entry.name) + ' · ' + money(total(entry.purchases)) + '</option>'; }).join("");
    $("#lifetimeCategory").value = selected;
    $("#lifetimeWorkspace").hidden = !current;
    $("#lifetimeEmpty").hidden = Boolean(current);
    $("#lifetimeAllTotal").textContent = "All categories: " + money(total(list.flatMap(function (entry) { return entry.purchases; })));
    const options = list.length ? list : [{ id: "", name: "3D Printer" }];
    $("#lifetimeMenu").innerHTML = options.map(function (entry) {
      return '<button class="button" type="button" data-lifetime-category="' + esc(entry.id) + '">' + App.icons.markup(entry.name.toLowerCase() === "3d printer" ? "category3DPrint" : "lifetime") + '<span>' + esc(entry.name) + '</span></button>';
    }).join("");
    if (!current) return;
    $("#lifetimeRename").value = current.name;
    $("#lifetimeTotal").textContent = current.name + ": " + money(total(current.purchases)) + " · " + current.purchases.length + " purchases";
    $("#lifetimeHistory").innerHTML = current.purchases.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (entry) {
      return '<li class="lifetime-purchase"><div><strong>' + esc(entry.name) + '</strong><span>' + money(entry.amount) + ' · ' + kinds[entry.kind] + (entry.date ? ' · ' + esc(entry.date) : '') + (entry.seller ? ' · ' + esc(entry.seller) : '') + '</span>' + (entry.notes ? '<p>' + esc(entry.notes) + '</p>' : '') + '</div><div class="lifetime-actions"><button class="button small" type="button" data-lifetime-edit="' + esc(entry.id) + '" aria-label="Edit ' + esc(entry.name) + '">Edit</button><button class="button small" type="button" data-lifetime-remove="' + esc(entry.id) + '" aria-label="Remove ' + esc(entry.name) + '">Remove</button></div></li>';
    }).join("") || '<li>No purchases yet. Record your first purchase above.</li>';
  }
  function init(open) {
    const root = $("#lifetimeContent");
    root.innerHTML = '<p id="lifetimeAllTotal"></p><form id="lifetimeCategoryForm" class="lifetime-actions"><label class="field"><span>New category</span><input name="category" maxlength="300" required placeholder="3D Printer…"></label><button class="button" type="submit">Add Category</button></form><p id="lifetimeEmpty">Add a category to start tracking lifetime spending. Try <button class="button small" type="button" data-lifetime-starter="3D Printer">3D Printer</button>.</p><div id="lifetimeWorkspace" hidden><label class="field"><span>Category</span><select id="lifetimeCategory"></select></label><form id="lifetimeRenameForm" class="lifetime-actions"><label class="field"><span>Category name</span><input id="lifetimeRename" maxlength="300" required></label><button class="button" type="submit">Rename</button><button id="lifetimeDeleteCategory" class="button" type="button">Remove Category</button></form><h4 id="lifetimeTotal"></h4><form id="lifetimePurchaseForm" class="lifetime-form"><label class="field"><span>Purchase</span><input name="name" maxlength="500" required></label><label class="field"><span>Amount ($)</span><input name="amount" type="number" min="0" max="999999999.99" step="0.01" required></label><label class="field"><span>Type</span><select name="kind"><option value="object">Object</option><option value="consumable">Consumable</option><option value="service">Service</option><option value="other">Other</option></select></label><label class="field"><span>Date (optional)</span><input name="date" type="date"></label><label class="field"><span>Seller (optional)</span><input name="seller" maxlength="300"></label><label class="field lifetime-notes"><span>Notes (optional)</span><textarea name="notes" rows="2"></textarea></label><div class="lifetime-actions"><button id="lifetimeSave" class="button primary" type="submit">Add Purchase</button><button id="lifetimeCancel" class="button" type="button" hidden>Cancel Edit</button></div></form><h4>Purchase history</h4><ul id="lifetimeHistory" class="lifetime-history"></ul></div><p id="lifetimeMessage" role="status" aria-live="polite"></p>';
    const quick = document.createElement("button");
    quick.id = "lifetimeButton"; quick.type = "button"; quick.className = "button";
    quick.innerHTML = App.icons.markup("lifetime") + '<span>Lifetime</span>';
    const wrap = document.createElement("div");
    wrap.className = "checklist-quick lifetime-quick";
    wrap.append(quick);
    $(".checklist-quick").after(wrap);
    quick.setAttribute("aria-expanded", "false");
    quick.setAttribute("aria-controls", "lifetimeMenu");
    document.body.insertAdjacentHTML("beforeend", '<div id="lifetimeMenu" class="checklist-menu" aria-label="Lifetime categories" hidden></div>');
    const menu = $("#lifetimeMenu");
    let closeTimer, pinned = false;
    function close() { pinned = false; clearTimeout(closeTimer); menu.hidden = true; quick.setAttribute("aria-expanded", "false"); }
    function show() {
      clearTimeout(closeTimer); menu.hidden = false; quick.setAttribute("aria-expanded", "true");
      const rect = quick.getBoundingClientRect();
      menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8)) + "px";
      menu.style.top = Math.min(rect.bottom, window.innerHeight - menu.offsetHeight - 8) + "px";
    }
    function contains(target) { return target && (wrap.contains(target) || menu.contains(target)); }
    [wrap, menu].forEach(function (element) {
      element.addEventListener("pointerenter", function (event) { if (event.pointerType !== "touch") show(); });
      element.addEventListener("pointerleave", function (event) {
        if (event.pointerType === "touch" || pinned) return;
        closeTimer = setTimeout(function () { if (!contains(document.activeElement)) close(); }, 180);
      });
      element.addEventListener("focusout", function (event) { if (!pinned && !contains(event.relatedTarget)) close(); });
    });
    quick.addEventListener("click", function (event) {
      if ((event.pointerType === "touch" || window.matchMedia("(hover: none)").matches) && pinned && !menu.hidden) { close(); return; }
      pinned = true; show();
    });
    quick.addEventListener("keydown", function (event) { if (event.key === "ArrowDown") { event.preventDefault(); show(); menu.querySelector("button").focus({ preventScroll: true }); } });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !menu.hidden) { event.preventDefault(); close(); quick.focus(); } });
    document.addEventListener("pointerdown", function (event) { if (!contains(event.target)) close(); });
    window.addEventListener("resize", close);
    window.addEventListener("scroll", function () { if (!menu.hidden) show(); }, true);
    menu.addEventListener("click", function (event) {
      const target = event.target.closest("[data-lifetime-category]"); if (!target) return;
      let id = target.dataset.lifetimeCategory;
      if (!id) {
        id = u.uid("lifetime");
        if (!change(function (list) { list.push({ id: id, name: "3D Printer", purchases: [] }); })) return;
      }
      selected = id; signature = ""; reset(); render(); close(); open(quick);
    });
    $("#lifetimeCategoryForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const name = u.cleanLine(this.elements.category.value, 300);
      if (!name) return;
      if (categories().some(function (entry) { return entry.name.toLowerCase() === name.toLowerCase(); })) return message("This category already exists.");
      const id = u.uid("lifetime");
      selected = id;
      if (change(function (list) { list.push({ id: id, name: name, purchases: [] }); })) { this.reset(); reset(); message("Category added."); }
    });
    $("#lifetimeCategory").addEventListener("change", function () { selected = this.value; signature = ""; reset(); render(); message(""); });
    $("#lifetimeRenameForm").addEventListener("submit", function (event) {
      event.preventDefault(); const current = category(), name = u.cleanLine($("#lifetimeRename").value, 300);
      if (!current || !name) return;
      if (categories().some(function (entry) { return entry.id !== selected && entry.name.toLowerCase() === name.toLowerCase(); })) return message("This category already exists.");
      change(function (list) { list.find(function (entry) { return entry.id === current.id; }).name = name; });
    });
    $("#lifetimeDeleteCategory").addEventListener("click", async function () {
      const current = category(); if (!current) return;
      if (current.purchases.length) return message("Remove the purchases first to remove this category.");
      if (!await App.components.confirm({ title: "Remove category?", message: 'Remove “' + current.name + '”?', danger: true, trigger: this })) return;
      if (change(function (list) { const index = list.findIndex(function (entry) { return entry.id === current.id; }); if (index >= 0 && !list[index].purchases.length) list.splice(index, 1); })) { reset(); message("Category removed."); }
    });
    $("#lifetimeCancel").addEventListener("click", reset);
    $("#lifetimePurchaseForm").addEventListener("submit", function (event) {
      event.preventDefault(); const form = this, current = category(); if (!current) return;
      const entry = { id: editing ? editing.entry.id : u.uid("purchase"), name: u.cleanLine(form.elements.name.value, 500), amount: Number(form.elements.amount.value), kind: form.elements.kind.value, date: form.elements.date.value, seller: form.elements.seller.value, notes: form.elements.notes.value };
      if (!entry.name) return message("Enter a purchase name.");
      if (change(function (list) {
        const target = list.find(function (item) { return item.id === current.id; });
        if (editing) {
          const index = target.purchases.findIndex(function (item) { return item.id === entry.id; });
          if (editing.categoryId !== target.id || index < 0 || JSON.stringify(target.purchases[index]) !== JSON.stringify(editing.entry)) throw new Error("This purchase changed. Cancel Edit and reopen it to keep the latest details.");
          target.purchases[index] = entry;
        } else target.purchases.push(entry);
      })) { reset(); message("Purchase saved."); form.elements.name.focus(); }
    });
    root.addEventListener("click", async function (event) {
      const starter = event.target.closest("[data-lifetime-starter]");
      if (starter) { $("#lifetimeCategoryForm").elements.category.value = starter.dataset.lifetimeStarter; $("#lifetimeCategoryForm").requestSubmit(); return; }
      const edit = event.target.closest("[data-lifetime-edit]"), remove = event.target.closest("[data-lifetime-remove]");
      if (!edit && !remove) return;
      const current = category(), id = edit ? edit.dataset.lifetimeEdit : remove.dataset.lifetimeRemove;
      const entry = current?.purchases.find(function (item) { return item.id === id; }); if (!entry) return;
      if (edit) {
        editing = { categoryId: current.id, entry: u.clone(entry) };
        const form = $("#lifetimePurchaseForm");
        ["name", "amount", "kind", "date", "seller", "notes"].forEach(function (key) { form.elements[key].value = entry[key]; });
        $("#lifetimeSave").textContent = "Save Purchase"; $("#lifetimeCancel").hidden = false; form.elements.name.focus(); message("");
      } else {
        if (!await App.components.confirm({ title: "Remove purchase?", message: 'Remove “' + entry.name + '” from ' + current.name + '?', danger: true, trigger: remove })) return;
        if (change(function (list) {
          const target = list.find(function (item) { return item.id === current.id; });
          const index = target?.purchases.findIndex(function (item) { return item.id === id; });
          if (index >= 0) { if (JSON.stringify(target.purchases[index]) !== JSON.stringify(entry)) throw new Error("This purchase changed. Review it before removing."); target.purchases.splice(index, 1); }
        })) { if (editing?.entry.id === id) reset(); message("Purchase removed."); $("#lifetimePurchaseForm").elements.name.focus(); }
      }
    });
    window.addEventListener("app:statechange", render);
    render();
  }
  App.lifetimeUI = { init: init };
})();
