document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;

  function render() {
    UI.mountHeader("home");

    const analytics = App.getAnalytics();
    const recentFeed = App.getRecentFeed(4);
    const serviceDirectory = App.getPublicServiceDirectory();

    UI.renderStatGrid(document.getElementById("homeHeroStats"), [
      { label: "Total complaints", value: String(analytics.totalComplaints), helper: "Working demo cases" },
      { label: "Community support", value: String(analytics.totalCommunitySupport), helper: "Citizen-backed issues" },
      { label: "Critical open", value: String(analytics.criticalOpen), helper: "High urgency cases" },
      { label: "Auto-escalations", value: String(analytics.overdueCount), helper: "Cases beyond SLA" }
    ]);

    document.getElementById("homeEscalationCount").textContent = String(analytics.overdueCount);
    document.getElementById("homeDuplicateCount").textContent = String(analytics.duplicateClusters);
    document.getElementById("homeResponseTime").textContent = analytics.averageResolutionHours + "h";

    document.getElementById("homeLiveProof").innerHTML = [
      { label: "Active districts", value: String(analytics.districtSafetyOverview.filter(function (item) { return item.count > 0; }).length) },
      { label: "Departments mapped", value: String(analytics.departmentPerformance.length) },
      { label: "Predictive alerts", value: String(analytics.predictiveSignals.length) }
    ].map(function (item) {
      return '<div><span>' + UI.escapeHtml(item.label) + '</span><strong>' + UI.escapeHtml(item.value) + "</strong></div>";
    }).join("");

    const feed = document.getElementById("homeComplaintFeed");
    feed.innerHTML = recentFeed.map(function (complaint) {
      return UI.complaintCard(complaint, { linkLabel: "Open Case" });
    }).join("");

    document.getElementById("homeDocumentServices").innerHTML = serviceDirectory.documentServices.map(function (item) {
      return '<article class="stack-item compact-item"><h3>' + UI.escapeHtml(item.title) + '</h3><p>' + UI.escapeHtml(item.service) + '</p><small>' + UI.escapeHtml(item.area) + '</small></article>';
    }).join("");

    document.getElementById("homeTopDepartments").innerHTML = serviceDirectory.topDepartments.map(function (item) {
      return '<article class="stack-item compact-item"><h3>' + UI.escapeHtml(item.title) + '</h3><p>' + UI.escapeHtml(item.summary) + "</p></article>";
    }).join("");
  }

  function loginAs(role) {
    const result = App.useDemoAccount(role);
    if (!result.ok) {
      UI.showToast("Unable to log in", result.message, "error");
      return;
    }
    UI.showToast("Demo ready", "Signed in as " + (role === "admin" ? "authority admin." : "citizen user."), "success");
    setTimeout(function () {
      window.location.href = role === "admin" ? "./admin-dashboard.html" : "./citizen-dashboard.html";
    }, 280);
  }

  document.getElementById("homeCitizenDemo").addEventListener("click", function () {
    loginAs("citizen");
  });

  document.getElementById("homeAdminDemo").addEventListener("click", function () {
    loginAs("admin");
  });

  App.subscribe(function () {
    render();
  });

  render();
});
