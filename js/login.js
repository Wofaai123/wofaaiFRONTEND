const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("loginError");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError("Email and password are required");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      showError(data.message || "Login failed");
      return;
    }

    // ✅ SAVE AUTH DATA
    localStorage.setItem("token", data.token);

    if (data.user && data.user.id) {
      localStorage.setItem("userId", data.user.id);
    }

    // ✅ REDIRECT TO CHAT
    window.location.href = "index.html";

  } catch (err) {
    showError("Server connection failed");
  }
});

function showError(msg) {
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  } else {
    alert(msg);
  }
}
