(function () {
  const SETTINGS_KEY = "navdristi-ai-settings-v1";
  const DEFAULTS = {
    provider: "openai",
    apiKey: "",
    responseModel: "gpt-4.1-mini",
    voiceModel: "gpt-4o-mini-tts",
    voiceName: "alloy",
    enabled: false
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return clone(DEFAULTS);
    }

    try {
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (error) {
      return clone(DEFAULTS);
    }
  }

  function saveSettings(settings) {
    const nextSettings = Object.assign({}, DEFAULTS, settings || {});
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    return clone(nextSettings);
  }

  function isConfigured() {
    const settings = getSettings();
    return !!(settings.enabled && settings.apiKey);
  }

  function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl || "").split(",");
    const meta = parts[0] || "";
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : "audio/webm";
    const binary = atob(parts[1] || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mime });
  }

  async function generateReply(prompt, context) {
    const settings = getSettings();
    if (!settings.enabled || !settings.apiKey) {
      throw new Error("Real AI is not configured in Settings.");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + settings.apiKey
      },
      body: JSON.stringify({
        model: settings.responseModel,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are Nav Dristi, a civic and support assistant for complaint filing, escalation tracking, women support, male support, and elder emergency help. Reply clearly, briefly, and helpfully."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Context: " + (context || "No extra context.") + "\n\nUser request: " + prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed with status " + response.status + ".");
    }

    const data = await response.json();
    const text = (data.output_text || "").trim();
    return text || "I could not generate a reply right now.";
  }

  async function speakText(text) {
    const settings = getSettings();
    if (!settings.enabled || !settings.apiKey) {
      throw new Error("Real AI voice is not configured in Settings.");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + settings.apiKey
      },
      body: JSON.stringify({
        model: settings.voiceModel,
        voice: settings.voiceName,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error("Voice request failed with status " + response.status + ".");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.addEventListener("ended", function () {
      URL.revokeObjectURL(url);
    });
    await audio.play();
  }

  async function transcribeAudioDataUrl(audioDataUrl) {
    const settings = getSettings();
    if (!settings.enabled || !settings.apiKey) {
      throw new Error("Real AI speech-to-text is not configured in Settings.");
    }

    const blob = dataUrlToBlob(audioDataUrl);
    const formData = new FormData();
    formData.append("file", blob, "complaint-audio.webm");
    formData.append("model", "gpt-4o-transcribe");
    formData.append("response_format", "text");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + settings.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("Speech-to-text request failed with status " + response.status + ".");
    }

    const text = (await response.text()).trim();
    return text || "No transcript returned.";
  }

  window.NavDristiAI = {
    getSettings: getSettings,
    saveSettings: saveSettings,
    isConfigured: isConfigured,
    generateReply: generateReply,
    speakText: speakText,
    transcribeAudioDataUrl: transcribeAudioDataUrl
  };
})();
