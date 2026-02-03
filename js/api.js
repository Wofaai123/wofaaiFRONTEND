const API_BASE = "https://wofa-ai-backend.onrender.com/api";


function getToken() {
  return localStorage.getItem("token");
}

async function apiPost(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
}
    },
    body: JSON.stringify(body)
  });

  return res.json();
}

async function apiGet(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
}
