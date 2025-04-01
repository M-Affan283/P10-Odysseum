import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import ReportStatus from '../../components/reports/ReportStatus';
import ReportActions from '../../components/reports/ReportActions';

const PostReportDetailsPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const {
        fetchPostReportDetails,
        reports,
        reportDetailsLoading,
        reportsError,
        clearCurrentReport
    } = useAdminStore();

    const report = reports.currentReport;
    const comments = reports.comments;

    useEffect(() => {
        fetchPostReportDetails(reportId);

        // Cleanup when component unmounts
        return () => {
            clearCurrentReport();
        };
    }, [fetchPostReportDetails, reportId, clearCurrentReport]);

    const handleReportActionSuccess = () => {
        // Refresh the report data
        fetchPostReportDetails(reportId);
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/reports/posts')}
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

                <h1 className="text-2xl font-bold text-white mb-6">Post Report Details</h1>

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

                        {/* Reported post content */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Reported Post</h2>

                                <div className="mb-4">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={report.reportedPost?.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                            alt={report.reportedPost?.creatorId?.username}
                                            className="w-10 h-10 rounded-full mr-2"
                                        />
                                        <div>
                                            <div className="text-white font-medium">
                                                {report.reportedPost?.creatorId?.username}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {report.reportedPost?.locationId?.name || 'No location'}
                                            </div>
                                        </div>
                                    </div>

                                    {report.reportedPost?.caption && (
                                        <div className="mb-4 text-white">
                                            {report.reportedPost.caption}
                                        </div>
                                    )}

                                    {report.reportedPost?.mediaUrls && report.reportedPost.mediaUrls.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <img
                                                    src={report.reportedPost.mediaUrls[activeImageIndex]}
                                                    alt={`Post media ${activeImageIndex + 1}`}
                                                    className="max-h-96 rounded-lg"
                                                />
                                            </div>

                                            {report.reportedPost.mediaUrls.length > 1 && (
                                                <div className="flex justify-center space-x-2">
                                                    {report.reportedPost.mediaUrls.map((url, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setActiveImageIndex(index)}
                                                            className={`w-3 h-3 rounded-full ${activeImageIndex === index ? 'bg-purple-500' : 'bg-gray-600'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-center p-8 bg-gray-700 rounded-lg">
                                            No media attached to this post
                                        </div>
                                    )}

                                    <div className="mt-4 text-gray-400 text-sm">
                                        Posted on {new Date(report.reportedPost?.createdAt).toLocaleString()}
                                        {report.reportedPost?.likes && (
                                            <span className="ml-4">
                                                {report.reportedPost.likes.length} likes
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        {comments && comments.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>

                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700">
                                                <img
                                                    src={comment.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                                    alt={comment.creatorId?.username}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <div className="text-white font-medium">
                                                        {comment.creatorId?.username}
                                                    </div>
                                                    <div className="text-white">{comment.text}</div>
                                                    <div className="text-gray-400 text-sm">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Report Actions</h2>
                                <ReportActions
                                    report={report}
                                    reportType="post"
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

export default PostReportDetailsPage;