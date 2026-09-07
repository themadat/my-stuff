(function () {
  "use strict";

  window.LocalApp = window.LocalApp || {};

  window.LocalApp.config = Object.freeze({
    identity: {
      name: "My Stuff",
      shortName: "My Stuff",
      slug: "my-stuff",
      description: "A local-first application foundation.",
      version: "0.0.1.1",
      buildId: "0.0.1.1",
      repository: { label: "Project repository", url: "https://github.com/themadat/my-stuff" },
      support: [
        { label: "Report a problem", url: "https://github.com/themadat/my-stuff/issues/new" },
        { label: "View documentation", url: "https://github.com/themadat/my-stuff#readme" }
      ],
      assets: {
        favicon: "assets/icons/favicon.svg",
        appIconLight: "assets/icons/app-icon-light.svg",
        appIconDark: "assets/icons/app-icon-dark.svg",
        manifestLight: "manifest.webmanifest",
        manifestDark: "manifest-dark.webmanifest"
      }
    },
    schemaVersion: 1,
    storage: {
      stateKey: "myStuff.state.v1",
      legacyKeys: [],
      recoveryKey: "myStuff.recovery.v1",
      secretKey: "myStuff.githubToken.v1",
      sessionSecretKey: "myStuff.githubToken.session.v1"
    },
    cloudSync: { owner: "themadat", repo: "my-stuff", branch: "main", path: "data/my-stuff.json" },
    features: { documents: true, cloudSync: true, roadmap: true, developerTools: true, hints: true },
    controls: {
      shortcutHintModifier: "ShiftControlOption",
      autosaveDelayMs: 180,
      syncCheckIntervalMs: 5 * 60 * 1000,
      whatsNewAutoDismissMs: 30 * 1000,
      maxImportBytes: 5 * 1024 * 1024,
      maxTextLength: 250000
    },
    themeDefaults: { accent: "#315f73", accent2: "#b86b4b", success: "#4f745f", warning: "#9b6a24", danger: "#a74747" },
    releases: [{
      version: "0.0.1.1",
      date: "2026-09-07T12:00:00.000Z",
      title: "Start the My Stuff foundation",
      summary: "A clean local-first shell is ready for the first focused feature.",
      features: ["Blank semantic workspace", "Plain-text Notes", "Local backup and optional GitHub Sync"],
      improvements: ["Responsive Settings with appearance, help, roadmap, shortcuts, and developer tools"],
      fixes: [],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token."]
    }],
    roadmap: [],
    helpTopics: [
      { id: "start", title: "Getting started", section: "Basics", keywords: "start blank workspace foundation", html: "<p>The main workspace is intentionally blank. Add the first product feature through a focused wish, plan, or implementation request.</p>" },
      { id: "notes", title: "Notes", section: "Basics", keywords: "notes autosave local", html: "<p>Open Notes from the header or press <kbd>N</kbd>. Plain text saves automatically in this browser.</p>" },
      { id: "appearance", title: "Appearance", section: "Settings", keywords: "theme text size buttons hints", html: "<p>Settings includes system, light, and dark themes, text sizing, button presentation, and contextual hints.</p>" },
      { id: "backup", title: "Backup and restore", section: "Data", keywords: "backup export import json recovery reset", html: "<p>Export a JSON backup before major changes. Import validates the file and saves a recovery copy before replacement.</p>" },
      { id: "sync", title: "GitHub Sync", section: "Data", keywords: "github sync token cloud conflict", html: "<p>GitHub Sync is optional. Add a fine-grained token with Contents access; tokens stay on this device and are excluded from backups.</p>" },
      { id: "offline", title: "Install and offline updates", section: "Application", keywords: "install pwa offline update refresh", html: "<p>When served over HTTPS, My Stuff can be installed and keeps its shell available offline. Use Force refresh when an update notice appears.</p>" },
      { id: "privacy", title: "Privacy", section: "Data", keywords: "privacy local token", html: "<p>Notes and preferences remain in browser storage unless you export them or explicitly use GitHub Sync.</p>" },
      { id: "shortcuts", title: "Keyboard shortcuts", section: "Accessibility", keywords: "keyboard shortcuts focus", html: "<p>Press <kbd>/</kbd> for search, <kbd>N</kbd> for Notes, <kbd>,</kbd> for Settings, <kbd>V</kbd> for What’s New, and <kbd>T</kbd> to change theme.</p>" }
    ],
    shortcuts: [
      { group: "Application", key: "/", label: "Focus search" },
      { group: "Application", key: "N", label: "Open Notes" },
      { group: "Application", key: ",", label: "Open Settings" },
      { group: "Application", key: "V", label: "Open What’s New" },
      { group: "Application", key: "T", label: "Change theme" },
      { group: "Application", key: "Escape", label: "Close the active dialog or search" }
    ]
  });
})();
