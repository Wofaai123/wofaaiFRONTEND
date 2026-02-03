const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

let currentLessonText = "";
let currentLessonId = null;

/* =========================
   LOAD LESSONS
   ========================= */
async function loadLessons() {
  const lessons = await apiGet(`/lessons/${courseId}`);
  const list = document.getElementById("lessonsList");

  list.innerHTML = "";

  lessons.forEach(lesson => {
    const li = document.createElement("li");
    li.textContent = lesson.title;

    li.onclick = () => teachLesson(lesson);
    list.appendChild(li);
  });
}

/* =========================
   TEACH LESSON + AUTO SAVE PROGRESS
   ========================= */
async function teachLesson(lesson) {
  currentLessonId = lesson._id;
  localStorage.setItem("activeLessonId", lesson._id);

  const taught = await apiPost(`/lessons/teach/${lesson._id}`, {
    level: "Beginner"
  });

  currentLessonText = taught.content;
  document.getElementById("lessonContent").innerText = taught.content;

  // ✅ AUTO-SAVE PROGRESS
  await saveProgress(lesson._id);
}

/* =========================
   SAVE PROGRESS
   ========================= */
async function saveProgress(lessonId) {
  try {
    await apiPost("/progress/complete", {
      lessonId
    });
  } catch (err) {
    console.warn("Progress not saved:", err.message);
  }
}

/* =========================
   SPEAK LESSON
   ========================= */
function speakLesson() {
  if (!currentLessonText) return;
  speakText(currentLessonText);
}

loadLessons();
