(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toSlug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function formatDate(value, includeTime) {
    if (!value) {
      return "Not available";
    }
    const date = new Date(value);
    return date.toLocaleString("en-IN", includeTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" }
    );
  }

  function formatRelative(value) {
    const timestamp = new Date(value).getTime();
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.round(diffMs / 36e5);
    if (diffHours < 1) {
      return "Just now";
    }
    if (diffHours < 24) {
      return diffHours + "h ago";
    }
    const diffDays = Math.round(diffHours / 24);
    return diffDays + "d ago";
  }

  function getInitials(name) {
    return String(name || "ND")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part[0].toUpperCase(); })
      .join("");
  }

  function createBadge(text, type) {
    return '<span class="badge badge-' + escapeHtml(type) + "-" + escapeHtml(toSlug(text)) + '">' + escapeHtml(text) + "</span>";
  }

  function mountHeader(activePage) {
    const root = document.querySelector("[data-app-header]");
    if (!root) {
      return;
    }

    const user = window.CivicPulse.getCurrentUser();
    const dashboardHref = !user
      ? "./auth.html"
      : user.role === "admin"
        ? "./admin-dashboard.html"
        : user.citizenType === "women"
          ? "./women-support.html"
          : user.citizenType === "men"
            ? "./men-support.html"
            : user.citizenType === "elder"
              ? "./elder-support.html"
        : "./citizen-dashboard.html";

    let navItems = [
      { key: "home", label: "Home", href: "./index.html" },
      { key: "judge-mode", label: "Judge Mode", href: "./judge-mode.html" },
      { key: "ai-features", label: "AI Features", href: "./ai-features.html" },
      { key: "citizen-dashboard", label: "Citizen", href: "./citizen-dashboard.html" },
      { key: "women-support", label: "Women Section", href: "./women-support.html" },
      { key: "men-support", label: "Men Section", href: "./men-support.html" },
      { key: "elder-support", label: "Elder Section", href: "./elder-support.html" },
      { key: "child-rescue", label: "Child Rescue", href: "./child-rescue.html" },
      { key: "admin-dashboard", label: "Admin", href: "./admin-dashboard.html" },
      { key: "officer-workflow", label: "Officer Workflow", href: "./officer-workflow.html" },
      { key: "analytics", label: "Analytics", href: "./analytics.html" },
      { key: "safety-map", label: "Safety Map", href: "./safety-map.html" },
      { key: "services", label: "Services", href: "./services.html" },
      { key: "officers", label: "Officers", href: "./officers.html" },
      { key: "settings", label: "Settings", href: "./settings.html" },
      { key: "auth", label: user ? "Switch Account" : "Login", href: "./auth.html" }
    ];

    if (user && user.role === "citizen") {
      navItems = navItems.filter(function (item) {
        return item.key !== "admin-dashboard" && item.key !== "analytics" && item.key !== "officer-workflow";
      });
    }

    if (user && user.role === "admin") {
      navItems = navItems.filter(function (item) {
        return item.key !== "citizen-dashboard" && item.key !== "women-support" && item.key !== "men-support" && item.key !== "elder-support" && item.key !== "child-rescue";
      });
    }

    if (user && user.role === "citizen" && user.citizenType !== "women") {
      navItems = navItems.filter(function (item) {
        return item.key !== "women-support";
      });
    }

    if (user && user.role === "citizen" && user.citizenType !== "men") {
      navItems = navItems.filter(function (item) {
        return item.key !== "men-support";
      });
    }

    if (user && user.role === "citizen" && user.citizenType !== "elder") {
      navItems = navItems.filter(function (item) {
        return item.key !== "elder-support";
      });
    }

    root.innerHTML = [
      '<div class="topbar">',
      '  <div class="topbar-inner">',
      '    <a class="brand" href="./index.html">',
      '      <span class="brand-mark">ND</span>',
      '      <span class="brand-copy">',
      '        <strong>Nav Dristi</strong>',
      '        <span>Chhattisgarh Public Services Portal</span>',
      "      </span>",
      "    </a>",
      '    <nav class="nav-links">',
      navItems.map(function (item) {
        const activeClass = item.key === activePage ? "is-active" : "";
        return '<a class="nav-link ' + activeClass + '" href="' + item.href + '">' + item.label + "</a>";
      }).join(""),
      "    </nav>",
      '    <div class="topbar-actions">',
      user
        ? [
            '<a class="button button-ghost" href="' + dashboardHref + '">My Dashboard</a>',
            '<div class="user-chip">',
            '  <span class="user-avatar">' + escapeHtml(getInitials(user.name)) + "</span>",
            '  <span class="user-meta">',
            '    <strong>' + escapeHtml(user.name) + "</strong>",
            '    <span>' + escapeHtml(user.role === "admin" ? "Authority access" : ((user.citizenType === "women" ? "Women support user" : user.citizenType === "men" ? "Male support user" : user.citizenType === "elder" ? "Elder emergency user" : (user.district || "Chhattisgarh") + " / " + user.ward))) + "</span>",
            "  </span>",
            "</div>",
            '<button class="button button-secondary" data-logout>Logout</button>'
          ].join("")
        : '<a class="button button-primary" href="./auth.html">Enter Portal</a>',
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");

    const logoutButton = root.querySelector("[data-logout]");
    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        window.CivicPulse.logout();
        showToast("Signed out", "You can log in again with any demo account.", "success");
        setTimeout(function () {
          window.location.href = "./auth.html";
        }, 320);
      });
    }

    mountUtilityBoard(activePage, user);
    mountFooter();
  }

  function mountUtilityBoard(activePage, user) {
    const pageHead = document.querySelector(".page-head");
    if (!pageHead) {
      return;
    }

    let board = document.querySelector("[data-page-utility-board]");
    if (!board) {
      board = document.createElement("section");
      board.setAttribute("data-page-utility-board", "true");
      board.className = "utility-board";
      pageHead.insertAdjacentElement("afterend", board);
    }

    const pageLabel = activePage === "admin-dashboard"
      ? "Command center"
      : activePage === "women-support"
        ? "Women safety section"
        : activePage === "elder-support"
          ? "Elder emergency section"
          : activePage === "services"
            ? "Service discovery"
            : activePage === "complaint-detail"
              ? "Complaint tracking"
              : "Citizen support";

    const quickRoute = user && user.role === "admin"
      ? "./admin-dashboard.html"
      : user && user.citizenType === "women"
        ? "./women-support.html"
        : user && user.citizenType === "men"
          ? "./men-support.html"
          : user && user.citizenType === "elder"
            ? "./elder-support.html"
            : "./citizen-dashboard.html";

    board.innerHTML = [
      '<article class="utility-card">',
      '  <span class="utility-kicker">Current context</span>',
      '  <strong>' + escapeHtml(pageLabel) + '</strong>',
      '  <p>' + escapeHtml(user ? (user.name + " / " + (user.role === "admin" ? "Authority access" : (user.citizenType || "general") + " user")) : "Public access view") + "</p>",
      '</article>',
      '<article class="utility-card">',
      '  <span class="utility-kicker">Quick actions</span>',
      '  <div class="utility-links">',
      '    <a href="' + quickRoute + '">My route</a>',
      '    <a href="./services.html">Services</a>',
      '    <a href="./judge-mode.html">Judge mode</a>',
      '  </div>',
      '</article>',
      '<article class="utility-card">',
      '  <span class="utility-kicker">Emergency numbers</span>',
      '  <p><strong>108</strong> Ambulance, <strong>181</strong> Women, <strong>1098</strong> Child, <strong>112</strong> Emergency</p>',
      '</article>'
    ].join("");
  }

  function mountFooter() {
    const existing = document.querySelector("[data-app-footer]");
    if (existing && existing.dataset.ready === "true") {
      return;
    }

    const footer = existing || document.createElement("footer");
    footer.setAttribute("data-app-footer", "true");
    footer.dataset.ready = "true";
    footer.className = "portal-footer";
    footer.innerHTML = [
      '<div class="portal-footer-inner">',
      '  <div class="portal-footer-grid">',
      '    <section class="footer-panel footer-brand-panel">',
      '      <span class="footer-kicker">Government of Chhattisgarh Style Demo</span>',
      '      <h2>Nav Dristi</h2>',
      '      <p>Unified public-services, grievance resolution, and women safety portal for Chhattisgarh with citizen access, officer routing, SLA tracking, and emergency support.</p>',
      '      <div class="footer-badge-row">',
      '        <span class="footer-badge">State Services</span>',
      '        <span class="footer-badge">Citizen Grievances</span>',
      '        <span class="footer-badge">Women Safety</span>',
      '      </div>',
      '    </section>',
      '    <section class="footer-panel">',
      '      <h3>District Contacts</h3>',
      '      <div class="footer-contact-list">',
      '        <div><strong>Raipur Division</strong><span>State Help Desk: 0771-2234501</span></div>',
      '        <div><strong>Bilaspur Division</strong><span>Regional Control Room: 07752-240900</span></div>',
      '        <div><strong>Durg Division</strong><span>District Response Cell: 0788-2323100</span></div>',
      '        <div><strong>Surguja Division</strong><span>North Zone Facilitation: 07774-220818</span></div>',
      '        <div><strong>Bastar Division</strong><span>South Zone Facilitation: 07782-222184</span></div>',
      '      </div>',
      '    </section>',
      '    <section class="footer-panel">',
      '      <h3>Legal and Public Links</h3>',
      '      <div class="footer-link-list">',
      '        <a href="./services.html">Citizen Services Directory</a>',
      '        <a href="./complaint.html">Grievance Resolution Center</a>',
      '        <a href="./women-support.html">Women Safety and Support</a>',
      '        <a href="./service-receipt.html?title=Portal%20Acknowledgment&provider=Nav%20Dristi&category=legal">Terms, Records and Acknowledgment</a>',
      '        <a href="./settings.html">Accessibility and Language Settings</a>',
      '      </div>',
      '    </section>',
      '    <section class="footer-panel">',
      '      <h3>Emergency Numbers</h3>',
      '      <div class="footer-emergency-list">',
      '        <div><strong>108</strong><span>Ambulance and medical emergency</span></div>',
      '        <div><strong>181</strong><span>Women helpline</span></div>',
      '        <div><strong>1098</strong><span>Child helpline</span></div>',
      '        <div><strong>112</strong><span>Emergency response support</span></div>',
      '        <div><strong>1800-233-4299</strong><span>Chhattisgarh State Commission for Women</span></div>',
      '      </div>',
      '    </section>',
      '  </div>',
      '  <div class="portal-footer-bottom">',
      '    <span>Designed for citizen-first access, transparent escalation, and printable official records.</span>',
      '    <span>Demo portal for hackathon presentation. Verify department decisions through official state channels.</span>',
      '  </div>',
      '</div>'
    ].join("");

    if (!existing) {
      document.body.appendChild(footer);
    }
  }

  function showToast(title, message, tone) {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }

    const toast = document.createElement("div");
    toast.className = "toast toast-" + (tone || "success");
    toast.innerHTML = "<strong>" + escapeHtml(title) + "</strong><span>" + escapeHtml(message) + "</span>";
    stack.appendChild(toast);

    setTimeout(function () {
      toast.remove();
      if (!stack.children.length) {
        stack.remove();
      }
    }, 3200);
  }

  function renderStatGrid(container, items) {
    if (!container) {
      return;
    }
    container.innerHTML = items.map(function (item) {
      return [
        '<article class="stat-card">',
        '  <p>' + escapeHtml(item.label) + "</p>",
        '  <strong>' + escapeHtml(item.value) + "</strong>",
        item.helper ? '  <span class="timeline-meta">' + escapeHtml(item.helper) + "</span>" : "",
        "</article>"
      ].join("");
    }).join("");
  }

  function populateSelect(select, items, selectedValue) {
    if (!select) {
      return;
    }
    select.innerHTML = items.map(function (item) {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      const selected = value === selectedValue ? " selected" : "";
      return '<option value="' + escapeHtml(value) + '"' + selected + ">" + escapeHtml(label) + "</option>";
    }).join("");
  }

  function complaintCard(complaint, options) {
    const settings = options || {};
    const linkLabel = settings.linkLabel || "Open Detail";
    const slaRemaining = Math.max(0, (complaint.escalationWindowHours || 0) - (complaint.responseHours || 0));
    const slaLabel = complaint.status === "resolved"
      ? "Closed"
      : complaint.status === "escalated"
        ? "Escalated"
        : slaRemaining <= 1
          ? "SLA critical"
          : slaRemaining <= 4
            ? "SLA watch"
            : "SLA healthy";
    const supportButton = settings.showSupportButton
      ? '<button class="button button-ghost" type="button" data-support-id="' + encodeURIComponent(complaint.id) + '">Support (' + escapeHtml(String(complaint.supportCount || 0)) + ")</button>"
      : "";
    return [
      '<article class="complaint-item">',
      '  <div class="complaint-item-header">',
      "    <div>",
      "      <small>" + escapeHtml(complaint.id) + " / " + escapeHtml(formatRelative(complaint.createdAt)) + "</small>",
      "      <h3>" + escapeHtml(complaint.title) + "</h3>",
      "    </div>",
      '    <div class="quick-actions"><a class="button button-secondary" href="./complaint.html?id=' + encodeURIComponent(complaint.id) + '">' + escapeHtml(linkLabel) + "</a>" + supportButton + "</div>",
      "  </div>",
      '  <p>' + escapeHtml(complaint.summary || complaint.description) + "</p>",
      '  <div class="meta-row">',
      createBadge(complaint.status === "in_progress" ? "In Progress" : window.CivicPulse.prettifyStatus(complaint.status), "status"),
      createBadge(complaint.priorityLabel, "priority"),
      createBadge(complaint.sentiment, "sentiment"),
      createBadge(complaint.category, "category"),
      createBadge(String(complaint.supportCount || 0) + " supporters", "status"),
      createBadge(slaLabel, "status"),
      "  </div>",
      '  <div class="metric-row">',
      '    <div class="metric-chip"><strong>' + escapeHtml(complaint.district || complaint.ward) + '</strong><span>District</span></div>',
      '    <div class="metric-chip"><strong>' + escapeHtml(complaint.roadName || complaint.location) + '</strong><span>Road / street</span></div>',
      '    <div class="metric-chip"><strong>' + escapeHtml(complaint.ward) + '</strong><span>Ward</span></div>',
      '    <div class="metric-chip"><strong>' + escapeHtml(complaint.department) + '</strong><span>Department</span></div>',
      '    <div class="metric-chip"><strong>' + escapeHtml(String(complaint.priorityScore)) + '</strong><span>Priority score</span></div>',
      '    <div class="metric-chip"><strong>' + escapeHtml(complaint.status === "resolved" ? "0h" : String(slaRemaining) + 'h') + '</strong><span>SLA left</span></div>',
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderEmptyState(container, message) {
    container.innerHTML = '<div class="empty-state">' + escapeHtml(message) + "</div>";
  }

  function renderBars(container, items) {
    if (!container) {
      return;
    }
    const maxValue = Math.max.apply(null, items.map(function (item) { return item.value; }).concat([1]));
    container.innerHTML = items.map(function (item, index) {
      const width = Math.max(10, Math.round((item.value / maxValue) * 100));
      const color = item.color || ["#1fd0aa", "#68d8ff", "#ffb44d", "#ff6f61", "#9be15d"][index % 5];
      return [
        '<div class="bar-item">',
        '  <div class="bar-label">',
        '    <strong>' + escapeHtml(item.label) + "</strong>",
        '    <span>' + escapeHtml(String(item.value)) + (item.helper ? " / " + escapeHtml(item.helper) : "") + "</span>",
        "  </div>",
        '  <div class="bar-track"><div class="bar-fill" style="width:' + width + "%;background:" + color + ';"></div></div>',
        "</div>"
      ].join("");
    }).join("");
  }

  function renderTrendChart(container, data) {
    if (!container) {
      return;
    }
    const width = 720;
    const height = 240;
    const padding = 28;
    const maxValue = Math.max.apply(null, data.map(function (item) { return item.value; }).concat([1]));
    const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

    const points = data.map(function (item, index) {
      const x = padding + stepX * index;
      const y = height - padding - ((item.value / maxValue) * (height - padding * 2));
      return { x: x, y: y, label: item.label, value: item.value };
    });

    const linePath = points.map(function (point, index) {
      return (index === 0 ? "M" : "L") + point.x + " " + point.y;
    }).join(" ");
    const areaPath = linePath + " L " + points[points.length - 1].x + " " + (height - padding) + " L " + points[0].x + " " + (height - padding) + " Z";

    container.innerHTML = [
      '<svg viewBox="0 0 ' + width + " " + height + '" aria-label="Complaint trend chart">',
      '  <path class="trend-area" d="' + areaPath + '"></path>',
      '  <path class="trend-line" d="' + linePath + '"></path>',
      points.map(function (point) {
        return '<circle class="trend-point" cx="' + point.x + '" cy="' + point.y + '" r="5"></circle>';
      }).join(""),
      points.map(function (point) {
        return '<text x="' + point.x + '" y="' + (height - 8) + '" text-anchor="middle">' + escapeHtml(point.label) + "</text>";
      }).join(""),
      points.map(function (point) {
        return '<text x="' + point.x + '" y="' + (point.y - 12) + '" text-anchor="middle">' + escapeHtml(String(point.value)) + "</text>";
      }).join(""),
      "</svg>"
    ].join("");
  }

  function renderDonut(container, legendContainer, items) {
    if (!container || !legendContainer) {
      return;
    }
    const palette = ["#1fd0aa", "#68d8ff", "#ffb44d", "#ff6f61"];
    const total = items.reduce(function (sum, item) { return sum + item.value; }, 0) || 1;
    let angle = 0;
    const segments = items.map(function (item, index) {
      const start = angle;
      const degrees = Math.round((item.value / total) * 360);
      angle += degrees;
      return palette[index % palette.length] + " " + start + "deg " + angle + "deg";
    }).join(", ");
    container.style.background = "conic-gradient(" + segments + ")";

    legendContainer.innerHTML = items.map(function (item, index) {
      return [
        '<div class="legend-item">',
        '  <div class="chat-row">',
        '    <span class="legend-dot" style="background:' + palette[index % palette.length] + ';"></span>',
        '    <strong>' + escapeHtml(item.label) + "</strong>",
        "  </div>",
        '  <span>' + escapeHtml(String(item.value)) + "</span>",
        "</div>"
      ].join("");
    }).join("");
  }

  function renderHeatmap(container, items) {
    if (!container) {
      return;
    }
    const maxValue = Math.max.apply(null, items.map(function (item) { return item.weightedPriority || item.count; }).concat([1]));
    container.innerHTML = items.map(function (item) {
      const ratio = (item.weightedPriority || item.count) / maxValue;
      const level = ratio >= 0.85 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.3 ? 2 : 1;
      return [
        '<div class="heat-cell heat-level-' + level + '">',
        '  <span>' + escapeHtml(item.ward) + "</span>",
        '  <strong>' + escapeHtml(String(item.count)) + " complaints</strong>",
        '  <span>' + escapeHtml(String(item.highPriority)) + " high priority / load " + String(item.weightedPriority || item.count) + "</span>",
        "</div>"
      ].join("");
    }).join("");
  }

  function requireRole(role) {
    const user = window.CivicPulse.getCurrentUser();
    if (!user || (role && user.role !== role)) {
      window.location.href = "./auth.html";
      return null;
    }
    return user;
  }

  window.CivicPulseUI = {
    mountHeader: mountHeader,
    showToast: showToast,
    renderStatGrid: renderStatGrid,
    populateSelect: populateSelect,
    complaintCard: complaintCard,
    renderEmptyState: renderEmptyState,
    renderBars: renderBars,
    renderTrendChart: renderTrendChart,
    renderDonut: renderDonut,
    renderHeatmap: renderHeatmap,
    requireRole: requireRole,
    createBadge: createBadge,
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    formatRelative: formatRelative,
    mountUtilityBoard: mountUtilityBoard,
    mountFooter: mountFooter
  };
})();

