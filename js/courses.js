const params = new URLSearchParams(window.location.search);
const subjectId = params.get("subject");

async function loadCourses() {
  const courses = await apiGet(`/courses/${subjectId}`);
  const list = document.getElementById("coursesList");

  courses.forEach(course => {
    const li = document.createElement("li");
    li.textContent = `${course.title} (${course.level})`;
    li.onclick = () => {
      window.location.href = `lessons.html?course=${course._id}`;
    };
    list.appendChild(li);
  });
}

loadCourses();
