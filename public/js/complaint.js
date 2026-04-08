document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const user = UI.requireRole();

  if (!user) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const complaintId = params.get("id");
  const chatForm = document.getElementById("chatForm");
  const statusForm = document.getElementById("statusForm");
  const assignmentForm = document.getElementById("assignmentForm");
  const proofForm = document.getElementById("proofForm");
  const statusSelect = document.getElementById("statusSelect");
  const departmentSelect = document.getElementById("departmentSelect");
  const officerInput = document.getElementById("officerInput");
  const feedbackCard = document.getElementById("citizenFeedbackCard");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackSummaryCard = document.getElementById("feedbackSummaryCard");
  const visibilityCard = document.getElementById("complaintVisibilityCard");
  const resolutionCenterCard = document.getElementById("resolutionCenterCard");
  const officerTrackingCard = document.getElementById("officerTrackingCard");
  const documentPackageCard = document.getElementById("documentPackageCard");

  function renderComplaint() {
    UI.mountHeader("complaint-detail");

    const complaint = complaintId ? App.getComplaintById(complaintId) : null;
    if (!complaint) {
      document.getElementById("complaintTitle").textContent = "Complaint not found or not accessible.";
      document.getElementById("complaintSummary").textContent = "Return to your dashboard and choose a valid complaint.";
      document.getElementById("chatWindow").innerHTML = '<div class="empty-state">No complaint data available.</div>';
      document.getElementById("adminActionCard").classList.add("hidden");
      return;
    }

    document.getElementById("complaintTitle").textContent = complaint.title;
    document.getElementById("complaintSummary").textContent = complaint.summary;
    document.getElementById("complaintBackLink").href = user.role === "admin"
      ? "./admin-dashboard.html"
      : user.citizenType === "women"
        ? "./women-support.html"
        : user.citizenType === "men"
          ? "./men-support.html"
          : user.citizenType === "elder"
            ? "./elder-support.html"
            : "./citizen-dashboard.html";
    document.getElementById("officerWorkflowLink").classList.toggle("hidden", user.role !== "admin");

    const officerProfile = App.getOfficerProfile(complaint.assignedOfficer, complaint.department);

    document.getElementById("complaintMetaStrip").innerHTML = [
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.id) + '</strong><span>Complaint ID</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.district || "Raipur") + '</strong><span>District</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.roadName || complaint.location) + '</strong><span>Road / street</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.ward) + '</strong><span>Ward</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.supportDeskTitle || "General civic desk") + '</strong><span>Support desk</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.department) + '</strong><span>Department</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(complaint.assignedOfficer) + '</strong><span>Assigned officer</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(String(complaint.priorityScore)) + '</strong><span>Priority score</span></div>',
      '<div class="meta-chip"><strong>' + UI.escapeHtml(UI.formatDate(complaint.createdAt, true)) + '</strong><span>Submitted</span></div>'
    ].join("");

    const timeline = complaint.timeline.slice().sort(function (left, right) {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });
    document.getElementById("complaintTimeline").innerHTML = timeline.map(function (item, index) {
      return [
        '<div class="timeline-item">',
        '  <span class="timeline-step">' + (index + 1) + "</span>",
        "  <div>",
        '    <h3>' + UI.escapeHtml(item.title) + "</h3>",
        '    <p>' + UI.escapeHtml(item.note) + "</p>",
        '    <small class="timeline-meta">' + UI.escapeHtml(UI.formatDate(item.createdAt, true)) + "</small>",
        "  </div>",
        "</div>"
      ].join("");
    }).join("");

    document.getElementById("complaintAiCard").innerHTML = [
      '<strong>' + UI.escapeHtml(complaint.category + " / " + complaint.priorityLabel + " / " + complaint.aiFeatures.emotionLabel) + "</strong>",
      '<p>' + UI.escapeHtml(complaint.aiReply) + "</p>",
      '<p>' + UI.escapeHtml("Citizen selected: " + (complaint.reportedCategory || "Let AI decide") + ". AI routed to " + complaint.department + ".") + "</p>",
      '<div class="meta-row">',
      UI.createBadge(complaint.category, "category"),
      UI.createBadge(complaint.priorityLabel, "priority"),
      UI.createBadge(complaint.sentiment, "sentiment"),
      UI.createBadge(complaint.status === "in_progress" ? "In Progress" : App.prettifyStatus(complaint.status), "status"),
      "</div>",
      complaint.duplicateOf ? '<p>Possible duplicate of <strong>' + UI.escapeHtml(complaint.duplicateOf) + "</strong>.</p>" : "",
      complaint.duplicateCount ? '<p>' + UI.escapeHtml(String(complaint.duplicateCount)) + " additional related complaints detected.</p>" : ""
    ].join("");

    document.getElementById("complaintAiDeepDive").innerHTML = [
      "<strong>Advanced validation layer</strong>",
      "<p>" + UI.escapeHtml("District: " + (complaint.district || "Raipur") + ". Road: " + (complaint.roadName || complaint.location)) + "</p>",
      "<p>" + UI.escapeHtml("Desk SLA: " + complaint.supportDeskWindowHours + "h under " + (complaint.supportDeskTitle || "General civic desk") + ".") + "</p>",
      "<p>" + UI.escapeHtml("Language: " + complaint.voiceLanguage + ". Suggested fix: " + complaint.suggestedSolution) + "</p>",
      "<p>" + UI.escapeHtml("Image verification: " + complaint.imageVerification.status + " (" + complaint.imageVerification.confidence + "% confidence). " + complaint.imageVerification.reason) + "</p>",
      "<p>" + UI.escapeHtml("Auto-escalation threshold: " + complaint.escalationWindowHours + "h. Current open time: " + complaint.responseHours + "h.") + "</p>",
      "<p>" + UI.escapeHtml("AI recommended this route because of issue keywords, urgency, desk type, district history, and similar past complaints.") + "</p>"
    ].join("");

    const slaWidth = Math.min(100, Math.max(6, complaint.slaProgress || 10));
    const nextAction = complaint.status === "resolved"
      ? "Citizen feedback collection"
      : complaint.status === "escalated"
        ? "Superior review and field intervention"
        : complaint.status === "in_progress"
          ? "Officer field update"
          : "Department acceptance";
    resolutionCenterCard.innerHTML = [
      "<strong>Resolution center</strong>",
      "<p>" + UI.escapeHtml("Track SLA, escalation path, field progress, and next action due.") + "</p>",
      '<div class="sla-progress"><div class="sla-progress-bar"><div class="sla-progress-fill" style="width:' + UI.escapeHtml(String(slaWidth)) + '%;"></div></div></div>',
      "<p>" + UI.escapeHtml("SLA progress: " + complaint.responseHours + "h elapsed out of " + complaint.escalationWindowHours + "h. Remaining: " + Math.max(0, complaint.escalationWindowHours - complaint.responseHours) + "h.") + "</p>",
      '<div class="metric-row">' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(nextAction) + '</strong><span>Next action due</span></div>' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.status === "resolved" ? "Closed" : complaint.status === "escalated" ? "Senior oversight" : "Operational") + '</strong><span>Current lane</span></div>' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.isOverdue ? "Red alert" : (complaint.escalationWindowHours - complaint.responseHours <= 4 ? "Amber watch" : "Green")) + '</strong><span>SLA alert</span></div>' +
      '</div>',
      '<div class="resolution-ladder">' +
      '<div class="resolution-rung is-active"><strong>1. Citizen intake</strong><p>Complaint received with AI analysis.</p></div>' +
      '<div class="resolution-rung' + (complaint.status !== "open" ? " is-active" : "") + '"><strong>2. Department assignment</strong><p>' + UI.escapeHtml(complaint.department + " / " + complaint.assignedOfficer) + '</p></div>' +
      '<div class="resolution-rung' + ((complaint.status === "in_progress" || complaint.status === "resolved" || complaint.status === "escalated") ? " is-active" : "") + '"><strong>3. Field action</strong><p>Officer action, proof logging, and citizen update.</p></div>' +
      '<div class="resolution-rung' + (complaint.status === "escalated" ? " is-active" : "") + '"><strong>4. Escalation ladder</strong><p>' + UI.escapeHtml(complaint.superiorContact ? complaint.superiorContact.name : "Superior contact not required") + '</p></div>' +
      '<div class="resolution-rung' + (complaint.status === "resolved" ? " is-active" : "") + '"><strong>5. Closure and feedback</strong><p>Proof of closure and citizen confirmation.</p></div>' +
      '</div>'
    ].join("");

    visibilityCard.innerHTML = [
      "<strong>Government action visibility</strong>",
      "<p>" + UI.escapeHtml("Community supporters: " + complaint.supportCount + ". Latest public actions are shown below.") + "</p>",
      "<p>" + UI.escapeHtml("Support desk: " + (complaint.supportDeskTitle || "General civic desk") + ". Superior escalation: " + (complaint.superiorContact ? complaint.superiorContact.name + " / " + complaint.superiorContact.email : "Not required for this desk") + ".") + "</p>",
      "<p>" + UI.escapeHtml("Last touched by: " + (complaint.messages.length ? complaint.messages[complaint.messages.length - 1].senderName : complaint.assignedOfficer) + ". Why moving: " + (complaint.status === "escalated" ? "SLA risk or urgent severity." : complaint.status === "in_progress" ? "Field action is active." : complaint.status === "resolved" ? "Closure confirmed." : "Awaiting department action.")) + "</p>",
      '<div class="meta-row">' + complaint.actionVisibility.map(function (item) {
        return UI.createBadge(item.title, "status");
      }).join("") + "</div>",
      (user.role === "citizen"
        ? '<div class="quick-actions"><button class="button button-secondary" type="button" id="complaintSupportButton">Support this issue (' + UI.escapeHtml(String(complaint.supportCount)) + ")</button></div>"
        : "")
    ].join("");

    officerTrackingCard.innerHTML = [
      "<strong>Officer tracking and escalation passport</strong>",
      "<p>" + UI.escapeHtml(complaint.status === "escalated"
        ? "This case is escalated. The assigned officer and escalation contact are shown below."
        : "Track the assigned officer and department contact details below.") + "</p>",
      '<div class="metric-row">',
      '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.assignedOfficer || "Pending") + '</strong><span>Assigned officer</span></div>',
      '<div class="metric-chip"><strong>' + UI.escapeHtml(officerProfile && officerProfile.role ? officerProfile.role : complaint.department) + '</strong><span>Officer role</span></div>',
      '<div class="metric-chip"><strong>' + UI.escapeHtml(officerProfile && officerProfile.district ? officerProfile.district : complaint.district) + '</strong><span>Officer district</span></div>',
      '<div class="metric-chip"><strong>' + UI.escapeHtml(complaint.status === "in_progress" ? "Field action live" : App.prettifyStatus(complaint.status)) + '</strong><span>Tracking state</span></div>',
      '</div>',
      '<div class="meta-row">',
      officerProfile && officerProfile.phone ? UI.createBadge(officerProfile.phone, "status") : "",
      officerProfile && officerProfile.email ? UI.createBadge(officerProfile.email, "status") : "",
      complaint.superiorContact ? UI.createBadge("Escalation to " + complaint.superiorContact.name, "priority") : "",
      '</div>',
      '<p>' + UI.escapeHtml("User tracking view: complaint timeline, status history, and officer path stay visible after escalation.") + "</p>"
    ].join("");

    documentPackageCard.innerHTML = [
      "<strong>Official document package</strong>",
      "<p>" + UI.escapeHtml("Use printable receipts, escalation notes, field summaries, and closure communication during the demo or after action.") + "</p>",
      '<div class="hero-actions">' +
      '<a class="button button-secondary" href="./token.html?id=' + encodeURIComponent(complaint.id) + '">Token Slip</a>' +
      '<a class="button button-ghost" href="./acknowledgment-certificate.html?id=' + encodeURIComponent(complaint.id) + '">Acknowledgment</a>' +
      "</div>" +
      '<div class="hero-actions">' +
      '<a class="button button-ghost" href="./resolution-summary.html?id=' + encodeURIComponent(complaint.id) + '">Resolution Summary</a>' +
      '<a class="button button-ghost" href="./officer-field-summary.html?id=' + encodeURIComponent(complaint.id) + '">Field Summary</a>' +
      "</div>" +
      '<div class="hero-actions">' +
      '<a class="button button-ghost" href="./escalation-note.html?id=' + encodeURIComponent(complaint.id) + '">Escalation Note</a>' +
      '<a class="button button-ghost" href="./closure-letter.html?id=' + encodeURIComponent(complaint.id) + '">Closure Letter</a>' +
      "</div>"
    ].join("");

    if (complaint.resolutionProofs && complaint.resolutionProofs.length) {
      documentPackageCard.innerHTML += [
        '<div class="glass-subcard" style="margin-top:12px;">',
        '<strong>Before / after proof gallery</strong>',
        complaint.imageData ? '<p>Before evidence</p><img src="' + UI.escapeHtml(complaint.imageData) + '" alt="Initial complaint evidence">' : "",
        '</div>'
      ].join("");
      documentPackageCard.innerHTML += complaint.resolutionProofs.map(function (item, index) {
        return [
          '<div class="glass-subcard" style="margin-top:12px;">',
          '<strong>' + UI.escapeHtml("After proof " + (index + 1) + " logged by " + item.officer) + '</strong>',
          '<p>' + UI.escapeHtml(item.note) + '</p>',
          item.imageData ? '<img src="' + UI.escapeHtml(item.imageData) + '" alt="Resolution proof">' : "",
          '<small class="timeline-meta">' + UI.escapeHtml(UI.formatDate(item.createdAt, true)) + '</small>',
          '</div>'
        ].join("");
      }).join("");
    }

    if (user.role === "admin") {
      officerTrackingCard.innerHTML += [
        '<div class="resolution-ladder">',
        '<div class="resolution-rung is-active"><strong>Officer field diary</strong><p>Field visit started -> geo-tag note -> proof uploaded -> citizen contacted -> visit completed.</p></div>',
        '</div>'
      ].join("");
    }

    const supportButton = document.getElementById("complaintSupportButton");
    if (supportButton) {
      supportButton.addEventListener("click", function () {
        const result = App.toggleCommunitySupport(complaint.id);
        if (!result.ok) {
          UI.showToast("Support failed", result.message, "error");
          return;
        }
        renderComplaint();
        UI.showToast("Support updated", "Community support was updated.", "success");
      });
    }

    const audioCard = document.getElementById("complaintAudioCard");
    if (complaint.audioData) {
      document.getElementById("complaintAudio").src = complaint.audioData;
      audioCard.classList.remove("hidden");
    } else {
      audioCard.classList.add("hidden");
    }

    const imageCard = document.getElementById("complaintImageCard");
    if (complaint.imageData) {
      document.getElementById("complaintImage").src = complaint.imageData;
      imageCard.classList.remove("hidden");
    } else {
      imageCard.classList.add("hidden");
    }

    const chatWindow = document.getElementById("chatWindow");
    if (!complaint.messages.length) {
      chatWindow.innerHTML = '<div class="empty-state">No conversation yet. Start the thread below.</div>';
    } else {
      chatWindow.innerHTML = complaint.messages.map(function (message) {
        const isOwn = message.senderId === user.id;
        return [
          '<div class="chat-row ' + (isOwn ? "is-own" : "") + '">',
          '  <div class="chat-bubble">',
          '    <strong>' + UI.escapeHtml(message.senderName) + " / " + UI.escapeHtml(message.senderRole) + "</strong>",
          '    <span>' + UI.escapeHtml(message.text) + "</span>",
          '    <time>' + UI.escapeHtml(UI.formatDate(message.createdAt, true)) + "</time>",
          "  </div>",
          "</div>"
        ].join("");
      }).join("");
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    UI.populateSelect(statusSelect, App.constants.statuses.filter(function (item) {
      return item.value !== "all";
    }), complaint.status);
    UI.populateSelect(departmentSelect, App.constants.departments, complaint.department);
    officerInput.value = complaint.assignedOfficer || "";

    document.getElementById("adminActionCard").classList.toggle("hidden", user.role !== "admin");
    feedbackCard.classList.toggle("hidden", !(user.role === "citizen" && complaint.status === "resolved"));

    if (complaint.citizenFeedback) {
      feedbackSummaryCard.classList.remove("hidden");
      feedbackSummaryCard.innerHTML = [
        "<strong>Citizen feedback received</strong>",
        "<p>" + UI.escapeHtml("Rating: " + complaint.citizenFeedback.rating + "/5") + "</p>",
        complaint.citizenFeedback.note ? "<p>" + UI.escapeHtml(complaint.citizenFeedback.note) + "</p>" : "",
        "<p>" + UI.escapeHtml("Submitted on " + UI.formatDate(complaint.citizenFeedback.createdAt, true)) + "</p>"
      ].join("");
      if (feedbackForm) {
        feedbackForm.classList.add("hidden");
      }
    } else if (feedbackForm) {
      feedbackSummaryCard.classList.add("hidden");
      feedbackSummaryCard.innerHTML = "";
      feedbackForm.classList.remove("hidden");
    }
  }

  function handleChatSubmit(event) {
    event.preventDefault();
    const messageField = document.getElementById("chatMessage");
    const result = App.addMessage(complaintId, messageField.value);
    if (!result.ok) {
      UI.showToast("Message failed", result.message, "error");
      return;
    }
    messageField.value = "";
    renderComplaint();
    UI.showToast("Message sent", "The conversation was updated.", "success");
  }

  function handleStatusSubmit(event) {
    event.preventDefault();
    const note = document.getElementById("statusNote").value;
    const result = App.updateComplaintStatus(complaintId, statusSelect.value, note);
    if (!result.ok) {
      UI.showToast("Status update failed", result.message, "error");
      return;
    }
    document.getElementById("statusNote").value = "";
    renderComplaint();
    UI.showToast("Status updated", "Complaint moved to " + App.prettifyStatus(statusSelect.value) + ".", "success");
  }

  function handleAssignmentSubmit(event) {
    event.preventDefault();
    const result = App.assignComplaint(complaintId, departmentSelect.value, officerInput.value.trim());
    if (!result.ok) {
      UI.showToast("Assignment failed", result.message, "error");
      return;
    }
    renderComplaint();
    UI.showToast("Assignment saved", "Officer and department details were updated.", "success");
  }

  async function handleProofSubmit(event) {
    event.preventDefault();
    let imageData = "";
    const proofFile = document.getElementById("proofImage").files && document.getElementById("proofImage").files[0];
    if (proofFile) {
      try {
        imageData = await App.readFileAsDataUrl(proofFile);
      } catch (error) {
        UI.showToast("Proof upload failed", "The proof image could not be read.", "error");
        return;
      }
    }
    const result = App.logComplaintProof(complaintId, {
      note: document.getElementById("proofNote").value,
      imageData: imageData
    });
    if (!result.ok) {
      UI.showToast("Proof logging failed", result.message, "error");
      return;
    }
    document.getElementById("proofNote").value = "";
    document.getElementById("proofImage").value = "";
    renderComplaint();
    UI.showToast("Proof logged", "Citizen-facing proof note was saved and notification added.", "success");
  }

  function handleFeedbackSubmit(event) {
    event.preventDefault();
    const result = App.submitCitizenFeedback(complaintId, {
      rating: document.getElementById("feedbackRating").value,
      note: document.getElementById("feedbackNote").value,
      confirmedResolved: true
    });

    if (!result.ok) {
      UI.showToast("Feedback failed", result.message, "error");
      return;
    }

    renderComplaint();
    UI.showToast("Feedback saved", "Citizen feedback has been added to the case.", "success");
  }

  chatForm.addEventListener("submit", handleChatSubmit);
  statusForm.addEventListener("submit", handleStatusSubmit);
  assignmentForm.addEventListener("submit", handleAssignmentSubmit);
  if (proofForm) {
    proofForm.addEventListener("submit", handleProofSubmit);
  }
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmit);
  }

  App.subscribe(renderComplaint);
  renderComplaint();
});
