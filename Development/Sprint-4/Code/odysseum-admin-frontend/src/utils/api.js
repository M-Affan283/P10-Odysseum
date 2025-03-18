import axios from 'axios'
import { getToken, refreshTokens, removeToken } from './tokenUtils'

// Create axios instance with default configurations
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/admin`, // Add /admin prefix to all API calls
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is 401 and we haven't tried refreshing token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Attempt to refresh the token
                const refreshed = await refreshTokens()

                if (refreshed) {
                    // Retry the original request
                    return api(originalRequest)
                } else {
                    // If refresh failed, clear auth and reject
                    removeToken()
                    return Promise.reject(error)
                }
            } catch (refreshError) {
                // If refresh failed, clear auth and reject
                removeToken()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api