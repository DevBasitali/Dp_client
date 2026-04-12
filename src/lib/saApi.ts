import axios from "axios";

export const SA_TOKEN_KEY = "sa_token";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const saApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

saApi.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(SA_TOKEN_KEY) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

saApi.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(SA_TOKEN_KEY);
        window.location.href = "/super-admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export function decodeSaToken(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(SA_TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
