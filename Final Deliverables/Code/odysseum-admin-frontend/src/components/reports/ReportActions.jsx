import React, { useState } from 'react';
import useAdminStore from '../../store/adminStore';

const ReportActions = ({ report, reportType, onSuccess }) => {
    const [showNotes, setShowNotes] = useState(false);
    const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
    const [showConfirmation, setShowConfirmation] = useState('');

    const { updateReportStatus, deleteReportedUser, deleteReportedPost, reportsLoading } = useAdminStore();

    const handleUpdateStatus = async (status) => {
        const success = await updateReportStatus(
            report._id,
            reportType,
            status,
            adminNotes
        );

        if (success && onSuccess) {
            onSuccess();
        }

        setShowNotes(false);
        setShowConfirmation('');
    };

    const handleDeleteUser = async () => {
        const success = await deleteReportedUser(
            report._id,
            report.reportedUser._id
        );

        if (success && onSuccess) {
            onSuccess();
        }

        setShowConfirmation('');
    };

    const handleDeletePost = async () => {
        const success = await deleteReportedPost(
            report._id,
            report.reportedPost._id
        );

        if (success && onSuccess) {
            onSuccess();
        }

        setShowConfirmation('');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {report.status !== 'resolved' && (
                    <button
                        onClick={() => handleUpdateStatus('resolved')}
                        disabled={reportsLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        Mark Resolved
                    </button>
                )}

                {report.status !== 'dismissed' && (
                    <button
                        onClick={() => handleUpdateStatus('dismissed')}
                        disabled={reportsLoading}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        Dismiss Report
                    </button>
                )}

                {report.status !== 'under_review' && (
                    <button
                        onClick={() => handleUpdateStatus('under_review')}
                        disabled={reportsLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        Mark Under Review
                    </button>
                )}

                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    {showNotes ? 'Hide Notes' : 'Add/Edit Notes'}
                </button>

                {reportType === 'user' && (
                    <button
                        onClick={() => setShowConfirmation('deleteUser')}
                        disabled={reportsLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        Delete User
                    </button>
                )}

                {reportType === 'post' && (
                    <button
                        onClick={() => setShowConfirmation('deletePost')}
                        disabled={reportsLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        Delete Post
                    </button>
                )}
            </div>

            {showNotes && (
                <div className="mt-4">
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
                        placeholder="Add administrative notes about this report..."
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleUpdateStatus(report.status)}
                            disabled={reportsLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                            Save Notes
                        </button>
                    </div>
                </div>
            )}

            {showConfirmation === 'deleteUser' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm User Deletion</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation('')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={reportsLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmation === 'deletePost' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm Post Deletion</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation('')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                disabled={reportsLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                                Delete Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportActions;