document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const AI = window.NavDristiAI;
  const form = document.getElementById("settingsForm");
  const summaryCard = document.getElementById("settingsSummaryCard");

  UI.mountHeader("settings");

  function renderSummary() {
    const settings = AI.getSettings();
    summaryCard.innerHTML = [
      "<strong>Current AI status</strong>",
      "<p>" + UI.escapeHtml(settings.enabled && settings.apiKey ? "Real AI is enabled and ready." : "Real AI is disabled or missing an API key.") + "</p>",
      "<p>" + UI.escapeHtml("Response model: " + settings.responseModel + " / Voice model: " + settings.voiceModel + " / Voice: " + settings.voiceName) + "</p>"
    ].join("");
  }

  function populateForm() {
    const settings = AI.getSettings();
    document.getElementById("apiProvider").value = settings.provider;
    document.getElementById("apiKey").value = settings.apiKey;
    document.getElementById("responseModel").value = settings.responseModel;
    document.getElementById("voiceModel").value = settings.voiceModel;
    document.getElementById("voiceName").value = settings.voiceName;
    document.getElementById("aiEnabled").value = String(!!settings.enabled);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    AI.saveSettings({
      provider: formData.get("provider"),
      apiKey: formData.get("apiKey"),
      responseModel: formData.get("responseModel"),
      voiceModel: formData.get("voiceModel"),
      voiceName: formData.get("voiceName"),
      enabled: formData.get("enabled") === "true"
    });
    renderSummary();
    UI.showToast("Settings saved", "Real AI settings were updated.", "success");
  });

  populateForm();
  renderSummary();
});
