import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { SearchOutlined, ShopOutlined } from '@ant-design/icons';

const ApprovedBusinessesPage = () => {
    const { fetchApprovedBusinesses, businesses, businessesLoading, businessesError } = useAdminStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchApprovedBusinesses(page, search);
    }, [fetchApprovedBusinesses, page, search]);

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

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-white">Approved Businesses</h1>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="flex flex-1">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search businesses..."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                            >
                                <SearchOutlined />
                            </button>
                        </form>
                        <Link
                            to="/businesses/pending"
                            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            View Pending Requests
                        </Link>
                    </div>
                </div>

                {businessesError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading businesses</div>
                        <div className="mt-1">{businessesError}</div>
                    </div>
                )}

                {/* Table of businesses */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Business
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Approved On
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {businessesLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading businesses...</div>
                                        </td>
                                    </tr>
                                ) : businesses.approvedBusinesses?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            No approved businesses found
                                        </td>
                                    </tr>
                                ) : (
                                    businesses.approvedBusinesses?.map((business) => (
                                        <tr key={business._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                                                        {business.mediaUrls && business.mediaUrls.length > 0 ? (
                                                            <img
                                                                src={business.mediaUrls[0]}
                                                                alt={business.name}
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-purple-600 rounded flex items-center justify-center">
                                                                <ShopOutlined className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">
                                                            {business.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {business.address?.substring(0, 30)}
                                                            {business.address?.length > 30 ? '...' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            src={business.ownerId?.profilePicture || 'https://via.placeholder.com/40'}
                                                            alt={business.ownerId?.username}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-white">
                                                            {business.ownerId?.username || 'Unknown User'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-800 text-gray-100">
                                                    {business.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">
                                                    {business.locationId?.name || 'Unknown Location'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">
                                                    {formatDate(business.updatedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/businesses/approved/${business._id}`}
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

                    {/* Pagination */}
                    {businesses.totalApprovedBusinesses > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(businesses.totalApprovedBusinesses / 10)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || businessesLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(businesses.totalApprovedBusinesses / 10) ||
                                        businessesLoading
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

export default ApprovedBusinessesPage;