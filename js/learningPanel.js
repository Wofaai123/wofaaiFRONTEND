// =========================
// CONFIG
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
  coursesList.innerHTML = "<li>Loading courses...</li>";
  lessonsList.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/courses`);
    const courses = await res.json();

    coursesList.innerHTML = "";

    if (!Array.isArray(courses) || courses.length === 0) {
      coursesList.innerHTML = "<li>No courses found</li>";
      return;
    }

    courses.forEach(course => {
      const li = document.createElement("li");
      li.textContent = course.title;
      li.dataset.id = course._id;

      li.addEventListener("click", () => {
        selectCourse(course._id, li);
      });

      coursesList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    coursesList.innerHTML = "<li>Error loading courses</li>";
  }
}

// =========================
// SELECT COURSE → LOAD LESSONS
// =========================
async function selectCourse(courseId, element) {
  activeCourseId = courseId;

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
      li.dataset.id = lesson._id;

      li.addEventListener("click", () => {
        selectLesson(lesson._id, li);
      });

      lessonsList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
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

  localStorage.setItem("activeLessonId", lessonId);

  chatBox.insertAdjacentHTML(
    "beforeend",
    `<div class="message ai">
      📘 <b>Lesson selected.</b><br>
      You can now ask questions about this lesson.
    </div>`
  );

  chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================
// INIT (SAFE)
// =========================
document.addEventListener("DOMContentLoaded", loadCourses);
