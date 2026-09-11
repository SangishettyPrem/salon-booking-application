import api from "@/api/api";
import {
  setServerDown,
  setSessionExpired,
} from "@/redux/features/app/app.slice";
import { logout, setCredentials } from "@/redux/features/auth/auth.slice";
import store from "@/redux/store";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

// Response Interceptor: Catch 401 & Auto-Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = store.getState().auth.access_token;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const backendError = error.response?.data;
    const status = error.response?.status;

    if (error.code === "ERR_NETWORK" || !error.response) {
      store.dispatch(setServerDown(true));
      return Promise.reject(error);
    } else if (status == 401 && backendError?.code === "SESSION_EXPIRED") {
      store.dispatch(setSessionExpired(true));
      return Promise.reject(error);
    }
    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint &&
      backendError.code === "ACCESS_TOKEN_EXPIRED"
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend refresh endpoint (with credentials for 'rt' cookie)
        const { data } = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (data.success && data.access_token) {
          const newToken = data.access_token;

          // Update Redux state
          store.dispatch(
            setCredentials({
              accessToken: newToken,
              user: data.user,
            }),
          );

          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token expired / revoked -> logout and redirect
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
