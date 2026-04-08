document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const AI = window.NavDristiAI;
  const user = UI.requireRole("citizen");
  const params = new URLSearchParams(window.location.search);
  const entryDesk = params.get("desk") || (user && user.citizenType !== "general" ? user.citizenType : "");
  const supportMode = params.get("supportMode") === "1" || (user && user.citizenType === "women") || (user && user.citizenType === "men") || (user && user.citizenType === "elder");

  if (!user) {
    return;
  }

  const complaintForm = document.getElementById("complaintForm");
  const complaintCategory = document.getElementById("complaintCategory");
  const complaintDesk = document.getElementById("complaintDesk");
  const complaintMode = document.getElementById("complaintMode");
  const complaintDistrict = document.getElementById("complaintDistrict");
  const wardSelect = document.getElementById("complaintWard");
  const searchFilter = document.getElementById("citizenSearchFilter");
  const statusFilter = document.getElementById("citizenStatusFilter");
  const districtFilter = document.getElementById("citizenDistrictFilter");
  const categoryFilter = document.getElementById("citizenCategoryFilter");
  const priorityFilter = document.getElementById("citizenPriorityFilter");
  const dateFilter = document.getElementById("citizenDateFilter");
  const imageInput = document.getElementById("complaintImage");
  const imageFieldGroup = imageInput.closest(".form-group");
  const previewWrap = document.getElementById("imagePreviewWrap");
  const previewImage = document.getElementById("imagePreview");
  const aiPreviewCard = document.getElementById("aiPreviewCard");
  const imageVerificationCard = document.getElementById("imageVerificationCard");
  const voiceLanguageSelect = document.getElementById("voiceLanguageSelect");
  const voiceStartButton = document.getElementById("voiceStartButton");
  const voiceUseTranscriptButton = document.getElementById("voiceUseTranscriptButton");
  const voiceTranscriptCard = document.getElementById("voiceTranscriptCard");
  const voiceStatus = document.getElementById("voiceStatus");
  const voiceSectionCard = voiceLanguageSelect.closest(".glass-subcard");
  const audioRecordButton = document.getElementById("audioRecordButton");
  const audioStopButton = document.getElementById("audioStopButton");
  const audioTranscribeButton = document.getElementById("audioTranscribeButton");
  const audioClearButton = document.getElementById("audioClearButton");
  const audioStatus = document.getElementById("audioStatus");
  const audioPreviewCard = document.getElementById("audioPreviewCard");
  const audioPreview = document.getElementById("audioPreview");
  const audioSectionCard = audioRecordButton.closest(".glass-subcard");
  const assistantTitle = document.getElementById("assistantTitle");
  const assistantResponse = document.getElementById("assistantResponse");
  const assistantStatus = document.getElementById("assistantStatus");
  const assistantTranscriptCard = document.getElementById("assistantTranscriptCard");
  const assistantListenButton = document.getElementById("assistantListenButton");
  const assistantSpeakButton = document.getElementById("assistantSpeakButton");
  const assistantStopButton = document.getElementById("assistantStopButton");
  const journeySteps = document.getElementById("citizenJourneySteps");
  const complaintWizardSteps = document.getElementById("complaintWizardSteps");
  const aiProofBoard = document.getElementById("citizenAiProofBoard");
  const complaintPriorityHint = document.getElementById("complaintPriorityHint");
  const womenSupportCard = document.getElementById("womenSupportCard");
  const menSupportCard = document.getElementById("menSupportCard");
  const offlineDraftCard = document.getElementById("offlineDraftCard");
  const templateGrid = document.getElementById("complaintTemplateGrid");
  const saveDraftButton = document.getElementById("saveDraftButton");
  const clearDraftButton = document.getElementById("clearDraftButton");
  const documentServiceList = document.getElementById("documentServiceList");
  const topDepartmentList = document.getElementById("topDepartmentList");
  const complaintReceiptCard = document.getElementById("complaintReceiptCard");
  const complaintHistoryBoard = document.getElementById("complaintHistoryBoard");
  const districtDirectory = App.getDistrictDirectory();
  const complaintTemplates = App.getComplaintTemplates ? App.getComplaintTemplates() : [];
  const supportContacts = App.getSupportContacts();
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSynthesisApi = window.speechSynthesis;
  let imageData = "";
  let imageMeta = null;
  let voiceTranscript = "";
  let recognition = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let audioData = "";
  let audioMeta = null;
  let assistantRecognition = null;
  let lastAssistantReply = "Ask about complaint priority, routing, image verification, or your latest complaint.";
  const draftKey = "navdristi-complaint-draft-" + user.id;
  const syncQueueKey = "navdristi-sync-queue-" + user.id;
  const womenPrefillKey = "navdristi-women-prefill";
  const elderPrefillKey = "navdristi-elder-prefill";

  function renderWizardSteps() {
    const currentStep = !document.getElementById("complaintTitle").value.trim() && !document.getElementById("complaintDescription").value.trim()
      ? 1
      : !complaintDesk.value || !complaintCategory.value
        ? 2
        : !document.getElementById("complaintLocation").value.trim()
          ? 3
          : !document.getElementById("complaintDescription").value.trim()
            ? 4
            : 5;

    complaintWizardSteps.innerHTML = [
      "Choose issue",
      "Choose beneficiary",
      "Add location and evidence",
      "AI review",
      "Receipt and submit"
    ].map(function (label, index) {
      const step = index + 1;
      const className = step === currentStep ? "wizard-step is-active" : step < currentStep ? "wizard-step is-complete" : "wizard-step";
      return '<article class="' + className + '"><span>Step ' + step + '</span><strong>' + UI.escapeHtml(label) + "</strong></article>";
    }).join("");
  }

  function getPreviewPayload() {
    const location = document.getElementById("complaintLocation").value.trim();
    const roadName = document.getElementById("complaintRoad").value.trim();
    const landmark = document.getElementById("complaintLandmark").value.trim();
    return {
      title: document.getElementById("complaintTitle").value.trim() || "Complaint",
      location: [roadName, location, landmark, complaintDistrict.value].filter(Boolean).join(", ") || user.ward,
      description: document.getElementById("complaintDescription").value.trim() || "Issue reported",
      issueDesk: complaintDesk.value,
      reportedCategory: complaintCategory.value,
      district: complaintDistrict.value,
      roadName: roadName,
      ward: wardSelect.value,
      imageData: imageData,
      imageMeta: imageMeta,
      audioData: audioData,
      audioMeta: audioMeta,
      voiceLanguage: voiceLanguageSelect.value,
      voiceTranscript: voiceTranscript
    };
  }

  function renderAudioCard() {
    if (!audioData) {
      audioPreviewCard.classList.add("hidden");
      return;
    }
    audioPreview.src = audioData;
    audioPreviewCard.classList.remove("hidden");
  }

  function renderVoiceCard() {
    if (!voiceTranscript) {
      voiceTranscriptCard.innerHTML = "<p>Record a complaint and the transcript will appear here.</p>";
      return;
    }

    voiceTranscriptCard.innerHTML = [
      "<strong>Transcript ready</strong>",
      "<p>" + UI.escapeHtml(voiceTranscript) + "</p>",
      '<div class="meta-row">',
      UI.createBadge(voiceLanguageSelect.options[voiceLanguageSelect.selectedIndex].text, "status"),
      UI.createBadge("Voice captured", "category"),
      "</div>"
    ].join("");
  }

  function renderAssistantCard(question, reply) {
    assistantTitle.textContent = reply.title;
    assistantResponse.textContent = reply.answer;
    assistantTranscriptCard.innerHTML = [
      "<strong>" + UI.escapeHtml(question || "Voice assistant ready") + "</strong>",
      "<p>" + UI.escapeHtml(reply.answer) + "</p>"
    ].join("");
    lastAssistantReply = reply.answer;
  }

  function speakAssistant(text) {
    if (!text) {
      return;
    }
    if (AI && AI.isConfigured()) {
      AI.speakText(text).catch(function () {
        if (speechSynthesisApi) {
          speechSynthesisApi.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = voiceLanguageSelect.value || "en-IN";
          speechSynthesisApi.speak(utterance);
        }
      });
      return;
    }
    if (!speechSynthesisApi) {
      return;
    }
    speechSynthesisApi.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLanguageSelect.value || "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesisApi.speak(utterance);
  }

  async function askAssistant(question, shouldSpeak) {
    if (AI && AI.isConfigured()) {
      try {
        assistantStatus.textContent = "Real AI is preparing a reply...";
        const latestComplaint = App.getComplaints({ includeAll: false })[0];
        const context = latestComplaint
          ? "User: " + user.name + ". Latest complaint: " + latestComplaint.title + ". Status: " + latestComplaint.status + ". Department: " + latestComplaint.department + "."
          : "User: " + user.name + ". No recent complaint found.";
        const answer = await AI.generateReply(question, context);
        renderAssistantCard(question, {
          title: "Nav Dristi AI reply",
          answer: answer
        });
        assistantStatus.textContent = "Real AI answered through the configured API.";
        if (shouldSpeak !== false) {
          speakAssistant(answer);
        }
        return;
      } catch (error) {
        assistantStatus.textContent = "Real AI failed, so the local assistant answered instead.";
      }
    }

    const reply = App.getVoiceAssistantReply(question, {
      userId: user.id,
      includeAll: false
    });
    renderAssistantCard(question, reply);
    assistantStatus.textContent = "AI answered your question in real time.";
    if (shouldSpeak !== false) {
      speakAssistant(reply.answer);
    }
  }

  function renderAiPreview() {
    const rawTitle = document.getElementById("complaintTitle").value.trim();
    const rawDescription = document.getElementById("complaintDescription").value.trim();
    const payload = getPreviewPayload();

    if (!rawTitle && !rawDescription && !voiceTranscript) {
      aiProofBoard.innerHTML = [
        '<article class="proof-tile"><span>Support desk</span><strong>' + UI.escapeHtml(complaintDesk.options[complaintDesk.selectedIndex].text) + "</strong></article>",
        '<article class="proof-tile"><span>AI classified</span><strong>Waiting for details</strong></article>',
        '<article class="proof-tile"><span>Priority</span><strong>Not scored yet</strong></article>',
        '<article class="proof-tile"><span>Route to</span><strong>Pending input</strong></article>'
      ].join("");
      aiPreviewCard.innerHTML = "<p>Add details and Nav Dristi AI will suggest a category, priority, and department.</p>";
      imageVerificationCard.innerHTML = "<strong>Image verification</strong><p>Add an image to verify whether the evidence appears original, reused, or low confidence.</p>";
      renderWizardSteps();
      return;
    }

    const preview = App.previewComplaint(payload);

    aiProofBoard.innerHTML = [
      '<article class="proof-tile"><span>Support desk</span><strong>' + UI.escapeHtml(complaintDesk.options[complaintDesk.selectedIndex].text) + "</strong></article>",
      '<article class="proof-tile"><span>AI classified</span><strong>' + UI.escapeHtml(preview.category) + "</strong></article>",
      '<article class="proof-tile"><span>Priority</span><strong>' + UI.escapeHtml(preview.priorityLabel + " (" + preview.priorityScore + ")") + "</strong></article>",
      '<article class="proof-tile"><span>Route to</span><strong>' + UI.escapeHtml(preview.department) + "</strong></article>"
    ].join("");

    aiPreviewCard.innerHTML = [
      "<strong>" + UI.escapeHtml(preview.category + " / " + preview.priorityLabel + " / " + preview.emotionLabel) + "</strong>",
      "<p>" + UI.escapeHtml(preview.summary) + "</p>",
      "<p>" + UI.escapeHtml(preview.suggestedSolution) + "</p>",
      "<p>" + UI.escapeHtml("AI proof: classified because of complaint words, urgency cues, location context, and department similarity from past cases.") + "</p>",
      '<div class="meta-row">',
      UI.createBadge(preview.sentiment, "sentiment"),
      UI.createBadge(preview.department, "category"),
      UI.createBadge(preview.detectedLanguage, "status"),
      UI.createBadge(String(preview.duplicateCandidates.length) + " duplicate hints", "status"),
      UI.createBadge(preview.supportDeskWindowHours + "h desk SLA", "priority"),
      "</div>"
    ].join("");

    imageVerificationCard.innerHTML = [
      "<strong>Image verification: " + UI.escapeHtml(preview.imageVerification.status) + "</strong>",
      "<p>" + UI.escapeHtml(preview.imageVerification.reason) + "</p>",
      "<p>" + UI.escapeHtml("Why priority rose: severity words, support desk SLA, vulnerable beneficiary mode, and public safety signals.") + "</p>",
      '<div class="meta-row">',
      UI.createBadge(preview.imageVerification.confidence + "% confidence", "status"),
      UI.createBadge("Auto-escalate in " + preview.escalationWindowHours + "h", "priority"),
      "</div>"
    ].join("");
    renderWizardSteps();
  }

  function renderSupportDesks() {
    womenSupportCard.innerHTML = [
      "<strong>" + UI.escapeHtml(supportContacts.women.title) + "</strong>",
      "<p>" + UI.escapeHtml("Toll-free: " + supportContacts.women.tollFree + " / Other: " + supportContacts.women.phone) + "</p>",
      '<p><a href="mailto:' + UI.escapeHtml(supportContacts.women.email) + '">' + UI.escapeHtml(supportContacts.women.email) + "</a></p>",
      "<p>" + UI.escapeHtml("Complaints covered: " + supportContacts.women.issues.join(", ")) + "</p>",
      '<div class="meta-row">' +
      UI.createBadge("1h fast-track", "priority") +
      UI.createBadge("Auto-mail to superior", "status") +
      "</div>"
    ].join("");

    menSupportCard.innerHTML = [
      "<strong>" + UI.escapeHtml(supportContacts.men.title) + "</strong>",
      "<p>" + UI.escapeHtml("Toll-free: " + supportContacts.men.tollFree + " / Other: " + supportContacts.men.phone) + "</p>",
      '<p><a href="mailto:' + UI.escapeHtml(supportContacts.men.email) + '">' + UI.escapeHtml(supportContacts.men.email) + "</a></p>",
      "<p>" + UI.escapeHtml("Complaints covered: " + supportContacts.men.issues.join(", ")) + "</p>",
      '<div class="meta-row">' +
      UI.createBadge(supportContacts.men.supportWindowHours + "h response desk", "priority") +
      UI.createBadge("Separate support path", "status") +
      "</div>"
    ].join("");
  }

  function applyTemplate(template) {
    if (!template) {
      return;
    }
    document.getElementById("complaintTitle").value = template.title;
    document.getElementById("complaintDescription").value = template.description;
    complaintDesk.value = template.issueDesk;
    complaintCategory.value = template.category;
    if (complaintMode) {
      complaintMode.value = template.mode || "all";
    }
    document.getElementById("complaintLocation").focus();
    updatePriorityHint();
    applyComplaintMode();
    renderAiPreview();
    saveDraft();
  }

  function renderTemplateGrid() {
    if (!templateGrid) {
      return;
    }
    templateGrid.innerHTML = complaintTemplates.map(function (template) {
      return '<article class="glass-subcard"><strong>' + UI.escapeHtml(template.title) + '</strong><p>' + UI.escapeHtml(template.hint) + '</p><div class="hero-actions"><button class="button button-secondary" type="button" data-template-id="' + UI.escapeHtml(template.id) + '">Use Template</button></div></article>';
    }).join("");

    templateGrid.querySelectorAll("[data-template-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        const template = complaintTemplates.find(function (item) {
          return item.id === button.getAttribute("data-template-id");
        });
        applyTemplate(template);
      });
    });
  }

  function getSyncQueue() {
    try {
      return JSON.parse(localStorage.getItem(syncQueueKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function setSyncQueue(items) {
    localStorage.setItem(syncQueueKey, JSON.stringify(items || []));
  }

  function renderOfflineDraftState(message, draft) {
    const queued = getSyncQueue();
    const savedAt = draft && draft.savedAt ? UI.formatDate(draft.savedAt, true) : "Not saved yet";
    offlineDraftCard.classList.remove("hidden");
    offlineDraftCard.innerHTML = [
      "<strong>Offline and low-connectivity support</strong>",
      "<p>" + UI.escapeHtml(message) + "</p>",
      '<div class="metric-row">' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(savedAt) + '</strong><span>Saved locally at</span></div>' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(String(queued.length)) + '</strong><span>Retry queue</span></div>' +
      '<div class="metric-chip"><strong>' + UI.escapeHtml(navigator.onLine ? "Synced" : "Pending sync") + '</strong><span>Draft sync status</span></div>' +
      "</div>",
      '<div class="meta-row">' +
      UI.createBadge(navigator.onLine ? "Online now" : "Offline mode", "status") +
      UI.createBadge("Local draft protection", "category") +
      UI.createBadge(queued.length ? "Queued for retry" : "No queued drafts", "priority") +
      "</div>"
    ].join("");
  }

  function saveDraft() {
    const draft = {
      title: document.getElementById("complaintTitle").value,
      issueDesk: complaintDesk.value,
      reportedCategory: complaintCategory.value,
      complaintMode: complaintMode ? complaintMode.value : "all",
      district: complaintDistrict.value,
      ward: wardSelect.value,
      templateId: "",
      roadName: document.getElementById("complaintRoad").value,
      landmark: document.getElementById("complaintLandmark").value,
      location: document.getElementById("complaintLocation").value,
      description: document.getElementById("complaintDescription").value,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    if (!navigator.onLine) {
      setSyncQueue([{
        id: draftKey,
        savedAt: draft.savedAt,
        type: "complaint-draft"
      }]);
    }
    renderOfflineDraftState("Complaint draft is being saved locally for low-connectivity or interrupted sessions.", draft);
  }

  function loadDraft() {
    const raw = localStorage.getItem(draftKey);
    if (!raw) {
      if (!navigator.onLine) {
        renderOfflineDraftState("You are offline. Start filling the complaint and Nav Dristi will keep the draft in this browser.");
      }
      return;
    }
    try {
      const draft = JSON.parse(raw);
      document.getElementById("complaintTitle").value = draft.title || "";
      complaintDesk.value = draft.issueDesk || complaintDesk.value;
      complaintCategory.value = draft.reportedCategory || complaintCategory.value;
      if (complaintMode) {
        complaintMode.value = draft.complaintMode || "all";
      }
      complaintDistrict.value = draft.district || complaintDistrict.value;
      wardSelect.value = draft.ward || wardSelect.value;
      document.getElementById("complaintRoad").value = draft.roadName || "";
      document.getElementById("complaintLandmark").value = draft.landmark || "";
      document.getElementById("complaintLocation").value = draft.location || "";
      document.getElementById("complaintDescription").value = draft.description || "";
      renderOfflineDraftState("Recovered your saved complaint draft from local storage.", draft);
    } catch (error) {
      localStorage.removeItem(draftKey);
    }
  }

  function clearDraft() {
    localStorage.removeItem(draftKey);
    complaintForm.reset();
    complaintDesk.value = supportMode ? complaintDesk.value : "general";
    complaintCategory.value = supportMode ? "Safety" : "";
    complaintDistrict.value = user.district || "Raipur";
    wardSelect.value = user.ward;
    imageData = "";
    imageMeta = null;
    voiceTranscript = "";
    clearAudioRecording();
    previewWrap.classList.add("hidden");
    previewImage.removeAttribute("src");
    renderOfflineDraftState("Draft cleared. You can start a fresh complaint now.");
    renderAiPreview();
  }

  function updatePriorityHint() {
    if (complaintMode && complaintMode.value === "emergency") {
      complaintPriorityHint.value = "Emergency mode raises priority for urgent safety, health, and welfare complaints.";
      return;
    }
    if (complaintDesk.value === "women") {
      complaintPriorityHint.value = "Women support complaints auto-escalate after 1 hour and notify the superior.";
      return;
    }
    if (complaintDesk.value === "men") {
      complaintPriorityHint.value = "Men support complaints follow a separate response desk with direct routing.";
      return;
    }
    if (complaintDesk.value === "child") {
      complaintPriorityHint.value = "Missing child and child rescue complaints route to the child protection desk with emergency priority.";
      return;
    }
    if (complaintDesk.value === "elder") {
      complaintPriorityHint.value = "Elder emergency complaints trigger urgent welfare and medical support handling.";
      return;
    }
    complaintPriorityHint.value = "General civic complaints are routed by AI based on issue type and urgency.";
  }

  function applyComplaintMode() {
    if (!complaintMode) {
      return;
    }

    const mode = complaintMode.value;
    if (voiceSectionCard) {
      voiceSectionCard.classList.toggle("hidden", mode !== "all" && mode !== "voice");
    }
    if (audioSectionCard) {
      audioSectionCard.classList.toggle("hidden", mode !== "all" && mode !== "audio");
    }
    if (imageFieldGroup) {
      imageFieldGroup.classList.toggle("hidden", mode !== "all" && mode !== "image");
    }
    if (mode === "emergency") {
      complaintCategory.value = "Safety";
    }
  }

  function applySupportMode() {
    if (!supportMode) {
      return;
    }

    complaintDesk.value = entryDesk === "women" ? "women" : entryDesk === "elder" ? "elder" : entryDesk === "child" ? "child" : "men";
    UI.populateSelect(complaintCategory, [
      { value: "Safety", label: "Safety / Abuse / Harassment" }
    ], "Safety");
    complaintCategory.value = "Safety";
    if (complaintMode) {
      complaintMode.value = entryDesk === "elder" ? "emergency" : "all";
    }

    if (entryDesk === "women") {
      try {
        const womenPrefs = JSON.parse(localStorage.getItem(womenPrefillKey) || "{}");
        if (womenPrefs.district) {
          complaintDistrict.value = womenPrefs.district;
        }
        if (womenPrefs.privateMode) {
          document.getElementById("complaintTitle").value = "Private women safety complaint";
        }
        if (womenPrefs.severity) {
          document.getElementById("complaintDescription").value = "Severity selected: " + womenPrefs.severity + ". Please add safe details for harassment, abuse, or emergency threat.";
        }
      } catch (error) {
        // Ignore invalid saved preferences.
      }
    }

    if (entryDesk === "elder") {
      try {
        const elderPrefs = JSON.parse(localStorage.getItem(elderPrefillKey) || "{}");
        if (elderPrefs.fastMode) {
          document.getElementById("complaintTitle").value = elderPrefs.emergencyType || "Senior citizen emergency";
          document.getElementById("complaintDescription").value = "Living alone priority emergency. Please dispatch elder welfare or medical support.";
        }
      } catch (error) {
        // Ignore invalid saved preferences.
      }
    }
  }

  function renderDashboard() {
    UI.mountHeader("citizen-dashboard");
    document.getElementById("citizenWelcome").textContent = supportMode
      ? (entryDesk === "women"
          ? "Welcome, " + user.name + ". This women section is for abuse and harassment complaints."
          : entryDesk === "elder"
            ? "Welcome, " + user.name + ". This elder section is for emergency and welfare complaints."
            : entryDesk === "child"
              ? "Welcome, " + user.name + ". This child rescue section is for missing child and protection emergencies."
            : "Welcome, " + user.name + ". This male section is for abuse, threat, and harassment complaints.")
      : "Welcome back, " + user.name + ".";

    const metrics = App.getCitizenMetrics(user.id);
    UI.renderStatGrid(document.getElementById("citizenStats"), [
      { label: "Total complaints", value: String(metrics.total), helper: "Your submitted issues" },
      { label: "Open / in progress", value: String(metrics.open), helper: "Awaiting full closure" },
      { label: "Resolved", value: String(metrics.resolved), helper: "Successfully closed" },
      { label: "Escalated", value: String(metrics.escalated), helper: "Fast attention queue" }
    ]);

    let complaints = App.getComplaints({
      status: statusFilter.value || "all"
    });
    const complaintList = document.getElementById("citizenComplaintList");
    const searchText = String(searchFilter.value || "").toLowerCase();
    const selectedDistrict = districtFilter.value || "all";
    const selectedCategory = categoryFilter.value || "all";
    const selectedPriority = priorityFilter.value || "all";
    const selectedDateWindow = Number(dateFilter.value || "0");

    complaints = complaints.filter(function (complaint) {
      const matchesSearch = !searchText || [complaint.id, complaint.title, complaint.district, complaint.roadName, complaint.department, complaint.assignedOfficer].join(" ").toLowerCase().indexOf(searchText) !== -1;
      const matchesDistrict = selectedDistrict === "all" || complaint.district === selectedDistrict;
      const matchesCategory = selectedCategory === "all" || complaint.category === selectedCategory;
      const matchesPriority = selectedPriority === "all" || complaint.priorityLabel.toLowerCase() === selectedPriority;
      const matchesDate = !selectedDateWindow || ((Date.now() - new Date(complaint.createdAt).getTime()) <= selectedDateWindow * 24 * 60 * 60 * 1000);
      return matchesSearch && matchesDistrict && matchesCategory && matchesPriority && matchesDate;
    });

    journeySteps.innerHTML = [
      {
        step: "1",
        title: "Submit complaint",
        body: "Fill the visible form with title, category, ward, location, details, and evidence."
      },
      {
        step: "2",
        title: "AI explains the route",
        body: "Nav Dristi shows category, priority, duplicate hints, and suggested department instantly."
      },
      {
        step: "3",
        title: "Track and rate closure",
        body: "Watch status updates, officer movement, escalation, and give feedback after resolution."
      }
    ].map(function (item) {
      return '<article class="journey-step"><span class="journey-step-number">' + item.step + '</span><div><strong>' + UI.escapeHtml(item.title) + '</strong><p>' + UI.escapeHtml(item.body) + "</p></div></article>";
    }).join("");

    if (!complaints.length) {
      UI.renderEmptyState(complaintList, "No complaints match this filter yet.");
      return;
    }

    complaintList.innerHTML = complaints.map(function (complaint) {
      return UI.complaintCard(complaint, { linkLabel: "Track Complaint", showSupportButton: true });
    }).join("");

    complaintList.querySelectorAll("[data-support-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = App.toggleCommunitySupport(button.getAttribute("data-support-id"));
        if (!result.ok) {
          UI.showToast("Support failed", result.message, "error");
          return;
        }
        UI.showToast("Support updated", "Community visibility was updated for this complaint.", "success");
        renderDashboard();
      });
    });

    complaintHistoryBoard.innerHTML = App.getComplaints({}).slice().sort(function (left, right) {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }).map(function (complaint) {
      return '<article class="stack-item"><h3>' + UI.escapeHtml(complaint.id + " / " + complaint.title) + '</h3><p>' + UI.escapeHtml(App.prettifyStatus(complaint.status) + " / " + complaint.district + " / " + complaint.department) + '</p><small>' + UI.escapeHtml("Rating: " + (complaint.citizenFeedback ? complaint.citizenFeedback.rating + "/5" : "Pending") + " / SLA " + complaint.escalationWindowHours + "h / Open " + complaint.responseHours + "h") + '</small></article>';
    }).join("") || '<div class="empty-state">No complaint history yet.</div>';
  }

  function renderServiceDirectory() {
    const directory = App.getPublicServiceDirectory();
    documentServiceList.innerHTML = directory.documentServices.map(function (item) {
      return '<article class="stack-item compact-item"><h3>' + UI.escapeHtml(item.title) + '</h3><p>' + UI.escapeHtml(item.service) + '</p><small>' + UI.escapeHtml(item.area) + '</small></article>';
    }).join("");
    topDepartmentList.innerHTML = directory.topDepartments.map(function (item) {
      return '<article class="stack-item compact-item"><h3>' + UI.escapeHtml(item.title) + '</h3><p>' + UI.escapeHtml(item.summary) + "</p></article>";
    }).join("");
  }

  function suggestRoadForDistrict() {
    const district = districtDirectory.find(function (item) {
      return item.name === complaintDistrict.value;
    });
    const roadInput = document.getElementById("complaintRoad");
    if (district && district.roads && district.roads.length && !roadInput.value.trim()) {
      roadInput.value = district.roads[0];
      renderAiPreview();
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      imageData = "";
      imageMeta = null;
      previewWrap.classList.add("hidden");
      renderAiPreview();
      return;
    }

    try {
      imageData = await App.readFileAsDataUrl(file);
      imageMeta = {
        name: file.name,
        size: file.size,
        type: file.type
      };
      previewImage.src = imageData;
      previewWrap.classList.remove("hidden");
      renderAiPreview();
    } catch (error) {
      UI.showToast("Image error", "Could not load the selected image.", "error");
    }
  }

  async function startAudioRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      UI.showToast("Recording unavailable", "This browser does not support audio recording for the demo.", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.addEventListener("dataavailable", function (event) {
        if (event.data && event.data.size) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", async function () {
        const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        audioData = await App.readBlobAsDataUrl(blob);
        audioMeta = {
          type: blob.type || "audio/webm",
          size: blob.size
        };
        renderAudioCard();
        audioStatus.textContent = "Audio recording attached and ready for submission.";
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
      });

      mediaRecorder.start();
      audioStatus.textContent = "Recording audio evidence...";
    } catch (error) {
      UI.showToast("Recording failed", "Microphone access was denied or unavailable.", "error");
    }
  }

  function stopAudioRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      return;
    }
    audioStatus.textContent = "No active audio recording to stop.";
  }

  function clearAudioRecording() {
    audioData = "";
    audioMeta = null;
    audioChunks = [];
    audioPreview.removeAttribute("src");
    audioPreviewCard.classList.add("hidden");
    audioStatus.textContent = "Audio recording cleared.";
  }

  async function transcribeRecordedAudio() {
    if (!audioData) {
      UI.showToast("No recording", "Record audio first, then transcribe it with AI.", "error");
      return;
    }
    if (!AI || !AI.isConfigured()) {
      UI.showToast("AI not configured", "Open Settings and add your API key to use speech-to-text.", "error");
      return;
    }

    try {
      audioStatus.textContent = "AI is transcribing the recording...";
      voiceTranscript = await AI.transcribeAudioDataUrl(audioData);
      renderVoiceCard();
      renderAiPreview();
      audioStatus.textContent = "Audio recording transcribed successfully.";
      UI.showToast("Transcript ready", "The recording was converted into complaint text.", "success");
    } catch (error) {
      audioStatus.textContent = "Speech-to-text failed for this recording.";
      UI.showToast("Transcription failed", error.message || "Speech-to-text could not complete.", "error");
    }
  }

  function handleUseTranscript() {
    if (!voiceTranscript) {
      UI.showToast("No transcript", "Record a voice complaint first.", "error");
      return;
    }

    const descriptionField = document.getElementById("complaintDescription");
    if (!descriptionField.value.trim()) {
      descriptionField.value = voiceTranscript;
    } else if (!descriptionField.value.includes(voiceTranscript)) {
      descriptionField.value += "\n" + voiceTranscript;
    }
    renderAiPreview();
    UI.showToast("Transcript inserted", "Your voice complaint was added to the description.", "success");
  }

  function startVoiceInput() {
    if (!SpeechRecognition) {
      UI.showToast("Voice unavailable", "This browser does not support speech recognition for the demo.", "error");
      return;
    }

    if (recognition) {
      recognition.stop();
    }

    recognition = new SpeechRecognition();
    recognition.lang = voiceLanguageSelect.value;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      voiceStatus.textContent = "Listening for your complaint...";
    };

    recognition.onresult = function (event) {
      voiceTranscript = Array.from(event.results).map(function (result) {
        return result[0].transcript;
      }).join(" ").trim();
      renderVoiceCard();
      renderAiPreview();
    };

    recognition.onerror = function () {
      voiceStatus.textContent = "Voice recognition failed. You can still type the complaint manually.";
    };

    recognition.onend = function () {
      voiceStatus.textContent = voiceTranscript
        ? "Voice transcript captured. Review it and insert it into the complaint."
        : "Voice input stopped. Try again if nothing was captured.";
    };

    recognition.start();
  }

  function startAssistantListening() {
    if (!SpeechRecognition) {
      UI.showToast("Voice unavailable", "This browser does not support live AI talk for the demo.", "error");
      return;
    }

    if (assistantRecognition) {
      assistantRecognition.stop();
    }

    assistantRecognition = new SpeechRecognition();
    assistantRecognition.lang = voiceLanguageSelect.value;
    assistantRecognition.interimResults = false;
    assistantRecognition.maxAlternatives = 1;

    assistantRecognition.onstart = function () {
      assistantStatus.textContent = "Listening for your question...";
    };

    assistantRecognition.onresult = function (event) {
      const question = Array.from(event.results).map(function (result) {
        return result[0].transcript;
      }).join(" ").trim();
      askAssistant(question, true);
    };

    assistantRecognition.onerror = function () {
      assistantStatus.textContent = "Live AI talk could not capture your question.";
    };

    assistantRecognition.onend = function () {
      if (assistantStatus.textContent === "Listening for your question...") {
        assistantStatus.textContent = "Voice assistant stopped listening.";
      }
    };

    assistantRecognition.start();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(complaintForm);
    let womenPrefs = {};
    let elderPrefs = {};
    try {
      womenPrefs = JSON.parse(localStorage.getItem(womenPrefillKey) || "{}");
      elderPrefs = JSON.parse(localStorage.getItem(elderPrefillKey) || "{}");
    } catch (error) {
      womenPrefs = {};
      elderPrefs = {};
    }
    const result = App.submitComplaint({
      title: formData.get("title"),
      location: [formData.get("roadName"), formData.get("location"), formData.get("landmark"), formData.get("district")].filter(Boolean).join(", "),
      description: formData.get("description"),
      issueDesk: formData.get("issueDesk"),
      reportedCategory: formData.get("reportedCategory"),
      district: formData.get("district"),
      roadName: formData.get("roadName"),
      ward: formData.get("ward"),
      imageData: imageData,
      imageMeta: imageMeta,
      audioData: audioData,
      audioMeta: audioMeta,
      voiceLanguage: voiceLanguageSelect.value,
      voiceTranscript: voiceTranscript,
      incidentSeverity: womenPrefs.severity || "",
      privateMode: !!womenPrefs.privateMode,
      livingAlonePriority: !!elderPrefs.livingAlonePriority
    });

    if (!result.ok) {
      UI.showToast("Submission failed", result.message, "error");
      return;
    }

    complaintForm.reset();
    complaintDesk.value = "general";
    complaintCategory.value = "";
    if (complaintMode) {
      complaintMode.value = "all";
    }
    complaintDistrict.value = user.district || "Raipur";
    wardSelect.value = user.ward;
    imageData = "";
    imageMeta = null;
    clearAudioRecording();
    voiceTranscript = "";
    previewWrap.classList.add("hidden");
    previewImage.removeAttribute("src");
    localStorage.removeItem(draftKey);
    localStorage.removeItem(womenPrefillKey);
    localStorage.removeItem(elderPrefillKey);
    complaintReceiptCard.classList.remove("hidden");
    complaintReceiptCard.className = "glass-subcard receipt-card";
    complaintReceiptCard.innerHTML = [
      "<strong>Complaint acknowledgment slip</strong>",
      "<p>" + UI.escapeHtml("Token: " + result.complaint.id + " / Department: " + result.complaint.department + " / Priority: " + result.complaint.priorityLabel) + "</p>",
      "<p>" + UI.escapeHtml("Submitted for " + result.complaint.district + ". Track this token in the resolution center.") + "</p>",
      '<div class="hero-actions">' +
      '<a class="button button-secondary" href="./token.html?id=' + encodeURIComponent(result.complaint.id) + '">Open Official Token Slip</a>' +
      '<a class="button button-ghost" href="./acknowledgment-certificate.html?id=' + encodeURIComponent(result.complaint.id) + '">Acknowledgment Certificate</a>' +
      "</div>",
      '<div class="hero-actions">' +
      '<a class="button button-ghost" href="./resolution-summary.html?id=' + encodeURIComponent(result.complaint.id) + '">Resolution Summary</a>' +
      '<a class="button button-ghost" href="./escalation-note.html?id=' + encodeURIComponent(result.complaint.id) + '">Escalation Note</a>' +
      "</div>",
      '<div class="meta-row">' +
      UI.createBadge(result.complaint.status === "in_progress" ? "In Progress" : App.prettifyStatus(result.complaint.status), "status") +
      UI.createBadge(result.complaint.department, "category") +
      UI.createBadge(result.complaint.escalationWindowHours + "h SLA", "priority") +
      "</div>"
    ].join("");
    setSyncQueue([]);
    voiceStatus.textContent = SpeechRecognition
      ? "Speech recognition supported. Choose a language and record your complaint."
      : "Speech recognition is not available in this browser, but the rest of the AI intake still works.";
    renderVoiceCard();
    applySupportMode();
    applyComplaintMode();
    updatePriorityHint();
    renderAiPreview();
    renderDashboard();
    UI.showToast("Complaint submitted", "AI categorized your issue as " + result.complaint.category + ".", "success");
    setTimeout(function () {
      window.location.href = "./complaint.html?id=" + encodeURIComponent(result.complaint.id);
    }, 400);
  }

  UI.populateSelect(wardSelect, App.constants.wards, user.ward);
  UI.populateSelect(complaintDistrict, App.constants.districts, user.district || "Raipur");
  UI.populateSelect(complaintCategory, [{ value: "", label: "Let AI decide" }].concat(App.constants.categories.map(function (category) {
    return { value: category, label: category };
  })), "");
  UI.populateSelect(complaintDesk, [
    { value: "general", label: "General civic desk" },
    { value: "women", label: "Women support desk" },
    { value: "men", label: "Men support desk" },
    { value: "child", label: "Missing child / child rescue desk" },
    { value: "elder", label: "Elder emergency desk" }
  ], "general");
  UI.populateSelect(statusFilter, App.constants.statuses, "all");
  UI.populateSelect(districtFilter, [{ value: "all", label: "All districts" }].concat(App.constants.districts.map(function (district) {
    return { value: district, label: district };
  })), "all");
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
  UI.populateSelect(voiceLanguageSelect, App.constants.voiceLanguages, "en-IN");
  if (complaintMode) {
    complaintMode.value = "all";
  }
  applySupportMode();
  applyComplaintMode();
  loadDraft();
  suggestRoadForDistrict();

  voiceStatus.textContent = SpeechRecognition
    ? "Speech recognition supported. Choose a language and record your complaint."
    : "Speech recognition is not available in this browser, but the rest of the AI intake still works.";

  complaintForm.addEventListener("submit", handleSubmit);
  if (saveDraftButton) {
    saveDraftButton.addEventListener("click", function () {
      saveDraft();
      UI.showToast("Draft saved", "Your complaint draft is stored in this browser for the demo.", "success");
    });
  }
  if (clearDraftButton) {
    clearDraftButton.addEventListener("click", function () {
      clearDraft();
      UI.showToast("Draft cleared", "Saved complaint draft was removed.", "success");
    });
  }
  imageInput.addEventListener("change", handleImageChange);
  audioRecordButton.addEventListener("click", startAudioRecording);
  audioStopButton.addEventListener("click", stopAudioRecording);
  audioTranscribeButton.addEventListener("click", transcribeRecordedAudio);
  audioClearButton.addEventListener("click", clearAudioRecording);
  statusFilter.addEventListener("change", renderDashboard);
  [searchFilter, districtFilter, categoryFilter, priorityFilter, dateFilter].forEach(function (element) {
    element.addEventListener("input", renderDashboard);
    element.addEventListener("change", renderDashboard);
  });
  voiceLanguageSelect.addEventListener("change", renderAiPreview);
  complaintDistrict.addEventListener("change", suggestRoadForDistrict);
  complaintDesk.addEventListener("change", updatePriorityHint);
  if (complaintMode) {
    complaintMode.addEventListener("change", function () {
      applyComplaintMode();
      updatePriorityHint();
      renderAiPreview();
      saveDraft();
    });
  }
  voiceStartButton.addEventListener("click", startVoiceInput);
  voiceUseTranscriptButton.addEventListener("click", handleUseTranscript);
  assistantListenButton.addEventListener("click", startAssistantListening);
  assistantSpeakButton.addEventListener("click", function () {
    speakAssistant(lastAssistantReply);
    assistantStatus.textContent = "Speaking the latest AI reply.";
  });
  assistantStopButton.addEventListener("click", function () {
    if (assistantRecognition) {
      assistantRecognition.stop();
    }
    if (speechSynthesisApi) {
      speechSynthesisApi.cancel();
    }
    assistantStatus.textContent = "Voice assistant stopped.";
  });

  ["complaintTitle", "complaintDistrict", "complaintRoad", "complaintLocation", "complaintLandmark", "complaintDescription", "complaintWard", "complaintCategory", "complaintDesk", "complaintMode"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderAiPreview);
    document.getElementById(id).addEventListener("change", renderAiPreview);
    document.getElementById(id).addEventListener("input", saveDraft);
    document.getElementById(id).addEventListener("change", saveDraft);
  });

  App.subscribe(function () {
    renderDashboard();
    renderAiPreview();
  });

  renderDashboard();
  renderVoiceCard();
  renderAudioCard();
  updatePriorityHint();
  applyComplaintMode();
  renderAiPreview();
  renderWizardSteps();
  renderSupportDesks();
  renderTemplateGrid();
  renderServiceDirectory();
  renderAssistantCard("Voice assistant ready", {
    title: "Nav Dristi Voice is ready.",
    answer: lastAssistantReply
  });

  window.addEventListener("offline", function () {
    const raw = localStorage.getItem(draftKey);
    const draft = raw ? JSON.parse(raw) : null;
    renderOfflineDraftState("Internet connection was lost. Your local draft and retry queue remain protected.", draft);
  });

  window.addEventListener("online", function () {
    setSyncQueue([]);
    const raw = localStorage.getItem(draftKey);
    const draft = raw ? JSON.parse(raw) : null;
    renderOfflineDraftState("Connection restored. Local draft is available and the retry queue has been cleared.", draft);
  });
});
