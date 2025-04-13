import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import useAdminStore from '../../store/adminStore';
import { FileTextOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const PostDetailsPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { 
        fetchPostDetails, 
        deletePost, 
        deleteComment, 
        posts, 
        postsLoading, 
        postsError,
        clearCurrentPost
    } = useAdminStore();

    const post = posts.currentPost;
    const comments = posts.postComments;
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        fetchPostDetails(postId);

        // Cleanup when component unmounts
        return () => {
            clearCurrentPost();
        };
    }, [fetchPostDetails, postId, clearCurrentPost]);

    const handleDeletePost = async () => {
        const result = await deletePost(postId);
        
        if (result.success) {
            navigate('/posts');
        } else {
            console.error('Error deleting post:', result.error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const result = await deleteComment(commentId);
        
        if (result.success) {
            setCommentToDelete(null);
        } else {
            console.error('Error deleting comment:', result.error);
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
                        onClick={() => navigate('/posts')}
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
                        Back to Posts
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">Post Details</h1>

                {postsError && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-6 border border-red-800">
                        <div className="font-medium">Error</div>
                        <div className="mt-1">{postsError}</div>
                    </div>
                )}

                {postsLoading && !post ? (
                    <div className="bg-gray-800 rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="ml-4 text-gray-400">Loading post details...</div>
                    </div>
                ) : !post ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                        Post not found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Post Information */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-xl font-semibold text-white flex items-center">
                                        <FileTextOutlined className="mr-2 text-purple-500" />
                                        Post Information
                                    </h2>
                                    
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                                    >
                                        <DeleteOutlined className="mr-2" />
                                        Delete Post
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
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
                                            <div className="text-sm text-gray-400">
                                                {formatDate(post.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {post.locationId && (
                                        <div className="mb-4 text-sm text-gray-400">
                                            Location: {' '}
                                            <Link 
                                                to={`/locations/${post.locationId._id}`}
                                                className="text-purple-400 hover:text-purple-300"
                                            >
                                                {post.locationId.name}
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {post.caption && (
                                    <div className="mb-6">
                                        <div className="text-white whitespace-pre-wrap">{post.caption}</div>
                                    </div>
                                )}

                                {post.mediaUrls && post.mediaUrls.length > 0 && (
                                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {post.mediaUrls.map((url, index) => (
                                            <div key={index} className="rounded-lg overflow-hidden">
                                                <img
                                                    src={url}
                                                    alt={`Post media ${index + 1}`}
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <div>
                                        <span className="font-semibold text-white">{post.likes?.length || 0}</span> likes
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Comments ({comments.length})
                                </h2>
                                
                                {comments.length === 0 ? (
                                    <div className="text-center text-gray-400 py-6">
                                        No comments on this post
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {comments.map((comment) => (
                                            <div key={comment._id} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0">
                                                            <img
                                                                className="h-8 w-8 rounded-full object-cover"
                                                                src={comment.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                                                alt={comment.creatorId?.username}
                                                            />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-white">
                                                                <Link
                                                                    to={`/users/${comment.creatorId?._id}`}
                                                                    className="hover:text-purple-400"
                                                                >
                                                                    {comment.creatorId?.username || 'Unknown User'}
                                                                </Link>
                                                                {comment.owner && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-purple-600 text-xs rounded-full">Author</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {formatDate(comment.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setCommentToDelete(comment._id)}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                
                                                <div className="text-white mt-2">{comment.text}</div>
                                                
                                                {/* Comment Replies */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-4 space-y-3 pl-6 border-l-2 border-gray-600">
                                                        {comment.replies.map((reply) => (
                                                            <div key={reply._id} className="bg-gray-600/50 rounded-lg p-3">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center">
                                                                        <div className="h-6 w-6 flex-shrink-0">
                                                                            <img
                                                                                className="h-6 w-6 rounded-full object-cover"
                                                                                src={reply.creatorId?.profilePicture || 'https://via.placeholder.com/40'}
                                                                                alt={reply.creatorId?.username}
                                                                            />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            <div className="text-sm font-medium text-white">
                                                                                <Link
                                                                                    to={`/users/${reply.creatorId?._id}`}
                                                                                    className="hover:text-purple-400"
                                                                                >
                                                                                    {reply.creatorId?.username || 'Unknown User'}
                                                                                </Link>
                                                                                {reply.owner && (
                                                                                    <span className="ml-2 px-2 py-0.5 bg-purple-600 text-xs rounded-full">Author</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400">
                                                                                {formatDate(reply.createdAt)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setCommentToDelete(reply._id)}
                                                                        className="text-red-500 hover:text-red-400"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="text-white mt-1">{reply.text}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delete Post Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Post</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete this post? This action will permanently remove the post and all its comments and cannot be undone.
                                    </p>
                                    
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeletePost}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Comment Confirmation Modal */}
                        {commentToDelete && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Comment</h3>
                                    <p className="text-gray-300 mb-4">
                                        Are you sure you want to delete this comment? This action cannot be undone.
                                    </p>
                                    
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setCommentToDelete(null)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(commentToDelete)}
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

export default PostDetailsPage;