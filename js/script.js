/* ==========================================================
   WOFA AI FRONTEND SCRIPT.JS (Feb 2026 - SMART AI VERSION)
   - Normal AI Answers by default (Fast Direct Answers)
   - Lesson Mode only when lesson clicked or user requests teaching
   - 10+ outlines only in teaching mode
   - Relaxing Male Voice Reading (Father Story Tone)
   - Sentence-by-sentence Reading
   - Voice Input + Voice Output
   - NO EMOJIS IN TEACHING
   - DELAY BEFORE TYPING (SECONDS)
   - TYPING ANSWER DISPLAY (VISIBLE TO USER)
   ========================================================== */

/* =========================
   GLOBAL STATE
   ========================= */
let lastAIMessageElement = null;
let isSending = false;
let autoSpeakEnabled = true;

/* Speech state */
let speechUtterance = null;
let speechSentences = [];
let speechIndex = 0;
let isPaused = false;

/* Lesson triggered */
let lessonTriggered = false;

/* =========================
   DOM ELEMENTS
   ========================= */
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("questionInput");
const darkToggle = document.getElementById("darkToggle");

/* =========================
   CONFIG
   ========================= */
const API_BASE_URL =
  window.WOFA_CONFIG?.API_BASE_URL || "https://wofa-ai-backend.onrender.com/api";

/* =========================
   TYPING SETTINGS
   ========================= */
const TYPING_START_DELAY_SECONDS = 1.5;
const TYPING_SPEED_MS = 12;

/* =========================
   VOICE SETTINGS (RELAXING)
   ========================= */
const VOICE_LANGUAGE = "en-US";
const VOICE_RATE = 0.85;
const VOICE_PITCH = 0.85;
const VOICE_VOLUME = 1;
const SENTENCE_PAUSE_MS = 250;

