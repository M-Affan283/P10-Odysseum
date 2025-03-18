import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAdminStore from '../../store/adminStore'

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, logout } = useAdminStore()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const navigation = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'User Reports',
            path: '/reports/users',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M19 8l-2 3h4l-2 3"></path>
                </svg>
            )
        },
        {
            name: 'Post Reports',
            path: '/reports/posts',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14h16M4 10h16M4 6h16M4 18h12"></path>
                    <path d="M18 18l3 3m0-3l-3 3"></path>
                </svg>
            )
        },
        {
            name: 'Users',
            path: '/users',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Posts',
            path: '/posts',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: 'Locations',
            path: '/locations',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ]

    return (
        <div className="h-screen flex overflow-hidden bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Mobile menu */}
            <div
                className={`fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full bg-gray-800 transform ease-in-out duration-300 md:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
                    <div className="flex items-center">
                        <div className="text-xl font-bold text-purple-500">Odysseum Admin</div>
                    </div>
                    <button
                        onClick={toggleMobileMenu}
                        className="p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <nav className="px-2 py-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors
                  ${location.pathname === item.path
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <div className={`mr-4 ${location.pathname === item.path ? 'text-purple-500' : 'text-gray-400'}`}>
                                    {item.icon}
                                </div>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-gray-400 hover:text-white"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col h-0 flex-1 bg-gray-800">
                        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-700">
                            <div className={`text-xl font-bold text-purple-500 transition-opacity duration-200 ${!isSidebarOpen && 'opacity-0 w-0'}`}>
                                Odysseum Admin
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="h-8 w-8 flex items-center justify-center rounded-md text-gray-400 hover:text-white focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <nav className="flex-1 px-4 py-4 space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors
                      ${location.pathname === item.path
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <div className={`mr-3 ${location.pathname === item.path ? 'text-purple-500' : 'text-gray-400'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`transition-opacity duration-200 ${!isSidebarOpen && 'opacity-0 w-0'}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="border-t border-gray-700 p-4">
                            <div className="flex items-center">
                                <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className={`ml-3 transition-opacity duration-200 ${!isSidebarOpen && 'opacity-0 w-0'}`}>
                                    <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs text-gray-400 hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center shadow-sm">
                    <button
                        onClick={toggleMobileMenu}
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="ml-4">
                        <h1 className="text-xl font-medium text-purple-500">Odysseum Admin</h1>
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;