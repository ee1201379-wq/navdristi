document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  UI.mountHeader("token-slip");

  const params = new URLSearchParams(window.location.search);
  const complaintId = params.get("id");
  const complaint = complaintId ? App.getComplaintById(complaintId) : null;
  const card = document.getElementById("tokenSlipCard");

  if (!complaint) {
    card.innerHTML = "<strong>Token not found</strong><p>The grievance token is unavailable or inaccessible.</p>";
    return;
  }

  card.innerHTML = [
    '<p class="eyebrow">Official Public Grievance Token</p>',
    '<h1>Nav Dristi Acknowledgment Slip</h1>',
    '<p class="hero-text">This receipt confirms that the complaint has been received into the Chhattisgarh public grievance resolution workflow.</p>',
    '<div class="metric-row">',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.id) + '</strong><span>Complaint number</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.department) + '</strong><span>Department</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.district) + '</strong><span>District</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.escalationWindowHours + "h") + '</strong><span>SLA</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.assignedOfficer) + '</strong><span>Assigned officer</span></div>',
    '</div>',
    '<div class="service-directory-grid">',
    '<div class="glass-subcard">',
    '<strong>Submission record</strong>',
    '<p>' + UI.escapeHtml(complaint.title) + '</p>',
    '<p>' + UI.escapeHtml("Submitted on " + UI.formatDate(complaint.createdAt, true)) + '</p>',
    '</div>',
    '<div class="glass-subcard qr-slip-card">',
    '<strong>QR-style verification block</strong>',
    '<div class="qr-mock">ND|' + UI.escapeHtml(complaint.id) + '|CG|' + UI.escapeHtml(complaint.district) + '</div>',
    '<p>' + UI.escapeHtml("Verification string: " + complaint.id + "-" + complaint.department.replace(/\s+/g, "").toUpperCase()) + '</p>',
    '</div>',
    '</div>',
    '<div class="hero-actions">',
    '<a class="button button-primary" href="./complaint.html?id=' + encodeURIComponent(complaint.id) + '">Open Resolution Center</a>',
    '<button class="button button-secondary" type="button" onclick="window.print()">Print Slip</button>',
    '</div>'
  ].join("");
});
