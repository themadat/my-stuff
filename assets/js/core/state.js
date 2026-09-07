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
        supportTab: ["settings", "help", "releases", "roadmap", "shortcuts", "developer"].includes(ui.supportTab) ? ui.supportTab : "settings"
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
    const source = unwrapInput(input);
    if (Number(source.schemaVersion) !== config.schemaVersion) throw new Error("This backup uses an unsupported state-model version.");
    const state = normalize(source);
    const validation = validate(state);
    if (!validation.ok) throw new Error(validation.errors.join(" "));
    return { state: state, migrations: [], validation: validation };
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
    const normalized = normalize(u.clone(state));
    return {
      schemaVersion: normalized.schemaVersion,
      meta: normalized.meta,
      notes: normalized.notes,
      preferences: normalized.preferences,
      ui: normalized.ui,
      modules: { roadmap: normalized.modules.roadmap }
    };
  }

  function merge(localState, remoteInput) {
    const local = normalize(localState);
    const remote = prepare(remoteInput).state;
    const newer = Date.parse(remote.meta.updatedAt) > Date.parse(local.meta.updatedAt) ? remote : local;
    const result = u.clone(newer);
    result.notes = u.clone(Date.parse(remote.notes.updatedAt) > Date.parse(local.notes.updatedAt) ? remote.notes : local.notes);
    result.modules.cloudSync = u.clone(local.modules.cloudSync);
    return normalize(touch(result));
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
    merge: merge
  };
})();
