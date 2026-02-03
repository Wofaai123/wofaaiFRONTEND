async function loadSubjects() {
  const subjects = await apiGet("/subjects");
  const list = document.getElementById("subjectsList");

  subjects.forEach(subject => {
    const li = document.createElement("li");
    li.textContent = subject.name;
    li.onclick = () => {
      window.location.href = `courses.html?subject=${subject._id}`;
    };
    list.appendChild(li);
  });
}

loadSubjects();
