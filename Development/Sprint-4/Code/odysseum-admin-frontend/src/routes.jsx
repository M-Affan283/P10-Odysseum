import { Route, Routes as RouterRoutes, Navigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import UserReportsPage from './pages/reports/UserReportsPage'
import UserReportDetailsPage from './pages/reports/UserReportDetailsPage'
import PostReportsPage from './pages/reports/PostReportsPage'
import PostReportDetailsPage from './pages/reports/PostReportDetailsPage'
import PendingBusinessesPage from './pages/businesses/PendingBusinessesPage';
import ApprovedBusinessesPage from './pages/businesses/ApprovedBusinessesPage';
import BusinessDetailsPage from './pages/businesses/BusinessDetailsPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import LocationsPage from './pages/locations/LocationsPage';
import LocationDetailsPage from './pages/locations/LocationDetailsPage';
import PostsPage from './pages/posts/PostsPage';
import PostDetailsPage from './pages/posts/PostDetailsPage';
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

            {/* Business Routes */}
            <Route path="/businesses" element={
                <ProtectedRoute>
                    <Navigate to="/businesses/pending" replace />
                </ProtectedRoute>
            } />

            <Route path="/businesses/pending" element={
                <ProtectedRoute>
                    <PendingBusinessesPage />
                </ProtectedRoute>
            } />

            <Route path="/businesses/approved" element={
                <ProtectedRoute>
                    <ApprovedBusinessesPage />
                </ProtectedRoute>
            } />

            <Route path="/businesses/:businessId" element={
                <ProtectedRoute>
                    <BusinessDetailsPage />
                </ProtectedRoute>
            } />

            
            {/* User Routes */}
            <Route path="/users" element={
                <ProtectedRoute>
                    <UsersPage />
                </ProtectedRoute>
            } />

            <Route path="/users/:userId" element={
                <ProtectedRoute>
                    <UserDetailsPage />
                </ProtectedRoute>
            } />

            {/* Location Routes */}
            <Route path="/locations" element={
                <ProtectedRoute>
                    <LocationsPage />
                </ProtectedRoute>
            } />

            <Route path="/locations/:locationId" element={
                <ProtectedRoute>
                    <LocationDetailsPage />
                </ProtectedRoute>
            } />

            {/* Post Routes */}
            <Route path="/posts" element={
                <ProtectedRoute>
                    <PostsPage />
                </ProtectedRoute>
            } />

            <Route path="/posts/:postId" element={
                <ProtectedRoute>
                    <PostDetailsPage />
                </ProtectedRoute>
            } />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </RouterRoutes>
    )
}