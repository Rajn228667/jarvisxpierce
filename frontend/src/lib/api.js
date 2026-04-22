import axios from 'axios';
import { getDeviceFingerprint } from './utils';
import { useAuthStore } from '@/store/auth';
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
        config.headers['X-Device-Fingerprint'] = getDeviceFingerprint();
    }
    return config;
});
let refreshing = null;
api.interceptors.response.use((r) => r, async (error) => {
    const original = error.config;
    const store = useAuthStore.getState();
    if (error.response?.status === 401 && !original?._retry && store.refreshToken) {
        original._retry = true;
        try {
            if (!refreshing) {
                refreshing = axios
                    .post(`${BASE_URL}/auth/refresh`, { refreshToken: store.refreshToken })
                    .then((res) => {
                    useAuthStore.getState().setTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
                    return res.data.accessToken;
                })
                    .catch(() => {
                    useAuthStore.getState().logout();
                    return null;
                })
                    .finally(() => {
                    refreshing = null;
                });
            }
            const newToken = await refreshing;
            if (newToken && original.headers) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            }
        }
        catch {
            /* ignore */
        }
    }
    return Promise.reject(error);
});
export const extractError = (e) => {
    const ax = e;
    return ax?.response?.data?.error || ax?.message || 'Неизвестная ошибка';
};
