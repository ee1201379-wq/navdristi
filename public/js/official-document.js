document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const documentType = document.body.getAttribute("data-document-type");
  const activePage = document.body.getAttribute("data-page");
  UI.mountHeader(activePage);

  const params = new URLSearchParams(window.location.search);
  const complaintId = params.get("id");
  const complaint = complaintId ? App.getComplaintById(complaintId) : null;
  const card = document.getElementById("officialDocumentCard");

  if (!complaint) {
    card.innerHTML = "<strong>Document unavailable</strong><p>No complaint data was found for this official document.</p>";
    return;
  }

  const lastTimeline = complaint.timeline && complaint.timeline.length ? complaint.timeline[complaint.timeline.length - 1] : null;
  const officer = App.getOfficerProfile(complaint.assignedOfficer, complaint.department);
  const docTemplates = {
    acknowledgment: {
      eyebrow: "Citizen Acknowledgment Certificate",
      title: "Nav Dristi Receipt Certificate",
      intro: "This certificate confirms that the complaint has been registered in the Chhattisgarh public grievance workflow and routed for service action.",
      bodyTitle: "Submission certification",
      body: "The complaint was accepted on " + UI.formatDate(complaint.createdAt, true) + " and routed to " + complaint.department + " under " + complaint.assignedOfficer + "."
    },
    "field-summary": {
      eyebrow: "Officer Field Summary",
      title: "Nav Dristi Field Action Summary",
      intro: "This summary records the officer-side operational trail for the selected complaint.",
      bodyTitle: "Field note summary",
      body: (lastTimeline ? lastTimeline.note : "No field note available yet.") + " Officer contact: " + (officer && officer.phone ? officer.phone : "Not listed") + "."
    },
    "closure-letter": {
      eyebrow: "Citizen Closure Letter",
      title: "Nav Dristi Closure Communication",
      intro: "This letter communicates the current closure position and the final action note shared with the citizen.",
      bodyTitle: "Closure note",
      body: complaint.status === "resolved"
        ? (lastTimeline ? lastTimeline.note : "The complaint was resolved.")
        : "This complaint is not fully resolved yet. Current status is " + App.prettifyStatus(complaint.status) + "."
    },
    "escalation-note": {
      eyebrow: "Escalation Note",
      title: "Nav Dristi Escalation Memo",
      intro: "This note documents why the complaint crossed into escalation review and which authority layer now has visibility.",
      bodyTitle: "Escalation reason",
      body: complaint.status === "escalated"
        ? "Escalated because of severity, desk SLA, or open-time risk. Superior contact: " + (complaint.superiorContact ? complaint.superiorContact.name + " / " + complaint.superiorContact.email : "Not available") + "."
        : "This complaint is currently not escalated. Latest operational state is " + App.prettifyStatus(complaint.status) + "."
    }
  };

  const template = docTemplates[documentType] || docTemplates.acknowledgment;
  card.innerHTML = [
    '<p class="eyebrow">' + UI.escapeHtml(template.eyebrow) + '</p>',
    '<h1>' + UI.escapeHtml(template.title) + '</h1>',
    '<p class="hero-text">' + UI.escapeHtml(template.intro) + '</p>',
    '<div class="metric-row">',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.id) + '</strong><span>Complaint number</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.district) + '</strong><span>District</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.department) + '</strong><span>Department</span></div>',
    '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.assignedOfficer) + '</strong><span>Officer</span></div>',
    '</div>',
    '<div class="glass-subcard"><strong>' + UI.escapeHtml(template.bodyTitle) + '</strong><p>' + UI.escapeHtml(template.body) + '</p></div>',
    '<div class="glass-subcard"><strong>Complaint context</strong><p>' + UI.escapeHtml(complaint.title + " / " + complaint.summary) + '</p></div>',
    '<div class="hero-actions"><a class="button button-secondary" href="./complaint.html?id=' + encodeURIComponent(complaint.id) + '">Open Resolution Center</a><button class="button button-primary" type="button" onclick="window.print()">Print Document</button></div>'
  ].join("");
});
