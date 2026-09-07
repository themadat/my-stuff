(function () {
  "use strict";

  const App = window.LocalApp;
  const config = App.config;
  const u = App.utils;
  const storage = App.storage;
  const model = App.stateModel;
  const $ = function (selector, root) { return (root || document).querySelector(selector); };
  const $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  let releaseTimer = 0;
  let iconHoldTriggered = false;

  function state() { return storage.getState(); }

  function applyIdentity() {
    document.title = config.identity.name;
    $("#appName").textContent = config.identity.name;
    $("#versionButton").textContent = "v" + config.identity.version;
    $("#releaseCurrentVersion").textContent = "v" + config.identity.version;
  }

  function effectiveMode() {
    const mode = state().preferences.appearance.mode;
    if (mode !== "system") return mode;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyAppearance() {
    const preferences = state().preferences;
    const appearance = preferences.appearance;
    const mode = effectiveMode();
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.buttonStyle = preferences.controls.buttonStyle;
    document.documentElement.dataset.developer = preferences.controls.developerMode ? "on" : "off";
    document.documentElement.style.setProperty("--text-scale", appearance.textScale);
    document.documentElement.style.setProperty("--accent", appearance.accent);
    document.documentElement.style.setProperty("--accent-2", appearance.accent2);
    document.documentElement.style.setProperty("--success", appearance.success);
    document.documentElement.style.setProperty("--warning", appearance.warning);
    document.documentElement.style.setProperty("--danger", appearance.danger);
    $("#appIcon").src = (mode === "dark" ? config.identity.assets.appIconDark : config.identity.assets.appIconLight) + "?v=" + config.identity.buildId;
    $("#versionButton").dataset.developer = String(preferences.controls.developerMode);
    $("#versionButton").textContent = "v" + config.identity.version + (preferences.controls.developerMode ? " DEV" : "");
    $("#developerTab").hidden = !preferences.controls.developerMode;
    $$('[data-theme-mode]').forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.themeMode === appearance.mode)); });
    $$('[data-button-style]').forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.buttonStyle === preferences.controls.buttonStyle)); });
    $$('[data-hints-enabled]').forEach(function (button) { button.setAttribute("aria-pressed", String((button.dataset.hintsEnabled === "true") === preferences.hints.enabled)); });
    renderHint();
    App.pwa?.applyAppearanceAssets();
  }

  function isBetaDeploy() {
    return /(^|[.-])(beta|preview|staging)([.-]|$)/i.test(location.hostname) || /\/beta\/?$/i.test(location.pathname);
  }

  function renderHeader() {
    $("#betaPill").hidden = !isBetaDeploy();
    const unread = state().ui.seenReleaseVersion !== config.identity.version;
    $("#releaseUnreadDot").hidden = !unread;
    renderWhatsNew();
  }

  function renderWhatsNew() {
    const release = config.releases[0];
    const banner = $("#whatsNewBanner");
    const unread = state().ui.seenReleaseVersion !== config.identity.version;
    banner.hidden = !unread;
    window.clearTimeout(releaseTimer);
    if (!unread || !release) return;
    $("[data-whats-new-version]", banner).textContent = "v" + release.version;
    $("[data-whats-new-title]", banner).textContent = release.title;
    $("[data-whats-new-summary]", banner).textContent = release.summary;
    banner.style.setProperty("--whats-new-duration", config.controls.whatsNewAutoDismissMs + "ms");
    requestAnimationFrame(function () { banner.classList.add("is-counting-down"); });
    releaseTimer = window.setTimeout(dismissWhatsNew, config.controls.whatsNewAutoDismissMs);
  }

  function dismissWhatsNew() {
    window.clearTimeout(releaseTimer);
    storage.mutate(function (next) { next.ui.seenReleaseVersion = config.identity.version; }, { reason: "release-seen" });
    $("#whatsNewBanner").hidden = true;
    $("#releaseUnreadDot").hidden = true;
  }

  function renderHint() {
    const hint = $("#contextHint");
    const preferences = state().preferences.hints;
    hint.hidden = !preferences.enabled || preferences.dismissed.includes(hint.dataset.hintKey);
  }

  function openNotes(trigger) {
    $("#notesTextarea").value = state().notes.text;
    App.components.openDialog("#notesDialog", { trigger: trigger, focus: "#notesTextarea" });
  }

  function saveNotes(value) {
    const text = u.cleanText(value, config.controls.maxTextLength);
    storage.mutate(function (next) {
      next.notes.text = text;
      next.notes.updatedAt = u.isoNow();
    }, { reason: "notes" });
  }

  function switchSupportTab(tab) {
    if (tab === "developer" && !state().preferences.controls.developerMode) tab = "settings";
    storage.mutate(function (next) { next.ui.supportTab = tab; }, { touch: false, reason: "support-tab" });
    $$('[data-support-tab]').forEach(function (button) {
      const selected = button.dataset.supportTab === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $$('[data-support-panel]').forEach(function (panel) { panel.hidden = panel.dataset.supportPanel !== tab; });
    $(".support-panels").scrollTop = 0;
    renderSupport();
  }

  function openSupport(tab, trigger) {
    switchSupportTab(tab || state().ui.supportTab || "settings");
    App.components.openDialog("#supportDialog", { trigger: trigger, focus: '[data-support-tab][aria-selected="true"]' });
  }

  function renderTextSize() {
    const percent = Math.round(state().preferences.appearance.textScale * 100);
    $("#textSizeSlider").value = String(percent);
    $("#textSizeValue").value = percent + "%";
  }

  async function renderStorageSummary() {
    const info = await storage.usage();
    $("#localStorageSettingsState").textContent = info.persistentStorageAvailable ? "Saved locally" : "Session only";
    $("#localStorageSettingsSummary").textContent = u.formatBytes(info.stateBytes) + " of application data is stored in this browser.";
  }

  function renderSync() {
    const cloud = state().modules.cloudSync;
    const info = App.sync.getInfo();
    $("#syncOwner").value = cloud.owner;
    $("#syncRepo").value = cloud.repo;
    $("#syncBranch").value = cloud.branch;
    $("#syncPath").value = cloud.path;
    $("#syncRememberToken").checked = cloud.rememberToken;
    $("#syncSettingsTarget").textContent = cloud.owner + "/" + cloud.repo + " · " + cloud.branch + "/" + cloud.path;
    $("#syncSettingsState").textContent = info.title;
    $("#syncSettingsState").dataset.kind = info.kind;
    $("#storedTokenLabel").textContent = storage.hasSecret() ? "A token is already stored" : "No token is stored";
    const floating = $("#floatingStatus");
    floating.dataset.kind = info.kind;
    $("#floatingStatusTitle").textContent = storage.isPersistent() ? "Saved locally" : "Session only";
    $("#floatingStatusMessage").textContent = "GitHub: " + info.title;
  }

  function renderHelp() {
    const query = $("#helpSearch").value.trim().toLowerCase();
    const topics = config.helpTopics.filter(function (topic) { return !query || (topic.title + " " + topic.section + " " + topic.keywords).toLowerCase().includes(query); });
    const groups = new Map();
    topics.forEach(function (topic) { if (!groups.has(topic.section)) groups.set(topic.section, []); groups.get(topic.section).push(topic); });
    $("#helpResultCount").textContent = topics.length + (topics.length === 1 ? " topic" : " topics");
    $("#helpContent").innerHTML = topics.length ? Array.from(groups.entries()).map(function (entry) {
      return '<section class="help-section"><h3>' + u.escapeHtml(entry[0]) + '</h3>' + entry[1].map(function (topic) { return '<article id="help-' + u.escapeHtml(topic.id) + '"><h4>' + u.escapeHtml(topic.title) + '</h4>' + topic.html + '</article>'; }).join("") + "</section>";
    }).join("") : '<p class="empty-state">No help topics match that search.</p>';
    $("#supportLinks").innerHTML = config.identity.support.map(function (link) { return '<button type="button" class="safe-link-button" data-safe-url="' + u.escapeHtml(link.url) + '">' + u.escapeHtml(link.label) + "</button>"; }).join("");
  }

  function renderReleases() {
    $("#releaseContent").innerHTML = config.releases.map(function (release, index) {
      const sections = [["Features", release.features], ["Improvements", release.improvements], ["Fixes", release.fixes], ["Known issues", release.knownIssues]].filter(function (entry) { return entry[1].length; });
      return '<details class="release-card"' + (index === 0 ? " open" : "") + '><summary><span><strong>v' + u.escapeHtml(release.version) + " · " + u.escapeHtml(release.title) + '</strong><small>' + u.dateLabel(release.date) + '</small></span></summary><div class="release-card-content"><p>' + u.escapeHtml(release.summary) + '</p><div class="release-sections">' + sections.map(function (entry) { return '<section><h5>' + entry[0] + "</h5><ul>" + entry[1].map(function (item) { return "<li>" + u.escapeHtml(item) + "</li>"; }).join("") + "</ul></section>"; }).join("") + "</div></div></details>";
    }).join("");
  }

  function renderRoadmap() {
    $("#supportRoadmapList").innerHTML = config.roadmap.length ? "" : '<div class="empty-state"><strong>No roadmap items yet</strong><span>Capture the first idea with the wish workflow.</span></div>';
  }

  function renderShortcuts() {
    const groups = new Map();
    config.shortcuts.forEach(function (item) { if (!groups.has(item.group)) groups.set(item.group, []); groups.get(item.group).push(item); });
    $("#shortcutContent").innerHTML = Array.from(groups.entries()).map(function (entry) { return '<section><h3>' + u.escapeHtml(entry[0]) + "</h3>" + entry[1].map(function (item) { return '<div class="shortcut-row"><kbd>' + u.escapeHtml(item.key) + "</kbd><span>" + u.escapeHtml(item.label) + "</span></div>"; }).join("") + "</section>"; }).join("");
  }

  function renderDeveloper() {
    const recovery = storage.recoveryInfo();
    const rows = [
      ["Application", config.identity.name + " v" + config.identity.version],
      ["State model", "v" + config.schemaVersion],
      ["Notes", state().notes.text.length + " characters"],
      ["Storage", storage.isPersistent() ? "Persistent" : "Session only"],
      ["Recovery", recovery ? u.relativeTime(recovery.createdAt) : "None"],
      ["Network", navigator.onLine === false ? "Offline" : "Online"]
    ];
    $("#developerDiagnostics").innerHTML = rows.map(function (row) { return "<div><dt>" + u.escapeHtml(row[0]) + "</dt><dd>" + u.escapeHtml(row[1]) + "</dd></div>"; }).join("");
    $("#developerState").textContent = JSON.stringify(state(), null, 2);
    $("#restoreRecoveryButton").disabled = !recovery;
  }

  function renderSupport() {
    renderTextSize();
    renderStorageSummary();
    renderSync();
    renderHelp();
    renderReleases();
    renderRoadmap();
    renderShortcuts();
    renderDeveloper();
  }

  function searchResults(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const results = [];
    config.helpTopics.forEach(function (topic) {
      if ((topic.title + " " + topic.section + " " + topic.keywords).toLowerCase().includes(needle)) results.push({ type: "help", id: topic.id, title: topic.title, meta: topic.section });
    });
    config.releases.forEach(function (release) {
      if ((release.title + " " + release.summary).toLowerCase().includes(needle)) results.push({ type: "release", title: release.title, meta: "What’s New" });
    });
    if (("notes " + state().notes.text).toLowerCase().includes(needle)) results.push({ type: "notes", title: "Notes", meta: "Local notes" });
    return results.slice(0, 12);
  }

  function renderSearch() {
    const input = $("#globalSearch");
    const panel = $("#globalSearchResults");
    const results = searchResults(input.value);
    panel.hidden = !input.value;
    panel.innerHTML = results.length ? results.map(function (result) { return '<button type="button" role="option" data-result-type="' + result.type + '" data-result-id="' + u.escapeHtml(result.id || "") + '"><span><strong>' + u.escapeHtml(result.title) + '</strong><small>' + u.escapeHtml(result.meta) + "</small></span></button>"; }).join("") : '<p class="search-empty">No matches</p>';
  }

  function activateSearchResult(button) {
    const type = button.dataset.resultType;
    $("#globalSearchResults").hidden = true;
    if (type === "notes") return openNotes($("#globalSearch"));
    if (type === "release") return openSupport("releases", $("#globalSearch"));
    openSupport("help", $("#globalSearch"));
    $("#helpSearch").value = button.querySelector("strong").textContent;
    renderHelp();
  }

  function toggleDeveloperMode(force) {
    storage.mutate(function (next) { next.preferences.controls.developerMode = typeof force === "boolean" ? force : !next.preferences.controls.developerMode; }, { reason: "developer-mode" });
    applyAppearance();
    renderSupport();
  }

  function toggleTheme() {
    const current = state().preferences.appearance.mode;
    const nextMode = current === "system" ? "light" : current === "light" ? "dark" : "system";
    storage.mutate(function (next) { next.preferences.appearance.mode = nextMode; }, { reason: "theme" });
    applyAppearance();
  }

  function syncForm() {
    return {
      owner: $("#syncOwner").value,
      repo: $("#syncRepo").value,
      branch: $("#syncBranch").value,
      path: $("#syncPath").value,
      token: $("#syncToken").value,
      rememberToken: $("#syncRememberToken").checked
    };
  }

  async function saveSync() {
    try {
      App.sync.saveConfiguration(syncForm());
      $("#syncToken").value = "";
      renderSync();
      App.components.toast("GitHub Sync settings were saved.", { title: "Connection saved", kind: "success" });
    } catch (error) { App.components.message("Could not save GitHub Sync", error.message, { trigger: $("#saveSyncButton") }); }
  }

  async function testSync() {
    try {
      App.components.setLoading(true, "Testing GitHub…");
      const result = await App.sync.testConnection(syncForm());
      if (result) App.components.toast(result.message, { title: "Connection works", kind: "success", duration: 5000 });
    } catch (error) { App.components.message("Connection failed", error.message, { trigger: $("#testSyncButton") }); }
    finally { App.components.setLoading(false); renderSync(); }
  }

  async function forgetSync() {
    if (!await App.components.confirm({ title: "Forget GitHub connection?", message: "The saved token and sync baseline will be removed from this browser.", confirmLabel: "Forget connection", danger: true, trigger: $("#forgetSyncButton") })) return;
    await App.sync.forget();
    renderSync();
  }

  async function resetPreferences() {
    if (!await App.components.confirm({ title: "Reset preferences?", message: "Notes will stay, while appearance, hints, and view settings return to defaults.", confirmLabel: "Reset preferences", danger: true, trigger: $("#resetPreferencesButton") })) return;
    storage.replace(model.resetPreferences(state()), { recoveryReason: "Before resetting preferences", reason: "reset-preferences", touch: false });
    applyAppearance();
    renderSupport();
  }

  async function eraseAll() {
    if (!await App.components.confirm({ title: "Erase all application data?", message: "This removes Notes, preferences, sync settings, token, and recovery data from this browser.", confirmLabel: "Erase all data", danger: true, trigger: $("#eraseAllButton") })) return;
    storage.clearAll();
    applyAppearance();
    renderAll();
    App.components.toast("All application data was erased.", { title: "Fresh start", kind: "success" });
  }

  function renderAll() {
    applyIdentity();
    applyAppearance();
    renderHeader();
    renderSupport();
    renderSync();
  }

  function bindEvents() {
    $("#notesButton").addEventListener("click", function () { openNotes(this); });
    $("#supportButton").addEventListener("click", function () { openSupport("settings", this); });
    $("#versionButton").addEventListener("click", function () { openSupport("releases", this); });
    $("#floatingStatus").addEventListener("click", function () { openSupport("settings", this); });
    $("#notesTextarea").addEventListener("input", function () { saveNotes(this.value); });
    $("#globalSearch").addEventListener("input", renderSearch);
    $("#globalSearchResults").addEventListener("click", function (event) { const button = event.target.closest("[data-result-type]"); if (button) activateSearchResult(button); });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".global-search-wrap")) $("#globalSearchResults").hidden = true;
      const link = event.target.closest("[data-safe-url]");
      if (link) u.safeExternalOpen(link.dataset.safeUrl);
      const dismiss = event.target.closest("[data-dismiss-hint]");
      if (dismiss) storage.mutate(function (next) { next.preferences.hints.dismissed = Array.from(new Set(next.preferences.hints.dismissed.concat(dismiss.dataset.dismissHint))); }, { reason: "hint-dismiss" });
    });
    $("[data-dismiss-release]").addEventListener("click", dismissWhatsNew);
    $("[data-open-releases]").addEventListener("click", function () { dismissWhatsNew(); openSupport("releases", this); });
    $$('[data-support-tab]').forEach(function (button) { button.addEventListener("click", function () { switchSupportTab(this.dataset.supportTab); }); });
    $(".support-tabs").addEventListener("keydown", function (event) {
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = $$('[data-support-tab]:not([hidden])', this);
      const current = tabs.indexOf(document.activeElement);
      let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
      event.preventDefault(); tabs[next].focus(); switchSupportTab(tabs[next].dataset.supportTab);
    });
    $$('[data-theme-mode]').forEach(function (button) { button.addEventListener("click", function () { storage.mutate(function (next) { next.preferences.appearance.mode = button.dataset.themeMode; }, { reason: "appearance" }); applyAppearance(); }); });
    $$('[data-button-style]').forEach(function (button) { button.addEventListener("click", function () { storage.mutate(function (next) { next.preferences.controls.buttonStyle = button.dataset.buttonStyle; }, { reason: "appearance" }); applyAppearance(); }); });
    $$('[data-hints-enabled]').forEach(function (button) { button.addEventListener("click", function () { storage.mutate(function (next) { next.preferences.hints.enabled = button.dataset.hintsEnabled === "true"; }, { reason: "hints" }); applyAppearance(); }); });
    $("#restoreHintsButton").addEventListener("click", function () { storage.mutate(function (next) { next.preferences.hints.enabled = true; next.preferences.hints.dismissed = []; }, { reason: "hints" }); applyAppearance(); });
    $("#textSizeSlider").addEventListener("input", function () { const scale = Number(this.value) / 100; storage.mutate(function (next) { next.preferences.appearance.textScale = scale; }, { reason: "text-size" }); applyAppearance(); renderTextSize(); });
    $("#helpSearch").addEventListener("input", renderHelp);
    $("#exportButton").addEventListener("click", App.portability.exportJson);
    $("#importButton").addEventListener("click", function () { $("#importFileInput").click(); });
    $("#saveSyncButton").addEventListener("click", saveSync);
    $("#testSyncButton").addEventListener("click", testSync);
    $("#forgetSyncButton").addEventListener("click", forgetSync);
    $("#resetPreferencesButton").addEventListener("click", resetPreferences);
    $("#eraseAllButton").addEventListener("click", eraseAll);
    $("#saveRecoveryButton").addEventListener("click", function () { storage.saveRecovery("Manual recovery copy"); renderDeveloper(); App.components.toast("A recovery copy was saved.", { title: "Recovery ready", kind: "success" }); });
    $("#restoreRecoveryButton").addEventListener("click", function () { storage.restoreRecovery(); renderAll(); App.components.toast("The recovery copy was restored.", { title: "Recovery complete", kind: "success" }); });
    $("#disableDeveloperButton").addEventListener("click", function () { toggleDeveloperMode(false); switchSupportTab("settings"); });

    const icon = $("#appIconButton");
    icon.addEventListener("click", function () { if (iconHoldTriggered) { iconHoldTriggered = false; return; } toggleTheme(); });
    App.components.bindLongPress(icon, function () { iconHoldTriggered = true; toggleDeveloperMode(); navigator.vibrate?.(25); }, 650);

    window.addEventListener("app:statechange", function () { renderSync(); renderDeveloper(); });
    window.addEventListener("app:syncchange", renderSync);
    window.addEventListener("app:opensyncsettings", function (event) { openSupport("settings", event.detail.trigger); });
    window.addEventListener("app:networkchange", renderSync);
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyAppearance);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { $("#globalSearchResults").hidden = true; return; }
      if (u.isEditableTarget(event.target) || event.metaKey || (event.ctrlKey && !event.altKey)) return;
      const chord = event.shiftKey && event.ctrlKey && event.altKey;
      const key = event.key.toLowerCase();
      if (!chord && event.altKey) return;
      if (key === "/") { event.preventDefault(); $("#globalSearch").focus(); }
      else if (key === "n") { event.preventDefault(); openNotes(document.activeElement); }
      else if (key === ",") { event.preventDefault(); openSupport("settings", document.activeElement); }
      else if (key === "v") { event.preventDefault(); openSupport("releases", document.activeElement); }
      else if (key === "t") { event.preventDefault(); toggleTheme(); }
      if (chord && state().preferences.controls.shortcutHints) document.documentElement.classList.add("shortcut-hints-visible");
    });
    document.addEventListener("keyup", function () { document.documentElement.classList.remove("shortcut-hints-visible"); });
  }

  function init() {
    storage.load();
    App.icons.mount();
    App.components.init();
    App.portability.init();
    App.sync.init();
    App.pwa.init();
    bindEvents();
    renderAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
