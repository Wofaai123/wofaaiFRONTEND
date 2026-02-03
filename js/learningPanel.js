// =========================
// API BASE (Render backend)
// =========================
const API_BASE = "https://wofa-ai-backend.onrender.com/api";

// =========================
// DOM ELEMENTS
// =========================
const coursesList = document.getElementById("coursesList");
const lessonsList = document.getElementById("lessonsList");
const chatBox = document.getElementById("chatBox");

// =========================
// STATE
// =========================
let activeCourseId = null;
let activeLessonId = null;

// =========================
// LOAD COURSES
// =========================
async function loadCourses() {
  if (!coursesList) return;

  coursesList.innerHTML = "<li>Loading courses...</li>";
  lessonsList.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/courses`);
    const courses = await res.json();

    coursesList.innerHTML = "";

    if (!Array.isArray(courses) || courses.length === 0) {
      coursesList.innerHTML = "<li>No courses available</li>";
      return;
    }

    courses.forEach(course => {
      const li = document.createElement("li");
      li.textContent = course.title;
      li.style.cursor = "pointer";

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        selectCourse(course._id, li);
      });

      coursesList.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load courses:", err);
    coursesList.innerHTML = "<li>Error loading courses</li>";
  }
}

// =========================
// SELECT COURSE → LOAD LESSONS
// =========================
async function selectCourse(courseId, element) {
  activeCourseId = courseId;

  // Highlight active course
  document
    .querySelectorAll(".course-list li")
    .forEach(li => li.classList.remove("active"));

  element.classList.add("active");

  lessonsList.innerHTML = "<li>Loading lessons...</li>";

  try {
    const res = await fetch(`${API_BASE}/lessons/${courseId}`);
    const lessons = await res.json();

    lessonsList.innerHTML = "";

    if (!Array.isArray(lessons) || lessons.length === 0) {
      lessonsList.innerHTML = "<li>No lessons yet</li>";
      return;
    }

    lessons.forEach(lesson => {
      const li = document.createElement("li");
      li.textContent = lesson.title;
      li.style.cursor = "pointer";

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        selectLesson(lesson._id, li);
      });

      lessonsList.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load lessons:", err);
    lessonsList.innerHTML = "<li>Error loading lessons</li>";
  }
}

// =========================
// SELECT LESSON
// =========================
function selectLesson(lessonId, element) {
  activeLessonId = lessonId;

  document
    .querySelectorAll(".lesson-list li")
    .forEach(li => li.classList.remove("active"));

  element.classList.add("active");

  // Persist lesson context for chat
  localStorage.setItem("activeLessonId", lessonId);

  // Visual confirmation
  chatBox.insertAdjacentHTML(
    "beforeend",
    `
    <div class="message ai">
      📘 <strong>Lesson activated</strong><br>
      You can now ask questions about this lesson.
    </div>
    `
  );

  chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", loadCourses);
