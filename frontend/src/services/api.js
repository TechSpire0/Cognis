// src/services/api.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

function getAuthHeader() {
  const token = localStorage.getItem("cognis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// parse response body safely (text or json)
async function parseResponse(resp) {
  let text = "";
  try {
    text = await resp.text();
  } catch {
    text = "";
  }

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { data, text };
}

// Make sure "message" is always a string before doing string operations
function normalizeMessage(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  try {
    // If it's an object/array, try to extract common fields
    if (typeof raw === "object") {
      if (raw.detail && typeof raw.detail === "string") return raw.detail;
      if (raw.message && typeof raw.message === "string") return raw.message;
      // else fallback to JSON string
      return JSON.stringify(raw);
    }
    // other primitive types (number, boolean)
    return String(raw);
  } catch {
    return String(raw);
  }
}

async function handleResp(resp) {
  const { data, text } = await parseResponse(resp);

  if (!resp.ok) {
    // Pick best candidate for message
    let candidate =
      data?.detail ??
      data?.message ??
      (typeof data === "string" ? data : null) ??
      resp.statusText;

    // Normalize to string safely
    const message = normalizeMessage(candidate).trim();

    // Lowercase-safe check
    const low = message ? message.toLowerCase() : "";

    // Map some common server responses into user-friendly messages
    let finalMessage = message || "Request failed";

    if (
      resp.status === 401 ||
      low.includes("invalid") ||
      low.includes("unauthorized")
    ) {
      finalMessage = "Invalid username or password.";
    } else if (
      low.includes("password reset required") ||
      low.includes("reset required")
    ) {
      finalMessage = message; // keep backend text so frontend can check for it
    } else if (low.includes("inactive") || low.includes("disabled")) {
      finalMessage = "Account inactive. Contact administrator.";
    } else if (resp.status === 403) {
      finalMessage = message || "Forbidden.";
    } else if (resp.status >= 500) {
      finalMessage = "Server error. Please try again later.";
    }

    const err = new Error(finalMessage);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  // success — return parsed data (or text if parsing failed)
  return data;
}

// ----------------- API helpers -----------------

export async function login({ username, email, password }) {
  // The backend expects form-encoded data under keys 'username' and 'password'
  const body = new URLSearchParams();
  body.append("username", email || username);
  body.append("password", password);

  const resp = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await handleResp(resp);

  if (data?.access_token) {
    localStorage.setItem("cognis_token", data.access_token);
  }

  return data;
}

export async function getCurrentUser() {
  const resp = await fetch(`${BASE}/auth/users/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  return handleResp(resp);
}

export async function changePassword({
  username_or_email,
  old_password,
  new_password,
}) {
  const resp = await fetch(`${BASE}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username_or_email, old_password, new_password }),
  });
  return handleResp(resp);
}

export async function apiGet(path, qs = {}) {
  const q = new URLSearchParams(qs).toString();
  const url = `${BASE}${path}${q ? `?${q}` : ""}`;
  const resp = await fetch(url, { headers: { ...getAuthHeader() } });
  return handleResp(resp);
}

export async function apiPost(path, body = {}, opts = {}) {
  const headers = { "Content-Type": "application/json", ...getAuthHeader() };
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    ...opts,
  });
  return handleResp(resp);
}

export async function apiPostForm(path, formData) {
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...getAuthHeader() }, // don't set content-type for FormData
    body: formData,
  });
  return handleResp(resp);
}

export async function downloadPdf(ufdr_id) {
  const resp = await fetch(`${BASE}/report/${ufdr_id}`, {
    method: "GET",
    headers: { ...getAuthHeader() },
  });

  if (!resp.ok) {
    const { data } = await parseResponse(resp);
    const message =
      normalizeMessage(data?.detail ?? data?.message) ||
      "Failed to download report.";
    throw new Error(message);
  }

  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cognis_report_${ufdr_id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function createUser({ username, email, role, temp_password }) {
  const resp = await fetch(`${BASE}/admin/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("cognis_token")}`,
    },
    body: JSON.stringify({
      username,
      email,
      role,
      temp_password,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    const msg =
      err?.detail || err?.message || `Request failed (${resp.status})`;
    throw new Error(msg);
  }

  return await resp.json();
}

export async function getAllUsers() {
  const [admins, investigators] = await Promise.all([
    apiGet("/users/admins"),
    apiGet("/users/investigators"),
  ]);
  return [...admins, ...investigators];
}

export async function getCaseAssignments() {
  return await apiGet("/cases/assignments");
}

export async function getCases() {
  return await apiGet("/cases/list");
}

export async function createCase(data) {
  const resp = await fetch(`${BASE}/cases/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("cognis_token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok)
    throw new Error((await resp.json()).detail || "Failed to create case.");
  return await resp.json();
}

export async function assignCase(data) {
  const resp = await fetch(`${BASE}/cases/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("cognis_token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok)
    throw new Error((await resp.json()).detail || "Failed to assign case.");
  return await resp.json();
}

export async function unassignCase(data) {
  const resp = await fetch(`${BASE}/cases/unassign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("cognis_token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok)
    throw new Error((await resp.json()).detail || "Failed to unassign case.");
  return await resp.json();
}

export async function getInvestigators() {
  return await apiGet("/users/investigators");
}

export async function getAuditLogs() {
  return await apiGet("/audit/logs");
}

// Fetch Admin Dashboard Summary
export async function getDashboardSummary() {
  const token = localStorage.getItem("token");

  // 🛑 No token yet → skip the request entirely
  if (!token) {
    console.warn("No token found — skipping dashboard fetch.");
    return null;
  }

  const res = await fetch("http://localhost:8000/api/v1/dashboard/summary", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // 🧩 Only redirect if a *token existed* but backend rejected it
  if (res.status === 401) {
    console.warn("Token expired or invalid. Redirecting to login...");
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized - Token expired");
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("Dashboard fetch failed:", res.status, text);
    throw new Error("Failed to fetch dashboard summary");
  }

  return res.json();
}

export async function getInvestigatorCases() {
  const [user, myCases] = await Promise.all([getCurrentUser(), getCases()]);

  return { user, myCases };
}


export async function getUfdrFiles(caseId) {
  return apiGet("/ufdr/list", { case_id: caseId });
}

export async function askChat(ufdrId, query) {
  return apiPost(`/chat/ask/${ufdrId}?q=${encodeURIComponent(query)}`);
}
