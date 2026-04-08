document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const user = UI.requireRole("admin");

  if (!user) {
    return;
  }

  const searchInput = document.getElementById("adminSearch");
  const statusFilter = document.getElementById("adminStatusFilter");
  const categoryFilter = document.getElementById("adminCategoryFilter");
  const priorityFilter = document.getElementById("adminPriorityFilter");
  const selectAllButton = document.getElementById("adminSelectAllButton");
  const bulkStatusSelect = document.getElementById("bulkStatusSelect");
  const bulkDepartmentSelect = document.getElementById("bulkDepartmentSelect");
  const bulkOfficerInput = document.getElementById("bulkOfficerInput");
  const bulkStatusApply = document.getElementById("bulkStatusApply");
  const bulkAssignApply = document.getElementById("bulkAssignApply");
  const selectedIds = new Set();
  let lastVisibleIds = [];

  function renderDepartmentInbox(items) {
    const container = document.getElementById("departmentInbox");
    const grouped = App.constants.departments.map(function (department) {
      const departmentCases = items.filter(function (complaint) {
        return complaint.department === department && complaint.status !== "resolved";
      });
      return {
        department: department,
        count: departmentCases.length,
        lead: departmentCases[0] || null
      };
    }).filter(function (entry) {
      return entry.count > 0;
    });

    if (!grouped.length) {
      UI.renderEmptyState(container, "No active department inbox items.");
      return;
    }

    container.innerHTML = grouped.map(function (entry) {
      return [
        '<article class="stack-item">',
        '<h3>' + UI.escapeHtml(entry.department) + '</h3>',
        '<p>' + UI.escapeHtml(String(entry.count) + " active complaints in inbox.") + '</p>',
        '<small>' + UI.escapeHtml("Lead case: " + (entry.lead ? entry.lead.id + " / " + entry.lead.assignedOfficer : "None")) + '</small>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderTableRows(complaints) {
    const tableBody = document.getElementById("adminComplaintTable");
    lastVisibleIds = complaints.map(function (item) { return item.id; });

    if (!complaints.length) {
      tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No complaints match these filters.</div></td></tr>';
      return;
    }

    tableBody.innerHTML = complaints.map(function (complaint) {
      const quickAction = complaint.status === "resolved"
        ? ""
        : complaint.status === "open"
          ? '<button class="button button-secondary" data-status-action="in_progress" data-id="' + complaint.id + '">Start Work</button>'
          : '<button class="button button-secondary" data-status-action="resolved" data-id="' + complaint.id + '">Resolve</button>';

      const escalateAction = complaint.status === "resolved" || complaint.status === "escalated"
        ? ""
        : '<button class="button button-ghost" data-status-action="escalated" data-id="' + complaint.id + '">Escalate</button>';

      return [
        "<tr>",
        '  <td><input type="checkbox" data-select-id="' + UI.escapeHtml(complaint.id) + '"' + (selectedIds.has(complaint.id) ? " checked" : "") + "></td>",
        "  <td><strong>" + UI.escapeHtml(complaint.id) + "</strong></td>",
        '  <td><div class="table-complaint"><div><strong>' + UI.escapeHtml(complaint.title) + '</strong><p>' + UI.escapeHtml((complaint.roadName || complaint.location) + ", " + (complaint.district || complaint.ward)) + '</p><small>' + UI.escapeHtml(complaint.citizenName) + " / " + UI.escapeHtml(complaint.ward) + "</small></div></div></td>",
        "  <td>" +
          UI.createBadge(complaint.category, "category") +
          UI.createBadge(complaint.priorityLabel, "priority") +
          UI.createBadge(complaint.aiFeatures.emotionLabel, "sentiment") +
          UI.createBadge(complaint.imageVerification.status, "status") +
          "</td>",
        "  <td>" +
          UI.createBadge(complaint.status === "in_progress" ? "In Progress" : App.prettifyStatus(complaint.status), "status") +
          UI.createBadge(complaint.supportDeskTitle || "General civic desk", complaint.issueDesk === "women" ? "priority" : "status") +
          '<p class="timeline-meta">' + UI.escapeHtml(complaint.department) + " / " + UI.escapeHtml(complaint.assignedOfficer) + "</p>" +
          '<p class="timeline-meta">' + UI.escapeHtml("SLA " + complaint.escalationWindowHours + "h / Open " + complaint.responseHours + "h") + "</p></td>",
        '  <td><div class="quick-actions"><a class="button button-primary" href="./complaint.html?id=' + encodeURIComponent(complaint.id) + '">Open</a>' + quickAction + escalateAction + "</div></td>",
        "</tr>"
      ].join("");
    }).join("");

    tableBody.querySelectorAll("[data-select-id]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        const id = checkbox.getAttribute("data-select-id");
        if (checkbox.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }
      });
    });

    tableBody.querySelectorAll("[data-status-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        const nextStatus = button.getAttribute("data-status-action");
        const complaintId = button.getAttribute("data-id");
        const note = nextStatus === "resolved"
          ? "Resolution marked by command center after field update."
          : nextStatus === "escalated"
            ? "Escalated due to urgency, duplicate cluster, or SLA risk."
            : "Complaint moved into active work queue.";
        const result = App.updateComplaintStatus(complaintId, nextStatus, note);
        if (!result.ok) {
          UI.showToast("Update failed", result.message, "error");
          return;
        }
        UI.showToast("Status updated", result.complaint.id + " is now " + App.prettifyStatus(nextStatus) + ".", "success");
        renderDashboard();
      });
    });
  }

  function renderUrgentQueue(complaints) {
    const queue = complaints
      .filter(function (complaint) {
        return complaint.status !== "resolved";
      })
      .sort(function (left, right) {
        return right.priorityScore - left.priorityScore;
      })
      .slice(0, 4);
    const container = document.getElementById("urgentQueue");

    if (!queue.length) {
      UI.renderEmptyState(container, "No urgent complaints right now.");
      return;
    }

    container.innerHTML = queue.map(function (complaint) {
      return [
        '<article class="stack-item">',
        '  <div class="stack-item-header">',
        '    <h3>' + UI.escapeHtml(complaint.title) + "</h3>",
        UI.createBadge(complaint.priorityLabel, "priority"),
        "  </div>",
        '  <p>' + UI.escapeHtml(complaint.summary) + '</p>',
        '  <small>' + UI.escapeHtml((complaint.district || complaint.ward) + " / " + complaint.department + " / " + complaint.aiFeatures.emotionLabel + " / " + complaint.supportCount + " supporters / " + (complaint.supportDeskTitle || "General civic desk")) + "</small>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderPendingCritical(complaints) {
    const container = document.getElementById("pendingCriticalBoard");
    const items = complaints.filter(function (complaint) {
      return complaint.priorityLabel === "Critical" && complaint.status !== "resolved";
    }).slice(0, 4);

    container.innerHTML = items.map(function (complaint) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(complaint.id + " / " + complaint.title) + '</h3><p>' + UI.escapeHtml(complaint.district + " / " + complaint.department + " / " + complaint.responseHours + "h open") + '</p></article>';
    }).join("") || '<div class="empty-state">No pending critical cases.</div>';
  }

  function renderPatternWatch(complaints) {
    const container = document.getElementById("aiPatternWatch");
    const risky = complaints.filter(function (complaint) {
      return complaint.duplicateCount || complaint.duplicateOf || complaint.isOverdue || complaint.imageVerification.status !== "Likely original";
    }).slice(0, 4);

    if (!risky.length) {
      UI.renderEmptyState(container, "AI did not flag any special risk clusters.");
      return;
    }

    container.innerHTML = risky.map(function (complaint) {
      const notes = [];
      if (complaint.duplicateCount || complaint.duplicateOf) {
        notes.push("Possible duplicate cluster");
      }
      if (complaint.isOverdue) {
        notes.push("SLA risk");
      }
      if (complaint.imageVerification.status !== "Likely original" && complaint.imageVerification.status !== "No image") {
        notes.push(complaint.imageVerification.status);
      }

      return [
        '<article class="stack-item">',
        '  <h3>' + UI.escapeHtml(complaint.id + " / " + complaint.title) + "</h3>",
        '  <p>' + UI.escapeHtml(notes.join(" / ")) + "</p>",
        '  <small>' + UI.escapeHtml(complaint.ward + " / " + complaint.category + " / " + (complaint.supportDeskTitle || "General civic desk") + " / score " + complaint.priorityScore) + "</small>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderFakeReviewQueue(complaints) {
    const container = document.getElementById("fakeReviewQueue");
    const items = complaints.filter(function (complaint) {
      return complaint.imageVerification.status === "Reused image" || complaint.imageVerification.status === "Low confidence" || complaint.duplicateCount > 0;
    }).slice(0, 5);

    container.innerHTML = items.map(function (complaint) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(complaint.title) + '</h3><p>' + UI.escapeHtml(complaint.imageVerification.status + " / duplicates " + complaint.duplicateCount) + '</p><small>' + UI.escapeHtml(complaint.id + " / " + complaint.district) + '</small></article>';
    }).join("") || '<div class="empty-state">No complaints currently need fake-evidence review.</div>';
  }

  function renderAutomationLayer(complaints) {
    const container = document.getElementById("automationLayer");
    const pending = complaints.filter(function (complaint) {
      return complaint.status !== "resolved";
    }).slice(0, 3);

    container.innerHTML = pending.map(function (complaint) {
      return [
        '<article class="stack-item">',
        '  <div class="stack-item-header">',
        '    <h3>' + UI.escapeHtml(complaint.id + " / " + complaint.department) + "</h3>",
        UI.createBadge(complaint.isOverdue ? "Escalation due" : "Auto assigned", "status"),
        (complaint.issueDesk === "women" ? UI.createBadge("Women desk 1h SLA", "priority") : ""),
        "  </div>",
        '  <p>' + UI.escapeHtml(complaint.aiFeatures.autoAssignmentReason) + "</p>",
        '  <p>' + UI.escapeHtml(complaint.suggestedSolution) + "</p>",
        '  <small>' + UI.escapeHtml("Image check: " + complaint.imageVerification.status + " / Language: " + complaint.voiceLanguage + " / Support: " + complaint.supportCount) + "</small>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderAssignmentBoard(complaints) {
    const container = document.getElementById("assignmentBoard");
    const grouped = {};
    complaints.forEach(function (complaint) {
      const key = complaint.assignedOfficer || "Unassigned";
      if (!grouped[key]) {
        grouped[key] = { officer: key, desk: complaint.supportDeskTitle || "General civic desk", count: 0, district: complaint.district };
      }
      grouped[key].count += 1;
    });

    container.innerHTML = Object.keys(grouped).slice(0, 6).map(function (key) {
      const item = grouped[key];
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.officer) + '</h3><p>' + UI.escapeHtml(item.count + " assigned complaints / " + item.desk) + '</p><small>' + UI.escapeHtml(item.district) + '</small></article>';
    }).join("") || '<div class="empty-state">No assignments to show.</div>';
  }

  function renderDepartmentCapacity(items) {
    const container = document.getElementById("departmentCapacity");
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="performance-item">',
        '  <div><strong>' + UI.escapeHtml(item.department) + '</strong><p>Operational unit</p></div>',
        '  <div><strong>' + UI.escapeHtml(String(item.backlog)) + '</strong><p>Backlog</p></div>',
        '  <div><strong>' + UI.escapeHtml(String(item.atRisk)) + '</strong><p>At risk</p></div>',
        "</article>"
      ].join("");
    }).join("");
  }

  function renderOfficerPerformance(complaints) {
    const container = document.getElementById("officerPerformanceBoard");
    const board = {};
    complaints.forEach(function (complaint) {
      const key = complaint.assignedOfficer || "Unassigned";
      if (!board[key]) {
        board[key] = { officer: key, active: 0, resolved: 0, escalated: 0 };
      }
      if (complaint.status === "resolved") {
        board[key].resolved += 1;
      } else {
        board[key].active += 1;
      }
      if (complaint.status === "escalated") {
        board[key].escalated += 1;
      }
    });

    const items = Object.keys(board).map(function (key) {
      const entry = board[key];
      entry.score = Math.max(40, 100 - (entry.escalated * 12) - (entry.active * 3) + (entry.resolved * 5));
      return entry;
    }).sort(function (left, right) {
      return right.score - left.score;
    }).slice(0, 6);
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="performance-item">',
        '<div><strong>' + UI.escapeHtml(item.officer) + '</strong><p>Monthly scorecard</p></div>',
        '<div><strong>' + UI.escapeHtml(String(item.active)) + '</strong><p>Active</p></div>',
        '<div><strong>' + UI.escapeHtml(String(item.resolved)) + '</strong><p>Resolved</p></div>',
        '<div><strong>' + UI.escapeHtml(String(item.score)) + '</strong><p>Score</p></div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderDepartmentBoard(items) {
    const container = document.getElementById("departmentBoard");
    container.innerHTML = items.map(function (item) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.department) + '</h3><p>' + UI.escapeHtml("Open backlog: " + item.backlog + " / Resolved: " + item.resolved + " / At risk: " + item.atRisk) + '</p></article>';
    }).join("");
  }

  function renderComplaintAging(complaints) {
    const container = document.getElementById("complaintAgingBoard");
    const items = complaints.filter(function (item) {
      return item.status !== "resolved";
    }).sort(function (left, right) {
      return right.responseHours - left.responseHours;
    }).slice(0, 5);
    container.innerHTML = items.map(function (item) {
      const state = item.isOverdue ? "Overdue" : (item.escalationWindowHours - item.responseHours <= 4 ? "Due soon" : "Healthy");
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.id + " / " + item.title) + '</h3><p>' + UI.escapeHtml(item.responseHours + "h open / " + item.escalationWindowHours + "h SLA / " + state) + '</p></article>';
    }).join("") || '<div class="empty-state">No aging data available.</div>';
  }

  function renderDailyActionSummary(complaints) {
    const container = document.getElementById("dailyActionSummary");
    const items = complaints.slice(0, 5).map(function (complaint) {
      const latest = complaint.timeline && complaint.timeline.length ? complaint.timeline[complaint.timeline.length - 1] : null;
      return {
        id: complaint.id,
        title: complaint.title,
        action: latest ? latest.title : "Complaint submitted",
        at: latest ? latest.createdAt : complaint.updatedAt
      };
    });

    container.innerHTML = items.map(function (item) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(item.id + " / " + item.action) + '</h3><p>' + UI.escapeHtml(item.title) + '</p><small>' + UI.escapeHtml(UI.formatDate(item.at, true)) + '</small></article>';
    }).join("");
  }

  function applyBulkStatus() {
    const ids = Array.from(selectedIds);
    if (!ids.length || !bulkStatusSelect.value) {
      UI.showToast("Bulk action skipped", "Select complaints and a bulk status first.", "error");
      return;
    }
    ids.forEach(function (id) {
      App.updateComplaintStatus(id, bulkStatusSelect.value, "Bulk update from authority command center.");
    });
    selectedIds.clear();
    UI.showToast("Bulk status applied", ids.length + " complaints were updated.", "success");
    renderDashboard();
  }

  function applyBulkAssignment() {
    const ids = Array.from(selectedIds);
    if (!ids.length || !bulkDepartmentSelect.value) {
      UI.showToast("Bulk assignment skipped", "Select complaints and a department first.", "error");
      return;
    }
    ids.forEach(function (id) {
      App.assignComplaint(id, bulkDepartmentSelect.value, bulkOfficerInput.value.trim());
    });
    selectedIds.clear();
    UI.showToast("Bulk assignment applied", ids.length + " complaints were reassigned.", "success");
    renderDashboard();
  }

  function renderDashboard() {
    UI.mountHeader("admin-dashboard");

    const analytics = App.getAnalytics();
    const allComplaints = App.getComplaints({ includeAll: true });
    const complaints = App.getComplaints({
      includeAll: true,
      search: searchInput.value,
      status: statusFilter.value || "all",
      category: categoryFilter.value || "all",
      priority: priorityFilter.value || "all"
    });

    UI.renderStatGrid(document.getElementById("adminStats"), [
      { label: "Total complaints", value: String(analytics.totalComplaints), helper: "Across all wards" },
      { label: "Resolution rate", value: analytics.resolutionRate + "%", helper: "Overall closed cases" },
      { label: "Critical open", value: String(analytics.criticalOpen), helper: "Fast-response queue" },
      { label: "Community support", value: String(analytics.totalCommunitySupport), helper: "Citizen upvotes across complaints" }
    ]);

    renderTableRows(complaints);
    renderDepartmentInbox(allComplaints);
    renderUrgentQueue(allComplaints);
    renderPendingCritical(allComplaints);
    renderPatternWatch(allComplaints);
    renderFakeReviewQueue(allComplaints);
    renderAutomationLayer(allComplaints);
    renderAssignmentBoard(allComplaints);
    UI.renderBars(document.getElementById("adminCategoryBars"), Object.keys(analytics.categoryCounts).map(function (key) {
      return { label: key, value: analytics.categoryCounts[key] };
    }));
    renderDepartmentCapacity(analytics.departmentPerformance);
    renderDepartmentBoard(analytics.departmentPerformance);
    renderComplaintAging(allComplaints);
    renderOfficerPerformance(allComplaints);
    renderDailyActionSummary(allComplaints);
  }

  UI.populateSelect(statusFilter, App.constants.statuses, "all");
  UI.populateSelect(categoryFilter, [{ value: "all", label: "All categories" }].concat(App.constants.categories.map(function (category) {
    return { value: category, label: category };
  })), "all");
  UI.populateSelect(priorityFilter, [
    { value: "all", label: "All priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ], "all");
  UI.populateSelect(bulkDepartmentSelect, [{ value: "", label: "Bulk department" }].concat(App.constants.departments.map(function (department) {
    return { value: department, label: department };
  })), "");

  [searchInput, statusFilter, categoryFilter, priorityFilter].forEach(function (element) {
    element.addEventListener("input", renderDashboard);
    element.addEventListener("change", renderDashboard);
  });

  if (selectAllButton) {
    selectAllButton.addEventListener("click", function () {
      const shouldSelect = lastVisibleIds.some(function (id) {
        return !selectedIds.has(id);
      });
      lastVisibleIds.forEach(function (id) {
        if (shouldSelect) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }
      });
      renderDashboard();
    });
  }

  if (bulkStatusApply) {
    bulkStatusApply.addEventListener("click", applyBulkStatus);
  }

  if (bulkAssignApply) {
    bulkAssignApply.addEventListener("click", applyBulkAssignment);
  }

  App.subscribe(renderDashboard);
  renderDashboard();
});
