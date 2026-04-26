// public/js/app.js
// ── API Base ────────────────────────────────────────────────────────────────
const API = (() => {
  const BASE = window.location.origin + "/api";

  const getToken = () => localStorage.getItem("auth_token");
  const setToken = (t) => localStorage.setItem("auth_token", t);
  const removeToken = () => localStorage.removeItem("auth_token");

  const headers = (extra = {}) => ({
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...extra,
  });

  const request = async (method, path, body) => {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  return {
    get: (p) => request("GET", p),
    post: (p, b) => request("POST", p, b),
    put: (p, b) => request("PUT", p, b),
    delete: (p) => request("DELETE", p),
    getToken, setToken, removeToken,
  };
})();

// ── Auth Helpers ────────────────────────────────────────────────────────────
const Auth = {
  save(token, user) {
    API.setToken(token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },
  clear() {
    API.removeToken();
    localStorage.removeItem("auth_user");
  },
  user() {
    try { return JSON.parse(localStorage.getItem("auth_user")); }
    catch { return null; }
  },
  isLoggedIn() { return !!API.getToken(); },
};

// ── Toast Notifications ─────────────────────────────────────────────────────
const Toast = (() => {
  let container = null;

  const ensure = () => {
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
  };

  const show = (message, type = "info", duration = 3500) => {
    ensure();
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add("removing");
      setTimeout(() => el.remove(), 300);
    }, duration);
  };

  return {
    success: (m, d) => show(m, "success", d),
    error:   (m, d) => show(m, "error", d),
    info:    (m, d) => show(m, "info", d),
  };
})();

// ── Form Helpers ────────────────────────────────────────────────────────────
function setLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.origText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.textContent = originalText || btn.dataset.origText;
  }
}

function showAlert(container, message, type = "error") {
  if (!container) return;
  const icons = { error: "⚠", success: "✓", info: "ℹ" };
  container.innerHTML = `
    <div class="alert alert-${type}">
      <span>${icons[type]}</span>
      <span>${message}</span>
    </div>`;
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearAlert(container) {
  if (container) container.innerHTML = "";
}

// ── Redirect Logic ──────────────────────────────────────────────────────────
function guardAuth() {
  const publicPages = ["/", "/index.html", "/login.html", "/signup.html"];
  const path = window.location.pathname;
  const isPublic = publicPages.some((p) => path.endsWith(p) || path === p);
  const isDashboard = path.includes("dashboard");

  if (isDashboard && !Auth.isLoggedIn()) {
    window.location.href = "/login.html";
  }
  if (!isDashboard && !isPublic && !Auth.isLoggedIn()) {
    window.location.href = "/login.html";
  }
}

guardAuth();
