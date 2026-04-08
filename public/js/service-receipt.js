document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  UI.mountHeader("service-receipt");

  const params = new URLSearchParams(window.location.search);
  const title = params.get("title") || "Citizen Service";
  const provider = params.get("provider") || "Nav Dristi Public Services";
  const category = params.get("category") || "general";
  const token = "SRV-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const createdAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  document.getElementById("receiptTitle").textContent = title;
  document.getElementById("serviceReceiptMeta").innerHTML = [
    '<div class="meta-chip"><strong>' + UI.escapeHtml(token) + '</strong><span>Receipt token</span></div>',
    '<div class="meta-chip"><strong>' + UI.escapeHtml(provider) + '</strong><span>Department</span></div>',
    '<div class="meta-chip"><strong>' + UI.escapeHtml(category) + '</strong><span>Category</span></div>',
    '<div class="meta-chip"><strong>' + UI.escapeHtml(createdAt) + '</strong><span>Generated</span></div>'
  ].join("");

  document.getElementById("serviceReceiptBody").innerHTML = [
    "<strong>Service acknowledgment</strong>",
    "<p>" + UI.escapeHtml("This printable receipt confirms that the citizen opened the service route for " + title + ".") + "</p>",
    "<p>" + UI.escapeHtml("Use this document as a portal-style guide receipt during the demo for certificates, tax services, pension support, land records, or emergency assistance.") + "</p>",
    "<p>" + UI.escapeHtml("Next step: return to the services page or continue into complaint/support flow if this service requires officer attention.") + "</p>"
  ].join("");
});
