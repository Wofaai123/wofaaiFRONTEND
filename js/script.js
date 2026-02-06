/* ==========================================================
   WOFA AI FRONTEND SCRIPT.JS (Feb 2026 - Groq Version)
   - MongoDB Removed
   - Authentication Removed
   - Groq AI Backend Support
   - Courses/Lessons Optional
   - Smart Tutor Mode
   - Voice Input + Voice Output
   - Clean UI Engine
   ========================================================== */

/* =========================
   GLOBAL STATE
   ========================= */
let lastAIMessageElement = null;
let isThinking = false;
let speechUtterance = null;

/* =========================
   DOM ELEMENTS
   ========================= */
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("questionInput");
const darkToggle = document.getElementById("darkToggle");

/* =========================
   THEME (DARK MODE)
   ========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

(function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
})();

if (darkToggle) darkToggle.onclick = toggleDarkMode;

/* =========================
   UTILITIES
   ========================= */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollChatToBottom() {
  if (!chatBox) return;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sanitizeHTML(text) {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =========================
   GET LEARNING CONTEXT
   ========================= */
function getLearningContext() {
  return {
    course: localStorage.getItem("wofaActiveCourse") || null,
    lesson: localStorage.getItem("wofaActiveLesson") || null
  };
}

/* =========================
   SMART QUESTION BUILDER
   ========================= */
function buildSmartQuestion(userQuestion) {
  const { course, lesson } = getLearningContext();

  if (userQuestion && userQuestion.trim().length > 0) {
    return userQuestion;
  }

  if (course && lesson) {
    return `Teach me this lesson: ${lesson}. Start from beginner level and explain step-by-step with examples and exercises.`;
  }

  if (course && !lesson) {
    return `Teach me the topic: ${course}. Start from the basics and build gradually with examples and practice questions.`;
  }

  return "Teach me something valuable today in a clear step-by-step way.";
}

/* =========================
   ADD USER MESSAGE
   ========================= */
function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerHTML = sanitizeHTML(text).replace(/\n/g, "<br>");

  chatBox.appendChild(msg);
  scrollChatToBottom();
}

/* =========================
   THINKING INDICATOR
   ========================= */
function showThinking() {
  removeThinking();

  const msg = document.createElement("div");
  msg.className = "message ai thinking";
  msg.id = "thinking-indicator";
  msg.innerHTML = "WOFA AI is thinking<span class='dots'>...</span>";

  chatBox.appendChild(msg);
  scrollChatToBottom();
}

function removeThinking() {
  const el = document.getElementById("thinking-indicator");
  if (el) el.remove();
}

/* =========================
   AI MESSAGE (TYPING EFFECT)
   ========================= */
async function typeAIMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message ai";
  chatBox.appendChild(msg);

  const safeText = sanitizeHTML(text);

  let i = 0;
  const speed = 10;

  while (i < safeText.length) {
    msg.innerHTML = safeText.slice(0, i).replace(/\n/g, "<br>");
    i++;
    scrollChatToBottom();
    await sleep(speed);
  }

  lastAIMessageElement = msg;

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.textContent = "🔊 Listen";
  speakBtn.onclick = readLastAnswer;

  msg.appendChild(speakBtn);
  scrollChatToBottom();
}

/* =========================
   VOICE OUTPUT (TEXT TO SPEECH)
   ========================= */
function speakText(text) {
  if (!text) return;

  window.speechSynthesis.cancel();

  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.lang = "en-US";
  speechUtterance.rate = 0.95;
  speechUtterance.pitch = 1;

  window.speechSynthesis.speak(speechUtterance);
}

function readLastAnswer() {
  if (!lastAIMessageElement) {
    alert("No AI answer yet.");
    return;
  }

  const cleanText = lastAIMessageElement.innerText.replace("🔊 Listen", "").trim();
  speakText(cleanText);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
}

/* =========================
   VOICE INPUT (SPEECH TO TEXT)
   ========================= */
function startVoiceInput() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input is not supported in this browser.");
    return;
  }

  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = false;

  rec.start();

  rec.onresult = e => {
    input.value = e.results[0][0].transcript;
    sendQuestion();
  };

  rec.onerror = () => {
    alert("Voice input failed. Try again.");
  };
}

/* =========================
   SEND QUESTION TO GROQ BACKEND
   ========================= */
async function sendQuestion() {
  if (isThinking) return;

  const userQuestion = input.value.trim();
  const { course, lesson } = getLearningContext();

  if (!userQuestion && !course) {
    alert("Type a question or select a course.");
    return;
  }

  addUserMessage(userQuestion || "📘 Start teaching me");

  input.value = "";
  isThinking = true;
  showThinking();

  const finalQuestion = buildSmartQuestion(userQuestion);

  try {
    const data = await apiPost("/chat", {
      question: finalQuestion,
      course,
      lesson
    });

    removeThinking();
    isThinking = false;

    await typeAIMessage(data.answer || "⚠️ No response generated.");

  } catch (err) {
    removeThinking();
    isThinking = false;

    await typeAIMessage(
      "❌ WOFA AI cannot respond right now. Please check your internet or backend server."
    );
  }
}

/* =========================
   ENTER KEY SUPPORT
   ========================= */
if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  });
}

/* =========================
   CLEAR CHAT
   ========================= */
function clearChat() {
  stopSpeaking();
  lastAIMessageElement = null;

  chatBox.innerHTML = `
    <div class="message ai">
      <strong>Chat cleared 🧹</strong><br><br>
      Ask me anything or select a course & lesson.<br>
      I’m ready to teach you again 🎓
    </div>
  `;
}

/* =========================
   WELCOME MESSAGE
   ========================= */
function tutorWelcomeIfNeeded() {
  const alreadyWelcomed = localStorage.getItem("welcomed");

  if (!alreadyWelcomed) {
    localStorage.setItem("welcomed", "true");

    const intro = document.createElement("div");
    intro.className = "message ai";
    intro.innerHTML = `
      <strong>Welcome to WOFA AI 🎓</strong><br><br>
      I can teach you ANYTHING from Montessori → University → PhD.<br><br>
      ✅ Select a course & lesson on the left<br>
      ✅ Ask any question<br>
      ✅ Learn step-by-step like a real classroom<br><br>
      <em>Start by typing your first question!</em>
    `;

    chatBox.appendChild(intro);
    scrollChatToBottom();
  }
}

document.addEventListener("DOMContentLoaded", tutorWelcomeIfNeeded);