let selectedMaleVoice = null;

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
function scrollChatToBottom() {
  if (!chatBox) return;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sanitizeHTML(text) {
  return String(text || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================
   API POST HELPER
   ========================= */
async function apiPost(endpoint, payload) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

/* =========================
   TEXT SPLITTER (SENTENCE MODE)
   ========================= */
function splitIntoSentences(text) {
  if (!text) return [];

  const cleaned = text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  return cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
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
   DETECT CHILD / MONTESSORI MODE
   ========================= */
function isKidsMode(course, lesson) {
  const text = `${course || ""} ${lesson || ""}`.toLowerCase();

  return (
    text.includes("montessori") ||
    text.includes("primary") ||
    text.includes("kids") ||
    text.includes("children") ||
    text.includes("ages 3") ||
    text.includes("ages 6") ||
    text.includes("ages 12")
  );
}

/* =========================
   SMART DETECTOR:
   ONLY USE TEACHING MODE WHEN NEEDED
   ========================= */
function shouldUseTeachingMode(userQuestion, course, lesson, forceAutoTeach) {
  if (forceAutoTeach) return true;
  if (lessonTriggered) return true;

  if (!userQuestion) return false;

  const q = userQuestion.toLowerCase().trim();

  const teachingKeywords = [
    "teach",
    "teaching",
    "lesson",
    "outline",
    "explain",
    "explanation",
    "describe",
    "study",
    "chapter",
    "verse",
    "sermon",
    "preach",
    "bible",
    "jesus",
    "holy spirit",
    "trinity",
    "deliverance",
    "prophecy",
    "doctrine"
  ];

  const directAnswerKeywords = [
    "solve",
    "calculate",
    "answer",
    "what is",
    "who is",
    "when is",
    "where is",
    "define",
    "meaning of",
    "translate",
    "convert",
    "difference between",
    "how much",
    "how many",
    "short answer",
    "give me",
    "show me",
    "list"
  ];

  const isDirectQuestion = directAnswerKeywords.some(word => q.includes(word));
  const isTeachingRequest = teachingKeywords.some(word => q.includes(word));

  if (isTeachingRequest) return true;

  if (course || lesson) {
    if (!isDirectQuestion) return true;
  }

  return false;
}

/* =========================
   GENERAL PROMPT (NORMAL MODE)
   ========================= */
function buildGeneralPrompt(userQuestion) {
  return `
You are WOFA AI, an intelligent assistant.

RULES:
1. Answer directly and clearly.
2. Do NOT force outlines.
3. Use professional and simple English.
4. Use examples if necessary.
5. Do NOT use emojis.
6. Keep the answer helpful and complete.

User Question:
${userQuestion}
  `;
}

/* =========================
   TEACHING PROMPT (LESSON MODE)
   - 10 outlines minimum
   ========================= */
function buildTeachingPrompt(userQuestion, course, lesson) {
  const kidsMode = isKidsMode(course, lesson);

  const topic = lesson || course || userQuestion || "General Topic";

  if (kidsMode) {
    return `
You are WOFA AI, a Montessori-style teacher.

TOPIC: ${topic}

RULES (VERY IMPORTANT):
1. First create at least 10 outlines (number them 1 to 10 or more).
2. After the outlines, teach EACH outline clearly one by one.
3. Use very simple English.
4. Use short sentences.
5. Use examples children understand.
6. Do NOT use emojis.
7. End with 3 simple practice questions.
8. End with encouragement.

Student Question:
${userQuestion || "Teach this topic clearly."}
    `;
  }

  return `
You are WOFA AI, a smart educational tutor.

TOPIC: ${topic}

RULES (VERY IMPORTANT):
1. Before answering, create at least 10 outlines (number them).
2. Then teach ALL outlines one by one in detail.
3. Use step-by-step teaching.
4. Use examples, analogies, and exercises.
5. Make the explanation simple but professional.
6. Do NOT use emojis.
7. End with a short summary.
8. End with 5 practice questions.

Student Question:
${userQuestion || "Teach this topic clearly."}
  `;
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
   AUTO SELECT MALE VOICE
   ========================= */
function loadMaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;

  const maleKeywords = ["male", "man", "david", "mark", "daniel", "paul", "george"];

  selectedMaleVoice =
    voices.find(v =>
      v.lang.includes("en") &&
      maleKeywords.some(k => v.name.toLowerCase().includes(k))
    ) ||
    voices.find(v => v.lang.includes("en")) ||
    voices[0];
}

window.speechSynthesis.onvoiceschanged = loadMaleVoice;
loadMaleVoice();

/* =========================
   SPEECH ENGINE
   ========================= */
function stopSpeaking() {
  window.speechSynthesis.cancel();
  speechSentences = [];
  speechIndex = 0;
  isPaused = false;
}

function pauseSpeaking() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    isPaused = true;
  }
}

function resumeSpeaking() {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    isPaused = false;
  }
}

/* =========================
   SPEAK NEXT SENTENCE
   ========================= */
async function speakNextSentence() {
  if (speechIndex >= speechSentences.length) {
    stopSpeaking();
    return;
  }

  const line = speechSentences[speechIndex].trim();

  if (!line) {
    speechIndex++;
    speakNextSentence();
    return;
  }

  speechUtterance = new SpeechSynthesisUtterance(line);

  speechUtterance.lang = VOICE_LANGUAGE;
  speechUtterance.rate = VOICE_RATE;
  speechUtterance.pitch = VOICE_PITCH;
  speechUtterance.volume = VOICE_VOLUME;

  if (selectedMaleVoice) {
    speechUtterance.voice = selectedMaleVoice;
  }

  speechUtterance.onend = async () => {
    if (!isPaused) {
      speechIndex++;
      await sleep(SENTENCE_PAUSE_MS);
      speakNextSentence();
    }
  };

  speechUtterance.onerror = async () => {
    speechIndex++;
    await sleep(SENTENCE_PAUSE_MS);
    speakNextSentence();
  };

  window.speechSynthesis.speak(speechUtterance);
}

/* =========================
   SPEAK LINE BY LINE
   ========================= */
function speakLineByLine(text) {
  stopSpeaking();

  speechSentences = splitIntoSentences(text);
  speechIndex = 0;
  isPaused = false;

  speakNextSentence();
}

/* =========================
   READ LAST ANSWER
   ========================= */
function readLastAnswer() {
  if (!lastAIMessageElement) {
    alert("No AI answer yet.");
    return;
  }

  const cleanText = lastAIMessageElement.innerText
    .replace("Listen", "")
    .trim();

  speakLineByLine(cleanText);
}

/* =========================
   TYPE AI MESSAGE
   ========================= */
async function typeAIMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message ai";
  chatBox.appendChild(msg);

  scrollChatToBottom();

  await sleep(TYPING_START_DELAY_SECONDS * 1000);

  const safeText = sanitizeHTML(text);
  let i = 0;

  while (i < safeText.length) {
    msg.innerHTML = safeText.slice(0, i).replace(/\n/g, "<br>");
    i++;
    scrollChatToBottom();
    await sleep(TYPING_SPEED_MS);
  }

  lastAIMessageElement = msg;

  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.textContent = "Listen";
  speakBtn.onclick = readLastAnswer;

  msg.appendChild(speakBtn);
  scrollChatToBottom();

  if (autoSpeakEnabled) {
    const cleanText = msg.innerText.replace("Listen", "").trim();
    speakLineByLine(cleanText);
  }
}

