import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';

const PostsPage = () => {
    const { fetchPosts, posts, postsLoading, postsError } = useAdminStore();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        fetchPosts(page, search);
    }, [fetchPosts, page, search]);

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

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper function to truncate text
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-white">Posts Management</h1>

                    <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search posts by caption..."
                            className="w-full md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none"
                        >
                            <SearchOutlined />
                        </button>
                    </form>
                </div>

                {postsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading posts</div>
                        <div className="mt-1">{postsError}</div>
                    </div>
                )}

                {/* Posts Table */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Creator
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Date Posted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Engagement
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {postsLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="mt-2">Loading posts...</div>
                                        </td>
                                    </tr>
                                ) : posts.allPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            No posts found
                                        </td>
                                    </tr>
                                ) : (
                                    posts.allPosts.map((post) => (
                                        <tr key={post._id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {post.mediaUrls && post.mediaUrls.length > 0 ? (
                                                        <div className="w-20 h-20 rounded overflow-hidden mb-2">
                                                            <img
                                                                src={post.mediaUrls[0]}
                                                                alt="Post"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-700 flex items-center justify-center rounded mb-2">
                                                            <FileTextOutlined className="text-lg text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-300">
                                                        {truncateText(post.caption, 80)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            src={post.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                                            alt={post.creatorId?.username}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-white">
                                                            <Link
                                                                to={`/users/${post.creatorId?._id}`}
                                                                className="hover:text-purple-400"
                                                            >
                                                                {post.creatorId?.username || 'Unknown User'}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">
                                                    {post.locationId ? (
                                                        <Link
                                                            to={`/locations/${post.locationId?._id}`}
                                                            className="hover:text-purple-400"
                                                        >
                                                            {post.locationId?.name}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-500">No location</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">
                                                    {formatDate(post.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-300">
                                                    {post.likes ? post.likes.length : 0} likes
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/posts/${post._id}`}
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
                    {posts.totalPosts > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Showing page {page} of{' '}
                                {Math.ceil(posts.totalPosts / 10)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || postsLoading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={
                                        page >= Math.ceil(posts.totalPosts / 10) ||
                                        postsLoading
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

export default PostsPage;