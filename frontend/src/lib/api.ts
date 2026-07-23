const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("proofmind_token");
}

// Set auth token
export function setToken(token: string) {
  localStorage.setItem("proofmind_token", token);
}

// Clear auth
export function clearAuth() {
  localStorage.removeItem("proofmind_token");
  localStorage.removeItem("proofmind_user");
}

// Get stored user
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("proofmind_user");
  return user ? JSON.parse(user) : null;
}

// Store user
export function setStoredUser(user: any) {
  localStorage.setItem("proofmind_user", JSON.stringify(user));
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// ── Auth API ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; name: string; role: string; institutionName?: string; country?: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => apiFetch("/auth/me"),
};

// ── Credentials API ─────────────────────────────────────────────────────
export const credentialsAPI = {
  issue: (formData: FormData) =>
    apiFetch("/credentials/issue", { method: "POST", body: formData }),

  mine: () => apiFetch("/credentials/mine"),

  issued: () => apiFetch("/credentials/issued"),

  get: (id: string) => apiFetch(`/credentials/${id}`),

  revoke: (id: string, reason: string) =>
    apiFetch(`/credentials/${id}/revoke`, { method: "POST", body: JSON.stringify({ reason }) }),

  adminAll: (page = 1, limit = 20) =>
    apiFetch(`/credentials/admin/all?page=${page}&limit=${limit}`),
};

// ── Verification API ────────────────────────────────────────────────────
export const verifyAPI = {
  verify: (data: { hash?: string; credentialId?: string; qrPayload?: string }) =>
    apiFetch("/verify", { method: "POST", body: JSON.stringify(data) }),

  bulk: (hashes: string[]) =>
    apiFetch("/verify/bulk", { method: "POST", body: JSON.stringify({ hashes }) }),

  shareLink: (token: string) =>
    apiFetch(`/verify/share/${token}`),
};

// ── Institutions API ────────────────────────────────────────────────────
export const institutionsAPI = {
  list: (verified?: boolean) =>
    apiFetch(`/institutions${verified !== undefined ? `?verified=${verified}` : ""}`),

  get: (id: string) => apiFetch(`/institutions/${id}`),

  apply: (data: any) =>
    apiFetch("/institutions/apply", { method: "POST", body: JSON.stringify(data) }),

  approve: (id: string, approved: boolean) =>
    apiFetch(`/institutions/${id}/approve`, { method: "PATCH", body: JSON.stringify({ approved }) }),
};

// ── Analytics API ───────────────────────────────────────────────────────
export const analyticsAPI = {
  overview: () => apiFetch("/analytics/overview"),
  institution: (id: string) => apiFetch(`/analytics/institution/${id}`),
  audit: (page = 1, limit = 50) => apiFetch(`/analytics/audit?page=${page}&limit=${limit}`),
};

// ── Share Links API ─────────────────────────────────────────────────────
export const shareAPI = {
  create: (credentialId: string, expiresInHours = 24, singleUse = false) =>
    apiFetch("/share-links", {
      method: "POST",
      body: JSON.stringify({ credentialId, expiresInHours, singleUse }),
    }),
};