/* =========================
   VOICE INPUT
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
   SEND QUESTION TO BACKEND
   ========================= */
async function sendQuestion(forceAutoTeach = false) {
  if (isSending) return;

  const userQuestion = input.value.trim();
  const { course, lesson } = getLearningContext();

  if (!userQuestion && !course && !lesson) {
    alert("Type a question or select a course/lesson.");
    return;
  }

  if (!userQuestion && forceAutoTeach) {
    addUserMessage(`Start teaching: ${lesson || course}`);
  } else {
    addUserMessage(userQuestion || "Start teaching");
  }

  input.value = "";
  isSending = true;

  const useTeachingMode = shouldUseTeachingMode(userQuestion, course, lesson, forceAutoTeach);

  const finalPrompt = useTeachingMode
    ? buildTeachingPrompt(userQuestion, course, lesson)
    : buildGeneralPrompt(userQuestion);

  try {
    const data = await apiPost("/chat", {
      question: finalPrompt,
      course,
      lesson
    });

    await typeAIMessage(data.answer || "No response generated.");
    isSending = false;

  } catch (err) {
    await typeAIMessage(
      "WOFA AI cannot respond right now. Please check your internet or backend server."
    );
    isSending = false;
  }
}

/* =========================
   AUTO TEACH WHEN LESSON CLICKED
   ========================= */
window.autoTeachLesson = function(courseTitle, lessonTitle) {
  localStorage.setItem("wofaActiveCourse", courseTitle || "");
  localStorage.setItem("wofaActiveLesson", lessonTitle || "");

  lessonTriggered = true;

  sendQuestion(true);
};

/* =========================
   ENTER KEY SUPPORT
   ========================= */
if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion(false);
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
      <strong>Chat cleared</strong><br><br>
      Ask any question and I will answer.<br>
      Or select a course and lesson for teaching mode.
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
      <strong>Welcome to WOFA AI</strong><br><br>
      Ask me any question and I will answer you clearly.<br><br>
      If you want full teaching mode, select a course and lesson.<br>
      Then I will teach step-by-step with outlines.
    `;

    chatBox.appendChild(intro);
    scrollChatToBottom();
  }
}

document.addEventListener("DOMContentLoaded", tutorWelcomeIfNeeded);

/* =========================
   EXPOSE FUNCTIONS TO HTML
   ========================= */
window.sendQuestion = sendQuestion;
window.startVoiceInput = startVoiceInput;
window.readLastAnswer = readLastAnswer;
window.clearChat = clearChat;
window.pauseSpeaking = pauseSpeaking;
window.resumeSpeaking = resumeSpeaking;
window.stopSpeaking = stopSpeaking;
