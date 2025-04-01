import { Route, Routes as RouterRoutes, Navigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import UserReportsPage from './pages/reports/UserReportsPage'
import UserReportDetailsPage from './pages/reports/UserReportDetailsPage'
import PostReportsPage from './pages/reports/PostReportsPage'
import PostReportDetailsPage from './pages/reports/PostReportDetailsPage'
import useAdminStore from './store/adminStore'

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAdminStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Extra check for admin role
    if (user?.role !== 'admin') {
        useAdminStore.getState().logout()
        return <Navigate to="/login" replace />
    }

    return children
}

export const Routes = () => {
    const { initAuth } = useAdminStore()

    useEffect(() => {
        initAuth()
    }, [initAuth])

    return (
        <RouterRoutes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            {/* Report Routes */}
            <Route path="/reports/users" element={
                <ProtectedRoute>
                    <UserReportsPage />
                </ProtectedRoute>
            } />

            <Route path="/reports/users/:reportId" element={
                <ProtectedRoute>
                    <UserReportDetailsPage />
                </ProtectedRoute>
            } />

            <Route path="/reports/posts" element={
                <ProtectedRoute>
                    <PostReportsPage />
                </ProtectedRoute>
            } />

            <Route path="/reports/posts/:reportId" element={
                <ProtectedRoute>
                    <PostReportDetailsPage />
                </ProtectedRoute>
            } />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </RouterRoutes>
    )
}