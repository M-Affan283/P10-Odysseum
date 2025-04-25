import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';

const BusinessDetailsPage = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [adminNotes, setAdminNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(null);
    const {
        fetchBusinessDetails,
        updateBusinessStatus,
        businesses,
        businessesLoading,
        businessesError,
        clearCurrentBusiness
    } = useAdminStore();

    const business = businesses.currentBusiness;

    useEffect(() => {
        fetchBusinessDetails(businessId);

        // Cleanup when component unmounts
        return () => {
            clearCurrentBusiness();
        };
    }, [fetchBusinessDetails, businessId, clearCurrentBusiness]);

    const handleStatusUpdate = async (status) => {
        const success = await updateBusinessStatus(businessId, status, adminNotes);
        if (success) {
            setShowConfirmation(null);
            // Navigate to the appropriate page based on the new status
            if (status === 'Approved') {
                navigate('/businesses/approved');
            } else if (status === 'Rejected') {
                navigate('/businesses/pending');
            }
        }
    };

    // Format coordinates for display
    const formatCoordinates = (coordinates) => {
        if (!coordinates || !coordinates.coordinates) return 'N/A';
        const [longitude, latitude] = coordinates.coordinates;
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/businesses')}
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
                        Back to Business Requests
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">Business Request Details</h1>

                {businessesError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading business details</div>
                        <div className="mt-1">{businessesError}</div>
                    </div>
                )}

                {businessesLoading ? (
                    <div className="bg-gray-800 rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="ml-4 text-gray-400">Loading business details...</div>
                    </div>
                ) : !business ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                        Business not found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Business Details */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Business Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Business Name</div>
                                        <div className="text-white text-lg font-medium">{business.name}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Category</div>
                                        <div className="text-white">{business.category}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Address</div>
                                        <div className="text-white">{business.address}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Location</div>
                                        <div className="text-white">{business.locationId?.name || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Coordinates</div>
                                        <div className="text-white">{formatCoordinates(business.coordinates)}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Date Submitted</div>
                                        <div className="text-white">{new Date(business.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="text-sm text-gray-400 mb-1">Description</div>
                                    <div className="bg-gray-700 p-4 rounded-md text-white">{business.description}</div>
                                </div>

                                {business.contactInfo && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-semibold text-white mb-3">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Phone</div>
                                                <div className="text-white">{business.contactInfo.phone || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Email</div>
                                                <div className="text-white">{business.contactInfo.email || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Website</div>
                                                <div className="text-white">{business.contactInfo.website || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {business.operatingHours && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-semibold text-white mb-3">Operating Hours</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                <div key={day}>
                                                    <div className="text-sm text-gray-400 mb-1 capitalize">{day}</div>
                                                    <div className="text-white">{business.operatingHours[day] || 'Closed'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Media/Images */}
                                {business.mediaUrls && business.mediaUrls.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-md font-semibold text-white mb-3">Business Images</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {business.mediaUrls.map((url, index) => (
                                                <div key={index} className="aspect-video rounded-md overflow-hidden">
                                                    <img
                                                        src={url}
                                                        alt={`Business ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Information */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Owner Information</h2>

                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                        <img
                                            src={business.ownerId?.profilePicture || 'https://via.placeholder.com/100'}
                                            alt={business.ownerId?.username}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Username</div>
                                                <div className="text-white">{business.ownerId?.username || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Full Name</div>
                                                <div className="text-white">
                                                    {business.ownerId?.firstName} {business.ownerId?.lastName}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Email</div>
                                                <div className="text-white">{business.ownerId?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Admin Actions</h2>

                                <div className="space-y-4">
                                    {/* Admin Notes */}
                                    <div>
                                        <label htmlFor="adminNotes" className="block text-sm text-gray-400 mb-1">
                                            Admin Notes
                                        </label>
                                        <textarea
                                            id="adminNotes"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={4}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Add notes about this business application..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => setShowConfirmation('approve')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Approve Business
                                        </button>
                                        <button
                                            onClick={() => setShowConfirmation('reject')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Reject Business
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Modals */}
                        {showConfirmation === 'approve' && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Approval</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to approve this business? The business owner will be
                                        notified and the business will be listed on the platform.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowConfirmation(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showConfirmation === 'reject' && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Rejection</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to reject this business? The business owner will be
                                        notified and they will need to reapply to list their business.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowConfirmation(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BusinessDetailsPage;