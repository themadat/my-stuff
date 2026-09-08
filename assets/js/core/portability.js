(function () {
  "use strict";

  const App = window.LocalApp;
  const config = App.config;
  const u = App.utils;
  const model = App.stateModel;
  const storage = App.storage;
  let pendingImport = null;

  function summaryFor(state, migrations) {
    return {
      noteCharacters: state.notes.text.length,
      schemaVersion: state.schemaVersion,
      appVersion: state.meta.appVersion,
      updatedAt: state.meta.updatedAt,
      migrations: migrations || []
    };
  }

  function exportJson() {
    storage.saveNow();
    const json = JSON.stringify(model.exportEnvelope(storage.getState()), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = config.identity.slug + "-backup-" + new Date().toISOString().slice(0, 10) + "-v" + config.identity.version + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    App.components.toast("A complete JSON backup was created.", { title: "Backup exported", kind: "success" });
  }

  async function previewFile(file, trigger) {
    try {
      if (!file) throw new Error("No file was selected.");
      if (file.size > config.controls.maxImportBytes) throw new Error("That backup exceeds the " + u.formatBytes(config.controls.maxImportBytes) + " limit.");
      App.components.setLoading(true, "Checking backup…");
      let parsed;
      try { parsed = JSON.parse(await file.text()); }
      catch (error) { throw new Error("The selected file is not valid JSON."); }
      pendingImport = model.prepare(parsed);
      const summary = summaryFor(pendingImport.state, pendingImport.migrations);
      const current = summaryFor(storage.getState(), []);
      document.querySelector("[data-import-file]").textContent = file.name || "Selected backup";
      document.querySelector("[data-import-notes]").textContent = summary.noteCharacters + " characters (current: " + current.noteCharacters + ")";
      document.querySelector("[data-import-version]").textContent = "State v" + summary.schemaVersion + " · app v" + (summary.appVersion || "unknown");
      document.querySelector("[data-import-updated]").textContent = u.dateLabel(summary.updatedAt);
      App.components.openDialog("#importPreviewDialog", { trigger: trigger, focus: "[data-import-confirm]" });
    } catch (error) {
      pendingImport = null;
      App.components.message("Import unavailable", error.message || "That backup could not be used.", { trigger: trigger });
    } finally {
      App.components.setLoading(false);
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    const accepted = await App.components.confirm({
      title: "Replace current data?",
      message: pendingImport.contentOnly ? "The cloud file will replace Notes only; device settings stay local. A recovery copy will be saved first." : "The validated backup will replace notes and preferences. A recoverable copy of the current data will be saved first.",
      confirmLabel: "Replace data",
      cancelLabel: "Keep current data",
      danger: true,
      trigger: document.querySelector("[data-import-confirm]")
    });
    if (!accepted) return;
    if (!storage.saveRecovery("Before importing a backup")) {
      App.components.message("Import unavailable", "A recovery copy could not be saved. Export a backup before continuing.");
      return;
    }
    const next = pendingImport.contentOnly ? model.applySync(storage.getState(), pendingImport.state) : pendingImport.state;
    storage.replace(next, { saveRecovery: false, reason: "import" });
    pendingImport = null;
    App.components.closeDialog("#importPreviewDialog", "imported");
    App.components.toast("The selected data was restored.", { title: "Backup restored", kind: "success" });
  }

  function init() {
    const input = document.querySelector("#importFileInput");
    input?.addEventListener("change", function (event) {
      previewFile(event.target.files && event.target.files[0], document.activeElement);
      event.target.value = "";
    });
    document.querySelector("[data-import-confirm]")?.addEventListener("click", confirmImport);
    document.querySelector("#importPreviewDialog")?.addEventListener("close", function () {
      if (this.returnValue !== "imported") pendingImport = null;
    });
  }

  App.portability = { init: init, exportJson: exportJson, previewFile: previewFile, summaryFor: summaryFor };
})();
