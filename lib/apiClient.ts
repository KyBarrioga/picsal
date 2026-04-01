import axios from "axios";
import { createClient } from "lib/createBrowserClient";

const supabase = createClient();

export const api = axios.create({
  baseURL: process.env.PICSAL_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
