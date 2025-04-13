import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import ReportStatus from '../../components/reports/ReportStatus';

const UserReportsPage = () => {
    const { fetchUserReports, reports, reportsLoading, reportsError } = useAdminStore();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchUserReports(page, filter || null);
    }, [fetchUserReports, page, filter]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            setPage(newPage);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">User Reports</h1>

                    <div className="flex items-center space-x-4">
                        <label className="text-gray-400">Filter by status:</label>
                        <select
                            value={filter}
                            onChange={handleFilterChange}
                            className="bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2"
                        >
                            <option value="">All Reports</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                </div>

                {reportsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading reports</div>
                        <div className="mt-1">{reportsError}</div>
                    </div>
                )}

                {/* Table of reports */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Reported User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Reported By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Date
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
                                {reportsLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading reports...</div>
                                        </td>
                                    </tr>
                                ) : reports.userReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    reports.userReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={report.reportedUser?.profilePicture || 'https://via.placeholder.com/40'}
                                                            alt={report.reportedUser?.username}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">
                                                            {report.reportedUser?.username || 'Unknown User'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">
                                                    {report.reportingUser?.username || 'Unknown User'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ReportStatus status={report.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/reports/users/${report._id}`}
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
                    {reports.totalUserReports > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(reports.totalUserReports / 10)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || reportsLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(reports.totalUserReports / 10) ||
                                        reportsLoading
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

export default UserReportsPage;