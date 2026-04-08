document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;

  function renderDepartmentPerformance(items) {
    const container = document.getElementById("departmentPerformance");
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="performance-item">',
        '  <div><strong>' + UI.escapeHtml(item.department) + '</strong><p>Department</p></div>',
        '  <div><strong>' + UI.escapeHtml(String(item.backlog)) + '</strong><p>Open backlog</p></div>',
        '  <div><strong>' + UI.escapeHtml(String(item.averageHours)) + 'h</strong><p>Avg. resolution</p></div>',
        "</article>"
      ].join("");
    }).join("");
  }

  function renderHighlights(items) {
    const container = document.getElementById("analyticsHighlights");
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="stack-item">',
        '  <h3>' + UI.escapeHtml(item.title) + "</h3>",
        '  <p>' + UI.escapeHtml(item.body) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderPredictiveSignals(items) {
    const container = document.getElementById("predictiveSignals");
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="stack-item">',
        '  <h3>' + UI.escapeHtml(item.title) + "</h3>",
        '  <p>' + UI.escapeHtml("Risk score " + item.score + " / Hot district " + item.ward + " / " + item.count + " matching complaints.") + "</p>",
        '  <small>' + UI.escapeHtml(item.recommendation) + "</small>",
        "</article>"
      ].join("");
    }).join("");
  }

  function buildMapUrl(lat, lng) {
    const delta = 0.38;
    const left = (lng - delta).toFixed(4);
    const right = (lng + delta).toFixed(4);
    const top = (lat + delta).toFixed(4);
    const bottom = (lat - delta).toFixed(4);
    return "https://www.openstreetmap.org/export/embed.html?bbox=" + left + "%2C" + bottom + "%2C" + right + "%2C" + top + "&layer=mapnik&marker=" + lat + "%2C" + lng;
  }

  function renderLiveMap(points, selectedArea) {
    const container = document.getElementById("liveComplaintMap");
    const focus = selectedArea || points[0] || { district: "Raipur", roadName: "GE Road", lat: 21.25, lng: 81.63, title: "No live complaint selected" };
    container.innerHTML = [
      '<div class="district-map-panel">',
      '  <iframe class="district-map-frame" title="Chhattisgarh live complaint map" loading="lazy" src="' + buildMapUrl(focus.lat, focus.lng) + '"></iframe>',
      "</div>",
      '<div class="glass-subcard">',
      '  <strong>' + UI.escapeHtml((focus.district || focus.ward || "Chhattisgarh") + " / " + (focus.roadName || focus.title)) + "</strong>",
      '  <p>' + UI.escapeHtml(focus.title || "Select a district card to focus the real map.") + "</p>",
      "  </div>"
    ].join("");
  }

  function renderAreaList(items, points) {
    const container = document.getElementById("complaintAreaList");
    container.innerHTML = items.map(function (item) {
      return [
        '<button class="stack-item district-safety-item" type="button" data-area="' + UI.escapeHtml(item.area) + '">',
        '  <div class="stack-item-header">',
        '    <h3>' + UI.escapeHtml(item.area) + "</h3>",
        UI.createBadge(item.highestPriority, "priority"),
        "  </div>",
        '  <p>' + UI.escapeHtml(item.topIssue) + "</p>",
        '  <small>' + UI.escapeHtml(item.count + " complaints / " + item.highPriority + " high priority / " + item.department + " / " + (item.safetyLabel || "Watch")) + "</small>",
        "</button>"
      ].join("");
    }).join("");

    container.querySelectorAll("[data-area]").forEach(function (button) {
      button.addEventListener("click", function () {
        const area = button.getAttribute("data-area");
        const point = points.find(function (entry) {
          return entry.district === area;
        });
        if (point) {
          renderLiveMap(points, point);
        }
      });
    });
  }

  function renderAnalytics() {
    UI.mountHeader("analytics");

    const analytics = App.getAnalytics();
    UI.renderStatGrid(document.getElementById("analyticsStats"), [
      { label: "City complaints", value: String(analytics.totalComplaints), helper: "Current demo dataset" },
      { label: "Resolution rate", value: analytics.resolutionRate + "%", helper: "Closed successfully" },
      { label: "Avg. resolution", value: analytics.averageResolutionHours + "h", helper: "Resolved complaints only" },
      { label: "Image flags", value: String(analytics.imageFlags.reused + analytics.imageFlags.lowConfidence), helper: "Evidence needing review" }
    ]);

    UI.renderDonut(
      document.getElementById("statusDonut"),
      document.getElementById("statusLegend"),
      [
        { label: "Open", value: analytics.statusCounts.open },
        { label: "In Progress", value: analytics.statusCounts.in_progress },
        { label: "Resolved", value: analytics.statusCounts.resolved },
        { label: "Escalated", value: analytics.statusCounts.escalated }
      ]
    );

    UI.renderBars(document.getElementById("analyticsCategoryBars"), Object.keys(analytics.categoryCounts).map(function (key) {
      return { label: key, value: analytics.categoryCounts[key] };
    }));

    UI.renderTrendChart(document.getElementById("trendChart"), analytics.trend);
    UI.renderHeatmap(document.getElementById("wardHeatmap"), analytics.districtSafetyOverview
      .slice()
      .sort(function (left, right) {
        return right.weightedPriority - left.weightedPriority;
      })
      .slice(0, 12)
      .map(function (item) {
        return {
          ward: item.district,
          count: item.count,
          weightedPriority: item.weightedPriority,
          highPriority: item.highPriority
        };
      }));
    renderLiveMap(analytics.liveMapPoints, analytics.liveMapPoints[0]);
    renderAreaList(analytics.complaintAreas, analytics.liveMapPoints);
    renderDepartmentPerformance(analytics.departmentPerformance);
    renderHighlights(analytics.aiHighlights);
    renderPredictiveSignals(analytics.predictiveSignals);
  }

  App.subscribe(renderAnalytics);
  renderAnalytics();
});
