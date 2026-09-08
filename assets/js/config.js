(function () {
  "use strict";

  window.LocalApp = window.LocalApp || {};

  window.LocalApp.config = Object.freeze({
    identity: {
      name: "My Stuff",
      shortName: "My Stuff",
      slug: "my-stuff",
      description: "A local-first application foundation.",
      version: "0.0.1.7",
      buildId: "0.0.1.7",
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
    cloudSync: { owner: "themadat", repo: "app-data", branch: "main", path: "data/my-stuff.json" },
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
      version: "0.0.1.7",
      date: "2026-09-08T17:18:05.000Z",
      title: "Sync to the dedicated app-data repository",
      summary: "GitHub Sync now targets themadat/app-data on main at data/my-stuff.json, matching the intended token permissions.",
      features: [],
      improvements: ["Project and support links still point to the My Stuff application repository"],
      fixes: ["Corrected the sync destination from my-stuff to app-data"],
      knownIssues: []
    }, {
      version: "0.0.1.6",
      date: "2026-09-08T17:00:38.000Z",
      title: "Give Data Sync its own Settings section",
      summary: "Connection controls and an expandable preview of the outgoing sync JSON now live together in Data Sync.",
      features: ["Data Sync tab with the supplied braces SVG", "Collapsible, read-only JSON preview generated from the same payload used for GitHub uploads"],
      improvements: ["Data & connection moved out of general Settings", "Sync setup shortcuts open Data Sync directly", "Expanded JSON updates with Notes changes without including credentials or device preferences"],
      fixes: [],
      knownIssues: []
    }, {
      version: "0.0.1.5",
      date: "2026-09-08T16:55:28.000Z",
      title: "Clarify cloud choices and access checks",
      summary: "Cloud copy choices are left-aligned with symbols, and token tests distinguish read access from upload permission.",
      features: [],
      improvements: ["Leading cloud symbols for Merge, Upload, and Download choices", "Read-test results explain that uploads require separate write permission", "GitHub access errors are visible in Settings with the configured repository and recovery steps"],
      fixes: ["Read-only connection tests no longer claim the connection fully works", "Known read-only repositories fail the test without replacing stored credentials", "Branch-rule denials retain their explanation instead of appearing as stale-content conflicts"],
      knownIssues: ["Test does not write to GitHub. Repository selection, Contents: Read and write, and branch rules must permit an actual upload."]
    }, {
      version: "0.0.1.4",
      date: "2026-09-08T03:42:06.000Z",
      title: "Add the My Stuff app icon",
      summary: "Your storage-box artwork now identifies My Stuff across the app and installation surfaces.",
      features: ["Original supplied SVG for the header and favicon in both themes"],
      improvements: ["Matching 192px, 512px, Apple touch, maskable, and light/dark splash assets", "Padded foreground and an opaque background for platform-masked install icons"],
      fixes: ["Replaced the active placeholder application artwork"],
      knownIssues: []
    }, {
      version: "0.0.1.3",
      date: "2026-09-08T03:28:10.000Z",
      title: "Bring Settings and cloud sync up to date",
      summary: "Adopts app-template’s Settings and cloud-sync updates from 0.0.1.61 through 0.0.1.67.",
      features: ["Sync Now and Restore from Cloud actions with shared SVG cloud status symbols", "Compact linked GitHub target and visible masked saved credentials"],
      improvements: ["Only Notes sync; appearance, search, settings, and save metadata stay local", "Successful connection tests retain credentials on the device or for the tab", "Full-screen mobile Settings with one scrolling surface and a sticky close header"],
      fixes: ["Recovery must succeed before cloud content replaces local Notes", "Legacy whole-state cloud copies migrate without false settings conflicts", "Background status updates no longer overwrite unsaved token or remember-token edits", "Button-style handlers are scoped to controls so unrelated clicks no longer reset checkbox edits"],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token with Contents read and write access. Update other devices before syncing the new content-only format."]
    }, {
      version: "0.0.1.2",
      date: "2026-09-07T14:45:00.000Z",
      title: "Restore the base interface symbols",
      summary: "Every symbol used by the retained shell is self-contained again.",
      features: ["Original SVG artwork for the top bar, search, Notes, Settings, appearance controls, Help, Roadmap, shortcuts, Developer tools, and GitHub Sync"],
      improvements: ["The compact interface-symbol helper has no dependency on removed product data"],
      fixes: ["Replaced temporary outline stand-ins with the original base UI artwork"],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token."]
    }, {
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
      { id: "data-sync", title: "Data Sync", section: "Settings", keywords: "data connection sync json payload preview github braces", html: "<p>Open Settings → Data Sync for local storage status, GitHub connection details, and sync actions. Expand JSON sent to GitHub to inspect the exact outgoing data file generated from this device. It updates when Notes change, excludes the token and device settings, and does not fetch the current cloud copy. Backup, restore, and reset controls remain in general Settings.</p>" },
      { id: "start", title: "Getting started", section: "Basics", keywords: "start blank workspace foundation", html: "<p>The main workspace is intentionally blank. Add the first product feature through a focused wish, plan, or implementation request.</p>" },
      { id: "notes", title: "Notes", section: "Basics", keywords: "notes autosave local", html: "<p>Open Notes from the header or press <kbd>N</kbd>. Plain text saves automatically in this browser.</p>" },
      { id: "appearance", title: "Appearance", section: "Settings", keywords: "theme text size buttons hints", html: "<p>Settings includes system, light, and dark themes, text sizing, button presentation, and contextual hints.</p>" },
      { id: "backup", title: "Backup and restore", section: "Data", keywords: "backup export import json recovery reset", html: "<p>Export a JSON backup before major changes. Import validates the file and saves a recovery copy before replacement.</p>" },
      { id: "sync", title: "GitHub Sync", section: "Data", keywords: "github sync token cloud conflict restore connection", html: "<p>GitHub Sync is optional and syncs Notes only. Add a fine-grained token with Contents read and write access to the configured repository. Test retains credentials after a read check, but makes no changes on GitHub and cannot verify upload permission. Save stores them and checks the cloud copy. If upload reports Access Required, select the configured repository in the token settings, grant Contents: Read and write, and check repository access, organization approval, and branch rules. GitHub’s error details remain visible in Settings. A masked saved token remains visible in Settings. Turn Remember off to keep it only for this tab.</p><p>Use Sync Now, press <kbd>S</kbd>, or click the floating status to compare copies. First sync and conflicting Notes require a choice. Restore from Cloud asks for confirmation and requires a local recovery copy before replacing Notes. Device settings stay local. Update other devices before using the compact cloud format; older whole-state files remain readable.</p>" },
      { id: "offline", title: "Install and offline updates", section: "Application", keywords: "install pwa offline update refresh", html: "<p>When served over HTTPS, My Stuff can be installed and keeps its shell available offline. Use Force refresh when an update notice appears.</p>" },
      { id: "privacy", title: "Privacy", section: "Data", keywords: "privacy local token", html: "<p>Notes stay in browser storage unless exported or synced to GitHub. Preferences and view settings stay on this device and are included only in full JSON backups, not cloud sync. Tokens are stored separately and excluded from backups, cloud data, and diagnostics.</p>" },
      { id: "shortcuts", title: "Keyboard shortcuts", section: "Accessibility", keywords: "keyboard shortcuts focus", html: "<p>Press <kbd>/</kbd> for search, <kbd>N</kbd> for Notes, <kbd>,</kbd> for Settings, <kbd>V</kbd> for What’s New, and <kbd>T</kbd> to change theme.</p>" }
    ],
    shortcuts: [
      { group: "Application", key: "/", label: "Focus search" },
      { group: "Application", key: "N", label: "Open Notes" },
      { group: "Application", key: ",", label: "Open Settings" },
      { group: "Application", key: "V", label: "Open What’s New" },
      { group: "Application", key: "T", label: "Change theme" },
      { group: "Application", key: "S", label: "Sync now or open sync settings" },
      { group: "Application", key: "Escape", label: "Close the active dialog or search" }
    ]
  });
})();
