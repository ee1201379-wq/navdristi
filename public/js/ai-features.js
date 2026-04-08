document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;

  function renderPage() {
    UI.mountHeader("ai-features");

    const analytics = App.getAnalytics();
    UI.renderStatGrid(document.getElementById("aiFeatureStats"), [
      { label: "Voice-ready languages", value: String(App.constants.voiceLanguages.length), helper: "Browser speech input" },
      { label: "Emotion alerts", value: String(analytics.emotionCounts.Distress || 0), helper: "High-distress complaints" },
      { label: "Image review flags", value: String(analytics.imageFlags.reused + analytics.imageFlags.lowConfidence), helper: "Evidence needing review" },
      { label: "Auto-escalations", value: String(analytics.overdueCount), helper: "Crossed SLA threshold" }
    ]);

    const predictions = document.getElementById("aiFeaturePredictions");
    predictions.innerHTML = analytics.predictiveSignals.map(function (item) {
      return [
        '<article class="stack-item">',
        '  <h3>' + UI.escapeHtml(item.title) + "</h3>",
        '  <p>' + UI.escapeHtml("Risk score " + item.score + " / Hot district " + item.ward + " / " + item.count + " related complaints.") + "</p>",
        '  <small>' + UI.escapeHtml(item.recommendation) + "</small>",
        "</article>"
      ].join("");
    }).join("");
  }

  App.subscribe(renderPage);
  renderPage();
});
