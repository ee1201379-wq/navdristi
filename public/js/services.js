document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  UI.mountHeader("services");
  const districtDirectory = App.getDistrictDirectory();

  const services = [
    { title: "Water Bill / Connection", category: "utilities", audience: "citizens", provider: "Public Health Engineering Department", summary: "Apply for water bill support and new connection requests.", action: "./citizen-dashboard.html", icon: "WB" },
    { title: "Electricity Service Complaint", category: "utilities", audience: "citizens", provider: "Electricity Cell", summary: "Track outages, meter issues, and service faults.", action: "./citizen-dashboard.html", icon: "EL" },
    { title: "Birth / Domicile / Income Certificates", category: "documents", audience: "citizens", provider: "District e-Governance Services", summary: "Certificate support and district-level document facilitation.", action: "./services.html", icon: "DC" },
    { title: "Caste Certificate Service", category: "documents", audience: "citizens", provider: "District e-Governance Services", summary: "Apply for caste certificate guidance, verification, and print support.", action: "./services.html", icon: "CC" },
    { title: "Residence Certificate PDF Pack", category: "documents", audience: "citizens", provider: "Revenue Department", summary: "Portal-style PDF pack for residence proof and district submission guidance.", action: "./services.html", icon: "PD" },
    { title: "Ration Card and Food Security Support", category: "documents", audience: "families", provider: "Food and Civil Supplies Department", summary: "Ration card help, inclusion, and beneficiary service support.", action: "./services.html", icon: "RC" },
    { title: "Pension and Senior Welfare Support", category: "support", audience: "seniors", provider: "Social Welfare Department", summary: "Old-age pension, welfare assistance, and social support services.", action: "./elder-support.html", icon: "SW" },
    { title: "Widow and Disability Pension Support", category: "support", audience: "families", provider: "Social Welfare Department", summary: "Pension eligibility guidance, document checklist, and district welfare routing.", action: "./services.html", icon: "PN" },
    { title: "PMAY and Housing Support", category: "support", audience: "households", provider: "Urban Administration and Housing", summary: "Housing support, PMAY-linked guidance, and urban beneficiary help.", action: "./services.html", icon: "HM" },
    { title: "Ayushman and Health Scheme Access", category: "support", audience: "citizens", provider: "Health Department", summary: "Health scheme support, hospital assistance, and emergency guidance.", action: "./services.html", icon: "HL" },
    { title: "Scholarship and Student Support", category: "documents", audience: "students", provider: "School Education and Higher Education", summary: "Scholarship queries, educational assistance, and student benefit guidance.", action: "./services.html", icon: "ED" },
    { title: "Land Records and Revenue Services", category: "documents", audience: "landowners", provider: "Revenue Department", summary: "Land records, mutation help, and district revenue service access.", action: "./services.html", icon: "LR" },
    { title: "Khasra / B1 / Revenue Extract", category: "documents", audience: "landowners", provider: "Revenue Department", summary: "Quick access guidance for land extract, khasra copy, and mutation assistance.", action: "./services.html", icon: "RE" },
    { title: "Municipal Tax and Property Service", category: "utilities", audience: "property owners", provider: "Urban Local Bodies", summary: "Property tax help, municipal billing, and civic account services.", action: "./services.html", icon: "TX" },
    { title: "GST / Trade License Help", category: "documents", audience: "business owners", provider: "Commercial Tax and Urban Bodies", summary: "Business registration, tax, and trade-license guidance through the portal.", action: "./services.html", icon: "GT" },
    { title: "Women Safety and Harassment Support", category: "safety", audience: "women", provider: "Chhattisgarh State Commission for Women", summary: "Fast-track reporting, escalation, and direct helpline access.", action: "./women-support.html", icon: "WS" },
    { title: "Missing Child and Child Rescue", category: "safety", audience: "families", provider: "Child Helpline 1098", summary: "Raise missing child alerts, rescue requests, and urgent child protection complaints.", action: "./child-rescue.html", icon: "CH" },
    { title: "Child Helpline Access", category: "support", audience: "families", provider: "Child Helpline 1098", summary: "Immediate support for child protection and emergency outreach.", action: "tel:1098", icon: "10" },
    { title: "Elder Emergency and Welfare Check", category: "emergency", audience: "seniors", provider: "Senior Emergency Help Desk", summary: "Emergency support for elderly citizens living alone.", action: "./elder-support.html", icon: "EL" },
    { title: "Women and Child Emergency PDF Pack", category: "safety", audience: "families", provider: "Women and Child Development", summary: "Download-style portal guidance for protection, helplines, and reporting steps.", action: "./women-support.html", icon: "WC" },
    { title: "Road and Public Works Complaint", category: "utilities", audience: "citizens", provider: "Roads & Works", summary: "Raise pothole, road damage, and public works complaints.", action: "./citizen-dashboard.html", icon: "RW" },
    { title: "State Complaint Tracking", category: "support", audience: "citizens", provider: "Nav Dristi Command Center", summary: "Track status, assigned officer, and escalation progress.", action: "./complaint.html", icon: "TR" },
    { title: "Ambulance Emergency 108", category: "emergency", audience: "all", provider: "Emergency Ambulance", summary: "Immediate emergency medical call access.", action: "tel:108", icon: "08" }
  ];

  const eligibilityChecklist = [
    "Keep one ID proof, one address proof, and mobile number ready.",
    "For pension and welfare, keep age, bank, and beneficiary documents ready.",
    "For land records, keep district, tehsil, village, and plot details ready.",
    "For safety complaints, keep location, time, and available evidence ready."
  ];

  const faqItems = [
    { q: "How do I raise a complaint?", a: "Log in as a citizen, choose the complaint template or fill the guided form, then submit with location and evidence." },
    { q: "How do I track my issue?", a: "Open the complaint detail page to view the officer, SLA countdown, escalation ladder, and proof gallery." },
    { q: "What if the issue is urgent?", a: "Use emergency mode or the women and elder sections for fast-track safety handling." },
    { q: "Can I print proof?", a: "Yes. The portal provides printable service receipts and official complaint documents." }
  ];

  const guidanceSteps = [
    "Search or choose the service or complaint flow.",
    "Fill the guided intake with district, ward, and issue details.",
    "Review AI routing, priority, and department suggestion.",
    "Track officer action, escalation, and closure proof.",
    "Print receipt or official summary if needed."
  ];

  const searchInput = document.getElementById("serviceSearch");
  const categoryFilter = document.getElementById("serviceCategoryFilter");
  const grid = document.getElementById("servicePortalGrid");

  function render() {
    const analytics = App.getAnalytics();
    const complaints = App.getComplaints({ includeAll: true });
    const search = String(searchInput.value || "").toLowerCase();
    const category = categoryFilter.value;
    const filtered = services.filter(function (item) {
      const matchesCategory = category === "all" || item.category === category;
      const haystack = [item.title, item.provider, item.summary, item.audience].join(" ").toLowerCase();
      return matchesCategory && (!search || haystack.indexOf(search) !== -1);
    });

    grid.innerHTML = filtered.map(function (item) {
      const receiptHref = "./service-receipt.html?title=" + encodeURIComponent(item.title) + "&provider=" + encodeURIComponent(item.provider) + "&category=" + encodeURIComponent(item.category);
      return [
        '<article class="glass-card service-card">',
        '  <span class="icon-badge">' + UI.escapeHtml(item.icon || item.category.slice(0, 2).toUpperCase()) + "</span>",
        '  <p class="eyebrow">' + UI.escapeHtml(item.category) + '</p>',
        '  <h3>' + UI.escapeHtml(item.title) + '</h3>',
        '  <p>' + UI.escapeHtml(item.summary) + '</p>',
        '  <small class="timeline-meta">' + UI.escapeHtml(item.provider + " / " + item.audience) + '</small>',
        '  <div class="hero-actions"><a class="button button-primary" href="' + UI.escapeHtml(item.action) + '">Open Service</a><a class="button button-ghost" href="' + UI.escapeHtml(receiptHref) + '">Print Receipt</a></div>',
        '</article>'
      ].join("");
    }).join("");

    const resolved = complaints.filter(function (item) {
      return item.status === "resolved";
    }).slice(0, 3);
    document.getElementById("resolvedCasesArchive").innerHTML = [
      "<strong>Resolved cases archive</strong>",
      resolved.map(function (item) {
        return "<p>" + UI.escapeHtml(item.id + " / " + item.title + " / " + item.district) + "</p>";
      }).join("")
    ].join("");

    document.getElementById("transparencyWall").innerHTML = [
      "<strong>Public transparency wall</strong>",
      "<p>" + UI.escapeHtml("Total complaints: " + analytics.totalComplaints + " / Resolution rate: " + analytics.resolutionRate + "% / Auto-escalations: " + analytics.overdueCount) + "</p>",
      "<p>" + UI.escapeHtml("Community support: " + analytics.totalCommunitySupport + " / Duplicate groups: " + analytics.duplicateClusters) + "</p>"
    ].join("");

    const topSupport = complaints.slice().sort(function (a, b) {
      return (b.supportCount || 0) - (a.supportCount || 0);
    })[0];
    document.getElementById("communityTrustCard").innerHTML = [
      "<strong>Community support rank</strong>",
      "<p>" + UI.escapeHtml(topSupport ? topSupport.title : "No supported complaint yet") + "</p>",
      "<p>" + UI.escapeHtml(topSupport ? String(topSupport.supportCount) + " citizens supported this issue." : "Support rankings will appear here.") + "</p>"
    ].join("");

    document.getElementById("departmentResponseScores").innerHTML = analytics.departmentPerformance.map(function (item) {
      const score = Math.max(35, 100 - (item.backlog * 6) - (item.atRisk * 8));
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.department) + '</h3>',
        '<p>' + UI.escapeHtml("Public response score: " + score + " / 100") + '</p>',
        '<small>' + UI.escapeHtml("Backlog: " + item.backlog + " / At risk: " + item.atRisk + " / Resolved: " + item.resolved) + '</small>',
        '</article>'
      ].join("");
    }).join("");

    document.getElementById("printableServiceDesk").innerHTML = [
      { title: "Certificate acknowledgment", href: "./service-receipt.html?title=Certificate%20Acknowledgment&provider=District%20e-Governance%20Services&category=documents" },
      { title: "Pension assistance receipt", href: "./service-receipt.html?title=Pension%20Assistance&provider=Social%20Welfare%20Department&category=support" },
      { title: "Land record request slip", href: "./service-receipt.html?title=Land%20Record%20Request&provider=Revenue%20Department&category=documents" },
      { title: "Tax service print receipt", href: "./service-receipt.html?title=Municipal%20Tax%20Service&provider=Urban%20Local%20Bodies&category=utilities" },
      { title: "Mock caste certificate PDF", href: "./service-receipt.html?title=Caste%20Certificate%20PDF&provider=District%20e-Governance%20Services&category=documents" },
      { title: "Mock income certificate PDF", href: "./service-receipt.html?title=Income%20Certificate%20PDF&provider=District%20e-Governance%20Services&category=documents" }
    ].map(function (item) {
      return '<article class="glass-subcard"><strong>' + UI.escapeHtml(item.title) + '</strong><div class="hero-actions"><a class="button button-secondary" href="' + UI.escapeHtml(item.href) + '">Open Printable</a></div></article>';
    }).join("");

    document.getElementById("mostUsedServicesWidget").innerHTML = services.slice(0, 5).map(function (item) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.title) + '</h3><p>' + UI.escapeHtml(item.provider) + '</p></article>';
    }).join("");

    document.getElementById("serviceEligibilityChecklist").innerHTML = eligibilityChecklist.map(function (item) {
      return '<article class="stack-item"><p>' + UI.escapeHtml(item) + '</p></article>';
    }).join("");

    document.getElementById("districtServiceDirectory").innerHTML = districtDirectory.slice(0, 8).map(function (district) {
      return [
        '<article class="glass-subcard">',
        '<strong>' + UI.escapeHtml(district.name) + '</strong>',
        '<p>' + UI.escapeHtml("Division: " + district.division + " / HQ: " + district.headquarters) + '</p>',
        '<p>' + UI.escapeHtml("Major roads: " + (district.roads || []).slice(0, 2).join(", ")) + '</p>',
        '<small>' + UI.escapeHtml("Suggested services: certificates, complaint routing, local officer mapping") + '</small>',
        '</article>'
      ].join("");
    }).join("");

    document.getElementById("faqBoard").innerHTML = faqItems.map(function (item) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.q) + '</h3><p>' + UI.escapeHtml(item.a) + '</p></article>';
    }).join("");

    document.getElementById("stepGuidanceBoard").innerHTML = guidanceSteps.map(function (item, index) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml("Step " + (index + 1)) + '</h3><p>' + UI.escapeHtml(item) + '</p></article>';
    }).join("");

    document.getElementById("stateDashboardSummary").innerHTML = [
      { label: "Total complaints", value: analytics.totalComplaints },
      { label: "Resolution rate", value: analytics.resolutionRate + "%" },
      { label: "Critical open", value: analytics.criticalOpen },
      { label: "Community support", value: analytics.totalCommunitySupport }
    ].map(function (item) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(String(item.value)) + '</h3><p>' + UI.escapeHtml(item.label) + '</p></article>';
    }).join("");

    document.getElementById("districtSpotlightBoard").innerHTML = analytics.districtSafetyOverview.slice(0, 6).map(function (item) {
      return '<article class="glass-subcard"><strong>' + UI.escapeHtml(item.district) + '</strong><p>' + UI.escapeHtml(item.count + " complaints / " + item.highPriority + " high priority") + '</p><small>' + UI.escapeHtml(item.safetyLabel || "Watch") + '</small></article>';
    }).join("");

    document.getElementById("successStoriesBoard").innerHTML = resolved.slice(0, 3).map(function (item) {
      return '<article class="glass-subcard"><strong>' + UI.escapeHtml(item.title) + '</strong><p>' + UI.escapeHtml(item.district + " / resolved by " + item.department) + '</p><small>' + UI.escapeHtml("Citizen rating: " + (item.citizenFeedback ? item.citizenFeedback.rating + "/5" : "Awaiting rating")) + '</small></article>';
    }).join("");

    document.getElementById("onboardingCards").innerHTML = [
      { title: "1. Login and choose role", body: "Enter as citizen, women, elder, or admin based on the workflow you want to show." },
      { title: "2. Open service or complaint", body: "Start with most-used services or jump into guided complaint submission." },
      { title: "3. Show tracking and proof", body: "Explain officer assignment, SLA, escalation, and printable records." },
      { title: "4. Finish with judge mode", body: "Use the guided demo route to summarize the portal impact." }
    ].map(function (item) {
      return '<article class="glass-subcard"><strong>' + UI.escapeHtml(item.title) + '</strong><p>' + UI.escapeHtml(item.body) + '</p></article>';
    }).join("");
  }

  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);
  render();
});
