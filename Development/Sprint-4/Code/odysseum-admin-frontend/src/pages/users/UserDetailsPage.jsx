import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';

const UserDetailsPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [postsPage, setPostsPage] = useState(1);
    const [commentsPage, setCommentsPage] = useState(1);
    const [banReason, setBanReason] = useState('');
    const [showBanModal, setShowBanModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [showDeletePostModal, setShowDeletePostModal] = useState(null);
    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(null);

    const {
        fetchUserDetails,
        banUser,
        updateUserRole,
        deleteUserPost,
        deleteUserComment,
        users,
        usersLoading,
        usersError,
        clearCurrentUser
    } = useAdminStore();

    const user = users.currentUser;
    const posts = users.userPosts;
    const comments = users.userComments;

    useEffect(() => {
        fetchUserDetails(userId, postsPage, commentsPage);

        // Cleanup when component unmounts
        return () => {
            clearCurrentUser();
        };
    }, [fetchUserDetails, userId, postsPage, commentsPage, clearCurrentUser]);

    const handleBanUser = async () => {
        const success = await banUser(userId, !user.isDeactivated, banReason);
        if (success) {
            setShowBanModal(false);
            setBanReason('');
        }
    };

    const handleRoleUpdate = async () => {
        if (!selectedRole) return;

        const success = await updateUserRole(userId, selectedRole);
        if (success) {
            setShowRoleModal(false);
            setSelectedRole('');
        }
    };

    const handleDeletePost = async (postId) => {
        const success = await deleteUserPost(postId);
        if (success) {
            setShowDeletePostModal(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const success = await deleteUserComment(commentId);
        if (success) {
            setShowDeleteCommentModal(null);
        }
    };

    const handlePostsPageChange = (newPage) => {
        if (newPage > 0) {
            setPostsPage(newPage);
        }
    };

    const handleCommentsPageChange = (newPage) => {
        if (newPage > 0) {
            setCommentsPage(newPage);
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/users')}
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
                        Back to Users
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">User Details</h1>

                {usersError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error loading user details</div>
                        <div className="mt-1">{usersError}</div>
                    </div>
                )}

                {usersLoading && !user ? (
                    <div className="bg-gray-800 rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="ml-4 text-gray-400">Loading user details...</div>
                    </div>
                ) : !user ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                        User not found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* User Profile */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                                        <img
                                            src={user.profilePicture || 'https://via.placeholder.com/150'}
                                            alt={user.username}
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h2 className="text-xl font-semibold text-white mb-2">{user.username}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-sm text-gray-400">Full Name</div>
                                                <div className="text-white">{user.firstName} {user.lastName}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Email</div>
                                                <div className="text-white">{user.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Role</div>
                                                <div className="text-white capitalize">{user.role}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Status</div>
                                                <div className="text-white">
                                                    {user.isDeactivated ? (
                                                        <span className="text-red-500">Banned</span>
                                                    ) : (
                                                        <span className="text-green-500">Active</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {user.bio && (
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-400">Bio</div>
                                                <div className="text-white">{user.bio}</div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowBanModal(true);
                                                    setBanReason('');
                                                }}
                                                className={`px-4 py-2 rounded-md text-white ${user.isDeactivated
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-red-600 hover:bg-red-700'
                                                    }`}
                                                disabled={user.role === 'admin' && user._id !== userId}
                                            >
                                                {user.isDeactivated ? 'Unban User' : 'Ban User'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowRoleModal(true);
                                                    setSelectedRole(user.role);
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                            >
                                                Change Role
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Posts */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">User Posts</h2>

                                {posts.length === 0 ? (
                                    <div className="text-center p-4 text-gray-400">
                                        This user has not created any posts yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <div key={post._id} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-sm text-gray-400">
                                                            {formatDate(post.createdAt)}
                                                        </div>
                                                        {post.locationId && (
                                                            <div className="text-sm text-gray-400">
                                                                Location: {post.locationId.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setShowDeletePostModal(post._id)}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        Delete Post
                                                    </button>
                                                </div>

                                                {/* Make the post content clickable */}
                                                <Link to={`/posts/${post._id}`} className="block hover:bg-gray-600 px-3 py-2 rounded-md transition-colors">
                                                    <div className="text-white">{post.caption}</div>

                                                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {post.mediaUrls.map((url, index) => (
                                                                <div key={index} className="aspect-video rounded overflow-hidden">
                                                                    <img
                                                                        src={url}
                                                                        alt={`Post media ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="mt-3 text-sm text-gray-400">
                                                    <span>{post.likes ? post.likes.length : 0} likes</span>
                                                    <Link 
                                                        to={`/posts/${post._id}`}
                                                        className="float-right text-purple-400 hover:text-purple-300"
                                                    >
                                                        View Post Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination for Posts */}
                                        {users.totalUserPosts > 0 && (
                                            <div className="flex items-center justify-between pt-4">
                                                <div className="text-sm text-gray-400">
                                                    Page {postsPage} of {Math.ceil(users.totalUserPosts / 10)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handlePostsPageChange(postsPage - 1)}
                                                        disabled={postsPage === 1 || usersLoading}
                                                        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => handlePostsPageChange(postsPage + 1)}
                                                        disabled={
                                                            postsPage >= Math.ceil(users.totalUserPosts / 10) ||
                                                            usersLoading
                                                        }
                                                        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Comments */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">User Comments</h2>

                                {comments.length === 0 ? (
                                    <div className="text-center p-4 text-gray-400">
                                        This user has not made any comments yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-sm text-gray-400">
                                                        {formatDate(comment.createdAt)}
                                                    </div>
                                                    <button
                                                        onClick={() => setShowDeleteCommentModal(comment._id)}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        Delete Comment
                                                    </button>
                                                </div>

                                                <div className="text-white">{comment.text}</div>

                                                <div className="mt-2 text-sm text-gray-400">
                                                    {comment.isReply ? 'Reply comment' : 'Top-level comment'}
                                                    {comment.postId && (
                                                        <span className="flex flex-wrap items-center mt-1">
                                                            <span>on post: </span>
                                                            <Link 
                                                                to={`/posts/${comment.postId._id}`}
                                                                className="text-purple-400 hover:text-purple-300 ml-1"
                                                            >
                                                                {comment.postId.caption?.substring(0, 50)}...
                                                            </Link>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination for Comments */}
                                        {users.totalUserComments > 0 && (
                                            <div className="flex items-center justify-between pt-4">
                                                <div className="text-sm text-gray-400">
                                                    Page {commentsPage} of {Math.ceil(users.totalUserComments / 10)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleCommentsPageChange(commentsPage - 1)}
                                                        disabled={commentsPage === 1 || usersLoading}
                                                        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => handleCommentsPageChange(commentsPage + 1)}
                                                        disabled={
                                                            commentsPage >= Math.ceil(users.totalUserComments / 10) ||
                                                            usersLoading
                                                        }
                                                        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ban User Modal */}
                        {showBanModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        {user.isDeactivated ? 'Unban User' : 'Ban User'}
                                    </h3>
                                    {!user.isDeactivated && (
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Reason for Ban
                                            </label>
                                            <textarea
                                                value={banReason}
                                                onChange={(e) => setBanReason(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowBanModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBanUser}
                                            className={`${user.isDeactivated
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                                } text-white px-4 py-2 rounded-md`}
                                        >
                                            {user.isDeactivated ? 'Confirm Unban' : 'Confirm Ban'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Change Role Modal */}
                        {showRoleModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Change User Role</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Select Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="businessOwner">Business Owner</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowRoleModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRoleUpdate}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Update Role
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Post Confirmation Modal */}
                        {showDeletePostModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Post</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete this post? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowDeletePostModal(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(showDeletePostModal)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Comment Confirmation Modal */}
                        {showDeleteCommentModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Comment</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete this comment? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowDeleteCommentModal(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(showDeleteCommentModal)}
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

export default UserDetailsPage;