const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("token");

async function apiGet(path) {
  const res = await fetch(API_BASE + path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("API error");
  return res.json();
}

async function loadCourses() {
  const list = document.getElementById("coursesList");
  list.innerHTML = "";

  try {
    // 🔹 Get subjects first
    const subjects = await apiGet("/subjects");

    if (subjects.length === 0) {
      list.innerHTML = "<li>No subjects found</li>";
      return;
    }

    // 🔹 Use FIRST subject by default
    const subjectId = subjects[0]._id;

    const courses = await apiGet(`/courses/${subjectId}`);

    if (courses.length === 0) {
      list.innerHTML = "<li>No courses yet</li>";
      return;
    }

    courses.forEach(course => {
      const li = document.createElement("li");
      li.textContent = course.title;

      li.onclick = () => loadLessons(course._id);
      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = "<li>Failed to load courses</li>";
    console.error(err);
  }
}

async function loadLessons(courseId) {
  const list = document.getElementById("lessonsList");
  list.innerHTML = "";

  try {
    const lessons = await apiGet(`/lessons/${courseId}`);

    lessons.forEach(lesson => {
      const li = document.createElement("li");
      li.textContent = lesson.title;

      li.onclick = async () => {
        localStorage.setItem("activeLessonId", lesson._id);

        const taught = await fetch(
          `${API_BASE}/lessons/teach/${lesson._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ level: "Beginner" })
          }
        ).then(r => r.json());

        document.getElementById("learningContext").innerText =
          lesson.title;
      };

      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = "<li>Failed to load lessons</li>";
  }
}

loadCourses();
