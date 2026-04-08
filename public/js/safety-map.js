document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const districts = App.getDistrictDirectory();

  function buildMapUrl(lat, lng) {
    const delta = 0.38;
    const left = (lng - delta).toFixed(4);
    const right = (lng + delta).toFixed(4);
    const top = (lat + delta).toFixed(4);
    const bottom = (lat - delta).toFixed(4);
    return "https://www.openstreetmap.org/export/embed.html?bbox=" + left + "%2C" + bottom + "%2C" + right + "%2C" + top + "&layer=mapnik&marker=" + lat + "%2C" + lng;
  }

  function updateSelectedDistrict(districtItem) {
    document.getElementById("districtMapFrame").src = buildMapUrl(districtItem.lat, districtItem.lng);
    document.getElementById("selectedDistrictCard").innerHTML = [
      "<strong>" + UI.escapeHtml(districtItem.district) + "</strong>",
      "<p>" + UI.escapeHtml("Headquarters: " + districtItem.headquarters) + "</p>",
      "<p>" + UI.escapeHtml("Safety level: " + districtItem.safetyLabel + " / Score " + districtItem.safetyScore) + "</p>",
      "<p>" + UI.escapeHtml("Complaints: " + districtItem.count + " / Pending: " + districtItem.pending + " / High priority: " + districtItem.highPriority) + "</p>",
      "<p>" + UI.escapeHtml("Roads: " + districtItem.roads.join(", ")) + "</p>",
      '<a class="button button-secondary" target="_blank" rel="noreferrer" href="https://www.openstreetmap.org/?mlat=' + encodeURIComponent(districtItem.lat) + "&mlon=" + encodeURIComponent(districtItem.lng) + '#map=11/' + encodeURIComponent(districtItem.lat) + "/" + encodeURIComponent(districtItem.lng) + '">Open in OpenStreetMap</a>'
    ].join("");
  }

  function render() {
    UI.mountHeader("safety-map");
    const analytics = App.getAnalytics();
    const rankedDistricts = analytics.districtSafetyOverview.slice().sort(function (left, right) {
      return left.safetyScore - right.safetyScore || right.count - left.count;
    });
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const activeRoads = analytics.liveMapPoints.slice().sort(function (left, right) {
      return (priorityOrder[right.priority] || 0) - (priorityOrder[left.priority] || 0);
    });
    const stableCount = analytics.districtSafetyOverview.filter(function (item) {
      return item.safetyLabel === "Stable";
    }).length;
    const criticalCount = analytics.districtSafetyOverview.filter(function (item) {
      return item.safetyLabel === "Critical";
    }).length;

    UI.renderStatGrid(document.getElementById("safetyStats"), [
      { label: "Districts tracked", value: String(districts.length), helper: "Across Chhattisgarh" },
      { label: "Stable districts", value: String(stableCount), helper: "Lower complaint pressure" },
      { label: "Critical districts", value: String(criticalCount), helper: "Need urgent intervention" },
      { label: "Roads in watchlist", value: String(activeRoads.length), helper: "Complaint-linked streets" }
    ]);

    const districtSafetyList = document.getElementById("districtSafetyList");
    districtSafetyList.innerHTML = rankedDistricts.map(function (item, index) {
      return [
        '<button class="stack-item district-safety-item" type="button" data-district="' + UI.escapeHtml(item.district) + '">',
        '  <div class="stack-item-header">',
        '    <h3>' + UI.escapeHtml(item.district) + "</h3>",
        UI.createBadge(item.safetyLabel, "priority"),
        "  </div>",
        '  <p>' + UI.escapeHtml("Score " + item.safetyScore + " / " + item.count + " complaints / " + item.pending + " pending cases") + "</p>",
        '  <small>' + UI.escapeHtml(item.roads.join(", ")) + "</small>",
        "</button>"
      ].join("");
    }).join("");

    districtSafetyList.querySelectorAll("[data-district]").forEach(function (button) {
      button.addEventListener("click", function () {
        const selected = rankedDistricts.find(function (item) {
          return item.district === button.getAttribute("data-district");
        });
        if (selected) {
          updateSelectedDistrict(selected);
        }
      });
    });

    document.getElementById("roadWatchList").innerHTML = analytics.liveMapPoints.slice(0, 8).map(function (point) {
      return [
        '<article class="stack-item">',
        '  <div class="stack-item-header">',
        '    <h3>' + UI.escapeHtml(point.roadName || point.title) + "</h3>",
        UI.createBadge(point.priority, "priority"),
        "  </div>",
        '  <p>' + UI.escapeHtml(point.title) + "</p>",
        '  <small>' + UI.escapeHtml((point.district || point.ward) + " / " + point.category) + "</small>",
        "</article>"
      ].join("");
    }).join("");

    const allComplaints = App.getComplaints({ includeAll: true });
    const womenCases = allComplaints.filter(function (item) { return item.issueDesk === "women"; });
    const elderCases = allComplaints.filter(function (item) { return item.issueDesk === "elder"; });
    const repeated = rankedDistricts.slice(0, 5);

    document.getElementById("districtRiskBoard").innerHTML = repeated.map(function (item) {
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.district) + '</h3>',
        '<p>' + UI.escapeHtml(item.safetyLabel + " / Score " + item.safetyScore) + '</p>',
        '<small>' + UI.escapeHtml("Pending " + item.pending + " / High priority " + item.highPriority + " / Repeated issue load " + item.count) + '</small>',
        '</article>'
      ].join("");
    }).join("");

    const womenHotspot = womenCases[0];
    const elderHotspot = elderCases[0];
    document.getElementById("publicTransparencyCard").innerHTML = [
      "<strong>Public transparency</strong>",
      "<p>" + UI.escapeHtml("Districts tracked: " + districts.length + " / Critical districts: " + criticalCount + " / Road watchlist: " + activeRoads.length) + "</p>"
    ].join("");
    document.getElementById("womenHotspotCard").innerHTML = [
      "<strong>Women safety hotspot</strong>",
      "<p>" + UI.escapeHtml(womenHotspot ? womenHotspot.district + " / " + womenHotspot.title : "No women safety hotspot yet in current dataset.") + "</p>"
    ].join("");
    document.getElementById("elderRiskCard").innerHTML = [
      "<strong>Elder emergency cluster</strong>",
      "<p>" + UI.escapeHtml(elderHotspot ? elderHotspot.district + " / " + elderHotspot.title : "No elder emergency cluster yet in current dataset.") + "</p>"
    ].join("");

    document.getElementById("emergencyIntegrationCard").innerHTML = [
      "<strong>112 emergency integration</strong>",
      "<p>" + UI.escapeHtml("Unified emergency access remains visible from women safety, elder emergency, and district risk screens.") + "</p>",
      '<div class="hero-actions"><a class="button button-primary" href="tel:112">Call 112</a><a class="button button-ghost" href="tel:108">Call 108</a></div>'
    ].join("");

    document.getElementById("floodAlertCard").innerHTML = [
      "<strong>Rain and flood watch</strong>",
      "<p>" + UI.escapeHtml("Monsoon-sensitive signals are rising in " + (rankedDistricts[0] ? rankedDistricts[0].district : "Raipur") + ", Bastar, and Sukma based on waterlogging and drainage complaints.") + "</p>"
    ].join("");

    document.getElementById("districtSeverityCard").innerHTML = [
      "<strong>District emergency severity</strong>",
      "<p>" + UI.escapeHtml("Highest current severity: " + (rankedDistricts[0] ? rankedDistricts[0].district + " / " + rankedDistricts[0].safetyLabel : "Not available")) + "</p>",
      "<p>" + UI.escapeHtml("Critical districts: " + criticalCount + " / Stable districts: " + stableCount) + "</p>"
    ].join("");

    document.getElementById("womenRapidActionCard").innerHTML = [
      "<strong>Women safety rapid action list</strong>",
      "<p>" + UI.escapeHtml("181 women helpline -> district women desk -> superior escalation -> patrol visibility.") + "</p>",
      "<p>" + UI.escapeHtml(womenHotspot ? "Live hotspot in dataset: " + womenHotspot.district + "." : "No live women hotspot currently flagged.") + "</p>"
    ].join("");

    updateSelectedDistrict(rankedDistricts[0] || {
      district: "Raipur",
      headquarters: "Raipur",
      safetyLabel: "Watch",
      safetyScore: 75,
      count: 0,
      pending: 0,
      highPriority: 0,
      roads: ["GE Road", "VIP Road"],
      lat: 21.25,
      lng: 81.63
    });
  }

  App.subscribe(render);
  render();
});
