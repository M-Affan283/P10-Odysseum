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

            // Business state
            businesses: {
                pendingBusinesses: [],
                totalPendingBusinesses: 0,
                currentBusiness: null,
            },
            users: {
                allUsers: [],
                totalUsers: 0,
                currentUser: null,
                userPosts: [],
                totalUserPosts: 0,
                userComments: [],
                totalUserComments: 0
            },
            locations: {
                allLocations: [],
                totalLocations: 0,
                currentLocation: null,
                businessCount: 0,
                postCount: 0
            },
            posts: {
                allPosts: [],
                totalPosts: 0,
                currentPost: null,
                postComments: []
            },

            // Loading states
            dashboardLoading: false,
            usersLoading: false,
            reportsLoading: false,
            reportDetailsLoading: false,
            businessesLoading: false,
            usersLoading: false,
            locationsLoading: false,
            postsLoading: false,

            // Error states
            dashboardError: null,
            usersError: null,
            reportsError: null,
            businessesError: null,
            usersError: null,
            locationsError: null,
            postsError: null,

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
                set({ dashboardLoading: true, dashboardError: null });
                try {
                    const response = await api.get('/admin/dashboard/stats');
            
                    if (response.data.success) {
                        set({
                            stats: {
                                userCount: response.data.stats.userCount,
                                postCount: response.data.stats.postCount,
                                locationCount: response.data.stats.locationCount,
                                businessCount: response.data.stats.businessCount
                            },
                            recentUsers: response.data.stats.recentUsers || [],
                            dashboardLoading: false
                        });
                    } else {
                        set({
                            dashboardLoading: false,
                            dashboardError: response.data.message || 'Failed to fetch dashboard data'
                        });
                    }
                } catch (error) {
                    set({
                        dashboardLoading: false,
                        dashboardError: error.response?.data?.message || 'Failed to fetch dashboard data'
                    });
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

            // Business actions
            // Fetch pending businesses
            fetchPendingBusinesses: async (page = 1) => {
                set({ businessesLoading: true, businessesError: null });
                try {
                    const response = await api.get(`/admin/businesses/pending?page=${page}`);

                    if (response.data.success) {
                        set({
                            businesses: {
                                ...get().businesses,
                                pendingBusinesses: response.data.businesses,
                                totalPendingBusinesses: response.data.pagination.totalBusinesses
                            },
                            businessesLoading: false
                        });
                    } else {
                        set({
                            businessesLoading: false,
                            businessesError: response.data.message || 'Failed to fetch pending businesses'
                        });
                    }
                } catch (error) {
                    set({
                        businessesLoading: false,
                        businessesError: error.response?.data?.message || 'Failed to fetch pending businesses'
                    });
                }
            },

            // Fetch business details
            fetchBusinessDetails: async (businessId) => {
                set({ businessesLoading: true, businessesError: null });
                try {
                    const response = await api.get(`/admin/businesses/${businessId}`);

                    if (response.data.success) {
                        set({
                            businesses: {
                                ...get().businesses,
                                currentBusiness: response.data.business
                            },
                            businessesLoading: false
                        });
                    } else {
                        set({
                            businessesLoading: false,
                            businessesError: response.data.message || 'Failed to fetch business details'
                        });
                    }
                } catch (error) {
                    set({
                        businessesLoading: false,
                        businessesError: error.response?.data?.message || 'Failed to fetch business details'
                    });
                }
            },

            // Update business status
            updateBusinessStatus: async (businessId, status, adminNotes = '') => {
                set({ businessesLoading: true, businessesError: null });
                try {
                    const response = await api.post('/admin/businesses/update-status', {
                        businessId,
                        status,
                        adminNotes
                    });

                    if (response.data.success) {
                        // Update the current business if it's the one being viewed
                        if (get().businesses.currentBusiness && get().businesses.currentBusiness._id === businessId) {
                            set({
                                businesses: {
                                    ...get().businesses,
                                    currentBusiness: response.data.business
                                }
                            });
                        }

                        // Refresh the pending businesses list
                        await get().fetchPendingBusinesses();

                        set({ businessesLoading: false });
                        return true;
                    } else {
                        set({
                            businessesLoading: false,
                            businessesError: response.data.message || 'Failed to update business status'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        businessesLoading: false,
                        businessesError: error.response?.data?.message || 'Failed to update business status'
                    });
                    return false;
                }
            },

            // Clear current business
            clearCurrentBusiness: () => {
                set({
                    businesses: {
                        ...get().businesses,
                        currentBusiness: null
                    }
                });
            },
            // Fetch all users
            fetchUsers: async (page = 1, search = '') => {
                set({ usersLoading: true, usersError: null });
                try {
                    let url = `/admin/users?page=${page}`;
                    if (search) {
                        url += `&search=${encodeURIComponent(search)}`;
                    }

                    const response = await api.get(url);

                    if (response.data.success) {
                        set({
                            users: {
                                ...get().users,
                                allUsers: response.data.users,
                                totalUsers: response.data.pagination.totalUsers
                            },
                            usersLoading: false
                        });
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to fetch users'
                        });
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to fetch users'
                    });
                }
            },

            // Fetch user details
            fetchUserDetails: async (userId, postsPage = 1, commentsPage = 1) => {
                set({ usersLoading: true, usersError: null });
                try {
                    const response = await api.get(`/admin/users/${userId}?postsPage=${postsPage}&commentsPage=${commentsPage}`);

                    if (response.data.success) {
                        set({
                            users: {
                                ...get().users,
                                currentUser: response.data.user,
                                userPosts: response.data.posts.items,
                                totalUserPosts: response.data.posts.pagination.totalPosts,
                                userComments: response.data.comments.items,
                                totalUserComments: response.data.comments.pagination.totalComments
                            },
                            usersLoading: false
                        });
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to fetch user details'
                        });
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to fetch user details'
                    });
                }
            },

            // Delete user post
            deleteUserPost: async (postId) => {
                set({ usersLoading: true, usersError: null });
                try {
                    const response = await api.delete(`/admin/users/posts/${postId}`);

                    if (response.data.success) {
                        // Remove the deleted post from the store
                        set({
                            users: {
                                ...get().users,
                                userPosts: get().users.userPosts.filter(post => post._id !== postId),
                                totalUserPosts: get().users.totalUserPosts - 1
                            },
                            usersLoading: false
                        });
                        return true;
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to delete post'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to delete post'
                    });
                    return false;
                }
            },

            // Delete user comment
            deleteUserComment: async (commentId) => {
                set({ usersLoading: true, usersError: null });
                try {
                    const response = await api.delete(`/admin/users/comments/${commentId}`);

                    if (response.data.success) {
                        // Remove the deleted comment from the store
                        set({
                            users: {
                                ...get().users,
                                userComments: get().users.userComments.filter(comment => comment._id !== commentId),
                                totalUserComments: get().users.totalUserComments - 1
                            },
                            usersLoading: false
                        });
                        return true;
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to delete comment'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to delete comment'
                    });
                    return false;
                }
            },

            // Ban/unban user
            banUser: async (userId, banned, reason = '') => {
                set({ usersLoading: true, usersError: null });
                try {
                    const response = await api.post(`/admin/users/${userId}/ban`, {
                        banned,
                        reason
                    });

                    if (response.data.success) {
                        // Update the current user if it's the one being viewed
                        if (get().users.currentUser && get().users.currentUser._id === userId) {
                            set({
                                users: {
                                    ...get().users,
                                    currentUser: {
                                        ...get().users.currentUser,
                                        isDeactivated: banned
                                    }
                                }
                            });
                        }

                        // Update the user in the users list
                        set({
                            users: {
                                ...get().users,
                                allUsers: get().users.allUsers.map(user =>
                                    user._id === userId
                                        ? { ...user, isDeactivated: banned }
                                        : user
                                )
                            },
                            usersLoading: false
                        });
                        return true;
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to update user ban status'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to update user ban status'
                    });
                    return false;
                }
            },

            // Update user role
            updateUserRole: async (userId, role) => {
                set({ usersLoading: true, usersError: null });
                try {
                    const response = await api.post(`/admin/users/${userId}/role`, {
                        role
                    });

                    if (response.data.success) {
                        // Update the current user if it's the one being viewed
                        if (get().users.currentUser && get().users.currentUser._id === userId) {
                            set({
                                users: {
                                    ...get().users,
                                    currentUser: {
                                        ...get().users.currentUser,
                                        role
                                    }
                                }
                            });
                        }

                        // Update the user in the users list
                        set({
                            users: {
                                ...get().users,
                                allUsers: get().users.allUsers.map(user =>
                                    user._id === userId
                                        ? { ...user, role }
                                        : user
                                )
                            },
                            usersLoading: false
                        });
                        return true;
                    } else {
                        set({
                            usersLoading: false,
                            usersError: response.data.message || 'Failed to update user role'
                        });
                        return false;
                    }
                } catch (error) {
                    set({
                        usersLoading: false,
                        usersError: error.response?.data?.message || 'Failed to update user role'
                    });
                    return false;
                }
            },

            // Clear current user
            clearCurrentUser: () => {
                set({
                    users: {
                        ...get().users,
                        currentUser: null,
                        userPosts: [],
                        userComments: []
                    }
                });
            },
            // Fetch all locations
            fetchLocations: async (page = 1, search = '') => {
                set({ locationsLoading: true, locationsError: null });
                try {
                    let url = `/admin/locations?page=${page}`;
                    if (search) {
                        url += `&search=${encodeURIComponent(search)}`;
                    }

                    const response = await api.get(url);

                    if (response.data.success) {
                        set({
                            locations: {
                                ...get().locations,
                                allLocations: response.data.locations,
                                totalLocations: response.data.pagination.totalLocations
                            },
                            locationsLoading: false
                        });
                    } else {
                        set({
                            locationsLoading: false,
                            locationsError: response.data.message || 'Failed to fetch locations'
                        });
                    }
                } catch (error) {
                    set({
                        locationsLoading: false,
                        locationsError: error.response?.data?.message || 'Failed to fetch locations'
                    });
                }
            },

            // Fetch location details
            fetchLocationDetails: async (locationId) => {
                set({ locationsLoading: true, locationsError: null });
                try {
                    const response = await api.get(`/admin/locations/${locationId}`);

                    if (response.data.success) {
                        set({
                            locations: {
                                ...get().locations,
                                currentLocation: response.data.location,
                                businessCount: response.data.businessCount,
                                postCount: response.data.postCount
                            },
                            locationsLoading: false
                        });
                    } else {
                        set({
                            locationsLoading: false,
                            locationsError: response.data.message || 'Failed to fetch location details'
                        });
                    }
                } catch (error) {
                    set({
                        locationsLoading: false,
                        locationsError: error.response?.data?.message || 'Failed to fetch location details'
                    });
                }
            },

            // Create new location
            createLocation: async (locationData) => {
                set({ locationsLoading: true, locationsError: null });
                try {
                    const response = await api.post('/admin/locations', locationData);

                    if (response.data.success) {
                        // Refresh the locations list
                        await get().fetchLocations();

                        set({ locationsLoading: false });
                        return { success: true, location: response.data.location };
                    } else {
                        set({
                            locationsLoading: false,
                            locationsError: response.data.message || 'Failed to create location'
                        });
                        return { success: false, error: response.data.message };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to create location';
                    set({
                        locationsLoading: false,
                        locationsError: errorMessage
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Update location
            updateLocation: async (locationId, locationData) => {
                set({ locationsLoading: true, locationsError: null });
                try {
                    const response = await api.put(`/admin/locations/${locationId}`, locationData);

                    if (response.data.success) {
                        set({
                            locations: {
                                ...get().locations,
                                currentLocation: response.data.location
                            },
                            locationsLoading: false
                        });
                        return { success: true };
                    } else {
                        set({
                            locationsLoading: false,
                            locationsError: response.data.message || 'Failed to update location'
                        });
                        return { success: false, error: response.data.message };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to update location';
                    set({
                        locationsLoading: false,
                        locationsError: errorMessage
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Delete location
            deleteLocation: async (locationId) => {
                set({ locationsLoading: true, locationsError: null });
                try {
                    const response = await api.delete(`/admin/locations/${locationId}`);

                    if (response.data.success) {
                        // Clear current location and refresh locations list
                        set({
                            locations: {
                                ...get().locations,
                                currentLocation: null
                            }
                        });

                        await get().fetchLocations();

                        set({ locationsLoading: false });
                        return { success: true };
                    } else {
                        set({
                            locationsLoading: false,
                            locationsError: response.data.message || 'Failed to delete location'
                        });
                        return { success: false, error: response.data.message };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to delete location';
                    set({
                        locationsLoading: false,
                        locationsError: errorMessage
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Clear current location
            clearCurrentLocation: () => {
                set({
                    locations: {
                        ...get().locations,
                        currentLocation: null
                    }
                });
            },

            // Fetch all posts
            fetchPosts: async (page = 1, search = '') => {
                set({ postsLoading: true, postsError: null });
                try {
                    let url = `/admin/posts?page=${page}`;
                    if (search) {
                        url += `&search=${encodeURIComponent(search)}`;
                    }

                    const response = await api.get(url);

                    if (response.data.success) {
                        set({
                            posts: {
                                ...get().posts,
                                allPosts: response.data.posts,
                                totalPosts: response.data.pagination.totalPosts
                            },
                            postsLoading: false
                        });
                    } else {
                        set({
                            postsLoading: false,
                            postsError: response.data.message || 'Failed to fetch posts'
                        });
                    }
                } catch (error) {
                    set({
                        postsLoading: false,
                        postsError: error.response?.data?.message || 'Failed to fetch posts'
                    });
                }
            },

            // Fetch post details
            fetchPostDetails: async (postId) => {
                set({ postsLoading: true, postsError: null });
                try {
                    const response = await api.get(`/admin/posts/${postId}`);

                    if (response.data.success) {
                        set({
                            posts: {
                                ...get().posts,
                                currentPost: response.data.post,
                                postComments: response.data.comments
                            },
                            postsLoading: false
                        });
                    } else {
                        set({
                            postsLoading: false,
                            postsError: response.data.message || 'Failed to fetch post details'
                        });
                    }
                } catch (error) {
                    set({
                        postsLoading: false,
                        postsError: error.response?.data?.message || 'Failed to fetch post details'
                    });
                }
            },

            // Delete post
            deletePost: async (postId) => {
                set({ postsLoading: true, postsError: null });
                try {
                    const response = await api.delete(`/admin/posts/${postId}`);

                    if (response.data.success) {
                        set({
                            posts: {
                                ...get().posts,
                                currentPost: null,
                                postComments: []
                            },
                            postsLoading: false
                        });
                        return { success: true };
                    } else {
                        set({
                            postsLoading: false,
                            postsError: response.data.message || 'Failed to delete post'
                        });
                        return { success: false, error: response.data.message };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to delete post';
                    set({
                        postsLoading: false,
                        postsError: errorMessage
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Delete comment
            deleteComment: async (commentId) => {
                set({ postsLoading: true, postsError: null });
                try {
                    const response = await api.delete(`/admin/comments/${commentId}`);

                    if (response.data.success) {
                        // Update comments list by removing the deleted comment and any replies
                        set({
                            posts: {
                                ...get().posts,
                                postComments: get().posts.postComments.filter(comment => {
                                    // Remove the comment if it matches the deleted comment ID
                                    if (comment._id === commentId) {
                                        return false;
                                    }

                                    // If it's a top-level comment, filter out any deleted replies
                                    if (comment.replies) {
                                        comment.replies = comment.replies.filter(
                                            reply => reply._id !== commentId
                                        );
                                    }

                                    return true;
                                })
                            },
                            postsLoading: false
                        });
                        return { success: true };
                    } else {
                        set({
                            postsLoading: false,
                            postsError: response.data.message || 'Failed to delete comment'
                        });
                        return { success: false, error: response.data.message };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to delete comment';
                    set({
                        postsLoading: false,
                        postsError: errorMessage
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Clear current post
            clearCurrentPost: () => {
                set({
                    posts: {
                        ...get().posts,
                        currentPost: null,
                        postComments: []
                    }
                });
            },

            clearErrors: () => set({
                authError: null,
                dashboardError: null,
                usersError: null,
                reportsError: null,
                businessesError: null,
                usersError: null,
                locationsError: null,
                postsError: null
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