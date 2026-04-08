document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  UI.mountHeader("judge-mode");

  const analytics = App.getAnalytics();
  const complaints = App.getComplaints({ includeAll: true });
  const womenCase = complaints.find(function (item) { return item.issueDesk === "women"; }) || complaints[0];
  const elderCase = complaints.find(function (item) { return item.issueDesk === "elder"; }) || complaints[1];
  const childCase = complaints.find(function (item) { return item.issueDesk === "child"; }) || complaints[2];

  UI.renderStatGrid(document.getElementById("judgeModeStats"), [
    { label: "Portal services", value: "18+", helper: "Public services and support routes" },
    { label: "Live complaints", value: String(analytics.totalComplaints), helper: "Seeded for tomorrow's demo" },
    { label: "Women / elder / child", value: "3 desks", helper: "Fast-track safety and emergency" },
    { label: "Printable outputs", value: "6 docs", helper: "Receipt, escalation, closure, and field summary" }
  ]);

  const routeSteps = [
    { title: "Portal services", summary: "Show national-portal style facilities, search, announcements, and department tiles.", href: "./services.html", icon: "01" },
    { title: "Women safety", summary: "Open the hero safety module with panic path, helplines, and fast-track flow.", href: "./women-support.html", icon: "02" },
    { title: "Complaint submission", summary: "Use the guided intake with district, ward, road, evidence, and AI proof.", href: "./citizen-dashboard.html?desk=women&supportMode=1", icon: "03" },
    { title: "Token slip", summary: "Open the official grievance token and acknowledgment document package.", href: "./token.html?id=" + encodeURIComponent(womenCase ? womenCase.id : ""), icon: "04" },
    { title: "Resolution center", summary: "Show SLA countdown, officer passport, escalation ladder, and citizen feedback loop.", href: "./complaint.html?id=" + encodeURIComponent(womenCase ? womenCase.id : ""), icon: "05" },
    { title: "Admin workflow", summary: "Demonstrate department inbox, urgent queue, assignments, and operational actions.", href: "./admin-dashboard.html", icon: "06" },
    { title: "District intelligence", summary: "Finish with the Chhattisgarh map, emergency board, and hotspot visibility.", href: "./safety-map.html", icon: "07" }
  ];

  const autoplayFrame = document.getElementById("judgeAutoplayFrame");
  const autoplayLabel = document.getElementById("judgeAutoplayLabel");
  const autoplaySummary = document.getElementById("judgeAutoplaySummary");
  const autoplayStart = document.getElementById("judgeAutoplayStart");
  const autoplayNext = document.getElementById("judgeAutoplayNext");
  const autoplayStop = document.getElementById("judgeAutoplayStop");
  let autoplayIndex = 0;
  let autoplayTimer = null;

  function showAutoplayStep(index) {
    const item = routeSteps[index];
    if (!item) {
      return;
    }
    autoplayIndex = index;
    autoplayLabel.textContent = item.title;
    autoplaySummary.textContent = item.summary;
    autoplayFrame.src = item.href;
    document.querySelectorAll(".judge-route-card").forEach(function (card, cardIndex) {
      card.classList.toggle("is-active", cardIndex === index);
    });
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    showAutoplayStep(0);
    autoplayTimer = setInterval(function () {
      const nextIndex = autoplayIndex + 1;
      if (nextIndex >= routeSteps.length) {
        stopAutoplay();
        return;
      }
      showAutoplayStep(nextIndex);
    }, 5000);
  }

  document.getElementById("judgeRouteGrid").innerHTML = routeSteps.map(function (item) {
    return [
      '<article class="glass-subcard judge-route-card">',
      '<span class="icon-badge">' + UI.escapeHtml(item.icon) + '</span>',
      '<strong>' + UI.escapeHtml(item.title) + '</strong>',
      '<p>' + UI.escapeHtml(item.summary) + '</p>',
      '<a class="button button-secondary" href="' + UI.escapeHtml(item.href) + '">Open</a>',
      '</article>'
    ].join("");
  }).join("");

  document.getElementById("judgeDifferenceList").innerHTML = [
    "One portal combines services, grievance, safety, and emergency support.",
    "Women, elder, and child flows are visible as dedicated public-interest modules.",
    "Users can see officer details, escalation logic, and official documents after filing.",
    "District intelligence is grounded in Chhattisgarh districts, roads, and service pressure."
  ].map(function (item) {
    return '<article class="stack-item"><p>' + UI.escapeHtml(item) + "</p></article>";
  }).join("");

  const cases = [womenCase, elderCase, childCase].filter(Boolean);
  document.getElementById("judgeCaseGrid").innerHTML = cases.map(function (item) {
    return [
      '<article class="glass-subcard">',
      '<strong>' + UI.escapeHtml(item.title) + '</strong>',
      '<p>' + UI.escapeHtml(item.district + " / " + item.department + " / " + item.priorityLabel) + '</p>',
      '<div class="meta-row">',
      UI.createBadge(item.supportDeskTitle || "General civic desk", "status"),
      UI.createBadge(item.status === "in_progress" ? "In Progress" : App.prettifyStatus(item.status), "priority"),
      '</div>',
      '<div class="hero-actions"><a class="button button-primary" href="./complaint.html?id=' + encodeURIComponent(item.id) + '">Open Case</a></div>',
      '</article>'
    ].join("");
  }).join("");

  document.getElementById("judgeDocumentList").innerHTML = [
    { label: "Official token slip", href: "./token.html?id=" + encodeURIComponent(womenCase ? womenCase.id : "") },
    { label: "Acknowledgment certificate", href: "./acknowledgment-certificate.html?id=" + encodeURIComponent(womenCase ? womenCase.id : "") },
    { label: "Resolution summary", href: "./resolution-summary.html?id=" + encodeURIComponent(womenCase ? womenCase.id : "") },
    { label: "Officer field summary", href: "./officer-field-summary.html?id=" + encodeURIComponent(elderCase ? elderCase.id : "") },
    { label: "Escalation note", href: "./escalation-note.html?id=" + encodeURIComponent(childCase ? childCase.id : "") },
    { label: "Closure letter", href: "./closure-letter.html?id=" + encodeURIComponent(complaints.find(function (item) { return item.status === "resolved"; }) ? complaints.find(function (item) { return item.status === "resolved"; }).id : "") }
  ].map(function (item) {
    return '<article class="stack-item"><h3>' + UI.escapeHtml(item.label) + '</h3><a class="button button-secondary" href="' + UI.escapeHtml(item.href) + '">Open Document</a></article>';
  }).join("");

  autoplayStart.addEventListener("click", startAutoplay);
  autoplayNext.addEventListener("click", function () {
    stopAutoplay();
    showAutoplayStep(Math.min(routeSteps.length - 1, autoplayIndex + 1));
  });
  autoplayStop.addEventListener("click", stopAutoplay);
  showAutoplayStep(0);
});
