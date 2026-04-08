document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const user = UI.requireRole("citizen");
  const trustedContactKey = "navdristi-trusted-contact";
  const womenPrefsKey = "navdristi-women-prefill";
  const elderReminderKey = "navdristi-elder-reminder";
  const elderPrefsKey = "navdristi-elder-prefill";

  if (!user) {
    return;
  }

  const page = document.body.getAttribute("data-page");
  const districts = App.getDistrictDirectory();
  UI.mountHeader(page);

  if (page === "women-support" && user.citizenType !== "women") {
    window.location.href = "./auth.html";
    return;
  }

  if (page === "men-support" && user.citizenType !== "men") {
    window.location.href = "./auth.html";
    return;
  }

  if (page === "elder-support" && user.citizenType !== "elder") {
    window.location.href = "./auth.html";
    return;
  }

  if (page === "child-rescue" && user.role !== "citizen") {
    window.location.href = "./auth.html";
    return;
  }

  function buildMapUrl(lat, lng) {
    const delta = 0.08;
    return "https://www.openstreetmap.org/export/embed.html?bbox=" +
      encodeURIComponent((lng - delta) + "," + (lat - delta) + "," + (lng + delta) + "," + (lat + delta)) +
      "&layer=mapnik&marker=" + encodeURIComponent(lat + "," + lng);
  }

  function toggleFullscreen(card, activeClass) {
    if (!card) {
      return;
    }
    card.classList.toggle("hidden");
    document.body.classList.toggle(activeClass, !card.classList.contains("hidden"));
  }

  if (page === "women-support") {
    const trustedContactForm = document.getElementById("trustedContactForm");
    const trustedContactCard = document.getElementById("trustedContactCard");
    const nearbyHelpCenters = document.getElementById("nearbyHelpCenters");
    const womenSafetyMap = document.getElementById("womenSafetyMap");
    const womenSeveritySelect = document.getElementById("womenSeveritySelect");
    const womenDistrictFilter = document.getElementById("womenDistrictFilter");
    const womenLaunchComplaintButton = document.getElementById("womenLaunchComplaintButton");
    const womenSilentLaunchButton = document.getElementById("womenSilentLaunchButton");
    const womenSosModeButton = document.getElementById("womenSosModeButton");
    const womenSosCloseButton = document.getElementById("womenSosCloseButton");
    const womenPrivateModeButton = document.getElementById("womenPrivateModeButton");
    const womenSosOverlayCard = document.getElementById("womenSosOverlayCard");
    const womenSafeTips = document.getElementById("womenSafeTips");
    const womenLegalHelp = document.getElementById("womenLegalHelp");
    const helpCenters = [
      { name: "Mahila Thana Raipur", district: "Raipur", detail: "Raipur district women police station / fast-response support", lat: 21.2514, lng: 81.6296 },
      { name: "Women Protection Cell Bilaspur", district: "Bilaspur", detail: "Bilaspur division support desk / counseling and complaint intake", lat: 22.0796, lng: 82.1391 },
      { name: "One Stop Center Durg", district: "Durg", detail: "Immediate shelter, legal support, and grievance coordination", lat: 21.1904, lng: 81.2849 },
      { name: "Women Safety Desk Jagdalpur", district: "Bastar", detail: "District women support, police referral, and emergency protection", lat: 19.0748, lng: 82.0080 }
    ];
    let isPrivateMode = false;

    function renderTrustedContact() {
      const raw = localStorage.getItem(trustedContactKey);
      if (!raw) {
        trustedContactCard.innerHTML = "<strong>No trusted contact saved</strong><p>Add one contact to make SOS follow-up and safety alerts more credible in the demo.</p>";
        return;
      }
      const contact = JSON.parse(raw);
      trustedContactCard.innerHTML = [
        "<strong>Trusted contact saved</strong>",
        "<p>" + UI.escapeHtml(contact.name + " / " + contact.phone) + "</p>",
        '<div class="hero-actions"><a class="button button-secondary" href="tel:' + UI.escapeHtml(contact.phone) + '">Call Trusted Contact</a></div>'
      ].join("");
    }

    function renderHelpCenters() {
      const district = womenDistrictFilter ? womenDistrictFilter.value : "all";
      const filtered = district === "all"
        ? helpCenters
        : helpCenters.filter(function (item) { return item.district === district; });

      if (nearbyHelpCenters) {
        nearbyHelpCenters.innerHTML = filtered.map(function (item, index) {
          return '<article class="stack-item"><h3>' + UI.escapeHtml(item.name) + '</h3><p>' + UI.escapeHtml(item.detail) + '</p><small>' + UI.escapeHtml(item.district) + '</small><div class="hero-actions"><button class="button button-secondary" type="button" data-help-center="' + index + '">Show On Map</button><a class="button button-ghost" href="tel:181">Call Help</a></div></article>';
        }).join("") || '<div class="empty-state">No help centers matched this district filter.</div>';

        nearbyHelpCenters.querySelectorAll("[data-help-center]").forEach(function (button) {
          button.addEventListener("click", function () {
            const item = filtered[Number(button.getAttribute("data-help-center"))];
            if (item && womenSafetyMap) {
              womenSafetyMap.src = buildMapUrl(item.lat, item.lng);
            }
          });
        });
      }

      if (womenSafetyMap && filtered.length) {
        womenSafetyMap.src = buildMapUrl(filtered[0].lat, filtered[0].lng);
      }
    }

    function launchWomenComplaint(privateMode) {
      localStorage.setItem(womenPrefsKey, JSON.stringify({
        severity: womenSeveritySelect ? womenSeveritySelect.value : "Critical",
        district: womenDistrictFilter ? womenDistrictFilter.value : user.district,
        privateMode: !!privateMode
      }));
      window.location.href = "./citizen-dashboard.html?desk=women&supportMode=1";
    }

    if (womenDistrictFilter) {
      UI.populateSelect(womenDistrictFilter, [{ value: "all", label: "All district desks" }].concat(districts.map(function (item) {
        return { value: item.name, label: item.name };
      })), user.district || "all");
      womenDistrictFilter.addEventListener("change", renderHelpCenters);
    }

    if (trustedContactForm) {
      trustedContactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        localStorage.setItem(trustedContactKey, JSON.stringify({
          name: document.getElementById("trustedContactName").value.trim(),
          phone: document.getElementById("trustedContactPhone").value.trim()
        }));
        renderTrustedContact();
        UI.showToast("Trusted contact saved", "SOS flow can now reference your saved contact.", "success");
      });
    }

    if (womenLaunchComplaintButton) {
      womenLaunchComplaintButton.addEventListener("click", function () {
        launchWomenComplaint(false);
      });
    }

    if (womenSilentLaunchButton) {
      womenSilentLaunchButton.addEventListener("click", function () {
        launchWomenComplaint(true);
      });
    }

    if (womenPrivateModeButton) {
      womenPrivateModeButton.addEventListener("click", function () {
        isPrivateMode = !isPrivateMode;
        document.body.classList.toggle("private-mode", isPrivateMode);
        womenPrivateModeButton.textContent = isPrivateMode ? "Private Mode On" : "Private Mode";
      });
    }

    if (womenSosModeButton) {
      womenSosModeButton.addEventListener("click", function () {
        toggleFullscreen(womenSosOverlayCard, "sos-mode-active");
      });
    }

    if (womenSosCloseButton) {
      womenSosCloseButton.addEventListener("click", function () {
        toggleFullscreen(womenSosOverlayCard, "sos-mode-active");
      });
    }

    if (womenSafeTips) {
      womenSafeTips.innerHTML = [
        "Share live status with one trusted contact before leaving an unsafe place.",
        "Move toward a public, well-lit area and keep emergency numbers ready.",
        "If a child is with you, call 1098 as soon as immediate safety is restored.",
        "Use silent complaint mode if open reporting increases risk."
      ].map(function (tip) {
        return '<article class="stack-item"><p>' + UI.escapeHtml(tip) + '</p></article>';
      }).join("");
    }

    if (womenLegalHelp) {
      womenLegalHelp.innerHTML = [
        "Record the time, place, and people involved as soon as you are safe.",
        "Keep screenshots, photos, call logs, or witness details for evidence.",
        "Use the women commission and police desk for domestic violence, dowry, stalking, or assault complaints.",
        "Ask for protection, counseling, shelter support, or escalation if the threat continues."
      ].map(function (tip) {
        return '<article class="stack-item"><p>' + UI.escapeHtml(tip) + '</p></article>';
      }).join("");
    }

    renderTrustedContact();
    renderHelpCenters();
  }

  if (page === "elder-support") {
    const emergencyScreenButton = document.getElementById("elderEmergencyScreenButton");
    const emergencyCloseButton = document.getElementById("elderEmergencyCloseButton");
    const emergencyOverlay = document.getElementById("elderEmergencyOverlayCard");
    const accessibilityToggle = document.getElementById("elderAccessibilityToggle");
    const reminderForm = document.getElementById("elderReminderForm");
    const reminderCard = document.getElementById("elderReminderCard");
    const emergencyType = document.getElementById("elderEmergencyType");
    const launchFastComplaint = document.getElementById("elderLaunchFastComplaint");

    function renderReminder() {
      const raw = localStorage.getItem(elderReminderKey);
      if (!raw) {
        reminderCard.innerHTML = "<strong>No reminder saved</strong><p>Save one medicine or check-in reminder to show elder support continuity.</p>";
        return;
      }
      const reminder = JSON.parse(raw);
      reminderCard.innerHTML = [
        "<strong>Reminder saved</strong>",
        "<p>" + UI.escapeHtml(reminder.time + " / " + reminder.note) + "</p>",
        "<p>" + UI.escapeHtml("Living-alone priority badge is active for this elder account.") + "</p>"
      ].join("");
    }

    if (reminderForm) {
      reminderForm.addEventListener("submit", function (event) {
        event.preventDefault();
        localStorage.setItem(elderReminderKey, JSON.stringify({
          time: document.getElementById("elderReminderTime").value || "18:00",
          note: document.getElementById("elderReminderNote").value.trim() || "Call family and take medicine"
        }));
        renderReminder();
        UI.showToast("Reminder saved", "Local elder check-in reminder is ready for the demo.", "success");
      });
    }

    if (accessibilityToggle) {
      accessibilityToggle.addEventListener("click", function () {
        document.body.classList.toggle("elder-large-font");
        accessibilityToggle.textContent = document.body.classList.contains("elder-large-font") ? "Standard Font Mode" : "Large Font Mode";
      });
    }

    if (emergencyScreenButton) {
      emergencyScreenButton.addEventListener("click", function () {
        toggleFullscreen(emergencyOverlay, "elder-emergency-active");
      });
    }

    if (emergencyCloseButton) {
      emergencyCloseButton.addEventListener("click", function () {
        toggleFullscreen(emergencyOverlay, "elder-emergency-active");
      });
    }

    if (launchFastComplaint) {
      launchFastComplaint.addEventListener("click", function () {
        localStorage.setItem(elderPrefsKey, JSON.stringify({
          emergencyType: emergencyType ? emergencyType.value : "Medical emergency",
          livingAlonePriority: true,
          fastMode: true
        }));
        window.location.href = "./citizen-dashboard.html?desk=elder&supportMode=1";
      });
    }

    renderReminder();
  }
});
