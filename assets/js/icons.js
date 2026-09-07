(function () {
  "use strict";

  window.LocalApp = window.LocalApp || {};

  function symbol(paths, options) {
    const settings = Object.assign({ fill: "none", stroke: "currentColor" }, options || {});
    return '<svg class="sf-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="' + settings.fill + '" stroke="' + settings.stroke + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</g></svg>';
  }

  const SYMBOLS = Object.freeze({
    arrowClockwise: symbol('<path d="M20 11a8 8 0 10-2.3 5.7M20 5v6h-6"/>'),
    buttonBoth: symbol('<rect x="3" y="6" width="7" height="7" rx="1.5"/><path d="M14 16l3-8 3 8M15.2 13h3.6"/>'),
    buttonIcons: symbol('<rect x="7" y="6" width="10" height="10" rx="2"/>'),
    buttonText: symbol('<path d="M7 17l5-12 5 12M9 13h6"/>'),
    check: symbol('<circle cx="12" cy="12" r="9"/><path d="M8 12l2.6 2.6L16.5 9"/>'),
    close: symbol('<path d="M6 6l12 12M18 6L6 18"/>'),
    computer: symbol('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    developer: symbol('<path d="M14.5 6.5l3-3 3 3-3 3M9.5 17.5l-3 3-3-3 3-3M8 16l8-8"/>'),
    forgetConnection: symbol('<path d="M4 8h16v11H4zM7 5h10v3M9 12l6 4M15 12l-6 4"/>'),
    help: symbol('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 114.1 1.7c-1.1 1-1.9 1.4-1.9 3M12 17h.01"/>'),
    hintsOff: symbol('<path d="M9 18h6M10 21h4M8 14a6 6 0 018-8M5 5l14 14"/>'),
    hintsOn: symbol('<path d="M9 18h6M10 21h4M8.5 15a6 6 0 117 0c-.8.7-1.2 1.5-1.3 2h-4.4c-.1-.5-.5-1.3-1.3-2z"/>'),
    info: symbol('<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>'),
    keyboard: symbol('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>'),
    moon: symbol('<path d="M20 15.2A8.5 8.5 0 118.8 4a7 7 0 0011.2 11.2z"/>'),
    notes: symbol('<path d="M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4"/><path d="M15 3v4h3"/>'),
    releaseNotes: symbol('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>'),
    restore: symbol('<path d="M4 10a8 8 0 111.7 7.1M4 4v6h6"/>'),
    roadmap: symbol('<path d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2zM9 3v16M15 5v16"/>'),
    saveConnection: symbol('<path d="M4 8h16v11H4zM7 5h10v3M8 14l2.5 2.5L16 11"/>'),
    search: symbol('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>'),
    sun: symbol('<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>'),
    support: symbol('<circle cx="12" cy="12" r="3"/><path d="M19 13.5l2-1.5-2-1.5-.7-1.7.4-2.5-2.5-.4-1.7-.7L12 3 10.5 5.2l-1.7.7-2.5.4.4 2.5-.7 1.7L3 12l3 1.5.7 1.7-.4 2.5 2.5.4 1.7.7L12 21l1.5-2.2 1.7-.7 2.5-.4-.4-2.5z"/>'),
    sync: symbol('<path d="M20 8a8 8 0 00-14-2M4 4v5h5M4 16a8 8 0 0014 2M20 20v-5h-5"/>'),
    testConnection: symbol('<path d="M4 8h16v11H4zM7 5h10v3M10 12a2 2 0 113.4 1.4c-.8.7-1.4 1-1.4 2M12 17h.01"/>')
  });

  function markup(name) { return SYMBOLS[name] || ""; }

  function set(target, name) {
    const element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;
    element.dataset.symbol = name;
    element.innerHTML = markup(name);
  }

  function mount(root) {
    (root || document).querySelectorAll("[data-symbol]").forEach(function (element) { set(element, element.dataset.symbol); });
  }

  window.LocalApp.icons = Object.freeze({ markup: markup, mount: mount, set: set });
})();
