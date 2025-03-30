import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import ReportStatus from '../../components/reports/ReportStatus';
import ReportActions from '../../components/reports/ReportActions';

const UserReportDetailsPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();

    const {
        fetchUserReportDetails,
        reports,
        reportDetailsLoading,
        reportsError,
        clearCurrentReport
    } = useAdminStore();

    const report = reports.currentReport;

    useEffect(() => {
        fetchUserReportDetails(reportId);

        // Cleanup when component unmounts
        return () => {
            clearCurrentReport();
        };
    }, [fetchUserReportDetails, reportId, clearCurrentReport]);

    const handleReportActionSuccess = () => {
        // Refresh the report data
        fetchUserReportDetails(reportId);
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/reports/users')}
                        className="flex items-center text-gray-400 hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back to Reports
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">User Report Details</h1>

                {reportsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading report</div>
                        <div className="mt-1">{reportsError}</div>
                    </div>
                )}

                {reportDetailsLoading ? (
                    <div className="bg-gray-800 rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="ml-4 text-gray-400">Loading report details...</div>
                    </div>
                ) : !report ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                        Report not found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Report overview */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Report Summary</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Status</div>
                                        <ReportStatus status={report.status} />
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Date Reported</div>
                                        <div className="text-white">{new Date(report.createdAt).toLocaleString()}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Reported By</div>
                                        <div className="flex items-center">
                                            <img
                                                src={report.reportingUser?.profilePicture || 'https://via.placeholder.com/40'}
                                                alt={report.reportingUser?.username}
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                            <span className="text-white">{report.reportingUser?.username}</span>
                                        </div>
                                    </div>

                                    {report.reviewedBy && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Reviewed By</div>
                                            <div className="text-white">{report.reviewedBy.username}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <div className="text-sm text-gray-400 mb-1">Reason for Report</div>
                                    <div className="bg-gray-700 p-4 rounded-md text-white">{report.reason}</div>
                                </div>

                                {report.adminNotes && (
                                    <div className="mt-6">
                                        <div className="text-sm text-gray-400 mb-1">Admin Notes</div>
                                        <div className="bg-gray-700 p-4 rounded-md text-white whitespace-pre-line">{report.adminNotes}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reported user profile */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Reported User</h2>

                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                        <img
                                            src={report.reportedUser?.profilePicture || 'https://via.placeholder.com/150'}
                                            alt={report.reportedUser?.username}
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Username</div>
                                                <div className="text-white text-lg font-medium">{report.reportedUser?.username}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Name</div>
                                                <div className="text-white">
                                                    {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Email</div>
                                                <div className="text-white">{report.reportedUser?.email}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Member Since</div>
                                                <div className="text-white">
                                                    {new Date(report.reportedUser?.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {report.reportedUser?.bio && (
                                            <div className="mt-4">
                                                <div className="text-sm text-gray-400 mb-1">Bio</div>
                                                <div className="text-white">{report.reportedUser.bio}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Report Actions</h2>
                                <ReportActions
                                    report={report}
                                    reportType="user"
                                    onSuccess={handleReportActionSuccess}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default UserReportDetailsPage;