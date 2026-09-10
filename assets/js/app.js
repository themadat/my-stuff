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
    $$('button[data-button-style]').forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.buttonStyle === preferences.controls.buttonStyle)); });
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
    $("#supportDialog").scrollTop = 0;
    renderSupport();
  }

  function openSupport(tab, trigger) {
    switchSupportTab(tab || state().ui.supportTab || "settings");
    App.components.openDialog("#supportDialog", { trigger: trigger, focus: '[data-support-tab][aria-selected="true"]' });
  }

  function renderTextSize() {
    const input = $("#textSizeSlider");
    const output = $("#textSizeValue");
    const wrap = $(".text-size-slider-wrap");
    if (!input || !output || !wrap) return;
    const percent = Math.round(state().preferences.appearance.textScale * 100);
    const minimum = Number(input.min) || 85;
    const maximum = Number(input.max) || 130;
    const ratio = Math.max(0, Math.min(1, (percent - minimum) / (maximum - minimum)));
    input.value = String(percent);
    input.style.setProperty("--range-pct", (ratio * 100) + "%");
    wrap.style.setProperty("--thumb-ratio", String(ratio));
    output.textContent = percent + "%";
  }

  async function renderStorageSummary() {
    const info = await storage.usage();
    $("#localStorageSettingsState").textContent = info.persistentStorageAvailable ? "Saved locally" : "Session only";
    $("#localStorageSettingsSummary").textContent = u.formatBytes(info.stateBytes) + " of application data is stored in this browser.";
  }

  function renderCloudSyncVisual(element, info) {
    element.dataset.syncState = info.state;
    element.dataset.kind = info.kind;
    element.dataset.animation = info.animation;
    const icon = element.querySelector("[data-sync-icon]");
    if (icon && icon.dataset.symbol !== info.symbol) App.icons.set(icon, info.symbol);
  }

  function renderSyncStatus() {
    const info = App.sync.getInfo();
    const localAvailable = storage.isPersistent();
    const localLabel = localAvailable ? "Saved locally" : "Storage unavailable";
    const syncLabel = "GitHub · " + info.title;
    const button = $("#floatingStatus");
    renderCloudSyncVisual(button, info);
    button.dataset.localStorage = localAvailable ? "available" : "unavailable";
    button.setAttribute("aria-disabled", String(info.busy));
    button.title = localLabel + ". " + info.help + (info.busy ? "" : " " + info.action + ": " + App.sync.actions[info.primaryAction].help);
    button.setAttribute("aria-label", button.title);
    $("#floatingStatusTitle").textContent = localLabel;
    $("#floatingStatusMessage").textContent = syncLabel;
  }

  function renderSyncSettings() {
    const localAvailable = storage.isPersistent();
    $("#localStorageSettingsState").textContent = localAvailable ? "Saved locally" : "Unavailable";
    $("#localStorageSettingsState").dataset.kind = localAvailable ? "success" : "danger";
    if (!config.features.cloudSync) { $("#cloudSyncSettings").hidden = true; return; }
    const cloud = state().modules.cloudSync;
    const info = App.sync.getInfo();
    $("#cloudSyncSettings").hidden = false;
    const settingsStatus = $("#syncSettingsState");
    renderCloudSyncVisual(settingsStatus, info);
    settingsStatus.querySelector("[data-sync-label]").textContent = info.title;
    settingsStatus.title = info.help;
    $("#syncSettingsMessage").textContent = info.message;
    [["#syncNowButton", "syncNow", info.canSync], ["#restoreCloudButton", "restore", info.canRestore]].forEach(function (entry) {
      const button = $(entry[0]);
      const action = App.sync.actions[entry[1]];
      App.icons.set(button.querySelector("[data-sync-action-icon]"), action.symbol);
      button.querySelector("[data-sync-action-label]").textContent = action.title;
      button.setAttribute("aria-label", action.title);
      button.title = action.help + (entry[2] ? "" : " " + info.help);
      button.disabled = !entry[2];
    });
    const appRepositoryUrl = u.safeUrl(config.identity.repository.url);
    const appRepositoryLink = $("#appRepositoryLink");
    appRepositoryLink.textContent = appRepositoryUrl ? config.identity.repository.label : "App repository not configured";
    appRepositoryLink.hidden = !appRepositoryUrl;
    if (appRepositoryUrl) {
      appRepositoryLink.href = appRepositoryUrl;
      appRepositoryLink.setAttribute("aria-label", config.identity.repository.label + " (opens in a new tab)");
    } else {
      appRepositoryLink.removeAttribute("href");
      appRepositoryLink.removeAttribute("aria-label");
    }
    $("#syncOwner").textContent = cloud.owner || "Not set";
    $("#syncBranch").textContent = cloud.branch || "Not set";
    const repositoryUrl = cloud.owner && cloud.repo ? u.safeUrl("https://github.com/" + encodeURIComponent(cloud.owner) + "/" + encodeURIComponent(cloud.repo)) : "";
    const dataFileUrl = repositoryUrl && cloud.branch && cloud.path ? u.safeUrl(repositoryUrl + "/blob/" + encodeURIComponent(cloud.branch) + "/" + cloud.path.split("/").map(encodeURIComponent).join("/")) : "";
    [["#syncRepo", cloud.repo, repositoryUrl, "Open GitHub repository"], ["#syncPath", cloud.path, dataFileUrl, "Open GitHub data file"]].forEach(function (entry) {
      const link = $(entry[0]);
      link.textContent = entry[1] || "Not set";
      if (entry[2]) {
        link.href = entry[2];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", entry[3] + " (opens in a new tab)");
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.removeAttribute("aria-label");
      }
    });
    const tokenInput = $("#syncToken");
    const rememberInput = $("#syncRememberToken");
    const hasStoredToken = storage.hasSecret();
    if (tokenInput.dataset.dirty !== "true") tokenInput.value = hasStoredToken ? storage.getSecret() : "";
    if (rememberInput.dataset.dirty !== "true") rememberInput.checked = cloud.rememberToken;
    $("#storedTokenLabel").textContent = hasStoredToken ? (cloud.rememberToken ? "Stored on this device" : "Stored for this tab") : "Required";
    tokenInput.placeholder = hasStoredToken ? "Token stored" : "Enter token";
    $("#forgetSyncButton").disabled = !hasStoredToken && !cloud.baselineHash;
    $("#saveSyncButton").disabled = info.busy;
    $("#testSyncButton").disabled = info.busy;
  }

  function markSyncCredentialFieldsClean() {
    delete $("#syncToken").dataset.dirty;
    delete $("#syncRememberToken").dataset.dirty;
  }

  function renderSyncPayload() {
    const disclosure = $("#syncPayloadDisclosure");
    const output = $("#syncPayloadJson");
    // Use the exact upload serializer, never the full state or export envelope.
    const json = disclosure.open ? JSON.stringify(model.syncPayload(state()), null, 2) : "";
    if (output.textContent !== json) output.textContent = json;
  }

  function renderSync() { renderSyncStatus(); renderSyncSettings(); renderSyncPayload(); }

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
    App.inventoryCatalog.render();
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
    const cloud = state().modules.cloudSync;
    return {
      owner: cloud.owner,
      repo: cloud.repo,
      branch: cloud.branch,
      path: cloud.path,
      token: $("#syncToken").value,
      rememberToken: $("#syncRememberToken").checked
    };
  }

  async function saveSync() {
    try {
      App.sync.saveConfiguration(syncForm());
      markSyncCredentialFieldsClean();
      renderSync();
      App.components.toast("GitHub Sync settings were saved.", { title: "Connection Saved", kind: "success" });
      App.sync.check(true);
    } catch (error) { App.components.message("Could not save GitHub Sync", error.message, { trigger: $("#saveSyncButton") }); }
  }

  async function testSync() {
    try {
      App.components.setLoading(true, "Testing GitHub…");
      const result = await App.sync.testConnection(syncForm());
      if (result) {
        markSyncCredentialFieldsClean();
        App.components.message(result.title, result.message, { trigger: $("#testSyncButton") });
      }
    } catch (error) { App.components.message("Connection failed", error.message, { trigger: $("#testSyncButton") }); }
    finally { App.components.setLoading(false); renderSync(); }
  }

  async function forgetSync() {
    if (!await App.components.confirm({ title: "Forget GitHub Connection?", message: "The saved token and sync baseline will be removed from this browser.", confirmLabel: "Forget Connection", danger: true, trigger: $("#forgetSyncButton") })) return;
    await App.sync.forget();
    markSyncCredentialFieldsClean();
    renderSync();
  }

  async function resetPreferences() {
    if (!await App.components.confirm({ title: "Reset Preferences?", message: "Notes and inventory will stay, while appearance, hints, and view settings return to defaults.", confirmLabel: "Reset Preferences", danger: true, trigger: $("#resetPreferencesButton") })) return;
    storage.replace(model.resetPreferences(state()), { recoveryReason: "Before resetting preferences", reason: "reset-preferences", touch: false });
    applyAppearance();
    renderSupport();
  }

  async function eraseAll() {
    if (!await App.components.confirm({ title: "Erase All Application Data?", message: "This removes inventory, Notes, preferences, sync settings, token, and recovery data from this browser.", confirmLabel: "Erase All Data", danger: true, trigger: $("#eraseAllButton") })) return;
    await App.sync.forget();
    storage.clearAll();
    markSyncCredentialFieldsClean();
    applyAppearance();
    renderAll();
    App.components.toast("All application data was erased.", { title: "Fresh Start", kind: "success" });
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
    $("#floatingStatus").addEventListener("click", function () { App.sync.syncNow(this); });
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
    $$('button[data-button-style]').forEach(function (button) { button.addEventListener("click", function () { storage.mutate(function (next) { next.preferences.controls.buttonStyle = button.dataset.buttonStyle; }, { reason: "appearance" }); applyAppearance(); }); });
    $$('[data-hints-enabled]').forEach(function (button) { button.addEventListener("click", function () { storage.mutate(function (next) { next.preferences.hints.enabled = button.dataset.hintsEnabled === "true"; }, { reason: "hints" }); applyAppearance(); }); });
    $("#restoreHintsButton").addEventListener("click", function () { storage.mutate(function (next) { next.preferences.hints.enabled = true; next.preferences.hints.dismissed = []; }, { reason: "hints" }); applyAppearance(); });
    $("#textSizeSlider").addEventListener("input", function () { const scale = Number(this.value) / 100; storage.mutate(function (next) { next.preferences.appearance.textScale = scale; }, { reason: "text-size" }); applyAppearance(); renderTextSize(); });
    $("#helpSearch").addEventListener("input", renderHelp);
    $("#syncPayloadDisclosure").addEventListener("toggle", renderSyncPayload);
    $("#exportButton").addEventListener("click", App.portability.exportJson);
    $("#importButton").addEventListener("click", function () { $("#importFileInput").click(); });
    $("#syncNowButton").addEventListener("click", function () { App.sync.syncNow(this); });
    $("#restoreCloudButton").addEventListener("click", function () { App.sync.restoreFromCloud(this); });
    $("#syncToken").addEventListener("input", function () { this.dataset.dirty = "true"; });
    $("#syncRememberToken").addEventListener("change", function () { this.dataset.dirty = "true"; });
    $("#saveSyncButton").addEventListener("click", saveSync);
    $("#testSyncButton").addEventListener("click", testSync);
    $("#forgetSyncButton").addEventListener("click", forgetSync);
    $("#resetPreferencesButton").addEventListener("click", resetPreferences);
    $("#eraseAllButton").addEventListener("click", eraseAll);
    $("#saveRecoveryButton").addEventListener("click", function () { storage.saveRecovery("Manual recovery copy"); renderDeveloper(); App.components.toast("A recovery copy was saved.", { title: "Recovery Ready", kind: "success" }); });
    $("#restoreRecoveryButton").addEventListener("click", function () { storage.restoreRecovery(); renderAll(); App.components.toast("The recovery copy was restored.", { title: "Recovery Complete", kind: "success" }); });
    $("#disableDeveloperButton").addEventListener("click", function () { toggleDeveloperMode(false); switchSupportTab("settings"); });

    const icon = $("#appIconButton");
    icon.addEventListener("click", function () { if (iconHoldTriggered) { iconHoldTriggered = false; return; } toggleTheme(); });
    App.components.bindLongPress(icon, function () { iconHoldTriggered = true; toggleDeveloperMode(); navigator.vibrate?.(25); }, 650);

    window.addEventListener("app:statechange", function (event) {
      renderSync(); renderDeveloper();
      if (["import", "recovery", "sync-download", "sync-merge"].includes(event.detail.reason)) {
        $("#notesTextarea").value = state().notes.text;
        applyAppearance(); renderSupport();
      }
    });
    window.addEventListener("app:syncchange", renderSync);
    window.addEventListener("app:opensyncsettings", function (event) {
      openSupport("data-sync", event.detail.trigger);
      requestAnimationFrame(function () { $("#storageSyncSettings").scrollIntoView({ block: "start" }); $("#syncToken").focus({ preventScroll: true }); });
    });
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
      else if (key === "s") { event.preventDefault(); App.sync.syncNow(document.activeElement); }
      else if (key === "t") { event.preventDefault(); toggleTheme(); }
      if (chord && state().preferences.controls.shortcutHints) document.documentElement.classList.add("shortcut-hints-visible");
    });
    document.addEventListener("keyup", function () { document.documentElement.classList.remove("shortcut-hints-visible"); });
  }

  function init() {
    storage.load();
    App.inventoryUI.init();
    App.inventoryCatalog.init();
    App.bulkEntry.init();
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
