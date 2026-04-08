document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const user = UI.requireRole("admin");

  if (!user) {
    return;
  }

  const filter = document.getElementById("officerWorkflowFilter");

  function buildDiary(complaint) {
    const diary = (complaint.timeline || []).slice(-4).map(function (item) {
      return {
        title: item.title,
        note: item.note,
        createdAt: item.createdAt
      };
    });
    if (!diary.length) {
      diary.push({
        title: "Field visit pending",
        note: "Officer has not added a field diary note yet.",
        createdAt: complaint.updatedAt
      });
    }
    return diary;
  }

  function render() {
    UI.mountHeader("officer-workflow");
    const complaints = App.getComplaints({ includeAll: true });
    const officers = ["all"].concat(Array.from(new Set(complaints.map(function (item) {
      return item.assignedOfficer || "Unassigned";
    })))).filter(Boolean);
    UI.populateSelect(filter, officers.map(function (item) {
      return { value: item, label: item === "all" ? "All officers" : item };
    }), filter.value || "all");

    const selectedOfficer = filter.value || "all";
    const scoped = complaints.filter(function (item) {
      return selectedOfficer === "all" || item.assignedOfficer === selectedOfficer;
    });
    const dueSoon = scoped.filter(function (item) { return item.status !== "resolved"; }).slice(0, 4);
    const proofCases = scoped.filter(function (item) {
      return (item.timeline || []).some(function (entry) {
        return String(entry.title || "").toLowerCase().indexOf("proof") !== -1;
      });
    }).slice(0, 4);
    const contactCases = scoped.slice(0, 4);

    UI.renderStatGrid(document.getElementById("officerWorkflowStats"), [
      { label: "Assignments in view", value: String(scoped.length), helper: selectedOfficer === "all" ? "Across all officers" : selectedOfficer },
      { label: "Active cases", value: String(scoped.filter(function (item) { return item.status !== "resolved"; }).length), helper: "Need field action" },
      { label: "Escalated", value: String(scoped.filter(function (item) { return item.status === "escalated"; }).length), helper: "Senior oversight on" },
      { label: "Proof logged", value: String(proofCases.length), helper: "Citizen-visible proof entries" }
    ]);

    document.getElementById("officerDeadlineBoard").innerHTML = dueSoon.map(function (item) {
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.id + " / " + item.title) + '</h3>',
        '<p>' + UI.escapeHtml(item.department + " / SLA " + item.escalationWindowHours + "h / Open " + item.responseHours + "h") + '</p>',
        '<small>' + UI.escapeHtml(item.assignedOfficer + " / " + item.district) + '</small>',
        '</article>'
      ].join("");
    }).join("") || '<div class="empty-state">No deadlines in this filter.</div>';

    document.getElementById("officerAssignmentList").innerHTML = scoped.map(function (item) {
      return [
        '<article class="stack-item">',
        '<div class="stack-item-header">',
        '<h3>' + UI.escapeHtml(item.title) + '</h3>',
        UI.createBadge(item.status === "in_progress" ? "In Progress" : App.prettifyStatus(item.status), "status"),
        '</div>',
        '<p>' + UI.escapeHtml(item.district + " / " + item.roadName + " / " + item.department) + '</p>',
        '<small>' + UI.escapeHtml("Citizen: " + item.citizenName + " / Priority " + item.priorityLabel + " / Support " + item.supportCount) + '</small>',
        '<div class="hero-actions"><a class="button button-secondary" href="./complaint.html?id=' + encodeURIComponent(item.id) + '">Open Case</a><a class="button button-ghost" href="./officer-field-summary.html?id=' + encodeURIComponent(item.id) + '">Field Summary</a></div>',
        '</article>'
      ].join("");
    }).join("") || '<div class="empty-state">No assignments match the current officer filter.</div>';

    document.getElementById("officerProofList").innerHTML = proofCases.map(function (item) {
      const proofEntry = (item.timeline || []).slice().reverse().find(function (entry) {
        return String(entry.title || "").toLowerCase().indexOf("proof") !== -1;
      }) || item.timeline[item.timeline.length - 1];
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.id + " / " + item.assignedOfficer) + '</h3>',
        '<p>' + UI.escapeHtml(proofEntry ? proofEntry.note : "No proof note available.") + '</p>',
        '<small>' + UI.escapeHtml(UI.formatDate(proofEntry ? proofEntry.createdAt : item.updatedAt, true)) + '</small>',
        '</article>'
      ].join("");
    }).join("") || '<div class="empty-state">No proof entries found in this view.</div>';

    document.getElementById("officerDiaryList").innerHTML = scoped.slice(0, 4).map(function (item) {
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.id + " / " + item.assignedOfficer) + '</h3>',
        buildDiary(item).map(function (entry) {
          return '<p><strong>' + UI.escapeHtml(entry.title) + ':</strong> ' + UI.escapeHtml(entry.note) + ' <small>' + UI.escapeHtml(UI.formatDate(entry.createdAt, true)) + "</small></p>";
        }).join(""),
        '</article>'
      ].join("");
    }).join("") || '<div class="empty-state">No field diary items are available yet.</div>';

    document.getElementById("officerContactHistory").innerHTML = contactCases.map(function (item) {
      const contactMessages = (item.messages || []).slice(-2);
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(item.id + " / " + item.citizenName) + '</h3>',
        contactMessages.map(function (message) {
          return '<p>' + UI.escapeHtml(message.senderName + ": " + message.text) + "</p>";
        }).join("") || "<p>No citizen contact history yet.</p>",
        '<small>' + UI.escapeHtml(item.department + " / " + item.district) + '</small>',
        '</article>'
      ].join("");
    }).join("") || '<div class="empty-state">No citizen contact history found.</div>';
  }

  filter.addEventListener("change", render);
  App.subscribe(render);
  render();
});
