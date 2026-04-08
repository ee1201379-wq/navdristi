document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  UI.mountHeader("resolution-summary");

  const params = new URLSearchParams(window.location.search);
  const complaintId = params.get("id");
  const complaint = complaintId ? App.getComplaintById(complaintId) : null;
  const card = document.getElementById("resolutionSummaryCard");

  if (!complaint) {
    card.innerHTML = "<strong>Resolution summary unavailable</strong><p>No complaint data found for this summary.</p>";
    return;
  }

  card.innerHTML = [
    '<p class="eyebrow">Citizen Resolution Summary</p>',
    '<h1>Nav Dristi Closure Note</h1>',
    '<p class="hero-text">This document summarizes complaint handling, assigned officer, status path, and current closure position.</p>',
    '<div class="metric-row">',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.id) + '</strong><span>Complaint number</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.status === "in_progress" ? "In Progress" : App.prettifyStatus(complaint.status)) + '</strong><span>Status</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.department) + '</strong><span>Department</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.assignedOfficer) + '</strong><span>Officer</span></div>',
    '</div>',
    '<div class="glass-subcard"><strong>Summary</strong><p>' + UI.escapeHtml(complaint.summary) + '</p></div>',
    '<div class="glass-subcard"><strong>Closure / action note</strong><p>' + UI.escapeHtml(complaint.timeline.length ? complaint.timeline[complaint.timeline.length - 1].note : "No latest note available.") + '</p></div>',
    '<div class="hero-actions"><button class="button button-primary" type="button" onclick="window.print()">Print Summary</button></div>'
  ].join("");
});
