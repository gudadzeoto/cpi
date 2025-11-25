import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://cpi-back.geostat.ge";

const api = axios.create({
  baseURL: API_BASE,
});

export default api;
