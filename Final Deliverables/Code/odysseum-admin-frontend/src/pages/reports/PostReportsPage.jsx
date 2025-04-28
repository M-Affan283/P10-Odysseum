import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import ReportStatus from '../../components/reports/ReportStatus';

const PostReportsPage = () => {
    const { fetchPostReports, reports, reportsLoading, reportsError } = useAdminStore();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchPostReports(page, filter || null);
    }, [fetchPostReports, page, filter]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            setPage(newPage);
        }
    };

    // Function to truncate text
    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Post Reports</h1>

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
                                        Post Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Post Creator
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
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading reports...</div>
                                        </td>
                                    </tr>
                                ) : reports.postReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    reports.postReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {report.reportedPost?.mediaUrls && report.reportedPost.mediaUrls[0] ? (
                                                        <img
                                                            className="h-16 w-16 object-cover rounded"
                                                            src={report.reportedPost.mediaUrls[0]}
                                                            alt="Post"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-gray-700 flex items-center justify-center rounded">
                                                            <span className="text-gray-500">No image</span>
                                                        </div>
                                                    )}
                                                    <div className="ml-4 max-w-xs">
                                                        <div className="text-sm text-gray-400">
                                                            {truncateText(report.reportedPost?.caption || 'No caption')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            src={report.reportedPost?.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                                            alt={report.reportedPost?.creatorId?.username}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-white">
                                                            {report.reportedPost?.creatorId?.username || 'Unknown User'}
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
                                                    to={`/reports/posts/${report._id}`}
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
                    {reports.totalPostReports > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(reports.totalPostReports / 10)}
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
                                        page >= Math.ceil(reports.totalPostReports / 10) ||
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

export default PostReportsPage;