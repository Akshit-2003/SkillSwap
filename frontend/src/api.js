import axios from "axios";

export const LOCAL_API_URL = "http://localhost:5000";
export const PROD_API_FALLBACK = "https://skillswapp-7vfs.onrender.com";
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const baseURL = isLocalBrowser
  ? import.meta.env.VITE_LOCAL_API_URL || LOCAL_API_URL
  : import.meta.env.VITE_API_URL || PROD_API_FALLBACK;

const API = axios.create({
  baseURL,
});

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseURL}/${normalizedPath}`;
};

export const buildApiUrlWithBase = (base, path = "") => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base.replace(/\/$/, "")}/${normalizedPath}`;
};

export const getApiBaseCandidates = () => {
  const configuredLocal = import.meta.env.VITE_LOCAL_API_URL || LOCAL_API_URL;
  const configuredProd = import.meta.env.VITE_API_URL || PROD_API_FALLBACK;
  return [...new Set([baseURL, configuredLocal, configuredProd].filter(Boolean))];
};

export default API;
