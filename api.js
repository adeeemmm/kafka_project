const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function saveToken(token, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export async function register(username, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return await response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok && data.token) {
    saveToken(data.token, data.username);
  }

  return data;
}

export async function sendMessage(message) {
  const response = await fetch(`${API_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message }),
  });

  return await response.json();
}
