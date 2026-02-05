// js/script.js - WOFA AI Frontend Chat Controller (Production-Ready 2026)
// Handles chat, image upload, voice, TTS, theme toggle, logout

// ───────────────────────────────────────────────
// CONFIG & STATE
// ───────────────────────────────────────────────
const API_BASE_URL = window.WOFA_CONFIG?.API_BASE_URL || "http://localhost:5000";

let isSending = false;
let lastAIMessage = "";
let uploadedImageBase64 = null;
let speechInstance = null;

// DOM References (safe access)
const elements = {
  chatBox: document.getElementById("chatBox"),
  questionInput: document.getElementById("questionInput"),
  imageInput: document.getElementById("imageInput"),
  chatForm: document.getElementById("chatForm"),
  sendBtn: document.querySelector(".send-btn"),
  voiceBtn: document.getElementById("voiceBtn"),
  speakBtn: document.getElementById("speakBtn"),
  clearBtn: document.getElementById("clearBtn"),
  darkToggle: document.getElementById("darkToggle"),
  logoutBtn: document.querySelector(".logout"),
};

// Auth Guard
const authToken = localStorage.getItem("token");
if (!authToken) {
  window.location.replace("login.html");
}

// ───────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────
const scrollToBottom = () => {
  if (elements.chatBox) {
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
  }
};

const showLoading = (show) => {
  // If you have a loading indicator, toggle it here
  // Example: document.getElementById("loadingIndicator")?.classList.toggle("hidden", !show);
};

const renderMessage = (text, isAI = true, image = null) => {
  if (!elements.chatBox) return;

  const div = document.createElement("div");
  div.className = `message ${isAI ? "ai" : "user"}`;
  div.innerHTML = text.replace(/\n/g, "<br>");

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = "Uploaded image";
    img.style.maxWidth = "100%";
    div.appendChild(img);
  }

  elements.chatBox.appendChild(div);
  scrollToBottom();

  if (isAI) lastAIMessage = text;
};

// ───────────────────────────────────────────────
// THEME TOGGLE
// ───────────────────────────────────────────────
const loadTheme = () => {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.className = theme + "-theme";
  if (elements.darkToggle) {
    elements.darkToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }
};

const toggleTheme = () => {
  const current = document.documentElement.className.includes("dark") ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.className = next + "-theme";
  localStorage.setItem("theme", next);
  if (elements.darkToggle) {
    elements.darkToggle.textContent = next === "dark" ? "☀️" : "🌙";
  }
};

if (elements.darkToggle) {
  elements.darkToggle.addEventListener("click", toggleTheme);
}

// Load theme on start
loadTheme();

// ───────────────────────────────────────────────
// API REQUEST (CHAT ENDPOINT)
// ───────────────────────────────────────────────
async function sendChatRequest(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) logout();
      const errData = await res.json();
      throw new Error(errData.message || "API request failed");
    }

    return await res.json();
  } catch (err) {
    console.error("Chat API error:", err);
    throw err;
  }
}

// ───────────────────────────────────────────────
// SEND MESSAGE HANDLER
// ───────────────────────────────────────────────
async function handleSendMessage() {
  if (isSending) return;

  const question = elements.questionInput?.value.trim();
  if (!question && !uploadedImageBase64) return;

  isSending = true;
  showLoading(true);

  renderMessage(question || "📷 Image sent", false, uploadedImageBase64);

  if (elements.questionInput) elements.questionInput.value = "";

  try {
    const payload = {
      question: question || null,
      image: uploadedImageBase64 || null,
      course: localStorage.getItem("wofaActiveCourse"),
      lesson: localStorage.getItem("wofaActiveLesson"),
    };

    const response = await sendChatRequest(payload);

    renderMessage(response.answer || "No response from AI.", true);
    uploadedImageBase64 = null;
  } catch (err) {
    renderMessage(`❌ Error: ${err.message || "Unable to reach WOFA AI"}`, true);
  } finally {
    showLoading(false);
    isSending = false;
    elements.questionInput?.focus();
  }
}

// ───────────────────────────────────────────────
// EVENT LISTENERS
// ───────────────────────────────────────────────
if (elements.chatForm) {
  elements.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSendMessage();
  });
}

if (elements.sendBtn) {
  elements.sendBtn.addEventListener("click", handleSendMessage);
}

// Image Upload
if (elements.imageInput) {
  elements.imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadedImageBase64 = reader.result;
      renderMessage("Image uploaded successfully", false, uploadedImageBase64);
    };
    reader.readAsDataURL(file);
  });
}

// Voice Input
function startVoiceInput() {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Voice input not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    if (elements.questionInput) {
      elements.questionInput.value = transcript;
      handleSendMessage();
    }
  };

  recognition.onerror = (e) => console.error("Voice recognition error:", e.error);
  recognition.start();
}

if (elements.voiceBtn) {
  elements.voiceBtn.addEventListener("click", startVoiceInput);
}

// Text-to-Speech (last AI message)
function readLastAnswer() {
  if (!lastAIMessage) {
    alert("No recent AI message to read.");
    return;
  }

  window.speechSynthesis.cancel();
  speechInstance = new SpeechSynthesisUtterance(lastAIMessage);
  speechInstance.lang = "en-US";
  speechInstance.rate = 0.95;
  window.speechSynthesis.speak(speechInstance);
}

if (elements.speakBtn) {
  elements.speakBtn.addEventListener("click", readLastAnswer);
}

// Clear Chat
if (elements.clearBtn) {
  elements.clearBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    lastAIMessage = "";
    uploadedImageBase64 = null;

    if (elements.chatBox) {
      elements.chatBox.innerHTML = `
        <div class="message ai">
          <strong>Hello 👋 I’m WOFA AI</strong><br>
          Ask me anything or choose a lesson.
        </div>
      `;
      scrollToBottom();
    }
  });
}

// Logout
function logout() {
  localStorage.clear();
  window.location.replace("login.html");
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", logout);
}

// Initial scroll
scrollToBottom();