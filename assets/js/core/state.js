(function () {
  "use strict";

  const App = window.LocalApp;
  const config = App.config;
  const u = App.utils;
  const CLOUD_TARGET = Object.freeze({
    owner: u.cleanLine(config.cloudSync.owner, 39),
    repo: u.cleanLine(config.cloudSync.repo, 100).replace(/\.git$/i, ""),
    branch: u.cleanLine(config.cloudSync.branch || "main", 250) || "main",
    path: u.cleanLine(config.cloudSync.path || "data/my-stuff.json", 500).replace(/^\/+/, "")
  });

  function createDefaultState() {
    const now = u.isoNow();
    return {
      schemaVersion: config.schemaVersion,
      meta: {
        appVersion: config.identity.version,
        buildId: config.identity.buildId,
        createdAt: now,
        updatedAt: now,
        lastMutationId: u.uid("mutation")
      },
      notes: { text: "", updatedAt: now },
      inventory: App.inventoryModel.normalize(),
      preferences: {
        appearance: Object.assign({ mode: "system", textScale: 1 }, config.themeDefaults),
        controls: {
          buttonStyle: "both",
          shortcutHints: true,
          shortcutHintModifier: config.controls.shortcutHintModifier,
          developerMode: false
        },
        hints: { enabled: config.features.hints, dismissed: [] },
        installation: { iconVariant: "auto" }
      },
      ui: {
        search: "",
        seenReleaseVersion: "",
        supportTab: "settings"
      },
      modules: {
        roadmap: { search: "", state: "all", priority: "all", target: "all", effort: "all", sortBy: "priority" },
        cloudSync: {
          enabled: config.features.cloudSync,
          owner: CLOUD_TARGET.owner,
          repo: CLOUD_TARGET.repo,
          branch: CLOUD_TARGET.branch,
          path: CLOUD_TARGET.path,
          rememberToken: true,
          advancedOpen: false,
          baselineTarget: "",
          baselineSha: "",
          baselineHash: "",
          lastSyncedAt: "",
          lastCheckedAt: ""
        }
      }
    };
  }

  function unwrapInput(input) {
    const source = u.plainObject(input);
    return source.exportFormat && source.state ? u.plainObject(source.state) : source;
  }

  function normalize(input) {
    const source = unwrapInput(input);
    const base = createDefaultState();
    const now = u.isoNow();
    const meta = u.plainObject(source.meta);
    const notes = u.plainObject(source.notes);
    const preferences = u.plainObject(source.preferences);
    const appearance = u.plainObject(preferences.appearance);
    const controls = u.plainObject(preferences.controls);
    const hints = u.plainObject(preferences.hints);
    const installation = u.plainObject(preferences.installation);
    const ui = u.plainObject(source.ui);
    const modules = u.plainObject(source.modules);
    const roadmap = u.plainObject(modules.roadmap);
    const cloud = u.plainObject(modules.cloudSync);
    const theme = config.themeDefaults;
    return {
      schemaVersion: config.schemaVersion,
      meta: {
        appVersion: config.identity.version,
        buildId: config.identity.buildId,
        createdAt: u.ensureIso(meta.createdAt, now),
        updatedAt: u.ensureIso(meta.updatedAt, now),
        lastMutationId: u.cleanLine(meta.lastMutationId, 100) || u.uid("mutation")
      },
      notes: {
        text: u.cleanText(notes.text, config.controls.maxTextLength),
        updatedAt: u.ensureIso(notes.updatedAt, meta.updatedAt || now)
      },
      inventory: App.inventoryModel.normalize(source.inventory),
      preferences: {
        appearance: {
          mode: ["system", "light", "dark"].includes(appearance.mode) ? appearance.mode : "system",
          accent: u.normalizeColor(appearance.accent, theme.accent),
          accent2: u.normalizeColor(appearance.accent2, theme.accent2),
          success: u.normalizeColor(appearance.success, theme.success),
          warning: u.normalizeColor(appearance.warning, theme.warning),
          danger: u.normalizeColor(appearance.danger, theme.danger),
          textScale: u.clamp(appearance.textScale, 0.85, 1.3, 1)
        },
        controls: {
          buttonStyle: ["icons", "text", "both"].includes(controls.buttonStyle) ? controls.buttonStyle : "both",
          shortcutHints: controls.shortcutHints !== false,
          shortcutHintModifier: config.controls.shortcutHintModifier,
          developerMode: controls.developerMode === true
        },
        hints: {
          enabled: config.features.hints && hints.enabled !== false,
          dismissed: Array.from(new Set((Array.isArray(hints.dismissed) ? hints.dismissed : []).map(function (id) { return u.cleanLine(id, 80); }).filter(Boolean))).slice(0, 200)
        },
        installation: { iconVariant: ["auto", "light", "dark"].includes(installation.iconVariant) ? installation.iconVariant : "auto" }
      },
      ui: {
        search: u.cleanLine(ui.search, 200),
        seenReleaseVersion: u.cleanLine(ui.seenReleaseVersion, 32),
        supportTab: ["settings", "data-sync", "help", "releases", "roadmap", "shortcuts", "developer"].includes(ui.supportTab) ? ui.supportTab : "settings"
      },
      modules: {
        roadmap: {
          search: u.cleanLine(roadmap.search, 200),
          state: ["all", "released", "planned", "wishlist"].includes(roadmap.state) ? roadmap.state : "all",
          priority: ["all", "1", "2", "3"].includes(String(roadmap.priority)) ? String(roadmap.priority) : "all",
          target: roadmap.target ? u.cleanLine(roadmap.target, 80) : "all",
          effort: ["all", "1", "2", "3", "4"].includes(String(roadmap.effort)) ? String(roadmap.effort) : "all",
          sortBy: ["priority", "target", "effort", "age", "title"].includes(roadmap.sortBy) ? roadmap.sortBy : "priority"
        },
        cloudSync: {
          enabled: config.features.cloudSync && cloud.enabled !== false,
          owner: CLOUD_TARGET.owner,
          repo: CLOUD_TARGET.repo,
          branch: CLOUD_TARGET.branch,
          path: CLOUD_TARGET.path,
          rememberToken: cloud.rememberToken !== false,
          advancedOpen: false,
          baselineTarget: u.cleanLine(cloud.baselineTarget, 800),
          baselineSha: u.cleanLine(cloud.baselineSha, 100),
          baselineHash: u.cleanLine(cloud.baselineHash, 100),
          lastSyncedAt: cloud.lastSyncedAt ? u.ensureIso(cloud.lastSyncedAt, "") : "",
          lastCheckedAt: cloud.lastCheckedAt ? u.ensureIso(cloud.lastCheckedAt, "") : ""
        }
      }
    };
  }

  function validate(state) {
    const errors = [];
    if (!state || typeof state !== "object") errors.push("The root value must be an object.");
    if (state.schemaVersion !== config.schemaVersion) errors.push("The state-model version is not supported.");
    if (!state.notes || typeof state.notes.text !== "string") errors.push("Notes are missing or invalid.");
    return { ok: errors.length === 0, errors: errors, warnings: [] };
  }

  function prepare(input) {
    if (input && ("syncFormat" in Object(input) || "syncVersion" in Object(input))) return prepareSync(input);
    const source = unwrapInput(input);
    if (![1, config.schemaVersion].includes(Number(source.schemaVersion))) throw new Error("This backup uses an unsupported state-model version.");
    if (Number(source.schemaVersion) === 2 && !source.inventory) throw new Error("This backup is missing inventory data.");
    const state = normalize(source);
    const validation = validate(state);
    if (!validation.ok) throw new Error(validation.errors.join(" "));
    return { state: state, migrations: Number(source.schemaVersion) === 1 ? ["Added inventory without changing existing Notes or preferences"] : [], validation: validation };
  }

  function touch(state) {
    state.meta.appVersion = config.identity.version;
    state.meta.buildId = config.identity.buildId;
    state.meta.updatedAt = u.isoNow();
    state.meta.lastMutationId = u.uid("mutation");
    return state;
  }

  function resetPreferences(state) {
    const next = u.clone(state);
    const defaults = createDefaultState();
    next.preferences = defaults.preferences;
    next.ui.search = "";
    next.ui.supportTab = "settings";
    next.modules.roadmap = defaults.modules.roadmap;
    return normalize(touch(next));
  }

  function exportEnvelope(state) {
    return {
      exportFormat: "my-stuff-backup",
      exportedAt: u.isoNow(),
      application: { name: config.identity.name, version: config.identity.version, buildId: config.identity.buildId },
      schemaVersion: config.schemaVersion,
      state: normalize(u.clone(state))
    };
  }

  function syncPayload(state) {
    const normalized = normalize(state), data = { inventory: normalized.inventory };
    data.inventory.items.sort(function (a, b) { return a.id.localeCompare(b.id); });
    if (normalized.notes.text) data.notes = normalized.notes.text;
    // Schema 6 makes Notes-only clients reject inventory data instead of erasing it.
    return { syncFormat: "local-first-app-data", syncVersion: 1, schemaVersion: 6, data: data };
  }

  function syncHash(state) { return "data-v2:" + u.fingerprint(syncPayload(state)); }

  function prepareSync(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("The cloud data must be an object.");
    if (!("syncFormat" in input) && !("syncVersion" in input)) {
      const source = unwrapInput(input);
      if (!source.notes || typeof source.notes.text !== "string" || source.notes.text.length > config.controls.maxTextLength || source.workspace) throw new Error("This is not a supported My Stuff cloud copy.");
      const prepared = prepare(input);
      if (!source.inventory) prepared.state.syncNotesOnly = true;
      return Object.assign({}, prepared, { legacy: true });
    }
    if (input.syncFormat !== "local-first-app-data" || input.syncVersion !== 1 || ![5, 6].includes(input.schemaVersion)) throw new Error("This cloud data uses an unsupported format or version.");
    const data = input.data;
    const keys = input.schemaVersion === 5 ? ["notes"] : ["notes", "inventory"];
    if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).some(function (key) { return !keys.includes(key); })) throw new Error("The cloud data contains unsupported content.");
    if ("notes" in data && (typeof data.notes !== "string" || data.notes.length > config.controls.maxTextLength)) throw new Error("Cloud Notes are invalid or too large.");
    if (input.schemaVersion === 6 && !data.inventory) throw new Error("Cloud inventory is missing.");
    const state = normalize({ notes: { text: data.notes || "" }, inventory: data.inventory });
    if (input.schemaVersion === 5) state.syncNotesOnly = true;
    return { state: state, legacy: input.schemaVersion === 5, contentOnly: true, migrations: [], validation: validate(state) };
  }

  function applySync(localState, remoteState) {
    const next = normalize(localState);
    next.notes = normalize(remoteState).notes;
    if (!remoteState.syncNotesOnly) next.inventory = normalize(remoteState).inventory;
    return normalize(touch(next));
  }

  function merge(localState, remoteState) {
    const local = normalize(localState), remote = normalize(remoteState);
    if (local.notes.text && remote.notes.text && local.notes.text !== remote.notes.text) throw new Error("Notes differ. Choose which copy to keep.");
    const next = applySync(local, local.notes.text ? local : remote);
    next.inventory = remoteState.syncNotesOnly ? local.inventory : App.inventoryModel.merge(local.inventory, remote.inventory);
    return next;
  }

  function canMerge(localState, remoteState) {
    try { merge(localState, remoteState); return true; } catch (error) { return false; }
  }

  App.stateModel = {
    migrations: [],
    createDefaultState: createDefaultState,
    normalize: normalize,
    validate: validate,
    prepare: prepare,
    touch: touch,
    resetPreferences: resetPreferences,
    exportEnvelope: exportEnvelope,
    syncPayload: syncPayload,
    syncHash: syncHash,
    syncHashPrefix: "data-v2:",
    prepareSync: prepareSync,
    applySync: applySync,
    canMerge: canMerge,
    merge: merge
  };
})();
