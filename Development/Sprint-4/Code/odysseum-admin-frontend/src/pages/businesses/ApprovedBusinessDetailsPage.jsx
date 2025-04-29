import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { 
    ShopOutlined, 
    EnvironmentOutlined, 
    UserOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    GlobalOutlined,
    CalendarOutlined,
    StarOutlined,
    FireOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

const ApprovedBusinessDetailsPage = () => {
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
            if (status === 'Pending') {
                navigate('/businesses/pending');
            } else if (status === 'Rejected') {
                navigate('/businesses/approved');
            }
        }
    };

    // Format coordinates for display
    const formatCoordinates = (coordinates) => {
        if (!coordinates || !coordinates.coordinates) return 'N/A';
        const [longitude, latitude] = coordinates.coordinates;
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/businesses/approved')}
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
                        Back to Approved Businesses
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">Business Details</h1>

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
                        {/* Business Status Badge */}
                        <div className="flex justify-end">
                            {business.status === 'Approved' ? (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white flex items-center">
                                    <CheckCircleOutlined className="mr-1" />
                                    Approved
                                </span>
                            ) : business.status === 'Pending' ? (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-600 text-white flex items-center">
                                    <ClockCircleOutlined className="mr-1" />
                                    Pending
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white flex items-center">
                                    <StopOutlined className="mr-1" />
                                    Rejected
                                </span>
                            )}
                        </div>

                        {/* Business Overview */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Business Image */}
                                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                                        {business.mediaUrls && business.mediaUrls.length > 0 ? (
                                            <img
                                                src={business.mediaUrls[0]}
                                                alt={business.name}
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gray-700 flex items-center justify-center rounded-lg">
                                                <ShopOutlined className="text-4xl text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Business Summary */}
                                    <div className="w-full md:w-2/3">
                                        <h2 className="text-2xl font-semibold text-white mb-4">{business.name}</h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <ShopOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Category</div>
                                                    <div className="text-white">{business.category}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <EnvironmentOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Location</div>
                                                    <div className="text-white">{business.locationId?.name || 'N/A'}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <UserOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Owner</div>
                                                    <Link 
                                                        to={`/users/${business.ownerId?._id}`}
                                                        className="text-white hover:text-purple-400"
                                                    >
                                                        {business.ownerId?.username || 'Unknown'}
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <CalendarOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Approved On</div>
                                                    <div className="text-white">{formatDate(business.updatedAt)}</div>
                                                </div>
                                            </div>

                                            {business.averageRating !== undefined && (
                                                <div className="flex items-center">
                                                    <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                        <StarOutlined className="text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Average Rating</div>
                                                        <div className="text-white">{business.averageRating.toFixed(1)} / 5.0</div>
                                                    </div>
                                                </div>
                                            )}

                                            {business.heatmapScore !== undefined && (
                                                <div className="flex items-center">
                                                    <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                        <FireOutlined className="text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400">Activity Score</div>
                                                        <div className="text-white">{business.heatmapScore.toFixed(1)} / 100</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-sm text-gray-400 mb-1">Address</div>
                                            <div className="text-white">{business.address}</div>
                                        </div>

                                        {business.description && (
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-400 mb-1">Description</div>
                                                <div className="text-white">{business.description}</div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-3 mt-6">
                                            <button
                                                onClick={() => navigate(`/users/${business.ownerId?._id}`)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                                            >
                                                <UserOutlined className="mr-2" />
                                                View Owner Profile
                                            </button>
                                            <button
                                                onClick={() => navigate(`/locations/${business.locationId?._id}`)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                                            >
                                                <EnvironmentOutlined className="mr-2" />
                                                View Location
                                            </button>
                                            <button
                                                onClick={() => setShowConfirmation('pending')}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                                            >
                                                <StopOutlined className="mr-2" />
                                                Move to Pending
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                                    
                                    <div className="space-y-4">
                                        {business.contactInfo?.phone && (
                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <PhoneOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Phone</div>
                                                    <div className="text-white">{business.contactInfo.phone}</div>
                                                </div>
                                            </div>
                                        )}

                                        {business.contactInfo?.email && (
                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <MailOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Email</div>
                                                    <div className="text-white">{business.contactInfo.email}</div>
                                                </div>
                                            </div>
                                        )}

                                        {business.contactInfo?.website && (
                                            <div className="flex items-center">
                                                <div className="bg-purple-800/30 p-2 rounded-lg mr-3">
                                                    <GlobalOutlined className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-400">Website</div>
                                                    <div className="text-white">
                                                        <a 
                                                            href={business.contactInfo.website} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-purple-400 hover:text-purple-300"
                                                        >
                                                            {business.contactInfo.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(!business.contactInfo?.phone && !business.contactInfo?.email && !business.contactInfo?.website) && (
                                            <div className="text-gray-400 text-center py-2">
                                                No contact information provided
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Location Details</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Location Name</div>
                                            <div className="text-white">{business.locationId?.name || 'N/A'}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Coordinates</div>
                                            <div className="text-white">{formatCoordinates(business.coordinates)}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Address</div>
                                            <div className="text-white">{business.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operating Hours */}
                        {business.operatingHours && (
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Operating Hours</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                            <div key={day} className="bg-gray-700 p-3 rounded-lg">
                                                <div className="text-sm font-medium text-gray-300 capitalize mb-1">{day}</div>
                                                <div className="text-white">{business.operatingHours[day] || 'Closed'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Images */}
                        {business.mediaUrls && business.mediaUrls.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Business Images</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {business.mediaUrls.map((url, index) => (
                                            <div key={index} className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                                                <img 
                                                    src={url} 
                                                    alt={`Business ${index+1}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Notes */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Admin Actions</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-400 mb-2">
                                            Admin Notes
                                        </label>
                                        <textarea
                                            id="adminNotes"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this business..."
                                            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setShowConfirmation('pending')}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center"
                                        >
                                            <StopOutlined className="mr-2" />
                                            Move to Pending
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Modal */}
                        {showConfirmation === 'pending' && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Status Change</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to move this business back to pending status? It will be removed from the approved list and will require approval again.
                                    </p>
                                    
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowConfirmation(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Pending')}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center"
                                        >
                                            <StopOutlined className="mr-2" />
                                            Move to Pending
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

export default ApprovedBusinessDetailsPage;