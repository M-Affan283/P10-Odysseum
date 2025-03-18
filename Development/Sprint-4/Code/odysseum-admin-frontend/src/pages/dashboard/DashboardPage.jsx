import { useEffect } from 'react'
import useAdminStore from '../../store/adminStore'
import MainLayout from '../../components/layouts/MainLayout'

// Dashboard stat card component
const StatCard = ({ title, value, icon, colorClass = "bg-purple-600" }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                    <div className="flex items-end justify-between">
                        <span className="text-white text-2xl sm:text-3xl font-bold">{value}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// User list item component
const UserListItem = ({ user }) => (
    <div className="flex items-center p-4 border-b border-gray-700 hover:bg-gray-700/30 transition-colors rounded-lg">
        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
            {user.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="ml-3 flex-1 min-w-0">
            <p className="text-white font-medium truncate">{user.username}</p>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>
        </div>
        <div className="text-gray-400 text-sm whitespace-nowrap">
            {new Date(user.createdAt).toLocaleDateString()}
        </div>
    </div>
);

const DashboardPage = () => {
    const {
        user,
        stats,
        recentUsers,
        dashboardLoading,
        dashboardError,
        fetchDashboardStats
    } = useAdminStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    return (
        <MainLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Welcome header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Welcome back, {user?.firstName || user?.username || 'Admin'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Here's what's happening with your platform today.
                    </p>
                </div>

                {/* Error message */}
                {dashboardError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading dashboard data</div>
                        <div className="mt-1">{dashboardError}</div>
                    </div>
                )}

                {/* Loading state */}
                {dashboardLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full absolute border-4 border-gray-700"></div>
                            <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Stats grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats?.totalUsers?.toLocaleString() || '0'}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                            />

                            <StatCard
                                title="Total Posts"
                                value={stats?.totalPosts?.toLocaleString() || '0'}
                                colorClass="bg-blue-600"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                }
                            />

                            <StatCard
                                title="Total Locations"
                                value={stats?.totalLocations?.toLocaleString() || '0'}
                                colorClass="bg-green-600"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            />
                        </div>

                        {/* Admin profile card */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Admin Profile
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    <div className="space-y-1">
                                        <div className="text-gray-400 text-sm">Username</div>
                                        <div className="text-white font-medium">{user?.username}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-400 text-sm">Email</div>
                                        <div className="text-white font-medium">{user?.email}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-400 text-sm">Role</div>
                                        <div className="text-white font-medium capitalize">{user?.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent users card */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl text-white font-semibold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Recent Users
                                    </h2>
                                    <button className="text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors">
                                        View all
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {recentUsers && recentUsers.length > 0 ? (
                                        recentUsers.map(user => (
                                            <UserListItem key={user._id} user={user} />
                                        ))
                                    ) : (
                                        <div className="text-gray-400 py-4 text-center">No users found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DashboardPage;