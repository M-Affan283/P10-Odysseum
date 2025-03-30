import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// Create axios instance
const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

// Add token to axios requests
const addTokenToRequest = (config) => {
	const token = localStorage.getItem('accessToken')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
}

api.interceptors.request.use(addTokenToRequest)

// Zustand store for authentication
const useAuthStore = create(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Login action
			login: async (credentials) => {
				set({ isLoading: true, error: null })
				try {
					const response = await api.post('/user/login', credentials)

					if (response.data.success) {
						// Check if user is admin
						if (response.data.user.role !== 'admin') {
							set({
								isLoading: false,
								error: 'Unauthorized access. Admin privileges required.'
							})
							return false
						}

						localStorage.setItem('accessToken', response.data.accessToken)
						localStorage.setItem('refreshToken', response.data.refreshToken)

						set({
							isAuthenticated: true,
							user: response.data.user,
							isLoading: false,
							error: null
						})
						return true
					} else {
						set({
							isLoading: false,
							error: response.data.message || 'Login failed'
						})
						return false
					}
				} catch (error) {
					set({
						isAuthenticated: false,
						user: null,
						isLoading: false,
						error: error.response?.data?.message || 'Login failed'
					})
					return false
				}
			},

			// Logout action
			logout: () => {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				set({ isAuthenticated: false, user: null, error: null })
			},

			// Initialize from localStorage
			initAuth: () => {
				const token = localStorage.getItem('accessToken')
				const user = get().user

				if (token && user && user.role === 'admin') {
					set({ isAuthenticated: true })
				} else {
					localStorage.removeItem('accessToken')
					localStorage.removeItem('refreshToken')
					set({ isAuthenticated: false, user: null })
				}
			},

			// Clear error messages
			clearError: () => set({ error: null }),

			// Refresh token
			refreshToken: async () => {
				const refreshToken = localStorage.getItem('refreshToken')

				if (!refreshToken) {
					get().logout()
					return false
				}

				try {
					const response = await api.post('/user/refresh-token', { refreshToken })

					if (response.data.success) {
						localStorage.setItem('accessToken', response.data.accessToken)
						set({ user: response.data.user })
						return true
					} else {
						get().logout()
						return false
					}
				} catch (error) {
					get().logout()
					return false
				}
			},

			// Update user profile
			updateUserProfile: (updatedUser) => {
				set({ user: { ...get().user, ...updatedUser } })
			}
		}),
		{
			name: 'admin-auth-storage',
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated
			}),
		}
	)
)

export default useAuthStore