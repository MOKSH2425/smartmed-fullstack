const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const AUTH_TOKEN_KEY = "smartmed_token";

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const authTokenStorage = {
  get: getStoredToken,
  set(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.message || fallback;

const request = async (path, options = {}) => {
  const { method = "GET", body, headers = {}, token } = options;
  const authToken = token ?? getStoredToken();
  const config = {
    method,
    headers: { ...headers },
  };

  if (body !== undefined) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" && data?.message ? data.message : "Request failed."
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const getFilename = (response, fallback) => {
  const header = response.headers.get("content-disposition") || "";
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] || fallback;
};

const downloadFile = async (path, fallbackFilename) => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error(
      typeof data === "object" && data?.message ? data.message : "Download failed."
    );
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getFilename(response, fallbackFilename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const api = {
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
  getCurrentUser: () => request("/api/auth/me"),
  getDoctors: (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "All") {
        searchParams.set(key, value);
      }
    });

    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request(`/api/doctors${suffix}`);
  },
  getPreviousDoctors: () => request("/api/doctors/previous"),
  getAppointments: () => request("/api/appointments"),
  createAppointment: (payload) =>
    request("/api/appointments", { method: "POST", body: payload }),
  getProfile: () => request("/api/users/profile"),
  updateProfile: (payload) =>
    request("/api/users/profile", { method: "PUT", body: payload }),
  getSettings: () => request("/api/users/settings"),
  updateSettings: (payload) =>
    request("/api/users/settings", { method: "PUT", body: payload }),
  getReports: () => request("/api/reports"),
  downloadReport: (reportId, title) =>
    downloadFile(`/api/reports/${reportId}/download`, `${title}.txt`),
  getSymptomRecommendation: (symptom) =>
    request(`/api/symptoms/recommendation?symptom=${encodeURIComponent(symptom)}`),
  sendChatMessage: (message) =>
    request("/api/chat", { method: "POST", body: { message } }),
};