// ── Admin API ───────────────────────────────────────────────────────────
export const adminAPI = {
  getOverview: () => apiFetch("/analytics/overview"),
  getInstitutions: () => apiFetch("/institutions"),
  getAuditLogs: () => apiFetch("/analytics/audit"),
  createInstitution: (data: any) =>
    apiFetch("/institutions", { method: "POST", body: JSON.stringify(data) }),
  updateInstitutionStatus: (id: string, status: "APPROVED" | "SUSPENDED" | "REVOKED") =>
    apiFetch(`/institutions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ── NEW: Jobs API (AI Matching) ────────────────────────────────────────
export const jobsAPI = {
  list: () => apiFetch("/jobs"),
  matches: () => apiFetch("/jobs/matches"),
  create: (data: any) => apiFetch("/jobs", { method: "POST", body: JSON.stringify(data) }),
};

// ── NEW: Expiry API ────────────────────────────────────────────────────
export const expiryAPI = {
  check: () => apiFetch("/expiry/check"),
  notifications: () => apiFetch("/expiry/notifications"),
};

// ── NEW: Equivalency API ───────────────────────────────────────────────
export const equivalencyAPI = {
  map: (credentialId: string, targetCountry?: string) =>
    apiFetch("/equivalency/map", { method: "POST", body: JSON.stringify({ credentialId, targetCountry }) }),
  get: (credentialId: string) => apiFetch(`/equivalency/${credentialId}`),
};

// ── NEW: Plagiarism API ────────────────────────────────────────────────
export const plagiarismAPI = {
  check: (data: any) => apiFetch("/plagiarism/check", { method: "POST", body: JSON.stringify(data) }),
  getReport: (credentialHash: string) => apiFetch(`/plagiarism/report/${credentialHash}`),
  verify: (thesisText: string) => apiFetch("/plagiarism/verify", { method: "POST", body: JSON.stringify({ thesisText }) }),
};

// ── NEW: Recovery API ──────────────────────────────────────────────────
export const recoveryAPI = {
  request: (data: any) => apiFetch("/recovery/request", { method: "POST", body: JSON.stringify(data) }),
  mine: () => apiFetch("/recovery/mine"),
  pending: () => apiFetch("/recovery/pending"),
  attest: (id: string, approved: boolean, reviewNotes?: string) =>
    apiFetch(`/recovery/${id}/attest`, { method: "POST", body: JSON.stringify({ approved, reviewNotes }) }),
};

// ── NEW: Skills API ────────────────────────────────────────────────────
export const skillsAPI = {
  updateProfile: (data: { title?: string; bio?: string; isPublic?: boolean }) =>
    apiFetch("/skills/profile", { method: "POST", body: JSON.stringify(data) }),
  addEntry: (credentialId: string, skillTag: string, weight?: number) =>
    apiFetch("/skills/profile/add", { method: "POST", body: JSON.stringify({ credentialId, skillTag, weight }) }),
  getProfile: (userId: string) => apiFetch(`/skills/profile/${userId}`),
};

// ── NEW: Fraud API ─────────────────────────────────────────────────────
export const fraudAPI = {
  score: (hash: string) => apiFetch(`/fraud/score/${hash}`),
};

// ── NEW: Notifications API ─────────────────────────────────────────────
export const notificationsAPI = {
  receipts: (page = 1, limit = 20) => apiFetch(`/notifications/receipts?page=${page}&limit=${limit}`),
  unreadCount: () => apiFetch("/notifications/unread-count"),
  markRead: (receiptIds?: string[]) =>
    apiFetch("/notifications/mark-read", { method: "POST", body: JSON.stringify({ receiptIds }) }),
};

// ── NEW: Bridge API ────────────────────────────────────────────────────
export const bridgeAPI = {
  request: (credentialId: string, targetChain: string) =>
    apiFetch("/bridge/request", { method: "POST", body: JSON.stringify({ credentialId, targetChain }) }),
  status: (id: string) => apiFetch(`/bridge/status/${id}`),
  byCredential: (credentialId: string) => apiFetch(`/bridge/credential/${credentialId}`),
};

// ── NEW: Leaderboard API ───────────────────────────────────────────────
export const leaderboardAPI = {
  stats: () => apiFetch("/leaderboard/stats"),
  topInstitutions: () => apiFetch("/leaderboard/top-institutions"),
};

// ── NEW: Offline API ───────────────────────────────────────────────────
export const offlineAPI = {
  bundle: () => apiFetch("/offline/bundle"),
  sync: (verifications: any[]) =>
    apiFetch("/offline/sync", { method: "POST", body: JSON.stringify({ verifications }) }),
};

