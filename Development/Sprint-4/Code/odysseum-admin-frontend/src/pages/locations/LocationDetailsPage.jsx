import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { EnvironmentOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const LocationDetailsPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const { 
        fetchLocationDetails, 
        updateLocation, 
        deleteLocation, 
        locations, 
        locationsLoading, 
        locationsError,
        clearCurrentLocation
    } = useAdminStore();

    const location = locations.currentLocation;
    const businessCount = locations.businessCount;
    const postCount = locations.postCount;
    
    const [editMode, setEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchLocationDetails(locationId);

        // Cleanup when component unmounts
        return () => {
            clearCurrentLocation();
        };
    }, [fetchLocationDetails, locationId, clearCurrentLocation]);

    useEffect(() => {
        // Initialize form data when location data is loaded
        if (location) {
            const [lng, lat] = location.coordinates?.coordinates || [0, 0];
            setFormData({
                name: location.name || '',
                description: location.description || '',
                latitude: lat?.toString() || '',
                longitude: lng?.toString() || '',
                imageUrl: location.imageUrl || ''
            });
        }
    }, [location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateCoordinates = () => {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
            setFormError('Latitude and longitude must be valid numbers');
            return false;
        }
        
        if (lat < -90 || lat > 90) {
            setFormError('Latitude must be between -90 and 90');
            return false;
        }
        
        if (lng < -180 || lng > 180) {
            setFormError('Longitude must be between -180 and 180');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Validate form
        if (!formData.name) {
            setFormError('Name is required');
            return;
        }
        
        if (!formData.latitude || !formData.longitude) {
            setFormError('Latitude and longitude are required');
            return;
        }
        
        if (!validateCoordinates()) {
            return;
        }
        
        // Submit form
        const result = await updateLocation(locationId, formData);
        
        if (result.success) {
            setEditMode(false);
        } else {
            setFormError(result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteLocation(locationId);
        
        if (result.success) {
            navigate('/locations');
        } else {
            setFormError(result.error);
            setShowDeleteModal(false);
        }
    };

    const formatCoordinates = (loc) => {
        if (!loc?.coordinates || !loc.coordinates.coordinates) {
            return 'N/A';
        }
        const [lng, lat] = loc.coordinates.coordinates;
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/locations')}
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
                        Back to Locations
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">Location Details</h1>

                {locationsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error</div>
                        <div className="mt-1">{locationsError}</div>
                    </div>
                )}

                {formError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="mt-1">{formError}</div>
                    </div>
                )}

                {locationsLoading && !location ? (
                    <div className="bg-gray-800 rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="ml-4 text-gray-400">Loading location details...</div>
                    </div>
                ) : !location ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                        Location not found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Location Information */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-xl font-semibold text-white flex items-center">
                                        <EnvironmentOutlined className="mr-2 text-purple-500" />
                                        {editMode ? 'Edit Location' : 'Location Information'}
                                    </h2>
                                    
                                    {!editMode && (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                                            >
                                                <EditOutlined className="mr-2" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                                                disabled={businessCount > 0 || postCount > 0}
                                                title={businessCount > 0 || postCount > 0 ? "Cannot delete: has associated businesses or posts" : ""}
                                            >
                                                <DeleteOutlined className="mr-2" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editMode ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                                rows="3"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">
                                                    Latitude *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="latitude"
                                                    value={formData.latitude}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">
                                                    Longitude *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="longitude"
                                                    value={formData.longitude}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Image URL
                                            </label>
                                            <input
                                                type="url"
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setFormError('');
                                                    // Reset form data to original values
                                                    if (location) {
                                                        const [lng, lat] = location.coordinates?.coordinates || [0, 0];
                                                        setFormData({
                                                            name: location.name || '',
                                                            description: location.description || '',
                                                            latitude: lat?.toString() || '',
                                                            longitude: lng?.toString() || '',
                                                            imageUrl: location.imageUrl || ''
                                                        });
                                                    }
                                                }}
                                                className="px-4 py-2 bg-gray-700 text-white rounded-md mr-3"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                                disabled={locationsLoading}
                                            >
                                                {locationsLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Name</div>
                                                <div className="text-white text-lg">{location.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Coordinates</div>
                                                <div className="text-white">{formatCoordinates(location)}</div>
                                            </div>
                                        </div>
                                        
                                        {location.description && (
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Description</div>
                                                <div className="text-white">{location.description}</div>
                                            </div>
                                        )}
                                        
                                        {location.imageUrl && (
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Image</div>
                                                <div className="mt-2 max-w-md">
                                                    <img 
                                                        src={location.imageUrl} 
                                                        alt={location.name} 
                                                        className="rounded-lg w-full h-auto object-cover" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                            <div className="bg-gray-700 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Activity Score</div>
                                                <div className="text-white text-xl mt-1">{location.heatmapScore || 0} <span className="text-sm text-gray-400">/ 100</span></div>
                                            </div>
                                            <div className="bg-gray-700 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Average Rating</div>
                                                <div className="text-white text-xl mt-1">{location.avgRating?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">/ 5.0</span></div>
                                            </div>
                                            <div className="bg-gray-700 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Activity Count</div>
                                                <div className="text-white text-xl mt-1">{location.activityCount || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Associated Entities */}
                        {!editMode && (
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Associated Entities</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <div className="text-lg text-white mb-2">Businesses</div>
                                            <div className="text-3xl text-purple-500 font-bold">{businessCount}</div>
                                            <div className="text-sm text-gray-400 mt-2">
                                                {businessCount === 0 ? (
                                                    'No businesses are associated with this location'
                                                ) : (
                                                    `${businessCount} business${businessCount === 1 ? '' : 'es'} registered at this location`
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <div className="text-lg text-white mb-2">Posts</div>
                                            <div className="text-3xl text-purple-500 font-bold">{postCount}</div>
                                            <div className="text-sm text-gray-400 mt-2">
                                                {postCount === 0 ? (
                                                    'No posts are associated with this location'
                                                ) : (
                                                    `${postCount} post${postCount === 1 ? '' : 's'} tagged with this location`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(businessCount > 0 || postCount > 0) && (
                                        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg flex items-start">
                                            <ExclamationCircleOutlined className="text-yellow-500 mr-3 text-lg flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-yellow-500 font-medium">Note</div>
                                                <div className="text-yellow-400 text-sm">
                                                    This location has associated businesses or posts. 
                                                    To delete this location, you must first delete or reassign all associated entities.
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Location</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete the location "{location.name}"? This action cannot be undone.
                                    </p>
                                    
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Delete
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

export default LocationDetailsPage;