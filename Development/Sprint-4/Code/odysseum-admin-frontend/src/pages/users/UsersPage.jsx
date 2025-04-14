import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';

const UsersPage = () => {
    const { fetchUsers, users, usersLoading, usersError } = useAdminStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchUsers(page, search);
    }, [fetchUsers, page, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            setPage(newPage);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Admin</span>;
            case 'businessOwner':
                return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Business Owner</span>;
            default:
                return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">User</span>;
        }
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-white">Users Management</h1>

                    <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name, username, email..."
                            className="w-full md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {usersError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading users</div>
                        <div className="mt-1">{usersError}</div>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {usersLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading users...</div>
                                        </td>
                                    </tr>
                                ) : users.allUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.allUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={user.profilePicture || 'https://via.placeholder.com/40'}
                                                            alt={user.username}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isDeactivated ? (
                                                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                                        Banned
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/users/${user._id}`}
                                                    className="text-purple-500 hover:text-purple-400"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.totalUsers > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(users.totalUsers / 10)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || usersLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(users.totalUsers / 10) ||
                                        usersLoading
                                    }
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default UsersPage;