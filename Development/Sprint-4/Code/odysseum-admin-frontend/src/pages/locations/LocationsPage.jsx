import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { EnvironmentOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const LocationsPage = () => {
    const { fetchLocations, locations, locationsLoading, locationsError, createLocation } = useAdminStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // New location form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        imageUrl: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchLocations(page, search);
    }, [fetchLocations, page, search]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLocation({ ...newLocation, [name]: value });
    };

    const validateCoordinates = () => {
        const lat = parseFloat(newLocation.latitude);
        const lng = parseFloat(newLocation.longitude);

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
        if (!newLocation.name) {
            setFormError('Name is required');
            return;
        }

        if (!newLocation.latitude || !newLocation.longitude) {
            setFormError('Latitude and longitude are required');
            return;
        }

        if (!validateCoordinates()) {
            return;
        }

        // Submit form
        const result = await createLocation(newLocation);

        if (result.success) {
            // Reset form and hide it
            setNewLocation({
                name: '',
                description: '',
                latitude: '',
                longitude: '',
                imageUrl: ''
            });
            setShowAddForm(false);
        } else {
            setFormError(result.error);
        }
    };

    const formatCoordinates = (location) => {
        if (!location.coordinates || !location.coordinates.coordinates) {
            return 'N/A';
        }
        const [lng, lat] = location.coordinates.coordinates;
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-white">Locations Management</h1>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="flex flex-1">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search locations..."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                            >
                                <SearchOutlined />
                            </button>
                        </form>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                            <PlusOutlined className="mr-2" />
                            Add Location
                        </button>
                    </div>
                </div>

                {locationsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading locations</div>
                        <div className="mt-1">{locationsError}</div>
                    </div>
                )}

                {/* Add Location Form */}
                {showAddForm && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Add New Location</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="bg-red-900/30 text-red-400 p-3 rounded mb-4 border border-red-800">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newLocation.name}
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
                                    value={newLocation.description}
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
                                        value={newLocation.latitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 40.7128"
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
                                        value={newLocation.longitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. -74.0060"
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
                                    value={newLocation.imageUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                    disabled={locationsLoading}
                                >
                                    {locationsLoading ? 'Adding...' : 'Add Location'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Locations Table */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Coordinates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {locationsLoading && !showAddForm ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading locations...</div>
                                        </td>
                                    </tr>
                                ) : locations.allLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                                            No locations found
                                        </td>
                                    </tr>
                                ) : (
                                    locations.allLocations.map((location) => (
                                        <tr key={location._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <EnvironmentOutlined className="text-purple-500 mr-2" />
                                                    <div className="text-white font-medium">{location.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">
                                                    {formatCoordinates(location)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300 line-clamp-2">
                                                    {location.description || 'No description available'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">
                                                    Score: {location.heatmapScore || 0}/100
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    Rating: {location.avgRating?.toFixed(1) || '0.0'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/locations/${location._id}`}
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
                    {locations.totalLocations > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(locations.totalLocations / 10)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || locationsLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(locations.totalLocations / 10) ||
                                        locationsLoading
                                    }
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || locationsLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(locations.totalLocations / 10) ||
                                        locationsLoading
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

export default LocationsPage;