/* =========================
   DOM ELEMENTS (SAFE)
   ========================= */
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("questionInput");
const imageInput = document.getElementById("imageInput");

if (!chatBox || !input) {
  console.warn("Chat UI not found on this page.");
}
const learningContext = document.getElementById("learningContext");

const activeLesson = localStorage.getItem("activeLessonId");
if (learningContext && activeLesson) {
  learningContext.innerText = "📘 You are studying a lesson";
}
/* =========================
   DARK MODE
   ========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// Load saved theme
(function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
})();

/* =========================
   STATE
   ========================= */
let lastAIAnswer = "";
let lastUploadedImage = null;
let speechUtterance = null;

/* =========================
   UTILS
   ========================= */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================
   VOICE (TEXT → SPEECH)
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

function stopSpeaking() {
  window.speechSynthesis.cancel();
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
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeThinking() {
  const thinking = document.getElementById("thinking-indicator");
  if (thinking) thinking.remove();
}

/* =========================
   ADD USER MESSAGE
   ========================= */
function addUserMessage(text, images = []) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerHTML = text.replace(/\n/g, "<br>");

  images.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    msg.appendChild(img);
  });

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* =========================
   TYPE AI MESSAGE (REALISTIC)
   ========================= */
async function typeAIMessage(text, images = []) {
  const msg = document.createElement("div");
  msg.className = "message ai";
  chatBox.appendChild(msg);

  let i = 0;
  const speed = 12;

  while (i < text.length) {
    msg.innerHTML = text.slice(0, i).replace(/\n/g, "<br>");
    i++;
    chatBox.scrollTop = chatBox.scrollHeight;
    await sleep(speed);
  }

  images.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    msg.appendChild(img);
  });

  const speakBtn = document.createElement("button");
  speakBtn.textContent = "🔊 Listen";
  speakBtn.className = "speak-btn";
  speakBtn.onclick = () => speakText(text);
  msg.appendChild(speakBtn);

  lastAIAnswer = text;
}

/* =========================
   SEND QUESTION
   ========================= */
async function sendQuestion() {
  const question = input.value.trim();
  if (!question && !lastUploadedImage) return;

  addUserMessage(question || "📷 Image uploaded", lastUploadedImage ? [lastUploadedImage] : []);
  input.value = "";

  const lessonId = localStorage.getItem("activeLessonId");

  showThinking();

  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question || "Explain the uploaded image",
        image: lastUploadedImage,
        lessonId
      })
    });

    const data = await res.json();
    await sleep(600);

    removeThinking();
    await typeAIMessage(data.answer, data.images || []);

    lastUploadedImage = null;

  } catch (err) {
    removeThinking();
    await typeAIMessage("❌ Unable to connect to WOFA AI.");
  }
}

/* =========================
   IMAGE UPLOAD
   ========================= */
if (imageInput) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      lastUploadedImage = reader.result;
      addUserMessage("📷 Image uploaded. Ask me to explain it.", [reader.result]);
    };
    reader.readAsDataURL(file);
  });
}

/* =========================
   VOICE INPUT
   ========================= */
function startVoiceInput() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();
  recognition.onresult = e => {
    input.value = e.results[0][0].transcript;
    sendQuestion();
  };
}

/* =========================
   CLEAR CHAT
   ========================= */
function clearChat() {
  stopSpeaking();
  chatBox.innerHTML = `
    <div class="message ai">
      Hello 👋 I’m <b>WOFA AI</b>.<br>
      Ask a question, speak, or upload an image.
    </div>
  `;
  lastAIAnswer = "";
  lastUploadedImage = null;
}
const toggle = document.getElementById("darkToggle");

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

toggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "dark",
    document.body.classList.contains("dark")
  );
};
