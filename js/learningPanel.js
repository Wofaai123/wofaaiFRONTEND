// js/learningPanel.js - Fully Upgraded Clickable Courses & Lessons (Feb 2026)
// African-focused + Theology (Christian & Islamic separated) + ICT, Computer Science, Coding, Robotics

document.addEventListener("DOMContentLoaded", () => {
  const coursesList = document.getElementById("coursesList");

  // Expanded & organized course data
  const coursesData = [
    // ───────────────────────────────────────────────
    // THEOLOGY – CHRISTIAN STUDIES (All Christian programs grouped here)
    // ───────────────────────────────────────────────
    {
      id: "theology-christian",
      title: "Theology – Christian Studies",
      lessons: [
        { id: "act101", title: "Biblical Interpretation in African Cultures" },
        { id: "act102", title: "Liberation Theology (Post-Colonial Africa)" },
        { id: "act103", title: "African Church History" },
        { id: "act104", title: "Contextual Christian Ethics in Africa" },
        { id: "act105", title: "Missions and Evangelism in African Contexts" },
        { id: "act106", title: "Prophecy and African Prophets" },
        { id: "act107", title: "Poverty, Justice & Biblical Themes" },
        { id: "act108", title: "Church Leadership & Administration in Africa" },
      ],
    },

    // ───────────────────────────────────────────────
    // THEOLOGY – ISLAMIC STUDIES (All Islamic programs grouped here)
    // ───────────────────────────────────────────────
    {
      id: "theology-islamic",
      title: "Theology – Islamic Studies",
      lessons: [
        { id: "isa101", title: "Spread of Islam in Africa (Historical)" },
        { id: "isa102", title: "Sufism and Spiritual Traditions in West Africa" },
        { id: "isa103", title: "Sharia Application in African Societies" },
        { id: "isa104", title: "Contemporary Muslim Issues in Africa" },
        { id: "isa105", title: "Interfaith Dialogue: Christian-Muslim Relations" },
        { id: "isa106", title: "Islamic Ethics and Social Justice" },
      ],
    },

    // ───────────────────────────────────────────────
    // INDIGENOUS & INTERFAITH SPIRITUALITY
    // ───────────────────────────────────────────────
    {
      id: "african-spirituality",
      title: "African Indigenous Spirituality & Interfaith",
      lessons: [
        { id: "ais101", title: "Traditional African Religions & Cosmology" },
        { id: "ais102", title: "Ancestor Veneration & Rituals" },
        { id: "ais103", title: "Syncretism: Christianity, Islam & Indigenous Faiths" },
        { id: "ais104", title: "Spirituality, Environment & Sustainability" },
        { id: "ais105", title: "Peacebuilding Through Interfaith Dialogue" },
      ],
    },

    // ───────────────────────────────────────────────
    // BUSINESS & ENTREPRENEURSHIP
    // ───────────────────────────────────────────────
    {
      id: "bba",
      title: "Bachelor of Business Administration (BBA)",
      lessons: [
        { id: "bba101", title: "Introduction to Business" },
        { id: "bba102", title: "Principles of Management" },
        { id: "bba103", title: "Financial Accounting" },
        { id: "bba104", title: "Business Mathematics" },
      ],
    },
    {
      id: "african-entrepreneurship",
      title: "African Entrepreneurship & Innovation",
      lessons: [
        { id: "aei101", title: "Startup Ecosystems in Africa" },
        { id: "aei102", title: "Fintech and Mobile Money" },
        { id: "aei103", title: "Agribusiness & Value Chains" },
        { id: "aei104", title: "Women in African Business Leadership" },
        { id: "aei105", title: "Scaling Ventures in Emerging Markets" },
      ],
    },

    // ───────────────────────────────────────────────
    // ICT, COMPUTER SCIENCE & CODING
    // ───────────────────────────────────────────────
    {
      id: "ict",
      title: "Information & Communication Technology (ICT)",
      lessons: [
        { id: "ict101", title: "Computer Fundamentals & Digital Literacy" },
        { id: "ict102", title: "Networking & Internet Technologies" },
        { id: "ict103", title: "Database Management Systems" },
        { id: "ict104", title: "Cybersecurity Basics" },
        { id: "ict105", title: "Cloud Computing & Virtualization" },
      ],
    },
    {
      id: "computer-science",
      title: "Computer Science Fundamentals",
      lessons: [
        { id: "cs101", title: "Introduction to Programming Concepts" },
        { id: "cs102", title: "Data Structures & Algorithms" },
        { id: "cs103", title: "Operating Systems & Architecture" },
        { id: "cs104", title: "Software Engineering Principles" },
        { id: "cs105", title: "Artificial Intelligence & Machine Learning Intro" },
      ],
    },
    {
      id: "coding",
      title: "Coding & Programming",
      lessons: [
        { id: "cod101", title: "Python for Beginners" },
        { id: "cod102", title: "JavaScript & Web Development" },
        { id: "cod103", title: "Java Programming" },
        { id: "cod104", title: "Mobile App Development (Flutter/React Native)" },
        { id: "cod105", title: "Full-Stack Development Project" },
      ],
    },

    // ───────────────────────────────────────────────
    // ROBOTICS WITH BASIC SCIENCES (Montessori → University)
    // ───────────────────────────────────────────────
    {
      id: "robotics",
      title: "Robotics Program with Basic Sciences",
      lessons: [
        { id: "rob-montessori", title: "Montessori Level: Sensory Robotics & Basic Physics (Ages 3–6)" },
        { id: "rob-primary", title: "Primary Level: Simple Machines, Logic & Intro Coding (Ages 6–12)" },
        { id: "rob-secondary", title: "Secondary Level: Electronics, Sensors, Arduino & Chemistry Basics (Ages 12–18)" },
        { id: "rob-university", title: "University Level: AI Robotics, Automation, Advanced Physics & Engineering" },
      ],
    },

    // ───────────────────────────────────────────────
    // OTHER HIGH-IMPACT AFRICAN PROGRAMS
    // ───────────────────────────────────────────────
    {
      id: "african-history-dev",
      title: "African History & Development",
      lessons: [
        { id: "ahd101", title: "Pre-Colonial African Societies" },
        { id: "ahd102", title: "Colonialism & Its Lasting Impact" },
        { id: "ahd103", title: "Pan-Africanism & Independence Movements" },
        { id: "ahd104", title: "Modern African Political Economy" },
      ],
    },
    {
      id: "public-health-africa",
      title: "Public Health in Africa",
      lessons: [
        { id: "pha101", title: "Tropical Diseases & Epidemiology" },
        { id: "pha102", title: "HIV/AIDS & Infectious Disease Control" },
        { id: "pha103", title: "Maternal & Child Health in Africa" },
        { id: "pha104", title: "Health Systems Strengthening" },
      ],
    },
    {
      id: "sustainable-dev-africa",
      title: "Sustainable Development in Africa",
      lessons: [
        { id: "sda101", title: "SDGs Localization in Africa" },
        { id: "sda102", title: "Climate Resilience & Adaptation" },
        { id: "sda103", title: "Renewable Energy Solutions" },
        { id: "sda104", title: "Food Security & Agriculture" },
      ],
    },
  ];

  // ───────────────────────────────────────────────
  // RENDER COURSES & LESSONS (CLICKABLE)
  // ───────────────────────────────────────────────
  function renderCourses() {
    coursesList.innerHTML = ""; // Clear

    coursesData.forEach((course) => {
      // Course item
      const courseLi = document.createElement("li");
      courseLi.className = "course-item";
      courseLi.textContent = course.title;
      courseLi.dataset.courseId = course.id;

      // Click → toggle lessons + highlight
      courseLi.addEventListener("click", () => {
        // Remove active from all courses
        document.querySelectorAll(".course-item").forEach(el => el.classList.remove("active"));
        courseLi.classList.add("active");

        // Toggle lessons
        let lessonUl = courseLi.nextElementSibling;
        if (lessonUl && lessonUl.classList.contains("lesson-list")) {
          lessonUl.classList.toggle("open");
        } else {
          lessonUl = document.createElement("ul");
          lessonUl.className = "lesson-list open";
          courseLi.insertAdjacentElement("afterend", lessonUl);

          course.lessons.forEach((lesson) => {
            const lessonLi = document.createElement("li");
            lessonLi.className = "lesson-item";
            lessonLi.textContent = lesson.title;
            lessonLi.dataset.lessonId = lesson.id;
            lessonLi.dataset.courseId = course.id;

            // Lesson click → load content / trigger AI
            lessonLi.addEventListener("click", () => {
              document.querySelectorAll(".lesson-item").forEach(el => el.classList.remove("active"));
              lessonLi.classList.add("active");

              // Call function to handle lesson selection
              loadLessonContent(course.id, lesson.id);
            });

            lessonUl.appendChild(lessonLi);
          });
        }
      });

      coursesList.appendChild(courseLi);
    });
  }

  // ───────────────────────────────────────────────
  // WHEN USER CLICKS A LESSON –> THIS FUNCTION RUNS
  // ───────────────────────────────────────────────
  function loadLessonContent(courseId, lessonId) {
    const chatBox = document.getElementById("chatBox");

    // Optional: Clear previous messages or keep history
    // chatBox.innerHTML = "";

    const message = document.createElement("div");
    message.className = "message ai";
    message.innerHTML = `
      <strong>Selected:</strong> ${coursesData.find(c => c.id === courseId)?.title || courseId} → ${lessonId}<br>
      WOFA AI is ready to teach/explain this lesson.<br>
      <em>Ask any question about it now!</em>
    `;
    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;

    // Optional: auto-focus input for immediate question
    document.getElementById("questionInput")?.focus();
  }

  // Load everything when page opens
  renderCourses();
});