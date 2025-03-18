import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

// Add token to axios requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

const useAdminStore = create(
    persist(
        (set, get) => ({
            // Authentication state
            user: null,
            isAuthenticated: false,
            authLoading: false,
            authError: null,

            // Users state
            users: [],
            totalUsers: 0,

            // Dashboard stats
            stats: {
                totalUsers: 0,
                totalPosts: 0,
                totalLocations: 0
            },
            recentUsers: [],

            // Reports state
            reports: {
                userReports: [],
                postReports: [],
                totalUserReports: 0,
                totalPostReports: 0,
                currentReport: null,
                comments: [],
            },

            // Loading states
            dashboardLoading: false,
            usersLoading: false,
            reportsLoading: false,
            reportDetailsLoading: false,

            // Error states
            dashboardError: null,
            usersError: null,
            reportsError: null,

            // Auth actions
            login: async (credentials) => {
                set({ authLoading: true, authError: null })
                try {
                    const response = await api.post('/user/login', credentials)

                    if (response.data.success) {
                        // Check if user is admin
                        if (response.data.user.role !== 'admin') {
                            set({
                                authLoading: false,
                                authError: 'Unauthorized access. Admin privileges required.'
                            })
                            return false
                        }

                        localStorage.setItem('accessToken', response.data.accessToken)
                        localStorage.setItem('refreshToken', response.data.refreshToken)

                        set({
                            isAuthenticated: true,
                            user: response.data.user,
                            authLoading: false,
                            authError: null
                        })
                        return true
                    } else {
                        set({
                            authLoading: false,
                            authError: response.data.message || 'Login failed'
                        })
                        return false
                    }
                } catch (error) {
                    set({
                        isAuthenticated: false,
                        user: null,
                        authLoading: false,
                        authError: error.response?.data?.message || 'Login failed'
                    })
                    return false
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                set({
                    isAuthenticated: false,
                    user: null,
                    authError: null
                })
            },

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

            clearAuthError: () => set({ authError: null }),

            // Dashboard actions
            fetchDashboardStats: async () => {
                set({ dashboardLoading: true, dashboardError: null })
                try {
                    // Using existing backend endpoints
                    const [usersResponse, postsResponse, locationsResponse] = await Promise.all([
                        api.get('/user/getAll?limit=1'),
                        api.get('/post/getAll?limit=1'),
                        api.get('/location/getAll?limit=1')
                    ])

                    // Calculate total counts from pagination
                    const stats = {
                        totalUsers: usersResponse.data.pagination?.totalUsers || 0,
                        totalPosts: postsResponse.data.pagination?.totalPosts || 0,
                        totalLocations: locationsResponse.data.pagination?.totalLocations || 0
                    }

                    // Get recent users
                    const recentUsersResponse = await api.get('/user/getAll?page=1&limit=5')

                    set({
                        stats,
                        recentUsers: recentUsersResponse.data.users || [],
                        dashboardLoading: false
                    })
                } catch (error) {
                    set({
                        dashboardLoading: false,
                        dashboardError: error.response?.data?.message || 'Failed to fetch dashboard data'
                    })
                }
            },

            // Users actions
            fetchUsers: async (page = 1, limit = 10) => {
                set({ usersLoading: true, usersError: null })
                try {
                    const response = await api.get(`/user/getAll?page=${page}&limit=${limit}`)

                    if (response.data.success) {
                        set({
                            users: response.data.users,
                            totalUsers: response.data.pagination.totalUsers,
                            usersLoading: false
                        })
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message
                        })
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to fetch users'
                    })
                }
            },

            // Report actions
            // Fetch user reports
            fetchUserReports: async (page = 1, status = null) => {
                set({ reportsLoading: true, reportsError: null });
                try {
                    let url = `/admin/reports/users?page=${page}`;
                    if (status) {
                        url += `&status=${status}`;
                    }

                    const response = await api.get(url);

                    if (response.data.success) {
                        set({
                            reports: {
                                ...get().reports,
                                userReports: response.data.reports,
                                totalUserReports: response.data.pagination.totalReports
                            },
                            reportsLoading: false
                        });
                    } else {
                        set({
                            reportsLoading: false,
                            reportsError: response.data.message || 'Failed to fetch user reports'
                        });
                    }
                } catch (error) {
                    set({
                        reportsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to fetch user reports'
                    });
                }
            },

            // Fetch post reports
            fetchPostReports: async (page = 1, status = null) => {
                set({ reportsLoading: true, reportsError: null });
                try {
                    let url = `/admin/reports/posts?page=${page}`;
                    if (status) {
                        url += `&status=${status}`;
                    }

                    const response = await api.get(url);

                    if (response.data.success) {
                        set({
                            reports: {
                                ...get().reports,
                                postReports: response.data.reports,
                                totalPostReports: response.data.pagination.totalReports
                            },
                            reportsLoading: false
                        });
                    } else {
                        set({
                            reportsLoading: false,
                            reportsError: response.data.message || 'Failed to fetch post reports'
                        });
                    }
                } catch (error) {
                    set({
                        reportsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to fetch post reports'
                    });
                }
            },

            // Fetch single user report details
            fetchUserReportDetails: async (reportId) => {
                set({ reportDetailsLoading: true, reportsError: null });
                try {
                    const response = await api.get(`/admin/reports/users/${reportId}`);

                    if (response.data.success) {
                        set({
                            reports: {
                                ...get().reports,
                                currentReport: response.data.report
                            },
                            reportDetailsLoading: false
                        });
                    } else {
                        set({
                            reportDetailsLoading: false,
                            reportsError: response.data.message || 'Failed to fetch report details'
                        });
                    }
                } catch (error) {
                    set({
                        reportDetailsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to fetch report details'
                    });
                }
            },

            // Fetch single post report details
            fetchPostReportDetails: async (reportId) => {
                set({ reportDetailsLoading: true, reportsError: null });
                try {
                    const response = await api.get(`/admin/reports/posts/${reportId}`);

                    if (response.data.success) {
                        set({
                            reports: {
                                ...get().reports,
                                currentReport: response.data.report,
                                comments: response.data.comments || []
                            },
                            reportDetailsLoading: false
                        });
                    } else {
                        set({
                            reportDetailsLoading: false,
                            reportsError: response.data.message || 'Failed to fetch report details'
                        });
                    }
                } catch (error) {
                    set({
                        reportDetailsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to fetch report details'
                    });
                }
            },

            // Update report status
            updateReportStatus: async (reportId, reportType, status, adminNotes = '') => {
                set({ reportsLoading: true, reportsError: null });
                try {
                    const response = await api.post('/admin/reports/update-status', {
                        reportId,
                        reportType,
                        status,
                        adminNotes
                    });

                    if (response.data.success) {
                        // Update the current report if it's the one being viewed
                        if (get().reports.currentReport && get().reports.currentReport._id === reportId) {
                            set({
                                reports: {
                                    ...get().reports,
                                    currentReport: response.data.report
                                }
                            });
                        }

                        // Refresh the reports list
                        if (reportType === 'user') {
                            await get().fetchUserReports();
                        } else {
                            await get().fetchPostReports();
                        }

                        set({ reportsLoading: false });
                        return true;
                    } else {
                        set({
                            reportsLoading: false,
                            reportsError: response.data.message || 'Failed to update report status'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        reportsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to update report status'
                    });
                    return false;
                }
            },

            // Delete reported user
            deleteReportedUser: async (reportId, userId) => {
                set({ reportsLoading: true, reportsError: null });
                try {
                    const response = await api.post('/admin/reports/delete-user', {
                        reportId,
                        userId
                    });

                    if (response.data.success) {
                        // Refresh user reports
                        await get().fetchUserReports();

                        set({
                            reportsLoading: false,
                            reports: {
                                ...get().reports,
                                currentReport: response.data.report
                            }
                        });
                        return true;
                    } else {
                        set({
                            reportsLoading: false,
                            reportsError: response.data.message || 'Failed to delete user'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        reportsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to delete user'
                    });
                    return false;
                }
            },

            // Delete reported post
            deleteReportedPost: async (reportId, postId) => {
                set({ reportsLoading: true, reportsError: null });
                try {
                    const response = await api.post('/admin/reports/delete-post', {
                        reportId,
                        postId
                    });

                    if (response.data.success) {
                        // Refresh post reports
                        await get().fetchPostReports();

                        set({
                            reportsLoading: false,
                            reports: {
                                ...get().reports,
                                currentReport: response.data.report
                            }
                        });
                        return true;
                    } else {
                        set({
                            reportsLoading: false,
                            reportsError: response.data.message || 'Failed to delete post'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        reportsLoading: false,
                        reportsError: error.response?.data?.message || 'Failed to delete post'
                    });
                    return false;
                }
            },

            // Clear current report
            clearCurrentReport: () => {
                set({
                    reports: {
                        ...get().reports,
                        currentReport: null,
                        comments: []
                    }
                });
            },

            clearErrors: () => set({
                authError: null,
                dashboardError: null,
                usersError: null,
                reportsError: null
            })
        }),
        {
            name: 'admin-store',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
)

export default useAdminStore