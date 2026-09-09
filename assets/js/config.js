(function () {
  "use strict";

  window.LocalApp = window.LocalApp || {};

  window.LocalApp.config = Object.freeze({
    identity: {
      name: "My Stuff",
      shortName: "My Stuff",
      slug: "my-stuff",
      description: "A local-first inventory of the things you own and used to own.",
      version: "0.0.1.12",
      buildId: "0.0.1.12",
      repository: { label: "Project Repository", url: "https://github.com/themadat/my-stuff" },
      support: [
        { label: "Report a Problem", url: "https://github.com/themadat/my-stuff/issues/new" },
        { label: "View Documentation", url: "https://github.com/themadat/my-stuff#readme" }
      ],
      assets: {
        favicon: "assets/icons/favicon.svg",
        appIconLight: "assets/icons/app-icon-light.svg",
        appIconDark: "assets/icons/app-icon-dark.svg",
        manifestLight: "manifest.webmanifest",
        manifestDark: "manifest-dark.webmanifest"
      }
    },
    schemaVersion: 2,
    inventory: {
      defaultCurrency: "USD",
      currencies: ["USD"],
      locations: [{"zone": "Outside", "room": "Yard", "spaces": []}, {"zone": "Outside", "room": "Shed", "spaces": []}, {"zone": "Outside", "room": "Nest", "spaces": []}, {"zone": "Outside", "room": "Patio", "spaces": ["Pickle Bag"]}, {"zone": "Outside", "room": "Garage", "spaces": ["Car"]}, {"zone": "Outside", "room": "Attic", "spaces": []}, {"zone": "Outside", "room": "Crawl", "spaces": []}, {"zone": "Main Level", "room": "Foyer", "spaces": []}, {"zone": "Main Level", "room": "Hallway", "spaces": []}, {"zone": "Main Level", "room": "Game Room", "spaces": []}, {"zone": "Main Level", "room": "Kitchen", "spaces": ["Pantry"]}, {"zone": "Main Level", "room": "Nook", "spaces": ["Floating", "Go Bag"]}, {"zone": "Main Level", "room": "Den", "spaces": ["Bar"]}, {"zone": "Main Level", "room": "Doge’s Den", "spaces": []}, {"zone": "Main Level", "room": "Mud Room", "spaces": []}, {"zone": "Main Level", "room": "Powder Room", "spaces": []}, {"zone": "Main Level", "room": "Primary Bedroom", "spaces": ["Closet"]}, {"zone": "Main Level", "room": "Primary Bathroom", "spaces": ["Closet", "Water Closet"]}, {"zone": "Upstairs", "room": "Loft", "spaces": ["Closet"]}, {"zone": "Upstairs", "room": "Office", "spaces": ["Closet", "Desk"]}, {"zone": "Upstairs", "room": "Utility Room", "spaces": ["Closet"]}, {"zone": "Upstairs", "room": "Guest Room", "spaces": ["Closet"]}, {"zone": "Upstairs", "room": "J&J Bathroom", "spaces": ["Guest Sinkroom", "Loft Sinkroom"]}],
      tagGroups: [{"name": "Activity", "tags": ["Pickleball", "Backpacking", "Biking", "Golfing", "Hiking"]}, {"name": "Apparel", "tags": ["Headware", "Eyewear", "Handware", "Footware", "Clothing", "Scarf"]}, {"name": "Power", "tags": ["Cable", "Powerbank", "Coax", "Ethernet", "Extension"]}, {"name": "Systems", "tags": ["Fan", "Fire", "Fixture", "HVAC", "Temperature", "Water", "Switch"]}, {"name": "Lighting", "tags": ["Bulb", "Decor", "LED", "Night", "String"]}, {"name": "Tech", "tags": ["Curtain", "Hub", "Lock", "Remote", "Sensor", "Shades", "TV", "Tracker"]}, {"name": "Other", "tags": ["Paddles", "Soccer Balls", "Bags", "Books", "Games", "Art", "Memorabilia", "Barware", "Glassware", "Dishware", "Appliances", "Tools"]}, {"name": "Brands", "tags": ["Apple", "Fracture", "OXO", "Ryobi", "Popchart", "Nespresso"]}],
      brands: ["Final Touch", "Apple", "Fracture", "OXO", "Ryobi", "Popchart", "Nespresso"],
      rooms: ["Living room", "Kitchen", "Bedroom", "Bathroom", "Office", "Garage", "Closet", "Storage"],
      categories: [
        { name: "Shoes", properties: [{ name: "Size", unit: "" }, { name: "Color", unit: "" }, { name: "Weight", unit: "g" }] },
        { name: "Backpacking gear", properties: [{ name: "Weight", unit: "g" }] },
        { name: "Cables", properties: [{ name: "Length", unit: "cm" }] }
      ]
    },
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
    themeDefaults: { accent: "#b44916", accent2: "#c65d24", success: "#4f745f", warning: "#9b6a24", danger: "#a74747" },
    releases: [{
      version: "0.0.1.12",
      date: "2026-09-09T04:50:12.390Z",
      title: "Your Section Symbols",
      summary: "Supplied SVG symbols identify Stuff I Have, Stuff I Want, Research, and Stuff I Had.",
      features: [],
      improvements: ["Use the supplied box, shopping bag, research document, and archive symbols with theme-aware color", "Rename Previous Stuff to Stuff I Had throughout the interface and Help"],
      fixes: [],
      knownIssues: []
    }, {
      version: "0.0.1.11",
      date: "2026-09-09T04:37:37.384Z",
      title: "Dated Purchases and a Wider Form",
      summary: "Smart Complete recognizes purchase dates and keeps the object name clean.",
      features: [],
      improvements: ["Seller, Brand, and Object share one row in a wider desktop modal", "Date Obtained sits alongside price and value", "More Details starts expanded for new and existing items", "The sample form fits 1366×768 and larger desktop screens without scrolling; small screens and longer property lists remain scrollable"],
      fixes: ["Leading MM/DD/YY, MM/DD/YYYY, and ISO dates fill Date Obtained before price and brand extraction", "Two-digit years use 20xx; invalid calendar dates remain in Notes for review", "Manual date corrections survive continued smart entry"],
      knownIssues: ["Smart Complete recognizes known brands or explicit brand: annotations; unfamiliar text remains in the object", "Reported legacy cloud-copy rejection still awaits the actual cloud file structure"]
    }, {
      version: "0.0.1.10",
      date: "2026-09-09T05:00:00.000Z",
      title: "Smart, Compact Item Entry",
      summary: "Paste a purchase line, review highlighted fields, and save with fewer steps.",
      features: ["Smart Complete highlights object, brand, seller, price, value, and notes", "Searchable zones, rooms, spaces, and multi-select tags from the full wish vocabulary", "Single-click Belongs to and Obtained choices; new items default to Me and Purchased"],
      improvements: ["Compact form with expandable notes, date, and custom properties", "Manual corrections survive further typing", "All 3 zones, 23 rooms, 16 spaces, and 54 grouped tags are pre-populated; custom entries remain supported", "Brand and location details round trip through existing properties in backups and sync"],
      fixes: [],
      knownIssues: ["Smart Complete recognizes known brands or explicit brand: annotations; unfamiliar text remains in the object", "Reported legacy cloud-copy rejection still awaits the actual cloud file structure"]
    }, {
      version: "0.0.1.9",
      date: "2026-09-08T22:30:51.000Z",
      title: "Burnt Orange and USD",
      summary: "Title Case interface labels, burnt orange accents, and USD throughout the inventory.",
      features: [],
      improvements: ["Burnt orange buttons, links, selection, and focus colors in light and dark themes", "Existing devices adopt the new accent while retaining their display preferences", "All values and prices use USD; existing numeric amounts are preserved"],
      fixes: ["Unsupported legacy cloud files now explain which structure needs attention, without replacing local or cloud content"],
      knownIssues: ["Reported legacy cloud-copy rejection is under investigation pending the cloud file structure"]
    }, {
      version: "0.0.1.8",
      date: "2026-09-08T21:57:55.000Z",
      title: "Make Room for Your Stuff",
      summary: "A personal and household inventory, with room totals and a history of the things you used to own.",
      features: ["Add and edit items with ownership, room, tags, acquisition details, current value, and obtaining price", "Category presets for shoes, backpacking gear, and cables, plus custom properties", "Current object counts and known values by owner and room", "Archive items with a gone date, reason, notes, and days owned; return them when needed"],
      improvements: ["Search and filter your inventory", "Inventory and Notes travel together in backups and GitHub Sync", "Older Notes-only cloud files preserve existing inventory", "Unsaved forms and conflicting item edits are protected"],
      fixes: [],
      knownIssues: ["Want and Research are placeholders for later updates", "Update other devices before syncing inventory: older clients cannot read the new cloud format", "Amounts use one inventory currency, USD by default; changing currency does not convert amounts"]
    }, {
      version: "0.0.1.7",
      date: "2026-09-08T17:18:05.000Z",
      title: "Sync to the Dedicated App-data Repository",
      summary: "GitHub Sync now targets themadat/app-data on main at data/my-stuff.json, matching the intended token permissions.",
      features: [],
      improvements: ["Project and support links still point to the My Stuff application repository"],
      fixes: ["Corrected the sync destination from my-stuff to app-data"],
      knownIssues: []
    }, {
      version: "0.0.1.6",
      date: "2026-09-08T17:00:38.000Z",
      title: "Give Data Sync Its Own Settings Section",
      summary: "Connection controls and an expandable preview of the outgoing sync JSON now live together in Data Sync.",
      features: ["Data Sync tab with the supplied braces SVG", "Collapsible, read-only JSON preview generated from the same payload used for GitHub uploads"],
      improvements: ["Data & Connection moved out of general Settings", "Sync setup shortcuts open Data Sync directly", "Expanded JSON updates with Notes changes without including credentials or device preferences"],
      fixes: [],
      knownIssues: []
    }, {
      version: "0.0.1.5",
      date: "2026-09-08T16:55:28.000Z",
      title: "Clarify Cloud Choices and Access Checks",
      summary: "Cloud copy choices are left-aligned with symbols, and token tests distinguish read access from upload permission.",
      features: [],
      improvements: ["Leading cloud symbols for Merge, Upload, and Download choices", "Read-test results explain that uploads require separate write permission", "GitHub access errors are visible in Settings with the configured repository and recovery steps"],
      fixes: ["Read-only connection tests no longer claim the connection fully works", "Known read-only repositories fail the test without replacing stored credentials", "Branch-rule denials retain their explanation instead of appearing as stale-content conflicts"],
      knownIssues: ["Test does not write to GitHub. Repository selection, Contents: Read and write, and branch rules must permit an actual upload."]
    }, {
      version: "0.0.1.4",
      date: "2026-09-08T03:42:06.000Z",
      title: "Add the My Stuff App Icon",
      summary: "Your storage-box artwork now identifies My Stuff across the app and installation surfaces.",
      features: ["Original supplied SVG for the header and favicon in both themes"],
      improvements: ["Matching 192px, 512px, Apple touch, maskable, and light/dark splash assets", "Padded foreground and an opaque background for platform-masked install icons"],
      fixes: ["Replaced the active placeholder application artwork"],
      knownIssues: []
    }, {
      version: "0.0.1.3",
      date: "2026-09-08T03:28:10.000Z",
      title: "Bring Settings and Cloud Sync Up to Date",
      summary: "Adopts app-template’s Settings and cloud-sync updates from 0.0.1.61 through 0.0.1.67.",
      features: ["Sync Now and Restore from Cloud actions with shared SVG cloud status symbols", "Compact linked GitHub target and visible masked saved credentials"],
      improvements: ["Only Notes sync; appearance, search, settings, and save metadata stay local", "Successful connection tests retain credentials on the device or for the tab", "Full-screen mobile Settings with one scrolling surface and a sticky close header"],
      fixes: ["Recovery must succeed before cloud content replaces local Notes", "Legacy whole-state cloud copies migrate without false settings conflicts", "Background status updates no longer overwrite unsaved token or remember-token edits", "Button-style handlers are scoped to controls so unrelated clicks no longer reset checkbox edits"],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token with Contents read and write access. Update other devices before syncing the new content-only format."]
    }, {
      version: "0.0.1.2",
      date: "2026-09-07T14:45:00.000Z",
      title: "Restore the Base Interface Symbols",
      summary: "Every symbol used by the retained shell is self-contained again.",
      features: ["Original SVG artwork for the top bar, search, Notes, Settings, appearance controls, Help, Roadmap, shortcuts, Developer tools, and GitHub Sync"],
      improvements: ["The compact interface-symbol helper has no dependency on removed product data"],
      fixes: ["Replaced temporary outline stand-ins with the original base UI artwork"],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token."]
    }, {
      version: "0.0.1.1",
      date: "2026-09-07T12:00:00.000Z",
      title: "Start the My Stuff Foundation",
      summary: "A clean local-first shell is ready for the first focused feature.",
      features: ["Blank semantic workspace", "Plain-text Notes", "Local backup and optional GitHub Sync"],
      improvements: ["Responsive Settings with appearance, help, roadmap, shortcuts, and developer tools"],
      fixes: [],
      knownIssues: ["GitHub Sync requires a user-provided fine-grained token."]
    }],
    roadmap: [],
    helpTopics: [
      { id: "data-sync", title: "Data Sync", section: "Settings", keywords: "data connection sync json payload preview github braces", html: "<p>Open Settings → Data Sync for local storage status, GitHub connection details, and sync actions. Expand JSON sent to GitHub to inspect the exact outgoing data file generated from this device. It updates when inventory or Notes change, excludes the token and device settings, and does not fetch the current cloud copy. Backup, restore, and reset controls remain in general Settings.</p>" },
      { id: "start", title: "Getting Started", section: "Basics", keywords: "start inventory add item stuff have house me", html: "<p>Start in Stuff I Have and choose Add an Item. Each entry represents one object. Paste a purchase line into Smart Complete to see highlighted fields, or enter the object directly. New items default to Me and Purchased; change either with one click. Leading dates use MM/DD/YY or MM/DD/YYYY (two-digit years mean 20xx); ISO dates also work. Invalid calendar dates remain in Notes for review. Prices in parentheses and bracketed values stay separate from payment amounts. Recognized brands and sellers fill their own fields. Use brand: Acme; or owner: house; for explicit annotations. Unrecognized markers and payment columns go to Notes; manual field edits are preserved as you type. Search for a room, space, and tags. Date Obtained appears beside the price and value. More Details starts expanded with notes and custom properties. The wide desktop form places Seller, Brand, and Object on one row. Everything else can be filled in later. Save Item stores your changes on this device.</p><p>Stuff I Want and Research are reserved for future updates. Stuff I Had keeps the items you have archived.</p>" },
      { id: "inventory-details", title: "Item Details and Categories", section: "Inventory", keywords: "properties tags shoes size weight color backpacking cables length obtained price source gift", html: "<p>Select an item name to edit its details. Record when and how you obtained it, where it came from, what you paid, and its current estimated value. Blank amounts are unknown; 0 means free or no value.</p><p>Search and select tags individually, or type custom tags and press Enter. Zones, rooms, and spaces include the household vocabulary; choosing a space fills its parent room and zone. Brand, Zone, and Space use existing custom-property storage for backup and sync compatibility. Presets suggest size, color, and weight for shoes, weight for backpacking gear, and length for cables. Add custom properties with a name, value, and optional unit. Removing a category never removes an existing property.</p>" },
      { id: "inventory-stats", title: "Rooms, Ownership, and Totals", section: "Inventory", keywords: "stats totals house personal room value count currency", html: "<p>Ownership is separate from location: your belongings and house belongings can share a room. Counts and known-value totals include all current items, even when the list is filtered. Room totals separate House and Me; items without a room appear under Unassigned. Items without a value are counted but excluded from known-value totals.</p><p>All values and prices are in USD. Currency is fixed for this app.</p>" },
      { id: "inventory-archive", title: "Stuff I Had", section: "Inventory", keywords: "archive gone lost broken trashed sold donated duration previous return", html: "<p>Open an item and select Archive to record its gone date, reason, and optional departure notes. It moves to Stuff I Had and stops counting toward current totals. Days owned are calculated from the obtained date to the gone date; unknown obtained dates have unknown duration.</p><p>Archived details remain editable. Return to Stuff I Have clears its departure details and restores it to current totals. There is no permanent item-delete action.</p>" },
      { id: "notes", title: "Notes", section: "Basics", keywords: "notes autosave local", html: "<p>Open Notes from the header or press <kbd>N</kbd>. Plain text saves automatically in this browser.</p>" },
      { id: "appearance", title: "Appearance", section: "Settings", keywords: "theme text size buttons hints", html: "<p>Settings includes system, light, and dark themes, text sizing, button presentation, and contextual hints.</p>" },
      { id: "backup", title: "Backup and Restore", section: "Data", keywords: "backup export import json recovery reset", html: "<p>Export a JSON backup before major changes. Import validates the file and saves a recovery copy before replacement.</p>" },
      { id: "sync", title: "GitHub Sync", section: "Data", keywords: "github sync token cloud conflict restore connection", html: "<p>GitHub Sync is optional and syncs inventory and Notes. Add a fine-grained token with Contents read and write access to the configured repository. Test retains credentials after a read check, but makes no changes on GitHub and cannot verify upload permission. Save stores them and checks the cloud copy. If upload reports Access Required, select the configured repository in the token settings, grant Contents: Read and write, and check repository access, organization approval, and branch rules. GitHub’s error details remain visible in Settings. A masked saved token remains visible in Settings. Turn Remember off to keep it only for this tab.</p><p>Use Sync Now, press <kbd>S</kbd>, or click the floating status to compare copies. First sync and conflicting item or Notes edits require a choice. Restore from Cloud asks for confirmation and requires a local recovery copy before replacing inventory and Notes. Device settings stay local. Update other devices before using the compact cloud format; older whole-state files remain readable.</p>" },
      { id: "offline", title: "Install and Offline Updates", section: "Application", keywords: "install pwa offline update refresh", html: "<p>When served over HTTPS, My Stuff can be installed and keeps its shell available offline. Use Force refresh when an update notice appears.</p>" },
      { id: "privacy", title: "Privacy", section: "Data", keywords: "privacy local token", html: "<p>Inventory and Notes stay in browser storage unless exported or synced to GitHub. Preferences and view settings stay on this device and are included only in full JSON backups, not cloud sync. Tokens are stored separately and excluded from backups, cloud data, and diagnostics.</p>" },
      { id: "shortcuts", title: "Keyboard Shortcuts", section: "Accessibility", keywords: "keyboard shortcuts focus", html: "<p>Press <kbd>/</kbd> for search, <kbd>N</kbd> for Notes, <kbd>,</kbd> for Settings, <kbd>V</kbd> for What’s New, and <kbd>T</kbd> to change theme.</p>" }
    ],
    shortcuts: [
      { group: "Application", key: "/", label: "Focus Search" },
      { group: "Application", key: "N", label: "Open Notes" },
      { group: "Application", key: ",", label: "Open Settings" },
      { group: "Application", key: "V", label: "Open What’s New" },
      { group: "Application", key: "T", label: "Change Theme" },
      { group: "Application", key: "S", label: "Sync Now or Open Sync Settings" },
      { group: "Application", key: "Escape", label: "Close the Active Dialog or Search" }
    ]
  });
})();
