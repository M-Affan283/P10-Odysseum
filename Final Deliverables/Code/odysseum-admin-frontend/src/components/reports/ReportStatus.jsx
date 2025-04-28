import React from 'react';

const ReportStatus = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'under_review':
                return 'bg-blue-500';
            case 'resolved':
                return 'bg-green-500';
            case 'dismissed':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'under_review':
                return 'Under Review';
            case 'resolved':
                return 'Resolved';
            case 'dismissed':
                return 'Dismissed';
            default:
                return 'Unknown';
        }
    };

    return (
        <span className={`${getStatusColor(status)} text-white text-xs px-3 py-1 rounded-full font-medium`}>
            {getStatusText(status)}
        </span>
    );
};

export default ReportStatus;