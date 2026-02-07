const rawBase = import.meta.env.VITE_API_BASE || "";
const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export const apiUrl = (path) => {
  if (!path) {
    return base || "/";
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};
